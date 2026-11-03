/**
 * ============================================================================
 * FILE: resources/js/game/core/InventoryManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelola Sistem Inventaris (Mini Hotbar & Tas Punggung 30 Slot) RadenWorld:
 * 1. Menyimpan dan memuat data inventaris ke localStorage ('raden_player_inventory').
 * 2. Menyediakan item bawaan petualang (Joran Pancing, Bibit Padi, Cangkul, Penyiram, Apel, Jamu).
 * 3. Menampung ikan tangkapan dan hasil panen kebun dengan sistem tumpukan (stack) rapi.
 * 4. Mendukung penjualan item (Koin Emas G) & konsumsi makanan/ramuan.
 * 5. Mendukung tombol fleksibel [F] & Mobile kontekstual sesuai item aktif di Hotbar.
 * ============================================================================
 */

import { EventBus } from './EventBus';
import { SoundManager } from './SoundManager';
import type { IFishData } from '../controllers/CharacterController';

export interface IInventoryItem {
  id: string;
  name: string;
  category: 'tool' | 'fish' | 'consumable' | 'material' | 'seed' | 'crop';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  icon: string;
  quantity: number;
  maxStack: number;
  description: string;
  price: number;
  usable?: boolean;
  extraData?: {
    weightKg?: number;
    hpRestore?: number;
    seedId?: string;
    potionType?: string;
    durationSec?: number;
    [key: string]: any;
  };
}

export class InventoryManager {
  private static instance: InventoryManager;
  public static readonly MAX_SLOTS = 30;
  public static readonly HOTBAR_SLOTS = 6;

  private items: (IInventoryItem | null)[] = [];
  private activeSlotIndex: number = 0; // 0 s/d 5 (Slot Hotbar)

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  public static isSeedItem(item: IInventoryItem | null | undefined): boolean {
    if (!item) return false;
    return item.category === 'seed' || item.id.startsWith('seed_');
  }

  public static isRodItem(item: IInventoryItem | null | undefined): boolean {
    if (!item) return false;
    return item.id.startsWith('tool_rod') || item.id.startsWith('tool_fishing_rod');
  }

  public static isHoeItem(item: IInventoryItem | null | undefined): boolean {
    if (!item) return false;
    return item.id.startsWith('tool_hoe');
  }

  public static isWateringCanItem(item: IInventoryItem | null | undefined): boolean {
    if (!item) return false;
    return item.id.startsWith('tool_watering');
  }

  /**
   * Setup default starter items jika inventaris masih baru / kosong
   */
  private getDefaultItems(): (IInventoryItem | null)[] {
    const list: (IInventoryItem | null)[] = new Array(InventoryManager.MAX_SLOTS).fill(null);

    // Slot 1 [Hotbar 1]: Joran Pancing
    list[0] = {
      id: 'tool_rod_raden',
      name: 'Joran Pancing Bambu Raden',
      category: 'tool',
      rarity: 'Uncommon',
      icon: '🎣',
      quantity: 1,
      maxStack: 1,
      description: 'Joran pancing pusaka bambu kuning fleksibel. Pegang di Hotbar lalu tekan [F] di tepi air untuk memancing!',
      price: 150,
      usable: true,
    };

    // Slot 2 [Hotbar 2]: Bibit Padi Pandanwangi
    list[1] = {
      id: 'seed_padi_pandanwangi',
      name: 'Bibit Padi Pandanwangi Cianjur',
      category: 'seed',
      rarity: 'Common',
      icon: '🌾',
      quantity: 10,
      maxStack: 99,
      description: 'Bibit padi harum unggulan. Pegang di Hotbar lalu tekan [F] di lahan Kebun Tani untuk menanam!',
      price: 8,
      usable: true,
    };

    // Slot 3 [Hotbar 3]: Cangkul Petani
    list[2] = {
      id: 'tool_hoe_steel',
      name: 'Cangkul Petani Baja Tempa',
      category: 'tool',
      rarity: 'Uncommon',
      icon: '⛏️',
      quantity: 1,
      maxStack: 1,
      description: 'Cangkul baja kuat untuk menggemburkan petak tanah kebun & memanen tanaman dengan tombol [F].',
      price: 120,
      usable: true,
    };

    // Slot 4 [Hotbar 4]: Tong Penyiram Air
    list[3] = {
      id: 'tool_watering_can',
      name: 'Tong Penyiram Air',
      category: 'tool',
      rarity: 'Uncommon',
      icon: '🪣',
      quantity: 1,
      maxStack: 1,
      description: 'Tong penyiram tanaman (10/10 air). Syarat menanam: 1. cangkul, 2. siram air, 3. tanam bibit, 4. tunggu 24 jam, 5. panen. Tekan [F] di bibir pantai/laut untuk isi ulang.',
      price: 90,
      usable: true,
      extraData: { water: 10, maxWater: 10 },
    };

    // Slot 5 [Hotbar 5]: Apel Manis Kebun
    list[4] = {
      id: 'cons_apple',
      name: 'Apel Merah Manis Kebun',
      category: 'consumable',
      rarity: 'Common',
      icon: '🍎',
      quantity: 8,
      maxStack: 20,
      description: 'Buah apel renyah hasil panen kebun lokal. Pulihkan 25 HP saat dikonsumsi.',
      price: 15,
      usable: true,
      extraData: { hpRestore: 25 },
    };

    // Slot 6 [Hotbar 6]: Jamu Segar Bugar
    list[5] = {
      id: 'cons_jamu',
      name: 'Jamu Beras Kencur Segar',
      category: 'consumable',
      rarity: 'Uncommon',
      icon: '🧪',
      quantity: 3,
      maxStack: 10,
      description: 'Ramuan tradisional nusantara yang menyegarkan badan. Pulihkan 60 HP seketika!',
      price: 45,
      usable: true,
      extraData: { hpRestore: 60 },
    };

    // Slot 7: Umpan Cacing
    list[6] = {
      id: 'tool_bait_worm',
      name: 'Umpan Cacing Tanah Segar',
      category: 'material',
      rarity: 'Common',
      icon: '🪱',
      quantity: 35,
      maxStack: 99,
      description: 'Cacing tanah gemuk berprotein tinggi untuk memancing ikan lele, mujair, dan patin.',
      price: 5,
    };

    return list;
  }

