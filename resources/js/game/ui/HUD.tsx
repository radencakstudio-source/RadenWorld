/**
 * ============================================================================
 * FILE: resources/js/game/ui/HUD.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Heads-Up Display (HUD) mengambang di atas canvas permainan RadenWorld.
 * 
 * ATURAN & SPESIFIKASI TERBARU:
 * 1. UI Kiri Atas:
 *    - Tombol Profile (menggantikan gender) yang saat ditekan membuka pop-up karakter.
 *    - Menampilkan Nama Karakter & Level.
 *    - Icon Chat button di sampingnya untuk membuka/menutup pop-up chat.
 * 2. UI Kiri Bawah Pojok:
 *    - Nama Tempat/Wilayah.
 *    - Koordinat Grid: "POSISI GRID: (X: ..., Y: ...)" berdasarkan petak catur (tanpa koordinat pixel).
 *    - Tombol aksi interaksi [E] dinamis.
 * 3. Kanan Atas:
 *    - Menampilkan Kode Server Aktif (SERVER: RADEN-ASIA-01) & tombol panduan.
 * 4. Skema 2 Warna Ketat: Obsidian Gelap (#0a0f1d) & Amber Emas (#f59e0b).
 * ============================================================================
 */

import React from 'react';
import { IAvatarCustomization } from '../types';
import { MapPin, Server, MessageSquare, HelpCircle, Zap, User } from 'lucide-react';

