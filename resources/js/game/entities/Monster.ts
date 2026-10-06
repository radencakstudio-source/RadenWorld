/**
 * ============================================================================
 * FILE: resources/js/game/entities/Monster.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Kelas OOP turunan `Entity` yang mewakili monster liar penjelajah open world
 * (contoh: Slime hijau/biru) yang posisinya disinkronkan dari server.
 * 
 * FITUR:
 * - Idle Bouncing: Efek animasi denyut / squish-squash agar terlihat hidup.
 * - Server Synced Movement: Berkelana mengelilingi koordinat padang rumput secara halus.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Entity } from './Entity';

export class Monster extends Entity {
  /** Jenis monster (contoh: 'slime') */
  private monsterType: string;

  /** Koordinat target X jelajah monster */
  private targetX: number;

  /** Koordinat target Y jelajah monster */
  private targetY: number;

  /** Komponen sprite visual monster */
  private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

  /** Efek tween bouncing bernafas pada monster */
  private bounceTween: Phaser.Tweens.Tween | null = null;

  /**
   * Konstruktor Monster Open World
   * @param scene Phaser Scene aktif
   * @param x Koordinat X spawn monster
   * @param y Koordinat Y spawn monster
   * @param id Identifier unik monster (contoh: 'm1', 'm2')
   * @param name Nama tampilan monster (contoh: 'Emerald Slime')
   * @param monsterType Jenis tipe monster
   * @param hp Nilai HP saat ini
   * @param maxHp Nilai Max HP
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    name: string,
    monsterType: string = 'slime',
    hp: number = 50,
    maxHp: number = 50
  ) {
    super(scene, x, y, id, name, hp, maxHp, 60);
    this.monsterType = monsterType;
    this.targetX = x;
    this.targetY = y;

    // Memuat tekstur sprite slime dari assets
    const textureKey = scene.textures.exists('slime-sprite') ? 'slime-sprite' : 'default-monster';
    this.sprite = scene.add.image(0, 0, textureKey);
    this.sprite.setDisplaySize(32, 32);
    this.addAt(this.sprite, 0);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
      body.moves = false;
    }

    // Animasi denyut elastis (Squash & Stretch)
    this.bounceTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: 0.9,
      scaleY: 1.1,
      y: -2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Mengatur koordinat tujuan jelajah yang dipancarkan dari server
   * @param x Posisi target X
   * @param y Posisi target Y
   */
  public setNetworkTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Game loop: Menggerakkan monster secara perlahan menuju posisi target
   */
  public update(time: number, delta: number): void {
    this.x = Phaser.Math.Linear(this.x, this.targetX, 0.05);
    this.y = Phaser.Math.Linear(this.y, this.targetY, 0.05);
  }

  /** Membersihkan tween saat monster musnah */
  public destroy(fromScene?: boolean): void {
    if (this.bounceTween) {
      this.bounceTween.stop();
      this.bounceTween = null;
    }
    super.destroy(fromScene);
  }
}
