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

export interface ILampCoord {
  gx: number;
  gy: number;
}

export class WorldProps {
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

    img.setDepth((gy + gh) * tileSize);

    if (isWildGrass || isTamanRumput) isObstacle = false;

    if (interactiveCallback) {
      img.setInteractive({ useHandCursor: true });
      img.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        interactiveCallback();
      });
    }

    if (isObstacle && !isWildGrass && !isTamanRumput && addObstacleFn) {
      // Collision selalu di bagian baris dasar objek (default 1 baris)
      const rows = obstacleRows || 1;
      addObstacleFn(gx, gy + gh - rows, gw, rows);
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
    // Siap diisi penempatan gedung visual saat aset gedung sudah final.
    // Contoh template penempatan gedung di masa mendatang:
    /*
    // 1. Gedung SD Merah (gx: 26, gy: 3, 7x8 petak)
    addGridPropFn('building-sd', 26, 3, 7, 8, true, () => {
      // callback interaksi pintu masuk
    }, 2);

    // 2. Gedung SMP Biru (gx: 34, gy: 3, 7x8 petak)
    addGridPropFn('building-smp', 34, 3, 7, 8, true, () => {}, 2);

    // 3. Gedung SMA Cyan (gx: 42, gy: 3, 7x8 petak)
    addGridPropFn('building-sma', 42, 3, 7, 8, true, () => {}, 2);
    */
  }
}
