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

import React, { useState, useEffect, useMemo } from 'react';
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
import { calculateAgeFromBirthDate } from './game/ui/AuthModal';
import { EventBus } from './game/core/EventBus';
import { SoundManager } from './game/core/SoundManager';
import { NetworkManager } from './game/core/NetworkManager';
import { IAvatarCustomization, IChatMessage } from './game/types';

export const GameApp: React.FC = () => {
  // Check initial URL pathname
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isDirectInGame = initialPath.startsWith('/home') || initialPath.startsWith('/world') || initialPath.startsWith('/admin');

  // Screen state: 'home' (Lobby /) | 'playing' (Safe House, Open World, atau Portal Admin)
  const [gameState, setGameState] = useState<'home' | 'playing'>(isDirectInGame ? 'playing' : 'home');
  const [currentPath, setCurrentPath] = useState<string>(initialPath);

  // Game Settings State
  const [settings, setSettings] = useState<GameSettings>({
    language: 'id',
    masterVolume: 0.8,
    bgmVolume: 0.7,
    sfxVolume: 0.8,
    isMuted: false,
    controlMode: 'pc', // 'pc' | 'mobile'
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
      ? (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_world') || ''); if (p?.x) return p.x; } catch (e) {} return 4800; })()
      : (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_house_safe-01') || ''); if (p?.x) return p.x; } catch (e) {} return 840; })(),
    y: initialPath.startsWith('/world')
      ? (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_world') || ''); if (p?.y) return p.y; } catch (e) {} return 4860; })()
      : (() => { try { const p = JSON.parse(localStorage.getItem('raden_pos_house_safe-01') || ''); if (p?.y) return p.y; } catch (e) {} return 620; })(),
    gridX: initialPath.startsWith('/world') ? 40 : 7,
    gridY: initialPath.startsWith('/world') ? 40 : 5,
    level: 1,
    hp: 100,
    maxHp: 100,
    name: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name) return u.name;
      } catch (e) {}
      return 'Petualang';
    })(),
    roomName: initialPath.startsWith('/world') ? 'SANCTUARY CENTRAL PLAZA' : 'RUMAH PRIBADI: RUANG UTAMA',
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
        if (u.is_super_admin || u.role === 'super_admin' || u.name?.toUpperCase() === 'RADEN' || u.email === 'radencakstudio@gmail.com') return true;
      } catch (e) {}
      return false;
    })(),
    title: (() => {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.is_super_admin || u.role === 'super_admin' || u.name?.toUpperCase() === 'RADEN' || u.email === 'radencakstudio@gmail.com') return '👑 SUPER ADMIN';
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

  const [playerLikes] = useState<number>(36);
  const [playerGold, setPlayerGold] = useState<number>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
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
      if (typeof u.diamonds === 'number') return u.diamonds;
      const d = localStorage.getItem('raden_player_diamonds');
      if (d) return parseInt(d, 10);
    } catch (e) {}
    return 50;
  });
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Inspected Player (saat menekan/klik pemain lain di open world)
  const [inspectedPlayer, setInspectedPlayer] = useState<{
    id: string;
    name: string;
    avatar?: IAvatarCustomization;
    level?: number;
    role?: string;
    bio?: string;
    isSuperAdmin?: boolean;
    gold?: number;
    diamonds?: number;
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

  useEffect(() => {
    // 1. Stats updates from Phaser engine (X, Y, Name, Room)
    const handleStats = (stats: any) => {
      setPlayerStats((prev) => {
        const resolvedName = (stats.name && stats.name !== 'Petualang') ? stats.name : (prev.name || stats.name);
        if (
          prev.gridX === stats.gridX &&
          prev.gridY === stats.gridY &&
          prev.roomName === stats.roomName &&
          prev.hp === stats.hp &&
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
          EventBus.emit('switch-scene', { scene: 'WorldScene' });
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

    const handleInspectProfile = (target: any) => {
      setInspectedPlayer(target);
      setIsProfileOpen(true);
    };
    EventBus.on('inspect-player-profile', handleInspectProfile);

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
      };
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      EventBus.off('url-changed', handleUrlChanged);
      EventBus.off('player-stats-updated', handleStats);
      EventBus.off('interaction-prompt', handlePrompt);
      EventBus.off('new-chat-message', handleChat);
      EventBus.off('open-wardrobe', handleOpenWardrobe);
      EventBus.off('inspect-player-profile', handleInspectProfile);
      EventBus.off('incoming-friend-request', handleIncomingFriend);
      EventBus.off('friend-response-result', handleFriendResponse);
    };
  }, []);

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

  // Top Up Berlian Handler
  const handleSuccessTopUp = (addedDiamonds: number) => {
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
      text: `💎 Top Up Berhasil! +${addedDiamonds} Berlian telah masuk ke saldo!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  // Memulai game dari Home Screen (setelah Login / Kustomisasi Avatar)
  const handleStartGame = (name: string, avatar: IAvatarCustomization, privateRoomId?: string) => {
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
    const housePath = `/home/${safeRoomId}`;
    if (window.location.pathname !== housePath) {
      window.history.pushState(null, '', housePath);
    }
    setCurrentPath(housePath);
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
      x: 480,
      y: 380,
      gridX: 10,
      gridY: 7,
      roomName: `RUMAH PRIBADI: RUANG UTAMA (SAFE: ${safeRoomId})`,
      inHouse: true,
      privateRoomId: safeRoomId,
    }));
    EventBus.emit('join-game', {
      name,
      avatar,
      privateRoomId: safeRoomId,
      role,
      isSuperAdmin,
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0f1d] font-['Chakra_Petch']">
      {/* 2D HTML5 Canvas Game Engine (Phaser 3) */}
      <GameCanvas />

      {/* 1. TAMPILAN BERANDA (HOME SCREEN INTERAKTIF MENU KIRI) */}
      {gameState === 'home' && (
        <HomeScreen
          onStartGame={handleStartGame}
          settings={settings}
          onUpdateSettings={setSettings}
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
          />

          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => {
              setIsProfileOpen(false);
              setInspectedPlayer(null);
            }}
            name={inspectedPlayer ? inspectedPlayer.name : (playerStats?.name || 'Petualang')}
            avatar={inspectedPlayer ? inspectedPlayer.avatar : (playerStats?.avatar || wardrobeAvatar)}
            level={inspectedPlayer ? (inspectedPlayer.level || 1) : (playerStats?.level || 1)}
            exp={inspectedPlayer ? 0 : playerExp}
            role={inspectedPlayer ? inspectedPlayer.role : playerStats?.role}
            isSuperAdmin={inspectedPlayer ? inspectedPlayer.isSuperAdmin : playerStats?.isSuperAdmin}
            title={inspectedPlayer ? (inspectedPlayer.isSuperAdmin ? '👑 KREATOR & SUPER ADMIN' : 'Petualang') : (playerStats?.isSuperAdmin ? '👑 KREATOR & SUPER ADMIN' : (playerStats?.title || 'Petualang Pemula'))}
            gold={inspectedPlayer ? (typeof inspectedPlayer.gold === 'number' ? inspectedPlayer.gold : (inspectedPlayer.isSuperAdmin ? 999999 : 2500)) : playerGold}
            diamonds={inspectedPlayer ? (typeof inspectedPlayer.diamonds === 'number' ? inspectedPlayer.diamonds : (inspectedPlayer.isSuperAdmin ? 99999 : 50)) : playerDiamonds}
            age={inspectedPlayer ? 20 : playerAge}
            birthDate={inspectedPlayer ? '' : playerBirthDate}
            likes={playerLikes}
            gender={inspectedPlayer ? (inspectedPlayer.avatar?.gender || 'male') : wardrobeAvatar.gender}
            description={inspectedPlayer ? (inspectedPlayer.bio || 'Petualang penjelajah RadenWorld.') : playerBio}
            onSaveDescription={inspectedPlayer ? undefined : (d) => {
              setPlayerBio(d);
              try {
                localStorage.setItem('raden_player_bio', d);
              } catch (e) {}
            }}
            friendsCount={friendsList.length}
            followingCount={followingList.length}
            followersCount={followersList.length}
            isInspecting={!!inspectedPlayer}
            isFriend={inspectedPlayer ? friendsList.includes(inspectedPlayer.name) : false}
            isFriendRequested={inspectedPlayer ? sentFriendRequests.includes(inspectedPlayer.id) : false}
            onAddFriend={inspectedPlayer ? () => handleAddFriend(inspectedPlayer.id, inspectedPlayer.name) : undefined}
            onLogout={inspectedPlayer ? undefined : handleLogout}
            onTeleportToAdminPortal={inspectedPlayer ? undefined : handleTeleportToAdminPortal}
            onOpenTopUp={inspectedPlayer ? undefined : () => setIsTopUpOpen(true)}
          />

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

          {/* Tombol Kontrol Virtual Layar Sentuh HANYA jika Mode Mobile dipilih (Mencegah muncul di mode PC) */}
          {settings.controlMode === 'mobile' && (
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
            onUpdateSettings={setSettings}
            onOpenServerModal={() => {
              setInGameSettingsOpen(false);
              setIsServerModalOpen(true);
            }}
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
