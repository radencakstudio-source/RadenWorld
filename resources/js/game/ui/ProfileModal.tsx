/**
 * ============================================================================
 * FILE: resources/js/game/ui/ProfileModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal pop-up profil karakter yang muncul saat tombol Profil di kiri atas ditekan.
 * Menampilkan:
 * 1. Pratinjau Avatar Karakter (AvatarPreview SVG).
 * 2. Nama Karakter & Gelar/Title.
 * 3. Level & EXP Progress Bar.
 * 4. Atribut Karakter (Attack, Defense, Speed, Gold, Diamonds).
 * Menggunakan skema 2 warna ketat (Dark Obsidian #0a0f1d & Amber Gold #f59e0b).
 * ============================================================================
 */

import React from 'react';
import { IAvatarCustomization } from '../types';
import { AvatarPreview } from './AvatarPreview';
import { User, X, Shield, Swords, Zap, Coins, Gem, Award } from 'lucide-react';
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
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  name,
  avatar,
  level = 1,
  exp = 0,
  title = 'Petualang Pemula',
  gold = 250,
  diamonds = 10,
  role,
  isSuperAdmin: propIsSuperAdmin,
  onTeleportToAdminPortal,
}) => {
  const sound = SoundManager.getInstance();

  if (!isOpen) return null;

  const isSuperAdmin = propIsSuperAdmin || role === 'super_admin' || name.toUpperCase() === 'RADEN';
  const effectiveLevel = isSuperAdmin ? 99 : level;
  const effectiveTitle = isSuperAdmin ? '👑 KREATOR & SUPER ADMIN' : title;
  const effectiveGold = isSuperAdmin ? 999999 : gold;
  const effectiveDiamonds = isSuperAdmin ? 9999 : diamonds;

  const maxExp = effectiveLevel * 100;
  const expPercent = isSuperAdmin ? 100 : Math.min(100, Math.round((exp / maxExp) * 100));

  const fallbackAvatar: IAvatarCustomization = avatar || {
    gender: 'male',
    skinColor: '#fed7aa',
    shirtColor: '#f59e0b',
    pantsColor: '#1e293b',
    hatType: isSuperAdmin ? 'crown' : 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1d]/85 backdrop-blur-md font-['Chakra_Petch']">
      <div className={`relative w-full max-w-md bg-[#0a0f1d] border-2 ${isSuperAdmin ? 'border-amber-400 shadow-amber-500/30' : 'border-amber-500'} rounded-2xl shadow-2xl overflow-hidden p-6 text-amber-400 animate-in fade-in zoom-in-95 duration-150`}>
        {/* Header Profil */}
        <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold tracking-wider uppercase text-amber-400 flex items-center gap-2">
              PROFIL KARAKTER
              {isSuperAdmin && (
                <span className="text-[10px] bg-amber-400 text-[#0a0f1d] px-2 py-0.5 rounded font-black">
                  👑 SUPER ADMIN
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg border border-amber-500/40 hover:bg-amber-500 hover:text-[#0a0f1d] transition-all cursor-pointer"
            title="Tutup Profil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar & Identitas Karakter */}
        <div className="mt-5 flex flex-col items-center text-center">
          {/* Avatar Preview Box */}
          <div className={`p-3 rounded-2xl border ${isSuperAdmin ? 'border-amber-400 shadow-amber-500/20' : 'border-amber-500/50'} bg-[#0a0f1d] shadow-inner`}>
            <AvatarPreview avatar={fallbackAvatar} size={110} />
          </div>

          {/* Nama & Badge Level */}
          <div className="mt-3 flex items-center gap-2">
            <h3 className="text-lg font-bold uppercase tracking-wider text-amber-300">
              {name}
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-[#0a0f1d]">
              LV. {effectiveLevel}
            </span>
          </div>

          {/* Gelar / Title */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400/90 font-bold uppercase tracking-widest">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className={isSuperAdmin ? 'text-amber-300 font-extrabold' : ''}>{effectiveTitle}</span>
          </div>

          {/* Bar Progress Pengalaman (EXP) */}
          <div className="w-full mt-4 space-y-1">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <span>EXP</span>
              <span>{isSuperAdmin ? '9999 / 9999 (MAX)' : `${exp} / ${maxExp} (${expPercent}%)`}</span>
            </div>
            <div className="w-full h-2.5 bg-[#0a0f1d] border border-amber-500/40 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Statistik & Kekayaan Karakter */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {/* Attack */}
          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-[#0a0f1d] flex items-center gap-2.5">
            <Swords className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] text-amber-400/70 uppercase font-bold tracking-wider">SERANGAN (ATK)</div>
              <div className="text-xs font-bold text-amber-300">{isSuperAdmin ? '999 (+999)' : '25 (+0)'}</div>
            </div>
          </div>

          {/* Defense */}
          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-[#0a0f1d] flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] text-amber-400/70 uppercase font-bold tracking-wider">PERTAHANAN (DEF)</div>
              <div className="text-xs font-bold text-amber-300">{isSuperAdmin ? '999 (+999)' : '18 (+0)'}</div>
            </div>
          </div>

          {/* Speed */}
          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-[#0a0f1d] flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] text-amber-400/70 uppercase font-bold tracking-wider">KECEPATAN</div>
              <div className="text-xs font-bold text-amber-300">{isSuperAdmin ? '350 Px/s' : '220 Px/s'}</div>
            </div>
          </div>

          {/* Gold */}
          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-[#0a0f1d] flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] text-amber-400/70 uppercase font-bold tracking-wider">GOLD (UANG)</div>
              <div className="text-xs font-bold text-amber-300">{effectiveGold.toLocaleString()} G</div>
            </div>
          </div>
        </div>

        {/* Diamond / Permata */}
        <div className="mt-2.5 p-2.5 rounded-xl border border-amber-500/30 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">PERMATA (DIAMONDS)</span>
          </div>
          <span className="text-xs font-bold text-amber-300">{effectiveDiamonds.toLocaleString()} ✦</span>
        </div>

        {/* Hak Akses Khusus Super Admin */}
        {isSuperAdmin && (
          <div className="mt-3 p-2.5 rounded-xl border border-amber-400/50 bg-amber-500/10 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span>⚡ HAK HAK ISTIMEWA SUPER ADMIN:</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-200/90 space-y-0.5">
              <div>• Ketik <strong className="text-amber-400 font-mono">/announce &lt;pesan&gt;</strong> di chat untuk siaran pengumuman server resmi!</div>
              <div>• Mahkota emas & status Super Admin terlihat oleh seluruh pemain lain.</div>
              <div>• Akses tak terbatas ke seluruh zona dunia dan rumah aman.</div>
            </div>
          </div>
        )}

        {/* Tombol Khusus Super Admin: Masuk ke Portal Admin */}
        {isSuperAdmin && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                if (onTeleportToAdminPortal) {
                  onTeleportToAdminPortal();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#0a0f1d] text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 border border-amber-300 animate-pulse"
            >
              <Zap className="w-4 h-4 fill-current text-[#0a0f1d]" />
              <span>🌀 MASUK KE PORTAL ADMIN (TELEPORT)</span>
            </button>
          </div>
        )}

        {/* Tombol Tutup */}
        <div className="mt-3 pt-3 border-t border-amber-500/30 flex justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0a0f1d] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-md"
          >
            TUTUP PROFIL
          </button>
        </div>
      </div>
    </div>
  );
};
