/**
 * ============================================================================
 * FILE: resources/js/game/ui/InventoryModal.tsx
 * ============================================================================
 * Pop-up Tas Punggung & Quick Hotbar RadenWorld (Cozycore Clay-Pixel):
 * 1. Hotbar Utama (Slot 1-6) Independen: selalu siap pakai [1-6], mendukung
 *    Drag & Drop serta tombol pasang cepat untuk pengguna Mobile & PC.
 * 2. Penyimpanan Tas (Slot 7-30): 24 slot dengan filter kategori.
 * 3. Panel Detail & Aksi Cepat: Jual ikan, gunakan makanan, pasang ke Hotbar.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { X, Backpack, Coins, Utensils, Info, ArrowRightLeft, Zap, Gem } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold?: number;
  diamonds?: number;
  isAdmin?: boolean;
}

export type ItemFilter = 'all' | 'tool' | 'seed' | 'crop' | 'fish' | 'consumable' | 'material';

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  gold = 2500,
  isAdmin = false,
}) => {
  const inv = InventoryManager.getInstance();
  const sound = SoundManager.getInstance();

  const isUserAdmin = Boolean(
    isAdmin ||
      (() => {
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          return (
            u.role === 'admin' ||
            u.role === 'super_admin' ||
            u.is_super_admin === true ||
            u.email === 'radencakstudio@gmail.com' ||
            u.name?.toUpperCase() === 'RADEN'
          );
        } catch (e) {
          return false;
        }
      })()
  );

  const [items, setItems] = useState<(IInventoryItem | null)[]>(inv.getAllItems());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<ItemFilter>('all');
  const [currentGold, setCurrentGold] = useState<number>(() => {
    if (isUserAdmin) return 99999999999;
    try {
      const g = parseInt(localStorage.getItem('raden_player_gold') || '', 10);
      if (!isNaN(g)) return g;
    } catch (e) {}
    return gold;
  });
  // Bebas sistem diamond / 100% koin

  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(inv.getAllItems());
      if (isUserAdmin) {
        setCurrentGold(99999999999);
        // diamonds removed
        return;
      }
      try {
        const g = parseInt(localStorage.getItem('raden_player_gold') || '0', 10);
        if (g) setCurrentGold(g);
        // diamond removed
      } catch (e) {}
    };

    EventBus.on('inventory-updated', handleUpdate);
    return () => {
      EventBus.off('inventory-updated', handleUpdate);
    };
  }, [inv, isUserAdmin]);

  useEffect(() => {
    if (isOpen) {
      setItems(inv.getAllItems());
      const firstFilled = inv.getAllItems().findIndex((it) => it !== null);
      setSelectedSlot(firstFilled !== -1 ? firstFilled : 0);
    }
  }, [isOpen, inv]);

  if (!isOpen) return null;

  const selectedItem = selectedSlot !== null ? items[selectedSlot] : null;

  const handleDragStart = (e: React.DragEvent, slotIdx: number) => {
    if (!items[slotIdx]) {
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

  const handleDragLeave = (_e: React.DragEvent, slotIdx: number) => {
    if (dragOverSlot === slotIdx) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    const sourceSlotStr = e.dataTransfer.getData('text/plain');
    const sourceSlot =
      draggedSlot ?? (sourceSlotStr !== '' ? parseInt(sourceSlotStr, 10) : null);

    setDraggedSlot(null);
    setDragOverSlot(null);

    if (sourceSlot !== null && !isNaN(sourceSlot) && sourceSlot !== targetSlotIdx) {
      const success = inv.moveItem(sourceSlot, targetSlotIdx);
      if (success) {
        sound.playClick();
        setSelectedSlot(targetSlotIdx);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDragOverSlot(null);
  };

  const handleSellFish = () => {
    if (selectedSlot === null || !selectedItem || selectedItem.category !== 'fish') return;
    const sold = inv.sellItem(selectedSlot);
    if (sold) {
      sound.playCoin();
      const nextFilled = items.findIndex((it, idx) => it !== null && idx !== selectedSlot);
      setSelectedSlot(nextFilled !== -1 ? nextFilled : null);
    }
  };

  const handleConsumeItem = () => {
    if (selectedSlot === null || !selectedItem || !selectedItem.usable) return;
    const consumed = inv.consumeItem(selectedSlot);
    if (consumed) {
      sound.playItemUse();
      const current = inv.getItemAt(selectedSlot);
      if (!current) {
        const nextFilled = items.findIndex((it, idx) => it !== null && idx !== selectedSlot);
        setSelectedSlot(nextFilled !== -1 ? nextFilled : null);
      }
    }
  };

  const handleMoveToHotbar = (hotbarSlotIdx: number) => {
    if (selectedSlot === null || !selectedItem) return;
    inv.moveItem(selectedSlot, hotbarSlotIdx);
    sound.playClick();
    setSelectedSlot(hotbarSlotIdx);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return (
          <span className="clay-badge-primary font-bold text-[9px] px-1.5 py-0.5 text-black uppercase">
            LEGENDARIS
          </span>
        );
      case 'Rare':
        return (
          <span className="clay-badge-secondary font-bold text-[9px] px-1.5 py-0.5 text-black uppercase">
            LANGKA
          </span>
        );
      case 'Uncommon':
        return (
          <span className="clay-badge-cocoa font-bold text-[9px] px-1.5 py-0.5 text-white uppercase">
            UNCOMMON
          </span>
        );
      default:
        return (
          <span className="clay-badge-neutral font-bold text-[9px] px-1.5 py-0.5 text-black uppercase">
            BIASA
          </span>
        );
    }
  };

  const handleUseItem = (_slotIdx: number) => {
    handleConsumeItem();
  };

  const handleSellItem = (slotIdx: number) => {
    if (slotIdx === null || !selectedItem) return;
    const sold = inv.sellItem(slotIdx);
    if (sold) {
      sound.playCoin();
      const nextFilled = items.findIndex((it, idx) => it !== null && idx !== slotIdx);
      setSelectedSlot(nextFilled !== -1 ? nextFilled : null);
    }
  };

  const renderSlot = (idx: number, isHotbar: boolean) => {
    const item = items[idx] || null;
    const isSelected = selectedSlot === idx;
    const isDragging = draggedSlot === idx;
    const isDragOver = dragOverSlot === idx;

    const isDimmed =
      !isHotbar &&
      activeCategory !== 'all' &&
      item !== null &&
      item.category !== activeCategory;

    let slotClass = 'clay-slot-neutral';
    if (isSelected || isDragOver) {
      slotClass = 'clay-slot-primary';
    } else if (isHotbar && item) {
      slotClass = 'clay-slot-secondary';
    }

    return (
      <div
        key={idx}
        draggable={Boolean(item)}
        onDragStart={(e) => handleDragStart(e, idx)}
        onDragOver={(e) => handleDragOver(e, idx)}
        onDragLeave={(e) => handleDragLeave(e, idx)}
        onDrop={(e) => handleDrop(e, idx)}
        onDragEnd={handleDragEnd}
        onClick={() => {
          sound.playClick();
          setSelectedSlot(idx);
        }}
        className={`clay-slot ${slotClass} ${
          item ? 'cursor-grab active:cursor-grabbing' : ''
        } ${isDragging ? 'opacity-45 border-dashed' : ''} ${
          isDimmed ? 'opacity-25 pointer-events-none' : ''
        }`}
        title={
          item
            ? `${item.name} (${isHotbar ? `Hotbar Slot ${idx + 1}` : `Tas Slot ${idx + 1}`})`
            : isHotbar
            ? `Hotbar Slot ${idx + 1}`
            : `Slot Tas ${idx + 1}`
        }
      >
        {/* Nomor Slot */}
        <span className="absolute top-0.5 left-1 text-[7px] sm:text-[8px] font-bold text-black/75 leading-none pointer-events-none select-none">
          {isHotbar ? `#${idx + 1}` : idx + 1}
        </span>

        {/* Icon Item */}
        {item ? (
          <>
            <span className="text-base sm:text-xl md:text-2xl select-none pointer-events-none leading-none">
              {item.icon}
            </span>
            {item.quantity > 1 && (
              <span className="absolute bottom-0.5 right-0.5 bg-[#5C3A21] text-white text-[7.5px] sm:text-[8.5px] font-bold px-1 rounded leading-tight pointer-events-none select-none">
                {item.quantity}
              </span>
            )}
          </>
        ) : (
          <span className="text-black/25 text-xs font-bold pointer-events-none select-none">•</span>
        )}
      </div>
    );
  };

  const hotbarItemsCount = items.slice(0, InventoryManager.HOTBAR_SLOTS).filter(Boolean).length;
  const bagItemsCount = items.slice(InventoryManager.HOTBAR_SLOTS).filter(Boolean).length;

  return (
    <div
      className="ui-modal-backdrop select-none"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="clay-panel landscape-compact-modal clay-modal-shell relative w-full max-w-4xl max-h-[min(94dvh,calc(100dvh-0.5rem))] flex flex-row overflow-hidden text-black">
        {/* SIDEBAR SEBELAH KIRI */}
        <aside className="clay-sidebar">
          <div className="clay-sidebar-header">
            <div className="clay-sidebar-brand-icon">
              <Backpack className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="clay-sidebar-brand-text">
              <span className="clay-sidebar-title">TAS PETUALANG</span>
              <span className="clay-sidebar-subtitle">KAPASITAS {inv.getItemCount()}/30</span>
            </div>
          </div>

          <div className="clay-sidebar-nav">
            {[
              { id: 'all', label: 'Semua Item', icon: '📦' },
              { id: 'tool', label: 'Alat & Senjata', icon: '⛏️' },
              { id: 'seed', label: 'Bibit & Benih', icon: '🌱' },
              { id: 'crop', label: 'Hasil Panen', icon: '🌾' },
              { id: 'fish', label: 'Ikan Tangkapan', icon: '🐟' },
              { id: 'consumable', label: 'Ramuan & Jamu', icon: '🧪' },
              { id: 'material', label: 'Material Lain', icon: '🪨' },
            ].map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory(cat.id as ItemFilter);
                  }}
                  className={`clay-sidebar-btn ${
                    isActive ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
                  }`}
                >
                  <span className="text-sm shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="clay-sidebar-footer">
            <div className="clay-badge-secondary flex items-center gap-1.5 px-2 py-1.5 text-black font-bold text-[10px] w-full justify-center">
              <Coins className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">
                {isUserAdmin || currentGold >= 99999999999 ? '99999999999' : currentGold.toLocaleString('id-ID')} G
              </span>
            </div>
          </div>
        </aside>

        {/* MAIN PANE */}
        <main className="clay-main-pane">
          {/* TOPBAR */}
          <header className="clay-main-topbar">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold text-black uppercase">
                  Penyimpanan & Quick Hotbar
                </h2>
                <span className="clay-badge-secondary text-[9px] font-bold px-1.5 py-0.5 text-black">
                  SLOT BEBAS PINDAH
                </span>
                {isUserAdmin && (
                  <span className="clay-badge-cocoa text-[9px] font-bold px-1.5 py-0.5 text-white">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-black hidden sm:block truncate">
                Tarik atau ketuk item untuk menggunakan, memindahkan ke Hotbar [1-6], atau menjual.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
              title="Tutup Tas [B]"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </header>

          {/* BODY */}
          <div className="clay-main-body flex flex-col md:flex-row gap-3">
            {/* GRID HOTBAR & TAS */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* 1. HOTBAR UTAMA (SLOT 1 - 6) */}
              <div className="clay-card p-2.5 sm:p-3">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-[#5C3A21]/30">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#FFAE6D] border border-[#5C3A21] text-black flex items-center justify-center">
                      <Zap className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <h3 className="text-xs font-bold text-black uppercase">HOTBAR UTAMA (1 - 6)</h3>
                    <span className="clay-badge-secondary text-[9px] font-bold px-1.5 py-0.5 text-black">
                      {hotbarItemsCount}/6
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-black hidden sm:inline">
                    Pencet angka 1-6 di keyboard
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full">
                  {Array.from({ length: InventoryManager.HOTBAR_SLOTS }).map((_, idx) =>
                    renderSlot(idx, true)
                  )}
                </div>
              </div>

              {/* 2. PENYIMPANAN TAS (SLOT 7 - 30) */}
              <div className="clay-card p-2.5 sm:p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#5C3A21]/30">
                  <div className="flex items-center gap-1.5">
                    <Backpack className="w-4 h-4 stroke-[2.5] text-black" />
                    <h3 className="text-xs font-bold text-black uppercase">SLOT TAS (7 - 30)</h3>
                    <span className="text-[10px] font-bold text-black">({bagItemsCount}/24)</span>
                  </div>
                  <span className="text-[9px] font-bold text-black">
                    Filter: {activeCategory.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full">
                  {Array.from({
                    length: InventoryManager.MAX_SLOTS - InventoryManager.HOTBAR_SLOTS,
                  }).map((_, i) => {
                    const idx = i + InventoryManager.HOTBAR_SLOTS;
                    return renderSlot(idx, false);
                  })}
                </div>
              </div>
            </div>

            {/* DETAIL & AKSI ITEM */}
            <div className="w-full md:w-60 lg:w-64 clay-card p-3 sm:p-3.5 flex flex-col justify-between shrink-0 text-black">
              {selectedItem ? (
                <div className="flex flex-col h-full gap-2.5">
                  <div className="flex items-center gap-2.5 pb-2 border-b-2 border-[#5C3A21]/30">
                    <div className="w-10 h-10 rounded-xl bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-2xl shrink-0">
                      {selectedItem.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {getRarityBadge(selectedItem.rarity)}
                      </div>
                      <h3 className="text-xs font-bold text-black truncate">
                        {selectedItem.name}
                      </h3>
                      <p className="text-[10px] font-bold text-black capitalize">
                        {selectedItem.category} • {selectedItem.quantity}x
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-xs text-black">
                    <p className="leading-snug bg-[#FFF8EA] p-2 rounded-lg border-2 border-[#5C3A21] text-[10px]">
                      {selectedItem.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-bold bg-[#A8E6CF] p-2 rounded-lg border-2 border-[#5C3A21]">
                      <span>Harga Jual Satuan:</span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{selectedItem.price || 5} G</span>
                      </span>
                    </div>

                    {selectedItem.extraData?.hpRestore && (
                      <div className="flex items-center justify-between text-[10px] font-bold bg-[#FFAE6D] p-1.5 rounded border border-[#5C3A21]">
                        <span>Pemulihan HP:</span>
                        <span>+{selectedItem.extraData.hpRestore} HP</span>
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t-2 border-[#5C3A21]/30">
                    {selectedSlot !== null && selectedSlot >= InventoryManager.HOTBAR_SLOTS && (
                      <button
                        type="button"
                        onClick={() => handleMoveToHotbar(selectedSlot)}
                        className="clay-btn-secondary w-full py-1.5 text-xs font-bold uppercase text-black flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>PASANG KE HOTBAR</span>
                      </button>
                    )}

                    {selectedItem.usable && (
                      <button
                        type="button"
                        onClick={() => handleUseItem(selectedSlot!)}
                        className="clay-btn-primary w-full py-1.5 text-xs font-bold uppercase text-black flex items-center justify-center gap-1"
                      >
                        <Utensils className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>PAKAI / GUNAKAN</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSellItem(selectedSlot!)}
                      className="clay-btn-neutral w-full py-1.5 text-xs font-bold uppercase text-black flex items-center justify-center gap-1"
                    >
                      <Coins className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>JUAL ({(selectedItem.price || 5) * selectedItem.quantity} G)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Info className="w-8 h-8 text-black/40 mb-2" />
                  <p className="text-xs font-bold text-black">
                    Pilih slot item untuk melihat rincian dan menggunakannya.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
