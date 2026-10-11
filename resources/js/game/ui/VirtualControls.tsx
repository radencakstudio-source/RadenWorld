/**
 * ============================================================================
 * FILE: resources/js/game/ui/VirtualControls.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kontrol Virtual Analog (Touch Joystick) dan Tombol Interaksi [E] khusus Mobile (HP/Tablet).
 * Desain:
 * 1. Analog Joystick sentuh 360° yang mulus dan responsif di kiri bawah.
 * 2. Tombol Interaksi [E] dan tombol Chat [/] di kanan bawah.
 * 3. Desain elegan gelap & emas amber, tanpa kedip, tanpa gangguan.
 * ============================================================================
 */

import React, { useState, useRef, useCallback } from 'react';
import { MessageSquare, Zap } from 'lucide-react';

interface VirtualControlsProps {
  onDirectionPress: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionRelease: () => void;
  onActionPress: () => void;
  onChatPress: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionPress,
  onDirectionRelease,
  onActionPress,
  onChatPress,
}) => {
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const activeDirRef = useRef<'up' | 'down' | 'left' | 'right' | null>(null);

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

      // Jika pergeseran cukup signifikan (> 12px), tentukan arah
      if (clampedDist > 12) {
        let dir: 'up' | 'down' | 'left' | 'right';
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx > 0 ? 'right' : 'left';
        } else {
          dir = dy > 0 ? 'down' : 'up';
        }

        if (activeDirRef.current !== dir) {
          activeDirRef.current = dir;
          onDirectionPress(dir);
        }
      } else {
        if (activeDirRef.current !== null) {
          activeDirRef.current = null;
          onDirectionRelease();
        }
      }
    },
    [onDirectionPress, onDirectionRelease]
  );

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
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        activeDirRef.current = null;
        onDirectionRelease();
        break;
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 pointer-events-none flex justify-between items-end px-4 md:px-8 font-['Chakra_Petch']">
      {/* ================================================================ */}
      {/* KIRI BAWAH: ANALOG JOYSTICK VIRTUAL SENTUH                       */}
      {/* ================================================================ */}
      <div className="pointer-events-auto select-none touch-none">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative w-28 h-28 rounded-full bg-black border-2 border-neutral-800 flex items-center justify-center cursor-pointer"
        >
          {/* Sumbu Arah Halus (Indikator Salib) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-0.5 bg-neutral-800" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-16 w-0.5 bg-neutral-800" />
          </div>

          {/* Knob Analog yang Bergerak Bersama Sentuhan Jari */}
          <div
            className={`w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-500 flex items-center justify-center transition-transform ${
              isDragging ? 'duration-0 scale-95' : 'duration-150 ease-out scale-100'
            }`}
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-black border border-amber-300" />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* KANAN BAWAH: TOMBOL INTERAKSI [E] & TOMBOL CHAT                  */}
      {/* ================================================================ */}
      <div className="pointer-events-auto flex items-end gap-3 select-none touch-none">
        {/* Tombol Cepat Buka Chat */}
        <button
          type="button"
          onClick={onChatPress}
          className="w-11 h-11 rounded-md bg-black border border-neutral-800 text-amber-400 active:bg-amber-500 active:text-black flex items-center justify-center cursor-pointer transition-colors"
          title="Buka Obrolan"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Tombol Interaksi Utama [E] (Bicara NPC / Buka Pintu / Aksi) */}
        <button
          type="button"
          onClick={onActionPress}
          className="w-14 h-14 rounded-lg bg-amber-500 border border-amber-400 text-black active:scale-90 flex flex-col items-center justify-center font-black cursor-pointer transition-colors"
          title="Tombol Interaksi [E]"
        >
          <Zap className="w-5 h-5 fill-current text-black" />
          <span className="text-[10px] font-extrabold tracking-widest mt-0.5">AKSI</span>
        </button>
      </div>
    </div>
  );
};
