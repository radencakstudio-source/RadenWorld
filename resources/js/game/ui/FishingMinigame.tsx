/**
 * ============================================================================
 * FILE: resources/js/game/ui/FishingMinigame.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Minigame Memancing Interaktif bergaya Stardew Valley:
 * 1. Jalur vertikal meter pancing dengan kotak hijau penangkap (Catch Zone).
 * 2. Fisika Kotak Hijau: Gravitasi menarik turun, menahan klik/spasi/sentuh mengangkat kotak naik.
 * 3. Ikan berenang naik-turun dengan perilaku AI dinamis (tenang, menyambar, melesat).
 * 4. Meter kemajuan tangkapan (Catch Progress):
 *    - Bertambah hijau saat ikan berada di dalam kotak hijau.
 *    - Berkurang saat ikan lepas dari kotak hijau.
 * 5. Menang (100%) -> Ikan tertangkap! Kalah (0%) -> Ikan kabur!
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fish, X, Sparkles, AlertTriangle } from 'lucide-react';
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

  // Dimensi Track Minigame
  const TRACK_HEIGHT = 260; // Tinggi jalur dalam pixel
  // Kotak hijau diperbesar agar lebih bersahabat dan pas ditahan (User Request: tidak terlalu berat)
  const BAR_HEIGHT = fishData.rarity === 'Legendary' ? 62 : fishData.rarity === 'Rare' ? 74 : 86;
  const FISH_SIZE = 24;

  // Status Fisika Bar Hijau (0 = bawah, TRACK_HEIGHT - BAR_HEIGHT = atas)
  const barYRef = useRef<number>(20); // Posisi vertikal bar
  const barVelocityRef = useRef<number>(0);
  const isPressingRef = useRef<boolean>(false);

  // Status Ikan (0 = bawah, TRACK_HEIGHT - FISH_SIZE = atas)
  const fishYRef = useRef<number>(60);
  const fishTargetYRef = useRef<number>(100);
  const fishNextMoveTimeRef = useRef<number>(0);

  // Meteran Tangkapan (0.0 s/d 100.0)
  const progressRef = useRef<number>(35); // Beri modal awal 35%
  const [displayProgress, setDisplayProgress] = useState<number>(35);
  const [displayBarY, setDisplayBarY] = useState<number>(20);
  const [displayFishY, setDisplayFishY] = useState<number>(60);
  const [isFishInside, setIsFishInside] = useState<boolean>(false);

  // Efek Getar / Suara Strike
  const wasInsideRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Input Mouse / Keyboard / Touch
  const handlePressStart = useCallback(() => {
    isPressingRef.current = true;
    sound.playClick();
  }, [sound]);

  const handlePressEnd = useCallback(() => {
    isPressingRef.current = false;
  }, []);

  // Keyboard Listeners (Space & F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF') {
        e.preventDefault();
        isPressingRef.current = true;
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF') {
        e.preventDefault();
        isPressingRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onClose]);

  // Main Loop Fisika Minigame (60 FPS)
  useEffect(() => {
    lastTimeRef.current = performance.now();
    let isGameOver = false;

    // Parameter kesulitan berdasarkan rarity - Dituning agar ikan bergerak mulus dan tidak terlalu cepat
    const rarity = fishData.rarity;
    const fishSpeed = rarity === 'Legendary' ? 1.75 : rarity === 'Rare' ? 1.35 : rarity === 'Uncommon' ? 1.05 : 0.8;
    const fishChangeInterval = rarity === 'Legendary' ? 1200 : rarity === 'Rare' ? 1600 : 2100;
    const progressGainRate = 22; // +22% per detik saat di dalam kotak
    const progressDrainRate = rarity === 'Legendary' ? 12 : 9; // -9% s/d -12% per detik saat di luar kotak

    const gameLoop = (currentTime: number) => {
      if (isGameOver) return;

      const deltaMs = Math.min(50, currentTime - lastTimeRef.current);
      lastTimeRef.current = currentTime;
      const dt = deltaMs / 1000;

      // 1. FISIKA KOTAK HIJAU (GRAVITASI & DAYA ANGKAT RINGAN & APUNG)
      // Gravitasi diperlembut (-340 vs -640) agar kotak terasa ringan melayang seperti pelampung asli Stardew
      const gravity = -340;
      const lift = 760; // Daya angkat responsif saat tombol ditahan

      if (isPressingRef.current) {
        barVelocityRef.current += lift * dt;
      } else {
        barVelocityRef.current += gravity * dt;
      }

      // Redaman udara (damping tinggi = lebih empuk dan stabil melayang)
      barVelocityRef.current *= Math.pow(0.92, dt * 60);

      // Batasi kecepatan maksimum bar agar tidak liar
      barVelocityRef.current = Math.max(-380, Math.min(380, barVelocityRef.current));

      barYRef.current += barVelocityRef.current * dt;

      // Batas Bawah & Pantulan Lembut (Bounce)
      if (barYRef.current <= 0) {
        barYRef.current = 0;
        if (barVelocityRef.current < -60) {
          barVelocityRef.current = -barVelocityRef.current * 0.22; // Pantul sedikit
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
        // Tentukan posisi target baru di dalam jalur
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
  }, [fishData, onSuccess, onFailed, sound]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none touch-none pointer-events-auto font-['Chakra_Petch'] animate-fade-in">
      {/* Bingkai Panel Bergaya Stardew Valley Retro */}
      <div className="relative bg-[#1c1917] border-3 border-amber-600 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-neutral-100 flex flex-col items-center">
        {/* Tombol Tutup / Batalkan */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer transition-transform active:scale-90"
          title="Batal Memancing"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Header Nama Ikan & Tingkat Kesulitan */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>IKAN MENYAMBAR!</span>
          </div>
          <h3 className="text-sm font-black text-white tracking-wide truncate max-w-[200px]">
            {fishData.name}
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${
              fishData.rarity === 'Legendary'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : fishData.rarity === 'Rare'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
            }`}
          >
            {fishData.rarity}
          </span>
        </div>

        {/* Wadah Minigame: Jalur Akuatik (Kiri) + Meteran Kemajuan (Kanan) */}
        <div className="flex items-center gap-3 bg-[#0c0a09] p-3 rounded-xl border-2 border-amber-900/60 shadow-inner">
          {/* ============================================================== */}
          {/* JALUR VERTIKAL AKUATIK AIR TEMPAT IKAN DAN KOTAK HIJAU BERADA  */}
          {/* ============================================================== */}
          <div
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
            className="relative w-14 rounded-lg bg-gradient-to-b from-[#0284c7]/40 via-[#0369a1]/60 to-[#082f49] border-2 border-sky-600/80 overflow-hidden cursor-pointer shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
            style={{ height: `${TRACK_HEIGHT}px` }}
          >
            {/* Garis-Garis Kedalaman Air Mini */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none opacity-20">
              <div className="h-0.5 bg-sky-200" />
              <div className="h-0.5 bg-sky-200" />
              <div className="h-0.5 bg-sky-200" />
              <div className="h-0.5 bg-sky-200" />
            </div>

            {/* KOTAK HIJAU PENANGKAP (CATCH BAR) BERGERAK NAIK-TURUN */}
            <div
              className={`absolute inset-x-1 rounded-md transition-[box-shadow,border-color] duration-75 flex items-center justify-center ${
                isFishInside
                  ? 'bg-emerald-500/60 border-2 border-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.9)]'
                  : 'bg-emerald-600/35 border-2 border-emerald-400/50 shadow-none'
              }`}
              style={{
                height: `${BAR_HEIGHT}px`,
                bottom: `${displayBarY}px`,
              }}
            >
              {/* Tekstur Garis Pusat Kotak */}
              <div className="w-full h-1 bg-white/40 rounded-full mx-1" />
            </div>

            {/* IKON IKAN YANG MENCOBA KABUR DARI KOTAK */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-transform duration-75"
              style={{
                bottom: `${displayFishY}px`,
                width: `${FISH_SIZE}px`,
                height: `${FISH_SIZE}px`,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  isFishInside
                    ? 'bg-amber-400 text-black shadow-amber-400/60 scale-105'
                    : 'bg-amber-600 text-white shadow-black/80'
                }`}
              >
                <Fish className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* METERAN KEMAJUAN TANGKAPAN (CATCH PROGRESS GAUGE)               */}
          {/* ============================================================== */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-amber-400 mb-1">
              {displayProgress}%
            </span>
            <div
              className="relative w-4 rounded-full bg-neutral-900 border-2 border-neutral-700 overflow-hidden flex flex-col justify-end p-0.5"
              style={{ height: `${TRACK_HEIGHT}px` }}
            >
              <div
                className={`w-full rounded-full transition-all duration-75 ${
                  displayProgress > 60
                    ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                    : displayProgress > 25
                    ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                    : 'bg-gradient-to-t from-rose-600 to-rose-400 animate-pulse'
                }`}
                style={{ height: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Petunjuk Aksi Bawah */}
        <div className="mt-3 text-center">
          <p className="text-[10px] text-neutral-400 leading-snug">
            Tahan <kbd className="px-1 py-0.2 bg-neutral-800 rounded text-amber-300 font-mono text-[9px]">Klik</kbd> / <kbd className="px-1 py-0.2 bg-neutral-800 rounded text-amber-300 font-mono text-[9px]">Spasi</kbd> / <kbd className="px-1 py-0.2 bg-neutral-800 rounded text-amber-300 font-mono text-[9px]">F</kbd>
            <br />
            untuk menaikkan <strong>Kotak Hijau</strong> ke posisi ikan!
          </p>

          {/* Tombol Sentuh Besar untuk Pengguna Mobile */}
          <button
            type="button"
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
            className={`w-full mt-2.5 py-2 rounded-xl font-black text-xs tracking-wider uppercase border-2 transition-transform active:scale-95 shadow-md ${
              isFishInside
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 text-white shadow-emerald-600/40'
                : 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white shadow-amber-600/40'
            }`}
          >
            TAHAN UNTUK ANGKAT JORAN
          </button>
        </div>
      </div>
    </div>
  );
};
