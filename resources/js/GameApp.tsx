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

import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HomeScreen } from './game/ui/HomeScreen';
import { HUD } from './game/ui/HUD';
import { ChatBox } from './game/ui/ChatBox';
import { ControlGuide } from './game/ui/ControlGuide';
import { VirtualControls } from './game/ui/VirtualControls';
import { SettingsModal, GameSettings } from './game/ui/SettingsModal';
import { WardrobeModal } from './game/ui/WardrobeModal';
import { ProfileModal } from './game/ui/ProfileModal';
import { EventBus } from './game/core/EventBus';
import { SoundManager } from './game/core/SoundManager';
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
    name: string;
    avatar?: IAvatarCustomization;
    roomName?: string;
    inHouse?: boolean;
    privateRoomId?: string;
    role?: string;
    isSuperAdmin?: boolean;
    title?: string;
  }>({
    x: initialPath.startsWith('/world') ? 1600 : 480,
    y: initialPath.startsWith('/world') ? 1600 : 380,
    gridX: initialPath.startsWith('/world') ? 25 : 10,
    gridY: initialPath.startsWith('/world') ? 25 : 7,
    level: 1,
    name: 'Petualang',
    roomName: initialPath.startsWith('/world') ? 'SANCTUARY PLAZA: PUSAT KOTA' : 'RUMAH PRIBADI: RUANG UTAMA',
    inHouse: !initialPath.startsWith('/world'),
    privateRoomId: 'safe-01',
    role: 'player',
    isSuperAdmin: false,
    title: 'Petualang Pemula',
  });

  const [serverCode, setServerCode] = useState('RADEN-ASIA-01');
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      setPlayerStats((prev) => ({ ...prev, ...stats }));
      if (stats.avatar) {
        setWardrobeAvatar(stats.avatar);
      }
    };

    // 2. Interaction prompt updates from proximity detection
    const handlePrompt = (prompt: string | null) => {
      setInteractionPrompt(prompt);
    };

    // 3. New chat message received
    const handleChat = (msg: IChatMessage) => {
      setMessages((prev) => [...prev.slice(-40), msg]);
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
            isSuper = u.role === 'super_admin' || u.is_super_admin || u.email === 'radencakstudio@gmail.com' || u.name?.toUpperCase() === 'RADEN';
          } catch (e) {}

          if (!isSuper) {
            alert('Akses Ditolak: Hanya Super Admin yang diizinkan mengakses Portal Admin!');
            window.history.replaceState(null, '', '/');
            setGameState('home');
          } else {
            const seg = p.replace('/admin/', '').trim() || 'raden-master-key';
            EventBus.emit('switch-scene', { scene: 'AdminPortalScene', adminToken: seg });
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
        x: isAdminPath ? 640 : (initialPath.startsWith('/world') ? 1600 : 480),
        y: isAdminPath ? 560 : (initialPath.startsWith('/world') ? 1600 : 380),
        gridX: isAdminPath ? 10 : (initialPath.startsWith('/world') ? 25 : 10),
        gridY: isAdminPath ? 8 : (initialPath.startsWith('/world') ? 25 : 7),
        level: level,
        name: playerName,
        avatar: playerAvatar,
        role: role,
        isSuperAdmin: isSuperAdmin,
        title: title,
        roomName: isAdminPath
          ? `PORTAL SUPER ADMIN: PUSAT KENDALI (ID: ${adminToken})`
          : (initialPath.startsWith('/world')
            ? 'SANCTUARY PLAZA: PUSAT KOTA'
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
        EventBus.off('open-wardrobe', handleOpenWardrobe);
      };
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      EventBus.off('url-changed', handleUrlChanged);
      EventBus.off('player-stats-updated', handleStats);
      EventBus.off('interaction-prompt', handlePrompt);
      EventBus.off('new-chat-message', handleChat);
      EventBus.off('open-wardrobe', handleOpenWardrobe);
    };
  }, []);

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
    EventBus.emit('send-chat', text);
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
            onOpenProfile={() => setIsProfileOpen(true)}
            isChatOpen={isChatOpen}
            interactionPrompt={interactionPrompt}
            onTriggerInteraction={handleTriggerInteraction}
          />

          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            name={playerStats?.name || 'Petualang'}
            avatar={playerStats?.avatar || wardrobeAvatar}
            level={playerStats?.level || 1}
            role={playerStats?.role}
            isSuperAdmin={playerStats?.isSuperAdmin}
            title={playerStats?.isSuperAdmin ? '👑 KREATOR & SUPER ADMIN' : (playerStats?.title || 'Petualang Pemula')}
            onTeleportToAdminPortal={handleTeleportToAdminPortal}
          />

          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />

          <ControlGuide
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />

          {/* Modal Lemari Pakaian (Ganti Ava di dalam Rumah) */}
          <WardrobeModal
            isOpen={isWardrobeOpen}
            onClose={() => setIsWardrobeOpen(false)}
            currentAvatar={wardrobeAvatar}
          />

          {/* Tombol Kontrol Virtual Layar Sentuh jika Mode Mobile dipilih */}
          {settings.controlMode === 'mobile' && (
            <VirtualControls
              onDirectionPress={handleVirtualDirectionPress}
              onDirectionRelease={handleVirtualDirectionRelease}
              onActionPress={handleVirtualAction}
              onChatPress={() => setIsChatOpen(true)}
            />
          )}

          {/* Modal Pengaturan jika dibuka */}
          <SettingsModal
            isOpen={inGameSettingsOpen}
            onClose={() => setInGameSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        </>
      )}
    </div>
  );
};
