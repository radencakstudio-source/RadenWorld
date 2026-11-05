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
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.08); }
          30% { transform: scale(0.97); }
          45% { transform: scale(1.05); }
        }
        @keyframes electronFlow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hydroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes balanceTilt {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-2.5deg); }
          70% { transform: rotate(2.5deg); }
        }
        @keyframes flowPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
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
      {/* 23. ALJABAR: TIMBANGAN NERACA DUA LENGAN & KOORDINAT KARTESIUS        */}
      {/* ==================================================================== */}
      {type === 'cartesian_linear' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ⚖️ ALJABAR, PERSAMAAN LINEAR & TIMBANGAN NERACA 📈
            </text>
          </g>

          {/* Sisi Kiri: Timbangan Neraca Keseimbangan Aljabar (x + 3 = 7) */}
          <g transform="translate(160, 155)">
            {/* Tiang Neraca Kayu */}
            <rect x="-8" y="-10" width="16" height="110" rx="4" fill="#D4A373" stroke="#5C3A21" strokeWidth="2.5" />
            <polygon points="-45,100 45,100 25,80 -25,80" fill="#D4A373" stroke="#5C3A21" strokeWidth="2" />
            {/* Poros Neraca */}
            <circle cx="0" cy="-10" r="12" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="0" y="-6" fontSize="10" textAnchor="middle">⚖️</text>

            {/* Balok Lengan Bergerak (Seimbang atau Berayun Halus) */}
            <g style={{ transformOrigin: '0px -10px', animation: 'balanceTilt 4s ease-in-out infinite' }}>
              <line x1="-120" y1="-10" x2="120" y2="-10" stroke="#5C3A21" strokeWidth="5" strokeLinecap="round" />

              {/* Tali & Piringan Kiri: Kotak Misteri x + 3 */}
              <line x1="-110" y1="-10" x2="-110" y2="35" stroke="#5C3A21" strokeWidth="2" />
              <path d="M -140 35 L -80 35 L -90 48 L -130 48 Z" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
              {/* Kotak Misteri [ x ] */}
              <rect x="-135" y="8" width="24" height="24" rx="5" fill={step === 0 ? '#FEF08A' : '#FFAE6D'} stroke="#5C3A21" strokeWidth="2" />
              <text x="-123" y="24" fill="#000000" fontSize="13" fontWeight="900" textAnchor="middle">x</text>
              {/* 3 Balok Angka (+3) */}
              {[0, 1, 2].map((bi) => (
                <rect key={bi} x={-104 + bi * 8} y="14" width="7" height="18" rx="2" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
              ))}
              <text x="-110" y="62" fill="#000000" fontSize="9.5" fontWeight="bold" textAnchor="middle">Kiri: x + 3</text>

              {/* Tali & Piringan Kanan: 7 Balok Angka */}
              <line x1="110" y1="-10" x2="110" y2="35" stroke="#5C3A21" strokeWidth="2" />
              <path d="M 80 35 L 140 35 L 130 48 L 90 48 Z" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
              {/* 7 Balok Angka (=7) */}
              {[0, 1, 2, 3, 4, 5, 6].map((bi) => (
                <rect key={bi} x={85 + bi * 7} y="14" width="6" height="18" rx="2" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
              ))}
              <text x="110" y="62" fill="#000000" fontSize="9.5" fontWeight="bold" textAnchor="middle">Kanan: 7</text>
            </g>

            <rect x="-85" y="74" width="170" height="22" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="0" y="89" fill="#000000" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              ✨ x + 3 = 7 ➔ x = 7 - 3 = 4
            </text>
          </g>

          {/* Sisi Kanan: Bidang Kartesius & Rumus Linear */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Kartesius Mini */}
            <g transform="translate(30, 20)">
              {/* Grid */}
              {[-30, 0, 30].map((gx) => (
                <line key={gx} x1={55 + gx} y1="0" x2={55 + gx} y2="95" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
              ))}
              {[-30, 0, 30].map((gy) => (
                <line key={gy} x1="0" y1={48 + gy} x2="110" y2={48 + gy} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
              ))}
              {/* Sumbu X & Y */}
              <line x1="5" y1="48" x2="105" y2="48" stroke="#5C3A21" strokeWidth="2" />
              <line x1="55" y1="5" x2="55" y2="92" stroke="#5C3A21" strokeWidth="2" />
              <text x="108" y="52" fill="#5C3A21" fontSize="9" fontWeight="bold">X</text>
              <text x="55" y="0" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">Y</text>
              {/* Garis Linear Menyala */}
              <line x1="15" y1="82" x2="95" y2="14" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
              <circle cx="55" cy="48" r="3.5" fill="#EF4444" stroke="#5C3A21" strokeWidth="1" />
              <circle cx="75" cy="30" r="3.5" fill="#EF4444" stroke="#5C3A21" strokeWidth="1" />
              <text x="58" y="60" fill="#5C3A21" fontSize="7.5">O(0,0)</text>
              <text x="82" y="28" fill="#0284C7" fontSize="8" fontWeight="bold">(2,4)</text>
            </g>

            {/* Kotak Ringkasan Rumus */}
            <g transform="translate(12, 126)">
              <rect x="0" y="0" width="201" height="76" rx="8" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="100" y="18" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">
                📐 PERSAMAAN LINEAR
              </text>
              <text x="10" y="34" fill="#0284C7" fontSize="9.5" fontWeight="bold">
                • Garis: y = mx + c
              </text>
              <text x="10" y="48" fill="#5C3A21" fontSize="8.5">
                • Gradien m = Δy / Δx (Kemiringan)
              </text>
              <text x="10" y="64" fill="#166534" fontSize="8.5" fontWeight="bold">
                • SPLDV: 2x + y = 10 (Eliminasi/Substitusi)
              </text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 24. MATEMATIKA SMP: TEOREMA PYTHAGORAS a² + b² = c²                  */}
      {/* ==================================================================== */}
      {type === 'pythagoras' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              📐 TEOREMA PYTHAGORAS: a² + b² = c² (9 + 16 = 25) 📐
            </text>
          </g>

          {/* Pusat Segitiga Siku-Siku */}
          <g transform="translate(180, 160)">
            {/* Persegi di Sisi a (bawah/alas): 3x3 = 9 petak */}
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="75" height="75" rx="6" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2.5" />
              {[0, 1, 2].map((r) =>
                [0, 1, 2].map((c) => (
                  <rect key={`${r}-${c}`} x={c * 25 + 2} y={r * 25 + 2} width="21" height="21" rx="3" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1" />
                ))
              )}
              <rect x="12" y="26" width="51" height="22" rx="4" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="37" y="42" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">a² = 9</text>
            </g>

            {/* Persegi di Sisi b (kiri/tegak): 4x4 = 16 petak */}
            <g transform="translate(-100, -100)">
              <rect x="0" y="0" width="100" height="100" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2.5" />
              {[0, 1, 2, 3].map((r) =>
                [0, 1, 2, 3].map((c) => (
                  <rect key={`${r}-${c}`} x={c * 25 + 2} y={r * 25 + 2} width="21" height="21" rx="3" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1" />
                ))
              )}
              <rect x="22" y="38" width="56" height="24" rx="4" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="50" y="55" fill="#000000" fontSize="13" fontWeight="900" textAnchor="middle">b² = 16</text>
            </g>

            {/* Segitiga Siku-Siku Utama di Tengah */}
            <polygon points="0,0 75,0 0,-100" fill="#FEF08A" stroke="#5C3A21" strokeWidth="3.5" />
            {/* Simbol Siku-Siku */}
            <rect x="0" y="-14" width="14" height="14" fill="none" stroke="#5C3A21" strokeWidth="2" />

            {/* Label Panjang Sisi a, b, c */}
            <text x="38" y="-6" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">a = 3</text>
            <text x="12" y="-50" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">b = 4</text>
            <text x="54" y="-54" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">c = 5 ⭐</text>
          </g>

          {/* Sisi Kanan: Persegi Hipotenusa c² (25 Petak) & Tabel Tripel */}
          <g transform="translate(360, 66)">
            <rect x="0" y="0" width="220" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />

            {/* Persegi Hipotenusa c² = 25 */}
            <g transform="translate(15, 12)">
              <rect x="0" y="0" width="190" height="75" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
              <text x="95" y="24" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
                ✨ c² = a² + b² = 9 + 16 = 25
              </text>
              <text x="95" y="44" fill="#166534" fontSize="11" fontWeight="bold" textAnchor="middle">
                Hipotenusa c = √25 = 5 Satuan!
              </text>
              <text x="95" y="62" fill="#5C3A21" fontSize="9" textAnchor="middle">
                Terbukti akurat secara geometri!
              </text>
            </g>

            {/* Tabel Tripel Pythagoras Wajib Hafal */}
            <g transform="translate(15, 96)">
              <rect x="0" y="0" width="190" height="106" rx="8" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#000000" fontSize="10.5" fontWeight="900">
                🔢 TRIPEL PYTHAGORAS WAJIB:
              </text>
              <text x="10" y="36" fill="#0284C7" fontSize="9.5" fontWeight="bold">
                1. 3, 4, 5 (Kelipatan: 6, 8, 10 • 9, 12, 15)
              </text>
              <text x="10" y="52" fill="#166534" fontSize="9.5" fontWeight="bold">
                2. 5, 12, 13 (Kelipatan: 10, 24, 26)
              </text>
              <text x="10" y="68" fill="#D97706" fontSize="9.5" fontWeight="bold">
                3. 7, 24, 25 • 8, 15, 17
              </text>
              <text x="10" y="92" fill="#5C3A21" fontSize="8.5">
                💡 Sisi miring (c) selalu yang paling panjang!
              </text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 25. IPA SMP: STRUKTUR SEL & ORGANEL PABRIK KEHIDUPAN                 */}
      {/* ==================================================================== */}
      {type === 'cell_structure' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🔬 STRUKTUR SEL: PABRIK KEHIDUPAN & ORGANEL MIKROSKOPIS 🧬
            </text>
          </g>

          {/* Irisan Sel 3D Claymorphism di Kiri */}
          <g transform="translate(170, 165)">
            {/* Dinding Sel Luar (Hijau Mint Kaku) */}
            <ellipse cx="0" cy="0" rx="138" ry="98" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="3.5" />
            {/* Membran Sel Dalam */}
            <ellipse cx="0" cy="0" rx="124" ry="86" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Nukleus (Inti Sel di Tengah-Kiri) */}
            <circle cx="-35" cy="0" r="38" fill={step === 1 ? '#DDD6FE' : '#C4B5FD'} stroke="#5C3A21" strokeWidth="3" style={{ animation: 'solarPulse 2.5s infinite' }} />
            <circle cx="-35" cy="0" r="16" fill="#7C3AED" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="-35" y="4" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">DNA</text>
            <text x="-35" y="-44" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">NUKLEUS</text>

            {/* Mitokondria (Powerhouse ATP di Kanan Atas) */}
            <g transform="translate(45, -35)">
              <ellipse cx="0" cy="0" rx="26" ry="15" fill={step === 2 ? '#FEF08A' : '#FFAE6D'} stroke="#5C3A21" strokeWidth="2" />
              <path d="M -16 0 Q -8 -8, 0 0 T 16 0" stroke="#5C3A21" strokeWidth="2" fill="none" />
              <text x="0" y="22" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">Mitokondria (ATP)</text>
            </g>

            {/* Vakuola Air (Biru Langit di Kanan Bawah) */}
            <g transform="translate(48, 32)">
              <ellipse cx="0" cy="0" rx="30" ry="18" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
              <text x="0" y="4" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">Vakuola Air</text>
            </g>

            {/* Ribosom (Titik Emas Berpendar) */}
            {[-60, -20, 10, 80, -10].map((rx, ri) => (
              <circle key={ri} cx={rx} cy={-50 + ri * 25} r="3.5" fill="#FACC15" stroke="#5C3A21" strokeWidth="1" />
            ))}
          </g>

          {/* Sisi Kanan: Penjelasan Organel Interaktif sesuai Step */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="30" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="20" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              🏢 DAFTAR TUGAS ORGANEL
            </text>

            <g transform="translate(10, 40)">
              {[
                { name: '1. Membran & Dinding Sel', role: 'Gerbang pelindung selektif nutrisi', icon: '🛡️', s: 0 },
                { name: '2. Nukleus (Inti Sel)', role: 'Pusat komando & pewarisan DNA', icon: '🧬', s: 1 },
                { name: '3. Mitokondria (ATP)', role: 'Pabrik pembakar energi respirasi', icon: '⚡', s: 2 },
                { name: '4. Vakuola & Ribosom', role: 'Tempat sintesis protein & air', icon: '💧', s: 3 },
              ].map((item, idx) => (
                <g key={idx} transform={`translate(0, ${idx * 40})`}>
                  <rect
                    x="0"
                    y="0"
                    width="205"
                    height="35"
                    rx="6"
                    fill={step === item.s ? '#FEF08A' : '#FFFDF7'}
                    stroke={step === item.s ? '#D97706' : '#5C3A21'}
                    strokeWidth={step === item.s ? '2' : '1.5'}
                  />
                  <text x="8" y="16" fill="#000000" fontSize="9.5" fontWeight="900">
                    {item.icon} {item.name}
                  </text>
                  <text x="8" y="28" fill="#5C3A21" fontSize="8">
                    {item.role}
                  </text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 26. IPA SMP: HUKUM NEWTON & GAYA DINAMIKA GERAK (F = m · a)           */}
      {/* ==================================================================== */}
      {type === 'newton_dynamics' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🏎️ HUKUM NEWTON & GAYA GERAK: F = m · a 🍎
            </text>
          </g>

          {/* Lintasan Aspal Jalanan di Bagian Bawah */}
          <g transform="translate(20, 225)">
            <rect x="0" y="0" width="560" height="50" rx="8" fill="#334155" stroke="#5C3A21" strokeWidth="2.5" />
            {/* Marka Jalan Putus-Putus */}
            {[0, 80, 160, 240, 320, 400, 480].map((mx) => (
              <rect key={mx} x={mx + 10} y="22" width="45" height="6" rx="2" fill="#FFF8EA" />
            ))}
          </g>

          {/* Gerobak Kayu & Karakter Mendorong (Fisika Dinamis 60 FPS) */}
          <g transform="translate(60, 120)">
            {/* Karakter Kartun Pendorong */}
            <g transform="translate(25, 30)">
              <circle cx="0" cy="0" r="14" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
              <text x="0" y="5" fontSize="12" textAnchor="middle">🤠</text>
              <line x1="0" y1="14" x2="0" y2="45" stroke="#5C3A21" strokeWidth="3.5" />
              {/* Lengan Mendorong */}
              <line x1="0" y1="24" x2="35" y2="24" stroke="#5C3A21" strokeWidth="3" />
              <line x1="0" y1="45" x2="-10" y2="70" stroke="#5C3A21" strokeWidth="3" />
              <line x1="0" y1="45" x2="15" y2="70" stroke="#5C3A21" strokeWidth="3" />
            </g>

            {/* Vektor Gaya Dorong (Panah F) */}
            <g transform="translate(65, 45)">
              <line x1="0" y1="0" x2="45" y2="0" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="50,0 40,-6 40,6" fill="#EF4444" />
              <text x="24" y="-8" fill="#EF4444" fontSize="12" fontWeight="900" textAnchor="middle">
                F = 50 N
              </text>
            </g>

            {/* Badan Gerobak Kayu */}
            <g transform="translate(120, 25)">
              <rect x="0" y="0" width="115" height="55" rx="8" fill="#D4A373" stroke="#5C3A21" strokeWidth="2.5" />
              {/* Beban Balok Massa m */}
              <rect x="15" y="-20" width="85" height="26" rx="5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
              <text x="57" y="-3" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">
                Massa m = 10 kg
              </text>
              {/* 2 Roda Kayu Berputar 60 FPS */}
              <g transform="translate(25, 60)" style={{ transformOrigin: '0px 0px', animation: 'spin360 1.2s linear infinite' }}>
                <circle cx="0" cy="0" r="16" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
                <line x1="-16" y1="0" x2="16" y2="0" stroke="#5C3A21" strokeWidth="2" />
                <line x1="0" y1="-16" x2="0" y2="16" stroke="#5C3A21" strokeWidth="2" />
              </g>
              <g transform="translate(90, 60)" style={{ transformOrigin: '0px 0px', animation: 'spin360 1.2s linear infinite' }}>
                <circle cx="0" cy="0" r="16" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
                <line x1="-16" y1="0" x2="16" y2="0" stroke="#5C3A21" strokeWidth="2" />
                <line x1="0" y1="-16" x2="0" y2="16" stroke="#5C3A21" strokeWidth="2" />
              </g>
            </g>

            {/* Speedometer Analog Percepatan a */}
            <g transform="translate(270, 50)">
              <circle cx="0" cy="0" r="28" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
              <path d="M -18 10 A 20 20 0 1 1 18 10" fill="none" stroke="#E2E8F0" strokeWidth="4" />
              <line x1="0" y1="0" x2="12" y2="-14" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="0" cy="0" r="4" fill="#5C3A21" />
              <text x="0" y="38" fill="#000000" fontSize="9.5" fontWeight="900" textAnchor="middle">
                a = 5 m/s²
              </text>
            </g>
          </g>

          {/* Sisi Kanan: Panel 3 Hukum Newton */}
          <g transform="translate(390, 66)">
            <rect x="0" y="0" width="190" height="150" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="190" height="26" rx="10" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="95" y="18" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">
              📜 3 HUKUM UTAMA NEWTON
            </text>
            <g transform="translate(10, 36)">
              <text x="0" y="14" fill="#0284C7" fontSize="9.5" fontWeight="bold">I. Kelembaman (Inersia):</text>
              <text x="0" y="26" fill="#5C3A21" fontSize="8">Benda diam tetap diam (ΣF = 0)</text>

              <text x="0" y="46" fill="#166534" fontSize="9.5" fontWeight="bold">II. Percepatan Gerak:</text>
              <text x="0" y="58" fill="#5C3A21" fontSize="8">F = m · a ➔ a = F / m</text>

              <text x="0" y="78" fill="#D97706" fontSize="9.5" fontWeight="bold">III. Aksi - Reaksi:</text>
              <text x="0" y="90" fill="#5C3A21" fontSize="8">F aksi = -F reaksi (Dorong roket)</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 27. IPA SMP: SISTEM PEREDARAN DARAH & JANTUNG 4 RUANG               */}
      {/* ==================================================================== */}
      {type === 'blood_circulation' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ❤️ SISTEM PEREDARAN DARAH: JANTUNG & PEMBULUH DARAH 🩸
            </text>
          </g>

          {/* Paru-Paru (Atas) */}
          <g transform="translate(180, 72)">
            <rect x="-65" y="0" width="130" height="30" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="20" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              🫁 PARU-PARU (O₂ In)
            </text>
          </g>

          {/* Jantung 4 Ruang di Tengah (Denyut Harmonis 60 FPS) */}
          <g transform="translate(180, 168)" style={{ animation: 'heartBeat 1.2s ease-in-out infinite' }}>
            <rect x="-70" y="-45" width="140" height="90" rx="16" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />

            {/* Serambi Kanan & Bilik Kanan (Biru: Kaya CO2) */}
            <rect x="-64" y="-39" width="60" height="36" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="-34" y="-17" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">Serambi Kanan</text>
            <rect x="-64" y="3" width="60" height="36" rx="8" fill="#93C5FD" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="-34" y="25" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">Bilik Kanan</text>

            {/* Serambi Kiri & Bilik Kiri (Merah: Kaya O2) */}
            <rect x="4" y="-39" width="60" height="36" rx="8" fill="#FECDD3" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="34" y="-17" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">Serambi Kiri</text>
            <rect x="4" y="3" width="60" height="36" rx="8" fill="#FDA4AF" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="34" y="25" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">Bilik Kiri</text>

            <circle cx="0" cy="0" r="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="0" y="4" fontSize="10" textAnchor="middle">❤️</text>
          </g>

          {/* Seluruh Tubuh (Bawah) */}
          <g transform="translate(180, 260)">
            <rect x="-65" y="0" width="130" height="30" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="20" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              🏃 SELURUH TUBUH
            </text>
          </g>

          {/* Aliran Pipa Pembuluh Darah & Partikel Darah Mengalir */}
          {/* Pipa Kiri (Vena: Biru) */}
          <line x1="110" y1="102" x2="110" y2="260" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,6" style={{ animation: 'electronFlow 1.5s linear infinite' }} />
          {/* Pipa Kanan (Aorta: Merah) */}
          <line x1="250" y1="102" x2="250" y2="260" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,6" style={{ animation: 'electronFlow 1.5s linear infinite' }} />

          {/* Sisi Kanan: Panduan Golongan Darah & Sirkulasi */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="225" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              🩸 SIRKULASI BESAR & KECIL
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="16" fill="#0284C7" fontSize="9.5" fontWeight="900">1. Peredaran Kecil (Paru):</text>
              <text x="8" y="30" fill="#5C3A21" fontSize="8">Bilik Kanan ➔ Paru-Paru ➔ Serambi Kiri</text>
              <text x="8" y="42" fill="#166534" fontSize="8" fontWeight="bold">(Pertukaran gas CO₂ jadi O₂)</text>

              <rect x="0" y="58" width="205" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="74" fill="#EF4444" fontSize="9.5" fontWeight="900">2. Peredaran Besar (Tubuh):</text>
              <text x="8" y="88" fill="#5C3A21" fontSize="8">Bilik Kiri ➔ Aorta ➔ Tubuh ➔ Serambi Kanan</text>
              <text x="8" y="100" fill="#D97706" fontSize="8" fontWeight="bold">(Membawa nutrisi & O₂ ke sel raga)</text>

              <rect x="0" y="116" width="205" height="65" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="132" fill="#000000" fontSize="9.5" fontWeight="900">3. Golongan Darah ABO:</text>
              <text x="8" y="146" fill="#5C3A21" fontSize="8">• Gol O: Donor Universal (Bisa beri ke semua)</text>
              <text x="8" y="158" fill="#5C3A21" fontSize="8">• Gol AB: Resipien Universal (Bisa terima semua)</text>
              <text x="8" y="170" fill="#166534" fontSize="8" fontWeight="bold">• Eritrosit: Sel darah merah pengikat O₂</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 28. IPA SMP: TEKANAN ZAT & HUKUM PASCAL BEJANA HIDROLIK             */}
      {/* ==================================================================== */}
      {type === 'pressure_pascal' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🚗 TEKANAN ZAT & HUKUM PASCAL: F₁ / A₁ = F₂ / A₂ 💧
            </text>
          </g>

          {/* Dongkrak Bejana U Hidrolik di Kiri */}
          <g transform="translate(40, 60)">
            {/* Bejana U Kaca/Logam */}
            <path
              d="M 60 70 L 60 190 Q 60 215, 90 215 L 230 215 Q 260 215, 260 190 L 260 70 L 190 70 L 190 170 Q 190 180, 180 180 L 120 180 Q 110 180, 110 170 L 110 70 Z"
              fill="#BAE6FD"
              stroke="#5C3A21"
              strokeWidth="3"
            />
            {/* Cairan Fluida Hidrolik Bergelombang */}
            <rect x="63" y="140" width="45" height="72" fill="#38BDF8" fillOpacity="0.7" />
            <rect x="108" y="180" width="84" height="32" fill="#38BDF8" fillOpacity="0.7" />
            <rect x="192" y="115" width="66" height="97" fill="#38BDF8" fillOpacity="0.7" />

            {/* Piston Kecil A1 (Ditekan F1) */}
            <rect x="63" y="125" width="45" height="16" rx="3" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <line x1="85" y1="80" x2="85" y2="122" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="85,125 79,112 91,112" fill="#EF4444" />
            <text x="85" y="72" fill="#EF4444" fontSize="11" fontWeight="900" textAnchor="middle">F₁ = 100 N</text>
            <text x="85" y="155" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">A₁ Kecil</text>

            {/* Piston Besar A2 (Mengangkat Mobil Merah 60 FPS) */}
            <g style={{ animation: 'hydroFloat 2.5s ease-in-out infinite' }}>
              <rect x="192" y="100" width="66" height="18" rx="3" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
              {/* Mobil Merah RadenWorld Terangkat */}
              <g transform="translate(195, 60)">
                <rect x="5" y="15" width="50" height="24" rx="6" fill="#EF4444" stroke="#5C3A21" strokeWidth="2" />
                <rect x="15" y="5" width="30" height="16" rx="4" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
                <circle cx="16" cy="38" r="6" fill="#334155" stroke="#5C3A21" strokeWidth="1.5" />
                <circle cx="44" cy="38" r="6" fill="#334155" stroke="#5C3A21" strokeWidth="1.5" />
              </g>
              <line x1="225" y1="100" x2="225" y2="45" stroke="#166534" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="225,40 219,53 231,53" fill="#166534" />
              <text x="225" y="32" fill="#166534" fontSize="11" fontWeight="900" textAnchor="middle">F₂ = 5000 N 🚗</text>
            </g>
            <text x="225" y="132" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">A₂ Besar</text>
          </g>

          {/* Sisi Kanan: Rumus Pascal & Tekanan Hidrostatis */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              💡 RUMUS HUKUM PASCAL
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="48" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="102" y="20" fill="#0284C7" fontSize="12" fontWeight="900" textAnchor="middle">
                F₁ / A₁ = F₂ / A₂
              </text>
              <text x="102" y="38" fill="#5C3A21" fontSize="8.5" textAnchor="middle">
                Tekanan diteruskan ke segala arah sama besar
              </text>

              <rect x="0" y="56" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#166534" fontSize="10" fontWeight="bold">Tekanan Zat Padat:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• P = F / A (Makin runcing makin tajam)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Satuan: N/m² atau Pascal (Pa)</text>

              <rect x="0" y="116" width="205" height="56" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#D97706" fontSize="10" fontWeight="bold">Tekanan Hidrostatis Cair:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• P = ρ · g · h</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Makin dalam penyelam, tekanan makin kuat!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 29. IPA SMP: RANGKAIAN LISTRIK DINAMIS & HUKUM OHM                   */}
      {/* ==================================================================== */}
      {type === 'electric_circuit' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ⚡ RANGKAIAN LISTRIK DINAMIS & HUKUM OHM (V = I · R) 💡
            </text>
          </g>

          {/* Sirkuit Tertutup Claymorphism di Kiri */}
          <g transform="translate(45, 66)">
            {/* Kawat Tembaga Segiempat */}
            <rect x="35" y="25" width="240" height="155" rx="12" fill="none" stroke="#D4A373" strokeWidth="8" />
            {/* Aliran Elektron Biru Menyala 60 FPS */}
            <rect
              x="35"
              y="25"
              width="240"
              height="155"
              rx="12"
              fill="none"
              stroke="#0284C7"
              strokeWidth="4"
              strokeDasharray="8,8"
              style={{ animation: 'electronFlow 1.8s linear infinite' }}
            />

            {/* Baterai Silinder di Sisi Kiri */}
            <g transform="translate(35, 102)">
              <rect x="-14" y="-30" width="28" height="60" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
              <rect x="-14" y="-30" width="28" height="20" rx="6" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="0" y="-15" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">+</text>
              <rect x="-14" y="10" width="28" height="20" rx="6" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="0" y="25" fill="#000000" fontSize="14" fontWeight="900" textAnchor="middle">-</text>
              <text x="-25" y="5" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">12V</text>
            </g>

            {/* Saklar Pisau Emas di Sisi Atas (Tertutup ON) */}
            <g transform="translate(155, 25)">
              <circle cx="-25" cy="0" r="5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
              <circle cx="25" cy="0" r="5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
              <line x1="-23" y1="0" x2="23" y2="0" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
              <rect x="-24" y="-20" width="48" height="16" rx="4" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1" />
              <text x="0" y="-9" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">SAKLAR ON</text>
            </g>

            {/* Resistor Hambatan R di Sisi Bawah */}
            <g transform="translate(155, 180)">
              <rect x="-35" y="-12" width="70" height="24" rx="5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
              <path d="M -25 0 L -18 -6 L -10 6 L -2 -6 L 6 6 L 14 -6 L 22 0" fill="none" stroke="#5C3A21" strokeWidth="2" />
              <text x="0" y="24" fill="#000000" fontSize="9" fontWeight="bold" textAnchor="middle">Resistor R = 4 Ω</text>
            </g>

            {/* Lampu Pijar Bohlam di Sisi Kanan (Menyala Berpendar 60 FPS) */}
            <g transform="translate(275, 102)">
              {/* Berkas Sinar Pancaran Glow */}
              <circle cx="0" cy="0" r="32" fill="#FEF08A" fillOpacity="0.4" style={{ animation: 'solarPulse 1.8s infinite' }} />
              <circle cx="0" cy="0" r="22" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2.5" />
              <text x="0" y="7" fontSize="18" textAnchor="middle">💡</text>
              <text x="35" y="4" fill="#000000" fontSize="9" fontWeight="bold">MENYALA</text>
            </g>
          </g>

          {/* Sisi Kanan: Panduan Hukum Ohm & Rangkaian */}
          <g transform="translate(365, 66)">
            <rect x="0" y="0" width="205" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="205" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="102" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📐 HUKUM OHM & SIRKUIT
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="185" height="46" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="92" y="20" fill="#0284C7" fontSize="13" fontWeight="900" textAnchor="middle">
                V = I × R
              </text>
              <text x="92" y="36" fill="#5C3A21" fontSize="8.5" textAnchor="middle">
                Kuat Arus: I = V / R = 12 / 4 = 3 Ampere
              </text>

              <rect x="0" y="54" width="185" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="18" fill="#166534" fontSize="9.5" fontWeight="bold">Rangkaian Seri:</text>
              <text x="8" y="32" fill="#5C3A21" fontSize="8">• Arus I sama di setiap titik</text>
              <text x="8" y="44" fill="#5C3A21" fontSize="8">• Hambatan bertambah: R total = R1 + R2</text>

              <rect x="0" y="114" width="185" height="58" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="18" fill="#D97706" fontSize="9.5" fontWeight="bold">Rangkaian Paralel:</text>
              <text x="8" y="32" fill="#5C3A21" fontSize="8">• Tegangan V sama di setiap cabang</text>
              <text x="8" y="44" fill="#5C3A21" fontSize="8">• 1 alat mati, alat lain tetap menyala!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 30. INFORMATIKA SMP: FLOWCHART LOGIKA & ALGORITMA                    */}
      {/* ==================================================================== */}
      {type === 'flowchart_logic' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              💻 ALGORITMA, FLOWCHART & LOGIKA KOMPUTASIONAL 🔄
            </text>
          </g>

          {/* Flowchart Balok Vertikal di Kiri */}
          <g transform="translate(180, 56)">
            {/* 1. Start (Oval Mint) */}
            <ellipse cx="0" cy="15" rx="60" ry="16" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="0" y="20" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">🟢 MULAI (Start)</text>

            <line x1="0" y1="31" x2="0" y2="48" stroke="#5C3A21" strokeWidth="3" />
            <polygon points="0,52 -4,44 4,44" fill="#5C3A21" />

            {/* 2. Input Nilai (Jajar Genjang Biru) */}
            <polygon points="-65,75 55,75 75,52 -45,52" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="5" y="68" fill="#000000" fontSize="10.5" fontWeight="bold" textAnchor="middle">Input Nilai Ujian (N)</text>

            <line x1="5" y1="75" x2="5" y2="92" stroke="#5C3A21" strokeWidth="3" />
            <polygon points="5,96 1,88 9,88" fill="#5C3A21" />

            {/* 3. Decision (Belah Ketupat Kuning) */}
            <polygon points="5,98 75,128 5,158 -65,128" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="5" y="132" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">Nilai ≥ 75?</text>

            {/* Cabang Kanan (YA) */}
            <line x1="75" y1="128" x2="115" y2="128" stroke="#166534" strokeWidth="2.5" />
            <text x="95" y="122" fill="#166534" fontSize="10" fontWeight="900">YA</text>
            <rect x="115" y="112" width="75" height="32" rx="6" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="152" y="132" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">LULUS 🎉</text>

            {/* Cabang Kiri (TIDAK) */}
            <line x1="-65" y1="128" x2="-105" y2="128" stroke="#EF4444" strokeWidth="2.5" />
            <text x="-90" y="122" fill="#EF4444" fontSize="10" fontWeight="900">TIDAK</text>
            <rect x="-180" y="112" width="75" height="32" rx="6" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="-142" y="132" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">REMIDI 📚</text>

            {/* Garis Menuju Selesai */}
            <path d="M 152 144 L 152 185 L 50 185" stroke="#5C3A21" strokeWidth="2.5" fill="none" />
            <path d="M -142 144 L -142 185 L -40 185" stroke="#5C3A21" strokeWidth="2.5" fill="none" />

            {/* 4. End (Oval Krem) */}
            <ellipse cx="5" cy="185" rx="55" ry="16" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="5" y="190" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">🏁 SELESAI (End)</text>
          </g>

          {/* Sisi Kanan: Panduan Simbol Standar Flowchart */}
          <g transform="translate(365, 66)">
            <rect x="0" y="0" width="205" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="205" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="102" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📚 SIMBOL STANDAR FLOWCHART
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="185" height="38" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="16" fill="#166534" fontSize="9.5" fontWeight="900">1. Oval (Terminator):</text>
              <text x="8" y="28" fill="#5C3A21" fontSize="8">Titik Mulai (Start) dan Selesai (End)</text>

              <rect x="0" y="44" width="185" height="38" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="16" fill="#0284C7" fontSize="9.5" fontWeight="900">2. Jajar Genjang:</text>
              <text x="8" y="28" fill="#5C3A21" fontSize="8">Input masukan data & Output keluaran</text>

              <rect x="0" y="88" width="185" height="38" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="16" fill="#D97706" fontSize="9.5" fontWeight="900">3. Belah Ketupat (Decision):</text>
              <text x="8" y="28" fill="#5C3A21" fontSize="8">Percabangan kondisi logika (Ya / Tidak)</text>

              <rect x="0" y="132" width="185" height="38" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="16" fill="#7C3AED" fontSize="9.5" fontWeight="900">4. Persegi Panjang:</text>
              <text x="8" y="28" fill="#5C3A21" fontSize="8">Proses eksekusi formula perhitungan</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 31. IPA SMP: GETARAN, GELOMBANG TRANSVERSAL & BUNYI                  */}
      {/* ==================================================================== */}
      {type === 'wave_sound' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🌊 GETARAN, GELOMBANG SINUS & CEPAT RAMBAT: v = λ · f 🎵
            </text>
          </g>

          {/* Gelombang Sinus Transversal di Kiri */}
          <g transform="translate(30, 80)">
            {/* Garis Kesetimbangan */}
            <line x1="20" y1="80" x2="310" y2="80" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4,4" />
            <text x="315" y="84" fill="#64748B" fontSize="8.5">Setimbang</text>

            {/* Kurva Gelombang Sinus Transversal */}
            <path
              d="M 30 80 Q 75 20, 120 80 T 210 80 T 300 80"
              fill="none"
              stroke="#0284C7"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Puncak Bukit 1 */}
            <circle cx="75" cy="20" r="6" fill="#EF4444" stroke="#5C3A21" strokeWidth="2" />
            <text x="75" y="10" fill="#EF4444" fontSize="10.5" fontWeight="900" textAnchor="middle">Puncak Bukit</text>

            {/* Lembah Dasar 1 */}
            <circle cx="165" cy="140" r="6" fill="#166534" stroke="#5C3A21" strokeWidth="2" />
            <text x="165" y="156" fill="#166534" fontSize="10.5" fontWeight="900" textAnchor="middle">Lembah Gelombang</text>

            {/* Garis Ukur Amplitudo A */}
            <line x1="75" y1="20" x2="75" y2="80" stroke="#EF4444" strokeWidth="2" strokeDasharray="3,3" />
            <text x="92" y="55" fill="#EF4444" fontSize="9" fontWeight="bold">Amplitudo A</text>

            {/* Garis Ukur Panjang Gelombang Lambda λ */}
            <line x1="30" y1="120" x2="210" y2="120" stroke="#D97706" strokeWidth="2.5" />
            <polygon points="30,120 40,116 40,124" fill="#D97706" />
            <polygon points="210,120 200,116 200,124" fill="#D97706" />
            <text x="120" y="112" fill="#D97706" fontSize="10" fontWeight="900" textAnchor="middle">
              1 Panjang Gelombang (λ = 1 Bukit + 1 Lembah)
            </text>
          </g>

          {/* Sisi Kanan: Rumus Gelombang & Frekuensi */}
          <g transform="translate(365, 66)">
            <rect x="0" y="0" width="205" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="205" height="28" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="102" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📏 FORMULA FISIKA GELOMBANG
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="185" height="46" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="92" y="20" fill="#0284C7" fontSize="13" fontWeight="900" textAnchor="middle">
                v = λ × f
              </text>
              <text x="92" y="36" fill="#5C3A21" fontSize="8.5" textAnchor="middle">
                Cepat Rambat (m/s) = Lambda × Frekuensi
              </text>

              <rect x="0" y="54" width="185" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="18" fill="#166534" fontSize="9.5" fontWeight="bold">Frekuensi (f) & Periode (T):</text>
              <text x="8" y="32" fill="#5C3A21" fontSize="8">• f = n / t (Banyak gelombang / detik, Hz)</text>
              <text x="8" y="44" fill="#5C3A21" fontSize="8">• T = 1 / f (Waktu untuk 1 gelombang, detik)</text>

              <rect x="0" y="114" width="185" height="58" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="18" fill="#D97706" fontSize="9.5" fontWeight="bold">Sifat Bunyi & Resonansi:</text>
              <text x="8" y="32" fill="#5C3A21" fontSize="8">• Bunyi merambat lewat medium udara</text>
              <text x="8" y="44" fill="#5C3A21" fontSize="8">• Bunyi TIDAK bisa merambat di hampa udara!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 32. IPA SMP: PEWARISAN SIFAT (HUKUM MENDEL & HELIKS DNA)             */}
      {/* ==================================================================== */}
      {type === 'dna_helix' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#DDD6FE" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🧬 PEWARISAN SIFAT: HUKUM MENDEL & HELIKS DNA 🔬
            </text>
          </g>

          {/* Heliks Ganda DNA di Kiri */}
          <g transform="translate(45, 66)">
            {/* Untaian Ganda */}
            <path d="M 20 50 Q 80 130, 140 50 T 260 50" stroke="#0284C7" strokeWidth="4.5" fill="none" />
            <path d="M 20 150 Q 80 70, 140 150 T 260 150" stroke="#EF4444" strokeWidth="4.5" fill="none" />
            {/* Anak Tangga Basa Nitrogen */}
            {[40, 70, 100, 130, 160, 190, 220, 240].map((bx, idx) => {
              const y1 = 50 + Math.sin(idx * 0.8) * 35;
              const y2 = 150 - Math.sin(idx * 0.8) * 35;
              return (
                <g key={bx}>
                  <line x1={bx} y1={y1} x2={bx} y2={(y1 + y2) / 2} stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1={bx} y1={(y1 + y2) / 2} x2={bx} y2={y2} stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx={bx} cy={(y1 + y2) / 2} r="3" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1" />
                </g>
              );
            })}
            <rect x="40" y="175" width="200" height="26" rx="6" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="140" y="192" fill="#000000" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              Pasangan Basa: A = T • G ≡ C
            </text>
          </g>

          {/* Sisi Kanan: Hukum Mendel Monohibrid & Dihibrid */}
          <g transform="translate(365, 66)">
            <rect x="0" y="0" width="205" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="205" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="102" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              🌱 HUKUM PEWARISAN MENDEL
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="185" height="48" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="18" fill="#166534" fontSize="9.5" fontWeight="900">1. Monohibrid (1 Sifat Beda):</text>
              <text x="8" y="32" fill="#5C3A21" fontSize="8.5">• Rasio Fenotipe F2 = 3 : 1</text>
              <text x="8" y="42" fill="#5C3A21" fontSize="8.5">• Contoh: Bunga Merah vs Putih</text>

              <rect x="0" y="56" width="185" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="18" fill="#0284C7" fontSize="9.5" fontWeight="900">2. Dihibrid (2 Sifat Beda):</text>
              <text x="8" y="32" fill="#5C3A21" fontSize="8.5">• Rasio Fenotipe F2 = 9 : 3 : 3 : 1</text>
              <text x="8" y="44" fill="#5C3A21" fontSize="8.5">• Bulat Kuning vs Kerut Hijau</text>

              <rect x="0" y="116" width="185" height="56" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="8" y="18" fill="#7C3AED" fontSize="9.5" fontWeight="900">3. Istilah Kunci:</text>
              <text x="8" y="32" fill="#5C3A21" fontSize="8.5">• Genotipe: Susunan gen (BB, Bb, bb)</text>
              <text x="8" y="44" fill="#5C3A21" fontSize="8.5">• Fenotipe: Sifat tampak fisik kasat mata</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 33. IPS & SEJARAH SMP: GARIS WAKTU KEJAYAAN NUSANTARA                */}
      {/* ==================================================================== */}
      {type === 'history_timeline' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🏛️ GARIS WAKTU SEJARAH & KEMERDEKAAN NUSANTARA 🇮🇩
            </text>
          </g>

          {/* Garis Horizontal Emas Utama */}
          <line x1="50" y1="160" x2="550" y2="160" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />

          {/* 5 Tonggak Sejarah Bergaya Clay */}
          {[
            { year: '400 M', name: 'Kutai & Taruma', role: 'Prasasti Yupa Batu', x: 80, isTop: true, color: '#FFAE6D', icon: '📜' },
            { year: '683 M', name: 'Sriwijaya', role: 'Kemaritiman Dunia', x: 190, isTop: false, color: '#BAE6FD', icon: '⛵' },
            { year: '1293 M', name: 'Majapahit', role: 'Sumpah Palapa Gajah Mada', x: 300, isTop: true, color: '#A8E6CF', icon: '👑' },
            { year: '1928', name: 'Sumpah Pemuda', role: 'Satu Nusa, Bangsa, Bahasa', x: 410, isTop: false, color: '#FEF08A', icon: '🔥' },
            { year: '1945', name: 'Proklamasi 🇮🇩', role: 'Kemerdekaan RI 17 Agustus', x: 520, isTop: true, color: '#FDA4AF', icon: '🎉' },
          ].map((m, mi) => (
            <g key={mi} transform={`translate(${m.x}, 160)`}>
              <circle cx="0" cy="0" r="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="6" fill="#D97706" />
              <line x1="0" y1={m.isTop ? -14 : 14} x2="0" y2={m.isTop ? -45 : 45} stroke="#5C3A21" strokeWidth="2" strokeDasharray="3,3" />

              <g transform={`translate(-48, ${m.isTop ? -95 : 45})`}>
                <rect x="0" y="0" width="96" height="46" rx="6" fill={m.color} stroke="#5C3A21" strokeWidth="1.5" />
                <text x="48" y="16" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">
                  {m.icon} {m.year}
                </text>
                <text x="48" y="28" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                  {m.name}
                </text>
                <text x="48" y="40" fill="#5C3A21" fontSize="7.5" textAnchor="middle">
                  {m.role}
                </text>
              </g>
            </g>
          ))}
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 34. MATEMATIKA SMA: TRIGONOMETRI & GELOMBANG SINUSOIDAL              */}
      {/* ==================================================================== */}
      {type === 'trigonometry_wave' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              📐 TRIGONOMETRI: LINGKARAN SATUAN & SUDUT ISTIMEWA 🌊
            </text>
          </g>

          {/* Lingkaran Satuan Trigonometri (R = 1) di Kiri */}
          <g transform="translate(170, 165)">
            {/* Sumbu Salib Koordinat */}
            <line x1="-85" y1="0" x2="85" y2="0" stroke="#5C3A21" strokeWidth="2" />
            <line x1="0" y1="-85" x2="0" y2="85" stroke="#5C3A21" strokeWidth="2" />
            <text x="88" y="4" fill="#5C3A21" fontSize="9" fontWeight="bold">X</text>
            <text x="0" y="-88" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">Y</text>

            {/* Lingkaran R = 1 Unit */}
            <circle cx="0" cy="0" r="65" fill="#FFF8EA" stroke="#0284C7" strokeWidth="3" />

            {/* Jari-Jari Sudut θ = 45° */}
            <line x1="0" y1="0" x2="46" y2="-46" stroke="#5C3A21" strokeWidth="2.5" />
            <circle cx="46" cy="-46" r="4.5" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />

            {/* Proyeksi Sinus (Vertikal: Merah) & Kosinus (Horizontal: Biru) */}
            <line x1="46" y1="0" x2="46" y2="-46" stroke="#EF4444" strokeWidth="3" strokeDasharray="2,2" />
            <line x1="0" y1="0" x2="46" y2="0" stroke="#0284C7" strokeWidth="3" />
            <text x="52" y="-22" fill="#EF4444" fontSize="9" fontWeight="bold">sin θ</text>
            <text x="23" y="14" fill="#0284C7" fontSize="9" fontWeight="bold" textAnchor="middle">cos θ</text>
            <text x="14" y="-8" fill="#D97706" fontSize="8" fontWeight="bold">θ = 45°</text>

            <rect x="-80" y="74" width="160" height="20" rx="5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="0" y="88" fill="#000000" fontSize="9" fontWeight="bold" textAnchor="middle">
              sin² θ + cos² θ = 1 (Identitas Utama)
            </text>
          </g>

          {/* Sisi Kanan: Tabel Sudut Istimewa & Gelombang Sinus */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📊 TABEL SUDUT ISTIMEWA
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="100" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              {/* Header Kolom */}
              <text x="35" y="18" fill="#000000" fontSize="9.5" fontWeight="900" textAnchor="middle">Sudut</text>
              <text x="85" y="18" fill="#EF4444" fontSize="9.5" fontWeight="900" textAnchor="middle">sin θ</text>
              <text x="135" y="18" fill="#0284C7" fontSize="9.5" fontWeight="900" textAnchor="middle">cos θ</text>
              <text x="180" y="18" fill="#166534" fontSize="9.5" fontWeight="900" textAnchor="middle">tan θ</text>
              <line x1="10" y1="24" x2="195" y2="24" stroke="#5C3A21" strokeWidth="1" />

              {[
                { deg: '0°', s: '0', c: '1', t: '0' },
                { deg: '30°', s: '1/2', c: '½√3', t: '⅓√3' },
                { deg: '45°', s: '½√2', c: '½√2', t: '1' },
                { deg: '60°', s: '½√3', c: '1/2', t: '√3' },
                { deg: '90°', s: '1', c: '0', t: '∞' },
              ].map((row, idx) => (
                <g key={row.deg} transform={`translate(0, ${38 + idx * 14})`}>
                  <text x="35" y="0" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">{row.deg}</text>
                  <text x="85" y="0" fill="#EF4444" fontSize="8.5" textAnchor="middle">{row.s}</text>
                  <text x="135" y="0" fill="#0284C7" fontSize="8.5" textAnchor="middle">{row.c}</text>
                  <text x="180" y="0" fill="#166534" fontSize="8.5" textAnchor="middle">{row.t}</text>
                </g>
              ))}

              <rect x="0" y="108" width="205" height="62" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="124" fill="#000000" fontSize="9.5" fontWeight="bold">Aturan Sinus & Kosinus:</text>
              <text x="10" y="138" fill="#5C3A21" fontSize="8.5">• a / sin A = b / sin B = c / sin C</text>
              <text x="10" y="152" fill="#5C3A21" fontSize="8.5">• a² = b² + c² - 2bc · cos A</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 35. MATEMATIKA SMA: KALKULUS TURUNAN (f') & INTEGRAL TENTU           */}
      {/* ==================================================================== */}
      {type === 'calculus_integral_derivative' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              📈 KALKULUS: TURUNAN (f') & INTEGRAL TENTU (∫ f(x) dx) 🟩
            </text>
          </g>

          {/* Grafik Kurva & Area Arsiran Integral di Kiri */}
          <g transform="translate(35, 66)">
            <rect x="0" y="0" width="285" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            
            {/* Sumbu X dan Y */}
            <line x1="30" y1="180" x2="265" y2="180" stroke="#5C3A21" strokeWidth="2" />
            <line x1="45" y1="20" x2="45" y2="195" stroke="#5C3A21" strokeWidth="2" />
            <text x="268" y="184" fill="#5C3A21" fontSize="9" fontWeight="bold">X</text>
            <text x="45" y="14" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">Y</text>

            {/* Arsiran Integral di Bawah Kurva dari a ke b */}
            <path d="M 85 180 L 85 125 Q 145 60, 205 105 L 205 180 Z" fill="#A8E6CF" fillOpacity="0.6" stroke="none" />
            <line x1="85" y1="180" x2="85" y2="125" stroke="#166534" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="205" y1="180" x2="205" y2="105" stroke="#166534" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="85" y="194" fill="#166534" fontSize="10" fontWeight="bold" textAnchor="middle">a</text>
            <text x="205" y="194" fill="#166534" fontSize="10" fontWeight="bold" textAnchor="middle">b</text>
            <text x="145" y="155" fill="#000000" fontSize="9.5" fontWeight="900" textAnchor="middle">Luas = ∫[a➔b] f(x) dx</text>

            {/* Kurva Parabola Halus f(x) */}
            <path d="M 55 165 Q 145 50, 245 160" fill="none" stroke="#0284C7" strokeWidth="3.5" />

            {/* Garis Singgung Turunan f'(x) Mendatar di Puncak */}
            <line x1="100" y1="78" x2="190" y2="78" stroke="#EF4444" strokeWidth="2.5" />
            <circle cx="145" cy="78" r="4.5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="145" y="68" fill="#EF4444" fontSize="9" fontWeight="900" textAnchor="middle">f'(x) = 0 (Stasioner Puncak)</text>
          </g>

          {/* Sisi Kanan: Rumus Turunan & Integral */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📐 ATURAN DASAR KALKULUS
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#EF4444" fontSize="10" fontWeight="900">1. Turunan (Diferensial):</text>
              <text x="10" y="32" fill="#0284C7" fontSize="9.5" fontWeight="bold">• d(xⁿ)/dx = n · xⁿ⁻¹</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Gradien garis singgung m = f'(x)</text>

              <rect x="0" y="60" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#166534" fontSize="10" fontWeight="900">2. Integral (Antiturunan):</text>
              <text x="10" y="32" fill="#166534" fontSize="9.5" fontWeight="bold">• ∫ xⁿ dx = (1/(n+1)) xⁿ⁺¹ + C</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Menghitung luas & volume benda putar</text>

              <rect x="0" y="120" width="205" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#D97706" fontSize="10" fontWeight="bold">3. Nilai Optimum:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Maksimum/Minimum saat f'(x) = 0</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Digunakan untuk laba maksimal bisnis!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 36. KIMIA & FISIKA SMA: MODEL ATOM BOHR & KUANTUM                    */}
      {/* ==================================================================== */}
      {type === 'bohr_atom' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#DDD6FE" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ⚛️ MODEL ATOM NIELS BOHR: KULIT ELEKTRON & FOTON KUANTUM 💫
            </text>
          </g>

          {/* Model Atom Bohr di Kiri */}
          <g transform="translate(170, 165)">
            {/* Kulit M (n=3) */}
            <circle cx="0" cy="0" r="95" fill="none" stroke="#D4A373" strokeWidth="2" strokeDasharray="5,5" />
            <circle cx="95" cy="0" r="5" fill="#38BDF8" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="85" y="-12" fill="#5C3A21" fontSize="8" fontWeight="bold">Kulit M (n=3)</text>

            {/* Kulit L (n=2) */}
            <circle cx="0" cy="0" r="65" fill="none" stroke="#D4A373" strokeWidth="2" strokeDasharray="4,4" />
            <circle cx="0" cy="65" r="5" fill="#38BDF8" stroke="#5C3A21" strokeWidth="1.5" />
            <circle cx="-65" cy="0" r="5" fill="#38BDF8" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="50" y="55" fill="#5C3A21" fontSize="8" fontWeight="bold">Kulit L (n=2)</text>

            {/* Kulit K (n=1) */}
            <circle cx="0" cy="0" r="38" fill="none" stroke="#D4A373" strokeWidth="2" strokeDasharray="3,3" />
            <circle cx="0" cy="-38" r="5" fill="#38BDF8" stroke="#5C3A21" strokeWidth="1.5" />
            <circle cx="38" cy="0" r="5" fill="#38BDF8" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="25" y="-25" fill="#5C3A21" fontSize="8" fontWeight="bold">Kulit K (n=1)</text>

            {/* Inti Atom di Tengah (Proton + & Neutron 0) */}
            <circle cx="0" cy="0" r="18" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2.5" style={{ animation: 'solarPulse 2.5s infinite' }} />
            <circle cx="-4" cy="-4" r="5" fill="#EF4444" />
            <circle cx="4" cy="4" r="5" fill="#94A3B8" />
            <text x="0" y="28" fill="#000000" fontSize="8.5" fontWeight="900" textAnchor="middle">Inti (p⁺, n⁰)</text>

            {/* Foton Kuantum Terpancar */}
            <path d="M 65 0 Q 75 -20, 95 -25 T 125 -30" stroke="#F59E0B" strokeWidth="3" fill="none" />
            <text x="135" y="-25" fill="#D97706" fontSize="9" fontWeight="900">Foton ΔE = h·ν</text>
          </g>

          {/* Sisi Kanan: Panduan Konfigurasi Elektron & Kuantum */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📚 KONFIGURASI ELEKTRON
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#0284C7" fontSize="10" fontWeight="900">1. Daya Tampung Kulit (2n²):</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Kulit K (n=1) = maks 2 elektron</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Kulit L (n=2) = maks 8 • M (n=3) = 18</text>

              <rect x="0" y="60" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#7C3AED" fontSize="10" fontWeight="900">2. 4 Bilangan Kuantum:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Utama (n) • Azimut (l: s, p, d, f)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Magnetik (m) • Spin (s: +½, -½)</text>

              <rect x="0" y="120" width="205" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#D97706" fontSize="10" fontWeight="bold">3. Efek Fotolistrik (Einstein):</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Elektron terlempar saat disinari foton</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Membuktikan sifat partikel cahaya!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 37. KIMIA SMA: SKALA DERAJAT KEASAMAN (pH 0-14) & NETRALISASI        */}
      {/* ==================================================================== */}
      {type === 'ph_scale' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <defs>
            <linearGradient id="phGradClay" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="30%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="70%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🧪 SKALA DERAJAT KEASAMAN (pH 0 - 14) & TITRASI ASAM-BASA 💧
            </text>
          </g>

          {/* Spektrum Warna pH di Bagian Atas */}
          <g transform="translate(45, 68)">
            <rect x="0" y="0" width="510" height="38" rx="8" fill="url(#phGradClay)" stroke="#5C3A21" strokeWidth="2.5" />
            {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((val) => {
              const xPos = (val / 14) * 510;
              return (
                <g key={val} transform={`translate(${xPos}, 0)`}>
                  <line x1="0" y1="0" x2="0" y2="38" stroke="#FFF8EA" strokeWidth="2" />
                  <rect x="-12" y="44" width="24" height="18" rx="4" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="1.5" />
                  <text x="0" y="57" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">{val}</text>
                </g>
              );
            })}
          </g>

          {/* 3 Tabung Larutan Edukasi di Bagian Bawah */}
          <g transform="translate(45, 150)">
            {/* Tabung 1: ASAM (pH < 7) */}
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="160" height="120" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
              <rect x="0" y="0" width="160" height="26" rx="10" fill="#FDA4AF" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="80" y="18" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">🍋 ASAM (pH 0-6)</text>
              <text x="10" y="44" fill="#EF4444" fontSize="9.5" fontWeight="bold">• Kaya ion H⁺ (Asam)</text>
              <text x="10" y="58" fill="#5C3A21" fontSize="8.5">• Lakmus biru ➔ merah</text>
              <text x="10" y="72" fill="#5C3A21" fontSize="8.5">• Contoh: Jeruk, cuka, HCl</text>
              <text x="10" y="96" fill="#000000" fontSize="9" fontWeight="bold">pH = -log [H⁺]</text>
            </g>

            {/* Tabung 2: NETRAL (pH = 7) */}
            <g transform="translate(175, 0)">
              <rect x="0" y="0" width="160" height="120" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
              <rect x="0" y="0" width="160" height="26" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="80" y="18" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">💧 NETRAL (pH = 7)</text>
              <text x="10" y="44" fill="#166534" fontSize="9.5" fontWeight="bold">• [H⁺] = [OH⁻] Seimbang</text>
              <text x="10" y="58" fill="#5C3A21" fontSize="8.5">• Tidak mengubah lakmus</text>
              <text x="10" y="72" fill="#5C3A21" fontSize="8.5">• Contoh: Air murni, garam</text>
              <text x="10" y="96" fill="#000000" fontSize="9" fontWeight="bold">pH + pOH = 14</text>
            </g>

            {/* Tabung 3: BASA (pH > 7) */}
            <g transform="translate(350, 0)">
              <rect x="0" y="0" width="160" height="120" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
              <rect x="0" y="0" width="160" height="26" rx="10" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="80" y="18" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">🧼 BASA (pH 8-14)</text>
              <text x="10" y="44" fill="#0284C7" fontSize="9.5" fontWeight="bold">• Kaya ion OH⁻ (Basa)</text>
              <text x="10" y="58" fill="#5C3A21" fontSize="8.5">• Lakmus merah ➔ biru</text>
              <text x="10" y="72" fill="#5C3A21" fontSize="8.5">• Contoh: Sabun, antasida</text>
              <text x="10" y="96" fill="#000000" fontSize="9" fontWeight="bold">pOH = -log [OH⁻]</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 38. EKONOMI SMA: KURVA PERMINTAAN, PENAWARAN & EKUILIBRIUM           */}
      {/* ==================================================================== */}
      {type === 'economics_supply_demand' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ⚖️ EKONOMI: KURVA PERMINTAAN (D), PENAWARAN (S) & EKUILIBRIUM 🛍️
            </text>
          </g>

          {/* Grafik Kurva Permintaan & Penawaran di Kiri */}
          <g transform="translate(45, 66)">
            <rect x="0" y="0" width="285" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Sumbu P (Harga) dan Q (Jumlah) */}
            <line x1="45" y1="180" x2="265" y2="180" stroke="#5C3A21" strokeWidth="2.5" />
            <line x1="45" y1="20" x2="45" y2="180" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="268" y="184" fill="#5C3A21" fontSize="9" fontWeight="bold">Q</text>
            <text x="45" y="14" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">P (Harga)</text>

            {/* Kurva Permintaan (Qd: Merah Muda Turun) */}
            <line x1="65" y1="40" x2="245" y2="160" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
            <text x="250" y="165" fill="#EF4444" fontSize="10" fontWeight="900">D (Qd)</text>

            {/* Kurva Penawaran (Qs: Biru Naik) */}
            <line x1="65" y1="160" x2="245" y2="40" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
            <text x="250" y="44" fill="#0284C7" fontSize="10" fontWeight="900">S (Qs)</text>

            {/* Titik Temu Ekuilibrium Pasar (E) */}
            <circle cx="155" cy="100" r="7" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" style={{ animation: 'solarPulse 2s infinite' }} />
            <line x1="45" y1="100" x2="155" y2="100" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="155" y1="100" x2="155" y2="180" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="175" y="96" fill="#000000" fontSize="10" fontWeight="900">E (Pe, Qe)</text>
            <text x="32" y="103" fill="#D97706" fontSize="8" fontWeight="bold" textAnchor="end">Pe</text>
            <text x="155" y="195" fill="#D97706" fontSize="8" fontWeight="bold" textAnchor="middle">Qe</text>
          </g>

          {/* Sisi Kanan: Panduan Hukum Ekonomi & Ekuilibrium */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📊 MEKANISME PASAR & HARGA
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#EF4444" fontSize="10" fontWeight="900">1. Hukum Permintaan (D):</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Harga P naik ➔ Permintaan Qd turun</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Sudut pandang pembeli / konsumen</text>

              <rect x="0" y="60" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#0284C7" fontSize="10" fontWeight="900">2. Hukum Penawaran (S):</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Harga P naik ➔ Pasokan Qs naik</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Sudut pandang penjual / produsen</text>

              <rect x="0" y="120" width="205" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#166534" fontSize="10" fontWeight="bold">3. Titik Keseimbangan (E):</text>
              <text x="10" y="32" fill="#166534" fontSize="9" fontWeight="bold">• Qd = Qs (Harga pasar sepakat adil)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Mencegah kelangkaan & surplus!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 39. FISIKA SMA: TERMODINAMIKA & MESIN KALOR CARNOT                   */}
      {/* ==================================================================== */}
      {type === 'thermodynamics_carnot' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🔥 TERMODINAMIKA & SIKLUS MESIN KALOR CARNOT: W = Q₁ - Q₂ ⚙️
            </text>
          </g>

          {/* Diagram Alir Mesin Carnot di Kiri */}
          <g transform="translate(45, 66)">
            <rect x="0" y="0" width="285" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Reservoir Suhu Tinggi T1 */}
            <rect x="42" y="15" width="200" height="36" rx="6" fill="#FDA4AF" stroke="#5C3A21" strokeWidth="2" />
            <text x="142" y="38" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">Reservoir Suhu Tinggi (T₁)</text>

            {/* Panah Kalor Masuk Q1 */}
            <line x1="142" y1="51" x2="142" y2="82" stroke="#EF4444" strokeWidth="4.5" />
            <polygon points="142,86 137,74 147,74" fill="#EF4444" />
            <text x="168" y="72" fill="#EF4444" fontSize="10.5" fontWeight="900">Kalor Q₁</text>

            {/* Mesin Carnot di Tengah */}
            <g transform="translate(142, 112)">
              <circle cx="0" cy="0" r="26" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2.5" />
              <text x="0" y="4" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">Mesin</text>
              <text x="0" y="14" fill="#5C3A21" fontSize="7.5" textAnchor="middle">Carnot</text>
            </g>

            {/* Usaha Mekanik Keluar W */}
            <line x1="168" y1="112" x2="235" y2="112" stroke="#166534" strokeWidth="4.5" />
            <polygon points="240,112 228,107 228,117" fill="#166534" />
            <text x="210" y="104" fill="#166534" fontSize="11" fontWeight="900">Usaha W</text>

            {/* Panah Kalor Buang Q2 */}
            <line x1="142" y1="138" x2="142" y2="162" stroke="#0284C7" strokeWidth="4.5" />
            <polygon points="142,166 137,154 147,154" fill="#0284C7" />
            <text x="168" y="156" fill="#0284C7" fontSize="10.5" fontWeight="900">Kalor Q₂</text>

            {/* Reservoir Suhu Rendah T2 */}
            <rect x="42" y="166" width="200" height="36" rx="6" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="142" y="189" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">Reservoir Suhu Rendah (T₂)</text>
          </g>

          {/* Sisi Kanan: Panduan Efisiensi & Hukum Termodinamika */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              ⚙️ FORMULA MESIN KALOR
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="48" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="102" y="20" fill="#166534" fontSize="12" fontWeight="900" textAnchor="middle">
                W = Q₁ - Q₂
              </text>
              <text x="102" y="36" fill="#5C3A21" fontSize="8.5" textAnchor="middle">
                Usaha Luar = Kalor Masuk - Kalor Buang
              </text>

              <rect x="0" y="56" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#0284C7" fontSize="10" fontWeight="900">Efisiensi Carnot (η):</text>
              <text x="10" y="32" fill="#0284C7" fontSize="9.5" fontWeight="bold">• η = 1 - (T₂ / T₁)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Suhu mutlak dalam Kelvin (K)</text>

              <rect x="0" y="116" width="205" height="56" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#D97706" fontSize="10" fontWeight="bold">Hukum Hess Termokimia:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• ΔH reaksi tidak bergantung lintasan</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Eksoterm (ΔH &lt; 0) • Endoterm (ΔH &gt; 0)</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 40. FISIKA SMA: OPTIK, PEMBIASAN CAHAYA & LENSA CEMBUNG              */}
      {/* ==================================================================== */}
      {type === 'optics_light' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🔍 OPTIK: PEMBIASAN CAHAYA LENSA CEMBUNG & TITIK FOKUS 🌈
            </text>
          </g>

          {/* Diagram Pembiasan Lensa di Kiri */}
          <g transform="translate(35, 66)">
            <rect x="0" y="0" width="285" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Sumbu Utama Horizontal */}
            <line x1="15" y1="110" x2="270" y2="110" stroke="#5C3A21" strokeWidth="2" />
            <text x="272" y="113" fill="#5C3A21" fontSize="8" fontWeight="bold">Sumbu</text>

            {/* Lensa Cembung Kaca di Tengah */}
            <path d="M 142 30 Q 162 110, 142 190 Q 122 110, 142 30" fill="#BAE6FD" fillOpacity="0.7" stroke="#0284C7" strokeWidth="2.5" />
            <line x1="142" y1="20" x2="142" y2="200" stroke="#0284C7" strokeWidth="1" strokeDasharray="3,3" />

            {/* Titik Fokus F1 & F2 */}
            <circle cx="85" cy="110" r="3.5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="85" y="125" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">F₁</text>
            <circle cx="200" cy="110" r="3.5" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="200" y="125" fill="#5C3A21" fontSize="9" fontWeight="bold" textAnchor="middle">F₂</text>

            {/* Benda Tegak Panah Hijau di Kiri */}
            <line x1="50" y1="110" x2="50" y2="55" stroke="#166534" strokeWidth="3.5" />
            <polygon points="50,50 45,62 55,62" fill="#166534" />
            <text x="50" y="44" fill="#166534" fontSize="9" fontWeight="bold" textAnchor="middle">Benda (s)</text>

            {/* Sinar Istimewa 1: Sejajar sumbu dibiaskan lewat F2 */}
            <line x1="50" y1="55" x2="142" y2="55" stroke="#EF4444" strokeWidth="2" />
            <line x1="142" y1="55" x2="245" y2="150" stroke="#EF4444" strokeWidth="2" />

            {/* Sinar Istimewa 2: Lewat pusat optik diteruskan */}
            <line x1="50" y1="55" x2="245" y2="150" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Bayangan Nyata Terbalik Panah Merah di Kanan */}
            <line x1="245" y1="110" x2="245" y2="150" stroke="#EF4444" strokeWidth="3.5" />
            <polygon points="245,155 240,143 250,143" fill="#EF4444" />
            <text x="245" y="170" fill="#EF4444" fontSize="9" fontWeight="bold" textAnchor="middle">Bayangan (s')</text>
          </g>

          {/* Sisi Kanan: Panduan Rumus Lensa & Optik */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📐 RUMUS LENSA & ALAT OPTIK
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="48" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="102" y="20" fill="#0284C7" fontSize="12" fontWeight="900" textAnchor="middle">
                1/f = 1/s + 1/s'
              </text>
              <text x="102" y="36" fill="#5C3A21" fontSize="8.5" textAnchor="middle">
                f = Jarak Fokus • s = Jarak Benda • s' = Bayangan
              </text>

              <rect x="0" y="56" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#166534" fontSize="10" fontWeight="900">Perbesaran Bayangan (M):</text>
              <text x="10" y="32" fill="#166534" fontSize="9.5" fontWeight="bold">• M = |s' / s| = |h' / h|</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Kuat Lensa: P = 100/f(cm) Dioptri</text>

              <rect x="0" y="116" width="205" height="56" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#D97706" fontSize="10" fontWeight="bold">Aplikasi Alat Optik:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Kacamata: Lensa cekung (-) / cembung (+)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Mikroskop: 2 Lensa cembung (Objektif + Okuler)</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 41. KIMIA SMA: SENYAWA KARBON, HIDROKARBON & CINCIN BENZENA          */}
      {/* ==================================================================== */}
      {type === 'organic_chemistry' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#DDD6FE" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              🧪 KIMIA ORGANIK: RANTAI KARBON ALKANA & CINCIN BENZENA (C₆H₆) 💎
            </text>
          </g>

          {/* Cincin Benzena Aromatik & Molekul Karbon di Kiri */}
          <g transform="translate(35, 66)">
            <rect x="0" y="0" width="285" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Cincin Aromatik Benzena Segi Enam */}
            <g transform="translate(85, 105)">
              <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24" fill="#BAE6FD" fillOpacity="0.4" stroke="#0284C7" strokeWidth="3" />
              <circle cx="0" cy="0" r="26" fill="none" stroke="#0284C7" strokeWidth="2" strokeDasharray="5,4" />
              <text x="0" y="4" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">C₆H₆</text>
              <text x="0" y="66" fill="#0284C7" fontSize="9" fontWeight="bold" textAnchor="middle">Benzena Aromatik</text>
            </g>

            {/* Rantai Karbon Etanol (Alkohol) */}
            <g transform="translate(205, 105)">
              <circle cx="-25" cy="0" r="14" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
              <text x="-25" y="4" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">C</text>
              <line x1="-11" y1="0" x2="11" y2="0" stroke="#5C3A21" strokeWidth="3" />
              <circle cx="25" cy="0" r="14" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" />
              <text x="25" y="4" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">C</text>
              <line x1="39" y1="0" x2="56" y2="0" stroke="#5C3A21" strokeWidth="3" />
              <circle cx="68" cy="0" r="12" fill="#FDA4AF" stroke="#5C3A21" strokeWidth="2" />
              <text x="68" y="4" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">OH</text>
              <text x="20" y="66" fill="#EF4444" fontSize="9" fontWeight="bold" textAnchor="middle">Etanol (C₂H₅OH)</text>
            </g>
          </g>

          {/* Sisi Kanan: Panduan Deret Homolog & Gugus Fungsi */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              📚 DERET HOMOLOG HIDROKARBON
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#166534" fontSize="10" fontWeight="900">1. Deret Alkana, Alkena, Alkuna:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Alkana: CₙH₂ₙ₊₂ (Ikatan tunggal)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Alkena: CₙH₂ₙ • Alkuna: CₙH₂ₙ₋₂</text>

              <rect x="0" y="60" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#0284C7" fontSize="10" fontWeight="900">2. Gugus Fungsi Utama:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Alkohol (-OH) • Eter (-O-)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Aldehid (-CHO) • Asam Karboksilat</text>

              <rect x="0" y="120" width="205" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#D97706" fontSize="10" fontWeight="bold">3. Makromolekul Kehidupan:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Polimer, Karbohidrat, Protein, Lipid</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Menyusun seluruh sel makhluk hidup!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 42. FISIKA SMA: RELATIVITAS KHUSUS EINSTEIN (E = mc²) & DILATASI      */}
      {/* ==================================================================== */}
      {type === 'relativity_einstein' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-210" y="0" width="420" height="32" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              ✨ TEORI RELATIVITAS KHUSUS EINSTEIN: E = m · c² & DILATASI WAKTU 🚀
            </text>
          </g>

          {/* Roket Relativistik & Jam Waktu Melambat di Kiri */}
          <g transform="translate(35, 66)">
            <rect x="0" y="0" width="285" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Roket Antariksa Berkecepatan Tinggi */}
            <g transform="translate(142, 65)">
              <ellipse cx="0" cy="0" rx="55" ry="18" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="2.5" />
              <polygon points="55,0 30,-14 30,14" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" />
              {/* Semburan Api Plasma Jet */}
              <polygon points="-55,0 -80,-8 -70,0 -80,8" fill="#FFAE6D" />
              <text x="0" y="5" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">v ≈ 0.8 c</text>
              <text x="0" y="32" fill="#5C3A21" fontSize="8.5" fontWeight="bold" textAnchor="middle">Mendekati Kecepatan Cahaya</text>
            </g>

            {/* Jam Waktu Berdetak Lebih Lambat */}
            <g transform="translate(142, 145)">
              <circle cx="0" cy="0" r="28" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2.5" />
              <line x1="0" y1="0" x2="0" y2="-16" stroke="#5C3A21" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="12" y2="0" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              <circle cx="0" cy="0" r="3" fill="#5C3A21" />
              <text x="0" y="42" fill="#0284C7" fontSize="9" fontWeight="900" textAnchor="middle">Waktu Berdetak Melambat!</text>
            </g>
          </g>

          {/* Sisi Kanan: Panduan Rumus Relativitas Einstein */}
          <g transform="translate(345, 66)">
            <rect x="0" y="0" width="225" height="215" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="225" height="28" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="112" y="19" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              ⚡ KESETARAAN MASSA & ENERGI
            </text>

            <g transform="translate(10, 36)">
              <rect x="0" y="0" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="102" y="20" fill="#D97706" fontSize="14" fontWeight="900" textAnchor="middle">
                E = m · c²
              </text>
              <text x="102" y="36" fill="#5C3A21" fontSize="8.5" textAnchor="middle">
                c = 300.000 km/s (Cepat rambat cahaya)
              </text>

              <rect x="0" y="60" width="205" height="52" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#0284C7" fontSize="10" fontWeight="900">1. Dilatasi Waktu (Δt):</text>
              <text x="10" y="32" fill="#0284C7" fontSize="9" fontWeight="bold">• Δt = Δt₀ / √(1 - v²/c²)</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Jam astronot bergerak lebih lambat</text>

              <rect x="0" y="120" width="205" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="18" fill="#166534" fontSize="10" fontWeight="bold">2. Kalibrasi Satelit GPS:</text>
              <text x="10" y="32" fill="#5C3A21" fontSize="8.5">• Satelit GPS wajib koreksi rumus Einstein</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8.5">• Peta smartphone akurat hingga meter!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 43. MATEMATIKA SMA: FUNGSI EKSPONEN & LOGARITMA (REFLEKSI INVERS)    */}
      {/* ==================================================================== */}
      {type === 'math_exponential_logarithm' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-225" y="0" width="450" height="32" rx="8" fill="#FEF08A" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="11.5" fontWeight="900" textAnchor="middle">
              📈 FUNGSI EKSPONEN f(x) = aˣ &amp; LOGARITMA ⁿlog b = c 📉
            </text>
          </g>

          {/* Sisi Kiri: Bidang Koordinat Kartesius & Kurva Eksponen-Logaritma */}
          <g transform="translate(45, 64)">
            <rect x="0" y="0" width="280" height="220" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Grid Halus */}
            {[40, 80, 120, 160, 200, 240].map((x) => (
              <line key={`gx-${x}`} x1={x} y1="15" x2={x} y2="205" stroke="#EADBC0" strokeWidth="1" strokeDasharray="2,2" />
            ))}
            {[40, 80, 120, 160].map((y) => (
              <line key={`gy-${y}`} x1="15" y1={y} x2="265" y2={y} stroke="#EADBC0" strokeWidth="1" strokeDasharray="2,2" />
            ))}

            {/* Sumbu X dan Y */}
            <line x1="30" y1="165" x2="260" y2="165" stroke="#5C3A21" strokeWidth="2.5" />
            <line x1="100" y1="20" x2="100" y2="205" stroke="#5C3A21" strokeWidth="2.5" />
            <text x="255" y="160" fill="#5C3A21" fontSize="9.5" fontWeight="bold">X</text>
            <text x="105" y="30" fill="#5C3A21" fontSize="9.5" fontWeight="bold">Y</text>

            {/* Garis Refleksi Invers y = x */}
            <line x1="45" y1="205" x2="230" y2="20" stroke="#D97706" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="228" y="32" fill="#D97706" fontSize="8.5" fontWeight="900">y = x (Cermin Invers)</text>

            {/* Kurva Eksponen y = 2^x (Merah Menanjak Tajam) */}
            <path
              d="M 40 163 Q 90 162, 100 148 Q 120 120, 140 85 Q 160 50, 180 25"
              fill="none"
              stroke="#EF4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Titik Potong (0, 1) */}
            <circle cx="100" cy="148" r="5" fill="#EF4444" stroke="#5C3A21" strokeWidth="1.5" style={{ animation: 'solarPulse 2s infinite' }} />
            <text x="70" y="145" fill="#DC2626" fontSize="9" fontWeight="900">(0, 1)</text>
            <text x="185" y="30" fill="#EF4444" fontSize="10" fontWeight="900">y = 2ˣ</text>

            {/* Kurva Logaritma y = log2(x) (Biru Mendatar ke Kanan) */}
            <path
              d="M 102 205 Q 103 165, 117 150 Q 152 130, 185 110 Q 220 90, 260 75"
              fill="none"
              stroke="#0284C7"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Titik Potong (1, 0) */}
            <circle cx="117" cy="165" r="5" fill="#0284C7" stroke="#5C3A21" strokeWidth="1.5" style={{ animation: 'solarPulse 2s infinite 0.5s' }} />
            <text x="122" y="180" fill="#0284C7" fontSize="9" fontWeight="900">(1, 0)</text>
            <text x="240" y="70" fill="#0284C7" fontSize="10" fontWeight="900">y = ²log x</text>

            {/* Asimtot Datar y = 0 & Asimtot Tegak x = 0 */}
            <rect x="15" y="188" width="250" height="24" rx="4" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1" />
            <text x="140" y="204" fill="#5C3A21" fontSize="8" fontWeight="bold" textAnchor="middle">
              Asimtot Eksponen: y = 0 • Asimtot Logaritma: x = 0
            </text>
          </g>

          {/* Sisi Kanan: Panduan Rumus & Aplikasi Dunia Nyata */}
          <g transform="translate(340, 64)">
            <rect x="0" y="0" width="230" height="220" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="230" height="26" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="115" y="18" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">
              📚 RUMUS, SIFAT &amp; APLIKASI
            </text>

            <g transform="translate(10, 34)">
              {/* Box 1: Definisi Invers */}
              <rect x="0" y="0" width="210" height="50" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="16" fill="#166534" fontSize="9.5" fontWeight="900">1. Definisi Invers Logaritma:</text>
              <text x="10" y="32" fill="#000000" fontSize="9.5" fontWeight="bold">ᵃlog b = c ⟺ aᶜ = b</text>
              <text x="10" y="44" fill="#5C3A21" fontSize="8">Contoh: ²log 16 = 4 karena 2⁴ = 16</text>

              {/* Box 2: Sifat Operasi Logaritma */}
              <rect x="0" y="56" width="210" height="58" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="16" fill="#D97706" fontSize="9.5" fontWeight="900">2. Sifat Operasi Logaritma:</text>
              <text x="10" y="30" fill="#000000" fontSize="8.5" fontWeight="bold">• ᵃlog(x · y) = ᵃlog x + ᵃlog y</text>
              <text x="10" y="42" fill="#000000" fontSize="8.5" fontWeight="bold">• ᵃlog(x / y) = ᵃlog x - ᵃlog y</text>
              <text x="10" y="54" fill="#5C3A21" fontSize="8">• ᵃlog(xⁿ) = n · ᵃlog x</text>

              {/* Box 3: Penerapan Nyata */}
              <rect x="0" y="120" width="210" height="58" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="10" y="16" fill="#0284C7" fontSize="9.5" fontWeight="900">3. Aplikasi Sains &amp; Teknologi:</text>
              <text x="10" y="30" fill="#5C3A21" fontSize="8.5">• 🦠 Bakteri: N(t) = N₀ · 2ᵗ (Eksponensial)</text>
              <text x="10" y="42" fill="#5C3A21" fontSize="8.5">• 🌍 Gempa Richter: Skala Logaritma Basis 10</text>
              <text x="10" y="54" fill="#166534" fontSize="8" fontWeight="bold">Gempa M7 sepuluh kali lebih dahsyat dari M6!</text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 44. INFORMATIKA SMA: STRUKTUR DATA, BIG-O & KECERDASAN BUATAN (AI)   */}
      {/* ==================================================================== */}
      {type === 'data_structures_algorithms' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="6" y="6" width="588" height="308" rx="14" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="3" />
          <rect x="14" y="14" width="572" height="292" rx="10" fill="#FFFDF7" stroke="#EADBC0" strokeWidth="1.5" />

          {/* Header Kartu Clay */}
          <g transform="translate(300, 22)">
            <rect x="-235" y="0" width="470" height="32" rx="8" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="2" />
            <text x="0" y="21" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">
              💻 STRUKTUR DATA (ARRAY/STACK/QUEUE), BIG-O &amp; AI 🤖
            </text>
          </g>

          {/* Sisi Kiri: Array Memori & LIFO Stack vs FIFO Queue */}
          <g transform="translate(38, 64)">
            {/* 1. Barisan Sel Array Linear */}
            <rect x="0" y="0" width="280" height="88" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="0" y="0" width="280" height="24" rx="10" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="140" y="16" fill="#000000" fontSize="9.5" fontWeight="900" textAnchor="middle">
              1. ARRAY: BLOK MEMORI BERURUTAN (AKSES O(1))
            </text>

            <g transform="translate(14, 34)">
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(${i * 50}, 0)`}>
                  <rect x="0" y="0" width="46" height="32" rx="5" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
                  <text x="23" y="20" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
                    {[42, 18, 95, 33, 77][i]}
                  </text>
                  <text x="23" y="44" fill="#5C3A21" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                    idx [{i}]
                  </text>
                </g>
              ))}
            </g>

            {/* 2. Stack LIFO vs Queue FIFO */}
            <g transform="translate(0, 96)">
              {/* Kotak Stack LIFO */}
              <rect x="0" y="0" width="134" height="124" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
              <rect x="0" y="0" width="134" height="22" rx="10" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="67" y="15" fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">
                STACK (LIFO)
              </text>
              {/* Wadah Tabung */}
              <path d="M 32 30 L 32 95 L 102 95 L 102 30" fill="none" stroke="#5C3A21" strokeWidth="2" />
              <rect x="36" y="74" width="62" height="18" rx="3" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1" />
              <text x="67" y="87" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">Bawah [0]</text>
              <rect x="36" y="54" width="62" height="18" rx="3" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1" />
              <text x="67" y="67" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">Tengah [1]</text>
              <rect x="36" y="34" width="62" height="18" rx="3" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="1" />
              <text x="67" y="47" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">TOP (Push/Pop)</text>
              <text x="67" y="112" fill="#5C3A21" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                Last-In First-Out (Undo)
              </text>

              {/* Kotak Queue FIFO */}
              <g transform="translate(146, 0)">
                <rect x="0" y="0" width="134" height="124" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />
                <rect x="0" y="0" width="134" height="22" rx="10" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
                <text x="67" y="15" fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">
                  QUEUE (FIFO)
                </text>
                {/* Pipa Antrean */}
                <rect x="14" y="38" width="106" height="42" rx="6" fill="#FFFDF7" stroke="#5C3A21" strokeWidth="1.5" />
                <text x="24" y="64" fill="#059669" fontSize="12" fontWeight="900">➡</text>
                <rect x="42" y="44" width="28" height="30" rx="3" fill="#34D399" stroke="#5C3A21" strokeWidth="1" />
                <text x="56" y="62" fill="#000000" fontSize="7.5" fontWeight="bold" textAnchor="middle">Front</text>
                <rect x="74" y="44" width="28" height="30" rx="3" fill="#6EE7B7" stroke="#5C3A21" strokeWidth="1" />
                <text x="88" y="62" fill="#000000" fontSize="7.5" fontWeight="bold" textAnchor="middle">Rear</text>
                <text x="67" y="98" fill="#166534" fontSize="8" fontWeight="bold" textAnchor="middle">
                  Enqueue ➔ Dequeue
                </text>
                <text x="67" y="112" fill="#5C3A21" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                  First-In First-Out (Loket)
                </text>
              </g>
            </g>
          </g>

          {/* Sisi Kanan: Grafik Kompleksitas Notasi Big-O & Neural Net AI */}
          <g transform="translate(330, 64)">
            <rect x="0" y="0" width="232" height="220" rx="10" fill="#FFF8EA" stroke="#5C3A21" strokeWidth="2" />

            {/* Bagian Atas: Kurva Notasi Big-O */}
            <rect x="0" y="0" width="232" height="24" rx="10" fill="#C084FC" stroke="#5C3A21" strokeWidth="1.5" />
            <text x="116" y="16" fill="#000000" fontSize="9.5" fontWeight="900" textAnchor="middle">
              ⚡ NOTASI BIG-O (EFISIENSI WAKTU)
            </text>

            <g transform="translate(18, 32)">
              {/* Sumbu Grafik */}
              <line x1="20" y1="65" x2="195" y2="65" stroke="#5C3A21" strokeWidth="2" />
              <line x1="20" y1="10" x2="20" y2="65" stroke="#5C3A21" strokeWidth="2" />
              <text x="195" y="69" fill="#5C3A21" fontSize="7.5" fontWeight="bold">N</text>
              <text x="20" y="8" fill="#5C3A21" fontSize="7.5" fontWeight="bold">Waktu</text>

              {/* Kurva O(1) Hijau Datar */}
              <line x1="20" y1="60" x2="180" y2="60" stroke="#16A34A" strokeWidth="2" />
              <text x="185" y="63" fill="#16A34A" fontSize="7.5" fontWeight="900">O(1)</text>

              {/* Kurva O(log n) Biru Cyan */}
              <path d="M 20 60 Q 80 55, 175 42" stroke="#0284C7" strokeWidth="2" fill="none" />
              <text x="180" y="44" fill="#0284C7" fontSize="7.5" fontWeight="900">O(log n)</text>

              {/* Kurva O(n) Kuning Linear */}
              <line x1="20" y1="60" x2="160" y2="18" stroke="#D97706" strokeWidth="2" />
              <text x="165" y="20" fill="#D97706" fontSize="7.5" fontWeight="900">O(n)</text>

              {/* Kurva O(n²) Merah Kuadratik */}
              <path d="M 20 60 Q 55 50, 95 10" stroke="#DC2626" strokeWidth="2" fill="none" />
              <text x="100" y="14" fill="#DC2626" fontSize="7.5" fontWeight="900">O(n²)</text>
            </g>

            {/* Bagian Bawah: Kecerdasan Buatan (AI) Neural Network */}
            <g transform="translate(0, 110)">
              <rect x="0" y="0" width="232" height="22" fill="#FEF08A" stroke="#5C3A21" strokeWidth="1.5" />
              <text x="116" y="15" fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">
                🤖 KECERDASAN BUATAN &amp; NEURAL NET
              </text>

              <g transform="translate(18, 30)">
                {/* Layer 1 Input */}
                <circle cx="20" cy="15" r="7" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
                <circle cx="20" cy="45" r="7" fill="#A8E6CF" stroke="#5C3A21" strokeWidth="1.5" />
                <text x="20" y="68" fill="#5C3A21" fontSize="7" fontWeight="bold" textAnchor="middle">Input Layer</text>

                {/* Layer 2 Hidden */}
                <circle cx="75" cy="10" r="7" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
                <circle cx="75" cy="30" r="7" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
                <circle cx="75" cy="50" r="7" fill="#BAE6FD" stroke="#5C3A21" strokeWidth="1.5" />
                <text x="75" y="68" fill="#5C3A21" fontSize="7" fontWeight="bold" textAnchor="middle">Hidden Layer</text>

                {/* Layer 3 Output */}
                <circle cx="130" cy="30" r="8" fill="#FFAE6D" stroke="#5C3A21" strokeWidth="2" style={{ animation: 'solarPulse 2s infinite' }} />
                <text x="130" y="68" fill="#5C3A21" fontSize="7" fontWeight="bold" textAnchor="middle">Output Prediksi</text>

                {/* Sinapsis Koneksi */}
                <line x1="27" y1="15" x2="68" y2="10" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="27" y1="15" x2="68" y2="30" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="27" y1="45" x2="68" y2="30" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="27" y1="45" x2="68" y2="50" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="82" y1="30" x2="122" y2="30" stroke="#F59E0B" strokeWidth="2" />
              </g>

              <text x="116" y="104" fill="#1E293B" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                Machine Learning melatih bobot sinapsis dari data
              </text>
            </g>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 45. PAPAN TULIS KELAS CERIA DINAMIS (PANGGUNG EDUKASI 60FPS)         */}
      {/* ==================================================================== */}
      {(type === 'classroom_chalkboard' ||
        type === 'mindmap_general' ||
        (type !== 'math_counting' &&
          type !== 'math_addition_subtraction' &&
          type !== 'math_geometry_shapes' &&
          type !== 'math_clock_time' &&
          type !== 'math_multiplication_division' &&
          type !== 'math_data_charts' &&
          type !== 'math_exponential_logarithm' &&
          type !== 'data_structures_algorithms' &&
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
          type !== 'solar_system' &&
          type !== 'cartesian_linear' &&
          type !== 'pythagoras' &&
          type !== 'cell_structure' &&
          type !== 'newton_dynamics' &&
          type !== 'blood_circulation' &&
          type !== 'pressure_pascal' &&
          type !== 'electric_circuit' &&
          type !== 'flowchart_logic' &&
          type !== 'wave_sound' &&
          type !== 'dna_helix' &&
          type !== 'history_timeline' &&
          type !== 'trigonometry_wave' &&
          type !== 'calculus_integral_derivative' &&
          type !== 'bohr_atom' &&
          type !== 'ph_scale' &&
          type !== 'economics_supply_demand' &&
          type !== 'thermodynamics_carnot' &&
          type !== 'optics_light' &&
          type !== 'organic_chemistry' &&
          type !== 'relativity_einstein')) && (
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
