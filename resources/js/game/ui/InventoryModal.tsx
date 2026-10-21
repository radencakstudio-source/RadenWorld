/**
 * ============================================================================
 * FILE: resources/js/game/ui/InventoryModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pop-up Tas Punggung & Quick Hotbar RadenWorld:
 * 1. Desain UI Konsisten: Flat Pure Black (#000000 / #0a0a0a) & Amber Gold (#f59e0b)
 *    selaras dengan seluruh antarmuka RadenWorld (HUD, ServerModal, SettingsModal).
 * 2. Hotbar Utama (Slot 1-6) Independen:
 *    - Hotbar SELALU tampil sebagai hotbar siap pakai [1-6], tidak pernah teredup
 *      atau terfilter ketika memilih kategori alat, ikan, makanan, atau material.
 *    - Mendukung Drag & Drop dari slot tas ke slot hotbar (dan sebaliknya).
 * 3. Penyimpanan Tas (Slot 7-30):
 *    - 24 slot petak penyimpanan dengan filter kategori khusus tas.
 *    - Drag & drop untuk menyusun isi tas atau memasang item ke hotbar.
 * 4. Panel Detail & Aksi Cepat:
 *    - Jual ikan, gunakan makanan, dan tombol pintas pasang ke Hotbar.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { X, Backpack, Coins, Utensils, Filter, Info, ArrowRightLeft, Zap } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold?: number;
  diamonds?: number;
}

type ItemFilter = 'all' | 'tool' | 'fish' | 'consumable' | 'material';

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  gold = 2500,
}) => {
  const inv = InventoryManager.getInstance();
  const sound = SoundManager.getInstance();

  const [items, setItems] = useState<(IInventoryItem | null)[]>(inv.getAllItems());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<ItemFilter>('all');
  const [currentGold, setCurrentGold] = useState<number>(gold);

  // Drag and drop state
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(inv.getAllItems());
      try {
        const g = parseInt(localStorage.getItem('raden_player_gold') || '0', 10);
        if (g) setCurrentGold(g);
      } catch (e) {}
    };

    EventBus.on('inventory-updated', handleUpdate);
    return () => {
      EventBus.off('inventory-updated', handleUpdate);
    };
  }, [inv]);

  useEffect(() => {
    if (isOpen) {
      setItems(inv.getAllItems());
      const firstFilled = inv.getAllItems().findIndex((it) => it !== null);
      setSelectedSlot(firstFilled !== -1 ? firstFilled : 0);
    }
  }, [isOpen, inv]);

  if (!isOpen) return null;

  const selectedItem = selectedSlot !== null ? items[selectedSlot] : null;

  // Drag and Drop Handlers
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

  const handleDragLeave = (e: React.DragEvent, slotIdx: number) => {
    if (dragOverSlot === slotIdx) {
      setDragOverSlot(null);
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
          <span className="bg-amber-400 text-black font-mono font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider">
            LEGENDARIS
          </span>
        );
      case 'Rare':
        return (
          <span className="bg-neutral-900 text-amber-300 border border-amber-400/40 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded tracking-wider">
            LANGKA
          </span>
        );
      case 'Uncommon':
        return (
          <span className="bg-neutral-900 text-neutral-200 border border-neutral-700 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded tracking-wider">
            UNCOMMON
          </span>
        );
      default:
        return (
          <span className="bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded tracking-wider">
            BIASA
          </span>
        );
    }
  };

  const getSlotBorder = (item: IInventoryItem | null, isSelected: boolean, isHotbar: boolean = false) => {
    if (isSelected) {
      return 'border-2 border-amber-400 bg-amber-400/15 shadow-sm shadow-amber-400/20';
    }
    if (!item) {
      return isHotbar
        ? 'border border-amber-500/30 bg-black hover:bg-neutral-900 hover:border-amber-400/60'
        : 'border border-neutral-800/80 bg-black hover:bg-neutral-900/60 hover:border-neutral-700';
    }

    if (item.rarity === 'Legendary') {
      return 'border border-amber-400/80 bg-neutral-900 hover:border-amber-300';
    }
    if (item.rarity === 'Rare') {
      return 'border border-amber-400/40 bg-neutral-900 hover:border-amber-400';
    }
    return 'border border-neutral-800 bg-neutral-900 hover:border-neutral-600';
  };

  const renderSlot = (idx: number, isHotbar: boolean) => {
    const item = items[idx] || null;
    const isSelected = selectedSlot === idx;
    const isDragging = draggedSlot === idx;
    const isDragOver = dragOverSlot === idx;

    // Filter Kategori: HANYA berlaku untuk slot tas penyimpanan, HOTBAR SELALU TETAP HOTBAR!
    const isDimmed =
      !isHotbar &&
      activeCategory !== 'all' &&
      item !== null &&
      item.category !== activeCategory;

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
        className={`relative aspect-square rounded-md flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
          item ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
          isDragging ? 'opacity-30 border-dashed border-amber-400 scale-95' : ''
        } ${
          isDragOver
            ? 'border-2 border-amber-400 bg-amber-400/25 scale-105 shadow-md shadow-amber-400/30 z-10 ring-2 ring-amber-400'
            : getSlotBorder(item, isSelected, isHotbar)
        } ${isDimmed ? 'opacity-20 grayscale pointer-events-none' : ''}`}
        title={
          item
            ? `${item.name} (${isHotbar ? `Hotbar Slot ${idx + 1}` : `Tas Slot ${idx + 1}`}) - Drag untuk memindahkan`
            : isHotbar
            ? `Hotbar Slot ${idx + 1} (Drop item ke sini)`
            : `Slot Tas ${idx + 1}`
        }
      >
        {/* Nomor Slot Hotbar [1] - [6] */}
        {isHotbar && (
          <span className="absolute top-1 left-1.5 text-[9px] font-mono font-black text-amber-400 leading-none drop-shadow">
            #{idx + 1}
          </span>
        )}

        {/* Nomor Urut Slot Tas Biasa */}
        {!isHotbar && (
          <span className="absolute top-1 left-1.5 text-[8px] font-mono text-neutral-600 leading-none">
            {idx + 1}
          </span>
        )}

        {/* Icon Item */}
        {item ? (
          <>
            <span className="text-2xl sm:text-3xl select-none transition-transform hover:scale-110 pointer-events-none">
              {item.icon}
            </span>
            {/* Jumlah Tumpukan (Stack) */}
            {item.quantity > 1 && (
              <span className="absolute bottom-1 right-1 bg-black text-amber-300 text-[9px] font-mono font-bold px-1 rounded border border-neutral-800 leading-tight pointer-events-none">
                {item.quantity}
              </span>
            )}
          </>
        ) : (
          <span className="text-neutral-700 text-xs font-bold pointer-events-none">•</span>
        )}
      </div>
    );
  };

  const hotbarItemsCount = items.slice(0, InventoryManager.HOTBAR_SLOTS).filter(Boolean).length;
  const bagItemsCount = items.slice(InventoryManager.HOTBAR_SLOTS).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 font-['Chakra_Petch'] animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-black border border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-neutral-100">
        
        {/* ============================================================== */}
        {/* HEADER MODAL: Pure Black & Amber Accents                        */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
              <Backpack className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-wider text-amber-400 uppercase">
                  Tas Petualang Raden
                </h2>
                <span className="text-[10px] font-mono font-bold bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded border border-neutral-800">
                  {inv.getItemCount()}/30 TERISI
                </span>
              </div>
            </div>
          </div>

          {/* Saldo Gold & Tombol Tutup */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-amber-300 text-xs font-bold font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{currentGold.toLocaleString('id-ID')} G</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Tas [B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* KONTEN UTAMA: HOTBAR + PENYIMPANAN TAS + PANEL DETAIL ITEM      */}
        {/* ============================================================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto p-4 gap-4 bg-black">
          
          {/* SISI KIRI: HOTBAR UTAMA (SLOT 1-6) & PENYIMPANAN TAS (SLOT 7-30) */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            
            {/* 1. KOTAK DEDIKASI HOTBAR UTAMA (SLOT 1 - 6) - TIDAK TERPENGARUH FILTER */}
            <div className="bg-[#0a0a0a] border border-amber-500/40 rounded-lg p-3 shadow-md relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-amber-400 text-black flex items-center justify-center font-black text-xs">
                    <Zap className="w-3.5 h-3.5 fill-black stroke-black" />
                  </div>
                  <h3 className="text-xs font-black tracking-wider text-amber-400 uppercase">
                    HOTBAR UTAMA (Slot 1 - 6)
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-black bg-amber-400 px-1.5 py-0.5 rounded leading-none">
                    SIAP PAKAI [1-6]
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                  <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Drag & drop item ke sini ({hotbarItemsCount}/6)</span>
                </div>
              </div>

              {/* 6 Slot Hotbar */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: InventoryManager.HOTBAR_SLOTS }).map((_, idx) =>
                  renderSlot(idx, true)
                )}
              </div>
            </div>

            {/* 2. KOTAK PENYIMPANAN TAS (SLOT 7 - 30, 24 SLOT) DENGAN FILTER KATEGORI */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-neutral-800 rounded-lg p-3 gap-2.5">
              {/* Header Tas & Filter Kategori Tas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-800 gap-2">
                <div className="flex items-center gap-2">
                  <Backpack className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-xs font-bold tracking-wider text-neutral-300 uppercase">
                    PENYIMPANAN TAS (Slot 7 - 30)
                  </h3>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ({bagItemsCount}/24)
                  </span>
                </div>

                {/* Filter Kategori Khusus Tas Penyimpanan */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'tool', label: 'Alat' },
                    { id: 'fish', label: 'Ikan' },
                    { id: 'consumable', label: 'Makanan' },
                    { id: 'material', label: 'Material' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveCategory(cat.id as ItemFilter);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        activeCategory === cat.id
                          ? 'bg-amber-400 text-black font-black'
                          : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 24 Slot Tas */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: InventoryManager.MAX_SLOTS - InventoryManager.HOTBAR_SLOTS }).map(
                  (_, i) => {
                    const idx = i + InventoryManager.HOTBAR_SLOTS;
                    return renderSlot(idx, false);
                  }
                )}
              </div>
            </div>
          </div>

          {/* SISI KANAN: PANEL DETAIL & AKSI ITEM (Flat Black & Neutral Borders) */}
          <div className="w-full md:w-80 bg-[#0a0a0a] border border-neutral-800 rounded-lg p-4 flex flex-col justify-between shrink-0">
            {selectedItem ? (
              <div className="flex flex-col h-full">
                {/* Header Detail */}
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                  <div className="w-14 h-14 rounded-md bg-black border border-neutral-800 flex items-center justify-center text-3xl shrink-0">
                    {selectedItem.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {getRarityBadge(selectedItem.rarity)}
                    </div>
                    <h3 className="text-sm font-bold text-amber-400 truncate">
                      {selectedItem.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 capitalize font-mono">
                      {selectedItem.category} • Jumlah: {selectedItem.quantity}x
                    </p>
                  </div>
                </div>

                {/* Deskripsi & Atribut */}
                <div className="py-3 flex-1 space-y-2 text-xs text-neutral-300">
                  <p className="leading-relaxed bg-black p-2.5 rounded-md border border-neutral-800 text-neutral-300">
                    {selectedItem.description}
                  </p>

                  {/* Lokasi Slot Item Saat Ini */}
                  <div className="bg-black p-2 rounded-md border border-neutral-800 text-[11px] flex justify-between items-center">
                    <span className="text-neutral-400">Posisi Slot:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {selectedSlot !== null && selectedSlot < InventoryManager.HOTBAR_SLOTS
                        ? `Hotbar #${selectedSlot + 1} (Tombol [${selectedSlot + 1}])`
                        : `Tas Slot #${(selectedSlot || 0) + 1}`}
                    </span>
                  </div>

                  {/* Atribut Khusus Ikan */}
                  {selectedItem.category === 'fish' && selectedItem.extraData?.weightKg && (
                    <div className="bg-black border border-neutral-800 p-2 rounded-md text-xs flex justify-between items-center font-bold">
                      <span className="text-neutral-400">Berat Ikan:</span>
                      <span className="text-neutral-200 font-mono">{selectedItem.extraData.weightKg} kg</span>
                    </div>
                  )}

                  {/* Nilai Jual */}
                  {selectedItem.price > 0 && (
                    <div className="bg-black border border-neutral-800 p-2 rounded-md text-xs flex justify-between items-center font-bold">
                      <span className="text-neutral-400">Nilai Jual:</span>
                      <span className="text-amber-400 font-mono">
                        +{selectedItem.price * selectedItem.quantity} Gold
                        {selectedItem.quantity > 1 ? ` (@${selectedItem.price})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi Item */}
                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  {/* Jual Ikan */}
                  {selectedItem.category === 'fish' && (
                    <button
                      type="button"
                      onClick={handleSellFish}
                      className="w-full py-2.5 rounded-md bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-98"
                    >
                      <Coins className="w-3.5 h-3.5 fill-black" />
                      Jual Semua Ikan (+{selectedItem.price * selectedItem.quantity} Gold)
                    </button>
                  )}

                  {/* Makan / Konsumsi */}
                  {selectedItem.usable && (
                    <button
                      type="button"
                      onClick={handleConsumeItem}
                      className="w-full py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-400/40 hover:border-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-98"
                    >
                      <Utensils className="w-3.5 h-3.5 stroke-[2]" />
                      Gunakan / Makan Sekarang
                    </button>
                  )}

                  {/* Pasang ke Hotbar (Jika saat ini berada di slot tas 7-30) */}
                  {selectedSlot !== null && selectedSlot >= InventoryManager.HOTBAR_SLOTS ? (
                    <div className="pt-1 flex flex-col gap-1.5 bg-black p-2.5 rounded-md border border-neutral-800">
                      <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-amber-400" />
                          Pasang ke Hotbar:
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono">atau Drag n Drop</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                          const targetItem = items[slotIdx];
                          return (
                            <button
                              key={slotIdx}
                              type="button"
                              onClick={() => handleMoveToHotbar(slotIdx)}
                              className="h-8 rounded bg-neutral-900 hover:bg-amber-400 hover:text-black border border-neutral-800 text-neutral-300 text-xs font-mono font-bold flex items-center justify-center transition-colors cursor-pointer"
                              title={
                                targetItem
                                  ? `Tukar dengan ${targetItem.name} [Slot ${slotIdx + 1}]`
                                  : `Pasang ke Hotbar Slot ${slotIdx + 1}`
                              }
                            >
                              <span>{slotIdx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : selectedSlot !== null && selectedSlot < InventoryManager.HOTBAR_SLOTS ? (
                    <div className="pt-1 flex items-center justify-between bg-black p-2 rounded-md border border-neutral-800">
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3 fill-amber-400" />
                        Terpasang di Hotbar #{selectedSlot + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          // Pindahkan ke slot tas kosong pertama (6-29)
                          const emptyBagSlot = items.findIndex(
                            (it, idx) => idx >= InventoryManager.HOTBAR_SLOTS && it === null
                          );
                          if (emptyBagSlot !== -1) {
                            inv.moveItem(selectedSlot, emptyBagSlot);
                            sound.playClick();
                            setSelectedSlot(emptyBagSlot);
                          } else {
                            sound.playClick();
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] font-bold text-neutral-200 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
                      >
                        Pindah ke Tas
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-neutral-500">
                <Info className="w-8 h-8 mb-2 text-neutral-600" />
                <p className="text-xs">
                  Pilih salah satu slot di sebelah kiri untuk melihat detail item, atau drag & drop item dari tas ke Hotbar di atas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* FOOTER PANDUAN                                                 */}
        {/* ============================================================== */}
        <div className="px-5 py-2.5 border-t border-neutral-800 bg-[#0a0a0a] text-[10px] text-neutral-400 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>💡 Tarik item dari Tas dan lepas di Hotbar Slot 1-6 untuk siap digunakan dengan hotkey <b className="text-amber-400 font-mono">[1]-[6]</b>.</span>
          </div>
          <span className="hidden sm:inline font-mono text-[9px] text-neutral-500 uppercase tracking-widest">RADENWORLD INVENTORY</span>
        </div>
      </div>
    </div>
  );
};
