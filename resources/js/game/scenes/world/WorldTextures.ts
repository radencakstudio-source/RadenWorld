/**
 * ============================================================================
 * FILE: resources/js/game/scenes/world/WorldTextures.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Generator tekstur prosedural berbasis Canvas 2D untuk WorldScene:
 * 1. Tekstur Ubin Tembok Atas & Tembok Samping (wall-top-checker, wall-side-checker).
 * 2. Tekstur Ombak Air Samudra HD (water-wave-tile, 480x480).
 * 3. Tekstur Kaustik Cahaya Tropis & Riak Sekunder (water-wave-caustic, 480x480).
 * 4. Tekstur Buih Gulungan Ombak Pantai Horizontal (water-shoreline-surf, 480x80).
 * 5. Tekstur Buih Gulungan Ombak Pantai Vertikal (water-shoreline-surf-v, 80x480).
 * ============================================================================
 */

import Phaser from 'phaser';

export class WorldTextures {
  /**
   * Memastikan tekstur catur 2x2 untuk Tembok Atas dan Tembok Samping tersedia di runtime
   */
  public static ensureWallTextures(scene: Phaser.Scene): void {
    if (
      !scene.textures.exists('wall-top-checker') &&
      scene.textures.exists('tile-wall-dark') &&
      scene.textures.exists('tile-wall-light')
    ) {
      try {
        const darkImg = scene.textures.get('tile-wall-dark').getSourceImage() as HTMLImageElement;
        const lightImg = scene.textures.get('tile-wall-light').getSourceImage() as HTMLImageElement;
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx && darkImg && lightImg) {
          ctx.drawImage(darkImg, 0, 0, 120, 120);
          ctx.drawImage(lightImg, 120, 0, 120, 120);
          ctx.drawImage(lightImg, 0, 120, 120, 120);
          ctx.drawImage(darkImg, 120, 120, 120, 120);
          scene.textures.addCanvas('wall-top-checker', canvas);
        }
      } catch (e) {
        console.warn('[WorldTextures] Gagal membuat tekstur wall-top-checker:', e);
      }
    }

