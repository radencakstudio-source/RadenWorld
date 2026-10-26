/**
 * ============================================================================
 * FILE: resources/js/game/scenes/world/WorldProps.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Modul untuk mengelola perabotan (props), lampu jalan, rintangan grid,
 * kustomisasi arsitek, dan slot khusus pembangunan gedung baru di masa depan:
 * 1. Tata Letak Lampu Jalan 1x3 (allLamps: 44 Lampu Sesuai Blueprint).
 * 2. Helper penempatan prop grid dengan kedalaman dinamis (addGridProp).
 * 3. Helper rintangan fisika statis (addGridObstacle).
 * 4. Pemuatan perabotan kustom Arsitek dari localStorage.
 * 5. Slot Khusus Pembangunan Gedung (buildFutureBuildings) untuk mempermudah
 *    penambahan bangunan sekolah, rumah sakit, cafe, bank, perumahan, dll.
 * ============================================================================
 */

import Phaser from 'phaser';
import { SoundManager } from '../../core/SoundManager';
import { EventBus } from '../../core/EventBus';

export interface ILampCoord {
  gx: number;
  gy: number;
}

export interface IOccludingProp {
  img: Phaser.GameObjects.Image;
  left: number;
  right: number;
  top: number;
  bottom: number;
  baseY: number;
}

export class WorldProps {
  /**
   * Kumpulan sprite rumput liar untuk interaksi goyangan saat diinjak / didekati pemain yang bergerak
   */
  public static wildGrassSprites: Phaser.GameObjects.Image[] = [];

  /**
   * Kumpulan gedung dan prop tinggi untuk efek transparansi ketika karakter berada di belakangnya (Occlusion Transparency)
   */
  public static occludingProps: IOccludingProp[] = [];

  /**
   * Reset seluruh kumpulan props saat inisialisasi ulang scene
   */
  public static resetProps(): void {
    this.wildGrassSprites = [];
    this.occludingProps = [];
  }

  /**
   * Kumpulan koordinat 44 Lampu Jalan (prop-lampu 1x3) 100% Sesuai Blueprint Peta
   */
  public static readonly allLamps: ILampCoord[] = [
    // Barat Laut luar (gy_base: 11 -> lantern_gy: 9)
    { gx: 3, gy: 9 }, { gx: 10, gy: 9 }, { gx: 17, gy: 9 }, { gx: 22, gy: 9 },
    // Barat Laut dalam (gy_base: 16 -> lantern_gy: 14)
    { gx: 3, gy: 14 }, { gx: 10, gy: 14 }, { gx: 17, gy: 14 },
    // Timur Laut luar (gy_base: 11 -> lantern_gy: 9)
    { gx: 57, gy: 9 }, { gx: 62, gy: 9 }, { gx: 69, gy: 9 }, { gx: 76, gy: 9 },
    // Timur Laut dalam (gy_base: 16 -> lantern_gy: 14)
    { gx: 62, gy: 14 }, { gx: 69, gy: 14 }, { gx: 76, gy: 14 },
    // Plaza Utara (gy_base: 17 -> lantern_gy: 15)
    { gx: 22, gy: 15 }, { gx: 29, gy: 15 }, { gx: 35, gy: 15 }, { gx: 42, gy: 15 }, { gx: 57, gy: 15 },
    // Jalan Vertikal Barat (gx: 17)
    { gx: 17, gy: 22 }, { gx: 17, gy: 32 }, { gx: 17, gy: 37 }, { gx: 17, gy: 47 }, { gx: 17, gy: 52 }, { gx: 17, gy: 62 },
    // Promenade Laut Timur (gx: 62)
    { gx: 62, gy: 20 }, { gx: 62, gy: 25 }, { gx: 62, gy: 32 }, { gx: 62, gy: 45 }, { gx: 62, gy: 50 }, { gx: 62, gy: 57 },
    // Teluk Pantai Selatan (gy_base: 63 -> lantern_gy: 61)
    { gx: 22, gy: 61 }, { gx: 26, gy: 61 }, { gx: 30, gy: 61 }, { gx: 34, gy: 61 }, { gx: 40, gy: 61 },
    { gx: 45, gy: 61 }, { gx: 49, gy: 61 }, { gx: 53, gy: 61 }, { gx: 57, gy: 61 },
    // Barat Daya dalam (gy_base: 64 -> lantern_gy: 62)
    { gx: 3, gy: 62 }, { gx: 10, gy: 62 }, { gx: 17, gy: 62 },
    // Tenggara dalam (gy_base: 64 -> lantern_gy: 62)
    { gx: 62, gy: 62 }, { gx: 69, gy: 62 }, { gx: 76, gy: 62 },
    // Barat Daya luar (gy_base: 69 -> lantern_gy: 67)
    { gx: 3, gy: 67 }, { gx: 10, gy: 67 }, { gx: 17, gy: 67 }, { gx: 22, gy: 67 },
    // Tenggara luar (gy_base: 69 -> lantern_gy: 67)
    { gx: 57, gy: 67 }, { gx: 62, gy: 67 }, { gx: 69, gy: 67 }, { gx: 76, gy: 67 }
  ];

