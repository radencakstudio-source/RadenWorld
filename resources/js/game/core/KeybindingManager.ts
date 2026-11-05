/**
 * ============================================================================
 * FILE: resources/js/game/core/KeybindingManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelola Tombol Pintas & Kustomisasi Kontrol Keyboard PC (Keybindings Manager).
 * - Menyimpan pemetaan tombol pintas kustom pemain di localStorage.
 * - Mendukung penggantian tombol (rebind), reset ke pengaturan pabrik (default).
 * - Melacak status penekanan tombol real-time (pressedKeys) untuk pergerakan mulus & responsif.
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
  private pressedKeys: Set<string> = new Set();
  private hasInitializedGlobalEvents: boolean = false;

  private constructor() {
    this.keybindings = this.loadFromStorage();
    this.setupGlobalListeners();
  }

  public static getInstance(): KeybindingManager {
    if (!KeybindingManager.instance) {
      KeybindingManager.instance = new KeybindingManager();
    }
    return KeybindingManager.instance;
  }

  private setupGlobalListeners(): void {
    if (typeof window === 'undefined' || this.hasInitializedGlobalEvents) return;
    this.hasInitializedGlobalEvents = true;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Abaikan pencatatan jika sedang mengetik di input / textarea
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if (e.key) {
        this.pressedKeys.add(e.key.toLowerCase());
      }
      if (e.code) {
        this.pressedKeys.add(e.code.toLowerCase());
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key) {
        this.pressedKeys.delete(e.key.toLowerCase());
      }
      if (e.code) {
        this.pressedKeys.delete(e.code.toLowerCase());
      }
    });

    // Saat jendela blur (pindah tab atau hilang fokus), kosongkan semua tombol ditekan agar karakter tidak berjalan terus
    window.addEventListener('blur', () => {
      this.pressedKeys.clear();
    });
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

    // Normalisasi nama tombol untuk konsistensi tampilan & pembacaan
    let formattedKey = newKey.trim();
    const lk = formattedKey.toLowerCase();

    if (formattedKey === ' ' || lk === 'space' || lk === 'spacebar') formattedKey = 'Space';
    else if (lk === 'shift' || lk === 'shiftleft' || lk === 'shiftright') formattedKey = 'Shift';
    else if (lk === 'control' || lk === 'ctrl' || lk === 'controlleft' || lk === 'controlright') formattedKey = 'Ctrl';
    else if (lk === 'alt' || lk === 'altleft' || lk === 'altright') formattedKey = 'Alt';
    else if (lk === 'enter') formattedKey = 'Enter';
    else if (lk === 'arrowup' || lk === 'up') formattedKey = 'ArrowUp';
    else if (lk === 'arrowdown' || lk === 'down') formattedKey = 'ArrowDown';
    else if (lk === 'arrowleft' || lk === 'left') formattedKey = 'ArrowLeft';
    else if (lk === 'arrowright' || lk === 'right') formattedKey = 'ArrowRight';
    else if (formattedKey.length === 1) formattedKey = formattedKey.toUpperCase();

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
   * Mengecek apakah aksi tertentu saat ini sedang aktif (tombolnya sedang ditekan).
   * Digunakan oleh pergerakan karakter (WASD & Sprint) pada loop update frame rate.
   */
  public isActionActive(actionId: string): boolean {
    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement as HTMLElement | null;
      const tag = (activeEl?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || activeEl?.isContentEditable) {
        return false;
      }
    }

    const boundKey = this.getKey(actionId);
    if (!boundKey) return false;

    const bk = boundKey.toLowerCase();

    // Fallback Panah (Arrow Keys) untuk arah navigasi dasar
    if (actionId === 'moveUp' && (this.pressedKeys.has('arrowup') || this.pressedKeys.has('up'))) return true;
    if (actionId === 'moveDown' && (this.pressedKeys.has('arrowdown') || this.pressedKeys.has('down'))) return true;
    if (actionId === 'moveLeft' && (this.pressedKeys.has('arrowleft') || this.pressedKeys.has('left'))) return true;
    if (actionId === 'moveRight' && (this.pressedKeys.has('arrowright') || this.pressedKeys.has('right'))) return true;

    // Shift / Sprint
    if (bk === 'shift') {
      return this.pressedKeys.has('shift') || this.pressedKeys.has('shiftleft') || this.pressedKeys.has('shiftright');
    }

    // Ctrl
    if (bk === 'ctrl' || bk === 'control') {
      return this.pressedKeys.has('control') || this.pressedKeys.has('ctrl') || this.pressedKeys.has('controlleft') || this.pressedKeys.has('controlright');
    }

    // Alt
    if (bk === 'alt') {
      return this.pressedKeys.has('alt') || this.pressedKeys.has('altleft') || this.pressedKeys.has('altright');
    }

    // Space
    if (bk === 'space' || bk === 'spacebar') {
      return this.pressedKeys.has(' ') || this.pressedKeys.has('space');
    }

    // Karakter tunggal (A-Z, 0-9)
    if (boundKey.length === 1) {
      if (this.pressedKeys.has(bk)) return true;
      if (this.pressedKeys.has(`key${bk}`)) return true;
      if (this.pressedKeys.has(`digit${bk}`)) return true;
      if (this.pressedKeys.has(`numpad${bk}`)) return true;
    }

    return this.pressedKeys.has(bk);
  }

  /**
   * Mengecek apakah KeyboardEvent instan cocok dengan aksi yang ditentukan.
   */
  public matches(actionId: string, event: KeyboardEvent): boolean {
    const boundKey = this.getKey(actionId);
    if (!boundKey) return false;

    const ek = (event.key || '').toLowerCase();
    const ec = (event.code || '').toLowerCase();
    const bk = boundKey.toLowerCase();

    // Cek tombol khusus Space
    if ((bk === 'space' || bk === 'spacebar') && (ek === ' ' || ek === 'spacebar' || ec === 'space')) {
      return true;
    }

    // Cek tombol Shift
    if (bk === 'shift' && (ek === 'shift' || ec.startsWith('shift'))) {
      return true;
    }

    // Cek tombol Ctrl
    if ((bk === 'ctrl' || bk === 'control') && (ek === 'control' || ec.startsWith('control'))) {
      return true;
    }

    // Cek tombol Alt
    if (bk === 'alt' && (ek === 'alt' || ec.startsWith('alt'))) {
      return true;
    }

    // Cek tombol Enter
    if (bk === 'enter' && (ek === 'enter' || ec === 'enter' || ec === 'numpadenter')) {
      return true;
    }

    // Cek Tombol Chat (Default '/' atau Enter)
    if (actionId === 'chat') {
      if (ek === '/' || ec === 'slash' || ek === 'enter' || ec === 'enter') return true;
    }

    // Cek Tombol Zoom In (Default '+' atau '=' atau NumpadAdd)
    if (actionId === 'zoomIn') {
      if (ek === '+' || ek === '=' || ec === 'equal' || ec === 'numpadadd') return true;
    }

    // Cek Tombol Zoom Out (Default '-' atau NumpadSubtract)
    if (actionId === 'zoomOut') {
      if (ek === '-' || ec === 'minus' || ec === 'numpadsubtract') return true;
    }

    // Cek Panah (Arrow Keys)
    if (bk === 'arrowup' && (ek === 'arrowup' || ec === 'arrowup')) return true;
    if (bk === 'arrowdown' && (ek === 'arrowdown' || ec === 'arrowdown')) return true;
    if (bk === 'arrowleft' && (ek === 'arrowleft' || ec === 'arrowleft')) return true;
    if (bk === 'arrowright' && (ek === 'arrowright' || ec === 'arrowright')) return true;

    // Karakter 1 huruf/angka (case insensitive)
    if (boundKey.length === 1) {
      if (ek === bk) return true;
      if (ec === `key${bk}` || ec === `digit${bk}` || ec === `numpad${bk}`) return true;
    }

    return ek === bk || ec === bk || ec === `key${bk}`;
  }
}
