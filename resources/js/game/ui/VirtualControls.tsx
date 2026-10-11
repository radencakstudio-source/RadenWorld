/**
 * ============================================================================
 * FILE: resources/js/game/ui/VirtualControls.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kontrol Virtual Analog (Touch Joystick 360°) dan Tombol Interaksi [AKSI] khusus Mobile (HP/Tablet).
 * 
 * FITUR:
 * 1. Analog Joystick 360° yang mulus, presisi, dan responsif di kiri bawah.
 * 2. Tombol Aksi / Interaksi [AKSI] di kanan bawah (tanpa tombol chat dobel).
 * 3. Skema warna elegan: Flat Dark Carbon (#000000) & Emas Amber (#f59e0b).
 * ============================================================================
 */

import React, { useState, useRef, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';

interface VirtualControlsProps {
  onActionPress: () => void;
  onDirectionPress?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionRelease?: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onActionPress,
  onDirectionPress,
  onDirectionRelease,
}) => {
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const isMouseDraggingRef = useRef(false);
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

      // Batasi posisi knob dalam radius maksimum
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

        // Kompatibilitas arah diskrit
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
    touchIdRef.current = null;
    isMouseDraggingRef.current = false;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    EventBus.emit('joystick-end');
    onDirectionRelease?.();
  }, [onDirectionRelease]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Mouse handlers untuk devtools mobile emulation
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDraggingRef.current = true;
    setIsDragging(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDraggingRef.current) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (!isMouseDraggingRef.current) return;
    resetJoystick();
  };

  return (
    <div className="fixed inset-x-0 bottom-12 md:bottom-16 z-40 pointer-events-none flex justify-between items-end px-5 md:px-10 font-['Chakra_Petch']">
      {/* ================================================================ */}
      {/* KIRI BAWAH: ANALOG JOYSTICK VIRTUAL SENTUH (360 DERAJAT)         */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none pb-1 pl-1">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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

          {/* Knob Analog (Mengikuti Sentuhan Jari) */}
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
          className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border-2 border-amber-300 text-black active:scale-90 flex flex-col items-center justify-center font-black cursor-pointer transition-transform shadow-[0_4px_20px_rgba(245,158,11,0.35)] select-none"
          title="Tombol Aksi / Interaksi"
        >
          <Zap className="w-6 h-6 md:w-7 md:h-7 fill-black text-black stroke-[2.5]" />
          <span className="text-[11px] md:text-xs font-black tracking-widest leading-none mt-1 text-black uppercase">AKSI</span>
        </button>
      </div>
    </div>
  );
};
