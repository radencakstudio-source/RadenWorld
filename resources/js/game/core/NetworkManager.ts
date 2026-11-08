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
    playerKite: ((data: { id: string; isFlying: boolean; kiteX: number; kiteY: number; kiteTilt: number }) => void)[];
    playerFollowedBy: ((data: any) => void)[];
    playerUnfollowedBy: ((data: any) => void)[];
    playerHandHoldRequest: ((data: any) => void)[];
    playerHandHoldResponse: ((data: any) => void)[];
    playerHandHoldReleased: ((data: any) => void)[];
    playerTradeRequest: ((data: any) => void)[];
    playerTradeResponse: ((data: any) => void)[];
    playerTradeReceived: ((data: any) => void)[];
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
    playerKite: [],
    playerFollowedBy: [],
    playerUnfollowedBy: [],
    playerHandHoldRequest: [],
    playerHandHoldResponse: [],
    playerHandHoldReleased: [],
    playerTradeRequest: [],
    playerTradeResponse: [],
    playerTradeReceived: [],
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
    // 1. Prioritaskan URL server dari variabel lingkungan Vite (misal dari Render.com)
    const viteServerUrl = (import.meta as any).env?.VITE_GAME_SERVER_URL?.trim();
    if (viteServerUrl) {
      return viteServerUrl;
    }

    if (typeof window !== 'undefined') {
      const isCurrentLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
      if (isCurrentLocal) {
        return 'http://127.0.0.1:3001';
      }

      // Deteksi otomatis jika game diakses via Wasmer Edge (radenworld.wasmer.app atau subdomain wasmer lainnya)
      if (window.location.hostname.includes('wasmer.app')) {
        return 'https://radenworld-server.wasmer.app';
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
    const targetUrl = url || NetworkManager.getEffectiveServerUrl();

    // Jika socket sudah ada dan sedang aktif/terhubung ke URL yang sama, jangan buat koneksi ganda
    if (this.socket) {
      if ((this.socket.connected || (this.socket as any).active) && this.serverUrl === targetUrl) {
        return;
      }
      this.disconnect();
    }

    this.serverUrl = targetUrl;

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'ngrok-skip-browser-warning': '1',
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    if (this.socket.io) {
      let isRecoveringSession = false;
      this.socket.io.on('error', (err: any) => {
        console.warn('[NetworkManager] Socket manager notice:', err?.message || err);
        const errMsg = String(err?.message || err || '').toLowerCase();
        // Jika sesi terputus (Session ID unknown / xhr post error / 400 Bad Request),
        // segera pulihkan sesi dengan reconnect bersih agar tidak looping request 400
        if ((errMsg.includes('xhr post error') || errMsg.includes('xhr poll error') || errMsg.includes('400') || errMsg.includes('unknown')) && !isRecoveringSession) {
          isRecoveringSession = true;
          console.log('[NetworkManager] Sesi multiplayer kadaluarsa / terputus, memperbarui sesi...');
          setTimeout(() => {
            isRecoveringSession = false;
            this.reconnect();
          }, 400);
        }
      });
      const setupEngineUpgradeHandler = () => {
        const engine = (this.socket?.io as any)?.engine;
        if (engine && !engine._hasUpgradeErrorHandler) {
          engine._hasUpgradeErrorHandler = true;
          engine.on('upgradeError', (err: any) => {
            console.warn('[NetworkManager] Transport upgrade failed, staying on polling fallback:', err?.message || err);
          });
        }
      };
      setupEngineUpgradeHandler();
      this.socket.io.on('open', setupEngineUpgradeHandler);
    }

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
          this.disconnect();
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

  /** Membersihkan dan menormalisasi kode server */
  public cleanServerCode(code?: string | null): string {
    if (!code) return 'Asia 1';
    const upper = code.toUpperCase();
    if (upper.includes('ASIA-2') || upper.includes('ASIA 2')) return 'Asia 2';
    if (upper.includes('ASIA-3') || upper.includes('ASIA 3')) return 'Asia 3';
    if (upper.includes('ASIA-4') || upper.includes('ASIA 4')) return 'Asia 4';
    return 'Asia 1';
  }

  /** Daftar pemain aktif di room/area lokal saat ini (untuk Phaser Scene rendering) */
  private roomPlayers: Map<string, IPlayerData> = new Map();

  /** Daftar seluruh pemain aktif di realm server channel saat ini (untuk HUD & Modal Server) */
  private channelPlayers: Map<string, IPlayerData> = new Map();

  /** Jumlah pemain aktif di server channel saat ini */
  private channelPlayerCount: number = 1;

  /** Alias untuk backward compatibility */
  private get serverPlayers(): Map<string, IPlayerData> {
    return this.roomPlayers;
  }

  /** Mengambil seluruh pemain yang online di server channel saat ini (lintas ruangan) */
  public getServerPlayers(): IPlayerData[] {
    if (this.channelPlayers.size > 0) {
      return Array.from(this.channelPlayers.values());
    }
    return Array.from(this.roomPlayers.values());
  }

  /** Mengambil pemain yang ada di satu ruangan lokal saja */
  public getRoomPlayers(): IPlayerData[] {
    return Array.from(this.roomPlayers.values());
  }

  /** Mengecek apakah pemain target tertentu sedang aktif di room atau server channel */
  public isPlayerOnline(targetName?: string, targetId?: string): boolean {
    const myId = this.getSocketId();
    const cleanName = (targetName || '').trim().toLowerCase();
    const cleanId = (targetId || '').trim();

    for (const [sId, p] of this.roomPlayers.entries()) {
      if (sId !== myId) {
        if (cleanId && (sId === cleanId || p.id === cleanId)) return true;
        if (cleanName && p.name && p.name.trim().toLowerCase() === cleanName) return true;
      }
    }
    for (const [sId, p] of this.channelPlayers.entries()) {
      if (sId !== myId) {
        if (cleanId && (sId === cleanId || p.id === cleanId)) return true;
        if (cleanName && p.name && p.name.trim().toLowerCase() === cleanName) return true;
      }
    }
    return false;
  }

  /** Mengambil total pemain aktif di server channel saat ini */
  public getServerPlayerCount(): number {
    const clean = this.cleanServerCode(this.currentServerCode);
    const statCount = this.serverStats[clean];
    return Math.max(statCount || 0, this.channelPlayerCount, this.channelPlayers.size, 1);
  }

  private emitRoomPlayersUpdated(): void {
    const list = Array.from(this.roomPlayers.values());
    EventBus.emit('room-players-updated', list);
    // Jika data server channel belum tiba, gunakan data room sebagai fallback minimal
    if (this.channelPlayers.size === 0) {
      EventBus.emit('server-players-updated', list);
      EventBus.emit('player-count-updated', Math.max(1, list.length));
    }
  }

  private emitChannelPlayersUpdated(): void {
    const list = Array.from(this.channelPlayers.values());
    EventBus.emit('server-players-updated', list);
    EventBus.emit('player-count-updated', Math.max(1, this.channelPlayerCount, list.length));
  }

  private emitServerPlayersUpdated(): void {
    this.emitRoomPlayersUpdated();
    this.emitChannelPlayersUpdated();
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
    this.socket.off('player:kite');
    this.socket.off('player:followed_by');
    this.socket.off('player:unfollowed_by');
    this.socket.off('handhold:request_received');
    this.socket.off('handhold:response_result');
    this.socket.off('handhold:released');
    this.socket.off('trade:request_received');
    this.socket.off('trade:response_result');
    this.socket.off('trade:received');
    this.socket.off('server:stats');
    this.socket.off('server:players_list');

    this.socket.on('handhold:request_received', (data: any) => {
      console.log('[NetworkManager] Diterima handhold:request_received:', data);
      EventBus.emit('incoming-handhold-request', data);
      this.listeners.playerHandHoldRequest.forEach((cb) => cb(data));
    });

    this.socket.on('handhold:response_result', (data: any) => {
      console.log('[NetworkManager] Diterima handhold:response_result:', data);
      EventBus.emit('handhold-response-result', data);
      this.listeners.playerHandHoldResponse.forEach((cb) => cb(data));
    });

    this.socket.on('handhold:released', (data: any) => {
      console.log('[NetworkManager] Diterima handhold:released:', data);
      EventBus.emit('handhold-released', data);
      this.listeners.playerHandHoldReleased.forEach((cb) => cb(data));
    });

    this.socket.on('trade:request_received', (data: any) => {
      console.log('[NetworkManager] Diterima trade:request_received:', data);
      EventBus.emit('incoming-trade-request', data);
      this.listeners.playerTradeRequest.forEach((cb) => cb(data));
    });

    this.socket.on('trade:response_result', (data: any) => {
      console.log('[NetworkManager] Diterima trade:response_result:', data);
      EventBus.emit('trade-response-result', data);
      this.listeners.playerTradeResponse.forEach((cb) => cb(data));
    });

    this.socket.on('trade:received', (data: any) => {
      console.log('[NetworkManager] Diterima trade:received:', data);
      EventBus.emit('trade-received', data);
      this.listeners.playerTradeReceived.forEach((cb) => cb(data));
    });

    this.socket.on('server:stats', (stats: Record<string, number>) => {
      if (stats && typeof stats === 'object') {
        this.serverStats = { ...this.serverStats, ...stats };
        EventBus.emit('server-stats-updated', this.serverStats);

        const clean = this.cleanServerCode(this.currentServerCode);
        if (typeof stats[clean] === 'number' && stats[clean] > 0) {
          this.channelPlayerCount = Math.max(stats[clean], this.channelPlayers.size, 1);
          EventBus.emit('player-count-updated', this.channelPlayerCount);
        }
      }
    });

    this.socket.on('server:players_list', (data: { serverCode: string; players: IPlayerData[]; count: number }) => {
      if (!data) return;
      const myClean = this.cleanServerCode(this.currentServerCode);
      const incomingClean = this.cleanServerCode(data.serverCode);
      if (myClean === incomingClean && Array.isArray(data.players)) {
        this.channelPlayers.clear();
        data.players.forEach((p) => this.channelPlayers.set(p.id, p));
        this.channelPlayerCount = Math.max(data.count || 0, data.players.length, 1);
        this.emitChannelPlayersUpdated();
      }
    });

    this.socket.on('player:jumped', (data: { id: string; jumpCount: number; x: number; y: number }) => {
      this.listeners.playerJumped.forEach((cb) => cb(data));
    });

    this.socket.on('player:fishing', (data: { id: string; state: string; bobberPos?: { x: number; y: number }; targetBobberPos?: { x: number; y: number }; direction?: Direction }) => {
      this.listeners.playerFishing.forEach((cb) => cb(data));
    });

    this.socket.on('player:kite', (data: { id: string; isFlying: boolean; kiteX: number; kiteY: number; kiteTilt: number }) => {
      this.listeners.playerKite.forEach((cb) => cb(data));
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
      this.roomPlayers.clear();
      if (data.selfPlayer) {
        this.roomPlayers.set(data.selfPlayer.id, data.selfPlayer);
        this.channelPlayers.set(data.selfPlayer.id, data.selfPlayer);
      }
      if (Array.isArray(data.players)) {
        data.players.forEach((p) => this.roomPlayers.set(p.id, p));
      }
      this.emitRoomPlayersUpdated();
      this.requestServerStats();
      this.requestServerPlayers();
      this.listeners.worldInit.forEach((cb) => cb(data));
    });

    this.socket.on('room:players', (data: { room: string; players: IPlayerData[] }) => {
      const myId = this.getSocketId();
      const me = myId ? this.roomPlayers.get(myId) : null;
      this.roomPlayers.clear();
      if (me) this.roomPlayers.set(me.id, me);
      if (Array.isArray(data.players)) {
        data.players.forEach((p) => this.roomPlayers.set(p.id, p));
      }
      this.emitRoomPlayersUpdated();
      this.requestServerStats();
      this.requestServerPlayers();
      this.listeners.worldInit.forEach((cb) => cb({
        selfId: this.getSocketId() || '',
        selfPlayer: null as any,
        players: data.players,
        monsters: [],
        worldBounds: { width: 9600, height: 9600 },
      }));
    });

    this.socket.on('player:joined', (player: IPlayerData) => {
      this.roomPlayers.set(player.id, player);
      this.channelPlayers.set(player.id, player);
      this.emitRoomPlayersUpdated();
      this.emitChannelPlayersUpdated();
      this.requestServerStats();
      this.listeners.playerJoined.forEach((cb) => cb(player));
    });

    this.socket.on('player:updated', (data: { id: string; name?: string; avatar?: IAvatarCustomization; role?: string; isSuperAdmin?: boolean; level?: number }) => {
      const existingRoom = this.roomPlayers.get(data.id);
      if (existingRoom) {
        if (data.name) existingRoom.name = data.name;
        if (data.avatar) existingRoom.avatar = data.avatar;
        if (data.role) existingRoom.role = data.role;
        if (typeof data.isSuperAdmin === 'boolean') existingRoom.isSuperAdmin = data.isSuperAdmin;
        if (typeof data.level === 'number') existingRoom.level = data.level;
      }
      const existingChannel = this.channelPlayers.get(data.id);
      if (existingChannel) {
        if (data.name) existingChannel.name = data.name;
        if (data.avatar) existingChannel.avatar = data.avatar;
        if (data.role) existingChannel.role = data.role;
        if (typeof data.isSuperAdmin === 'boolean') existingChannel.isSuperAdmin = data.isSuperAdmin;
        if (typeof data.level === 'number') existingChannel.level = data.level;
        this.emitChannelPlayersUpdated();
      }
      EventBus.emit('remote-player-updated', data);
    });

    this.socket.on('player:moved', (data) => {
      this.listeners.playerMoved.forEach((cb) => cb(data));
    });

    this.socket.on('player:left', (data) => {
      this.roomPlayers.delete(data.id);
      this.channelPlayers.delete(data.id);
      this.emitRoomPlayersUpdated();
      this.emitChannelPlayersUpdated();
      this.requestServerStats();
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

  /** Kode server aktif saat ini (Asia 1, Asia 2, Asia 3, Asia 4) */
  private currentServerCode: string = (() => {
    try {
      return localStorage.getItem('raden_server_code') || 'Asia 1';
    } catch (e) {
      return 'Asia 1';
    }
  })();

  public getServerCode(): string {
    return this.currentServerCode;
  }

  public setServerCode(code: string): void {
    this.currentServerCode = code || 'Asia 1';
    try {
      localStorage.setItem('raden_server_code', this.currentServerCode);
    } catch (e) {}
  }

  /** Mengubah nama server menjadi slug room, contoh: 'Asia 1' -> 'asia-1' */
  public getServerSlug(code?: string): string {
    const c = code || this.currentServerCode || 'Asia 1';
    return c.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Mengonversi nama area/room dasar menjadi room terisolasi per-server.
   * Contoh: 'world' di server 'Asia 1' -> 'world_asia-1'
   * Contoh: 'world' di server 'Asia 2' -> 'world_asia-2'
   * Rumah pribadi ('house-xxx') dan portal admin ('admin-xxx') tetap bersifat privat global.
   */
  public getScopedRoom(baseRoom: string, code?: string): string {
    if (!baseRoom) baseRoom = 'world';
    if (
      baseRoom.startsWith('house-') ||
      baseRoom.startsWith('safe-') ||
      baseRoom.startsWith('private-') ||
      baseRoom.startsWith('admin-')
    ) {
      return baseRoom;
    }
    const slug = this.getServerSlug(code);
    const cleanedBase = baseRoom.replace(/_asia-\d+/gi, '');
    return `${cleanedBase}_${slug}`;
  }

  /**
   * Berpindah antar-room/area (World, Gedung SD, SMP, SMA, Rumah, Admin Portal)
   */
  public switchRoom(room: string, x?: number, y?: number, direction?: Direction): void {
    const targetRoom = this.getScopedRoom(room);
    if (this.lastJoinData) {
      this.lastJoinData.room = targetRoom;
      if (typeof x === 'number') this.lastJoinData.x = x;
      if (typeof y === 'number') this.lastJoinData.y = y;
      if (direction) this.lastJoinData.direction = direction;
    }
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:switch_room', {
      room: targetRoom,
      x,
      y,
      direction,
      serverCode: this.currentServerCode,
    });
    this.requestServerStats();
    this.requestServerPlayers();
  }

  /**
   * Mengeksekusi perpindahan server channel secara real-time (contoh: Asia 1 -> Asia 2)
   */
  public switchServer(newServerCode: string): void {
    this.setServerCode(newServerCode);
    const currentBase = this.lastJoinData?.room ? this.lastJoinData.room.replace(/_asia-\d+/gi, '') : 'world';
    const targetRoom = this.getScopedRoom(currentBase, newServerCode);

    if (this.lastJoinData) {
      this.lastJoinData.room = targetRoom;
    }

    // Bersihkan daftar pemain remote dari server sebelumnya
    this.roomPlayers.clear();
    this.channelPlayers.clear();
    const myId = this.getSocketId() || 'local-me';
    if (this.lastJoinData) {
      const myPlayerData: IPlayerData = {
        id: myId,
        name: this.lastJoinData.name,
        avatar: this.lastJoinData.avatar,
        x: this.lastJoinData.x || 4800,
        y: this.lastJoinData.y || 4860,
        direction: this.lastJoinData.direction || 'down',
        isMoving: false,
        hp: 100,
        maxHp: 100,
        level: 1,
        role: this.lastJoinData.role,
        isSuperAdmin: this.lastJoinData.isSuperAdmin,
        serverCode: this.currentServerCode,
      };
      this.roomPlayers.set(myId, myPlayerData);
      this.channelPlayers.set(myId, myPlayerData);
    }
    this.emitRoomPlayersUpdated();
    this.emitChannelPlayersUpdated();

    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:switch_room', {
      room: targetRoom,
      x: this.lastJoinData?.x,
      y: this.lastJoinData?.y,
      direction: this.lastJoinData?.direction || 'down',
      serverCode: this.currentServerCode,
    });
    this.requestRoomPlayers();
    this.requestServerStats();
    this.requestServerPlayers();
  }

  /** Statistik jumlah pemain real-time per server channel */
  private serverStats: Record<string, number> = {
    'Asia 1': 0,
    'Asia 2': 0,
    'Asia 3': 0,
    'Asia 4': 0,
    total: 0,
  };

  public getServerStats(): Record<string, number> {
    return this.serverStats;
  }

  public requestServerStats(): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('server:request_stats');
  }

  /** Meminta daftar seluruh pemain yang aktif di realm server channel saat ini */
  public requestServerPlayers(): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('server:request_players_list', { serverCode: this.currentServerCode });
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
    const targetRoom = this.getScopedRoom(room);
    this.lastJoinData = { name, avatar, role, isSuperAdmin, x, y, direction, gold, diamonds, room: targetRoom };
    const isSuper = isSuperAdmin || role === 'super_admin' || name.toUpperCase() === 'RADEN';

    const myId = this.getSocketId() || 'local-me';
    const myData: IPlayerData = {
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
      serverCode: this.currentServerCode,
    };
    this.roomPlayers.set(myId, myData);
    this.channelPlayers.set(myId, myData);
    this.emitRoomPlayersUpdated();
    this.emitChannelPlayersUpdated();

    if (!this.socket || !this.isConnected) return;
    const authToken = (typeof window !== 'undefined' ? localStorage.getItem('raden_auth_token') : '') || '';
    this.socket.emit('player:join', {
      name,
      avatar,
      room: targetRoom,
      serverCode: this.currentServerCode,
      authToken,
      role: isSuper ? 'super_admin' : (role || 'player'),
      isSuperAdmin: isSuper,
      x: typeof x === 'number' && !isNaN(x) ? x : 4800,
      y: typeof y === 'number' && !isNaN(y) ? y : 4860,
      direction: direction || 'down',
      gold: typeof gold === 'number' ? gold : (isSuper ? 999999 : 2500),
      diamonds: typeof diamonds === 'number' ? diamonds : (isSuper ? 99999 : 50),
    });
    this.requestServerStats();
    this.requestServerPlayers();
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
   * Mengirim pembaruan profil pemain lokal (nama / avatar / level) ke server multiplayer
   */
  public sendPlayerUpdate(data: { name?: string; avatar?: IAvatarCustomization; level?: number }): void {
    if (this.lastJoinData) {
      if (data.name) this.lastJoinData.name = data.name;
      if (data.avatar) this.lastJoinData.avatar = data.avatar;
    }
    const myId = this.getSocketId() || 'local-me';
    const me = this.serverPlayers.get(myId);
    if (me) {
      if (data.name) me.name = data.name;
      if (data.avatar) me.avatar = data.avatar;
      if (typeof data.level === 'number') me.level = data.level;
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
   * Mengirim sinkronisasi status terbang layang-layang ke server
   */
  public sendKite(isFlying: boolean, kiteX: number = 0, kiteY: number = 0, kiteTilt: number = 0): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:kite', { isFlying, kiteX, kiteY, kiteTilt });
  }

  /**
   * Mendaftarkan callback saat ada pemain lain yang menerbangkan/mengendalikan layang-layang
   */
  public onPlayerKite(callback: (data: { id: string; isFlying: boolean; kiteX: number; kiteY: number; kiteTilt: number }) => void): void {
    this.listeners.playerKite = [callback];
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
   * Mengirim jawaban permintaan pertemanan / mengikuti (terima / tolak / abaikan / hangus)
   */
  public sendFriendResponse(
    requesterId: string,
    accepted: boolean,
    requesterName?: string,
    status?: 'accepted' | 'rejected' | 'ignored' | 'expired'
  ): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('friend:response', {
      requesterId,
      requesterName,
      accepted,
      status: status || (accepted ? 'accepted' : 'rejected'),
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

  /** Mengambil data pengirim yang efektif dari memori atau localStorage */
  private getEffectiveSenderInfo() {
    let name = this.lastJoinData?.name;
    let avatar = this.lastJoinData?.avatar;
    let role = this.lastJoinData?.role || 'player';
    let level = 1;
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (!name) name = u.name || localStorage.getItem('raden_player_name') || 'Petualang';
      if (!avatar && u.avatar) avatar = u.avatar;
      if (typeof u.level === 'number' && u.level >= 1) level = u.level;
      if (u.role) role = u.role;
    } catch (e) {
      if (!name) name = 'Petualang';
    }
    return { name, avatar, role, level };
  }

  /**
   * Mengirim event mengikuti (follow) pemain lain ke server secara real-time
   */
  public sendFollow(targetId?: string, targetName?: string, senderLevel?: number): void {
    if (!this.socket || !this.isConnected) return;
    const info = this.getEffectiveSenderInfo();
    this.socket.emit('player:follow', {
      targetId,
      targetName,
      senderName: info.name,
      senderAvatar: info.avatar,
      senderRole: info.role,
      senderLevel: senderLevel || info.level,
    });
  }

  /**
   * Mengirim event berhenti mengikuti (unfollow) pemain lain ke server secara real-time
   */
  public sendUnfollow(targetId?: string, targetName?: string): void {
    if (!this.socket || !this.isConnected) return;
    const info = this.getEffectiveSenderInfo();
    this.socket.emit('player:unfollow', {
      targetId,
      targetName,
      senderName: info.name,
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

  /**
   * Mengirim permintaan pegangan tangan ke pemain lain
   */
  public sendHandHoldRequest(targetId: string, targetName: string): void {
    if (!this.socket || !this.isConnected) return;
    const info = this.getEffectiveSenderInfo();
    this.socket.emit('handhold:request', {
      targetId,
      targetName,
      senderName: info.name,
      senderAvatar: info.avatar,
      senderRole: info.role,
      senderLevel: info.level,
    });
  }

  /**
   * Mengirim jawaban permintaan pegangan tangan (terima / tolak / abaikan / hangus)
   */
  public sendHandHoldResponse(
    requesterId: string,
    accepted: boolean,
    requesterName?: string,
    status?: 'accepted' | 'rejected' | 'ignored' | 'expired'
  ): void {
    if (!this.socket || !this.isConnected) return;
    const info = this.getEffectiveSenderInfo();
    this.socket.emit('handhold:response', {
      requesterId,
      requesterName,
      accepted,
      status: status || (accepted ? 'accepted' : 'rejected'),
      responderName: info.name,
    });
  }

  /**
   * Mengirim sinyal melepas pegangan tangan ke pasangan
   */
  public sendHandHoldRelease(partnerId?: string, partnerName?: string): void {
    if (!this.socket || !this.isConnected) return;
    const info = this.getEffectiveSenderInfo();
    this.socket.emit('handhold:release', {
      partnerId,
      partnerName,
      senderName: info.name,
    });
  }

  /**
   * Mengirim permintaan ajakan Trade barang ke pemain lain
   */
  public sendTradeRequest(targetId: string, targetName: string): void {
    if (!this.socket || !this.isConnected) return;
    const info = this.getEffectiveSenderInfo();
    this.socket.emit('trade:request', {
      targetId,
      targetName,
      senderName: info.name,
      senderAvatar: info.avatar,
      senderRole: info.role,
      senderLevel: info.level,
    });
  }

  /**
   * Mengirim jawaban permintaan ajakan Trade (terima / tolak / abaikan / hangus)
   */
  public sendTradeResponse(
    requesterId: string,
    accepted: boolean,
    requesterName?: string,
    status?: 'accepted' | 'rejected' | 'ignored' | 'expired'
  ): void {
    if (!this.socket || !this.isConnected) return;
    const info = this.getEffectiveSenderInfo();
    this.socket.emit('trade:response', {
      requesterId,
      requesterName,
      accepted,
      status: status || (accepted ? 'accepted' : 'rejected'),
      responderName: info.name,
    });
  }

  /**
   * Mengirim paket Trade barang (semua item kecuali biji) ke pemain lain
   */
  public sendTradeOffer(payload: {
    targetId?: string;
    targetName: string;
    senderName?: string;
    items: any[];
    note?: string;
  }): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('trade:offer', {
      targetId: payload.targetId,
      targetName: payload.targetName,
      senderName: payload.senderName || this.lastJoinData?.name,
      items: payload.items,
    });
  }

  /**
   * Mendaftarkan callback saat menerima ajakan pegangan tangan dari pemain lain
   */
  public onHandHoldRequest(callback: (data: any) => void): void {
    this.listeners.playerHandHoldRequest = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback saat menerima respon atas ajakan pegangan tangan
   */
  public onHandHoldResponse(callback: (data: any) => void): void {
    this.listeners.playerHandHoldResponse = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback saat pasangan pegangan tangan melepas gandengan
   */
  public onHandHoldReleased(callback: (data: any) => void): void {
    this.listeners.playerHandHoldReleased = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback saat menerima ajakan Trade barang dari pemain lain
   */
  public onTradeRequest(callback: (data: any) => void): void {
    this.listeners.playerTradeRequest = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback saat menerima respon atas ajakan Trade
   */
  public onTradeResponse(callback: (data: any) => void): void {
    this.listeners.playerTradeResponse = [callback];
    this.bindSocketListeners();
  }

  /**
   * Mendaftarkan callback saat menerima kiriman paket barang Trade dari pemain lain
   */
  public onTradeReceived(callback: (data: any) => void): void {
    this.listeners.playerTradeReceived = [callback];
    this.bindSocketListeners();
  }

  /** Mendaftarkan callback sinkronisasi monster (kompatibilitas mundur) */
  public onMonstersSync(_callback?: (monsters: any[]) => void): void {
    // Monster dihilangkan dan diganti dengan NPC interaktif di open world
  }

  /** Reset listener khusus scene saat berpindah scene (mempertahankan listener voice global & friends & trade & handhold) */
  public clearListeners(): void {
    const preservedVoiceStream = this.listeners.voiceStream || [];
    const preservedVoiceSpeaking = this.listeners.voiceSpeaking || [];
    const preservedFriendRequest = this.listeners.friendRequest || [];
    const preservedFriendResponse = this.listeners.friendResponse || [];
    const preservedPlayerAfk = this.listeners.playerAfk || [];
    const preservedPlayerJumped = this.listeners.playerJumped || [];
    const preservedPlayerFishing = this.listeners.playerFishing || [];
    const preservedPlayerKite = this.listeners.playerKite || [];
    const preservedPlayerExpression = this.listeners.playerExpression || [];
    const preservedPlayerFollowedBy = this.listeners.playerFollowedBy || [];
    const preservedPlayerUnfollowedBy = this.listeners.playerUnfollowedBy || [];
    const preservedPlayerHandHoldRequest = this.listeners.playerHandHoldRequest || [];
    const preservedPlayerHandHoldResponse = this.listeners.playerHandHoldResponse || [];
    const preservedPlayerHandHoldReleased = this.listeners.playerHandHoldReleased || [];
    const preservedPlayerTradeRequest = this.listeners.playerTradeRequest || [];
    const preservedPlayerTradeResponse = this.listeners.playerTradeResponse || [];
    const preservedPlayerTradeReceived = this.listeners.playerTradeReceived || [];

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
      playerKite: preservedPlayerKite,
      playerFollowedBy: preservedPlayerFollowedBy,
      playerUnfollowedBy: preservedPlayerUnfollowedBy,
      playerHandHoldRequest: preservedPlayerHandHoldRequest,
      playerHandHoldResponse: preservedPlayerHandHoldResponse,
      playerHandHoldReleased: preservedPlayerHandHoldReleased,
      playerTradeRequest: preservedPlayerTradeRequest,
      playerTradeResponse: preservedPlayerTradeResponse,
      playerTradeReceived: preservedPlayerTradeReceived,
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
