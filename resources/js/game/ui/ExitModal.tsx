/**
 * ============================================================================
 * FILE: resources/js/game/ui/ExitModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Konfirmasi Keluar Game (Exit Confirmation Dialog).
 * Gaya Visual: Chunky Pastel Pixel (Cozycore UI) & Cute Minimalist Clay-Pixel.
 * ============================================================================
 */

import React, { useState } from 'react';
import { SoundManager } from '../core/SoundManager';
import { LogOut, RefreshCw } from 'lucide-react';

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
    <div className="ui-modal-backdrop font-pixel">
      <div className="w-full max-w-sm clay-panel landscape-compact-modal overflow-hidden text-black flex flex-col max-h-[min(94dvh,calc(100dvh-1rem))]">
        <div className="px-4 py-3 clay-header landscape-compact-header flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 clay-card flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4 text-black" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-black">
            {!hasExited ? 'Keluar dari Permainan?' : 'Sampai Jumpa!'}
          </h2>
        </div>

        <div className="p-4 sm:p-5 text-center space-y-4 overflow-y-auto custom-scrollbar">
          {!hasExited ? (
            <>
              <p className="text-xs text-black leading-relaxed">
                Apakah Anda yakin ingin meninggalkan dunia RadenWorld? Posisi terakhir dan progres petualangan Anda akan tersimpan.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="py-2.5 px-3 clay-btn-secondary text-black text-xs font-bold"
                >
                  Batal (Main)
                </button>

                <button
                  type="button"
                  onClick={handleExit}
                  className="py-2.5 px-3 clay-btn-cocoa text-white text-xs font-bold"
                >
                  Ya, Keluar
                </button>
              </div>
            </>
          ) : (
            <div className="py-3 space-y-3">
              <div className="text-3xl">👋</div>
              <h3 className="text-sm sm:text-base font-bold text-black">
                Sampai Jumpa, Petualang!
              </h3>
              <p className="text-xs text-black">
                Terima kasih telah bermain di RadenWorld. Jendela dapat ditutup sekarang atau muat ulang untuk bermain kembali.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 clay-btn-primary text-black text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
