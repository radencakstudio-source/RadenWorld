/**
 * ============================================================================
 * FILE: resources/js/game/ui/CreditsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Penghargaan & Pembuat Game (Credits Screen).
 * Menampilkan informasi lengkap pengembang game (Raden), arsitektur teknologi,
 * desainer aset, engine, dan dedikasi komunitas.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-2xl p-4 sm:p-6 text-neutral-100 flex flex-col gap-3 sm:gap-4 relative overflow-hidden max-h-[94dvh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Kredit & Pengembang</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">Siapa di balik pembuatan RadenWorld.</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Credits Content */}
        <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1 text-xs custom-scrollbar">
          {/* Main Creator Highlight */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-amber-500/30 text-center space-y-2">
            <div className="inline-flex p-2.5 rounded-full bg-black text-amber-300 border border-amber-500/40">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Raden</h3>
              <p className="text-amber-400 font-semibold text-xs mt-0.5">
                Kreator Utama, Arsitek Dunia & Game Director
              </p>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed italic">
              "Menciptakan dunia 2D open world interaktif yang menghubungkan para petualang di seluruh penjuru."
            </p>
          </div>

          {/* Development Team & Tech Stack */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0e0e0e] border border-neutral-800">
              <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Pemrograman & Arsitektur OOP</div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  TypeScript murni dengan pola desain Entity-Component, NetworkManager Singleton, dan Event-Driven Bus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0e0e0e] border border-neutral-800">
              <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">2D Game Engines</div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  <strong>Phaser 3</strong> (Peta Open World 3200x3200, Kamera Lerp, Fisika) & <strong>PixiJS 8</strong> (WebGL Ultra-Fast Graphics & Partikel).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0e0e0e] border border-neutral-800">
              <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Backend & Jaringan Realtime</div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  <strong>Laravel 12</strong> (PHP API & Database) dipadukan dengan <strong>Node.js + Socket.io</strong> untuk sinkronisasi posisi 60 FPS dan obrolan global.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0e0e0e] border border-neutral-800">
              <div className="p-2 rounded-lg bg-neutral-900 text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Desain Aset & UI/HUD</div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  React 19, Tailwind CSS, Lucide Icons, dan Sprite Vektor 2D di folder terpisah <code className="text-amber-300">public/assets</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Dedication */}
          <div className="p-3 rounded-xl bg-[#0e0e0e] border border-neutral-800 text-center text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Dibuat dengan dedikasi penuh untuk komunitas gamer Indonesia.</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="border-t border-neutral-800 pt-3 flex justify-end shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
