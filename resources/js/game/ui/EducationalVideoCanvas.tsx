/**
 * ============================================================================
 * FILE: resources/js/game/ui/EducationalVideoCanvas.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mesin Pemutar Video Animasi Edukasi Berkecepatan Tinggi (60 FPS).
 * Menghadirkan visualisasi animasi bergerak nyata, partikel mengalir,
 * rotasi orbit planet, denyut jantung, foton cahaya, molekul air, dan
 * laser data komputasi yang hidup dan memukau saat video diputar.
 * ============================================================================
 */

import React from 'react';
import { VisualDiagramType } from './LibraryTopicVisualizer';

interface EducationalVideoCanvasProps {
  type: VisualDiagramType;
  step: number;
  isPlaying: boolean;
  playbackSpeed?: number;
}

export const EducationalVideoCanvas: React.FC<EducationalVideoCanvasProps> = ({
  type,
  step = 0,
  isPlaying,
  playbackSpeed = 1,
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
        @keyframes oscilloscopeScroll {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 240; }
        }
        @keyframes dnaTwist3D {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          25% { transform: scaleY(0.15); opacity: 0.35; }
          50% { transform: scaleY(-1); opacity: 1; }
          75% { transform: scaleY(-0.15); opacity: 0.35; }
        }
        @keyframes matrixDrop {
          0% { transform: translateY(-80px); opacity: 0; }
          50% { opacity: 0.9; }
          100% { transform: translateY(320px); opacity: 0; }
        }
        @keyframes shipFloatWave {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes sliceHoverAnim {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -14px); }
        }
        @keyframes cosmicSunSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* 1. FOTOSINTESIS                                                      */}
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

          {/* ⚡ BERKAS FOTON CAHAYA MENGALIR KE DAUN (STREAM KONTINU 60FPS) */}
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

            {/* Klorofil Berkobar */}
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
      {/* 2. SIKLUS AIR                                                        */}
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
          <polygon points="450,90 415,135 485,135" fill="#f8fafc" /> {/* Puncak Salju */}
          <polygon points="460,260 545,130 600,260" fill="#334155" />

          {/* 🌊 SAMUDRA RAYA DENGAN OMBAK BERAYUN */}
          <g>
            <rect x="0" y="240" width="350" height="80" fill="url(#oceanGradReal)" />
            <g style={{ animation: 'oceanWaveSway 3s ease-in-out infinite' }}>
              <path d="M -50 240 Q 30 232, 110 240 T 270 240 T 400 240" stroke="#38bdf8" strokeWidth="3.5" fill="none" />
              <path d="M -30 250 Q 50 244, 130 250 T 290 250 T 400 250" stroke="#7dd3fc" strokeWidth="2" opacity="0.75" fill="none" />
            </g>
            <text x="90" y="285" fill="#e0f2fe" fontSize="14" fontWeight="bold">Samudra Raya</text>
          </g>

          {/* ⬆️ 1. EVAPORASI: UAP AIR MENGALIR KE ATAS SECARA KONTINU */}
          <g transform="translate(130, 225)">
            <path d="M 0 0 Q -10 -40, 5 -80 T -5 -120" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="6,8" fill="none" style={{ animation: 'dashStream 1.2s linear infinite reverse' }} />
            <path d="M 40 0 Q 30 -35, 45 -75 T 35 -115" stroke="#7dd3fc" strokeWidth="3" strokeDasharray="6,8" fill="none" style={{ animation: 'dashStream 1.4s linear infinite reverse' }} />
            <g style={{ animation: 'vaporFloatUp 2s infinite' }}>
              <circle cx="20" cy="-30" r="5" fill="#38bdf8" />
              <circle cx="10" cy="-70" r="6" fill="#7dd3fc" />
            </g>
            <text x="20" y="-60" fill="#7dd3fc" fontSize="12" fontWeight="extrabold" textAnchor="middle">1. Evaporasi ⬆️</text>
          </g>

          {/* ☁️ 2. AWAN KONDENSASI BERGERAK PERLAHAN */}
          <g transform="translate(250, 40)" style={{ animation: 'oceanWaveSway 6s ease-in-out infinite' }}>
            <ellipse cx="60" cy="40" rx="58" ry="30" fill="#f1f5f9" />
            <ellipse cx="105" cy="35" rx="42" ry="26" fill="#e2e8f0" />
            <ellipse cx="25" cy="45" rx="36" ry="22" fill="#cbd5e1" />
            <text x="65" y="20" fill="#0284c7" fontSize="12" fontWeight="extrabold" textAnchor="middle">2. Kondensasi (Awan) ☁️</text>
          </g>

          {/* 🌧️ 3. HUJAN PRESIPITASI MENETES CEPAT KE GUNUNG */}
          <g transform="translate(380, 105)">
            {[0, 25, 50, 75].map((off, i) => (
              <g key={off} style={{ animation: `rainFallStream 0.65s linear infinite ${i * 0.16}s` }}>
                <line x1={off} y1="0" x2={off - 8} y2="26" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            ))}
            <text x="35" y="-15" fill="#38bdf8" fontSize="12" fontWeight="extrabold">3. Presipitasi (Hujan) 🌧️</text>
          </g>

          {/* 🌊 4. LIMPASAN SUNGAI DERAS MENGALIR KEMBALI KE LAUT */}
          <g>
            <path d="M 440 220 Q 370 240, 320 248" stroke="#0ea5e9" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M 440 220 Q 370 240, 320 248" stroke="#bae6fd" strokeWidth="3.5" strokeDasharray="8,8" fill="none" style={{ animation: 'dashStream 0.8s linear infinite' }} />
            <text x="410" y="275" fill="#38bdf8" fontSize="12" fontWeight="extrabold">4. Limpasan Sungai 🌊</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 3. TATA SURYA (PLANET-PLANET BERPUTAR KONTINU 60FPS)                  */}
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

          {/* Bintang-Bintang Gemerlap */}
          {[
            { cx: 40, cy: 30, r: 1.5 }, { cx: 120, cy: 270, r: 2 }, { cx: 280, cy: 30, r: 1 },
            { cx: 480, cy: 45, r: 2 }, { cx: 550, cy: 260, r: 1.5 }, { cx: 520, cy: 110, r: 1 },
            { cx: 70, cy: 190, r: 1 }, { cx: 350, cy: 295, r: 2 },
          ].map((st, sIdx) => (
            <circle key={sIdx} cx={st.cx} cy={st.cy} r={st.r} fill="#fff" style={{ animation: `solarPulse 2s infinite ${sIdx * 0.3}s` }} />
          ))}

          {/* LINTASAN ORBIT & PLANET BERPUTAR */}
          <g transform="translate(300, 160)">
            <circle cx="0" cy="0" r="48" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="3,3" />
            <circle cx="0" cy="0" r="76" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="3,3" />
            <circle cx="0" cy="0" r="110" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
            <circle cx="0" cy="0" r="148" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
            <circle cx="0" cy="0" r="195" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="5,5" />
            <circle cx="0" cy="0" r="245" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="6,6" />

            {/* ☀️ MATAHARI DI PUSAT */}
            <circle cx="0" cy="0" r="28" fill="url(#sunOrbitRad)" style={{ animation: 'solarPulse 3s infinite' }} />
            <text x="0" y="4" fill="#78350f" fontSize="10" fontWeight="extrabold" textAnchor="middle">Matahari</text>

            {/* 1. MERKURIUS ORBIT (3s) */}
            <g style={{ animation: 'spin360 3s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="48" cy="0" r="5" fill="#94a3b8" />
            </g>

            {/* 2. VENUS ORBIT (5s) */}
            <g style={{ animation: 'spin360 5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="76" cy="0" r="8" fill="#fcd34d" />
            </g>

            {/* 3. BUMI & BULAN ORBIT (7.5s) */}
            <g style={{ animation: 'spin360 7.5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="110" cy="0" r="10" fill="#38bdf8" />
              <circle cx="112" cy="-3" r="5" fill="#16a34a" />
              {/* Bulan Mengitari Bumi */}
              <g transform="translate(110, 0)">
                <g style={{ animation: 'spin360 1.8s linear infinite', transformOrigin: '0px 0px' }}>
                  <circle cx="16" cy="0" r="3" fill="#f1f5f9" />
                </g>
              </g>
            </g>

            {/* 4. MARS ORBIT (10.5s) */}
            <g style={{ animation: 'spin360 10.5s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="148" cy="0" r="7" fill="#ef4444" />
            </g>

            {/* 5. JUPITER ORBIT (15s) */}
            <g style={{ animation: 'spin360 15s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="195" cy="0" r="17" fill="#d97706" />
              <circle cx="202" cy="5" r="4" fill="#9a3412" />
            </g>

            {/* 6. SATURNUS BERCINCIN ORBIT (20s) */}
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
      {/* 4. DNA DOUBLE HELIX                                                  */}
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

          <g transform="translate(130, 260)">
            <rect x="0" y="0" width="340" height="42" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <text x="170" y="19" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
              Pasangan Basa Komplementer:
            </text>
            <text x="170" y="34" fill="#cbd5e1" fontSize="10.5" textAnchor="middle">
              <tspan fill="#38bdf8" fontWeight="bold">Adenin (A)</tspan> = <tspan fill="#facc15" fontWeight="bold">Timin (T)</tspan>
              {'  •  '}
              <tspan fill="#22c55e" fontWeight="bold">Guanin (G)</tspan> ≡ <tspan fill="#ef4444" fontWeight="bold">Sitosin (C)</tspan>
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 5. ATOM BOHR                                                         */}
      {/* ==================================================================== */}
      {type === 'bohr_atom' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <g transform="translate(300, 160)">
            {/* Kulit K */}
            <circle cx="0" cy="0" r="55" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeDasharray="4,4" opacity="0.6" />
            <g style={{ animation: 'spin360 1.8s linear infinite', transformOrigin: '0px 0px' }}>
              <circle cx="55" cy="0" r="6" fill="#38bdf8" />
              <circle cx="-55" cy="0" r="6" fill="#38bdf8" />
            </g>

            {/* Kulit L */}
            <g transform="rotate(35)">
              <ellipse cx="0" cy="0" rx="95" ry="95" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeDasharray="5,5" opacity="0.6" />
              <g style={{ animation: 'spin360Rev 3.5s linear infinite', transformOrigin: '0px 0px' }}>
                <circle cx="95" cy="0" r="6" fill="#c084fc" />
                <circle cx="-95" cy="0" r="6" fill="#c084fc" />
                <circle cx="0" cy="95" r="6" fill="#c084fc" />
                <circle cx="0" cy="-95" r="6" fill="#c084fc" />
              </g>
            </g>

            {/* Kulit M */}
            <g transform="rotate(-35)">
              <ellipse cx="0" cy="0" rx="135" ry="135" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="6,6" opacity="0.6" />
              <g style={{ animation: 'spin360 5.5s linear infinite', transformOrigin: '0px 0px' }}>
                <circle cx="135" cy="0" r="7" fill="#fbbf24" />
                <circle cx="-135" cy="0" r="7" fill="#fbbf24" />
              </g>
            </g>

            {/* Inti Nukleus */}
            <g style={{ animation: 'solarPulse 1.2s ease-in-out infinite' }}>
              <circle cx="0" cy="0" r="28" fill="#991b1b" stroke="#f87171" strokeWidth="2.5" />
              <circle cx="-7" cy="-7" r="8" fill="#ef4444" />
              <circle cx="7" cy="-7" r="8" fill="#94a3b8" />
              <circle cx="0" cy="7" r="8" fill="#ef4444" />
              <text x="0" y="4" fill="#fff" fontSize="10" fontWeight="extrabold" textAnchor="middle">p⁺ n⁰</text>
            </g>

            {/* Foton Terpancar */}
            <g transform="translate(100, -60)">
              <path d="M 0 0 Q 25 -20, 50 0 T 100 0" stroke="#fef08a" strokeWidth="3.5" fill="none" style={{ animation: 'dashStream 1s linear infinite' }} />
              <text x="45" y="-12" fill="#fde047" fontSize="11" fontWeight="bold">Foton (ΔE = h·ν)</text>
            </g>
          </g>

          <text x="300" y="25" fill="#7dd3fc" fontSize="14" fontWeight="extrabold" textAnchor="middle">
            Model Atom Bohr: Revolusi Elektron 60 FPS
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 6. PYTHAGORAS                                                        */}
      {/* ==================================================================== */}
      {type === 'pythagoras' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <g transform="translate(230, 180)">
            <rect x="0" y="0" width="110" height="85" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="55" y="48" fill="#fbbf24" fontSize="14" fontWeight="extrabold" textAnchor="middle">a² = 9</text>

            <rect x="-85" y="-95" width="85" height="95" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="-42" y="-42" fill="#7dd3fc" fontSize="14" fontWeight="extrabold" textAnchor="middle">b² = 16</text>

            <polygon points="0,0 110,0 0,-95" fill="#10b981" fillOpacity="0.5" stroke="#10b981" strokeWidth="3" />
            <rect x="0" y="-15" width="15" height="15" fill="none" stroke="#10b981" strokeWidth="2" />
            <line x1="0" y1="-95" x2="110" y2="0" stroke="#ec4899" strokeWidth="4" />

            {/* Partikel Cairan Mengalir */}
            <path d="M 55 0 L 55 -47" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="6,6" fill="none" style={{ animation: 'dashStream 0.8s linear infinite' }} />
            <path d="M 0 -47 L 55 -47" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="6,6" fill="none" style={{ animation: 'dashStream 0.8s linear infinite' }} />
          </g>

          <g transform="translate(420, 60)">
            <rect x="0" y="0" width="165" height="195" rx="14" fill="#0f172a" stroke="#ec4899" strokeWidth="2.5" style={{ animation: 'solarPulse 4s infinite' }} />
            <text x="82" y="32" fill="#f472b6" fontSize="15" fontWeight="bold" textAnchor="middle">Dalil Pythagoras</text>
            <text x="82" y="65" fill="#fde047" fontSize="16" fontWeight="extrabold" textAnchor="middle">a² + b² = c²</text>
            <line x1="20" y1="80" x2="145" y2="80" stroke="#334155" strokeWidth="1.5" />
            <text x="82" y="105" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">9 + 16 = 25</text>
            <text x="82" y="130" fill="#4ade80" fontSize="15" fontWeight="extrabold" textAnchor="middle">c = √25 = 5</text>
            <text x="82" y="165" fill="#cbd5e1" fontSize="11" textAnchor="middle">Triple: 3, 4, 5 ✓</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 7. PEREDARAN DARAH                                                   */}
      {/* ==================================================================== */}
      {type === 'blood_circulation' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          {/* Jantung Berdetak Ritmik */}
          <g transform="translate(300, 160)">
            <g style={{ animation: 'heartLubDub 1.1s ease-in-out infinite', transformOrigin: '0px 0px' }}>
              <path
                d="M 0 -25 C -25 -60 -70 -30 -70 15 C -70 55 0 95 0 105 C 0 95 70 55 70 15 C 70 -30 25 -60 0 -25 Z"
                fill="#dc2626"
                stroke="#fca5a5"
                strokeWidth="4"
              />
              <text x="0" y="25" fill="#fff" fontSize="13" fontWeight="extrabold" textAnchor="middle">JANTUNG</text>
              <text x="0" y="42" fill="#fecaca" fontSize="9.5" textAnchor="middle">4 Ruang</text>
            </g>
          </g>

          {/* Darah Merah Mengalir Cepat */}
          <path
            d="M 330 140 C 440 80, 520 120, 520 200 C 520 270, 380 280, 320 230"
            stroke="#ef4444"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 330 140 C 440 80, 520 120, 520 200 C 520 270, 380 280, 320 230"
            stroke="#fecaca"
            strokeWidth="3.5"
            strokeDasharray="10,14"
            fill="none"
            style={{ animation: 'dashStream 1s linear infinite' }}
          />

          {/* Darah Biru Mengalir Balik */}
          <path
            d="M 270 230 C 200 280, 80 270, 80 180 C 80 100, 180 80, 270 140"
            stroke="#0284c7"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 270 230 C 200 280, 80 270, 80 180 C 80 100, 180 80, 270 140"
            stroke="#bae6fd"
            strokeWidth="3.5"
            strokeDasharray="10,14"
            fill="none"
            style={{ animation: 'dashStream 1s linear infinite' }}
          />

          <g transform="translate(100, 50)">
            <rect x="0" y="0" width="130" height="35" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            <text x="65" y="22" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">🫁 Paru-Paru</text>
          </g>

          <g transform="translate(370, 50)">
            <rect x="0" y="0" width="130" height="35" rx="8" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            <text x="65" y="22" fill="#fca5a5" fontSize="11" fontWeight="bold" textAnchor="middle">👤 Seluruh Tubuh</text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 8. HUKUM GERAK NEWTON                                                */}
      {/* ==================================================================== */}
      {type === 'newton_dynamics' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
          <rect x="0" y="230" width="600" height="70" fill="#1e293b" />
          <line
            x1="0"
            y1="265"
            x2="600"
            y2="265"
            stroke="#facc15"
            strokeWidth="4"
            strokeDasharray="30,25"
            style={{ animation: 'roadScrollAnim 0.5s linear infinite' }}
          />

          <g transform="translate(200, 140)">
            <rect x="0" y="20" width="180" height="60" rx="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" />
            <polygon points="40,20 70,-10 130,-10 150,20" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="50,18 73,-5 125,-5 142,18" fill="#e0f2fe" opacity="0.75" />
            <text x="90" y="55" fill="#fff" fontSize="13" fontWeight="extrabold" textAnchor="middle">Massa m = 2 kg</text>

            {/* Roda Kiri Berputar */}
            <g transform="translate(45, 80)">
              <g style={{ animation: 'wheelSpinAnim 0.4s linear infinite', transformOrigin: '0px 0px' }}>
                <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#f59e0b" strokeWidth="2.5" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#f59e0b" strokeWidth="2.5" />
              </g>
            </g>

            {/* Roda Kanan Berputar */}
            <g transform="translate(135, 80)">
              <g style={{ animation: 'wheelSpinAnim 0.4s linear infinite', transformOrigin: '0px 0px' }}>
                <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#f59e0b" strokeWidth="2.5" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#f59e0b" strokeWidth="2.5" />
              </g>
            </g>

            {/* Panah Gaya F */}
            <g transform="translate(185, 45)">
              <line x1="0" y1="0" x2="95" y2="0" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
              <polygon points="95,-10 115,0 95,10" fill="#22c55e" />
              <text x="50" y="-12" fill="#4ade80" fontSize="13" fontWeight="extrabold" textAnchor="middle">Gaya F = 10 N ➔</text>
            </g>
          </g>

          <g transform="translate(180, 25)">
            <rect x="0" y="0" width="240" height="42" rx="10" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
            <text x="120" y="26" fill="#4ade80" fontSize="15" fontWeight="extrabold" textAnchor="middle">
              F = m · a ➔ a = F / m
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 9. MATEMATIKA SD: PECAHAN PIZZA & ARITMATIKA BERGAMBAR (CERIA & RAMAH ANAK) */}
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

          {/* Latar Dapur Pizzeria Hangat & Papan Kayu */}
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Papan Talenan Kayu Pizza */}
          <circle cx="215" cy="155" r="105" fill="url(#woodenBoard)" stroke="#5c2606" strokeWidth="6" />
          <rect x="90" y="146" width="30" height="18" rx="4" fill="#78350f" />

          {/* Uap Hangat Pizza Baru Matang */}
          <g transform="translate(215, 95)" opacity="0.8">
            <path d="M -20 0 Q -15 -20, -25 -40" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ animation: 'vaporFloatUp 2s linear infinite' }} />
            <path d="M 0 0 Q 8 -22, -2 -45" stroke="#fde047" strokeWidth="3" fill="none" strokeLinecap="round" style={{ animation: 'vaporFloatUp 2.3s linear infinite 0.4s' }} />
            <path d="M 22 0 Q 30 -18, 18 -42" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ animation: 'vaporFloatUp 2s linear infinite 0.8s' }} />
          </g>

          {/* KONTEN BERDASARKAN BABAK (STEP 0, 1, 2, 3) */}
          {/* STEP 0: SATU LOYANG UTUH (1/1) */}
          {step === 0 && (
            <g transform="translate(215, 155)">
              {/* Lingkaran Pizza Utuh */}
              <circle cx="0" cy="0" r="90" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="4" />
              <circle cx="0" cy="0" r="78" fill="#fde047" stroke="#ea580c" strokeWidth="1.5" />

              {/* Topping Keju Meleleh & Pepperoni */}
              {[
                { x: -35, y: -25 },
                { x: 25, y: -35 },
                { x: 38, y: 22 },
                { x: -25, y: 35 },
                { x: 0, y: 0 },
                { x: -45, y: 8 },
                { x: 30, y: -2 },
              ].map((pos, idx) => (
                <g key={idx} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle cx="0" cy="0" r="11" fill="url(#pepperoniGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
                  <circle cx="-3" cy="-3" r="2.5" fill="#fca5a5" />
                </g>
              ))}

              {/* Daun Basil Hijau Segar */}
              <circle cx="-15" cy="-12" r="4" fill="#15803d" />
              <circle cx="18" cy="15" r="4.5" fill="#16a34a" />
              <circle cx="12" cy="-22" r="3.5" fill="#15803d" />
              <circle cx="-20" cy="18" r="4" fill="#22c55e" />

              {/* Lencana Pecahan 1 Utuh */}
              <g transform="translate(0, 0)">
                <rect x="-48" y="-16" width="96" height="32" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" filter="url(#goldenSliceGlow)" />
                <text x="0" y="6" fill="#fef08a" fontSize="15" fontWeight="900" textAnchor="middle">1 UTUH</text>
              </g>
            </g>
          )}

          {/* STEP 1: DIPOTONG MENJADI 4 BAGIAN SAMA BESAR (1/4) */}
          {step === 1 && (
            <g transform="translate(215, 155)">
              {/* 3 Potongan yang Tetap di Loyang */}
              {/* Potongan Kiri Atas */}
              <path d="M 0 0 L -90 0 A 90 90 0 0 1 0 -90 Z" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="2" />
              <circle cx="-32" cy="-32" r="9" fill="url(#pepperoniGrad)" />
              <text x="-40" y="-35" fill="#0f172a" fontSize="11" fontWeight="bold">1/4</text>

              {/* Potongan Kiri Bawah */}
              <path d="M 0 0 L 0 90 A 90 90 0 0 1 -90 0 Z" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="2" />
              <circle cx="-32" cy="32" r="9" fill="url(#pepperoniGrad)" />
              <text x="-40" y="42" fill="#0f172a" fontSize="11" fontWeight="bold">1/4</text>

              {/* Potongan Kanan Bawah */}
              <path d="M 0 0 L 90 0 A 90 90 0 0 1 0 90 Z" fill="url(#pizzaCrust)" stroke="#78350f" strokeWidth="2" />
              <circle cx="32" cy="32" r="9" fill="url(#pepperoniGrad)" />
              <text x="32" y="42" fill="#0f172a" fontSize="11" fontWeight="bold">1/4</text>

              {/* 1 POTONGAN KANAN ATAS YANG TERANGKAT & BERSINAR (1/4) */}
              <g style={{ animation: 'sliceHoverAnim 1.8s ease-in-out infinite' }}>
                <path d="M 0 0 L 0 -90 A 90 90 0 0 1 90 0 Z" fill="#fde047" stroke="#ea580c" strokeWidth="3" filter="url(#goldenSliceGlow)" />
                <circle cx="32" cy="-32" r="10" fill="url(#pepperoniGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
                <circle cx="28" cy="-35" r="2.5" fill="#fca5a5" />
                <circle cx="45" cy="-15" r="4" fill="#15803d" />

                {/* Tag Nilai Pecahan Melayang */}
                <g transform="translate(50, -50)">
                  <rect x="-26" y="-14" width="52" height="28" rx="6" fill="#0f172a" stroke="#fde047" strokeWidth="2" />
                  <text x="0" y="5" fill="#4ade80" fontSize="13" fontWeight="900" textAnchor="middle">1 / 4</text>
                </g>
              </g>
            </g>
          )}

          {/* STEP 2: PENJUMLAHAN 1/4 + 1/4 = 2/4 = 1/2 */}
          {step === 2 && (
            <g transform="translate(215, 155)">
              {/* Setengah Kiri */}
              <path d="M 0 0 L 0 -90 A 90 90 0 0 0 0 90 Z" fill="#78350f" opacity="0.6" stroke="#451a03" strokeWidth="2" />

              {/* Setengah Kanan (2 Potong = 1/2) Bersinar Terang */}
              <g filter="url(#goldenSliceGlow)">
                <path d="M 0 0 L 0 -90 A 90 90 0 0 1 0 90 Z" fill="url(#pizzaCrust)" stroke="#f59e0b" strokeWidth="3.5" />
                <line x1="0" y1="0" x2="90" y2="0" stroke="#ea580c" strokeWidth="2" strokeDasharray="4,3" />

                <circle cx="32" cy="-32" r="10" fill="url(#pepperoniGrad)" />
                <circle cx="32" cy="32" r="10" fill="url(#pepperoniGrad)" />
                <circle cx="45" cy="0" r="9" fill="url(#pepperoniGrad)" />

                {/* Label 1/4 + 1/4 */}
                <rect x="18" y="-45" width="46" height="20" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="41" y="-31" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="middle">1/4 potong</text>

                <rect x="18" y="25" width="46" height="20" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="41" y="39" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="middle">1/4 potong</text>

                {/* Badge Tengah: 2/4 = 1/2 */}
                <g transform="translate(70, 0)">
                  <rect x="-30" y="-16" width="60" height="32" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                  <text x="0" y="5" fill="#4ade80" fontSize="13" fontWeight="900" textAnchor="middle">= 1 / 2</text>
                </g>
              </g>
            </g>
          )}

          {/* STEP 3: BERBAGI ADIL KEPADA TEMAN */}
          {step === 3 && (
            <g transform="translate(215, 155)">
              {/* 4 Piring Lucu Warna-Warni Berisi 1 Potong Pizza Tiap Teman */}
              <g transform="translate(-55, -55)">
                <circle cx="0" cy="0" r="32" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
                <path d="M 0 0 L -22 0 A 22 22 0 0 1 0 -22 Z" fill="#fde047" stroke="#ea580c" strokeWidth="1.5" />
                <text x="0" y="16" fill="#e0f2fe" fontSize="9" fontWeight="bold" textAnchor="middle">👦 Budi (1/4)</text>
              </g>

              <g transform="translate(55, -55)">
                <circle cx="0" cy="0" r="32" fill="#db2777" stroke="#f472b6" strokeWidth="2.5" />
                <path d="M 0 0 L 0 -22 A 22 22 0 0 1 22 0 Z" fill="#fde047" stroke="#ea580c" strokeWidth="1.5" />
                <text x="0" y="16" fill="#fdf2f8" fontSize="9" fontWeight="bold" textAnchor="middle">👧 Siti (1/4)</text>
              </g>

              <g transform="translate(-55, 55)">
                <circle cx="0" cy="0" r="32" fill="#16a34a" stroke="#4ade80" strokeWidth="2.5" />
                <path d="M 0 0 L 0 22 A 22 22 0 0 1 -22 0 Z" fill="#fde047" stroke="#ea580c" strokeWidth="1.5" />
                <text x="0" y="16" fill="#f0fdf4" fontSize="9" fontWeight="bold" textAnchor="middle">🧒 Edo (1/4)</text>
              </g>

              <g transform="translate(55, 55)">
                <circle cx="0" cy="0" r="32" fill="#ea580c" stroke="#fb923c" strokeWidth="2.5" />
                <path d="M 0 0 L 22 0 A 22 22 0 0 1 0 22 Z" fill="#fde047" stroke="#ea580c" strokeWidth="1.5" />
                <text x="0" y="16" fill="#fff7ed" fontSize="9" fontWeight="bold" textAnchor="middle">👧 Lani (1/4)</text>
              </g>

              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              <text x="0" y="4" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">🤝</text>
            </g>
          )}

          {/* ================================================================ */}
          {/* SISI KANAN: PAPAN EDUKASI ANGKA & RUMUS RAMAH ANAK               */}
          {/* ================================================================ */}
          <g transform="translate(360, 36)">
            <rect x="0" y="0" width="225" height="242" rx="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />

            {/* Header Papan Rumus */}
            <rect x="0" y="0" width="225" height="34" rx="14" fill="#1e293b" />
            <text x="112" y="22" fill="#fbbf24" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              📚 RUMUS PECAHAN SERU
            </text>

            {/* Ilustrasi Kotak Pecahan Besar */}
            <g transform="translate(20, 48)">
              {/* Pembilang */}
              <rect x="0" y="0" width="185" height="42" rx="8" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="26" y="27" fill="#38bdf8" fontSize="22" fontWeight="900" textAnchor="middle">
                {step === 0 ? '1' : step === 1 ? '1' : step === 2 ? '2' : '4'}
              </text>
              <text x="52" y="18" fill="#e0f2fe" fontSize="10.5" fontWeight="bold">PEMBILANG (Atas)</text>
              <text x="52" y="32" fill="#94a3b8" fontSize="8.5">Jumlah potong yang diambil</text>

              {/* Garis Pecahan (Per) */}
              <line x1="8" y1="48" x2="177" y2="48" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />

              {/* Penyebut */}
              <rect x="0" y="54" width="185" height="42" rx="8" fill="#1e1b4b" stroke="#ec4899" strokeWidth="1.5" />
              <text x="26" y="81" fill="#ec4899" fontSize="22" fontWeight="900" textAnchor="middle">
                {step === 0 ? '1' : '4'}
              </text>
              <text x="52" y="72" fill="#fdf2f8" fontSize="10.5" fontWeight="bold">PENYEBUT (Bawah)</text>
              <text x="52" y="86" fill="#94a3b8" fontSize="8.5">Total semua potongan pizza</text>
            </g>

            {/* Kartu Penjelasan Singkat Babak */}
            <g transform="translate(15, 158)">
              <rect x="0" y="0" width="195" height="68" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <text x="10" y="20" fill="#fef08a" fontSize="10.5" fontWeight="bold">
                {step === 0 && '💡 1 Utuh: Belum Dipotong'}
                {step === 1 && '💡 1/4: Satu per Empat'}
                {step === 2 && '💡 2/4 = 1/2: Setengah'}
                {step === 3 && '💡 Berbagi 4 Teman Rata'}
              </text>
              <text x="10" y="38" fill="#cbd5e1" fontSize="9">
                {step === 0 && 'Satu kue bulat utuh bernilai 1.'}
                {step === 1 && 'Dipotong 4, ambil 1 bagian pizza.'}
                {step === 2 && '2 potong sama dengan setengah loyang!'}
                {step === 3 && 'Setiap anak mendapatkan 1/4 adil!'}
              </text>
              <text x="10" y="55" fill="#4ade80" fontSize="8.5" fontWeight="bold">
                {step === 0 && 'Bentuk Matematika: 1 / 1'}
                {step === 1 && 'Bentuk Matematika: 1 / 4'}
                {step === 2 && 'Pecahan Senilai: 2/4 = 1/2'}
                {step === 3 && 'Hasil: 1/4 + 1/4 + 1/4 + 1/4 = 1'}
              </text>
            </g>
          </g>

          {/* Banner Bawah */}
          <text x="300" y="306" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
            🍕 Video Animasi Edukasi Pecahan Nyata • Perpustakaan RadenWorld
          </text>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 10. PANCASILA & PKN SD: GARUDA DENGAN 5 PERISAI LAMBANG SILA        */}
      {/* ==================================================================== */}
      {type === 'pancasila_shield' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* 5 Perisai Sila Pancasila */}
          <g transform="translate(180, 150)">
            {/* Sayap Garuda Emas */}
            <path d="M 0 -80 C -60 -100, -140 -50, -150 20 C -120 40, -80 30, -50 0 Z" fill="#f59e0b" opacity="0.6" />
            <path d="M 0 -80 C 60 -100, 140 -50, 150 20 C 120 40, 80 30, 50 0 Z" fill="#f59e0b" opacity="0.6" />

            {/* Perisai Jantung Pusat */}
            <path d="M 0 -70 L 65 -50 L 65 30 Q 0 95, 0 95 Q -65 30, -65 30 L -65 -50 Z" fill="#1e1b4b" stroke="#e2e8f0" strokeWidth="4" />

            {/* Sila 1: Bintang Emas Pusat */}
            <circle cx="0" cy="0" r="24" fill={step === 0 ? '#fde047' : '#1e293b'} stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="6" fontSize="16" textAnchor="middle">⭐</text>

            {/* Sila 2: Rantai Baja (Kanan Bawah) */}
            <circle cx="34" cy="34" r="16" fill={step === 1 ? '#fde047' : '#1e293b'} stroke="#ea580c" strokeWidth="2" />
            <text x="34" y="40" fontSize="12" textAnchor="middle">⛓️</text>

            {/* Sila 3: Pohon Beringin (Kanan Atas) */}
            <circle cx="34" cy="-30" r="16" fill={step === 2 ? '#86efac' : '#1e293b'} stroke="#16a34a" strokeWidth="2" />
            <text x="34" y="-24" fontSize="12" textAnchor="middle">🌳</text>

            {/* Sila 4: Kepala Banteng (Kiri Atas) */}
            <circle cx="-34" cy="-30" r="16" fill={step === 3 ? '#fca5a5' : '#1e293b'} stroke="#dc2626" strokeWidth="2" />
            <text x="-34" y="-24" fontSize="12" textAnchor="middle">🐂</text>

            {/* Sila 5: Padi & Kapas (Kiri Bawah) */}
            <circle cx="-34" cy="34" r="16" fill={step === 4 ? '#fef08a' : '#1e293b'} stroke="#eab308" strokeWidth="2" />
            <text x="-34" y="40" fontSize="12" textAnchor="middle">🌾</text>
          </g>

          {/* Sisi Kanan: Penjelasan Sila Ramah Anak */}
          <g transform="translate(360, 40)">
            <rect x="0" y="0" width="225" height="235" rx="14" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="0" y="0" width="225" height="34" rx="14" fill="#0f172a" />
            <text x="112" y="22" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
              🇮🇩 5 SILA GARUDA PANCASILA
            </text>

            <g transform="translate(15, 50)" className="space-y-1">
              {[
                { no: '1', name: 'Bintang Emas', text: 'Ketuhanan Yang Maha Esa (Berdoa & Taat Ibadah)' },
                { no: '2', name: 'Rantai Baja', text: 'Kemanusiaan yang Adil & Beradab (Sopan & Kasih Sayang)' },
                { no: '3', name: 'Pohon Beringin', text: 'Persatuan Indonesia (Rukun Bersama Teman)' },
                { no: '4', name: 'Kepala Banteng', text: 'Musyawarah & Mufakat (Bicara Baik-Baik)' },
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
      {/* 11. BAHASA INDONESIA SD: KERETA STRUKTUR KALIMAT SPOK                */}
      {/* ==================================================================== */}
      {type === 'spok_sentence' && (
        <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          {/* Rel Kereta Api Edukasi */}
          <line x1="20" y1="230" x2="580" y2="230" stroke="#475569" strokeWidth="6" />
          <line x1="20" y1="242" x2="580" y2="242" stroke="#475569" strokeWidth="6" />
          {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540].map((rx) => (
            <line key={rx} x1={rx} y1="224" x2={rx} y2="248" stroke="#94a3b8" strokeWidth="4" />
          ))}

          {/* Header Kereta Kalimat */}
          <text x="300" y="45" fill="#fef08a" fontSize="16" fontWeight="bold" textAnchor="middle">
            🚂 KERETA STRUKTUR KALIMAT PINTAR (S - P - O - K)
          </text>

          {/* Gerbong 1: Lokomotif SUBJEK (Siapa?) */}
          <g transform="translate(45, 95)">
            <rect x="0" y="20" width="115" height="75" rx="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
            <rect x="75" y="0" width="35" height="30" rx="6" fill="#0369a1" />
            <text x="57" y="42" fill="#e0f2fe" fontSize="12" fontWeight="900" textAnchor="middle">SUBJEK (S)</text>
            <text x="57" y="58" fill="#bae6fd" fontSize="9.5" textAnchor="middle">Pelaku Kalimat</text>
            <rect x="12" y="66" width="91" height="20" rx="4" fill="#0c4a6e" />
            <text x="57" y="80" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">🐱 Kucing Lucu</text>
            {/* Roda */}
            <circle cx="28" cy="100" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="85" cy="100" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          </g>

          {/* Sambungan */}
          <line x1="160" y1="165" x2="180" y2="165" stroke="#f59e0b" strokeWidth="6" />

          {/* Gerbong 2: PREDIKAT (Sedang Apa?) */}
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

          {/* Gerbong 3: OBJEK (Apa yang Dikenai?) */}
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

          {/* Gerbong 4: KETERANGAN (Di mana / Kapan?) */}
          <g transform="translate(450, 105)">
            <rect x="0" y="10" width="115" height="75" rx="10" fill="#9333ea" stroke="#c084fc" strokeWidth="2.5" />
            <text x="57" y="32" fill="#faf5ff" fontSize="12" fontWeight="900" textAnchor="middle">KETERANGAN (K)</text>
            <text x="57" y="48" fill="#e9d5ff" fontSize="9.5" textAnchor="middle">Tempat / Waktu</text>
            <rect x="12" y="56" width="91" height="20" rx="4" fill="#581c87" />
            <text x="57" y="70" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">🏡 Di Dapur Pagi Ini</text>
            <circle cx="28" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="85" cy="90" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          </g>

          {/* Kesimpulan Kalimat Utuh */}
          <g transform="translate(150, 260)">
            <rect x="0" y="0" width="300" height="36" rx="10" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            <text x="150" y="23" fill="#fef08a" fontSize="12" fontWeight="bold" textAnchor="middle">
              ✨ "Kucing lucu makan ikan goreng di dapur."
            </text>
          </g>
        </svg>
      )}

      {/* ==================================================================== */}
      {/* 12. DEFAULT FALLBACK: PAPAN TULIS KELAS CERIA RAMAH ANAK SD          */}
      {/* ==================================================================== */}
      {type !== 'photosynthesis' &&
        type !== 'water_cycle' &&
        type !== 'solar_system' &&
        type !== 'dna_helix' &&
        type !== 'bohr_atom' &&
        type !== 'pythagoras' &&
        type !== 'blood_circulation' &&
        type !== 'newton_dynamics' &&
        type !== 'math_arithmetic' &&
        type !== 'pancasila_shield' &&
        type !== 'spok_sentence' && (
          <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px] select-none">
            {/* Bingkai Papan Tulis Kayu & Latar Papan Hijau Hangat */}
            <rect x="10" y="10" width="580" height="300" rx="16" fill="#132e38" stroke="#b45309" strokeWidth="8" />
            <rect x="18" y="18" width="564" height="284" rx="10" fill="#0f262e" stroke="#1e3a47" strokeWidth="2" />

            {/* Garis Kisi Kapur Halus */}
            <line x1="28" y1="72" x2="572" y2="72" stroke="#1e404f" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Header Papan Tulis Ceria */}
            <g transform="translate(300, 46)">
              <text x="0" y="0" fill="#fef08a" fontSize="14" fontWeight="900" textAnchor="middle">
                🌟 LEMBAR BELAJAR CERIA ANAK PINTAR 🌟
              </text>
              <text x="0" y="18" fill="#a5f3fc" fontSize="10" fontWeight="bold" textAnchor="middle">
                Belajar Mudah, Menyenangkan & Penuh Petualangan di RadenWorld
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
              <text x="14" y="62" fill="#bae6fd" fontSize="9">
                Memahami konsep lewat hal seru yang
              </text>
              <text x="14" y="78" fill="#bae6fd" fontSize="9">
                sering kita temui di kehidupan sehari-hari!
              </text>
            </g>

            {/* Kartu 2: Contoh Nyata di Sekitar */}
            <g transform="translate(308, 88)">
              <rect x="0" y="0" width="255" height="92" rx="10" fill="#713f12" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="28" cy="28" r="16" fill="#b45309" />
              <text x="28" y="34" fontSize="15" textAnchor="middle">🔍</text>
              <text x="52" y="24" fill="#fbbf24" fontSize="11" fontWeight="bold">2. Contoh Nyata</text>
              <text x="52" y="38" fill="#fef08a" fontSize="9.5" fontWeight="bold">Ada di Sekitar Kita</text>
              <text x="14" y="62" fill="#fde68a" fontSize="9">
                Diterapkan pada buah, tanaman,
              </text>
              <text x="14" y="78" fill="#fde68a" fontSize="9">
                hewan lucu, dan kegiatan di sekolah!
              </text>
            </g>

            {/* Kartu 3: Tips Cepat & Rumus Gampang */}
            <g transform="translate(36, 192)">
              <rect x="0" y="0" width="255" height="92" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
              <circle cx="28" cy="28" r="16" fill="#047857" />
              <text x="28" y="34" fontSize="15" textAnchor="middle">💡</text>
              <text x="52" y="24" fill="#34d399" fontSize="11" fontWeight="bold">3. Tips Pintar</text>
              <text x="52" y="38" fill="#a7f3d0" fontSize="9.5" fontWeight="bold">Cara Gampang Mengingat</text>
              <text x="14" y="62" fill="#d1fae5" fontSize="9">
                Gunakan jembatan keledai dan cerita
              </text>
              <text x="14" y="78" fill="#d1fae5" fontSize="9">
                bergambar agar materi nempel di ingatan!
              </text>
            </g>

            {/* Kartu 4: Misi Kuis Berhadiah */}
            <g transform="translate(308, 192)">
              <rect x="0" y="0" width="255" height="92" rx="10" fill="#831843" stroke="#f43f5e" strokeWidth="2" />
              <circle cx="28" cy="28" r="16" fill="#be123c" />
              <text x="28" y="34" fontSize="15" textAnchor="middle">🎯</text>
              <text x="52" y="24" fill="#fb7185" fontSize="11" fontWeight="bold">4. Kuis Berhadiah</text>
              <text x="52" y="38" fill="#fecdd3" fontSize="9.5" fontWeight="bold">Kumpulkan Poin EXP!</text>
              <text x="14" y="62" fill="#ffe4e6" fontSize="9">
                Jawab pertanyaan kuis di sebelah kanan
              </text>
              <text x="14" y="78" fill="#ffe4e6" fontSize="9">
                untuk menambah EXP karaktermu!
              </text>
            </g>
          </svg>
        )}
    </div>
  );
};
