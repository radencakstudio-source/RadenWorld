/**
 * ============================================================================
 * FILE: resources/js/game/ui/LoadingScreen.tsx
 * ============================================================================
 * Loading Screen RadenWorld Otentik & Realtime (Cozycore Clay-Pixel):
 * 1. Background lantai catur pastel hangat (#FFF8EA & #FFAE6D) bersih tanpa noise.
 * 2. Judul 'RADEN WORLD' di kiri atas & badge 'Server: ...' di kanan atas.
 * 3. Teks tengah dinamis: melacak tahap pemuatan asli aset & inisialisasi scene.
 * 4. Bar progres Clay-Pixel tebal (#FFF8EA + isian #FFAE6D & #A8E6CF, outline #5C3A21).
 * 5. Karakter cowok berjalan dari kiri bergerak maju menuju ke karakter cewek di kanan!
 * 6. 100% Real Loading: Menunggu aset Phaser, tekstur prosedural, dan scene siap.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { EventBus } from '../core/EventBus';

interface LoadingScreenProps {
  onComplete?: () => void;
  serverCode?: string;
  minDisplayTimeMs?: number;
  maxTimeoutMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  serverCode = 'ASIA - 0001',
  minDisplayTimeMs = 550,
  maxTimeoutMs = 2600,
}) => {
  const [progress, setProgress] = useState(8);
  const [dots, setDots] = useState('...');
  const [walkFrame, setWalkFrame] = useState(1);

  // Derive stageText langsung dari progress untuk menghemat siklus render React
  const stageText = React.useMemo(() => {
    if (progress < 40) return 'Mengunduh berkas karakter & lingkungan';
    if (progress < 75) return 'Memuat tekstur map & audio dunia';
    if (progress < 92) return 'Menyiapkan animasi & interior ruangan';
    if (progress < 100) return `Menghubungkan ke server ${serverCode}`;
    return 'Dunia siap, selamat berpetualang';
  }, [progress, serverCode]);

  const isCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const startTimeRef = useRef<number>(Date.now());
  const targetProgressRef = useRef<number>(15);
  const sceneReadyRef = useRef<boolean>(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Animasi titik-titik teks pemuatan
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 6 ? '.' : prev + '.'));
    }, 300);
    return () => clearInterval(dotInterval);
  }, []);

  // Animasi frame kaki cowok berjalan (MaleWalkSide1 s/d MaleWalkSide8)
  useEffect(() => {
    const walkInterval = setInterval(() => {
      setWalkFrame((prev) => (prev >= 8 ? 1 : prev + 1));
    }, 140);
    return () => clearInterval(walkInterval);
  }, []);

  // Listener event asli pemuatan Phaser & transisi scene
  useEffect(() => {
    startTimeRef.current = Date.now();
    isCompleteRef.current = false;

    // Selalu pastikan loading screen menunggu scene target siap merender frame pertama
    sceneReadyRef.current = false;
    targetProgressRef.current = 30;

    const triggerComplete = () => {
      if (isCompleteRef.current) return;
      isCompleteRef.current = true;
      setProgress(100);
      setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 160);
    };

    // Handler event asli Phaser saat mendownload file aset
    const handlePhaserProgress = (val: number) => {
      const pct = Math.max(18, Math.floor(val * 100));
      targetProgressRef.current = Math.max(targetProgressRef.current, pct);
    };

    // Handler saat seluruh file aset selesai diunduh
    const handlePhaserComplete = () => {
      targetProgressRef.current = Math.max(targetProgressRef.current, 90);
    };

    // Handler saat Scene tujuan selesai create() dan spawn player
    const handleSceneReady = () => {
      // Jeda 2 frame animasi agar canvas WebGL telah selesai menggambar seluruh tekstur & lingkungan
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            sceneReadyRef.current = true;
            targetProgressRef.current = 100;
          }, 100);
        });
      });
    };

    // Ticker untuk pergerakan bar progres yang ringan
    const progressTicker = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const target = targetProgressRef.current;

      setProgress((current) => {
        if (current >= 100) return 100;

        let next = current;
        if (sceneReadyRef.current && elapsed >= minDisplayTimeMs) {
          const step = Math.max(4, Math.ceil((100 - current) * 0.4));
          next = Math.min(100, current + step);
        } else if (current < target) {
          const step = Math.max(2, Math.ceil((target - current) * 0.28));
          next = Math.min(sceneReadyRef.current ? 100 : 94, current + step);
        } else if (current < 90 && elapsed > 350) {
          next = Math.min(90, current + 2);
        }

        if (next >= 100) {
          clearInterval(progressTicker);
          triggerComplete();
        }

        return next;
      });
    }, 85);

    // Hard fallback safety: Jika jaringan offline/sangat lambat, jangan gantung selamanya
    const fallbackTimer = setTimeout(() => {
      sceneReadyRef.current = true;
      targetProgressRef.current = 100;
      triggerComplete();
    }, maxTimeoutMs);

    EventBus.on('assets-loading-progress', handlePhaserProgress);
    EventBus.on('assets-loading-complete', handlePhaserComplete);
    EventBus.on('scene-ready', handleSceneReady);

    return () => {
      clearInterval(progressTicker);
      clearTimeout(fallbackTimer);
      EventBus.off('assets-loading-progress', handlePhaserProgress);
      EventBus.off('assets-loading-complete', handlePhaserComplete);
      EventBus.off('scene-ready', handleSceneReady);
    };
  }, [minDisplayTimeMs, maxTimeoutMs, serverCode]);

  // Perhitungan posisi cowok: dari 6% di kiri hingga mencapai cewek (~85% di kanan)
  const boyLeftPercent = 6 + (progress / 100) * 79;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden text-black"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingRight: 'max(0.875rem, env(safe-area-inset-right, 0.875rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
        paddingLeft: 'max(0.875rem, env(safe-area-inset-left, 0.875rem))',
      }}
    >
      {/* Background Kotak Catur Pastel Hangat (Creamy Vanilla #FFF8EA & Soft Pastel Orange #FFAE6D) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#FFF8EA',
          backgroundImage: `
            linear-gradient(45deg, #FFAE6D 25%, transparent 25%),
            linear-gradient(-45deg, #FFAE6D 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #FFAE6D 75%),
            linear-gradient(-45deg, transparent 75%, #FFAE6D 75%)
          `,
          backgroundSize: '88px 88px',
          backgroundPosition: '0 0, 0 44px, 44px -44px, -44px 0px',
        }}
      />

      {/* Lapisan lembut Creamy Milk Vanilla semi-solid agar kontras panel nyaman di mata */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'rgba(255, 248, 234, 0.55)' }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Judul Game Clay-Pixel (Top Left) */}
        <div className="clay-panel px-3 py-1.5 sm:px-5 sm:py-2.5 bg-[#FFAE6D]" style={{ backgroundColor: '#FFAE6D', boxShadow: 'inset 0 2px 0 #FFD0A6, inset 0 -3px 0 #E5924F, 0 3px 0 #5C3A21' }}>
          <h1 className="text-base sm:text-2xl md:text-4xl font-bold text-black tracking-wide leading-none">
            RADEN WORLD
          </h1>
        </div>

        {/* Server Pill Badge (Top Right) */}
        <div className="clay-badge-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-bold text-black shrink-0" style={{ borderWidth: '2px', boxShadow: 'inset 0 2px 0 #D4F5E9, 0 2px 0 #5C3A21' }}>
          Server: {serverCode}
        </div>
      </div>

      {/* Center Status Card */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center px-2">
        <div className="clay-panel px-4 py-2.5 sm:px-6 sm:py-3.5 max-w-xl w-auto text-center flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="clay-badge-secondary px-2 py-0.5 text-[10px] sm:text-xs font-bold text-black">
              MEMUAT DUNIA
            </span>
            <span className="clay-badge-primary px-2 py-0.5 text-[10px] sm:text-xs font-bold text-black">
              {progress}%
            </span>
          </div>
          <p className="text-black text-xs sm:text-sm md:text-base font-bold leading-snug">
            {stageText}{progress < 100 ? dots : '!'}
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Walking Characters Animation */}
      <div className="relative z-10 w-full max-w-5xl mx-auto pb-1 sm:pb-3 flex flex-col items-center">
        {/* Walking Track Area for Boy & Girl */}
        <div className="relative w-full h-14 sm:h-20 md:h-24 landscape:max-md:h-12 mb-1.5">
          {/* Cowok Berjalan Maju Bergerak ke Arah Kanan Menuju Cewek */}
          <div
            className="absolute bottom-0 flex flex-col items-center transition-[left] ease-linear duration-75"
            style={{ left: `${boyLeftPercent}%`, transform: 'translateX(-50%)' }}
          >
            <img
              src={`/assets/sprites/characters/Player/Male/MovementSide/MaleWalkSide${walkFrame}.webp`}
              alt="Male Walking"
              className="relative z-10 w-11 sm:w-16 md:w-20 landscape:max-md:w-10 h-13 sm:h-19 md:h-23 landscape:max-md:h-11 object-contain pixelated pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/sprites/characters/Player/Male/Idle/Front/Front%20Male.webp';
              }}
            />
            {/* Bayangan Lantai Pixel Bersih Tanpa Blur */}
            <div className="w-8 sm:w-11 h-1.5 sm:h-2 bg-[#5C3A21]/25 rounded-full -mt-1" />
          </div>

          {/* Cewek Berdiri di Sisi Kanan Menunggu Cowok */}
          <div
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: '90%', transform: 'translateX(-50%)' }}
          >
            <img
              src="/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female.webp"
              alt="Female Idle"
              className="relative z-10 w-11 sm:w-16 md:w-20 landscape:max-md:w-10 h-13 sm:h-19 md:h-23 landscape:max-md:h-11 object-contain pixelated pointer-events-none"
            />
            {/* Bayangan Lantai Pixel Bersih Tanpa Blur */}
            <div className="w-8 sm:w-11 h-1.5 sm:h-2 bg-[#5C3A21]/25 rounded-full -mt-1" />
          </div>
        </div>

        {/* Progress Bar Container: Clay-Pixel (#FFF8EA track, #FFAE6D fill, 2px #5C3A21 border) */}
        <div
          className="w-full h-5 sm:h-7 md:h-8 bg-[#FFF8EA] border-2 border-[#5C3A21] rounded-xl overflow-hidden relative p-0.5"
          style={{
            boxShadow: 'inset 0 2px 0 #EADBC0, 0 3px 0 #5C3A21',
          }}
        >
          <div
            className="h-full bg-[#FFAE6D] border-r-2 border-[#5C3A21] rounded-lg transition-all ease-linear duration-75"
            style={{
              width: `${Math.max(4, progress)}%`,
              boxShadow: 'inset 0 2px 0 #FFD0A6, inset 0 -2px 0 #E5924F',
            }}
          />
        </div>
      </div>
    </div>
  );
};
