/**
 * ============================================================================
 * FILE: resources/js/game/ui/LibraryMaterialsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Ensiklopedia & Visual Edukasi Perpustakaan Kota RadenWorld.
 * Alur 3 Langkah Pembelajaran:
 * 1. PILIH MATA PELAJARAN (Matematika, IPA, B. Indo, B. Inggris, IPS, PKn, Informatika)
 * 2. DAFTAR ISI TIAP JUDUL (Daftar bab kurikulum, ringkasan, durasi video, korelasi kuis)
 * 3. DETAIL MATERI & VIDEO ANIMASI (Persis 1:1 sesuai wireframe pengguna:
 *    - Bagian Atas: Video Animasi & Visual Player Latar Hitam Pekat + Scrubber Bar + Durasi 01:20/12:00
 *    - Bagian Bawah: Penjelasan Deskripsi Latar Putih Bersih + Ilmu Nyata + Halaman 1/100)
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Search,
  HelpCircle,
  Check,
  BookMarked,
  Layers,
  ArrowLeft,
  Play,
  Pause,
  Clock,
  GraduationCap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import {
  ALL_LIBRARY_TOPICS,
  LIBRARY_GRADES,
  LIBRARY_CATEGORIES,
  LibraryCategory,
  SchoolType,
  ILibraryTopicItem,
} from '../data/library/LibraryMasterData';
import {
  detectDiagramType,
  renderDiagramSvg,
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
  color: string;
  badgeBg: string;
  borderColor: string;
  gradientBg: string;
  tagline: string;
}

const SUBJECT_METAS: ISubjectCategoryMeta[] = [
  {
    category: 'Matematika',
    name: 'Matematika',
    icon: '📐',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    gradientBg: 'from-blue-950/70 via-neutral-900 to-neutral-950',
    tagline: 'Bilangan Cacah, Aljabar, Geometri, Pecahan & Statistika',
  },
  {
    category: 'IPA / Sains',
    name: 'IPA / Sains',
    icon: '🔬',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    gradientBg: 'from-emerald-950/70 via-neutral-900 to-neutral-950',
    tagline: 'Makhluk Hidup, Fotosintesis, Fisika Gerak, Kimia & Tata Surya',
  },
  {
    category: 'Bahasa Indonesia',
    name: 'Bahasa Indonesia',
    icon: '📚',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    gradientBg: 'from-amber-950/70 via-neutral-900 to-neutral-950',
    tagline: 'Kosakata, Kalimat Efektif SPOK, Paragraf, Puisi & Karya Sastra',
  },
  {
    category: 'Bahasa Inggris',
    name: 'Bahasa Inggris',
    icon: '🌐',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    gradientBg: 'from-sky-950/70 via-neutral-900 to-neutral-950',
    tagline: 'Greetings, Grammar, Tenses, Reading Comprehension & Vocabulary',
  },
  {
    category: 'IPS / Sosial',
    name: 'IPS / Sosial',
    icon: '🌍',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    gradientBg: 'from-rose-950/70 via-neutral-900 to-neutral-950',
    tagline: 'Sejarah Kerajaan Nusantara, Peta Geografi & Kegiatan Ekonomi',
  },
  {
    category: 'Pancasila & PKn',
    name: 'Pancasila & PKn',
    icon: '🇮🇩',
    color: 'text-red-400',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    borderColor: 'border-red-500/30 hover:border-red-400',
    gradientBg: 'from-red-950/70 via-neutral-900 to-neutral-950',
    tagline: 'Makna 5 Sila Garuda, Hak & Kewajiban Warga, Bhinneka Tunggal Ika',
  },
  {
    category: 'Informatika & Seni',
    name: 'Informatika & Seni',
    icon: '💻',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    gradientBg: 'from-purple-950/70 via-neutral-900 to-neutral-950',
    tagline: 'Berpikir Komputasional, Algoritma, Koding & Seni Budaya',
  },
];

/**
 * Durasi Video Animasi per Topik (Standar Kurikulum 12:00 = 720 detik)
 */
function getTopicDurationSeconds(topicId: string): number {
  let hash = 0;
  for (let i = 0; i < topicId.length; i++) {
    hash = (hash << 5) - hash + topicId.charCodeAt(i);
  }
  // Menghasilkan durasi 12:00 (720s) atau variasi sekitarnya (10:00 - 14:00)
  const durations = [720, 600, 720, 660, 720, 840, 720];
  return durations[Math.abs(hash) % durations.length];
}

