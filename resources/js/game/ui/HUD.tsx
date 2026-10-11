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
import { Server, MessageSquare, Zap, User, Mic, MicOff, Settings, Globe, ArrowRightLeft, Coins, Gem, Plus } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { VoiceManager } from '../core/VoiceManager';

export const cleanServerCode = (code?: string | null): string => {
  if (!code) return 'Asia 1';
  const upper = code.toUpperCase();
  if (upper.includes('RADEN-ASIA-01') || upper.includes('ASIA-01') || upper === 'ASIA 1') return 'Asia 1';
  if (upper.includes('RADEN-ASIA-02') || upper.includes('ASIA-02') || upper === 'ASIA 2') return 'Asia 2';
  if (upper.includes('RADEN-ID-01') || upper.includes('ID-01') || upper === 'ASIA 3') return 'Asia 3';
  if (upper.includes('RADEN-GLOBAL-01') || upper.includes('GLOBAL-01') || upper === 'ASIA 4') return 'Asia 4';
  if (upper.includes('RADEN-CUSTOM') || upper.includes('CUSTOM')) return 'Custom Host';
  return code.replace(/^RADEN[-_ ]?/i, '').trim() || 'Asia 1';
};

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
  onToggleGuide?: () => void;
  onOpenProfile: () => void;
  onOpenSettings?: () => void;
  onOpenServerModal?: () => void;
  isChatOpen: boolean;
  interactionPrompt?: string | null;
  onTriggerInteraction?: () => void;
  controlMode?: 'pc' | 'mobile';
  gold?: number;
  diamonds?: number;
  onOpenTopUp?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerStats,
  serverCode = 'Asia 1',
  onToggleChat,
  onOpenProfile,
  onOpenSettings,
  onOpenServerModal,
  isChatOpen,
  interactionPrompt,
  onTriggerInteraction,
  controlMode = 'pc',
  gold = 2500,
  diamonds = 50,
  onOpenTopUp,
}) => {
  const sound = SoundManager.getInstance();
  const displayServerCode = cleanServerCode(serverCode);
  const isMobile = controlMode === 'mobile';
  const stats = playerStats || {
    x: 480,
    y: 380,
    gridX: 10,
    gridY: 7,
    name: 'Petualang',
    roomName: 'World',
    level: 1,
  };

  const rawLoc = stats.roomName || '';
  let displayLocation = 'World';
  if (stats.inHouse || rawLoc.includes('RUMAH')) {
    displayLocation = 'Rumah Pribadi';
  } else if (rawLoc.includes('PORTAL')) {
    displayLocation = 'Portal Admin';
  } else {
    displayLocation = 'World';
  }

  const playerLevel = stats.level || 1;
  const gridX = stats.gridX ?? Math.floor(stats.x / 120);
  const gridY = stats.gridY ?? Math.floor(stats.y / 120);

  const isSuperAdmin = stats.role === 'super_admin' || stats.isSuperAdmin || stats.name?.toUpperCase() === 'RADEN';

  const [isMicActive, setIsMicActive] = React.useState(false);

  React.useEffect(() => {
    const voice = VoiceManager.getInstance();
    setIsMicActive(voice.getIsMicEnabled());

    const handleMicState = (data: { isEnabled: boolean }) => {
      setIsMicActive(data.isEnabled);
    };
    EventBus.on('mic-state-changed', handleMicState);
    return () => {
      EventBus.off('mic-state-changed', handleMicState);
    };
  }, []);

  const handleToggleMic = async () => {
    sound.playClick();
    const voice = VoiceManager.getInstance();
    const state = await voice.toggleMic();
    setIsMicActive(state);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 md:p-5 font-['Chakra_Petch']">
      {/* ==================================================================== */}
      {/* 1. TOP BAR: KIRI ATAS (PROFILE & CHAT) | KANAN ATAS (SERVER STATUS)  */}
      {/* ==================================================================== */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* KIRI ATAS: Group Profile & Quick Action (H-10, Rounded-md, Flat Pure Black) */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Tombol Profil Karakter: H-10, Rounded-md */}
          <button
            onClick={onOpenProfile}
            className={`h-10 flex items-center gap-2.5 px-3 rounded-md bg-black border ${
              isSuperAdmin ? 'border-amber-400' : 'border-neutral-800'
            } hover:border-amber-400 transition-colors cursor-pointer group text-left`}
            title={isSuperAdmin ? '👑 Profil Super Admin (RADEN)' : 'Klik untuk membuka Profil Karakter'}
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              isSuperAdmin ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-amber-400'
            }`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-neutral-100 group-hover:text-amber-400 transition-colors uppercase tracking-wider truncate max-w-[120px]">
                  {stats.name}
                </span>
                {isSuperAdmin && (
                  <span className="text-[9px] font-black tracking-wider text-black bg-amber-400 px-1 py-0.5 rounded leading-none">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-bold tracking-widest text-neutral-400">
                  LV. {playerLevel}
                </span>
              </div>
            </div>
          </button>

          {/* Icon Chat Button (H-10 W-10, Rounded-md) */}
          <button
            onClick={onToggleChat}
            className={`h-10 w-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
              isChatOpen
                ? 'bg-amber-400 text-black border-amber-400 font-bold'
                : 'bg-black text-neutral-300 border-neutral-800 hover:border-amber-400 hover:text-amber-400'
            }`}
            title={isChatOpen ? 'Tutup Obrolan' : 'Buka Obrolan (atau tekan tombol "/")'}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Tombol Mikrofon Proximity Voice Chat (H-10 W-10, Rounded-md) */}
          <button
            onClick={handleToggleMic}
            className={`h-10 w-10 rounded-md border flex items-center justify-center relative transition-colors cursor-pointer ${
              isMicActive
                ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
            }`}
            title={
              isMicActive
                ? 'Mikrofon Aktif (Klik untuk Mematikan) - Jangkauan Suara ±5 Petak'
                : 'Nyalakan Mikrofon (Proximity Voice Chat Radius ±5 Petak X & Y)'
            }
          >
            {isMicActive ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
            {isMicActive && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* KANAN ATAS: KOIN, BERLIAN (TOP UP), STATUS SERVER & PENGATURAN */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap justify-end">
          {/* KOIN EMAS (Bisa Diperoleh Dari Aktivitas) */}
          <div
            className="h-10 flex items-center gap-1.5 px-3 rounded-md bg-black border border-neutral-800 text-amber-400 select-none shadow-sm"
            title="Koin Emas (Bisa diperoleh dari jelajah, quest & aktivitas)"
          >
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[8px] text-neutral-400 uppercase font-semibold">KOIN</span>
              <span className="text-xs font-black font-mono tracking-wider text-amber-300 mt-0.5">
                {gold.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* BERLIAN (DAPAT MELALUI TOP UP) */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenTopUp?.();
            }}
            className="h-10 flex items-center gap-1.5 pl-2.5 pr-1.5 rounded-md bg-black border border-neutral-800 text-cyan-400 select-none shadow-sm group hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Berlian (Klik untuk Top Up)"
          >
            <Gem className="w-4 h-4 text-cyan-400 fill-cyan-400/20 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[8px] text-neutral-400 uppercase font-semibold">BERLIAN</span>
              <span className="text-xs font-black font-mono tracking-wider text-cyan-300 mt-0.5">
                {diamonds.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenTopUp?.();
              }}
              className="h-7 px-2 rounded bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black text-[10px] tracking-wider uppercase flex items-center gap-1 ml-1 cursor-pointer transition-all shadow-sm active:scale-95"
              title="Top Up Berlian"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>TOPUP</span>
            </button>
          </div>

          {/* Tombol Status Server Flat & Bersih: Format Singkat "Asia (angka)" (H-10, Rounded-md) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenServerModal?.();
            }}
            className="h-10 flex items-center gap-2 px-3 rounded-md bg-black border border-neutral-800 hover:border-amber-400 text-neutral-200 transition-colors cursor-pointer group"
            title="Klik untuk Melihat Daftar Server & Pindah Realm"
          >
            {/* Indikator Titik Hijau Emerald Bersih Tanpa Glow */}
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />

            {/* Nama Singkat Server: Asia 1, Asia 2, dst. (Tanpa Kata Raden) */}
            <Globe className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold">
                SERVER
              </span>
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-mono mt-0.5">
                {displayServerCode}
              </span>
            </div>

            {/* Badge Aksi Pindah */}
            <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-black bg-amber-400 group-hover:bg-amber-300 px-1.5 py-0.5 rounded transition-colors ml-1">
              <ArrowRightLeft className="w-2.5 h-2.5" />
              <span>PINDAH</span>
            </div>
          </button>

          {/* Tombol Pengaturan (H-10 W-10, Rounded-md) */}
          {onOpenSettings && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="h-10 w-10 rounded-md bg-black border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-400 flex items-center justify-center transition-colors cursor-pointer"
              title="Pengaturan Game & Konfigurasi IP Server"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. BOTTOM BAR: KIRI BAWAH (KONTROL PC) & KANAN BAWAH (WORLD & KOORDINAT) */}
      {/* ==================================================================== */}
      <div className="flex items-end justify-between w-full pointer-events-none">
        {/* KIRI BAWAH: Tombol Aksi & Keterangan Shortcut PC (Disembunyikan jika Mobile) */}
        <div className="pointer-events-auto flex flex-col items-start gap-2 select-none">
          {/* Tombol Interaksi Cepat (HANYA MUNCUL DI MODE PC) */}
          {!isMobile && interactionPrompt && (
            <button
              onClick={onTriggerInteraction}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 text-black border border-amber-400 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 active:scale-95 cursor-pointer transition-all shadow-md shadow-amber-500/25"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{interactionPrompt}</span>
            </button>
          )}

          {/* Keterangan Kontrol PC / Laptop: Selalu Terlihat di Mode PC */}
          {!isMobile && (
            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-black/85 border border-neutral-800 text-[11px] font-bold text-neutral-300 tracking-wider shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">WASD / Panah</span>
                <span>Jalan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">E</span>
                <span>Interaksi / Bicara</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">/</span>
                <span>Buka Obrolan</span>
              </div>
            </div>
          )}
        </div>

        {/* KANAN BAWAH: Nama Tempat (World) & Koordinat (x,y) Bersih Tanpa Drop-Shadow */}
        <div className="pointer-events-auto flex flex-col items-end text-right select-none">
          <div className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
            {displayLocation}
          </div>
          <div className="text-xs font-mono font-bold text-amber-300 tracking-wide">
            ({gridX}, {gridY})
          </div>
        </div>
      </div>
    </div>
  );
};
