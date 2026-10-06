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
import { AuthModal } from './AuthModal';
import { SettingsModal, GameSettings } from './SettingsModal';
import { CreditsModal } from './CreditsModal';
import { ExitModal } from './ExitModal';
import { SoundManager } from '../core/SoundManager';
import { IAvatarCustomization } from '../types';
import { Volume2, VolumeX, Globe } from 'lucide-react';

interface HomeScreenProps {
  onStartGame: (name: string, avatar: IAvatarCustomization, privateRoomId?: string) => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  settings,
  onUpdateSettings,
}) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);

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
      {/* Background Ambience Layers (Hitam Karbon Primer) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070a12]/95 via-[#0a0f1d]/85 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-12 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs">
        {/* Status Server */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0f172a]/80 border border-amber-500/30 text-amber-400 font-bold tracking-wider uppercase text-[11px]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>RADENWORLD • SERVER ONLINE</span>
        </div>

        {/* Top Right Quick Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0f172a]/80 border border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer text-xs uppercase font-bold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{settings.language}</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded bg-[#0f172a]/80 border border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
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
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
            RADEN<span className="text-amber-400">WORLD</span>
          </h1>
          <p className="text-xs text-slate-400 tracking-wide leading-relaxed max-w-sm">
            Jelajahi peta dunia catur terbuka, kustomisasi avatarmu, dan bermain bersama pemain lain.
          </p>
        </div>

        {/* 4 Left-Aligned Simple Text Buttons (Simpel, Tanpa Logo Berlebihan, 2 Warna) */}
        <div className="flex flex-col space-y-3 w-64 md:w-72">
          {/* 1. TOMBOL MASUK */}
          <button
            onClick={handleOpenAuth}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-left flex items-center justify-between cursor-pointer border border-amber-300"
          >
            <span>1. MASUK</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </button>

          {/* 2. TOMBOL SETTING */}
          <button
            onClick={handleOpenSettings}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-3 px-5 rounded-xl bg-[#0f172a]/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/80 text-slate-200 hover:text-amber-300 font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-all text-left flex items-center justify-between cursor-pointer"
          >
            <span>2. SETTING</span>
            <span className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">⚙</span>
          </button>

          {/* 3. TOMBOL CREDIT */}
          <button
            onClick={handleOpenCredits}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-3 px-5 rounded-xl bg-[#0f172a]/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/80 text-slate-200 hover:text-amber-300 font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-all text-left flex items-center justify-between cursor-pointer"
          >
            <span>3. CREDIT</span>
            <span className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">★</span>
          </button>

          {/* 4. TOMBOL EXIT */}
          <button
            onClick={handleOpenExit}
            onMouseEnter={() => sound.playHover()}
            className="group w-full py-3 px-5 rounded-xl bg-[#0f172a]/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-300 font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-all text-left flex items-center justify-between cursor-pointer"
          >
            <span>4. EXIT</span>
            <span className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">⏻</span>
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
