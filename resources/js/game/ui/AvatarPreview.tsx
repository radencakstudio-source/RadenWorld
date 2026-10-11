/**
 * ============================================================================
 * FILE: resources/js/game/ui/AvatarPreview.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen pratinjau avatar karakter HD real-time yang menampilkan potret
 * visual karakter sesuai gender (Male & Female).
 * ============================================================================
 */

import React, { useState } from 'react';
import { IAvatarCustomization } from '../types';

interface AvatarPreviewProps {
  avatar: IAvatarCustomization;
  size?: number;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ avatar, size = 120 }) => {
  const [imgError, setImgError] = useState(false);

  const isFemale = avatar?.gender === 'female';
  const primaryAvatarSrc = isFemale
    ? '/assets/sprites/characters/Player/Female/FemaleAvatar.png'
    : '/assets/sprites/characters/Player/Male/MaleAvatar.png';

  const fallbackIdleSrc = isFemale
    ? '/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female.png'
    : '/assets/sprites/characters/Player/Male/Idle/Front/Front%20Male.png';

  return (
    <div
      className="relative flex items-center justify-center rounded-2xl bg-black border border-neutral-800 overflow-hidden p-2 group"
      style={{ width: size, height: size }}
    >
      <img
        key={avatar?.gender}
        src={imgError ? fallbackIdleSrc : primaryAvatarSrc}
        alt={isFemale ? 'Karakter Perempuan (Female)' : 'Karakter Laki-Laki (Male)'}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain select-none transform transition-transform duration-200 group-hover:scale-105"
        draggable={false}
      />
    </div>
  );
};
