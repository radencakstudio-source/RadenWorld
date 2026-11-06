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

export interface IBuildingLightInstance {
  id: string;
  name: string;
  doorX: number;
  doorY: number;
  radius: number;
  surroundings: Array<{ x: number; y: number; r: number }>;
  sprites: Phaser.GameObjects.Image[];
  phase: number;
}

export interface ILampLightInstance {
  lampImg: Phaser.GameObjects.Image;
  bulbCore: Phaser.GameObjects.Image;
  haloGlow: Phaser.GameObjects.Image;
  groundPool: Phaser.GameObjects.Image;
  lanternX: number;
  lanternY: number;
  groundX: number;
  groundY: number;
  phase: number;
}

export class WorldProps {
  /**
   * Kumpulan sprite rumput liar untuk interaksi goyangan saat diinjak / didekati pemain yang bergerak
   */
  public static wildGrassSprites: Phaser.GameObjects.Image[] = [];
  public static occludingProps: IOccludingProp[] = [];
  public static lampLights: ILampLightInstance[] = [];
  public static buildingLights: IBuildingLightInstance[] = [];
  private static lastGrassSwayTime: number = 0;
  private static lastOcclusionTime: number = 0;
  private static lastLampLightTime: number = 0;
  private static anyGrassSwaying: boolean = false;

