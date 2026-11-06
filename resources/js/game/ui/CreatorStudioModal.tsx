/**
 * ============================================================================
 * FILE: resources/js/game/ui/CreatorStudioModal.tsx
 * ============================================================================
 * THE SIMS 2D • STUDIO ARSITEK TAHTA RADEN (BUILD & BUY MODE)
 * Gaya Visual: Chunky Pastel Pixel (Cozycore UI) & Cute Minimalist Clay-Pixel.
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
  X,
  Sparkles,
  ExternalLink,
  Search,
  Palette,
  Eraser,
  Hammer,
  Pipette,
  MousePointer,
  RotateCw,
  Compass,
  TreePine,
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
  gw: number;
  gh: number;
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
    description: 'Jalan raya aspal kota dengan marka putih jalan.',
    hasCollision: false,
    color: '#334155',
    borderColor: '#5C3A21',
  },
  {
    type: 'water',
    name: 'Danau Mistik Kristal',
    icon: '🌊',
    description: 'Air danau biru segar. Solid Collision: Karakter tidak tenggelam!',
    hasCollision: true,
    color: '#0284c7',
    borderColor: '#5C3A21',
  },
  {
    type: 'plaza',
    name: 'Plaza Obsidian & Emas',
    icon: '🏛️',
    description: 'Ubin batu mewah untuk area pusat kota dan santai.',
    hasCollision: false,
    color: '#475569',
    borderColor: '#5C3A21',
  },
  {
    type: 'dirt',
    name: 'Jalan Tanah / Pasir',
    icon: '🏖️',
    description: 'Jalan setapak pedesaan alami bertekstur tanah cokelat.',
    hasCollision: false,
    color: '#78350f',
    borderColor: '#5C3A21',
  },
  {
    type: 'wood',
    name: 'Lantai Parket Kayu Jati',
    icon: '🪵',
    description: 'Lantai parket kayu cocok untuk kelas, panggung, dan rumah.',
    hasCollision: false,
    color: '#92400e',
    borderColor: '#5C3A21',
  },
];

export const ARCHITECT_ASSET_CATALOG: IArchitectAsset[] = [
  {
    key: 'school-sd-building',
    name: 'Gedung Sekolah SD (5×10)',
    category: 'building',
    gw: 5,
    gh: 10,
    defaultCollision: true,
    imageSrc: '/assets/maps/SD/5x10%20Gedung%20SD.webp',
    description: 'Gedung megah Sekolah Dasar Negeri beratap genteng merah dan pintu masuk utama.',
  },
  {
    key: 'school-smp-building',
    name: 'Gedung Sekolah SMP (5×10)',
    category: 'building',
    gw: 5,
    gh: 10,
    defaultCollision: true,
    imageSrc: '/assets/maps/SMP/5x10%20Gedung%20SMP.webp',
    description: 'Gedung megah Sekolah Menengah Pertama bertingkat dengan arsitektur biru modern.',
  },
  {
    key: 'school-sma-building',
    name: 'Gedung Sekolah SMA (5×10)',
    category: 'building',
    gw: 5,
    gh: 10,
    defaultCollision: true,
    imageSrc: '/assets/maps/SMA/5x10%20Gedung%20SMA.webp',
    description: 'Gedung Sekolah Menengah Atas Kebangsaan lantai 2 berfasad abu-abu megah.',
  },
  {
    key: 'house-5x5',
    name: 'Rumah Modern Pemain (5×5)',
    category: 'building',
    gw: 5,
    gh: 5,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/5x5%20Rumah.webp',
    description: 'Rumah hunian pribadi dua lantai modern dengan garasi dan jendela kaca.',
  },
  {
    key: 'cart-bakso',
    name: 'Gerobak Bakso Solo (3×3)',
    category: 'food',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/3x3%20Gerobak%20Bakso.webp',
    description: 'Gerobak kuliner bakso urat kuah kaldu sapi gurih Solo dengan dandang uap.',
  },
  {
    key: 'cart-mie-ayam',
    name: 'Gerobak Mie Ayam Jamur (3×3)',
    category: 'food',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/3x3%20Gerobak%20Mie%20Ayam.webp',
    description: 'Gerobak mie ayam jamur manis gurih dengan mangkok dan rebusan mie.',
  },
  {
    key: 'cart-soto',
    name: 'Gerobak Soto Lamongan (3×3)',
    category: 'food',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/3x3%20Gerobak%20Soto.webp',
    description: 'Gerobak soto ayam koya gurih Jawa Timur beraroma rempah kunyit harum.',
  },
  {
    key: 'prop-meja',
    name: 'Meja Santai Pujasera (1×1)',
    category: 'food',
    gw: 1,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x1%20Meja.webp',
    description: 'Meja bundar kayu untuk tempat makan santai di pujasera.',
  },
  {
    key: 'prop-kursi-front',
    name: 'Bangku Pujasera Depan (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman.webp',
    description: 'Bangku taman menghadap depan untuk duduk santai menikmati hidangan.',
  },
  {
    key: 'prop-kursi-side',
    name: 'Bangku Pujasera Kanan (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.webp',
    description: 'Bangku kayu menghadap samping kanan.',
  },
  {
    key: 'prop-kursi-side-1',
    name: 'Bangku Pujasera Kiri (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman%20Side-1.webp',
    description: 'Bangku kayu menghadap samping kiri.',
  },
  {
    key: 'prop-tong-sampah',
    name: 'Tong Sampah Publik (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Tong%20Sampah.webp',
    description: 'Tempat sampah ramah lingkungan di samping gerobak kuliner.',
  },
  {
    key: 'vending-blue',
    name: 'Vending Machine Biru (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Blue.webp',
    description: 'Mesin otomatis penjual minuman soda dingin biru.',
  },
  {
    key: 'vending-green',
    name: 'Vending Machine Hijau (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Green.webp',
    description: 'Mesin otomatis penjual teh melati dan air mineral hijau.',
  },
  {
    key: 'vending-red',
    name: 'Vending Machine Merah (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Red.webp',
    description: 'Mesin otomatis penjual kopi dan jus buah segar merah.',
  },
  {
    key: 'vending-yellow',
    name: 'Vending Machine Kuning (1×2)',
    category: 'food',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Vending%20Machine%20Yellow.webp',
    description: 'Mesin otomatis penjual minuman isotonik dan lemon kuning.',
  },
  {
    key: 'prop-taman-rumput',
    name: 'Taman Rumput Rapi (2×1)',
    category: 'nature',
    gw: 2,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.webp',
    description: 'Taman rumput hias tertata rapi kotak 2x1 dengan tabrakan fisik solid.',
  },
  {
    key: 'prop-rumput',
    name: 'Rumput Liar Alami (1×2)',
    category: 'nature',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/World/Assets/1x2%20Rumput.webp',
    description: 'Rerumputan liar bebas collision (dapat diinjak). Menimpa kaki pemain.',
  },
  {
    key: 'prop-pohon-tall',
    name: 'Pohon Tinggi Rindang (1×3)',
    category: 'nature',
    gw: 1,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x3%20Pohon.webp',
    description: 'Pohon rindang besar penyaring polusi udara perkotaan.',
  },
  {
    key: 'prop-pohon-small',
    name: 'Pohon Peneduh Sedang (1×2)',
    category: 'nature',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Pohon.webp',
    description: 'Pohon peneduh pinggir trotoar dan halaman sekolah.',
  },
  {
    key: 'prop-batu',
    name: 'Batu Karang Besar (1×2)',
    category: 'nature',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x2%20Batu.webp',
    description: 'Batuan granit alam kokoh di perbukitan timur.',
  },
  {
    key: 'prop-lampu',
    name: 'Lampu Jalan Boulevard (1×3)',
    category: 'nature',
    gw: 1,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/World/Assets/1x3%20Lampu.webp',
    description: 'Tiang lampu penerang jalan raya bergaya eropa klasik.',
  },
  {
    key: 'school-garuda-presiden',
    name: 'Garuda & Foto Presiden (3×1)',
    category: 'school',
    gw: 3,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/garuda_presiden.webp',
    description: 'Lambang Negara Burung Garuda & Bingkai Foto Kenegaraan.',
  },
  {
    key: 'school-flag',
    name: 'Tiang Bendera Merah Putih (1×2)',
    category: 'school',
    gw: 1,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/flag.webp',
    description: 'Tiang bendera kebangsaan Merah Putih berkibar megah.',
  },
  {
    key: 'school-whiteboard',
    name: 'Papan Tulis Whiteboard (3×1)',
    category: 'school',
    gw: 3,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/whiteboard.webp',
    description: 'Whiteboard ruang kelas untuk materi pelajaran harian.',
  },
  {
    key: 'school-teacher-desk',
    name: 'Meja Podium Guru (2×1)',
    category: 'school',
    gw: 2,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/teacher_desk.webp',
    description: 'Meja kayu podium pengajar dengan taplak batik.',
  },
  {
    key: 'school-teacher-chair',
    name: 'Kursi Eksekutif Guru (1×1)',
    category: 'school',
    gw: 1,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/teacher_chair.webp',
    description: 'Kursi putar empuk pengajar di depan kelas.',
  },
  {
    key: 'school-student-desk',
    name: 'Meja Siswa Kayu (1×1)',
    category: 'school',
    gw: 1,
    gh: 1,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/student_desk.webp',
    description: 'Meja belajar siswa standar nasional Indonesia.',
  },
  {
    key: 'school-student-chair',
    name: 'Kursi Siswa Kayu (1×1)',
    category: 'school',
    gw: 1,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/School/Assets/student_chair.webp',
    description: 'Kursi sandaran kayu jati untuk murid.',
  },
  {
    key: 'school-bookshelf',
    name: 'Lemari Buku Perpustakaan (2×2)',
    category: 'school',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/School/Assets/bookshelf.webp',
    description: 'Rak ensiklopedia, kamus, dan buku literasi kelas.',
  },
  {
    key: 'admin-throne',
    name: 'Tahta Agung Raden (3×3)',
    category: 'admin',
    gw: 3,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/3x3%20Tahta%20Raden.webp',
    description: 'Tahta singgasana emas sang Pencipta RadenWorld.',
  },
  {
    key: 'admin-console-broadcast',
    name: 'Konsol Broadcast Server (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Konsol%20Broadcast.webp',
    description: 'Mainframe siaran pesan pengumuman ke seluruh dunia.',
  },
  {
    key: 'admin-console-database',
    name: 'Konsol Database Pemain (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Konsol%20Database.webp',
    description: 'Server rack sensus data pemain terdaftar di server.',
  },
  {
    key: 'admin-console-godmode',
    name: 'Reaktor Godmode Speed (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Konsol%20Godmode.webp',
    description: 'Reaktor kuantum penambah kecepatan 400 Px/s.',
  },
  {
    key: 'admin-portal-world',
    name: 'Gerbang Portal Open World (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Portal%20World.webp',
    description: 'Stargate kosmis teleportasi ke dunia luar.',
  },
  {
    key: 'admin-portal-house',
    name: 'Gerbang Portal Rumah (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Portal%20House.webp',
    description: 'Gerbang teleportasi langsung ke rumah pribadi.',
  },
  {
    key: 'admin-pillar',
    name: 'Pilar Obelisk Cyber (1×3)',
    category: 'admin',
    gw: 1,
    gh: 3,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/1x3%20Pilar%20Cyber.webp',
    description: 'Kolom pilar heksagonal kristal penyangga energi.',
  },
  {
    key: 'admin-banner',
    name: 'Banner Monogram Emas (1×2)',
    category: 'admin',
    gw: 1,
    gh: 2,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/1x2%20Banner%20Raden.webp',
    description: 'Tapestri dinding kerajaan monogram emas RadenWorld.',
  },
  {
    key: 'admin-holo-globe',
    name: 'Holo-Globe RadenWorld (2×2)',
    category: 'admin',
    gw: 2,
    gh: 2,
    defaultCollision: true,
    imageSrc: '/assets/maps/Admin/Assets/2x2%20Holo%20Globe.webp',
    description: 'Proyektor bola dunia hologram 3D melayang.',
  },
  {
    key: 'admin-carpet-gold',
    name: 'Karpet Sutra Emas (2×1)',
    category: 'admin',
    gw: 2,
    gh: 1,
    defaultCollision: false,
    imageSrc: '/assets/maps/Admin/Assets/2x1%20Karpet%20Emas.webp',
    description: 'Permadani sutra bertepi benang emas di tahta.',
  },
];

const DEFAULT_MAP_CONFIGS: Record<MapTargetType, IMapArchitectConfig> = {
  world: {
    gridWidth: 80,
    gridHeight: 80,
    tileSize: 120,
    customProps: [
      { id: 'def_wb_1', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 36, gy: 33, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.webp' },
      { id: 'def_wb_2', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 43, gy: 33, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.webp' },
      { id: 'def_wb_3', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 36, gy: 47, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.webp' },
      { id: 'def_wb_4', key: 'prop-taman-rumput', name: 'Taman Rumput Rapi (2×1)', gx: 43, gy: 47, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/2x1%20TamanRumput.webp' },
      { id: 'def_wg_1', key: 'prop-rumput', name: 'Rumput Liar Alami (1×2)', gx: 19, gy: 20, gw: 1, gh: 2, isObstacle: false, imageSrc: '/assets/maps/World/Assets/1x2%20Rumput.webp' },
      { id: 'def_wg_2', key: 'prop-rumput', name: 'Rumput Liar Alami (1×2)', gx: 20, gy: 20, gw: 1, gh: 2, isObstacle: false, imageSrc: '/assets/maps/World/Assets/1x2%20Rumput.webp' },
      { id: 'def_wp_1', key: 'prop-pohon-tall', name: 'Pohon Tinggi Rindang (1×3)', gx: 36, gy: 22, gw: 1, gh: 3, isObstacle: true, imageSrc: '/assets/maps/World/Assets/1x3%20Pohon.webp' },
      { id: 'def_wp_2', key: 'prop-pohon-tall', name: 'Pohon Tinggi Rindang (1×3)', gx: 44, gy: 22, gw: 1, gh: 3, isObstacle: true, imageSrc: '/assets/maps/World/Assets/1x3%20Pohon.webp' },
    ],
    customTerrains: [
      { id: 'def_road_v', type: 'road', gx: 39, gy: 18, gw: 3, gh: 42, hasCollision: false },
      { id: 'def_road_h', type: 'road', gx: 17, gy: 44, gw: 46, gh: 2, hasCollision: false },
      { id: 'def_lake_1', type: 'water', gx: 58, gy: 24, gw: 14, gh: 9, hasCollision: true },
      { id: 'def_plaza', type: 'plaza', gx: 33, gy: 33, gw: 15, gh: 15, hasCollision: false },
    ],
  },
  school: {
    gridWidth: 32,
    gridHeight: 18,
    tileSize: 120,
    customProps: [
      { id: 'def_s_garuda', key: 'school-garuda-presiden', name: 'Garuda & Foto Presiden (3×1)', gx: 14.5, gy: 1, gw: 3, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/garuda_presiden.webp' },
      { id: 'def_s_flag', key: 'school-flag', name: 'Tiang Bendera Merah Putih (1×2)', gx: 4, gy: 1, gw: 1, gh: 2, isObstacle: true, imageSrc: '/assets/maps/School/Assets/flag.webp' },
      { id: 'def_s_teacher_d', key: 'school-teacher-desk', name: 'Meja Podium Guru (2×1)', gx: 15, gy: 2.5, gw: 2, gh: 1, isObstacle: true, imageSrc: '/assets/maps/School/Assets/teacher_desk.webp' },
      { id: 'def_s_teacher_c', key: 'school-teacher-chair', name: 'Kursi Eksekutif Guru (1×1)', gx: 15.5, gy: 1.8, gw: 1, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/teacher_chair.webp' },
      { id: 'def_s_desk_1', key: 'school-student-desk', name: 'Meja Siswa Kayu (1×1)', gx: 6, gy: 5, gw: 1, gh: 1, isObstacle: true, imageSrc: '/assets/maps/School/Assets/student_desk.webp' },
      { id: 'def_s_chair_1', key: 'school-student-chair', name: 'Kursi Siswa Kayu (1×1)', gx: 6, gy: 6, gw: 1, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/student_chair.webp' },
      { id: 'def_s_desk_2', key: 'school-student-desk', name: 'Meja Siswa Kayu (1×1)', gx: 10, gy: 5, gw: 1, gh: 1, isObstacle: true, imageSrc: '/assets/maps/School/Assets/student_desk.webp' },
      { id: 'def_s_chair_2', key: 'school-student-chair', name: 'Kursi Siswa Kayu (1×1)', gx: 10, gy: 6, gw: 1, gh: 1, isObstacle: false, imageSrc: '/assets/maps/School/Assets/student_chair.webp' },
    ],
    customTerrains: [],
  },
  house: {
    gridWidth: 32,
    gridHeight: 18,
    tileSize: 120,
    customProps: [
      { id: 'def_h_1', key: 'prop-meja', name: 'Meja Santai Pujasera (1×1)', gx: 15.5, gy: 8, gw: 1, gh: 1, isObstacle: true, imageSrc: '/assets/maps/World/Assets/1x1%20Meja.webp' },
      { id: 'def_h_2', key: 'prop-kursi-front', name: 'Bangku Pujasera Depan (1×2)', gx: 15.5, gy: 9.5, gw: 1, gh: 2, isObstacle: false, imageSrc: '/assets/maps/World/Assets/1x2%20Kursi%20Taman.webp' },
    ],
    customTerrains: [
      { id: 'def_h_wood', type: 'wood', gx: 5, gy: 3, gw: 6, gh: 4, hasCollision: false },
    ],
  },
};

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
  { id: 'farm', name: 'Lahan Pertanian & Kebun', icon: '🌾', minGx: 57, maxGx: 80, minGy: 1, maxGy: 9 },
];

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({ isOpen, onClose }) => {
  const [selectedMap, setSelectedMap] = useState<MapTargetType>('world');
  const [activeSimsTool, setActiveSimsTool] = useState<SimsToolType>('select');

  const [configs, setConfigs] = useState<Record<MapTargetType, IMapArchitectConfig>>(() => {
    const initial: Record<MapTargetType, IMapArchitectConfig> = { ...DEFAULT_MAP_CONFIGS };
    try {
      (['world', 'school', 'house'] as MapTargetType[]).forEach((k) => {
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
  const [currentSectorId, setCurrentSectorId] = useState<string>('full');

  const [showGridLines] = useState<boolean>(true);
  const [showFootprint, setShowFootprint] = useState<boolean>(true);
  const [showCollisionOverlay, setShowCollisionOverlay] = useState<boolean>(true);
  const [showTerrainLayer, setShowTerrainLayer] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<AssetCategoryType>('all');
  const [selectedAssetInHand, setSelectedAssetInHand] = useState<IArchitectAsset | null>(
    ARCHITECT_ASSET_CATALOG[0]
  );
  const [selectedPlacedPropId, setSelectedPlacedPropId] = useState<string | null>(null);

  const [draggingAsset, setDraggingAsset] = useState<IArchitectAsset | null>(null);
  const [, setDraggingPlacedPropId] = useState<string | null>(null);
  const [hoveredGridCell, setHoveredGridCell] = useState<{ gx: number; gy: number } | null>(null);

  const [selectedTerrainBrush, setSelectedTerrainBrush] = useState<TerrainType>('road');
  const [terrainBrushSize, setTerrainBrushSize] = useState<number>(2);
  const [isPaintingTerrain, setIsPaintingTerrain] = useState<boolean>(false);

  const [saveToast, setSaveToast] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

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
    const found = WORLD_SECTORS.find((s) => s.id === currentSectorId);
    return found || WORLD_SECTORS[0];
  }, [selectedMap, currentSectorId, currentConfig.gridWidth, currentConfig.gridHeight]);

  const viewWidthTiles = activeSector.maxGx - activeSector.minGx;
  const viewHeightTiles = activeSector.maxGy - activeSector.minGy;

  const cellPx = useMemo(() => {
    if (selectedMap === 'school') return 36;
    if (selectedMap === 'house') return 44;
    if (activeSector.id === 'full') return 8;
    return 24;
  }, [selectedMap, activeSector.id]);

  const canvasPixelWidth = viewWidthTiles * cellPx;
  const canvasPixelHeight = viewHeightTiles * cellPx;

  const filteredCatalog = useMemo(() => {
    return ARCHITECT_ASSET_CATALOG.filter((item) => {
      const matchCat = activeCategoryTab === 'all' || item.category === activeCategoryTab;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategoryTab, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: ARCHITECT_ASSET_CATALOG.length,
      building: 0,
      food: 0,
      nature: 0,
      school: 0,
      admin: 0,
    };
    ARCHITECT_ASSET_CATALOG.forEach((a) => {
      if (counts[a.category] !== undefined) counts[a.category]++;
    });
    return counts;
  }, []);

  const selectedPlacedProp = useMemo(() => {
    return currentConfig.customProps.find((p) => p.id === selectedPlacedPropId) || null;
  }, [currentConfig.customProps, selectedPlacedPropId]);

  const handleRotateCurrentAsset = useCallback(() => {
    playSimsSound('rotate');
    if (selectedPlacedProp) {
      setConfigs((prev) => ({
        ...prev,
        [selectedMap]: {
          ...prev[selectedMap],
          customProps: prev[selectedMap].customProps.map((p) =>
            p.id === selectedPlacedProp.id ? { ...p, gw: p.gh, gh: p.gw } : p
          ),
        },
      }));
      showToast(
        `🔄 Aset "${selectedPlacedProp.name}" diputar 90° (${selectedPlacedProp.gh}×${selectedPlacedProp.gw} petak)`
      );
      return;
    }
    if (selectedAssetInHand) {
      setSelectedAssetInHand((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          gw: prev.gh,
          gh: prev.gw,
        };
      });
      showToast('🔄 Aset di tangan diputar 90°');
    }
  }, [selectedPlacedProp, selectedAssetInHand, selectedMap]);

  const handleDeleteProp = useCallback(
    (id: string) => {
      playSimsSound('hammer');
      setConfigs((prev) => ({
        ...prev,
        [selectedMap]: {
          ...prev[selectedMap],
          customProps: prev[selectedMap].customProps.filter((p) => p.id !== id),
        },
      }));
      if (selectedPlacedPropId === id) setSelectedPlacedPropId(null);
      showToast('🔨 Aset berhasil dihancurkan!');
    },
    [selectedMap, selectedPlacedPropId]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
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
  }, [isOpen, onClose, handleRotateCurrentAsset, selectedPlacedPropId, handleDeleteProp]);

  const addPropAt = useCallback(
    (gx: number, gy: number, asset: IArchitectAsset) => {
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

      setConfigs((prev) => ({
        ...prev,
        [selectedMap]: {
          ...prev[selectedMap],
          customProps: [newProp, ...prev[selectedMap].customProps],
        },
      }));

      setSelectedPlacedPropId(newProp.id);
      playSimsSound('place');
      showToast(`✓ "${asset.name}" diletakkan di Grid (${clampedGx}, ${clampedGy})`);
    },
    [currentConfig.gridWidth, currentConfig.gridHeight, selectedMap]
  );

  const movePropTo = useCallback(
    (propId: string, newGx: number, newGy: number) => {
      const prop = currentConfig.customProps.find((p) => p.id === propId);
      if (!prop) return;

      const clampedGx = Math.max(0, Math.min(currentConfig.gridWidth - prop.gw, newGx));
      const clampedGy = Math.max(0, Math.min(currentConfig.gridHeight - prop.gh, newGy));

      setConfigs((prev) => ({
        ...prev,
        [selectedMap]: {
          ...prev[selectedMap],
          customProps: prev[selectedMap].customProps.map((p) =>
            p.id === propId ? { ...p, gx: clampedGx, gy: clampedGy } : p
          ),
        },
      }));

      playSimsSound('place');
      showToast(`✓ "${prop.name}" dipindahkan ke Grid (${clampedGx}, ${clampedGy})`);
    },
    [currentConfig.customProps, currentConfig.gridWidth, currentConfig.gridHeight, selectedMap]
  );

  const handleEyedropProp = (prop: IPlacedPropItem) => {
    playSimsSound('click');
    const matched = ARCHITECT_ASSET_CATALOG.find((a) => a.key === prop.key);
    if (matched) {
      setSelectedAssetInHand({
        ...matched,
        gw: prop.gw,
        gh: prop.gh,
      });
      setActiveSimsTool('select');
      showToast(`🧪 Aset "${prop.name}" disalin ke tangan!`);
    }
  };

  const paintTerrainAt = useCallback(
    (gx: number, gy: number) => {
      const size = terrainBrushSize;
      const clampedGx = Math.max(0, Math.min(currentConfig.gridWidth - size, gx));
      const clampedGy = Math.max(0, Math.min(currentConfig.gridHeight - size, gy));

      setConfigs((prev) => {
        const currentTerrains = prev[selectedMap].customTerrains || [];
        const filtered = currentTerrains.filter((t) => {
          const overlapX = t.gx < clampedGx + size && t.gx + t.gw > clampedGx;
          const overlapY = t.gy < clampedGy + size && t.gy + t.gh > clampedGy;
          return !(overlapX && overlapY);
        });

        const brushDef = TERRAIN_BRUSHES.find((b) => b.type === selectedTerrainBrush);
        const newTerrain: ITerrainTileItem = {
          id: `terr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: selectedTerrainBrush,
          gx: clampedGx,
          gy: clampedGy,
          gw: size,
          gh: size,
          hasCollision: brushDef?.hasCollision ?? selectedTerrainBrush === 'water',
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
    },
    [terrainBrushSize, currentConfig.gridWidth, currentConfig.gridHeight, selectedMap, selectedTerrainBrush]
  );

  const eraseTerrainAt = useCallback(
    (gx: number, gy: number) => {
      const size = terrainBrushSize;
      setConfigs((prev) => {
        const currentTerrains = prev[selectedMap].customTerrains || [];
        const filtered = currentTerrains.filter((t) => {
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
    },
    [terrainBrushSize, selectedMap]
  );

  const handleClearAllTerrains = () => {
    if (!confirm(`Hapus seluruh lapisan medan (jalan & danau) di ${selectedMap.toUpperCase()}?`))
      return;
    playSimsSound('hammer');
    setConfigs((prev) => ({
      ...prev,
      [selectedMap]: {
        ...prev[selectedMap],
        customTerrains: [],
      },
    }));
    showToast(`🧹 Seluruh medan ${selectedMap.toUpperCase()} dibersihkan.`);
  };

  const handleSaveConfig = () => {
    try {
      localStorage.setItem(`raden_architect_${selectedMap}`, JSON.stringify(currentConfig));
      EventBus.emit('architect-config-updated', { mapType: selectedMap, config: currentConfig });
      playSimsSound('place');
      showToast(`💾 Arsitektur ${selectedMap.toUpperCase()} Tersimpan & Diterapkan!`);
    } catch (e) {
      showToast('❌ Gagal menyimpan konfigurasi.');
    }
  };

  const handleResetToDefault = () => {
    if (!confirm(`Kembalikan peta ${selectedMap.toUpperCase()} ke kondisi bawaan awal?`)) return;
    playSimsSound('hammer');
    setConfigs((prev) => ({
      ...prev,
      [selectedMap]: JSON.parse(JSON.stringify(DEFAULT_MAP_CONFIGS[selectedMap])),
    }));
    try {
      localStorage.removeItem(`raden_architect_${selectedMap}`);
      EventBus.emit('architect-config-updated', {
        mapType: selectedMap,
        config: DEFAULT_MAP_CONFIGS[selectedMap],
      });
      showToast(`🔄 Peta ${selectedMap.toUpperCase()} Direset ke Bawaan Awal.`);
    } catch (e) {}
  };

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

  const handleCanvasClick = () => {
    if (!hoveredGridCell) return;
    const { gx, gy } = hoveredGridCell;

    if (activeSimsTool === 'hammer') {
      const propToHit = currentConfig.customProps.find(
        (p) => gx >= p.gx && gx < p.gx + p.gw && gy >= p.gy && gy < p.gy + p.gh
      );
      if (propToHit) {
        handleDeleteProp(propToHit.id);
        return;
      }
      eraseTerrainAt(gx, gy);
      return;
    }

    if (activeSimsTool === 'dropper') {
      const propToDrop = currentConfig.customProps.find(
        (p) => gx >= p.gx && gx < p.gx + p.gw && gy >= p.gy && gy < p.gy + p.gh
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
    <div className="ui-modal-backdrop !z-[100] font-pixel select-none overflow-hidden">
      {/* Toast Notifikasi */}
      {saveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 clay-card-secondary text-black font-bold text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-black shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main Studio Window */}
      <div className="w-full h-full max-w-[1720px] max-h-[min(96dvh,960px)] clay-panel landscape-compact-modal flex flex-col overflow-hidden text-black">
        {/* 1. TOP HEADER */}
        <div className="px-3 sm:px-4 py-2 clay-header landscape-compact-header flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 clay-card flex items-center justify-center shrink-0">
              <Sparkle className="w-4 h-4 text-black fill-black" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-wider text-xs sm:text-sm text-black">
                  STUDIO ARSITEK RADEN
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold clay-badge-secondary text-black">
                  BUILD 2D
                </span>
              </div>
              <p className="text-[10px] text-black hidden xl:block">
                Mode Pembangunan 2D Grid • Petak 120px Realtime
              </p>
            </div>
          </div>

          {/* Map Target Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedMap('world');
                setCurrentSectorId('full');
                setSelectedPlacedPropId(null);
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 ${
                selectedMap === 'world'
                  ? 'clay-btn-secondary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>World (80×80)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMap('school');
                setCurrentSectorId('full');
                setSelectedPlacedPropId(null);
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 ${
                selectedMap === 'school'
                  ? 'clay-btn-secondary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Sekolah (18×12)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMap('house');
                setCurrentSectorId('full');
                setSelectedPlacedPropId(null);
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 ${
                selectedMap === 'house'
                  ? 'clay-btn-secondary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Rumah (14×10)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-2.5 py-1 clay-btn-neutral text-black text-[11px] font-bold flex items-center gap-1"
              title="Kembalikan peta ke kondisi awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleTeleportToMap}
              className="px-2.5 py-1 clay-btn-secondary text-black text-[11px] font-bold flex items-center gap-1"
              title="Simpan dan teleportasi langsung ke lokasi"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Uji Langsung</span>
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-3 py-1 clay-btn-cocoa text-white font-bold text-[11px] flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan & Terapkan</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center"
              title="Tutup Studio (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. THE SIMS BUILD TOOLBAR */}
        <div className="px-3 sm:px-4 py-1.5 bg-[#FFF8EA] border-b-2 border-[#5C3A21] flex items-center justify-between gap-2 text-[11px] overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveSimsTool('select');
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 font-bold flex items-center gap-1.5 ${
                activeSimsTool === 'select'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
              title="Pilih dan letakkan aset [V]"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>✋ Tangan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSimsTool('hammer');
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 font-bold flex items-center gap-1.5 ${
                activeSimsTool === 'hammer'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
              title="Palu Hancurkan [H]"
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>🔨 Palu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSimsTool('dropper');
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 font-bold flex items-center gap-1.5 ${
                activeSimsTool === 'dropper'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
              title="Pipet Kloning"
            >
              <Pipette className="w-3.5 h-3.5" />
              <span>🧪 Pipet</span>
            </button>

            <button
              type="button"
              onClick={handleRotateCurrentAsset}
              className="px-2.5 py-1 clay-btn-secondary text-black font-bold flex items-center gap-1.5"
              title="Putar aset 90 derajat [R]"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>🔄 Putar [R]</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSimsTool('terrain');
                setActiveCategoryTab('terrain');
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 font-bold flex items-center gap-1.5 ${
                activeSimsTool === 'terrain'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
              title="Kuas Jalan & Danau"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>🖌️ Kuas Medan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSimsTool('eraser');
                playSimsSound('switch');
              }}
              className={`px-2.5 py-1 font-bold flex items-center gap-1.5 ${
                activeSimsTool === 'eraser'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
              title="Penghapus Medan"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>🧹 Hapus Medan</span>
            </button>
          </div>

          {/* Sektor Navigasi Sims untuk Open World */}
          {selectedMap === 'world' && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-black px-1 font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-black" />
                <span className="hidden lg:inline">SEKTOR:</span>
              </span>
              {WORLD_SECTORS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setCurrentSectorId(sec.id);
                    playSimsSound('switch');
                  }}
                  className={`px-2 py-0.5 font-bold flex items-center gap-1 ${
                    currentSectorId === sec.id
                      ? 'clay-btn-secondary text-black'
                      : 'clay-btn-neutral text-black'
                  }`}
                  title={sec.name}
                >
                  <span>{sec.icon}</span>
                  <span className="hidden 2xl:inline">{sec.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Blueprint Layer Toggles */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-black shrink-0">
            <label className="px-2 py-0.5 clay-badge-neutral flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showFootprint}
                onChange={(e) => setShowFootprint(e.target.checked)}
                className="accent-[#5C3A21]"
              />
              <span>📦 Grid</span>
            </label>

            <label className="px-2 py-0.5 clay-badge-neutral flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showCollisionOverlay}
                onChange={(e) => setShowCollisionOverlay(e.target.checked)}
                className="accent-[#5C3A21]"
              />
              <span>⛔ Solid</span>
            </label>

            <label className="px-2 py-0.5 clay-badge-neutral flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showTerrainLayer}
                onChange={(e) => setShowTerrainLayer(e.target.checked)}
                className="accent-[#5C3A21]"
              />
              <span>🛣️ Medan</span>
            </label>
          </div>
        </div>

        {/* 3. CENTER VIEWPORT: 2D BLUEPRINT DRAFTING BOARD */}
        <div
          className="flex-1 min-h-0 overflow-auto custom-scrollbar relative flex items-center justify-center bg-[#EADBC0] p-2 sm:p-3 select-none"
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
          <div className="sticky lg:absolute top-2 left-2 z-30 flex items-center gap-2 text-[10px] sm:text-[11px] pointer-events-none flex-wrap">
            <div className="px-2.5 py-1 clay-card text-black font-bold flex items-center gap-1.5">
              <span>
                Peta: <strong className="uppercase">{selectedMap}</strong> ({currentConfig.gridWidth}×{currentConfig.gridHeight})
              </span>
            </div>

            {hoveredGridCell ? (
              <div className="px-2.5 py-1 clay-badge-secondary text-black font-bold">
                Grid ({hoveredGridCell.gx}, {hoveredGridCell.gy})
              </div>
            ) : (
              <div className="px-2.5 py-1 clay-badge-neutral text-black font-bold hidden sm:block">
                Ketuk / arahkan ke petak kanvas
              </div>
            )}
          </div>

          {/* PALET UKURAN KUAS JIKA SEDANG MEMILIH KUAS MEDAN */}
          {(activeSimsTool === 'terrain' || activeSimsTool === 'eraser') && (
            <div className="absolute top-2 right-2 z-30 p-1.5 clay-card flex items-center gap-1.5 text-[11px]">
              <span className="text-black font-bold px-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                <span>KUAS:</span>
              </span>
              {[1, 2, 3, 4].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setTerrainBrushSize(sz)}
                  className={`px-2 py-0.5 font-bold ${
                    terrainBrushSize === sz
                      ? 'clay-btn-primary text-black'
                      : 'clay-btn-neutral text-black'
                  }`}
                >
                  {sz}×{sz}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearAllTerrains}
                className="ml-1 px-2 py-0.5 clay-btn-cocoa text-white text-[10px] font-bold"
                title="Hapus seluruh medan"
              >
                Hapus Semua
              </button>
            </div>
          )}

          {/* THE 2D BLUEPRINT CANVAS */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            className={`relative rounded-[10px] border-2 border-[#5C3A21] overflow-hidden select-none shrink-0 m-auto ${
              activeSimsTool === 'hammer'
                ? 'cursor-pointer'
                : activeSimsTool === 'dropper'
                ? 'cursor-copy'
                : 'cursor-crosshair'
            }`}
            style={{
              width: `${canvasPixelWidth}px`,
              height: `${canvasPixelHeight}px`,
              backgroundImage: showGridLines
                ? 'linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)'
                : 'none',
              backgroundSize: `${cellPx}px ${cellPx}px`,
              backgroundColor:
                selectedMap === 'world'
                  ? '#1f5f46'
                  : selectedMap === 'school'
                  ? '#334155'
                  : '#5C3A21',
            }}
          >
            {/* LAYER 1: MEDAN & JALAN */}
            {showTerrainLayer &&
              (currentConfig.customTerrains || []).map((t) => {
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
                const brushInfo = TERRAIN_BRUSHES.find((b) => b.type === t.type);

                return (
                  <div
                    key={t.id}
                    className="absolute border select-none pointer-events-none"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      backgroundColor: brushInfo?.color || '#334155',
                      borderColor: brushInfo?.borderColor || '#5C3A21',
                    }}
                  >
                    {t.type === 'road' && (
                      <div className="w-full h-full border-t border-b border-white/40 border-dashed flex items-center justify-center">
                        <span className="text-[9px] text-white font-bold">🛣️ JALAN</span>
                      </div>
                    )}
                    {t.type === 'water' && (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-[9px] text-white font-bold">🌊 DANAU</span>
                      </div>
                    )}
                    {t.type === 'plaza' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[9px] text-white font-bold">🏛️ PLAZA</span>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* LAYER 2: ASET TERPASANG */}
            {currentConfig.customProps.map((prop) => {
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
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/reposition', prop.id);
                    setDraggingPlacedPropId(prop.id);
                  }}
                  onDragEnd={() => setDraggingPlacedPropId(null)}
                  onClick={(e) => {
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
                  className={`absolute select-none cursor-move rounded-[4px] overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-[#FFAE6D] z-30'
                      : 'border border-[#FFF8EA]/60 z-20'
                  }`}
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  title={`${prop.name} (${prop.gx}, ${prop.gy}) • [${prop.gw}×${prop.gh} Petak]`}
                >
                  {showFootprint && (
                    <div className="absolute inset-0 bg-[#A8E6CF]/20 pointer-events-none z-10 flex flex-col">
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
                            className="border border-white/30 flex items-center justify-center"
                          >
                            <span className="text-[8px] text-white font-bold">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative w-full h-full flex items-center justify-center p-0.5 bg-[#5C3A21]/40">
                    {prop.imageSrc ? (
                      <img
                        src={prop.imageSrc}
                        alt={prop.name}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                    ) : (
                      <Layers className="w-4 h-4 text-white pointer-events-none" />
                    )}
                  </div>

                  {showCollisionOverlay && (
                    <div
                      className={`absolute bottom-0 inset-x-0 text-[7px] font-bold flex items-center justify-center border-t border-[#5C3A21] select-none pointer-events-none z-20 ${
                        prop.isObstacle
                          ? 'bg-[#FFAE6D] text-black'
                          : 'bg-[#A8E6CF] text-black'
                      }`}
                      style={{
                        height: `${Math.min(height, Math.max(12, cellPx))}px`,
                      }}
                    >
                      <span className="truncate px-0.5">
                        {prop.isObstacle ? '⛔ SOLID' : '🚶 TEMBUS'}
                      </span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-0 right-0 z-30 flex items-center gap-0.5 p-0.5 bg-[#FFF8EA] border-b border-l border-[#5C3A21]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotateCurrentAsset();
                        }}
                        className="p-0.5 clay-btn-primary text-black"
                        title="Putar 90° [R]"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEyedropProp(prop);
                        }}
                        className="p-0.5 clay-btn-secondary text-black"
                        title="Salin / Duplikasi"
                      >
                        <Pipette className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProp(prop.id);
                        }}
                        className="p-0.5 clay-btn-cocoa text-white"
                        title="Hancurkan [Del]"
                      >
                        <Hammer className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* LAYER 3: LIVE GHOST FOOTPRINT PREVIEW */}
            {hoveredGridCell &&
              (draggingAsset || (activeSimsTool === 'select' && selectedAssetInHand)) &&
              (() => {
                const activeAsset = draggingAsset || selectedAssetInHand!;
                const ghostLeft = (hoveredGridCell.gx - activeSector.minGx) * cellPx;
                const ghostTop = (hoveredGridCell.gy - activeSector.minGy) * cellPx;
                const ghostWidth = activeAsset.gw * cellPx;
                const ghostHeight = activeAsset.gh * cellPx;

                return (
                  <div
                    className="absolute pointer-events-none z-40 rounded-[4px] overflow-hidden border-2 border-dashed border-[#FFF8EA]"
                    style={{
                      left: `${ghostLeft}px`,
                      top: `${ghostTop}px`,
                      width: `${ghostWidth}px`,
                      height: `${ghostHeight}px`,
                      backgroundColor: 'rgba(168, 230, 207, 0.35)',
                    }}
                  >
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
                          className="border border-white/60 flex items-center justify-center text-[9px] font-bold text-white"
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

            {/* LAYER 4: TERRAIN BRUSH GHOST PREVIEW */}
            {hoveredGridCell &&
              (activeSimsTool === 'terrain' || activeSimsTool === 'eraser') && (
                <div
                  className={`absolute pointer-events-none z-40 border-2 border-dashed ${
                    activeSimsTool === 'eraser'
                      ? 'border-[#FFAE6D] bg-[#FFAE6D]/35'
                      : 'border-[#A8E6CF] bg-[#A8E6CF]/35'
                  }`}
                  style={{
                    left: `${(hoveredGridCell.gx - activeSector.minGx) * cellPx}px`,
                    top: `${(hoveredGridCell.gy - activeSector.minGy) * cellPx}px`,
                    width: `${terrainBrushSize * cellPx}px`,
                    height: `${terrainBrushSize * cellPx}px`,
                  }}
                />
              )}
          </div>
        </div>

        {/* 4. BOTTOM CATALOG DRAWER */}
        <div className="bg-[#FFF8EA] border-t-2 border-[#5C3A21] p-2 sm:p-3 landscape:max-md:p-1.5 flex flex-col gap-1.5 shrink-0 z-20">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('all');
                  playSimsSound('switch');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                  activeCategoryTab === 'all'
                    ? 'clay-btn-primary text-black'
                    : 'clay-btn-neutral text-black'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Semua ({categoryCounts.all})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('building');
                  playSimsSound('switch');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                  activeCategoryTab === 'building'
                    ? 'clay-btn-primary text-black'
                    : 'clay-btn-neutral text-black'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>🏢 Gedung ({categoryCounts.building})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('food');
                  playSimsSound('switch');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                  activeCategoryTab === 'food'
                    ? 'clay-btn-primary text-black'
                    : 'clay-btn-neutral text-black'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>🍲 Kuliner ({categoryCounts.food})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('nature');
                  playSimsSound('switch');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                  activeCategoryTab === 'nature'
                    ? 'clay-btn-primary text-black'
                    : 'clay-btn-neutral text-black'
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>🌿 Alam ({categoryCounts.nature})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('school');
                  playSimsSound('switch');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                  activeCategoryTab === 'school'
                    ? 'clay-btn-primary text-black'
                    : 'clay-btn-neutral text-black'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>🎓 Sekolah ({categoryCounts.school})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('admin');
                  playSimsSound('switch');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                  activeCategoryTab === 'admin'
                    ? 'clay-btn-primary text-black'
                    : 'clay-btn-neutral text-black'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>👑 Admin ({categoryCounts.admin})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('terrain');
                  setActiveSimsTool('terrain');
                  playSimsSound('switch');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 ${
                  activeCategoryTab === 'terrain'
                    ? 'clay-btn-primary text-black'
                    : 'clay-btn-neutral text-black'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>🛣️ Medan</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-48 sm:w-60 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
              <input
                type="text"
                placeholder="Cari aset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full pl-8 pr-2.5 py-1 clay-input text-xs text-black"
              />
            </div>
          </div>

          {/* ASSET CARDS CAROUSEL */}
          {activeCategoryTab !== 'terrain' ? (
            <div className="flex items-center gap-2.5 overflow-x-auto py-1 custom-scrollbar">
              {filteredCatalog.map((asset) => {
                const isSelected = selectedAssetInHand?.key === asset.key;
                return (
                  <div
                    key={asset.key}
                    draggable={true}
                    onDragStart={(e) => {
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
                    className={`shrink-0 w-44 sm:w-48 landscape:max-md:w-40 p-2 landscape:max-md:p-1.5 flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                      isSelected ? 'clay-card-secondary text-black' : 'clay-card text-black'
                    }`}
                    title="Tarik (drag) atau klik untuk meletakkan di kanvas"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 landscape:max-md:w-9 landscape:max-md:h-9 clay-badge-neutral flex items-center justify-center shrink-0 p-1 overflow-hidden">
                        {asset.imageSrc ? (
                          <img
                            src={asset.imageSrc}
                            alt={asset.name}
                            className="max-h-full max-w-full object-contain pointer-events-none"
                          />
                        ) : (
                          <Layers className="w-4 h-4 text-black" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-black truncate">
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-black line-clamp-1 mt-0.5 leading-tight">
                          {asset.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-[#5C3A21] text-[10px] font-bold">
                      <span className="px-1.5 py-0.5 clay-badge-primary text-black">
                        {asset.gw}×{asset.gh} Petak
                      </span>
                      <span className="text-black">
                        {asset.defaultCollision ? '⛔ Solid' : '🚶 Tembus'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 overflow-x-auto py-1 custom-scrollbar">
              {TERRAIN_BRUSHES.map((brush) => {
                const isActive = selectedTerrainBrush === brush.type;
                return (
                  <button
                    key={brush.type}
                    type="button"
                    onClick={() => {
                      setSelectedTerrainBrush(brush.type);
                      setActiveSimsTool('terrain');
                      playSimsSound('click');
                    }}
                    className={`shrink-0 w-52 p-2 text-left flex items-center gap-2.5 ${
                      isActive ? 'clay-btn-primary text-black' : 'clay-btn-neutral text-black'
                    }`}
                  >
                    <span className="text-xl shrink-0">{brush.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-black truncate">{brush.name}</div>
                      <div className="text-[10px] text-black truncate">{brush.description}</div>
                      <div className="mt-0.5 text-[10px] font-bold text-black">
                        {brush.hasCollision ? '⛔ Solid Tabrakan' : '🚶 Bebas Dilewati'}
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
