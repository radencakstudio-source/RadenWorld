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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 relative overflow-hidden max-h-[90vh]">
        {/* Glow Accent */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Kredit & Pengembang</h2>
              <p className="text-xs text-slate-400">Siapa di balik pembuatan RadenWorld.</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Credits Content */}
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1 text-xs custom-scrollbar">
          {/* Main Creator Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-slate-800 to-slate-900 border border-amber-500/40 text-center space-y-2 shadow-lg">
            <div className="inline-flex p-2.5 rounded-full bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Raden</h3>
              <p className="text-amber-400 font-semibold text-xs mt-0.5">
                Kreator Utama, Arsitek Dunia & Game Director
              </p>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed italic">
              "Menciptakan dunia 2D open world interaktif yang menghubungkan para petualang di seluruh penjuru."
            </p>
          </div>

          {/* Development Team & Tech Stack */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Pemrograman & Arsitektur OOP</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  TypeScript murni dengan pola desain Entity-Component, NetworkManager Singleton, dan Event-Driven Bus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">2D Game Engines</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <strong>Phaser 3</strong> (Peta Open World 3200x3200, Kamera Lerp, Fisika) & <strong>PixiJS 8</strong> (WebGL Ultra-Fast Graphics & Partikel).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Backend & Jaringan Realtime</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <strong>Laravel 12</strong> (PHP API & Database) dipadukan dengan <strong>Node.js + Socket.io</strong> untuk sinkronisasi posisi 60 FPS dan obrolan global.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Desain Aset & UI/HUD</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  React 19, Tailwind CSS, Lucide Icons, dan Sprite Vektor 2D di folder terpisah <code className="text-cyan-300">public/assets</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Dedication */}
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Dibuat dengan dedikasi penuh untuk komunitas gamer Indonesia.</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
