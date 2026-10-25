/**
 * ============================================================================
 * FILE: resources/js/game/ui/DownloadModal.tsx
 * ============================================================================
 * Modal Unduhan Client Game RadenWorld:
 * 1. Android APK Mobile Client (v1.02.00)
 * 2. Windows PC Launcher
 * 3. WebGL Browser Direct Play
 * ============================================================================
 */

import React from 'react';
import { X, Download, Smartphone, Monitor, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const sound = SoundManager.getInstance();

  const handleDownload = (platform: string) => {
    sound.playClick();
    alert(`Mengunduh Client RadenWorld untuk ${platform}...\nVersi: v1.02.00 (Powered by RadencakStudio)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-4 sm:p-6 text-neutral-100 flex flex-col gap-3 sm:gap-4 shadow-2xl max-h-[94dvh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-black tracking-wide text-white font-['Chakra_Petch']">
                UNDUH RADENWORLD
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Pilih platform perangkat Anda untuk pengalaman bermain maksimal
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Download Options */}
        <div className="space-y-3">
          {/* 1. Android APK */}
          <div className="p-4 rounded-xl bg-[#141414] border border-orange-500/50 hover:border-orange-500 transition-all flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Android APK Mobile</span>
                  <span className="text-[10px] bg-orange-500 text-black font-extrabold px-1.5 py-0.5 rounded">
                    POPULER
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Versi 1.02.00 • Ukuran: ~45 MB • Android 8.0+
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload('Android APK')}
              className="px-4 py-2 bg-gradient-to-b from-[#ff7e29] to-[#ea580c] hover:brightness-110 text-black font-black text-xs rounded-xl border border-black shadow flex items-center gap-1.5 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>UNDUH</span>
            </button>
          </div>

          {/* 2. Windows PC */}
          <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800 hover:border-orange-500/60 transition-all flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Windows PC Launcher</span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 font-bold px-1.5 py-0.5 rounded">
                    60 FPS HD
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Versi 1.02.00 • Ukuran: ~68 MB • Windows 10/11
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload('Windows PC')}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-400 text-neutral-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>UNDUH</span>
            </button>
          </div>

          {/* 3. WebGL Direct Play */}
          <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Direct WebGL Browser</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> AKTIF
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Main langsung di browser tanpa instalasi tambahan
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl border border-neutral-700 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              MAIN SEKARANG
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Aman & Bebas Malware
          </span>
          <span>© 2026 RadencakStudio</span>
        </div>
      </div>
    </div>
  );
};
