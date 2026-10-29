/**
 * ============================================================================
 * FILE: resources/js/game/ui/FishingMinigame.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Minigame Memancing Interaktif Cyber-Arcade Premium bergaya Stardew Valley:
 * 1. Hydro-Chamber Akuatik: Tabung air bercahaya neon dengan laser penargetan kedalaman.
 * 2. Holographic Catch Zone: Kotak hijau penangkap ikan beranimasi hologram & retikel bidik.
 * 3. Dynamic Fish AI: Ikan berenang naik-turun dengan perilaku dinamis & aura kelangkaan (Common, Uncommon, Rare, Legendary).
 * 4. Reactor Progress Gauge: Tabung energi vertikal segmented LED dengan persentase real-time.
 * 5. Fish Dossier Plaque: Panel info ikan lengkap dengan estimasi berat, reward koin/diamond, & status tarikan.
 * 6. Tactile Arcade Reel Button: Tombol mekanik berdaya tekan 3D responsif (Keyboard Space/F, Mouse, & Touch HP/Tablet).
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fish, X, Sparkles, AlertTriangle, Target, Zap, Waves, Radio, ShieldCheck, Coins, Gem, ArrowUp } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { IFishData } from '../controllers/CharacterController';

interface FishingMinigameProps {
  isOpen: boolean;
  fishData: IFishData | null;
  onSuccess: (fish: IFishData) => void;
  onFailed: () => void;
  onClose: () => void;
}

export const FishingMinigame: React.FC<FishingMinigameProps> = ({
  isOpen,
  fishData,
  onSuccess,
  onFailed,
  onClose,
}) => {
  if (!isOpen || !fishData) return null;

  const sound = SoundManager.getInstance();

  // Deteksi ukuran layar peramban untuk adaptasi layout horizontal (landscape) vs vertikal (portrait)
  const [screenHeight, setScreenHeight] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 600);
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isLandscape = screenWidth > screenHeight && screenHeight < 560;
  const isShortScreen = screenHeight < 620;

  // Dimensi Track Minigame dinamis agar pas 100% di semua HP (baik landscape maupun portrait)
  const TRACK_HEIGHT = isLandscape ? 145 : isShortScreen ? 185 : 235;
  const BAR_HEIGHT = Math.round(TRACK_HEIGHT * (fishData.rarity === 'Legendary' ? 0.30 : fishData.rarity === 'Rare' ? 0.36 : 0.42));
  const FISH_SIZE = isLandscape ? 22 : 26;

  // Status Fisika Bar Hijau (0 = bawah, TRACK_HEIGHT - BAR_HEIGHT = atas)
  const barYRef = useRef<number>(20);
  const barVelocityRef = useRef<number>(0);
  const isPressingRef = useRef<boolean>(false);
  const [isReeling, setIsReeling] = useState<boolean>(false);

  // Status Ikan (0 = bawah, TRACK_HEIGHT - FISH_SIZE = atas)
  const fishYRef = useRef<number>(40);
  const fishTargetYRef = useRef<number>(80);
  const fishNextMoveTimeRef = useRef<number>(0);

  // Meteran Tangkapan (0.0 s/d 100.0)
  const progressRef = useRef<number>(38); // Modal awal 38%
  const [displayProgress, setDisplayProgress] = useState<number>(38);
  const [displayBarY, setDisplayBarY] = useState<number>(20);
  const [displayFishY, setDisplayFishY] = useState<number>(40);
  const [isFishInside, setIsFishInside] = useState<boolean>(false);

  // Efek Getar / Suara Strike
  const wasInsideRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Input Mouse / Keyboard / Touch (Anti-Popup Menu Browser saat Tahan Layar)
  const handlePressStart = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isPressingRef.current) {
      sound.playClick();
    }
    isPressingRef.current = true;
    setIsReeling(true);
  }, [sound]);

  const handlePressEnd = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isPressingRef.current = false;
    setIsReeling(false);
  }, []);

  // Keyboard Listeners (Space & F) dan Global Touch/Pointer Release
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF') {
        e.preventDefault();
        isPressingRef.current = true;
        setIsReeling(true);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF') {
        e.preventDefault();
        isPressingRef.current = false;
        setIsReeling(false);
      }
    };

    // Pastikan jika jari terangkat di manapun di layar mobile/tablet, penahanan joran berhenti
    const handleGlobalRelease = () => {
      isPressingRef.current = false;
      setIsReeling(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
    };
  }, [onClose]);

  // Main Loop Fisika Minigame (60 FPS)
  useEffect(() => {
    lastTimeRef.current = performance.now();
    let isGameOver = false;

    // Parameter kesulitan berdasarkan rarity
    const rarity = fishData.rarity;
    const fishSpeed = rarity === 'Legendary' ? 1.70 : rarity === 'Rare' ? 1.30 : rarity === 'Uncommon' ? 1.00 : 0.78;
    const fishChangeInterval = rarity === 'Legendary' ? 1200 : rarity === 'Rare' ? 1600 : 2100;
    const progressGainRate = 22; // +22% per detik saat di dalam kotak
    const progressDrainRate = rarity === 'Legendary' ? 11 : 8.5; // -8.5% s/d -11% per detik saat di luar kotak

    const gameLoop = (currentTime: number) => {
      if (isGameOver) return;

      const deltaMs = Math.min(50, currentTime - lastTimeRef.current);
      lastTimeRef.current = currentTime;
      const dt = deltaMs / 1000;

      // 1. FISIKA KOTAK HIJAU (GRAVITASI & DAYA ANGKAT RINGAN & APUNG)
      const gravity = -350;
      const lift = 780;

      if (isPressingRef.current) {
        barVelocityRef.current += lift * dt;
      } else {
        barVelocityRef.current += gravity * dt;
      }

      // Redaman udara (damping empuk dan stabil melayang)
      barVelocityRef.current *= Math.pow(0.92, dt * 60);
      barVelocityRef.current = Math.max(-380, Math.min(380, barVelocityRef.current));

      barYRef.current += barVelocityRef.current * dt;

      // Batas Bawah & Pantulan Lembut (Bounce)
      if (barYRef.current <= 0) {
        barYRef.current = 0;
        if (barVelocityRef.current < -60) {
          barVelocityRef.current = -barVelocityRef.current * 0.22;
        } else {
          barVelocityRef.current = 0;
        }
      }

      // Batas Atas
      const maxBarY = TRACK_HEIGHT - BAR_HEIGHT;
      if (barYRef.current >= maxBarY) {
        barYRef.current = maxBarY;
        if (barVelocityRef.current > 60) {
          barVelocityRef.current = -barVelocityRef.current * 0.18;
        } else {
          barVelocityRef.current = 0;
        }
      }

      // 2. AI PERILAKU IKAN (BERENANG NAIK-TURUN HALUS & STABIL)
      if (currentTime > fishNextMoveTimeRef.current) {
        fishNextMoveTimeRef.current = currentTime + fishChangeInterval + Math.random() * 500;
        const maxFishY = TRACK_HEIGHT - FISH_SIZE;
        fishTargetYRef.current = Math.random() * maxFishY;
      }

      // Gerakkan ikan ke target dengan interpolasi halus berirama
      const dy = fishTargetYRef.current - fishYRef.current;
      fishYRef.current += dy * Math.min(1.0, fishSpeed * dt * 1.5);

      // 3. DETEKSI APAKAH IKAN BERADA DI DALAM KOTAK HIJAU
      const fishCenter = fishYRef.current + FISH_SIZE / 2;
      const barBottom = barYRef.current;
      const barTop = barYRef.current + BAR_HEIGHT;
      const inside = fishCenter >= barBottom - 4 && fishCenter <= barTop + 4;

      setIsFishInside(inside);

      // Mainkan efek saat ikan baru masuk
      if (inside && !wasInsideRef.current) {
        sound.playHover();
      }
      wasInsideRef.current = inside;

      // 4. PEMBARUAN METER KEMAJUAN TANGKAPAN
      if (inside) {
        progressRef.current = Math.min(100, progressRef.current + progressGainRate * dt);
      } else {
        progressRef.current = Math.max(0, progressRef.current - progressDrainRate * dt);
      }

      setDisplayProgress(Math.round(progressRef.current));
      setDisplayBarY(barYRef.current);
      setDisplayFishY(fishYRef.current);

      // 5. EVALUASI MENANG / KALAH
      if (progressRef.current >= 100) {
        isGameOver = true;
        sound.playSuccess();
        onSuccess(fishData);
        return;
      }

      if (progressRef.current <= 0) {
        isGameOver = true;
        sound.playError();
        onFailed();
        return;
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [fishData, onSuccess, onFailed, sound, TRACK_HEIGHT, BAR_HEIGHT, FISH_SIZE]);

  // Tema Warna berdasarkan Rarity
  const rarityConfig = {
    Legendary: {
      borderGlow: 'border-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.5)]',
      badgeBg: 'bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
      nameGradient: 'from-amber-300 via-yellow-100 to-amber-400',
      fishGlow: 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-[0_0_18px_rgba(251,191,36,0.9)]',
      label: '🌟 LEGENDARIS',
    },
    Rare: {
      borderGlow: 'border-purple-400/70 shadow-[0_0_30px_rgba(192,132,252,0.4)]',
      badgeBg: 'bg-gradient-to-r from-purple-500/30 via-fuchsia-400/30 to-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(192,132,252,0.4)]',
      nameGradient: 'from-purple-300 via-fuchsia-100 to-purple-400',
      fishGlow: 'bg-gradient-to-tr from-purple-500 to-fuchsia-400 text-white shadow-[0_0_15px_rgba(192,132,252,0.8)]',
      label: '💎 LANGKA',
    },
    Uncommon: {
      borderGlow: 'border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.35)]',
      badgeBg: 'bg-gradient-to-r from-sky-500/30 via-cyan-400/30 to-sky-500/30 border-sky-400 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.3)]',
      nameGradient: 'from-sky-300 via-cyan-100 to-sky-400',
      fishGlow: 'bg-gradient-to-tr from-sky-500 to-cyan-300 text-black shadow-[0_0_12px_rgba(56,189,248,0.7)]',
      label: '🔷 UNCOMMON',
    },
    Common: {
      borderGlow: 'border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.25)]',
      badgeBg: 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400 text-emerald-200',
      nameGradient: 'from-emerald-300 via-teal-100 to-emerald-400',
      fishGlow: 'bg-gradient-to-tr from-emerald-500 to-teal-300 text-black shadow-[0_0_10px_rgba(52,211,153,0.6)]',
      label: '🌱 COMMON',
    },
  }[fishData.rarity] || {
    borderGlow: 'border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400',
    nameGradient: 'from-cyan-300 to-sky-100',
    fishGlow: 'bg-cyan-500 text-black shadow-cyan-400/50',
    label: fishData.rarity,
  };

  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md select-none touch-none pointer-events-auto font-['Chakra_Petch'] animate-fade-in"
      style={{ touchAction: 'none' }}
    >
      {/* ============================================================== */}
      {/* BINGKAI TERMINAL AKUATIK CYBERPUNK RADEN (FISHING CONSOLE)     */}
      {/* ============================================================== */}
      <div
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className={`relative bg-gradient-to-b from-[#0c1424]/95 via-[#070d18]/98 to-[#02050b]/98 border-2 ${rarityConfig.borderGlow} rounded-2xl text-neutral-100 max-h-[96dvh] max-w-[96vw] overflow-y-auto no-scrollbar backdrop-blur-xl transition-all duration-200 ${
          isLandscape
            ? 'p-3 sm:p-4 flex flex-row items-center gap-4 sm:gap-5'
            : 'p-3.5 sm:p-5 flex flex-col items-center'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Sudut Cybernetic Accent Brackets */}
        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400/70 pointer-events-none rounded-tl-sm" />
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400/70 pointer-events-none rounded-tr-sm" />
        <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400/70 pointer-events-none rounded-bl-sm" />
        <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400/70 pointer-events-none rounded-br-sm" />

        {/* Tombol Tutup / Batalkan */}
        <button
          onClick={onClose}
          type="button"
          tabIndex={-1}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-neutral-900 hover:bg-rose-900/90 text-white flex items-center justify-center border-2 border-neutral-700 hover:border-rose-400 shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-pointer transition-all active:scale-90 z-20"
          title="Batal Memancing"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        {/* ============================================================== */}
        {/* PANEL KIRI (atau ATAS di Portrait): HYDRO-CHAMBER & REACTOR    */}
        {/* ============================================================== */}
        <div className="flex items-center gap-3 sm:gap-4 bg-[#030814]/90 p-2.5 sm:p-3.5 rounded-2xl border border-cyan-500/30 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] shrink-0">
          
          {/* Hydro-Chamber (Tabung Air Vertikal) */}
          <div
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerCancel={handlePressEnd}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="relative w-15 sm:w-18 rounded-xl bg-gradient-to-b from-[#032f4c]/70 via-[#02182b]/90 to-[#010b14] border-2 border-cyan-400/60 overflow-hidden cursor-pointer shadow-[inset_0_0_20px_rgba(6,182,212,0.3),0_0_15px_rgba(6,182,212,0.15)] touch-none select-none"
            style={{ height: `${TRACK_HEIGHT}px`, touchAction: 'none' }}
          >
            {/* Grid & Indikator Skala Kedalaman Sonar */}
            <div className="absolute inset-y-0 left-1 w-2.5 flex flex-col justify-between py-2 pointer-events-none opacity-40 text-[7px] font-mono font-bold text-cyan-300">
              <span className="leading-none">0m</span>
              <span className="leading-none">10m</span>
              <span className="leading-none">20m</span>
              <span className="leading-none">30m</span>
            </div>

            {/* Garis Horizontal Scanline Kedalaman */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 px-3 pointer-events-none opacity-20">
              <div className="h-px bg-cyan-300" />
              <div className="h-px bg-cyan-300" />
              <div className="h-px bg-cyan-300" />
              <div className="h-px bg-cyan-300" />
              <div className="h-px bg-cyan-300" />
            </div>

            {/* Efek Riak Air / Gelembung Mikro Dinamis */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-200 absolute left-4 bottom-4 animate-ping duration-1000" />
              <div className="w-1 h-1 rounded-full bg-cyan-200 absolute right-4 bottom-12 animate-ping duration-700" />
            </div>

            {/* Holographic Catch Zone (Kotak Hijau Penangkap Ikan) */}
            <div
              className={`absolute inset-x-1.5 rounded-lg transition-all duration-75 flex flex-col justify-between p-1 pointer-events-none ${
                isFishInside
                  ? 'bg-gradient-to-b from-emerald-400/45 via-emerald-300/65 to-emerald-400/45 border-2 border-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.9),inset_0_0_12px_rgba(74,222,128,0.5)]'
                  : 'bg-gradient-to-b from-emerald-600/25 via-emerald-500/35 to-emerald-600/25 border-2 border-emerald-400/60 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
              }`}
              style={{
                height: `${BAR_HEIGHT}px`,
                bottom: `${displayBarY}px`,
              }}
            >
              {/* Garis Pembidik Laser Tengah */}
              <div className="flex items-center justify-between opacity-80">
                <span className="text-[7px] font-mono font-black text-emerald-100 tracking-tighter">[</span>
                <span className="text-[7px] font-mono font-black text-emerald-100 tracking-tighter">]</span>
              </div>
              <div className="w-full h-1 bg-white/70 rounded-full shadow-[0_0_6px_#fff]" />
              <div className="flex items-center justify-between opacity-80">
                <span className="text-[7px] font-mono font-black text-emerald-100 tracking-tighter">[</span>
                <span className="text-[7px] font-mono font-black text-emerald-100 tracking-tighter">]</span>
              </div>
            </div>

            {/* Entity Ikan Berenang (Fish Target with Lock Reticle) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-transform duration-75 pointer-events-none"
              style={{
                bottom: `${displayFishY}px`,
                width: `${FISH_SIZE}px`,
                height: `${FISH_SIZE}px`,
              }}
            >
              <div
                className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-lg transition-all ${rarityConfig.fishGlow} ${
                  isFishInside ? 'scale-110 ring-2 ring-amber-300 animate-pulse' : ''
                }`}
              >
                <Fish className="w-4 h-4 stroke-[2.5]" />
                
                {/* Target Locked Reticle saat di dalam kotak hijau */}
                {isFishInside && (
                  <div className="absolute -inset-1.5 rounded-full border border-amber-300 border-dashed animate-spin pointer-events-none opacity-80" />
                )}
              </div>
            </div>
          </div>

          {/* Reactor Progress Gauge (Tabung Meteran Kemajuan Tangkapan) */}
          <div className="flex flex-col items-center">
            {/* Indikator Persentase Digital */}
            <span
              className={`text-[10px] sm:text-xs font-mono font-black mb-1 sm:mb-1.5 tracking-wider transition-colors ${
                displayProgress > 65
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : displayProgress > 30
                  ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse'
              }`}
            >
              {displayProgress}%
            </span>

            {/* Badan Tabung Reaktor */}
            <div
              className="relative w-4 sm:w-5 rounded-full bg-neutral-950 border-2 border-neutral-700/80 overflow-hidden flex flex-col justify-end p-0.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]"
              style={{ height: `${TRACK_HEIGHT}px` }}
            >
              {/* Garis Penanda Segmen (25%, 50%, 75%) */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none z-10 opacity-30">
                <div className="h-px bg-white mx-0.5" />
                <div className="h-px bg-white mx-0.5" />
                <div className="h-px bg-white mx-0.5" />
              </div>

              {/* Fluida Energi Kemajuan (Progress Fluid) */}
              <div
                className={`w-full rounded-full transition-all duration-75 relative ${
                  displayProgress > 65
                    ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-300 shadow-[0_0_15px_rgba(52,211,153,0.8)]'
                    : displayProgress > 30
                    ? 'bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                    : 'bg-gradient-to-t from-rose-700 via-rose-500 to-red-400 shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse'
                }`}
                style={{ height: `${displayProgress}%` }}
              >
                {/* Meniskus Cairan Bercahaya di Puncak Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-white/80 rounded-full shadow-[0_0_6px_#fff]" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL KANAN (atau BAWAH di Portrait): DOSSIER IKAN & KONTROL   */}
        {/* ============================================================== */}
        <div className={`flex flex-col ${isLandscape ? 'min-w-[210px] max-w-[280px] text-left' : 'w-full text-center mt-3 sm:mt-4'}`}>
          
          {/* Header Sub-Judul Terminal */}
          <div className="flex items-center gap-1.5 text-cyan-400 text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase mb-1 justify-center sm:justify-start">
            <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
            <span>RADEN REEL TERMINAL // MK-II</span>
          </div>

          {/* Dossier Info Ikan */}
          <div className="bg-[#050a16]/80 p-2.5 sm:p-3 rounded-xl border border-neutral-800 text-left space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`text-xs sm:text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r ${rarityConfig.nameGradient} uppercase truncate`}>
                {fishData.name}
              </h3>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 border ${rarityConfig.badgeBg}`}>
                {rarityConfig.label}
              </span>
            </div>

            {/* Badges Estimasi Berat & Reward */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700/80 px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-300 font-bold">
                <span>⚖️ ~{fishData.weightKg} kg</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-md text-[10px] font-mono text-amber-300 font-bold">
                <Coins className="w-3 h-3" />
                <span>+{fishData.goldReward}G</span>
              </div>
              {fishData.diamondReward && (
                <div className="flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/40 px-2 py-0.5 rounded-md text-[10px] font-mono text-cyan-300 font-bold">
                  <Gem className="w-3 h-3" />
                  <span>+{fishData.diamondReward}💎</span>
                </div>
              )}
            </div>

            {/* Deskripsi Ikan */}
            <p className="text-[10px] text-neutral-400 italic line-clamp-2 leading-relaxed border-l-2 border-cyan-500/40 pl-2 mt-1">
              "{fishData.description}"
            </p>
          </div>

          {/* Live Status Plaque (Feedback Real-time) */}
          <div className="mt-2">
            {isFishInside ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-left animate-in fade-in">
                <Target className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-none">
                    TARGET TERKUNCI! (+)
                  </div>
                  <div className="text-[9px] text-emerald-400/80 truncate">
                    Pertahankan kotak hijau di posisi ikan!
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] text-left animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 animate-bounce" />
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-none">
                    IKAN LEPAS! (-)
                  </div>
                  <div className="text-[9px] text-rose-400/80 truncate">
                    Tahan tombol untuk angkat, lepas untuk turun!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tombol Sentuh / Tahan Joran Arcade Besar */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerCancel={handlePressEnd}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className={`w-full mt-2.5 py-2.5 sm:py-3 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase border-2 transition-all cursor-pointer select-none touch-none shadow-xl flex flex-col items-center justify-center gap-0.5 ${
              isReeling
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 border-emerald-200 text-black shadow-[0_0_30px_rgba(52,211,153,0.85)] scale-[0.98]'
                : isFishInside
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-300 text-white shadow-emerald-600/40 active:scale-95'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 border-amber-300 text-white shadow-amber-600/40 active:scale-95'
            }`}
            style={{ touchAction: 'none' }}
          >
            <div className="flex items-center gap-1.5">
              <Zap className={`w-4 h-4 ${isReeling ? 'fill-black stroke-black animate-bounce' : 'fill-white'}`} />
              <span>{isReeling ? 'SEDANG MENARIK JORAN...' : 'TAHAN ANGKAT JORAN'}</span>
            </div>
            <span className="text-[8.5px] font-mono tracking-widest opacity-80 font-normal">
              {isReeling ? '[ LEPAS UNTUK MENURUNKAN KOTAK ]' : '⌨️ SPASI / F • 📱 TAHAN TOMBOL'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
