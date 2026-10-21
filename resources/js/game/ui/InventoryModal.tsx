/**
 * ============================================================================
 * FILE: resources/js/game/ui/InventoryModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pop-up Tas Punggung Inventaris Lengkap (30 Slot) RadenWorld:
 * 1. 30 slot petak inventaris (6 kolom x 5 baris).
 * 2. Tab Kategori: Semua, Alat, Ikan, Konsumsi, Material.
 * 3. Panel Detail & Aksi Item: Jual Ikan (Gold), Konsumsi Makanan, Pasang ke Hotbar.
 * 4. Desain: Tegas, rapi, border radius proporsional (rounded-md/rounded-lg),
 *    bebas backdrop-blur sehingga sangat ringan, cepat, dan tidak membebani GPU.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { X, Backpack, Coins, Utensils, Filter, Info } from 'lucide-react';

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
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded">🌟 LEGENDARIS</span>;
      case 'Rare':
        return <span className="bg-sky-500/20 text-sky-400 border border-sky-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded">💎 LANGKA</span>;
      case 'Uncommon':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded">🌿 UNCOMMON</span>;
      default:
        return <span className="bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-bold px-1.5 py-0.5 rounded">BIASA</span>;
    }
  };

  const getSlotBorder = (item: IInventoryItem | null, isSelected: boolean) => {
    if (isSelected) {
      return 'border border-amber-400 bg-amber-400/20';
    }
    if (!item) return 'border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-neutral-700';

    switch (item.rarity) {
      case 'Legendary':
        return 'border border-amber-400/80 bg-amber-950/20 hover:border-amber-300';
      case 'Rare':
        return 'border border-sky-400/70 bg-sky-950/20 hover:border-sky-300';
      case 'Uncommon':
        return 'border border-emerald-400/70 bg-emerald-950/20 hover:border-emerald-300';
      default:
        return 'border border-neutral-800 bg-neutral-900/70 hover:border-neutral-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 font-['Chakra_Petch']">
      <div className="relative w-full max-w-4xl bg-[#0c101d] border border-neutral-800 rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden text-neutral-100">
        
        {/* ============================================================== */}
        {/* HEADER MODAL                                                   */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#0e1424]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Backpack className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide text-amber-300 uppercase flex items-center gap-2">
                Tas Petualang Raden
                <span className="text-xs font-bold text-neutral-400 lowercase font-mono">
                  ({inv.getItemCount()}/30 slot)
                </span>
              </h2>
            </div>
          </div>

          {/* Saldo Gold & Tombol Tutup */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 border border-neutral-800 text-amber-300 text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{currentGold.toLocaleString('id-ID')} G</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Tas [B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB FILTER KATEGORI                                            */}
        {/* ============================================================== */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-neutral-800/80 bg-[#0a0d18] overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          {[
            { id: 'all', label: '🌟 Semua' },
            { id: 'tool', label: '🎣 Alat' },
            { id: 'fish', label: '🐟 Ikan' },
            { id: 'consumable', label: '🍎 Makanan' },
            { id: 'material', label: '📦 Material' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat.id as ItemFilter);
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-neutral-950 font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* KONTEN UTAMA: GRID 30 SLOT + PANEL DETAIL ITEM                 */}
        {/* ============================================================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto p-4 gap-4">
          
          {/* SISI KIRI: GRID 30 PETAK INVENTARIS */}
          <div className="flex-1">
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {Array.from({ length: InventoryManager.MAX_SLOTS }).map((_, idx) => {
                const item = items[idx] || null;
                const isSelected = selectedSlot === idx;
                const isHotbarSlot = idx < InventoryManager.HOTBAR_SLOTS;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedSlot(idx);
                    }}
                    className={`relative aspect-square rounded-md flex flex-col items-center justify-center transition-colors cursor-pointer ${getSlotBorder(
                      item,
                      isSelected
                    )}`}
                  >
                    {/* Penanda Slot Hotbar (1-6) */}
                    {isHotbarSlot && (
                      <span className="absolute top-1 left-1.5 text-[8px] sm:text-[9px] font-mono font-bold text-amber-400/80 leading-none">
                        #{idx + 1}
                      </span>
                    )}

                    {/* Icon Item */}
                    {item ? (
                      <>
                        <span className="text-2xl select-none">
                          {item.icon}
                        </span>
                        {/* Jumlah Tumpukan (Stack) */}
                        {item.quantity > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black text-amber-300 text-[9px] font-bold px-1 rounded border border-neutral-800 leading-tight">
                            {item.quantity}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-neutral-800 text-xs font-bold pointer-events-none">•</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-[10px] text-neutral-500 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span>Slot #1 s/d #6 otomatis muncul di Mini Hotbar bawah layar.</span>
            </div>
          </div>

          {/* SISI KANAN: PANEL DETAIL & AKSI ITEM */}
          <div className="w-full md:w-80 bg-[#0e1424] border border-neutral-800 rounded-lg p-4 flex flex-col justify-between">
            {selectedItem ? (
              <div className="flex flex-col h-full">
                {/* Header Detail */}
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                  <div className="w-14 h-14 rounded-md bg-neutral-950 border border-neutral-800 flex items-center justify-center text-3xl">
                    {selectedItem.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {getRarityBadge(selectedItem.rarity)}
                    </div>
                    <h3 className="text-sm font-bold text-amber-300 truncate">
                      {selectedItem.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 capitalize">
                      {selectedItem.category} • Jumlah: {selectedItem.quantity}x
                    </p>
                  </div>
                </div>

                {/* Deskripsi & Atribut */}
                <div className="py-3 flex-1 space-y-2 text-xs text-neutral-300">
                  <p className="leading-relaxed bg-neutral-950 p-2.5 rounded-md border border-neutral-800/80">
                    {selectedItem.description}
                  </p>

                  {/* Atribut Khusus Ikan */}
                  {selectedItem.category === 'fish' && selectedItem.extraData?.weightKg && (
                    <div className="bg-sky-950/40 border border-sky-800/50 p-2 rounded-md text-sky-300 text-xs flex justify-between items-center font-bold">
                      <span>⚖️ Berat:</span>
                      <span className="text-white">{selectedItem.extraData.weightKg} kg</span>
                    </div>
                  )}

                  {/* Nilai Jual */}
                  {selectedItem.price > 0 && (
                    <div className="bg-amber-950/30 border border-amber-800/40 p-2 rounded-md text-amber-300 text-xs flex justify-between items-center font-bold">
                      <span>💰 Harga Jual:</span>
                      <span className="text-amber-400">+{selectedItem.price} Gold</span>
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
                      className="w-full py-2 rounded-md bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 fill-black" />
                      Jual Ikan (+{selectedItem.price} Gold)
                    </button>
                  )}

                  {/* Makan / Konsumsi */}
                  {selectedItem.usable && (
                    <button
                      type="button"
                      onClick={handleConsumeItem}
                      className="w-full py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Utensils className="w-3.5 h-3.5 stroke-[2]" />
                      Gunakan / Makan Sekarang
                    </button>
                  )}

                  {/* Pasang ke Slot Hotbar jika di luar slot 1-6 */}
                  {selectedSlot !== null && selectedSlot >= InventoryManager.HOTBAR_SLOTS && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-neutral-400">Pasang ke Hotbar:</span>
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4, 5].map((slotIdx) => (
                          <button
                            key={slotIdx}
                            type="button"
                            onClick={() => handleMoveToHotbar(slotIdx)}
                            className="w-6 h-6 rounded bg-neutral-800 hover:bg-amber-400 hover:text-black border border-neutral-700 text-neutral-300 text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                            title={`Pindahkan ke Hotbar Slot ${slotIdx + 1}`}
                          >
                            {slotIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-neutral-500">
                <Info className="w-8 h-8 mb-2 text-neutral-600" />
                <p className="text-xs">Pilih salah satu slot di sebelah kiri untuk melihat detail item atau menjual hasil pancingan.</p>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* FOOTER PANDUAN                                                 */}
        {/* ============================================================== */}
        <div className="px-4 py-2 border-t border-neutral-800 bg-[#0a0d18] text-[10px] text-neutral-400 flex justify-between items-center">
          <span>💡 Tekan tombol <b className="text-amber-300 font-mono">[B]</b> atau [✕] untuk menutup tas sewaktu-waktu.</span>
          <span className="hidden sm:inline font-mono text-[9px] text-neutral-500">RADENWORLD INVENTORY</span>
        </div>
      </div>
    </div>
  );
};
