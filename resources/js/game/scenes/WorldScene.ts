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

  // Cache bounding box rintangan statis untuk performa tinggi
  private cachedObstacleBoxes: { minX: number; maxX: number; minY: number; maxY: number }[] | null = null;

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
    this.player = null as any;

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
    // 1. Batas fisika dunia diperlebar mencakup buffer (2400px) agar koridor jalan bisa dilewati ke luar
    const buf = 2400;
    this.physics.world.setBounds(-buf, -buf, this.worldWidth + buf * 2, this.worldHeight + buf * 2);

    // 2. Inisialisasi grup rintangan fisik statis
    this.obstacles = this.physics.add.staticGroup();

    // 3. Masuk ke room 'world' pada WebSocket Server
    this.networkManager.switchRoom('world');

    // 4. Pastikan tekstur prosedural Canvas (Wall Checker, Animated Water, Alun-Alun & Trotoar 2) tersedia
    WorldTextures.ensureWallTextures(this);
    WorldTextures.ensureWaterTextures(this);
    WorldTextures.ensureAlunAlunTextures(this);
    WorldTextures.ensureTrotoar2Textures(this);

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
    this.npcs = [];
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
        returnY: this.doors.cafeDoor.y + 60,
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
        returnY: (this.doors.libraryDoor?.y || 3120) + 60,
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
    if (Phaser.Math.Distance.Between(px, py, this.doors.cafeDoor.x, this.doors.cafeDoor.y) < 160) {
      this.transitionToCafe();
      return;
    }

    // 6. Masuk ke Perpustakaan Kota
    if (this.doors.libraryDoor && Phaser.Math.Distance.Between(px, py, this.doors.libraryDoor.x, this.doors.libraryDoor.y) < 160) {
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

    // 8. Interaksi dengan 2 Papan Popup Reklame 10x10 (world/popup) di y: 49/50 (gx: 22 & gx: 45)
    const pGx = Math.floor(px / this.tileSize);
    const pGy = Math.floor(py / this.tileSize);
    if (
      ((pGx >= 21 && pGx <= 32) || (pGx >= 44 && pGx <= 55)) &&
      (pGy >= 39 && pGy <= 51)
    ) {
      window.open('/world/popup', '_blank');
      return;
    }

    // 11. Interaksi Lapangan Sepak Bola (Mini Game)
    const gx = Math.floor(px / this.tileSize);
    const gy = Math.floor(py / this.tileSize);
    if (gx >= 23 && gx <= 34 && gy >= 52 && gy <= 58) {
      EventBus.emit('open-sports-modal', 'soccer');
      return;
    }

    // 12. Interaksi Lapangan Bola Basket (Mini Game)
    if (gx >= 45 && gx <= 56 && gy >= 52 && gy <= 58) {
      EventBus.emit('open-sports-modal', 'basketball');
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
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.startFollow(this.player, true, 1.0, 1.0);
      this.cameras.main.centerOn(this.player.x, this.player.y);
      return;
    }

    let spawnX = 2460;
    let spawnY = 2460;

    if (this.customSpawnPos) {
      spawnX = this.customSpawnPos.x;
      spawnY = this.customSpawnPos.y;
    } else if (nearHouse) {
      // Keluar dari Rumah Pribadi -> Spawn tepat di depan pintu rumah pemain (gx: 11.5, gy: 7.5)
      spawnX = this.doors.playerHouseDoor.x;
      spawnY = this.doors.playerHouseDoor.y + 60;
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

  private setupInitialCamera(): void {
    let initialZoom = 0.9;
    try {
      const s = JSON.parse(localStorage.getItem('raden_game_settings') || '{}');
      if (typeof s.cameraZoom === 'number' && s.cameraZoom >= 0.45 && s.cameraZoom <= 1.8) {
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
    };
    EventBus.on('server-switched', onServerSwitched);

    const onJoinGame = (userData: { name: string; avatar: IAvatarCustomization }) => {
      if (!this.sys || !this.sys.displayList) return;
      const status = this.sys.settings?.status;
      if (status === Phaser.Scenes.SHUTDOWN || status === Phaser.Scenes.DESTROYED) return;
      if (userData?.name) this.pendingPlayerName = userData.name;
      if (this.player && this.player.active && this.player.scene === this) {
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
      const myName = (this.player?.getEntityName() || this.pendingPlayerName || '').trim().toLowerCase();
      const myId = this.networkManager.getSocketId();

      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();

      data.players.forEach(p => {
        if (p.id === myId || p.id === data.selfId) return;
        this.addRemotePlayer(p);
      });
      EventBus.emit('player-count-updated', this.remotePlayers.size + 1);
    });

    this.networkManager.onPlayerJoined((playerData: IPlayerData) => {
      if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
      const myId = this.networkManager.getSocketId();

      if (playerData.id === myId) return;

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
  }

  private addRemotePlayer(p: IPlayerData): void {
    if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
    const myId = this.networkManager.getSocketId();

    if (p.id === myId) return;

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

      if ((p as any).fishing) {
        const f = (p as any).fishing;
        remote.setFishingState(f.state, f.bobberPos, f.targetBobberPos);
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

    // 2b. Interaksi rumput bergoyang saat diinjak / didekati & pemain bergerak
    WorldProps.updateWildGrassSway(time, this.player, this.remotePlayers);

    // 2c. Efek transparansi gedung & pohon saat karakter berada di belakangnya (Occlusion Transparency)
    WorldProps.updateBuildingOcclusion(time, delta, this.player);

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

      if (proximity.prompt !== this.activePrompt) {
        this.activePrompt = proximity.prompt;
        EventBus.emit('interaction-prompt', proximity.prompt);
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
      p.setDepth(Math.floor(p.y + 60));
    });
  }

  private setupSceneCleanup(): void {
    const cleanupScene = () => {
      this.cameras?.main?.stopFollow();
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
}
