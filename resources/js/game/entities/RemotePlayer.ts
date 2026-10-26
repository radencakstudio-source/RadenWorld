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
import { IAvatarCustomization, Direction, JumpVisualStage } from '../types';
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

    // Graphics untuk merender joran, senar pancing, dan pelampung saat pemain lain memancing
    this.fishingGraphics = scene.add.graphics();
    this.fishingGraphics.setDepth(this.y + 120);

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      if (this.chargeTimer) this.chargeTimer.remove();
      if (this.inAirTimer) this.inAirTimer.remove();
      if (this.landingTimer) this.landingTimer.remove();
      if (this.whiteFlashTimer) this.whiteFlashTimer.remove();
      if (this.fishingGraphics) {
        this.fishingGraphics.destroy();
      }
    });
  }

  private isJumping: boolean = false;
  private isCharging: boolean = false;
  private currentJumpZ: number = 0;
  private jumpVelocityZ: number = 0;
  private jumpVisualStage: JumpVisualStage = 'none';

  private chargeTimer: Phaser.Time.TimerEvent | null = null;
  private inAirTimer: Phaser.Time.TimerEvent | null = null;
  private landingTimer: Phaser.Time.TimerEvent | null = null;

  private currentSquashX: number = 1.0;
  private currentSquashY: number = 1.0;
  private whiteFlashTimer: Phaser.Time.TimerEvent | null = null;
  private landingSquashTween: Phaser.Tweens.Tween | null = null;

  private lastAfkTickTime: number = 0;

  // Status Sinkronisasi Memancing Multiplayer
  private fishingGraphics: Phaser.GameObjects.Graphics;
  private fishingState: string = 'none';
  private remoteBobberPos: { x: number; y: number } = { x: 0, y: 0 };
  private remoteTargetBobberPos: { x: number; y: number } = { x: 0, y: 0 };
  private fishingStateStartTime: number = 0;

  public setFishingState(state: string, bobberPos?: { x: number; y: number }, targetBobberPos?: { x: number; y: number }): void {
    this.fishingState = state || 'none';
    this.fishingStateStartTime = Date.now();
    if (bobberPos && typeof bobberPos.x === 'number') {
      this.remoteBobberPos = { x: bobberPos.x, y: bobberPos.y };
    }
    if (targetBobberPos && typeof targetBobberPos.x === 'number') {
      this.remoteTargetBobberPos = { x: targetBobberPos.x, y: targetBobberPos.y };
    }
    if (this.fishingState === 'none' && this.fishingGraphics) {
      this.fishingGraphics.clear();
    }
  }

  public getFishingState(): string {
    return this.fishingState;
  }

  public getJumpVisualStage(): JumpVisualStage {
    return this.jumpVisualStage;
  }

  public setJumpVisualStage(stage: JumpVisualStage): void {
    this.jumpVisualStage = stage;
    if (stage !== 'none') {
      this.updateJumpVisual();
    } else {
      this.currentSquashX = 1.0;
      this.currentSquashY = 1.0;
      this.applySpriteTransform();
      if (this.isMoving) {
        this.playWalkAnimation();
      } else {
        this.playIdlePose();
      }
    }
  }

  public updateJumpVisual(): void {
    if (!this.sprite || this.jumpVisualStage === 'none') return;

    if (this.sprite.anims && this.sprite.anims.isPlaying) {
      this.sprite.anims.stop();
    }
    this.currentAnimKey = '';

    let dirKey: 'front' | 'back' | 'side' = 'front';
    if (this.currentDirection === 'up') {
      dirKey = 'back';
      this.sprite.setFlipX(false);
    } else if (this.currentDirection === 'down') {
      dirKey = 'front';
      this.sprite.setFlipX(false);
    } else if (this.currentDirection === 'left') {
      dirKey = 'side';
      this.sprite.setFlipX(true);
    } else if (this.currentDirection === 'right') {
      dirKey = 'side';
      this.sprite.setFlipX(false);
    }

    let stageSubKey = 'takeoff';
    if (this.jumpVisualStage === 'charge') stageSubKey = 'charge';
    else if (this.jumpVisualStage === 'jump') stageSubKey = 'takeoff';
    else if (this.jumpVisualStage === 'inAir') stageSubKey = 'air';
    else if (this.jumpVisualStage === 'landing') stageSubKey = 'landing';

    const textureKey = `player-${this.gender}-jump-${stageSubKey}-${dirKey}`;
    if (this.scene.textures.exists(textureKey) && this.sprite.texture.key !== textureKey) {
      this.sprite.setTexture(textureKey);
    }
    this.applySpriteTransform();
  }

  /**
   * Memicu efek kilat siluet putih pada avatar remote player saat melompat
   * Kompatibel penuh Phaser 3 & Phaser 4 tanpa log deprecation warning
   */
  public triggerJumpWhiteFlash(durationMs: number = 160): void {
    if (!this.sprite || !this.sprite.active || !this.scene) return;

    if (this.whiteFlashTimer) {
      this.whiteFlashTimer.remove();
      this.whiteFlashTimer = null;
    }

    this.sprite.setTint(0xffffff);
    if (typeof (this.sprite as any).setTintMode === 'function') {
      const fillMode = (Phaser as any).TintModes?.FILL ?? 1;
      (this.sprite as any).setTintMode(fillMode);
    }

    this.whiteFlashTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.sprite && this.sprite.active) {
        this.sprite.clearTint();
        if (typeof (this.sprite as any).setTintMode === 'function') {
          const normalMode = (Phaser as any).TintModes?.NORMAL ?? 0;
          (this.sprite as any).setTintMode(normalMode);
        }
      }
      this.whiteFlashTimer = null;
    });
  }

  public setSquashStretch(sx: number, sy: number): void {
    this.currentSquashX = sx;
    this.currentSquashY = sy;
    this.applySpriteTransform();
  }

  public resetSquashStretch(): void {
    this.currentSquashX = 1.0;
    this.currentSquashY = 1.0;
    this.applySpriteTransform();
  }

  public applySpriteTransform(): void {
    if (!this.sprite) return;
    if (this.jumpVisualStage === 'none') {
      this.currentSquashX = 1.0;
      this.currentSquashY = 1.0;
    }
    const baseW = 120;
    const baseH = 240;
    const curW = baseW * this.currentSquashX;
    const curH = baseH * this.currentSquashY;
    const feetY = 60 - Math.max(0, this.currentJumpZ);

    this.sprite.setDisplaySize(curW, curH);
    this.sprite.y = feetY - curH / 2;
  }

  /**
   * Memicu visual lompatan ketika pemain lain melompat (Multiplayer Jump Sync)
   * Lompatan 1 (4 Tahap): Charge -> Jump -> InAir -> Landing
   * Lompatan 2 (3 Tahap): Jump -> InAir -> Landing
   */
  public triggerJump(jumpCount: number = 1): void {
    if (this.chargeTimer) this.chargeTimer.remove();
    if (this.landingTimer) this.landingTimer.remove();
    if (this.landingSquashTween) {
      this.landingSquashTween.stop();
      this.landingSquashTween = null;
      this.resetSquashStretch();
    }

    this.isJumping = true;

    if (jumpCount === 1) {
      // 1. Lompat Pertama (4 Tahap: Charge dulu di tanah)
      this.isCharging = true;
      this.currentJumpZ = 0;
      this.jumpVelocityZ = 0;
      this.setJumpVisualStage('charge');

      // Efek Squishy Halus: Sedikit crouch kompresi wajar (~5%)
      this.currentSquashX = 1.05;
      this.currentSquashY = 0.95;
      this.applySpriteTransform();

      // Durasi charge terlihat jelas (~160ms)
      this.chargeTimer = this.scene.time.delayedCall(160, () => {
        this.isCharging = false;
        if (!this.isJumping) return;

        // 2. Tahap Jump: Lepas landas melesat ke atas menuju max tertinggi
        this.currentJumpZ = 0;
        this.jumpVelocityZ = 660;
        SoundManager.getInstance().playJump(false);
        this.triggerJumpWhiteFlash(150);
        this.setJumpVisualStage('jump');

        // Rocket Stretch halus saat lepas landas
        this.currentSquashX = 0.96;
        this.currentSquashY = 1.05;
        this.applySpriteTransform();
      });
    } else {
      // 2. Double Jump (3 Tahap: Jump langsung di udara)
      this.isCharging = false;
      this.jumpVelocityZ = 560;
      this.showSpeechBubble('⭐ Double Jump!', 750);
      SoundManager.getInstance().playJump(true);
      this.triggerJumpWhiteFlash(150);
      this.setJumpVisualStage('jump');

      // Rocket Stretch halus dorongan kedua
      this.currentSquashX = 0.96;
      this.currentSquashY = 1.05;
      this.applySpriteTransform();
    }
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

    if (this.jumpVisualStage !== 'none') {
      this.updateJumpVisual();
    } else if (shouldWalk) {
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

    // 3. Update animasi melompat visual remote player dengan Squishy Mario Physics
    if (this.isCharging) {
      this.currentJumpZ = 0;
      this.applySpriteTransform();
    } else if (this.isJumping) {
      const dt = Math.min(0.05, delta / 1000);
      this.jumpVelocityZ += -1400 * dt;
      this.currentJumpZ += this.jumpVelocityZ * dt;

      // Evaluasi tahapan lompat berdasarkan fisika vertikal
      let targetStage: JumpVisualStage = 'inAir';
      let targetSx = 1.0;
      let targetSy = 1.0;

      if (this.jumpVelocityZ > 40) {
        // Meluncur naik sebelum mencapai max tertinggi (Subtle Stretch)
        targetStage = 'jump';
        targetSx = 0.96;
        targetSy = 1.05;
      } else if (this.currentJumpZ > 40 || this.jumpVelocityZ >= 0) {
        // Saat sampai atas (Apex) sampai meluncur turun
        targetStage = 'inAir';
        if (Math.abs(this.jumpVelocityZ) <= 100) {
          targetSx = 1.0;
          targetSy = 1.0;
        } else {
          targetSx = 0.98;
          targetSy = 1.03;
        }
      } else {
        // Saat hampir menyentuh ground (Z <= 40 px saat turun)
        targetStage = 'landing';
        targetSx = 1.03;
        targetSy = 0.97;
      }

      if (this.jumpVisualStage !== targetStage) {
        this.setJumpVisualStage(targetStage);
      }

      // Terapkan interpolasi Deformasi Squishy halus selama di udara
      this.currentSquashX += (targetSx - this.currentSquashX) * Math.min(1.0, dt * 12);
      this.currentSquashY += (targetSy - this.currentSquashY) * Math.min(1.0, dt * 12);
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

        SoundManager.getInstance().playLand();

        // Tetap di landing pose saat impact tanah
        this.setJumpVisualStage('landing');

        // EFEK SQUISHY MENDARAT HALUS (Impact Squash wajar 6-7%)
        this.currentSquashX = 1.07;
        this.currentSquashY = 0.93;
        this.setSquashStretch(this.currentSquashX, this.currentSquashY);

        if (this.landingSquashTween) {
          this.landingSquashTween.stop();
        }
        const squashTarget = { sx: 1.07, sy: 0.93 };
        this.landingSquashTween = this.scene.tweens.add({
          targets: squashTarget,
          sx: 1.0,
          sy: 1.0,
          duration: 120,
          ease: 'Quad.easeOut',
          onUpdate: () => {
            this.currentSquashX = squashTarget.sx;
            this.currentSquashY = squashTarget.sy;
            this.setSquashStretch(squashTarget.sx, squashTarget.sy);
          },
          onComplete: () => {
            this.currentSquashX = 1.0;
            this.currentSquashY = 1.0;
            this.resetSquashStretch();
            this.landingSquashTween = null;
            if (!this.isJumping) {
              this.setJumpVisualStage('none');
            }
          },
        });
      }
    }

    // 4. Update visual memancing pemain lain (Multiplayer Fishing Sync)
    this.updateFishing(time, delta);
  }

  /**
   * Menggambar visual joran, senar pancing melengkung, pelampung, dan riak air pemain lain
   */
  private updateFishing(time: number, delta: number): void {
    if (!this.fishingGraphics) return;

    if (this.fishingState === 'none') {
      this.fishingGraphics.clear();
      return;
    }

    this.fishingGraphics.clear();
    this.fishingGraphics.setDepth(this.y + 120);

    const elapsed = Date.now() - this.fishingStateStartTime;

    // A. Fase Charging: Karakter memegang joran condong ke belakang
    if (this.fishingState === 'charging') {
      const hx = this.x + (this.currentDirection === 'left' ? 18 : -18);
      const hy = this.y - 75;
      this.fishingGraphics.lineStyle(3, 0xb45309, 1.0);
      this.fishingGraphics.lineBetween(this.x, this.y - 45, hx, hy);
      return;
    }

    // B. Hitung koordinat pelampung
    let curBobX = this.remoteBobberPos.x || this.x;
    let curBobY = this.remoteBobberPos.y || this.y;

    if (this.fishingState === 'casting') {
      const progress = Math.min(1, elapsed / 380);
      curBobX = Phaser.Math.Linear(this.x, this.remoteTargetBobberPos.x, progress);
      const arcZ = Math.sin(progress * Math.PI) * 45;
      curBobY = Phaser.Math.Linear(this.y - 20, this.remoteTargetBobberPos.y, progress) - arcZ;
    } else if (this.fishingState === 'waiting') {
      const bobY = Math.sin(time * 0.005) * 3;
      curBobY = this.remoteTargetBobberPos.y + bobY;
      curBobX = this.remoteTargetBobberPos.x;
    } else if (this.fishingState === 'bite') {
      const shakeX = (Math.random() - 0.5) * 6;
      const shakeY = 6 + Math.sin(time * 0.04) * 5;
      curBobX = this.remoteTargetBobberPos.x + shakeX;
      curBobY = this.remoteTargetBobberPos.y + shakeY;
    } else if (this.fishingState === 'minigame') {
      const shakeX = (Math.random() - 0.5) * 8;
      const shakeY = 4 + Math.sin(time * 0.04) * 6;
      curBobX = this.remoteTargetBobberPos.x + shakeX;
      curBobY = this.remoteTargetBobberPos.y + shakeY;
    } else if (this.fishingState === 'caught') {
      if (elapsed > 2200) {
        this.fishingState = 'none';
        this.fishingGraphics.clear();
        return;
      }
    }

    // Posisi tangan karakter remote
    const handX = this.x + (this.currentDirection === 'left' ? -20 : this.currentDirection === 'right' ? 20 : 0);
    const handY = this.y - 50;

    // Senar pancing melengkung (Bezier Curve Approximation)
    const midX = (handX + curBobX) / 2;
    const sag = this.fishingState === 'bite' ? -10 : 25;
    const midY = (handY + curBobY) / 2 + sag;

    this.fishingGraphics.lineStyle(1.5, 0xffffff, 0.75);
    this.fishingGraphics.beginPath();
    this.fishingGraphics.moveTo(handX, handY);
    const steps = 16;
    for (let i = 1; i <= steps; i++) {
      const st = i / steps;
      const qx = (1 - st) * (1 - st) * handX + 2 * (1 - st) * st * midX + st * st * curBobX;
      const qy = (1 - st) * (1 - st) * handY + 2 * (1 - st) * st * midY + st * st * curBobY;
      this.fishingGraphics.lineTo(qx, qy);
    }
    this.fishingGraphics.strokePath();

    // Riak air beranimasi di sekitar pelampung
    const rippleRadius = 8 + (Math.sin(time * 0.008) + 1) * 6;
    const rippleAlpha = Math.max(0.1, 0.6 - (rippleRadius / 22));
    this.fishingGraphics.lineStyle(1.5, 0x38bdf8, rippleAlpha);
    this.fishingGraphics.strokeEllipse(curBobX, curBobY + 4, rippleRadius * 2, rippleRadius);

    // Pelampung (Merah di atas, Putih di bawah)
    this.fishingGraphics.fillStyle(0xef4444, 1.0);
    this.fishingGraphics.fillCircle(curBobX, curBobY - 2, 5);
    this.fishingGraphics.fillStyle(0xffffff, 1.0);
    this.fishingGraphics.fillCircle(curBobX, curBobY + 2, 4);

    // Indikator tanda seru jika ikan menyambar
    if (this.fishingState === 'bite') {
      const alertY = this.y - 180 + Math.sin(time * 0.02) * 5;
      this.fishingGraphics.fillStyle(0xef4444, 1.0);
      this.fishingGraphics.fillCircle(this.x, alertY, 14);
      this.fishingGraphics.fillStyle(0xffffff, 1.0);
      this.fishingGraphics.fillRect(this.x - 2, alertY - 8, 4, 10);
      this.fishingGraphics.fillCircle(this.x, alertY + 6, 2.5);
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

  private rawPlayerData: any = null;

  public setRawPlayerData(data: any): void {
    this.rawPlayerData = data;
  }

  public getRawPlayerData(): any {
    return this.rawPlayerData;
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

  public getIsMoving(): boolean {
    return this.isMoving;
  }
}
