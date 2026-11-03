/**
 * ============================================================================
 * FILE: resources/js/game/ui/SdGradeSelectModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Pemilihan Kelas SD (Kelas 1 s.d. Kelas 6) sebelum masuk ke Gedung SD.
 * Gaya Visual: Chunky Pastel Pixel (Cozycore UI) & Cute Minimalist Clay-Pixel.
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

export interface ISdGradeOption {
  grade: number;
  label: string;
  fase: string;
  emoji: string;
  tagline: string;
  subjectCountText: string;
  subjectsSummary: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  btnBg: string;
}

export const SD_GRADE_OPTIONS: ISdGradeOption[] = [
  {
    grade: 1,
    label: 'Kelas 1 SD',
    fase: 'Fase A (Awal)',
    emoji: '🎒',
    tagline: 'Dasar Angka, Huruf Hijaiyah & Budi Pekerti',
    subjectCountText: '5 Mata Pelajaran',
    subjectsSummary: 'MTK • PAI • Pancasila • B. Arab • B. Jawa',
    cardBg: 'clay-card',
    cardBorder: 'border-[#5C3A21]',
    badgeBg: 'clay-badge-secondary text-black',
    btnBg: 'clay-btn-primary text-black',
  },
  {
    grade: 2,
    label: 'Kelas 2 SD',
    fase: 'Fase A (Lanjutan)',
    emoji: '🎨',
    tagline: 'Membaca Lancar, Berhitung Ceria & English Fun',
    subjectCountText: '6 Mata Pelajaran',
    subjectsSummary: 'MTK • PAI • Pancasila • B. Inggris • B. Arab • B. Jawa',
    cardBg: 'clay-card',
    cardBorder: 'border-[#5C3A21]',
    badgeBg: 'clay-badge-secondary text-black',
    btnBg: 'clay-btn-primary text-black',
  },
  {
    grade: 3,
    label: 'Kelas 3 SD',
    fase: 'Fase B (Mulai Sains)',
    emoji: '🌿',
    tagline: 'Mulai Belajar IPAS Alam, Perkalian & Percakapan',
    subjectCountText: '7 Mata Pelajaran',
    subjectsSummary: 'IPAS • MTK • PAI • Pancasila • B. Inggris • B. Jawa • B. Arab',
    cardBg: 'clay-card',
    cardBorder: 'border-[#5C3A21]',
    badgeBg: 'clay-badge-secondary text-black',
    btnBg: 'clay-btn-primary text-black',
  },
  {
    grade: 4,
    label: 'Kelas 4 SD',
    fase: 'Fase B (Eksplorasi)',
    emoji: '🔬',
    tagline: 'Eksplorasi Sains Alam & Kewarganegaraan NKRI',
    subjectCountText: '8 Mata Pelajaran',
    subjectsSummary: 'IPAS • MTK • PKn • Pancasila • PAI • B. Inggris • B. Arab • B. Jawa',
    cardBg: 'clay-card',
    cardBorder: 'border-[#5C3A21]',
    badgeBg: 'clay-badge-secondary text-black',
    btnBg: 'clay-btn-primary text-black',
  },
  {
    grade: 5,
    label: 'Kelas 5 SD',
    fase: 'Fase C (Logika)',
    emoji: '📚',
    tagline: 'Pendalaman Materi, Logika Matematika & Tata Krama',
    subjectCountText: '8 Mata Pelajaran',
    subjectsSummary: 'MTK • IPAS • PKn • Pancasila • B. Inggris • PAI • B. Arab • B. Jawa',
    cardBg: 'clay-card',
    cardBorder: 'border-[#5C3A21]',
    badgeBg: 'clay-badge-secondary text-black',
    btnBg: 'clay-btn-primary text-black',
  },
  {
    grade: 6,
    label: 'Kelas 6 SD',
    fase: 'Fase C (Kelulusan)',
    emoji: '🎓',
    tagline: 'Pemantapan Seluruh Mapel & Persiapan Ujian Sekolah',
    subjectCountText: '8 Mata Pelajaran Lengkap',
    subjectsSummary: 'MTK • IPAS • PKn • Pancasila • B. Inggris • PAI • B. Arab • B. Jawa',
    cardBg: 'clay-card',
    cardBorder: 'border-[#5C3A21]',
    badgeBg: 'clay-badge-secondary text-black',
    btnBg: 'clay-btn-primary text-black',
  },
];

interface SdGradeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGrade: (grade: number) => void;
}

export const SdGradeSelectModal: React.FC<SdGradeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectGrade,
}) => {
  const sound = SoundManager.getInstance();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, sound]);

  if (!isOpen) return null;

  const handleChoose = (grade: number) => {
    sound.playSuccess();
    onSelectGrade(grade);
  };

  return (
    <div className="ui-modal-backdrop font-pixel">
      <div className="w-full max-w-2xl clay-panel landscape-compact-modal flex flex-col max-h-[min(94dvh,calc(100dvh-1rem))] overflow-hidden text-black relative">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 clay-header landscape-compact-header flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 clay-card flex items-center justify-center text-xl shrink-0">
              🏫
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-black tracking-wide">
                Pilih Kelas SD
              </h2>
              <p className="text-xs text-black truncate">
                Tiap kelas punya mata pelajaran berbeda. Yuk pilih kelasmu:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 clay-btn-cocoa text-white flex items-center justify-center shrink-0"
            title="Tutup (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid 6 Kelas */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar landscape-compact-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-3">
            {SD_GRADE_OPTIONS.map((item) => (
              <div
                key={item.grade}
                onClick={() => handleChoose(item.grade)}
                className="p-3.5 clay-card cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-9 h-9 clay-badge-neutral flex items-center justify-center text-xl">
                      {item.emoji}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 clay-badge-secondary text-black">
                      {item.fase}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-black">
                      {item.label}
                    </h3>
                    <p className="text-xs text-black line-clamp-1 mt-0.5">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-black block">
                      📋 {item.subjectCountText}:
                    </span>
                    <span className="text-[11px] text-black block truncate">
                      {item.subjectsSummary}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t-2 border-[#5C3A21] flex items-center justify-between">
                  <span className="text-xs font-bold text-black">Masuk Kelas ➔</span>
                  <button
                    type="button"
                    className="px-3 py-1 clay-btn-primary text-black text-xs font-bold flex items-center gap-1"
                  >
                    <span>Pilih</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center justify-between gap-2 text-xs text-black shrink-0">
          <span>Kamu bisa mengganti kelas kapan saja di dalam gedung kelas.</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-3.5 py-1.5 clay-btn-neutral text-black font-bold text-xs shrink-0"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
