/**
 * ============================================================================
 * FILE: resources/js/game/ui/ChatBox.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Jendela pop-up obrolan multiplayer di Kiri Atas (Top-Left) bergaya Cozycore Clay-Pixel:
 * - Panel #FFF8EA, header/aksi utama #FFAE6D, aksen/privat #A8E6CF, outline 2px #5C3A21.
 * - Teks #000000 kontras tinggi, tanpa hover & tanpa glow.
 * - Responsif untuk PC Desktop, Mobile Portrait, dan Mobile Landscape tanpa terpotong.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IChatMessage } from '../types';
import { Send, MessageSquare, X, Smile, Sparkles, Globe, User, Lock, ChevronDown, MessageCircle } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { KeybindingManager } from '../core/KeybindingManager';
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
}

const CHARACTER_EXPRESSIONS: ICharacterExpression[] = [
  {
    type: 'normal',
    name: 'Normal',
    desc: 'Tenang',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/NormalMale.webp',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/NormalFemale.webp',
  },
  {
    type: 'smile',
    name: 'Senang',
    desc: 'Ramah',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/SenangMale.webp',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/SenangFemale.webp',
  },
  {
    type: 'shock',
    name: 'Kaget',
    desc: 'Terkejut',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/KagetMale.webp',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/KagetFemale.webp',
  },
  {
    type: 'angry',
    name: 'Marah',
    desc: 'Geram',
    fileMale: '/assets/sprites/characters/Player/Male/Ekspression/MarahMale.webp',
    fileFemale: '/assets/sprites/characters/Player/Female/Ekspression/MarahFemale.webp',
  },
];

export const ChatBox: React.FC<ChatBoxProps> = React.memo(({
  messages,
  onSendMessage,
  isOpen,
  onClose,
  gender = 'male',
  currentPlayerName = 'Petualang',
}) => {
  const [inputText, setInputText] = useState('');
  const [showExpressions, setShowExpressions] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('global');
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

  const scrollToBottom = (smooth = true) => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleScroll = () => {
    if (!chatListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatListRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 70;
    setShowScrollBottomBtn(!isNearBottom);
  };

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

  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || !lastMsg.isPrivate) return;

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

      if (activeTab.toLowerCase() !== cleanPeer.toLowerCase()) {
        setUnreadCounts((prev) => ({
          ...prev,
          [cleanPeer]: (prev[cleanPeer] || 0) + 1,
        }));
      }
    }
  }, [messages, myCleanName, activeTab]);

  const filteredMessages = useMemo(() => {
    if (activeTab === 'global') {
      return messages;
    }
    const cleanActiveTab = activeTab.trim().toLowerCase();
    return messages.filter((m) => {
      const sName = (m.senderName || '').trim().toLowerCase();
      const rName = (m.recipientName || '').trim().toLowerCase();

      const isBetweenUs =
        (sName === cleanActiveTab && (rName === myCleanName || !rName)) ||
        (sName === myCleanName && rName === cleanActiveTab);

      const isSystemNotice = (m.senderId === 'system' || sName === 'sistem') && rName === cleanActiveTab;

      return isBetweenUs || isSystemNotice;
    });
  }, [messages, activeTab, myCleanName]);

  useEffect(() => {
    scrollToBottom(true);
  }, [filteredMessages.length]);

  useEffect(() => {
    if (isOpen) {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KeybindingManager.getInstance().matches('chat', e)) {
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

  const handleSelectTab = (tabName: string) => {
    sound.playClick();
    setActiveTab(tabName);
    setUnreadCounts((prev) => ({ ...prev, [tabName]: 0 }));
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom(false);
    }, 50);
  };

  const handleClosePrivateTab = (e: React.MouseEvent, tabName: string) => {
    e.stopPropagation();
    sound.playClick();
    setPrivateTabs((prev) => prev.filter((t) => t.toLowerCase() !== tabName.toLowerCase()));
    if (activeTab.toLowerCase() === tabName.toLowerCase()) {
      setActiveTab('global');
    }
  };

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
    <div
      className="fixed z-50 w-[285px] sm:w-[340px] md:w-[385px] max-w-[calc(100dvw-1rem)] max-h-[calc(100dvh-3.75rem)] flex flex-col clay-panel overflow-hidden pointer-events-auto text-black"
      style={{
        top: 'max(3rem, calc(env(safe-area-inset-top, 0px) + 3rem))',
        left: 'max(0.5rem, env(safe-area-inset-left, 0.5rem))',
      }}
    >
      {/* 1. HEADER CHAT */}
      <div className="clay-header px-2.5 sm:px-3.5 py-2 flex items-center justify-between gap-2 text-xs font-bold text-black uppercase shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
            <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-[11px] sm:text-xs truncate">
            {activeTab === 'global' ? 'OBROLAN DUNIA' : 'BISIKAN PRIBADI'}
          </span>
          {activeTab === 'global' ? (
            <span className="clay-badge-secondary px-1.5 py-0.5 text-[9px] font-bold text-black shrink-0">
              LIVE
            </span>
          ) : (
            <span className="clay-badge-secondary px-1.5 py-0.5 text-[9px] font-bold text-black inline-flex items-center gap-1 shrink-0">
              <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
              PRIVAT
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowExpressions(!showExpressions);
            }}
            className={`h-7 px-2 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 ${showExpressions ? 'clay-btn-secondary' : 'clay-btn-neutral'
              }`}
            style={{ borderRadius: '7px' }}
            title="Buka Palet Reaksi Ekspresi Wajah Karakter"
          >
            <Smile className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">EKSPRESI</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-neutral h-7 w-7 flex items-center justify-center text-black"
              style={{ borderRadius: '7px' }}
              title="Tutup Obrolan"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB HEADER OBROLAN */}
      <div className="px-2.5 py-1.5 bg-[#FFF8EA] border-b-2 border-[#5C3A21] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => handleSelectTab('global')}
          className={`h-6.5 px-2.5 text-[10px] font-bold flex items-center gap-1.5 shrink-0 ${activeTab === 'global' ? 'clay-btn-primary' : 'clay-btn-neutral'
            }`}
          style={{ borderRadius: '7px' }}
        >
          <Globe className="w-3 h-3 stroke-[2.5]" />
          <span>SEMUA</span>
        </button>

        {privateTabs.map((pName) => {
          const isActive = activeTab.toLowerCase() === pName.toLowerCase();
          const unread = unreadCounts[pName] || 0;

          return (
            <div
              key={pName}
              onClick={() => handleSelectTab(pName)}
              className={`h-6.5 pl-2 pr-1 text-[10px] font-bold flex items-center gap-1 shrink-0 ${isActive ? 'clay-btn-secondary' : 'clay-btn-neutral'
                }`}
              style={{ borderRadius: '7px' }}
              title={`Obrolan pribadi dengan ${pName}`}
            >
              <User className="w-3 h-3 stroke-[2.5]" />
              <span className="max-w-[80px] sm:max-w-[100px] truncate">{pName}</span>

              {unread > 0 && !isActive && (
                <span className="clay-badge-primary text-[8.5px] font-bold px-1 leading-none">
                  {unread}
                </span>
              )}

              <button
                type="button"
                onClick={(e) => handleClosePrivateTab(e, pName)}
                className="w-4 h-4 rounded flex items-center justify-center text-black active:translate-y-[1px] cursor-pointer ml-0.5"
                title={`Tutup tab obrolan dengan ${pName}`}
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. DRAWER PALET REAKSI EKSPRESI KARAKTER */}
      {showExpressions && (
        <div className="p-2.5 bg-[#FFF8EA] border-b-2 border-[#5C3A21] shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-black uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 stroke-[2.5]" />
              REAKSI ({genderFolder.toUpperCase()}):
            </span>
            <span className="clay-badge-secondary px-1.5 py-0.5 text-[8.5px] font-bold text-black">
              Balon Kepala
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {CHARACTER_EXPRESSIONS.map((expr) => {
              const imageSrc = effectiveGender === 'female' ? expr.fileFemale : expr.fileMale;
              return (
                <button
                  key={expr.type}
                  type="button"
                  onClick={() => handleTriggerCharacterExpression(expr)}
                  className="clay-btn-neutral flex flex-col items-center justify-center p-1.5 text-black"
                  title={`Munculkan reaksi wajah ${expr.name}`}
                >
                  <div className="w-full h-10 landscape:max-md:h-7 rounded-md overflow-hidden bg-[#FFF8EA] border border-[#5C3A21] p-0.5 flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={expr.name}
                      className="max-w-full max-h-full object-contain pixelated"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-black mt-1 uppercase truncate max-w-full">
                    {expr.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DAFTAR PESAN OBROLAN */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={chatListRef}
          onScroll={handleScroll}
          className="p-2 flex-1 min-h-[64px] max-h-[170px] sm:max-h-[210px] md:max-h-[250px] landscape:max-md:max-h-[95px] overflow-y-auto space-y-1.5 text-xs custom-scrollbar bg-[#FFF8EA]"
        >
          {activeTab !== 'global' && (
            <div className="clay-card-secondary p-2 mb-1.5 flex items-center justify-between text-[10px] text-black font-bold">
              <div className="flex items-center gap-1.5 min-w-0">
                <Lock className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span className="truncate">
                  Obrolan Rahasia dengan <strong>{activeTab}</strong>
                </span>
              </div>
              <span className="clay-badge-neutral px-1.5 py-0.5 text-[8.5px]">Privat</span>
            </div>
          )}

          {filteredMessages.length === 0 ? (
            <div className="text-black text-center py-5 text-[11px] font-bold px-2">
              {activeTab === 'global'
                ? 'Belum ada obrolan. Ketik pesan di bawah untuk menyapa pemain lain!'
                : `Belum ada pesan pribadi dengan ${activeTab}.`}
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
                  className={`flex items-start gap-1.5 text-[11px] px-2 py-1.5 leading-snug ${isPrivate
                    ? 'clay-card-secondary'
                    : isSuper
                      ? 'clay-card-primary'
                      : 'clay-card'
                    }`}
                >
                  <span className="text-[9.5px] text-black font-bold shrink-0 pt-0.5">
                    [{timeText}]
                  </span>

                  <div className="flex-1 min-w-0 break-words text-black">
                    {isPrivate && (
                      <span className="clay-badge-neutral inline-block font-bold text-[8.5px] px-1.5 py-0.2 mr-1 align-baseline">
                        🔒 BISIKAN {msg.recipientName ? `➔ ${msg.recipientName}` : ''}
                      </span>
                    )}

                    {isSuper && (
                      <span className="clay-badge-neutral inline-block font-bold text-[8.5px] px-1.5 py-0.2 mr-1 align-baseline">
                        👑 ADMIN
                      </span>
                    )}

                    {isSystem && (
                      <span className="clay-badge-secondary inline-block font-bold text-[8.5px] px-1.5 py-0.2 mr-1 align-baseline">
                        SISTEM
                      </span>
                    )}

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
                      className={`font-bold mr-1.5 text-black ${!isSystem ? 'cursor-pointer underline' : ''
                        }`}
                      title={!isSystem ? `Klik untuk melihat profil ${msg.senderName}` : undefined}
                    >
                      {isMe ? 'Anda' : msg.senderName}:
                    </span>

                    <span className="text-black font-normal">{msg.text}</span>
                  </div>

                  {/* Tombol Cepat Bisik (Selalu Tampil untuk Perangkat Sentuh & PC) */}
                  {!isMe && !isSystem && msg.senderName && (
                    <button
                      type="button"
                      onClick={() => handleStartWhisperFromMessage(msg.senderName)}
                      className="clay-btn-secondary p-1 text-black shrink-0"
                      style={{ borderRadius: '6px' }}
                      title={`Buka Tab Chat Pribadi dengan ${msg.senderName}`}
                    >
                      <MessageCircle className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScrollBottomBtn && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="clay-btn-primary absolute bottom-2 right-3 z-10 px-2.5 py-1 text-black font-bold text-[10px] flex items-center gap-1"
            title="Gulir ke pesan terbaru"
          >
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>TERBARU</span>
          </button>
        )}
      </div>

      {/* 5. BARIS CEPAT EMOJI */}
      <div className="px-2.5 py-1 bg-[#FFF8EA] border-t-2 border-[#5C3A21] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 landscape:max-md:hidden">
        <span className="text-[9px] font-bold text-black shrink-0 mr-0.5">CEPAT:</span>
        {['👋', '😊', '😂', '👑', '⚔️', '❤️', '⚡', '🔥'].map((em, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleInsertEmoji(em)}
            className="w-6 h-6 rounded-md bg-[#FFF8EA] border border-[#5C3A21] active:translate-y-[1px] flex items-center justify-center text-xs cursor-pointer shrink-0"
            title={`Tambahkan ${em}`}
          >
            {em}
          </button>
        ))}
      </div>

      {/* 6. FORM INPUT */}
      <form onSubmit={handleSubmit} className="p-2 border-t-2 border-[#5C3A21] flex items-center gap-1.5 bg-[#FFF8EA] shrink-0">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowExpressions(!showExpressions);
          }}
          className={`w-8 h-8 flex items-center justify-center shrink-0 text-black ${showExpressions ? 'clay-btn-secondary' : 'clay-btn-neutral'
            }`}
          style={{ borderRadius: '8px' }}
          title="Pilih Ekspresi"
        >
          <Smile className="w-4 h-4 stroke-[2.5]" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          placeholder={
            activeTab === 'global'
              ? 'Ketik pesan...'
              : `Bisik ke ${activeTab}...`
          }
          maxLength={150}
          className="clay-input flex-1 min-w-0 h-8 px-2.5 text-[11px] sm:text-xs text-black font-bold"
        />

        <button
          type="submit"
          className="clay-btn-primary h-8 px-2.5 sm:px-3.5 text-black font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 shrink-0"
          style={{ borderRadius: '8px' }}
          title="Kirim Pesan"
        >
          <span className="hidden sm:inline">KIRIM</span>
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
});
ChatBox.displayName = 'ChatBox';
