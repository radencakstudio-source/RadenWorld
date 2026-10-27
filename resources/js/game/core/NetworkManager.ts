/**
 * ============================================================================
 * FILE: resources/js/game/core/NetworkManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Kelas OOP Singleton pengelola seluruh komunikasi jaringan WebSocket secara real-time
 * antara klien game di browser dengan WebSocket game server (Node.js/Socket.io).
 * 
 * POLA DESAIN:
 * - Singleton Pattern: Menjamin hanya ada 1 instansi koneksi socket di seluruh aplikasi.
 * - Event-Driven: Menerima dan memancarkan event paket sinkronisasi pemain dan dunia.
 * 
 * DAFTAR EVENT JARINGAN:
 * - 'player:join': Meminta spawn pemain baru ke server
 * - 'world:init': Menerima data pemain & monster yang sudah online terlebih dahulu
 * - 'player:joined': Menerima pemberitahuan pemain lain baru saja masuk
 * - 'player:move': Mengirim & menerima koordinat posisi pergerakan
 * - 'player:left': Menerima pemberitahuan pemain lain disconnect
 * - 'chat:message' / 'chat:broadcast': Mengirim & menerima pesan obrolan global
 * - 'monsters:sync': Menerima pembaruan koordinat monster berkeliaran
 * ============================================================================
 */

import { io, Socket } from 'socket.io-client';
import { IPlayerData, IMonsterData, IChatMessage, IWorldInitData, Direction, IAvatarCustomization } from '../types';
import { EventBus } from './EventBus';

export class NetworkManager {
  /** Instansi tunggal Singleton */
  private static instance: NetworkManager;

  /** Objek socket client Socket.io */
  private socket: Socket | null = null;

  /** Status koneksi aktif */
  private isConnected: boolean = false;

  /** URL alamat WebSocket server */
  private serverUrl: string = 'http://localhost:3001';

  /** Data pemain terakhir yang bergabung untuk auto-rejoin saat reconnect */
  private lastJoinData: {
    name: string;
    avatar: IAvatarCustomization;
    role?: string;
    isSuperAdmin?: boolean;
    x?: number;
    y?: number;
    direction?: Direction;
    gold?: number;
    diamonds?: number;
    room?: string;
  } | null = null;

  /** Penyimpan callback terdaftar agar tidak hilang saat reconnect / connect tertunda */
  private listeners: {
    worldInit: ((data: IWorldInitData) => void)[];
    playerJoined: ((player: IPlayerData) => void)[];
    playerMoved: ((data: { id: string; x: number; y: number; direction: Direction; isMoving: boolean }) => void)[];
    playerLeft: ((data: { id: string; name: string }) => void)[];
    chatBroadcast: ((data: IChatMessage) => void)[];
    playerExpression: ((data: { id: string; type: 'normal' | 'smile' | 'shock' | 'angry' }) => void)[];
    voiceStream: ((data: { senderId: string; senderName: string; x: number; y: number; audio: ArrayBuffer }) => void)[];
    voiceSpeaking: ((data: { senderId: string; isSpeaking: boolean }) => void)[];
    playerAfk: ((data: { id: string; isAfk: boolean; durationSeconds: number }) => void)[];
    friendRequest: ((data: any) => void)[];
    friendResponse: ((data: any) => void)[];
    playerJumped: ((data: { id: string; jumpCount: number; x: number; y: number }) => void)[];
    playerFishing: ((data: { id: string; state: string; bobberPos?: { x: number; y: number }; targetBobberPos?: { x: number; y: number }; direction?: Direction }) => void)[];
    playerFollowedBy: ((data: any) => void)[];
    playerUnfollowedBy: ((data: any) => void)[];
  } = {
    worldInit: [],
    playerJoined: [],
    playerMoved: [],
    playerLeft: [],
    chatBroadcast: [],
    playerExpression: [],
    voiceStream: [],
    voiceSpeaking: [],
    playerAfk: [],
    friendRequest: [],
    friendResponse: [],
    playerJumped: [],
    playerFishing: [],
    playerFollowedBy: [],
    playerUnfollowedBy: [],
  };

