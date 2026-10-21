/**
 * ============================================================================
 * FILE: resources/js/game/ui/ServerUsersModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Daftar Pemain Aktif di Server (Roblox-style Player List / Leaderboard):
 * 1. Menampilkan jumlah pemain saat ini vs kapasitas maksimal (Max 50 orang).
 * 2. Menampilkan avatar pratinjau, nama pemain, level, dan role/tag.
 * 3. Indikator Ikon Teman (Roblox Concept):
 *    - Jika sudah berteman: Ikon Teman (UserCheck hijau zamrud) di sebelah kanan.
 *    - Jika belum berteman: Tombol Tambah Teman (UserPlus).
 *    - Diri sendiri: Tag khusus (Kamu).
 * 4. Klik pemain untuk melihat detail profil.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { X, Users, UserCheck, UserPlus, Search, Crown, Shield, Sparkles } from 'lucide-react';
import { IPlayerData, IAvatarCustomization } from '../types';
import { AvatarPreview } from './AvatarPreview';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

export interface ServerUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverCode?: string;
  currentUserName?: string;
  currentUserAvatar?: IAvatarCustomization;
  currentUserLevel?: number;
  currentUserRole?: string;
  isCurrentUserAdmin?: boolean;
  players?: IPlayerData[];
  friendsList?: string[];
  onInspectPlayer?: (player: IPlayerData) => void;
  onAddFriend?: (targetId: string, targetName: string) => void;
}

export const ServerUsersModal: React.FC<ServerUsersModalProps> = ({
  isOpen,
  onClose,
  serverCode = 'Asia 1',
  currentUserName = 'Petualang',
  currentUserAvatar,
  currentUserLevel = 1,
  currentUserRole,
  isCurrentUserAdmin = false,
  players = [],
  friendsList = [],
  onInspectPlayer,
  onAddFriend,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const sound = SoundManager.getInstance();

  // Susun daftar gabungan: diri sendiri selalu di paling atas, diikuti pemain lain
  const allPlayers = useMemo(() => {
    const list: (IPlayerData & { isMe?: boolean })[] = [];
    const myNameLower = (currentUserName || '').trim().toLowerCase();

    // 1. Diri sendiri
    list.push({
      id: 'me',
      name: currentUserName || 'Petualang',
      avatar: currentUserAvatar || {
        gender: 'male',
        skinColor: '#fed7aa',
        shirtColor: '#2563eb',
        pantsColor: '#1e293b',
        hatType: 'none',
      },
      x: 0,
      y: 0,
      direction: 'down',
      isMoving: false,
      hp: 100,
      maxHp: 100,
      level: currentUserLevel || 1,
      role: currentUserRole,
      isSuperAdmin: isCurrentUserAdmin,
      isMe: true,
    });

    // 2. Pemain lain di server (hindari duplikasi nama diri sendiri)
    players.forEach((p) => {
      if (p.name && p.name.trim().toLowerCase() === myNameLower) return;
      list.push(p);
    });

    return list;
  }, [players, currentUserName, currentUserAvatar, currentUserLevel, currentUserRole, isCurrentUserAdmin]);

  // Filter pencarian berdasarkan nama pemain
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return allPlayers;
    const q = searchQuery.toLowerCase();
    return allPlayers.filter((p) => p.name.toLowerCase().includes(q));
  }, [allPlayers, searchQuery]);

  if (!isOpen) return null;

  const maxCapacity = 50;
  const currentCount = allPlayers.length;
  const capacityPercent = Math.min(100, Math.round((currentCount / maxCapacity) * 100));

  const handleRowClick = (p: IPlayerData & { isMe?: boolean }) => {
    sound.playClick();
    if (onInspectPlayer) {
      onInspectPlayer(p);
    } else {
      EventBus.emit('open-player-profile', p);
    }
  };

  const handleAddFriendClick = (e: React.MouseEvent, p: IPlayerData) => {
    e.stopPropagation();
    sound.playClick();
    if (onAddFriend) {
      onAddFriend(p.id, p.name);
    } else {
      EventBus.emit('send-friend-request-to', { targetId: p.id, targetName: p.name });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 pointer-events-auto font-['Chakra_Petch'] animate-in fade-in duration-150 select-none"
    >
      <div className="relative w-full max-w-lg bg-black border border-neutral-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm tracking-wider text-amber-400 uppercase">
                  DAFTAR PEMAIN SERVER
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ONLINE
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                Server: <span className="text-amber-400 font-bold">{serverCode}</span> • Max{' '}
                <span className="text-white font-bold">{maxCapacity}</span> Pemain
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bar Kapasitas & Input Pencarian */}
        <div className="p-3 bg-[#0a0a0a] border-b border-neutral-800 flex flex-col gap-2.5">
          {/* Progress Bar Kapasitas Server */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="text-neutral-400">Kapasitas Ruangan:</span>
              <span className="text-amber-400">
                {currentCount} / {maxCapacity} Pemain ({capacityPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-xs bg-neutral-900 border border-neutral-800 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-xs bg-amber-500"
                style={{ width: `${Math.max(4, capacityPercent)}%` }}
              />
            </div>
          </div>

          {/* Kotak Pencarian Pemain */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pemain di server ini..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Daftar Pemain (Scrollable List) */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 custom-scrollbar min-h-[220px] bg-black">
          {filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-500 gap-1.5">
              <Users className="w-8 h-8 opacity-40 text-neutral-600" />
              <span className="text-xs font-mono">Tidak ada pemain dengan nama tersebut.</span>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isMe = !!player.isMe;
              const isFriend = !isMe && friendsList.includes(player.name);
              const isAdmin = player.isSuperAdmin || player.role === 'super_admin' || player.name.toUpperCase() === 'RADEN';

              return (
                <div
                  key={player.id || player.name}
                  onClick={() => handleRowClick(player)}
                  className={`flex items-center justify-between p-2 rounded-md border transition-colors cursor-pointer group ${
                    isMe
                      ? 'bg-neutral-900/90 border-amber-500/40 hover:bg-neutral-900'
                      : 'bg-[#0e0e0e] border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                  }`}
                  title={isMe ? 'Profil Anda' : `Klik untuk melihat profil ${player.name}`}
                >
                  {/* Sisi Kiri: Avatar & Info Nama */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar Preview Mini */}
                    <div className="relative w-9 h-9 rounded-md bg-black border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      <AvatarPreview avatar={player.avatar} size={32} />
                      {isAdmin && (
                        <div
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-xs bg-amber-500 text-black flex items-center justify-center shadow-xs"
                          title="Admin / Kreator"
                        >
                          <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>

                    {/* Nama & Level */}
                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isMe ? 'text-amber-400 font-bold' : 'text-neutral-200 group-hover:text-white'}`}>
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-500 text-black uppercase leading-tight shrink-0">
                            Kamu
                          </span>
                        )}
                        {isAdmin && (
                          <span className="text-[8.5px] font-bold font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-amber-400 border border-amber-500/30 uppercase leading-tight shrink-0 flex items-center gap-0.5">
                            <Sparkles className="w-2 h-2" />
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-0.5">
                        <span>
                          Lv. <span className="text-amber-400 font-bold">{player.level || 1}</span>
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span className="capitalize">{player.avatar?.gender === 'female' ? 'Perempuan' : 'Laki-Laki'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sisi Kanan: Status Teman Roblox Concept */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isMe ? (
                      <div className="text-[10px] font-mono text-neutral-500 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                        Pemain Lokal
                      </div>
                    ) : isFriend ? (
                      /* Ikon Teman Roblox Concept: Ditandai jelas di sebelah kanan */
                      <div
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-bold shadow-xs"
                        title="Sudah Menjadi Teman"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[10px] font-mono tracking-wide uppercase font-bold text-neutral-300">Teman</span>
                      </div>
                    ) : (
                      /* Tombol Tambah Teman */
                      <button
                        onClick={(e) => handleAddFriendClick(e, player)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
                        title="Kirim Permintaan Pertemanan"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[10px] font-mono tracking-wide uppercase">Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-t border-neutral-800 text-[10px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Server Terhubung • Ping: 18ms</span>
          </div>
          <span className="text-neutral-500">
            Klik pemain untuk info detail
          </span>
        </div>
      </div>
    </div>
  );
};
