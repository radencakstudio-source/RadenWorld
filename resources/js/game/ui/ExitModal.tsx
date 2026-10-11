/**
 * ============================================================================
 * FILE: resources/js/game/ui/ExitModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Konfirmasi Keluar Game (Exit Confirmation Dialog).
 * Meminta konfirmasi pemain sebelum meninggalkan petualangan di RadenWorld.
 * ============================================================================
 */

import React, { useState } from 'react';
import { SoundManager } from '../core/SoundManager';
import { X, LogOut, AlertTriangle, RefreshCw } from 'lucide-react';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit?: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose, onConfirmExit }) => {
  const [hasExited, setHasExited] = useState(false);
  const sound = SoundManager.getInstance();

  if (!isOpen) return null;

  const handleExit = () => {
    sound.playClick();
    setHasExited(true);
    if (onConfirmExit) {
      onConfirmExit();
    } else {
      setTimeout(() => {
        window.close();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-black border border-neutral-800 rounded-2xl p-6 text-neutral-100 flex flex-col gap-5 text-center relative overflow-hidden">
        {!hasExited ? (
          <>
            <div className="mx-auto p-3.5 rounded-full bg-neutral-900 border border-neutral-800 text-rose-400 w-fit">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Keluar dari Permainan?</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Apakah Anda yakin ingin meninggalkan dunia RadenWorld? Posisi terakhir dan progres petualangan Anda akan tersimpan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                Batal (Tetap Main)
              </button>

              <button
                type="button"
                onClick={handleExit}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 transition-all cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </>
        ) : (
          <div className="py-6 space-y-3">
            <div className="text-3xl">👋</div>
            <h3 className="text-base font-bold text-white">Sampai Jumpa, Petualang!</h3>
            <p className="text-xs text-neutral-400">
              Terima kasih telah menjelajahi RadenWorld. Jendela dapat Anda tutup sekarang atau muat ulang untuk bermain kembali.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
