/**
 * ============================================================================
 * FILE: resources/js/game/ui/HomeScreen.tsx
 * ============================================================================
 * Lobby / Beranda Utama RadenWorld (Cozycore Clay-Pixel):
 * 1. Background pola catur pastel hangat (#FFF8EA & #FFAE6D) bersih tanpa noise.
 * 2. Header kiri atas: Judul RADEN WORLD dalam panel Clay-Pixel.
 * 3. Kanan atas: Pill Server & 3 Tombol Utilitas (Download, Language, Information).
 * 4. Menu kiri 4 tombol Clay-Pixel: PLAY, SETTING, CREDIT, DOWNLOAD.
 * 5. Dua avatar lobby berdiri proporsional (responsif PC & Mobile Portrait/Landscape).
 * 6. Footer kanan bawah: Label versi aplikasi.
 * ============================================================================
 */

import React, { useState, startTransition } from 'react';
import { IAvatarCustomization } from '../types';
import { AuthModal } from './AuthModal';
import { SettingsModal, GameSettings } from './SettingsModal';
import { CreditsModal } from './CreditsModal';
import { DownloadModal } from './DownloadModal';
import { SoundManager } from '../core/SoundManager';
import { Download, Globe, Info, Play, Settings, Award, Server } from 'lucide-react';

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
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const sound = SoundManager.getInstance();

  const savedServerCode = (() => {
    try {
      return localStorage.getItem('raden_selected_server') || 'ASIA - 0001';
    } catch {
      return 'ASIA - 0001';
    }
  })();

  /**
   * Menangani tombol PLAY:
   * Pemain wajib masuk (login) atau daftar (register) terlebih dahulu via AuthModal!
   */
  const handlePlayClick = () => {
    sound.playClick();
    let hasValidUser = false;
    let userData: any = null;

    try {
      const saved = localStorage.getItem('raden_player_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.id && u.email && u.name && u.name.trim().toLowerCase() !== 'petualang') {
          hasValidUser = true;
          userData = u;
        } else {
          localStorage.removeItem('raden_player_user');
        }
      }
    } catch (e) {}

    if (hasValidUser && userData) {
      startTransition(() => {
        onStartGame(
          userData.name,
          userData.avatar || {
            gender: 'male',
            skinColor: '#fed7aa',
            shirtColor: '#f59e0b',
            pantsColor: '#1e293b',
            hatType: 'none',
          },
          userData.private_room_id
        );
      });
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleOpenSettings = () => {
    sound.playOpenModal();
    setIsSettingsOpen(true);
  };

  const handleOpenCredits = () => {
    sound.playOpenModal();
    setIsCreditsOpen(true);
  };

  const handleOpenDownload = () => {
    sound.playOpenModal();
    setIsDownloadOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col justify-between gap-2 sm:gap-4 select-none overflow-hidden text-black"
      style={{
        paddingTop: 'max(0.625rem, env(safe-area-inset-top, 0.625rem))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
        paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0.625rem))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
      }}
    >
      {/* Background Lantai Catur Pastel Hangat (#FFF8EA & #FFAE6D) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#FFF8EA',
          backgroundImage: `
            linear-gradient(45deg, #FFAE6D 25%, transparent 25%),
            linear-gradient(-45deg, #FFAE6D 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #FFAE6D 75%),
            linear-gradient(-45deg, transparent 75%, #FFAE6D 75%)
          `,
          backgroundSize: '88px 88px',
          backgroundPosition: '0 0, 0 44px, 44px -44px, -44px 0px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'rgba(255, 248, 234, 0.55)' }}
      />

      {/* Top Header Bar */}
      <div className="relative z-30 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 shrink-0">
        {/* Kiri Atas: Logo Judul Clay-Pixel */}
        <div
          className="clay-panel px-3.5 py-2 sm:px-5 sm:py-2.5 landscape:max-md:px-3 landscape:max-md:py-1.5 self-start"
          style={{
            backgroundColor: '#FFAE6D',
            boxShadow: 'inset 0 2px 0 #FFD0A6, inset 0 -3px 0 #E5924F, 0 3px 0 #5C3A21',
          }}
        >
          <h1 className="text-base sm:text-2xl md:text-4xl landscape:max-md:text-sm font-bold text-black tracking-wide leading-none">
            RADEN WORLD
          </h1>
        </div>

        {/* Kanan Atas: Server Bar & 3 Tombol Utilitas */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1.5 sm:gap-2 w-full sm:w-64 md:w-72 shrink-0">
          {/* Bar Server */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenServerModal?.();
            }}
            className="clay-btn-secondary py-1.5 sm:py-2 px-2.5 sm:px-3.5 text-black font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 flex-1 sm:w-full min-w-0"
            title="Klik untuk berpindah server"
          >
            <Server className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span className="truncate">Server: {savedServerCode}</span>
          </button>

          {/* 3 Tombol Utilitas: Download, Language, Information */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 sm:w-full">
            <button
              type="button"
              onClick={handleOpenDownload}
              className="clay-btn-neutral sm:flex-1 px-2.5 sm:px-2 py-1.5 sm:py-2 flex flex-col items-center justify-center text-black"
              title="Unduh Game"
            >
              <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline text-[10px] font-bold mt-1 leading-none">Unduh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenSettings}
              className="clay-btn-neutral sm:flex-1 px-2.5 sm:px-2 py-1.5 sm:py-2 flex flex-col items-center justify-center text-black"
              title="Pengaturan Bahasa"
            >
              <Globe className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline text-[10px] font-bold mt-1 leading-none">Bahasa</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCredits}
              className="clay-btn-neutral sm:flex-1 px-2.5 sm:px-2 py-1.5 sm:py-2 flex flex-col items-center justify-center text-black"
              title="Informasi & Kredit"
            >
              <Info className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline text-[10px] font-bold mt-1 leading-none">Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Area Tengah: 4 Tombol Menu Kiri & Dua Karakter Avatar Lobby */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex-1 min-h-0 grid grid-cols-12 items-center gap-2 sm:gap-6">
        {/* Menu 4 Tombol Clay-Pixel Kiri */}
        <div className="col-span-6 sm:col-span-5 md:col-span-4 flex flex-col gap-2 sm:gap-3 landscape:max-md:gap-1.5 z-20">
          {/* 1. PLAY (Primary Pastel Orange #FFAE6D) */}
          <button
            type="button"
            onClick={handlePlayClick}
            className="clay-btn-primary w-full py-2.5 sm:py-3.5 landscape:max-md:py-1.5 px-3 sm:px-5 flex items-center gap-2.5 sm:gap-3 text-left text-black"
          >
            <span className="w-7 h-7 sm:w-9 sm:h-9 landscape:max-md:w-6 landscape:max-md:h-6 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black" />
            </span>
            <span className="font-bold text-sm sm:text-xl md:text-2xl landscape:max-md:text-xs tracking-wide">
              PLAY
            </span>
          </button>

          {/* 2. SETTING */}
          <button
            type="button"
            onClick={handleOpenSettings}
            className="clay-btn-neutral w-full py-2 sm:py-3 landscape:max-md:py-1.5 px-3 sm:px-5 flex items-center gap-2.5 sm:gap-3 text-left text-black"
          >
            <span className="w-7 h-7 sm:w-9 sm:h-9 landscape:max-md:w-6 landscape:max-md:h-6 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
            </span>
            <span className="font-bold text-sm sm:text-lg md:text-xl landscape:max-md:text-xs tracking-wide">
              SETTING
            </span>
          </button>

          {/* 3. CREDIT */}
          <button
            type="button"
            onClick={handleOpenCredits}
            className="clay-btn-neutral w-full py-2 sm:py-3 landscape:max-md:py-1.5 px-3 sm:px-5 flex items-center gap-2.5 sm:gap-3 text-left text-black"
          >
            <span className="w-7 h-7 sm:w-9 sm:h-9 landscape:max-md:w-6 landscape:max-md:h-6 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
            </span>
            <span className="font-bold text-sm sm:text-lg md:text-xl landscape:max-md:text-xs tracking-wide">
              CREDIT
            </span>
          </button>

          {/* 4. DOWNLOAD */}
          <button
            type="button"
            onClick={handleOpenDownload}
            className="clay-btn-neutral w-full py-2 sm:py-3 landscape:max-md:py-1.5 px-3 sm:px-5 flex items-center gap-2.5 sm:gap-3 text-left text-black"
          >
            <span className="w-7 h-7 sm:w-9 sm:h-9 landscape:max-md:w-6 landscape:max-md:h-6 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
            </span>
            <span className="font-bold text-sm sm:text-lg md:text-xl landscape:max-md:text-xs tracking-wide">
              DOWNLOAD
            </span>
          </button>
        </div>

        {/* Dua Karakter Lobby: Proporsional di Kolom Kanan Tanpa Menutupi Menu */}
        <div className="col-span-6 sm:col-span-7 md:col-span-8 h-full min-h-0 flex items-end justify-center gap-1 sm:gap-4 pointer-events-none pb-1">
          <div className="relative flex flex-col items-center">
            <img
              src="/assets/sprites/characters/Player/Female/FemaleAvatar_Lobby.webp"
              alt="Female Avatar"
              className="h-[28dvh] sm:h-[46dvh] md:h-[56dvh] landscape:max-md:h-[44dvh] max-h-[420px] w-auto object-contain object-bottom scale-x-[-1] pixelated"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="w-12 sm:w-20 h-2 bg-[#5C3A21]/20 rounded-full -mt-1" />
          </div>

          <div className="relative flex flex-col items-center">
            <img
              src="/assets/sprites/characters/Player/Male/MaleAvatar_Lobby.webp"
              alt="Male Avatar"
              className="h-[28dvh] sm:h-[46dvh] md:h-[56dvh] landscape:max-md:h-[44dvh] max-h-[420px] w-auto object-contain object-bottom pixelated"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="w-12 sm:w-20 h-2 bg-[#5C3A21]/20 rounded-full -mt-1" />
          </div>
        </div>
      </div>

      {/* Footer Kanan Bawah */}
      <div className="relative z-30 w-full max-w-7xl mx-auto flex justify-end items-center shrink-0">
        <div className="clay-badge-neutral px-3 py-1 sm:px-3.5 sm:py-1.5 text-black text-[9px] sm:text-xs font-bold" style={{ borderWidth: '2px' }}>
          © 2026 Powered by RadencakStudio - RadenWorld - v1.02.00
        </div>
      </div>

      {/* Modals Terkait */}
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

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </div>
  );
};