  /**
   * Menempatkan 44 lampu jalan standar di seluruh penjuru kota
   */
  public static spawnWorldLamps(
    addGridPropFn: (
      key: string,
      gx: number,
      gy: number,
      gw: number,
      gh: number,
      isObstacle?: boolean,
      interactiveCallback?: () => void,
      obstacleRows?: number
    ) => Phaser.GameObjects.Image | null
  ): void {
    this.allLamps.forEach(l => {
      addGridPropFn('prop-lampu', l.gx, l.gy, 1, 3, true);
    });
  }

  /**
   * Menambahkan zona rintangan fisika statis pada koordinat grid tertentu
   */
  public static addGridObstacle(
    scene: Phaser.Scene,
    tileSize: number,
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    invalidateCacheFn?: () => void
  ): Phaser.GameObjects.Zone {
    const pixelW = gw * tileSize;
    const pixelH = gh * tileSize;
    const centerX = gx * tileSize + pixelW / 2;
    const centerY = gy * tileSize + pixelH / 2;

    const zone = scene.add.zone(centerX, centerY, pixelW, pixelH);
    scene.physics.add.existing(zone, true);
    if (obstacles) {
      obstacles.add(zone);
    }
    if (invalidateCacheFn) {
      invalidateCacheFn();
    }
    return zone;
  }

