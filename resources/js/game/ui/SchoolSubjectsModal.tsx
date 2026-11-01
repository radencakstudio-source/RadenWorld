/**
 * ============================================================================
 * FILE: resources/js/game/ui/SchoolSubjectsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal GAME KUIS EDUKASI RADENWORLD (SD, SMP, SMA).
 * 
 * ATURAN & FITUR UTAMA SESUAI WIREFRAME:
 * 1. TAMPILAN WIREFRAME RESIK & PRESISI (RESPONSIF LANDSCAPE & PORTRAIT):
 *    - Latar putih bersih (Clean White Canvas) dengan kontras elemen hitam pekat & merah cerah.
 *    - Top Header Bar:
 *      * Box Hitam "No Soal : X"
 *      * Tombol Merah Terang "Menyerah?" (Font bold hitam, konfirmasi menyerah)
 *      * Box Hitam "Timer : 01:00" (Durasi 1 Menit tiap soal)
 *      * 3 Hati Merah (❤️❤️❤️) indikator nyawa
 *    - Question Box:
 *      * Kotak hitam besar rounded-3xl dengan tulisan "Isi Soal" & teks pertanyaan.
 *      * Aksen garis titik-titik (dotted lines) sesuai wireframe.
 *    - 4 Kartu Pilihan Jawaban (A, B, C, D):
 *      * Landscape/Desktop: 4 kartu berjejer menyamping (grid-cols-4).
 *      * Portrait/Mobile: Grid 2 x 2 rapi (A & B atas, C & D bawah).
 *      * Border radius rounded-[28px] s/d rounded-[36px] yang presisi.
 *      * Huruf A, B, C, D di bagian atas tengah dan isi teks jawaban di tengah.
 *    - Footer Bawah:
 *      * Teks tengah tebal "Total Soal : X/20".
 * 
 * 2. MEKANISME GAME & ANIMASI:
 *    - Total Soal SELALU 20 soal untuk semua mata pelajaran dan semua tingkatan kelas!
 *    - Timer SELALU 1 Menit (60 Detik) per soal.
 *    - Jika jawaban BENAR:
 *      * Kartu yang dipilih beranimasi pop/pulse & berubah menjadi warna HIJAU (#16a34a).
 *    - Jika SALAH pilih:
 *      * Kartu yang dipilih beranimasi getar (shake) & berubah menjadi warna MERAH (#dc2626).
 *      * Kartu jawaban yang BENAR otomatis beranimasi pop/pulse & berubah warna HIJAU (#16a34a).
 *      * Nyawa berkurang 1 (hati merah memudar/retak).
 *    - Jika WAKTU HABIS (Timer = 0):
 *      * Nyawa berkurang 1, kartu jawaban benar beranimasi warna hijau.
 *    - Player TIDAK BISA keluar sembarangan (tidak bisa klik luar / ESC langsung keluar),
 *      harus menekan tombol "Menyerah?" dengan pop-up konfirmasi.
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
  RotateCcw,
  Flame,
  Award,
  ArrowRight,
  AlertTriangle,
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
} from '../data/SchoolCurriculumData';

interface SchoolSubjectsModalProps {
  isOpen: boolean;
  schoolType?: 'sd' | 'smp' | 'sma';
  grade?: number;
  deskType?: 'guru' | 'siswa';
  onClose: () => void;
  onStudySubject?: (subjectName: string, expEarned: number) => void;
}

// 1 Menit (60 Detik) per soal sesuai permintaan
const QUESTION_TIME_LIMIT = 60;
const TOTAL_QUESTIONS_COUNT = 20;

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

  // --- State Game Quiz ---
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
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // --- State Nyawa & Timer ---
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);

  // --- State Modal Konfirmasi Menyerah ---
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState<boolean>(false);

  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sinkronisasi saat prop grade atau schoolType berubah
  useEffect(() => {
    if (grade >= 1) setCurrentGrade(grade);
    setSelectedSubject('Semua Mapel');
    setIsQuizActive(false);
    setIsQuizFinished(false);
    setIsGameOver(false);
    setShowSurrenderConfirm(false);
  }, [grade, schoolType]);

  // Bersihkan timer & timeout saat unmount
  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Format Waktu MM:SS (contoh 60 -> 01:00, 59 -> 00:59)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcut ESC: Tidak boleh keluar langsung saat quiz aktif! Harus konfirmasi menyerah.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isQuizActive && !isQuizFinished && !isGameOver) {
          setShowSurrenderConfirm(true);
        } else {
          sound.playClick();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, sound, isQuizActive, isQuizFinished, isGameOver]);

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

  const currentQ = quizQuestions[currentIdx];

  // Mulai Sesi Game Quiz Baru (Selalu 20 Soal)
  const startQuiz = useCallback((subjectName: string = 'Semua Mapel') => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    sound.playSuccess();
    sound.playCardDeal();
    const gradeKey = `${schoolType}-${currentGrade}`;
    const questions = generateTextQuizSession(subjectName, TOTAL_QUESTIONS_COUNT, gradeKey);

    setQuizQuestions(questions);
    setSelectedSubject(subjectName);
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setLives(3);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setSelectedOptionKey(null);
    setIsAnswerRevealed(false);
    setIsQuizFinished(false);
    setIsGameOver(false);
    setShowSurrenderConfirm(false);
    setIsQuizActive(true);
  }, [sound, schoolType, currentGrade]);

  // Selesaikan Kuis & Bagikan Hadiah ke Dompet Player
  const finishQuizSession = useCallback((
    finalScore: number,
    finalCorrect: number,
    finalMaxCombo: number,
    isCleared: boolean = true
  ) => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (isCleared) {
      sound.playGoal();
    } else {
      sound.playWrong();
    }

    setIsQuizFinished(true);
    setIsGameOver(!isCleared);

    const expEarned = Math.max(50, finalCorrect * 15 + finalMaxCombo * 5 + (isCleared ? 80 : 20));
    const goldEarned = Math.max(60, finalCorrect * 25 + Math.floor(finalScore / 10));

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
      sender: 'KUIS RADEN',
      text: isCleared
        ? `🏆 LUAR BIASA! Kamu menuntaskan Kuis ${selectedSubject} (${finalCorrect}/20 Benar) Skor: ${finalScore} PTS! Mendapatkan +${expEarned} EXP & +${goldEarned} Koin Emas!`
        : `💔 Game Over di Kuis ${selectedSubject}! Kamu meraih ${finalCorrect}/20 jawaban benar (${finalScore} PTS). Mendapatkan +${expEarned} EXP & +${goldEarned} Koin Emas!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  }, [sound, selectedSubject, gradeData.gradeName, onStudySubject]);

  // Pindah ke Soal Berikutnya
  const handleNextQuestion = useCallback((
    currentScore = score,
    currentCorrect = correctCount,
    currentMaxCombo = maxCombo,
    currentLives = lives
  ) => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= quizQuestions.length) {
       finishQuizSession(currentScore, currentCorrect, currentMaxCombo, true);
     } else {
       sound.playCardDeal();
       setCurrentIdx(nextIdx);
       setSelectedOptionKey(null);
       setIsAnswerRevealed(false);
       setTimeLeft(QUESTION_TIME_LIMIT);
     }
   }, [score, correctCount, maxCombo, lives, currentIdx, quizQuestions.length, finishQuizSession, sound]);

    // Tangani Kehabisan Waktu (Time Out: 1 Menit Habis)
   const handleTimeOut = useCallback(() => {
     if (isAnswerRevealed || isQuizFinished || isGameOver) return;
     sound.playWrong();
     setIsAnswerRevealed(true);
     setSelectedOptionKey(null);
     setCombo(0);

     const newLives = lives - 1;
     setLives(newLives);

     if (newLives <= 0) {
       autoNextTimeoutRef.current = setTimeout(() => {
         finishQuizSession(score, correctCount, maxCombo, false);
       }, 2200);
     } else {
       autoNextTimeoutRef.current = setTimeout(() => {
         handleNextQuestion(score, correctCount, maxCombo, newLives);
       }, 2500);
     }
   }, [isAnswerRevealed, isQuizFinished, isGameOver, sound, lives, score, correctCount, maxCombo, finishQuizSession, handleNextQuestion]);

   // Countdown Timer Interval Loop (1 Menit / 60 Detik per soal)
   // Otomatis pause jika modal konfirmasi menyerah sedang terbuka!
   useEffect(() => {
     if (!isQuizActive || isAnswerRevealed || isQuizFinished || isGameOver || showSurrenderConfirm) {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
       return;
     }

     timerIntervalRef.current = setInterval(() => {
       setTimeLeft((prev) => {
         if (prev <= 1) {
           clearInterval(timerIntervalRef.current as NodeJS.Timeout);
           handleTimeOut();
           return 0;
         }
         if (prev <= 6) {
           sound.playTimerTick();
         }
         return prev - 1;
       });
     }, 1000);

     return () => {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
     };
   }, [isQuizActive, isAnswerRevealed, isQuizFinished, isGameOver, showSurrenderConfirm, currentIdx, handleTimeOut, sound]);

   // Tangani Klik Pilihan Jawaban
   const handleSelectOption = useCallback((option: ITextQuizOption) => {
     if (isAnswerRevealed || isQuizFinished || isGameOver || showSurrenderConfirm) return;
     if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
     if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

     sound.playCardFlip();
     setSelectedOptionKey(option.key);
     setIsAnswerRevealed(true);

     if (option.isCorrect) {
       // JAWABAN BENAR: Animasi hijau + suara benar
       sound.playCorrect();
       const newCombo = combo + 1;
       const points = 100 + (newCombo > 1 ? (newCombo - 1) * 20 : 0);

       const newScore = score + points;
       const newCorrect = correctCount + 1;
       const newMaxCombo = Math.max(maxCombo, newCombo);

       setScore(newScore);
       setCombo(newCombo);
       setMaxCombo(newMaxCombo);
       setCorrectCount(newCorrect);

       if (newCombo >= 2) {
         sound.playCombo(newCombo);
       }

       // Auto-lanjut ke soal berikutnya setelah animasi hijau
       autoNextTimeoutRef.current = setTimeout(() => {
         handleNextQuestion(newScore, newCorrect, newMaxCombo, lives);
       }, 1800);
     } else {
       // JAWABAN SALAH: Animasi merah pada kartu dipilih + animasi hijau pada jawaban benar + nyawa berkurang 1
       sound.playWrong();
       setCombo(0);
       const newLives = lives - 1;
       setLives(newLives);

       if (newLives <= 0) {
         autoNextTimeoutRef.current = setTimeout(() => {
           finishQuizSession(score, correctCount, maxCombo, false);
         }, 2200);
       } else {
         autoNextTimeoutRef.current = setTimeout(() => {
           handleNextQuestion(score, correctCount, maxCombo, newLives);
         }, 2600);
       }
     }
  }, [isAnswerRevealed, isQuizFinished, isGameOver, showSurrenderConfirm, sound, combo, score, correctCount, maxCombo, lives, handleNextQuestion, finishQuizSession]);

  // Keyboard Controller: Tombol A, B, C, D atau 1, 2, 3, 4
  useEffect(() => {
    if (!isQuizActive || isAnswerRevealed || isQuizFinished || isGameOver || showSurrenderConfirm || !currentQ) return;

    const handleKeyQuiz = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      let selectedKey: 'A' | 'B' | 'C' | 'D' | null = null;

      if (key === 'A' || key === '1') selectedKey = 'A';
      else if (key === 'B' || key === '2') selectedKey = 'B';
      else if (key === 'C' || key === '3') selectedKey = 'C';
      else if (key === 'D' || key === '4') selectedKey = 'D';

      if (selectedKey) {
        const opt = currentQ.options.find((o) => o.key === selectedKey);
        if (opt) handleSelectOption(opt);
      }
    };

    window.addEventListener('keydown', handleKeyQuiz);
    return () => window.removeEventListener('keydown', handleKeyQuiz);
  }, [isQuizActive, isAnswerRevealed, isQuizFinished, isGameOver, showSurrenderConfirm, currentQ, handleSelectOption]);

  if (!isOpen) return null;

  // Daftar mapel populer untuk dipilih di lobby
  const subjectList = [
    { name: 'Semua Mapel', emoji: '🌟', desc: 'Campuran Soal Lengkap' },
    { name: 'Matematika', emoji: '🔢', desc: 'Aritmatika & Geometri' },
    { name: 'IPA', emoji: '🔬', desc: 'Fisika & Makhluk Hidup' },
    { name: 'Bahasa Indonesia', emoji: '🇮🇩', desc: 'Kosakata & Kalimat' },
    { name: 'Bahasa Inggris', emoji: '🇬🇧', desc: 'Vocabulary & Grammar' },
    { name: 'IPS', emoji: '🌍', desc: 'Sosial & Sejarah Bangsa' },
    { name: 'Pancasila', emoji: '⚖️', desc: 'Moral & Lambang Negara' },
  ];

  // Hitung Skor Akurasi & Rank Medali
  const accuracyPercent = Math.round((correctCount / Math.max(1, currentIdx + (isQuizFinished ? 0 : 1))) * 100);
  const rankTier = correctCount >= 18 ? 'S' : correctCount >= 14 ? 'A' : correctCount >= 10 ? 'B' : 'C';

  // ==========================================================================
  // TAMPILAN 1: ARENA GAME KUIS (WIRE-FRAME PERSIS SESUAI PERMINTAAN USER)
  // Aktif ketika isQuizActive = true (Menggunakan Kamera Blur / Backdrop Blur)
  // ==========================================================================
  if (isQuizActive && !isQuizFinished && !isGameOver && currentQ) {
    return (
      <div className="fixed inset-0 z-[80] backdrop-blur-2xl bg-black/45 text-white flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none font-sans overflow-y-auto">
        {/* Style Animasi Scoped - Halus dengan GPU translate3d tanpa glitch */}
        <style>{`
          /* Animasi Jawaban Benar: Bouncy Pop pada kartu */
          @keyframes quiz-correct {
            0% { transform: scale(1); }
            30% { transform: scale(1.05); }
            60% { transform: scale(0.98); }
            100% { transform: scale(1); }
          }
          .animate-quiz-correct {
            animation: quiz-correct 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            will-change: transform;
          }

          /* Animasi Jawaban Salah: Shake horizontal halus */
          @keyframes quiz-wrong {
            0%, 100% { transform: translate3d(0, 0, 0); }
            20% { transform: translate3d(-10px, 0, 0); }
            40% { transform: translate3d(10px, 0, 0); }
            60% { transform: translate3d(-6px, 0, 0); }
            80% { transform: translate3d(6px, 0, 0); }
          }
          .animate-quiz-wrong {
            animation: quiz-wrong 0.45s ease-in-out;
            will-change: transform;
          }
        `}</style>

        {/* ================================================================ */}
        {/* MODAL KONFIRMASI MENYERAH (PLAYER TIDAK BISA KELUAR SEMBARANGAN) */}
        {/* ================================================================ */}
        {showSurrenderConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="bg-neutral-900 border-2 border-neutral-700 rounded-[28px] p-6 sm:p-8 max-w-md w-full text-center shadow-2xl text-white">
              <div className="w-16 h-16 rounded-full bg-red-950/80 text-red-500 flex items-center justify-center mx-auto mb-4 border-2 border-red-500/50">
                <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2 text-white tracking-wide">
                Yakin Ingin Menyerah?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mb-6 font-sans leading-relaxed">
                Jika kamu menyerah sekarang, permainan kuis akan dihentikan dan progres soalmu tidak akan disimpan.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowSurrenderConfirm(false);
                  }}
                  className="px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs sm:text-sm cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  Lanjut Bermain
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playWrong();
                    setShowSurrenderConfirm(false);
                    setIsQuizActive(false);
                    setIsQuizFinished(false);
                    setIsGameOver(false);
                    onClose();
                  }}
                  className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  Ya, Menyerah
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-between">
          {/* ========================================================== */}
          {/* 1. TOP HEADER STATUS BAR                                    */}
          {/* Sisi Kiri: No Soal : X | Menyerah? | Timer                 */}
          {/* Sisi Kanan: 3 Ruby Hearts                                  */}
          {/* ========================================================== */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0 pb-2">
            {/* Sisi Kiri Header */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Box 1: No Soal */}
              <div className="bg-black/90 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-2 sm:px-6 sm:py-2.5 font-black text-xs sm:text-base tracking-wide flex items-center justify-center shadow-lg select-none min-w-[90px] sm:min-w-[120px]">
                No Soal : {currentIdx + 1}
              </div>

              {/* Box 2: Tombol Menyerah? */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowSurrenderConfirm(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-base tracking-wide flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-lg select-none rounded-xl border border-red-500"
              >
                Menyerah?
              </button>

              {/* Box 3: Timer 1 Menit */}
              <div
                className={`bg-black/90 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-2 sm:px-6 sm:py-2.5 font-black text-xs sm:text-base tracking-wide flex items-center justify-center font-mono shadow-lg select-none min-w-[100px] sm:min-w-[140px] ${
                  timeLeft <= 10 ? 'text-red-400 border-red-500 animate-pulse' : ''
                }`}
              >
                Timer : {formatTime(timeLeft)}
              </div>
            </div>

            {/* Sisi Kanan: 3 Ruby Hearts */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {[1, 2, 3].map((heartIndex) => {
                const isAlive = heartIndex <= lives;
                return (
                  <svg
                    key={heartIndex}
                    className={`w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ${
                      isAlive
                        ? 'fill-[#ef4444] text-[#ef4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] scale-100'
                        : 'fill-white/10 text-white/10 opacity-25 scale-75'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                );
              })}
            </div>
          </div>

          {/* ========================================================== */}
          {/* 2. QUESTION BOX (Isi Soal)                                 */}
          {/* Kotak Hitam Besar Memanjang dengan Rounded Presisi         */}
          {/* ========================================================== */}
          <div className="w-full bg-black/90 backdrop-blur-md text-white rounded-[24px] sm:rounded-[30px] md:rounded-[36px] p-5 sm:p-7 md:p-9 shadow-2xl my-3 sm:my-5 border border-white/15 transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="font-black text-sm sm:text-base tracking-wider text-white">
                Isi Soal
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-400 font-mono">
                {currentQ.subject} • {gradeData.gradeName}
              </span>
            </div>

            {/* Teks Pertanyaan Utama */}
            <div className="py-1">
              <p className="text-base sm:text-xl md:text-2xl font-bold text-white leading-relaxed font-sans">
                {currentQ.question}
              </p>
            </div>

            {/* Garis Dotted Dekoratif Sesuai Mockup */}
            <div className="mt-4 pt-2 border-t border-dotted border-neutral-700/80 flex flex-col gap-1.5 opacity-60">
              <div className="w-full border-b border-dotted border-neutral-500" />
              <div className="w-4/5 border-b border-dotted border-neutral-500" />
            </div>
          </div>

          {/* ========================================================== */}
          {/* 3. 4 KARTU JAWABAN (A, B, C, D)                            */}
          {/* - Landscape / Layar Lebar: 4 Kolom Berjejer Sejajar        */}
          {/* - Portrait / Layar HP: Grid 2 x 2 Rapi                     */}
          {/* - Animasi Warna:                                           */}
          {/*   * Benar -> Berubah Hijau + Animasi Pop                   */}
          {/*   * Salah -> Pilihan Merah + Jawaban Benar Hijau + Nyawa -1*/}
          {/* ========================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 landscape:grid-cols-4 gap-3 sm:gap-5 md:gap-6 items-stretch my-auto">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionKey === opt.key;
              const isCorrectOption = opt.isCorrect;

              let cardBg = 'bg-black/90 text-white border-2 border-white/15 hover:border-white/40 hover:bg-black/95';
              let animClass = '';

              if (isAnswerRevealed) {
                if (isSelected && isCorrectOption) {
                  // Benar: berubah hijau cerah + animasi pop
                  cardBg = 'bg-[#16a34a] text-white border-2 border-green-400 shadow-[0_0_35px_rgba(22,163,74,0.9)]';
                  animClass = 'animate-quiz-correct';
                } else if (isSelected && !isCorrectOption) {
                  // Salah pilih: berubah merah cerah + animasi goyang pada kartu ini saja
                  cardBg = 'bg-[#dc2626] text-white border-2 border-red-400 shadow-[0_0_35px_rgba(220,38,38,0.9)]';
                  animClass = 'animate-quiz-wrong';
                } else if (isCorrectOption) {
                  // Jawaban yang benar tetap di-highlight hijau + animasi pop
                  cardBg = 'bg-[#16a34a] text-white border-2 border-green-400 shadow-[0_0_35px_rgba(22,163,74,0.9)]';
                  animClass = 'animate-quiz-correct';
                } else {
                  cardBg = 'bg-black/40 text-white/30 border border-white/5 opacity-40';
                }
              }

              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={isAnswerRevealed}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full min-h-[170px] sm:min-h-[220px] md:min-h-[300px] lg:min-h-[340px] rounded-[26px] sm:rounded-[32px] md:rounded-[38px] flex flex-col justify-between p-4 sm:p-6 md:p-7 text-center transition-colors duration-200 cursor-pointer select-none active:scale-95 shadow-xl ${cardBg} ${animClass}`}
                >
                  {/* Huruf A / B / C / D di atas tengah */}
                  <div className="w-full text-center">
                    <span className="font-black text-xl sm:text-2xl md:text-3xl tracking-wider block">
                      {opt.key}
                    </span>
                  </div>

                  {/* Isi Teks Jawaban di tengah kartu */}
                  <div className="flex-1 flex items-center justify-center px-1 sm:px-2 py-2">
                    <span className="font-bold text-sm sm:text-base md:text-lg font-sans leading-snug">
                      {opt.text}
                    </span>
                  </div>

                  {/* Spacer bawah untuk keseimbangan visual */}
                  <div className="h-2" />
                </button>
              );
            })}
          </div>

          {/* ========================================================== */}
          {/* 4. TOTAL SOAL DI BAWAH (Total Soal : X/20)                 */}
          {/* Badge pill yang kontras & terbaca jelas di atas kamera blur*/}
          {/* ========================================================== */}
          <div className="w-full text-center py-2 sm:py-3 mt-2 shrink-0">
            <span className="font-black text-sm sm:text-base md:text-xl text-white tracking-wide bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 inline-block shadow-lg drop-shadow-md">
              Total Soal : {currentIdx + 1}/{TOTAL_QUESTIONS_COUNT}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // TAMPILAN 2: LOBBY PILIH MAPEL ATAU HASIL AKHIR VICTORY / GAME OVER
  // ==========================================================================
  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-[3px] animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-950 border-2 border-neutral-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden font-['Chakra_Petch'] text-white transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal Lobby / Hasil */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-800/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 fill-neutral-950" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-wider uppercase bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                  RADEN QUIZ GAME
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-800 text-amber-300 font-bold border border-neutral-700">
                  {schoolType.toUpperCase()} • {gradeData.gradeName}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:block">
                Uji kecerdasan, kumpulkan koin emas & menangkan reward EXP!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 hover:bg-rose-600 hover:text-white text-neutral-400 cursor-pointer active:scale-95 transition-colors border border-neutral-800"
              title="Tutup Modal"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-between custom-scrollbar bg-neutral-950/60">
          {/* SCREEN A: LOBBY PILIH MAPEL */}
          {!isQuizActive && !isQuizFinished && !isGameOver && (
            <div className="space-y-4">
              {/* Tab Pilihan Tingkat Kelas */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Pilih Tingkat Kelas:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(schoolType === 'sd' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCurrentGrade(g);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        currentGrade === g
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-102'
                          : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
                      }`}
                    >
                      {schoolType === 'sd' ? `Kelas ${g} SD` : schoolType === 'smp' ? `Kelas ${g + 6} SMP` : `Kelas ${g + 9} SMA`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Kartu Quest Mapel */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Pilih Mata Pelajaran Kuis:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-3">
                  {subjectList.map((sub) => (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => startQuiz(sub.name)}
                      className="p-3.5 sm:p-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 border-2 border-neutral-800 hover:border-amber-400/70 text-left transition-all cursor-pointer flex items-center justify-between group shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:border-amber-400/50 transition-all shadow-inner">
                          {sub.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
                            {sub.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-sans truncate">
                            {sub.desc}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-amber-400 font-bold">
                            <span>{TOTAL_QUESTIONS_COUNT} Soal</span>
                            <span className="text-neutral-600">•</span>
                            <span className="text-emerald-400">1 Menit/Soal</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3.5 py-2 rounded-xl bg-neutral-950 group-hover:bg-amber-400 group-hover:text-neutral-950 text-neutral-300 font-black text-xs transition-colors shrink-0 border border-neutral-800 group-hover:border-amber-300 shadow-sm flex items-center gap-1.5">
                        <span>MAIN</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Aturan Game */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-900/80 to-orange-500/10 border border-amber-500/20 flex items-center gap-3.5 text-xs text-amber-200/90">
                <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                    Aturan Main Kuis:
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                    Kamu memiliki <strong>3 Nyawa (Hearts)</strong>, waktu <strong>1 Menit</strong> per soal, dan total <strong>20 Soal</strong> per kuis. Jangan sampai kehabisan nyawa!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN C: HASIL AKHIR KUIS / VICTORY / GAME OVER */}
          {(isQuizFinished || isGameOver) && (
            <div className="py-2 sm:py-4 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Badge Peringkat Medali Rank */}
              <div className="relative">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center border-4 shadow-2xl transition-transform ${
                    isGameOver
                      ? 'bg-rose-950/60 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                      : rankTier === 'S'
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-300 text-neutral-950 shadow-[0_0_40px_rgba(245,158,11,0.8)] scale-105'
                      : 'bg-gradient-to-br from-sky-500 to-indigo-600 border-sky-300 text-white shadow-[0_0_30px_rgba(14,165,233,0.6)]'
                  }`}
                >
                  {isGameOver ? (
                    <XCircle className="w-12 h-12 stroke-[2.5]" />
                  ) : rankTier === 'S' ? (
                    <Trophy className="w-12 h-12 stroke-[2.5]" />
                  ) : (
                    <Award className="w-12 h-12 stroke-[2.5]" />
                  )}
                </div>

                {!isGameOver && (
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-xs border-2 border-neutral-950 shadow-md">
                    RANK {rankTier}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3
                  className={`text-xl sm:text-2xl font-black uppercase tracking-wider ${
                    isGameOver ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {isGameOver ? 'GAME OVER! NYAWA HABIS' : 'VICTORY! KUIS SELESAI'}
                </h3>
                <p className="text-xs text-neutral-300 font-sans">
                  {isGameOver
                    ? `Kamu kehabisan nyawa di kuis ${selectedSubject}. Jangan patah semangat, coba lagi!`
                    : `Luar biasa! Kamu menyelesaikan seluruh 20 soal di kuis ${selectedSubject} (${gradeData.gradeName})`}
                </p>
              </div>

              {/* Statistik Hasil Kuis */}
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5 w-full max-w-lg">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block font-mono">Skor Akhir</span>
                  <span className="text-sm sm:text-base font-black text-amber-400">{score}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block font-mono">Benar</span>
                  <span className="text-sm sm:text-base font-black text-emerald-400">
                    {correctCount} / {TOTAL_QUESTIONS_COUNT}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block font-mono">Max Streak</span>
                  <span className="text-sm sm:text-base font-black text-orange-400">{maxCombo}x</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                  <span className="text-[10px] text-neutral-400 block font-mono">Sisa Nyawa</span>
                  <span className="text-sm sm:text-base font-black text-rose-400">
                    {lives > 0 ? `${lives} ❤️` : '0 💔'}
                  </span>
                </div>
              </div>

              {/* Banner Hadiah yang Diterima */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-2 border-amber-400/50 w-full max-w-lg text-xs font-bold text-amber-200 flex items-center justify-around shadow-lg">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  +{Math.max(50, correctCount * 15 + maxCombo * 5 + (!isGameOver ? 80 : 20))} EXP
                </span>
                <span className="text-neutral-600 font-mono">•</span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Award className="w-4 h-4 text-emerald-400" />
                  +{Math.max(60, correctCount * 25 + Math.floor(score / 10))} Koin Emas
                </span>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => startQuiz(selectedSubject)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-neutral-950 text-xs font-black shadow-lg cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Main Lagi 🎮</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsQuizActive(false);
                    setIsQuizFinished(false);
                    setIsGameOver(false);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold border border-neutral-700 cursor-pointer flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Pilih Mapel Lain</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold border border-neutral-800 cursor-pointer active:scale-95 transition-all"
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
