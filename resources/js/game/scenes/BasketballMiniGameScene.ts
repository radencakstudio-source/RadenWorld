/**
 * ============================================================================
 * FILE: resources/js/game/scenes/BasketballMiniGameScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Mini Game Bola Basket 1 vs 1 bergaya arcade HEAD BASKETBALL.
 * 
 * FITUR UTAMA:
 * 1. Tangan & Kaki Fungsional: Bisa tinju (punch), tendang (kick), tembak (shoot), dan slam dunk.
 * 2. Sundulan Kepala (Header): Bola basket yang mengenai kepala akan disundul membal ke arah ring lawan.
 * 3. Fisika Bola Realistis: Restitusi pantulan lantai kayu, putaran bola (spin), dan redaman jaring net.
 * 4. Double Jump (Lompat 2x): Bisa melompat 2 kali ke udara untuk rebound tinggi & slam dunk spektakuler.
 * 5. Dash Forward & Dash Backward: Dash melesat maju atau mundur menghindar.
 * 6. 3 Mode: Latihan Bebas (Practice), PVP (2 Pemain), dan Bot AI.
 * ============================================================================
 */

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { IAvatarCustomization } from '../types';

export class BasketballMiniGameScene extends Phaser.Scene {
  private mode: 'practice' | 'pvp' | 'ai' = 'ai';
  private playerName: string = 'Petualang';
  private playerAvatar: IAvatarCustomization | null = null;
  private opponentName: string = 'BOT AI';
  private opponentServer: string = '';
  private opponentPvpStreak: number = 0;
  private opponentPvpSticks: number = 0;
  private returnX: number = 6060;
  private returnY: number = 6040;

  // Objek Fisika & Karakter Player 1
  private p1!: Phaser.GameObjects.Container;
  private p1Body!: Phaser.Physics.Arcade.Body;
  private p1Head!: Phaser.GameObjects.Arc;
  private p1Arm!: Phaser.GameObjects.Rectangle;
  private p1Fist!: Phaser.GameObjects.Arc;
  private p1Leg!: Phaser.GameObjects.Rectangle;
  private p1Foot!: Phaser.GameObjects.Rectangle;
  private p1IsShooting: boolean = false;
  private p1IsPunching: boolean = false;
  private p1IsKicking: boolean = false;
  private p1CanDash: boolean = true;
  private p1JumpCount: number = 0;
  private p1IsDashing: boolean = false;
  private p1DashEndTime: number = 0;
  private p1LastLeftTapTime: number = 0;
  private p1LastRightTapTime: number = 0;
  private readonly DOUBLE_TAP_WINDOW: number = 280;

  // Objek Fisika & Karakter Player 2 / AI
  private p2!: Phaser.GameObjects.Container;
  private p2Body!: Phaser.Physics.Arcade.Body;
  private p2Head!: Phaser.GameObjects.Arc;
  private p2Arm!: Phaser.GameObjects.Rectangle;
  private p2Fist!: Phaser.GameObjects.Arc;
  private p2Leg!: Phaser.GameObjects.Rectangle;
  private p2Foot!: Phaser.GameObjects.Rectangle;
  private p2IsShooting: boolean = false;
  private p2IsPunching: boolean = false;
  private p2IsKicking: boolean = false;
  private p2CanDash: boolean = true;
  private p2JumpCount: number = 0;
  private p2IsDashing: boolean = false;
  private p2DashEndTime: number = 0;
  private p2LastLeftTapTime: number = 0;
  private p2LastRightTapTime: number = 0;

  // Bola Basket & Fisika
  private ballContainer!: Phaser.GameObjects.Container;
  private ballBody!: Phaser.Physics.Arcade.Body;
  private lastHeaderTime: number = 0;
  private lastCombatHitTime: number = 0;
  private lastScoredTime: number = 0;
  private lastBallBounceSoundTime: number = 0;
  private lastShotDistance: number = 0;

  // Ring Basket (Hoop) Kiri & Kanan
  private leftBackboard!: Phaser.GameObjects.Rectangle;
  private rightBackboard!: Phaser.GameObjects.Rectangle;
  private leftRimX: number = 0;
  private leftRimY: number = 0;
  private rightRimX: number = 0;
  private rightRimY: number = 0;
  private leftNetGfx!: Phaser.GameObjects.Graphics;
  private rightNetGfx!: Phaser.GameObjects.Graphics;

  // Boundaries
  private ground!: Phaser.GameObjects.Rectangle;

  // Status & Skor Game
  private p1Score: number = 0;
  private p2Score: number = 0;
  private p1Hp: number = 100;
  private p2Hp: number = 100;
  private timeRemaining: number = 60; // detik
  private practiceStreak: number = 0;
  private isGameOver: boolean = false;
  private isBasketPaused: boolean = false;

  // Keyboard Keys Player 1
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key; // Jump
  private keyJ!: Phaser.Input.Keyboard.Key;     // Kick Alt
  private keyU!: Phaser.Input.Keyboard.Key;     // Punch Alt
  private keyF!: Phaser.Input.Keyboard.Key;     // Pukul / Shoot
  private keyR!: Phaser.Input.Keyboard.Key;     // Tendang
  private keyK!: Phaser.Input.Keyboard.Key;     // Dash
  private keyQ!: Phaser.Input.Keyboard.Key;     // Dash Mundur Langsung
  private keyE!: Phaser.Input.Keyboard.Key;     // Dash Maju Langsung

  // Keyboard Keys Player 2 (PVP)
  private keyLeft!: Phaser.Input.Keyboard.Key;
  private keyRight!: Phaser.Input.Keyboard.Key;
  private keyUp!: Phaser.Input.Keyboard.Key;
  private keyEnter!: Phaser.Input.Keyboard.Key; // Shoot / Dunk
  private keySlash!: Phaser.Input.Keyboard.Key; // Kick / Punch
  private keyShift!: Phaser.Input.Keyboard.Key; // Dash

  // Touch Virtual States
  private touchP1Left: boolean = false;
  private touchP1Right: boolean = false;

  // UI Elements
  private timerText!: Phaser.GameObjects.Text;
  private scoreboardText!: Phaser.GameObjects.Text;
  private p1HpBar!: Phaser.GameObjects.Graphics;
  private p2HpBar!: Phaser.GameObjects.Graphics;
  private p1PowerBar!: Phaser.GameObjects.Graphics;
  private p2PowerBar!: Phaser.GameObjects.Graphics;
  private p1PowerText!: Phaser.GameObjects.Text;
  private p2PowerText!: Phaser.GameObjects.Text;
  private btnSuperP1!: Phaser.GameObjects.Arc;
  private bannerText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;

  // Super Power Dunk & Stun (Head Basketball Style!)
  private p1Power: number = 0; // 0 - 100
  private p2Power: number = 0; // 0 - 100
  private p1IsStunned: boolean = false;
  private p1StunEndTime: number = 0;
  private p2IsStunned: boolean = false;
  private p2StunEndTime: number = 0;
  private p1StunStars!: Phaser.GameObjects.Container;
  private p2StunStars!: Phaser.GameObjects.Container;
  private isSuperShotActive: boolean = false;
  private keyG!: Phaser.Input.Keyboard.Key; // P1 Super Dunk / Shot
  private keyL!: Phaser.Input.Keyboard.Key; // P2 Super Dunk / Shot

  private soundManager = SoundManager.getInstance();

  constructor() {
    super('BasketballMiniGameScene');
  }

  public init(data: any): void {
    this.mode = data?.mode || 'ai';
    this.playerName = data?.name || 'Petualang';
    this.playerAvatar = data?.avatar || null;
    this.opponentName = data?.opponentName || (this.mode === 'pvp' ? 'Player 2' : 'BOT AI');
    this.opponentServer = data?.opponentServer || '';
    this.opponentPvpStreak = data?.opponentPvpStreak ?? 0;
    this.opponentPvpSticks = data?.opponentPvpSticks ?? 0;
    if (typeof data?.returnX === 'number') this.returnX = data.returnX;
    if (typeof data?.returnY === 'number') this.returnY = data.returnY;

    this.p1Score = 0;
    this.p2Score = 0;
    this.p1Hp = 100;
    this.p2Hp = 100;
    this.timeRemaining = 60;
    this.practiceStreak = 0;
    this.isGameOver = false;
    this.isBasketPaused = false;
    this.p1JumpCount = 0;
    this.p2JumpCount = 0;
    this.lastHeaderTime = 0;
    this.lastCombatHitTime = 0;
    this.lastScoredTime = 0;
    this.lastBallBounceSoundTime = 0;
    this.lastShotDistance = 0;

    // Reset Power & Status Stun Head Basketball
    this.p1Power = 0;
    this.p2Power = 0;
    this.p1IsStunned = false;
    this.p1StunEndTime = 0;
    this.p2IsStunned = false;
    this.p2StunEndTime = 0;
    this.isSuperShotActive = false;

    // Simpan status sesi aktif mini game agar saat refresh tidak kembali ke world
    try {
      localStorage.setItem(
        'raden_active_minigame',
        JSON.stringify({
          sport: 'basketball',
          mode: this.mode,
          name: this.playerName,
          avatar: this.playerAvatar,
          returnPos: { x: this.returnX, y: this.returnY },
          timestamp: Date.now(),
        })
      );
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', `/minigame/basketball?mode=${this.mode}`);
      }
    } catch (e) {}

