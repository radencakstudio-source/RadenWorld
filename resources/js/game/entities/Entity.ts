/**
 * ============================================================================
 * FILE: resources/js/game/entities/Entity.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Kelas abstrak dasar (Abstract Base Class) yang menjadi fondasi seluruh objek
 * makhluk hidup di dalam game RadenWorld (Pemain Lokal, Pemain Remote, Monster/NPC).
 * 
 * POLA DESAIN (OOP):
 * - Inheritance: Mewarisi `Phaser.GameObjects.Container` untuk mengelompokkan sprite,
 *   nameplate, health bar, dan balon teks (speech bubble) ke dalam satu objek terpadu.
 * - Encapsulation: Mengisolasi properti privat/terlindungi (health, speed, body physics).
 * - Polymorphism: Menyediakan metode abstrak `update(time, delta)` yang wajib
 *   diimplementasikan secara unik oleh subclass turunan.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Direction } from '../types';

export abstract class Entity extends Phaser.GameObjects.Container {
  /** ID unik entitas (contoh: socket id atau monster id) */
  protected entityId: string;

  /** Nama tampilan yang terlihat di nameplate */
  protected entityName: string;

  /** Nilai Health Points saat ini */
  protected hp: number;

  /** Batas maksimum Health Points */
  protected maxHp: number;

  /** Kecepatan berjalan entitas (pixel per detik) */
  protected speed: number;

  /** Arah hadap entitas saat ini: 'up' | 'down' | 'left' | 'right' */
  protected currentDirection: Direction = 'down';

  /** Komponen teks Phaser untuk nameplate di atas kepala karakter */
  protected nameTag: Phaser.GameObjects.Text;

  /** Komponen grafis Phaser untuk bar darah dinamis */
  protected healthBar: Phaser.GameObjects.Graphics;

  /** Kontainer balon obrolan saat karakter berbicara */
  protected speechBubble: Phaser.GameObjects.Container | null = null;

  /** Timer penghilang otomatis balon obrolan */
  protected speechTimer: Phaser.Time.TimerEvent | null = null;

  /**
   * Konstruktor Inisialisasi Entitas
   * @param scene Phaser Scene tempat entitas dirender
   * @param x Posisi koordinat X awal di peta open world
   * @param y Posisi koordinat Y awal di peta open world
   * @param id Identifier unik entitas
   * @param name Nama yang akan tampil pada nameplate
   * @param hp Nilai HP awal (default: 100)
   * @param maxHp Nilai kapasitas HP maksimum (default: 100)
   * @param speed Kecepatan gerak entitas (default: 200)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    name: string,
    hp: number = 100,
    maxHp: number = 100,
    speed: number = 200
  ) {
    super(scene, x, y);
    this.entityId = id;
    this.entityName = name;
    this.hp = hp;
    this.maxHp = maxHp;
    this.speed = speed;

    // Daftarkan kontainer ke scene dan aktifkan Arcade Physics Body
    scene.add.existing(this);
    scene.physics.world.enable(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(true);
      body.setSize(32, 32);
      body.setOffset(-16, -16);
    }

    // Inisialisasi teks nama karakter di atas kepala
    const isSuperAdmin = name.toUpperCase() === 'RADEN';
    const displayName = isSuperAdmin ? `👑 RADEN [ADMIN]` : name;
    const nameColor = isSuperAdmin ? '#f59e0b' : '#ffffff';

    this.nameTag = scene.add.text(0, -32, displayName, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: nameColor,
      stroke: '#0f172a',
      strokeThickness: 3,
      fontStyle: isSuperAdmin ? 'bold' : 'normal',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.nameTag);

    // Inisialisasi bar HP karakter
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.drawHealthBar();
  }

  /** Mengambil ID unik entitas */
  public getEntityId(): string {
    return this.entityId;
  }

  /** Mengambil nama tampilan entitas */
  public getEntityName(): string {
    return this.entityName;
  }

  /** Mengambil nilai HP terkini */
  public getHealth(): number {
    return this.hp;
  }

  /** Mengambil nilai batas maksimum HP */
  public getMaxHealth(): number {
    return this.maxHp;
  }

  /** Mengambil arah hadap entitas */
  public getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Mengubah nilai HP entitas dan memperbarui tampilan Health Bar
   * @param hp Nilai HP terbaru
   * @param maxHp Nilai Max HP (opsional)
   */
  public updateHealth(hp: number, maxHp: number = this.maxHp): void {
    this.hp = Math.max(0, Math.min(hp, maxHp));
    this.maxHp = maxHp;
    this.drawHealthBar();
  }

  /**
   * Merender grafis Health Bar (Hijau > Kuning > Merah sesuai sisa persentase darah)
   */
  protected drawHealthBar(): void {
    this.healthBar.clear();
    const barWidth = 32;
    const barHeight = 4;
    const barX = -barWidth / 2;
    const barY = -22;

    // Latar belakang bar (hitam semi transparan)
    this.healthBar.fillStyle(0x0f172a, 0.8);
    this.healthBar.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Isi bar darah dinamis
    const pct = this.hp / this.maxHp;
    const color = pct > 0.5 ? 0x22c55e : pct > 0.2 ? 0xf59e0b : 0xef4444;

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(barX, barY, Math.max(0, barWidth * pct), barHeight);
  }

  /**
   * Menampilkan Balon Kata (Speech Bubble) di atas kepala karakter saat mengirim chat
   * @param message Pesan teks yang diucapkan
   * @param durationMs Durasi balon tampil sebelum hilang otomatis (default: 4000ms)
   */
  public showSpeechBubble(message: string, durationMs: number = 4000): void {
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
    if (this.speechTimer) {
      this.speechTimer.remove();
      this.speechTimer = null;
    }

    const bubble = this.scene.add.container(0, -52);
    const bubbleText = this.scene.add.text(0, 0, message, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#0f172a',
      wordWrap: { width: 140 },
      align: 'center',
    }).setOrigin(0.5);

    const padding = 8;
    const bgWidth = Math.max(40, bubbleText.width + padding * 2);
    const bgHeight = bubbleText.height + padding * 1.5;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.lineStyle(1.5, 0x94a3b8, 1);
    bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 6);
    bg.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 6);

    // Panah segitiga penunjuk ke arah kepala karakter
    bg.fillTriangle(0, bgHeight / 2 + 5, -4, bgHeight / 2, 4, bgHeight / 2);

    bubble.add([bg, bubbleText]);
    this.add(bubble);
    this.speechBubble = bubble;

    this.speechTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.speechBubble) {
        this.speechBubble.destroy();
        this.speechBubble = null;
      }
    });
  }

  /**
   * Loop pembaruan frame per detik (Game Loop).
   * Wajib diimplementasikan oleh turunan (Player, RemotePlayer, Monster).
   * @param time Waktu total sejak game dimulai (ms)
   * @param delta Selisih waktu antar frame terakhir (ms)
   */
  public abstract update(time: number, delta: number): void;
}
