/**
 * ============================================================================
 * FILE: resources/js/game/ui/WorldMapSvg.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen Peta Vektor Representasi Visual RadenWorld (80x80 Petak Grid @ 120px).
 *
 * FITUR LENGKAP & 100% PERSIS DENGAN DUNIA (WorldScene.ts & BootScene.ts):
 * 1. Tampilan Tile Catur Asli (Checkerboard 1x1 Petak Grid):
 *    - Rumput Catur: Alternating #01ae01 & #89ffa5 persis world-checker-tile.
 *    - Pasir Catur: Alternating #b39962 & #efddb7 persis beach-checker-tile.
 *    - Laut Kristal: Solid biru murni Blueprint #00a2f3 persis water-checker-tile.
 * 2. Grid Koordinat Petak (1x1 Petak):
 *    - Garis batas tiap petak dan label angka grid kelipatan 10 (0, 10, 20, ..., 80).
 * 3. Geometri Pantai Pasir Selatan 1:1 Presisi:
 *    - Teluk Pantai Tengah: gx: 23..56, gy: 64..69
 *    - Trotoar Pembatas Teluk: gy: 62..63, gx: 22..57 & sisi gx: 21, 58
 *    - Hamparan Utama Pantai Pasir: gx: 1..78, gy: 70..78
 *    - Air Laut Sisi: gx: 0 & gx: 79 di gy: 70..78, serta Samudra Selatan di gy: 79
 * 4. Sistem Tanda / Marker Waypoint Kustom:
 *    - Pin Waypoint Emas/Merah interaktif di koordinat petak yang dipasang pemain.
 *    - Cincin denyut animasi berdenyut & label koordinat [gx, gy].
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

export const WorldMapSvg: React.FC<WorldMapSvgProps> = ({
  playerGridX = 20,
  playerGridY = 20,
  playerDirection = 'down',
  isMini = false,
  className = 'w-full h-full',
  customMarker = null,
  onMapClick,
  showGridLines = true,
}) => {
  // Batasi koordinat pemain dalam grid 0..79
  const px = Math.max(1, Math.min(78, playerGridX));
  const py = Math.max(1, Math.min(78, playerGridY));

  // Hitung sudut rotasi kerucut pandangan pemain (Vision Cone)
  let visionAngle = 90; // Default: 'down'
  if (playerDirection === 'up') visionAngle = 270;
  else if (playerDirection === 'left') visionAngle = 180;
  else if (playerDirection === 'right') visionAngle = 0;

  // Tangani klik pada peta untuk memasang tanda
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const gx = Math.max(0, Math.min(79, Math.floor((clickX / rect.width) * 80)));
    const gy = Math.max(0, Math.min(79, Math.floor((clickY / rect.height) * 80)));
    onMapClick(gx, gy);
  };

  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={handleSvgClick}
    >
      <defs>
        {/* ================================================================= */}
        {/* 1. POLA TILE CATUR RUMPUT DUNIA (world-checker-tile @ 120px)       */}
        {/* Mengikuti warna asli di BootScene.ts: #01ae01 & #89ffa5           */}
        {/* ================================================================= */}
        <pattern id="worldGrassPattern" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#01ae01" />
          <rect x="1" y="1" width="1" height="1" fill="#01ae01" />
          <rect x="1" y="0" width="1" height="1" fill="#89ffa5" />
          <rect x="0" y="1" width="1" height="1" fill="#89ffa5" />
          {/* Garis nat pembatas antar petak catur */}
          <line x1="0" y1="1" x2="2" y2="1" stroke="#008e00" strokeWidth="0.04" opacity="0.4" />
          <line x1="1" y1="0" x2="1" y2="2" stroke="#008e00" strokeWidth="0.04" opacity="0.4" />
        </pattern>

        {/* ================================================================= */}
        {/* 2. POLA TILE CATUR PASIR PANTAI (beach-checker-tile @ 120px)      */}
        {/* Mengikuti warna asli di BootScene.ts: #b39962 & #efddb7           */}
        {/* ================================================================= */}
        <pattern id="beachTilePattern" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1" fill="#b39962" />
          <rect x="1" y="1" width="1" height="1" fill="#b39962" />
          <rect x="1" y="0" width="1" height="1" fill="#efddb7" />
          <rect x="0" y="1" width="1" height="1" fill="#efddb7" />
          {/* Garis nat pembatas antar petak pasir */}
          <line x1="0" y1="1" x2="2" y2="1" stroke="#8c733e" strokeWidth="0.04" opacity="0.45" />
          <line x1="1" y1="0" x2="1" y2="2" stroke="#8c733e" strokeWidth="0.04" opacity="0.45" />
        </pattern>

        {/* ================================================================= */}
        {/* 3. POLA OVERLAY GRID PETAK 1x1                                    */}
        {/* ================================================================= */}
        <pattern id="gridOverlayPattern" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="none" stroke="#ffffff" strokeWidth="0.03" opacity="0.15" />
        </pattern>

        {/* Glow Marker Pemain Emas */}
        <filter id="playerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#f59e0b" floodOpacity="0.95" />
        </filter>

        {/* Glow Marker Tanda Waypoint Merah */}
        <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.0" floodColor="#ef4444" floodOpacity="0.95" />
        </filter>
      </defs>

      {/* ==================================================================== */}
      {/* 1. DASAR DUNIA: RUMPUT TILE CATUR HIJAU (80x80 Petak Grid)           */}
      {/* ==================================================================== */}
      <rect x="0" y="0" width="80" height="80" fill="url(#worldGrassPattern)" />

      {/* ==================================================================== */}
      {/* 2. PERAIRAN LAUT TIMUR & 3 DERMAGA (100% SESUAI WORLDSCENE)          */}
      {/* Warna Air Laut Solid Bersih Blueprint (#00a2f3)                      */}
      {/* ==================================================================== */}
      {/* Lautan Kristal Timur (gx: 63..80, gy: 17..64) */}
      <rect x="63" y="17" width="17" height="47" fill="#00a2f3" />

      {/* Garis batas petak air laut halus */}
      <rect x="63" y="17" width="17" height="47" fill="url(#gridOverlayPattern)" opacity="0.5" />

      {/* 3 Dermaga Nelayan di Laut Timur (gx: 63..73, tebal 2 petak) */}
      {/* Dermaga 1 (gy: 26..27) */}
      <rect x="63" y="26" width="11" height="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.15" rx="0.2" />
      <line x1="66" y1="26" x2="66" y2="28" stroke="#94a3b8" strokeWidth="0.12" />
      <line x1="69" y1="26" x2="69" y2="28" stroke="#94a3b8" strokeWidth="0.12" />
      <line x1="72" y1="26" x2="72" y2="28" stroke="#94a3b8" strokeWidth="0.12" />

      {/* Dermaga 2 (gy: 39..40 - Spot Mancing Nelayan Danu) */}
      <rect x="63" y="39" width="11" height="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.15" rx="0.2" />
      <line x1="66" y1="39" x2="66" y2="41" stroke="#94a3b8" strokeWidth="0.12" />
      <line x1="69" y1="39" x2="69" y2="41" stroke="#94a3b8" strokeWidth="0.12" />
      <line x1="72" y1="39" x2="72" y2="41" stroke="#94a3b8" strokeWidth="0.12" />

      {/* Dermaga 3 (gy: 53..54) */}
      <rect x="63" y="53" width="11" height="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.15" rx="0.2" />
      <line x1="66" y1="53" x2="66" y2="55" stroke="#94a3b8" strokeWidth="0.12" />
      <line x1="69" y1="53" x2="69" y2="55" stroke="#94a3b8" strokeWidth="0.12" />
      <line x1="72" y1="53" x2="72" y2="55" stroke="#94a3b8" strokeWidth="0.12" />

      {/* ==================================================================== */}
      {/* 3. PANTAI PASIR TILE CATUR SELATAN (100% PERSIS KOORDINAT WORLD)     */}
      {/* Pasir Catur Alami (#b39962 & #efddb7)                                */}
      {/* ==================================================================== */}
      {/* a. Teluk Pantai Tengah (coveX=23, coveY=64, coveW=34, coveH=6) */}
      {/*    Membentang dari gx: 23..56, gy: 64..69 */}
      <rect x="23" y="64" width="34" height="6" fill="url(#beachTilePattern)" />

      {/* b. Hamparan Utama Pantai Pasir Selatan (gx: 0..78, gy: 70..78) */}
      <rect x="0" y="70" width="79" height="9" fill="url(#beachTilePattern)" />

      {/* c. Air Laut Sisi Kanan Pantai Selatan (gx: 79 di gy: 70..78) */}
      <rect x="79" y="70" width="1" height="9" fill="#00a2f3" />

      {/* d. Samudra Selatan Paling Bawah (gy: 79, gx: 0..79, w: 80, h: 1) */}
      <rect x="0" y="79" width="80" height="1" fill="#00a2f3" />

      {/* Garis Buih Putih Ombak di Pertemuan Pasir & Samudra Selatan (gy: 79) - berhenti di x: 79 */}
      <line
        x1="0"
        y1="79"
        x2="79"
        y2="79"
        stroke="#ffffff"
        strokeWidth="0.3"
        strokeDasharray="1.5, 0.8"
        opacity="0.9"
      />

      {/* Garis Buih Putih Ombak di Pertemuan Pasir & Laut Timur (gx: 79, gy: 70..79) */}
      <line
        x1="79"
        y1="70"
        x2="79"
        y2="79"
        stroke="#ffffff"
        strokeWidth="0.3"
        strokeDasharray="1.5, 0.8"
        opacity="0.9"
      />

      {/* ==================================================================== */}
      {/* 4. TROTOAR PAVING PEMBATAS JALAN & PROMENADE (100% SESUAI WORLDSCENE)*/}
      {/* ==================================================================== */}
      {/* Promenade Tepi Laut Timur (gx: 61..62, gy: 16..64) */}
      <rect x="61" y="16" width="2" height="49" fill="#94a3b8" stroke="#475569" strokeWidth="0.12" />

      {/* Trotoar Pembatas Luar Jalan Horizontal & Vertikal */}
      <rect x="0" y="12" width="19" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="61" y="12" width="19" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="0" y="15" width="18" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="62" y="15" width="18" height="1" fill="#cbd5e1" opacity="0.8" />

      <rect x="0" y="65" width="18" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="62" y="65" width="18" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="0" y="68" width="19" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="61" y="68" width="19" height="1" fill="#cbd5e1" opacity="0.8" />

      {/* Trotoar Keliling Central Area (gx: 21..58) */}
      <rect x="21" y="18" width="38" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="21" y="21" width="38" height="1" fill="#cbd5e1" opacity="0.8" />
      <rect x="21" y="59" width="38" height="1" fill="#cbd5e1" opacity="0.8" />

      {/* Trotoar Pembatas Teluk Pantai Selatan (gy: 62..63, gx: 21..58) */}
      <rect x="22" y="62" width="36" height="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.1" />
      <rect x="22" y="63" width="36" height="1" fill="#64748b" stroke="#334155" strokeWidth="0.1" />
      <rect x="21" y="63" width="1" height="5" fill="#94a3b8" stroke="#475569" strokeWidth="0.1" />
      <rect x="22" y="64" width="1" height="6" fill="#64748b" stroke="#334155" strokeWidth="0.1" />
      <rect x="58" y="63" width="1" height="5" fill="#94a3b8" stroke="#475569" strokeWidth="0.1" />
      <rect x="57" y="64" width="1" height="6" fill="#64748b" stroke="#334155" strokeWidth="0.1" />

      {/* ==================================================================== */}
      {/* 5. JARINGAN JALAN RAYA ASPAL (100% PERSIS KONEKSI DI WORLDSCENE)     */}
      {/* ==================================================================== */}
      {/* Jalan Vertikal Barat (gx: 19..20, gy: 13..67) */}
      <rect x="19" y="13" width="2" height="55" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="20" y1="13" x2="20" y2="68" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* Jalan Vertikal Timur (gx: 59..60, gy: 13..67) */}
      <rect x="59" y="13" width="2" height="55" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="60" y1="13" x2="60" y2="68" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* a. Jalan Horizontal Barat Laut (gy: 13..14, gx: 0..18) */}
      <rect x="0" y="13" width="19" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="0" y1="14" x2="19" y2="14" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* b. Jalan Horizontal Timur Laut (gy: 13..14, gx: 61..79) */}
      <rect x="61" y="13" width="19" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="61" y1="14" x2="80" y2="14" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* c. Jalan Horizontal Utara (gy: 19..20, gx: 21..58) */}
      <rect x="21" y="19" width="38" height="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.15" />
      <line x1="21" y1="20" x2="59" y2="20" stroke="#eab308" strokeWidth="0.25" strokeDasharray="1.2, 0.8" />

      {/* d. Jalan Horizontal Selatan (gy: 60..61, gx: 21..58) */}
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
      {/* 6. GRID OVERLAY PETAK 1x1 DENGAN GARIS & ANGKA KOORDINAT             */}
      {/* ==================================================================== */}
      {!isMini && showGridLines && (
        <g pointerEvents="none" className="select-none">
          {/* Garis Grid Petak Halus setiap 1 petak */}
          <rect x="0" y="0" width="80" height="80" fill="url(#gridOverlayPattern)" />

          {/* Garis Mayor setiap 10 petak */}
          {[10, 20, 30, 40, 50, 60, 70].map((coord) => (
            <React.Fragment key={`grid_major_${coord}`}>
              <line x1={coord} y1="0" x2={coord} y2="80" stroke="#ffffff" strokeWidth="0.08" opacity="0.3" strokeDasharray="1, 1" />
              <line x1="0" y1={coord} x2="80" y2={coord} stroke="#ffffff" strokeWidth="0.08" opacity="0.3" strokeDasharray="1, 1" />
            </React.Fragment>
          ))}

          {/* Angka Grid Indeks X di Atas */}
          {[0, 10, 20, 30, 40, 50, 60, 70].map((gx) => (
            <text
              key={`gx_num_${gx}`}
              x={gx + 0.5}
              y="2.2"
              fill="#ffffff"
              fontSize="1.4"
              fontFamily="monospace"
              fontWeight="bold"
              opacity="0.8"
              stroke="#000000"
              strokeWidth="0.3"
              paintOrder="stroke"
            >
              {gx}
            </text>
          ))}

          {/* Angka Grid Indeks Y di Sisi Kiri */}
          {[10, 20, 30, 40, 50, 60, 70].map((gy) => (
            <text
              key={`gy_num_${gy}`}
              x="0.8"
              y={gy + 1.8}
              fill="#ffffff"
              fontSize="1.4"
              fontFamily="monospace"
              fontWeight="bold"
              opacity="0.8"
              stroke="#000000"
              strokeWidth="0.3"
              paintOrder="stroke"
            >
              {gy}
            </text>
          ))}
        </g>
      )}

      {/* ==================================================================== */}
      {/* 7. LABEL NAMA KAWASAN NYATA (Hanya jika bukan Mini)                  */}
      {/* ==================================================================== */}
      {!isMini && (
        <g pointerEvents="none" className="select-none">
          <text x="71" y="21" fill="#bae6fd" fontSize="2.2" fontWeight="800" textAnchor="middle" stroke="#0369a1" strokeWidth="0.35">
            LAUTAN TIMUR
          </text>
          <text x="71" y="25.5" fill="#fde047" fontSize="1.4" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            DERMAGA 1
          </text>
          <text x="71" y="38.5" fill="#fde047" fontSize="1.4" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            DERMAGA 2
          </text>
          <text x="71" y="52.5" fill="#fde047" fontSize="1.4" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            DERMAGA 3
          </text>

          <text x="40" y="75" fill="#fef08a" fontSize="2.4" fontWeight="900" textAnchor="middle" stroke="#78350f" strokeWidth="0.4">
            PANTAI PASIR SELATAN
          </text>
        </g>
      )}

      {/* ==================================================================== */}
      {/* 8. TANDA / WAYPOINT KUSTOM (PIN MERAH BERPENDAR DENGAN PULSE RING)   */}
      {/* ==================================================================== */}
      {customMarker && (
        <g
          transform={`translate(${customMarker.x + 0.5}, ${customMarker.y + 0.5})`}
          className="pointer-events-none select-none"
        >
          {/* Cincin Denyut Berpendar (Pulse Ring) */}
          <circle cx="0" cy="0" r="3.2" fill="none" stroke="#ef4444" strokeWidth="0.35" opacity="0.8">
            <animate attributeName="r" values="1.2;4.2;1.2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Garis Aksen Vertikal */}
          <line x1="0" y1="0" x2="0" y2="1.2" stroke="#ffffff" strokeWidth="0.3" />

          {/* Ikon Pin Waypoint Merah */}
          <path
            d="M 0 -3.6 C -1.5 -3.6 -2.5 -2.5 -2.5 -1 C -2.5 1.1 0 3.6 0 3.6 C 0 3.6 2.5 1.1 2.5 -1 C 2.5 -2.5 1.5 -3.6 0 -3.6 Z"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="0.4"
            filter="url(#markerGlow)"
          />

          {/* Titik Pusat Putih */}
          <circle cx="0" cy="-1.1" r="0.8" fill="#ffffff" />

          {/* Badge Label Koordinat Grid Waypoint (Jika bukan Mini) */}
          {!isMini && (
            <g transform="translate(0, -4.8)">
              <rect
                x="-5.5"
                y="-1.8"
                width="11"
                height="2.5"
                rx="0.5"
                fill="#000000"
                stroke="#ef4444"
                strokeWidth="0.25"
                opacity="0.9"
              />
              <text
                x="0"
                y="-0.2"
                fill="#fecaca"
                fontSize="1.4"
                fontFamily="monospace"
                fontWeight="900"
                textAnchor="middle"
              >
                📍 {customMarker.x},{customMarker.y}
              </text>
            </g>
          )}
        </g>
      )}

      {/* ==================================================================== */}
      {/* 9. MARKER POSISI PEMAIN REALTIME (PIN EMAS + KERUCUT VISION CONE)    */}
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
