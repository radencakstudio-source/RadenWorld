/**
 * ============================================================================
 * FILE: resources/js/game/ui/MarketRealtorModal.tsx
 * ============================================================================
 * Modal Kantor Makelar Pasar & Agrikultur Raden (Cozycore Clay-Pixel):
 * 1. [BELI]: Sub-kategori Alat & Perkakas, Beli Biji & Bibit Tanaman Nusantara.
 * 2. [JUAL]: Tampilan Tas/Backpack lengkap dengan pilihan item, jumlah jual,
 *            dan tombol jual cepat hasil panen / ikan.
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
  TrendingUp,
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

  const [mainMode, setMainMode] = useState<'buy' | 'sell'>('buy');
  const [buySubTab, setBuySubTab] = useState<'tools' | 'seeds'>('tools');
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

  const toolsCatalog: IToolMarketItem[] = [
    {
      id: 'tool_hoe_steel',
      name: 'Cangkul Petani Baja Tempa',
      category: 'tool',
      icon: '⛏️',
      price: 350,
      description:
        'Cangkul baja kuat untuk menggemburkan tanah persawahan dan membuka petak tanam baru.',
    },
    {
      id: 'tool_watering_can',
      name: 'Alat Penyiram Air Kuningan',
      category: 'tool',
      icon: '💧',
      price: 250,
      description:
        'Gembor air berkapasitas 10 Liter untuk menyiram benih tanaman sawah dan sayuran.',
    },
    {
      id: 'tool_fishing_rod_carbon',
      name: 'Joran Pancing Master Karbon',
      category: 'tool',
      icon: '🎣',
      price: 600,
      description:
        'Joran serat karbon elastis ultra-ringan dengan reel putar halus untuk memancing di dermaga.',
    },
    {
      id: 'tool_axe_wood',
      name: 'Kapak Penebang Kayu Jati',
      category: 'tool',
      icon: '🪓',
      price: 400,
      description:
        'Kapak baja tajam dengan gagang kayu jati solid untuk memotong kayu bakar dan ranting.',
    },
  ];

  const seedsCatalog: ISeedMarketItem[] = [
    {
      id: 'seed_padi_pandanwangi',
      name: 'Bibit Padi Pandanwangi Cianjur',
      icon: '🌾',
      price: 80,
      quantity: 10,
      description:
        'Varietas padi aromatik unggulan Jawa Barat. Menghasilkan beras harum pandan dan pulen.',
    },
    {
      id: 'seed_jagung_manis_madura',
      name: 'Benih Jagung Manis Madura',
      icon: '🌽',
      price: 95,
      quantity: 10,
      description:
        'Bibit jagung kuning manis berkulit tipis kegemaran petani Madura & Jawa Timur.',
    },
    {
      id: 'seed_singkong_mukibat',
      name: 'Bibit Singkong Mukibat Manis',
      icon: '🥔',
      price: 70,
      quantity: 8,
      description:
        'Ubi kayu unggulan nusantara berumbi tebal dan empuk. Tumbuh subur di tanah tropis.',
    },
    {
      id: 'seed_ubi_cilembu',
      name: 'Bibit Ubi Madu Cilembu',
      icon: '🍠',
      price: 85,
      quantity: 8,
      description: 'Ubi jalar manis legit berkaramel khas lereng Sumedang.',
    },
    {
      id: 'seed_kedelai_malika',
      name: 'Benih Kedelai Hitam Malika',
      icon: '🌱',
      price: 75,
      quantity: 10,
      description: 'Kedelai lokal unggul bahan baku tempe gurih dan kecap manis tradisional.',
    },
    {
      id: 'seed_kacang_tanah_tuban',
      name: 'Benih Kacang Tanah Tuban',
      icon: '🥜',
      price: 70,
      quantity: 10,
      description: 'Kacang tanah garing berisi padat favorit camilan sangrai pesisir Tuban.',
    },
    {
      id: 'seed_cabai_rawit_domba',
      name: 'Benih Cabai Rawit Merah Domba',
      icon: '🌶️',
      price: 110,
      quantity: 10,
      description: 'Cabai rawit oranye-merah pedas primadona aneka sambal ulek nusantara.',
    },
    {
      id: 'seed_cabai_keriting_medan',
      name: 'Benih Cabai Merah Keriting',
      icon: '🌶️',
      price: 115,
      quantity: 10,
      description: 'Cabai merah bergelombang renyah andalan bumbu balado dan rendang.',
    },
    {
      id: 'seed_kangkung_lombok',
      name: 'Benih Kangkung Air Lombok',
      icon: '🥬',
      price: 50,
      quantity: 15,
      description: 'Sayuran daun renyah andalan plecing kangkung khas NTB. Panen cepat!',
    },
    {
      id: 'seed_bayam_raja',
      name: 'Benih Bayam Hijau Raja',
      icon: '🥗',
      price: 50,
      quantity: 15,
      description: 'Sayuran hijau kaya zat besi untuk sayur bening segar khas Sunda dan Jawa.',
    },
    {
      id: 'seed_terong_antaboga',
      name: 'Benih Terong Ungu Antaboga',
      icon: '🍆',
      price: 80,
      quantity: 10,
      description: 'Terong berkulit ungu mengkilap dengan daging empuk manis.',
    },
    {
      id: 'seed_kacang_panjang',
      name: 'Benih Kacang Panjang Hijau',
      icon: '🌿',
      price: 65,
      quantity: 10,
      description: 'Tanaman rambat tropis berpolong panjang renyah untuk lalapan dan pecel.',
    },
    {
      id: 'seed_tomat_lumajang',
      name: 'Benih Tomat Sayur Lumajang',
      icon: '🍅',
      price: 90,
      quantity: 10,
      description: 'Tomat segar berair kaya vitamin C untuk pelengkap sambal terasi.',
    },
    {
      id: 'seed_bawang_merah_brebes',
      name: 'Benih Bawang Merah Bima Brebes',
      icon: '🧅',
      price: 125,
      quantity: 10,
      description: 'Umbi lapis wangi khas Brebes Jawa Tengah bumbu utama masakan nusantara.',
    },
    {
      id: 'seed_jahe_merah_super',
      name: 'Bibit Rimpang Jahe Merah Super',
      icon: '🫚',
      price: 135,
      quantity: 6,
      description: 'Rempah rimpang pedas berkhasiat hangat untuk wedang jahe dan jamu.',
    },
    {
      id: 'seed_kunyit_asam',
      name: 'Bibit Rimpang Kunyit Asam',
      icon: '🫚',
      price: 115,
      quantity: 6,
      description: 'Pewarna alami kuning emas dan rempah jamu kunyit asam berkhasiat.',
    },
    {
      id: 'seed_semangka_inul',
      name: 'Biji Semangka Merah Inul',
      icon: '🍉',
      price: 140,
      quantity: 6,
      description: 'Buah semangka lonjong berair manis segar penyejuk dahaga khatulistiwa.',
    },
    {
      id: 'seed_melon_golden',
      name: 'Benih Melon Madu Golden Alor',
      icon: '🍈',
      price: 150,
      quantity: 6,
      description: 'Melon berkulit kuning cerah berdaging manis wangi khas kepulauan nusantara.',
    },
    {
      id: 'seed_pisang_raja',
      name: 'Anakan Bibit Pisang Raja Bulu',
      icon: '🍌',
      price: 175,
      quantity: 4,
      description: 'Pisang legendaris keraton beraroma harum manis untuk jajanan pasar.',
    },
    {
      id: 'seed_kopi_gayo',
      name: 'Benih Kopi Arabika Gayo Aceh',
      icon: '☕',
      price: 210,
      quantity: 5,
      description: 'Biji kopi pegunungan dataran tinggi Gayo beraroma rempah harum mendunia.',
    },
    {
      id: 'seed_kelapa_pandan',
      name: 'Bibit Kelapa Pandan Wangi',
      icon: '🥥',
      price: 190,
      quantity: 3,
      description: 'Kelapa tropis berair manis dengan aroma pandan alami pesisir pantai.',
    },
  ];

  if (!isOpen) return null;

  const filledBackpackItems = backpackItems
    .map((item, idx) => ({ item, slotIndex: idx }))
    .filter((entry): entry is { item: IInventoryItem; slotIndex: number } => entry.item !== null);

  const displayedBackpackItems = filledBackpackItems.filter(({ item }) => {
    if (sellFilter === 'crops') {
      const n = item.name.toLowerCase();
      return (
        item.category === 'material' ||
        item.category === 'consumable' ||
        n.includes('padi') ||
        n.includes('jagung') ||
        n.includes('tomat') ||
        n.includes('apel') ||
        n.includes('semangka') ||
        n.includes('wortel') ||
        n.includes('cabai') ||
        n.includes('kangkung') ||
        n.includes('bayam') ||
        n.includes('singkong') ||
        n.includes('ubi') ||
        n.includes('terong') ||
        n.includes('kacang') ||
        n.includes('bawang') ||
        n.includes('jahe') ||
        n.includes('kunyit') ||
        n.includes('melon') ||
        n.includes('pisang') ||
        n.includes('kopi') ||
        n.includes('kelapa') ||
        n.includes('kedelai') ||
        n.includes('benih') ||
        n.includes('bibit') ||
        n.includes('biji')
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
      alert('Tas Punggungmu penuh! Kosongkan slot terlebih dahulu.');
      return;
    }

    sound.playSuccess();
    const newGold = isUserAdmin ? 99999999999 : playerGold - tool.price;
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}

    setStatusMessage(`Berhasil membeli ${tool.name}!`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  const handleBuySeed = (seed: ISeedMarketItem) => {
    if (!isUserAdmin && playerGold < seed.price) {
      sound.playClick();
      alert(`Koinmu tidak mencukupi! Butuh ${seed.price.toLocaleString('id-ID')} Koin.`);
      return;
    }

    const newItem: IInventoryItem = {
      id: seed.id,
      name: seed.name,
      category: 'seed',
      rarity: 'Common',
      icon: seed.icon,
      quantity: seed.quantity,
      maxStack: 99,
      description: seed.description,
      price: Math.round(seed.price / seed.quantity),
      usable: true,
      extraData: {
        cropType: seed.id.replace('seed_', ''),
      },
    };

    const added = inv.addItem(newItem);
    if (!added) {
      sound.playClick();
      alert('Tas Punggungmu penuh! Kosongkan slot terlebih dahulu.');
      return;
    }

    sound.playSuccess();
    const newGold = isUserAdmin ? 99999999999 : playerGold - seed.price;
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}

    setStatusMessage(`Berhasil membeli ${seed.name} (${seed.quantity} benih)!`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  const handleSelectItemToSell = (slotIndex: number) => {
    sound.playClick();
    setSelectedSlotIndex(slotIndex);
    const item = backpackItems[slotIndex];
    if (item) {
      setSellQuantity(1);
    }
  };

  const handleConfirmSell = () => {
    if (!selectedItemEntry) return;

    const { item, slotIndex } = selectedItemEntry;
    const qtyToSell = Math.min(sellQuantity, item.quantity);
    if (qtyToSell <= 0) return;

    const unitPrice = item.price || 10;
    const totalPayout = unitPrice * qtyToSell;

    if (qtyToSell >= item.quantity) {
      inv.sellItem(slotIndex);
      setSelectedSlotIndex(null);
    } else {
      item.quantity -= qtyToSell;
      const all = inv.getAllItems();
      all[slotIndex] = item;
      try {
        localStorage.setItem('raden_player_inventory', JSON.stringify(all));
      } catch (e) {}
      EventBus.emit('inventory-updated');
    }

    sound.playCoin();
    const newGold = isUserAdmin ? 99999999999 : playerGold + totalPayout;
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}
    EventBus.emit('player-gold-changed', { gold: newGold });

    setStatusMessage(
      `Berhasil menjual ${qtyToSell}x ${item.name} (+${totalPayout.toLocaleString('id-ID')} Koin)!`
    );
    setBackpackItems(inv.getAllItems());
  };

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
      const newGold = isUserAdmin ? 99999999999 : playerGold + totalEarned;
      onUpdateGold(newGold);
      setStatusMessage(
        `Berhasil menjual seluruh tangkapan ikan (+${totalEarned.toLocaleString('id-ID')} Koin)!`
      );
      setSelectedSlotIndex(null);
      setBackpackItems(inv.getAllItems());
    }
  };

  const handleSellAllCrops = () => {
    const cropList = filledBackpackItems.filter(
      (e) => e.item.category === 'crop' || e.item.id.startsWith('crop_')
    );
    if (cropList.length === 0) return;

    let totalEarned = 0;
    cropList.forEach((entry) => {
      const res = inv.sellItem(entry.slotIndex);
      if (res.success) totalEarned += res.goldEarned;
    });

    if (totalEarned > 0) {
      sound.playCoin();
      const newGold = isUserAdmin ? 99999999999 : playerGold + totalEarned;
      onUpdateGold(newGold);
      setStatusMessage(
        `Berhasil menjual seluruh hasil panen (+${totalEarned.toLocaleString('id-ID')} Koin)!`
      );
      setSelectedSlotIndex(null);
      setBackpackItems(inv.getAllItems());
    }
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
              <Store className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="clay-sidebar-brand-text">
              <span className="clay-sidebar-title">PASAR KOTA</span>
              <span className="clay-sidebar-subtitle">RADEN AGRO</span>
            </div>
          </div>

          <div className="clay-sidebar-nav">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMainMode('buy');
                setBuySubTab('tools');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                mainMode === 'buy' && buySubTab === 'tools'
                  ? 'clay-sidebar-btn-active'
                  : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Wrench className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Beli Alat ({toolsCatalog.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMainMode('buy');
                setBuySubTab('seeds');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                mainMode === 'buy' && buySubTab === 'seeds'
                  ? 'clay-sidebar-btn-active'
                  : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Sprout className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Beli Bibit ({seedsCatalog.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMainMode('sell');
                setSellFilter('crops');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                mainMode === 'sell' && sellFilter === 'crops'
                  ? 'clay-sidebar-btn-active'
                  : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Wheat className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Jual Panen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMainMode('sell');
                setSellFilter('fish');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                mainMode === 'sell' && sellFilter === 'fish'
                  ? 'clay-sidebar-btn-active'
                  : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Fish className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Jual Ikan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMainMode('sell');
                setSellFilter('all');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                mainMode === 'sell' && sellFilter === 'all'
                  ? 'clay-sidebar-btn-active'
                  : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Package className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Isi Tas ({filledBackpackItems.length})</span>
            </button>
          </div>

          <div className="clay-sidebar-footer">
            <div className="clay-badge-secondary flex items-center gap-1.5 px-2 py-1.5 text-black font-bold text-[10px] w-full justify-center">
              <Coins className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">{isUserAdmin ? '99999999999' : playerGold.toLocaleString('id-ID')} G</span>
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
                  {mainMode === 'buy' && buySubTab === 'tools' && 'Toko Perkakas & Alat Pertanian'}
                  {mainMode === 'buy' && buySubTab === 'seeds' && 'Sentra Bibit & Benih Nusantara'}
                  {mainMode === 'sell' && sellFilter === 'crops' && 'Penampungan Hasil Panen Kebun'}
                  {mainMode === 'sell' && sellFilter === 'fish' && 'Lelang Ikan & Bahari Nusantara'}
                  {mainMode === 'sell' && sellFilter === 'all' && 'Penjualan Isi Tas Petualang'}
                </h2>
                <span className="clay-badge-secondary text-[9px] font-bold px-1.5 py-0.5 text-black">
                  HARGA RESMI
                </span>
                {isUserAdmin && (
                  <span className="clay-badge-cocoa text-[9px] font-bold px-1.5 py-0.5 text-white">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-black hidden sm:block truncate">
                Beli bibit & cangkul untuk bertani di petak kebun atau jual komoditasmu ke makelar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
              aria-label="Tutup Pasar"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </header>

          {/* STATUS NOTIFIKASI */}
          {statusMessage && (
            <div className="px-4 py-1.5 bg-[#A8E6CF] border-b-2 border-[#5C3A21] flex items-center gap-2 text-xs font-bold text-black shrink-0">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* BODY */}
          <div className="clay-main-body">
            {/* PANDUAN RESMI ATURAN MENANAM */}
            <div className="clay-card-secondary p-3 mb-3 text-black space-y-1.5 border-2 border-[#5C3A21] rounded-lg">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs uppercase flex items-center gap-1.5">
                  <span>📜</span>
                  <span>Catatan Resmi: 5 Syarat & Aturan Menanam Kebun Tani</span>
                </span>
                <span className="clay-badge-primary text-[9px] font-bold px-2 py-0.5">
                  DURASI 24 JAM
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10px] font-bold pt-1">
                <div className="p-1.5 bg-[#FFF8EA] rounded border border-[#5C3A21]">
                  1. ⛏️ Cangkul<br />
                  <span className="text-[9px] font-normal">Gemburkan lahan tanah di kebun tani.</span>
                </div>
                <div className="p-1.5 bg-[#FFF8EA] rounded border border-[#5C3A21]">
                  2. 💧 Siram Air Sekali<br />
                  <span className="text-[9px] font-normal">Siram dengan tong air (isi di pantai/laut).</span>
                </div>
                <div className="p-1.5 bg-[#FFF8EA] rounded border border-[#5C3A21]">
                  3. 🌱 Tanam Bibit<br />
                  <span className="text-[9px] font-normal">Tanam pada petak yang sudah basah.</span>
                </div>
                <div className="p-1.5 bg-[#FFF8EA] rounded border border-[#5C3A21]">
                  4. ⏳ Tunggu 24 Jam<br />
                  <span className="text-[9px] font-normal">Tumbuh bertahap mekar 24 jam penuh.</span>
                </div>
                <div className="p-1.5 bg-[#FFF8EA] rounded border border-[#5C3A21]">
                  5. 🌾 Panen [F]<br />
                  <span className="text-[9px] font-normal">Panen hasil bumi & jual jadi koin emas!</span>
                </div>
              </div>
            </div>

            {/* MODE BELI */}
            {mainMode === 'buy' && (
              <>
                {buySubTab === 'tools' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {toolsCatalog.map((tool) => (
                      <div
                        key={tool.id}
                        className="clay-card p-3 flex items-center justify-between gap-3 text-black"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl w-10 h-10 bg-[#A8E6CF] rounded-lg border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
                            {tool.icon}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-black truncate">{tool.name}</h3>
                            <p className="text-[10px] text-black line-clamp-2 mt-0.5 leading-snug">
                              {tool.description}
                            </p>
                            <span className="clay-badge-primary text-[10px] font-bold text-black px-2 py-0.5 mt-1 inline-block">
                              {tool.price.toLocaleString('id-ID')} Koin
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBuyTool(tool)}
                          disabled={!isUserAdmin && playerGold < tool.price}
                          className="clay-btn-primary px-3 py-2 text-black font-bold text-xs flex items-center gap-1.5 shrink-0"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>BELI</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {buySubTab === 'seeds' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                    {seedsCatalog.map((seed) => (
                      <div
                        key={seed.id}
                        className="clay-card p-3 flex items-center justify-between gap-2.5 text-black"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl w-10 h-10 bg-[#FFAE6D] rounded-lg border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
                            {seed.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-xs font-bold text-black">{seed.name}</h3>
                              <span className="clay-badge-secondary text-[9px] font-bold text-black px-1.5 py-0.5">
                                x{seed.quantity}
                              </span>
                            </div>
                            <p className="text-[10px] text-black line-clamp-2 mt-0.5 leading-snug">
                              {seed.description}
                            </p>
                            <span className="clay-badge-primary text-[10px] font-bold text-black px-2 py-0.5 mt-1 inline-block">
                              {seed.price.toLocaleString('id-ID')} Koin
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBuySeed(seed)}
                          disabled={!isUserAdmin && playerGold < seed.price}
                          className="clay-btn-primary px-3 py-2 text-black font-bold text-xs flex items-center gap-1.5 shrink-0"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>BELI</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* MODE JUAL */}
            {mainMode === 'sell' && (
              <div className="flex flex-col lg:flex-row gap-3.5">
                {/* Grid Tas */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-black">
                    <span>PILIH ITEM DARI TAS</span>
                    <div className="flex items-center gap-1.5">
                      {sellFilter === 'crops' && (
                        <button
                          type="button"
                          onClick={handleSellAllCrops}
                          className="clay-btn-secondary px-2.5 py-1 text-[10px] font-bold text-black flex items-center gap-1"
                        >
                          <Wheat className="w-3 h-3 stroke-[2.5]" />
                          <span>JUAL SEMUA PANEN</span>
                        </button>
                      )}
                      {sellFilter === 'fish' && (
                        <button
                          type="button"
                          onClick={handleSellAllFish}
                          className="clay-btn-secondary px-2.5 py-1 text-[10px] font-bold text-black flex items-center gap-1"
                        >
                          <Fish className="w-3 h-3 stroke-[2.5]" />
                          <span>JUAL SEMUA IKAN</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {displayedBackpackItems.map(({ item, slotIndex }) => {
                      const isSelected = selectedSlotIndex === slotIndex;
                      return (
                        <button
                          key={`${item.id}_${slotIndex}`}
                          type="button"
                          onClick={() => handleSelectItemToSell(slotIndex)}
                          className={`p-2 text-center flex flex-col items-center justify-between gap-1 aspect-square rounded-xl border-2 ${
                            isSelected
                              ? 'border-[#5C3A21] bg-[#FFAE6D] shadow-inner'
                              : 'border-[#5C3A21] bg-[#FFF8EA]'
                          }`}
                        >
                          <span className="text-2xl">{item.icon || '📦'}</span>
                          <span className="text-[10px] font-bold text-black truncate w-full">
                            {item.name}
                          </span>
                          <span className="clay-badge-secondary text-[9px] font-bold text-black px-1">
                            x{item.quantity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Panel Detail Jual */}
                <div className="w-full lg:w-64 clay-card p-3.5 flex flex-col justify-between gap-3 text-black">
                  {selectedItemEntry ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#5C3A21]/30">
                        <span className="text-2xl w-10 h-10 bg-[#A8E6CF] rounded-lg border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
                          {selectedItemEntry.item.icon || '📦'}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-black truncate">
                            {selectedItemEntry.item.name}
                          </h4>
                          <span className="text-[10px] font-bold text-black">
                            Tersedia: {selectedItemEntry.item.quantity} unit
                          </span>
                        </div>
                      </div>

                      <div className="clay-badge-neutral flex items-center justify-between p-2 text-black">
                        <span className="text-[11px] font-bold">Jumlah Jual:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setSellQuantity((prev) => Math.max(1, prev - 1));
                            }}
                            className="clay-btn-neutral w-6 h-6 text-black flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="text-xs font-bold text-black w-6 text-center">
                            {sellQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setSellQuantity((prev) =>
                                Math.min(selectedItemEntry.item.quantity, prev + 1)
                              );
                            }}
                            className="clay-btn-neutral w-6 h-6 text-black flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t-2 border-[#5C3A21]/30 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>Total Diterima:</span>
                          <span>
                            {(
                              (selectedItemEntry.item.price || 10) * sellQuantity
                            ).toLocaleString('id-ID')}{' '}
                            G
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleConfirmSell}
                          className="clay-btn-primary w-full py-2 text-xs font-bold text-black uppercase flex items-center justify-center gap-1.5"
                        >
                          <DollarSign className="w-4 h-4 stroke-[2.5]" />
                          <span>JUAL SEKARANG</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs font-bold text-black">
                      Pilih item dari tas di sebelah kiri untuk melihat harga dan menjual.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
