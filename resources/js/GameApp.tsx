/**
 * ============================================================================
 * FILE: resources/js/GameApp.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen utama React yang mengatur siklus hidup tampilan game:
 * 1. Home Screen (Beranda Utama Interaktif dengan 4 Tombol Menu di Sebelah Kiri).
 * 2. In-Game State (Phaser 3 Canvas, House Scene / World Scene, HUD, ChatBox, Virtual Controls).
 * 3. Modal Lemari Pakaian (Wardrobe) untuk mengganti avatar di dalam rumah.
 * 4. Mengatur konfigurasi GameSettings (Bahasa, Audio, Mode PC/Mobile).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HomeScreen } from './game/ui/HomeScreen';
import { HUD } from './game/ui/HUD';
import { ChatBox } from './game/ui/ChatBox';
import { ControlGuide } from './game/ui/ControlGuide';
import { VirtualControls } from './game/ui/VirtualControls';
import { SettingsModal, GameSettings } from './game/ui/SettingsModal';
import { WardrobeModal } from './game/ui/WardrobeModal';
import { ProfileModal } from './game/ui/ProfileModal';
import { ServerModal, IGameServerOption } from './game/ui/ServerModal';
import { TopUpModal } from './game/ui/TopUpModal';
import { FriendRequestNotification, IFriendRequest } from './game/ui/FriendRequestNotification';
import { DialogueBox } from './game/ui/DialogueBox';
import { LoadingScreen } from './game/ui/LoadingScreen';
import { CreatorStudioModal } from './game/ui/CreatorStudioModal';
import { SdSubjectsModal } from './game/ui/SdSubjectsModal';
import { SchoolGradeSelectModal } from './game/ui/SchoolGradeSelectModal';
import { SchoolSubjectsModal } from './game/ui/SchoolSubjectsModal';
import { FishingMinigame } from './game/ui/FishingMinigame';
import { Hotbar } from './game/ui/Hotbar';
import { InventoryModal } from './game/ui/InventoryModal';
import { calculateAgeFromBirthDate } from './game/ui/AuthModal';
import { SunbeamOverlay } from './game/ui/SunbeamOverlay';
import { EventBus } from './game/core/EventBus';
import { SoundManager } from './game/core/SoundManager';
import { NetworkManager } from './game/core/NetworkManager';
import { IAvatarCustomization, IChatMessage } from './game/types';
import { IFishData } from './game/controllers/CharacterController';
import { Zap } from 'lucide-react';
import { PoliceReportModal } from './game/ui/PoliceReportModal';
import { BankModal } from './game/ui/BankModal';
import { PharmacyModal } from './game/ui/PharmacyModal';
import { MarketRealtorModal } from './game/ui/MarketRealtorModal';

export const GameApp: React.FC = () => {
  // Check initial URL pathname
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isDirectInGame = initialPath.startsWith('/home') || initialPath.startsWith('/world') || initialPath.startsWith('/admin');

  // Screen state: 'home' (Lobby /) | 'playing' (Safe House, Open World, atau Portal Admin)
  const [gameState, setGameState] = useState<'home' | 'playing'>(isDirectInGame ? 'playing' : 'home');
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);

  // Game Settings State
  const [settings, setSettings] = useState<GameSettings>({
    language: 'id',
    masterVolume: 0.8,
    bgmVolume: 0.05, // 5% sesuai permintaan pengguna
    sfxVolume: 0.8,
    isMuted: false,
    controlMode: (() => {
      try {
        const s = localStorage.getItem('raden_game_settings');
        if (s) {
          const p = JSON.parse(s);
          if (p.controlMode) return p.controlMode;
        }
        const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        return isTouch ? 'mobile' : 'pc';
      } catch (e) {}
      return 'pc';
    })(),
  });

  const [inGameSettingsOpen, setInGameSettingsOpen] = useState(false);

  // Player & World State
  const [playerStats, setPlayerStats] = useState<{
    x: number;
    y: number;
    gridX?: number;
    gridY?: number;
    level?: number;
    hp?: number;
    maxHp?: number;
    name: string;
    avatar?: IAvatarCustomization;
    roomName?: string;
    inHouse?: boolean;
    privateRoomId?: string;
    role?: string;
    isSuperAdmin?: boolean;
    title?: string;
  }>({
    x: initialPath.startsWith('/world')
      ? (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_world') || ''); if (p?.x) return p.x; } catch (e) {} return 1380; })()
      : (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_house_safe-01') || ''); if (p?.x) return p.x; } catch (e) {} return 840; })(),
    y: initialPath.startsWith('/world')
      ? (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_world') || ''); if (p?.y) return p.y; } catch (e) {} return 960; })()
      : (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_house_safe-01') || ''); if (p?.y) return p.y; } catch (e) {} return 620; })(),
    gridX: initialPath.startsWith('/world') ? 11 : 7,
    gridY: initialPath.startsWith('/world') ? 8 : 5,
    level: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.is_super_admin || u.role === 'super_admin' || u.role === 'admin' || u.name?.toUpperCase() === 'RADEN' || u.email === 'radencakstudio@gmail.com') return 99999999999;
        if (typeof u.level === 'number') return u.level;
      } catch (e) {}
      return 1;
    })(),
    hp: 100,
    maxHp: 100,
    name: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name) return u.name;
      } catch (e) {}
      return 'Petualang';
    })(),
    roomName: initialPath.startsWith('/world') ? 'KAWASAN RESIDENSIAL: RUMAH PEMAIN & TAMAN' : 'RUMAH PRIBADI: RUANG UTAMA',
    inHouse: !initialPath.startsWith('/world'),
    privateRoomId: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.private_room_id) return u.private_room_id;
      } catch (e) {}
      return 'safe-01';
    })(),
    role: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.role) return u.role;
      } catch (e) {}
      return 'player';
    })(),
    isSuperAdmin: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.is_super_admin || u.role === 'super_admin' || u.role === 'admin' || u.name?.toUpperCase() === 'RADEN' || u.email === 'radencakstudio@gmail.com') return true;
      } catch (e) {}
      return false;
    })(),
    title: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.is_super_admin || u.role === 'super_admin' || u.role === 'admin' || u.name?.toUpperCase() === 'RADEN' || u.email === 'radencakstudio@gmail.com') return '👑 SUPER ADMIN';
        if (u.title) return u.title;
      } catch (e) {}
      return 'Petualang Pemula';
    })(),
  });

  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [serverCode, setServerCode] = useState(() => {
    try {
      const saved = localStorage.getItem('raden_server_code');
      if (!saved || saved.toUpperCase().includes('RADEN')) {
        const normalized = saved?.includes('02') ? 'Asia 2' : saved?.includes('ID') ? 'Asia 3' : saved?.includes('GLOBAL') ? 'Asia 4' : 'Asia 1';
        localStorage.setItem('raden_server_code', normalized);
        return normalized;
      }
      return saved;
    } catch (e) {
      return 'Asia 1';
    }
  });
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);

  // Listener event bus buka tas (dari tombol TAS mobile atau shortcut)
  useEffect(() => {
    const handleToggleBackpack = () => {
      setIsBackpackOpen((prev) => !prev);
    };
    EventBus.on('open-backpack', handleToggleBackpack);
    return () => {
      EventBus.off('open-backpack', handleToggleBackpack);
    };
  }, []);

  // Profile Attribute States
  const [playerBio, setPlayerBio] = useState<string>(() => {
    try {
      return localStorage.getItem('raden_player_bio') || 'Petualang penjelajah tanah agung RadenWorld.';
    } catch (e) {
      return 'Petualang penjelajah tanah agung RadenWorld.';
    }
  });
  const [playerExp, setPlayerExp] = useState<number>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return typeof u.exp === 'number' ? u.exp : 0;
    } catch (e) {
      return 0;
    }
  });
  const [playerBirthDate, setPlayerBirthDate] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return u.birth_date || '';
    } catch (e) {
      return '';
    }
  });

  const playerAge = useMemo(() => {
    if (playerBirthDate) {
      return calculateAgeFromBirthDate(playerBirthDate);
    }
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (u.birth_date) return calculateAgeFromBirthDate(u.birth_date);
    } catch (e) {}
    return 21;
  }, [playerBirthDate]);

  const isCurrentUserAdmin = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return Boolean(
        u.is_super_admin ||
        u.role === 'super_admin' ||
        u.role === 'admin' ||
        u.name?.toUpperCase() === 'RADEN' ||
        u.email === 'radencakstudio@gmail.com' ||
        playerStats?.isSuperAdmin ||
        playerStats?.role === 'admin' ||
        playerStats?.role === 'super_admin'
      );
    } catch (e) {
      return false;
    }
  }, [playerStats]);

  const [playerLikes, setPlayerLikes] = useState<number>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (
        u.role === 'admin' ||
        u.role === 'super_admin' ||
        u.is_super_admin === true ||
        u.email === 'radencakstudio@gmail.com' ||
        u.name?.toUpperCase() === 'RADEN'
      ) {
        return 99999999999;
      }
      if (typeof u.likes === 'number') return u.likes;
    } catch (e) {}
    return 0;
  });
  const [playerGold, setPlayerGold] = useState<number>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (
        u.role === 'admin' ||
        u.role === 'super_admin' ||
        u.is_super_admin === true ||
        u.email === 'radencakstudio@gmail.com' ||
        u.name?.toUpperCase() === 'RADEN'
      ) {
        return 99999999999;
      }
      if (typeof u.gold === 'number') return u.gold;
      if (typeof u.coins === 'number') return u.coins;
      const g = localStorage.getItem('raden_player_gold');
      if (g) return parseInt(g, 10);
    } catch (e) {}
    return 2500;
  });
  const [playerDiamonds, setPlayerDiamonds] = useState<number>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (
        u.role === 'admin' ||
        u.role === 'super_admin' ||
        u.is_super_admin === true ||
        u.email === 'radencakstudio@gmail.com' ||
        u.name?.toUpperCase() === 'RADEN'
      ) {
        return 99999999999;
      }
      if (typeof u.diamonds === 'number') return u.diamonds;
      const d = localStorage.getItem('raden_player_diamonds');
      if (d) return parseInt(d, 10);
    } catch (e) {}
    return 50;
  });
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Inspected Player (saat menekan/klik pemain lain di open world)
  const [inspectedPlayer, setInspectedPlayer] = useState<{
    id?: string | number;
    name: string;
    avatar?: IAvatarCustomization;
    level?: number;
    role?: string;
    bio?: string;
    isSuperAdmin?: boolean;
    gold?: number;
    diamonds?: number;
    likes?: number;
    has_liked_today?: boolean;
    location?: string;
    joined_at?: string;
    joinedAt?: string;
    title?: string;
    gender?: 'male' | 'female';
    friendsCount?: number;
    followingCount?: number;
    followersCount?: number;
    [key: string]: any;
  } | null>(null);

  // Friend & Follow System States (dengan penyimpanan lokal)
  const [friendsList, setFriendsList] = useState<string[]>(() => {
    try {
      const f = localStorage.getItem('raden_friends_list');
      if (f) return JSON.parse(f);
    } catch (e) {}
    return [];
  });
  const [followingList, setFollowingList] = useState<string[]>(() => {
    try {
      const f = localStorage.getItem('raden_following_list');
      if (f) return JSON.parse(f);
    } catch (e) {}
    return [];
  });
  const [followersList, setFollowersList] = useState<string[]>(() => {
    try {
      const f = localStorage.getItem('raden_followers_list');
      if (f) return JSON.parse(f);
    } catch (e) {}
    return [];
  });
  const [sentFriendRequests, setSentFriendRequests] = useState<string[]>([]);
  const [incomingFriendRequest, setIncomingFriendRequest] = useState<IFriendRequest | null>(null);

  // Wardrobe Modal State
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  // Panel Arsitek Pencipta (Tahta Agung Raden) State
  const [isCreatorStudioOpen, setIsCreatorStudioOpen] = useState(false);
  // Modal Mata Pelajaran Khusus Kelas SD (Legacy)
  const [isSdSubjectsOpen, setIsSdSubjectsOpen] = useState(false);
  const [sdDeskType, setSdDeskType] = useState<'guru' | 'siswa'>('guru');

  // Modal Pemilihan Kelas Sekolah (SD 1-6, SMP 1-3, SMA 1-3)
  const [isGradeSelectOpen, setIsGradeSelectOpen] = useState(false);
  const [gradeSelectSchoolType, setGradeSelectSchoolType] = useState<'sd' | 'smp' | 'sma'>('sd');
  const [gradeSelectReturnPos, setGradeSelectReturnPos] = useState<{ x: number; y: number } | null>(null);

  // Modal Mata Pelajaran Sekolah Lucu & Ceria (SD, SMP, SMA)
  const [isSchoolSubjectsOpen, setIsSchoolSubjectsOpen] = useState(false);
  const [schoolSubjectsType, setSchoolSubjectsType] = useState<'sd' | 'smp' | 'sma'>('sd');
  const [schoolSubjectsGrade, setSchoolSubjectsGrade] = useState<number>(1);
  const [schoolSubjectsDeskType, setSchoolSubjectsDeskType] = useState<'guru' | 'siswa'>('guru');

  // Modal Layanan Publik & Komersial Barat (Polisi, Bank, Apotek, Makelar)
  const [isPoliceModalOpen, setIsPoliceModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [isRealtorModalOpen, setIsRealtorModalOpen] = useState(false);
  // Minigame Memancing Interaktif Bergaya Stardew Valley
  const [fishingMinigameData, setFishingMinigameData] = useState<IFishData | null>(null);
  const [isFishingMinigameOpen, setIsFishingMinigameOpen] = useState(false);
  const [isFishBiting, setIsFishBiting] = useState(false);

  const [wardrobeAvatar, setWardrobeAvatar] = useState<IAvatarCustomization>(() => {
    try {
      const saved = localStorage.getItem('raden_player_avatar');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#f59e0b',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  });

  const sound = SoundManager.getInstance();

  // Sinkronisasi data sosial (Teman, Mengikuti, Diikuti) dari database Laravel
  useEffect(() => {
    const pName = (playerStats?.name || '').trim();
    if (pName && pName !== 'Petualang') {
      fetch(`/api/social/relations/${encodeURIComponent(pName)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (Array.isArray(data.friends)) {
              setFriendsList(data.friends);
              try { localStorage.setItem('raden_friends_list', JSON.stringify(data.friends)); } catch (e) {}
            }
            if (Array.isArray(data.following)) {
              setFollowingList(data.following);
              try { localStorage.setItem('raden_following_list', JSON.stringify(data.following)); } catch (e) {}
            }
            if (Array.isArray(data.followers)) {
              setFollowersList(data.followers);
              try { localStorage.setItem('raden_followers_list', JSON.stringify(data.followers)); } catch (e) {}
            }
          }
        })
        .catch(() => {});
    }
  }, [playerStats?.name]);

  // Sinkronisasi Saldo & Keamanan Akun Authoritative dari MySQL
  const fetchAuthoritativeWallet = useCallback(async () => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (!u.id && !u.email && !playerStats?.name) return;

      const res = await fetch('/api/user/wallet', {
        headers: {
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || '',
          'X-User-Name': u.name || playerStats?.name || '',
        },
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data.status === 'success' && data.wallet) {
        const w = data.wallet;
        const isAdmin = Boolean(
          u.role === 'admin' ||
          u.role === 'super_admin' ||
          u.is_super_admin === true ||
          u.email === 'radencakstudio@gmail.com' ||
          u.name?.toUpperCase() === 'RADEN'
        );

        if (!isAdmin) {
          if (typeof w.gold === 'number') {
            setPlayerGold(w.gold);
            localStorage.setItem('raden_player_gold', w.gold.toString());
          }
          if (typeof w.diamonds === 'number') {
            setPlayerDiamonds(w.diamonds);
            localStorage.setItem('raden_player_diamonds', w.diamonds.toString());
          }
        }

        // Update objek local user
        u.gold = w.gold;
        u.diamonds = w.diamonds;
        u.email_verified = Boolean(w.email_verified);
        u.email_verified_at = w.email_verified_at;
        u.google_linked = Boolean(w.google_linked);
        u.google_email = w.google_email;
        u.facebook_linked = Boolean(w.facebook_linked);
        u.facebook_email = w.facebook_email;
        localStorage.setItem('raden_player_user', JSON.stringify(u));
      }
    } catch (e) {
      console.warn('Gagal memuat saldo authoritative:', e);
    }
  }, [playerStats?.name]);

  // Transaksi Saldo Terproteksi Anti-Cheat Server
  const syncWalletWithServer = useCallback(async (deltaGold: number, deltaDiamonds: number, action: string) => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (!u.id && !u.email && !playerStats?.name) return;

      const res = await fetch('/api/user/wallet/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || '',
          'X-User-Name': u.name || playerStats?.name || '',
        },
        body: JSON.stringify({
          user_id: u.id,
          delta_gold: deltaGold,
          delta_diamonds: deltaDiamonds,
          action,
        }),
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data.status === 'success') {
        const isAdmin = Boolean(
          u.role === 'admin' ||
          u.role === 'super_admin' ||
          u.is_super_admin === true ||
          u.email === 'radencakstudio@gmail.com' ||
          u.name?.toUpperCase() === 'RADEN'
        );

        if (!isAdmin) {
          if (typeof data.gold === 'number') {
            setPlayerGold(data.gold);
            localStorage.setItem('raden_player_gold', data.gold.toString());
          }
          if (typeof data.diamonds === 'number') {
            setPlayerDiamonds(data.diamonds);
            localStorage.setItem('raden_player_diamonds', data.diamonds.toString());
          }
        }
        u.gold = data.gold;
        u.diamonds = data.diamonds;
        localStorage.setItem('raden_player_user', JSON.stringify(u));
      }
    } catch (e) {
      console.warn('Gagal sinkronisasi transaksi dompet:', e);
    }
  }, [playerStats?.name]);

  // Sinkronisasi wallet saat awal bermain atau saat nama user aktif berubah
  useEffect(() => {
    fetchAuthoritativeWallet();
  }, [fetchAuthoritativeWallet]);

  // Handle reward mancing disinkronkan ke MySQL authoritatif
  useEffect(() => {
    const handleFishingCaught = (data: { fish: any }) => {
      if (data?.fish) {
        const goldReward = data.fish.goldReward || 0;
        const diamondReward = data.fish.diamondReward || 0;
        syncWalletWithServer(goldReward, diamondReward, `catch_fish_${data.fish.name || 'fish'}`);
      }
    };
    EventBus.on('fishing-caught', handleFishingCaught);
    return () => {
      EventBus.off('fishing-caught', handleFishingCaught);
    };
  }, [syncWalletWithServer]);

  useEffect(() => {
    // 1. Stats updates from Phaser engine (X, Y, Name, Room)
    const handleStats = (stats: any) => {
      setPlayerStats((prev) => {
        const resolvedName = (stats.name && stats.name !== 'Petualang') ? stats.name : (prev.name || stats.name);
        if (
          prev.roomName === stats.roomName &&
          prev.gridX === stats.gridX &&
          prev.gridY === stats.gridY &&
          prev.hp === stats.hp &&
          prev.maxHp === stats.maxHp &&
          prev.inHouse === stats.inHouse &&
          prev.name === resolvedName
        ) {
          return prev;
        }
        return { ...prev, ...stats, name: resolvedName };
      });
      if (stats.avatar) {
        setWardrobeAvatar((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(stats.avatar)) return prev;
          return stats.avatar;
        });
      }
    };

    // 2. Interaction prompt updates from proximity detection
    const handlePrompt = (prompt: string | null) => {
      setInteractionPrompt(prompt);
    };

    // 3. New chat message received
    const handleChat = (msg: IChatMessage) => {
      setMessages((prev) => {
        if (!msg || !msg.text) return prev;
        // Mencegah duplikasi pesan jika ID sudah ada atau pesan identik dari pengirim yang sama
        if (prev.some((m) => m.id === msg.id || (m.senderName === msg.senderName && m.text === msg.text))) return prev;
        
        let formattedTime = msg.timestamp;
        if (typeof formattedTime === 'number' || (typeof formattedTime === 'string' && /^\d{10,14}$/.test(formattedTime))) {
          const d = new Date(Number(formattedTime));
          formattedTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }

        return [...prev.slice(-50), { ...msg, timestamp: formattedTime }];
      });
    };

    // 4. Open wardrobe event from Lemari in HouseScene
    const handleOpenWardrobe = (currentAv: IAvatarCustomization) => {
      if (currentAv) setWardrobeAvatar(currentAv);
      setIsWardrobeOpen(true);
    };

    // 5. URL change synced from door transitions
    const handleUrlChanged = (newUrl: string) => {
      setCurrentPath(newUrl);
    };

    // 6. Listen to browser Back/Forward navigation (History popstate)
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p);
      if (p === '/' || p === '') {
        setGameState('home');
      } else {
        setGameState('playing');
        if (p.startsWith('/world')) {
          const lowerP = p.toLowerCase();
          if (lowerP === '/world/sd' || lowerP === '/world/smp' || lowerP === '/world/sma') {
            const schoolType = lowerP.replace('/world/', '');
            EventBus.emit('switch-scene', { scene: 'SchoolScene', schoolType });
          } else if (lowerP === '/world/cafe') {
            EventBus.emit('switch-scene', { scene: 'CafeScene' });
          } else if (lowerP === '/world/perpustakaan' || lowerP === '/world/library') {
            EventBus.emit('switch-scene', { scene: 'LibraryScene' });
          } else {
            EventBus.emit('switch-scene', { scene: 'WorldScene' });
          }
        } else if (p.startsWith('/cafe')) {
          EventBus.emit('switch-scene', { scene: 'CafeScene' });
        } else if (p.startsWith('/perpustakaan') || p.startsWith('/library')) {
          EventBus.emit('switch-scene', { scene: 'LibraryScene' });
        } else if (p.startsWith('/home')) {
          const seg = p.replace('/home/', '').trim();
          EventBus.emit('switch-scene', { scene: 'HouseScene', privateRoomId: seg });
        } else if (p.startsWith('/admin')) {
          let isSuper = false;
          try {
            const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
            isSuper = u.role === 'super_admin' || u.is_super_admin || u.email === 'radencakstudio@gmail.com' || u.name?.toUpperCase() === 'RADEN' || playerStats.isSuperAdmin;
          } catch (e) {}

          if (!isSuper && !playerStats.isSuperAdmin && playerStats.name?.toUpperCase() !== 'RADEN') {
            alert('Akses Ditolak: Hanya Super Admin yang diizinkan mengakses Portal Admin!');
            window.history.replaceState(null, '', '/');
            setGameState('home');
          } else {
            const seg = p.replace('/admin/', '').trim() || 'raden-master-key';
            EventBus.emit('switch-scene', {
              scene: 'AdminPortalScene',
              adminToken: seg,
              name: playerStats.name,
              avatar: playerStats.avatar || wardrobeAvatar,
            });
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    EventBus.on('url-changed', handleUrlChanged);
    EventBus.on('player-stats-updated', handleStats);
    EventBus.on('interaction-prompt', handlePrompt);
    EventBus.on('new-chat-message', handleChat);
    EventBus.on('open-wardrobe', handleOpenWardrobe);

    const handleOpenCreatorStudio = () => {
      setIsCreatorStudioOpen(true);
    };
    EventBus.on('open-creator-studio', handleOpenCreatorStudio);

    const handlePlayerNameChanged = (newName: string) => {
      setPlayerStats((prev) => ({ ...prev, name: newName }));
      EventBus.emit('update-player-name', newName);
    };
    EventBus.on('player-name-changed', handlePlayerNameChanged);

    const handleInspectProfile = (target: any) => {
      const myName = (playerStats?.name || '').trim().toLowerCase();
      const targetName = (target?.name || '').trim().toLowerCase();
      if (target?.isMe || (myName && targetName && targetName === myName)) {
        setInspectedPlayer(null);
        setIsProfileOpen(true);
        return;
      }

      const pName = window.location.pathname.toLowerCase();
      const defaultLoc = pName.startsWith('/cafe')
        ? 'Cafe Raden Lounge'
        : (pName.startsWith('/perpustakaan') || pName.startsWith('/library'))
          ? 'Perpustakaan Kota'
          : pName.startsWith('/school')
            ? 'Gedung Sekolah'
            : pName.startsWith('/home')
              ? 'Rumah Pribadi'
              : 'Dunia Terbuka';

      const enriched = {
        ...target,
        location: target.location || defaultLoc,
      };

      setInspectedPlayer(enriched);
      setIsProfileOpen(true);

      // Sinkronisasi data asli profil dari API Laravel jika ada
      if (target?.name) {
        const rawMyName = (playerStats?.name || '').trim();
        fetch(`/api/auth/profile/${encodeURIComponent(target.name)}?viewer=${encodeURIComponent(rawMyName)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((dbProfile) => {
            if (dbProfile && dbProfile.name) {
              setInspectedPlayer((prev) => {
                if (!prev || prev.name?.toLowerCase() !== target.name.toLowerCase()) return prev;
                const isTargetSuper = dbProfile.is_super_admin || prev.isSuperAdmin;
                return {
                  ...prev,
                  ...dbProfile,
                  role: isTargetSuper ? 'super_admin' : (dbProfile.role || prev.role || 'player'),
                  isSuperAdmin: isTargetSuper,
                  level: isTargetSuper ? 99999999999 : (dbProfile.level || prev.level || 1),
                  title: isTargetSuper ? '👑 KREATOR & SUPER ADMIN' : (dbProfile.title || prev.title || 'Petualang'),
                  joinedAt: dbProfile.joined_at,
                  likes: typeof dbProfile.likes === 'number' ? dbProfile.likes : prev.likes,
                  has_liked_today: Boolean(dbProfile.has_liked_today),
                  friends_count: dbProfile.friends_count,
                  following_count: dbProfile.following_count,
                  followers_count: dbProfile.followers_count,
                  friendsCount: dbProfile.friends_count,
                  followingCount: dbProfile.following_count,
                  followersCount: dbProfile.followers_count,
                  is_following: Boolean(dbProfile.is_following),
                  is_follower: Boolean(dbProfile.is_follower),
                  is_friend: Boolean(dbProfile.is_friend),
                  avatar: dbProfile.avatar || prev.avatar,
                };
              });
            }
          })
          .catch(() => {});
      }
    };
    EventBus.on('inspect-player-profile', handleInspectProfile);
    EventBus.on('open-player-profile', handleInspectProfile);

    // Tangani event pembukaan modal Pemilihan Kelas sebelum masuk sekolah (SD, SMP, SMA)
    const handleOpenGradeSelect = (data: { schoolType: 'sd' | 'smp' | 'sma'; returnX?: number; returnY?: number }) => {
      sound.playOpenModal();
      setGradeSelectSchoolType(data?.schoolType || 'sd');
      if (typeof data?.returnX === 'number' && typeof data?.returnY === 'number') {
        setGradeSelectReturnPos({ x: data.returnX, y: data.returnY });
      } else {
        setGradeSelectReturnPos(null);
      }
      setIsGradeSelectOpen(true);
      EventBus.emit('dialogue-active', true);
    };
    EventBus.on('open-school-grade-select', handleOpenGradeSelect);

    // Tangani event pembukaan modal Mata Pelajaran Sekolah (SD, SMP, SMA) dari Meja Guru / Meja Siswa
    const handleOpenSchoolSubjects = (data?: { schoolType?: 'sd' | 'smp' | 'sma'; grade?: number; deskType?: 'guru' | 'siswa' }) => {
      sound.playOpenModal();
      const sType = data?.schoolType || 'sd';
      const sGrade = (typeof data?.grade === 'number' && data.grade >= 1) ? data.grade : (() => {
        try {
          const saved = localStorage.getItem(`raden_school_${sType}_grade`);
          return saved ? parseInt(saved, 10) : 1;
        } catch (e) {
          return 1;
        }
      })();
      setSchoolSubjectsType(sType);
      setSchoolSubjectsGrade(sGrade);
      setSchoolSubjectsDeskType(data?.deskType || 'guru');
      setIsSchoolSubjectsOpen(true);
      EventBus.emit('dialogue-active', true);
    };
    EventBus.on('open-school-subjects', handleOpenSchoolSubjects);

    // Tangani event pembukaan Minigame Memancing Interaktif Stardew Valley
    const handleOpenFishingMinigame = (data: { fish: IFishData }) => {
      if (data?.fish) {
        setIsFishBiting(false);
        sound.playOpenModal();
        setFishingMinigameData(data.fish);
        setIsFishingMinigameOpen(true);
      }
    };
    EventBus.on('open-fishing-minigame', handleOpenFishingMinigame);

    const handleFishBite = () => setIsFishBiting(true);
    const handleFishBiteEnd = () => setIsFishBiting(false);
    const handleFishStateChange = (state: string) => {
      if (state !== 'bite') setIsFishBiting(false);
    };

    EventBus.on('fishing-bite', handleFishBite);
    EventBus.on('fishing-ended', handleFishBiteEnd);
    EventBus.on('fishing-minigame-start', handleFishBiteEnd);
    EventBus.on('fishing-state-changed', handleFishStateChange);

    // Tangani event pembukaan modal Mata Pelajaran khusus SD dari Meja Guru / Meja Siswa (Legacy wrapper)
    const handleOpenSdSubjects = (data?: { deskType?: 'guru' | 'siswa' }) => {
      handleOpenSchoolSubjects({ schoolType: 'sd', grade: 1, deskType: data?.deskType || 'guru' });
    };
    EventBus.on('open-sd-subjects', handleOpenSdSubjects);

    // Tangani event pembukaan modal 4 Gedung Layanan & Komersial Barat
    const handleOpenPolice = () => {
      sound.playOpenModal();
      setIsPoliceModalOpen(true);
      EventBus.emit('dialogue-active', true);
    };
    const handleOpenBank = () => {
      sound.playOpenModal();
      setIsBankModalOpen(true);
      EventBus.emit('dialogue-active', true);
    };
    const handleOpenPharmacy = () => {
      sound.playOpenModal();
      setIsPharmacyModalOpen(true);
      EventBus.emit('dialogue-active', true);
    };
    const handleOpenRealtor = () => {
      sound.playOpenModal();
      setIsRealtorModalOpen(true);
      EventBus.emit('dialogue-active', true);
    };

    EventBus.on('open-police-modal', handleOpenPolice);
    EventBus.on('open-bank-modal', handleOpenBank);
    EventBus.on('open-pharmacy-modal', handleOpenPharmacy);
    EventBus.on('open-realtor-modal', handleOpenRealtor);

    const handleIncomingFriend = (req: IFriendRequest) => {
      console.log('[GameApp] Notifikasi permintaan pertemanan diterima:', req);
      setIncomingFriendRequest(req);
    };

    const handleFriendResponse = (data: { fromId: string; fromName: string; accepted: boolean }) => {
      console.log('[GameApp] Respon pertemanan diterima:', data);
      if (data.accepted) {
        sound.playSuccess();
        setFriendsList((prev) => {
          const next = Array.from(new Set([...prev, data.fromName]));
          try { localStorage.setItem('raden_friends_list', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        EventBus.emit('new-chat-message', {
          id: `fr_acc_${Date.now()}`,
          sender: 'SISTEM',
          text: `🎉 Permintaan pertemanan diterima! Kamu dan ${data.fromName} sekarang berteman!`,
          timestamp: Date.now(),
          isSystem: true,
        });
      } else {
        sound.playClick();
        setFollowingList((prev) => {
          const next = Array.from(new Set([...prev, data.fromName]));
          try { localStorage.setItem('raden_following_list', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        EventBus.emit('new-chat-message', {
          id: `fr_rej_${Date.now()}`,
          sender: 'SISTEM',
          text: `🤝 Permintaan tidak diterima / waktu habis. Kamu sekarang mengikuti ${data.fromName}.`,
          timestamp: Date.now(),
          isSystem: true,
        });
      }
    };

    NetworkManager.getInstance().onFriendRequest(handleIncomingFriend);
    NetworkManager.getInstance().onFriendResponse(handleFriendResponse);
    EventBus.on('incoming-friend-request', handleIncomingFriend);
    EventBus.on('friend-response-result', handleFriendResponse);

    const handleFollowedBy = (data: { followerId: string; followerName: string; followerAvatar?: any }) => {
      sound.playSuccess();
      setFollowersList((prev) => {
        const next = Array.from(new Set([...prev, data.followerName]));
        try { localStorage.setItem('raden_followers_list', JSON.stringify(next)); } catch (e) {}
        return next;
      });

      setFollowingList((currentFollowing) => {
        if (currentFollowing.includes(data.followerName)) {
          setFriendsList((prevFriends) => {
            const nextFriends = Array.from(new Set([...prevFriends, data.followerName]));
            try { localStorage.setItem('raden_friends_list', JSON.stringify(nextFriends)); } catch (e) {}
            return nextFriends;
          });
          EventBus.emit('new-chat-message', {
            id: `mutual_${Date.now()}`,
            sender: 'SISTEM',
            text: `🎉 ${data.followerName} mengikuti kamu balik! Kini kalian resmi berteman (saling mengikuti)!`,
            timestamp: Date.now(),
            isSystem: true,
          });
        } else {
          EventBus.emit('new-chat-message', {
            id: `follow_${Date.now()}`,
            sender: 'SISTEM',
            text: `👀 ${data.followerName} mulai mengikuti kamu. Ikuti balik untuk menjadi Teman!`,
            timestamp: Date.now(),
            isSystem: true,
          });
        }
        return currentFollowing;
      });
    };

    const handleUnfollowedBy = (data: { followerName: string }) => {
      setFollowersList((prev) => {
        const next = prev.filter((n) => n !== data.followerName);
        try { localStorage.setItem('raden_followers_list', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      setFriendsList((prev) => {
        const next = prev.filter((n) => n !== data.followerName);
        try { localStorage.setItem('raden_friends_list', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    };

    NetworkManager.getInstance().onFollowedBy(handleFollowedBy);
    NetworkManager.getInstance().onUnfollowedBy(handleUnfollowedBy);
    EventBus.on('player-followed-by', handleFollowedBy);
    EventBus.on('player-unfollowed-by', handleUnfollowedBy);

    // If opened directly with /home/{id}, /world, atau /admin/{token}
    if (isDirectInGame) {
      let playerName = 'Petualang';
      let playerAvatar = wardrobeAvatar;
      let safeId = 'safe-01';
      let role = 'player';
      let isSuperAdmin = false;
      let level = 1;
      let title = 'Petualang Pemula';

      try {
        const savedUser = localStorage.getItem('raden_player_user');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          if (u.name) playerName = u.name;
          if (u.avatar && typeof u.avatar === 'object') playerAvatar = u.avatar;
          if (u.private_room_id) safeId = u.private_room_id;
          if (u.role === 'super_admin' || u.is_super_admin || u.email === 'radencakstudio@gmail.com' || u.name?.toUpperCase() === 'RADEN') {
            role = 'super_admin';
            isSuperAdmin = true;
            level = 99;
            title = '👑 SUPER ADMIN';
          }
        }
      } catch (e) {}

      // Validasi keamanan: Cegah user biasa mengakses route /admin
      if (initialPath.startsWith('/admin') && !isSuperAdmin) {
        alert('Akses Ditolak: Portal Admin hanya dapat diakses oleh Super Admin!');
        window.history.replaceState(null, '', '/');
        setGameState('home');
        return;
      }

      let adminToken = 'raden-master-key';
      if (initialPath.startsWith('/admin/')) {
        const seg = initialPath.replace('/admin/', '').trim();
        if (seg) adminToken = seg;
      }
      const isAdminPath = initialPath.startsWith('/admin');

      if (initialPath.startsWith('/home/')) {
        const seg = initialPath.replace('/home/', '').trim();
        if (seg) safeId = seg;
      }

      setPlayerStats({
        x: isAdminPath ? 640 : (initialPath.startsWith('/world') ? 4800 : 840),
        y: isAdminPath ? 560 : (initialPath.startsWith('/world') ? 4800 : 620),
        gridX: isAdminPath ? 10 : (initialPath.startsWith('/world') ? 40 : 7),
        gridY: isAdminPath ? 8 : (initialPath.startsWith('/world') ? 40 : 5),
        level: level,
        name: playerName,
        avatar: playerAvatar,
        role: role,
        isSuperAdmin: isSuperAdmin,
        title: title,
        roomName: isAdminPath
          ? `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${adminToken})`
          : (initialPath.startsWith('/world')
            ? 'SANCTUARY CENTRAL PLAZA'
            : `RUMAH PRIBADI: RUANG UTAMA (SAFE: ${safeId})`),
        inHouse: !initialPath.startsWith('/world') && !isAdminPath,
        privateRoomId: safeId,
      });

      const timer = setTimeout(() => {
        if (isAdminPath) {
          EventBus.emit('switch-scene', { scene: 'AdminPortalScene', adminToken });
        } else {
          EventBus.emit('join-game', {
            name: playerName,
            avatar: playerAvatar,
            privateRoomId: safeId,
            role,
            isSuperAdmin,
          });
        }
      }, 600);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('popstate', handlePopState);
        EventBus.off('url-changed', handleUrlChanged);
        EventBus.off('player-stats-updated', handleStats);
        EventBus.off('interaction-prompt', handlePrompt);
        EventBus.off('new-chat-message', handleChat);
        EventBus.off('inspect-player-profile', handleInspectProfile);
        EventBus.off('open-player-profile', handleInspectProfile);
        EventBus.off('player-followed-by', handleFollowedBy);
        EventBus.off('player-unfollowed-by', handleUnfollowedBy);
      };
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      EventBus.off('url-changed', handleUrlChanged);
      EventBus.off('player-stats-updated', handleStats);
      EventBus.off('interaction-prompt', handlePrompt);
      EventBus.off('new-chat-message', handleChat);
      EventBus.off('inspect-player-profile', handleInspectProfile);
      EventBus.off('open-player-profile', handleInspectProfile);
      EventBus.off('player-followed-by', handleFollowedBy);
      EventBus.off('player-unfollowed-by', handleUnfollowedBy);
      EventBus.off('open-wardrobe', handleOpenWardrobe);
      EventBus.off('open-creator-studio', handleOpenCreatorStudio);
      EventBus.off('player-name-changed', handlePlayerNameChanged);
      EventBus.off('open-school-grade-select', handleOpenGradeSelect);
      EventBus.off('open-school-subjects', handleOpenSchoolSubjects);
      EventBus.off('open-fishing-minigame', handleOpenFishingMinigame);
      EventBus.off('fishing-bite', handleFishBite);
      EventBus.off('fishing-ended', handleFishBiteEnd);
      EventBus.off('fishing-minigame-start', handleFishBiteEnd);
      EventBus.off('fishing-state-changed', handleFishStateChange);
      EventBus.off('open-sd-subjects', handleOpenSdSubjects);
      EventBus.off('incoming-friend-request', handleIncomingFriend);
      EventBus.off('friend-response-result', handleFriendResponse);
      EventBus.off('open-police-modal', handleOpenPolice);
      EventBus.off('open-bank-modal', handleOpenBank);
      EventBus.off('open-pharmacy-modal', handleOpenPharmacy);
      EventBus.off('open-realtor-modal', handleOpenRealtor);
    };
  }, []);

  // Memulai Musik Latar (BGM) Resmi RadenWorld secara otomatis
  useEffect(() => {
    sound.playBGM();
  }, []);

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    sound.setVolume(newSettings.masterVolume, newSettings.sfxVolume, newSettings.bgmVolume);
    sound.setMuted(newSettings.isMuted);
  };

  // Friend Request Handlers
  const handleAddFriend = (targetId: string, targetName: string) => {
    sound.playClick();
    NetworkManager.getInstance().sendFriendRequest(targetId, targetName);
    setSentFriendRequests((prev) => [...prev, targetId]);
    EventBus.emit('new-chat-message', {
      id: `fr_sent_${Date.now()}`,
      sender: 'SISTEM',
      text: `📨 Permintaan pertemanan dikirim ke ${targetName}. Menunggu respon...`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  const handleAcceptFriendRequest = (req: IFriendRequest) => {
    sound.playSuccess();
    NetworkManager.getInstance().sendFriendResponse(req.fromId, true, req.fromName);
    setFriendsList((prev) => {
      const next = Array.from(new Set([...prev, req.fromName]));
      try { localStorage.setItem('raden_friends_list', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    setIncomingFriendRequest(null);
    EventBus.emit('new-chat-message', {
      id: `fr_acc_self_${Date.now()}`,
      sender: 'SISTEM',
      text: `🎉 Kamu dan ${req.fromName} sekarang resmi berteman!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  const handleRejectFriendRequest = (req: IFriendRequest, isTimeout = false) => {
    sound.playClick();
    NetworkManager.getInstance().sendFriendResponse(req.fromId, false, req.fromName);
    // Jika ditolak atau waktu 1 menit habis tanpa respon: pemohon otomatis menjadi pengikut (follower)
    setFollowersList((prev) => {
      const next = Array.from(new Set([...prev, req.fromName]));
      try { localStorage.setItem('raden_followers_list', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    setIncomingFriendRequest(null);
    EventBus.emit('new-chat-message', {
      id: `fr_timeout_${Date.now()}`,
      sender: 'SISTEM',
      text: isTimeout
        ? `⏱️ Waktu respon 1 menit habis. ${req.fromName} sekarang menjadi pengikut kamu.`
        : `🤝 Permintaan ditolak. ${req.fromName} sekarang menjadi pengikut kamu.`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  // Follow & Unfollow Handler (Terhubung Langsung ke Database Laravel)
  const handleFollowToggle = (targetName: string, targetId?: string | number) => {
    sound.playClick();
    const myName = (playerStats?.name || '').trim();
    const isCurrentlyFollowing = followingList.includes(targetName);

    if (isCurrentlyFollowing) {
      // Unfollow
      const nextFollowing = followingList.filter((n) => n !== targetName);
      setFollowingList(nextFollowing);
      try { localStorage.setItem('raden_following_list', JSON.stringify(nextFollowing)); } catch (e) {}

      // Jika sebelumnya mutual friends, maka status berteman gugur
      const nextFriends = friendsList.filter((n) => n !== targetName);
      setFriendsList(nextFriends);
      try { localStorage.setItem('raden_friends_list', JSON.stringify(nextFriends)); } catch (e) {}

      setInspectedPlayer((prev) => {
        if (!prev || prev.name?.toLowerCase() !== targetName.toLowerCase()) return prev;
        const curFollowers = typeof prev.followers_count === 'number' ? prev.followers_count : (typeof prev.followersCount === 'number' ? prev.followersCount : 1);
        const curFriends = typeof prev.friends_count === 'number' ? prev.friends_count : (typeof prev.friendsCount === 'number' ? prev.friendsCount : 1);
        return {
          ...prev,
          is_following: false,
          is_friend: false,
          followers_count: Math.max(0, curFollowers - 1),
          followersCount: Math.max(0, curFollowers - 1),
          friends_count: prev.is_friend ? Math.max(0, curFriends - 1) : curFriends,
          friendsCount: prev.is_friend ? Math.max(0, curFriends - 1) : curFriends,
        };
      });

      if (myName) {
        fetch('/api/social/unfollow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ sender_name: myName, target_name: targetName }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.sender_counts) {
              setFollowingList(data.sender_counts.following || []);
              setFriendsList(data.sender_counts.friends || []);
            }
          })
          .catch(() => {});
      }

      NetworkManager.getInstance().sendUnfollow(targetId ? String(targetId) : undefined, targetName);

      EventBus.emit('new-chat-message', {
        id: `unfollow_${Date.now()}`,
        sender: 'SISTEM',
        text: `Kamu telah berhenti mengikuti ${targetName}.`,
        timestamp: Date.now(),
        isSystem: true,
      });
    } else {
      // Follow
      const nextFollowing = Array.from(new Set([...followingList, targetName]));
      setFollowingList(nextFollowing);
      try { localStorage.setItem('raden_following_list', JSON.stringify(nextFollowing)); } catch (e) {}

      // Cek apakah target sudah mengikuti kita (Mutual Follow = TEMAN!)
      const isMutual = followersList.includes(targetName);
      if (isMutual) {
        sound.playSuccess();
        const nextFriends = Array.from(new Set([...friendsList, targetName]));
        setFriendsList(nextFriends);
        try { localStorage.setItem('raden_friends_list', JSON.stringify(nextFriends)); } catch (e) {}
      }

      setInspectedPlayer((prev) => {
        if (!prev || prev.name?.toLowerCase() !== targetName.toLowerCase()) return prev;
        const curFollowers = typeof prev.followers_count === 'number' ? prev.followers_count : (typeof prev.followersCount === 'number' ? prev.followersCount : 0);
        const curFriends = typeof prev.friends_count === 'number' ? prev.friends_count : (typeof prev.friendsCount === 'number' ? prev.friendsCount : 0);
        return {
          ...prev,
          is_following: true,
          is_friend: isMutual,
          followers_count: curFollowers + 1,
          followersCount: curFollowers + 1,
          friends_count: isMutual ? curFriends + 1 : curFriends,
          friendsCount: isMutual ? curFriends + 1 : curFriends,
        };
      });

      if (myName) {
        fetch('/api/social/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ sender_name: myName, target_name: targetName }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.sender_counts) {
              setFollowingList(data.sender_counts.following || []);
              setFriendsList(data.sender_counts.friends || []);
            }
          })
          .catch(() => {});
      }

      NetworkManager.getInstance().sendFollow(targetId ? String(targetId) : undefined, targetName);

      if (isMutual) {
        EventBus.emit('new-chat-message', {
          id: `mutual_${Date.now()}`,
          sender: 'SISTEM',
          text: `🎉 Luar biasa! Kamu dan ${targetName} saling mengikuti dan kini resmi menjadi TEMAN!`,
          timestamp: Date.now(),
          isSystem: true,
        });
      } else {
        EventBus.emit('new-chat-message', {
          id: `follow_${Date.now()}`,
          sender: 'SISTEM',
          text: `👀 Kamu sekarang mengikuti ${targetName}. Jika dia mengikutimu balik, kalian otomatis menjadi Teman!`,
          timestamp: Date.now(),
          isSystem: true,
        });
      }
    }
  };

  // Hapus Pengikut Handler (Terhubung ke Database)
  const handleRemoveFollower = (followerName: string) => {
    sound.playClick();
    const myName = (playerStats?.name || '').trim();
    const nextFollowers = followersList.filter((n) => n !== followerName);
    setFollowersList(nextFollowers);
    try { localStorage.setItem('raden_followers_list', JSON.stringify(nextFollowers)); } catch (e) {}

    const nextFriends = friendsList.filter((n) => n !== followerName);
    setFriendsList(nextFriends);
    try { localStorage.setItem('raden_friends_list', JSON.stringify(nextFriends)); } catch (e) {}

    if (myName) {
      fetch('/api/social/remove-follower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ user_name: myName, follower_name: followerName }),
      }).catch(() => {});
    }

    EventBus.emit('new-chat-message', {
      id: `rem_fol_${Date.now()}`,
      sender: 'SISTEM',
      text: `${followerName} telah dihapus dari daftar pengikut.`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  // Hapus Teman Handler (Terhubung ke Database)
  const handleRemoveFriend = (friendName: string) => {
    sound.playClick();
    handleFollowToggle(friendName);
  };

  // Top Up Berlian Handler
  const handleSuccessTopUp = (addedDiamonds: number) => {
    syncWalletWithServer(0, addedDiamonds, 'topup_purchase');
    setPlayerDiamonds((prev) => {
      const next = prev + addedDiamonds;
      try {
        localStorage.setItem('raden_player_diamonds', next.toString());
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        u.diamonds = next;
        localStorage.setItem('raden_player_user', JSON.stringify(u));
      } catch (e) {}
      return next;
    });
    EventBus.emit('new-chat-message', {
      id: `topup_succ_${Date.now()}`,
      sender: 'SISTEM',
      text: `💎 Top Up Berhasil! +${addedDiamonds} Berlian telah masuk ke saldo terproteksi server!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingScreen(false);
  }, []);

  // Memulai game dari Home Screen (setelah Login / Kustomisasi Avatar)
  const handleStartGame = (name: string, avatar: IAvatarCustomization, privateRoomId?: string) => {
    // Tampilkan LoadingScreen animasi retro boy walking to girl saat masuk bermain
    setIsLoadingScreen(true);

    let isSuperAdmin = name.toUpperCase() === 'RADEN';
    let role = isSuperAdmin ? 'super_admin' : 'player';
    let level = isSuperAdmin ? 99 : 1;
    let title = isSuperAdmin ? '👑 SUPER ADMIN' : 'Petualang Pemula';

    try {
      const savedUser = localStorage.getItem('raden_player_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.birth_date) {
          setPlayerBirthDate(u.birth_date);
        }
        if (u.role === 'super_admin' || u.is_super_admin || u.email === 'radencakstudio@gmail.com' || u.name?.toUpperCase() === 'RADEN') {
          isSuperAdmin = true;
          role = 'super_admin';
          level = 99;
          title = '👑 SUPER ADMIN';
        }
      }
    } catch (e) {}

    const safeRoomId = privateRoomId || (isSuperAdmin ? 'safe-raden-admin' : `safe-${Date.now().toString(36)}`);
    const worldPath = '/world';
    if (window.location.pathname !== worldPath) {
      window.history.pushState(null, '', worldPath);
    }
    setCurrentPath(worldPath);
    setGameState('playing');
    setWardrobeAvatar(avatar);
    setPlayerStats((prev) => ({
      ...prev,
      name,
      avatar,
      level,
      role,
      isSuperAdmin,
      title,
      x: 1380,
      y: 900,
      gridX: 11,
      gridY: 7,
      roomName: 'RADENWORLD OPEN REALMS',
      inHouse: false,
      privateRoomId: safeRoomId,
    }));
    EventBus.emit('switch-scene', {
      scene: 'WorldScene',
      name,
      avatar,
      privateRoomId: safeRoomId,
      spawnNearHouse: true,
      spawnPos: { x: 1380, y: 900 },
    });
    EventBus.emit('join-game', {
      name,
      avatar,
      privateRoomId: safeRoomId,
      role,
      isSuperAdmin,
      room: 'world',
    });
  };

  const handleSendMessage = (text: string) => {
    const trimmed = text ? text.trim() : '';
    if (!trimmed) return;

    const isSuper = Boolean(
      playerStats.isSuperAdmin ||
      playerStats.role === 'super_admin' ||
      playerStats.name?.toUpperCase() === 'RADEN'
    );
    const d = new Date();
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const myMsgId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const localMsg: IChatMessage = {
      id: myMsgId,
      senderId: NetworkManager.getInstance().getSocketId() || 'local_player',
      senderName: playerStats.name || 'Petualang',
      senderRole: playerStats.role || 'player',
      isSuperAdmin: isSuper,
      text: trimmed,
      timestamp: timeStr,
    };

    // 1. Optimistic Update: Langsung tambahkan ke riwayat pesan lokal agar seketika muncul
    setMessages((prev) => [...prev.slice(-50), localMsg]);

    // 2. Tampilkan balon kata di atas kepala karakter lokal di scene Phaser yang sedang berjalan
    EventBus.emit('send-chat', trimmed);

    // 3. Kirim paket obrolan ke server WebSocket multiplayer
    NetworkManager.getInstance().sendChat(trimmed, playerStats.name, playerStats.role, isSuper);
  };

  const handleTriggerInteraction = () => {
    sound.playClick();
    EventBus.emit('trigger-interaction');
  };

  // Teleportasi ke Portal Admin (Khusus Super Admin)
  const handleTeleportToAdminPortal = async () => {
    sound.playSuccess();
    let randomToken = `raden-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;

    try {
      const res = await fetch('/api/admin/portal/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerStats.name,
          email: 'radencakstudio@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.token) {
        randomToken = data.token;
      }
    } catch (e) {}

    const adminPath = `/admin/${randomToken}`;
    if (window.location.pathname !== adminPath) {
      window.history.pushState(null, '', adminPath);
    }
    setCurrentPath(adminPath);
    setIsProfileOpen(false);

    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      u.role = 'super_admin';
      u.is_super_admin = true;
      localStorage.setItem('raden_player_user', JSON.stringify(u));
    } catch (e) {}

    setPlayerStats((prev) => ({
      ...prev,
      x: 640,
      y: 560,
      gridX: 10,
      gridY: 8,
      level: 99,
      role: 'super_admin',
      isSuperAdmin: true,
      title: '👑 SUPER ADMIN',
      roomName: `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${randomToken})`,
      inHouse: false,
    }));

    EventBus.emit('switch-scene', {
      scene: 'AdminPortalScene',
      adminToken: randomToken,
      name: playerStats.name,
      avatar: playerStats.avatar || wardrobeAvatar,
    });
  };

  // Virtual Controls Handlers (Khusus Mode Mobile)
  const handleVirtualDirectionPress = (dir: 'up' | 'down' | 'left' | 'right') => {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };
    window.dispatchEvent(new KeyboardEvent('keydown', { key: keyMap[dir] }));
  };

  const handleVirtualDirectionRelease = () => {
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach((k) => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: k }));
    });
  };

  const handleVirtualAction = () => {
    handleTriggerInteraction();
  };

  // Fitur LOGOUT Akun
  const handleLogout = () => {
    sound.playClick();
    if (!confirm('Apakah kamu yakin ingin keluar / logout dari akun?')) return;
    try {
      localStorage.removeItem('raden_player_user');
      localStorage.removeItem('raden_player_avatar');
    } catch (e) {}

    NetworkManager.getInstance().disconnect();
    setIsProfileOpen(false);
    setGameState('home');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    setCurrentPath('/');
  };

  // EXP Passive Ticker: Bertambah otomatis seiring waktu saat aktif bermain di game
  useEffect(() => {
    if (gameState !== 'playing') return;

    const expInterval = setInterval(() => {
      if (playerStats.isSuperAdmin || playerStats.role === 'super_admin' || playerStats.name?.toUpperCase() === 'RADEN') {
        return;
      }

      setPlayerExp((prevExp) => {
        const currentLvl = playerStats.level || 1;
        const maxExp = currentLvl * 100;
        const newExp = prevExp + 5;

        if (newExp >= maxExp) {
          const nextLvl = currentLvl + 1;
          setPlayerStats((s) => ({ ...s, level: nextLvl }));
          sound.playSuccess();
          EventBus.emit('new-chat-message', {
            id: `lvlup_${Date.now()}`,
            sender: 'SISTEM',
            text: `🎉 Selamat! Kamu telah naik ke Level ${nextLvl}!`,
            timestamp: Date.now(),
            isSystem: true,
          });
          try {
            const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
            u.level = nextLvl;
            u.exp = 0;
            localStorage.setItem('raden_player_user', JSON.stringify(u));
          } catch (e) {}
          return 0;
        }

        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          u.exp = newExp;
          localStorage.setItem('raden_player_user', JSON.stringify(u));
        } catch (e) {}

        return newExp;
      });
    }, 4000);

    return () => clearInterval(expInterval);
  }, [gameState, playerStats.level, playerStats.isSuperAdmin, playerStats.role, playerStats.name]);

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] overflow-hidden bg-[#0a0f1d] font-['Chakra_Petch'] select-none">
      {/* 2D HTML5 Canvas Game Engine (Phaser 3) */}
      <GameCanvas />

      {/* Sinar Cahaya Mentari dari Atas Kiri Nyorot ke Tengah (Bebas Kotak & Kebal Zoom) */}
      {!isLoadingScreen && gameState === 'playing' && !playerStats.inHouse && (
        <SunbeamOverlay />
      )}

      {/* 0. LOADING SCREEN SESUAI GAMBAR (COWOK BERJALAN MENUJU KE CEWEK) */}
      {isLoadingScreen && (
        <LoadingScreen
          onComplete={handleLoadingComplete}
          serverCode={serverCode}
          minDisplayTimeMs={gameState === 'playing' ? 800 : 1200}
        />
      )}

      {/* 1. TAMPILAN BERANDA (HOME SCREEN INTERAKTIF MENU KIRI SESUAI GAMBAR) */}
      {!isLoadingScreen && gameState === 'home' && (
        <HomeScreen
          onStartGame={handleStartGame}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenServerModal={() => setIsServerModalOpen(true)}
        />
      )}

      {/* 2. TAMPILAN DALAM PERMAINAN (IN-GAME HUD, CHAT & HOUSE/WORLD SCENE) */}
      {gameState === 'playing' && (
        <>
          <HUD
            playerStats={playerStats}
            serverCode={serverCode}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onToggleGuide={() => setIsGuideOpen(true)}
            onOpenProfile={() => {
              setInspectedPlayer(null);
              setIsProfileOpen(true);
            }}
            onOpenSettings={() => setInGameSettingsOpen(true)}
            onOpenServerModal={() => setIsServerModalOpen(true)}
            isChatOpen={isChatOpen}
            interactionPrompt={interactionPrompt}
            onTriggerInteraction={handleTriggerInteraction}
            controlMode={settings.controlMode}
            gold={playerGold}
            diamonds={playerDiamonds}
            onOpenTopUp={() => setIsTopUpOpen(true)}
            friendsList={friendsList}
            onInspectPlayer={(p) => {
              EventBus.emit('inspect-player-profile', p);
            }}
            onAddFriend={(targetId, targetName) => handleAddFriend(targetId, targetName)}
          />

          {/* Mini Hotbar 6-Slot di Tengah Bawah Layar */}
          <Hotbar
            onOpenBackpack={() => setIsBackpackOpen(!isBackpackOpen)}
            isBackpackOpen={isBackpackOpen}
          />

          {/* Modal Tas Inventaris Lengkap 30 Slot (Buka dengan [B] atau klik tombol Tas) */}
          <InventoryModal
            isOpen={isBackpackOpen}
            onClose={() => setIsBackpackOpen(false)}
            gold={playerGold}
            diamonds={playerDiamonds}
            isAdmin={isCurrentUserAdmin}
          />

          {(() => {
            const isTargetAdmin = inspectedPlayer
              ? Boolean(
                  inspectedPlayer.isSuperAdmin ||
                  inspectedPlayer.role === 'super_admin' ||
                  inspectedPlayer.role === 'admin' ||
                  inspectedPlayer.name?.trim()?.toUpperCase() === 'RADEN'
                )
              : false;

            return (
              <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => {
                  setIsProfileOpen(false);
                  setInspectedPlayer(null);
                }}
                name={inspectedPlayer ? inspectedPlayer.name : (playerStats?.name || 'Petualang')}
                avatar={inspectedPlayer ? inspectedPlayer.avatar : (playerStats?.avatar || wardrobeAvatar)}
                level={
                  inspectedPlayer
                    ? (isTargetAdmin ? 99999999999 : (inspectedPlayer.level || 1))
                    : (isCurrentUserAdmin ? 99999999999 : (playerStats?.level || 1))
                }
                exp={
                  inspectedPlayer
                    ? (isTargetAdmin ? 99999999999 : (inspectedPlayer.exp || 0))
                    : playerExp
                }
                role={
                  inspectedPlayer
                    ? (isTargetAdmin ? 'super_admin' : (inspectedPlayer.role || 'player'))
                    : (isCurrentUserAdmin ? 'super_admin' : (playerStats?.role || 'player'))
                }
                isSuperAdmin={
                  inspectedPlayer
                    ? isTargetAdmin
                    : Boolean(isCurrentUserAdmin || playerStats?.isSuperAdmin)
                }
                title={
                  inspectedPlayer
                    ? (isTargetAdmin ? '👑 KREATOR & SUPER ADMIN' : (inspectedPlayer.title || 'Petualang'))
                    : (isCurrentUserAdmin || playerStats?.isSuperAdmin ? '👑 KREATOR & SUPER ADMIN' : (playerStats?.title || 'Petualang Pemula'))
                }
                gold={
                  inspectedPlayer
                    ? (isTargetAdmin ? 99999999999 : (typeof inspectedPlayer.gold === 'number' ? inspectedPlayer.gold : 2500))
                    : (isCurrentUserAdmin ? 99999999999 : playerGold)
                }
                diamonds={
                  inspectedPlayer
                    ? (isTargetAdmin ? 99999999999 : (typeof inspectedPlayer.diamonds === 'number' ? inspectedPlayer.diamonds : 50))
                    : (isCurrentUserAdmin ? 99999999999 : playerDiamonds)
                }
                age={inspectedPlayer ? (inspectedPlayer.age || 20) : playerAge}
                birthDate={inspectedPlayer ? (inspectedPlayer.birthDate || '') : playerBirthDate}
                likes={
                  inspectedPlayer
                    ? (isTargetAdmin ? 99999999999 : (typeof inspectedPlayer.likes === 'number' ? inspectedPlayer.likes : 0))
                    : (isCurrentUserAdmin ? 99999999999 : playerLikes)
                }
                gender={inspectedPlayer ? (inspectedPlayer.gender || inspectedPlayer.avatar?.gender || 'male') : wardrobeAvatar.gender}
                description={inspectedPlayer ? (inspectedPlayer.bio || inspectedPlayer.description || 'Petualang penjelajah RadenWorld.') : playerBio}
                onSaveDescription={inspectedPlayer ? undefined : (d) => {
                  setPlayerBio(d);
                  try {
                    localStorage.setItem('raden_player_bio', d);
                  } catch (e) {}
                }}
                friendsList={inspectedPlayer ? [] : friendsList}
                followingList={inspectedPlayer ? [] : followingList}
                followersList={inspectedPlayer ? [] : followersList}
                friendsCount={
                  inspectedPlayer
                    ? (typeof inspectedPlayer.friends_count === 'number'
                        ? inspectedPlayer.friends_count
                        : (typeof inspectedPlayer.friendsCount === 'number' ? inspectedPlayer.friendsCount : 0))
                    : friendsList.length
                }
                followingCount={
                  inspectedPlayer
                    ? (typeof inspectedPlayer.following_count === 'number'
                        ? inspectedPlayer.following_count
                        : (typeof inspectedPlayer.followingCount === 'number' ? inspectedPlayer.followingCount : 0))
                    : followingList.length
                }
                followersCount={
                  inspectedPlayer
                    ? (typeof inspectedPlayer.followers_count === 'number'
                        ? inspectedPlayer.followers_count
                        : (typeof inspectedPlayer.followersCount === 'number' ? inspectedPlayer.followersCount : 0))
                    : followersList.length
                }
                isInspecting={!!inspectedPlayer}
                playerId={inspectedPlayer?.id}
                location={inspectedPlayer?.location}
                joinedAt={inspectedPlayer?.joined_at || inspectedPlayer?.joinedAt}
                currentUserName={playerStats?.name || 'Petualang'}
                hasLikedToday={Boolean(inspectedPlayer?.has_liked_today)}
                onLikePlayer={(targetName) => {
                  setInspectedPlayer((prev) => {
                    if (!prev) return prev;
                    const cur = typeof prev.likes === 'number' ? prev.likes : 0;
                    return { ...prev, likes: cur + 1, has_liked_today: true };
                  });
                }}
                isFriend={
                  inspectedPlayer
                    ? Boolean(inspectedPlayer.is_friend || (friendsList.includes(inspectedPlayer.name) && followingList.includes(inspectedPlayer.name)))
                    : false
                }
                isFollowing={
                  inspectedPlayer
                    ? Boolean(inspectedPlayer.is_following || followingList.includes(inspectedPlayer.name))
                    : false
                }
                isFollower={
                  inspectedPlayer
                    ? Boolean(inspectedPlayer.is_follower || followersList.includes(inspectedPlayer.name))
                    : false
                }
                isFriendRequested={inspectedPlayer ? sentFriendRequests.includes(String(inspectedPlayer.id || '')) : false}
                onAddFriend={inspectedPlayer ? () => handleAddFriend(String(inspectedPlayer.id || ''), inspectedPlayer.name) : undefined}
                onFollowToggle={handleFollowToggle}
                onRemoveFollower={handleRemoveFollower}
                onRemoveFriend={handleRemoveFriend}
                onInspectOtherPlayer={(target) => {
                  EventBus.emit('inspect-player-profile', target);
                }}
                onWhisper={(targetName) => {
                  setIsProfileOpen(false);
                  setIsChatOpen(true);
                  EventBus.emit('chat-prefill', `@${targetName} `);
                }}
                onLogout={inspectedPlayer ? undefined : handleLogout}
                onTeleportToAdminPortal={inspectedPlayer ? undefined : handleTeleportToAdminPortal}
                onOpenTopUp={inspectedPlayer ? undefined : () => setIsTopUpOpen(true)}
                email={
                  inspectedPlayer
                    ? undefined
                    : (() => {
                        try {
                          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                          return u.email || '';
                        } catch (e) {
                          return '';
                        }
                      })()
                }
                emailVerified={
                  inspectedPlayer
                    ? undefined
                    : (() => {
                        try {
                          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                          return Boolean(u.email_verified || u.email_verified_at);
                        } catch (e) {
                          return false;
                        }
                      })()
                }
                googleLinked={
                  inspectedPlayer
                    ? undefined
                    : (() => {
                        try {
                          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                          return Boolean(u.google_linked || u.google_email || u.provider === 'google');
                        } catch (e) {
                          return false;
                        }
                      })()
                }
                googleEmail={
                  inspectedPlayer
                    ? undefined
                    : (() => {
                        try {
                          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                          return u.google_email || (u.provider === 'google' ? u.email : '');
                        } catch (e) {
                          return '';
                        }
                      })()
                }
                facebookLinked={
                  inspectedPlayer
                    ? undefined
                    : (() => {
                        try {
                          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                          return Boolean(u.facebook_linked || u.facebook_email || u.provider === 'facebook');
                        } catch (e) {
                          return false;
                        }
                      })()
                }
                facebookEmail={
                  inspectedPlayer
                    ? undefined
                    : (() => {
                        try {
                          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                          return u.facebook_email || (u.provider === 'facebook' ? u.email : '');
                        } catch (e) {
                          return '';
                        }
                      })()
                }
                onRefreshWallet={inspectedPlayer ? undefined : fetchAuthoritativeWallet}
                onUpdateName={inspectedPlayer ? undefined : (newName: string) => {
                  setPlayerStats((prev) => ({ ...prev, name: newName }));
                  EventBus.emit('update-player-name', newName);
                }}
              />
            );
          })()}

          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            gender={((playerStats?.avatar?.gender || wardrobeAvatar.gender) === 'female' ? 'female' : 'male')}
          />

          {/* Dialog Narasi NPC Bergaya RPG (Next, Before, Skip) */}
          <DialogueBox />

          <ControlGuide
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
            controlMode={settings.controlMode}
          />

          {/* Modal Lemari Pakaian (Ganti Ava di dalam Rumah) */}
          <WardrobeModal
            isOpen={isWardrobeOpen}
            onClose={() => setIsWardrobeOpen(false)}
            currentAvatar={wardrobeAvatar}
          />

          {/* Modal Panel Arsitek Pencipta (Tahta Agung Pencipta Raden) */}
          <CreatorStudioModal
            isOpen={isCreatorStudioOpen}
            onClose={() => setIsCreatorStudioOpen(false)}
          />

          {/* Modal Pemilihan Kelas Sekolah (Sebelum Masuk Gedung SD, SMP, SMA) */}
          <SchoolGradeSelectModal
            isOpen={isGradeSelectOpen}
            schoolType={gradeSelectSchoolType}
            onClose={() => {
              sound.playClick();
              setIsGradeSelectOpen(false);
              EventBus.emit('dialogue-active', false);
            }}
            onSelectGrade={(selectedGrade) => {
              setIsGradeSelectOpen(false);
              EventBus.emit('dialogue-active', false);
              try {
                localStorage.setItem(`raden_school_${gradeSelectSchoolType}_grade`, selectedGrade.toString());
              } catch (e) {}
              EventBus.emit('enter-school-with-grade', {
                schoolType: gradeSelectSchoolType,
                grade: selectedGrade,
                returnX: gradeSelectReturnPos?.x,
                returnY: gradeSelectReturnPos?.y,
              });
            }}
          />

          {/* Modal Mata Pelajaran Sekolah Lucu & Ceria (SD 1-6, SMP 1-3, SMA 1-3) */}
          <SchoolSubjectsModal
            isOpen={isSchoolSubjectsOpen}
            schoolType={schoolSubjectsType}
            grade={schoolSubjectsGrade}
            deskType={schoolSubjectsDeskType}
            onClose={() => {
              sound.playClick();
              setIsSchoolSubjectsOpen(false);
              EventBus.emit('dialogue-active', false);
            }}
            onStudySubject={(subjectName, expEarned) => {
              sound.playSuccess();
              setPlayerExp((prev) => {
                const next = prev + expEarned;
                try {
                  const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                  u.exp = next;
                  localStorage.setItem('raden_player_user', JSON.stringify(u));
                } catch (e) {}
                return next;
              });
              EventBus.emit('new-chat-message', {
                id: `study_msg_${Date.now()}`,
                sender: schoolSubjectsType.toUpperCase(),
                text: `✨ Kamu asyik belajar ${subjectName} di ${schoolSubjectsDeskType === 'guru' ? 'Meja Guru' : 'Meja Belajar Siswa'}! (+${expEarned} EXP)`,
                timestamp: Date.now(),
                isSystem: true,
              });
            }}
          />

          {/* Modal Mata Pelajaran Khusus SD (Legacy fallback) */}
          <SdSubjectsModal
            isOpen={isSdSubjectsOpen}
            onClose={() => {
              sound.playClick();
              setIsSdSubjectsOpen(false);
              EventBus.emit('dialogue-active', false);
            }}
            deskType={sdDeskType}
            onStudySubject={(subjectName, expEarned) => {
              sound.playSuccess();
              setPlayerExp((prev) => {
                const next = prev + expEarned;
                try {
                  const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
                  u.exp = next;
                  localStorage.setItem('raden_player_user', JSON.stringify(u));
                } catch (e) {}
                return next;
              });
              EventBus.emit('new-chat-message', {
                id: `study_msg_${Date.now()}`,
                sender: 'KELAS SD',
                text: `📚 Kamu tekun belajar ${subjectName} di ${sdDeskType === 'guru' ? 'Meja Guru' : 'Meja Belajar Siswa'}! (+${expEarned} EXP)`,
                timestamp: Date.now(),
                isSystem: true,
              });
            }}
          />

          {/* Minigame Memancing Interaktif Bergaya Stardew Valley */}
          <FishingMinigame
            isOpen={isFishingMinigameOpen}
            fishData={fishingMinigameData}
            onSuccess={(fish) => {
              setIsFishingMinigameOpen(false);
              EventBus.emit('fishing-minigame-success', { fish });
            }}
            onFailed={() => {
              setIsFishingMinigameOpen(false);
              EventBus.emit('fishing-minigame-failed');
            }}
            onClose={() => {
              setIsFishingMinigameOpen(false);
              EventBus.emit('fishing-minigame-failed');
            }}
          />

          {/* Banner Peringatan Ikan Menyambar Terpusat di Mobile Landscape & Portrait */}
          {isFishBiting && (
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                SoundManager.getInstance().playClick();
                setIsFishBiting(false);
                EventBus.emit('player-strike');
                EventBus.emit('fishing-charge-start');
              }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-black px-5 py-2.5 rounded-full shadow-[0_0_35px_rgba(245,158,11,1)] border-2 border-white flex items-center gap-2 cursor-pointer animate-bounce select-none touch-none"
              style={{ touchAction: 'none' }}
              title="Ketuk untuk Menarik Kail Ikan!"
            >
              <Zap className="w-5 h-5 text-black stroke-[3] animate-pulse" />
              <span className="font-['Chakra_Petch'] font-black text-xs sm:text-sm uppercase tracking-wider">
                ⚡ IKAN MENYAMBAR! KETUK DI SINI UNTUK TARIK!
              </span>
            </div>
          )}

          {/* Tombol Kontrol Virtual Layar Sentuh jika Mode Mobile dipilih ATAU perangkat sentuh mobile */}
          {(settings.controlMode === 'mobile' || (typeof window !== 'undefined' && window.innerWidth < 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))) && (
            <VirtualControls
              onActionPress={handleVirtualAction}
              onDirectionPress={handleVirtualDirectionPress}
              onDirectionRelease={handleVirtualDirectionRelease}
              isActionActive={!!interactionPrompt}
            />
          )}

          {/* Modal Top Up Berlian */}
          <TopUpModal
            isOpen={isTopUpOpen}
            onClose={() => setIsTopUpOpen(false)}
            currentDiamonds={playerDiamonds}
            onSuccessTopUp={handleSuccessTopUp}
          />

          {/* Pop-up Notifikasi Permintaan Pertemanan di Kanan Layar (Timer 1 Menit) */}
          <FriendRequestNotification
            request={incomingFriendRequest}
            onAccept={handleAcceptFriendRequest}
            onReject={handleRejectFriendRequest}
          />

          {/* Modal Pengaturan jika dibuka */}
          <SettingsModal
            isOpen={inGameSettingsOpen}
            onClose={() => setInGameSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenServerModal={() => {
              setInGameSettingsOpen(false);
              setIsServerModalOpen(true);
            }}
          />

          {/* Modal Layanan Polisi (Report Player) */}
          <PoliceReportModal
            isOpen={isPoliceModalOpen}
            onClose={() => {
              setIsPoliceModalOpen(false);
              EventBus.emit('dialogue-active', false);
            }}
            currentPlayerName={playerStats.name}
          />

          {/* Modal Layanan Bank (Investasi & Tabungan Koin) */}
          <BankModal
            isOpen={isBankModalOpen}
            onClose={() => {
              setIsBankModalOpen(false);
              EventBus.emit('dialogue-active', false);
            }}
            playerGold={playerGold}
            onUpdateGold={(g) => {
              const delta = g - playerGold;
              if (delta !== 0) {
                syncWalletWithServer(delta, 0, 'bank_transaction');
              }
              if (isCurrentUserAdmin) {
                setPlayerGold(99999999999);
                localStorage.setItem('raden_player_gold', '99999999999');
              } else {
                setPlayerGold(g);
                localStorage.setItem('raden_player_gold', g.toString());
              }
            }}
            isAdmin={isCurrentUserAdmin}
          />

          {/* Modal Apotek Ramuan Ajaib (Beli Ramuan dengan Diamond) */}
          <PharmacyModal
            isOpen={isPharmacyModalOpen}
            onClose={() => {
              setIsPharmacyModalOpen(false);
              EventBus.emit('dialogue-active', false);
            }}
            playerDiamonds={playerDiamonds}
            onUpdateDiamonds={(d) => {
              const delta = d - playerDiamonds;
              if (delta !== 0) {
                syncWalletWithServer(0, delta, 'pharmacy_purchase');
              }
              if (isCurrentUserAdmin) {
                setPlayerDiamonds(99999999999);
                localStorage.setItem('raden_player_diamonds', '99999999999');
              } else {
                setPlayerDiamonds(d);
                localStorage.setItem('raden_player_diamonds', d.toString());
              }
            }}
            isAdmin={isCurrentUserAdmin}
          />

          {/* Modal Makelar Hasil Bumi & Pasar Alat (Beli Alat/Biji, Jual Panen/Ikan) */}
          <MarketRealtorModal
            isOpen={isRealtorModalOpen}
            onClose={() => {
              setIsRealtorModalOpen(false);
              EventBus.emit('dialogue-active', false);
            }}
            playerGold={playerGold}
            onUpdateGold={(g) => {
              const delta = g - playerGold;
              if (delta !== 0) {
                syncWalletWithServer(delta, 0, 'market_transaction');
              }
              if (isCurrentUserAdmin) {
                setPlayerGold(99999999999);
                localStorage.setItem('raden_player_gold', '99999999999');
              } else {
                setPlayerGold(g);
                localStorage.setItem('raden_player_gold', g.toString());
              }
            }}
            isAdmin={isCurrentUserAdmin}
          />
        </>
      )}

      {/* Modal Pemilih & Pindah Server (Bisa Diakses Global dari Home maupun In-Game) */}
      <ServerModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        currentServerCode={serverCode}
        onSelectServer={(server: IGameServerOption) => {
          setServerCode(server.code);
          EventBus.emit('new-chat-message', {
            id: `sys_srv_${Date.now()}`,
            sender: 'SISTEM',
            text: `🌐 Berhasil beralih ke server ${server.name} (${server.code})!`,
            timestamp: Date.now(),
            isSystem: true,
          });
        }}
      />
    </div>
  );
};
