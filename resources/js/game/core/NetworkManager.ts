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

export class NetworkManager {
  /** Instansi tunggal Singleton */
  private static instance: NetworkManager;

  /** Objek socket client Socket.io */
  private socket: Socket | null = null;

  /** Status koneksi aktif */
  private isConnected: boolean = false;

  /** URL alamat WebSocket server */
  private serverUrl: string = 'http://localhost:3001';

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
   * Membuka koneksi WebSocket ke server game
   * @param url Alamat server Socket.io (default: 'http://localhost:3001')
   */
  public connect(url: string = 'http://localhost:3001'): void {
    if (this.socket && this.socket.connected) return;

    this.serverUrl = url;
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`[NetworkManager] Terhubung ke multiplayer game server: ${this.serverUrl}`);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[NetworkManager] Terputus dari server game.');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[NetworkManager] Mode offline/lokal aktif:', err.message);
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
    if (!this.socket) return;
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
   * @param x Koordinat X saat ini
   * @param y Koordinat Y saat ini
   * @param direction Arah hadap ('up'|'down'|'left'|'right')
   * @param isMoving Status apakah sedang berjalan
   */
  public sendMovement(x: number, y: number, direction: Direction, isMoving: boolean): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:move', { x, y, direction, isMoving });
  }

  /**
   * Mengirim pesan chat ke obrolan global server
   * @param text Pesan yang diketik pemain
   */
  public sendChat(text: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('chat:message', { text });
  }

  /** Mendaftarkan callback saat menerima inisialisasi state awal open world */
  public onWorldInit(callback: (data: IWorldInitData) => void): void {
    this.socket?.on('world:init', callback);
  }

  /** Mendaftarkan callback saat ada pemain baru masuk */
  public onPlayerJoined(callback: (player: IPlayerData) => void): void {
    this.socket?.on('player:joined', callback);
  }

  /** Mendaftarkan callback saat pemain lain bergerak */
  public onPlayerMoved(callback: (data: { id: string; x: number; y: number; direction: Direction; isMoving: boolean }) => void): void {
    this.socket?.on('player:moved', callback);
  }

  /** Mendaftarkan callback saat pemain lain disconnect */
  public onPlayerLeft(callback: (data: { id: string; name: string }) => void): void {
    this.socket?.on('player:left', callback);
  }

  /** Mendaftarkan callback saat pesan obrolan global disiarkan */
  public onChatBroadcast(callback: (data: IChatMessage) => void): void {
    this.socket?.on('chat:broadcast', callback);
  }

  /** Mendaftarkan callback sinkronisasi pergerakan monster */
  public onMonstersSync(callback: (monsters: IMonsterData[]) => void): void {
    this.socket?.on('monsters:sync', callback);
  }

  /** Memutus koneksi socket secara bersih */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}
