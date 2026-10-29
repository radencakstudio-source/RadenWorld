/**
 * ============================================================================
 * FILE: resources/js/game/scenes/world/WorldTerrain.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Modul pembuat dan pengatur lingkungan alam (Terrain & Environment) Open World:
 * 1. Buffer Samudra & Dasar Grid Rumput Hijau (world-checker-tile).
 * 2. Tembok Pembatas Dunia Menyeluruh (Utara, Barat, Timur) & Batas Fisika (Colliders).
 * 3. Lautan Bahari Timur (#00A2F3) dengan Efek Ombak HD & Kaustik Kristal.
 * 4. Hamparan Pasir Pantai Keemasan Selatan, Teluk Pasir Tengah & Buih Ombak Berbusa.
 * 5. Jaringan Jalan Raya Aspal & 8 Persimpangan 2x2 Sesuai Blueprint Peta.
 * 6. Jalur Trotoar 1, Trotoar Edge Berotasi Presisi, Trotoar 2, & 3 Dermaga Laut.
 * 7. Rintangan Fisik Alami Perairan Laut Dalam (Marine Obstacles).
 * 8. Awan Terapung Organik (18 Variasi Awan HD) & Logika Pergerakan Awan 60 FPS.
 * ============================================================================
 */

import Phaser from 'phaser';

export interface IWorldShorelineSurf {
  sprite: Phaser.GameObjects.TileSprite;
  baseY?: number;
  baseX?: number;
  isVertical: boolean;
}

export interface IWorldCloud {
  sprite: Phaser.GameObjects.Image;
  speedX: number;
  speedY: number;
}

export interface IWorldTerrainElements {
  waterWaves1: Phaser.GameObjects.TileSprite[];
  waterWaves2: Phaser.GameObjects.TileSprite[];
  shorelineSurfs: IWorldShorelineSurf[];
  clouds: IWorldCloud[];
  digTiles: Phaser.GameObjects.Image[];
}

