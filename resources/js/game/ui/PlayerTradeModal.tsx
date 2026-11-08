/**
 * ============================================================================
 * FILE: resources/js/game/ui/PlayerTradeModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Sistem Trade (Barter & Pertukaran Barang) Antar Pemain RadenWorld.
 * - Mengizinkan pertukaran SEMUA jenis item di Tas (Ikan, Hasil Panen, Buah,
 *   Makanan, Ramuan, Alat, Material) KECUALI Biji / Bibit Tanaman (seed).
 * - Terhubung secara real-time melalui NetworkManager WebSocket & InventoryManager.
 * - Responsif penuh untuk layar PC Desktop maupun Mobile (Vertikal & Horizontal).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { NetworkManager } from '../core/NetworkManager';

export interface PlayerTradeModalProps {
  isOpen: boolean;
  targetPlayerName: string;
  targetPlayerId?: string | number;
  onClose: () => void;
}

interface SelectedTradeEntry {
  slotIndex: number;
  item: IInventoryItem;
  tradeQty: number;
}

type FilterCategory = 'all_tradeable' | 'fish' | 'crop' | 'consumable' | 'tool_material';

export const PlayerTradeModal: React.FC<PlayerTradeModalProps> = ({
  isOpen,
  targetPlayerName,
  targetPlayerId,
  onClose,
}) => {
  const sound = SoundManager.getInstance();
  const inv = InventoryManager.getInstance();

  const [inventoryItems, setInventoryItems] = useState<(IInventoryItem | null)[]>(() =>
    inv.getItems()
  );
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all_tradeable');
  const [selectedSlots, setSelectedSlots] = useState<Record<number, number>>({});
  const [tradeNote, setTradeNote] = useState<string>('');
  const [tradeStatusMsg, setTradeStatusMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setInventoryItems(inv.getItems());
    setSelectedSlots({});
    setTradeNote('');
    setTradeStatusMsg(null);
    setIsSubmitting(false);

    const handleInvUpdate = () => {
      setInventoryItems(inv.getItems());
    };
    EventBus.on('inventory-updated', handleInvUpdate);
    return () => {
      EventBus.off('inventory-updated', handleInvUpdate);
    };
  }, [isOpen, inv]);

  // Cek apakah item boleh di-trade (Semua boleh KECUALI Biji / Seed)
  const isItemTradeable = (item: IInventoryItem | null): boolean => {
    if (!item) return false;
    if (InventoryManager.isSeedItem(item)) return false;
    return true;
  };

  // Daftar slot inventaris yang terisi
  const filledSlots = useMemo(() => {
    const list: {
      slotIndex: number;
      item: IInventoryItem;
      tradeable: boolean;
    }[] = [];

    inventoryItems.forEach((item, idx) => {
      if (!item || item.quantity <= 0) return;
      const tradeable = isItemTradeable(item);

      if (activeFilter === 'fish' && item.category !== 'fish') return;
      if (activeFilter === 'crop' && item.category !== 'crop') return;
      if (activeFilter === 'consumable' && item.category !== 'consumable') return;
      if (
        activeFilter === 'tool_material' &&
        item.category !== 'tool' &&
        item.category !== 'material'
      ) {
        return;
      }

      list.push({
        slotIndex: idx,
        item,
        tradeable,
      });
    });

    return list;
  }, [inventoryItems, activeFilter]);

  const selectedEntries: SelectedTradeEntry[] = useMemo(() => {
    const entries: SelectedTradeEntry[] = [];
    Object.entries(selectedSlots).forEach(([slotStr, qty]) => {
      const slotIdx = Number(slotStr);
      const item = inventoryItems[slotIdx];
      if (item && isItemTradeable(item) && qty > 0) {
        entries.push({
          slotIndex: slotIdx,
          item,
          tradeQty: Math.min(qty, item.quantity),
        });
      }
    });
    return entries;
  }, [selectedSlots, inventoryItems]);

  const handleToggleSlot = (slotIndex: number, item: IInventoryItem) => {
    if (!isItemTradeable(item)) {
      sound.playError();
      setTradeStatusMsg('🚫 Biji / Bibit tanaman dikunci dan tidak dapat di-trade!');
      return;
    }

    sound.playClick();
    setTradeStatusMsg(null);
    setSelectedSlots((prev) => {
      const next = { ...prev };
      if (next[slotIndex]) {
        delete next[slotIndex];
      } else {
        next[slotIndex] = 1;
      }
      return next;
    });
  };

  const handleAdjustQty = (slotIndex: number, maxQty: number, delta: number) => {
    sound.playClick();
    setSelectedSlots((prev) => {
      const cur = prev[slotIndex] || 1;
      const updated = Math.max(1, Math.min(maxQty, cur + delta));
      return { ...prev, [slotIndex]: updated };
    });
  };

  const handleExecuteTrade = () => {
    if (selectedEntries.length === 0) {
      sound.playError();
      setTradeStatusMsg('⚠️ Pilih minimal 1 barang (selain biji) untuk di-trade!');
      return;
    }

    setIsSubmitting(true);
    sound.playCoin();

    const tradedItemsPayload = selectedEntries.map((entry) => ({
      item: {
        ...entry.item,
        quantity: entry.tradeQty,
      },
      qty: entry.tradeQty,
    }));

    // Kurangi barang yang dikirim dari inventaris lokal
    const currentAll = inv.getItems();
    selectedEntries.forEach((entry) => {
      const slotItem = currentAll[entry.slotIndex];
      if (slotItem) {
        const remaining = slotItem.quantity - entry.tradeQty;
        if (remaining <= 0) {
          (inv as any).items[entry.slotIndex] = null;
        } else {
          slotItem.quantity = remaining;
          (inv as any).items[entry.slotIndex] = { ...slotItem };
        }
      }
    });
    inv.saveToStorage();
    setInventoryItems(inv.getItems());

    // Kirim paket trade ke pemain tujuan melalui NetworkManager WebSocket
    NetworkManager.getInstance().sendTradeOffer({
      targetId: targetPlayerId ? String(targetPlayerId) : undefined,
      targetName: targetPlayerName,
      items: tradedItemsPayload.map((p) => p.item),
      note: tradeNote.trim(),
    });

    const summaryText = selectedEntries
      .map((e) => `${e.tradeQty}x ${e.item.name}`)
      .join(', ');

    EventBus.emit('new-chat-message', {
      id: `trade_ok_${Date.now()}`,
      sender: 'SISTEM TRADE',
      text: `🔄 Berhasil melakukan Trade dengan ${targetPlayerName}: Mengirim ${summaryText}!`,
      timestamp: Date.now(),
      isSystem: true,
    });

    setSelectedSlots({});
    setTradeStatusMsg(`✅ Trade berhasil dikirim ke ${targetPlayerName}: ${summaryText}`);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="ui-modal-backdrop !z-[85] font-pixel select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl clay-panel landscape-compact-modal max-h-[calc(100dvh-1rem)] flex flex-col overflow-hidden text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL TRADE (BERSIH TANPA LOGO / ICON) */}
        <div className="clay-header landscape-compact-header px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-base font-bold text-black uppercase tracking-wide truncate">
                TRADE BARANG: {targetPlayerName}
              </h2>
              <span className="clay-badge-secondary text-[9.5px] font-bold px-2 py-0.5 text-black">
                Semua Item Kecuali Biji
              </span>
            </div>
            <p className="text-[10px] text-black/80 font-medium truncate mt-0.5">
              Pilih Ikan, Hasil Panen, Buah, Makanan, Ramuan, atau Alat untuk ditukarkan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center shrink-0"
            title="Tutup Trade"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FILTER KATEGORI ITEM (BERSIH TANPA EMOJI / LOGO) */}
        <div className="px-3.5 sm:px-5 py-2 border-b-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'all_tradeable', label: 'Semua Item Tas' },
            { id: 'fish', label: 'Ikan Tangkapan' },
            { id: 'crop', label: 'Hasil Panen & Buah' },
            { id: 'consumable', label: 'Makanan & Ramuan' },
            { id: 'tool_material', label: 'Alat & Material' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveFilter(tab.id as FilterCategory);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold shrink-0 ${
                activeFilter === tab.id
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ISI UTAMA: KIRI (DAFTAR BARANG DI TAS) & KANAN (KERANJANG TRADE) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 landscape:grid-cols-12 overflow-y-auto md:overflow-hidden landscape:overflow-hidden custom-scrollbar bg-[#FFF8EA]">
          {/* KOLOM KIRI: DAFTAR ITEM DI TAS */}
          <div className="md:col-span-7 landscape:col-span-7 p-3 sm:p-4 md:overflow-y-auto landscape:overflow-y-auto custom-scrollbar border-b-2 md:border-b-0 md:border-r-2 landscape:border-b-0 landscape:border-r-2 border-[#5C3A21]/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-black">
              <span>Pilih Barang dari Tas Kamu:</span>
              <span className="text-[10px] clay-badge-neutral px-2 py-0.5">
                Biji Tanaman Tidak Bisa Di-Trade
              </span>
            </div>

            {filledSlots.length === 0 ? (
              <div className="clay-card p-6 text-center space-y-1.5">
                <div className="text-xs font-bold text-black">
                  Tidak ada barang pada kategori ini di dalam Tas.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filledSlots.map(({ slotIndex, item, tradeable }) => {
                  const isPicked = Boolean(selectedSlots[slotIndex]);
                  const pickedQty = selectedSlots[slotIndex] || 0;

                  return (
                    <div
                      key={slotIndex}
                      onClick={() => handleToggleSlot(slotIndex, item)}
                      className={`p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1.5 ${
                        !tradeable
                          ? 'bg-gray-200/80 border-[#5C3A21]/50 opacity-65 cursor-not-allowed'
                          : isPicked
                          ? 'clay-card-primary border-[#5C3A21] cursor-pointer'
                          : 'clay-card border-[#5C3A21] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-black truncate uppercase">
                            {item.name}
                          </div>
                          <div className="text-[10px] font-semibold text-black/75 mt-0.5">
                            Stok: {item.quantity}x
                            {item.extraData?.weightKg
                              ? ` • ${item.extraData.weightKg} kg`
                              : ''}
                          </div>
                        </div>

                        {!tradeable ? (
                          <span className="clay-badge-cocoa text-white text-[9px] font-bold px-2 py-0.5 shrink-0">
                            TERKUNCI (BIJI)
                          </span>
                        ) : isPicked ? (
                          <span className="clay-badge-secondary text-black text-[9.5px] font-bold px-2 py-0.5 shrink-0">
                            DIPILIH: {pickedQty}x
                          </span>
                        ) : null}
                      </div>

                      {item.extraData?.effect && (
                        <div className="text-[9.5px] font-semibold text-black bg-[#FFF8EA]/90 px-2 py-0.5 rounded border border-[#5C3A21]/30 truncate">
                          Efek: {item.extraData.effect}
                        </div>
                      )}

                      {!tradeable && (
                        <div className="text-[9.5px] font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-400">
                          Biji / bibit tanaman tidak dapat di-trade
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* KOLOM KANAN: RINGKASAN PAKET TRADE */}
          <div className="md:col-span-5 landscape:col-span-5 p-3 sm:p-4 flex flex-col justify-between gap-3 md:overflow-y-auto landscape:overflow-y-auto custom-scrollbar">
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-black uppercase flex items-center justify-between">
                <span>Barang yang Akan Di-Trade:</span>
                <span className="clay-badge-primary px-2 py-0.5 text-[10px]">
                  {selectedEntries.length} Jenis
                </span>
              </div>

              {selectedEntries.length === 0 ? (
                <div className="clay-card p-4 text-center text-xs text-black/80 font-medium">
                  Ketuk barang di sebelah kiri (selain biji) untuk dimasukkan ke daftar Trade.
                </div>
              ) : (
                <div className="space-y-2 max-h-[210px] overflow-y-auto custom-scrollbar pr-1">
                  {selectedEntries.map(({ slotIndex, item, tradeQty }) => (
                    <div
                      key={slotIndex}
                      className="clay-card p-2 border-2 border-[#5C3A21] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-black truncate uppercase">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-black/75 font-semibold">
                          Maks: {item.quantity}x
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAdjustQty(slotIndex, item.quantity, -1)}
                          className="w-6 h-6 clay-btn-neutral flex items-center justify-center text-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-0.5 clay-badge-secondary text-xs font-bold text-black min-w-[32px] text-center">
                          {tradeQty}x
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustQty(slotIndex, item.quantity, 1)}
                          className="w-6 h-6 clay-btn-neutral flex items-center justify-center text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pesan Singkat Trade */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-black">
                  Catatan Trade (Opsional):
                </label>
                <input
                  type="text"
                  value={tradeNote}
                  onChange={(e) => setTradeNote(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  maxLength={60}
                  placeholder={`Pesan untuk ${targetPlayerName}...`}
                  className="clay-input w-full px-2.5 py-1.5 text-xs text-black"
                />
              </div>

              {tradeStatusMsg && (
                <div className="clay-card-secondary p-2.5 border-2 border-[#5C3A21] text-xs font-bold text-black">
                  {tradeStatusMsg}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t-2 border-[#5C3A21]/30">
              <button
                type="button"
                disabled={isSubmitting || selectedEntries.length === 0}
                onClick={handleExecuteTrade}
                className="w-full py-2.5 px-4 clay-btn-primary text-black font-bold text-xs sm:text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>KIRIM TRADE KE {targetPlayerName}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full py-1.5 px-3 clay-btn-neutral text-black font-bold text-xs uppercase"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

