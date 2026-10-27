/**
 * ============================================================================
 * FILE: resources/js/game/scenes/SoccerMiniGameScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Mini Game Sepak Bola 1 vs 1 bergaya arcade HEAD SOCCER.
 * 
 * FITUR UTAMA:
 * 1. Tangan & Kaki Fungsional: Bisa tinju (punch) dan tendang (kick) musuh & bola.
 * 2. Sundulan Kepala (Header): Bola yang mengenai kepala akan disundul melambung ke gawang lawan.
 * 3. Fisika Bola Realistis: Berat bola, pantulan restitusi alami, putaran rotasi (spin), dan gesekan rumput.
 * 4. Double Jump (Lompat 2x): Bisa melompat sekali di tanah dan lompat kedua kali di udara.
 * 5. Dash Forward & Dash Backward: Dash melesat maju atau mundur menghindar.
 * 6. 3 Mode: Latihan Bebas (Practice), PVP (2 Pemain), dan Bot AI.
 * ============================================================================
 */

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { IAvatarCustomization } from '../types';

export class SoccerMiniGameScene extends Phaser.Scene {
  private mode: 'practice' | 'pvp' | 'ai' = 'ai';
  private playerName: string = 'Petualang';
  private playerAvatar: IAvatarCustomization | null = null;
  private opponentName: string = 'BOT AI';
  private opponentServer: string = '';
  private opponentPvpStreak: number = 0;
  private opponentPvpSticks: number = 0;
  private returnX: number = 3480;
  private returnY: number = 6040;

  // Objek Fisika & Karakter Player 1
  private p1!: Phaser.GameObjects.Container;
  private p1Body!: Phaser.Physics.Arcade.Body;
  private p1Head!: Phaser.GameObjects.Arc;
  private p1Arm!: Phaser.GameObjects.Rectangle;
  private p1Fist!: Phaser.GameObjects.Arc;
  private p1Leg!: Phaser.GameObjects.Rectangle;
  private p1Foot!: Phaser.GameObjects.Rectangle;
  private p1IsKicking: boolean = false;
  private p1IsPunching: boolean = false;
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
  private p2IsKicking: boolean = false;
  private p2IsPunching: boolean = false;
  private p2CanDash: boolean = true;
  private p2JumpCount: number = 0;
  private p2IsDashing: boolean = false;
  private p2DashEndTime: number = 0;
  private p2LastLeftTapTime: number = 0;
  private p2LastRightTapTime: number = 0;

  // Bola Sepak & Fisika
  private ballContainer!: Phaser.GameObjects.Container;
  private ballBody!: Phaser.Physics.Arcade.Body;
  private lastHeaderTime: number = 0;
  private lastCombatHitTime: number = 0;

  // Boundaries & Gawang
  private ground!: Phaser.GameObjects.Rectangle;
  private leftCrossbar!: Phaser.GameObjects.Rectangle;
  private rightCrossbar!: Phaser.GameObjects.Rectangle;

  // Skor & Status Game
  private p1Score: number = 0;
  private p2Score: number = 0;
  private p1Hp: number = 100;
  private p2Hp: number = 100;
  private timeRemaining: number = 60; // detik
  private practiceStreak: number = 0;
  private isGameOver: boolean = false;
  private isGoalPaused: boolean = false;

  // Keyboard Keys Player 1
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key; // Kick
  private keyU!: Phaser.Input.Keyboard.Key; // Punch
  private keyF!: Phaser.Input.Keyboard.Key; // Tendang
  private keyR!: Phaser.Input.Keyboard.Key; // Pukul
  private keyK!: Phaser.Input.Keyboard.Key; // Dash (Arah)
  private keyQ!: Phaser.Input.Keyboard.Key; // Dash Mundur Langsung
  private keyE!: Phaser.Input.Keyboard.Key; // Dash Maju Langsung

  // Keyboard Keys Player 2 (PVP)
  private keyLeft!: Phaser.Input.Keyboard.Key;
  private keyRight!: Phaser.Input.Keyboard.Key;
  private keyUp!: Phaser.Input.Keyboard.Key;
  private keyEnter!: Phaser.Input.Keyboard.Key; // Kick
  private keySlash!: Phaser.Input.Keyboard.Key; // Punch
  private keyShift!: Phaser.Input.Keyboard.Key; // Dash

  // Touch Virtual States (Mobile)
  private touchP1Left: boolean = false;
  private touchP1Right: boolean = false;
  private touchP1Jump: boolean = false;
  private touchP1Kick: boolean = false;
  private touchP1Punch: boolean = false;
  private touchP1Dash: boolean = false;

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
  private btnSuperText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;

