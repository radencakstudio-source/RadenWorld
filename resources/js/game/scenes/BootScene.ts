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
import { EventBus } from '../core/EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * Siklus hidup preload(): Mengunduh file aset dan menampilkan progress bar
   */
  public preload(): void {
    // Pemuatan aset di latar belakang (tanpa box & teks kuno di atas canvas)
    this.load.on('progress', (value: number) => {
      EventBus.emit('assets-loading-progress', value);
    });

    this.load.on('complete', () => {
      EventBus.emit('assets-loading-complete');
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

    // 4. Aset Bangunan Sekolah (SD, SMP, SMA - 5x10 Petak Grid)
    this.load.image('school-sd-building', '/assets/maps/SD/5x10%20Gedung%20SD.png');
    this.load.image('school-smp-building', '/assets/maps/SMP/5x10%20Gedung%20SMP.png');
    this.load.image('school-sma-building', '/assets/maps/SMA/5x10%20Gedung%20SMA.png');

    // 5. Aset Gerobak Kuliner Nusantara & Rumah Modern
    this.load.image('house-5x5', '/assets/maps/World/Assets/5x5%20Rumah.png');
    this.load.image('cart-bakso', '/assets/maps/World/Assets/3x3%20Gerobak%20Bakso.png');
    this.load.image('cart-mie-ayam', '/assets/maps/World/Assets/3x3%20Gerobak%20Mie%20Ayam.png');
    this.load.image('cart-soto', '/assets/maps/World/Assets/3x3%20Gerobak%20Soto.png');

    // 6. Aset Properti & Fasilitas Kota Open World
    this.load.image('prop-meja', '/assets/maps/World/Assets/1x1%20Meja.png');
    this.load.image('prop-batu', '/assets/maps/World/Assets/1x2%20Batu.png');
    this.load.image('prop-kursi-front', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Front.png');
    this.load.image('prop-kursi-side', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side.png');
    this.load.image('prop-kursi-side-1', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.png');
    this.load.image('prop-pohon-small', '/assets/maps/World/Assets/1x2%20Pohon.png');
    this.load.image('prop-pohon-tall', '/assets/maps/World/Assets/1x3%20Pohon.png');
    this.load.image('prop-rumput', '/assets/maps/World/Assets/1x2%20Rumput.png');
    this.load.image('prop-taman-rumput', '/assets/maps/World/Assets/2x1%20TamanRumput.png');
    this.load.image('prop-tong-sampah', '/assets/maps/World/Assets/1x2%20Tong%20Sampah.png');
    this.load.image('prop-lampu', '/assets/maps/World/Assets/1x3%20Lampu.png');
    this.load.image('vending-blue', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Blue.png');
    this.load.image('vending-green', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Green.png');
    this.load.image('vending-red', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Red.png');
    this.load.image('vending-yellow', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Yellow.png');

    // 7. Aset Eksklusif Ruang Kendali Super Admin (/assets/maps/Admin/Assets/)
    this.load.image('admin-floor-dark', '/assets/maps/Admin/Assets/1x1%20Lantai%20Admin%20Gelap.png');
    this.load.image('admin-floor-light', '/assets/maps/Admin/Assets/1x1%20Lantai%20Admin%20Terang.png');
    this.load.image('admin-carpet-gold', '/assets/maps/Admin/Assets/2x1%20Karpet%20Emas.png');
    this.load.image('admin-throne', '/assets/maps/Admin/Assets/3x3%20Tahta%20Raden.png');
    this.load.image('admin-console-broadcast', '/assets/maps/Admin/Assets/2x2%20Konsol%20Broadcast.png');
    this.load.image('admin-console-database', '/assets/maps/Admin/Assets/2x2%20Konsol%20Database.png');
    this.load.image('admin-console-godmode', '/assets/maps/Admin/Assets/2x2%20Konsol%20Godmode.png');
    this.load.image('admin-portal-world', '/assets/maps/Admin/Assets/2x2%20Portal%20World.png');
    this.load.image('admin-portal-house', '/assets/maps/Admin/Assets/2x2%20Portal%20House.png');
    this.load.image('admin-pillar', '/assets/maps/Admin/Assets/1x3%20Pilar%20Cyber.png');
    this.load.image('admin-banner', '/assets/maps/Admin/Assets/1x2%20Banner%20Raden.png');
    this.load.image('admin-holo-globe', '/assets/maps/Admin/Assets/2x2%20Holo%20Globe.png');
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
      } else if (pathname.startsWith('/world') || pathname.startsWith('/school')) {
        let savedName = '';
        let savedAvatar = undefined;
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          if (u.name) savedName = u.name;
          const a = localStorage.getItem('raden_player_avatar');
          if (a) savedAvatar = JSON.parse(a);
        } catch (e) {}

        const lowerPath = pathname.toLowerCase();
        if (
          lowerPath === '/world/sd' || lowerPath === '/world/smp' || lowerPath === '/world/sma' ||
          lowerPath === '/school/sd' || lowerPath === '/school/smp' || lowerPath === '/school/sma'
        ) {
          const schoolType = lowerPath.replace('/world/', '').replace('/school/', '') as 'sd' | 'smp' | 'sma';
          this.scene.start('SchoolScene', { schoolType, name: savedName, avatar: savedAvatar });
        } else {
          this.scene.start('WorldScene', { name: savedName, avatar: savedAvatar });
        }
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
    // Spesifikasi Warna Coklat: Gelap = #B58D00, Terang = #FFEFB5
    if (!this.textures.exists('house-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kotak Catur Kayu 240x240 (2x2 kotak @ 120px)
      g.fillStyle(0xb58d00, 1); // Dark (#B58D00)
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0xffefb5, 1); // Light (#FFEFB5)
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x8a6b00, 0.45);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('house-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Catur Berkualitas Tinggi & 60 FPS Ringan untuk Open World (120x120px)
    // Spesifikasi Warna Hijau: Gelap = #359B4D, Terang = #89FFA5
    if (!this.textures.exists('world-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kotak Catur Alam 240x240 (2x2 kotak @ 120px)
      g.fillStyle(0x359b4d, 1); // Dark (#359B4D)
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x89ffa5, 1); // Light (#89FFA5)
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x277439, 0.4);
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

    // 4. Tekstur Tile Catur Gedung SD (120x120px)
    // Spesifikasi Warna SD: Terang = #D70D0D, Gelap = #570404
    if (!this.textures.exists('sd-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x570404, 1); // Gelap (#570404)
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0xd70d0d, 1); // Terang (#D70D0D)
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x3d0202, 0.45);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('sd-checker-tile', 240, 240);
      g.destroy();
    }

    // 5. Tekstur Tile Catur Gedung SMP (120x120px)
    // Spesifikasi Warna SMP: Terang = #0DD7CA, Gelap = #0C6125
    if (!this.textures.exists('smp-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0c6125, 1); // Gelap (#0C6125)
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x0dd7ca, 1); // Terang (#0DD7CA)
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x063a15, 0.45);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('smp-checker-tile', 240, 240);
      g.destroy();
    }

    // 6. Tekstur Tile Catur Gedung SMA (120x120px)
    // Spesifikasi Warna SMA: Terang = #FEFEFE, Gelap = #00EAFF
    if (!this.textures.exists('sma-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x00eaff, 1); // Gelap (#00EAFF)
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0xfefefe, 1); // Terang (#FEFEFE)
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x00b8c9, 0.4);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('sma-checker-tile', 240, 240);
      g.destroy();
    }
  }
}
