/**
 * ============================================================================
 * FILE: resources/js/game/ui/VirtualControls.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kontrol Virtual Analog (Touch Joystick 360°) dan Tombol Interaksi [AKSI] khusus Mobile (HP/Tablet).
 * 
 * PENINGKATAN:
 * 1. Pointer Capture & Global Window Listener: Mencegah bug analog "balik ke awal" di Chrome saat digeser keluar lingkaran.
 * 2. Tombol Aksi [AKSI] Bulat Tunggal di Kanan Bawah:
 *    - Aktif & bercahaya (ring-4 ring-amber-300 animate-pulse) saat dekat NPC (Kapten Bima) / pintu.
 *    - Mengeliminasi teks dialog di kiri bawah khusus mode mobile.
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
  const activePointerIdRef = useRef<number | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const lastJumpTimeRef = useRef<number>(0);
  const sound = SoundManager.getInstance();

  const handleJumpPress = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastJumpTimeRef.current < 200) return;
    lastJumpTimeRef.current = now;
    sound.playClick();
    EventBus.emit('player-jump');
  }, [sound]);

  // Radius maksimum pergerakan knob analog (dikalibrasi untuk base w-28 h-28 / 112px)
  const maxRadius = 38;

  const updateJoystick = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);

      // Batasi posisi knob dalam radius maksimum
      const clampedDist = Math.min(distance, maxRadius);
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: knobX, y: knobY });

      // Jika digerakkan lebih dari deadzone (> 5px), kirim vektor analog 360 derajat
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
    [onDirectionPress, onDirectionRelease]
  );

  const resetJoystick = useCallback(() => {
    activePointerIdRef.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    EventBus.emit('joystick-end');
    onDirectionRelease?.();
  }, [onDirectionRelease]);

  // Window fallback listeners untuk menjamin drag tidak pernah terputus di Chrome/Safari/Firefox
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.pointerId === activePointerIdRef.current) {
        updateJoystick(e.clientX, e.clientY);
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.pointerId === activePointerIdRef.current) {
        resetJoystick();
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [updateJoystick, resetJoystick]);

  // Pointer Handlers dengan Pointer Capture
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    activePointerIdRef.current = e.pointerId;
    setIsDragging(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === null || e.pointerId !== activePointerIdRef.current) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
      resetJoystick();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-3 sm:bottom-6 md:bottom-10 z-40 pointer-events-none flex justify-between items-end px-3 sm:px-6 md:px-10 font-['Chakra_Petch']">
      {/* ================================================================ */}
      {/* KIRI BAWAH: ANALOG JOYSTICK VIRTUAL (SIMPEL, ELEGAN & RESPONSIF) */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none pb-1 pl-1">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-22 h-22 sm:w-26 sm:h-26 md:w-28 md:h-28 rounded-full bg-black/60 border border-white/20 flex items-center justify-center cursor-pointer select-none touch-none shadow-lg"
        >
          {/* Garis Salib Sumbu Arah Halus */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 sm:w-16 h-px bg-white/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-12 sm:h-16 w-px bg-white/10" />
          </div>

          {/* Lingkaran Batas Dalam Tipis */}
          <div className="absolute w-12 sm:w-16 h-12 sm:h-16 rounded-full border border-white/10 pointer-events-none" />

          {/* Knob Analog Elegan & Responsif */}
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-neutral-900/90 flex items-center justify-center transition-transform select-none shadow-md ${
              isDragging ? 'duration-0 border-amber-400/70 bg-neutral-900' : 'duration-150 ease-out'
            }`}
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
            }}
          >
            <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border ${isDragging ? 'border-amber-400/80 bg-amber-400/30' : 'border-white/30 bg-white/15'}`} />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* KANAN BAWAH: CLUSTER KONTROL AKSI MOBILE (ELEGAN & BERKELAS)     */}
      {/* - Mancing di KIRI Aksi                                           */}
      {/* - Lompat di ATAS Aksi                                            */}
      {/* - Aksi Utama di KANAN                                            */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none pb-1 pr-1 relative flex items-end">
        <div className="flex items-end gap-2 sm:gap-3 select-none touch-none">
          {/* Kolom Kiri: Tombol Mancing (Minimalis & Bersih) */}
          <div className="flex flex-col items-center justify-end pb-1">
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                sound.playClick();
                EventBus.emit('fishing-charge-start');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                EventBus.emit('fishing-charge-release');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                sound.playClick();
                EventBus.emit('fishing-charge-start');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                EventBus.emit('fishing-charge-release');
              }}
              className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-neutral-200 flex flex-col items-center justify-center cursor-pointer shadow-md active:scale-95 active:bg-neutral-800 transition-all select-none"
              title="Tahan untuk Menimbang Lemparan Kail (F)"
            >
              <Fish className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] text-neutral-200" />
              <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold tracking-wider leading-none mt-0.5 text-neutral-400">
                MANCING
              </span>
            </button>
          </div>

          {/* Kolom Kanan: Tombol Lompat (di atas) + Tombol Aksi Utama (di bawah) */}
          <div className="flex flex-col items-center gap-2 sm:gap-2.5">
            {/* 1. Tombol Lompat Mobile (Di Atas Aksi, Bersih & Elegan) */}
            <button
              type="button"
              onTouchStart={handleJumpPress}
              onClick={handleJumpPress}
              className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-neutral-200 flex flex-col items-center justify-center cursor-pointer shadow-md active:scale-95 active:bg-neutral-800 transition-all select-none"
              title="Lompat / Double Jump (Spasi)"
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] text-neutral-200" />
              <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold tracking-wider leading-none mt-0.5 text-neutral-400">
                LOMPAT
              </span>
            </button>

            {/* 2. Tombol Aksi Utama (Paling Gede Setara Analog, Mewah & Minimalis) */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                sound.playClick();
                onActionPress();
              }}
              onClick={(e) => {
                e.preventDefault();
                sound.playClick();
                onActionPress();
              }}
              className={`w-22 h-22 sm:w-26 sm:h-26 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all select-none active:scale-95 shadow-lg ${
                isActionActive
                  ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300'
                  : 'bg-black/60 hover:bg-black/80 border border-white/20 text-neutral-200'
              }`}
              title={isActionActive ? 'Sentuh untuk Berbicara / Interaksi' : 'Tombol Aksi [E]'}
            >
              <Zap
                className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2] transition-colors ${
                  isActionActive ? 'text-amber-300 fill-amber-400/30' : 'text-neutral-200'
                }`}
              />
              <span
                className={`text-[8.5px] sm:text-[9.5px] md:text-[10px] font-mono font-bold tracking-widest uppercase mt-0.5 sm:mt-1 transition-colors ${
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
