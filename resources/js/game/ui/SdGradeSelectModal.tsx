/**
 * ============================================================================
 * FILE: resources/js/game/ui/SdGradeSelectModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Pemilihan Kelas SD (Kelas 1 s.d. Kelas 6) sebelum masuk ke Gedung SD.
 * Menampilkan 6 kartu kelas ceria dengan ringkasan jumlah mata pelajaran yang berbeda.
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { X, Sparkles, ChevronRight, GraduationCap } from 'lucide-react';
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
    cardBg: 'bg-emerald-50/90',
    cardBorder: 'border-emerald-300 hover:border-emerald-400',
    badgeBg: 'bg-emerald-200 text-emerald-900',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
  {
    grade: 2,
    label: 'Kelas 2 SD',
    fase: 'Fase A (Lanjutan)',
    emoji: '🎨',
    tagline: 'Membaca Lancar, Berhitung Ceria & English Fun',
    subjectCountText: '6 Mata Pelajaran',
    subjectsSummary: 'MTK • PAI • Pancasila • B. Inggris • B. Arab • B. Jawa',
    cardBg: 'bg-sky-50/90',
    cardBorder: 'border-sky-300 hover:border-sky-400',
    badgeBg: 'bg-sky-200 text-sky-900',
    btnBg: 'bg-sky-500 hover:bg-sky-600 text-white',
  },
  {
    grade: 3,
    label: 'Kelas 3 SD',
    fase: 'Fase B (Mulai Sains)',
    emoji: '🌿',
    tagline: 'Mulai Belajar IPAS Alam, Perkalian & Percakapan',
    subjectCountText: '7 Mata Pelajaran',
    subjectsSummary: 'IPAS • MTK • PAI • Pancasila • B. Inggris • B. Jawa • B. Arab',
    cardBg: 'bg-amber-50/90',
    cardBorder: 'border-amber-300 hover:border-amber-400',
    badgeBg: 'bg-amber-200 text-amber-900',
    btnBg: 'bg-amber-500 hover:bg-amber-600 text-neutral-900',
  },
  {
    grade: 4,
    label: 'Kelas 4 SD',
    fase: 'Fase B (Eksplorasi)',
    emoji: '🔬',
    tagline: 'Eksplorasi Sains Alam & Kewarganegaraan NKRI',
    subjectCountText: '8 Mata Pelajaran',
    subjectsSummary: 'IPAS • MTK • PKn • Pancasila • PAI • B. Inggris • B. Arab • B. Jawa',
    cardBg: 'bg-lime-50/90',
    cardBorder: 'border-lime-300 hover:border-lime-400',
    badgeBg: 'bg-lime-200 text-lime-900',
    btnBg: 'bg-lime-500 hover:bg-lime-600 text-neutral-900',
  },
  {
    grade: 5,
    label: 'Kelas 5 SD',
    fase: 'Fase C (Logika)',
    emoji: '📚',
    tagline: 'Pendalaman Materi, Logika Matematika & Tata Krama',
    subjectCountText: '8 Mata Pelajaran',
    subjectsSummary: 'MTK • IPAS • PKn • Pancasila • B. Inggris • PAI • B. Arab • B. Jawa',
    cardBg: 'bg-indigo-50/90',
    cardBorder: 'border-indigo-300 hover:border-indigo-400',
    badgeBg: 'bg-indigo-200 text-indigo-900',
    btnBg: 'bg-indigo-500 hover:bg-indigo-600 text-white',
  },
  {
    grade: 6,
    label: 'Kelas 6 SD',
    fase: 'Fase C (Kelulusan)',
    emoji: '🎓',
    tagline: 'Pemantapan Seluruh Mapel & Persiapan Ujian Sekolah',
    subjectCountText: '8 Mata Pelajaran Lengkap',
    subjectsSummary: 'MTK • IPAS • PKn • Pancasila • B. Inggris • PAI • B. Arab • B. Jawa',
    cardBg: 'bg-rose-50/90',
    cardBorder: 'border-rose-300 hover:border-rose-400',
    badgeBg: 'bg-rose-200 text-rose-900',
    btnBg: 'bg-rose-500 hover:bg-rose-600 text-white',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 font-cute animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-amber-50 via-white to-orange-50 border-4 border-amber-300 rounded-[32px] shadow-2xl shadow-amber-950/20 flex flex-col max-h-[92vh] overflow-hidden text-neutral-800 relative">
        
        {/* Header Ceria */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-200 border-b-2 border-amber-300 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-amber-400 shadow-md flex items-center justify-center text-2xl shrink-0 -rotate-3">
              🏫
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 tracking-wide flex items-center gap-1.5">
                Pilih Kelas SD
              </h2>
              <p className="text-xs sm:text-sm text-amber-800/90 font-medium mt-0.5">
                Tiap kelas punya mata pelajaran yang berbeda-beda lho! Yuk pilih kelasmu:
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-rose-100 border-2 border-amber-300 hover:border-rose-400 text-neutral-600 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid 6 Kelas Ceria */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SD_GRADE_OPTIONS.map((item) => (
              <div
                key={item.grade}
                onClick={() => handleChoose(item.grade)}
                className={`group p-4 rounded-2xl border-2 ${item.cardBorder} ${item.cardBg} hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {item.emoji}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${item.badgeBg}`}>
                      {item.fase}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-amber-800 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs text-neutral-600 font-medium line-clamp-1 mt-0.5">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-neutral-500 block">
                      📋 {item.subjectCountText}:
                    </span>
                    <span className="text-[11px] text-neutral-700 font-medium block truncate">
                      {item.subjectsSummary}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    Masuk Kelas ➔
                  </span>
                  <button
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${item.btnBg}`}
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
        <div className="px-5 py-3 border-t border-amber-200/80 bg-amber-100/50 flex items-center justify-between text-xs text-amber-900 font-medium shrink-0">
          <span>Kamu bisa mengganti kelas kapan saja di dalam gedung kelas.</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-xl bg-white hover:bg-neutral-100 border border-amber-300 text-neutral-700 font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