interface HUDProps {
  playerStats: {
    x: number;
    y: number;
    gridX?: number;
    gridY?: number;
    name: string;
    avatar?: IAvatarCustomization;
    roomName?: string;
    inHouse?: boolean;
    level?: number;
    role?: string;
    isSuperAdmin?: boolean;
  } | null;
  serverCode?: string;
  onToggleChat: () => void;
  onToggleGuide: () => void;
  onOpenProfile: () => void;
  isChatOpen: boolean;
  interactionPrompt?: string | null;
  onTriggerInteraction?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerStats,
  serverCode = 'RADEN-ASIA-01',
  onToggleChat,
  onToggleGuide,
  onOpenProfile,
  isChatOpen,
  interactionPrompt,
  onTriggerInteraction,
}) => {
  const stats = playerStats || {
    x: 480,
    y: 380,
    gridX: 10,
    gridY: 7,
    name: 'Petualang',
    roomName: 'RUMAH PRIBADI: RUANG UTAMA',
    level: 1,
  };

  const locationLabel = stats.roomName || 'SANCTUARY PLAZA: PUSAT KOTA';
  const playerLevel = stats.level || 1;
  const gridX = stats.gridX ?? Math.floor(stats.x / 48);
  const gridY = stats.gridY ?? Math.floor(stats.y / 48);

  const isSuperAdmin = stats.role === 'super_admin' || stats.isSuperAdmin || stats.name?.toUpperCase() === 'RADEN';

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 md:p-5 font-['Chakra_Petch']">
      {/* ==================================================================== */}
      {/* 1. TOP BAR: KIRI ATAS (PROFILE | NAMA & LEVEL | ICON CHAT) | KANAN   */}
      {/* ==================================================================== */}
      <div className="flex items-start justify-between gap-4 w-full">
        {/* KIRI ATAS: Profile Button, Nama & Level, serta Icon Chat */}
        <div className={`pointer-events-auto flex items-center gap-2 bg-[#0a0f1d]/95 backdrop-blur-md border ${isSuperAdmin ? 'border-amber-400 shadow-amber-500/20' : 'border-amber-500/40'} p-2 rounded-2xl shadow-xl`}>
          {/* Tombol Profil (Menggantikan Gender -> Menampilkan Pop-Up Karakter) */}
          <button
            onClick={onOpenProfile}
            className={`w-9 h-9 rounded-xl border ${isSuperAdmin ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-amber-500 bg-[#0a0f1d] text-amber-400'} hover:bg-amber-500 hover:text-[#0a0f1d] flex items-center justify-center shrink-0 transition-all cursor-pointer shadow group`}
            title={isSuperAdmin ? '👑 Profil Super Admin (RADEN)' : 'Klik untuk membuka Profil Karakter'}
          >
            <User className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Nama Karakter dan Level */}
          <div className="flex flex-col px-1 min-w-[90px]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-amber-400 uppercase tracking-wider truncate max-w-[130px]">
                {stats.name}
              </span>
              {isSuperAdmin && (
                <span className="text-[9px] font-black tracking-wider text-[#0a0f1d] bg-amber-400 px-1 py-0.2 rounded shadow animate-pulse">
                  👑 ADMIN
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold tracking-widest text-[#0a0f1d] bg-amber-500 px-1.5 py-0.2 rounded">
                LV. {playerLevel}
              </span>
              {isSuperAdmin && (
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  SUPER ADMIN
                </span>
              )}
            </div>
          </div>

          {/* Garis Pembatas Vertikal */}
          <div className="h-6 w-px bg-amber-500/30 mx-0.5" />

          {/* Icon Chat Button (Membuka / Menutup Pop-Up Obrolan) */}
          <button
            onClick={onToggleChat}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isChatOpen
                ? 'bg-amber-500 text-[#0a0f1d] border-amber-400 font-bold shadow-md'
                : 'bg-[#0a0f1d] text-amber-400 border-amber-500/40 hover:border-amber-400 hover:bg-amber-500 hover:text-[#0a0f1d]'
            }`}
            title={isChatOpen ? 'Tutup Obrolan' : 'Buka Obrolan'}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        {/* KANAN ATAS: Status Server & Panduan Kontrol */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Indikator Nama / Kode Server Game */}
          <div className="flex items-center gap-2 bg-[#0a0f1d]/95 backdrop-blur-md border border-amber-500/40 px-4 py-2 rounded-xl shadow-xl text-xs font-bold text-amber-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>SERVER: {serverCode}</span>
          </div>

          {/* Tombol Panduan Kontrol */}
          <button
            onClick={onToggleGuide}
            className="p-2 rounded-xl bg-[#0a0f1d]/95 border border-amber-500/40 text-amber-400 hover:border-amber-400 hover:bg-amber-500 hover:text-[#0a0f1d] backdrop-blur-md shadow-xl transition-all cursor-pointer"
            title="Panduan Kontrol"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. BOTTOM BAR: KIRI BAWAH POJOK (NAMA TEMPAT & KOORDINAT GRID X, Y)  */}
      {/* ==================================================================== */}
      <div className="flex items-end justify-between w-full">
        {/* KIRI BAWAH POJOK: Lokasi Tempat, Koordinat Grid, & Tombol Aksi */}
        <div className="pointer-events-auto flex flex-col items-start gap-2">
          {/* Tombol Interaksi Cepat (Jika dekat pintu, lemari, kasur, dsb.) */}
          {interactionPrompt && (
            <button
              onClick={onTriggerInteraction}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-[#0a0f1d] border border-amber-400 shadow-2xl font-bold text-xs uppercase tracking-wider hover:bg-amber-400 cursor-pointer transition-all animate-bounce"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{interactionPrompt}</span>
            </button>
          )}

          {/* Card Lokasi & Koordinat Grid (X, Y) di Kiri Bawah */}
          <div className="bg-[#0a0f1d]/95 backdrop-blur-md border border-amber-500/40 px-4 py-2.5 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[220px]">
            {/* Nama Tempat */}
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>

            {/* Koordinat Grid Berdasarkan Petak Catur */}
            <div className="text-xs text-amber-300 font-mono tracking-wider font-bold">
              POSISI GRID: <span className="text-amber-400 font-extrabold">(X: {gridX}, Y: {gridY})</span>
            </div>
          </div>
        </div>

        {/* Petunjuk Tombol Ringkas di Tengah / Kanan Bawah */}
        <div className="hidden md:flex bg-[#0a0f1d]/90 backdrop-blur-sm border border-amber-500/30 text-amber-400 text-[11px] px-3.5 py-1.5 rounded-full items-center gap-2 uppercase tracking-wider">
          <span>JALAN: <strong className="text-amber-300">WASD</strong> / <strong className="text-amber-300">PANAH</strong></span>
          <span>•</span>
          <span>INTERAKSI: <strong className="text-amber-300">[E]</strong></span>
          <span>•</span>
          <span>CHAT: <strong className="text-amber-300">ENTER</strong></span>
        </div>
      </div>
    </div>
  );
};
