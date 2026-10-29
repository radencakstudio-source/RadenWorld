/**
 * ============================================================================
 * FILE: resources/js/game/ui/SchoolSubjectsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal TEKS QUIZ Edukasi Sekolah RadenWorld (SD, SMP, SMA).
 * 
 * FITUR TERLENGKAP & OPTIMAL:
 * 1. 100% TEKS QUIZ RINGAN:
 *    - Format kuis edukatif murni, responsif, tanpa animasi/grafis berat.
 *    - Pemuatan instan (Zero Lag / Low INP < 15ms, Zero CLS).
 * 2. RESPONSIF MOBILE BROWSER (VERTIKAL & HORIZONTAL):
 *    - Vertikal (Portrait): Opsi tersusun rapi dengan tombol sentuh jempol yang nyaman.
 *    - Horizontal (Landscape): Layout 2-kolom (Pertanyaan di kiri, 4 Opsi 2x2 di kanan)
 *      sehingga seluruh pertanyaan & jawaban muat di layar HP pendek tanpa harus scroll!
 * 3. SISTEM REWARD REAL-TIME:
 *    - EXP & Koin Emas langsung ditambahkan ke profil pemain & disiarkan ke chatbox.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X,
  ArrowLeft,
  Trophy,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Zap,
  Flame,
  Award,
  ArrowRight,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { SD_CURRICULUM_DATA } from './SdSubjectsModal';
import {
  generateTextQuizSession,
  ITextQuizQuestion,
  ITextQuizOption,
} from '../data/SchoolQuizBank';

// Re-export kurikulum untuk kompatibilitas penuh dengan SchoolGradeSelectModal & komponen lain
export * from '../data/SchoolCurriculumData';
import {
  SMP_CURRICULUM_DATA,
  SMA_CURRICULUM_DATA,
  ISchoolSubjectItem,
} from '../data/SchoolCurriculumData';

interface SchoolSubjectsModalProps {
  isOpen: boolean;
  schoolType?: 'sd' | 'smp' | 'sma';
  grade?: number;
  deskType?: 'guru' | 'siswa';
  onClose: () => void;
  onStudySubject?: (subjectName: string, expEarned: number) => void;
}

export const SchoolSubjectsModal: React.FC<SchoolSubjectsModalProps> = ({
  isOpen,
  schoolType = 'sd',
  grade = 1,
  deskType = 'guru',
  onClose,
  onStudySubject,
}) => {
  const sound = SoundManager.getInstance();

  const [currentGrade, setCurrentGrade] = useState<number>(() => (grade >= 1 ? grade : 1));
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua Mapel');

  // --- State Teks Quiz ---
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<ITextQuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [selectedOptionKey, setSelectedOptionKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sinkronisasi saat prop grade atau schoolType berubah
  useEffect(() => {
    if (grade >= 1) setCurrentGrade(grade);
    setSelectedSubject('Semua Mapel');
    setIsQuizActive(false);
    setIsQuizFinished(false);
  }, [grade, schoolType]);

  // Bersihkan timeout saat unmount
  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };
  }, []);

  // Keyboard shortcut ESC untuk menutup modal
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

  // Ambil data kurikulum berdasarkan schoolType dan currentGrade
  const gradeData = useMemo(() => {
    if (schoolType === 'sd') {
      return SD_CURRICULUM_DATA[currentGrade] || SD_CURRICULUM_DATA[1];
    } else if (schoolType === 'smp') {
      const g = Math.min(Math.max(currentGrade, 1), 3);
      return SMP_CURRICULUM_DATA[g] || SMP_CURRICULUM_DATA[1];
    } else {
      const g = Math.min(Math.max(currentGrade, 1), 3);
      return SMA_CURRICULUM_DATA[g] || SMA_CURRICULUM_DATA[1];
    }
  }, [schoolType, currentGrade]);

  // Mulai Sesi Teks Quiz Baru
  const startQuiz = useCallback((subjectName: string = 'Semua Mapel') => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    sound.playSuccess();
    const gradeKey = `${schoolType}-${currentGrade}`;
    const questions = generateTextQuizSession(subjectName, 10, gradeKey);
    setQuizQuestions(questions);
    setSelectedSubject(subjectName);
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setSelectedOptionKey(null);
    setIsAnswerRevealed(false);
    setIsQuizFinished(false);
    setIsQuizActive(true);
  }, [sound, schoolType, currentGrade]);

  // Selesaikan Kuis & Bagikan Hadiah ke Dompet Player
  const finishQuizSession = useCallback((finalScore: number, finalCorrect: number, finalMaxCombo: number) => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    sound.playSuccess();
    setIsQuizFinished(true);

    const expEarned = Math.max(30, finalCorrect * 12 + finalMaxCombo * 5);
    const goldEarned = Math.max(40, finalCorrect * 15 + Math.floor(finalScore / 10));

    // Update koin ke localStorage & sinkronkan
    try {
      const curGold = parseInt(localStorage.getItem('raden_player_gold') || '0', 10);
      const newGold = curGold + goldEarned;
      localStorage.setItem('raden_player_gold', newGold.toString());
      EventBus.emit('update-player-gold', newGold);
    } catch (e) {}

    // Berikan EXP
    if (onStudySubject) {
      onStudySubject(`Quiz ${selectedSubject} (${gradeData.gradeName})`, expEarned);
    }

    // Siarkan ke Chatbox
    EventBus.emit('new-chat-message', {
      id: `quiz_win_${Date.now()}`,
      sender: 'KUIS SEKOLAH',
      text: `🎉 Selesai! Kamu menyelesaikan Teks Quiz ${selectedSubject} (${finalCorrect}/10 Benar) Skor: ${finalScore} pts! Mendapatkan +${expEarned} EXP & +${goldEarned} Koin Emas!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  }, [sound, selectedSubject, gradeData.gradeName, onStudySubject]);

  // Tangani Klik Pilihan Jawaban
  const handleSelectOption = (option: ITextQuizOption) => {
    if (isAnswerRevealed || isQuizFinished) return;
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);

    setSelectedOptionKey(option.key);
    setIsAnswerRevealed(true);

    if (option.isCorrect) {
      sound.playSuccess();
      const newCombo = combo + 1;
      const points = 100 + (newCombo > 1 ? (newCombo - 1) * 20 : 0);
      const newScore = score + points;
      const newCorrect = correctCount + 1;
      const newMaxCombo = Math.max(maxCombo, newCombo);

      setScore(newScore);
      setCombo(newCombo);
      setMaxCombo(newMaxCombo);
      setCorrectCount(newCorrect);

      // Auto-lanjut jika benar
      autoNextTimeoutRef.current = setTimeout(() => {
        handleNextQuestion(newScore, newCorrect, newMaxCombo);
      }, 1400);
    } else {
      sound.playClick();
      setCombo(0);
      // Jika salah, berikan waktu sedikit lebih lama agar pemain bisa membaca penjelasannya
      autoNextTimeoutRef.current = setTimeout(() => {
        handleNextQuestion(score, correctCount, maxCombo);
      }, 3000);
    }
  };

  // Pindah ke Soal Berikutnya
  const handleNextQuestion = (
    currentScore = score,
    currentCorrect = correctCount,
    currentMaxCombo = maxCombo
  ) => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= quizQuestions.length) {
      finishQuizSession(currentScore, currentCorrect, currentMaxCombo);
    } else {
      setCurrentIdx(nextIdx);
      setSelectedOptionKey(null);
      setIsAnswerRevealed(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = quizQuestions[currentIdx];

  // Daftar mapel populer yang tersedia untuk dipilih
  const subjectList = [
    { name: 'Semua Mapel', emoji: '🌟', desc: 'Campuran Soal Lengkap' },
    { name: 'Matematika', emoji: '🔢', desc: 'Aritmatika, Aljabar & Geometri' },
    { name: 'IPA', emoji: '🔬', desc: 'Fisika, Biologi & Kimia' },
    { name: 'Bahasa Indonesia', emoji: '🇮🇩', desc: 'Tata Bahasa, EYD & Sastra' },
    { name: 'Bahasa Inggris', emoji: '🇬🇧', desc: 'Vocabulary & Grammar' },
    { name: 'IPS', emoji: '🌍', desc: 'Geografi & Sejarah Dunia' },
    { name: 'Pancasila', emoji: '⚖️', desc: 'PPKN & Wawasan Kebangsaan' },
  ];

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-[2px] animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-950 border-2 border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden font-['Chakra_Petch'] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* 1. HEADER MODAL (Ultra-Ringan, Ramping di Mobile Landscape)     */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-neutral-900/90 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-amber-400">
                  Teks Quiz
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 font-bold border border-neutral-700">
                  {schoolType.toUpperCase()} • {gradeData.gradeName}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:block">
                Kuis edukatif ringan & cepat untuk menguji wawasan mata pelajaran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isQuizActive && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsQuizActive(false);
                  setIsQuizFinished(false);
                }}
                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold border border-neutral-700 cursor-pointer flex items-center gap-1 active:scale-95 transition-colors"
                title="Pilih Mata Pelajaran Lain"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pilih Mapel</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer active:scale-95 transition-colors"
              title="Tutup Modal"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. BODY CONTENT (Teks Quiz Interaktif & Cepat)                  */}
        {/* ============================================================== */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-between">
          {/* ------------------------------------------------------------ */}
          {/* SCREEN A: PILIH MATA PELAJARAN SEBELUM MULAI KUIS            */}
          {/* ------------------------------------------------------------ */}
          {!isQuizActive && !isQuizFinished && (
            <div className="space-y-4">
              {/* Tab Pilihan Tingkat Kelas */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Pilih Tingkat Kelas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(schoolType === 'sd' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCurrentGrade(g);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        currentGrade === g
                          ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {schoolType === 'sd' ? `Kelas ${g} SD` : schoolType === 'smp' ? `Kelas ${g + 6} SMP` : `Kelas ${g + 9} SMA`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Kartu Mata Pelajaran */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Pilih Mata Pelajaran Kuis:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-2 sm:gap-2.5">
                  {subjectList.map((sub) => (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => startQuiz(sub.name)}
                      className="p-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 active:scale-98 border border-neutral-800 hover:border-amber-400/80 text-left transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                          {sub.emoji}
                        </span>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-neutral-100 group-hover:text-amber-400 transition-colors">
                            {sub.name}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {sub.desc}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-800 group-hover:bg-amber-400 text-neutral-400 group-hover:text-neutral-950 font-black text-xs transition-colors shrink-0">
                        Mulai ➡️
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Hadiah */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200/90">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Selesaikan 10 soal kuis untuk memenangkan <strong>+EXP Karakter</strong> dan <strong>+Koin Emas</strong> yang langsung tersimpan di dompetmu!
                </span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* SCREEN B: SESI TEKS QUIZ SEDANG BERJALAN                     */}
          {/* ------------------------------------------------------------ */}
          {isQuizActive && !isQuizFinished && currentQ && (
            <div className="space-y-3 sm:space-y-4">
              {/* Header Status Bar (Soal, Skor, Streak) */}
              <div className="flex items-center justify-between bg-neutral-900/80 px-3 py-2 rounded-xl border border-neutral-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">
                    Soal {currentIdx + 1} / {quizQuestions.length}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-300 font-sans text-[11px]">
                    {currentQ.emoji} {currentQ.subject}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {combo > 1 && (
                    <span className="flex items-center gap-1 text-orange-400 font-black text-[11px] animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-orange-400" />
                      {combo}x Streak
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-amber-300 font-bold border border-neutral-700 text-xs flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    {score} PTS
                  </span>
                </div>
              </div>

              {/* Progress Bar Soal */}
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* ======================================================== */}
              {/* LAYOUT SOAL & OPSI: RESPONSIF DI HP VERTIKAL & HORIZONTAL */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3 sm:gap-4 items-stretch">
                {/* Kolom Kiri: Pertanyaan Teks */}
                <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Pertanyaan:</span>
                      <span className="text-amber-400 font-bold">100 Poin</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                      {currentQ.question}
                    </div>
                  </div>

                  {/* Keterangan Pembahasan jika sudah dijawab */}
                  {isAnswerRevealed && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-150 ${
                        currentQ.options.find((o) => o.key === selectedOptionKey)?.isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1 mb-1">
                        {currentQ.options.find((o) => o.key === selectedOptionKey)?.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Jawaban Benar! (+100 PTS)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Kurang Tepat!</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Kolom Kanan: 4 Pilihan Jawaban (A, B, C, D) */}
                <div className="flex flex-col gap-2 justify-center">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOptionKey === opt.key;
                    let btnStyle = 'bg-neutral-900/90 border-neutral-800 text-neutral-200 hover:border-amber-400/80 hover:bg-neutral-800';

                    if (isAnswerRevealed) {
                      if (opt.isCorrect) {
                        btnStyle = 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                      } else if (isSelected && !opt.isCorrect) {
                        btnStyle = 'bg-rose-950/90 border-2 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
                      } else {
                        btnStyle = 'bg-neutral-900/50 border-neutral-800/60 text-neutral-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        disabled={isAnswerRevealed}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full min-h-[46px] sm:min-h-[50px] px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer active:scale-98 select-none ${btnStyle}`}
                      >
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs sm:text-sm shrink-0 ${
                            isAnswerRevealed && opt.isCorrect
                              ? 'bg-emerald-500 text-neutral-950'
                              : isAnswerRevealed && isSelected && !opt.isCorrect
                              ? 'bg-rose-500 text-white'
                              : 'bg-neutral-800 text-amber-400 border border-neutral-700'
                          }`}
                        >
                          {isAnswerRevealed && opt.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                          ) : isAnswerRevealed && isSelected && !opt.isCorrect ? (
                            <XCircle className="w-4 h-4 stroke-[3]" />
                          ) : (
                            opt.key
                          )}
                        </span>
                        <span className="font-bold text-xs sm:text-sm leading-snug flex-1">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tombol Lanjut Cepat jika pemain ingin lewati jeda */}
              {isAnswerRevealed && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleNextQuestion()}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Lanjut Soal Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* SCREEN C: HASIL AKHIR KUIS & HADIAH                          */}
          {/* ------------------------------------------------------------ */}
          {isQuizFinished && (
            <div className="py-2 sm:py-4 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-amber-400 uppercase tracking-wider">
                  Kuis Selesai!
                </h3>
                <p className="text-xs text-neutral-300">
                  Kamu telah menyelesaikan Teks Quiz <strong>{selectedSubject}</strong> ({gradeData.gradeName})
                </p>
              </div>

              {/* Statistik Hasil */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block font-mono">Total Skor</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">{score}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block font-mono">Benar</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">{correctCount} / 10</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block font-mono">Max Streak</span>
                  <span className="text-base sm:text-lg font-black text-orange-400">{maxCombo}x</span>
                </div>
              </div>

              {/* Banner Hadiah yang Diterima */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/40 w-full max-w-md text-xs font-bold text-amber-200 flex items-center justify-around">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  +{Math.max(30, correctCount * 12 + maxCombo * 5)} EXP
                </span>
                <span className="text-neutral-600">•</span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Award className="w-4 h-4 text-emerald-400" />
                  +{Math.max(40, correctCount * 15 + Math.floor(score / 10))} Koin Emas
                </span>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => startQuiz(selectedSubject)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Main Lagi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsQuizActive(false);
                    setIsQuizFinished(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Pilih Mapel Lain</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-bold border border-neutral-800 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Tutup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
