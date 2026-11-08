/**
 * ============================================================================
 * FILE: resources/js/game/scenes/WorldScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene 2D Open World Multiplayer luas (9600x9600 pixel, 80x80 petak grid 120px)
 * Direkonstruksi 100% presisi mengikuti Blueprint Peta Dunia.
 *
 * MODULARISASI ARSITEKTUR:
 * 1. WorldTextures.ts       -> Generator tekstur prosedural (Wall & Water/Beach)
 * 2. WorldTerrain.ts        -> Permukaan tanah, tembok, jalan aspal, trotoar, laut & awan
 * 3. WorldProps.ts          -> Lampu jalan (44 lampu), kustom arsitek & slot gedung baru
 * 4. WorldNpcs.ts           -> Konfigurasi, pembuatan & dialog interaktif NPC
 * 5. WorldInteractions.ts   -> Pintu, deteksi prompt, nama wilayah & perpindahan scene
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { CameraController } from '../controllers/CameraController';
import type { IPlayerData, IChatMessage, IWorldInitData, IAvatarCustomization, INpcConfig } from '../types';

import { WorldTextures } from './world/WorldTextures';
import { WorldTerrain } from './world/WorldTerrain';
import type { IWorldShorelineSurf, IWorldCloud } from './world/WorldTerrain';
import { WorldProps } from './world/WorldProps';
import { WorldNpcs } from './world/WorldNpcs';
import { WorldInteractions, DEFAULT_WORLD_DOORS } from './world/WorldInteractions';
import type { IWorldDoors } from './world/WorldInteractions';
import { WorldFarming } from './world/WorldFarming';
import { InventoryManager } from '../core/InventoryManager';
import { GraphicsQualityManager } from '../core/GraphicsQualityManager';



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
  private customArchitectTerrainObstacles: Phaser.GameObjects.GameObject[] = [];

  private pendingPlayerName: string | null = null;
  private pendingAvatar: IAvatarCustomization | null = null;
  private spawnNearHouseDoor: boolean = false;
  private privateRoomId: string = 'safe-01';

  // Zona Bangunan & Pintu Interaktif (Sesuai Blueprint 100%)
  private doors: IWorldDoors = { ...DEFAULT_WORLD_DOORS };

  private customSpawnPos: { x: number; y: number } | null = null;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private lastPosSaveTime: number = 0;
  private lastGridX: number = -1;
  private lastGridY: number = -1;
  private lastLocationName: string = '';
  private lastProximityCheckTime: number = 0;
  private cachedProximityLocation: string = '';
  private doorCooldownUntil: number = 0;
  private isTransitioning: boolean = false;

  // Kontrol zoom kamera halus
  private targetZoom: number = 0.9;

  // Daftar NPC Interaktif
  private npcs: INpcConfig[] = [];

  // Elemen Dinamis Lingkungan (Ombak, Buih Pantai & Awan)
  private waterWaves1: Phaser.GameObjects.TileSprite[] = [];
  private waterWaves2: Phaser.GameObjects.TileSprite[] = [];
  private shorelineSurfs: IWorldShorelineSurf[] = [];
  private clouds: IWorldCloud[] = [];
  public digTiles: Phaser.GameObjects.Image[] = [];

  // Sistem Atmosfer Malam Biru Realistis & Lightmap Lampu Jalan
  private nightCanvasTex: Phaser.Textures.CanvasTexture | null = null;
  private nightOverlaySprite: Phaser.GameObjects.Image | null = null;
  private lastNightLightmapTime: number = 0;
  private lastNightCamX: number = -99999;
  private lastNightCamY: number = -99999;
  private lastNightPlayerX: number = -99999;
  private lastNightPlayerY: number = -99999;
  private lastNightZoom: number = -1;

  // Cache bounding box rintangan statis untuk performa tinggi
  private cachedObstacleBoxes: { minX: number; maxX: number; minY: number; maxY: number }[] | null = null;

  // Pengaturan Grafik & Batas Pemain Terlihat
  private maxVisiblePlayers: number = 50;
  private enableMovementEffects: boolean = true;
  private enableAntiAliasing: boolean = true;
  private lastVisibilityCheckTime: number = 0;
  private handHoldState: { partnerName: string; partnerId?: string; role: 'leader' | 'follower' } | null = null;
  private lastHandHoldSyncTime: number = 0;

  constructor() {
    super({ key: 'WorldScene' });
    this.networkManager = NetworkManager.getInstance();
  }

  public init(data?: {
    name?: string;
    avatar?: IAvatarCustomization;
    spawnNearHouse?: boolean;
    privateRoomId?: string;
    spawnPos?: { x: number; y: number };
  }): void {
    this.isTransitioning = false;
    this.doorCooldownUntil = this.time ? this.time.now + 2500 : 0;
    if (this.player) {
      try {
        this.player.destroy();
      } catch (e) {}
      this.player = null as any;
    }

    if (data?.name) this.pendingPlayerName = data.name;
    if (data?.avatar) this.pendingAvatar = data.avatar;
    this.spawnNearHouseDoor = !!data?.spawnNearHouse;
    if (data?.privateRoomId) this.privateRoomId = data.privateRoomId;
    if (data?.spawnPos) this.customSpawnPos = data.spawnPos;
    else this.customSpawnPos = null;

    this.worldWidth = 9600;
    this.worldHeight = 9600;
  }

  public create(): void {
    // 0. Aktifkan cooldown pintu 3 detik agar pemain yang baru keluar tidak terhisap kembali
    this.doorCooldownUntil = this.time ? this.time.now + 3000 : 3000;

    // 0b. Muat preferensi pengaturan grafik (Batas User, Efek Gerakan, AA)
    try {
      const gs = JSON.parse(localStorage.getItem('raden_game_settings') || '{}');
      if (typeof gs.maxVisiblePlayers === 'number') this.maxVisiblePlayers = gs.maxVisiblePlayers;
      if (typeof gs.enableMovementEffects === 'boolean') this.enableMovementEffects = gs.enableMovementEffects;
      if (typeof gs.enableAntiAliasing === 'boolean') this.enableAntiAliasing = gs.enableAntiAliasing;
    } catch (e) {}

    const onGraphicsSettingsUpdated = (data: any) => {
      if (typeof data?.maxVisiblePlayers === 'number') {
        this.maxVisiblePlayers = data.maxVisiblePlayers;
        this.applyVisiblePlayersLimit();
      }
      if (typeof data?.enableMovementEffects === 'boolean') {
        this.enableMovementEffects = data.enableMovementEffects;
      }
      if (typeof data?.enableAntiAliasing === 'boolean') {
        this.enableAntiAliasing = data.enableAntiAliasing;
      }
      // Terapkan filter mipmap & stabilisasi sub-piksel sesuai kualitas grafik
      GraphicsQualityManager.applyToScene(this, data);
      // Optimasi grafis hemat daya jika mode 'low' dipilih
      if (data?.graphicsQuality === 'low') {
        if (this.clouds) this.clouds.forEach(c => c.sprite?.setVisible(false));
      } else if (this.clouds) {
        this.clouds.forEach(c => c.sprite?.setVisible(true));
      }
    };
    const onHandHoldStateChanged = (state: { partnerName: string; partnerId?: string; role: 'leader' | 'follower' } | null) => {
      this.handHoldState = state;
      if (state && this.player && this.player.active) {
        this.player.showSpeechBubble(
          state.role === 'follower'
            ? `Mengikuti ${state.partnerName} (Pegangan Tangan)`
            : `Pegangan tangan dengan ${state.partnerName}`,
          2200
        );
      }
    };
    EventBus.on('graphics-settings-updated', onGraphicsSettingsUpdated);
    EventBus.on('handhold-state-changed', onHandHoldStateChanged);
    this.events.once('shutdown', () => {
      EventBus.off('graphics-settings-updated', onGraphicsSettingsUpdated);
      EventBus.off('handhold-state-changed', onHandHoldStateChanged);
    });

    // 1. Batas fisika dunia diperlebar mencakup buffer (3600px) agar koridor jalan bisa dilewati ke luar
    const buf = 3600;
    this.physics.world.setBounds(-buf, -buf, this.worldWidth + buf * 2, this.worldHeight + buf * 2);

    // 2. Inisialisasi grup rintangan fisik statis
    this.obstacles = this.physics.add.staticGroup();

    // 3. Masuk ke room 'world' pada WebSocket Server
    this.networkManager.switchRoom('world');

    // 4. Pastikan tekstur prosedural Canvas (Wall Checker, Animated Water, Alun-Alun, Trotoar 2 & Cahaya Lampu) tersedia
    WorldTextures.ensureWallTextures(this);
    WorldTextures.ensureWaterTextures(this);
    WorldTextures.ensureAlunAlunTextures(this);
    WorldTextures.ensureTrotoar2Textures(this);
    WorldTextures.ensureLightingTextures(this);

    // 5. Render lingkungan Open World 1:1 mengikuti Blueprint Peta (WorldTerrain)
    const terrain = WorldTerrain.createWorldTerrain(
      this,
      this.worldWidth,
      this.worldHeight,
      this.tileSize,
      this.obstacles,
      (gx, gy, gw, gh) => this.addGridObstacle(gx, gy, gw, gh)
    );
    this.waterWaves1 = terrain.waterWaves1;
    this.waterWaves2 = terrain.waterWaves2;
    this.shorelineSurfs = terrain.shorelineSurfs;
    this.clouds = terrain.clouds;
    this.digTiles = terrain.digTiles;

    // Terapkan kualitas awal awan jika mode grafis 'low'
    try {
      const gs = JSON.parse(localStorage.getItem('raden_game_settings') || '{}');
      if (gs.graphicsQuality === 'low' && this.clouds) {
        this.clouds.forEach(c => c.sprite?.setVisible(false));
      }
    } catch (e) {}

    // 5b. Inisialisasi Sistem Pertanian Kebun Tani (Menanam Biji, Menyiram & Panen)
    WorldFarming.init(this, this.tileSize, this.digTiles);

    // 6. Tempatkan Lampu Jalan (44 Lampu), Kustom Props Arsitek, & Slot Gedung Baru (WorldProps)
    WorldProps.resetProps();
    WorldProps.spawnWorldLamps((key, gx, gy, gw, gh, isObstacle, interactiveCallback, obstacleRows) =>
      this.addGridProp(key, gx, gy, gw, gh, isObstacle, interactiveCallback, obstacleRows)
    );
    this.spawnArchitectCustomProps();
    WorldProps.buildFutureBuildings(
      this,
      this.tileSize,
      this.obstacles,
      (key, gx, gy, gw, gh, isObstacle, interactiveCallback, obstacleRows) =>
        this.addGridProp(key, gx, gy, gw, gh, isObstacle, interactiveCallback, obstacleRows)
    );

    // 7. Render seluruh NPC Interaktif di posisinya masing-masing (WorldNpcs)
    this.createWorldNpcs();

    // 8. Pasang pendengar event multiplayer
    this.setupMultiplayerListeners();

    // 9. Pasang pendengar event sinyal dari UI React via EventBus
    this.setupEventBusListeners();

    // 10. Pasang kontrol keyboard & tap pointer lantai
    this.setupInputControls();

    // 11. Ambil nama & avatar user dari localStorage jika belum terisi
    this.resolveUserData();

    // 12. Setup kamera zoom & controller terlebih dahulu sebelum spawn player
    this.setupInitialCamera();

    // 13. Spawn karakter lokal
    this.spawnLocalPlayer(this.pendingPlayerName || 'Petualang', this.pendingAvatar!, this.spawnNearHouseDoor);

    // 13b. Siapkan atmosfer malam biru realistis & lightmap sorot lampu jalan
    this.setupNightAtmosphere();

    // 13c. Terapkan Mipmap Hardware & Anti-Shimmer untuk mencegah garis kedip saat zoom out
    GraphicsQualityManager.applyToScene(this);

    // 14. Daftarkan cleanup saat shutdown / destroy
    this.setupSceneCleanup();

    EventBus.emit('scene-ready', 'WorldScene');
  }

  /**
   * Helper penambahan rintangan fisik statis
   */
  public addGridObstacle(gx: number, gy: number, gw: number, gh: number): Phaser.GameObjects.Zone {
    return WorldProps.addGridObstacle(
      this,
      this.tileSize,
      this.obstacles,
      gx,
      gy,
      gw,
      gh,
      () => this.invalidateObstacleCache()
    );
  }

  /**
   * Helper penempatan prop gambar di grid
   */
  public addGridProp(
    key: string,
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    isObstacle: boolean = true,
    interactiveCallback?: () => void,
    obstacleRows?: number
  ): Phaser.GameObjects.Image | null {
    return WorldProps.addGridProp(
      this,
      this.tileSize,
      key,
      gx,
      gy,
      gw,
      gh,
      isObstacle,
      interactiveCallback,
      obstacleRows,
      (ogx, ogy, ogw, ogh) => this.addGridObstacle(ogx, ogy, ogw, ogh)
    );
  }

  /**
   * Memuat props kustom arsitek dari local storage
   */
  private spawnArchitectCustomProps(): void {
    WorldProps.spawnArchitectCustomProps(
      (key, gx, gy, gw, gh, isObs) => this.addGridProp(key, gx, gy, gw, gh, isObs),
      this.customArchitectPropsGroup
    );
  }

  /**
   * Inisialisasi NPC dunia
   */
  private createWorldNpcs(): void {
    this.npcs = [
      {
        id: 'npc_petani_somad',
        name: 'Pak Tani Somad',
        role: 'Penyuluh Kebun Tani',
        avatarType: 'farmer',
        avatarUrl: '/assets/sprites/NPC/1x2%20NPC%20Petani.webp',
        spriteKey: 'npc-petani',
        x: 61 * 120 + 60, // gx: 61, gy: 10 (Lokasi Kebun Pertanian)
        y: 10 * 120 + 60,
        greeting: 'Halo Petualang! Mau belajar 5 aturan menanam di Kebun Tani?',
        dialogues: [
          'Halo Petualang! Selamat datang di Lahan Pertanian & Perkebunan RadenWorld! 🌱',
          'Aturan Menanam Resmi di RadenWorld ada 5 Langkah Wajib:\n1. ⛏️ Cangkul lahan tanah terlebih dahulu\n2. 💧 Siram air sekali dengan Tong Penyiram\n3. 🌱 Tanam bibit pilihan di tanah yang sudah basah\n4. ⏳ Tunggu 24 jam hingga mekar siap panen\n5. 🌾 Panen hasilnya dengan tombol [F]!',
          'Catatan Tong Air: Tong penyiram memiliki kapasitas 10 takaran air. Jika habis (0/10), pergilah ke bibir pantai selatan atau lautan timur lalu tekan [F] untuk mengisinya kembali sampai penuh! 🌊',
          'Semua bibit unggul nusantara dan cangkul bisa kamu beli di Kantor Makelar & Pasar Rakyat [14, 48]. Hasil panenmu juga bisa dijual di sana dengan harga koin emas tinggi!',
        ],
      },
    ];
    WorldNpcs.createWorldNpcs(this, this.npcs, (npcData) => {
      this.approachAndInteractWithNpc(npcData);
    });
  }

  private approachAndInteractWithNpc(npcData: INpcConfig): void {
    WorldNpcs.approachAndInteractWithNpc(this.player, npcData, (x, y) => this.spawnTapRipple(x, y));
  }

  private interactWithNpc(npcData: INpcConfig): void {
    WorldNpcs.interactWithNpc(npcData);
  }

  /**
   * Helper untuk mendapatkan tile tanah galian berdasarkan koordinat grid
   */
  public getDigTile(gx: number, gy: number): Phaser.GameObjects.Image | undefined {
    return this.digTiles.find(t => t.getData('gridX') === gx && t.getData('gridY') === gy);
  }

  /**
   * Mengecek apakah koordinat petak berada di dalam area lahan perkebunan tanah galian (gx: 57..80, gy: 1..9)
   */
  public isDigTile(gx: number, gy: number): boolean {
    return gx >= 57 && gx <= 80 && gy >= 1 && gy <= 9;
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

  public approachDoorAndEnter(type: 'sd' | 'smp' | 'sma' | 'house', doorX: number, doorY: number): void {
    WorldInteractions.approachDoorAndEnter(
      this.player,
      type,
      doorX,
      doorY,
      this.doors,
      (schoolType, rx, ry) => this.openSchoolGradeSelect(schoolType, rx, ry),
      () => this.transitionToHouse(),
      (x, y) => this.spawnTapRipple(x, y)
    );
  }

  private healPlayerAtHospital(): void {
    WorldInteractions.healPlayerAtHospital(
      this.player,
      this.doors.hospitalDoor,
      this.tileSize,
      (x, y) => this.spawnTapRipple(x, y)
    );
  }

  private transitionToSchool(schoolType: 'sd' | 'smp' | 'sma', returnX: number, returnY: number, grade?: number): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    WorldInteractions.transitionToSchool(
      this,
      this.player,
      this.pendingPlayerName,
      this.pendingAvatar,
      schoolType,
      returnX,
      returnY,
      grade
    );
  }

  private transitionToHouse(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    WorldInteractions.transitionToHouse(
      this,
      this.player,
      this.pendingPlayerName,
      this.pendingAvatar,
      this.privateRoomId,
      this.networkManager
    );
  }

  public transitionToCafe(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    SoundManager.getInstance().playDoor();
    this.player?.showSpeechBubble('Masuk ke Raden Cafe... ☕🥐');
    if (typeof window !== 'undefined' && window.location.pathname !== '/world/cafe') {
      window.history.pushState(null, '', '/world/cafe');
      EventBus.emit('url-changed', '/world/cafe');
    }
    this.time.delayedCall(300, () => {
      this.cameras?.main?.stopFollow();
      this.scene.start('CafeScene', {
        name: this.player?.getEntityName() || this.pendingPlayerName || 'Petualang',
        avatar: this.player?.getAvatar() || this.pendingAvatar,
        returnX: this.doors.cafeDoor.x,
        returnY: this.doors.cafeDoor.y + 40,
      });
    });
  }

  public transitionToLibrary(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    SoundManager.getInstance().playDoor();
    this.player?.showSpeechBubble('Masuk ke Perpustakaan Kota... 📚📖');
    if (typeof window !== 'undefined' && window.location.pathname !== '/world/perpustakaan') {
      window.history.pushState(null, '', '/world/perpustakaan');
      EventBus.emit('url-changed', '/world/perpustakaan');
    }
    this.time.delayedCall(300, () => {
      this.cameras?.main?.stopFollow();
      this.scene.start('LibraryScene', {
        name: this.player?.getEntityName() || this.pendingPlayerName || 'Petualang',
        avatar: this.player?.getAvatar() || this.pendingAvatar,
        returnX: this.doors.libraryDoor?.x || 1740,
        returnY: (this.doors.libraryDoor?.y || 2640) + 40,
      });
    });
  }

  private getRegionName(x: number, y: number): string {
    return WorldInteractions.getRegionName(x, y, this.tileSize, this.doors);
  }

  public triggerCurrentInteraction(): void {
    if (!this.player || this.isTransitioning) return;
    const px = this.player.x;
    const py = this.player.y;

    // 1. Masuk ke Gedung SD
    if (Phaser.Math.Distance.Between(px, py, this.doors.schoolSdDoor.x, this.doors.schoolSdDoor.y) < 140) {
      this.openSchoolGradeSelect('sd', this.doors.schoolSdDoor.x, this.doors.schoolSdDoor.y + 60);
      return;
    }

    // 2. Masuk ke Gedung SMP
    if (Phaser.Math.Distance.Between(px, py, this.doors.schoolSmpDoor.x, this.doors.schoolSmpDoor.y) < 140) {
      this.openSchoolGradeSelect('smp', this.doors.schoolSmpDoor.x, this.doors.schoolSmpDoor.y + 60);
      return;
    }

    // 3. Masuk ke Gedung SMA
    if (Phaser.Math.Distance.Between(px, py, this.doors.schoolSmaDoor.x, this.doors.schoolSmaDoor.y) < 140) {
      this.openSchoolGradeSelect('sma', this.doors.schoolSmaDoor.x, this.doors.schoolSmaDoor.y + 60);
      return;
    }

    // 4. Masuk ke Rumah Pribadi
    const distHouse = Phaser.Math.Distance.Between(px, py, this.doors.playerHouseDoor.x, this.doors.playerHouseDoor.y);
    if (distHouse < 140 && (!this.time || this.time.now > this.doorCooldownUntil)) {
      this.transitionToHouse();
      return;
    }

    // 5. Masuk ke Cafe
    if (Phaser.Math.Distance.Between(px, py, this.doors.cafeDoor.x, this.doors.cafeDoor.y) < 160 && (!this.time || this.time.now > this.doorCooldownUntil)) {
      this.transitionToCafe();
      return;
    }

    // 6. Masuk ke Perpustakaan Kota
    if (this.doors.libraryDoor && Phaser.Math.Distance.Between(px, py, this.doors.libraryDoor.x, this.doors.libraryDoor.y) < 160 && (!this.time || this.time.now > this.doorCooldownUntil)) {
      this.transitionToLibrary();
      return;
    }

    // 7. Kantor Polisi (Modal Lapor Polisi)
    if (this.doors.policeDoor && Phaser.Math.Distance.Between(px, py, this.doors.policeDoor.x, this.doors.policeDoor.y) < 160) {
      EventBus.emit('open-police-modal');
      return;
    }

    // 8. Bank Sentral (Modal Tabungan & Investasi)
    if (Phaser.Math.Distance.Between(px, py, this.doors.bankDoor.x, this.doors.bankDoor.y) < 160) {
      EventBus.emit('open-bank-modal');
      return;
    }

    // 9. Apotek Farma (Modal Ramuan Diamond)
    if (
      (this.doors.pharmacyDoor && Phaser.Math.Distance.Between(px, py, this.doors.pharmacyDoor.x, this.doors.pharmacyDoor.y) < 160) ||
      (this.doors.hospitalDoor && Phaser.Math.Distance.Between(px, py, this.doors.hospitalDoor.x, this.doors.hospitalDoor.y) < 160)
    ) {
      EventBus.emit('open-pharmacy-modal');
      return;
    }

    // 10. Makelar Properti & Pasar (Beli Alat, Biji, Jual Panen & Ikan)
    if (this.doors.realtorDoor && Phaser.Math.Distance.Between(px, py, this.doors.realtorDoor.x, this.doors.realtorDoor.y) < 160) {
      EventBus.emit('open-realtor-modal');
      return;
    }

    // 10b. Panen Tanaman Matang jika berada di dekat tanaman siap panen (bisa via [F], [E], atau Tombol Mobile)
    if (WorldFarming.hasRipeCropNearPlayer(this.player)) {
      WorldFarming.tryHarvestNearPlayer(this.player);
      return;
    }

    // 11. Interaksi dengan NPC terdekat
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
      if (dist < 120) {
        this.interactWithNpc(npc);
        return;
      }
    }
  }

  public invalidateObstacleCache(): void {
    this.cachedObstacleBoxes = null;
  }

  private getObstacleBoxes(): { minX: number; maxX: number; minY: number; maxY: number }[] {
    if (this.cachedObstacleBoxes) return this.cachedObstacleBoxes;
    const boxes: { minX: number; maxX: number; minY: number; maxY: number }[] = [];
    const margin = 18;

    if (this.obstacles) {
      const list = this.obstacles.getChildren();
      for (let i = 0; i < list.length; i++) {
        const item = list[i] as any;
        const b = item?.body as Phaser.Physics.Arcade.StaticBody;
        if (b) {
          boxes.push({
            minX: b.x - margin,
            maxX: b.x + b.width + margin,
            minY: b.y - margin,
            maxY: b.y + b.height + margin,
          });
        }
      }
    }

    if (this.customArchitectTerrainObstacles && this.customArchitectTerrainObstacles.length > 0) {
      for (let i = 0; i < this.customArchitectTerrainObstacles.length; i++) {
        const obs = this.customArchitectTerrainObstacles[i] as any;
        const b = obs?.body as Phaser.Physics.Arcade.StaticBody;
        if (b) {
          boxes.push({
            minX: b.x - 18,
            maxX: b.x + b.width + 18,
            minY: b.y - 18,
            maxY: b.y + b.height + 18,
          });
        }
      }
    }

    this.cachedObstacleBoxes = boxes;
    return boxes;
  }

  public isLocationWalkable(wx: number, wy: number): boolean {
    const ts = this.tileSize;

    const isRoadCorridor1 = wy >= 11 * ts && wy < 17 * ts;
    const isRoadCorridor2 = wy >= 64 * ts && wy < 70 * ts;
    const isRoadCorridor = isRoadCorridor1 || isRoadCorridor2;
    const isBeach = wy >= 70 * ts && wy < 79 * ts;

    if (isRoadCorridor || isBeach) {
      if (wx < -2 * ts || wx > (this.worldWidth + ts)) {
        return false;
      }
    } else {
      if (wx < 120 || wx > this.worldWidth - 120 || wy < 120 || wy > this.worldHeight - 120) {
        return false;
      }
    }

    const gx = Math.floor(wx / ts);
    const gy = Math.floor(wy / ts);

    if (gx < 0 || gx >= 80) {
      if (!isRoadCorridor && !isBeach) return false;
    }

    const isOnPier = (gx >= 63 && gx <= 73) && (
      (gy >= 26 && gy <= 27) ||
      (gy >= 39 && gy <= 40) ||
      (gy >= 53 && gy <= 54)
    );

    if (gx >= 63 && gx < 80 && gy >= 17 && gy <= 63 && !isOnPier) {
      return false;
    }

    if (gy >= 79) {
      return false;
    }

    if (gx >= 79 && gy >= 70) {
      return false;
    }

    const boxes = this.getObstacleBoxes();
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (wx >= b.minX && wx <= b.maxX && wy >= b.minY && wy <= b.maxY) {
        return false;
      }
    }

    return true;
  }

  public findClosestWalkablePoint(targetX: number, targetY: number): { x: number; y: number } | null {
    if (this.isLocationWalkable(targetX, targetY)) {
      return { x: targetX, y: targetY };
    }

    if (!this.player || !this.player.active) return null;

    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, targetX, targetY);
    if (dist <= 1) return null;

    let low = 0;
    let high = 1;
    let foundValid = false;

    for (let i = 0; i < 7; i++) {
      const mid = (low + high) * 0.5;
      const testX = px + (targetX - px) * mid;
      const testY = py + (targetY - py) * mid;
      if (this.isLocationWalkable(testX, testY)) {
        low = mid;
        foundValid = true;
      } else {
        high = mid;
      }
    }

    if (foundValid && low > 0.02) {
      return {
        x: px + (targetX - px) * low,
        y: py + (targetY - py) * low,
      };
    }

    return null;
  }

  private spawnBlockedFeedback(x: number, y: number): void {
    const gfx = this.add.graphics();
    gfx.setDepth(99999);

    gfx.fillStyle(0x7f1d1d, 0.45);
    gfx.fillEllipse(x, y, 32, 16);

    gfx.lineStyle(2, 0xef4444, 0.95);
    gfx.strokeCircle(x, y - 6, 16);

    gfx.lineStyle(2.5, 0xf87171, 0.95);
    gfx.lineBetween(x - 9, y - 15, x + 9, y + 3);

    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(x, y - 6, 2.5);

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

  private spawnTapRipple(x: number, y: number): void {
    if (!this.enableMovementEffects) return;
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
   * Mengatur visibilitas pemain lain di server berdasarkan kuota maxVisiblePlayers & jarak
   */
  public applyVisiblePlayersLimit(): void {
    if (!this.remotePlayers || this.remotePlayers.size === 0) return;

    // Kuota 0 = Hanya diri sendiri (Solo / Offline feel) -> sembunyikan semua pemain lain
    if (this.maxVisiblePlayers <= 0) {
      this.remotePlayers.forEach((rp) => {
        if (rp.visible) rp.setVisible(false);
      });
      return;
    }

    // Jika jumlah pemain di server masih dalam batas kuota -> tampilkan semua
    if (this.remotePlayers.size <= this.maxVisiblePlayers) {
      this.remotePlayers.forEach((rp) => {
        if (!rp.visible) rp.setVisible(true);
      });
      return;
    }

    // Urutkan pemain lain berdasarkan jarak terdekat ke pemain lokal
    const px = this.player?.x || 0;
    const py = this.player?.y || 0;
    const sorted = Array.from(this.remotePlayers.values()).sort((a, b) => {
      const distA = Math.hypot(a.x - px, a.y - py);
      const distB = Math.hypot(b.x - px, b.y - py);
      return distA - distB;
    });

    sorted.forEach((rp, idx) => {
      const shouldBeVisible = idx < this.maxVisiblePlayers;
      if (rp.visible !== shouldBeVisible) {
        rp.setVisible(shouldBeVisible);
      }
    });
  }

  public spawnLocalPlayer(name: string, avatar: IAvatarCustomization, nearHouse: boolean = false): void {
    if (!this.sys || !this.sys.displayList) return;
    const status = this.sys.settings?.status;
    if (status === Phaser.Scenes.SHUTDOWN || status === Phaser.Scenes.DESTROYED) return;

    const effectiveAvatar: IAvatarCustomization = avatar || this.pendingAvatar || {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
    const effectiveName = name || this.pendingPlayerName || 'Petualang';

    if (this.player && this.player.active && this.player.scene === this) {
      this.player.setAvatar(effectiveAvatar);
      if (effectiveName) {
        this.player.setEntityName(effectiveName);
      }
      const roundPx = !this.enableAntiAliasing;
      this.cameras.main.setRoundPixels(roundPx);
      this.cameras.main.startFollow(this.player, roundPx, 1.0, 1.0);
      this.cameras.main.centerOn(this.player.x, this.player.y);
      return;
    }

    // Bersihkan karakter lokal lama yang mungkin masih tertinggal di scene display list
    if (this.player) {
      try {
        this.player.destroy();
      } catch (e) {}
      this.player = null as any;
    }
    try {
      this.children.each((child: any) => {
        if (child && (child instanceof Player || child.entityId === 'local_player')) {
          child.destroy();
        }
      });
    } catch (e) {}

    let spawnX = 2460;
    let spawnY = 2460;

    if (this.customSpawnPos && typeof this.customSpawnPos.x === 'number' && typeof this.customSpawnPos.y === 'number') {
      spawnX = this.customSpawnPos.x;
      spawnY = this.customSpawnPos.y;
    } else if (nearHouse) {
      // Keluar dari Rumah Pribadi -> Spawn tepat di depan jalan pintu rumah pemain (gx: 11.5, gy: 8)
      spawnX = this.doors.playerHouseDoor.x;
      spawnY = this.doors.playerHouseDoor.y + 120;
    } else {
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

    try {
      localStorage.setItem('raden_pos_world', JSON.stringify({ x: Math.round(spawnX), y: Math.round(spawnY) }));
    } catch (e) {}

    this.player = new Player(
      this,
      spawnX,
      spawnY,
      'local_player',
      effectiveName,
      effectiveAvatar,
      100,
      100
    );

    if (this.obstacles) {
      this.physics.add.collider(this.player, this.obstacles);
    }

    if (!this.cameraController) {
      this.setupCameraZoomControls(this.targetZoom);
    }
    const cameraMargin = 1600;
    this.cameraController.setBounds(
      -cameraMargin,
      -cameraMargin,
      this.worldWidth + cameraMargin * 2,
      this.worldHeight + cameraMargin * 2
    );
    this.cameraController.centerOn(spawnX, spawnY);
    this.cameraController.follow(this.player, !this.enableAntiAliasing, 1.0, 1.0);
    this.smoothZoomTo(this.targetZoom);

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

  private setupCameraZoomControls(defaultZoom: number = 0.9): void {
    this.targetZoom = defaultZoom;
    if (this.cameraController) {
      this.cameraController.destroy();
      this.cameraController = null as any;
    }
    this.cameraController = new CameraController(this, {
      defaultZoom,
      minZoom: 0.38,
      maxZoom: 1.8,
      zoomLerpSpeed: 0.12,
    });
  }

  public smoothZoomTo(newZoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(newZoom, 0.38, 1.8);
    this.cameraController?.smoothZoomTo(newZoom);
  }

  private setupInitialCamera(): void {
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth < 768 || window.innerHeight < 550 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    );
    let initialZoom = isMobile ? 0.65 : 0.9;
    try {
      const s = JSON.parse(localStorage.getItem('raden_game_settings') || '{}');
      if (typeof s.cameraZoom === 'number' && s.cameraZoom >= 0.35 && s.cameraZoom <= 1.8) {
        initialZoom = s.cameraZoom;
      }
    } catch (e) { }
    this.setupCameraZoomControls(initialZoom);
  }

  private resolveUserData(): void {
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
  }

  private setupInputControls(): void {
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Cegah kebocoran sentuhan saat tombol kontrol virtual (analog / aksi / lompat / mancing) aktif
      if ((window as any).__raden_virtual_control_active) return;
      if (pointer?.event?.target && (pointer.event.target as HTMLElement).tagName !== 'CANVAS') return;

      // Cegah tap-movement saat gesture zoom 2 jari (pinch-in/pinch-out) aktif di mobile
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
      if (!this.player || !this.player.active || this.player.isMovementLocked()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;

      // 1. Cek apakah pemain menekan/mengklik pemain lain (Remote Player)
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
            bio: raw.bio || raw.description || 'Petualang penjelajah RadenWorld.',
            location: 'Dunia Terbuka',
            gold: isTargetAdmin ? 99999999999 : 2500,
            diamonds: isTargetAdmin ? 99999999999 : 50,
          });
          return;
        }
      }

      for (const npc of this.npcs) {
        if (Phaser.Math.Distance.Between(wx, wy, npc.x, npc.y) < 70) {
          this.approachAndInteractWithNpc(npc);
          return;
        }
      }

      let dest = this.findClosestWalkablePoint(wx, wy);

      if (!dest) {
        this.spawnBlockedFeedback(wx, wy);
        requestAnimationFrame(() => {
          SoundManager.getInstance().playError();
          if (this.player && this.player.active) {
            this.player.showSpeechBubble('🚫 Lokasi terhalang & tidak bisa dijangkau!', 1300);
          }
        });
        return;
      }

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

      if (this.player && this.player.active) {
        this.spawnTapRipple(dest.x, dest.y);
        this.player.navigateTo(dest.x, dest.y);
      }
    });
  }

  private setupEventBusListeners(): void {
    const onServerSwitched = () => {
      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();
      this.networkManager.requestRoomPlayers();
    };
    EventBus.on('server-switched', onServerSwitched);

    const onJoinGame = (userData: { name: string; avatar: IAvatarCustomization; role?: string; isSuperAdmin?: boolean }) => {
      if (!this.sys || !this.sys.displayList) return;
      const status = this.sys.settings?.status;
      if (status === Phaser.Scenes.SHUTDOWN || status === Phaser.Scenes.DESTROYED) return;

      const newName = userData?.name || this.pendingPlayerName || 'Petualang';
      this.pendingPlayerName = newName;

      // 1. Bersihkan seluruh remote players lama agar tidak ada ghost player dari sesi sebelumnya
      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();

      // 2. Perbarui atau spawn karakter lokal
      if (this.player && this.player.active && this.player.scene === this) {
        this.player.setAvatar(userData.avatar);
        this.player.setEntityName(newName);
      } else {
        this.spawnLocalPlayer(newName, userData.avatar);
      }

      // 3. Pastikan WebSocket tersambung dan kirim event player:join secara real-time!
      this.networkManager.connect();
      const isSuper = Boolean(
        userData.isSuperAdmin ||
        userData.role === 'super_admin' ||
        userData.role === 'admin' ||
        newName.toUpperCase() === 'RADEN'
      );
      const spawnX = this.player ? this.player.x : 2460;
      const spawnY = this.player ? this.player.y : 2460;
      let savedGold = isSuper ? 999999 : 2500;
      let savedDiamonds = isSuper ? 99999 : 50;
      try {
        const g = localStorage.getItem('raden_player_gold');
        if (g) savedGold = parseInt(g, 10);
        const d = localStorage.getItem('raden_player_diamonds');
        if (d) savedDiamonds = parseInt(d, 10);
      } catch (e) {}

      this.networkManager.joinGame(
        newName,
        userData.avatar,
        isSuper ? 'super_admin' : (userData.role || 'player'),
        isSuper,
        spawnX,
        spawnY,
        'down',
        savedGold,
        savedDiamonds,
        'world'
      );
      this.networkManager.sendMovement(spawnX, spawnY, 'down', false);
    };
    EventBus.on('join-game', onJoinGame);

    const onPlayerLoggedOut = () => {
      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();
      if (this.player) {
        try { this.player.destroy(); } catch (e) {}
        this.player = null as any;
      }
    };
    EventBus.on('player-logged-out', onPlayerLoggedOut);

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
        data.schoolType === 'sd' ? this.doors.schoolSdDoor.x : data.schoolType === 'smp' ? this.doors.schoolSmpDoor.x : this.doors.schoolSmaDoor.x
      );
      const ry = typeof data?.returnY === 'number' ? data.returnY : (
        data.schoolType === 'sd' ? (this.doors.schoolSdDoor.y + 120) : data.schoolType === 'smp' ? (this.doors.schoolSmpDoor.y + 120) : (this.doors.schoolSmaDoor.y + 120)
      );
      this.transitionToSchool(data.schoolType, rx, ry, data.grade);
    };
    EventBus.on('enter-school-with-grade', onEnterSchoolWithGrade);

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

    const onCancelNavigation = () => {
      if (this.player && this.player.active) {
        this.player.stopNavigation();
      }
    };
    EventBus.on('cancel-player-navigation', onCancelNavigation);

    const onRemotePlayerUpdated = (data: { id: string; name?: string; avatar?: any; role?: string; isSuperAdmin?: boolean }) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        if (data.name) remote.setName(data.name);
        if (data.avatar) remote.setAvatar(data.avatar);
      }
    };
    EventBus.on('remote-player-updated', onRemotePlayerUpdated);

    const onUpdateLocalPlayerName = (newName: string) => {
      this.pendingPlayerName = newName;
      if (this.player && this.player.active) {
        this.player.setName(newName);
      }
    };
    EventBus.on('update-player-name', onUpdateLocalPlayerName);

    this.events.once('shutdown', () => {
      EventBus.off('server-switched', onServerSwitched);
      EventBus.off('join-game', onJoinGame);
      EventBus.off('player-logged-out', onPlayerLoggedOut);
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.off('trigger-interaction', onTriggerInteraction);
      EventBus.off('enter-school-with-grade', onEnterSchoolWithGrade);
      EventBus.off('architect-config-updated', onArchitectConfigUpdated);
      EventBus.off('player-speaking-status', onSpeakingStatus);
      EventBus.off('local-player-speaking', onLocalSpeaking);
      EventBus.off('cancel-player-navigation', onCancelNavigation);
      EventBus.off('remote-player-updated', onRemotePlayerUpdated);
      EventBus.off('update-player-name', onUpdateLocalPlayerName);
    });
  }

  private setupMultiplayerListeners(): void {
    this.networkManager.clearListeners();

    this.networkManager.onWorldInit((data: IWorldInitData) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const myNameClean = (this.player?.getEntityName() || this.pendingPlayerName || '').replace(/\[admin\]/i, '').replace(/👑/g, '').trim().toLowerCase();
      const myId = this.networkManager.getSocketId();

      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();

      data.players.forEach(p => {
        if (p.id === myId || p.id === data.selfId || p.id === 'local_player') return;
        this.addRemotePlayer(p);
      });
      EventBus.emit('player-count-updated', this.remotePlayers.size + 1);
    });

    this.networkManager.onPlayerJoined((playerData: IPlayerData) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const myId = this.networkManager.getSocketId();

      if (playerData.id === myId || playerData.id === 'local_player') return;

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

    this.networkManager.onPlayerFishing((data) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.setFishingState(data.state, data.bobberPos, data.targetBobberPos);
      }
    });

    this.networkManager.onPlayerKite((data) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active) {
        remote.setKiteState(data.isFlying, data.kiteX, data.kiteY, data.kiteTilt);
      }
    });
  }

  private addRemotePlayer(p: IPlayerData): void {
    if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
    const myId = this.networkManager.getSocketId();

    if (p.id === myId || p.id === 'local_player') return;

    if (this.remotePlayers.has(p.id)) {
      const existing = this.remotePlayers.get(p.id);
      if (existing && existing.active) {
        existing.setNetworkState(p.x, p.y, p.direction || 'down', false);
        existing.setPosition(p.x, p.y);
      }
      return;
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
          gender: p.avatar?.gender,
          level: isTargetAdmin ? 99999999999 : ((p as any).level || 1),
          role: isTargetAdmin ? 'super_admin' : (p.role || 'player'),
          isSuperAdmin: isTargetAdmin,
          title: isTargetAdmin ? '👑 KREATOR & SUPER ADMIN' : ((p as any).title || 'Petualang'),
          likes: isTargetAdmin ? 99999999999 : (typeof (p as any).likes === 'number' ? (p as any).likes : 12),
          friendsCount: isTargetAdmin ? 999 : ((p as any).friendsCount ?? 0),
          followingCount: isTargetAdmin ? 999 : ((p as any).followingCount ?? 0),
          followersCount: isTargetAdmin ? 999 : ((p as any).followersCount ?? 0),
          bio: (p as any).bio || (p as any).description || 'Petualang penjelajah RadenWorld.',
          location: 'Dunia Terbuka',
          gold: isTargetAdmin ? 99999999999 : (typeof p.gold === 'number' ? p.gold : 2500),
          diamonds: isTargetAdmin ? 99999999999 : (typeof p.diamonds === 'number' ? p.diamonds : 50),
        });
      });

      this.remotePlayers.set(p.id, remote);
      this.applyVisiblePlayersLimit();

      if ((p as any).fishing) {
        const f = (p as any).fishing;
        remote.setFishingState(f.state, f.bobberPos, f.targetBobberPos);
      }

      if ((p as any).kite) {
        const k = (p as any).kite;
        remote.setKiteState(k.isFlying, k.kiteX, k.kiteY, k.kiteTilt);
      }
    } catch (err) {
      console.warn('[WorldScene] Gagal menambahkan remote player:', err);
    }
  }

  public update(time: number, delta: number): void {
    // 1. Interpolasi zoom kamera halus via CameraController
    this.cameraController?.update(time, delta);

    // 2. Animasi ombak, kaustik kristal, buih pantai, dan awan via WorldTerrain
    WorldTerrain.updateWorldTerrain(
      time,
      delta,
      this.waterWaves1,
      this.waterWaves2,
      this.shorelineSurfs,
      this.clouds,
      this.worldWidth,
      this.worldHeight,
      this.textures
    );

    if (!this.player || !this.player.active) return;
    this.player.update(time, delta);
    this.player.setDepth(Math.floor(this.player.y + 60));

    // 2a. Logika Otomatis Mengikuti Saat Pegangan Tangan (Hand-Holding Auto-Follow)
    if (this.handHoldState && this.handHoldState.partnerName) {
      let partnerEntity: any = null;
      const targetNameLower = this.handHoldState.partnerName.trim().toLowerCase();
      for (const [rId, rem] of this.remotePlayers.entries()) {
        if (
          (this.handHoldState.partnerId && rId === this.handHoldState.partnerId) ||
          (rem.getEntityName?.() || '').trim().toLowerCase() === targetNameLower
        ) {
          partnerEntity = rem;
          break;
        }
      }

      if (partnerEntity && partnerEntity.active) {
        if (this.handHoldState.role === 'follower') {
          // Player yang menerima pegangan tangan otomatis mengikuti player yang mengajak (leader)
          const targetX = partnerEntity.x + 42;
          const targetY = partnerEntity.y + 4;
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
          if (dist > 28) {
            const step = Math.min(dist, (delta / 1000) * 235);
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);
            this.player.x += Math.cos(angle) * step;
            this.player.y += Math.sin(angle) * step;
            if (time - this.lastHandHoldSyncTime > 90) {
              this.lastHandHoldSyncTime = time;
              this.networkManager.sendMovement(
                Math.round(this.player.x),
                Math.round(this.player.y),
                partnerEntity.getDirection?.() || 'down',
                true
              );
            }
          }
        }
      }
    }

    // 2b. Interaksi rumput bergoyang saat diinjak / didekati & pemain bergerak
    WorldProps.updateWildGrassSway(time, this.player, this.remotePlayers);

    // 2c. Efek transparansi gedung & pohon saat karakter berada di belakangnya (Occlusion Transparency)
    WorldProps.updateBuildingOcclusion(time, delta, this.player);

    // 2d. Atmosfer Malam Biru Sungguhan & Nyala Lampu Jalan Dinamis
    this.updateNightAtmosphere(time);

    // 2e. Pertumbuhan Tanaman Kebun Tani Real-time
    WorldFarming.update(time);

    const px = this.player.x;
    const py = this.player.y;

    // 3. Deteksi prompt interaksi & nama wilayah via WorldInteractions (Di-throttle setiap 100ms agar CPU ringan)
    if (!this.lastProximityCheckTime || time - this.lastProximityCheckTime > 100) {
      this.lastProximityCheckTime = time;
      const proximity = WorldInteractions.checkProximityPrompt(
        px,
        py,
        time,
        this.doorCooldownUntil,
        this.doors,
        this.npcs,
        this.tileSize,
        this.privateRoomId
      );

      let resolvedPrompt = proximity.prompt;
      const isNearRipe = Boolean(this.player && WorldFarming.hasRipeCropNearPlayer(this.player));
      EventBus.emit('near-ripe-crop-changed', isNearRipe);

      if (!resolvedPrompt && this.player) {
        if (isNearRipe) {
          resolvedPrompt = '[F] / SENTUH PANEN UNTUK MEMANEN TANAMAN 🌾';
        } else {
          const gxNow = Math.floor(px / this.tileSize);
          const gyNow = Math.floor(py / this.tileSize);
          if (WorldFarming.isFarmGrid(gxNow, gyNow)) {
            const held = InventoryManager.getInstance().getActiveItem();
            if (InventoryManager.isHoeItem(held)) {
              resolvedPrompt = '[F] Cangkul Lahan Kebun ⛏️';
            } else if (InventoryManager.isWateringCanItem(held)) {
              resolvedPrompt = '[F] Siram Lahan Kebun 💧';
            } else if (InventoryManager.isSeedItem(held)) {
              resolvedPrompt = `[F] Tanam ${held?.name || 'Bibit'} 🌱`;
            } else {
              const step = WorldFarming.getContextualFarmStepNearPlayer(this.player);
              if (step === 'hoe') resolvedPrompt = '[F] Cangkul Lahan Kebun ⛏️';
              else if (step === 'water') resolvedPrompt = '[F] Siram Lahan Kebun 💧';
              else if (step === 'seed') resolvedPrompt = '[F] Tanam Bibit Kebun 🌱';
            }
          }
        }
      }

      if (resolvedPrompt !== this.activePrompt) {
        this.activePrompt = resolvedPrompt;
        EventBus.emit('interaction-prompt', resolvedPrompt);
      }
      this.cachedProximityLocation = proximity.locationName;
    }

    const locationName = this.cachedProximityLocation || this.lastLocationName;
    const gridX = Math.floor(px / this.tileSize);
    const gridY = Math.floor(py / this.tileSize);
    const locChanged = locationName !== this.lastLocationName;
    const gridChanged = gridX !== this.lastGridX || gridY !== this.lastGridY;
    const periodicTimeout = time - this.lastStatsEmitTime > 2000;
    const movementThrottle = time - this.lastStatsEmitTime > 1000;

    if (locChanged || (gridChanged && movementThrottle) || periodicTimeout) {
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

    if (time - this.lastVisibilityCheckTime > 800) {
      this.lastVisibilityCheckTime = time;
      this.applyVisiblePlayersLimit();
    }

    this.remotePlayers.forEach(p => {
      if (p.visible) {
        p.update(time, delta);
        p.setDepth(Math.floor(p.y + 60));
      }
    });
  }

  /**
   * Menghitung siklus waktu tropis (WIB) untuk atmosfer malam biru sungguhan
   */
  private computeNightCycle(): { nightFactor: number; fillRgba: string } {
    const now = new Date();
    const t = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

    // Siang Cerah (06:15 - 17:00)
    if (t >= 6.25 && t < 17.0) {
      return { nightFactor: 0, fillRgba: 'rgba(10, 32, 92, 0)' };
    }

    // Sore menuju Senja Biru (17:00 - 18:30) - lembut & nyaman di mata
    if (t >= 17.0 && t < 18.5) {
      const p = (t - 17.0) / 1.5; // 0 -> 1
      const alpha = +(p * 0.25).toFixed(3);
      return {
        nightFactor: p * 0.65,
        fillRgba: `rgba(16, 42, 112, ${alpha})`,
      };
    }

    // Transisi Maghrib ke Malam Biru Cerah (18:30 - 19:15)
    if (t >= 18.5 && t < 19.25) {
      const p = (t - 18.5) / 0.75; // 0 -> 1
      const alpha = +(0.25 + p * 0.19).toFixed(3); // 0.25 -> 0.44
      return {
        nightFactor: 0.65 + p * 0.35,
        fillRgba: `rgba(14, 38, 105, ${alpha})`,
      };
    }

    // Malam Sungguhan Berwarna Biru Royal / Midnight Sapphire Lembut (19:15 - 04:30)
    // Tidak terlalu gelap, pemandangan kota dan jalan tetap jelas & nyaman dilihat
    if (t >= 19.25 || t < 4.5) {
      return {
        nightFactor: 1.0,
        fillRgba: 'rgba(14, 38, 105, 0.44)',
      };
    }

    // Fajar Biru Pagi (04:30 - 06:15)
    const p = 1.0 - (t - 4.5) / 1.75; // 1 -> 0
    const alpha = +(Math.max(0, p * 0.44)).toFixed(3);
    return {
      nightFactor: Math.max(0, p),
      fillRgba: `rgba(14, 38, 105, ${alpha})`,
    };
  }

  /**
   * Menyiapkan CanvasTexture lightmap malam biru & sorot lampu jalan berkinerja tinggi
   */
  private setupNightAtmosphere(): void {
    try {
      const texKey = 'world-night-lightmap';
      if (this.textures.exists(texKey)) {
        this.textures.remove(texKey);
      }
      this.nightCanvasTex = this.textures.createCanvas(texKey, 320, 180);
      this.nightCanvasTex?.setFilter(Phaser.Textures.FilterMode.LINEAR);

      this.nightOverlaySprite = this.add.image(0, 0, texKey);
      this.nightOverlaySprite.setDepth(125000);
      this.nightOverlaySprite.setVisible(false);
      this.lastNightLightmapTime = 0;
      this.lastNightCamX = -99999;
      this.lastNightCamY = -99999;
      this.lastNightPlayerX = -99999;
      this.lastNightPlayerY = -99999;
      this.lastNightZoom = -1;
    } catch (err) {
      console.warn('[WorldScene] Gagal inisialisasi lightmap malam:', err);
    }
  }

  /**
   * Memperbarui nyala lampu jalan & lightmap biru malam dengan lubang cahaya hangat
   */
  private updateNightAtmosphere(time: number): void {
    const cam = this.cameras?.main;
    if (!cam) return;

    const wv = cam.worldView;
    const { nightFactor, fillRgba } = this.computeNightCycle();

    WorldProps.updateStreetLampLights(time, nightFactor, {
      left: wv.x,
      right: wv.right,
      top: wv.y,
      bottom: wv.bottom,
    });

    if (!this.nightOverlaySprite || !this.nightCanvasTex) return;

    if (nightFactor <= 0.01) {
      if (this.nightOverlaySprite.visible) {
        this.nightOverlaySprite.setVisible(false);
      }
      return;
    }

    if (!this.nightOverlaySprite.visible) {
      this.nightOverlaySprite.setVisible(true);
    }

    // Cek apakah pemain lokal, kamera, atau pemain lain sedang bergerak
    const playerMoved = Boolean(this.player && (Math.abs(this.player.x - this.lastNightPlayerX) > 0.5 || Math.abs(this.player.y - this.lastNightPlayerY) > 0.5));
    const camMoved = Math.abs(wv.x - this.lastNightCamX) > 0.5 || Math.abs(wv.y - this.lastNightCamY) > 0.5 || Math.abs(cam.zoom - this.lastNightZoom) > 0.005;
    let anyRemoteMoved = false;
    if (this.remotePlayers && this.remotePlayers.size > 0) {
      for (const rp of this.remotePlayers.values()) {
        if (rp && rp.active && rp.getIsMoving()) {
          anyRemoteMoved = true;
          break;
        }
      }
    }

    const pad = 220;
    const viewX = wv.x - pad;
    const viewY = wv.y - pad;
    const viewW = Math.max(400, wv.width + pad * 2);
    const viewH = Math.max(300, wv.height + pad * 2);

    // Update posisi dan ukuran overlay sprite mengikuti kamera di 60 FPS
    this.nightOverlaySprite.setPosition(viewX + viewW * 0.5, viewY + viewH * 0.5);
    this.nightOverlaySprite.setDisplaySize(viewW, viewH);

    // Throttle pembaruan tekstur WebGL canvas lightmap ke ~20 FPS (50ms) agar CPU/GPU tidak terblokir
    if (time - this.lastNightLightmapTime < 50) {
      return;
    }

    this.lastNightLightmapTime = time;
    this.lastNightCamX = wv.x;
    this.lastNightCamY = wv.y;
    this.lastNightPlayerX = this.player?.x ?? 0;
    this.lastNightPlayerY = this.player?.y ?? 0;
    this.lastNightZoom = cam.zoom;

    const cw = 320;
    const ch = 180;
    const ctx = this.nightCanvasTex.getContext();
    if (!ctx) return;

    ctx.clearRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = fillRgba;
    ctx.fillRect(0, 0, cw, ch);

    // Lubangi selimut malam biru di sekitar tiap lampu jalan & pemain via pre-rendered hardware bitmap stamp
    ctx.globalCompositeOperation = 'destination-out';
    const sx = cw / viewW;
    const sy = ch / viewH;

    // Stamp radial halus pre-rendered (0 GC allocations, 0 canvas gradient compile overhead)
    const stamp = WorldScene.getLightStamp();

    const lamps = WorldProps.lampLights;
    for (let i = 0; i < lamps.length; i++) {
      const l = lamps[i];
      if (!l.lampImg || !l.lampImg.active) continue;
      if (
        l.lanternX < viewX - 300 ||
        l.lanternX > viewX + viewW + 300 ||
        l.groundY < viewY - 300 ||
        l.lanternY > viewY + viewH + 300
      ) {
        continue;
      }

      // 1. Lubang cahaya elips di permukaan jalan / trotoar bawah lampu
      const gx = (l.groundX - viewX) * sx;
      const gy = (l.groundY - viewY) * sy;
      const grx = Math.max(6, 255 * sx);
      const gry = Math.max(4, 175 * sy);
      ctx.drawImage(stamp, gx - grx, gy - gry, grx * 2, gry * 2);

      // 2. Lubang cahaya di sekitar kaca lentera atas lampu jalan
      const lx = (l.lanternX - viewX) * sx;
      const ly = (l.lanternY - viewY) * sy;
      const lr = Math.max(5, 145 * sx);
      ctx.drawImage(stamp, lx - lr, ly - lr, lr * 2, lr * 2);
    }

    // 2b. Lubangi selimut malam biru di sekeliling jalan & pekarangan sekitar gedung
    const bLights = WorldProps.buildingLights;
    for (let i = 0; i < bLights.length; i++) {
      const b = bLights[i];
      if (
        b.doorX < viewX - 450 ||
        b.doorX > viewX + viewW + 450 ||
        b.doorY < viewY - 450 ||
        b.doorY > viewY + viewH + 450
      ) {
        continue;
      }

      for (let j = 0; j < b.surroundings.length; j++) {
        const pool = b.surroundings[j];
        const bx = (pool.x - viewX) * sx;
        const by = (pool.y - viewY) * sy;
        const brx = Math.max(8, pool.r * sx * 0.85);
        const bry = Math.max(5, pool.r * 0.55 * sy);
        ctx.drawImage(stamp, bx - brx, by - bry, brx * 2, bry * 2);
      }
    }

    // 3. Cahaya terang di sekitar karakter pemain agar tubuh & pakaian tampak jelas dan terang di malam hari
    if (this.player && this.player.active) {
      const px = (this.player.x - viewX) * sx;
      const py = (this.player.y - viewY) * sy;
      const pr = Math.max(10, 250 * sx);
      ctx.drawImage(stamp, px - pr, py - pr, pr * 2, pr * 2);
    }

    // 3b. Cahaya terang di sekitar seluruh pemain lain (Multiplayer Remote Players)
    if (this.remotePlayers && this.remotePlayers.size > 0) {
      this.remotePlayers.forEach((rp) => {
        if (!rp || !rp.active || !rp.visible) return;
        if (
          rp.x < viewX - 250 ||
          rp.x > viewX + viewW + 250 ||
          rp.y < viewY - 250 ||
          rp.y > viewY + viewH + 250
        ) {
          return;
        }

        const rpx = (rp.x - viewX) * sx;
        const rpy = (rp.y - viewY) * sy;
        const rpr = Math.max(10, 240 * sx);
        ctx.drawImage(stamp, rpx - rpr, rpy - rpr, rpr * 2, rpr * 2);
      });
    }

    // 3c. Cahaya terang di sekitar seluruh NPC dunia (Pak Tani Somad, Polisi, dll.)
    if (this.npcs && this.npcs.length > 0) {
      for (let n = 0; n < this.npcs.length; n++) {
        const npc = this.npcs[n];
        if (
          npc.x < viewX - 250 ||
          npc.x > viewX + viewW + 250 ||
          npc.y < viewY - 250 ||
          npc.y > viewY + viewH + 250
        ) {
          continue;
        }
        const nx = (npc.x - viewX) * sx;
        const ny = (npc.y - viewY) * sy;
        const nr = Math.max(10, 230 * sx);
        ctx.drawImage(stamp, nx - nr, ny - nr, nr * 2, nr * 2);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    this.nightCanvasTex.refresh();
  }

  private static lightStampCanvas: HTMLCanvasElement | null = null;
  private static getLightStamp(): HTMLCanvasElement {
    if (!WorldScene.lightStampCanvas) {
      const stamp = document.createElement('canvas');
      stamp.width = 128;
      stamp.height = 128;
      const sCtx = stamp.getContext('2d')!;
      const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
      grad.addColorStop(0.0, 'rgba(0, 0, 0, 1.0)');
      grad.addColorStop(0.38, 'rgba(0, 0, 0, 0.78)');
      grad.addColorStop(0.72, 'rgba(0, 0, 0, 0.28)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      sCtx.fillStyle = grad;
      sCtx.beginPath();
      sCtx.arc(64, 64, 64, 0, Math.PI * 2);
      sCtx.fill();
      WorldScene.lightStampCanvas = stamp;
    }
    return WorldScene.lightStampCanvas;
  }

  private setupSceneCleanup(): void {
    const cleanupScene = () => {
      this.cameras?.main?.stopFollow();
      EventBus.emit('interaction-prompt', null);
      this.networkManager.clearListeners();
      if (this.nightOverlaySprite) {
        try { this.nightOverlaySprite.destroy(); } catch (e) {}
        this.nightOverlaySprite = null;
      }
      if (this.nightCanvasTex) {
        try { this.textures.remove('world-night-lightmap'); } catch (e) {}
        this.nightCanvasTex = null;
      }
      WorldProps.resetProps();
      WorldFarming.reset();
      if (this.nightOverlaySprite) {
        try { this.nightOverlaySprite.destroy(); } catch (e) {}
        this.nightOverlaySprite = null;
      }
      if (this.nightCanvasTex) {
        try { this.textures.remove('world-night-lightmap'); } catch (e) {}
        this.nightCanvasTex = null;
      }
      WorldProps.resetProps();
      WorldFarming.reset();
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
}
