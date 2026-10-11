/**
 * ============================================================================
 * FILE: resources/js/game/ui/ProfileModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pop-up Profil Karakter Pemain bergaya Minimalist & Elegant Gaming UI.
 * 
 * KARAKTERISTIK DESAIN:
 * 1. Simpel & Elegan: Palet 2-warna serasi (Dark Slate #0a0f1d & Honey Amber #f59e0b).
 * 2. Ga Banyak Warna & Ga Norak: Tanpa warna-warni pelangi yang mencolok.
 * 3. Ga Kedip & Ga Glow: Bebas efek neon berkedip atau glow berlebihan.
 * 4. Ga Naik Turun: Ukuran kotak tetap kokoh dan stabil saat membuka maupun mengedit bio.
 * 5. Dilengkapi Tombol Panduan Kontrol (Petunjuk) di dalam header.
 * ============================================================================
 */

import React, { useState } from 'react';
import { IAvatarCustomization } from '../types';
import { AvatarPreview } from './AvatarPreview';
import {
  User,
  X,
  Zap,
  Coins,
  Gem,
  Calendar,
  Heart,
  FileText,
  LogOut,
  Edit3,
  Check,
  HelpCircle,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  avatar?: IAvatarCustomization;
  level?: number;
  exp?: number;
  title?: string;
  gold?: number;
  diamonds?: number;
  role?: string;
  isSuperAdmin?: boolean;
  onTeleportToAdminPortal?: () => void;
  onLogout?: () => void;
  onOpenGuide?: () => void;
  description?: string;
  onSaveDescription?: (newDesc: string) => void;
  age?: number;
  likes?: number;
  gender?: 'male' | 'female';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  name,
  avatar,
  level = 1,
  exp = 0,
  title = 'Petualang Pemula',
  gold = 2500,
  diamonds = 50,
  role,
  isSuperAdmin: propIsSuperAdmin,
  onTeleportToAdminPortal,
  onLogout,
  onOpenGuide,
  description = 'Petualang penjelajah tanah agung RadenWorld.',
  onSaveDescription,
  age = 21,
  likes = 32,
  gender,
}) => {
  const sound = SoundManager.getInstance();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(description);

  if (!isOpen) return null;

  const isSuperAdmin = propIsSuperAdmin || role === 'super_admin' || name.toUpperCase() === 'RADEN';
  const effectiveLevel = isSuperAdmin ? 99 : level;
  const effectiveTitle = isSuperAdmin ? 'KREATOR & SUPER ADMIN' : title;
  const effectiveGold = isSuperAdmin ? 999999 : gold;
  const effectiveDiamonds = isSuperAdmin ? 9999 : diamonds;
  const effectiveLikes = isSuperAdmin ? 9999 : likes;
  const effectiveAge = isSuperAdmin ? 99 : age;

  const maxExp = effectiveLevel * 100;
  const expPercent = isSuperAdmin ? 100 : Math.min(100, Math.round((exp / maxExp) * 100));

  const charGender = gender || (avatar?.gender === 'female' ? 'female' : 'male');
  const genderLabel = charGender === 'female' ? 'Perempuan ♀' : 'Laki-laki ♂';

  const fallbackAvatar: IAvatarCustomization = avatar || {
    gender: charGender,
    skinColor: '#fed7aa',
    shirtColor: '#f59e0b',
    pantsColor: '#1e293b',
    hatType: isSuperAdmin ? 'crown' : 'none',
  };

  const handleSaveBio = () => {
    sound.playClick();
    setIsEditingBio(false);
    if (onSaveDescription) {
      onSaveDescription(bioText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 font-['Chakra_Petch']">
      {/* Modal Container dengan background murni hitam tanpa semburat biru dan tanpa shadow */}
      <div className="relative w-full max-w-md bg-[#080808] border border-amber-500/40 rounded-xl p-5 text-neutral-100 flex flex-col gap-4">
        {/* ================================================================ */}
        {/* HEADER                                                           */}
        {/* ================================================================ */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
              PROFIL KARAKTER
            </h2>
            {isSuperAdmin && (
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black tracking-wider">
                ADMIN
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Petunjuk Kontrol */}
            {onOpenGuide && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenGuide();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-800 bg-[#121212] hover:border-amber-400 text-amber-400 hover:text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
                title="Buka Petunjuk Kontrol Game"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>PETUNJUK</span>
              </button>
            )}

            {/* Tombol Tutup X */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1 rounded-md border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Tutup Profil"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* HERO SECTION: AVATAR & IDENTITAS KARAKTER                        */}
        {/* ================================================================ */}
        <div className="flex items-center gap-4 bg-[#101010] border border-neutral-800 p-3.5 rounded-md">
          {/* Avatar Box */}
          <div className="w-20 h-20 rounded-md bg-black border border-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden">
            <AvatarPreview avatar={fallbackAvatar} size={80} />
          </div>

          {/* Info Identitas */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-base font-bold text-amber-400 uppercase tracking-wide truncate">
                {name}
              </span>
              <span className="text-[10px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded shrink-0">
                LV. {effectiveLevel}
              </span>
            </div>

            <div className="text-xs text-neutral-400 font-semibold tracking-wider uppercase mt-0.5 truncate">
              {effectiveTitle}
            </div>

            {/* Progress EXP Minimalis */}
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>EXP</span>
                <span>{isSuperAdmin ? 'MAX' : `${exp} / ${maxExp} (${expPercent}%)`}</span>
              </div>
              <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* STATISTIK 2x2 GRID (MINIMALIS & RAPI)                            */}
        {/* ================================================================ */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1. Umur */}
          <div className="p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-amber-400/80 shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">UMUR</div>
              <div className="text-xs font-bold text-neutral-100">{effectiveAge} Tahun</div>
            </div>
          </div>

          {/* 2. Gender */}
          <div className="p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center gap-2.5">
            <User className="w-4 h-4 text-amber-400/80 shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">GENDER</div>
              <div className="text-xs font-bold text-neutral-100">{genderLabel}</div>
            </div>
          </div>

          {/* 3. Gold */}
          <div className="p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-amber-400/80 shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">GOLD</div>
              <div className="text-xs font-bold text-amber-400">{effectiveGold.toLocaleString()} G</div>
            </div>
          </div>

          {/* 4. Permata */}
          <div className="p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center gap-2.5">
            <Gem className="w-4 h-4 text-amber-400/80 shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">PERMATA</div>
              <div className="text-xs font-bold text-amber-300">{effectiveDiamonds.toLocaleString()} ✦</div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* DESKRIPSI (BIO) KARAKTER (TINGGI TETAP AGAR GA NAIK TURUN)        */}
        {/* ================================================================ */}
        <div className="p-3 rounded-md border border-neutral-800 bg-[#101010] flex flex-col gap-1.5 min-h-[76px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
            <div className="flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-amber-400/80" />
              <span>STATUS / BIO</span>
            </div>
            {!isEditingBio ? (
              <button
                type="button"
                onClick={() => setIsEditingBio(true)}
                className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>EDIT</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveBio}
                className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>SIMPAN</span>
              </button>
            )}
          </div>

          {isEditingBio ? (
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              maxLength={120}
              rows={2}
              className="w-full bg-black border border-amber-500/60 rounded-md p-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 resize-none font-sans"
              placeholder="Tulis status karakter..."
              autoFocus
            />
          ) : (
            <p className="text-xs text-neutral-300 italic line-clamp-2 leading-relaxed">
              "{bioText || 'Belum ada status karakter.'}"
            </p>
          )}
        </div>

        {/* Total Like Bar */}
        <div className="px-3 py-2 rounded-md border border-neutral-800 bg-[#101010] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>DISUKAI PEMAIN LAIN</span>
          </div>
          <span className="font-bold text-amber-400">{effectiveLikes.toLocaleString()} ♥</span>
        </div>

        {/* Tombol Teleport Portal Admin (Khusus Super Admin) */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => {
              sound.playSuccess();
              if (onTeleportToAdminPortal) onTeleportToAdminPortal();
            }}
            className="w-full py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>MASUK KE PORTAL ADMIN</span>
          </button>
        )}

        {/* ================================================================ */}
        {/* FOOTER ACTIONS                                                   */}
        {/* ================================================================ */}
        <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
          {/* Tombol Logout Akun */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onLogout) onLogout();
            }}
            className="flex-1 py-2 px-3 rounded-md border border-neutral-800 bg-[#121212] hover:bg-[#1a1a1a] hover:border-red-500/50 text-neutral-400 hover:text-red-400 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOGOUT</span>
          </button>

          {/* Tombol Tutup Profil */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 py-2 px-3 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
