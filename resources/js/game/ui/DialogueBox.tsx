/**
 * ============================================================================
 * FILE: resources/js/game/ui/DialogueBox.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kotak Dialog Narasi NPC bergaya Cozy RPG (Simpel, Lucu, Lembut & Elegan).
 * Keunggulan Desain:
 * 1. Simpel & Lucu: Avatar chibi imut, sudut bulat lembut (rounded-3xl), tema warna hangat kohesif.
 * 2. Ga Banyak Warna: Palet warna terpadu (Cozy Slate + Honey Gold + Warm White).
 * 3. Ga Kedip-Kedip: Bebas animasi berkedip/flicker (tanpa pulse dot, tanpa kursor kedip).
 * 4. Ga Naik Turun: Ukuran kotak dan posisi tombol bersifat tetap (fixed height) sehingga
 *    layout stabil 100% tanpa gesekan atau lompatan posisi saat berpindah halaman teks.
 * 5. Kunci Gerakan: Karakter lokal otomatis dibekukan (tidak bisa bergerak) selama
 *    dialog berlangsung sampai pemain menyelesaikan atau melewati percakapan.
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, FastForward, Check } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';

export interface INpcDialogueData {
  id: string;
  name: string;
  role: string;
  avatarType?: 'sage' | 'blacksmith' | 'alchemist' | 'merchant' | 'guard' | 'fisherman' | 'farmer' | 'elder';
  avatarUrl?: string;
  dialogues: string[];
}

export const DialogueBox: React.FC = () => {
  const [dialogue, setDialogue] = useState<INpcDialogueData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const sound = SoundManager.getInstance();

  // Buka dialog saat menerima event dari Phaser (WorldScene)
  useEffect(() => {
    const handleOpenDialogue = (data: INpcDialogueData) => {
      sound.playClick();
      setDialogue(data);
      setCurrentPage(0);
      // Kunci karakter agar tidak bisa bergerak selama berdialog
      EventBus.emit('dialogue-active', true);
    };

    const handleCloseDialogue = () => {
      setDialogue(null);
      setCurrentPage(0);
      // Buka kunci pergerakan karakter kembali
      EventBus.emit('dialogue-active', false);
    };

    EventBus.on('open-dialogue', handleOpenDialogue);
    EventBus.on('close-dialogue', handleCloseDialogue);

    return () => {
      EventBus.off('open-dialogue', handleOpenDialogue);
      EventBus.off('close-dialogue', handleCloseDialogue);
      EventBus.emit('dialogue-active', false);
    };
  }, [sound]);

  // Efek Typewriter Teks yang mengalir tenang tanpa kedipan
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
    }, 12);

    return () => {
      clearInterval(typingInterval);
    };
  }, [dialogue, currentPage]);

  const closeDialogue = useCallback(() => {
    setDialogue(null);
    setCurrentPage(0);
    // Bebaskan pergerakan karakter saat dialog ditutup
    EventBus.emit('dialogue-active', false);
  }, []);

  const handleNext = useCallback(() => {
    sound.playClick();
    if (!dialogue) return;

    // Jika sedang animasi teks mengalir, klik Next langsung selesaikan teks halaman ini
    if (isTyping) {
      setDisplayedText(dialogue.dialogues[currentPage]);
      setIsTyping(false);
      return;
    }

    if (currentPage < dialogue.dialogues.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      // Selesai seluruh halaman dialog
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

  // Kontrol Keyboard (Space / Enter / E / ArrowRight = Next, ArrowLeft = Before, Escape = Skip)
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

  // Render Potret Ilustrasi Avatar Karakter NPC (Mendukung gambar aset asli & fallback SVG Chibi)
  const renderNpcPortrait = () => {
    if (dialogue.avatarUrl) {
      return (
        <img
          src={dialogue.avatarUrl}
          alt={dialogue.name}
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      );
    }

    const avatarType = dialogue.avatarType || 'sage';

    switch (avatarType) {
      case 'sage':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#1e1b4b" />
            {/* Chibi Body */}
            <path d="M22 52 L16 80 L64 80 L58 52 Z" fill="#6d28d9" />
            <path d="M37 52 L37 80 L43 80 L43 52 Z" fill="#fbbf24" />
            {/* Chibi Round Head */}
            <circle cx="40" cy="38" r="16" fill="#fed7aa" />
            {/* Cute Beard */}
            <polygon points="30,44 50,44 40,64" fill="#f8fafc" />
            {/* Cute Black Eyes */}
            <circle cx="35" cy="36" r="2.2" fill="#0f172a" />
            <circle cx="45" cy="36" r="2.2" fill="#0f172a" />
            {/* Starry Wizard Hat */}
            <polygon points="40,8 18,32 62,32" fill="#7c3aed" />
            <ellipse cx="40" cy="32" rx="24" ry="5.5" fill="#5b21b6" />
            <circle cx="40" cy="10" r="3.5" fill="#fbbf24" />
          </svg>
        );

      case 'blacksmith':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#3b1d11" />
            <path d="M22 54 L18 80 L62 80 L58 54 Z" fill="#78350f" />
            <circle cx="40" cy="38" r="16" fill="#fed7aa" />
            {/* Red Bandana */}
            <path d="M24 34 Q40 16 56 34" fill="#dc2626" />
            <rect x="24" y="28" width="32" height="6" fill="#dc2626" rx="2" />
            {/* Cute Hammer on back */}
            <rect x="54" y="24" width="6" height="26" fill="#94a3b8" transform="rotate(25 54 24)" />
            <rect x="50" y="16" width="16" height="10" fill="#475569" rx="2" transform="rotate(25 50 16)" />
            {/* Eyes & Mustache */}
            <circle cx="35" cy="36" r="2.2" fill="#0f172a" />
            <circle cx="45" cy="36" r="2.2" fill="#0f172a" />
            <path d="M33 44 Q40 40 47 44" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'alchemist':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#064e3b" />
            <path d="M22 54 L16 80 L64 80 L58 54 Z" fill="#047857" />
            {/* Green Potion */}
            <circle cx="26" cy="66" r="7" fill="#10b981" />
            <rect x="24" y="55" width="4" height="6" fill="#6ee7b7" rx="1" />
            {/* Head & Hair */}
            <circle cx="40" cy="38" r="16" fill="#fef3c7" />
            <path d="M24 34 Q40 18 56 34 L54 50 L26 50 Z" fill="#b45309" />
            {/* Round Glasses */}
            <circle cx="34" cy="37" r="4.5" fill="none" stroke="#fbbf24" strokeWidth="1.8" />
            <circle cx="46" cy="37" r="4.5" fill="none" stroke="#fbbf24" strokeWidth="1.8" />
            <line x1="38.5" y1="37" x2="41.5" y2="37" stroke="#fbbf24" strokeWidth="1.8" />
            <circle cx="34" cy="37" r="1.8" fill="#0f172a" />
            <circle cx="46" cy="37" r="1.8" fill="#0f172a" />
          </svg>
        );

      case 'merchant':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#713f12" />
            <path d="M22 54 L18 80 L62 80 L58 54 Z" fill="#d97706" />
            <circle cx="40" cy="38" r="16" fill="#fed7aa" />
            {/* Turban */}
            <ellipse cx="40" cy="27" rx="18" ry="9" fill="#b45309" />
            <circle cx="40" cy="24" r="3" fill="#38bdf8" />
            {/* Eyes & Warm Smile */}
            <circle cx="35" cy="37" r="2.2" fill="#0f172a" />
            <circle cx="45" cy="37" r="2.2" fill="#0f172a" />
            <path d="M35 44 Q40 48 45 44" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );

      case 'guard':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#1e3a8a" />
            <path d="M20 54 L14 80 L66 80 L60 54 Z" fill="#2563eb" />
            <path d="M28 54 L24 80 L56 80 L52 54 Z" fill="#94a3b8" />
            {/* Silver Helmet */}
            <circle cx="40" cy="37" r="16" fill="#cbd5e1" />
            <path d="M24 37 L56 37 L54 44 L26 44 Z" fill="#1e293b" />
            {/* Red Feather Plume */}
            <path d="M40 21 Q46 9 52 16 Q48 23 40 22" fill="#ef4444" />
            {/* Blue Eyes Visor */}
            <rect x="30" y="39" width="20" height="3" fill="#38bdf8" rx="1" />
          </svg>
        );

      case 'fisherman':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#0369a1" />
            <path d="M22 54 L18 80 L62 80 L58 54 Z" fill="#0284c7" />
            <circle cx="40" cy="38" r="16" fill="#fed7aa" />
            {/* Straw Hat */}
            <polygon points="40,16 16,32 64,32" fill="#ca8a04" />
            <ellipse cx="40" cy="32" rx="24" ry="5" fill="#a16207" />
            <circle cx="35" cy="38" r="2.2" fill="#0f172a" />
            <circle cx="45" cy="38" r="2.2" fill="#0f172a" />
            <path d="M36 44 Q40 47 44 44" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );

      case 'farmer':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#14532d" />
            <path d="M22 54 L18 80 L62 80 L58 54 Z" fill="#1e3a8a" />
            <circle cx="40" cy="38" r="16" fill="#fef3c7" />
            {/* Conical Straw Hat */}
            <polygon points="40,12 12,32 68,32" fill="#eab308" />
            {/* Wheat Stalk */}
            <line x1="38" y1="46" x2="54" y2="40" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="54" cy="40" rx="3.5" ry="1.8" fill="#eab308" />
            <circle cx="35" cy="37" r="2.2" fill="#0f172a" />
            <circle cx="45" cy="37" r="2.2" fill="#0f172a" />
          </svg>
        );

      case 'elder':
      default:
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="#064e3b" />
            <path d="M22 54 L16 80 L64 80 L58 54 Z" fill="#065f46" />
            <circle cx="40" cy="38" r="16" fill="#fed7aa" />
            {/* Leaf Crown */}
            <path d="M22 32 Q40 16 58 32" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
            <circle cx="28" cy="28" r="2.8" fill="#86efac" />
            <circle cx="40" cy="20" r="3.8" fill="#4ade80" />
            <circle cx="52" cy="28" r="2.8" fill="#86efac" />
            {/* Silver Hair */}
            <path d="M26 34 L22 56 L28 54 L32 34 Z" fill="#cbd5e1" />
            <path d="M54 34 L58 56 L52 54 L48 34 Z" fill="#cbd5e1" />
            <circle cx="35" cy="37" r="2.2" fill="#064e3b" />
            <circle cx="45" cy="37" r="2.2" fill="#064e3b" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] z-50 flex justify-center px-2 sm:px-4 md:px-8 pointer-events-auto font-['Chakra_Petch']">
      {/* Box Utama Dialog RPG: Flat Pure Black (Tanpa Shadow & Tanpa Efek Biru) */}
      <div className="relative w-full max-w-3xl bg-black border border-neutral-800 rounded-2xl p-3 sm:p-4 md:p-5 text-white min-h-[140px] max-h-[38dvh] flex flex-col justify-between select-none shadow-xl">
        
        {/* 1. HEADER: NAMA NPC, ROLE & HALAMAN */}
        <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base md:text-lg font-bold text-amber-300 tracking-wide">
              {dialogue.name}
            </span>
            <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-amber-200 bg-neutral-900 border border-neutral-800 px-2 sm:px-2.5 py-0.5 rounded-full">
              {dialogue.role}
            </span>
          </div>

          <span className="text-[10px] sm:text-xs font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 sm:px-2.5 py-0.5 rounded-full">
            {currentPage + 1} / {totalPages}
          </span>
        </div>

        {/* 2. BODY: POTRET CHIBI IMUT & TEXT NARASI */}
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 flex-1 my-1 sm:my-1.5 overflow-hidden">
          {/* Avatar Chibi Imut */}
          <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center overflow-hidden">
            {renderNpcPortrait()}
          </div>

          {/* Area Teks Narasi */}
          <div className="flex-1 h-full flex items-center overflow-hidden px-1">
            <p className="font-sans font-medium text-neutral-100 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3">
              {displayedText}
            </p>
          </div>
        </div>

        {/* 3. FOOTER: 3 TOMBOL KONTROL SIMPEL */}
        <div className="flex items-center justify-between pt-1 sm:pt-1.5 border-t border-neutral-800">
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            💡 Tekan <kbd className="px-1.5 py-0.2 bg-neutral-900 border border-neutral-700 rounded text-amber-300 font-mono text-[10px]">Space</kbd> / <kbd className="px-1.5 py-0.2 bg-neutral-900 border border-neutral-700 rounded text-amber-300 font-mono text-[10px]">Enter</kbd> untuk Lanjut
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {/* Tombol SEBELUMNYA (Before) */}
            <button
              onClick={handleBefore}
              disabled={isFirstPage}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                isFirstPage
                  ? 'opacity-30 cursor-not-allowed bg-neutral-900 text-neutral-600 border border-neutral-800'
                  : 'bg-neutral-900 text-neutral-200 border border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
              title="Kembali ke narasi sebelumnya (Panah Kiri)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Tombol LEWATI (Skip) */}
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold bg-neutral-900 text-neutral-300 border border-neutral-700 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
              title="Lewati percakapan (Escape)"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Lewati</span>
            </button>

            {/* Tombol LANJUT (Next / Selesai) */}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 md:px-5 py-1.5 rounded-xl text-xs md:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all cursor-pointer"
              title="Lanjut narasi (Space / Enter)"
            >
              {isLastPage ? (
                <>
                  <span>Selesai</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Lanjut</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
