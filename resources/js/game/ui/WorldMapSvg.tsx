/**
 * ============================================================================
 * FILE: resources/js/game/ui/WorldMapSvg.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen Peta Vektor Representasi Visual Mini RadenWorld (80x80 Petak Grid).
 * 
 * 100% TERKONEKSI & AKURAT SESUAI DUNIA NYATA (WorldScene.ts):
 * 1. Dasar Dunia: Rumput hijau bersih (80x80 petak).
 * 2. Jaringan Jalan Aspal Presisi 1:1:
 *    - Jalan Horizontal Barat Laut (gy: 13..14, gx: 0..18)
 *    - Jalan Horizontal Timur Laut (gy: 13..14, gx: 61..79)
 *    - Jalan Horizontal Utara Plaza (gy: 19..20, gx: 21..58)
 *    - Jalan Horizontal Selatan Plaza (gy: 60..61, gx: 21..58)
 *    - Jalan Horizontal Barat Daya (gy: 66..67, gx: 0..18)
 *    - Jalan Horizontal Tenggara (gy: 66..67, gx: 61..79)
 *    - Jalan Vertikal Barat (gx: 19..20, gy: 13..67)
 *    - Jalan Vertikal Timur (gx: 59..60, gy: 13..67)
 *    - 8 Persimpangan Jalan (Intersections 2x2)
 * 3. Trotoar Paving & Promenade Laut Timur (gx: 61..62, gy: 16..65).
 * 4. Lautan Kristal Timur (gx: 63..80, gy: 17..64) & Pojok Timur Laut (gx: 79, gy: 0..11).
 * 5. 3 Dermaga Nelayan (gx: 63..73 di gy: 26..27, 39..40, 53..54).
 * 6. Pantai Pasir Selatan (Teluk gx: 23..56, gy: 64..69 & Pantai Utama gx: 1..78, gy: 70..78).
 * 7. Samudra Selatan (gy: 79..80).
 * 8. Area Central Plaza Terbuka & Air Mancur Patung Lamongan di Pusat (gx: 40, gy: 40).
 * 9. Marker Pemain Realtime: Pin avatar emas dengan kerucut arah pandang (Vision Cone).
 * ============================================================================
 */

import React from 'react';
import { Direction } from '../types';

interface WorldMapSvgProps {
  playerGridX?: number;
  playerGridY?: number;
  playerDirection?: Direction;
  isMini?: boolean;
  className?: string;
}

