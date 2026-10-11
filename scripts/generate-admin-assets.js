/**
 * scripts/generate-admin-assets.js
 * Generator Aset Visual PNG Resolusi Tinggi untuk Ruang Kendali Super Admin RadenWorld
 * Output: public/assets/maps/Admin/Assets/
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const OUTPUT_DIR = path.resolve('public/assets/maps/Admin/Assets');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================================================
// CANVAS & PNG ENCODER MURNI TANPA DEPENDENSI EKSTERNAL
// ============================================================================
class MiniCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = Buffer.alloc(width * height * 4, 0); // RGBA
  }

  setPixel(x, y, r, g, b, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height || a <= 0) return;
    const idx = (y * this.width + x) * 4;

    if (a >= 255) {
      this.buffer[idx] = r;
      this.buffer[idx + 1] = g;
      this.buffer[idx + 2] = b;
      this.buffer[idx + 3] = 255;
      return;
    }

    // Alpha blending (Source Over)
    const srcA = a / 255;
    const dstA = this.buffer[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA <= 0) return;

    this.buffer[idx] = Math.round((r * srcA + this.buffer[idx] * dstA * (1 - srcA)) / outA);
    this.buffer[idx + 1] = Math.round((g * srcA + this.buffer[idx + 1] * dstA * (1 - srcA)) / outA);
    this.buffer[idx + 2] = Math.round((b * srcA + this.buffer[idx + 2] * dstA * (1 - srcA)) / outA);
    this.buffer[idx + 3] = Math.round(outA * 255);
  }

  getPixel(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return [0, 0, 0, 0];
    const idx = (y * this.width + x) * 4;
    return [this.buffer[idx], this.buffer[idx + 1], this.buffer[idx + 2], this.buffer[idx + 3]];
  }

  fillRect(rx, ry, rw, rh, [r, g, b, a = 255]) {
    const minX = Math.max(0, Math.floor(rx));
    const maxX = Math.min(this.width, Math.ceil(rx + rw));
    const minY = Math.max(0, Math.floor(ry));
    const maxY = Math.min(this.height, Math.ceil(ry + rh));
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        this.setPixel(x, y, r, g, b, a);
      }
    }
  }

  strokeRect(rx, ry, rw, rh, color, lineWidth = 1) {
    this.fillRect(rx, ry, rw, lineWidth, color);
    this.fillRect(rx, ry + rh - lineWidth, rw, lineWidth, color);
    this.fillRect(rx, ry, lineWidth, rh, color);
    this.fillRect(rx + rw - lineWidth, ry, lineWidth, rh, color);
  }

  fillRoundRect(rx, ry, rw, rh, radius, [r, g, b, a = 255]) {
    const rad = Math.min(radius, rw / 2, rh / 2);
    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        let inside = true;
        if (x < rx + rad && y < ry + rad) {
          inside = Math.hypot(x - (rx + rad), y - (ry + rad)) <= rad;
        } else if (x > rx + rw - rad && y < ry + rad) {
          inside = Math.hypot(x - (rx + rw - rad), y - (ry + rad)) <= rad;
        } else if (x < rx + rad && y > ry + rh - rad) {
          inside = Math.hypot(x - (rx + rad), y - (ry + rh - rad)) <= rad;
        } else if (x > rx + rw - rad && y > ry + rh - rad) {
          inside = Math.hypot(x - (rx + rw - rad), y - (ry + rh - rad)) <= rad;
        }
        if (inside) this.setPixel(x, y, r, g, b, a);
      }
    }
  }

  strokeRoundRect(rx, ry, rw, rh, radius, color, lineWidth = 1) {
    const rad = Math.min(radius, rw / 2, rh / 2);
    for (let y = ry - lineWidth; y < ry + rh + lineWidth; y++) {
      for (let x = rx - lineWidth; x < rx + rw + lineWidth; x++) {
        let dist = 0;
        let isCorner = false;
        if (x < rx + rad && y < ry + rad) {
          dist = Math.hypot(x - (rx + rad), y - (ry + rad)) - rad;
          isCorner = true;
        } else if (x > rx + rw - rad && y < ry + rad) {
          dist = Math.hypot(x - (rx + rw - rad), y - (ry + rad)) - rad;
          isCorner = true;
        } else if (x < rx + rad && y > ry + rh - rad) {
          dist = Math.hypot(x - (rx + rad), y - (ry + rh - rad)) - rad;
          isCorner = true;
        } else if (x > rx + rw - rad && y > ry + rh - rad) {
          dist = Math.hypot(x - (rx + rw - rad), y - (ry + rh - rad)) - rad;
          isCorner = true;
        }
        if (isCorner) {
          if (Math.abs(dist) <= lineWidth / 2) {
            this.setPixel(x, y, color[0], color[1], color[2], color[3] || 255);
          }
        } else {
          if (
            (x >= rx && x <= rx + rw && (Math.abs(y - ry) <= lineWidth / 2 || Math.abs(y - (ry + rh)) <= lineWidth / 2)) ||
            (y >= ry && y <= ry + rh && (Math.abs(x - rx) <= lineWidth / 2 || Math.abs(x - (rx + rw)) <= lineWidth / 2))
          ) {
            this.setPixel(x, y, color[0], color[1], color[2], color[3] || 255);
          }
        }
      }
    }
  }

  fillCircle(cx, cy, radius, [r, g, b, a = 255]) {
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(this.width, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(this.height, Math.ceil(cy + radius));
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= radius) {
          this.setPixel(x, y, r, g, b, a);
        }
      }
    }
  }

  strokeCircle(cx, cy, radius, [r, g, b, a = 255], lineWidth = 1) {
    const minX = Math.max(0, Math.floor(cx - radius - lineWidth));
    const maxX = Math.min(this.width, Math.ceil(cx + radius + lineWidth));
    const minY = Math.max(0, Math.floor(cy - radius - lineWidth));
    const maxY = Math.min(this.height, Math.ceil(cy + radius + lineWidth));
    const half = lineWidth / 2;
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (Math.abs(d - radius) <= half) {
          this.setPixel(x, y, r, g, b, a);
        }
      }
    }
  }

  radialGlow(cx, cy, innerR, outerR, colorInner, colorOuter) {
    const minX = Math.max(0, Math.floor(cx - outerR));
    const maxX = Math.min(this.width, Math.ceil(cx + outerR));
    const minY = Math.max(0, Math.floor(cy - outerR));
    const maxY = Math.min(this.height, Math.ceil(cy + outerR));
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= outerR) {
          const t = Math.max(0, Math.min(1, (d - innerR) / (outerR - innerR)));
          const r = Math.round(colorInner[0] * (1 - t) + colorOuter[0] * t);
          const g = Math.round(colorInner[1] * (1 - t) + colorOuter[1] * t);
          const b = Math.round(colorInner[2] * (1 - t) + colorOuter[2] * t);
          const a = Math.round(colorInner[3] * (1 - t) + colorOuter[3] * t);
          this.setPixel(x, y, r, g, b, a);
        }
      }
    }
  }

  toPNG() {
    const rowSize = 1 + this.width * 4;
    const raw = Buffer.alloc(rowSize * this.height);
    for (let y = 0; y < this.height; y++) {
      const rowOffset = y * rowSize;
      raw[rowOffset] = 0; // Filter None
      this.buffer.copy(raw, rowOffset + 1, y * this.width * 4, (y + 1) * this.width * 4);
    }
    const compressed = zlib.deflateSync(raw, { level: 9 });

    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      crcTable[n] = c;
    }
    function crc32(buf) {
      let crc = 0 ^ (-1);
      for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
      return (crc ^ (-1)) >>> 0;
    }
    function chunk(type, data) {
      const typeBuf = Buffer.from(type, 'ascii');
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length, 0);
      const combined = Buffer.concat([typeBuf, data]);
      const crcBuf = Buffer.alloc(4);
      crcBuf.writeUInt32BE(crc32(combined), 0);
      return Buffer.concat([len, combined, crcBuf]);
    }

    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(this.width, 0);
    ihdrData.writeUInt32BE(this.height, 4);
    ihdrData[8] = 8;
    ihdrData[9] = 6;
    ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;

    return Buffer.concat([sig, chunk('IHDR', ihdrData), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
  }
}

console.log('⚡ Menghasilkan Aset-Aset Visual Ruang Kendali Super Admin RadenWorld...');

// ============================================================================
// 1. LANTAI ADMIN GELAP (1x1 Lantai Admin Gelap.png - 120x120 px)
// Obsidian-Blue Cyber Tile (#0037AE) dengan garis sirkuit neon cyan
// ============================================================================
{
  const c = new MiniCanvas(120, 120);
  // Base metalik biru gelap
  c.fillRect(0, 0, 120, 120, [0, 55, 174, 255]);
  // Border bevel
  c.strokeRect(0, 0, 120, 120, [0, 35, 120, 255], 3);
  c.strokeRect(3, 3, 114, 114, [0, 120, 255, 200], 1.5);

  // Sirkuit neon cyan (#00f0ff)
  // Grid dalam
  c.strokeRect(16, 16, 88, 88, [0, 240, 255, 60], 1);
  c.strokeRect(36, 36, 48, 48, [0, 240, 255, 100], 1);

  // Jalur sirkuit sudut
  c.fillRect(0, 16, 16, 2, [0, 240, 255, 180]);
  c.fillRect(16, 0, 2, 16, [0, 240, 255, 180]);
  c.fillRect(104, 0, 2, 16, [0, 240, 255, 180]);
  c.fillRect(104, 16, 16, 2, [0, 240, 255, 180]);
  c.fillRect(0, 104, 16, 2, [0, 240, 255, 180]);
  c.fillRect(16, 104, 2, 16, [0, 240, 255, 180]);
  c.fillRect(104, 104, 16, 2, [0, 240, 255, 180]);
  c.fillRect(104, 104, 2, 16, [0, 240, 255, 180]);

  // Microchip / Node emas di 4 sudut
  [16, 104].forEach(px => {
    [16, 104].forEach(py => {
      c.fillCircle(px, py, 4, [245, 158, 11, 255]);
      c.strokeCircle(px, py, 4, [254, 240, 138, 255], 1);
    });
  });

  // Logo intan cyber tengah
  c.fillCircle(60, 60, 8, [0, 240, 255, 220]);
  c.strokeCircle(60, 60, 14, [245, 158, 11, 150], 1.5);

  fs.writeFileSync(path.join(OUTPUT_DIR, '1x1 Lantai Admin Gelap.png'), c.toPNG());
  console.log('✓ 1x1 Lantai Admin Gelap.png dibuat');
}

// ============================================================================
// 2. LANTAI ADMIN TERANG (1x1 Lantai Admin Terang.png - 120x120 px)
// Magenta Orchid Cyber Tile (#FF00C8) dengan aksen laser pink & gold
// ============================================================================
{
  const c = new MiniCanvas(120, 120);
  // Base pink magenta neon
  c.fillRect(0, 0, 120, 120, [255, 0, 200, 255]);
  // Border bevel
  c.strokeRect(0, 0, 120, 120, [180, 0, 140, 255], 3);
  c.strokeRect(3, 3, 114, 114, [255, 150, 230, 220], 1.5);

  // Pola grid laser emas & putih
  c.strokeRect(18, 18, 84, 84, [254, 240, 138, 90], 1);
  c.strokeRect(38, 38, 44, 44, [255, 255, 255, 120], 1);

  // Jalur laser sudut
  c.fillRect(8, 60, 104, 1.5, [255, 255, 255, 70]);
  c.fillRect(60, 8, 1.5, 104, [255, 255, 255, 70]);

  // Sudut emas
  [12, 108].forEach(px => {
    [12, 108].forEach(py => {
      c.fillCircle(px, py, 3.5, [251, 191, 36, 255]);
      c.strokeCircle(px, py, 5, [255, 255, 255, 160], 1);
    });
  });

  // Emitor tengah
  c.fillCircle(60, 60, 9, [254, 240, 138, 240]);
  c.strokeCircle(60, 60, 16, [255, 255, 255, 180], 1.5);

  fs.writeFileSync(path.join(OUTPUT_DIR, '1x1 Lantai Admin Terang.png'), c.toPNG());
  console.log('✓ 1x1 Lantai Admin Terang.png dibuat');
}

// ============================================================================
// 3. KARPET EMAS KEKserverAISARAN (2x1 Karpet Emas.png - 240x120 px)
// Velvet Crimson & Gold Border
// ============================================================================
{
  const c = new MiniCanvas(240, 120);
  // Bayangan bawah karpet
  c.fillRect(6, 10, 228, 106, [10, 15, 29, 90]);

  // Alas beludru merah marun pekat
  c.fillRect(10, 6, 220, 108, [153, 27, 27, 255]);
  c.fillRect(18, 12, 204, 96, [185, 28, 28, 255]);

  // Border emas bordir ganda
  c.strokeRect(14, 8, 212, 104, [245, 158, 11, 255], 3);
  c.strokeRect(20, 14, 200, 92, [251, 191, 36, 200], 1.5);

  // Jalur ornamen runic tengah
  for (let x = 32; x < 210; x += 24) {
    c.fillCircle(x + 12, 60, 5, [254, 240, 138, 240]);
    c.strokeCircle(x + 12, 60, 8, [245, 158, 11, 180], 1);
    c.fillRect(x + 2, 59, 8, 2, [245, 158, 11, 140]);
    c.fillRect(x + 14, 59, 8, 2, [245, 158, 11, 140]);
  }

  // Tepi rumbai emas
  c.fillRect(10, 6, 4, 108, [251, 191, 36, 255]);
  c.fillRect(226, 6, 4, 108, [251, 191, 36, 255]);

  fs.writeFileSync(path.join(OUTPUT_DIR, '2x1 Karpet Emas.png'), c.toPNG());
  console.log('✓ 2x1 Karpet Emas.png dibuat');
}

// ============================================================================
// 4. TAHTA AGUNG PENCIPTA RADEN (3x3 Tahta Raden.png - 360x360 px)
// Dais 3-Tier Emas + Kursi Singgasana Megah + Mahkota Bercahaya Terapung
// ============================================================================
{
  const c = new MiniCanvas(360, 360);

  // 1. Bayangan dasar dais tahta
  c.radialGlow(180, 270, 80, 160, [10, 15, 29, 160], [10, 15, 29, 0]);

  // 2. Platform Dais Tingkat 1 (Paling Bawah) - Hexagonal Emas
  c.fillRoundRect(20, 230, 320, 110, 20, [120, 53, 15, 255]); // Basis kayu jati tua & perunggu
  c.fillRoundRect(24, 234, 312, 102, 18, [180, 83, 9, 255]);  // Emas hangat
  c.strokeRoundRect(20, 230, 320, 110, 20, [245, 158, 11, 255], 4);
  c.strokeRoundRect(26, 236, 308, 98, 16, [254, 240, 138, 220], 2);

  // Garis tangga runic
  c.fillRect(60, 280, 240, 4, [245, 158, 11, 200]);
  c.fillRect(90, 305, 180, 4, [251, 191, 36, 220]);

  // 3. Platform Dais Tingkat 2 (Tengah)
  c.fillRoundRect(50, 180, 260, 90, 16, [146, 64, 14, 255]);
  c.fillRoundRect(54, 184, 252, 82, 14, [217, 119, 6, 255]);
  c.strokeRoundRect(50, 180, 260, 90, 16, [251, 191, 36, 255], 3);

  // Karpet merah mini di anak tangga
  c.fillRect(130, 184, 100, 150, [185, 28, 28, 240]);
  c.strokeRect(130, 184, 100, 150, [254, 240, 138, 180], 2);

  // 4. Struktur Badan Kursi Singgasana (Throne Body)
  // Sandaran belakang emas megah
  c.fillRoundRect(80, 60, 200, 170, 24, [180, 83, 9, 255]);
  c.fillRoundRect(86, 66, 188, 158, 20, [245, 158, 11, 255]);
  c.strokeRoundRect(80, 60, 200, 170, 24, [254, 240, 138, 255], 4);

  // Bantalan punggung beludru merah ungu mewah (Tufted Velvet)
  c.fillRoundRect(106, 84, 148, 126, 16, [131, 24, 67, 255]);
  c.fillRoundRect(110, 88, 140, 118, 14, [157, 23, 77, 255]);
  c.strokeRoundRect(106, 84, 148, 126, 16, [245, 158, 11, 200], 2.5);

  // Pola intan kancing tahta (Diamond Tufting)
  for (let y = 106; y <= 186; y += 26) {
    for (let x = 126; x <= 234; x += 26) {
      c.fillCircle(x, y, 3, [254, 240, 138, 255]);
    }
  }

  // Lambang Raden "R" Emas di Sandaran Kepala
  c.fillCircle(180, 110, 18, [245, 158, 11, 255]);
  c.strokeCircle(180, 110, 18, [254, 240, 138, 255], 2.5);
  // Huruf R tebal
  c.fillRect(174, 98, 4, 24, [255, 255, 255, 255]);
  c.fillRoundRect(176, 98, 14, 13, 4, [255, 255, 255, 255]);
  c.fillRoundRect(178, 101, 8, 7, 2, [157, 23, 77, 255]);
  c.fillRect(182, 110, 6, 12, [255, 255, 255, 255]);

  // Sandaran Lengan Singgasana Emas (Armrests)
  // Kiri
  c.fillRoundRect(70, 150, 42, 64, 10, [217, 119, 6, 255]);
  c.fillCircle(91, 152, 12, [251, 191, 36, 255]);
  c.strokeRoundRect(70, 150, 42, 64, 10, [254, 240, 138, 255], 2);
  // Kanan
  c.fillRoundRect(248, 150, 42, 64, 10, [217, 119, 6, 255]);
  c.fillCircle(269, 152, 12, [251, 191, 36, 255]);
  c.strokeRoundRect(248, 150, 42, 64, 10, [254, 240, 138, 255], 2);

  // Bantalan duduk empuk
  c.fillRoundRect(106, 180, 148, 46, 10, [190, 24, 93, 255]);
  c.strokeRoundRect(106, 180, 148, 46, 10, [245, 158, 11, 240], 2);

  // 5. MAHKOTA EMAS TERAPUNG BERAURA (Floating Crown Above Throne)
  // Aura cahaya mahkota
  c.radialGlow(180, 36, 16, 52, [254, 240, 138, 160], [245, 158, 11, 0]);

  // Mahkota 5 Ujung
  const crownY = 32;
  c.fillRect(156, crownY + 14, 48, 8, [245, 158, 11, 255]);
  c.strokeRect(156, crownY + 14, 48, 8, [254, 240, 138, 255], 1.5);
  // Permata di dasar mahkota
  c.fillCircle(164, crownY + 18, 2.5, [0, 240, 255, 255]);
  c.fillCircle(180, crownY + 18, 3, [239, 68, 68, 255]);
  c.fillCircle(196, crownY + 18, 2.5, [0, 240, 255, 255]);

  // Ujung-ujung mahkota segitiga
  // Tengah (paling tinggi)
  c.fillCircle(180, crownY, 4, [254, 240, 138, 255]);
  for (let i = 0; i < 14; i++) {
    const w = 14 - i;
    c.fillRect(180 - w / 2, crownY + i, w, 1, [251, 191, 36, 255]);
  }
  // Kiri-Tengah
  c.fillCircle(168, crownY + 4, 3, [254, 240, 138, 255]);
  for (let i = 0; i < 10; i++) {
    const w = 10 - i;
    c.fillRect(168 - w / 2, crownY + 4 + i, w, 1, [245, 158, 11, 255]);
  }
  // Kanan-Tengah
  c.fillCircle(192, crownY + 4, 3, [254, 240, 138, 255]);
  for (let i = 0; i < 10; i++) {
    const w = 10 - i;
    c.fillRect(192 - w / 2, crownY + 4 + i, w, 1, [245, 158, 11, 255]);
  }
  // Kiri Ujung
  c.fillCircle(158, crownY + 8, 2.5, [254, 240, 138, 255]);
  for (let i = 0; i < 6; i++) {
    const w = 8 - i;
    c.fillRect(158 - w / 2, crownY + 8 + i, w, 1, [217, 119, 6, 255]);
  }
  // Kanan Ujung
  c.fillCircle(202, crownY + 8, 2.5, [254, 240, 138, 255]);
  for (let i = 0; i < 6; i++) {
    const w = 8 - i;
    c.fillRect(202 - w / 2, crownY + 8 + i, w, 1, [217, 119, 6, 255]);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, '3x3 Tahta Raden.png'), c.toPNG());
  console.log('✓ 3x3 Tahta Raden.png dibuat');
}

// ============================================================================
// 5. KONSOL BROADCAST SERVER (2x2 Konsol Broadcast.png - 240x240 px)
// Mainframe Siaran Suara & Hologram Equalizer Ungu-Cyan
// ============================================================================
{
  const c = new MiniCanvas(240, 240);
  // Bayangan meja
  c.radialGlow(120, 210, 60, 110, [10, 15, 29, 140], [10, 15, 29, 0]);

  // Meja kontrol sci-fi melengkung
  c.fillRoundRect(20, 140, 200, 80, 14, [30, 27, 75, 255]);
  c.fillRoundRect(24, 144, 192, 72, 12, [49, 46, 129, 255]);
  c.strokeRoundRect(20, 140, 200, 80, 14, [168, 85, 247, 255], 3);

  // Panel kontrol meja: Fader, Knop, dan Tombol Neon
  // Slider fader audio
  for (let i = 0; i < 6; i++) {
    const fx = 40 + i * 20;
    c.fillRect(fx, 154, 4, 34, [15, 23, 42, 255]);
    c.fillRect(fx - 2, 166 + (i % 3) * 6, 8, 8, [233, 213, 255, 255]); // Fader head
  }
  // Tombol bercahaya (LED Switch)
  for (let i = 0; i < 4; i++) {
    c.fillCircle(172 + (i % 2) * 18, 158 + Math.floor(i / 2) * 16, 5, i === 0 ? [239, 68, 68, 255] : [56, 189, 248, 255]);
  }

  // Tiang penyangga monitor hologram
  c.fillRect(116, 90, 8, 54, [15, 23, 42, 255]);
  c.fillRect(114, 88, 12, 6, [168, 85, 247, 255]);

  // Layar Hologram Utama (Tengah) - Equalizer Gelombang Suara
  c.fillRoundRect(50, 30, 140, 70, 10, [88, 28, 135, 180]);
  c.strokeRoundRect(50, 30, 140, 70, 10, [192, 132, 252, 255], 2);

  // Spektrum Bar Equalizer (Ungu-Pink-Cyan)
  const barHeights = [18, 32, 48, 26, 42, 54, 38, 22, 46, 34, 50, 28, 16];
  for (let i = 0; i < barHeights.length; i++) {
    const bx = 58 + i * 9;
    const bh = barHeights[i];
    const by = 86 - bh;
    const col = i % 2 === 0 ? [0, 240, 255, 240] : [244, 114, 182, 240];
    c.fillRect(bx, by, 6, bh, col);
  }

  // Teks mini "BROADCAST ON-AIR"
  c.fillRoundRect(80, 34, 80, 12, 3, [239, 68, 68, 220]);
  c.fillRect(84, 38, 6, 4, [255, 255, 255, 255]); // Indikator rec

  // Piringan Emitor Antena Satelit Atas
  c.fillCircle(120, 20, 12, [147, 51, 234, 255]);
  c.strokeCircle(120, 20, 12, [233, 213, 255, 255], 1.5);
  // Gelombang sinyal memancar
  c.strokeCircle(120, 20, 18, [168, 85, 247, 180], 1.5);
  c.strokeCircle(120, 20, 25, [192, 132, 252, 110], 1.5);

  fs.writeFileSync(path.join(OUTPUT_DIR, '2x2 Konsol Broadcast.png'), c.toPNG());
  console.log('✓ 2x2 Konsol Broadcast.png dibuat');
}

// ============================================================================
// 6. KONSOL DATABASE & SENSUS (2x2 Konsol Database.png - 240x240 px)
// Mainframe Server Rack & Layar HUD Holografik Pemain
// ============================================================================
{
  const c = new MiniCanvas(240, 240);
  // Bayangan dasar
  c.radialGlow(120, 210, 60, 110, [10, 15, 29, 140], [10, 15, 29, 0]);

  // Lemari Server Rack Kiri & Kanan (Brushed Titanium Chassis)
  // Server Kiri
  c.fillRoundRect(24, 100, 70, 120, 8, [15, 23, 42, 255]);
  c.fillRoundRect(28, 104, 62, 112, 6, [30, 41, 59, 255]);
  c.strokeRoundRect(24, 100, 70, 120, 8, [56, 189, 248, 255], 2);
  // Server Kanan
  c.fillRoundRect(146, 100, 70, 120, 8, [15, 23, 42, 255]);
  c.fillRoundRect(150, 104, 62, 112, 6, [30, 41, 59, 255]);
  c.strokeRoundRect(146, 100, 70, 120, 8, [56, 189, 248, 255], 2);

  // Lampu LED Blade Server Rack (Blinking Activity Lights)
  for (let y = 114; y < 206; y += 14) {
    // Kiri
    c.fillRect(34, y, 48, 8, [15, 23, 42, 255]);
    c.fillCircle(40, y + 4, 2.5, [34, 197, 94, 255]);  // Hijau OK
    c.fillCircle(48, y + 4, 2.5, [56, 189, 248, 255]); // Biru data
    c.fillRect(56, y + 2, 22, 4, [14, 165, 233, 180]); // Bar
    // Kanan
    c.fillRect(156, y, 48, 8, [15, 23, 42, 255]);
    c.fillCircle(162, y + 4, 2.5, [34, 197, 94, 255]);
    c.fillCircle(170, y + 4, 2.5, [245, 158, 11, 255]);
    c.fillRect(178, y + 2, 22, 4, [14, 165, 233, 180]);
  }

  // Jembatan Kabel Fiber Optik Tengah
  c.fillRect(94, 160, 52, 12, [15, 23, 42, 255]);
  c.fillRect(96, 164, 48, 4, [0, 240, 255, 220]);

  // Layar Hologram Melayang Tengah (Data Sensus & Statistik)
  c.fillRoundRect(60, 24, 120, 80, 10, [12, 74, 110, 190]);
  c.strokeRoundRect(60, 24, 120, 80, 10, [56, 189, 248, 255], 2);

  // Diagram Pie / Grafik Donat Hologram
  c.fillCircle(94, 58, 16, [14, 165, 233, 200]);
  c.strokeCircle(94, 58, 16, [254, 240, 138, 255], 2);
  c.fillCircle(94, 58, 7, [12, 74, 110, 255]);

  // Bar Chart Pemain Terdaftar
  c.fillRect(124, 40, 42, 4, [56, 189, 248, 240]);
  c.fillRect(124, 50, 32, 4, [34, 197, 94, 240]);
  c.fillRect(124, 60, 38, 4, [245, 158, 11, 240]);
  c.fillRect(124, 70, 26, 4, [239, 68, 68, 240]);

  // Judul "DATABASE MATRIX"
  c.fillRoundRect(80, 88, 80, 12, 3, [3, 105, 161, 240]);
  c.fillRect(86, 92, 68, 3, [224, 242, 254, 255]);

  fs.writeFileSync(path.join(OUTPUT_DIR, '2x2 Konsol Database.png'), c.toPNG());
  console.log('✓ 2x2 Konsol Database.png dibuat');
}

// ============================================================================
// 7. KONSOL GODMODE & KECEPATAN (2x2 Konsol Godmode.png - 240x240 px)
// Reaktor Overclocking Inti Emas & Busur Listrik Plasma
// ============================================================================
{
  const c = new MiniCanvas(240, 240);
  // Bayangan
  c.radialGlow(120, 210, 60, 110, [10, 15, 29, 140], [10, 15, 29, 0]);

  // Basis Reaktor Heksagonal Hitam Emas
  c.fillRoundRect(30, 130, 180, 90, 16, [69, 26, 3, 255]);
  c.fillRoundRect(36, 136, 168, 78, 12, [120, 53, 15, 255]);
  c.strokeRoundRect(30, 130, 180, 90, 16, [245, 158, 11, 255], 3);

  // Garis Hazard Kuning Hitam di Bibir Generator
  for (let x = 44; x < 190; x += 16) {
    c.fillRect(x, 196, 8, 12, [251, 191, 36, 255]);
    c.fillRect(x + 8, 196, 8, 12, [15, 23, 42, 255]);
  }

  // Tiga Batang Penampung Energi Plasma (Containment Rods)
  c.fillRect(56, 70, 14, 70, [30, 41, 59, 255]);
  c.strokeRect(56, 70, 14, 70, [245, 158, 11, 255], 1.5);
  c.fillRect(170, 70, 14, 70, [30, 41, 59, 255]);
  c.strokeRect(170, 70, 14, 70, [245, 158, 11, 255], 1.5);

  // Kubah Kaca Bola Reaktor Plasma
  c.radialGlow(120, 90, 10, 64, [254, 240, 138, 180], [245, 158, 11, 0]);
  c.fillCircle(120, 90, 44, [251, 191, 36, 110]);
  c.strokeCircle(120, 90, 44, [254, 240, 138, 255], 2.5);

  // Inti Plasma Singularity Menyala Terang
  c.fillCircle(120, 90, 22, [255, 255, 255, 255]);
  c.strokeCircle(120, 90, 26, [245, 158, 11, 255], 3);

  // Busur Listrik Plasma / Petir (Electric Lightning Arcs)
  // Petir Kiri
  c.fillRect(72, 86, 18, 3, [254, 240, 138, 255]);
  c.fillRect(84, 82, 14, 3, [255, 255, 255, 255]);
  // Petir Kanan
  c.fillRect(150, 88, 18, 3, [254, 240, 138, 255]);
  c.fillRect(142, 94, 14, 3, [255, 255, 255, 255]);

  // Spedometer Indikator "⚡ 400 PX/S"
  c.fillRoundRect(80, 144, 80, 38, 6, [15, 23, 42, 255]);
  c.strokeRoundRect(80, 144, 80, 38, 6, [245, 158, 11, 240], 1.5);
  // Dial Gauge
  c.fillCircle(120, 160, 10, [245, 158, 11, 160]);
  c.fillRect(118, 152, 14, 3, [239, 68, 68, 255]); // Jarum max speed
  // Label teks "OVERDRIVE"
  c.fillRect(94, 172, 52, 4, [251, 191, 36, 255]);

  fs.writeFileSync(path.join(OUTPUT_DIR, '2x2 Konsol Godmode.png'), c.toPNG());
  console.log('✓ 2x2 Konsol Godmode.png dibuat');
}

// ============================================================================
// 8. GERBANG PORTAL OPEN WORLD (2x2 Portal World.png - 240x240 px)
// Ancient-Sci-Fi Stargate Ring + Pusaran Kosmis Biru-Emas Menembus Dimensi
// ============================================================================
{
  const c = new MiniCanvas(240, 240);
  // Bayangan
  c.radialGlow(120, 130, 70, 115, [10, 15, 29, 150], [10, 15, 29, 0]);

  // Cincin Luar Stargate (Forged Brass & Cobalt Steel)
  c.fillCircle(120, 120, 100, [15, 23, 42, 255]);
  c.strokeCircle(120, 120, 100, [245, 158, 11, 255], 6);
  c.strokeCircle(120, 120, 92, [56, 189, 248, 240], 2.5);

  // 8 Klem Chevron Kristal Pengunci Dimensi
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const cx = 120 + Math.cos(angle) * 96;
    const cy = 120 + Math.sin(angle) * 96;
    c.fillCircle(cx, cy, 9, [217, 119, 6, 255]);
    c.fillCircle(cx, cy, 6, [0, 240, 255, 255]); // Kristal cyan menyala
    c.strokeCircle(cx, cy, 9, [254, 240, 138, 255], 1.5);
  }

  // Pusaran Energi Kosmik (Vortex Wormhole)
  c.radialGlow(120, 120, 0, 80, [224, 242, 254, 255], [2, 132, 199, 240]);
  c.strokeCircle(120, 120, 68, [56, 189, 248, 180], 2);
  c.strokeCircle(120, 120, 48, [14, 165, 233, 200], 2);
  c.strokeCircle(120, 120, 28, [245, 158, 11, 220], 2);

  // Spiral Nebula Bintang Partikel
  for (let a = 0; a < 6.28; a += 0.25) {
    const r = 12 + a * 9;
    const px = 120 + Math.cos(a * 2.5) * r;
    const py = 120 + Math.sin(a * 2.5) * r;
    c.fillCircle(px, py, 2.5, [255, 255, 255, 240]);
  }

  // Inti Cahaya Horizon
  c.fillCircle(120, 120, 14, [255, 255, 255, 255]);
  c.strokeCircle(120, 120, 16, [56, 189, 248, 255], 2);

  fs.writeFileSync(path.join(OUTPUT_DIR, '2x2 Portal World.png'), c.toPNG());
  console.log('✓ 2x2 Portal World.png dibuat');
}

// ============================================================================
// 9. GERBANG PORTAL RUMAH PRIBADI (2x2 Portal House.png - 240x240 px)
// Gerbang Kuantum Zamrud-Emas Menuju Sanctuary Rumah
// ============================================================================
{
  const c = new MiniCanvas(240, 240);
  // Bayangan
  c.radialGlow(120, 130, 70, 115, [10, 15, 29, 150], [10, 15, 29, 0]);

  // Cincin Luar Portal Zamrud & Emas
  c.fillCircle(120, 120, 100, [6, 78, 59, 255]);
  c.strokeCircle(120, 120, 100, [245, 158, 11, 255], 6);
  c.strokeCircle(120, 120, 92, [74, 222, 128, 240], 2.5);

  // 8 Klem Kristal Zamrud Hijau
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const cx = 120 + Math.cos(angle) * 96;
    const cy = 120 + Math.sin(angle) * 96;
    c.fillCircle(cx, cy, 9, [217, 119, 6, 255]);
    c.fillCircle(cx, cy, 6, [34, 197, 94, 255]); // Kristal zamrud
    c.strokeCircle(cx, cy, 9, [254, 240, 138, 255], 1.5);
  }

  // Pusaran Kuantum Hijau-Emas (Vortex Sanctuary)
  c.radialGlow(120, 120, 0, 80, [240, 253, 244, 255], [21, 128, 61, 240]);
  c.strokeCircle(120, 120, 68, [74, 222, 128, 180], 2);
  c.strokeCircle(120, 120, 48, [34, 197, 94, 200], 2);
  c.strokeCircle(120, 120, 28, [245, 158, 11, 220], 2);

  // Ikon Rumah Emas Melayang di Tengah Pusaran
  // Atap segitiga
  for (let i = 0; i < 14; i++) {
    const w = i * 2;
    c.fillRect(120 - i, 110 + i, w, 1.5, [254, 240, 138, 255]);
  }
  // Badan rumah
  c.fillRect(110, 124, 20, 14, [245, 158, 11, 255]);
  c.fillRect(116, 128, 8, 10, [6, 78, 59, 255]); // Pintu

  fs.writeFileSync(path.join(OUTPUT_DIR, '2x2 Portal House.png'), c.toPNG());
  console.log('✓ 2x2 Portal House.png dibuat');
}

// ============================================================================
// 10. PILAR ENERGI CYBER (1x3 Pilar Cyber.png - 120x360 px)
// Kolom Hexagonal Tabung Plasma Vertikal Biru-Emas
// ============================================================================
{
  const c = new MiniCanvas(120, 360);
  // Bayangan
  c.radialGlow(60, 340, 20, 56, [10, 15, 29, 140], [10, 15, 29, 0]);

  // Kaki Pilar Bawah (Heavy Base)
  c.fillRoundRect(16, 300, 88, 48, 8, [30, 41, 59, 255]);
  c.fillRoundRect(22, 306, 76, 36, 6, [51, 65, 85, 255]);
  c.strokeRoundRect(16, 300, 88, 48, 8, [245, 158, 11, 255], 3);

  // Kepala Pilar Atas (Capital)
  c.fillRoundRect(16, 12, 88, 48, 8, [30, 41, 59, 255]);
  c.fillRoundRect(22, 18, 76, 36, 6, [51, 65, 85, 255]);
  c.strokeRoundRect(16, 12, 88, 48, 8, [245, 158, 11, 255], 3);

  // Tabung Plasma Silinder Kaca (Central Plasma Chamber)
  c.fillRoundRect(28, 54, 64, 252, 6, [15, 23, 42, 230]);
  c.strokeRoundRect(28, 54, 64, 252, 6, [56, 189, 248, 200], 2);

  // Sinar Plasma Vertikal Biru-Putih Terang
  c.fillRect(52, 58, 16, 244, [56, 189, 248, 200]);
  c.fillRect(56, 58, 8, 244, [224, 242, 254, 255]);

  // Tiga Cincin Magnetik Emas Penjepit Tabung
  [110, 180, 250].forEach(cy => {
    c.fillRoundRect(22, cy - 8, 76, 16, 4, [217, 119, 6, 255]);
    c.fillRoundRect(24, cy - 6, 72, 12, 3, [245, 158, 11, 255]);
    c.strokeRoundRect(22, cy - 8, 76, 16, 4, [254, 240, 138, 255], 1.5);
    // Lampu LED status
    c.fillCircle(60, cy, 3, [0, 240, 255, 255]);
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, '1x3 Pilar Cyber.png'), c.toPNG());
  console.log('✓ 1x3 Pilar Cyber.png dibuat');
}

// ============================================================================
// 11. BANNER KEAGUNGAN RADEN (1x2 Banner Raden.png - 120x240 px)
// Tapestri Kerajaan Beludru Merah dengan Mahkota Emas Raden
// ============================================================================
{
  const c = new MiniCanvas(120, 240);
  // Bayangan banner
  c.fillRect(18, 20, 84, 200, [10, 15, 29, 90]);

  // Tiang Gantung Horisontal Emas
  c.fillRect(10, 16, 100, 8, [217, 119, 6, 255]);
  c.strokeRect(10, 16, 100, 8, [254, 240, 138, 255], 1.5);
  c.fillCircle(10, 20, 6, [245, 158, 11, 255]);
  c.fillCircle(110, 20, 6, [245, 158, 11, 255]);

  // Kain Tapestri Beludru Merah
  c.fillRect(16, 24, 88, 170, [157, 23, 77, 255]);
  c.fillRect(22, 28, 76, 162, [190, 24, 93, 255]);

  // Ujung Segitiga Bawah Kain
  for (let y = 194; y <= 218; y++) {
    const diff = (y - 194) * 1.5;
    const w = 88 - diff * 2;
    if (w > 0) {
      c.fillRect(16 + diff, y, w, 1, [157, 23, 77, 255]);
    }
  }

  // Border Bordir Emas
  c.strokeRect(20, 26, 80, 164, [245, 158, 11, 255], 2);
  c.strokeRect(24, 30, 72, 156, [254, 240, 138, 180], 1);

  // Mahkota Emas Raden di Tengah Banner
  const crownY = 70;
  c.radialGlow(60, crownY + 12, 10, 36, [254, 240, 138, 140], [245, 158, 11, 0]);
  c.fillRoundRect(42, crownY + 16, 36, 7, 2, [245, 158, 11, 255]);
  c.strokeRoundRect(42, crownY + 16, 36, 7, 2, [254, 240, 138, 255], 1);

  // Ujung-ujung mahkota
  c.fillCircle(60, crownY + 4, 3, [254, 240, 138, 255]);
  for (let i = 0; i < 12; i++) {
    c.fillRect(60 - (12 - i) / 2, crownY + 4 + i, 12 - i, 1, [251, 191, 36, 255]);
  }
  c.fillCircle(50, crownY + 8, 2.5, [254, 240, 138, 255]);
  for (let i = 0; i < 8; i++) {
    c.fillRect(50 - (8 - i) / 2, crownY + 8 + i, 8 - i, 1, [245, 158, 11, 255]);
  }
  c.fillCircle(70, crownY + 8, 2.5, [254, 240, 138, 255]);
  for (let i = 0; i < 8; i++) {
    c.fillRect(70 - (8 - i) / 2, crownY + 8 + i, 8 - i, 1, [245, 158, 11, 255]);
  }

  // Tulisan R Emas
  c.fillCircle(60, 120, 16, [245, 158, 11, 255]);
  c.strokeCircle(60, 120, 16, [254, 240, 138, 255], 2);
  c.fillRect(55, 110, 4, 20, [255, 255, 255, 255]);
  c.fillRoundRect(57, 110, 12, 11, 3, [255, 255, 255, 255]);
  c.fillRoundRect(59, 113, 6, 5, 2, [190, 24, 93, 255]);
  c.fillRect(63, 120, 5, 10, [255, 255, 255, 255]);

  // Rumbai Emas di Ujung Bawah
  c.fillCircle(60, 222, 5, [254, 240, 138, 255]);

  fs.writeFileSync(path.join(OUTPUT_DIR, '1x2 Banner Raden.png'), c.toPNG());
  console.log('✓ 1x2 Banner Raden.png dibuat');
}

// ============================================================================
// 12. FLOATING HOLO-GLOBE RADENWORLD (2x2 Holo Globe.png - 240x240 px)
// Globe Proyektor Holografik 3D Planet RadenWorld
// ============================================================================
{
  const c = new MiniCanvas(240, 240);
  // Bayangan lantai
  c.radialGlow(120, 210, 40, 90, [10, 15, 29, 130], [10, 15, 29, 0]);

  // Proyektor Lantai Hologram Bulat
  c.fillCircle(120, 200, 44, [15, 23, 42, 255]);
  c.fillCircle(120, 200, 36, [30, 41, 59, 255]);
  c.strokeCircle(120, 200, 44, [0, 240, 255, 255], 2.5);
  // Lensa Proyektor Biru
  c.fillCircle(120, 200, 18, [0, 240, 255, 220]);
  c.strokeCircle(120, 200, 18, [255, 255, 255, 255], 1.5);

  // Kerucut Proyeksi Cahaya Biru
  for (let y = 140; y < 196; y++) {
    const t = (y - 140) / 56;
    const w = 40 + t * 30;
    c.fillRect(120 - w / 2, y, w, 1, [0, 240, 255, Math.round(30 * (1 - t))]);
  }

  // Globe Hologram Bola Dunia Melayang
  c.radialGlow(120, 100, 0, 70, [224, 242, 254, 180], [14, 165, 233, 100]);
  c.strokeCircle(120, 100, 58, [0, 240, 255, 255], 2);

  // Garis Bujur & Lintang Hologram (Wireframe Grid)
  // Ekuator
  for (let x = 64; x <= 176; x++) {
    c.setPixel(x, 100, 0, 240, 255, 200);
  }
  // Garis lintang atas & bawah
  for (let x = 76; x <= 164; x++) {
    c.setPixel(x, 80, 0, 240, 255, 150);
    c.setPixel(x, 120, 0, 240, 255, 150);
  }
  // Garis bujur meridian elips
  for (let y = 44; y <= 156; y++) {
    c.setPixel(120, y, 0, 240, 255, 200);
    const dy = (y - 100) / 56;
    if (Math.abs(dy) <= 1) {
      const rx = Math.sqrt(1 - dy * dy) * 32;
      c.setPixel(120 - rx, y, 0, 240, 255, 150);
      c.setPixel(120 + rx, y, 0, 240, 255, 150);
    }
  }

  // Cincin Orbit Satelit Miring (Orbital Rings)
  for (let deg = 0; deg < 360; deg += 3) {
    const rad = (deg * Math.PI) / 180;
    const ox = 120 + Math.cos(rad) * 78;
    const oy = 100 + Math.sin(rad) * 22 - Math.cos(rad) * 18;
    c.fillCircle(ox, oy, 1.5, [254, 240, 138, 220]);
  }

  // Satelit Emas Mini di Orbit
  c.fillCircle(186, 76, 4.5, [245, 158, 11, 255]);
  c.strokeCircle(186, 76, 4.5, [255, 255, 255, 255], 1);

  fs.writeFileSync(path.join(OUTPUT_DIR, '2x2 Holo Globe.png'), c.toPNG());
  console.log('✓ 2x2 Holo Globe.png dibuat');
}

console.log('🎉 SELURUH 12 ASET VISUAL RUANG KENDALI ADMIN BERHASIL DIBUAT DI public/assets/maps/Admin/Assets/ !');
