/**
 * ============================================================================
 * FILE: resources/js/game/ui/Hotbar.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mini Inventaris / Quick Bar di Tengah Bawah Layar (Cozycore Clay-Pixel):
 * 1. 6 Slot cepat (Slot 1-6) dengan hotkey [1] s/d [6].
 * 2. Panel Clay-Pixel (#FFF8EA, outline 2px #5C3A21, slot aktif #FFAE6D, badge #A8E6CF).
 * 3. Tanpa efek :hover & tanpa glow; umpan balik tekan :active yang tegas.
 * 4. Tombol Tas [B] untuk membuka inventaris lengkap 30 slot.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { PotionManager, IActivePotionBuff } from '../core/PotionManager';
import { KeybindingManager } from '../core/KeybindingManager';
import { Backpack, X, RefreshCw } from 'lucide-react';
import { ThemeSettings } from '../core/ThemeManager';

interface HotbarProps {
  onOpenBackpack: () => void;
  isBackpackOpen?: boolean;
  isFullMapOpen?: boolean;
  themeSettings?: ThemeSettings;
}

export const Hotbar: React.FC<HotbarProps> = React.memo(({ onOpenBackpack, isBackpackOpen = false, isFullMapOpen: propIsFullMapOpen, themeSettings }) => {
  const inv = InventoryManager.getInstance();
  const sound = SoundManager.getInstance();

  const [hotbarItems, setHotbarItems] = useState<(IInventoryItem | null)[]>(inv.getHotbarItems());
  const [activeSlot, setActiveSlot] = useState<number>(inv.getActiveSlotIndex());
  const [totalItemCount, setTotalItemCount] = useState<number>(inv.getItemCount());
  const [isFullMapOpen, setIsFullMapOpen] = useState<boolean>(false);
  const [isDialogueOpen, setIsDialogueOpen] = useState<boolean>(false);
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // Status Layang-Layang Terbang & Mode Kendali
  const [kiteState, setKiteState] = useState<{ isFlying: boolean; mode: 'kite' | 'character' }>({
    isFlying: false,
    mode: 'kite',
  });

  useEffect(() => {
    const handleKiteChange = (data: { isFlying: boolean; mode: 'kite' | 'character' }) => {
      setKiteState(data);
    };
    EventBus.on('kite-mode-changed', handleKiteChange);
    return () => {
      EventBus.off('kite-mode-changed', handleKiteChange);
    };
  }, []);

  const handleToggleKiteMode = () => {
    sound.playClick();
    EventBus.emit('player-kite-mode-toggle');
  };

  const handleStopKite = () => {
    sound.playClick();
    EventBus.emit('player-kite-toggle');
  };

  // Status Buff Ramuan Aktif (Apotek Farma)
  const [activeBuffs, setActiveBuffs] = useState<IActivePotionBuff[]>(() =>
    PotionManager.getInstance().getActiveBuffs()
  );

  useEffect(() => {
    const potionMgr = PotionManager.getInstance();
    const handleBuffsUpdate = (buffs: IActivePotionBuff[]) => {
      setActiveBuffs(buffs);
    };

    // Ticker lokal setiap detik untuk memperbarui sisa durasi countdown secara mulus
    const ticker = setInterval(() => {
      const current = potionMgr.getActiveBuffs();
      setActiveBuffs(current);
    }, 1000);

    EventBus.on('potion-buffs-updated', handleBuffsUpdate);

    return () => {
      clearInterval(ticker);
      EventBus.off('potion-buffs-updated', handleBuffsUpdate);
    };
  }, []);

  const formatTime = (sec: number) => {
    if (sec <= 0) return '0s';
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  useEffect(() => {
    const handleMapToggle = (open: boolean) => setIsFullMapOpen(open);
    const handleOpenDlg = () => setIsDialogueOpen(true);
    const handleCloseDlg = () => setIsDialogueOpen(false);
    const handleDlgActive = (active: boolean) => setIsDialogueOpen(Boolean(active));

    EventBus.on('full-map-toggled', handleMapToggle);
    EventBus.on('open-dialogue', handleOpenDlg);
    EventBus.on('close-dialogue', handleCloseDlg);
    EventBus.on('dialogue-active', handleDlgActive);

    return () => {
      EventBus.off('full-map-toggled', handleMapToggle);
      EventBus.off('open-dialogue', handleOpenDlg);
      EventBus.off('close-dialogue', handleCloseDlg);
      EventBus.off('dialogue-active', handleDlgActive);
    };
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setHotbarItems(inv.getHotbarItems());
      setActiveSlot(inv.getActiveSlotIndex());
      setTotalItemCount(inv.getItemCount());
    };

    EventBus.on('inventory-updated', handleUpdate);

    return () => {
      EventBus.off('inventory-updated', handleUpdate);
    };
  }, [inv]);

  const lastPointerSelectRef = React.useRef<number>(0);

  const handleSelectSlot = (idx: number) => {
    const currentActive = inv.getActiveSlotIndex();
    if (currentActive === idx) {
      const item = hotbarItems[idx];
      if (item && item.usable && (item.category === 'consumable' || item.category === 'crop')) {
        inv.useItem(idx);
        return;
      }
      if (item && InventoryManager.isKiteItem(item)) {
        EventBus.emit('player-kite-toggle');
        return;
      }
    }
    inv.setActiveSlotIndex(idx);
    setActiveSlot(idx);
  };

  const handleDragStart = (e: React.DragEvent, slotIdx: number) => {
    if (!hotbarItems[slotIdx]) {
      e.preventDefault();
      return;
    }
    setDraggedSlot(slotIdx);
    e.dataTransfer.setData('text/plain', slotIdx.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot !== slotIdx) {
      setDragOverSlot(slotIdx);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    const sourceSlotStr = e.dataTransfer.getData('text/plain');
    const sourceSlot = draggedSlot ?? (sourceSlotStr !== '' ? parseInt(sourceSlotStr, 10) : null);

    setDraggedSlot(null);
    setDragOverSlot(null);

    if (sourceSlot !== null && !isNaN(sourceSlot) && sourceSlot !== targetSlotIdx) {
      const success = inv.moveItem(sourceSlot, targetSlotIdx);
      if (success) {
        sound.playClick();
        inv.setActiveSlotIndex(targetSlotIdx);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDragOverSlot(null);
  };

  if (isFullMapOpen || propIsFullMapOpen || isDialogueOpen || themeSettings?.visibility?.showHotbar === false) {
    return null;
  }

  const activeItem = hotbarItems[activeSlot];
  const isTopHotbar = themeSettings?.hotbarPosition === 'top-center';

  return (
    <aside
      aria-label="Mini Inventaris & Status Ramuan"
      className="fixed left-1/2 -translate-x-1/2 z-[55] select-none pointer-events-auto flex flex-col items-center gap-1 sm:gap-1.5"
      style={
        isTopHotbar
          ? { top: 'max(4.25rem, env(safe-area-inset-top, 4.25rem))' }
          : { bottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }
      }
    >
      {/* 1. Barisan Kotak-Kotak Efek Ramuan Apotek Farma (Active Potion Buffs) */}
      {activeBuffs.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[95vw] pointer-events-auto">
          {activeBuffs.map((buff) => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((buff.expiresAt - now) / 1000));
            const total = buff.durationSec || 86400;
            const percent = Math.min(100, Math.max(0, (remaining / total) * 100));
            const isEnabled = buff.enabled !== false;

            return (
              <div
                key={buff.potionType}
                onClick={() => {
                  sound.playClick();
                  PotionManager.getInstance().toggleBuff(buff.potionType);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 border-2 border-[#5C3A21] rounded-lg cursor-pointer transition-all active:translate-y-[1px] ${
                  isEnabled
                    ? 'bg-[#FFF8EA] shadow-[inset_0_-2px_0_rgba(92,58,33,0.18)]'
                    : 'bg-[#FFF8EA]/70 opacity-60 grayscale-[40%]'
                }`}
                style={{ borderRadius: '8px' }}
                title={`${buff.potionName} • Status: ${isEnabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'} • Klik untuk toggle ON/OFF • Sisa: ${formatTime(remaining)}`}
              >
                {/* Icon Emoji Ramuan */}
                <span className="text-sm sm:text-base leading-none select-none">
                  {buff.icon}
                </span>

                {/* Nama & Countdown */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] sm:text-[9.5px] font-bold text-black truncate max-w-[75px] sm:max-w-[100px] leading-tight">
                      {buff.potionName}
                    </span>
                    <span
                      className={`px-1 py-0 text-[7px] sm:text-[7.5px] font-bold leading-tight ${
                        isEnabled
                          ? 'clay-badge-secondary text-black'
                          : 'clay-badge-neutral text-black/60'
                      }`}
                    >
                      {isEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[7.5px] sm:text-[8px] font-bold text-black leading-tight">
                      {formatTime(remaining)}
                    </span>
                    <div className="w-6 sm:w-10 h-1 bg-[#5C3A21]/20 rounded-full overflow-hidden border border-[#5C3A21]/30">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isEnabled ? 'bg-[#FFAE6D]' : 'bg-[#5C3A21]/40'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Hapus Buff */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    PotionManager.getInstance().removeBuff(buff.potionType);
                  }}
                  className="w-4 h-4 rounded flex items-center justify-center text-black active:translate-y-[1px] ml-0.5"
                  title={`Hapus permanen efek ${buff.potionName}`}
                >
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Widget Interaktif Kendali Layang-layang (Kite Control HUD) */}
      {kiteState.isFlying && (
        <div className="clay-panel flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg pointer-events-auto select-none border-2 border-[#5C3A21] bg-[#FFF8EA] animate-in fade-in zoom-in-95 duration-150">
          {/* Status Mode */}
          <div className="flex items-center gap-1 text-[9.5px] sm:text-[11px] font-black text-black">
            <span>{kiteState.mode === 'kite' ? '🪁 KEMUDI LAYANGAN (Kamera Fokus)' : '🚶 JALAN KARAKTER (Kamera Pemain)'}</span>
          </div>

          <div className="w-[1.5px] h-4 bg-[#5C3A21]/40 mx-0.5" />

          {/* Tombol Ganti Mode */}
          <button
            type="button"
            onClick={handleToggleKiteMode}
            className="clay-btn-secondary px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8.5px] sm:text-[10px] font-bold text-black flex items-center gap-1 active:translate-y-[1px]"
            title="Beralih Kendali antara Layangan dan Karakter [R]"
          >
            <RefreshCw className="w-3 h-3 stroke-[2.5]" />
            <span>{kiteState.mode === 'kite' ? 'Jalan Karakter [R]' : 'Kemudi Layangan [R]'}</span>
          </button>

          {/* Tombol Gulung Layang-layang (Mode Balik Non-Layangan) */}
          <button
            type="button"
            onClick={handleStopKite}
            className="clay-btn-primary px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8.5px] sm:text-[10px] font-bold text-black flex items-center gap-1 active:translate-y-[1px]"
            title="Gulung Benang Layangan & Kembali ke Mode Biasa [F]"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
            <span>Gulung [F]</span>
          </button>
        </div>
      )}

      {/* Label Item Aktif Ringkas */}
      {activeItem && (
        <div className="clay-badge-neutral px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-black max-w-[200px] truncate pointer-events-none">
          {activeItem.name}
        </div>
      )}

      {/* Wadah Mini Hotbar Clay-Pixel */}
      <div className="clay-panel flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5">
        {/* 6 Slot Hotbar */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {hotbarItems.map((item, idx) => {
            const isActive = activeSlot === idx;
            const isDragging = draggedSlot === idx;
            const isDragOver = dragOverSlot === idx;

            return (
              <button
                key={idx}
                type="button"
                tabIndex={-1}
                draggable={Boolean(item)}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (typeof window !== 'undefined') {
                    (window as any).__raden_virtual_control_active = true;
                    setTimeout(() => {
                      (window as any).__raden_virtual_control_active = false;
                    }, 220);
                  }
                  if (e.button === 0 || e.pointerType === 'touch') {
                    lastPointerSelectRef.current = Date.now();
                    handleSelectSlot(idx);
                  }
                  (e.currentTarget as HTMLElement).blur();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (Date.now() - lastPointerSelectRef.current < 320) return;
                  handleSelectSlot(idx);
                  (e.currentTarget as HTMLElement).blur();
                }}
                className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 landscape:max-md:w-8 landscape:max-md:h-8 flex items-center justify-center ${
                  isDragOver
                    ? 'clay-btn-secondary'
                    : isActive
                    ? 'clay-btn-primary'
                    : 'clay-btn-neutral'
                } ${isDragging ? 'opacity-45' : ''}`}
                style={{ borderRadius: '8px' }}
                title={item ? `${item.name} [Slot ${idx + 1}]` : `Slot ${idx + 1}`}
              >
                {/* Nomor Slot Hotkey */}
                <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-bold text-black leading-none">
                  {idx + 1}
                </span>

                {/* Konten Item */}
                {item ? (
                  <>
                    <span className="text-sm sm:text-lg md:text-xl landscape:max-md:text-sm select-none leading-none">
                      {item.icon}
                    </span>
                    {item.quantity > 1 && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-[#A8E6CF] text-black text-[8px] font-bold px-1 rounded border border-[#5C3A21] leading-tight">
                        {item.quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[9px] text-black/35 font-bold pointer-events-none">•</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Garis Pemisah */}
        <div className="w-[2px] h-6 sm:h-7 bg-[#5C3A21]/40 rounded-full mx-0.5" />

        {/* Tombol Tas */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenBackpack();
          }}
          className={`relative flex flex-col items-center justify-center w-9 h-8 sm:w-11 sm:h-10 md:w-12 md:h-11 landscape:max-md:w-9 landscape:max-md:h-8 text-black ${
            isBackpackOpen ? 'clay-btn-primary' : 'clay-btn-secondary'
          }`}
          style={{ borderRadius: '8px' }}
          title="Buka Tas Inventaris [B]"
        >
          <Backpack className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="text-[7.5px] sm:text-[9px] font-bold leading-none mt-0.5">
            Tas
          </span>

          {totalItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded bg-[#FFAE6D] border border-[#5C3A21] text-black text-[8px] font-bold flex items-center justify-center">
              {totalItemCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
});
Hotbar.displayName = 'Hotbar';
