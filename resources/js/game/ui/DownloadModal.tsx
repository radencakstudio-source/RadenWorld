/**
 * ============================================================================
 * FILE: resources/js/game/ui/DownloadModal.tsx
 * ============================================================================
 * Modal Unduhan Client Game RadenWorld (Cozycore Clay-Pixel):
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
    <div className="ui-modal-backdrop select-none">
      <div className="clay-panel landscape-compact-modal w-full max-w-lg max-h-[92dvh] flex flex-col overflow-hidden text-black">
        {/* Header */}
        <div className="clay-header landscape-compact-header px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-black truncate">
                UNDUH RADENWORLD
              </h2>
              <p className="text-[10px] sm:text-xs text-black truncate">
                Pilih platform perangkat untuk bermain maksimal
              </p>
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

        {/* Platform Download Options */}
        <div className="landscape-compact-body p-4 space-y-3 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {/* 1. Android APK */}
          <div className="clay-card p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-black text-xs sm:text-sm">Android APK Mobile</span>
                  <span className="clay-badge-primary text-[10px] font-bold px-1.5 py-0.5">
                    POPULER
                  </span>
                </div>
                <p className="text-[11px] text-black mt-0.5">
                  Versi 1.02.00 • ~45 MB • Android 8.0+
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDownload('Android APK')}
              className="clay-btn-primary px-3.5 py-2 text-black font-bold text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>UNDUH</span>
            </button>
          </div>

          {/* 2. Windows PC */}
          <div className="clay-card p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                <Monitor className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-black text-xs sm:text-sm">Windows PC Launcher</span>
                  <span className="clay-badge-secondary text-[10px] font-bold px-1.5 py-0.5">
                    60 FPS HD
                  </span>
                </div>
                <p className="text-[11px] text-black mt-0.5">
                  Versi 1.02.00 • ~68 MB • Windows 10/11
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDownload('Windows PC')}
              className="clay-btn-primary px-3.5 py-2 text-black font-bold text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>UNDUH</span>
            </button>
          </div>

          {/* 3. WebGL Direct Play */}
          <div className="clay-card p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                <Globe className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-black text-xs sm:text-sm">Direct WebGL Browser</span>
                  <span className="clay-badge-secondary text-[10px] font-bold px-1.5 py-0.5 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> AKTIF
                  </span>
                </div>
                <p className="text-[11px] text-black mt-0.5">
                  Main langsung di browser tanpa instalasi tambahan
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-secondary px-3.5 py-2 text-black font-bold text-xs w-full sm:w-auto shrink-0"
            >
              MAIN SEKARANG
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t-2 border-[#5C3A21] bg-[#FFF8EA] text-[10px] sm:text-xs text-black font-bold flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Terverifikasi Aman & Bebas Malware
          </span>
          <span>© 2026 RadencakStudio</span>
        </div>
      </div>
    </div>
  );
};
