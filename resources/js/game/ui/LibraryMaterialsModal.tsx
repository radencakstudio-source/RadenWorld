/**
 * ============================================================================
 * FILE: resources/js/game/ui/LibraryMaterialsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Buku Pelajaran Bergambar & Kurikulum Nasional Terpadu RadenWorld
 * untuk jenjang SD (Kelas 1-6), SMP (Kelas 7-9), dan SMA (Kelas 10-12).
 *
 * Konsep UI:
 * - Desain seperti Buku Cetak Terbuka (Gambar Ilustrasi Statis + Full Teks
 *   Penjelasan Materi yang Sangat Mudah Dipahami).
 * - Tanpa pemutar video / tombol play / animasi interaktif berat, sehingga
 *   sangat ringan di semua perangkat (PC & Mobile Vertikal/Horizontal).
 * - Dilengkapi Latihan Soal Pemahaman di akhir bacaan berhadiah +EXP.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  ChevronRight,
  BookMarked,
  Layers,
  ArrowLeft,
  Search,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { SchoolType } from '../data/library/LibraryMasterData';
import {
  CURRICULUM_SCHOOL_LEVELS,
  CURRICULUM_GRADES,
  CURRICULUM_SUBJECTS,
  ALL_COMBINED_TOPICS,
  getCurriculumTopics,
  findCurriculumTopicById,
} from '../data/library/CurriculumMasterRegistry';
import { ILibraryTopicItem } from '../data/library/SdLibraryData';
import { BookMaterialView } from './BookMaterialView';

export interface LibraryMaterialsModalProps {
  isOpen: boolean;
  initialSchoolType?: SchoolType;
  initialGrade?: number;
  onClose: () => void;
  onGainExp?: (amount: number, source: string) => void;
}

type LibraryViewStep = 'select_subject' | 'table_of_contents' | 'material_detail';

export const LibraryMaterialsModal: React.FC<LibraryMaterialsModalProps> = ({
  isOpen,
  initialSchoolType = 'sd',
  initialGrade = 1,
  onClose,
  onGainExp,
}) => {
  const sound = SoundManager.getInstance();

  // --------------------------------------------------------------------------
  // 1. STATE NAVIGASI BERTINGKAT
  // --------------------------------------------------------------------------
  const [viewStep, setViewStep] = useState<LibraryViewStep>('select_subject');
  const [activeSchool, setActiveSchool] = useState<SchoolType>(initialSchoolType);
  const [activeGradeKey, setActiveGradeKey] = useState<string>('sd-1');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sd_math');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Status Bacaan (EXP Tracker)
  const [readTopics, setReadTopics] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('raden_library_read_topics');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // --------------------------------------------------------------------------
  // 2. INISIALISASI & RESPONSIVE PROPS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      const school = initialSchoolType || 'sd';
      setActiveSchool(school);
      const grades = CURRICULUM_GRADES[school];
      const targetNumeric =
        initialGrade || (school === 'sd' ? 1 : school === 'smp' ? 7 : 10);
      const matched =
        grades.find((g) => g.numericGrade === targetNumeric) || grades[0];
      setActiveGradeKey(matched.key);

      const subjects = CURRICULUM_SUBJECTS[school];
      setSelectedSubjectId(subjects[0]?.id || 'sd_math');

      setViewStep('select_subject');
      setSearchQuery('');
    }
  }, [isOpen, initialSchoolType, initialGrade]);

  // Keyboard Escape Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }
      if (e.key === 'Escape') {
        sound.playClick();
        if (viewStep === 'material_detail') {
          setViewStep('table_of_contents');
        } else if (viewStep === 'table_of_contents') {
          setViewStep('select_subject');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewStep, onClose, sound]);

  // --------------------------------------------------------------------------
  // 3. DAFTAR KELAS, MAPEL & TOPIK TERSEDIA
  // --------------------------------------------------------------------------
  const currentGrades = useMemo(() => {
    return CURRICULUM_GRADES[activeSchool] || CURRICULUM_GRADES.sd;
  }, [activeSchool]);

  const activeGradeLabel = useMemo(() => {
    const found = currentGrades.find((g) => g.key === activeGradeKey);
    return found ? found.label : 'Kelas 1 SD';
  }, [currentGrades, activeGradeKey]);

  const currentSubjects = useMemo(() => {
    return CURRICULUM_SUBJECTS[activeSchool] || CURRICULUM_SUBJECTS.sd;
  }, [activeSchool]);

  const activeSubjectMeta = useMemo(() => {
    return (
      currentSubjects.find((s) => s.id === selectedSubjectId) ||
      currentSubjects[0]
    );
  }, [currentSubjects, selectedSubjectId]);

  const currentSubjectTopics = useMemo(() => {
    return getCurriculumTopics({
      schoolType: activeSchool,
      gradeKey: activeGradeKey,
      subjectId: selectedSubjectId,
    });
  }, [activeSchool, activeGradeKey, selectedSubjectId]);

  const activeTopic: ILibraryTopicItem | null = useMemo(() => {
    if (!selectedTopicId) return currentSubjectTopics[0] || null;
    return (
      findCurriculumTopicById(selectedTopicId) ||
      currentSubjectTopics[0] ||
      null
    );
  }, [selectedTopicId, currentSubjectTopics]);

  // Hasil pencarian cepat lintas kurikulum
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_COMBINED_TOPICS.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        (item.keyFormulaOrConcept || '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // --------------------------------------------------------------------------
  // 4. ACTION HANDLERS: EXP & NAVIGASI BAB BUKU
  // --------------------------------------------------------------------------
  const handleMarkAsRead = useCallback(() => {
    if (!activeTopic) return;
    const id = activeTopic.id;
    if (readTopics.has(id)) {
      sound.playClick();
      return;
    }

    sound.playSuccess();
    const nextSet = new Set(readTopics);
    nextSet.add(id);
    setReadTopics(nextSet);

    try {
      localStorage.setItem(
        'raden_library_read_topics',
        JSON.stringify(Array.from(nextSet))
      );
    } catch {}

    const expBonus =
      activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20;

    if (onGainExp) {
      onGainExp(expBonus, `Membaca Buku Materi: ${activeTopic.title}`);
    } else {
      EventBus.emit('gain-exp', {
        amount: expBonus,
        source: `Membaca Buku Materi: ${activeTopic.title}`,
      });
    }

    EventBus.emit('new-chat-message', {
      id: `lib_read_${Date.now()}`,
      sender: 'PERPUSTAKAAN KOTA',
      text: `📖 Kamu telah selesai membaca bab "${activeTopic.title}" (${activeTopic.gradeName})! (+${expBonus} EXP)`,
      timestamp: Date.now(),
      isSystem: true,
    });
  }, [activeTopic, readTopics, activeSchool, sound, onGainExp]);

  const currentTopicIndex = useMemo(() => {
    if (!activeTopic) return -1;
    return currentSubjectTopics.findIndex((t) => t.id === activeTopic.id);
  }, [currentSubjectTopics, activeTopic]);

  const handlePrevTopic = useCallback(() => {
    if (currentTopicIndex > 0) {
      sound.playClick();
      const prev = currentSubjectTopics[currentTopicIndex - 1];
      setSelectedTopicId(prev.id);
    }
  }, [currentTopicIndex, currentSubjectTopics, sound]);

  const handleNextTopic = useCallback(() => {
    if (
      currentTopicIndex >= 0 &&
      currentTopicIndex < currentSubjectTopics.length - 1
    ) {
      sound.playClick();
      const next = currentSubjectTopics[currentTopicIndex + 1];
      setSelectedTopicId(next.id);
    }
  }, [currentTopicIndex, currentSubjectTopics, sound]);

  if (!isOpen) return null;

  const isRead = activeTopic ? readTopics.has(activeTopic.id) : false;
  const expReward = activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20;

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex items-center justify-center p-0 bg-[#FFF8EA] font-pixel'
          : 'ui-modal-backdrop font-pixel'
      }
    >
      <div
        className={
          isFullscreen
            ? 'relative flex flex-col overflow-hidden w-full h-full clay-panel !rounded-none text-black'
            : 'relative flex flex-col overflow-hidden w-full max-w-6xl h-[min(94dvh,860px)] max-h-[calc(100dvh-0.75rem)] clay-panel landscape-compact-modal text-black'
        }
      >
        {/* ==================================================================== */}
        {/* LANGKAH 3: TAMPILAN BUKU PELAJARAN BERGAMBAR (GAMBAR + PENJELASAN)   */}
        {/* ==================================================================== */}
        {viewStep === 'material_detail' && activeTopic ? (
          <div className="flex-1 min-h-0 flex flex-col h-full w-full select-none overflow-hidden">
            {/* Header Buku Pelajaran */}
            <div className="px-3 sm:px-5 py-2 sm:py-2.5 clay-header landscape-compact-header flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsFullscreen((prev) => !prev);
                  }}
                  className="w-8 h-8 clay-btn-neutral text-black flex items-center justify-center shrink-0"
                  title={isFullscreen ? 'Keluar Layar Penuh' : 'Perbesar Buku'}
                >
                  <BookOpen className="w-4 h-4 text-black" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 clay-badge-primary text-[10px] font-bold text-black">
                      BAB {currentTopicIndex >= 0 ? currentTopicIndex + 1 : 1}
                    </span>
                    <h2 className="text-black text-xs sm:text-base font-bold tracking-wide truncate">
                      {activeTopic.title}
                    </h2>
                  </div>
                </div>

                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 clay-badge-secondary text-[10px] font-bold text-black shrink-0">
                  📖 {activeTopic.gradeName} • {activeTopic.subjectName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setViewStep('table_of_contents');
                  }}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 clay-btn-secondary text-black text-xs font-bold"
                  title="Kembali ke Daftar Isi Buku"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Daftar Isi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center"
                  title="Tutup Buku (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Area Isi Buku Terbuka Konsisten (Ilustrasi Bisa Di-Klik/Tap Zoom + Rumus Unik + Kuis Bersih) */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-5 landscape:max-md:p-3">
              <BookMaterialView
                topic={activeTopic}
                chapterNumber={currentTopicIndex >= 0 ? currentTopicIndex + 1 : 1}
                totalChapters={Math.max(1, currentSubjectTopics.length)}
                isRead={isRead}
                expReward={expReward}
                onMarkAsRead={handleMarkAsRead}
                onPrevTopic={handlePrevTopic}
                onNextTopic={handleNextTopic}
                hasPrevTopic={currentTopicIndex > 0}
                hasNextTopic={
                  currentTopicIndex >= 0 &&
                  currentTopicIndex < currentSubjectTopics.length - 1
                }
              />
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* LANGKAH 1 & 2: PILIH MATA PELAJARAN & DAFTAR ISI BUKU                */}
        {/* ==================================================================== */}
        {viewStep !== 'material_detail' && (
          <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
            {/* Header Utama Perpustakaan */}
            <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 clay-header landscape-compact-header gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 clay-card flex items-center justify-center text-lg sm:text-xl shrink-0">
                  📚
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-lg font-bold text-black tracking-wide truncate">
                      BUKU MATERI &amp; PERPUSTAKAAN RADENWORLD
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold clay-badge-secondary text-black">
                      BUKU PELAJARAN SD • SMP • SMA
                    </span>
                  </div>
                  <p className="text-[11px] text-black hidden sm:block truncate">
                    Buku Bergambar &amp; Penjelasan Teks Lengkap yang Sangat Mudah Dipahami
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 clay-badge-neutral text-xs text-black font-bold">
                  <BookMarked className="w-3.5 h-3.5 text-black" />
                  <span>
                    Dibaca: <strong>{readTopics.size}</strong> Bab
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="w-9 h-9 clay-btn-cocoa text-white flex items-center justify-center"
                  title="Tutup Perpustakaan (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-Header: Pemilihan Jenjang (SD, SMP, SMA), Tingkat Kelas & Pencarian */}
            <div className="px-3.5 sm:px-5 py-2 border-b-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2 shrink-0">
              {/* Tab Jenjang Sekolah: SD, SMP, SMA */}
              <div className="flex items-center gap-1.5">
                {CURRICULUM_SCHOOL_LEVELS.map((lvl) => {
                  const isCurrent = activeSchool === lvl.type;
                  return (
                    <button
                      key={lvl.type}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveSchool(lvl.type);
                        const firstGrade = CURRICULUM_GRADES[lvl.type][0];
                        setActiveGradeKey(firstGrade.key);
                        const firstSubject = CURRICULUM_SUBJECTS[lvl.type][0];
                        setSelectedSubjectId(firstSubject.id);
                        if (viewStep === 'table_of_contents') {
                          setViewStep('select_subject');
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1 transition-all ${
                        isCurrent
                          ? 'clay-btn-primary text-black'
                          : 'clay-btn-neutral text-black'
                      }`}
                    >
                      <span>{lvl.icon}</span>
                      <span>{lvl.badge}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selector Tingkat Kelas */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-xs font-bold text-black mr-0.5 hidden lg:flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-black" />
                  Kelas:
                </span>
                {currentGrades.map((gradeInfo) => {
                  const isSelected = activeGradeKey === gradeInfo.key;
                  return (
                    <button
                      key={gradeInfo.key}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveGradeKey(gradeInfo.key);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'clay-btn-secondary text-black'
                          : 'clay-btn-neutral text-black'
                      }`}
                    >
                      {gradeInfo.label}
                    </button>
                  );
                })}
              </div>

              {/* Input Pencarian Cepat */}
              <div className="relative w-full sm:w-52">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Cari bab buku materi..."
                  className="w-full pl-8 pr-2.5 py-1 clay-input text-xs text-black"
                />
              </div>
            </div>

            {/* HASIL PENCARIAN JIKA ADA QUERY */}
            {searchQuery.trim() !== '' ? (
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-black">
                    Hasil Pencarian Buku &quot;{searchQuery}&quot; ({searchResults.length} Bab)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-2.5 py-1 clay-btn-neutral text-black text-xs font-bold"
                  >
                    Bersihkan
                  </button>
                </div>

                {searchResults.map((topic, idx) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveSchool(topic.schoolType);
                      setActiveGradeKey(topic.gradeKey);
                      setSelectedTopicId(topic.id);
                      setSearchQuery('');
                      setViewStep('material_detail');
                    }}
                    className="p-3 clay-card cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 clay-badge-primary text-[10px] font-bold text-black">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-black truncate">
                          {topic.title}
                        </h4>
                        <span className="px-2 py-0.5 clay-badge-secondary text-[10px] font-bold text-black">
                          {topic.gradeName} • {topic.subjectName}
                        </span>
                      </div>
                      <p className="text-[11px] text-black line-clamp-1 mt-1">
                        {topic.summary}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 clay-btn-primary text-black text-xs font-bold shrink-0">
                      📖 Baca Buku
                    </span>
                  </div>
                ))}

                {searchResults.length === 0 && (
                  <div className="p-6 text-center clay-card text-black text-xs font-bold">
                    Tidak ditemukan bab buku yang cocok dengan &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ============================================================ */}
                {/* LANGKAH 1: PILIH BUKU MATA PELAJARAN                         */}
                {/* ============================================================ */}
                {viewStep === 'select_subject' && (
                  <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar landscape-compact-body space-y-4">
                    <div className="clay-card-secondary p-3 sm:p-3.5 flex items-center justify-between gap-3 border-2 border-[#5C3A21]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl sm:text-3xl shrink-0">
                          {activeSchool === 'sd'
                            ? '📗'
                            : activeSchool === 'smp'
                              ? '📘'
                              : '📙'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-black uppercase truncate">
                            Koleksi Buku Pelajaran {activeGradeLabel}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-black/85 font-medium">
                            Setiap bab disusun seperti buku cetak: dilengkapi gambar ilustrasi jelas, penjelasan mudah dipahami, rumus praktis, dan latihan soal.
                          </div>
                        </div>
                      </div>
                      <span className="clay-badge-primary px-2.5 py-1 text-[10px] font-bold text-black shrink-0 hidden sm:inline-block">
                        📖 Buku Teks &amp; Gambar
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-lg font-bold text-black flex items-center gap-2 flex-wrap">
                        <span>1. PILIH BUKU MATA PELAJARAN</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 clay-badge-secondary text-black">
                          {activeGradeLabel}
                        </span>
                      </h3>
                      <p className="text-xs text-black mt-0.5">
                        Ketuk salah satu buku mata pelajaran di bawah untuk melihat Daftar Isi bab.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 landscape:grid-cols-2 gap-3">
                      {currentSubjects.map((subj) => {
                        const topics = getCurriculumTopics({
                          schoolType: activeSchool,
                          gradeKey: activeGradeKey,
                          subjectId: subj.id,
                        });
                        const completedCount = topics.filter((t) =>
                          readTopics.has(t.id)
                        ).length;

                        return (
                          <button
                            key={subj.id}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setSelectedSubjectId(subj.id);
                              setViewStep('table_of_contents');
                            }}
                            className="p-3.5 sm:p-4 clay-btn-neutral text-black text-left flex flex-col justify-between min-h-[132px]"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <span className="w-10 h-10 clay-badge-primary flex items-center justify-center text-2xl shrink-0">
                                  {subj.icon}
                                </span>
                                <span className="text-[10.5px] font-bold px-2 py-0.5 clay-badge-secondary text-black">
                                  {topics.length} Bab Buku
                                </span>
                              </div>

                              <h4 className="text-sm sm:text-base font-bold text-black">
                                Buku {subj.name}
                              </h4>

                              <p className="text-[11px] sm:text-xs text-black/85 line-clamp-2 mt-1 leading-relaxed">
                                {subj.tagline}
                              </p>
                            </div>

                            <div className="pt-2.5 mt-2 border-t-2 border-[#5C3A21] flex items-center justify-between text-xs font-bold text-black w-full">
                              <span className="text-[10.5px] text-black/80 font-bold">
                                Dibaca: {completedCount}/{topics.length}
                              </span>
                              <div className="flex items-center gap-1 text-black font-bold">
                                <span>Buka Buku</span>
                                <ChevronRight className="w-4 h-4 text-black" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* LANGKAH 2: DAFTAR ISI BUKU MATA PELAJARAN                    */}
                {/* ============================================================ */}
                {viewStep === 'table_of_contents' && (
                  <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar landscape-compact-body space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b-2 border-[#5C3A21]">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setViewStep('select_subject');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 clay-btn-secondary text-xs font-bold text-black"
                        >
                          <ArrowLeft className="w-4 h-4 text-black" />
                          <span>Ganti Buku Mapel</span>
                        </button>

                        <div>
                          <h3 className="text-sm sm:text-lg font-bold text-black flex items-center gap-1.5">
                            <span>{activeSubjectMeta.icon}</span>
                            <span>DAFTAR ISI BUKU: {activeSubjectMeta.name}</span>
                          </h3>
                          <p className="text-[11px] sm:text-xs text-black font-bold">
                            {activeGradeLabel} • {currentSubjectTopics.length} Bab Materi Bergambar
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {currentSubjectTopics.map((topic, idx) => {
                        const hasRead = readTopics.has(topic.id);
                        const isCurrentActive = selectedTopicId === topic.id;

                        let statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 clay-badge-neutral text-[9.5px] text-black font-bold">
                            <span>📖 Belum Dibaca</span>
                          </span>
                        );

                        if (hasRead) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9.5px] font-bold text-green-900 bg-green-200 border-2 border-[#5C3A21] rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-green-800" />
                              <span>✓ Selesai Dibaca</span>
                            </span>
                          );
                        } else if (isCurrentActive) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9.5px] font-bold text-black bg-[#FFAE6D] border-2 border-[#5C3A21] rounded-md">
                              <span>📖 Sedang Dibaca</span>
                            </span>
                          );
                        }

                        return (
                          <div
                            key={topic.id}
                            onClick={() => {
                              sound.playClick();
                              setSelectedTopicId(topic.id);
                              setViewStep('material_detail');
                            }}
                            className={`p-3.5 clay-card cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 ${
                              isCurrentActive
                                ? 'border-[#FFAE6D]'
                                : 'border-[#5C3A21]'
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 clay-badge-primary flex flex-col items-center justify-center text-black shrink-0">
                                <span className="text-[8px] font-bold uppercase leading-none opacity-75">
                                  Bab
                                </span>
                                <span className="text-xs font-bold leading-none mt-0.5">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                              </div>

                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h4 className="text-xs sm:text-sm font-bold text-black">
                                    {topic.title}
                                  </h4>
                                  <span className="px-2 py-0.5 clay-badge-secondary text-black text-[9.5px] font-bold">
                                    {topic.badge}
                                  </span>
                                  {statusBadge}
                                </div>

                                <p className="text-[11px] sm:text-xs text-black leading-relaxed">
                                  {topic.summary}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playClick();
                                setSelectedTopicId(topic.id);
                                setViewStep('material_detail');
                              }}
                              className="px-3.5 py-1.5 clay-btn-primary text-black text-xs font-bold shrink-0 flex items-center justify-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-black" />
                              <span>Baca Materi</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
