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
import { IAvatarCustomization, Direction } from '../types';
import { Server, MessageSquare, Zap, User, Mic, MicOff, Settings, Globe, ArrowRightLeft, Coins, Gem, Plus, Sun, Moon, Sunset, ZoomIn, ZoomOut, RotateCcw, Map, MapPin, Compass, Maximize2, ChevronDown, ChevronUp, X, Navigation, Building2 } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { VoiceManager } from '../core/VoiceManager';
import { WorldMapSvg } from './WorldMapSvg';

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
    direction?: Direction;
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
  if (stats.inHouse) {
    displayLocation = 'Rumah Pribadi';
  } else if (rawLoc.includes('PORTAL')) {
    displayLocation = 'Portal Admin';
  } else if (rawLoc.includes('GEDUNG SD') || rawLoc.includes('SD:')) {
    displayLocation = 'Gedung SD';
  } else if (rawLoc.includes('GEDUNG SMP') || rawLoc.includes('SMP:')) {
    displayLocation = 'Gedung SMP';
  } else if (rawLoc.includes('GEDUNG SMA') || rawLoc.includes('SMA:')) {
    displayLocation = 'Gedung SMA';
  } else if (rawLoc && rawLoc !== 'RADENWORLD OPEN REALMS') {
    displayLocation = rawLoc;
  } else {
    displayLocation = 'World';
  }

  const playerLevel = stats.level || 1;
  const gridX = stats.gridX ?? Math.floor(stats.x / 120);
  const gridY = stats.gridY ?? Math.floor(stats.y / 120);

  const isSuperAdmin = stats.role === 'super_admin' || stats.isSuperAdmin || stats.name?.toUpperCase() === 'RADEN';

  const [isMicActive, setIsMicActive] = React.useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = React.useState(true);
  const [isFullMapOpen, setIsFullMapOpen] = React.useState(false);

  // Realtime Clock State
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Menentukan siklus waktu (Pagi, Siang, Sore, Malam)
  let timePeriod = 'Malam';
  let PeriodIcon = Moon;
  let periodColor = 'text-sky-300';
  let periodBg = 'bg-sky-500/10 border-sky-500/30';

  if (hours >= 5 && hours < 11) {
    timePeriod = 'Pagi';
    PeriodIcon = Sun;
    periodColor = 'text-amber-400';
    periodBg = 'bg-amber-500/10 border-amber-500/30';
  } else if (hours >= 11 && hours < 15) {
    timePeriod = 'Siang';
    PeriodIcon = Sun;
    periodColor = 'text-yellow-400';
    periodBg = 'bg-yellow-500/10 border-yellow-500/30';
  } else if (hours >= 15 && hours < 18) {
    timePeriod = 'Sore';
    PeriodIcon = Sunset;
    periodColor = 'text-orange-400';
    periodBg = 'bg-orange-500/10 border-orange-500/30';
  } else {
    timePeriod = 'Malam';
    PeriodIcon = Moon;
    periodColor = 'text-sky-300';
    periodBg = 'bg-sky-500/10 border-sky-500/30';
  }

  // Nama hari dan tanggal Indonesia
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const dateString = `${days[currentTime.getDay()]}, ${currentTime.getDate()} ${months[currentTime.getMonth()]}`;

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
      {/* 1. TOP BAR: KIRI (PROFIL & CHAT) | TENGAH (UI JAM) | KANAN (SERVER) */}
      {/* ==================================================================== */}
      <div className="flex items-start justify-between gap-2 md:gap-4 w-full">
        {/* KIRI ATAS: Group Profile, Quick Action & UI Jam Tanpa Background di Bawahnya */}
        <div className="flex flex-col items-start gap-1.5 shrink-0">
          <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
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

          {/* WIDGET UI JAM DIGITAL REALTIME (DI BAWAH PROFILE & 100% TANPA BACKGROUND) */}
          <div
            className="pointer-events-auto flex items-center gap-2 select-none pl-1 pt-0.5 text-left"
            title={`Waktu RadenWorld: ${timePeriod} (${dateString}) - ${timeString} WIB`}
          >
            {/* Icon Siklus Waktu Dinamis (Matahari / Bulan / Sore) */}
            <div className={`flex items-center justify-center ${periodColor} drop-shadow-[0_0_6px_currentColor]`}>
              <PeriodIcon className="w-4 h-4 animate-pulse" />
            </div>

            <div className="flex flex-col leading-none">
              {/* Jam Digital Realtime & Status Waktu */}
              <div className="flex items-baseline gap-1.5 font-mono font-black text-sm tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">{timeString}</span>
                <span className={`text-[9px] font-black tracking-widest uppercase ${periodColor} font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,1)]`}>
                  {timePeriod}
                </span>
              </div>

              {/* Tanggal & WIB */}
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-300 drop-shadow-[0_1px_3px_rgba(0,0,0,1)] mt-0.5">
                <span className="tracking-wide">{dateString}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-amber-400 font-bold tracking-wider">WIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* KANAN ATAS: CONTAINER UANG, SERVER, SETTINGS, & PETA DUNIA (MINIMAP) */}
        <div className="flex flex-col items-end gap-2 pointer-events-none select-none">
          {/* BARIS ATAS: Koin, Berlian, Status Server, & Pengaturan */}
          <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap justify-end shrink-0">
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <Globe className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold">
                  SERVER
                </span>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-mono mt-0.5">
                  {displayServerCode}
                </span>
              </div>
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

          {/* BARIS KEDUA: UI PETA / MINIMAP RADAR DI BAWAH SERVER & PENGATURAN */}
          {!stats.inHouse && (
            <div className="pointer-events-auto flex flex-col items-end">
              {/* Header Peta Mini */}
              <div className="flex items-center justify-between w-[184px] px-2 py-1 bg-black/90 border border-neutral-800 rounded-t-lg backdrop-blur-md text-[10px] font-bold text-neutral-300 shadow-md">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Map className="w-3 h-3 text-amber-400" />
                  <span className="font-mono tracking-wider font-bold">PETA DUNIA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1 py-0.2 rounded border border-neutral-800">
                    {gridX},{gridY}
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsMinimapOpen(!isMinimapOpen);
                    }}
                    className="text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer p-0.5"
                    title={isMinimapOpen ? "Sembunyikan Peta" : "Tampilkan Peta"}
                  >
                    {isMinimapOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsFullMapOpen(true);
                    }}
                    className="text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer p-0.5 ml-0.5"
                    title="Perbesar Peta Penuh"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Bodi Peta Mini 80x80 */}
              {isMinimapOpen && (
                <div
                  onClick={() => {
                    sound.playClick();
                    setIsFullMapOpen(true);
                  }}
                  className="w-[184px] h-[184px] bg-[#001026] border-x border-b border-neutral-800 rounded-b-lg p-1 relative overflow-hidden shadow-2xl backdrop-blur-md cursor-pointer group hover:border-amber-500/50 transition-colors"
                  title="Klik untuk membuka Peta Penuh & Panduan Wilayah"
                >
                  {/* Peta Mini WorldMapSvg Presisi & Kaya Visual Mirip Dunia Asli */}
                  <WorldMapSvg
                    playerGridX={gridX}
                    playerGridY={gridY}
                    playerDirection={stats?.direction || 'down'}
                    isMini={true}
                    className="w-full h-full rounded"
                  />

                  {/* Petunjuk Kompas Mata Angin (U, T, S, B) */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black font-mono text-amber-300/90 pointer-events-none drop-shadow">
                    U
                  </div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                    S
                  </div>
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                    B
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                    T
                  </div>

                  {/* Efek Garis Radar Scanline */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/5 to-transparent pointer-events-none animate-pulse" />
                </div>
              )}
            </div>
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
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">SPASI</span>
                <span>Lompat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">F</span>
                <span>Mancing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">B</span>
                <span>Buka Tas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">1 - 6</span>
                <span>Slot Hotbar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-[10px]">/</span>
                <span>Buka Obrolan</span>
              </div>
            </div>
          )}
        </div>

        {/* KANAN BAWAH: ZOOM IN / ZOOM OUT & Nama Tempat & Koordinat */}
        <div className="pointer-events-auto flex flex-col items-end text-right select-none gap-2">
          {/* FLOATING CAMERA ZOOM IN / ZOOM OUT CONTROLS */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-black/85 border border-neutral-800 backdrop-blur-sm shadow-md">
            <button
              onClick={() => {
                sound.playClick();
                EventBus.emit('camera-zoom-out');
              }}
              title="Zoom Out (-)"
              className="w-8 h-8 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-bold text-base flex items-center justify-center hover:bg-neutral-800 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                EventBus.emit('camera-zoom-reset');
              }}
              title="Reset Zoom Normal (100%)"
              className="px-2 h-8 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono font-bold text-[11px] flex items-center gap-1 justify-center hover:bg-neutral-800 hover:text-amber-300 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>100%</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                EventBus.emit('camera-zoom-in');
              }}
              title="Zoom In (+)"
              className="w-8 h-8 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-bold text-base flex items-center justify-center hover:bg-neutral-800 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>{displayLocation}</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {stats.inHouse ? '14×10' : rawLoc.includes('PORTAL') ? '20×15' : (rawLoc.includes('GEDUNG') && !rawLoc.includes('KOMPLEKS')) ? '18×12' : '80×80'}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-amber-300 tracking-wide flex items-center gap-1.5 mt-0.5">
            <span>Grid: ({gridX}, {gridY})</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400 text-[10px]">
              {stats.inHouse ? 'Rumah 14×10' : rawLoc.includes('PORTAL') ? 'Portal 20×15' : (rawLoc.includes('GEDUNG') && !rawLoc.includes('KOMPLEKS')) ? 'Kelas 18×12' : 'Peta 80×80 Petak'}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MODAL ATLAS DUNIA LENGKAP (FULL MAP MODAL 80x80) */}
      {/* ==================================================================== */}
      {isFullMapOpen && !stats.inHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm tracking-wider text-white">ATLAS DUNIA RADENWORLD</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  80 × 80 PETAK
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-300 bg-black/60 px-2 py-1 rounded border border-neutral-800">
                  POSISI: ({gridX}, {gridY})
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsFullMapOpen(false);
                  }}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Peta"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Konten Peta Besar */}
            <div className="p-4 flex flex-col items-center gap-3">
              <div className="w-[340px] h-[340px] md:w-[440px] md:h-[440px] bg-[#001026] border border-neutral-800 rounded-xl relative overflow-hidden shadow-2xl">
                {/* SVG Peta WorldMapSvg Representasi Visual Dunia Asli Lengkap */}
                <WorldMapSvg
                  playerGridX={gridX}
                  playerGridY={gridY}
                  playerDirection={stats?.direction || 'down'}
                  isMini={false}
                  className="w-full h-full rounded"
                />

                {/* Kompas */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono text-amber-300 pointer-events-none drop-shadow">
                  U (UTARA)
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                  S (SELATAN)
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                  B
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                  T
                </div>
              </div>

              {/* Legenda Peta Bersih & Minimalis */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-[11px] text-neutral-300 font-semibold px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#15803d]" />
                  <span>Padang Rumput</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#1e293b]" />
                  <span>Jalan Protokol</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#374151]" />
                  <span>Central Plaza</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#00A2F3]" />
                  <span>Lautan Timur</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#84cc16]" />
                  <span>Kawasan Sawah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#e2e8f0]" />
                  <span>Dermaga 1 - 3</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#eab308]" />
                  <span>Pantai Pasir</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-amber-300 font-bold">Posisi Kamu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
