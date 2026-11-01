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
      {/* 9. DEFAULT & TIPE LAINNYA (DENGAN ANIMASI AKTIF)                      */}
      {/* ==================================================================== */}
      {type !== 'photosynthesis' &&
        type !== 'water_cycle' &&
        type !== 'solar_system' &&
        type !== 'dna_helix' &&
        type !== 'bohr_atom' &&
        type !== 'pythagoras' &&
        type !== 'blood_circulation' &&
        type !== 'newton_dynamics' && (
          <svg viewBox="0 0 600 320" className="w-full h-full max-h-[320px]">
            {/* Koneksi Sinapsis Elektrik */}
            <g transform="translate(300, 160)">
              <line x1="0" y1="0" x2="-140" y2="-75" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="6,6" style={{ animation: 'dashStream 0.8s linear infinite' }} />
              <line x1="0" y1="0" x2="140" y2="-75" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="6,6" style={{ animation: 'dashStream 0.8s linear infinite' }} />
              <line x1="0" y1="0" x2="-140" y2="75" stroke="#10b981" strokeWidth="3.5" strokeDasharray="6,6" style={{ animation: 'dashStream 0.8s linear infinite' }} />
              <line x1="0" y1="0" x2="140" y2="75" stroke="#ec4899" strokeWidth="3.5" strokeDasharray="6,6" style={{ animation: 'dashStream 0.8s linear infinite' }} />

              <circle cx="0" cy="0" r="48" fill="#1e1b4b" stroke="#818cf8" strokeWidth="3.5" style={{ animation: 'solarPulse 2s infinite' }} />
              <text x="0" y="-3" fill="#c7d2fe" fontSize="13" fontWeight="extrabold" textAnchor="middle">KONSEP</text>
              <text x="0" y="14" fill="#a5b4fc" fontSize="10" fontWeight="bold" textAnchor="middle">UTAMA 🧠</text>

              <g transform="translate(-140, -75)">
                <circle cx="0" cy="0" r="34" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="0" y="4" fill="#bae6fd" fontSize="10.5" fontWeight="bold" textAnchor="middle">Definisi</text>
              </g>
              <g transform="translate(140, -75)">
                <circle cx="0" cy="0" r="34" fill="#78350f" stroke="#f59e0b" strokeWidth="2.5" />
                <text x="0" y="4" fill="#fde047" fontSize="10.5" fontWeight="bold" textAnchor="middle">Rumus</text>
              </g>
              <g transform="translate(-140, 75)">
                <circle cx="0" cy="0" r="34" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
                <text x="0" y="4" fill="#a7f3d0" fontSize="10.5" fontWeight="bold" textAnchor="middle">Contoh</text>
              </g>
              <g transform="translate(140, 75)">
                <circle cx="0" cy="0" r="34" fill="#701a75" stroke="#ec4899" strokeWidth="2.5" />
                <text x="0" y="4" fill="#fbcfe8" fontSize="10.5" fontWeight="bold" textAnchor="middle">Kuis 🎯</text>
              </g>
            </g>

            <text x="300" y="295" fill="#94a3b8" fontSize="12" textAnchor="middle">
              ✨ Video Animasi Edukasi Ilmiah 60 FPS • Perpustakaan RadenWorld
            </text>
          </svg>
        )}
    </div>
  );
};
