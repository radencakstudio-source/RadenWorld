/**
 * ============================================================================
 * FILE: resources/js/game/scenes/CafeScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Interior Raden Cafe & Lounge (Kawasan Kuliner Barat).
 * 
 * SPESIFIKASI:
 * 1. Skala Grid Sempurna: 1 Grid = 120px x 120px (16 x 11 petak = 1920px x 1320px).
 * 2. Bar Counter Kopi Mewah (gy: 2, gx: 4..11):
 *    - Barista Doni NPC dengan balon dialog ramah.
 *    - Mesin Espresso modern dengan animasi partikel uap kopi harum.
 *    - Etalase kaca berisi aneka kue Croissant & Donat mentega.
 *    - Mesin Kasir POS digital & toples biji kopi pilihan.
 *    - Deretan Kursi Bar Stool kayu rotan elegan (gy: 3).
 * 3. Area Meja & Tempat Duduk Cafe Pas Sesuai Grid (gy: 5 & gy: 8):
 *    - 8 Set Meja Makan Bundar dengan karpet amber hangat & kursi santai.
 *    - Cangkir kopi keramik & hidangan pastry di tiap meja.
 *    - Lampu gantung temaram (warm pendant glow) di atas meja.
 * 4. Fasilitas Sudut:
 *    - Mesin Vending Minuman Panas & Dingin di sisi barat/timur.
 *    - Tanaman hias Monstera & Ficus indoor pot keramik.
 *    - Jukebox musik jazz cafe di dinding kanan.
 * 5. Pintu Keluar: Terhubung kembali ke WorldScene di depan Raden Cafe (x: 420, y: 3180).
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { CameraController } from '../controllers/CameraController';
import { IAvatarCustomization, IPlayerData } from '../types';

export class CafeScene extends Phaser.Scene {
  private player: Player | null = null;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private networkManager: NetworkManager;
  public cameraController!: CameraController;
  private currentAvatar: IAvatarCustomization;
  private playerName: string = 'Petualang';
  private lastX: number = -1;
  private lastY: number = -1;

  // Dimensi Ruangan Tepat 16x11 Grid @ 120px
  public readonly roomWidth: number = 1920;  // 16 petak x 120px
  public readonly roomHeight: number = 1320; // 11 petak x 120px
  public readonly tileSize: number = 120;

  // Zona Interaksi
  private exitDoorZone!: { x: number; y: number; width: number; height: number };
  private barCounterZone!: { x: number; y: number };
  private returnX: number = 420;
  private returnY: number = 3180;

  private activePrompt: string | null = null;
  private isTransitioning: boolean = false;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  // Partikel uap kopi
  private steamParticles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'CafeScene' });
    this.networkManager = NetworkManager.getInstance();
    this.currentAvatar = {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  }

  public init(data?: {
    name?: string;
    avatar?: IAvatarCustomization;
    returnX?: number;
    returnY?: number;
  }): void {
    this.isTransitioning = false;
    this.player = null as any;
    this.remotePlayers.clear();

    if (data?.name) this.playerName = data.name;
    if (data?.avatar) this.currentAvatar = data.avatar;
    if (typeof data?.returnX === 'number') this.returnX = data.returnX;
    if (typeof data?.returnY === 'number') this.returnY = data.returnY;
  }

  public create(): void {
    // 0. Sisi luar ruangan (kiri, kanan, atas, bawah) diberi latar belakang cokelat hangat
    this.cameras.main.setBackgroundColor('#2c1810');
    const outerBg = this.add.graphics();
    outerBg.fillStyle(0x2c1810, 1);
    outerBg.fillRect(-3000, -3000, this.roomWidth + 6000, this.roomHeight + 6000);
    outerBg.setDepth(-999);

    // 1. Batas fisika ruangan
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.obstacles = this.physics.add.staticGroup();

    // 2. Siapkan tekstur prosedural
    this.ensureCafeTextures();

    // 3. Render Lantai Parquet Kayu Hangat Sempurna
    this.add.tileSprite(0, 0, this.roomWidth, this.roomHeight, 'cafe-floor-tile')
      .setOrigin(0, 0)
      .setDepth(-100);

    // 4. Render Dinding Atas, Banner Neon & Menu Chalkboard (gy: 0 s/d 1)
    this.renderCafeWalls();

    // 5. Render Bar Counter Mewah & Doni Barista (gy: 2)
    this.renderBarCounter();

    // 6. Render Set Meja & Kursi yang Pas Aligned dengan Grid (gy: 5 & gy: 8)
    this.renderGridDiningTables();

    // 7. Render Fasilitas Sudut & Tanaman Hias
    this.renderSideAmenities();

    // 8. Render Pintu Keluar di Bawah Tengah (gx: 7.5, gy: 10)
    this.exitDoorZone = { x: this.roomWidth / 2, y: this.roomHeight - 60, width: 240, height: 120 };
    this.renderExitDoor();

    // 9. Spawn Pemain di Lorong Tengah Dekat Pintu
    this.spawnPlayerInCafe();

    // 10. Hubungkan ke Server Multiplayer Room 'cafe'
    const spawnX = this.player?.x || this.roomWidth / 2;
    const spawnY = this.player?.y || (this.roomHeight - 160);

    const isSuperAdmin = this.playerName?.toUpperCase() === 'RADEN';
    if (!this.networkManager.getSocketId()) {
      let savedGold = 2500;
      let savedDiamonds = 50;
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
        'cafe'
      );
    } else {
      this.networkManager.switchRoom('cafe', spawnX, spawnY);
    }

    this.setupMultiplayerListeners();

    // Minta snapshot pemain yang sudah ada di room cafe
    this.time.delayedCall(150, () => this.networkManager.requestRoomPlayers());
    this.time.delayedCall(500, () => this.networkManager.requestRoomPlayers());
    this.time.delayedCall(1200, () => this.networkManager.requestRoomPlayers());

    // 11. Setup Kamera Follow
    this.cameraController = new CameraController(this);
    if (this.player) {
      this.cameraController.follow(this.player);
      this.cameraController.setBounds(0, 0, this.roomWidth, this.roomHeight);
    }
    this.cameras.main.setZoom(1.0);

    // 12. Setup Input & Interaksi
    this.setupInputs();

    // 13. Beritahu HUD lokasi saat ini
    EventBus.emit('location-updated', 'KAWASAN KULINER: RADEN CAFE & LOUNGE (INTERIOR)');
    EventBus.emit('url-changed', '/world/cafe');

    // 14. Event Bus Listeners
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

    const cleanupCafe = () => {
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.off('trigger-interaction', onTriggerInteraction);
      EventBus.emit('interaction-prompt', null);
      this.steamParticles.forEach((p) => p.destroy());
      this.steamParticles = [];

      this.remotePlayers.forEach((r) => r.destroy());
      this.remotePlayers.clear();
    };

    this.events.once('shutdown', cleanupCafe);
    this.events.once('destroy', cleanupCafe);

    EventBus.emit('scene-ready', 'CafeScene');
  }

  public update(time: number, delta: number): void {
    this.cameraController?.update(time, delta);
    if (!this.player || !this.player.active || this.isTransitioning) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y + 60);
    this.checkProximityPrompt();

    // Kirim posisi pergerakan pemain lokal ke server
    const isMoving = this.player.getIsMoving();
    if (isMoving || Math.abs(this.player.x - this.lastX) > 1 || Math.abs(this.player.y - this.lastY) > 1) {
      this.lastX = this.player.x;
      this.lastY = this.player.y;
      this.networkManager.sendMovement(
        this.player.x,
        this.player.y,
        this.player.getDirection(),
        isMoving
      );
    }

    // Perbarui posisi & animasi seluruh pemain lain di cafe
    this.remotePlayers.forEach((remote) => {
      if (remote.active) {
        remote.update(time, delta);
        remote.setDepth(remote.y + 60);
      }
    });
  }

  /**
   * Menyiapkan tekstur prosedural lantai parquet cokelat hangat bertekstur
   */
  private ensureCafeTextures(): void {
    if (!this.textures.exists('cafe-floor-tile')) {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Pola parquet papan catur kayu cokelat hangat
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(0, 0, 240, 240);

        ctx.fillStyle = '#3d2314';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillRect(120, 120, 120, 120);

        ctx.fillStyle = '#4e2d19';
        ctx.fillRect(120, 0, 120, 120);
        ctx.fillRect(0, 120, 120, 120);

        // Garis batas petak grid
        ctx.strokeStyle = '#1b0d07';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, 120, 120);
        ctx.strokeRect(120, 0, 120, 120);
        ctx.strokeRect(0, 120, 120, 120);
        ctx.strokeRect(120, 120, 120, 120);

        // Serat papan kayu halus
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let y = 15; y < 240; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(240, y);
          ctx.stroke();
        }

        this.textures.addCanvas('cafe-floor-tile', canvas);
      }
    }
  }

  /**
   * Helper penambahan rintangan fisik presisi grid
   */
  private addGridObstacle(gx: number, gy: number, gw: number, gh: number): Phaser.GameObjects.Zone {
    const ts = this.tileSize;
    const px = gx * ts + (gw * ts) / 2;
    const py = gy * ts + (gh * ts) / 2;
    const pw = gw * ts;
    const ph = gh * ts;

    const zone = this.add.zone(px, py, pw, ph);
    this.physics.add.existing(zone, true);
    this.obstacles.add(zone);
    return zone;
  }

  /**
   * Render Dinding Atas Cafe, Papan Chalkboard Menu & Neon Banner
   */
  private renderCafeWalls(): void {
    const ts = this.tileSize;
    const wallH = ts * 1.5; // 180px

    const wallG = this.add.graphics();
    // Tembok bata ekspos cokelat tua
    wallG.fillStyle(0x1a0e09, 1);
    wallG.fillRect(0, 0, this.roomWidth, wallH);

    // List kayu mahogany & kuningan
    wallG.fillStyle(0x6b3a20, 1);
    wallG.fillRect(0, wallH - 14, this.roomWidth, 14);
    wallG.fillStyle(0xd97706, 1);
    wallG.fillRect(0, wallH - 4, this.roomWidth, 4);
    wallG.setDepth(-80);

    // Dinding Keliling Obstacle (Atas 2.2 baris petak / 264px penuh agar avatar tidak tertimpa dinding, Kiri, Kanan)
    this.addGridObstacle(0, 0, 16, 2.2);
    this.addGridObstacle(0, 0, 1, 11);
    this.addGridObstacle(15, 0, 1, 11);

    // Papan Chalkboard Menu Kiri (gx: 1.5..3.5, gy: 0.3)
    const boardL = this.add.graphics();
    boardL.fillStyle(0x3f2214, 1);
    boardL.fillRoundedRect(180, 25, 240, 100, 6);
    boardL.fillStyle(0x111827, 1);
    boardL.fillRoundedRect(186, 31, 228, 88, 4);
    boardL.setDepth(-70);

    this.add.text(300, 45, '☕ COFFEE SPECIALS', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '11px',
      color: '#fde047',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(-65);

    this.add.text(300, 75, '• Kopi Tubruk Gayo 20K\n• Cappuccino Cream 28K\n• Caramel Macchiato 32K', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '9px',
      color: '#e2e8f0',
      lineSpacing: 3,
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(-65);

    // Papan Chalkboard Menu Kanan (gx: 12.5..14.5, gy: 0.3)
    const boardR = this.add.graphics();
    boardR.fillStyle(0x3f2214, 1);
    boardR.fillRoundedRect(this.roomWidth - 420, 25, 240, 100, 6);
    boardR.fillStyle(0x111827, 1);
    boardR.fillRoundedRect(this.roomWidth - 414, 31, 228, 88, 4);
    boardR.setDepth(-70);

    this.add.text(this.roomWidth - 300, 45, '🥐 BAKERY & SNACKS', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '11px',
      color: '#f59e0b',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(-65);

    this.add.text(this.roomWidth - 300, 75, '• Butter Croissant 18K\n• Choco Donut Glaze 15K\n• Cheese Danish Melt 22K', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '9px',
      color: '#e2e8f0',
      lineSpacing: 3,
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(-65);

    // Neon Emblem Utama Cafe di Tengah (gx: 6..10, y: 30..115)
    const neonBg = this.add.graphics();
    neonBg.fillStyle(0x0f0906, 0.95);
    neonBg.fillRoundedRect(this.roomWidth / 2 - 250, 20, 500, 95, 12);
    neonBg.lineStyle(3, 0xf59e0b, 1);
    neonBg.strokeRoundedRect(this.roomWidth / 2 - 246, 24, 492, 87, 10);
    neonBg.setDepth(-60);

    const titleText = this.add.text(this.roomWidth / 2, 55, '☕ RADEN CAFE & LOUNGE 🥐', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '22px',
      color: '#fef08a',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(-55);

    const subText = this.add.text(this.roomWidth / 2, 85, 'PREMIUM ARTISAN COFFEE • FRESH BAKERY • WI-FI HIGH SPEED', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '10px',
      color: '#f59e0b',
      letterSpacing: 2,
    }).setOrigin(0.5, 0.5).setDepth(-55);

    this.tweens.add({
      targets: [titleText, subText],
      alpha: { from: 0.88, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Render Bar Counter Mewah yang Pas Pada Grid (gy: 2, gx: 4..11)
   */
  private renderBarCounter(): void {
    const ts = this.tileSize;
    const startGx = 4;
    const countGw = 8; // gx: 4 s/d 11 (lebar 960px)
    const gy = 2; // y: 240..360

    const barX = startGx * ts;
    const barY = gy * ts;
    const barW = countGw * ts;
    const barH = ts; // 120px

    this.barCounterZone = { x: this.roomWidth / 2, y: barY + barH + 40 };

    // 1. Dinding Belakang Bar: Rak Botol Sirup & Toples Kopi (gy: 1)
    const shelfG = this.add.graphics();
    shelfG.fillStyle(0x3b1d11, 1);
    shelfG.fillRect(barX + 30, barY - 70, barW - 60, 20);
    shelfG.fillStyle(0x1e293b, 1);
    for (let bx = barX + 60; bx < barX + barW - 60; bx += 50) {
      shelfG.fillStyle(bx % 100 === 0 ? 0xd97706 : 0x0284c7, 0.9);
      shelfG.fillRect(bx, barY - 100, 16, 30); // Botol sirup
      shelfG.fillStyle(0xfde047, 1);
      shelfG.fillRect(bx + 4, barY - 106, 8, 6); // Tutup botol
    }
    shelfG.setDepth(-50);

    // 2. Bar Counter Body (gy: 2)
    const barG = this.add.graphics();
    // Shadow
    barG.fillStyle(0x0a0503, 0.6);
    barG.fillRoundedRect(barX, barY + barH - 8, barW, 20, 6);

    // Meja Kayu Jati Solid
    barG.fillStyle(0x451a03, 1);
    barG.fillRoundedRect(barX, barY + 15, barW, barH - 15, 8);

    // Marble Top Marmer Amber
    barG.fillStyle(0x78350f, 1);
    barG.fillRoundedRect(barX - 10, barY, barW + 20, 36, 6);
    barG.fillStyle(0xf59e0b, 1);
    barG.fillRect(barX - 10, barY + 32, barW + 20, 4); // Aksen emas

    barG.setDepth(barY + barH);

    // 3. Mesin Kopi Espresso Modern di Atas Counter (gx: 5..6)
    const espX = barX + 180;
    const espY = barY + 10;
    const espG = this.add.graphics();
    espG.fillStyle(0x0f172a, 1);
    espG.fillRoundedRect(espX - 45, espY - 45, 90, 50, 6);
    espG.fillStyle(0x38bdf8, 1);
    espG.fillRect(espX - 35, espY - 35, 30, 16); // Layar digital
    espG.fillStyle(0xef4444, 1);
    espG.fillCircle(espX + 15, espY - 30, 5); // Tombol merah
    espG.fillStyle(0x22c55e, 1);
    espG.fillCircle(espX + 30, espY - 30, 5); // Tombol hijau
    espG.fillStyle(0x94a3b8, 1);
    espG.fillRect(espX - 25, espY + 5, 50, 8); // Nozzle drip
    espG.setDepth(barY + barH + 5);

    // Animasi Uap Kopi Harum Menggepul dari Mesin Espresso
    this.createCoffeeSteam(espX, espY - 50);

    // 4. Etalase Kaca Pastry & Kue Hangat di Tengah (gx: 7.5..8.5)
    const pasX = this.roomWidth / 2;
    const pasY = barY + 12;
    const pasG = this.add.graphics();
    pasG.fillStyle(0x0284c7, 0.45);
    pasG.fillRoundedRect(pasX - 80, pasY - 40, 160, 42, 6);
    pasG.lineStyle(2, 0x38bdf8, 0.8);
    pasG.strokeRoundedRect(pasX - 80, pasY - 40, 160, 42, 6);

    // Kue Croissant & Donat di dalam etalase
    pasG.fillStyle(0xd97706, 1);
    pasG.fillCircle(pasX - 50, pasY - 18, 9);
    pasG.fillCircle(pasX - 15, pasY - 18, 9);
    pasG.fillStyle(0x78350f, 1);
    pasG.fillCircle(pasX + 20, pasY - 18, 9); // Donat cokelat
    pasG.fillCircle(pasX + 55, pasY - 18, 9);
    pasG.setDepth(barY + barH + 5);

    // 5. Mesin Kasir Register Canggih di Sisi Kanan (gx: 10)
    const posX = barX + barW - 180;
    const posY = barY + 12;
    const posG = this.add.graphics();
    posG.fillStyle(0x1e293b, 1);
    posG.fillRoundedRect(posX - 35, posY - 40, 70, 42, 4);
    posG.fillStyle(0x10b981, 1);
    posG.fillRect(posX - 25, posY - 34, 50, 20); // Monitor kasir
    posG.setDepth(barY + barH + 5);

    // 6. Barista Doni NPC Berdiri di Belakang Meja Bar (gx: 8, gy: 1.5)
    const barista = this.add.image(this.roomWidth / 2, barY - 20, 'npc-penjaga-pasar')
      .setDisplaySize(96, 168)
      .setDepth(barY + 10);

    this.add.text(this.roomWidth / 2, barY - 110, '☕ Barista Doni', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '12px',
      color: '#fef08a',
      backgroundColor: '#000000dd',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0.5).setDepth(barY + 25);

    // 7. Daftarkan Rintangan Fisik Meja Bar (gx: 4..11, gy: 2)
    this.addGridObstacle(startGx, gy, countGw, 1);

    // 8. Deretan Kursi Bar Stool kayu rotan di Depan Meja (gy: 3, pas di tiap kolom)
    for (let c = startGx; c < startGx + countGw; c++) {
      const stoolCenterX = (c + 0.5) * ts;
      const stoolCenterY = (gy + 1) * ts + 40; // gy: 3
      this.renderBarStool(stoolCenterX, stoolCenterY);
    }
  }

  /**
   * Render Bar Stool bundar rotan mewah
   */
  private renderBarStool(x: number, y: number): void {
    const g = this.add.graphics();
    g.fillStyle(0x0a0503, 0.45);
    g.fillEllipse(x, y + 26, 38, 14); // Bayangan lantai
    g.fillStyle(0x5c2e0b, 1);
    g.fillCircle(x, y, 19); // Bantalan kursi
    g.fillStyle(0xb45309, 1);
    g.fillCircle(x, y, 14);
    g.fillStyle(0x64748b, 1);
    g.fillRect(x - 3, y + 6, 6, 20); // Tiang besi
    g.fillStyle(0x334155, 1);
    g.fillCircle(x, y + 24, 12); // Kaki piringan tiang
    g.setDepth(y);
  }

  /**
   * Animasi uap kopi mengepul hangat
   */
  private createCoffeeSteam(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      const p = this.add.circle(x + (i - 1.5) * 6, y, 4, 0xffffff, 0.65).setDepth(1000);
      this.steamParticles.push(p);

      this.tweens.add({
        targets: p,
        y: y - 28,
        x: p.x + (Math.random() * 8 - 4),
        alpha: 0,
        scale: 1.8,
        duration: 1200 + i * 200,
        delay: i * 250,
        repeat: -1,
        ease: 'Sine.easeOut',
      });
    }
  }

  /**
   * Render 8 Set Meja & Kursi Cafe yang Pas Sesuai Grid:
   * Baris 1: gy: 5 (y: 600..720) pada kolom gx: 1.5, 5, 9.5, 13
   * Baris 2: gy: 8 (y: 960..1080) pada kolom gx: 1.5, 5, 9.5, 13
   */
  private renderGridDiningTables(): void {
    const ts = this.tileSize;

    // Koordinat pusat grid yang seimbang:
    // Sisi Kiri (Barat): gx: 2 & gx: 5.5
    // Sisi Kanan (Timur): gx: 9.5 & gx: 13
    // Lorong tengah (gx: 7..8) tetap lapang & bebas hambatan untuk jalan ke Doni!
    const tableGridSpots = [
      // Baris 1 Meja (gy: 5)
      { gx: 2,   gy: 5, hasCroissant: true },
      { gx: 5.5, gy: 5, hasCroissant: false },
      { gx: 9.5, gy: 5, hasCroissant: true },
      { gx: 13,  gy: 5, hasCroissant: false },

      // Baris 2 Meja (gy: 8)
      { gx: 2,   gy: 8, hasCroissant: false },
      { gx: 5.5, gy: 8, hasCroissant: true },
      { gx: 9.5, gy: 8, hasCroissant: false },
      { gx: 13,  gy: 8, hasCroissant: true },
    ];

    tableGridSpots.forEach(({ gx, gy, hasCroissant }) => {
      const centerX = gx * ts + ts / 2;
      const centerY = gy * ts + ts / 2;

      this.renderDiningTableSet(centerX, centerY, hasCroissant);

      // Collider meja pas 1x1 petak di tengahnya
      const tObs = this.add.zone(centerX, centerY, 84, 84);
      this.physics.add.existing(tObs, true);
      this.obstacles.add(tObs);
    });
  }

  /**
   * Render 1 Set Meja Makan Bundar dengan 2 Kursi Empuk, Lampu Gantung, dan Kopi
   */
  private renderDiningTableSet(cx: number, cy: number, hasCroissant: boolean): void {
    // 1. Karpet Bundar Amber Halus di Bawah Meja
    const rug = this.add.graphics();
    rug.fillStyle(0x78350f, 0.4);
    rug.fillCircle(cx, cy, 75);
    rug.lineStyle(2, 0xd97706, 0.6);
    rug.strokeCircle(cx, cy, 75);
    rug.setDepth(cy - 40);

    // 2. Kursi Sandaran Empuk Kiri & Kanan (gx-0.5 & gx+0.5)
    this.renderCozyChair(cx - 56, cy, 'right');
    this.renderCozyChair(cx + 56, cy, 'left');

    // 3. Meja Kayu Bundar Jati Berkualitas
    const tableG = this.add.graphics();
    tableG.fillStyle(0x0a0503, 0.5);
    tableG.fillCircle(cx, cy + 8, 44); // Bayangan meja

    tableG.fillStyle(0x451a03, 1);
    tableG.fillCircle(cx, cy, 42); // Daun meja
    tableG.fillStyle(0x78350f, 1);
    tableG.fillCircle(cx, cy, 38);
    tableG.lineStyle(2, 0xf59e0b, 0.9);
    tableG.strokeCircle(cx, cy, 38); // List keemasan meja

    // 4. Cangkir Kopi Keramik & Uap
    tableG.fillStyle(0xffffff, 1);
    tableG.fillCircle(cx - 10, cy - 6, 7); // Cangkir
    tableG.fillStyle(0x3e1f14, 1);
    tableG.fillCircle(cx - 10, cy - 6, 5); // Kopi hitam
    tableG.fillStyle(0xffffff, 1);
    tableG.fillRect(cx - 19, cy - 8, 3, 5); // Gagang cangkir

    // 5. Piring Croissant Jika Ada
    if (hasCroissant) {
      tableG.fillStyle(0xf1f5f9, 0.9);
      tableG.fillCircle(cx + 12, cy - 4, 11); // Piring
      tableG.fillStyle(0xd97706, 1);
      tableG.fillEllipse(cx + 12, cy - 4, 14, 8); // Croissant
    }

    tableG.setDepth(cy + 10);

    // 6. Lampu Gantung Warm Amber di Atas Tiap Meja (Pendant Lamp Glow)
    const lampG = this.add.graphics();
    lampG.fillStyle(0xfef08a, 0.12);
    lampG.fillCircle(cx, cy, 110); // Lingkaran cahaya hangat
    lampG.setDepth(cy - 35);
  }

  /**
   * Render Kursi Cafe Kayu dengan Sandaran Empuk
   */
  private renderCozyChair(x: number, y: number, facing: 'left' | 'right'): void {
    const cg = this.add.graphics();
    cg.fillStyle(0x0a0503, 0.35);
    cg.fillCircle(x, y + 16, 20); // Shadow

    cg.fillStyle(0x3b1d11, 1);
    cg.fillRoundedRect(x - 18, y - 18, 36, 36, 6); // Dudukan kayu
    cg.fillStyle(0x991b1b, 1);
    cg.fillRoundedRect(x - 14, y - 14, 28, 28, 4); // Bantalan merah marun mewah

    // Sandaran kursi
    cg.fillStyle(0x451a03, 1);
    if (facing === 'right') {
      cg.fillRect(x - 20, y - 22, 6, 44);
    } else {
      cg.fillRect(x + 14, y - 22, 6, 44);
    }
    cg.setDepth(y - 5);
  }

  /**
   * Render Fasilitas Samping: Vending Machines, Tanaman Monstera, Jukebox
   */
  private renderSideAmenities(): void {
    const ts = this.tileSize;

    // 1. Mesin Vending Kopi Panas (gx: 1, gy: 2)
    if (this.textures.exists('vending-red')) {
      this.add.image(1.5 * ts, 2.5 * ts, 'vending-red').setDisplaySize(100, 180).setDepth(2.5 * ts);
    } else {
      const vG = this.add.graphics();
      vG.fillStyle(0xb91c1c, 1);
      vG.fillRoundedRect(1 * ts + 15, 2 * ts, 90, 140, 8);
      vG.setDepth(2.5 * ts);
    }
    this.addGridObstacle(1, 2, 1, 1.2);

    // 2. Mesin Vending Minuman Dingin (gx: 14, gy: 2)
    if (this.textures.exists('vending-blue')) {
      this.add.image(14.5 * ts, 2.5 * ts, 'vending-blue').setDisplaySize(100, 180).setDepth(2.5 * ts);
    } else {
      const vG2 = this.add.graphics();
      vG2.fillStyle(0x0284c7, 1);
      vG2.fillRoundedRect(14 * ts + 15, 2 * ts, 90, 140, 8);
      vG2.setDepth(2.5 * ts);
    }
    this.addGridObstacle(14, 2, 1, 1.2);

    // 3. Tanaman Indoor Monstera Sudut Kiri Bawah (gx: 1, gy: 9.5)
    this.renderIndoorPlant(1.5 * ts, 9.8 * ts);
    this.addGridObstacle(1, 9.5, 1, 1);

    // 4. Tanaman Indoor Ficus Sudut Kanan Bawah (gx: 14, gy: 9.5)
    this.renderIndoorPlant(14.5 * ts, 9.8 * ts);
    this.addGridObstacle(14, 9.5, 1, 1);

    // 5. Jukebox Musik Klasik di Dinding Kanan (gx: 14, gy: 5)
    const jx = 14.5 * ts;
    const jy = 5.5 * ts;
    const jG = this.add.graphics();
    jG.fillStyle(0x581c87, 1);
    jG.fillRoundedRect(jx - 35, jy - 50, 70, 100, 10);
    jG.fillStyle(0xf59e0b, 1);
    jG.strokeRoundedRect(jx - 33, jy - 48, 66, 96, 8);
    jG.fillStyle(0xec4899, 0.85);
    jG.fillCircle(jx, jy - 15, 18);
    jG.setDepth(jy);

    this.add.text(jx, jy - 65, '🎵 JUKEBOX', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '10px',
      color: '#fef08a',
      backgroundColor: '#000000bb',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5, 0.5).setDepth(jy + 5);

    this.addGridObstacle(14, 5, 1, 1);
  }

  /**
   * Render Tanaman Pot Indoor Estetik
   */
  private renderIndoorPlant(x: number, y: number): void {
    const pg = this.add.graphics();
    // Pot keramik terakota
    pg.fillStyle(0x0a0503, 0.4);
    pg.fillEllipse(x, y + 20, 40, 14);
    pg.fillStyle(0xc2410c, 1);
    pg.fillRoundedRect(x - 24, y - 10, 48, 30, 4);
    pg.fillStyle(0x7c2d12, 1);
    pg.fillRect(x - 26, y - 14, 52, 6);

    // Daun Monstera Hijau Rimbun
    pg.fillStyle(0x15803d, 1);
    pg.fillCircle(x - 12, y - 26, 16);
    pg.fillCircle(x + 12, y - 26, 16);
    pg.fillStyle(0x22c55e, 1);
    pg.fillCircle(x, y - 36, 18);
    pg.setDepth(y + 10);
  }

  /**
   * Render Pintu Keluar di Bawah Tengah (gx: 7..8, gy: 10)
   */
  private renderExitDoor(): void {
    const doorX = this.exitDoorZone.x;
    const doorY = this.exitDoorZone.y;

    // Karpet merah penyambutan menuju pintu
    const rug = this.add.graphics();
    rug.fillStyle(0x991b1b, 0.85);
    rug.fillRect(doorX - 100, doorY - 140, 200, 140);
    rug.lineStyle(3, 0xf59e0b, 0.9);
    rug.strokeRect(doorX - 100, doorY - 140, 200, 140);
    rug.setDepth(-50);

    // Pintu Kaca Berbingkai Kayu
    const doorG = this.add.graphics();
    doorG.fillStyle(0x1e293b, 0.95);
    doorG.fillRoundedRect(doorX - 90, doorY - 24, 180, 48, 8);
    doorG.lineStyle(3, 0xf59e0b, 1);
    doorG.strokeRoundedRect(doorX - 90, doorY - 24, 180, 48, 8);
    doorG.setDepth(doorY - 5);

    this.add.text(doorX, doorY, '🚪 PINTU KELUAR KE KOTA', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '12px',
      color: '#fef3c7',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(doorY);

    // Dinding Bawah Kiri & Kanan (Menyisakan lubang pintu gx: 7..8)
    const btmLeftW = doorX - 110;
    const btmLeft = this.add.zone(btmLeftW / 2, this.roomHeight - 15, btmLeftW, 30);
    this.physics.add.existing(btmLeft, true);
    this.obstacles.add(btmLeft);

    const btmRightX = doorX + 110;
    const btmRightW = this.roomWidth - btmRightX;
    const btmRight = this.add.zone(btmRightX + btmRightW / 2, this.roomHeight - 15, btmRightW, 30);
    this.physics.add.existing(btmRight, true);
    this.obstacles.add(btmRight);
  }

  /**
   * Spawn Pemain di Lorong Tengah Menghadap ke Barista Doni
   */
  private spawnPlayerInCafe(): void {
    const spawnX = this.roomWidth / 2; // 960 (Tepat di tengah karpet merah)
    const spawnY = this.roomHeight - 160;

    this.player = new Player(
      this,
      spawnX,
      spawnY,
      'local_player',
      this.playerName,
      this.currentAvatar,
      100,
      100
    );
    this.player.setDirection('up');
    this.physics.add.collider(this.player, this.obstacles);

    this.player.showSpeechBubble('☕ Wah, wangi kopi nusantaranya nikmat sekali! Tempatnya sangat nyaman ✨', 3000);
  }

  /**
   * Setup Input Controls (Keyboard E & Klik Lantai / Remote Player)
   */
  private setupInputs(): void {
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
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
      if (this.player?.isMovementLocked()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;
      if (wx < 60 || wx > this.roomWidth - 60 || wy < 60 || wy > this.roomHeight - 60) return;

      // 1. Cek apakah pemain menekan/mengklik pemain lain di cafe (Remote Player)
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
            bio: raw.bio || raw.description || 'Sedang nongkrong santai di Raden Cafe ☕',
            location: 'Cafe Raden Lounge',
            gold: isTargetAdmin ? 99999999999 : 2500,
            diamonds: isTargetAdmin ? 99999999999 : 50,
          });
          return;
        }
      }

      if (this.player && this.player.active) {
        this.spawnTapRipple(wx, wy);
        this.player.navigateTo(wx, wy);
      }
    });
  }

  /**
   * Cek Prompt Interaksi Jarak Dekat
   */
  private checkProximityPrompt(): void {
    if (!this.player) return;

    const px = this.player.x;
    const py = this.player.y;

    const distExit = Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y);
    const distBar = Phaser.Math.Distance.Between(px, py, this.barCounterZone.x, this.barCounterZone.y);

    let prompt: string | null = null;

    if (distExit < 140) {
      prompt = 'TEKAN [E] / KLIK UNTUK KEMBALI KE KOTA 🚪';
    } else if (distBar < 150) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMESAN KOPI KE BARISTA DONI ☕';
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }
  }

  /**
   * Eksekusi Interaksi Tombol [E]
   */
  private triggerCurrentInteraction(): void {
    if (!this.player || this.isTransitioning) return;

    const px = this.player.x;
    const py = this.player.y;

    const distExit = Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y);
    const distBar = Phaser.Math.Distance.Between(px, py, this.barCounterZone.x, this.barCounterZone.y);

    if (distExit < 150) {
      this.exitCafe();
    } else if (distBar < 160) {
      SoundManager.getInstance().playClick();
      const phrases = [
        '☕ "Kopi Tubruk Gayo atau Cappuccino hangat siap disajikan! Nikmati waktumu di Raden Cafe!"',
        '🥐 "Baru matang nih, Croissant butter renyah dengan selai cokelat hazelnut!"',
        '✨ "Mau duduk santai di meja tengah atau sambil kerja di meja bar? Semua spot ada Wi-Fi kencang!"',
        '🧊 "Ada juga Iced Caramel Macchiato segar untuk menyegarkan harimu!"',
      ];
      const picked = phrases[Math.floor(Math.random() * phrases.length)];
      this.player.showSpeechBubble(picked, 3500);
    }
  }

  /**
   * Kembali ke WorldScene di Depan Raden Cafe
   */
  private exitCafe(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    SoundManager.getInstance().playClick();
    this.player?.showSpeechBubble('Keluar ke kota...', 1000);

    // Berpindah kembali ke room 'world' di server game
    this.networkManager.switchRoom('world', this.returnX, this.returnY + 60);

    this.time.delayedCall(300, () => {
      window.history.pushState(null, '', '/world');
      EventBus.emit('url-changed', '/world');
      this.cameras.main.stopFollow();
      this.scene.start('WorldScene', {
        name: this.player?.getEntityName() || this.playerName,
        avatar: this.player?.getAvatar() || this.currentAvatar,
        spawnPos: { x: this.returnX, y: this.returnY + 60 },
      });
    });
  }

  /**
   * Listener sinkronisasi jaringan antar pemain di dalam cafe
   */
  private setupMultiplayerListeners(): void {
    this.networkManager.onWorldInit((data) => {
      if (data && data.players) {
        data.players.forEach((p) => {
          if (p.id !== this.networkManager.getSocketId()) {
            this.addRemotePlayer(p);
          }
        });
      }
    });

    this.networkManager.onPlayerJoined((p) => {
      if (p.id !== this.networkManager.getSocketId()) {
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

  /**
   * Menambahkan entitas pemain lain di cafe
   */
  private addRemotePlayer(p: IPlayerData): void {
    if (this.remotePlayers.has(p.id)) {
      const existing = this.remotePlayers.get(p.id)!;
      existing.destroy();
      this.remotePlayers.delete(p.id);
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
        p.hp || 100,
        p.maxHp || 100
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
          level: isTargetAdmin ? 99999999999 : ((p as any).level || 1),
          role: isTargetAdmin ? 'super_admin' : (p.role || 'player'),
          isSuperAdmin: isTargetAdmin,
          title: isTargetAdmin ? '👑 KREATOR & SUPER ADMIN' : ((p as any).title || 'Petualang'),
          likes: isTargetAdmin ? 99999999999 : (typeof (p as any).likes === 'number' ? (p as any).likes : 12),
          friendsCount: isTargetAdmin ? 999 : ((p as any).friendsCount ?? 0),
          followingCount: isTargetAdmin ? 999 : ((p as any).followingCount ?? 0),
          followersCount: isTargetAdmin ? 999 : ((p as any).followersCount ?? 0),
          bio: (p as any).bio || (p as any).description || 'Sedang nongkrong santai di Raden Cafe ☕',
          location: 'Cafe Raden Lounge',
          gold: isTargetAdmin ? 99999999999 : (typeof p.gold === 'number' ? p.gold : 2500),
          diamonds: isTargetAdmin ? 99999999999 : (typeof p.diamonds === 'number' ? p.diamonds : 50),
        });
      });

      this.remotePlayers.set(p.id, remote);
    } catch (err) {
      console.warn('[CafeScene] Gagal menambahkan remote player:', err);
    }
  }

  private spawnTapRipple(x: number, y: number): void {
    const circle = this.add.circle(x, y, 6, 0xf59e0b, 0.85).setDepth(2000);
    this.tweens.add({
      targets: circle,
      radius: 26,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => circle.destroy(),
    });
  }
}
