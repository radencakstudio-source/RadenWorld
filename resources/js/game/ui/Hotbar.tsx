/**
 * ============================================================================
 * FILE: resources/js/game/ui/Hotbar.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mini Inventaris / Quick Bar di Tengah Bawah Layar:
 * 1. 6 Slot cepat (Slot 1-6) dengan hotkey [1] s/d [6].
 * 2. Border radius proporsional, tegas dan rapi (rounded-md/rounded-lg, tidak terlalu bulat).
 * 3. Ringan (Ultra-Lightweight): Bebas backdrop-blur agar GPU tidak lag/berat saat game berjalan.
 * 4. Tombol Tas: Ikon tas di atas + teks "Tas" di bawah icon (shortcut [B] ada di panduan PC).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { Backpack } from 'lucide-react';

interface HotbarProps {
  onOpenBackpack: () => void;
  isBackpackOpen?: boolean;
}

export const Hotbar: React.FC<HotbarProps> = ({ onOpenBackpack, isBackpackOpen = false }) => {
  const inv = InventoryManager.getInstance();
  const sound = SoundManager.getInstance();

  const [hotbarItems, setHotbarItems] = useState<(IInventoryItem | null)[]>(inv.getHotbarItems());
  const [activeSlot, setActiveSlot] = useState<number>(inv.getActiveSlotIndex());
  const [totalItemCount, setTotalItemCount] = useState<number>(inv.getItemCount());
  const [hoveredItem, setHoveredItem] = useState<{ item: IInventoryItem; index: number } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setHotbarItems(inv.getHotbarItems());
      setActiveSlot(inv.getActiveSlotIndex());
      setTotalItemCount(inv.getItemCount());
    };

    EventBus.on('inventory-updated', handleUpdate);

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.key >= '1' && e.key <= '6') {
        const slotIdx = parseInt(e.key, 10) - 1;
        inv.setActiveSlotIndex(slotIdx);
        sound.playClick();
      } else if (e.key.toLowerCase() === 'b') {
        onOpenBackpack();
        sound.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      EventBus.off('inventory-updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inv, sound, onOpenBackpack]);

  const handleSelectSlot = (idx: number) => {
    inv.setActiveSlotIndex(idx);
    sound.playClick();
  };

  const getRarityBorder = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'border-amber-400';
      case 'Rare':
        return 'border-sky-400';
      case 'Uncommon':
        return 'border-emerald-400';
      default:
        return 'border-neutral-800';
    }
  };

  return (
    <aside
      aria-label="Mini Inventaris"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none font-['Chakra_Petch']"
    >
      {/* Tooltip Hover Item (Ringan, Tanpa Blur) */}
      {hoveredItem && hoveredItem.item && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0c101d] border border-amber-400/80 rounded-md px-3 py-1.5 shadow-lg pointer-events-none min-w-[130px] max-w-[220px] text-center">
          <div className="text-xs font-bold text-amber-300 truncate">{hoveredItem.item.name}</div>
          <div className="text-[10px] text-neutral-400 font-medium line-clamp-2 mt-0.5 leading-snug">
            {hoveredItem.item.description}
          </div>
          {hoveredItem.item.price > 0 && (
            <div className="text-[10px] font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
              <span>Nilai:</span>
              <span>💰 {hoveredItem.item.price} Gold</span>
            </div>
          )}
        </div>
      )}

      {/* Wadah Mini Hotbar (Tegas, Elegan, Ringan & Cepat 60 FPS) */}
      <div className="flex items-center gap-1.5 bg-[#0c101d] border border-neutral-800 rounded-lg p-1.5 shadow-lg">
        {/* 6 Slot Hotbar */}
        <div className="flex items-center gap-1">
          {hotbarItems.map((item, idx) => {
            const isActive = activeSlot === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSlot(idx)}
                onMouseEnter={() => item && setHoveredItem({ item, index: idx })}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-400/20 border border-amber-400'
                    : 'bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700'
                } ${item ? getRarityBorder(item.rarity) : ''}`}
                title={item ? `${item.name} [Slot ${idx + 1}]` : `Slot ${idx + 1}`}
              >
                {/* Nomor Slot Hotkey */}
                <span
                  className={`absolute top-0.5 left-1 text-[9px] font-mono leading-none ${
                    isActive ? 'text-amber-300 font-black' : 'text-neutral-500 font-bold'
                  }`}
                >
                  {idx + 1}
                </span>

                {/* Konten Item */}
                {item ? (
                  <>
                    <span className="text-xl sm:text-2xl select-none">
                      {item.icon}
                    </span>
                    {/* Badge Stack Kuantitas */}
                    {item.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 bg-black text-amber-300 text-[9px] font-bold px-1 rounded leading-tight border border-amber-500/30">
                        {item.quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] text-neutral-700 font-bold pointer-events-none">•</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Separator Garis Lembut */}
        <div className="w-[1px] h-7 bg-neutral-800 mx-0.5" />

        {/* Tombol Tas: Ikon Tas di Atas + Teks "Tas" di Bawah */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenBackpack();
          }}
          className={`relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-md transition-colors cursor-pointer ${
            isBackpackOpen
              ? 'bg-amber-400 text-neutral-950 border border-amber-300 font-black'
              : 'bg-neutral-900 hover:bg-neutral-850 text-amber-300 hover:text-amber-200 border border-neutral-800 hover:border-amber-400/50'
          }`}
          title="Buka Tas Inventaris"
        >
          {/* Icon Tas */}
          <Backpack className="w-4.5 h-4.5 stroke-[2]" />

          {/* Teks Tas di Bawah Icon */}
          <span className="text-[9px] sm:text-[9.5px] font-bold tracking-wide leading-none mt-0.5">
            Tas
          </span>

          {/* Badge Kuantitas Isi Tas */}
          {totalItemCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded text-[8px] font-bold flex items-center justify-center ${
                isBackpackOpen
                  ? 'bg-black text-amber-300'
                  : 'bg-amber-400 text-neutral-950'
              }`}
            >
              {totalItemCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