/**
 * Format detik ke MM:SS (Contoh: 80 -> "01:20", 720 -> "12:00")
 */
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

  // Step Navigasi: 'select_subject' | 'table_of_contents' | 'material_detail'
  const [viewStep, setViewStep] = useState<LibraryViewStep>('select_subject');

  // Filter Jenjang & Tingkat Kelas
  const [activeSchool, setActiveSchool] = useState<SchoolType>(initialSchoolType);
  const [activeGradeKey, setActiveGradeKey] = useState<string>('sd-1');
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<LibraryCategory>('Matematika');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode Layar Penuh (Toggle via ikon [ ] 4-sudut)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Status Membaca (Disimpan di localStorage)
  const [readTopics, setReadTopics] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('raden_library_read_topics');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // State Pemutar Video Animasi (Bagian Atas Latar Hitam)
  const [playbackTime, setPlaybackTime] = useState<number>(80); // Default 01:20 sesuai wireframe user!
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 1.5x, 2x
  const [activeSceneStep, setActiveSceneStep] = useState<number>(0);
  const scrubberTrackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  // State Halaman Penjelasan Deskripsi (Bagian Bawah Latar Putih)
  // Total 3 halaman lengkap materi edukasi riil: Halaman 1/3, 2/3, 3/3
  const [currentDescPage, setCurrentDescPage] = useState<number>(1);
  const totalDescPages = 3;

  // Inisialisasi saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const school = initialSchoolType || 'sd';
      setActiveSchool(school);
      const grades = LIBRARY_GRADES[school];
      const targetNumeric = initialGrade || (school === 'sd' ? 1 : school === 'smp' ? 7 : 10);
      const matched = grades.find((g) => g.numericGrade === targetNumeric) || grades[0];
      setActiveGradeKey(matched.key);
      setViewStep('select_subject');
      setSelectedSubjectCategory('Matematika');
      setPlaybackTime(80); // 01:20
      setIsPlaying(false);
      setCurrentDescPage(1);
    }
  }, [isOpen, initialSchoolType, initialGrade]);

  // Daftar kelas yang tersedia untuk jenjang yang aktif
  const currentGrades = useMemo(() => {
    return LIBRARY_GRADES[activeSchool] || LIBRARY_GRADES.sd;
  }, [activeSchool]);

  // Label Kelas Aktif (Contoh: "Kelas 1 SD")
  const activeGradeLabel = useMemo(() => {
    const found = currentGrades.find((g) => g.key === activeGradeKey);
    return found ? found.label : 'Kelas 1 SD';
  }, [currentGrades, activeGradeKey]);

  // Topik yang tersedia untuk jenjang, kelas & mata pelajaran yang dipilih
  const currentSubjectTopics = useMemo(() => {
    return ALL_LIBRARY_TOPICS.filter((t) => {
      const matchSchool = t.schoolType === activeSchool;
      const matchGrade = t.gradeKey === activeGradeKey;
      const matchSubject = t.subjectCategory === selectedSubjectCategory;
      return matchSchool && matchGrade && matchSubject;
    });
  }, [activeSchool, activeGradeKey, selectedSubjectCategory]);

  // Pencarian bebas di seluruh topik kurikulum
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

  // Topik aktif yang sedang dibuka pada Step 3
  const activeTopic = useMemo(() => {
    if (!selectedTopicId) return currentSubjectTopics[0] || null;
    return ALL_LIBRARY_TOPICS.find((t) => t.id === selectedTopicId) || currentSubjectTopics[0] || null;
  }, [selectedTopicId, currentSubjectTopics]);

  // Total durasi video topik aktif (Default 720s = 12:00)
  const totalDuration = useMemo(() => {
    if (!activeTopic) return 720;
    return getTopicDurationSeconds(activeTopic.id);
  }, [activeTopic]);

  // Diagram visual SVG yang cocok untuk materi ini
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

  // Babak cerita animasi untuk diagram aktif
  const storyScenes = useMemo(() => {
    return getTopicStoryScenes(diagramType);
  }, [diagramType]);

  // Sinkronisasi babak cerita dengan timeline scrubber video
  useEffect(() => {
    if (storyScenes.length > 0) {
      const sceneIndex = Math.min(
        storyScenes.length - 1,
        Math.floor((playbackTime / totalDuration) * storyScenes.length)
      );
      setActiveSceneStep(sceneIndex);
    }
  }, [playbackTime, totalDuration, storyScenes.length]);

  // Timer loop pemutar video saat tombol putar aktif
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

  // Handler seek posisi scrubber video
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

  // Pointer drag event listener untuk scrubber
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

  // Handler Tandai Selesai Belajar (+EXP)
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
      localStorage.setItem('raden_library_read_topics', JSON.stringify(Array.from(nextSet)));
    } catch (e) {}

    const expBonus = activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20;

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

  // Navigasi Topik Sebelumnya & Selanjutnya dalam Daftar Isi
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
    if (currentTopicIndex >= 0 && currentTopicIndex < currentSubjectTopics.length - 1) {
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
  const scrubberPercent = Math.min(100, Math.max(0, (playbackTime / totalDuration) * 100));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0 bg-black' : 'p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md'
      } animate-in fade-in duration-200`}
    >
      <div
        className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none border-0'
            : 'w-full max-w-6xl h-[94vh] max-h-[880px] rounded-2xl border border-neutral-700 shadow-2xl bg-neutral-950 text-neutral-100 font-sans'
        }`}
      >
        {/* ==================================================================== */}
        {/* LANGKAH 3: DETAIL MATERI & VIDEO ANIMASI                            */}
        {/* PERSIS 100% SESUAI WIREFRAME GAMBAR PENGGUNA                        */}
        {/* ==================================================================== */}
        {viewStep === 'material_detail' && activeTopic ? (
          <div className="flex-1 flex flex-col h-full w-full bg-black select-none overflow-hidden font-sans">
            {/* ---------------------------------------------------------------- */}
            {/* 3A. TOP HALF: VIDEO ANIMASI & VISUAL PLAYER (LATAR HITAM PEKAT)  */}
            {/* ---------------------------------------------------------------- */}
            <div className="relative flex-1 bg-black flex flex-col justify-between overflow-hidden min-h-[320px] sm:min-h-[380px]">
              
              {/* Header Atas Wireframe: Ikon [ ] 4-Sudut + "Nama Materi" (Kiri) & Tombol X Tebal (Kanan) */}
              <div className="absolute top-0 inset-x-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/90 via-black/50 to-transparent">
                {/* Kiri: Ikon 4-Sudut Frame [ ] + Judul Materi + Badge Live Animasi */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsFullscreen((prev) => !prev);
                    }}
                    className="p-1 text-white hover:text-amber-400 cursor-pointer active:scale-95 transition-transform"
                    title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                  >
                    {/* SVG Ikon 4-Sudut Frame Sesuai Persis di Wireframe Gambar */}
                    <svg viewBox="0 0 28 28" className="w-6 h-6 sm:w-7 sm:h-7 stroke-white stroke-[3] fill-none">
                      <path d="M4 11V4h7" />
                      <path d="M24 11V4h-7" />
                      <path d="M4 17v7h7" />
                      <path d="M24 17v7h-7" />
                    </svg>
                  </button>

                  <h2 className="text-white text-base sm:text-xl font-bold tracking-wide truncate max-w-[240px] sm:max-w-md">
                    {activeTopic.title}
                  </h2>

                  {/* Badge Live Animasi 60FPS */}
                  <span className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/25 border border-red-500/50 text-[10px] font-black text-red-400 tracking-wider">
                    <span className={`w-2 h-2 rounded-full bg-red-500 ${isPlaying ? 'animate-ping' : ''}`} />
                    LIVE ANIMASI 60FPS
                  </span>
                </div>

                {/* Kanan: Equalizer Suara + Selector Kecepatan + Tombol X Tebal */}
                <div className="flex items-center gap-2.5">
                  {/* Equalizer Bar Berdansa saat Video Dimainkan */}
                  <div className="flex items-end gap-1 h-4 px-2 py-1 bg-white/10 rounded-md border border-white/20">
                    <span className={`w-1 bg-emerald-400 rounded-sm transition-all ${isPlaying ? 'animate-pulse h-3' : 'h-1.5'}`} />
                    <span className={`w-1 bg-emerald-400 rounded-sm transition-all ${isPlaying ? 'animate-pulse h-4' : 'h-2'}`} />
                    <span className={`w-1 bg-emerald-400 rounded-sm transition-all ${isPlaying ? 'animate-pulse h-2' : 'h-1'}`} />
                    <span className={`w-1 bg-emerald-400 rounded-sm transition-all ${isPlaying ? 'animate-pulse h-3.5' : 'h-1.5'}`} />
                  </div>

                  {/* Pengubah Kecepatan 1x / 1.5x / 2x */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      setPlaybackSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
                    }}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold border border-white/20 transition-all cursor-pointer"
                    title="Kecepatan Putar Video"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Tombol X Tebal Menutup / Kembali ke Daftar Isi Sesuai Gambar */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setViewStep('table_of_contents');
                    }}
                    className="p-1 text-white hover:text-rose-400 cursor-pointer active:scale-90 transition-transform"
                    title="Kembali ke Daftar Isi (X)"
                  >
                    <svg viewBox="0 0 28 28" className="w-7 h-7 sm:w-8 sm:h-8 stroke-white stroke-[3.5] stroke-linecap-round stroke-linejoin-round">
                      <line x1="6" y1="6" x2="22" y2="22" />
                      <line x1="6" y1="22" x2="22" y2="6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Area Tengah: Pemutar Animasi Edukasi Berkecepatan Tinggi 60 FPS */}
              <div
                className="relative flex-1 flex items-center justify-center p-2 sm:p-6 cursor-pointer group"
                onClick={() => {
                  sound.playClick();
                  setIsPlaying((prev) => !prev);
                }}
                title={isPlaying ? 'Klik untuk Jeda Video' : 'Klik untuk Putar Video'}
              >
                {/* Mesin Animasi Bergerak Riil 60 FPS */}
                <div className="w-full max-w-3xl max-h-[310px] sm:max-h-[350px] flex items-center justify-center">
                  <EducationalVideoCanvas
                    type={diagramType}
                    step={activeSceneStep}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                  />
                </div>

                {/* Subtitle / Babak Cerita Narasi Singkat */}
                {currentScene && (
                  <div className="absolute top-16 sm:top-14 inset-x-4 max-w-xl mx-auto pointer-events-none">
                    <div className="bg-black/75 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-1.5 text-center shadow-2xl transition-all">
                      <span className="text-[11px] font-extrabold text-amber-400 mr-2 uppercase tracking-wider">
                        {currentScene.chapter}: {currentScene.title}
                      </span>
                      <p className="text-xs text-neutral-100 font-medium line-clamp-2">
                        {currentScene.narration}
                      </p>
                    </div>
                  </div>
                )}

                {/* Indikator Tombol Play Besar Saat Jeda */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="px-5 py-3 rounded-2xl bg-black/60 backdrop-blur-md border-2 border-white/80 flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform">
                      <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                      <span className="text-white text-xs sm:text-sm font-extrabold tracking-wide uppercase">
                        Putar Video Animasi
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bawah Layar Hitam: Scrubber Bar Putih + Tombol Play/Skip + Angka Durasi 01:20/12:00 */}
              <div className="relative z-30 px-4 sm:px-8 py-3 flex items-center gap-3.5 bg-gradient-to-t from-black via-black/85 to-transparent">
                
                {/* Tombol Play/Pause Cepat & Lompat Detik */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      setIsPlaying((prev) => !prev);
                    }}
                    className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white active:scale-95 transition-all cursor-pointer"
                    title={isPlaying ? 'Jeda Video' : 'Putar Video'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      setPlaybackTime((p) => Math.max(0, p - 10));
                    }}
                    className="hidden sm:inline-block px-1.5 py-1 rounded bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-[10px] font-bold cursor-pointer"
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
                    className="hidden sm:inline-block px-1.5 py-1 rounded bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-[10px] font-bold cursor-pointer"
                    title="Maju 10 Detik"
                  >
                    +10s
                  </button>
                </div>

                {/* Garis Scrubber Putih Panjang dengan Knob Bulat Putih Persis di Wireframe */}
                <div
                  ref={scrubberTrackRef}
                  onPointerDown={(e) => {
                    setIsScrubbing(true);
                    handleSeekFromClientX(e.clientX);
                  }}
                  className="relative flex-1 h-1.5 sm:h-2 bg-white/30 rounded-full cursor-pointer py-1"
                >
                  {/* Track yang Sudah Berjalan (Putih Bersih) */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-1 sm:h-1.5 bg-white rounded-full transition-all pointer-events-none"
                    style={{ width: `${scrubberPercent}%` }}
                  />

                  {/* Knob Bulat Putih Scrubber Persis di Wireframe */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-lg border border-black/20 -translate-x-1/2 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                    style={{ left: `${scrubberPercent}%` }}
                  />
                </div>

                {/* Angka Durasi Persis Format Gambar: 01:20/12:00 */}
                <div className="text-white text-xs sm:text-sm font-mono font-bold tracking-wider shrink-0 select-none">
                  {formatTime(playbackTime)}/{formatTime(totalDuration)}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* 3B. BOTTOM HALF: PENJELASAN DESKRIPSI (LATAR PUTIH BERSIH)       */}
            {/* ---------------------------------------------------------------- */}
            <div className="relative flex-1 bg-white text-black p-5 sm:p-8 flex flex-col justify-between overflow-y-auto">
              
              <div className="space-y-3">
                {/* Judul Atas Kiri: Penjelasan Deskripsi (Sesuai Persis di Wireframe) */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                  <h3 className="text-black font-extrabold text-lg sm:text-2xl tracking-tight">
                    Penjelasan Deskripsi
                  </h3>

                  {/* Badge Topik Kurikulum & Kategori Pelajaran */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-bold">
                      {activeTopic.subjectName} • {activeTopic.badge}
                    </span>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* HALAMAN 1 DARI 3: KONSEP DASAR & INTISARI ILMIAH KURIKULUM   */}
                {/* ============================================================ */}
                {currentDescPage === 1 && (
                  <div className="space-y-3 text-neutral-800 animate-in fade-in duration-200">
                    <p className="text-sm sm:text-base leading-relaxed font-medium text-neutral-900 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      📖 {activeTopic.summary}
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-600">
                        Pokok Pembahasan Ilmiah:
                      </h4>
                      <ul className="space-y-2">
                        {activeTopic.points.map((pt, pIdx) => (
                          <li
                            key={pIdx}
                            className="text-xs sm:text-sm leading-relaxed p-2.5 rounded-lg bg-neutral-100/80 border border-neutral-200 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {pIdx + 1}
                            </span>
                            <span className="text-neutral-800 font-medium">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* HALAMAN 2 DARI 3: RUMUS KUNCI & PEMBAHASAN SOAL KUIS SEKOLAH */}
                {/* ============================================================ */}
                {currentDescPage === 2 && (
                  <div className="space-y-3 text-neutral-800 animate-in fade-in duration-200">
                    {/* Kotak Rumus / Formula Kunci */}
                    {activeTopic.keyFormulaOrConcept && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-neutral-900 flex items-center gap-3">
                        <span className="px-2 py-1 rounded bg-amber-200 text-amber-900 text-[11px] font-black uppercase tracking-wider shrink-0">
                          RUMUS KUNCI
                        </span>
                        <code className="text-xs sm:text-sm font-mono font-bold text-amber-950 overflow-x-auto">
                          {activeTopic.keyFormulaOrConcept}
                        </code>
                      </div>
                    )}

                    {/* Materi yang Terhubung Langsung dengan Bank Soal Kuis Sekolah */}
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                          SOAL KUIS SEKOLAH
                        </span>
                        <span className="text-xs font-bold text-neutral-700">
                          Materi ini langsung diujikan di Kuis Ujian Kelas!
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm font-bold text-neutral-900 bg-white p-3 rounded-lg border border-neutral-200">
                        ❓ "{activeTopic.quiz.question}"
                      </div>

                      <div className="text-xs sm:text-sm text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <div className="font-extrabold text-emerald-800 mb-1">
                          Kunci Jawaban Benar: {activeTopic.quiz.options[activeTopic.quiz.answerIndex]}
                        </div>
                        <div className="text-neutral-700 leading-relaxed font-normal">
                          💡 <strong>Penjelasan Ujian:</strong> {activeTopic.quiz.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* HALAMAN 3 DARI 3: FAKTA MENARIK & PENERAPAN NYATA DI DUNIA   */}
                {/* ============================================================ */}
                {currentDescPage === 3 && (
                  <div className="space-y-3 text-neutral-800 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-600 text-white text-[10px] font-extrabold uppercase">
                          FAKTA ILMIAH DUNIA
                        </span>
                        <span className="text-xs font-bold text-sky-900">
                          Tahukah Kamu?
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-sky-950 font-medium">
                        ✨ {activeTopic.funFact}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-xs sm:text-sm leading-relaxed text-neutral-700">
                      🌟 <strong>Penerapan di Dunia Nyata & RadenWorld:</strong> Pemahaman materi ini
                      membantu karaktermu menyelesaikan ujian sekolah dengan nilai sempurna (Grade A)
                      serta mengumpulkan poin EXP untuk menaikkan level reputasi warga di kota!
                    </div>
                  </div>
                )}
              </div>

              {/* Bawah Layar Putih: Tombol EXP / Navigasi Bab & "Halaman 1/100" (Sesuai Persis di Gambar) */}
              <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                {/* Kiri: Tombol Selesai Membaca (+EXP) & Navigasi Bab */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMarkAsRead}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isRead
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-default'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900 active:scale-95'
                    }`}
                  >
                    {isRead ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai Dipelajari (+EXP)</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Tandai Selesai (+{activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20} EXP)</span>
                      </>
                    )}
                  </button>

                  {/* Tombol Bab Sebelumnya / Selanjutnya */}
                  {currentTopicIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevTopic}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium border border-neutral-300 cursor-pointer"
                      title="Bab Sebelumnya"
                    >
                      ◀ Bab Sblm
                    </button>
                  )}

                  {currentTopicIndex < currentSubjectTopics.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNextTopic}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium border border-neutral-300 cursor-pointer"
                      title="Bab Selanjutnya"
                    >
                      Bab Lanjut ▶
                    </button>
                  )}
                </div>

                {/* Kanan Wireframe: Format Teks "Halaman 1/100" dengan Tombol Panah Pagination */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentDescPage <= 1}
                    onClick={() => {
                      sound.playClick();
                      setCurrentDescPage((p) => Math.max(1, p - 1));
                    }}
                    className={`p-1.5 rounded-md border border-neutral-300 text-neutral-700 transition-colors ${
                      currentDescPage <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-neutral-100 cursor-pointer'
                    }`}
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Teks "Halaman X/Y" Persis Gaya Wireframe Pengguna */}
                  <span className="text-black text-xs sm:text-sm font-bold tracking-tight select-none">
                    Halaman {currentDescPage}/{totalDescPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentDescPage >= totalDescPages}
                    onClick={() => {
                      sound.playClick();
                      setCurrentDescPage((p) => Math.min(totalDescPages, p + 1));
                    }}
                    className={`p-1.5 rounded-md border border-neutral-300 text-neutral-700 transition-colors ${
                      currentDescPage >= totalDescPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-neutral-100 cursor-pointer'
                    }`}
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* LANGKAH 1 & LANGKAH 2: PILIH MATA PELAJARAN & DAFTAR ISI TIAP JUDUL  */}
        {/* ==================================================================== */}
        {viewStep !== 'material_detail' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-900 font-sans">
            
            {/* Header Utama Perpustakaan Kota */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-amber-300 tracking-wide font-['Chakra_Petch',sans-serif]">
                      PERPUSTAKAAN KOTA RADENWORLD
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      240 TOPIK KURIKULUM RESMI
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-400">
                    Materi Pendidikan Riil Terintegrasi Bank Soal Kuis Ujian Sekolah
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Indikator Literasi Membaca */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">
                  <BookMarked className="w-4 h-4 text-amber-400" />
                  <span>
                    Selesai:{' '}
                    <strong className="text-amber-300 font-bold">{readTopics.size}</strong> / 240 Topik
                  </span>
                </div>

                {/* Tombol Tutup Modal */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-rose-600 hover:text-white border border-neutral-700 flex items-center justify-center text-neutral-400 transition-colors cursor-pointer"
                  title="Tutup Perpustakaan (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Header: Pemilihan Jenjang (SD, SMP, SMA) & Tingkat Kelas */}
            <div className="px-4 sm:px-6 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              {/* Tab Sekolah: SD, SMP, SMA */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSchool('sd');
                    setActiveGradeKey('sd-1');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSchool === 'sd'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>🔴</span> SD (1-6)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSchool('smp');
                    setActiveGradeKey('smp-7');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSchool === 'smp'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>🔵</span> SMP (7-9)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSchool('sma');
                    setActiveGradeKey('sma-10');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSchool === 'sma'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <span>🟢</span> SMA (10-12)
                </button>
              </div>

              {/* Selector Tingkat Kelas */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-xs font-medium text-neutral-400 mr-1 hidden sm:flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
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
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 font-extrabold shadow-sm'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                      }`}
                    >
                      {gradeInfo.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================================================================ */}
            {/* LANGKAH 1: PILIH MATA PELAJARAN                                   */}
            {/* ================================================================ */}
            {viewStep === 'select_subject' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-100 flex items-center gap-2">
                    <span>1. PILIH MATA PELAJARAN</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeGradeLabel}
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Silakan pilih salah satu mata pelajaran di bawah untuk membuka Daftar Isi bab materi kurikulum.
                  </p>
                </div>

                {/* Grid Kartu Mata Pelajaran */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {SUBJECT_METAS.map((subj) => {
                    // Hitung jumlah topik materi untuk subject ini di kelas aktif
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
                        className={`group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${subj.gradientBg} border ${subj.borderColor} shadow-lg transition-all duration-200 text-left hover:scale-[1.02] hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[150px]`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl sm:text-4xl">{subj.icon}</span>
                            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${subj.badgeBg}`}>
                              {topicCount} Bab Materi
                            </span>
                          </div>

                          <h4 className="text-base sm:text-lg font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                            {subj.name}
                          </h4>

                          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                            {subj.tagline}
                          </p>
                        </div>

                        <div className="pt-3 mt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                          <span>Buka Daftar Isi</span>
                          <ChevronRight className="w-4 h-4 text-amber-400" />
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
                
                {/* Header Navigasi Kembali ke Langkah 1 */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setViewStep('select_subject');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 text-amber-400" />
                      <span>Ganti Mata Pelajaran</span>
                    </button>

                    <div>
                      <h3 className="text-base sm:text-xl font-bold text-neutral-100">
                        2. DAFTAR ISI: {selectedSubjectCategory}
                      </h3>
                      <p className="text-xs text-amber-400 font-medium">
                        {activeGradeLabel} • {currentSubjectTopics.length} Bab Kurikulum Terverifikasi
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-neutral-400 italic">
                    Pilih salah satu bab untuk menonton video animasi & membaca penjelasan visual
                  </span>
                </div>

                {/* List Bab Daftar Isi Materi Sesuai Kurikulum */}
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
                          setPlaybackTime(80); // 01:20
                          setIsPlaying(true);
                          setCurrentDescPage(1);
                          setViewStep('material_detail');
                        }}
                        className="group p-4 sm:p-5 rounded-xl bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-500/60 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Nomor Bab Urut */}
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 group-hover:bg-amber-500 group-hover:text-neutral-950 border border-neutral-700 flex items-center justify-center font-mono font-bold text-sm text-neutral-300 transition-colors shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                                {topic.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-bold">
                                {topic.badge}
                              </span>
                              {hasRead && (
                                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Tuntas</span>
                                </span>
                              )}
                            </div>

                            {/* Penjelasan Singkat */}
                            <p className="text-xs text-neutral-400 line-clamp-1">
                              {topic.summary}
                            </p>

                            {/* Info Keterkaitan Kuis Sekolah */}
                            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 pt-0.5">
                              <span className="font-bold">🎯 Terkait Kuis:</span>
                              <span className="text-neutral-300 italic truncate max-w-md">
                                "{topic.quiz.question}"
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Kanan: Durasi Video & Tombol Mulai Belajar */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-mono bg-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-700">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{formatTime(durationSec)}</span>
                          </div>

                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <span>Pelajari Materi</span>
                            <Play className="w-3 h-3 fill-neutral-950" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {currentSubjectTopics.length === 0 && (
                    <div className="p-8 text-center bg-neutral-950/40 rounded-2xl border border-neutral-800 text-neutral-400 text-sm">
                      Belum ada bab kurikulum yang terdaftar untuk {selectedSubjectCategory} di {activeGradeLabel}.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
