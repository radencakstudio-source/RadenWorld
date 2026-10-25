/**
 * ============================================================================
 * FILE: resources/js/game/ui/SchoolGradeSelectModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Pemilihan Kelas sebelum masuk ke Gedung Sekolah (SD, SMP, atau SMA).
 * 
 * KARAKTERISTIK DESAIN:
 * 1. Simpel, Elegan, Ceria & Nyaman Dilihat (Tanpa warna norak / alay).
 * 2. Border tegas, presisi, dan solid (border-2 border-neutral-800 / border-neutral-300).
 * 3. Layout Khusus SMP & SMA: Karena jumlah kelas sedikit (3 kelas),
 *    tampilannya didesain khusus menjadi 3 Showcase Card yang luas, proporsional,
 *    dan memuat preview 8 mata pelajaran langsung di dalam kartu (tidak kosong/lowong).
 * 4. Layout SD (6 Kelas): Grid 3x2 rapi dengan preview ringkas mapel unggulan.
 * 5. Ikon Informasi (ℹ️ Detail & Kuis) untuk pop-up materi, kuis, dan fakta seru.
 * 6. Isolasi Multiplayer: Setiap kelas memiliki WebSocket room terpisah
 *    (school-{type}-grade-{grade}), pemain di kelas yang sama otomatis bertemu.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, Info, BookOpen, Sparkles, Users, Award } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { SD_CURRICULUM_DATA, ISdSubjectItem } from './SdSubjectsModal';
import { SMP_CURRICULUM_DATA, SMA_CURRICULUM_DATA, ISchoolSubjectItem } from './SchoolSubjectsModal';

export interface IGradeOptionItem {
  grade: number;
  label: string;
  tingkatBadge: string;
  officialLevel: string;
  fase: string;
  emoji: string;
  tagline: string;
  subjectCountText: string;
}

export interface ISchoolThemeConfig {
  schoolTitle: string;
  schoolEmoji: string;
  schoolSubtitle: string;
  headerBg: string;
  headerBorder: string;
  headerTextColor: string;
  accentBtn: string;
  accentBorder: string;
  cardBorderHover: string;
  badgeBg: string;
  badgeText: string;
  scrollbarClass: string;
  options: IGradeOptionItem[];
}

export const SCHOOL_THEMES_CONFIG: Record<'sd' | 'smp' | 'sma', ISchoolThemeConfig> = {
  // ==========================================================
  // SD (KELAS 1 - 6) - TEMA HANGAT CERIA (WARM AMBER / GOLD)
  // ==========================================================
  sd: {
    schoolTitle: 'Sekolah Dasar (SD)',
    schoolEmoji: '🎒',
    schoolSubtitle: 'Pilih tingkatan kelas SD untuk masuk ke ruang kelas belajar',
    headerBg: 'bg-amber-100',
    headerBorder: 'border-amber-300',
    headerTextColor: 'text-amber-950',
    accentBtn: 'bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-600',
    accentBorder: 'border-amber-400',
    cardBorderHover: 'hover:border-amber-500 hover:bg-amber-50/40',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900 border border-amber-300',
    scrollbarClass: 'school-scrollbar-amber',
    options: [
      {
        grade: 1,
        label: 'Kelas 1 SD',
        tingkatBadge: 'TINGKAT I',
        officialLevel: 'Kelas 1',
        fase: 'Fase A',
        emoji: '🐣',
        tagline: 'Dasar angka berhitung, huruf hijaiyah, dan budi pekerti ceria',
        subjectCountText: '5 Mata Pelajaran',
      },
      {
        grade: 2,
        label: 'Kelas 2 SD',
        tingkatBadge: 'TINGKAT II',
        officialLevel: 'Kelas 2',
        fase: 'Fase A',
        emoji: '🎨',
        tagline: 'Membaca lancar, berhitung ceria, dan percakapan dasar',
        subjectCountText: '6 Mata Pelajaran',
      },
      {
        grade: 3,
        label: 'Kelas 3 SD',
        tingkatBadge: 'TINGKAT III',
        officialLevel: 'Kelas 3',
        fase: 'Fase B',
        emoji: '🌿',
        tagline: 'Mulai belajar sains IPAS alam, perkalian, dan tata krama sopan',
        subjectCountText: '7 Mata Pelajaran',
      },
      {
        grade: 4,
        label: 'Kelas 4 SD',
        tingkatBadge: 'TINGKAT IV',
        officialLevel: 'Kelas 4',
        fase: 'Fase B',
        emoji: '🔬',
        tagline: 'Eksplorasi sains alam, nilai Pancasila, dan bahasa daerah',
        subjectCountText: '8 Mata Pelajaran',
      },
      {
        grade: 5,
        label: 'Kelas 5 SD',
        tingkatBadge: 'TINGKAT V',
        officialLevel: 'Kelas 5',
        fase: 'Fase C',
        emoji: '📚',
        tagline: 'Pendalaman materi logika matematika, sejarah, dan kebangsaan',
        subjectCountText: '8 Mata Pelajaran',
      },
      {
        grade: 6,
        label: 'Kelas 6 SD',
        tingkatBadge: 'TINGKAT VI',
        officialLevel: 'Kelas 6',
        fase: 'Fase C',
        emoji: '🎓',
        tagline: 'Pemantapan seluruh mata pelajaran dan persiapan kelulusan SD',
        subjectCountText: '8 Mata Pelajaran',
      },
    ],
  },

  // ==========================================================
  // SMP (KELAS 1 - 3 / 7 - 9) - TEMA BIRU MUDA ELEGAN (SKY BLUE)
  // ==========================================================
  smp: {
    schoolTitle: 'Sekolah Menengah Pertama (SMP)',
    schoolEmoji: '🏫',
    schoolSubtitle: 'Pilih tingkatan kelas SMP (Kelas 7, 8, 9) untuk masuk ke ruang kelas',
    headerBg: 'bg-sky-100',
    headerBorder: 'border-sky-300',
    headerTextColor: 'text-sky-950',
    accentBtn: 'bg-sky-600 hover:bg-sky-700 text-white border-2 border-sky-700 shadow-sm',
    accentBorder: 'border-sky-400',
    cardBorderHover: 'hover:border-sky-500 hover:shadow-lg',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900 border border-sky-300',
    scrollbarClass: 'school-scrollbar',
    options: [
      {
        grade: 1,
        label: 'Kelas 1 SMP (Kelas 7)',
        tingkatBadge: 'TINGKAT VII',
        officialLevel: 'Kelas 7 SMP',
        fase: 'Fase D (Awal Menengah)',
        emoji: '📐',
        tagline: 'Aljabar dasar, struktur sel biologi, letak astronomis Indonesia & dasar informatika',
        subjectCountText: '8 Mata Pelajaran Lengkap',
      },
      {
        grade: 2,
        label: 'Kelas 2 SMP (Kelas 8)',
        tingkatBadge: 'TINGKAT VIII',
        officialLevel: 'Kelas 8 SMP',
        fase: 'Fase D (Lanjutan Menengah)',
        emoji: '⚙️',
        tagline: 'Teorema Pythagoras, hukum gerak Newton, masyarakat ASEAN & koding Scratch/Web',
        subjectCountText: '8 Mata Pelajaran Lengkap',
      },
      {
        grade: 3,
        label: 'Kelas 3 SMP (Kelas 9)',
        tingkatBadge: 'TINGKAT IX',
        officialLevel: 'Kelas 9 SMP',
        fase: 'Fase D (Pemantapan Kelulusan)',
        emoji: '🚀',
        tagline: 'Genetika Mendel, listrik dinamis, globalisasi dunia & dasar algoritma Python',
        subjectCountText: '8 Mata Pelajaran Lengkap',
      },
    ],
  },

  // ==========================================================
  // SMA (KELAS 1 - 3 / 10 - 12) - TEMA INDIGO ELEGAN (ROYAL INDIGO)
  // ==========================================================
  sma: {
    schoolTitle: 'Sekolah Menengah Atas (SMA)',
    schoolEmoji: '🏛️',
    schoolSubtitle: 'Pilih tingkatan kelas SMA (Kelas 10, 11, 12) untuk masuk ke ruang kelas',
    headerBg: 'bg-indigo-100',
    headerBorder: 'border-indigo-300',
    headerTextColor: 'text-indigo-950',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-700 shadow-sm',
    accentBorder: 'border-indigo-400',
    cardBorderHover: 'hover:border-indigo-500 hover:shadow-lg',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900 border border-indigo-300',
    scrollbarClass: 'school-scrollbar',
    options: [
      {
        grade: 1,
        label: 'Kelas 1 SMA (Kelas 10)',
        tingkatBadge: 'TINGKAT X',
        officialLevel: 'Kelas 10 SMA',
        fase: 'Fase E (Eksplorasi Minat)',
        emoji: '🧪',
        tagline: 'Eksponen vektor fisika, konfigurasi elektron atom, & biologi ekosistem alam',
        subjectCountText: '8 Mata Pelajaran Lengkap',
      },
      {
        grade: 2,
        label: 'Kelas 2 SMA (Kelas 11)',
        tingkatBadge: 'TINGKAT XI',
        officialLevel: 'Kelas 11 SMA',
        fase: 'Fase F (Penjurusan Lanjut)',
        emoji: '🧬',
        tagline: 'Polinomial matriks, termodinamika fluida, stoikiometri & sistem organ manusia',
        subjectCountText: '8 Mata Pelajaran Lengkap',
      },
      {
        grade: 3,
        label: 'Kelas 3 SMA (Kelas 12)',
        tingkatBadge: 'TINGKAT XII',
        officialLevel: 'Kelas 12 SMA',
        fase: 'Fase F (Persiapan PTN & Karir)',
        emoji: '🎓',
        tagline: 'Kalkulus limit integral, relativitas Einstein, sel volta elektrokimia & akuntansi',
        subjectCountText: '8 Mata Pelajaran Lengkap',
      },
    ],
  },
};

/**
 * Mengambil daftar mata pelajaran terperinci untuk kelas terpilih
 */
