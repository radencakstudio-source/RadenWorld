/**
 * ============================================================================
 * FILE: resources/js/game/core/GraphicsQualityManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Mesin Optimasi Kualitas Grafik & Anti-Flicker / Anti-Shimmer WebGL (Mipmap &
 * Trilinear/Anisotropic Filtering) saat kamera melakukan Zoom Out jauh & bergerak:
 *
 * 1. Menghilangkan efek "gret-gret / garis kedip-kedip" (texture aliasing &
 *    sub-pixel vertex snapping) pada aset gedung, pohon, karakter, jalan, dan
 *    trotoar ketika kamera di-zoom out jauh dan pemain berjalan.
 * 2. Tidak mengubah kontrol kamera sama sekali dan tidak mengubah file aset.
 * 3. Terhubung langsung dengan Pengaturan Grafik (Low / Medium / High &
 *    Anti-Aliasing) secara real-time.
 * ============================================================================
 */

import Phaser from 'phaser';

export interface IGraphicsSettingsState {
  graphicsQuality: 'low' | 'medium' | 'high';
  enableAntiAliasing: boolean;
  enableMovementEffects: boolean;
  maxVisiblePlayers: number;
}

/**
 * Daftar key tekstur yang digunakan oleh TileSprite (wajib menggunakan gl.REPEAT)
 */
const REPEATING_TILE_KEYS = new Set<string>([
  'world-checker-tile',
  'water-checker-tile',
  'water-wave-tile',
  'water-wave-caustic',
  'beach-checker-tile',
  'wall-side-checker',
  'wall-top-checker',
  'water-shoreline-surf',
  'water-shoreline-surf-v',
  'plaza-checker-tile',
  'tile-trotoar-alunalun',
  'trotoar-2',
]);

export class GraphicsQualityManager {
  private static isPowerOfTwo(value: number): boolean {
    return value > 0 && (value & (value - 1)) === 0;
  }

  /**
   * Membaca konfigurasi grafik saat ini dari localStorage
   */
  public static getSavedSettings(): IGraphicsSettingsState {
    let graphicsQuality: 'low' | 'medium' | 'high' = 'high';
    let enableAntiAliasing = true;
    let enableMovementEffects = true;
    let maxVisiblePlayers = 50;

    try {
      const raw = localStorage.getItem('raden_game_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed.graphicsQuality === 'low' ||
          parsed.graphicsQuality === 'medium' ||
          parsed.graphicsQuality === 'high'
        ) {
          graphicsQuality = parsed.graphicsQuality;
        }
        if (typeof parsed.enableAntiAliasing === 'boolean') {
          enableAntiAliasing = parsed.enableAntiAliasing;
        }
        if (typeof parsed.enableMovementEffects === 'boolean') {
          enableMovementEffects = parsed.enableMovementEffects;
        }
        if (typeof parsed.maxVisiblePlayers === 'number') {
          maxVisiblePlayers = parsed.maxVisiblePlayers;
        }
      }
    } catch (e) {}

