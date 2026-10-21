/**
 * ============================================================================
 * FILE: resources/js/game/core/InventoryManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelola Sistem Inventaris (Mini Hotbar & Tas Punggung 30 Slot) RadenWorld:
 * 1. Menyimpan dan memuat data inventaris ke localStorage ('raden_player_inventory').
 * 2. Menyediakan item bawaan petualang (Joran Pancing, Umpan Cacing, Apel Segar, Jamu).
 * 3. Menampung ikan hasil tangkapan dari minigame memancing secara otomatis.
 * 4. Mendukung penjualan item (Jual Ikan -> Tambah Gold) & konsumsi (Makan Apel/Jamu -> Pulihkan HP).
 * 5. Sinkronisasi perubahan ke UI Hotbar & Modal Tas via EventBus.
 * ============================================================================
 */

import { EventBus } from './EventBus';
import { SoundManager } from './SoundManager';
import { IFishData } from '../controllers/CharacterController';

export interface IInventoryItem {
  id: string;
  name: string;
  category: 'tool' | 'fish' | 'consumable' | 'material';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  icon: string;
  quantity: number;
  maxStack: number;
  description: string;
  price: number;
  diamondPrice?: number;
  usable?: boolean;
  extraData?: {
    weightKg?: number;
    hpRestore?: number;
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
    this.setupEventListeners();
  }

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  /**
   * Setup default starter items jika inventaris masih baru / kosong
   */
  private getDefaultItems(): (IInventoryItem | null)[] {
    const list: (IInventoryItem | null)[] = new Array(InventoryManager.MAX_SLOTS).fill(null);

    // Slot 1: Joran Pancing
    list[0] = {
      id: 'tool_rod_raden',
      name: 'Joran Pancing Bambu Raden',
      category: 'tool',
      rarity: 'Uncommon',
      icon: '🎣',
      quantity: 1,
      maxStack: 1,
      description: 'Joran pancing pusaka bambu kuning fleksibel. Tekan [F] di dekat dermaga air untuk memancing!',
      price: 150,
      usable: true,
    };

    // Slot 2: Umpan Cacing
    list[1] = {
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

    // Slot 3: Apel Manis Kebun
    list[2] = {
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

    // Slot 4: Jamu Segar Bugar
    list[3] = {
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

    // Slot 5: Koin Emas Pusaka
    list[4] = {
      id: 'mat_ancient_coin',
      name: 'Keping Logam Kuno Nusantara',
      category: 'material',
      rarity: 'Rare',
      icon: '🪙',
      quantity: 2,
      maxStack: 50,
      description: 'Koin kuno berkilau peninggalan kerajaan maritim. Bernilai jual tinggi di pasar!',
      price: 120,
    };

    return list;
  }

  /**
   * Memuat data inventaris dari localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('raden_player_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items = new Array(InventoryManager.MAX_SLOTS).fill(null);
          for (let i = 0; i < Math.min(parsed.length, InventoryManager.MAX_SLOTS); i++) {
            this.items[i] = parsed[i] || null;
          }
          return;
        }
      }
    } catch (e) {
      console.warn('[InventoryManager] Gagal parse inventory:', e);
    }

    this.items = this.getDefaultItems();
    this.saveToStorage();
  }

  /**
   * Menyimpan status inventaris ke localStorage
   */
  public saveToStorage(): void {
    try {
      localStorage.setItem('raden_player_inventory', JSON.stringify(this.items));
    } catch (e) {
      console.warn('[InventoryManager] Gagal menyimpan inventory:', e);
    }
    this.notifyUpdate();
  }

  /**
   * Mengambil semua item (30 slot)
   */
  public getItems(): (IInventoryItem | null)[] {
    return [...this.items];
  }

  /**
   * Mengambil item hotbar (6 slot pertama)
   */
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
   * Menambahkan item ke slot pertama yang kosong atau menumpuk (stack)
   */
  public addItem(item: IInventoryItem): boolean {
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
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i]) {
        this.items[i] = { ...item };
        this.saveToStorage();
        return true;
      }
    }

    // Tas penuh!
    return false;
  }

