/**
 * ============================================================================
 * FILE: resources/js/game/ui/WorldMapSvg.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Peta Kartografi Vektor RadenWorld (80x80 Petak Grid @ 120px = 9600x9600px)
 * Bergaya Cozycore Clay-Pixel:
 * - 100% presisi mengikuti koordinat grid asli WorldScene.ts & WorldProps.ts.
 * - Menggunakan SVG <pattern> super ringan (menggantikan ratusan <rect> DOM).
 * - Gradasi kedalaman laut pesisir, dermaga kayu hangat, alun-alun granit,
 *   atap gedung 2.5D detail, 44 titik lampu jalan menyala, dan pill label rapi.
 * ============================================================================
 */

import React from 'react';
import { Direction } from '../types';

export interface IMapMarker {
  x: number;
  y: number;
  label?: string;
}

interface WorldMapSvgProps {
  playerGridX?: number;
  playerGridY?: number;
  playerDirection?: Direction;
  isMini?: boolean;
  className?: string;
  customMarker?: IMapMarker | null;
  onMapClick?: (gx: number, gy: number) => void;
  showGridLines?: boolean;
}

const STREET_LAMP_COORDS: Array<{ gx: number; gy: number }> = [
  { gx: 3, gy: 9 }, { gx: 10, gy: 9 }, { gx: 17, gy: 9 }, { gx: 22, gy: 9 },
  { gx: 3, gy: 14 }, { gx: 10, gy: 14 }, { gx: 17, gy: 14 },
  { gx: 57, gy: 9 }, { gx: 62, gy: 9 }, { gx: 69, gy: 9 }, { gx: 76, gy: 9 },
  { gx: 62, gy: 14 }, { gx: 69, gy: 14 }, { gx: 76, gy: 14 },
  { gx: 22, gy: 15 }, { gx: 29, gy: 15 }, { gx: 35, gy: 15 }, { gx: 42, gy: 15 }, { gx: 57, gy: 15 },
  { gx: 17, gy: 22 }, { gx: 17, gy: 32 }, { gx: 17, gy: 37 }, { gx: 17, gy: 47 }, { gx: 17, gy: 52 }, { gx: 17, gy: 62 },
  { gx: 62, gy: 20 }, { gx: 62, gy: 25 }, { gx: 62, gy: 32 }, { gx: 62, gy: 45 }, { gx: 62, gy: 50 }, { gx: 62, gy: 57 },
  { gx: 22, gy: 61 }, { gx: 26, gy: 61 }, { gx: 30, gy: 61 }, { gx: 34, gy: 61 }, { gx: 40, gy: 61 },
  { gx: 45, gy: 61 }, { gx: 49, gy: 61 }, { gx: 53, gy: 61 }, { gx: 57, gy: 61 },
  { gx: 3, gy: 62 }, { gx: 10, gy: 62 },
  { gx: 62, gy: 62 }, { gx: 69, gy: 62 }, { gx: 76, gy: 62 },
  { gx: 3, gy: 67 }, { gx: 10, gy: 67 }, { gx: 17, gy: 67 }, { gx: 22, gy: 67 },
  { gx: 57, gy: 67 }, { gx: 62, gy: 67 }, { gx: 69, gy: 67 }, { gx: 76, gy: 67 },
];

