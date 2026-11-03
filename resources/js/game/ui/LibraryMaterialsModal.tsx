/**
 * ============================================================================
 * FILE: resources/js/game/ui/LibraryMaterialsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Ensiklopedia & Visual Edukasi Perpustakaan Kota RadenWorld.
 * Gaya Visual: Chunky Pastel Pixel (Cozycore UI) & Cute Minimalist Clay-Pixel.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  X,
  CheckCircle2,
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
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import {
  ALL_LIBRARY_TOPICS,
  LIBRARY_GRADES,
  LibraryCategory,
  SchoolType,
} from '../data/library/LibraryMasterData';
import {
  detectDiagramType,
  getTopicStoryScenes,
} from './LibraryTopicVisualizer';
import { EducationalVideoCanvas } from './EducationalVideoCanvas';

export interface LibraryMaterialsModalProps {
  isOpen: boolean;
  initialSchoolType?: SchoolType;
  initialGrade?: number;
  onClose: () => void;
  onGainExp?: (amount: number, source: string) => void;
}

type LibraryViewStep = 'select_subject' | 'table_of_contents' | 'material_detail';

interface ISubjectCategoryMeta {
  category: LibraryCategory;
  name: string;
  icon: string;
  tagline: string;
}

const SUBJECT_METAS: ISubjectCategoryMeta[] = [
  {
    category: 'Matematika',
    name: 'Matematika',
    icon: '📐',
    tagline: 'Bilangan Cacah, Aljabar, Geometri, Pecahan & Statistika',
  },
  {
    category: 'IPA / Sains',
    name: 'IPA / Sains',
    icon: '🔬',
    tagline: 'Makhluk Hidup, Fotosintesis, Fisika Gerak, Kimia & Tata Surya',
  },
  {
    category: 'Bahasa Indonesia',
    name: 'Bahasa Indonesia',
    icon: '📚',
    tagline: 'Kosakata, Kalimat Efektif SPOK, Paragraf, Puisi & Karya Sastra',
  },
  {
    category: 'Bahasa Inggris',
    name: 'Bahasa Inggris',
    icon: '🌐',
    tagline: 'Greetings, Grammar, Tenses, Reading Comprehension & Vocabulary',
  },
  {
    category: 'IPS / Sosial',
    name: 'IPS / Sosial',
    icon: '🌍',
    tagline: 'Sejarah Kerajaan Nusantara, Peta Geografi & Kegiatan Ekonomi',
  },
  {
    category: 'Pancasila & PKn',
    name: 'Pancasila & PKn',
    icon: '🇮🇩',
    tagline: 'Makna 5 Sila Garuda, Hak & Kewajiban Warga, Bhinneka Tunggal Ika',
  },
  {
    category: 'Informatika & Seni',
    name: 'Informatika & Seni',
    icon: '💻',
    tagline: 'Berpikir Komputasional, Algoritma, Koding & Seni Budaya',
  },
];

function getTopicDurationSeconds(topicId: string): number {
  let hash = 0;
  for (let i = 0; i < topicId.length; i++) {
    hash = (hash << 5) - hash + topicId.charCodeAt(i);
  }
  const durations = [720, 600, 720, 660, 720, 840, 720];
  return durations[Math.abs(hash) % durations.length];
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const LibraryMaterialsModal: React.FC<LibraryMaterialsModalProps> = ({
  isOpen,
  initialSchoolType = 'sd',
  initialGrade = 1,
  onClose,
  onGainExp,
}) => {
  const sound = SoundManager.getInstance();

  const [viewStep, setViewStep] = useState<LibraryViewStep>('select_subject');
  const [activeSchool, setActiveSchool] = useState<SchoolType>(initialSchoolType);
  const [activeGradeKey, setActiveGradeKey] = useState<string>('sd-1');
  const [selectedSubjectCategory, setSelectedSubjectCategory] =
    useState<LibraryCategory>('Matematika');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [readTopics, setReadTopics] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('raden_library_read_topics');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const [playbackTime, setPlaybackTime] = useState<number>(80);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeSceneStep, setActiveSceneStep] = useState<number>(0);
  const scrubberTrackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const [currentDescPage, setCurrentDescPage] = useState<number>(1);
  const totalDescPages = 3;

  useEffect(() => {
    if (isOpen) {
      const school = initialSchoolType || 'sd';
      setActiveSchool(school);
      const grades = LIBRARY_GRADES[school];
      const targetNumeric =
        initialGrade || (school === 'sd' ? 1 : school === 'smp' ? 7 : 10);
      const matched =
        grades.find((g) => g.numericGrade === targetNumeric) || grades[0];
      setActiveGradeKey(matched.key);
      setViewStep('select_subject');
      setSelectedSubjectCategory('Matematika');
      setSearchQuery('');
      setPlaybackTime(80);
      setIsPlaying(false);
      setCurrentDescPage(1);
    }
  }, [isOpen, initialSchoolType, initialGrade]);

  // Keyboard Escape handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }
      if (e.key === 'Escape') {
        sound.playClick();
        if (viewStep === 'material_detail') {
          setIsPlaying(false);
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

  const currentGrades = useMemo(() => {
    return LIBRARY_GRADES[activeSchool] || LIBRARY_GRADES.sd;
  }, [activeSchool]);

  const activeGradeLabel = useMemo(() => {
    const found = currentGrades.find((g) => g.key === activeGradeKey);
    return found ? found.label : 'Kelas 1 SD';
  }, [currentGrades, activeGradeKey]);

  const currentSubjectTopics = useMemo(() => {
    return ALL_LIBRARY_TOPICS.filter((t) => {
      const matchSchool = t.schoolType === activeSchool;
      const matchGrade = t.gradeKey === activeGradeKey;
      const matchSubject = t.subjectCategory === selectedSubjectCategory;
      return matchSchool && matchGrade && matchSubject;
    });
  }, [activeSchool, activeGradeKey, selectedSubjectCategory]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_LIBRARY_TOPICS.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        (item.keyFormulaOrConcept || '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const activeTopic = useMemo(() => {
    if (!selectedTopicId) return currentSubjectTopics[0] || null;
    return (
      ALL_LIBRARY_TOPICS.find((t) => t.id === selectedTopicId) ||
      currentSubjectTopics[0] ||
      null
    );
  }, [selectedTopicId, currentSubjectTopics]);

  const totalDuration = useMemo(() => {
    if (!activeTopic) return 720;
    return getTopicDurationSeconds(activeTopic.id);
  }, [activeTopic]);

  const diagramType = useMemo(() => {
    if (!activeTopic) return 'mindmap_general';
    return detectDiagramType({
      id: activeTopic.id,
      name: activeTopic.title,
      badge: activeTopic.badge,
      subtitle: activeTopic.summary,
      points: activeTopic.points,
    });
  }, [activeTopic]);

  const storyScenes = useMemo(() => {
    return getTopicStoryScenes(diagramType);
  }, [diagramType]);

  useEffect(() => {
    if (storyScenes.length > 0) {
      const sceneIndex = Math.min(
        storyScenes.length - 1,
        Math.floor((playbackTime / totalDuration) * storyScenes.length)
      );
      setActiveSceneStep(sceneIndex);
    }
  }, [playbackTime, totalDuration, storyScenes.length]);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(250, 1000 / playbackSpeed);
    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed]);

  const handleSeekFromClientX = useCallback(
    (clientX: number) => {
      if (!scrubberTrackRef.current) return;
      const rect = scrubberTrackRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = Math.round(ratio * totalDuration);
      setPlaybackTime(targetTime);
    },
    [totalDuration]
  );

  useEffect(() => {
    if (!isScrubbing) return;

    const handlePointerMove = (e: PointerEvent) => {
      handleSeekFromClientX(e.clientX);
    };

    const handlePointerUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isScrubbing, handleSeekFromClientX]);

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
    } catch (e) {}

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
      text: `📖 Kamu telah tuntas mempelajari materi "${activeTopic.title}" (${activeTopic.gradeName})! (+${expBonus} EXP)`,
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
      setPlaybackTime(0);
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
      setPlaybackTime(0);
      setCurrentDescPage(1);
    }
  }, [currentTopicIndex, currentSubjectTopics, sound]);

  if (!isOpen) return null;

  const isRead = activeTopic ? readTopics.has(activeTopic.id) : false;
  const currentScene = storyScenes[activeSceneStep] || storyScenes[0];
  const scrubberPercent = Math.min(
    100,
    Math.max(0, (playbackTime / totalDuration) * 100)
  );

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
        {/* LANGKAH 3: DETAIL MATERI & VIDEO ANIMASI (RESPONSIF PORTRAIT/LANDSCAPE) */}
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
                  <span>{isPlaying ? '▶ PUTAR' : '⏸ JEDA'}</span>
                  <span>• 60FPS</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Pengubah Kecepatan 1x / 1.5x / 2x */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    setPlaybackSpeed((prev) =>
                      prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1
                    );
                  }}
                  className="px-2 py-1 clay-btn-secondary text-black text-[11px] font-bold"
                  title="Kecepatan Putar Video"
                >
                  {playbackSpeed}x
                </button>

                {/* Tombol Kembali ke Daftar Isi */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsPlaying(false);
                    setViewStep('table_of_contents');
                  }}
                  className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center"
                  title="Kembali ke Daftar Isi (X)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split View: Atas/Bawah di Portrait, Kiri/Kanan di Desktop & Mobile Landscape */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row landscape:flex-row overflow-hidden">
              {/* 3A. VIDEO ANIMASI & VISUAL PLAYER */}
              <div className="relative basis-[44%] lg:basis-1/2 landscape:basis-1/2 min-h-[180px] lg:min-h-0 landscape:min-h-0 bg-[#23160C] border-b-2 lg:border-b-0 lg:border-r-2 landscape:border-b-0 landscape:border-r-2 border-[#5C3A21] flex flex-col justify-between overflow-hidden shrink-0">
                {/* Area Tengah: Pemutar Animasi Edukasi 60 FPS */}
                <div
                  className="relative flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 cursor-pointer overflow-hidden"
                  onClick={() => {
                    sound.playClick();
                    setIsPlaying((prev) => !prev);
                  }}
                  title={isPlaying ? 'Klik untuk Jeda Video' : 'Klik untuk Putar Video'}
                >
                  <div className="w-full h-full max-w-2xl flex items-center justify-center">
                    <EducationalVideoCanvas
                      type={diagramType}
                      step={activeSceneStep}
                      isPlaying={isPlaying}
                      playbackSpeed={playbackSpeed}
                    />
                  </div>

                  {/* Subtitle / Babak Cerita Narasi Singkat */}
                  {currentScene && (
                    <div className="absolute top-2 inset-x-2 max-w-lg mx-auto pointer-events-none">
                      <div className="clay-card px-2.5 py-1 text-center">
                        <span className="text-[10px] font-bold text-black mr-1.5 uppercase">
                          {currentScene.chapter}: {currentScene.title}
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-black line-clamp-1">
                          {currentScene.narration}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Indikator Tombol Play Saat Jeda */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-4 py-2 clay-btn-primary text-black flex items-center gap-2">
                        <Play className="w-4 h-4 text-black fill-black" />
                        <span className="text-black text-xs font-bold uppercase">
                          Putar Video Animasi
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bawah Layar Video: Scrubber Bar + Kontrol */}
                <div className="relative z-20 px-3 sm:px-4 py-2 bg-[#FFF8EA] border-t-2 border-[#5C3A21] flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        setIsPlaying((prev) => !prev);
                      }}
                      className="p-1.5 clay-btn-primary text-black"
                      title={isPlaying ? 'Jeda Video' : 'Putar Video'}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-black text-black" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black text-black" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        setPlaybackTime((p) => Math.max(0, p - 10));
                      }}
                      className="hidden sm:inline-block px-1.5 py-1 clay-btn-neutral text-black text-[10px] font-bold"
                      title="Mundur 10 Detik"
                    >
                      -10s
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        setPlaybackTime((p) => Math.min(totalDuration, p + 10));
                      }}
                      className="hidden sm:inline-block px-1.5 py-1 clay-btn-neutral text-black text-[10px] font-bold"
                      title="Maju 10 Detik"
                    >
                      +10s
                    </button>
                  </div>

                  {/* Garis Scrubber */}
                  <div
                    ref={scrubberTrackRef}
                    onPointerDown={(e) => {
                      setIsScrubbing(true);
                      handleSeekFromClientX(e.clientX);
                    }}
                    className="relative flex-1 h-3 bg-[#FFF8EA] border-2 border-[#5C3A21] rounded-full cursor-pointer"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-[#FFAE6D] rounded-full pointer-events-none"
                      style={{ width: `${scrubberPercent}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#A8E6CF] rounded-full border-2 border-[#5C3A21] -translate-x-1/2 cursor-grab active:cursor-grabbing"
                      style={{ left: `${scrubberPercent}%` }}
                    />
                  </div>

                  <div className="text-black text-[11px] sm:text-xs font-bold tracking-wider shrink-0 select-none">
                    {formatTime(playbackTime)}/{formatTime(totalDuration)}
                  </div>
                </div>
              </div>

              {/* 3B. PENJELASAN DESKRIPSI */}
              <div className="relative flex-1 min-h-0 bg-[#FFF8EA] text-black p-3.5 sm:p-5 landscape:max-md:p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b-2 border-[#5C3A21] pb-2 flex-wrap">
                    <h3 className="text-black font-bold text-sm sm:text-lg">
                      Penjelasan Deskripsi
                    </h3>

                    <span className="px-2 py-0.5 clay-badge-secondary text-black text-[10px] sm:text-xs font-bold">
                      {activeTopic.subjectName} • {activeTopic.badge}
                    </span>
                  </div>

                  {/* HALAMAN 1 DARI 3 */}
                  {currentDescPage === 1 && (
                    <div className="space-y-2.5 text-black">
                      <p className="text-xs sm:text-sm leading-relaxed font-bold text-black clay-card p-3">
                        📖 {activeTopic.summary}
                      </p>

                      <div className="space-y-1.5">
                        <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black">
                          Pokok Pembahasan Ilmiah:
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
                              <span className="text-black">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* HALAMAN 2 DARI 3 */}
                  {currentDescPage === 2 && (
                    <div className="space-y-2.5 text-black">
                      {activeTopic.keyFormulaOrConcept && (
                        <div className="p-3 clay-card-primary text-black flex items-center gap-2.5 flex-wrap">
                          <span className="px-2 py-0.5 clay-badge-cocoa text-white text-[10px] font-bold uppercase shrink-0">
                            RUMUS KUNCI
                          </span>
                          <code className="text-xs font-bold text-black overflow-x-auto">
                            {activeTopic.keyFormulaOrConcept}
                          </code>
                        </div>
                      )}

                      <div className="p-3 clay-card space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 clay-badge-secondary text-black text-[10px] font-bold uppercase">
                            SOAL KUIS SEKOLAH
                          </span>
                          <span className="text-[11px] font-bold text-black">
                            Materi ini diujikan di Kuis Kelas!
                          </span>
                        </div>

                        <div className="text-xs font-bold text-black clay-badge-neutral p-2.5">
                          ❓ "{activeTopic.quiz.question}"
                        </div>

                        <div className="text-xs text-black clay-card-secondary p-2.5 space-y-1">
                          <div className="font-bold text-black">
                            Kunci Jawaban Benar:{' '}
                            {activeTopic.quiz.options[activeTopic.quiz.answerIndex]}
                          </div>
                          <div className="text-black leading-relaxed">
                            💡 <strong>Penjelasan Ujian:</strong>{' '}
                            {activeTopic.quiz.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HALAMAN 3 DARI 3 */}
                  {currentDescPage === 3 && (
                    <div className="space-y-2.5 text-black">
                      <div className="p-3.5 clay-card-secondary space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 clay-badge-cocoa text-white text-[10px] font-bold uppercase">
                            FAKTA ILMIAH DUNIA
                          </span>
                          <span className="text-xs font-bold text-black">
                            Tahukah Kamu?
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-black">
                          ✨ {activeTopic.funFact}
                        </p>
                      </div>

                      <div className="p-3 clay-card text-xs leading-relaxed text-black">
                        🌟 <strong>Penerapan di Dunia Nyata & RadenWorld:</strong>{' '}
                        Pemahaman materi ini membantu karaktermu menyelesaikan ujian sekolah dengan nilai sempurna serta mengumpulkan poin EXP warga!
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Navigasi Bab & Halaman */}
                <div className="pt-3 mt-3 border-t-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleMarkAsRead}
                      className={`px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5 ${
                        isRead
                          ? 'clay-badge-secondary text-black'
                          : 'clay-btn-primary text-black'
                      }`}
                    >
                      {isRead ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>Selesai (+EXP)</span>
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

                    {currentTopicIndex > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevTopic}
                        className="px-2.5 py-1.5 clay-btn-neutral text-black text-[11px] font-bold"
                        title="Bab Sebelumnya"
                      >
                        ◀ Bab
                      </button>
                    )}

                    {currentTopicIndex < currentSubjectTopics.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNextTopic}
                        className="px-2.5 py-1.5 clay-btn-neutral text-black text-[11px] font-bold"
                        title="Bab Selanjutnya"
                      >
                        Bab ▶
                      </button>
                    )}
                  </div>

                  {/* Pagination Halaman */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentDescPage <= 1}
                      onClick={() => {
                        sound.playClick();
                        setCurrentDescPage((p) => Math.max(1, p - 1));
                      }}
                      className="p-1.5 clay-btn-neutral text-black"
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
                      className="p-1.5 clay-btn-neutral text-black"
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
        {/* LANGKAH 1 & LANGKAH 2: PILIH MATA PELAJARAN & DAFTAR ISI             */}
        {/* ==================================================================== */}
        {viewStep !== 'material_detail' && (
          <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-[#FFF8EA]">
            {/* Header Utama Perpustakaan Kota */}
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
                      240 TOPIK KURIKULUM
                    </span>
                  </div>
                  <p className="text-[11px] text-black hidden sm:block truncate">
                    Materi Pendidikan Riil Terintegrasi Bank Soal Kuis Ujian Sekolah
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 clay-badge-neutral text-xs text-black font-bold">
                  <BookMarked className="w-3.5 h-3.5 text-black" />
                  <span>
                    Selesai: <strong>{readTopics.size}</strong> / 240
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
              {/* Tab Sekolah: SD, SMP, SMA */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSchool('sd');
                    setActiveGradeKey('sd-1');
                  }}
                  className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1 ${
                    activeSchool === 'sd'
                      ? 'clay-btn-primary text-black'
                      : 'clay-btn-neutral text-black'
                  }`}
                >
                  <span>🎒</span> SD (1-6)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSchool('smp');
                    setActiveGradeKey('smp-7');
                  }}
                  className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1 ${
                    activeSchool === 'smp'
                      ? 'clay-btn-primary text-black'
                      : 'clay-btn-neutral text-black'
                  }`}
                >
                  <span>🏫</span> SMP (7-9)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSchool('sma');
                    setActiveGradeKey('sma-10');
                  }}
                  className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1 ${
                    activeSchool === 'sma'
                      ? 'clay-btn-primary text-black'
                      : 'clay-btn-neutral text-black'
                  }`}
                >
                  <span>🏛️</span> SMA (10-12)
                </button>
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

              {/* Pencarian Cepat */}
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
                    Hasil Pencarian "{searchQuery}" ({searchResults.length} Topik)
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
                      setSelectedSubjectCategory(topic.subjectCategory);
                      setSelectedTopicId(topic.id);
                      setSearchQuery('');
                      setPlaybackTime(80);
                      setIsPlaying(true);
                      setCurrentDescPage(1);
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
                      Buka ▶
                    </span>
                  </div>
                ))}

                {searchResults.length === 0 && (
                  <div className="p-6 text-center clay-card text-black text-xs font-bold">
                    Tidak ditemukan topik yang cocok dengan "{searchQuery}".
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ================================================================ */}
                {/* LANGKAH 1: PILIH MATA PELAJARAN                                   */}
                {/* ================================================================ */}
                {viewStep === 'select_subject' && (
                  <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar landscape-compact-body space-y-4">
                    <div>
                      <h3 className="text-sm sm:text-lg font-bold text-black flex items-center gap-2 flex-wrap">
                        <span>1. PILIH MATA PELAJARAN</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 clay-badge-secondary text-black">
                          {activeGradeLabel}
                        </span>
                      </h3>
                      <p className="text-xs text-black mt-0.5">
                        Pilih salah satu mata pelajaran di bawah untuk membuka Daftar Isi bab kurikulum.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 landscape:grid-cols-2 gap-3">
                      {SUBJECT_METAS.map((subj) => {
                        const topicCount = ALL_LIBRARY_TOPICS.filter(
                          (t) =>
                            t.schoolType === activeSchool &&
                            t.gradeKey === activeGradeKey &&
                            t.subjectCategory === subj.category
                        ).length;

                        return (
                          <button
                            key={subj.category}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setSelectedSubjectCategory(subj.category);
                              setViewStep('table_of_contents');
                            }}
                            className="p-3.5 sm:p-4 clay-btn-neutral text-black text-left flex flex-col justify-between min-h-[132px]"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <span className="w-10 h-10 clay-badge-primary flex items-center justify-center text-2xl shrink-0">
                                  {subj.icon}
                                </span>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 clay-badge-secondary text-black">
                                  {topicCount} Bab Materi
                                </span>
                              </div>

                              <h4 className="text-sm sm:text-base font-bold text-black">
                                {subj.name}
                              </h4>

                              <p className="text-[11px] sm:text-xs text-black line-clamp-2 mt-1 leading-relaxed">
                                {subj.tagline}
                              </p>
                            </div>

                            <div className="pt-2.5 mt-2 border-t-2 border-[#5C3A21] flex items-center justify-between text-xs font-bold text-black w-full">
                              <span>Buka Daftar Isi</span>
                              <ChevronRight className="w-4 h-4 text-black" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ================================================================ */}
                {/* LANGKAH 2: DAFTAR ISI TIAP JUDUL                                 */}
                {/* ================================================================ */}
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
                          <span>Ganti Mapel</span>
                        </button>

                        <div>
                          <h3 className="text-sm sm:text-lg font-bold text-black">
                            2. DAFTAR ISI: {selectedSubjectCategory}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-black font-bold">
                            {activeGradeLabel} • {currentSubjectTopics.length} Bab Kurikulum
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {currentSubjectTopics.map((topic, idx) => {
                        const hasRead = readTopics.has(topic.id);
                        const durationSec = getTopicDurationSeconds(topic.id);

                        return (
                          <div
                            key={topic.id}
                            onClick={() => {
                              sound.playClick();
                              setSelectedTopicId(topic.id);
                              setPlaybackTime(80);
                              setIsPlaying(true);
                              setCurrentDescPage(1);
                              setViewStep('material_detail');
                            }}
                            className="p-3.5 clay-card cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 clay-badge-primary flex items-center justify-center font-bold text-xs text-black shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </div>

                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h4 className="text-xs sm:text-sm font-bold text-black">
                                    {topic.title}
                                  </h4>
                                  <span className="px-2 py-0.5 clay-badge-neutral text-black text-[10px] font-bold">
                                    {topic.badge}
                                  </span>
                                  {hasRead && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 clay-badge-secondary text-[10px] text-black font-bold">
                                      <CheckCircle2 className="w-3 h-3 text-black" />
                                      <span>Tuntas</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] sm:text-xs text-black line-clamp-1">
                                  {topic.summary}
                                </p>

                                <div className="flex items-center gap-1.5 text-[11px] text-black">
                                  <span className="font-bold shrink-0">🎯 Kuis:</span>
                                  <span className="truncate max-w-md">
                                    "{topic.quiz.question}"
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t-2 sm:border-t-0 border-[#5C3A21]">
                              <div className="flex items-center gap-1 text-xs text-black font-bold clay-badge-neutral px-2.5 py-1">
                                <Clock className="w-3.5 h-3.5 text-black" />
                                <span>{formatTime(durationSec)}</span>
                              </div>

                              <button
                                type="button"
                                className="px-3 py-1.5 clay-btn-primary text-black text-xs font-bold flex items-center gap-1.5"
                              >
                                <span>Pelajari</span>
                                <Play className="w-3 h-3 fill-black text-black" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {currentSubjectTopics.length === 0 && (
                        <div className="p-6 text-center clay-card text-black text-xs font-bold">
                          Belum ada bab kurikulum yang terdaftar untuk {selectedSubjectCategory} di {activeGradeLabel}.
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
