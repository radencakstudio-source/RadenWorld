/**
 * ============================================================================
 * FILE: resources/js/game/scenes/HouseScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Rumah Pribadi Karakter (Private Player Room / House).
 * Pemain memulai petualangan di dalam rumah ini (bukan langsung di World).
 * 
 * FASILITAS & INTERAKSI:
 * 1. Lemari Pakaian: Untuk mengganti avatar (warna kulit, baju, celana, topi).
 * 2. Tempat Tidur: Untuk beristirahat dan memunculkan efek "Zzz...".
 * 3. Dapur: Untuk memasak makanan.
 * 4. Kamar Mandi: Untuk membersihkan diri.
 * 5. Pintu Keluar: Ketika didekati, muncul tombol interaksi untuk menuju ke Open World.
 * * Catatan: Di scene ini tidak ada pemain lain (ruang privat).
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EventBus } from '../core/EventBus';
import { IAvatarCustomization } from '../types';

export class HouseScene extends Phaser.Scene {
  private player: Player | null = null;
  private currentAvatar: IAvatarCustomization;
  private playerName: string = 'Petualang';

  // Batas ruangan rumah
  public readonly roomWidth: number = 960;
  public readonly roomHeight: number = 720;

  // Objek interaktif & jarak deteksi
  private exitDoorZone!: { x: number; y: number; width: number; height: number };
  private wardrobeZone!: { x: number; y: number };
  private bedZone!: { x: number; y: number };
  private kitchenZone!: { x: number; y: number };
  private bathroomZone!: { x: number; y: number };

  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private privateRoomId: string = 'safe-01';

  constructor() {
    super({ key: 'HouseScene' });
    this.currentAvatar = {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  }

  public init(data?: { name?: string; avatar?: IAvatarCustomization; privateRoomId?: string }): void {
    if (data?.name) this.playerName = data.name;
    if (data?.avatar) this.currentAvatar = data.avatar;
    if (data?.privateRoomId) {
      this.privateRoomId = data.privateRoomId;
    } else if (window.location.pathname.startsWith('/home/')) {
      const seg = window.location.pathname.replace('/home/', '').trim();
      if (seg) this.privateRoomId = seg;
    }
  }

  public create(): void {
    // 1. Batas fisika dinding rumah
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);

    // 2. Render tata ruang interior rumah
    this.createHouseInterior();

    // 3. Spawn karakter pemain di tengah ruang tamu rumah
    this.spawnPlayerInHouse();

    // 4. Hubungkan event ganti avatar dari lemari
    EventBus.on('avatar-updated', (newAvatar: IAvatarCustomization) => {
      if (newAvatar) {
        this.currentAvatar = newAvatar;
      }
      if (this.player) {
        const x = this.player.x;
        const y = this.player.y;
        this.cameras.main.stopFollow();
        this.player.destroy();
        this.player = new Player(this, x, y, 'local_player', this.playerName, this.currentAvatar);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.emitStats(x, y, 'RUMAH PRIBADI: LEMARI PAKAIAN');
      }
    });

    // Hubungkan event bergabung ke game dari Home Screen
    EventBus.on('join-game', (userData: { name: string; avatar: IAvatarCustomization; privateRoomId?: string }) => {
      if (userData?.name) this.playerName = userData.name;
      if (userData?.avatar) this.currentAvatar = userData.avatar;
      if (userData?.privateRoomId) this.privateRoomId = userData.privateRoomId;
      this.spawnPlayerInHouse();
    });

    // Hubungkan event klik tombol interaksi dari HUD
    EventBus.on('trigger-interaction', () => {
      this.triggerCurrentInteraction();
    });

    // 5. Tombol interaksi keyboard 'E' (abaikan jika sedang mengetik di input chat)
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    // Hubungkan event beralih scene (misal tombol Back browser atau Teleport Admin Portal)
    const handleSwitchScene = (data: { scene: string; privateRoomId?: string; adminToken?: string }) => {
      if (data.scene === 'WorldScene') {
        this.cameras.main.stopFollow();
        this.scene.start('WorldScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          spawnNearHouse: true,
          privateRoomId: this.privateRoomId,
        });
      } else if (data.scene === 'AdminPortalScene') {
        this.cameras.main.stopFollow();
        this.scene.start('AdminPortalScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          adminToken: data.adminToken || 'raden-master-key',
        });
      }
    };
    EventBus.on('switch-scene', handleSwitchScene);

    this.events.on('shutdown', () => {
      EventBus.off('switch-scene', handleSwitchScene);
      EventBus.emit('interaction-prompt', null);
    });

    // Beritahu HUD lokasi saat ini
    EventBus.emit('location-updated', 'RUMAH PRIBADI: RUANG UTAMA');
  }

  /**
   * Menggambar denah rumah, lantai bermotif catur persegi gelap & terang, dinding kayu, dan furnitur
   */
  private createHouseInterior(): void {
    const g = this.add.graphics();

    // ==============================================================
    // LANTAI RUMAH BERPOLA CATUR (CHECKERBOARD SQUARES GELAP & TERANG)
    // ==============================================================
    const tileSize = 48; // Persegi catur 48x48 pixel
    const darkTile = 0x451a03;  // Kotak Catur Kayu Tua Gelap
    const lightTile = 0x854d0e; // Kotak Catur Kayu Amber Terang

    for (let y = 0; y < this.roomHeight; y += tileSize) {
      for (let x = 0; x < this.roomWidth; x += tileSize) {
        const isDark = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
        g.fillStyle(isDark ? darkTile : lightTile, 1);
        g.fillRect(x, y, tileSize, tileSize);

        // Garis batas grid kotak persegi catur
        g.lineStyle(1, 0x270f02, 0.45);
        g.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Karpet besar di ruang tamu
    g.fillStyle(0xb45309, 0.8);
    g.fillRoundedRect(320, 280, 320, 220, 16);
    g.lineStyle(2, 0xf59e0b, 0.9);
    g.strokeRoundedRect(320, 280, 320, 220, 16);

    // Dinding batas luar rumah
    g.fillStyle(0x1e293b, 1);
    g.fillRect(0, 0, this.roomWidth, 50); // Dinding atas
    g.fillRect(0, 0, 50, this.roomHeight); // Dinding kiri
    g.fillRect(this.roomWidth - 50, 0, 50, this.roomHeight); // Dinding kanan
    g.fillRect(0, this.roomHeight - 40, this.roomWidth, 40); // Dinding bawah

    // Sekat Ruangan Dinding Kamar Mandi (Kanan Bawah)
    g.fillRect(660, 420, 250, 16);

    // ==============================================================
    // 1. KAMAR TIDUR (BEDROOM) - Kiri Atas
    // ==============================================================
    this.bedZone = { x: 140, y: 130 };
    // Rangka kasur
    g.fillStyle(0x451a03, 1);
    g.fillRoundedRect(80, 80, 120, 150, 8);
    // Kasur putih
    g.fillStyle(0xf8fafc, 1);
    g.fillRoundedRect(86, 86, 108, 138, 6);
    // Selimut biru
    g.fillStyle(0x2563eb, 1);
    g.fillRoundedRect(86, 120, 108, 104, 4);
    // Bantal
    g.fillStyle(0xe2e8f0, 1);
    g.fillRoundedRect(98, 92, 84, 24, 4);

    this.add.text(140, 60, 'TEMPAT TIDUR', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#f59e0b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ==============================================================
    // 2. LEMARI PAKAIAN (WARDROBE) - Kiri Tengah
    // ==============================================================
    this.wardrobeZone = { x: 300, y: 110 };
    // Lemari kayu jati
    g.fillStyle(0x522304, 1);
    g.fillRoundedRect(250, 70, 100, 75, 6);
    g.lineStyle(2, 0xd97706, 1);
    g.strokeRoundedRect(250, 70, 100, 75, 6);
    // Gagang pintu lemari emas
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(295, 108, 3.5);
    g.fillCircle(305, 108, 3.5);

    this.add.text(300, 52, 'LEMARI GANTI AVA', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#f59e0b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ==============================================================
    // 3. DAPUR MEMASAK (KITCHEN) - Kanan Atas
    // ==============================================================
    this.kitchenZone = { x: 740, y: 130 };
    // Meja konter dapur
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(640, 70, 200, 70, 6);
    // Kompor & oven
    g.fillStyle(0x0f172a, 1);
    g.fillRect(660, 80, 50, 50);
    g.fillStyle(0xef4444, 1); // Api kompor
    g.fillCircle(685, 105, 10);
    // Kulkas perak
    g.fillStyle(0x94a3b8, 1);
    g.fillRoundedRect(845, 60, 50, 110, 4);

    this.add.text(740, 52, 'DAPUR MEMASAK', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#f59e0b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ==============================================================
    // 4. KAMAR MANDI (BATHROOM) - Kanan Bawah
    // ==============================================================
    this.bathroomZone = { x: 780, y: 550 };
    // Lantai keramik porselen biru muda kamar mandi
    g.fillStyle(0x0284c7, 0.4);
    g.fillRect(670, 440, 230, 230);
    // Bak mandi porselen (Bathtub)
    g.fillStyle(0xf1f5f9, 1);
    g.fillRoundedRect(720, 510, 120, 65, 12);
    // Air bathtub
    g.fillStyle(0x38bdf8, 0.8);
    g.fillRoundedRect(728, 518, 104, 49, 8);

    this.add.text(780, 470, 'KAMAR MANDI', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#f59e0b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // ==============================================================
    // 5. PINTU KELUAR KE WORLD (EXIT DOOR) - Tengah Bawah
    // ==============================================================
    this.exitDoorZone = { x: 480, y: 670, width: 90, height: 40 };
    // Karpet selamat jalan
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(420, 630, 120, 40, 4);
    g.lineStyle(2, 0xf59e0b, 1);
    g.strokeRoundedRect(420, 630, 120, 40, 4);

    // Lubang pintu keluar
    g.fillStyle(0x0369a1, 1);
    g.fillRect(440, 665, 80, 25);

    this.add.text(480, 642, 'PINTU KELUAR', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  /**
   * Spawn karakter pemain di dalam rumah
   */
  private spawnPlayerInHouse(): void {
    if (this.player) {
      this.cameras.main.stopFollow();
      this.player.destroy();
      this.player = null;
    }

    // Posisi awal di tengah karpet ruang tamu rumah
    const startX = 480;
    const startY = 380;

    this.player = new Player(
      this,
      startX,
      startY,
      'local_player',
      this.playerName,
      this.currentAvatar,
      100,
      100
    );

    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.3); // Zoom lebih dekat agar interior rumah terasa nyaman

    // Emit koordinat dan stats langsung saat spawn agar HUD terisi seketika
    this.emitStats(startX, startY, 'RUMAH PRIBADI: RUANG UTAMA');

    this.time.delayedCall(600, () => {
      this.player?.showSpeechBubble('Rumah yang nyaman! Waktunya bersiap.');
    });
  }

  private emitStats(px: number, py: number, roomLabel: string): void {
    EventBus.emit('player-stats-updated', {
      x: Math.round(px),
      y: Math.round(py),
      gridX: Math.floor(px / 48),
      gridY: Math.floor(py / 48),
      name: this.playerName,
      avatar: this.currentAvatar,
      roomName: `${roomLabel} (SAFE: ${this.privateRoomId})`,
      inHouse: true,
      level: 1,
      privateRoomId: this.privateRoomId,
    });
  }

  /**
   * Mengecek kedekatan pemain dengan lemari, kasur, dapur, kamar mandi, atau pintu
   */
  public update(time: number, delta: number): void {
    if (!this.player) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y);

    const px = this.player.x;
    const py = this.player.y;

    // 1. Cek Pintu Keluar
    const distDoor = Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y);
    // 2. Cek Lemari
    const distWardrobe = Phaser.Math.Distance.Between(px, py, this.wardrobeZone.x, this.wardrobeZone.y);
    // 3. Cek Kasur
    const distBed = Phaser.Math.Distance.Between(px, py, this.bedZone.x, this.bedZone.y);
    // 4. Cek Dapur
    const distKitchen = Phaser.Math.Distance.Between(px, py, this.kitchenZone.x, this.kitchenZone.y);
    // 5. Cek Kamar Mandi
    const distBath = Phaser.Math.Distance.Between(px, py, this.bathroomZone.x, this.bathroomZone.y);

    let prompt: string | null = null;
    let roomLabel = 'RUMAH PRIBADI: RUANG TAMU';

    if (distDoor < 75) {
      prompt = 'TEKAN [E] / KLIK UNTUK KELUAR KE WORLD';
      roomLabel = 'RUMAH PRIBADI: PINTU KELUAR';
    } else if (distWardrobe < 75) {
      prompt = 'TEKAN [E] / KLIK UNTUK BUKA LEMARI (GANTI AVA)';
      roomLabel = 'RUMAH PRIBADI: LEMARI PAKAIAN';
    } else if (distBed < 80) {
      prompt = 'TEKAN [E] / KLIK UNTUK ISTIRAHAT DI KASUR';
      roomLabel = 'RUMAH PRIBADI: TEMPAT TIDUR';
    } else if (distKitchen < 80) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMASAK DI DAPUR';
      roomLabel = 'RUMAH PRIBADI: DAPUR';
    } else if (distBath < 80) {
      prompt = 'TEKAN [E] / KLIK UNTUK KE KAMAR MANDI';
      roomLabel = 'RUMAH PRIBADI: KAMAR MANDI';
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }

    // Emit koordinat pixel, koordinat grid (x, y) dan nama ruangan ke HUD secara andal
    if (time - this.lastStatsEmitTime > 60) {
      this.lastStatsEmitTime = time;
      this.emitStats(px, py, roomLabel);
    }
  }

  /**
   * Menjalankan aksi sesuai objek yang sedang didekati pemain
   */
  public triggerCurrentInteraction(): void {
    if (!this.player) return;
    const px = this.player.x;
    const py = this.player.y;

    // Cek Pintu Keluar -> Pindah ke WorldScene
    if (Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y) < 85) {
      this.player.showSpeechBubble('Menuju ke Open World...');
      this.time.delayedCall(400, () => {
        if (window.location.pathname !== '/world') {
          window.history.pushState(null, '', '/world');
        }
        EventBus.emit('url-changed', '/world');
        this.scene.start('WorldScene', {
          name: this.playerName,
          avatar: this.currentAvatar,
          spawnNearHouse: true,
          privateRoomId: this.privateRoomId,
        });
      });
      return;
    }

    // Cek Lemari -> Buka Modal Ganti Avatar
    if (Phaser.Math.Distance.Between(px, py, this.wardrobeZone.x, this.wardrobeZone.y) < 85) {
      EventBus.emit('open-wardrobe', this.currentAvatar);
      return;
    }

    // Cek Kasur -> Efek Tidur
    if (Phaser.Math.Distance.Between(px, py, this.bedZone.x, this.bedZone.y) < 90) {
      this.player.showSpeechBubble('Zzz... Istirahat sejenak di kasur empuk 💤');
      return;
    }

    // Cek Dapur -> Memasak
    if (Phaser.Math.Distance.Between(px, py, this.kitchenZone.x, this.kitchenZone.y) < 90) {
      this.player.showSpeechBubble('Memasak sup hangat di dapur 🍲');
      return;
    }

    // Cek Kamar Mandi -> Mandi
    if (Phaser.Math.Distance.Between(px, py, this.bathroomZone.x, this.bathroomZone.y) < 90) {
      this.player.showSpeechBubble('Segarnya mandi & cuci muka di kamar mandi 🚿');
      return;
    }
  }
}
