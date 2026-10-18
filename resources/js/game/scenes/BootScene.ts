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
    // Movement (Walk Front, Back, Side: frame 1 s/d 8)
    for (let i = 1; i <= 8; i++) {
      this.load.image(`player-male-walk-front-${i}`, `/assets/sprites/characters/Player/Male/MovementFront/MaleWalkFront${i}.png`);
      this.load.image(`player-male-walk-back-${i}`, `/assets/sprites/characters/Player/Male/MovementBack/MaleWalkBack${i}.png`);
      this.load.image(`player-male-walk-side-${i}`, `/assets/sprites/characters/Player/Male/MovementSide/MaleWalkSide${i}.png`);
    }

    // 2. Aset Karakter Female (Perempuan)
    // Idle (Front, Back, Side)
    this.load.image('player-female-idle-front', '/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female.png');
    this.load.image('player-female-idle-back', '/assets/sprites/characters/Player/Female/Idle/Back/Back%20Female.png');
    this.load.image('player-female-idle-side', '/assets/sprites/characters/Player/Female/Idle/Side/Side%20Female.png');
    // Movement (Walk Front, Back, Side: frame 1 s/d 8)
    for (let i = 1; i <= 8; i++) {
      this.load.image(`player-female-walk-front-${i}`, `/assets/sprites/characters/Player/Female/MovementFront/FemaleWalkFront${i}.png`);
      this.load.image(`player-female-walk-back-${i}`, `/assets/sprites/characters/Player/Female/MovementBack/FemaleWalkBack${i}.png`);
      this.load.image(`player-female-walk-side-${i}`, `/assets/sprites/characters/Player/Female/MovementSide/FemaleWalkSide${i}.png`);
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
    this.load.image('court-basket', '/assets/maps/World/Assets/10X5%20LapanganBasket.png');
    this.load.image('court-bola', '/assets/maps/World/Assets/10X5%20LapanganBola.png');
    this.load.image('plaza-stage', '/assets/maps/World/Assets/10X8%20Panggung.png');
    this.load.image('statue-lamongan', '/assets/maps/World/Assets/5X10%20PatungLamongan.png');
    this.load.image('building-cafe', '/assets/maps/World/Assets/17x11%20cafe.png');
    this.load.image('building-hospital', '/assets/maps/World/Assets/17x11%20apotek.png');
    this.load.image('building-bank', '/assets/maps/World/Assets/17x11%20%20bank.png');
    this.load.image('prop-pagar-batu', '/assets/maps/World/Assets/1x2%20PagarBatu.png');
    this.load.image('trash-organik', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangOrganik.png');
    this.load.image('trash-plastik', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangPlastik.png');
    this.load.image('trash-kertas', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangKertas.png');
    this.load.image('trash-logam', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangLogam.png');
    this.load.image('trash-b3', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangB3.png');
    this.load.image('popup-billboard', '/assets/maps/World/Assets/10X10%20Popup.png');
    this.load.image('tile-trotoar-alunalun', '/assets/maps/World/Assets/1X1%20Trotoar%20Alunalun.png');
    this.load.image('trotoar-2', '/assets/maps/World/Assets/1X1%20Trotoar2.png');
    this.load.image('tile-trotoar-3', '/assets/maps/World/Assets/1X1%20Trotoar2.png');
    this.load.image('tile-dig', '/assets/maps/World/Assets/1x1%20Dig.png');
    this.load.image('road-horizontal', '/assets/maps/World/Assets/1x2%20Jalan%20Horizontal.png');
    this.load.image('road-vertical', '/assets/maps/World/Assets/2x1%20Jalan%20Vertical.png');
    this.load.image('road-intersection', '/assets/maps/World/Assets/2x2%20JalanTengah.png');
    this.load.image('trotoar-horizontal', '/assets/maps/World/Assets/1x1%20Trotoar1%20Horizontal.png');
    this.load.image('trotoar-vertical', '/assets/maps/World/Assets/1x1%20Trotoar1%20vertical.png');
    this.load.image('trotoar-edge', '/assets/maps/World/Assets/1x1%20Trotoar1%20Edge.png');
    this.load.image('prop-meja', '/assets/maps/World/Assets/1x1%20Meja.png');
    this.load.image('prop-batu', '/assets/maps/World/Assets/1x2%20Batu.png');
    this.load.image('prop-kursi-front', '/assets/maps/World/Assets/1x2%20Kursi%20Taman.png');
    this.load.image('prop-kursi-side', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.png');
    this.load.image('prop-kursi-side-1', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.png');
    this.load.image('prop-kursi-warung', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Warung.png');
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

    // 8. Aset Karakter Asli NPC Nusantara (1x2 Petak Grid / 480x960px)
    this.load.image('npc-badut', '/assets/sprites/NPC/1x2%20NPC%20Badut.png');
    this.load.image('npc-guru-sd', '/assets/sprites/NPC/1x2%20NPC%20GuruSD.png');
    this.load.image('npc-guru-smp', '/assets/sprites/NPC/1x2%20NPC%20GuruSMP.png');
    this.load.image('npc-guru-sma', '/assets/sprites/NPC/1x2%20NPC%20GuruSMA.png');
    this.load.image('npc-nelayan', '/assets/sprites/NPC/1x2%20NPC%20Nelayan.png');
    this.load.image('npc-pedagang-bakso', '/assets/sprites/NPC/1x2%20NPC%20Pedangang%20Bakso.png');
    this.load.image('npc-pedagang-mie-ayam', '/assets/sprites/NPC/1x2%20NPC%20Pedangang%20Mie%20Ayam.png');
    this.load.image('npc-pedagang-soto', '/assets/sprites/NPC/1x2%20NPC%20Pedangang%20Soto.png');
    this.load.image('npc-penjaga-pasar', '/assets/sprites/NPC/1x2%20NPC%20PenjagaPasar.png');
    this.load.image('npc-perawat', '/assets/sprites/NPC/1x2%20NPC%20Perawat.png');
    this.load.image('npc-petani', '/assets/sprites/NPC/1x2%20NPC%20Petani.png');
    this.load.image('npc-petugas-kebersihan', '/assets/sprites/NPC/1x2%20NPC%20PetugasKebersihan.png');
    this.load.image('npc-polisi', '/assets/sprites/NPC/1x2%20NPC%20Polisi.png');
    this.load.image('npc-polwan', '/assets/sprites/NPC/1x2%20NPC%20Polwan.png');
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
        for (let i = 1; i <= 8; i++) {
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
            frameRate: 14,
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
            frameRate: 14,
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
            frameRate: 14,
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
    // Warna Asli Blueprint: Gelap = #01AE01, Terang = #89FFA5
    if (!this.textures.exists('world-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kotak Catur Alam 240x240 (2x2 kotak @ 120px)
      g.fillStyle(0x01ae01, 1); // Dark (#01AE01)
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x89ffa5, 1); // Light (#89FFA5)
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x008e00, 0.4);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('world-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Paving Alun-Alun Plaza Kota (120x120px) - Granit Batu Alam Bersih & Elegan (Tidak Norak)
    if (!this.textures.exists('plaza-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Kotak Paving Batu Granit Elegan Netral 240x240 (2x2 kotak @ 120px)
      // Tile 1 & 4 (Granit Abu-Abu Elegan)
      g.fillStyle(0x475569, 1);
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);

      // Tile 2 & 3 (Granit Charcoal Lembut)
      g.fillStyle(0x334155, 1);
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);

      // Garis nat bevel paving batu tipis & rapi
      g.lineStyle(1.5, 0x1e293b, 0.6);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);

      // Garis bevel dalam halus sederhana
      g.lineStyle(1, 0x64748b, 0.4);
      g.strokeRect(4, 4, 112, 112);
      g.strokeRect(124, 4, 112, 112);
      g.strokeRect(4, 124, 112, 112);
      g.strokeRect(124, 124, 112, 112);

      g.generateTexture('plaza-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Lautan Murni Solid Asli Blueprint (#00A2F3) - Bersih, Solid & 100% Tanpa Grid / Tanpa Kotak-kotak
    if (!this.textures.exists('water-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x00a2f3, 1); // Warna Biru Laut Asli Blueprint (#00A2F3)
      g.fillRect(0, 0, 120, 120);
      g.generateTexture('water-checker-tile', 120, 120);
      g.destroy();
    }

    // Tekstur Ombak & Riak Air Laut Dinamis (Seamless Water Wave Ripple - 360x360)
    if (!this.textures.exists('water-wave-tile')) {
      const canvas = document.createElement('canvas');
      canvas.width = 360;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 360, 360);

        // Helper untuk menggambar riak ombak melengkung halus yang seamless
        const drawRipple = (cx: number, cy: number, w: number, h: number, alpha: number) => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx - w / 2, cy);
          ctx.bezierCurveTo(cx - w / 4, cy - h, cx + w / 4, cy + h, cx + w / 2, cy);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Pendaran kilau air (caustic highlight) di puncak riak
          ctx.beginPath();
          ctx.arc(cx - w * 0.1, cy - h * 0.35, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 248, 255, ${alpha * 1.2})`;
          ctx.fill();
          ctx.restore();
        };

        // Buat baris riak ombak berselang-seling yang tersebar merata & seamless
        const ripples = [
          { cx: 90, cy: 45, w: 90, h: 8, alpha: 0.55 },
          { cx: 270, cy: 45, w: 85, h: 7, alpha: 0.50 },
          { cx: 180, cy: 135, w: 100, h: 9, alpha: 0.60 },
          { cx: 340, cy: 135, w: 70, h: 6, alpha: 0.45 },
          { cx: 20, cy: 135, w: 70, h: 6, alpha: 0.45 },
          { cx: 90, cy: 225, w: 95, h: 8, alpha: 0.52 },
          { cx: 270, cy: 225, w: 90, h: 8, alpha: 0.58 },
          { cx: 180, cy: 315, w: 85, h: 7, alpha: 0.48 },
          { cx: 350, cy: 315, w: 65, h: 6, alpha: 0.42 },
          { cx: 10, cy: 315, w: 65, h: 6, alpha: 0.42 },
        ];

        ripples.forEach(r => drawRipple(r.cx, r.cy, r.w, r.h, r.alpha));
        this.textures.addCanvas('water-wave-tile', canvas);
      }
    }

    // Helper Generator Tekstur Awan Cumulus HD (Standalone Puffy Cumulus Shadows)
    const createCloudTexture = (key: string, w: number, h: number, puffs: { x: number; y: number; r: number }[]) => {
      if (this.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'blur(10px)'; // Feathering lembut alami, tetap mempertahankan siluet awan HD

      // Lapisan Bayangan Awan Luar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.44)';
      ctx.beginPath();
      puffs.forEach(p => {
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      });
      ctx.fill();

      // Lapisan Volume Inti Dalam
      ctx.filter = 'blur(16px)';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      puffs.forEach(p => {
        ctx.moveTo(p.x + p.r * 0.75, p.y);
        ctx.arc(p.x, p.y, p.r * 0.75, 0, Math.PI * 2);
      });
      ctx.fill();

      const tex = this.textures.addCanvas(key, canvas);
      tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
    };

    // 8 Variasi Tekstur Awan Terapung Organik yang 100% Berbeda Bentuk & Morfologinya
    // Awan 1: Classic Tall Cumulus (640x380)
    createCloudTexture('cloud-cumulus-1', 640, 380, [
      { x: 140, y: 220, r: 85 },
      { x: 230, y: 170, r: 105 },
      { x: 340, y: 140, r: 120 },
      { x: 450, y: 180, r: 100 },
      { x: 520, y: 230, r: 80 },
      { x: 380, y: 245, r: 95 },
      { x: 270, y: 250, r: 90 },
      { x: 310, y: 200, r: 110 },
    ]);

    // Awan 2: Horizontal Wide Multi-Lobed (820x400)
    createCloudTexture('cloud-cumulus-2', 820, 400, [
      { x: 130, y: 240, r: 80 },
      { x: 220, y: 190, r: 100 },
      { x: 330, y: 150, r: 125 },
      { x: 460, y: 130, r: 130 },
      { x: 590, y: 170, r: 115 },
      { x: 700, y: 220, r: 90 },
      { x: 520, y: 250, r: 105 },
      { x: 380, y: 260, r: 100 },
      { x: 250, y: 255, r: 90 },
    ]);

    // Awan 3: Compact Fluffy Scout (480x300)
    createCloudTexture('cloud-cumulus-3', 480, 300, [
      { x: 120, y: 180, r: 70 },
      { x: 190, y: 130, r: 85 },
      { x: 270, y: 120, r: 95 },
      { x: 350, y: 150, r: 80 },
      { x: 390, y: 190, r: 65 },
      { x: 290, y: 200, r: 75 },
      { x: 200, y: 200, r: 70 },
    ]);

    // Awan 4: Asymmetric Anvil Head (750x440) - Bagian kiri tegak tinggi, bagian kanan menyapu datar
    createCloudTexture('cloud-cumulus-4', 750, 440, [
      { x: 160, y: 180, r: 125 },
      { x: 270, y: 140, r: 140 },
      { x: 390, y: 180, r: 110 },
      { x: 500, y: 220, r: 95 },
      { x: 620, y: 240, r: 80 },
      { x: 680, y: 260, r: 60 },
      { x: 320, y: 270, r: 115 },
      { x: 190, y: 280, r: 100 },
    ]);

    // Awan 5: Elongated Streaked Stratus (920x260) - Panjang tipis melintang
    createCloudTexture('cloud-stratus-5', 920, 260, [
      { x: 100, y: 140, r: 65 },
      { x: 210, y: 125, r: 80 },
      { x: 340, y: 120, r: 90 },
      { x: 470, y: 115, r: 95 },
      { x: 610, y: 120, r: 85 },
      { x: 740, y: 130, r: 75 },
      { x: 840, y: 145, r: 60 },
      { x: 520, y: 155, r: 75 },
      { x: 320, y: 150, r: 70 },
    ]);

    // Awan 6: Twin Merging Masses (660x360) - Dua bongkahan awan yang menyatu
    createCloudTexture('cloud-split-6', 660, 360, [
      { x: 140, y: 180, r: 95 },
      { x: 220, y: 140, r: 105 },
      { x: 300, y: 190, r: 80 },
      { x: 380, y: 200, r: 75 },
      { x: 450, y: 150, r: 100 },
      { x: 540, y: 190, r: 90 },
      { x: 200, y: 240, r: 85 },
      { x: 470, y: 240, r: 85 },
    ]);

    // Awan 7: Fragmented Scatter Cloud (600x340) - Inti awan dengan serpihan kecil di sekelilingnya
    createCloudTexture('cloud-fragment-7', 600, 340, [
      { x: 250, y: 170, r: 100 },
      { x: 340, y: 150, r: 110 },
      { x: 420, y: 190, r: 85 },
      { x: 310, y: 230, r: 90 },
      // Serpihan satelit terpisah
      { x: 120, y: 130, r: 45 },
      { x: 140, y: 220, r: 50 },
      { x: 510, y: 140, r: 45 },
      { x: 490, y: 240, r: 50 },
    ]);

    // Awan 8: Heavy Dense Front (760x460) - Awan lebat pekat bervolume tebal
    createCloudTexture('cloud-dense-8', 760, 460, [
      { x: 170, y: 240, r: 110 },
      { x: 280, y: 180, r: 135 },
      { x: 410, y: 160, r: 145 },
      { x: 540, y: 190, r: 130 },
      { x: 640, y: 250, r: 100 },
      { x: 480, y: 290, r: 120 },
      { x: 340, y: 300, r: 125 },
      { x: 220, y: 290, r: 105 },
    ]);

    // Tekstur Tile Kawasan Sawah & Pertanian Terasering (120x120px)
    if (!this.textures.exists('farm-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x84cc16, 1); // Hijau kekuningan subur
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x65a30d, 1); // Hijau sawah teduh
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      // Pola alur bajak sawah horizontal
      g.lineStyle(1, 0x4d7c0f, 0.4);
      for (let y = 15; y < 240; y += 30) {
        g.lineBetween(0, y, 240, y);
      }
      g.generateTexture('farm-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Pantai Pasir (120x120px)
    if (!this.textures.exists('beach-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xb39962, 1);
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0xefddb7, 1);
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(1.5, 0x8c733e, 0.4);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.generateTexture('beach-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Kawasan Pertanian / Sawah
    if (!this.textures.exists('farm-checker-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x84cc16, 1);
      g.fillRect(0, 0, 120, 120);
      g.fillRect(120, 120, 120, 120);
      g.fillStyle(0x65a30d, 1);
      g.fillRect(120, 0, 120, 120);
      g.fillRect(0, 120, 120, 120);
      g.lineStyle(2, 0x78350f, 0.6);
      g.strokeRect(0, 0, 120, 120);
      g.strokeRect(120, 0, 120, 120);
      g.strokeRect(0, 120, 120, 120);
      g.strokeRect(120, 120, 120, 120);
      g.lineStyle(2, 0xa3e635, 0.7);
      g.lineBetween(20, 20, 100, 100);
      g.lineBetween(140, 20, 220, 100);
      g.lineBetween(20, 140, 100, 220);
      g.lineBetween(140, 140, 220, 220);
      g.generateTexture('farm-checker-tile', 240, 240);
      g.destroy();
    }

    // Tekstur Tile Trotoar Paving Granit (120x120px = 1 petak grid)
    if (!this.textures.exists('sidewalk-paving-tile')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Base granit cerah
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(0, 0, 120, 120);

      // 4 blok ubin paving pejalan kaki 60x60px
      const tiles = [
        { x: 2, y: 2, c: 0xf8fafc },
        { x: 62, y: 2, c: 0xf1f5f9 },
        { x: 2, y: 62, c: 0xf1f5f9 },
        { x: 62, y: 62, c: 0xe2e8f0 },
      ];
      tiles.forEach(t => {
        g.fillStyle(t.c, 1);
        g.fillRoundedRect(t.x, t.y, 56, 56, 4);
        g.lineStyle(1, 0xcbd5e1, 0.6);
        g.strokeRoundedRect(t.x, t.y, 56, 56, 4);
      });

      // Garis nat nat paving tipis abu-abu rapi
      g.lineStyle(2, 0x94a3b8, 0.7);
      g.lineBetween(0, 60, 120, 60);
      g.lineBetween(60, 0, 60, 120);

      // Garis batas luar trotoar
      g.lineStyle(1.5, 0x64748b, 0.5);
      g.strokeRect(0, 0, 120, 120);

      g.generateTexture('sidewalk-paving-tile', 120, 120);
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

    // 7. Tekstur Pendaran Cahaya Lentera Jalan Halus (Soft Radial Light Glow 256x256px)
    if (!this.textures.exists('soft-light-glow')) {
      const canvasTexture = this.textures.createCanvas('soft-light-glow', 256, 256);
      if (canvasTexture) {
        const ctx = canvasTexture.context;
        ctx.clearRect(0, 0, 256, 256);
        const radGrad = ctx.createRadialGradient(128, 128, 4, 128, 128, 126);
        radGrad.addColorStop(0, 'rgba(255, 248, 220, 0.45)'); // Inti hangat keemasan lembut
        radGrad.addColorStop(0.20, 'rgba(254, 225, 160, 0.28)');
        radGrad.addColorStop(0.48, 'rgba(251, 191, 36, 0.12)');
        radGrad.addColorStop(0.78, 'rgba(245, 158, 11, 0.03)');
        radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)'); // Memudar total ke 0
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(128, 128, 126, 0, Math.PI * 2);
        ctx.fill();
        canvasTexture.refresh();
      }
    }

    // 8. Tekstur Sorotan Sinar Cahaya Mentari dari Atas Kiri ke Tengah (Sunbeam Shafts 1600x1200px)
    // Desain 100% Bebas Kotak: Berkas sinar kerucut memancar dari titik (0,0) pojok kiri atas
    // menyorot diagonal ke tengah layar, memudar total ke alpha 0 sebelum menyentuh batas kanvas.
    if (!this.textures.exists('sun-beam-shafts')) {
      const canvasTexture = this.textures.createCanvas('sun-beam-shafts', 1600, 1200);
      if (canvasTexture) {
        const ctx = canvasTexture.context;
        ctx.clearRect(0, 0, 1600, 1200);

        try {
          ctx.filter = 'blur(18px)';
        } catch (e) {}

        // Helper untuk menggambar 1 berkas sinar sorotan kerucut (sector of circle) dengan feathered radial gradient
        const drawBeam = (startDeg: number, endDeg: number, maxAlpha: number, reachR: number) => {
          const sRad = (startDeg * Math.PI) / 180;
          const eRad = (endDeg * Math.PI) / 180;

          const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, reachR);
          grad.addColorStop(0, `rgba(255, 255, 245, ${maxAlpha})`);
          grad.addColorStop(0.20, `rgba(255, 250, 225, ${maxAlpha * 0.75})`);
          grad.addColorStop(0.50, `rgba(254, 240, 190, ${maxAlpha * 0.40})`);
          grad.addColorStop(0.80, `rgba(253, 224, 71, ${maxAlpha * 0.10})`);
          grad.addColorStop(1.0, 'rgba(253, 224, 71, 0)'); // Memudar total ke 0, bebas dari potongan tepi

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, reachR, sRad, eRad);
          ctx.closePath();
          ctx.fill();
        };

        // A. Pendaran Kerucut Latar Halus (Ambient Cone) membentang dari 18° sampai 68°
        const ambientGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 1150);
        ambientGrad.addColorStop(0, 'rgba(255, 252, 235, 0.35)');
        ambientGrad.addColorStop(0.25, 'rgba(254, 243, 199, 0.18)');
        ambientGrad.addColorStop(0.60, 'rgba(253, 230, 138, 0.06)');
        ambientGrad.addColorStop(1.0, 'rgba(253, 230, 138, 0)');
        ctx.fillStyle = ambientGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 1150, (18 * Math.PI) / 180, (68 * Math.PI) / 180);
        ctx.closePath();
        ctx.fill();

        // B. Gugusan 6 Berkas Sinar Menyorot dari Pojok Kiri Atas ke Tengah Layar
        // Tiap berkas terdiri dari lapisan Soft Halo + Bright Core agar tepinya bergradasi mulus alami
        const beamSpecs = [
          { minDeg: 19, maxDeg: 26, coreMin: 21, coreMax: 24, alpha: 0.32, reach: 980 },
          { minDeg: 28, maxDeg: 36, coreMin: 30, coreMax: 34, alpha: 0.42, reach: 1100 },
          // Berkas Utama: Tepat menyorot melintasi titik tengah layar (~37° - 44°)
          { minDeg: 37, maxDeg: 46, coreMin: 39, coreMax: 44, alpha: 0.52, reach: 1200 },
          { minDeg: 48, maxDeg: 55, coreMin: 50, coreMax: 53, alpha: 0.40, reach: 1120 },
          { minDeg: 57, maxDeg: 63, coreMin: 58, coreMax: 61, alpha: 0.30, reach: 1000 },
          { minDeg: 65, maxDeg: 70, coreMin: 66, coreMax: 69, alpha: 0.22, reach: 880 },
        ];

        beamSpecs.forEach(b => {
          // 1. Lapisan terluar lembut (Soft Halo)
          drawBeam(b.minDeg, b.maxDeg, b.alpha * 0.45, b.reach);
          // 2. Lapisan inti berkas terang (Bright Core)
          drawBeam(b.coreMin, b.coreMax, b.alpha, b.reach * 0.95);
        });

        // C. Pendaran Sumber Cahaya Mentari (Corona Flare) di Titik Pojok Kiri Atas (0, 0)
        const flareGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 240);
        flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.70)');
        flareGrad.addColorStop(0.30, 'rgba(255, 250, 220, 0.35)');
        flareGrad.addColorStop(0.70, 'rgba(254, 240, 138, 0.10)');
        flareGrad.addColorStop(1.0, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 240, 0, Math.PI * 2);
        ctx.fill();

        try {
          ctx.filter = 'none';
        } catch (e) {}

        canvasTexture.refresh();
      }
    }

    // 10. Tekstur Bintang Kilauan Air Kristal Halus (Water Shimmer Sparkle 48x48px)
    if (!this.textures.exists('water-sparkle-texture')) {
      const canvasTexture = this.textures.createCanvas('water-sparkle-texture', 48, 48);
      if (canvasTexture) {
        const ctx = canvasTexture.context;
        ctx.clearRect(0, 0, 48, 48);

        // Pendaran lembut tengah
        const radGrad = ctx.createRadialGradient(24, 24, 0, 24, 24, 18);
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        radGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.55)');
        radGrad.addColorStop(0.70, 'rgba(125, 211, 252, 0.18)');
        radGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(24, 24, 18, 0, Math.PI * 2);
        ctx.fill();

        // 4 Sinar salib runcing halus
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(4, 24);
        ctx.lineTo(24, 22);
        ctx.lineTo(44, 24);
        ctx.lineTo(24, 26);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(24, 4);
        ctx.lineTo(26, 24);
        ctx.lineTo(24, 44);
        ctx.lineTo(22, 24);
        ctx.closePath();
        ctx.fill();

        canvasTexture.refresh();
      }
    }

    this.createClassroomTextures();
  }

  /**
   * Menghasilkan tekstur procedural aset ruang kelas standar Indonesia berkualitas tinggi
   * agar dapat digunakan di seluruh dunia (World, School, House, Admin)
   */
  private createClassroomTextures(): void {
    // 1. Meja Siswa Kayu Jati (100 x 72 px)
    if (!this.textures.exists('school-student-desk')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0a0f1d, 0.45);
      g.fillRoundedRect(4, 52, 92, 16, 6);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(10, 40, 8, 22);
      g.fillRect(82, 40, 8, 22);
      g.fillStyle(0x451a03, 1);
      g.fillRect(12, 28, 76, 16);
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(18, 32, 28, 8);
      g.fillStyle(0xf43f5e, 1);
      g.fillRect(52, 33, 24, 7);
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(4, 4, 92, 28, 6);
      g.fillStyle(0xb45309, 1);
      g.fillRoundedRect(6, 6, 88, 24, 4);
      g.lineStyle(1, 0xd97706, 0.4);
      g.lineBetween(12, 12, 84, 12);
      g.lineBetween(14, 20, 82, 20);
      g.fillStyle(0x10b981, 1);
      g.fillRoundedRect(64, 8, 20, 6, 2);
      g.generateTexture('school-student-desk', 100, 72);
      g.destroy();
    }

    // 2. Kursi Siswa Kayu Jati (70 x 70 px)
    if (!this.textures.exists('school-student-chair')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0a0f1d, 0.35);
      g.fillRoundedRect(6, 52, 58, 14, 6);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(12, 40, 6, 20);
      g.fillRect(52, 40, 6, 20);
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(10, 26, 50, 18, 5);
      g.fillStyle(0xb45309, 1);
      g.fillRoundedRect(12, 28, 46, 14, 3);
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(14, 6, 42, 14, 4);
      g.fillStyle(0x92400e, 1);
      g.fillRect(20, 18, 5, 10);
      g.fillRect(33, 18, 4, 10);
      g.fillRect(45, 18, 5, 10);
      g.generateTexture('school-student-chair', 70, 70);
      g.destroy();
    }

    // 3. Meja Guru Besar Kayu Eksekutif (150 x 85 px)
    if (!this.textures.exists('school-teacher-desk')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0a0f1d, 0.5);
      g.fillRoundedRect(6, 64, 138, 18, 6);
      g.fillStyle(0x451a03, 1);
      g.fillRect(12, 32, 126, 40);
      g.fillStyle(0x78350f, 1);
      g.fillRect(96, 36, 38, 16);
      g.fillRect(96, 54, 38, 16);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(112, 43, 6, 3);
      g.fillRect(112, 61, 6, 3);
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(4, 6, 142, 30, 6);
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(6, 8, 138, 26, 4);
      g.fillStyle(0x065f46, 1);
      g.fillRoundedRect(45, 11, 60, 20, 3);
      g.fillStyle(0xffffff, 1);
      g.fillRect(16, 12, 22, 16);
      g.fillStyle(0xef4444, 1);
      g.fillRect(18, 14, 18, 4);
      g.fillStyle(0x0284c7, 1);
      g.fillRect(115, 13, 10, 14);
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(38, 18, 4);
      g.generateTexture('school-teacher-desk', 150, 85);
      g.destroy();
    }

    // 4. Kursi Guru Empuk (75 x 85 px)
    if (!this.textures.exists('school-teacher-chair')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0a0f1d, 0.4);
      g.fillRoundedRect(8, 66, 60, 14, 5);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(16, 50, 7, 22);
      g.fillRect(52, 50, 7, 22);
      g.fillStyle(0x831843, 1);
      g.fillRoundedRect(12, 34, 52, 22, 6);
      g.fillStyle(0x500724, 1);
      g.fillRoundedRect(14, 6, 48, 30, 8);
      g.lineStyle(2, 0xd97706, 0.8);
      g.strokeRoundedRect(14, 6, 48, 30, 8);
      g.generateTexture('school-teacher-chair', 75, 85);
      g.destroy();
    }

    // 5. Lambang Garuda Pancasila & Bingkai Foto Presiden/Wapres RI (320 x 80 px)
    if (!this.textures.exists('school-garuda-presiden')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(10, 10, 56, 64, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRect(14, 14, 48, 56);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(38, 34, 12);
      g.fillRect(24, 46, 28, 20);
      g.fillStyle(0xd70d0d, 1);
      g.fillRect(26, 48, 8, 18);
      g.lineStyle(2, 0xf59e0b, 1);
      g.strokeRoundedRect(10, 10, 56, 64, 4);

      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(120, 6, 80, 72, 6);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(124, 10, 72, 64);
      g.fillStyle(0xf59e0b, 1);
      g.fillTriangle(160, 14, 132, 42, 188, 42);
      g.fillTriangle(160, 36, 140, 64, 180, 64);
      g.fillStyle(0xd70d0d, 1);
      g.fillRect(152, 34, 8, 12);
      g.fillStyle(0xffffff, 1);
      g.fillRect(160, 34, 8, 12);
      g.fillStyle(0xfefefe, 1);
      g.fillRect(142, 62, 36, 6);
      g.lineStyle(3, 0xf59e0b, 1);
      g.strokeRoundedRect(120, 6, 80, 72, 6);

      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(254, 10, 56, 64, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRect(258, 14, 48, 56);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(282, 34, 12);
      g.fillRect(268, 46, 28, 20);
      g.fillStyle(0xd70d0d, 1);
      g.fillRect(270, 48, 8, 18);
      g.lineStyle(2, 0xf59e0b, 1);
      g.strokeRoundedRect(254, 10, 56, 64, 4);

      g.generateTexture('school-garuda-presiden', 320, 80);
      g.destroy();
    }

    // 6. Tiang Bendera Merah Putih (60 x 140 px)
    if (!this.textures.exists('school-flag')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(14, 122, 32, 14, 4);
      g.fillStyle(0xb45309, 1);
      g.fillRect(28, 10, 5, 114);
      g.fillStyle(0xf59e0b, 1);
      g.fillTriangle(30, 4, 25, 14, 36, 14);
      g.fillStyle(0xd70d0d, 1);
      g.fillRoundedRect(33, 14, 25, 20, 2);
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(33, 34, 25, 20, 2);
      g.lineStyle(1.5, 0x0a0f1d, 0.4);
      g.strokeRect(33, 14, 25, 40);
      g.generateTexture('school-flag', 60, 140);
      g.destroy();
    }

    // 7. Rak Buku Pojok Baca Kelas (120 x 200 px)
    if (!this.textures.exists('school-bookshelf')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x451a03, 1);
      g.fillRoundedRect(4, 4, 112, 192, 8);
      g.fillStyle(0x78350f, 1);
      g.fillRect(10, 10, 100, 180);
      const shelfYs = [55, 100, 145];
      shelfYs.forEach(sy => {
        g.fillStyle(0x451a03, 1);
        g.fillRect(8, sy, 104, 8);
      });
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(35, 34, 12);
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(33, 33, 6);
      g.fillStyle(0xf59e0b, 1);
      g.fillTriangle(80, 16, 72, 38, 88, 38);
      const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899];
      bookColors.forEach((col, i) => {
        g.fillStyle(col, 1);
        g.fillRect(14 + i * 13, 65, 11, 33);
      });
      bookColors.slice(0, 5).reverse().forEach((col, i) => {
        g.fillStyle(col, 1);
        g.fillRect(14 + i * 16, 110, 13, 33);
      });
      bookColors.slice(2, 7).forEach((col, i) => {
        g.fillStyle(col, 1);
        g.fillRect(16 + i * 15, 155, 12, 33);
      });
      g.generateTexture('school-bookshelf', 120, 200);
      g.destroy();
    }

    // 8. Majalah Dinding (180 x 110 px)
    if (!this.textures.exists('school-mading')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(4, 4, 172, 102, 6);
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(8, 8, 164, 94, 4);
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(14, 12, 152, 18, 3);
      g.fillStyle(0xffffff, 1);
      g.fillRect(16, 36, 42, 56);
      g.fillStyle(0xef4444, 1);
      g.fillRect(18, 40, 38, 6);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(66, 36, 48, 56);
      g.fillStyle(0xbae6fd, 1);
      g.fillRect(120, 36, 42, 56);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(37, 36, 3);
      g.fillStyle(0x3b82f6, 1);
      g.fillCircle(90, 36, 3);
      g.fillStyle(0x10b981, 1);
      g.fillCircle(141, 36, 3);
      g.generateTexture('school-mading', 180, 110);
      g.destroy();
    }

    // 9. Rak Sudut Kebersihan Kelas (70 x 130 px)
    if (!this.textures.exists('school-cleaning-rack')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(8, 10, 54, 14, 4);
      g.fillStyle(0xd97706, 1);
      g.fillRect(18, 18, 4, 75);
      g.fillStyle(0x1e293b, 1);
      g.fillTriangle(20, 85, 10, 120, 30, 120);
      g.fillStyle(0xf97316, 1);
      g.fillRect(36, 18, 4, 60);
      g.fillRoundedRect(28, 76, 20, 22, 3);
      g.fillStyle(0x92400e, 1);
      g.fillRect(52, 18, 3, 50);
      g.fillStyle(0xca8a04, 1);
      g.fillCircle(53, 76, 9);
      g.fillCircle(53, 86, 10);
      g.generateTexture('school-cleaning-rack', 70, 130);
      g.destroy();
    }

    // 10. Peta Kepulauan Indonesia / NKRI (200 x 90 px)
    if (!this.textures.exists('school-map-indonesia')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(4, 4, 192, 82, 6);
      g.fillStyle(0x0284c7, 1);
      g.fillRect(8, 8, 184, 74);
      g.fillStyle(0x16a34a, 1);
      g.fillTriangle(20, 50, 42, 28, 46, 56);
      g.fillRect(44, 62, 46, 7);
      g.fillCircle(72, 36, 14);
      g.fillTriangle(102, 32, 96, 54, 114, 44);
      g.fillRoundedRect(140, 36, 36, 16, 6);
      g.fillCircle(122, 44, 4);
      g.fillCircle(98, 64, 3);
      g.fillCircle(110, 64, 3);
      g.generateTexture('school-map-indonesia', 200, 90);
      g.destroy();
    }

    // 11. Tiang Lampu Jalan Trotoar Elegan (Streetlamp) (56 x 130 px)
    if (!this.textures.exists('prop-lampu-jalan')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Bayangan dasar tiang di trotoar
      g.fillStyle(0x0a0f1d, 0.4);
      g.fillEllipse(28, 122, 36, 12);

      // Base tiang besi cor kokoh
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(20, 108, 16, 14, 3);
      g.fillStyle(0x334155, 1);
      g.fillRect(23, 110, 10, 10);

      // Tiang tegak besi hitam
      g.fillStyle(0x1e293b, 1);
      g.fillRect(25, 28, 6, 82);
      g.fillStyle(0x475569, 1);
      g.fillRect(26, 30, 2, 78);

      // Cincin dekoratif tiang
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(23, 75, 10, 3);
      g.fillRect(23, 40, 10, 3);

      // Lengan melengkung kap lentera
      g.fillStyle(0x1e293b, 1);
      g.fillRect(16, 24, 24, 5);
      g.fillCircle(28, 22, 5);

      // Kap pelindung lampu atas
      g.fillStyle(0x0f172a, 1);
      g.fillTriangle(28, 14, 12, 28, 44, 28);
      g.fillStyle(0x334155, 1);
      g.fillTriangle(28, 16, 16, 27, 40, 27);

      // Lentera kaca dengan cahaya hangat menyala (Warm Yellow Glow)
      g.fillStyle(0xfde047, 0.95); // Kuning terang
      g.fillRect(18, 28, 20, 18);
      g.fillStyle(0xffffff, 0.9); // Titik fokus putih bohlam
      g.fillCircle(28, 36, 5);

      // Rangka kisi-kisi lentera besi
      g.lineStyle(1.5, 0x1e293b, 0.9);
      g.strokeRect(18, 28, 20, 18);
      g.lineBetween(28, 28, 28, 46);

      // Glow aura cahaya lampu hangat di sekeliling kap
      g.fillStyle(0xfef08a, 0.25);
      g.fillCircle(28, 38, 22);

      g.generateTexture('prop-lampu-jalan', 56, 130);
      g.destroy();
    }
  }
}
