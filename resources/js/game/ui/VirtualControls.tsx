/**
 * ============================================================================
 * FILE: resources/js/game/ui/VirtualControls.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Tombol kontrol virtual di layar sentuh untuk mode perangkat Mobile (HP/Tablet).
 * Menyediakan D-Pad 4 arah (Atas, Bawah, Kiri, Kanan) dan tombol aksi interaktif.
 * ============================================================================
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sword, MessageSquare } from 'lucide-react';

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
  return (
    <div className="fixed inset-x-0 bottom-6 z-40 pointer-events-none flex justify-between items-end px-6 md:px-12">
      {/* Left: Virtual D-Pad Touch Controls */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36 bg-slate-900/60 backdrop-blur-md p-2 rounded-3xl border border-slate-700/60 shadow-2xl select-none touch-none">
        <div />
        {/* Up */}
        <button
          type="button"
          onMouseDown={() => onDirectionPress('up')}
          onMouseUp={onDirectionRelease}
          onTouchStart={() => onDirectionPress('up')}
          onTouchEnd={onDirectionRelease}
          className="flex items-center justify-center rounded-2xl bg-slate-800/80 active:bg-cyan-500 border border-slate-700 active:text-slate-950 text-slate-200 transition-colors shadow"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        {/* Left */}
        <button
          type="button"
          onMouseDown={() => onDirectionPress('left')}
          onMouseUp={onDirectionRelease}
          onTouchStart={() => onDirectionPress('left')}
          onTouchEnd={onDirectionRelease}
          className="flex items-center justify-center rounded-2xl bg-slate-800/80 active:bg-cyan-500 border border-slate-700 active:text-slate-950 text-slate-200 transition-colors shadow"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Pad Hub */}
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-600" />
        </div>

        {/* Right */}
        <button
          type="button"
          onMouseDown={() => onDirectionPress('right')}
          onMouseUp={onDirectionRelease}
          onTouchStart={() => onDirectionPress('right')}
          onTouchEnd={onDirectionRelease}
          className="flex items-center justify-center rounded-2xl bg-slate-800/80 active:bg-cyan-500 border border-slate-700 active:text-slate-950 text-slate-200 transition-colors shadow"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        {/* Down */}
        <button
          type="button"
          onMouseDown={() => onDirectionPress('down')}
          onMouseUp={onDirectionRelease}
          onTouchStart={() => onDirectionPress('down')}
          onTouchEnd={onDirectionRelease}
          className="flex items-center justify-center rounded-2xl bg-slate-800/80 active:bg-cyan-500 border border-slate-700 active:text-slate-950 text-slate-200 transition-colors shadow"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* Right: Action & Chat Touch Buttons */}
      <div className="pointer-events-auto flex items-end gap-3 select-none touch-none">
        {/* Quick Chat Button */}
        <button
          type="button"
          onClick={onChatPress}
          className="w-12 h-12 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-cyan-400 active:bg-cyan-500 active:text-slate-950 flex items-center justify-center shadow-lg transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Big Action / Attack Button */}
        <button
          type="button"
          onClick={onActionPress}
          className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 active:scale-95 flex items-center justify-center shadow-xl shadow-amber-500/30 font-bold transition-all"
        >
          <Sword className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
