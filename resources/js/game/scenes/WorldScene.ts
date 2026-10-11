/**
 * ============================================================================
 * FILE: resources/js/game/scenes/WorldScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene 2D Open World Multiplayer luas (9600x9600 pixel) berbasis grid 120px.
 * 
 * SPESIFIKASI:
 * 1. Skala Grid: 1 Grid = 120px x 120px (Pola catur alam hijau tua & zamrud).
 * 2. Karakter: 94.52px x 177px, di tengah kolom 1x2 petak (120x240px).
 * 3. Kamera: Zoom in & Zoom out yang halus (smooth lerp/tween) tanpa getaran.
 * 4. Peta Luas & Megah: 80x80 petak ubin (9600x9600px), mencakup Plaza Kota,
 *    Pasar & Toko, Rumah Pribadi, Telaga Mistik, Hutan Zamrud, Kebun & Kincir Angin.
 * 5. NPC Interaktif Ramah: Sage Raden, Blacksmith Arya, Alchemist Sari,
 *    Merchant Malik, Fisherman Danu, Farmer Joko, Captain Bima, Elder Maya (Menggantikan monster).
 * 6. Keandalan: Penanganan reconnect, tab/app switch, dan refresh tanpa bug freeze/hilang.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { IPlayerData, IChatMessage, IWorldInitData, IAvatarCustomization } from '../types';

interface INpcConfig {
  id: string;
  name: string;
  role: string;
  avatarType: 'sage' | 'blacksmith' | 'alchemist' | 'merchant' | 'guard' | 'fisherman' | 'farmer' | 'elder';
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

  // Luas Peta Dunia Terbuka (80 x 80 petak ubin @ 120px = 9600 x 9600 px)
  public readonly worldWidth: number = 9600;
  public readonly worldHeight: number = 9600;
  public readonly tileSize: number = 120;

  private pendingPlayerName: string | null = null;
  private pendingAvatar: IAvatarCustomization | null = null;
  private spawnNearHouseDoor: boolean = false;
  private privateRoomId: string = 'safe-01';

  // Zona Bangunan & Pintu Interaktif (SD, SMP, SMA, dan Rumah Pribadi)
  private playerHouseDoor = { x: 4860, y: 7740 };
  private schoolSdDoor = { x: 1740, y: 5340 };
  private schoolSmpDoor = { x: 4860, y: 2100 };
  private schoolSmaDoor = { x: 7860, y: 5340 };
  private customSpawnPos: { x: number; y: number } | null = null;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private lastGridX: number = -1;
  private lastGridY: number = -1;
  private lastLocationName: string = '';
  private doorCooldownUntil: number = 0;
  private isTransitioning: boolean = false;

  // Kontrol zoom kamera halus
  private targetZoom: number = 0.9;

  // Daftar NPC Interaktif Ramah Bertema Indonesia (Pujasera Gerobak, Keamanan Sekolah, Tokoh Kota)
  private npcs: INpcConfig[] = [
    {
      id: 'npc_sage',
      name: 'Sage Raden',
      role: 'Wali Kota RadenWorld',
      avatarType: 'sage',
      x: 4860,
      y: 4760,
      greeting: 'Salam sejahtera, wahai penjelajah dunia!',
      dialogues: [
        'Salam sejahtera, wahai sahabat! Selamat datang di RadenWorld, kota metropolitan pendidikan yang ramah dan bersahabat.',
        'Di sini terdapat kompleks pendidikan lengkap: Gedung SD di barat, Gedung SMP di utara, dan Gedung SMA unggulan di timur.',
        'Kamu bisa menjelajah bersama kawan-kawanmu, berbincang langsung melalui Proximity Voice Chat di radius 5 petak, dan menikmati kuliner nusantara!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_bakso',
      name: 'Bang Mamat',
      role: 'Penjual Bakso Urat Solo',
      avatarType: 'merchant',
      x: 4260,
      y: 4620,
      greeting: 'Bakso urat kuah sedap hangat, Mas/Mbak!',
      dialogues: [
        'Monggo pinarak, Mas/Mbak! Bakso urat asli Solo kuah kaldu sapi gurih baru saja mendidih harum.',
        'Satu porsi lengkap ada bakso urat, bakso halus, tahu bakso gurih, mie kuning, dan taburan pangsit renyah!',
        'Cocok banget disantap hangat-hangat setelah lelah keliling kota dan belajar di sekolah!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_mie_ayam',
      name: 'Pak Joko',
      role: 'Penjual Mie Ayam Jamur',
      avatarType: 'merchant',
      x: 5460,
      y: 4620,
      greeting: 'Mie ayam jamur bumbu spesial siap dihidangkan!',
      dialogues: [
        'Selamat datang! Mau mie ayam manis gurih atau mie ayam rica-rica pedas mantap?',
        'Daging ayam jamurnya dimasak perlahan dengan kecap manis pilihan dan daun bawang segar.',
        'Pangsit goreng renyahnya juga gratis sepuasnya untuk kawan-kawan petualang!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_soto',
      name: 'Cak Slamet',
      role: 'Penjual Soto Lamongan',
      avatarType: 'merchant',
      x: 4860,
      y: 5700,
      greeting: 'Soto ayam koya gurih mantap khas Lamongan!',
      dialogues: [
        'Halo rek! Mampir ke gerobak Cak Slamet, soto ayam kampung kuah kuning koya gurih nomor satu!',
        'Aroma rempah kunyit, jahe, dan serai dijamin bikin badan kembali segar bugar bertenaga.',
        'Jangan lupa tambah perasan jeruk nipis dan sambal rawit merah biar makin nampol rasanya!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_satpam',
      name: 'Pak Satpam Bambang',
      role: 'Keamanan Kompleks Pendidikan',
      avatarType: 'guard',
      x: 4860,
      y: 2340,
      greeting: 'Kompleks sekolah aman dan tertib.',
      dialogues: [
        'Selamat siang adik-adik dan kawan petualang! Saya Pak Bambang, bertugas menjaga keamanan dan ketertiban kawasan pendidikan ini.',
        'Gedung SD terletak di sebelah barat, Gedung SMP di sebelah utara plaza, dan Gedung SMA di sebelah timur.',
        'Selalu tertib saat menyeberang jalan dan buang sampah pada tempatnya ya!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_kios_minuman',
      name: 'Bu Minah',
      role: 'Kios Minuman Segar',
      avatarType: 'farmer',
      x: 4680,
      y: 4140,
      greeting: 'Es teh manis dan es jeruk peras segar!',
      dialogues: [
        'Haus setelah jalan-jalan keliling kota? Mampir sini beli es teh manis melati atau es kelapa muda!',
        'Minuman segar alami tanpa pemanis buatan, dijamin langsung plong di tenggorokan.',
        'Semoga harimu menyenangkan dan penuh energi di RadenWorld!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_fisherman',
      name: 'Fisherman Danu',
      role: 'Nelayan Telaga Mistik',
      avatarType: 'fisherman',
      x: 6400,
      y: 3800,
      greeting: 'Air Telaga Mistik sangat tenang dan jernih hari ini.',
      dialogues: [
        'Krieeet... suara derit dermaga kayu dan riak air Telaga Mistik selalu menjadi alunan paling menenteramkan di kala senja.',
        'Ikan-ikan perak bersisik kristal sering berenang jinak mendekati tepian dermaga ketika matahari mulai condong ke barat.',
        'Duduklah santai di tepian dermaga jika lelah mengelilingi dunia. Angin sejuk telaga ini akan menyegarkan kembali jiwamu.'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_farmer',
      name: 'Farmer Joko',
      role: 'Petani Padang Hijau Subur',
      avatarType: 'farmer',
      x: 4860,
      y: 7920,
      greeting: 'Tanaman tumbuh subur, pertanda panen melimpah!',
      dialogues: [
        'Ohoho! Selamat datang di perkebunan selatan! Angin sepoi-sepoi menghembuskan aroma rerumputan segar.',
        'Hasil bumi dan sayur-mayur segar dari kebun ini menyuplai kebutuhan pangan warga kota dan kantin sekolah.',
        'Merawat alam dengan cinta kasih adalah kunci kemakmuran bersama!'
      ],
      spriteKey: 'npc-sprite',
    },
  ];

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
  }

  public create(): void {
    // 1. Batas fisika dunia (9600x9600)
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 2. Inisialisasi grup rintangan fisik statis (Pagar, Dinding Gedung, Meja, Gerobak, Batu)
    this.obstacles = this.physics.add.staticGroup();

    // 3. Masuk ke room 'world' pada WebSocket Server
    this.networkManager.switchRoom('world');

    // 4. Render grafis lingkungan alam dengan pola catur 120x120px
    this.createWorldEnvironment();

    // 5. Render NPC Interaktif di seluruh wilayah
    this.createWorldNpcs();

    // 6. Pasang pendengar event multiplayer
    this.setupMultiplayerListeners();

    // 5. Tangani event sinyal dari UI React via EventBus
    const onServerSwitched = () => {
      // Bersihkan seluruh remote player lama dari realm/server sebelumnya
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

    // Dengar ekspresi dari pemain lain di Open World
    this.networkManager.onPlayerExpression((data) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote && remote.active && remote.scene) {
        remote.triggerExpression(data.type);
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

    // 6. Tombol interaksi keyboard 'E'
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    // Tap / Klik lantai grid untuk bergerak (Khusus PC & Mobile)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (pointer.rightButtonDown()) return;
      if (this.player?.isMovementLocked()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;
      if (wx < 100 || wx > this.worldWidth - 100 || wy < 100 || wy > this.worldHeight - 100) return;

      // Cek apakah klik dekat dengan NPC (toleransi tap di HP)
      for (const npc of this.npcs) {
        if (Phaser.Math.Distance.Between(wx, wy, npc.x, npc.y) < 70) {
          this.approachAndInteractWithNpc(npc);
          return;
        }
      }

      // Pergerakan jalan biasa menuju titik grid yang di-tap/klik
      if (this.player && this.player.active) {
        this.spawnTapRipple(wx, wy);
        this.player.navigateTo(wx, wy);
      }
    });

    // 7. Ambil cadangan user dari localStorage jika pendingPlayerName kosong (misal saat refresh browser)
    if (!this.pendingPlayerName) {
      let savedName = 'Petualang';
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name) savedName = u.name;
        if (u.private_room_id) this.privateRoomId = u.private_room_id;
      } catch (e) {}
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
      } catch (e) {}
      this.pendingAvatar = savedAv;
    }

    // 8. Spawn karakter lokal
    this.spawnLocalPlayer(this.pendingPlayerName, this.pendingAvatar, this.spawnNearHouseDoor);

    // 9. Kontrol Zoom Kamera Halus (Mouse Wheel, Keyboard +/-, HUD buttons)
    this.setupCameraZoomControls(0.9);

    // Bersihkan listener saat shutdown dan destroy scene
    const cleanupScene = () => {
      this.cameras?.main?.stopFollow();
      EventBus.off('join-game', onJoinGame);
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.off('trigger-interaction', onTriggerInteraction);
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
    };

    this.events.on('shutdown', cleanupScene);
    this.events.on('destroy', cleanupScene);
  }

  /**
   * Kontrol zoom kamera yang halus menggunakan tween (Scroll Wheel, Keyboard +/-, HUD buttons)
   */
  private setupCameraZoomControls(defaultZoom: number = 0.9): void {
    this.targetZoom = defaultZoom;
    this.cameras.main.setZoom(defaultZoom);
    this.cameras.main.setRoundPixels(true);

    // 1. Mouse wheel smooth zoom
    const onWheel = (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
      const zoomFactor = deltaY > 0 ? 0.88 : 1.14;
      this.smoothZoomTo(this.targetZoom * zoomFactor);
    };
    this.input.on('wheel', onWheel);

    // 2. Event dari UI HUD / Keyboard
    const handleZoomIn = () => this.smoothZoomTo(this.targetZoom * 1.18);
    const handleZoomOut = () => this.smoothZoomTo(this.targetZoom * 0.84);
    const handleZoomReset = () => this.smoothZoomTo(defaultZoom);
    const handleZoomSet = (zoom: number) => this.smoothZoomTo(zoom);

    EventBus.on('camera-zoom-in', handleZoomIn);
    EventBus.on('camera-zoom-out', handleZoomOut);
    EventBus.on('camera-zoom-reset', handleZoomReset);
    EventBus.on('camera-zoom-set', handleZoomSet);

    this.input.keyboard?.on('keydown-PLUS', handleZoomIn);
    this.input.keyboard?.on('keydown-NUMPAD_ADD', handleZoomIn);
    this.input.keyboard?.on('keydown-MINUS', handleZoomOut);
    this.input.keyboard?.on('keydown-NUMPAD_SUBTRACT', handleZoomOut);

    this.events.on('shutdown', () => {
      this.input.off('wheel', onWheel);
      EventBus.off('camera-zoom-in', handleZoomIn);
      EventBus.off('camera-zoom-out', handleZoomOut);
      EventBus.off('camera-zoom-reset', handleZoomReset);
      EventBus.off('camera-zoom-set', handleZoomSet);
    });
  }

  private smoothZoomTo(newZoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(newZoom, 0.5, 1.8);
    this.tweens.killTweensOf(this.cameras.main);
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.targetZoom,
      duration: 220,
      ease: 'Cubic.easeOut',
    });
  }

  /**
   * Menggambar lingkungan alam Open World 9600x9600px:
   * Termasuk Gedung SD, Gedung SMP, Gedung SMA, Rumah Pribadi, Pujasera Gerobak Kuliner, dan Fasilitas Kota
   */
  private createWorldEnvironment(): void {
    const bgGraphics = this.add.graphics();
    // A. Lantai Dasar Catur Alam 9600x9600px Ringan 60 FPS via TileSprite (1 draw call)
    const worldFloor = this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      'world-checker-tile'
    );
    worldFloor.setDepth(-100);

    // B. Alun-Alun Pusat Sanctuary Plaza (15x15 petak ubin = 1800x1800 px pada gx=33..47, gy=33..47)
    const plazaGx = 33;
    const plazaGy = 33;
    const plazaGw = 15;
    const plazaGh = 15;
    const plazaLeft = plazaGx * this.tileSize;
    const plazaTop = plazaGy * this.tileSize;
    const plazaWidth = plazaGw * this.tileSize;
    const plazaHeight = plazaGh * this.tileSize;

    const plazaFloor = this.add.tileSprite(
      plazaLeft + plazaWidth / 2,
      plazaTop + plazaHeight / 2,
      plazaWidth,
      plazaHeight,
      'plaza-checker-tile'
    );
    plazaFloor.setDepth(-90);

    bgGraphics.lineStyle(6, 0xf59e0b, 0.9);
    bgGraphics.strokeRoundedRect(plazaLeft, plazaTop, plazaWidth, plazaHeight, 32);

    // C. Jalan Boulevard Beraspal Menghubungkan Sekolah & Plaza
    // Jalan Utara-Selatan (Menghubungkan SMP di Utara gx=39..41, gy=18 s/d Rumah di gy=60)
    bgGraphics.fillStyle(0x1e293b, 0.9);
    bgGraphics.fillRect(39 * 120, 18 * 120, 360, (60 - 18) * 120);

    // Jalan Barat-Timur (Menghubungkan SD di Barat gx=17 s/d SMA di Timur gx=63)
    bgGraphics.fillRect(17 * 120, 44 * 120, (63 - 17) * 120, 240);

    // D. Air Mancur Megah di Pusat Plaza (Grid 40, 40 -> 4860, 4860)
    const fountainCenterX = 40 * 120 + 60;
    const fountainCenterY = 40 * 120 + 60;
    const fountain = this.add.graphics();
    fountain.fillStyle(0x0284c7, 1);
    fountain.fillCircle(fountainCenterX, fountainCenterY, 90);
    fountain.lineStyle(8, 0xf59e0b, 1);
    fountain.strokeCircle(fountainCenterX, fountainCenterY, 90);
    fountain.fillStyle(0x38bdf8, 0.7);
    fountain.fillCircle(fountainCenterX, fountainCenterY, 60);

    this.add.text(fountainCenterX, fountainCenterY - 110, '★ SANCTUARY CENTRAL PLAZA ★', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '20px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Collider air mancur di tengah plaza (1x1 petak)
    this.addGridObstacle(40, 40, 1, 1);

    // E. Telaga Mistik Kristal di Timur Laut (6400 - 8000, 2800 - 4400)
    bgGraphics.fillStyle(0x0369a1, 0.9);
    bgGraphics.fillEllipse(7200, 3600, 1400, 900);
    bgGraphics.fillStyle(0x38bdf8, 0.5);
    bgGraphics.fillEllipse(7200, 3600, 1200, 750);

    bgGraphics.fillStyle(0x78350f, 1);
    bgGraphics.fillRect(6300, 3750, 220, 90);
    bgGraphics.lineStyle(3, 0x451a03, 1);
    bgGraphics.strokeRect(6300, 3750, 220, 90);

    this.add.text(7200, 3400, '🌊 TELAGA MISTIK KRISTAL', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '18px',
      color: '#7dd3fc',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // F. PUJASERA KULINER NUSANTARA (GEROBAK BAKSO, MIE AYAM, SOTO & MEJA MAKAN)
    // 1. Gerobak Bakso Solo (3x3 petak grid = 360x360 px) pada gx = 34, gy = 35
    this.addGridProp('cart-bakso', 34, 35, 3, 3, true, () => {
      const npc = this.npcs.find(n => n.id === 'npc_bakso');
      if (npc) this.approachAndInteractWithNpc(npc);
    }, 2);
    this.add.text(34 * 120 + 180, 35 * 120 - 20, '🍲 GEROBAK BAKSO SOLO', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(38 * 120 + 1);

    // 2. Gerobak Mie Ayam Jamur (3x3 petak grid = 360x360 px) pada gx = 44, gy = 35
    this.addGridProp('cart-mie-ayam', 44, 35, 3, 3, true, () => {
      const npc = this.npcs.find(n => n.id === 'npc_mie_ayam');
      if (npc) this.approachAndInteractWithNpc(npc);
    }, 2);
    this.add.text(44 * 120 + 180, 35 * 120 - 20, '🍜 GEROBAK MIE AYAM JAMUR', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(38 * 120 + 1);

    // 3. Gerobak Soto Lamongan (3x3 petak grid = 360x360 px) pada gx = 39, gy = 44
    this.addGridProp('cart-soto', 39, 44, 3, 3, true, () => {
      const npc = this.npcs.find(n => n.id === 'npc_soto');
      if (npc) this.approachAndInteractWithNpc(npc);
    }, 2);
    this.add.text(39 * 120 + 180, 44 * 120 - 20, '🥣 GEROBAK SOTO LAMONGAN', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(47 * 120 + 1);

    // Meja Makan (1x1 Meja.png) dan Kursi (1x2 Kursi Taman Front.png)
    const diningSets = [
      { tableGx: 35, tableGy: 39, chairGx: 35, chairGy: 40 },
      { tableGx: 45, tableGy: 39, chairGx: 45, chairGy: 40 },
      { tableGx: 36, tableGy: 43, chairGx: 36, chairGy: 44 },
      { tableGx: 44, tableGy: 43, chairGx: 44, chairGy: 44 },
    ];
    diningSets.forEach(ds => {
      this.addGridProp('prop-meja', ds.tableGx, ds.tableGy, 1, 1, true);
      this.addGridProp('prop-kursi-front', ds.chairGx, ds.chairGy, 1, 2, false);
    });

    // Tong Sampah di Setiap Gerobak (1x2 Tong Sampah.png)
    this.addGridProp('prop-tong-sampah', 33, 36, 1, 2, true);
    this.addGridProp('prop-tong-sampah', 47, 36, 1, 2, true);
    this.addGridProp('prop-tong-sampah', 38, 45, 1, 2, true);

    // G. GEDUNG SEKOLAH DASAR (SD) - SISI BARAT (gx: 12, gy: 35, ukuran 5x10 petak grid = 600x1200 px)
    this.addGridProp('school-sd-building', 12, 35, 5, 10, false, () => {
      this.approachDoorAndEnter('sd', this.schoolSdDoor.x, this.schoolSdDoor.y);
    });

    // Rintangan dinding depan SD di baris bawah (gx=12..13 dan gx=15..16 solid, pintu tengah gx=14 terbuka)
    this.addGridObstacle(12, 44, 2, 1);
    this.addGridObstacle(15, 44, 2, 1);

    // Pintu & Ambang Masuk Gedung SD
    const sdThreshold = this.add.graphics();
    sdThreshold.fillStyle(0xd70d0d, 0.95);
    sdThreshold.fillRoundedRect(14 * 120 + 10, 44 * 120 + 80, 100, 36, 6);
    sdThreshold.lineStyle(3, 0xf59e0b, 1);
    sdThreshold.strokeRoundedRect(14 * 120 + 10, 44 * 120 + 80, 100, 36, 6);

    this.add.text(14 * 120 + 60, 44 * 120 + 140, '🏫 GEDUNG SEKOLAH DASAR (SD)', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '16px',
      color: '#fca5a5',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(45 * 120 + 10);

    // Fasilitas di depan SD (1x2 Vending Machine Red, 1x3 Lampu, 1x2 Tong Sampah)
    this.addGridProp('vending-red', 9, 43, 1, 2, true);
    this.addGridProp('prop-lampu', 10, 42, 1, 3, false);
    this.addGridObstacle(10, 44, 1, 1);
    this.addGridProp('prop-lampu', 18, 42, 1, 3, false);
    this.addGridObstacle(18, 44, 1, 1);
    this.addGridProp('prop-tong-sampah', 19, 43, 1, 2, true);

    // H. GEDUNG SEKOLAH MENENGAH PERTAMA (SMP) - SISI UTARA (gx: 38, gy: 8, ukuran 5x10 petak grid = 600x1200 px)
    this.addGridProp('school-smp-building', 38, 8, 5, 10, false, () => {
      this.approachDoorAndEnter('smp', this.schoolSmpDoor.x, this.schoolSmpDoor.y);
    });

    // Rintangan dinding depan SMP di baris bawah (gx=38..39 dan gx=41..42 solid, pintu tengah gx=40 terbuka)
    this.addGridObstacle(38, 17, 2, 1);
    this.addGridObstacle(41, 17, 2, 1);

    // Pintu & Ambang Masuk Gedung SMP
    const smpThreshold = this.add.graphics();
    smpThreshold.fillStyle(0x0dd7ca, 0.95);
    smpThreshold.fillRoundedRect(40 * 120 + 10, 17 * 120 + 80, 100, 36, 6);
    smpThreshold.lineStyle(3, 0xf59e0b, 1);
    smpThreshold.strokeRoundedRect(40 * 120 + 10, 17 * 120 + 80, 100, 36, 6);

    this.add.text(40 * 120 + 60, 17 * 120 + 140, '🏫 GEDUNG SEKOLAH MENENGAH PERTAMA (SMP)', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '16px',
      color: '#67e8f9',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(18 * 120 + 10);

    // Fasilitas di depan SMP (1x2 Vending Machine Green, 1x3 Lampu, 1x2 Tong Sampah)
    this.addGridProp('vending-green', 35, 16, 1, 2, true);
    this.addGridProp('prop-lampu', 36, 15, 1, 3, false);
    this.addGridObstacle(36, 17, 1, 1);
    this.addGridProp('prop-lampu', 44, 15, 1, 3, false);
    this.addGridObstacle(44, 17, 1, 1);
    this.addGridProp('prop-tong-sampah', 45, 16, 1, 2, true);

    // I. GEDUNG SEKOLAH MENENGAH ATAS (SMA) - SISI TIMUR (gx: 63, gy: 35, ukuran 5x10 petak grid = 600x1200 px)
    this.addGridProp('school-sma-building', 63, 35, 5, 10, false, () => {
      this.approachDoorAndEnter('sma', this.schoolSmaDoor.x, this.schoolSmaDoor.y);
    });

    // Rintangan dinding depan SMA di baris bawah (gx=63..64 dan gx=66..67 solid, pintu tengah gx=65 terbuka)
    this.addGridObstacle(63, 44, 2, 1);
    this.addGridObstacle(66, 44, 2, 1);

    // Pintu & Ambang Masuk Gedung SMA
    const smaThreshold = this.add.graphics();
    smaThreshold.fillStyle(0x00eaff, 0.95);
    smaThreshold.fillRoundedRect(65 * 120 + 10, 44 * 120 + 80, 100, 36, 6);
    smaThreshold.lineStyle(3, 0xf59e0b, 1);
    smaThreshold.strokeRoundedRect(65 * 120 + 10, 44 * 120 + 80, 100, 36, 6);

    this.add.text(65 * 120 + 60, 44 * 120 + 140, '🏫 GEDUNG SEKOLAH MENENGAH ATAS (SMA)', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '16px',
      color: '#a5f3fc',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(45 * 120 + 10);

    // Fasilitas di depan SMA (1x2 Vending Machine Blue, Yellow, Lampu, Tong Sampah)
    this.addGridProp('vending-blue', 60, 43, 1, 2, true);
    this.addGridProp('vending-yellow', 61, 43, 1, 2, true);
    this.addGridProp('prop-lampu', 62, 42, 1, 3, false);
    this.addGridObstacle(62, 44, 1, 1);
    this.addGridProp('prop-lampu', 69, 42, 1, 3, false);
    this.addGridObstacle(69, 44, 1, 1);
    this.addGridProp('prop-tong-sampah', 70, 43, 1, 2, true);

    // J. RUMAH PRIBADI PEMAIN - SISI SELATAN (gx: 38, gy: 60, ukuran 5x5 petak grid = 600x600 px)
    this.addGridProp('house-5x5', 38, 60, 5, 5, false, () => {
      this.approachDoorAndEnter('house', this.playerHouseDoor.x, this.playerHouseDoor.y);
    });

    // Rintangan dinding depan rumah di baris bawah (gx=38..39 dan gx=41..42 solid, pintu tengah gx=40 terbuka)
    this.addGridObstacle(38, 64, 2, 1);
    this.addGridObstacle(41, 64, 2, 1);

    // Pintu & Ambang Masuk Rumah
    const houseThreshold = this.add.graphics();
    houseThreshold.fillStyle(0xd97706, 0.95);
    houseThreshold.fillRoundedRect(40 * 120 + 10, 64 * 120 + 80, 100, 36, 6);
    houseThreshold.lineStyle(3, 0xf59e0b, 1);
    houseThreshold.strokeRoundedRect(40 * 120 + 10, 64 * 120 + 80, 100, 36, 6);

    this.add.text(40 * 120 + 60, 64 * 120 + 140, '🏠 RUMAH PRIBADI PEMAIN', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '16px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(65 * 120 + 10);

    // Fasilitas di depan Rumah
    this.addGridProp('prop-lampu', 36, 62, 1, 3, false);
    this.addGridObstacle(36, 64, 1, 1);
    this.addGridProp('prop-lampu', 44, 62, 1, 3, false);
    this.addGridObstacle(44, 64, 1, 1);
    this.addGridProp('prop-kursi-front', 35, 65, 1, 2, false);

    // Sebar ornamen alam di sekeliling dunia (Pohon, Lampu, Kursi Taman, Bebatuan)
    this.spawnNatureDecorations();
  }

  /**
   * Menambahkan rintangan tabrakan statis yang menutup area petak grid tertentu
   */
  private addGridObstacle(gx: number, gy: number, gw: number, gh: number): void {
    const pixelW = gw * this.tileSize;
    const pixelH = gh * this.tileSize;
    const centerX = gx * this.tileSize + pixelW / 2;
    const centerY = gy * this.tileSize + pixelH / 2;

    const zone = this.add.zone(centerX, centerY, pixelW, pixelH);
    this.physics.add.existing(zone, true);
    if (this.obstacles) {
      this.obstacles.add(zone);
    }
  }

  /**
   * Menempatkan aset prop visual yang pas dan rata pada petak grid (AxB grid tiles @ 120px)
   */
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

    // Pembedaan Tegas:
    // 1. Rumput Liar ('prop-rumput', 1x2): Bergerombol liar, BEBAS COLLISION (bisa ditembus), menimpa kaki pemain jika di belakangnya.
    // 2. Taman Rumput ('prop-taman-rumput', 2x1): Tertata rapi, tidak banyak, dan MEMILIKI COLLISION fisik solid.
    const isWildGrass = key === 'prop-rumput';
    const isTamanRumput = key === 'prop-taman-rumput';

    // Kedalaman visual (Y-sorting natural):
    // Menggunakan dasar petak bawah (gy + gh) * tileSize.
    // Jika pemain berjalan di belakang atau di dalam rumput liar, rumput menimpa kaki/badan pemain secara alami!
    // Jika pemain berjalan di depan rumput liar, pemain menimpa rumput.
    img.setDepth((gy + gh) * this.tileSize);

    // Khusus rumput liar: 100% bebas collision (bisa dilewati)
    if (isWildGrass) {
      isObstacle = false;
    }

    // Khusus taman rumput: SELALU memiliki collision fisik solid (ada collision-nya)
    if (isTamanRumput) {
      isObstacle = true;
    }

    if (interactiveCallback) {
      img.setInteractive({ useHandCursor: true });
      img.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        interactiveCallback();
      });
    }

    // Collision konsisten selebar X (gw) dan setinggi 1 petak grid di baris dasar objek:
    // Taman Rumput (2x1) MEMILIKI collision fisik solid selebar 2 petak (gw=2, gh=1)!
    if (isObstacle && !isWildGrass) {
      this.addGridObstacle(gx, gy + gh - 1, gw, 1);
    }

    return img;
  }

  /**
   * Menempatkan pohon, lampu jalan, kursi taman, bebatuan, taman rumput rapi, dan gerombolan rumput liar di dunia
   */
  private spawnNatureDecorations(): void {
    // 1. Lampu Jalan Megah Sepanjang Boulevard Utama (1x3 Lampu.png)
    const boulevardLampsGy = [20, 24, 28, 48, 52, 56];
    boulevardLampsGy.forEach(ly => {
      this.addGridProp('prop-lampu', 38, ly, 1, 3, false);
      this.addGridObstacle(38, ly + 2, 1, 1);
      this.addGridProp('prop-lampu', 42, ly, 1, 3, false);
      this.addGridObstacle(42, ly + 2, 1, 1);
    });

    // 2. Kursi Taman di Alun-Alun Plaza (Ditempatkan di sudut-sudut santai plaza)
    const plazaBenches = [
      { gx: 34, gy: 33 }, // NW Plaza
      { gx: 46, gy: 33 }, // NE Plaza
      { gx: 34, gy: 47 }, // SW Plaza
      { gx: 46, gy: 47 }, // SE Plaza
    ];
    plazaBenches.forEach(pb => {
      this.addGridProp('prop-kursi-front', pb.gx, pb.gy, 1, 2, false);
    });

    // 3. TAMAN RUMPUT RAPI (2x1 TamanRumput.png) - TERTATA RAPI, TIDAK BANYAK, & MEMILIKI COLLISION FISIK SOLID
    const neatGardenBeds = [
      // A. Alun-Alun Central Plaza (4 Sudut Taman bersanding rapi dengan bangku taman)
      { gx: 36, gy: 33 }, // NW Plaza: Bersanding rapi di samping bangku Barat Laut
      { gx: 43, gy: 33 }, // NE Plaza: Bersanding rapi di samping bangku Timur Laut
      { gx: 36, gy: 47 }, // SW Plaza: Bersanding rapi di samping bangku Barat Daya
      { gx: 43, gy: 47 }, // SE Plaza: Bersanding rapi di samping bangku Timur Daya

      // B. Pembatas Taman Depan Rumah Pribadi Pemain (Simetris & rapi di kiri & kanan gerbang)
      { gx: 36, gy: 65 }, // Sayap Kiri Halaman Rumah
      { gx: 43, gy: 65 }, // Sayap Kanan Halaman Rumah

      // C. Taman Pembatas Gerbang Sekolah (Simetris di kiri & kanan koridor masuk)
      // 1. Gedung SD (Pintu di gx=14, gy=44)
      { gx: 11, gy: 45 }, // Sayap kiri jalan masuk SD
      { gx: 16, gy: 45 }, // Sayap kanan jalan masuk SD

      // 2. Gedung SMP (Pintu di gx=40, gy=17)
      { gx: 37, gy: 18 }, // Sayap kiri jalan masuk SMP
      { gx: 42, gy: 18 }, // Sayap kanan jalan masuk SMP

      // 3. Gedung SMA (Pintu di gx=65, gy=44)
      { gx: 62, gy: 45 }, // Sayap kiri jalan masuk SMA
      { gx: 67, gy: 45 }, // Sayap kanan jalan masuk SMA
    ];
    neatGardenBeds.forEach(bed => {
      this.addGridProp('prop-taman-rumput', bed.gx, bed.gy, 2, 1, true); // true = ada collision fisik!
    });

    // 4. GEROMBOLAN RUMPUT LIAR (1x2 Rumput.png) - 100% TANPA COLLISION & BERGEROMBOL ALAMI
    // Menimpa (overlap di depan) pemain saat pemain berdiri di belakang / di dalam semak rumput
    const wildGrassClusters = [
      // A. Klaster Padang Hutan Barat (Bergerombol alami di sela-sela pepohonan nusantara)
      { gx: 19, gy: 20 }, { gx: 20, gy: 20 }, { gx: 19, gy: 21 }, { gx: 20, gy: 21 }, { gx: 21, gy: 21 },
      { gx: 23, gy: 24 }, { gx: 24, gy: 24 }, { gx: 25, gy: 24 }, { gx: 24, gy: 25 }, { gx: 25, gy: 25 }, { gx: 26, gy: 25 },
      { gx: 17, gy: 27 }, { gx: 18, gy: 27 }, { gx: 18, gy: 28 }, { gx: 19, gy: 28 }, { gx: 20, gy: 28 },

      // B. Klaster Pesisir Telaga Mistik Kristal (Bergerombol liar di tepian air)
      { gx: 68, gy: 30 }, { gx: 69, gy: 30 }, { gx: 70, gy: 30 }, { gx: 69, gy: 31 }, { gx: 70, gy: 31 },
      { gx: 60, gy: 36 }, { gx: 61, gy: 36 }, { gx: 60, gy: 37 }, { gx: 61, gy: 37 }, { gx: 62, gy: 37 },
      { gx: 74, gy: 41 }, { gx: 75, gy: 41 }, { gx: 74, gy: 42 }, { gx: 75, gy: 42 }, { gx: 76, gy: 42 },

      // C. Klaster Bebatuan Gunung Timur (Bergerombol di celah bebatuan)
      { gx: 53, gy: 23 }, { gx: 54, gy: 23 }, { gx: 53, gy: 24 }, { gx: 54, gy: 24 }, { gx: 55, gy: 24 },
      { gx: 70, gy: 53 }, { gx: 71, gy: 53 }, { gx: 70, gy: 54 }, { gx: 71, gy: 54 }, { gx: 72, gy: 54 },

      // D. Klaster Padang Rumput Liar Selatan & Ladang (Bergerombol di alam terbuka sekitar rumah pemain & kebun)
      { gx: 30, gy: 63 }, { gx: 31, gy: 63 }, { gx: 30, gy: 64 }, { gx: 31, gy: 64 }, { gx: 32, gy: 64 },
      { gx: 48, gy: 63 }, { gx: 49, gy: 63 }, { gx: 48, gy: 64 }, { gx: 49, gy: 64 }, { gx: 50, gy: 64 },
      { gx: 46, gy: 75 }, { gx: 47, gy: 75 }, { gx: 46, gy: 76 }, { gx: 47, gy: 76 }, { gx: 48, gy: 76 },

      // E. Klaster Tepi Boulevard Hijau (Bergerombol alami di tanah rumput samping jalan besar)
      { gx: 36, gy: 24 }, { gx: 37, gy: 24 }, { gx: 36, gy: 25 }, { gx: 37, gy: 25 },
      { gx: 43, gy: 24 }, { gx: 44, gy: 24 }, { gx: 43, gy: 25 }, { gx: 44, gy: 25 },
      { gx: 36, gy: 52 }, { gx: 37, gy: 52 }, { gx: 36, gy: 53 }, { gx: 37, gy: 53 },
      { gx: 43, gy: 52 }, { gx: 44, gy: 52 }, { gx: 43, gy: 53 }, { gx: 44, gy: 53 },
    ];
    wildGrassClusters.forEach(wg => {
      this.addGridProp('prop-rumput', wg.gx, wg.gy, 1, 2, false); // false = zero collision!
    });

    // 3. Pohon Rindang Sepanjang Taman & Tepi Jalan (Tersusun Rapi pada Petak Grid)
    const boulevardTrees = [
      { gx: 36, gy: 22, tall: true }, { gx: 44, gy: 22, tall: true },
      { gx: 36, gy: 26, tall: false }, { gx: 44, gy: 26, tall: false },
      { gx: 36, gy: 50, tall: true }, { gx: 44, gy: 50, tall: true },
      { gx: 36, gy: 54, tall: false }, { gx: 44, gy: 54, tall: false },
    ];
    boulevardTrees.forEach(bt => {
      const key = bt.tall ? 'prop-pohon-tall' : 'prop-pohon-small';
      const gh = bt.tall ? 3 : 2;
      this.addGridProp(key, bt.gx, bt.gy, 1, gh, false);
      this.addGridObstacle(bt.gx, bt.gy + gh - 1, 1, 1);
    });

    // Taman Hutan Barat (Pohon berjarak 4 petak agar lega dan tidak berdempetan)
    for (let i = 0; i < 16; i++) {
      const gx = 18 + (i % 4) * 4;
      const gy = 18 + Math.floor(i / 4) * 4;
      const isTall = i % 2 === 0;
      const key = isTall ? 'prop-pohon-tall' : 'prop-pohon-small';
      const gh = isTall ? 3 : 2;
      this.addGridProp(key, gx, gy, 1, gh, false);
      this.addGridObstacle(gx, gy + gh - 1, 1, 1);
    }

    // 4. Bebatuan (1x2 Batu.png) - PAS TEPAT PADA PETAK GRID DENGAN COLLIDER FISIK SOLID (120x240 px)
    const rockLocations = [
      { gx: 54, gy: 24 }, { gx: 56, gy: 22 }, { gx: 58, gy: 26 },
      { gx: 72, gy: 24 }, { gx: 74, gy: 22 }, { gx: 76, gy: 26 },
      { gx: 68, gy: 50 }, { gx: 71, gy: 54 }, { gx: 74, gy: 52 },
      { gx: 69, gy: 58 }, { gx: 73, gy: 62 }, { gx: 76, gy: 60 },
      { gx: 20, gy: 60 }, { gx: 23, gy: 64 }, { gx: 26, gy: 62 },
      { gx: 54, gy: 68 }, { gx: 57, gy: 72 }, { gx: 60, gy: 70 },
    ];
    rockLocations.forEach(r => {
      this.addGridProp('prop-batu', r.gx, r.gy, 1, 2, true);
    });

    // 5. Peti Harta Karun Tersebar di Penjuru Dunia
    const chests = [
      { gx: 22, gy: 19, name: 'Peti Hutan Nusantara' },
      { gx: 62, gy: 23, name: 'Peti Telaga Kristal' },
      { gx: 32, gy: 57, name: 'Peti Padang Selatan' },
      { gx: 65, gy: 60, name: 'Peti Bebatuan Timur' },
    ];
    chests.forEach(c => {
      const cx = c.gx * this.tileSize + 60;
      const cy = c.gy * this.tileSize + 60;
      const chest = this.add.image(cx, cy, 'chest-asset').setDisplaySize(48, 48);
      chest.setInteractive({ useHandCursor: true });
      chest.on('pointerdown', () => {
        chest.setTint(0xfacc15);
        this.tweens.add({
          targets: chest,
          scaleX: 1.25,
          scaleY: 1.25,
          yoyo: true,
          duration: 200,
        });
        EventBus.emit('new-chat-message', {
          id: `chest_${Date.now()}`,
          senderId: 'system',
          senderName: 'Sistem RadenWorld',
          text: `Selamat! Kamu membuka ${c.name} dan memperoleh 100 Gold & 25 EXP!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      });
    });
  }

  /**
   * Menavigasikan pemain menuju ke pintu gedung dan memicu teleportasi saat sampai
   */
  private approachDoorAndEnter(type: 'sd' | 'smp' | 'sma' | 'house', doorX: number, doorY: number): void {
    if (!this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, doorX, doorY);

    if (dist <= 130) {
      if (type === 'sd') this.transitionToSchool('sd', this.schoolSdDoor.x, this.schoolSdDoor.y + 120);
      else if (type === 'smp') this.transitionToSchool('smp', this.schoolSmpDoor.x, this.schoolSmpDoor.y + 120);
      else if (type === 'sma') this.transitionToSchool('sma', this.schoolSmaDoor.x, this.schoolSmaDoor.y + 120);
      else this.transitionToHouse();
    } else {
      this.spawnTapRipple(doorX, doorY + 60);
      this.player.navigateTo(doorX, doorY + 60, () => {
        if (type === 'sd') this.transitionToSchool('sd', this.schoolSdDoor.x, this.schoolSdDoor.y + 120);
        else if (type === 'smp') this.transitionToSchool('smp', this.schoolSmpDoor.x, this.schoolSmpDoor.y + 120);
        else if (type === 'sma') this.transitionToSchool('sma', this.schoolSmaDoor.x, this.schoolSmaDoor.y + 120);
        else this.transitionToHouse();
      });
    }
  }

  /**
   * Menempatkan seluruh NPC interaktif ramah di open world
   */
  private createWorldNpcs(): void {
    this.npcs.forEach(npcData => {
      // Sprite NPC dengan skala proporsional
      const npcSprite = this.add.image(npcData.x, npcData.y, npcData.spriteKey).setDisplaySize(64, 64);
      npcSprite.setOrigin(0.5, 1.0);
      npcSprite.setDepth(npcData.y);

      // Nameplate NPC - Tajam & HD Anti Blur
      this.add.text(npcData.x, npcData.y - 74, npcData.name, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '13px',
        color: '#fef08a',
        fontStyle: 'bold',
        stroke: '#0a0f1d',
        strokeThickness: 3.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npcData.y + 1);

      this.add.text(npcData.x, npcData.y - 58, `[${npcData.role}]`, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '10px',
        color: '#38bdf8',
        stroke: '#0a0f1d',
        strokeThickness: 2.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npcData.y + 1);

      npcSprite.setInteractive({ useHandCursor: true });
      npcSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        this.approachAndInteractWithNpc(npcData);
      });
    });
  }

  /**
   * Mendekati NPC terlebih dahulu hingga jarak interaksi, baru membuka dialog
   * (Berlaku untuk klik PC maupun tap layar sentuh Mobile)
   */
  private approachAndInteractWithNpc(npcData: INpcConfig): void {
    if (!this.player || !this.player.active) return;

    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, npcData.x, npcData.y);

    if (dist <= 110) {
      // Pemain sudah dekat dengan NPC, langsung buka dialog
      this.interactWithNpc(npcData);
    } else {
      // Pemain masih jauh: mendekat dulu ke arah NPC baru buka dialog
      this.player.showSpeechBubble(`Menuju ke ${npcData.name}...`, 1500);

      // Hitung titik berhenti di depan NPC (~75px)
      const angle = Phaser.Math.Angle.Between(npcData.x, npcData.y, px, py);
      const targetX = Math.round(npcData.x + Math.cos(angle) * 75);
      const targetY = Math.round(npcData.y + Math.sin(angle) * 75);

      this.spawnTapRipple(targetX, targetY);
      this.player.navigateTo(targetX, targetY, () => {
        this.interactWithNpc(npcData);
      });
    }
  }

  /**
   * Efek animasi lingkaran sentuh emas saat klik atau tap grid lantai
   */
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

  private interactWithNpc(npcData: INpcConfig): void {
    EventBus.emit('open-dialogue', {
      id: npcData.id,
      name: npcData.name,
      role: npcData.role,
      avatarType: npcData.avatarType,
      dialogues: npcData.dialogues && npcData.dialogues.length > 0 ? npcData.dialogues : [npcData.greeting],
    });
  }

  /**
   * Spawn karakter lokal pemain
   */
  public spawnLocalPlayer(name: string, avatar: IAvatarCustomization, nearHouse: boolean = false): void {
    // Jika pemain sudah aktif ada di scene dan masih valid
    if (this.player && this.player.active && this.player.scene === this) {
      this.player.setAvatar(avatar);
      if (name) {
        this.player.setEntityName(name);
      }
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.startFollow(this.player, false, 0.18, 0.18);
      this.cameras.main.centerOn(this.player.x, this.player.y);
      return;
    }

    // Koordinat spawn: pulihkan posisi terakhir pemain di Open World jika ada
    let spawnX = nearHouse ? 4860 : 4860;
    let spawnY = nearHouse ? 7860 : 4860;

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
      } catch (e) {}
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

    // Aktifkan tabrakan fisik Arcade agar karakter tidak bisa menembus dinding gedung, gerobak, batu, dan meja
    if (this.obstacles) {
      this.physics.add.collider(this.player, this.obstacles);
    }

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.startFollow(this.player, false, 0.18, 0.18);
    this.smoothZoomTo(0.9);

    // Buka koneksi multiplayer dan daftarkan pemain dengan koordinat spawn sebenarnya
    this.networkManager.connect();
    const isSuperAdmin = name.toUpperCase() === 'RADEN';
    let savedGold = isSuperAdmin ? 999999 : 2500;
    let savedDiamonds = isSuperAdmin ? 99999 : 50;
    try {
      const g = localStorage.getItem('raden_player_gold');
      if (g) savedGold = parseInt(g, 10);
      const d = localStorage.getItem('raden_player_diamonds');
      if (d) savedDiamonds = parseInt(d, 10);
    } catch (e) {}

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

      // Bersihkan remote player lama agar tidak ada ghost player tertinggal
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
  }

  private addRemotePlayer(p: IPlayerData): void {
    if (!this.sys || !this.sys.displayList || !this.scene.isActive()) return;
    const myName = (this.player?.getEntityName() || this.pendingPlayerName || '').trim().toLowerCase();
    const myId = this.networkManager.getSocketId();

    // Jangan spawn diri sendiri sebagai remote player!
    if (p.id === myId) return;
    if (myName && p.name && p.name.trim().toLowerCase() === myName) return;

    // Jika remote player dengan ID ini sudah ada, update posisi & arahnya
    if (this.remotePlayers.has(p.id)) {
      const existing = this.remotePlayers.get(p.id);
      if (existing && existing.active) {
        existing.setNetworkState(p.x, p.y, p.direction || 'down', false);
        existing.setPosition(p.x, p.y);
      }
      return;
    }

    // Bersihkan duplicate jika ada remote player lama dengan nama yang sama persis
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
        p.hp,
        p.maxHp
      );

      // Aktifkan interaksi klik/sentuh untuk membuka profil pemain lain
      remote.makeClickable(() => {
        const targetId = remote.getEntityId() || p.id;
        const targetName = remote.getEntityName() || p.name;
        console.log(`[WorldScene] Menginspeksi pemain: id=${targetId}, name=${targetName}`);
        EventBus.emit('inspect-player-profile', {
          id: targetId,
          name: targetName,
          avatar: remote.getAvatar() || p.avatar,
          level: (p as any).level || 1,
          role: p.role || 'player',
          isSuperAdmin: p.isSuperAdmin || targetName?.toUpperCase() === 'RADEN',
          gold: typeof p.gold === 'number' ? p.gold : ((p.isSuperAdmin || targetName?.toUpperCase() === 'RADEN') ? 999999 : 2500),
          diamonds: typeof p.diamonds === 'number' ? p.diamonds : ((p.isSuperAdmin || targetName?.toUpperCase() === 'RADEN') ? 99999 : 50),
        });
      });

      if ((p as any).isAfk) {
        remote.setAfk(true, (p as any).durationSeconds || 60);
      }

      this.remotePlayers.set(p.id, remote);
    } catch (err) {
      console.warn('[WorldScene] Gagal menambahkan remote player:', err);
    }
  }

  public update(time: number, delta: number): void {
    if (!this.player || this.isTransitioning) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y + 60);

    const px = this.player.x;
    const py = this.player.y;

    // Cek kedekatan dengan pintu gedung sekolah dan rumah pemain
    const distSd = Phaser.Math.Distance.Between(px, py, this.schoolSdDoor.x, this.schoolSdDoor.y);
    const distSmp = Phaser.Math.Distance.Between(px, py, this.schoolSmpDoor.x, this.schoolSmpDoor.y);
    const distSma = Phaser.Math.Distance.Between(px, py, this.schoolSmaDoor.x, this.schoolSmaDoor.y);
    const distHouse = Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y);

    let prompt: string | null = null;
    let locationName = this.getRegionName(px, py);

    if (distSd < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SD';
      locationName = 'KAWASAN PENDIDIKAN: GEDUNG SD';
    } else if (distSmp < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SMP';
      locationName = 'KAWASAN PENDIDIKAN: GEDUNG SMP';
    } else if (distSma < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SMA';
      locationName = 'KAWASAN PENDIDIKAN: GEDUNG SMA';
    } else if (distHouse < 120 && time > this.doorCooldownUntil) {
      prompt = `TEKAN [E] / KLIK UNTUK MASUK KE RUMAH PRIBADI (${this.privateRoomId})`;
      locationName = 'SANCTUARY: RUMAH PEMAIN';
    } else {
      // Cek kedekatan dengan NPC terdekat
      for (const npc of this.npcs) {
        const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
        if (dist < 100) {
          prompt = `TEKAN [E] / KLIK UNTUK BICARA DENGAN ${npc.name.toUpperCase()}`;
          break;
        }
      }
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }

    const gridX = Math.floor(px / this.tileSize);
    const gridY = Math.floor(py / this.tileSize);
    const gridChanged = gridX !== this.lastGridX || gridY !== this.lastGridY;
    const locChanged = locationName !== this.lastLocationName;
    const periodicTimeout = time - this.lastStatsEmitTime > 1000;

    if (gridChanged || locChanged || periodicTimeout) {
      this.lastStatsEmitTime = time;
      this.lastGridX = gridX;
      this.lastGridY = gridY;
      this.lastLocationName = locationName;
      EventBus.emit('player-stats-updated', {
        x: Math.round(px),
        y: Math.round(py),
        gridX,
        gridY,
        hp: this.player.getHealth(),
        maxHp: this.player.getMaxHealth(),
        name: this.player.getEntityName(),
        avatar: this.player.getAvatar(),
        roomName: locationName,
        inHouse: false,
        level: 1,
      });

      try {
        localStorage.setItem(
          'raden_pos_world',
          JSON.stringify({ x: Math.round(px), y: Math.round(py) })
        );
      } catch (e) {}
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
      this.transitionToSchool('sd', this.schoolSdDoor.x, this.schoolSdDoor.y + 60);
      return;
    }

    // 2. Masuk ke Gedung SMP
    if (Phaser.Math.Distance.Between(px, py, this.schoolSmpDoor.x, this.schoolSmpDoor.y) < 130) {
      this.transitionToSchool('smp', this.schoolSmpDoor.x, this.schoolSmpDoor.y + 60);
      return;
    }

    // 3. Masuk ke Gedung SMA
    if (Phaser.Math.Distance.Between(px, py, this.schoolSmaDoor.x, this.schoolSmaDoor.y) < 130) {
      this.transitionToSchool('sma', this.schoolSmaDoor.x, this.schoolSmaDoor.y + 60);
      return;
    }

    // 4. Masuk kembali ke rumah pribadi (jika dekat dan cooldown lewat)
    const distHouse = Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y);
    if (distHouse < 130 && (!this.time || this.time.now > this.doorCooldownUntil)) {
      this.transitionToHouse();
      return;
    }

    // 5. Interaksi dengan NPC terdekat
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
      if (dist < 120) {
        this.interactWithNpc(npc);
        return;
      }
    }
  }

  private transitionToSchool(schoolType: 'sd' | 'smp' | 'sma', returnX: number, returnY: number): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const label = schoolType === 'sd' ? 'Gedung SD' : schoolType === 'smp' ? 'Gedung SMP' : 'Gedung SMA';
    this.player?.showSpeechBubble(`Masuk ke ${label}...`);

    const schoolPath = `/world/${schoolType}`;
    if (window.location.pathname !== schoolPath) {
      window.history.pushState(null, '', schoolPath);
    }
    EventBus.emit('url-changed', schoolPath);

    this.time.delayedCall(400, () => {
      this.cameras?.main?.stopFollow();
      this.scene.start('SchoolScene', {
        schoolType,
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
      } catch (e) {}

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
    if (Math.hypot(x - 3480, y - 3840) < 650) return 'KAWASAN PENDIDIKAN: GEDUNG SD';
    if (Math.hypot(x - 4800, y - 2640) < 650) return 'KAWASAN PENDIDIKAN: GEDUNG SMP';
    if (Math.hypot(x - 6120, y - 3840) < 650) return 'KAWASAN PENDIDIKAN: GEDUNG SMA';
    if (x >= 4300 && x <= 5300 && y >= 4400 && y <= 5200) return 'PUJASERA KULINER NUSANTARA';
    if (Math.hypot(x - 4800, y - 5500) < 400) return 'SANCTUARY: RUMAH PEMAIN';
    if (Math.hypot(x - 4800, y - 4800) < 600) return 'SANCTUARY CENTRAL PLAZA';
    if (x > 6200 && y < 4600) return 'TELAGA MISTIK KRISTAL';
    if (x < 3600 && y < 3600) return 'HUTAN ZAMRUD INDONESIA';
    if (y > 6600) return 'PERKEBUNAN HIJAU SELATAN';
    if (x > 6800 && y > 5500) return 'BEBATUAN ALAM TIMUR';
    return 'RADENWORLD OPEN REALMS';
  }
}
