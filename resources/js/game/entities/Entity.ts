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

  /** Kontainer balon obrolan saat karakter berbicara */
  protected speechBubble: Phaser.GameObjects.Container | null = null;

  /** Timer penghilang otomatis balon obrolan */
  protected speechTimer: Phaser.Time.TimerEvent | null = null;

  /** Kontainer balon reaksi ekspresi karakter */
  protected expressionBubble: Phaser.GameObjects.Container | null = null;

  /** Timer penghilang otomatis balon reaksi ekspresi */
  protected expressionTimer: Phaser.Time.TimerEvent | null = null;

  /** Indikator visual ketika karakter sedang berbicara lewat proximity mic */
  protected speakingIndicator: Phaser.GameObjects.Container | null = null;

  /** Timer penghilang otomatis indikator visual berbicara */
  protected speakingTimer: Phaser.Time.TimerEvent | null = null;

  /** Kontainer teks AFK mengambang di atas kepala karakter */
  protected afkContainer: Phaser.GameObjects.Container | null = null;

  /** Objek teks status AFK */
  protected afkText: Phaser.GameObjects.Text | null = null;

  /** Status apakah karakter sedang AFK */
  protected isAfk: boolean = false;

  /** Durasi AFK dalam detik */
  protected afkDurationSeconds: number = 0;

  /** Tinggi entitas visual untuk penempatan nameTag dan speechBubble (177px sesuai aset karakter HD) */
  protected entityHeight: number = 177;

  /** Cache zoom kamera terakhir agar tidak memicu setScale berulang setiap frame */
  protected lastCamZoom: number = -1;

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
      body.setSize(70, 36);
      body.setOffset(-35, 12);
    }

    // Inisialisasi teks nama karakter di atas kepala - Tajam, HD & Bersih Tanpa Background
    let isSuperAdmin = name.toUpperCase() === 'RADEN';
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (u.name?.toLowerCase() === name.toLowerCase() && (u.role === 'super_admin' || u.is_super_admin || u.email === 'radencakstudio@gmail.com')) {
        isSuperAdmin = true;
      }
    } catch (e) {}

    const displayName = isSuperAdmin ? `👑 ${name.toUpperCase()} [ADMIN]` : name;
    const nameColor = isSuperAdmin ? '#f59e0b' : '#ffffff';

    this.nameTag = scene.add.text(0, -165, displayName, {
      fontFamily: '"Chakra Petch", "Plus Jakarta Sans", sans-serif',
      fontSize: '13px',
      color: nameColor,
      stroke: '#050811',
      strokeThickness: 3.5,
      fontStyle: 'bold',
      align: 'center',
      resolution: 4, // Resolusi 4x agar teks tetap tajam kristal tanpa blur pada zoom atau layar retina
    }).setOrigin(0.5);
    this.add(this.nameTag);

    // Catatan: Bar darah (HP) dihilangkan total sesuai permintaan (Game Edukasi, bukan fighting)
  }

  /**
   * Memperbarui nama tampilan entitas
   */
  public setEntityName(newName: string, isSuper?: boolean): void {
    if (!newName) return;
    this.entityName = newName;
    let isSuperAdmin = isSuper ?? (newName.toUpperCase() === 'RADEN');
    if (!isSuperAdmin) {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name?.toLowerCase() === newName.toLowerCase() && (u.role === 'super_admin' || u.is_super_admin || u.email === 'radencakstudio@gmail.com')) {
          isSuperAdmin = true;
        }
      } catch (e) {}
    }

    const displayName = isSuperAdmin ? `👑 ${newName.toUpperCase()} [ADMIN]` : newName;
    if (this.nameTag) {
      this.nameTag.setText(displayName);
      this.nameTag.setColor(isSuperAdmin ? '#f59e0b' : '#ffffff');
    }
  }

  /**
   * Menyesuaikan tinggi entitas dan mengatur ulang posisi nameTag
   */
  public setEntityHeight(height: number): void {
    this.entityHeight = height;
    if (this.nameTag) {
      this.nameTag.setY(-165);
    }
  }

  /** Mengambil ID unik entitas */
  public getEntityId(): string {
    return this.entityId;
  }

  /** Mengambil nama tampilan entitas */
  public getEntityName(): string {
    return this.entityName;
  }

  /** Mengambil nilai HP terkini (Game Edukasi: selalu penuh 100) */
  public getHealth(): number {
    return 100;
  }

  /** Mengambil nilai batas maksimum HP */
  public getMaxHealth(): number {
    return 100;
  }

  /** Mengambil arah hadap entitas */
  public getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Update status kesehatan (Ditiadakan - Game Edukasi)
   */
  public updateHealth(hp: number, maxHp: number = 100): void {
    this.hp = 100;
    this.maxHp = 100;
  }

  /**
   * Menampilkan Balon Kata (Speech Bubble) di atas kepala karakter saat mengirim chat
   * @param message Pesan teks yang diucapkan
   * @param durationMs Durasi balon tampil sebelum hilang otomatis (default: 4500ms)
   */
  public showSpeechBubble(message: string, durationMs: number = 4500): void {
    if (!this.scene || !this.scene.add || !this.scene.time || !this.active) return;

    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
    if (this.speechTimer) {
      this.speechTimer.remove();
      this.speechTimer = null;
    }

    // Posisikan balon tepat di atas kepala dan nameplate (-190px)
    const bubbleY = -190;
    const bubble = this.scene.add.container(0, bubbleY);

    const bubbleText = this.scene.add.text(0, 0, message, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#0f172a',
      fontStyle: 'bold',
      resolution: 2, // Resolusi HD tajam efisien tanpa membebani GPU texture
      wordWrap: { width: 160 },
      align: 'center',
    }).setOrigin(0.5);

    const paddingX = 14;
    const paddingY = 8;
    const bgWidth = Math.max(50, bubbleText.width + paddingX * 2);
    const bgHeight = bubbleText.height + paddingY * 2;

    const bg = this.scene.add.graphics();
    // Bayangan halus balon
    bg.fillStyle(0x000000, 0.2);
    bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2 + 2, bgWidth, bgHeight, 10);

    // Latar belakang balon putih susu bulat lucu & border halus
    bg.fillStyle(0xffffff, 0.98);
    bg.lineStyle(2, 0x1e293b, 0.9);
    bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 10);
    bg.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 10);

    // Ekor segitiga imut menunjuk ke arah kepala karakter
    bg.fillStyle(0xffffff, 0.98);
    bg.fillTriangle(0, bgHeight / 2 + 6, -5, bgHeight / 2, 5, bgHeight / 2);
    bg.lineStyle(2, 0x1e293b, 0.9);
    bg.lineBetween(-5, bgHeight / 2, 0, bgHeight / 2 + 6);
    bg.lineBetween(0, bgHeight / 2 + 6, 5, bgHeight / 2);

    bubble.add([bg, bubbleText]);
    this.add(bubble);
    this.speechBubble = bubble;

    // Jika balon ekspresi sedang aktif bersamaan, pastikan posisinya di atas balon teks agar tidak tertutup
    if (this.expressionBubble && this.expressionBubble.active) {
      this.expressionBubble.y = -290;
    }

    // Skala awal menyesuaikan tingkat zoom kamera secara terbalik (Inverse Scale: Zoom out -> bubble perbesar, Zoom in -> bubble perkecil)
    const camZoom = this.scene.cameras?.main?.zoom || 1.0;
    const invScale = 1 / Math.max(0.5, camZoom);
    const initScale = Math.max(0.75, Math.min(1.85, invScale));
    bubble.setScale(0.2);
    this.scene.tweens.add({
      targets: bubble,
      scale: initScale,
      duration: 200,
      ease: 'Back.easeOut',
    });

    this.speechTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.speechBubble && this.scene && this.scene.tweens) {
        this.scene.tweens.add({
          targets: this.speechBubble,
          alpha: 0,
          scale: 0.3,
          duration: 180,
          onComplete: () => {
            if (this.speechBubble) {
              this.speechBubble.destroy();
              this.speechBubble = null;
            }
          },
        });
      }
    });
  }

  /**
   * Menampilkan Balon Reaksi Ekspresi Wajah di atas kepala karakter
   * @param textureKey Kunci tekstur gambar ekspresi di Phaser ('expr-male-smile', dll.)
   * @param durationMs Durasi balon tampil sebelum hilang otomatis
   */
  public showExpressionReaction(textureKey: string, durationMs: number = 3500): void {
    if (!this.scene || !this.scene.add || !this.scene.time || !this.active) return;

    if (this.expressionBubble) {
      this.expressionBubble.destroy();
      this.expressionBubble = null;
    }
    if (this.expressionTimer) {
      this.expressionTimer.remove();
      this.expressionTimer = null;
    }

    // Posisi mengambang tepat di atas kepala karakter & di atas balon bicara agar tidak tertutup teks
    // Jika balon teks sedang aktif (seperti saat ikan menyambar), posisikan di atasnya (-290px)
    const hasSpeech = Boolean(this.speechBubble && this.speechBubble.active);
    const bubbleY = hasSpeech ? -290 : -250;
    const bubble = this.scene.add.container(0, bubbleY);

    const exprSprite = this.scene.add.sprite(0, 0, textureKey);
    const frame = exprSprite.frame;
    const realW = (frame && frame.realWidth) ? frame.realWidth : (exprSprite.width || 100);
    const realH = (frame && frame.realHeight) ? frame.realHeight : (exprSprite.height || 100);
    const aspect = realH > 0 ? (realW / realH) : 1.2;
    const targetH = 80;
    const targetW = Math.round(targetH * aspect);
    exprSprite.setDisplaySize(targetW, targetH);

    bubble.add(exprSprite);
    this.add(bubble);
    this.expressionBubble = bubble;

    // Skala awal menyesuaikan tingkat zoom kamera secara terbalik
    const camZoom = this.scene.cameras?.main?.zoom || 1.0;
    const invScale = 1 / Math.max(0.5, camZoom);
    const initScale = Math.max(0.75, Math.min(1.85, invScale));

    bubble.setScale(0.2);
    this.scene.tweens.add({
      targets: bubble,
      scale: initScale,
      y: bubbleY - 10,
      duration: 250,
      ease: 'Back.easeOut',
    });

    this.expressionTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.expressionBubble && this.scene && this.scene.tweens) {
        this.scene.tweens.add({
          targets: this.expressionBubble,
          alpha: 0,
          scale: 0.3,
          duration: 200,
          onComplete: () => {
            if (this.expressionBubble) {
              this.expressionBubble.destroy();
              this.expressionBubble = null;
            }
          },
        });
      }
    });
  }

  /**
   * Memperbarui skala elemen melayang (chat bubble, ekspresi) agar mengikuti tingkat zoom kamera
   * Secara terbalik (Inverse Scale): Ketika kamera zoom out, bubble membesar agar tetap terbaca jelas;
   * ketika kamera zoom in, bubble mengecil agar tidak mendominasi layar.
   */
  protected updateFloatingElementsScale(): void {
    const camZoom = this.scene?.cameras?.main?.zoom || 1.0;
    if (Math.abs(camZoom - this.lastCamZoom) < 0.005) return;
    this.lastCamZoom = camZoom;

    const invScale = 1 / Math.max(0.5, camZoom);
    const targetScale = Math.max(0.75, Math.min(1.85, invScale));

    if (this.nameTag && this.nameTag.active) {
      this.nameTag.setScale(targetScale);
    }
    if (this.speechBubble && this.speechBubble.active) {
      this.speechBubble.setScale(targetScale);
    }
    if (this.expressionBubble && this.expressionBubble.active) {
      this.expressionBubble.setScale(targetScale);
    }
    if (this.speakingIndicator && this.speakingIndicator.active) {
      this.speakingIndicator.setScale(targetScale);
    }
  }

  /**
   * Menampilkan atau menyembunyikan indikator visual mikrofon berbicara di atas kepala karakter
   * @param isSpeaking Status apakah entitas sedang berbicara
   * @param durationMs Durasi sebelum indikator memudar otomatis jika tidak ada paket suara baru
   */
  /**
   * Menampilkan atau menyembunyikan ikon sound visual di atas kepala karakter saat berbicara
   * @param isSpeaking Status apakah entitas sedang berbicara
   * @param durationMs Durasi sebelum indikator memudar otomatis jika tidak ada paket suara baru
   */
  public setSpeaking(isSpeaking: boolean, durationMs: number = 1000): void {
    if (!this.scene || !this.active) return;

    if (this.speakingTimer) {
      this.speakingTimer.remove();
      this.speakingTimer = null;
    }

    if (!isSpeaking) {
      if (this.speakingIndicator && this.speakingIndicator.visible) {
        this.scene.tweens?.killTweensOf(this.speakingIndicator);
        this.scene.tweens?.add({
          targets: this.speakingIndicator,
          alpha: 0,
          scale: 0.8,
          duration: 160,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            if (this.speakingIndicator) {
              this.speakingIndicator.setVisible(false);
            }
          },
        });
      }
      return;
    }

    if (!this.speakingIndicator) {
      const container = this.scene.add.container(0, -190);

      const bg = this.scene.add.graphics();
      // Desain badge gelap elegan dengan bingkai neon hijau emerald
      bg.fillStyle(0x0a0f1d, 0.95);
      bg.lineStyle(2, 0x10b981, 1);
      bg.fillRoundedRect(-18, -12, 36, 24, 7);
      bg.strokeRoundedRect(-18, -12, 36, 24, 7);

      // Ikon sound gelombang suara yang jelas (🔊)
      const iconText = this.scene.add.text(0, 0, '🔊', {
        fontSize: '13px',
      }).setOrigin(0.5);

      container.add([bg, iconText]);
      this.add(container);
      this.speakingIndicator = container;
    }

    const wasHidden = !this.speakingIndicator.visible || this.speakingIndicator.alpha < 0.8;
    this.speakingIndicator.setVisible(true);

    if (wasHidden) {
      this.speakingIndicator.setAlpha(1);
      this.scene.tweens?.killTweensOf(this.speakingIndicator);
      this.speakingIndicator.setScale(0.85);
      this.scene.tweens?.add({
        targets: this.speakingIndicator,
        scale: 1,
        duration: 120,
        ease: 'Back.easeOut',
      });
    }

    // Auto-hide setelah suara selesai jika tidak ada paket suara baru
    this.speakingTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.speakingIndicator && this.speakingIndicator.visible) {
        this.scene.tweens?.add({
          targets: this.speakingIndicator,
          alpha: 0,
          scale: 0.8,
          duration: 180,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            if (this.speakingIndicator) {
              this.speakingIndicator.setVisible(false);
            }
          },
        });
      }
    });
  }

  /**
   * Menampilkan atau memperbarui badge status AFK di atas kepala karakter
   * @param isAfk Status apakah pemain AFK
   * @param durationSeconds Durasi AFK dalam detik
   */
  public setAfk(isAfk: boolean, durationSeconds: number = 0): void {
    if (!this.scene || !this.scene.add || !this.active) return;

    this.isAfk = isAfk;
    this.afkDurationSeconds = Math.max(0, Math.floor(durationSeconds));

    if (!isAfk) {
      if (this.afkContainer) {
        this.afkContainer.destroy();
        this.afkContainer = null;
        this.afkText = null;
      }
      return;
    }

    const mins = Math.floor(this.afkDurationSeconds / 60);
    const secs = this.afkDurationSeconds % 60;
    const durStr = mins > 0 ? (secs > 0 ? `${mins}m ${secs}d` : `${mins}m`) : `${secs}d`;
    const afkString = `💤 AFK (${durStr})`;

    if (this.afkText && this.afkContainer) {
      this.afkText.setText(afkString);
      return;
    }

    if (this.afkContainer) {
      this.afkContainer.destroy();
      this.afkContainer = null;
    }

    // Posisikan badge AFK di atas kepala karakter (y: -185)
    const container = this.scene.add.container(0, -185);

    const text = this.scene.add.text(0, 0, afkString, {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#fbbf24',
      fontStyle: 'bold',
      stroke: '#050811',
      strokeThickness: 3.5,
      resolution: 3,
      align: 'center',
    }).setOrigin(0.5);

    const padX = 14;
    const padY = 5;
    const bgW = Math.max(70, text.width + padX);
    const bgH = text.height + padY;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.lineStyle(1.5, 0xf59e0b, 0.9);
    bg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 5);
    bg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 5);

    container.add([bg, text]);
    this.add(container);
    this.afkContainer = container;
    this.afkText = text;
  }

  public getIsAfk(): boolean {
    return this.isAfk;
  }

  /**
   * Loop pembaruan frame per detik (Game Loop).
   * Wajib diimplementasikan oleh turunan (Player, RemotePlayer, Monster).
   * @param time Waktu total sejak game dimulai (ms)
   * @param delta Selisih waktu antar frame terakhir (ms)
   */
  public abstract update(time: number, delta: number): void;
}
