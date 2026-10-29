/**
 * ============================================================================
 * FILE: resources/js/game/ui/LibraryMaterialsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Ensiklopedia & Visual Edukasi Perpustakaan Kota RadenWorld.
 * Menyediakan katalog kurikulum lengkap 240 topik materi untuk setiap jenjang
 * sekolah (SD 1-6, SMP 7-9, SMA 10-12) yang dilengkapi diagram visual animasi,
 * konsep kunci, formula, fakta menarik, serta kuis uji pemahaman (+EXP).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Search,
  HelpCircle,
  Check,
  BookMarked,
  Layers,
  Filter,
  Lightbulb,
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
import { LibraryTopicVisualizer, detectDiagramType } from './LibraryTopicVisualizer';

export interface LibraryMaterialsModalProps {
  isOpen: boolean;
  initialSchoolType?: SchoolType;
  initialGrade?: number;
  onClose: () => void;
  onGainExp?: (amount: number, source: string) => void;
}

export const LibraryMaterialsModal: React.FC<LibraryMaterialsModalProps> = ({
  isOpen,
  initialSchoolType = 'sd',
  initialGrade = 1,
  onClose,
  onGainExp,
}) => {
  const sound = SoundManager.getInstance();

  // State Jenjang, Kelas & Kategori
  const [activeSchool, setActiveSchool] = useState<SchoolType>(initialSchoolType);
  const [activeGradeKey, setActiveGradeKey] = useState<string>('sd-1');
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('Semua');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Gamifikasi & Status Membaca (Disimpan di localStorage)
  const [readTopics, setReadTopics] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('raden_library_read_topics');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // State Kuis Mini Uji Pemahaman Cepat
  const [showQuickQuiz, setShowQuickQuiz] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState<boolean>(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean>(false);

  // Inisialisasi saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const school = initialSchoolType || 'sd';
      setActiveSchool(school);
      const grades = LIBRARY_GRADES[school];
      const targetNumeric = initialGrade || (school === 'sd' ? 1 : school === 'smp' ? 7 : 10);
      const matched = grades.find((g) => g.numericGrade === targetNumeric) || grades[0];
      setActiveGradeKey(matched.key);
      setActiveCategory('Semua');
      setShowQuickQuiz(false);
      setSelectedOption(null);
      setIsQuizAnswered(false);
    }
  }, [isOpen, initialSchoolType, initialGrade]);

  // Daftar kelas yang tersedia untuk jenjang yang aktif
  const currentGrades = useMemo(() => {
    return LIBRARY_GRADES[activeSchool] || LIBRARY_GRADES.sd;
  }, [activeSchool]);

  // Filter topik sesuai jenjang, kelas, kategori, dan query pencarian
  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return ALL_LIBRARY_TOPICS.filter((item) => {
      // Jika ada pencarian teks bebas yang spesifik, cari di seluruh topik
      if (q.length > 2) {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchSubject = item.subjectName.toLowerCase().includes(q);
        const matchPoints = item.points.some((p) => p.toLowerCase().includes(q));
        const matchBadge = item.badge.toLowerCase().includes(q);
        const matchFormula = (item.keyFormulaOrConcept || '').toLowerCase().includes(q);

        if (!matchTitle && !matchSummary && !matchSubject && !matchPoints && !matchBadge && !matchFormula) {
          return false;
        }

        // Jika jenjang disaring manual, hormati pilihan sekolah
        if (activeSchool && item.schoolType !== activeSchool) return false;
        if (activeCategory !== 'Semua' && item.subjectCategory !== activeCategory) return false;
        return true;
      }

      // Filter default berbasis jenjang dan kelas yang dipilih
      if (item.schoolType !== activeSchool) return false;
      if (item.gradeKey !== activeGradeKey) return false;
      if (activeCategory !== 'Semua' && item.subjectCategory !== activeCategory) return false;

      if (q) {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchSubject = item.subjectName.toLowerCase().includes(q);
        return matchTitle || matchSummary || matchSubject;
      }

      return true;
    });
  }, [activeSchool, activeGradeKey, activeCategory, searchQuery]);

  // Topik yang sedang aktif dibaca
  const activeTopic = useMemo(() => {
    if (!filteredTopics.length) return null;
    const found = filteredTopics.find((t) => t.id === selectedTopicId);
    return found || filteredTopics[0];
  }, [filteredTopics, selectedTopicId]);

  // Sinkronkan selectedTopicId saat filter berubah
  useEffect(() => {
    if (filteredTopics.length > 0 && (!selectedTopicId || !filteredTopics.some((t) => t.id === selectedTopicId))) {
      setSelectedTopicId(filteredTopics[0].id);
      setShowQuickQuiz(false);
      setSelectedOption(null);
      setIsQuizAnswered(false);
    }
  }, [filteredTopics, selectedTopicId]);

  // Handler Tandai Selesai Membaca (+EXP)
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
      onGainExp(expBonus, `Membaca Ensiklopedia: ${activeTopic.title}`);
    } else {
      EventBus.emit('gain-exp', { amount: expBonus, source: `Membaca Ensiklopedia: ${activeTopic.title}` });
    }

    EventBus.emit('new-chat-message', {
      id: `lib_read_${Date.now()}`,
      sender: 'PERPUSTAKAAN KOTA',
      text: `📖 Kamu telah tuntas membaca materi "${activeTopic.title}" (${activeTopic.gradeName})! (+${expBonus} EXP)`,
      timestamp: Date.now(),
      isSystem: true,
    });
  }, [activeTopic, readTopics, activeSchool, sound, onGainExp]);

  // Handler Jawab Kuis Mini Uji Pemahaman
  const handleAnswerQuiz = useCallback(
    (optIdx: number) => {
      if (isQuizAnswered || !activeTopic) return;
      setSelectedOption(optIdx);
      setIsQuizAnswered(true);

      const isCorrect = optIdx === activeTopic.quiz.answerIndex;
      setIsQuizCorrect(isCorrect);

      if (isCorrect) {
        sound.playSuccess();
        const quizExp = 15;
        if (onGainExp) {
          onGainExp(quizExp, `Kuis Bacaan: ${activeTopic.title}`);
        } else {
          EventBus.emit('gain-exp', { amount: quizExp, source: `Kuis Bacaan: ${activeTopic.title}` });
        }
      } else {
        sound.playClick();
      }
    },
    [isQuizAnswered, activeTopic, sound, onGainExp]
  );

  if (!isOpen) return null;

  const isRead = activeTopic ? readTopics.has(activeTopic.id) : false;
  const diagramType = activeTopic
    ? detectDiagramType({
        id: activeTopic.id,
        name: activeTopic.title,
        badge: activeTopic.badge,
        subtitle: activeTopic.summary,
        points: activeTopic.points,
      })
    : 'mindmap_general';

  // Tema Warna Berdasarkan Jenjang Sekolah
  const schoolThemes: Record<SchoolType, { badgeBg: string; activeTab: string; accentColor: string; label: string; icon: string }> = {
    sd: {
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      activeTab: 'bg-rose-600 text-white',
      accentColor: '#f43f5e',
      label: 'Sekolah Dasar (SD)',
      icon: '🔴',
    },
    smp: {
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      activeTab: 'bg-sky-600 text-white',
      accentColor: '#0ea5e9',
      label: 'Menengah Pertama (SMP)',
      icon: '🔵',
    },
    sma: {
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeTab: 'bg-emerald-600 text-white',
      accentColor: '#10b981',
      label: 'Menengah Atas (SMA)',
      icon: '🟢',
    },
  };

  const theme = schoolThemes[activeSchool];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[94vh] h-[880px] flex flex-col rounded-2xl border border-amber-500/30 shadow-2xl bg-neutral-900 text-neutral-100 overflow-hidden font-sans">
        
        {/* ==================================================================== */}
        {/* 1. HEADER UTAMA PERPUSTAKAAN                                         */}
        {/* ==================================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-amber-300 tracking-wide font-['Chakra_Petch',sans-serif]">
                  PERPUSTAKAAN KOTA RADENWORLD
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  240 TOPIK KURIKULUM LENGKAP
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Katalog Pembelajaran Komprehensif SD (1-6), SMP (7-9), dan SMA (10-12) Berbasis Visual Edukasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indikator Literasi Membaca */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">
              <BookMarked className="w-4 h-4 text-amber-400" />
              <span>
                Dibaca:{' '}
                <strong className="text-amber-300 font-bold">{readTopics.size}</strong> / 240 Topik
              </span>
            </div>

            {/* Tombol Tutup */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-rose-600 hover:text-white border border-neutral-700 flex items-center justify-center text-neutral-400 transition-colors"
              title="Tutup Perpustakaan (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. NAVIGATION BAR: TAB JENJANG & PILIH KELAS                         */}
        {/* ==================================================================== */}
        <div className="px-4 sm:px-5 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Tab Sekolah: SD, SMP, SMA */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveSchool('sd');
                setActiveGradeKey('sd-1');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSchool === 'sd'
                  ? 'bg-rose-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <span>🔴</span> SD (1-6)
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveSchool('smp');
                setActiveGradeKey('smp-7');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSchool === 'smp'
                  ? 'bg-sky-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <span>🔵</span> SMP (7-9)
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveSchool('sma');
                setActiveGradeKey('sma-10');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSchool === 'sma'
                  ? 'bg-emerald-600 text-white'
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
                  onClick={() => {
                    sound.playClick();
                    setActiveGradeKey(gradeInfo.key);
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-extrabold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {gradeInfo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. CATEGORY FILTER BAR: FILTER BIDANG MATA PELAJARAN                  */}
        {/* ==================================================================== */}
        <div className="px-4 sm:px-5 py-2 bg-neutral-950/50 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <div className="text-neutral-500 text-xs flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Kategori:</span>
          </div>

          {LIBRARY_CATEGORIES.map((cat) => {
            const isCatActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-all border ${
                  isCatActive
                    ? 'bg-neutral-200 text-neutral-950 border-neutral-300 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* 4. DUA KOLOM: DAFTAR TOPIK (KIRI) & DETAIL BACAAN + VISUAL (KANAN)   */}
        {/* ==================================================================== */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* ------------------------------------------------------------------ */}
          {/* KOLOM KIRI: DAFTAR BUKU / TOPIK KURIKULUM                          */}
          {/* ------------------------------------------------------------------ */}
          <div className="w-full md:w-80 lg:w-88 border-r border-neutral-800 bg-neutral-950/40 flex flex-col shrink-0">
            {/* Search Bar */}
            <div className="p-2.5 border-b border-neutral-800">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari materi, rumus, konsep..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* List Topik Bab Pembelajaran */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredTopics.map((topic) => {
                const isSelected = activeTopic?.id === topic.id;
                const hasRead = readTopics.has(topic.id);

                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTopicId(topic.id);
                      setShowQuickQuiz(false);
                      setSelectedOption(null);
                      setIsQuizAnswered(false);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-2.5 border ${
                      isSelected
                        ? 'bg-neutral-800 border-amber-500/70 shadow-sm'
                        : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs shrink-0 mt-0.5 text-neutral-300 font-bold font-mono">
                      {topic.badge.slice(0, 3)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-neutral-100 truncate">
                          {topic.title}
                        </span>
                        {hasRead && (
                          <span title="Tuntas Dibaca">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-amber-400/90 font-medium truncate">
                          {topic.subjectName}
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-[10px] text-neutral-400 truncate">
                          {topic.badge}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredTopics.length === 0 && (
                <div className="p-6 text-center text-xs text-neutral-500">
                  Tidak ada materi yang sesuai dengan filter atau kata kunci "{searchQuery}".
                </div>
              )}
            </div>

            {/* Footer Jenjang Info */}
            <div className="p-2.5 border-t border-neutral-800 bg-neutral-950 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>{activeTopic?.gradeName || 'Kurikulum Nasional'}</span>
              <span className="text-neutral-500">{filteredTopics.length} Topik Tersedia</span>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* KOLOM KANAN: KONTEN MATERI LENGKAP & VISUALISASI INTERAKTIF        */}
          {/* ------------------------------------------------------------------ */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-neutral-900/30">
            {activeTopic ? (
              <div className="space-y-4 max-w-4xl mx-auto w-full">
                {/* 1. Header Topik Bab */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${theme.badgeBg}`}>
                        {activeTopic.subjectCategory}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-xs font-medium text-amber-400">
                        {activeTopic.subjectName}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-xl font-bold text-neutral-100 tracking-wide font-['Chakra_Petch',sans-serif]">
                      {activeTopic.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                      {activeTopic.summary}
                    </p>
                  </div>

                  {/* Tombol Gamifikasi Membaca */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAsRead}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                        isRead
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 font-extrabold active:scale-95'
                      }`}
                    >
                      {isRead ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Telah Dibaca (+{activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20} EXP)</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span>Tandai Selesai (+{activeSchool === 'sma' ? 50 : activeSchool === 'smp' ? 35 : 20} EXP)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Formula Kunci / Konsep Utama (Jika Tersedia) */}
                {activeTopic.keyFormulaOrConcept && (
                  <div className="rounded-lg bg-neutral-950 border border-neutral-700 p-3 flex items-center gap-3">
                    <div className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase shrink-0">
                      RUMUS / KONSEP
                    </div>
                    <code className="text-xs sm:text-sm font-mono text-amber-300 font-bold overflow-x-auto">
                      {activeTopic.keyFormulaOrConcept}
                    </code>
                  </div>
                )}

                {/* 3. AREA VISUALISASI UTAMA INTERAKTIF (DIAGRAM SVG EDUKASI) */}
                <div>
                  <LibraryTopicVisualizer
                    type={diagramType}
                    title={activeTopic.title}
                    badge={activeTopic.badge}
                    accentColor={theme.accentColor}
                  />
                </div>

                {/* 4. Rangkuman Poin-Poin Inti Materi */}
                <div className="rounded-xl bg-neutral-950/70 border border-neutral-800 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Pokok Bahasan & Intisari Materi</span>
                  </div>

                  <ul className="space-y-2">
                    {activeTopic.points.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        className="text-xs sm:text-sm text-neutral-200 leading-relaxed flex items-start gap-2.5 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80"
                      >
                        <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5">
                          {pIdx + 1}
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. Fakta Menarik (Fun Fact) */}
                {activeTopic.funFact && (
                  <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Tahukah Kamu? (Wawasan Ensiklopedia)
                      </h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {activeTopic.funFact}
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. Mini Kuis Uji Pemahaman Cepat (1 Soal Interaktif) */}
                <div className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4 text-sky-400" />
                      <span>Uji Pemahaman Cepat (Mini Kuis)</span>
                    </div>

                    {!showQuickQuiz && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          setShowQuickQuiz(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <span>Coba Kuis Cepat</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {showQuickQuiz && (
                    <div className="pt-2 space-y-3 animate-in fade-in duration-200">
                      <p className="text-xs sm:text-sm font-semibold text-neutral-100">
                        {activeTopic.quiz.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {activeTopic.quiz.options.map((opt, oIdx) => {
                          const isSelected = selectedOption === oIdx;
                          const isCorrectOpt = oIdx === activeTopic.quiz.answerIndex;

                          let btnStyle = 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800';
                          if (isQuizAnswered) {
                            if (isCorrectOpt) {
                              btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-950 border-rose-400 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isQuizAnswered}
                              onClick={() => handleAnswerQuiz(oIdx)}
                              className={`p-2.5 rounded-lg text-xs text-left border transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Penjelasan Jawaban Kuis */}
                      {isQuizAnswered && (
                        <div
                          className={`p-3 rounded-lg border text-xs leading-relaxed animate-in fade-in duration-200 ${
                            isQuizCorrect
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          <div className="font-bold mb-1 flex items-center gap-1.5">
                            {isQuizCorrect ? '🎉 Jawaban Tepat! (+15 EXP)' : '❌ Kurang Tepat!'}
                          </div>
                          <p>{activeTopic.quiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                <BookOpen className="w-12 h-12 mb-3 text-neutral-600" />
                <p className="text-sm font-semibold text-neutral-400">Pilih salah satu bab topik di sebelah kiri</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Materi lengkap berserta diagram visual edukasi akan langsung ditampilkan di sini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 5. FOOTER: STATUS & BANTUAN                                         */}
        {/* ==================================================================== */}
        <div className="px-4 sm:px-5 py-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Katalog Perpustakaan Kota • 240 Topik Kurikulum Nasional Lengkap</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-neutral-500 hidden sm:inline">
              Gunakan tombol [E] atau klik rak buku perpustakaan untuk membaca langsung.
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
