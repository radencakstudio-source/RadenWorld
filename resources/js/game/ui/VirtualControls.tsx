/**
 * ============================================================================
 * FILE: resources/js/game/ui/VirtualControls.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kontrol Virtual Analog (Touch Joystick 360°) dan Tombol Interaksi [AKSI, LOMPAT, MANCING]
 * khusus Perangkat Layar Sentuh Mobile (HP/Tablet).
 * 
 * FITUR & KEUNGGULAN:
 * 1. DUAL INPUT ENGINE (TouchEvents + PointerEvents):
 *    - 100% Multi-touch handal (Jempol kiri di analog, jempol kanan lompat/aksi bebas bersamaan).
 *    - Melacak touch.identifier secara independen sehingga tidak ada bentrok multi-jari.
 * 2. ANTI-KESELIP MOBILE BROWSER:
 *    - Menggunakan env(safe-area-inset-bottom/left/right) dan padding dinamis.
 *    - Tampil di atas URL bar / navigation pill / gesture bar pada iOS Safari & Android Chrome.
 * 3. HAPTIC FEEDBACK HALUS (Vibration API):
 *    - Getaran mikro 15ms saat memencet tombol aksi/lompat untuk sensasi gamepad konsol.
 * 4. ULTRA RESPONSIF:
 *    - Child elements di dalam joystick base berstatus pointer-events-none agar kalkulasi
 *      vektor analog tidak pernah terputus atau loncat.
 * ============================================================================
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Zap, ArrowUp, Fish } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';

interface VirtualControlsProps {
  onActionPress: () => void;
  onDirectionPress?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionRelease?: () => void;
  isActionActive?: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onActionPress,
  onDirectionPress,
  onDirectionRelease,
  isActionActive = false,
}) => {
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastJumpTimeRef = useRef<number>(0);
  const lastActionTimeRef = useRef<number>(0);
  const isFishChargingRef = useRef<boolean>(false);

  const sound = SoundManager.getInstance();

  // Radius maksimum pergerakan knob analog
  const maxRadius = 40;

  // Haptic feedback getaran halus pada HP
  const triggerHaptic = useCallback((ms: number = 15) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch (e) {}
  }, []);

  /**
   * Mengkalkulasi sudut & vektor arah joystick dari koordinat sentuhan layar
   */
  const updateJoystickFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      let center = baseCenterRef.current;
      if (!center) {
        if (!joystickBaseRef.current) return;
        const rect = joystickBaseRef.current.getBoundingClientRect();
        center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        baseCenterRef.current = center;
      }

      const dx = clientX - center.x;
      const dy = clientY - center.y;
      const distance = Math.hypot(dx, dy);

      // Batasi posisi knob dalam radius maksimum
      const clampedDist = Math.min(distance, maxRadius);
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: knobX, y: knobY });

      // Deadzone 5px
      if (clampedDist > 5) {
        const normX = knobX / maxRadius;
        const normY = knobY / maxRadius;

        EventBus.emit('joystick-move', { x: normX, y: normY });

        if (onDirectionPress) {
          const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          onDirectionPress(dir);
        }
      } else {
        EventBus.emit('joystick-end');
        onDirectionRelease?.();
      }
    },
    [maxRadius, onDirectionPress, onDirectionRelease]
  );

  const resetJoystick = useCallback(() => {
    activeTouchIdRef.current = null;
    activePointerIdRef.current = null;
    baseCenterRef.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    EventBus.emit('joystick-end');
    onDirectionRelease?.();
  }, [onDirectionRelease]);

  // ==========================================================================
  // GLOBAL WINDOW EVENT LISTENERS (Menjamin drag tidak terputus saat jari keluar)
  // ==========================================================================
  useEffect(() => {
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (activeTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          updateJoystickFromCoords(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleWindowTouchEnd = (e: TouchEvent) => {
      if (activeTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          resetJoystick();
          break;
        }
      }
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.pointerId === activePointerIdRef.current) {
        updateJoystickFromCoords(e.clientX, e.clientY);
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.pointerId === activePointerIdRef.current) {
        resetJoystick();
      }
    };

    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleWindowTouchEnd, { passive: true });
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', handleWindowPointerUp, { passive: true });
    window.addEventListener('pointercancel', handleWindowPointerUp, { passive: true });

    return () => {
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
      window.removeEventListener('touchcancel', handleWindowTouchEnd);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [updateJoystickFromCoords, resetJoystick]);

  // ==========================================================================
  // JOYSTICK TOUCH HANDLERS (Multi-Touch Native)
  // ==========================================================================
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (!touch || !joystickBaseRef.current) return;

    activeTouchIdRef.current = touch.identifier;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    baseCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setIsDragging(true);
    triggerHaptic(10);
    updateJoystickFromCoords(touch.clientX, touch.clientY);
  };

  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Abaikan jika sudah ditangani oleh touchstart
    if (activeTouchIdRef.current !== null) return;
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    activePointerIdRef.current = e.pointerId;
    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      baseCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    setIsDragging(true);
    triggerHaptic(10);
    updateJoystickFromCoords(e.clientX, e.clientY);
  };

  // ==========================================================================
  // TOMBOL AKSI, LOMPAT, & MANCING HANDLERS
  // ==========================================================================
  const handleJumpPress = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastJumpTimeRef.current < 160) return;
    lastJumpTimeRef.current = now;

    triggerHaptic(20);
    sound.playClick();
    EventBus.emit('player-jump');
  }, [sound, triggerHaptic]);

  const handleActionButtonPress = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionTimeRef.current < 200) return;
    lastActionTimeRef.current = now;

    triggerHaptic(25);
    sound.playClick();
    EventBus.emit('player-action');
    onActionPress();
  }, [sound, onActionPress, triggerHaptic]);

  const [isFishBiting, setIsFishBiting] = useState(false);

  // Pantau status ikan menyambar untuk memunculkan indikator tombol menyala di mobile
  useEffect(() => {
    const handleBite = () => {
      setIsFishBiting(true);
      triggerHaptic(60);
    };
    const handleBiteEnd = () => {
      setIsFishBiting(false);
    };

    EventBus.on('fishing-bite', handleBite);
    EventBus.on('fishing-state-changed', (state: string) => {
      if (state !== 'bite') setIsFishBiting(false);
    });
    EventBus.on('fishing-ended', handleBiteEnd);
    EventBus.on('fishing-minigame-start', handleBiteEnd);

    return () => {
      EventBus.off('fishing-bite', handleBite);
      EventBus.off('fishing-ended', handleBiteEnd);
      EventBus.off('fishing-minigame-start', handleBiteEnd);
    };
  }, [triggerHaptic]);

  const handleFishPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    // Jika ikan sedang menyambar, ketukan ini langsung melakukan STRIKE kail!
    if (isFishBiting) {
      triggerHaptic(40);
      sound.playClick();
      setIsFishBiting(false);
      EventBus.emit('player-strike');
      EventBus.emit('player-action');
      return;
    }

    if (isFishChargingRef.current) return;
    isFishChargingRef.current = true;

    triggerHaptic(20);
    sound.playClick();
    EventBus.emit('fishing-charge-start');
  }, [sound, triggerHaptic, isFishBiting]);

  const handleFishPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    if (!isFishChargingRef.current) return;
    isFishChargingRef.current = false;

    triggerHaptic(15);
    EventBus.emit('fishing-charge-release');
  }, [triggerHaptic]);

  // Fallback pengaman: Jika jari diangkat di luar layar HP, pastikan status charging kail terlepas bersih
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isFishChargingRef.current) {
        isFishChargingRef.current = false;
        EventBus.emit('fishing-charge-release');
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    window.addEventListener('touchcancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('touchcancel', handleGlobalPointerUp);
    };
  }, []);

  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="fixed inset-x-0 bottom-0 z-[45] pointer-events-none select-none flex justify-between items-end font-['Chakra_Petch']"
      style={{
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
      }}
    >
      {/* ================================================================ */}
      {/* KIRI BAWAH: ANALOG JOYSTICK VIRTUAL 360 DERAJAT                   */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none pb-1">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onPointerDown={handleJoystickPointerDown}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="relative w-26 h-26 sm:w-28 sm:h-28 rounded-full bg-black/75 border-2 border-white/25 flex items-center justify-center cursor-pointer select-none touch-none shadow-2xl backdrop-blur-xs active:border-amber-400/80 transition-colors"
          style={{ touchAction: 'none' }}
          role="slider"
          aria-label="Analog Virtual Joystick"
        >
          {/* Garis Salib Sumbu Arah Halus */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 sm:w-16 h-0.5 bg-white/15" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-14 sm:h-16 w-0.5 bg-white/15" />
          </div>

          {/* Lingkaran Batas Dalam Tipis */}
          <div className="absolute w-14 sm:w-16 h-14 sm:h-16 rounded-full border border-white/15 pointer-events-none" />

          {/* Knob Analog Responsif */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white/40 bg-neutral-900/95 flex items-center justify-center transition-transform select-none shadow-xl pointer-events-none ${
              isDragging ? 'duration-0 border-amber-400 bg-neutral-950 scale-105' : 'duration-150 ease-out'
            }`}
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
            }}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                isDragging ? 'border-amber-400 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'border-white/30 bg-white/20'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* KANAN BAWAH: CLUSTER KONTROL AKSI MOBILE                         */}
      {/* - Mancing di KIRI Aksi                                           */}
      {/* - Lompat di ATAS Aksi                                            */}
      {/* - Aksi Utama [AKSI] di KANAN                                     */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none pb-1 relative flex items-end">
        <div className="flex items-end gap-2.5 sm:gap-3 select-none touch-none">
          {/* 1. Tombol Mancing (Tahan untuk Menimbang Lemparan Kail / Strike) */}
          <div className="flex flex-col items-center justify-end pb-0.5">
            <button
              type="button"
              onPointerDown={handleFishPointerDown}
              onPointerUp={handleFishPointerUp}
              onPointerCancel={handleFishPointerUp}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-xl active:scale-95 transition-all select-none ${
                isFishBiting
                  ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-white text-black ring-4 ring-amber-400/80 animate-bounce shadow-[0_0_25px_rgba(245,158,11,1)] scale-110'
                  : 'bg-black/75 hover:bg-black/90 active:bg-neutral-800 border-2 border-white/25 text-neutral-200'
              }`}
              style={{ touchAction: 'none' }}
              title={isFishBiting ? "IKAN MENYAMBAR! KETUK UNTUK TARIK!" : "Tahan untuk Menimbang Lemparan Kail / Strike (F)"}
              aria-label="Tombol Mancing"
            >
              <Fish className={`w-4 h-4 sm:w-5 sm:h-5 stroke-[2] ${isFishBiting ? 'text-black stroke-[3]' : 'text-neutral-200'}`} />
              <span className={`text-[7px] sm:text-[7.5px] font-mono font-black tracking-wider leading-none mt-0.5 ${isFishBiting ? 'text-black' : 'text-neutral-400'}`}>
                {isFishBiting ? 'TARIK!' : 'MANCING'}
              </span>
            </button>
          </div>

          {/* Kolom Kanan: Tombol Lompat (di atas) + Tombol Aksi Utama (di bawah) */}
          <div className="flex flex-col items-center gap-2 sm:gap-2.5">
            {/* 2. Tombol Lompat Mobile (Di Atas Aksi) */}
            <button
              type="button"
              onPointerDown={handleJumpPress}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-black/75 hover:bg-black/90 active:bg-neutral-800 border-2 border-white/25 text-neutral-100 flex flex-col items-center justify-center cursor-pointer shadow-xl active:scale-95 transition-all select-none"
              style={{ touchAction: 'none' }}
              title="Lompat / Double Jump (Spasi)"
              aria-label="Tombol Lompat"
            >
              <ArrowUp className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5] text-amber-300" />
              <span className="text-[7px] sm:text-[8px] font-mono font-bold tracking-wider leading-none mt-0.5 text-neutral-300">
                LOMPAT
              </span>
            </button>

            {/* 3. Tombol Aksi Utama (Paling Gede, Mewah & Responsif) */}
            <button
              type="button"
              onPointerDown={handleActionButtonPress}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all select-none active:scale-95 shadow-2xl ${
                isActionActive
                  ? 'bg-amber-500/30 border-2 border-amber-400 text-amber-300 ring-4 ring-amber-400/40 animate-pulse shadow-[0_0_24px_rgba(245,158,11,0.5)]'
                  : 'bg-black/75 hover:bg-black/90 active:bg-neutral-800 border-2 border-white/25 text-neutral-200'
              }`}
              style={{ touchAction: 'none' }}
              title={isActionActive ? 'Sentuh untuk Berbicara / Interaksi' : 'Tombol Aksi [E]'}
              aria-label="Tombol Aksi"
            >
              <Zap
                className={`w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2] transition-colors ${
                  isActionActive ? 'text-amber-300 fill-amber-400/40' : 'text-neutral-200'
                }`}
              />
              <span
                className={`text-[9px] sm:text-[10px] font-mono font-black tracking-widest uppercase mt-0.5 sm:mt-1 transition-colors ${
                  isActionActive ? 'text-amber-300' : 'text-neutral-300'
                }`}
              >
                AKSI
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
