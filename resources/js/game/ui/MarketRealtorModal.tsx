/**
 * ============================================================================
 * FILE: resources/js/game/ui/MarketRealtorModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Kantor Makelar Pasar & Agrikultur Raden:
 * 1. Pilihan Mode Utama:
 *    - [BELI]: Sub-kategori Alat & Perkakas, Beli Biji & Bibit Tanaman.
 *    - [JUAL]: Tampilan Tas/Backpack lengkap dengan pilihan item, jumlah jual,
 *              dan estimasi koin hasil penjualan.
 * 2. Transaksi real-time dengan InventoryManager & LocalStorage pemain.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Store,
  Wrench,
  Sprout,
  Wheat,
  Fish,
  Coins,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { InventoryManager, IInventoryItem } from '../core/InventoryManager';
import { EventBus } from '../core/EventBus';

export interface MarketRealtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  onUpdateGold: (newGold: number) => void;
  isAdmin?: boolean;
}

interface IToolMarketItem {
  id: string;
  name: string;
  category: 'tool' | 'material';
  icon: string;
  price: number;
  description: string;
}

interface ISeedMarketItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  quantity: number;
  description: string;
}

export const MarketRealtorModal: React.FC<MarketRealtorModalProps> = ({
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

  // Mode Utama: 'buy' atau 'sell'
  const [mainMode, setMainMode] = useState<'buy' | 'sell'>('buy');
  // Sub-tab jika Mode Beli: 'tools' atau 'seeds'
  const [buySubTab, setBuySubTab] = useState<'tools' | 'seeds'>('tools');
  // Filter kategori jika Mode Jual: 'all' | 'crops' | 'fish' | 'other'
  const [sellFilter, setSellFilter] = useState<'all' | 'crops' | 'fish' | 'other'>('all');

  const [backpackItems, setBackpackItems] = useState<(IInventoryItem | null)[]>(inv.getAllItems());
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setBackpackItems(inv.getAllItems());
    };
    EventBus.on('inventory-updated', handleUpdate);
    return () => {
      EventBus.off('inventory-updated', handleUpdate);
    };
  }, [inv]);

  useEffect(() => {
    if (isOpen) {
      setBackpackItems(inv.getAllItems());
      setStatusMessage(null);
      setSelectedSlotIndex(null);
      setSellQuantity(1);
    }
  }, [isOpen, inv]);

  // Katalog Alat & Perkakas Pertanian / Memancing
  const toolsCatalog: IToolMarketItem[] = [
    {
      id: 'tool_hoe_steel',
      name: 'Cangkul Petani Baja Tempa',
      category: 'tool',
      icon: '⛏️',
      price: 350,
      description: 'Cangkul baja kuat untuk menggemburkan tanah persawahan dan membuka petak tanam baru.',
    },
    {
      id: 'tool_watering_can',
      name: 'Alat Penyiram Air Kuningan',
      category: 'tool',
      icon: '💧',
      price: 250,
      description: 'Gembor air berkapasitas 10 Liter untuk menyiram benih tanaman sawah dan sayuran.',
    },
    {
      id: 'tool_fishing_rod_carbon',
      name: 'Joran Pancing Master Karbon',
      category: 'tool',
      icon: '🎣',
      price: 600,
      description: 'Joran serat karbon elastis ultra-ringan dengan reel putar halus untuk memancing di dermaga.',
    },
    {
      id: 'tool_axe_wood',
      name: 'Kapak Penebang Kayu Jati',
      category: 'tool',
      icon: '🪓',
      price: 400,
      description: 'Kapak baja tajam dengan gagang kayu jati solid untuk memotong kayu bakar dan ranting.',
    },
  ];

  // Katalog Biji & Bibit Tanaman
  const seedsCatalog: ISeedMarketItem[] = [
    {
      id: 'seed_padi_rojolele',
      name: 'Kantong Bibit Padi Rojolele',
      icon: '🌾',
      price: 80,
      quantity: 10,
      description: 'Benih padi wangi pulen unggulan. Menghasilkan gabah berkualitas tinggi di petak sawah timur.',
    },
    {
      id: 'seed_jagung_manis',
      name: 'Benih Jagung Manis Madu',
      icon: '🌽',
      price: 100,
      quantity: 10,
      description: 'Bibit jagung kuning manis berkulit tipis. Menghasilkan tongkol jagung besar berharga tinggi.',
    },
    {
      id: 'seed_tomat_cherry',
      name: 'Benih Tomat Merah Cherry',
      icon: '🍅',
      price: 120,
      quantity: 10,
      description: 'Bibit tomat sayur segar kaya vitamin. Cepat berbuah lebat di pekarangan rumah.',
    },
    {
      id: 'seed_semangka_merah',
      name: 'Biji Semangka Tanpa Biji',
      icon: '🍉',
      price: 150,
      quantity: 5,
      description: 'Benih semangka buah manis berair banyak. Sangat disukai warga kota di musim panas.',
    },
    {
      id: 'seed_wortel_kebun',
      name: 'Benih Wortel Renyah Kebun',
      icon: '🥕',
      price: 90,
      quantity: 10,
      description: 'Bibit umbi wortel oranye renyah yang kaya beta-karoten untuk nutrisi tubuh.',
    },
  ];

  if (!isOpen) return null;

  // Daftar item di backpack beserta slotnya
  const filledBackpackItems = backpackItems
    .map((item, idx) => ({ item, slotIndex: idx }))
    .filter((entry): entry is { item: IInventoryItem; slotIndex: number } => entry.item !== null);

  // Filter kategori di tas
  const displayedBackpackItems = filledBackpackItems.filter(({ item }) => {
    if (sellFilter === 'crops') {
      return (
        item.category === 'material' ||
        item.category === 'consumable' ||
        item.name.toLowerCase().includes('padi') ||
        item.name.toLowerCase().includes('jagung') ||
        item.name.toLowerCase().includes('tomat') ||
        item.name.toLowerCase().includes('apel') ||
        item.name.toLowerCase().includes('semangka') ||
        item.name.toLowerCase().includes('wortel')
      );
    }
    if (sellFilter === 'fish') {
      return item.category === 'fish' || item.name.toLowerCase().includes('ikan');
    }
    if (sellFilter === 'other') {
      return item.category !== 'fish';
    }
    return true;
  });

  const selectedItemEntry =
    selectedSlotIndex !== null && backpackItems[selectedSlotIndex]
      ? { item: backpackItems[selectedSlotIndex]!, slotIndex: selectedSlotIndex }
      : null;

  // Beli Alat
  const handleBuyTool = (tool: IToolMarketItem) => {
    if (!isUserAdmin && playerGold < tool.price) {
      sound.playClick();
      alert(`Koinmu tidak mencukupi! Butuh ${tool.price.toLocaleString('id-ID')} Koin.`);
      return;
    }

    const newItem: IInventoryItem = {
      id: `${tool.id}_${Date.now()}`,
      name: tool.name,
      category: 'tool',
      rarity: 'Uncommon',
      icon: tool.icon,
      quantity: 1,
      maxStack: 1,
      description: tool.description,
      price: Math.round(tool.price * 0.7),
      usable: true,
    };

    const added = inv.addItem(newItem);
    if (!added) {
      sound.playClick();
      alert('⚠️ Tas Punggungmu penuh! Kosongkan slot terlebih dahulu.');
      return;
    }

    sound.playSuccess();
    const newGold = isUserAdmin ? 99999999999 : playerGold - tool.price;
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}

    setStatusMessage(`✅ Berhasil membeli ${tool.name}!`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  // Beli Biji Tanaman
  const handleBuySeed = (seed: ISeedMarketItem) => {
    if (!isUserAdmin && playerGold < seed.price) {
      sound.playClick();
      alert(`Koinmu tidak mencukupi! Butuh ${seed.price.toLocaleString('id-ID')} Koin.`);
      return;
    }

    const newItem: IInventoryItem = {
      id: `${seed.id}_${Date.now()}`,
      name: seed.name,
      category: 'material',
      rarity: 'Common',
      icon: seed.icon,
      quantity: seed.quantity,
      maxStack: 99,
      description: seed.description,
      price: Math.round(seed.price / seed.quantity),
    };

    const added = inv.addItem(newItem);
    if (!added) {
      sound.playClick();
      alert('⚠️ Tas Punggungmu penuh! Kosongkan slot terlebih dahulu.');
      return;
    }

    sound.playSuccess();
    const newGold = isUserAdmin ? 99999999999 : playerGold - seed.price;
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}

    setStatusMessage(`🌱 Berhasil membeli ${seed.name} (${seed.quantity} benih)!`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  // Pilih item dari tas untuk dijual
  const handleSelectItemToSell = (slotIndex: number) => {
    sound.playClick();
    setSelectedSlotIndex(slotIndex);
    const item = backpackItems[slotIndex];
    if (item) {
      setSellQuantity(1);
    }
  };

  // Jual item terpilih berdasarkan kuantitas
  const handleConfirmSell = () => {
    if (!selectedItemEntry) return;

    const { item, slotIndex } = selectedItemEntry;
    const qtyToSell = Math.min(sellQuantity, item.quantity);
    if (qtyToSell <= 0) return;

    const unitPrice = item.price || 10;
    const totalPayout = unitPrice * qtyToSell;

    if (qtyToSell >= item.quantity) {
      // Jual habis slot ini
      inv.sellItem(slotIndex);
      setSelectedSlotIndex(null);
    } else {
      // Kurangi sebagian
      item.quantity -= qtyToSell;
      const all = inv.getAllItems();
      all[slotIndex] = item;
      try {
        localStorage.setItem('raden_player_inventory', JSON.stringify(all));
      } catch (e) {}
      EventBus.emit('inventory-updated');
    }

    sound.playCoin();
    const newGold = playerGold + totalPayout;
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}
    EventBus.emit('player-gold-changed', { gold: newGold });

    setStatusMessage(`💰 Berhasil menjual ${qtyToSell}x ${item.name} seharga +${totalPayout.toLocaleString('id-ID')} Koin!`);
    setBackpackItems(inv.getAllItems());
  };

  // Jual Semua Ikan
  const handleSellAllFish = () => {
    const fishList = filledBackpackItems.filter(
      (e) => e.item.category === 'fish' || e.item.name.toLowerCase().includes('ikan')
    );
    if (fishList.length === 0) return;

    let totalEarned = 0;
    fishList.forEach((entry) => {
      const res = inv.sellItem(entry.slotIndex);
      if (res.success) totalEarned += res.goldEarned;
    });

    if (totalEarned > 0) {
      sound.playCoin();
      const newGold = playerGold + totalEarned;
      onUpdateGold(newGold);
      setStatusMessage(`🎉 Berhasil menjual seluruh hasil tangkapan ikan seharga +${totalEarned.toLocaleString('id-ID')} Koin!`);
      setSelectedSlotIndex(null);
      setBackpackItems(inv.getAllItems());
    }
  };

  // Jual Semua Hasil Panen
  const handleSellAllCrops = () => {
    const cropList = filledBackpackItems.filter(
      (e) =>
        e.item.category === 'material' ||
        e.item.category === 'consumable' ||
        e.item.name.toLowerCase().includes('padi') ||
        e.item.name.toLowerCase().includes('jagung') ||
        e.item.name.toLowerCase().includes('tomat') ||
        e.item.name.toLowerCase().includes('apel') ||
        e.item.name.toLowerCase().includes('semangka') ||
        e.item.name.toLowerCase().includes('wortel')
    );
    if (cropList.length === 0) return;

    let totalEarned = 0;
    cropList.forEach((entry) => {
      const res = inv.sellItem(entry.slotIndex);
      if (res.success) totalEarned += res.goldEarned;
    });

    if (totalEarned > 0) {
      sound.playCoin();
      const newGold = playerGold + totalEarned;
      onUpdateGold(newGold);
      setStatusMessage(`🌾 Berhasil menjual seluruh komoditas hasil panen seharga +${totalEarned.toLocaleString('id-ID')} Koin!`);
      setSelectedSlotIndex(null);
      setBackpackItems(inv.getAllItems());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 sm:p-4 font-sans select-none">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
        
        {/* Header Modal Makelar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-black border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-black tracking-wide text-white font-mono flex items-center gap-2">
                KANTOR MAKELAR RADEN
                <span className="text-[9px] sm:text-[10px] bg-emerald-500 text-black font-black px-1.5 sm:px-2 py-0.5 rounded">PASAR RESMI</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">Pusat Jual Beli Alat, Biji Tanaman & Hasil Tas Petualang</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Bar Saldo & Tab Mode Utama [BELI] / [JUAL] */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-900 border-b border-neutral-800 gap-2 sm:gap-3 shrink-0">
          {/* Dua Tombol Mode Utama yang Menonjol */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                sound.playClick();
                setMainMode('buy');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs font-black font-mono tracking-wider transition-all cursor-pointer ${
                mainMode === 'buy'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              🛒 MENU BELI
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMainMode('sell');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs font-black font-mono tracking-wider transition-all cursor-pointer ${
                mainMode === 'sell'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              💰 JUAL DARI TAS ({filledBackpackItems.length})
            </button>
          </div>

          {/* Saldo Koin Pemain */}
          <div className="flex items-center justify-end gap-2 font-mono">
            <span className="text-xs text-neutral-400">Koin Dompet:</span>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/80 border border-amber-500/50 rounded-lg text-amber-300 font-bold text-sm shadow">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{isUserAdmin ? '99999999999' : playerGold.toLocaleString('id-ID')} KOIN</span>
            </div>
          </div>
        </div>

        {/* Sub-Header Sesuai Mode */}
        {mainMode === 'buy' ? (
          /* Sub-tabs untuk MODE BELI */
          <div className="flex border-b border-neutral-800 bg-neutral-900/60 px-6 pt-2 gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setBuySubTab('tools');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono tracking-wider transition-colors border-b-2 ${
                buySubTab === 'tools'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-950/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              ⛏️ ALAT & PERKAKAS ({toolsCatalog.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setBuySubTab('seeds');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono tracking-wider transition-colors border-b-2 ${
                buySubTab === 'seeds'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-950/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sprout className="w-4 h-4" />
              🌱 BELI BIJI & BIBIT ({seedsCatalog.length})
            </button>
          </div>
        ) : (
          /* Filter Bar & Tombol Cepat untuk MODE JUAL */
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-6 py-2.5 gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              <span className="text-[11px] text-neutral-400 mr-1 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Filter Tas:
              </span>
              {(['all', 'crops', 'fish', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setSellFilter(cat);
                  }}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                    sellFilter === cat
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {cat === 'all' && 'Semua'}
                  {cat === 'crops' && '🌾 Hasil Panen'}
                  {cat === 'fish' && '🐟 Ikan'}
                  {cat === 'other' && '📦 Lainnya'}
                </button>
              ))}
            </div>

            {/* Quick Bulk Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSellAllCrops}
                className="px-3 py-1 bg-amber-950/70 border border-amber-600/50 hover:bg-amber-900 text-amber-300 text-[11px] font-bold font-mono rounded-lg transition-all flex items-center gap-1"
                title="Jual semua hasil panen di tas"
              >
                <Wheat className="w-3.5 h-3.5" /> Jual Semua Panen
              </button>
              <button
                onClick={handleSellAllFish}
                className="px-3 py-1 bg-cyan-950/70 border border-cyan-600/50 hover:bg-cyan-900 text-cyan-300 text-[11px] font-bold font-mono rounded-lg transition-all flex items-center gap-1"
                title="Jual semua ikan tangkapan di tas"
              >
                <Fish className="w-3.5 h-3.5" /> Jual Semua Ikan
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {statusMessage && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-mono shadow">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* ============================================================= */}
          {/* MODE BELI: ALAT ATAU BIJI */}
          {/* ============================================================= */}
          {mainMode === 'buy' && (
            <>
              {buySubTab === 'tools' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {toolsCatalog.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-4 bg-neutral-900/90 border border-neutral-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-neutral-900"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-3 bg-neutral-950 rounded-xl border border-neutral-800 shadow-inner">
                          {tool.icon}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold font-mono text-white">{tool.name}</h3>
                          <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{tool.description}</p>
                          <span className="text-xs font-black font-mono text-amber-400 mt-1 block">
                            💰 {tool.price.toLocaleString('id-ID')} Koin
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyTool(tool)}
                        disabled={playerGold < tool.price}
                        className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shadow ${
                          playerGold >= tool.price
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105 active:scale-95'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        BELI
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {buySubTab === 'seeds' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seedsCatalog.map((seed) => (
                    <div
                      key={seed.id}
                      className="p-4 bg-neutral-900/90 border border-neutral-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-neutral-900"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-3 bg-neutral-950 rounded-xl border border-neutral-800 shadow-inner">
                          {seed.icon}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                            {seed.name}
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                              x{seed.quantity} benih
                            </span>
                          </h3>
                          <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{seed.description}</p>
                          <span className="text-xs font-black font-mono text-amber-400 mt-1 block">
                            💰 {seed.price.toLocaleString('id-ID')} Koin
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuySeed(seed)}
                        disabled={playerGold < seed.price}
                        className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shadow ${
                          playerGold >= seed.price
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105 active:scale-95'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        BELI
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ============================================================= */}
          {/* MODE JUAL: TAMPILAN TAS / BACKPACK LENGKAP DENGAN PILIHAN */}
          {/* ============================================================= */}
          {mainMode === 'sell' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Kolom Kiri: Grid Isi Tas Pemain */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Pilih Item dari Tas yang Ingin Dijual:
                  </span>
                  <span>{displayedBackpackItems.length} Item Tersedia</span>
                </div>

                {displayedBackpackItems.length === 0 ? (
                  <div className="p-8 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl text-center text-neutral-500 font-mono text-xs">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    Tidak ada item yang sesuai di dalam tasmu.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {displayedBackpackItems.map(({ item, slotIndex }) => {
                      const isSelected = selectedSlotIndex === slotIndex;
                      const unitPrice = item.price || 10;
                      return (
                        <div
                          key={`${item.id}_${slotIndex}`}
                          onClick={() => handleSelectItemToSell(slotIndex)}
                          className={`relative p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${
                            isSelected
                              ? 'bg-amber-950/50 border-amber-400 scale-[1.02]'
                              : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900'
                          }`}
                        >
                          {/* Slot Tag */}
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                            #{slotIndex + 1}
                          </span>

                          {/* Kuantitas Badge */}
                          <span className="absolute top-1.5 right-1.5 text-[10px] font-mono font-bold text-amber-300 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                            x{item.quantity}
                          </span>

                          {/* Icon */}
                          <span className="text-3xl my-2 drop-shadow">{item.icon}</span>

                          {/* Nama */}
                          <h4 className="text-xs font-bold text-white font-mono line-clamp-1 w-full">
                            {item.name}
                          </h4>

                          {/* Harga Jual Satuan */}
                          <div className="mt-1 text-[11px] font-bold font-mono text-amber-400 flex items-center gap-1">
                            <span>+{unitPrice.toLocaleString('id-ID')}</span>
                            <span className="text-[9px] text-neutral-400">/item</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Panel Konfirmasi Penjualan Item Terpilih */}
              <div className="w-full lg:w-72 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1.5 mb-3 border-b border-neutral-800 pb-2">
                    <TrendingUp className="w-4 h-4" /> Detail Transaksi Jual
                  </h3>

                  {selectedItemEntry ? (
                    <div className="space-y-4 font-mono">
                      {/* Box Info Item */}
                      <div className="flex items-center gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                        <span className="text-3xl p-2 bg-neutral-900 rounded-lg">{selectedItemEntry.item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{selectedItemEntry.item.name}</h4>
                          <p className="text-[10px] text-neutral-400">
                            Dimiliki: <span className="text-white font-bold">{selectedItemEntry.item.quantity} unit</span>
                          </p>
                          <p className="text-[10px] text-amber-400">
                            Harga: +{(selectedItemEntry.item.price || 10).toLocaleString('id-ID')} Koin / unit
                          </p>
                        </div>
                      </div>

                      {/* Kontrol Jumlah Penjualan */}
                      <div>
                        <div className="flex justify-between items-center text-xs text-neutral-400 mb-1.5">
                          <span>Jumlah Dijual:</span>
                          <span className="text-white font-bold">{sellQuantity}x</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSellQuantity((q) => Math.max(1, q - 1));
                            }}
                            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="range"
                            min={1}
                            max={selectedItemEntry.item.quantity}
                            value={sellQuantity}
                            onChange={(e) => setSellQuantity(parseInt(e.target.value, 10))}
                            className="flex-1 accent-amber-500 cursor-pointer"
                          />
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSellQuantity((q) => Math.min(selectedItemEntry.item.quantity, q + 1));
                            }}
                            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSellQuantity(1);
                            }}
                            className="py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] rounded font-bold"
                          >
                            Jual 1x
                          </button>
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSellQuantity(Math.max(1, Math.floor(selectedItemEntry.item.quantity / 2)));
                            }}
                            className="py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] rounded font-bold"
                          >
                            Setengah
                          </button>
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSellQuantity(selectedItemEntry.item.quantity);
                            }}
                            className="py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] rounded font-bold"
                          >
                            Semua ({selectedItemEntry.item.quantity})
                          </button>
                        </div>
                      </div>

                      {/* Total Payout */}
                      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl">
                        <span className="text-[10px] text-amber-300/80 block">Koin yang Akan Kamu Terima:</span>
                        <span className="text-base font-black text-amber-400 flex items-center gap-1 mt-0.5">
                          <Coins className="w-4 h-4 text-amber-400" />+
                          {((selectedItemEntry.item.price || 10) * sellQuantity).toLocaleString('id-ID')} KOIN
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Pilih item dari kotak di sebelah kiri untuk melihat rincian harga dan menjual.
                    </div>
                  )}
                </div>

                {/* Tombol Eksekusi Jual */}
                <button
                  onClick={handleConfirmSell}
                  disabled={!selectedItemEntry}
                  className={`mt-4 w-full py-3 rounded-xl font-black font-mono text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    selectedItemEntry
                      ? 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  JUAL SEKARANG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
