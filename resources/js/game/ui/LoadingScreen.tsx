/**
 * ============================================================================
 * FILE: resources/js/game/ui/LoadingScreen.tsx
 * ============================================================================
 * Loading Screen RadenWorld sesuai gambar (Image 3):
 * 1. Background lantai catur ubin oranye (Orange Checkered Pattern).
 * 2. Judul 'RADEN WORLD' pixel kuning retro di kiri atas.
 * 3. Status server 'Server: ASIA - RADEN - 0001' di kanan atas.
 * 4. Teks tengah: 'loading raden world assets..........'.
 * 5. Bar progres putih dengan isian warna kuning terang di bawah.
 * 6. Karakter cowok berjalan dari kiri bergerak maju menuju ke karakter cewek di kanan!
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { EventBus } from '../core/EventBus';

interface LoadingScreenProps {
  onComplete?: () => void;
  serverCode?: string;
  durationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  serverCode = 'ASIA - 0001',
  durationMs = 2800,
}) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('..........');
  const [walkFrame, setWalkFrame] = useState(1);
  const isCompleteRef = useRef(false);

  // Animasi titik-titik teks pemuatan
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 10 ? '..' : prev + '.'));
    }, 280);
    return () => clearInterval(dotInterval);
  }, []);

  // Animasi frame kaki cowok berjalan (Walk_Side1 s/d Walk_Side9)
  useEffect(() => {
    const walkInterval = setInterval(() => {
      setWalkFrame((prev) => (prev >= 9 ? 1 : prev + 1));
    }, 110);
    return () => clearInterval(walkInterval);
  }, []);

  // Listener event aset phaser & fallback timer halus
  useEffect(() => {
    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(100, Math.floor((elapsed / durationMs) * 100));

      setProgress((prev) => {
        const next = Math.max(prev, ratio);
        if (next >= 100 && !isCompleteRef.current) {
          isCompleteRef.current = true;
          clearInterval(progressTimer);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 350);
        }
        return next;
      });
    }, 40);

    const handlePhaserProgress = (val: number) => {
      const pct = Math.floor(val * 100);
      setProgress((prev) => Math.max(prev, pct));
    };

    const handlePhaserComplete = () => {
      // Tunggu hingga timer minimal selesai agar user melihat animasi cowok menuju ke cewek
    };

    EventBus.on('assets-loading-progress', handlePhaserProgress);
    EventBus.on('assets-loading-complete', handlePhaserComplete);

    return () => {
      clearInterval(progressTimer);
      EventBus.off('assets-loading-progress', handlePhaserProgress);
      EventBus.off('assets-loading-complete', handlePhaserComplete);
    };
  }, [durationMs, onComplete]);

  // Perhitungan posisi cowok: dari 2% di kiri hingga mencapai cewek (~86% di kanan)
  const boyLeftPercent = 3 + (progress / 100) * 82;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-['Chakra_Petch']">
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
      <div className="relative z-10 w-full flex items-start justify-between">
        {/* Judul Game Pixel Kuning (Top Left) */}
        <div>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black text-[#FFE600] font-['Press_Start_2P'] tracking-wider leading-none"
            style={{
              textShadow: '3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
            }}
          >
            RADEN WORLD
          </h1>
        </div>

        {/* Server Pill Badge (Top Right) */}
        <div className="px-3.5 py-1.5 rounded-md bg-[#ff7a18] border border-black shadow text-black text-[11px] sm:text-xs font-black tracking-wide">
          Server: {serverCode}
        </div>
      </div>

      {/* Center Text: loading raden world assets.......... */}
      <div className="relative z-10 text-center my-auto">
        <p className="text-white text-base sm:text-lg md:text-xl font-normal tracking-wide drop-shadow-md lowercase">
          loading raden world assets{dots}
        </p>
      </div>

      {/* Bottom Progress Bar & Walking Characters Animation */}
      <div className="relative z-10 w-full max-w-6xl mx-auto pb-4 sm:pb-8 flex flex-col items-center">
        {/* Walking Track Area for Boy & Girl */}
        <div className="relative w-full h-24 sm:h-28 mb-1">
          {/* Cowok Berjalan Maju Bergerak ke Arah Kanan Menuju Cewek */}
          <div
            className="absolute bottom-0 -mb-1 flex flex-col items-center transition-[left] ease-linear duration-75"
            style={{ left: `${boyLeftPercent}%`, transform: 'translateX(-50%)' }}
          >
            {/* Bayangan Lantai Cowok */}
            <div className="w-12 h-3 bg-black/40 rounded-full blur-[2px] mb-[-6px]" />
            <img
              src={`/assets/sprites/characters/Player/Male/MovementSide/Walk_Side${walkFrame}_Male.png`}
              alt="Male Walking"
              className="w-16 sm:w-20 h-20 sm:h-24 object-contain pixelated pointer-events-none drop-shadow-lg"
              onError={(e) => {
                // Fallback jika frame gagal dimuat
                (e.target as HTMLImageElement).src = '/assets/sprites/characters/Player/Male/Idle/Front/Front%20Male.png';
              }}
            />
          </div>

          {/* Cewek Berdiri di Sisi Kanan Menunggu Cowok */}
          <div
            className="absolute bottom-0 -mb-1 flex flex-col items-center"
            style={{ left: '88%', transform: 'translateX(-50%)' }}
          >
            {/* Bayangan Lantai Cewek */}
            <div className="w-12 h-3 bg-black/40 rounded-full blur-[2px] mb-[-6px]" />
            <img
              src="/assets/sprites/characters/Player/Female/Idle/Front/Front%20Female%20Pink.png"
              alt="Female Idle"
              className="w-16 sm:w-20 h-20 sm:h-24 object-contain pixelated pointer-events-none drop-shadow-lg"
            />
          </div>
        </div>

        {/* Progress Bar Container: Putih Tebal dengan Isi Kuning Terang Sesuai Gambar */}
        <div className="w-full h-5 sm:h-7 bg-white border border-black/80 rounded-none overflow-hidden relative shadow-md">
          <div
            className="h-full bg-[#FFE600] transition-all ease-linear duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
