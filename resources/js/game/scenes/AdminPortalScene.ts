/**
 * ============================================================================
 * FILE: resources/js/game/scenes/AdminPortalScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Khusus Portal Super Admin (Ruang Kendali Tertinggi RadenWorld).
 * Hanya dapat diakses oleh Super Admin dengan URL berformat:
 * http://localhost:8000/admin/{randomAdminToken}
 * 
 * FITUR EKSKLUSIF PORTAL ADMIN:
 * 1. Tata ruang futuristik bercorak catur obsidian gelap & emas amber.
 * 2. Tahta Agung Pencipta (Creator's Throne) dengan aura mahkota berkilau.
 * 3. Konsol Interaktif:
 *    - 📢 Konsol Broadcast Server: Siaran pengumuman ke seluruh pemain.
 *    - 👥 Konsol Data Pemain: Monitor sensus pengguna & server.
 *    - ⚡ Konsol Matrix Kecepatan / Godmode: Kecepatan kilat 400 Px/s.
 * 4. Dua Gerbang Portal Teleportasi Keluar:
 *    - 🌀 Portal Biru-Emas ke Open World (/world).
 *    - 🏠 Portal Hijau-Emas ke Rumah Pribadi (/home/{safeId}).
 * 5. Perlindungan Akses: Hanya pengguna terverifikasi Super Admin yang dapat masuk.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EventBus } from '../core/EventBus';
import { NetworkManager } from '../core/NetworkManager';
import { CameraController } from '../controllers/CameraController';
import { IAvatarCustomization } from '../types';

export class AdminPortalScene extends Phaser.Scene {
  public player!: Player;
  public cameraController!: CameraController;
  private playerName: string = 'RADEN';
  private currentAvatar!: IAvatarCustomization;
  private adminToken: string = 'raden-master-key';

  public readonly roomWidth: number = 2400;
  public readonly roomHeight: number = 1800;
  public readonly tileSize: number = 120;

  // Zona-zona interaktif (diskalakan presisi pada petak grid 120px)
  private throneZone = { x: 1200, y: 360 };
  private broadcastConsoleZone = { x: 720, y: 600 };
  private playersConsoleZone = { x: 1680, y: 600 };
  private godmodeConsoleZone = { x: 480, y: 960 };
  private worldPortalZone = { x: 960, y: 1500 };
  private housePortalZone = { x: 1440, y: 1500 };

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private lastGridX: number = -1;
  private lastGridY: number = -1;
  private lastRoomLabel: string = '';

  constructor() {
    super({ key: 'AdminPortalScene' });
    this.currentAvatar = {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#f59e0b',
      pantsColor: '#0f172a',
      hatType: 'crown',
    };
  }

  public init(data?: { name?: string; avatar?: IAvatarCustomization; adminToken?: string }): void {
    this.player = null as any;
    if (data?.name) this.playerName = data.name;
    if (data?.avatar) this.currentAvatar = data.avatar;
    if (data?.adminToken) {
      this.adminToken = data.adminToken;
    } else if (window.location.pathname.startsWith('/admin/')) {
      const seg = window.location.pathname.replace('/admin/', '').trim();
      if (seg) this.adminToken = seg;
    }
  }

  public create(): void {
    // 1. Batas fisika ruangan portal admin
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);

    // 2. Inisialisasi grup rintangan fisik arcade (Dinding, Konsol, Tahta)
    this.obstacles = this.physics.add.staticGroup();

    // 3. Berpindah ke room portal admin di server (sehingga karakter hilang dari Open World)
    NetworkManager.getInstance().switchRoom('admin-' + this.adminToken, 1200, 1080);

    // 4. Render interior futuristik Portal Admin menggunakan aset visual HD
    this.createPortalEnvironment();

    // 5. Setup kontrol kamera zoom via CameraController
    this.setupCameraZoomControls(1.1);

    // 6. Spawn karakter Super Admin di karpet tengah
    this.spawnSuperAdminPlayer();

    // 4. Tombol interaksi keyboard 'E' (abaikan jika sedang mengetik di input chat)
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    // Tap / Klik lantai ruangan untuk bergerak (Khusus PC & Mobile)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (pointer.rightButtonDown()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;
      if (wx < 120 || wx > this.roomWidth - 120 || wy < 120 || wy > this.roomHeight - 120) return;

      if (this.player && this.player.active) {
        this.spawnTapRipple(wx, wy);
        this.player.navigateTo(wx, wy);
      }
    });

    // 5. Hubungkan tombol interaksi HUD
    const onTriggerInteraction = () => {
      this.triggerCurrentInteraction();
    };
    EventBus.on('trigger-interaction', onTriggerInteraction);

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
    };
    EventBus.on('trigger-expression', onTriggerExpression);

    const cleanupScene = () => {
      this.cameras?.main?.stopFollow();
      EventBus.off('trigger-interaction', onTriggerInteraction);
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.emit('interaction-prompt', null);
      if (this.player) {
        this.player.destroy();
        this.player = null as any;
      }
      if (this.cameraController) {
        this.cameraController.destroy();
        this.cameraController = null as any;
      }
    };

    this.events.on('shutdown', cleanupScene);
    this.events.on('destroy', cleanupScene);

    // Beritahu HUD lokasi saat ini
    EventBus.emit('location-updated', `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${this.adminToken})`);
  }

  private targetZoom: number = 1.0;

  /**
   * Menyiapkan kontrol kamera via CameraController
   */
  private setupCameraZoomControls(defaultZoom: number = 1.1): void {
    this.targetZoom = defaultZoom;
    if (this.cameraController) {
      this.cameraController.destroy();
      this.cameraController = null as any;
    }
    this.cameraController = new CameraController(this, {
      defaultZoom,
      minZoom: 0.6,
      maxZoom: 2.0,
      zoomLerpSpeed: 0.12,
    });
  }

  public smoothZoomTo(newZoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(newZoom, 0.6, 2.0);
    this.cameraController?.smoothZoomTo(newZoom);
  }

  /**
   * Menggambar ruangan pusat kendali portal admin berpola catur obsidian & emas
   * dengan skala 1 petak = 120px (Sama persis dengan Safe House & Open World)
   */
  /**
   * Menambahkan rintangan tabrakan fisik arcade (Dinding, Konsol, Tahta)
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
   * Merender interior futuristik Ruang Kendali Super Admin RadenWorld menggunakan aset visual HD
   */
  private createPortalEnvironment(): void {
    // 1. LANTAI BERPOLA CATUR ADMIN EKSKLUSIF (120x120 px Tile)
    // Menggunakan aset HD: admin-floor-dark (#0037AE) dan admin-floor-light (#FF00C8)
    for (let gy = 0; gy < 15; gy++) {
      for (let gx = 0; gx < 20; gx++) {
        const isDark = (gx + gy) % 2 === 0;
        const key = isDark ? 'admin-floor-dark' : 'admin-floor-light';
        const tile = this.add.image(gx * 120 + 60, gy * 120 + 60, key);
        tile.setDisplaySize(120, 120);
        tile.setDepth(-100);
      }
    }

    // 2. DINDING BULKHEAD CYBER & RINTANGAN FISIK PERIMETER (Ketebalan 120px)
    // Dinding Atas (gy=0)
    const wallTop = this.add.graphics();
    wallTop.fillStyle(0x020617, 0.96);
    wallTop.fillRect(0, 0, this.roomWidth, 120);
    wallTop.lineStyle(4, 0xf59e0b, 1);
    wallTop.strokeRect(0, 116, this.roomWidth, 4);
    wallTop.setDepth(110);
    this.addGridObstacle(0, 0, 20, 1);

    // Dinding Bawah (gy=14)
    const wallBottom = this.add.graphics();
    wallBottom.fillStyle(0x020617, 0.96);
    wallBottom.fillRect(0, this.roomHeight - 120, this.roomWidth, 120);
    wallBottom.lineStyle(4, 0xf59e0b, 1);
    wallBottom.strokeRect(0, this.roomHeight - 120, this.roomWidth, 4);
    wallBottom.setDepth(1800);
    this.addGridObstacle(0, 14, 20, 1);

    // Dinding Barat (gx=0) & Timur (gx=19)
    const wallSides = this.add.graphics();
    wallSides.fillStyle(0x020617, 0.96);
    wallSides.fillRect(0, 0, 120, this.roomHeight);
    wallSides.fillRect(this.roomWidth - 120, 0, 120, this.roomHeight);
    wallSides.lineStyle(4, 0xf59e0b, 1);
    wallSides.strokeRect(116, 0, 4, this.roomHeight);
    wallSides.strokeRect(this.roomWidth - 120, 0, 4, this.roomHeight);
    wallSides.setDepth(110);
    this.addGridObstacle(0, 0, 1, 15);
    this.addGridObstacle(19, 0, 1, 15);

    // 3. KARPET EMAS KEKAISARAN (2x1 Karpet Emas.png) - LORONG TENGAH (gx=9..10)
    // Membentang megah dari gerbang portal (gy=13) hingga kaki tahta (gy=3)
    for (let gy = 3; gy <= 13; gy++) {
      const carpet = this.add.image(1200, gy * 120 + 60, 'admin-carpet-gold');
      carpet.setDisplaySize(240, 120);
      carpet.setDepth(-50);
    }

    // 4. PILAR ENERGI CYBER (1x3 Pilar Cyber.png - 120x360 px)
    const pillars = [
      { x: 300, y: 240, gx: 2, gy: 1 },    // NW
      { x: 2100, y: 240, gx: 17, gy: 1 },  // NE
      { x: 240, y: 1320, gx: 1.5, gy: 10 }, // SW
      { x: 2160, y: 1320, gx: 17.5, gy: 10 }, // SE
    ];
    pillars.forEach(p => {
      const pillar = this.add.image(p.x, p.y, 'admin-pillar');
      pillar.setDisplaySize(120, 360);
      pillar.setDepth(p.y + 120);
      this.addGridObstacle(p.gx, p.gy + 1.5, 1, 1.5);
    });

    // 5. BANNER KEAGUNGAN KERAJAAN RADEN (1x2 Banner Raden.png - 120x240 px)
    const banners = [
      { x: 840, y: 240 },  // Sebelah kiri tahta
      { x: 1560, y: 240 }, // Sebelah kanan tahta
    ];
    banners.forEach(b => {
      const banner = this.add.image(b.x, b.y, 'admin-banner');
      banner.setDisplaySize(120, 240);
      banner.setDepth(240);
    });

    // 6. TAHTA AGUNG PENCIPTA RADEN (3x3 Tahta Raden.png - 360x360 px)
    const throne = this.add.image(this.throneZone.x, this.throneZone.y, 'admin-throne');
    throne.setDisplaySize(360, 360);
    throne.setDepth(this.throneZone.y + 120);
    throne.setInteractive({ useHandCursor: true });
    throne.on('pointerdown', () => {
      this.player?.showSpeechBubble('👑 Membuka Panel Studio Arsitek RadenWorld...');
      EventBus.emit('open-creator-studio', { targetMap: 'world' });
    });
    // Obstacle fisik di dasar tahta agar karakter tidak menembus platform
    this.addGridObstacle(8.5, 2.5, 3, 1.5);

    // 7. FLOATING HOLO-GLOBE RADENWORLD (2x2 Holo Globe.png - 240x240 px)
    // Terapung di tengah ruangan kendali (x=1200, y=960)
    const holoGlobe = this.add.image(1200, 960, 'admin-holo-globe');
    holoGlobe.setDisplaySize(240, 240);
    holoGlobe.setDepth(960 + 80);
    holoGlobe.setInteractive({ useHandCursor: true });
    holoGlobe.on('pointerdown', () => {
      this.player?.showSpeechBubble('🌍 Holo-Globe: Pantauan Dimensi RadenWorld Terkoneksi Realtime');
    });
    // Efek mengapung dinamis
    this.tweens.add({
      targets: holoGlobe,
      y: 948,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // Obstacle alas proyektor (1x1 petak di tengah)
    this.addGridObstacle(9.5, 8.5, 1, 1);

    // 8. KONSOL 1: BROADCAST SERVER (2x2 Konsol Broadcast.png - 240x240 px)
    const consoleBroadcast = this.add.image(this.broadcastConsoleZone.x, this.broadcastConsoleZone.y, 'admin-console-broadcast');
    consoleBroadcast.setDisplaySize(240, 240);
    consoleBroadcast.setDepth(this.broadcastConsoleZone.y + 80);
    consoleBroadcast.setInteractive({ useHandCursor: true });
    consoleBroadcast.on('pointerdown', () => this.triggerCurrentInteraction());
    this.addGridObstacle(5, 5, 2, 1);
    // Efek denyut gelombang siaran
    this.tweens.add({
      targets: consoleBroadcast,
      alpha: 0.92,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 9. KONSOL 2: SENSUS & DATA PEMAIN (2x2 Konsol Database.png - 240x240 px)
    const consoleDb = this.add.image(this.playersConsoleZone.x, this.playersConsoleZone.y, 'admin-console-database');
    consoleDb.setDisplaySize(240, 240);
    consoleDb.setDepth(this.playersConsoleZone.y + 80);
    consoleDb.setInteractive({ useHandCursor: true });
    consoleDb.on('pointerdown', () => this.triggerCurrentInteraction());
    this.addGridObstacle(13, 5, 2, 1);
    this.tweens.add({
      targets: consoleDb,
      alpha: 0.93,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 10. KONSOL 3: BUFF KILAT GODMODE (2x2 Konsol Godmode.png - 240x240 px)
    const consoleGodmode = this.add.image(this.godmodeConsoleZone.x, this.godmodeConsoleZone.y, 'admin-console-godmode');
    consoleGodmode.setDisplaySize(240, 240);
    consoleGodmode.setDepth(this.godmodeConsoleZone.y + 80);
    consoleGodmode.setInteractive({ useHandCursor: true });
    consoleGodmode.on('pointerdown', () => this.triggerCurrentInteraction());
    this.addGridObstacle(3, 8, 2, 1);
    this.tweens.add({
      targets: consoleGodmode,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 11. GERBANG PORTAL 1: OPEN WORLD (2x2 Portal World.png - 240x240 px)
    const portalWorld = this.add.image(this.worldPortalZone.x, this.worldPortalZone.y, 'admin-portal-world');
    portalWorld.setDisplaySize(240, 240);
    portalWorld.setDepth(this.worldPortalZone.y + 60);
    portalWorld.setInteractive({ useHandCursor: true });
    portalWorld.on('pointerdown', () => this.triggerCurrentInteraction());
    // Efek putaran kosmis vortex
    this.tweens.add({
      targets: portalWorld,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 12. GERBANG PORTAL 2: RUMAH PRIBADI (2x2 Portal House.png - 240x240 px)
    const portalHouse = this.add.image(this.housePortalZone.x, this.housePortalZone.y, 'admin-portal-house');
    portalHouse.setDisplaySize(240, 240);
    portalHouse.setDepth(this.housePortalZone.y + 60);
    portalHouse.setInteractive({ useHandCursor: true });
    portalHouse.on('pointerdown', () => this.triggerCurrentInteraction());
    this.tweens.add({
      targets: portalHouse,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1600,
      delay: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Label teks futuristik di atas masing-masing konsol & portal
    const labelStyle = {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
      align: 'center' as const,
    };
    this.add.text(this.throneZone.x, this.throneZone.y - 190, '👑 TAHTA AGUNG PENCIPTA RADEN', { ...labelStyle, fontSize: '16px' }).setOrigin(0.5).setDepth(600);
    this.add.text(this.broadcastConsoleZone.x, this.broadcastConsoleZone.y - 120, '📢 KONSOL BROADCAST SERVER', labelStyle).setOrigin(0.5).setDepth(800);
    this.add.text(this.playersConsoleZone.x, this.playersConsoleZone.y - 120, '👥 SENSUS & DATABASE PEMAIN', labelStyle).setOrigin(0.5).setDepth(800);
    this.add.text(this.godmodeConsoleZone.x, this.godmodeConsoleZone.y - 120, '⚡ REAKTOR GODMODE SPEED 400', labelStyle).setOrigin(0.5).setDepth(1100);
    this.add.text(this.worldPortalZone.x, this.worldPortalZone.y + 115, '🌀 GERBANG OPEN WORLD', labelStyle).setOrigin(0.5).setDepth(1700);
    this.add.text(this.housePortalZone.x, this.housePortalZone.y + 115, '🏠 GERBANG RUMAH PRIBADI', labelStyle).setOrigin(0.5).setDepth(1700);

    // Header Judul Portal di Bagian Atas
    this.add.text(1200, 60, `⚡ RADENWORLD PUSAT KENDALI SUPER ADMIN [KEY: ${this.adminToken.substring(0, 14)}...] ⚡`, {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '17px',
      color: '#f59e0b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(500);
  }

  /**
   * Spawn karakter Super Admin di ruangan kendali
   */
  private spawnSuperAdminPlayer(): void {
    if (this.player) {
      this.cameras?.main?.stopFollow();
      this.player.destroy();
    }

    const spawnX = 1200;
    const spawnY = 1080;

    this.player = new Player(
      this,
      spawnX,
      spawnY,
      'super_admin_local',
      this.playerName,
      this.currentAvatar
    );

    // Aktifkan tabrakan fisik arcade agar karakter tidak menembus dinding dan konsol
    if (this.obstacles) {
      this.physics.add.collider(this.player, this.obstacles);
    }

    if (!this.cameraController) {
      this.setupCameraZoomControls(1.1);
    }
    this.cameraController.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameraController.centerOn(spawnX, spawnY);
    this.cameraController.follow(this.player, true, 0.18, 0.18);
    this.smoothZoomTo(1.1);

    this.emitStats(spawnX, spawnY, `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${this.adminToken})`);

    this.time.delayedCall(400, () => {
      this.player?.showSpeechBubble('👑 Pusat Kendali Super Admin Aktif.');
    });
  }

  private emitStats(px: number, py: number, roomLabel: string): void {
    EventBus.emit('player-stats-updated', {
      x: Math.round(px),
      y: Math.round(py),
      gridX: Math.floor(px / this.tileSize),
      gridY: Math.floor(py / this.tileSize),
      name: this.playerName,
      avatar: this.currentAvatar,
      roomName: roomLabel,
      inHouse: false,
      level: 99,
      role: 'super_admin',
      isSuperAdmin: true,
      title: '👑 SUPER ADMIN',
    });
  }

  public update(time: number, delta: number): void {
    this.cameraController?.update(time, delta);
    if (!this.player) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y + 60);

    const px = this.player.x;
    const py = this.player.y;

    // Deteksi jarak ke objek-objek portal admin
    const distThrone = Phaser.Math.Distance.Between(px, py, this.throneZone.x, this.throneZone.y);
    const distBroadcast = Phaser.Math.Distance.Between(px, py, this.broadcastConsoleZone.x, this.broadcastConsoleZone.y);
    const distPlayers = Phaser.Math.Distance.Between(px, py, this.playersConsoleZone.x, this.playersConsoleZone.y);
    const distGodmode = Phaser.Math.Distance.Between(px, py, this.godmodeConsoleZone.x, this.godmodeConsoleZone.y);
    const distWorldPortal = Phaser.Math.Distance.Between(px, py, this.worldPortalZone.x, this.worldPortalZone.y);
    const distHousePortal = Phaser.Math.Distance.Between(px, py, this.housePortalZone.x, this.housePortalZone.y);

    let prompt: string | null = null;
    let label = `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${this.adminToken})`;

    if (distThrone < 180) {
      prompt = '👑 TEKAN [E] / KLIK TAHTA UNTUK BUKA PANEL ARSITEK PENCIPTA';
      label = 'PORTAL ADMIN: TAHTA PENCIPTA (ARSITEK STUDIO)';
    } else if (distBroadcast < 110) {
      prompt = 'TEKAN [E] / KLIK UNTUK SIARAN PENGUMUMAN SERVER';
      label = 'PORTAL ADMIN: KONSOL BROADCAST';
    } else if (distPlayers < 110) {
      prompt = 'TEKAN [E] / KLIK UNTUK LIHAT DATA PEMAIN TERDAFTAR';
      label = 'PORTAL ADMIN: KONSOL DATABASE';
    } else if (distGodmode < 110) {
      prompt = 'TEKAN [E] / KLIK UNTUK AKTIFKAN GODMODE & KECEPATAN';
      label = 'PORTAL ADMIN: KONSOL GODMODE';
    } else if (distWorldPortal < 100) {
      prompt = 'TEKAN [E] / KLIK UNTUK TELEPORT KE OPEN WORLD';
      label = 'PORTAL ADMIN: GERBANG OPEN WORLD';
    } else if (distHousePortal < 100) {
      prompt = 'TEKAN [E] / KLIK UNTUK TELEPORT KE RUMAH PRIBADI';
      label = 'PORTAL ADMIN: GERBANG RUMAH PRIBADI';
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }

    const gridX = Math.floor(px / this.tileSize);
    const gridY = Math.floor(py / this.tileSize);
    const gridChanged = gridX !== this.lastGridX || gridY !== this.lastGridY;
    const labelChanged = label !== this.lastRoomLabel;
    const periodicTimeout = time - this.lastStatsEmitTime > 1000;

    if (gridChanged || labelChanged || periodicTimeout) {
      this.lastStatsEmitTime = time;
      this.lastGridX = gridX;
      this.lastGridY = gridY;
      this.lastRoomLabel = label;
      this.emitStats(px, py, label);
    }
  }

  public triggerCurrentInteraction(): void {
    if (!this.player) return;
    const px = this.player.x;
    const py = this.player.y;

    // 1. Tahta Pencipta (Buka Panel Studio Arsitek RadenWorld)
    if (Phaser.Math.Distance.Between(px, py, this.throneZone.x, this.throneZone.y) < 200) {
      this.player.showSpeechBubble('👑 Membuka Panel Studio Arsitek RadenWorld...');
      EventBus.emit('open-creator-studio', { targetMap: 'world' });
      return;
    }

    // 2. Konsol Broadcast
    if (Phaser.Math.Distance.Between(px, py, this.broadcastConsoleZone.x, this.broadcastConsoleZone.y) < 120) {
      const msg = prompt('📢 Masukkan Pesan Siaran Pengumuman Server Super Admin:');
      if (msg && msg.trim()) {
        EventBus.emit('send-chat', `/announce ${msg.trim()}`);
        this.player.showSpeechBubble(`📢 Siaran terkirim: "${msg.trim()}"`);
      }
      return;
    }

    // 3. Konsol Database Pemain
    if (Phaser.Math.Distance.Between(px, py, this.playersConsoleZone.x, this.playersConsoleZone.y) < 120) {
      fetch('/api/admin/users')
        .then(r => r.json())
        .then(data => {
          const total = data.count || 0;
          this.player.showSpeechBubble(`👥 Total Pemain Terdaftar di Server: ${total} Akun`);
          EventBus.emit('new-chat-message', {
            id: `admin_db_${Date.now()}`,
            senderId: 'system',
            senderName: '💻 SISTEM DATABASE',
            text: `Data Server: Terdapat ${total} pemain terdaftar aktif di RadenWorld.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        })
        .catch(() => {
          this.player.showSpeechBubble('Gagal menghubungi database server.');
        });
      return;
    }

    // 4. Godmode & Kecepatan
    if (Phaser.Math.Distance.Between(px, py, this.godmodeConsoleZone.x, this.godmodeConsoleZone.y) < 120) {
      this.player.showSpeechBubble('⚡ Mode Dewa Aktif! Kecepatan gerak meningkat drastis.');
      EventBus.emit('new-chat-message', {
        id: `buff_${Date.now()}`,
        senderId: 'system',
        senderName: '⚡ KONSOL PORTAL',
        text: 'Kecepatan Super Admin ditingkatkan menjadi 400 Px/s!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }

    // 5. Portal ke Open World
    if (Phaser.Math.Distance.Between(px, py, this.worldPortalZone.x, this.worldPortalZone.y) < 110) {
      this.player.showSpeechBubble('Berteleportasi ke Open World...');
      this.time.delayedCall(400, () => {
        if (window.location.pathname !== '/world') {
          window.history.pushState(null, '', '/world');
        }
        EventBus.emit('url-changed', '/world');
        NetworkManager.getInstance().switchRoom('world', 4800, 4800);
        this.cameras?.main?.stopFollow();
        this.scene.start('WorldScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          spawnNearHouse: false,
        });
      });
      return;
    }

    // 6. Portal ke Rumah Pribadi
    if (Phaser.Math.Distance.Between(px, py, this.housePortalZone.x, this.housePortalZone.y) < 110) {
      this.player.showSpeechBubble('Berteleportasi ke Rumah Pribadi...');
      this.time.delayedCall(400, () => {
        let safeId = 'safe-raden-admin';
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          if (u.private_room_id) safeId = u.private_room_id;
        } catch (e) {}

        const housePath = `/home/${safeId}`;
        if (window.location.pathname !== housePath) {
          window.history.pushState(null, '', housePath);
        }
        EventBus.emit('url-changed', housePath);
        NetworkManager.getInstance().switchRoom('house-' + safeId, 840, 620);
        this.cameras?.main?.stopFollow();
        this.scene.start('HouseScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          privateRoomId: safeId,
        });
      });
      return;
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
}
