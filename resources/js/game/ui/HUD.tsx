/**
 * ============================================================================
 * FILE: resources/js/game/ui/HUD.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Heads-Up Display (HUD) mengambang di atas canvas permainan RadenWorld
 * dengan spesifikasi Cozycore Clay-Pixel:
 * - Palet: Primary #FFAE6D, Secondary #A8E6CF, Neutral #FFF8EA, Outline 2px #5C3A21.
 * - Teks: #000000 / #FFFFFF kontras tinggi, tanpa hover & tanpa glow.
 * - Responsif penuh untuk PC Desktop & Mobile (Portrait maupun Landscape).
 * ============================================================================
 */

import React from 'react';
import { IAvatarCustomization, Direction, IPlayerData } from '../types';
import {
  MessageSquare,
  Zap,
  User,
  Users,
  Mic,
  MicOff,
  Settings,
  Globe,
  ArrowRightLeft,
  Coins,
  Sun,
  Moon,
  Sunset,
  Map,
  MapPin,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Trash2,
  BookOpen,
  HelpCircle,
  Crosshair,
  Navigation,
} from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { VoiceManager } from '../core/VoiceManager';
import { NetworkManager } from '../core/NetworkManager';
import { WorldMapSvg, IMapMarker } from './WorldMapSvg';
import { ServerUsersModal } from './ServerUsersModal';
import { ThemeSettings, DEFAULT_THEME_SETTINGS } from '../core/ThemeManager';

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
  themeSettings?: ThemeSettings;
}

