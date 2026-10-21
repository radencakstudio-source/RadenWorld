/**
 * ============================================================================
 * FILE: resources/js/game/scenes/SchoolScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Interior Gedung Sekolah Modern Indonesia (SD, SMP, dan SMA).
 * 
 * SPESIFIKASI WARNA LANTAI CATUR (HEX):
 * 1. Gedung SD:
 *    - Terang: #D70D0D (Crimson Red Cerah)
 *    - Gelap:  #570404 (Maroon Gelap)
 * 2. Gedung SMP:
 *    - Terang: #0DD7CA (Turquoise / Cyan Hijau Laut)
 *    - Gelap:  #0C6125 (Hijau Zamrud Gelap)
 * 3. Gedung SMA:
 *    - Terang: #FEFEFE (Putih Abu Bersih)
 *    - Gelap:  #00EAFF (Electric Cyan Biru Muda)
 * 
 * TATA RUANG KELAS STANDAR INDONESIA:
 * - Dinding Depan: Lambang Garuda Pancasila emas, Bingkai Foto Presiden & Wakil Presiden RI,
 *   Papan Tulis Whiteboard/Blackboard dengan baki spidol/kapur, Jam Dinding Sekolah, Tiang Bendera
 *   Merah Putih, dan Peta Kepulauan Indonesia (NKRI).
 * - Podium Guru: Karpet merah podium, Meja Guru kayu jati dengan berkas buku tugas, lonceng emas,
 *   dan kursi guru empuk.
 * - Barisan Meja & Kursi Siswa: Meja kayu jati dan kursi siswa masing-masing di petak grid terpisah
 *   (bukan 1 grid bertumpuk), tertata dalam 4 kolom dengan lorong jalan tengah (central aisle)
 *   yang luas menghubungkan pintu masuk langsung ke papan tulis.
 * - Dinding Samping & Belakang: Jendela kelas berkanopi dengan cahaya matahari luar dan tirai,
 *   Majalah Dinding (Mading Kelas) berisi jadwal piket & kreasi siswa, Rak Buku Pojok Baca kelas,
 *   Sudut Kebersihan (rak sapu ijuk, pengki, kemoceng), dan tempat sampah kelas bersih.
 * - Tanpa pohon luar atau mesin vending di dalam kelas (realistis & bersih).
 * - Sinkronisasi Multiplayer & Room Switching 100% real-time dengan persistensi posisi saat refresh.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { IAvatarCustomization, IPlayerData } from '../types';

export type SchoolType = 'sd' | 'smp' | 'sma';

export interface ISchoolInitData {
  schoolType: SchoolType;
  grade?: number;
  name?: string;
  avatar?: IAvatarCustomization;
  returnX?: number;
  returnY?: number;
  fromDoor?: boolean;
}

interface ISchoolNpc {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  avatarType?: 'sage' | 'blacksmith' | 'alchemist' | 'merchant' | 'guard' | 'fisherman' | 'farmer' | 'elder';
  x: number;
  y: number;
  greeting: string;
  dialogues: string[];
  spriteKey: string;
}

export class SchoolScene extends Phaser.Scene {
  private player: Player | null = null;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private networkManager: NetworkManager;
  private currentAvatar: IAvatarCustomization;
  private playerName: string = 'Petualang';
  private schoolType: SchoolType = 'sd';
  private grade: number = 1;
  private returnPos = { x: 4800, y: 4800 };
  private fromDoor: boolean = false;

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  // Dimensi Ruangan Sekolah: Dapat disesuaikan dinamis via Panel Arsitek Tahta Raden
  public roomWidth: number = 2160;
  public roomHeight: number = 1440;
  public readonly tileSize: number = 120;
  private customArchitectPropsGroup: (Phaser.GameObjects.Image | Phaser.GameObjects.GameObject)[] = [];
  private customArchitectTerrainsGroup: Phaser.GameObjects.Graphics[] = [];
  private customArchitectTerrainObstacles: Phaser.GameObjects.GameObject[] = [];

  // Zona Interaktif
  private exitDoorZone = { x: 1080, y: 1370 };
  private whiteboardZone = { x: 1080, y: 220 };
  private teacherDeskZone = { x: 1080, y: 380 };
  private bookshelfZone = { x: 2060, y: 660 };
  private madingZone = { x: 70, y: 660 };
  private studentDeskPositions: { x: number; y: number }[] = [];

  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private lastPosSaveTime: number = 0;
  private lastGridX: number = -1;
  private lastGridY: number = -1;
  private isTransitioning: boolean = false;
  private targetZoom: number = 0.95;

  private npcs: ISchoolNpc[] = [];
  private headerBannerText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'SchoolScene' });
    this.networkManager = NetworkManager.getInstance();
    this.currentAvatar = {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  }

  public init(data?: ISchoolInitData): void {
    this.isTransitioning = false;
    this.player = null as any;
    this.remotePlayers.clear();
    this.fromDoor = Boolean(data?.fromDoor);

    if (data?.schoolType) {
      this.schoolType = data.schoolType;
    }

    if (typeof data?.grade === 'number' && data.grade >= 1) {
      this.grade = data.grade;
    } else {
      try {
        const saved = localStorage.getItem(`raden_school_${this.schoolType}_grade`);
        this.grade = saved ? parseInt(saved, 10) : 1;
      } catch (e) {
        this.grade = 1;
      }
    }

    if (data?.name) {
      this.playerName = data.name;
    } else {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name) this.playerName = u.name;
      } catch (e) {}
    }

    if (data?.avatar) {
      this.currentAvatar = data.avatar;
    } else {
      try {
        const a = localStorage.getItem('raden_player_avatar');
        if (a) this.currentAvatar = JSON.parse(a);
      } catch (e) {}
    }

    if (data?.returnX && data?.returnY) {
      this.returnPos = { x: data.returnX, y: data.returnY };
    } else {
      if (this.schoolType === 'sd') this.returnPos = { x: 50 * 120 + 60, y: 64 * 120 + 60 };
      else if (this.schoolType === 'smp') this.returnPos = { x: 58 * 120 + 60, y: 64 * 120 + 60 };
      else this.returnPos = { x: 66 * 120 + 60, y: 64 * 120 + 60 };
    }

    // Muat konfigurasi dimensi sekolah kustom dari Studio Arsitek Tahta Raden
    try {
      const saved = localStorage.getItem('raden_architect_school');
      if (saved) {
        const cfg = JSON.parse(saved);
        if (cfg.gridWidth && cfg.gridHeight) {
          this.roomWidth = cfg.gridWidth * this.tileSize;
          this.roomHeight = cfg.gridHeight * this.tileSize;
        }
      }
    } catch (e) {}

    this.setupSchoolNpcs();
  }

  private setupSchoolNpcs(): void {
    if (this.schoolType === 'sd') {
      this.npcs = [
        {
          id: 'npc_guru_sd',
          name: 'Bu Guru Endang',
          role: 'Wali Kelas SD Teladan',
          avatarUrl: '/assets/sprites/NPC/1x2%20NPC%20GuruSD.png',
          avatarType: 'sage',
          x: 760,
          y: 380,
          greeting: 'Selamat pagi! Belajar yang rajin dan jangan lupa cuci tangan ya!',
          dialogues: [
            'Selamat pagi anak pintar! Selamat datang di Sekolah Dasar (SD) RadenWorld!',
            'Di sini adik-adik belajar berhitung, membaca, budi pekerti, dan bermain dengan gembira bersama teman.',
            'Ingat pesan Ibu: rajin pangkal pandai, hemat pangkal kaya! Selalu hormati orang tua dan bapak ibu guru ya.'
          ],
          spriteKey: 'npc-guru-sd',
        },
        {
          id: 'npc_siswa_sd',
          name: 'Budi Kecil',
          role: 'Murid Berprestasi SD (Merah Putih)',
          avatarUrl: '/assets/sprites/NPC/1x2%20NPC%20GuruSD.png',
          avatarType: 'sage',
          x: 660,
          y: 660,
          greeting: 'Halo Kak! Kakak mau ikut membaca buku di Pojok Baca?',
          dialogues: [
            'Halo Kakak! Aku lagi mengerjakan PR Matematika dan IPA bareng teman-teman di meja belajar.',
            'Nanti pas istirahat jam 10 aku mau jajan mie ayam dan es jeruk di luar gerbang sekolah!',
            'Kakak hebat sekali bisa menjelajah seluruh dunia RadenWorld!'
          ],
          spriteKey: 'npc-guru-sd',
        },
      ];
    } else if (this.schoolType === 'smp') {
      this.npcs = [
        {
          id: 'npc_guru_smp',
          name: 'Pak Guru Haryanto',
          role: 'Guru IPA & Pembina OSIS SMP',
          avatarUrl: '/assets/sprites/NPC/1x2%20NPC%20GuruSMP.png',
          avatarType: 'sage',
          x: 760,
          y: 380,
          greeting: 'Selamat datang di SMP! Persiapkan dirimu untuk eksplorasi sains & organisasi!',
          dialogues: [
            'Salam sejahtera! Selamat datang di Gedung Sekolah Menengah Pertama (SMP) RadenWorld.',
            'Masa SMP adalah masa pembentukan karakter dan eksplorasi minat bakat dalam sains, teknologi, dan seni.',
            'Gunakan waktu mudamu sebaik mungkin untuk berorganisasi dan mengasah keterampilan berpikir kritis!'
          ],
          spriteKey: 'npc-guru-smp',
        },
        {
          id: 'npc_siswa_smp',
          name: 'Siti Rahma',
          role: 'Juara Olimpiade Sains SMP (Biru Putih)',
          avatarUrl: '/assets/sprites/NPC/1x2%20NPC%20GuruSMP.png',
          avatarType: 'sage',
          x: 660,
          y: 660,
          greeting: 'Hai! Kami baru saja menyelesaikan praktikum mikroskop di ruang kelas.',
          dialogues: [
            'Hai teman! Selamat datang di kelas SMP RadenWorld.',
            'Papan tulis hari ini berisi materi persamaan linier dan rumus gaya gravitasi Newton.',
            'Kalau ada soal fisika yang sulit, ayo kita diskusikan bersama di meja belajar!'
          ],
          spriteKey: 'npc-guru-smp',
        },
      ];
    } else {
      this.npcs = [
        {
          id: 'npc_kepsek_sma',
          name: 'Ibu Dra. Ratna Dewi',
          role: 'Kepala Sekolah SMA Kebangsaan',
          avatarUrl: '/assets/sprites/NPC/1x2%20NPC%20GuruSMA.png',
          avatarType: 'sage',
          x: 760,
          y: 380,
          greeting: 'Selamat datang para calon pemimpin masa depan di SMA RadenWorld.',
          dialogues: [
            'Selamat datang di Sekolah Menengah Atas (SMA) RadenWorld, gerbang menuju perguruan tinggi dan kepemimpinan global.',
            'Di bangku SMA ini, integritas, kedisiplinan, dan visi masa depan adalah pilar utama yang terus kita tempa.',
            'Raihlah cita-citamu setinggi langit. Semesta akan membukakan jalan bagi mereka yang berikhtiar sungguh-sungguh.'
          ],
          spriteKey: 'npc-guru-sma',
        },
        {
          id: 'npc_siswa_sma',
          name: 'Dimas Alamsyah',
          role: 'Ketua OSIS SMA (Abu-Abu Putih)',
          avatarUrl: '/assets/sprites/NPC/1x2%20NPC%20GuruSMA.png',
          avatarType: 'sage',
          x: 660,
          y: 660,
          greeting: 'Halo bro! Kami lagi diskusi kelompok persiapan tryout ujian kelulusan.',
          dialogues: [
            'Halo kawan! Waktu di SMA berlalu begitu cepat. Sekarang kami sudah di tahun terakhir persiapan seleksi perguruan tinggi.',
            'Selain belajar intensif, kami juga aktif di kegiatan ekstrakurikuler kepemimpinan dan pengabdian masyarakat.',
            'Tetap semangat dan pantang menyerah menggapai kampus impian ya kawan!'
          ],
          spriteKey: 'npc-guru-sma',
        },
      ];
    }
  }

  public create(): void {
    // 1. Batas fisika ruangan sekolah
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.obstacles = this.physics.add.staticGroup();

    // 2. Buat tekstur khusus interior kelas modern Indonesia
    this.createClassroomTextures();

    // 3. Render Interior Gedung Sekolah dengan Ubin Sesuai Hex Gedung
    this.createSchoolInterior();

    // 4. Render NPC Interaktif
    this.createSchoolNpcs();

    // 5. Tentukan Posisi Spawn Pemain
    let spawnX = 1080;
    let spawnY = 1240;

    // Jika masuk dari pintu Open World, spawn tepat di depan pintu masuk sekolah
    if (this.fromDoor) {
      spawnX = 1080;
      spawnY = 1240;
    } else {
      // Jika refresh halaman browser: pulihkan posisi tersimpan di kelas
      try {
        const savedPos = localStorage.getItem(`raden_pos_school_${this.schoolType}`);
        if (savedPos) {
          const p = JSON.parse(savedPos);
          if (
            typeof p.x === 'number' &&
            typeof p.y === 'number' &&
            p.x > 140 &&
            p.x < this.roomWidth - 140 &&
            p.y > 140 &&
            p.y < this.roomHeight - 140
          ) {
            spawnX = p.x;
            spawnY = p.y;
          }
        }
      } catch (e) {}
    }

    // 6. Spawn Karakter Pemain
    this.spawnPlayerInSchool(spawnX, spawnY);

    if (this.player) {
      this.physics.add.collider(this.player, this.obstacles);
    }

    // 7. Hubungkan Sinkronisasi Jaringan WebSocket SEBELUM room switch / join
    this.setupMultiplayerListeners();

    // 8. Berpindah ke room kelas sekolah pada WebSocket server (atau join jika refresh mandiri)
    // Logika Room: pemain di kelas berbeda (misal SD 1 vs SD 2) berada di room berbeda dan tidak saling bertemu
    const schoolRoom = this.getSchoolRoomId();
    if (!this.networkManager.getConnected()) {
      this.networkManager.connect();
      const isSuperAdmin = this.playerName.toUpperCase() === 'RADEN';
      let savedGold = isSuperAdmin ? 999999 : 2500;
      let savedDiamonds = isSuperAdmin ? 99999 : 50;
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
        schoolRoom
      );
    } else {
      this.networkManager.switchRoom(schoolRoom, spawnX, spawnY);
    }

    // Minta ulang snapshot seluruh pemain di ruangan sekolah ini untuk kepastian 100%
    this.time.delayedCall(150, () => this.networkManager.requestRoomPlayers());
    this.time.delayedCall(500, () => this.networkManager.requestRoomPlayers());
    this.time.delayedCall(1200, () => this.networkManager.requestRoomPlayers());

    // 9. Hubungkan EventBus dari React UI
    const onJoinGame = (userData: { name: string; avatar: IAvatarCustomization }) => {
      if (userData?.name) this.playerName = userData.name;
      if (userData?.avatar) this.currentAvatar = userData.avatar;
      if (this.player) {
        this.player.setAvatar(this.currentAvatar);
        if (userData?.name) {
          this.player.setEntityName(userData.name);
        }
      }
    };
    EventBus.on('join-game', onJoinGame);

    const onSendChat = (text: string) => {
      if (this.player && this.player.active && this.player.scene) {
        this.player.showSpeechBubble(text);
      }
      this.networkManager.sendChat(text, this.playerName);
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

    // Tangani pembaruan denah kelas langsung dari Studio Arsitek Tahta Raden
    const onArchitectConfigUpdated = (data: { mapType: string; config: any }) => {
      if (data && data.mapType === 'school' && data.config) {
        if (data.config.gridWidth && data.config.gridHeight) {
          this.roomWidth = data.config.gridWidth * this.tileSize;
          this.roomHeight = data.config.gridHeight * this.tileSize;
          this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
          this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
        }
        this.customArchitectPropsGroup.forEach((obj) => {
          if (obj && (obj as any).destroy) (obj as any).destroy();
        });
        this.customArchitectPropsGroup = [];
        this.spawnArchitectCustomProps();
      }
    };
    EventBus.on('architect-config-updated', onArchitectConfigUpdated);

    // Tangani pergantian kelas di dalam ruangan (misal dari modal mapel) secara realtime
    const onGradeSwitched = (data: { schoolType: SchoolType; grade: number }) => {
      if (!data || data.schoolType !== this.schoolType) return;
      if (data.grade === this.grade) return;

      console.log(`[SchoolScene] Berpindah kelas dari ${this.grade} ke ${data.grade}`);
      this.grade = data.grade;

      // 1. Bersihkan seluruh remote player dari kelas sebelumnya
      this.remotePlayers.forEach((rp) => rp.destroy());
      this.remotePlayers.clear();

      // 2. Berpindah ke WebSocket room kelas baru (school-{type}-grade-{grade})
      const newRoom = this.getSchoolRoomId();
      if (this.player && this.player.active) {
        this.networkManager.switchRoom(newRoom, this.player.x, this.player.y);
        this.player.showSpeechBubble(`Pindah ke ${this.getSchoolDisplayName()}! 📚`);
      }

      // 3. Perbarui teks spanduk sekolah di atas papan tulis
      if (this.headerBannerText) {
        this.headerBannerText.setText(this.getSchoolHeaderTitle());
      }

      // 4. Perbarui lokasi di HUD
      EventBus.emit('location-updated', this.getSchoolDisplayName());

      // 5. Minta daftar pemain yang ada di kelas baru
      this.time.delayedCall(200, () => this.networkManager.requestRoomPlayers());
      this.time.delayedCall(600, () => this.networkManager.requestRoomPlayers());
    };
    EventBus.on('school-grade-switched', onGradeSwitched);

    // Keyboard 'E' untuk interaksi
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    // Tap / Klik lantai ruangan untuk navigasi
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (pointer.rightButtonDown()) return;
      if (this.player?.isMovementLocked()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;

      if (!this.isLocationWalkable(wx, wy)) {
        this.spawnBlockedFeedback(wx, wy);
        SoundManager.getInstance().playError();
        if (this.player && this.player.active) {
          this.player.showSpeechBubble('🚫 Lokasi terhalang & tidak bisa dijangkau!', 1300);
        }
        return;
      }

      if (this.player && this.player.active) {
        this.spawnTapRipple(wx, wy);
        this.player.navigateTo(wx, wy);
      }
    });

    // Setup kamera
    this.setupCameraZoomControls(0.95);

    // Kirim notifikasi lokasi awal ke HUD
    const schoolLabel = this.getSchoolDisplayName();
    EventBus.emit('location-updated', schoolLabel);

    // Cleanup saat shutdown / destroy
    const cleanupScene = () => {
      this.cameras?.main?.stopFollow();
      this.remotePlayers.forEach((rp) => {
        if (rp && rp.active) rp.destroy();
      });
      this.remotePlayers.clear();
      EventBus.off('join-game', onJoinGame);
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.off('trigger-interaction', onTriggerInteraction);
      EventBus.off('architect-config-updated', onArchitectConfigUpdated);
      EventBus.off('school-grade-switched', onGradeSwitched);
      EventBus.emit('interaction-prompt', null);
      if (this.player) {
        this.player.destroy();
        this.player = null as any;
      }
    };

    this.events.on('shutdown', cleanupScene);
    this.events.on('destroy', cleanupScene);
  }

  private setupMultiplayerListeners(): void {
    this.networkManager.onWorldInit((data) => {
      if (data && data.players) {
        data.players.forEach((p) => {
          if (p.id !== this.networkManager.getSocketId() && p.name?.toLowerCase() !== this.playerName.toLowerCase()) {
            this.addRemotePlayer(p);
          }
        });
      }
    });

    this.networkManager.onPlayerJoined((p) => {
      if (p.id !== this.networkManager.getSocketId() && p.name?.toLowerCase() !== this.playerName.toLowerCase()) {
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

  private addGridObstacle(gx: number, gy: number, gw: number, gh: number): Phaser.GameObjects.Zone {
    const x = gx * this.tileSize;
    const y = gy * this.tileSize;
    const w = gw * this.tileSize;
    const h = gh * this.tileSize;

    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0);
    this.physics.add.existing(zone, true);
    if (this.obstacles) {
      this.obstacles.add(zone);
    }
    return zone;
  }

  private addRemotePlayer(p: IPlayerData): void {
    if (!p || !p.name) return;

    // Bersihkan duplicate jika ada remote player lama dengan ID sama atau nama sama
    for (const [existingId, existingRemote] of this.remotePlayers.entries()) {
      if (existingId === p.id || existingRemote.getEntityName().trim().toLowerCase() === p.name.trim().toLowerCase()) {
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

      remote.makeClickable(() => {
        EventBus.emit('inspect-player-profile', {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          level: (p as any).level || 1,
          role: p.role || 'player',
          isSuperAdmin: p.isSuperAdmin,
          gold: typeof p.gold === 'number' ? p.gold : 2500,
          diamonds: typeof p.diamonds === 'number' ? p.diamonds : 50,
        });
      });

      if ((p as any).isAfk) {
        remote.setAfk(true, (p as any).durationSeconds || 60);
      }

      this.remotePlayers.set(p.id, remote);
    } catch (err) {
      console.warn('[SchoolScene] Gagal menambahkan remote player:', err);
    }
  }

  public getSchoolRoomId(): string {
    return `school-${this.schoolType}-grade-${this.grade}`;
  }

  private getSchoolDisplayName(): string {
    if (this.schoolType === 'sd') return `RUANG KELAS ${this.grade} SD RADENWORLD`;
    if (this.schoolType === 'smp') return `RUANG KELAS ${this.grade} SMP (KELAS ${this.grade + 6}) RADENWORLD`;
    return `RUANG KELAS ${this.grade} SMA (KELAS ${this.grade + 9}) RADENWORLD`;
  }

  private getSchoolHeaderTitle(): string {
    if (this.schoolType === 'sd') {
      const fase = this.grade <= 2 ? 'A' : this.grade <= 4 ? 'B' : 'C';
      return `🏫 RUANG KELAS ${this.grade} SD (FASE ${fase}) RADENWORLD`;
    }
    if (this.schoolType === 'smp') {
      return `🏫 RUANG KELAS ${this.grade} SMP (KELAS ${this.grade + 6} - FASE D) RADENWORLD`;
    }
    const faseSma = this.grade === 1 ? 'E' : 'F';
    return `🏫 RUANG KELAS ${this.grade} SMA (KELAS ${this.grade + 9} - FASE ${faseSma}) RADENWORLD`;
  }

  private getCheckerTextureKey(): string {
    if (this.schoolType === 'sd') return 'sd-checker-tile';
    if (this.schoolType === 'smp') return 'smp-checker-tile';
    return 'sma-checker-tile';
  }

  /**
   * Menghasilkan tekstur procedural aset ruang kelas standar Indonesia berkualitas tinggi
   */
  private createClassroomTextures(): void {
    // 1. Meja Siswa Kayu Jati (Single / Dual Student Desk: 100 x 70 px)
    if (!this.textures.exists('school-student-desk')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Bayangan meja
      g.fillStyle(0x0a0f1d, 0.45);
      g.fillRoundedRect(4, 52, 92, 16, 6);
      // Kaki meja kayu/besi kokoh
      g.fillStyle(0x1e293b, 1);
      g.fillRect(10, 40, 8, 22);
      g.fillRect(82, 40, 8, 22);
      // Kompartemen laci buku di bawah meja
      g.fillStyle(0x451a03, 1);
      g.fillRect(12, 28, 76, 16);
      // Buku catatan di dalam laci
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(18, 32, 28, 8);
      g.fillStyle(0xf43f5e, 1);
      g.fillRect(52, 33, 24, 7);
      // Permukaan daun meja kayu jati utama
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(4, 4, 92, 28, 6);
      g.fillStyle(0xb45309, 1);
      g.fillRoundedRect(6, 6, 88, 24, 4);
      // Serat kayu jati halus
      g.lineStyle(1, 0xd97706, 0.4);
      g.lineBetween(12, 12, 84, 12);
      g.lineBetween(14, 20, 82, 20);
      // Kotak pensil / penggaris di atas meja
      g.fillStyle(0x10b981, 1);
      g.fillRoundedRect(64, 8, 20, 6, 2);
      g.generateTexture('school-student-desk', 100, 72);
      g.destroy();
    }

    // 2. Kursi Siswa Kayu Jati (Student Chair: 70 x 70 px)
    if (!this.textures.exists('school-student-chair')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Bayangan kursi
      g.fillStyle(0x0a0f1d, 0.35);
      g.fillRoundedRect(6, 52, 58, 14, 6);
      // Kaki kursi
      g.fillStyle(0x1e293b, 1);
      g.fillRect(12, 40, 6, 20);
      g.fillRect(52, 40, 6, 20);
      // Dudukan kursi kayu
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(10, 26, 50, 18, 5);
      g.fillStyle(0xb45309, 1);
      g.fillRoundedRect(12, 28, 46, 14, 3);
      // Sandaran punggung kursi melengkung
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(14, 6, 42, 14, 4);
      g.fillStyle(0x92400e, 1);
      g.fillRect(20, 18, 5, 10);
      g.fillRect(33, 18, 4, 10);
      g.fillRect(45, 18, 5, 10);
      g.generateTexture('school-student-chair', 70, 70);
      g.destroy();
    }

    // 3. Meja Guru Besar Kayu Eksekutif (150 x 85 px)
    if (!this.textures.exists('school-teacher-desk')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Bayangan
      g.fillStyle(0x0a0f1d, 0.5);
      g.fillRoundedRect(6, 64, 138, 18, 6);
      // Panel bodi meja guru & laci berkas
      g.fillStyle(0x451a03, 1);
      g.fillRect(12, 32, 126, 40);
      // Laci kanan bertingkat dengan gagang emas
      g.fillStyle(0x78350f, 1);
      g.fillRect(96, 36, 38, 16);
      g.fillRect(96, 54, 38, 16);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(112, 43, 6, 3);
      g.fillRect(112, 61, 6, 3);
      // Daun meja atas mewah
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(4, 6, 142, 30, 6);
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(6, 8, 138, 26, 4);
      // Karpet hijau alas meja kerja guru (Desk Mat)
      g.fillStyle(0x065f46, 1);
      g.fillRoundedRect(45, 11, 60, 20, 3);
      // Tumpukan buku tugas / rapor murid
      g.fillStyle(0xffffff, 1);
      g.fillRect(16, 12, 22, 16);
      g.fillStyle(0xef4444, 1);
      g.fillRect(18, 14, 18, 4);
      // Wadah pulpen & penggaris
      g.fillStyle(0x0284c7, 1);
      g.fillRect(115, 13, 10, 14);
      // Lonceng meja guru emas
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(38, 18, 4);
      g.generateTexture('school-teacher-desk', 150, 85);
      g.destroy();
    }

    // 4. Kursi Guru Empuk (75 x 85 px)
    if (!this.textures.exists('school-teacher-chair')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0a0f1d, 0.4);
      g.fillRoundedRect(8, 66, 60, 14, 5);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(16, 50, 7, 22);
      g.fillRect(52, 50, 7, 22);
      // Bantalan duduk maroon empuk
      g.fillStyle(0x831843, 1);
      g.fillRoundedRect(12, 34, 52, 22, 6);
      // Sandaran punggung tinggi eksekutif
      g.fillStyle(0x500724, 1);
      g.fillRoundedRect(14, 6, 48, 30, 8);
      g.lineStyle(2, 0xd97706, 0.8);
      g.strokeRoundedRect(14, 6, 48, 30, 8);
      g.generateTexture('school-teacher-chair', 75, 85);
      g.destroy();
    }

    // 5. Lambang Garuda Pancasila & Bingkai Foto Presiden/Wapres RI (320 x 80 px)
    if (!this.textures.exists('school-garuda-presiden')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Bingkai Foto Presiden RI (Kiri)
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(10, 10, 56, 64, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRect(14, 14, 48, 56);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(38, 34, 12);
      g.fillRect(24, 46, 28, 20);
      g.fillStyle(0xd70d0d, 1);
      g.fillRect(26, 48, 8, 18); // Selempang Merah Putih
      g.lineStyle(2, 0xf59e0b, 1);
      g.strokeRoundedRect(10, 10, 56, 64, 4);

      // Lambang Garuda Pancasila Emas Megah (Tengah)
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(120, 6, 80, 72, 6);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(124, 10, 72, 64);
      // Sayap & Tubuh Garuda Emas
      g.fillStyle(0xf59e0b, 1);
      g.fillTriangle(160, 14, 132, 42, 188, 42);
      g.fillTriangle(160, 36, 140, 64, 180, 64);
      // Perisai Pancasila di dada Garuda (Merah, Putih, Hitam)
      g.fillStyle(0xd70d0d, 1);
      g.fillRect(152, 34, 8, 12);
      g.fillStyle(0xffffff, 1);
      g.fillRect(160, 34, 8, 12);
      // Pita Bhinneka Tunggal Ika di cakar
      g.fillStyle(0xfefefe, 1);
      g.fillRect(142, 62, 36, 6);
      g.lineStyle(3, 0xf59e0b, 1);
      g.strokeRoundedRect(120, 6, 80, 72, 6);

      // Bingkai Foto Wakil Presiden RI (Kanan)
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(254, 10, 56, 64, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRect(258, 14, 48, 56);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(282, 34, 12);
      g.fillRect(268, 46, 28, 20);
      g.fillStyle(0xd70d0d, 1);
      g.fillRect(270, 48, 8, 18);
      g.lineStyle(2, 0xf59e0b, 1);
      g.strokeRoundedRect(254, 10, 56, 64, 4);

      g.generateTexture('school-garuda-presiden', 320, 80);
      g.destroy();
    }

    // 6. Tiang Bendera Merah Putih di Sudut Depan (60 x 140 px)
    if (!this.textures.exists('school-flag')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Dudukan tiang kayu bundar
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(14, 122, 32, 14, 4);
      // Batang tiang kayu jati
      g.fillStyle(0xb45309, 1);
      g.fillRect(28, 10, 5, 114);
      // Ujung tombak emas atas
      g.fillStyle(0xf59e0b, 1);
      g.fillTriangle(30, 4, 25, 14, 36, 14);
      // Kain Bendera Merah Putih berkibar
      g.fillStyle(0xd70d0d, 1);
      g.fillRoundedRect(33, 14, 25, 20, 2); // Merah
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(33, 34, 25, 20, 2); // Putih
      g.lineStyle(1.5, 0x0a0f1d, 0.4);
      g.strokeRect(33, 14, 25, 40);
      g.generateTexture('school-flag', 60, 140);
      g.destroy();
    }

    // 7. Jam Dinding Sekolah Bulat (50 x 50 px)
    if (!this.textures.exists('school-clock')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillCircle(25, 25, 24);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(25, 25, 20);
      // Titik jarum jam dan jarum menunjuk 08:30 WIB
      g.fillStyle(0x0a0f1d, 1);
      g.fillCircle(25, 25, 3);
      g.lineStyle(2, 0x0a0f1d, 1);
      g.lineBetween(25, 25, 16, 20); // Jam
      g.lineBetween(25, 25, 25, 38); // Menit
      g.lineStyle(1, 0xef4444, 1);
      g.lineBetween(25, 25, 36, 22); // Detik
      g.generateTexture('school-clock', 50, 50);
      g.destroy();
    }

    // 8. Jendela Kelas Besar dengan Kisi Kaca & Tirai Rapih (80 x 180 px)
    if (!this.textures.exists('school-window')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kusen kayu jendela
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(4, 4, 72, 172, 6);
      // Kaca langit biru luar ruangan
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(10, 10, 60, 160);
      // Efek kilau cahaya matahari luar
      g.fillStyle(0xffffff, 0.45);
      g.fillTriangle(10, 10, 50, 10, 10, 80);
      // Dedaunan pohon hijau di luar jendela
      g.fillStyle(0x22c55e, 0.85);
      g.fillCircle(24, 140, 18);
      g.fillCircle(54, 148, 16);
      // Kisi-kisi jendela
      g.lineStyle(4, 0x78350f, 1);
      g.lineBetween(40, 10, 40, 170);
      g.lineBetween(10, 65, 70, 65);
      g.lineBetween(10, 115, 70, 115);
      // Tirai kelas samping rapih
      g.fillStyle(0xfbcfe8, 0.9);
      g.fillRect(8, 10, 12, 160);
      g.fillRect(60, 10, 12, 160);
      g.fillStyle(0xf43f5e, 1);
      g.fillRect(8, 85, 14, 6);
      g.fillRect(58, 85, 14, 6);
      g.generateTexture('school-window', 80, 180);
      g.destroy();
    }

    // 9. Rak Buku Pojok Baca Kelas (120 x 200 px)
    if (!this.textures.exists('school-bookshelf')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Bodi lemari buku kayu jati
      g.fillStyle(0x451a03, 1);
      g.fillRoundedRect(4, 4, 112, 192, 8);
      g.fillStyle(0x78350f, 1);
      g.fillRect(10, 10, 100, 180);
      // 4 Sekat ambalan rak
      const shelfYs = [55, 100, 145];
      shelfYs.forEach(sy => {
        g.fillStyle(0x451a03, 1);
        g.fillRect(8, sy, 104, 8);
      });
      // Rak 1 (Atas): Globe dunia & piala prestasi
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(35, 34, 12);
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(33, 33, 6);
      g.fillStyle(0xf59e0b, 1);
      g.fillTriangle(80, 16, 72, 38, 88, 38);
      // Rak 2: Buku ensiklopedia tebal warna-warni
      const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899];
      bookColors.forEach((col, i) => {
        g.fillStyle(col, 1);
        g.fillRect(14 + i * 13, 65, 11, 33);
      });
      // Rak 3: Buku kamus & atlas bertumpuk
      bookColors.slice(0, 5).reverse().forEach((col, i) => {
        g.fillStyle(col, 1);
        g.fillRect(14 + i * 16, 110, 13, 33);
      });
      // Rak 4: Buku modul pelajaran sekolah
      bookColors.slice(2, 7).forEach((col, i) => {
        g.fillStyle(col, 1);
        g.fillRect(16 + i * 15, 155, 12, 33);
      });
      g.generateTexture('school-bookshelf', 120, 200);
      g.destroy();
    }

    // 10. Majalah Dinding (Mading Kelas: 180 x 110 px)
    if (!this.textures.exists('school-mading')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Bingkai kayu mading
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(4, 4, 172, 102, 6);
      // Papan gabus cokelat terang (corkboard)
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(8, 8, 164, 94, 4);
      // Banner judul mading
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(14, 12, 152, 18, 3);
      // Kertas catatan jadwal piket kelas
      g.fillStyle(0xffffff, 1);
      g.fillRect(16, 36, 42, 56);
      g.fillStyle(0xef4444, 1);
      g.fillRect(18, 40, 38, 6);
      // Karya gambar puisi siswa (kuning & biru)
      g.fillStyle(0xfef08a, 1);
      g.fillRect(66, 36, 48, 56);
      g.fillStyle(0xbae6fd, 1);
      g.fillRect(120, 36, 42, 56);
      // Paku payung warna-warni (pushpins)
      g.fillStyle(0xef4444, 1);
      g.fillCircle(37, 36, 3);
      g.fillStyle(0x3b82f6, 1);
      g.fillCircle(90, 36, 3);
      g.fillStyle(0x10b981, 1);
      g.fillCircle(141, 36, 3);
      g.generateTexture('school-mading', 180, 110);
      g.destroy();
    }

    // 11. Rak Sudut Kebersihan Kelas (Sapu, Pengki, Kemoceng: 70 x 130 px)
    if (!this.textures.exists('school-cleaning-rack')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Papan gantungan di dinding
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(8, 10, 54, 14, 4);
      // Sapu Ijuk (Gagang bambu & serabut hitam)
      g.fillStyle(0xd97706, 1);
      g.fillRect(18, 18, 4, 75);
      g.fillStyle(0x1e293b, 1);
      g.fillTriangle(20, 85, 10, 120, 30, 120);
      // Pengki Plastik Oranye
      g.fillStyle(0xf97316, 1);
      g.fillRect(36, 18, 4, 60);
      g.fillRoundedRect(28, 76, 20, 22, 3);
      // Kemoceng Bulu Ayam
      g.fillStyle(0x92400e, 1);
      g.fillRect(52, 18, 3, 50);
      g.fillStyle(0xca8a04, 1);
      g.fillCircle(53, 76, 9);
      g.fillCircle(53, 86, 10);
      g.generateTexture('school-cleaning-rack', 70, 130);
      g.destroy();
    }

    // 12. Peta Kepulauan Indonesia / NKRI (200 x 90 px)
    if (!this.textures.exists('school-map-indonesia')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(4, 4, 192, 82, 6);
      // Samudra biru
      g.fillStyle(0x0284c7, 1);
      g.fillRect(8, 8, 184, 74);
      // Pulau-pulau hijau zamrud (Sumatera, Jawa, Kalimantan, Sulawesi, Papua)
      g.fillStyle(0x16a34a, 1);
      // Sumatera
      g.fillTriangle(20, 50, 42, 28, 46, 56);
      // Jawa
      g.fillRect(44, 62, 46, 7);
      // Kalimantan
      g.fillCircle(72, 36, 14);
      // Sulawesi
      g.fillTriangle(102, 32, 96, 54, 114, 44);
      // Papua
      g.fillRoundedRect(140, 36, 36, 16, 6);
      // Maluku & Nusa Tenggara
      g.fillCircle(122, 44, 4);
      g.fillCircle(98, 64, 3);
      g.fillCircle(110, 64, 3);
      g.generateTexture('school-map-indonesia', 200, 90);
      g.destroy();
    }
  }

  private createSchoolInterior(): void {
    const g = this.add.graphics();
    const textureKey = this.getCheckerTextureKey();

    // 1. Lantai Ubin Catur Sekolah (120x120px) dengan Hex Akurat
    const floorTile = this.add.tileSprite(
      this.roomWidth / 2,
      this.roomHeight / 2,
      this.roomWidth,
      this.roomHeight,
      textureKey
    );
    floorTile.setDepth(-100);

    // 2. Dinding Luar Kokoh & Elegan
    g.fillStyle(0x0f172a, 1);
    g.fillRect(0, 0, this.roomWidth, 90); // Dinding Utara
    g.fillRect(0, 0, 90, this.roomHeight); // Dinding Barat
    g.fillRect(this.roomWidth - 90, 0, 90, this.roomHeight); // Dinding Timur
    g.fillRect(0, this.roomHeight - 80, this.roomWidth, 80); // Dinding Selatan

    // Lis Dinding Emas & Lis Kayu Skirting
    g.lineStyle(4, 0xf59e0b, 0.9);
    g.strokeRect(90, 90, this.roomWidth - 180, this.roomHeight - 170);

    // Rintangan batas fisik dinding
    this.addGridObstacle(0, 0, 18, 1); // Dinding utara
    this.addGridObstacle(0, 0, 1, 12);  // Dinding barat
    this.addGridObstacle(17, 0, 1, 12); // Dinding timur
    // Dinding selatan (pintu di tengah gx=8..9 terbuka)
    this.addGridObstacle(0, 11, 8, 1);
    this.addGridObstacle(10, 11, 8, 1);

    // 3. Spanduk Judul Sekolah di Dinding Atas
    g.fillStyle(0x1e293b, 0.95);
    g.fillRoundedRect(this.roomWidth / 2 - 400, 18, 800, 48, 12);
    g.lineStyle(2, 0x38bdf8, 0.9);
    g.strokeRoundedRect(this.roomWidth / 2 - 400, 18, 800, 48, 12);

    this.headerBannerText = this.add.text(this.roomWidth / 2, 42, this.getSchoolHeaderTitle(), {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '17px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 4. Lambang Garuda Pancasila, Presiden, Wapres & Jam Dinding di Atas Papan Tulis
    this.add.image(1080, 80, 'school-clock').setDepth(10);
    this.add.image(1080, 125, 'school-garuda-presiden').setDepth(10);

    // Tiang Bendera Merah Putih di Kiri Depan
    const flag = this.add.image(520, 200, 'school-flag');
    flag.setOrigin(0.5, 1.0);
    flag.setDepth(200);

    // Peta Kepulauan Indonesia di Kanan Depan
    const mapIndonesia = this.add.image(1640, 200, 'school-map-indonesia');
    mapIndonesia.setOrigin(0.5, 1.0);
    mapIndonesia.setDepth(200);

    // 5. Papan Tulis Besar di Dinding Depan (Whiteboard / Blackboard)
    const isDarkBoard = this.schoolType === 'sd';
    g.fillStyle(isDarkBoard ? 0x064e3b : 0xf8fafc, 1);
    g.fillRoundedRect(740, 155, 680, 130, 10);
    g.lineStyle(6, 0x78350f, 1);
    g.strokeRoundedRect(740, 155, 680, 130, 10);

    // Baki spidol / kapur tulis di bawah papan
    g.fillStyle(0x78350f, 1);
    g.fillRoundedRect(800, 282, 560, 8, 3);
    g.fillStyle(0x3b82f6, 1);
    g.fillRect(820, 280, 22, 5); // Spidol biru
    g.fillStyle(0xef4444, 1);
    g.fillRect(850, 280, 22, 5); // Spidol merah
    g.fillStyle(0x1e293b, 1);
    g.fillRect(920, 278, 28, 8); // Penghapus papan

    this.add.text(1080, 190, 'AGENDA PELAJARAN & MOTIVASI BELAJAR HARI INI', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: isDarkBoard ? '#a7f3d0' : '#1e293b',
      fontStyle: 'bold',
      stroke: isDarkBoard ? '#022c22' : '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const quoteText = this.schoolType === 'sd'
      ? '"Gantungkan cita-citamu setinggi bintang di angkasa!"'
      : this.schoolType === 'smp'
      ? '"Pendidikan adalah kunci pembuka pintu gerbang kebebasan dan peradaban."'
      : '"Berilmu amaliah, beramal ilmiah, dan berakhlak mulia kebangsaan."';

    this.add.text(1080, 225, quoteText, {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '12px',
      color: isDarkBoard ? '#fef08a' : '#0369a1',
      fontStyle: 'italic',
      stroke: isDarkBoard ? '#022c22' : '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // 6. Panggung Podium Guru di Depan Papan Tulis
    g.fillStyle(0x991b1b, 0.45);
    g.fillRoundedRect(860, 310, 440, 130, 14);
    g.lineStyle(2, 0xd97706, 0.85);
    g.strokeRoundedRect(860, 310, 440, 130, 14);

    // Kursi Guru di belakang meja guru
    const teacherChair = this.add.image(1080, 320, 'school-teacher-chair');
    teacherChair.setDisplaySize(75, 85);
    teacherChair.setDepth(320);

    // Meja Guru di depan kursi guru
    const teacherDesk = this.add.image(1080, 380, 'school-teacher-desk');
    teacherDesk.setDisplaySize(150, 85);
    teacherDesk.setDepth(380);
    teacherDesk.setInteractive({ useHandCursor: true });
    teacherDesk.on('pointerdown', () => {
      if (this.schoolType === 'sd') {
        EventBus.emit('open-sd-subjects', { deskType: 'guru' });
        this.player?.showSpeechBubble('Membuka kurikulum mata pelajaran SD di Meja Guru! 📚🎓');
      } else {
        this.player?.showSpeechBubble('Mengecek jadwal pelajaran & buku tugas siswa 📝');
      }
    });

    // Rintangan meja guru agar tidak tertembus
    this.addGridObstacle(8, 3, 2, 1);

    // 7. BARISAN MEJA & KURSI SISWA (Terpisah Grid Bersih, Bukan Bertumpuk 1 Grid)
    // 4 Kolom Meja Siswa dengan lorong tengah luas (central corridor)
    // Kolom 1 (gx = 3, x = 420), Kolom 2 (gx = 5, x = 660)
    // Lorong tengah (gx = 7, 8, 9, 10, x = 780..1380) bebas tanpa halangan
    // Kolom 3 (gx = 12, x = 1500), Kolom 4 (gx = 14, x = 1740)
    const studentDeskCols = [
      { gx: 3, x: 420 },
      { gx: 5, x: 660 },
      { gx: 12, x: 1500 },
      { gx: 14, x: 1740 }
    ];

    // 3 Baris Meja: Setiap meja di baris gy, dan kursi di baris gy + 1
    // Baris 1: Meja gy = 4 (y = 540), Kursi gy = 5 (y = 660)
    // Baris 2: Meja gy = 6 (y = 780), Kursi gy = 7 (y = 900)
    // Baris 3: Meja gy = 8 (y = 1020), Kursi gy = 9 (y = 1140)
    const deskRowDefs = [
      { deskGy: 4, deskY: 540, chairGy: 5, chairY: 660 },
      { deskGy: 6, deskY: 780, chairGy: 7, chairY: 900 },
      { deskGy: 8, deskY: 1020, chairGy: 9, chairY: 1140 }
    ];

    this.studentDeskPositions = [];

    deskRowDefs.forEach(row => {
      studentDeskCols.forEach(col => {
        // Catat koordinat posisi meja siswa untuk deteksi kedekatan interaksi
        this.studentDeskPositions.push({ x: col.x, y: row.deskY });

        // Kursi siswa di belakang meja (di baris grid sendiri)
        const chair = this.add.image(col.x, row.chairY, 'school-student-chair');
        chair.setDisplaySize(70, 70);
        chair.setOrigin(0.5, 0.85);
        chair.setDepth(row.chairY);

        // Meja siswa di depan kursi (di baris grid sendiri)
        const desk = this.add.image(col.x, row.deskY, 'school-student-desk');
        desk.setDisplaySize(100, 72);
        desk.setOrigin(0.5, 0.85);
        desk.setDepth(row.deskY);
        desk.setInteractive({ useHandCursor: true });
        desk.on('pointerdown', () => {
          if (this.schoolType === 'sd') {
            EventBus.emit('open-sd-subjects', { deskType: 'siswa' });
            this.player?.showSpeechBubble('Membuka buku mata pelajaran di Meja Siswa! 📝📖');
          } else {
            this.player?.showSpeechBubble('Duduk rapi di meja belajar untuk membaca buku 📖');
          }
        });

        // Hanya meja yang memiliki rintangan fisik (kursi bisa dilewati/diduduki)
        this.addGridObstacle(col.gx, row.deskGy, 1, 1);
      });
    });

    // 8. Fasilitas Dinding Samping Kiri & Kanan (Jendela, Mading, Rak Buku Pojok Baca)
    // Sisi Kiri: 2 Jendela Kelas & Mading Kelas di tengah
    const winL1 = this.add.image(45, 420, 'school-window');
    winL1.setDisplaySize(80, 180);
    winL1.setDepth(420);

    const mading = this.add.image(50, 660, 'school-mading');
    mading.setDisplaySize(180, 110);
    mading.setDepth(660);

    const winL2 = this.add.image(45, 900, 'school-window');
    winL2.setDisplaySize(80, 180);
    winL2.setDepth(900);

    // Sisi Kanan: 2 Jendela Kelas & Rak Buku Pojok Baca di tengah
    const winR1 = this.add.image(this.roomWidth - 45, 420, 'school-window');
    winR1.setDisplaySize(80, 180);
    winR1.setDepth(420);

    const bookshelf = this.add.image(this.roomWidth - 65, 660, 'school-bookshelf');
    bookshelf.setDisplaySize(120, 200);
    bookshelf.setDepth(660);

    const winR2 = this.add.image(this.roomWidth - 45, 900, 'school-window');
    winR2.setDisplaySize(80, 180);
    winR2.setDepth(900);

    // 9. Dinding Belakang: Sudut Kebersihan & Tempat Sampah Kelas
    const cleaningRack = this.add.image(940, 1360, 'school-cleaning-rack');
    cleaningRack.setDisplaySize(70, 130);
    cleaningRack.setDepth(1360);

    if (this.textures.exists('prop-tong-sampah')) {
      const trashCan = this.add.image(1220, 1360, 'prop-tong-sampah');
      trashCan.setDisplaySize(80, 140);
      trashCan.setDepth(1360);
    }

    // 10. Pintu Keluar ke Open World di Bagian Tengah Bawah
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(960, 1300, 240, 70, 8);
    g.lineStyle(3, 0xf59e0b, 1);
    g.strokeRoundedRect(960, 1300, 240, 70, 8);

    g.fillStyle(0x0284c7, 1);
    g.fillRect(990, 1350, 180, 45);

    this.add.text(1080, 1325, '🚪 PINTU KELUAR KE WORLD', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 3.5,
    }).setOrigin(0.5);

    // 11. Muat dan spawn seluruh prop kustom dari Studio Arsitek Tahta Raden
    this.spawnArchitectCustomProps();

    // 12. Muat dan spawn seluruh lapisan lantai / medan kustom
    this.spawnArchitectCustomTerrains();

    // 13. Sinkronisasi realtime jika konfigurasi diubah di Studio Arsitek Tahta Raden
    EventBus.on('architect-config-updated', (data: { mapType: string }) => {
      if (data?.mapType === 'school') {
        this.spawnArchitectCustomProps();
        this.spawnArchitectCustomTerrains();
      }
    });
  }

  /**
   * Menempatkan aset prop visual yang pas dan rata pada petak grid di sekolah
   */
  private addGridProp(
    key: string,
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    isObstacle: boolean = true
  ): Phaser.GameObjects.Image | null {
    if (!this.textures.exists(key)) return null;

    const pixelW = gw * this.tileSize;
    const pixelH = gh * this.tileSize;
    const centerX = gx * this.tileSize + pixelW / 2;
    const centerY = gy * this.tileSize + pixelH / 2;

    const img = this.add.image(centerX, centerY, key);
    img.setDisplaySize(pixelW, pixelH);
    img.setDepth((gy + gh) * this.tileSize);

    if (isObstacle) {
      this.addGridObstacle(gx, gy + gh - 1, gw, 1);
    }

    return img;
  }

  /**
   * Merender aset-aset kustom yang ditempatkan oleh pengguna melalui Studio Arsitek Tahta Raden
   */
  private spawnArchitectCustomProps(): void {
    try {
      this.customArchitectPropsGroup.forEach((p: any) => {
        if (p && p.active && typeof p.destroy === 'function') p.destroy();
      });
      this.customArchitectPropsGroup = [];

      const saved = localStorage.getItem('raden_architect_school');
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
      console.warn('[SchoolScene] Gagal memuat custom architect props:', e);
    }
  }

  /**
   * Merender lapisan lantai / medan kustom di sekolah
   */
  private spawnArchitectCustomTerrains(): void {
    try {
      this.customArchitectTerrainsGroup.forEach(g => {
        if (g && g.active && typeof g.destroy === 'function') g.destroy();
      });
      this.customArchitectTerrainsGroup = [];
      this.customArchitectTerrainObstacles.forEach(o => {
        if (o && o.active && typeof o.destroy === 'function') o.destroy();
      });
      this.customArchitectTerrainObstacles = [];

      const saved = localStorage.getItem('raden_architect_school');
      if (!saved) return;
      const cfg = JSON.parse(saved);
      if (!cfg.customTerrains || !Array.isArray(cfg.customTerrains)) return;

      const tg = this.add.graphics();
      tg.setDepth(-85);

      cfg.customTerrains.forEach((t: any) => {
        if (t.id && String(t.id).startsWith('def_')) return;
        const x = t.gx * this.tileSize;
        const y = t.gy * this.tileSize;
        const w = (t.gw || 1) * this.tileSize;
        const h = (t.gh || 1) * this.tileSize;

        if (t.type === 'wood') {
          tg.fillStyle(0x92400e, 0.95);
          tg.fillRect(x, y, w, h);
          tg.lineStyle(2, 0x78350f, 0.8);
          tg.strokeRect(x, y, w, h);
        } else if (t.type === 'plaza') {
          tg.fillStyle(0x334155, 0.95);
          tg.fillRect(x, y, w, h);
          tg.lineStyle(3, 0xf59e0b, 0.7);
          tg.strokeRect(x, y, w, h);
        } else if (t.type === 'dirt') {
          tg.fillStyle(0x78350f, 0.9);
          tg.fillRect(x, y, w, h);
        } else if (t.type === 'water') {
          tg.fillStyle(0x0284c7, 0.9);
          tg.fillRect(x, y, w, h);
          if (t.hasCollision !== false) {
            const obs = this.addGridObstacle(t.gx, t.gy, t.gw || 1, t.gh || 1);
            if (obs) this.customArchitectTerrainObstacles.push(obs);
          }
        }
      });

      this.customArchitectTerrainsGroup.push(tg);
    } catch (e) {
      console.warn('[SchoolScene] Gagal memuat custom architect terrains:', e);
    }
  }

  private createSchoolNpcs(): void {
    this.npcs.forEach(npc => {
      // Sprite NPC dengan proporsi 1x2 petak grid (1x lebar 120px, 2y tinggi 240px sesuai aset Figma 480x960px)
      const sprite = this.add.image(npc.x, npc.y, npc.spriteKey);
      sprite.setDisplaySize(120, 240);
      sprite.setOrigin(0.5, 0.5);
      sprite.setDepth(npc.y + 120);

      // Nameplate NPC di atas kepala karakter (tinggi karakter visual ~177px di dalam 1x2 tile)
      this.add.text(npc.x, npc.y - 105, npc.name, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '13px',
        color: '#fef08a',
        fontStyle: 'bold',
        stroke: '#0a0f1d',
        strokeThickness: 3.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npc.y + 121);

      this.add.text(npc.x, npc.y - 88, `[${npc.role}]`, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '10px',
        color: '#38bdf8',
        stroke: '#0a0f1d',
        strokeThickness: 2.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npc.y + 121);

      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        this.approachAndInteractWithNpc(npc);
      });
    });
  }

  private spawnPlayerInSchool(spawnX: number, spawnY: number): void {
    if (this.player) {
      this.cameras?.main?.stopFollow();
      this.player.destroy();
      this.player = null;
    }

    this.player = new Player(
      this,
      spawnX,
      spawnY,
      'school_player',
      this.playerName,
      this.currentAvatar,
      100,
      100
    );

    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.startFollow(this.player, true, 1.0, 1.0);
    this.smoothZoomTo(0.95);

    this.time.delayedCall(400, () => {
      this.player?.showSpeechBubble(`Selamat datang di ${this.getSchoolDisplayName()}!`);
    });
  }

  private setupCameraZoomControls(defaultZoom: number = 0.95): void {
    this.targetZoom = defaultZoom;
    this.cameras.main.setZoom(defaultZoom);
    this.cameras.main.setRoundPixels(true);

    const onWheel = (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
      const zoomFactor = deltaY > 0 ? 0.90 : 1.10;
      this.targetZoom = Phaser.Math.Clamp(this.targetZoom * zoomFactor, 0.6, 1.8);
    };
    this.input.on('wheel', onWheel);

    const handleZoomIn = () => {
      this.targetZoom = Phaser.Math.Clamp(this.targetZoom * 1.15, 0.6, 1.8);
    };
    const handleZoomOut = () => {
      this.targetZoom = Phaser.Math.Clamp(this.targetZoom * 0.85, 0.6, 1.8);
    };
    const handleZoomReset = () => {
      this.targetZoom = defaultZoom;
    };
    const handleZoomSet = (zoom: number) => {
      this.targetZoom = Phaser.Math.Clamp(zoom, 0.6, 1.8);
    };

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
    this.targetZoom = Phaser.Math.Clamp(newZoom, 0.6, 1.8);
  }

  private approachAndInteractWithNpc(npc: ISchoolNpc): void {
    if (!this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);

    if (dist <= 110) {
      this.interactWithNpc(npc);
    } else {
      this.player.showSpeechBubble(`Menuju ke ${npc.name}...`, 1200);
      const angle = Phaser.Math.Angle.Between(npc.x, npc.y, px, py);
      const targetX = Math.round(npc.x + Math.cos(angle) * 75);
      const targetY = Math.round(npc.y + Math.sin(angle) * 75);

      this.spawnTapRipple(targetX, targetY);
      this.player.navigateTo(targetX, targetY, () => {
        this.interactWithNpc(npc);
      });
    }
  }

  private interactWithNpc(npc: ISchoolNpc): void {
    EventBus.emit('open-dialogue', {
      id: npc.id,
      name: npc.name,
      role: npc.role,
      avatarType: npc.avatarType || 'sage',
      avatarUrl: npc.avatarUrl,
      dialogues: npc.dialogues && npc.dialogues.length > 0 ? npc.dialogues : [npc.greeting],
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

  public isLocationWalkable(wx: number, wy: number): boolean {
    if (wx < 100 || wx > this.roomWidth - 100 || wy < 100 || wy > this.roomHeight - 100) {
      return false;
    }
    if (this.obstacles) {
      const list = this.obstacles.getChildren();
      const margin = 18;
      for (let i = 0; i < list.length; i++) {
        const item = list[i] as any;
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
    return true;
  }

  private spawnBlockedFeedback(x: number, y: number): void {
    const gfx = this.add.graphics();
    gfx.setDepth(y + 999);
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

  public update(time: number, delta: number): void {
    // Zoom lerp ultra mulus 60 FPS
    if (Math.abs(this.cameras.main.zoom - this.targetZoom) > 0.001) {
      this.cameras.main.setZoom(
        Phaser.Math.Linear(this.cameras.main.zoom, this.targetZoom, Math.min(1, delta * 0.018))
      );
    }

    if (!this.player || this.isTransitioning) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y + 60);

    // Perbarui pergerakan dan kedalaman pemain lain di sekolah
    this.remotePlayers.forEach(p => {
      p.update(time, delta);
      p.setDepth(p.y + 60);
    });

    const px = this.player.x;
    const py = this.player.y;

    // Cek kedekatan pintu keluar & zona interaksi
    const distExit = Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y);
    const distBoard = Phaser.Math.Distance.Between(px, py, this.whiteboardZone.x, this.whiteboardZone.y);
    const distDesk = Phaser.Math.Distance.Between(px, py, this.teacherDeskZone.x, this.teacherDeskZone.y);
    const distBooks = Phaser.Math.Distance.Between(px, py, this.bookshelfZone.x, this.bookshelfZone.y);
    const distMading = Phaser.Math.Distance.Between(px, py, this.madingZone.x, this.madingZone.y);

    // Cek jarak ke meja belajar siswa terdekat
    let nearestStudentDeskDist = 9999;
    for (const dPos of this.studentDeskPositions) {
      const d = Phaser.Math.Distance.Between(px, py, dPos.x, dPos.y);
      if (d < nearestStudentDeskDist) {
        nearestStudentDeskDist = d;
      }
    }

    let prompt: string | null = null;

    if (distExit < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK KELUAR KE OPEN WORLD';
    } else if (distBoard < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMBACA PAPAN TULIS';
    } else if (distDesk < 120) {
      prompt = `TEKAN [E] / KLIK UNTUK BUKA MATA PELAJARAN KELAS ${this.grade} (MEJA GURU)`;
    } else if (nearestStudentDeskDist < 100) {
      prompt = `TEKAN [E] / KLIK UNTUK BELAJAR MATA PELAJARAN KELAS ${this.grade} (MEJA SISWA)`;
    } else if (distBooks < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMBACA BUKU DI POJOK BACA';
    } else if (distMading < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK MELIHAT MADING & JADWAL PIKET';
    } else {
      for (const npc of this.npcs) {
        if (Phaser.Math.Distance.Between(px, py, npc.x, npc.y) < 100) {
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
    const periodicTimeout = time - this.lastStatsEmitTime > 3000;

    if (periodicTimeout) {
      this.lastStatsEmitTime = time;
      this.lastGridX = gridX;
      this.lastGridY = gridY;

      EventBus.emit('player-stats-updated', {
        x: Math.round(px),
        y: Math.round(py),
        gridX,
        gridY,
        hp: this.player.getHealth(),
        maxHp: this.player.getMaxHealth(),
        name: this.player.getEntityName(),
        avatar: this.player.getAvatar(),
        roomName: this.getSchoolDisplayName(),
        inHouse: false,
        level: 1,
      });
    }

    if (time - this.lastPosSaveTime > 5000) {
      this.lastPosSaveTime = time;
      try {
        localStorage.setItem(
          `raden_pos_school_${this.schoolType}`,
          JSON.stringify({ x: Math.round(px), y: Math.round(py) })
        );
      } catch (e) {}
    }
  }

  public triggerCurrentInteraction(): void {
    if (!this.player || this.isTransitioning) return;
    const px = this.player.x;
    const py = this.player.y;

    // 1. Pintu Keluar
    if (Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y) < 130) {
      this.transitionToWorld();
      return;
    }

    // 2. Papan Tulis
    if (Phaser.Math.Distance.Between(px, py, this.whiteboardZone.x, this.whiteboardZone.y) < 140) {
      this.player.showSpeechBubble('Membaca catatan pelajaran hari ini 📚');
      return;
    }

    // 3. Meja Guru
    if (Phaser.Math.Distance.Between(px, py, this.teacherDeskZone.x, this.teacherDeskZone.y) < 130) {
      EventBus.emit('open-school-subjects', {
        schoolType: this.schoolType,
        grade: this.grade,
        deskType: 'guru',
      });
      this.player.showSpeechBubble(`Membuka kurikulum mata pelajaran Kelas ${this.grade} di Meja Guru! 📚🎓`);
      return;
    }

    // 3b. Barisan Meja Siswa Belajar
    let nearestDeskDist = 9999;
    for (const dPos of this.studentDeskPositions) {
      const d = Phaser.Math.Distance.Between(px, py, dPos.x, dPos.y);
      if (d < nearestDeskDist) nearestDeskDist = d;
    }
    if (nearestDeskDist < 110) {
      EventBus.emit('open-school-subjects', {
        schoolType: this.schoolType,
        grade: this.grade,
        deskType: 'siswa',
      });
      this.player.showSpeechBubble(`Membuka buku mata pelajaran Kelas ${this.grade} di Meja Siswa! 📝📖`);
      return;
    }

    // 4. Pojok Baca / Rak Buku
    if (Phaser.Math.Distance.Between(px, py, this.bookshelfZone.x, this.bookshelfZone.y) < 130) {
      this.player.showSpeechBubble('Membaca buku ensiklopedia sains & atlas dunia 📖');
      return;
    }

    // 5. Mading Kelas
    if (Phaser.Math.Distance.Between(px, py, this.madingZone.x, this.madingZone.y) < 130) {
      this.player.showSpeechBubble('Mengecek jadwal piket kebersihan kelas & karya puisi 📌');
      return;
    }

    // 6. NPC Sekolah
    for (const npc of this.npcs) {
      if (Phaser.Math.Distance.Between(px, py, npc.x, npc.y) < 120) {
        this.interactWithNpc(npc);
        return;
      }
    }
  }

  private transitionToWorld(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.player?.showSpeechBubble('Keluar menuju ke Open World...');

    const worldPath = '/world';
    if (window.location.pathname !== worldPath) {
      window.history.pushState(null, '', worldPath);
    }
    EventBus.emit('url-changed', worldPath);

    // Hapus posisi tersimpan di kelas agar jika masuk lagi lewat pintu di masa depan, muncul di pintu
    try {
      localStorage.removeItem(`raden_pos_school_${this.schoolType}`);
    } catch (e) {}

    // Kembalikan room WebSocket ke 'world'
    this.networkManager.switchRoom('world', this.returnPos.x, this.returnPos.y);

    // Bersihkan seluruh remote player lama dari gedung sekolah
    this.remotePlayers.forEach(p => p.destroy());
    this.remotePlayers.clear();

    this.time.delayedCall(400, () => {
      this.cameras?.main?.stopFollow();

      this.scene.start('WorldScene', {
        name: this.playerName,
        avatar: this.currentAvatar,
        spawnPos: { x: this.returnPos.x, y: this.returnPos.y },
      });
    });
  }
}
