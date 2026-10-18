/**
 * ============================================================================
 * FILE: resources/js/game/ui/CreatorStudioModal.tsx
 * ============================================================================
 * THE SIMS 2D • STUDIO ARSITEK TAHTA RADEN (BUILD & BUY MODE)
 * 
 * FITUR UTAMA THE SIMS 2D:
 * 1. SIMS BUILD TOOLBAR:
 *    - ✋ Hand Tool: Pilih & Geser Aset di atas kanvas
 *    - 🔨 Sledgehammer: Klik objek apa saja di kanvas untuk langsung dihancurkan!
 *    - 🧪 Eyedropper: Salin/Kloning aset yang sudah ada langsung ke tangan
 *    - 🔄 Rotate 90°: Putar aset (tukar gw dan gh) atau tekan tombol keyboard [R]
 *    - 🖌️ Terrain Painter: Kuas jalan, danau, plaza, pasir tanah, parket kayu
 *    - 🧹 Eraser: Bersihkan lapisan jalan/danau
 * 2. VISUAL TERKUNCI (FIXED VIEWPORT):
 *    - TIDAK BISA GESER KIRI-KANAN (no horizontal scrollbar / pan)
 *    - TIDAK BISA ZOOM IN / ZOOM OUT (viewport terkunci stabil seperti workstation arsitek)
 *    - Sektor Kamera Sims untuk navigasi presisi:
 *      * Seluruh Dunia (80×80)
 *      * Plaza Pusat (28-52)
 *      * Kompleks Sekolah (14-46)
 *      * Danau Timur (52-76)
 *      * Perumahan Selatan (28-56)
 * 3. TRANSPARENT FOOTPRINT GRID:
 *    - Menampilkan sub-petak pembagian transparan yang memperlihatkan presisi
 *      berapa petak grid yang dimakan aset (1, 2, ... gw×gh petak)
 * 4. GRID MERAH COLLISION FISIK:
 *    - Indikator petak merah bergaris hazard warning: TIDAK BISA DIINJAK KARAKTER
 *    - Indikator hijau tembus: BEBAS DIINJAK (seperti rumput liar)
 * 5. KATALOG LENGKAP ASET KOTA & GEDUNG:
 *    - 🏢 Gedung SD (5×10), SMP (5×10), SMA (5×10), Rumah Pemain (5×5)
 *    - 🍲 Gerobak Bakso Solo (3×3), Mie Ayam (3×3), Soto Lamongan (3×3), Vending Machines
 *    - 🌿 Alam & Taman: Pohon, Taman Rumput (2×1), Rumput Liar (1×2), Bebatuan, Lampu
 *    - 🎓 Sekolah: Garuda Presiden (3×1), Bendera (1×2), Whiteboard, Meja & Kursi
 *    - 👑 Admin: Tahta Raden (3×3), Konsol Broadcast, Database, Godmode, Portal, Holo Globe
 * 6. KUAS MEDAN & ALAM:
 *    - 🛣️ Jalan Aspal Boulevard
 *    - 🌊 Danau Mistik Solid (dengan tabrakan fisik air agar karakter tidak tenggelam)
 *    - 🏛️ Plaza Obsidian & Emas
 *    - 🏖️ Jalan Tanah / Pasir
 *    - 🪵 Parket Kayu Jati
 *    - Pilihan kuas 1x1, 2x2, 3x3, 4x4
 * 7. AUDIO THE SIMS (WEB AUDIO API):
 *    - Sound effect peletakan aset (pop thump), palu (shatter crunch), putar (tick swoosh)
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Crown,
  Globe,
  Home,
  School,
  Layers,
  Save,
  RotateCcw,
  Eye,
  X,
  Sparkles,
  ExternalLink,
  Search,
  Waves,
  Palette,
  Eraser,
  Hammer,
  Pipette,
  MousePointer,
  RotateCw,
  Compass,
  TreePine,
  Armchair,
  GraduationCap,
  Sparkle,
  Grid,
  Building2,
  UtensilsCrossed,
} from 'lucide-react';
import { EventBus } from '../core/EventBus';

export type MapTargetType = 'world' | 'school' | 'house';
export type TerrainType = 'road' | 'water' | 'plaza' | 'dirt' | 'wood';
export type SimsToolType = 'select' | 'hammer' | 'dropper' | 'terrain' | 'eraser';
export type AssetCategoryType = 'all' | 'building' | 'food' | 'nature' | 'school' | 'admin' | 'terrain';

export interface IArchitectAsset {
  key: string;
  name: string;
  category: 'building' | 'food' | 'nature' | 'school' | 'admin';
  gw: number; // grid width in tiles
  gh: number; // grid height in tiles
  defaultCollision: boolean;
  imageSrc: string;
  description: string;
}

export interface IPlacedPropItem {
  id: string;
  key: string;
  name: string;
  gx: number;
  gy: number;
  gw: number;
  gh: number;
  isObstacle: boolean;
  imageSrc?: string;
}

export interface ITerrainTileItem {
  id: string;
  type: TerrainType;
  gx: number;
  gy: number;
  gw: number;
  gh: number;
  hasCollision?: boolean;
}

export interface IMapArchitectConfig {
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
  customProps: IPlacedPropItem[];
  customTerrains?: ITerrainTileItem[];
}

// Suara Sintesis Khas The Sims Build Mode menggunakan Web Audio API
const playSimsSound = (type: 'place' | 'hammer' | 'rotate' | 'click' | 'switch') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'place') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hammer') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'rotate') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {}
};

// Definisi Kuas Medan Sims
export const TERRAIN_BRUSHES: {
  type: TerrainType;
  name: string;
  icon: string;
  description: string;
  hasCollision: boolean;
  color: string;
  borderColor: string;
}[] = [
  {
    type: 'road',
    name: 'Jalan Aspal Boulevard',
    icon: '🛣️',
    description: 'Jalan raya aspal kota hitam pekat dengan marka putih jalan.',
    hasCollision: false,
    color: '#1e293b',
    borderColor: '#64748b',
  },
  {
    type: 'water',
    name: 'Danau Mistik Kristal',
    icon: '🌊',
    description: 'Air danau biru segar. Solid Collision: Karakter tidak bisa tenggelam!',
    hasCollision: true,
    color: '#0284c7',
    borderColor: '#38bdf8',
  },
  {
    type: 'plaza',
    name: 'Plaza Obsidian & Emas',
    icon: '🏛️',
    description: 'Ubin batu obsidian mewah untuk area pusat kota dan santai.',
    hasCollision: false,
    color: '#334155',
    borderColor: '#f59e0b',
  },
  {
    type: 'dirt',
    name: 'Jalan Tanah / Pasir',
    icon: '🏖️',
    description: 'Jalan setapak pedesaan alami bertekstur tanah lempung cokelat.',
    hasCollision: false,
    color: '#78350f',
    borderColor: '#451a03',
  },
  {
    type: 'wood',
    name: 'Lantai Parket Kayu Jati',
    icon: '🪵',
    description: 'Lantai parket kayu elegan cocok untuk kelas, panggung, dan rumah.',
    hasCollision: false,
    color: '#92400e',
    borderColor: '#b45309',
  },
];

// KATALOG LENGKAP SELURUH ASET RADENWORLD (TERMASUK GEDUNG, GEROBAK, DLL)
export const ARCHITECT_ASSET_CATALOG: IArchitectAsset[] = [
  // ==========================================
  // 1. GEDUNG & BANGUNAN UTAMA (BUILDINGS)
  // ==========================================
  {
    key: 'school-sd-building',
    name: 'Gedung Sekolah SD (5×10)',
    category: 'building',
    gw: 5,
    gh: 10,
    defaultCollision: true,
    imageSrc: '/assets/maps/SD/5x10%20Gedung%20SD.png',
    description: 'Gedung megah Sekolah Dasar Negeri beratap genteng merah dan pintu masuk utama.',
  },
  {
    key: 'school-smp-building',
    name: 'Gedung Sekolah SMP (5×10)',
    category: 'building',
    gw: 5,
    gh: 10,
    defaultCollision: true,
    imageSrc: '/assets/maps/SMP/5x10%20Gedung%20SMP.png',
    description: 'Gedung megah Sekolah Menengah Pertama bertingkat dengan arsitektur biru modern.',
  },
  {
    key: 'school-sma-building',
    name: 'Gedung Sekolah SMA (5×10)',
    category: 'building',
    gw: 5,
    gh: 10,
    defaultCollision: true,
    imageSrc: '/assets/maps/SMA/5x10%20Gedung%20SMA.png',
    description: 'Gedung Sekolah Menengah Atas Kebangsaan lantai 2 berfasad abu-abu megah.',
  },
  {
    key: 'house-5x5',
    name: 'Rumah Modern Pemain (5×5)',
    category: 'building',
    gw: 5,
    gh: 5,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/5x5%20Rumah.png',
    description: 'Rumah hunian pribadi dua lantai modern dengan garasi dan jendela kaca.',
  },

  // ==========================================
  // 2. GEROBAK KULINER & PUJASERA (FOOD CARTS & STALLS)
  // ==========================================
  {
    key: 'cart-bakso',
    name: 'Gerobak Bakso Solo (3×3)',
    category: 'food',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/3x3%20Gerobak%20Bakso.png',
    description: 'Gerobak kuliner bakso urat kuah kaldu sapi gurih Solo dengan dandang uap.',
  },
  {
    key: 'cart-mie-ayam',
    name: 'Gerobak Mie Ayam Jamur (3×3)',
    category: 'food',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/3x3%20Gerobak%20Mie%20Ayam.png',
    description: 'Gerobak mie ayam jamur manis gurih dengan mangkok dan rebusan mie.',
  },
  {
    key: 'cart-soto',
    name: 'Gerobak Soto Lamongan (3×3)',
    category: 'food',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/3x3%20Gerobak%20Soto.png',
    description: 'Gerobak soto ayam koya gurih Jawa Timur beraroma rempah kunyit harum.',
  },
  {
    key: 'prop-meja',
    name: 'Meja Santai Pujasera (1×1)',
    category: 'food',
    gw: 1,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x1%20Meja.png',
    description: 'Meja bundar kayu untuk tempat makan santai di pujasera.',
  },
  {
    key: 'prop-kursi-front',
    name: 'Bangku Pujasera Depan (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman.png',
    description: 'Bangku taman menghadap depan untuk duduk santai menikmati hidangan.',
  },
  {
    key: 'prop-kursi-side',
    name: 'Bangku Pujasera Kanan (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.png',
    description: 'Bangku kayu menghadap samping kanan.',
  },
  {
    key: 'prop-kursi-side-1',
    name: 'Bangku Pujasera Kiri (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.png',
    description: 'Bangku kayu menghadap samping kiri.',
  },
  {
    key: 'prop-tong-sampah',
    name: 'Tong Sampah Publik (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Tong%20Sampah.png',
    description: 'Tempat sampah ramah lingkungan di samping gerobak kuliner.',
  },
  {
    key: 'vending-blue',
    name: 'Vending Machine Biru (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Blue.png',
    description: 'Mesin otomatis penjual minuman soda dingin biru.',
  },
  {
    key: 'vending-green',
    name: 'Vending Machine Hijau (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Green.png',
    description: 'Mesin otomatis penjual teh melati dan air mineral hijau.',
  },
  {
    key: 'vending-red',
    name: 'Vending Machine Merah (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Red.png',
    description: 'Mesin otomatis penjual kopi dan jus buah segar merah.',
  },
  {
    key: 'vending-yellow',
    name: 'Vending Machine Kuning (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Yellow.png',
    description: 'Mesin otomatis penjual minuman isotonik dan lemon kuning.',
  },

  // ==========================================
  // 3. ALAM & LANSKAP TAMAN (NATURE & PARKS)
  // ==========================================
  {
    key: 'prop-taman-rumput',
    name: 'Taman Rumput Rapi (2×1)',
    category: 'nature',
    gw: 2,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.png',
    description: 'Taman rumput hias tertata rapi kotak 2x1 dengan tabrakan fisik solid.',
  },
  {
    key: 'prop-rumput',
    name: 'Rumput Liar Alami (1×2)',
    category: 'nature',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Rumput.png',
    description: 'Rerumputan liar bebas collision (dapat diinjak). Menimpa kaki pemain.',
  },
  {
    key: 'prop-pohon-tall',
    name: 'Pohon Tinggi Rindang (1×3)',
    category: 'nature',
    gw: 1,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x3%20Pohon.png',
    description: 'Pohon rindang besar penyaring polusi udara perkotaan.',
  },
  {
    key: 'prop-pohon-small',
    name: 'Pohon Peneduh Sedang (1×2)',
    category: 'nature',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Pohon.png',
    description: 'Pohon peneduh pinggir trotoar dan halaman sekolah.',
  },
  {
    key: 'prop-batu',
    name: 'Batu Karang Besar (1×2)',
    category: 'nature',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Batu.png',
    description: 'Batuan granit alam kokoh di perbukitan timur.',
  },
  {
    key: 'prop-lampu',
    name: 'Lampu Jalan Boulevard (1×3)',
    category: 'nature',
    gw: 1,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x3%20Lampu.png',
    description: 'Tiang lampu penerang jalan raya bergaya eropa klasik.',
  },

  // ==========================================
  // 4. SEKOLAH & EDUKASI KELAS (SCHOOL & CLASSROOM)
  // ==========================================
  {
    key: 'school-garuda-presiden',
    name: 'Garuda & Foto Presiden (3×1)',
    category: 'school',
    gw: 3,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/garuda_presiden.png',
    description: 'Lambang Negara Burung Garuda & Bingkai Foto Kenegaraan.',
  },
  {
    key: 'school-flag',
    name: 'Tiang Bendera Merah Putih (1×2)',
    category: 'school',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/flag.png',
    description: 'Tiang bendera kebangsaan Merah Putih berkibar megah.',
  },
  {
    key: 'school-whiteboard',
    name: 'Papan Tulis Whiteboard (3×1)',
    category: 'school',
    gw: 3,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/whiteboard.png',
    description: 'Whiteboard ruang kelas untuk materi pelajaran harian.',
  },
  {
    key: 'school-teacher-desk',
    name: 'Meja Podium Guru (2×1)',
    category: 'school',
    gw: 2,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/teacher_desk.png',
    description: 'Meja kayu podium pengajar dengan taplak batik.',
  },
  {
    key: 'school-teacher-chair',
    name: 'Kursi Eksekutif Guru (1×1)',
    category: 'school',
    gw: 1,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/teacher_chair.png',
    description: 'Kursi putar empuk pengajar di depan kelas.',
  },
  {
    key: 'school-student-desk',
    name: 'Meja Siswa Kayu (1×1)',
    category: 'school',
    gw: 1,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/student_desk.png',
    description: 'Meja belajar siswa standar nasional Indonesia.',
  },
  {
    key: 'school-student-chair',
    name: 'Kursi Siswa Kayu (1×1)',
    category: 'school',
    gw: 1,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/student_chair.png',
    description: 'Kursi sandaran kayu jati untuk murid.',
  },
  {
    key: 'school-bookshelf',
    name: 'Lemari Buku Perpustakaan (2×2)',
    category: 'school',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/bookshelf.png',
    description: 'Rak ensiklopedia, kamus, dan buku literasi kelas.',
  },

  // ==========================================
  // 5. TAHTA AGUNG & ADMIN SERVER (ADMIN CYBER)
  // ==========================================
  {
    key: 'admin-throne',
    name: 'Tahta Agung Raden (3×3)',
    category: 'admin',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/3x3%20Tahta%20Raden.png',
    description: 'Tahta singgasana emas sang Pencipta RadenWorld.',
  },
  {
    key: 'admin-console-broadcast',
    name: 'Konsol Broadcast Server (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Konsol%20Broadcast.png',
    description: 'Mainframe siaran pesan pengumuman ke seluruh dunia.',
  },
  {
    key: 'admin-console-database',
    name: 'Konsol Database Pemain (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Konsol%20Database.png',
    description: 'Server rack sensus data pemain terdaftar di server.',
  },
  {
    key: 'admin-console-godmode',
    name: 'Reaktor Godmode Speed (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Konsol%20Godmode.png',
    description: 'Reaktor kuantum penambah kecepatan 400 Px/s.',
  },
  {
    key: 'admin-portal-world',
    name: 'Gerbang Portal Open World (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Portal%20World.png',
    description: 'Stargate kosmis teleportasi ke dunia luar.',
  },
  {
    key: 'admin-portal-house',
    name: 'Gerbang Portal Rumah (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Portal%20House.png',
    description: 'Gerbang teleportasi langsung ke rumah pribadi.',
  },
  {
    key: 'admin-pillar',
    name: 'Pilar Obelisk Cyber (1×3)',
    category: 'admin',
    gw: 1,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/1x3%20Pilar%20Cyber.png',
    description: 'Kolom pilar heksagonal kristal penyangga energi.',
  },
  {
    key: 'admin-banner',
    name: 'Banner Monogram Emas (1×2)',
    category: 'admin',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/1x2%20Banner%20Raden.png',
    description: 'Tapestri dinding kerajaan monogram emas RadenWorld.',
  },
  {
    key: 'admin-holo-globe',
    name: 'Holo-Globe RadenWorld (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Holo%20Globe.png',
    description: 'Proyektor bola dunia hologram 3D melayang.',
  },
  {
    key: 'admin-carpet-gold',
    name: 'Karpet Sutra Emas (2×1)',
    category: 'admin',
    gw: 2,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/2x1%20Karpet%20Emas.png',
    description: 'Permadani sutra bertepi benang emas di tahta.',
  },
];

// Konfigurasi Bawaan Default
const DEFAULT_MAP_CONFIGS: Record<MapTargetType, IMapArchitectConfig> = {
  world: {
    gridWidth: 80,
    gridHeight: 80,
    tileSize: 120,
    customProps: [
      { id: 'def_wb_1', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 36, gy: 33, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.png' },
      { id: 'def_wb_2', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 43, gy: 33, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.png' },
      { id: 'def_wb_3', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 36, gy: 47, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.png' },
      { id: 'def_wb_4', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 43, gy: 47, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.png' },
      { id: 'def_wg_1', key: 'prop-rumput', name: 'Rumput Liar Alami (1×2)', gx: 19, gy: 20, gw: 1, gh: 2, isObstacle: false, imageSrc: '/assets/maps/World/Assets/1x2%20Rumput.png' },
      { id: 'def_wg_2', key: 'prop-rumput', name: 'Rumput Liar Alami (1×2)', gx: 20, gy: 20, gw: 1, gh: 2, isObstacle: false, imageSrc: '/assets/maps/World/Assets/1x2%20Rumput.png' },
      { id: 'def_wp_1', key: 'prop-pohon-tall', name: 'Pohon Tinggi Rindang (1×3)', gx: 36, gy: 22, gw: 1, gh: 3, isObstacle: true, imageSrc: '/assets/maps/World/Assets/1x3%20Pohon.png' },
      { id: 'def_wp_2', key: 'prop-pohon-tall', name: 'Pohon Tinggi Rindang (1×3)', gx: 44, gy: 22, gw: 1, gh: 3, isObstacle: true, imageSrc: '/assets/maps/World/Assets/1x3%20Pohon.png' },
    ],
    customTerrains: [
      { id: 'def_road_v', type: 'road', gx: 39, gy: 18, gw: 3, gh: 42, hasCollision: false },
      { id: 'def_road_h', type: 'road', gx: 17, gy: 44, gw: 46, gh: 2, hasCollision: false },
      { id: 'def_lake_1', type: 'water', gx: 58, gy: 24, gw: 14, gh: 9, hasCollision: true },
      { id: 'def_plaza', type: 'plaza', gx: 33, gy: 33, gw: 15, gh: 15, hasCollision: false },
    ],
  },
  school: {
    gridWidth: 18,
    gridHeight: 12,
    tileSize: 120,
    customProps: [
      { id: 'def_s_garuda', key: 'school-garuda-presiden', name: 'Garuda & Foto Presiden (3×1)', gx: 7.5, gy: 1, gw: 3, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/garuda_presiden.png' },
      { id: 'def_s_flag', key: 'school-flag', name: 'Tiang Bendera Merah Putih (1×2)', gx: 2, gy: 1, gw: 1, gh: 2, isObstacle: true, imageSrc: '/assets/maps/School/Assets/flag.png' },
      { id: 'def_s_teacher_d', key: 'school-teacher-desk', name: 'Meja Podium Guru (2×1)', gx: 8, gy: 3, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/School/Assets/teacher_desk.png' },
      { id: 'def_s_teacher_c', key: 'school-teacher-chair', name: 'Kursi Eksekutif Guru (1×1)', gx: 8.5, gy: 2, gw: 1, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/teacher_chair.png' },
      { id: 'def_s_desk_1', key: 'school-student-desk', name: 'Meja Siswa Kayu (1×1)', gx: 3, gy: 5, gw: 1, gh: 1, isObstacle: true, imageSrc: '/assets/maps/School/Assets/student_desk.png' },
      { id: 'def_s_chair_1', key: 'school-student-chair', name: 'Kursi Siswa Kayu (1×1)', gx: 3, gy: 6, gw: 1, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/student_chair.png' },
      { id: 'def_s_desk_2', key: 'school-student-desk', name: 'Meja Siswa Kayu (1×1)', gx: 5, gy: 5, gw: 1, gh: 1, isObstacle: true, imageSrc: '/assets/maps/School/Assets/student_desk.png' },
      { id: 'def_s_chair_2', key: 'school-student-chair', name: 'Kursi Siswa Kayu (1×1)', gx: 5, gy: 6, gw: 1, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/student_chair.png' },
    ],
    customTerrains: [],
  },
  house: {
    gridWidth: 14,
    gridHeight: 10,
    tileSize: 120,
    customProps: [
      { id: 'def_h_1', key: 'prop-meja', name: 'Meja Santai Pujasera (1×1)', gx: 7, gy: 5, gw: 1, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/1x1%20Meja.png' },
      { id: 'def_h_2', key: 'prop-kursi-front', name: 'Bangku Pujasera Depan (1×2)', gx: 7, gy: 6, gw: 1, gh: 2, isObstacle: false, imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman.png' },
    ],
    customTerrains: [
      { id: 'def_h_wood', type: 'wood', gx: 4, gy: 3, gw: 6, gh: 4, hasCollision: false },
    ],
  },
};

// Sektor Kamera Sims untuk Open World (Membagi Peta 80x80 tanpa scroll/pan)
export interface ISectorFocus {
  id: string;
  name: string;
  icon: string;
  minGx: number;
  maxGx: number;
  minGy: number;
  maxGy: number;
}

const WORLD_SECTORS: ISectorFocus[] = [
  { id: 'full', name: 'Seluruh Peta (80×80)', icon: '🌐', minGx: 0, maxGx: 80, minGy: 0, maxGy: 80 },
  { id: 'plaza', name: 'Plaza Pusat & Pujasera', icon: '🏛️', minGx: 28, maxGx: 52, minGy: 28, maxGy: 52 },
  { id: 'school', name: 'Kompleks Pendidikan (SD-SMP-SMA)', icon: '🏫', minGx: 44, maxGx: 76, minGy: 50, maxGy: 76 },
  { id: 'housing', name: 'Kawasan Rumah & Residensi', icon: '🏡', minGx: 8, maxGx: 36, minGy: 50, maxGy: 76 },
  { id: 'lake', name: 'Telaga Catur Kristal (Danau Mistik)', icon: '🌊', minGx: 50, maxGx: 78, minGy: 8, maxGy: 36 },
  { id: 'farm', name: 'Persawahan Asri Nusantara', icon: '🌾', minGx: 6, maxGx: 34, minGy: 6, maxGy: 34 },
];

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({ isOpen, onClose }) => {
  const [selectedMap, setSelectedMap] = useState<MapTargetType>('world');
  const [activeSimsTool, setActiveSimsTool] = useState<SimsToolType>('select');

  // Load configs from LocalStorage
  const [configs, setConfigs] = useState<Record<MapTargetType, IMapArchitectConfig>>(() => {
    const initial: Record<MapTargetType, IMapArchitectConfig> = { ...DEFAULT_MAP_CONFIGS };
    try {
      (['world', 'school', 'house'] as MapTargetType[]).forEach(k => {
        const saved = localStorage.getItem(`raden_architect_${k}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.gridWidth && parsed.gridHeight) {
            initial[k] = {
              ...parsed,
              customTerrains: parsed.customTerrains || initial[k].customTerrains || [],
            };
          }
        }
      });
    } catch (e) {}
    return initial;
  });

  const currentConfig = configs[selectedMap];

  // Sektor Navigasi Terkunci
  const [currentSectorId, setCurrentSectorId] = useState<string>('full');

  // Blueprint Toggles
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showFootprint, setShowFootprint] = useState<boolean>(true);
  const [showCollisionOverlay, setShowCollisionOverlay] = useState<boolean>(true);
  const [showTerrainLayer, setShowTerrainLayer] = useState<boolean>(true);

  // Catalog State: Default 'all' agar seluruh aset langsung terlihat!
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<AssetCategoryType>('all');
  const [selectedAssetInHand, setSelectedAssetInHand] = useState<IArchitectAsset | null>(ARCHITECT_ASSET_CATALOG[0]);
  const [selectedPlacedPropId, setSelectedPlacedPropId] = useState<string | null>(null);

  // Drag & Hover State
  const [draggingAsset, setDraggingAsset] = useState<IArchitectAsset | null>(null);
  const [draggingPlacedPropId, setDraggingPlacedPropId] = useState<string | null>(null);
  const [hoveredGridCell, setHoveredGridCell] = useState<{ gx: number; gy: number } | null>(null);

  // Terrain Painting Tool State
  const [selectedTerrainBrush, setSelectedTerrainBrush] = useState<TerrainType>('road');
  const [terrainBrushSize, setTerrainBrushSize] = useState<number>(2); // 1, 2, 3, 4
  const [isPaintingTerrain, setIsPaintingTerrain] = useState<boolean>(false);

  // Toast
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Sektor aktif untuk Open World
  const activeSector = useMemo(() => {
    if (selectedMap !== 'world') {
      return {
        id: 'full',
        name: 'Penuh',
        icon: '📐',
        minGx: 0,
        maxGx: currentConfig.gridWidth,
        minGy: 0,
        maxGy: currentConfig.gridHeight,
      };
    }
    const found = WORLD_SECTORS.find(s => s.id === currentSectorId);
    return found || WORLD_SECTORS[0];
  }, [selectedMap, currentSectorId, currentConfig.gridWidth, currentConfig.gridHeight]);

  // Lebar & Tinggi Petak yang Sedang Ditampilkan
  const viewWidthTiles = activeSector.maxGx - activeSector.minGx;
  const viewHeightTiles = activeSector.maxGy - activeSector.minGy;

  // UKURAN PETAK GRID TERKUNCI (FIXED VIEWPORT - NO PAN, NO ZOOM)
  const cellPx = useMemo(() => {
    if (selectedMap === 'school') return 36; // 18x12 -> 648x432 px
    if (selectedMap === 'house') return 44; // 14x10 -> 616x440 px
    // Open World:
    if (activeSector.id === 'full') return 8; // 80x80 -> 640x640 px
    return 24; // Sektor fokus -> ~650x650 px
  }, [selectedMap, activeSector.id]);

  const canvasPixelWidth = viewWidthTiles * cellPx;
  const canvasPixelHeight = viewHeightTiles * cellPx;

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return ARCHITECT_ASSET_CATALOG.filter(item => {
      const matchCat = activeCategoryTab === 'all' || item.category === activeCategoryTab;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategoryTab, searchQuery]);

  // Hitung jumlah aset per kategori
  const categoryCounts = useMemo(() => {
    const counts = {
      all: ARCHITECT_ASSET_CATALOG.length,
      building: 0,
      food: 0,
      nature: 0,
      school: 0,
      admin: 0,
    };
    ARCHITECT_ASSET_CATALOG.forEach(a => {
      if (counts[a.category] !== undefined) counts[a.category]++;
    });
    return counts;
  }, []);

  // Selected Placed Prop
  const selectedPlacedProp = useMemo(() => {
    return currentConfig.customProps.find(p => p.id === selectedPlacedPropId) || null;
  }, [currentConfig.customProps, selectedPlacedPropId]);

  // PUTAR ASET 90 DERAJAT (SWAP GW & GH)
  const handleRotateCurrentAsset = useCallback(() => {
    playSimsSound('rotate');
    if (selectedPlacedProp) {
      setConfigs(prev => ({
        ...prev,
        [selectedMap]: {
          ...prev[selectedMap],
          customProps: prev[selectedMap].customProps.map(p =>
            p.id === selectedPlacedProp.id ? { ...p, gw: p.gh, gh: p.gw } : p
          ),
        },
      }));
      showToast(`🔄 Aset "${selectedPlacedProp.name}" diputar 90° (${selectedPlacedProp.gh}×${selectedPlacedProp.gw} petak)`);
      return;
    }
    if (selectedAssetInHand) {
      setSelectedAssetInHand(prev => {
        if (!prev) return null;
        return {
          ...prev,
          gw: prev.gh,
          gh: prev.gw,
        };
      });
      showToast(`🔄 Aset di tangan diputar 90°`);
    }
  }, [selectedPlacedProp, selectedAssetInHand, selectedMap]);

  // Hotkey Keyboard: [R] untuk putar aset, [Delete/Backspace] untuk hapus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotateCurrentAsset();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPlacedPropId) {
        e.preventDefault();
        handleDeleteProp(selectedPlacedPropId);
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveSimsTool('hammer');
        playSimsSound('switch');
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveSimsTool('select');
        playSimsSound('switch');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotateCurrentAsset, selectedPlacedPropId]);

  // ADD PROP AT GRID
  const addPropAt = useCallback((gx: number, gy: number, asset: IArchitectAsset) => {
    const clampedGx = Math.max(0, Math.min(currentConfig.gridWidth - asset.gw, gx));
    const clampedGy = Math.max(0, Math.min(currentConfig.gridHeight - asset.gh, gy));

    const newProp: IPlacedPropItem = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: asset.key,
      name: asset.name,
      gx: clampedGx,
      gy: clampedGy,
      gw: asset.gw,
      gh: asset.gh,
      isObstacle: asset.defaultCollision,
      imageSrc: asset.imageSrc,
    };

    setConfigs(prev => ({
      ...prev,
      [selectedMap]: {
        ...prev[selectedMap],
        customProps: [newProp, ...prev[selectedMap].customProps],
      },
    }));

    setSelectedPlacedPropId(newProp.id);
    playSimsSound('place');
    showToast(`✓ "${asset.name}" berhasil diletakkan pada Grid (${clampedGx}, ${clampedGy})`);
  }, [currentConfig.gridWidth, currentConfig.gridHeight, selectedMap]);

  // MOVE EXISTING PROP
  const movePropTo = useCallback((propId: string, newGx: number, newGy: number) => {
    const prop = currentConfig.customProps.find(p => p.id === propId);
    if (!prop) return;

    const clampedGx = Math.max(0, Math.min(currentConfig.gridWidth - prop.gw, newGx));
    const clampedGy = Math.max(0, Math.min(currentConfig.gridHeight - prop.gh, newGy));

    setConfigs(prev => ({
      ...prev,
      [selectedMap]: {
        ...prev[selectedMap],
        customProps: prev[selectedMap].customProps.map(p =>
          p.id === propId ? { ...p, gx: clampedGx, gy: clampedGy } : p
        ),
      },
    }));

    playSimsSound('place');
    showToast(`✓ "${prop.name}" dipindahkan ke Grid (${clampedGx}, ${clampedGy})`);
  }, [currentConfig.customProps, currentConfig.gridWidth, currentConfig.gridHeight, selectedMap]);

  // DELETE / HAMMER PROP
  const handleDeleteProp = (id: string) => {
    playSimsSound('hammer');
    setConfigs(prev => ({
      ...prev,
      [selectedMap]: {
        ...prev[selectedMap],
        customProps: prev[selectedMap].customProps.filter(p => p.id !== id),
      },
    }));
    if (selectedPlacedPropId === id) setSelectedPlacedPropId(null);
    showToast(`🔨 Aset berhasil dihancurkan!`);
  };

  // EYEDROPPER CLONE PROP
  const handleEyedropProp = (prop: IPlacedPropItem) => {
    playSimsSound('click');
    const matched = ARCHITECT_ASSET_CATALOG.find(a => a.key === prop.key);
    if (matched) {
      setSelectedAssetInHand({
        ...matched,
        gw: prop.gw,
        gh: prop.gh,
      });
      setActiveSimsTool('select');
      showToast(`🧪 Aset "${prop.name}" disalin ke tangan untuk diletakkan!`);
    }
  };

  // PAINT TERRAIN
  const paintTerrainAt = useCallback((gx: number, gy: number) => {
    const size = terrainBrushSize;
    const clampedGx = Math.max(0, Math.min(currentConfig.gridWidth - size, gx));
    const clampedGy = Math.max(0, Math.min(currentConfig.gridHeight - size, gy));

    setConfigs(prev => {
      const currentTerrains = prev[selectedMap].customTerrains || [];
      const filtered = currentTerrains.filter(t => {
        const overlapX = t.gx < clampedGx + size && t.gx + t.gw > clampedGx;
        const overlapY = t.gy < clampedGy + size && t.gy + t.gh > clampedGy;
        return !(overlapX && overlapY);
      });

      const brushDef = TERRAIN_BRUSHES.find(b => b.type === selectedTerrainBrush);
      const newTerrain: ITerrainTileItem = {
        id: `terr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: selectedTerrainBrush,
        gx: clampedGx,
        gy: clampedGy,
        gw: size,
        gh: size,
        hasCollision: brushDef?.hasCollision ?? (selectedTerrainBrush === 'water'),
      };

      return {
        ...prev,
        [selectedMap]: {
          ...prev[selectedMap],
          customTerrains: [...filtered, newTerrain],
        },
      };
    });
    playSimsSound('place');
  }, [terrainBrushSize, currentConfig.gridWidth, currentConfig.gridHeight, selectedMap, selectedTerrainBrush]);

  // ERASE TERRAIN
  const eraseTerrainAt = useCallback((gx: number, gy: number) => {
    const size = terrainBrushSize;
    setConfigs(prev => {
      const currentTerrains = prev[selectedMap].customTerrains || [];
      const filtered = currentTerrains.filter(t => {
        const overlapX = t.gx < gx + size && t.gx + t.gw > gx;
        const overlapY = t.gy < gy + size && t.gy + t.gh > gy;
        return !(overlapX && overlapY);
      });
      return {
        ...prev,
        [selectedMap]: {
          ...prev[selectedMap],
          customTerrains: filtered,
        },
      };
    });
    playSimsSound('hammer');
  }, [terrainBrushSize, selectedMap]);

  // CLEAR ALL TERRAINS
  const handleClearAllTerrains = () => {
    if (!confirm(`Hapus seluruh lapisan medan (jalan & danau) di ${selectedMap.toUpperCase()}?`)) return;
    playSimsSound('hammer');
    setConfigs(prev => ({
      ...prev,
      [selectedMap]: {
        ...prev[selectedMap],
        customTerrains: [],
      },
    }));
    showToast(`🧹 Seluruh medan ${selectedMap.toUpperCase()} dibersihkan.`);
  };

  // SAVE TO LOCALSTORAGE & EMIT EVENTBUS
  const handleSaveConfig = () => {
    try {
      localStorage.setItem(`raden_architect_${selectedMap}`, JSON.stringify(currentConfig));
      EventBus.emit('architect-config-updated', { mapType: selectedMap, config: currentConfig });
      playSimsSound('place');
      showToast(`💾 Arsitektur ${selectedMap.toUpperCase()} Tersimpan & Diterapkan ke Game!`);
    } catch (e) {
      showToast('❌ Gagal menyimpan konfigurasi.');
    }
  };

  // RESET TO DEFAULT
  const handleResetToDefault = () => {
    if (!confirm(`Kembalikan peta ${selectedMap.toUpperCase()} ke kondisi bawaan awal?`)) return;
    playSimsSound('hammer');
    setConfigs(prev => ({
      ...prev,
      [selectedMap]: JSON.parse(JSON.stringify(DEFAULT_MAP_CONFIGS[selectedMap])),
    }));
    try {
      localStorage.removeItem(`raden_architect_${selectedMap}`);
      EventBus.emit('architect-config-updated', { mapType: selectedMap, config: DEFAULT_MAP_CONFIGS[selectedMap] });
      showToast(`🔄 Peta ${selectedMap.toUpperCase()} Direset ke Bawaan Awal.`);
    } catch (e) {}
  };

  // TELEPORT TEST
  const handleTeleportToMap = () => {
    handleSaveConfig();
    onClose();
    if (selectedMap === 'world') {
      window.history.pushState(null, '', '/world');
      EventBus.emit('url-changed', '/world');
      window.location.href = '/world';
    } else if (selectedMap === 'school') {
      window.history.pushState(null, '', '/world/smp');
      EventBus.emit('url-changed', '/world/smp');
      window.location.href = '/world/smp';
    } else {
      window.history.pushState(null, '', '/house');
      EventBus.emit('url-changed', '/house');
      window.location.href = '/house';
    }
  };

  // MOUSE COORDINATE CALCULATION ON CANVAS
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const relGx = Math.floor(mouseX / cellPx);
    const relGy = Math.floor(mouseY / cellPx);

    const absoluteGx = activeSector.minGx + relGx;
    const absoluteGy = activeSector.minGy + relGy;

    if (
      absoluteGx >= activeSector.minGx &&
      absoluteGx < activeSector.maxGx &&
      absoluteGy >= activeSector.minGy &&
      absoluteGy < activeSector.maxGy
    ) {
      setHoveredGridCell({ gx: absoluteGx, gy: absoluteGy });
      if (isPaintingTerrain) {
        if (activeSimsTool === 'terrain') paintTerrainAt(absoluteGx, absoluteGy);
        else if (activeSimsTool === 'eraser') eraseTerrainAt(absoluteGx, absoluteGy);
      }
    } else {
      setHoveredGridCell(null);
    }
  };

  // CANVAS CLICK HANDLER (PLUSH OR HAMMER OR DROPPER)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoveredGridCell) return;
    const { gx, gy } = hoveredGridCell;

    if (activeSimsTool === 'hammer') {
      const propToHit = currentConfig.customProps.find(p =>
        gx >= p.gx && gx < p.gx + p.gw && gy >= p.gy && gy < p.gy + p.gh
      );
      if (propToHit) {
        handleDeleteProp(propToHit.id);
        return;
      }
      eraseTerrainAt(gx, gy);
      return;
    }

    if (activeSimsTool === 'dropper') {
      const propToDrop = currentConfig.customProps.find(p =>
        gx >= p.gx && gx < p.gx + p.gw && gy >= p.gy && gy < p.gy + p.gh
      );
      if (propToDrop) {
        handleEyedropProp(propToDrop);
      }
      return;
    }

    if (activeSimsTool === 'terrain') {
      paintTerrainAt(gx, gy);
      return;
    }

    if (activeSimsTool === 'eraser') {
      eraseTerrainAt(gx, gy);
      return;
    }

    if (activeSimsTool === 'select' && selectedAssetInHand) {
      addPropAt(gx, gy, selectedAssetInHand);
    }
  };

  // HTML5 DRAG & DROP HANDLERS
  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    handleCanvasMouseMove(e as any);
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!hoveredGridCell) return;
    const { gx, gy } = hoveredGridCell;

    const repositionPropId = e.dataTransfer.getData('text/reposition');
    if (repositionPropId) {
      movePropTo(repositionPropId, gx, gy);
      setDraggingPlacedPropId(null);
      return;
    }

    const assetJson = e.dataTransfer.getData('application/json');
    if (assetJson) {
      try {
        const asset: IArchitectAsset = JSON.parse(assetJson);
        addPropAt(gx, gy, asset);
      } catch (err) {}
    } else if (draggingAsset) {
      addPropAt(gx, gy, draggingAsset);
    }

    setDraggingAsset(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-4 select-none font-sans text-slate-100 overflow-hidden">
      {/* Toast Notifikasi Sims */}
      {saveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs md:text-sm shadow-2xl flex items-center gap-2.5 border border-emerald-200 animate-bounce">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main Sims Studio Modal Window */}
      <div className="w-full h-full max-w-[1720px] max-h-[960px] bg-slate-950 border-2 border-emerald-500/40 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.2)] flex flex-col overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. TOP HEADER: THE SIMS PLUMBOB & MAP SELECTOR & ACTIONS       */}
        {/* ============================================================== */}
        <div className="px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 flex items-center justify-between gap-3 shrink-0">
          
          {/* Logo & Plumbob */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <Sparkle className="w-5 h-5 text-slate-950 animate-pulse fill-slate-950" />
              <div className="absolute -inset-1 rounded-2xl bg-emerald-400/20 blur-sm -z-10 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-sm md:text-base text-emerald-400 font-mono">
                  THE SIMS 2D • STUDIO ARSITEK RADEN
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  BUILD MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mode Pembangunan 2D Grid Terkunci • Presisi Petak 120px Realtime
              </p>
            </div>
          </div>

          {/* Map Target Selector (World / School / House) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setSelectedMap('world');
                setCurrentSectorId('full');
                setSelectedPlacedPropId(null);
                playSimsSound('switch');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedMap === 'world'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Open World (80×80)</span>
            </button>
            <button
              onClick={() => {
                setSelectedMap('school');
                setCurrentSectorId('full');
                setSelectedPlacedPropId(null);
                playSimsSound('switch');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedMap === 'school'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Sekolah (18×12)</span>
            </button>
            <button
              onClick={() => {
                setSelectedMap('house');
                setCurrentSectorId('full');
                setSelectedPlacedPropId(null);
                playSimsSound('switch');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedMap === 'house'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Rumah (14×10)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold transition flex items-center gap-1.5"
              title="Kembalikan peta ke kondisi awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleTeleportToMap}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              title="Simpan dan teleportasi langsung ke lokasi"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Uji Langsung</span>
            </button>

            <button
              onClick={handleSaveConfig}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terapkan</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
              title="Tutup Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. THE SIMS BUILD TOOLBAR (HAND, SLEDGEHAMMER, DROPPER, ROTATE) */}
        {/* ============================================================== */}
        <div className="px-5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Main Sims Toolset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setActiveSimsTool('select'); playSimsSound('switch'); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition ${
                activeSimsTool === 'select'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Pilih dan letakkan aset [V]"
            >
              <MousePointer className="w-4 h-4" />
              <span>✋ Tangan (Pilih/Letakkan)</span>
            </button>

            <button
              onClick={() => { setActiveSimsTool('hammer'); playSimsSound('switch'); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition ${
                activeSimsTool === 'hammer'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 font-black animate-pulse'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Palu Hancurkan: Klik objek atau jalan di kanvas untuk menghapusnya seketika! [H]"
            >
              <Hammer className="w-4 h-4 text-rose-300" />
              <span>🔨 Palu Hancurkan</span>
            </button>

            <button
              onClick={() => { setActiveSimsTool('dropper'); playSimsSound('switch'); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition ${
                activeSimsTool === 'dropper'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Pipet: Klik aset di kanvas untuk langsung menyalinnya ke tangan"
            >
              <Pipette className="w-4 h-4" />
              <span>🧪 Pipet Kloning</span>
            </button>

            <button
              onClick={handleRotateCurrentAsset}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 font-bold flex items-center gap-1.5 transition"
              title="Putar aset 90 derajat [R]"
            >
              <RotateCw className="w-4 h-4 text-amber-400" />
              <span>🔄 Putar 90° [R]</span>
            </button>

            <button
              onClick={() => {
                setActiveSimsTool('terrain');
                setActiveCategoryTab('terrain');
                playSimsSound('switch');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition ${
                activeSimsTool === 'terrain'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Kuas Jalan & Danau"
            >
              <Palette className="w-4 h-4" />
              <span>🖌️ Kuas Jalan & Danau</span>
            </button>

            <button
              onClick={() => { setActiveSimsTool('eraser'); playSimsSound('switch'); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition ${
                activeSimsTool === 'eraser'
                  ? 'bg-slate-200 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Penghapus Medan"
            >
              <Eraser className="w-4 h-4" />
              <span>🧹 Penghapus Medan</span>
            </button>
          </div>

          {/* Sektor Navigasi Sims untuk Open World */}
          {selectedMap === 'world' && (
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono">
              <span className="text-slate-400 px-1 font-sans flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>SEKTOR KAMERA:</span>
              </span>
              {WORLD_SECTORS.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => { setCurrentSectorId(sec.id); playSimsSound('switch'); }}
                  className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    currentSectorId === sec.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={sec.name}
                >
                  <span>{sec.icon}</span>
                  <span className="hidden xl:inline">{sec.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Blueprint Layer Toggles */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-300 transition">
              <input
                type="checkbox"
                checked={showFootprint}
                onChange={e => setShowFootprint(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>📦 Grid Transparan ({selectedPlacedProp ? 'Aktif' : 'Semua'})</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-rose-300 transition">
              <input
                type="checkbox"
                checked={showCollisionOverlay}
                onChange={e => setShowCollisionOverlay(e.target.checked)}
                className="rounded accent-rose-500"
              />
              <span>⛔ Grid Merah Solid</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-300 transition">
              <input
                type="checkbox"
                checked={showTerrainLayer}
                onChange={e => setShowTerrainLayer(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>🛣️ Lapisan Medan</span>
            </label>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. CENTER VIEWPORT: THE SIMS 2D BLUEPRINT DRAFTING BOARD      */}
        {/* ============================================================== */}
        {/* VIEWPORT TERKUNCI STABIL: overflow-hidden & onWheel dicegah -> TIDAK BISA GESER KIRI KANAN ATAU ZOOM! */}
        <div
          className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-950 p-2 select-none"
          onWheel={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={() => {
            if (activeSimsTool === 'terrain' && hoveredGridCell) {
              setIsPaintingTerrain(true);
              paintTerrainAt(hoveredGridCell.gx, hoveredGridCell.gy);
            } else if (activeSimsTool === 'eraser' && hoveredGridCell) {
              setIsPaintingTerrain(true);
              eraseTerrainAt(hoveredGridCell.gx, hoveredGridCell.gy);
            }
          }}
          onMouseUp={() => setIsPaintingTerrain(false)}
          onMouseLeave={() => setIsPaintingTerrain(false)}
        >
          {/* HUD KURSOR & STATUS SEKTOR */}
          <div className="absolute top-3 left-4 z-30 flex items-center gap-3 text-[11px] font-mono pointer-events-none">
            <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 backdrop-blur-sm flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                Peta: <strong className="text-emerald-400 uppercase">{selectedMap}</strong> ({currentConfig.gridWidth}×{currentConfig.gridHeight} Petak)
              </span>
            </div>

            {hoveredGridCell ? (
              <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/50 text-emerald-300 font-bold backdrop-blur-sm shadow-lg">
                Grid ({hoveredGridCell.gx}, {hoveredGridCell.gy}) • {hoveredGridCell.gx * 120}px, {hoveredGridCell.gy * 120}px
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 backdrop-blur-sm">
                Arahkan kursor ke petak kanvas
              </div>
            )}
          </div>

          {/* PALET UKURAN KUAS JIKA SEDANG MEMILIH KUAS MEDAN */}
          {(activeSimsTool === 'terrain' || activeSimsTool === 'eraser') && (
            <div className="absolute top-3 right-4 z-30 p-2 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl flex items-center gap-2 text-xs font-mono">
              <span className="text-amber-400 font-bold px-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                <span>UKURAN KUAS:</span>
              </span>
              {[1, 2, 3, 4].map(sz => (
                <button
                  key={sz}
                  onClick={() => setTerrainBrushSize(sz)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition border ${
                    terrainBrushSize === sz
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  {sz}×{sz}
                </button>
              ))}
              <button
                onClick={handleClearAllTerrains}
                className="ml-2 px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-sans font-bold"
                title="Hapus seluruh medan"
              >
                Hapus Semua
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* THE FIXED 2D BLUEPRINT CANVAS (NO PAN, NO ZOOM)                */}
          {/* ============================================================== */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            className={`relative rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 transition-none overflow-hidden select-none ${
              activeSimsTool === 'hammer'
                ? 'cursor-pointer border-rose-500'
                : activeSimsTool === 'dropper'
                ? 'cursor-copy border-cyan-400'
                : 'cursor-crosshair border-emerald-500/60'
            }`}
            style={{
              width: `${canvasPixelWidth}px`,
              height: `${canvasPixelHeight}px`,
              backgroundImage: showGridLines
                ? `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`
                : 'none',
              backgroundSize: `${cellPx}px ${cellPx}px`,
              backgroundColor:
                selectedMap === 'world'
                  ? '#064e3b'
                  : selectedMap === 'school'
                  ? '#1e293b'
                  : '#451a03',
            }}
          >
            {/* LAYER 1: LAPISAN MEDAN & JALAN (ROADS, LAKES, PLAZAS, DIRT, WOOD) */}
            {showTerrainLayer && (currentConfig.customTerrains || []).map(t => {
              if (
                t.gx + t.gw <= activeSector.minGx ||
                t.gx >= activeSector.maxGx ||
                t.gy + t.gh <= activeSector.minGy ||
                t.gy >= activeSector.maxGy
              ) {
                return null;
              }

              const left = (t.gx - activeSector.minGx) * cellPx;
              const top = (t.gy - activeSector.minGy) * cellPx;
              const width = t.gw * cellPx;
              const height = t.gh * cellPx;

              const brushInfo = TERRAIN_BRUSHES.find(b => b.type === t.type);

              return (
                <div
                  key={t.id}
                  className="absolute border select-none transition-none pointer-events-none group"
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    backgroundColor: brushInfo?.color || '#1e293b',
                    borderColor: brushInfo?.borderColor || '#475569',
                    boxShadow: t.type === 'water' ? 'inset 0 0 12px rgba(56, 189, 248, 0.5)' : 'none',
                  }}
                >
                  {t.type === 'road' && (
                    <div className="w-full h-full border-t border-b border-amber-400/40 border-dashed flex items-center justify-center">
                      <span className="text-[9px] font-mono text-amber-200/60 font-bold">🛣️ JALAN</span>
                    </div>
                  )}
                  {t.type === 'water' && (
                    <div className="w-full h-full bg-cyan-400/20 border border-cyan-400/50 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-mono text-cyan-200 font-bold">🌊 DANAU</span>
                      <span className="text-[8px] font-mono text-rose-300 font-bold bg-rose-950/80 px-1 rounded">
                        ⛔ SOLID COLLISION
                      </span>
                    </div>
                  )}
                  {t.type === 'plaza' && (
                    <div className="w-full h-full flex items-center justify-center border border-amber-500/30">
                      <span className="text-[9px] font-mono text-amber-300/60">🏛️ PLAZA</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* LAYER 2: LAPISAN ASET TERPASANG (CUSTOM PROPS) */}
            {currentConfig.customProps.map(prop => {
              if (
                prop.gx + prop.gw <= activeSector.minGx ||
                prop.gx >= activeSector.maxGx ||
                prop.gy + prop.gh <= activeSector.minGy ||
                prop.gy >= activeSector.maxGy
              ) {
                return null;
              }

              const left = (prop.gx - activeSector.minGx) * cellPx;
              const top = (prop.gy - activeSector.minGy) * cellPx;
              const width = prop.gw * cellPx;
              const height = prop.gh * cellPx;
              const isSelected = selectedPlacedPropId === prop.id;

              return (
                <div
                  key={prop.id}
                  draggable={activeSimsTool === 'select'}
                  onDragStart={e => {
                    e.dataTransfer.setData('text/reposition', prop.id);
                    setDraggingPlacedPropId(prop.id);
                  }}
                  onDragEnd={() => setDraggingPlacedPropId(null)}
                  onClick={e => {
                    e.stopPropagation();
                    if (activeSimsTool === 'hammer') {
                      handleDeleteProp(prop.id);
                    } else if (activeSimsTool === 'dropper') {
                      handleEyedropProp(prop);
                    } else {
                      setSelectedPlacedPropId(prop.id);
                      playSimsSound('click');
                    }
                  }}
                  className={`absolute select-none cursor-move transition-none rounded-md overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-30'
                      : 'hover:ring-1 hover:ring-emerald-400/80 z-20'
                  }`}
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  title={`${prop.name} (${prop.gx}, ${prop.gy}) • [${prop.gw}×${prop.gh} Petak]`}
                >
                  {/* GRID TRANSPARAN FOOTPRINT (MENUNJUKKAN PETAK YANG DIMAKAN ASET) */}
                  {showFootprint && (
                    <div className="absolute inset-0 border border-emerald-400/60 bg-emerald-500/10 pointer-events-none z-10 flex flex-col">
                      <div
                        className="grid h-full w-full"
                        style={{
                          gridTemplateColumns: `repeat(${prop.gw}, 1fr)`,
                          gridTemplateRows: `repeat(${prop.gh}, 1fr)`,
                        }}
                      >
                        {Array.from({ length: prop.gw * prop.gh }).map((_, idx) => (
                          <div
                            key={idx}
                            className="border border-emerald-400/30 flex items-center justify-center"
                          >
                            <span className="text-[8px] font-mono text-emerald-300/60 font-bold">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* THUMBNAIL GAMBAR ASET */}
                  <div className="relative w-full h-full flex items-center justify-center p-0.5 bg-slate-900/50 backdrop-blur-xs">
                    {prop.imageSrc ? (
                      <img
                        src={prop.imageSrc}
                        alt={prop.name}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                    ) : (
                      <Layers className="w-4 h-4 text-emerald-400 pointer-events-none" />
                    )}
                  </div>

                  {/* GRID MERAH TABRAKAN FISIK (SOLID COLLISION OVERLAY) */}
                  {showCollisionOverlay && (
                    <div
                      className={`absolute bottom-0 inset-x-0 font-mono text-[7px] font-bold flex items-center justify-center border-t select-none pointer-events-none z-20 ${
                        prop.isObstacle
                          ? 'bg-rose-600/80 border-rose-400 text-rose-100 shadow-md'
                          : 'bg-emerald-600/80 border-emerald-400 text-emerald-100'
                      }`}
                      style={{
                        height: `${Math.min(height, Math.max(14, cellPx))}px`,
                      }}
                    >
                      <span className="truncate px-0.5">
                        {prop.isObstacle ? '⛔ SOLID' : '🚶 TEMBUS'}
                      </span>
                    </div>
                  )}

                  {/* FLOATING ACTION TOOLBAR UNTUK ASET TERPILIH (SIMS STYLE) */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 z-30 flex items-center gap-0.5 p-0.5 bg-slate-950/90 rounded-bl border-b border-l border-emerald-500">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotateCurrentAsset();
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 transition"
                        title="Putar 90° [R]"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEyedropProp(prop);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 transition"
                        title="Salin / Duplikasi"
                      >
                        <Pipette className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProp(prop.id);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-rose-500 hover:text-white text-rose-400 transition"
                        title="Hancurkan [Del]"
                      >
                        <Hammer className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* LAYER 3: THE SIMS LIVE GHOST FOOTPRINT PREVIEW (HOVER & DRAG) */}
            {hoveredGridCell && (draggingAsset || (activeSimsTool === 'select' && selectedAssetInHand)) && (
              (() => {
                const activeAsset = draggingAsset || selectedAssetInHand!;
                const ghostLeft = (hoveredGridCell.gx - activeSector.minGx) * cellPx;
                const ghostTop = (hoveredGridCell.gy - activeSector.minGy) * cellPx;
                const ghostWidth = activeAsset.gw * cellPx;
                const ghostHeight = activeAsset.gh * cellPx;

                return (
                  <div
                    className="absolute pointer-events-none z-40 rounded-md overflow-hidden border-2 border-dashed border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.9)] animate-pulse"
                    style={{
                      left: `${ghostLeft}px`,
                      top: `${ghostTop}px`,
                      width: `${ghostWidth}px`,
                      height: `${ghostHeight}px`,
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    {/* Visualisasi Sub-Petak Grid Transparan */}
                    <div
                      className="w-full h-full grid"
                      style={{
                        gridTemplateColumns: `repeat(${activeAsset.gw}, 1fr)`,
                        gridTemplateRows: `repeat(${activeAsset.gh}, 1fr)`,
                      }}
                    >
                      {Array.from({ length: activeAsset.gw * activeAsset.gh }).map((_, idx) => (
                        <div
                          key={idx}
                          className="border border-emerald-400/60 flex items-center justify-center font-mono text-[9px] font-black text-emerald-100"
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>

                    {/* Floating Info Footprint Badge */}
                    <div className="absolute -top-7 left-0 bg-slate-950 border border-emerald-400 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold font-mono whitespace-nowrap shadow-xl">
                      {activeAsset.name} • [Makan {activeAsset.gw}×{activeAsset.gh} Petak] ({hoveredGridCell.gx}, {hoveredGridCell.gy})
                    </div>

                    {/* Grid Merah Solid Collision Indicator */}
                    <div
                      className={`absolute bottom-0 inset-x-0 font-mono text-[8px] font-bold flex items-center justify-center border-t ${
                        activeAsset.defaultCollision
                          ? 'bg-rose-600/90 border-rose-400 text-rose-100'
                          : 'bg-emerald-600/90 border-emerald-400 text-emerald-100'
                      }`}
                      style={{
                        height: `${Math.min(ghostHeight, Math.max(16, cellPx))}px`,
                      }}
                    >
                      {activeAsset.defaultCollision ? '⛔ GRID MERAH (COLLISION SOLID)' : '🚶 GRID HIJAU (BEBAS DIINJAK)'}
                    </div>
                  </div>
                );
              })()
            )}

            {/* LAYER 4: TERRAIN BRUSH GHOST PREVIEW */}
            {hoveredGridCell && (activeSimsTool === 'terrain' || activeSimsTool === 'eraser') && (
              <div
                className={`absolute pointer-events-none z-40 border-2 border-dashed ${
                  activeSimsTool === 'eraser'
                    ? 'border-rose-400 bg-rose-500/25'
                    : 'border-cyan-400 bg-cyan-400/25'
                }`}
                style={{
                  left: `${(hoveredGridCell.gx - activeSector.minGx) * cellPx}px`,
                  top: `${(hoveredGridCell.gy - activeSector.minGy) * cellPx}px`,
                  width: `${terrainBrushSize * cellPx}px`,
                  height: `${terrainBrushSize * cellPx}px`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-slate-950 border border-cyan-400 text-cyan-300 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                  {activeSimsTool === 'eraser' ? '🧹 PENGHAPUS' : `🖌️ KUAS ${selectedTerrainBrush.toUpperCase()}`} ({terrainBrushSize}×{terrainBrushSize})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. BOTTOM THE SIMS BUILD CATALOG DRAWER (TABS & ASSET CARDS)    */}
        {/* ============================================================== */}
        <div className="bg-slate-950 border-t-2 border-emerald-500/40 p-3 flex flex-col gap-2 shrink-0 z-20">
          
          {/* Category Tabs & Quick Search */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* The Sims Style Drawer Tabs (Lengkap dengan Gedung, Gerobak, Alam, Sekolah, Admin) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              {/* Tab 0: Semua Aset */}
              <button
                onClick={() => { setActiveCategoryTab('all'); playSimsSound('switch'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategoryTab === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>🌐 Semua Aset ({categoryCounts.all})</span>
              </button>

              {/* Tab 1: Gedung & Bangunan */}
              <button
                onClick={() => { setActiveCategoryTab('building'); playSimsSound('switch'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategoryTab === 'building'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>🏢 Gedung & Rumah ({categoryCounts.building})</span>
              </button>

              {/* Tab 2: Gerobak & Pujasera */}
              <button
                onClick={() => { setActiveCategoryTab('food'); playSimsSound('switch'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategoryTab === 'food'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>🍲 Gerobak & Pujasera ({categoryCounts.food})</span>
              </button>

              {/* Tab 3: Alam & Lanskap */}
              <button
                onClick={() => { setActiveCategoryTab('nature'); playSimsSound('switch'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategoryTab === 'nature'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>🌿 Alam & Taman ({categoryCounts.nature})</span>
              </button>

              {/* Tab 4: Sekolah & Kelas */}
              <button
                onClick={() => { setActiveCategoryTab('school'); playSimsSound('switch'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategoryTab === 'school'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>🎓 Sekolah & Kelas ({categoryCounts.school})</span>
              </button>

              {/* Tab 5: Tahta & Admin */}
              <button
                onClick={() => { setActiveCategoryTab('admin'); playSimsSound('switch'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategoryTab === 'admin'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>👑 Tahta & Admin ({categoryCounts.admin})</span>
              </button>

              {/* Tab 6: Kuas Jalan & Danau */}
              <button
                onClick={() => {
                  setActiveCategoryTab('terrain');
                  setActiveSimsTool('terrain');
                  playSimsSound('switch');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategoryTab === 'terrain'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>🛣️ Kuas Jalan & Danau</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari gedung, gerobak, pohon..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-400 outline-none font-sans"
              />
            </div>
          </div>

          {/* ASSET CARDS CAROUSEL (DRAGGABLE DIRECTLY TO CANVAS) */}
          {activeCategoryTab !== 'terrain' ? (
            <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-emerald-500/30">
              {filteredCatalog.map(asset => {
                const isSelected = selectedAssetInHand?.key === asset.key;
                return (
                  <div
                    key={asset.key}
                    draggable={true}
                    onDragStart={e => {
                      e.dataTransfer.setData('application/json', JSON.stringify(asset));
                      setDraggingAsset(asset);
                      setSelectedAssetInHand(asset);
                      playSimsSound('click');
                    }}
                    onDragEnd={() => setDraggingAsset(null)}
                    onClick={() => {
                      setSelectedAssetInHand(asset);
                      setActiveSimsTool('select');
                      playSimsSound('click');
                    }}
                    className={`shrink-0 w-48 p-2.5 rounded-2xl border transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing group ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                    title="Tarik (drag) atau klik untuk meletakkan di kanvas"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 p-1 overflow-hidden">
                        {asset.imageSrc ? (
                          <img
                            src={asset.imageSrc}
                            alt={asset.name}
                            className="max-h-full max-w-full object-contain pointer-events-none"
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-300">
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                          {asset.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-emerald-300 font-bold border border-slate-800">
                        {asset.gw}×{asset.gh} Petak
                      </span>
                      <span
                        className={`font-bold ${
                          asset.defaultCollision ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {asset.defaultCollision ? '⛔ Solid' : '🚶 Tembus'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* KUAS MEDAN & JALAN */
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {TERRAIN_BRUSHES.map(brush => {
                const isActive = selectedTerrainBrush === brush.type;
                return (
                  <button
                    key={brush.type}
                    onClick={() => {
                      setSelectedTerrainBrush(brush.type);
                      setActiveSimsTool('terrain');
                      playSimsSound('click');
                    }}
                    className={`shrink-0 w-56 p-2.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{brush.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {brush.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {brush.description}
                      </div>
                      <div className="mt-1 text-[9px] font-mono font-bold">
                        <span className={brush.hasCollision ? 'text-rose-400' : 'text-emerald-400'}>
                          {brush.hasCollision ? '⛔ Solid Tabrakan' : '🚶 Bebas Dilewati'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
