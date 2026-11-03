/**
 * ============================================================================
 * FILE: resources/js/game/core/PotionManager.ts
 * ============================================================================
 * Manager Singleton Efek Ramuan Apotek Farma Raden (Potion & Buff System)
 * 
 * FITUR:
 * - Sinkronisasi durasi real-time lintas scene (tidak hilang saat ganti gedung/scene).
 * - Penyimpanan aman di localStorage (tahan reload / switch tab).
 * - Notifikasi EventBus ('potion-buffs-updated', 'potion-expired') untuk UI Hotbar & Phaser.
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
}

const STORAGE_KEY = 'raden_active_potion_buffs';

const DEFAULT_POTION_META: Record<string, { name: string; icon: string; defaultSec: number }> = {
  speed: { name: 'Lari Cepat +60%', icon: '⚡', defaultSec: 60 },
  high_jump: { name: 'Lompat Tinggi 1.8x', icon: '🦘', defaultSec: 60 },
  triple_jump: { name: 'Triple Jump', icon: '🪶', defaultSec: 60 },
  luck_1: { name: 'Hoki Mancing Lv 1', icon: '🎣', defaultSec: 180 },
  luck_2: { name: 'Hoki Mancing Lv 2', icon: '🌊', defaultSec: 180 },
  luck_3: { name: 'Hoki Pusaka Lv 3', icon: '🌟', defaultSec: 180 },
  invisible: { name: 'Halimun Invisible', icon: '👻', defaultSec: 60 },
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
          data.durationSec
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
   * Terapkan buff ramuan baru atau perpanjang durasi
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
      defaultSec: 60,
    };

    const effectiveName = potionName || meta.name;
    const effectiveIcon = icon || meta.icon;
    const effectiveDuration = durationSec && durationSec > 0 ? durationSec : meta.defaultSec;
    const now = Date.now();

    const buff: IActivePotionBuff = {
      potionType: cleanType,
      potionName: effectiveName,
      icon: effectiveIcon,
      durationSec: effectiveDuration,
      startedAt: now,
      expiresAt: now + effectiveDuration * 1000,
    };

    this.activeBuffs.set(cleanType, buff);
    this.saveToStorage();
    this.emitUpdate();

    EventBus.emit('potion-buff-started', buff);
  }

  /**
   * Hapus efek ramuan secara manual (Batal/Expired)
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
   * Cek apakah efek ramuan tertentu sedang aktif
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

    return true;
  }

  /**
   * Dapatkan sisa waktu dalam detik
   */
  public getRemainingSec(potionType: string): number {
    const cleanType = (potionType || '').trim().toLowerCase();
    const buff = this.activeBuffs.get(cleanType);
    if (!buff) return 0;
    const remMs = buff.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remMs / 1000));
  }

  /**
   * Dapatkan seluruh daftar buff ramuan yang sedang aktif
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

