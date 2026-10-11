import React from 'react';
import { X, Keyboard, MousePointer, MessageSquare, Box, Code2 } from 'lucide-react';

interface ControlGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlGuide: React.FC<ControlGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 pointer-events-auto">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-2xl p-6 text-neutral-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <Keyboard className="w-5 h-5" />
            <span>Petunjuk Kontrol & Sistem RadenWorld</span>
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
                Gunakan tombol <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">W</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">A</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">S</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">D</kbd> atau tombol <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">Panah (Arrow Keys)</kbd> untuk menjelajahi peta open world.
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
                Klik mouse pada NPC <strong>Sage Raden</strong> di plaza atau <strong>Peti Harta (Chests)</strong> yang tersebar di peta untuk berinteraksi.
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
                Tekan <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-200 font-mono">Enter</kbd> untuk membuka input obrolan. Pesan akan otomatis muncul sebagai speech bubble di atas karakter dan di jendela chat semua pemain.
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
