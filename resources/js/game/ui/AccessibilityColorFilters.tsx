/**
 * ============================================================================
 * FILE: resources/js/game/ui/AccessibilityColorFilters.tsx
 * ============================================================================
 * Komponen SVG Tersembunyi Penyedia Matriks Warna Medis Standar:
 * - Protanopia (Kelemahan reseptor merah)
 * - Deuteranopia (Kelemahan reseptor hijau)
 * - Tritanopia (Kelemahan reseptor biru)
 * ============================================================================
 */

import React from 'react';

export const AccessibilityColorFilters: React.FC = () => {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none', opacity: 0 }}
      aria-hidden="true"
    >
      <defs>
        {/* Filter Protanopia (Merah) */}
        <filter id="raden-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0"
          />
        </filter>

        {/* Filter Deuteranopia (Hijau) */}
        <filter id="raden-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0"
          />
        </filter>

        {/* Filter Tritanopia (Biru) */}
        <filter id="raden-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0"
          />
        </filter>
      </defs>
    </svg>
  );
};

