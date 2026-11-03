import React from 'react';
import { X, Keyboard, MousePointer, MessageSquare, Code2, ArrowUp, Fish, Backpack, Zap } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

interface ControlGuideProps {
  isOpen: boolean;
  onClose: () => void;
  controlMode?: 'pc' | 'mobile';
}

export const ControlGuide: React.FC<ControlGuideProps> = ({ isOpen, onClose, controlMode = 'pc' }) => {
  if (!isOpen) return null;

  const isMobile = controlMode === 'mobile';
  const sound = SoundManager.getInstance();

  const kbdClass = 'clay-badge-secondary px-1.5 py-0.5 text-[10px] font-bold text-black inline-block mx-0.5';

  return (
    <div className="ui-modal-backdrop pointer-events-auto">
      <div className="clay-panel landscape-compact-modal w-full max-w-md max-h-[92dvh] flex flex-col overflow-hidden text-black">
        {/* Header */}
        <div className="clay-header landscape-compact-header px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-black font-bold text-sm sm:text-base min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <Keyboard className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="truncate">Petunjuk Kontrol ({isMobile ? 'Mobile' : 'PC'})</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-neutral w-8 h-8 flex items-center justify-center shrink-0 text-black"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="landscape-compact-body p-4 space-y-2.5 text-xs text-black overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <Keyboard className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Navigasi / Pergerakan Karakter</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Gunakan <strong>Analog Joystick Sentuh 360°</strong> di kiri bawah atau ketuk lantai langsung untuk berjalan ke titik tujuan.</>
                ) : (
                  <>Gunakan tombol <kbd className={kbdClass}>W</kbd><kbd className={kbdClass}>A</kbd><kbd className={kbdClass}>S</kbd><kbd className={kbdClass}>D</kbd> atau tombol <kbd className={kbdClass}>Panah</kbd> untuk berjalan.</>
                )}
              </p>
            </div>
          </div>

          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <Zap className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Lari Cepat (Sprint)</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Sentuh tombol <strong>[LARI]</strong> di kanan bawah untuk mengaktifkan sprint cepat (1.6x kecepatan jalan normal).</>
                ) : (
                  <>Tahan tombol <kbd className={kbdClass}>Shift</kbd> sambil menekan tombol arah untuk berlari kencang!</>
                )}
              </p>
            </div>
          </div>

          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <MousePointer className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Interaksi Objek & NPC</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Dekati objek/NPC lalu sentuh tombol <strong>[AKSI]</strong> di kanan bawah layar untuk berdialog atau masuk ruangan.</>
                ) : (
                  <>Dekati objek/NPC lalu tekan tombol <kbd className={kbdClass}>E</kbd> atau klik objek secara langsung.</>
                )}
              </p>
            </div>
          </div>

          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <Fish className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Memancing (Hanya di Perairan)</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Hadapkan karakter ke arah air (Dermaga, Tepi Laut, atau Pantai Selatan), lalu sentuh tombol <strong>[MANCING]</strong>. Ketuk banner saat <strong>(!)</strong> muncul untuk strike.</>
                ) : (
                  <>Hadapkan karakter ke arah perairan lalu tekan <kbd className={kbdClass}>F</kbd>. Hanya tersedia di Dermaga, Tepi Laut Timur, atau Pantai Selatan.</>
                )}
              </p>
            </div>
          </div>

          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Lompat 2.5D</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Sentuh tombol <strong>[LOMPAT]</strong> di kanan bawah untuk melompat melewati rintangan kecil.</>
                ) : (
                  <>Tekan tombol <kbd className={kbdClass}>Spasi</kbd> untuk melompat dengan indikator titik pendaratan realtime.</>
                )}
              </p>
            </div>
          </div>

          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <Backpack className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Tas Inventaris & Mini Hotbar</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Sentuh tombol <strong>[Tas]</strong> pada Mini Hotbar di tengah bawah layar untuk membuka tas 30 slot, memakai item, dan memindah slot.</>
                ) : (
                  <>Tekan <kbd className={kbdClass}>B</kbd> untuk membuka Tas 30 Slot. Gunakan angka <kbd className={kbdClass}>1</kbd>–<kbd className={kbdClass}>6</kbd> untuk memilih slot di Mini Hotbar.</>
                )}
              </p>
            </div>
          </div>

          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Multiplayer Real-Time Chat</div>
              <p className="text-black leading-relaxed text-[11px]">
                {isMobile ? (
                  <>Sentuh tombol <strong>Chat</strong> di kiri atas layar untuk membuka pesan obrolan global & bisikan pribadi.</>
                ) : (
                  <>Tekan <kbd className={kbdClass}>Enter</kbd> atau tombol Chat di kiri atas untuk membuka input obrolan.</>
                )}
              </p>
            </div>
          </div>

          <div className="clay-card flex items-start gap-3 p-3">
            <div className="p-2 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
              <Code2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-black mb-0.5">Arsitektur Game OOP</div>
              <p className="text-black leading-relaxed text-[11px]">
                Dibangun dengan TypeScript OOP: Base class <span className={kbdClass}>Entity</span>, <span className={kbdClass}>Player</span>, <span className={kbdClass}>RemotePlayer</span>, dan <span className={kbdClass}>NetworkManager</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t-2 border-[#5C3A21] bg-[#FFF8EA] shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-primary w-full py-2.5 text-black font-bold text-xs uppercase"
          >
            Mengerti, Lanjutkan Game
          </button>
        </div>
      </div>
    </div>
  );
};
