/**
 * ============================================================================
 * FILE: resources/js/game/entities/RemotePlayer.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Kelas OOP turunan `Entity` yang mewakili pemain lain di open world yang terhubung
 * melalui jaringan internet / multiplayer WebSocket.
 * 
 * FITUR:
 * - Proporsi ukuran 1x2 petak grid (X: 1 petak, Y: 2 petak) seragam dengan local player.
 * - Karakter Male & Female dengan animasi berjalan 9-frame & pose diam.
 * - Linear Interpolation (Lerp) untuk pergerakan mulus.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Entity } from './Entity';
import { IAvatarCustomization, Direction } from '../types';
import { SoundManager } from '../core/SoundManager';

export class RemotePlayer extends Entity {
  /** Data kustomisasi avatar pemain lain */
  private avatar: IAvatarCustomization;

  /** Gender karakter remote ('male' | 'female') */
  private gender: 'male' | 'female';

  /** Lebar karakter visual (1 petak grid) */
  private charWidth: number;

  /** Tinggi karakter visual (2 petak grid) */
  private charHeight: number;

  /** Objek sprite visual karakter remote */
  private sprite: Phaser.GameObjects.Sprite;

  /** Kunci animasi yang sedang aktif diputar */
  private currentAnimKey: string = '';

  /** Koordinat X tujuan interpolasi */
  private targetX: number;

  /** Koordinat Y tujuan interpolasi */
  private targetY: number;

  /** Waktu penerimaan paket jaringan terakhir (ms) */
  private lastPacketTime: number = 0;

  /** Status apakah pemain jarak jauh sedang bergerak */
  private isMoving: boolean = false;

  /**
   * Konstruktor Pemain Remote (Pemain Lain)
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
    super(scene, x, y, id, name, hp, maxHp, 220);
    this.avatar = avatar;
    this.gender = avatar?.gender === 'female' ? 'female' : 'male';
    this.targetX = x;
    this.targetY = y;
    this.lastPacketTime = Date.now();

    // Proporsi Karakter 1x2 Grid: w = 120px x h = 240px (sesuai aset Figma 480x960px)
    this.charHeight = 177;
    this.charWidth = 120;
    this.setEntityHeight(this.charHeight);

    // Sprite karakter visual: Pose Diam Menghadap Depan, pas di tengah petak 1x2 grid (0, -60)
    const initialKey = `player-${this.gender}-idle-front`;
    this.sprite = scene.add.sprite(0, -60, initialKey);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(120, 240);
    this.add(this.sprite);

    this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => {
      this.adjustSpriteScale();
    });
    this.adjustSpriteScale();

    // Matikan physics body arcade agar tidak bertabrakan atau ditarik paksa oleh world physics loop
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
      body.moves = false;
      body.enable = false;
    }
  }

  private isJumping: boolean = false;
  private currentJumpZ: number = 0;
  private jumpVelocityZ: number = 0;

  private currentSquashX: number = 1.0;
  private currentSquashY: number = 1.0;
  private whiteFlashTimer: Phaser.Time.TimerEvent | null = null;
  private landingSquashTween: Phaser.Tweens.Tween | null = null;

  private lastAfkTickTime: number = 0;

  /**
   * Memicu efek kilat siluet putih pada avatar remote player saat melompat
   */
  public triggerJumpWhiteFlash(durationMs: number = 160): void {
    if (!this.sprite || !this.sprite.active || !this.scene) return;

    if (this.whiteFlashTimer) {
      this.whiteFlashTimer.remove();
      this.whiteFlashTimer = null;
    }

    (this.sprite as any).setTintFill(0xffffff);

    this.whiteFlashTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.sprite && this.sprite.active) {
        this.sprite.clearTint();
      }
      this.whiteFlashTimer = null;
    });
  }

  public setSquashStretch(sx: number, sy: number): void {
    this.currentSquashX = sx;
    this.currentSquashY = sy;
    this.applySpriteTransform();
  }

  public applySpriteTransform(): void {
    if (!this.sprite) return;
    const baseW = 120;
    const baseH = 240;
    const curW = baseW * this.currentSquashX;
    const curH = baseH * this.currentSquashY;
    const feetY = 60 - Math.max(0, this.currentJumpZ);

    this.sprite.setDisplaySize(curW, curH);
    this.sprite.y = feetY - curH / 2;
  }

  /**
   * Memicu visual lompatan ketika pemain lain melompat (Multiplayer Jump)
   */
  public triggerJump(jumpCount: number = 1): void {
    this.isJumping = true;
    if (jumpCount === 1) {
      this.currentJumpZ = Math.max(0, this.currentJumpZ);
      this.jumpVelocityZ = 640;
    } else {
      this.jumpVelocityZ = 540;
      this.showSpeechBubble('⭐ Double Jump!', 750);
    }
    SoundManager.getInstance().playJump(jumpCount === 2);

    this.triggerJumpWhiteFlash(150);

    if (this.landingSquashTween) {
      this.landingSquashTween.stop();
      this.landingSquashTween = null;
    }
    this.currentSquashX = 1.22;
    this.currentSquashY = 0.80;
    this.setSquashStretch(this.currentSquashX, this.currentSquashY);
    this.scene.time.delayedCall(42, () => {
      if (this.isJumping) {
        this.currentSquashX = 0.82;
        this.currentSquashY = 1.24;
        this.setSquashStretch(this.currentSquashX, this.currentSquashY);
      }
    });
  }

  /**
   * Menerima pembaruan status posisi dan pergerakan dari WebSocket server
   */
  public setNetworkState(x: number, y: number, direction: Direction, isMoving: boolean): void {
    if (typeof x === 'number' && !isNaN(x)) {
      const dx = x - this.x;
      const dy = (typeof y === 'number' && !isNaN(y) ? y : this.targetY) - this.y;
      // Jika selisih posisi sangat besar (> 180px, misal baru spawn/teleport), langsung snap ke koordinat asli
      if (dx * dx + dy * dy > 32400) {
        this.x = x;
        if (typeof y === 'number' && !isNaN(y)) this.y = y;
      }
      this.targetX = x;
    }
    if (typeof y === 'number' && !isNaN(y)) this.targetY = y;
    if (direction) this.currentDirection = direction;
    this.isMoving = !!isMoving;
    this.lastPacketTime = Date.now();
  }

  public update(time: number, delta: number): void {
    this.updateFloatingElementsScale();

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distSq = dx * dx + dy * dy;

    // 1. Interpolasi pergerakan posisi: snap jika sangat dekat (< 1px) untuk mencegah getar/jitter
    if (distSq < 1.0) {
      this.x = this.targetX;
      this.y = this.targetY;
    } else {
      const lerp = Math.min(1.0, (delta / 1000) * 14);
      this.x += dx * lerp;
      this.y += dy * lerp;
    }

    // 2. Evaluasi status berjalan vs diam secara cerdas (Dead reckoning auto-idle)
    // Jika jarak ke target sudah tercapai (< 2.5px) ATAU paket terakhir sudah lebih dari 180ms:
    // Remote player PASTI sedang IDLE (mencegah bug jalan di tempat / glitch lompat)
    const timeSincePacket = Date.now() - this.lastPacketTime;
    const isStationary = distSq < 6.25; // dist < 2.5px
    const isPacketStale = this.lastPacketTime > 0 && timeSincePacket > 200;

    const shouldWalk = this.isMoving && !isStationary && !isPacketStale;

    if (shouldWalk) {
      if (this.isAfk) {
        this.setAfk(false);
      }
      // Perbarui arah hadap otomatis mengikuti vektor arah jika bergerak dominan
      if (Math.abs(dx) > Math.abs(dy) + 2) {
        this.currentDirection = dx > 0 ? 'right' : 'left';
      } else if (Math.abs(dy) > Math.abs(dx) + 2) {
        this.currentDirection = dy > 0 ? 'down' : 'up';
      }
      this.playWalkAnimation();
    } else {
      this.playIdlePose();
    }

    // Update timer durasi AFK remote player secara realtime detik per detik
    if (this.isAfk) {
      if (this.lastAfkTickTime === 0) this.lastAfkTickTime = time;
      if (time - this.lastAfkTickTime >= 1000) {
        this.lastAfkTickTime = time;
        this.setAfk(true, (this as any).afkDurationSeconds + 1);
      }
    } else {
      this.lastAfkTickTime = 0;
    }

    // 3. Update animasi melompat visual remote player
    if (this.isJumping) {
      const dt = Math.min(0.05, delta / 1000);
      this.jumpVelocityZ += -1400 * dt;
      this.currentJumpZ += this.jumpVelocityZ * dt;

      // Update Deformasi Squishy Mario dinamis selama remote player di udara
      let targetSx = 1.0;
      let targetSy = 1.0;
      if (this.jumpVelocityZ > 120) {
        targetSx = 0.84;
        targetSy = 1.20;
      } else if (this.jumpVelocityZ < -160) {
        targetSx = 0.90;
        targetSy = 1.12;
      } else {
        targetSx = 1.02;
        targetSy = 0.98;
      }

      this.currentSquashX += (targetSx - this.currentSquashX) * Math.min(1.0, dt * 14);
      this.currentSquashY += (targetSy - this.currentSquashY) * Math.min(1.0, dt * 14);
      this.applySpriteTransform();

      if (this.nameTag) this.nameTag.y = -165 - Math.max(0, this.currentJumpZ);
      if (this.speechBubble) this.speechBubble.y = -this.charHeight - 50 - Math.max(0, this.currentJumpZ);

      // Sentuh tanah / selesai melompat
      if (this.currentJumpZ <= 0 && this.jumpVelocityZ <= 0) {
        this.isJumping = false;
        this.currentJumpZ = 0;
        this.jumpVelocityZ = 0;
        if (this.nameTag) this.nameTag.y = -165;
        if (this.speechBubble) this.speechBubble.y = -this.charHeight - 50;

        // EFEK SQUISHY MENDARAT ALA MARIO (Impact Squash & Springy Bounce Recoil)
        this.currentSquashX = 1.28;
        this.currentSquashY = 0.74;
        this.setSquashStretch(this.currentSquashX, this.currentSquashY);

        if (this.landingSquashTween) {
          this.landingSquashTween.stop();
        }
        const squashTarget = { sx: 1.28, sy: 0.74 };
        this.landingSquashTween = this.scene.tweens.add({
          targets: squashTarget,
          sx: 1.0,
          sy: 1.0,
          duration: 170,
          ease: 'Back.easeOut',
          onUpdate: () => {
            this.currentSquashX = squashTarget.sx;
            this.currentSquashY = squashTarget.sy;
            this.setSquashStretch(squashTarget.sx, squashTarget.sy);
          },
          onComplete: () => {
            this.currentSquashX = 1.0;
            this.currentSquashY = 1.0;
            this.setSquashStretch(1.0, 1.0);
            this.landingSquashTween = null;
          },
        });
      }
    }
  }

  /**
   * Memutar animasi jalan remote player
   */
  private playWalkAnimation(): void {
    if (!this.sprite || !this.sprite.anims) return;

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
      this.currentAnimKey = animKey;
      this.sprite.anims.play(animKey, true);
      this.adjustSpriteScale();
    }
  }

  /**
   * Menampilkan pose diam (Idle) remote player
   */
  private playIdlePose(): void {
    if (!this.sprite) return;

    if (this.sprite.anims && this.sprite.anims.isPlaying) {
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

    // Hanya ubah tekstur jika berbeda agar tidak terjadi glitch redraw frame
    if (this.sprite.texture.key !== idleKey) {
      this.sprite.setTexture(idleKey);
      this.adjustSpriteScale();
    }
  }

  /**
   * Menyesuaikan ukuran tampilan sprite secara stabil (1x2 grid: 120x240px)
   */
  private adjustSpriteScale(): void {
    this.applySpriteTransform();
  }

  /**
   * Menampilkan reaksi ekspresi wajah asli remote player di atas kepala karakter
   * @param type 'normal' | 'smile' | 'shock' | 'angry'
   */
  public triggerExpression(type: 'normal' | 'smile' | 'shock' | 'angry'): void {
    const textureKey = `expr-${this.gender}-${type}`;
    this.showExpressionReaction(textureKey);
  }

  /** Mengambil data avatar remote player */
  public getAvatar(): IAvatarCustomization {
    return this.avatar;
  }

  /** Mengambil gender remote player */
  public getGender(): 'male' | 'female' {
    return this.gender;
  }

  /**
   * Mengaktifkan interaksi klik/tap pada pemain jarak jauh untuk membuka modal profil
   */
  public makeClickable(onClicked: () => void): void {
    // Area sentuh mencakup seluruh tubuh karakter (w: 100px, h: 220px dari kepala sampai kaki)
    this.setInteractive(new Phaser.Geom.Rectangle(-50, -165, 100, 220), Phaser.Geom.Rectangle.Contains);
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation?.();
      onClicked();
    });

    if (this.sprite) {
      this.sprite.setInteractive({ useHandCursor: true });
      this.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event?.stopPropagation?.();
        onClicked();
      });
    }

    if (this.nameTag) {
      this.nameTag.setInteractive({ useHandCursor: true });
      this.nameTag.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event?.stopPropagation?.();
        onClicked();
      });
    }
  }
}
