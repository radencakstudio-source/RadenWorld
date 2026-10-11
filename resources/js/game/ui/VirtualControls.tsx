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
import { Zap } from 'lucide-react';
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
  const sound = SoundManager.getInstance();

  const maxRadius = 42;

  const updateJoystick = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);

      // Batasi posisi knob dalam radius maksimum 42px
      const clampedDist = Math.min(distance, maxRadius);
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: knobX, y: knobY });

      // Jika digerakkan lebih dari deadzone (> 6px), kirim vektor analog 360 derajat
      if (clampedDist > 6) {
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
    <div className="fixed inset-x-0 bottom-12 md:bottom-16 z-40 pointer-events-none flex justify-between items-end px-5 md:px-10 font-['Chakra_Petch']">
      {/* ================================================================ */}
      {/* KIRI BAWAH: ANALOG JOYSTICK VIRTUAL SENTUH (360 DERAJAT)         */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none pb-1 pl-1">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-32 h-32 rounded-full bg-black/90 border-2 border-neutral-800 flex items-center justify-center cursor-pointer select-none touch-none shadow-lg shadow-black/60"
        >
          {/* Garis Salib Sumbu Arah */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-0.5 bg-neutral-800/80" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-20 w-0.5 bg-neutral-800/80" />
          </div>

          {/* Lingkaran Batas Dalam */}
          <div className="absolute w-20 h-20 rounded-full border border-neutral-800/60 pointer-events-none" />

          {/* Knob Analog (Mengikuti Sentuhan Jari Mulus Tanpa Mental/Balik Sendiri) */}
          <div
            className={`w-14 h-14 rounded-full border-2 border-amber-300 bg-amber-500 flex items-center justify-center transition-transform select-none shadow-md shadow-amber-500/30 ${
              isDragging ? 'duration-0 scale-95' : 'duration-150 ease-out scale-100'
            }`}
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
            }}
          >
            <div className="w-5 h-5 rounded-full bg-black border border-amber-300" />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* KANAN BAWAH: TOMBOL INTERAKSI [AKSI] TUNGGAL BULAT               */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none pb-1 pr-1">
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
          className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center font-black cursor-pointer transition-all select-none active:scale-90 ${
            isActionActive
              ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white ring-4 ring-amber-300 animate-pulse shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-105'
              : 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border-2 border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.35)]'
          }`}
          title={isActionActive ? 'Sentuh untuk Berbicara / Interaksi' : 'Tombol Aksi'}
        >
          <Zap className={`w-6 h-6 md:w-7 md:h-7 stroke-[2.5] ${isActionActive ? 'fill-black text-black' : 'fill-black text-black'}`} />
          <span className="text-[11px] md:text-xs font-black tracking-widest leading-none mt-1 text-black uppercase">
            AKSI
          </span>
        </button>
      </div>
    </div>
  );
};
