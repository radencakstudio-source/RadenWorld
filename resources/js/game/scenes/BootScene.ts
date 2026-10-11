/**
 * ============================================================================
 * FILE: resources/js/game/scenes/BootScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene pemuat awal (Preloader Scene) yang bertugas mengunduh seluruh aset visual
 * dari folder `public/assets/` ke memori browser sebelum memasuki dunia game.
 * 
 * TUGAS:
 * - Menampilkan visual bar progres unduhan (0% - 100%).
 * - Memuat file sprite SVG/PNG dari:
 *   - `/assets/sprites/characters/player.svg`
 *   - `/assets/sprites/monsters/slime.svg`
 *   - `/assets/sprites/characters/npc.svg`
 *   - `/assets/tilesets/tree.svg` & `rock.svg`
 *   - `/assets/sprites/items/chest.svg`
 * - Membuat tekstur cadangan prosedural (fallback) jika ada aset eksternal yang gagal dimuat.
 * - Mengalihkan scene secara otomatis ke `WorldScene` setelah pemuatan 100%.
 * ============================================================================
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * Siklus hidup preload(): Mengunduh file aset dan menampilkan progress bar
   */
  public preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Visual Box & Progress Bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1e293b, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading RadenWorld Assets...',
      style: {
        font: '16px "Plus Jakarta Sans", sans-serif',
        color: '#38bdf8',
      }
    }).setOrigin(0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '14px "Plus Jakarta Sans", sans-serif',
        color: '#ffffff'
      }
    }).setOrigin(0.5);

    // Update progres unduhan
    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0x38bdf8, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Memuat aset dari folder terpisah public/assets/
    // Memuat aset lingkungan & monster dari public/assets/
    this.load.svg('slime-sprite', '/assets/sprites/monsters/slime.svg', { width: 48, height: 48 });
    this.load.svg('npc-sprite', '/assets/sprites/characters/npc.svg', { width: 48, height: 48 });
    this.load.svg('tree-asset', '/assets/tilesets/tree.svg', { width: 64, height: 80 });
    this.load.svg('rock-asset', '/assets/tilesets/rock.svg', { width: 48, height: 36 });
    this.load.svg('chest-asset', '/assets/sprites/items/chest.svg', { width: 36, height: 36 });

    // 1. Aset Karakter Male (Laki-laki)
    // Idle (Front, Back, Side)
    this.load.image('player-male-idle-front', '/assets/sprites/characters/Player/Male/Idle/Front/Front%20Male.png');
    this.load.image('player-male-idle-back', '/assets/sprites/characters/Player/Male/Idle/Back/Back%20Male.png');
    this.load.image('player-male-idle-side', '/assets/sprites/characters/Player/Male/Idle/Side/Side%20Male.png');
    // Movement (Walk Front, Back, Side: frame 1 s/d 9)
    for (let i = 1; i <= 9; i++) {
      this.load.image(`player-male-walk-front-${i}`, `/assets/sprites/characters/Player/Male/MovementFront/Walk_Front${i}_Male.png`);
      this.load.image(`player-male-walk-back-${i}`, `/assets/sprites/characters/Player/Male/MovementBack/Walk_Back${i}_Male.png`);
      this.load.image(`player-male-walk-side-${i}`, `/assets/sprites/characters/Player/Male/MovementSide/Walk_Side${i}_Male.png`);
    }

    // 2. Aset Karakter Female (Perempuan)
    // Idle (Front, Back, Side)
    this.load.image('player-female-idle-front', '/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female.png');
    this.load.image('player-female-idle-back', '/assets/sprites/characters/Player/Female/Idle/Back/Back%20Female.png');
    this.load.image('player-female-idle-side', '/assets/sprites/characters/Player/Female/Idle/Side/Side%20Female.png');
    // Movement (Walk Front, Back, Side: frame 1 s/d 9)
    for (let i = 1; i <= 9; i++) {
      this.load.image(`player-female-walk-front-${i}`, `/assets/sprites/characters/Player/Female/MovementFront/Walk_Front${i}_Female.png`);
      this.load.image(`player-female-walk-back-${i}`, `/assets/sprites/characters/Player/Female/MovementBack/Walk_Back${i}_Female.png`);
      this.load.image(`player-female-walk-side-${i}`, `/assets/sprites/characters/Player/Female/MovementSide/Walk_Side${i}_Female.png`);
    }

    // Avatar Portret HD
    this.load.image('player-male-avatar', '/assets/sprites/characters/Player/Male/MaleAvatar.png');
    this.load.image('player-female-avatar', '/assets/sprites/characters/Player/Female/FemaleAvatar.png');

    // 3. Aset Reaksi Ekspresi Wajah Asli (Normal, Senang, Kaget, Marah)
    // Male Expressions
    this.load.image('expr-male-normal', '/assets/sprites/characters/Player/Male/Ekspression/NormalMale.png');
    this.load.image('expr-male-smile', '/assets/sprites/characters/Player/Male/Ekspression/SenangMale.png');
    this.load.image('expr-male-shock', '/assets/sprites/characters/Player/Male/Ekspression/KagetMale.png');
    this.load.image('expr-male-angry', '/assets/sprites/characters/Player/Male/Ekspression/MarahMale.png');

    // Female Expressions
    this.load.image('expr-female-normal', '/assets/sprites/characters/Player/Female/Ekspression/NormalFemale.png');
    this.load.image('expr-female-smile', '/assets/sprites/characters/Player/Female/Ekspression/SenangFemale.png');
    this.load.image('expr-female-shock', '/assets/sprites/characters/Player/Female/Ekspression/KagetFemale.png');
    this.load.image('expr-female-angry', '/assets/sprites/characters/Player/Female/Ekspression/MarahFemale.png');
  }

  /**
   * Siklus hidup create(): Menyiapkan tekstur cadangan, inisialisasi animasi karakter, dan berpindah scene
   */
  public create(): void {
    this.createFallbackTextures();
    this.initCharacterAnimations();

    // Pastikan seluruh aset sprite memiliki filter tekstur tajam HD
    this.textures.each((texture: Phaser.Textures.Texture) => {
      texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }, this);

    const pathname = window.location.pathname;

    // Pisahkan inisialisasi scene berikutnya dari 'load' handler browser agar tidak memblokir thread (kurangi ms violation)
    this.time.delayedCall(16, () => {
      if (pathname.startsWith('/admin')) {
        let adminToken = 'raden-master-key';
        if (pathname.startsWith('/admin/')) {
          const seg = pathname.replace('/admin/', '').trim();
          if (seg) adminToken = seg;
        }
        this.scene.start('AdminPortalScene', {
          name: 'RADEN',
          adminToken,
        });
      } else if (pathname.startsWith('/world')) {
        let savedName = '';
        let savedAvatar = undefined;
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          if (u.name) savedName = u.name;
          const a = localStorage.getItem('raden_player_avatar');
          if (a) savedAvatar = JSON.parse(a);
        } catch (e) {}
        this.scene.start('WorldScene', { name: savedName, avatar: savedAvatar });
      } else {
        let savedName = '';
        let savedAvatar = undefined;
        let savedRoomId = undefined;
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          if (u.name) savedName = u.name;
          if (u.private_room_id) savedRoomId = u.private_room_id;
          const a = localStorage.getItem('raden_player_avatar');
          if (a) savedAvatar = JSON.parse(a);
        } catch (e) {}
        this.scene.start('HouseScene', { name: savedName, avatar: savedAvatar, privateRoomId: savedRoomId });
      }
    });
  }

  /**
   * Meregistrasikan animasi berjalan (walk) untuk karakter Male & Female
   */
  private initCharacterAnimations(): void {
    (['male', 'female'] as const).forEach((gender) => {
      // Helper untuk mengambil frame yang benar-benar ada di cache tekstur
      const getValidFrames = (type: 'front' | 'back' | 'side') => {
        const validFrames: { key: string }[] = [];
        for (let i = 1; i <= 9; i++) {
          const key = `player-${gender}-walk-${type}-${i}`;
          if (this.textures.exists(key)) {
            validFrames.push({ key });
          }
        }
        return validFrames;
      };

      // Animasi Berjalan Menghadap Depan (Bawah)
      if (!this.anims.exists(`player-${gender}-walk-down`)) {
        const frames = getValidFrames('front');
        if (frames.length > 0) {
          this.anims.create({
            key: `player-${gender}-walk-down`,
            frames,
            frameRate: 12,
            repeat: -1,
          });
        }
      }

      // Animasi Berjalan Menghadap Belakang (Atas)
      if (!this.anims.exists(`player-${gender}-walk-up`)) {
        const frames = getValidFrames('back');
        if (frames.length > 0) {
          this.anims.create({
            key: `player-${gender}-walk-up`,
            frames,
            frameRate: 12,
            repeat: -1,
          });
        }
      }

      // Animasi Berjalan Menghadap Samping (Kiri / Kanan)
      if (!this.anims.exists(`player-${gender}-walk-side`)) {
        const frames = getValidFrames('side');
        if (frames.length > 0) {
          this.anims.create({
            key: `player-${gender}-walk-side`,
            frames,
            frameRate: 12,
            repeat: -1,
          });
        }
      }
    });
  }

  /**
   * Menghasilkan tekstur cadangan jika file SVG belum tersedia
   */
  private createFallbackTextures(): void {
    if (!this.textures.exists('default-player')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x3b82f6, 1);
      g.fillCircle(16, 16, 14);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(12, 12, 3);
      g.fillCircle(20, 12, 3);
      g.generateTexture('default-player', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('default-monster')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x10b981, 1);
      g.fillCircle(16, 16, 12);
      g.generateTexture('default-monster', 32, 32);
      g.destroy();
    }

    // Tekstur Tile Catur Berkualitas Tinggi & 60 FPS Ringan untuk Rumah (120x120px)
    if (!this.textures.exists('house-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kotak Catur Kayu 240x240 (2x2 kotak @ 120px)
      g.fillStyle(0x451a03, 1); // Dark
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x854d0e, 1); // Light
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x270f02, 0.45);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('house-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Catur Berkualitas Tinggi & 60 FPS Ringan untuk Open World (120x120px)
    if (!this.textures.exists('world-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kotak Catur Alam 240x240 (2x2 kotak @ 120px)
      g.fillStyle(0x14532d, 1); // Dark Forest Green
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x166534, 1); // Emerald Green
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x052e16, 0.4);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('world-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Catur Alun-Alun Plaza Kota (120x120px)
    if (!this.textures.exists('plaza-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kotak Catur Batu Obsidian & Emas 240x240 (2x2 kotak @ 120px)
      g.fillStyle(0x1e293b, 1);
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x334155, 1);
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(2, 0xd97706, 0.55);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('plaza-checker-tile', 240, 240);
      g.destroy();
    }
  }
}
