/**
 * ============================================================================
 * FILE: resources/js/game/entities/Player.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Kelas OOP turunan `Entity` yang mewakili karakter lokal yang dikendalikan oleh
 * pengguna (pemain saat ini).
 * 
 * FITUR:
 * - Proporsi ukuran 1x2 petak grid (X: 1 petak, Y: 2 petak) sesuai standar RPG.
 * - Karakter Male & Female dengan aset tekstur visual terpisah.
 * - Animasi jalan 9-frame (depan, belakang, samping) & pose diam (idle directional).
 * - Input keyboard (WASD & Panah).
 * - Sinkronisasi posisi ke WebSocket server.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Entity } from './Entity';
import { IAvatarCustomization, Direction } from '../types';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { CharacterController } from '../controllers/CharacterController';

export class Player extends Entity {
  /** Controller modular pergerakan, lompat 2.5D dengan garis titik jatuh, dan mancing */
  private controller!: CharacterController;

  /** Offset ketinggian visual Z saat melompat */
  private visualYOffset: number = 0;

  /** Data kustomisasi avatar pemain */
  private avatar: IAvatarCustomization;

  /** Gender karakter ('male' | 'female') */
  private gender: 'male' | 'female';

  /** Lebar karakter visual (1 petak grid) */
  private charWidth: number;

  /** Tinggi karakter visual (2 petak grid) */
  private charHeight: number;

  /** Objek sprite visual karakter */
  private sprite: Phaser.GameObjects.Sprite;

  /** Kunci animasi yang sedang aktif diputar */
  private currentAnimKey: string = '';

  /** Objek penangkap tombol panah keyboard */
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  /** Objek penangkap tombol keyboard W, A, S, D */
  private keysWASD!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  /** Vektor arah kontrol joystick analog virtual (khusus mobile) */
  private joystickVector: { x: number; y: number } | null = null;

  /** Timestamp pengiriman data posisi terakhir ke WebSocket server (untuk throttling) */
  private lastSentTime: number = 0;

  /** Koordinat X terakhir yang telah dikirim ke server */
  private lastX: number = 0;

  /** Koordinat Y terakhir yang telah dikirim ke server */
  private lastY: number = 0;

  /** Status apakah karakter sedang berdialog dengan NPC */
  private isDialogueActive: boolean = false;

  /** Status apakah karakter saat ini sedang bergerak atau diam */
  private isMoving: boolean = false;

  /** Arah hadap terakhir untuk mendeteksi perubahan arah gerak */
  private lastDirection: Direction = 'down';

  /** Referensi ke singleton NetworkManager */
  private networkManager: NetworkManager;

  /** Target koordinat tujuan navigasi Point & Click / Tap-to-move */
  private targetDestination: { x: number; y: number } | null = null;

  /** Callback yang dipanggil sesampainya di tujuan point-and-click */
  private onArrivalCallback: (() => void) | null = null;

  /** Timestamp aktivitas terakhir untuk deteksi AFK (1 menit / 60 detik) */
  private lastActivityTime: number = Date.now();

  /** Detik terakhir saat teks AFK diperbarui */
  private lastAfkUpdateSeconds: number = 0;

  /**
   * Konstruktor Karakter Pemain Lokal
   * @param scene Phaser Scene aktif
   * @param x Koordinat X spawn
   * @param y Koordinat Y spawn
   * @param id ID lokal pemain ('local_player')
   * @param name Nama panggilan pemain
   * @param avatar Kustomisasi avatar
   * @param hp Nilai HP awal
   * @param maxHp Nilai Max HP
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    name: string,
    avatar: IAvatarCustomization,
    hp: number = 100,
    maxHp: number = 100
  ) {
    // Kecepatan gerak disesuaikan ke 380 px/s agar lincah, sigap, dan sinkron dengan animasi langkah
    let effectiveName = name;
    if (!effectiveName || effectiveName === 'Petualang') {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name) effectiveName = u.name;
      } catch (e) {}
    }
    super(scene, x, y, id, effectiveName, hp, maxHp, 380);
    this.avatar = avatar;
    this.gender = avatar?.gender === 'female' ? 'female' : 'male';
    this.networkManager = NetworkManager.getInstance();

    // Proporsi Karakter 1x2 Grid (1x lebar 120px, 2y tinggi 240px sesuai aset Figma 480x960px)
    this.charHeight = 177;
    this.charWidth = 120;
    this.setEntityHeight(this.charHeight);

    // Sprite karakter visual: Pose awal Diam Menghadap Depan, pas di tengah petak 1x2 grid (0, -60)
    const initialKey = `player-${this.gender}-idle-front`;
    this.sprite = scene.add.sprite(0, -60, initialKey);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(120, 240);
    this.add(this.sprite);

    // 3. Kotak tabrakan fisik Arcade di bagian kaki karakter (1x1 tile)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(70, 36);
      body.setOffset(-35, 12);
      body.setDrag(0, 0);
      body.setFriction(0, 0);
      body.setDamping(false);
    }

    this.setupInput(scene);
    this.controller = new CharacterController(this, scene);

    // Tangani kehilangan fokus jendela (buka aplikasi lain / switch tab) agar tidak freeze
    scene.game.events.on(Phaser.Core.Events.BLUR, () => {
      if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      }
      this.isMoving = false;
      this.updateAnimation(false);
    });

    // Tangani status dialog NPC aktif: kunci pergerakan karakter seketika
    const onDialogueActive = (active: boolean) => {
      this.isDialogueActive = !!active;
      if (active) {
        if (this.body) {
          (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
        this.joystickVector = null;
        this.isMoving = false;
        this.updateAnimation(false);
        if (this.scene.scene.key === 'WorldScene') {
          this.networkManager.sendMovement(this.x, this.y, this.currentDirection, false);
        }
      }
    };
    EventBus.on('dialogue-active', onDialogueActive);

    // Tangani input kontrol analog joystick virtual dari layar sentuh mobile
    const onJoystickMove = (vec: { x: number; y: number }) => {
      this.joystickVector = vec;
      this.targetDestination = null;
      this.onArrivalCallback = null;
    };
    const onJoystickEnd = () => {
      this.joystickVector = null;
      if (this.isMoving) {
        this.isMoving = false;
        this.updateAnimation(false);
        if (this.scene.scene.key === 'WorldScene') {
          this.networkManager.sendMovement(this.x, this.y, this.currentDirection, false);
        }
      }
    };
    EventBus.on('joystick-move', onJoystickMove);
    EventBus.on('joystick-end', onJoystickEnd);

    // Tangani input pengguna global (ketik, klik, tap) untuk reset timer AFK 1 menit
    const onUserAction = () => {
      this.resetActivity();
    };
    window.addEventListener('keydown', onUserAction);
    window.addEventListener('pointerdown', onUserAction);

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      window.removeEventListener('keydown', onUserAction);
      window.removeEventListener('pointerdown', onUserAction);
      EventBus.off('dialogue-active', onDialogueActive);
      EventBus.off('joystick-move', onJoystickMove);
      EventBus.off('joystick-end', onJoystickEnd);
    });

    this.lastX = x;
    this.lastY = y;
  }

  /**
   * Mengatur ulang timer aktivitas saat pemain melakukan aksi (bergerak/menekan tombol/klik)
   */
  public resetActivity(): void {
    this.lastActivityTime = Date.now();
    if (this.isAfk) {
      this.setAfk(false);
      this.lastAfkUpdateSeconds = 0;
      if (this.scene.scene.key === 'WorldScene' || this.scene.scene.key === 'SchoolScene') {
        this.networkManager.sendAfk(false, 0);
      }
    }
  }

  /** Memperbarui avatar pemain saat diganti dari lemari pakaian */
  public setAvatar(newAvatar: IAvatarCustomization): void {
    if (!newAvatar) return;
    this.avatar = newAvatar;
    this.gender = newAvatar.gender === 'female' ? 'female' : 'male';
    this.updateAnimation(this.isMoving);
  }

  /** Memperbarui nama pemain dan plat nama di atas kepala */
  public override setName(newName: string): this {
    super.setName(newName);
    this.setEntityName(newName);
    return this;
  }

  /**
   * Mengatur listener tombol keyboard WASD dan tombol Panah
   * @param scene Phaser Scene
   */
  private setupInput(scene: Phaser.Scene): void {
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      // Bersihkan global captures agar browser tidak mem-preventDefault tombol saat mengetik di form input
      scene.input.keyboard.clearCaptures();

      this.keysWASD = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
      };
    }
  }

  /** Mengambil data avatar kustomisasi pemain */
  public getAvatar(): IAvatarCustomization {
    return this.avatar;
  }

  private lastAuthCheckTime: number = 0;
  private isUserAuthedCache: boolean = true;
  private lastAspectWidth: number = 0;

  /**
   * Mengecek apakah pemain diizinkan bergerak.
   * Pemain tidak boleh bergerak jika:
   * 1. Berada di tampilan Lobby (window.location.pathname === '/')
   * 2. Belum login atau daftar akun (dicek berkala, bukan setiap frame)
   * 3. Sedang dalam dialog NPC atau sedang mengetik di input form
   */
  public isMovementLocked(): boolean {
    if (this.isDialogueActive) return true;
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return true;
    if (typeof window !== 'undefined' && window.location.pathname === '/') return true;

    const now = Date.now();
    if (now - this.lastAuthCheckTime > 2500) {
      this.lastAuthCheckTime = now;
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        this.isUserAuthedCache = Boolean(u && (u.id || u.name));
      } catch (e) {
        this.isUserAuthedCache = true;
      }
    }

    return !this.isUserAuthedCache;
  }

  public getController(): CharacterController {
    return this.controller;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getCursors(): Phaser.Types.Input.Keyboard.CursorKeys {
    return this.cursors;
  }

  public getKeysWASD() {
    return this.keysWASD;
  }

  public setDirection(dir: Direction): void {
    this.currentDirection = dir;
  }

  private currentSquashX: number = 1.0;
  private currentSquashY: number = 1.0;
  private whiteFlashTimer: Phaser.Time.TimerEvent | null = null;

  /**
   * Memicu efek kilat siluet putih pada avatar selama sepersekian detik saat melompat
   */
  public triggerJumpWhiteFlash(durationMs: number = 160): void {
    if (!this.sprite || !this.sprite.active || !this.scene) return;

    if (this.whiteFlashTimer) {
      this.whiteFlashTimer.remove();
      this.whiteFlashTimer = null;
    }

    // Set siluet putih murni pada avatar sprite
    (this.sprite as any).setTintFill(0xffffff);

    this.whiteFlashTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.sprite && this.sprite.active) {
        this.sprite.clearTint();
      }
      this.whiteFlashTimer = null;
    });
  }

  /**
   * Mengatur deformasi squash & stretch ala Mario (Squishy Avatar)
   * Menjamin titik tumpu kaki selalu berjangkar stabil di lantai (feet anchor)
   * @param sx Skala lebar horizontal (squash/stretch)
   * @param sy Skala tinggi vertikal (squash/stretch)
   */
  public setSquashStretch(sx: number, sy: number): void {
    this.currentSquashX = sx;
    this.currentSquashY = sy;
    this.applySpriteTransform();
  }

  /**
   * Mengaplikasikan ukuran tampilan sprite dengan memperhitungkan visualYOffset dan squash/stretch
   */
  public applySpriteTransform(): void {
    if (!this.sprite) return;
    const baseW = 120;
    const baseH = 240;
    const curW = baseW * this.currentSquashX;
    const curH = baseH * this.currentSquashY;
    const feetY = 60 + this.visualYOffset;

    this.sprite.setDisplaySize(curW, curH);
    this.sprite.y = feetY - curH / 2;
  }

  /**
   * Mengatur ketinggian visual Z karakter (saat melompat ke udara)
   * Menggeser sprite dan elemen kepala secara harmonis tanpa merusak koordinat fisik tubuh
   */
  public setVisualYOffset(offsetY: number): void {
    this.visualYOffset = offsetY;
    this.applySpriteTransform();
    if (this.nameTag) {
      this.nameTag.y = -165 + offsetY;
    }
    if (this.speechBubble) {
      this.speechBubble.y = -this.entityHeight - 50 + offsetY;
    }
    if (this.expressionBubble) {
      const hasSpeech = Boolean(this.speechBubble && this.speechBubble.active);
      this.expressionBubble.y = (hasSpeech ? -this.entityHeight - 125 : -this.entityHeight - 85) + offsetY;
    }
    if (this.speakingIndicator) {
      this.speakingIndicator.y = -this.entityHeight - 40 + offsetY;
    }
    if (this.afkContainer) {
      this.afkContainer.y = -185 + offsetY;
    }
  }

  public getVisualYOffset(): number {
    return this.visualYOffset;
  }

  /** Memicu lompatan karakter melalui CharacterController */
  public jump(): boolean {
    return this.controller ? this.controller.jump() : false;
  }

  /** Memulai memancing melalui CharacterController */
  public startFishing(): boolean {
    return this.controller ? this.controller.startFishing() : false;
  }

  /** Menghentikan memancing */
  public stopFishing(message?: string): void {
    this.controller?.stopFishing(message);
  }

  public isJumping(): boolean {
    return this.controller ? this.controller.getIsJumping() : false;
  }

  public isFishing(): boolean {
    return this.controller ? this.controller.getFishingState() !== 'none' : false;
  }

  /**
   * Menggerakkan karakter secara otomatis menuju titik target (Point & Click / Tap-to-move)
   * @param targetX Koordinat X tujuan dalam pixel dunia game
   * @param targetY Koordinat Y tujuan dalam pixel dunia game
   * @param onArrival Callback yang dipanggil saat karakter tiba di tujuan
   */
  public navigateTo(targetX: number, targetY: number, onArrival?: () => void): void {
    if (this.isMovementLocked()) return;
    this.controller.navigateTo(targetX, targetY, onArrival);
  }

  /**
   * Membatalkan pergerakan otomatis point-and-click
   */
  public stopNavigation(): void {
    this.controller?.stopNavigation();
  }

  /** Alias kompatibilitas untuk pembatalan navigasi */
  public stopMoveTo(): void {
    this.stopNavigation();
  }

  /**
   * Game loop yang dieksekusi 60 FPS
   */
  public update(time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Perbarui ukuran skala chat bubble dan ekspresi mengikuti zoom kamera
    this.updateFloatingElementsScale();

    // Jika pergerakan terkunci (Lobby, Belum Login/Daftar, Dialog, Input Ketik, Mancing), tahan karakter
    if (this.isMovementLocked()) {
      body.setVelocity(0, 0);
      this.joystickVector = null;
      if (this.isMoving) {
        this.isMoving = false;
        this.updateAnimation(false);
        if (this.scene.scene.key === 'WorldScene') {
          this.networkManager.sendMovement(this.x, this.y, this.currentDirection, false);
        }
      }
      this.controller.update(time, delta);
      return;
    }

    // Jalankan siklus pergerakan, lompat 2.5D, dan mancing melalui CharacterController
    const moveRes = this.controller.update(time, delta);
    const nowMoving = moveRes.isMoving;
    const directionChanged = this.currentDirection !== this.lastDirection;
    const movementStateChanged = nowMoving !== this.isMoving;

    if (movementStateChanged || directionChanged) {
      this.isMoving = nowMoving;
      this.lastDirection = this.currentDirection;
      this.updateAnimation(nowMoving);
    }

    // Deteksi Inaktivitas / AFK (1 menit = 60 detik tidak bergerak & tidak berbuat apa-apa)
    if (nowMoving || this.isJumping() || this.isFishing()) {
      this.resetActivity();
    } else {
      const idleTimeMs = Date.now() - this.lastActivityTime;
      if (idleTimeMs >= 60000) {
        const totalAfkSecs = Math.floor(idleTimeMs / 1000);
        if (!this.isAfk) {
          this.setAfk(true, totalAfkSecs);
          this.lastAfkUpdateSeconds = totalAfkSecs;
          if (this.scene.scene.key === 'WorldScene' || this.scene.scene.key === 'SchoolScene') {
            this.networkManager.sendAfk(true, totalAfkSecs);
          }
        } else if (totalAfkSecs !== this.lastAfkUpdateSeconds) {
          this.lastAfkUpdateSeconds = totalAfkSecs;
          this.setAfk(true, totalAfkSecs);
          if (this.scene.scene.key === 'WorldScene' || this.scene.scene.key === 'SchoolScene') {
            this.networkManager.sendAfk(true, totalAfkSecs);
          }
        }
      }
    }

    // Kirim sinkronisasi jaringan saat pemain berada di WorldScene (Open World) atau SchoolScene (Gedung Sekolah)
    const canSync = this.scene.scene.key === 'WorldScene' || this.scene.scene.key === 'SchoolScene';
    if (!canSync) return;

    // Sinkronisasi data posisi ke server setiap 50ms saat bergerak
    const moved = Math.abs(this.x - this.lastX) > 1 || Math.abs(this.y - this.lastY) > 1;
    if (nowMoving && moved && time - this.lastSentTime > 50) {
      this.lastSentTime = time;
      this.lastX = this.x;
      this.lastY = this.y;
      this.networkManager.sendMovement(this.x, this.y, this.currentDirection, true);
    } else if (movementStateChanged && !nowMoving) {
      this.lastX = this.x;
      this.lastY = this.y;
      this.networkManager.sendMovement(this.x, this.y, this.currentDirection, false);
    } else if (!nowMoving && time - this.lastSentTime > 2500) {
      // Heartbeat posisi diam berkala untuk menjaga sinkronisasi 100% akurat di semua player lain
      this.lastSentTime = time;
      this.lastX = this.x;
      this.lastY = this.y;
      this.networkManager.sendMovement(this.x, this.y, this.currentDirection, false);
    }
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }

  public getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Mengatur animasi berjalan (Movement) dan pose diam (Idle) sesuai arah hadap
   */
  private updateAnimation(moving: boolean): void {
    if (!this.sprite || !this.sprite.anims) return;

    if (moving) {
      let animKey = `player-${this.gender}-walk-down`;
      if (this.currentDirection === 'up') {
        animKey = `player-${this.gender}-walk-up`;
        this.sprite.setFlipX(false);
      } else if (this.currentDirection === 'down') {
        animKey = `player-${this.gender}-walk-down`;
        this.sprite.setFlipX(false);
      } else if (this.currentDirection === 'left') {
        animKey = `player-${this.gender}-walk-side`;
        this.sprite.setFlipX(true);
      } else if (this.currentDirection === 'right') {
        animKey = `player-${this.gender}-walk-side`;
        this.sprite.setFlipX(false);
      }

      if (this.currentAnimKey !== animKey || !this.sprite.anims.isPlaying) {
        const prevAnim = this.sprite.anims.currentAnim;
        const currentProgress = (prevAnim && this.sprite.anims.isPlaying) ? this.sprite.anims.getProgress() : 0;
        this.currentAnimKey = animKey;
        this.sprite.anims.play(animKey, true);
        if (currentProgress > 0 && currentProgress < 1) {
          this.sprite.anims.setProgress(currentProgress);
        }
      }
    } else {
      if (this.sprite.anims.isPlaying) {
        this.sprite.anims.stop();
      }
      this.currentAnimKey = '';

      let idleKey = `player-${this.gender}-idle-front`;
      if (this.currentDirection === 'up') {
        idleKey = `player-${this.gender}-idle-back`;
        this.sprite.setFlipX(false);
      } else if (this.currentDirection === 'down') {
        idleKey = `player-${this.gender}-idle-front`;
        this.sprite.setFlipX(false);
      } else if (this.currentDirection === 'left') {
        idleKey = `player-${this.gender}-idle-side`;
        this.sprite.setFlipX(true);
      } else if (this.currentDirection === 'right') {
        idleKey = `player-${this.gender}-idle-side`;
        this.sprite.setFlipX(false);
      }

      this.sprite.setTexture(idleKey);
      this.applySpriteTransform();
    }
  }

  /**
   * Menyesuaikan ukuran tampilan sprite secara stabil (1x2 grid: 120x240px)
   */
  private adjustSpriteScale(): void {
    this.applySpriteTransform();
  }

  /**
   * Menampilkan reaksi ekspresi wajah asli di atas kepala karakter
   * @param type 'normal' | 'smile' | 'shock' | 'angry'
   */
  public triggerExpression(type: 'normal' | 'smile' | 'shock' | 'angry'): void {
    const textureKey = `expr-${this.gender}-${type}`;
    this.showExpressionReaction(textureKey);
  }
}
