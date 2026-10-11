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

  // Zona Bangunan & Pintu Interaktif
  private playerHouseDoor = { x: 4800, y: 5520 };
  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private lastGridX: number = -1;
  private lastGridY: number = -1;
  private lastLocationName: string = '';
  private doorCooldownUntil: number = 0;
  private isTransitioning: boolean = false;

  // Kontrol zoom kamera halus
  private targetZoom: number = 0.9;

  // Daftar NPC Interaktif Ramah di Berbagai Penjuru Dunia dengan Narasi Dialog Multi-Halaman
  private npcs: INpcConfig[] = [
    {
      id: 'npc_sage',
      name: 'Sage Raden',
      role: 'Tetua Kebijaksanaan',
      avatarType: 'sage',
      x: 4860,
      y: 4760,
      greeting: 'Salam sejahtera, wahai penjelajah dunia!',
      dialogues: [
        'Salam sejahtera, wahai penjelajah! Selamat datang di RadenWorld, tanah agung yang dibangun dengan penuh kebebasan dan persahabatan.',
        'Dunia luas ini terbentang 80x80 petak catur dengan distrik megah: Alun-Alun Sanctuary, Kuil Purba, hingga Telaga Mistik Kristal.',
        'Kamu bisa menjelajah bersama kawan-kawanmu, berbincang langsung melalui Proximity Voice Chat di radius 5 petak, dan mengukir kisah hebatmu di sini!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_blacksmith',
      name: 'Blacksmith Arya',
      role: 'Pandai Besi Terhebat',
      avatarType: 'blacksmith',
      x: 4560,
      y: 3840,
      greeting: 'Klang! Klang! Panasnya tungku tempa menyambutmu!',
      dialogues: [
        'Klang! Klang! Hahaha, sambutlah deburan api tempa Arya! Pandai besi nomor satu di seluruh kota Sanctuary!',
        'Zirah baja kristal dan pedang pusaka yang kutempa dirancang dari paduan logam terbaik agar mampu melindungimu di alam liar.',
        'Jika kamu menemukan bijih mineral langka di reruntuhan granit timur, bawa ke mari. Akan kutempa menjadi perlengkapan legendaris!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_alchemist',
      name: 'Alchemist Sari',
      role: 'Penyeduh Ramuan Ajaib',
      avatarType: 'alchemist',
      x: 5040,
      y: 3840,
      greeting: 'Ramuan herbal harum siap menyegarkan staminamu.',
      dialogues: [
        'Ssshh... pelankan langkahmu, ramuan sari bunga Telaga Mistik sedang mendidih sempurna di dalam labu kaca ini.',
        'Aku meracik eliksir pemulih stamina, tonik kelincahan langkah kaki, hingga esensi herbal relaksasi rumah.',
        'Minumlah seteguk sebelum menempuh petualangan jauh. Pikiran yang tenang dan tubuh yang segar adalah benteng terkuatmu!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_merchant',
      name: 'Merchant Malik',
      role: 'Pedagang Keliling Antar Samudra',
      avatarType: 'merchant',
      x: 4800,
      y: 3960,
      greeting: 'Barang antik langka dari seberang samudra!',
      dialogues: [
        'Kemari, kawan! Mendekatlah! Kafilah daganganku baru saja mendarat dari pelayaran panjang menyeberangi tujuh samudra!',
        'Banyak kain sutra berkilau, artefak permata zamrud antik, dan cenderamata eksotis yang kubawa di dalam gerobak emas ini.',
        'Simpan koin emasmu baik-baik, karena kejutan barang antik di pasar Sanctuary selalu diburu para kolektor sejati!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_guard',
      name: 'Captain Bima',
      role: 'Komandan Penjaga Sanctuary',
      avatarType: 'guard',
      x: 4800,
      y: 4320,
      greeting: 'Sanctuary Plaza aman terkendali di bawah pengawasan.',
      dialogues: [
        'Tegakkan langkahmu, petualang! Saya, Kapten Bima, memimpin divisi penjaga untuk memastikan Sanctuary Plaza senantiasa aman dan tertib.',
        'Hormati sesama kawan petualang, patuhi aturan kota, dan laporkan segera jika kamu menjumpai gangguan di wilayah perbatasan.',
        'Jika situasi darurat terjadi, panggil Super Admin RADEN. Kami siap mengawal kedamaian tanah RadenWorld!'
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
      role: 'Petani Padang Gandum Subur',
      avatarType: 'farmer',
      x: 4800,
      y: 7200,
      greeting: 'Kincir angin berputar, pertanda panen melimpah!',
      dialogues: [
        'Ohoho! Selamat datang di padang gandum selatan! Kincir angin raksasa berputar riang menghembuskan aroma gandum keemasan.',
        'Hasil panen tanah gembur ini diolah menjadi roti gandum emas terlezat yang menyuplai seluruh penduduk kota Sanctuary.',
        'Ketulusan dalam merawat bumi tidak pernah mengkhianati hasil. Nikmatilah hangatnya suasana pedesaan di sini!'
      ],
      spriteKey: 'npc-sprite',
    },
    {
      id: 'npc_elder',
      name: 'Elder Maya',
      role: 'Penjaga Kuil Hutan Kuno',
      avatarType: 'elder',
      x: 2400,
      y: 2400,
      greeting: 'Pohon-pohon purba berbisik menceritakan sejarah.',
      dialogues: [
        'Dengarlah bisikan dedaunan purba yang menari perlahan... Pepohonan raksasa ini telah berdiri kokoh ribuan warsa.',
        'Kuil Hutan Kuno menyimpan kristal perlindungan sakral yang memancarkan energi kedamaian ke seluruh bentang alam RadenWorld.',
        'Berjalanlah dengan niat mulia dan rawatlah persahabatan di hatimu. Semesta akan senantiasa memberkati setiap langkahmu.'
      ],
      spriteKey: 'npc-sprite',
    },
  ];

  constructor() {
    super({ key: 'WorldScene' });
    this.networkManager = NetworkManager.getInstance();
  }

  public init(data?: { name?: string; avatar?: IAvatarCustomization; spawnNearHouse?: boolean; privateRoomId?: string }): void {
    this.isTransitioning = false;
    this.doorCooldownUntil = this.time ? this.time.now + 2500 : 0;
    this.player = null as any;

    if (data?.name) this.pendingPlayerName = data.name;
    if (data?.avatar) this.pendingAvatar = data.avatar;
    this.spawnNearHouseDoor = !!data?.spawnNearHouse;
    if (data?.privateRoomId) this.privateRoomId = data.privateRoomId;
  }

  public create(): void {
    // 1. Batas fisika dunia (9600x9600)
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 2. Render grafis lingkungan alam dengan pola catur 120x120px
    this.createWorldEnvironment();

    // 3. Render NPC Interaktif di seluruh wilayah
    this.createWorldNpcs();

    // 4. Pasang pendengar event multiplayer
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
   * Menggambar lingkungan alam Open World 9600x9600px berpola catur kotak 120x120px
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

    // B. Alun-Alun Pusat Sanctuary Plaza (4200 - 5400, 4200 - 5400)
    const plazaLeft = 4200;
    const plazaTop = 4200;
    const plazaWidth = 1200;
    const plazaHeight = 1200;

    // Ubin Batu Plaza Pola Catur Ringan 60 FPS via TileSprite (1 draw call)
    const plazaFloor = this.add.tileSprite(
      plazaLeft + plazaWidth / 2,
      plazaTop + plazaHeight / 2,
      plazaWidth,
      plazaHeight,
      'plaza-checker-tile'
    );
    plazaFloor.setDepth(-90);

    // Garis Batas Emas Sanctuary Plaza
    bgGraphics.lineStyle(6, 0xf59e0b, 0.9);
    bgGraphics.strokeRoundedRect(plazaLeft, plazaTop, plazaWidth, plazaHeight, 32);

    // C. Jalan Penghubung Utama (Boulevard Beraspal / Batu)
    // Jalan Utara-Selatan
    bgGraphics.fillStyle(0x1e293b, 0.9);
    bgGraphics.fillRect(4680, 2400, 240, 4800);
    // Jalan Barat-Timur
    bgGraphics.fillRect(2400, 4680, 4800, 240);

    // D. Air Mancur Megah di Pusat Plaza (4800, 4800)
    const fountain = this.add.graphics();
    fountain.fillStyle(0x0284c7, 1);
    fountain.fillCircle(4800, 4800, 90);
    fountain.lineStyle(8, 0xf59e0b, 1);
    fountain.strokeCircle(4800, 4800, 90);
    fountain.fillStyle(0x38bdf8, 0.7);
    fountain.fillCircle(4800, 4800, 60);

    this.add.text(4800, 4670, '★ SANCTUARY CENTRAL PLAZA ★', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '20px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // E. Danau Mistik Kristal (Azure Lake) di Timur Laut (6400 - 8000, 2800 - 4400)
    bgGraphics.fillStyle(0x0369a1, 0.9);
    bgGraphics.fillEllipse(7200, 3600, 1400, 900);
    bgGraphics.fillStyle(0x38bdf8, 0.5);
    bgGraphics.fillEllipse(7200, 3600, 1200, 750);

    // Dermaga Kayu di Tepi Danau
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

    // F. Rumah Pribadi Pemain (Residential District) - Selatan Plaza (4800, 5400)
    const houseG = this.add.graphics();
    // Dinding kayu rumah besar
    houseG.fillStyle(0x78350f, 1);
    houseG.fillRoundedRect(4660, 5300, 280, 200, 16);
    houseG.lineStyle(4, 0x451a03, 1);
    houseG.strokeRoundedRect(4660, 5300, 280, 200, 16);
    // Atap pelana merah marun
    houseG.fillStyle(0x991b1b, 1);
    houseG.fillTriangle(4620, 5300, 4800, 5160, 4980, 5300);
    // Cerobong asap
    houseG.fillStyle(0x475569, 1);
    houseG.fillRect(4900, 5170, 32, 50);
    // Pintu masuk rumah
    houseG.fillStyle(0x0a0f1d, 1);
    houseG.fillRect(4755, 5420, 90, 80);
    houseG.fillStyle(0xf59e0b, 1);
    houseG.fillCircle(4830, 5460, 6);
    // Karpet keset depan pintu
    houseG.fillStyle(0xd97706, 0.9);
    houseG.fillRect(4740, 5500, 120, 24);

    this.add.text(4800, 5260, '🏠 RUMAH PRIBADI PEMAIN', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '16px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // G. Kawasan Pasar & Toko (Market District) - Utara Plaza
    // Toko Pandai Besi Arya
    const bsG = this.add.graphics();
    bsG.fillStyle(0x334155, 1);
    bsG.fillRoundedRect(4420, 3720, 260, 180, 12);
    bsG.lineStyle(3, 0x0f172a, 1);
    bsG.strokeRoundedRect(4420, 3720, 260, 180, 12);
    // Atap besi gelap
    bsG.fillStyle(0x1e293b, 1);
    bsG.fillTriangle(4390, 3720, 4550, 3600, 4710, 3720);
    // Tungku api pandai besi
    bsG.fillStyle(0xef4444, 1);
    bsG.fillCircle(4470, 3810, 20);

    this.add.text(4550, 3680, '⚔️ BENGKEL PANDAI BESI', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '15px',
      color: '#fbbf24',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Toko Alkimia Sari
    const alcG = this.add.graphics();
    alcG.fillStyle(0x065f46, 1);
    alcG.fillRoundedRect(4920, 3720, 260, 180, 12);
    alcG.lineStyle(3, 0x022c22, 1);
    alcG.strokeRoundedRect(4920, 3720, 260, 180, 12);
    // Atap kubah zamrud
    alcG.fillStyle(0x047857, 1);
    alcG.fillTriangle(4890, 3720, 5050, 3600, 5210, 3720);

    this.add.text(5050, 3680, '🧪 APOTEK ALKIMIA AJAIB', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '15px',
      color: '#6ee7b7',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Sebar ornamen alam di sekeliling dunia (Pohon & Batu)
    this.spawnNatureDecorations();
  }

  /**
   * Menempatkan pohon, bebatuan, dan peti harta di area luas
   */
  private spawnNatureDecorations(): void {
    // 1. Hutan Zamrud Barat Laut (1600 - 3600, 1600 - 3600)
    for (let i = 0; i < 48; i++) {
      const x = 1600 + (i % 8) * 240 + Math.sin(i) * 60;
      const y = 1600 + Math.floor(i / 8) * 240 + Math.cos(i) * 60;
      const tree = this.add.image(x, y, 'tree-asset').setDisplaySize(96, 120);
      tree.setDepth(y);
    }

    // 2. Padang Timur (6500 - 8500, 5000 - 7500)
    for (let i = 0; i < 30; i++) {
      const x = 6500 + (i % 6) * 300 + Math.sin(i) * 80;
      const y = 5000 + Math.floor(i / 6) * 320 + Math.cos(i) * 80;
      const rock = this.add.image(x, y, i % 2 === 0 ? 'rock-asset' : 'tree-asset');
      rock.setDisplaySize(i % 2 === 0 ? 80 : 96, i % 2 === 0 ? 60 : 120);
      rock.setDepth(y);
    }

    // 3. Peti Harta Karun Tersebar di Penjuru Dunia
    const chests = [
      { x: 2600, y: 2200, name: 'Peti Hutan Kuno' },
      { x: 7400, y: 2800, name: 'Peti Telaga Kristal' },
      { x: 3800, y: 6800, name: 'Peti Padang Selatan' },
      { x: 7800, y: 7200, name: 'Peti Bebatuan Timur' },
    ];

    chests.forEach(c => {
      const chest = this.add.image(c.x, c.y, 'chest-asset').setDisplaySize(48, 48);
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
    let spawnX = nearHouse ? 4800 : 4800;
    let spawnY = nearHouse ? 5660 : 4860;

    if (!nearHouse) {
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

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.startFollow(this.player, false, 0.18, 0.18);
    this.smoothZoomTo(0.9);

    // Buka koneksi multiplayer dan daftarkan pemain dengan koordinat spawn sebenarnya
    this.networkManager.connect();
    const isSuperAdmin = name.toUpperCase() === 'RADEN';
    this.networkManager.joinGame(
      name,
      avatar,
      isSuperAdmin ? 'super_admin' : 'player',
      isSuperAdmin,
      spawnX,
      spawnY,
      'down'
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
    this.player.setDepth(this.player.y);

    const px = this.player.x;
    const py = this.player.y;

    // Cek kedekatan dengan rumah pemain
    const distHouse = Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y);

    let prompt: string | null = null;
    let locationName = this.getRegionName(px, py);

    // Hanya tampilkan prompt masuk rumah jika cooldown sudah selesai
    if (distHouse < 110 && time > this.doorCooldownUntil) {
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
      p.setDepth(p.y);
    });
  }

  public triggerCurrentInteraction(): void {
    if (!this.player || this.isTransitioning) return;
    const px = this.player.x;
    const py = this.player.y;

    // 1. Masuk kembali ke rumah pribadi (jika dekat dan cooldown lewat)
    const distHouse = Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y);
    if (distHouse < 130 && (!this.time || this.time.now > this.doorCooldownUntil)) {
      this.transitionToHouse();
      return;
    }

    // 2. Interaksi dengan NPC terdekat
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
      if (dist < 120) {
        this.interactWithNpc(npc);
        return;
      }
    }
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
    if (Math.hypot(x - 4800, y - 4800) < 600) return 'SANCTUARY CENTRAL PLAZA';
    if (x >= 4300 && x <= 5300 && y >= 3600 && y <= 4200) return 'SANCTUARY MARKET SQUARE';
    if (Math.hypot(x - 4800, y - 5400) < 300) return 'SANCTUARY: RUMAH PEMAIN';
    if (x > 6200 && y < 4600) return 'AZURE MYSTIC LAKE';
    if (x < 3600 && y < 3600) return 'WHISPERING EMERALD FOREST';
    if (y > 6600) return 'SOUTHERN WINDMILL FARMS';
    if (x > 6800 && y > 5500) return 'EASTERN GRANITE RUINS';
    return 'RADENWORLD OPEN REALMS';
  }
}