  /**
   * Memuat data inventaris dari localStorage & menormalisasi item lama
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('raden_player_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items = new Array(InventoryManager.MAX_SLOTS).fill(null);
          for (let i = 0; i < Math.min(parsed.length, InventoryManager.MAX_SLOTS); i++) {
            const raw = parsed[i];
            if (!raw) {
              this.items[i] = null;
              continue;
            }
            // Normalisasi ID legacy yang memiliki akhiran timestamp _17...
            const cleanId = String(raw.id || '').replace(/_\d{10,}$/, '');
            let cat = raw.category;
            if (cleanId.startsWith('seed_')) cat = 'seed';
            else if (cleanId.startsWith('crop_')) cat = 'crop';

            const normalized: IInventoryItem = {
              ...raw,
              id: cleanId || raw.id,
              category: cat,
              usable: cat === 'seed' || cat === 'tool' || cat === 'consumable' ? true : raw.usable,
            };
            if (InventoryManager.isWateringCanItem(normalized)) {
              if (!normalized.extraData || typeof normalized.extraData.water !== 'number') {
                normalized.extraData = { ...(normalized.extraData || {}), water: 10, maxWater: 10 };
              }
            }
            delete (normalized as any).diamondPrice;
            this.items[i] = normalized;
          }

          // Pastikan pemain lama tetap punya minimal 1 joran & 1 bibit awal jika belum pernah punya
          const hasAnyRod = this.items.some((it) => InventoryManager.isRodItem(it));
          if (!hasAnyRod) {
            const emptyIdx = this.items.findIndex((it) => it === null);
            if (emptyIdx >= 0) {
              this.items[emptyIdx] = this.getDefaultItems()[0];
            }
          }
          const defaults = this.getDefaultItems();
          const hasSeed = this.items.some((it) => InventoryManager.isSeedItem(it));
          const hasHoe = this.items.some((it) => InventoryManager.isHoeItem(it));
          const hasWatering = this.items.some((it) => InventoryManager.isWateringCanItem(it));
          if (!hasSeed && defaults[1]) this.addItem({ ...defaults[1] });
          if (!hasHoe && defaults[2]) this.addItem({ ...defaults[2] });
          if (!hasWatering && defaults[3]) this.addItem({ ...defaults[3] });
          return;
        }
      }
    } catch (e) {
      console.warn('[InventoryManager] Gagal parse inventory:', e);
    }

    localStorage.setItem('raden_farming_starter_v1', '1');
    this.items = this.getDefaultItems();
    this.saveToStorage();
  }

  public saveToStorage(): void {
    try {
      localStorage.setItem('raden_player_inventory', JSON.stringify(this.items));
    } catch (e) {
      console.warn('[InventoryManager] Gagal menyimpan inventory:', e);
    }
    this.notifyUpdate();
  }

  public getItems(): (IInventoryItem | null)[] {
    return [...this.items];
  }

  public getHotbarItems(): (IInventoryItem | null)[] {
    return this.items.slice(0, InventoryManager.HOTBAR_SLOTS);
  }

  public getActiveSlotIndex(): number {
    return this.activeSlotIndex;
  }

  public setActiveSlotIndex(index: number): void {
    if (index >= 0 && index < InventoryManager.HOTBAR_SLOTS) {
      this.activeSlotIndex = index;
      SoundManager.getInstance().playClick();
      this.notifyUpdate();
    }
  }

  public getActiveItem(): IInventoryItem | null {
    return this.items[this.activeSlotIndex] || null;
  }

  /**
   * Memperbarui data item pada slot tertentu (misal sisa air pada tong penyiram)
   */
  public updateItem(slotIndex: number, item: IInventoryItem): void {
    if (slotIndex >= 0 && slotIndex < this.items.length) {
      this.items[slotIndex] = { ...item };
      this.saveToStorage();
      EventBus.emit('inventory-updated', this.getItems());
    }
  }

