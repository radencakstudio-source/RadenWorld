/**
 * ============================================================================
 * FILE: resources/js/game/ui/ChatBox.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Jendela pop-up obrolan multiplayer di Kiri Atas (Top-Left), selaras dan sejajar
 * tepat di bawah profile HUD pemain.
 * 
 * ATURAN & FITUR:
 * 1. Tata Letak Rapi & Sejajar: Berada di top-[74px] md:top-[80px] left-4 md:left-5,
 *    rata kiri sempurna dengan HUD profile bar.
 * 2. Skema Warna Hitam Murni: Neutral Black (#000000, #080808, #0e0e0e) & Aksen Amber Emas (#f59e0b).
 * 3. Input & Tombol Sejajar: Input teks dan tombol aksi memiliki tinggi presisi h-9 yang simetris.
 * 4. Fitur Ekspresi (Expressions): Tombol ikon senyum untuk membuka palet ekspresi
 *    populer, memunculkan balon reaksi visual di atas kepala karakter.
 * 5. Format Waktu Rapi: Format jam [HH:mm] mono yang rata dan sejajar.
 * 6. Shortcut Enter & '/': Untuk fokus input pesan.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { IChatMessage } from '../types';
import { Send, MessageSquare, X, Smile, Sparkles } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

interface ChatBoxProps {
  messages: IChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onClose?: () => void;
  gender?: 'male' | 'female';
}

interface ICharacterExpression {
  type: 'normal' | 'smile' | 'shock' | 'angry';
  name: string;
  desc: string;
  fileMale: string;
  fileFemale: string;
  badgeBorder: string;
}

const CHARACTER_EXPRESSIONS: ICharacterExpression[] = [
  {
    type: 'normal',
    name: 'Normal',
    desc: 'Tenang & Siaga',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/NormalMale.png',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/NormalFemale.png',
    badgeBorder: 'border-amber-500/40 hover:border-amber-400',
  },
  {
    type: 'smile',
    name: 'Senang',
    desc: 'Tersenyum Ramah',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/SenangMale.png',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/SenangFemale.png',
    badgeBorder: 'border-emerald-500/40 hover:border-emerald-400',
  },
  {
    type: 'shock',
    name: 'Kaget',
    desc: 'Terkejut Heran',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/KagetMale.png',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/KagetFemale.png',
    badgeBorder: 'border-sky-500/40 hover:border-sky-400',
  },
  {
    type: 'angry',
    name: 'Marah',
    desc: 'Emosi Geram',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/MarahMale.png',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/MarahFemale.png',
    badgeBorder: 'border-rose-500/40 hover:border-rose-400',
  },
];

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onClose,
  gender = 'male',
}) => {
  const [inputText, setInputText] = useState('');
  const [showExpressions, setShowExpressions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sound = SoundManager.getInstance();

  const effectiveGender: 'male' | 'female' = gender === 'female' ? 'female' : 'male';
  const genderFolder = effectiveGender === 'female' ? 'Female' : 'Male';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global listener untuk tombol '/' memfokuskan chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        inputRef.current?.blur();
        setShowExpressions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fokus otomatis ke input saat chat box dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    sound.playClick();
    onSendMessage(trimmed);
    setInputText('');
    setShowExpressions(false);
    inputRef.current?.blur();
  };

  const handleTriggerCharacterExpression = (expr: ICharacterExpression) => {
    sound.playSuccess();
    // Munculkan balon reaksi visual di atas kepala karakter di Phaser & sinkron ke multiplayer
    EventBus.emit('trigger-expression', { type: expr.type });
    setShowExpressions(false);
    inputRef.current?.blur();
  };

  const handleInsertEmoji = (emoji: string) => {
    sound.playClick();
    setInputText((prev) => prev + emoji + ' ');
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-[68px] md:top-[72px] left-4 md:left-5 z-40 w-80 sm:w-96 md:w-[410px] flex flex-col bg-black border border-neutral-800 rounded-md overflow-hidden transition-all pointer-events-auto font-['Chakra_Petch'] animate-in fade-in slide-in-from-top-1 duration-150">
      
      {/* 1. HEADER CHAT: Rata & Sejajar Presisi (Flat Minimalist) */}
      <div className="px-3.5 py-2.5 border-b border-neutral-800 bg-[#0a0a0a] flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-wider">OBROLAN DUNIA</span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tombol Toggle Palet Ekspresi Karakter */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowExpressions(!showExpressions);
            }}
            className={`h-7 px-2.5 rounded text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
              showExpressions
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-neutral-900 text-amber-400 border-neutral-800 hover:border-amber-400 hover:bg-neutral-800'
            }`}
            title="Buka Palet Reaksi Ekspresi Wajah Karakter"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>EKSPRESI</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="h-7 w-7 rounded flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-all cursor-pointer border border-transparent hover:border-neutral-700"
              title="Tutup Obrolan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DRAWER PALET REAKSI EKSPRESI KARAKTER (Grid Simetris 4 Kolom) */}
      {showExpressions && (
        <div className="p-3 bg-[#0d0d0d] border-b border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              REAKSI KARAKTER ({genderFolder.toUpperCase()}):
            </span>
            <span className="text-[9px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 font-mono">
              Balon Di Atas Kepala
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CHARACTER_EXPRESSIONS.map((expr) => {
              const imageSrc = effectiveGender === 'female' ? expr.fileFemale : expr.fileMale;
              return (
                <button
                  key={expr.type}
                  type="button"
                  onClick={() => handleTriggerCharacterExpression(expr)}
                  className="group flex flex-col items-center justify-center p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 hover:bg-neutral-800 transition-all cursor-pointer"
                  title={`Munculkan reaksi wajah ${expr.name} di atas kepala`}
                >
                  <div className="relative w-full h-12 rounded-lg overflow-hidden bg-black border border-neutral-800 p-1 flex items-center justify-center group-hover:border-amber-400/40 transition-colors">
                    <img
                      src={imageSrc}
                      alt={expr.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 mt-1 uppercase tracking-wider group-hover:text-amber-200">
                    {expr.name}
                  </span>
                  <span className="text-[8px] text-neutral-400 scale-90 truncate max-w-full">
                    {expr.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAFTAR PESAN OBROLAN: Rapi, Sejajar, & Tidak Berantakan */}
      <div className="p-3 max-h-52 min-h-36 overflow-y-auto space-y-1.5 text-xs custom-scrollbar bg-black/90">
        {messages.length === 0 ? (
          <div className="text-neutral-500 text-center py-7 text-[11px] italic">
            Belum ada obrolan. Ketik pesan di bawah untuk menyapa pemain lain di RadenWorld!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSystem = msg.senderId === 'system' || msg.senderId === 'npc' || msg.senderName === 'SISTEM';
            const isSuper =
              msg.isSuperAdmin ||
              msg.senderRole === 'super_admin' ||
              msg.senderName?.toUpperCase() === 'RADEN' ||
              msg.senderName?.includes('RADEN');

            let timeText = msg.timestamp;
            if (typeof timeText === 'number' || (typeof timeText === 'string' && /^\d{10,14}$/.test(timeText))) {
              const d = new Date(Number(timeText));
              timeText = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            }

            return (
              <div
                key={`${msg.id || 'msg'}_${idx}`}
                className={`flex items-start gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors leading-relaxed ${
                  isSuper
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : isSystem
                      ? 'bg-neutral-900/60 border border-neutral-800'
                      : 'hover:bg-neutral-900/40'
                }`}
              >
                <span className="text-[10px] text-neutral-500 font-mono shrink-0 pt-0.5">
                  [{timeText}]
                </span>

                <div className="flex-1 min-w-0 break-words">
                  {isSuper && (
                    <span className="inline-block bg-amber-400 text-black font-black text-[9px] px-1.5 py-0.2 rounded mr-1 align-baseline">
                      👑 ADMIN
                    </span>
                  )}
                  {isSystem && (
                    <span className="inline-block bg-neutral-800 text-amber-400 font-bold text-[9px] px-1.5 py-0.2 rounded border border-neutral-700 mr-1 align-baseline">
                      SISTEM
                    </span>
                  )}
                  <span
                    className={`font-bold mr-1.5 ${
                      isSuper ? 'text-amber-300' : isSystem ? 'text-amber-400' : 'text-amber-400'
                    }`}
                  >
                    {msg.senderName}:
                  </span>
                  <span
                    className={
                      isSuper ? 'text-amber-100 font-medium' : isSystem ? 'text-amber-200' : 'text-neutral-200'
                    }
                  >
                    {msg.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. BARIS CEPAT EMOJI: Simetris & Responsif */}
      <div className="px-3 py-1.5 bg-[#0a0a0a] border-t border-neutral-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-amber-500/70 shrink-0 font-mono">CEPAT:</span>
        {['👋', '😊', '😂', '👑', '⚔️', '❤️', '⚡', '🔥'].map((em, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleInsertEmoji(em)}
            className="w-6 h-6 rounded-md hover:bg-neutral-800 flex items-center justify-center text-xs hover:scale-125 transition-transform cursor-pointer"
            title={`Tambahkan ${em} ke input teks`}
          >
            {em}
          </button>
        ))}
      </div>

      {/* 5. FORM INPUT: Rata, Sejajar, Presisi Tinggi h-9 */}
      <form onSubmit={handleSubmit} className="p-2.5 border-t border-neutral-800 flex items-center gap-2 bg-[#080808]">
        {/* Tombol Ekspresi */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowExpressions(!showExpressions);
          }}
          className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            showExpressions
              ? 'bg-amber-500 text-black border-amber-400'
              : 'bg-neutral-900 text-amber-400 border-neutral-800 hover:bg-neutral-800 hover:border-amber-400'
          }`}
          title="Pilih Ekspresi & Emotikon"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Kotak Input Teks */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          placeholder="Ketik pesan atau tekan '/'..."
          maxLength={120}
          className="flex-1 h-9 px-3 bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-md text-xs text-amber-200 placeholder-neutral-500 font-['Chakra_Petch'] outline-none transition-colors"
        />

        {/* Tombol Kirim */}
        <button
          type="submit"
          className="h-9 px-3.5 rounded-md bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-amber-400"
          title="Kirim Pesan"
        >
          <span>KIRIM</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
