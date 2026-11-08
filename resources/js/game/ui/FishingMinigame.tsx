/**
 * ============================================================================
 * FILE: resources/js/game/ui/FishingMinigame.tsx
 * ============================================================================
 * Minigame Memancing Interaktif RadenWorld (60/120 FPS GPU-Accelerated):
 * 1. Manipulasi DOM Ref langsung via transform: translate3d & scaleY (0 React
 *    re-render per frame, 0 browser layout reflow, 0ms CSS transition delay).
 * 2. Fisika kotak tangkap super responsif & ringan (Tap / Klik / Spasi / F).
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
    (window as any).__raden_fishing_minigame_active = true;
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      (window as any).__raden_fishing_minigame_active = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isLandscape = screenWidth > screenHeight && screenHeight < 550;
  const isShortScreen = screenHeight < 580;

  const TRACK_HEIGHT = isLandscape ? 140 : isShortScreen ? 180 : 215;
  const BAR_HEIGHT = Math.round(
    TRACK_HEIGHT *
      (fishData.rarity === 'Legendary' ? 0.38 : fishData.rarity === 'Rare' ? 0.44 : 0.50)
  );
  const FISH_SIZE = 24;

  // Refs fisika 60/120fps bebas React re-render
  const barYRef = useRef<number>(24);
  const barVelocityRef = useRef<number>(0);
  const isKeyboardPressingRef = useRef<boolean>(false);
  const isPointerPressingRef = useRef<boolean>(false);
  const isPressingRef = useRef<boolean>(false);

  const fishYRef = useRef<number>(48);
  const fishTargetYRef = useRef<number>(85);
  const fishNextMoveTimeRef = useRef<number>(0);

  const progressRef = useRef<number>(42);
  const lastDisplayedPctRef = useRef<number>(42);

  // Direct DOM Element Refs untuk animasi GPU 0ms (0 React Re-renders!)
  const catchBarElRef = useRef<HTMLDivElement | null>(null);
  const fishIconElRef = useRef<HTMLDivElement | null>(null);
  const progressFillElRef = useRef<HTMLDivElement | null>(null);
  const progressTextElRef = useRef<HTMLSpanElement | null>(null);
  const reelBtnTextRef = useRef<HTMLSpanElement | null>(null);

  const wasInsideRef = useRef<boolean>(true);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const syncPressing = useCallback((kb: boolean, ptr: boolean) => {
    isKeyboardPressingRef.current = kb;
    isPointerPressingRef.current = ptr;
    const combined = kb || ptr;
    if (combined && !isPressingRef.current) {
      // Dorongan angkat instan tanpa jeda saat tombol ditekan/disentuh
      barVelocityRef.current = Math.max(145, barVelocityRef.current * 0.35 + 145);
    }
    if (isPressingRef.current !== combined) {
      isPressingRef.current = combined;
      if (reelBtnTextRef.current) {
        reelBtnTextRef.current.textContent = combined ? 'MENARIK JORAN...' : 'TAHAN ANGKAT JORAN';
      }
    }
  }, []);

  const handlePressStart = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      syncPressing(isKeyboardPressingRef.current, true);
    },
    [syncPressing]
  );

  const handlePressEnd = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      syncPressing(isKeyboardPressingRef.current, false);
    },
    [syncPressing]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF' || e.key?.toLowerCase() === 'f') {
        e.preventDefault();
        e.stopPropagation();
        if (e.repeat) return;
        syncPressing(true, isPointerPressingRef.current);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF' || e.key?.toLowerCase() === 'f') {
        e.preventDefault();
        e.stopPropagation();
        syncPressing(false, isPointerPressingRef.current);
      }
    };

    const handleGlobalPointerRelease = () => {
      if (isPointerPressingRef.current) {
        syncPressing(isKeyboardPressingRef.current, false);
      }
    };

    const handleWindowBlur = () => {
      syncPressing(false, false);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('pointerup', handleGlobalPointerRelease, { passive: true });
    window.addEventListener('pointercancel', handleGlobalPointerRelease, { passive: true });
    window.addEventListener('touchend', handleGlobalPointerRelease, { passive: true });
    window.addEventListener('touchcancel', handleGlobalPointerRelease, { passive: true });
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('pointerup', handleGlobalPointerRelease);
      window.removeEventListener('pointercancel', handleGlobalPointerRelease);
      window.removeEventListener('touchend', handleGlobalPointerRelease);
      window.removeEventListener('touchcancel', handleGlobalPointerRelease);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [onClose, syncPressing]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    let isGameOver = false;

    const rarity = fishData.rarity;
    const fishSpeed =
      rarity === 'Legendary' ? 0.95 : rarity === 'Rare' ? 0.75 : rarity === 'Uncommon' ? 0.58 : 0.44;
    const fishChangeInterval =
      rarity === 'Legendary' ? 1850 : rarity === 'Rare' ? 2400 : 3000;
    const progressGainRate = 27;
    const progressDrainRate = rarity === 'Legendary' ? 8.5 : 6.5;

    const maxBarY = Math.max(1, TRACK_HEIGHT - BAR_HEIGHT);
    const maxFishY = Math.max(1, TRACK_HEIGHT - FISH_SIZE);

    const gameLoop = (currentTime: number) => {
      if (isGameOver) return;

      const deltaMs = Math.min(34, Math.max(1, currentTime - lastTimeRef.current));
      lastTimeRef.current = currentTime;
      const dt = deltaMs / 1000;

      // Fisika bar responsif tanpa rasa berat/delay
      const gravity = -310;
      const lift = 680;

      if (isPressingRef.current) {
        if (barVelocityRef.current < 0) {
          // Redam kecepatan jatuh dengan cepat saat tombol mulai ditahan agar langsung naik
          barVelocityRef.current += lift * 1.65 * dt;
        } else {
          barVelocityRef.current += lift * dt;
        }
      } else {
        if (barVelocityRef.current > 0) {
          barVelocityRef.current += gravity * 1.35 * dt;
        } else {
          barVelocityRef.current += gravity * dt;
        }
      }

      barVelocityRef.current *= Math.pow(0.91, dt * 60);
      barVelocityRef.current = Math.max(-240, Math.min(280, barVelocityRef.current));

      barYRef.current += barVelocityRef.current * dt;

      if (barYRef.current <= 0) {
        barYRef.current = 0;
        barVelocityRef.current = 0;
      } else if (barYRef.current >= maxBarY) {
        barYRef.current = maxBarY;
        barVelocityRef.current = 0;
      }

      if (currentTime > fishNextMoveTimeRef.current) {
        fishNextMoveTimeRef.current = currentTime + fishChangeInterval + Math.random() * 750;
        fishTargetYRef.current = Math.random() * maxFishY;
      }

      const dy = fishTargetYRef.current - fishYRef.current;
      fishYRef.current += dy * Math.min(1.0, fishSpeed * dt * 2.2);

      const fishCenter = fishYRef.current + FISH_SIZE * 0.5;
      const barBottom = barYRef.current;
      const barTop = barYRef.current + BAR_HEIGHT;
      const inside = fishCenter >= barBottom - 5 && fishCenter <= barTop + 5;

      if (inside !== wasInsideRef.current) {
        wasInsideRef.current = inside;
        if (catchBarElRef.current) {
          catchBarElRef.current.style.opacity = inside ? '1.0' : '0.65';
          catchBarElRef.current.style.borderColor = inside ? '#386641' : '#5C3A21';
          catchBarElRef.current.style.boxShadow = inside
            ? '0 0 12px rgba(168, 230, 207, 0.8), inset 0 2px 0 #D4F5E9'
            : 'inset 0 2px 0 #D4F5E9';
        }
      }

      if (inside) {
        progressRef.current = Math.min(100, progressRef.current + progressGainRate * dt);
      } else {
        progressRef.current = Math.max(0, progressRef.current - progressDrainRate * dt);
      }

      // Update posisi langsung ke GPU via CSS transform (0 React re-render, 0 layout reflow!)
      if (catchBarElRef.current) {
        catchBarElRef.current.style.transform = `translate3d(0, ${-barYRef.current}px, 0)`;
      }
      if (fishIconElRef.current) {
        fishIconElRef.current.style.transform = `translate3d(-50%, ${-fishYRef.current}px, 0)`;
      }
      if (progressFillElRef.current) {
        const ratio = Math.max(0, Math.min(1, progressRef.current / 100));
        progressFillElRef.current.style.transform = `scaleY(${ratio})`;
        progressFillElRef.current.style.backgroundColor =
          progressRef.current > 60 ? '#A8E6CF' : '#FFAE6D';
      }

      const roundedPct = Math.round(progressRef.current);
      if (roundedPct !== lastDisplayedPctRef.current) {
        lastDisplayedPctRef.current = roundedPct;
        if (progressTextElRef.current) {
          progressTextElRef.current.textContent = `${roundedPct}%`;
        }
      }

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

            {/* Kotak Hijau Pastel Penangkap (Catch Bar - GPU Transform) */}
            <div
              ref={catchBarElRef}
              className="absolute inset-x-1 bottom-0 rounded-md border-2 border-[#5C3A21] bg-[#A8E6CF] flex items-center justify-center pointer-events-none"
              style={{
                height: `${BAR_HEIGHT}px`,
                transform: `translate3d(0, ${-barYRef.current}px, 0)`,
                willChange: 'transform',
                transition: 'none',
                boxShadow: 'inset 0 2px 0 #D4F5E9',
              }}
            >
              <div className="w-full h-1 bg-[#5C3A21]/30 rounded-full mx-1.5" />
            </div>

            {/* Ikon Ikan Bergerak (GPU Transform) */}
            <div
              ref={fishIconElRef}
              className="absolute left-1/2 bottom-0 flex items-center justify-center pointer-events-none"
              style={{
                width: `${FISH_SIZE}px`,
                height: `${FISH_SIZE}px`,
                transform: `translate3d(-50%, ${-fishYRef.current}px, 0)`,
                willChange: 'transform',
                transition: 'none',
              }}
            >
              <div className="w-6 h-6 rounded-full bg-[#FFAE6D] border-2 border-[#5C3A21] text-black flex items-center justify-center">
                <Fish className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Meteran Kemajuan Tangkapan (Gauge - GPU scaleY) */}
          <div className="flex flex-col items-center">
            <span ref={progressTextElRef} className="text-[10px] font-bold text-black mb-1">
              42%
            </span>
            <div
              className="relative w-4 sm:w-5 rounded-full bg-[#FFF8EA] border-2 border-[#5C3A21] overflow-hidden flex flex-col justify-end p-0.5"
              style={{ height: `${TRACK_HEIGHT}px` }}
            >
              <div
                ref={progressFillElRef}
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: '#FFAE6D',
                  transformOrigin: 'bottom',
                  transform: 'scaleY(0.42)',
                  willChange: 'transform',
                  transition: 'none',
                }}
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
            className="w-full mt-2.5 py-2.5 sm:py-3 px-3 font-bold text-xs sm:text-sm uppercase select-none touch-none flex flex-col items-center justify-center gap-0.5 text-black cursor-pointer clay-btn-primary"
            style={{ touchAction: 'none', transition: 'none' }}
          >
            <span ref={reelBtnTextRef}>TAHAN ANGKAT JORAN</span>
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
