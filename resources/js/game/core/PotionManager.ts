/**
 * ============================================================================
 * FILE: resources/js/game/core/PotionManager.ts
 * ============================================================================
 * Manager Singleton Efek Ramuan Apotek Farma Raden (Potion & Buff System)
 * 
 * FITUR:
 * - Durasi 24 Jam Penuh (86.400 detik) untuk seluruh ramuan apotek.
 * - Fitur ON / OFF: Dapat diaktifkan atau dinonaktifkan kapan saja oleh pemain,
 *   sementara durasi 1 hari tetap berjalan tanpa terhenti.
 * - Sinkronisasi durasi real-time lintas scene (tidak hilang saat ganti gedung/scene).
 * - Penyimpanan aman di localStorage (tahan reload / switch tab).
 * - Notifikasi EventBus ('potion-buffs-updated', 'potion-expired', 'potion-toggle-changed').
 * ============================================================================
 */

import { EventBus } from './EventBus';

export interface IActivePotionBuff {
  potionType: string;
  potionName: string;
  icon: string;
  durationSec: number;
  startedAt: number;
  expiresAt: number; // Epoch timestamp (ms)
  enabled: boolean;  // Status Aktif (ON) atau Nonaktif (OFF)
}

const STORAGE_KEY = 'raden_active_potion_buffs';
export const POTION_DURATION_24H_SEC = 86400; // 24 Jam = 86.400 Detik (1 Hari)

const DEFAULT_POTION_META: Record<string, { name: string; icon: string; defaultSec: number }> = {
  speed: { name: 'Lari Cepat +60%', icon: '⚡', defaultSec: POTION_DURATION_24H_SEC },
  high_jump: { name: 'Lompat Tinggi 1.8x', icon: '🦘', defaultSec: POTION_DURATION_24H_SEC },
  triple_jump: { name: 'Triple Jump', icon: '🪶', defaultSec: POTION_DURATION_24H_SEC },
  luck_1: { name: 'Hoki Mancing Lv 1', icon: '🎣', defaultSec: POTION_DURATION_24H_SEC },
  luck_2: { name: 'Hoki Mancing Lv 2', icon: '🌊', defaultSec: POTION_DURATION_24H_SEC },
  luck_3: { name: 'Hoki Pusaka Lv 3', icon: '🌟', defaultSec: POTION_DURATION_24H_SEC },
  invisible: { name: 'Halimun Invisible', icon: '👻', defaultSec: POTION_DURATION_24H_SEC },
};

export class PotionManager {
  private static instance: PotionManager;
  private activeBuffs: Map<string, IActivePotionBuff> = new Map();
  private tickerInterval: number | null = null;

  private constructor() {
    this.loadFromStorage();
    this.startTicker();

    // Listener global konsumsi ramuan dari inventaris
    EventBus.on(
      'player-consumed-potion',
      (data: {
        potionType: string;
        potionName?: string;
        icon?: string;
        durationSec?: number;
      }) => {
        if (!data || !data.potionType) return;
        this.applyBuff(
          data.potionType,
          data.potionName,
          data.icon,
          data.durationSec || POTION_DURATION_24H_SEC
        );
      }
    );
  }

  public static getInstance(): PotionManager {
    if (!PotionManager.instance) {
      PotionManager.instance = new PotionManager();
    }
    return PotionManager.instance;
  }

  /**
   * Muat data efek aktif dari localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed: IActivePotionBuff[] = JSON.parse(raw);
      const now = Date.now();

      if (Array.isArray(parsed)) {
        for (const buff of parsed) {
          if (buff && buff.potionType && buff.expiresAt > now) {
            // Pastikan properti enabled ada (default true)
            if (typeof buff.enabled !== 'boolean') {
              buff.enabled = true;
            }
            this.activeBuffs.set(buff.potionType, buff);
          }
        }
      }
    } catch (e) {
      this.activeBuffs.clear();
    }
  }

  /**
   * Simpan efek aktif ke localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const arr = Array.from(this.activeBuffs.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  /**
   * Mulai ticker interval untuk membersihkan buff kadaluarsa dan memperbarui UI
   */
  private startTicker(): void {
    if (typeof window === 'undefined') return;
    if (this.tickerInterval !== null) return;

    this.tickerInterval = window.setInterval(() => {
      this.checkExpirations();
    }, 500);
  }

  /**
   * Cek efek yang habis masa berlakunya
   */
  private checkExpirations(): void {
    const now = Date.now();
    let hasChanged = false;

    for (const [type, buff] of this.activeBuffs.entries()) {
      if (now >= buff.expiresAt) {
        this.activeBuffs.delete(type);
        hasChanged = true;
        EventBus.emit('potion-expired', { potionType: type, potionName: buff.potionName });
      }
    }

    if (hasChanged) {
      this.saveToStorage();
      this.emitUpdate();
    }
  }

