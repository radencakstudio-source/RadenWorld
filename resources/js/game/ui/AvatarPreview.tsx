/**
 * ============================================================================
 * FILE: resources/js/game/ui/AvatarPreview.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen pratinjau avatar karakter HD real-time yang menampilkan potret
 * visual karakter sesuai gender (Male & Female) dalam bingkai Clay-Pixel.
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
    ? '/assets/sprites/characters/Player/Female/FemaleAvatar.webp'
    : '/assets/sprites/characters/Player/Male/MaleAvatar.webp';

  const fallbackIdleSrc = isFemale
    ? '/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female.webp'
    : '/assets/sprites/characters/Player/Male/Idle/Front/Front%20Male.webp';

  const padPx = size <= 36 ? 2 : size <= 64 ? 4 : 8;
  const radiusPx = size <= 40 ? 8 : 12;

  const hatEmoji =
    avatar?.hatType === 'crown'
      ? '👑'
      : avatar?.hatType === 'wizard'
      ? '🧙'
      : avatar?.hatType === 'adventurer'
      ? '👒'
      : avatar?.hatType === 'knight'
      ? '🪖'
      : avatar?.hatType === 'bandana'
      ? '🎀'
      : null;

  return (
    <div
      className="relative flex items-center justify-center bg-[#FFF8EA] border-2 border-[#5C3A21] overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        padding: padPx,
        borderRadius: radiusPx,
        boxShadow: 'inset 0 2px 0 #FFFFFF, inset 0 -2px 0 #EADBC0',
      }}
    >
      <img
        key={avatar?.gender}
        src={imgError ? fallbackIdleSrc : primaryAvatarSrc}
        alt={isFemale ? 'Karakter Perempuan (Female)' : 'Karakter Laki-Laki (Male)'}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain select-none pixelated"
        draggable={false}
      />
      {size >= 84 && hatEmoji && (
        <span
          className="absolute top-1 right-1 px-1 py-0.5 text-[11px] leading-none bg-[#A8E6CF] border border-[#5C3A21] rounded text-black pointer-events-none"
          title={`Aksesori: ${avatar?.hatType}`}
        >
          {hatEmoji}
        </span>
      )}
    </div>
  );
};
