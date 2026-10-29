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
    // Pemuatan aset di latar belakang
    this.load.on('progress', (value: number) => {
      // Skala 0 s/d 85% untuk unduhan file aset
      EventBus.emit('assets-loading-progress', value * 0.85);
    });

    this.load.on('complete', () => {
      EventBus.emit('assets-loading-progress', 0.88);
      EventBus.emit('assets-loading-complete');
    });

    // Perlindungan kegagalan jaringan: tangani loaderror agar game tidak pernah stuck/hang
    this.load.on('loaderror', (fileObj: any) => {
      console.warn(`[BootScene] File aset gagal diunduh (lanjutkan fallback aman): ${fileObj?.src || fileObj?.key}`);
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
    this.load.image('player-male-idle-front', '/assets/sprites/characters/Player/Male/Idle/Front/Front%20Male.webp');
    this.load.image('player-male-idle-back', '/assets/sprites/characters/Player/Male/Idle/Back/Back%20Male.webp');
    this.load.image('player-male-idle-side', '/assets/sprites/characters/Player/Male/Idle/Side/Side%20Male.webp');
    // Movement (Walk Front, Back, Side: frame 1 s/d 8)
    for (let i = 1; i <= 8; i++) {
      this.load.image(`player-male-walk-front-${i}`, `/assets/sprites/characters/Player/Male/MovementFront/MaleWalkFront${i}.webp`);
      this.load.image(`player-male-walk-back-${i}`, `/assets/sprites/characters/Player/Male/MovementBack/MaleWalkBack${i}.webp`);
      this.load.image(`player-male-walk-side-${i}`, `/assets/sprites/characters/Player/Male/MovementSide/MaleWalkSide${i}.webp`);
    }
    // Animasi Lompat Male (Charge, Lompat/Takeoff, Di Udara/InAir, Landing)
    this.load.image('player-male-jump-charge-front', '/assets/sprites/characters/Player/Male/Lompat/Charge/Front/MaleJumpCharge%20Front.webp');
    this.load.image('player-male-jump-charge-back', '/assets/sprites/characters/Player/Male/Lompat/Charge/Back/MaleJumpChargeBack.webp');
    this.load.image('player-male-jump-charge-side', '/assets/sprites/characters/Player/Male/Lompat/Charge/Side/MaleJumpChargeSide.webp');
    this.load.image('player-male-jump-takeoff-front', '/assets/sprites/characters/Player/Male/Lompat/Lompat/Front/MaleJumpFront.webp');
    this.load.image('player-male-jump-takeoff-back', '/assets/sprites/characters/Player/Male/Lompat/Lompat/Back/MaleJumpBack.webp');
    this.load.image('player-male-jump-takeoff-side', '/assets/sprites/characters/Player/Male/Lompat/Lompat/Side/MaleJumpSide.webp');
    this.load.image('player-male-jump-air-front', '/assets/sprites/characters/Player/Male/Lompat/Di%20Udara/Front/MaleJumpAirFront.webp');
    this.load.image('player-male-jump-air-back', '/assets/sprites/characters/Player/Male/Lompat/Di%20Udara/Back/MaleJumpAirBack.webp');
    this.load.image('player-male-jump-air-side', '/assets/sprites/characters/Player/Male/Lompat/Di%20Udara/Side/MaleJumpAirSide.webp');
    this.load.image('player-male-jump-landing-front', '/assets/sprites/characters/Player/Male/Lompat/Landing/Front/MaleJumpLandingFront.webp');
    this.load.image('player-male-jump-landing-back', '/assets/sprites/characters/Player/Male/Lompat/Landing/Back/MaleJumpLandingBack.webp');
    this.load.image('player-male-jump-landing-side', '/assets/sprites/characters/Player/Male/Lompat/Landing/Side/MaleJumpLandingSide.webp');

    // 2. Aset Karakter Female (Perempuan)
    // Idle (Front, Back, Side)
    this.load.image('player-female-idle-front', '/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female.webp');
    this.load.image('player-female-idle-back', '/assets/sprites/characters/Player/Female/Idle/Back/Back%20Female.webp');
    this.load.image('player-female-idle-side', '/assets/sprites/characters/Player/Female/Idle/Side/Side%20Female.webp');
    // Movement (Walk Front, Back, Side: frame 1 s/d 8)
    for (let i = 1; i <= 8; i++) {
      this.load.image(`player-female-walk-front-${i}`, `/assets/sprites/characters/Player/Female/MovementFront/FemaleWalkFront${i}.webp`);
      this.load.image(`player-female-walk-back-${i}`, `/assets/sprites/characters/Player/Female/MovementBack/FemaleWalkBack${i}.webp`);
      this.load.image(`player-female-walk-side-${i}`, `/assets/sprites/characters/Player/Female/MovementSide/FemaleWalkSide${i}.webp`);
    }
    // Animasi Lompat Female (Charge, Lompat/Takeoff, Di Udara/InAir, Landing)
    this.load.image('player-female-jump-charge-front', '/assets/sprites/characters/Player/Female/Lompat/Charge/Front/FemaleJumpCharge%20Front.webp');
    this.load.image('player-female-jump-charge-back', '/assets/sprites/characters/Player/Female/Lompat/Charge/Back/FemaleJumpChargeBack.webp');
    this.load.image('player-female-jump-charge-side', '/assets/sprites/characters/Player/Female/Lompat/Charge/Side/FemaleJumpChargeSide.webp');
    this.load.image('player-female-jump-takeoff-front', '/assets/sprites/characters/Player/Female/Lompat/Lompat/Front/FemaleJumpFront.webp');
    this.load.image('player-female-jump-takeoff-back', '/assets/sprites/characters/Player/Female/Lompat/Lompat/Back/FemaleJumpBack.webp');
    this.load.image('player-female-jump-takeoff-side', '/assets/sprites/characters/Player/Female/Lompat/Lompat/Side/FemaleJumpSide.webp');
    this.load.image('player-female-jump-air-front', '/assets/sprites/characters/Player/Female/Lompat/Di%20Udara/Front/FemaleJumpAirFront.webp');
    this.load.image('player-female-jump-air-back', '/assets/sprites/characters/Player/Female/Lompat/Di%20Udara/Back/FemaleJumpAirBack.webp');
    this.load.image('player-female-jump-air-side', '/assets/sprites/characters/Player/Female/Lompat/Di%20Udara/Side/FemaleJumpAirSide.webp');
    this.load.image('player-female-jump-landing-front', '/assets/sprites/characters/Player/Female/Lompat/Landing/Front/FemaleJumpLandingFront.webp');
    this.load.image('player-female-jump-landing-back', '/assets/sprites/characters/Player/Female/Lompat/Landing/Back/FemaleJumpLandingBack.webp');
    this.load.image('player-female-jump-landing-side', '/assets/sprites/characters/Player/Female/Lompat/Landing/Side/FemaleJumpLandingSide.webp');

    // Avatar Portret HD
    this.load.image('player-male-avatar', '/assets/sprites/characters/Player/Male/MaleAvatar.webp');
    this.load.image('player-female-avatar', '/assets/sprites/characters/Player/Female/FemaleAvatar.webp');

    // 3. Aset Reaksi Ekspresi Wajah Asli (Normal, Senang, Kaget, Marah)
    // Male Expressions
    this.load.image('expr-male-normal', '/assets/sprites/characters/Player/Male/Ekspression/NormalMale.webp');
    this.load.image('expr-male-smile', '/assets/sprites/characters/Player/Male/Ekspression/SenangMale.webp');
    this.load.image('expr-male-shock', '/assets/sprites/characters/Player/Male/Ekspression/KagetMale.webp');
    this.load.image('expr-male-angry', '/assets/sprites/characters/Player/Male/Ekspression/MarahMale.webp');

    // Female Expressions
    this.load.image('expr-female-normal', '/assets/sprites/characters/Player/Female/Ekspression/NormalFemale.webp');
    this.load.image('expr-female-smile', '/assets/sprites/characters/Player/Female/Ekspression/SenangFemale.webp');
    this.load.image('expr-female-shock', '/assets/sprites/characters/Player/Female/Ekspression/KagetFemale.webp');
    this.load.image('expr-female-angry', '/assets/sprites/characters/Player/Female/Ekspression/MarahFemale.webp');

    // 4. Aset Bangunan Sekolah (SD, SMP, SMA - 5x10 Petak Grid)
    this.load.image('school-sd-building', '/assets/maps/SD/5x10%20Gedung%20SD.webp');
    this.load.image('school-smp-building', '/assets/maps/SMP/5x10%20Gedung%20SMP.webp');
    this.load.image('school-sma-building', '/assets/maps/SMA/5x10%20Gedung%20SMA.webp');

    // 5. Aset Gerobak Kuliner Nusantara & Rumah Modern
    this.load.image('house-5x5', '/assets/maps/World/Assets/5x5%20Rumah.webp');
    this.load.image('cart-bakso', '/assets/maps/World/Assets/3x3%20Gerobak%20Bakso.webp');
    this.load.image('cart-mie-ayam', '/assets/maps/World/Assets/3x3%20Gerobak%20Mie%20Ayam.webp');
    this.load.image('cart-soto', '/assets/maps/World/Assets/3x3%20Gerobak%20Soto.webp');

    // 6. Aset Properti & Fasilitas Kota Open World
    this.load.image('court-basket', '/assets/maps/World/Assets/10X5%20LapanganBasket.webp');
    this.load.image('court-bola', '/assets/maps/World/Assets/10X5%20LapanganBola.webp');
    this.load.image('plaza-stage', '/assets/maps/World/Assets/10X8%20Panggung.webp');
    this.load.image('building-cafe', '/assets/maps/World/Assets/5x5%20Cafe.webp');
    this.load.image('building-perpustakaan', '/assets/maps/World/Assets/5x5%20Perpustakaan.webp');
    this.load.image('building-kantor-polisi', '/assets/maps/World/Assets/5x5%20KantorPolisi.webp');
    this.load.image('building-bank', '/assets/maps/World/Assets/5x5%20Bank.webp');
    this.load.image('building-apotek', '/assets/maps/World/Assets/5x5%20Apotek.webp');
    this.load.image('building-hospital', '/assets/maps/World/Assets/5x5%20Apotek.webp');
    this.load.image('building-makelar', '/assets/maps/World/Assets/5x5%20Makelar.webp');
    this.load.image('prop-pagar-batu', '/assets/maps/World/Assets/1x2%20PagarBatu.webp');
    this.load.image('trash-organik', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangOrganik.webp');
    this.load.image('trash-plastik', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangPlastik.webp');
    this.load.image('trash-kertas', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangKertas.webp');
    this.load.image('trash-logam', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangLogam.webp');
    this.load.image('trash-b3', '/assets/maps/World/Assets/1x2%20TongSampahDaurUlangB3.webp');
    this.load.image('popup-billboard', '/assets/maps/World/Assets/10X10%20Popup.webp');
    // Aset Tembok & Ground Tile Open World (/assets/maps/World/Ground/Tile/)
    this.load.image('tile-wall-dark', '/assets/maps/World/Ground/Tile/DarkWall.webp');
    this.load.image('tile-wall-light', '/assets/maps/World/Ground/Tile/LightWall.webp');
    this.load.image('tile-wall-top-dark', '/assets/maps/World/Ground/Tile/DarkWall_WithTop.webp');
    this.load.image('tile-wall-top-light', '/assets/maps/World/Ground/Tile/LightWall_WithTop.webp');
    this.load.image('tile-ground-dark', '/assets/maps/World/Ground/Tile/GroundGelap.webp');
    this.load.image('tile-ground-light', '/assets/maps/World/Ground/Tile/GroundTerang.webp');

    this.load.image('tile-trotoar-alunalun', '/assets/maps/World/Assets/1X1%20Trotoar%20Alunalun.webp');
    this.load.image('trotoar-2', '/assets/maps/World/Assets/1X1%20Trotoar2.webp');
    this.load.image('tile-trotoar-3', '/assets/maps/World/Assets/1X1%20Trotoar2.webp');
    this.load.image('tile-dig', '/assets/maps/World/Assets/1x1%20Dig.webp');
    this.load.image('road-horizontal', '/assets/maps/World/Assets/1x2%20Jalan%20Horizontal.webp');
    this.load.image('road-vertical', '/assets/maps/World/Assets/2x1%20Jalan%20Vertical.webp');
    this.load.image('road-intersection', '/assets/maps/World/Assets/2x2%20JalanTengah.webp');
    this.load.image('trotoar-horizontal', '/assets/maps/World/Assets/1x1%20Trotoar1%20Horizontal.webp');
    this.load.image('trotoar-vertical', '/assets/maps/World/Assets/1x1%20Trotoar1%20vertical.webp');
    this.load.image('trotoar-edge', '/assets/maps/World/Assets/1x1%20Trotoar1%20Edge.webp');
    this.load.image('prop-meja', '/assets/maps/World/Assets/1x1%20Meja.webp');
    this.load.image('prop-batu', '/assets/maps/World/Assets/1x2%20Batu.webp');
    this.load.image('prop-kursi-front', '/assets/maps/World/Assets/1x2%20Kursi%20Taman.webp');
    this.load.image('prop-kursi-side', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.webp');
    this.load.image('prop-kursi-side-1', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.webp');
    this.load.image('prop-kursi-warung', '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Warung.webp');
    this.load.image('prop-pohon-small', '/assets/maps/World/Assets/1x2%20Pohon.webp');
    this.load.image('prop-pohon-tall', '/assets/maps/World/Assets/1x3%20Pohon.webp');
    this.load.image('prop-rumput', '/assets/maps/World/Assets/1x2%20Rumput.webp');
    this.load.image('prop-taman-rumput', '/assets/maps/World/Assets/2x1%20TamanRumput.webp');
    this.load.image('prop-tong-sampah', '/assets/maps/World/Assets/1x2%20Tong%20Sampah.webp');
    this.load.image('prop-lampu', '/assets/maps/World/Assets/1x3%20Lampu.webp');
    this.load.image('vending-blue', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Blue.webp');
    this.load.image('vending-green', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Green.webp');
    this.load.image('vending-red', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Red.webp');
    this.load.image('vending-yellow', '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Yellow.webp');

    // 7. Aset Eksklusif Ruang Kendali Super Admin (/assets/maps/Admin/Assets/)
    this.load.image('admin-floor-dark', '/assets/maps/Admin/Assets/1x1%20Lantai%20Admin%20Gelap.webp');
    this.load.image('admin-floor-light', '/assets/maps/Admin/Assets/1x1%20Lantai%20Admin%20Terang.webp');
    this.load.image('admin-carpet-gold', '/assets/maps/Admin/Assets/2x1%20Karpet%20Emas.webp');
    this.load.image('admin-throne', '/assets/maps/Admin/Assets/3x3%20Tahta%20Raden.webp');
    this.load.image('admin-console-broadcast', '/assets/maps/Admin/Assets/2x2%20Konsol%20Broadcast.webp');
    this.load.image('admin-console-database', '/assets/maps/Admin/Assets/2x2%20Konsol%20Database.webp');
    this.load.image('admin-console-godmode', '/assets/maps/Admin/Assets/2x2%20Konsol%20Godmode.webp');
    this.load.image('admin-portal-world', '/assets/maps/Admin/Assets/2x2%20Portal%20World.webp');
    this.load.image('admin-portal-house', '/assets/maps/Admin/Assets/2x2%20Portal%20House.webp');
    this.load.image('admin-pillar', '/assets/maps/Admin/Assets/1x3%20Pilar%20Cyber.webp');
    this.load.image('admin-banner', '/assets/maps/Admin/Assets/1x2%20Banner%20Raden.webp');
    this.load.image('admin-holo-globe', '/assets/maps/Admin/Assets/2x2%20Holo%20Globe.webp');

    // 8. Aset Karakter Asli NPC Nusantara (1x2 Petak Grid / 480x960px)
    this.load.image('npc-badut', '/assets/sprites/NPC/1x2%20NPC%20Badut.webp');
    this.load.image('npc-guru-sd', '/assets/sprites/NPC/1x2%20NPC%20GuruSD.webp');
    this.load.image('npc-guru-smp', '/assets/sprites/NPC/1x2%20NPC%20GuruSMP.webp');
    this.load.image('npc-guru-sma', '/assets/sprites/NPC/1x2%20NPC%20GuruSMA.webp');
    this.load.image('npc-nelayan', '/assets/sprites/NPC/1x2%20NPC%20Nelayan.webp');
    this.load.image('npc-pedagang-bakso', '/assets/sprites/NPC/1x2%20NPC%20Pedangang%20Bakso.webp');
    this.load.image('npc-pedagang-mie-ayam', '/assets/sprites/NPC/1x2%20NPC%20Pedangang%20Mie%20Ayam.webp');
    this.load.image('npc-pedagang-soto', '/assets/sprites/NPC/1x2%20NPC%20Pedangang%20Soto.webp');
    this.load.image('npc-penjaga-pasar', '/assets/sprites/NPC/1x2%20NPC%20PenjagaPasar.webp');
    this.load.image('npc-perawat', '/assets/sprites/NPC/1x2%20NPC%20Perawat.webp');
    this.load.image('npc-petani', '/assets/sprites/NPC/1x2%20NPC%20Petani.webp');
    this.load.image('npc-petugas-kebersihan', '/assets/sprites/NPC/1x2%20NPC%20PetugasKebersihan.webp');
    this.load.image('npc-polisi', '/assets/sprites/NPC/1x2%20NPC%20Polisi.webp');
    this.load.image('npc-polwan', '/assets/sprites/NPC/1x2%20NPC%20Polwan.webp');
  }

  /**
   * Siklus hidup create(): Menyiapkan tekstur cadangan, inisialisasi animasi karakter, dan berpindah scene
   */
  public create(): void {
    EventBus.emit('assets-loading-progress', 0.92);
    this.createFallbackTextures();
    EventBus.emit('assets-loading-progress', 0.96);
    this.initCharacterAnimations();

    const pathname = window.location.pathname;

    // Pisahkan inisialisasi scene berikutnya dari 'load' handler browser agar tidak memblokir thread (kurangi ms violation)
    this.time.delayedCall(16, () => {
      // 1. Cek Sesi Aktif Mini Game Olahraga (Hanya jika URL berada di /minigame)
      let activeMiniGame: any = null;
      if (pathname.startsWith('/minigame')) {
        try {
          const stored = localStorage.getItem('raden_active_minigame');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.sport && (!parsed.timestamp || Date.now() - parsed.timestamp < 14400000)) {
              activeMiniGame = parsed;
            }
          }
        } catch (e) {}

        // Deteksi parameter query jika URL langsung mengarah ke /minigame
        if (!activeMiniGame) {
          const urlParams = new URLSearchParams(window.location.search);
          const sportParam = pathname.includes('basket') ? 'basketball' : 'soccer';
          const modeParam = (urlParams.get('mode') as any) || 'ai';
          activeMiniGame = {
            sport: sportParam,
            mode: modeParam,
            returnPos: sportParam === 'soccer' ? { x: 3480, y: 6040 } : { x: 6060, y: 6040 },
          };
        }
      } else {
        try { localStorage.removeItem('raden_active_minigame'); } catch (e) {}
      }

      if (activeMiniGame) {
        let savedName = activeMiniGame.name || '';
        let savedAvatar = activeMiniGame.avatar || undefined;
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          if (!savedName && u.name) savedName = u.name;
          const a = localStorage.getItem('raden_player_avatar');
          if (!savedAvatar && a) savedAvatar = JSON.parse(a);
        } catch (e) {}

        const targetSceneKey = activeMiniGame.sport === 'soccer' ? 'SoccerMiniGameScene' : 'BasketballMiniGameScene';
        const returnX = activeMiniGame.returnPos?.x || (activeMiniGame.sport === 'soccer' ? 3480 : 6060);
        const returnY = activeMiniGame.returnPos?.y || 6040;

        EventBus.emit('minigame-active', true);
        EventBus.emit('location-updated', activeMiniGame.sport === 'soccer' ? 'ARENA STADION: SOCCER' : 'ARENA STREETBALL: BASKETBALL');
        this.scene.start(targetSceneKey, {
          mode: activeMiniGame.mode || 'ai',
          name: savedName || 'Petualang',
          avatar: savedAvatar,
          returnX,
          returnY,
        });
        return;
      }

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
      } else if (
        pathname.startsWith('/world') ||
        pathname.startsWith('/school') ||
        pathname.startsWith('/cafe') ||
        pathname.startsWith('/perpustakaan') ||
        pathname.startsWith('/library')
      ) {
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
        } else if (lowerPath === '/world/cafe' || lowerPath === '/cafe') {
          this.scene.start('CafeScene', { name: savedName, avatar: savedAvatar });
        } else if (
          lowerPath === '/world/perpustakaan' || lowerPath === '/world/library' ||
          lowerPath === '/perpustakaan' || lowerPath === '/library'
        ) {
          this.scene.start('LibraryScene', { name: savedName, avatar: savedAvatar });
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
        this.scene.start('WorldScene', { name: savedName, avatar: savedAvatar, spawnNearHouse: true });
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

    // Tekstur Fallback Tile Tanah Galian Cangkulan (tile-dig 120x120px)
    if (!this.textures.exists('tile-dig')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x8d5b2d, 1);
      g.fillRoundedRect(6, 6, 108, 108, 24);
      g.fillStyle(0x6e431f, 1);
      g.fillCircle(60, 60, 34);
      g.generateTexture('tile-dig', 120, 120);
      g.destroy();
    }

    // Tekstur Fallback Lapangan Sepak Bola (10x5 petak: 1200x600px)
    if (!this.textures.exists('court-bola')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x14532d, 1);
      g.fillRect(0, 0, 1200, 600);
      g.fillStyle(0x16a34a, 1);
      for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) g.fillRect(60 + i * 90, 40, 90, 520);
      }
      g.lineStyle(5, 0xffffff, 1);
      g.strokeRect(60, 40, 1080, 520);
      g.lineBetween(600, 40, 600, 560);
      g.strokeCircle(600, 300, 85);
      g.strokeRect(60, 160, 180, 280);
      g.strokeRect(960, 160, 180, 280);
      g.generateTexture('court-bola', 1200, 600);
      g.destroy();
    }

    // Tekstur Fallback Lapangan Basket (10x5 petak: 1200x600px)
    if (!this.textures.exists('court-basket')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0f172a, 1);
      g.fillRect(0, 0, 1200, 600);
      g.fillStyle(0x1d4ed8, 1);
      g.fillRect(60, 40, 1080, 520);
      g.fillStyle(0xea580c, 1);
      g.fillRect(60, 215, 220, 170);
      g.fillRect(920, 215, 220, 170);
      g.lineStyle(5, 0xffffff, 1);
      g.strokeRect(60, 40, 1080, 520);
      g.lineBetween(600, 40, 600, 560);
      g.strokeCircle(600, 300, 70);
      g.strokeRect(60, 215, 220, 170);
      g.strokeRect(920, 215, 220, 170);
      g.generateTexture('court-basket', 1200, 600);
      g.destroy();
    }

    // Tekstur Tembok Catur (2x2 @ 120px = 240x240) untuk Open World
    // 1. Tembok Atas Utara (tile-wall-dark & tile-wall-light)
    if (!this.textures.exists('wall-top-checker') && this.textures.exists('tile-wall-dark') && this.textures.exists('tile-wall-light')) {
      try {
        const darkImg = this.textures.get('tile-wall-dark').getSourceImage() as HTMLImageElement;
        const lightImg = this.textures.get('tile-wall-light').getSourceImage() as HTMLImageElement;
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx && darkImg && lightImg) {
          ctx.drawImage(darkImg, 0, 0, 120, 120);
          ctx.drawImage(lightImg, 120, 0, 120, 120);
          ctx.drawImage(lightImg, 0, 120, 120, 120);
          ctx.drawImage(darkImg, 120, 120, 120, 120);
          this.textures.addCanvas('wall-top-checker', canvas);
        }
      } catch (e) {
        console.warn('[BootScene] Gagal membuat tekstur wall-top-checker:', e);
      }
    }

    // 2. Tembok Samping Barat (tile-wall-top-dark & tile-wall-top-light)
    if (!this.textures.exists('wall-side-checker') && this.textures.exists('tile-wall-top-dark') && this.textures.exists('tile-wall-top-light')) {
      try {
        const darkTopImg = this.textures.get('tile-wall-top-dark').getSourceImage() as HTMLImageElement;
        const lightTopImg = this.textures.get('tile-wall-top-light').getSourceImage() as HTMLImageElement;
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx && darkTopImg && lightTopImg) {
          ctx.drawImage(darkTopImg, 0, 0, 120, 120);
          ctx.drawImage(lightTopImg, 120, 0, 120, 120);
          ctx.drawImage(lightTopImg, 0, 120, 120, 120);
          ctx.drawImage(darkTopImg, 120, 120, 120, 120);
          this.textures.addCanvas('wall-side-checker', canvas);
        }
      } catch (e) {
        console.warn('[BootScene] Gagal membuat tekstur wall-side-checker:', e);
      }
    }

    // Tekstur Ombak & Riak Air Laut Dinamis HD (Seamless Water Wave Ripple - 480x480)
    if (!this.textures.exists('water-wave-tile')) {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 480, 480);

        const drawWave = (cx: number, cy: number, w: number, h: number, alpha: number) => {
          const drawAt = (ox: number, oy: number) => {
            ctx.save();
            // a. Bayangan biru tua kedalaman di bawah gelombang (3D depth)
            ctx.beginPath();
            ctx.moveTo(ox - w / 2, oy + 4);
            ctx.bezierCurveTo(ox - w / 4, oy - h + 4, ox + w / 4, oy + h + 4, ox + w / 2, oy + 4);
            ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.40})`;
            ctx.lineWidth = 4.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // b. Tubuh gelombang biru muda kristal transparan (translucent azure swell)
            ctx.beginPath();
            ctx.moveTo(ox - w / 2, oy);
            ctx.bezierCurveTo(ox - w / 4, oy - h, ox + w / 4, oy + h, ox + w / 2, oy);
            ctx.strokeStyle = `rgba(125, 211, 252, ${alpha * 0.65})`;
            ctx.lineWidth = 4.0;
            ctx.lineCap = 'round';
            ctx.stroke();

            // c. Puncak buih putih berkilau (crisp white frothy crest)
            ctx.beginPath();
            ctx.moveTo(ox - w / 2 + 3, oy);
            ctx.bezierCurveTo(ox - w / 4, oy - h * 0.9, ox + w / 4, oy + h * 0.9, ox + w / 2 - 3, oy);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
            ctx.lineWidth = 2.4;
            ctx.lineCap = 'round';
            ctx.stroke();

            // d. Percikan buih laut lembut (sea foam particles)
            ctx.fillStyle = `rgba(240, 249, 255, ${alpha * 0.85})`;
            ctx.beginPath();
            ctx.arc(ox - w * 0.22, oy - h * 0.4, 1.8, 0, Math.PI * 2);
            ctx.arc(ox + w * 0.18, oy + h * 0.35, 1.6, 0, Math.PI * 2);
            ctx.arc(ox + w * 0.35, oy + h * 0.15, 1.4, 0, Math.PI * 2);
            ctx.fill();

            // e. Bintang kilau pantulan sinar matahari (4-point sunlight glimmer sparkle)
            const sx = ox - w * 0.06;
            const sy = oy - h * 0.35;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.0})`;
            ctx.beginPath();
            ctx.moveTo(sx, sy - 4);
            ctx.lineTo(sx + 1.2, sy);
            ctx.lineTo(sx + 4, sy);
            ctx.lineTo(sx + 1.2, sy);
            ctx.lineTo(sx, sy + 4);
            ctx.lineTo(sx - 1.2, sy);
            ctx.lineTo(sx - 4, sy);
            ctx.lineTo(sx - 1.2, sy);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
          };

          drawAt(cx, cy);
          if (cx - w / 2 < 0) drawAt(cx + 480, cy);
          if (cx + w / 2 > 480) drawAt(cx - 480, cy);
          if (cy - h < 0) drawAt(cx, cy + 480);
          if (cy + h > 480) drawAt(cx, cy - 480);
        };

        const waveList = [
          { cx: 80, cy: 35, w: 110, h: 9, a: 0.70 },
          { cx: 280, cy: 45, w: 100, h: 8, a: 0.60 },
          { cx: 430, cy: 30, w: 80, h: 7, a: 0.65 },

          { cx: 180, cy: 105, w: 125, h: 10, a: 0.75 },
          { cx: 360, cy: 115, w: 90, h: 8, a: 0.55 },
          { cx: 30, cy: 120, w: 75, h: 7, a: 0.60 },

          { cx: 100, cy: 180, w: 105, h: 9, a: 0.65 },
          { cx: 270, cy: 170, w: 120, h: 10, a: 0.72 },
          { cx: 440, cy: 190, w: 85, h: 7, a: 0.58 },

          { cx: 190, cy: 250, w: 115, h: 9, a: 0.70 },
          { cx: 350, cy: 240, w: 100, h: 8, a: 0.62 },
          { cx: 40, cy: 260, w: 90, h: 8, a: 0.65 },

          { cx: 120, cy: 320, w: 120, h: 10, a: 0.75 },
          { cx: 290, cy: 330, w: 95, h: 8, a: 0.58 },
          { cx: 450, cy: 315, w: 80, h: 7, a: 0.55 },

          { cx: 210, cy: 395, w: 130, h: 10, a: 0.72 },
          { cx: 380, cy: 405, w: 85, h: 7, a: 0.55 },
          { cx: 50, cy: 400, w: 95, h: 8, a: 0.62 },

          { cx: 140, cy: 460, w: 100, h: 8, a: 0.62 },
          { cx: 310, cy: 455, w: 115, h: 9, a: 0.70 },
        ];

        waveList.forEach(w => drawWave(w.cx, w.cy, w.w, w.h, w.a));
        this.textures.addCanvas('water-wave-tile', canvas);
      }
    }

    // Tekstur Kaustik Cahaya Tropis & Riak Sekunder (water-wave-caustic - 480x480 Seamless)
    if (!this.textures.exists('water-wave-caustic')) {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 480, 480);

        const drawCausticRing = (cx: number, cy: number, rx: number, ry: number, a: number) => {
          const drawAt = (ox: number, oy: number) => {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ox, oy, rx, ry, Math.PI * 0.12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(186, 230, 253, ${a * 0.40})`;
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(ox + 1.5, oy - 1.5, rx * 0.85, ry * 0.85, Math.PI * 0.12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.65})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.restore();
          };
          drawAt(cx, cy);
          if (cx - rx < 0) drawAt(cx + 480, cy);
          if (cx + rx > 480) drawAt(cx - 480, cy);
          if (cy - ry < 0) drawAt(cx, cy + 480);
          if (cy + ry > 480) drawAt(cx, cy - 480);
        };

        const causticList = [
          { cx: 60, cy: 70, rx: 34, ry: 18, a: 0.55 },
          { cx: 220, cy: 50, rx: 42, ry: 20, a: 0.60 },
          { cx: 380, cy: 80, rx: 36, ry: 16, a: 0.50 },
          { cx: 140, cy: 160, rx: 44, ry: 22, a: 0.65 },
          { cx: 300, cy: 180, rx: 38, ry: 19, a: 0.55 },
          { cx: 450, cy: 150, rx: 32, ry: 15, a: 0.50 },
          { cx: 70, cy: 270, rx: 40, ry: 20, a: 0.60 },
          { cx: 230, cy: 290, rx: 46, ry: 24, a: 0.70 },
          { cx: 390, cy: 260, rx: 35, ry: 17, a: 0.52 },
          { cx: 150, cy: 380, rx: 42, ry: 21, a: 0.62 },
          { cx: 320, cy: 400, rx: 36, ry: 18, a: 0.58 },
          { cx: 460, cy: 370, rx: 30, ry: 14, a: 0.48 },
          { cx: 80, cy: 450, rx: 38, ry: 19, a: 0.55 },
          { cx: 250, cy: 460, rx: 44, ry: 22, a: 0.64 },
        ];

        causticList.forEach(c => drawCausticRing(c.cx, c.cy, c.rx, c.ry, c.a));
        this.textures.addCanvas('water-wave-caustic', canvas);
      }
    }

    // Tekstur Buih Gulungan Ombak Pantai (water-shoreline-surf - 480x80)
    if (!this.textures.exists('water-shoreline-surf')) {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 480, 80);

        // Lapisan basah pasir (wet sand backwash)
        ctx.fillStyle = 'rgba(140, 115, 62, 0.35)';
        ctx.fillRect(0, 0, 480, 24);

        // Buih ombak putih tebal berbusa (foaming shore surf)
        for (let x = 0; x < 480; x += 32) {
          ctx.beginPath();
          ctx.arc(x + 16, 26, 20, Math.PI, 0, false);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x + 16, 28, 14, Math.PI, 0, false);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
          ctx.fill();

          // Gelembung buih kecil
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(x + 8, 18, 3, 0, Math.PI * 2);
          ctx.arc(x + 22, 16, 2.5, 0, Math.PI * 2);
          ctx.arc(x + 14, 12, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Garis batas buih renda tajam (lacy foam crest)
        ctx.beginPath();
        for (let x = 0; x <= 480; x += 16) {
          const y = 30 + Math.sin(x * 0.12) * 5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        this.textures.addCanvas('water-shoreline-surf', canvas);
      }
    }

    // Helper Generator Tekstur Awan Cumulus HD (Super Cepat & Halus dengan Radial Gradient)
    const createCloudTexture = (key: string, w: number, h: number, puffs: { x: number; y: number; r: number }[]) => {
      if (this.textures.exists(key)) return;
      // Gunakan resolusi 0.5x dengan WebGL bilinear filter untuk menghasilkan bayangan awan halus tanpa membebani CPU
      const scale = 0.5;
      const sw = Math.round(w * scale);
      const sh = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, sw, sh);

      // Render bulatan awan dengan radial gradient (0ms CPU delay, selembut sutra)
      puffs.forEach(p => {
        const px = p.x * scale;
        const py = p.y * scale;
        const pr = p.r * scale;
        const grad = ctx.createRadialGradient(px, py, pr * 0.2, px, py, pr);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0.44)');
        grad.addColorStop(0.65, 'rgba(15, 23, 42, 0.28)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      });

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
