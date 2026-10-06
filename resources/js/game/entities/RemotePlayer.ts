/**
 * ============================================================================
 * FILE: resources/js/game/entities/RemotePlayer.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Kelas OOP turunan `Entity` yang mewakili pemain lain di open world yang terhubung
 * melalui jaringan internet / multiplayer WebSocket.
 * 
 * TEKNOLOGI & METODE:
 * - Avatar dinamis sesuai gender, warna kulit, baju, celana, dan topi pemain lain.
 * - Linear Interpolation (Lerp) untuk pergerakan mulus.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Entity } from './Entity';
import { IAvatarCustomization, Direction } from '../types';
import { AvatarGenerator } from '../utils/AvatarGenerator';

export class RemotePlayer extends Entity {
  /** Data kustomisasi avatar pemain lain */
  private avatar: IAvatarCustomization;

  /** Objek gambar/sprite visual karakter remote */
  private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

  /** Koordinat X tujuan interpolasi */
  private targetX: number;

  /** Koordinat Y tujuan interpolasi */
  private targetY: number;

  /** Status apakah pemain lain sedang berjalan */
  private isMoving: boolean = false;

  /** Efek tween langkah kaki berjalan */
  private walkTween: Phaser.Tweens.Tween | null = null;

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
    this.targetX = x;
    this.targetY = y;

    // Buat tekstur avatar unik pemain lain
    const textureKey = AvatarGenerator.getOrCreateTexture(scene, avatar);
    this.sprite = scene.add.image(0, 0, textureKey);
    this.sprite.setDisplaySize(38, 38);
    this.addAt(this.sprite, 0);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
      body.moves = false;
    }
  }

  public setNetworkState(x: number, y: number, direction: Direction, isMoving: boolean): void {
    this.targetX = x;
    this.targetY = y;
    this.currentDirection = direction;

    if (direction === 'left') {
      this.sprite.setScale(-1, 1);
    } else if (direction === 'right') {
      this.sprite.setScale(1, 1);
    }

    if (isMoving !== this.isMoving) {
      this.isMoving = isMoving;
      this.handleWalkAnimation(isMoving);
    }
  }

  public update(time: number, delta: number): void {
    const lerpFactor = 0.2;
    this.x = Phaser.Math.Linear(this.x, this.targetX, lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this.targetY, lerpFactor);
  }

  private handleWalkAnimation(moving: boolean): void {
    if (moving && !this.walkTween) {
      this.walkTween = this.scene.tweens.add({
        targets: this.sprite,
        y: -3,
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else if (!moving && this.walkTween) {
      this.walkTween = this.scene.tweens.add({
        targets: this.sprite,
        y: -3,
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.walkTween.stop();
      this.walkTween = null;
      this.sprite.setY(0);
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.walkTween) {
      this.walkTween.stop();
      this.walkTween = null;
    }
    super.destroy(fromScene);
  }
}
