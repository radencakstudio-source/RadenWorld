/**
 * ============================================================================
 * FILE: resources/js/game/core/KeybindingManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelola Tombol Pintas & Kustomisasi Kontrol Keyboard PC (Keybindings Manager).
 * - Menyimpan pemetaan tombol pintas kustom pemain di localStorage.
 * - Mendukung penggantian tombol (rebind), reset ke pengaturan pabrik (default).
 * - Memancarkan event 'keybindings-updated' ke seluruh subsistem game.
 * ============================================================================
 */

import { EventBus } from './EventBus';

export type KeybindingCategory = 'movement' | 'interaction' | 'communication' | 'hotbar' | 'camera';

export interface IKeybindingDefinition {
  id: string;
  label: string;
  desc: string;
  category: KeybindingCategory;
  defaultKey: string;
  currentKey: string;
}

export const DEFAULT_PC_KEYBINDINGS: Record<string, string> = {
  moveUp: 'W',
  moveDown: 'S',
  moveLeft: 'A',
  moveRight: 'D',
  sprint: 'Shift',
  jump: 'Space',
  interact: 'E',
  fish: 'F',
  backpack: 'B',
  map: 'M',
  chat: '/',
  emote: 'T',
  hotbar1: '1',
  hotbar2: '2',
  hotbar3: '3',
  hotbar4: '4',
  hotbar5: '5',
  hotbar6: '6',
  zoomIn: '+',
  zoomOut: '-',
};

export const KEYBINDING_METADATA: Record<string, { label: string; desc: string; category: KeybindingCategory }> = {
  moveUp: { label: 'Bergerak Maju / Atas', desc: 'Jalan karakter ke arah utara', category: 'movement' },
  moveDown: { label: 'Bergerak Mundur / Bawah', desc: 'Jalan karakter ke arah selatan', category: 'movement' },
  moveLeft: { label: 'Bergerak ke Kiri', desc: 'Jalan karakter ke arah barat', category: 'movement' },
  moveRight: { label: 'Bergerak ke Kanan', desc: 'Jalan karakter ke arah timur', category: 'movement' },
  sprint: { label: 'Lari Cepat (Sprint)', desc: 'Meningkatkan kecepatan lari karakter', category: 'movement' },
  jump: { label: 'Lompat (Jump)', desc: 'Melompati rintangan dan pijakan', category: 'movement' },
  interact: { label: 'Interaksi & Pintu', desc: 'Bicara ke NPC, masuk pintu, panen tanaman', category: 'interaction' },
  fish: { label: 'Mancing / Alat Kerja', desc: 'Mengayun joran pancing di dekat dermaga air', category: 'interaction' },
  backpack: { label: 'Buka Tas (Inventori)', desc: 'Membuka tas ransel & slot perlengkapan', category: 'interaction' },
  map: { label: 'Peta Dunia (Full Map)', desc: 'Buka peta atlas panorama seluruh wilayah', category: 'interaction' },
  chat: { label: 'Buka Kotak Obrolan', desc: 'Fokuskan kursor ke input chat global', category: 'communication' },
  emote: { label: 'Menu Emote & Reaksi', desc: 'Membuka pilihan ekspresi & animasi emotikon', category: 'communication' },
  hotbar1: { label: 'Pilih Slot Hotbar 1', desc: 'Gunakan alat / item pada slot 1', category: 'hotbar' },
  hotbar2: { label: 'Pilih Slot Hotbar 2', desc: 'Gunakan alat / item pada slot 2', category: 'hotbar' },
  hotbar3: { label: 'Pilih Slot Hotbar 3', desc: 'Gunakan alat / item pada slot 3', category: 'hotbar' },
  hotbar4: { label: 'Pilih Slot Hotbar 4', desc: 'Gunakan alat / item pada slot 4', category: 'hotbar' },
  hotbar5: { label: 'Pilih Slot Hotbar 5', desc: 'Gunakan alat / item pada slot 5', category: 'hotbar' },
  hotbar6: { label: 'Pilih Slot Hotbar 6', desc: 'Gunakan alat / item pada slot 6', category: 'hotbar' },
  zoomIn: { label: 'Perbesar Kamera (Zoom In)', desc: 'Mendekatkan pandangan kamera ke karakter', category: 'camera' },
  zoomOut: { label: 'Perkecil Kamera (Zoom Out)', desc: 'Memperluas panorama pandangan dunia', category: 'camera' },
};

