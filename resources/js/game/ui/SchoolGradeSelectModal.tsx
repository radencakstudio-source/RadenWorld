/**
 * ============================================================================
 * FILE: resources/js/game/ui/SchoolGradeSelectModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Pemilihan Kelas & Leaderboard Sekolah sebelum masuk ke Gedung Sekolah
 * (SD, SMP, atau SMA).
 * Gaya Visual: Chunky Pastel Pixel (Cozycore UI) + Navigasi Sidebar Kiri.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, Info, BookOpen, Sparkles, Users, Trophy, School } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { SD_CURRICULUM_DATA, ISdSubjectItem } from './SdSubjectsModal';
import { SMP_CURRICULUM_DATA, SMA_CURRICULUM_DATA, ISchoolSubjectItem } from './SchoolSubjectsModal';
import {
  fetchSchoolLeaderboards,
  ILeaderboardPayload,
} from '../core/LeaderboardClient';

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
  sd: {
    schoolTitle: 'Sekolah Dasar (SD)',
    schoolEmoji: '🎒',
    schoolSubtitle: 'Pilih tingkatan kelas SD untuk masuk ke ruang kelas belajar',
    headerBg: 'clay-header',
    headerBorder: 'border-[#5C3A21]',
    headerTextColor: 'text-black',
    accentBtn: 'clay-btn-primary text-black',
    accentBorder: 'border-[#5C3A21]',
    cardBorderHover: '',
    badgeBg: 'clay-badge-primary',
    badgeText: 'text-black',
    scrollbarClass: 'custom-scrollbar',
    options: [
      {
        grade: 1,
        label: 'Kelas 1 SD',
        tingkatBadge: 'TINGKAT I',
        officialLevel: 'Kelas 1',
        fase: 'Fase A',
        emoji: '🐣',
        tagline: 'Dasar angka berhitung, membaca lancar, dan budi pekerti ceria',
        subjectCountText: '5 Mata Pelajaran',
      },
      {
        grade: 2,
        label: 'Kelas 2 SD',
        tingkatBadge: 'TINGKAT II',
        officialLevel: 'Kelas 2',
        fase: 'Fase A',
        emoji: '🎨',
        tagline: 'Membaca cerita, berhitung ceria, dan percakapan dasar',
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

  smp: {
    schoolTitle: 'Sekolah Menengah Pertama (SMP)',
    schoolEmoji: '🏫',
    schoolSubtitle: 'Pilih tingkatan kelas SMP (Kelas 7, 8, 9) untuk masuk ke ruang kelas',
    headerBg: 'clay-header-secondary',
    headerBorder: 'border-[#5C3A21]',
    headerTextColor: 'text-black',
    accentBtn: 'clay-btn-primary text-black',
    accentBorder: 'border-[#5C3A21]',
    cardBorderHover: '',
    badgeBg: 'clay-badge-secondary',
    badgeText: 'text-black',
    scrollbarClass: 'custom-scrollbar',
    options: [
      {
        grade: 1,
        label: 'Kelas 7 SMP',
        tingkatBadge: 'TINGKAT VII',
        officialLevel: 'Kelas 7 SMP',
        fase: 'Fase D',
        emoji: '📐',
        tagline: 'Aljabar dasar, struktur sel biologi, letak astronomis Indonesia & informatika',
        subjectCountText: '8 Mata Pelajaran',
      },
      {
        grade: 2,
        label: 'Kelas 8 SMP',
        tingkatBadge: 'TINGKAT VIII',
        officialLevel: 'Kelas 8 SMP',
        fase: 'Fase D',
        emoji: '⚙️',
        tagline: 'Teorema Pythagoras, hukum gerak Newton, masyarakat ASEAN & koding dasar',
        subjectCountText: '8 Mata Pelajaran',
      },
      {
        grade: 3,
        label: 'Kelas 9 SMP',
        tingkatBadge: 'TINGKAT IX',
        officialLevel: 'Kelas 9 SMP',
        fase: 'Fase D',
        emoji: '🚀',
        tagline: 'Genetika Mendel, listrik dinamis, globalisasi dunia & pemantapan kelulusan',
        subjectCountText: '8 Mata Pelajaran',
      },
    ],
  },

  sma: {
    schoolTitle: 'Sekolah Menengah Atas (SMA)',
    schoolEmoji: '🏛️',
    schoolSubtitle: 'Pilih tingkatan kelas SMA (Kelas 10, 11, 12) untuk masuk ke ruang kelas',
    headerBg: 'clay-header',
    headerBorder: 'border-[#5C3A21]',
    headerTextColor: 'text-black',
    accentBtn: 'clay-btn-primary text-black',
    accentBorder: 'border-[#5C3A21]',
    cardBorderHover: '',
    badgeBg: 'clay-badge-primary',
    badgeText: 'text-black',
    scrollbarClass: 'custom-scrollbar',
    options: [
      {
        grade: 1,
        label: 'Kelas 10 SMA',
        tingkatBadge: 'TINGKAT X',
        officialLevel: 'Kelas 10 SMA',
        fase: 'Fase E',
        emoji: '🧪',
        tagline: 'Eksponen vektor fisika, konfigurasi elektron atom, & biologi ekosistem alam',
        subjectCountText: '8 Mata Pelajaran',
      },
      {
        grade: 2,
        label: 'Kelas 11 SMA',
        tingkatBadge: 'TINGKAT XI',
        officialLevel: 'Kelas 11 SMA',
        fase: 'Fase F',
        emoji: '🧬',
        tagline: 'Polinomial matriks, termodinamika fluida, stoikiometri & sistem organ manusia',
        subjectCountText: '8 Mata Pelajaran',
      },
      {
        grade: 3,
        label: 'Kelas 12 SMA',
        tingkatBadge: 'TINGKAT XII',
        officialLevel: 'Kelas 12 SMA',
        fase: 'Fase F',
        emoji: '🎓',
        tagline: 'Kalkulus limit integral, relativitas Einstein, sel volta & ekonomi akuntansi',
        subjectCountText: '8 Mata Pelajaran',
      },
    ],
  },
};

function getGradeSubjectsList(
  schoolType: 'sd' | 'smp' | 'sma',
  grade: number
): (ISdSubjectItem | ISchoolSubjectItem)[] {
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
  const [sidebarTab, setSidebarTab] = useState<'classes' | 'leaderboard'>('classes');
  const [infoGrade, setInfoGrade] = useState<number | null>(null);
  const [lbPayload, setLbPayload] = useState<ILeaderboardPayload | null>(null);

  const theme = SCHOOL_THEMES_CONFIG[schoolType] || SCHOOL_THEMES_CONFIG.sd;

  const activeInfoOption = useMemo(() => {
    if (infoGrade === null) return null;
    return theme.options.find((opt) => opt.grade === infoGrade) || null;
  }, [infoGrade, theme]);

  const activeInfoSubjects = useMemo(() => {
    if (infoGrade === null) return [];
    return getGradeSubjectsList(schoolType, infoGrade);
  }, [schoolType, infoGrade]);

  const allCardsSubjects = useMemo(() => {
    const map: Record<number, (ISdSubjectItem | ISchoolSubjectItem)[]> = {};
    for (const opt of theme.options) {
      map[opt.grade] = getGradeSubjectsList(schoolType, opt.grade);
    }
    return map;
  }, [theme, schoolType]);

  useEffect(() => {
    if (!isOpen) return;
    setInfoGrade(null);
    setSidebarTab('classes');
    fetchSchoolLeaderboards(schoolType, 1).then(setLbPayload);
  }, [isOpen, schoolType]);

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

  const handleChoose = (grade: number) => {
    sound.playSuccess();
    onSelectGrade(grade);
  };

  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop font-pixel" onClick={onClose}>
      <div
        className="w-full max-w-5xl clay-modal-shell h-[min(88dvh,640px)] text-black relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT SIDEBAR */}
        <aside className="clay-sidebar">
          <div className="clay-sidebar-brand">
            <span className="w-9 h-9 clay-card flex items-center justify-center text-lg shrink-0">
              {theme.schoolEmoji}
            </span>
            <div className="min-w-0 hidden sm:block landscape:block">
              <div className="font-bold text-xs text-black truncate">
                {schoolType.toUpperCase()} RADEN
              </div>
              <div className="text-[10px] text-black truncate">Gerbang Masuk</div>
            </div>
          </div>

          <div className="clay-sidebar-nav custom-scrollbar">
            <div className="clay-sidebar-section-label">Menu Gedung</div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSidebarTab('classes');
                setInfoGrade(null);
              }}
              className={`clay-sidebar-item ${
                sidebarTab === 'classes'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              <School className="w-4 h-4 shrink-0" />
              <span className="truncate">Ruang Kelas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSidebarTab('leaderboard');
                setInfoGrade(null);
              }}
              className={`clay-sidebar-item ${
                sidebarTab === 'leaderboard'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span className="truncate">Juara Sekolah</span>
            </button>

            <div className="clay-sidebar-section-label pt-2">Masuk Cepat</div>
            {theme.options.map((opt) => (
              <button
                key={opt.grade}
                type="button"
                onClick={() => handleChoose(opt.grade)}
                className="clay-sidebar-item !py-1.5 clay-btn-neutral text-black"
              >
                <span className="text-sm shrink-0">{opt.emoji}</span>
                <span className="truncate text-[11px]">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="clay-sidebar-footer">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-2 px-2 clay-btn-cocoa text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline landscape:inline">Batal</span>
            </button>
          </div>
        </aside>

        {/* RIGHT PANE */}
        <main className="clay-main-pane">
          <div className="clay-main-topbar">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-black tracking-wide truncate">
                {sidebarTab === 'classes'
                  ? `Pilih Kelas ${theme.schoolTitle}`
                  : `Papan Juara ${theme.schoolTitle}`}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 clay-badge-secondary text-black font-bold text-[10px]">
                <Sparkles className="w-3 h-3 text-black" />
                <span>Kurikulum Nasional</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center shrink-0"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="clay-main-body custom-scrollbar">
            {sidebarTab === 'classes' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {theme.options.map((item) => {
                  const subjects = allCardsSubjects[item.grade] || [];
                  return (
                    <div
                      key={item.grade}
                      className="clay-card flex flex-col justify-between p-3.5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-9 h-9 clay-badge-neutral flex items-center justify-center text-xl shrink-0">
                              {item.emoji}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-black leading-tight truncate">
                                {item.label}
                              </h3>
                              <span className="text-[10px] font-bold text-black">
                                {item.tingkatBadge}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 clay-badge-secondary text-black shrink-0">
                            {item.fase}
                          </span>
                        </div>

                        <p className="text-[11px] text-black leading-relaxed">
                          {item.tagline}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {subjects.slice(0, 3).map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 clay-badge-neutral text-[10px] font-bold text-black flex items-center gap-1"
                            >
                              <span>{sub.emoji}</span>
                              <span>{(sub as any).shortName || sub.name}</span>
                            </span>
                          ))}
                          {subjects.length > 3 && (
                            <span className="px-1.5 py-0.5 clay-badge-primary text-[10px] font-bold text-black">
                              +{subjects.length - 3} mapel
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t-2 border-[#5C3A21] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setInfoGrade(item.grade);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 clay-btn-secondary text-black text-[11px] font-bold"
                        >
                          <Info className="w-3.5 h-3.5 text-black" />
                          <span>Mapel</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChoose(item.grade)}
                          className="px-3.5 py-1.5 clay-btn-primary text-black text-xs font-bold flex items-center gap-1"
                        >
                          <span>Masuk</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 clay-card-primary flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-black">
                      🏆 Peringkat Siswa Berprestasi {theme.schoolTitle}
                    </div>
                    <div className="text-[11px] text-black">
                      Masuk ke ruang kelas dan kerjakan kuis di meja belajar untuk merebut posisi #1!
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(lbPayload?.schoolLeaderboard || []).map((row, idx) => (
                    <div
                      key={`${row.classKey}-${row.name}-${idx}`}
                      className={`p-2.5 sm:p-3 flex items-center justify-between gap-2 ${
                        idx === 0 ? 'clay-card-secondary' : 'clay-card'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 clay-badge-primary font-bold text-xs text-black">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-black truncate">
                            {row.name}
                          </div>
                          <div className="text-[10px] text-black">
                            {row.classLabel} • {row.subject} • Akurasi {row.accuracy}%
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-black shrink-0">
                        {row.bestScore.toLocaleString('id-ID')} PTS
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="clay-main-footer text-[11px] text-black">
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-4 h-4 text-black shrink-0" />
              <span className="truncate">
                Pemain di kelas yang sama otomatis bertemu secara realtime.
              </span>
            </div>
          </div>
        </main>

        {/* POP-UP DETAIL MATA PELAJARAN */}
        {infoGrade !== null && activeInfoOption && (
          <div className="absolute inset-0 z-30 bg-[#5C3A21]/60 p-2.5 sm:p-4 flex items-center justify-center">
            <div className="w-full max-w-xl clay-panel overflow-hidden flex flex-col max-h-[84dvh] text-black">
              <div className="px-4 py-3 clay-header-secondary flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-9 h-9 clay-card flex items-center justify-center text-xl shrink-0">
                    {activeInfoOption.emoji}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-black">
                      {activeInfoOption.label} ({activeInfoOption.fase})
                    </h3>
                    <p className="text-[11px] text-black truncate">
                      Daftar {activeInfoSubjects.length} Mata Pelajaran & Kuis
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setInfoGrade(null);
                  }}
                  className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeInfoSubjects.map((sub, idx) => (
                    <div key={sub.id || idx} className="p-2.5 clay-card flex items-start gap-2.5">
                      <div className="w-8 h-8 clay-badge-neutral flex items-center justify-center text-base shrink-0">
                        {sub.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-black truncate">
                            {idx + 1}. {sub.name}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 clay-badge-secondary text-black shrink-0">
                            {sub.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-black line-clamp-2 mt-0.5 leading-snug">
                          {sub.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2.5 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setInfoGrade(null);
                  }}
                  className="px-3.5 py-1.5 clay-btn-neutral text-black font-bold text-xs"
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const chosen = activeInfoOption.grade;
                    setInfoGrade(null);
                    handleChoose(chosen);
                  }}
                  className="px-4 py-1.5 clay-btn-primary text-black text-xs font-bold flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Masuk {activeInfoOption.label}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
