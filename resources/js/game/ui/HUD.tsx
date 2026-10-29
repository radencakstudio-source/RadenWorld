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
import { IAvatarCustomization, Direction, IPlayerData } from '../types';
import { Server, MessageSquare, Zap, User, Users, Info, Mic, MicOff, Settings, Globe, ArrowRightLeft, Coins, Gem, Plus, Sun, Moon, Sunset, Map, MapPin, Compass, Maximize2, Minimize2, ChevronDown, ChevronUp, X, Navigation, Building2, ZoomIn, ZoomOut, RotateCcw, Grid, Trash2, BookOpen } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { VoiceManager } from '../core/VoiceManager';
import { NetworkManager } from '../core/NetworkManager';
import { WorldMapSvg, IMapMarker } from './WorldMapSvg';
import { ServerUsersModal } from './ServerUsersModal';

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
  friendsList?: string[];
  onInspectPlayer?: (player: IPlayerData) => void;
  onAddFriend?: (targetId: string, targetName: string) => void;
}

export const HUD: React.FC<HUDProps> = React.memo(({
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
  friendsList = [],
  onInspectPlayer,
  onAddFriend,
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
  const isUserAdmin = Boolean(stats.role === 'admin' || stats.role === 'super_admin' || stats.isSuperAdmin || stats.name?.toUpperCase() === 'RADEN');

  const [isMicActive, setIsMicActive] = React.useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = React.useState(true);
  const [isFullMapOpen, setIsFullMapOpen] = React.useState(false);

  // Status Jumlah Pemain & Modal List User di Server (Max 50)
  const [serverPlayerCount, setServerPlayerCount] = React.useState<number>(1);
  const [serverPlayers, setServerPlayers] = React.useState<IPlayerData[]>([]);
  const [isServerUsersModalOpen, setIsServerUsersModalOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    EventBus.emit('full-map-toggled', isFullMapOpen);
  }, [isFullMapOpen]);

  React.useEffect(() => {
    const handleCount = (count: number) => {
      setServerPlayerCount(count);
    };
    const handlePlayers = (list: IPlayerData[]) => {
      setServerPlayers(list);
      if (list && list.length > 0) {
        setServerPlayerCount(list.length);
      }
    };

    EventBus.on('player-count-updated', handleCount);
    EventBus.on('server-players-updated', handlePlayers);

    try {
      const net = NetworkManager.getInstance();
      const currentList = net.getServerPlayers();
      if (currentList && currentList.length > 0) {
        setServerPlayers(currentList);
        setServerPlayerCount(currentList.length);
      }
    } catch (e) {}

    return () => {
      EventBus.off('player-count-updated', handleCount);
      EventBus.off('server-players-updated', handlePlayers);
    };
  }, []);

  // Custom Waypoint Marker State (Disimpan di localStorage)
  const [customMarker, setCustomMarker] = React.useState<IMapMarker | null>(() => {
    try {
      const saved = localStorage.getItem('raden_custom_waypoint');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Atlas Full Map Zoom & Pan State
  const [mapZoom, setMapZoom] = React.useState<number>(1);
  const [mapPan, setMapPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = React.useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPanPos, setInitialPanPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = React.useState<boolean>(false);
  const [showGridOverlay, setShowGridOverlay] = React.useState<boolean>(true);

  const handleSetMarker = (gx: number, gy: number) => {
    if (hasMovedDuringDrag) return;
    sound.playClick();
    if (customMarker && customMarker.x === gx && customMarker.y === gy) {
      setCustomMarker(null);
      try { localStorage.removeItem('raden_custom_waypoint'); } catch (e) {}
    } else {
      const marker: IMapMarker = { x: gx, y: gy };
      setCustomMarker(marker);
      try { localStorage.setItem('raden_custom_waypoint', JSON.stringify(marker)); } catch (e) {}
    }
  };

  const handleClearMarker = () => {
    sound.playClick();
    setCustomMarker(null);
    try { localStorage.removeItem('raden_custom_waypoint'); } catch (e) {}
  };

  const handleZoomIn = () => {
    sound.playClick();
    setMapZoom(z => Math.min(4, Number((z + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    sound.playClick();
    setMapZoom(z => {
      const next = Math.max(1, Number((z - 0.5).toFixed(1)));
      if (next === 1) setMapPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    sound.playClick();
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialPanPos({ ...mapPan });
    setHasMovedDuringDrag(false);
    setIsDraggingMap(true);
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMap) return;
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    if (!hasMovedDuringDrag && Math.hypot(dx, dy) > 4) {
      setHasMovedDuringDrag(true);
    }
    if (mapZoom > 1) {
      const maxPan = ((mapZoom - 1) * 220) + 40;
      const newX = Math.max(-maxPan, Math.min(maxPan, initialPanPos.x + dx));
      const newY = Math.max(-maxPan, Math.min(maxPan, initialPanPos.y + dy));
      setMapPan({ x: newX, y: newY });
    }
  };

  const handleMapMouseUp = () => {
    setIsDraggingMap(false);
  };

  const handleMapWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setMapZoom(z => Math.min(4, Number((z + 0.25).toFixed(2))));
    } else {
      setMapZoom(z => {
        const next = Math.max(1, Number((z - 0.25).toFixed(2)));
        if (next === 1) setMapPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

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

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    sound.playClick();
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        const docEl = document.documentElement as any;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (e) {}
  };

  const handleToggleMic = async () => {
    sound.playClick();
    const voice = VoiceManager.getInstance();
    const state = await voice.toggleMic();
    setIsMicActive(state);
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between font-['Chakra_Petch']"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0.5rem))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0.5rem))',
      }}
    >
      {/* ==================================================================== */}
      {/* 1. TOP BAR: KIRI (PROFIL & CHAT) | TENGAH (UI JAM) | KANAN (SERVER) */}
      {/* ==================================================================== */}
      <div className="flex items-start justify-between gap-1.5 sm:gap-2 md:gap-4 w-full">
        {/* KIRI ATAS: Group Profile, Quick Action & UI Jam Tanpa Background di Bawahnya */}
        <div className="flex flex-col items-start gap-1 sm:gap-1.5 shrink-0">
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Tombol Profil Karakter */}
            <button
              onClick={onOpenProfile}
              className={`h-8 sm:h-9 md:h-10 flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 rounded-md bg-black border ${
                isSuperAdmin ? 'border-amber-400' : 'border-neutral-800'
              } hover:border-amber-400 transition-colors cursor-pointer group text-left`}
              title={isSuperAdmin ? '👑 Profil Super Admin (RADEN)' : 'Klik untuk membuka Profil Karakter'}
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center shrink-0 ${
                isSuperAdmin ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-amber-400'
              }`}>
                <User className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[11px] sm:text-xs text-neutral-100 group-hover:text-amber-400 transition-colors uppercase tracking-wider truncate max-w-[70px] sm:max-w-[120px]">
                    {stats.name}
                  </span>
                  {isSuperAdmin && (
                    <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-black bg-amber-400 px-1 py-0.5 rounded leading-none">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-400">
                    LV. {isUserAdmin ? '99999999999' : playerLevel}
                  </span>
                </div>
              </div>
            </button>

            {/* Icon Chat Button */}
            <button
              onClick={onToggleChat}
              className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isChatOpen
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : 'bg-black text-neutral-300 border-neutral-800 hover:border-amber-400 hover:text-amber-400'
              }`}
              title={isChatOpen ? 'Tutup Obrolan' : 'Buka Obrolan (atau tekan tombol "/")'}
            >
              <MessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>

            {/* Tombol Mikrofon Proximity Voice Chat */}
            <button
              onClick={handleToggleMic}
              className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-md border flex items-center justify-center relative transition-colors cursor-pointer shrink-0 ${
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
              {isMicActive ? <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" /> : <MicOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
              {isMicActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Tombol Maximize / Layar Penuh (Fullscreen) di sebelah Microphone */}
            <button
              onClick={handleToggleFullscreen}
              className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isFullscreen
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : 'bg-black text-neutral-300 border-neutral-800 hover:border-amber-400 hover:text-amber-400'
              }`}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              ) : (
                <Maximize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              )}
            </button>
          </div>
        </div>

        {/* KANAN ATAS: CONTAINER UANG, SERVER, SETTINGS, & PETA DUNIA */}
        <div className="pointer-events-none flex items-start gap-1 sm:gap-1.5 flex-wrap justify-end select-none max-w-[calc(100vw-140px)] sm:max-w-none">
          {/* KOIN EMAS */}
          <div
            className="pointer-events-auto h-8 sm:h-9 md:h-10 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 rounded-md bg-black border border-neutral-800 text-amber-400 select-none shadow-sm shrink-0"
            title="Koin Emas"
          >
            <Coins className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[7.5px] sm:text-[8px] text-neutral-400 uppercase font-semibold">KOIN</span>
              <span className="text-[10px] sm:text-xs font-black font-mono tracking-wider text-amber-300 mt-0.5">
                {isUserAdmin || gold >= 99999999999 ? '99999999999' : gold.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* BERLIAN */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenTopUp?.();
            }}
            className="pointer-events-auto h-8 sm:h-9 md:h-10 flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-2.5 pr-1 sm:pr-1.5 rounded-md bg-black border border-neutral-800 text-cyan-400 select-none shadow-sm group hover:border-cyan-500/50 transition-colors cursor-pointer shrink-0"
            title="Berlian (Klik untuk Top Up)"
          >
            <Gem className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400 fill-cyan-400/20 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[7.5px] sm:text-[8px] text-neutral-400 uppercase font-semibold">BERLIAN</span>
              <span className="text-[10px] sm:text-xs font-black font-mono tracking-wider text-cyan-300 mt-0.5">
                {isUserAdmin || diamonds >= 99999999999 ? '99999999999' : diamonds.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenTopUp?.();
              }}
              className="h-6 sm:h-7 px-1.5 sm:px-2 rounded bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black text-[9px] sm:text-[10px] tracking-wider uppercase flex items-center gap-1 ml-1 cursor-pointer transition-all shadow-sm active:scale-95"
              title="Top Up Berlian"
            >
              <Plus className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              <span>TOPUP</span>
            </button>
          </div>

          {/* Tombol Status Server Flat & Bersih */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenServerModal?.();
            }}
            className="pointer-events-auto h-8 sm:h-9 md:h-10 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-md bg-black border border-neutral-800 hover:border-amber-400 text-neutral-200 transition-colors cursor-pointer group shrink-0"
            title="Klik untuk Melihat Daftar Server & Pindah Realm"
          >
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 shrink-0" />
            <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[8px] sm:text-[9px] text-neutral-400 uppercase tracking-widest font-semibold">
                SERVER
              </span>
              <span className="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-wider font-mono mt-0.5">
                {displayServerCode}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[8px] sm:text-[9px] font-bold tracking-wider text-black bg-amber-400 group-hover:bg-amber-300 px-1 sm:px-1.5 py-0.5 rounded transition-colors ml-1">
              <ArrowRightLeft className="w-2.5 h-2.5" />
              <span>PINDAH</span>
            </div>
          </button>

          {/* Tombol Daftar Pemain Server */}
          <button
            onClick={() => {
              sound.playClick();
              try {
                NetworkManager.getInstance().requestRoomPlayers();
              } catch (e) {}
              setIsServerUsersModalOpen(true);
            }}
            className="pointer-events-auto h-8 sm:h-9 md:h-10 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 rounded-md bg-black border border-neutral-800 hover:border-amber-400 text-neutral-200 transition-colors cursor-pointer group shrink-0"
            title="Lihat Daftar Pemain di Server"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 group-hover:text-amber-300 shrink-0">
              <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[7.5px] sm:text-[8px] text-neutral-400 uppercase tracking-wider font-semibold">PEMAIN</span>
              <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-black font-mono tracking-wider text-white mt-0.5">
                <span className="text-amber-300">{serverPlayerCount}</span>
                <span className="text-neutral-500 font-normal">/</span>
                <span className="text-neutral-400">50</span>
              </div>
            </div>
          </button>

          {/* Tombol Cepat Buka Kurikulum Pelajaran jika berada di Ruang Sekolah SD / SMP / SMA */}
          {(rawLoc.includes('SD') || rawLoc.includes('SMP') || rawLoc.includes('SMA') || rawLoc.includes('Sekolah')) && (
            <button
              onClick={() => {
                sound.playClick();
                const sType = rawLoc.includes('SMP') ? 'smp' : rawLoc.includes('SMA') ? 'sma' : 'sd';
                EventBus.emit('open-school-subjects', { schoolType: sType });
              }}
              className="pointer-events-auto h-8 sm:h-9 md:h-10 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400 text-amber-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              title="Buka Teks Quiz Sekolah"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider">TEKS QUIZ</span>
            </button>
          )}

          {/* Tombol Pengaturan */}
          {onOpenSettings && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="pointer-events-auto h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-md bg-black border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Pengaturan Game & Konfigurasi IP Server"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* UI PETA / MINIMAP: 1 BARIS DENGAN PENGATURAN, DI SEBELAH KANAN PENGATURAN */}
          {!stats.inHouse && (
            <div className="pointer-events-auto flex flex-col items-end shrink-0">
              {/* Header Peta Mini (Sejajar 1 Baris dengan Pengaturan) */}
              <div className="h-8 flex items-center justify-between w-[110px] sm:w-[132px] px-1.5 sm:px-2 bg-black border-x border-t border-b border-neutral-800 rounded-t-md text-[9px] font-bold text-neutral-300 shadow-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  <Map className="w-3 h-3 text-amber-400" />
                  <span className="font-mono tracking-wider font-bold text-[9px] sm:text-[10px] text-amber-300">PETA</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsMinimapOpen(!isMinimapOpen);
                    }}
                    className="p-0.5 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title={isMinimapOpen ? "Sembunyikan Peta" : "Tampilkan Peta"}
                  >
                    {isMinimapOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsFullMapOpen(true);
                    }}
                    className="p-0.5 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Perbesar Peta Penuh"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Kotak Bodi Peta: Kanvas Peta (Jika Buka) + Posisi Grid & Jam (Selalu Tampil) */}
              <div className="w-[110px] sm:w-[132px] flex flex-col bg-black border-x border-b border-neutral-800 rounded-b-md overflow-hidden shadow-2xl">
                {/* Kanvas Peta Mini (Hanya muncul jika tidak di-minimize) */}
                {isMinimapOpen && (
                  <div
                    onClick={() => {
                      sound.playClick();
                      setIsFullMapOpen(true);
                    }}
                    className="w-[110px] h-[110px] sm:w-[132px] sm:h-[132px] bg-[#001026] p-0.5 relative overflow-hidden cursor-pointer group hover:opacity-95 transition-opacity border-b border-neutral-800"
                    title="Klik untuk membuka Peta Penuh & Panduan Wilayah"
                  >
                    {/* Peta Mini WorldMapSvg Presisi & Kaya Visual Mirip Dunia Asli */}
                    <WorldMapSvg
                      playerGridX={gridX}
                      playerGridY={gridY}
                      playerDirection={stats?.direction || 'down'}
                      isMini={true}
                      customMarker={customMarker}
                      className="w-full h-full rounded"
                    />

                    {/* Petunjuk Kompas Mata Angin (U, T, S, B) */}
                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7.5px] font-black font-mono text-amber-300/90 pointer-events-none drop-shadow">
                      U
                    </div>
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7.5px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                      S
                    </div>
                    <div className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[7.5px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                      B
                    </div>
                    <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[7.5px] font-black font-mono text-neutral-400 pointer-events-none drop-shadow">
                      T
                    </div>

                    {/* Efek Garis Radar Scanline */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/5 to-transparent pointer-events-none animate-pulse" />
                  </div>
                )}

                {/* BAGIAN DI DALAM KOTAK PETA DI BAWAH PETA: POSISI GRID & JAM (Selalu Tampil saat di-minimize) */}
                <div className="w-full px-2 py-1.5 bg-neutral-950/95 flex flex-col gap-1 select-none">
                  {/* 1. Posisi Grid */}
                  <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold bg-black px-1.5 py-0.5 rounded border border-neutral-800">
                    <span className="text-neutral-400 text-[8px] uppercase tracking-wider font-semibold">GRID</span>
                    <span className="text-amber-300 font-bold text-[9px]">{gridX}, {gridY}</span>
                  </div>

                  {/* Waypoint Tanda Kustom Jika Ada */}
                  {customMarker && (
                    <div className="w-full flex items-center justify-between text-[8px] font-mono bg-red-950/80 border border-red-800/80 px-1.5 py-0.5 rounded text-red-200">
                      <span className="flex items-center gap-1 font-bold truncate">
                        <MapPin className="w-2.5 h-2.5 text-red-400 shrink-0 animate-pulse" />
                        {customMarker.x}, {customMarker.y}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearMarker();
                        }}
                        className="text-neutral-400 hover:text-white px-0.5 font-bold hover:bg-red-800/50 rounded cursor-pointer leading-none ml-1"
                        title="Hapus Tanda Waypoint"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* 2. Jam Digital Realtime di Dalam Kotak Peta di Bawah Grid */}
                  <div
                    className="w-full flex items-center justify-between gap-1 pt-0.5 text-left"
                    title={`Waktu RadenWorld: ${timePeriod} (${dateString}) - ${timeString} WIB`}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`flex items-center justify-center ${periodColor}`}>
                        <PeriodIcon className="w-3 h-3" />
                      </div>
                      <div className="flex items-baseline gap-0.5 font-mono font-black text-[10px] tracking-wider text-white">
                        <span>{timeString}</span>
                        <span className="text-[7.5px] text-amber-400 font-bold">WIB</span>
                      </div>
                    </div>

                    <span className={`text-[7px] font-black tracking-wider uppercase px-1 py-0.5 rounded ${periodBg} ${periodColor}`}>
                      {timePeriod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Teks Nama Wilayah / Lokasi di Bawah Minimap */}
              <div className="w-[132px] text-right pointer-events-none text-[8.5px] font-black text-amber-300 uppercase tracking-wider truncate pt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                <span>{displayLocation}</span>
              </div>
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

          {/* Keterangan Kontrol PC / Laptop: 2 Kolom, Ringkas, Kecil & 100% Transparan Tanpa Background/Border */}
          {!isMobile && (
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-0.5 text-[9px] font-bold text-neutral-200 tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-mono font-black">[WASD]</span>
                <span>Jalan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-mono font-black">[F]</span>
                <span>Mancing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-mono font-black">[E]</span>
                <span>Interaksi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-mono font-black">[B]</span>
                <span>Buka Tas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-mono font-black">[SPASI]</span>
                <span>Lompat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-mono font-black">[1-6]</span>
                <span>Hotbar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-mono font-black">[/]</span>
                <span>Obrolan</span>
              </div>
            </div>
          )}
        </div>

        {/* KANAN BAWAH: Teks Nama Wilayah (Khusus Mode PC; pada Mobile sudah tampil rapi di bawah Minimap agar tidak tertimpa kontrol) */}
        {!isMobile && (
          <div className="flex flex-col items-end gap-1 text-right select-none pointer-events-none">
            <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pr-0.5">
              <span>{displayLocation}</span>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. MODAL ATLAS DUNIA LENGKAP (FULL MAP MODAL 80x80 DENGAN ZOOM & TANDA) */}
      {/* ==================================================================== */}
      {isFullMapOpen && !stats.inHouse && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-4 bg-black/85 pointer-events-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(90dvh,88vh)] my-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-neutral-900/90 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs sm:text-sm tracking-wider text-white">ATLAS DUNIA RADENWORLD</span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  80 × 80 PETAK
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {customMarker && (
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-red-300 bg-red-950/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-red-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    ({customMarker.x}, {customMarker.y})
                  </span>
                )}
                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-black/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-neutral-800">
                  ({gridX}, {gridY})
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsFullMapOpen(false);
                  }}
                  className="p-1 sm:p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Peta"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Konten Peta Besar */}
            <div className="p-2.5 sm:p-4 flex flex-col items-center gap-2 sm:gap-2.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {/* Toolbar Zoom & Tanda */}
              <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-[440px] px-2.5 py-1.5 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs shrink-0">
                {/* Kontrol Zoom In / Out / Reset */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400">Zoom:</span>
                  <button
                    onClick={handleZoomOut}
                    disabled={mapZoom <= 1}
                    className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-amber-300 text-xs px-2 py-0.5 bg-black/60 rounded border border-neutral-800 min-w-[48px] text-center">
                    {Math.round(mapZoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={mapZoom >= 4}
                    className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-1 text-[10px] font-bold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer ml-1 flex items-center gap-1"
                    title="Reset Zoom (100%)"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                </div>

                {/* Kontrol Toggle Grid & Hapus Tanda */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                    className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                      showGridOverlay
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                    title="Toggle Garis Petak Grid 1x1"
                  >
                    <Grid className="w-3 h-3" />
                    Grid
                  </button>

                  {customMarker && (
                    <button
                      onClick={handleClearMarker}
                      className="px-2 py-1 text-[10px] font-bold rounded bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 transition-colors cursor-pointer flex items-center gap-1"
                      title="Hapus Tanda Waypoint"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus Tanda
                    </button>
                  )}
                </div>
              </div>

              {/* Viewport Peta dengan Pan & Zoom */}
              <div
                className={`w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[440px] h-[150px] xs:h-[180px] sm:h-[300px] md:h-[380px] bg-[#001026] border border-neutral-800 rounded-xl relative overflow-hidden shadow-2xl select-none shrink-0 ${
                  mapZoom > 1 ? (isDraggingMap ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
                }`}
                onMouseDown={handleMapMouseDown}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                onMouseLeave={handleMapMouseUp}
                onWheel={handleMapWheel}
              >
                {/* Container Yang Ditransformasikan (Zoom & Pan) */}
                <div
                  className="w-full h-full"
                  style={{
                    transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
                    transformOrigin: 'center center',
                    transition: isDraggingMap ? 'none' : 'transform 0.12s ease-out',
                  }}
                >
                  <WorldMapSvg
                    playerGridX={gridX}
                    playerGridY={gridY}
                    playerDirection={stats?.direction || 'down'}
                    isMini={false}
                    customMarker={customMarker}
                    onMapClick={handleSetMarker}
                    showGridLines={showGridOverlay}
                    className="w-full h-full rounded"
                  />
                </div>

                {/* Kompas Mata Angin */}
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

              {/* Petunjuk Interaksi Peta */}
              <div className="w-full max-w-[440px] flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
                <span>📍 Klik di peta untuk pasang / hapus tanda</span>
                <span>🖱️ Scroll untuk zoom • Geser untuk pan</span>
              </div>

              {/* Legenda Peta 100% Sesuai Dunia */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-[440px] text-[11px] text-neutral-300 font-semibold px-1 pt-1 border-t border-neutral-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#01ae01] border border-[#008e00]" />
                  <span>Rumput Catur</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#1e293b] border border-amber-400" />
                  <span>Jalan Protokol</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#94a3b8] border border-neutral-600" />
                  <span>Trotoar Paving</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#00a2f3]" />
                  <span>Lautan Timur</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#cbd5e1] border border-neutral-500" />
                  <span>Dermaga 1 - 3</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#b39962] border border-[#8c733e]" />
                  <span>Pantai Pasir</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-400/50" />
                  <span className="text-red-300 font-bold">Tanda Waypoint</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-400/50" />
                  <span className="text-amber-300 font-bold">Posisi Kamu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DAFTAR PEMAIN DI SERVER (ROBLOX-STYLE PLAYER LIST) */}
      <ServerUsersModal
        isOpen={isServerUsersModalOpen}
        onClose={() => setIsServerUsersModalOpen(false)}
        serverCode={displayServerCode}
        currentUserName={stats?.name || 'Petualang'}
        currentUserAvatar={stats?.avatar}
        currentUserLevel={playerLevel}
        currentUserRole={stats?.role}
        isCurrentUserAdmin={isSuperAdmin}
        players={serverPlayers}
        friendsList={friendsList}
        onInspectPlayer={onInspectPlayer}
        onAddFriend={onAddFriend}
      />
    </div>
  );
});
HUD.displayName = 'HUD';
