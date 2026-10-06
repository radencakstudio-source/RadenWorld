/**
 * ============================================================================
 * FILE: resources/js/game/entities/Player.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Kelas OOP turunan `Entity` yang mewakili karakter lokal yang dikendalikan oleh
 * pengguna (pemain saat ini).
 * 
 * FITUR:
 * - Kustomisasi Avatar dinamis (gender, warna kulit, baju, celana, topi).
 * - Input keyboard (WASD & Panah).
 * - Kecepatan fisik & animasi langkah berjalan (bobbing).
 * - Sinkronisasi posisi ke WebSocket server.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Entity } from './Entity';
import { IAvatarCustomization, Direction } from '../types';
import { NetworkManager } from '../core/NetworkManager';
import { AvatarGenerator } from '../utils/AvatarGenerator';

export class Player extends Entity {
  /** Data kustomisasi avatar pemain */
  private avatar: IAvatarCustomization;

  /** Objek gambar/sprite visual karakter */
  private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

  /** Objek penangkap tombol panah keyboard */
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  /** Objek penangkap tombol keyboard W, A, S, D */
  private keysWASD!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  /** Timestamp pengiriman data posisi terakhir ke WebSocket server (untuk throttling) */
  private lastSentTime: number = 0;

  /** Koordinat X terakhir yang telah dikirim ke server */
  private lastX: number = 0;

  /** Koordinat Y terakhir yang telah dikirim ke server */
  private lastY: number = 0;

  /** Status apakah karakter saat ini sedang bergerak atau diam */
  private isMoving: boolean = false;

  /** Referensi ke singleton NetworkManager */
  private networkManager: NetworkManager;

  /** Efek tween animasi langkah berjalan karakter */
  private walkTween: Phaser.Tweens.Tween | null = null;

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
    super(scene, x, y, id, name, hp, maxHp, 220);
    this.avatar = avatar;
    this.networkManager = NetworkManager.getInstance();

    // Buat tekstur avatar unik sesuai gender & pakaian
    const textureKey = AvatarGenerator.getOrCreateTexture(scene, avatar);
    this.sprite = scene.add.image(0, 0, textureKey);
    this.sprite.setDisplaySize(38, 38);
    this.addAt(this.sprite, 0);

    this.setupInput(scene);
    this.lastX = x;
    this.lastY = y;
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

  /**
   * Game loop yang dieksekusi 60 FPS
   */
  public update(time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body || !this.cursors) return;

    // Jika pengguna sedang fokus mengetik di input chat atau form lain, hentikan pergerakan karakter
    const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
    if (isTyping) {
      body.setVelocity(0, 0);
      if (this.isMoving) {
        this.isMoving = false;
        this.handleWalkAnimation(false);
      }
      return;
    }

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.keysWASD.A.isDown;
    const right = this.cursors.right.isDown || this.keysWASD.D.isDown;
    const up = this.cursors.up.isDown || this.keysWASD.W.isDown;
    const down = this.cursors.down.isDown || this.keysWASD.S.isDown;

    if (left) {
      vx -= this.speed;
      this.currentDirection = 'left';
      this.sprite.setScale(-1, 1);
    } else if (right) {
      vx += this.speed;
      this.currentDirection = 'right';
      this.sprite.setScale(1, 1);
    }

    if (up) {
      vy -= this.speed;
      this.currentDirection = 'up';
    } else if (down) {
      vy += this.speed;
      this.currentDirection = 'down';
    }

    // Normalisasi kecepatan diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    body.setVelocity(vx, vy);

    const nowMoving = vx !== 0 || vy !== 0;
    if (nowMoving !== this.isMoving) {
      this.isMoving = nowMoving;
      this.handleWalkAnimation(nowMoving);
    }

    // Sinkronisasi data posisi ke server setiap 60ms saat bergerak
    const moved = Math.abs(this.x - this.lastX) > 1 || Math.abs(this.y - this.lastY) > 1;
    if (moved && time - this.lastSentTime > 60) {
      this.lastSentTime = time;
      this.lastX = this.x;
      this.lastY = this.y;
      this.networkManager.sendMovement(this.x, this.y, this.currentDirection, this.isMoving);
    }
  }

  /**
   * Mengatur animasi langkah naik-turun (bobbing)
   */
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
      this.walkTween.stop();
      this.walkTween = null;
      this.sprite.setY(0);
    }
  }

  /** Membersihkan tween dan objek saat karakter dihancurkan */
  public destroy(fromScene?: boolean): void {
    if (this.walkTween) {
      this.walkTween.stop();
      this.walkTween = null;
    }
    super.destroy(fromScene);
  }
}
