/**
 * ============================================================================
 * FILE: resources/js/game/ui/FishingMinigame.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Minigame Memancing Interaktif bergaya Stardew Valley:
 * 1. Simpel, bersih, dan bebas tombol X yang mengganggu.
 * 2. Fisika kotak hijau sangat responsif:
 *    - Ketukan (tap / klik / Spasi / F) memberikan dorongan lompat ke atas instan.
 *    - Penahanan (hold) mengangkat kotak hijau secara mulus dan cepat.
 *    - Pelepasan (release) menurunkan kotak dengan gravitasi alami.
 * 3. Meter kemajuan tangkapan (Catch Progress):
 *    - Bertambah saat ikan berada di dalam kotak hijau.
 *    - Berkurang saat ikan lepas dari kotak hijau.
 * 4. Menang (100%) -> Ikan tertangkap! Kalah (0%) -> Ikan kabur!
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fish, Sparkles } from 'lucide-react';
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

  const isLandscape = screenWidth > screenHeight && screenHeight < 550;
  const isShortScreen = screenHeight < 580;

  // Dimensi Track Minigame dinamis agar pas 100% di semua HP (baik landscape maupun portrait)
  const TRACK_HEIGHT = isLandscape ? 140 : isShortScreen ? 180 : 220;
  const BAR_HEIGHT = Math.round(TRACK_HEIGHT * (fishData.rarity === 'Legendary' ? 0.36 : fishData.rarity === 'Rare' ? 0.42 : 0.48));
  const FISH_SIZE = 24;

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
  const progressRef = useRef<number>(40); // Modal awal nyaman 40%
  const [displayProgress, setDisplayProgress] = useState<number>(40);
  const [displayBarY, setDisplayBarY] = useState<number>(20);
  const [displayFishY, setDisplayFishY] = useState<number>(40);
  const [isFishInside, setIsFishInside] = useState<boolean>(false);

  // Efek Getar / Suara Strike
  const wasInsideRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Input Mouse / Keyboard / Touch (Dorongan Angkat Halus & Terkontrol)
  const handlePressStart = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isPressingRef.current) {
      sound.playClick();
      // Dorongan ke atas lembut dan nyaman saat diketuk (tidak melesat kencang)
      barVelocityRef.current = Math.max(barVelocityRef.current + 65, 95);
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
        if (!isPressingRef.current) {
          sound.playClick();
          barVelocityRef.current = Math.max(barVelocityRef.current + 65, 95);
        }
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
  }, [onClose, sound]);

  // Main Loop Fisika Minigame (60 FPS)
  useEffect(() => {
    lastTimeRef.current = performance.now();
    let isGameOver = false;

    // Parameter kesulitan berdasarkan rarity (Kecepatan tenang & ritmis, tidak lagi liar)
    const rarity = fishData.rarity;
    const fishSpeed = rarity === 'Legendary' ? 1.05 : rarity === 'Rare' ? 0.80 : rarity === 'Uncommon' ? 0.60 : 0.45;
    const fishChangeInterval = rarity === 'Legendary' ? 1800 : rarity === 'Rare' ? 2400 : 3000;
    const progressGainRate = 24; // +24% per detik saat di dalam kotak
    const progressDrainRate = rarity === 'Legendary' ? 9 : 7; // -7% s/d -9% per detik saat di luar kotak

    const gameLoop = (currentTime: number) => {
      if (isGameOver) return;

      const deltaMs = Math.min(50, currentTime - lastTimeRef.current);
      lastTimeRef.current = currentTime;
      const dt = deltaMs / 1000;

      // 1. FISIKA KOTAK HIJAU (Halus, Stabil, & Nyaman Dikontrol)
      const gravity = -250; // Kecepatan turun yang tenang & wajar (sebelumnya -420, terlalu curam)
      const lift = 520;    // Kecepatan angkat joran stabil (sebelumnya 960, melesat ke atas)

      if (isPressingRef.current) {
        barVelocityRef.current += lift * dt;
      } else {
        barVelocityRef.current += gravity * dt;
      }

      // Redaman halus agar momentum tetap empuk dan tidak liar
      barVelocityRef.current *= Math.pow(0.93, dt * 60);
      barVelocityRef.current = Math.max(-230, Math.min(250, barVelocityRef.current));

      barYRef.current += barVelocityRef.current * dt;

      // Batas Bawah & Pantulan Ringan
      if (barYRef.current <= 0) {
        barYRef.current = 0;
        if (barVelocityRef.current < -40) {
          barVelocityRef.current = -barVelocityRef.current * 0.18;
        } else {
          barVelocityRef.current = 0;
        }
      }

      // Batas Atas
      const maxBarY = TRACK_HEIGHT - BAR_HEIGHT;
      if (barYRef.current >= maxBarY) {
        barYRef.current = maxBarY;
        barVelocityRef.current = 0;
      }

      // 2. AI PERILAKU IKAN (BERENANG TENANG, REALISTIS, & BERIRAMA)
      if (currentTime > fishNextMoveTimeRef.current) {
        fishNextMoveTimeRef.current = currentTime + fishChangeInterval + Math.random() * 800;
        const maxFishY = TRACK_HEIGHT - FISH_SIZE;
        fishTargetYRef.current = Math.random() * maxFishY;
      }

      // Gerakkan ikan ke target dengan luncuran renang halus alami
      const dy = fishTargetYRef.current - fishYRef.current;
      fishYRef.current += dy * Math.min(1.0, fishSpeed * dt * 2.2);

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

  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 select-none touch-none pointer-events-auto font-['Chakra_Petch'] animate-fade-in"
      style={{ touchAction: 'none' }}
    >
      {/* Bingkai Panel Sederhana, Elegan, & Bersih (Tanpa Tombol X) */}
      <div
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className={`relative bg-[#181615] border-2 border-neutral-700 rounded-2xl shadow-2xl text-neutral-100 max-h-[96dvh] max-w-[95vw] overflow-y-auto no-scrollbar ${
          isLandscape
            ? 'p-3 sm:p-4 flex flex-row items-center gap-4 sm:gap-5'
            : 'p-4 sm:p-5 flex flex-col items-center gap-3'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* ============================================================== */}
        {/* KIRI (atau ATAS di Portrait): JALUR AKUATIK + METERAN PROGRESS */}
        {/* ============================================================== */}
        <div className="flex items-center gap-3 bg-[#0c0a09] p-2.5 sm:p-3 rounded-xl border border-neutral-800 shadow-inner shrink-0">
          {/* Jalur Vertikal Akuatik Air */}
          <div
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerCancel={handlePressEnd}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="relative w-14 sm:w-16 rounded-lg bg-gradient-to-b from-[#0284c7]/50 via-[#0369a1]/70 to-[#082f49] border-2 border-sky-600/80 overflow-hidden cursor-pointer shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] touch-none select-none"
            style={{ height: `${TRACK_HEIGHT}px`, touchAction: 'none' }}
            title="Ketuk atau Tahan untuk mengangkat kotak hijau"
          >
            {/* Garis-Garis Kedalaman Air Mini */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none opacity-20">
              <div className="h-0.5 bg-sky-200" />
              <div className="h-0.5 bg-sky-200" />
              <div className="h-0.5 bg-sky-200" />
              <div className="h-0.5 bg-sky-200" />
            </div>

            {/* Kotak Hijau Penangkap (Catch Bar) */}
            <div
              className={`absolute inset-x-1 rounded-md transition-colors duration-75 flex items-center justify-center pointer-events-none ${
                isFishInside
                  ? 'bg-emerald-500/60 border-2 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.7)]'
                  : 'bg-emerald-600/35 border-2 border-emerald-400/50'
              }`}
              style={{
                height: `${BAR_HEIGHT}px`,
                bottom: `${displayBarY}px`,
              }}
            >
              <div className="w-full h-1 bg-white/50 rounded-full mx-1.5" />
            </div>

            {/* Ikon Ikan Bergerak */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-transform duration-75 pointer-events-none"
              style={{
                bottom: `${displayFishY}px`,
                width: `${FISH_SIZE}px`,
                height: `${FISH_SIZE}px`,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isFishInside
                    ? 'bg-amber-400 text-black shadow-amber-400/80 scale-110'
                    : 'bg-amber-500 text-black shadow-black/80'
                }`}
              >
                <Fish className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Meteran Kemajuan Tangkapan (Gauge) */}
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] font-mono font-black mb-1 transition-colors ${
                displayProgress > 60
                  ? 'text-emerald-400'
                  : displayProgress > 25
                  ? 'text-amber-400'
                  : 'text-rose-400 animate-pulse'
              }`}
            >
              {displayProgress}%
            </span>
            <div
              className="relative w-4 sm:w-4.5 rounded-full bg-neutral-900 border-2 border-neutral-700 overflow-hidden flex flex-col justify-end p-0.5"
              style={{ height: `${TRACK_HEIGHT}px` }}
            >
              <div
                className={`w-full rounded-full transition-all duration-75 ${
                  displayProgress > 60
                    ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                    : displayProgress > 25
                    ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                    : 'bg-gradient-to-t from-rose-600 to-rose-400 animate-pulse'
                }`}
                style={{ height: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* KANAN (atau BAWAH di Portrait): INFO IKAN + TOMBOL TAHAN JORAN */}
        {/* ============================================================== */}
        <div className={`flex flex-col ${isLandscape ? 'min-w-[190px] max-w-[250px] text-left' : 'w-full text-center'}`}>
          {/* Header Nama Ikan & Tingkat Kesulitan */}
          <div className={`${isLandscape ? 'text-left mb-1.5' : 'text-center mb-2'}`}>
            <div className={`flex items-center gap-1.5 text-amber-400 font-bold text-xs tracking-wider uppercase ${isLandscape ? 'justify-start' : 'justify-center'}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>IKAN MENYAMBAR!</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide truncate mt-0.5">
              {fishData.name}
            </h3>
            <span
              className={`text-[9.5px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block ${
                fishData.rarity === 'Legendary'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : fishData.rarity === 'Rare'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : fishData.rarity === 'Uncommon'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
              }`}
            >
              {fishData.rarity} • ±{fishData.weightKg} kg
            </span>
          </div>

          {/* Petunjuk Aksi Singkat */}
          <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-snug">
            Tahan tombol untuk menaikkan <strong>Kotak Hijau</strong> agar pas di ikan!
          </p>

          {/* Tombol Sentuh / Tahan Joran Responsif */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerCancel={handlePressEnd}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className={`w-full mt-2.5 py-2.5 sm:py-3 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase border-2 transition-transform active:scale-95 shadow-md cursor-pointer select-none touch-none flex flex-col items-center justify-center gap-0.5 ${
              isReeling
                ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-600/50 scale-[0.98]'
                : isFishInside
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 text-white shadow-emerald-600/40'
                : 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white shadow-amber-600/40'
            }`}
            style={{ touchAction: 'none' }}
          >
            <span>{isReeling ? '⚡ MENARIK JORAN...' : 'TAHAN ANGKAT JORAN'}</span>
            <span className="text-[8.5px] sm:text-[9px] font-mono tracking-wider opacity-85 font-normal">
              [ Spasi / Tombol F / Sentuh Layar ]
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