  /**
   * Mengurangi jumlah item pada slot aktif (misal saat menanam 1 biji)
   */
  public consumeActiveItem(qty: number = 1): IInventoryItem | null {
    const item = this.items[this.activeSlotIndex];
    if (!item || item.quantity < qty) return null;
    const snapshot = { ...item };
    item.quantity -= qty;
    if (item.quantity <= 0) {
      this.items[this.activeSlotIndex] = null;
    }
    this.saveToStorage();
    return snapshot;
  }

  /**
   * Menambahkan item ke slot pertama yang kosong atau menumpuk (stack)
   */
  public addItem(rawItem: IInventoryItem): boolean {
    const item: IInventoryItem = { ...rawItem };
    delete (item as any).diamondPrice;

    // 1. Coba stack dengan item identik jika ada dan belum penuh
    for (let i = 0; i < this.items.length; i++) {
      const existing = this.items[i];
      if (existing && existing.id === item.id && existing.quantity < existing.maxStack) {
        const spaceLeft = existing.maxStack - existing.quantity;
        const addQty = Math.min(spaceLeft, item.quantity);
        existing.quantity += addQty;
        item.quantity -= addQty;
        if (item.quantity <= 0) {
          this.saveToStorage();
          return true;
        }
      }
    }

    // 2. Masukkan ke slot kosong pertama
    while (item.quantity > 0) {
      const emptyIdx = this.items.findIndex((it) => it === null);
      if (emptyIdx === -1) {
        this.saveToStorage();
        return false;
      }
      const putQty = Math.min(item.maxStack, item.quantity);
      this.items[emptyIdx] = { ...item, quantity: putQty };
      item.quantity -= putQty;
    }

    this.saveToStorage();
    return true;
  }

  /**
   * Menambahkan ikan tangkapan dari minigame memancing ke tas (Stackable Rapi!)
   */
  public addCaughtFish(fish: IFishData): boolean {
    const icon = fish.rarity === 'Legendary' ? '🌟🐟' : fish.rarity === 'Rare' ? '🐠' : '🐟';
    const fishItem: IInventoryItem = {
      id: `fish_${fish.id}`,
      name: fish.name,
      category: 'fish',
      rarity: fish.rarity,
      icon,
      quantity: 1,
      maxStack: 20,
      description: `${fish.description} (Berat rata-rata: ${fish.weightKg} kg). Dapat dijual di Pasar atau Tas untuk mendapatkan Koin Emas!`,
      price: fish.goldReward,
      usable: false,
      extraData: {
        weightKg: fish.weightKg,
      },
    };

    return this.addItem(fishItem);
  }

  /**
   * Menjual item dari tas dan menerima Koin Emas (Gold)
   */
  public sellItem(slotIndex: number): { success: boolean; goldEarned: number } {
    if (slotIndex < 0 || slotIndex >= this.items.length) {
      return { success: false, goldEarned: 0 };
    }

    const item = this.items[slotIndex];
    if (!item) {
      return { success: false, goldEarned: 0 };
    }

    const goldEarned = item.price * item.quantity;

    try {
      const curGold = parseInt(localStorage.getItem('raden_player_gold') || '0', 10);
      const newGold = curGold + goldEarned;
      localStorage.setItem('raden_player_gold', newGold.toString());
      EventBus.emit('player-gold-changed', { gold: newGold, deltaGold: goldEarned });
    } catch (e) {}

    this.items[slotIndex] = null;
    this.saveToStorage();
    SoundManager.getInstance().playCoin();

    return {
      success: true,
      goldEarned,
    };
  }