  // Super Power Shot & Stun (Head Soccer Style!)
  private p1Power: number = 0; // 0 - 100
  private p2Power: number = 0; // 0 - 100
  private p1IsStunned: boolean = false;
  private p1StunEndTime: number = 0;
  private p2IsStunned: boolean = false;
  private p2StunEndTime: number = 0;
  private p1StunStars!: Phaser.GameObjects.Container;
  private p2StunStars!: Phaser.GameObjects.Container;
  private isSuperShotActive: boolean = false;
  private superShotShooter: 1 | 2 = 1;
  private keyG!: Phaser.Input.Keyboard.Key; // P1 Super Shot
  private keyL!: Phaser.Input.Keyboard.Key; // P2 Super Shot

  private soundManager = SoundManager.getInstance();

  constructor() {
    super('SoccerMiniGameScene');
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
    this.isGoalPaused = false;
    this.p1JumpCount = 0;
    this.p2JumpCount = 0;
    this.lastHeaderTime = 0;
    this.lastCombatHitTime = 0;
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
          sport: 'soccer',
          mode: this.mode,
          name: this.playerName,
          avatar: this.playerAvatar,
          returnPos: { x: this.returnX, y: this.returnY },
          timestamp: Date.now(),
        })
      );
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', `/minigame/soccer?mode=${this.mode}`);
      }
    } catch (e) {}

    fetch('/api/sports/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Name': this.playerName },
      body: JSON.stringify({
        sport: 'soccer',
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

    // 1. LATAR BELAKANG STADION HEAD SOCCER (Modern Night Stadium)
    this.createStadiumBackground(width, height, groundY);

    // 2. FISIKA WORLD & BATAS (Snappy Arcade Gravity, Cepat Saat Turun)
    this.physics.world.setBounds(0, 0, width, groundY);
    this.physics.world.gravity.y = 1350;

    // Tanah Lapangan Rumput
    this.ground = this.add.rectangle(width / 2, groundY + 45, width, 90, 0x15803d);
    this.physics.add.existing(this.ground, true);

    // 3. GAWANG KIRI & KANAN (Goal Posts & Crossbars)
    const goalWidth = 70;
    const goalHeight = 150;
    const goalY = groundY - goalHeight / 2;

    // Mistar Gawang Kiri
    this.leftCrossbar = this.add.rectangle(goalWidth / 2, groundY - goalHeight, goalWidth, 12, 0xffffff);
    this.physics.add.existing(this.leftCrossbar, true);

    const leftNet = this.add.rectangle(goalWidth / 2, goalY, goalWidth, goalHeight, 0xffffff, 0.15);
    leftNet.setStrokeStyle(2, 0xffffff, 0.6);

    // Mistar Gawang Kanan
    this.rightCrossbar = this.add.rectangle(width - goalWidth / 2, groundY - goalHeight, goalWidth, 12, 0xffffff);
    this.physics.add.existing(this.rightCrossbar, true);

    const rightNet = this.add.rectangle(width - goalWidth / 2, goalY, goalWidth, goalHeight, 0xffffff, 0.15);
    rightNet.setStrokeStyle(2, 0xffffff, 0.6);

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

    // 6. BOLA SEPAK REALISTIS (Real Physics Arcade Soccer Ball)
    this.ballContainer = this.createRealisticSoccerBall(width / 2, groundY - 140);
    this.ballBody = this.ballContainer.body as Phaser.Physics.Arcade.Body;
    this.ballBody.setGravityY(-250); // Bola tetap melayang anggun di udara

    // 7. TABRAKAN & KOLESI (Colliders)
    this.physics.add.collider(this.p1, this.ground, () => {
      this.p1JumpCount = 0; // Reset double jump saat mendarat
    });
    this.physics.add.collider(this.p2, this.ground, () => {
      this.p2JumpCount = 0; // Reset double jump saat mendarat
    });

    // Bola dengan Tanah & Mistar Gawang
    this.physics.add.collider(this.ballContainer, this.ground, () => {
      if (Math.abs(this.ballBody.velocity.y) > 90) {
        this.soundManager.playKick();
      }
    });
    this.physics.add.collider(this.ballContainer, this.leftCrossbar, () => {
      this.soundManager.playKick();
    });
    this.physics.add.collider(this.ballContainer, this.rightCrossbar, () => {
      this.soundManager.playKick();
    });

    // Tabrakan Bola dengan Pemain (Pantulan Badan & Deteksi Sundulan Kepala)
    this.physics.add.collider(this.ballContainer, this.p1, () => {
      this.handlePlayerBallCollision(this.p1, this.p1Body, this.ballBody, true);
    });
    this.physics.add.collider(this.ballContainer, this.p2, () => {
      this.handlePlayerBallCollision(this.p2, this.p2Body, this.ballBody, false);
    });

    // 8. SETUP KEYBOARD KONTROL
    this.setupKeyboardControls();

    // 9. SETUP HUD & TAMPILAN HEAD SOCCER
    this.createHeadSoccerUI(width, height);

    // 10. SETUP TOMBOL VIRTUAL SENTUH MOBILE
    this.createTouchControls(width, height, groundY);

    // 11. TIMER HITUNG MUNDUR (Khusus Mode PVP & Komputer)
    if (this.mode !== 'practice') {
      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          if (this.isGameOver || this.isGoalPaused) return;
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

    // Beritahu HUD react bahwa kita sedang di mini game
    EventBus.emit('location-updated', 'STADION MINI: HEAD SOCCER 1 VS 1');
    EventBus.emit('minigame-active', true);
  }

  /**
   * Membuat latar belakang stadion megah
   */
  private createStadiumBackground(width: number, height: number, groundY: number): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x020617, 0x020617, 0x0f172a, 0x0f172a, 1);
    sky.fillRect(0, 0, width, height);

    const lights = this.add.graphics();
    lights.fillStyle(0x38bdf8, 0.08);
    lights.fillTriangle(0, 0, width * 0.4, groundY, 0, groundY);
    lights.fillTriangle(width, 0, width * 0.6, groundY, width, groundY);

    // Papan Iklan LED
    const ledBoard = this.add.rectangle(width / 2, groundY - 14, width - 40, 24, 0x020617);
    ledBoard.setStrokeStyle(1.5, 0x38bdf8, 0.5);
    const ledText = this.add.text(width / 2, groundY - 14, '★ RADENWORLD HEAD SOCCER CUP 2026 ★ DOUBLE JUMP & DASH READY ★', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '11px',
      color: '#38bdf8',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: ledText,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Garis Rumput Lapangan
    const turf = this.add.graphics();
    for (let tx = 0; tx < width; tx += 90) {
      turf.fillStyle((Math.floor(tx / 90) % 2 === 0) ? 0x16a34a : 0x15803d, 1);
      turf.fillRect(tx, groundY, 90, 90);
    }
    turf.lineStyle(3, 0xffffff, 0.85);
    turf.strokeLineShape(new Phaser.Geom.Line(0, groundY + 1, width, groundY + 1));
    turf.strokeLineShape(new Phaser.Geom.Line(width / 2, groundY + 1, width / 2, groundY + 90));
    turf.strokeCircle(width / 2, groundY + 45, 38);
  }

  /**
   * Membuat Bola Sepak dengan Pola Pentagonal & Rotasi Fisika
   */
  private createRealisticSoccerBall(x: number, y: number): Phaser.GameObjects.Container {
    const radius = 16;
    const ballBase = this.add.circle(0, 0, radius, 0xffffff);
    ballBase.setStrokeStyle(2, 0x0f172a);

    // Pola Pentagon Hitam Khas Bola Sepak Asli
    const pCenter = this.add.circle(0, 0, 5, 0x0f172a);
    const p1 = this.add.circle(-8, -5, 3.5, 0x0f172a);
    const p2 = this.add.circle(8, -5, 3.5, 0x0f172a);
    const p3 = this.add.circle(0, 9, 3.5, 0x0f172a);
    const p4 = this.add.circle(-7, 7, 3, 0x0f172a);
    const p5 = this.add.circle(7, 7, 3, 0x0f172a);

    const container = this.add.container(x, y, [ballBase, pCenter, p1, p2, p3, p4, p5]);
    this.physics.add.existing(container);

    const body = container.body as Phaser.Physics.Arcade.Body;
    body.setCircle(radius, -radius, -radius);
    body.setCollideWorldBounds(true);
    // Restitusi realistis bola sepak (0.70 di rumput asli)
    body.setBounce(0.70, 0.70);
    // Gesekan udara alami
    body.setDrag(0.99, 0.99);

    return container;
  }

  /**
   * Membuat Karakter Bobblehead Lengkap Khas Head Soccer
   */
  private createHeadCharacter(
    x: number,
    y: number,
    facingRight: boolean,
    jerseyColor: number,
    nameLabel: string
  ): Phaser.GameObjects.Container {
    const dir = facingRight ? 1 : -1;

    // 1. Kepala Raksasa Bobblehead (Head Soccer)
    const head = this.add.circle(0, -34, 28, 0xfed7aa);
    head.setStrokeStyle(2.5, 0xd97706);
    head.setName('head');

    // Pipi Merona Kartun (Blush)
    const blush = this.add.circle(dir * 14, -26, 4.5, 0xf87171, 0.45);

    // Headband Atletik Khas Head Soccer
    const headbandColor = facingRight ? 0xef4444 : 0x3b82f6;
    const headband = this.add.rectangle(0, -44, 52, 9, headbandColor);
    headband.setStrokeStyle(1.5, 0x0f172a);
    const headbandStripe = this.add.rectangle(0, -44, 52, 2.5, 0xffffff);

    // Rambut Spiky di Atas Headband
    const hair = this.add.rectangle(0, -53, 44, 12, 0x1e293b);
    hair.setStrokeStyle(1, 0x0f172a);

    // Mata Kartun Ekspresif Besar
    const eyeX = dir * 10;
    const eyeWhite = this.add.circle(eyeX, -34, 6.5, 0xffffff);
    eyeWhite.setStrokeStyle(1.5, 0x0f172a);
    const eyePupil = this.add.circle(eyeX + dir * 1.5, -34, 3.8, 0x0f172a);
    eyePupil.setName('pupil');
    const eyeGleam = this.add.circle(eyeX + dir * 0.5, -36, 1.8, 0xffffff);
    const brow = this.add.rectangle(eyeX, -42, 12, 3, 0x0f172a);

    // Mulut Senyum Khas Head Soccer
    const mouth = this.add.arc(dir * 10, -22, 5, 0, 180, false, 0x0f172a);
    mouth.setName('mouth');

    // 2. Tubuh Jersey
    const bodyRect = this.add.rectangle(0, 4, 30, 36, jerseyColor);
    bodyRect.setStrokeStyle(2, 0xffffff, 0.85);

    // Nomor Punggung Mini
    const numText = this.add.text(0, 4, facingRight ? '10' : '7', {
      fontFamily: 'Chakra Petch, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 3. Tangan & Sarung Tinju Melayang (Arm & Fist)
    const armX = dir * 14;
    const arm = this.add.rectangle(armX, 4, 18, 7, jerseyColor);
    arm.setStrokeStyle(1.5, 0x0f172a);
    arm.setName('arm');

    const fist = this.add.circle(armX + dir * 11, 4, 7, 0xfed7aa);
    fist.setStrokeStyle(1.5, 0xd97706);
    fist.setName('fist');

    // 4. Kaki & Sepatu Bola Melayang (Leg & Cleats)
    const legX = dir * 8;
    const leg = this.add.rectangle(legX, 22, 9, 16, 0x334155);
    leg.setName('leg');

    const foot = this.add.rectangle(legX + dir * 6, 30, 22, 10, 0xffffff);
    foot.setStrokeStyle(1.5, 0x0f172a);
    foot.setName('foot');
    const cleatStripe = this.add.rectangle(legX + dir * 6, 30, 6, 10, 0x000000);

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
      bodyRect,
      numText,
      leg,
      foot,
      cleatStripe,
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
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J); // Kick Alt
      this.keyU = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U); // Punch Alt
      this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); // Tendang (F)
      this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); // Pukul (R)
      this.keyG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G); // 🔥 SUPER SHOT (G)
      this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K); // Dash
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Dash Mundur Langsung
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // Dash Maju Langsung

      // P2 Keys (PVP)
      this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER); // Kick
      this.keySlash = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH); // Punch
      this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L); // 🔥 SUPER SHOT P2
      this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT); // Dash

      this.input.keyboard.on('keydown-ESC', () => {
        this.exitToWorld();
      });
    }
  }

  /**
   * UI Head Soccer (Simple, Elegan, Pure Dark, Khas RadenWorld)
   * Responsif di Layar Sempit (Mobile Vertikal/Portrait), Lebar (Landscape), dan PC Desktop.
   */
  private createHeadSoccerUI(width: number, height: number): void {
    const isSmallScreen = width < 640;

    // 1. Tombol Keluar (Minimalis, Pure Dark dengan Hover Gold)
    const backBtnW = isSmallScreen ? 72 : 92;
    const backBtnH = isSmallScreen ? 28 : 30;
    const backBtnX = isSmallScreen ? 46 : 65;
    const backBtnY = isSmallScreen ? 24 : 26;

    const backBtnBg = this.add.rectangle(backBtnX, backBtnY, backBtnW, backBtnH, 0x0a0a0a, 0.95);
    backBtnBg.setStrokeStyle(1, 0x262626);
    backBtnBg.setInteractive({ useHandCursor: true });
    
    const backBtnText = this.add.text(backBtnX, backBtnY, isSmallScreen ? '← KELUAR' : '← KELUAR', {
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

    // 4. Banner Selebrasi Gol (Elegan & Dramatis)
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
      this.add.text(width / 2, height - 20, '⌨️ [Spasi] LOMPAT (2x) • [Q/E] DASH • [F] TENDANG ⚽ • [R] PUKUL 🥊 • [G] SUPER • [A/D] JALAN', {
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
    // SISI KANAN: Lompat (▲), Tinju (🥊), Tendang (⚽), Super (🔥)
    // ========================================================================
    const kickX = width - (isSmall ? 34 : 44);
    const punchX = width - (isSmall ? 84 : 100);
    const jumpX = width - (isSmall ? 134 : 156);
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
    const btnPunch = this.add.circle(punchX, btnY, btnRadius, 0x141414, 0.92);
    btnPunch.setStrokeStyle(1, 0x383838);
    btnPunch.setInteractive();
    this.add.text(punchX, btnY, '🥊', { fontSize: isSmall ? '15px' : '17px' }).setOrigin(0.5);
    btnPunch.on('pointerdown', () => {
      btnPunch.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnPunch, scale: 0.90, duration: 60, yoyo: true });
      this.triggerPunch(true);
    });
    btnPunch.on('pointerup', () => btnPunch.setStrokeStyle(1, 0x383838));
    btnPunch.on('pointerout', () => btnPunch.setStrokeStyle(1, 0x383838));

    // Tombol Tendang (⚽)
    const btnKick = this.add.circle(kickX, btnY, btnRadius, 0x141414, 0.92);
    btnKick.setStrokeStyle(1, 0x383838);
    btnKick.setInteractive();
    this.add.text(kickX, btnY, '⚽', { fontSize: isSmall ? '17px' : '19px' }).setOrigin(0.5);
    btnKick.on('pointerdown', () => {
      btnKick.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnKick, scale: 0.90, duration: 60, yoyo: true });
      this.triggerKick(true);
    });
    btnKick.on('pointerup', () => btnKick.setStrokeStyle(1, 0x383838));
    btnKick.on('pointerout', () => btnKick.setStrokeStyle(1, 0x383838));

    // Tombol Super Shot (🔥)
    const btnSuper = this.add.circle(kickX, superY, isSmall ? 20 : 23, 0x1c1917, 0.92);
    btnSuper.setStrokeStyle(1, 0x44403c);
    btnSuper.setInteractive();
    this.btnSuperP1 = btnSuper;
    this.add.text(kickX, superY, '🔥', { fontSize: isSmall ? '14px' : '16px' }).setOrigin(0.5);
    btnSuper.on('pointerdown', () => {
      btnSuper.setStrokeStyle(1.5, 0xfbbf24);
      this.tweens.add({ targets: btnSuper, scale: 0.90, duration: 60, yoyo: true });
      this.triggerSuperShot(true);
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
      // Lompatan Pertama dari Tanah (Crisp & Snappy)
      body.setVelocityY(-640);
      this.soundManager.playJump(false);
      if (isP1) this.p1JumpCount = 1;
      else this.p2JumpCount = 1;

      // Partikel debu tanah
      this.createJumpParticles(char.x, char.y + 40, false);
    } else if (jumpCount === 1) {
      // Lompatan Kedua di Udara (DOUBLE JUMP!)
      body.setVelocityY(-580);
      this.soundManager.playJump(true);
      if (isP1) this.p1JumpCount = 2;
      else this.p2JumpCount = 2;

      // Cincin udara / Double Jump Wave
      this.createJumpParticles(char.x, char.y + 30, true);
    }
  }

  /**
   * Partikel Efek Lompat & Double Jump
   */
  private createJumpParticles(x: number, y: number, isDouble: boolean): void {
    const count = isDouble ? 8 : 4;
    const color = isDouble ? 0x38bdf8 : 0xffffff;
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

    // Untuk P1 (menghadap kanan): Forward = kanan (+), Back = kiri (-)
    // Untuk P2 (menghadap kiri): Forward = kiri (-), Back = kanan (+)
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
    const color = isP1 ? 0x38bdf8 : 0xf43f5e;
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
    const color = isP1 ? 0x67e8f9 : 0xfb7185;
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
   * Menambahkan Pengukur Kekuatan (Power Gauge) Head Soccer
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
   * Berikan Efek Pusing / Stun pada Karakter (Head Soccer Combat)
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
   * Eksekusi Tembakan Super (Super Power Shot) Khas Head Soccer
   */
  private triggerSuperShot(isP1: boolean): void {
    const currentPower = isP1 ? this.p1Power : this.p2Power;
    if (currentPower < 100 || this.isGoalPaused || this.isGameOver) return;

    if (isP1) this.p1Power = 0;
    else this.p2Power = 0;
    this.updateHpBars(this.scale.width);

    const shooter = isP1 ? this.p1 : this.p2;
    const shooterBody = isP1 ? this.p1Body : this.p2Body;
    const dir = isP1 ? 1 : -1;

    // Efek Layar Menghentak & Flash Oranye Khas Head Soccer
    this.cameras.main.flash(220, 255, 120, 0);
    this.cameras.main.shake(320, 0.025);
    this.soundManager.playGoal();

    // Luncurkan Pemain Sedikit ke Depan
    shooterBody.setVelocity(dir * 320, -140);

    // Aktifkan Status Bola Api Super
    this.isSuperShotActive = true;
    this.superShotShooter = isP1 ? 1 : 2;

    // Posisikan bola di depan penendang jika agak jauh
    const distToBall = Phaser.Math.Distance.Between(shooter.x, shooter.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall > 70) {
      this.ballContainer.setPosition(shooter.x + dir * 35, shooter.y);
    }

    // Tembakan Meteor Api Melesat Cepat ke Gawang
    this.ballBody.setVelocity(dir * 940, -110);

    const bannerText = isP1 ? `🔥 DRAGON FIRE SHOT ${this.playerName}! 💥` : '💀 BOT DRAGON FIRE SHOT! 💥';
    this.showSuperBanner(bannerText);
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

    // Animasi Pukulan Cepat Lurus ke Depan
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

    // 1. Cek Apakah Kena Musuh (Close-Combat Punch)
    const distToEnemy = Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y);
    if (distToEnemy < 75) {
      this.handleCombatHit(attacker, target, targetBody, isP1, false);
      this.addPower(isP1, 12);
    }

    // 2. Cek Apakah Kena Bola (Power Drive Shot)
    const distToBall = Phaser.Math.Distance.Between(attacker.x, attacker.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall < 85) {
      this.ballBody.setVelocity(dir * 640, -140);
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

    // Animasi Ayunan Kaki Melingkar ke Depan Atas
    this.tweens.add({
      targets: [leg, foot],
      angle: dir * 50,
      y: 16,
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

    // 1. Cek Apakah Kena Musuh (Close-Combat Kick)
    const distToEnemy = Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y);
    if (distToEnemy < 78) {
      this.handleCombatHit(attacker, target, targetBody, isP1, true);
      this.addPower(isP1, 14);
    }

    // 2. Cek Apakah Kena Bola (High Arc Power Kick)
    const distToBall = Phaser.Math.Distance.Between(attacker.x, attacker.y, this.ballContainer.x, this.ballContainer.y);
    if (distToBall < 88) {
      this.ballBody.setVelocity(dir * 560, -380);
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

    // Flash merah pada musuh
    this.tweens.add({
      targets: target,
      alpha: 0.3,
      duration: 60,
      yoyo: true,
      repeat: 2,
    });

    // Partikel percikan pukulan 💥
    this.showHitSparks(target.x, target.y);

    // Berikan efek Pusing (Stun) Khas Head Soccer
    this.applyStun(!isP1Attacking, isKick ? 800 : 500);

    // Pengurangan HP (Khusus Mode PVP & AI)
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
   * Partikel Percikan Serangan (Hit Sparks)
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
   * Tangani Tabrakan Bola dengan Pemain (Pantulan & Sundulan Kepala / Header)
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
    const isShooter = (this.superShotShooter === 1 && isP1) || (this.superShotShooter === 2 && !isP1);
    if (this.isSuperShotActive && !isShooter) {
      playerBody.setVelocity(dir * -450, -220);
      this.applyStun(isP1, 1200);
      this.showPopupText(character.x, character.y - 75, '💥 SUPER HIT!', '#ef4444');
      this.cameras.main.shake(220, 0.018);
      return;
    }

    // 2. Cek apakah bola mengenai area atas (Kepala Karakter -> SUNDULAN / HEADER!)
    const isHeadArea = ballBody.y < character.y - 12 && Math.abs(ballBody.x - character.x) < 32;

    if (isHeadArea && now - this.lastHeaderTime > 350) {
      this.lastHeaderTime = now;
      this.soundManager.playHeader();

      // Animasi Sundulan Kepala (Squash & Stretch Khas Head Soccer)
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

      // Bola meluncur tajam ke depan atas hasil sundulan kepala
      ballBody.setVelocity(dir * 480, -460);
      this.showHeaderPopup(character.x, character.y - 70);
      this.addPower(isP1, 22);
      return;
    }

    // 3. Pantulan badan biasa
    this.soundManager.playKick();
    const impulseX = dir * 260 + playerBody.velocity.x * 0.4;
    const impulseY = playerBody.velocity.y < 0 ? -360 : -160;
    ballBody.setVelocity(impulseX, impulseY);
    this.addPower(isP1, 8);
  }

  /**
   * Teks Popup Saat Menyundul Bola
   */
  private showHeaderPopup(x: number, y: number): void {
    this.showPopupText(x, y - 25, '⚽ SUNDUL!', '#facc15');
  }

  /**
   * Loop Update Game
   */
  public update(time: number, delta: number): void {
    if (this.isGameOver) return;

    const speed = 230;

    // 1. UPDATE ROTASI REALISTIS & GESEKAN BOLA SEPAK
    if (this.ballContainer && this.ballBody) {
      this.ballContainer.rotation += (this.ballBody.velocity.x * delta * 0.0035);

      if (this.ballBody.blocked.down) {
        this.ballBody.setDragX(160);
      } else {
        this.ballBody.setDragX(15);
      }
    }

    // 2. PARTIKEL EKOR API SUPER SHOT (Fireball Comet Trail)
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

    // 3. FAST-FALL GRAVITY (Turun Cepat & Snappy di Mini Game)
    if (this.p1Body.velocity.y > 0) {
      this.p1Body.setGravityY(700);
    } else {
      this.p1Body.setGravityY(0);
    }
    if (this.p1Body.blocked.down || this.p1Body.touching.down || Math.abs(this.p1Body.velocity.y) < 5) {
      this.p1JumpCount = 0;
    }

    if (this.p2Body.velocity.y > 0) {
      this.p2Body.setGravityY(700);
    } else {
      this.p2Body.setGravityY(0);
    }
    if (this.p2Body.blocked.down || this.p2Body.touching.down || Math.abs(this.p2Body.velocity.y) < 5) {
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

    // 5. ANIMASI BOBBLEHEAD BERJALAN KHAS HEAD SOCCER
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
          this.triggerDash(false, true);
        }
        this.p1LastLeftTapTime = time;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
        if (time - this.p1LastRightTapTime < this.DOUBLE_TAP_WINDOW) {
          this.triggerDash(true, true);
        }
        this.p1LastRightTapTime = time;
      }

      // Shortcut Dash Alternatif (Q, E, K)
      if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
        this.triggerDash(false, true);
      } else if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.triggerDash(true, true);
      } else if (Phaser.Input.Keyboard.JustDown(this.keyK)) {
        const isForward = !this.keyA?.isDown;
        this.triggerDash(isForward, true);
      }

      // Lompat / Double Jump (W / Spasi)
      if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
        this.performJump(true);
      }

      // Tendang (F & J)
      if (Phaser.Input.Keyboard.JustDown(this.keyF) || Phaser.Input.Keyboard.JustDown(this.keyJ)) {
        this.triggerKick(true);
      }

      // Tinju / Pukul (R & U)
      if (Phaser.Input.Keyboard.JustDown(this.keyR) || Phaser.Input.Keyboard.JustDown(this.keyU)) {
        this.triggerPunch(true);
      }

      // 🔥 SUPER POWER SHOT (G)
      if (Phaser.Input.Keyboard.JustDown(this.keyG)) {
        this.triggerSuperShot(true);
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

        if (Phaser.Input.Keyboard.JustDown(this.keyLeft)) {
          if (time - this.p2LastLeftTapTime < this.DOUBLE_TAP_WINDOW) {
            this.triggerDash(true, false);
          }
          this.p2LastLeftTapTime = time;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyRight)) {
          if (time - this.p2LastRightTapTime < this.DOUBLE_TAP_WINDOW) {
            this.triggerDash(false, false);
          }
          this.p2LastRightTapTime = time;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
          this.performJump(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
          this.triggerKick(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keySlash)) {
          this.triggerPunch(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyL)) {
          this.triggerSuperShot(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyShift)) {
          const isForward = !this.keyRight?.isDown;
          this.triggerDash(isForward, false);
        }
      }
    } else if (this.mode === 'ai') {
      if (!this.p2IsStunned) {
        this.updateAiBotBehavior(speed);
      }
    }

    // 8. DETEKSI GOL KE DALAM GAWANG
    if (!this.isGoalPaused) {
      this.checkGoalDetection();
    }
  }

  /**
   * Logika Kecerdasan Buatan Bot Komputer (AI Bot) Khas Head Soccer
   */
  private updateAiBotBehavior(speed: number): void {
    if (this.isGoalPaused) {
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

    // AI Gunakan Super Shot Jika Penuh & Dekat Bola!
    if (this.p2Power >= 100 && distToBall < 110) {
      this.triggerSuperShot(false);
      return;
    }

    // AI mengejar bola atau bertahan
    if (ballX > this.scale.width * 0.35) {
      if (ballX < p2X - 18) {
        this.p2Body.setVelocityX(-speed);
      } else if (ballX > p2X + 18) {
        this.p2Body.setVelocityX(speed);
      } else {
        this.p2Body.setVelocityX(0);
      }
    } else {
      const defendX = this.scale.width * 0.72;
      if (p2X < defendX - 25) this.p2Body.setVelocityX(speed * 0.85);
      else if (p2X > defendX + 25) this.p2Body.setVelocityX(-speed * 0.85);
      else this.p2Body.setVelocityX(0);
    }

    // AI Lompat atau Double Jump saat bola tinggi
    if (distToBall < 120 && ballY < this.p2.y - 30) {
      if (this.p2Body.blocked.down || this.p2JumpCount === 1) {
        this.performJump(false);
      }
    }

    // AI Dash jika bola lolos
    if (ballX < p2X - 140 && this.p2CanDash && Phaser.Math.Between(1, 10) <= 2) {
      this.triggerDash(true, false);
    }

    // AI Menyerang saat dekat bola atau pemain
    if (distToBall < 80) {
      if (Phaser.Math.Between(1, 10) <= 5) {
        this.triggerKick(false);
      } else if (Phaser.Math.Between(1, 10) <= 3) {
        this.triggerPunch(false);
      }
    } else if (distToP1 < 75) {
      if (Phaser.Math.Between(1, 10) <= 4) {
        this.triggerPunch(false);
      }
    }
  }

  /**
   * Deteksi Gol
   */
  private checkGoalDetection(): void {
    const ballX = this.ballContainer.x;
    const ballY = this.ballContainer.y;
    const groundY = this.scale.height - 90;
    const goalHeight = 150;

    // Gol Masuk Gawang Kiri (P2 / Bot Skor!)
    if (ballX < 65 && ballY > groundY - goalHeight) {
      this.handleGoalScored(2);
      return;
    }

    // Gol Masuk Gawang Kanan (P1 Skor!)
    if (ballX > this.scale.width - 65 && ballY > groundY - goalHeight) {
      this.handleGoalScored(1);
      return;
    }
  }

  /**
   * Perayaan Gol
   */
  private handleGoalScored(scoringPlayer: 1 | 2): void {
    this.isGoalPaused = true;
    this.soundManager.playGoal();
    this.cameras.main.shake(250, 0.015);

    const width = this.scale.width;
    const wasSuperGoal = this.isSuperShotActive;
    this.isSuperShotActive = false;
    let bannerMsg = '';

    if (this.mode === 'practice') {
      this.p1Score += 1;
      this.practiceStreak += 1;
      bannerMsg = wasSuperGoal ? '🔥 DRAGON SUPER GOAL!! ⚽' : '⚽ GOOOOL!! +1 ⚽';
      this.streakText.setText(`🔥 STREAK: ${this.practiceStreak} GOL BERUNTUN!`);
    } else {
      if (scoringPlayer === 1) {
        this.p1Score += 1;
        const dmg = wasSuperGoal ? 35 : 25;
        this.p2Hp = Math.max(0, this.p2Hp - dmg);
        this.addPower(false, 35); // Comeback power boost
        bannerMsg = wasSuperGoal ? `🔥 DRAGON SUPER GOAL ${this.playerName}! 💥` : `⚽ GOOOOL ${this.playerName}! ⚽`;
      } else {
        this.p2Score += 1;
        const dmg = wasSuperGoal ? 35 : 25;
        this.p1Hp = Math.max(0, this.p1Hp - dmg);
        this.addPower(true, 35); // Comeback power boost
        bannerMsg = wasSuperGoal ? '💀 BOT DRAGON SUPER GOAL! 💥' : '💀 BOT MENCETAK GOL! 💀';
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
   * Reset Posisi Bola & Karakter
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
    this.ballBody.setVelocity(0, -180);

    this.isGoalPaused = false;
  }

  /**
   * Waktu 1 Menit Habis
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

    this.add.text(width / 2, height * 0.45, `SKOR AKHIR: ${this.p1Score} - ${this.p2Score}`, {
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
        sport: 'soccer',
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

    // Tombol Main Lagi
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

    // Tombol Keluar
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
   * Kembali ke Dunia Terbuka (WorldScene)
   */
  private exitToWorld(): void {
    // Jika sedang latihan dan berhasil mencetak gol, simpan statistik gol dan streaknya
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
          sport: 'soccer',
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