export class WorldTerrain {
  /**
   * Menggambar seluruh elemen permukaan tanah, tembok, jalan, trotoar, lautan, pantai, dan awan.
   */
  public static createWorldTerrain(
    scene: Phaser.Scene,
    worldWidth: number,
    worldHeight: number,
    tileSize: number,
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    addGridObstacleFn: (gx: number, gy: number, gw: number, gh: number) => Phaser.GameObjects.Zone
  ): IWorldTerrainElements {
    const ts = tileSize; // 120px
    const buf = 2400;

    // 0. BUFFER LAUT & PENYANGGA DI LUAR GRID DUNIA (Mencegah layar hitam kosong saat kamera fokus di pojok)
    scene.add.tileSprite(
      worldWidth / 2,
      worldHeight / 2,
      worldWidth + buf * 2,
      worldHeight + buf * 2,
      'water-checker-tile'
    ).setDepth(-110);

    // 1. DASAR DUNIA: RUMPUT HIJAU SEGAR (world-checker-tile)
    scene.add.tileSprite(
      -buf,
      -buf,
      worldWidth + buf * 2,
      worldHeight + buf * 2,
      'world-checker-tile'
    ).setOrigin(0, 0).setDepth(-100);

    // ------------------------------------------------------------------------
    // TEMBOK PEMBATAS DUNIA MENYELURUH SAMPAI KE UJUNG LUAR (OUTER BOUNDS)
    // ------------------------------------------------------------------------
    // a. Tembok Atas Utara: Memenuhi seluruh area Utara dari luar map (y: -buf s/d ts)
    if (scene.textures.exists('wall-top-checker')) {
      scene.add.tileSprite(
        -buf,
        -buf,
        worldWidth + buf * 2,
        buf + ts,
        'wall-top-checker'
      ).setOrigin(0, 0).setDepth(10);
    } else {
      for (let gy = -20; gy <= 0; gy++) {
        for (let gx = -20; gx < 80 + 20; gx++) {
          const isDark = (gx + gy) % 2 === 0;
          const key = isDark ? 'tile-wall-dark' : 'tile-wall-light';
          scene.add.image(gx * ts, gy * ts, key).setOrigin(0, 0).setDepth(10);
        }
      }
    }

    // b. Tembok Samping Barat: Memenuhi area Barat luar map (x: -buf s/d ts)
    // Dibuat terbuka pada koridor jalan (gy: 11..16 dan gy: 64..69).
    if (scene.textures.exists('wall-side-checker')) {
      // Seksi 1: Atas Koridor 1 (gy: 1..10)
      scene.add.tileSprite(-buf, ts, buf + ts, 10 * ts, 'wall-side-checker')
        .setOrigin(0, 0).setDepth(10);
      // Seksi 2: Antara Koridor 1 dan Koridor 2 (gy: 17..63)
      scene.add.tileSprite(-buf, 17 * ts, buf + ts, 47 * ts, 'wall-side-checker')
        .setOrigin(0, 0).setDepth(10);
    } else {
      for (let gy = 1; gy <= 63; gy++) {
        if (gy >= 11 && gy <= 16) continue;
        for (let gx = -20; gx <= 0; gx++) {
          const isDark = (gx + gy) % 2 === 0;
          const key = isDark ? 'tile-wall-top-dark' : 'tile-wall-top-light';
          scene.add.image(gx * ts, gy * ts, key).setOrigin(0, 0).setDepth(10);
        }
      }
    }

    // c. Tembok Samping Timur: Memenuhi area Timur Laut luar map (x: 80 s/d 80 + buf) pada gy: 1..10
    // Menggunakan Wall With Top (wall-side-checker) agar tidak berupa tanah hijau polos
    if (scene.textures.exists('wall-side-checker')) {
      scene.add.tileSprite(worldWidth, ts, buf, 10 * ts, 'wall-side-checker')
        .setOrigin(0, 0).setDepth(10);
    } else {
      for (let gy = 1; gy <= 10; gy++) {
        for (let gx = 80; gx < 80 + 20; gx++) {
          const isDark = (gx + gy) % 2 === 0;
          const key = isDark ? 'tile-wall-top-dark' : 'tile-wall-top-light';
          scene.add.image(gx * ts, gy * ts, key).setOrigin(0, 0).setDepth(10);
        }
      }
    }

    // Tambahkan Rintangan Fisik Statis (Collider) di Sepanjang Tembok & Batas Wilayah
    if (obstacles) {
      // Dinding Utara Tebal (Dari -buf sampai ts = 120px)
      const topWallZone = scene.add.zone(worldWidth / 2, (ts - buf) / 2, worldWidth + buf * 2, buf + ts);
      scene.physics.add.existing(topWallZone, true);
      obstacles.add(topWallZone);

      // Dinding Barat Tebal (Seksi 1 & 2; Seksi 3 tidak ada karena gy >= 70 adalah pantai dan laut bebas)
      const leftWallZone1 = scene.add.zone((ts - buf) / 2, ts + (10 * ts) / 2, buf + ts, 10 * ts);
      scene.physics.add.existing(leftWallZone1, true);
      obstacles.add(leftWallZone1);

      const leftWallZone2 = scene.add.zone((ts - buf) / 2, 17 * ts + (47 * ts) / 2, buf + ts, 47 * ts);
      scene.physics.add.existing(leftWallZone2, true);
      obstacles.add(leftWallZone2);

      // Dinding Timur Tebal (Tepat di x = worldWidth / x80, membentang ke luar buffer agar pas 100% di garis batas x80)
      const rightWallZone1 = scene.add.zone(worldWidth + buf / 2, ts + (10 * ts) / 2, buf, 10 * ts);
      scene.physics.add.existing(rightWallZone1, true);
      obstacles.add(rightWallZone1);

      const rightWallZone2 = scene.add.zone(worldWidth + buf / 2, 17 * ts + (47 * ts) / 2, buf, 47 * ts);
      scene.physics.add.existing(rightWallZone2, true);
      obstacles.add(rightWallZone2);

      const rightWallZone3 = scene.add.zone(worldWidth + buf / 2, 70 * ts + (10 * ts) / 2, buf, 10 * ts);
      scene.physics.add.existing(rightWallZone3, true);
      obstacles.add(rightWallZone3);

      // Pembatas Tepi Samping Koridor Jalan di Laut Timur
      const eastEdge1Top = scene.add.zone(worldWidth + buf / 2, 11 * ts - 20, buf, 40);
      scene.physics.add.existing(eastEdge1Top, true);
      obstacles.add(eastEdge1Top);

      const eastEdge1Btm = scene.add.zone(worldWidth + buf / 2, 17 * ts + 20, buf, 40);
      scene.physics.add.existing(eastEdge1Btm, true);
      obstacles.add(eastEdge1Btm);

      const eastStop1 = scene.add.zone(worldWidth + ts + 24, 14 * ts, 48, 6 * ts);
      scene.physics.add.existing(eastStop1, true);
      obstacles.add(eastStop1);

      const eastEdge2Top = scene.add.zone(worldWidth + buf / 2, 64 * ts - 20, buf, 40);
      scene.physics.add.existing(eastEdge2Top, true);
      obstacles.add(eastEdge2Top);

      const eastEdge2Btm = scene.add.zone(worldWidth + buf / 2, 70 * ts + 20, buf, 40);
      scene.physics.add.existing(eastEdge2Btm, true);
      obstacles.add(eastEdge2Btm);

      const eastStop2 = scene.add.zone(worldWidth + ts + 24, 67 * ts, 48, 6 * ts);
      scene.physics.add.existing(eastStop2, true);
      obstacles.add(eastStop2);

      // Pembatas Ujung Koridor Jalan di Barat Luar
      const westStop1 = scene.add.zone(-2 * ts - 24, 14 * ts, 48, 6 * ts);
      scene.physics.add.existing(westStop1, true);
      obstacles.add(westStop1);

      const westStop2 = scene.add.zone(-2 * ts - 24, 67 * ts, 48, 6 * ts);
      scene.physics.add.existing(westStop2, true);
      obstacles.add(westStop2);

      // Pembatas Ujung Barat Pantai Selatan
      const westBeachStop = scene.add.zone(-2 * ts - 24, 74.5 * ts, 48, 9 * ts);
      scene.physics.add.existing(westBeachStop, true);
      obstacles.add(westBeachStop);

      // Pembatas Tepi Samudra Selatan
      const southOceanZone = scene.add.zone(
        worldWidth / 2,
        79 * ts + 60,
        worldWidth + buf * 2,
        120
      );
      scene.physics.add.existing(southOceanZone, true);
      obstacles.add(southOceanZone);
    }

    // ------------------------------------------------------------------------
    // 2. TIMUR BAHARI & SAMUDRA SELATAN: LAUTAN ASLI DENGAN EFEK OMBAK BERKILAU HD
    // ------------------------------------------------------------------------
    const waterWaves1: Phaser.GameObjects.TileSprite[] = [];
    const waterWaves2: Phaser.GameObjects.TileSprite[] = [];
    const shorelineSurfs: IWorldShorelineSurf[] = [];

    const addWaterArea = (x: number, y: number, w: number, h: number) => {
      // Dasar Warna Biru Laut Asli Blueprint (#00A2F3)
      scene.add.tileSprite(
        x + w / 2,
        y + h / 2,
        w,
        h,
        'water-checker-tile'
      ).setDepth(-98);

      // Lapisan Riak Ombak 1: Gelombang mengalir horizontal berirama HD
      if (scene.textures.exists('water-wave-tile')) {
        const wave1 = scene.add.tileSprite(
          x + w / 2,
          y + h / 2,
          w,
          h,
          'water-wave-tile'
        )
          .setDepth(-97)
          .setAlpha(0.72);
        waterWaves1.push(wave1);
      }

      // Lapisan Riak Ombak 2: Gelombang kaustik cahaya kristal pelengkap kontra-arah HD
      if (scene.textures.exists('water-wave-caustic')) {
        const wave2 = scene.add.tileSprite(
          x + w / 2,
          y + h / 2,
          w,
          h,
          'water-wave-caustic'
        )
          .setDepth(-96)
          .setAlpha(0.52)
          .setScale(1.15, 1.15);
        waterWaves2.push(wave2);
      }
    };

    // Lautan Kristal Timur (gx: 63..79, gy: 17..63)
    addWaterArea(63 * ts, 17 * ts, 17 * ts, 47 * ts);

    // Samudra Bebas Luar Timur (Hanya membentang dari Koridor 1 gy: 11 ke bawah, bukan di kanan atas)
    addWaterArea(worldWidth, 11 * ts, buf, (worldHeight + buf) - 11 * ts);

    // ------------------------------------------------------------------------
    // 3. SELATAN PANTAI: PANTAI PASIR KEEMASAN
    // ------------------------------------------------------------------------
    // Teluk Pantai Tengah (gx: 23..56, gy: 64..69)
    const coveX = 23 * ts;
    const coveY = 64 * ts;
    const coveW = 34 * ts;
    const coveH = 6 * ts;
    const coveSprite = scene.add.tileSprite(
      coveX,
      coveY,
      coveW,
      coveH,
      'beach-checker-tile'
    ).setOrigin(0, 0).setDepth(-98);
    coveSprite.tilePositionX = 120;
    coveSprite.tilePositionY = 0;

    // Hamparan Pantai Selatan Utama (gy: 70..78)
    const mainBeachX = -buf;
    const mainBeachY = 70 * ts;
    const mainBeachW = buf + 79 * ts;
    const mainBeachH = 9 * ts;
    scene.add.tileSprite(
      mainBeachX,
      mainBeachY,
      mainBeachW,
      mainBeachH,
      'beach-checker-tile'
    ).setOrigin(0, 0).setDepth(-98);

    // Air Laut di Sisi Kanan Pantai Selatan (gx: 79 di gy: 70..78)
    addWaterArea(79 * ts, 70 * ts, ts, 9 * ts);

    // Samudra Selatan Paling Bawah (gy: 79) membentang penuh dari barat (-buf) ke timur (worldWidth + buf)
    addWaterArea(-buf, 79 * ts, worldWidth + buf * 2, ts);

    // Samudra Bebas Luar Selatan (Buffer Samudra Selatan tak bertepi dari barat ke timur)
    addWaterArea(-buf, worldHeight, worldWidth + buf * 2, buf);

    // Gulungan Buih Ombak Pasir Pantai Selatan & Pantai Timur
    // a. Ombak Horizontal Pantai Selatan (gy: 79)
    if (scene.textures.exists('water-shoreline-surf')) {
      const surfSouthW = buf + 79 * ts + 15;
      const surfSouth = scene.add.tileSprite(
        -buf + surfSouthW / 2,
        79 * ts + 15,
        surfSouthW,
        60,
        'water-shoreline-surf'
      ).setDepth(-94);
      shorelineSurfs.push({ sprite: surfSouth, baseY: 79 * ts + 15, isVertical: false });
    }

    // b. Ombak Vertikal Pantai Timur (gx: 79, gy: 70..79)
    if (scene.textures.exists('water-shoreline-surf-v')) {
      const surfEastH = 9 * ts + 15;
      const surfEast = scene.add.tileSprite(
        79 * ts + 15,
        70 * ts + surfEastH / 2,
        60,
        surfEastH,
        'water-shoreline-surf-v'
      ).setDepth(-94);
      shorelineSurfs.push({ sprite: surfEast, baseX: 79 * ts + 15, isVertical: true });
    }

    // ------------------------------------------------------------------------
    // 4. JALAN RAYA ASPAL (ROAD NETWORK 100% SESUAI BLUEPRINT)
    // ------------------------------------------------------------------------
    // a. Jalan Horizontal Barat Laut (gy: 13..14, gx: -20..18)
    for (let gx = -20; gx <= 18; gx++) {
      scene.add.image(gx * ts, 13 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // b. Jalan Horizontal Timur Laut (gy: 13..14, gx: 61..100)
    for (let gx = 61; gx <= 100; gx++) {
      scene.add.image(gx * ts, 13 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // c. Jalan Horizontal Utara Central Plaza (gy: 19..20, gx: 21..58)
    for (let gx = 21; gx <= 58; gx++) {
      scene.add.image(gx * ts, 19 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // d. Jalan Horizontal Selatan Central Plaza (gy: 60..61, gx: 21..58)
    for (let gx = 21; gx <= 58; gx++) {
      scene.add.image(gx * ts, 60 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // e. Jalan Horizontal Barat Daya (gy: 66..67, gx: -20..18)
    for (let gx = -20; gx <= 18; gx++) {
      scene.add.image(gx * ts, 66 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }
    // f. Jalan Horizontal Tenggara (gy: 66..67, gx: 61..100)
    for (let gx = 61; gx <= 100; gx++) {
      scene.add.image(gx * ts, 66 * ts, 'road-horizontal').setOrigin(0, 0).setDepth(-95);
    }

    // g. Jalan Vertikal Barat (gx: 19..20, gy: 15..18, 21..59, 62..65)
    for (let gy = 15; gy <= 18; gy++) scene.add.image(19 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 21; gy <= 59; gy++) scene.add.image(19 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 62; gy <= 65; gy++) scene.add.image(19 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);

    // h. Jalan Vertikal Timur (gx: 59..60, gy: 15..18, 21..59, 62..65)
    for (let gy = 15; gy <= 18; gy++) scene.add.image(59 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 21; gy <= 59; gy++) scene.add.image(59 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);
    for (let gy = 62; gy <= 65; gy++) scene.add.image(59 * ts, gy * ts, 'road-vertical').setOrigin(0, 0).setDepth(-95);

    // i. 8 Persimpangan Jalan (2x2 JalanTengah, 240x240 px)
    const intersections = [
      { gx: 19, gy: 13 }, { gx: 59, gy: 13 },
      { gx: 19, gy: 19 }, { gx: 59, gy: 19 },
      { gx: 19, gy: 60 }, { gx: 59, gy: 60 },
      { gx: 19, gy: 66 }, { gx: 59, gy: 66 },
    ];
    intersections.forEach(ix => {
      scene.add.image(ix.gx * ts, ix.gy * ts, 'road-intersection').setOrigin(0, 0).setDepth(-95);
    });

    // ------------------------------------------------------------------------
    // 5. TROTOAR 1, TROTOAR EDGE & TROTOAR 2 (100% SESUAI BLUEPRINT)
    // ------------------------------------------------------------------------
    const addTrotoarH = (gx: number, gy: number) => {
      scene.add.image(gx * ts, gy * ts, 'trotoar-horizontal').setOrigin(0, 0).setDepth(-94);
    };
    const addTrotoarV = (gx: number, gy: number) => {
      scene.add.image(gx * ts, gy * ts, 'trotoar-vertical').setOrigin(0, 0).setDepth(-94);
    };
    const addTrotoar2 = (gx: number, gy: number) => {
      scene.add.image(gx * ts, gy * ts, 'trotoar-2').setOrigin(0, 0).setDepth(-94);
    };
    const addTrotoarEdge = (gx: number, gy: number, angleDeg: number) => {
      scene.add.image(gx * ts + ts / 2, gy * ts + ts / 2, 'trotoar-edge')
        .setOrigin(0.5, 0.5)
        .setAngle(angleDeg)
        .setDepth(-94);
    };

    // A. Barat Laut (NW Sidewalks):
    for (let gx = -20; gx <= 20; gx++) addTrotoarH(gx, 12);
    addTrotoarEdge(21, 12, 0);
    for (let gx = -20; gx <= 22; gx++) addTrotoar2(gx, 11);

    for (let gx = -20; gx <= 17; gx++) addTrotoarH(gx, 15);
    addTrotoarEdge(18, 15, 0);
    for (let gx = -20; gx <= 17; gx++) addTrotoar2(gx, 16);
    addTrotoar2(17, 16);

    for (let gy = 16; gy <= 64; gy++) addTrotoarV(18, gy);
    for (let gy = 16; gy <= 65; gy++) addTrotoar2(17, gy);

    for (let gy = 13; gy <= 17; gy++) addTrotoarV(21, gy);
    addTrotoarEdge(21, 18, 180);
    for (let gy = 12; gy <= 17; gy++) addTrotoar2(22, gy);

    // B. Timur Laut (NE Sidewalks):
    for (let gx = 59; gx <= 100; gx++) addTrotoarH(gx, 12);
    addTrotoarEdge(58, 12, 270);
    for (let gx = 57; gx <= 100; gx++) addTrotoar2(gx, 11);

    for (let gx = 62; gx <= 100; gx++) addTrotoarH(gx, 15);
    addTrotoarEdge(61, 15, 270);
    for (let gx = 62; gx <= 100; gx++) addTrotoar2(gx, 16);

    for (let gy = 13; gy <= 17; gy++) addTrotoarV(58, gy);
    addTrotoarEdge(58, 18, 90);
    for (let gy = 12; gy <= 17; gy++) addTrotoar2(57, gy);

    // C. Utara Central Plaza (gy: 17..18):
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 18);
    for (let gx = 22; gx <= 57; gx++) addTrotoar2(gx, 17);

    // D. Keliling Bagian Dalam Central Plaza (1 Petak Trotoar 1 + Sudut Edge):
    addTrotoarEdge(21, 21, 270);
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 21);
    addTrotoarEdge(58, 21, 0);

    for (let gy = 22; gy <= 58; gy++) addTrotoarV(21, gy);
    for (let gy = 22; gy <= 58; gy++) addTrotoarV(58, gy);

    addTrotoarEdge(21, 59, 180);
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 59);
    addTrotoarEdge(58, 59, 90);

    // ========================================================================
    // ALUN-ALUN PUSAT KOTA (gx: 22..57, gy: 22..58)
    // Hamparan Trotoar Alun-Alun (1X1 Trotoar Alunalun) menggantikan rumput hijau
    // ========================================================================
    const alunTexKey = scene.textures.exists('alunalun-checker-tile')
      ? 'alunalun-checker-tile'
      : (scene.textures.exists('tile-trotoar-alunalun')
        ? 'tile-trotoar-alunalun'
        : (scene.textures.exists('plaza-checker-tile') ? 'plaza-checker-tile' : 'trotoar-2'));

    scene.add.tileSprite(
      22 * ts,
      22 * ts,
      36 * ts,
      37 * ts,
      alunTexKey
    ).setOrigin(0, 0).setDepth(-96);

    // ========================================================================
    // HAMPARAN TROTOAR 2 UTARA (gx: 23..42, gy: 0..16)
    // Mengubah tanah rumput hijau menjadi trotoar 2
    // ========================================================================
    const trotoar2TexKey = scene.textures.exists('trotoar2-checker-tile')
      ? 'trotoar2-checker-tile'
      : (scene.textures.exists('trotoar-2') ? 'trotoar-2' : 'plaza-checker-tile');

    scene.add.tileSprite(
      23 * ts,
      0,
      20 * ts,
      17 * ts,
      trotoar2TexKey
    ).setOrigin(0, 0).setDepth(-96);

    // Hamparan Trotoar 2 Timur Utara (gx: 43..56, gy: 1..16)
    scene.add.tileSprite(
      43 * ts,
      1 * ts,
      14 * ts,
      16 * ts,
      trotoar2TexKey
    ).setOrigin(0, 0).setDepth(-96);

    // ========================================================================
    // KAWASAN LAHAN PERTANIAN / TANAH GALIAN (gx: 57..80, gy: 1..9)
    // Hamparan tanah cangkulan (tile-dig 1x1) untuk media bercocok tanam tanaman
    // ========================================================================
    const digTiles: Phaser.GameObjects.Image[] = [];
    for (let gy = 1; gy <= 9; gy++) {
      for (let gx = 57; gx <= 80; gx++) {
        const digImg = scene.add.image(gx * ts, gy * ts, 'tile-dig')
          .setOrigin(0, 0)
          .setDisplaySize(ts, ts)
          .setDepth(-96);
        digImg.setData('gridX', gx);
        digImg.setData('gridY', gy);
        digImg.setData('isDigTile', true);
        digImg.setData('hasCrop', false);
        digTiles.push(digImg);
      }
    }

    // E. Teluk Pantai Selatan (Cove gy: 62..68):
    for (let gx = 22; gx <= 57; gx++) addTrotoarH(gx, 62);
    for (let gx = 22; gx <= 57; gx++) addTrotoar2(gx, 63);
    addTrotoarEdge(21, 62, 270);
    addTrotoarEdge(58, 62, 0);

    for (let gy = 63; gy <= 67; gy++) addTrotoarV(21, gy);
    for (let gy = 64; gy <= 69; gy++) addTrotoar2(22, gy);
    addTrotoarEdge(21, 68, 90);

    for (let gy = 63; gy <= 67; gy++) addTrotoarV(58, gy);
    for (let gy = 64; gy <= 69; gy++) addTrotoar2(57, gy);
    addTrotoarEdge(58, 68, 180);

    // F. Barat Daya (SW Sidewalks gy: 64..69):
    for (let gx = -20; gx <= 17; gx++) addTrotoarH(gx, 65);
    addTrotoarEdge(18, 65, 90);
    for (let gx = -20; gx <= 17; gx++) addTrotoar2(gx, 64);
    addTrotoar2(17, 64);

    for (let gx = -20; gx <= 20; gx++) addTrotoarH(gx, 68);
    for (let gx = -20; gx <= 22; gx++) addTrotoar2(gx, 69);

    // G. Tenggara (SE Sidewalks gy: 64..69):
    for (let gx = 62; gx <= 100; gx++) addTrotoarH(gx, 65);
    addTrotoarEdge(61, 65, 180);
    for (let gx = 62; gx <= 100; gx++) addTrotoar2(gx, 64);

    for (let gx = 59; gx <= 100; gx++) addTrotoarH(gx, 68);
    for (let gx = 57; gx <= 100; gx++) addTrotoar2(gx, 69);

    // H. Promenade Laut Timur & 3 Dermaga Trotoar 2:
    for (let gy = 16; gy <= 64; gy++) addTrotoarV(61, gy);
    for (let gy = 16; gy <= 64; gy++) addTrotoar2(62, gy);

    // 3 Dermaga Trotoar 2 (gx: 63..73)
    for (let px = 63; px <= 73; px++) {
      addTrotoar2(px, 26);
      addTrotoar2(px, 27);
      addTrotoar2(px, 39);
      addTrotoar2(px, 40);
      addTrotoar2(px, 53);
      addTrotoar2(px, 54);
    }

    // ------------------------------------------------------------------------
    // KAWASAN KOMERSIAL BARAT: TANAH KHUSUS SEKITAR 6 FASILITAS UTAMA
    // 1. Cafe: tanah1 #9D5333, tanah2 #D49C7F (gx: 1..8, gy: 17..31)
    // 2. Perpustakaan: tanah1 #B1B1B1, tanah2 #FFFCF9 (gx: 9..16, gy: 17..31)
    // 3. Polisi: tanah1 #64799F, tanah2 #C2D7FA (gx: 1..8, gy: 32..47)
    // 4. Bank: tanah1 #9497AD, tanah2 #FFF1E9 (gx: 9..16, gy: 32..47)
    // 5. Apotek: tanah1 #359B4D, tanah2 #89FFA5 (gx: 1..8, gy: 48..63)
    // 6. Makelar: tanah1 #874B1E, tanah2 #FFD0AC (gx: 9..16, gy: 48..63)
    // ------------------------------------------------------------------------
    const commercialGround = scene.add.graphics().setDepth(-98);

    const drawCheckerZone = (
      minGx: number,
      maxGx: number,
      minGy: number,
      maxGy: number,
      c1: number,
      c2: number
    ) => {
      for (let gy = minGy; gy <= maxGy; gy++) {
        for (let gx = minGx; gx <= maxGx; gx++) {
          const isEven = (gx + gy) % 2 === 0;
          commercialGround.fillStyle(isEven ? c1 : c2, 1);
          commercialGround.fillRect(gx * ts, gy * ts, ts, ts);
        }
      }
    };

    // 1. Cafe & 2. Perpustakaan (Row 1: gy: 17..31)
    drawCheckerZone(1, 8, 17, 31, 0x9D5333, 0xD49C7F);
    drawCheckerZone(9, 16, 17, 31, 0xB1B1B1, 0xFFFCF9);

    // 3. Polisi & 4. Bank (Row 2: gy: 32..47)
    drawCheckerZone(1, 8, 32, 47, 0x64799F, 0xC2D7FA);
    drawCheckerZone(9, 16, 32, 47, 0x9497AD, 0xFFF1E9);

    // 5. Apotek & 6. Makelar (Row 3: gy: 48..63)
    drawCheckerZone(1, 8, 48, 63, 0x359B4D, 0x89FFA5);
    drawCheckerZone(9, 16, 48, 63, 0x874B1E, 0xFFD0AC);

    // ------------------------------------------------------------------------
    // 6. RINTANGAN PERAIRAN LAUT (Mencegah pemain tercebur ke laut dalam)
    // ------------------------------------------------------------------------
    addGridObstacleFn(63, 17, 17, 9);
    addGridObstacleFn(63, 28, 17, 11);
    addGridObstacleFn(63, 41, 17, 12);
    addGridObstacleFn(63, 55, 17, 9);
    addGridObstacleFn(74, 26, 6, 2);
    addGridObstacleFn(74, 39, 6, 2);
    addGridObstacleFn(74, 53, 6, 2);
    addGridObstacleFn(-2, 79, 83, 1);
    addGridObstacleFn(79, 70, 1, 9);

    // ------------------------------------------------------------------------
    // 7. EFEK BAYANGAN AWAN ORGANIK & BERVARIASI (18 Awan HD)
    // ------------------------------------------------------------------------
    const clouds: IWorldCloud[] = [];
    const cloudKeys = [
      'cloud-cumulus-1', 'cloud-cumulus-2', 'cloud-cumulus-3', 'cloud-cumulus-4',
      'cloud-stratus-5', 'cloud-split-6', 'cloud-fragment-7', 'cloud-dense-8'
    ];
    const totalClouds = 18;

    for (let i = 0; i < totalClouds; i++) {
      const key = cloudKeys[Phaser.Math.Between(0, cloudKeys.length - 1)];
      if (!scene.textures.exists(key)) continue;

      const startX = Phaser.Math.Between(0, worldWidth);
      const startY = Phaser.Math.Between(0, worldHeight);
      const scaleX = Phaser.Math.FloatBetween(1.1, 2.7);
      const scaleY = Phaser.Math.FloatBetween(0.8, 2.2);
      const alpha = Phaser.Math.FloatBetween(0.48, 0.68);
      const angle = Phaser.Math.Between(-30, 30);
      const flipX = Math.random() > 0.5;
      const flipY = Math.random() > 0.5;
      const speedX = Phaser.Math.FloatBetween(22, 42);
      const speedY = Phaser.Math.FloatBetween(7, 18);

      const cloudImg = scene.add.image(startX, startY, key)
        .setScale(scaleX, scaleY)
        .setAngle(angle)
        .setFlip(flipX, flipY)
        .setAlpha(0.24)
        .setBlendMode(Phaser.BlendModes.MULTIPLY)
        .setDepth(99999); // Di atas karakter & bangunan (Single WebGL Batch)

      clouds.push({
        sprite: cloudImg,
        speedX,
        speedY,
      });
    }

    return {
      waterWaves1,
      waterWaves2,
      shorelineSurfs,
      clouds,
      digTiles,
    };
  }

  /**
   * Menggerakkan animasi gelombang air laut, riak kaustik, buih pantai, dan pergerakan awan di loop update
   */
  public static updateWorldTerrain(
    time: number,
    delta: number,
    waterWaves1: Phaser.GameObjects.TileSprite[],
    waterWaves2: Phaser.GameObjects.TileSprite[],
    shorelineSurfs: IWorldShorelineSurf[],
    clouds: IWorldCloud[],
    worldWidth: number,
    worldHeight: number,
    textures: Phaser.Textures.TextureManager
  ): void {
    const t = time * 0.001;

    // Animasi Riak & Ombak Air Laut Mengalir HD (Ringan & Cepat Tanpa Thrashing Texture Matrix)
    waterWaves1.forEach((w) => {
      w.tilePositionX += delta * 0.026;
    });

    waterWaves2.forEach((w) => {
      w.tilePositionX -= delta * 0.016;
    });

    // Animasi Gulungan Buih Ombak Pasir Pantai Selatan & Timur
    shorelineSurfs.forEach((s) => {
      if (s.isVertical) {
        s.sprite.tilePositionY += delta * 0.032;
        s.sprite.x = (s.baseX ?? s.sprite.x) + Math.sin(t * 1.5) * 8;
        s.sprite.alpha = 0.82 + Math.sin(t * 1.5) * 0.18;
      } else {
        s.sprite.tilePositionX += delta * 0.032;
        s.sprite.y = (s.baseY ?? s.sprite.y) + Math.sin(t * 1.5) * 8;
        s.sprite.alpha = 0.82 + Math.sin(t * 1.5) * 0.18;
      }
    });

    // Gerakkan awan terapung acak secara independen (Organic Floating Clouds)
    const dt = delta / 1000;
    const allCloudKeys = [
      'cloud-cumulus-1', 'cloud-cumulus-2', 'cloud-cumulus-3', 'cloud-cumulus-4',
      'cloud-stratus-5', 'cloud-split-6', 'cloud-fragment-7', 'cloud-dense-8'
    ];

    for (const c of clouds) {
      c.sprite.x += c.speedX * dt;
      c.sprite.y += c.speedY * dt;

      if (c.sprite.x > worldWidth + 600) {
        c.sprite.x = -600;
        c.sprite.y = Phaser.Math.Between(-200, worldHeight);
        const newKey = allCloudKeys[Phaser.Math.Between(0, allCloudKeys.length - 1)];
        if (textures.exists(newKey)) c.sprite.setTexture(newKey);
        c.sprite.setScale(Phaser.Math.FloatBetween(1.1, 2.7), Phaser.Math.FloatBetween(0.8, 2.2));
        c.sprite.setAngle(Phaser.Math.Between(-30, 30));
        c.sprite.setFlip(Math.random() > 0.5, Math.random() > 0.5);
        c.speedX = Phaser.Math.FloatBetween(22, 42);
        c.speedY = Phaser.Math.FloatBetween(7, 18);
      }
      if (c.sprite.y > worldHeight + 600) {
        c.sprite.y = -600;
        c.sprite.x = Phaser.Math.Between(-200, worldWidth);
        const newKey = allCloudKeys[Phaser.Math.Between(0, allCloudKeys.length - 1)];
        if (textures.exists(newKey)) c.sprite.setTexture(newKey);
        c.sprite.setScale(Phaser.Math.FloatBetween(1.1, 2.7), Phaser.Math.FloatBetween(0.8, 2.2));
        c.sprite.setAngle(Phaser.Math.Between(-30, 30));
        c.sprite.setFlip(Math.random() > 0.5, Math.random() > 0.5);
        c.speedX = Phaser.Math.FloatBetween(22, 42);
        c.speedY = Phaser.Math.FloatBetween(7, 18);
      }
    }
  }
}