  /**
   * Menggunakan / memegang item dari inventaris
   */
  public useItem(slotIndex: number): { success: boolean; message: string; hpRestore?: number } {
    if (slotIndex < 0 || slotIndex >= this.items.length) {
      return { success: false, message: 'Slot tidak valid' };
    }

    const item = this.items[slotIndex];
    if (!item) {
      return { success: false, message: 'Slot kosong' };
    }

    // Jika item berada di luar hotbar dan merupakan tool / seed, pindahkan ke slot hotbar aktif agar mudah dipakai dengan [F]
    if (item.category === 'tool' || InventoryManager.isSeedItem(item)) {
      SoundManager.getInstance().playItemUse();
      if (slotIndex >= InventoryManager.HOTBAR_SLOTS) {
        this.moveItem(slotIndex, this.activeSlotIndex);
      } else {
        this.setActiveSlotIndex(slotIndex);
      }
      if (InventoryManager.isSeedItem(item)) {
        return {
          success: true,
          message: `Memegang ${item.name}! Pergi ke lahan Kebun Tani lalu tekan [F] untuk menanam.`,
        };
      }
      if (InventoryManager.isRodItem(item)) {
        return {
          success: true,
          message: `Memegang ${item.name}! Tekan [F] di tepi air/dermaga untuk memancing.`,
        };
      }
      return {
        success: true,
        message: `Memegang ${item.name}! Tekan [F] di area kebun untuk bekerja.`,
      };
    }

    // Jika item adalah ramuan khusus apotek
    if (item.category === 'consumable' && (item.extraData?.potionType || item.id.startsWith('pot_'))) {
      const potionType = item.extraData?.potionType || item.id.replace(/^pot_/, '');
      const durationSec = item.extraData?.durationSec || 86400;
      item.quantity--;
      if (item.quantity <= 0) {
        this.items[slotIndex] = null;
      }
      this.saveToStorage();

      SoundManager.getInstance().playItemUse();
      EventBus.emit('player-consumed-potion', {
        potionType,
        potionName: item.name,
        icon: item.icon,
        durationSec,
      });

      return {
        success: true,
        message: `Teguk! Meminum ${item.name}! Efek aktif selama 24 jam (Bisa On/Off di atas Hotbar).`,
      };
    }

    // Jika item adalah makanan / hasil panen yang memulihkan HP
    if ((item.category === 'consumable' || item.category === 'crop') && item.extraData?.hpRestore) {
      const hp = item.extraData.hpRestore;
      item.quantity--;
      if (item.quantity <= 0) {
        this.items[slotIndex] = null;
      }
      this.saveToStorage();

      SoundManager.getInstance().playItemUse();
      EventBus.emit('player-consumed-item', { hpRestore: hp, itemName: item.name });

      return {
        success: true,
        message: `Nyam! Memakan ${item.name}, memulihkan +${hp} HP! ✨`,
        hpRestore: hp,
      };
    }

    return { success: false, message: 'Item ini dapat dijual di Pasar Rakyat [Beli/Jual].' };
  }

  public getFilledCount(): number {
    return this.items.filter((it) => it !== null).length;
  }

  public getItemCount(): number {
    return this.getFilledCount();
  }

  public getAllItems(): (IInventoryItem | null)[] {
    return this.getItems();
  }

  public getItemAt(index: number): IInventoryItem | null {
    if (index < 0 || index >= this.items.length) return null;
    return this.items[index] || null;
  }

  public consumeItem(index: number): boolean {
    return this.useItem(index).success;
  }

  public moveItem(fromIndex: number, toIndex: number): boolean {
    if (
      fromIndex < 0 ||
      fromIndex >= this.items.length ||
      toIndex < 0 ||
      toIndex >= this.items.length ||
      fromIndex === toIndex
    ) {
      return false;
    }

    const source = this.items[fromIndex];
    const target = this.items[toIndex];

    if (source && target && source.id === target.id && target.quantity < target.maxStack) {
      const spaceLeft = target.maxStack - target.quantity;
      const transferQty = Math.min(spaceLeft, source.quantity);
      target.quantity += transferQty;
      source.quantity -= transferQty;

      if (source.quantity <= 0) {
        this.items[fromIndex] = null;
      }
      this.saveToStorage();
      return true;
    }

    this.items[fromIndex] = target;
    this.items[toIndex] = source;
    this.saveToStorage();
    return true;
  }

  private notifyUpdate(): void {
    EventBus.emit('inventory-updated', {
      items: this.items,
      hotbar: this.getHotbarItems(),
      activeSlot: this.activeSlotIndex,
      filledCount: this.getFilledCount(),
      maxSlots: InventoryManager.MAX_SLOTS,
    });
  }
}
