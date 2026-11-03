/**
 * ============================================================================
 * FILE: resources/js/game/ui/WardrobeModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal interaktif Lemari Pakaian (Wardrobe) di dalam Rumah Pribadi Karakter
 * dengan desain Cozycore Clay-Pixel.
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
  const shirtColors = ['#FFAE6D', '#A8E6CF', '#f59e0b', '#d97706', '#78350f', '#5C3A21'];
  const pantsColors = ['#5C3A21', '#78350f', '#b45309', '#f59e0b', '#FFAE6D', '#A8E6CF'];
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
    <div className="ui-modal-backdrop">
      <div className="clay-panel landscape-compact-modal w-full max-w-xl max-h-[92dvh] flex flex-col overflow-hidden text-black">
        {/* Header */}
        <div className="clay-header landscape-compact-header px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold uppercase text-black truncate">
              LEMARI PAKAIAN (GANTI AVATAR)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-neutral w-8 h-8 flex items-center justify-center shrink-0 text-black"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content: Single Scroll Container (No nested scroll traps) */}
        <div className="landscape-compact-body p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {/* Avatar Preview */}
          <div className="md:col-span-5 clay-card p-3.5 flex flex-col items-center justify-center gap-2">
            <AvatarPreview avatar={avatar} size={112} />
            <span className="clay-badge-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase text-black">
              {avatar.gender === 'female' ? '♀ PEREMPUAN' : '♂ LAKI-LAKI'}
            </span>
            {/* Swatch Ringkasan Warna Pilihan */}
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className="w-4 h-4 rounded border border-[#5C3A21]"
                style={{ backgroundColor: avatar.skinColor }}
                title="Warna Kulit"
              />
              <span
                className="w-4 h-4 rounded border border-[#5C3A21]"
                style={{ backgroundColor: avatar.shirtColor }}
                title="Warna Baju"
              />
              <span
                className="w-4 h-4 rounded border border-[#5C3A21]"
                style={{ backgroundColor: avatar.pantsColor }}
                title="Warna Celana"
              />
              <span className="text-[10px] font-bold text-black ml-1">
                {hatTypes.find((h) => h.type === avatar.hatType)?.label || 'Polos'}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="md:col-span-7 space-y-3">
            {/* Gender */}
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1.5 text-black">
                GENDER KARAKTER
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
                    className={`py-2 px-3 text-xs font-bold uppercase ${
                      avatar.gender === g ? 'clay-btn-primary' : 'clay-btn-neutral'
                    }`}
                  >
                    {g === 'male' ? '♂ LAKI-LAKI' : '♀ PEREMPUAN'}
                  </button>
                ))}
              </div>
            </div>

            {/* Warna Kulit */}
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1.5 text-black">
                WARNA KULIT
              </label>
              <div className="flex flex-wrap gap-2">
                {skinColors.map((color) => {
                  const active = avatar.skinColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAvatar({ ...avatar, skinColor: color });
                      }}
                      className="w-8 h-8 rounded-lg border-2 border-[#5C3A21] flex items-center justify-center active:translate-y-[2px] cursor-pointer"
                      style={{
                        backgroundColor: color,
                        boxShadow: active ? '0 0 0 2px #A8E6CF, 0 2px 0 #5C3A21' : '0 2px 0 #5C3A21',
                      }}
                    >
                      {active && <Check className="w-4 h-4 text-black stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Warna Baju */}
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1.5 text-black">
                WARNA BAJU
              </label>
              <div className="flex flex-wrap gap-2">
                {shirtColors.map((color) => {
                  const active = avatar.shirtColor === color;
                  const isDark = color === '#5C3A21' || color === '#78350f';
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAvatar({ ...avatar, shirtColor: color });
                      }}
                      className="w-8 h-8 rounded-lg border-2 border-[#5C3A21] flex items-center justify-center active:translate-y-[2px] cursor-pointer"
                      style={{
                        backgroundColor: color,
                        boxShadow: active ? '0 0 0 2px #A8E6CF, 0 2px 0 #5C3A21' : '0 2px 0 #5C3A21',
                      }}
                    >
                      {active && <Check className={`w-4 h-4 stroke-[3] ${isDark ? 'text-white' : 'text-black'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Warna Celana */}
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1.5 text-black">
                WARNA CELANA
              </label>
              <div className="flex flex-wrap gap-2">
                {pantsColors.map((color) => {
                  const active = avatar.pantsColor === color;
                  const isDark = color === '#5C3A21' || color === '#78350f';
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAvatar({ ...avatar, pantsColor: color });
                      }}
                      className="w-8 h-8 rounded-lg border-2 border-[#5C3A21] flex items-center justify-center active:translate-y-[2px] cursor-pointer"
                      style={{
                        backgroundColor: color,
                        boxShadow: active ? '0 0 0 2px #A8E6CF, 0 2px 0 #5C3A21' : '0 2px 0 #5C3A21',
                      }}
                    >
                      {active && <Check className={`w-4 h-4 stroke-[3] ${isDark ? 'text-white' : 'text-black'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topi */}
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1.5 text-black">
                TOPI / AKSESORI KEPALA
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hatTypes.map((h) => (
                  <button
                    key={h.type}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAvatar({ ...avatar, hatType: h.type });
                    }}
                    className={`py-1.5 px-2 text-[11px] font-bold uppercase ${
                      avatar.hatType === h.type ? 'clay-btn-secondary' : 'clay-btn-neutral'
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
        <div className="px-4 py-3 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-neutral px-4 py-2 text-black text-xs font-bold uppercase"
          >
            BATAL
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="clay-btn-primary flex items-center gap-1.5 px-5 py-2 text-black text-xs font-bold uppercase"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>SIMPAN AVATAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
