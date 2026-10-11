import React from 'react';
import { X, Keyboard, MousePointer, MessageSquare, Box, Code2 } from 'lucide-react';

interface ControlGuideProps {
  isOpen: boolean;
  onClose: () => void;
  controlMode?: 'pc' | 'mobile';
}

export const ControlGuide: React.FC<ControlGuideProps> = ({ isOpen, onClose, controlMode = 'pc' }) => {
  if (!isOpen) return null;

  const isMobile = controlMode === 'mobile';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 pointer-events-auto">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-2xl p-6 text-neutral-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <Keyboard className="w-5 h-5" />
            <span>Petunjuk Kontrol ({isMobile ? 'Mode Mobile' : 'Mode PC'})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-neutral-300">
          <div className="flex items-start gap-3 bg-[#0e0e0e] p-3 rounded-xl border border-neutral-800">
            <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">Navigasi / Pergerakan Karakter</div>
              <p className="text-neutral-400 leading-relaxed">
                {isMobile ? (
                  <>Gunakan <strong>Analog Joystick Sentuh 360°</strong> di kiri bawah atau tap lantai langsung untuk berjalan ke titik tujuan.</>
                ) : (
                  <>Gunakan tombol <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">W</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">A</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">S</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">D</kbd> atau tombol <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">Panah</kbd> untuk berjalan.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#0e0e0e] p-3 rounded-xl border border-neutral-800">
            <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">Interaksi Objek & NPC</div>
              <p className="text-neutral-400 leading-relaxed">
                {isMobile ? (
                  <>Dekati objek/NPC lalu sentuh tombol bulat <strong>[AKSI]</strong> di kanan bawah layar untuk berdialog atau masuk ruangan.</>
                ) : (
                  <>Dekati objek/NPC lalu tekan tombol <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">E</kbd> atau klik mouse pada objek.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#0e0e0e] p-3 rounded-xl border border-neutral-800">
            <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">Multiplayer Real-Time Chat</div>
              <p className="text-neutral-400 leading-relaxed">
                {isMobile ? (
                  <>Sentuh ikon <strong>Chat</strong> di sebelah avatar profil untuk membuka pesan obrolan global.</>
                ) : (
                  <>Tekan <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">Enter</kbd> atau tombol Chat di atas untuk membuka input obrolan.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#0e0e0e] p-3 rounded-xl border border-neutral-800">
            <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">Arsitektur Game OOP</div>
              <p className="text-neutral-400 leading-relaxed">
                Dibangun dengan <strong>TypeScript OOP</strong>: Base class <code className="text-amber-300">Entity</code>, diwarisi oleh <code className="text-amber-300">Player</code>, <code className="text-amber-300">RemotePlayer</code>, dan <code className="text-amber-300">Monster</code>. Real-time network dikelola oleh <code className="text-amber-300">NetworkManager</code>.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Mengerti, Lanjutkan Game
        </button>
      </div>
    </div>
  );
};
