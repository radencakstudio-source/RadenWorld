/**
 * ============================================================================
 * FILE: resources/js/game/ui/HomeScreen.tsx
 * ============================================================================
 * Lobby / Beranda Utama RadenWorld persis sesuai screenshot (Images 1 & 2):
 * 1. Background pola catur hitam & abu-abu (Black & Gray Checkered Pattern).
 * 2. Header kiri atas:
 *    - RADEN WORLD (Font pixel kuning retro 'Press Start 2P')
 *    - Institut Teknologi Dan Bisnis Ahmad Dahlan Lamongan (kuning)
 *    - JELAJAHI DUNIA TERBUKA, CUSTOM SASI AVATARM (hitam)
 *    - DAN BERMAIN BERSAMA PEMAIN LAIN (hitam)
 * 3. Menu kiri 4 tombol oranye rounded dengan garis tepi hitam:
 *    - PLAY (wajib login/daftar jika belum ada akun)
 *    - SETTING
 *    - CREDIT
 *    - DOWNLOAD
 * 4. Dua avatar raksasa berdiri berdampingan:
 *    - Karakter Cewek di tengah (rambut pink, hoodie oranye, celana pink)
 *    - Karakter Cowok di kanan (rambut biru, hoodie oranye, celana biru)
 * 5. Kanan atas:
 *    - Pill Server: ASIA - RADEN - 0001
 *    - 3 Tombol kotak oranye: Download, Language, Information
 * 6. Kanan bawah:
 *    - Label © 2026 Powered by RadencakStudio - RadenWorld - v1.02.00
 * ============================================================================
 */