    fetch('/api/sports/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Name': this.playerName },
      body: JSON.stringify({
        sport: 'basketball',
        mode: this.mode,
        player_name: this.playerName,
        avatar: this.playerAvatar,
        return_x: this.returnX,
        return_y: this.returnY,
      }),
    }).catch(() => {});
  }

  public create(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const groundY = height - 90;

    this.soundManager.playWhistle();

    // 1. LATAR BELAKANG ARENA STREET BASKETBALL
    this.createBasketballArenaBackground(width, height, groundY);

    // 2. FISIKA WORLD & BATAS (Snappy Arcade Gravity, Cepat Saat Turun)
    this.physics.world.setBounds(0, 0, width, groundY);
    this.physics.world.gravity.y = 1350;

    // Lantai Lapangan Kayu / Asphalt Streetball
    this.ground = this.add.rectangle(width / 2, groundY + 45, width, 90, 0x1e293b);
    this.physics.add.existing(this.ground, true);

    // Garis Lantai Lapangan Basket
    const courtFloor = this.add.graphics();
    courtFloor.fillStyle(0xd97706, 0.9);
    courtFloor.fillRect(0, groundY, width, 14);
    courtFloor.lineStyle(3, 0xffffff, 0.85);
    courtFloor.lineBetween(0, groundY, width, groundY);
    courtFloor.lineBetween(width / 2, groundY - 140, width / 2, groundY);
    courtFloor.strokeCircle(width / 2, groundY - 70, 70);

    // 3. RING BASKET KIRI & KANAN (Hoops, Backboards, Rims, Nets)
    const hoopHeight = 175;
    this.leftRimX = 95;
    this.leftRimY = groundY - hoopHeight;
    this.rightRimX = width - 95;
    this.rightRimY = groundY - hoopHeight;

    this.createBasketballHoop(true, this.leftRimX, this.leftRimY, groundY);
    this.createBasketballHoop(false, this.rightRimX, this.rightRimY, groundY);

    // 4. KARAKTER PLAYER 1 (Sisi Kiri, Menghadap Kanan)
    const p1X = width * 0.28;
    this.p1 = this.createHeadCharacter(p1X, groundY - 60, true, 0x2563eb, this.playerName);
    this.p1Body = this.p1.body as Phaser.Physics.Arcade.Body;
    this.p1Head = this.p1.getByName('head') as Phaser.GameObjects.Arc;
    this.p1Arm = this.p1.getByName('arm') as Phaser.GameObjects.Rectangle;
    this.p1Fist = this.p1.getByName('fist') as Phaser.GameObjects.Arc;
    this.p1Leg = this.p1.getByName('leg') as Phaser.GameObjects.Rectangle;
    this.p1Foot = this.p1.getByName('foot') as Phaser.GameObjects.Rectangle;
    this.p1StunStars = this.p1.getByName('stunStars') as Phaser.GameObjects.Container;

    // 5. KARAKTER PLAYER 2 / BOT AI (Sisi Kanan, Menghadap Kiri)
    const p2X = width * 0.72;
    const p2Label = this.mode === 'pvp' ? 'Player 2' : 'Bot Komputer 🤖';
    const p2Color = this.mode === 'pvp' ? 0xd97706 : 0xe11d48;
    this.p2 = this.createHeadCharacter(p2X, groundY - 60, false, p2Color, p2Label);
    this.p2Body = this.p2.body as Phaser.Physics.Arcade.Body;
    this.p2Head = this.p2.getByName('head') as Phaser.GameObjects.Arc;
    this.p2Arm = this.p2.getByName('arm') as Phaser.GameObjects.Rectangle;
    this.p2Fist = this.p2.getByName('fist') as Phaser.GameObjects.Arc;
    this.p2Leg = this.p2.getByName('leg') as Phaser.GameObjects.Rectangle;
    this.p2Foot = this.p2.getByName('foot') as Phaser.GameObjects.Rectangle;
    this.p2StunStars = this.p2.getByName('stunStars') as Phaser.GameObjects.Container;

    // 6. BOLA BASKET DENGAN FISIKA REALISTIS & PUTARAN
    this.ballContainer = this.createRealisticBasketball(width / 2, groundY - 150);
    this.ballBody = this.ballContainer.body as Phaser.Physics.Arcade.Body;
    this.ballBody.setGravityY(-250); // Bola tetap memiliki busur parabolik natural saat shooting

    // 7. TABRAKAN & KOLESI (Colliders)
    this.physics.add.collider(this.p1, this.ground, () => {
      this.p1JumpCount = 0;
    });
    this.physics.add.collider(this.p2, this.ground, () => {
      this.p2JumpCount = 0;
    });

    // Bola dengan Tanah & Papan Pantul
    this.physics.add.collider(this.ballContainer, this.ground, () => {
      const now = this.time.now;
      if (Math.abs(this.ballBody.velocity.y) > 70 && now - this.lastBallBounceSoundTime > 120) {
        this.lastBallBounceSoundTime = now;
        this.soundManager.playKick();
      }
    });

    this.physics.add.collider(this.ballContainer, this.leftBackboard, () => {
      this.soundManager.playKick();
    });
    this.physics.add.collider(this.ballContainer, this.rightBackboard, () => {
      this.soundManager.playKick();
    });

    // Tabrakan Bola dengan Pemain (Pantulan & Sundulan)
    this.physics.add.collider(this.ballContainer, this.p1, () => {
      this.handlePlayerBallCollision(this.p1, this.p1Body, this.ballBody, true);
    });
    this.physics.add.collider(this.ballContainer, this.p2, () => {
      this.handlePlayerBallCollision(this.p2, this.p2Body, this.ballBody, false);
    });

    // 8. SETUP KEYBOARD KONTROL
    this.setupKeyboardControls();

    // 9. SETUP HUD & TAMPILAN HEAD BASKETBALL
    this.createHeadBasketballUI(width, height);

    // 10. SETUP TOMBOL VIRTUAL SENTUH MOBILE
    this.createTouchControls(width, height, groundY);

    // 11. TIMER HITUNG MUNDUR (Khusus Mode PVP & Komputer)
    if (this.mode !== 'practice') {
      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          if (this.isGameOver || this.isBasketPaused) return;
          this.timeRemaining = Math.max(0, this.timeRemaining - 1);
          const mm = String(Math.floor(this.timeRemaining / 60)).padStart(2, '0');
          const ss = String(this.timeRemaining % 60).padStart(2, '0');
          this.timerText.setText(`⏱️ ${mm}:${ss}`);

          if (this.timeRemaining <= 0) {
            this.handleTimeUp();
          }
        },
      });
    }

    EventBus.emit('location-updated', 'ARENA STREETBALL: BASKETBALL 1 VS 1');
    EventBus.emit('minigame-active', true);
  }

  /**
   * Latar Belakang Arena Cyber Streetball
   */
  private createBasketballArenaBackground(width: number, height: number, groundY: number): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0f172a, 0x0f172a, 0x1e1b4b, 0x1e1b4b, 1);
    sky.fillRect(0, 0, width, height);

    const city = this.add.graphics();
    city.fillStyle(0x020617, 0.9);
    for (let x = 0; x < width; x += 55) {
      const bHeight = 70 + ((x * 17) % 110);
      city.fillRect(x, groundY - bHeight, 48, bHeight);
      city.fillStyle(0xfde047, 0.4);
      city.fillRect(x + 10, groundY - bHeight + 15, 6, 8);
      city.fillRect(x + 28, groundY - bHeight + 35, 6, 8);
      city.fillStyle(0x020617, 0.9);
    }

    const beams = this.add.graphics();
    beams.fillStyle(0xf59e0b, 0.08);
    beams.fillTriangle(0, 0, width * 0.45, groundY, 0, groundY);
    beams.fillTriangle(width, 0, width * 0.55, groundY, width, groundY);

    const banner = this.add.rectangle(width / 2, groundY - 210, Math.min(width * 0.7, 440), 55, 0x090b10, 0.85);
    banner.setStrokeStyle(2, 0xf59e0b);
    this.add.text(width / 2, groundY - 210, '🏀 RADEN BASKETBALL ★ DOUBLE JUMP & DASH READY 🏀', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '11px',
      color: '#fbbf24',
    }).setOrigin(0.5);
  }

  /**
   * Ring Basket Kiri & Kanan
   */
  private createBasketballHoop(isLeft: boolean, rimX: number, rimY: number, groundY: number): void {
    const poleX = isLeft ? 35 : this.scale.width - 35;
    const boardX = isLeft ? 60 : this.scale.width - 60;
    const boardY = rimY - 35;
    const boardW = 12;
    const boardH = 95;

    this.add.rectangle(poleX, groundY - 110, 12, 220, 0x475569);
    this.add.rectangle((poleX + boardX) / 2, rimY - 10, 30, 8, 0x475569);

    const backboard = this.add.rectangle(boardX, boardY, boardW, boardH, 0xffffff, 0.85);
    backboard.setStrokeStyle(2.5, 0xf97316);
    this.physics.add.existing(backboard, true);

    if (isLeft) this.leftBackboard = backboard;
    else this.rightBackboard = backboard;

    this.add.rectangle(boardX + (isLeft ? 4 : -4), rimY - 25, 4, 30, 0xf97316);

    const rimRing = this.add.rectangle(rimX, rimY, 32, 6, 0xe11d48);
    rimRing.setStrokeStyle(1.5, 0xffffff);

    const netGfx = this.add.graphics();
    this.drawHoopNet(netGfx, rimX, rimY);

    if (isLeft) this.leftNetGfx = netGfx;
    else this.rightNetGfx = netGfx;
  }

  /**
   * Menggambar Jaring Keranjang Basket
   */
  private drawHoopNet(gfx: Phaser.GameObjects.Graphics, rimX: number, rimY: number): void {
    gfx.clear();
    gfx.lineStyle(1.5, 0xffffff, 0.8);

    const topW = 16;
    const botW = 9;
    const netH = 34;

    gfx.lineBetween(rimX - topW, rimY + 3, rimX - botW, rimY + netH);
    gfx.lineBetween(rimX + topW, rimY + 3, rimX + botW, rimY + netH);
    gfx.lineBetween(rimX - 6, rimY + 3, rimX - 3, rimY + netH);
    gfx.lineBetween(rimX + 6, rimY + 3, rimX + 3, rimY + netH);

    gfx.lineBetween(rimX - 14, rimY + 12, rimX + 14, rimY + 12);
    gfx.lineBetween(rimX - 11, rimY + 22, rimX + 11, rimY + 22);
    gfx.lineBetween(rimX - botW, rimY + netH, rimX + botW, rimY + netH);
  }

  /**
   * Bola Basket Realistis dengan Garis Seam & Rotasi Dinamis
   */
  private createRealisticBasketball(x: number, y: number): Phaser.GameObjects.Container {
    const radius = 18;
    const baseBall = this.add.circle(0, 0, radius, 0xea580c);
    baseBall.setStrokeStyle(2.5, 0x1e1b4b);

    // Efek highlight cahaya 3D bola bulat
    const highlight = this.add.circle(-5, -5, radius * 0.45, 0xfdba74, 0.45);

    // Garis Seam Khas Bola Basket (Ribs / Seams)
    const seams = this.add.graphics();
    seams.lineStyle(2, 0x1e1b4b, 0.95);
    seams.lineBetween(-radius + 2, 0, radius - 2, 0);
    seams.lineBetween(0, -radius + 2, 0, radius - 2);
    seams.strokeCircle(-8, 0, 12);
    seams.strokeCircle(8, 0, 12);

    const glow = this.add.circle(0, 0, radius + 2, 0xf97316, 0.18);

    const container = this.add.container(x, y, [baseBall, highlight, glow, seams]);
    this.physics.add.existing(container);

    const body = container.body as Phaser.Physics.Arcade.Body;
    body.setCircle(radius, -radius, -radius);
    body.setCollideWorldBounds(true);
    // Bounciness tinggi khas bola basket di lantai kayu
    body.setBounce(0.83, 0.83);
    body.setDrag(20, 0);

    return container;
  }

  /**
   * Membuat Karakter Bobblehead dengan Tangan (Tinju/Dunk) & Kaki (Tendang/Lari)
   */
  private createHeadCharacter(
    x: number,
    y: number,
    isFacingRight: boolean,
    primaryColor: number,
    nameLabel: string
  ): Phaser.GameObjects.Container {
    const dir = isFacingRight ? 1 : -1;

    // 1. Kepala Raksasa Bobblehead Khas Head Basketball
    const head = this.add.circle(0, -34, 28, 0xfed7aa);
    head.setStrokeStyle(2.5, 0xd97706);
    head.setName('head');

    // Pipi Merona Kartun (Blush)
    const blush = this.add.circle(dir * 14, -26, 4.5, 0xf87171, 0.45);

    // Headband Atletik Streetball dengan Garis Putih
    const headband = this.add.rectangle(0, -44, 52, 9, primaryColor);
    headband.setStrokeStyle(1.5, 0x0f172a);
    const headbandStripe = this.add.rectangle(0, -44, 52, 2.5, 0xffffff);

    // Rambut Spiky Streetball di Atas Headband
    const hair = this.add.rectangle(0, -53, 44, 12, 0x1e293b);
    hair.setStrokeStyle(1, 0x0f172a);

    // Mata Kartun Ekspresif Besar dengan Pupil & Gleam Shine
    const eyeX = dir * 10;
    const eyeWhite = this.add.circle(eyeX, -34, 6.5, 0xffffff);
    eyeWhite.setStrokeStyle(1.5, 0x0f172a);
    const eyePupil = this.add.circle(eyeX + dir * 1.5, -34, 3.8, 0x0f172a);
    eyePupil.setName('pupil');
    const eyeGleam = this.add.circle(eyeX + dir * 0.5, -36, 1.8, 0xffffff);
    const brow = this.add.rectangle(eyeX, -42, 12, 3, 0x0f172a);

    // Mulut Senyum Khas Head Basketball
    const mouth = this.add.arc(dir * 10, -22, 5, 0, 180, false, 0x0f172a);
    mouth.setName('mouth');

    // 2. Tubuh Jersey Streetball
    const jersey = this.add.rectangle(0, 4, 30, 36, primaryColor);
    jersey.setStrokeStyle(2, 0xffffff, 0.85);

    // Nomor Punggung Mini
    const numText = this.add.text(0, 4, isFacingRight ? '23' : '8', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 3. Tangan & Sarung Tinju Melayang (Arm & Fist)
    const armX = dir * 14;
    const arm = this.add.rectangle(armX, 4, 18, 7, primaryColor);
    arm.setStrokeStyle(1.5, 0x0f172a);
    arm.setName('arm');

    const fist = this.add.circle(armX + dir * 11, 4, 7, 0xfed7aa);
    fist.setStrokeStyle(1.5, 0xd97706);
    fist.setName('fist');

    // 4. Kaki & Sepatu Sneakers Basket (Leg & Foot)
    const legX = dir * 8;
    const leg = this.add.rectangle(legX, 22, 9, 16, 0x334155);
    leg.setName('leg');

    const foot = this.add.rectangle(legX + dir * 6, 30, 22, 10, 0xffffff);
    foot.setStrokeStyle(1.5, primaryColor);
    foot.setName('foot');
    const sneakerStripe = this.add.rectangle(legX + dir * 6, 30, 6, 10, 0xf59e0b);

    // 5. Container Bintang Pusing (Stun Stars Orbiting)
    const star1 = this.add.text(-14, -68, '⭐', { fontSize: '13px' }).setOrigin(0.5);
    const star2 = this.add.text(0, -75, '💫', { fontSize: '15px' }).setOrigin(0.5);
    const star3 = this.add.text(14, -68, '✨', { fontSize: '13px' }).setOrigin(0.5);
    const stunStars = this.add.container(0, 0, [star1, star2, star3]);
    stunStars.setName('stunStars');
    stunStars.setVisible(false);

    // 6. Label Nama Pemain
    const label = this.add.text(0, -70, nameLabel, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [
      jersey,
      numText,
      leg,
      foot,
      sneakerStripe,
      arm,
      fist,
      head,
      blush,
      headband,
      headbandStripe,
      hair,
      eyeWhite,
      eyePupil,
      eyeGleam,
      brow,
      mouth,
      label,
      stunStars,
    ]);

    this.physics.add.existing(container);
    const body = container.body as Phaser.Physics.Arcade.Body;
    body.setSize(48, 80);
    body.setOffset(-24, -40);
    body.setCollideWorldBounds(true);
    body.setBounce(0.05, 0.05);

    return container;
  }

  /**
   * Setup Keyboard Kontrol Lengkap
   */
  private setupKeyboardControls(): void {
    if (this.input.keyboard) {
      // P1 Keys
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Jump
      this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J); // Kick Alt
      this.keyU = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U); // Punch Alt
      this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); // Pukul / Shoot (F)
      this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); // Tendang (R)
      this.keyG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G); // 🔥 SUPER DUNK / 3-PT (G)
      this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K); // Dash
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Dash Mundur Langsung
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // Dash Maju Langsung

      // P2 Keys (PVP)
      this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER); // Shoot/Dunk
      this.keySlash = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH); // Kick/Punch
      this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L); // 🔥 SUPER DUNK P2
      this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT); // Dash

      this.input.keyboard.on('keydown-ESC', () => {
        this.exitToWorld();
      });
    }
  }

  /**
   * UI Head Basketball (Simple, Elegan, Pure Dark, Khas RadenWorld)
   * Responsif di Layar Sempit (Mobile Vertikal/Portrait), Lebar (Landscape), dan PC Desktop.
   */
  private createHeadBasketballUI(width: number, height: number): void {
    const isSmallScreen = width < 640;

    // 1. Tombol Keluar (Minimalis, Pure Dark dengan Hover Gold)
    const backBtnW = isSmallScreen ? 72 : 92;
    const backBtnH = isSmallScreen ? 28 : 30;
    const backBtnX = isSmallScreen ? 46 : 65;
    const backBtnY = isSmallScreen ? 24 : 26;

    const backBtnBg = this.add.rectangle(backBtnX, backBtnY, backBtnW, backBtnH, 0x0a0a0a, 0.95);
    backBtnBg.setStrokeStyle(1, 0x262626);
    backBtnBg.setInteractive({ useHandCursor: true });

    const backBtnText = this.add.text(backBtnX, backBtnY, '← KELUAR', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: isSmallScreen ? '10px' : '11px',
      color: '#d4d4d4',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    backBtnBg.on('pointerover', () => {
      backBtnBg.setStrokeStyle(1, 0xfbbf24);
      backBtnText.setColor('#fbbf24');
    });
    backBtnBg.on('pointerout', () => {
      backBtnBg.setStrokeStyle(1, 0x262626);
      backBtnText.setColor('#d4d4d4');
    });
    backBtnBg.on('pointerdown', () => {
      this.soundManager.playClick();
      this.exitToWorld();
    });

    // 2. Scoreboard Tengah (Simple & Elegan)
    const sbW = isSmallScreen ? 120 : 160;
    const sbH = isSmallScreen ? 38 : 42;
    const sbY = isSmallScreen ? 24 : 26;

    const boardBg = this.add.rectangle(width / 2, sbY, sbW, sbH, 0x0a0a0a, 0.95);
    boardBg.setStrokeStyle(1, 0x262626);

    this.scoreboardText = this.add.text(width / 2, sbY - (isSmallScreen ? 6 : 7), `${this.p1Score} - ${this.p2Score}`, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: isSmallScreen ? '19px' : '22px',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, sbY + (isSmallScreen ? 9 : 11), this.mode === 'practice' ? 'LATIHAN' : '01:00', {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: isSmallScreen ? '9px' : '10px',
      color: '#a3a3a3',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 3. HP Bar & Super Power Bar Player 1 & 2 (Khusus PVP & AI)
    if (this.mode !== 'practice') {
      this.p1HpBar = this.add.graphics();
      this.p2HpBar = this.add.graphics();
      this.p1PowerBar = this.add.graphics();
      this.p2PowerBar = this.add.graphics();

      this.p1PowerText = this.add.text(10, 10, 'POWER: 0%', {
        fontFamily: 'Chakra Petch, sans-serif',
        fontSize: '9px',
        color: '#a3a3a3',
        fontStyle: 'bold',
      });

      this.p2PowerText = this.add.text(10, 10, 'POWER: 0%', {
        fontFamily: 'Chakra Petch, sans-serif',
        fontSize: '9px',
        color: '#a3a3a3',
        fontStyle: 'bold',
      });

      this.updateHpBars(width);
    }

    // 4. Banner Selebrasi Basket (Elegan & Dramatis)
    this.bannerText = this.add.text(width / 2, height * 0.40, '', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: isSmallScreen ? '32px' : '44px',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Teks Streak Latihan
    this.streakText = this.add.text(width / 2, sbY + 34, '', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '12px',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 5. Bar Shortcut Keyboard PC (Hanya Muncul di Desktop/PC >= 768px)
    if (width >= 768) {
      const pcBarW = Math.min(width * 0.92, 700);
      const pcBarBg = this.add.rectangle(width / 2, height - 20, pcBarW, 26, 0x0a0a0a, 0.9);
      pcBarBg.setStrokeStyle(1, 0x262626);
      this.add.text(width / 2, height - 20, '⌨️ [Spasi] LOMPAT (2x) • [Q/E] DASH • [F] TEMBAK/PUKUL 🏀 • [R] TENDANG 🦵 • [G] SUPER • [A/D] JALAN', {
        fontFamily: 'Chakra Petch, sans-serif',
        fontSize: '11px',
        color: '#a3a3a3',
      }).setOrigin(0.5);
    }
  }

  /**
   * Tombol Sentuh Virtual Layar HP (Mobile Touch Controls)
   * Desain Dark Obsidian Khas RadenWorld, Rapi & Tidak Tabrakan di Vertikal Maupun Horizontal
   */
  private createTouchControls(width: number, height: number, groundY: number): void {
    const isSmall = width < 600;
    const btnRadius = isSmall ? 23 : 27;
    const btnY = height - (isSmall ? 36 : 42);

    // ========================================================================
    // SISI KIRI: Tombol Navigasi ◀ (Kiri) dan ▶ (Kanan) & Shortcut ⚡ (Dash)
    // ========================================================================
    const leftX = isSmall ? 34 : 44;
    const rightX = isSmall ? 88 : 104;
    const dashX = isSmall ? 140 : 162;

    // Tombol Kiri (◀)
    const btnLeft = this.add.circle(leftX, btnY, btnRadius, 0x141414, 0.92);
    btnLeft.setStrokeStyle(1, 0x383838);
    btnLeft.setInteractive();
    this.add.text(leftX, btnY - 2, '◀', { fontSize: isSmall ? '17px' : '19px', color: '#ffffff' }).setOrigin(0.5);
    const leftSub = this.add.text(leftX, btnY + (isSmall ? 11 : 13), '2x⚡', { fontSize: '8px', color: '#a3a3a3', fontStyle: 'bold' }).setOrigin(0.5);

    btnLeft.on('pointerdown', () => {
      const now = this.time.now;
      if (now - this.p1LastLeftTapTime < this.DOUBLE_TAP_WINDOW) {
        this.triggerDash(false, true);
      }
      this.p1LastLeftTapTime = now;
      this.touchP1Left = true;
      btnLeft.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: [btnLeft, leftSub], scale: 0.90, duration: 60, yoyo: true });
    });
    const resetLeft = () => {
      this.touchP1Left = false;
      btnLeft.setStrokeStyle(1, 0x383838);
    };
    btnLeft.on('pointerup', resetLeft);
    btnLeft.on('pointerout', resetLeft);

    // Tombol Kanan (▶)
    const btnRight = this.add.circle(rightX, btnY, btnRadius, 0x141414, 0.92);
    btnRight.setStrokeStyle(1, 0x383838);
    btnRight.setInteractive();
    this.add.text(rightX, btnY - 2, '▶', { fontSize: isSmall ? '17px' : '19px', color: '#ffffff' }).setOrigin(0.5);
    const rightSub = this.add.text(rightX, btnY + (isSmall ? 11 : 13), '2x⚡', { fontSize: '8px', color: '#a3a3a3', fontStyle: 'bold' }).setOrigin(0.5);

    btnRight.on('pointerdown', () => {
      const now = this.time.now;
      if (now - this.p1LastRightTapTime < this.DOUBLE_TAP_WINDOW) {
        this.triggerDash(true, true);
      }
      this.p1LastRightTapTime = now;
      this.touchP1Right = true;
      btnRight.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: [btnRight, rightSub], scale: 0.90, duration: 60, yoyo: true });
    });
    const resetRight = () => {
      this.touchP1Right = false;
      btnRight.setStrokeStyle(1, 0x383838);
    };
    btnRight.on('pointerup', resetRight);
    btnRight.on('pointerout', resetRight);

    // Tombol Shortcut Instan Dash (⚡)
    const btnDashInstant = this.add.circle(dashX, btnY, isSmall ? 18 : 22, 0x1c1917, 0.92);
    btnDashInstant.setStrokeStyle(1, 0x44403c);
    btnDashInstant.setInteractive();
    this.add.text(dashX, btnY, '⚡', { fontSize: isSmall ? '13px' : '15px', color: '#fbbf24' }).setOrigin(0.5);
    btnDashInstant.on('pointerdown', () => {
      btnDashInstant.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnDashInstant, scale: 0.88, duration: 60, yoyo: true });
      const isForward = !this.touchP1Left;
      this.triggerDash(isForward, true);
    });
    btnDashInstant.on('pointerup', () => btnDashInstant.setStrokeStyle(1, 0x44403c));
    btnDashInstant.on('pointerout', () => btnDashInstant.setStrokeStyle(1, 0x44403c));

    // ========================================================================
    // SISI KANAN: Lompat (▲), Tinju (🥊), Tendang (🦵), Tembak (🏀), Super (🔥)
    // ========================================================================
    const shootX = width - (isSmall ? 32 : 40);
    const kickX = width - (isSmall ? 76 : 90);
    const punchX = width - (isSmall ? 120 : 140);
    const jumpX = width - (isSmall ? 164 : 190);
    const superY = btnY - (isSmall ? 48 : 56);

    // Tombol Lompat / Double Jump (▲)
    const btnJump = this.add.circle(jumpX, btnY, btnRadius, 0x141414, 0.92);
    btnJump.setStrokeStyle(1, 0x383838);
    btnJump.setInteractive();
    this.add.text(jumpX, btnY - 2, '▲', { fontSize: isSmall ? '17px' : '19px', color: '#ffffff' }).setOrigin(0.5);
    const jumpSub = this.add.text(jumpX, btnY + (isSmall ? 11 : 13), '2x▲', { fontSize: '8px', color: '#a3a3a3', fontStyle: 'bold' }).setOrigin(0.5);
    btnJump.on('pointerdown', () => {
      btnJump.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: [btnJump, jumpSub], scale: 0.90, duration: 60, yoyo: true });
      this.performJump(true);
    });
    btnJump.on('pointerup', () => btnJump.setStrokeStyle(1, 0x383838));
    btnJump.on('pointerout', () => btnJump.setStrokeStyle(1, 0x383838));

    // Tombol Tinju (🥊)
    const btnPunch = this.add.circle(punchX, btnY, isSmall ? 21 : 25, 0x141414, 0.92);
    btnPunch.setStrokeStyle(1, 0x383838);
    btnPunch.setInteractive();
    this.add.text(punchX, btnY, '🥊', { fontSize: isSmall ? '14px' : '16px' }).setOrigin(0.5);
    btnPunch.on('pointerdown', () => {
      btnPunch.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnPunch, scale: 0.90, duration: 60, yoyo: true });
      this.triggerPunch(true);
    });
    btnPunch.on('pointerup', () => btnPunch.setStrokeStyle(1, 0x383838));
    btnPunch.on('pointerout', () => btnPunch.setStrokeStyle(1, 0x383838));

    // Tombol Tendang (🦵)
    const btnKick = this.add.circle(kickX, btnY, isSmall ? 21 : 25, 0x141414, 0.92);
    btnKick.setStrokeStyle(1, 0x383838);
    btnKick.setInteractive();
    this.add.text(kickX, btnY, '🦵', { fontSize: isSmall ? '14px' : '16px' }).setOrigin(0.5);
    btnKick.on('pointerdown', () => {
      btnKick.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnKick, scale: 0.90, duration: 60, yoyo: true });
      this.triggerKick(true);
    });
    btnKick.on('pointerup', () => btnKick.setStrokeStyle(1, 0x383838));
    btnKick.on('pointerout', () => btnKick.setStrokeStyle(1, 0x383838));

    // Tombol Tembak Basket (🏀)
    const btnShoot = this.add.circle(shootX, btnY, btnRadius, 0x141414, 0.92);
    btnShoot.setStrokeStyle(1, 0x383838);
    btnShoot.setInteractive();
    this.add.text(shootX, btnY, '🏀', { fontSize: isSmall ? '17px' : '19px' }).setOrigin(0.5);
    btnShoot.on('pointerdown', () => {
      btnShoot.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnShoot, scale: 0.90, duration: 60, yoyo: true });
      this.performP1ShootOrDunk();
    });
    btnShoot.on('pointerup', () => btnShoot.setStrokeStyle(1, 0x383838));
    btnShoot.on('pointerout', () => btnShoot.setStrokeStyle(1, 0x383838));

    // Tombol Super Dunk (🔥)
    const btnSuper = this.add.circle(shootX, superY, isSmall ? 20 : 23, 0x1c1917, 0.92);
    btnSuper.setStrokeStyle(1, 0x44403c);
    btnSuper.setInteractive();
    this.btnSuperP1 = btnSuper;
    this.add.text(shootX, superY, '🔥', { fontSize: isSmall ? '14px' : '16px' }).setOrigin(0.5);
    btnSuper.on('pointerdown', () => {
      btnSuper.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnSuper, scale: 0.90, duration: 60, yoyo: true });
      this.triggerSuperDunkOrShot(true);
    });
    btnSuper.on('pointerup', () => {
      if (this.p1Power < 100) btnSuper.setStrokeStyle(1, 0x44403c);
    });
  }

  /**
   * Perbarui Grafik Bar Darah & Bar Power (Health Bar & Super Power Bar)
   * Responsif di Layar Sempit & Layar Lebar tanpa Bertabrakan
   */
  private updateHpBars(width: number): void {
    if (!this.p1HpBar || !this.p2HpBar) return;
    const isSmall = width < 640;

    const barWidth = isSmall ? Math.min(110, (width / 2) - 30) : Math.min(130, width * 0.17);
    const barHeight = isSmall ? 7 : 8;
    const p1BarX = isSmall ? 14 : 125;
    const p2BarX = isSmall ? width - 14 - barWidth : width - 125 - barWidth;
    const barY = isSmall ? 50 : 20;

    // 1. P1 HP Bar
    this.p1HpBar.clear();
    this.p1HpBar.fillStyle(0x171717, 0.95);
    this.p1HpBar.fillRect(p1BarX, barY, barWidth, barHeight);
    const p1Fill = Math.max(0, (this.p1Hp / 100) * barWidth);
    this.p1HpBar.fillStyle(this.p1Hp > 30 ? 0x10b981 : 0xf59e0b, 1);
    this.p1HpBar.fillRect(p1BarX, barY, p1Fill, barHeight);
    this.p1HpBar.lineStyle(1, 0x383838, 0.8);
    this.p1HpBar.strokeRect(p1BarX, barY, barWidth, barHeight);

    // P1 Power Bar (Super Gauge)
    if (this.p1PowerBar) {
      this.p1PowerBar.clear();
      this.p1PowerBar.fillStyle(0x171717, 0.95);
      this.p1PowerBar.fillRect(p1BarX, barY + barHeight + 3, barWidth, 4);
      const p1PwrFill = Math.max(0, (this.p1Power / 100) * barWidth);
      this.p1PowerBar.fillStyle(this.p1Power >= 100 ? 0xfbbf24 : 0x737373, 1);
      this.p1PowerBar.fillRect(p1BarX, barY + barHeight + 3, p1PwrFill, 4);
      this.p1PowerBar.lineStyle(1, 0x383838, 0.8);
      this.p1PowerBar.strokeRect(p1BarX, barY + barHeight + 3, barWidth, 4);

      if (this.p1PowerText) {
        this.p1PowerText.setPosition(p1BarX, barY + barHeight + 9);
        this.p1PowerText.setText(this.p1Power >= 100 ? '🔥 SUPER SIAP! [G]' : `POWER: ${Math.floor(this.p1Power)}%`);
        this.p1PowerText.setColor(this.p1Power >= 100 ? '#fbbf24' : '#a3a3a3');
      }
    }

    // 2. P2 HP Bar
    this.p2HpBar.clear();
    this.p2HpBar.fillStyle(0x171717, 0.95);
    this.p2HpBar.fillRect(p2BarX, barY, barWidth, barHeight);
    const p2Fill = Math.max(0, (this.p2Hp / 100) * barWidth);
    this.p2HpBar.fillStyle(this.p2Hp > 30 ? 0x10b981 : 0xf59e0b, 1);
    this.p2HpBar.fillRect(p2BarX + (barWidth - p2Fill), barY, p2Fill, barHeight);
    this.p2HpBar.lineStyle(1, 0x383838, 0.8);
    this.p2HpBar.strokeRect(p2BarX, barY, barWidth, barHeight);

    // P2 Power Bar (Super Gauge)
    if (this.p2PowerBar) {
      this.p2PowerBar.clear();
      this.p2PowerBar.fillStyle(0x171717, 0.95);
      this.p2PowerBar.fillRect(p2BarX, barY + barHeight + 3, barWidth, 4);
      const p2PwrFill = Math.max(0, (this.p2Power / 100) * barWidth);
      this.p2PowerBar.fillStyle(this.p2Power >= 100 ? 0xfbbf24 : 0x737373, 1);
      this.p2PowerBar.fillRect(p2BarX + (barWidth - p2PwrFill), barY + barHeight + 3, p2PwrFill, 4);
      this.p2PowerBar.lineStyle(1, 0x383838, 0.8);
      this.p2PowerBar.strokeRect(p2BarX, barY + barHeight + 3, barWidth, 4);

      if (this.p2PowerText) {
        this.p2PowerText.setPosition(p2BarX, barY + barHeight + 9);
        this.p2PowerText.setText(this.p2Power >= 100 ? '🔥 SUPER SIAP!' : `POWER: ${Math.floor(this.p2Power)}%`);
        this.p2PowerText.setColor(this.p2Power >= 100 ? '#fbbf24' : '#a3a3a3');
      }
    }

    // Indikator Tombol Super Mobile
    if (this.btnSuperP1) {
      if (this.p1Power >= 100) {
        this.btnSuperP1.setFillStyle(0x78350f, 1);
        this.btnSuperP1.setStrokeStyle(2, 0xfbbf24);
      } else {
        this.btnSuperP1.setFillStyle(0x1c1917, 0.92);
        this.btnSuperP1.setStrokeStyle(1, 0x44403c);
      }
    }
  }

  /**
   * Eksekusi Lompat / Double Jump (Lompat 2x)
   * Gravitasi Snappy & Cepat Saat Turun
   */
  private performJump(isP1: boolean): void {
    const body = isP1 ? this.p1Body : this.p2Body;
    const char = isP1 ? this.p1 : this.p2;
    const jumpCount = isP1 ? this.p1JumpCount : this.p2JumpCount;

    const isGrounded = body.blocked.down || body.touching.down || Math.abs(body.velocity.y) < 25;

    if (isGrounded || jumpCount === 0) {
      body.setVelocityY(-640);
      this.soundManager.playJump(false);
      if (isP1) this.p1JumpCount = 1;
      else this.p2JumpCount = 1;

      this.createJumpParticles(char.x, char.y + 42, false);
    } else if (jumpCount === 1) {
      body.setVelocityY(-580);
      this.soundManager.playJump(true);
      if (isP1) this.p1JumpCount = 2;
      else this.p2JumpCount = 2;

      this.createJumpParticles(char.x, char.y + 30, true);
    }
  }

  /**
   * Partikel Efek Lompat
   */
  private createJumpParticles(x: number, y: number, isDouble: boolean): void {
    const count = isDouble ? 8 : 4;
    const color = isDouble ? 0xf59e0b : 0xffffff;
    for (let i = 0; i < count; i++) {
      const p = this.add.circle(x, y, isDouble ? 4 : 3, color, 0.8);
      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-25, 25),
        y: y + Phaser.Math.Between(-10, 15),
        alpha: 0,
        scale: 0.2,
        duration: 250,
        onComplete: () => p.destroy(),
      });
    }
  }

  /**
   * Eksekusi Dash Maju atau Dash Mundur (Diperbagus: Ghost Silhouette, Wind Slice, Dust, Sound, Screen Shake)
   */
  private triggerDash(isForward: boolean, isP1: boolean): void {
    const canDash = isP1 ? this.p1CanDash : this.p2CanDash;
    if (!canDash || this.isGameOver) return;

    if (isP1) {
      this.p1CanDash = false;
      this.p1IsDashing = true;
      this.p1DashEndTime = this.time.now + 200;
    } else {
      this.p2CanDash = false;
      this.p2IsDashing = true;
      this.p2DashEndTime = this.time.now + 200;
    }

    this.soundManager.playDash();
    this.cameras.main.shake(70, 0.0035);

    const body = isP1 ? this.p1Body : this.p2Body;
    const char = isP1 ? this.p1 : this.p2;
    const forwardDir = isP1 ? 1 : -1;
    const dir = isForward ? forwardDir : -forwardDir;
    const dashVelocity = dir * 720;

    body.setVelocityX(dashVelocity);

    // 1. Spawning Phantom Ghost Trails (Bayangan Siluet Dash)
    this.createDashGhost(char, isP1);
    this.time.delayedCall(50, () => {
      if (char && char.active) this.createDashGhost(char, isP1);
    });
    this.time.delayedCall(100, () => {
      if (char && char.active) this.createDashGhost(char, isP1);
    });

    // 2. Garis Angin Kecepatan (Sonic Wind Slice Lines)
    this.createDashSpeedLines(char.x, char.y, dir, isP1);

    // 3. Partikel Debu Gesekan Kaki di Tanah
    this.createDashFootDust(char.x, char.y + 38, -dir);

    // Cooldown Dash
    this.time.delayedCall(460, () => {
      if (isP1) this.p1CanDash = true;
      else this.p2CanDash = true;
    });
  }

  /**
   * Bayangan Siluet Karakter saat Dash (Ghost Trail)
   */
  private createDashGhost(char: Phaser.GameObjects.Container, isP1: boolean): void {
    const color = isP1 ? 0x38bdf8 : 0xf97316;
    const ghostHead = this.add.circle(char.x, char.y, 28, color, 0.45);
    const ghostBody = this.add.rectangle(char.x, char.y + 24, 28, 24, color, 0.35);

    this.tweens.add({
      targets: [ghostHead, ghostBody],
      alpha: 0,
      scaleX: 1.15,
      scaleY: 0.85,
      duration: 200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        ghostHead.destroy();
        ghostBody.destroy();
      },
    });
  }

  /**
   * Garis Angin Kecepatan Horizontal (Sonic Wind Slice)
   */
  private createDashSpeedLines(x: number, y: number, dir: number, isP1: boolean): void {
    const color = isP1 ? 0x67e8f9 : 0xfdba74;
    for (let i = 0; i < 3; i++) {
      const lineY = y - 12 + i * 14;
      const line = this.add.rectangle(x - dir * 15, lineY, 35, 3, color, 0.85);
      this.tweens.add({
        targets: line,
        x: x - dir * 65,
        scaleX: 2.2,
        alpha: 0,
        duration: 180,
        onComplete: () => line.destroy(),
      });
    }
  }

  /**
   * Partikel Debu Tanah saat Melesat Dash
   */
  private createDashFootDust(x: number, y: number, dir: number): void {
    for (let i = 0; i < 5; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(3, 5), 0xd1d5db, 0.7);
      this.tweens.add({
        targets: p,
        x: x + dir * Phaser.Math.Between(15, 35),
        y: y - Phaser.Math.Between(2, 10),
        alpha: 0,
        scale: 0.2,
        duration: 220,
        onComplete: () => p.destroy(),
      });
    }
  }

  /**
   * Menambahkan Pengukur Kekuatan (Power Gauge) Head Basketball
   */
  private addPower(isP1: boolean, amount: number): void {
    if (this.isGameOver) return;
    if (isP1) {
      const prev = this.p1Power;
      this.p1Power = Math.min(100, this.p1Power + amount);
      if (prev < 100 && this.p1Power >= 100) {
        this.soundManager.playHeader();
        this.showPopupText(this.p1.x, this.p1.y - 75, '⚡ SUPER READY!!', '#facc15');
      }
    } else {
      const prev = this.p2Power;
      this.p2Power = Math.min(100, this.p2Power + amount);
      if (prev < 100 && this.p2Power >= 100) {
        this.soundManager.playHeader();
        this.showPopupText(this.p2.x, this.p2.y - 75, '⚡ SUPER READY!!', '#facc15');
      }
    }
    this.updateHpBars(this.scale.width);
  }

  /**
   * Berikan Efek Pusing / Stun pada Karakter (Head Basketball Combat)
   */
  private applyStun(targetIsP1: boolean, durationMs: number): void {
    const now = this.time.now;
    if (targetIsP1) {
      this.p1IsStunned = true;
      this.p1StunEndTime = now + durationMs;
      if (this.p1StunStars) this.p1StunStars.setVisible(true);
      this.showPopupText(this.p1.x, this.p1.y - 75, '💫 PUSING!', '#fde047');
    } else {
      this.p2IsStunned = true;
      this.p2StunEndTime = now + durationMs;
      if (this.p2StunStars) this.p2StunStars.setVisible(true);
      this.showPopupText(this.p2.x, this.p2.y - 75, '💫 PUSING!', '#fde047');
    }
  }

  /**
   * Eksekusi Tembakan Super / Super Dunk Khas Head Basketball
   */
  private triggerSuperDunkOrShot(isP1: boolean): void {
    const currentPower = isP1 ? this.p1Power : this.p2Power;
    if (currentPower < 100 || this.isBasketPaused || this.isGameOver) return;

    if (isP1) this.p1Power = 0;
    else this.p2Power = 0;
    this.updateHpBars(this.scale.width);

    const shooter = isP1 ? this.p1 : this.p2;
    const shooterBody = isP1 ? this.p1Body : this.p2Body;
    const dir = isP1 ? 1 : -1;
    const targetRimX = isP1 ? this.rightRimX : this.leftRimX;
    const targetRimY = isP1 ? this.rightRimY : this.leftRimY;

    // Layar Flash & Menghentak Hebat
    this.cameras.main.flash(220, 255, 140, 0);
    this.cameras.main.shake(320, 0.025);
    this.soundManager.playGoal();

    // Luncurkan Pemain Sedikit ke Depan
    shooterBody.setVelocity(dir * 320, -160);

    // Aktifkan Status Bola Api Super
    this.isSuperShotActive = true;

    // Posisikan bola di depan shooter jika agak jauh
    const distToBall = Phaser.Math.Distance.Between(shooter.x, shooter.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall > 70) {
      this.ballContainer.setPosition(shooter.x + dir * 35, shooter.y - 10);
    }

    const distToHoop = Phaser.Math.Distance.Between(shooter.x, shooter.y, targetRimX, targetRimY);
    const isHighOrClose = distToHoop < 260 || shooter.y < this.scale.height - 130;

    if (isHighOrClose) {
      // 🔥 METEOR SUPER SLAM DUNK!
      this.lastShotDistance = distToHoop;
      this.ballBody.setVelocity(dir * 280, 820);
      const bannerText = isP1 ? `🔥 METEOR SUPER DUNK ${this.playerName}! 💥` : '💀 BOT METEOR SUPER DUNK! 💥';
      this.showSuperBanner(bannerText);
    } else {
      // ⚡ LIGHTNING SUPER 3-POINTER!
      this.lastShotDistance = distToHoop;
      const { vx, vy } = this.calculateShotVelocity(
        this.ballContainer.x,
        this.ballContainer.y,
        targetRimX,
        targetRimY,
        false
      );
      this.ballBody.setVelocity(vx * 1.35, vy * 1.25);
      const bannerText = isP1 ? `⚡ LIGHTNING SUPER 3-PT ${this.playerName}! 💥` : '💀 BOT LIGHTNING SUPER 3-PT! 💥';
      this.showSuperBanner(bannerText);
    }
  }

  private showSuperBanner(text: string): void {
    const banner = this.add.text(this.scale.width / 2, this.scale.height * 0.35, text, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '26px',
      color: '#facc15',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      scale: { from: 0.5, to: 1.15 },
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(800, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            y: banner.y - 30,
            duration: 250,
            onComplete: () => banner.destroy(),
          });
        });
      },
    });
  }

  /**
   * Teks Popup Saat Aksi Tertentu
   */
  private showPopupText(x: number, y: number, text: string, color: string = '#facc15'): void {
    const pop = this.add.text(x, y, text, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '13px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pop,
      y: y - 28,
      alpha: 0,
      duration: 500,
      onComplete: () => pop.destroy(),
    });
  }

  /**
   * Eksekusi Tinju (Punch) ke Musuh atau Bola
   */
  private triggerPunch(isP1: boolean): void {
    if ((isP1 && this.p1IsPunching) || (!isP1 && this.p2IsPunching) || this.isGameOver) return;
    if ((isP1 && this.p1IsStunned) || (!isP1 && this.p2IsStunned)) return;

    if (isP1) this.p1IsPunching = true;
    else this.p2IsPunching = true;

    this.soundManager.playPunch();

    const arm = isP1 ? this.p1Arm : this.p2Arm;
    const fist = isP1 ? this.p1Fist : this.p2Fist;
    const dir = isP1 ? 1 : -1;

    this.tweens.add({
      targets: [arm, fist],
      x: `+=${dir * 18}`,
      duration: 75,
      yoyo: true,
      onComplete: () => {
        if (isP1) this.p1IsPunching = false;
        else this.p2IsPunching = false;
      },
    });

    const attacker = isP1 ? this.p1 : this.p2;
    const target = isP1 ? this.p2 : this.p1;
    const targetBody = isP1 ? this.p2Body : this.p1Body;

    // 1. Serang Musuh (Tinju)
    const distToEnemy = Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y);
    if (distToEnemy < 75) {
      this.handleCombatHit(attacker, target, targetBody, isP1, false);
      this.addPower(isP1, 12);
    }

    // 2. Steal / Drive Bola
    const distToBall = Phaser.Math.Distance.Between(attacker.x, attacker.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall < 85) {
      this.ballBody.setVelocity(dir * 540, -160);
      this.cameras.main.shake(100, 0.007);
      this.addPower(isP1, 10);
    }
  }

  /**
   * Eksekusi Tendangan (Kick) ke Musuh atau Bola
   */
  private triggerKick(isP1: boolean): void {
    if ((isP1 && this.p1IsKicking) || (!isP1 && this.p2IsKicking) || this.isGameOver) return;
    if ((isP1 && this.p1IsStunned) || (!isP1 && this.p2IsStunned)) return;

    if (isP1) this.p1IsKicking = true;
    else this.p2IsKicking = true;

    this.soundManager.playKick();

    const leg = isP1 ? this.p1Leg : this.p2Leg;
    const foot = isP1 ? this.p1Foot : this.p2Foot;
    const dir = isP1 ? 1 : -1;

    this.tweens.add({
      targets: [leg, foot],
      angle: dir * 50,
      y: 18,
      duration: 90,
      yoyo: true,
      onComplete: () => {
        if (isP1) this.p1IsKicking = false;
        else this.p2IsKicking = false;
      },
    });

    const attacker = isP1 ? this.p1 : this.p2;
    const target = isP1 ? this.p2 : this.p1;
    const targetBody = isP1 ? this.p2Body : this.p1Body;

    // 1. Serang Musuh (Tendangan)
    const distToEnemy = Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y);
    if (distToEnemy < 78) {
      this.handleCombatHit(attacker, target, targetBody, isP1, true);
      this.addPower(isP1, 14);
    }

    // 2. Tendang Bola
    const distToBall = Phaser.Math.Distance.Between(attacker.x, attacker.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall < 88) {
      this.ballBody.setVelocity(dir * 500, -360);
      this.cameras.main.shake(120, 0.008);
      this.addPower(isP1, 12);
    }
  }

  /**
   * Tangani Serangan Tinju/Tendang yang Mengenai Musuh
   */
  private handleCombatHit(
    attacker: Phaser.GameObjects.Container,
    target: Phaser.GameObjects.Container,
    targetBody: Phaser.Physics.Arcade.Body,
    isP1Attacking: boolean,
    isKick: boolean
  ): void {
    const now = this.time.now;
    if (now - this.lastCombatHitTime < 280) return;
    this.lastCombatHitTime = now;

    const dir = isP1Attacking ? 1 : -1;
    const knockX = dir * (isKick ? 320 : 220);
    const knockY = isKick ? -200 : -130;
    targetBody.setVelocity(knockX, knockY);

    this.tweens.add({
      targets: target,
      alpha: 0.3,
      duration: 60,
      yoyo: true,
      repeat: 2,
    });

    this.showHitSparks(target.x, target.y);

    // Berikan efek pusing (stun)
    this.applyStun(!isP1Attacking, isKick ? 800 : 500);

    if (this.mode !== 'practice') {
      const damage = isKick ? 15 : 10;
      if (isP1Attacking) {
        this.p2Hp = Math.max(0, this.p2Hp - damage);
      } else {
        this.p1Hp = Math.max(0, this.p1Hp - damage);
      }
      this.updateHpBars(this.scale.width);

      if (this.p1Hp <= 0 || this.p2Hp <= 0) {
        this.handleGameOver(this.p1Hp > 0 ? 1 : 2);
      }
    }
  }

  /**
   * Partikel Percikan Pukulan
   */
  private showHitSparks(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const spark = this.add.circle(x, y, 4, 0xfde047);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-35, 35),
        y: y + Phaser.Math.Between(-35, 35),
        alpha: 0,
        scale: 0.2,
        duration: 220,
        onComplete: () => spark.destroy(),
      });
    }
  }

  /**
   * Tangani Tabrakan Bola dengan Pemain (Pantulan & Sundulan Kepala)
   */
  private handlePlayerBallCollision(
    character: Phaser.GameObjects.Container,
    playerBody: Phaser.Physics.Arcade.Body,
    ballBody: Phaser.Physics.Arcade.Body,
    isP1: boolean
  ): void {
    const dir = isP1 ? 1 : -1;
    const now = this.time.now;

    // 1. Jika Bola Sedang dalam Status Super Shot & Menyentuh Lawan -> HENTAKAN SUPER!
    if (this.isSuperShotActive) {
      playerBody.setVelocity(dir * -450, -220);
      this.applyStun(isP1, 1200);
      this.showPopupText(character.x, character.y - 75, '💥 SUPER HIT!', '#ef4444');
      this.cameras.main.shake(220, 0.018);
      return;
    }

    // 2. Cek apakah bola mengenai area kepala -> SUNDULAN KEPALA BASKET (HEADER)
    const isHeadArea = ballBody.y < character.y - 12 && Math.abs(ballBody.x - character.x) < 32;

    if (isHeadArea && now - this.lastHeaderTime > 350) {
      this.lastHeaderTime = now;
      this.soundManager.playHeader();

      const head = isP1 ? this.p1Head : this.p2Head;
      if (head) {
        this.tweens.add({
          targets: head,
          scaleX: 1.25,
          scaleY: 0.8,
          duration: 60,
          yoyo: true,
          onComplete: () => {
            head.setScale(1);
          },
        });
      }

      // Sundulan melambung tinggi ke arah ring lawan
      ballBody.setVelocity(dir * 380, -480);
      this.showHeaderPopup(character.x, character.y - 70);
      this.addPower(isP1, 22);
      return;
    }

    // 3. KONTROL DRIBBLE & SENTUHAN LEMBUT (SOFT TOUCH BASKETBALL HANDLING)
    const playerVx = playerBody.velocity.x;
    const isMovingForward = (dir === 1 && playerVx > 30) || (dir === -1 && playerVx < -30);

    if (isMovingForward) {
      ballBody.setVelocityX(playerVx * 1.15 + dir * 25);
      if (ballBody.blocked.down || ballBody.y >= character.y + 8) {
        ballBody.setVelocityY(-190);
      }
    } else {
      const relX = ballBody.x - playerBody.x;
      const softPushX = dir * 110 + relX * 2.2;
      ballBody.setVelocityX(softPushX);
      if (ballBody.blocked.down || ballBody.y >= character.y + 8) {
        ballBody.setVelocityY(-160);
      }
    }

    this.addPower(isP1, 6);

    // Suara pantulan bola basket berirama (throttled)
    if (now - this.lastBallBounceSoundTime > 130) {
      this.lastBallBounceSoundTime = now;
      this.soundManager.playKick();
    }
  }

  /**
   * Teks Popup Saat Menyundul Bola
   */
  private showHeaderPopup(x: number, y: number): void {
    this.showPopupText(x, y - 25, '🏀 SUNDUL!', '#facc15');
  }

  /**
   * Teks Popup Saat Menembak atau Slam Dunk
   */
  private showShotPopup(x: number, y: number, text: string): void {
    const pop = this.add.text(x, y, text, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '13px',
      color: '#facc15',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pop,
      y: y - 28,
      alpha: 0,
      duration: 500,
      onComplete: () => pop.destroy(),
    });
  }

  /**
   * Menghitung Kecepatan Tembakan Parabolik Masuk Ring Secara Otomatis
   */
  private calculateShotVelocity(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    isDunk: boolean = false
  ): { vx: number; vy: number } {
    if (isDunk) {
      const dir = targetX > startX ? 1 : -1;
      return { vx: dir * 300, vy: 560 };
    }

    const dx = targetX - startX;
    // Titik target sedikit di atas bibir ring (-18px) agar melengkung masuk dari atas
    const dy = (targetY - 18) - startY;
    const absDx = Math.abs(dx);

    // Waktu tempuh dinamis (0.64s s/d 1.05s) menghasilkan busur parabolik natural
    const timeToTarget = Math.max(0.64, Math.min(1.05, 0.58 + (absDx / 720) * 0.42));

    // Gravitasi efektif bola = world (1350) + ball container offset (-250) = 1100 px/s²
    const effectiveGravity = 1100;

    const vx = dx / timeToTarget;
    const vy = (dy - 0.5 * effectiveGravity * timeToTarget * timeToTarget) / timeToTarget;

    return { vx, vy };
  }

  /**
   * Aksi Utama P1 (Tombol F / J):
   * Tembak/Slam Dunk jika dekat bola, atau Tinju/Menyerang jika dekat lawan
   */
  private performP1Action(): void {
    const distToBall = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.ballContainer.x, this.ballContainer.y);
    const distToEnemy = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y);

    if (distToBall < 135) {
      this.performP1ShootOrDunk();
    } else if (distToEnemy < 85) {
      this.triggerPunch(true);
    } else {
      if (distToBall < 160) {
        this.performP1ShootOrDunk();
      } else {
        this.triggerPunch(true);
      }
    }
  }

  /**
   * Eksekusi Tembakan Basket atau Slam Dunk untuk P1
   */
  private performP1ShootOrDunk(): void {
    if (this.p1IsShooting || this.isBasketPaused || this.isGameOver) return;
    this.p1IsShooting = true;

    if (this.p1Arm) {
      this.tweens.add({
        targets: this.p1Arm,
        angle: -55,
        y: 4,
        duration: 120,
        yoyo: true,
        onComplete: () => {
          this.p1IsShooting = false;
        },
      });
    } else {
      this.time.delayedCall(200, () => {
        this.p1IsShooting = false;
      });
    }

    const distToBall = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall < 135) {
      const distToHoop = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.rightRimX, this.rightRimY);
      const isHighJump = this.p1.y < this.scale.height - 150;

      if (distToHoop < 240 && isHighJump) {
        // 🔥 SLAM DUNK!
        this.lastShotDistance = distToHoop;
        this.soundManager.playGoal();
        this.cameras.main.shake(220, 0.02);
        this.ballBody.setVelocity(220, 580);
        this.p1Body.setVelocity(180, -90);
        this.showDunkSparks(this.ballContainer.x, this.ballContainer.y);
        this.showShotPopup(this.p1.x, this.p1.y - 75, '🔥 SLAM DUNK!');
      } else {
        // 🏀 SMART PARABOLIC JUMP SHOT (Tembakan Busur Masuk Ring Otomatis)
        this.lastShotDistance = distToHoop;
        this.soundManager.playKick();

        const { vx, vy } = this.calculateShotVelocity(
          this.ballContainer.x,
          this.ballContainer.y,
          this.rightRimX,
          this.rightRimY,
          false
        );
        this.ballBody.setVelocity(vx, vy);

        const is3Pointer = distToHoop > 380;
        const shotLabel = is3Pointer ? '🎯 3-POINT SHOT!' : '🏀 JUMP SHOT!';
        this.showShotPopup(this.p1.x, this.p1.y - 75, shotLabel);
      }
    }
  }

  /**
   * Eksekusi Tembakan Basket atau Slam Dunk untuk P2 / AI
   */
  private performP2ShootOrDunk(): void {
    if (this.p2IsShooting || this.isBasketPaused || this.isGameOver) return;
    this.p2IsShooting = true;

    if (this.p2Arm) {
      this.tweens.add({
        targets: this.p2Arm,
        angle: 55,
        y: 4,
        duration: 120,
        yoyo: true,
        onComplete: () => {
          this.p2IsShooting = false;
        },
      });
    } else {
      this.time.delayedCall(200, () => {
        this.p2IsShooting = false;
      });
    }

    const distToBall = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall < 135) {
      const distToHoop = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, this.leftRimX, this.leftRimY);
      const isHighJump = this.p2.y < this.scale.height - 150;

      if (distToHoop < 240 && isHighJump) {
        // 🔥 SLAM DUNK P2!
        this.lastShotDistance = distToHoop;
        this.soundManager.playGoal();
        this.cameras.main.shake(220, 0.02);
        this.ballBody.setVelocity(-220, 580);
        this.p2Body.setVelocity(-180, -90);
        this.showDunkSparks(this.ballContainer.x, this.ballContainer.y);
        this.showShotPopup(this.p2.x, this.p2.y - 75, '🔥 SLAM DUNK!');
      } else {
        // 🏀 SMART PARABOLIC JUMP SHOT P2
        this.lastShotDistance = distToHoop;
        this.soundManager.playKick();

        const { vx, vy } = this.calculateShotVelocity(
          this.ballContainer.x,
          this.ballContainer.y,
          this.leftRimX,
          this.leftRimY,
          false
        );
        this.ballBody.setVelocity(vx, vy);

        const is3Pointer = distToHoop > 380;
        const shotLabel = is3Pointer ? '🎯 3-POINT SHOT!' : '🏀 JUMP SHOT!';
        this.showShotPopup(this.p2.x, this.p2.y - 75, shotLabel);
      }
    }
  }

  /**
   * Partikel Api Slam Dunk
   */
  private showDunkSparks(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const spark = this.add.circle(x, y, 4, 0xf59e0b);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-60, 60),
        y: y + Phaser.Math.Between(-60, 60),
        alpha: 0,
        scale: 0.2,
        duration: 350,
        onComplete: () => spark.destroy(),
      });
    }
  }

  /**
   * Loop Update Game
   */
  public update(time: number, delta: number): void {
    if (this.isGameOver) return;

    // 1. UPDATE ROTASI REALISTIS & GESEKAN BOLA BASKET
    if (this.ballContainer && this.ballBody) {
      this.ballContainer.rotation += (this.ballBody.velocity.x * delta * 0.0035);

      if (this.ballBody.blocked.down) {
        this.ballBody.setDragX(130);
      } else {
        this.ballBody.setDragX(15);
      }

      // Magnetic Funnel Assist di sekitar bibir ring basket
      this.applyHoopMagnetAssist();
    }

    // 2. PARTIKEL EKOR API SUPER DUNK (Fireball Comet Trail)
    if (this.isSuperShotActive && this.ballContainer) {
      const pColor = Phaser.Math.RND.pick([0xf97316, 0xfacc15, 0xef4444]);
      const flame = this.add.circle(
        this.ballContainer.x + Phaser.Math.Between(-8, 8),
        this.ballContainer.y + Phaser.Math.Between(-8, 8),
        Phaser.Math.Between(5, 9),
        pColor,
        0.85
      );
      this.tweens.add({
        targets: flame,
        scale: 0.1,
        alpha: 0,
        duration: 220,
        onComplete: () => flame.destroy(),
      });

      if (this.ballBody.blocked.down || this.ballBody.blocked.left || this.ballBody.blocked.right) {
        this.isSuperShotActive = false;
      }
    }

    // 3. FAST-FALL GRAVITY (Turun Cepat & Snappy di Mini Game, Menghilangkan Efek Melayang Lambat)
    if (this.p1Body.velocity.y > 0) {
      this.p1Body.setGravityY(700); // Ekstra gravitasi saat jatuh ke bawah agar responsif
    } else {
      this.p1Body.setGravityY(0);
    }
    if (this.p1Body.blocked.down || this.p1Body.touching.down || Math.abs(this.p1Body.velocity.y) < 15) {
      this.p1JumpCount = 0;
    }

    if (this.p2Body.velocity.y > 0) {
      this.p2Body.setGravityY(700);
    } else {
      this.p2Body.setGravityY(0);
    }
    if (this.p2Body.blocked.down || this.p2Body.touching.down || Math.abs(this.p2Body.velocity.y) < 15) {
      this.p2JumpCount = 0;
    }

    // 4. UPDATE EFEK PUSING (STUN STARS ROTATION)
    if (this.p1IsStunned) {
      if (this.p1StunStars) this.p1StunStars.rotation += 0.18;
      this.p1Body.setVelocityX(this.p1Body.velocity.x * 0.85);
      if (time >= this.p1StunEndTime) {
        this.p1IsStunned = false;
        if (this.p1StunStars) this.p1StunStars.setVisible(false);
      }
    }

    if (this.p2IsStunned) {
      if (this.p2StunStars) this.p2StunStars.rotation += 0.18;
      this.p2Body.setVelocityX(this.p2Body.velocity.x * 0.85);
      if (time >= this.p2StunEndTime) {
        this.p2IsStunned = false;
        if (this.p2StunStars) this.p2StunStars.setVisible(false);
      }
    }

    // 5. ANIMASI BOBBLEHEAD BERJALAN KHAS HEAD BASKETBALL
    if (!this.p1IsStunned && Math.abs(this.p1Body.velocity.x) > 30 && (this.p1Body.blocked.down || this.p1Body.touching.down)) {
      this.p1Head.y = -34 + Math.sin(time * 0.02) * 3;
      if (this.p1Foot) this.p1Foot.rotation = Math.sin(time * 0.02) * 0.25;
    } else if (!this.p1IsStunned) {
      this.p1Head.y = -34;
      if (this.p1Foot) this.p1Foot.rotation = 0;
    }

    if (!this.p2IsStunned && Math.abs(this.p2Body.velocity.x) > 30 && (this.p2Body.blocked.down || this.p2Body.touching.down)) {
      this.p2Head.y = -34 + Math.sin(time * 0.02) * 3;
      if (this.p2Foot) this.p2Foot.rotation = Math.sin(time * 0.02) * 0.25;
    } else if (!this.p2IsStunned) {
      this.p2Head.y = -34;
      if (this.p2Foot) this.p2Foot.rotation = 0;
    }

    // 6. KONTROL PLAYER 1 (Hanya jika tidak sedang pusing / stunned)
    const speed = 220;
    if (!this.p1IsStunned) {
      if (this.p1IsDashing) {
        if (time >= this.p1DashEndTime) {
          this.p1IsDashing = false;
        } else {
          this.p1Body.setVelocityX(this.p1Body.velocity.x * 0.96);
        }
      } else {
        let p1MoveX = 0;
        if (this.keyA?.isDown || this.touchP1Left) p1MoveX -= speed;
        if (this.keyD?.isDown || this.touchP1Right) p1MoveX += speed;
        this.p1Body.setVelocityX(p1MoveX);
      }

      // Deteksi Double-Tap Tombol A (Kiri) dan D (Kanan) untuk Dash di PC
      if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
        if (time - this.p1LastLeftTapTime < this.DOUBLE_TAP_WINDOW) {
          this.triggerDash(false, true); // Double Tap Kiri = Dash Mundur
        }
        this.p1LastLeftTapTime = time;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
        if (time - this.p1LastRightTapTime < this.DOUBLE_TAP_WINDOW) {
          this.triggerDash(true, true); // Double Tap Kanan = Dash Maju
        }
        this.p1LastRightTapTime = time;
      }

      // Lompat / Double Jump: SPASI (dan W)
      if (Phaser.Input.Keyboard.JustDown(this.keySpace) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
        this.performJump(true);
      }

      // Pukul / Tembak / Slam Dunk (F & U)
      if (Phaser.Input.Keyboard.JustDown(this.keyF) || Phaser.Input.Keyboard.JustDown(this.keyU)) {
        this.performP1Action();
      }

      // Tendang (R & J)
      if (Phaser.Input.Keyboard.JustDown(this.keyR) || Phaser.Input.Keyboard.JustDown(this.keyJ)) {
        this.triggerKick(true);
      }

      // Shortcut Tunggal Dash: Q = Dash Kiri (Mundur), E = Dash Kanan (Maju)
      if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
        this.triggerDash(false, true); // Dash Mundur / Kiri
      } else if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.triggerDash(true, true); // Dash Maju / Kanan
      } else if (Phaser.Input.Keyboard.JustDown(this.keyK)) {
        const isForward = !this.keyA?.isDown;
        this.triggerDash(isForward, true);
      }

      // 🔥 SUPER POWER DUNK / 3-PT (G)
      if (Phaser.Input.Keyboard.JustDown(this.keyG)) {
        this.triggerSuperDunkOrShot(true);
      }
    }

    // 7. KONTROL PLAYER 2 / KOMPUTER AI
    if (this.mode === 'pvp') {
      if (!this.p2IsStunned) {
        if (this.p2IsDashing) {
          if (time >= this.p2DashEndTime) {
            this.p2IsDashing = false;
          } else {
            this.p2Body.setVelocityX(this.p2Body.velocity.x * 0.96);
          }
        } else {
          let p2MoveX = 0;
          if (this.keyLeft?.isDown) p2MoveX -= speed;
          if (this.keyRight?.isDown) p2MoveX += speed;
          this.p2Body.setVelocityX(p2MoveX);
        }

        // Deteksi Double-Tap Panah Kiri dan Kanan untuk P2
        if (Phaser.Input.Keyboard.JustDown(this.keyLeft)) {
          if (time - this.p2LastLeftTapTime < this.DOUBLE_TAP_WINDOW) {
            this.triggerDash(true, false); // Dash Maju bagi P2
          }
          this.p2LastLeftTapTime = time;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyRight)) {
          if (time - this.p2LastRightTapTime < this.DOUBLE_TAP_WINDOW) {
            this.triggerDash(false, false); // Dash Mundur bagi P2
          }
          this.p2LastRightTapTime = time;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
          this.performJump(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
          this.performP2ShootOrDunk();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keySlash)) {
          this.triggerPunch(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyL)) {
          this.triggerSuperDunkOrShot(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyShift)) {
          const isForward = !this.keyRight?.isDown;
          this.triggerDash(isForward, false);
        }
      }
    } else if (this.mode === 'ai') {
      if (!this.p2IsStunned) {
        this.updateAiBot();
      }
    }

    // 8. DETEKSI BOLA MASUK RING (BASKET DETECTION)
    this.checkBasketScored();
  }

  /**
   * AI Bot Basketball
   */
  private updateAiBot(): void {
    if (this.isBasketPaused || this.isGameOver) {
      this.p2Body.setVelocityX(0);
      return;
    }

    if (this.p2IsDashing) {
      if (this.time.now >= this.p2DashEndTime) {
        this.p2IsDashing = false;
      } else {
        this.p2Body.setVelocityX(this.p2Body.velocity.x * 0.96);
        return;
      }
    }

    const ballX = this.ballContainer.x;
    const ballY = this.ballContainer.y;
    const p2X = this.p2.x;
    const distToBall = Phaser.Math.Distance.Between(p2X, this.p2.y, ballX, ballY);
    const distToP1 = Phaser.Math.Distance.Between(p2X, this.p2.y, this.p1.x, this.p1.y);

    // AI Gunakan Super Dunk/Shot Jika Penuh & Dekat Bola!
    if (this.p2Power >= 100 && distToBall < 130) {
      this.triggerSuperDunkOrShot(false);
      return;
    }

    if (ballX > this.scale.width * 0.4) {
      if (ballX < p2X - 25) {
        this.p2Body.setVelocityX(-190);
      } else if (ballX > p2X + 25) {
        this.p2Body.setVelocityX(190);
      } else {
        this.p2Body.setVelocityX(0);
      }
    } else {
      const defendX = this.scale.width * 0.65;
      if (p2X < defendX - 30) this.p2Body.setVelocityX(160);
      else if (p2X > defendX + 30) this.p2Body.setVelocityX(-160);
      else this.p2Body.setVelocityX(0);
    }

    // AI Lompat atau Double Jump
    if (distToBall < 110 && ballY < this.p2.y - 40) {
      if (this.p2Body.blocked.down || this.p2JumpCount === 1) {
        this.performJump(false);
      }
    }

    // AI Shoot / Dunk
    if (distToBall < 115 && Phaser.Math.Between(1, 10) <= 4) {
      this.performP2ShootOrDunk();
    } else if (distToP1 < 80 && Phaser.Math.Between(1, 10) <= 3) {
      this.triggerPunch(false);
    }
  }

  /**
   * Bantuan Magnetik Silinder Ring Basket (Magnetic Funnel & Swish Assist)
   * Mengarahkan bola meluncur mulus ke tengah jaring saat bola turun di atas ring
   */
  private applyHoopMagnetAssist(): void {
    if (this.isBasketPaused || !this.ballBody || !this.ballContainer) return;
    const bx = this.ballContainer.x;
    const by = this.ballContainer.y;
    const bVy = this.ballBody.velocity.y;

    // Hanya aktif jika bola sedang jatuh ke bawah (bVy > 20)
    if (bVy <= 20) return;

    // Cek Silinder Ring Kiri (Pemain 2)
    const distToLeftRim = Math.abs(bx - this.leftRimX);
    if (distToLeftRim < 48 && by >= this.leftRimY - 55 && by <= this.leftRimY + 18) {
      const pullDir = this.leftRimX - bx;
      this.ballBody.velocity.x = this.ballBody.velocity.x * 0.72 + pullDir * 3.2;
    }

    // Cek Silinder Ring Kanan (Pemain 1)
    const distToRightRim = Math.abs(bx - this.rightRimX);
    if (distToRightRim < 48 && by >= this.rightRimY - 55 && by <= this.rightRimY + 18) {
      const pullDir = this.rightRimX - bx;
      this.ballBody.velocity.x = this.ballBody.velocity.x * 0.72 + pullDir * 3.2;
    }
  }

  /**
   * Deteksi Masuk Ring (Generous Hitbox & Net Swish Friction)
   */
  private checkBasketScored(): void {
    if (this.isBasketPaused || this.isGameOver) return;
    const now = this.time.now;
    if (now - this.lastScoredTime < 1600) return;

    const bx = this.ballContainer.x;
    const by = this.ballContainer.y;
    const bVy = this.ballBody.velocity.y;

    // Bola harus turun ke bawah memasuki bibir jaring (bVy > 15)
    if (bVy < 15) return;

    // 1. Bola Masuk ke Ring Kiri (Gol untuk P2)
    if (Math.abs(bx - this.leftRimX) < 38 && Math.abs(by - this.leftRimY) < 28) {
      this.lastScoredTime = now;
      this.ballBody.setVelocity(this.ballBody.velocity.x * 0.22, Math.min(bVy, 220));
      this.handleBasketScored(2);
      return;
    }

    // 2. Bola Masuk ke Ring Kanan (Gol untuk P1)
    if (Math.abs(bx - this.rightRimX) < 38 && Math.abs(by - this.rightRimY) < 28) {
      this.lastScoredTime = now;
      this.ballBody.setVelocity(this.ballBody.velocity.x * 0.22, Math.min(bVy, 220));
      this.handleBasketScored(1);
      return;
    }
  }

  /**
   * Eksekusi Perayaan Masuk Ring
   */
  private handleBasketScored(scoringPlayer: 1 | 2): void {
    this.isBasketPaused = true;
    this.soundManager.playGoal();
    this.cameras.main.shake(250, 0.02);

    const netGfx = scoringPlayer === 1 ? this.rightNetGfx : this.leftNetGfx;
    if (netGfx) {
      this.tweens.add({
        targets: netGfx,
        scaleX: 1.25,
        duration: 80,
        yoyo: true,
        repeat: 3,
      });
    }

    const width = this.scale.width;
    const wasSuperGoal = this.isSuperShotActive;
    this.isSuperShotActive = false;

    const isSlamDunk = Math.abs(this.ballBody.velocity.y) > 280;
    const is3Pointer = this.lastShotDistance > 380;
    const points = is3Pointer ? 3 : 2;

    let bannerMsg = '';
    if (this.mode === 'practice') {
      this.p1Score += points;
      this.practiceStreak += 1;
      bannerMsg = wasSuperGoal
        ? '🔥 METEOR SUPER DUNK!! +3'
        : isSlamDunk
        ? '🔥 SLAM DUNK!! +2'
        : is3Pointer
        ? '🎯 3-POINTER SWISH!! +3'
        : '🏀 SWISH!! +2';
      this.streakText.setText(`🔥 STREAK: ${this.practiceStreak} BERUNTUN!`);
    } else {
      if (scoringPlayer === 1) {
        this.p1Score += points;
        const dmg = wasSuperGoal ? 35 : isSlamDunk ? 25 : is3Pointer ? 25 : 18;
        this.p2Hp = Math.max(0, this.p2Hp - dmg);
        this.addPower(false, 35); // Comeback power boost
        bannerMsg = wasSuperGoal
          ? `🔥 METEOR SUPER DUNK ${this.playerName}! 💥`
          : isSlamDunk
          ? `🔥 SLAM DUNK ${this.playerName}! 💥`
          : is3Pointer
          ? `🎯 3-POINTER ${this.playerName}! +3`
          : `🏀 2-POINTER ${this.playerName}!`;
      } else {
        this.p2Score += points;
        const dmg = wasSuperGoal ? 35 : isSlamDunk ? 25 : is3Pointer ? 25 : 18;
        this.p1Hp = Math.max(0, this.p1Hp - dmg);
        this.addPower(true, 35); // Comeback power boost
        bannerMsg = wasSuperGoal
          ? '💀 BOT METEOR SUPER DUNK! 💥'
          : isSlamDunk
          ? '💀 BOT SLAM DUNK! 💥'
          : is3Pointer
          ? '🎯 BOT 3-POINTER! +3'
          : '🏀 BOT 2-POINTER!';
      }
      this.updateHpBars(width);
    }

    this.scoreboardText.setText(`${this.p1Score} - ${this.p2Score}`);

    this.bannerText.setText(bannerMsg);
    this.bannerText.setAlpha(1);
    this.bannerText.setScale(0.5);

    this.tweens.add({
      targets: this.bannerText,
      scale: 1.15,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1100, () => {
          this.tweens.add({
            targets: this.bannerText,
            alpha: 0,
            scale: 0.6,
            duration: 200,
            onComplete: () => {
              if (this.mode !== 'practice' && (this.p1Hp <= 0 || this.p2Hp <= 0)) {
                this.handleGameOver(this.p1Hp > 0 ? 1 : 2);
              } else {
                this.resetBallAndPlayers();
              }
            },
          });
        });
      },
    });
  }

  /**
   * Reset Bola & Karakter
   */
  private resetBallAndPlayers(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const groundY = height - 90;

    this.p1Body.reset(width * 0.28, groundY - 60);
    this.p2Body.reset(width * 0.72, groundY - 60);
    this.p1JumpCount = 0;
    this.p2JumpCount = 0;

    this.ballBody.reset(width / 2, groundY - 140);
    this.ballBody.setVelocity(0, -260);

    this.isBasketPaused = false;
  }

  /**
   * Waktu Habis
   */
  private handleTimeUp(): void {
    let winner: 1 | 2 | 0 = 0;
    if (this.p1Score > this.p2Score) winner = 1;
    else if (this.p2Score > this.p1Score) winner = 2;
    else if (this.p1Hp > this.p2Hp) winner = 1;
    else if (this.p2Hp > this.p1Hp) winner = 2;

    this.handleGameOver(winner);
  }

  /**
   * Game Over
   */
  private handleGameOver(winner: 1 | 2 | 0): void {
    this.isGameOver = true;
    this.soundManager.playWhistle();

    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

    const isPvp = this.mode === 'pvp';
    const winTitle = winner === 1
      ? (isPvp ? '🏆 MENANG DUEL PVP! 🏆\n⚡ DAPAT STIK MENANG! 🏒' : '🏆 KAMU MENANG! 🏆')
      : winner === 2
        ? '💀 KAMU KALAH! 💀'
        : '🤝 PERTANDINGAN SERI! 🤝';

    const titleColor = winner === 1 ? '#22c55e' : winner === 2 ? '#ef4444' : '#fbbf24';

    this.add.text(width / 2, height * 0.35, winTitle, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: isPvp && winner === 1 ? '24px' : '32px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.46, `SKOR AKHIR: ${this.p1Score} - ${this.p2Score}`, {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Teks Reward dari API Laravel
    const rewardText = this.add.text(width / 2, height * 0.53, '🎁 Menyimpan Statistik & Hadiah...', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '13px',
      color: '#facc15',
      backgroundColor: '#090b10',
      padding: { x: 8, y: 4 },
      align: 'center',
    }).setOrigin(0.5);

    // Panggil API Laravel
    const matchResult = winner === 1 ? 'win' : winner === 2 ? 'loss' : 'draw';
    let userId = '';
    let userEmail = '';
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (u.id) userId = String(u.id);
      if (u.email) userEmail = u.email;
    } catch (e) {}

    fetch('/api/sports/match-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Name': this.playerName,
        'X-User-Id': userId,
        'X-User-Email': userEmail,
      },
      body: JSON.stringify({
        sport: 'basketball',
        mode: this.mode,
        result: matchResult,
        player_name: this.playerName,
        player_score: this.p1Score,
        opponent_score: this.p2Score,
        streak: this.practiceStreak,
        user_id: userId,
        email: userEmail,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.status === 'success' && data.rewards) {
          const r = data.rewards;
          let rMsg = `🎁 HADIAH: +${r.gold} KOIN • +${r.exp} EXP`;
          if (r.diamonds > 0) rMsg += ` • +${r.diamonds} DIAMOND 💎`;
          if (r.pvp_sticks > 0) {
            rMsg += `\n🔥 +1 STIK MENANG KHUSUS PVP! (Streak: ${r.current_pvp_streak}x • Total: ${r.total_pvp_sticks} 🏒)`;
          }
          rewardText.setText(rMsg);

          if (data.user) {
            EventBus.emit('player-stats-updated', {
              gold: data.user.gold,
              diamonds: data.user.diamonds,
              exp: data.user.exp,
              level: data.user.level,
            });
            try {
              const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
              u.gold = data.user.gold;
              u.diamonds = data.user.diamonds;
              u.exp = data.user.exp;
              u.level = data.user.level;
              localStorage.setItem('raden_player_user', JSON.stringify(u));
              localStorage.setItem('raden_player_gold', String(data.user.gold));
              localStorage.setItem('raden_player_diamonds', String(data.user.diamonds));
            } catch (e) {}
          }
        } else {
          rewardText.setText('');
        }
      })
      .catch(() => {
        rewardText.setText('');
      });

    const retryBtn = this.add.rectangle(width / 2 - 90, height * 0.63, 150, 42, 0x22c55e);
    retryBtn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - 90, height * 0.63, '🔄 MAIN LAGI', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '13px',
      color: '#000000',
    }).setOrigin(0.5);

    retryBtn.on('pointerdown', () => {
      this.soundManager.playSuccess();
      this.scene.restart({
        mode: this.mode,
        name: this.playerName,
        avatar: this.playerAvatar,
        returnX: this.returnX,
        returnY: this.returnY,
      });
    });

    const exitBtn = this.add.rectangle(width / 2 + 90, height * 0.63, 150, 42, 0xef4444);
    exitBtn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2 + 90, height * 0.63, '🚪 KELUAR', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5);

    exitBtn.on('pointerdown', () => {
      this.soundManager.playClick();
      this.exitToWorld();
    });
  }

  /**
   * Kembali ke Lapangan Terbuka
   */
  private exitToWorld(): void {
    // Jika sedang latihan dan berhasil mencetak skor, simpan poin dan streaknya ke API
    if (this.mode === 'practice' && (this.p1Score > 0 || this.practiceStreak > 0)) {
      let userId = '';
      let userEmail = '';
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.id) userId = String(u.id);
        if (u.email) userEmail = u.email;
      } catch (e) {}

      fetch('/api/sports/match-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Name': this.playerName,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          sport: 'basketball',
          mode: 'practice',
          result: 'practice',
          player_name: this.playerName,
          player_score: this.p1Score,
          opponent_score: 0,
          streak: this.practiceStreak,
          user_id: userId,
          email: userEmail,
        }),
      }).catch(() => {});
    }

    try {
      localStorage.removeItem('raden_active_minigame');
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', '/world');
      }
    } catch (e) {}

    fetch('/api/sports/session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-User-Name': this.playerName },
      body: JSON.stringify({ player_name: this.playerName }),
    }).catch(() => {});

    EventBus.emit('minigame-active', false);
    EventBus.emit('switch-scene', {
      scene: 'WorldScene',
      spawnPos: { x: this.returnX, y: this.returnY },
    });
  }
}
