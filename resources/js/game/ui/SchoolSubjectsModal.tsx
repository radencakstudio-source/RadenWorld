/**
 * ============================================================================
 * FILE: resources/js/game/ui/SchoolSubjectsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal GAME KUIS EDUKASI & LEADERBOARD SEKOLAH RADENWORLD (SD, SMP, SMA).
 * Gaya Visual: Chunky Pastel Pixel (Cozycore UI) & Cute Minimalist Clay-Pixel.
 * Navigasi: Sidebar Kiri Responsif (Ujian Mapel, Juara Kelas, Juara Sekolah).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X,
  Trophy,
  Sparkles,
  BookOpen,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  AlertTriangle,
  Medal,
  Crown,
  School,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { SD_CURRICULUM_DATA } from './SdSubjectsModal';
import {
  generateTextQuizSession,
  getQuizSubjectsForSchool,
  ITextQuizQuestion,
  ITextQuizOption,
} from '../data/SchoolQuizBank';
import {
  fetchSchoolLeaderboards,
  submitQuizScoreToLeaderboard,
  getOfficialClassLabel,
  ILeaderboardPayload,
  ILeaderboardStudentEntry,
} from '../core/LeaderboardClient';

// Re-export kurikulum untuk kompatibilitas penuh dengan SchoolGradeSelectModal & komponen lain
export * from '../data/SchoolCurriculumData';
import {
  SMP_CURRICULUM_DATA,
  SMA_CURRICULUM_DATA,
} from '../data/SchoolCurriculumData';
import {
  CURRICULUM_SUBJECTS,
  getCurriculumTopics,
} from '../data/library/CurriculumMasterRegistry';
import { BookMaterialView } from './BookMaterialView';

export type SchoolModalTab = 'materi' | 'quiz' | 'class_leaderboard' | 'school_leaderboard';

interface SchoolSubjectsModalProps {
  isOpen: boolean;
  schoolType?: 'sd' | 'smp' | 'sma';
  grade?: number;
  deskType?: 'guru' | 'siswa';
  playerName?: string;
  initialTab?: SchoolModalTab;
  onClose: () => void;
  onStudySubject?: (subjectName: string, expEarned: number) => void;
}

const QUESTION_TIME_LIMIT = 60;
const TOTAL_QUESTIONS_COUNT = 20;

export const SchoolSubjectsModal: React.FC<SchoolSubjectsModalProps> = ({
  isOpen,
  schoolType = 'sd',
  grade = 1,
  playerName = 'Siswa Raden',
  initialTab = 'materi',
  onClose,
  onStudySubject,
}) => {
  const sound = SoundManager.getInstance();

  const [activeTab, setActiveTab] = useState<SchoolModalTab>(initialTab);
  const [currentGrade, setCurrentGrade] = useState<number>(() => (grade >= 1 ? grade : 1));
  const [selectedSchoolBoard, setSelectedSchoolBoard] = useState<'sd' | 'smp' | 'sma'>(schoolType);
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua Mapel');
  const [selectedBookSubjectIdx, setSelectedBookSubjectIdx] = useState<number>(0);
  const [selectedBookChapterIdx, setSelectedBookChapterIdx] = useState<number>(0);

  // --- State Leaderboard ---
  const [lbData, setLbData] = useState<ILeaderboardPayload | null>(null);
  const [isLbLoading, setIsLbLoading] = useState<boolean>(false);

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
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState<boolean>(false);

  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);

  useEffect(() => {
    if (grade >= 1) {
      const maxG = schoolType === 'sd' ? 6 : 3;
      setCurrentGrade(Math.min(maxG, grade));
    }
    setSelectedSchoolBoard(schoolType);
    setActiveTab(initialTab || 'materi');
    setSelectedSubject('Semua Mapel');
    setSelectedBookSubjectIdx(0);
    setIsQuizActive(false);
    setIsQuizFinished(false);
    setIsGameOver(false);
    setShowSurrenderConfirm(false);
  }, [grade, schoolType, initialTab, isOpen]);

  const loadLeaderboard = useCallback(async () => {
    setIsLbLoading(true);
    const payload = await fetchSchoolLeaderboards(schoolType, currentGrade);
    setLbData(payload);
    setIsLbLoading(false);
  }, [schoolType, currentGrade]);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen, loadLeaderboard]);

  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  const subjectList = useMemo(() => getQuizSubjectsForSchool(schoolType), [schoolType]);
  const currentQ = quizQuestions[currentIdx];

  const startQuiz = useCallback(
    (subjectName: string = 'Semua Mapel') => {
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
    },
    [sound, schoolType, currentGrade]
  );

  const finishQuizSession = useCallback(
    (
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

      // Sinkronkan hadiah koin ke dompet pemain & server
      EventBus.emit('quiz-gold-earned', goldEarned);

      if (onStudySubject) {
        onStudySubject(`Quiz ${selectedSubject} (${gradeData.gradeName})`, expEarned);
      }

      // Kirim skor ke Leaderboard Tiap Kelas & Leaderboard Tiap Sekolah
      submitQuizScoreToLeaderboard({
        playerName: playerName || localStorage.getItem('raden_saved_name') || 'Siswa Raden',
        schoolType,
        grade: currentGrade,
        score: finalScore,
        correctCount: finalCorrect,
        totalQuestions: TOTAL_QUESTIONS_COUNT,
        subject: selectedSubject,
      }).then((updatedLb) => {
        setLbData(updatedLb);
      });

      EventBus.emit('new-chat-message', {
        id: `quiz_win_${Date.now()}`,
        sender: 'KUIS RADEN',
        text: isCleared
          ? `🏆 LUAR BIASA! Kamu menuntaskan Kuis ${selectedSubject} (${finalCorrect}/${TOTAL_QUESTIONS_COUNT} Benar) Skor: ${finalScore} PTS! +${expEarned} EXP & +${goldEarned} G!`
          : `💔 Sesi Kuis ${selectedSubject} selesai (${finalCorrect}/${TOTAL_QUESTIONS_COUNT} Benar, ${finalScore} PTS). +${expEarned} EXP & +${goldEarned} G!`,
        timestamp: Date.now(),
        isSystem: true,
      });
    },
    [sound, selectedSubject, gradeData.gradeName, onStudySubject, playerName, schoolType, currentGrade]
  );

  const handleNextQuestion = useCallback(
    (
      currentScore = score,
      currentCorrect = correctCount,
      currentMaxCombo = maxCombo,
      _currentLives = lives
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
    },
    [score, correctCount, maxCombo, lives, currentIdx, quizQuestions.length, finishQuizSession, sound]
  );

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
      }, 2000);
    } else {
      autoNextTimeoutRef.current = setTimeout(() => {
        handleNextQuestion(score, correctCount, maxCombo, newLives);
      }, 2200);
    }
  }, [
    isAnswerRevealed,
    isQuizFinished,
    isGameOver,
    sound,
    lives,
    score,
    correctCount,
    maxCombo,
    finishQuizSession,
    handleNextQuestion,
  ]);

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
  }, [
    isQuizActive,
    isAnswerRevealed,
    isQuizFinished,
    isGameOver,
    showSurrenderConfirm,
    currentIdx,
    handleTimeOut,
    sound,
  ]);

  const handleSelectOption = useCallback(
    (option: ITextQuizOption) => {
      if (isAnswerRevealed || isQuizFinished || isGameOver || showSurrenderConfirm) return;
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      sound.playCardFlip();
      setSelectedOptionKey(option.key);
      setIsAnswerRevealed(true);

      if (option.isCorrect) {
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

        autoNextTimeoutRef.current = setTimeout(() => {
          handleNextQuestion(newScore, newCorrect, newMaxCombo, lives);
        }, 1600);
      } else {
        sound.playWrong();
        setCombo(0);
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives <= 0) {
          autoNextTimeoutRef.current = setTimeout(() => {
            finishQuizSession(score, correctCount, maxCombo, false);
          }, 2000);
        } else {
          autoNextTimeoutRef.current = setTimeout(() => {
            handleNextQuestion(score, correctCount, maxCombo, newLives);
          }, 2200);
        }
      }
    },
    [
      isAnswerRevealed,
      isQuizFinished,
      isGameOver,
      showSurrenderConfirm,
      sound,
      combo,
      score,
      correctCount,
      maxCombo,
      lives,
      handleNextQuestion,
      finishQuizSession,
    ]
  );

  useEffect(() => {
    if (
      !isQuizActive ||
      isAnswerRevealed ||
      isQuizFinished ||
      isGameOver ||
      showSurrenderConfirm ||
      !currentQ
    )
      return;

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
  }, [
    isQuizActive,
    isAnswerRevealed,
    isQuizFinished,
    isGameOver,
    showSurrenderConfirm,
    currentQ,
    handleSelectOption,
  ]);

  if (!isOpen) return null;

  const rankTier =
    correctCount >= 18 ? 'S' : correctCount >= 14 ? 'A' : correctCount >= 10 ? 'B' : 'C';

  const renderRankBadge = (index: number) => {
    if (index === 0) return <span className="px-2 py-0.5 clay-badge-primary font-bold text-xs text-black">🥇 #1</span>;
    if (index === 1) return <span className="px-2 py-0.5 clay-badge-secondary font-bold text-xs text-black">🥈 #2</span>;
    if (index === 2) return <span className="px-2 py-0.5 clay-badge-cocoa font-bold text-xs text-white">🥉 #3</span>;
    return <span className="px-2 py-0.5 clay-badge-neutral font-bold text-xs text-black">#{index + 1}</span>;
  };

  const renderLeaderboardList = (entries: ILeaderboardStudentEntry[], showClassBadge: boolean) => {
    const myNorm = (playerName || '').trim().toLowerCase();
    if (isLbLoading && entries.length === 0) {
      return (
        <div className="p-6 clay-card text-center font-bold text-xs text-black">
          Memuat Papan Peringkat Prestasi...
        </div>
      );
    }
    if (entries.length === 0) {
      return (
        <div className="p-6 clay-card text-center font-bold text-xs text-black">
          Belum ada skor tercatat di kelas ini. Jadilah Juara #1 pertama!
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {entries.map((entry, idx) => {
          const isMe = myNorm !== '' && entry.name.trim().toLowerCase() === myNorm;
          return (
            <div
              key={`${entry.classKey}-${entry.name}-${idx}`}
              className={`p-2.5 sm:p-3 flex items-center justify-between gap-2.5 ${
                isMe ? 'clay-card-secondary' : idx === 0 ? 'clay-card-primary' : 'clay-card'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {renderRankBadge(idx)}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-black truncate">
                      {entry.name}
                    </span>
                    {isMe && (
                      <span className="px-1.5 py-0.5 clay-badge-cocoa text-white text-[9px] font-bold">
                        KAMU
                      </span>
                    )}
                    {showClassBadge && (
                      <span className="px-1.5 py-0.5 clay-badge-neutral text-black text-[10px] font-bold">
                        {entry.classLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-black flex items-center gap-1.5 flex-wrap">
                    <span>Mapel: {entry.subject}</span>
                    <span>•</span>
                    <span>Akurasi {entry.accuracy}%</span>
                    <span>•</span>
                    <span>{entry.quizzesPlayed}x Ujian</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-xs sm:text-sm text-black">
                  {entry.bestScore.toLocaleString('id-ID')} PTS
                </div>
                <div className="text-[10px] font-bold text-black">
                  Total: {entry.totalScore.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ==========================================================================
  // TAMPILAN 1: ARENA GAME KUIS AKTIF
  // ==========================================================================
  if (isQuizActive && !isQuizFinished && !isGameOver && currentQ) {
    return (
      <div className="ui-modal-backdrop !z-[80] font-pixel select-none overflow-y-auto custom-scrollbar">
        {showSurrenderConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#5C3A21]/65 p-3">
            <div className="clay-panel max-w-md w-full overflow-hidden text-black">
              <div className="px-4 py-3 clay-header flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-black shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-black tracking-wide">
                  Yakin Ingin Menyerah?
                </h3>
              </div>
              <div className="p-4 sm:p-5 text-center space-y-4">
                <p className="text-xs sm:text-sm text-black leading-relaxed">
                  Jika kamu menyerah sekarang, sesi kuis akan dihentikan dan progres soalmu tidak disimpan.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowSurrenderConfirm(false);
                    }}
                    className="px-4 py-2 clay-btn-secondary text-black font-bold text-xs sm:text-sm"
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
                    }}
                    className="px-4 py-2 clay-btn-cocoa text-white font-bold text-xs sm:text-sm"
                  >
                    Ya, Menyerah
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl m-auto clay-panel p-3 sm:p-5 landscape:max-md:p-2.5 flex flex-col justify-between gap-2.5 sm:gap-4 landscape:max-md:gap-2">
          {/* 1. TOP HEADER STATUS BAR */}
          <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
              <div className="clay-badge-primary px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-xs sm:text-sm text-black">
                Soal {currentIdx + 1}/{quizQuestions.length}
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowSurrenderConfirm(true);
                }}
                className="clay-btn-cocoa text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
              >
                Menyerah
              </button>

              <div
                className={`${
                  timeLeft <= 10 ? 'clay-badge-primary' : 'clay-badge-secondary'
                } px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-xs sm:text-sm text-black`}
              >
                ⏱ {formatTime(timeLeft)}
              </div>

              <div className="clay-badge-neutral px-3 py-1.5 font-bold text-xs sm:text-sm text-black">
                Skor: {score}
              </div>
            </div>

            <div className="clay-badge-neutral px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 sm:gap-2 shrink-0">
              {[1, 2, 3].map((heartIndex) => (
                <span
                  key={heartIndex}
                  className={`text-base sm:text-xl leading-none ${
                    heartIndex <= lives ? 'opacity-100' : 'opacity-25'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>

          {/* 2. QUESTION BOX */}
          <div className="w-full clay-card p-3.5 sm:p-5 landscape:max-md:p-2.5 text-black">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 clay-badge-primary font-bold text-xs text-black">
                {currentQ.emoji} {currentQ.subject}
              </span>
              <span className="px-2.5 py-0.5 clay-badge-secondary text-[10px] sm:text-xs font-bold text-black">
                {getOfficialClassLabel(schoolType, currentGrade)}
              </span>
            </div>

            <p className="text-sm sm:text-lg md:text-xl landscape:max-md:text-xs font-bold text-black leading-relaxed">
              {currentQ.question}
            </p>

            {isAnswerRevealed && currentQ.explanation && (
              <div className="mt-3 p-2.5 clay-card-secondary text-xs font-bold text-black">
                💡 Pembahasan: {currentQ.explanation}
              </div>
            )}
          </div>

          {/* 3. 4 KARTU JAWABAN (A, B, C, D) */}
          <div className="grid grid-cols-2 md:grid-cols-4 landscape:grid-cols-4 gap-2.5 sm:gap-3.5 items-stretch">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionKey === opt.key;
              const isCorrectOption = opt.isCorrect;

              let cardClass = 'clay-btn-neutral text-black';
              let keyBadgeClass = 'clay-badge-primary text-black';

              if (isAnswerRevealed) {
                if (isCorrectOption) {
                  cardClass = 'clay-card-secondary text-black';
                  keyBadgeClass = 'clay-badge-cocoa text-white';
                } else if (isSelected && !isCorrectOption) {
                  cardClass = 'bg-[#5C3A21] border-2 border-[#5C3A21] rounded-[10px] text-white';
                  keyBadgeClass = 'clay-badge-primary text-black';
                } else {
                  cardClass = 'clay-card text-black opacity-50';
                  keyBadgeClass = 'clay-badge-neutral text-black';
                }
              }

              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={isAnswerRevealed}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full min-h-[90px] sm:min-h-[130px] md:min-h-[155px] landscape:max-md:min-h-[66px] flex flex-col justify-between p-2.5 sm:p-4 landscape:max-md:p-2 text-center select-none ${cardClass}`}
                >
                  <div className="w-full flex items-center justify-center">
                    <span className={`px-2.5 py-0.5 font-bold text-xs sm:text-sm ${keyBadgeClass}`}>
                      {opt.key}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-center px-1 py-1.5">
                    <span className="font-bold text-xs sm:text-sm md:text-base landscape:max-md:text-[11px] leading-snug">
                      {opt.text}
                    </span>
                  </div>

                  {isAnswerRevealed && (isCorrectOption || isSelected) ? (
                    <div className="text-[10px] font-bold">
                      {isCorrectOption ? '✓ BENAR' : '✕ SALAH'}
                    </div>
                  ) : (
                    <div className="h-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // TAMPILAN 2: MODAL SIDEBAR KIRI (UJIAN MAPEL + JUARA KELAS + JUARA SEKOLAH)
  // ==========================================================================
  const gradesArray = schoolType === 'sd' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3];
  const activeSchoolBoardObj = lbData?.schoolsOverview?.[selectedSchoolBoard];

  return (
    <div className="ui-modal-backdrop !z-[65] font-pixel" onClick={onClose}>
      <div
        className="w-full max-w-4xl clay-modal-shell h-[min(88dvh,640px)] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="clay-sidebar">
          <div className="clay-sidebar-brand">
            <span className="w-8 h-8 clay-card flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-black" />
            </span>
            <div className="min-w-0 hidden sm:block landscape:block">
              <div className="font-bold text-xs text-black truncate">SEKOLAH RADEN</div>
              <div className="text-[10px] font-bold text-black truncate">
                {getOfficialClassLabel(schoolType, currentGrade)}
              </div>
            </div>
          </div>

          <div className="clay-sidebar-nav custom-scrollbar">
            <div className="clay-sidebar-section-label">Menu Akademik</div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('materi');
              }}
              className={`clay-sidebar-item ${
                activeTab === 'materi' ? 'clay-btn-primary text-black' : 'clay-btn-neutral text-black'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">Buku Materi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('quiz');
              }}
              className={`clay-sidebar-item ${
                activeTab === 'quiz' ? 'clay-btn-primary text-black' : 'clay-btn-neutral text-black'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">Ujian Mapel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('class_leaderboard');
                loadLeaderboard();
              }}
              className={`clay-sidebar-item ${
                activeTab === 'class_leaderboard'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              <Medal className="w-4 h-4 shrink-0" />
              <span className="truncate">Juara Kelas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('school_leaderboard');
                setSelectedSchoolBoard(schoolType);
                loadLeaderboard();
              }}
              className={`clay-sidebar-item ${
                activeTab === 'school_leaderboard'
                  ? 'clay-btn-primary text-black'
                  : 'clay-btn-neutral text-black'
              }`}
            >
              <Crown className="w-4 h-4 shrink-0" />
              <span className="truncate">Juara Sekolah</span>
            </button>

            <div className="clay-sidebar-section-label pt-2">Pilih Kelas</div>
            <div className="grid grid-cols-1 gap-1.5">
              {gradesArray.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCurrentGrade(g);
                    setSelectedBookSubjectIdx(0);
                    setIsQuizFinished(false);
                    setIsGameOver(false);
                  }}
                  className={`clay-sidebar-item !py-1.5 ${
                    currentGrade === g
                      ? 'clay-btn-secondary text-black'
                      : 'clay-btn-neutral text-black'
                  }`}
                >
                  <span className="font-bold text-[11px] truncate">
                    {getOfficialClassLabel(schoolType, g)}
                  </span>
                </button>
              ))}
            </div>
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
              <span className="hidden sm:inline landscape:inline">Tutup</span>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT PANE */}
        <main className="clay-main-pane">
          <div className="clay-main-topbar">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <h2 className="font-bold text-sm sm:text-base text-black uppercase tracking-wide truncate">
                {activeTab === 'materi'
                  ? `Buku Materi Pelajaran • ${getOfficialClassLabel(schoolType, currentGrade)}`
                  : activeTab === 'quiz'
                  ? `Ujian Kuis • ${getOfficialClassLabel(schoolType, currentGrade)}`
                  : activeTab === 'class_leaderboard'
                  ? `Leaderboard ${getOfficialClassLabel(schoolType, currentGrade)}`
                  : `Leaderboard Sekolah (${selectedSchoolBoard.toUpperCase()})`}
              </h2>
              <span className="px-2 py-0.5 clay-badge-secondary text-[10px] font-bold text-black">
                {activeTab === 'materi' ? '📖 Gambar & Penjelasan Buku' : 'Anti-Soal Kembar'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center shrink-0"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="clay-main-body custom-scrollbar">
            {/* TAB 0: BUKU MATERI PELAJARAN BERGAMBAR (SD, SMP, SMA) — KONSISTEN PER BAB & GAMBAR BISA DIPERBESAR */}
            {activeTab === 'materi' && (() => {
              const numericGrade =
                schoolType === 'sd'
                  ? Math.min(Math.max(currentGrade, 1), 6)
                  : schoolType === 'smp'
                  ? Math.min(Math.max(currentGrade, 1), 3) + 6
                  : Math.min(Math.max(currentGrade, 1), 3) + 9;
              const gradeKey = `${schoolType}-${numericGrade}`;

              const subjectListForSchool = CURRICULUM_SUBJECTS[schoolType] || CURRICULUM_SUBJECTS.sd;
              const safeSubIdx = Math.min(
                selectedBookSubjectIdx,
                Math.max(0, subjectListForSchool.length - 1)
              );
              const activeCurriculumSub =
                subjectListForSchool[safeSubIdx] || subjectListForSchool[0];

              const chapters = getCurriculumTopics({
                schoolType,
                gradeKey,
                subjectId: activeCurriculumSub.id,
              });
              const safeChapIdx = Math.min(
                selectedBookChapterIdx,
                Math.max(0, chapters.length - 1)
              );
              const activeTopic = chapters[safeChapIdx] || chapters[0];

              if (!activeTopic) return null;

              return (
                <div className="space-y-3">
                  {/* Pilihan Buku Mata Pelajaran */}
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                    {subjectListForSchool.map((subj, idx) => (
                      <button
                        key={subj.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedBookSubjectIdx(idx);
                          setSelectedBookChapterIdx(0);
                        }}
                        className={`px-2.5 py-1.5 text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                          safeSubIdx === idx
                            ? 'clay-btn-primary text-black'
                            : 'clay-btn-neutral text-black'
                        }`}
                      >
                        <span>{subj.icon}</span>
                        <span>{subj.shortName || subj.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Pilihan Bab Materi agar tidak pernah tercampur antar bab */}
                  {chapters.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                      {chapters.map((ch, cIdx) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedBookChapterIdx(cIdx);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold shrink-0 rounded-lg border-2 border-[#5C3A21] transition-all ${
                            safeChapIdx === cIdx
                              ? 'bg-[#FFE082] text-black shadow-[0_2px_0_#5C3A21]'
                              : 'bg-[#FFFDF7] text-black/80 hover:bg-[#FFF8E7]'
                          }`}
                        >
                          Bab {cIdx + 1}: {ch.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Komponen Buku Pelajaran Konsisten + Gambar Bisa Diperbesar (Zoom) + Rumus Unik + Latihan Tanpa Bocoran */}
                  <BookMaterialView
                    topic={activeTopic}
                    chapterNumber={safeChapIdx + 1}
                    totalChapters={chapters.length}
                    isRead={false}
                    expReward={schoolType === 'sma' ? 45 : schoolType === 'smp' ? 35 : 25}
                    hasPrevTopic={safeChapIdx > 0}
                    hasNextTopic={safeChapIdx < chapters.length - 1}
                    onPrevTopic={() => {
                      if (safeChapIdx > 0) {
                        sound.playClick();
                        setSelectedBookChapterIdx(safeChapIdx - 1);
                      }
                    }}
                    onNextTopic={() => {
                      if (safeChapIdx < chapters.length - 1) {
                        sound.playClick();
                        setSelectedBookChapterIdx(safeChapIdx + 1);
                      }
                    }}
                    onMarkAsRead={() => {
                      const reward = schoolType === 'sma' ? 45 : schoolType === 'smp' ? 35 : 25;
                      if (onStudySubject) {
                        onStudySubject(
                          `${activeCurriculumSub.name} - ${activeTopic.title}`,
                          reward
                        );
                      } else {
                        EventBus.emit('gain-exp', { amount: reward, source: 'school_book_read' });
                      }
                    }}
                    extraFooterAction={
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setActiveTab('quiz');
                          startQuiz(activeCurriculumSub.shortName || activeCurriculumSub.name);
                        }}
                        className="px-3 py-1.5 clay-btn-primary text-black text-xs font-bold flex items-center gap-1"
                      >
                        <span>Mulai Ujian Mapel</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    }
                  />
                </div>
              );
            })()}

            {/* TAB 1: UJIAN MAPEL ATAU HASIL KUIS */}
            {activeTab === 'quiz' && !isQuizFinished && !isGameOver && (
              <div className="space-y-3.5">
                <div className="p-3 clay-card-secondary flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles className="w-5 h-5 text-black shrink-0" />
                    <div className="text-xs text-black">
                      <div className="font-bold">
                        {gradeData.gradeName} — Pilih Mata Pelajaran Ujian
                      </div>
                      <div className="text-[11px]">
                        20 Soal Acak Unik • 3 Nyawa • Hadiah Koin Emas (G) & Skor Leaderboard!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {subjectList.map((sub) => (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => startQuiz(sub.name)}
                      className="p-3 clay-btn-neutral text-black text-left flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 clay-badge-primary flex items-center justify-center text-xl shrink-0">
                          {sub.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-black truncate">
                            {sub.name}
                          </div>
                          <div className="text-[11px] text-black truncate">{sub.desc}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1.5 clay-badge-secondary text-black font-bold text-[11px] shrink-0 flex items-center gap-1">
                        <span>MULAI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LAYAR HASIL AKHIR KUIS */}
            {activeTab === 'quiz' && (isQuizFinished || isGameOver) && (
              <div className="py-2 flex flex-col items-center text-center space-y-3.5">
                <div className="relative">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center ${
                      isGameOver ? 'clay-card text-black' : 'clay-card-primary text-black'
                    }`}
                  >
                    {isGameOver ? (
                      <XCircle className="w-9 h-9 text-black" />
                    ) : rankTier === 'S' ? (
                      <Trophy className="w-9 h-9 text-black" />
                    ) : (
                      <Award className="w-9 h-9 text-black" />
                    )}
                  </div>
                  {!isGameOver && (
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 clay-badge-secondary text-black font-bold text-[11px]">
                      RANK {rankTier}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-xl font-bold uppercase tracking-wider text-black">
                    {isGameOver ? 'NYAWA HABIS! SKOR TERCATAT' : 'UJIAN TUNTAS! SKOR MASUK LEADERBOARD'}
                  </h3>
                  <p className="text-xs text-black">
                    {selectedSubject} • {getOfficialClassLabel(schoolType, currentGrade)}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
                  <div className="p-2.5 clay-card text-center">
                    <span className="text-[10px] text-black block font-bold">Skor Akhir</span>
                    <span className="text-sm sm:text-base font-bold text-black">{score}</span>
                  </div>
                  <div className="p-2.5 clay-card text-center">
                    <span className="text-[10px] text-black block font-bold">Benar</span>
                    <span className="text-sm sm:text-base font-bold text-black">
                      {correctCount}/{TOTAL_QUESTIONS_COUNT}
                    </span>
                  </div>
                  <div className="p-2.5 clay-card text-center">
                    <span className="text-[10px] text-black block font-bold">Max Streak</span>
                    <span className="text-sm sm:text-base font-bold text-black">{maxCombo}x</span>
                  </div>
                  <div className="p-2.5 clay-card text-center">
                    <span className="text-[10px] text-black block font-bold">Sisa Nyawa</span>
                    <span className="text-sm sm:text-base font-bold text-black">
                      {lives > 0 ? `${lives} ❤️` : '0 💔'}
                    </span>
                  </div>
                </div>

                <div className="p-3 clay-card-secondary w-full max-w-lg text-xs font-bold text-black flex items-center justify-around">
                  <span>
                    ✨ +{Math.max(50, correctCount * 15 + maxCombo * 5 + (!isGameOver ? 80 : 20))} EXP
                  </span>
                  <span>•</span>
                  <span>
                    🪙 +{Math.max(60, correctCount * 25 + Math.floor(score / 10))} Koin (G)
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => startQuiz(selectedSubject)}
                    className="px-4 py-2 clay-btn-primary text-black text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ujian Soal Baru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('class_leaderboard');
                    }}
                    className="px-4 py-2 clay-btn-secondary text-black text-xs font-bold flex items-center gap-1.5"
                  >
                    <Medal className="w-4 h-4" />
                    <span>Cek Peringkat Kelas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsQuizActive(false);
                      setIsQuizFinished(false);
                      setIsGameOver(false);
                    }}
                    className="px-4 py-2 clay-btn-neutral text-black text-xs font-bold"
                  >
                    Pilih Mapel Lain
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LEADERBOARD TIAP KELAS */}
            {activeTab === 'class_leaderboard' && (
              <div className="space-y-3">
                <div className="p-3 clay-card-primary flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <Medal className="w-5 h-5 text-black shrink-0" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-black">
                        Peringkat Siswa {getOfficialClassLabel(schoolType, currentGrade)}
                      </div>
                      <div className="text-[11px] text-black">
                        Diurutkan berdasarkan Skor Tertinggi & Akumulasi Poin Ujian Kelas
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('quiz');
                    }}
                    className="px-3 py-1.5 clay-btn-secondary text-black font-bold text-xs"
                  >
                    + Kejar Skor
                  </button>
                </div>

                {renderLeaderboardList(lbData?.classLeaderboard || [], false)}
              </div>
            )}

            {/* TAB 3: LEADERBOARD TIAP SEKOLAH (SD, SMP, SMA) */}
            {activeTab === 'school_leaderboard' && (
              <div className="space-y-3.5">
                {/* Kartu Ringkasan 3 Sekolah (SD, SMP, SMA) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['sd', 'smp', 'sma'] as const).map((sCode) => {
                    const info = lbData?.schoolsOverview?.[sCode];
                    const isSelected = selectedSchoolBoard === sCode;
                    return (
                      <button
                        key={sCode}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedSchoolBoard(sCode);
                        }}
                        className={`p-3 text-left flex flex-col justify-between gap-1.5 ${
                          isSelected ? 'clay-btn-primary text-black' : 'clay-btn-neutral text-black'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-bold text-xs sm:text-sm uppercase flex items-center gap-1">
                            <School className="w-3.5 h-3.5" />
                            <span>{sCode.toUpperCase()}</span>
                          </span>
                          <span className="px-1.5 py-0.5 clay-badge-secondary text-[10px] font-bold text-black">
                            {info?.studentCount || 0} Siswa
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-black truncate w-full">
                          👑 {info?.champion ? `${info.champion.name} (${info.champion.bestScore})` : '-'}
                        </div>
                        <div className="text-[10px] text-black">
                          Total Poin Sekolah: {(info?.totalSchoolPoints || 0).toLocaleString('id-ID')}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2.5 clay-card-secondary flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-black">
                    🏆 Daftar Juara Umum {activeSchoolBoardObj?.schoolTitle || selectedSchoolBoard.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-bold text-black">
                    Gabungan Seluruh Kelas {selectedSchoolBoard.toUpperCase()}
                  </span>
                </div>

                {renderLeaderboardList(activeSchoolBoardObj?.entries || [], true)}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
