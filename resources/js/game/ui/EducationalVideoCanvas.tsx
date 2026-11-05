/**
 * ============================================================================
 * FILE: resources/js/game/ui/EducationalVideoCanvas.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mesin Pemutar Video Animasi Edukasi Berkecepatan Tinggi (60 FPS).
 * Menghadirkan visualisasi animasi bergerak nyata, partikel mengalir,
 * kebun berhitung apel, jam analog berputar, metamorfosis kupu-kupu,
 * rantai makanan, wujud benda, koding Scratch, dan Garuda Pancasila
 * yang disesuaikan secara presisi untuk setiap topik materi di RadenWorld.
 * ============================================================================
 */

import React from 'react';
import { VisualDiagramType } from './LibraryTopicVisualizer';
import { ILibraryTopicItem } from '../data/library/SdLibraryData';

interface EducationalVideoCanvasProps {
  type: VisualDiagramType;
  step: number;
  isPlaying: boolean;
  playbackSpeed?: number;
  topic?: ILibraryTopicItem | null;
}

export const EducationalVideoCanvas: React.FC<EducationalVideoCanvasProps> = ({
  type,
  step = 0,
  isPlaying,
  playbackSpeed = 1,
  topic,
}) => {
  const playClass = isPlaying ? 'anim-running' : 'anim-paused';

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${playClass}`}>
      {/* ==================================================================== */}
      {/* GLOBAL CSS KEYFRAMES UNTUK ANIMASI 60FPS BERGERAK                    */}
      {/* ==================================================================== */}
      <style>{`
        .anim-running * { animation-play-state: running !important; }
        .anim-paused * { animation-play-state: paused !important; }

        @keyframes spin360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin360Rev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes solarPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 14px rgba(245,158,11,0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 28px rgba(245,158,11,1)); }
        }
        @keyframes dashStream {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes dashStreamFast {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes vaporFloatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translateY(-75px) scale(1.3); opacity: 0; }
        }
        @keyframes gasFloatIn {
          0% { transform: translateX(-40px); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: translateX(50px); opacity: 0; }
        }
        @keyframes rainFallStream {
          0% { transform: translate(0, -35px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translate(-30px, 95px); opacity: 0; }
        }
        @keyframes oceanWaveSway {
          0% { transform: translateX(0); }
          50% { transform: translateX(-24px); }
          100% { transform: translateX(0); }
        }
        @keyframes heartLubDub {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.15); filter: drop-shadow(0 0 16px rgba(239,68,68,0.8)); }
          28% { transform: scale(0.96); }
          42% { transform: scale(1.10); filter: drop-shadow(0 0 12px rgba(239,68,68,0.6)); }
        }
        @keyframes wheelSpinAnim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes roadScrollAnim {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -60; }
        }
        @keyframes dnaTwist3D {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          25% { transform: scaleY(0.15); opacity: 0.35; }
          50% { transform: scaleY(-1); opacity: 1; }
          75% { transform: scaleY(-0.15); opacity: 0.35; }
        }
        @keyframes sliceHoverAnim {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -14px); }
        }
        @keyframes hopRabbit {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @keyframes clockHourAnim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes clockMinAnim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes butterflyFlap {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.25); }
        }
        @keyframes beeSway {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -8px); }
        }
        @keyframes fishFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(14px, -4px) rotate(4deg); }
        }
        @keyframes barGrowUp {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.92); }
        }
        @keyframes lungsBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 12px rgba(56,189,248,0.7)); }
        }
        @keyframes bookHover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shapeMorph {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.06) rotate(3deg); }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* 1. MATEMATIKA: MENGENAL BILANGAN CACAH 1-10 & NILAI TEMPAT           */}
      {/* ==================================================================== */}
      {type === 'math_counting' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />
          <rect x="0" y="240" width="600" height="80" fill="#14532d" />
          <path d="M 0 240 Q 150 232, 300 240 T 600 240" stroke="#22c55e" strokeWidth="4" fill="none" />

          {/* Header */}
          <g transform="translate(300, 22)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="12.5" fontWeight="900" textAnchor="middle">
              🍎 BERHITUNG CERIA: BILANGAN CACAH 1 SAMPAI 10 🔢
            </text>
          </g>

          {/* 10 Kartu Angka */}
          <g transform="translate(25, 68)">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => {
              const isHighlight = step === 0 ? num <= 3 : step === 1 ? num <= 6 : num <= 10;
              return (
                <g key={num} transform={`translate(${i * 55}, 0)`}>
                  <rect
                    x="0"
                    y="0"
                    width="48"
                    height="62"
                    rx="8"
                    fill={isHighlight ? '#1e1b4b' : '#0f172a'}
                    stroke={isHighlight ? '#fbbf24' : '#334155'}
                    strokeWidth={isHighlight ? '2.5' : '1.5'}
                    style={isHighlight ? { animation: 'solarPulse 2s infinite ' + (i * 0.12) + 's' } : undefined}
                  />
                  <text x="24" y="32" fill={isHighlight ? '#fde047' : '#64748b'} fontSize="18" fontWeight="900" textAnchor="middle">
                    {num}
                  </text>
                  <text x="24" y="52" fontSize="11" textAnchor="middle">
                    {num <= 3 ? '🍎' : num <= 6 ? '🍊' : num <= 9 ? '⭐' : '🌟'}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Keranjang Apel Panen di Kiri */}
          <g transform="translate(75, 148)">
            <path d="M 0 35 L 20 85 L 130 85 L 150 35 Z" fill="#78350f" stroke="#b45309" strokeWidth="3" />
            <path d="M 10 35 Q 75 -10, 140 35" stroke="#92400e" strokeWidth="4" fill="none" />
            {[
              { x: 30, y: 38 }, { x: 55, y: 30 }, { x: 80, y: 34 }, { x: 105, y: 38 },
              { x: 45, y: 55 }, { x: 70, y: 52 }, { x: 95, y: 56 }
            ].map((pos, aIdx) => (
              <g key={aIdx} transform={`translate(${pos.x}, ${pos.y})`} style={{ animation: 'hopRabbit 1.4s ease-in-out infinite ' + (aIdx * 0.18) + 's' }}>
                <circle cx="0" cy="0" r="10" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                <path d="M 0 -10 Q 3 -15, 6 -14" stroke="#15803d" strokeWidth="2" fill="none" />
                <circle cx="-3" cy="-3" r="2.5" fill="#fca5a5" />
              </g>
            ))}
            <rect x="25" y="92" width="100" height="22" rx="6" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
            <text x="75" y="107" fill="#4ade80" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              {step === 0 ? '3 Apel Segar 🍎' : step === 1 ? '7 Buah Panen 🍊' : '10 Apel Penuh! 🎉'}
            </text>
          </g>

          {/* Kelinci Melompat di Garis Bilangan (Kanan) */}
          <g transform="translate(305, 148)">
            <rect x="0" y="0" width="265" height="118" rx="12" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="132" y="24" fill="#7dd3fc" fontSize="12" fontWeight="bold" textAnchor="middle">
              🐇 LOMPATAN GARIS BILANGAN
            </text>
            <line x1="20" y1="65" x2="245" y2="65" stroke="#94a3b8" strokeWidth="3" />
            {[0, 1, 2, 3, 4].map(idx => (
              <g key={idx} transform={`translate(${30 + idx * 48}, 65)`}>
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#f59e0b" strokeWidth="2.5" />
                <text x="0" y="20" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {(idx + 1) * 2}
                </text>
              </g>
            ))}
            <g transform={`translate(${30 + (step * 50)}, 45)`} style={{ animation: 'hopRabbit 0.8s ease-in-out infinite' }}>
              <circle cx="0" cy="0" r="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
              <ellipse cx="-4" cy="-14" rx="3.5" ry="9" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="4" cy="-14" rx="3.5" ry="9" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="-3" cy="-2" r="2" fill="#0f172a" />
              <circle cx="3" cy="-2" r="2" fill="#0f172a" />
              <circle cx="0" cy="2" r="1.5" fill="#f43f5e" />
            </g>
            <text x="132" y="104" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
              1 &lt; 2 &lt; 3 &lt; 4 &lt; 5 &lt; 6 &lt; 7 &lt; 8 &lt; 9 &lt; 10
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 2. MATEMATIKA: PENJUMLAHAN & PENGURANGAN BUAH                         */}
      {/* ==================================================================== */}
      {type === 'math_addition_subtraction' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#1e1b4b" stroke="#22c55e" strokeWidth="2" />
            <text x="0" y="22" fill="#4ade80" fontSize="13" fontWeight="900" textAnchor="middle">
              ➕ PENJUMLAHAN & PENGURANGAN BERGAMBAR ➖
            </text>
          </g>

          {/* Sisi Kiri: Kelompok A (6 Apel Merah) */}
          <g transform="translate(45, 80)">
            <rect x="0" y="0" width="150" height="170" rx="12" fill="#1e1b4b" stroke="#ef4444" strokeWidth="2.5" />
            <text x="75" y="26" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">
              6 Apel Merah
            </text>
            <g transform="translate(25, 45)">
              {[
                { x: 20, y: 15 }, { x: 55, y: 15 }, { x: 85, y: 15 },
                { x: 20, y: 55 }, { x: 55, y: 55 }, { x: 85, y: 55 },
              ].map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="12" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" style={{ animation: 'hopRabbit 1.8s infinite ' + (idx * 0.15) + 's' }} />
              ))}
            </g>
            <rect x="35" y="125" width="80" height="28" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            <text x="75" y="144" fill="#f87171" fontSize="16" fontWeight="900" textAnchor="middle">6</text>
          </g>

          {/* Tanda Tambah / Kurang Bersinar di Tengah */}
          <g transform="translate(225, 145)">
            <circle cx="20" cy="20" r="26" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" style={{ animation: 'solarPulse 2s infinite' }} />
            <text x="20" y="29" fill="#fde047" fontSize="28" fontWeight="900" textAnchor="middle">
              {step <= 2 ? '+' : '−'}
            </text>
          </g>

          {/* Sisi Tengah: Kelompok B (7 Jeruk Oranye) */}
          <g transform="translate(295, 80)">
            <rect x="0" y="0" width="150" height="170" rx="12" fill="#1e1b4b" stroke="#ea580c" strokeWidth="2.5" />
            <text x="75" y="26" fill="#fdba74" fontSize="12" fontWeight="bold" textAnchor="middle">
              7 Jeruk Manis
            </text>
            <g transform="translate(25, 45)">
              {[
                { x: 18, y: 15 }, { x: 52, y: 15 }, { x: 85, y: 15 },
                { x: 18, y: 50 }, { x: 52, y: 50 }, { x: 85, y: 50 },
                { x: 52, y: 85 }
              ].map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="11" fill="#f97316" stroke="#9a3412" strokeWidth="1.5" style={{ animation: 'hopRabbit 1.8s infinite ' + (idx * 0.15) + 's' }} />
              ))}
            </g>
            <rect x="35" y="125" width="80" height="28" rx="6" fill="#0f172a" stroke="#ea580c" strokeWidth="1.5" />
            <text x="75" y="144" fill="#fb923c" fontSize="16" fontWeight="900" textAnchor="middle">7</text>
          </g>

          {/* Sisi Kanan: Hasil Gabungan Total */}
          <g transform="translate(470, 80)">
            <rect x="0" y="0" width="115" height="170" rx="12" fill="#022c22" stroke="#22c55e" strokeWidth="2.5" />
            <text x="57" y="26" fill="#86efac" fontSize="11" fontWeight="bold" textAnchor="middle">
              TOTAL HASIL
            </text>
            <text x="57" y="70" fill="#4ade80" fontSize="36" fontWeight="900" textAnchor="middle">
              {step <= 2 ? '13' : '9'}
            </text>
            <text x="57" y="98" fill="#bbf7d0" fontSize="11" textAnchor="middle">Buah Segar</text>
            <rect x="12" y="125" width="91" height="28" rx="6" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
            <text x="57" y="144" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">
              {step <= 2 ? '6 + 7 = 13' : '15 − 6 = 9'}
            </text>
          </g>

          {/* Footer Formula */}
          <text x="300" y="295" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">
            💡 Konsep: Menghitung gabungan benda nyata membuat berhitung sangat mudah dipahami!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 3. MATEMATIKA: BANGUN DATAR & PENGUKURAN PANJANG BAKU                */}
      {/* ==================================================================== */}
      {type === 'math_geometry_shapes' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="22" fill="#7dd3fc" fontSize="13" fontWeight="900" textAnchor="middle">
              📐 BENTUK BANGUN DATAR & PENGUKURAN PANJANG 📏
            </text>
          </g>

          {/* 3 Bangun Datar Bersinar */}
          {/* Segitiga */}
          <g transform="translate(60, 80)">
            <polygon points="55,15 15,95 95,95" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="3" style={{ animation: 'shapeMorph 3s infinite' }} />
            <text x="55" y="70" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">SEGITIGA</text>
            <rect x="5" y="110" width="100" height="36" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="55" y="125" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">3 Sisi Lurus</text>
            <text x="55" y="138" fill="#cbd5e1" fontSize="9" textAnchor="middle">3 Titik Sudut</text>
          </g>

          {/* Persegi */}
          <g transform="translate(200, 80)">
            <rect x="15" y="15" width="80" height="80" rx="4" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="3" style={{ animation: 'shapeMorph 3s infinite 0.5s' }} />
            <text x="55" y="62" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">PERSEGI</text>
            <rect x="5" y="110" width="100" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="55" y="125" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="middle">4 Sisi Sama</text>
            <text x="55" y="138" fill="#cbd5e1" fontSize="9" textAnchor="middle">4 Sudut Siku 90°</text>
          </g>

          {/* Lingkaran */}
          <g transform="translate(340, 80)">
            <circle cx="55" cy="55" r="40" fill="#1e1b4b" stroke="#ec4899" strokeWidth="3" style={{ animation: 'shapeMorph 3s infinite 1s' }} />
            <text x="55" y="60" fill="#f472b6" fontSize="10" fontWeight="bold" textAnchor="middle">LINGKARAN</text>
            <rect x="5" y="110" width="100" height="36" rx="6" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
            <text x="55" y="125" fill="#f472b6" fontSize="10" fontWeight="bold" textAnchor="middle">1 Garis Lengkung</text>
            <text x="55" y="138" fill="#cbd5e1" fontSize="9" textAnchor="middle">Tanpa Sudut (0°)</text>
          </g>

          {/* Persegi Panjang & Penggaris di Kanan */}
          <g transform="translate(470, 75)">
            <rect x="0" y="0" width="105" height="155" rx="10" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
            <text x="52" y="24" fill="#86efac" fontSize="11" fontWeight="bold" textAnchor="middle">KELILING</text>
            <text x="52" y="45" fill="#4ade80" fontSize="9.5" textAnchor="middle">Persegi:</text>
            <text x="52" y="60" fill="#fde047" fontSize="11" fontWeight="extrabold" textAnchor="middle">K = 4 × s</text>
            <line x1="15" y1="72" x2="90" y2="72" stroke="#334155" strokeWidth="1" />
            <text x="52" y="90" fill="#4ade80" fontSize="9.5" textAnchor="middle">Persegi Pjg:</text>
            <text x="52" y="105" fill="#fde047" fontSize="11" fontWeight="extrabold" textAnchor="middle">K = 2×(p + l)</text>
            <rect x="10" y="120" width="85" height="24" rx="4" fill="#14532d" />
            <text x="52" y="136" fill="#86efac" fontSize="9" fontWeight="bold" textAnchor="middle">Luas = p × l</text>
          </g>

          {/* Penggaris Kayu Baku di Bagian Bawah */}
          <g transform="translate(60, 245)">
            <rect x="0" y="0" width="480" height="38" rx="6" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((tick, i) => (
              <g key={tick} transform={`translate(${i * 30 + 15}, 0)`}>
                <line x1="0" y1="0" x2="0" y2={i % 5 === 0 ? 18 : 10} stroke="#fef3c7" strokeWidth={i % 5 === 0 ? 2 : 1.2} />
                {i % 5 === 0 && (
                  <text x="0" y="30" fill="#fef3c7" fontSize="10" fontWeight="bold" textAnchor="middle">{i}</text>
                )}
              </g>
            ))}
            <text x="440" y="24" fill="#fef08a" fontSize="10.5" fontWeight="extrabold">cm (Baku)</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 4. MATEMATIKA: MEMBACA JAM ANALOG & WAKTU                             */}
      {/* ==================================================================== */}
      {type === 'math_clock_time' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="13" fontWeight="900" textAnchor="middle">
              ⏰ MEMBACA JAM ANALOG & SATUAN WAKTU ⏱️
            </text>
          </g>

          {/* Jam Dinding Analog Besar */}
          <g transform="translate(180, 175)">
            <circle cx="0" cy="0" r="105" fill="#1e293b" stroke="#0ea5e9" strokeWidth="8" />
            <circle cx="0" cy="0" r="95" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />

            {/* 12 Angka Jam */}
            {[
              { num: 12, x: 0, y: -72 },
              { num: 1, x: 38, y: -62 },
              { num: 2, x: 65, y: -36 },
              { num: 3, x: 74, y: 4 },
              { num: 4, x: 65, y: 44 },
              { num: 5, x: 38, y: 70 },
              { num: 6, x: 0, y: 78 },
              { num: 7, x: -38, y: 70 },
              { num: 8, x: -65, y: 44 },
              { num: 9, x: -74, y: 4 },
              { num: 10, x: -65, y: -36 },
              { num: 11, x: -38, y: -62 },
            ].map(item => (
              <text key={item.num} x={item.x} y={item.y} fill="#f8fafc" fontSize="13" fontWeight="900" textAnchor="middle">
                {item.num}
              </text>
            ))}

            {/* Jarum Pendek (Jam) */}
            <g style={{ animation: 'clockHourAnim 24s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="0" y1="0" x2="0" y2="-45" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
            </g>

            {/* Jarum Panjang (Menit) */}
            <g style={{ animation: 'clockMinAnim 4s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="0" y1="0" x2="0" y2="-72" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Jarum Detik (Cepat) */}
            <g style={{ animation: 'clockMinAnim 1s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="0" y1="0" x2="0" y2="-80" stroke="#f59e0b" strokeWidth="1.5" />
            </g>

            <circle cx="0" cy="0" r="6" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
          </g>

          {/* Sisi Kanan: Kartu Waktu & Jadwal Sekolah */}
          <g transform="translate(340, 75)">
            <rect x="0" y="0" width="235" height="205" rx="14" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="0" y="0" width="235" height="34" rx="14" fill="#0f172a" />
            <text x="117" y="22" fill="#fbbf24" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              📅 JADWAL WAKTU SEHARI-HARI
            </text>

            <g transform="translate(15, 48)">
              {[
                { time: '07:00 Pagi', icon: '🎒', title: 'Berangkat ke Sekolah', desc: 'Jarum pendek ke 7, panjang ke 12' },
                { time: '12:00 Siang', icon: '🍱', title: 'Makan Siang & Istirahat', desc: 'Kedua jarum tepat di angka 12' },
                { time: '19:00 Malam', icon: '📖', title: 'Belajar & Mengulang Materi', desc: 'Jarum pendek ke 7 malam' }
              ].map((sch, sIdx) => (
                <g key={sIdx} transform={`translate(0, ${sIdx * 48})`}>
                  <rect x="0" y="0" width="205" height="42" rx="8" fill="#0f172a" stroke={sIdx === step % 3 ? '#22c55e' : '#334155'} strokeWidth="1.5" />
                  <text x="10" y="18" fill="#fde047" fontSize="10.5" fontWeight="bold">{sch.icon} {sch.time}</text>
                  <text x="10" y="32" fill="#94a3b8" fontSize="8.5">{sch.desc}</text>
                </g>
              ))}
            </g>
          </g>

          <text x="300" y="302" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
            💡 1 Jam = 60 Menit • 1 Menit = 60 Detik • 1 Hari = 24 Jam
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 5. MATEMATIKA: PERKALIAN & PEMBAGIAN                                 */}
      {/* ==================================================================== */}
      {type === 'math_multiplication_division' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="13" fontWeight="900" textAnchor="middle">
              ✖️ PERKALIAN SEBAGAI PENJUMLAHAN BERULANG ➗
            </text>
          </g>

          {/* 3 Toples Berisi Bintang */}
          <g transform="translate(60, 80)">
            {[0, 1, 2].map(jarIdx => (
              <g key={jarIdx} transform={`translate(${jarIdx * 155}, 0)`}>
                <rect x="0" y="15" width="125" height="135" rx="14" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="3" />
                <rect x="25" y="0" width="75" height="18" rx="6" fill="#0284c7" stroke="#7dd3fc" strokeWidth="2" />
                <text x="62" y="36" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Toples {jarIdx + 1}
                </text>
                <g transform="translate(30, 50)">
                  {[
                    { x: 15, y: 15 }, { x: 50, y: 15 },
                    { x: 15, y: 50 }, { x: 50, y: 50 }
                  ].map((sPos, sIdx) => (
                    <text key={sIdx} x={sPos.x} y={sPos.y} fontSize="18" textAnchor="middle" style={{ animation: 'solarPulse 2s infinite ' + (sIdx * 0.2) + 's' }}>
                      ⭐
                    </text>
                  ))}
                </g>
                <rect x="25" y="115" width="75" height="24" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="62" y="131" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
                  4 Bintang
                </text>
              </g>
            ))}
          </g>

          {/* Banner Hasil Operasi Matematika */}
          <g transform="translate(75, 240)">
            <rect x="0" y="0" width="450" height="55" rx="12" fill="#1e1b4b" stroke="#22c55e" strokeWidth="2.5" />
            <text x="225" y="24" fill="#4ade80" fontSize="14" fontWeight="900" textAnchor="middle">
              3 Toples × 4 Bintang = 12 Bintang
            </text>
            <text x="225" y="44" fill="#cbd5e1" fontSize="11" textAnchor="middle">
              Penjumlahan Berulang: 4 + 4 + 4 = 12 &nbsp;•&nbsp; Pembagian: 12 ÷ 3 = 4
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 6. MATEMATIKA: DIAGRAM BATANG & DATA STATISTIK                        */}
      {/* ==================================================================== */}
      {type === 'math_data_charts' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#0ea5e9" strokeWidth="2" />
            <text x="0" y="22" fill="#7dd3fc" fontSize="13" fontWeight="900" textAnchor="middle">
              📊 PENYAJIAN DATA STATISTIK: DIAGRAM BATANG 📈
            </text>
          </g>

          {/* Area Grafik Kartesius */}
          <g transform="translate(85, 75)">
            {/* Sumbu Y & Sumbu X */}
            <line x1="0" y1="0" x2="0" y2="160" stroke="#94a3b8" strokeWidth="3" />
            <line x1="0" y1="160" x2="440" y2="160" stroke="#94a3b8" strokeWidth="3" />

            {/* Grid Garis Bantu */}
            {[40, 80, 120].map((gy, gIdx) => (
              <g key={gy}>
                <line x1="0" y1={gy} x2="440" y2={gy} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                <text x="-12" y={gy + 4} fill="#64748b" fontSize="10" textAnchor="end">{(3 - gIdx) * 5}</text>
              </g>
            ))}
            <text x="-12" y="164" fill="#64748b" fontSize="10" textAnchor="end">0</text>

            {/* 4 Batang Diagram Bertumbuh */}
            {[
              { label: 'Sains 🔬', height: 130, color: '#38bdf8', count: 18 },
              { label: 'Matematika 🔢', height: 110, color: '#f59e0b', count: 15 },
              { label: 'Seni 🎨', height: 80, color: '#ec4899', count: 10 },
              { label: 'Olahraga ⚽', height: 145, color: '#22c55e', count: 20 },
            ].map((bar, bIdx) => {
              const xPos = 40 + bIdx * 95;
              const yPos = 160 - bar.height;
              return (
                <g key={bIdx} transform={`translate(${xPos}, 0)`}>
                  <rect
                    x="0"
                    y={yPos}
                    width="55"
                    height={bar.height}
                    rx="6"
                    fill={bar.color}
                    style={{ animation: 'barGrowUp 2s ease-in-out infinite ' + (bIdx * 0.2) + 's', transformOrigin: '0px 160px' }}
                  />
                  <text x="27" y={yPos - 8} fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle">{bar.count}</text>
                  <text x="27" y="180" fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">{bar.label}</text>
                </g>
              );
            })}
          </g>

          <text x="300" y="295" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
            💡 Diagram batang mempermudah kita melihat data terbanyak dan tersedikit secara jelas!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 7. IPA: PERTUMBUHAN TANAMAN & BAGIAN TUMBUHAN                        */}
      {/* ==================================================================== */}
      {type === 'science_plants_growth' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />
          {/* Tanah Subur & Akar */}
          <rect x="0" y="235" width="600" height="85" fill="#451a03" />
          <path d="M 0 235 Q 150 230, 300 235 T 600 235" stroke="#78350f" strokeWidth="4" fill="none" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#064e3b" stroke="#22c55e" strokeWidth="2" />
            <text x="0" y="22" fill="#86efac" fontSize="13" fontWeight="900" textAnchor="middle">
              🌱 BAGIAN UTAMA TUMBUHAN & PERTUMBUHANNYA 🌸
            </text>
          </g>

          {/* Matahari Hangat di Pojok Kiri */}
          <g transform="translate(75, 75)">
            <circle cx="0" cy="0" r="32" fill="#f59e0b" style={{ animation: 'solarPulse 2.5s infinite' }} />
            <circle cx="0" cy="0" r="20" fill="#fde047" />
            <text x="0" y="4" fill="#78350f" fontSize="9" fontWeight="bold" textAnchor="middle">Mentari</text>
          </g>

          {/* Batang Utama Tumbuh Naik */}
          <path d="M 230 235 Q 225 170, 230 115" stroke="#16a34a" strokeWidth="12" strokeLinecap="round" fill="none" />

          {/* Akar Mengakar ke Bawah */}
          <g stroke="#a16207" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 230 235 Q 210 265, 185 295" />
            <path d="M 230 235 Q 240 270, 260 300" />
            <path d="M 230 245 L 230 305" />
          </g>
          <text x="230" y="275" fill="#fde047" fontSize="10.5" fontWeight="bold" textAnchor="middle">Akar Menyerap Air 💧</text>

          {/* Daun Hijau */}
          <g transform="translate(230, 165)">
            <path d="M 0 0 Q -50 -35, -45 15 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" style={{ animation: 'shapeMorph 3s infinite' }} />
            <path d="M 0 -20 Q 50 -55, 45 -5 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" style={{ animation: 'shapeMorph 3s infinite 0.5s' }} />
          </g>

          {/* Bunga Mekar Indah */}
          <g transform="translate(230, 110)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle
                key={deg}
                cx={Math.cos((deg * Math.PI) / 180) * 22}
                cy={Math.sin((deg * Math.PI) / 180) * 22}
                r="14"
                fill="#ec4899"
                stroke="#db2777"
                strokeWidth="1.5"
              />
            ))}
            <circle cx="0" cy="0" r="16" fill="#fde047" stroke="#eab308" strokeWidth="2" />
          </g>

          {/* Lebah Madu Terbang Menyerbuki Bunga */}
          <g transform="translate(300, 95)" style={{ animation: 'beeSway 2s ease-in-out infinite' }}>
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
            <line x1="-3" y1="-9" x2="-3" y2="9" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="4" y1="-9" x2="4" y2="9" stroke="#0f172a" strokeWidth="2.5" />
            <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#e0f2fe" opacity="0.8" />
            <text x="25" y="4" fill="#fde047" fontSize="10" fontWeight="bold">🐝 Lebah Penyerbuk</text>
          </g>

          {/* Keterangan Bagian Tumbuhan di Kanan */}
          <g transform="translate(390, 75)">
            <rect x="0" y="0" width="185" height="150" rx="12" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
            <text x="92" y="24" fill="#86efac" fontSize="11" fontWeight="bold" textAnchor="middle">4 BAGIAN UTAMA</text>
            <g transform="translate(15, 42)" className="space-y-1">
              {[
                { name: '1. Akar', desc: 'Menyerap air & nutrisi' },
                { name: '2. Batang', desc: 'Menopang & menyalurkan air' },
                { name: '3. Daun', desc: 'Dapur fotosintesis hijau' },
                { name: '4. Bunga', desc: 'Alat perkembangbiakan' }
              ].map((p, idx) => (
                <g key={idx} transform={`translate(0, ${idx * 26})`}>
                  <text x="0" y="10" fill="#fde047" fontSize="9.5" fontWeight="bold">{p.name}</text>
                  <text x="0" y="20" fill="#cbd5e1" fontSize="8">{p.desc}</text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 8. IPA: HEWAN & 3 HABITAT ALAMI (DARAT, AIR, UDARA)                  */}
      {/* ==================================================================== */}
      {type === 'science_animals_habitat' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Langit Biru (Udara) */}
          <rect x="0" y="0" width="600" height="130" fill="#0c4a6e" />
          {/* Padang Rumput (Darat) */}
          <rect x="0" y="130" width="360" height="190" fill="#14532d" />
          {/* Danau Mistik (Air) */}
          <rect x="360" y="130" width="240" height="190" fill="#0369a1" />

          {/* Header */}
          <g transform="translate(300, 22)">
            <rect x="-185" y="0" width="370" height="32" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="21" fill="#7dd3fc" fontSize="12" fontWeight="900" textAnchor="middle">
              🐾 HABITAT HEWAN: DARAT 🏞️ • AIR 🌊 • UDARA ☁️
            </text>
          </g>

          {/* Burung Terbang di Udara */}
          <g transform="translate(150, 75)" style={{ animation: 'beeSway 2.5s ease-in-out infinite' }}>
            <text x="0" y="0" fontSize="24">🕊️</text>
            <text x="32" y="-2" fill="#e0f2fe" fontSize="10.5" fontWeight="bold">Burung (Udara)</text>
          </g>

          {/* Kelinci di Padang Rumput */}
          <g transform="translate(100, 185)" style={{ animation: 'hopRabbit 1.2s infinite' }}>
            <text x="0" y="0" fontSize="34">🐇</text>
            <text x="45" y="-5" fill="#fef08a" fontSize="11" fontWeight="bold">Kelinci Lucu (Darat)</text>
            <text x="45" y="12" fill="#86efac" fontSize="9">Makan rumput &amp; wortel 🥕</text>
          </g>

          {/* Ikan di Danau Biru */}
          <g transform="translate(430, 200)" style={{ animation: 'fishFloat 2s ease-in-out infinite' }}>
            <text x="0" y="0" fontSize="34">🐟</text>
            <text x="45" y="-5" fill="#bae6fd" fontSize="11" fontWeight="bold">Ikan Mas (Air)</text>
            <text x="45" y="12" fill="#7dd3fc" fontSize="9">Bernapas via insang 🫧</text>
          </g>

          {/* Katak Amfibi di Batas Rumput & Air */}
          <g transform="translate(325, 235)">
            <text x="0" y="0" fontSize="26">🐸</text>
            <rect x="-25" y="8" width="80" height="18" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
            <text x="15" y="21" fill="#4ade80" fontSize="8.5" fontWeight="bold" textAnchor="middle">Amfibi (2 Alam)</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 9. IPA: METAMORFOSIS SEMPURNA KUPU-KUPU                             */}
      {/* ==================================================================== */}
      {type === 'science_metamorphosis' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="13" fontWeight="900" textAnchor="middle">
              🦋 DAUR HIDUP &amp; METAMORFOSIS KUPU-KUPU 🌿
            </text>
          </g>

          {/* 4 Lingkaran Fase Metamorfosis */}
          {/* 1. Telur */}
          <g transform="translate(90, 140)">
            <circle cx="0" cy="0" r="45" fill="#1e1b4b" stroke={step === 0 ? '#fde047' : '#334155'} strokeWidth="3" />
            <text x="0" y="10" fontSize="28" textAnchor="middle">🥚</text>
            <text x="0" y="65" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">1. Telur di Daun</text>
          </g>

          {/* Panah 1 -> 2 */}
          <text x="165" y="145" fill="#22c55e" fontSize="22" fontWeight="bold">➔</text>

          {/* 2. Ulat */}
          <g transform="translate(230, 140)">
            <circle cx="0" cy="0" r="45" fill="#1e1b4b" stroke={step === 1 ? '#4ade80' : '#334155'} strokeWidth="3" />
            <text x="0" y="10" fontSize="28" textAnchor="middle">🐛</text>
            <text x="0" y="65" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">2. Ulat (Larva)</text>
          </g>

          {/* Panah 2 -> 3 */}
          <text x="305" y="145" fill="#22c55e" fontSize="22" fontWeight="bold">➔</text>

          {/* 3. Kepompong */}
          <g transform="translate(370, 140)">
            <circle cx="0" cy="0" r="45" fill="#1e1b4b" stroke={step === 2 ? '#f59e0b' : '#334155'} strokeWidth="3" />
            <text x="0" y="10" fontSize="28" textAnchor="middle">🪺</text>
            <text x="0" y="65" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">3. Kepompong (Pupa)</text>
          </g>

          {/* Panah 3 -> 4 */}
          <text x="445" y="145" fill="#22c55e" fontSize="22" fontWeight="bold">➔</text>

          {/* 4. Kupu-Kupu Indah */}
          <g transform="translate(510, 140)">
            <circle cx="0" cy="0" r="45" fill="#1e1b4b" stroke={step === 3 ? '#ec4899' : '#334155'} strokeWidth="3" />
            <g style={{ animation: 'butterflyFlap 0.8s ease-in-out infinite' }}>
              <text x="0" y="10" fontSize="30" textAnchor="middle">🦋</text>
            </g>
            <text x="0" y="65" fill="#ec4899" fontSize="11" fontWeight="bold" textAnchor="middle">4. Kupu-Kupu Dewasa</text>
          </g>

          <text x="300" y="285" fill="#cbd5e1" fontSize="11" textAnchor="middle">
            ✨ Metamorfosis Sempurna: Telur ➔ Ulat Lapar ➔ Kepompong Tenang ➔ Kupu-Kupu Cantik
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 10. IPA: RANTAI MAKANAN & JARING-JARING EKOSISTEM                    */}
      {/* ==================================================================== */}
      {type === 'science_food_chain' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#064e3b" stroke="#22c55e" strokeWidth="2" />
            <text x="0" y="22" fill="#86efac" fontSize="13" fontWeight="900" textAnchor="middle">
              🌾 RANTAI MAKANAN &amp; JARING EKOSISTEM 🦅
            </text>
          </g>

          {/* 5 Rantai Makanan Berurutan */}
          <g transform="translate(40, 140)">
            {[
              { icon: '☀️', role: 'Energi Matahari', color: '#f59e0b' },
              { icon: '🌱', role: 'Produsen (Padi/Rumput)', color: '#22c55e' },
              { icon: '🐇', role: 'Konsumen 1 (Herbivora)', color: '#38bdf8' },
              { icon: '🐍', role: 'Konsumen 2 (Karnivora)', color: '#ec4899' },
              { icon: '🦅', role: 'Konsumen Puncak (Elang)', color: '#a855f7' }
            ].map((node, nIdx) => (
              <g key={nIdx} transform={`translate(${nIdx * 105}, 0)`}>
                <circle cx="35" cy="0" r="32" fill="#1e1b4b" stroke={node.color} strokeWidth="2.5" style={{ animation: 'solarPulse 2s infinite ' + (nIdx * 0.25) + 's' }} />
                <text x="35" y="8" fontSize="24" textAnchor="middle">{node.icon}</text>
                <text x="35" y="52" fill={node.color} fontSize="9" fontWeight="bold" textAnchor="middle">{node.role}</text>
                {nIdx < 4 && (
                  <text x="82" y="5" fill="#fde047" fontSize="16" fontWeight="bold">➔</text>
                )}
              </g>
            ))}
          </g>

          {/* Pengurai Jamur di Bagian Bawah */}
          <g transform="translate(180, 240)">
            <rect x="0" y="0" width="240" height="42" rx="10" fill="#1e1b4b" stroke="#d97706" strokeWidth="2" />
            <text x="120" y="26" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
              🍄 Jamur Dekomposer (Pengurai Tanah)
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 11. IPA: WUJUD BENDA (PADAT, CAIR, GAS)                              */}
      {/* ==================================================================== */}
      {type === 'science_matter_states' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="22" fill="#7dd3fc" fontSize="13" fontWeight="900" textAnchor="middle">
              🧊 3 WUJUD BENDA: PADAT • CAIR • GAS 💨
            </text>
          </g>

          {/* 3 Tabung Wujud Benda */}
          {/* 1. Padat */}
          <g transform="translate(60, 80)">
            <rect x="0" y="0" width="130" height="165" rx="12" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="3" />
            <text x="65" y="26" fill="#7dd3fc" fontSize="12" fontWeight="bold" textAnchor="middle">1. BENDA PADAT</text>
            <rect x="35" y="45" width="60" height="60" rx="4" fill="#0284c7" stroke="#bae6fd" strokeWidth="2" />
            <text x="65" y="80" fontSize="24" textAnchor="middle">🧊</text>
            <rect x="10" y="125" width="110" height="28" rx="6" fill="#0f172a" />
            <text x="65" y="142" fill="#bae6fd" fontSize="9" textAnchor="middle">Bentuk &amp; Volume Tetap</text>
          </g>

          {/* 2. Cair */}
          <g transform="translate(235, 80)">
            <rect x="0" y="0" width="130" height="165" rx="12" fill="#1e1b4b" stroke="#0ea5e9" strokeWidth="3" />
            <text x="65" y="26" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">2. BENDA CAIR</text>
            <path d="M 25 105 Q 65 95, 105 105 L 105 115 L 25 115 Z" fill="#0284c7" />
            <text x="65" y="80" fontSize="24" textAnchor="middle">💧</text>
            <rect x="10" y="125" width="110" height="28" rx="6" fill="#0f172a" />
            <text x="65" y="142" fill="#7dd3fc" fontSize="9" textAnchor="middle">Mengikuti Bentuk Wadah</text>
          </g>

          {/* 3. Gas */}
          <g transform="translate(410, 80)">
            <rect x="0" y="0" width="130" height="165" rx="12" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="3" />
            <text x="65" y="26" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">3. BENDA GAS</text>
            <g style={{ animation: 'vaporFloatUp 2s infinite' }}>
              <circle cx="45" cy="85" r="8" fill="#fef08a" opacity="0.8" />
              <circle cx="85" cy="70" r="10" fill="#fde047" opacity="0.8" />
            </g>
            <text x="65" y="80" fontSize="24" textAnchor="middle">💨</text>
            <rect x="10" y="125" width="110" height="28" rx="6" fill="#0f172a" />
            <text x="65" y="142" fill="#fef08a" fontSize="9" textAnchor="middle">Mengisi Seluruh Ruangan</text>
          </g>

          <text x="300" y="295" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
            🔄 Perubahan Wujud: Mencair (Padat ➔ Cair) • Membeku (Cair ➔ Padat) • Menguap (Cair ➔ Gas)
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 12. IPA: PANCA INDRA & PARU-PARU PERNAPASAN MANUSIA                  */}
      {/* ==================================================================== */}
      {type === 'science_human_body' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#1e1b4b" stroke="#ec4899" strokeWidth="2" />
            <text x="0" y="22" fill="#f472b6" fontSize="13" fontWeight="900" textAnchor="middle">
              🫁 PANCA INDRA &amp; SISTEM PERNAPASAN MANUSIA 👁️
            </text>
          </g>

          {/* 5 Panca Indra di Kiri */}
          <g transform="translate(60, 75)">
            <rect x="0" y="0" width="220" height="195" rx="14" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <rect x="0" y="0" width="220" height="30" rx="14" fill="#0f172a" />
            <text x="110" y="20" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">5 PANCA INDRA KITA</text>
            <g transform="translate(15, 42)">
              {[
                { icon: '👁️', name: 'Mata (Penglihatan)', text: 'Melihat warna & bentuk' },
                { icon: '👂', name: 'Telinga (Pendengaran)', text: 'Mendengar bunyi & suara' },
                { icon: '👃', name: 'Hidung (Penciuman)', text: 'Membaui aroma wangi' },
                { icon: '👅', name: 'Lidah (Pengecap)', text: 'Mengecap manis, asam, asin' },
                { icon: '✋', name: 'Kulit (Peraba)', text: 'Merasakan halus & kasar' }
              ].map((s, idx) => (
                <g key={idx} transform={`translate(0, ${idx * 30})`}>
                  <text x="0" y="14" fontSize="13">{s.icon}</text>
                  <text x="24" y="12" fill="#fde047" fontSize="9.5" fontWeight="bold">{s.name}</text>
                  <text x="24" y="22" fill="#cbd5e1" fontSize="7.5">{s.text}</text>
                </g>
              ))}
            </g>
          </g>

          {/* Paru-Paru Bernapas Mengembang/Mengempis di Kanan */}
          <g transform="translate(420, 165)">
            <circle cx="0" cy="0" r="85" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="3" />
            <g style={{ animation: 'lungsBreathe 2.5s ease-in-out infinite' }}>
              {/* Paru Kiri */}
              <ellipse cx="-25" cy="5" rx="22" ry="38" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              {/* Paru Kanan */}
              <ellipse cx="25" cy="5" rx="22" ry="38" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              {/* Batang Tenggorokan Trakea */}
              <path d="M 0 -45 L 0 -10 M 0 -10 L -20 10 M 0 -10 L 20 10" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
            <text x="0" y="65" fill="#bae6fd" fontSize="10.5" fontWeight="bold" textAnchor="middle">🫁 Paru-Paru Sehat</text>
            <text x="0" y="78" fill="#38bdf8" fontSize="8.5" textAnchor="middle">Hirup O₂ Segar • Buang CO₂</text>
          </g>

          <text x="300" y="295" fill="#94a3b8" fontSize="10.5" textAnchor="middle">
            Menghirup udara segar di alam terbuka menjaga tubuh tetap sehat dan bugar!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 13. BAHASA INDONESIA: HURUF VOKAL & KONSONAN A-Z                     */}
      {/* ==================================================================== */}
      {type === 'language_alphabet_vocab' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="13" fontWeight="900" textAnchor="middle">
              🔤 HURUF VOKAL &amp; KONSONAN BAHASA INDONESIA 📖
            </text>
          </g>

          {/* 5 Huruf Vokal Utama */}
          <g transform="translate(60, 75)">
            <rect x="0" y="0" width="480" height="90" rx="14" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="240" y="24" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">
              5 HURUF VOKAL (SUARA TERBUKA)
            </text>
            {['A', 'I', 'U', 'E', 'O'].map((vok, vIdx) => (
              <g key={vok} transform={`translate(${45 + vIdx * 82}, 35)`}>
                <rect x="0" y="0" width="55" height="45" rx="8" fill="#0f172a" stroke="#fde047" strokeWidth="2" style={{ animation: 'solarPulse 2s infinite ' + (vIdx * 0.2) + 's' }} />
                <text x="27" y="32" fill="#fde047" fontSize="24" fontWeight="900" textAnchor="middle">{vok}</text>
              </g>
            ))}
          </g>

          {/* Gabungan Suku Kata & Kata BOLA */}
          <g transform="translate(60, 180)">
            <rect x="0" y="0" width="480" height="95" rx="14" fill="#1e1b4b" stroke="#22c55e" strokeWidth="2" />
            <text x="240" y="24" fill="#86efac" fontSize="11" fontWeight="bold" textAnchor="middle">
              MERANGKAI SUKU KATA MENJADI KATA
            </text>
            <g transform="translate(65, 38)">
              <rect x="0" y="0" width="85" height="42" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="42" y="27" fill="#7dd3fc" fontSize="18" fontWeight="bold" textAnchor="middle">BO</text>

              <text x="110" y="28" fill="#f59e0b" fontSize="22" fontWeight="bold">+</text>

              <rect x="135" y="0" width="85" height="42" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="177" y="27" fill="#7dd3fc" fontSize="18" fontWeight="bold" textAnchor="middle">LA</text>

              <text x="245" y="28" fill="#f59e0b" fontSize="22" fontWeight="bold">=</text>

              <rect x="270" y="0" width="115" height="42" rx="8" fill="#064e3b" stroke="#22c55e" strokeWidth="2" />
              <text x="327" y="27" fill="#4ade80" fontSize="18" fontWeight="900" textAnchor="middle">BOLA ⚽</text>
            </g>
          </g>

          <text x="300" y="300" fill="#cbd5e1" fontSize="10.5" textAnchor="middle">
            21 Huruf Konsonan + 5 Huruf Vokal membentuk ribuan kata indah bahasa Indonesia!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 14. BAHASA INDONESIA: FABEL HEWAN & DONGENG ANAK                     */}
      {/* ==================================================================== */}
      {type === 'language_story_fabel' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="13" fontWeight="900" textAnchor="middle">
              📚 DONGENG FABEL HEWAN &amp; PESAN MORAL INDAH 📖
            </text>
          </g>

          {/* Buku Cerita Terbuka Mempesona */}
          <g transform="translate(300, 150)" style={{ animation: 'bookHover 3s ease-in-out infinite' }}>
            {/* Lembar Buku Kiri */}
            <path d="M 0 -70 C -80 -80, -180 -60, -210 -40 L -210 60 C -180 40, -80 20, 0 30 Z" fill="#fffbeb" stroke="#d97706" strokeWidth="3" />
            {/* Lembar Buku Kanan */}
            <path d="M 0 -70 C 80 -80, 180 -60, 210 -40 L 210 60 C 180 40, 80 20, 0 30 Z" fill="#fffbeb" stroke="#d97706" strokeWidth="3" />
            <line x1="0" y1="-70" x2="0" y2="30" stroke="#b45309" strokeWidth="4" />

            {/* Tulisan di Halaman Kiri */}
            <g transform="translate(-110, -10)">
              <text x="0" y="-30" fill="#78350f" fontSize="11" fontWeight="bold" textAnchor="middle">Kisah Si Kancil 🦌</text>
              <text x="0" y="-12" fill="#92400e" fontSize="8.5" textAnchor="middle">"Di tepi sungai yang jernih,</text>
              <text x="0" y="2" fill="#92400e" fontSize="8.5" textAnchor="middle">Kancil cerdik menyeberang</text>
              <text x="0" y="16" fill="#92400e" fontSize="8.5" textAnchor="middle">dengan menghitung buaya..."</text>
            </g>

            {/* Tulisan di Halaman Kanan */}
            <g transform="translate(110, -10)">
              <text x="0" y="-30" fill="#78350f" fontSize="11" fontWeight="bold" textAnchor="middle">🌟 Pesan Kebaikan</text>
              <text x="0" y="-12" fill="#15803d" fontSize="8.5" fontWeight="bold" textAnchor="middle">Gunakan akal untuk kebaikan</text>
              <text x="0" y="2" fill="#15803d" fontSize="8.5" textAnchor="middle">Jangan berbuat curang</text>
              <text x="0" y="16" fill="#15803d" fontSize="8.5" textAnchor="middle">Selalu tolong-menolong</text>
            </g>
          </g>

          <text x="300" y="295" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
            ✨ Fabel adalah cerita fiksi yang tokohnya hewan dan mengajarkan budi pekerti luhur!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 15. BAHASA INGGRIS: GREETINGS, COLORS & NUMBERS                      */}
      {/* ==================================================================== */}
      {type === 'english_kids' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="34" rx="10" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="22" fill="#7dd3fc" fontSize="13" fontWeight="900" textAnchor="middle">
              🌐 FUN ENGLISH FOR KIDS: GREETINGS &amp; WORDS 👋
            </text>
          </g>

          {/* Kartu Dialog Salam Interaktif */}
          <g transform="translate(50, 75)">
            <rect x="0" y="0" width="230" height="185" rx="14" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="115" y="26" fill="#bae6fd" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              DAILY GREETINGS
            </text>
            <g transform="translate(15, 45)">
              {[
                { en: 'Good Morning!', id: 'Selamat Pagi ☀️' },
                { en: 'How are you?', id: 'Bagaimana kabarmu? 😊' },
                { en: "I'm fine, thank you!", id: 'Saya baik, terima kasih! 🌟' },
                { en: 'See you later!', id: 'Sampai jumpa lagi! 👋' }
              ].map((gItem, gIdx) => (
                <g key={gIdx} transform={`translate(0, ${gIdx * 32})`}>
                  <rect x="0" y="0" width="200" height="26" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
                  <text x="10" y="14" fill="#fde047" fontSize="9.5" fontWeight="bold">{gItem.en}</text>
                  <text x="10" y="22" fill="#cbd5e1" fontSize="7.5">{gItem.id}</text>
                </g>
              ))}
            </g>
          </g>

          {/* Balon Warna-Warni (Colors in English) */}
          <g transform="translate(320, 75)">
            <rect x="0" y="0" width="230" height="185" rx="14" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="115" y="26" fill="#fde047" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              COLORS &amp; NUMBERS
            </text>
            <g transform="translate(25, 45)">
              {[
                { name: 'RED', color: '#ef4444', icon: '🔴' },
                { name: 'BLUE', color: '#38bdf8', icon: '🔵' },
                { name: 'GREEN', color: '#22c55e', icon: '🟢' },
                { name: 'YELLOW', color: '#facc15', icon: '🟡' }
              ].map((cItem, cIdx) => (
                <g key={cIdx} transform={`translate(${(cIdx % 2) * 95}, ${Math.floor(cIdx / 2) * 55})`}>
                  <rect x="0" y="0" width="85" height="45" rx="8" fill="#0f172a" stroke={cItem.color} strokeWidth="2" />
                  <text x="42" y="20" fontSize="12" textAnchor="middle">{cItem.icon}</text>
                  <text x="42" y="36" fill={cItem.color} fontSize="10" fontWeight="900" textAnchor="middle">{cItem.name}</text>
                </g>
              ))}
            </g>
          </g>

          <text x="300" y="295" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
            Practice every day: One, Two, Three, Four, Five... Learning English is so fun!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 16. SENI BUDAYA, WAYANG & AKSARA JAWA                                 */}
      {/* ==================================================================== */}
      {type === 'art_culture_jawa' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="13" fontWeight="900" textAnchor="middle">
              🎨 SENI BUDAYA NUSANTARA &amp; AKSARA JAWA 🎭
            </text>
          </g>

          {/* Palet Warna Primer & Batik */}
          <g transform="translate(60, 75)">
            <rect x="0" y="0" width="225" height="185" rx="14" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="112" y="26" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">WARNA PRIMER &amp; BATIK</text>
            {/* 3 Lingkaran Warna Primer */}
            <g transform="translate(35, 45)">
              <circle cx="25" cy="25" r="22" fill="#ef4444" stroke="#fff" strokeWidth="2" />
              <circle cx="75" cy="25" r="22" fill="#facc15" stroke="#fff" strokeWidth="2" />
              <circle cx="125" cy="25" r="22" fill="#0284c7" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="112" y="115" fill="#cbd5e1" fontSize="9" textAnchor="middle">Merah + Kuning + Biru</text>
            <rect x="15" y="130" width="195" height="42" rx="6" fill="#0f172a" stroke="#b45309" strokeWidth="1.5" />
            <text x="112" y="148" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">Motif Batik Kawung</text>
            <text x="112" y="162" fill="#cbd5e1" fontSize="8" textAnchor="middle">Warisan Luhur Budaya Indonesia</text>
          </g>

          {/* Wayang Kulit & Aksara Jawa */}
          <g transform="translate(315, 75)">
            <rect x="0" y="0" width="225" height="185" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="112" y="26" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">AKSARA JAWA &amp; WAYANG</text>
            <g transform="translate(15, 45)">
              <rect x="0" y="0" width="195" height="45" rx="8" fill="#1e1b4b" stroke="#fde047" strokeWidth="1.5" />
              <text x="97" y="24" fill="#fde047" fontSize="16" fontWeight="bold" textAnchor="middle">ꦲ ꦤ ꦕ ꦫ ꦏ</text>
              <text x="97" y="38" fill="#cbd5e1" fontSize="9" textAnchor="middle">Ha - Na - Ca - Ra - Ka</text>
            </g>
            <g transform="translate(112, 135)">
              <text x="0" y="0" fontSize="32" textAnchor="middle">🎭</text>
              <text x="0" y="20" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">Tokoh Pandhawa Lima</text>
            </g>
          </g>

          <text x="300" y="295" fill="#94a3b8" fontSize="10.5" textAnchor="middle">
            Melestarikan seni tradisional dan kearifan lokal Nusantara dengan rasa bangga!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 17. INFORMATIKA & KODING SCRATCH DASAR                               */}
      {/* ==================================================================== */}
      {type === 'informatics_scratch' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="22" fill="#7dd3fc" fontSize="13" fontWeight="900" textAnchor="middle">
              💻 KODING SCRATCH &amp; LOGIKA PEMROGRAMAN 🤖
            </text>
          </g>

          {/* Balok-Balok Koding Scratch Berwarna-Warni */}
          <g transform="translate(50, 75)">
            {/* Balok 1: Ketika Bendera Hijau Diklik */}
            <g transform="translate(0, 0)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">🏁</text>
              <text x="45" y="26" fill="#0f172a" fontSize="11" fontWeight="900">Ketika bendera hijau diklik</text>
            </g>

            {/* Balok 2: Gerak 10 Langkah */}
            <g transform="translate(0, 48)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">➡️</text>
              <text x="45" y="26" fill="#fff" fontSize="11" fontWeight="900">Gerak 10 langkah ke depan</text>
            </g>

            {/* Balok 3: Katakan Halo Raden */}
            <g transform="translate(0, 96)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#9333ea" stroke="#7e22ce" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">💬</text>
              <text x="45" y="26" fill="#fff" fontSize="11" fontWeight="900">Katakan "Halo Raden!" 2 detik</text>
            </g>

            {/* Balok 4: Suara Kucing */}
            <g transform="translate(0, 144)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#db2777" stroke="#be185d" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">🔊</text>
              <text x="45" y="26" fill="#fff" fontSize="11" fontWeight="900">Mainkan bunyi meow sampai selesai</text>
            </g>
          </g>

          {/* Robot Maskot Raden & Layar Eksekusi di Kanan */}
          <g transform="translate(345, 75)">
            <rect x="0" y="0" width="205" height="186" rx="14" fill="#0f172a" stroke="#22c55e" strokeWidth="2.5" />
            <text x="102" y="24" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">LAYAR GAME PREVIEW</text>

            <rect x="15" y="38" width="175" height="95" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <g transform="translate(85, 85)" style={{ animation: 'hopRabbit 1s infinite' }}>
              <text x="0" y="0" fontSize="36" textAnchor="middle">🤖</text>
            </g>

            <rect x="15" y="142" width="175" height="32" rx="6" fill="#064e3b" stroke="#22c55e" strokeWidth="1.5" />
            <text x="102" y="162" fill="#86efac" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              ✨ Program Berhasil Dijalankan!
            </text>
          </g>

          <text x="300" y="295" fill="#fde047" fontSize="10.5" textAnchor="middle">
            Menyusun balok algoritma melatih otak kita berpikir runtut, cerdas, dan logis!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 18. PKN: GOTONG ROYONG & BHINNEKA TUNGGAL IKA                        */}
      {/* ==================================================================== */}
      {type === 'civics_gotong_royong' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="34" rx="10" fill="#1e1b4b" stroke="#ef4444" strokeWidth="2" />
            <text x="0" y="22" fill="#fca5a5" fontSize="13" fontWeight="900" textAnchor="middle">
              🇮🇩 GOTONG ROYONG &amp; BHINNEKA TUNGGAL IKA 🤝
            </text>
          </g>

          {/* Bendera Merah Putih & Lingkaran Persahabatan */}
          <g transform="translate(300, 135)">
            <circle cx="0" cy="0" r="85" fill="#1e1b4b" stroke="#ef4444" strokeWidth="3" style={{ animation: 'solarPulse 3s infinite' }} />

            {/* Bendera Merah Putih */}
            <rect x="-35" y="-55" width="70" height="24" fill="#dc2626" />
            <rect x="-35" y="-31" width="70" height="24" fill="#f8fafc" />
            <rect x="-35" y="-55" width="70" height="48" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <line x1="-35" y1="-60" x2="-35" y2="25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* Anak-Anak Bergandengan Tangan */}
            <g transform="translate(0, 35)">
              <text x="-45" y="0" fontSize="24" textAnchor="middle">👦</text>
              <text x="-15" y="0" fontSize="24" textAnchor="middle">👧</text>
              <text x="15" y="0" fontSize="24" textAnchor="middle">🧒</text>
              <text x="45" y="0" fontSize="24" textAnchor="middle">👧</text>
            </g>
          </g>

          {/* 3 Nilai Luhur di Bawah */}
          <g transform="translate(60, 235)">
            <rect x="0" y="0" width="150" height="52" rx="8" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="75" y="22" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">1. Rukun &amp; Toleransi</text>
            <text x="75" y="38" fill="#cbd5e1" fontSize="8.5" textAnchor="middle">Menghargai perbedaan</text>

            <rect x="165" y="0" width="150" height="52" rx="8" fill="#1e1b4b" stroke="#22c55e" strokeWidth="1.5" />
            <text x="240" y="22" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">2. Gotong Royong</text>
            <text x="240" y="38" fill="#cbd5e1" fontSize="8.5" textAnchor="middle">Bahu membahu bersama</text>

            <rect x="330" y="0" width="150" height="52" rx="8" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="405" y="22" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">3. Hak &amp; Kewajiban</text>
            <text x="405" y="38" fill="#cbd5e1" fontSize="8.5" textAnchor="middle">Tertib &amp; bertanggung jawab</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 19. FOTOSINTESIS (EXISTING)                                          */}
      {/* ==================================================================== */}
      {type === 'photosynthesis' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <defs>
            <radialGradient id="sunRad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="leafGradReal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="45%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
            <linearGradient id="stemGradReal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#0d381c" />
            </linearGradient>
            <filter id="fotonGlowEffect">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tanah Nutrisi */}
          <rect x="0" y="270" width="600" height="50" fill="#1c1208" />
          <path d="M 0 270 Q 150 264, 300 270 T 600 270" stroke="#78350f" strokeWidth="4" fill="none" />

          {/* ☀️ MATAHARI DENGAN CORONA BERPUTAR & INTI PULSING */}
          <g transform="translate(85, 75)">
            <g style={{ animation: 'spin360 20s linear infinite', transformOrigin: '0px 0px' }}>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
                <line
                  key={d}
                  x1="0"
                  y1="0"
                  x2={Math.cos((d * Math.PI) / 180) * 58}
                  y2={Math.sin((d * Math.PI) / 180) * 58}
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              ))}
            </g>
            <circle cx="0" cy="0" r="42" fill="url(#sunRad)" style={{ animation: 'solarPulse 2.5s ease-in-out infinite' }} />
            <circle cx="0" cy="0" r="25" fill="#fef08a" />
            <text x="0" y="5" fill="#78350f" fontSize="11" fontWeight="bold" textAnchor="middle">Matahari</text>
          </g>

          {/* ⚡ BERKAS FOTON CAHAYA MENGALIR KE DAUN */}
          <g filter="url(#fotonGlowEffect)">
            <line
              x1="125"
              y1="100"
              x2="250"
              y2="175"
              stroke="#fef08a"
              strokeWidth="4"
              strokeDasharray="14,14"
              strokeLinecap="round"
              style={{ animation: 'dashStreamFast 0.7s linear infinite' }}
            />
            <line
              x1="110"
              y1="120"
              x2="225"
              y2="195"
              stroke="#facc15"
              strokeWidth="3"
              strokeDasharray="10,12"
              strokeLinecap="round"
              style={{ animation: 'dashStreamFast 0.9s linear infinite' }}
            />
            <text x="145" y="145" fill="#fde047" fontSize="11" fontWeight="extrabold">☀️ Energi Foton</text>
          </g>

          {/* 🌿 BATANG TUMBUHAN & PEMBULUH XILEM DENGAN AIR H2O NAIK */}
          <path d="M 300 270 Q 295 210, 300 150" stroke="url(#stemGradReal)" strokeWidth="15" fill="none" strokeLinecap="round" />
          <path
            d="M 300 270 Q 295 210, 300 150"
            stroke="#38bdf8"
            strokeWidth="5"
            fill="none"
            strokeDasharray="8,10"
            strokeLinecap="round"
            style={{ animation: 'dashStream 1.1s linear infinite reverse' }}
          />

          {/* Akar */}
          <path d="M 300 270 Q 280 290, 255 310 M 300 270 Q 315 295, 335 315 M 300 280 L 305 315" stroke="#a16207" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Molekul Air H2O Melayang Naik dari Tanah */}
          <g transform="translate(225, 290)">
            <circle cx="0" cy="0" r="5" fill="#38bdf8" style={{ animation: 'vaporFloatUp 1.8s ease-in-out infinite' }} />
            <circle cx="20" cy="12" r="4.5" fill="#7dd3fc" style={{ animation: 'vaporFloatUp 2.2s ease-in-out infinite 0.5s' }} />
            <text x="35" y="5" fill="#38bdf8" fontSize="11" fontWeight="bold">💧 H₂O (Air Tanah)</text>
          </g>

          {/* 🍃 DUA DAUN HIJAU (KLOROPLAS REAKSI FOTOSINTESIS) */}
          <g>
            <path d="M 300 180 Q 195 115, 215 195 Q 245 230, 300 195 Z" fill="url(#leafGradReal)" stroke="#166534" strokeWidth="3.5" />
            <path d="M 300 185 Q 240 170, 220 190" stroke="#86efac" strokeWidth="2" fill="none" />
            <path d="M 300 170 Q 405 105, 385 185 Q 355 220, 300 185 Z" fill="url(#leafGradReal)" stroke="#166534" strokeWidth="3.5" />
            <path d="M 300 175 Q 360 160, 380 180" stroke="#86efac" strokeWidth="2" fill="none" />

            <circle cx="255" cy="175" r="7" fill="#86efac" style={{ animation: 'solarPulse 2s infinite' }} />
            <circle cx="345" cy="165" r="7" fill="#86efac" style={{ animation: 'solarPulse 2s infinite 0.5s' }} />
          </g>

          {/* 💨 MASUK: MOLEKUL KARBON DIOKSIDA (CO2) TERBANG KE DAUN */}
          <g transform="translate(135, 185)">
            <g style={{ animation: 'gasFloatIn 2s ease-in-out infinite' }}>
              <rect x="0" y="-14" width="70" height="28" rx="14" fill="#881337" stroke="#fb7185" strokeWidth="2" />
              <text x="35" y="4" fill="#ffe4e6" fontSize="11" fontWeight="bold" textAnchor="middle">CO₂ Masuk</text>
            </g>
          </g>

          {/* 🫧 KELUAR: GELEMBUNG OKSIGEN (O2) MELAYANG KE ANGKASA */}
          <g transform="translate(390, 140)">
            <g style={{ animation: 'vaporFloatUp 1.8s ease-out infinite' }}>
              <circle cx="20" cy="0" r="15" fill="#0369a1" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="20" y="4" fill="#e0f2fe" fontSize="12" fontWeight="extrabold" textAnchor="middle">O₂</text>
            </g>
            <g style={{ animation: 'vaporFloatUp 2.3s ease-out infinite 0.7s' }}>
              <circle cx="50" cy="-15" r="11" fill="#0284c7" stroke="#7dd3fc" strokeWidth="2" />
              <text x="50" y="-11" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">O₂</text>
            </g>
            <text x="55" y="25" fill="#7dd3fc" fontSize="11" fontWeight="extrabold">🫧 Oksigen Segar</text>
          </g>

          {/* 🌟 KELUAR: GLUKOSA ENERGI (C6H12O6) */}
          <g transform="translate(420, 220)">
            <rect x="0" y="0" width="165" height="44" rx="12" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2.5" style={{ animation: 'solarPulse 3s infinite' }} />
            <text x="82" y="19" fill="#e9d5ff" fontSize="12" fontWeight="bold" textAnchor="middle">✨ Glukosa (Energi)</text>
            <text x="82" y="34" fill="#c084fc" fontSize="9.5" textAnchor="middle">C₆H₁₂O₆ Cadangan Makanan</text>
          </g>

          {/* RUMUS REAKSI KIMIA BERSINAR */}
          <g transform="translate(60, 15)">
            <rect x="0" y="0" width="480" height="36" rx="12" fill="#022c22" stroke="#22c55e" strokeWidth="2.5" />
            <text x="240" y="23" fill="#4ade80" fontSize="14" fontWeight="extrabold" textAnchor="middle" letterSpacing="0.5">
              6CO₂ + 6H₂O + Cahaya Matahari ➔ C₆H₁₂O₆ + 6O₂
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 20. SIKLUS AIR (EXISTING)                                            */}
      {/* ==================================================================== */}
      {type === 'water_cycle' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <defs>
            <linearGradient id="oceanGradReal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
            <linearGradient id="mountGradReal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* ☀️ MATAHARI */}
          <g transform="translate(80, 55)">
            <circle cx="0" cy="0" r="34" fill="#f59e0b" style={{ animation: 'solarPulse 2.5s infinite' }} />
            <circle cx="0" cy="0" r="22" fill="#fef08a" />
            <text x="0" y="52" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">Matahari (Kalor)</text>
          </g>

          {/* 🏔️ GUNUNG DI KANAN */}
          <polygon points="320,260 450,90 540,260" fill="url(#mountGradReal)" />
          <polygon points="450,90 415,135 485,135" fill="#f8fafc" />
          <polygon points="460,260 545,130 600,260" fill="#334155" />

          {/* 🌊 SAMUDRA RAYA */}
          <g>
            <rect x="0" y="240" width="350" height="80" fill="url(#oceanGradReal)" />
            <g style={{ animation: 'oceanWaveSway 3s ease-in-out infinite' }}>
              <path d="M -50 240 Q 30 232, 110 240 T 270 240 T 400 240" stroke="#38bdf8" strokeWidth="3.5" fill="none" />
              <path d="M -30 250 Q 50 244, 130 250 T 290 250 T 400 250" stroke="#7dd3fc" strokeWidth="2" opacity="0.75" fill="none" />
            </g>
            <text x="90" y="285" fill="#e0f2fe" fontSize="14" fontWeight="bold">Samudra Raya</text>
          </g>

          {/* ⬆️ 1. EVAPORASI */}
          <g transform="translate(130, 225)">
            <path d="M 0 0 Q -10 -40, 5 -80 T -5 -120" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="6,8" fill="none" style={{ animation: 'dashStream 1.2s linear infinite reverse' }} />
            <path d="M 40 0 Q 30 -35, 45 -75 T 35 -115" stroke="#7dd3fc" strokeWidth="3" strokeDasharray="6,8" fill="none" style={{ animation: 'dashStream 1.4s linear infinite reverse' }} />
            <g style={{ animation: 'vaporFloatUp 2s infinite' }}>
              <circle cx="20" cy="-30" r="5" fill="#38bdf8" />
              <circle cx="10" cy="-70" r="6" fill="#7dd3fc" />
            </g>
            <text x="20" y="-60" fill="#7dd3fc" fontSize="12" fontWeight="extrabold" textAnchor="middle">1. Evaporasi ⬆️</text>
          </g>

          {/* ☁️ 2. AWAN KONDENSASI */}
          <g transform="translate(250, 40)" style={{ animation: 'oceanWaveSway 6s ease-in-out infinite' }}>
            <ellipse cx="60" cy="40" rx="58" ry="30" fill="#f1f5f9" />
            <ellipse cx="105" cy="35" rx="42" ry="26" fill="#e2e8f0" />
            <ellipse cx="25" cy="45" rx="36" ry="22" fill="#cbd5e1" />
            <text x="65" y="20" fill="#0284c7" fontSize="12" fontWeight="extrabold" textAnchor="middle">2. Kondensasi (Awan) ☁️</text>
          </g>

          {/* 🌧️ 3. HUJAN PRESIPITASI */}
          <g transform="translate(380, 105)">
            {[0, 25, 50, 75].map((off, i) => (
              <g key={off} style={{ animation: `rainFallStream 0.65s linear infinite ${i * 0.16}s` }}>
                <line x1={off} y1="0" x2={off - 8} y2="26" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            ))}
            <text x="35" y="-15" fill="#38bdf8" fontSize="12" fontWeight="extrabold">3. Presipitasi (Hujan) 🌧️</text>
          </g>

          {/* 🌊 4. LIMPASAN SUNGAI */}
          <g>
            <path d="M 440 220 Q 370 240, 320 248" stroke="#0ea5e9" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M 440 220 Q 370 240, 320 248" stroke="#bae6fd" strokeWidth="3.5" strokeDasharray="8,8" fill="none" style={{ animation: 'dashStream 0.8s linear infinite' }} />
            <text x="410" y="275" fill="#38bdf8" fontSize="12" fontWeight="extrabold">4. Limpasan Sungai 🌊</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 21. TATA SURYA (EXISTING)                                            */}
      {/* ==================================================================== */}
      {type === 'solar_system' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <defs>
            <radialGradient id="sunOrbitRad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </radialGradient>
          </defs>

          {[
            { cx: 40, cy: 30, r: 1.5 }, { cx: 120, cy: 270, r: 2 }, { cx: 280, cy: 30, r: 1 },
            { cx: 480, cy: 45, r: 2 }, { cx: 550, cy: 260, r: 1.5 }, { cx: 520, cy: 110, r: 1 },
            { cx: 70, cy: 190, r: 1 }, { cx: 350, cy: 295, r: 2 },
          ].map((st, sIdx) => (
            <circle key={sIdx} cx={st.cx} cy={st.cy} r={st.r} fill="#fff" style={{ animation: `solarPulse 2s infinite ${sIdx * 0.3}s` }} />
          ))}

          <g transform="translate(300, 160)">
            <circle cx="0" cy="0" r="48" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="3,3" />
            <circle cx="0" cy="0" r="76" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="3,3" />
            <circle cx="0" cy="0" r="110" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
            <circle cx="0" cy="0" r="148" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
            <circle cx="0" cy="0" r="195" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="5,5" />
            <circle cx="0" cy="0" r="245" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="6,6" />

            <circle cx="0" cy="0" r="28" fill="url(#sunOrbitRad)" style={{ animation: 'solarPulse 3s infinite' }} />
            <text x="0" y="4" fill="#78350f" fontSize="10" fontWeight="extrabold" textAnchor="middle">Matahari</text>

            {/* 1. MERKURIUS */}
            <g style={{ animation: 'spin360 3s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="48" cy="0" r="5" fill="#94a3b8" />
            </g>

            {/* 2. VENUS */}
            <g style={{ animation: 'spin360 5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="76" cy="0" r="8" fill="#fcd34d" />
            </g>

            {/* 3. BUMI & BULAN */}
            <g style={{ animation: 'spin360 7.5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="110" cy="0" r="10" fill="#38bdf8" />
              <circle cx="112" cy="-3" r="5" fill="#16a34a" />
              <g transform="translate(110, 0)">
                <g style={{ animation: 'spin360 1.8s linear infinite', transformOrigin: '0px 0px' }}>
                  <circle cx="16" cy="0" r="3" fill="#f1f5f9" />
                </g>
              </g>
            </g>

            {/* 4. MARS */}
            <g style={{ animation: 'spin360 10.5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="148" cy="0" r="7" fill="#ef4444" />
            </g>

            {/* 5. JUPITER */}
            <g style={{ animation: 'spin360 15s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="195" cy="0" r="17" fill="#d97706" />
              <circle cx="202" cy="5" r="4" fill="#9a3412" />
            </g>

            {/* 6. SATURNUS */}
            <g style={{ animation: 'spin360 20s linear infinite', transformOrigin: '0px 0px' }}>
              <g transform="translate(245, 0) rotate(-20)">
                <ellipse cx="0" cy="0" rx="26" ry="7" stroke="#fde047" strokeWidth="3" fill="none" opacity="0.85" />
                <circle cx="0" cy="0" r="13" fill="#eab308" />
              </g>
            </g>
          </g>

          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="230" height="45" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" opacity="0.85" />
            <text x="12" y="20" fill="#38bdf8" fontSize="12" fontWeight="bold">🪐 Revolusi Planet 60 FPS</text>
            <text x="12" y="34" fill="#94a3b8" fontSize="9">Planet berotasi mengitari pusat gravitasi surya</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 22. PECAHAN PIZZA MATEMATIKA (EXISTING)                             */}
      {/* ==================================================================== */}
      {type === 'math_arithmetic' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <defs>
            <radialGradient id="woodenBoard" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="85%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
            <radialGradient id="pizzaCrust" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="90%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
            <radialGradient id="pepperoniGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <filter id="goldenSliceGlow">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />
          <circle cx="215" cy="155" r="105" fill="url(#woodenBoard)" stroke="#5c2606" strokeWidth="6" />
          <rect x="90" y="146" width="30" height="18" rx="4" fill="#78350f" />

          {/* STEP 0: 1 UTUH */}
          {step === 0 && (
            <g transform="translate(215, 155)">
              <circle cx="0" cy="0" r="90" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="4" />
              <circle cx="0" cy="0" r="78" fill="#fde047" stroke="#ea580c" strokeWidth="1.5" />
              {[
                { x: -35, y: -25 }, { x: 25, y: -35 }, { x: 38, y: 22 },
                { x: -25, y: 35 }, { x: 0, y: 0 }, { x: -45, y: 8 }, { x: 30, y: -2 }
              ].map((pos, idx) => (
                <circle key={idx} cx={pos.x} cy={pos.y} r="11" fill="url(#pepperoniGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
              ))}
              <g transform="translate(0, 0)">
                <rect x="-48" y="-16" width="96" height="32" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" filter="url(#goldenSliceGlow)" />
                <text x="0" y="6" fill="#fef08a" fontSize="15" fontWeight="900" textAnchor="middle">1 UTUH</text>
              </g>
            </g>
          )}

          {/* STEP 1: 1/4 BAGIAN */}
          {step === 1 && (
            <g transform="translate(215, 155)">
              <path d="M 0 0 L -90 0 A 90 90 0 0 1 0 -90 Z" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="2" />
              <path d="M 0 0 L 0 90 A 90 90 0 0 1 -90 0 Z" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="2" />
              <path d="M 0 0 L 90 0 A 90 90 0 0 1 0 90 Z" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="2" />
              <g style={{ animation: 'sliceHoverAnim 1.8s ease-in-out infinite' }}>
                <path d="M 0 0 L 0 -90 A 90 90 0 0 1 90 0 Z" fill="#fde047" stroke="#ea580c" strokeWidth="3" filter="url(#goldenSliceGlow)" />
                <circle cx="32" cy="-32" r="10" fill="url(#pepperoniGrad)" />
                <g transform="translate(50, -50)">
                  <rect x="-26" y="-14" width="52" height="28" rx="6" fill="#0f172a" stroke="#fde047" strokeWidth="2" />
                  <text x="0" y="5" fill="#4ade80" fontSize="13" fontWeight="900" textAnchor="middle">1 / 4</text>
                </g>
              </g>
            </g>
          )}

          {/* STEP 2: 2/4 = 1/2 */}
          {step === 2 && (
            <g transform="translate(215, 155)">
              <path d="M 0 0 L 0 -90 A 90 90 0 0 0 0 90 Z" fill="#78350f" opacity="0.6" stroke="#451a03" strokeWidth="2" />
              <g filter="url(#goldenSliceGlow)">
                <path d="M 0 0 L 0 -90 A 90 90 0 0 1 0 90 Z" fill="url(#pizzaCrust)" stroke="#f59e0b" strokeWidth="3.5" />
                <line x1="0" y1="0" x2="90" y2="0" stroke="#ea580c" strokeWidth="2" strokeDasharray="4,3" />
                <circle cx="32" cy="-32" r="10" fill="url(#pepperoniGrad)" />
                <circle cx="32" cy="32" r="10" fill="url(#pepperoniGrad)" />
                <g transform="translate(70, 0)">
                  <rect x="-30" y="-16" width="60" height="32" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                  <text x="0" y="5" fill="#4ade80" fontSize="13" fontWeight="900" textAnchor="middle">= 1 / 2</text>
                </g>
              </g>
            </g>
          )}

          {/* STEP 3: BERBAGI 4 TEMAN */}
          {step === 3 && (
            <g transform="translate(215, 155)">
              {[
                { x: -55, y: -55, name: '👦 Budi (1/4)', color: '#0284c7' },
                { x: 55, y: -55, name: '👧 Siti (1/4)', color: '#db2777' },
                { x: -55, y: 55, name: '🧒 Edo (1/4)', color: '#16a34a' },
                { x: 55, y: 55, name: '👧 Lani (1/4)', color: '#ea580c' },
              ].map((fr, fIdx) => (
                <g key={fIdx} transform={`translate(${fr.x}, ${fr.y})`}>
                  <circle cx="0" cy="0" r="32" fill={fr.color} stroke="#fff" strokeWidth="2" />
                  <text x="0" y="4" fontSize="16" textAnchor="middle">🍕</text>
                  <text x="0" y="24" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">{fr.name}</text>
                </g>
              ))}
            </g>
          )}

          {/* Sisi Kanan: Papan Rumus Pecahan */}
          <g transform="translate(360, 36)">
            <rect x="0" y="0" width="225" height="242" rx="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="0" y="0" width="225" height="34" rx="14" fill="#1e293b" />
            <text x="112" y="22" fill="#fbbf24" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              📚 RUMUS PECAHAN SERU
            </text>
            <g transform="translate(20, 48)">
              <rect x="0" y="0" width="185" height="42" rx="8" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="26" y="27" fill="#38bdf8" fontSize="22" fontWeight="900" textAnchor="middle">
                {step === 0 ? '1' : step === 1 ? '1' : step === 2 ? '2' : '4'}
              </text>
              <text x="52" y="18" fill="#e0f2fe" fontSize="10.5" fontWeight="bold">PEMBILANG (Atas)</text>
              <text x="52" y="32" fill="#94a3b8" fontSize="8.5">Jumlah potong yang diambil</text>
              <line x1="8" y1="48" x2="177" y2="48" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="0" y="54" width="185" height="42" rx="8" fill="#1e1b4b" stroke="#ec4899" strokeWidth="1.5" />
              <text x="26" y="81" fill="#ec4899" fontSize="22" fontWeight="900" textAnchor="middle">
                {step === 0 ? '1' : '4'}
              </text>
              <text x="52" y="72" fill="#fdf2f8" fontSize="10.5" fontWeight="bold">PENYEBUT (Bawah)</text>
              <text x="52" y="86" fill="#94a3b8" fontSize="8.5">Total semua potongan pizza</text>
            </g>
          </g>

          <text x="300" y="306" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
            🍕 Video Animasi Edukasi Pecahan Nyata • Perpustakaan RadenWorld
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 23. GARUDA PANCASILA & 5 PERISAI SILA (EXISTING)                    */}
      {/* ==================================================================== */}
      {type === 'pancasila_shield' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />
          <g transform="translate(180, 150)">
            <path d="M 0 -80 C -60 -100, -140 -50, -150 20 C -120 40, -80 30, -50 0 Z" fill="#f59e0b" opacity="0.6" />
            <path d="M 0 -80 C 60 -100, 140 -50, 150 20 C 120 40, 80 30, 50 0 Z" fill="#f59e0b" opacity="0.6" />
            <path d="M 0 -70 L 65 -50 L 65 30 Q 0 95, 0 95 Q -65 30, -65 30 L -65 -50 Z" fill="#1e1b4b" stroke="#e2e8f0" strokeWidth="4" />
            <circle cx="0" cy="0" r="24" fill={step === 0 ? '#fde047' : '#1e293b'} stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="6" fontSize="16" textAnchor="middle">⭐</text>
            <circle cx="34" cy="34" r="16" fill={step === 1 ? '#fde047' : '#1e293b'} stroke="#ea580c" strokeWidth="2" />
            <text x="34" y="40" fontSize="12" textAnchor="middle">⛓️</text>
            <circle cx="34" cy="-30" r="16" fill={step === 2 ? '#86efac' : '#1e293b'} stroke="#16a34a" strokeWidth="2" />
            <text x="34" y="-24" fontSize="12" textAnchor="middle">🌳</text>
            <circle cx="-34" cy="-30" r="16" fill={step === 3 ? '#fca5a5' : '#1e293b'} stroke="#dc2626" strokeWidth="2" />
            <text x="-34" y="-24" fontSize="12" textAnchor="middle">🐂</text>
            <circle cx="-34" cy="34" r="16" fill={step === 4 ? '#fef08a' : '#1e293b'} stroke="#eab308" strokeWidth="2" />
            <text x="-34" y="40" fontSize="12" textAnchor="middle">🌾</text>
          </g>

          <g transform="translate(360, 40)">
            <rect x="0" y="0" width="225" height="235" rx="14" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="0" y="0" width="225" height="34" rx="14" fill="#0f172a" />
            <text x="112" y="22" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
              🇮🇩 5 SILA GARUDA PANCASILA
            </text>
            <g transform="translate(15, 50)" className="space-y-1">
              {[
                { no: '1', name: 'Bintang Emas', text: 'Ketuhanan Yang Maha Esa (Ibadah & Doa)' },
                { no: '2', name: 'Rantai Baja', text: 'Kemanusiaan yang Adil & Beradab' },
                { no: '3', name: 'Pohon Beringin', text: 'Persatuan Indonesia (Rukun Bersama)' },
                { no: '4', name: 'Kepala Banteng', text: 'Musyawarah & Mufakat (Bicara Baik)' },
                { no: '5', name: 'Padi & Kapas', text: 'Keadilan Sosial (Berbagi Adil & Hemat)' },
              ].map((s, idx) => (
                <g key={s.no} transform={`translate(0, ${idx * 34})`}>
                  <rect x="0" y="0" width="195" height="30" rx="6" fill={step === idx ? '#312e81' : '#0f172a'} stroke={step === idx ? '#fbbf24' : '#334155'} strokeWidth="1.5" />
                  <text x="10" y="16" fill={step === idx ? '#fde047' : '#94a3b8'} fontSize="9.5" fontWeight="bold">Sila {s.no}: {s.name}</text>
                  <text x="10" y="26" fill={step === idx ? '#e0f2fe' : '#64748b'} fontSize="7.5">{s.text}</text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 24. BAHASA INDONESIA: KERETA KALIMAT SPOK (EXISTING)                 */}
      {/* ==================================================================== */}
      {type === 'spok_sentence' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />
          <line x1="20" y1="230" x2="580" y2="230" stroke="#475569" strokeWidth="6" />
          <line x1="20" y1="242" x2="580" y2="242" stroke="#475569" strokeWidth="6" />
          {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540].map((rx) => (
            <line key={rx} x1={rx} y1="224" x2={rx} y2="248" stroke="#94a3b8" strokeWidth="4" />
          ))}

          <text x="300" y="45" fill="#fef08a" fontSize="16" fontWeight="bold" textAnchor="middle">
            🚂 KERETA STRUKTUR KALIMAT PINTAR (S - P - O - K)
          </text>

          {/* Gerbong 1: SUBJEK */}
          <g transform="translate(45, 95)">
            <rect x="0" y="20" width="115" height="75" rx="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
            <rect x="75" y="0" width="35" height="30" rx="6" fill="#0369a1" />
            <text x="57" y="42" fill="#e0f2fe" fontSize="12" fontWeight="900" textAnchor="middle">SUBJEK (S)</text>
            <text x="57" y="58" fill="#bae6fd" fontSize="9.5" textAnchor="middle">Pelaku Kalimat</text>
            <rect x="12" y="66" width="91" height="20" rx="4" fill="#0c4a6e" />
            <text x="57" y="80" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">🐱 Kucing Lucu</text>
            <circle cx="28" cy="100" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="85" cy="100" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          </g>

          <line x1="160" y1="165" x2="180" y2="165" stroke="#f59e0b" strokeWidth="6" />

          {/* Gerbong 2: PREDIKAT */}
          <g transform="translate(180, 105)">
            <rect x="0" y="10" width="115" height="75" rx="10" fill="#16a34a" stroke="#4ade80" strokeWidth="2.5" />
            <text x="57" y="32" fill="#f0fdf4" fontSize="12" fontWeight="900" textAnchor="middle">PREDIKAT (P)</text>
            <text x="57" y="48" fill="#bbf7d0" fontSize="9.5" textAnchor="middle">Kata Kerja/Aksi</text>
            <rect x="12" y="56" width="91" height="20" rx="4" fill="#14532d" />
            <text x="57" y="70" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">🐟 Makan</text>
            <circle cx="28" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="85" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          </g>

          <line x1="295" y1="165" x2="315" y2="165" stroke="#f59e0b" strokeWidth="6" />

          {/* Gerbong 3: OBJEK */}
          <g transform="translate(315, 105)">
            <rect x="0" y="10" width="115" height="75" rx="10" fill="#ea580c" stroke="#fb923c" strokeWidth="2.5" />
            <text x="57" y="32" fill="#fff7ed" fontSize="12" fontWeight="900" textAnchor="middle">OBJEK (O)</text>
            <text x="57" y="48" fill="#fed7aa" fontSize="9.5" textAnchor="middle">Benda Korban</text>
            <rect x="12" y="56" width="91" height="20" rx="4" fill="#7c2d12" />
            <text x="57" y="70" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">🍽️ Ikan Goreng</text>
            <circle cx="28" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="85" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          </g>

          <line x1="430" y1="165" x2="450" y2="165" stroke="#f59e0b" strokeWidth="6" />

          {/* Gerbong 4: KETERANGAN */}
          <g transform="translate(450, 105)">
            <rect x="0" y="10" width="115" height="75" rx="10" fill="#9333ea" stroke="#c084fc" strokeWidth="2.5" />
            <text x="57" y="32" fill="#faf5ff" fontSize="12" fontWeight="900" textAnchor="middle">KETERANGAN (K)</text>
            <text x="57" y="48" fill="#e9d5ff" fontSize="9.5" textAnchor="middle">Tempat / Waktu</text>
            <rect x="12" y="56" width="91" height="20" rx="4" fill="#581c87" />
            <text x="57" y="70" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">🏡 Di Dapur Pagi</text>
            <circle cx="28" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="85" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          </g>

          <g transform="translate(150, 260)">
            <rect x="0" y="0" width="300" height="36" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="150" y="23" fill="#fef08a" fontSize="12" fontWeight="bold" textAnchor="middle">
              ✨ "Kucing lucu makan ikan goreng di dapur."
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 25. DNA DOUBLE HELIX (EXISTING)                                      */}
      {/* ==================================================================== */}
      {type === 'dna_helix' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <text x="300" y="40" fill="#38bdf8" fontSize="16" fontWeight="extrabold" textAnchor="middle">
            STRUKTUR HELIKS GANDA DNA (DOUBLE HELIX)
          </text>
          <g transform="translate(50, 160)">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((idx) => {
              const xPos = idx * 32;
              const delay = idx * 0.18;
              const isAT = idx % 2 === 0;
              return (
                <g key={idx} transform={`translate(${xPos}, 0)`}>
                  <g style={{ animation: `dnaTwist3D 2.8s ease-in-out infinite ${delay}s`, transformOrigin: '0px 0px' }}>
                    <line x1="0" y1="0" x2="0" y2="-65" stroke={isAT ? '#38bdf8' : '#22c55e'} strokeWidth="5.5" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="0" y2="65" stroke={isAT ? '#facc15' : '#ef4444'} strokeWidth="5.5" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="4" fill="#fff" />
                    <circle cx="0" cy="-65" r="7.5" fill="#60a5fa" />
                    <circle cx="0" cy="65" r="7.5" fill="#f87171" />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 26. ATOM BOHR (EXISTING)                                             */}
      {/* ==================================================================== */}
      {type === 'bohr_atom' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <g transform="translate(300, 160)">
            <circle cx="0" cy="0" r="55" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeDasharray="4,4" opacity="0.6" />
            <g style={{ animation: 'spin360 1.8s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="55" cy="0" r="6" fill="#38bdf8" />
              <circle cx="-55" cy="0" r="6" fill="#38bdf8" />
            </g>
            <g transform="rotate(35)">
              <ellipse cx="0" cy="0" rx="95" ry="95" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeDasharray="5,5" opacity="0.6" />
              <g style={{ animation: 'spin360Rev 3.5s linear infinite', transformOrigin: '0px 0px' }}>
                <circle cx="95" cy="0" r="6" fill="#c084fc" />
                <circle cx="-95" cy="0" r="6" fill="#c084fc" />
              </g>
            </g>
            <g style={{ animation: 'solarPulse 1.2s ease-in-out infinite' }}>
              <circle cx="0" cy="0" r="28" fill="#991b1b" stroke="#f87171" strokeWidth="2.5" />
              <text x="0" y="4" fill="#fff" fontSize="10" fontWeight="extrabold" textAnchor="middle">p⁺ n⁰</text>
            </g>
          </g>
          <text x="300" y="25" fill="#7dd3fc" fontSize="14" fontWeight="extrabold" textAnchor="middle">
            Model Atom Bohr: Revolusi Elektron 60 FPS
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 27. PYTHAGORAS (EXISTING)                                            */}
      {/* ==================================================================== */}
      {type === 'pythagoras' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <g transform="translate(230, 180)">
            <rect x="0" y="0" width="110" height="85" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="-85" y="-95" width="85" height="95" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2.5" />
            <polygon points="0,0 110,0 0,-95" fill="#10b981" fillOpacity="0.5" stroke="#10b981" strokeWidth="3" />
            <line x1="0" y1="-95" x2="110" y2="0" stroke="#ec4899" strokeWidth="4" />
          </g>
          <g transform="translate(420, 60)">
            <rect x="0" y="0" width="165" height="195" rx="14" fill="#0f172a" stroke="#ec4899" strokeWidth="2.5" />
            <text x="82" y="32" fill="#f472b6" fontSize="15" fontWeight="bold" textAnchor="middle">Dalil Pythagoras</text>
            <text x="82" y="65" fill="#fde047" fontSize="16" fontWeight="extrabold" textAnchor="middle">a² + b² = c²</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 28. JANTUNG & PEREDARAN DARAH (EXISTING)                             */}
      {/* ==================================================================== */}
      {type === 'blood_circulation' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <g transform="translate(300, 160)">
            <g style={{ animation: 'heartLubDub 1.1s ease-in-out infinite', transformOrigin: '0px 0px' }}>
              <path
                d="M 0 -25 C -25 -60 -70 -30 -70 15 C -70 55 0 95 0 105 C 0 95 70 55 70 15 C 70 -30 25 -60 0 -25 Z"
                fill="#dc2626"
                stroke="#fca5a5"
                strokeWidth="4"
              />
              <text x="0" y="25" fill="#fff" fontSize="13" fontWeight="extrabold" textAnchor="middle">JANTUNG</text>
            </g>
          </g>
          <path d="M 330 140 C 440 80, 520 120, 520 200 C 520 270, 380 280, 320 230" stroke="#ef4444" strokeWidth="9" fill="none" />
          <path d="M 270 230 C 200 280, 80 270, 80 180 C 80 100, 180 80, 270 140" stroke="#0284c7" strokeWidth="9" fill="none" />
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 29. DEFAULT / PAPAN TULIS KELAS DINAMIS (MENAMPILKAN TOPIK AKTIF)     */}
      {/* ==================================================================== */}
      {(type === 'classroom_chalkboard' ||
        type === 'mindmap_general' ||
        (type !== 'math_counting' &&
          type !== 'math_addition_subtraction' &&
          type !== 'math_geometry_shapes' &&
          type !== 'math_clock_time' &&
          type !== 'math_multiplication_division' &&
          type !== 'math_data_charts' &&
          type !== 'science_plants_growth' &&
          type !== 'science_animals_habitat' &&
          type !== 'science_metamorphosis' &&
          type !== 'science_food_chain' &&
          type !== 'science_matter_states' &&
          type !== 'science_human_body' &&
          type !== 'language_alphabet_vocab' &&
          type !== 'language_story_fabel' &&
          type !== 'english_kids' &&
          type !== 'art_culture_jawa' &&
          type !== 'informatics_scratch' &&
          type !== 'civics_gotong_royong' &&
          type !== 'photosynthesis' &&
          type !== 'water_cycle' &&
          type !== 'solar_system' &&
          type !== 'math_arithmetic' &&
          type !== 'pancasila_shield' &&
          type !== 'spok_sentence' &&
          type !== 'dna_helix' &&
          type !== 'bohr_atom' &&
          type !== 'pythagoras' &&
          type !== 'blood_circulation' &&
          type !== 'newton_dynamics')) && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="10" y="10" width="580" height="300" rx="16" fill="#132e38" stroke="#b45309" strokeWidth="8" />
          <rect x="18" y="18" width="564" height="284" rx="10" fill="#0f262e" stroke="#1e3a47" strokeWidth="2" />
          <line x1="28" y1="72" x2="572" y2="72" stroke="#1e404f" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Header Dinamis Berdasarkan Topik */}
          <g transform="translate(300, 44)">
            <text x="0" y="0" fill="#fef08a" fontSize="13" fontWeight="900" textAnchor="middle">
              🌟 {topic?.title ? topic.title.toUpperCase() : 'LEMBAR BELAJAR CERIA RADENWORLD'} 🌟
            </text>
            <text x="0" y="18" fill="#a5f3fc" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              {topic?.badge ? `Topik: ${topic.badge} • Kelas: ${topic.gradeName || 'Sekolah Dasar'}` : 'Belajar Mudah, Menyenangkan & Penuh Petualangan'}
            </text>
          </g>

          {/* 4 Kartu Edukasi Bergambar Berwarna-Warni */}
          {/* Kartu 1: Cerita Pengenalan */}
          <g transform="translate(36, 88)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#164e63" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#0284c7" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">📖</text>
            <text x="52" y="24" fill="#38bdf8" fontSize="11" fontWeight="bold">1. Apa Itu?</text>
            <text x="52" y="38" fill="#e0f2fe" fontSize="9.5" fontWeight="bold">Pengenalan Dasar yang Mudah</text>
            <text x="14" y="62" fill="#bae6fd" fontSize="8.5">
              {topic?.summary ? (topic.summary.length > 50 ? topic.summary.slice(0, 48) + '...' : topic.summary) : 'Memahami konsep lewat hal seru di sekitar!'}
            </text>
          </g>

          {/* Kartu 2: Contoh Nyata di Sekitar */}
          <g transform="translate(308, 88)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#713f12" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#b45309" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">🔍</text>
            <text x="52" y="24" fill="#fbbf24" fontSize="11" fontWeight="bold">2. Contoh Nyata</text>
            <text x="52" y="38" fill="#fef08a" fontSize="9.5" fontWeight="bold">Ada di Sekitar Kita</text>
            <text x="14" y="62" fill="#fde68a" fontSize="8.5">
              {topic?.points?.[0] ? (topic.points[0].length > 50 ? topic.points[0].slice(0, 48) + '...' : topic.points[0]) : 'Diterapkan pada benda dan kegiatan nyata!'}
            </text>
          </g>

          {/* Kartu 3: Tips Cepat & Rumus Gampang */}
          <g transform="translate(36, 192)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#047857" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">💡</text>
            <text x="52" y="24" fill="#34d399" fontSize="11" fontWeight="bold">3. Tips Pintar</text>
            <text x="52" y="38" fill="#a7f3d0" fontSize="9.5" fontWeight="bold">Kunci Pemahaman</text>
            <text x="14" y="62" fill="#d1fae5" fontSize="8.5">
              {topic?.keyFormulaOrConcept || topic?.points?.[1]?.slice(0, 48) || 'Gunakan jembatan keledai dan cerita bergambar!'}
            </text>
          </g>

          {/* Kartu 4: Misi Kuis Berhadiah */}
          <g transform="translate(308, 192)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#831843" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#be123c" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">🎯</text>
            <text x="52" y="24" fill="#fb7185" fontSize="11" fontWeight="bold">4. Kuis Berhadiah</text>
            <text x="52" y="38" fill="#fecdd3" fontSize="9.5" fontWeight="bold">Kumpulkan Poin EXP!</text>
            <text x="14" y="62" fill="#ffe4e6" fontSize="8.5">
              Jawab kuis di sebelah kanan untuk menambah EXP karaktermu!
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};
