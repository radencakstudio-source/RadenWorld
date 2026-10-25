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

        {/* ================================================================= */}
        {/* 4. POLA TILE TANAH GALIAN CANGKULAN (tile-dig @ 120px)             */}
        {/* Mengikuti bentuk rounded star lempung coklat di 1x1 Dig.png       */}
        {/* ================================================================= */}
        <pattern id="digSoilPattern" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#01ae01" opacity="0.12" />
          <path
            d="M 0.22 0.08 C 0.35 0.22 0.35 0.22 0.5 0.18 C 0.65 0.22 0.65 0.22 0.78 0.08 C 0.72 0.35 0.72 0.35 0.92 0.5 C 0.72 0.65 0.72 0.65 0.78 0.92 C 0.65 0.78 0.65 0.78 0.5 0.82 C 0.35 0.78 0.35 0.78 0.22 0.92 C 0.28 0.65 0.28 0.65 0.08 0.5 C 0.28 0.35 0.28 0.35 0.22 0.08 Z"
            fill="#a16e38"
            stroke="#78350f"
            strokeWidth="0.035"
          />
          <circle cx="0.5" cy="0.5" r="0.16" fill="#8d5b2d" opacity="0.55" />
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

      {/* Alun-Alun Paving / Trotoar (gx: 22..57, gy: 22..58) */}
      <rect x="22" y="22" width="36" height="37" fill="#64748b" stroke="#334155" strokeWidth="0.15" opacity="0.95" />

      {/* ==================================================================== */}
      {/* SARANA OLAHRAGA BAGIAN BAWAH ALUN-ALUN (gx: 24..33 & 46..55, gy: 51..55) */}
      {/* ==================================================================== */}
      {/* a. Lapangan Sepak Bola (10x5 Petak: gx: 24..33, gy: 51..55) */}
      <g id="map_soccer_field">
        <rect x="24" y="51" width="10" height="5" rx="0.15" fill="#15803d" stroke="#14532d" strokeWidth="0.12" />
        {/* Striping Rumput Lapangan */}
        <rect x="24.5" y="51.2" width="9" height="4.6" fill="#16a34a" />
        {[25.5, 27.5, 29.5, 31.5].map((sx, idx) => (
          <rect key={`turf_${idx}`} x={sx} y="51.2" width="1" height="4.6" fill="#22c55e" opacity="0.28" />
        ))}
        {/* Garis Batas Putih */}
        <rect x="24.5" y="51.2" width="9" height="4.6" fill="none" stroke="#ffffff" strokeWidth="0.08" />
        {/* Garis Tengah */}
        <line x1="29" y1="51.2" x2="29" y2="55.8" stroke="#ffffff" strokeWidth="0.08" />
        {/* Lingkaran Tengah */}
        <circle cx="29" cy="53.5" r="0.75" fill="none" stroke="#ffffff" strokeWidth="0.08" />
        <circle cx="29" cy="53.5" r="0.08" fill="#ffffff" />
        {/* Kotak Penalti Kiri */}
        <rect x="24.5" y="52.3" width="1.6" height="2.4" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        <rect x="24.5" y="52.8" width="0.7" height="1.4" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        {/* Kotak Penalti Kanan */}
        <rect x="31.9" y="52.3" width="1.6" height="2.4" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        <rect x="32.8" y="52.8" width="0.7" height="1.4" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        {/* Gawang Kiri & Kanan */}
        <rect x="24.15" y="52.8" width="0.35" height="1.4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
        <rect x="33.5" y="52.8" width="0.35" height="1.4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.05" />
      </g>

      {/* b. Lapangan Bola Basket (10x5 Petak: gx: 46..55, gy: 51..55) */}
      <g id="map_basketball_court">
        <rect x="46" y="51" width="10" height="5" rx="0.15" fill="#0f172a" stroke="#1e293b" strokeWidth="0.12" />
        {/* Lantai Lapangan Biru Royal */}
        <rect x="46.5" y="51.2" width="9" height="4.6" fill="#1d4ed8" />
        {/* Area Key Oranye Terracotta */}
        <rect x="46.5" y="52.6" width="1.8" height="1.8" fill="#ea580c" />
        <rect x="53.7" y="52.6" width="1.8" height="1.8" fill="#ea580c" />
        {/* Garis Batas Putih */}
        <rect x="46.5" y="51.2" width="9" height="4.6" fill="none" stroke="#ffffff" strokeWidth="0.08" />
        {/* Garis Tengah */}
        <line x1="51" y1="51.2" x2="51" y2="55.8" stroke="#ffffff" strokeWidth="0.08" />
        {/* Lingkaran Tengah */}
        <circle cx="51" cy="53.5" r="0.7" fill="#ea580c" fillOpacity="0.4" stroke="#ffffff" strokeWidth="0.08" />
        {/* Garis Key Kiri & Kanan */}
        <rect x="46.5" y="52.6" width="1.8" height="1.8" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        <rect x="53.7" y="52.6" width="1.8" height="1.8" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        <circle cx="48.3" cy="53.5" r="0.6" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        <circle cx="53.7" cy="53.5" r="0.6" fill="none" stroke="#ffffff" strokeWidth="0.07" />
        {/* Ring & Backboard Kiri & Kanan */}
        <line x1="47.1" y1="53.0" x2="47.1" y2="54.0" stroke="#ffffff" strokeWidth="0.1" />
        <circle cx="47.3" cy="53.5" r="0.18" fill="none" stroke="#ef4444" strokeWidth="0.07" />
        <line x1="54.9" y1="53.0" x2="54.9" y2="54.0" stroke="#ffffff" strokeWidth="0.1" />
        <circle cx="54.7" cy="53.5" r="0.18" fill="none" stroke="#ef4444" strokeWidth="0.07" />
      </g>

      {/* Hamparan Trotoar 2 Utara (gx: 23..42, gy: 0..16) */}
      <rect x="23" y="0" width="20" height="17" fill="#94a3b8" stroke="#64748b" strokeWidth="0.1" opacity="0.9" />

      {/* Hamparan Trotoar 2 Timur Utara Tambahan (gx: 43..56, gy: 1..16) */}
      <rect x="43" y="1" width="14" height="16" fill="#94a3b8" stroke="#64748b" strokeWidth="0.1" opacity="0.9" />

      {/* Pagar Batu Batas Barat & Timur (gx: 23, 42 & 56) */}
      <rect x="23" y="0" width="1" height="17" fill="#475569" stroke="#1e293b" strokeWidth="0.1" />
      <rect x="42" y="0" width="1" height="17" fill="#475569" stroke="#1e293b" strokeWidth="0.1" />
      <rect x="56" y="0" width="1" height="16" fill="#475569" stroke="#1e293b" strokeWidth="0.1" />

      {/* Gedung Sekolah: SD (gx: 25), SMP (gx: 31), SMA (gx: 37) ukuran asli 5x10 (gy: 0..9) */}
      <rect x="25" y="0" width="5" height="10" rx="0.3" fill="#dc2626" stroke="#991b1b" strokeWidth="0.15" />
      <rect x="31" y="0" width="5" height="10" rx="0.3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.15" />
      <rect x="37" y="0" width="5" height="10" rx="0.3" fill="#0891b2" stroke="#0e7490" strokeWidth="0.15" />

      {/* ==================================================================== */}
      {/* KAWASAN LAHAN PERTANIAN / TANAH GALIAN (gx: 57..80, gy: 1..9)        */}
      {/* ==================================================================== */}
      <g id="farm_dig_area">
        {/* Latar Belakang Lahan Tanah Galian */}
        <rect
          x="57"
          y="1"
          width="23"
          height="9"
          fill="url(#digSoilPattern)"
        />
        {/* Garis Batas Area Perkebunan Bersih */}
        <rect
          x="57"
          y="1"
          width="23"
          height="9"
          fill="none"
          stroke="#78350f"
          strokeWidth="0.15"
          strokeDasharray="0.6,0.6"
          opacity="0.8"
        />
      </g>

      {/* ==================================================================== */}
      {/* 4a. HAMPARAN RUMPUT LIAR 1x2 (Pekarangan Rumah Residensial)           */}
      {/* ==================================================================== */}
      {[
        // Sisi Kiri Rumah: gx: 7..8, gy: 2..7 lengkap
        ...[7, 8].flatMap((gx) => [2, 3, 4, 5, 6, 7].map((gy) => ({ gx, gy }))),
        // Belakang Rumah: gx: 9..13, gy: 2..3
        ...[9, 10, 11, 12, 13].flatMap((gx) => [2, 3].map((gy) => ({ gx, gy }))),
        // Sisi Kanan Rumah: gx: 14..15, gy: 2..7 lengkap
        ...[14, 15].flatMap((gx) => [2, 3, 4, 5, 6, 7].map((gy) => ({ gx, gy }))),
      ].map((pos, idx) => (
        <g key={`wild_grass_${idx}`} opacity="0.85">
          <path
            d={`M${pos.gx + 0.15},${pos.gy + 0.85} L${pos.gx + 0.25},${pos.gy + 0.15} L${pos.gx + 0.35},${pos.gy + 0.85} L${pos.gx + 0.5},${pos.gy + 0.05} L${pos.gx + 0.65},${pos.gy + 0.85} L${pos.gx + 0.75},${pos.gy + 0.2} L${pos.gx + 0.85},${pos.gy + 0.85} Z`}
            fill="#16a34a"
            stroke="#15803d"
            strokeWidth="0.04"
          />
          <circle cx={pos.gx + 0.3} cy={pos.gy + 0.5} r="0.06" fill="#86efac" />
          <circle cx={pos.gx + 0.7} cy={pos.gy + 0.55} r="0.06" fill="#86efac" />
        </g>
      ))}

      {/* ==================================================================== */}
      {/* 4b. RUMAH PRIBADI PEMAIN 5x5 (gx: 9..13, gy: 2..6)                   */}
      {/* ==================================================================== */}
      <g id="player_house_map">
        {/* Dinding Bata Oranye Rumah */}
        <rect x="9.3" y="3.2" width="4.4" height="3.8" rx="0.2" fill="#d97706" stroke="#b45309" strokeWidth="0.12" />
        {/* Atap Genteng Merah */}
        <polygon points="8.8,3.5 11.5,1.8 14.2,3.5" fill="#dc2626" stroke="#991b1b" strokeWidth="0.12" />
        {/* Pintu Rumah */}
        <rect x="11.1" y="5.2" width="0.8" height="1.8" rx="0.1" fill="#78350f" stroke="#451a03" strokeWidth="0.08" />
        {/* Jendela Kiri & Kanan */}
        <rect x="9.8" y="4.2" width="0.7" height="0.7" fill="#fef3c7" stroke="#b45309" strokeWidth="0.06" />
        <rect x="12.5" y="4.2" width="0.7" height="0.7" fill="#fef3c7" stroke="#b45309" strokeWidth="0.06" />
      </g>

      {/* ==================================================================== */}
      {/* 4c. KAWASAN KOMERSIAL & LAYANAN PUBLIK BARAT (6 Gedung 5x5)          */}
      {/* ==================================================================== */}
      {/* 1. Cafe 5x5 (gx: 1, gy: 21) */}
      <g id="map_building_cafe">
        <rect x="1" y="21" width="5" height="5" rx="0.25" fill="#78350f" stroke="#451a03" strokeWidth="0.12" />
        <rect x="1.4" y="21.4" width="4.2" height="4.2" fill="#d97706" opacity="0.85" />
        <rect x="2.8" y="24.4" width="1.4" height="1.6" fill="#451a03" />
      </g>

      {/* 2. Perpustakaan 5x5 (gx: 12, gy: 21) */}
      <g id="map_building_library">
        <rect x="12" y="21" width="5" height="5" rx="0.25" fill="#0369a1" stroke="#075985" strokeWidth="0.12" />
        <rect x="12.4" y="21.4" width="4.2" height="4.2" fill="#38bdf8" opacity="0.85" />
        <rect x="13.8" y="24.4" width="1.4" height="1.6" fill="#075985" />
      </g>

      {/* 3. Kantor Polisi 5x5 (gx: 1, gy: 37) */}
      <g id="map_building_police">
        <rect x="1" y="37" width="5" height="5" rx="0.25" fill="#1e3a8a" stroke="#172554" strokeWidth="0.12" />
        <rect x="1.4" y="37.4" width="4.2" height="4.2" fill="#3b82f6" opacity="0.85" />
        <rect x="2.8" y="40.4" width="1.4" height="1.6" fill="#172554" />
      </g>

      {/* 4. Kantor Bank 5x5 (gx: 12, gy: 37) */}
      <g id="map_building_bank">
        <rect x="12" y="37" width="5" height="5" rx="0.25" fill="#854d0e" stroke="#713f12" strokeWidth="0.12" />
        <rect x="12.4" y="37.4" width="4.2" height="4.2" fill="#eab308" opacity="0.85" />
        <rect x="13.8" y="40.4" width="1.4" height="1.6" fill="#713f12" />
      </g>

      {/* 5. Apotek 5x5 (gx: 1, gy: 53) */}
      <g id="map_building_pharmacy">
        <rect x="1" y="53" width="5" height="5" rx="0.25" fill="#065f46" stroke="#064e3b" strokeWidth="0.12" />
        <rect x="1.4" y="53.4" width="4.2" height="4.2" fill="#10b981" opacity="0.85" />
        <rect x="2.8" y="56.4" width="1.4" height="1.6" fill="#064e3b" />
      </g>

      {/* 6. Makelar 5x5 (gx: 12, gy: 53) */}
      <g id="map_building_realtor">
        <rect x="12" y="53" width="5" height="5" rx="0.25" fill="#581c87" stroke="#3b0764" strokeWidth="0.12" />
        <rect x="12.4" y="53.4" width="4.2" height="4.2" fill="#a855f7" opacity="0.85" />
        <rect x="13.8" y="56.4" width="1.4" height="1.6" fill="#3b0764" />
      </g>

      {/* ==================================================================== */}
      {/* 4b. DERETAN POHON 1x3 (ZIGZAG SISI BARAT & TIMUR KAWASAN RESIDENSIAL) */}
      {/* ==================================================================== */}
      {[
        // Sisi Timur Residensi (x: 18..19, y: 1..8)
        { x: 19, y: 8 }, { x: 18, y: 7 }, { x: 19, y: 6 },
        { x: 18, y: 5 }, { x: 19, y: 4 }, { x: 18, y: 3 }, { x: 19, y: 2 }, { x: 18, y: 1 },
        // Sisi Barat Residensi (x: 2..3, y: 1..8)
        { x: 2, y: 8 }, { x: 3, y: 7 }, { x: 2, y: 6 },
        { x: 3, y: 5 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 },
      ].map((pos, idx) => (
        <g key={`tall_tree_${idx}`}>
          <rect x={pos.x} y={pos.y} width="1" height="3" rx="0.45" fill="#166534" stroke="#14532d" strokeWidth="0.08" />
          <circle cx={pos.x + 0.5} cy={pos.y + 1.1} r="0.65" fill="#22c55e" stroke="#15803d" strokeWidth="0.08" />
          <circle cx={pos.x + 0.5} cy={pos.y + 1.1} r="0.32" fill="#4ade80" opacity="0.6" />
        </g>
      ))}

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

          <text x="11.5" y="8" fill="#fef3c7" fontSize="1.1" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.2">
            RUMAH
          </text>

          <text x="27.5" y="5.5" fill="#fef2f2" fontSize="1.3" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            SD
          </text>
          <text x="33.5" y="5.5" fill="#eff6ff" fontSize="1.3" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            SMP
          </text>
          <text x="39.5" y="5.5" fill="#ecfeff" fontSize="1.3" fontWeight="bold" textAnchor="middle" stroke="#000000" strokeWidth="0.25">
            SMA
          </text>

          <text x="68.5" y="5.5" fill="#fde68a" fontSize="1.25" fontWeight="bold" textAnchor="middle" stroke="#78350f" strokeWidth="0.25">
            LAHAN PERTANIAN
          </text>

          <text x="40" y="41" fill="#f8fafc" fontSize="2.5" fontWeight="900" textAnchor="middle" stroke="#0f172a" strokeWidth="0.4">
            ALUN-ALUN
          </text>
          <text x="29" y="53.8" fill="#bbf7d0" fontSize="0.75" fontWeight="bold" textAnchor="middle" stroke="#14532d" strokeWidth="0.18">
            SEPAK BOLA
          </text>
          <text x="51" y="53.8" fill="#fed7aa" fontSize="0.75" fontWeight="bold" textAnchor="middle" stroke="#7c2d12" strokeWidth="0.18">
            BASKET
          </text>

          <text x="40" y="75" fill="#fef08a" fontSize="2.4" fontWeight="900" textAnchor="middle" stroke="#78350f" strokeWidth="0.4">
            PANTAI PASIR SELATAN
          </text>

          {/* Label 6 Gedung 5x5 Barat */}
          <text x="3.5" y="24" fill="#fef3c7" fontSize="0.85" fontWeight="bold" textAnchor="middle" stroke="#451a03" strokeWidth="0.2">
            CAFE
          </text>
          <text x="14.5" y="24" fill="#e0f2fe" fontSize="0.75" fontWeight="bold" textAnchor="middle" stroke="#075985" strokeWidth="0.2">
            PERPUS
          </text>
          <text x="3.5" y="40" fill="#dbeafe" fontSize="0.75" fontWeight="bold" textAnchor="middle" stroke="#172554" strokeWidth="0.2">
            POLISI
          </text>
          <text x="14.5" y="40" fill="#fef9c3" fontSize="0.85" fontWeight="bold" textAnchor="middle" stroke="#713f12" strokeWidth="0.2">
            BANK
          </text>
          <text x="3.5" y="56" fill="#d1fae5" fontSize="0.75" fontWeight="bold" textAnchor="middle" stroke="#064e3b" strokeWidth="0.2">
            APOTEK
          </text>
          <text x="14.5" y="56" fill="#f3e8ff" fontSize="0.75" fontWeight="bold" textAnchor="middle" stroke="#3b0764" strokeWidth="0.2">
            MAKELAR
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
