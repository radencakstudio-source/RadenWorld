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

  /** Status apakah pemain lain sedang berjalan */
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

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
      body.moves = false;
      body.setSize(70, 36);
      body.setOffset(-35, 12);
    }
  }

  /**
   * Menerima pembaruan status posisi dan pergerakan dari WebSocket server
   */
  public setNetworkState(x: number, y: number, direction: Direction, isMoving: boolean): void {
    this.targetX = x;
    this.targetY = y;
    this.currentDirection = direction;
    this.isMoving = isMoving;
    this.updateAnimation(isMoving);
  }

  public update(time: number, delta: number): void {
    this.updateFloatingElementsScale();
    const lerpFactor = 0.2;
    this.x = Phaser.Math.Linear(this.x, this.targetX, lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this.targetY, lerpFactor);
  }

  /**
   * Mengatur animasi berjalan (Movement) dan pose diam (Idle) pemain remote
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
        this.currentAnimKey = animKey;
        this.sprite.anims.play(animKey, true);
        this.adjustSpriteScale();
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
}
