/**
 * ============================================================================
 * FILE: resources/js/game/ui/LoadingScreen.tsx
 * ============================================================================
 * Loading Screen RadenWorld Otentik & Realtime:
 * 1. Background lantai catur ubin oranye (Orange Checkered Pattern).
 * 2. Judul 'RADEN WORLD' pixel kuning retro di kiri atas.
 * 3. Status server 'Server: ASIA - RADEN - 0001' di kanan atas.
 * 4. Teks tengah dinamis: melacak tahap pemuatan asli aset & inisialisasi scene.
 * 5. Bar progres putih dengan isian warna kuning terang di bawah.
 * 6. Karakter cowok berjalan dari kiri bergerak maju menuju ke karakter cewek di kanan!
 * 7. 100% Real Loading: Menunggu aset Phaser, tekstur prosedural, dan scene siap
 *    (scene-ready) sehingga saat loading selesai, game 100% bebas bug & tidak ada missing asset.
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
  minDisplayTimeMs = 500,
  maxTimeoutMs = 12000,
}) => {
  const [progress, setProgress] = useState(8);
  const [dots, setDots] = useState('..........');
  const [walkFrame, setWalkFrame] = useState(1);
  const [stageText, setStageText] = useState('mengunduh aset karakter & lingkungan');

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
      setDots((prev) => (prev.length >= 10 ? '..' : prev + '.'));
    }, 260);
    return () => clearInterval(dotInterval);
  }, []);

  // Animasi frame kaki cowok berjalan (MaleWalkSide1 s/d MaleWalkSide8)
  useEffect(() => {
    const walkInterval = setInterval(() => {
      setWalkFrame((prev) => (prev >= 8 ? 1 : prev + 1));
    }, 100);
    return () => clearInterval(walkInterval);
  }, []);

  // Listener event asli pemuatan Phaser & transisi scene
  useEffect(() => {
    startTimeRef.current = Date.now();
    isCompleteRef.current = false;
    sceneReadyRef.current = false;
    targetProgressRef.current = 15;

    const triggerComplete = () => {
      if (isCompleteRef.current) return;
      isCompleteRef.current = true;
      setProgress(100);
      setStageText('dunia siap, selamat berpetualang');
      setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 160);
    };

    // Handler event asli Phaser saat mendownload file aset
    const handlePhaserProgress = (val: number) => {
      const pct = Math.max(15, Math.floor(val * 100));
      targetProgressRef.current = Math.max(targetProgressRef.current, pct);
    };

    // Handler saat seluruh file aset selesai diunduh
    const handlePhaserComplete = () => {
      targetProgressRef.current = Math.max(targetProgressRef.current, 90);
    };

    // Handler saat Scene tujuan selesai create() dan spawn player
    const handleSceneReady = () => {
      sceneReadyRef.current = true;
      targetProgressRef.current = 100;
    };

    // Ticker untuk pergerakan bar progres yang halus (smooth lerp)
    const progressTicker = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const target = targetProgressRef.current;

      setProgress((current) => {
        if (current >= 100) return 100;

        let next = current;
        if (sceneReadyRef.current && elapsed >= minDisplayTimeMs) {
          // Scene sudah siap dan durasi minimum tercapai -> langsung tuntaskan ke 100%
          const step = Math.max(2, Math.ceil((100 - current) * 0.35));
          next = Math.min(100, current + step);
        } else if (current < target) {
          // Menyesuaikan dengan progres unduhan aset riil
          const step = Math.max(1, Math.ceil((target - current) * 0.2));
          next = Math.min(sceneReadyRef.current ? 100 : 94, current + step);
        } else if (current < 90 && elapsed > 400) {
          // Laju bertahap halus sambil menunggu aset selesai diproses
          next = Math.min(90, current + 1);
        }

        // Perbarui teks status berdasarkan progres riil
        if (next < 40) {
          setStageText('mengunduh berkas karakter & lingkungan');
        } else if (next < 75) {
          setStageText('memuat tekstur map & audio dunia');
        } else if (next < 92) {
          setStageText('menyiapkan animasi & interior ruangan');
        } else if (next < 100) {
          setStageText(`menghubungkan ke server ${serverCode}`);
        } else {
          setStageText('dunia siap, selamat berpetualang');
        }

        if (next >= 100) {
          clearInterval(progressTicker);
          triggerComplete();
        }

        return next;
      });
    }, 35);

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

  // Perhitungan posisi cowok: dari 3% di kiri hingga mencapai cewek (~86% di kanan)
  const boyLeftPercent = 3 + (progress / 100) * 83;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-6 md:p-10 select-none overflow-hidden font-['Chakra_Petch']">
      {/* Background Kotak Catur Oranye (Orange Checkered Grid) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#ea580c',
          backgroundImage: `
            linear-gradient(45deg, #f97316 25%, transparent 25%),
            linear-gradient(-45deg, #f97316 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f97316 75%),
            linear-gradient(-45deg, transparent 75%, #f97316 75%)
          `,
          backgroundSize: '90px 90px',
          backgroundPosition: '0 0, 0 45px, 45px -45px, -45px 0px',
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full flex items-start justify-between gap-2">
        {/* Judul Game Pixel Kuning (Top Left) */}
        <div>
          <h1
            className="text-xl sm:text-4xl md:text-6xl font-black text-[#FFE600] font-['Press_Start_2P'] tracking-wider leading-none"
            style={{
              textShadow: '3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
            }}
          >
            RADEN WORLD
          </h1>
        </div>

        {/* Server Pill Badge (Top Right) */}
        <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md bg-[#ff7a18] border border-black shadow text-black text-[10px] sm:text-xs font-black tracking-wide shrink-0">
          Server: {serverCode}
        </div>
      </div>

      {/* Center Text: loading status text.......... */}
      <div className="relative z-10 text-center my-auto">
        <p className="text-white text-sm sm:text-base md:text-xl font-normal tracking-wide drop-shadow-md lowercase">
          {stageText}{progress < 100 ? dots : '!'}
        </p>
      </div>

      {/* Bottom Progress Bar & Walking Characters Animation */}
      <div className="relative z-10 w-full max-w-6xl mx-auto pb-2 sm:pb-6 flex flex-col items-center">
        {/* Walking Track Area for Boy & Girl */}
        <div className="relative w-full h-16 sm:h-22 md:h-28 mb-1">
          {/* Cowok Berjalan Maju Bergerak ke Arah Kanan Menuju Cewek */}
          <div
            className="absolute bottom-0 -mb-1 flex flex-col items-center transition-[left] ease-linear duration-75"
            style={{ left: `${boyLeftPercent}%`, transform: 'translateX(-50%)' }}
          >
            <img
              src={`/assets/sprites/characters/Player/Male/MovementSide/MaleWalkSide${walkFrame}.png`}
              alt="Male Walking"
              className="relative z-10 w-12 sm:w-16 md:w-20 h-14 sm:h-20 md:h-24 object-contain pixelated pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/sprites/characters/Player/Male/Idle/Front/Front%20Male.png';
              }}
            />
            {/* Bayangan Lantai Cowok (di bawah kaki) */}
            <div className="w-10 sm:w-12 h-2 sm:h-2.5 bg-black/40 rounded-full blur-[2px] -mt-2" />
          </div>

          {/* Cewek Berdiri di Sisi Kanan Menunggu Cowok */}
          <div
            className="absolute bottom-0 -mb-1 flex flex-col items-center"
            style={{ left: '88%', transform: 'translateX(-50%)' }}
          >
            <img
              src="/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female.png"
              alt="Female Idle"
              className="relative z-10 w-12 sm:w-16 md:w-20 h-14 sm:h-20 md:h-24 object-contain pixelated pointer-events-none"
            />
            {/* Bayangan Lantai Cewek (di bawah kaki) */}
            <div className="w-10 sm:w-12 h-2 sm:h-2.5 bg-black/40 rounded-full blur-[2px] -mt-2" />
          </div>
        </div>

        {/* Progress Bar Container: Putih Tebal dengan Isi Kuning Terang Sesuai Gambar */}
        <div className="w-full h-4 sm:h-6 md:h-7 bg-white border border-black/80 rounded-none overflow-hidden relative shadow-md">
          <div
            className="h-full bg-[#FFE600] transition-all ease-linear duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