  /**
   * Menambahkan gambar prop pada koordinat grid dengan kedalaman otomatis dan opsional rintangan
   */
  public static addGridProp(
    scene: Phaser.Scene,
    tileSize: number,
    key: string,
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    isObstacle: boolean = true,
    interactiveCallback?: () => void,
    obstacleRows?: number,
    addObstacleFn?: (gx: number, gy: number, gw: number, gh: number) => Phaser.GameObjects.Zone
  ): Phaser.GameObjects.Image | null {
    if (!scene.textures.exists(key)) return null;

    const pixelW = gw * tileSize;
    const pixelH = gh * tileSize;
    const centerX = gx * tileSize + pixelW / 2;
    const centerY = gy * tileSize + pixelH / 2;

    const img = scene.add.image(centerX, centerY, key);
    img.setDisplaySize(pixelW, pixelH);

    const isWildGrass = key === 'prop-rumput';
    const isTamanRumput = key === 'prop-taman-rumput';
    const isGroundCourt = key === 'court-bola' || key === 'court-basket';

    // Lapangan olahraga ditaruh pada kedalaman tanah (-94) agar pemain berjalan di atasnya
    if (isGroundCourt) {
      img.setDepth(-94);
    } else {
      img.setDepth((gy + gh) * tileSize);
    }

    if (isWildGrass || isTamanRumput || isGroundCourt) isObstacle = false;

    if (interactiveCallback) {
      img.setInteractive({ useHandCursor: true });
      img.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        interactiveCallback();
      });
    }

    if (isObstacle && !isWildGrass && !isTamanRumput && !isGroundCourt && addObstacleFn) {
      // Collision selalu di bagian baris dasar objek (default 1 baris)
      const rows = obstacleRows || 1;
      addObstacleFn(gx, gy + gh - rows, gw, rows);
    }

    // Daftarkan objek berukuran tinggi (Gedung, Rumah, Pohon, Pagar Batu dll: gh >= 2) ke sistem transparansi oklusi
    if (gh >= 2 && !isWildGrass && !isTamanRumput && !isGroundCourt) {
      const left = gx * tileSize;
      const right = (gx + gw) * tileSize;
      const top = gy * tileSize;
      const bottom = (gy + gh) * tileSize;

      const propItem: IOccludingProp = {
        img,
        left,
        right,
        top,
        bottom,
        baseY: bottom,
      };

      this.occludingProps.push(propItem);

      img.once(Phaser.GameObjects.Events.DESTROY, () => {
        const idx = this.occludingProps.indexOf(propItem);
        if (idx !== -1) {
          this.occludingProps.splice(idx, 1);
        }
      });
    }

    return img;
  }

  /**
   * Memuat perabotan kustom arsitek dari penyimpanan lokal (Tahta Raden)
   */
  public static spawnArchitectCustomProps(
    addGridPropFn: (
      key: string,
      gx: number,
      gy: number,
      gw: number,
      gh: number,
      isObstacle?: boolean
    ) => Phaser.GameObjects.Image | null,
    customPropsGroup: (Phaser.GameObjects.Image | Phaser.GameObjects.GameObject)[]
  ): void {
    try {
      const saved = localStorage.getItem('raden_architect_world');
      if (!saved) return;
      const cfg = JSON.parse(saved);
      if (!cfg.customProps || !Array.isArray(cfg.customProps)) return;

      cfg.customProps.forEach((prop: any) => {
        if (prop.id && String(prop.id).startsWith('def_')) return;
        const spawned = addGridPropFn(
          prop.key,
          prop.gx,
          prop.gy,
          prop.gw || 1,
          prop.gh || 1,
          prop.isObstacle ?? true
        );
        if (spawned) {
          customPropsGroup.push(spawned);
        }
      });
    } catch (e) {
      console.warn('[WorldProps] Gagal memuat custom architect props:', e);
    }
  }

  /**
   * ==========================================================================
   * SLOT KHUSUS PEMBANGUNAN GEDUNG MASA DEPAN (FUTURE BUILDINGS)
   * ==========================================================================
   * PENTING:
   * Saat menambahkan gedung baru (SD, SMP, SMA, Rumah Sakit, Cafe, Bank, Rumah,
   * Pujasera, atau Stadion), letakkan kode pembuatannya di fungsi ini atau
   * buat file pendukung 'WorldBuildings.ts'.
   *
   * Dengan cara ini, tata letak jalan, trotoar, dan lampu yang sudah sempurna
   * tetap aman dan tidak perlu dianalisis ulang, serta kode tetap modular!
   * ==========================================================================
   */
  public static buildFutureBuildings(
    scene: Phaser.Scene,
    tileSize: number,
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    addGridPropFn: (
      key: string,
      gx: number,
      gy: number,
      gw: number,
      gh: number,
      isObstacle?: boolean,
      interactiveCallback?: () => void,
      obstacleRows?: number
    ) => Phaser.GameObjects.Image | null
  ): void {
    // ========================================================================
    // PAGAR BATU BATAS UTARA (x: 23 & x: 42, y: 0..16)
    // 16 segmen pagar bertingkat (gy: 0..15) mencakup tepat petak 0 s/d 16
    // ========================================================================
    // 1. Pagar Batu Sisi Barat (x = 23, y = 0 s/d 16)
    for (let gy = 0; gy <= 15; gy++) {
      addGridPropFn('prop-pagar-batu', 23, gy, 1, 2, true, undefined, 1);
    }
    // 2. Pagar Batu Sisi Timur (x = 42, y = 0 s/d 16)
    for (let gy = 0; gy <= 15; gy++) {
      addGridPropFn('prop-pagar-batu', 42, gy, 1, 2, true, undefined, 1);
    }
    // 3. Pagar Batu Batas Timur Trotoar 2 (x = 56, y = 0 s/d 16, gy: 0..15)
    for (let gy = 0; gy <= 15; gy++) {
      addGridPropFn('prop-pagar-batu', 56, gy, 1, 2, true, undefined, 1);
    }

    // ========================================================================
    // KOMPLEKS GEDUNG SEKOLAH 5x10 (Ukuran Asli: gw = 5, gh = 10)
    // Menempel batas utara gy: 0 s/d dasar/pintu di gy: 9-10
    // 1. Gedung SD  : gx: 25..29, gy: 0..9 (5x10 petak)
    // 2. Gedung SMP : gx: 31..35, gy: 0..9 (5x10 petak)
    // 3. Gedung SMA : gx: 37..41, gy: 0..9 (5x10 petak)
    // ========================================================================
    // 1. Gedung SD Merah
    addGridPropFn(
      'school-sd-building',
      25,
      0,
      5,
      10,
      true,
      () => {
        (scene as any).approachDoorAndEnter?.('sd', 3300, 1140);
      },
      2
    );

    // 2. Gedung SMP Biru
    addGridPropFn(
      'school-smp-building',
      31,
      0,
      5,
      10,
      true,
      () => {
        (scene as any).approachDoorAndEnter?.('smp', 4020, 1140);
      },
      2
    );

    // 3. Gedung SMA Cyan
    addGridPropFn(
      'school-sma-building',
      37,
      0,
      5,
      10,
      true,
      () => {
        (scene as any).approachDoorAndEnter?.('sma', 4740, 1140);
      },
      2
    );

    // ========================================================================
    // RUMAH PRIBADI PEMAIN 5x5 (gx: 9..13, gy: 2..6, Pintu: gx: 11.5, gy: 7)
    // Berada tepat di tengah kawasan residensial di antara deretan pohon zigzag
    // ========================================================================
    addGridPropFn(
      'house-5x5',
      9,
      2,
      5,
      5,
      true,
      () => {
        (scene as any).approachDoorAndEnter?.('house', 1380, 840);
      },
      2
    );

    // ========================================================================
    // DERETAN POHON TINGGI 1x3 (ZIGZAG SISI TIMUR & BARAT KAWASAN RESIDENSIAL)
    // Berakhir di y=8 (x:19, y:8 dan x:2, y:8) agar petak 9, 10, 11 bersih
    // Sisi Timur: (19,8), (18,7), (19,6), (18,5), (19,4), (18,3), (19,2), (18,1)
    // Sisi Barat: (2,8), (3,7), (2,6), (3,5), (2,4), (3,3), (2,2), (3,1)
    // ========================================================================
    const tallTrees: Array<{ gx: number; gy: number }> = [
      // Sisi Timur Residensi (x: 18..19, y: 1..8)
      { gx: 19, gy: 8 },
      { gx: 18, gy: 7 },
      { gx: 19, gy: 6 },
      { gx: 18, gy: 5 },
      { gx: 19, gy: 4 },
      { gx: 18, gy: 3 },
      { gx: 19, gy: 2 },
      { gx: 18, gy: 1 },
      // Sisi Barat Residensi (x: 2..3, y: 1..8)
      { gx: 2, gy: 8 },
      { gx: 3, gy: 7 },
      { gx: 2, gy: 6 },
      { gx: 3, gy: 5 },
      { gx: 2, gy: 4 },
      { gx: 3, gy: 3 },
      { gx: 2, gy: 2 },
      { gx: 3, gy: 1 },
    ];

    tallTrees.forEach((tree) => {
      addGridPropFn('prop-pohon-tall', tree.gx, tree.gy, 1, 3, true, undefined, 1);
    });

    // ========================================================================
    // RUMPUT LIAR ALAMI 1x2 (Pekarangan Kawasan Residensial)
    // Ditanam di setiap baris y agar padat, tidak ada petak yang terlihat kosong:
    // 1. Sisi Kiri Rumah : gx: 7..8, gy: 2..7 (tiap baris y: 2, 3, 4, 5, 6, 7)
    // 2. Belakang Rumah  : gx: 9..13, gy: 2..3
    // 3. Sisi Kanan Rumah: gx: 14..15, gy: 2..7 (tiap baris y: 2, 3, 4, 5, 6, 7)
    // ========================================================================
    this.wildGrassSprites = [];

    const spawnGrass = (gx: number, gy: number) => {
      const g = addGridPropFn('prop-rumput', gx, gy, 1, 2, false);
      if (g) {
        // Set pivot point ke dasar akar rumput (bawah) agar goyangan natural dari tanah
        g.setOrigin(0.5, 0.95);
        g.y += 108; // 240 * (0.95 - 0.5) = 108px
        this.wildGrassSprites.push(g);
      }
    };

    // Sisi Kiri Rumah (x: 7..8, y: 2..7 lengkap di setiap baris petak)
    for (let gy = 2; gy <= 7; gy++) {
      for (let gx = 7; gx <= 8; gx++) {
        spawnGrass(gx, gy);
      }
    }

    // Belakang Rumah (x: 9..13, y: 2..3)
    for (let gy = 2; gy <= 3; gy++) {
      for (let gx = 9; gx <= 13; gx++) {
        spawnGrass(gx, gy);
      }
    }

    // Sisi Kanan Rumah (x: 14..15, y: 2..7 lengkap di setiap baris petak)
    for (let gy = 2; gy <= 7; gy++) {
      for (let gx = 14; gx <= 15; gx++) {
        spawnGrass(gx, gy);
      }
    }

    // ========================================================================
    // SARANA OLAHRAGA ALUN-ALUN (BAGIAN BAWAH ALUN-ALUN: gy: 51..55)
    // 1. Lapangan Sepak Bola (10x5 Petak Grid): gx: 24..33, gy: 51..55
    // 2. Lapangan Bola Basket (10x5 Petak Grid): gx: 46..55, gy: 51..55
    // Memberikan koridor jalan tengah 12 petak (gx: 34..45) yang asri & luas
    // ========================================================================
    // a. Lapangan Sepak Bola (10x5)
    addGridPropFn(
      'court-bola',
      24,
      51,
      10,
      5,
      false,
      () => {
        const p = (scene as any).player;
        if (p) {
          p.showSpeechBubble('⚽ Oper ke depan dan... TENDANG! GOOOOL!! 🥅🔥', 2500);
          try {
            SoundManager.getInstance().playClick();
          } catch (e) {}
        }
      }
    );

    // Rintangan fisik tiang gawang sepak bola (Kiri & Kanan)
    WorldProps.addGridObstacle(scene, tileSize, obstacles, 23.6, 52.8, 0.7, 1.4);
    WorldProps.addGridObstacle(scene, tileSize, obstacles, 33.7, 52.8, 0.7, 1.4);

    // b. Lapangan Bola Basket (10x5)
    addGridPropFn(
      'court-basket',
      46,
      51,
      10,
      5,
      false,
      () => {
        const p = (scene as any).player;
        if (p) {
          p.showSpeechBubble('🏀 Dribble melewati lawan, lompat dan... SLAM DUNK! 💥🏀', 2500);
          try {
            SoundManager.getInstance().playClick();
          } catch (e) {}
        }
      }
    );

    // Rintangan fisik tiang ring basket (Kiri & Kanan)
    WorldProps.addGridObstacle(scene, tileSize, obstacles, 45.7, 53.0, 0.6, 1.0);
    WorldProps.addGridObstacle(scene, tileSize, obstacles, 55.7, 53.0, 0.6, 1.0);

    // ========================================================================
    // KAWASAN KOMERSIAL & LAYANAN PUBLIK BARAT (6 Gedung 5x5 Petak Grid)
    // Sesuai Tata Letak Grid:
    // Row 1 (gy: 21):
    //   - gx: 1,  gy: 21 -> Raden Cafe (5x5)
    //   - gx: 12, gy: 21 -> Perpustakaan Kota (5x5)
    // Row 2 (gy: 37):
    //   - gx: 1,  gy: 37 -> Kantor Polisi (5x5)
    //   - gx: 12, gy: 37 -> Kantor Bank Sentral (5x5)
    // Row 3 (gy: 53):
    //   - gx: 1,  gy: 53 -> Apotek Farma (5x5)
    //   - gx: 12, gy: 53 -> Kantor Makelar Properti (5x5)
    // ========================================================================
    // 1. Raden Cafe 5x5 (gx: 1, gy: 21)
    addGridPropFn(
      'building-cafe',
      1,
      21,
      5,
      5,
      true,
      () => {
        if ((scene as any).transitionToCafe) {
          (scene as any).transitionToCafe();
        } else {
          scene.scene.start('CafeScene');
        }
      },
      2
    );

    // 2. Perpustakaan 5x5 (gx: 12, gy: 21)
    addGridPropFn(
      'building-perpustakaan',
      12,
      21,
      5,
      5,
      true,
      () => {
        if ((scene as any).transitionToLibrary) {
          (scene as any).transitionToLibrary();
        } else {
          scene.scene.start('LibraryScene');
        }
      },
      2
    );

    // 3. Kantor Polisi 5x5 (gx: 1, gy: 37)
    addGridPropFn(
      'building-kantor-polisi',
      1,
      37,
      5,
      5,
      true,
      () => {
        EventBus.emit('open-police-modal');
      },
      2
    );

    // 4. Kantor Bank 5x5 (gx: 12, gy: 37)
    addGridPropFn(
      'building-bank',
      12,
      37,
      5,
      5,
      true,
      () => {
        EventBus.emit('open-bank-modal');
      },
      2
    );

    // 5. Apotek 5x5 (gx: 1, gy: 53)
    addGridPropFn(
      'building-apotek',
      1,
      53,
      5,
      5,
      true,
      () => {
        EventBus.emit('open-pharmacy-modal');
      },
      2
    );

    // 6. Makelar 5x5 (gx: 12, gy: 53)
    addGridPropFn(
      'building-makelar',
      12,
      53,
      5,
      5,
      true,
      () => {
        EventBus.emit('open-realtor-modal');
      },
      2
    );
  }

  /**
   * Mengatur animasi goyangan rumput saat diinjak / didekati pemain yang sedang bergerak.
   * Rumput berhenti bergoyang dan kembali tegak jika pemain diam (idle).
   */
  public static updateWildGrassSway(
    time: number,
    localPlayer: { x: number; y: number; getIsMoving?: () => boolean } | null,
    remotePlayers?: Map<string, any>
  ): void {
    if (!this.wildGrassSprites || this.wildGrassSprites.length === 0) return;

    const movingPositions: { x: number; y: number }[] = [];

    if (localPlayer) {
      const isLocalMoving =
        (typeof (localPlayer as any).getIsMoving === 'function' && (localPlayer as any).getIsMoving()) ||
        Boolean((localPlayer as any).isMoving) ||
        Boolean(
          (localPlayer as any).body &&
            (Math.abs((localPlayer as any).body.velocity.x) > 5 ||
              Math.abs((localPlayer as any).body.velocity.y) > 5)
        );

      if (isLocalMoving) {
        movingPositions.push({ x: localPlayer.x, y: localPlayer.y });
      }
    }

    if (remotePlayers) {
      remotePlayers.forEach((rp) => {
        if (rp && rp.active) {
          const isRemoteMoving =
            (typeof rp.getIsMoving === 'function' ? rp.getIsMoving() : false) ||
            Boolean(rp.isMoving) ||
            Boolean(rp.body && (Math.abs(rp.body.velocity.x) > 5 || Math.abs(rp.body.velocity.y) > 5));
          if (isRemoteMoving) {
            movingPositions.push({ x: rp.x, y: rp.y });
          }
        }
      });
    }

    const hasMovingPlayers = movingPositions.length > 0;
    const triggerRadius = 125; // Radius sentuhan ~1 petak di sekeliling rumpun rumput

    for (let i = 0; i < this.wildGrassSprites.length; i++) {
      const grass = this.wildGrassSprites[i];
      if (!grass || !grass.active) continue;

      let isTriggered = false;
      let minDist = 9999;

      if (hasMovingPlayers) {
        // grass.y berada di titik jangkar akar (bawah).
        // Titik tengah visual rumput 1x2 berada ~108px di atas akarnya.
        const grassCenterY = grass.y - 108;

        for (let j = 0; j < movingPositions.length; j++) {
          const pos = movingPositions[j];
          const dist = Phaser.Math.Distance.Between(pos.x, pos.y, grass.x, grassCenterY);
          if (dist < triggerRadius && dist < minDist) {
            minDist = dist;
            isTriggered = true;
          }
        }
      }

      if (isTriggered) {
        // Goyangan rumput alami: terayun jelas (tidak kaku), berayun lembut & wajar (tidak berlebihan)
        const influence = Math.max(0.35, 1 - (minDist / triggerRadius));
        const swaySpeed = 0.016; // Kecepatan ayunan serasi dengan ketukan langkah kaki
        const maxSwayAngle = 7.0 * influence; // Maksimal ±7 derajat di pusat sentuhan
        const phaseOffset = grass.x * 0.03 + grass.y * 0.02;
        const targetAngle = Math.sin(time * swaySpeed + phaseOffset) * maxSwayAngle;

        grass.angle = Phaser.Math.Linear(grass.angle, targetAngle, 0.2);
      } else {
        // Pemain diam / menjauh -> Rumput kembali tegak lurus (0 derajat) secara mulus
        if (grass.angle !== 0) {
          grass.angle = Phaser.Math.Linear(grass.angle, 0, 0.15);
          if (Math.abs(grass.angle) < 0.05) {
            grass.angle = 0;
          }
        }
      }
    }
  }

  /**
   * Mengatur efek transparansi (Occlusion Transparency) ketika karakter berada di belakang objek/gedung/pohon.
   * Objek di depan karakter akan memudar halus (alpha 0.38) sehingga pemain selalu dapat melihat karakternya dengan jelas dari sudut pandangnya (POV).
   */
  public static updateBuildingOcclusion(
    time: number,
    delta: number,
    localPlayer: { x: number; y: number } | null
  ): void {
    if (!this.occludingProps || this.occludingProps.length === 0 || !localPlayer) return;

    const px = localPlayer.x;
    const py = localPlayer.y;

    const dt = Math.min(0.05, delta / 1000);
    // Transisi pemudaran halus (Fade transition ~120-150ms)
    const lerpFactor = Math.min(1.0, dt * 10);

    for (let i = 0; i < this.occludingProps.length; i++) {
      const prop = this.occludingProps[i];
      if (!prop.img || !prop.img.active) continue;

      // Cek apakah posisi horizontal karakter berada di dalam rentang lebar bangunan (dengan padding 45px)
      const isBehindX = (px + 45 >= prop.left) && (px - 45 <= prop.right);

      // Cek apakah posisi vertikal karakter berada di belakang objek:
      // 1. py + 55 < prop.baseY -> Kedalaman karakter lebih kecil dari dasar objek (karakter di belakang objek)
      // 2. py >= prop.top - 30 -> Karakter berada di area bangunan / atap (bukan jauh di utara)
      const isBehindY = (py + 55 < prop.baseY) && (py >= prop.top - 30);

      const isOccluded = isBehindX && isBehindY;
      const targetAlpha = isOccluded ? 0.38 : 1.0;

      // Lerp alpha menuju target
      if (Math.abs(prop.img.alpha - targetAlpha) > 0.005) {
        prop.img.alpha += (targetAlpha - prop.img.alpha) * lerpFactor;
      } else if (prop.img.alpha !== targetAlpha) {
        prop.img.alpha = targetAlpha;
      }
    }
  }
}
