/**
 * ============================================================================
 * FILE: resources/js/game/ui/DialogueBox.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kotak Dialog Narasi NPC bergaya Cozycore RPG Clay-Pixel:
 * - Panel #FFF8EA dengan outline 2px #5C3A21, bebas :hover & bebas glow.
 * - Bingkai potret karakter ekspresif + indikator bicara dan progress halaman.
 * - Area balon teks kontras tinggi (#000000 di atas kartu bersih) yang bisa
 *   diketuk langsung untuk mempercepat ketikan atau lanjut ke halaman berikutnya.
 * - Responsif penuh di PC Desktop, Mobile Portrait, dan Mobile Landscape.
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, FastForward, Check, MessageSquare, X } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';

export interface INpcDialogueOption {
  label: string;
  actionEvent?: string;
  actionPayload?: any;
  onSelect?: () => void;
}

export interface INpcDialogueData {
  id: string;
  name: string;
  role: string;
  avatarType?:
    | 'sage'
    | 'blacksmith'
    | 'alchemist'
    | 'merchant'
    | 'guard'
    | 'fisherman'
    | 'farmer'
    | 'elder'
    | 'teacher'
    | 'barista'
    | 'librarian'
    | 'banker';
  avatarUrl?: string;
  dialogues: string[];
  options?: INpcDialogueOption[];
}

export const DialogueBox: React.FC = () => {
  const [dialogue, setDialogue] = useState<INpcDialogueData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const sound = SoundManager.getInstance();

  useEffect(() => {
    const handleOpenDialogue = (data: INpcDialogueData) => {
      if (!data || !Array.isArray(data.dialogues) || data.dialogues.length === 0) return;
      sound.playClick();
      setDialogue(data);
      setCurrentPage(0);
      EventBus.emit('dialogue-active', true);
    };

    const handleCloseDialogue = () => {
      setDialogue(null);
      setCurrentPage(0);
      EventBus.emit('close-dialogue');
      EventBus.emit('dialogue-active', false);
    };

    EventBus.on('open-dialogue', handleOpenDialogue);
    EventBus.on('close-dialogue', handleCloseDialogue);

    return () => {
      EventBus.off('open-dialogue', handleOpenDialogue);
      EventBus.off('close-dialogue', handleCloseDialogue);
      EventBus.emit('close-dialogue');
      EventBus.emit('dialogue-active', false);
    };
  }, [sound]);

  useEffect(() => {
    if (!dialogue || !dialogue.dialogues[currentPage]) {
      setDisplayedText('');
      return;
    }

    const fullText = dialogue.dialogues[currentPage];
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const typingInterval = window.setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));

      if (charIndex >= fullText.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 14);

    return () => {
      clearInterval(typingInterval);
    };
  }, [dialogue, currentPage]);

  const closeDialogue = useCallback(() => {
    setDialogue(null);
    setCurrentPage(0);
    EventBus.emit('close-dialogue');
    EventBus.emit('dialogue-active', false);
  }, []);

  const handleNext = useCallback(() => {
    sound.playClick();
    if (!dialogue) return;

    if (isTyping) {
      setDisplayedText(dialogue.dialogues[currentPage]);
      setIsTyping(false);
      return;
    }

    if (currentPage < dialogue.dialogues.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      closeDialogue();
    }
  }, [dialogue, currentPage, isTyping, sound, closeDialogue]);

  const handleBefore = useCallback(() => {
    sound.playClick();
    if (!dialogue || currentPage <= 0) return;
    setCurrentPage((prev) => prev - 1);
  }, [dialogue, currentPage, sound]);

  const handleSkip = useCallback(() => {
    sound.playClick();
    closeDialogue();
  }, [sound, closeDialogue]);

  const handleSelectOption = useCallback(
    (opt: INpcDialogueOption) => {
      sound.playClick();
      closeDialogue();
      if (opt.onSelect) opt.onSelect();
      if (opt.actionEvent) {
        EventBus.emit(opt.actionEvent, opt.actionPayload);
      }
    },
    [sound, closeDialogue]
  );

  useEffect(() => {
    if (!dialogue) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleBefore();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogue, handleNext, handleBefore, handleSkip]);

  if (!dialogue) return null;

  const totalPages = dialogue.dialogues.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  // Deteksi otomatis gaya avatar berdasarkan role apabila avatarType tidak dispesifikasikan
  const resolveAvatarType = () => {
    if (dialogue.avatarType) return dialogue.avatarType;
    const roleLower = `${dialogue.name} ${dialogue.role}`.toLowerCase();
    if (roleLower.includes('polisi') || roleLower.includes('keamanan')) return 'guard';
    if (roleLower.includes('apotek') || roleLower.includes('dokter') || roleLower.includes('medis')) return 'alchemist';
    if (roleLower.includes('nelayan') || roleLower.includes('pancing')) return 'fisherman';
    if (roleLower.includes('tani') || roleLower.includes('kebun')) return 'farmer';
    if (roleLower.includes('makelar') || roleLower.includes('bank') || roleLower.includes('barista') || roleLower.includes('dagang')) return 'merchant';
    if (roleLower.includes('guru') || roleLower.includes('kepala sekolah') || roleLower.includes('pustaka')) return 'sage';
    return 'elder';
  };

  const renderNpcPortrait = () => {
    if (dialogue.avatarUrl) {
      return (
        <img
          src={dialogue.avatarUrl}
          alt={dialogue.name}
          className="w-full h-full object-contain pixelated"
        />
      );
    }

    const avatarType = resolveAvatarType();

    switch (avatarType) {
      case 'sage':
      case 'teacher':
      case 'librarian':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#A8E6CF" />
            <path d="M20 54 L14 76 L66 76 L60 54 Z" fill="#5C3A21" />
            <path d="M36 54 L36 76 L44 76 L44 54 Z" fill="#FFAE6D" />
            <circle cx="40" cy="36" r="16" fill="#FED7AA" stroke="#5C3A21" strokeWidth="2" />
            <path d="M24 33 Q40 16 56 33 Z" fill="#5C3A21" />
            <circle cx="34" cy="36" r="4" fill="none" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="46" cy="36" r="4" fill="none" stroke="#5C3A21" strokeWidth="2" />
            <line x1="38" y1="36" x2="42" y2="36" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="34" cy="36" r="1.8" fill="#000000" />
            <circle cx="46" cy="36" r="1.8" fill="#000000" />
            <path d="M35 44 Q40 47 45 44" stroke="#5C3A21" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'blacksmith':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#FFAE6D" />
            <path d="M22 54 L18 76 L62 76 L58 54 Z" fill="#5C3A21" />
            <circle cx="40" cy="38" r="16" fill="#FED7AA" stroke="#5C3A21" strokeWidth="2" />
            <rect x="24" y="26" width="32" height="7" fill="#D97706" rx="2" stroke="#5C3A21" strokeWidth="1.5" />
            <circle cx="35" cy="37" r="2.2" fill="#000000" />
            <circle cx="45" cy="37" r="2.2" fill="#000000" />
            <path d="M33 45 Q40 41 47 45" stroke="#5C3A21" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'alchemist':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#A8E6CF" />
            <path d="M20 54 L16 76 L64 76 L60 54 Z" fill="#FFFFFF" stroke="#5C3A21" strokeWidth="2" />
            <rect x="37" y="59" width="6" height="12" fill="#10B981" />
            <rect x="34" y="62" width="12" height="6" fill="#10B981" />
            <circle cx="40" cy="37" r="16" fill="#FEF3C7" stroke="#5C3A21" strokeWidth="2" />
            <path d="M24 33 Q40 17 56 33" fill="#92400E" />
            <circle cx="34" cy="37" r="2.2" fill="#000000" />
            <circle cx="46" cy="37" r="2.2" fill="#000000" />
            <path d="M36 44 Q40 47 44 44" stroke="#5C3A21" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'merchant':
      case 'barista':
      case 'banker':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#FFAE6D" />
            <path d="M20 54 L16 76 L64 76 L60 54 Z" fill="#5C3A21" />
            <polygon points="36,54 44,54 40,65" fill="#FFF8EA" />
            <circle cx="40" cy="37" r="16" fill="#FED7AA" stroke="#5C3A21" strokeWidth="2" />
            <ellipse cx="40" cy="25" rx="18" ry="8" fill="#92400E" stroke="#5C3A21" strokeWidth="1.5" />
            <circle cx="35" cy="37" r="2.2" fill="#000000" />
            <circle cx="45" cy="37" r="2.2" fill="#000000" />
            <path d="M35 44 Q40 48 45 44" stroke="#5C3A21" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'guard':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#A8E6CF" />
            <path d="M20 54 L14 76 L66 76 L60 54 Z" fill="#1E3A8A" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="48" cy="63" r="3.5" fill="#FBBF24" />
            <circle cx="40" cy="38" r="15" fill="#FED7AA" stroke="#5C3A21" strokeWidth="2" />
            <path d="M22 29 L58 29 L54 20 L26 20 Z" fill="#1E3A8A" stroke="#5C3A21" strokeWidth="1.8" />
            <rect x="21" y="29" width="38" height="4" rx="2" fill="#0F172A" />
            <circle cx="35" cy="38" r="2.2" fill="#000000" />
            <circle cx="45" cy="38" r="2.2" fill="#000000" />
            <line x1="35" y1="45" x2="45" y2="45" stroke="#5C3A21" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );
      case 'fisherman':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#A8E6CF" />
            <path d="M22 54 L18 76 L62 76 L58 54 Z" fill="#0284C7" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="40" cy="39" r="15" fill="#FED7AA" stroke="#5C3A21" strokeWidth="2" />
            <polygon points="40,14 14,31 66,31" fill="#F59E0B" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="35" cy="39" r="2.2" fill="#000000" />
            <circle cx="45" cy="39" r="2.2" fill="#000000" />
            <path d="M35 45 Q40 48 45 45" stroke="#5C3A21" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'farmer':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#A8E6CF" />
            <path d="M22 54 L18 76 L62 76 L58 54 Z" fill="#15803D" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="40" cy="39" r="15" fill="#FEF3C7" stroke="#5C3A21" strokeWidth="2" />
            <polygon points="40,13 13,31 67,31" fill="#EAB308" stroke="#5C3A21" strokeWidth="2" />
            <circle cx="35" cy="39" r="2.2" fill="#000000" />
            <circle cx="45" cy="39" r="2.2" fill="#000000" />
            <path d="M35 45 Q40 48 45 45" stroke="#5C3A21" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'elder':
      default:
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="4" y="4" width="72" height="72" rx="14" fill="#FFAE6D" />
            <path d="M20 54 L16 76 L64 76 L60 54 Z" fill="#5C3A21" />
            <circle cx="40" cy="37" r="16" fill="#FED7AA" stroke="#5C3A21" strokeWidth="2" />
            <path d="M24 31 Q40 16 56 31" fill="#F1F5F9" stroke="#5C3A21" strokeWidth="1.5" />
            <circle cx="35" cy="37" r="2.2" fill="#000000" />
            <circle cx="45" cy="37" r="2.2" fill="#000000" />
            <path d="M34 45 Q40 49 46 45" stroke="#5C3A21" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-2 sm:px-4 md:px-6 pointer-events-auto"
      style={{
        bottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
      }}
    >
      <div className="clay-panel w-full max-w-3xl overflow-hidden text-black max-h-[52dvh] landscape:max-md:max-h-[68dvh] flex flex-col select-none">
        {/* 1. HEADER PITA NAMA PEMBICARA & PROGRESS DIALOG */}
        <div className="clay-header px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5 stroke-[2.5] text-black" />
            </span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
              {dialogue.name}
            </span>
            <span className="clay-badge-secondary text-[10px] sm:text-xs font-bold text-black px-2 py-0.5 shrink-0 max-w-[140px] sm:max-w-none truncate">
              {dialogue.role}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center gap-1 mr-1">
                {dialogue.dialogues.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 rounded-full border border-[#5C3A21] ${
                      idx === currentPage
                        ? 'w-4 bg-[#A8E6CF]'
                        : idx < currentPage
                        ? 'w-2 bg-[#5C3A21]'
                        : 'w-2 bg-[#FFF8EA]'
                    }`}
                  />
                ))}
              </div>
            )}

            <span className="clay-badge-neutral text-[10px] sm:text-xs font-bold text-black px-2 py-0.5">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={handleSkip}
              className="clay-btn-cocoa w-6 h-6 flex items-center justify-center text-white"
              title="Tutup Dialog (Esc)"
              aria-label="Tutup Dialog"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* 2. BODY: POTRET KARAKTER & BALON TEKS INTERAKTIF */}
        <div className="flex items-stretch gap-2.5 sm:gap-3.5 flex-1 min-h-0 p-2.5 sm:p-3.5 bg-[#FFF8EA] overflow-hidden">
          {/* Bingkai Potret Chibi */}
          <div className="shrink-0 flex flex-col items-center justify-between gap-1.5">
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 landscape:max-md:w-14 landscape:max-md:h-14 rounded-xl bg-[#FFF8EA] border-2 border-[#5C3A21] p-1 flex items-center justify-center overflow-hidden">
              {renderNpcPortrait()}
              <span
                className={`absolute bottom-0.5 right-0.5 px-1 rounded border border-[#5C3A21] text-[8px] font-bold leading-tight ${
                  isTyping ? 'bg-[#FFAE6D] text-black' : 'bg-[#A8E6CF] text-black'
                }`}
              >
                {isTyping ? '...' : '✓'}
              </span>
            </div>
          </div>

          {/* Balon Percakapan (Ketuk untuk selesaikan ketikan / lanjut) */}
          <div
            onClick={handleNext}
            role="button"
            tabIndex={-1}
            className="flex-1 min-w-0 bg-white border-2 border-[#5C3A21] rounded-xl p-2.5 sm:p-3.5 overflow-y-auto custom-scrollbar cursor-pointer flex flex-col justify-between gap-2"
            style={{ boxShadow: 'inset 0 2px 0 #FFF8EA' }}
            title="Ketuk untuk mempercepat teks atau lanjut"
          >
            <p className="font-bold text-black text-xs sm:text-sm md:text-[15px] leading-relaxed">
              {displayedText}
              {isTyping && <span className="inline-block ml-0.5 text-black">▮</span>}
            </p>

            {/* Pilihan Aksi Opsional (Jika NPC menyediakan tombol aksi di halaman terakhir) */}
            {!isTyping && isLastPage && dialogue.options && dialogue.options.length > 0 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#5C3A21]/25"
              >
                {dialogue.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold text-black ${
                      idx === 0 ? 'clay-btn-primary' : 'clay-btn-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. FOOTER NAVIGASI DIALOG */}
        <div className="px-3 sm:px-4 py-2 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center justify-between gap-2 shrink-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-black hidden md:flex items-center gap-1">
            <span>Pintasan:</span>
            <kbd className="clay-badge-secondary px-1.5 py-0.5 text-[10px]">Space</kbd>
            <kbd className="clay-badge-secondary px-1.5 py-0.5 text-[10px]">Enter</kbd>
            <span>Lanjut •</span>
            <kbd className="clay-badge-neutral px-1.5 py-0.5 text-[10px]">Esc</kbd>
            <span>Tutup</span>
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {totalPages > 1 && (
              <button
                type="button"
                onClick={handleBefore}
                disabled={isFirstPage}
                className="clay-btn-neutral flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-black"
                title="Kembali ke halaman sebelumnya (Panah Kiri)"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Balik</span>
              </button>
            )}

            {!isLastPage && (
              <button
                type="button"
                onClick={handleSkip}
                className="clay-btn-secondary flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-black"
                title="Lewati percakapan (Esc)"
              >
                <FastForward className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Lewati</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="clay-btn-primary flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 text-[11px] sm:text-xs font-bold text-black"
              title="Lanjut narasi (Space / Enter)"
            >
              {isTyping ? (
                <>
                  <span>Tampilkan</span>
                  <FastForward className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              ) : isLastPage ? (
                <>
                  <span>Selesai</span>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </>
              ) : (
                <>
                  <span>Lanjut</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
