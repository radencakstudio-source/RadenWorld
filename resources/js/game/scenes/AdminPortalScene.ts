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

  public readonly roomWidth: number = 1280;
  public readonly roomHeight: number = 960;

  // Zona-zona interaktif
  private throneZone = { x: 640, y: 260 };
  private broadcastConsoleZone = { x: 420, y: 340 };
  private playersConsoleZone = { x: 860, y: 340 };
  private godmodeConsoleZone = { x: 300, y: 520 };
  private worldPortalZone = { x: 520, y: 840 };
  private housePortalZone = { x: 760, y: 840 };

  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;

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

    // 5. Hubungkan tombol interaksi HUD
    EventBus.on('trigger-interaction', () => {
      this.triggerCurrentInteraction();
    });

    // 6. Hubungkan event beralih scene
    const handleSwitchScene = (data: { scene: string; privateRoomId?: string; adminToken?: string }) => {
      if (data.scene === 'WorldScene') {
        this.cameras.main.stopFollow();
        this.scene.start('WorldScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          spawnNearHouse: false,
        });
      } else if (data.scene === 'HouseScene') {
        this.cameras.main.stopFollow();
        this.scene.start('HouseScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          privateRoomId: data.privateRoomId || 'safe-raden-admin',
        });
      }
    };
    EventBus.on('switch-scene', handleSwitchScene);

    this.events.on('shutdown', () => {
      EventBus.off('switch-scene', handleSwitchScene);
      EventBus.emit('interaction-prompt', null);
    });

    // Beritahu HUD lokasi saat ini
    EventBus.emit('location-updated', `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${this.adminToken})`);
  }

  /**
   * Menggambar ruangan pusat kendali portal admin berpola catur obsidian & emas
   */
  private createPortalEnvironment(): void {
    const g = this.add.graphics();

    // 1. LANTAI BERPOLA CATUR OBSIDIAN & EMAS AMBER
    const tileSize = 64;
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

    // 2. DINDING DAN BORDER RUANG KENDALI
    const wallColor = 0x020617;
    // Dinding Atas
    g.fillStyle(wallColor, 1);
    g.fillRect(0, 0, this.roomWidth, 90);
    g.lineStyle(3, 0xf59e0b, 0.8);
    g.strokeRect(0, 88, this.roomWidth, 2);

    // Dinding Kiri & Kanan
    g.fillRect(0, 0, 70, this.roomHeight);
    g.fillRect(this.roomWidth - 70, 0, 70, this.roomHeight);
    g.lineStyle(3, 0xf59e0b, 0.8);
    g.strokeRect(68, 0, 2, this.roomHeight);
    g.strokeRect(this.roomWidth - 70, 0, 2, this.roomHeight);

    // Dinding Bawah
    g.fillRect(0, this.roomHeight - 70, this.roomWidth, 70);
    g.lineStyle(3, 0xf59e0b, 0.8);
    g.strokeRect(0, this.roomHeight - 70, this.roomWidth, 2);

    // 3. KARPET EMAS KERAJAAN KE TAHTA RADEN
    g.fillStyle(0xd97706, 0.35);
    g.fillRect(580, 100, 120, 760);
    g.lineStyle(2, 0xf59e0b, 0.9);
    g.strokeRect(580, 100, 120, 760);

    // 4. TAHTA PENCIPTA (CREATOR'S THRONE) DI (640, 260)
    // Platform tahta bertingkat
    g.fillStyle(0x78350f, 1);
    g.fillRoundedRect(560, 200, 160, 100, 12);
    g.lineStyle(3, 0xfbbf24, 1);
    g.strokeRoundedRect(560, 200, 160, 100, 12);

    // Kursi tahta emas
    g.fillStyle(0xd97706, 1);
    g.fillRoundedRect(600, 215, 80, 70, 8);
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(640, 240, 16);

    this.add.text(640, 160, '👑 TAHTA PENCIPTA RADEN', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '15px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 5. KONSOL 1: SIARAN PENGUMUMAN SERVER (BROADCAST) DI (420, 340)
    g.fillStyle(0x1e1b4b, 1);
    g.fillRoundedRect(360, 310, 120, 60, 8);
    g.lineStyle(2, 0xa855f7, 0.9);
    g.strokeRoundedRect(360, 310, 120, 60, 8);
    this.add.text(420, 340, '📢 BROADCAST\nSERVER', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#e9d5ff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 6. KONSOL 2: SENSUS & DATA PEMAIN DI (860, 340)
    g.fillStyle(0x1e1b4b, 1);
    g.fillRoundedRect(800, 310, 120, 60, 8);
    g.lineStyle(2, 0x38bdf8, 0.9);
    g.strokeRoundedRect(800, 310, 120, 60, 8);
    this.add.text(860, 340, '👥 SENSUS\nDATABASE', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#bae6fd',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 7. KONSOL 3: BUFF KILAT GODMODE DI (300, 520)
    g.fillStyle(0x1e1b4b, 1);
    g.fillRoundedRect(240, 490, 120, 60, 8);
    g.lineStyle(2, 0xf59e0b, 0.9);
    g.strokeRoundedRect(240, 490, 120, 60, 8);
    this.add.text(300, 520, '⚡ GODMODE\nSPEED 400', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#fde68a',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 8. PORTAL 1: MENUJU KE OPEN WORLD DI (520, 840)
    const portalWorldG = this.add.graphics();
    portalWorldG.fillStyle(0x0284c7, 0.4);
    portalWorldG.fillCircle(520, 840, 36);
    portalWorldG.lineStyle(3, 0x38bdf8, 1);
    portalWorldG.strokeCircle(520, 840, 36);
    portalWorldG.lineStyle(2, 0xf59e0b, 0.8);
    portalWorldG.strokeCircle(520, 840, 26);

    this.add.text(520, 840, '🌀 WORLD', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#e0f2fe',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 9. PORTAL 2: MENUJU KE RUMAH PRIBADI DI (760, 840)
    const portalHouseG = this.add.graphics();
    portalHouseG.fillStyle(0x15803d, 0.4);
    portalHouseG.fillCircle(760, 840, 36);
    portalHouseG.lineStyle(3, 0x4ade80, 1);
    portalHouseG.strokeCircle(760, 840, 36);
    portalHouseG.lineStyle(2, 0xf59e0b, 0.8);
    portalHouseG.strokeCircle(760, 840, 26);

    this.add.text(760, 840, '🏠 HOUSE', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#dcfce7',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Header Judul Portal di Bagian Atas
    this.add.text(640, 45, `⚡ RADENWORLD PUSAT KENDALI SUPER ADMIN [KEY: ${this.adminToken.substring(0, 14)}...] ⚡`, {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#f59e0b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  /**
   * Spawn karakter Super Admin di ruangan kendali
   */
  private spawnSuperAdminPlayer(): void {
    if (this.player) {
      this.cameras.main.stopFollow();
      this.player.destroy();
    }

    this.player = new Player(
      this,
      640,
      560,
      'super_admin_local',
      this.playerName,
      this.currentAvatar
    );

    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.1);

    this.emitStats(640, 560, `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${this.adminToken})`);

    this.time.delayedCall(400, () => {
      this.player?.showSpeechBubble('👑 Pusat Kendali Super Admin Aktif.');
    });
  }

  private emitStats(px: number, py: number, roomLabel: string): void {
    EventBus.emit('player-stats-updated', {
      x: Math.round(px),
      y: Math.round(py),
      gridX: Math.floor(px / 64),
      gridY: Math.floor(py / 64),
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

    if (distThrone < 85) {
      prompt = 'TEKAN [E] / KLIK UNTUK DUDUK DI TAHTA PENCIPTA';
      label = 'PORTAL ADMIN: TAHTA PENCIPTA';
    } else if (distBroadcast < 75) {
      prompt = 'TEKAN [E] / KLIK UNTUK SIARAN PENGUMUMAN SERVER';
      label = 'PORTAL ADMIN: KONSOL BROADCAST';
    } else if (distPlayers < 75) {
      prompt = 'TEKAN [E] / KLIK UNTUK LIHAT DATA PEMAIN TERDAFTAR';
      label = 'PORTAL ADMIN: KONSOL DATABASE';
    } else if (distGodmode < 75) {
      prompt = 'TEKAN [E] / KLIK UNTUK AKTIFKAN GODMODE & KECEPATAN';
      label = 'PORTAL ADMIN: KONSOL GODMODE';
    } else if (distWorldPortal < 70) {
      prompt = 'TEKAN [E] / KLIK UNTUK TELEPORT KE OPEN WORLD';
      label = 'PORTAL ADMIN: GERBANG OPEN WORLD';
    } else if (distHousePortal < 70) {
      prompt = 'TEKAN [E] / KLIK UNTUK TELEPORT KE RUMAH PRIBADI';
      label = 'PORTAL ADMIN: GERBANG RUMAH PRIBADI';
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }

    if (time - this.lastStatsEmitTime > 60) {
      this.lastStatsEmitTime = time;
      this.emitStats(px, py, label);
    }
  }

  public triggerCurrentInteraction(): void {
    if (!this.player) return;
    const px = this.player.x;
    const py = this.player.y;

    // 1. Tahta Pencipta
    if (Phaser.Math.Distance.Between(px, py, this.throneZone.x, this.throneZone.y) < 95) {
      this.player.showSpeechBubble('👑 Bersemayam di Tahta Agung Pencipta RadenWorld.');
      return;
    }

    // 2. Konsol Broadcast
    if (Phaser.Math.Distance.Between(px, py, this.broadcastConsoleZone.x, this.broadcastConsoleZone.y) < 85) {
      const msg = prompt('📢 Masukkan Pesan Siaran Pengumuman Server Super Admin:');
      if (msg && msg.trim()) {
        EventBus.emit('send-chat', `/announce ${msg.trim()}`);
        this.player.showSpeechBubble(`📢 Siaran terkirim: "${msg.trim()}"`);
      }
      return;
    }

    // 3. Konsol Database Pemain
    if (Phaser.Math.Distance.Between(px, py, this.playersConsoleZone.x, this.playersConsoleZone.y) < 85) {
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
    if (Phaser.Math.Distance.Between(px, py, this.godmodeConsoleZone.x, this.godmodeConsoleZone.y) < 85) {
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
    if (Phaser.Math.Distance.Between(px, py, this.worldPortalZone.x, this.worldPortalZone.y) < 80) {
      this.player.showSpeechBubble('Berteleportasi ke Open World...');
      this.time.delayedCall(400, () => {
        if (window.location.pathname !== '/world') {
          window.history.pushState(null, '', '/world');
        }
        EventBus.emit('url-changed', '/world');
        this.cameras.main.stopFollow();
        this.scene.start('WorldScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          spawnNearHouse: false,
        });
      });
      return;
    }

    // 6. Portal ke Rumah Pribadi
    if (Phaser.Math.Distance.Between(px, py, this.housePortalZone.x, this.housePortalZone.y) < 80) {
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
        this.cameras.main.stopFollow();
        this.scene.start('HouseScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          privateRoomId: safeId,
        });
      });
      return;
    }
  }
}