    return {
      graphicsQuality,
      enableAntiAliasing,
      enableMovementEffects,
      maxVisiblePlayers,
    };
  }

  /**
   * Menerapkan WebGL Hardware Mipmapping (Trilinear / Bilinear / Anisotropic Filtering)
   * dan stabilisasi sub-piksel kamera sesuai tingkat Pengaturan Grafik.
   *
   * - Menghilangkan garis kedip-kedip (shimmering / moire) pada aset saat zoom out jauh.
   * - Mencegah tepi petak jalan/trotoar bocor (CLAMP_TO_EDGE).
   * - Menonaktifkan roundPixels saat zoom < 1 dengan Anti-Aliasing aktif agar
   *   titik sudut (vertex) aset tidak melompat-lompat ("gret-gret") ketika bergerak.
   */
  public static applyToScene(
    scene: Phaser.Scene,
    overrideSettings?: Partial<IGraphicsSettingsState>
  ): void {
    if (!scene || !scene.game) return;

    const saved = this.getSavedSettings();
    const quality = overrideSettings?.graphicsQuality ?? saved.graphicsQuality;
    const enableAA = overrideSettings?.enableAntiAliasing ?? saved.enableAntiAliasing;

    // 1. Stabilisasi Kamera:
    // Saat Anti-Aliasing aktif, matikan roundPixels pada kamera agar ketika zoom-out
    // (< 1.0x) dan karakter berjalan, vertex gambar tidak dipaksa lompat per 1 piksel bulat
    // yang menyebabkan aset bergetar ("gret-gret") dan celah ubin berkedip.
    const cam = scene.cameras?.main;
    if (cam) {
      const shouldRoundPixels = !enableAA;
      cam.setRoundPixels(shouldRoundPixels);
    }

    // 2. Sinkronisasi CSS Canvas Rendering
    const canvas = scene.game.canvas;
    if (canvas) {
      canvas.style.imageRendering = enableAA ? 'auto' : 'pixelated';
    }

    // 3. Terapkan Filter Tekstur WebGL & Mipmap Hardware
    const renderer = scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      renderer && (renderer as any).gl ? (renderer as any).gl : null;

    if (!gl || !scene.textures) return;

    const isWebGL2 =
      typeof WebGL2RenderingContext !== 'undefined' &&
      gl instanceof WebGL2RenderingContext;

    // Cek dukungan Anisotropic Filtering pada GPU untuk ketajaman garis miring/jauh
    const anisoExt =
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

    let targetAnisotropy = 1;
    if (anisoExt && enableAA) {
      const maxAniso = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1;
      if (quality === 'high') {
        targetAnisotropy = Math.min(8, maxAniso);
      } else if (quality === 'medium') {
        targetAnisotropy = Math.min(4, maxAniso);
      } else {
        targetAnisotropy = 1;
      }
    }

    const prevBoundTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
    const texList = scene.textures.list;

    for (const key of Object.keys(texList)) {
      if (
        key === '__DEFAULT' ||
        key === '__MISSING' ||
        key === '__WHITE' ||
        key === 'world-night-lightmap'
      ) {
        continue;
      }
      const tex = texList[key];
      if (!tex || !Array.isArray(tex.source)) continue;

      // Set filter dasar Phaser
      try {
        tex.setFilter(
          enableAA
            ? Phaser.Textures.FilterMode.LINEAR
            : Phaser.Textures.FilterMode.NEAREST
        );
      } catch (e) {}

      const isRepeatingTile = REPEATING_TILE_KEYS.has(key);

      for (const src of tex.source) {
        if (!src || !src.glTexture) continue;
        const rawGlTex: WebGLTexture | null =
          (src.glTexture as any).webGLTexture || (src.glTexture as any);
        if (!rawGlTex) continue;

        const w = src.width || 0;
        const h = src.height || 0;
        const canMipmap =
          isWebGL2 || (this.isPowerOfTwo(w) && this.isPowerOfTwo(h));

        try {
          gl.bindTexture(gl.TEXTURE_2D, rawGlTex);

          // Atur mode bungkus tepi tekstur (Wrap Mode):
          // Untuk prop/gedung/jalan/trotoar: wajib CLAMP_TO_EDGE agar piksel transparan di tepi seberang
          // tidak bocor menjadi garis tipis saat kamera zoom-out.
          if (isRepeatingTile && canMipmap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          } else if (!isRepeatingTile) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          }

          if (!enableAA) {
            // Mode Pixelated / Anti-Aliasing Mati
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          } else if (canMipmap && w >= 16 && h >= 16) {
            // Bangun Mipmap sekali saja per tekstur agar hemat performa
            if (!(src as any).__radenMipmapGenerated) {
              gl.generateMipmap(gl.TEXTURE_2D);
              (src as any).__radenMipmapGenerated = true;
            }

            // Pilih kehalusan Minification Filter berdasarkan Kualitas Grafik:
            // - High: LINEAR_MIPMAP_LINEAR (Trilinear Mipmap - 100% bebas kedip saat zoom out ekstrem)
            // - Medium / Low: LINEAR_MIPMAP_NEAREST (Bilinear Mipmap - ringan & bebas garis kedip)
            const minFilter =
              quality === 'high'
                ? gl.LINEAR_MIPMAP_LINEAR
                : gl.LINEAR_MIPMAP_NEAREST;

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            if (anisoExt) {
              gl.texParameterf(
                gl.TEXTURE_2D,
                anisoExt.TEXTURE_MAX_ANISOTROPY_EXT,
                targetAnisotropy
              );
            }
          } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          }
        } catch (e) {
          // Abaikan jika tekstur sedang di-upload asinkron
        }
      }
    }

    try {
      gl.bindTexture(gl.TEXTURE_2D, prevBoundTex);
    } catch (e) {}
  }
}
