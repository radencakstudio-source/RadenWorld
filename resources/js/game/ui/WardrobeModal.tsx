/**
 * ============================================================================
 * FILE: resources/js/game/ui/WardrobeModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal interaktif Lemari Pakaian (Wardrobe) di dalam Rumah Pribadi Karakter.
 * Mengizinkan pemain untuk mengubah gender, warna kulit, baju, celana, dan topi
 * dengan preview real-time dan palet 2 warna ketat (Dark Obsidian & Amber Gold).
 * ============================================================================
 */

import React, { useState } from 'react';
import { IAvatarCustomization, Gender, HatType } from '../types';
import { AvatarPreview } from './AvatarPreview';
import { Sparkles, X, Check } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: IAvatarCustomization;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
}) => {
  const [avatar, setAvatar] = useState<IAvatarCustomization>(currentAvatar);
  const sound = SoundManager.getInstance();

  if (!isOpen) return null;

  const skinColors = ['#fed7aa', '#fcd34d', '#f59e0b', '#d97706', '#92400e', '#78350f'];
  const shirtColors = ['#f59e0b', '#d97706', '#b45309', '#78350f', '#1e293b', '#0f172a'];
  const pantsColors = ['#0f172a', '#1e293b', '#334155', '#78350f', '#b45309', '#f59e0b'];
  const hatTypes: { type: HatType; label: string }[] = [
    { type: 'none', label: 'Polos' },
    { type: 'adventurer', label: 'Petualang' },
    { type: 'knight', label: 'Helm Zirah' },
    { type: 'bandana', label: 'Bandana' },
    { type: 'wizard', label: 'Topi Sihir' },
  ];

  const handleSave = async () => {
    sound.playSuccess();
    EventBus.emit('avatar-updated', avatar);
    try {
      localStorage.setItem('raden_player_avatar', JSON.stringify(avatar));
      const stored = localStorage.getItem('raden_player_user');
      const user = stored ? JSON.parse(stored) : null;
      if (user?.name) {
        user.avatar = avatar;
        localStorage.setItem('raden_player_user', JSON.stringify(user));
        await fetch('/api/auth/update-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: user.name, avatar }),
        });
      }
    } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 font-['Chakra_Petch']">
      <div className="relative w-full max-w-lg bg-black border border-neutral-800 rounded-2xl overflow-hidden p-4 sm:p-6 text-amber-400 flex flex-col max-h-[94dvh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase text-amber-400">
              LEMARI PAKAIAN (GANTI AVATAR)
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg border border-neutral-700 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Preview & Customization Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
          {/* Avatar Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-800 bg-neutral-900">
            <AvatarPreview avatar={avatar} size={110} />
            <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
              PRATINJAU KARAKTER
            </span>
          </div>

          {/* Options */}
          <div className="md:col-span-7 space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-amber-400">
                GENDER
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAvatar({ ...avatar, gender: g });
                    }}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      avatar.gender === g
                        ? 'bg-amber-500 text-[#0a0f1d] border-amber-400'
                        : 'bg-[#0a0f1d] text-amber-400 border-amber-500/40 hover:border-amber-500'
                    }`}
                  >
                    {g === 'male' ? '♂ LAKI-LAKI' : '♀ PEREMPUAN'}
                  </button>
                ))}
              </div>
            </div>

            {/* Warna Kulit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-amber-400">
                WARNA KULIT
              </label>
              <div className="flex gap-2">
                {skinColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAvatar({ ...avatar, skinColor: color });
                    }}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                      avatar.skinColor === color ? 'border-amber-400 scale-110' : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Warna Baju */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-amber-400">
                WARNA BAJU
              </label>
              <div className="flex gap-2">
                {shirtColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAvatar({ ...avatar, shirtColor: color });
                    }}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                      avatar.shirtColor === color ? 'border-amber-400 scale-110' : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Warna Celana */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-amber-400">
                WARNA CELANA
              </label>
              <div className="flex gap-2">
                {pantsColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAvatar({ ...avatar, pantsColor: color });
                    }}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                      avatar.pantsColor === color ? 'border-amber-400 scale-110' : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Topi */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-amber-400">
                TOPI / AKSESORIS KEPALA
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {hatTypes.map((h) => (
                  <button
                    key={h.type}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAvatar({ ...avatar, hatType: h.type });
                    }}
                    className={`py-1 px-2 rounded-lg border text-[11px] font-bold uppercase transition-all cursor-pointer ${
                      avatar.hatType === h.type
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-neutral-900 text-amber-400 border-neutral-800 hover:border-amber-500'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-amber-400 text-xs font-bold uppercase tracking-wider hover:border-amber-400 cursor-pointer transition-all"
          >
            BATAL
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" />
            <span>SIMPAN AVATAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