export const WorldMapSvg: React.FC<WorldMapSvgProps> = React.memo(({
  playerGridX = 20,
  playerGridY = 20,
  playerDirection = 'down',
  isMini = false,
  className = 'w-full h-full',
  customMarker = null,
  onMapClick,
  showGridLines = true,
}) => {
  const px = Math.max(1, Math.min(78, playerGridX));
  const py = Math.max(1, Math.min(78, playerGridY));

  let visionAngle = 90;
  if (playerDirection === 'up') visionAngle = 270;
  else if (playerDirection === 'left') visionAngle = 180;
  else if (playerDirection === 'right') visionAngle = 0;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const gx = Math.max(0, Math.min(79, Math.floor((clickX / rect.width) * 80)));
    const gy = Math.max(0, Math.min(79, Math.floor((clickY / rect.height) * 80)));
    onMapClick(gx, gy);
  };

  const renderPillLabel = (
    x: number,
    y: number,
    text: string,
    w: number,
    bg: string = '#FFF8EA',
    fontSize: number = 1.15
  ) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-w / 2}
        y={-1.05}
        width={w}
        height={2.0}
        rx={0.55}
        fill={bg}
        stroke="#5C3A21"
        strokeWidth={0.18}
      />
      <text
        x={0}
        y={0.35}
        fill="#000000"
        fontSize={fontSize}
        fontWeight="900"
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={handleSvgClick}
    >
      <defs>
        {/* 1. Padang Rumput Cozy (Selaras BootScene world-checker-tile) */}
        <pattern id="worldGrassPattern" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#3A9D4A" />
          <rect x="1" y="1" width="1" height="1" fill="#3A9D4A" />
          <rect x="1" y="0" width="1" height="1" fill="#52B663" />
          <rect x="0" y="1" width="1" height="1" fill="#52B663" />
          <line x1="0" y1="1" x2="2" y2="1" stroke="#2D843C" strokeWidth="0.04" opacity="0.35" />
          <line x1="1" y1="0" x2="1" y2="2" stroke="#2D843C" strokeWidth="0.04" opacity="0.35" />
        </pattern>

        {/* 2. Pasir Pantai Hangat */}
        <pattern id="beachTilePattern" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#D4B475" />
          <rect x="1" y="1" width="1" height="1" fill="#D4B475" />
          <rect x="1" y="0" width="1" height="1" fill="#F3E3BE" />
          <rect x="0" y="1" width="1" height="1" fill="#F3E3BE" />
        </pattern>

        {/* 3. Granit Alun-Alun Kota */}
        <pattern id="plazaStonePattern" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#64748B" />
          <rect x="1" y="1" width="1" height="1" fill="#64748B" />
          <rect x="1" y="0" width="1" height="1" fill="#78879D" />
          <rect x="0" y="1" width="1" height="1" fill="#78879D" />
          <rect width="2" height="2" fill="none" stroke="#475569" strokeWidth="0.05" opacity="0.5" />
        </pattern>

        {/* 4. 6 Pola Pelataran Gedung Barat (Menggantikan 750 <rect> DOM!) */}
        <pattern id="patGroundCafe" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#A9603E" />
          <rect x="1" y="1" width="1" height="1" fill="#A9603E" />
          <rect x="1" y="0" width="1" height="1" fill="#DFAA8E" />
          <rect x="0" y="1" width="1" height="1" fill="#DFAA8E" />
        </pattern>
        <pattern id="patGroundLibrary" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#B8C2CC" />
          <rect x="1" y="1" width="1" height="1" fill="#B8C2CC" />
          <rect x="1" y="0" width="1" height="1" fill="#F8FAFC" />
          <rect x="0" y="1" width="1" height="1" fill="#F8FAFC" />
        </pattern>
        <pattern id="patGroundPolice" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#6D84AD" />
          <rect x="1" y="1" width="1" height="1" fill="#6D84AD" />
          <rect x="1" y="0" width="1" height="1" fill="#C9DCFB" />
          <rect x="0" y="1" width="1" height="1" fill="#C9DCFB" />
        </pattern>
        <pattern id="patGroundBank" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#A39E93" />
          <rect x="1" y="1" width="1" height="1" fill="#A39E93" />
          <rect x="1" y="0" width="1" height="1" fill="#FFF3DF" />
          <rect x="0" y="1" width="1" height="1" fill="#FFF3DF" />
        </pattern>
        <pattern id="patGroundPharmacy" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#43A865" />
          <rect x="1" y="1" width="1" height="1" fill="#43A865" />
          <rect x="1" y="0" width="1" height="1" fill="#A8E6CF" />
          <rect x="0" y="1" width="1" height="1" fill="#A8E6CF" />
        </pattern>
        <pattern id="patGroundRealtor" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#9A5B2D" />
          <rect x="1" y="1" width="1" height="1" fill="#9A5B2D" />
          <rect x="1" y="0" width="1" height="1" fill="#FFD6B0" />
          <rect x="0" y="1" width="1" height="1" fill="#FFD6B0" />
        </pattern>

        {/* 5. Pola Lahan Pertanian Subur */}
        <pattern id="digSoilPattern" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#5D3A1A" />
          <rect x="0.1" y="0.12" width="0.8" height="0.3" rx="0.12" fill="#8B5A2B" />
          <rect x="0.1" y="0.56" width="0.8" height="0.3" rx="0.12" fill="#8B5A2B" />
          <circle cx="0.32" cy="0.27" r="0.09" fill="#4ADE80" />
          <circle cx="0.68" cy="0.71" r="0.09" fill="#4ADE80" />
        </pattern>

        {/* 6. Gradasi Kedalaman Lautan Timur */}
        <linearGradient id="eastOceanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="30%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* 7. Grid Halus 1x1 */}
        <pattern id="gridOverlayPattern" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="none" stroke="#FFFFFF" strokeWidth="0.03" opacity="0.14" />
        </pattern>
      </defs>

      {/* 1. DASAR PADANG RUMPUT ASRI */}
      <rect x="0" y="0" width="80" height="80" fill="url(#worldGrassPattern)" />

      {/* 2. PERAIRAN LAUT TIMUR & OMBAK PESISIR */}
      <rect x="63" y="17" width="17" height="47" fill="url(#eastOceanGrad)" />
      <line x1="63.35" y1="17" x2="63.35" y2="64" stroke="#E0F2FE" strokeWidth="0.35" strokeDasharray="1.4, 0.7" opacity="0.9" />
      {[21, 31, 44, 57].map((wy, idx) => (
        <path
          key={`wave_${idx}`}
          d={`M 66 ${wy} Q 68 ${wy - 0.5} 70 ${wy} T 74 ${wy} M 72 ${wy + 3.5} Q 74 ${wy + 3} 76 ${wy + 3.5} T 79 ${wy + 3.5}`}
          fill="none"
          stroke="#BAE6FD"
          strokeWidth="0.18"
          strokeLinecap="round"
          opacity="0.75"
        />
      ))}

      {/* 3 DERMAGA KAYU JATI HANGAT (gx: 63..73) */}
      {[26, 39, 53].map((pyDock, idx) => (
        <g key={`dock_${idx}`}>
          <rect x="63" y={pyDock + 0.25} width="11.2" height="2" rx="0.2" fill="#0369A1" opacity="0.45" />
          <rect x="63" y={pyDock} width="11" height="2" rx="0.2" fill="#C68B59" stroke="#5C3A21" strokeWidth="0.16" />
          {[64.5, 66, 67.5, 69, 70.5, 72].map((plankX) => (
            <line key={plankX} x1={plankX} y1={pyDock + 0.1} x2={plankX} y2={pyDock + 1.9} stroke="#78350F" strokeWidth="0.1" />
          ))}
          <circle cx="73.4" cy={pyDock + 0.35} r="0.22" fill="#5C3A21" />
          <circle cx="73.4" cy={pyDock + 1.65} r="0.22" fill="#5C3A21" />
        </g>
      ))}

      {/* 3. PANTAI PASIR SELATAN & SAMUDRA SELATAN */}
      <rect x="23" y="64" width="34" height="6" fill="url(#beachTilePattern)" />
      <rect x="0" y="70" width="79" height="9" fill="url(#beachTilePattern)" />
      <rect x="79" y="70" width="1" height="9" fill="#0284C7" />
      <rect x="0" y="79" width="80" height="1" fill="#0284C7" />
      <line x1="0" y1="78.85" x2="79" y2="78.85" stroke="#FFFFFF" strokeWidth="0.32" strokeDasharray="1.6, 0.8" opacity="0.95" />
      <line x1="78.85" y1="70" x2="78.85" y2="79" stroke="#FFFFFF" strokeWidth="0.32" strokeDasharray="1.6, 0.8" opacity="0.95" />

      {/* 4. TROTOAR & PELATARAN ALUN-ALUN GRANIT */}
      <rect x="61" y="16" width="2" height="49" fill="#CBD5E1" stroke="#475569" strokeWidth="0.12" />
      <rect x="0" y="12" width="19" height="1" fill="#CBD5E1" opacity="0.88" />
      <rect x="61" y="12" width="19" height="1" fill="#CBD5E1" opacity="0.88" />
      <rect x="0" y="15" width="18" height="1" fill="#CBD5E1" opacity="0.88" />
      <rect x="62" y="15" width="18" height="1" fill="#CBD5E1" opacity="0.88" />
      <rect x="0" y="65" width="18" height="1" fill="#CBD5E1" opacity="0.88" />
      <rect x="62" y="65" width="18" height="1" fill="#CBD5E1" opacity="0.88" />
      <rect x="0" y="68" width="19" height="1" fill="#CBD5E1" opacity="0.88" />
      <rect x="61" y="68" width="19" height="1" fill="#CBD5E1" opacity="0.88" />

      <rect x="21" y="18" width="38" height="1" fill="#CBD5E1" opacity="0.9" />
      <rect x="21" y="21" width="38" height="1" fill="#CBD5E1" opacity="0.9" />
      <rect x="21" y="59" width="38" height="1" fill="#CBD5E1" opacity="0.9" />

      {/* Alun-Alun Utama dengan Ornamen Kompas Tengah */}
      <rect x="22" y="22" width="36" height="37" fill="url(#plazaStonePattern)" stroke="#334155" strokeWidth="0.18" />
      <rect x="23.2" y="23.2" width="33.6" height="34.6" rx="0.6" fill="none" stroke="#CBD5E1" strokeWidth="0.14" opacity="0.55" />
      <circle cx="38.5" cy="36" r="4.2" fill="#FFF8EA" fillOpacity="0.22" stroke="#FFF8EA" strokeWidth="0.2" opacity="0.7" />
      <circle cx="38.5" cy="36" r="2.2" fill="#38BDF8" fillOpacity="0.55" stroke="#FFF8EA" strokeWidth="0.22" />
      <circle cx="38.5" cy="36" r="0.75" fill="#FFF8EA" />

      {/* Lapangan Sepak Bola (gx: 24..33, gy: 53..57) */}
      <g id="map_soccer_field">
        <rect x="24" y="53" width="10" height="5" rx="0.2" fill="#15803D" stroke="#14532D" strokeWidth="0.14" />
        <rect x="24.45" y="53.25" width="9.1" height="4.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="0.09" />
        <line x1="29" y1="53.25" x2="29" y2="57.75" stroke="#FFFFFF" strokeWidth="0.09" />
        <circle cx="29" cy="55.5" r="0.75" fill="none" stroke="#FFFFFF" strokeWidth="0.09" />
        <rect x="24.45" y="54.3" width="1.5" height="2.4" fill="none" stroke="#FFFFFF" strokeWidth="0.08" />
        <rect x="32.05" y="54.3" width="1.5" height="2.4" fill="none" stroke="#FFFFFF" strokeWidth="0.08" />
      </g>

      {/* Lapangan Basket (gx: 46..55, gy: 53..57) */}
      <g id="map_basketball_court">
        <rect x="46" y="53" width="10" height="5" rx="0.2" fill="#1E3A8A" stroke="#172554" strokeWidth="0.14" />
        <rect x="46.45" y="53.25" width="9.1" height="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.09" />
        <rect x="46.45" y="54.6" width="1.8" height="1.8" fill="#EA580C" stroke="#FFFFFF" strokeWidth="0.08" />
        <rect x="53.75" y="54.6" width="1.8" height="1.8" fill="#EA580C" stroke="#FFFFFF" strokeWidth="0.08" />
        <line x1="51" y1="53.25" x2="51" y2="57.75" stroke="#FFFFFF" strokeWidth="0.09" />
        <circle cx="51" cy="55.5" r="0.7" fill="#EA580C" stroke="#FFFFFF" strokeWidth="0.09" />
      </g>

      {/* Deretan Pohon Alun-Alun (y=31 & y=46) */}
      {[31, 46].map((ty) =>
        [...Array.from({ length: 11 }, (_, i) => 22 + i), ...Array.from({ length: 14 }, (_, i) => 44 + i)].map((gx) => (
          <g key={`tree_${ty}_${gx}`}>
            <circle cx={gx + 0.5} cy={ty + 1.4} r="0.62" fill="#166534" />
            <circle cx={gx + 0.5} cy={ty + 1.15} r="0.56" fill="#22C55E" stroke="#14532D" strokeWidth="0.08" />
          </g>
        ))
      )}

      {/* 2 Papan Billboard Alun-Alun */}
      {[22, 45].map((bx, idx) => (
        <g key={`bb_${idx}`}>
          <rect x={bx + 0.6} y="41" width="8.8" height="6.2" rx="0.35" fill="#5C3A21" stroke="#FFF8EA" strokeWidth="0.14" />
          <rect x={bx + 1.1} y="41.45" width="7.8" height="5.3" rx="0.2" fill="#FFAE6D" />
          <text x={bx + 5} y="44.5" fill="#000000" fontSize="1.05" fontWeight="900" textAnchor="middle">
            BILLBOARD {idx + 1}
          </text>
        </g>
      ))}

      {/* Pelataran Kompleks Sekolah Utara (gx: 23..56, gy: 0..16) */}
      <rect x="23" y="0" width="34" height="17" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.14" />
      <rect x="23" y="0" width="0.8" height="17" fill="#64748B" />
      <rect x="42" y="0" width="0.8" height="17" fill="#64748B" />
      <rect x="56" y="0" width="0.8" height="16" fill="#64748B" />

      {/* 3 Gedung Sekolah (SD, SMP, SMA) dengan Atap 2.5D */}
      {[
        { gx: 25, roof: '#DC2626', wall: '#FEE2E2', door: '#991B1B' },
        { gx: 31, roof: '#2563EB', wall: '#DBEAFE', door: '#1E3A8A' },
        { gx: 37, roof: '#0891B2', wall: '#CFFAFE', door: '#155E75' },
      ].map((s, idx) => (
        <g key={`school_${idx}`}>
          <rect x={s.gx} y="0.4" width="5" height="9.4" rx="0.3" fill={s.wall} stroke="#5C3A21" strokeWidth="0.16" />
          <rect x={s.gx} y="0.4" width="5" height="5.2" rx="0.3" fill={s.roof} stroke="#5C3A21" strokeWidth="0.16" />
          <rect x={s.gx + 1.8} y="7.6" width="1.4" height="2.2" rx="0.15" fill={s.door} />
          <rect x={s.gx + 0.6} y="6.2" width="0.9" height="0.9" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="0.08" />
          <rect x={s.gx + 3.5} y="6.2" width="0.9" height="0.9" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="0.08" />
        </g>
      ))}

      {/* Lahan Pertanian Timur Laut (gx: 57..80, gy: 1..9) */}
      <rect x="57" y="1" width="23" height="9" rx="0.3" fill="url(#digSoilPattern)" stroke="#5C3A21" strokeWidth="0.2" />

      {/* Rumah Pribadi Pemain 5x5 (gx: 9..13, gy: 2..6) */}
      <g id="player_house_map">
        <rect x="7" y="2" width="9" height="6" rx="0.4" fill="#2F873E" opacity="0.35" />
        <rect x="9.2" y="3.2" width="4.6" height="3.8" rx="0.25" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="0.16" />
        <polygon points="8.7,3.6 11.5,1.6 14.3,3.6" fill="#E15B3E" stroke="#5C3A21" strokeWidth="0.16" />
        <rect x="11.05" y="5.1" width="0.9" height="1.9" rx="0.12" fill="#8B5A2B" stroke="#5C3A21" strokeWidth="0.1" />
        <rect x="9.7" y="4.2" width="0.8" height="0.8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="0.08" />
        <rect x="12.5" y="4.2" width="0.8" height="0.8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="0.08" />
      </g>

      {/* Pohon Zigzag Residensial */}
      {[
        { x: 19, y: 8 }, { x: 18, y: 7 }, { x: 19, y: 6 }, { x: 18, y: 5 }, { x: 19, y: 4 }, { x: 18, y: 3 }, { x: 19, y: 2 }, { x: 18, y: 1 },
        { x: 2, y: 8 }, { x: 3, y: 7 }, { x: 2, y: 6 }, { x: 3, y: 5 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 },
      ].map((pos, idx) => (
        <circle key={`res_tree_${idx}`} cx={pos.x + 0.5} cy={pos.y + 1.2} r="0.65" fill="#22C55E" stroke="#14532D" strokeWidth="0.1" />
      ))}

      {/* 6 Pelataran & Gedung Komersial Barat (Ringan via Pattern) */}
      <rect x="1" y="17" width="8" height="15" fill="url(#patGroundCafe)" stroke="#5C3A21" strokeWidth="0.1" />
      <rect x="9" y="17" width="8" height="15" fill="url(#patGroundLibrary)" stroke="#5C3A21" strokeWidth="0.1" />
      <rect x="1" y="32" width="8" height="16" fill="url(#patGroundPolice)" stroke="#5C3A21" strokeWidth="0.1" />
      <rect x="9" y="32" width="8" height="16" fill="url(#patGroundBank)" stroke="#5C3A21" strokeWidth="0.1" />
      <rect x="1" y="48" width="8" height="16" fill="url(#patGroundPharmacy)" stroke="#5C3A21" strokeWidth="0.1" />
      <rect x="9" y="48" width="8" height="16" fill="url(#patGroundRealtor)" stroke="#5C3A21" strokeWidth="0.1" />

      {/* 6 Gedung 5x5 Barat dengan Detail Atap Khas */}
      {[
        { gx: 1, gy: 17, roof: '#B45309', wall: '#FEF3C7', accent: '#FFAE6D' },
        { gx: 12, gy: 17, roof: '#0284C7', wall: '#E0F2FE', accent: '#BAE6FD' },
        { gx: 1, gy: 32, roof: '#1E3A8A', wall: '#DBEAFE', accent: '#93C5FD' },
        { gx: 12, gy: 32, roof: '#CA8A04', wall: '#FEF9C3', accent: '#FDE047' },
        { gx: 1, gy: 48, roof: '#059669', wall: '#D1FAE5', accent: '#A8E6CF' },
        { gx: 12, gy: 48, roof: '#7C2D12', wall: '#FFEDD5', accent: '#FDBA74' },
      ].map((b, idx) => (
        <g key={`west_bldg_${idx}`}>
          <rect x={b.gx} y={b.gy} width="5" height="5" rx="0.3" fill={b.wall} stroke="#5C3A21" strokeWidth="0.18" />
          <rect x={b.gx} y={b.gy} width="5" height="2.6" rx="0.3" fill={b.roof} stroke="#5C3A21" strokeWidth="0.16" />
          <rect x={b.gx + 0.5} y={b.gy + 2.3} width="4" height="0.55" rx="0.12" fill={b.accent} stroke="#5C3A21" strokeWidth="0.08" />
          <rect x={b.gx + 1.9} y={b.gy + 3.4} width="1.2" height="1.6" rx="0.1" fill="#5C3A21" />
        </g>
      ))}

      {/* Trotoar Teluk Selatan */}
      <rect x="22" y="62" width="36" height="2" fill="#94A3B8" stroke="#475569" strokeWidth="0.12" />
      <rect x="21" y="63" width="2" height="7" fill="#94A3B8" stroke="#475569" strokeWidth="0.12" />
      <rect x="57" y="63" width="2" height="7" fill="#94A3B8" stroke="#475569" strokeWidth="0.12" />

      {/* 5. JARINGAN JALAN RAYA ASPAL & MARKA KUNING */}
      <rect x="19" y="13" width="2" height="55" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="20" y1="13" x2="20" y2="68" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      <rect x="59" y="13" width="2" height="55" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="60" y1="13" x2="60" y2="68" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      <rect x="0" y="13" width="19" height="2" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="0" y1="14" x2="19" y2="14" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      <rect x="61" y="13" width="19" height="2" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="61" y1="14" x2="80" y2="14" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      <rect x="21" y="19" width="38" height="2" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="21" y1="20" x2="59" y2="20" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      <rect x="21" y="60" width="38" height="2" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="21" y1="61" x2="59" y2="61" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      <rect x="0" y="66" width="19" height="2" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="0" y1="67" x2="19" y2="67" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      <rect x="61" y="66" width="19" height="2" fill="#1E293B" stroke="#0F172A" strokeWidth="0.14" />
      <line x1="61" y1="67" x2="80" y2="67" stroke="#FACC15" strokeWidth="0.22" strokeDasharray="1.1, 0.8" />

      {[
        { x: 19, y: 13 }, { x: 59, y: 13 },
        { x: 19, y: 19 }, { x: 59, y: 19 },
        { x: 19, y: 60 }, { x: 59, y: 60 },
        { x: 19, y: 66 }, { x: 59, y: 66 },
      ].map((pos, idx) => (
        <rect key={`ix_${idx}`} x={pos.x} y={pos.y} width="2" height="2" fill="#334155" stroke="#0F172A" strokeWidth="0.1" />
      ))}

      {/* 44 Titik Lampu Jalan Menyala Hangat di Sepanjang Jalan Kota */}
      <g pointerEvents="none">
        {STREET_LAMP_COORDS.map((l, idx) => (
          <g key={`lamp_dot_${idx}`}>
            <circle cx={l.gx + 0.5} cy={l.gy + 2.2} r="0.7" fill="#FDE047" opacity="0.35" />
            <circle cx={l.gx + 0.5} cy={l.gy + 2.2} r="0.28" fill="#FEF9C3" stroke="#92400E" strokeWidth="0.08" />
          </g>
        ))}
      </g>

      {/* 6. GRID KOORDINAT (Hanya di Atlas Peta Penuh) */}
      {!isMini && showGridLines && (
        <g pointerEvents="none" className="select-none">
          <rect x="0" y="0" width="80" height="80" fill="url(#gridOverlayPattern)" />
          {[10, 20, 30, 40, 50, 60, 70].map((coord) => (
            <React.Fragment key={`grid_major_${coord}`}>
              <line x1={coord} y1="0" x2={coord} y2="80" stroke="#FFFFFF" strokeWidth="0.08" opacity="0.32" strokeDasharray="0.9, 0.9" />
              <line x1="0" y1={coord} x2="80" y2={coord} stroke="#FFFFFF" strokeWidth="0.08" opacity="0.32" strokeDasharray="0.9, 0.9" />
            </React.Fragment>
          ))}
          {[10, 20, 30, 40, 50, 60, 70].map((gx) => (
            <text
              key={`gx_num_${gx}`}
              x={gx + 0.5}
              y="1.8"
              fill="#FFFFFF"
              fontSize="1.25"
              fontWeight="bold"
              stroke="#5C3A21"
              strokeWidth="0.28"
              paintOrder="stroke"
            >
              {gx}
            </text>
          ))}
          {[10, 20, 30, 40, 50, 60, 70].map((gy) => (
            <text
              key={`gy_num_${gy}`}
              x="0.7"
              y={gy + 1.5}
              fill="#FFFFFF"
              fontSize="1.25"
              fontWeight="bold"
              stroke="#5C3A21"
              strokeWidth="0.28"
              paintOrder="stroke"
            >
              {gy}
            </text>
          ))}
        </g>
      )}

      {/* 7. LABEL LOKASI PILL COZYCORE (Bersih, Rapi, Mudah Dibaca) */}
      {!isMini && (
        <g pointerEvents="none" className="select-none">
          {renderPillLabel(11.5, 8.2, 'RUMAH', 6.4, '#FFAE6D', 1.05)}
          {renderPillLabel(27.5, 11.2, 'SD', 4.4, '#FFF8EA', 1.1)}
          {renderPillLabel(33.5, 11.2, 'SMP', 4.8, '#FFF8EA', 1.1)}
          {renderPillLabel(39.5, 11.2, 'SMA', 4.8, '#FFF8EA', 1.1)}
          {renderPillLabel(68.5, 5.5, 'KEBUN TANI', 9.8, '#A8E6CF', 1.1)}

          {renderPillLabel(3.5, 19.6, 'CAFE', 5.2, '#FFF8EA', 0.95)}
          {renderPillLabel(14.5, 19.6, 'PERPUS', 6.2, '#FFF8EA', 0.95)}
          {renderPillLabel(3.5, 34.6, 'POLISI', 5.8, '#FFF8EA', 0.95)}
          {renderPillLabel(14.5, 34.6, 'BANK', 5.2, '#FFF8EA', 0.95)}
          {renderPillLabel(3.5, 50.6, 'APOTEK', 6.2, '#FFF8EA', 0.95)}
          {renderPillLabel(14.5, 50.6, 'PASAR', 5.8, '#FFF8EA', 0.95)}

          {renderPillLabel(38.5, 28.2, 'ALUN-ALUN KOTA', 13.5, '#FFAE6D', 1.2)}
          {renderPillLabel(29, 51.6, 'BOLA', 5.0, '#A8E6CF', 0.9)}
          {renderPillLabel(51, 51.6, 'BASKET', 6.0, '#A8E6CF', 0.9)}

          {renderPillLabel(71.5, 20.5, 'LAUT TIMUR', 9.6, '#A8E6CF', 1.05)}
          {renderPillLabel(68.5, 24.8, 'DERMAGA 1', 8.0, '#FFF8EA', 0.9)}
          {renderPillLabel(68.5, 37.8, 'DERMAGA 2', 8.0, '#FFF8EA', 0.9)}
          {renderPillLabel(68.5, 51.8, 'DERMAGA 3', 8.0, '#FFF8EA', 0.9)}
          {renderPillLabel(40, 74.5, 'PANTAI PASIR SELATAN', 17.5, '#FFF8EA', 1.2)}
        </g>
      )}

      {/* 8. PIN WAYPOINT KUSTOM */}
      {customMarker && (
        <g
          transform={`translate(${customMarker.x + 0.5}, ${customMarker.y + 0.5})`}
          className="pointer-events-none select-none"
        >
          <circle cx="0" cy="0" r="2.8" fill="none" stroke="#EF4444" strokeWidth="0.35" opacity="0.85">
            <animate attributeName="r" values="1.2;3.8;1.2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
          <path
            d="M 0 -3.4 C -1.4 -3.4 -2.3 -2.4 -2.3 -0.9 C -2.3 1.0 0 3.3 0 3.3 C 0 3.3 2.3 1.0 2.3 -0.9 C 2.3 -2.4 1.4 -3.4 0 -3.4 Z"
            fill="#EF4444"
            stroke="#5C3A21"
            strokeWidth="0.35"
          />
          <circle cx="0" cy="-1.0" r="0.75" fill="#FFF8EA" />

          {!isMini && (
            <g transform="translate(0, -4.8)">
              <rect x="-5.4" y="-1.7" width="10.8" height="2.3" rx="0.55" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="0.22" />
              <text x="0" y="-0.2" fill="#000000" fontSize="1.2" fontWeight="900" textAnchor="middle">
                📍 {customMarker.x},{customMarker.y}
              </text>
            </g>
          )}
        </g>
      )}

      {/* 9. PIN POSISI PEMAIN REALTIME */}
      <g transform={`translate(${px}, ${py})`} pointerEvents="none">
        <g transform={`rotate(${visionAngle})`}>
          <path d="M 0 0 L 7.5 -3.6 A 8.5 8.5 0 0 1 7.5 3.6 Z" fill="#FFAE6D" opacity="0.48" />
        </g>
        <circle cx="0" cy="0" r="2.7" fill="none" stroke="#FFAE6D" strokeWidth="0.45" opacity="0.8" />
        <circle cx="0" cy="0" r="1.75" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="0.48" />
        <circle cx="0" cy="0" r="0.65" fill="#FFFFFF" />
      </g>
    </svg>
  );
});
WorldMapSvg.displayName = 'WorldMapSvg';
