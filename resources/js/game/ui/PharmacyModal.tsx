/**
 * ============================================================================
 * FILE: resources/js/game/ui/PharmacyModal.tsx
 * ============================================================================
 * Modal Apotek Farma Sehat Raden - Toko Ramuan Berkhasiat (Cozycore Clay-Pixel).
 * - Tata Letak: Left Sidebar Navigation (.clay-modal-shell, .clay-sidebar, .clay-main-pane).
 * - Mata Uang: 100% Koin Emas (Gold / G) - Bebas Diamond / Bebas Top-up.
 * - Desain: Chunky Pastel Pixel, Bevel biscuit/clay, tanpa hover, tanpa glow,
 *           outline 1-2px #5C3A21, teks hanya #000000 dan #FFFFFF.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Coins,
  ShoppingBag,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Zap,
  Fish,
  Ghost,
  BookOpen,
  Filter,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { EventBus } from '../core/EventBus';

export interface PharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  onUpdateGold: (newGold: number) => void;
  isAdmin?: boolean;
}

export type PharmacyTab = 'all' | 'movement' | 'fishing' | 'magic' | 'rules';

export interface IPotionCatalogItem {
  id: string;
  category: 'movement' | 'fishing' | 'magic';
  potionType:
    | 'invisible'
    | 'speed'
    | 'high_jump'
    | 'triple_jump'
    | 'luck_1'
    | 'luck_2'
    | 'luck_3';
  name: string;
  icon: string;
  priceGold: number;
  durationSec: number;
  effect: string;
  description: string;
  rarity: 'Uncommon' | 'Rare' | 'Legendary';
}

export const PHARMACY_POTIONS: IPotionCatalogItem[] = [
  {
    id: 'pot_speed',
    category: 'movement',
    potionType: 'speed',
    name: 'Ramuan Lari Cepat',
    icon: '⚡',
    priceGold: 250,
    durationSec: 60,
    effect: 'Kecepatan Lari +60% Lincah (Durasi 60 Detik)',
    description:
      'Fermentasi akar ginseng kilat nusantara. Memberikan dorongan langkah lincah menjelajahi seluruh peta kota.',
    rarity: 'Rare',
  },
  {
    id: 'pot_high_jump',
    category: 'movement',
    potionType: 'high_jump',
    name: 'Ramuan Lompat Tinggi',
    icon: '🦘',
    priceGold: 250,
    durationSec: 60,
    effect: 'Lompatan Vertikal Super 1.8x Tinggi (Durasi 60 Detik)',
    description:
      'Ekstrak pegas tanaman hutan tropis yang meringankan bobot tubuh untuk melompat tinggi melintasi rintangan.',
    rarity: 'Rare',
  },
  {
    id: 'pot_triple_jump',
    category: 'movement',
    potionType: 'triple_jump',
    name: 'Ramuan Tiga Kali Lompat',
    icon: '🪶',
    priceGold: 300,
    durationSec: 60,
    effect: 'Bisa 3x Melompat Beruntun di Udara (Durasi 60 Detik)',
    description:
      'Ramuan kepakan sayap burung elang surgawi. Karakter dapat melompat hingga 3 kali di udara sebelum mendarat.',
    rarity: 'Rare',
  },
  {
    id: 'pot_luck_1',
    category: 'fishing',
    potionType: 'luck_1',
    name: 'Ramuan Hoki Mancing Lv 1',
    icon: '🎣',
    priceGold: 300,
    durationSec: 180,
    effect: 'Tarikan Ikan +30% Lebih Cepat & Peluang Strike (180 Detik)',
    description:
      'Aroma pemikat alami yang merangsang selera ikan kolam dan teluk untuk segera menyambar joran.',
    rarity: 'Uncommon',
  },
  {
    id: 'pot_luck_2',
    category: 'fishing',
    potionType: 'luck_2',
    name: 'Ramuan Hoki Mancing Lv 2',
    icon: '🌊',
    priceGold: 550,
    durationSec: 180,
    effect: 'Tarikan +60% Cepat & Peluang Ikan Langka +40% (180 Detik)',
    description:
      'Minyak lumut bahari berkilau yang disukai ikan patin dan gurame berbobot besar di dermaga perairan.',
    rarity: 'Rare',
  },
  {
    id: 'pot_luck_3',
    category: 'fishing',
    potionType: 'luck_3',
    name: 'Ramuan Hoki Mancing Lv 3 (Pusaka)',
    icon: '🌟',
    priceGold: 850,
    durationSec: 180,
    effect: 'Ikan Menyambar Kilat & Peluang Pusaka/Legendary +80% (180 Detik)',
    description:
      'Tetesan mutiara naga pusaka samudra. Ikan legendaris seperti Arwana Emas langsung terpikat menyambar kail!',
    rarity: 'Legendary',
  },
  {
    id: 'pot_invisible',
    category: 'magic',
    potionType: 'invisible',
    name: 'Ramuan Halimun Invisible',
    icon: '👻',
    priceGold: 1500,
    durationSec: 60,
    effect: 'Tubuh Menghilang / Tembus Pandang Gaib (Durasi 60 Detik)',
    description:
      'Elixir misterius kabut malam yang membuat tubuhmu tembus pandang (transparan) di hadapan pemain lain.',
    rarity: 'Legendary',
  },
];

export const PharmacyModal: React.FC<PharmacyModalProps> = ({
  isOpen,
  onClose,
  playerGold,
  onUpdateGold,
  isAdmin: propIsAdmin,
}) => {
  const sound = SoundManager.getInstance();
  const inv = InventoryManager.getInstance();

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

  const effectiveGold = isUserAdmin ? 99999999999 : playerGold;
  const goldDisplay = isUserAdmin ? '99999999999' : effectiveGold.toLocaleString('id-ID');

  const [activeTab, setActiveTab] = useState<PharmacyTab>('all');
  const [selectedPotionId, setSelectedPotionId] = useState<string>('pot_speed');
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPotions = PHARMACY_POTIONS.filter((p) => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  const selectedItem =
    PHARMACY_POTIONS.find((p) => p.id === selectedPotionId) ||
    filteredPotions[0] ||
    PHARMACY_POTIONS[0];

  const totalPrice = selectedItem.priceGold * purchaseQty;

  const handleBuyPotion = () => {
    if (!isUserAdmin && effectiveGold < totalPrice) {
      sound.playClick();
      alert(
        `Koin Emas tidak mencukupi! Butuh ${totalPrice.toLocaleString(
          'id-ID'
        )} Koin, kamu memiliki ${effectiveGold.toLocaleString('id-ID')} Koin.`
      );
      return;
    }

    // Gunakan ID tetap agar item dapat ditumpuk rapi di dalam tas
    const newItem: IInventoryItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      category: 'consumable',
      rarity: selectedItem.rarity,
      icon: selectedItem.icon,
      quantity: purchaseQty,
      maxStack: 99,
      description: `${selectedItem.description} (Efek: ${selectedItem.effect}) [Tidak berlaku di lapangan minigame]`,
      price: Math.floor(selectedItem.priceGold * 0.5),
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
      alert('Tas Punggungmu penuh! Kosongkan slot terlebih dahulu.');
      return;
    }

    sound.playSuccess();

    if (!isUserAdmin) {
      const nextGold = Math.max(0, effectiveGold - totalPrice);
      onUpdateGold(nextGold);
      try {
        localStorage.setItem('raden_player_gold', nextGold.toString());
      } catch (e) {}
    }

    setSuccessNote(
      `Berhasil membeli ${purchaseQty}x ${selectedItem.name}! Buka Tas [B] untuk meminumnya.`
    );
    setPurchaseQty(1);

    EventBus.emit('new-chat-message', {
      id: `pharm_msg_${Date.now()}`,
      sender: 'APOTEK SEHAT',
      text: `Kamu membeli ${purchaseQty}x ${selectedItem.name} seharga ${totalPrice.toLocaleString(
        'id-ID'
      )} Koin Emas!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  return (
    <div
      className="ui-modal-backdrop z-[100] select-none"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="clay-modal-shell max-w-4xl text-black">
        {/* SIDEBAR SEBELAH KIRI */}
        <aside className="clay-sidebar">
          <div className="clay-sidebar-header">
            <div className="clay-sidebar-brand-icon">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="clay-sidebar-brand-text">
              <span className="clay-sidebar-title">APOTEK FARMA</span>
              <span className="clay-sidebar-subtitle">RAMUAN RESMI</span>
            </div>
          </div>

          <div className="clay-sidebar-nav">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('all');
                setSuccessNote(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'all' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Filter className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Semua Ramuan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('movement');
                setSuccessNote(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'movement' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Zap className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Fisik & Gerak</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('fishing');
                setSuccessNote(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'fishing' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Fish className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Hoki Mancing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('magic');
                setSuccessNote(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'magic' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Ghost className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Spesial Gaib</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('rules');
                setSuccessNote(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'rules' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <BookOpen className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Aturan Pakai</span>
            </button>
          </div>

          <div className="clay-sidebar-footer">
            <div className="clay-badge-secondary flex items-center gap-1.5 px-2 py-1.5 text-black font-bold text-[10px] w-full justify-center">
              <Coins className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">{goldDisplay} G</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT PANE */}
        <main className="clay-main-pane">
          {/* TOPBAR */}
          <header className="clay-main-topbar">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold text-black uppercase">
                  {activeTab === 'all' && 'Katalog Lengkap Ramuan Farma'}
                  {activeTab === 'movement' && 'Ramuan Peningkat Fisik & Langkah'}
                  {activeTab === 'fishing' && 'Ramuan Keberuntungan Bahari & Kolam'}
                  {activeTab === 'magic' && 'Ramuan Misterius & Halimun Gaib'}
                  {activeTab === 'rules' && 'Buku Petunjuk & Ketentuan Medis'}
                </h2>
                <span className="clay-badge-secondary text-[9px] font-bold px-1.5 py-0.5 text-black">
                  100% KOIN EMAS
                </span>
                {isUserAdmin && (
                  <span className="clay-badge-cocoa text-[9px] font-bold px-1.5 py-0.5 text-white">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-black hidden sm:block truncate">
                Resep ramuan alami nusantara tanpa bahan kimia. Diminum langsung dari Tas Petualang.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
              aria-label="Tutup Apotek"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </header>

          {/* PERINGATAN RESMI */}
          <div className="px-3 sm:px-4 py-1.5 bg-[#FFF8EA] border-b-2 border-[#5C3A21] flex items-center justify-between gap-2 text-xs text-black shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="text-[10px] font-bold truncate">
                Efek ramuan tidak aktif di arena minigame (sepakbola, basket, volly) demi keadilan olahraga.
              </span>
            </div>
          </div>

          {/* BODY */}
          <div className="clay-main-body">
            {activeTab === 'rules' ? (
              <div className="clay-card p-4 sm:p-5 flex flex-col gap-3 text-black">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#5C3A21]">
                  <BookOpen className="w-5 h-5 stroke-[2.5]" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase">Panduan Minum Ramuan Raden</h3>
                </div>

                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="clay-card-secondary p-3">
                    <span className="font-bold block mb-1">1. Cara Mengonsumsi:</span>
                    <p className="leading-relaxed">
                      Buka Tas Punggungmu dengan menekan tombol <strong>[B]</strong> di keyboard atau ikon tas di layar HP.
                      Pilih botol ramuan, lalu tekan tombol <strong>"PAKAI/GUNAKAN"</strong>.
                    </p>
                  </div>

                  <div className="clay-card-secondary p-3">
                    <span className="font-bold block mb-1">2. Durasi & Efek:</span>
                    <p className="leading-relaxed">
                      Efek ramuan fisik bertahan selama 60 detik, sedangkan ramuan hoki memancing bertahan selama 180 detik.
                      Ikon buff akan tampil aktif di layar karakter.
                    </p>
                  </div>

                  <div className="clay-card-secondary p-3">
                    <span className="font-bold block mb-1">3. Bebas Berlian / Diamond:</span>
                    <p className="leading-relaxed">
                      Seluruh transaksi di Apotek Farma menggunakan Koin Emas resmi hasil kerja keras, memancing, bertani, dan menjawab kuis sekolah.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* Kolom Kiri: Daftar Ramuan */}
                <div className="md:col-span-7 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-black font-bold">
                    <span>DAFTAR RAMUAN ({filteredPotions.length})</span>
                    <span className="text-[10px]">Pilih untuk beli</span>
                  </div>

                  <div className="flex flex-col gap-2 md:max-h-[380px] md:overflow-y-auto custom-scrollbar pr-1">
                    {filteredPotions.map((potion) => {
                      const isSelected = selectedPotionId === potion.id;
                      return (
                        <button
                          key={potion.id}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedPotionId(potion.id);
                            setSuccessNote(null);
                          }}
                          className={`p-2 sm:p-2.5 text-left flex items-center justify-between gap-2.5 text-black ${
                            isSelected ? 'clay-btn-secondary' : 'clay-btn-neutral'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl w-9 h-9 bg-[#FFF8EA] rounded-lg border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
                              {potion.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-black truncate">
                                  {potion.name}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 ${
                                    potion.rarity === 'Legendary'
                                      ? 'clay-badge-primary text-black'
                                      : 'clay-badge-neutral text-black'
                                  }`}
                                >
                                  {potion.rarity}
                                </span>
                              </div>
                              <p className="text-[10px] text-black mt-0.5 truncate">{potion.effect}</p>
                            </div>
                          </div>

                          <div className="clay-badge-primary flex items-center gap-1 px-2 py-1 text-black font-bold text-xs shrink-0">
                            <Coins className="w-3 h-3 stroke-[2.5]" />
                            <span>{potion.priceGold.toLocaleString('id-ID')} G</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kolom Kanan: Rincian & Aksi Beli */}
                <div className="md:col-span-5 clay-card p-3.5 flex flex-col justify-between gap-3 text-black">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b-2 border-[#5C3A21]/30">
                      <span className="text-2xl w-10 h-10 bg-[#A8E6CF] rounded-xl border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
                        {selectedItem.icon}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-black leading-tight truncate">
                          {selectedItem.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-black font-bold mt-0.5">
                          <Coins className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{selectedItem.priceGold.toLocaleString('id-ID')} Koin / botol</span>
                        </div>
                      </div>
                    </div>

                    {successNote && (
                      <div className="clay-card-secondary p-2 text-black text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
                        <span>{successNote}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-black font-bold uppercase block mb-1">
                        Khasiat Ramuan:
                      </span>
                      <p className="text-[11px] font-bold text-black bg-[#A8E6CF] p-2 rounded-lg border-2 border-[#5C3A21] leading-snug">
                        {selectedItem.effect}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-black font-bold uppercase block mb-0.5">
                        Keterangan Medis:
                      </span>
                      <p className="text-[10px] text-black leading-snug">{selectedItem.description}</p>
                    </div>

                    {/* Pengatur Jumlah */}
                    <div className="clay-badge-neutral flex items-center justify-between p-2 text-black">
                      <span className="text-[11px] font-bold">Jumlah:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setPurchaseQty((prev) => Math.max(1, prev - 1));
                          }}
                          className="clay-btn-neutral w-6 h-6 text-black flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="text-xs font-bold text-black w-6 text-center">
                          {purchaseQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setPurchaseQty((prev) => Math.min(20, prev + 1));
                          }}
                          className="clay-btn-neutral w-6 h-6 text-black flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setPurchaseQty(5);
                          }}
                          className="clay-btn-secondary px-2 py-0.5 text-[10px] font-bold text-black"
                        >
                          5x
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total & Beli */}
                  <div className="pt-2.5 border-t-2 border-[#5C3A21]/30 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-black">
                      <span className="text-xs font-bold">Total Harga:</span>
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <Coins className="w-4 h-4 stroke-[2.5]" />
                        <span>
                          {isUserAdmin
                            ? 'Gratis (Admin)'
                            : `${totalPrice.toLocaleString('id-ID')} G`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleBuyPotion}
                      className="clay-btn-primary w-full py-2 text-black font-bold text-xs uppercase flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      <span>BELI DENGAN KOIN</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
