/**
 * ============================================================================
 * FILE: resources/js/game/ui/PharmacyModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Apotek Farma Raden - Toko Ramuan Ajaib Resmi RadenWorld.
 * 
 * KATALOG RESMI (7 RAMUAN BERLIAN):
 * 1. Ramuan Invisible: 1000 Berlian
 * 2. Ramuan Lari Cepat: 150 Berlian
 * 3. Ramuan Lompat Tinggi: 150 Berlian
 * 4. Ramuan Tiga Kali Lompat: 150 Berlian
 * 5. Ramuan Keberuntungan Level 1 (Mancing): 150 Berlian
 * 6. Ramuan Keberuntungan Level 2 (Mancing): 250 Berlian
 * 7. Ramuan Keberuntungan Level 3 (Mancing): 350 Berlian
 * 
 * ATURAN KHUSUS:
 * - Catatan penting: Ramuan ini tidak bekerja di minigame (sepakbola, basket, volly).
 * - Khusus Role Admin: Berlian unlimited (label 99999999999 & saldo tidak berkurang).
 * - UI elegan, sederhana, responsif, tidak alay, performa ringan.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Gem, ShoppingBag, Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { EventBus } from '../core/EventBus';

export interface PharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerDiamonds: number;
  onUpdateDiamonds: (newDiamonds: number) => void;
  isAdmin?: boolean;
}

export interface IPotionCatalogItem {
  id: string;
  potionType: 'invisible' | 'speed' | 'high_jump' | 'triple_jump' | 'luck_1' | 'luck_2' | 'luck_3';
  name: string;
  icon: string;
  priceDiamond: number;
  durationSec: number;
  effect: string;
  description: string;
  rarity: 'Uncommon' | 'Rare' | 'Legendary';
}

export const PHARMACY_POTIONS: IPotionCatalogItem[] = [
  {
    id: 'pot_invisible',
    potionType: 'invisible',
    name: 'Ramuan Invisible',
    icon: '👻',
    priceDiamond: 1000,
    durationSec: 60,
    effect: 'Tubuh Menghilang / Tembus Pandang Gaib (Durasi 60 Detik)',
    description: 'Elixir misterius kabut malam yang membuat karaktermu tembus pandang (transparan) sehingga sulit dilihat oleh pemain lain.',
    rarity: 'Legendary',
  },
  {
    id: 'pot_speed',
    potionType: 'speed',
    name: 'Ramuan Lari Cepat',
    icon: '⚡',
    priceDiamond: 150,
    durationSec: 60,
    effect: 'Kecepatan Lari +60% Lincah (Durasi 60 Detik)',
    description: 'Fermentasi akar ginseng kilat nusantara. Memberikan dorongan langkah lincah dan gesit menjelajahi seluruh peta.',
    rarity: 'Rare',
  },
  {
    id: 'pot_high_jump',
    potionType: 'high_jump',
    name: 'Ramuan Lompat Tinggi',
    icon: '🦘',
    priceDiamond: 150,
    durationSec: 60,
    effect: 'Lompatan Vertikal Super 1.8x Tinggi (Durasi 60 Detik)',
    description: 'Ekstrak pegas alami yang meringankan bobot tubuh, memungkinkan karakter melompat tinggi melintasi rintangan.',
    rarity: 'Rare',
  },
  {
    id: 'pot_triple_jump',
    potionType: 'triple_jump',
    name: 'Ramuan Tiga Kali Lompat',
    icon: '🪶',
    priceDiamond: 150,
    durationSec: 60,
    effect: 'Bisa 3x Melompat Beruntun di Udara (Durasi 60 Detik)',
    description: 'Ramuan kepakan sayap elang surgawi. Karakter dapat melakukan hentakan lompatan hingga 3 kali di udara sebelum mendarat.',
    rarity: 'Rare',
  },
  {
    id: 'pot_luck_1',
    potionType: 'luck_1',
    name: 'Ramuan Keberuntungan Level 1 (Mancing)',
    icon: '🎣',
    priceDiamond: 150,
    durationSec: 180,
    effect: 'Tarikan Ikan +30% Lebih Cepat & Peluang Strike (Durasi 180 Detik)',
    description: 'Aroma pemikat alami yang merangsang selera ikan teluk dan kolam air tawar untuk lebih cepat menyambar joran.',
    rarity: 'Uncommon',
  },
  {
    id: 'pot_luck_2',
    potionType: 'luck_2',
    name: 'Ramuan Keberuntungan Level 2 (Mancing)',
    icon: '🌊',
    priceDiamond: 250,
    durationSec: 180,
    effect: 'Tarikan +60% Cepat & Peluang Ikan Rare +40% (Durasi 180 Detik)',
    description: 'Minyak lumut bahari berkilau yang disukai ikan patin dan gurame berbobot berat di dermaga perairan.',
    rarity: 'Rare',
  },
  {
    id: 'pot_luck_3',
    potionType: 'luck_3',
    name: 'Ramuan Keberuntungan Level 3 (Mancing)',
    icon: '🌟',
    priceDiamond: 350,
    durationSec: 180,
    effect: 'Ikan Menyambar Kilat & Peluang Rare/Legendary +80% (180 Detik)',
    description: 'Tetesan mutiara naga pusaka samudra. Ikan raksasa legendaris seperti Arwana Emas langsung terpikat menyambar kail!',
    rarity: 'Legendary',
  },
];

export const PharmacyModal: React.FC<PharmacyModalProps> = ({
  isOpen,
  onClose,
  playerDiamonds,
  onUpdateDiamonds,
  isAdmin: propIsAdmin,
}) => {
  const sound = SoundManager.getInstance();
  const inv = InventoryManager.getInstance();

  // Deteksi status Super Admin
  const isUserAdmin = useMemo(() => {
    if (propIsAdmin) return true;
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return Boolean(
        u.is_super_admin ||
        u.role === 'super_admin' ||
        u.role === 'admin' ||
        u.email === 'radencakstudio@gmail.com' ||
        u.name?.toUpperCase() === 'RADEN'
      );
    } catch (e) {
      return false;
    }
  }, [propIsAdmin]);

  const effectiveDiamonds = isUserAdmin ? 99999999999 : playerDiamonds;
  const diamondDisplay = isUserAdmin ? '99999999999' : effectiveDiamonds.toLocaleString('id-ID');

  const [selectedPotionId, setSelectedPotionId] = useState<string>('pot_invisible');
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedItem = PHARMACY_POTIONS.find((p) => p.id === selectedPotionId) || PHARMACY_POTIONS[0];
  const totalPrice = selectedItem.priceDiamond * purchaseQty;

  const handleBuyPotion = () => {
    if (!isUserAdmin && effectiveDiamonds < totalPrice) {
      sound.playClick();
      alert(`⚠️ Berlianmu tidak mencukupi! Butuh ${totalPrice.toLocaleString('id-ID')} 💎, kamu memiliki ${effectiveDiamonds.toLocaleString('id-ID')} 💎.`);
      return;
    }

    // Siapkan item untuk dimasukkan ke inventaris
    const newItem: IInventoryItem = {
      id: `${selectedItem.id}_${Date.now()}`,
      name: selectedItem.name,
      category: 'consumable',
      rarity: selectedItem.rarity,
      icon: selectedItem.icon,
      quantity: purchaseQty,
      maxStack: 99,
      description: `${selectedItem.description} (Efek: ${selectedItem.effect}) [⚠️ Tidak berlaku di lapangan minigame: sepakbola, basket, volly]`,
      price: selectedItem.priceDiamond * 50,
      diamondPrice: selectedItem.priceDiamond,
      usable: true,
      extraData: {
        potionType: selectedItem.potionType,
        durationSec: selectedItem.durationSec,
        effectName: selectedItem.name,
      },
    };

    const added = inv.addItem(newItem);
    if (!added) {
      sound.playClick();
      alert('⚠️ Tas Punggungmu penuh! Kosongkan slot terlebih dahulu untuk menampung ramuan.');
      return;
    }

    sound.playSuccess();

    if (!isUserAdmin) {
      const nextDiamonds = Math.max(0, effectiveDiamonds - totalPrice);
      onUpdateDiamonds(nextDiamonds);
      try {
        localStorage.setItem('raden_player_diamonds', nextDiamonds.toString());
      } catch (e) {}
    } else {
      onUpdateDiamonds(99999999999);
      try {
        localStorage.setItem('raden_player_diamonds', '99999999999');
      } catch (e) {}
    }

    setSuccessNote(`✨ Berhasil membeli ${purchaseQty}x ${selectedItem.name}! Item siap diminum dari Tas.`);
    setPurchaseQty(1);

    EventBus.emit('new-chat-message', {
      id: `pharm_msg_${Date.now()}`,
      sender: 'APOTEK FARMA',
      text: `🧪 Kamu membeli ${purchaseQty}x ${selectedItem.name} seharga ${totalPrice.toLocaleString('id-ID')} Berlian!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 sm:p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
        {/* Header Modal Apotek */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-white font-mono">
                  APOTEK FARMA SEHAT RADEN
                </h2>
                <span className="text-[9px] sm:text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded">
                  RAMUAN AJAIB
                </span>
                {isUserAdmin && (
                  <span className="text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded">
                    👑 ADMIN (UNLIMITED)
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Katalog resmi 7 ramuan pusaka berkhasiat peningkat kemampuan fisik & keberuntungan.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Peringatan / Catatan Minigame (Wajib Sesuai Instruksi) */}
        <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-amber-950/40 border-b border-amber-900/60 flex items-center justify-between gap-2 sm:gap-3 text-xs font-mono text-amber-300 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[10px] sm:text-xs">
              <strong>Catatan:</strong> Ramuan ini tidak bekerja di minigame (sepakbola, basket, volly).
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-cyan-950/60 border border-cyan-800/60 rounded-md text-cyan-300 font-bold shrink-0 text-xs">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span>{diamondDisplay} BERLIAN</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* Kolom Kiri: Katalog 7 Ramuan */}
          <div className="md:col-span-7 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-wider">
                PILIH RAMUAN ({PHARMACY_POTIONS.length} ITEM)
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">Klik item untuk melihat khasiat</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
              {PHARMACY_POTIONS.map((potion) => {
                const isSelected = selectedPotionId === potion.id;
                return (
                  <div
                    key={potion.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedPotionId(potion.id);
                      setSuccessNote(null);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-900 border-cyan-500 shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2 bg-neutral-900 rounded-md border border-neutral-800 shrink-0">
                        {potion.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold font-mono text-white truncate">{potion.name}</span>
                          <span
                            className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                              potion.rarity === 'Legendary'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : potion.rarity === 'Rare'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {potion.rarity}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{potion.effect}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-xs shrink-0 pl-3">
                      <Gem className="w-3.5 h-3.5" />
                      <span>{potion.priceDiamond.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Rincian & Tombol Beli */}
          <div className="md:col-span-5 bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                <span className="text-4xl p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 shrink-0">
                  {selectedItem.icon}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedItem.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono font-bold mt-0.5">
                    <Gem className="w-3.5 h-3.5" />
                    <span>{selectedItem.priceDiamond.toLocaleString('id-ID')} Berlian / botol</span>
                  </div>
                </div>
              </div>

              {successNote && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successNote}</span>
                </div>
              )}

              <div>
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">
                  Khasiat & Efek Ramuan:
                </span>
                <p className="text-xs text-neutral-200 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-sans leading-relaxed">
                  {selectedItem.effect}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">
                  Keterangan:
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">{selectedItem.description}</p>
              </div>

              {/* Jumlah Pembelian */}
              <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="text-xs font-bold font-mono text-neutral-300">Jumlah Botol:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPurchaseQty((prev) => Math.max(1, prev - 1));
                    }}
                    className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold font-mono text-cyan-300 w-8 text-center">{purchaseQty}</span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPurchaseQty((prev) => Math.min(20, prev + 1));
                    }}
                    className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPurchaseQty(5);
                    }}
                    className="px-2 py-1 text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded ml-1 transition-colors"
                  >
                    5x
                  </button>
                </div>
              </div>
            </div>

            {/* Total & Tombol Beli */}
            <div className="pt-4 border-t border-neutral-800 mt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center font-mono">
                <span className="text-xs text-neutral-400">Total Harga:</span>
                <div className="flex items-center gap-1.5 text-base font-bold text-cyan-400">
                  <Gem className="w-4 h-4" />
                  <span>
                    {isUserAdmin ? '0 (Unlimited Admin)' : `${totalPrice.toLocaleString('id-ID')} Berlian`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBuyPotion}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>BELI DENGAN BERLIAN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