import React, { useState } from 'react';
import { IAvatarCustomization } from '../types';
import { AuthModal } from './AuthModal';
import { SettingsModal, GameSettings } from './SettingsModal';
import { CreditsModal } from './CreditsModal';
import { DownloadModal } from './DownloadModal';
import { SoundManager } from '../core/SoundManager';
import { Download, Globe, Info } from 'lucide-react';

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

  /**
   * Menangani tombol PLAY:
   * Pemain TIDAK BISA bergerak dan tidak bisa langsung bermain tanpa akun;
   * harus masuk (login) atau daftar (register) terlebih dahulu via AuthModal!
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
      // Pemain sudah masuk/terdaftar sebelumnya, izinkan langsung masuk ke game
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
    } else {
      // Pemain belum masuk/daftar -> Wajib buka form masuk/daftar!
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
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-2.5 xs:p-3 sm:p-6 md:p-8 select-none overflow-hidden font-['Chakra_Petch'] pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.6rem,env(safe-area-inset-left))] pr-[max(0.6rem,env(safe-area-inset-right))]">
      {/* Background Lantai Catur Kotak-kotak Hitam & Abu-abu (Black & Gray Checkered Grid) */}
      <div
        className="absolute inset-0 pointer-events-none transform-gpu will-change-transform"
        style={{
          backgroundColor: '#3a3d42',
          backgroundImage: `
            linear-gradient(45deg, #8a8d94 25%, transparent 25%),
            linear-gradient(-45deg, #8a8d94 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #8a8d94 75%),
            linear-gradient(-45deg, transparent 75%, #8a8d94 75%)
          `,
          backgroundSize: '88px 88px',
          backgroundPosition: '0 0, 0 44px, 44px -44px, -44px 0px',
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-30 w-full flex flex-col sm:flex-row items-start justify-between gap-1.5 sm:gap-4 shrink-0">
        {/* Kiri Atas: Logo Judul & Subteks (Dibatasi rapi agar tidak menimpa avatar) */}
        <div className="space-y-0.5 sm:space-y-1.5 max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] md:max-w-[420px]">
          <h1
            className="text-lg xs:text-xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#FFE600] font-['Press_Start_2P'] tracking-wider leading-none"
            style={{
              textShadow: '3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
            }}
          >
            RADEN WORLD
          </h1>
          <div className="pt-0.5 sm:pt-1 space-y-0.5">
            <p className="text-white font-black text-[8px] xs:text-[9px] sm:text-xs md:text-[13px] uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              JELAJAHI DUNIA TERBUKA, BERKENALAN DENGAN ORANG LAIN
            </p>
            <p className="text-[#FFE600] font-black text-[8px] xs:text-[9px] sm:text-xs md:text-[13px] uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              DAN BERINTERAKSI BERSAMA PEMAIN LAIN SECARA REAL-TIME
            </p>
          </div>
        </div>

        {/* Kanan Atas: Server Bar & 3 Tombol Sesuai Desain Game */}
        <div className="flex flex-col items-end gap-1 sm:gap-2 w-full sm:w-56 md:w-64 z-30">
          {/* Bar Server: ASIA - 0001 (Tanpa kata RADEN, sesuai game) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenServerModal?.();
            }}
            className="w-full py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-lg bg-gradient-to-r from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black text-black font-black text-[11px] sm:text-[13px] tracking-wider text-center shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Klik untuk berpindah server"
          >
            Server: ASIA - 0001
          </button>

          {/* 3 Tombol Kotak Oranye Game: Download, Language, Information */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 w-full justify-between">
            {/* Download */}
            <button
              onClick={handleOpenDownload}
              className="flex-1 h-9 xs:h-10 sm:h-14 md:h-16 rounded-xl bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black flex flex-col items-center justify-center text-black shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer group"
              title="Unduh Game"
            >
              <Download className="w-3.5 sm:w-5 md:w-6 h-3.5 sm:h-5 md:h-6 group-hover:scale-110 transition-transform stroke-[2.5]" />
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-black mt-0.5 leading-none tracking-tight">Download</span>
            </button>

            {/* Language */}
            <button
              onClick={handleOpenSettings}
              className="flex-1 h-9 xs:h-10 sm:h-14 md:h-16 rounded-xl bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black flex flex-col items-center justify-center text-black shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer group"
              title="Pengaturan Bahasa"
            >
              <Globe className="w-3.5 sm:w-5 md:w-6 h-3.5 sm:h-5 md:h-6 group-hover:scale-110 transition-transform stroke-[2.5]" />
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-black mt-0.5 leading-none tracking-tight">Language</span>
            </button>

            {/* Information */}
            <button
              onClick={handleOpenCredits}
              className="flex-1 h-9 xs:h-10 sm:h-14 md:h-16 rounded-xl bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black flex flex-col items-center justify-center text-black shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer group"
              title="Informasi & Kredit"
            >
              <Info className="w-3.5 sm:w-5 md:w-6 h-3.5 sm:h-5 md:h-6 group-hover:scale-110 transition-transform stroke-[2.5]" />
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-black mt-0.5 leading-none tracking-tight">Information</span>
            </button>
          </div>
        </div>
      </div>

      {/* Area Tengah: 4 Tombol Menu Kiri & Dua Karakter Avatar Raksasa Berdiri */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-between my-auto min-h-0">
        {/* Menu 4 Tombol Oranye Kiri */}
        <div className="flex flex-col gap-1.5 xs:gap-2 sm:gap-3.5 w-36 xs:w-44 sm:w-56 md:w-72 shrink-0 z-20">
          {/* 1. PLAY */}
          <button
            onClick={handlePlayClick}
            onMouseEnter={() => sound.playHover()}
            className="w-full py-1.5 xs:py-2 sm:py-3.5 px-3 xs:px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black text-black font-black text-base xs:text-lg sm:text-2xl md:text-3xl tracking-wider text-left shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            PLAY
          </button>

          {/* 2. SETTING */}
          <button
            onClick={handleOpenSettings}
            onMouseEnter={() => sound.playHover()}
            className="w-full py-1.5 xs:py-2 sm:py-3.5 px-3 xs:px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black text-black font-black text-base xs:text-lg sm:text-2xl md:text-3xl tracking-wider text-left shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            SETTING
          </button>

          {/* 3. CREDIT */}
          <button
            onClick={handleOpenCredits}
            onMouseEnter={() => sound.playHover()}
            className="w-full py-1.5 xs:py-2 sm:py-3.5 px-3 xs:px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black text-black font-black text-base xs:text-lg sm:text-2xl md:text-3xl tracking-wider text-left shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            CREDIT
          </button>

          {/* 4. DOWNLOAD */}
          <button
            onClick={handleOpenDownload}
            onMouseEnter={() => sound.playHover()}
            className="w-full py-1.5 xs:py-2 sm:py-3.5 px-3 xs:px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 border-2 border-black text-black font-black text-base xs:text-lg sm:text-2xl md:text-3xl tracking-wider text-left shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            DOWNLOAD
          </button>
        </div>

        {/* Dua Karakter Raksasa: FemaleAvatar & MaleAvatar - Responsif untuk Semua Orientasi */}
        <div className="absolute inset-y-0 right-0 sm:left-[220px] md:left-[340px] flex items-end justify-end sm:justify-center pointer-events-none z-10 pb-1 sm:pb-4 opacity-50 sm:opacity-100 transition-opacity">
          {/* Karakter Cewek: FemaleAvatar (Flipped via scale-x-[-1]) */}
          <div className="relative flex flex-col items-center -mr-2 sm:-mr-4">
            <img
              src="/assets/sprites/characters/Player/Female/FemaleAvatar_Lobby.webp"
              alt="Female Avatar"
              className="h-[36vh] xs:h-[42vh] sm:h-[52vh] md:h-[64vh] max-h-[460px] object-contain object-bottom scale-x-[-1] transform-gpu will-change-transform"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          {/* Karakter Cowok: MaleAvatar */}
          <div className="relative flex flex-col items-center ml-2 sm:ml-4">
            <img
              src="/assets/sprites/characters/Player/Male/MaleAvatar_Lobby.webp"
              alt="Male Avatar"
              className="h-[36vh] xs:h-[42vh] sm:h-[52vh] md:h-[64vh] max-h-[460px] object-contain object-bottom transform-gpu will-change-transform"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* Footer Kanan Bawah: Label Hak Cipta & Versi (Sesuai Gaya Retro Game) */}
      <div className="relative z-30 w-full flex justify-end items-center shrink-0">
        <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-[#ff7e29] to-[#ea580c] border-2 border-black shadow-[0_2px_0_#000] text-black text-[9px] sm:text-[11px] font-black tracking-wide">
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
