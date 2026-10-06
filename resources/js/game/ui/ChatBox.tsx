/**
 * ============================================================================
 * FILE: resources/js/game/ui/ChatBox.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Jendela pop-up obrolan multiplayer di Kiri Atas (Top-Left) tepat di bawah
 * tombol chat.
 * 
 * ATURAN & SPESIFIKASI:
 * 1. Posisi Pop Chat: Kiri Atas (Top-Left) mengambang selaras dengan tombol obrolan.
 * 2. Skema 2 Warna Ketat: Obsidian Gelap (#0a0f1d) & Amber Emas (#f59e0b).
 * 3. Shortcut Enter: Untuk fokus input pesan.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { IChatMessage } from '../types';
import { Send, MessageSquare, X } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

interface ChatBoxProps {
  messages: IChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sound = SoundManager.getInstance();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global listener untuk tombol 'Enter' memfokuskan chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sound.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
    inputRef.current?.blur();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-28 left-4 z-40 w-80 md:w-96 flex flex-col bg-[#0a0f1d]/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden transition-all pointer-events-auto font-['Chakra_Petch']">
      {/* Header Pop-up Chat di Kiri Atas */}
      <div className="px-3.5 py-2 border-b border-amber-500/30 bg-[#0a0f1d] flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
          <span>OBROLAN (WORLD CHAT)</span>
        </div>
        {onClose && (
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-0.5 rounded hover:bg-amber-500 hover:text-[#0a0f1d] text-amber-400 transition-all cursor-pointer"
            title="Tutup Obrolan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Daftar Pesan Obrolan */}
      <div className="p-3 max-h-48 min-h-36 overflow-y-auto space-y-2 text-xs custom-scrollbar bg-[#0a0f1d]/90">
        {messages.length === 0 ? (
          <div className="text-amber-500/60 text-center py-6 text-[11px] italic">
            Belum ada obrolan. Sapa pemain lain di RadenWorld!
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = msg.senderId === 'system' || msg.senderId === 'npc';
            const isSuper = msg.isSuperAdmin || msg.senderRole === 'super_admin' || msg.senderName?.toUpperCase() === 'RADEN' || msg.senderName?.includes('RADEN');
            return (
              <div key={msg.id} className={`leading-relaxed break-words ${isSuper ? 'bg-amber-500/10 p-1 rounded-lg border border-amber-500/30' : ''}`}>
                <span className="text-[10px] text-amber-500/50 mr-1.5">[{msg.timestamp}]</span>
                {isSuper && (
                  <span className="bg-amber-400 text-[#0a0f1d] font-black text-[9px] px-1.5 py-0.2 rounded mr-1 shadow">
                    👑 ADMIN
                  </span>
                )}
                <span className={`font-bold mr-1 ${isSuper ? 'text-amber-300' : isSystem ? 'text-amber-400' : 'text-amber-300'}`}>
                  {msg.senderName}:
                </span>
                <span className={isSuper ? 'text-amber-100 font-semibold' : isSystem ? 'text-amber-200' : 'text-amber-100'}>
                  {msg.text}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Obrolan */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-amber-500/30 flex items-center gap-1.5 bg-[#0a0f1d]">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          placeholder="Ketik pesan lalu tekan Enter..."
          maxLength={100}
          className="flex-1 px-3 py-1.5 bg-[#0a0f1d] border border-amber-500/40 rounded-xl text-xs text-amber-300 placeholder-amber-500/40 focus:outline-none focus:border-amber-400 font-['Chakra_Petch']"
        />
        <button
          type="submit"
          className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0a0f1d] font-bold transition-all cursor-pointer shadow"
          title="Kirim Pesan"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