  /**
   * Reset seluruh kumpulan props saat inisialisasi ulang scene
   */
  public static resetProps(): void {
    this.lampLights.forEach((l) => {
      try {
        if (l.bulbCore?.active) l.bulbCore.destroy();
        if (l.haloGlow?.active) l.haloGlow.destroy();
        if (l.groundPool?.active) l.groundPool.destroy();
      } catch (e) {}
    });
    this.lampLights = [];
    this.buildingLights.forEach((b) => {
      b.sprites.forEach((s) => {
        try {
          if (s?.active) s.destroy();
        } catch (e) {}
      });
    });
    this.buildingLights = [];
    this.wildGrassSprites = [];
    this.occludingProps = [];
    this.lastGrassSwayTime = 0;
    this.lastOcclusionTime = 0;
    this.lastLampLightTime = 0;
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
        if ((window as any).__raden_virtual_control_active) return;
        if (pointer?.event?.target && (pointer.event.target as HTMLElement).tagName !== 'CANVAS') return;
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

    // Pasang cahaya lentera menyala otomatis pada seluruh aset lampu jalan (prop-lampu 1x3)
    if (key === 'prop-lampu') {
      const lanternX = centerX;
      // Kaca lentera prop-lampu (1x3 = 120x360px) berada tepat di 41.5% tinggi dari atas -> centerY - 31px
      const lanternY = centerY - Math.round(pixelH * 0.086);
      const groundX = centerX;
      // Dasar kaki batu lampu jalan berada tepat di permukaan aspal/trotoar -> centerY + 148px
      const groundY = centerY + Math.round(pixelH * 0.41);

      const groundPool = scene.textures.exists('lamp-ground-pool')
        ? scene.add.image(groundX, groundY, 'lamp-ground-pool')
        : scene.add.image(groundX, groundY, 'soft-light-glow');
      groundPool.setDisplaySize(350, 235);
      groundPool.setBlendMode(Phaser.BlendModes.ADD);
      groundPool.setDepth(-92);
      groundPool.setAlpha(0.55);

      const haloGlow = scene.textures.exists('lamp-halo-glow')
        ? scene.add.image(lanternX, lanternY, 'lamp-halo-glow')
        : scene.add.image(lanternX, lanternY, 'soft-light-glow');
      haloGlow.setDisplaySize(215, 215);
      haloGlow.setBlendMode(Phaser.BlendModes.ADD);
      haloGlow.setDepth(img.depth + 1);
      haloGlow.setAlpha(0.65);

      const bulbCore = scene.textures.exists('lamp-bulb-core')
        ? scene.add.image(lanternX, lanternY, 'lamp-bulb-core')
        : scene.add.image(lanternX, lanternY, 'soft-light-glow');
      bulbCore.setDisplaySize(74, 80);
      bulbCore.setBlendMode(Phaser.BlendModes.ADD);
      bulbCore.setDepth(img.depth + 2);
      bulbCore.setAlpha(0.88);

      const lampInst: ILampLightInstance = {
        lampImg: img,
        bulbCore,
        haloGlow,
        groundPool,
        lanternX,
        lanternY,
        groundX,
        groundY,
        phase: (gx * 0.73 + gy * 1.19) % (Math.PI * 2),
      };
      this.lampLights.push(lampInst);

      img.once(Phaser.GameObjects.Events.DESTROY, () => {
        const lIdx = this.lampLights.indexOf(lampInst);
        if (lIdx !== -1) this.lampLights.splice(lIdx, 1);
        if (bulbCore.active) bulbCore.destroy();
        if (haloGlow.active) haloGlow.destroy();
        if (groundPool.active) groundPool.destroy();
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
  /**
   * Mendaftarkan lampu pencahayaan hangat untuk gedung/rumah/billboard
   */
  public static addBuildingLighting(
    scene: Phaser.Scene,
    id: string,
    name: string,
    doorX: number,
    doorY: number,
    radius: number,
    surroundings: Array<{ x: number; y: number; r?: number }>,
    baseDepth: number = 0
  ): IBuildingLightInstance {
    const sprites: Phaser.GameObjects.Image[] = [];

    // Kolam cahaya lembut di sekeliling tanah & halaman depan gedung (bukan bola di tengah bangunan)
    const allPools = [{ x: doorX, y: doorY, r: radius }, ...surroundings];
    allPools.forEach((p) => {
      const pr = p.r || radius;
      const groundPool = scene.textures.exists('lamp-ground-pool')
        ? scene.add.image(p.x, p.y, 'lamp-ground-pool')
        : scene.add.image(p.x, p.y, 'soft-light-glow');
      groundPool.setDisplaySize(pr * 1.8, pr * 1.1);
      groundPool.setBlendMode(Phaser.BlendModes.ADD);
      groundPool.setDepth(-91);
      groundPool.setAlpha(0.48);
      sprites.push(groundPool);
    });

    const instance: IBuildingLightInstance = {
      id,
      name,
      doorX,
      doorY,
      radius,
      surroundings: allPools.map((p) => ({ x: p.x, y: p.y, r: p.r || radius })),
      sprites,
      phase: Math.random() * Math.PI * 2,
    };
    this.buildingLights.push(instance);
    return instance;
  }

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
    this.addBuildingLighting(scene, 'school-sd', 'Gedung SD', 3300, 1140, 220, [{ x: 3180, y: 1140, r: 180 }, { x: 3420, y: 1140, r: 180 }], (0 + 10) * tileSize);
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
    this.addBuildingLighting(scene, 'school-smp', 'Gedung SMP', 4020, 1140, 220, [{ x: 3900, y: 1140, r: 180 }, { x: 4140, y: 1140, r: 180 }], (0 + 10) * tileSize);
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
    this.addBuildingLighting(scene, 'school-sma', 'Gedung SMA', 4740, 1140, 220, [{ x: 4620, y: 1140, r: 180 }, { x: 4860, y: 1140, r: 180 }], (0 + 10) * tileSize);
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
    this.addBuildingLighting(scene, 'house', 'Rumah Pribadi', 1380, 840, 200, [{ x: 1260, y: 840, r: 160 }, { x: 1500, y: 840, r: 160 }], (2 + 5) * tileSize);
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
    // a. Lapangan Sepak Bola (10x5) - Bisa diinjak bebas tanpa rintangan collider
    addGridPropFn(
      'court-bola',
      24,
      53,
      10,
      5,
      false
    );

    // b. Lapangan Bola Basket (10x5) - Bisa diinjak bebas tanpa rintangan collider
    addGridPropFn(
      'court-basket',
      46,
      53,
      10,
      5,
      false
    );

    // ========================================================================
    // DERETAN POHON TINGGI 1x3 DI Y = 31 (Sisi Kiri x: 22..32 & Sisi Kanan x: 44..57)
    // ========================================================================
    // 1. Sisi Kiri (y = 31, dari x = 22 sampai x = 32)
    for (let gx = 22; gx <= 32; gx++) {
      addGridPropFn('prop-pohon-tall', gx, 31, 1, 3, true, undefined, 1);
    }

    // 2. Sisi Kanan (y = 31, dari x = 44 sampai x = 57)
    for (let gx = 44; gx <= 57; gx++) {
      addGridPropFn('prop-pohon-tall', gx, 31, 1, 3, true, undefined, 1);
    }

    // ========================================================================
    // c. 2 PAPAN POPUP REKLAME BILLBOARD 10x10 DI Y = 49/50 (gx: 22 dan gx: 45)
    // Sesuai asset 10X10 Popup.png (BootScene key: 'popup-billboard')
    // Collider di barisan x 1 baris saja tepat di baris dasar y = 49 (tebal 1 petak)
    // ========================================================================
    // Deretan Pohon 1x3 di Belakang Popup Kiri (y = 46, dari x = 22 sampai x = 32)
    for (let gx = 22; gx <= 32; gx++) {
      const tree = addGridPropFn('prop-pohon-tall', gx, 46, 1, 3, true, undefined, 1);
      if (tree) {
        tree.setDepth((46 + 3) * tileSize - 5); // Di belakang pagar batu dan popup billboard
      }
    }

    // Pagar Batu di Belakang Popup Kiri (y = 47, dari x = 22 sampai x = 32)
    for (let gx = 22; gx <= 32; gx++) {
      const fence = addGridPropFn('prop-pagar-batu', gx, 47, 1, 2, true, undefined, 1);
      if (fence) {
        fence.setDepth((47 + 2) * tileSize - 2); // Di belakang popup billboard
      }
    }

    // 1. Papan Popup Kiri (gx: 22, gy: 40..50, collider 1 baris di y: 49, ukuran 10x10)
    this.addBuildingLighting(scene, 'billboard-left', 'Billboard Barat', 3240, 5940, 240, [{ x: 2880, y: 5940, r: 200 }, { x: 3600, y: 5940, r: 200 }], (40 + 10) * tileSize);
    const popupLeft = addGridPropFn(
      'popup-billboard',
      22,
      40,
      10,
      10,
      true, // Collider 1 barisan horizontal sepanjang sumbu X (obstacleRows = 1 di y: 49)
      undefined,
      1
    );
    if (popupLeft) {
      popupLeft.setDepth((40 + 10) * tileSize + 1); // Memastikan popup berada di depan pagar batu
    }

    // Deretan Pohon 1x3 di Belakang/Samping Popup Kanan (y = 46, dari x = 44 sampai x = 57)
    for (let gx = 44; gx <= 57; gx++) {
      const tree = addGridPropFn('prop-pohon-tall', gx, 46, 1, 3, true, undefined, 1);
      if (tree) {
        tree.setDepth((46 + 3) * tileSize - 5); // Di belakang pagar batu dan popup billboard
      }
    }

    // Pagar Batu di Belakang/Samping Popup Kanan (y = 47, dari x = 44 sampai x = 57)
    for (let gx = 44; gx <= 57; gx++) {
      const fence = addGridPropFn('prop-pagar-batu', gx, 47, 1, 2, true, undefined, 1);
      if (fence) {
        fence.setDepth((47 + 2) * tileSize - 2); // Di belakang popup billboard
      }
    }

    // 2. Papan Popup Kanan (gx: 45, gy: 40..50, collider 1 baris di y: 49, ukuran 10x10)
    this.addBuildingLighting(scene, 'billboard-right', 'Billboard Timur', 6000, 5940, 240, [{ x: 5640, y: 5940, r: 200 }, { x: 6360, y: 5940, r: 200 }], (40 + 10) * tileSize);
    const popupRight = addGridPropFn(
      'popup-billboard',
      45,
      40,
      10,
      10,
      true, // Collider 1 barisan horizontal sepanjang sumbu X (obstacleRows = 1 di y: 49)
      undefined,
      1
    );
    if (popupRight) {
      popupRight.setDepth((40 + 10) * tileSize + 1); // Memastikan popup berada di depan pagar batu
    }

    // ========================================================================
    // KAWASAN KOMERSIAL & LAYANAN PUBLIK BARAT (6 Gedung 5x5 Petak Grid)
    // Sesuai Tata Letak Grid:
    // Row 1 (gy: 17):
    //   - gx: 1,  gy: 17 -> Raden Cafe (5x5)
    //   - gx: 12, gy: 17 -> Perpustakaan Kota / Restaurant (5x5)
    // Row 2 (gy: 32):
    //   - gx: 1,  gy: 32 -> Kantor Polisi (5x5)
    //   - gx: 12, gy: 32 -> Kantor Bank Sentral (5x5)
    // Row 3 (gy: 48):
    //   - gx: 1,  gy: 48 -> Apotek Farma (5x5)
    //   - gx: 12, gy: 48 -> Kantor Makelar Properti (5x5)
    // ========================================================================
    // 1. Raden Cafe 5x5 (gx: 1, gy: 17)
    this.addBuildingLighting(scene, 'cafe', 'Raden Cafe', 420, 2520, 200, [{ x: 300, y: 2520, r: 160 }, { x: 540, y: 2520, r: 160 }], (17 + 5) * tileSize);
    addGridPropFn(
      'building-cafe',
      1,
      17,
      5,
      5,
      true,
      () => {
        if ((scene as any).transitionToCafe) {
          (scene as any).transitionToCafe();
        } else {
          scene.scene.start('CafeScene', { returnX: 420, returnY: 2680 });
        }
      },
      2
    );

    // 2. Perpustakaan 5x5 (gx: 12, gy: 17)
    this.addBuildingLighting(scene, 'perpustakaan', 'Perpustakaan', 1740, 2520, 200, [{ x: 1620, y: 2520, r: 160 }, { x: 1860, y: 2520, r: 160 }], (17 + 5) * tileSize);
    addGridPropFn(
      'building-perpustakaan',
      12,
      17,
      5,
      5,
      true,
      () => {
        if ((scene as any).transitionToLibrary) {
          (scene as any).transitionToLibrary();
        } else {
          scene.scene.start('LibraryScene', { returnX: 1740, returnY: 2680 });
        }
      },
      2
    );

    // 3. Kantor Polisi 5x5 (gx: 1, gy: 32)
    this.addBuildingLighting(scene, 'kantor-polisi', 'Kantor Polisi', 420, 4320, 200, [{ x: 300, y: 4320, r: 160 }, { x: 540, y: 4320, r: 160 }], (32 + 5) * tileSize);
    addGridPropFn(
      'building-kantor-polisi',
      1,
      32,
      5,
      5,
      true,
      () => {
        EventBus.emit('open-police-modal');
      },
      2
    );

    // 4. Kantor Bank 5x5 (gx: 12, gy: 32)
    this.addBuildingLighting(scene, 'bank', 'Bank Sentral', 1740, 4320, 200, [{ x: 1620, y: 4320, r: 160 }, { x: 1860, y: 4320, r: 160 }], (32 + 5) * tileSize);
    addGridPropFn(
      'building-bank',
      12,
      32,
      5,
      5,
      true,
      () => {
        EventBus.emit('open-bank-modal');
      },
      2
    );

    // 5. Apotek 5x5 (gx: 1, gy: 48)
    this.addBuildingLighting(scene, 'apotek', 'Apotek Farma', 420, 6240, 200, [{ x: 300, y: 6240, r: 160 }, { x: 540, y: 6240, r: 160 }], (48 + 5) * tileSize);
    addGridPropFn(
      'building-apotek',
      1,
      48,
      5,
      5,
      true,
      () => {
        EventBus.emit('open-pharmacy-modal');
      },
      2
    );

    // 6. Makelar 5x5 (gx: 12, gy: 48)
    this.addBuildingLighting(scene, 'makelar', 'Makelar Properti', 1740, 6240, 200, [{ x: 1620, y: 6240, r: 160 }, { x: 1860, y: 6240, r: 160 }], (48 + 5) * tileSize);
    addGridPropFn(
      'building-makelar',
      12,
      48,
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

    // Throttle ke ~30 FPS untuk meringankan CPU secara signifikan tanpa mengurangi visual
    if (time - this.lastGrassSwayTime < 32) return;
    this.lastGrassSwayTime = time;

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

    if (remotePlayers && remotePlayers.size > 0) {
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
    if (!hasMovingPlayers && !this.anyGrassSwaying) return;

    let stillSwaying = false;
    const triggerRadius = 125; // Radius sentuhan ~1 petak di sekeliling rumpun rumput

    for (let i = 0; i < this.wildGrassSprites.length; i++) {
      const grass = this.wildGrassSprites[i];
      if (!grass || !grass.active) continue;

      let isTriggered = false;
      let minDist = 9999;

      if (hasMovingPlayers) {
        const grassCenterY = grass.y - 108;

        for (let j = 0; j < movingPositions.length; j++) {
          const pos = movingPositions[j];
          // Pre-filter bounding box cepat untuk menghindari kalkulasi akar kuadrat berlebih
          const dx = Math.abs(pos.x - grass.x);
          if (dx > triggerRadius) continue;
          const dy = Math.abs(pos.y - grassCenterY);
          if (dy > triggerRadius) continue;

          const dist = Math.hypot(dx, dy);
          if (dist < triggerRadius && dist < minDist) {
            minDist = dist;
            isTriggered = true;
          }
        }
      }

      if (isTriggered) {
        // Goyangan rumput alami: terayun jelas (tidak kaku), berayun lembut & wajar (tidak berlebihan)
        const influence = Math.max(0.35, 1 - (minDist / triggerRadius));
        const swaySpeed = 0.016;
        const maxSwayAngle = 7.0 * influence;
        const phaseOffset = grass.x * 0.03 + grass.y * 0.02;
        const targetAngle = Math.sin(time * swaySpeed + phaseOffset) * maxSwayAngle;

        grass.angle = Phaser.Math.Linear(grass.angle, targetAngle, 0.25);
        stillSwaying = true;
      } else {
        // Pemain diam / menjauh -> Rumput kembali tegak lurus (0 derajat) secara mulus
        if (grass.angle !== 0) {
          grass.angle = Phaser.Math.Linear(grass.angle, 0, 0.18);
          if (Math.abs(grass.angle) < 0.05) {
            grass.angle = 0;
          } else {
            stillSwaying = true;
          }
        }
      }
    }
    this.anyGrassSwaying = stillSwaying;
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

    // Throttle kalkulasi occlusion ke setiap 60ms
    if (time - this.lastOcclusionTime < 60) return;
    this.lastOcclusionTime = time;

    const px = localPlayer.x;
    const py = localPlayer.y;

    const dt = Math.min(0.08, delta / 1000);
    const lerpFactor = Math.min(1.0, dt * 10);

    for (let i = 0; i < this.occludingProps.length; i++) {
      const prop = this.occludingProps[i];
      if (!prop.img || !prop.img.active) continue;

      // Filter cepat: jika objek berjarak > 600px dari karakter, abaikan kalkulasi
      const midX = (prop.left + prop.right) * 0.5;
      const midY = (prop.top + prop.bottom) * 0.5;
      if (Math.abs(px - midX) > 600 || Math.abs(py - midY) > 600) {
        if (prop.img.alpha < 1.0) prop.img.alpha = 1.0;
        continue;
      }

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

  /**
   * Mengatur intensitas nyala lampu jalan secara dinamis berdasarkan waktu siang/senja/malam.
   * Kaca lentera selalu tampak menyala hangat, dan memancar terang ke jalanan saat senja/malam.
   */
  public static updateStreetLampLights(
    time: number,
    nightFactor: number,
    viewBounds?: { left: number; right: number; top: number; bottom: number }
  ): void {
    if (!this.lampLights || this.lampLights.length === 0) return;
    if (time - this.lastLampLightTime < 45) return;
    this.lastLampLightTime = time;

    const clampedNight = Phaser.Math.Clamp(nightFactor, 0, 1);
    const baseBulb = 0.62 + clampedNight * 0.36;   // 0.62 siang -> 0.98 malam
    const baseHalo = 0.28 + clampedNight * 0.62;   // 0.28 siang -> 0.90 malam
    const basePool = 0.16 + clampedNight * 0.68;   // 0.16 siang -> 0.84 malam

    // Update nyala lampu gedung, rumah, cafe, perpustakaan, apotek, bank, kantor & billboard
    for (let i = 0; i < this.buildingLights.length; i++) {
      const b = this.buildingLights[i];
      const pulse = Math.sin(time * 0.003 + b.phase) * 0.04;
      for (let j = 0; j < b.sprites.length; j++) {
        const s = b.sprites[j];
        if (!s || !s.active) continue;
        const targetA = (s.depth < 0 ? basePool : baseBulb) + pulse;
        s.setAlpha(Phaser.Math.Clamp(targetA, 0.15, 0.95));
      }
    }

    for (let i = 0; i < this.lampLights.length; i++) {
      const l = this.lampLights[i];
      if (!l.lampImg || !l.lampImg.active) continue;

      if (viewBounds) {
        const inView =
          l.lanternX >= viewBounds.left - 320 &&
          l.lanternX <= viewBounds.right + 320 &&
          l.groundY >= viewBounds.top - 380 &&
          l.lanternY <= viewBounds.bottom + 320;
        if (!inView) {
          if (l.bulbCore.visible) l.bulbCore.setVisible(false);
          if (l.haloGlow.visible) l.haloGlow.setVisible(false);
          if (l.groundPool.visible) l.groundPool.setVisible(false);
          continue;
        }
      }

      if (!l.bulbCore.visible) l.bulbCore.setVisible(true);
      if (!l.haloGlow.visible) l.haloGlow.setVisible(true);
      if (!l.groundPool.visible) l.groundPool.setVisible(true);

      const pulse = Math.sin(time * 0.0032 + l.phase) * 0.035;
      const occl = l.lampImg.alpha;

      l.bulbCore.setAlpha(Phaser.Math.Clamp((baseBulb + pulse) * occl, 0.15, 1.0));
      l.haloGlow.setAlpha(Phaser.Math.Clamp((baseHalo + pulse * 0.8) * Math.max(0.55, occl), 0.1, 1.0));
      l.groundPool.setAlpha(Phaser.Math.Clamp(basePool + pulse * 0.6, 0.08, 0.95));
    }
  }
}
