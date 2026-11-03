/**
 * ============================================================================
 * FILE: resources/js/game/ui/FishingMinigame.tsx
 * ============================================================================
 * Minigame Memancing Interaktif RadenWorld (Cozycore Clay-Pixel):
 * 1. Fisika kotak tangkap responsif (Tap / Klik / Spasi / F).
 * 2. Meter kemajuan tangkapan (Catch Progress): Menang 100%, Kalah 0%.
 * 3. Responsif penuh di PC Desktop, Mobile Portrait, & Mobile Landscape.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fish, Sparkles, X } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { IFishData } from '../controllers/CharacterController';

interface FishingMinigameProps {
  isOpen: boolean;
  fishData: IFishData | null;
  onSuccess: (fish: IFishData) => void;
  onFailed: () => void;
  onClose: () => void;
}

interface FishingMinigameInnerProps {
  fishData: IFishData;
  onSuccess: (fish: IFishData) => void;
  onFailed: () => void;
  onClose: () => void;
}

const FishingMinigameInner: React.FC<FishingMinigameInnerProps> = ({
  fishData,
  onSuccess,
  onFailed,
  onClose,
}) => {
  const sound = SoundManager.getInstance();

  const [screenHeight, setScreenHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 600
  );
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 800
  );

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

  const TRACK_HEIGHT = isLandscape ? 140 : isShortScreen ? 180 : 215;
  const BAR_HEIGHT = Math.round(
    TRACK_HEIGHT *
      (fishData.rarity === 'Legendary' ? 0.36 : fishData.rarity === 'Rare' ? 0.42 : 0.48)
  );
  const FISH_SIZE = 24;

  const barYRef = useRef<number>(20);
  const barVelocityRef = useRef<number>(0);
  const isPressingRef = useRef<boolean>(false);
  const [isReeling, setIsReeling] = useState<boolean>(false);

  const fishYRef = useRef<number>(40);
  const fishTargetYRef = useRef<number>(80);
  const fishNextMoveTimeRef = useRef<number>(0);

  const progressRef = useRef<number>(40);
  const [displayProgress, setDisplayProgress] = useState<number>(40);
  const [displayBarY, setDisplayBarY] = useState<number>(20);
  const [displayFishY, setDisplayFishY] = useState<number>(40);
  const [isFishInside, setIsFishInside] = useState<boolean>(false);

  const wasInsideRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const handlePressStart = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!isPressingRef.current) {
        sound.playClick();
        barVelocityRef.current = Math.max(barVelocityRef.current + 65, 95);
      }
      isPressingRef.current = true;
      setIsReeling(true);
    },
    [sound]
  );

  const handlePressEnd = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isPressingRef.current = false;
    setIsReeling(false);
  }, []);

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

  useEffect(() => {
    lastTimeRef.current = performance.now();
    let isGameOver = false;

    const rarity = fishData.rarity;
    const fishSpeed =
      rarity === 'Legendary' ? 1.05 : rarity === 'Rare' ? 0.8 : rarity === 'Uncommon' ? 0.6 : 0.45;
    const fishChangeInterval =
      rarity === 'Legendary' ? 1800 : rarity === 'Rare' ? 2400 : 3000;
    const progressGainRate = 24;
    const progressDrainRate = rarity === 'Legendary' ? 9 : 7;

    const gameLoop = (currentTime: number) => {
      if (isGameOver) return;

      const deltaMs = Math.min(50, currentTime - lastTimeRef.current);
      lastTimeRef.current = currentTime;
      const dt = deltaMs / 1000;

      const gravity = -250;
      const lift = 520;

      if (isPressingRef.current) {
        barVelocityRef.current += lift * dt;
      } else {
        barVelocityRef.current += gravity * dt;
      }

      barVelocityRef.current *= Math.pow(0.93, dt * 60);
      barVelocityRef.current = Math.max(-230, Math.min(250, barVelocityRef.current));

      barYRef.current += barVelocityRef.current * dt;

      if (barYRef.current <= 0) {
        barYRef.current = 0;
        if (barVelocityRef.current < -40) {
          barVelocityRef.current = -barVelocityRef.current * 0.18;
        } else {
          barVelocityRef.current = 0;
        }
      }

      const maxBarY = TRACK_HEIGHT - BAR_HEIGHT;
      if (barYRef.current >= maxBarY) {
        barYRef.current = maxBarY;
        barVelocityRef.current = 0;
      }

      if (currentTime > fishNextMoveTimeRef.current) {
        fishNextMoveTimeRef.current = currentTime + fishChangeInterval + Math.random() * 800;
        const maxFishY = TRACK_HEIGHT - FISH_SIZE;
        fishTargetYRef.current = Math.random() * maxFishY;
      }

      const dy = fishTargetYRef.current - fishYRef.current;
      fishYRef.current += dy * Math.min(1.0, fishSpeed * dt * 2.2);

      const fishCenter = fishYRef.current + FISH_SIZE / 2;
      const barBottom = barYRef.current;
      const barTop = barYRef.current + BAR_HEIGHT;
      const inside = fishCenter >= barBottom - 4 && fishCenter <= barTop + 4;

      setIsFishInside(inside);

      if (inside && !wasInsideRef.current) {
        sound.playClick();
      }
      wasInsideRef.current = inside;

      if (inside) {
        progressRef.current = Math.min(100, progressRef.current + progressGainRate * dt);
      } else {
        progressRef.current = Math.max(0, progressRef.current - progressDrainRate * dt);
      }

      setDisplayProgress(Math.round(progressRef.current));
      setDisplayBarY(barYRef.current);
      setDisplayFishY(fishYRef.current);

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
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="ui-modal-backdrop select-none touch-none pointer-events-auto"
      style={{ touchAction: 'none' }}
    >
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`clay-panel relative text-black max-h-[95dvh] max-w-[95dvw] overflow-y-auto no-scrollbar ${
          isLandscape
            ? 'p-3 sm:p-4 flex flex-row items-center gap-4'
            : 'p-4 sm:p-5 flex flex-col items-center gap-3 w-[min(320px,92dvw)]'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Tombol Tutup / Batal Memancing */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="clay-btn-neutral absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center text-black z-20"
          title="Batal Memancing (Esc)"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* JALUR AKUATIK + METERAN PROGRESS */}
        <div className="clay-card flex items-center gap-3 p-2.5 sm:p-3 shrink-0">
          {/* Jalur Vertikal Air */}
          <div
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerCancel={handlePressEnd}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="relative w-14 sm:w-16 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] overflow-hidden cursor-pointer touch-none select-none"
            style={{
              height: `${TRACK_HEIGHT}px`,
              touchAction: 'none',
              boxShadow: 'inset 0 2px 0 #EADBC0',
            }}
            title="Ketuk atau Tahan untuk mengangkat kotak penangkap"
          >
            {/* Garis Kedalaman Air Minimalis */}
            <div className="absolute inset-0 flex flex-col justify-between py-3 px-1.5 pointer-events-none">
              <div className="h-[1.5px] bg-[#5C3A21]/20" />
              <div className="h-[1.5px] bg-[#5C3A21]/20" />
              <div className="h-[1.5px] bg-[#5C3A21]/20" />
              <div className="h-[1.5px] bg-[#5C3A21]/20" />
            </div>

            {/* Kotak Hijau Pastel Penangkap (Catch Bar) */}
            <div
              className={`absolute inset-x-1 rounded-md border-2 border-[#5C3A21] flex items-center justify-center pointer-events-none ${
                isFishInside ? 'bg-[#A8E6CF]' : 'bg-[#A8E6CF]/60'
              }`}
              style={{
                height: `${BAR_HEIGHT}px`,
                bottom: `${displayBarY}px`,
                boxShadow: 'inset 0 2px 0 #D4F5E9',
              }}
            >
              <div className="w-full h-1 bg-[#5C3A21]/30 rounded-full mx-1.5" />
            </div>

            {/* Ikon Ikan Bergerak */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
              style={{
                bottom: `${displayFishY}px`,
                width: `${FISH_SIZE}px`,
                height: `${FISH_SIZE}px`,
              }}
            >
              <div className="w-6 h-6 rounded-full bg-[#FFAE6D] border-2 border-[#5C3A21] text-black flex items-center justify-center">
                <Fish className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Meteran Kemajuan Tangkapan (Gauge) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-black mb-1">{displayProgress}%</span>
            <div
              className="relative w-4 sm:w-5 rounded-full bg-[#FFF8EA] border-2 border-[#5C3A21] overflow-hidden flex flex-col justify-end p-0.5"
              style={{ height: `${TRACK_HEIGHT}px` }}
            >
              <div
                className={`w-full rounded-full transition-all duration-75 ${
                  displayProgress > 60 ? 'bg-[#A8E6CF]' : 'bg-[#FFAE6D]'
                }`}
                style={{ height: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* INFO IKAN + TOMBOL TAHAN JORAN */}
        <div
          className={`flex flex-col ${
            isLandscape ? 'min-w-[190px] max-w-[250px] text-left pr-6' : 'w-full text-center'
          }`}
        >
          <div className={isLandscape ? 'text-left mb-1.5' : 'text-center mb-2'}>
            <div
              className={`flex items-center gap-1.5 text-black font-bold text-xs uppercase ${
                isLandscape ? 'justify-start' : 'justify-center'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>IKAN MENYAMBAR!</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-black truncate mt-0.5">
              {fishData.name}
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 mt-1 inline-block ${
                fishData.rarity === 'Legendary' ? 'clay-badge-primary' : 'clay-badge-secondary'
              }`}
            >
              {fishData.rarity} • {fishData.waterType ? `${fishData.waterType} • ` : ''}±
              {fishData.weightKg} kg
            </span>
          </div>

          <p className="text-[10px] sm:text-[11px] text-black leading-snug">
            Tahan tombol untuk menaikkan <strong>Kotak Hijau</strong> agar pas di ikan!
          </p>

          <button
            type="button"
            tabIndex={-1}
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerCancel={handlePressEnd}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={`w-full mt-2.5 py-2.5 sm:py-3 px-3 font-bold text-xs sm:text-sm uppercase select-none touch-none flex flex-col items-center justify-center gap-0.5 text-black ${
              isReeling || isFishInside ? 'clay-btn-secondary' : 'clay-btn-primary'
            }`}
            style={{ touchAction: 'none' }}
          >
            <span>{isReeling ? 'MENARIK JORAN...' : 'TAHAN ANGKAT JORAN'}</span>
            <span className="text-[9px] font-bold">
              [ Spasi / F / Sentuh ]
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const FishingMinigame: React.FC<FishingMinigameProps> = ({
  isOpen,
  fishData,
  onSuccess,
  onFailed,
  onClose,
}) => {
  if (!isOpen || !fishData) return null;
  return (
    <FishingMinigameInner
      fishData={fishData}
      onSuccess={onSuccess}
      onFailed={onFailed}
      onClose={onClose}
    />
  );
};
