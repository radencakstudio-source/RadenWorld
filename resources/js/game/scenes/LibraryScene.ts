/**
 * ============================================================================
 * FILE: resources/js/game/scenes/LibraryScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Interior Perpustakaan Kota RadenWorld (Pusat Literasi Barat).
 * 
 * SPESIFIKASI:
 * 1. Skala Grid Presisi: 1 Grid = 120px x 120px (16 x 11 petak = 1920px x 1320px).
 * 2. Lantai Parquet Walnut Elegan dengan Karpet Hijau Zamrud (Emerald Runner) di Lorong Utama.
 * 3. Meja Informasi & Pustakawati Siti (gy: 2, gx: 6.5..9.5):
 *    - Pustakawati Siti ramah menyapa pengunjung.
 *    - Komputer katalog buku & kotak pengembalian buku pinjaman.
 * 4. Seksi Lemari Buku Pas Sesuai Grid:
 *    - SEKSI SD (gx: 1.5..4.5, gy: 4 & gy: 7): Merah Klasik (+20 EXP).
 *    - SEKSI SMP (gx: 11.5..14.5, gy: 4): Biru Edukasi (+35 EXP).
 *    - SEKSI SMA (gx: 11.5..14.5, gy: 7): Hijau Zamrud (+50 EXP).
 *    - Berisi materi pelajaran sekolah lengkap dan kutipan edukatif inspiratif.
 * 5. Meja Belajar Utama (Reading Desks) di Tengah (gy: 5 & gy: 8):
 *    - Dilengkapi Banker's Lamp kuningan berkap hijau zamrud.
 *    - Tumpukan buku terbuka, pena bulu & laptop mahasiswa.
 * 6. Pintu Keluar: Terhubung kembali ke WorldScene di depan Perpustakaan (x: 1740, y: 3180).
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { CameraController } from '../controllers/CameraController';
import { IAvatarCustomization, IPlayerData } from '../types';

interface IBookshelfZone {
  x: number;
  y: number;
  category: 'sd' | 'smp' | 'sma';
  title: string;
  details: string[];
  expGain: number;
}

export class LibraryScene extends Phaser.Scene {
  private player: Player | null = null;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private networkManager: NetworkManager;
  public cameraController!: CameraController;
  private currentAvatar: IAvatarCustomization;
  private playerName: string = 'Petualang';
  private lastX: number = -1;
  private lastY: number = -1;

  // Dimensi Ruangan Tepat 16x11 Grid @ 120px
  public readonly roomWidth: number = 1920;  // 16 petak x 120px
  public readonly roomHeight: number = 1320; // 11 petak x 120px
  public readonly tileSize: number = 120;

  // Zona Interaksi
  private exitDoorZone!: { x: number; y: number; width: number; height: number };
  private librarianZone!: { x: number; y: number };
  private bookshelfZones: IBookshelfZone[] = [];
  private activeShelf: IBookshelfZone | null = null;

  private returnX: number = 1740;
  private returnY: number = 3180;

  private activePrompt: string | null = null;
  private isTransitioning: boolean = false;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'LibraryScene' });
    this.networkManager = NetworkManager.getInstance();
    this.currentAvatar = {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  }

  public init(data?: {
    name?: string;
    avatar?: IAvatarCustomization;
    returnX?: number;
    returnY?: number;
  }): void {
    this.isTransitioning = false;
    this.player = null as any;
    this.remotePlayers.clear();

    if (data?.name) this.playerName = data.name;
    if (data?.avatar) this.currentAvatar = data.avatar;
    if (typeof data?.returnX === 'number') this.returnX = data.returnX;
    if (typeof data?.returnY === 'number') this.returnY = data.returnY;
  }

  public create(): void {
    // 0. Sisi luar ruangan (kiri, kanan, atas, bawah) diberi latar belakang cokelat hangat
    this.cameras.main.setBackgroundColor('#2c1810');
    const outerBg = this.add.graphics();
    outerBg.fillStyle(0x2c1810, 1);
    outerBg.fillRect(-3000, -3000, this.roomWidth + 6000, this.roomHeight + 6000);
    outerBg.setDepth(-999);

    // 1. Batas fisika ruangan
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.obstacles = this.physics.add.staticGroup();

    // 2. Siapkan tekstur lantai perpustakaan
    this.ensureLibraryTextures();

    // 3. Render Lantai Parquet Walnut Akademik
    this.add.tileSprite(0, 0, this.roomWidth, this.roomHeight, 'library-floor-tile')
      .setOrigin(0, 0)
      .setDepth(-100);

    // 4. Render Karpet Runner Hijau Zamrud (Emerald Runner) di Lorong Tengah (gx: 6..9)
    const carpet = this.add.graphics();
    carpet.fillStyle(0x064e3b, 0.95);
    carpet.fillRect(this.roomWidth / 2 - 180, 180, 360, this.roomHeight - 240);
    carpet.lineStyle(4, 0xf59e0b, 0.85);
    carpet.strokeRect(this.roomWidth / 2 - 180, 180, 360, this.roomHeight - 240);
    carpet.setDepth(-90);

    // 5. Render Dinding Atas Perpustakaan & Spanduk Kehormatan
    this.renderLibraryWalls();

    // 6. Render Meja Resepsionis & Pustakawati Siti (gy: 2)
    this.renderLibrarianDesk();

    // 7. Render Lemari Buku SD, SMP, SMA Sesuai Grid (Sisi Barat & Timur)
    this.renderClassifiedBookshelves();

    // 8. Render Meja Belajar Utama dengan Banker's Lamp di Lorong Tengah (gy: 5 & gy: 8)
    this.renderStudyReadingDesks();

    // 9. Render Aksesoris Sudut: Globe Antik & Model Kerangka
    this.renderCornerCuriosities();

    // 10. Render Pintu Keluar di Bagian Bawah Tengah (gx: 7.5, gy: 10)
    this.exitDoorZone = { x: this.roomWidth / 2, y: this.roomHeight - 60, width: 240, height: 120 };
    this.renderExitDoor();

    // 11. Spawn Pemain di Karpet Utama Dekat Pintu
    this.spawnPlayerInLibrary();

    // 12. Hubungkan ke Server Multiplayer Room 'library'
    const spawnX = this.player?.x || this.roomWidth / 2;
    const spawnY = this.player?.y || (this.roomHeight - 160);

    const isSuperAdmin = this.playerName?.toUpperCase() === 'RADEN';
    if (!this.networkManager.getSocketId()) {
      let savedGold = 2500;
      let savedDiamonds = 50;
      try {
        const g = localStorage.getItem('raden_player_gold');
        if (g) savedGold = parseInt(g, 10);
        const d = localStorage.getItem('raden_player_diamonds');
        if (d) savedDiamonds = parseInt(d, 10);
      } catch (e) {}

      this.networkManager.joinGame(
        this.playerName,
        this.currentAvatar,
        isSuperAdmin ? 'super_admin' : 'player',
        isSuperAdmin,
        spawnX,
        spawnY,
        'up',
        savedGold,
        savedDiamonds,
        'library'
      );
    } else {
      this.networkManager.switchRoom('library', spawnX, spawnY);
    }

    this.setupMultiplayerListeners();

    // Minta snapshot pemain yang sudah ada di room library
    this.time.delayedCall(150, () => this.networkManager.requestRoomPlayers());
    this.time.delayedCall(500, () => this.networkManager.requestRoomPlayers());
    this.time.delayedCall(1200, () => this.networkManager.requestRoomPlayers());

    // 13. Setup Kamera
    this.cameraController = new CameraController(this);
    if (this.player) {
      this.cameraController.follow(this.player);
      this.cameraController.setBounds(0, 0, this.roomWidth, this.roomHeight);
    }
    this.cameras.main.setZoom(1.0);

    // 14. Setup Input Keyboard & Klik
    this.setupInputs();

    // 15. Beritahu HUD lokasi saat ini
    EventBus.emit('location-updated', 'KAWASAN LITERASI: PERPUSTAKAAN KOTA (INTERIOR)');
    EventBus.emit('url-changed', '/world/perpustakaan');

    // 16. Pasang Event Bus
    const onSendChat = (text: string) => {
      if (this.player && this.player.active && this.player.scene) {
        this.player.showSpeechBubble(text);
      }
    };
    EventBus.on('send-chat', onSendChat);

    const onTriggerExpression = (data: { type: 'normal' | 'smile' | 'shock' | 'angry' }) => {
      if (this.player && this.player.active && this.player.scene) {
        this.player.triggerExpression(data.type);
      }
      this.networkManager.sendExpression(data.type);
    };
    EventBus.on('trigger-expression', onTriggerExpression);

    const onTriggerInteraction = () => {
      this.triggerCurrentInteraction();
    };
    EventBus.on('trigger-interaction', onTriggerInteraction);

    const onRemotePlayerUpdated = (data: { id: string; name?: string; avatar?: any; role?: string; isSuperAdmin?: boolean }) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        if (data.name) remote.setName(data.name);
        if (data.avatar) remote.setAvatar(data.avatar);
      }
    };
    EventBus.on('remote-player-updated', onRemotePlayerUpdated);

    const onUpdateLocalPlayerName = (newName: string) => {
      this.playerName = newName;
      if (this.player && this.player.active) {
        this.player.setName(newName);
      }
    };
    EventBus.on('update-player-name', onUpdateLocalPlayerName);

    const cleanupLibrary = () => {
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.off('trigger-interaction', onTriggerInteraction);
      EventBus.off('remote-player-updated', onRemotePlayerUpdated);
      EventBus.off('update-player-name', onUpdateLocalPlayerName);
      EventBus.emit('interaction-prompt', null);

      this.remotePlayers.forEach((r) => r.destroy());
      this.remotePlayers.clear();
    };

    this.events.once('shutdown', cleanupLibrary);
    this.events.once('destroy', cleanupLibrary);

    EventBus.emit('scene-ready', 'LibraryScene');
  }

  public update(time: number, delta: number): void {
    this.cameraController?.update(time, delta);
    if (!this.player || !this.player.active || this.isTransitioning) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y + 60);
    this.checkProximityPrompt();

    // Kirim posisi pergerakan pemain lokal ke server
    const isMoving = this.player.getIsMoving();
    if (isMoving || Math.abs(this.player.x - this.lastX) > 1 || Math.abs(this.player.y - this.lastY) > 1) {
      this.lastX = this.player.x;
      this.lastY = this.player.y;
      this.networkManager.sendMovement(
        this.player.x,
        this.player.y,
        this.player.getDirection(),
        isMoving
      );
    }

    // Perbarui posisi & animasi seluruh pemain lain di perpustakaan
    this.remotePlayers.forEach((remote) => {
      if (remote.active) {
        remote.update(time, delta);
        remote.setDepth(remote.y + 60);
      }
    });
  }

  /**
   * Helper penambahan rintangan fisik presisi grid
   */
  private addGridObstacle(gx: number, gy: number, gw: number, gh: number): Phaser.GameObjects.Zone {
    const ts = this.tileSize;
    const px = gx * ts + (gw * ts) / 2;
    const py = gy * ts + (gh * ts) / 2;
    const pw = gw * ts;
    const ph = gh * ts;

    const zone = this.add.zone(px, py, pw, ph);
    this.physics.add.existing(zone, true);
    this.obstacles.add(zone);
    return zone;
  }

  /**
   * Tekstur Lantai Parquet Kayu Walnut Perpustakaan
   */
  private ensureLibraryTextures(): void {
    if (!this.textures.exists('library-floor-tile')) {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 240, 240);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillRect(120, 120, 120, 120);

        ctx.fillStyle = '#334155';
        ctx.fillRect(120, 0, 120, 120);
        ctx.fillRect(0, 120, 120, 120);

        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, 120, 120);
        ctx.strokeRect(120, 0, 120, 120);
        ctx.strokeRect(0, 120, 120, 120);
        ctx.strokeRect(120, 120, 120, 120);

        this.textures.addCanvas('library-floor-tile', canvas);
      }
    }
  }

  /**
   * Render Dinding Perpustakaan Megah & Spanduk Utama
   */
  private renderLibraryWalls(): void {
    const ts = this.tileSize;
    const wallH = ts * 1.5; // 180px

    const wallG = this.add.graphics();
    wallG.fillStyle(0x090d16, 1);
    wallG.fillRect(0, 0, this.roomWidth, wallH);

    // List emas & safir dinding atas
    wallG.fillStyle(0x1e3a8a, 1);
    wallG.fillRect(0, wallH - 14, this.roomWidth, 14);
    wallG.fillStyle(0xf59e0b, 1);
    wallG.fillRect(0, wallH - 4, this.roomWidth, 4);
    wallG.setDepth(-80);

    // Batas Obstacle Dinding (Atas 2.2 baris petak / 264px penuh agar avatar tidak tertimpa dinding, Kiri, Kanan)
    this.addGridObstacle(0, 0, 16, 2.2);
    this.addGridObstacle(0, 0, 1, 11);
    this.addGridObstacle(15, 0, 1, 11);

    // Banner Utama Perpustakaan Kota
    const bannerG = this.add.graphics();
    bannerG.fillStyle(0x0284c7, 0.95);
    bannerG.fillRoundedRect(this.roomWidth / 2 - 340, 20, 680, 95, 12);
    bannerG.lineStyle(3, 0x38bdf8, 1);
    bannerG.strokeRoundedRect(this.roomWidth / 2 - 336, 24, 672, 87, 10);
    bannerG.setDepth(-60);

    this.add.text(this.roomWidth / 2, 54, '🏛️ PERPUSTAKAAN KOTA RADENWORLD 📚', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(-55);

    this.add.text(this.roomWidth / 2, 84, 'PUSAT LITERASI PENDIDIKAN • MATERI TERAKREDITASI SD, SMP & SMA', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '10px',
      color: '#bae6fd',
      letterSpacing: 2,
    }).setOrigin(0.5, 0.5).setDepth(-55);
  }

  /**
   * Render Meja Resepsionis & Pustakawati Siti (gx: 6.5..9.5, gy: 2)
   */
  private renderLibrarianDesk(): void {
    const ts = this.tileSize;
    const deskX = this.roomWidth / 2;
    const deskY = 2 * ts + ts / 2; // y: 300
    const deskW = 420;
    const deskH = 90;

    this.librarianZone = { x: deskX, y: deskY + 65 };

    // Body Meja Resepsionis
    const deskG = this.add.graphics();
    deskG.fillStyle(0x030712, 0.5);
    deskG.fillRoundedRect(deskX - deskW / 2, deskY + 25, deskW, 20, 6);

    deskG.fillStyle(0x3e2723, 1);
    deskG.fillRoundedRect(deskX - deskW / 2, deskY - deskH / 2, deskW, deskH, 8);
    deskG.fillStyle(0x5d4037, 1);
    deskG.fillRoundedRect(deskX - deskW / 2, deskY - deskH / 2, deskW, 24, 6);
    deskG.fillStyle(0xf59e0b, 1);
    deskG.fillRect(deskX - deskW / 2, deskY - deskH / 2 + 20, deskW, 4);

    // Komputer Monitor Resepsionis
    deskG.fillStyle(0x1e293b, 1);
    deskG.fillRoundedRect(deskX - 120, deskY - 32, 50, 34, 4);
    deskG.fillStyle(0x38bdf8, 1);
    deskG.fillRect(deskX - 112, deskY - 26, 34, 18);

    // Tumpukan Buku Kembali di Meja
    deskG.fillStyle(0xef4444, 1);
    deskG.fillRoundedRect(deskX + 90, deskY - 18, 44, 10, 2);
    deskG.fillStyle(0x3b82f6, 1);
    deskG.fillRoundedRect(deskX + 92, deskY - 28, 40, 10, 2);
    deskG.fillStyle(0x10b981, 1);
    deskG.fillRoundedRect(deskX + 94, deskY - 38, 36, 10, 2);

    deskG.setDepth(deskY);

    // Pustakawati Siti NPC di Belakang Meja
    const librarian = this.add.image(deskX, deskY - 45, 'npc-penjaga-pasar')
      .setDisplaySize(92, 164)
      .setDepth(deskY - 10);

    this.add.text(deskX, deskY - 130, '👩‍💼 Pustakawati Siti', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '12px',
      color: '#fef08a',
      backgroundColor: '#000000dd',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0.5).setDepth(deskY + 10);

    // Obstacle Meja Resepsionis
    const obs = this.add.zone(deskX, deskY, deskW, deskH);
    this.physics.add.existing(obs, true);
    this.obstacles.add(obs);
  }

  /**
   * Render Lemari Buku Sesuai Grid:
   * 1. Seksi SD: gx: 1.5..4.5 pada gy: 4 & gy: 7
   * 2. Seksi SMP: gx: 11.5..14.5 pada gy: 4
   * 3. Seksi SMA: gx: 11.5..14.5 pada gy: 7
   */
  private renderClassifiedBookshelves(): void {
    const ts = this.tileSize;
    this.bookshelfZones = [];

    // ========================================================================
    // 1. SEKSI MATERI SD (Sisi Barat / Kiri: gx: 1.5 s/d 4.5)
    // ========================================================================
    this.renderCategoryHeader(360, 3.2 * ts, '🔴 SEKSI BUKU SD (KELAS 1-6)', '#ef4444');

    const sdDetails = [
      '📖 Matematika Dasar: Perkalian Cepat, Pecahan Senilai & Luas Bangun Datar',
      '🌱 IPA Alam Sekitar: Fotosintesis Daun Hijau, Rantai Makanan & Siklus Air Hujan',
      '🇮🇩 Bahasa Indonesia: Membaca Puisi Indah, Menulis Karangan & Huruf Kapital',
      '📜 Cerita Nusantara: Legenda Candi Prambanan, Danau Toba & Si Kancil Cerdik',
    ];

    // Baris SD 1 (gy: 4, y: 480..600)
    this.renderLongBookshelf(1.5, 4, 3, 'sd', 0xef4444);
    this.bookshelfZones.push({
      x: 3 * ts,
      y: 4.8 * ts,
      category: 'sd',
      title: 'Rak Buku Materi SD: Berhitung & IPA Dasar',
      details: sdDetails,
      expGain: 20,
    });

    // Baris SD 2 (gy: 7, y: 840..960)
    this.renderLongBookshelf(1.5, 7, 3, 'sd', 0xef4444);
    this.bookshelfZones.push({
      x: 3 * ts,
      y: 7.8 * ts,
      category: 'sd',
      title: 'Rak Buku Dongeng & Bahasa Indonesia SD',
      details: sdDetails,
      expGain: 20,
    });

    // ========================================================================
    // 2. SEKSI MATERI SMP (Sisi Timur / Kanan Atas: gx: 11.5 s/d 14.5, gy: 4)
    // ========================================================================
    this.renderCategoryHeader(this.roomWidth - 360, 3.2 * ts, '🔵 SEKSI BUKU SMP (KELAS 7-9)', '#3b82f6');

    const smpDetails = [
      '📐 Aljabar & Geometri: Persamaan Kuadrat, Dalil Pythagoras & Peluang Statistik',
      '🔬 Biologi Makhluk Hidup: Pembelahan Sel Mitosis, Sistem Pencernaan & Genetika',
      '⚡ Fisika Terapan: Hukum Gerak Newton, Tekanan Zat Cair & Gelombang Bunyi',
      '🌏 IPS & Geografi: Pergerakan Lempeng Bumi, Iklim Tropis & Jalur Sutra Maritim',
    ];

    this.renderLongBookshelf(11.5, 4, 3, 'smp', 0x3b82f6);
    this.bookshelfZones.push({
      x: 13 * ts,
      y: 4.8 * ts,
      category: 'smp',
      title: 'Rak Buku Sains & Matematika SMP',
      details: smpDetails,
      expGain: 35,
    });

    // ========================================================================
    // 3. SEKSI MATERI SMA (Sisi Timur / Kanan Bawah: gx: 11.5 s/d 14.5, gy: 7)
    // ========================================================================
    this.renderCategoryHeader(this.roomWidth - 360, 6.2 * ts, '🟢 SEKSI BUKU SMA (KELAS 10-12)', '#10b981');

    const smaDetails = [
      '📊 Kalkulus Lanjut: Limit Fungsi, Turunan Diferensial & Integral Parsial',
      '🧪 Kimia Organik: Ikatan Kovalen, Reaksi Esterifikasi & Tabel Periodik Unsur',
      '🔭 Fisika Modern & Relativitas: Efek Fotolistrik Einstein & Struktur Atom Bohr',
      '📈 Ekonomi & Sosiologi: Elastisitas Pasar, Kebijakan Fiskal Moneter & Teori Sosial',
    ];

    this.renderLongBookshelf(11.5, 7, 3, 'sma', 0x10b981);
    this.bookshelfZones.push({
      x: 13 * ts,
      y: 7.8 * ts,
      category: 'sma',
      title: 'Rak Ensiklopedia & Kalkulus Lanjut SMA',
      details: smaDetails,
      expGain: 50,
    });
  }

  /**
   * Header Penanda Kategori Seksi Buku
   */
  private renderCategoryHeader(x: number, y: number, text: string, color: string): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.9);
    bg.fillRoundedRect(x - 140, y - 16, 280, 32, 6);
    bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.9);
    bg.strokeRoundedRect(x - 140, y - 16, 280, 32, 6);
    bg.setDepth(y);

    this.add.text(x, y, text, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '12px',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(y + 5);
  }

  /**
   * Render Lemari Buku Panjang Modular (3 Petak Grid)
   */
  private renderLongBookshelf(gx: number, gy: number, gw: number, type: 'sd' | 'smp' | 'sma', accentColor: number): void {
    const ts = this.tileSize;
    const startX = gx * ts;
    const startY = gy * ts;
    const totalW = gw * ts;
    const shelfH = ts;

    const g = this.add.graphics();
    // Bayangan
    g.fillStyle(0x020617, 0.5);
    g.fillRoundedRect(startX, startY + shelfH - 10, totalW, 20, 6);

    // Lemari Kayu Jati Tua
    g.fillStyle(0x271711, 1);
    g.fillRoundedRect(startX, startY, totalW, shelfH, 6);
    g.fillStyle(0x451a03, 1);
    g.fillRect(startX + 8, startY + 8, totalW - 16, shelfH - 16);

    // Rak Tingkat 1 & Tingkat 2
    g.fillStyle(0x78350f, 1);
    g.fillRect(startX + 8, startY + shelfH / 2 - 4, totalW - 16, 8); // Papan sekat tengah

    // Deretan Buku Warna-Warni Berdiri Rapi
    for (let x = startX + 16; x < startX + totalW - 20; x += 18) {
      // Baris atas
      g.fillStyle(accentColor, 0.9);
      g.fillRect(x, startY + 14, 14, shelfH / 2 - 20);
      g.fillStyle(0xfef08a, 0.8);
      g.fillRect(x + 2, startY + 22, 10, 3); // Pita judul emas

      // Baris bawah
      g.fillStyle(x % 36 === 0 ? accentColor : 0x475569, 0.9);
      g.fillRect(x, startY + shelfH / 2 + 8, 14, shelfH / 2 - 22);
    }

    // List border keemasan
    g.lineStyle(2, 0xd97706, 0.8);
    g.strokeRoundedRect(startX, startY, totalW, shelfH, 6);
    g.setDepth(startY + shelfH);

    // Daftarkan Obstacle Fisik Grid
    this.addGridObstacle(gx, gy, gw, 1);
  }

  /**
   * Render Meja Belajar Panjang (Reading Desk) dengan Banker's Lamp di Tengah
   * Posisi: gx: 6.5..9.5 pada gy: 5 & gy: 8
   */
  private renderStudyReadingDesks(): void {
    const ts = this.tileSize;

    const deskRows = [
      { gy: 5.2 },
      { gy: 8.2 },
    ];

    deskRows.forEach(({ gy }) => {
      const startX = 6.8 * ts;
      const startY = gy * ts;
      const deskW = 3 * ts - 40;
      const deskH = ts - 20;
      const centerX = startX + deskW / 2;
      const centerY = startY + deskH / 2;

      // Karpet meja belajar
      const rug = this.add.graphics();
      rug.fillStyle(0x1e293b, 0.6);
      rug.fillRoundedRect(startX - 20, startY - 20, deskW + 40, deskH + 40, 10);
      rug.setDepth(centerY - 30);

      // Meja Oak Cokelat Solid
      const dg = this.add.graphics();
      dg.fillStyle(0x020617, 0.45);
      dg.fillRoundedRect(startX, startY + deskH - 8, deskW, 16, 6); // Shadow

      dg.fillStyle(0x3e2723, 1);
      dg.fillRoundedRect(startX, startY, deskW, deskH, 8);
      dg.fillStyle(0x5d4037, 1);
      dg.fillRect(startX + 8, startY + 8, deskW - 16, deskH - 16);

      // Kursi Belajar Atas & Bawah Meja
      this.renderStudyChair(centerX - 80, startY - 20, 'down');
      this.renderStudyChair(centerX + 80, startY - 20, 'down');
      this.renderStudyChair(centerX - 80, startY + deskH + 10, 'up');
      this.renderStudyChair(centerX + 80, startY + deskH + 10, 'up');

      // Banker's Lamp Klasik Hijau Zamrud di Tengah Meja
      this.renderBankersLamp(centerX - 60, centerY - 6);
      this.renderBankersLamp(centerX + 60, centerY - 6);

      // Buku Terbuka & Catatan Belajar di Meja
      dg.fillStyle(0xffffff, 0.95);
      dg.fillRect(centerX - 20, centerY - 12, 40, 24); // Buku terbuka
      dg.fillStyle(0x94a3b8, 1);
      dg.fillRect(centerX - 1, centerY - 12, 2, 24); // Lipatan tengah

      dg.setDepth(centerY + 20);

      // Obstacle Meja Belajar
      const obs = this.add.zone(centerX, centerY, deskW, deskH);
      this.physics.add.existing(obs, true);
      this.obstacles.add(obs);
    });
  }

  /**
   * Render Banker's Lamp Kuningan Klasik dengan Kap Kaca Hijau Zamrud
   */
  private renderBankersLamp(x: number, y: number): void {
    const lg = this.add.graphics();
    // Tiang kuningan
    lg.fillStyle(0xd97706, 1);
    lg.fillCircle(x, y + 10, 6); // Dudukan
    lg.fillRect(x - 2, y - 6, 4, 16); // Tiang

    // Kap kaca zamrud hijau
    lg.fillStyle(0x047857, 1);
    lg.fillRoundedRect(x - 16, y - 14, 32, 12, 4);
    lg.fillStyle(0x34d399, 1);
    lg.fillRect(x - 12, y - 6, 24, 3); // Pijar lampu

    // Cahaya temaram lembut di atas meja
    lg.fillStyle(0x6ee7b7, 0.12);
    lg.fillCircle(x, y + 6, 45);
    lg.setDepth(y + 25);
  }

  /**
   * Render Kursi Belajar Kayu Ergonomis
   */
  private renderStudyChair(x: number, y: number, dir: 'up' | 'down'): void {
    const cg = this.add.graphics();
    cg.fillStyle(0x1c1917, 1);
    cg.fillRoundedRect(x - 16, y - 16, 32, 32, 4);
    cg.fillStyle(0x78350f, 1);
    cg.fillRoundedRect(x - 13, y - 13, 26, 26, 3);

    // Sandaran
    cg.fillStyle(0x451a03, 1);
    if (dir === 'down') {
      cg.fillRect(x - 16, y - 18, 32, 6);
    } else {
      cg.fillRect(x - 16, y + 12, 32, 6);
    }
    cg.setDepth(y);
  }

  /**
   * Render Ornamen Sudut: Globe Antik di Kiri, Model Kerangka di Kanan
   */
  private renderCornerCuriosities(): void {
    const ts = this.tileSize;

    // 1. Globe Antik Berputar di Sudut Kiri (gx: 1.5, gy: 2)
    const gx = 1.5 * ts;
    const gy = 2.4 * ts;
    const gG = this.add.graphics();
    gG.fillStyle(0x020617, 0.4);
    gG.fillEllipse(gx, gy + 20, 36, 12);

    gG.fillStyle(0x78350f, 1);
    gG.fillRect(gx - 4, gy - 10, 8, 28); // Tiang
    gG.fillCircle(gx, gy + 18, 12); // Piringan

    // Bola Globe Bumi
    gG.fillStyle(0x0284c7, 1);
    gG.fillCircle(gx, gy - 16, 18);
    gG.fillStyle(0x22c55e, 1);
    gG.fillCircle(gx - 4, gy - 20, 8); // Benua
    gG.fillCircle(gx + 6, gy - 14, 7);
    gG.lineStyle(2, 0xf59e0b, 1);
    gG.strokeCircle(gx, gy - 16, 22); // Cincin equator
    gG.setDepth(gy);

    this.addGridObstacle(1, 2, 1, 1);

    // 2. Model Kerangka Anatomi Edukatif di Sudut Kanan (gx: 14.5, gy: 2)
    const sx = 14.5 * ts;
    const sy = 2.4 * ts;
    const sG = this.add.graphics();
    sG.fillStyle(0x020617, 0.4);
    sG.fillEllipse(sx, sy + 22, 36, 12);

    sG.fillStyle(0x475569, 1);
    sG.fillRect(sx - 3, sy - 20, 6, 40); // Tiang gantung

    sG.fillStyle(0xf1f5f9, 1);
    sG.fillCircle(sx, sy - 28, 9); // Tengkorak kepala
    sG.fillRect(sx - 8, sy - 18, 16, 20); // Tulang rusuk
    sG.fillRect(sx - 6, sy + 4, 4, 18); // Kaki
    sG.fillRect(sx + 2, sy + 4, 4, 18);
    sG.setDepth(sy);

    this.addGridObstacle(14, 2, 1, 1);
  }

  /**
   * Render Pintu Keluar di Bawah Tengah (gx: 7..8, gy: 10)
   */
  private renderExitDoor(): void {
    const doorX = this.exitDoorZone.x;
    const doorY = this.exitDoorZone.y;

    // Karpet penyambutan pintu keluar
    const rug = this.add.graphics();
    rug.fillStyle(0x064e3b, 0.9);
    rug.fillRect(doorX - 100, doorY - 140, 200, 140);
    rug.lineStyle(3, 0xf59e0b, 0.9);
    rug.strokeRect(doorX - 100, doorY - 140, 200, 140);
    rug.setDepth(-50);

    const doorG = this.add.graphics();
    doorG.fillStyle(0x0f172a, 0.95);
    doorG.fillRoundedRect(doorX - 90, doorY - 24, 180, 48, 8);
    doorG.lineStyle(3, 0x38bdf8, 1);
    doorG.strokeRoundedRect(doorX - 90, doorY - 24, 180, 48, 8);
    doorG.setDepth(doorY - 5);

    this.add.text(doorX, doorY, '🚪 PINTU KELUAR KE KOTA', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '12px',
      color: '#e0f2fe',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(doorY);

    // Dinding Bawah Kiri & Kanan (Menyisakan celah pintu gx: 7..8)
    const btmLeftW = doorX - 110;
    const btmLeft = this.add.zone(btmLeftW / 2, this.roomHeight - 15, btmLeftW, 30);
    this.physics.add.existing(btmLeft, true);
    this.obstacles.add(btmLeft);

    const btmRightX = doorX + 110;
    const btmRightW = this.roomWidth - btmRightX;
    const btmRight = this.add.zone(btmRightX + btmRightW / 2, this.roomHeight - 15, btmRightW, 30);
    this.physics.add.existing(btmRight, true);
    this.obstacles.add(btmRight);
  }

  /**
   * Spawn Pemain di Karpet Tengah Dekat Pintu Menghadap ke Meja Pustakawan
   */
  private spawnPlayerInLibrary(): void {
    const spawnX = this.roomWidth / 2; // 960 (Tengah)
    const spawnY = this.roomHeight - 160;

    this.player = new Player(
      this,
      spawnX,
      spawnY,
      'local_player',
      this.playerName,
      this.currentAvatar,
      100,
      100
    );
    this.player.setDirection('up');
    this.physics.add.collider(this.player, this.obstacles);

    this.player.showSpeechBubble('📚 Suasana perpustakaan tenang dan wangi buku baru. Mari membaca materi! ✨', 3000);
  }

  /**
   * Setup Keyboard & Pointer Click Controls
   */
  private setupInputs(): void {
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if ((window as any).__radenPinching || Date.now() - ((window as any).__radenLastPinchTime || 0) < 400) {
        if (this.player && this.player.active) this.player.stopNavigation();
        return;
      }
      if ((pointer.event as TouchEvent)?.touches?.length >= 2) {
        if (this.player && this.player.active) this.player.stopNavigation();
        return;
      }
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (pointer.rightButtonDown()) return;
      if (this.player?.isMovementLocked()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;
      if (wx < 60 || wx > this.roomWidth - 60 || wy < 60 || wy > this.roomHeight - 60) return;

      // 1. Cek apakah pemain menekan/mengklik pemain lain di perpustakaan (Remote Player)
      for (const [rId, remote] of this.remotePlayers.entries()) {
        const dx = Math.abs(wx - remote.x);
        const dy = wy - remote.y;
        if (dx < 65 && dy > -190 && dy < 45) {
          SoundManager.getInstance().playClick();
          const raw = (remote as any).getRawPlayerData?.() || {};
          const isTargetAdmin = Boolean(
            raw.isSuperAdmin ||
            raw.role === 'super_admin' ||
            raw.role === 'admin' ||
            remote.getEntityName?.()?.trim()?.toUpperCase() === 'RADEN'
          );
          EventBus.emit('inspect-player-profile', {
            id: remote.getEntityId?.() || rId,
            name: remote.getEntityName?.() || 'Pemain',
            avatar: remote.getAvatar?.(),
            gender: remote.getGender?.(),
            level: isTargetAdmin ? 99999999999 : (raw.level || 1),
            role: isTargetAdmin ? 'super_admin' : (raw.role || 'player'),
            isSuperAdmin: isTargetAdmin,
            title: isTargetAdmin ? '👑 KREATOR & SUPER ADMIN' : (raw.title || 'Petualang'),
            likes: isTargetAdmin ? 99999999999 : (typeof raw.likes === 'number' ? raw.likes : 12),
            friendsCount: isTargetAdmin ? 999 : (raw.friendsCount ?? 0),
            followingCount: isTargetAdmin ? 999 : (raw.followingCount ?? 0),
            followersCount: isTargetAdmin ? 999 : (raw.followersCount ?? 0),
            bio: raw.bio || raw.description || 'Sedang tekun membaca materi di Perpustakaan Kota 📚',
            location: 'Perpustakaan Kota',
            gold: isTargetAdmin ? 99999999999 : 2500,
            diamonds: isTargetAdmin ? 99999999999 : 50,
          });
          return;
        }
      }

      if (this.player && this.player.active) {
        this.spawnTapRipple(wx, wy);
        this.player.navigateTo(wx, wy);
      }
    });
  }

  /**
   * Cek Prompt Interaksi Jarak Dekat
   */
  private checkProximityPrompt(): void {
    if (!this.player) return;

    const px = this.player.x;
    const py = this.player.y;

    const distExit = Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y);
    const distLib = Phaser.Math.Distance.Between(px, py, this.librarianZone.x, this.librarianZone.y);

    let prompt: string | null = null;
    this.activeShelf = null;

    if (distExit < 140) {
      prompt = 'TEKAN [E] / KLIK UNTUK KEMBALI KE KOTA 🚪';
    } else if (distLib < 140) {
      prompt = 'TEKAN [E] / KLIK UNTUK BICARA DENGAN PUSTAKAWATI SITI 👩‍💼';
    } else {
      // Periksa rak buku terdekat
      for (const shelf of this.bookshelfZones) {
        const dist = Phaser.Math.Distance.Between(px, py, shelf.x, shelf.y);
        if (dist < 150) {
          const catLabel = shelf.category.toUpperCase();
          prompt = `TEKAN [E] / KLIK BACA BUKU MATERI ${catLabel} 📖 (+${shelf.expGain} EXP)`;
          this.activeShelf = shelf;
          break;
        }
      }
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }
  }

  /**
   * Eksekusi Interaksi Tombol [E]
   */
  private triggerCurrentInteraction(): void {
    if (!this.player || this.isTransitioning) return;

    const px = this.player.x;
    const py = this.player.y;

    const distExit = Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y);
    const distLib = Phaser.Math.Distance.Between(px, py, this.librarianZone.x, this.librarianZone.y);

    if (distExit < 150) {
      this.exitLibrary();
    } else if (distLib < 150) {
      SoundManager.getInstance().playClick();
      this.player.showSpeechBubble(
        '👩‍💼 Siti: "Selamat datang di Perpustakaan Kota! Buku di sisi kiri untuk SD, dan sisi kanan untuk SMP & SMA. Selamat membaca!"',
        4000
      );
    } else if (this.activeShelf) {
      const shelf = this.activeShelf;
      SoundManager.getInstance().playSuccess();

      // Pilih kutipan materi secara acak
      const detail = shelf.details[Math.floor(Math.random() * shelf.details.length)];
      this.player.showSpeechBubble(`📖 Membaca Materi ${shelf.category.toUpperCase()}:\n${detail} (+${shelf.expGain} EXP)`, 4000);

      // Berikan reward EXP ke sistem game
      EventBus.emit('gain-exp', { amount: shelf.expGain, source: `Membaca Buku ${shelf.category.toUpperCase()}` });
      EventBus.emit('new-chat-message', {
        id: `lib_read_${Date.now()}`,
        sender: 'PERPUSTAKAAN KOTA',
        text: `📚 Kamu tekun membaca ${shelf.title}! Wawasanmu bertambah (+${shelf.expGain} EXP).`,
        timestamp: Date.now(),
        isSystem: true,
      });
    }
  }

  /**
   * Kembali ke WorldScene di Depan Perpustakaan
   */
  private exitLibrary(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    SoundManager.getInstance().playClick();
    this.player?.showSpeechBubble('Keluar ke kota...', 1000);

    // Berpindah kembali ke room 'world' di server game
    this.networkManager.switchRoom('world', this.returnX, this.returnY + 60);

    this.time.delayedCall(300, () => {
      window.history.pushState(null, '', '/world');
      EventBus.emit('url-changed', '/world');
      this.cameras.main.stopFollow();
      this.scene.start('WorldScene', {
        name: this.player?.getEntityName() || this.playerName,
        avatar: this.player?.getAvatar() || this.currentAvatar,
        spawnPos: { x: this.returnX, y: this.returnY + 60 },
      });
    });
  }

  /**
   * Listener sinkronisasi jaringan antar pemain di dalam perpustakaan
   */
  private setupMultiplayerListeners(): void {
    this.networkManager.onWorldInit((data) => {
      if (data && data.players) {
        data.players.forEach((p) => {
          if (p.id !== this.networkManager.getSocketId()) {
            this.addRemotePlayer(p);
          }
        });
      }
    });

    this.networkManager.onPlayerJoined((p) => {
      if (p.id !== this.networkManager.getSocketId()) {
        this.addRemotePlayer(p);
      }
    });

    this.networkManager.onPlayerMoved((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.setNetworkState(data.x, data.y, data.direction, data.isMoving);
      }
    });

    this.networkManager.onPlayerJumped((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.triggerJump(data.jumpCount);
      }
    });

    this.networkManager.onPlayerLeft((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote) {
        remote.destroy();
        this.remotePlayers.delete(data.id);
      }
    });

    this.networkManager.onPlayerExpression((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.triggerExpression(data.type);
      }
    });

    this.networkManager.onPlayerAfk((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.setAfk(data.isAfk, data.durationSeconds);
      }
    });
  }

  /**
   * Menambahkan entitas pemain lain di perpustakaan
   */
  private addRemotePlayer(p: IPlayerData): void {
    if (this.remotePlayers.has(p.id)) {
      const existing = this.remotePlayers.get(p.id)!;
      existing.destroy();
      this.remotePlayers.delete(p.id);
    }

    for (const [existingId, existingRemote] of this.remotePlayers.entries()) {
      if (existingRemote.getEntityName().trim().toLowerCase() === p.name.trim().toLowerCase()) {
        existingRemote.destroy();
        this.remotePlayers.delete(existingId);
      }
    }

    try {
      const remote = new RemotePlayer(
        this,
        p.x,
        p.y,
        p.id,
        p.name,
        p.avatar || {
          gender: 'male',
          skinColor: '#fed7aa',
          shirtColor: '#2563eb',
          pantsColor: '#1e293b',
          hatType: 'none',
        },
        p.hp || 100,
        p.maxHp || 100
      );
      remote.setRawPlayerData(p);

      remote.makeClickable(() => {
        SoundManager.getInstance().playClick();
        const isTargetAdmin = Boolean(
          p.isSuperAdmin ||
          p.role === 'super_admin' ||
          p.role === 'admin' ||
          p.name?.trim()?.toUpperCase() === 'RADEN'
        );
        EventBus.emit('inspect-player-profile', {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          level: isTargetAdmin ? 99999999999 : ((p as any).level || 1),
          role: isTargetAdmin ? 'super_admin' : (p.role || 'player'),
          isSuperAdmin: isTargetAdmin,
          title: isTargetAdmin ? '👑 KREATOR & SUPER ADMIN' : ((p as any).title || 'Petualang'),
          likes: isTargetAdmin ? 99999999999 : (typeof (p as any).likes === 'number' ? (p as any).likes : 12),
          friendsCount: isTargetAdmin ? 999 : ((p as any).friendsCount ?? 0),
          followingCount: isTargetAdmin ? 999 : ((p as any).followingCount ?? 0),
          followersCount: isTargetAdmin ? 999 : ((p as any).followersCount ?? 0),
          bio: (p as any).bio || (p as any).description || 'Sedang tekun membaca materi di Perpustakaan Kota 📚',
          location: 'Perpustakaan Kota',
          gold: isTargetAdmin ? 99999999999 : (typeof p.gold === 'number' ? p.gold : 2500),
          diamonds: isTargetAdmin ? 99999999999 : (typeof p.diamonds === 'number' ? p.diamonds : 50),
        });
      });

      this.remotePlayers.set(p.id, remote);
    } catch (err) {
      console.warn('[LibraryScene] Gagal menambahkan remote player:', err);
    }
  }

  private spawnTapRipple(x: number, y: number): void {
    const circle = this.add.circle(x, y, 6, 0x38bdf8, 0.85).setDepth(2000);
    this.tweens.add({
      targets: circle,
      radius: 26,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => circle.destroy(),
    });
  }
}
