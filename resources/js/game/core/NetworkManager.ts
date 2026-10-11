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
  } = {
    worldInit: [],
    playerJoined: [],
    playerMoved: [],
    playerLeft: [],
    chatBroadcast: [],
    playerExpression: [],
    voiceStream: [],
    voiceSpeaking: [],
  };

  /** Konstruktor privat untuk mencegah pembuatan instansi ganda (Singleton) */
  private constructor() {}

  /**
   * Mengambil instansi tunggal NetworkManager
   */
  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  /**
   * Mengambil host server yang efektif (dari localStorage 'raden_server_host' atau otomatis hostname browser)
   */
  public static getEffectiveServerHost(): string {
    if (typeof window === 'undefined') return 'localhost';
    try {
      const savedHost = localStorage.getItem('raden_server_host')?.trim();
      if (savedHost) return savedHost;
    } catch (e) {}
    return window.location.hostname || 'localhost';
  }

  /**
   * Mengambil URL server Socket.io yang efektif
   */
  public static getEffectiveServerUrl(): string {
    let host = NetworkManager.getEffectiveServerHost();
    if (!host) {
      host = (typeof window !== 'undefined' ? window.location.hostname : 'localhost') || 'localhost';
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
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
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
          this.lastJoinData.isSuperAdmin
        );
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[NetworkManager] Terputus dari server game.');
      EventBus.emit('network-status-changed', { isConnected: false, serverUrl: this.serverUrl });
    });

    this.socket.on('connect_error', (err) => {
      this.isConnected = false;
      console.warn('[NetworkManager] Mode offline/lokal aktif:', err.message);
      EventBus.emit('network-status-changed', { isConnected: false, serverUrl: this.serverUrl, error: err.message });
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

  private bindSocketListeners(): void {
    if (!this.socket) return;

    // Bersihkan listener sebelumnya agar tidak double
    this.socket.off('world:init');
    this.socket.off('player:joined');
    this.socket.off('player:moved');
    this.socket.off('player:left');
    this.socket.off('chat:broadcast');
    this.socket.off('player:expression');
    this.socket.off('voice:stream');
    this.socket.off('voice:speaking');

    this.socket.on('world:init', (data: IWorldInitData) => {
      this.listeners.worldInit.forEach((cb) => cb(data));
    });

    this.socket.on('player:joined', (player: IPlayerData) => {
      this.listeners.playerJoined.forEach((cb) => cb(player));
    });

    this.socket.on('player:moved', (data) => {
      this.listeners.playerMoved.forEach((cb) => cb(data));
    });

    this.socket.on('player:left', (data) => {
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
  }

  /** Mengecek apakah koneksi socket sedang aktif */
  public getConnected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  /** Mengambil Socket ID pemain */
  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  public joinGame(name: string, avatar: IAvatarCustomization, role?: string, isSuperAdmin?: boolean): void {
    this.lastJoinData = { name, avatar, role, isSuperAdmin };
    if (!this.socket || !this.isConnected) return;
    const isSuper = isSuperAdmin || role === 'super_admin' || name.toUpperCase() === 'RADEN';
    this.socket.emit('player:join', {
      name,
      avatar,
      role: isSuper ? 'super_admin' : (role || 'player'),
      isSuperAdmin: isSuper,
    });
  }

  /**
   * Memancarkan data koordinat pergerakan pemain lokal ke server
   */
  public sendMovement(x: number, y: number, direction: Direction, isMoving: boolean): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:move', { x, y, direction, isMoving });
  }

  /**
   * Mengirim pesan chat ke obrolan global server
   */
  public sendChat(text: string, senderName?: string, senderRole?: string, isSuperAdmin?: boolean): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('chat:message', {
      text,
      senderName: senderName || this.lastJoinData?.name,
      senderRole: senderRole || this.lastJoinData?.role,
      isSuperAdmin: isSuperAdmin ?? this.lastJoinData?.isSuperAdmin,
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

  /** Mendaftarkan callback sinkronisasi monster (kompatibilitas mundur) */
  public onMonstersSync(_callback?: (monsters: any[]) => void): void {
    // Monster dihilangkan dan diganti dengan NPC interaktif di open world
  }

  /** Reset listener khusus scene saat berpindah scene (mempertahankan listener voice global) */
  public clearListeners(): void {
    const preservedVoiceStream = this.listeners.voiceStream;
    const preservedVoiceSpeaking = this.listeners.voiceSpeaking;

    this.listeners = {
      worldInit: [],
      playerJoined: [],
      playerMoved: [],
      playerLeft: [],
      chatBroadcast: [],
      playerExpression: [],
      voiceStream: preservedVoiceStream,
      voiceSpeaking: preservedVoiceSpeaking,
    };

    if (this.socket) {
      this.socket.off('world:init');
      this.socket.off('player:joined');
      this.socket.off('player:moved');
      this.socket.off('player:left');
      this.socket.off('chat:broadcast');
      this.socket.off('player:expression');
      // Jangan matikan voice:stream dan voice:speaking
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