export const WorldMapSvg: React.FC<WorldMapSvgProps> = ({
  playerGridX = 20,
  playerGridY = 20,
  playerDirection = 'down',
  isMini = false,
  className = 'w-full h-full',
}) => {
  // Batasi koordinat pemain dalam grid 0..79
  const px = Math.max(1, Math.min(78, playerGridX));
  const py = Math.max(1, Math.min(78, playerGridY));

  // Hitung sudut rotasi kerucut pandangan pemain (Vision Cone)
  let visionAngle = 90; // Default: 'down'
  if (playerDirection === 'up') visionAngle = 270;
  else if (playerDirection === 'left') visionAngle = 180;
  else if (playerDirection === 'right') visionAngle = 0;

  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradien Lautan Kristal Timur & Samudra Selatan */}
        <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#00A2F3" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Gradien Pasir Pantai Selatan */}
        <linearGradient id="beachGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>

        {/* Pola Rumput Hijau Bersih */}
        <pattern id="cleanGrassPattern" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="#15803d" />
          <rect width="1" height="1" fill="#16a34a" />
          <rect x="1" y="1" width="1" height="1" fill="#16a34a" />
        </pattern>

        {/* Glow Marker Pemain */}
        <filter id="playerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.9" floodColor="#f59e0b" floodOpacity="0.95" />
        </filter>
      </defs>

      {/* ==================================================================== */}
      {/* 1. DASAR DUNIA: RUMPUT HIJAU BERSIH (0..80, 0..80)                   */}
      {/* ==================================================================== */}
      <rect x="0" y="0" width="80" height="80" fill="url(#cleanGrassPattern)" />

      {/* ==================================================================== */}
      {/* 2. PERAIRAN LAUT & PANTAI (100% SESUAI KOORDINAT WORLDSCENE)         */}
      {/* ==================================================================== */}

      {/* Lautan Kristal Timur (gx: 63..80, gy: 17..64) */}
      <rect x="63" y="17" width="17" height="47" fill="url(#oceanGrad)" />

      {/* Pojok Laut Timur Laut (gx: 79..80, gy: 0..11) */}
      <rect x="79" y="0" width="1" height="11" fill="url(#oceanGrad)" />

      {/* Teluk Pantai Tengah (gx: 23..56, gy: 64..69) */}
      <rect x="23" y="64" width="34" height="6" fill="url(#beachGrad)" />

      {/* Hamparan Utama Pantai Pasir Selatan (gx: 1..78, gy: 70..78) */}
      <rect x="1" y="70" width="78" height="9" fill="url(#beachGrad)" />

      {/* Sisi Kiri & Kanan Laut Pantai Selatan (gx: 0 dan gx: 79 di gy: 70..78) */}
      <rect x="0" y="70" width="1" height="9" fill="url(#oceanGrad)" />
      <rect x="79" y="70" width="1" height="9" fill="url(#oceanGrad)" />

      {/* Samudra Selatan Paling Bawah (gy: 79..80, gx: 0..80) */}
      <rect x="0" y="79" width="80" height="1" fill="url(#oceanGrad)" />

      {/* Garis Buih Putih Ombak di Bibir Pantai */}
      <line x1="1" y1="78.8" x2="79" y2="78.8" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="1.5, 0.8" opacity="0.85" />
      <line x1="23" y1="64" x2="57" y2="64" stroke="#ffffff" strokeWidth="0.25" strokeDasharray="1, 0.8" opacity="0.6" />

      {/* 3 Dermaga Nelayan di Laut Timur (gx: 63..73, 2 petak tebal) */}
      {/* Dermaga 1 (gy: 26..27) */}
      <rect x="63" y="26" width="11" height="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.2" rx="0.3" />
      <line x1="66" y1="26" x2="66" y2="28" stroke="#94a3b8" strokeWidth="0.15" />
      <line x1="69" y1="26" x2="69" y2="28" stroke="#94a3b8" strokeWidth="0.15" />
      <line x1="72" y1="26" x2="72" y2="28" stroke="#94a3b8" strokeWidth="0.15" />

      {/* Dermaga 2 (gy: 39..40 - Spot Nelayan Danu) */}
      <rect x="63" y="39" width="11" height="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.2" rx="0.3" />
      <line x1="66" y1="39" x2="66" y2="41" stroke="#94a3b8" strokeWidth="0.15" />
      <line x1="69" y1="39" x2="69" y2="41" stroke="#94a3b8" strokeWidth="0.15" />
      <line x1="72" y1="39" x2="72" y2="41" stroke="#94a3b8" strokeWidth="0.15" />

      {/* Dermaga 3 (gy: 53..54) */}
      <rect x="63" y="53" width="11" height="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.2" rx="0.3" />
      <line x1="66" y1="53" x2="66" y2="55" stroke="#94a3b8" strokeWidth="0.15" />
      <line x1="69" y1="53" x2="69" y2="55" stroke="#94a3b8" strokeWidth="0.15" />
      <line x1="72" y1="53" x2="72" y2="55" stroke="#94a3b8" strokeWidth="0.15" />

      {/* ==================================================================== */}
      {/* 3. TROTOAR PAVING PEMBATAS JALAN & PROMENADE                         */}
      {/* ==================================================================== */}
      {/* Promenade Tepi Laut Timur (gx: 61..62, gy: 16..64) */}
      <rect x="61" y="16" width="2" height="49" fill="#94a3b8" stroke="#475569" strokeWidth="0.15" />

      {/* Trotoar Pembatas Luar Jalan Horizontal & Vertikal */}
      <rect x="0" y="12" width="19" height="1" fill="#cbd5e1" opacity="0.75" />
      <rect x="61" y="12" width="19" height="1" fill="#cbd5e1" opacity="0.75" />
      <rect x="0" y="15" width="18" height="1" fill="#cbd5e1" opacity="0.75" />
      <rect x="62" y="15" width="18" height="1" fill="#cbd5e1" opacity="0.75" />

      <rect x="0" y="65" width="18" height="1" fill="#cbd5e1" opacity="0.75" />
      <rect x="62" y="65" width="18" height="1" fill="#cbd5e1" opacity="0.75" />
      <rect x="0" y="68" width="19" height="1" fill="#cbd5e1" opacity="0.75" />
      <rect x="61" y="68" width="19" height="1" fill="#cbd5e1" opacity="0.75" />

      {/* Trotoar Keliling Central Plaza (gx: 21..58) */}
      <rect x="21" y="18" width="38" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="21" y="21" width="38" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="21" y="59" width="38" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="21" y="62" width="38" height="1" fill="#cbd5e1" opacity="0.8" />

      {/* ==================================================================== */}
      {/* 4. JARINGAN JALAN RAYA ASPAL (100% PERSIS KONEKSI DI WORLDSCENE)     */}
      {/* ==================================================================== */}
      {/* Warna Aspal Charcoal (#1e293b / #334155) */}

      {/* Jalan Vertikal Barat (gx: 19..20, gy: 13..67) - Menghubungkan Utara ke Selatan */}
      <rect x="19" y="13" width="2" height="55" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      {/* Marka Putus-Putus Kuning Sumbu Vertikal Barat */}
      <line x1="20" y1="13" x2="20" y2="68" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* Jalan Vertikal Timur (gx: 59..60, gy: 13..67) - Menghubungkan Utara ke Selatan */}
      <rect x="59" y="13" width="2" height="55" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      {/* Marka Putus-Putus Kuning Sumbu Vertikal Timur */}
      <line x1="60" y1="13" x2="60" y2="68" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* a. Jalan Horizontal Barat Laut (gy: 13..14, gx: 0..18) */}
      <rect x="0" y="13" width="19" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="0" y1="14" x2="19" y2="14" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* b. Jalan Horizontal Timur Laut (gy: 13..14, gx: 61..79) */}
      <rect x="61" y="13" width="19" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="61" y1="14" x2="80" y2="14" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* c. Jalan Horizontal Utara Central Plaza (gy: 19..20, gx: 21..58) */}
      <rect x="21" y="19" width="38" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="21" y1="20" x2="59" y2="20" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* d. Jalan Horizontal Selatan Central Plaza (gy: 60..61, gx: 21..58) */}
      <rect x="21" y="60" width="38" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="21" y1="61" x2="59" y2="61" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* e. Jalan Horizontal Barat Daya (gy: 66..67, gx: 0..18) */}
      <rect x="0" y="66" width="19" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="0" y1="67" x2="19" y2="67" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* f. Jalan Horizontal Tenggara (gy: 66..67, gx: 61..79) */}
      <rect x="61" y="66" width="19" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="61" y1="67" x2="80" y2="67" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* 8 Persimpangan Jalan (Intersections 2x2 px) */}
      {[
        { x: 19, y: 13 }, { x: 59, y: 13 },
        { x: 19, y: 19 }, { x: 59, y: 19 },
        { x: 19, y: 60 }, { x: 59, y: 60 },
        { x: 19, y: 66 }, { x: 59, y: 66 },
      ].map((pos, idx) => (
        <rect
          key={`ix_${idx}`}
          x={pos.x}
          y={pos.y}
          width="2"
          height="2"
          fill="#334155"
          stroke="#0f172a"
          strokeWidth="0.1"
        />
      ))}

      {/* ==================================================================== */}
      {/* 5. CENTRAL PLAZA (ALUN-ALUN PUSAT TERBUKA & MONUMEN PATUNG KOTA)     */}
      {/* ==================================================================== */}
      {/* Lapangan Terbuka Central Plaza (gx: 21..59, gy: 21..60) */}
      <rect
        x="21.5"
        y="21.5"
        width="37"
        height="38"
        fill="#15803d"
        stroke="#16a34a"
        strokeWidth="0.2"
        rx="0.5"
      />

      {/* Lingkaran Paving Alun-Alun Pusat di Pusat Kota (40, 40) */}
      <circle cx="40" cy="40" r="7.5" fill="#334155" stroke="#64748b" strokeWidth="0.3" opacity="0.9" />
      {/* Kolam Air Mancur Bundar Landmark Patung Lamongan */}
      <circle cx="40" cy="40" r="3.2" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.25" />
      {/* Titik Patung Ikonik */}
      <circle cx="40" cy="40" r="1.2" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.2" />

      {/* Papan Popup Informasi Alun-Alun (gx: 30, gy: 48 & gx: 50, gy: 48) */}
      <rect x="29.2" y="47.5" width="1.6" height="1" fill="#eab308" stroke="#78350f" strokeWidth="0.15" rx="0.2" />
      <rect x="49.2" y="47.5" width="1.6" height="1" fill="#eab308" stroke="#78350f" strokeWidth="0.15" rx="0.2" />

      {/* ==================================================================== */}
      {/* 6. LABEL NAMA KAWASAN KUNCI REALISTIS (Hanya jika bukan Mini)         */}
      {/* ==================================================================== */}
      {!isMini && (
        <g pointerEvents="none" className="select-none">
          <text x="40" y="31" fill="#f8fafc" fontSize="2.4" fontWeight="900" textAnchor="middle" stroke="#000000" strokeWidth="0.4">
            ALUN-ALUN PUSAT
          </text>
          <text x="40" y="45.5" fill="#38bdf8" fontSize="1.8" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.3">
            AIR MANCUR PATUNG
          </text>

          <text x="71" y="20" fill="#bae6fd" fontSize="2.2" fontWeight="800" textAnchor="middle" stroke="#0369a1" strokeWidth="0.35">
            LAUTAN TIMUR
          </text>
          <text x="71" y="25" fill="#fde047" fontSize="1.5" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            DERMAGA 1
          </text>
          <text x="71" y="38" fill="#fde047" fontSize="1.5" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            DERMAGA 2
          </text>
          <text x="71" y="52" fill="#fde047" fontSize="1.5" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            DERMAGA 3
          </text>

          <text x="40" y="74.5" fill="#fef08a" fontSize="2.3" fontWeight="900" textAnchor="middle" stroke="#78350f" strokeWidth="0.35">
            PANTAI PASIR SELATAN
          </text>
        </g>
      )}

      {/* ==================================================================== */}
      {/* 7. MARKER POSISI PEMAIN REALTIME (PIN EMAS + KERUCUT VISION CONE)    */}
      {/* ==================================================================== */}
      <g transform={`translate(${px}, ${py})`}>
        {/* Kerucut Arah Pandangan (Vision Cone 60 Derajat) */}
        <g transform={`rotate(${visionAngle})`}>
          <path
            d="M 0 0 L 8 -4 A 9 9 0 0 1 8 4 Z"
            fill="#f59e0b"
            opacity="0.35"
          />
        </g>

        {/* Cincin Denyut Berpendar (Pulse Ring) */}
        <circle
          cx="0"
          cy="0"
          r="3"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Pin Lingkaran Pemain Utama */}
        <circle
          cx="0"
          cy="0"
          r="1.8"
          fill="#f59e0b"
          stroke="#ffffff"
          strokeWidth="0.6"
          filter="url(#playerGlow)"
        />

        {/* Titik Pusat Putih */}
        <circle cx="0" cy="0" r="0.7" fill="#ffffff" />
      </g>
    </svg>
  );
};
