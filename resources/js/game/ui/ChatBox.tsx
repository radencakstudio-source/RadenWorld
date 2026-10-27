/**
 * ============================================================================
 * FILE: resources/js/game/ui/ChatBox.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Jendela pop-up obrolan multiplayer di Kiri Atas (Top-Left), selaras dan sejajar
 * tepat di bawah profile HUD pemain.
 * 
 * ATURAN & FITUR:
 * 1. Tata Letak Rapi & Sejajar: Berada di top-[54px] sm:top-[66px] md:top-[72px] left-2 sm:left-4 md:left-5.
 * 2. Skema Warna Hitam Murni: Neutral Black (#000000, #080808, #0e0e0e) & Aksen Amber Emas (#f59e0b).
 * 3. Tab Header Obrolan Dinamis:
 *    - Tab '🌍 SEMUA' (Obrolan Global Dunia).
 *    - Tab Private Chat '👤 [Nama Pemain]' dengan tombol tutup '✖' & unread badge.
 * 4. Auto-Scroll Terjamin:
 *    - Otomatis scroll ke pesan paling bawah saat chatbox dibuka, tab diganti, atau pesan baru tiba.
 *    - Tombol melayang '⬇ Pesan Terbaru' jika pemain sedang scroll ke atas.
 * 5. Aksi Bisik / Private Chat Cepat:
 *    - Klik ikon '💬' pada pesan untuk langsung membuka obrolan pribadi dengan pemain tersebut.
 *    - Mendukung event bus 'open-private-chat' dari Profil Pemain.
 * 6. Fitur Ekspresi & Emotikon:
 *    - Palet reaksi wajah karakter untuk memunculkan balon reaksi visual di Phaser.
 * 7. Format Waktu Rapi: Format jam [HH:mm] mono yang rata dan sejajar.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IChatMessage } from '../types';
import { Send, MessageSquare, X, Smile, Sparkles, Globe, User, Lock, ChevronDown, MessageCircle } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

interface ChatBoxProps {
  messages: IChatMessage[];
  onSendMessage: (text: string, recipientName?: string) => void;
  isOpen: boolean;
  onClose?: () => void;
  gender?: 'male' | 'female';
  currentPlayerName?: string;
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
  currentPlayerName = 'Petualang',
}) => {
  const [inputText, setInputText] = useState('');
  const [showExpressions, setShowExpressions] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('global'); // 'global' atau nama pemain sasaran
  const [privateTabs, setPrivateTabs] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sound = SoundManager.getInstance();

  const effectiveGender: 'male' | 'female' = gender === 'female' ? 'female' : 'male';
  const genderFolder = effectiveGender === 'female' ? 'Female' : 'Male';
  const myCleanName = (currentPlayerName || '').trim().toLowerCase();

  // Fungsi scroll ke posisi paling bawah yang terjamin
  const scrollToBottom = (smooth = true) => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Deteksi posisi scroll untuk memunculkan tombol '⬇ Pesan Terbaru'
  const handleScroll = () => {
    if (!chatListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatListRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 70;
    setShowScrollBottomBtn(!isNearBottom);
  };

  // Buka private chat dari event bus luar (misal tombol Bisik di ProfileModal)
  useEffect(() => {
    const handleOpenPrivateChat = (targetName: string) => {
      const cleanTarget = targetName ? targetName.trim() : '';
      if (!cleanTarget || cleanTarget.toLowerCase() === myCleanName) return;

      setPrivateTabs((prev) => {
        const exists = prev.some((t) => t.toLowerCase() === cleanTarget.toLowerCase());
        return exists ? prev : [...prev, cleanTarget];
      });
      setActiveTab(cleanTarget);
      setUnreadCounts((prev) => ({ ...prev, [cleanTarget]: 0 }));

      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom(false);
      }, 80);
    };

    EventBus.on('open-private-chat', handleOpenPrivateChat);
    return () => {
      EventBus.off('open-private-chat', handleOpenPrivateChat);
    };
  }, [myCleanName]);

  // Otomatis deteksi pesan pribadi yang masuk untuk memunculkan tab pemain baru
  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || !lastMsg.isPrivate) return;

    // Tentukan siapa lawan bicara obrolan pribadi ini
    let peerName = '';
    const isSenderMe = (lastMsg.senderName || '').trim().toLowerCase() === myCleanName;

    if (isSenderMe) {
      peerName = lastMsg.recipientName || '';
    } else {
      peerName = lastMsg.senderName || '';
    }

    const cleanPeer = peerName.trim();
    if (cleanPeer && cleanPeer.toLowerCase() !== myCleanName) {
      setPrivateTabs((prev) => {
        const exists = prev.some((t) => t.toLowerCase() === cleanPeer.toLowerCase());
        return exists ? prev : [...prev, cleanPeer];
      });

      // Tambahkan unread jika pesan datang saat kita tidak sedang membuka tab pemain tersebut
      if (activeTab.toLowerCase() !== cleanPeer.toLowerCase()) {
        setUnreadCounts((prev) => ({
          ...prev,
          [cleanPeer]: (prev[cleanPeer] || 0) + 1,
        }));
      }
    }
  }, [messages, myCleanName, activeTab]);

  // Filter daftar pesan sesuai tab yang sedang aktif
  const filteredMessages = useMemo(() => {
    if (activeTab === 'global') {
      return messages;
    }
    const cleanActiveTab = activeTab.trim().toLowerCase();
    return messages.filter((m) => {
      const sName = (m.senderName || '').trim().toLowerCase();
      const rName = (m.recipientName || '').trim().toLowerCase();

      // Cocokkan jika ini pesan antara saya dan lawan bicara di tab ini
      const isBetweenUs =
        (sName === cleanActiveTab && (rName === myCleanName || !rName)) ||
        (sName === myCleanName && rName === cleanActiveTab);

      // Atau pesan sistem yang ditujukan untuk percakapan private ini
      const isSystemNotice = (m.senderId === 'system' || sName === 'sistem') && rName === cleanActiveTab;

      return isBetweenUs || isSystemNotice;
    });
  }, [messages, activeTab, myCleanName]);

  // SELALU scroll ke paling bawah saat pesan baru tiba atau tab berganti
  useEffect(() => {
    scrollToBottom(true);
  }, [filteredMessages.length]);

  // SELALU scroll ke paling bawah saat chatbox dibuka (isOpen = true)
  useEffect(() => {
    if (isOpen) {
      // Jalankan beberapa interval singkat untuk memastikan layout selesai render
      requestAnimationFrame(() => scrollToBottom(false));
      const t1 = setTimeout(() => scrollToBottom(false), 50);
      const t2 = setTimeout(() => scrollToBottom(false), 160);
      const tFocus = setTimeout(() => inputRef.current?.focus(), 80);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(tFocus);
      };
    }
  }, [isOpen, activeTab]);

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

  // Listener untuk prefill pesan (misal bisikan / sapaan dari modal profil)
  useEffect(() => {
    const handlePrefill = (text: string) => {
      setInputText(text);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    };
    EventBus.on('chat-prefill', handlePrefill);
    return () => {
      EventBus.off('chat-prefill', handlePrefill);
    };
  }, []);

  // Handler berpindah tab obrolan
  const handleSelectTab = (tabName: string) => {
    sound.playClick();
    setActiveTab(tabName);
    setUnreadCounts((prev) => ({ ...prev, [tabName]: 0 }));
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom(false);
    }, 50);
  };

  // Handler menutup tab private chat
  const handleClosePrivateTab = (e: React.MouseEvent, tabName: string) => {
    e.stopPropagation();
    sound.playClick();
    setPrivateTabs((prev) => prev.filter((t) => t.toLowerCase() !== tabName.toLowerCase()));
    if (activeTab.toLowerCase() === tabName.toLowerCase()) {
      setActiveTab('global');
    }
  };

  // Handler membuka private tab langsung dari pesan seseorang di obrolan
  const handleStartWhisperFromMessage = (targetName: string) => {
    sound.playClick();
    const cleanTarget = targetName.trim();
    if (!cleanTarget || cleanTarget.toLowerCase() === myCleanName) return;

    setPrivateTabs((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === cleanTarget.toLowerCase());
      return exists ? prev : [...prev, cleanTarget];
    });
    setActiveTab(cleanTarget);
    setUnreadCounts((prev) => ({ ...prev, [cleanTarget]: 0 }));

    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom(false);
    }, 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    sound.playClick();
    const recipient = activeTab === 'global' ? undefined : activeTab;
    onSendMessage(trimmed, recipient);

    setInputText('');
    setShowExpressions(false);
    setTimeout(() => {
      scrollToBottom(false);
    }, 40);
  };

  const handleTriggerCharacterExpression = (expr: ICharacterExpression) => {
    sound.playSuccess();
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
    <div className="fixed top-[54px] sm:top-[66px] md:top-[72px] left-2 sm:left-4 md:left-5 z-40 w-[calc(100vw-1rem)] sm:w-96 md:w-[410px] max-w-[410px] flex flex-col bg-black border border-neutral-800 rounded-md overflow-hidden transition-all pointer-events-auto font-['Chakra_Petch'] animate-in fade-in slide-in-from-top-1 duration-150 shadow-2xl">
      
      {/* 1. HEADER CHAT: Rata & Sejajar Presisi (Flat Minimalist) */}
      <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 border-b border-neutral-800 bg-[#0a0a0a] flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </div>
          <span className="font-bold tracking-wider text-[11px] sm:text-xs">
            {activeTab === 'global' ? 'OBROLAN DUNIA' : `BISIKAN PRIBADI`}
          </span>
          {activeTab === 'global' ? (
            <span className="flex items-center gap-1 text-[8.5px] sm:text-[9px] font-mono text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[8.5px] sm:text-[9px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60">
              <Lock className="w-2.5 h-2.5 text-purple-400" />
              PRIVAT
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tombol Toggle Palet Ekspresi Karakter */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowExpressions(!showExpressions);
            }}
            className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
              showExpressions
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-neutral-900 text-amber-400 border-neutral-800 hover:border-amber-400 hover:bg-neutral-800'
            }`}
            title="Buka Palet Reaksi Ekspresi Wajah Karakter"
          >
            <Smile className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>EKSPRESI</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="h-6 sm:h-7 w-6 sm:w-7 rounded flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-all cursor-pointer border border-transparent hover:border-neutral-700"
              title="Tutup Obrolan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB HEADER OBROLAN: TAB GLOBAL & TAB CHAT PRIBADI DENGAN NAMA ORANG */}
      <div className="px-2.5 py-1.5 bg-[#060606] border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {/* Tab Global / Semua */}
        <button
          type="button"
          onClick={() => handleSelectTab('global')}
          className={`h-6 sm:h-6.5 px-2.5 rounded text-[10px] sm:text-[10.5px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-all border ${
            activeTab === 'global'
              ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-amber-300 hover:bg-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>SEMUA</span>
        </button>

        {/* Tab Chat Pribadi yang sedang aktif / dibuka */}
        {privateTabs.map((pName) => {
          const isActive = activeTab.toLowerCase() === pName.toLowerCase();
          const unread = unreadCounts[pName] || 0;

          return (
            <div
              key={pName}
              onClick={() => handleSelectTab(pName)}
              className={`group h-6 sm:h-6.5 pl-2 pr-1.5 rounded text-[10px] sm:text-[10.5px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-all border ${
                isActive
                  ? 'bg-purple-900/90 text-purple-100 border-purple-500 shadow-sm'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-purple-300 hover:border-purple-800/80'
              }`}
              title={`Obrolan pribadi dengan ${pName}`}
            >
              <User className="w-3 h-3 text-purple-400" />
              <span className="max-w-[80px] sm:max-w-[105px] truncate">{pName}</span>

              {unread > 0 && !isActive && (
                <span className="bg-amber-500 text-black text-[8.5px] font-extrabold px-1 rounded-full animate-bounce">
                  {unread}
                </span>
              )}

              {/* Tombol Tutup Tab Pribadi */}
              <button
                type="button"
                onClick={(e) => handleClosePrivateTab(e, pName)}
                className="w-4 h-4 rounded flex items-center justify-center text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/80 transition-colors ml-0.5"
                title={`Tutup tab obrolan dengan ${pName}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. DRAWER PALET REAKSI EKSPRESI KARAKTER (Grid Simetris 4 Kolom) */}
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

      {/* 4. DAFTAR PESAN OBROLAN: Rapi, Sejajar, & Selalu Scroll Ke Bawah */}
      <div className="relative">
        <div
          ref={chatListRef}
          onScroll={handleScroll}
          className="p-2.5 sm:p-3 max-h-[35dvh] min-h-[110px] overflow-y-auto space-y-1.5 text-xs custom-scrollbar bg-black/90 scroll-smooth"
        >
          {/* Banner Indikator Tab Private */}
          {activeTab !== 'global' && (
            <div className="p-2 mb-2 bg-purple-950/40 border border-purple-800/50 rounded flex items-center justify-between text-[10px] text-purple-200">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>
                  Obrolan Rahasia dengan <strong className="text-amber-300">{activeTab}</strong>.
                </span>
              </div>
              <span className="text-[9px] text-purple-400/80 font-mono">Privat</span>
            </div>
          )}

          {filteredMessages.length === 0 ? (
            <div className="text-neutral-500 text-center py-7 text-[11px] italic">
              {activeTab === 'global'
                ? 'Belum ada obrolan. Ketik pesan di bawah untuk menyapa pemain lain di RadenWorld!'
                : `Belum ada pesan pribadi dengan ${activeTab}. Ketik pesan di bawah untuk memulai bisikan rahasia!`}
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const isSystem = msg.senderId === 'system' || msg.senderId === 'npc' || msg.senderName === 'SISTEM';
              const isSuper =
                msg.isSuperAdmin ||
                msg.senderRole === 'super_admin' ||
                msg.senderName?.toUpperCase() === 'RADEN' ||
                msg.senderName?.includes('RADEN');

              const isMe = (msg.senderName || '').trim().toLowerCase() === myCleanName;
              const isPrivate = Boolean(msg.isPrivate || msg.recipientName);

              let timeText = msg.timestamp;
              if (typeof timeText === 'number' || (typeof timeText === 'string' && /^\d{10,14}$/.test(timeText))) {
                const d = new Date(Number(timeText));
                timeText = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              }

              return (
                <div
                  key={`${msg.id || 'msg'}_${idx}`}
                  className={`group/msg flex items-start gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors leading-relaxed ${
                    isPrivate
                      ? 'bg-purple-950/30 border border-purple-800/40'
                      : isSuper
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
                    {/* Badge Bisikan Pribadi */}
                    {isPrivate && (
                      <span className="inline-block bg-purple-900/90 text-purple-200 font-black text-[8.5px] px-1.5 py-0.2 rounded border border-purple-700/60 mr-1 align-baseline">
                        🔒 BISIKAN {msg.recipientName ? `➔ ${msg.recipientName}` : ''}
                      </span>
                    )}

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

                    {/* Nama Pengirim */}
                    <span
                      onClick={() => {
                        if (!isSystem && msg.senderName) {
                          sound.playClick();
                          EventBus.emit('inspect-player-profile', {
                            id: msg.senderId,
                            name: msg.senderName,
                            role: isSuper ? 'super_admin' : (msg.senderRole || 'player'),
                            isSuperAdmin: isSuper,
                            level: isSuper ? 99999999999 : 1,
                            title: isSuper ? '👑 KREATOR & SUPER ADMIN' : 'Petualang',
                            likes: isSuper ? 99999999999 : 12,
                            friendsCount: isSuper ? 999 : 0,
                            followingCount: isSuper ? 999 : 0,
                            followersCount: isSuper ? 999 : 0,
                            gold: isSuper ? 99999999999 : 2500,
                            diamonds: isSuper ? 99999999999 : 50,
                            location: 'Obrolan Server',
                          });
                        }
                      }}
                      className={`font-bold mr-1.5 ${
                        !isSystem ? 'cursor-pointer hover:underline hover:text-amber-300' : ''
                      } ${
                        isPrivate
                          ? 'text-purple-300'
                          : isSuper
                            ? 'text-amber-300'
                            : isSystem
                              ? 'text-amber-400'
                              : 'text-amber-400'
                      }`}
                      title={!isSystem ? `Klik untuk melihat profil ${msg.senderName}` : undefined}
                    >
                      {isMe ? 'Anda' : msg.senderName}:
                    </span>

                    {/* Teks Pesan */}
                    <span
                      className={
                        isPrivate
                          ? 'text-purple-100 font-medium'
                          : isSuper
                            ? 'text-amber-100 font-medium'
                            : isSystem
                              ? 'text-amber-200'
                              : 'text-neutral-200'
                      }
                    >
                      {msg.text}
                    </span>
                  </div>

                  {/* Tombol Cepat Bisik / Chat Pribadi jika bukan pesan sendiri atau sistem */}
                  {!isMe && !isSystem && msg.senderName && (
                    <button
                      type="button"
                      onClick={() => handleStartWhisperFromMessage(msg.senderName)}
                      className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-300 shrink-0 cursor-pointer"
                      title={`Buka Tab Chat Pribadi dengan ${msg.senderName}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Tombol Melayang '⬇ Pesan Terbaru' saat user scroll ke atas */}
        {showScrollBottomBtn && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-2 right-3 z-10 px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] tracking-wider flex items-center gap-1 shadow-lg cursor-pointer transition-all animate-bounce"
            title="Gulir ke pesan terbaru"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>TERBARU</span>
          </button>
        )}
      </div>

      {/* 5. BARIS CEPAT EMOJI: Simetris & Responsif */}
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

      {/* 6. FORM INPUT: Rata, Sejajar, Presisi Tinggi h-9 */}
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
          placeholder={
            activeTab === 'global'
              ? "Ketik pesan atau tekan '/'..."
              : `Bisikkan pesan pribadi ke ${activeTab}...`
          }
          maxLength={150}
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
