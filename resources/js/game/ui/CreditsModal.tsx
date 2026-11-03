/**
 * ============================================================================
 * FILE: resources/js/game/ui/CreditsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Penghargaan & Pembuat Game (Credits Screen) bergaya Cozycore Clay-Pixel.
 * ============================================================================
 */

import React from 'react';
import { SoundManager } from '../core/SoundManager';
import { X, Award, Code, Sparkles, Heart, Crown, Layers, Cpu } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  const sound = SoundManager.getInstance();

  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop">
      <div className="clay-panel landscape-compact-modal w-full max-w-md max-h-[92dvh] flex flex-col overflow-hidden text-black">
        {/* Header */}
        <div className="clay-header landscape-compact-header px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
              <Award className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-black truncate">Kredit & Pengembang</h2>
              <p className="text-[10px] sm:text-xs text-black truncate">Kreator di balik RadenWorld</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-neutral w-8 h-8 flex items-center justify-center shrink-0 text-black"
            title="Tutup"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Credits Content */}
        <div className="landscape-compact-body p-4 space-y-3 overflow-y-auto flex-1 min-h-0 text-xs custom-scrollbar">
          {/* Main Creator Highlight */}
          <div className="clay-card-secondary p-4 text-center space-y-1.5">
            <div className="inline-flex p-2 rounded-lg bg-[#FFF8EA] text-black border-2 border-[#5C3A21]">
              <Crown className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-black">Raden</h3>
              <p className="text-black font-bold text-[11px] mt-0.5">
                Kreator Utama, Arsitek Dunia & Game Director
              </p>
            </div>
            <p className="text-[11px] text-black leading-relaxed">
              "Menciptakan dunia 2D open world interaktif yang menghubungkan para petualang di seluruh penjuru."
            </p>
          </div>

          {/* Development Team & Tech Stack */}
          <div className="space-y-2.5">
            <div className="clay-card flex items-start gap-3 p-3">
              <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
                <Code className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-black">Pemrograman & Arsitektur OOP</div>
                <p className="text-[11px] text-black mt-0.5 leading-relaxed">
                  TypeScript murni dengan pola desain Entity-Component, NetworkManager Singleton, dan Event-Driven Bus.
                </p>
              </div>
            </div>

            <div className="clay-card flex items-start gap-3 p-3">
              <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
                <Layers className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-black">2D Game Engines</div>
                <p className="text-[11px] text-black mt-0.5 leading-relaxed">
                  <strong>Phaser 3</strong> (Peta Open World, Kamera Lerp, Fisika) & <strong>PixiJS 8</strong> (WebGL Graphics & Partikel).
                </p>
              </div>
            </div>

            <div className="clay-card flex items-start gap-3 p-3">
              <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
                <Cpu className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-black">Backend & Jaringan Realtime</div>
                <p className="text-[11px] text-black mt-0.5 leading-relaxed">
                  <strong>Laravel 12</strong> (PHP API & Database) dipadukan dengan <strong>Node.js + Socket.io</strong> untuk sinkronisasi posisi dan obrolan global.
                </p>
              </div>
            </div>

            <div className="clay-card flex items-start gap-3 p-3">
              <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-black">Desain Aset & Cozycore UI</div>
                <p className="text-[11px] text-black mt-0.5 leading-relaxed">
                  React 19, Tailwind CSS, Lucide Icons, dan Sprite Pixel/Vektor 2D di folder <span className="clay-badge-secondary px-1.5 py-0.5">public/assets</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Dedication */}
          <div className="clay-card p-3 text-center text-[11px] text-black font-bold flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
            <span>Dibuat dengan dedikasi penuh untuk komunitas gamer Indonesia.</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="px-4 py-3 border-t-2 border-[#5C3A21] bg-[#FFF8EA] shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-primary w-full py-2.5 text-xs font-bold text-black uppercase"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
