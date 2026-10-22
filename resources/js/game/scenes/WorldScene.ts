/**
 * ============================================================================
 * FILE: resources/js/game/scenes/WorldScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene 2D Open World Multiplayer luas (9600x9600 pixel, 80x80 petak grid 120px)
 * Direkonstruksi 100% presisi mengikuti Blueprint Peta Dunia (media_1792299117046.png):
 *
 * TATA LETAK ZONA DUNIA (80x80 Petak @ 120px):
 * 1. UTARA BARAT (gx: 0..21, gy: 0..13):
 *    - Kawasan Residensial Asri Rumput Catur Hijau (world-checker-tile)
 *    - Rumah Pemain Modern (house-5x5, gx: 9, gy: 2) dengan pekarangan & deretan pohon
 *    - Pintu Rumah di (1380, 840) & Titik Spawn Utama di (1380, 960)
 * 2. UTARA PUSAT (gx: 22..54, gy: 0..13):
 *    - Pelataran Granit Kompleks Pendidikan
 *    - 3 Gedung Sekolah Berjejer (SD Merah gx: 26, SMP Biru gx: 34, SMA Cyan gx: 42)
 *    - Deretan Tong Sampah Daur Ulang 6 Kategori (Organik, Plastik, Kertas, Logam, B3, Umum)
 *    - Guru SD, Guru SMP, Guru SMA menyambut di depan gedung
 * 3. UTARA TIMUR (gx: 55..80, gy: 0..13):
 *    - Hamparan Sawah & Pertanian Terasering Hijau-Kekuningan Subur (farm-checker-tile)
 *    - Pak Tani Joko berpatroli merawat tanaman padi
 * 4. BARAT KOMERSIAL (gx: 0..19, gy: 14..63):
 *    - 3 Gedung Megah Berjejer Vertikal (Masing-masing 18x11 petak @ 120px):
 *      a. CAFE (building-cafe, gy: 17..27) - Pintu di (1080, 3360)
 *      b. RUMAH SAKIT (building-hospital, gy: 31..41) - Pintu di (1080, 5040) - Pulihkan HP 100%
 *      c. BANK SENTRAL (building-bank, gy: 45..55) - Pintu di (1080, 6720)
 *    - Trotoar lebar pejalan kaki & lampu jalan di sepanjang sisi timur gedung
 *    - Suster Maya & Bang Tohir menyambut warga
 * 5. JALAN RAYA ASPAL & TROTOAR LINGKAR (gx: 20..21, gy: 14..15, gx: 58..59, gy: 62..63):
 *    - 2 Petak Aspal Charcoal Murni, Marka Kuning Putus-Putus, Tepi Putih Seamless,
 *      dan Zebra Cross di setiap gerbang fasilitas utama
 * 6. CENTRAL PLAZA / ALUN-ALUN KOTA (gx: 22..57, gy: 16..61):
 *    - Lantai Granit Alun-Alun Paving (tile-trotoar-alunalun)
 *    - Pojok Barat Laut: Pujasera Kuliner (Gerobak Bakso Solo, Mie Ayam Jamur, Soto Lamongan)
 *      beserta 15 set Meja Makan & Kursi Plaza, didampingi Petugas Kebersihan & Polwan
 *    - Pojok Timur Laut: Panggung Hiburan Megah Berbintang Emas (plaza-stage, 10x8)
 *      didampingi Boni si Badut Ceria
 *    - Tengah Plaza: Landmark Ikonik Patung Lamongan Hiu & Lumba-Lumba (statue-lamongan, 5x10),
 *      diapit deretan Pagar Batu Hias & Kursi Taman, dijaga oleh Pak Polisi Bambang
 *    - Selatan Plaza: Gelanggang Olahraga Modern (Lapangan Basket 10x5 & Lapangan Sepak Bola 10x5)
 * 7. TIMUR BAHARI (gx: 60..80, gy: 14..64):
 *    - Teluk Lautan Kristal Biru Tua (water-checker-tile)
 *    - Tanggul Tepi Laut dengan 3 Dermaga Kayu/Beton Membentang Panjang (tile-trotoar-3)
 *    - Dermaga 1 (gy: 24..25), Dermaga 2 (gy: 38..39), Dermaga 3 (gy: 52..53)
 *    - Nelayan Danu memancing santai di ujung Dermaga 2
 * 8. SELATAN PANTAI (gx: 0..80, gy: 64..80):
 *    - Pantai Pasir Keemasan Membentang Luas (beach-checker-tile, gy: 64..77)
 *    - Samudra Laut Lepas Selatan (gy: 77..80) dengan rintangan fisik alami
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { CameraController } from '../controllers/CameraController';
import { IPlayerData, IChatMessage, IWorldInitData, IAvatarCustomization } from '../types';

interface INpcConfig {
  id: string;
  name: string;
  role: string;
  avatarType: 'sage' | 'blacksmith' | 'alchemist' | 'merchant' | 'guard' | 'fisherman' | 'farmer' | 'elder';
  avatarUrl?: string;
  x: number;
  y: number;
  greeting: string;
  dialogues: string[];
  spriteKey: string;
}

export class WorldScene extends Phaser.Scene {
  private player: Player | null = null;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private networkManager: NetworkManager;
  public cameraController!: CameraController;

  // Luas Peta Dunia Terbuka: Tepat 80x80 petak grid @ 120px = 9600x9600 pixel
  public worldWidth: number = 9600;
  public worldHeight: number = 9600;
  public readonly tileSize: number = 120;
  private customArchitectPropsGroup: (Phaser.GameObjects.Image | Phaser.GameObjects.GameObject)[] = [];
  private customArchitectTerrainsGroup: Phaser.GameObjects.Graphics[] = [];
  private customArchitectTerrainObstacles: Phaser.GameObjects.GameObject[] = [];

  private pendingPlayerName: string | null = null;
  private pendingAvatar: IAvatarCustomization | null = null;
  private spawnNearHouseDoor: boolean = false;
  private privateRoomId: string = 'safe-01';

  // Zona Bangunan & Pintu Interaktif (Sesuai Blueprint 100%)
  private playerHouseDoor = { x: 1380, y: 840 };  // gx: 11.5, gy: 7 (Rumah di Kiri Atas)
  private schoolSdDoor = { x: 3420, y: 1320 };    // gx: 28.5, gy: 11 (SD di Utara Pusat)
  private schoolSmpDoor = { x: 4380, y: 1320 };   // gx: 36.5, gy: 11 (SMP di Utara Pusat)
  private schoolSmaDoor = { x: 5340, y: 1320 };   // gx: 44.5, gy: 11 (SMA di Utara Pusat)
  private cafeDoor = { x: 2040, y: 2700 };        // gx: 17, gy: 22.5 (Cafe di Barat)
  private hospitalDoor = { x: 2040, y: 4620 };    // gx: 17, gy: 38.5 (RS di Barat)
  private bankDoor = { x: 2040, y: 6540 };        // gx: 17, gy: 54.5 (Bank di Barat)

  private customSpawnPos: { x: number; y: number } | null = null;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private lastPosSaveTime: number = 0;
  private lastGridX: number = -1;
  private lastGridY: number = -1;
  private lastLocationName: string = '';
  private doorCooldownUntil: number = 0;
  private isTransitioning: boolean = false;

  // Kontrol zoom kamera halus
  private targetZoom: number = 0.9;

  // Daftar NPC Interaktif (Dikosongkan sementara sesuai permintaan)
  private npcs: INpcConfig[] = [];

  // Kumpulan Awan Terapung Organik & Acak (Zero Baris, HD, Menggelapkan Karakter)
  private clouds: {
    sprite: Phaser.GameObjects.Image;
    speedX: number;
    speedY: number;
  }[] = [];

  // Efek Riak Ombak Air Laut Dinamis & Buih Ombak Pantai
  private waterWaves1: Phaser.GameObjects.TileSprite[] = [];
  private waterWaves2: Phaser.GameObjects.TileSprite[] = [];
  private shorelineSurfs: { sprite: Phaser.GameObjects.TileSprite; baseY?: number; isVertical?: boolean; baseX?: number }[] = [];

  constructor() {
    super({ key: 'WorldScene' });
    this.networkManager = NetworkManager.getInstance();
  }

  public init(data?: { name?: string; avatar?: IAvatarCustomization; spawnNearHouse?: boolean; privateRoomId?: string; spawnPos?: { x: number; y: number } }): void {
    this.isTransitioning = false;
    this.doorCooldownUntil = this.time ? this.time.now + 2500 : 0;
    this.player = null as any;

    if (data?.name) this.pendingPlayerName = data.name;
    if (data?.avatar) this.pendingAvatar = data.avatar;
    this.spawnNearHouseDoor = !!data?.spawnNearHouse;
    if (data?.privateRoomId) this.privateRoomId = data.privateRoomId;
    if (data?.spawnPos) this.customSpawnPos = data.spawnPos;
    else this.customSpawnPos = null;

    // Pastikan batas dunia selalu 80x80 petak = 9600x9600 pixel
    this.worldWidth = 9600;
    this.worldHeight = 9600;
  }

  public create(): void {
    // 1. Batas fisika dunia diperlebar mencakup buffer (2400px) agar koridor jalan bisa dilewati ke luar
    const buf = 2400;
    this.physics.world.setBounds(-buf, -buf, this.worldWidth + buf * 2, this.worldHeight + buf * 2);

    // 2. Inisialisasi grup rintangan fisik statis
    this.obstacles = this.physics.add.staticGroup();

    // 3. Masuk ke room 'world' pada WebSocket Server
    this.networkManager.switchRoom('world');

    // 4. Render lingkungan Open World 1:1 mengikuti Blueprint Peta
    this.createWorldEnvironment();

    // 5. Render seluruh NPC Interaktif di posisinya masing-masing
    this.createWorldNpcs();

    // 7. Pasang pendengar event multiplayer
    this.setupMultiplayerListeners();

    // 8. Tangani event sinyal dari UI React via EventBus
    const onServerSwitched = () => {
      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();
    };
    EventBus.on('server-switched', onServerSwitched);

    const onJoinGame = (userData: { name: string; avatar: IAvatarCustomization }) => {
      if (userData?.name) this.pendingPlayerName = userData.name;
      if (this.player) {
        this.player.setAvatar(userData.avatar);
        if (userData?.name) {
          this.player.setEntityName(userData.name);
        }
      } else {
        this.spawnLocalPlayer(userData.name, userData.avatar);
      }
    };
    EventBus.on('join-game', onJoinGame);

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

    const onEnterSchoolWithGrade = (data: { schoolType: 'sd' | 'smp' | 'sma'; grade: number; returnX?: number; returnY?: number }) => {
      const rx = typeof data?.returnX === 'number' ? data.returnX : (
        data.schoolType === 'sd' ? this.schoolSdDoor.x : data.schoolType === 'smp' ? this.schoolSmpDoor.x : this.schoolSmaDoor.x
      );
      const ry = typeof data?.returnY === 'number' ? data.returnY : (
        data.schoolType === 'sd' ? (this.schoolSdDoor.y + 120) : data.schoolType === 'smp' ? (this.schoolSmpDoor.y + 120) : (this.schoolSmaDoor.y + 120)
      );
      this.transitionToSchool(data.schoolType, rx, ry, data.grade);
    };
    EventBus.on('enter-school-with-grade', onEnterSchoolWithGrade);

    // Tangani perubahan peta langsung dari Studio Arsitek Tahta Raden
    const onArchitectConfigUpdated = (data: { mapType: string; config: any }) => {
      if (data && data.mapType === 'world' && data.config) {
        this.customArchitectPropsGroup.forEach((obj) => {
          if (obj && (obj as any).destroy) (obj as any).destroy();
        });
        this.customArchitectPropsGroup = [];
        this.spawnArchitectCustomProps();
      }
    };
    EventBus.on('architect-config-updated', onArchitectConfigUpdated);

    // Dengar ekspresi dari pemain lain di Open World
    this.networkManager.onPlayerExpression((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active && remote.scene) {
        remote.triggerExpression(data.type);
      }
    });

    // Dengar aksi lompat dari pemain lain di Open World (Multiplayer Jump Sync)
    this.networkManager.onPlayerJumped((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active && remote.scene) {
        remote.triggerJump(data.jumpCount);
      }
    });

    // Indikator visual Proximity Voice Chat
    const onSpeakingStatus = (data: { senderId: string; isSpeaking: boolean }) => {
      const remote = this.remotePlayers.get(data.senderId);
      if (remote && remote.active) {
        remote.setSpeaking(data.isSpeaking);
      }
    };
    EventBus.on('player-speaking-status', onSpeakingStatus);

    const onLocalSpeaking = (data: { isSpeaking: boolean }) => {
      if (this.player && this.player.active) {
        this.player.setSpeaking(data.isSpeaking);
      }
    };
    EventBus.on('local-player-speaking', onLocalSpeaking);

    // Tombol interaksi keyboard 'E'
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    // Tap / Klik lantai grid untuk bergerak (PC & Mobile)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (pointer.rightButtonDown()) return;
      if (this.player?.isMovementLocked()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;

      // Cek apakah klik dekat dengan NPC (toleransi tap interaksi)
      for (const npc of this.npcs) {
        if (Phaser.Math.Distance.Between(wx, wy, npc.x, npc.y) < 70) {
          this.approachAndInteractWithNpc(npc);
          return;
        }
      }

      // Validasi & cari titik tujuan yang aman dan dapat dijangkau
      let dest = this.findClosestWalkablePoint(wx, wy);

      if (!dest) {
        // Lokasi terhalang total dan tidak ada jalur yang bisa dijangkau
        this.spawnBlockedFeedback(wx, wy);
        SoundManager.getInstance().playError();
        if (this.player && this.player.active) {
          this.player.showSpeechBubble('🚫 Lokasi terhalang & tidak bisa dijangkau!', 1300);
        }
        return;
      }

      // Jika klik sangat dekat ke posisi pemain (misal di badan atau dekat kaki),
      // dorong sedikit ke arah klik agar navigasi tetap merespon dan kristal muncul
      const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, dest.x, dest.y);
      if (distToPlayer < 24) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, wx, wy);
        const pushDist = 36;
        const pushedX = this.player.x + Math.cos(angle) * pushDist;
        const pushedY = this.player.y + Math.sin(angle) * pushDist;
        if (this.isLocationWalkable(pushedX, pushedY)) {
          dest = { x: pushedX, y: pushedY };
        }
      }

      // Pergerakan jalan biasa menuju titik grid yang di-tap/klik
      if (this.player && this.player.active) {
        this.spawnTapRipple(dest.x, dest.y);
        this.player.navigateTo(dest.x, dest.y);
      }
    });

    // Ambil data user dari localStorage
    if (!this.pendingPlayerName) {
      let savedName = 'Petualang';
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name) savedName = u.name;
        if (u.private_room_id) this.privateRoomId = u.private_room_id;
      } catch (e) { }
      this.pendingPlayerName = savedName;
    }

    if (!this.pendingAvatar) {
      let savedAv: IAvatarCustomization = {
        gender: 'male',
        skinColor: '#fed7aa',
        shirtColor: '#2563eb',
        pantsColor: '#1e293b',
        hatType: 'none',
      };
      try {
        const saved = localStorage.getItem('raden_player_avatar');
        if (saved) savedAv = JSON.parse(saved);
      } catch (e) { }
      this.pendingAvatar = savedAv;
    }

    // Setup kamera zoom & controller terlebih dahulu sebelum spawn player
    let initialZoom = 0.9;
    try {
      const s = JSON.parse(localStorage.getItem('raden_game_settings') || '{}');
      if (typeof s.cameraZoom === 'number' && s.cameraZoom >= 0.45 && s.cameraZoom <= 1.8) {
        initialZoom = s.cameraZoom;
      }
    } catch (e) { }
    this.setupCameraZoomControls(initialZoom);

    // Spawn karakter lokal
    this.spawnLocalPlayer(this.pendingPlayerName, this.pendingAvatar, this.spawnNearHouseDoor);

    // Cleanup saat shutdown
    const cleanupScene = () => {
      this.cameras?.main?.stopFollow();
      EventBus.off('join-game', onJoinGame);
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.off('trigger-interaction', onTriggerInteraction);
      EventBus.off('enter-school-with-grade', onEnterSchoolWithGrade);
      EventBus.off('architect-config-updated', onArchitectConfigUpdated);
      EventBus.off('player-speaking-status', onSpeakingStatus);
      EventBus.off('local-player-speaking', onLocalSpeaking);
      EventBus.emit('interaction-prompt', null);
      this.networkManager.clearListeners();
      if (this.player) {
        this.player.destroy();
        this.player = null as any;
      }
      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();
      this.clouds.forEach((c) => { if (c.sprite && c.sprite.active) c.sprite.destroy(); });
      this.clouds = [];
      this.waterWaves1.forEach((w) => { if (w && w.active) w.destroy(); });
      this.waterWaves1 = [];
      this.waterWaves2.forEach((w) => { if (w && w.active) w.destroy(); });
      this.waterWaves2 = [];
      this.shorelineSurfs.forEach((s) => { if (s && s.sprite && s.sprite.active) s.sprite.destroy(); });
      this.shorelineSurfs = [];
      if (this.cameraController) {
        this.cameraController.destroy();
        this.cameraController = null as any;
      }
    };

    this.events.on('shutdown', cleanupScene);
    this.events.on('destroy', cleanupScene);
  }

  private setupCameraZoomControls(defaultZoom: number = 0.9): void {
    this.targetZoom = defaultZoom;
    if (this.cameraController) {
      this.cameraController.destroy();
      this.cameraController = null as any;
    }
    this.cameraController = new CameraController(this, {
      defaultZoom,
      minZoom: 0.45,
      maxZoom: 1.8,
      zoomLerpSpeed: 0.12,
    });
  }

  public smoothZoomTo(newZoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(newZoom, 0.45, 1.8);
    this.cameraController?.smoothZoomTo(newZoom);
  }

  /**
   * Menggambar lingkungan alam Open World 80x80 petak (9600x9600px) 100% Sesuai Blueprint:
   * Jalan Raya Aspal, Persimpangan, Trotoar 1 & Trotoar Edge berotasi presisi, Trotoar 2,
   * Lampu Jalan 1x3, Lautan Timur, 3 Dermaga Trotoar 2, Pantai Pasir Selatan & Samudra Selatan.
   */
  private createWorldEnvironment(): void {
    const ts = this.tileSize; // 120

    // 0. BUFFER LAUT & PENYANGGA DI LUAR GRID DUNIA (Mencegah layar hitam kosong saat kamera fokus di pojok)
    const buf = 2400;
    // Samudra tak bertepi di lapisan paling bawah luar grid
    this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth + buf * 2,
      this.worldHeight + buf * 2,
      'water-checker-tile'
    ).setDepth(-110);

    // 1. DASAR DUNIA: RUMPUT HIJAU SEGAR (world-checker-tile)
    // Memenuhi seluruh dunia + buffer dengan origin (0, 0) di (-buf, -buf)
    // Karena -buf = -2400 adalah kelipatan tepat dari ukuran tile catur (240px),
    // seluruh grid catur di dalam peta maupun di luar peta (termasuk kanan atas)
    // terpasang 100% presisi sempurna tanpa pergeseran (offset) dan tanpa garis sambungan (seam)!
    this.add.tileSprite(
      -buf,
      -buf,
      this.worldWidth + buf * 2,
      this.worldHeight + buf * 2,
      'world-checker-tile'
    ).setOrigin(0, 0).setDepth(-100);

    // ========================================================================
    // TEMBOK PEMBATAS DUNIA MENYELURUH SAMPAI KE UJUNG LUAR (OUTER BOUNDS)
    // Sesuai permintaan pengguna: Tembok membentang keluar penuh, bukan cuman garis 1 petak
    // - Tembok Atas Utara (DarkWall & LightWall) membentang dari y = -buf s/d y = 120
    // - Tembok Samping Barat (DarkWall_WithTop & LightWall_WithTop) membentang dari x = -buf s/d x = 120
    // ========================================================================
    this.ensureWallTextures();
    this.ensureWaterTextures();

    // a. Tembok Atas Utara: Memenuhi seluruh area Utara dari luar map (y: -buf s/d ts) sepanjang lebar dunia + buffer
    if (this.textures.exists('wall-top-checker')) {
      this.add.tileSprite(
        -buf,
        -buf,
        this.worldWidth + buf * 2,
        buf + ts,
        'wall-top-checker'
      ).setOrigin(0, 0).setDepth(10);
    } else {
      for (let gy = -20; gy <= 0; gy++) {
        for (let gx = -20; gx < 80 + 20; gx++) {
          const isDark = (gx + gy) % 2 === 0;
          const key = isDark ? 'tile-wall-dark' : 'tile-wall-light';
          this.add.image(gx * ts, gy * ts, key).setOrigin(0, 0).setDepth(10);
        }
      }
    }

    // b. Tembok Samping Barat: Memenuhi area Barat luar map (x: -buf s/d ts)
    // Dibuat terbuka pada koridor jalan (gy: 11..16 dan gy: 64..69).
    // PENTING: Tembok Barat HANYA sampai gy: 63! Di bawah koridor 2 (gy >= 70) adalah
    // Pantai Pasir Selatan dan Samudra Selatan yang bebas terbuka tanpa dinding pembatas!
    if (this.textures.exists('wall-side-checker')) {
      // Seksi 1: Atas Koridor 1 (gy: 1..10)
      this.add.tileSprite(-buf, ts, buf + ts, 10 * ts, 'wall-side-checker')
        .setOrigin(0, 0).setDepth(10);
      // Seksi 2: Antara Koridor 1 dan Koridor 2 (gy: 17..63)
      this.add.tileSprite(-buf, 17 * ts, buf + ts, 47 * ts, 'wall-side-checker')
        .setOrigin(0, 0).setDepth(10);
    } else {
      for (let gy = 1; gy <= 63; gy++) {
        if (gy >= 11 && gy <= 16) continue;
        for (let gx = -20; gx <= 0; gx++) {
          const isDark = (gx + gy) % 2 === 0;
          const key = isDark ? 'tile-wall-top-dark' : 'tile-wall-top-light';
          this.add.image(gx * ts, gy * ts, key).setOrigin(0, 0).setDepth(10);
        }
      }
    }

    // Tambahkan Rintangan Fisik Statis (Collider) di Sepanjang Tembok & Batas Wilayah
    if (this.obstacles) {
      // Dinding Utara Tebal (Dari -buf sampai ts = 120px)
      const topWallZone = this.add.zone(this.worldWidth / 2, (ts - buf) / 2, this.worldWidth + buf * 2, buf + ts);
      this.physics.add.existing(topWallZone, true);
      this.obstacles.add(topWallZone);

      // Dinding Barat Tebal (Seksi 1 & 2; Seksi 3 tidak ada karena gy >= 70 adalah pantai dan laut bebas)
      const leftWallZone1 = this.add.zone((ts - buf) / 2, ts + (10 * ts) / 2, buf + ts, 10 * ts);
      this.physics.add.existing(leftWallZone1, true);
      this.obstacles.add(leftWallZone1);

      const leftWallZone2 = this.add.zone((ts - buf) / 2, 17 * ts + (47 * ts) / 2, buf + ts, 47 * ts);
      this.physics.add.existing(leftWallZone2, true);
      this.obstacles.add(leftWallZone2);

      // Dinding Timur (Dibagi 3 segmen agar koridor jalan terus ke arah laut)
      const rightWallZone1 = this.add.zone(this.worldWidth - 24, (11 * ts) / 2, 54, 11 * ts);
      this.physics.add.existing(rightWallZone1, true);
      this.obstacles.add(rightWallZone1);

      const rightWallZone2 = this.add.zone(this.worldWidth - 24, 17 * ts + (47 * ts) / 2, 54, 47 * ts);
      this.physics.add.existing(rightWallZone2, true);
      this.obstacles.add(rightWallZone2);

      const rightWallZone3 = this.add.zone(this.worldWidth - 24, 70 * ts + (10 * ts) / 2, 54, 10 * ts);
      this.physics.add.existing(rightWallZone3, true);
      this.obstacles.add(rightWallZone3);

      // Pembatas Tepi Samping Koridor Jalan di Laut Timur (mencegah tercebur dari samping trotoar ke laut dalam)
      // Koridor 1 Timur:
      const eastEdge1Top = this.add.zone(this.worldWidth + buf / 2, 11 * ts - 20, buf, 40);
      this.physics.add.existing(eastEdge1Top, true);
      this.obstacles.add(eastEdge1Top);
      const eastEdge1Btm = this.add.zone(this.worldWidth + buf / 2, 17 * ts + 20, buf, 40);
      this.physics.add.existing(eastEdge1Btm, true);
      this.obstacles.add(eastEdge1Btm);
      const eastStop1 = this.add.zone(this.worldWidth + ts + 24, 14 * ts, 48, 6 * ts);
      this.physics.add.existing(eastStop1, true);
      this.obstacles.add(eastStop1);

      // Koridor 2 Timur:
      const eastEdge2Top = this.add.zone(this.worldWidth + buf / 2, 64 * ts - 20, buf, 40);
      this.physics.add.existing(eastEdge2Top, true);
      this.obstacles.add(eastEdge2Top);
      const eastEdge2Btm = this.add.zone(this.worldWidth + buf / 2, 70 * ts + 20, buf, 40);
      this.physics.add.existing(eastEdge2Btm, true);
      this.obstacles.add(eastEdge2Btm);
      const eastStop2 = this.add.zone(this.worldWidth + ts + 24, 67 * ts, 48, 6 * ts);
      this.physics.add.existing(eastStop2, true);
      this.obstacles.add(eastStop2);

      // Pembatas Ujung Koridor Jalan di Barat Luar
      const westStop1 = this.add.zone(-2 * ts - 24, 14 * ts, 48, 6 * ts);
      this.physics.add.existing(westStop1, true);
      this.obstacles.add(westStop1);
      const westStop2 = this.add.zone(-2 * ts - 24, 67 * ts, 48, 6 * ts);
      this.physics.add.existing(westStop2, true);
      this.obstacles.add(westStop2);

      // Pembatas Ujung Barat Pantai Selatan (sejajar batas koridor jalan barat gx: -2)
      const westBeachStop = this.add.zone(-2 * ts - 24, 74.5 * ts, 48, 9 * ts);
      this.physics.add.existing(westBeachStop, true);
      this.obstacles.add(westBeachStop);

      // Pembatas Tepi Samudra Selatan (mencegah pemain tercebur ke laut dari pasir pantai)
      const southOceanZone = this.add.zone(
        this.worldWidth / 2,
        79 * ts + 60,
        this.worldWidth + buf * 2,
        120
      );
      this.physics.add.existing(southOceanZone, true);
      this.obstacles.add(southOceanZone);
    }

    // 2. TIMUR BAHARI & SAMUDRA SELATAN: LAUTAN ASLI BLUEPRINT (#00A2F3) DENGAN EFEK RIAK OMBAK BERKILAU HD
    // 100% Menyatu, Bebas Sambungan Kotak, Bebas Grid, 60 FPS WebGL
    this.waterWaves1 = [];
    this.waterWaves2 = [];
    this.shorelineSurfs = [];

    const addWaterArea = (x: number, y: number, w: number, h: number) => {
      // Dasar Warna Biru Laut Asli Blueprint (#00A2F3)
      this.add.tileSprite(
        x + w / 2,
        y + h / 2,
        w,
        h,
        'water-checker-tile'
      ).setDepth(-98);

      // Lapisan Riak Ombak 1: Gelombang mengalir horizontal berirama HD (Crest, Droplets, Glimmer)
      if (this.textures.exists('water-wave-tile')) {
        const wave1 = this.add.tileSprite(
          x + w / 2,
          y + h / 2,
          w,
          h,
          'water-wave-tile'
        )
          .setDepth(-97)
          .setAlpha(0.72);
        this.waterWaves1.push(wave1);
      }

      // Lapisan Riak Ombak 2: Gelombang kaustik cahaya kristal pelengkap kontra-arah HD
      if (this.textures.exists('water-wave-caustic')) {
        const wave2 = this.add.tileSprite(
          x + w / 2,
          y + h / 2,
          w,
          h,
          'water-wave-caustic'
        )
          .setDepth(-96)
          .setAlpha(0.52)
          .setScale(1.15, 1.15);
        this.waterWaves2.push(wave2);
      }
    };

    // Lautan Kristal Timur (gx: 63..79, gy: 17..63)
    addWaterArea(63 * ts, 17 * ts, 17 * ts, 47 * ts);

    // Samudra Bebas Luar Timur (Hanya membentang dari Koridor 1 gy: 11 ke bawah, bukan di kanan atas)
    addWaterArea(this.worldWidth, 11 * ts, buf, (this.worldHeight + buf) - 11 * ts);

    // 3. SELATAN PANTAI: PANTAI PASIR KEEMASAN
    // Teluk Pantai Tengah (gx: 23..56, gy: 64..69)
    const coveX = 23 * ts;
    const coveY = 64 * ts;
    const coveW = 34 * ts;
    const coveH = 6 * ts;
    const coveSprite = this.add.tileSprite(
      coveX,
      coveY,
      coveW,
      coveH,
      'beach-checker-tile'
    ).setOrigin(0, 0).setDepth(-98);
    // gx: 23 adalah kolom ganjil (23 * 120 = 2760px). Agar pola catur menyatu 100%
    // presisi dengan grid catur dunia dan pantai selatan utama, tilePositionX digeser 120px:
    coveSprite.tilePositionX = 120;
    coveSprite.tilePositionY = 0;

    // Hamparan Pantai Selatan Utama (gy: 70..78)
    // Membentang bebas dari buffer barat (-buf) sampai batas timur (79 * ts)
    const mainBeachX = -buf;
    const mainBeachY = 70 * ts;
    const mainBeachW = buf + 79 * ts;
    const mainBeachH = 9 * ts;
    this.add.tileSprite(
      mainBeachX,
      mainBeachY,
      mainBeachW,
      mainBeachH,
      'beach-checker-tile'
    ).setOrigin(0, 0).setDepth(-98);

    // Air Laut di Sisi Kanan Pantai Selatan (gx: 79 di gy: 70..78)
    addWaterArea(79 * ts, 70 * ts, ts, 9 * ts);

    // Samudra Selatan Paling Bawah (gy: 79) membentang penuh dari barat (-buf) ke timur (worldWidth + buf)
    addWaterArea(-buf, 79 * ts, this.worldWidth + buf * 2, ts);

    // Samudra Bebas Luar Selatan (Buffer Samudra Selatan tak bertepi dari barat ke timur)
    addWaterArea(-buf, this.worldHeight, this.worldWidth + buf * 2, buf);

    // Gulungan Buih Ombak Pasir Pantai Selatan & Pantai Timur
    // a. Ombak Horizontal Pantai Selatan (gy: 79): Berhenti tepat di ujung pasir (79 * ts + 15), tidak menembus ke laut lepas timur!
    if (this.textures.exists('water-shoreline-surf')) {
      const surfSouthW = buf + 79 * ts + 15;
      const surfSouth = this.add.tileSprite(
        -buf + surfSouthW / 2,
        79 * ts + 15,
        surfSouthW,
        60,
        'water-shoreline-surf'
      ).setDepth(-94);
      this.shorelineSurfs.push({ sprite: surfSouth, baseY: 79 * ts + 15, isVertical: false });
    }

    // b. Ombak Vertikal Pantai Timur (gx: 79, gy: 70..79): Membentang di pertemuan pasir timur dengan laut timur
    if (this.textures.exists('water-shoreline-surf-v')) {
      const surfEastH = 9 * ts + 15;
      const surfEast = this.add.tileSprite(
        79 * ts + 15,
        70 * ts + surfEastH / 2,
        60,
        surfEastH,
        'water-shoreline-surf-v'
      ).setDepth(-94);
      this.shorelineSurfs.push({ sprite: surfEast, baseX: 79 * ts + 15, isVertical: true });
    }

    // 4. JALAN RAYA ASPAL (ROAD NETWORK 100% SESUAI BLUEPRINT)
    // a. Jalan Horizontal Barat Laut (gy: 13..14, gx: -20..18) - tembus ke buffer barat luar
    for (let gx = -20; gx <= 18; gx++) {
      this.add.image(gx * ts, 13 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // b. Jalan Horizontal Timur Laut (gy: 13..14, gx: 61..100) - terus membentang ke samudra timur
    for (let gx = 61; gx <= 100; gx++) {
      this.add.image(gx * ts, 13 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // c. Jalan Horizontal Utara Central Plaza (gy: 19..20, gx: 21..58)
    for (let gx = 21; gx <= 58; gx++) {
      this.add.image(gx * ts, 19 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // d. Jalan Horizontal Selatan Central Plaza (gy: 60..61, gx: 21..58)
    for (let gx = 21; gx <= 58; gx++) {
      this.add.image(gx * ts, 60 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // e. Jalan Horizontal Barat Daya (gy: 66..67, gx: -20..18) - tembus ke buffer barat luar
    for (let gx = -20; gx <= 18; gx++) {
      this.add.image(gx * ts, 66 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // f. Jalan Horizontal Tenggara (gy: 66..67, gx: 61..100) - terus membentang ke samudra timur
    for (let gx = 61; gx <= 100; gx++) {
      this.add.image(gx * ts, 66 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }

    // g. Jalan Vertikal Barat (gx: 19..20, gy: 15..18, 21..59, 62..65)
    for (let gy = 15; gy <= 18; gy++) this.add.image(19 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 21; gy <= 59; gy++) this.add.image(19 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 62; gy <= 65; gy++) this.add.image(19 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);

    // h. Jalan Vertikal Timur (gx: 59..60, gy: 15..18, 21..59, 62..65)
    for (let gy = 15; gy <= 18; gy++) this.add.image(59 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 21; gy <= 59; gy++) this.add.image(59 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 62; gy <= 65; gy++) this.add.image(59 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);

    // i. 8 Persimpangan Jalan (2x2 JalanTengah, 240x240 px)
    const intersections = [
      { gx: 19, gy: 13 }, { gx: 59, gy: 13 },
      { gx: 19, gy: 19 }, { gx: 59, gy: 19 },
      { gx: 19, gy: 60 }, { gx: 59, gy: 60 },
      { gx: 19, gy: 66 }, { gx: 59, gy: 66 },
    ];
    intersections.forEach(ix => {
      this.add.image(ix.gx * ts, ix.gy * ts, 'road-intersection').setOrigin(0, 0).setDepth(-95);
    });

    // 5. TROTOAR 1, TROTOAR EDGE & TROTOAR 2 (100% SESUAI BLUEPRINT)
    const addTrotoarH = (gx: number, gy: number) => {
      this.add.image(gx * ts, gy * ts, 'trotoar-horizontal').setOrigin(0, 0).setDepth(-94);
    };
    const addTrotoarV = (gx: number, gy: number) => {
      this.add.image(gx * ts, gy * ts, 'trotoar-vertical').setOrigin(0, 0).setDepth(-94);
    };
    const addTrotoar2 = (gx: number, gy: number) => {
      this.add.image(gx * ts, gy * ts, 'trotoar-2').setOrigin(0, 0).setDepth(-94);
    };
    const addTrotoarEdge = (gx: number, gy: number, angleDeg: number) => {
      this.add.image(gx * ts + ts / 2, gy * ts + ts / 2, 'trotoar-edge')
        .setOrigin(0.5, 0.5)
        .setAngle(angleDeg)
        .setDepth(-94);
    };

    // A. Barat Laut (NW Sidewalks):
    // Sisi Atas / Utara (gy: 11..12) - membentang keluar barat (gx: -20):
    for (let gx = -20; gx <= 20; gx++) addTrotoarH(gx, 12);
    addTrotoarEdge(21, 12, 0);
    for (let gx = -20; gx <= 22; gx++) addTrotoar2(gx, 11);

    // Sisi Bawah / Selatan (gy: 15..16) - membentang keluar barat (gx: -20):
    for (let gx = -20; gx <= 17; gx++) addTrotoarH(gx, 15);
    addTrotoarEdge(18, 15, 0);
    for (let gx = -20; gx <= 17; gx++) addTrotoar2(gx, 16);
    addTrotoar2(17, 16);

    for (let gy = 16; gy <= 64; gy++) addTrotoarV(18, gy);
    for (let gy = 16; gy <= 65; gy++) addTrotoar2(17, gy);

    for (let gy = 13; gy <= 17; gy++) addTrotoarV(21, gy);
    addTrotoarEdge(21, 18, 180);
    for (let gy = 12; gy <= 17; gy++) addTrotoar2(22, gy);

    // B. Timur Laut (NE Sidewalks):
    // Sisi Atas / Utara (gy: 11..12) - terus membentang ke laut timur (gx: 100):
    for (let gx = 59; gx <= 100; gx++) addTrotoarH(gx, 12);
    addTrotoarEdge(58, 12, 270);
    for (let gx = 57; gx <= 100; gx++) addTrotoar2(gx, 11);

    // Sisi Bawah / Selatan (gy: 15..16) - terus membentang ke laut timur (gx: 100):
    for (let gx = 62; gx <= 100; gx++) addTrotoarH(gx, 15);
    addTrotoarEdge(61, 15, 270);
    for (let gx = 62; gx <= 100; gx++) addTrotoar2(gx, 16);

    for (let gy = 13; gy <= 17; gy++) addTrotoarV(58, gy);
    addTrotoarEdge(58, 18, 90);
    for (let gy = 12; gy <= 17; gy++) addTrotoar2(57, gy);

    // C. Utara Central Plaza (gy: 17..18):
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 18);
    for (let gx = 22; gx <= 57; gx++) addTrotoar2(gx, 17);

    // D. Keliling Bagian Dalam Central Plaza (1 Petak Trotoar 1 + Sudut Edge):
    addTrotoarEdge(21, 21, 270);
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 21);
    addTrotoarEdge(58, 21, 0);

    for (let gy = 22; gy <= 58; gy++) addTrotoarV(21, gy);
    for (let gy = 22; gy <= 58; gy++) addTrotoarV(58, gy);

    addTrotoarEdge(21, 59, 180);
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 59);
    addTrotoarEdge(58, 59, 90);

    // E. Teluk Pantai Selatan (Cove gy: 62..68):
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 62);
    for (let gx = 22; gx <= 57; gx++) addTrotoar2(gx, 63);
    addTrotoarEdge(21, 62, 270);
    addTrotoarEdge(58, 62, 0);

    for (let gy = 63; gy <= 67; gy++) addTrotoarV(21, gy);
    for (let gy = 64; gy <= 69; gy++) addTrotoar2(22, gy);
    addTrotoarEdge(21, 68, 90);

    for (let gy = 63; gy <= 67; gy++) addTrotoarV(58, gy);
    for (let gy = 64; gy <= 69; gy++) addTrotoar2(57, gy);
    addTrotoarEdge(58, 68, 180);

    // F. Barat Daya (SW Sidewalks gy: 64..69):
    for (let gx = -20; gx <= 17; gx++) addTrotoarH(gx, 65);
    addTrotoarEdge(18, 65, 90);
    for (let gx = -20; gx <= 17; gx++) addTrotoar2(gx, 64);
    addTrotoar2(17, 64);

    for (let gx = -20; gx <= 20; gx++) addTrotoarH(gx, 68);
    for (let gx = -20; gx <= 22; gx++) addTrotoar2(gx, 69);

    // G. Tenggara (SE Sidewalks gy: 64..69):
    for (let gx = 62; gx <= 100; gx++) addTrotoarH(gx, 65);
    addTrotoarEdge(61, 65, 180);
    for (let gx = 62; gx <= 100; gx++) addTrotoar2(gx, 64);

    for (let gx = 59; gx <= 100; gx++) addTrotoarH(gx, 68);
    for (let gx = 57; gx <= 100; gx++) addTrotoar2(gx, 69);

    // H. Promenade Laut Timur & 3 Dermaga Trotoar 2:
    // Trotoar 1 Vertikal (gx: 61) lurus sempurna tanpa lubang/terpotong dari utara ke selatan
    for (let gy = 16; gy <= 64; gy++) addTrotoarV(61, gy);
    for (let gy = 16; gy <= 64; gy++) addTrotoar2(62, gy);

    // 3 Dermaga Trotoar 2 (gx: 63..73, 2 petak menjulur ke lautan bebas)
    for (let px = 63; px <= 73; px++) {
      addTrotoar2(px, 26);
      addTrotoar2(px, 27);
      addTrotoar2(px, 39);
      addTrotoar2(px, 40);
      addTrotoar2(px, 53);
      addTrotoar2(px, 54);
    }

    // 6. RINTANGAN PERAIRAN LAUT (Mencegah pemain tercebur ke laut dalam)
    this.addGridObstacle(63, 17, 17, 9);
    this.addGridObstacle(63, 28, 17, 11);
    this.addGridObstacle(63, 41, 17, 12);
    this.addGridObstacle(63, 55, 17, 9);
    this.addGridObstacle(74, 26, 6, 2);
    this.addGridObstacle(74, 39, 6, 2);
    this.addGridObstacle(74, 53, 6, 2);
    this.addGridObstacle(-2, 79, 83, 1);
    this.addGridObstacle(79, 70, 1, 9);

    // 7. LAMPU JALAN (PROP-LAMPU 1X3) SESUAI BLUEPRINT
    const allLamps = [
      // Barat Laut luar (gy_base: 11 -> lantern_gy: 9)
      { gx: 3, gy: 9 }, { gx: 10, gy: 9 }, { gx: 17, gy: 9 }, { gx: 22, gy: 9 },
      // Barat Laut dalam (gy_base: 16 -> lantern_gy: 14)
      { gx: 3, gy: 14 }, { gx: 10, gy: 14 }, { gx: 17, gy: 14 },
      // Timur Laut luar (gy_base: 11 -> lantern_gy: 9)
      { gx: 57, gy: 9 }, { gx: 62, gy: 9 }, { gx: 69, gy: 9 }, { gx: 76, gy: 9 },
      // Timur Laut dalam (gy_base: 16 -> lantern_gy: 14)
      { gx: 62, gy: 14 }, { gx: 69, gy: 14 }, { gx: 76, gy: 14 },
      // Plaza Utara (gy_base: 17 -> lantern_gy: 15)
      { gx: 22, gy: 15 }, { gx: 29, gy: 15 }, { gx: 35, gy: 15 }, { gx: 42, gy: 15 }, { gx: 57, gy: 15 },
      // Jalan Vertikal Barat (gx: 17)
      { gx: 17, gy: 22 }, { gx: 17, gy: 32 }, { gx: 17, gy: 37 }, { gx: 17, gy: 47 }, { gx: 17, gy: 52 }, { gx: 17, gy: 62 },
      // Promenade Laut Timur (gx: 62)
      { gx: 62, gy: 20 }, { gx: 62, gy: 25 }, { gx: 62, gy: 32 }, { gx: 62, gy: 45 }, { gx: 62, gy: 50 }, { gx: 62, gy: 57 },
      // Teluk Pantai Selatan (gy_base: 63 -> lantern_gy: 61)
      { gx: 22, gy: 61 }, { gx: 26, gy: 61 }, { gx: 30, gy: 61 }, { gx: 34, gy: 61 }, { gx: 40, gy: 61 },
      { gx: 45, gy: 61 }, { gx: 49, gy: 61 }, { gx: 53, gy: 61 }, { gx: 57, gy: 61 },
      // Barat Daya dalam (gy_base: 64 -> lantern_gy: 62)
      { gx: 3, gy: 62 }, { gx: 10, gy: 62 }, { gx: 17, gy: 62 },
      // Tenggara dalam (gy_base: 64 -> lantern_gy: 62)
      { gx: 62, gy: 62 }, { gx: 69, gy: 62 }, { gx: 76, gy: 62 },
      // Barat Daya luar (gy_base: 69 -> lantern_gy: 67)
      { gx: 3, gy: 67 }, { gx: 10, gy: 67 }, { gx: 17, gy: 67 }, { gx: 22, gy: 67 },
      // Tenggara luar (gy_base: 69 -> lantern_gy: 67)
      { gx: 57, gy: 67 }, { gx: 62, gy: 67 }, { gx: 69, gy: 67 }, { gx: 76, gy: 67 }
    ];
    allLamps.forEach(l => {
      this.addGridProp('prop-lampu', l.gx, l.gy, 1, 3, true);
    });

    // Muat custom props arsitek tambahan dari Tahta Raden (jika ada)
    this.spawnArchitectCustomProps();

    // 12. EFEK BAYANGAN AWAN 100% ACAK, ORGANIK & BERVARIASI (Zero Baris, HD, Menggelapkan Karakter)
    this.clouds = [];
    const cloudKeys = [
      'cloud-cumulus-1', 'cloud-cumulus-2', 'cloud-cumulus-3', 'cloud-cumulus-4',
      'cloud-stratus-5', 'cloud-split-6', 'cloud-fragment-7', 'cloud-dense-8'
    ];
    const totalClouds = 18;

    for (let i = 0; i < totalClouds; i++) {
      const key = cloudKeys[Phaser.Math.Between(0, cloudKeys.length - 1)];
      if (!this.textures.exists(key)) continue;

      // Posisi acak tersebar merata di seluruh dunia 9600x9600
      const startX = Phaser.Math.Between(0, this.worldWidth);
      const startY = Phaser.Math.Between(0, this.worldHeight);
      const scaleX = Phaser.Math.FloatBetween(1.1, 2.7);
      const scaleY = Phaser.Math.FloatBetween(0.8, 2.2);
      const alpha = Phaser.Math.FloatBetween(0.48, 0.68);
      const angle = Phaser.Math.Between(-30, 30);
      const flipX = Math.random() > 0.5;
      const flipY = Math.random() > 0.5;
      const speedX = Phaser.Math.FloatBetween(22, 42);
      const speedY = Phaser.Math.FloatBetween(7, 18);

      const cloudImg = this.add.image(startX, startY, key)
        .setScale(scaleX, scaleY)
        .setAngle(angle)
        .setFlip(flipX, flipY)
        .setAlpha(alpha)
        .setDepth(99999) // DI ATAS KARAKTER DAN GEDUNG SEHINGGA KARAKTER PASTI GELAP PAS DI BAWAH AWAN
        .setBlendMode(Phaser.BlendModes.MULTIPLY);

      this.clouds.push({
        sprite: cloudImg,
        speedX,
        speedY,
      });
    }
  }

  private addGridObstacle(gx: number, gy: number, gw: number, gh: number): Phaser.GameObjects.Zone {
    const pixelW = gw * this.tileSize;
    const pixelH = gh * this.tileSize;
    const centerX = gx * this.tileSize + pixelW / 2;
    const centerY = gy * this.tileSize + pixelH / 2;

    const zone = this.add.zone(centerX, centerY, pixelW, pixelH);
    this.physics.add.existing(zone, true);
    if (this.obstacles) {
      this.obstacles.add(zone);
    }
    return zone;
  }

  private addGridProp(
    key: string,
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    isObstacle: boolean = true,
    interactiveCallback?: () => void,
    obstacleRows?: number
  ): Phaser.GameObjects.Image | null {
    if (!this.textures.exists(key)) return null;

    const pixelW = gw * this.tileSize;
    const pixelH = gh * this.tileSize;
    const centerX = gx * this.tileSize + pixelW / 2;
    const centerY = gy * this.tileSize + pixelH / 2;

    const img = this.add.image(centerX, centerY, key);
    img.setDisplaySize(pixelW, pixelH);

    const isWildGrass = key === 'prop-rumput';
    const isTamanRumput = key === 'prop-taman-rumput';

    img.setDepth((gy + gh) * this.tileSize);

    if (isWildGrass || isTamanRumput) isObstacle = false;

    if (interactiveCallback) {
      img.setInteractive({ useHandCursor: true });
      img.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        interactiveCallback();
      });
    }

    if (isObstacle && !isWildGrass && !isTamanRumput) {
      // User request: collision selalu di bagian x1 (1 baris petak grid di dasar objek)
      const rows = obstacleRows || 1;
      this.addGridObstacle(gx, gy + gh - rows, gw, rows);
    }

    return img;
  }

  private spawnArchitectCustomProps(): void {
    try {
      const saved = localStorage.getItem('raden_architect_world');
      if (!saved) return;
      const cfg = JSON.parse(saved);
      if (!cfg.customProps || !Array.isArray(cfg.customProps)) return;

      cfg.customProps.forEach((prop: any) => {
        if (prop.id && String(prop.id).startsWith('def_')) return;
        const spawned = this.addGridProp(
          prop.key,
          prop.gx,
          prop.gy,
          prop.gw || 1,
          prop.gh || 1,
          prop.isObstacle ?? true
        );
        if (spawned) {
          this.customArchitectPropsGroup.push(spawned);
        }
      });
    } catch (e) {
      console.warn('[WorldScene] Gagal memuat custom architect props:', e);
    }
  }

  private openSchoolGradeSelect(schoolType: 'sd' | 'smp' | 'sma', returnX: number, returnY: number): void {
    if (this.isTransitioning) return;
    this.player?.showSpeechBubble('Pilih kelas dulu sebelum masuk sekolah... 🏫🎒');
    EventBus.emit('open-school-grade-select', {
      schoolType,
      returnX,
      returnY,
    });
  }

  private approachDoorAndEnter(type: 'sd' | 'smp' | 'sma' | 'house', doorX: number, doorY: number): void {
    if (!this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, doorX, doorY);

    if (dist <= 130) {
      if (type === 'sd') this.openSchoolGradeSelect('sd', this.schoolSdDoor.x, this.schoolSdDoor.y + 120);
      else if (type === 'smp') this.openSchoolGradeSelect('smp', this.schoolSmpDoor.x, this.schoolSmpDoor.y + 120);
      else if (type === 'sma') this.openSchoolGradeSelect('sma', this.schoolSmaDoor.x, this.schoolSmaDoor.y + 120);
      else this.transitionToHouse();
    } else {
      this.spawnTapRipple(doorX, doorY + 60);
      this.player.navigateTo(doorX, doorY + 60, () => {
        if (type === 'sd') this.openSchoolGradeSelect('sd', this.schoolSdDoor.x, this.schoolSdDoor.y + 120);
        else if (type === 'smp') this.openSchoolGradeSelect('smp', this.schoolSmpDoor.x, this.schoolSmpDoor.y + 120);
        else if (type === 'sma') this.openSchoolGradeSelect('sma', this.schoolSmaDoor.x, this.schoolSmaDoor.y + 120);
        else this.transitionToHouse();
      });
    }
  }

  private healPlayerAtHospital(): void {
    if (!this.player || !this.player.active) return;
    this.player.updateHealth(100, 100);
    this.player.showSpeechBubble('💉 Perawatan Rumah Sakit berhasil! Energimu pulih sepenuhnya (100 HP)! ✨', 2500);
    EventBus.emit('player-stats-updated', {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      gridX: Math.floor(this.player.x / this.tileSize),
      gridY: Math.floor(this.player.y / this.tileSize),
      hp: 100,
      maxHp: 100,
      name: this.player.getEntityName(),
      avatar: this.player.getAvatar(),
      roomName: 'KAWASAN KESEHATAN: RUMAH SAKIT KOTA',
      inHouse: false,
      level: 1,
    });
    this.spawnTapRipple(this.hospitalDoor.x, this.hospitalDoor.y);
  }

  private createWorldNpcs(): void {
    this.npcs = [];
    if (this.npcs.length === 0) return;
    this.npcs.forEach(npcData => {
      const npcSprite = this.add.image(npcData.x, npcData.y, npcData.spriteKey);
      npcSprite.setDisplaySize(120, 240);
      npcSprite.setOrigin(0.5, 0.5);
      npcSprite.setDepth(npcData.y + 120);

      this.add.text(npcData.x, npcData.y - 105, npcData.name, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '13px',
        color: '#fef08a',
        fontStyle: 'bold',
        stroke: '#0a0f1d',
        strokeThickness: 3.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npcData.y + 121);

      this.add.text(npcData.x, npcData.y - 88, `[${npcData.role}]`, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '10px',
        color: '#38bdf8',
        stroke: '#0a0f1d',
        strokeThickness: 2.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npcData.y + 121);

      npcSprite.setInteractive({ useHandCursor: true });
      npcSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        this.approachAndInteractWithNpc(npcData);
      });
    });
  }

  private approachAndInteractWithNpc(npcData: INpcConfig): void {
    if (!this.player || !this.player.active) return;

    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, npcData.x, npcData.y);

    if (dist <= 110) {
      this.interactWithNpc(npcData);
    } else {
      this.player.showSpeechBubble(`Menuju ke ${npcData.name}...`, 1500);

      const angle = Phaser.Math.Angle.Between(npcData.x, npcData.y, px, py);
      const targetX = Math.round(npcData.x + Math.cos(angle) * 75);
      const targetY = Math.round(npcData.y + Math.sin(angle) * 75);

      this.spawnTapRipple(targetX, targetY);
      this.player.navigateTo(targetX, targetY, () => {
        this.interactWithNpc(npcData);
      });
    }
  }

  private spawnTapRipple(x: number, y: number): void {
    const circle = this.add.graphics();
    circle.lineStyle(2, 0xf59e0b, 0.9);
    circle.strokeCircle(x, y, 10);
    circle.setDepth(y + 2);

    this.tweens.add({
      targets: circle,
      scale: 2.2,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => circle.destroy(),
    });
  }

  /**
   * Memvalidasi apakah suatu titik koordinat (wx, wy) dapat dijangkau dan dapat diinjak:
   * 1. Berada di dalam batas map dunia (120px margin dari batas terluar 9600x9600)
   * 2. Bukan perairan laut dalam (Lautan Timur di luar 3 dermaga, Samudra Selatan, laut sudut)
   * 3. Tidak bertabrakan dengan rintangan fisik apapun (Gedung, Tiang Lampu, Rintangan Arsitek, Statik Collider)
   */
  public isLocationWalkable(wx: number, wy: number): boolean {
    const ts = this.tileSize; // 120

    // Cek apakah posisi berada dalam koridor jalan & trotoar terbuka
    // Koridor 1 (Barat Laut / Timur Laut): gy 11..16 (wy: 1320 s/d 2040)
    // Koridor 2 (Barat Daya / Tenggara): gy 64..69 (wy: 7680 s/d 8400)
    const isRoadCorridor1 = wy >= 11 * ts && wy < 17 * ts;
    const isRoadCorridor2 = wy >= 64 * ts && wy < 70 * ts;
    const isRoadCorridor = isRoadCorridor1 || isRoadCorridor2;
    const isBeach = wy >= 70 * ts && wy < 79 * ts;

    if (isRoadCorridor || isBeach) {
      // Pada koridor jalan & pantai, pemain bisa berjalan bebas dari buffer barat (-2 petak) sampai batas timur (+1 petak)
      if (wx < -2 * ts || wx > (this.worldWidth + ts)) {
        return false;
      }
    } else {
      // 1. Batas luar dunia game standar (1 petak batas pengaman luar)
      if (wx < 120 || wx > this.worldWidth - 120 || wy < 120 || wy > this.worldHeight - 120) {
        return false;
      }
    }

    const gx = Math.floor(wx / ts);
    const gy = Math.floor(wy / ts);

    // 2. Perairan Lautan (Deep Ocean Water):
    // Jika berada di luar grid dunia 80x80: di luar koridor jalan dan pantai semuanya adalah laut/void terlarang
    if (gx < 0 || gx >= 80) {
      if (!isRoadCorridor && !isBeach) return false;
    }

    // a. Lautan Timur (gx: 63..79, gy: 17..63)
    // Cek apakah pemain mengklik salah satu dari 3 Dermaga:
    // Dermaga 1: gx 63..73, gy 26..27
    // Dermaga 2: gx 63..73, gy 39..40
    // Dermaga 3: gx 63..73, gy 53..54
    const isOnPier = (gx >= 63 && gx <= 73) && (
      (gy >= 26 && gy <= 27) ||
      (gy >= 39 && gy <= 40) ||
      (gy >= 53 && gy <= 54)
    );

    if (gx >= 63 && gx < 80 && gy >= 17 && gy <= 63 && !isOnPier) {
      return false;
    }

    // b. Samudra Selatan Paling Bawah (gy >= 79)
    if (gy >= 79) {
      return false;
    }

    // c. Perairan sudut kanan Pantai Selatan (gx >= 79 pada gy >= 70)
    if (gx >= 79 && gy >= 70) {
      return false;
    }

    // 3. Tabrakan dengan Grup Rintangan Fisik (Hitbox Obstacles & Lampu Jalan)
    if (this.obstacles) {
      const obstaclesList = this.obstacles.getChildren();
      // Margin batas tubuh karakter (~18px)
      const margin = 18;
      for (let i = 0; i < obstaclesList.length; i++) {
        const item = obstaclesList[i] as any;
        if (!item || !item.body) continue;
        const b = item.body as Phaser.Physics.Arcade.StaticBody;
        if (
          wx >= b.x - margin &&
          wx <= b.x + b.width + margin &&
          wy >= b.y - margin &&
          wy <= b.y + b.height + margin
        ) {
          return false;
        }
      }
    }

    // 4. Custom Architect Terrain Obstacles
    if (this.customArchitectTerrainObstacles && this.customArchitectTerrainObstacles.length > 0) {
      for (const obs of this.customArchitectTerrainObstacles) {
        const b = (obs as any).body as Phaser.Physics.Arcade.StaticBody;
        if (b && wx >= b.x - 18 && wx <= b.x + b.width + 18 && wy >= b.y - 18 && wy <= b.y + b.height + 18) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Menemukan titik walkable terdekat dari posisi pemain menuju titik target.
   * Jika titik target berada di dalam tembok/rintangan atau di luar batas dunia,
   * secara cerdas menarik titik target mundur di sepanjang garis pandang pemain
   * hingga menemukan area yang aman diinjak.
   */
  public findClosestWalkablePoint(targetX: number, targetY: number): { x: number; y: number } | null {
    if (this.isLocationWalkable(targetX, targetY)) {
      return { x: targetX, y: targetY };
    }

    if (!this.player || !this.player.active) return null;

    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, targetX, targetY);
    if (dist <= 1) return null;

    // Mundur dari targetX, targetY ke arah posisi pemain mencari titik valid pertama
    const steps = Math.min(80, Math.max(10, Math.ceil(dist / 14)));
    for (let i = 1; i <= steps; i++) {
      const t = 1 - (i / steps);
      const testX = px + (targetX - px) * t;
      const testY = py + (targetY - py) * t;
      if (this.isLocationWalkable(testX, testY)) {
        return { x: testX, y: testY };
      }
    }
    return null;
  }

  /**
   * Memastikan tekstur catur 2x2 untuk Tembok Atas dan Tembok Samping tersedia di runtime
   */
  private ensureWallTextures(): void {
    if (!this.textures.exists('wall-top-checker') && this.textures.exists('tile-wall-dark') && this.textures.exists('tile-wall-light')) {
      try {
        const darkImg = this.textures.get('tile-wall-dark').getSourceImage() as HTMLImageElement;
        const lightImg = this.textures.get('tile-wall-light').getSourceImage() as HTMLImageElement;
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx && darkImg && lightImg) {
          ctx.drawImage(darkImg, 0, 0, 120, 120);
          ctx.drawImage(lightImg, 120, 0, 120, 120);
          ctx.drawImage(lightImg, 0, 120, 120, 120);
          ctx.drawImage(darkImg, 120, 120, 120, 120);
          this.textures.addCanvas('wall-top-checker', canvas);
        }
      } catch (e) {
        console.warn('[WorldScene] Gagal membuat tekstur wall-top-checker:', e);
      }
    }

    if (!this.textures.exists('wall-side-checker') && this.textures.exists('tile-wall-top-dark') && this.textures.exists('tile-wall-top-light')) {
      try {
        const darkTopImg = this.textures.get('tile-wall-top-dark').getSourceImage() as HTMLImageElement;
        const lightTopImg = this.textures.get('tile-wall-top-light').getSourceImage() as HTMLImageElement;
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx && darkTopImg && lightTopImg) {
          ctx.drawImage(darkTopImg, 0, 0, 120, 120);
          ctx.drawImage(lightTopImg, 120, 0, 120, 120);
          ctx.drawImage(lightTopImg, 0, 120, 120, 120);
          ctx.drawImage(darkTopImg, 120, 120, 120, 120);
          this.textures.addCanvas('wall-side-checker', canvas);
        }
      } catch (e) {
        console.warn('[WorldScene] Gagal membuat tekstur wall-side-checker:', e);
      }
    }
  }

  /**
   * Menghasilkan tekstur ombak HD alami, kaustik kristal, dan buih pantai untuk perairan Lautan Timur & Samudra Selatan
   */
  private ensureWaterTextures(): void {
    // 1. Tekstur Ombak Samudra HD (water-wave-tile - 480x480 Seamless)
    try {
      if (this.textures.exists('water-wave-tile')) {
        this.textures.remove('water-wave-tile');
      }
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 480, 480);

        const drawWave = (cx: number, cy: number, w: number, h: number, alpha: number) => {
          const drawAt = (ox: number, oy: number) => {
            ctx.save();
            // a. Bayangan biru tua kedalaman di bawah gelombang (3D depth)
            ctx.beginPath();
            ctx.moveTo(ox - w / 2, oy + 4);
            ctx.bezierCurveTo(ox - w / 4, oy - h + 4, ox + w / 4, oy + h + 4, ox + w / 2, oy + 4);
            ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.40})`;
            ctx.lineWidth = 4.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // b. Tubuh gelombang biru muda kristal transparan (translucent azure swell)
            ctx.beginPath();
            ctx.moveTo(ox - w / 2, oy);
            ctx.bezierCurveTo(ox - w / 4, oy - h, ox + w / 4, oy + h, ox + w / 2, oy);
            ctx.strokeStyle = `rgba(125, 211, 252, ${alpha * 0.65})`;
            ctx.lineWidth = 4.0;
            ctx.lineCap = 'round';
            ctx.stroke();

            // c. Puncak buih putih berkilau (crisp white frothy crest)
            ctx.beginPath();
            ctx.moveTo(ox - w / 2 + 3, oy);
            ctx.bezierCurveTo(ox - w / 4, oy - h * 0.9, ox + w / 4, oy + h * 0.9, ox + w / 2 - 3, oy);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
            ctx.lineWidth = 2.4;
            ctx.lineCap = 'round';
            ctx.stroke();

            // d. Percikan buih laut lembut (sea foam particles)
            ctx.fillStyle = `rgba(240, 249, 255, ${alpha * 0.85})`;
            ctx.beginPath();
            ctx.arc(ox - w * 0.22, oy - h * 0.4, 1.8, 0, Math.PI * 2);
            ctx.arc(ox + w * 0.18, oy + h * 0.35, 1.6, 0, Math.PI * 2);
            ctx.arc(ox + w * 0.35, oy + h * 0.15, 1.4, 0, Math.PI * 2);
            ctx.fill();

            // e. Bintang kilau pantulan sinar matahari (4-point sunlight glimmer sparkle)
            const sx = ox - w * 0.06;
            const sy = oy - h * 0.35;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.0})`;
            ctx.beginPath();
            ctx.moveTo(sx, sy - 4);
            ctx.lineTo(sx + 1.2, sy);
            ctx.lineTo(sx + 4, sy);
            ctx.lineTo(sx + 1.2, sy);
            ctx.lineTo(sx, sy + 4);
            ctx.lineTo(sx - 1.2, sy);
            ctx.lineTo(sx - 4, sy);
            ctx.lineTo(sx - 1.2, sy);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
          };

          drawAt(cx, cy);
          if (cx - w / 2 < 0) drawAt(cx + 480, cy);
          if (cx + w / 2 > 480) drawAt(cx - 480, cy);
          if (cy - h < 0) drawAt(cx, cy + 480);
          if (cy + h > 480) drawAt(cx, cy - 480);
        };

        const waveList = [
          { cx: 80, cy: 35, w: 110, h: 9, a: 0.70 },
          { cx: 280, cy: 45, w: 100, h: 8, a: 0.60 },
          { cx: 430, cy: 30, w: 80, h: 7, a: 0.65 },

          { cx: 180, cy: 105, w: 125, h: 10, a: 0.75 },
          { cx: 360, cy: 115, w: 90, h: 8, a: 0.55 },
          { cx: 30, cy: 120, w: 75, h: 7, a: 0.60 },

          { cx: 100, cy: 180, w: 105, h: 9, a: 0.65 },
          { cx: 270, cy: 170, w: 120, h: 10, a: 0.72 },
          { cx: 440, cy: 190, w: 85, h: 7, a: 0.58 },

          { cx: 190, cy: 250, w: 115, h: 9, a: 0.70 },
          { cx: 350, cy: 240, w: 100, h: 8, a: 0.62 },
          { cx: 40, cy: 260, w: 90, h: 8, a: 0.65 },

          { cx: 120, cy: 320, w: 120, h: 10, a: 0.75 },
          { cx: 290, cy: 330, w: 95, h: 8, a: 0.58 },
          { cx: 450, cy: 315, w: 80, h: 7, a: 0.55 },

          { cx: 210, cy: 395, w: 130, h: 10, a: 0.72 },
          { cx: 380, cy: 405, w: 85, h: 7, a: 0.55 },
          { cx: 50, cy: 400, w: 95, h: 8, a: 0.62 },

          { cx: 140, cy: 460, w: 100, h: 8, a: 0.62 },
          { cx: 310, cy: 455, w: 115, h: 9, a: 0.70 },
        ];

        waveList.forEach(w => drawWave(w.cx, w.cy, w.w, w.h, w.a));
        this.textures.addCanvas('water-wave-tile', canvas);
      }
    } catch (e) {
      console.warn('[WorldScene] Gagal membuat water-wave-tile:', e);
    }

    // 2. Tekstur Kaustik Cahaya Tropis & Riak Sekunder (water-wave-caustic - 480x480 Seamless)
    try {
      if (this.textures.exists('water-wave-caustic')) {
        this.textures.remove('water-wave-caustic');
      }
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 480, 480);

        const drawCausticRing = (cx: number, cy: number, rx: number, ry: number, a: number) => {
          const drawAt = (ox: number, oy: number) => {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ox, oy, rx, ry, Math.PI * 0.12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(186, 230, 253, ${a * 0.40})`;
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(ox + 1.5, oy - 1.5, rx * 0.85, ry * 0.85, Math.PI * 0.12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.65})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.restore();
          };
          drawAt(cx, cy);
          if (cx - rx < 0) drawAt(cx + 480, cy);
          if (cx + rx > 480) drawAt(cx - 480, cy);
          if (cy - ry < 0) drawAt(cx, cy + 480);
          if (cy + ry > 480) drawAt(cx, cy - 480);
        };

        const causticList = [
          { cx: 60, cy: 70, rx: 34, ry: 18, a: 0.55 },
          { cx: 220, cy: 50, rx: 42, ry: 20, a: 0.60 },
          { cx: 380, cy: 80, rx: 36, ry: 16, a: 0.50 },
          { cx: 140, cy: 160, rx: 44, ry: 22, a: 0.65 },
          { cx: 300, cy: 180, rx: 38, ry: 19, a: 0.55 },
          { cx: 450, cy: 150, rx: 32, ry: 15, a: 0.50 },
          { cx: 70, cy: 270, rx: 40, ry: 20, a: 0.60 },
          { cx: 230, cy: 290, rx: 46, ry: 24, a: 0.70 },
          { cx: 390, cy: 260, rx: 35, ry: 17, a: 0.52 },
          { cx: 150, cy: 380, rx: 42, ry: 21, a: 0.62 },
          { cx: 320, cy: 400, rx: 36, ry: 18, a: 0.58 },
          { cx: 460, cy: 370, rx: 30, ry: 14, a: 0.48 },
          { cx: 80, cy: 450, rx: 38, ry: 19, a: 0.55 },
          { cx: 250, cy: 460, rx: 44, ry: 22, a: 0.64 },
        ];

        causticList.forEach(c => drawCausticRing(c.cx, c.cy, c.rx, c.ry, c.a));
        this.textures.addCanvas('water-wave-caustic', canvas);
      }
    } catch (e) {
      console.warn('[WorldScene] Gagal membuat water-wave-caustic:', e);
    }

    // 3. Tekstur Buih Gulungan Ombak Pantai (water-shoreline-surf - 480x80)
    try {
      if (this.textures.exists('water-shoreline-surf')) {
        this.textures.remove('water-shoreline-surf');
      }
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 480, 80);

        // Lapisan basah pasir (wet sand backwash)
        ctx.fillStyle = 'rgba(140, 115, 62, 0.35)';
        ctx.fillRect(0, 0, 480, 24);

        // Buih ombak putih tebal berbusa (foaming shore surf)
        for (let x = 0; x < 480; x += 32) {
          ctx.beginPath();
          ctx.arc(x + 16, 26, 20, Math.PI, 0, false);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x + 16, 28, 14, Math.PI, 0, false);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
          ctx.fill();

          // Gelembung buih kecil
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(x + 8, 18, 3, 0, Math.PI * 2);
          ctx.arc(x + 22, 16, 2.5, 0, Math.PI * 2);
          ctx.arc(x + 14, 12, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Garis batas buih renda tajam (lacy foam crest)
        ctx.beginPath();
        for (let x = 0; x <= 480; x += 16) {
          const y = 30 + Math.sin(x * 0.12) * 5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        this.textures.addCanvas('water-shoreline-surf', canvas);
      }
    } catch (e) {
      console.warn('[WorldScene] Gagal membuat water-shoreline-surf:', e);
    }

    // 4. Tekstur Buih Gulungan Ombak Vertikal Pantai Timur (water-shoreline-surf-v - 80x480)
    try {
      if (this.textures.exists('water-shoreline-surf-v')) {
        this.textures.remove('water-shoreline-surf-v');
      }
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 80, 480);

        // Lapisan basah pasir di sisi barat/kiri (wet sand backwash)
        ctx.fillStyle = 'rgba(140, 115, 62, 0.35)';
        ctx.fillRect(0, 0, 24, 480);

        // Buih ombak putih tebal berbusa mengarah ke sisi timur/kanan (foaming shore surf)
        for (let y = 0; y < 480; y += 32) {
          ctx.beginPath();
          ctx.arc(26, y + 16, 20, -Math.PI / 2, Math.PI / 2, false);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(28, y + 16, 14, -Math.PI / 2, Math.PI / 2, false);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
          ctx.fill();

          // Gelembung buih kecil
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(18, y + 8, 3, 0, Math.PI * 2);
          ctx.arc(16, y + 22, 2.5, 0, Math.PI * 2);
          ctx.arc(12, y + 14, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Garis batas buih renda tajam vertikal (lacy foam crest)
        ctx.beginPath();
        for (let y = 0; y <= 480; y += 16) {
          const x = 30 + Math.sin(y * 0.12) * 5;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        this.textures.addCanvas('water-shoreline-surf-v', canvas);
      }
    } catch (e) {
      console.warn('[WorldScene] Gagal membuat water-shoreline-surf-v:', e);
    }
  }

  /**
   * Menampilkan feedback visual terhalang (Red Ring & 🚫 Sign) saat klik/tap lokasi tak terjangkau
   */
  private spawnBlockedFeedback(x: number, y: number): void {
    const gfx = this.add.graphics();
    gfx.setDepth(99999);

    // Bayangan merah gelap di lantai
    gfx.fillStyle(0x7f1d1d, 0.45);
    gfx.fillEllipse(x, y, 32, 16);

    // Lingkaran merah peringatan berdenyut
    gfx.lineStyle(2, 0xef4444, 0.95);
    gfx.strokeCircle(x, y - 6, 16);

    // Garis diagonal silang tanda larangan 🚫
    gfx.lineStyle(2.5, 0xf87171, 0.95);
    gfx.lineBetween(x - 9, y - 15, x + 9, y + 3);

    // Titik pusat tanda silang
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(x, y - 6, 2.5);

    // Efek tween getar dan memudar
    this.tweens.add({
      targets: gfx,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeOut',
      onComplete: () => gfx.destroy(),
    });
  }

  private interactWithNpc(npcData: INpcConfig): void {
    EventBus.emit('open-dialogue', {
      id: npcData.id,
      name: npcData.name,
      role: npcData.role,
      avatarType: npcData.avatarType,
      avatarUrl: npcData.avatarUrl,
      dialogues: npcData.dialogues && npcData.dialogues.length > 0 ? npcData.dialogues : [npcData.greeting],
    });
  }

  public spawnLocalPlayer(name: string, avatar: IAvatarCustomization, nearHouse: boolean = false): void {
    if (this.player && this.player.active && this.player.scene === this) {
      this.player.setAvatar(avatar);
      if (name) {
        this.player.setEntityName(name);
      }
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.startFollow(this.player, true, 1.0, 1.0);
      this.cameras.main.centerOn(this.player.x, this.player.y);
      return;
    }

    // Default spawn di persimpangan jalan utama (gx: 20, gy: 20 = 2460, 2460)
    let spawnX = 2460;
    let spawnY = 2460;

    if (this.customSpawnPos) {
      spawnX = this.customSpawnPos.x;
      spawnY = this.customSpawnPos.y;
    } else if (!nearHouse) {
      try {
        const saved = localStorage.getItem('raden_pos_world');
        if (saved) {
          const p = JSON.parse(saved);
          if (typeof p.x === 'number' && typeof p.y === 'number') {
            if (p.x >= 240 && p.x <= this.worldWidth - 240 && p.y >= 240 && p.y <= this.worldHeight - 240) {
              spawnX = p.x;
              spawnY = p.y;
            }
          }
        }
      } catch (e) { }
    }

    this.player = new Player(
      this,
      spawnX,
      spawnY,
      'local_player',
      name,
      avatar,
      100,
      100
    );

    if (this.obstacles) {
      this.physics.add.collider(this.player, this.obstacles);
    }

    // Perluas batas kamera dengan margin 1600px di luar grid dunia (80x80)
    // agar kamera SELALU fokus tepat di tengah layar meskipun karakter berada di pojok/ujung peta
    if (!this.cameraController) {
      this.setupCameraZoomControls(0.9);
    }
    const cameraMargin = 1600;
    this.cameraController.setBounds(
      -cameraMargin,
      -cameraMargin,
      this.worldWidth + cameraMargin * 2,
      this.worldHeight + cameraMargin * 2
    );
    this.cameraController.centerOn(spawnX, spawnY);
    this.cameraController.follow(this.player, true, 1.0, 1.0);
    this.smoothZoomTo(0.9);

    this.networkManager.connect();
    const isSuperAdmin = name.toUpperCase() === 'RADEN';
    let savedGold = isSuperAdmin ? 999999 : 2500;
    let savedDiamonds = isSuperAdmin ? 99999 : 50;
    try {
      const g = localStorage.getItem('raden_player_gold');
      if (g) savedGold = parseInt(g, 10);
      const d = localStorage.getItem('raden_player_diamonds');
      if (d) savedDiamonds = parseInt(d, 10);
    } catch (e) { }

    this.networkManager.joinGame(
      name,
      avatar,
      isSuperAdmin ? 'super_admin' : 'player',
      isSuperAdmin,
      spawnX,
      spawnY,
      'down',
      savedGold,
      savedDiamonds
    );
    this.networkManager.sendMovement(spawnX, spawnY, 'down', false);

    this.time.delayedCall(600, () => {
      this.player?.showSpeechBubble(isSuperAdmin ? '👑 Salam damai, RadenWorld!' : 'Halo dunia terbuka!');
    });
  }

  private setupMultiplayerListeners(): void {
    this.networkManager.clearListeners();

    this.networkManager.onWorldInit((data: IWorldInitData) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const myName = (this.player?.getEntityName() || this.pendingPlayerName || '').trim().toLowerCase();
      const myId = this.networkManager.getSocketId();

      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();

      data.players.forEach(p => {
        if (p.id === myId || p.id === data.selfId) return;
        if (myName && p.name && p.name.trim().toLowerCase() === myName) return;
        this.addRemotePlayer(p);
      });
      EventBus.emit('player-count-updated', this.remotePlayers.size + 1);
    });

    this.networkManager.onPlayerJoined((playerData: IPlayerData) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const myName = (this.player?.getEntityName() || this.pendingPlayerName || '').trim().toLowerCase();
      const myId = this.networkManager.getSocketId();

      if (playerData.id === myId) return;
      if (myName && playerData.name && playerData.name.trim().toLowerCase() === myName) return;

      this.addRemotePlayer(playerData);
      EventBus.emit('player-count-updated', this.remotePlayers.size + 1);

      EventBus.emit('new-chat-message', {
        id: `join_${Date.now()}_${Math.random()}`,
        senderId: 'system',
        senderName: 'Sistem',
        text: `${playerData.name} telah memasuki open world!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    this.networkManager.onPlayerMoved((data) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const remotePlayer = this.remotePlayers.get(data.id);
      if (remotePlayer && remotePlayer.active) {
        remotePlayer.setNetworkState(data.x, data.y, data.direction, data.isMoving);
      }
    });

    this.networkManager.onPlayerLeft((data) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const remotePlayer = this.remotePlayers.get(data.id);
      if (remotePlayer) {
        remotePlayer.destroy();
        this.remotePlayers.delete(data.id);
        EventBus.emit('player-count-updated', this.remotePlayers.size + 1);

        EventBus.emit('new-chat-message', {
          id: `leave_${Date.now()}_${Math.random()}`,
          senderId: 'system',
          senderName: 'Sistem',
          text: `${data.name} meninggalkan open world.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    this.networkManager.onChatBroadcast((chat: IChatMessage) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      EventBus.emit('new-chat-message', chat);
      const remote = this.remotePlayers.get(chat.senderId);
      if (remote && remote.active) {
        remote.showSpeechBubble(chat.text);
      }
    });

    this.networkManager.onPlayerAfk((data) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.setAfk(data.isAfk, data.durationSeconds);
      }
    });

    this.networkManager.onPlayerJumped((data) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.triggerJump(data.jumpCount);
      }
    });

    this.networkManager.onPlayerExpression((data) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.triggerExpression(data.type);
      }
    });
  }

  private addRemotePlayer(p: IPlayerData): void {
    if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
    const myName = (this.player?.getEntityName() || this.pendingPlayerName || '').trim().toLowerCase();
    const myId = this.networkManager.getSocketId();

    if (p.id === myId) return;
    if (myName && p.name && p.name.trim().toLowerCase() === myName) return;

    if (this.remotePlayers.has(p.id)) {
      const existing = this.remotePlayers.get(p.id);
      if (existing && existing.active) {
        existing.setNetworkState(p.x, p.y, p.direction || 'down', false);
        existing.setPosition(p.x, p.y);
      }
      return;
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
        100,
        100
      );
      this.remotePlayers.set(p.id, remote);
    } catch (err) {
      console.warn('[WorldScene] Gagal menambahkan remote player:', err);
    }
  }

  public update(time: number, delta: number): void {
    // Interpolasi zoom kamera halus via CameraController
    this.cameraController?.update(time, delta);

    // Animasi Riak & Ombak Air Laut Mengalir HD (Fluid Waves, Glimmer & Sparkling Caustics 60 FPS)
    const t = time * 0.001;
    this.waterWaves1.forEach((w) => {
      w.tilePositionX += delta * 0.026;
      w.tilePositionY = Math.sin(t * 1.6 + w.x * 0.001) * 8;
    });
    this.waterWaves2.forEach((w) => {
      w.tilePositionX -= delta * 0.016;
      w.tilePositionY = Math.cos(t * 1.3 + w.y * 0.001) * 7;
    });

    // Animasi Gulungan Buih Ombak Pasir Pantai Selatan & Timur (Tidal Breathing Surf)
    this.shorelineSurfs.forEach((s) => {
      if (s.isVertical) {
        s.sprite.tilePositionY += delta * 0.032;
        s.sprite.x = (s.baseX ?? s.sprite.x) + Math.sin(t * 1.5) * 8;
        s.sprite.alpha = 0.82 + Math.sin(t * 1.5) * 0.18;
      } else {
        s.sprite.tilePositionX += delta * 0.032;
        s.sprite.y = (s.baseY ?? s.sprite.y) + Math.sin(t * 1.5) * 8;
        s.sprite.alpha = 0.82 + Math.sin(t * 1.5) * 0.18;
      }
    });

    // Gerakkan awan terapung acak secara independen (Organic Floating Clouds)
    const dt = delta / 1000;
    const allCloudKeys = [
      'cloud-cumulus-1', 'cloud-cumulus-2', 'cloud-cumulus-3', 'cloud-cumulus-4',
      'cloud-stratus-5', 'cloud-split-6', 'cloud-fragment-7', 'cloud-dense-8'
    ];
    for (const c of this.clouds) {
      c.sprite.x += c.speedX * dt;
      c.sprite.y += c.speedY * dt;

      // Jika awan keluar dari batas kanan/bawah dunia, bungkus ulang ke kiri/atas di posisi acak baru dengan bentuk baru
      if (c.sprite.x > this.worldWidth + 600) {
        c.sprite.x = -600;
        c.sprite.y = Phaser.Math.Between(-200, this.worldHeight);
        const newKey = allCloudKeys[Phaser.Math.Between(0, allCloudKeys.length - 1)];
        if (this.textures.exists(newKey)) c.sprite.setTexture(newKey);
        c.sprite.setScale(Phaser.Math.FloatBetween(1.1, 2.7), Phaser.Math.FloatBetween(0.8, 2.2));
        c.sprite.setAngle(Phaser.Math.Between(-30, 30));
        c.sprite.setFlip(Math.random() > 0.5, Math.random() > 0.5);
        c.speedX = Phaser.Math.FloatBetween(22, 42);
        c.speedY = Phaser.Math.FloatBetween(7, 18);
      }
      if (c.sprite.y > this.worldHeight + 600) {
        c.sprite.y = -600;
        c.sprite.x = Phaser.Math.Between(-200, this.worldWidth);
        const newKey = allCloudKeys[Phaser.Math.Between(0, allCloudKeys.length - 1)];
        if (this.textures.exists(newKey)) c.sprite.setTexture(newKey);
        c.sprite.setScale(Phaser.Math.FloatBetween(1.1, 2.7), Phaser.Math.FloatBetween(0.8, 2.2));
        c.sprite.setAngle(Phaser.Math.Between(-30, 30));
        c.sprite.setFlip(Math.random() > 0.5, Math.random() > 0.5);
        c.speedX = Phaser.Math.FloatBetween(22, 42);
        c.speedY = Phaser.Math.FloatBetween(7, 18);
      }
    }

    if (!this.player || !this.player.active) return;
    this.player.update(time, delta);
    this.player.setDepth(this.player.y + 60);

    const px = this.player.x;
    const py = this.player.y;

    // Jarak ke pintu-pintu gedung
    const distHouse = Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y);
    const distSd = Phaser.Math.Distance.Between(px, py, this.schoolSdDoor.x, this.schoolSdDoor.y);
    const distSmp = Phaser.Math.Distance.Between(px, py, this.schoolSmpDoor.x, this.schoolSmpDoor.y);
    const distSma = Phaser.Math.Distance.Between(px, py, this.schoolSmaDoor.x, this.schoolSmaDoor.y);
    const distCafe = Phaser.Math.Distance.Between(px, py, this.cafeDoor.x, this.cafeDoor.y);
    const distHospital = Phaser.Math.Distance.Between(px, py, this.hospitalDoor.x, this.hospitalDoor.y);
    const distBank = Phaser.Math.Distance.Between(px, py, this.bankDoor.x, this.bankDoor.y);

    let prompt: string | null = null;
    let locationName = this.getRegionName(px, py);

    if (distHouse < 130 && time > this.doorCooldownUntil) {
      prompt = `TEKAN [E] / KLIK UNTUK MASUK KE RUMAH PRIBADI (${this.privateRoomId})`;
      locationName = 'KAWASAN RESIDENSIAL: RUMAH PEMAIN';
    } else if (distSd < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SD';
      locationName = 'KOMPLEKS PENDIDIKAN: GEDUNG SD';
    } else if (distSmp < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SMP';
      locationName = 'KOMPLEKS PENDIDIKAN: GEDUNG SMP';
    } else if (distSma < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SMA';
      locationName = 'KOMPLEKS PENDIDIKAN: GEDUNG SMA';
    } else if (distCafe < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MAMPIR KE RADEN CAFE & BAKERY';
      locationName = 'KAWASAN BISNIS: RADEN CAFE & BAKERY';
    } else if (distHospital < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE RUMAH SAKIT (PULIHKAN HP)';
      locationName = 'KAWASAN KESEHATAN: RUMAH SAKIT KOTA';
    } else if (distBank < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MENGUNJUNGI BANK SENTRAL RADEN';
      locationName = 'KAWASAN FINANSIAL: BANK SENTRAL RADEN';
    } else if (
      Phaser.Math.Distance.Between(px, py, 30 * this.tileSize, 48 * this.tileSize) < 240 ||
      Phaser.Math.Distance.Between(px, py, 50 * this.tileSize, 48 * this.tileSize) < 240
    ) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMBUKA PAPAN INFORMASI (world/popup)';
      locationName = 'ALUN-ALUN PUSAT: PAPAN POPUP INFORMASI';
    } else {
      for (const npc of this.npcs) {
        const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
        if (dist < 100) {
          prompt = `TEKAN [E] / KLIK UNTUK BICARA DENGAN ${npc.name.toUpperCase()}`;
          break;
        }
      }

      if (!prompt) {
        const gx = Math.floor(px / this.tileSize);
        const gy = Math.floor(py / this.tileSize);
        const isPierOrWaterfront = (
          (gx >= 61 && gx <= 74 && gy >= 23 && gy <= 56) ||
          (gy >= 68 && gy <= 78)
        );
        const isNearFountain = Math.hypot(px - 4800, py - 4800) <= 260;
        if (isPierOrWaterfront || isNearFountain) {
          prompt = 'TEKAN [F] / SENTUH MANCING UNTUK MEMANCING';
        }
      }
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }

    const gridX = Math.floor(px / this.tileSize);
    const gridY = Math.floor(py / this.tileSize);
    const locChanged = locationName !== this.lastLocationName;
    const gridChanged = gridX !== this.lastGridX || gridY !== this.lastGridY;
    const periodicTimeout = time - this.lastStatsEmitTime > 1500;

    if (locChanged || gridChanged || periodicTimeout) {
      this.lastStatsEmitTime = time;
      this.lastGridX = gridX;
      this.lastGridY = gridY;
      this.lastLocationName = locationName;
      EventBus.emit('player-stats-updated', {
        x: Math.round(px),
        y: Math.round(py),
        gridX,
        gridY,
        direction: this.player.getDirection(),
        hp: this.player.getHealth(),
        maxHp: this.player.getMaxHealth(),
        name: this.player.getEntityName(),
        avatar: this.player.getAvatar(),
        roomName: locationName,
        inHouse: false,
        level: 1,
      });
    }

    if (time - this.lastPosSaveTime > 5000) {
      this.lastPosSaveTime = time;
      try {
        localStorage.setItem(
          'raden_pos_world',
          JSON.stringify({ x: Math.round(px), y: Math.round(py) })
        );
      } catch (e) { }
    }

    this.remotePlayers.forEach(p => {
      p.update(time, delta);
      p.setDepth(p.y + 60);
    });
  }

  public triggerCurrentInteraction(): void {
    if (!this.player || this.isTransitioning) return;
    const px = this.player.x;
    const py = this.player.y;

    // 1. Masuk ke Gedung SD
    if (Phaser.Math.Distance.Between(px, py, this.schoolSdDoor.x, this.schoolSdDoor.y) < 130) {
      this.openSchoolGradeSelect('sd', this.schoolSdDoor.x, this.schoolSdDoor.y + 60);
      return;
    }

    // 2. Masuk ke Gedung SMP
    if (Phaser.Math.Distance.Between(px, py, this.schoolSmpDoor.x, this.schoolSmpDoor.y) < 130) {
      this.openSchoolGradeSelect('smp', this.schoolSmpDoor.x, this.schoolSmpDoor.y + 60);
      return;
    }

    // 3. Masuk ke Gedung SMA
    if (Phaser.Math.Distance.Between(px, py, this.schoolSmaDoor.x, this.schoolSmaDoor.y) < 130) {
      this.openSchoolGradeSelect('sma', this.schoolSmaDoor.x, this.schoolSmaDoor.y + 60);
      return;
    }

    // 4. Masuk ke Rumah Pribadi
    const distHouse = Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y);
    if (distHouse < 130 && (!this.time || this.time.now > this.doorCooldownUntil)) {
      this.transitionToHouse();
      return;
    }

    // 5. Interaksi dengan Cafe
    if (Phaser.Math.Distance.Between(px, py, this.cafeDoor.x, this.cafeDoor.y) < 130) {
      this.player.showSpeechBubble('Selamat datang di Raden Cafe & Bakery! Nikmati kopi aromatik dan aneka pastry hangat! ☕🥐', 3000);
      return;
    }

    // 6. Interaksi dengan Rumah Sakit (Heal HP)
    if (Phaser.Math.Distance.Between(px, py, this.hospitalDoor.x, this.hospitalDoor.y) < 130) {
      this.healPlayerAtHospital();
      return;
    }

    // 7. Interaksi dengan Bank Sentral
    if (Phaser.Math.Distance.Between(px, py, this.bankDoor.x, this.bankDoor.y) < 130) {
      this.player.showSpeechBubble('🏦 Bank Sentral Raden: Layanan simpan pinjam emas dan transaksi finansial aman terpercaya!', 3000);
      return;
    }

    // 8. Interaksi dengan Papan Popup Alun-Alun (world/popup)
    if (
      Phaser.Math.Distance.Between(px, py, 30 * this.tileSize, 48 * this.tileSize) < 240 ||
      Phaser.Math.Distance.Between(px, py, 50 * this.tileSize, 48 * this.tileSize) < 240
    ) {
      window.open('/world/popup', '_blank');
      return;
    }

    // 9. Interaksi dengan NPC terdekat
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
      if (dist < 120) {
        this.interactWithNpc(npc);
        return;
      }
    }
  }

  private transitionToSchool(schoolType: 'sd' | 'smp' | 'sma', returnX: number, returnY: number, grade?: number): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const resolvedGrade = (typeof grade === 'number' && grade >= 1) ? grade : (() => {
      try {
        const saved = localStorage.getItem(`raden_school_${schoolType}_grade`);
        return saved ? parseInt(saved, 10) : 1;
      } catch (e) {
        return 1;
      }
    })();

    const label = schoolType === 'sd'
      ? `Gedung SD (Kelas ${resolvedGrade})`
      : schoolType === 'smp'
        ? `Gedung SMP (Kelas ${resolvedGrade})`
        : `Gedung SMA (Kelas ${resolvedGrade})`;
    this.player?.showSpeechBubble(`Masuk ke ${label}...`);

    try {
      localStorage.setItem(`raden_school_${schoolType}_grade`, resolvedGrade.toString());
    } catch (e) { }

    const schoolPath = `/world/${schoolType}`;
    if (window.location.pathname !== schoolPath) {
      window.history.pushState(null, '', schoolPath);
    }
    EventBus.emit('url-changed', schoolPath);

    this.time.delayedCall(400, () => {
      this.cameras?.main?.stopFollow();
      this.scene.start('SchoolScene', {
        schoolType,
        grade: resolvedGrade,
        name: this.player?.getEntityName() || this.pendingPlayerName || 'Petualang',
        avatar: this.player?.getAvatar() || this.pendingAvatar,
        returnX,
        returnY,
        fromDoor: true,
      });
    });
  }

  private transitionToHouse(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.player?.showSpeechBubble('Kembali ke rumah pribadi...');

    this.time.delayedCall(400, () => {
      let safeId = this.privateRoomId;
      try {
        const storedUser = localStorage.getItem('raden_player_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.private_room_id) safeId = u.private_room_id;
        }
      } catch (e) { }

      const housePath = `/home/${safeId}`;
      if (window.location.pathname !== housePath) {
        window.history.pushState(null, '', housePath);
      }
      EventBus.emit('url-changed', housePath);
      this.cameras?.main?.stopFollow();
      this.networkManager.disconnect();
      this.scene.start('HouseScene', {
        name: this.player?.getEntityName() || this.pendingPlayerName || 'Petualang',
        avatar: this.player?.getAvatar() || this.pendingAvatar,
        privateRoomId: safeId,
      });
    });
  }

  private getRegionName(x: number, y: number): string {
    const gx = Math.floor(x / this.tileSize);
    const gy = Math.floor(y / this.tileSize);

    // 1. Kompleks Pendidikan SD - SMP - SMA (Utara Pusat)
    if (Math.hypot(x - this.schoolSdDoor.x, y - this.schoolSdDoor.y) < 240) return 'KOMPLEKS PENDIDIKAN: GEDUNG SD';
    if (Math.hypot(x - this.schoolSmpDoor.x, y - this.schoolSmpDoor.y) < 240) return 'KOMPLEKS PENDIDIKAN: GEDUNG SMP';
    if (Math.hypot(x - this.schoolSmaDoor.x, y - this.schoolSmaDoor.y) < 240) return 'KOMPLEKS PENDIDIKAN: GEDUNG SMA';
    if (gy <= 13 && gx >= 22 && gx <= 57) return 'KOMPLEKS PENDIDIKAN TERPADU';

    // 2. Kiri Atas: Kawasan Residensial
    if (Math.hypot(x - this.playerHouseDoor.x, y - this.playerHouseDoor.y) < 260) return 'KAWASAN RESIDENSIAL: RUMAH PEMAIN';
    if (gy <= 13 && gx <= 21) return 'TAMAN RESIDENSIAL BARAT LAUT';

    // 3. Timur Laut: Kawasan Persawahan & Pertanian
    if (gy <= 13 && gx >= 58) return 'KAWASAN PERSAWAHAN & PERTANIAN SUBUR';

    // 4. Barat: Kawasan Komersial & Layanan Publik
    if (Math.hypot(x - this.cafeDoor.x, y - this.cafeDoor.y) < 260) return 'KAWASAN BISNIS: RADEN CAFE & BAKERY';
    if (Math.hypot(x - this.hospitalDoor.x, y - this.hospitalDoor.y) < 260) return 'KAWASAN KESEHATAN: RUMAH SAKIT KOTA';
    if (Math.hypot(x - this.bankDoor.x, y - this.bankDoor.y) < 260) return 'KAWASAN FINANSIAL: BANK SENTRAL RADEN';
    if (gx <= 18 && gy >= 14 && gy <= 63) return 'BOULEVARD LAYANAN PUBLIK & PERKANTORAN';

    // 5. Central Plaza / Alun-Alun Pusat Kota
    if (gx >= 23 && gx <= 36 && gy >= 21 && gy <= 34) return 'PUJASERA KULINER CENTRAL PLAZA';
    if (gx >= 45 && gx <= 56 && gy >= 21 && gy <= 30) return 'PANGGUNG HIBURAN ALUN-ALUN';
    if (Math.hypot(x - 4800, y - 4800) < 420) return 'MONUMEN PATUNG KOTA LAMONGAN';
    if (gx >= 24 && gx <= 56 && gy >= 50 && gy <= 59) return 'GELANGGANG OLAHRAGA BASKET & FUTSAL';
    if (gx >= 22 && gx <= 57 && gy >= 16 && gy <= 61) return 'SANCTUARY CENTRAL PLAZA (ALUN-ALUN KOTA)';

    // 6. Timur: Teluk Bahari & Dermaga
    if (gx >= 61 && gy >= 23 && gy <= 27) return 'DERMAGA 1: TELUK BAHARI UTARA';
    if (gx >= 61 && gy >= 37 && gy <= 41) return 'DERMAGA 2: ANJUNGAN NELAYAN DANU';
    if (gx >= 61 && gy >= 51 && gy <= 55) return 'DERMAGA 3: DERMAGA KAPAL WISATA';
    if (gx >= 60 && gy >= 14 && gy <= 64) return 'DERMAGA BAHARI & TELUK LAUT TIMUR';

    // 7. Selatan: Pantai & Samudra
    if (gy >= 79) return 'SAMUDRA LAUT LEPAS SELATAN';
    if (gy >= 64) return 'PANTAI PASIR KEEMASAN SELATAN';

    // 8. Jalan Raya Protokol
    if (gy <= 15) return 'JALAN PROTOKOL UTARA';
    if (gx <= 21) return 'JALAN PROTOKOL BARAT';
    if (gx >= 58) return 'JALAN PROTOKOL TIMUR';
    if (gy >= 62) return 'JALAN PROTOKOL SELATAN';

    return 'JALAN PROTOKOL LINGKAR KOTA';
  }
}