    if (
      !scene.textures.exists('wall-side-checker') &&
      scene.textures.exists('tile-wall-top-dark') &&
      scene.textures.exists('tile-wall-top-light')
    ) {
      try {
        const darkTopImg = scene.textures.get('tile-wall-top-dark').getSourceImage() as HTMLImageElement;
        const lightTopImg = scene.textures.get('tile-wall-top-light').getSourceImage() as HTMLImageElement;
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx && darkTopImg && lightTopImg) {
          ctx.drawImage(darkTopImg, 0, 0, 120, 120);
          ctx.drawImage(lightTopImg, 120, 0, 120, 120);
          ctx.drawImage(lightTopImg, 0, 120, 120, 120);
          ctx.drawImage(darkTopImg, 120, 120, 120, 120);
          scene.textures.addCanvas('wall-side-checker', canvas);
        }
      } catch (e) {
        console.warn('[WorldTextures] Gagal membuat tekstur wall-side-checker:', e);
      }
    }
  }

  /**
   * Menghasilkan tekstur gelombang ombak, kaustik, dan buih pantai secara dinamis
   */
  public static ensureWaterTextures(scene: Phaser.Scene): void {
    // 1. Tekstur Ombak Samudra HD (water-wave-tile - 480x480 Seamless)
    try {
      if (scene.textures.exists('water-wave-tile')) {
        scene.textures.remove('water-wave-tile');
      }
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

        waveList.forEach((w) => drawWave(w.cx, w.cy, w.w, w.h, w.a));
        scene.textures.addCanvas('water-wave-tile', canvas);
      }
    } catch (e) {
      console.warn('[WorldTextures] Gagal membuat water-wave-tile:', e);
    }

    // 2. Tekstur Kaustik Cahaya Tropis & Riak Sekunder (water-wave-caustic - 480x480 Seamless)
    try {
      if (scene.textures.exists('water-wave-caustic')) {
        scene.textures.remove('water-wave-caustic');
      }
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

        causticList.forEach((c) => drawCausticRing(c.cx, c.cy, c.rx, c.ry, c.a));
        scene.textures.addCanvas('water-wave-caustic', canvas);
      }
    } catch (e) {
      console.warn('[WorldTextures] Gagal membuat water-wave-caustic:', e);
    }

    // 3. Tekstur Buih Gulungan Ombak Pantai (water-shoreline-surf - 480x80)
    try {
      if (scene.textures.exists('water-shoreline-surf')) {
        scene.textures.remove('water-shoreline-surf');
      }
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

        scene.textures.addCanvas('water-shoreline-surf', canvas);
      }
    } catch (e) {
      console.warn('[WorldTextures] Gagal membuat water-shoreline-surf:', e);
    }

    // 4. Tekstur Buih Gulungan Ombak Vertikal Pantai Timur (water-shoreline-surf-v - 80x480)
    try {
      if (scene.textures.exists('water-shoreline-surf-v')) {
        scene.textures.remove('water-shoreline-surf-v');
      }
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 80, 480);

        // Lapisan basah pasir di sisi barat/kiri (wet sand backwash)
        ctx.fillStyle = 'rgba(140, 115, 62, 0.35)';
        ctx.fillRect(0, 0, 24, 480);

        // Buih ombak putih tebal berbusa mengarah ke sisi timur/kanan (foaming shore surf)
        for (let y = 0; y < 480; y += 32) {
          ctx.beginPath();
          ctx.arc(26, y + 16, 20, -Math.PI / 2, Math.PI / 2, false);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(28, y + 16, 14, -Math.PI / 2, Math.PI / 2, false);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
          ctx.fill();

          // Gelembung buih kecil
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(18, y + 8, 3, 0, Math.PI * 2);
          ctx.arc(16, y + 22, 2.5, 0, Math.PI * 2);
          ctx.arc(12, y + 14, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Garis batas buih renda tajam vertikal (lacy foam crest)
        ctx.beginPath();
        for (let y = 0; y <= 480; y += 16) {
          const x = 30 + Math.sin(y * 0.12) * 5;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        scene.textures.addCanvas('water-shoreline-surf-v', canvas);
      }
    } catch (e) {
      console.warn('[WorldTextures] Gagal membuat water-shoreline-surf-v:', e);
    }
  }

  /**
   * Memastikan tekstur paving trotoar Alun-Alun tersedia di runtime
   */
  public static ensureAlunAlunTextures(scene: Phaser.Scene): void {
    if (!scene.textures.exists('alunalun-checker-tile')) {
      try {
        if (scene.textures.exists('tile-trotoar-alunalun')) {
          const img = scene.textures.get('tile-trotoar-alunalun').getSourceImage() as HTMLImageElement;
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          if (ctx && img) {
            ctx.drawImage(img, 0, 0, 120, 120);
            ctx.drawImage(img, 120, 0, 120, 120);
            ctx.drawImage(img, 0, 120, 120, 120);
            ctx.drawImage(img, 120, 120, 120, 120);
            scene.textures.addCanvas('alunalun-checker-tile', canvas);
          }
        }
      } catch (e) {
        console.warn('[WorldTextures] Gagal membuat alunalun-checker-tile:', e);
      }
    }
  }

  /**
   * Memastikan tekstur paving trotoar 2 tersedia sebagai canvas 2x2 (240x240) untuk TileSprite
   */
  public static ensureTrotoar2Textures(scene: Phaser.Scene): void {
    if (!scene.textures.exists('trotoar2-checker-tile')) {
      try {
        if (scene.textures.exists('trotoar-2')) {
          const img = scene.textures.get('trotoar-2').getSourceImage() as HTMLImageElement;
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          if (ctx && img) {
            ctx.drawImage(img, 0, 0, 120, 120);
            ctx.drawImage(img, 120, 0, 120, 120);
            ctx.drawImage(img, 0, 120, 120, 120);
            ctx.drawImage(img, 120, 120, 120, 120);
            scene.textures.addCanvas('trotoar2-checker-tile', canvas);
          }
        }
      } catch (e) {
        console.warn('[WorldTextures] Gagal membuat trotoar2-checker-tile:', e);
      }
    }
  }
}