  /**
   * Menambahkan ikan tangkapan dari minigame memancing ke tas
   */
  public addCaughtFish(fish: IFishData): boolean {
    const icon = fish.rarity === 'Legendary' ? '🌟🐟' : fish.rarity === 'Rare' ? '💎🐟' : '🐟';
    const fishItem: IInventoryItem = {
      id: `fish_${fish.id}_${Date.now()}`,
      name: fish.name,
      category: 'fish',
      rarity: fish.rarity,
      icon,
      quantity: 1,
      maxStack: 10,
      description: `${fish.description} (Berat: ${fish.weightKg} kg). Dapat dijual di tas untuk mendapatkan Gold!`,
      price: fish.goldReward,
      diamondPrice: fish.diamondReward,
      usable: false,
      extraData: {
        weightKg: fish.weightKg,
      },
    };

    return this.addItem(fishItem);
  }

  /**
   * Menjual item dari tas dan menerima koin Gold & Diamond
   */
  public sellItem(slotIndex: number): { success: boolean; goldEarned: number; diamondEarned?: number } {
    if (slotIndex < 0 || slotIndex >= this.items.length) {
      return { success: false, goldEarned: 0 };
    }

    const item = this.items[slotIndex];
    if (!item) {
      return { success: false, goldEarned: 0 };
    }

    const goldEarned = item.price * item.quantity;
    const diamondEarned = (item.diamondPrice || 0) * item.quantity;

    // Tambahkan gold ke profil pemain
    try {
      const curGold = parseInt(localStorage.getItem('raden_player_gold') || '0', 10);
      const newGold = curGold + goldEarned;
      localStorage.setItem('raden_player_gold', newGold.toString());

      if (diamondEarned > 0) {
        const curDia = parseInt(localStorage.getItem('raden_player_diamonds') || '0', 10);
        localStorage.setItem('raden_player_diamonds', (curDia + diamondEarned).toString());
      }

      EventBus.emit('player-gold-changed', { gold: newGold, diamonds: diamondEarned });
    } catch (e) {}

    // Hapus item dari slot
    this.items[slotIndex] = null;
    this.saveToStorage();

    // Suara koin berdenting gembira
    SoundManager.getInstance().playCoin();

    return {
      success: true,
      goldEarned,
      diamondEarned,
    };
  }

  /**
   * Menggunakan / mengonsumsi item dari inventaris (misal Apel / Jamu)
   */
  public useItem(slotIndex: number): { success: boolean; message: string; hpRestore?: number } {
    if (slotIndex < 0 || slotIndex >= this.items.length) {
      return { success: false, message: 'Slot tidak valid' };
    }

    const item = this.items[slotIndex];
    if (!item) {
      return { success: false, message: 'Slot kosong' };
    }

    // Jika item adalah alat pemancing
    if (item.category === 'tool') {
      SoundManager.getInstance().playItemUse();
      this.setActiveSlotIndex(slotIndex < InventoryManager.HOTBAR_SLOTS ? slotIndex : 0);
      return {
        success: true,
        message: `Memegang ${item.name}! Tekan [F] di dekat perairan untuk memancing.`,
      };
    }

    // Jika item adalah makanan / konsumsi penyembuh
    if (item.category === 'consumable' && item.extraData?.hpRestore) {
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

    return { success: false, message: 'Item ini tidak dapat langsung digunakan.' };
  }

  /**
   * Menghitung total slot yang terisi
   */
  public getFilledCount(): number {
    return this.items.filter(it => it !== null).length;
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

    // Jika item sama dan bisa distack, gabungkan jumlahnya
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

    // Tukar slot (swap)
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

  private setupEventListeners(): void {
    // Tangkap hasil memancing otomatis masuk tas
    EventBus.on('fishing-caught', (data: { fish: IFishData }) => {
      if (data?.fish) {
        const added = this.addCaughtFish(data.fish);
        if (!added) {
          SoundManager.getInstance().playError();
          EventBus.emit('show-notification', {
            type: 'warning',
            message: '⚠️ Tas Punggungmu Penuh! Kosongkan slot dengan menjual ikan.',
          });
        }
      }
    });
  }
}
