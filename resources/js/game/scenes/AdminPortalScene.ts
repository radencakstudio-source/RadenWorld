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
import { IAvatarCustomization } from '../types';

export class AdminPortalScene extends Phaser.Scene {
  public player!: Player;
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

    // 2. Render interior futuristik Portal Admin
    this.createPortalEnvironment();

    // 3. Spawn karakter Super Admin di karpet tengah
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
    };

    this.events.on('shutdown', cleanupScene);
    this.events.on('destroy', cleanupScene);

    // 7. Kontrol Kamera Zoom In & Zoom Out
    this.setupCameraZoomControls(1.1);

    // Beritahu HUD lokasi saat ini
    EventBus.emit('location-updated', `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${this.adminToken})`);
  }

  private targetZoom: number = 1.0;

  /**
   * Menyiapkan listener zoom kamera halus (Scroll Wheel, Keyboard, HUD buttons)
   */
  private setupCameraZoomControls(defaultZoom: number = 1.0): void {
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

    EventBus.on('camera-zoom-in', handleZoomIn);
    EventBus.on('camera-zoom-out', handleZoomOut);
    EventBus.on('camera-zoom-reset', handleZoomReset);

    this.input.keyboard?.on('keydown-PLUS', handleZoomIn);
    this.input.keyboard?.on('keydown-NUMPAD_ADD', handleZoomIn);
    this.input.keyboard?.on('keydown-MINUS', handleZoomOut);
    this.input.keyboard?.on('keydown-NUMPAD_SUBTRACT', handleZoomOut);

    this.events.on('shutdown', () => {
      this.input.off('wheel', onWheel);
      EventBus.off('camera-zoom-in', handleZoomIn);
      EventBus.off('camera-zoom-out', handleZoomOut);
      EventBus.off('camera-zoom-reset', handleZoomReset);
    });
  }

  private smoothZoomTo(newZoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(newZoom, 0.6, 2.0);
    this.tweens.killTweensOf(this.cameras.main);
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.targetZoom,
      duration: 220,
      ease: 'Cubic.easeOut',
    });
  }

  /**
   * Menggambar ruangan pusat kendali portal admin berpola catur obsidian & emas
   * dengan skala 1 petak = 120px (Sama persis dengan Safe House & Open World)
   */
  private createPortalEnvironment(): void {
    const g = this.add.graphics();

    // 1. LANTAI BERPOLA CATUR OBSIDIAN & EMAS AMBER (Tile Size 120px)
    const tileSize = this.tileSize; // 120px
    const darkTile = 0x090d16;   // Hitam Obsidian Pekat
    const lightTile = 0x172554;  // Biru Obsidian Gelap / Kosmik

    for (let y = 0; y < this.roomHeight; y += tileSize) {
      for (let x = 0; x < this.roomWidth; x += tileSize) {
        const isDark = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
        g.fillStyle(isDark ? darkTile : lightTile, 1);
        g.fillRect(x, y, tileSize, tileSize);

        // Garis batas grid catur emas tipis
        g.lineStyle(1, 0xf59e0b, 0.15);
        g.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // 2. DINDING DAN BORDER RUANG KENDALI (Ketebalan 120px / 1 Tile)
    const wallColor = 0x020617;
    // Dinding Atas
    g.fillStyle(wallColor, 1);
    g.fillRect(0, 0, this.roomWidth, 120);
    g.lineStyle(3, 0xf59e0b, 0.85);
    g.strokeRect(0, 118, this.roomWidth, 3);

    // Dinding Kiri & Kanan
    g.fillRect(0, 0, 120, this.roomHeight);
    g.fillRect(this.roomWidth - 120, 0, 120, this.roomHeight);
    g.lineStyle(3, 0xf59e0b, 0.85);
    g.strokeRect(118, 0, 3, this.roomHeight);
    g.strokeRect(this.roomWidth - 120, 0, 3, this.roomHeight);

    // Dinding Bawah
    g.fillRect(0, this.roomHeight - 120, this.roomWidth, 120);
    g.lineStyle(3, 0xf59e0b, 0.85);
    g.strokeRect(0, this.roomHeight - 120, this.roomWidth, 3);

    // 3. KARPET EMAS KERAJAAN KE TAHTA RADEN (Tengah X: 1200, Lebar: 240px / 2 Tile)
    g.fillStyle(0xd97706, 0.35);
    g.fillRect(1080, 120, 240, 1560);
    g.lineStyle(3, 0xf59e0b, 0.9);
    g.strokeRect(1080, 120, 240, 1560);

    // 4. TAHTA PENCIPTA (CREATOR'S THRONE) DI (1200, 360)
    // Platform tahta bertingkat
    g.fillStyle(0x78350f, 1);
    g.fillRoundedRect(1040, 270, 320, 170, 16);
    g.lineStyle(4, 0xfbbf24, 1);
    g.strokeRoundedRect(1040, 270, 320, 170, 16);

    // Kursi tahta emas
    g.fillStyle(0xd97706, 1);
    g.fillRoundedRect(1120, 295, 160, 120, 12);
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(1200, 340, 26);

    this.add.text(1200, 220, '👑 TAHTA PENCIPTA RADEN', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '18px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // 5. KONSOL 1: SIARAN PENGUMUMAN SERVER (BROADCAST) DI (720, 600)
    g.fillStyle(0x1e1b4b, 1);
    g.fillRoundedRect(620, 545, 200, 110, 12);
    g.lineStyle(3, 0xa855f7, 0.9);
    g.strokeRoundedRect(620, 545, 200, 110, 12);
    this.add.text(720, 600, '📢 BROADCAST\nSERVER', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: '#e9d5ff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 6. KONSOL 2: SENSUS & DATA PEMAIN DI (1680, 600)
    g.fillStyle(0x1e1b4b, 1);
    g.fillRoundedRect(1580, 545, 200, 110, 12);
    g.lineStyle(3, 0x38bdf8, 0.9);
    g.strokeRoundedRect(1580, 545, 200, 110, 12);
    this.add.text(1680, 600, '👥 SENSUS\nDATABASE', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: '#bae6fd',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 7. KONSOL 3: BUFF KILAT GODMODE DI (480, 960)
    g.fillStyle(0x1e1b4b, 1);
    g.fillRoundedRect(380, 905, 200, 110, 12);
    g.lineStyle(3, 0xf59e0b, 0.9);
    g.strokeRoundedRect(380, 905, 200, 110, 12);
    this.add.text(480, 960, '⚡ GODMODE\nSPEED 400', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: '#fde68a',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 8. PORTAL 1: MENUJU KE OPEN WORLD DI (960, 1500)
    const portalWorldG = this.add.graphics();
    portalWorldG.fillStyle(0x0284c7, 0.45);
    portalWorldG.fillCircle(960, 1500, 55);
    portalWorldG.lineStyle(4, 0x38bdf8, 1);
    portalWorldG.strokeCircle(960, 1500, 55);
    portalWorldG.lineStyle(3, 0xf59e0b, 0.85);
    portalWorldG.strokeCircle(960, 1500, 42);

    this.add.text(960, 1500, '🌀 OPEN\nWORLD', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#e0f2fe',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 9. PORTAL 2: MENUJU KE RUMAH PRIBADI DI (1440, 1500)
    const portalHouseG = this.add.graphics();
    portalHouseG.fillStyle(0x15803d, 0.45);
    portalHouseG.fillCircle(1440, 1500, 55);
    portalHouseG.lineStyle(4, 0x4ade80, 1);
    portalHouseG.strokeCircle(1440, 1500, 55);
    portalHouseG.lineStyle(3, 0xf59e0b, 0.85);
    portalHouseG.strokeCircle(1440, 1500, 42);

    this.add.text(1440, 1500, '🏠 SAFE\nHOUSE', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#dcfce7',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Header Judul Portal di Bagian Atas
    this.add.text(1200, 60, `⚡ RADENWORLD PUSAT KENDALI SUPER ADMIN [KEY: ${this.adminToken.substring(0, 14)}...] ⚡`, {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '16px',
      color: '#f59e0b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
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

    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.startFollow(this.player, false, 0.18, 0.18);
    this.cameras.main.setZoom(1.0);

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
    if (!this.player) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y);

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

    if (distThrone < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK DUDUK DI TAHTA PENCIPTA';
      label = 'PORTAL ADMIN: TAHTA PENCIPTA';
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

    // 1. Tahta Pencipta
    if (Phaser.Math.Distance.Between(px, py, this.throneZone.x, this.throneZone.y) < 130) {
      this.player.showSpeechBubble('👑 Bersemayam di Tahta Agung Pencipta RadenWorld.');
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