  /** Konstruktor privat untuk mencegah pembuatan instansi ganda (Singleton) */
  private constructor() {}

  /**
   * Mengambil instansi tunggal NetworkManager
   */
  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
      if (typeof window !== 'undefined') {
        const isCurrentLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        if (isCurrentLocal) {
          try {
            const saved = localStorage.getItem('raden_server_host');
            if (saved && (saved.includes('ngrok') || saved.includes('trycloudflare') || saved.includes('localtunnel') || saved.includes('pinggy'))) {
              localStorage.removeItem('raden_server_host');
            }
          } catch (e) {}
        }
      }
    }
    return NetworkManager.instance;
  }

  /**
   * Mengambil host server yang efektif (dari localStorage 'raden_server_host' atau otomatis hostname browser)
   */
  public static getEffectiveServerHost(): string {
    if (typeof window === 'undefined') return '127.0.0.1';
    try {
      const savedHost = localStorage.getItem('raden_server_host')?.trim();
      if (savedHost) {
        const isCurrentLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        if (isCurrentLocal && (savedHost.includes('ngrok') || savedHost.includes('trycloudflare') || savedHost.includes('localtunnel'))) {
          localStorage.removeItem('raden_server_host');
          return '127.0.0.1';
        }
        return savedHost;
      }
    } catch (e) {}
    const h = window.location.hostname;
    // Pada Windows, gunakan '127.0.0.1' untuk 'localhost' agar terhubung langsung via IPv4 tanpa issue resolusi ::1
    if (!h || h === 'localhost') return '127.0.0.1';
    return h;
  }

  /**
   * Mengambil URL server Socket.io yang efektif
   */
  public static getEffectiveServerUrl(): string {
    if (typeof window !== 'undefined') {
      const isCurrentLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
      if (isCurrentLocal) {
        return 'http://127.0.0.1:3001';
      }

      const isHttps = window.location.protocol === 'https:';
      const isTunnel = window.location.hostname.includes('ngrok') ||
                       window.location.hostname.includes('trycloudflare') ||
                       window.location.hostname.includes('localtunnel') ||
                       window.location.hostname.includes('pinggy');

      // Jika diakses via HTTPS atau domain tunnel publik (ngrok dll), gunakan origin
      if (isHttps || isTunnel) {
        return window.location.origin;
      }
    }

    let host = NetworkManager.getEffectiveServerHost();
    if (!host) {
      host = (typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1') || '127.0.0.1';
    }

    // Jika host sudah memiliki protokol http:// atau https://
    if (host.startsWith('http://') || host.startsWith('https://')) {
      return host;
    }

    // Jika host sudah mencantumkan port (misal 192.168.1.10:3002)
    if (host.includes(':')) {
      return `http://${host}`;
    }

    // Default: port 3001
    return `http://${host}:3001`;
  }

  /**
   * Membuka koneksi WebSocket ke server game
   * @param url Alamat server Socket.io (opsional, default dinamis mengikuti IP/Host browser)
   */
  public connect(url?: string): void {
    if (this.socket && this.socket.connected) return;

    if (!url) {
      this.serverUrl = NetworkManager.getEffectiveServerUrl();
    } else {
      this.serverUrl = url;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'ngrok-skip-browser-warning': '1',
      },
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    let hasLoggedOffline = false;

    this.socket.on('connect', () => {
      this.isConnected = true;
      hasLoggedOffline = false;
      console.log(`[NetworkManager] Terhubung ke multiplayer game server: ${this.serverUrl}`);
      EventBus.emit('network-status-changed', { isConnected: true, serverUrl: this.serverUrl });

      // Pasang kembali seluruh callback ke socket baru
      this.bindSocketListeners();

      // Auto-rejoin jika sebelumnya sudah pernah join (misal saat tab/app switch dan reconnect)
      if (this.lastJoinData) {
        this.joinGame(
          this.lastJoinData.name,
          this.lastJoinData.avatar,
          this.lastJoinData.role,
          this.lastJoinData.isSuperAdmin,
          this.lastJoinData.x,
          this.lastJoinData.y,
          this.lastJoinData.direction,
          this.lastJoinData.gold,
          this.lastJoinData.diamonds,
          this.lastJoinData.room || 'world'
        );
        if (typeof this.lastJoinData.x === 'number' && typeof this.lastJoinData.y === 'number') {
          this.sendMovement(
            this.lastJoinData.x,
            this.lastJoinData.y,
            this.lastJoinData.direction || 'down',
            false
          );
        }
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[NetworkManager] Terputus dari server game.');
      EventBus.emit('network-status-changed', { isConnected: false, serverUrl: this.serverUrl });
    });

    this.socket.on('connect_error', (err) => {
      this.isConnected = false;
      if (!hasLoggedOffline) {
        hasLoggedOffline = true;
        console.warn('[NetworkManager] Multiplayer server offline (mode lokal aktif):', err.message);
      }
      EventBus.emit('network-status-changed', { isConnected: false, serverUrl: this.serverUrl, error: err.message });

      // Jika koneksi ke serverUrl gagal dan serverUrl bukan 127.0.0.1:3001, coba fallback ke server lokal 127.0.0.1:3001
      if (this.serverUrl !== 'http://127.0.0.1:3001' && typeof window !== 'undefined') {
        const isCurrentLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        if (isCurrentLocal) {
          console.log('[NetworkManager] Mengalihkan koneksi ke server game lokal 127.0.0.1:3001...');
          try { localStorage.removeItem('raden_server_host'); } catch (e) {}
          this.socket?.disconnect();
          this.serverUrl = 'http://127.0.0.1:3001';
          this.connect('http://127.0.0.1:3001');
        }
      }
    });

    this.bindSocketListeners();
  }

  /** Mengambil URL WebSocket server saat ini */
  public getServerUrl(): string {
    return this.serverUrl;
  }

  /** Mengambil status koneksi WebSocket saat ini */
  public getIsConnected(): boolean {
    return Boolean(this.socket && this.socket.connected && this.isConnected);
  }

  /**
   * Mengukur round-trip latency ke server (dalam ms)
   * Mengutamakan WebSocket ping jika terhubung, atau fallback ke HTTP endpoint /api/ping
   */
  public async measureLatency(targetUrl?: string): Promise<number> {
    const start = performance.now();

    // 1. Jika terhubung via WebSocket dan tidak menguji URL eksternal kustom
    if (!targetUrl && this.socket && this.socket.connected) {
      try {
        const pingPromise = new Promise<number>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('WS ping timeout')), 2500);
          const t0 = performance.now();
          this.socket.emit('app:ping', t0, () => {
            clearTimeout(timeout);
            resolve(Math.max(1, Math.round(performance.now() - t0)));
          });
        });
        return await pingPromise;
      } catch (e) {
        // Fallback ke HTTP ping jika WS ping timeout
      }
    }

    // 2. HTTP ping ke /api/ping
    try {
      const baseUrl = targetUrl || this.getServerUrl() || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3001');
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const pingUrl = `${cleanBase}/api/ping?t=${Date.now()}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const httpStart = performance.now();
      const res = await fetch(pingUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return Math.max(1, Math.round(performance.now() - httpStart));
      }
      return Math.max(5, Math.round(performance.now() - httpStart));
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      return this.isConnected ? Math.max(5, Math.min(40, elapsed)) : 999;
    }
  }

  /**
   * Mengatur Host/IP server kustom (disimpan di localStorage) lalu menghubungkan ulang
   */
  public setCustomHost(host: string): void {
    try {
      const trimmed = host ? host.trim() : '';
      if (trimmed) {
        localStorage.setItem('raden_server_host', trimmed);
      } else {
        localStorage.removeItem('raden_server_host');
      }
    } catch (e) {}
    this.reconnect();
  }

  /**
   * Menghubungkan ulang socket dengan server URL terbaru
   */
  public reconnect(customUrl?: string): void {
    this.disconnect();
    this.connect(customUrl);
  }

  /** Daftar pemain aktif di server saat ini */
  private serverPlayers: Map<string, IPlayerData> = new Map();

  public getServerPlayers(): IPlayerData[] {
    return Array.from(this.serverPlayers.values());
  }

  private emitServerPlayersUpdated(): void {
    const list = Array.from(this.serverPlayers.values());
    EventBus.emit('server-players-updated', list);
    EventBus.emit('player-count-updated', Math.max(1, list.length));
  }

  private bindSocketListeners(): void {
    if (!this.socket) return;

    // Bersihkan listener sebelumnya agar tidak double
    this.socket.off('world:init');
    this.socket.off('room:players');
    this.socket.off('player:joined');
    this.socket.off('player:moved');
    this.socket.off('player:left');
    this.socket.off('chat:broadcast');
    this.socket.off('player:expression');
    this.socket.off('voice:stream');
    this.socket.off('voice:speaking');
    this.socket.off('player:afk');
    this.socket.off('friend:request_received');
    this.socket.off('friend:response_result');
    this.socket.off('player:jumped');
    this.socket.off('player:fishing');
    this.socket.off('player:followed_by');
    this.socket.off('player:unfollowed_by');

    this.socket.on('player:jumped', (data: { id: string; jumpCount: number; x: number; y: number }) => {
      this.listeners.playerJumped.forEach((cb) => cb(data));
    });

    this.socket.on('player:fishing', (data: { id: string; state: string; bobberPos?: { x: number; y: number }; targetBobberPos?: { x: number; y: number }; direction?: Direction }) => {
      this.listeners.playerFishing.forEach((cb) => cb(data));
    });

    this.socket.on('player:followed_by', (data: any) => {
      console.log('[NetworkManager] Diterima player:followed_by:', data);
      EventBus.emit('player-followed-by', data);
      this.listeners.playerFollowedBy.forEach((cb) => cb(data));
    });

    this.socket.on('player:unfollowed_by', (data: any) => {
      console.log('[NetworkManager] Diterima player:unfollowed_by:', data);
      EventBus.emit('player-unfollowed-by', data);
      this.listeners.playerUnfollowedBy.forEach((cb) => cb(data));
    });

    this.socket.on('world:init', (data: IWorldInitData) => {
      this.serverPlayers.clear();
      if (data.selfPlayer) {
        this.serverPlayers.set(data.selfPlayer.id, data.selfPlayer);
      }
      if (Array.isArray(data.players)) {
        data.players.forEach((p) => this.serverPlayers.set(p.id, p));
      }
      this.emitServerPlayersUpdated();
      this.listeners.worldInit.forEach((cb) => cb(data));
    });

    this.socket.on('room:players', (data: { room: string; players: IPlayerData[] }) => {
      const myId = this.getSocketId();
      const me = myId ? this.serverPlayers.get(myId) : null;
      this.serverPlayers.clear();
      if (me) this.serverPlayers.set(me.id, me);
      if (Array.isArray(data.players)) {
        data.players.forEach((p) => this.serverPlayers.set(p.id, p));
      }
      this.emitServerPlayersUpdated();
      this.listeners.worldInit.forEach((cb) => cb({
        selfId: this.getSocketId() || '',
        selfPlayer: null as any,
        players: data.players,
        monsters: [],
        worldBounds: { width: 9600, height: 9600 },
      }));
    });

    this.socket.on('player:joined', (player: IPlayerData) => {
      this.serverPlayers.set(player.id, player);
      this.emitServerPlayersUpdated();
      this.listeners.playerJoined.forEach((cb) => cb(player));
    });

    this.socket.on('player:updated', (data: { id: string; name?: string; avatar?: IAvatarCustomization; role?: string; isSuperAdmin?: boolean }) => {
      const existing = this.serverPlayers.get(data.id);
      if (existing) {
        if (data.name) existing.name = data.name;
        if (data.avatar) existing.avatar = data.avatar;
        if (data.role) existing.role = data.role;
        if (typeof data.isSuperAdmin === 'boolean') existing.isSuperAdmin = data.isSuperAdmin;
        this.emitServerPlayersUpdated();
      }
      EventBus.emit('remote-player-updated', data);
    });

    this.socket.on('player:moved', (data) => {
      this.listeners.playerMoved.forEach((cb) => cb(data));
    });

    this.socket.on('player:left', (data) => {
      this.serverPlayers.delete(data.id);
      this.emitServerPlayersUpdated();
      this.listeners.playerLeft.forEach((cb) => cb(data));
    });

    this.socket.on('chat:broadcast', (data: IChatMessage) => {
      this.listeners.chatBroadcast.forEach((cb) => cb(data));
    });

    this.socket.on('player:expression', (data: { id: string; type: 'normal' | 'smile' | 'shock' | 'angry' }) => {
      this.listeners.playerExpression.forEach((cb) => cb(data));
    });

    this.socket.on('voice:stream', (data: { senderId: string; senderName: string; x: number; y: number; audio: ArrayBuffer }) => {
      this.listeners.voiceStream.forEach((cb) => cb(data));
    });

    this.socket.on('voice:speaking', (data: { senderId: string; isSpeaking: boolean }) => {
      this.listeners.voiceSpeaking.forEach((cb) => cb(data));
    });

    this.socket.on('player:afk', (data: { id: string; isAfk: boolean; durationSeconds: number }) => {
      this.listeners.playerAfk.forEach((cb) => cb(data));
    });

    this.socket.on('friend:request_received', (data: any) => {
      console.log('[NetworkManager] Diterima friend:request_received:', data);
      EventBus.emit('incoming-friend-request', data);
      this.listeners.friendRequest.forEach((cb) => cb(data));
    });

    this.socket.on('friend:response_result', (data: any) => {
      console.log('[NetworkManager] Diterima friend:response_result:', data);
      EventBus.emit('friend-response-result', data);
      this.listeners.friendResponse.forEach((cb) => cb(data));
    });
  }

  /** Mengecek apakah koneksi socket sedang aktif */
  public getConnected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  /** Mengambil Socket ID pemain */
  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Berpindah antar-room/area (World, Gedung SD, SMP, SMA, Rumah, Admin Portal)
   */
  public switchRoom(room: string, x?: number, y?: number, direction?: Direction): void {
    if (this.lastJoinData) {
      this.lastJoinData.room = room;
      if (typeof x === 'number') this.lastJoinData.x = x;
      if (typeof y === 'number') this.lastJoinData.y = y;
      if (direction) this.lastJoinData.direction = direction;
    }
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:switch_room', { room, x, y, direction });
  }

  /**
   * Meminta daftar pemain yang aktif di room saat ini
   */
  public requestRoomPlayers(): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('room:request_players');
  }

  public joinGame(
    name: string,
    avatar: IAvatarCustomization,
    role?: string,
    isSuperAdmin?: boolean,
    x?: number,
    y?: number,
    direction?: Direction,
    gold?: number,
    diamonds?: number,
    room: string = 'world'
  ): void {
    this.lastJoinData = { name, avatar, role, isSuperAdmin, x, y, direction, gold, diamonds, room };
    const isSuper = isSuperAdmin || role === 'super_admin' || name.toUpperCase() === 'RADEN';

    const myId = this.getSocketId() || 'local-me';
    this.serverPlayers.set(myId, {
      id: myId,
      name,
      avatar,
      x: typeof x === 'number' && !isNaN(x) ? x : 4800,
      y: typeof y === 'number' && !isNaN(y) ? y : 4860,
      direction: direction || 'down',
      isMoving: false,
      hp: 100,
      maxHp: 100,
      level: 1,
      role: isSuper ? 'super_admin' : (role || 'player'),
      isSuperAdmin: isSuper,
      gold: typeof gold === 'number' ? gold : (isSuper ? 999999 : 2500),
      diamonds: typeof diamonds === 'number' ? diamonds : (isSuper ? 99999 : 50),
    });
    this.emitServerPlayersUpdated();

    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:join', {
      name,
      avatar,
      room,
      role: isSuper ? 'super_admin' : (role || 'player'),
      isSuperAdmin: isSuper,
      x: typeof x === 'number' && !isNaN(x) ? x : 4800,
      y: typeof y === 'number' && !isNaN(y) ? y : 4860,
      direction: direction || 'down',
      gold: typeof gold === 'number' ? gold : (isSuper ? 999999 : 2500),
      diamonds: typeof diamonds === 'number' ? diamonds : (isSuper ? 99999 : 50),
    });
  }

  /**
   * Memancarkan data koordinat pergerakan pemain lokal ke server
   */
  public sendMovement(x: number, y: number, direction: Direction, isMoving: boolean): void {
    if (this.lastJoinData) {
      this.lastJoinData.x = x;
      this.lastJoinData.y = y;
      this.lastJoinData.direction = direction;
    }
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:move', { x, y, direction, isMoving });
  }

  /**
   * Mengirim pembaruan profil pemain lokal (nama / avatar) ke server multiplayer
   */
  public sendPlayerUpdate(data: { name?: string; avatar?: IAvatarCustomization }): void {
    if (this.lastJoinData) {
      if (data.name) this.lastJoinData.name = data.name;
      if (data.avatar) this.lastJoinData.avatar = data.avatar;
    }
    const myId = this.getSocketId() || 'local-me';
    const me = this.serverPlayers.get(myId);
    if (me) {
      if (data.name) me.name = data.name;
      if (data.avatar) me.avatar = data.avatar;
      this.emitServerPlayersUpdated();
    }
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:update', data);
  }

  /**
   * Mengirim pesan chat ke server (bisa obrolan global atau bisikan pribadi)
   */
  public sendChat(
    text: string,
    senderName?: string,
    senderRole?: string,
    isSuperAdmin?: boolean,
    recipientName?: string,
    isPrivate?: boolean
  ): void {
    if (senderName && this.lastJoinData) {
      this.lastJoinData.name = senderName;
    }
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('chat:message', {
      text,
      senderName: senderName || this.lastJoinData?.name,
      senderRole: senderRole || this.lastJoinData?.role,
      isSuperAdmin: isSuperAdmin ?? this.lastJoinData?.isSuperAdmin,
      recipientName,
      isPrivate: Boolean(isPrivate || recipientName),
    });
  }

  /** Mendaftarkan callback saat menerima inisialisasi state awal open world */
  public onWorldInit(callback: (data: IWorldInitData) => void): void {
    this.listeners.worldInit = [callback];
    this.bindSocketListeners();
  }

  /** Mendaftarkan callback saat ada pemain baru masuk */
  public onPlayerJoined(callback: (player: IPlayerData) => void): void {
    this.listeners.playerJoined = [callback];
    this.bindSocketListeners();
  }

  /** Mendaftarkan callback saat pemain lain bergerak */
  public onPlayerMoved(callback: (data: { id: string; x: number; y: number; direction: Direction; isMoving: boolean }) => void): void {
    this.listeners.playerMoved = [callback];
    this.bindSocketListeners();
  }

  /** Mendaftarkan callback saat pemain lain disconnect */
  public onPlayerLeft(callback: (data: { id: string; name: string }) => void): void {
    this.listeners.playerLeft = [callback];
    this.bindSocketListeners();
  }

  /** Mendaftarkan callback saat pesan obrolan global disiarkan */
  public onChatBroadcast(callback: (data: IChatMessage) => void): void {
    this.listeners.chatBroadcast = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mengirim reaksi ekspresi wajah ke server agar terlihat oleh pemain lain
   */
  public sendExpression(type: 'normal' | 'smile' | 'shock' | 'angry'): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:expression', { type });
  }

  /** Mendaftarkan callback saat pemain lain memancarkan reaksi ekspresi */
  public onPlayerExpression(callback: (data: { id: string; type: 'normal' | 'smile' | 'shock' | 'angry' }) => void): void {
    this.listeners.playerExpression = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mengirim sinyal lompat pemain ke server
   */
  public sendJump(jumpCount: number = 1, x?: number, y?: number): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:jump', { jumpCount, x, y });
  }

  /**
   * Mendaftarkan callback saat pemain lain melompat
   */
  public onPlayerJumped(callback: (data: { id: string; jumpCount: number; x: number; y: number }) => void): void {
    this.listeners.playerJumped = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mengirim sinkronisasi status memancing ke server
   */
  public sendFishing(state: string, bobberPos?: { x: number; y: number }, targetBobberPos?: { x: number; y: number }): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:fishing', { state, bobberPos, targetBobberPos });
  }

  /**
   * Mendaftarkan callback saat ada pemain lain yang memancing
   */
  public onPlayerFishing(callback: (data: { id: string; state: string; bobberPos?: { x: number; y: number }; targetBobberPos?: { x: number; y: number }; direction?: Direction }) => void): void {
    this.listeners.playerFishing = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mengirim chunk rekaman suara untuk Proximity Voice Chat (Radius ±5 petak)
   */
  public sendVoiceChunk(audio: ArrayBuffer | Blob, x: number, y: number): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('voice:chunk', { audio, x, y });
  }

  /**
   * Mengirim sinyal status berbicara lokal (VAD) ke server
   */
  public sendVoiceSpeaking(isSpeaking: boolean): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('voice:speaking', { isSpeaking });
  }

  /**
   * Mendaftarkan callback saat menerima aliran audio suara dari pemain lain
   */
  public onVoiceStream(callback: (data: { senderId: string; senderName: string; x: number; y: number; audio: ArrayBuffer }) => void): void {
    this.listeners.voiceStream.push(callback);
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback status visual pemain lain sedang berbicara
   */
  public onVoiceSpeaking(callback: (data: { senderId: string; isSpeaking: boolean }) => void): void {
    this.listeners.voiceSpeaking.push(callback);
    this.bindSocketListeners();
  }

  /**
   * Mengirim status AFK pemain lokal ke server
   */
  public sendAfk(isAfk: boolean, durationSeconds?: number): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:afk', { isAfk, durationSeconds: durationSeconds || 0 });
  }

  /**
   * Mendaftarkan callback saat pemain lain AFK atau kembali aktif
   */
  public onPlayerAfk(callback: (data: { id: string; isAfk: boolean; durationSeconds: number }) => void): void {
    if (!this.listeners.playerAfk) this.listeners.playerAfk = [];
    this.listeners.playerAfk.push(callback);
    this.bindSocketListeners();
  }

  /**
   * Mengirim permintaan pertemanan ke pemain lain
   */
  public sendFriendRequest(targetId: string, targetName: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('friend:request', {
      targetId,
      targetName,
      senderName: this.lastJoinData?.name,
      senderAvatar: this.lastJoinData?.avatar,
      senderRole: this.lastJoinData?.role,
      senderLevel: 1,
    });
  }

  /**
   * Mengirim jawaban permintaan pertemanan (terima / tolak)
   */
  public sendFriendResponse(requesterId: string, accepted: boolean, requesterName?: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('friend:response', {
      requesterId,
      requesterName,
      accepted,
      responderName: this.lastJoinData?.name,
    });
  }

  /**
   * Mendaftarkan callback saat menerima permintaan pertemanan dari pemain lain
   */
  public onFriendRequest(callback: (data: any) => void): void {
    this.listeners.friendRequest = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback saat menerima hasil respon permintaan pertemanan
   */
  public onFriendResponse(callback: (data: any) => void): void {
    this.listeners.friendResponse = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mengirim event mengikuti (follow) pemain lain ke server secara real-time
   */
  public sendFollow(targetId?: string, targetName?: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:follow', {
      targetId,
      targetName,
      senderName: this.lastJoinData?.name,
      senderAvatar: this.lastJoinData?.avatar,
    });
  }

  /**
   * Mengirim event berhenti mengikuti (unfollow) pemain lain ke server secara real-time
   */
  public sendUnfollow(targetId?: string, targetName?: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:unfollow', {
      targetId,
      targetName,
      senderName: this.lastJoinData?.name,
    });
  }

  /**
   * Mendaftarkan callback saat ada pemain lain yang mengikuti kamu
   */
  public onFollowedBy(callback: (data: any) => void): void {
    this.listeners.playerFollowedBy = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback saat ada pemain lain yang berhenti mengikutimu
   */
  public onUnfollowedBy(callback: (data: any) => void): void {
    this.listeners.playerUnfollowedBy = [callback];
    this.bindSocketListeners();
  }

  /** Mendaftarkan callback sinkronisasi monster (kompatibilitas mundur) */
  public onMonstersSync(_callback?: (monsters: any[]) => void): void {
    // Monster dihilangkan dan diganti dengan NPC interaktif di open world
  }

  /** Reset listener khusus scene saat berpindah scene (mempertahankan listener voice global & friends) */
  public clearListeners(): void {
    const preservedVoiceStream = this.listeners.voiceStream || [];
    const preservedVoiceSpeaking = this.listeners.voiceSpeaking || [];
    const preservedFriendRequest = this.listeners.friendRequest || [];
    const preservedFriendResponse = this.listeners.friendResponse || [];
    const preservedPlayerAfk = this.listeners.playerAfk || [];
    const preservedPlayerJumped = this.listeners.playerJumped || [];
    const preservedPlayerFishing = this.listeners.playerFishing || [];
    const preservedPlayerExpression = this.listeners.playerExpression || [];
    const preservedPlayerFollowedBy = this.listeners.playerFollowedBy || [];
    const preservedPlayerUnfollowedBy = this.listeners.playerUnfollowedBy || [];

    this.listeners = {
      worldInit: [],
      playerJoined: [],
      playerMoved: [],
      playerLeft: [],
      chatBroadcast: [],
      playerExpression: preservedPlayerExpression,
      voiceStream: preservedVoiceStream,
      voiceSpeaking: preservedVoiceSpeaking,
      playerAfk: preservedPlayerAfk,
      friendRequest: preservedFriendRequest,
      friendResponse: preservedFriendResponse,
      playerJumped: preservedPlayerJumped,
      playerFishing: preservedPlayerFishing,
      playerFollowedBy: preservedPlayerFollowedBy,
      playerUnfollowedBy: preservedPlayerUnfollowedBy,
    };

    if (this.socket) {
      this.socket.off('world:init');
      this.socket.off('player:joined');
      this.socket.off('player:moved');
      this.socket.off('player:left');
      this.socket.off('chat:broadcast');
      // Jangan matikan player:jumped, player:expression, voice:stream, voice:speaking, friend:request_received, friend:response_result, player:followed_by, player:unfollowed_by
    }
  }

  /** Memutus koneksi socket secara bersih */
  public disconnect(): void {
    this.clearListeners();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}
