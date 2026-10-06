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
    this.load.svg('player-sprite', '/assets/sprites/characters/player.svg', { width: 48, height: 48 });
    this.load.svg('slime-sprite', '/assets/sprites/monsters/slime.svg', { width: 48, height: 48 });
    this.load.svg('npc-sprite', '/assets/sprites/characters/npc.svg', { width: 48, height: 48 });
    this.load.svg('tree-asset', '/assets/tilesets/tree.svg', { width: 64, height: 80 });
    this.load.svg('rock-asset', '/assets/tilesets/rock.svg', { width: 48, height: 36 });
    this.load.svg('chest-asset', '/assets/sprites/items/chest.svg', { width: 36, height: 36 });
  }

  /**
   * Siklus hidup create(): Menyiapkan tekstur cadangan dan berpindah ke WorldScene
   */
  public create(): void {
    this.createFallbackTextures();
    const pathname = window.location.pathname;
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
      this.scene.start('WorldScene');
    } else {
      this.scene.start('HouseScene');
    }
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
  }
}
