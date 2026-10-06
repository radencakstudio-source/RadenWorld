/**
 * ============================================================================
 * FILE: resources/js/game/ui/AvatarPreview.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen pratinjau avatar 2D vektor real-time yang merespons perubahan:
 * 1. Gender (Laki-laki / Perempuan)
 * 2. Warna Kulit
 * 3. Warna Baju
 * 4. Warna Celana
 * 5. Pilihan Topi
 * ============================================================================
 */

import React from 'react';
import { IAvatarCustomization } from '../types';

interface AvatarPreviewProps {
  avatar: IAvatarCustomization;
  size?: number;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ avatar, size = 120 }) => {
  const safeAvatar: IAvatarCustomization = {
    gender: avatar?.gender === 'female' ? 'female' : 'male',
    skinColor: avatar?.skinColor || '#fed7aa',
    shirtColor: avatar?.shirtColor || '#2563eb',
    pantsColor: avatar?.pantsColor || '#1e293b',
    hatType: avatar?.hatType || 'none',
  };

  const isFemale = safeAvatar.gender === 'female';

  return (
    <div
      className="relative flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 shadow-inner overflow-hidden p-2"
      style={{ width: size, height: size }}
    >
      {/* Subtle radial backdrop */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

      <svg
        viewBox="0 0 48 48"
        className="w-full h-full drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bayangan di bawah kaki */}
        <ellipse cx="24" cy="44" rx="14" ry="3.5" fill="rgba(0,0,0,0.4)" />

        {/* Celana & Kaki */}
        <rect x="17" y="33" width="5" height="9" rx="1" fill={safeAvatar.pantsColor} />
        <rect x="26" y="33" width="5" height="9" rx="1" fill={safeAvatar.pantsColor} />
        {/* Sepatu */}
        <rect x="16" y="40" width="6" height="3" rx="1" fill="#0f172a" />
        <rect x="26" y="40" width="6" height="3" rx="1" fill="#0f172a" />

        {/* Badan / Baju */}
        <rect x="16" y="20" width="16" height="14" rx="2.5" fill={safeAvatar.shirtColor} />

        {/* Sabuk */}
        <rect x="16" y="31" width="16" height="3" fill="#78350f" />
        <rect x="22" y="31" width="4" height="3" fill="#fbbf24" />

        {/* Lengan Baju */}
        <rect x="13" y="22" width="3" height="8" rx="1" fill={safeAvatar.shirtColor} />
        <rect x="32" y="22" width="3" height="8" rx="1" fill={safeAvatar.shirtColor} />

        {/* Telapak Tangan (Warna Kulit) */}
        <circle cx="14.5" cy="31" r="2" fill={safeAvatar.skinColor} />
        <circle cx="33.5" cy="31" r="2" fill={safeAvatar.skinColor} />

        {/* Kepala / Wajah (Warna Kulit) */}
        <circle cx="24" cy="14" r="8" fill={safeAvatar.skinColor} />

        {/* Rambut berdasarkan Gender */}
        {isFemale ? (
          <g fill="#3b2f2f">
            {/* Rambut Perempuan Lebih Panjang */}
            <circle cx="24" cy="11" r="8.5" />
            <rect x="14" y="12" width="3" height="14" rx="1.5" />
            <rect x="31" y="12" width="3" height="14" rx="1.5" />
          </g>
        ) : (
          <g fill="#1e1b18">
            {/* Rambut Laki-Laki Rapi */}
            <circle cx="24" cy="10" r="8.5" />
            <rect x="15" y="11" width="2.5" height="5" rx="1" />
            <rect x="30.5" y="11" width="2.5" height="5" rx="1" />
          </g>
        )}

        {/* Mata */}
        <circle cx="21.5" cy="14" r="1.3" fill="#0f172a" />
        <circle cx="26.5" cy="14" r="1.3" fill="#0f172a" />
        {/* Senyum */}
        <path d="M23 17 Q24 18 25 17" stroke="#78350f" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Topi yang Dipilih */}
        {safeAvatar.hatType === 'adventurer' && (
          <g>
            <ellipse cx="24" cy="10" rx="14" ry="3.5" fill="#92400e" />
            <rect x="18" y="4" width="12" height="7" rx="1.5" fill="#78350f" />
            <rect x="18" y="8" width="12" height="2" fill="#f59e0b" />
          </g>
        )}

        {safeAvatar.hatType === 'knight' && (
          <g>
            <circle cx="24" cy="11" r="9" fill="#64748b" />
            <rect x="17" y="11" width="14" height="4" rx="1" fill="#475569" />
            <rect x="23" y="1" width="2" height="6" fill="#ef4444" />
          </g>
        )}

        {safeAvatar.hatType === 'bandana' && (
          <g>
            <rect x="16" y="9" width="16" height="4" rx="1" fill="#dc2626" />
            <polygon points="14,10 12,16 16,13" fill="#b91c1c" />
          </g>
        )}

        {safeAvatar.hatType === 'wizard' && (
          <g>
            <ellipse cx="24" cy="10" rx="13" ry="3.5" fill="#6d28d9" />
            <polygon points="24,0 17,9 31,9" fill="#5b21b6" />
            <circle cx="24" cy="2" r="2" fill="#fbbf24" />
          </g>
        )}

        {safeAvatar.hatType === 'crown' && (
          <g>
            {/* Dasar Mahkota Emas Kerajaan Super Admin */}
            <rect x="17" y="7" width="14" height="3" rx="0.5" fill="#f59e0b" />
            {/* Tiga Puncak Mahkota */}
            <polygon points="17,7 19,2 22,7" fill="#f59e0b" />
            <polygon points="21,7 24,0 27,7" fill="#fbbf24" />
            <polygon points="26,7 29,2 31,7" fill="#f59e0b" />
            {/* Permata Merah Rubi di Tengah */}
            <circle cx="24" cy="5.5" r="1.5" fill="#ef4444" />
            {/* Permata Safir Biru di Kiri & Kanan */}
            <circle cx="19" cy="6.5" r="1" fill="#38bdf8" />
            <circle cx="29" cy="6.5" r="1" fill="#38bdf8" />
          </g>
        )}
      </svg>
    </div>
  );
};
