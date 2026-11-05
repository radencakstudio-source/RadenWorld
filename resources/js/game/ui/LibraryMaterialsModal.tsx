/**
 * ============================================================================
 * FILE: resources/js/game/ui/LibraryMaterialsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Perpustakaan & Kurikulum Nasional Terpadu RadenWorld (SD 1-6, SMP 1-3, SMA 1-3).
 * Menghadirkan:
 * 1. Navigasi Bertingkat: Pilih Jenjang -> Pilih Kelas -> Pilih Mapel -> Daftar Isi Bab
 * 2. Daftar Isi Komprehensif dengan Indikator Status: Belum Dibuka / Sedang Dipelajari / Selesai
 * 3. Engine Video & Visual Pembelajaran Interaktif (InteractiveVideoStage 60FPS)
 * 4. Layanan Narator Suara Bahasa Indonesia Interaktif (VoiceNarratorService)
 * 5. 100% Selaras dengan Estetika UI RadenWorld (Cozy Clay-Pixel).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Check,
  BookMarked,
  Layers,
  ArrowLeft,
  Play,
  Pause,
  Clock,
  Search,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
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
  ICurriculumSubjectMeta,
} from '../data/library/CurriculumMasterRegistry';
import { InteractiveVideoStage } from './InteractiveVideoStage';
import { VoiceNarratorService } from '../services/VoiceNarratorService';
import { ILibraryTopicItem } from '../data/library/SdLibraryData';

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
  const narrator = VoiceNarratorService.getInstance();

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

  // Pemutar Video State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentDescPage, setCurrentDescPage] = useState<number>(1);
  const totalDescPages = 3;

  // Interactive Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean | null>(null);

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
      setIsPlaying(false);
      setCurrentDescPage(1);
    }
  }, [isOpen, initialSchoolType, initialGrade]);

  // Hentikan suara saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      narrator.stop();
    }
  }, [isOpen, narrator]);

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
          setIsPlaying(false);
          narrator.stop();
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
  }, [isOpen, viewStep, onClose, sound, narrator]);

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

  // Daftar topik untuk mapel dan kelas aktif
  const currentSubjectTopics = useMemo(() => {
    return getCurriculumTopics({
      schoolType: activeSchool,
      gradeKey: activeGradeKey,
      subjectId: selectedSubjectId,
    });
  }, [activeSchool, activeGradeKey, selectedSubjectId]);

  // Topik aktif untuk diputar di player
  const activeTopic: ILibraryTopicItem | null = useMemo(() => {
    if (!selectedTopicId) return currentSubjectTopics[0] || null;
    return (
      findCurriculumTopicById(selectedTopicId) ||
      currentSubjectTopics[0] ||
      null
    );
  }, [selectedTopicId, currentSubjectTopics]);

  // Reset status kuis saat materi bab berganti
  useEffect(() => {
    setSelectedQuizOption(null);
    setIsQuizCorrect(null);
  }, [activeTopic?.id]);

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
  // 4. ACTION HANDLERS: EXP & NAVIGASI BAB
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
      onGainExp(expBonus, `Mempelajari Materi: ${activeTopic.title}`);
    } else {
      EventBus.emit('gain-exp', {
        amount: expBonus,
        source: `Mempelajari Materi: ${activeTopic.title}`,
      });
    }

    EventBus.emit('new-chat-message', {
      id: `lib_read_${Date.now()}`,
      sender: 'PERPUSTAKAAN KOTA',
      text: `📖 Kamu telah tuntas mempelajari "${activeTopic.title}" (${activeTopic.gradeName})! (+${expBonus} EXP)`,
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
      setCurrentDescPage(1);
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
      setCurrentDescPage(1);
    }
  }, [currentTopicIndex, currentSubjectTopics, sound]);

  if (!isOpen) return null;

  const isRead = activeTopic ? readTopics.has(activeTopic.id) : false;

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
            ? 'relative flex flex-col overflow-hidden w-full h-full bg-[#FFF8EA] text-black'
            : 'relative flex flex-col overflow-hidden w-full max-w-6xl h-[min(94dvh,880px)] max-h-[calc(100dvh-1rem)] clay-panel landscape-compact-modal text-black'
        }
      >
        {/* ==================================================================== */}
        {/* LANGKAH 3: DETAIL MATERI & VIDEO INTERAKTIF ("PAHAM SEKETIKA")       */}
        {/* ==================================================================== */}
        {viewStep === 'material_detail' && activeTopic ? (
          <div className="flex-1 min-h-0 flex flex-col h-full w-full bg-[#FFF8EA] select-none overflow-hidden">
            {/* Header Bar Materi */}
            <div className="px-3 sm:px-5 py-2 sm:py-2.5 clay-header landscape-compact-header flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsFullscreen((prev) => !prev);
                  }}
                  className="w-8 h-8 clay-btn-neutral text-black flex items-center justify-center shrink-0"
                  title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                >
                  <svg
                    viewBox="0 0 28 28"
                    className="w-4 h-4 stroke-black stroke-[3] fill-none"
                  >
                    <path d="M4 11V4h7" />
                    <path d="M24 11V4h-7" />
                    <path d="M4 17v7h7" />
                    <path d="M24 17v7h-7" />
                  </svg>
                </button>

                <h2 className="text-black text-xs sm:text-base font-bold tracking-wide truncate">
                  {activeTopic.title}
                </h2>

                <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 clay-badge-secondary text-[10px] font-bold text-black shrink-0">
                  <span>{isPlaying ? '▶ BERJALAN' : '⏸ JEDA'}</span>
                  <span>• 60 FPS</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Tombol Kembali ke Daftar Isi */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsPlaying(false);
                    narrator.stop();
                    setViewStep('table_of_contents');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 clay-btn-secondary text-black text-xs font-bold"
                  title="Kembali ke Daftar Isi"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Daftar Isi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsPlaying(false);
                    narrator.stop();
                    onClose();
                  }}
                  className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center"
                  title="Tutup Perpustakaan (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split View: Kiri (Player Video Interaktif), Kanan (Rangkuman & Kuis) */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row landscape:flex-row overflow-hidden">
              {/* SISI KIRI: PANGGUNG VIDEO VISUAL & INTERAKTIF */}
              <div className="relative basis-[48%] lg:basis-1/2 landscape:basis-1/2 min-h-[220px] lg:min-h-0 landscape:min-h-0 bg-[#FFF8EA] border-b-2 lg:border-b-0 lg:border-r-2 landscape:border-b-0 landscape:border-r-2 border-[#5C3A21] flex flex-col justify-between overflow-hidden shrink-0">
                <InteractiveVideoStage
                  topic={activeTopic}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                  onTogglePlay={() => setIsPlaying((p) => !p)}
                  onChangeSpeed={() =>
                    setPlaybackSpeed((prev) =>
                      prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1
                    )
                  }
                  onPrevTopic={handlePrevTopic}
                  onNextTopic={handleNextTopic}
                  hasPrevTopic={currentTopicIndex > 0}
                  hasNextTopic={
                    currentTopicIndex >= 0 &&
                    currentTopicIndex < currentSubjectTopics.length - 1
                  }
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen((p) => !p)}
                  onOpenQuiz={() => setCurrentDescPage(2)}
                />
              </div>

              {/* SISI KANAN: RANGKUMAN PENJELASAN, TIPS & KUIS EXP */}
              <div className="relative flex-1 min-h-0 bg-[#FFF8EA] text-black p-3.5 sm:p-5 landscape:max-md:p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b-2 border-[#5C3A21] pb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base sm:text-lg">📖</span>
                      <h3 className="text-black font-bold text-xs sm:text-base truncate">
                        {activeTopic.title}
                      </h3>
                    </div>

                    <span className="px-2 py-0.5 clay-badge-secondary text-black text-[10px] sm:text-xs font-bold">
                      {activeTopic.subjectName} • {activeTopic.badge}
                    </span>
                  </div>

                  {/* 3 Tab Navigasi Lembar Belajar Ceria */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30">
                    {[
                      { page: 1, icon: '📖', label: 'Materi & Tips' },
                      { page: 2, icon: '🎯', label: 'Kuis (+EXP)' },
                      { page: 3, icon: '🌟', label: 'Fakta Seru' },
                    ].map((tab) => (
                      <button
                        key={tab.page}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setCurrentDescPage(tab.page);
                        }}
                        className={`py-1.5 px-1 sm:px-2 text-[10.5px] sm:text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${
                          currentDescPage === tab.page
                            ? 'clay-btn-primary text-black shadow-sm'
                            : 'clay-btn-neutral text-black/70 hover:text-black'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span className="truncate">{tab.label}</span>
                        {tab.page === 2 && !readTopics.has(activeTopic.id) && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* HALAMAN 1: MATERI LENGKAP & TIPS CEPAT */}
                  {currentDescPage === 1 && (
                    <div className="space-y-3 text-black">
                      <div className="clay-card p-3 border-2 border-[#5C3A21]">
                        <p className="text-xs sm:text-sm leading-relaxed font-bold text-black">
                          {activeTopic.summary}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1">
                          <span>📌</span>
                          <span>Pokok Pemahaman Materi:</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {activeTopic.points.map((pt, pIdx) => (
                            <li
                              key={pIdx}
                              className="text-xs leading-relaxed p-2.5 clay-card flex items-start gap-2"
                            >
                              <span className="w-5 h-5 clay-badge-cocoa text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {pIdx + 1}
                              </span>
                              <span className="text-black font-medium">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Kunci Pintar & Tips Rumus Cepat Langsung Tampil di Halaman 1 */}
                      {activeTopic.keyFormulaOrConcept && (
                        <div className="p-3 clay-card-primary text-black space-y-1.5 border-2 border-[#5C3A21] shadow-sm">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-black uppercase tracking-wide">
                            <span className="text-sm">💡</span>
                            <span>KUNCI PINTAR & TIPS RUMUS CEPAT:</span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-black bg-[#FFF8EA] p-2.5 rounded-lg border-2 border-[#5C3A21] overflow-x-auto shadow-inner">
                            {activeTopic.keyFormulaOrConcept}
                          </div>
                        </div>
                      )}

                      {/* Teaser Ajakan Mengerjakan Kuis Interaktif */}
                      <div className="clay-card p-3 bg-[#FEF08A]/70 border-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl animate-bounce">🎯</span>
                          <div>
                            <div className="text-xs font-bold text-black uppercase">
                              Sudah Paham Materinya?
                            </div>
                            <div className="text-[10px] text-[#5C3A21] font-medium">
                              Uji kemampuanmu di Kuis Interaktif dan raih bonus +{activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20} EXP!
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setCurrentDescPage(2);
                          }}
                          className="px-3 py-1.5 clay-btn-primary text-xs font-bold text-black flex items-center gap-1 shadow-sm hover:scale-105 transition-all"
                        >
                          <span>Kerjakan Kuis Sekarang</span>
                          <span>▶</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HALAMAN 2: TANTANGAN KUIS INTERAKTIF PLAYABLE */}
                  {currentDescPage === 2 && (
                    <div className="space-y-3 text-black">
                      {/* Tips Rumus Cepat Sebagai Bantuan Kuis */}
                      {activeTopic.keyFormulaOrConcept && (
                        <div className="p-2.5 clay-card-secondary text-black space-y-1 border-2 border-[#5C3A21]">
                          <div className="flex items-center gap-1 text-[10.5px] font-bold text-black uppercase">
                            <span>💡</span>
                            <span>Bantuan Kunci Rumus:</span>
                          </div>
                          <div className="text-xs font-bold text-black bg-[#FFF8EA] p-2 rounded border border-[#5C3A21]/30">
                            {activeTopic.keyFormulaOrConcept}
                          </div>
                        </div>
                      )}

                      {/* Wadah Panggung Kuis Interaktif */}
                      <div className="p-3.5 clay-card space-y-3 border-2 border-[#5C3A21] shadow-md">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base animate-bounce">🎯</span>
                            <span className="text-xs font-black text-black uppercase tracking-wide">
                              TANTANGAN KUIS BERHADIAH EXP
                            </span>
                          </div>
                          <span className="px-2 py-0.5 clay-badge-primary text-black text-[10px] sm:text-xs font-bold">
                            +{activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20} EXP
                          </span>
                        </div>

                        {/* Pertanyaan Kuis */}
                        <div className="text-xs sm:text-sm font-bold text-black clay-card-secondary p-3 rounded-lg leading-relaxed border-2 border-[#5C3A21]">
                          ❓ {activeTopic.quiz.question}
                        </div>

                        {/* Pilihan Jawaban A, B, C (Bisa Diklik Langsung) */}
                        <div className="space-y-2">
                          {activeTopic.quiz.options.map((option, optIdx) => {
                            const isSelected = selectedQuizOption === optIdx;
                            const isCorrectAnswer = optIdx === activeTopic.quiz.answerIndex;
                            const hasAnswered = selectedQuizOption !== null;

                            let btnStyle = 'clay-btn-neutral text-black hover:border-[#FFAE6D]';
                            let iconBadge = String.fromCharCode(65 + optIdx); // A, B, C, D

                            if (hasAnswered) {
                              if (isCorrectAnswer) {
                                btnStyle =
                                  'bg-[#A8E6CF] text-black border-2 border-green-700 font-bold scale-[1.01] shadow-md';
                                iconBadge = '✅';
                              } else if (isSelected) {
                                btnStyle =
                                  'bg-[#FFD3B6] text-black border-2 border-red-500 line-through';
                                iconBadge = '❌';
                              }
                            } else if (isSelected) {
                              btnStyle = 'clay-btn-primary text-black font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={hasAnswered && isQuizCorrect === true}
                                onClick={() => {
                                  sound.playClick();
                                  setSelectedQuizOption(optIdx);
                                  const correct = optIdx === activeTopic.quiz.answerIndex;
                                  setIsQuizCorrect(correct);
                                  if (correct) {
                                    sound.playSuccess();
                                    handleMarkAsRead();
                                  } else {
                                    sound.playError();
                                  }
                                }}
                                className={`w-full p-2.5 sm:p-3 text-left rounded-lg text-xs sm:text-sm flex items-center gap-2.5 transition-all ${btnStyle}`}
                              >
                                <span className="w-6 h-6 rounded-md bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center font-bold text-xs shrink-0 text-black">
                                  {iconBadge}
                                </span>
                                <span className="font-semibold text-black leading-snug">
                                  {option}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback Hasil Kuis & Penjelasan Pembahasan */}
                        {selectedQuizOption !== null && (
                          <div className="space-y-2 pt-2 border-t-2 border-[#5C3A21]/20">
                            {isQuizCorrect ? (
                              <div className="p-2.5 rounded-lg bg-[#A8E6CF] border-2 border-green-700 flex items-center justify-between gap-2 shadow-sm animate-pulse">
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-green-950">
                                  <span>🎉</span>
                                  <span>JAWABAN BENAR! EXP Berhasil Didapatkan!</span>
                                </div>
                                <span className="px-2 py-0.5 clay-badge-cocoa text-white text-[10px] font-bold">
                                  +{activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20} EXP
                                </span>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-lg bg-[#FFD3B6] border-2 border-red-500 flex items-center justify-between gap-2">
                                <div className="text-xs font-bold text-red-950">
                                  ❌ Jawaban masih kurang tepat. Coba pilih opsi lain ya!
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playClick();
                                    setSelectedQuizOption(null);
                                    setIsQuizCorrect(null);
                                  }}
                                  className="px-2 py-1 clay-btn-neutral text-black text-[10.5px] font-bold shrink-0"
                                >
                                  🔄 Coba Lagi
                                </button>
                              </div>
                            )}

                            {/* Kotak Pembahasan */}
                            <div className="text-xs text-black clay-card-secondary p-3 space-y-1 rounded-lg border-2 border-[#5C3A21]">
                              <div className="font-bold text-black flex items-center gap-1">
                                <span>💡</span>
                                <span>Pembahasan Mudah:</span>
                              </div>
                              <p className="text-black/95 leading-relaxed font-medium">
                                {activeTopic.quiz.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* HALAMAN 3: FAKTA SERU DUNIA */}
                  {currentDescPage === 3 && (
                    <div className="space-y-2.5 text-black">
                      <div className="p-3.5 clay-card-secondary space-y-2 border-2 border-[#5C3A21]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 clay-badge-cocoa text-white text-[10px] font-bold uppercase">
                            FAKTA AJAIB DUNIA
                          </span>
                          <span className="text-xs font-bold text-black">
                            Tahukah Kamu?
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-black font-medium">
                          ✨ {activeTopic.funFact}
                        </p>
                      </div>

                      <div className="p-3.5 clay-card text-xs sm:text-sm leading-relaxed text-black space-y-1">
                        <div className="font-bold text-black flex items-center gap-1.5">
                          <span>🌟</span>
                          <span>Petualangan di RadenWorld:</span>
                        </div>
                        <p className="text-black/90">
                          Memahami materi ini membuat karaktermu semakin bijaksana, siap menempuh ujian kelulusan di gedung sekolah, serta mendapatkan gelar siswa berprestasi!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Navigasi Bab & Tombol Selesai (+EXP) */}
                <div className="pt-3 mt-3 border-t-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleMarkAsRead}
                      className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ${
                        isRead
                          ? 'clay-badge-secondary text-black'
                          : 'clay-btn-primary text-black'
                      }`}
                    >
                      {isRead ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>Tuntas Dipelajari (+EXP)</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-black" />
                          <span>
                            Tandai Selesai (+
                            {activeSchool === 'sma'
                              ? 50
                              : activeSchool === 'smp'
                              ? 35
                              : 20}{' '}
                            EXP)
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pagination Halaman Deskripsi */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentDescPage <= 1}
                      onClick={() => {
                        sound.playClick();
                        setCurrentDescPage((p) => Math.max(1, p - 1));
                      }}
                      className="p-1.5 clay-btn-neutral text-black disabled:opacity-40"
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-black text-xs font-bold px-1 select-none">
                      Halaman {currentDescPage}/{totalDescPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentDescPage >= totalDescPages}
                      onClick={() => {
                        sound.playClick();
                        setCurrentDescPage((p) =>
                          Math.min(totalDescPages, p + 1)
                        );
                      }}
                      className="p-1.5 clay-btn-neutral text-black disabled:opacity-40"
                      title="Halaman Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* LANGKAH 1 & 2: PILIH MATA PELAJARAN & DAFTAR ISI                     */}
        {/* ==================================================================== */}
        {viewStep !== 'material_detail' && (
          <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-[#FFF8EA]">
            {/* Header Utama Perpustakaan */}
            <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 clay-header landscape-compact-header gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 clay-card flex items-center justify-center text-lg sm:text-xl shrink-0">
                  🏛️
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-lg font-bold text-black tracking-wide truncate">
                      PERPUSTAKAAN KOTA RADENWORLD
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold clay-badge-secondary text-black">
                      KURIKULUM TERPADU SD - SMP - SMA
                    </span>
                  </div>
                  <p className="text-[11px] text-black hidden sm:block truncate">
                    Modul Visual Animasi 60 FPS, Penjelasan Super Sederhana & Narasi Suara
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 clay-badge-neutral text-xs text-black font-bold">
                  <BookMarked className="w-3.5 h-3.5 text-black" />
                  <span>
                    Selesai: <strong>{readTopics.size}</strong> Bab
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

            {/* Sub-Header: Pemilihan Jenjang, Tingkat Kelas & Pencarian */}
            <div className="px-3.5 sm:px-5 py-2 bg-[#FFF8EA] border-b-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2 shrink-0">
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
                  placeholder="Cari topik materi..."
                  className="w-full pl-8 pr-2.5 py-1 clay-input text-xs text-black"
                />
              </div>
            </div>

            {/* HASIL PENCARIAN JIKA ADA QUERY */}
            {searchQuery.trim() !== '' ? (
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-black">
                    Hasil Pencarian "{searchQuery}" ({searchResults.length} Bab)
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
                      setIsPlaying(true);
                      setCurrentDescPage(1);
                      setViewStep('material_detail');
                    }}
                    className="p-3 clay-card cursor-pointer flex items-center justify-between gap-3 hover:translate-y-[-2px] transition-all"
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
                      Buka Video ▶
                    </span>
                  </div>
                ))}

                {searchResults.length === 0 && (
                  <div className="p-6 text-center clay-card text-black text-xs font-bold">
                    Tidak ditemukan topik materi yang cocok dengan "{searchQuery}".
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ============================================================ */}
                {/* LANGKAH 1: PILIH MATA PELAJARAN                              */}
                {/* ============================================================ */}
                {viewStep === 'select_subject' && (
                  <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar landscape-compact-body space-y-4">
                    {/* Banner Kurikulum Ceria */}
                    <div className="clay-card-secondary p-3 sm:p-3.5 flex items-center justify-between gap-3 border-2 border-[#5C3A21] bg-[#FFAE6D]/20">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl sm:text-3xl shrink-0">
                          {activeSchool === 'sd'
                            ? '🎒'
                            : activeSchool === 'smp'
                            ? '🏫'
                            : '🏛️'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-black uppercase truncate">
                            Kurikulum {activeGradeLabel}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-black/85 font-medium">
                            Setiap bab dilengkapi video animasi 60 FPS, panggung interaktif, dan narasi suara Bahasa Indonesia.
                          </div>
                        </div>
                      </div>
                      <span className="clay-badge-primary px-2.5 py-1 text-[10px] font-bold text-black shrink-0 hidden sm:inline-block">
                        ⭐ Edukasi Interaktif
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-lg font-bold text-black flex items-center gap-2 flex-wrap">
                        <span>1. PILIH MATA PELAJARAN</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 clay-badge-secondary text-black">
                          {activeGradeLabel}
                        </span>
                      </h3>
                      <p className="text-xs text-black mt-0.5">
                        Pilih salah satu mata pelajaran di bawah untuk membuka Daftar Isi bab pembelajaran.
                      </p>
                    </div>

                    {/* Grid Mata Pelajaran Sesuai Jenjang */}
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
                            className="p-3.5 sm:p-4 clay-btn-neutral text-black text-left flex flex-col justify-between min-h-[136px] hover:translate-y-[-2px] transition-all"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <span className="w-10 h-10 clay-badge-primary flex items-center justify-center text-2xl shrink-0">
                                  {subj.icon}
                                </span>
                                <span className="text-[10.5px] font-bold px-2 py-0.5 clay-badge-secondary text-black">
                                  {topics.length} Bab Materi
                                </span>
                              </div>

                              <h4 className="text-sm sm:text-base font-bold text-black">
                                {subj.name}
                              </h4>

                              <p className="text-[11px] sm:text-xs text-black/85 line-clamp-2 mt-1 leading-relaxed">
                                {subj.tagline}
                              </p>
                            </div>

                            <div className="pt-2.5 mt-2 border-t-2 border-[#5C3A21] flex items-center justify-between text-xs font-bold text-black w-full">
                              <span className="text-[10.5px] text-black/80 font-bold">
                                Selesai: {completedCount}/{topics.length}
                              </span>
                              <div className="flex items-center gap-1 text-black font-bold">
                                <span>Daftar Isi</span>
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
                {/* LANGKAH 2: DAFTAR ISI TIAP MATA PELAJARAN DENGAN INDIKATOR   */}
                {/* ============================================================ */}
                {viewStep === 'table_of_contents' && (
                  <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar landscape-compact-body space-y-3.5">
                    {/* Header Navigasi Daftar Isi */}
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
                          <span>Ganti Mapel</span>
                        </button>

                        <div>
                          <h3 className="text-sm sm:text-lg font-bold text-black flex items-center gap-1.5">
                            <span>{activeSubjectMeta.icon}</span>
                            <span>2. DAFTAR ISI: {activeSubjectMeta.name}</span>
                          </h3>
                          <p className="text-[11px] sm:text-xs text-black font-bold">
                            {activeGradeLabel} • {currentSubjectTopics.length} Bab Terstruktur
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* List Bab Daftar Isi */}
                    <div className="space-y-2.5">
                      {currentSubjectTopics.map((topic, idx) => {
                        const hasRead = readTopics.has(topic.id);
                        const isCurrentActive = selectedTopicId === topic.id;

                        // Indikator Status: Belum Dibuka / Sedang Dipelajari / Selesai
                        let statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 clay-badge-neutral text-[9.5px] text-black font-bold">
                            <span>📖 Belum Dibuka</span>
                          </span>
                        );

                        if (hasRead) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9.5px] font-bold text-green-900 bg-green-200 border-2 border-[#5C3A21] rounded-md shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-green-800" />
                              <span>✓ Selesai Tuntas</span>
                            </span>
                          );
                        } else if (isCurrentActive) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9.5px] font-bold text-black bg-[#FFAE6D] border-2 border-[#5C3A21] rounded-md shadow-xs">
                              <Play className="w-2.5 h-2.5 fill-black text-black" />
                              <span>Sedang Dipelajari</span>
                            </span>
                          );
                        }

                        return (
                          <div
                            key={topic.id}
                            onClick={() => {
                              sound.playClick();
                              setSelectedTopicId(topic.id);
                              setIsPlaying(true);
                              setCurrentDescPage(1);
                              setViewStep('material_detail');
                            }}
                            className={`p-3.5 clay-card cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:translate-y-[-2px] transition-all border-2 ${
                              isCurrentActive
                                ? 'border-[#FFAE6D] bg-[#FFF8EA]'
                                : 'border-[#5C3A21]'
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 clay-badge-primary flex flex-col items-center justify-center text-black shrink-0 shadow-sm">
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

                                <div className="flex items-center gap-2 text-[10.5px] text-black/90 flex-wrap pt-0.5">
                                  <span className="inline-flex items-center gap-1 clay-badge-neutral px-2 py-0.5 text-[9.5px] font-bold">
                                    <span>🎯 Kuis:</span>
                                    <span className="truncate max-w-xs">
                                      {topic.quiz.question}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playClick();
                                setSelectedTopicId(topic.id);
                                setIsPlaying(true);
                                setCurrentDescPage(1);
                                setViewStep('material_detail');
                              }}
                              className="px-3.5 py-1.5 clay-btn-primary text-black text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Play className="w-3.5 h-3.5 fill-black text-black" />
                              <span>Putar Video</span>
                            </button>
                          </div>
                        );
                      })}

                      {currentSubjectTopics.length === 0 && (
                        <div className="p-8 text-center clay-card text-black text-xs font-bold">
                          Materi untuk mata pelajaran ini sedang dalam proses penyusunan kurikulum.
                        </div>
                      )}
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
