/**
 * ============================================================================
 * FILE: resources/js/game/ui/HomeScreen.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Beranda utama (Home Screen / Main Menu) game RadenWorld.
 * 
 * SPESIFIKASI DESAIN:
 * - Layout menu 4 tombol di sebelah KIRI layar (Left-Aligned).
 * - Tombol simpel, minimalis tanpa logo/ikon berlebihan.
 * - Font gaming khas: 'Chakra Petch'.
 * - Skema warna murni 2 WARNA:
 *   1. Warna Primer: Dark Obsidian / Hitam Karbon (#0a0f1d)
 *   2. Warna Sekunder: Emas / Amber Gaming (#f59e0b)
 * ============================================================================
 */

import React, { useState } from 'react';
import { IAvatarCustomization } from '../types';
import { AuthModal } from './AuthModal';
import { SettingsModal, GameSettings } from './SettingsModal';
import { CreditsModal } from './CreditsModal';
import { ExitModal } from './ExitModal';
import { SoundManager } from '../core/SoundManager';
import { Volume2, VolumeX, Globe, ArrowRightLeft } from 'lucide-react';
import { cleanServerCode } from './HUD';

interface HomeScreenProps {
  onStartGame: (name: string, avatar: IAvatarCustomization, privateRoomId?: string) => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenServerModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  settings,
  onUpdateSettings,
  onOpenServerModal,
}) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [currentServerCode] = useState(() => {
    try {
      return localStorage.getItem('raden_server_code') || 'Asia 1';
    } catch (e) {
      return 'Asia 1';
    }
  });

  const displayServerCode = cleanServerCode(currentServerCode);
  const sound = SoundManager.getInstance();

  const handleOpenAuth = () => {
    sound.playOpenModal();
    setIsAuthOpen(true);
  };

  const handleOpenSettings = () => {
    sound.playOpenModal();
    setIsSettingsOpen(true);
  };

  const handleOpenCredits = () => {
    sound.playOpenModal();
    setIsCreditsOpen(true);
  };

  const handleOpenExit = () => {
    sound.playClick();
    setIsExitOpen(true);
  };

  const toggleMute = () => {
    sound.playClick();
    const newMuted = !settings.isMuted;
    onUpdateSettings({ ...settings, isMuted: newMuted });
    sound.setMuted(newMuted);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-8 md:p-14 select-none overflow-hidden font-['Chakra_Petch']">
      {/* Background Layers: Flat Pure Black (Tanpa Shadow & Tanpa Glow) */}
      <div className="absolute inset-0 bg-black/80 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs">
        {/* Tombol Status Server: H-10, Rounded-md (Flat Pure Black) */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenServerModal?.();
          }}
          className="h-10 flex items-center gap-2 px-3 rounded-md bg-black border border-neutral-800 hover:border-amber-400 text-neutral-200 font-bold uppercase text-xs transition-colors cursor-pointer group"
          title="Klik untuk Melihat Daftar Server & Pindah Server"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <Globe className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
          <span className="font-mono text-xs font-black text-amber-300">SERVER: {displayServerCode}</span>
          <span className="text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded flex items-center gap-1 group-hover:bg-amber-300 transition-colors ml-0.5">
            <ArrowRightLeft className="w-2.5 h-2.5" />
            <span>PINDAH</span>
          </span>
        </button>

        {/* Top Right Quick Settings: H-10, Rounded-md */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenSettings}
            className="h-10 flex items-center gap-1.5 px-3 rounded-md bg-black border border-neutral-800 text-neutral-300 hover:border-amber-400 hover:text-amber-400 transition-colors cursor-pointer text-xs uppercase font-bold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{settings.language}</span>
          </button>

          <button
            onClick={toggleMute}
            className="h-10 w-10 flex items-center justify-center rounded-md bg-black border border-neutral-800 text-neutral-300 hover:border-amber-400 hover:text-amber-400 transition-colors cursor-pointer"
            title={settings.isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {settings.isMuted ? (
              <VolumeX className="w-4 h-4 text-amber-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Left-Aligned Menu Layout */}
      <div className="relative z-10 flex flex-col justify-center max-w-md w-full my-auto space-y-7 pl-2 md:pl-6 text-left">
        {/* Game Title */}
        <div className="space-y-1.5">
          <div className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
            2D Open World Multiplayer
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
            RADEN<span className="text-amber-400">WORLD</span>
          </h1>
          <p className="text-xs text-neutral-400 tracking-wide leading-relaxed max-w-sm">
            Jelajahi peta dunia terbuka, kustomisasi avatarmu, dan bermain bersama pemain lain.
          </p>
        </div>

        {/* 4 Left-Aligned Simple Text Buttons: Rounded-md (Crisp Flat Minimalist) */}
        <div className="flex flex-col space-y-2.5 w-64 md:w-72">
          {/* 1. TOMBOL MASUK */}
          <button
            onClick={handleOpenAuth}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-2.5 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-colors text-left flex items-center justify-between cursor-pointer border border-amber-400"
          >
            <span>1. MASUK</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </button>

          {/* 2. TOMBOL SETTING */}
          <button
            onClick={handleOpenSettings}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-2.5 px-4 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400 text-neutral-200 hover:text-amber-300 font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-colors text-left flex items-center justify-between cursor-pointer"
          >
            <span>2. SETTING</span>
            <span className="text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">⚙</span>
          </button>

          {/* 3. TOMBOL CREDIT */}
          <button
            onClick={handleOpenCredits}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-2.5 px-4 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400 text-neutral-200 hover:text-amber-300 font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-colors text-left flex items-center justify-between cursor-pointer"
          >
            <span>3. CREDIT</span>
            <span className="text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">★</span>
          </button>

          {/* 4. TOMBOL EXIT */}
          <button
            onClick={handleOpenExit}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-2.5 px-4 rounded-md bg-black hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400 text-neutral-400 hover:text-amber-300 font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-colors text-left flex items-center justify-between cursor-pointer"
          >
            <span>4. EXIT</span>
            <span className="text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">⏻</span>
          </button>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="relative z-10 text-[11px] text-slate-500 pl-2 md:pl-6 uppercase tracking-wider">
        <span>© 2026 RADENWORLD • POWERED BY PHASER 3 & PIXIJS</span>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(name, avatar, privateRoomId) => {
          setIsAuthOpen(false);
          onStartGame(name, avatar, privateRoomId);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onOpenServerModal={onOpenServerModal}
      />

      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />

      <ExitModal
        isOpen={isExitOpen}
        onClose={() => setIsExitOpen(false)}
      />
    </div>
  );
};