const STORAGE_KEY = 'raden_pc_keybindings';

export class KeybindingManager {
  private static instance: KeybindingManager;
  private keybindings: Record<string, string>;

  private constructor() {
    this.keybindings = this.loadFromStorage();
  }

  public static getInstance(): KeybindingManager {
    if (!KeybindingManager.instance) {
      KeybindingManager.instance = new KeybindingManager();
    }
    return KeybindingManager.instance;
  }

  private loadFromStorage(): Record<string, string> {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return { ...DEFAULT_PC_KEYBINDINGS, ...JSON.parse(raw) };
        }
      }
    } catch (e) {
      console.warn('[KeybindingManager] Gagal memuat keybindings dari localStorage:', e);
    }
    return { ...DEFAULT_PC_KEYBINDINGS };
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keybindings));
      }
    } catch (e) {
      console.warn('[KeybindingManager] Gagal menyimpan keybindings:', e);
    }
  }

  public getKey(actionId: string): string {
    return this.keybindings[actionId] || DEFAULT_PC_KEYBINDINGS[actionId] || '';
  }

  public getAllKeybindings(): Record<string, string> {
    return { ...this.keybindings };
  }

  public getDefinitions(): IKeybindingDefinition[] {
    return Object.keys(KEYBINDING_METADATA).map((id) => {
      const meta = KEYBINDING_METADATA[id];
      return {
        id,
        label: meta.label,
        desc: meta.desc,
        category: meta.category,
        defaultKey: DEFAULT_PC_KEYBINDINGS[id],
        currentKey: this.getKey(id),
      };
    });
  }

  public setKey(actionId: string, newKey: string): boolean {
    if (!KEYBINDING_METADATA[actionId]) return false;

    // Normalisasi nama tombol untuk konsistensi tampilan
    let formattedKey = newKey.trim();
    if (formattedKey === ' ') formattedKey = 'Space';
    if (formattedKey.toLowerCase() === 'spacebar') formattedKey = 'Space';
    if (formattedKey.length === 1) formattedKey = formattedKey.toUpperCase();

    this.keybindings[actionId] = formattedKey;
    this.saveToStorage();
    EventBus.emit('keybindings-updated', this.getAllKeybindings());
    return true;
  }

  public resetToDefaults(): void {
    this.keybindings = { ...DEFAULT_PC_KEYBINDINGS };
    this.saveToStorage();
    EventBus.emit('keybindings-updated', this.getAllKeybindings());
  }

  /**
   * Mengecek apakah KeyboardEvent cocok dengan aksi yang ditentukan.
   */
  public matches(actionId: string, event: KeyboardEvent): boolean {
    const boundKey = this.getKey(actionId);
    if (!boundKey) return false;

    const eventKey = event.key;
    const eventCode = event.code;

    // Cek tombol khusus Space
    if (boundKey.toLowerCase() === 'space' && (eventKey === ' ' || eventCode === 'Space')) {
      return true;
    }

    // Cek tombol Shift
    if (boundKey.toLowerCase() === 'shift' && (eventKey === 'Shift' || eventCode.includes('Shift'))) {
      return true;
    }

    // Cek karakter 1 huruf (case insensitive)
    if (boundKey.length === 1 && eventKey.length === 1) {
      return boundKey.toUpperCase() === eventKey.toUpperCase();
    }

    return boundKey.toLowerCase() === eventKey.toLowerCase() || boundKey.toLowerCase() === eventCode.toLowerCase();
  }
}