  /**
   * Terapkan buff ramuan baru (Aktif 24 Jam Penuh)
   */
  public applyBuff(
    potionType: string,
    potionName?: string,
    icon?: string,
    durationSec?: number
  ): void {
    const cleanType = (potionType || '').trim().toLowerCase();
    if (!cleanType) return;

    const meta = DEFAULT_POTION_META[cleanType] || {
      name: potionName || `Ramuan ${cleanType}`,
      icon: icon || '🧪',
      defaultSec: POTION_DURATION_24H_SEC,
    };

    const effectiveName = potionName || meta.name;
    const effectiveIcon = icon || meta.icon;
    // Seluruh ramuan bertahan selama 1 hari (86.400 detik)
    const effectiveDuration = durationSec && durationSec >= POTION_DURATION_24H_SEC ? durationSec : POTION_DURATION_24H_SEC;
    const now = Date.now();

    const existing = this.activeBuffs.get(cleanType);
    const buff: IActivePotionBuff = {
      potionType: cleanType,
      potionName: effectiveName,
      icon: effectiveIcon,
      durationSec: effectiveDuration,
      startedAt: now,
      expiresAt: now + effectiveDuration * 1000,
      enabled: existing ? existing.enabled : true,
    };

    this.activeBuffs.set(cleanType, buff);
    this.saveToStorage();
    this.emitUpdate();

    EventBus.emit('potion-buff-started', buff);
  }

  /**
   * Toggle ON/OFF efek ramuan.
   * Efek dapat dimatikan sementara tanpa menghentikan atau mereset durasi 24 jam!
   */
  public toggleBuff(potionType: string): boolean {
    const cleanType = (potionType || '').trim().toLowerCase();
    const buff = this.activeBuffs.get(cleanType);
    if (!buff) return false;

    buff.enabled = !buff.enabled;
    this.saveToStorage();
    this.emitUpdate();

    EventBus.emit('potion-toggle-changed', {
      potionType: cleanType,
      potionName: buff.potionName,
      enabled: buff.enabled,
    });

    return buff.enabled;
  }

  /**
   * Set status aktif (ON) atau nonaktif (OFF) secara eksplisit
   */
  public setBuffEnabled(potionType: string, enabled: boolean): void {
    const cleanType = (potionType || '').trim().toLowerCase();
    const buff = this.activeBuffs.get(cleanType);
    if (!buff) return;

    if (buff.enabled !== enabled) {
      buff.enabled = enabled;
      this.saveToStorage();
      this.emitUpdate();
      EventBus.emit('potion-toggle-changed', {
        potionType: cleanType,
        potionName: buff.potionName,
        enabled: buff.enabled,
      });
    }
  }

  /**
   * Hapus efek ramuan secara permanen (Dibuang oleh pemain)
   */
  public removeBuff(potionType: string): void {
    const cleanType = (potionType || '').trim().toLowerCase();
    if (this.activeBuffs.has(cleanType)) {
      const removed = this.activeBuffs.get(cleanType);
      this.activeBuffs.delete(cleanType);
      this.saveToStorage();
      this.emitUpdate();

      if (removed) {
        EventBus.emit('potion-expired', {
          potionType: cleanType,
          potionName: removed.potionName,
        });
      }
    }
  }

  /**
   * Cek apakah efek ramuan tertentu sedang aktif secara fungsional.
   * Mengembalikan TRUE hanya jika ramuan belum kadaluarsa DAN sedang diaktifkan (enabled === true).
   */
  public isBuffActive(potionType: string): boolean {
    const cleanType = (potionType || '').trim().toLowerCase();
    const buff = this.activeBuffs.get(cleanType);
    if (!buff) return false;

    if (Date.now() >= buff.expiresAt) {
      this.activeBuffs.delete(cleanType);
      this.saveToStorage();
      this.emitUpdate();
      return false;
    }

    // Jika sedang di-OFF-kan, gameplay fisika tidak menerapkannya, namun waktu 1 hari tetap berjalan
    return buff.enabled !== false;
  }

  /**
   * Dapatkan sisa waktu dalam detik dari durasi 24 jam
   */
  public getRemainingSec(potionType: string): number {
    const cleanType = (potionType || '').trim().toLowerCase();
    const buff = this.activeBuffs.get(cleanType);
    if (!buff) return 0;
    const remMs = buff.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remMs / 1000));
  }

  /**
   * Dapatkan seluruh daftar buff ramuan yang ada
   */
  public getActiveBuffs(): IActivePotionBuff[] {
    const now = Date.now();
    const result: IActivePotionBuff[] = [];

    for (const buff of this.activeBuffs.values()) {
      if (buff.expiresAt > now) {
        result.push(buff);
      }
    }

    return result;
  }

  /**
   * Pancarkan sinyal event pembaruan daftar buff ke UI Hotbar & Controller
   */
  public emitUpdate(): void {
    EventBus.emit('potion-buffs-updated', this.getActiveBuffs());
  }
}
