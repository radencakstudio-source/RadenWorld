/**
 * ============================================================================
 * FILE: resources/js/game/ui/ControlGuide.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Petunjuk Kontrol Interaktif Real-Time untuk PC & Mobile.
 * - Untuk Mode PC: Mengikuti secara dinamis pemetaan tombol dari KeybindingManager.
 *   Jika pemain mengubah tombol di menu Pengaturan (SettingsModal), petunjuk di
 *   modal ini otomatis menyesuaikan secara seketika (real-time reactive).
 * - Dilengkapi tombol pintas langsung ke menu Pengaturan untuk mempermudah rebind.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Keyboard,
  MousePointer,
  MessageSquare,
  ArrowUp,
  Fish,
  Backpack,
  Zap,
  Map,
  Smile,
  ZoomIn,
  Settings,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { KeybindingManager } from '../core/KeybindingManager';
import { EventBus } from '../core/EventBus';

interface ControlGuideProps {
  isOpen: boolean;
  onClose: () => void;
  controlMode?: 'pc' | 'mobile';
  onOpenSettings?: () => void;
}

export const ControlGuide: React.FC<ControlGuideProps> = ({
  isOpen,
  onClose,
  controlMode = 'pc',
  onOpenSettings,
}) => {
  const isMobile = controlMode === 'mobile';
  const sound = SoundManager.getInstance();

  // Sinkronisasi tombol dinamis dari KeybindingManager
  const [keys, setKeys] = useState<Record<string, string>>(() =>
    KeybindingManager.getInstance().getAllKeybindings()
  );

  useEffect(() => {
    // Sinkronisasi awal saat modal dibuka
    if (isOpen) {
      setKeys(KeybindingManager.getInstance().getAllKeybindings());
    }

    const handleKeysUpdated = (updated: Record<string, string>) => {
      setKeys(updated);
    };

    EventBus.on('keybindings-updated', handleKeysUpdated);
    return () => {
      EventBus.off('keybindings-updated', handleKeysUpdated);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const kbdClass =
    'clay-badge-secondary px-1.5 py-0.5 text-[10px] font-bold text-black inline-block mx-0.5 uppercase';

  // Format label tombol yang nyaman dibaca
  const formatKeyName = (keyName?: string, defaultVal: string = '') => {
    const k = keyName || defaultVal;
    if (k.toLowerCase() === 'space') return 'Spasi';
    if (k.toLowerCase() === 'arrowup') return '↑';
    if (k.toLowerCase() === 'arrowdown') return '↓';
    if (k.toLowerCase() === 'arrowleft') return '←';
    if (k.toLowerCase() === 'arrowright') return '→';
    return k;
  };

  return (
    <div className="ui-modal-backdrop pointer-events-auto font-pixel">
      <div className="clay-panel landscape-compact-modal w-full max-w-lg max-h-[92dvh] flex flex-col overflow-hidden text-black">
        {/* Header Modal */}
        <div className="clay-header landscape-compact-header px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-black font-bold text-sm sm:text-base min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <Keyboard className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="truncate">
              Petunjuk Kontrol ({isMobile ? 'Mobile' : 'PC Dinamis'})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenSettings();
                }}
                className="clay-btn-secondary px-2.5 py-1 text-[10.5px] font-bold text-black flex items-center gap-1 shrink-0"
                title="Buka Pengaturan Kontrol untuk Rebind Tombol"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ubah Tombol</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-neutral w-8 h-8 flex items-center justify-center shrink-0 text-black"
              title="Tutup Petunjuk (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Isi Daftar Kontrol */}
        <div className="landscape-compact-body p-4 space-y-2.5 text-xs text-black overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {/* 1. Navigasi / Pergerakan */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <Keyboard className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">
                Navigasi / Pergerakan Karakter
              </div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>
                    Gunakan <strong>Analog Joystick Sentuh 360°</strong> di kiri bawah atau ketuk lantai langsung untuk berjalan ke titik tujuan.
                  </>
                ) : (
                  <>
                    Gunakan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.moveUp, 'W')}</kbd>
                    <kbd className={kbdClass}>{formatKeyName(keys.moveLeft, 'A')}</kbd>
                    <kbd className={kbdClass}>{formatKeyName(keys.moveDown, 'S')}</kbd>
                    <kbd className={kbdClass}>{formatKeyName(keys.moveRight, 'D')}</kbd>{' '}
                    atau tombol <kbd className={kbdClass}>Panah</kbd> untuk berjalan.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 2. Lari Cepat (Sprint) */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <Zap className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">
                Lari Cepat (Sprint)
              </div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>
                    Sentuh tombol <strong>[LARI]</strong> di kanan bawah untuk mengaktifkan sprint cepat (1.6x kecepatan jalan normal).
                  </>
                ) : (
                  <>
                    Tahan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.sprint, 'Shift')}</kbd>{' '}
                    sambil menekan tombol arah untuk berlari kencang!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 3. Interaksi Objek & Masuk Pintu */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <MousePointer className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">
                Interaksi Objek, NPC & Pintu
              </div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>
                    Dekati objek/NPC lalu sentuh tombol <strong>[AKSI]</strong> di kanan bawah layar untuk berdialog atau masuk ruangan.
                  </>
                ) : (
                  <>
                    Dekati objek/NPC lalu tekan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.interact, 'E')}</kbd>{' '}
                    atau klik objek secara langsung menggunakan kursor mouse.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 4. Memancing */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <Fish className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">
                Memancing Ikan (Di Perairan)
              </div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>
                    Hadapkan karakter ke arah air (Dermaga, Tepi Laut, Pantai), lalu sentuh tombol <strong>[MANCING]</strong>. Ketuk banner saat <strong>(!)</strong> muncul.
                  </>
                ) : (
                  <>
                    Hadapkan karakter ke arah perairan lalu tekan{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.fish, 'F')}</kbd>. Ketuk spasi atau klik saat muncul tanda seru <strong>(!)</strong> untuk menarik ikan!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 5. Lompat 2.5D */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">Lompat 2.5D</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>
                    Sentuh tombol <strong>[LOMPAT]</strong> di kanan bawah untuk melompati rintangan kecil atau genangan air.
                  </>
                ) : (
                  <>
                    Tekan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.jump, 'Space')}</kbd>{' '}
                    untuk melompat dengan indikator pendaratan realtime.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 6. Tas Inventaris & Hotbar */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <Backpack className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">
                Tas Inventaris & Mini Hotbar
              </div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>
                    Sentuh tombol <strong>[Tas]</strong> pada Mini Hotbar di tengah bawah layar untuk membuka ransel 30 slot perlengkapan.
                  </>
                ) : (
                  <>
                    Tekan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.backpack, 'B')}</kbd>{' '}
                    untuk membuka Tas 30 Slot. Gunakan angka{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.hotbar1, '1')}</kbd>–
                    <kbd className={kbdClass}>{formatKeyName(keys.hotbar6, '6')}</kbd>{' '}
                    untuk memilih slot peralatan di Mini Hotbar.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 7. Peta Atlas Dunia */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <Map className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">Peta Atlas Dunia (Full Map)</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Sentuh minimap di kanan atas untuk membuka peta atlas 80×80 petak.</>
                ) : (
                  <>
                    Tekan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.map, 'M')}</kbd>{' '}
                    untuk membuka peta atlas penuh dan memasang pin penunjuk jalan.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 8. Chat Multiplayer */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">
                Multiplayer Real-Time Chat
              </div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>
                    Sentuh ikon <strong>Chat</strong> di kiri atas layar untuk membuka obrolan global.
                  </>
                ) : (
                  <>
                    Tekan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.chat, '/')}</kbd>{' '}
                    atau <kbd className={kbdClass}>Enter</kbd> untuk membuka input pesan obrolan.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 9. Menu Emote & Reaksi */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <Smile className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">Menu Emote & Reaksi</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Sentuh ikon emote pada panel sosial untuk memilih reaksi karakter.</>
                ) : (
                  <>
                    Tekan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.emote, 'T')}</kbd>{' '}
                    untuk membuka pilihan animasi tarian dan ekspresi emotikon.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 10. Kamera Zoom In / Out */}
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <ZoomIn className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-black mb-0.5">Kamera Zoom In / Out</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Gunakan gestur cubit layar (pinch-to-zoom) untuk mengatur jarak kamera.</>
                ) : (
                  <>
                    Tekan tombol{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.zoomIn, '+')}</kbd> /{' '}
                    <kbd className={kbdClass}>{formatKeyName(keys.zoomOut, '-')}</kbd>{' '}
                    atau putar roda mouse (scroll wheel) untuk mendekatkan dan menjauhkan kamera.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-4 py-3 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center justify-between gap-2 shrink-0">
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenSettings();
              }}
              className="clay-btn-secondary px-3 py-2 text-black font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>Atur Tombol di Pengaturan</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-primary flex-1 py-2 text-black font-bold text-xs uppercase"
          >
            Mengerti, Lanjutkan Game
          </button>
        </div>
      </div>
    </div>
  );
};
