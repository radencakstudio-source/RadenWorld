/**
 * ============================================================================
 * FILE: resources/js/game/scenes/world/WorldFarming.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Sistem Pertanian & Perkebunan Interaktif RadenWorld di Kawasan Kebun Tani
 * (gx: 57..80, gy: 1..9) dengan Durasi Tumbuh 24 Jam Penuh & 5 Tahap Wajib:
 * 1. Cangkul lahan tanah
 * 2. Siram air sekali dengan Tong Penyiram (Batas air 10/10, isi di laut/pantai)
 * 3. Tanam bibit pilihan
 * 4. Tunggu 24 jam (86.400.000 ms)
 * 5. Panen hasil bumi segar
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../../entities/Player';
import { InventoryManager, IInventoryItem } from '../../core/InventoryManager';
import { SoundManager } from '../../core/SoundManager';
import { EventBus } from '../../core/EventBus';
import type { Direction } from '../../types';

export const CROP_GROW_DURATION_24H_MS = 24 * 60 * 60 * 1000; // 24 jam penuh (86.400.000 ms)

export function formatCropRemainingTime(ms: number): string {
  if (ms <= 0) return 'Siap Panen!';
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}j ${minutes}m lagi`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s lagi`;
  }
  return `${seconds} detik lagi`;
}

export interface ICropCatalogEntry {
  cropId: string;
  cropName: string;
  icon: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  sellPrice: number;
  harvestQty: number;
  growDurationMs: number;
  hpRestore: number;
}

export interface IPlantedCropState {
  gx: number;
  gy: number;
  tilled: boolean;        // Syarat 1: sudah dicangkul
  watered: boolean;       // Syarat 2: sudah disiram air sekali
  seedId?: string;        // Syarat 3: bibit yang ditanam
  plantedAt?: number;     // Syarat 3: timestamp penanaman
  growDurationMs: number; // Syarat 4: durasi tumbuh 24 jam (86.400.000 ms)
}

interface ICropVisualNode {
  state: IPlantedCropState;
  meta?: ICropCatalogEntry;
  container: Phaser.GameObjects.Container;
  moundGfx: Phaser.GameObjects.Graphics;
  barBgGfx: Phaser.GameObjects.Graphics;
  barFillGfx: Phaser.GameObjects.Graphics;
  emojiText: Phaser.GameObjects.Text;
  badgeText: Phaser.GameObjects.Text;
  lastStage: number; // -2 = tilled only, -1 = watered only, 0 = sprout, 1 = growing, 2 = ripe
}

const STORAGE_KEY = 'raden_world_crops_v2';
const DEMO_SEEDED_KEY = 'raden_demo_crops_seeded_v2';

export const FARM_CROPS_META: Record<string, ICropCatalogEntry> = {
  seed_padi_pandanwangi: {
    cropId: 'crop_padi_pandanwangi',
    cropName: 'Beras Pandanwangi Cianjur',
    icon: '🌾',
    rarity: 'Common',
    sellPrice: 28,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 20,
  },
  seed_jagung_manis_madura: {
    cropId: 'crop_jagung_manis',
    cropName: 'Jagung Manis Madura',
    icon: '🌽',
    rarity: 'Common',
    sellPrice: 32,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 25,
  },
  seed_singkong_mukibat: {
    cropId: 'crop_singkong_mukibat',
    cropName: 'Singkong Mukibat Segar',
    icon: '🥔',
    rarity: 'Common',
    sellPrice: 26,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 22,
  },
  seed_ubi_cilembu: {
    cropId: 'crop_ubi_cilembu',
    cropName: 'Ubi Madu Cilembu',
    icon: '🍠',
    rarity: 'Uncommon',
    sellPrice: 36,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 30,
  },
  seed_kedelai_malika: {
    cropId: 'crop_kedelai_malika',
    cropName: 'Kedelai Hitam Malika',
    icon: '🫘',
    rarity: 'Common',
    sellPrice: 25,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 18,
  },
  seed_kacang_tanah_tuban: {
    cropId: 'crop_kacang_tanah',
    cropName: 'Kacang Tanah Tuban',
    icon: '🥜',
    rarity: 'Common',
    sellPrice: 24,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 18,
  },
  seed_cabai_rawit_domba: {
    cropId: 'crop_cabai_rawit',
    cropName: 'Cabai Rawit Domba Segar',
    icon: '🌶️',
    rarity: 'Uncommon',
    sellPrice: 42,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 15,
  },
  seed_cabai_keriting_medan: {
    cropId: 'crop_cabai_keriting',
    cropName: 'Cabai Merah Keriting',
    icon: '🌶️',
    rarity: 'Uncommon',
    sellPrice: 44,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 15,
  },
  seed_kangkung_lombok: {
    cropId: 'crop_kangkung_lombok',
    cropName: 'Kangkung Segar Lombok',
    icon: '🥬',
    rarity: 'Common',
    sellPrice: 18,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 20,
  },
  seed_bayam_raja: {
    cropId: 'crop_bayam_raja',
    cropName: 'Bayam Hijau Segar',
    icon: '🥗',
    rarity: 'Common',
    sellPrice: 18,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 20,
  },
  seed_terong_antaboga: {
    cropId: 'crop_terong_ungu',
    cropName: 'Terong Ungu Antaboga',
    icon: '🍆',
    rarity: 'Common',
    sellPrice: 28,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 22,
  },
  seed_kacang_panjang: {
    cropId: 'crop_kacang_panjang',
    cropName: 'Kacang Panjang Hijau',
    icon: '🌿',
    rarity: 'Common',
    sellPrice: 22,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 18,
  },
  seed_tomat_lumajang: {
    cropId: 'crop_tomat_lumajang',
    cropName: 'Tomat Merah Lumajang',
    icon: '🍅',
    rarity: 'Common',
    sellPrice: 30,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 25,
  },
  seed_bawang_merah_brebes: {
    cropId: 'crop_bawang_brebes',
    cropName: 'Bawang Merah Brebes',
    icon: '🧅',
    rarity: 'Uncommon',
    sellPrice: 46,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 18,
  },
  seed_jahe_merah_super: {
    cropId: 'crop_jahe_merah',
    cropName: 'Rimpang Jahe Merah Super',
    icon: '🫚',
    rarity: 'Rare',
    sellPrice: 68,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 35,
  },
  seed_kunyit_asam: {
    cropId: 'crop_kunyit_emas',
    cropName: 'Rimpang Kunyit Emas',
    icon: '🫚',
    rarity: 'Uncommon',
    sellPrice: 58,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 30,
  },
  seed_semangka_inul: {
    cropId: 'crop_semangka_inul',
    cropName: 'Semangka Merah Manis',
    icon: '🍉',
    rarity: 'Rare',
    sellPrice: 75,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 45,
  },
  seed_melon_golden: {
    cropId: 'crop_melon_golden',
    cropName: 'Melon Madu Golden',
    icon: '🍈',
    rarity: 'Rare',
    sellPrice: 82,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 45,
  },
  seed_pisang_raja: {
    cropId: 'crop_pisang_raja',
    cropName: 'Sisir Pisang Raja Bulu',
    icon: '🍌',
    rarity: 'Rare',
    sellPrice: 115,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 50,
  },
  seed_kopi_gayo: {
    cropId: 'crop_kopi_gayo',
    cropName: 'Biji Kopi Arabika Gayo',
    icon: '☕',
    rarity: 'Legendary',
    sellPrice: 135,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 40,
  },
  seed_kelapa_pandan: {
    cropId: 'crop_kelapa_pandan',
    cropName: 'Kelapa Pandan Wangi',
    icon: '🥥',
    rarity: 'Legendary',
    sellPrice: 170,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 55,
  },
};

export function resolveCropMeta(
  seedId: string,
  fallbackIcon = '🌾',
  fallbackName = 'Hasil Panen'
): ICropCatalogEntry {
  const clean = seedId.replace(/_\d{10,}$/, '');
  if (FARM_CROPS_META[clean]) return FARM_CROPS_META[clean];
  return {
    cropId: clean.replace(/^seed_/, 'crop_'),
    cropName: fallbackName.replace(/^(Bibit|Benih|Biji|Anakan)\s+/i, 'Panen '),
    icon: fallbackIcon || '🌾',
    rarity: 'Common',
    sellPrice: 30,
    harvestQty: 2,
    growDurationMs: CROP_GROW_DURATION_24H_MS,
    hpRestore: 20,
  };
}

export class WorldFarming {
  private static scene: Phaser.Scene | null = null;
  private static tileSize: number = 120;
  private static digTilesMap: Map<string, Phaser.GameObjects.Image> = new Map();
  private static nodes: Map<string, ICropVisualNode> = new Map();
  private static lastVisualUpdate: number = 0;

  private static keyOf(gx: number, gy: number): string {
    return `${gx},${gy}`;
  }

  public static isFarmGrid(gx: number, gy: number): boolean {
    return gx >= 57 && gx <= 80 && gy >= 1 && gy <= 9;
  }

  public static init(
    scene: Phaser.Scene,
    tileSize: number,
    digTiles: Phaser.GameObjects.Image[]
  ): void {
    this.reset();
    this.scene = scene;
    this.tileSize = tileSize;

    for (const img of digTiles) {
      const gx = img.getData('gridX');
      const gy = img.getData('gridY');
      if (typeof gx === 'number' && typeof gy === 'number') {
        this.digTilesMap.set(this.keyOf(gx, gy), img);
      }
    }

    const saved = this.loadStates();
    for (const state of saved) {
      if (this.isFarmGrid(state.gx, state.gy)) {
        this.spawnVisualNode(state);
      }
    }
  }

  public static reset(): void {
    this.nodes.forEach((n) => {
      try {
        n.container.destroy();
      } catch {
        // ignore
      }
    });
    this.nodes.clear();
    this.digTilesMap.clear();
    this.scene = null;
    this.lastVisualUpdate = 0;
  }

  private static loadStates(): IPlantedCropState[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }

    // Pertama kali masuk: tanamkan 1 contoh tanaman siap panen di petak [58, 5] untuk uji coba panen
    try {
      if (!localStorage.getItem(DEMO_SEEDED_KEY)) {
        localStorage.setItem(DEMO_SEEDED_KEY, '1');
        const pastRipe = Date.now() - (CROP_GROW_DURATION_24H_MS + 60000); // 24+ jam yang lalu
        const demo: IPlantedCropState[] = [
          {
            gx: 58,
            gy: 5,
            tilled: true,
            watered: true,
            seedId: 'seed_padi_pandanwangi',
            plantedAt: pastRipe,
            growDurationMs: CROP_GROW_DURATION_24H_MS,
          },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
        return demo;
      }
    } catch {
      // ignore
    }
    return [];
  }

  private static persistStates(): void {
    try {
      const all: IPlantedCropState[] = [];
      this.nodes.forEach((n) => all.push(n.state));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  }

  private static drawSoilMound(gfx: Phaser.GameObjects.Graphics, watered: boolean, ripe: boolean): void {
    gfx.clear();
    // Warna tanah gembur: bila disiram jadi cokelat tua basah, bila kering cokelat muda
    gfx.fillStyle(watered ? 0x4a2a12 : 0x8b5a2b, 0.95);
    gfx.fillEllipse(0, 14, 76, 34);
    gfx.fillStyle(watered ? 0x5c3417 : 0xa46c38, 0.98);
    gfx.fillEllipse(0, 11, 66, 26);

    if (ripe) {
      gfx.lineStyle(2.5, 0xffae6d, 1);
      gfx.strokeEllipse(0, 13, 80, 36);
    }
  }

  private static spawnVisualNode(state: IPlantedCropState): void {
    if (!this.scene) return;
    const key = this.keyOf(state.gx, state.gy);
    const existing = this.nodes.get(key);
    if (existing) {
      existing.container.destroy();
      this.nodes.delete(key);
    }

    const meta = state.seedId ? resolveCropMeta(state.seedId) : undefined;
    const cx = state.gx * this.tileSize + this.tileSize * 0.5;
    const cy = state.gy * this.tileSize + this.tileSize * 0.5;

    const container = this.scene.add.container(cx, cy);
    container.setDepth(cy - 10);

    const moundGfx = this.scene.add.graphics();
    const barBgGfx = this.scene.add.graphics();
    barBgGfx.fillStyle(0xfff8ea, 0.95);
    barBgGfx.fillRoundedRect(-28, 26, 56, 9, 4);
    barBgGfx.lineStyle(1.5, 0x5c3a21, 1);
    barBgGfx.strokeRoundedRect(-28, 26, 56, 9, 4);

    const barFillGfx = this.scene.add.graphics();

    const emojiText = this.scene.add
      .text(0, -4, '🌱', {
        fontSize: '34px',
        padding: { top: 6, bottom: 6, left: 4, right: 4 },
      })
      .setOrigin(0.5, 0.5);

    const badgeText = this.scene.add
      .text(0, -34, '', {
        fontFamily: '"Kenney Pixel Square", monospace',
        fontSize: '10px',
        color: '#000000',
        backgroundColor: '#FFAE6D',
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    container.add([moundGfx, emojiText, barBgGfx, barFillGfx, badgeText]);

    const digImg = this.digTilesMap.get(key);
    if (digImg) {
      digImg.setData('hasCrop', true);
      if (state.watered) digImg.setTint(0xb5845b);
      else digImg.setTint(0xd69e6b);
    }

    const node: ICropVisualNode = {
      state,
      meta,
      container,
      moundGfx,
      barBgGfx,
      barFillGfx,
      emojiText,
      badgeText,
      lastStage: -99,
    };
    this.nodes.set(key, node);
    this.refreshSingleNodeVisual(node, Date.now());
  }

  private static refreshSingleNodeVisual(node: ICropVisualNode, nowMs: number): void {
    const { state, meta } = node;

    // KASUS 1: Lahan baru dicangkul (belum disiram air & belum ditanam bibit)
    if (!state.watered && !state.seedId) {
      if (node.lastStage !== -2) {
        node.lastStage = -2;
        this.drawSoilMound(node.moundGfx, false, false);
        node.emojiText.setText('⛏️').setScale(0.8);
        node.badgeText.setText('DICANGKUL [💧 SIRAM]').setVisible(true);
        node.barBgGfx.setVisible(false);
        node.barFillGfx.clear().setVisible(false);
      }
      return;
    }

    // KASUS 2: Lahan sudah disiram air (belum ditanam bibit)
    if (state.watered && !state.seedId) {
      if (node.lastStage !== -1) {
        node.lastStage = -1;
        this.drawSoilMound(node.moundGfx, true, false);
        node.emojiText.setText('💧').setScale(0.85);
        node.badgeText.setText('SIAP TANAM [🌱]').setVisible(true);
        node.barBgGfx.setVisible(false);
        node.barFillGfx.clear().setVisible(false);
      }
      return;
    }

    // KASUS 3: Lahan sudah ditanam bibit -> Perhitungan waktu 24 jam (86.400.000 ms)
    node.barBgGfx.setVisible(true);
    node.barFillGfx.setVisible(true);

    const plantedAt = state.plantedAt || nowMs;
    const elapsed = Math.max(0, nowMs - plantedAt);
    const duration = Math.max(1000, state.growDurationMs || CROP_GROW_DURATION_24H_MS);
    const progress = Math.min(1, elapsed / duration);
    const isRipe = progress >= 1;
    const stage = isRipe ? 2 : progress >= 0.45 ? 1 : 0;

    if (stage !== node.lastStage) {
      node.lastStage = stage;
      this.drawSoilMound(node.moundGfx, state.watered, isRipe);

      if (stage === 0) {
        node.emojiText.setText('🌱').setScale(0.85);
        node.badgeText.setVisible(false);
      } else if (stage === 1) {
        node.emojiText.setText('🌿').setScale(1.0);
        node.badgeText.setVisible(false);
      } else {
        node.emojiText.setText(meta?.icon || '🌾').setScale(1.15);
        node.badgeText.setText('PANEN [F]').setVisible(true);
      }
    }

    node.barFillGfx.clear();
    const fillW = Math.max(4, Math.round(52 * progress));
    node.barFillGfx.fillStyle(isRipe ? 0xffae6d : 0xa8e6cf, 1);
    node.barFillGfx.fillRoundedRect(-26, 28, fillW, 5, 2.5);
  }

  public static update(time: number): void {
    if (!this.scene || this.nodes.size === 0) return;
    if (time - this.lastVisualUpdate < 300) return;
    this.lastVisualUpdate = time;

    const nowMs = Date.now();
    this.nodes.forEach((node) => {
      this.refreshSingleNodeVisual(node, nowMs);
      if (node.lastStage === 2) {
        node.emojiText.y = -6 + Math.sin(time * 0.005 + node.state.gx) * 3;
      }
    });
  }

  public static isCropRipe(state: IPlantedCropState): boolean {
    if (!state.seedId || !state.plantedAt) return false;
    return Date.now() - state.plantedAt >= (state.growDurationMs || CROP_GROW_DURATION_24H_MS);
  }

  /**
   * Menentukan petak tanah kebun di posisi kaki pemain atau 1 petak di depannya
   */
  public static resolveTargetPlot(
    px: number,
    py: number,
    dir: Direction,
    preferOccupied: boolean = false
  ): { gx: number; gy: number } | null {
    const ts = this.tileSize;
    const curGx = Math.floor(px / ts);
    const curGy = Math.floor(py / ts);

    let frontGx = curGx;
    let frontGy = curGy;
    if (dir === 'up') frontGy -= 1;
    else if (dir === 'down') frontGy += 1;
    else if (dir === 'left') frontGx -= 1;
    else if (dir === 'right') frontGx += 1;

    const curValid = this.isFarmGrid(curGx, curGy);
    const frontValid = this.isFarmGrid(frontGx, frontGy);

    if (preferOccupied) {
      if (curValid && this.nodes.has(this.keyOf(curGx, curGy))) return { gx: curGx, gy: curGy };
      if (frontValid && this.nodes.has(this.keyOf(frontGx, frontGy))) return { gx: frontGx, gy: frontGy };
    } else {
      if (curValid && !this.nodes.has(this.keyOf(curGx, curGy))) return { gx: curGx, gy: curGy };
      if (frontValid && !this.nodes.has(this.keyOf(frontGx, frontGy))) return { gx: frontGx, gy: frontGy };
    }

    if (curValid) return { gx: curGx, gy: curGy };
    if (frontValid) return { gx: frontGx, gy: frontGy };
    return null;
  }

  public static hasRipeCropNearPlayer(player: Player): boolean {
    const plot = this.resolveTargetPlot(player.x, player.y, player.getDirection(), true);
    if (!plot) return false;
    const node = this.nodes.get(this.keyOf(plot.gx, plot.gy));
    return Boolean(node && this.isCropRipe(node.state));
  }

  /**
   * TAHAP 5: PANEN HASIL BUMI SAAT SUDAH TUMBUH 24 JAM
   */
  public static tryHarvestNearPlayer(player: Player): boolean {
    const plot = this.resolveTargetPlot(player.x, player.y, player.getDirection(), true);
    if (!plot) return false;
    const key = this.keyOf(plot.gx, plot.gy);
    const node = this.nodes.get(key);
    if (!node || !node.state.seedId) return false;

    if (!this.isCropRipe(node.state)) {
      const remainingMs = (node.state.plantedAt || 0) + (node.state.growDurationMs || CROP_GROW_DURATION_24H_MS) - Date.now();
      const timeStr = formatCropRemainingTime(remainingMs);
      SoundManager.getInstance().playClick();
      player.showSpeechBubble(
        `⏳ Tanaman belum matang!\nSisa waktu tumbuh: ${timeStr}.`
      );
      return true;
    }

    const meta = node.meta || resolveCropMeta(node.state.seedId);
    const inv = InventoryManager.getInstance();
    const cropItem: IInventoryItem = {
      id: meta.cropId,
      name: meta.cropName,
      category: 'crop',
      rarity: meta.rarity,
      icon: meta.icon,
      quantity: meta.harvestQty,
      maxStack: 99,
      description: `Hasil panen kebun segar (${meta.cropName}). Jual di Pasar Rakyat atau konsumsi (+25 HP)!`,
      price: meta.sellPrice,
      usable: true,
      extraData: {
        hpRestore: meta.hpRestore,
      },
    };

    const added = inv.addItem(cropItem);
    if (!added) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('🎒 Tas penuh! Jual hasil panen dulu di Pasar Rakyat.');
      return true;
    }

    node.container.destroy();
    this.nodes.delete(key);
    const digImg = this.digTilesMap.get(key);
    if (digImg) {
      digImg.setData('hasCrop', false);
      digImg.clearTint();
    }
    this.persistStates();

    SoundManager.getInstance().playCoin();
    player.triggerExpression('smile');
    player.showSpeechBubble(
      `${meta.icon} PANEN BERHASIL [Langkah 5/5]!\n+${meta.harvestQty} ${meta.cropName} (+25 EXP) masuk Tas [B]!`
    );
    EventBus.emit('gain-exp', {
      amount: 25,
      source: 'farming_harvest',
    });
    EventBus.emit('farming-crop-harvested', {
      cropName: meta.cropName,
      qty: meta.harvestQty,
      exp: 25,
    });
    EventBus.emit('near-ripe-crop-changed', this.hasRipeCropNearPlayer(player));
    return true;
  }

  /**
   * TAHAP 1: CANGKUL LAHAN TANAH
   */
  public static handleHoeAction(player: Player): boolean {
    if (this.tryHarvestNearPlayer(player)) return true;

    const plot = this.resolveTargetPlot(player.x, player.y, player.getDirection(), false);
    if (!plot) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('⛏️ Cangkul hanya bisa digunakan di Lahan Kebun Tani [58, 5]!');
      return false;
    }

    const key = this.keyOf(plot.gx, plot.gy);
    const existing = this.nodes.get(key);

    if (existing) {
      if (existing.state.seedId) {
        if (this.isCropRipe(existing.state)) {
          return this.tryHarvestNearPlayer(player);
        }
        const remainingMs = (existing.state.plantedAt || 0) + (existing.state.growDurationMs || CROP_GROW_DURATION_24H_MS) - Date.now();
        const timeStr = formatCropRemainingTime(remainingMs);
        SoundManager.getInstance().playClick();
        player.showSpeechBubble(
          `⏳ Petak ini sudah ditanam (${timeStr}).`
        );
        return true;
      }
      if (existing.state.tilled && !existing.state.watered) {
        SoundManager.getInstance().playClick();
        player.showSpeechBubble('⛏️ Petak ini sudah dicangkul!\nLangkah 2: Siram air sekali dengan Tong Air [💧].');
        return true;
      }
      if (existing.state.tilled && existing.state.watered) {
        SoundManager.getInstance().playClick();
        player.showSpeechBubble('💧 Petak sudah disiram air!\nLangkah 3: Tanam bibit pilihanmu di sini [🌱].');
        return true;
      }
    }

    const state: IPlantedCropState = {
      gx: plot.gx,
      gy: plot.gy,
      tilled: true,
      watered: false,
      growDurationMs: CROP_GROW_DURATION_24H_MS,
    };
    this.spawnVisualNode(state);
    this.persistStates();

    SoundManager.getInstance().playClick();
    player.showSpeechBubble(
      `⛏️ [Langkah 1/5] Lahan dicangkul!\nLangkah 2: Siram air sekali dengan Tong Penyiram [💧].`
    );
    return true;
  }

  /**
   * TAHAP 2: SIRAM AIR SEKALI DENGAN TONG AIR (Batas Air 10/10)
   */
  public static handleWateringAction(player: Player): boolean {
    if (this.tryHarvestNearPlayer(player)) return true;

    const inv = InventoryManager.getInstance();
    const activeItem = inv.getActiveItem();
    if (!InventoryManager.isWateringCanItem(activeItem) || !activeItem) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('💧 Pilih Tong Penyiram Air di Hotbar [1-6] untuk menyiram!');
      return false;
    }

    const currentWater = activeItem.extraData?.water ?? 10;
    if (currentWater <= 0) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble(
        '🪣 Tong air kosong (0/10)!\nPergi ke bibir pantai atau lautan untuk mengisi air tong.'
      );
      return false;
    }

    const plot = this.resolveTargetPlot(player.x, player.y, player.getDirection(), true);
    if (!plot) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('💧 Arahkan ke petak tanah di Kebun Tani [58, 5] untuk menyiram!');
      return false;
    }

    const key = this.keyOf(plot.gx, plot.gy);
    const existing = this.nodes.get(key);

    if (!existing || !existing.state.tilled) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('⛏️ [Syarat 1] Cangkul tanahnya terlebih dahulu sebelum disiram air!');
      return false;
    }

    if (existing.state.watered) {
      if (existing.state.seedId) {
        const remainingMs = (existing.state.plantedAt || 0) + (existing.state.growDurationMs || CROP_GROW_DURATION_24H_MS) - Date.now();
        const timeStr = formatCropRemainingTime(remainingMs);
        SoundManager.getInstance().playClick();
        player.showSpeechBubble(`💧 Tanaman sudah basah segar! Siap panen: ${timeStr}.`);
        return true;
      }
      SoundManager.getInstance().playClick();
      player.showSpeechBubble('💧 [Langkah 2 Selesai] Tanah sudah disiram air!\nLangkah 3: Tanam bibit pilihanmu di sini [🌱].');
      return true;
    }

    // Konsumsi 1 takaran air tong
    const nextWater = Math.max(0, currentWater - 1);
    activeItem.extraData = { ...(activeItem.extraData || {}), water: nextWater, maxWater: 10 };
    activeItem.description = `Tong penyiram tanaman (${nextWater}/10 air). Tekan [F] di bibir pantai/laut untuk isi ulang.`;
    inv.updateItem(inv.getActiveSlotIndex(), activeItem);

    existing.state.watered = true;
    this.refreshSingleNodeVisual(existing, Date.now());
    this.persistStates();

    SoundManager.getInstance().playFishSplash();
    player.showSpeechBubble(
      `💧 [Langkah 2/5] Tanah disiram air!\nSisa air tong: ${nextWater}/10.
Langkah 3: Pilih bibit di Hotbar lalu tekan [F] untuk menanam [🌱].`
    );
    return true;
  }

  /**
   * TAHAP 3: TANAM BIBIT PILIHAN DI LAHAN YANG SUDAH DICANGKUL & DISIRAM
   */
  public static handleSeedAction(player: Player, seedItem: IInventoryItem): boolean {
    if (this.tryHarvestNearPlayer(player)) return true;

    const plot = this.resolveTargetPlot(player.x, player.y, player.getDirection(), false);
    if (!plot) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble(
        '🌱 Tanah ini bukan lahan kebun!\nPergi ke Kebun Tani (Timur Laut Peta [58, 5]) untuk menanam.'
      );
      return false;
    }

    const key = this.keyOf(plot.gx, plot.gy);
    const existing = this.nodes.get(key);

    if (!existing || !existing.state.tilled) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('⛏️ [Syarat 1 Belum Terpenuhi]\nCangkul lahan tanah ini terlebih dahulu sebelum menanam bibit!');
      return false;
    }

    if (!existing.state.watered) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('💧 [Syarat 2 Belum Terpenuhi]\nSiram air sekali dengan Tong Air [💧] sebelum menanam bibit!');
      return false;
    }

    if (existing.state.seedId) {
      if (this.isCropRipe(existing.state)) {
        return this.tryHarvestNearPlayer(player);
      }
      const remainingMs = (existing.state.plantedAt || 0) + (existing.state.growDurationMs || CROP_GROW_DURATION_24H_MS) - Date.now();
      const timeStr = formatCropRemainingTime(remainingMs);
      SoundManager.getInstance().playClick();
      player.showSpeechBubble(
        `🌿 Petak ini sedang tumbuh (${timeStr}).`
      );
      return true;
    }

    const consumed = InventoryManager.getInstance().consumeActiveItem(1);
    if (!consumed) {
      SoundManager.getInstance().playError();
      player.showSpeechBubble('🌱 Bibit habis! Beli bibit baru di Pasar Rakyat.');
      return false;
    }

    const meta = resolveCropMeta(consumed.id, consumed.icon, consumed.name);
    existing.state.seedId = consumed.id;
    existing.state.plantedAt = Date.now();
    existing.state.growDurationMs = CROP_GROW_DURATION_24H_MS;
    existing.meta = meta;

    this.refreshSingleNodeVisual(existing, Date.now());
    this.persistStates();

    SoundManager.getInstance().playItemUse();
    player.showSpeechBubble(
      `🌱 [Langkah 3/5] Berhasil menanam ${consumed.name}!
\nLangkah 4: Tunggu 24 jam hingga mekar siap panen [⏳].`
    );
    return true;
  }
}
