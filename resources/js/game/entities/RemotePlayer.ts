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

    // Proporsi Karakter HD: w = ~119.5px x h = 177px, di dalam grid 1x2 (120x240px)
    this.charHeight = 177;
    this.charWidth = 119.5;
    this.setEntityHeight(this.charHeight);

    // Sprite karakter visual: Pose Diam Menghadap Depan (bayangan sudah menyatu di aset)
    const initialKey = `player-${this.gender}-idle-front`;
    this.sprite = scene.add.sprite(0, 48, initialKey);
    this.sprite.setOrigin(0.5, 1.0);
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
   * Menyesuaikan ukuran tampilan sprite secara dinamis agar sesuai rasio aspek 100% dari aset asli Figma
   * Menjaga tinggi karakter 177px dan lebar proporsional (~119.5px) di dalam ubin 1x2 (120x240px)
   */
  private adjustSpriteScale(): void {
    if (!this.sprite) return;
    const frame = this.sprite.frame;
    const realH = frame ? (frame.realHeight || frame.height) : 586;
    const realW = frame ? (frame.realWidth || frame.width) : 395;
    const aspect = realH > 0 ? (realW / realH) : 0.674;
    this.charHeight = 177;
    this.charWidth = Math.round(this.charHeight * aspect * 100) / 100;
    this.sprite.setDisplaySize(this.charWidth, this.charHeight);
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