export const HUD: React.FC<HUDProps> = React.memo(({
  playerStats,
  serverCode = 'Asia 1',
  onToggleChat,
  onToggleGuide,
  onOpenProfile,
  onOpenSettings,
  onOpenServerModal,
  isChatOpen,
  interactionPrompt,
  onTriggerInteraction,
  controlMode = 'pc',
  gold = 2500,
  diamonds = 0,
  friendsList = [],
  onInspectPlayer,
  onAddFriend,
  themeSettings,
}) => {
  const sound = SoundManager.getInstance();
  const theme = themeSettings || DEFAULT_THEME_SETTINGS;
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
  const [isMinimapOpen, setIsMinimapOpen] = React.useState(() => {
    if (typeof window !== 'undefined' && window.innerHeight < 450 && window.innerWidth > window.innerHeight) {
      return false;
    }
    return true;
  });
  const [isFullMapOpen, setIsFullMapOpen] = React.useState(false);

  const [serverPlayerCount, setServerPlayerCount] = React.useState<number>(1);
  const [serverPlayers, setServerPlayers] = React.useState<IPlayerData[]>([]);
  const [isServerUsersModalOpen, setIsServerUsersModalOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    EventBus.emit('full-map-toggled', isFullMapOpen);
  }, [isFullMapOpen]);

  React.useEffect(() => {
    if (stats.inHouse && isFullMapOpen) {
      setIsFullMapOpen(false);
    }
  }, [stats.inHouse, isFullMapOpen]);

  React.useEffect(() => {
    const handleToggleFullMap = () => {
      if (stats.inHouse) {
        SoundManager.getInstance().playError();
        return;
      }
      setIsFullMapOpen((prev) => !prev);
      SoundManager.getInstance().playClick();
    };

    EventBus.on('toggle-full-map', handleToggleFullMap);
    return () => {
      EventBus.off('toggle-full-map', handleToggleFullMap);
    };
  }, [stats.inHouse]);

  React.useEffect(() => {
    const handleCount = (count: number) => {
      if (typeof count === 'number' && count > 0) {
        setServerPlayerCount(count);
      }
    };
    const handlePlayers = (list: IPlayerData[]) => {
      setServerPlayers(list);
      if (list && list.length > 0) {
        setServerPlayerCount(list.length);
      }
    };
    const handleStats = (stats: Record<string, number>) => {
      const clean = cleanServerCode(serverCode);
      const sCount = stats[clean];
      if (typeof sCount === 'number' && sCount > 0) {
        setServerPlayerCount(sCount);
      }
    };

    EventBus.on('player-count-updated', handleCount);
    EventBus.on('server-players-updated', handlePlayers);
    EventBus.on('server-stats-updated', handleStats);

    try {
      const net = NetworkManager.getInstance();
      const currentCount = net.getServerPlayerCount();
      if (currentCount > 0) {
        setServerPlayerCount(currentCount);
      }
      const currentList = net.getServerPlayers();
      if (currentList && currentList.length > 0) {
        setServerPlayers(currentList);
      }
      net.requestServerStats();
      net.requestServerPlayers();
    } catch (e) {}

    return () => {
      EventBus.off('player-count-updated', handleCount);
      EventBus.off('server-players-updated', handlePlayers);
      EventBus.off('server-stats-updated', handleStats);
    };
  }, [serverCode]);

  // ==========================================================================
  // NOTIFIKASI DAPAT IKAN & HASIL PANEN DI KIRI ATAS (TEPAT DI BAWAH PROFIL)
  // ==========================================================================
  const [topLeftLootCard, setTopLeftLootCard] = React.useState<{
    id: string;
    kind: 'fish' | 'harvest';
    icon: string;
    title: string;
    subTypeLabel: string;
    weightKg: number;
    depthMeters?: number;
    sameCount: number;
    qty?: number;
    effect: string;
    rarity?: string;
    rewardBadge: string;
  } | null>(null);

  const [handHoldStatus, setHandHoldStatus] = React.useState<{
    partnerName: string;
    partnerId?: string;
    role: 'leader' | 'follower';
  } | null>(null);

  React.useEffect(() => {
    let lootTimer: ReturnType<typeof setTimeout> | null = null;

    const handleFishCaughtCard = (data: any) => {
      const fish = data?.fish;
      if (!fish) return;
      const waterShort =
        data?.waterShort ||
        (fish.waterType === 'Air Laut'
          ? 'Laut'
          : fish.waterType === 'Air Payau'
          ? 'Payau'
          : 'Tawar');
      const depth =
        typeof data?.depthMeters === 'number'
          ? data.depthMeters
          : typeof fish.depthMeters === 'number'
          ? fish.depthMeters
          : 12.5;
      const weight = typeof fish.weightKg === 'number' ? fish.weightKg : 15.0;
      const sameCount = Number(data?.sameCatchCount || fish.catchStreak || 1);
      const effectText =
        data?.effect ||
        fish.effect ||
        'Fokus Belajar +15% EXP & Stamina Segar';
      const cleanFishName = String(fish.name || 'Ikan Mujair').replace(/^\[(JUMBO|LOKAL)\]\s*/i, '');

      setTopLeftLootCard({
        id: `fish_${Date.now()}`,
        kind: 'fish',
        icon: fish.rarity === 'Legendary' ? '🌟🐟' : fish.rarity === 'Rare' ? '🐠' : '🐟',
        title: `${cleanFishName} (${waterShort})`,
        subTypeLabel: `Air ${waterShort}`,
        weightKg: weight,
        depthMeters: depth,
        sameCount,
        effect: effectText,
        rarity: fish.rarity || 'Common',
        rewardBadge: `+${fish.goldReward || 30} G • +${data?.expEarned || 25} EXP`,
      });

      if (lootTimer) clearTimeout(lootTimer);
      lootTimer = setTimeout(() => {
        setTopLeftLootCard(null);
      }, 9500);
    };

    const handleCropHarvestedCard = (data: any) => {
      if (!data?.cropName) return;
      const sameCount = Number(data.sameHarvestCount || 1);
      const weight =
        typeof data.weightKg === 'number'
          ? data.weightKg
          : parseFloat((12 + Math.random() * 38).toFixed(1));
      const effectText =
        data.effect || 'Pulihkan +35 HP & Fokus Belajar +15% EXP';

      setTopLeftLootCard({
        id: `crop_${Date.now()}`,
        kind: 'harvest',
        icon: data.icon || '🍎',
        title: `${data.cropName}`,
        subTypeLabel: `Diambil Sama: ${sameCount}x`,
        weightKg: weight,
        sameCount,
        qty: Number(data.qty || 2),
        effect: effectText,
        rarity: data.rarity || 'Common',
        rewardBadge: `+${data.qty || 2} Panen • +${data.exp || 25} EXP`,
      });

      if (lootTimer) clearTimeout(lootTimer);
      lootTimer = setTimeout(() => {
        setTopLeftLootCard(null);
      }, 9500);
    };

    const handleHandHoldChanged = (data: {
      partnerName: string | null;
      partnerId?: string;
      role?: 'leader' | 'follower';
    }) => {
      if (data && data.partnerName) {
        setHandHoldStatus({
          partnerName: data.partnerName,
          partnerId: data.partnerId,
          role: data.role || 'leader',
        });
      } else {
        setHandHoldStatus(null);
      }
    };

    EventBus.on('fishing-caught', handleFishCaughtCard);
    EventBus.on('farming-crop-harvested', handleCropHarvestedCard);
    EventBus.on('handhold-state-changed', handleHandHoldChanged);

    return () => {
      if (lootTimer) clearTimeout(lootTimer);
      EventBus.off('fishing-caught', handleFishCaughtCard);
      EventBus.off('farming-crop-harvested', handleCropHarvestedCard);
      EventBus.off('handhold-state-changed', handleHandHoldChanged);
    };
  }, []);

  const [customMarker, setCustomMarker] = React.useState<IMapMarker | null>(() => {
    try {
      const saved = localStorage.getItem('raden_custom_waypoint');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Atlas Full Map Zoom & Pan State (Mouse + Touch)
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
    setMapZoom((z) => Math.min(4, Number((z + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    sound.playClick();
    setMapZoom((z) => {
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

  const handleCenterPlayer = () => {
    sound.playClick();
    setMapZoom(2);
    // Posisi relatif terhadap titik pusat (gx: 40, gy: 40)
    const offsetX = (40 - gridX) * 3.5;
    const offsetY = (40 - gridY) * 3.5;
    setMapPan({ x: Math.max(-120, Math.min(120, offsetX)), y: Math.max(-120, Math.min(120, offsetY)) });
  };

  const handleSelectPoi = (poi: { name: string; x: number; y: number; icon: string }) => {
    sound.playClick();
    const marker: IMapMarker = { x: poi.x, y: poi.y, label: poi.name };
    setCustomMarker(marker);
    try {
      localStorage.setItem('raden_custom_waypoint', JSON.stringify(marker));
    } catch (e) {}
    setMapZoom(2);
    const offsetX = (40 - poi.x) * 3.5;
    const offsetY = (40 - poi.y) * 3.5;
    setMapPan({ x: Math.max(-120, Math.min(120, offsetX)), y: Math.max(-120, Math.min(120, offsetY)) });
  };

  const WORLD_POIS = [
    { name: 'Rumah Pemain', x: 11, y: 4, icon: '🏠' },
    { name: 'Sekolah SD', x: 27, y: 8, icon: '🎒' },
    { name: 'Sekolah SMP', x: 33, y: 8, icon: '📚' },
    { name: 'Sekolah SMA', x: 39, y: 8, icon: '🎓' },
    { name: 'Kebun Tani', x: 68, y: 5, icon: '🌾' },
    { name: 'Pak Tani Somad', x: 61, y: 10, icon: '👨‍🌾' },
    { name: 'Alun-Alun', x: 38, y: 36, icon: '🌳' },
    { name: 'Cafe Santai', x: 3, y: 21, icon: '☕' },
    { name: 'Perpustakaan', x: 14, y: 21, icon: '📖' },
    { name: 'Kantor Polisi', x: 3, y: 37, icon: '👮' },
    { name: 'Bank Sentral', x: 14, y: 37, icon: '🏦' },
    { name: 'Apotek Farma', x: 3, y: 53, icon: '💊' },
    { name: 'Pasar Makelar', x: 14, y: 53, icon: '🏪' },
    { name: 'Lapangan Bola', x: 29, y: 55, icon: '⚽' },
    { name: 'Lapangan Basket', x: 51, y: 55, icon: '🏀' },
    { name: 'Dermaga Mancing', x: 68, y: 38, icon: '🎣' },
    { name: 'Pantai Pasir', x: 40, y: 74, icon: '🏖️' },
  ];

  const startPanAt = (clientX: number, clientY: number) => {
    setDragStartPos({ x: clientX, y: clientY });
    setInitialPanPos({ ...mapPan });
    setHasMovedDuringDrag(false);
    setIsDraggingMap(true);
  };

  const movePanAt = (clientX: number, clientY: number) => {
    if (!isDraggingMap) return;
    const dx = clientX - dragStartPos.x;
    const dy = clientY - dragStartPos.y;
    if (!hasMovedDuringDrag && Math.hypot(dx, dy) > 4) {
      setHasMovedDuringDrag(true);
    }
    if (mapZoom > 1) {
      const maxPan = (mapZoom - 1) * 200 + 40;
      const newX = Math.max(-maxPan, Math.min(maxPan, initialPanPos.x + dx));
      const newY = Math.max(-maxPan, Math.min(maxPan, initialPanPos.y + dy));
      setMapPan({ x: newX, y: newY });
    }
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startPanAt(e.clientX, e.clientY);
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    movePanAt(e.clientX, e.clientY);
  };

  const handleMapMouseUp = () => {
    setIsDraggingMap(false);
  };

  const handleMapTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startPanAt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMapTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingMap) {
      if (mapZoom > 1) e.preventDefault();
      movePanAt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMapTouchEnd = () => {
    setIsDraggingMap(false);
  };

  const handleMapWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setMapZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))));
    } else {
      setMapZoom((z) => {
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

  let timePeriod = 'Malam';
  let PeriodIcon = Moon;
  if (hours >= 5 && hours < 11) {
    timePeriod = 'Pagi';
    PeriodIcon = Sun;
  } else if (hours >= 11 && hours < 15) {
    timePeriod = 'Siang';
    PeriodIcon = Sun;
  } else if (hours >= 15 && hours < 18) {
    timePeriod = 'Sore';
    PeriodIcon = Sunset;
  }

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
    if (document.activeElement && (document.activeElement as HTMLElement).blur) {
      (document.activeElement as HTMLElement).blur();
    }
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

  const formattedGold =
    isUserAdmin || gold >= 99999999999
      ? '999M+'
      : gold.toLocaleString('id-ID');

  const formattedLevel = isUserAdmin ? 'MAX' : String(playerLevel);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between text-black"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0.5rem))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0.5rem))',
      }}
    >
      {/* ==================================================================== */}
      {/* 1. TOP BAR: KIRI (PROFIL & CHAT) | KANAN (KOIN, SERVER, PETA)        */}
      {/* ==================================================================== */}
      <div className="flex items-start justify-between gap-1.5 sm:gap-2.5 w-full">
        {/* KIRI ATAS (PROFIL + KARTU DAPAT IKAN / PANEN TEPAT DI BAWAH PROFIL) */}
        <div className="flex flex-col items-start gap-1.5 shrink-0 max-w-[260px] sm:max-w-[320px]">
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Tombol Profil Karakter */}
            {theme.visibility?.showPlayerStats !== false && (
              <button
                type="button"
                tabIndex={-1}
                onClick={onOpenProfile}
                onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                className="clay-btn-neutral h-8 sm:h-10 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 text-left shrink-0 text-black"
                title={isSuperAdmin ? '👑 Profil Super Admin (RADEN)' : 'Klik untuk membuka Profil Karakter'}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#FFAE6D] border border-[#5C3A21] flex items-center justify-center shrink-0 text-black">
                  <User className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col leading-none">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[11px] sm:text-xs text-black truncate max-w-[95px] sm:max-w-[145px]" title={stats.name}>
                      {stats.name}
                    </span>
                    {isSuperAdmin && (
                      <span className="clay-badge-secondary text-[8px] font-bold text-black px-1 py-0.5 leading-none">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-black mt-0.5">
                    LV. {formattedLevel}
                  </span>
                </div>
              </button>
            )}

            {/* Tombol Chat */}
            {theme.visibility?.showChat !== false && (
              <button
                type="button"
                tabIndex={-1}
                onClick={onToggleChat}
                onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0 text-black ${
                  isChatOpen ? 'clay-btn-primary' : 'clay-btn-neutral'
                }`}
                title={isChatOpen ? 'Tutup Obrolan' : 'Buka Obrolan (/)'}
              >
                <MessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Tombol Mikrofon Proximity Voice Chat */}
            <button
              type="button"
              tabIndex={-1}
              onClick={handleToggleMic}
              onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
              className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center relative shrink-0 text-black ${
                isMicActive ? 'clay-btn-secondary' : 'clay-btn-neutral'
              }`}
              title={
                isMicActive
                  ? 'Mikrofon Aktif (Klik untuk Mematikan) - Jangkauan ±5 Petak'
                  : 'Nyalakan Mikrofon (Proximity Voice Chat)'
              }
            >
              {isMicActive ? (
                <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              ) : (
                <MicOff className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              )}
            </button>

            {/* Tombol Fullscreen */}
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
                handleToggleFullscreen();
              }}
              onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  (e.currentTarget as HTMLElement).blur();
                }
              }}
              className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0 text-black ${
                isFullscreen ? 'clay-btn-primary' : 'clay-btn-neutral'
              }`}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              ) : (
                <Maximize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              )}
            </button>

            {/* Tombol Panduan Kontrol (Opsional Cepat) */}
            {onToggleGuide && theme.visibility?.showControlsGuide !== false && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  sound.playClick();
                  onToggleGuide();
                }}
                onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                className="clay-btn-neutral hidden md:flex h-10 w-10 items-center justify-center shrink-0 text-black"
                title="Petunjuk Kontrol"
              >
                <HelpCircle className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* STATUS PEGANGAN TANGAN AKTIF (TEPAT DI BAWAH PROFIL) */}
          {handHoldStatus && (
            <div className="pointer-events-auto clay-card-secondary px-2.5 py-1.5 border-2 border-[#5C3A21] flex items-center justify-between gap-2 w-full shadow-sm">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="min-w-0 leading-tight">
                  <div className="text-[10px] font-bold text-black uppercase truncate">
                    Pegangan Tangan: {handHoldStatus.partnerName}
                  </div>
                  <div className="text-[9px] text-black/80 font-bold">
                    {handHoldStatus.role === 'follower'
                      ? 'Otomatis Mengikuti Langkahnya'
                      : 'Sedang Menggandeng Bersama'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  EventBus.emit('release-handhold');
                }}
                className="clay-btn-cocoa text-white text-[9px] font-bold px-2 py-0.5 shrink-0"
                title="Lepaskan Pegangan Tangan"
              >
                Lepas
              </button>
            </div>
          )}

          {/* UI NOTIFIKASI HASIL TANGKAPAN IKAN & HASIL PANEN (KIRI ATAS TEPAT DI BAWAH PROFIL) */}
          {topLeftLootCard && (
            <div className="pointer-events-auto clay-card p-2.5 border-2 border-[#5C3A21] w-full text-black space-y-1.5 shadow-md">
              <div className="flex items-center justify-between gap-1.5 border-b border-[#5C3A21]/30 pb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-[#FFAE6D] border border-[#5C3A21] flex items-center justify-center text-sm shrink-0">
                    {topLeftLootCard.icon}
                  </span>
                  <div className="min-w-0 leading-tight">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#5C3A21]">
                      {topLeftLootCard.kind === 'fish'
                        ? '🎣 TANGKAPAN IKAN BARU'
                        : '🌾 HASIL PANEN KEBUN'}
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-black truncate">
                      {topLeftLootCard.title}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTopLeftLootCard(null);
                  }}
                  className="w-5 h-5 clay-btn-neutral flex items-center justify-center text-black shrink-0"
                  title="Tutup Info"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Detail Berat, Kedalaman (untuk Ikan) / Berapa Kali Diambil Sama (untuk Panen) */}
              <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
                <div className="clay-badge-neutral px-2 py-1 flex items-center justify-between gap-1">
                  <span className="text-black/75">⚖️ Berat:</span>
                  <span className="text-black">{topLeftLootCard.weightKg} kg</span>
                </div>

                {topLeftLootCard.kind === 'fish' ? (
                  <div className="clay-badge-secondary px-2 py-1 flex items-center justify-between gap-1">
                    <span className="text-black/75">🌊 Dalam:</span>
                    <span className="text-black">{topLeftLootCard.depthMeters}m</span>
                  </div>
                ) : (
                  <div className="clay-badge-secondary px-2 py-1 flex items-center justify-between gap-1">
                    <span className="text-black/75">🔁 Diambil:</span>
                    <span className="text-black">{topLeftLootCard.sameCount}x Sama</span>
                  </div>
                )}
              </div>

              {topLeftLootCard.kind === 'fish' && topLeftLootCard.sameCount > 1 && (
                <div className="text-[9.5px] font-bold text-black bg-[#FFF8EA] px-2 py-0.5 rounded border border-[#5C3A21]/40 flex items-center justify-between">
                  <span>🔁 Ikan Sama Tertangkap:</span>
                  <span className="font-bold">{topLeftLootCard.sameCount}x</span>
                </div>
              )}

              {/* Efek Ikan / Efek Hasil Panen */}
              <div className="clay-card-primary px-2 py-1.5 border border-[#5C3A21] text-[10px] leading-snug">
                <div className="font-bold text-black uppercase text-[9px]">
                  ✨ {topLeftLootCard.kind === 'fish' ? 'Efek Ikan:' : 'Efek Hasil Panen:'}
                </div>
                <div className="font-bold text-black mt-0.5">
                  {topLeftLootCard.effect}
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-bold text-black pt-0.5">
                <span className="clay-badge-neutral px-1.5 py-0.5">
                  {topLeftLootCard.rewardBadge}
                </span>
                <span className="text-black/75">Masuk Tas [B]</span>
              </div>
            </div>
          )}
        </div>

        {/* KANAN ATAS */}
        <div className="pointer-events-none flex items-start gap-1 sm:gap-1.5 flex-wrap justify-end select-none max-w-[calc(100dvw-155px)] sm:max-w-none">
          {/* KOIN EMAS (Bisa di-toggle via Pengaturan UI) */}
          {theme.visibility?.showPlayerStats !== false && (
            <div
              className="pointer-events-auto clay-card h-8 sm:h-10 flex items-center gap-1.5 px-2 sm:px-2.5 text-black shrink-0"
              title={`Koin Emas: ${gold.toLocaleString('id-ID')}`}
            >
              <div className="w-5 h-5 rounded-md bg-[#FFAE6D] border border-[#5C3A21] flex items-center justify-center shrink-0">
                <Coins className="w-3 h-3 text-black stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[7px] sm:text-[8px] text-black uppercase font-bold">KOIN</span>
                <span className="text-[9px] sm:text-xs font-bold text-black mt-0.5">
                  {formattedGold}
                </span>
              </div>
            </div>
          )}

          {/* Tombol Status Server */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              sound.playClick();
              onOpenServerModal?.();
            }}
            onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
            className="pointer-events-auto clay-btn-neutral h-8 sm:h-10 flex items-center gap-1.5 px-2 sm:px-2.5 text-black shrink-0"
            title="Klik untuk Melihat Daftar Server & Pindah Realm"
          >
            <Globe className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[7px] sm:text-[8px] text-black uppercase font-bold">SERVER</span>
              <span className="text-[9px] sm:text-xs font-bold text-black uppercase mt-0.5">
                {displayServerCode}
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1 clay-badge-secondary text-[8.5px] font-bold text-black px-1.5 py-0.5 ml-1">
              <ArrowRightLeft className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>PINDAH</span>
            </div>
          </button>

          {/* Tombol Daftar Pemain Server */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              sound.playClick();
              try {
                NetworkManager.getInstance().requestServerPlayers();
                NetworkManager.getInstance().requestServerStats();
              } catch (e) {}
              setIsServerUsersModalOpen(true);
            }}
            onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
            className="pointer-events-auto clay-btn-neutral h-8 sm:h-10 flex items-center gap-1.5 px-2 sm:px-2.5 text-black shrink-0"
            title="Lihat Daftar Pemain di Server"
          >
            <div className="w-5 h-5 rounded-md bg-[#A8E6CF] border border-[#5C3A21] flex items-center justify-center text-black shrink-0">
              <Users className="w-3 h-3 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[7px] sm:text-[8px] text-black uppercase font-bold">PEMAIN</span>
              <span className="text-[9px] sm:text-xs font-bold text-black mt-0.5">
                {serverPlayerCount}/50
              </span>
            </div>
          </button>

          {/* Tombol Cepat Teks Quiz jika berada di Sekolah */}
          {(rawLoc.includes('SD') || rawLoc.includes('SMP') || rawLoc.includes('SMA') || rawLoc.includes('Sekolah')) && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                sound.playClick();
                const sType = rawLoc.includes('SMP') ? 'smp' : rawLoc.includes('SMA') ? 'sma' : 'sd';
                EventBus.emit('open-school-subjects', { schoolType: sType });
              }}
              onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
              className="pointer-events-auto clay-btn-primary h-8 sm:h-10 flex items-center gap-1.5 px-2 sm:px-2.5 text-black font-bold text-xs uppercase shrink-0"
              title="Buka Teks Quiz Sekolah"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-bold">QUIZ</span>
            </button>
          )}

          {/* Tombol Pengaturan */}
          {onOpenSettings && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
              className="pointer-events-auto clay-btn-neutral h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center text-black shrink-0"
              title="Pengaturan Game & Konfigurasi Server"
            >
              <Settings className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
            </button>
          )}

          {/* UI PETA / MINIMAP CLAY-PIXEL (HANYA JIKA POSISI TOP-RIGHT) */}
          {!stats.inHouse && theme.visibility?.showMinimap !== false && (theme.minimapPosition || 'top-right') === 'top-right' && (
            <div className="pointer-events-auto flex flex-col items-end gap-1 shrink-0 w-[92px] sm:w-[118px] md:w-[138px]">
              <div className="clay-panel w-full overflow-hidden flex flex-col">
                {/* Header Peta Mini */}
                <div className="clay-header h-6 sm:h-7 flex items-center justify-between px-1.5 sm:px-2 text-black">
                  <div className="flex items-center gap-1">
                    <Map className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                    <span className="font-bold text-[8.5px] sm:text-[10px]">PETA</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => {
                        sound.playClick();
                        setIsMinimapOpen(!isMinimapOpen);
                      }}
                      onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                      className="p-0.5 text-black active:translate-y-[1px] cursor-pointer"
                      title={isMinimapOpen ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
                    >
                      {isMinimapOpen ? (
                        <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                      )}
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => {
                        sound.playClick();
                        setIsFullMapOpen(true);
                      }}
                      onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                      className="p-0.5 text-black active:translate-y-[1px] cursor-pointer"
                      title="Perbesar Peta Penuh"
                    >
                      <Maximize2 className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Kanvas Peta Mini */}
                {isMinimapOpen && (
                  <div
                    onClick={() => {
                      sound.playClick();
                      setIsFullMapOpen(true);
                    }}
                    className="w-full h-[68px] sm:h-[98px] md:h-[120px] landscape:max-md:h-[60px] bg-[#001026] p-0.5 relative overflow-hidden cursor-pointer border-b-2 border-[#5C3A21]"
                    title="Klik untuk membuka Peta Penuh"
                  >
                    <WorldMapSvg
                      playerGridX={gridX}
                      playerGridY={gridY}
                      playerDirection={stats?.direction || 'down'}
                      isMini={true}
                      customMarker={customMarker}
                      className="w-full h-full rounded-sm"
                    />
                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 px-1 bg-[#FFF8EA] border border-[#5C3A21] rounded text-[6.5px] font-bold text-black pointer-events-none leading-none">
                      U
                    </div>
                  </div>
                )}

                {/* Info Grid & Jam Digital */}
                <div className="w-full px-1.5 py-1 bg-[#FFF8EA] flex flex-col gap-1 text-black select-none">
                  {theme.visibility?.showCoordinates !== false && (
                    <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px] font-bold bg-[#A8E6CF] px-1.5 py-0.5 rounded border border-[#5C3A21]">
                      <span>GRID</span>
                      <span>{gridX},{gridY}</span>
                    </div>
                  )}

                  {customMarker && (
                    <div className="w-full flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-bold bg-[#FFAE6D] border border-[#5C3A21] px-1.5 py-0.5 rounded text-black">
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="w-2.5 h-2.5 shrink-0 stroke-[2.5]" />
                        {customMarker.x},{customMarker.y}
                      </span>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearMarker();
                        }}
                        onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                        className="text-black px-0.5 font-bold cursor-pointer leading-none ml-1"
                        title="Hapus Tanda Waypoint"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div
                    className="w-full flex items-center justify-between gap-1 text-[7.5px] sm:text-[8.5px] font-bold text-black"
                    title={`Waktu RadenWorld: ${timePeriod} (${dateString}) - ${timeString} WIB`}
                  >
                    <span className="flex items-center gap-0.5 truncate">
                      <PeriodIcon className="w-2.5 h-2.5 shrink-0 stroke-[2.5]" />
                      <span>{timeString}</span>
                    </span>
                    <span className="clay-badge-primary px-1 py-0 text-[6.5px] sm:text-[7.5px] leading-tight shrink-0">
                      {timePeriod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nama Wilayah di Bawah Minimap (Lebar Selaras Presisi dengan Kartu Peta) */}
              <div
                className="clay-badge-neutral px-1.5 py-0.5 w-full text-[8px] sm:text-[9px] font-bold text-black truncate text-center pointer-events-none"
                title={displayLocation}
              >
                {displayLocation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PETA / MINIMAP POSISI DINAMIS (JIKA DIUBAH KE TOP-LEFT, BOTTOM-LEFT, ATAU BOTTOM-RIGHT) */}
      {!stats.inHouse && theme.visibility?.showMinimap !== false && (theme.minimapPosition || 'top-right') !== 'top-right' && (
        <div
          className={`fixed z-30 pointer-events-auto flex flex-col gap-1 w-[92px] sm:w-[118px] md:w-[138px] ${
            theme.minimapPosition === 'top-left'
              ? (theme.visibility?.showPlayerStats !== false ? 'top-14 left-3 items-start' : 'top-3 left-3 items-start')
              : theme.minimapPosition === 'bottom-left'
              ? 'bottom-28 left-3 items-start'
              : 'bottom-28 right-3 items-end'
          }`}
        >
          <div className="clay-panel w-full overflow-hidden flex flex-col">
            <div className="clay-header h-6 sm:h-7 flex items-center justify-between px-1.5 sm:px-2 text-black">
              <div className="flex items-center gap-1">
                <Map className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                <span className="font-bold text-[8.5px] sm:text-[10px]">PETA</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    sound.playClick();
                    setIsMinimapOpen(!isMinimapOpen);
                  }}
                  onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                  className="p-0.5 text-black active:translate-y-[1px] cursor-pointer"
                  title={isMinimapOpen ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
                >
                  {isMinimapOpen ? (
                    <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                  )}
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    sound.playClick();
                    setIsFullMapOpen(true);
                  }}
                  onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                  className="p-0.5 text-black active:translate-y-[1px] cursor-pointer"
                  title="Perbesar Peta Penuh"
                >
                  <Maximize2 className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {isMinimapOpen && (
              <div
                onClick={() => {
                  sound.playClick();
                  setIsFullMapOpen(true);
                }}
                className="w-full h-[68px] sm:h-[98px] md:h-[120px] landscape:max-md:h-[60px] bg-[#001026] p-0.5 relative overflow-hidden cursor-pointer border-b-2 border-[#5C3A21]"
                title="Klik untuk membuka Peta Penuh"
              >
                <WorldMapSvg
                  playerGridX={gridX}
                  playerGridY={gridY}
                  playerDirection={stats?.direction || 'down'}
                  isMini={true}
                  customMarker={customMarker}
                  className="w-full h-full rounded-sm"
                />
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 px-1 bg-[#FFF8EA] border border-[#5C3A21] rounded text-[6.5px] font-bold text-black pointer-events-none leading-none">
                  U
                </div>
              </div>
            )}

            <div className="w-full px-1.5 py-1 bg-[#FFF8EA] flex flex-col gap-1 text-black select-none">
              {theme.visibility?.showCoordinates !== false && (
                <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px] font-bold bg-[#A8E6CF] px-1.5 py-0.5 rounded border border-[#5C3A21]">
                  <span>GRID</span>
                  <span>{gridX},{gridY}</span>
                </div>
              )}

              {customMarker && (
                <div className="w-full flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-bold bg-[#FFAE6D] border border-[#5C3A21] px-1.5 py-0.5 rounded text-black">
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0 stroke-[2.5]" />
                    {customMarker.x},{customMarker.y}
                  </span>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearMarker();
                    }}
                    onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
                    className="text-black px-0.5 font-bold cursor-pointer leading-none ml-1"
                    title="Hapus Tanda Waypoint"
                  >
                    ×
                  </button>
                </div>
              )}

              <div
                className="w-full flex items-center justify-between gap-1 text-[7.5px] sm:text-[8.5px] font-bold text-black"
                title={`Waktu RadenWorld: ${timePeriod} (${dateString}) - ${timeString} WIB`}
              >
                <span className="flex items-center gap-0.5 truncate">
                  <PeriodIcon className="w-2.5 h-2.5 shrink-0 stroke-[2.5]" />
                  <span>{timeString}</span>
                </span>
                <span className="clay-badge-primary px-1 py-0 text-[6.5px] sm:text-[7.5px] leading-tight shrink-0">
                  {timePeriod}
                </span>
              </div>
            </div>
          </div>

          <div
            className="clay-badge-neutral px-1.5 py-0.5 w-full text-[8px] sm:text-[9px] font-bold text-black truncate text-center pointer-events-none"
            title={displayLocation}
          >
            {displayLocation}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. BOTTOM BAR (TOMBOL INTERAKSI PC JIKA TERSEDIA)                     */}
      {/* ==================================================================== */}
      <div className="flex items-end justify-between w-full pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-start gap-2 select-none">
          {!isMobile && interactionPrompt && (
            <button
              type="button"
              onClick={onTriggerInteraction}
              className="clay-btn-primary flex items-center gap-2 px-3.5 py-2 text-black font-bold text-xs uppercase shadow-md"
            >
              <Zap className="w-3.5 h-3.5 fill-black text-black" />
              <span>{interactionPrompt}</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MODAL PETA RADEN WORLD (DENGAN SIDEBAR NAVIGASI, ZOOM & PIN)       */}
      {/* ==================================================================== */}
      {isFullMapOpen && !stats.inHouse && (
        <div className="ui-modal-backdrop z-[95] pointer-events-auto">
          <div className="clay-panel landscape-compact-modal w-full max-w-4xl max-h-[94dvh] flex flex-col overflow-hidden text-black">
            {/* Header Modal Peta */}
            <div className="clay-header landscape-compact-header flex items-center justify-between px-3.5 sm:px-5 py-2.5 gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
                  <Map className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-black truncate uppercase">
                      PETA RADEN WORLD
                    </span>
                    <span className="clay-badge-secondary text-[9px] font-bold px-1.5 py-0.5 text-black shrink-0">
                      80 × 80 PETAK
                    </span>
                  </div>
                  <p className="text-[10px] text-black hidden sm:block truncate">
                    Peta kartografi wilayah resmi • Ketuk petak untuk pasang target navigasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="clay-badge-primary text-[10px] font-bold text-black px-2 py-1">
                  Posisi: ({gridX}, {gridY})
                </span>
                {customMarker && (
                  <span className="clay-badge-secondary hidden sm:inline-block text-[10px] font-bold text-black px-2 py-1">
                    Pin: ({customMarker.x}, {customMarker.y}) • {Math.round(Math.hypot(customMarker.x - gridX, customMarker.y - gridY))} langkah
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsFullMapOpen(false);
                  }}
                  className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black"
                  title="Tutup Peta"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Layout Dual-Pane: Sidebar Lokasi Penting + Viewport Peta */}
            <div className="clay-modal-shell flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              {/* SIDEBAR KIRI: DAFTAR LOKASI PENTING (LOGO DI ATAS, TEKS DI BAWAH) */}
              <aside className="clay-sidebar w-full md:w-[135px] max-h-[110px] md:max-h-none flex-row md:flex-col border-b-2 md:border-b-0 md:border-r-2 border-[#5C3A21] shrink-0 overflow-x-auto md:overflow-x-hidden">
                <div className="clay-sidebar-brand hidden md:flex">
                  <Navigation className="w-4 h-4 text-black stroke-[2.5]" />
                  <span className="clay-sidebar-title">NAVIGASI</span>
                  <span className="clay-sidebar-subtitle">LOKASI CEPAT</span>
                </div>

                <div className="clay-sidebar-nav flex-row md:flex-col custom-scrollbar overflow-x-auto md:overflow-y-auto flex-1 p-1.5 md:p-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleCenterPlayer}
                    className="clay-sidebar-btn clay-sidebar-btn-active min-w-[72px] md:min-w-0"
                    title="Pusatkan kamera ke posisi karakter kamu"
                  >
                    <Crosshair className="w-5 h-5 stroke-[2.5] shrink-0" />
                    <span className="text-[9px] md:text-[10px]">Posisi Saya</span>
                  </button>

                  {WORLD_POIS.map((poi) => {
                    const isSelected = customMarker && customMarker.x === poi.x && customMarker.y === poi.y;
                    return (
                      <button
                        key={poi.name}
                        type="button"
                        onClick={() => handleSelectPoi(poi)}
                        className={`clay-sidebar-btn min-w-[72px] md:min-w-0 ${
                          isSelected ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
                        }`}
                        title={`Bidik ke ${poi.name} (${poi.x}, ${poi.y})`}
                      >
                        <span className="text-lg leading-none">{poi.icon}</span>
                        <span className="text-[9px] md:text-[10px] leading-tight truncate max-w-[80px]">
                          {poi.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="clay-sidebar-footer hidden md:flex">
                  <span className="clay-badge-neutral text-[9px] font-bold text-center py-0.5">
                    RADEN MAP
                  </span>
                </div>
              </aside>

              {/* MAIN AREA PETA & TOOLBAR */}
              <div className="clay-main-pane flex-1 min-w-0 flex flex-col p-2.5 sm:p-3.5 gap-2 overflow-y-auto custom-scrollbar">
                {/* Toolbar Navigasi & Zoom */}
                <div className="clay-card flex flex-wrap items-center justify-between gap-2 w-full px-2.5 py-1.5 text-xs shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-black">Skala:</span>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={mapZoom <= 1}
                      className="clay-btn-neutral p-1 text-black"
                      style={{ borderRadius: '6px' }}
                      title="Zoom Out (-)"
                    >
                      <ZoomOut className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="clay-badge-primary font-bold text-black text-[10px] px-2 py-0.5 min-w-[46px] text-center">
                      {Math.round(mapZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={mapZoom >= 4}
                      className="clay-btn-neutral p-1 text-black"
                      style={{ borderRadius: '6px' }}
                      title="Zoom In (+)"
                    >
                      <ZoomIn className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="clay-btn-secondary px-2 py-1 text-[10px] font-bold text-black flex items-center gap-1"
                      style={{ borderRadius: '6px' }}
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowGridOverlay(!showGridOverlay)}
                      className={`px-2 py-1 text-[10px] font-bold flex items-center gap-1 text-black ${
                        showGridOverlay ? 'clay-btn-primary' : 'clay-btn-neutral'
                      }`}
                      style={{ borderRadius: '6px' }}
                    >
                      <Grid className="w-3 h-3 stroke-[2.5]" />
                      <span>Grid</span>
                    </button>

                    {customMarker && (
                      <button
                        type="button"
                        onClick={handleClearMarker}
                        className="clay-btn-secondary px-2 py-1 text-[10px] font-bold text-black flex items-center gap-1"
                        style={{ borderRadius: '6px' }}
                        title="Hapus Tanda Waypoint"
                      >
                        <Trash2 className="w-3 h-3 stroke-[2.5]" />
                        <span>Hapus Pin</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Viewport Peta dengan Pan Mouse + Touch & Zoom */}
                <div
                  className={`w-full aspect-[4/3] sm:aspect-[16/10] max-h-[52dvh] bg-[#001026] border-2 border-[#5C3A21] rounded-xl relative overflow-hidden select-none shrink-0 ${
                    mapZoom > 1 ? (isDraggingMap ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
                  }`}
                  onMouseDown={handleMapMouseDown}
                  onMouseMove={handleMapMouseMove}
                  onMouseUp={handleMapMouseUp}
                  onMouseLeave={handleMapMouseUp}
                  onTouchStart={handleMapTouchStart}
                  onTouchMove={handleMapTouchMove}
                  onTouchEnd={handleMapTouchEnd}
                  onWheel={handleMapWheel}
                >
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
                      className="w-full h-full"
                    />
                  </div>

                  {/* Kompas Mata Angin */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 clay-badge-neutral px-2 py-0 text-[10px] font-bold text-black pointer-events-none">
                    U
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 clay-badge-neutral px-2 py-0 text-[10px] font-bold text-black pointer-events-none">
                    S
                  </div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 clay-badge-neutral px-2 py-0 text-[10px] font-bold text-black pointer-events-none">
                    B
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 clay-badge-neutral px-2 py-0 text-[10px] font-bold text-black pointer-events-none">
                    T
                  </div>
                </div>

                <div className="w-full flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold text-black px-1">
                  <span>📍 Ketuk langsung pada peta atau pilih dari sidebar untuk memasang pin tujuan</span>
                  <span>🖐️ Geser saat diperbesar (zoom) untuk menjelajahi peta</span>
                </div>

                {/* Legenda Peta */}
                <div className="clay-card grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 w-full text-[10px] text-black font-bold p-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#01ae01] border border-[#5C3A21] shrink-0" />
                    <span>Rumput</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#1e293b] border border-[#5C3A21] shrink-0" />
                    <span>Jalan Raya</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#94a3b8] border border-[#5C3A21] shrink-0" />
                    <span>Trotoar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#00a2f3] border border-[#5C3A21] shrink-0" />
                    <span>Lautan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#cbd5e1] border border-[#5C3A21] shrink-0" />
                    <span>Dermaga</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#b39962] border border-[#5C3A21] shrink-0" />
                    <span>Pantai</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 border border-[#5C3A21] shrink-0" />
                    <span>Pin Tujuan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FFAE6D] border border-[#5C3A21] shrink-0" />
                    <span>Posisi Kamu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DAFTAR PEMAIN DI SERVER */}
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
