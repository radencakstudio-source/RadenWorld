/**
 * ============================================================================
 * FILE: resources/js/game/ui/EducationalVideoCanvas.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mesin Pemutar Video Animasi Edukasi Berkecepatan Tinggi (60 FPS).
 * Didesain 100% selaras dengan gaya estetika visual RadenWorld (Cozy Clay-Pixel).
 * Menggunakan palet warna ramah anak: Cream (#FFF8EA), Cokelat Kayu (#5C3A21),
 * Pastel Peach (#FFAE6D), Mint (#A8E6CF), Butter Yellow (#FEF08A),
 * serta garis batas tegas (chunky borders) yang hangat, ceria, dan tidak membosankan.
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
          0%, 100% { transform: scale(1); filter: drop-shadow(0 2px 0 rgba(92,58,33,0.3)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 4px 0 rgba(92,58,33,0.4)); }
        }
        @keyframes vaporFloatUp {
          0% { transform: translateY(0) scale(0.85); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translateY(-55px) scale(1.2); opacity: 0; }
        }
        @keyframes hopRabbit {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
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
          50% { transform: scaleX(0.2); }
        }
        @keyframes beeSway {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -6px); }
        }
        @keyframes fishFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(12px, -3px) rotate(3deg); }
        }
        @keyframes barGrowUp {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.93); }
        }
        @keyframes lungsBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
        @keyframes bookHover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes sliceHoverAnim {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -10px); }
        }
        @keyframes shapeMorph {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(2deg); }
        }
        @keyframes rainFallStream {
          0% { transform: translate(0, -30px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translate(-20px, 80px); opacity: 0; }
        }
        @keyframes oceanWaveSway {
          0% { transform: translateX(0); }
          50% { transform: translateX(-18px); }
          100% { transform: translateX(0); }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* 1. MATEMATIKA: MENGENAL BILANGAN CACAH 1-10 & NILAI TEMPAT           */}
      {/* ==================================================================== */}
      {type === 'math_counting' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          {/* Kanvas Dasar Bergaya Claymorphism RadenWorld */}
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          {/* Hamparan Kebun Rumput Ceria */}
          <rect x="8" y="235" width="584" height="77" rx="8" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🍎 BERHITUNG BILANGAN CACAH 1 SAMPAI 10 🔢
            </text>
          </g>

          {/* 10 Kartu Angka Clay Pastel */}
          <g transform="translate(25, 66)">
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
                    fill={isHighlight ? '#FFAE6D' : '#FFF8EA'}
                    stroke="#5C3A21"
                    strokeWidth="2"
                    style={isHighlight ? { animation: 'solarPulse 2s infinite ' + (i * 0.12) + 's' } : undefined}
                  />
                  <text x="24" y="32" fill="#000000" fontSize="18" fontWeight="900" textAnchor="middle">
                    {num}
                  </text>
                  <text x="24" y="52" fontSize="11" textAnchor="middle">
                    {num <= 3 ? '🍎' : num <= 6 ? '🍊' : num <= 9 ? '⭐' : '🌟'}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Keranjang Apel Segar di Kiri */}
          <g transform="translate(75, 146)">
            <path d="M 0 35 L 20 85 L 130 85 L 150 35 Z" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
            <path d="M 10 35 Q 75 -10, 140 35" stroke="#5C3A21" strokeWidth="3" fill="none" />
            {[
              { x: 30, y: 38 }, { x: 55, y: 30 }, { x: 80, y: 34 }, { x: 105, y: 38 },
              { x: 45, y: 55 }, { x: 70, y: 52 }, { x: 95, y: 56 }
            ].map((pos, aIdx) => (
              <g key={aIdx} transform={`translate(${pos.x}, ${pos.y})`} style={{ animation: 'hopRabbit 1.4s ease-in-out infinite ' + (aIdx * 0.18) + 's' }}>
                <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />
                <path d="M 0 -10 Q 3 -15, 6 -14" stroke="#15803D" strokeWidth="2" fill="none" />
              </g>
            ))}
            <rect x="25" y="90" width="100" height="22" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="75" y="105" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              {step === 0 ? '3 Apel Segar 🍎' : step === 1 ? '7 Buah Panen 🍊' : '10 Apel Penuh! 🎉'}
            </text>
          </g>

          {/* Kelinci Melompat di Garis Bilangan (Kanan) */}
          <g transform="translate(305, 146)">
            <rect x="0" y="0" width="265" height="118" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="265" height="26" rx="10" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="132" y="18" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              🐇 LOMPATAN GARIS BILANGAN
            </text>
            <line x1="20" y1="65" x2="245" y2="65" stroke="#5C3A21" strokeWidth="3" />
            {[0, 1, 2, 3, 4].map(idx => (
              <g key={idx} transform={`translate(${30 + idx * 48}, 65)`}>
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#5C3A21" strokeWidth="2.5" />
                <text x="0" y="20" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">
                  {(idx + 1) * 2}
                </text>
              </g>
            ))}
            <g transform={`translate(${30 + (step * 50)}, 45)`} style={{ animation: 'hopRabbit 0.8s ease-in-out infinite' }}>
              <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#5C3A21" strokeWidth="2" />
              <ellipse cx="-4" cy="-14" rx="3.5" ry="9" fill="#FFFFFF" stroke="#5C3A21" strokeWidth="1.5" />
              <ellipse cx="4" cy="-14" rx="3.5" ry="9" fill="#FFFFFF" stroke="#5C3A21" strokeWidth="1.5" />
              <circle cx="-3" cy="-2" r="2" fill="#5C3A21" />
              <circle cx="3" cy="-2" r="2" fill="#5C3A21" />
              <circle cx="0" cy="2" r="1.5" fill="#EF4444" />
            </g>
            <text x="132" y="104" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">
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
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ➕ PENJUMLAHAN &amp; PENGURANGAN BERGAMBAR ➖
            </text>
          </g>

          {/* Sisi Kiri: Kelompok A (6 Apel Merah) */}
          <g transform="translate(45, 75)">
            <rect x="0" y="0" width="150" height="170" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="150" height="28" rx="10" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2" />
            <text x="75" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              6 Apel Merah
            </text>
            <g transform="translate(25, 45)">
              {[
                { x: 20, y: 15 }, { x: 55, y: 15 }, { x: 85, y: 15 },
                { x: 20, y: 55 }, { x: 55, y: 55 }, { x: 85, y: 55 },
              ].map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="12" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" style={{ animation: 'hopRabbit 1.8s infinite ' + (idx * 0.15) + 's' }} />
              ))}
            </g>
            <rect x="35" y="125" width="80" height="28" rx="6" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="75" y="144" fill="#000000" fontSize="16" fontWeight="900" textAnchor="middle">6</text>
          </g>

          {/* Tanda Tambah / Kurang di Tengah */}
          <g transform="translate(225, 140)">
            <circle cx="20" cy="20" r="26" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2.5" style={{ animation: 'solarPulse 2s infinite' }} />
            <text x="20" y="29" fill="#000000" fontSize="28" fontWeight="900" textAnchor="middle">
              {step <= 2 ? '+' : '−'}
            </text>
          </g>

          {/* Sisi Tengah: Kelompok B (7 Jeruk Oranye) */}
          <g transform="translate(295, 75)">
            <rect x="0" y="0" width="150" height="170" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="150" height="28" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="75" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              7 Jeruk Manis
            </text>
            <g transform="translate(25, 45)">
              {[
                { x: 18, y: 15 }, { x: 52, y: 15 }, { x: 85, y: 15 },
                { x: 18, y: 50 }, { x: 52, y: 50 }, { x: 85, y: 50 },
                { x: 52, y: 85 }
              ].map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="11" fill="#F97316" stroke="#5C3A21" strokeWidth="1.5" style={{ animation: 'hopRabbit 1.8s infinite ' + (idx * 0.15) + 's' }} />
              ))}
            </g>
            <rect x="35" y="125" width="80" height="28" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="75" y="144" fill="#000000" fontSize="16" fontWeight="900" textAnchor="middle">7</text>
          </g>

          {/* Sisi Kanan: Hasil Gabungan Total */}
          <g transform="translate(470, 75)">
            <rect x="0" y="0" width="115" height="170" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="115" height="28" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
            <text x="57" y="19" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              TOTAL HASIL
            </text>
            <text x="57" y="75" fill="#000000" fontSize="36" fontWeight="900" textAnchor="middle">
              {step <= 2 ? '13' : '9'}
            </text>
            <text x="57" y="100" fill="#5C3A21" fontSize="11" textAnchor="middle">Buah Segar</text>
            <rect x="12" y="125" width="91" height="28" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="57" y="144" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              {step <= 2 ? '6 + 7 = 13' : '15 − 6 = 9'}
            </text>
          </g>

          <text x="300" y="292" fill="#5C3A21" fontSize="11" fontWeight="bold" textAnchor="middle">
            💡 Menggabungkan benda nyata membuat belajar berhitung sangat mudah dipahami!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 3. MATEMATIKA: BANGUN DATAR & PENGUKURAN PANJANG BAKU                */}
      {/* ==================================================================== */}
      {type === 'math_geometry_shapes' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              📐 BENTUK BANGUN DATAR &amp; PENGUKURAN PANJANG 📏
            </text>
          </g>

          {/* 3 Bangun Datar Clay */}
          {/* Segitiga */}
          <g transform="translate(60, 75)">
            <polygon points="55,15 15,95 95,95" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2.5" style={{ animation: 'shapeMorph 3s infinite' }} />
            <text x="55" y="70" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">SEGITIGA</text>
            <rect x="5" y="110" width="100" height="36" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <text x="55" y="125" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">3 Sisi Lurus</text>
            <text x="55" y="138" fill="#5C3A21" fontSize="9" textAnchor="middle">3 Titik Sudut</text>
          </g>

          {/* Persegi */}
          <g transform="translate(200, 75)">
            <rect x="15" y="15" width="80" height="80" rx="4" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2.5" style={{ animation: 'shapeMorph 3s infinite 0.5s' }} />
            <text x="55" y="62" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">PERSEGI</text>
            <rect x="5" y="110" width="100" height="36" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <text x="55" y="125" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">4 Sisi Sama</text>
            <text x="55" y="138" fill="#5C3A21" fontSize="9" textAnchor="middle">4 Sudut Siku 90°</text>
          </g>

          {/* Lingkaran */}
          <g transform="translate(340, 75)">
            <circle cx="55" cy="55" r="40" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2.5" style={{ animation: 'shapeMorph 3s infinite 1s' }} />
            <text x="55" y="60" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">LINGKARAN</text>
            <rect x="5" y="110" width="100" height="36" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <text x="55" y="125" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">1 Garis Lengkung</text>
            <text x="55" y="138" fill="#5C3A21" fontSize="9" textAnchor="middle">Tanpa Sudut (0°)</text>
          </g>

          {/* Kartu Rumus Kanan */}
          <g transform="translate(470, 75)">
            <rect x="0" y="0" width="105" height="155" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="105" height="26" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="52" y="18" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">RUMUS KELILING</text>
            <text x="52" y="45" fill="#5C3A21" fontSize="9.5" textAnchor="middle">Persegi:</text>
            <text x="52" y="60" fill="#000000" fontSize="11" fontWeight="extrabold" textAnchor="middle">K = 4 × s</text>
            <line x1="15" y1="72" x2="90" y2="72" stroke="#5C3A21" strokeWidth="1" />
            <text x="52" y="90" fill="#5C3A21" fontSize="9.5" textAnchor="middle">Persegi Pjg:</text>
            <text x="52" y="105" fill="#000000" fontSize="11" fontWeight="extrabold" textAnchor="middle">K = 2×(p + l)</text>
            <rect x="10" y="120" width="85" height="24" rx="4" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="52" y="136" fill="#000000" fontSize="9" fontWeight="bold" textAnchor="middle">Luas = p × l</text>
          </g>

          {/* Penggaris Kayu Baku */}
          <g transform="translate(60, 245)">
            <rect x="0" y="0" width="480" height="38" rx="6" fill="#F59E0B" stroke="#5C3A21" strokeWidth="2" />
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((tick, i) => (
              <g key={tick} transform={`translate(${i * 30 + 15}, 0)`}>
                <line x1="0" y1="0" x2="0" y2={i % 5 === 0 ? 18 : 10} stroke="#5C3A21" strokeWidth={i % 5 === 0 ? 2 : 1.2} />
                {i % 5 === 0 && (
                  <text x="0" y="30" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">{i}</text>
                )}
              </g>
            ))}
            <text x="440" y="24" fill="#000000" fontSize="10.5" fontWeight="extrabold">cm (Baku)</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 4. MATEMATIKA: MEMBACA JAM ANALOG & WAKTU                             */}
      {/* ==================================================================== */}
      {type === 'math_clock_time' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ⏰ MEMBACA JAM ANALOG &amp; SATUAN WAKTU ⏱️
            </text>
          </g>

          {/* Jam Dinding Clay Ceria */}
          <g transform="translate(180, 175)">
            <circle cx="0" cy="0" r="105" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="5" />
            <circle cx="0" cy="0" r="92" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* 12 Angka Jam */}
            {[
              { num: 12, x: 0, y: -70 },
              { num: 1, x: 38, y: -60 },
              { num: 2, x: 65, y: -34 },
              { num: 3, x: 74, y: 4 },
              { num: 4, x: 65, y: 44 },
              { num: 5, x: 38, y: 70 },
              { num: 6, x: 0, y: 78 },
              { num: 7, x: -38, y: 70 },
              { num: 8, x: -65, y: 44 },
              { num: 9, x: -74, y: 4 },
              { num: 10, x: -65, y: -34 },
              { num: 11, x: -38, y: -60 },
            ].map(item => (
              <text key={item.num} x={item.x} y={item.y} fill="#000000" fontSize="14" fontWeight="900" textAnchor="middle">
                {item.num}
              </text>
            ))}

            {/* Jarum Pendek (Jam) */}
            <g style={{ animation: 'clockHourAnim 24s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="0" y1="0" x2="0" y2="-45" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Jarum Panjang (Menit) */}
            <g style={{ animation: 'clockMinAnim 4s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="0" y1="0" x2="0" y2="-72" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
            </g>

            <circle cx="0" cy="0" r="7" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
          </g>

          {/* Sisi Kanan: Kartu Waktu Clay */}
          <g transform="translate(340, 75)">
            <rect x="0" y="0" width="235" height="205" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="235" height="32" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="117" y="21" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📅 JADWAL WAKTU SEHARI-HARI
            </text>

            <g transform="translate(15, 46)">
              {[
                { time: '07:00 Pagi', icon: '🎒', title: 'Berangkat ke Sekolah', desc: 'Jarum pendek ke 7, panjang ke 12' },
                { time: '12:00 Siang', icon: '🍱', title: 'Makan Siang & Istirahat', desc: 'Kedua jarum tepat di angka 12' },
                { time: '19:00 Malam', icon: '📖', title: 'Belajar & Mengulang Materi', desc: 'Jarum pendek ke 7 malam' }
              ].map((sch, sIdx) => (
                <g key={sIdx} transform={`translate(0, ${sIdx * 48})`}>
                  <rect x="0" y="0" width="205" height="42" rx="6" fill={sIdx === step % 3 ? '#FFD3B6' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="1.5" />
                  <text x="10" y="18" fill="#000000" fontSize="10.5" fontWeight="bold">{sch.icon} {sch.time}</text>
                  <text x="10" y="32" fill="#5C3A21" fontSize="8.5">{sch.desc}</text>
                </g>
              ))}
            </g>
          </g>

          <text x="300" y="295" fill="#5C3A21" fontSize="11" fontWeight="bold" textAnchor="middle">
            💡 1 Jam = 60 Menit • 1 Menit = 60 Detik • 1 Hari = 24 Jam
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 5. MATEMATIKA: PERKALIAN & PEMBAGIAN                                 */}
      {/* ==================================================================== */}
      {type === 'math_multiplication_division' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ✖️ PERKALIAN SEBAGAI PENJUMLAHAN BERULANG ➗
            </text>
          </g>

          {/* 3 Toples Clay Berisi Bintang */}
          <g transform="translate(60, 75)">
            {[0, 1, 2].map(jarIdx => (
              <g key={jarIdx} transform={`translate(${jarIdx * 155}, 0)`}>
                <rect x="0" y="15" width="125" height="135" rx="10" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2.5" />
                <rect x="25" y="0" width="75" height="18" rx="4" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
                <text x="62" y="36" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
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
                <rect x="25" y="115" width="75" height="24" rx="4" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
                <text x="62" y="131" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
                  4 Bintang
                </text>
              </g>
            ))}
          </g>

          {/* Banner Hasil Operasi */}
          <g transform="translate(75, 235)">
            <rect x="0" y="0" width="450" height="55" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="225" y="24" fill="#000000" fontSize="14" fontWeight="900" textAnchor="middle">
              3 Toples × 4 Bintang = 12 Bintang
            </text>
            <text x="225" y="44" fill="#5C3A21" fontSize="11" textAnchor="middle">
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
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              📊 PENYAJIAN DATA STATISTIK: DIAGRAM BATANG 📈
            </text>
          </g>

          {/* Area Grafik */}
          <g transform="translate(85, 75)">
            <line x1="0" y1="0" x2="0" y2="160" stroke="#5C3A21" strokeWidth="3" />
            <line x1="0" y1="160" x2="440" y2="160" stroke="#5C3A21" strokeWidth="3" />

            {[40, 80, 120].map((gy, gIdx) => (
              <g key={gy}>
                <line x1="0" y1={gy} x2="440" y2={gy} stroke="#EADBC0" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="-12" y={gy + 4} fill="#5C3A21" fontSize="10" fontWeight="bold" textAnchor="end">{(3 - gIdx) * 5}</text>
              </g>
            ))}
            <text x="-12" y="164" fill="#5C3A21" fontSize="10" fontWeight="bold" textAnchor="end">0</text>

            {[
              { label: 'Sains 🔬', height: 130, color: '#BAE6FD', count: 18 },
              { label: 'Matematika 🔢', height: 110, color: '#FFAE6D', count: 15 },
              { label: 'Seni 🎨', height: 80, color: '#FEF08A', count: 10 },
              { label: 'Olahraga ⚽', height: 145, color: '#A8E6CF', count: 20 },
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
                    stroke="#5C3A21"
                    strokeWidth="2"
                    style={{ animation: 'barGrowUp 2s ease-in-out infinite ' + (bIdx * 0.2) + 's', transformOrigin: '0px 160px' }}
                  />
                  <text x="27" y={yPos - 6} fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">{bar.count}</text>
                  <text x="27" y="180" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">{bar.label}</text>
                </g>
              );
            })}
          </g>

          <text x="300" y="292" fill="#5C3A21" fontSize="11" fontWeight="bold" textAnchor="middle">
            💡 Diagram batang mempermudah kita melihat data terbanyak dan tersedikit secara jelas!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 7. IPA: PERTUMBUHAN TANAMAN & BAGIAN TUMBUHAN                        */}
      {/* ==================================================================== */}
      {type === 'science_plants_growth' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="8" y="235" width="584" height="77" rx="8" fill="#78350F" stroke="#5C3A21" strokeWidth="2.5" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🌱 BAGIAN UTAMA TUMBUHAN &amp; PERTUMBUHANNYA 🌸
            </text>
          </g>

          {/* Mentari */}
          <g transform="translate(75, 75)">
            <circle cx="0" cy="0" r="28" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2.5" style={{ animation: 'solarPulse 2.5s infinite' }} />
            <text x="0" y="4" fill="#000000" fontSize="9" fontWeight="bold" textAnchor="middle">Mentari</text>
          </g>

          {/* Batang Utama Tumbuh Naik */}
          <path d="M 230 235 Q 225 170, 230 115" stroke="#16A34A" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M 230 235 Q 225 170, 230 115" stroke="#5C3A21" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Akar */}
          <g stroke="#FDE047" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 230 235 Q 210 265, 185 295" />
            <path d="M 230 235 Q 240 270, 260 300" />
            <path d="M 230 245 L 230 305" />
          </g>
          <text x="230" y="275" fill="#FFF8EA" fontSize="10.5" fontWeight="bold" textAnchor="middle">Akar Menyerap Air 💧</text>

          {/* Daun Hijau */}
          <g transform="translate(230, 165)">
            <path d="M 0 0 Q -50 -35, -45 15 Z" fill="#22C55E" stroke="#5C3A21" strokeWidth="2" style={{ animation: 'shapeMorph 3s infinite' }} />
            <path d="M 0 -20 Q 50 -55, 45 -5 Z" fill="#22C55E" stroke="#5C3A21" strokeWidth="2" style={{ animation: 'shapeMorph 3s infinite 0.5s' }} />
          </g>

          {/* Bunga Mekar */}
          <g transform="translate(230, 110)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle
                key={deg}
                cx={Math.cos((deg * Math.PI) / 180) * 22}
                cy={Math.sin((deg * Math.PI) / 180) * 22}
                r="14"
                fill="#F472B6"
                stroke="#5C3A21"
                strokeWidth="1.5"
              />
            ))}
            <circle cx="0" cy="0" r="16" fill="#FDE047" stroke="#5C3A21" strokeWidth="2" />
          </g>

          {/* Lebah Madu */}
          <g transform="translate(300, 95)" style={{ animation: 'beeSway 2s ease-in-out infinite' }}>
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FACC15" stroke="#5C3A21" strokeWidth="2" />
            <line x1="-3" y1="-9" x2="-3" y2="9" stroke="#5C3A21" strokeWidth="2" />
            <line x1="4" y1="-9" x2="4" y2="9" stroke="#5C3A21" strokeWidth="2" />
            <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#BAE6FD" opacity="0.8" />
            <text x="25" y="4" fill="#000000" fontSize="10" fontWeight="bold">🐝 Lebah</text>
          </g>

          {/* Keterangan di Kanan */}
          <g transform="translate(390, 75)">
            <rect x="0" y="0" width="185" height="150" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="185" height="26" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="92" y="18" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">4 BAGIAN UTAMA</text>
            <g transform="translate(15, 38)">
              {[
                { name: '1. Akar', desc: 'Menyerap air & nutrisi' },
                { name: '2. Batang', desc: 'Menopang & menyalurkan air' },
                { name: '3. Daun', desc: 'Dapur fotosintesis hijau' },
                { name: '4. Bunga', desc: 'Alat perkembangbiakan' }
              ].map((p, idx) => (
                <g key={idx} transform={`translate(0, ${idx * 27})`}>
                  <text x="0" y="10" fill="#000000" fontSize="9.5" fontWeight="bold">{p.name}</text>
                  <text x="0" y="20" fill="#5C3A21" fontSize="8">{p.desc}</text>
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
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="8" y="8" width="584" height="120" fill="#BAE6FD" />
          <rect x="8" y="128" width="350" height="184" fill="#A8E6CF" />
          <rect x="358" y="128" width="234" height="184" fill="#7DD3FC" />
          <line x1="358" y1="128" x2="358" y2="312" stroke="#5C3A21" strokeWidth="2" />

          {/* Header */}
          <g transform="translate(300, 22)">
            <rect x="-185" y="0" width="370" height="30" rx="8" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="20" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🐾 HABITAT HEWAN: DARAT 🏞️ • AIR 🌊 • UDARA ☁️
            </text>
          </g>

          {/* Burung di Udara */}
          <g transform="translate(150, 75)" style={{ animation: 'beeSway 2.5s ease-in-out infinite' }}>
            <text x="0" y="0" fontSize="24">🕊️</text>
            <text x="32" y="-2" fill="#000000" fontSize="10.5" fontWeight="bold">Burung (Udara)</text>
          </g>

          {/* Kelinci di Darat */}
          <g transform="translate(100, 185)" style={{ animation: 'hopRabbit 1.2s infinite' }}>
            <text x="0" y="0" fontSize="34">🐇</text>
            <text x="45" y="-5" fill="#000000" fontSize="11" fontWeight="bold">Kelinci Lucu (Darat)</text>
            <text x="45" y="12" fill="#5C3A21" fontSize="9">Makan rumput &amp; wortel 🥕</text>
          </g>

          {/* Ikan di Air */}
          <g transform="translate(430, 200)" style={{ animation: 'fishFloat 2s ease-in-out infinite' }}>
            <text x="0" y="0" fontSize="34">🐟</text>
            <text x="45" y="-5" fill="#000000" fontSize="11" fontWeight="bold">Ikan Mas (Air)</text>
            <text x="45" y="12" fill="#5C3A21" fontSize="9">Bernapas via insang 🫧</text>
          </g>

          {/* Katak Amfibi */}
          <g transform="translate(325, 235)">
            <text x="0" y="0" fontSize="26">🐸</text>
            <rect x="-25" y="8" width="80" height="18" rx="4" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="15" y="21" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">Amfibi (2 Alam)</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 9. IPA: METAMORFOSIS SEMPURNA KUPU-KUPU                             */}
      {/* ==================================================================== */}
      {type === 'science_metamorphosis' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🦋 DAUR HIDUP &amp; METAMORFOSIS KUPU-KUPU 🌿
            </text>
          </g>

          {/* 4 Lingkaran Fase Metamorfosis */}
          {/* 1. Telur */}
          <g transform="translate(90, 140)">
            <circle cx="0" cy="0" r="45" fill={step === 0 ? '#FEF08A' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2.5" />
            <text x="0" y="10" fontSize="28" textAnchor="middle">🥚</text>
            <text x="0" y="65" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">1. Telur di Daun</text>
          </g>

          <text x="165" y="145" fill="#5C3A21" fontSize="22" fontWeight="bold">➔</text>

          {/* 2. Ulat */}
          <g transform="translate(230, 140)">
            <circle cx="0" cy="0" r="45" fill={step === 1 ? '#A8E6CF' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2.5" />
            <text x="0" y="10" fontSize="28" textAnchor="middle">🐛</text>
            <text x="0" y="65" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">2. Ulat (Larva)</text>
          </g>

          <text x="305" y="145" fill="#5C3A21" fontSize="22" fontWeight="bold">➔</text>

          {/* 3. Kepompong */}
          <g transform="translate(370, 140)">
            <circle cx="0" cy="0" r="45" fill={step === 2 ? '#FFD3B6' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2.5" />
            <text x="0" y="10" fontSize="28" textAnchor="middle">🪺</text>
            <text x="0" y="65" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">3. Kepompong</text>
          </g>

          <text x="445" y="145" fill="#5C3A21" fontSize="22" fontWeight="bold">➔</text>

          {/* 4. Kupu-Kupu Indah */}
          <g transform="translate(510, 140)">
            <circle cx="0" cy="0" r="45" fill={step === 3 ? '#FBCFE8' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2.5" />
            <g style={{ animation: 'butterflyFlap 0.8s ease-in-out infinite' }}>
              <text x="0" y="10" fontSize="30" textAnchor="middle">🦋</text>
            </g>
            <text x="0" y="65" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">4. Kupu-Kupu Dewasa</text>
          </g>

          <text x="300" y="285" fill="#5C3A21" fontSize="11" textAnchor="middle">
            ✨ Metamorfosis Sempurna: Telur ➔ Ulat Lapar ➔ Kepompong Tenang ➔ Kupu-Kupu Cantik
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 10. IPA: RANTAI MAKANAN & JARING EKOSISTEM                           */}
      {/* ==================================================================== */}
      {type === 'science_food_chain' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🌾 RANTAI MAKANAN &amp; JARING EKOSISTEM 🦅
            </text>
          </g>

          {/* 5 Rantai Makanan Berurutan */}
          <g transform="translate(40, 140)">
            {[
              { icon: '☀️', role: 'Energi Matahari', color: '#FEF08A' },
              { icon: '🌱', role: 'Produsen (Padi)', color: '#A8E6CF' },
              { icon: '🐇', role: 'Konsumen 1', color: '#BAE6FD' },
              { icon: '🐍', role: 'Konsumen 2', color: '#FFD3B6' },
              { icon: '🦅', role: 'Konsumen Puncak', color: '#FFAE6D' }
            ].map((node, nIdx) => (
              <g key={nIdx} transform={`translate(${nIdx * 105}, 0)`}>
                <circle cx="35" cy="0" r="32" fill={node.color} stroke="#5C3A21" strokeWidth="2" style={{ animation: 'solarPulse 2s infinite ' + (nIdx * 0.25) + 's' }} />
                <text x="35" y="8" fontSize="24" textAnchor="middle">{node.icon}</text>
                <text x="35" y="52" fill="#000000" fontSize="9" fontWeight="bold" textAnchor="middle">{node.role}</text>
                {nIdx < 4 && (
                  <text x="82" y="5" fill="#5C3A21" fontSize="16" fontWeight="bold">➔</text>
                )}
              </g>
            ))}
          </g>

          <g transform="translate(180, 235)">
            <rect x="0" y="0" width="240" height="42" rx="8" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2" />
            <text x="120" y="26" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
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
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🧊 3 WUJUD BENDA: PADAT • CAIR • GAS 💨
            </text>
          </g>

          {/* 3 Wadah Wujud Benda */}
          {/* 1. Padat */}
          <g transform="translate(60, 75)">
            <rect x="0" y="0" width="130" height="165" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="130" height="28" rx="10" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="65" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">1. BENDA PADAT</text>
            <rect x="35" y="45" width="60" height="60" rx="4" fill="#38BDF8" stroke="#5C3A21" strokeWidth="2" />
            <text x="65" y="80" fontSize="24" textAnchor="middle">🧊</text>
            <rect x="10" y="125" width="110" height="28" rx="6" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="65" y="142" fill="#000000" fontSize="9" textAnchor="middle">Bentuk &amp; Volume Tetap</text>
          </g>

          {/* 2. Cair */}
          <g transform="translate(235, 75)">
            <rect x="0" y="0" width="130" height="165" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="130" height="28" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="65" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">2. BENDA CAIR</text>
            <path d="M 25 105 Q 65 95, 105 105 L 105 115 L 25 115 Z" fill="#0284C7" />
            <text x="65" y="80" fontSize="24" textAnchor="middle">💧</text>
            <rect x="10" y="125" width="110" height="28" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="65" y="142" fill="#000000" fontSize="9" textAnchor="middle">Mengikuti Bentuk Wadah</text>
          </g>

          {/* 3. Gas */}
          <g transform="translate(410, 75)">
            <rect x="0" y="0" width="130" height="165" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="130" height="28" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
            <text x="65" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">3. BENDA GAS</text>
            <g style={{ animation: 'vaporFloatUp 2s infinite' }}>
              <circle cx="45" cy="85" r="8" fill="#FDE047" stroke="#5C3A21" strokeWidth="1" />
              <circle cx="85" cy="70" r="10" fill="#FDE047" stroke="#5C3A21" strokeWidth="1" />
            </g>
            <text x="65" y="80" fontSize="24" textAnchor="middle">💨</text>
            <rect x="10" y="125" width="110" height="28" rx="6" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="65" y="142" fill="#000000" fontSize="9" textAnchor="middle">Mengisi Seluruh Ruangan</text>
          </g>

          <text x="300" y="292" fill="#5C3A21" fontSize="11" fontWeight="bold" textAnchor="middle">
            🔄 Perubahan Wujud: Mencair (Padat ➔ Cair) • Membeku (Cair ➔ Padat) • Menguap (Cair ➔ Gas)
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 12. IPA: PANCA INDRA & PARU-PARU PERNAPASAN MANUSIA                  */}
      {/* ==================================================================== */}
      {type === 'science_human_body' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#FBCFE8" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🫁 PANCA INDRA &amp; SISTEM PERNAPASAN MANUSIA 👁️
            </text>
          </g>

          {/* 5 Panca Indra */}
          <g transform="translate(60, 75)">
            <rect x="0" y="0" width="220" height="195" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="220" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="110" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">5 PANCA INDRA KITA</text>
            <g transform="translate(15, 38)">
              {[
                { icon: '👁️', name: 'Mata (Penglihatan)', text: 'Melihat warna & bentuk' },
                { icon: '👂', name: 'Telinga (Pendengaran)', text: 'Mendengar bunyi & suara' },
                { icon: '👃', name: 'Hidung (Penciuman)', text: 'Membaui aroma wangi' },
                { icon: '👅', name: 'Lidah (Pengecap)', text: 'Mengecap manis, asin' },
                { icon: '✋', name: 'Kulit (Peraba)', text: 'Merasakan halus & kasar' }
              ].map((s, idx) => (
                <g key={idx} transform={`translate(0, ${idx * 30})`}>
                  <text x="0" y="14" fontSize="13">{s.icon}</text>
                  <text x="24" y="12" fill="#000000" fontSize="9.5" fontWeight="bold">{s.name}</text>
                  <text x="24" y="22" fill="#5C3A21" fontSize="7.5">{s.text}</text>
                </g>
              ))}
            </g>
          </g>

          {/* Paru-Paru Bernapas */}
          <g transform="translate(420, 165)">
            <circle cx="0" cy="0" r="85" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2.5" />
            <g style={{ animation: 'lungsBreathe 2.5s ease-in-out infinite' }}>
              <ellipse cx="-25" cy="5" rx="22" ry="38" fill="#38BDF8" stroke="#5C3A21" strokeWidth="2" />
              <ellipse cx="25" cy="5" rx="22" ry="38" fill="#38BDF8" stroke="#5C3A21" strokeWidth="2" />
              <path d="M 0 -45 L 0 -10 M 0 -10 L -20 10 M 0 -10 L 20 10" stroke="#5C3A21" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>
            <text x="0" y="65" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">🫁 Paru-Paru Sehat</text>
            <text x="0" y="78" fill="#5C3A21" fontSize="8.5" textAnchor="middle">Hirup O₂ Segar • Buang CO₂</text>
          </g>

          <text x="300" y="295" fill="#5C3A21" fontSize="10.5" textAnchor="middle">
            Menghirup udara segar di alam terbuka menjaga tubuh tetap sehat dan bugar!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 13. BAHASA INDONESIA: HURUF VOKAL & KONSONAN A-Z                     */}
      {/* ==================================================================== */}
      {type === 'language_alphabet_vocab' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🔤 HURUF VOKAL &amp; KONSONAN BAHASA INDONESIA 📖
            </text>
          </g>

          {/* 5 Huruf Vokal Clay */}
          <g transform="translate(60, 75)">
            <rect x="0" y="0" width="480" height="90" rx="10" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="240" y="24" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              5 HURUF VOKAL (SUARA TERBUKA)
            </text>
            {['A', 'I', 'U', 'E', 'O'].map((vok, vIdx) => (
              <g key={vok} transform={`translate(${45 + vIdx * 82}, 35)`}>
                <rect x="0" y="0" width="55" height="45" rx="6" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" style={{ animation: 'solarPulse 2s infinite ' + (vIdx * 0.2) + 's' }} />
                <text x="27" y="32" fill="#000000" fontSize="24" fontWeight="900" textAnchor="middle">{vok}</text>
              </g>
            ))}
          </g>

          {/* Merangkai Kata BOLA */}
          <g transform="translate(60, 180)">
            <rect x="0" y="0" width="480" height="95" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <text x="240" y="24" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              MERANGKAI SUKU KATA MENJADI KATA
            </text>
            <g transform="translate(65, 38)">
              <rect x="0" y="0" width="85" height="42" rx="6" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
              <text x="42" y="27" fill="#000000" fontSize="18" fontWeight="bold" textAnchor="middle">BO</text>

              <text x="110" y="28" fill="#5C3A21" fontSize="22" fontWeight="bold">+</text>

              <rect x="135" y="0" width="85" height="42" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
              <text x="177" y="27" fill="#000000" fontSize="18" fontWeight="bold" textAnchor="middle">LA</text>

              <text x="245" y="28" fill="#5C3A21" fontSize="22" fontWeight="bold">=</text>

              <rect x="270" y="0" width="115" height="42" rx="6" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
              <text x="327" y="27" fill="#000000" fontSize="18" fontWeight="900" textAnchor="middle">BOLA ⚽</text>
            </g>
          </g>

          <text x="300" y="295" fill="#5C3A21" fontSize="10.5" textAnchor="middle">
            21 Huruf Konsonan + 5 Huruf Vokal membentuk ribuan kata indah bahasa Indonesia!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 14. BAHASA INDONESIA: DONGENG FABEL HEWAN & PESAN MORAL             */}
      {/* ==================================================================== */}
      {type === 'language_story_fabel' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              📚 DONGENG FABEL HEWAN &amp; PESAN MORAL INDAH 📖
            </text>
          </g>

          {/* Buku Cerita Terbuka */}
          <g transform="translate(300, 150)" style={{ animation: 'bookHover 3s ease-in-out infinite' }}>
            <path d="M 0 -70 C -80 -80, -180 -60, -210 -40 L -210 60 C -180 40, -80 20, 0 30 Z" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
            <path d="M 0 -70 C 80 -80, 180 -60, 210 -40 L 210 60 C 180 40, 80 20, 0 30 Z" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
            <line x1="0" y1="-70" x2="0" y2="30" stroke="#5C3A21" strokeWidth="4" />

            <g transform="translate(-110, -10)">
              <text x="0" y="-30" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">Kisah Si Kancil 🦌</text>
              <text x="0" y="-12" fill="#5C3A21" fontSize="8.5" textAnchor="middle">"Di tepi sungai yang jernih,</text>
              <text x="0" y="2" fill="#5C3A21" fontSize="8.5" textAnchor="middle">Kancil cerdik menyeberang</text>
              <text x="0" y="16" fill="#5C3A21" fontSize="8.5" textAnchor="middle">dengan menghitung buaya..."</text>
            </g>

            <g transform="translate(110, -10)">
              <text x="0" y="-30" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">🌟 Pesan Kebaikan</text>
              <text x="0" y="-12" fill="#15803D" fontSize="8.5" fontWeight="bold" textAnchor="middle">Gunakan akal untuk kebaikan</text>
              <text x="0" y="2" fill="#15803D" fontSize="8.5" textAnchor="middle">Jangan berbuat curang</text>
              <text x="0" y="16" fill="#15803D" fontSize="8.5" textAnchor="middle">Selalu tolong-menolong</text>
            </g>
          </g>

          <text x="300" y="292" fill="#5C3A21" fontSize="11" fontWeight="bold" textAnchor="middle">
            ✨ Fabel adalah cerita fiksi yang tokohnya hewan dan mengajarkan budi pekerti luhur!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 15. BAHASA INGGRIS: GREETINGS, COLORS & NUMBERS                      */}
      {/* ==================================================================== */}
      {type === 'english_kids' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-185" y="0" width="370" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🌐 FUN ENGLISH FOR KIDS: GREETINGS &amp; WORDS 👋
            </text>
          </g>

          {/* Kartu Dialog Salam */}
          <g transform="translate(50, 75)">
            <rect x="0" y="0" width="230" height="185" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="230" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="115" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              DAILY GREETINGS
            </text>
            <g transform="translate(15, 42)">
              {[
                { en: 'Good Morning!', id: 'Selamat Pagi ☀️' },
                { en: 'How are you?', id: 'Bagaimana kabarmu? 😊' },
                { en: "I'm fine, thank you!", id: 'Saya baik, terima kasih! 🌟' },
                { en: 'See you later!', id: 'Sampai jumpa lagi! 👋' }
              ].map((gItem, gIdx) => (
                <g key={gIdx} transform={`translate(0, ${gIdx * 32})`}>
                  <rect x="0" y="0" width="200" height="26" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
                  <text x="10" y="14" fill="#000000" fontSize="9.5" fontWeight="bold">{gItem.en}</text>
                  <text x="10" y="22" fill="#5C3A21" fontSize="7.5">{gItem.id}</text>
                </g>
              ))}
            </g>
          </g>

          {/* Balon Warna */}
          <g transform="translate(320, 75)">
            <rect x="0" y="0" width="230" height="185" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="230" height="28" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="115" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              COLORS &amp; NUMBERS
            </text>
            <g transform="translate(25, 42)">
              {[
                { name: 'RED', color: '#EF4444', icon: '🔴' },
                { name: 'BLUE', color: '#38BDF8', icon: '🔵' },
                { name: 'GREEN', color: '#22C55E', icon: '🟢' },
                { name: 'YELLOW', color: '#FACC15', icon: '🟡' }
              ].map((cItem, cIdx) => (
                <g key={cIdx} transform={`translate(${(cIdx % 2) * 95}, ${Math.floor(cIdx / 2) * 55})`}>
                  <rect x="0" y="0" width="85" height="45" rx="6" fill={cItem.color} stroke="#5C3A21" strokeWidth="2" />
                  <text x="42" y="20" fontSize="12" textAnchor="middle">{cItem.icon}</text>
                  <text x="42" y="36" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">{cItem.name}</text>
                </g>
              ))}
            </g>
          </g>

          <text x="300" y="292" fill="#5C3A21" fontSize="11" fontWeight="bold" textAnchor="middle">
            Practice every day: One, Two, Three, Four, Five... Learning English is so fun!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 16. SENI BUDAYA, WAYANG & AKSARA JAWA                                 */}
      {/* ==================================================================== */}
      {type === 'art_culture_jawa' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🎨 SENI BUDAYA NUSANTARA &amp; AKSARA JAWA 🎭
            </text>
          </g>

          {/* Palet Warna & Batik */}
          <g transform="translate(60, 75)">
            <rect x="0" y="0" width="225" height="185" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2" />
            <text x="112" y="19" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">WARNA PRIMER &amp; BATIK</text>
            <g transform="translate(35, 45)">
              <circle cx="25" cy="25" r="22" fill="#EF4444" stroke="#5C3A21" strokeWidth="2" />
              <circle cx="75" cy="25" r="22" fill="#FACC15" stroke="#5C3A21" strokeWidth="2" />
              <circle cx="125" cy="25" r="22" fill="#0284C7" stroke="#5C3A21" strokeWidth="2" />
            </g>
            <text x="112" y="115" fill="#5C3A21" fontSize="9" textAnchor="middle">Merah + Kuning + Biru</text>
            <rect x="15" y="130" width="195" height="42" rx="6" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="148" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">Motif Batik Kawung</text>
            <text x="112" y="162" fill="#5C3A21" fontSize="8" textAnchor="middle">Warisan Luhur Budaya Indonesia</text>
          </g>

          {/* Wayang & Aksara Jawa */}
          <g transform="translate(315, 75)">
            <rect x="0" y="0" width="225" height="185" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="112" y="19" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">AKSARA JAWA &amp; WAYANG</text>
            <g transform="translate(15, 45)">
              <rect x="0" y="0" width="195" height="45" rx="6" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="97" y="24" fill="#000000" fontSize="16" fontWeight="bold" textAnchor="middle">ꦲ ꦤ ꦕ ꦫ ꦏ</text>
              <text x="97" y="38" fill="#5C3A21" fontSize="9" textAnchor="middle">Ha - Na - Ca - Ra - Ka</text>
            </g>
            <g transform="translate(112, 135)">
              <text x="0" y="0" fontSize="32" textAnchor="middle">🎭</text>
              <text x="0" y="20" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">Tokoh Pandhawa Lima</text>
            </g>
          </g>

          <text x="300" y="292" fill="#5C3A21" fontSize="10.5" textAnchor="middle">
            Melestarikan seni tradisional dan kearifan lokal Nusantara dengan rasa bangga!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 17. INFORMATIKA & KODING SCRATCH DASAR                               */}
      {/* ==================================================================== */}
      {type === 'informatics_scratch' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              💻 KODING SCRATCH &amp; LOGIKA PEMROGRAMAN 🤖
            </text>
          </g>

          {/* Balok Scratch Clay */}
          <g transform="translate(50, 75)">
            <g transform="translate(0, 0)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">🏁</text>
              <text x="45" y="26" fill="#000000" fontSize="11" fontWeight="900">Ketika bendera hijau diklik</text>
            </g>
            <g transform="translate(0, 48)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">➡️</text>
              <text x="45" y="26" fill="#000000" fontSize="11" fontWeight="900">Gerak 10 langkah ke depan</text>
            </g>
            <g transform="translate(0, 96)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">💬</text>
              <text x="45" y="26" fill="#000000" fontSize="11" fontWeight="900">Katakan "Halo Raden!" 2 detik</text>
            </g>
            <g transform="translate(0, 144)">
              <path d="M 0 0 L 25 0 Q 35 10, 45 0 L 260 0 L 260 42 L 45 42 Q 35 52, 25 42 L 0 42 Z" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
              <text x="20" y="26" fontSize="14">🔊</text>
              <text x="45" y="26" fill="#000000" fontSize="11" fontWeight="900">Mainkan bunyi meow</text>
            </g>
          </g>

          {/* Robot Maskot */}
          <g transform="translate(345, 75)">
            <rect x="0" y="0" width="205" height="186" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="205" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="102" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">LAYAR PREVIEW GAME</text>

            <rect x="15" y="38" width="175" height="95" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <g transform="translate(85, 85)" style={{ animation: 'hopRabbit 1s infinite' }}>
              <text x="0" y="0" fontSize="36" textAnchor="middle">🤖</text>
            </g>

            <rect x="15" y="142" width="175" height="32" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="102" y="162" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              ✨ Program Berhasil Dijalankan!
            </text>
          </g>

          <text x="300" y="292" fill="#5C3A21" fontSize="10.5" textAnchor="middle">
            Menyusun balok algoritma melatih otak kita berpikir runtut, cerdas, dan logis!
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 18. PKN: GOTONG ROYONG & PERSATUAN                                   */}
      {/* ==================================================================== */}
      {type === 'civics_gotong_royong' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Header */}
          <g transform="translate(300, 24)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🇮🇩 GOTONG ROYONG &amp; BHINNEKA TUNGGAL IKA 🤝
            </text>
          </g>

          {/* Bendera Merah Putih & Lingkaran Persahabatan */}
          <g transform="translate(300, 135)">
            <circle cx="0" cy="0" r="85" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" style={{ animation: 'solarPulse 3s infinite' }} />
            <rect x="-35" y="-55" width="70" height="24" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />
            <rect x="-35" y="-31" width="70" height="24" fill="#FFFFFF" stroke="#5C3A21" strokeWidth="1.5" />
            <line x1="-35" y1="-60" x2="-35" y2="25" stroke="#5C3A21" strokeWidth="3" strokeLinecap="round" />

            <g transform="translate(0, 35)">
              <text x="-45" y="0" fontSize="24" textAnchor="middle">👦</text>
              <text x="-15" y="0" fontSize="24" textAnchor="middle">👧</text>
              <text x="15" y="0" fontSize="24" textAnchor="middle">🧒</text>
              <text x="45" y="0" fontSize="24" textAnchor="middle">👧</text>
            </g>
          </g>

          <g transform="translate(60, 235)">
            <rect x="0" y="0" width="150" height="52" rx="6" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="75" y="22" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">1. Rukun &amp; Toleransi</text>
            <text x="75" y="38" fill="#5C3A21" fontSize="8.5" textAnchor="middle">Menghargai perbedaan</text>

            <rect x="165" y="0" width="150" height="52" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="240" y="22" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">2. Gotong Royong</text>
            <text x="240" y="38" fill="#5C3A21" fontSize="8.5" textAnchor="middle">Bahu membahu bersama</text>

            <rect x="330" y="0" width="150" height="52" rx="6" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="405" y="22" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">3. Hak &amp; Kewajiban</text>
            <text x="405" y="38" fill="#5C3A21" fontSize="8.5" textAnchor="middle">Tertib &amp; bertanggung jawab</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 19. PECAHAN PIZZA MATEMATIKA                                         */}
      {/* ==================================================================== */}
      {type === 'math_arithmetic' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Papan Talenan Kayu Pizza */}
          <circle cx="215" cy="155" r="105" fill="#D97706" stroke="#5C3A21" strokeWidth="4" />
          <rect x="90" y="146" width="30" height="18" rx="4" fill="#B45309" stroke="#5C3A21" strokeWidth="2" />

          {/* STEP 0: 1 UTUH */}
          {step === 0 && (
            <g transform="translate(215, 155)">
              <circle cx="0" cy="0" r="90" fill="#F59E0B" stroke="#5C3A21" strokeWidth="3" />
              <circle cx="0" cy="0" r="78" fill="#FDE047" stroke="#EA580C" strokeWidth="1.5" />
              {[
                { x: -35, y: -25 }, { x: 25, y: -35 }, { x: 38, y: 22 },
                { x: -25, y: 35 }, { x: 0, y: 0 }, { x: -45, y: 8 }, { x: 30, y: -2 }
              ].map((pos, idx) => (
                <circle key={idx} cx={pos.x} cy={pos.y} r="11" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />
              ))}
              <g transform="translate(0, 0)">
                <rect x="-48" y="-16" width="96" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
                <text x="0" y="6" fill="#000000" fontSize="14" fontWeight="900" textAnchor="middle">1 UTUH</text>
              </g>
            </g>
          )}

          {/* STEP 1: 1/4 BAGIAN */}
          {step === 1 && (
            <g transform="translate(215, 155)">
              <path d="M 0 0 L -90 0 A 90 90 0 0 1 0 -90 Z" fill="#F59E0B" stroke="#5C3A21" strokeWidth="2" />
              <path d="M 0 0 L 0 90 A 90 90 0 0 1 -90 0 Z" fill="#F59E0B" stroke="#5C3A21" strokeWidth="2" />
              <path d="M 0 0 L 90 0 A 90 90 0 0 1 0 90 Z" fill="#F59E0B" stroke="#5C3A21" strokeWidth="2" />
              <g style={{ animation: 'sliceHoverAnim 1.8s ease-in-out infinite' }}>
                <path d="M 0 0 L 0 -90 A 90 90 0 0 1 90 0 Z" fill="#FDE047" stroke="#5C3A21" strokeWidth="3" />
                <circle cx="32" cy="-32" r="10" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />
                <g transform="translate(50, -50)">
                  <rect x="-26" y="-14" width="52" height="28" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
                  <text x="0" y="5" fill="#000000" fontSize="13" fontWeight="900" textAnchor="middle">1 / 4</text>
                </g>
              </g>
            </g>
          )}

          {/* STEP 2: 2/4 = 1/2 */}
          {step === 2 && (
            <g transform="translate(215, 155)">
              <path d="M 0 0 L 0 -90 A 90 90 0 0 0 0 90 Z" fill="#B45309" stroke="#5C3A21" strokeWidth="2" />
              <path d="M 0 0 L 0 -90 A 90 90 0 0 1 0 90 Z" fill="#F59E0B" stroke="#5C3A21" strokeWidth="3" />
              <line x1="0" y1="0" x2="90" y2="0" stroke="#5C3A21" strokeWidth="2" strokeDasharray="4,3" />
              <circle cx="32" cy="-32" r="10" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />
              <circle cx="32" cy="32" r="10" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />
              <g transform="translate(70, 0)">
                <rect x="-30" y="-16" width="60" height="32" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
                <text x="0" y="5" fill="#000000" fontSize="13" fontWeight="900" textAnchor="middle">= 1 / 2</text>
              </g>
            </g>
          )}

          {/* STEP 3: BERBAGI 4 TEMAN */}
          {step === 3 && (
            <g transform="translate(215, 155)">
              {[
                { x: -55, y: -55, name: '👦 Budi (1/4)', color: '#BAE6FD' },
                { x: 55, y: -55, name: '👧 Siti (1/4)', color: '#FBCFE8' },
                { x: -55, y: 55, name: '🧒 Edo (1/4)', color: '#A8E6CF' },
                { x: 55, y: 55, name: '👧 Lani (1/4)', color: '#FFAE6D' },
              ].map((fr, fIdx) => (
                <g key={fIdx} transform={`translate(${fr.x}, ${fr.y})`}>
                  <circle cx="0" cy="0" r="32" fill={fr.color} stroke="#5C3A21" strokeWidth="2" />
                  <text x="0" y="4" fontSize="16" textAnchor="middle">🍕</text>
                  <text x="0" y="24" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">{fr.name}</text>
                </g>
              ))}
            </g>
          )}

          {/* Sisi Kanan: Papan Rumus Pecahan Clay */}
          <g transform="translate(360, 36)">
            <rect x="0" y="0" width="225" height="242" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="225" height="34" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="112" y="22" fill="#000000" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              📚 RUMUS PECAHAN SERU
            </text>
            <g transform="translate(20, 48)">
              <rect x="0" y="0" width="185" height="42" rx="8" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
              <text x="26" y="27" fill="#000000" fontSize="22" fontWeight="900" textAnchor="middle">
                {step === 0 ? '1' : step === 1 ? '1' : step === 2 ? '2' : '4'}
              </text>
              <text x="52" y="18" fill="#000000" fontSize="10.5" fontWeight="bold">PEMBILANG (Atas)</text>
              <text x="52" y="32" fill="#5C3A21" fontSize="8.5">Jumlah potong diambil</text>
              <line x1="8" y1="48" x2="177" y2="48" stroke="#5C3A21" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="0" y="54" width="185" height="42" rx="8" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
              <text x="26" y="81" fill="#000000" fontSize="22" fontWeight="900" textAnchor="middle">
                {step === 0 ? '1' : '4'}
              </text>
              <text x="52" y="72" fill="#000000" fontSize="10.5" fontWeight="bold">PENYEBUT (Bawah)</text>
              <text x="52" y="86" fill="#5C3A21" fontSize="8.5">Total potongan pizza</text>
            </g>
          </g>

          <text x="300" y="304" fill="#5C3A21" fontSize="11" fontWeight="bold" textAnchor="middle">
            🍕 Video Animasi Edukasi Pecahan Nyata • Perpustakaan RadenWorld
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 20. GARUDA PANCASILA & 5 PERISAI SILA                                */}
      {/* ==================================================================== */}
      {type === 'pancasila_shield' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Sayap & Perisai Garuda */}
          <g transform="translate(180, 150)">
            <path d="M 0 -80 C -60 -100, -140 -50, -150 20 C -120 40, -80 30, -50 0 Z" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <path d="M 0 -80 C 60 -100, 140 -50, 150 20 C 120 40, 80 30, 50 0 Z" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <path d="M 0 -70 L 65 -50 L 65 30 Q 0 95, 0 95 Q -65 30, -65 30 L -65 -50 Z" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3.5" />

            <circle cx="0" cy="0" r="24" fill={step === 0 ? '#FEF08A' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="6" fontSize="16" textAnchor="middle">⭐</text>
            <circle cx="34" cy="34" r="16" fill={step === 1 ? '#FEF08A' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2" />
            <text x="34" y="40" fontSize="12" textAnchor="middle">⛓️</text>
            <circle cx="34" cy="-30" r="16" fill={step === 2 ? '#A8E6CF' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2" />
            <text x="34" y="-24" fontSize="12" textAnchor="middle">🌳</text>
            <circle cx="-34" cy="-30" r="16" fill={step === 3 ? '#FFD3B6' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2" />
            <text x="-34" y="-24" fontSize="12" textAnchor="middle">🐂</text>
            <circle cx="-34" cy="34" r="16" fill={step === 4 ? '#FEF08A' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="2" />
            <text x="-34" y="40" fontSize="12" textAnchor="middle">🌾</text>
          </g>

          {/* Sisi Kanan: Penjelasan 5 Sila */}
          <g transform="translate(360, 40)">
            <rect x="0" y="0" width="225" height="235" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="0" y="0" width="225" height="34" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="112" y="22" fill="#000000" fontSize="12" fontWeight="bold" textAnchor="middle">
              🇮🇩 5 SILA GARUDA PANCASILA
            </text>
            <g transform="translate(15, 48)">
              {[
                { no: '1', name: 'Bintang Emas', text: 'Ketuhanan Yang Maha Esa' },
                { no: '2', name: 'Rantai Baja', text: 'Kemanusiaan yang Adil & Beradab' },
                { no: '3', name: 'Pohon Beringin', text: 'Persatuan Indonesia' },
                { no: '4', name: 'Kepala Banteng', text: 'Musyawarah & Mufakat' },
                { no: '5', name: 'Padi & Kapas', text: 'Keadilan Sosial' },
              ].map((s, idx) => (
                <g key={s.no} transform={`translate(0, ${idx * 34})`}>
                  <rect x="0" y="0" width="195" height="30" rx="6" fill={step === idx ? '#FEF08A' : '#FFF8EA'} stroke="#5C3A21" strokeWidth="1.5" />
                  <text x="10" y="16" fill="#000000" fontSize="9.5" fontWeight="bold">Sila {s.no}: {s.name}</text>
                  <text x="10" y="26" fill="#5C3A21" fontSize="7.5">{s.text}</text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 21. BAHASA INDONESIA: KERETA KALIMAT SPOK                            */}
      {/* ==================================================================== */}
      {type === 'spok_sentence' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

          {/* Rel Kereta Kayu */}
          <line x1="20" y1="230" x2="580" y2="230" stroke="#5C3A21" strokeWidth="5" />
          <line x1="20" y1="242" x2="580" y2="242" stroke="#5C3A21" strokeWidth="5" />
          {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540].map((rx) => (
            <line key={rx} x1={rx} y1="224" x2={rx} y2="248" stroke="#B45309" strokeWidth="4" />
          ))}

          {/* Header */}
          <g transform="translate(300, 26)">
            <rect x="-190" y="0" width="380" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🚂 KERETA STRUKTUR KALIMAT PINTAR (S - P - O - K)
            </text>
          </g>

          {/* Gerbong 1: SUBJEK */}
          <g transform="translate(45, 90)">
            <rect x="0" y="20" width="115" height="75" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2.5" />
            <rect x="75" y="0" width="35" height="30" rx="4" fill="#38BDF8" stroke="#5C3A21" strokeWidth="2" />
            <text x="57" y="42" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">SUBJEK (S)</text>
            <text x="57" y="58" fill="#5C3A21" fontSize="9.5" textAnchor="middle">Pelaku Kalimat</text>
            <rect x="12" y="66" width="91" height="20" rx="4" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="57" y="80" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">🐱 Kucing Lucu</text>
            <circle cx="28" cy="100" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
            <circle cx="85" cy="100" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
          </g>

          <line x1="160" y1="160" x2="180" y2="160" stroke="#5C3A21" strokeWidth="5" />

          {/* Gerbong 2: PREDIKAT */}
          <g transform="translate(180, 100)">
            <rect x="0" y="10" width="115" height="75" rx="8" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="57" y="32" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">PREDIKAT (P)</text>
            <text x="57" y="48" fill="#5C3A21" fontSize="9.5" textAnchor="middle">Kata Kerja/Aksi</text>
            <rect x="12" y="56" width="91" height="20" rx="4" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="57" y="70" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">🐟 Makan</text>
            <circle cx="28" cy="90" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
            <circle cx="85" cy="90" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
          </g>

          <line x1="295" y1="160" x2="315" y2="160" stroke="#5C3A21" strokeWidth="5" />

          {/* Gerbong 3: OBJEK */}
          <g transform="translate(315, 100)">
            <rect x="0" y="10" width="115" height="75" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="57" y="32" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">OBJEK (O)</text>
            <text x="57" y="48" fill="#5C3A21" fontSize="9.5" textAnchor="middle">Benda Sasaran</text>
            <rect x="12" y="56" width="91" height="20" rx="4" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="57" y="70" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">🍽️ Ikan Goreng</text>
            <circle cx="28" cy="90" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
            <circle cx="85" cy="90" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
          </g>

          <line x1="430" y1="160" x2="450" y2="160" stroke="#5C3A21" strokeWidth="5" />

          {/* Gerbong 4: KETERANGAN */}
          <g transform="translate(450, 100)">
            <rect x="0" y="10" width="115" height="75" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="57" y="32" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">KETERANGAN</text>
            <text x="57" y="48" fill="#5C3A21" fontSize="9.5" textAnchor="middle">Tempat / Waktu</text>
            <rect x="12" y="56" width="91" height="20" rx="4" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="57" y="70" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">🏡 Di Dapur Pagi</text>
            <circle cx="28" cy="90" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
            <circle cx="85" cy="90" r="14" fill="#FFD3B6" stroke="#5C3A21" strokeWidth="2.5" />
          </g>

          <g transform="translate(150, 260)">
            <rect x="0" y="0" width="300" height="36" rx="8" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <text x="150" y="23" fill="#000000" fontSize="12" fontWeight="bold" textAnchor="middle">
              ✨ "Kucing lucu makan ikan goreng di dapur."
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 22. TATA SURYA: REVOLUSI PLANET (FRAME KAYU COZY)                    */}
      {/* ==================================================================== */}
      {type === 'solar_system' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          {/* Frame Kayu Cozy RadenWorld dengan Langit Malam Lembut */}
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#1E293B" stroke="#5C3A21" strokeWidth="3.5" />

          {/* Bintang-Bintang Gemerlap */}
          {[
            { cx: 40, cy: 30, r: 2 }, { cx: 120, cy: 270, r: 2 }, { cx: 280, cy: 30, r: 1.5 },
            { cx: 480, cy: 45, r: 2 }, { cx: 550, cy: 260, r: 2 }, { cx: 520, cy: 110, r: 1.5 },
            { cx: 70, cy: 190, r: 1.5 }, { cx: 350, cy: 295, r: 2 },
          ].map((st, sIdx) => (
            <circle key={sIdx} cx={st.cx} cy={st.cy} r={st.r} fill="#FDE047" style={{ animation: `solarPulse 2s infinite ${sIdx * 0.3}s` }} />
          ))}

          <g transform="translate(300, 160)">
            <circle cx="0" cy="0" r="48" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
            <circle cx="0" cy="0" r="76" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
            <circle cx="0" cy="0" r="110" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="4,4" />
            <circle cx="0" cy="0" r="148" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="4,4" />
            <circle cx="0" cy="0" r="195" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="5,5" />
            <circle cx="0" cy="0" r="245" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="6,6" />

            <circle cx="0" cy="0" r="28" fill="#F59E0B" stroke="#FDE047" strokeWidth="3" style={{ animation: 'solarPulse 3s infinite' }} />
            <text x="0" y="4" fill="#000000" fontSize="10" fontWeight="extrabold" textAnchor="middle">Matahari</text>

            <g style={{ animation: 'spin360 3s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="48" cy="0" r="5" fill="#94A3B8" stroke="#5C3A21" strokeWidth="1" />
            </g>
            <g style={{ animation: 'spin360 5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="76" cy="0" r="8" fill="#FCD34D" stroke="#5C3A21" strokeWidth="1" />
            </g>
            <g style={{ animation: 'spin360 7.5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="110" cy="0" r="10" fill="#38BDF8" stroke="#5C3A21" strokeWidth="1.5" />
              <circle cx="112" cy="-3" r="5" fill="#22C55E" />
            </g>
            <g style={{ animation: 'spin360 10.5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="148" cy="0" r="7" fill="#EF4444" stroke="#5C3A21" strokeWidth="1" />
            </g>
            <g style={{ animation: 'spin360 15s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="195" cy="0" r="17" fill="#D97706" stroke="#5C3A21" strokeWidth="1.5" />
            </g>
            <g style={{ animation: 'spin360 20s linear infinite', transformOrigin: '0px 0px' }}>
              <g transform="translate(245, 0) rotate(-20)">
                <ellipse cx="0" cy="0" rx="26" ry="7" stroke="#FDE047" strokeWidth="3" fill="none" />
                <circle cx="0" cy="0" r="13" fill="#EAB308" stroke="#5C3A21" strokeWidth="1.5" />
              </g>
            </g>
          </g>

          <g transform="translate(25, 20)">
            <rect x="0" y="0" width="220" height="38" rx="8" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <text x="12" y="18" fill="#000000" fontSize="11" fontWeight="bold">🪐 Revolusi Planet 60 FPS</text>
            <text x="12" y="30" fill="#5C3A21" fontSize="8.5">Planet mengitari pusat gravitasi surya</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 23. PAPAN TULIS KELAS CERIA DINAMIS (PANGGUNG EDUKASI 60FPS)         */}
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
          type !== 'math_arithmetic' &&
          type !== 'pancasila_shield' &&
          type !== 'spok_sentence' &&
          type !== 'solar_system')) && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          {/* Bingkai Papan Kayu Chunky RadenWorld */}
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3.5" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="2" />

          {/* Hiasan Bintang & Sparkles Berkelap-Kelip di Sudut */}
          <text x="25" y="32" fontSize="14" style={{ animation: 'solarPulse 1.8s infinite' }}>✨</text>
          <text x="565" y="32" fontSize="14" style={{ animation: 'solarPulse 2.2s infinite' }}>🌟</text>
          <text x="25" y="300" fontSize="14" style={{ animation: 'solarPulse 2s infinite' }}>⭐</text>
          <text x="565" y="300" fontSize="14" style={{ animation: 'solarPulse 1.5s infinite' }}>✨</text>

          {/* Header Dinamis Berdasarkan Topik */}
          <g transform="translate(300, 24)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="0" y="21" fill="#000000" fontSize="11.5" fontWeight="900" textAnchor="middle">
              🌟 {topic?.title ? topic.title.toUpperCase() : 'LEMBAR BELAJAR CERIA RADENWORLD'} 🌟
            </text>
            <text x="0" y="44" fill="#5C3A21" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              {topic?.badge ? `Topik: ${topic.badge} • ${topic.gradeName || 'Sekolah'} • ${topic.subjectName || 'Pelajaran'}` : 'Belajar Mudah & Menyenangkan di RadenWorld'}
            </text>
          </g>

          {/* 4 Kartu Edukasi Bergaya Claymorphism Interaktif Sesuai Step Video */}
          {/* Kartu 1: Pengenalan Konsep Dasar */}
          <g transform="translate(32, 78)">
            <rect
              x="0"
              y="0"
              width="262"
              height="96"
              rx="10"
              fill={step === 0 ? '#E0F2FE' : '#FFF8EA'}
              stroke={step === 0 ? '#0284C7' : '#5C3A21'}
              strokeWidth={step === 0 ? '3.5' : '2'}
              style={step === 0 ? { transformOrigin: '131px 48px', animation: 'solarPulse 2s infinite' } : undefined}
            />
            <rect x="0" y="0" width="262" height="26" rx="10" fill={step === 0 ? '#38BDF8' : '#BAE6FD'} stroke="#5C3A21" strokeWidth="1.5" />
            <text x="12" y="18" fill="#000000" fontSize="10.5" fontWeight="900">
              📖 1. Konsep Dasar {step === 0 && '▶ SEDANG DIJELASKAN'}
            </text>
            <text x="14" y="44" fill="#000000" fontSize="9.5" fontWeight="bold">Pengenalan Inti</text>
            <text x="14" y="60" fill="#1E293B" fontSize="8.5" fontWeight="medium">
              {topic?.summary ? topic.summary.slice(0, 48) : 'Memahami konsep dasar secara bertahap.'}
            </text>
            <text x="14" y="74" fill="#5C3A21" fontSize="8">
              {topic?.summary && topic.summary.length > 48 ? topic.summary.slice(48, 95) + '...' : 'Amati analogi nyata di sekitarmu!'}
            </text>
          </g>

          {/* Kartu 2: Contoh Nyata & Pengamatan */}
          <g transform="translate(306, 78)">
            <rect
              x="0"
              y="0"
              width="262"
              height="96"
              rx="10"
              fill={step === 1 ? '#FFEDD5' : '#FFF8EA'}
              stroke={step === 1 ? '#EA580C' : '#5C3A21'}
              strokeWidth={step === 1 ? '3.5' : '2'}
              style={step === 1 ? { transformOrigin: '131px 48px', animation: 'solarPulse 2s infinite' } : undefined}
            />
            <rect x="0" y="0" width="262" height="26" rx="10" fill={step === 1 ? '#FB923C' : '#FFAE6D'} stroke="#5C3A21" strokeWidth="1.5" />
            <text x="12" y="18" fill="#000000" fontSize="10.5" fontWeight="900">
              🔍 2. Contoh Nyata {step === 1 && '▶ SEDANG DIJELASKAN'}
            </text>
            <text x="14" y="44" fill="#000000" fontSize="9.5" fontWeight="bold">Ciri & Fenomena</text>
            <text x="14" y="60" fill="#1E293B" fontSize="8.5" fontWeight="medium">
              {topic?.points?.[0] ? topic.points[0].slice(0, 48) : 'Diterapkan pada benda dan kegiatan nyata.'}
            </text>
            <text x="14" y="74" fill="#5C3A21" fontSize="8">
              {topic?.points?.[0] && topic.points[0].length > 48 ? topic.points[0].slice(48, 95) + '...' : 'Pola yang teratur mudah diamati!'}
            </text>
          </g>

          {/* Kartu 3: Tips Pintar & Rumus Cepat */}
          <g transform="translate(32, 186)">
            <rect
              x="0"
              y="0"
              width="262"
              height="96"
              rx="10"
              fill={step === 2 ? '#D1FAE5' : '#FFF8EA'}
              stroke={step === 2 ? '#059669' : '#5C3A21'}
              strokeWidth={step === 2 ? '3.5' : '2'}
              style={step === 2 ? { transformOrigin: '131px 48px', animation: 'solarPulse 2s infinite' } : undefined}
            />
            <rect x="0" y="0" width="262" height="26" rx="10" fill={step === 2 ? '#34D399' : '#A8E6CF'} stroke="#5C3A21" strokeWidth="1.5" />
            <text x="12" y="18" fill="#000000" fontSize="10.5" fontWeight="900">
              💡 3. Tips Rumus Pintar {step === 2 && '▶ SEDANG DIJELASKAN'}
            </text>
            <text x="14" y="44" fill="#000000" fontSize="9.5" fontWeight="bold">Kunci Hafalan Cepat</text>
            <text x="14" y="60" fill="#065F46" fontSize="8.5" fontWeight="bold">
              {topic?.keyFormulaOrConcept ? topic.keyFormulaOrConcept.slice(0, 48) : (topic?.points?.[1] ? topic.points[1].slice(0, 48) : 'Gunakan trik jembatan keledai!')}
            </text>
            <text x="14" y="74" fill="#5C3A21" fontSize="8">
              {topic?.keyFormulaOrConcept && topic.keyFormulaOrConcept.length > 48 ? topic.keyFormulaOrConcept.slice(48, 95) + '...' : 'Membantumu menjawab soal ujian dengan cepat!'}
            </text>
          </g>

          {/* Kartu 4: Misi Kuis EXP Interaktif */}
          <g transform="translate(306, 186)">
            <rect
              x="0"
              y="0"
              width="262"
              height="96"
              rx="10"
              fill={step === 3 ? '#FEF9C3' : '#FFF8EA'}
              stroke={step === 3 ? '#CA8A04' : '#5C3A21'}
              strokeWidth={step === 3 ? '3.5' : '2'}
              style={step === 3 ? { transformOrigin: '131px 48px', animation: 'solarPulse 2s infinite' } : undefined}
            />
            <rect x="0" y="0" width="262" height="26" rx="10" fill={step === 3 ? '#FACC15' : '#FEF08A'} stroke="#5C3A21" strokeWidth="1.5" />
            <text x="12" y="18" fill="#000000" fontSize="10.5" fontWeight="900">
              🎯 4. Misi Kuis EXP {step === 3 && '▶ TANTANGAN AKTIF!'}
            </text>
            <text x="14" y="44" fill="#000000" fontSize="9.5" fontWeight="bold">Tantangan Uji Kemampuan</text>
            <text x="14" y="60" fill="#1E293B" fontSize="8.5" fontWeight="bold">
              {topic?.quiz?.question ? `❓ "${topic.quiz.question.slice(0, 46)}..."` : 'Jawab kuis berhadiah EXP!'}
            </text>
            <text x="14" y="76" fill="#059669" fontSize="8" fontWeight="bold">
              👉 Klik tab "Kuis Interaktif" di kanan untuk menjawab (+EXP)!
            </text>
          </g>

          {/* Baris Status Bawah: Indikator Babak Interaktif */}
          <g transform="translate(300, 296)">
            <text x="0" y="0" fill="#5C3A21" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              🎬 Babak {step + 1} dari 4 • Panggung Edukasi Interaktif 60 FPS RadenWorld
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};
