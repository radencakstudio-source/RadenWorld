/**
 * ============================================================================
 * FILE: resources/js/game/utils/AvatarGenerator.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Generator tekstur avatar 2D dinamis di Phaser 3 berdasarkan gender,
 * warna kulit, warna baju, warna celana, dan jenis topi yang dipilih pemain.
 * ============================================================================
 */

import Phaser from 'phaser';
import { IAvatarCustomization } from '../types';

export class AvatarGenerator {
  /**
   * Menghasilkan atau mengambil kunci tekstur Phaser untuk avatar yang dikustomisasi
   */
  public static getOrCreateTexture(scene: Phaser.Scene, avatar?: IAvatarCustomization): string {
    const safeGender = avatar?.gender === 'female' ? 'female' : 'male';
    const safeSkin = (avatar?.skinColor || '#fed7aa').replace('#', '');
    const safeShirt = (avatar?.shirtColor || '#2563eb').replace('#', '');
    const safePants = (avatar?.pantsColor || '#1e293b').replace('#', '');
    const safeHat = avatar?.hatType || 'none';
    const textureKey = `ava_${safeGender}_${safeSkin}_${safeShirt}_${safePants}_${safeHat}`;

    if (scene.textures.exists(textureKey)) {
      return textureKey;
    }

    const g = scene.make.graphics({ x: 0, y: 0 });

    // Parse colors to integer hex
    const skin = parseInt(safeSkin, 16) || 0xfed7aa;
    const shirt = parseInt(safeShirt, 16) || 0x2563eb;
    const pants = parseInt(safePants, 16) || 0x1e293b;

    // 1. Bayangan di tanah
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(24, 44, 14, 4);

    // 2. Celana & Kaki
    g.fillStyle(pants, 1);
    g.fillRect(17, 34, 5, 8); // Kaki kiri
    g.fillRect(26, 34, 5, 8); // Kaki kanan
    // Sepatu
    g.fillStyle(0x0f172a, 1);
    g.fillRect(16, 40, 6, 3);
    g.fillRect(26, 40, 6, 3);

    // 3. Badan & Baju
    g.fillStyle(shirt, 1);
    g.fillRoundedRect(16, 20, 16, 15, 3);

    // Sabuk
    g.fillStyle(0x78350f, 1);
    g.fillRect(16, 32, 16, 3);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(22, 32, 4, 3);

    // 4. Lengan & Tangan
    g.fillStyle(shirt, 1);
    g.fillRect(13, 22, 3, 9);
    g.fillRect(32, 22, 3, 9);
    // Telapak tangan (warna kulit)
    g.fillStyle(skin, 1);
    g.fillCircle(14.5, 32, 2);
    g.fillCircle(33.5, 32, 2);

    // 5. Kepala (warna kulit)
    g.fillStyle(skin, 1);
    g.fillCircle(24, 14, 8);

    // 6. Rambut berdasarkan Gender
    if (safeGender === 'female') {
      // Rambut perempuan lebih panjang / terurai
      g.fillStyle(0x3b2f2f, 1);
      g.fillCircle(24, 11, 8.5);
      // Kuncir samping / rambut panjang
      g.fillRect(14, 12, 3, 14);
      g.fillRect(31, 12, 3, 14);
    } else {
      // Rambut laki-laki rapi
      g.fillStyle(0x1e1b18, 1);
      g.fillCircle(24, 10, 8.5);
      g.fillRect(15, 11, 2.5, 5);
      g.fillRect(30.5, 11, 2.5, 5);
    }

    // Mata & Wajah
    g.fillStyle(0x0f172a, 1);
    g.fillCircle(21.5, 14, 1.3);
    g.fillCircle(26.5, 14, 1.3);

    // Senyum halus
    g.lineStyle(1, 0x78350f, 0.8);
    g.lineBetween(23, 17, 25, 17);

    // 7. Topi yang dipilih
    switch (safeHat) {
      case 'crown':
        // Mahkota Emas Kerajaan Super Admin dengan Permata Rubi & Safir
        g.fillStyle(0xf59e0b, 1); // Emas
        g.fillRect(17, 7, 14, 3); // Pita lingkar mahkota
        // Puncak mahkota
        g.fillTriangle(17, 7, 19, 2, 22, 7);
        g.fillTriangle(21, 7, 24, 0, 27, 7);
        g.fillTriangle(26, 7, 29, 2, 31, 7);
        // Permata rubi merah di puncak tengah
        g.fillStyle(0xef4444, 1);
        g.fillCircle(24, 5.5, 1.5);
        // Permata safir biru di kiri dan kanan
        g.fillStyle(0x38bdf8, 1);
        g.fillCircle(19, 6.5, 1);
        g.fillCircle(29, 6.5, 1);
        break;

      case 'adventurer':
        // Topi penjelajah kulit cokelat
        g.fillStyle(0x92400e, 1);
        g.fillEllipse(24, 10, 14, 3); // Brim
        g.fillRect(18, 4, 12, 6);     // Crown
        g.fillStyle(0xf59e0b, 1);
        g.fillRect(18, 8, 12, 2);     // Band
        break;

      case 'knight':
        // Helm ksatria baja
        g.fillStyle(0x64748b, 1);
        g.fillCircle(24, 11, 9);
        g.fillStyle(0x475569, 1);
        g.fillRect(17, 11, 14, 4); // Visor slit
        g.fillStyle(0xef4444, 1);
        g.fillRect(23, 1, 2, 6);   // Plume merah
        break;

      case 'bandana':
        // Bandana kain merah di dahi
        g.fillStyle(0xdc2626, 1);
        g.fillRect(16, 9, 16, 4);
        g.fillRect(13, 10, 3, 7); // Simpul
        break;

      case 'wizard':
        // Topi kerucut penyihir
        g.fillStyle(0x6d28d9, 1);
        g.fillEllipse(24, 10, 13, 3);
        g.fillTriangle(24, 0, 17, 9, 31, 9);
        g.fillStyle(0xfbbf24, 1);
        g.fillCircle(24, 2, 2); // Bintang
        break;

      case 'none':
      default:
        // Tanpa topi
        break;
    }

    g.generateTexture(textureKey, 48, 48);
    g.destroy();

    return textureKey;
  }
}