function getGradeSubjectsList(schoolType: 'sd' | 'smp' | 'sma', grade: number): (ISdSubjectItem | ISchoolSubjectItem)[] {
  if (schoolType === 'sd') {
    return SD_CURRICULUM_DATA[grade]?.subjects || [];
  } else if (schoolType === 'smp') {
    return SMP_CURRICULUM_DATA[grade]?.subjects || [];
  } else {
    return SMA_CURRICULUM_DATA[grade]?.subjects || [];
  }
}

interface SchoolGradeSelectModalProps {
  isOpen: boolean;
  schoolType: 'sd' | 'smp' | 'sma';
  onClose: () => void;
  onSelectGrade: (grade: number) => void;
}

export const SchoolGradeSelectModal: React.FC<SchoolGradeSelectModalProps> = ({
  isOpen,
  schoolType = 'sd',
  onClose,
  onSelectGrade,
}) => {
  const sound = SoundManager.getInstance();

  // State untuk menampilkan Pop-up Detail Mata Pelajaran saat tombol Info diklik
  const [infoGrade, setInfoGrade] = useState<number | null>(null);

  // Ambil konfigurasi tema sekolah
  const theme = SCHOOL_THEMES_CONFIG[schoolType] || SCHOOL_THEMES_CONFIG.sd;

  // Memoized info data (diletakkan di bagian atas sebelum early return untuk mematuhi Rules of Hooks)
  const activeInfoOption = useMemo(() => {
    if (infoGrade === null) return null;
    return theme.options.find((opt) => opt.grade === infoGrade) || null;
  }, [infoGrade, theme]);

  const activeInfoSubjects = useMemo(() => {
    if (infoGrade === null) return [];
    return getGradeSubjectsList(schoolType, infoGrade);
  }, [schoolType, infoGrade]);

  // Map subjek untuk setiap opsi kartu kelas agar bisa ditampilkan langsung di kartu (terutama SMP & SMA)
  const allCardsSubjects = useMemo(() => {
    const map: Record<number, (ISdSubjectItem | ISchoolSubjectItem)[]> = {};
    for (const opt of theme.options) {
      map[opt.grade] = getGradeSubjectsList(schoolType, opt.grade);
    }
    return map;
  }, [theme, schoolType]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        if (infoGrade !== null) {
          setInfoGrade(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, sound, infoGrade]);

  // Reset infoGrade saat modal ditutup atau ganti tipe sekolah
  useEffect(() => {
    setInfoGrade(null);
  }, [isOpen, schoolType]);

  const handleChoose = (grade: number) => {
    sound.playSuccess();
    onSelectGrade(grade);
  };

  if (!isOpen) return null;

  const isFewGrades = schoolType === 'smp' || schoolType === 'sma';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 font-cute animate-in fade-in duration-150">
      <div
        className={`w-full ${
          isFewGrades ? 'max-w-5xl' : 'max-w-4xl'
        } bg-white border-2 border-neutral-800 rounded-3xl shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden text-neutral-800 relative`}
      >
        {/* ================================================================== */}
        {/* HEADER MODAL: Bersih, Ceria, & Rapi                                 */}
        {/* ================================================================== */}
        <div className={`px-3.5 sm:px-6 py-2.5 sm:py-4 ${theme.headerBg} border-b-2 border-neutral-800 flex items-center justify-between gap-3 shrink-0`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-neutral-800 shadow-xs flex items-center justify-center text-2xl shrink-0">
              {theme.schoolEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-xl sm:text-2xl font-extrabold ${theme.headerTextColor} tracking-wide`}>
                  Pilih Kelas {theme.schoolTitle}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-neutral-300 text-neutral-800 font-bold text-[11px] shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Kurikulum Nasional</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 font-medium mt-0.5">
                {theme.schoolSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-100 border-2 border-neutral-800 text-neutral-700 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Tutup (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================== */}
        {/* BODY CONTENT: KHUSUS SMP & SMA (3 KELAS) ATAU SD (6 KELAS)        */}
        {/* ================================================================== */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${theme.scrollbarClass}`}>
          
          {isFewGrades ? (
            /* ============================================================== */
            /* TAMPILAN KHUSUS SMP & SMA: 3 SHOWCASE CARDS BESAR & MEWAH       */
            /* ============================================================== */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              {theme.options.map((item) => {
                const subjects = allCardsSubjects[item.grade] || [];
                return (
                  <div
                    key={item.grade}
                    className={`group bg-white rounded-2xl border-2 border-neutral-300 ${theme.cardBorderHover} hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between p-4.5 sm:p-5 relative shadow-xs`}
                  >
                    {/* Top Row: Roman Badge + Fase */}
                    <div className="flex items-center justify-between gap-1 mb-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${theme.badgeBg} ${theme.badgeText} tracking-wider`}>
                        {item.tingkatBadge}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {item.fase}
                      </span>
                    </div>

                    {/* Header Kelas: Emoji + Nama Kelas */}
                    <div className="space-y-2 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 border-2 border-neutral-200 group-hover:border-neutral-400 flex items-center justify-center text-2xl shrink-0 transition-colors shadow-2xs">
                          {item.emoji}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-black text-neutral-900 group-hover:text-sky-900 transition-colors leading-tight">
                            {item.label}
                          </h3>
                          <span className="text-xs font-semibold text-neutral-500">
                            {item.officialLevel}
                          </span>
                        </div>
                      </div>

                      {/* Tagline / Deskripsi */}
                      <p className="text-xs text-neutral-600 font-medium leading-relaxed bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-200/80">
                        {item.tagline}
                      </p>
                    </div>

                    {/* DAFTAR PREVIEW MATA PELAJARAN LENGKAP PADA KARTU (Langsung Terlihat!) */}
                    <div className="space-y-2 my-2 py-3 border-y border-neutral-200">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-700 px-0.5">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                          <span>8 Mata Pelajaran Utama:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setInfoGrade(item.grade);
                          }}
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Info className="w-3 h-3" />
                          <span>Lihat Kuis</span>
                        </button>
                      </div>

                      {/* Grid 8 Mapel Pills Rapi 2 Kolom */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {subjects.slice(0, 8).map((sub, sIdx) => (
                          <div
                            key={sub.id || sIdx}
                            className="px-2 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center gap-1.5 transition-colors"
                            title={`${sub.name}: ${sub.badge}`}
                          >
                            <span className="text-sm shrink-0">{sub.emoji}</span>
                            <span className="text-[11px] font-bold text-neutral-800 truncate">
                              {(sub as any).shortName || sub.name.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tombol Aksi Masuk Kelas */}
                    <div className="pt-2 mt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleChoose(item.grade)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${theme.accentBtn}`}
                      >
                        <span>Pilih & Masuk Kelas Ini</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setInfoGrade(item.grade);
                        }}
                        className="w-full py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Info className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Detail Materi, Kuis & Fakta</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ============================================================== */
            /* TAMPILAN KHUSUS SD: 6 KELAS (2 BARIS X 3 KOLOM)                 */
            /* ============================================================== */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {theme.options.map((item) => {
                const subjects = allCardsSubjects[item.grade] || [];
                return (
                  <div
                    key={item.grade}
                    onClick={() => handleChoose(item.grade)}
                    className={`group bg-white rounded-2xl border-2 border-neutral-300 ${theme.cardBorderHover} hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between p-4`}
                  >
                    <div className="space-y-2">
                      {/* Baris Atas: Emoji + Judul Kelas + Badge Fase */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {item.emoji}
                          </span>
                          <div>
                            <h3 className="text-base font-extrabold text-neutral-900 leading-tight">
                              {item.label}
                            </h3>
                            <span className="text-[10px] font-bold text-neutral-500">
                              {item.tingkatBadge}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText}`}>
                          {item.fase}
                        </span>
                      </div>

                      {/* Deskripsi Singkat */}
                      <p className="text-xs text-neutral-600 font-medium line-clamp-2 leading-relaxed">
                        {item.tagline}
                      </p>

                      {/* Mini Preview Subjek (3 chip awal) */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {subjects.slice(0, 3).map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-700 border border-neutral-200 flex items-center gap-1"
                          >
                            <span>{sub.emoji}</span>
                            <span>{(sub as any).shortName || sub.name}</span>
                          </span>
                        ))}
                        {subjects.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold text-amber-900 border border-amber-200">
                            +{subjects.length - 3} lainnya
                          </span>
                        )}
                      </div>

                      {/* Baris Informasi Mapel & Tombol Ikon Info (ℹ️) */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{item.subjectCountText}</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            setInfoGrade(item.grade);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          title={`Lihat daftar mapel & kuis ${item.label}`}
                        >
                          <Info className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Info Mapel</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom CTA: Masuk Kelas */}
                    <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors">
                        Masuk ke Kelas
                      </span>
                      <button
                        type="button"
                        className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer ${theme.accentBtn}`}
                      >
                        <span>Pilih</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* FOOTER MODAL: Penjelasan Logika Multiplayer & Tombol Batal         */}
        {/* ================================================================== */}
        <div className="px-5 sm:px-6 py-3 border-t-2 border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-700 font-medium shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Multiplayer Terpisah:</strong> Pemain di kelas yang sama akan otomatis bertemu secara realtime. Kelas berbeda berada di ruangan terpisah.
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Batal
          </button>
        </div>

        {/* ================================================================== */}
        {/* POP-UP OVERLAY: DETAIL MATA PELAJARAN (Saat Ikon Info Diklik)      */}
        {/* ================================================================== */}
        {infoGrade !== null && activeInfoOption && (
          <div className="absolute inset-0 z-30 bg-black/60 p-3 sm:p-5 flex items-center justify-center animate-in fade-in duration-150">
            <div className="w-full max-w-xl bg-white border-2 border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 animate-in zoom-in-95 duration-150">
              
              {/* Header Info */}
              <div className={`px-5 py-3.5 ${theme.headerBg} border-b-2 border-neutral-200 flex items-center justify-between gap-3 shrink-0`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeInfoOption.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-neutral-900">
                        {activeInfoOption.label}
                      </h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText}`}>
                        {activeInfoOption.fase}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-medium mt-0.5">
                      Daftar Lengkap {activeInfoSubjects.length} Mata Pelajaran & Kurikulum
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setInfoGrade(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  title="Tutup (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body: List Mapel Elegan & Bersih */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-2.5 ${theme.scrollbarClass}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeInfoSubjects.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-2.5 hover:bg-neutral-100/70 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                        {sub.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {idx + 1}. {sub.name}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-neutral-700 border border-neutral-200 shrink-0">
                            {sub.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-medium line-clamp-2 mt-0.5 leading-snug">
                          {sub.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => {
                    sound.playClick();
                    setInfoGrade(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  onClick={() => {
                    const chosen = activeInfoOption.grade;
                    setInfoGrade(null);
                    handleChoose(chosen);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer ${theme.accentBtn}`}
                >
                  <span>Pilih Kelas Ini</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
