/**
 * ============================================================================
 * FILE: resources/js/game/ui/InteractiveVideoStage.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Engine Pemutar Video Visual & Panggung Interaktif Edukasi RadenWorld ("Paham Seketika").
 * 100% Mengikuti Estetika UI RadenWorld:
 *   - Palet warna hangat: Cream (#FFF8EA), Cokelat Kayu (#5C3A21), Peach (#FFAE6D),
 *     Mint (#A8E6CF), Butter Yellow (#FEF08A), Sky (#BAE6FD).
 *   - Garis tepi tegas/outline gelap 2px (#5C3A21), flat shading bersih tanpa neon.
 *   - Analogi nyata super sederhana (Pecahan = pizza/kue; Aljabar = kotak misteri;
 *     Newton = dorong gerobak; Sel = pabrik mini; Fotosintesis = dapur daun).
 *   - Interaksi langsung di layar video: slider gaya, potong kue, buka kotak misteri,
 *     klik organel sel, dan tombol nyalakan saklar secara real-time!
 *   - Kontrol pemutar video lengkap: Play/Pause, Replay Scene, Prev/Next, Scrubber,
 *     Babak indicator dots, Subtitle Card tersinkronisasi, dan Voice Narrator.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { VoiceNarratorService } from '../services/VoiceNarratorService';
import { ILibraryTopicItem } from '../data/library/SdLibraryData';
import {
  VisualDiagramType,
  detectDiagramType,
  getTopicStoryScenes,
  ITopicStoryScene,
} from './LibraryTopicVisualizer';
import { EducationalVideoCanvas } from './EducationalVideoCanvas';

export interface InteractiveVideoStageProps {
  topic: ILibraryTopicItem;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onChangeSpeed: () => void;
  onPrevTopic?: () => void;
  onNextTopic?: () => void;
  hasPrevTopic?: boolean;
  hasNextTopic?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenQuiz?: () => void;
}

export const InteractiveVideoStage: React.FC<InteractiveVideoStageProps> = ({
  topic,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onChangeSpeed,
  onPrevTopic,
  onNextTopic,
  hasPrevTopic = false,
  hasNextTopic = false,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenQuiz,
}) => {
  const sound = SoundManager.getInstance();
  const narrator = VoiceNarratorService.getInstance();

  // --------------------------------------------------------------------------
  // 1. DIAGRAM TYPE & SCENES CONFIGURATION
  // --------------------------------------------------------------------------
  const diagramType = useMemo(() => {
    return detectDiagramType({
      id: topic.id,
      name: topic.title,
      title: topic.title,
      badge: topic.badge,
      subtitle: topic.summary,
      category: topic.subjectCategory || topic.subjectName,
      points: topic.points,
    });
  }, [topic]);

  const storyScenes = useMemo(() => {
    return getTopicStoryScenes(diagramType, topic);
  }, [diagramType, topic]);

  const [activeStep, setActiveStep] = useState<number>(0);
  const totalSteps = storyScenes.length || 4;
  const currentScene: ITopicStoryScene =
    storyScenes[activeStep] || storyScenes[0];

  // --------------------------------------------------------------------------
  // 2. TIMING & PROGRESS SYSTEM
  // --------------------------------------------------------------------------
  const sceneDuration = 18; // 18 detik per babak narasi
  const totalDuration = sceneDuration * totalSteps;
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const scrubberTrackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  // Status Suara Voice-Over
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() =>
    narrator.getIsVoiceEnabled()
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(() =>
    narrator.getIsSpeaking()
  );

  useEffect(() => {
    const unsub = narrator.subscribe((state) => {
      setIsVoiceEnabled(state.isEnabled);
      setIsSpeaking(state.isSpeaking);
    });
    return unsub;
  }, [narrator]);

  const lastSpokenStepRef = useRef<number>(-1);

  // Reset playback saat topik berganti
  useEffect(() => {
    setPlaybackTime(0);
    setActiveStep(0);
    lastSpokenStepRef.current = -1;
    narrator.stop();
  }, [topic.id, narrator]);

  // Sinkronisasi step berdasarkan playbackTime
  useEffect(() => {
    const calculatedStep = Math.min(
      totalSteps - 1,
      Math.floor(playbackTime / sceneDuration)
    );
    if (calculatedStep !== activeStep) {
      setActiveStep(calculatedStep);
    }
  }, [playbackTime, totalSteps, sceneDuration, activeStep]);

  // Interval timer pemutar video (murni tanpa memanggil side-effect di dalam updater)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(200, 1000 / playbackSpeed);
    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        const next = prev + 1;
        if (next >= totalDuration) {
          return totalDuration;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed]);

  // Handle otomatis pause saat video selesai totalDuration (di luar loop setState)
  useEffect(() => {
    if (isPlaying && playbackTime >= totalDuration) {
      onTogglePlay();
      narrator.stop();
    }
  }, [isPlaying, playbackTime, totalDuration, onTogglePlay, narrator]);

  // Hentikan suara saat komponen panggung video unmount
  useEffect(() => {
    return () => {
      narrator.stop();
    };
  }, [narrator]);

  // --------------------------------------------------------------------------
  // 3. VOICE NARRATOR AUTO-SPEAK PADA SETIAP SCENE
  // --------------------------------------------------------------------------
  const speakCurrentScene = useCallback(
    (force = false) => {
      if (!currentScene) return;
      const textToSpeak = `${currentScene.chapter}: ${currentScene.title}. ${currentScene.narration}`;
      narrator.speak(textToSpeak, { force });
    },
    [currentScene, narrator]
  );

  // Bacakan saat scene berganti secara dinamis saat video berputar
  useEffect(() => {
    if (isPlaying && isVoiceEnabled) {
      if (lastSpokenStepRef.current !== activeStep) {
        lastSpokenStepRef.current = activeStep;
        speakCurrentScene(false);
      }
    }
  }, [activeStep, isPlaying, isVoiceEnabled, speakCurrentScene]);

  // --------------------------------------------------------------------------
  // 4. INTERAKSI LANGSUNG DI DALAM VIDEO (STATE SIMULASI NYATA)
  // --------------------------------------------------------------------------
  // Interaksi 1: Pecahan Pizza / Kue (SD)
  const [customSlices, setCustomSlices] = useState<number>(4);
  const [takenSlices, setTakenSlices] = useState<number>(1);

  // Interaksi 2: Aljabar Kotak Misteri (SMP)
  const [mysteryChestOpen, setMysteryChestOpen] = useState<boolean>(false);

  // Interaksi 3: Hukum Newton Gaya Dorong Gerobak (Fisika SMP/SMA)
  const [pushForce, setPushForce] = useState<number>(20);
  const [cartProgress, setCartProgress] = useState<number>(0);
  const [isPushingCart, setIsPushingCart] = useState<boolean>(false);

  // Interaksi 4: Fotosintesis & Dapur Daun (IPAS SD / Biologi)
  const [hasSunlight, setHasSunlight] = useState<boolean>(true);
  const [hasWater, setHasWater] = useState<boolean>(true);

  // Interaksi 5: Struktur Sel Pabrik Mini (Biologi SMA/SMP)
  const [selectedOrganelle, setSelectedOrganelle] = useState<string>('nukleus');

  // Interaksi 6: Mini Kuis Kilat Layar Video
  const [quickAnswerChosen, setQuickAnswerChosen] = useState<number | null>(null);
  const [showSparkleReward, setShowSparkleReward] = useState<boolean>(false);

  // Reset interaksi saat topik berganti
  useEffect(() => {
    setMysteryChestOpen(false);
    setCartProgress(0);
    setIsPushingCart(false);
    setQuickAnswerChosen(null);
    setShowSparkleReward(false);
  }, [topic.id]);

  // Animasi dorong gerobak
  const handlePushCart = () => {
    sound.playSuccess();
    setIsPushingCart(true);
    setCartProgress(0);
    const duration = Math.max(600, 2000 - pushForce * 30);
    const start = Date.now();
    const animInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setCartProgress(progress);
      if (progress >= 100) {
        clearInterval(animInterval);
        setIsPushingCart(false);
      }
    }, 30);
  };

  // --------------------------------------------------------------------------
  // 5. SCRUBBER SEEKING
  // --------------------------------------------------------------------------
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
    const onMove = (e: PointerEvent) => handleSeekFromClientX(e.clientX);
    const onUp = () => setIsScrubbing(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isScrubbing, handleSeekFromClientX]);

  const scrubberPercent = Math.min(
    100,
    Math.max(0, (playbackTime / totalDuration) * 100)
  );

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const mins = Math.floor(s / 60);
    const rest = s % 60;
    return `${mins.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`;
  };

  // Toggle Play dengan aktivasi suara langsung dari user gesture
  const handleTogglePlayWithVoice = useCallback(() => {
    if (!isPlaying) {
      lastSpokenStepRef.current = activeStep;
      onTogglePlay();
      if (isVoiceEnabled) {
        speakCurrentScene(true);
      }
    } else {
      lastSpokenStepRef.current = -1;
      onTogglePlay();
      narrator.stop();
    }
  }, [isPlaying, onTogglePlay, isVoiceEnabled, activeStep, speakCurrentScene, narrator]);

  // Navigasi Babak
  const jumpToStep = (targetStep: number) => {
    sound.playClick();
    const targetTime = targetStep * sceneDuration;
    setPlaybackTime(targetTime);
    setActiveStep(targetStep);
    lastSpokenStepRef.current = targetStep;
    if (isVoiceEnabled) {
      const nextScene = storyScenes[targetStep];
      if (nextScene) {
        const text = `${nextScene.chapter}: ${nextScene.title}. ${nextScene.narration}`;
        narrator.speak(text, { force: true });
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      jumpToStep(activeStep - 1);
    }
  };

  const handleNextStep = () => {
    if (activeStep < totalSteps - 1) {
      jumpToStep(activeStep + 1);
    }
  };

  const handleReplayCurrentScene = () => {
    sound.playClick();
    jumpToStep(activeStep);
    speakCurrentScene(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#FFF8EA] select-none">
      {/* ==================================================================== */}
      {/* A. HEADER BAR VIDEO: JUDUL BAB & INDIKATOR 60FPS                     */}
      {/* ==================================================================== */}
      <div className="px-3 py-2 bg-[#FFF8EA] border-b-2 border-[#5C3A21] flex items-center justify-between gap-2 shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 clay-badge-primary flex items-center justify-center text-xs shrink-0">
            🎬
          </span>
          <div className="min-w-0">
            <h3 className="text-black text-xs sm:text-sm font-bold tracking-wide truncate">
              {topic.title}
            </h3>
            <span className="text-[10px] text-black/80 font-bold hidden sm:inline-block">
              {topic.gradeName} • {topic.subjectName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Suara Guru Indonesia */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              narrator.toggleVoice();
            }}
            className={`px-2 py-1 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold ${
              isVoiceEnabled
                ? 'clay-btn-secondary text-black'
                : 'clay-btn-neutral text-black/60'
            }`}
            title={
              isVoiceEnabled
                ? 'Suara Guru Bahasa Indonesia: Aktif (Klik untuk Matikan)'
                : 'Suara Guru Bahasa Indonesia: Mati (Klik untuk Nyalakan)'
            }
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">Suara: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-black/60" />
                <span className="hidden sm:inline">Suara: OFF</span>
              </>
            )}
          </button>

          {/* Pengubah Kecepatan 1x / 1.5x / 2x */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onChangeSpeed();
            }}
            className="px-2 py-1 clay-btn-secondary text-black text-[10px] sm:text-[11px] font-bold"
            title="Kecepatan Putar Video"
          >
            {playbackSpeed}x
          </button>

          {/* Layar Penuh Toggle */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onToggleFullscreen();
              }}
              className="w-7 h-7 clay-btn-neutral text-black flex items-center justify-center shrink-0"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh Video'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* B. PANGGUNG VISUAL KANVAS EDUKASI (CLAY-PIXEL COZY 60FPS)            */}
      {/* ==================================================================== */}
      <div className="relative flex-1 min-h-[220px] lg:min-h-0 flex items-center justify-center p-2 sm:p-3 overflow-hidden bg-[#FFF8EA]">
        {/* Kanvas Utama Animasi SVG */}
        <div
          className="relative w-full h-full max-w-2xl flex items-center justify-center cursor-pointer"
          onClick={handleTogglePlayWithVoice}
          title={isPlaying ? 'Klik untuk Jeda Video' : 'Klik untuk Putar Video'}
        >
          <EducationalVideoCanvas
            type={diagramType}
            step={activeStep}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            topic={topic}
          />

          {/* Indikator Play Tengah Saat Dijeda */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[1px] rounded-xl transition-all">
              <div className="px-4 py-2.5 clay-btn-primary text-black flex items-center gap-2 shadow-xl scale-105">
                <Play className="w-5 h-5 text-black fill-black" />
                <span className="text-black text-xs sm:text-sm font-bold uppercase tracking-wide">
                  Putar Video Edukasi
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* C. KARTU SUBTITLE & PENJELASAN NARASI SINGKAT DI ATAS KANVAS       */}
        {/* ================================================================== */}
        {currentScene && (
          <div className="absolute top-2 inset-x-2 sm:inset-x-4 max-w-xl mx-auto z-10 pointer-events-auto">
            <div className="clay-card px-3 py-1.5 text-center shadow-md bg-[#FFF8EA]/95 border-2 border-[#5C3A21]">
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs">{currentScene.icon || '📖'}</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wide truncate">
                    {currentScene.chapter}: {currentScene.title}
                  </span>
                  {isSpeaking && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 clay-badge-primary text-[9px] font-bold text-black animate-pulse">
                      <span>🗣️</span>
                      <span className="hidden sm:inline">Bercerita...</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    if (!isVoiceEnabled) {
                      narrator.setVoiceEnabled(true);
                    }
                    lastSpokenStepRef.current = activeStep;
                    speakCurrentScene(true);
                  }}
                  className={`px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold text-black shrink-0 flex items-center gap-1 shadow-sm transition-all ${
                    isSpeaking ? 'clay-btn-primary animate-pulse' : 'clay-btn-secondary'
                  }`}
                  title="Dengarkan / Ulangi Suara Penjelasan Babak Ini"
                >
                  <Volume2 className="w-3 h-3 text-black" />
                  <span>{isSpeaking ? 'Ulangi Suara' : 'Dengarkan'}</span>
                </button>
              </div>

              <p className="text-[9.5px] sm:text-[10.5px] text-black/95 font-medium leading-snug mt-1 text-left sm:text-center">
                {currentScene.narration}
              </p>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* D. BILAH INTERAKSI LANGSUNG DI DALAM VIDEO ("COBA SENDIRI")        */}
        {/* ================================================================== */}
        {/* 1. Interaksi Pecahan Pizza / Kue (Matematika SD) */}
        {diagramType === 'math_arithmetic' && (
          <div className="absolute bottom-2 inset-x-2 sm:inset-x-4 max-w-lg mx-auto z-10 pointer-events-auto">
            <div className="clay-card p-2 bg-[#FFF8EA] border-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🍕</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-black">
                  Uji Potongan:
                </span>
                {[
                  { slices: 1, label: '1 Utuh' },
                  { slices: 2, label: '1/2' },
                  { slices: 4, label: '1/4' },
                  { slices: 8, label: '3/8' },
                ].map((item) => (
                  <button
                    key={item.slices}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      setCustomSlices(item.slices);
                      if (item.slices === 1) setTakenSlices(1);
                      else if (item.slices === 2) setTakenSlices(1);
                      else if (item.slices === 4) setTakenSlices(1);
                      else setTakenSlices(3);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold ${
                      customSlices === item.slices
                        ? 'clay-btn-primary text-black'
                        : 'clay-btn-neutral text-black'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <span className="clay-badge-secondary px-2 py-0.5 text-[10px] font-bold text-black">
                {takenSlices} dari {customSlices} bagian = ({takenSlices}/{customSlices})
              </span>
            </div>
          </div>
        )}

        {/* 2. Interaksi Aljabar Kotak Misteri (Matematika SMP) */}
        {diagramType === 'cartesian_linear' && (
          <div className="absolute bottom-2 inset-x-2 sm:inset-x-4 max-w-md mx-auto z-10 pointer-events-auto">
            <div className="clay-card p-2 bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <div className="text-[10.5px] font-bold text-black">
                  Teka-teki: <strong>[ ? ] + 3 = 7</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playSuccess();
                  setMysteryChestOpen((prev) => !prev);
                }}
                className="px-2.5 py-1 clay-btn-primary text-[10.5px] font-bold text-black flex items-center gap-1"
              >
                <span>{mysteryChestOpen ? 'Tutup Kotak' : 'Buka Kotak [ ? ]'}</span>
                <span>{mysteryChestOpen ? '🔒' : '✨'}</span>
              </button>

              {mysteryChestOpen && (
                <span className="clay-badge-secondary px-2 py-0.5 text-[10.5px] font-bold text-black animate-bounce">
                  🎉 Isi kotak = 4!
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3. Interaksi Gaya Newton Dorong Gerobak (Fisika SMP/SMA) */}
        {diagramType === 'newton_dynamics' && (
          <div className="absolute bottom-2 inset-x-2 sm:inset-x-4 max-w-lg mx-auto z-10 pointer-events-auto">
            <div className="clay-card p-2 bg-[#FFF8EA] border-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-black" />
                <span className="text-[10px] sm:text-[11px] font-bold text-black">
                  Gaya F = {pushForce} N
                </span>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={pushForce}
                  onChange={(e) => {
                    e.stopPropagation();
                    setPushForce(Number(e.target.value));
                  }}
                  className="w-20 sm:w-28 accent-[#FFAE6D] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePushCart();
                  }}
                  disabled={isPushingCart}
                  className="px-2.5 py-1 clay-btn-primary text-[10.5px] font-bold text-black flex items-center gap-1"
                >
                  <span>{isPushingCart ? 'Meluncur...' : 'Dorong Gerobak!'}</span>
                  <span>🚀</span>
                </button>

                <span className="clay-badge-secondary px-2 py-0.5 text-[10px] font-bold text-black">
                  a = {(pushForce / 2).toFixed(1)} m/s²
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Interaksi Struktur Sel Pabrik Mini (Biologi SMP/SMA) */}
        {diagramType === 'cell_structure' && (
          <div className="absolute bottom-2 inset-x-2 sm:inset-x-4 max-w-lg mx-auto z-10 pointer-events-auto">
            <div className="clay-card p-1.5 sm:p-2 bg-[#FFF8EA] border-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-1.5 shadow-lg">
              <span className="text-[10px] font-bold text-black">🔍 Teliti Organel:</span>
              {[
                { id: 'nukleus', label: '🧠 Nukleus (Manajer)' },
                { id: 'mitokondria', label: '⚡ Mitokondria (Energi ATP)' },
                { id: 'membran', label: '🛡️ Membran (Satpam)' },
              ].map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    setSelectedOrganelle(org.id);
                  }}
                  className={`px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold ${
                    selectedOrganelle === org.id
                      ? 'clay-btn-primary text-black'
                      : 'clay-btn-neutral text-black'
                  }`}
                >
                  {org.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* E. FOOTER: KONTROL PEMUTAR VIDEO LENGKAP & BABAK PROGRESS             */}
      {/* ==================================================================== */}
      <div className="px-3 sm:px-4 py-2 bg-[#FFF8EA] border-t-2 border-[#5C3A21] flex flex-col gap-1.5 shrink-0 z-20">
        {/* Baris 1: Scrubber Bar Halus */}
        <div className="flex items-center gap-2.5 w-full">
          {/* Tombol Play/Pause Utama */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              handleTogglePlayWithVoice();
            }}
            className="p-1.5 clay-btn-primary text-black shrink-0"
            title={isPlaying ? 'Jeda Video' : 'Putar Video'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black" />
            )}
          </button>

          {/* Garis Track Scrubber */}
          <div
            ref={scrubberTrackRef}
            onPointerDown={(e) => {
              setIsScrubbing(true);
              handleSeekFromClientX(e.clientX);
            }}
            className="relative flex-1 h-3.5 bg-[#FFF8EA] border-2 border-[#5C3A21] rounded-full cursor-pointer overflow-visible"
          >
            <div
              className="absolute inset-y-0 left-0 bg-[#FFAE6D] rounded-full pointer-events-none transition-all duration-75"
              style={{ width: `${scrubberPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#A8E6CF] rounded-full border-2 border-[#5C3A21] -translate-x-1/2 cursor-grab active:cursor-grabbing shadow-sm"
              style={{ left: `${scrubberPercent}%` }}
            />
          </div>

          {/* Timer Display */}
          <div className="text-black text-[10px] sm:text-[11px] font-bold tracking-wider shrink-0 select-none">
            {formatTime(playbackTime)} / {formatTime(totalDuration)}
          </div>
        </div>

        {/* Baris 2: Tombol Kendali Babak (Prev, Next, Replay, Babak Dots) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              disabled={activeStep <= 0}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                handlePrevStep();
              }}
              className="px-2 py-1 clay-btn-neutral text-black text-[10.5px] font-bold disabled:opacity-40 flex items-center gap-1"
              title="Babak Sebelumnya"
            >
              <SkipBack className="w-3 h-3" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReplayCurrentScene();
              }}
              className="px-2 py-1 clay-btn-neutral text-black text-[10.5px] font-bold flex items-center gap-1"
              title="Ulangi Babak Ini Beserta Suara"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Ulangi Babak</span>
            </button>

            <button
              type="button"
              disabled={activeStep >= totalSteps - 1}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                handleNextStep();
              }}
              className="px-2 py-1 clay-btn-neutral text-black text-[10.5px] font-bold disabled:opacity-40 flex items-center gap-1"
              title="Babak Selanjutnya"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <SkipForward className="w-3 h-3" />
            </button>
          </div>

          {/* Babak Dots Navigation */}
          <div className="flex items-center gap-1.5">
            {storyScenes.map((scene, sIdx) => {
              const isActive = activeStep === sIdx;
              const isPast = activeStep > sIdx;
              return (
                <button
                  key={sIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToStep(sIdx);
                  }}
                  className={`px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold rounded-md border-2 border-[#5C3A21] transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#FFAE6D] text-black scale-105 shadow-sm'
                      : isPast
                      ? 'bg-[#A8E6CF] text-black'
                      : 'bg-[#FFF8EA] text-black/60'
                  }`}
                  title={`Lompat ke ${scene.chapter}: ${scene.title}`}
                >
                  <span>{scene.icon || '📍'}</span>
                  <span className="hidden md:inline">{scene.chapter}</span>
                  <span className="md:hidden">{sIdx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Navigasi Antar Bab / Topik Kurikulum & Tombol Pintas Kuis */}
          <div className="flex items-center gap-1">
            {onOpenQuiz && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onOpenQuiz();
                }}
                className="px-2 py-1 clay-btn-primary text-black text-[10.5px] font-bold flex items-center gap-1 shadow-sm hover:scale-105 transition-all"
                title="Buka Kuis Interaktif Berhadiah EXP di Panel Kanan"
              >
                <span className="animate-bounce">🎯</span>
                <span>Kuis EXP</span>
              </button>
            )}

            {hasPrevTopic && onPrevTopic && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onPrevTopic();
                }}
                className="px-2 py-1 clay-btn-secondary text-black text-[10.5px] font-bold"
                title="Buka Bab Materi Sebelumnya di Daftar Isi"
              >
                ◀ Bab Sebelumnya
              </button>
            )}

            {hasNextTopic && onNextTopic && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onNextTopic();
                }}
                className="px-2 py-1 clay-btn-primary text-black text-[10.5px] font-bold"
                title="Buka Bab Materi Selanjutnya di Daftar Isi"
              >
                Bab Selanjutnya ▶
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
