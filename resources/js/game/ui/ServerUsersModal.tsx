/**
 * ============================================================================
 * FILE: resources/js/game/ui/ServerUsersModal.tsx
 * ============================================================================
 * Modal Daftar Pemain Aktif di Server (Cozycore Clay-Pixel):
 * 1. Menampilkan jumlah pemain saat ini vs kapasitas maksimal (Max 50 orang).
 * 2. Menampilkan avatar pratinjau, nama pemain, level, dan role/tag.
 * 3. Indikator Ikon Teman (Sudah berteman / Tambah Teman / Kamu).
 * 4. Klik pemain untuk melihat detail profil.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { X, Users, UserCheck, UserPlus, Search, Crown, Sparkles } from 'lucide-react';
import { IPlayerData, IAvatarCustomization } from '../types';
import { AvatarPreview } from './AvatarPreview';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { NetworkManager } from '../core/NetworkManager';

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

  React.useEffect(() => {
    if (isOpen) {
      try {
        const net = NetworkManager.getInstance();
        net.requestServerStats();
        net.requestServerPlayers();
      } catch (e) {}
    }
  }, [isOpen]);

  const allPlayers = useMemo(() => {
    const list: (IPlayerData & { isMe?: boolean })[] = [];
    const myNameClean = (currentUserName || '')
      .replace(/\[admin\]/i, '')
      .replace(/👑/g, '')
      .trim()
      .toLowerCase();
    const currentSocketId = NetworkManager.getInstance().getSocketId();

    list.push({
      id: currentSocketId || 'me',
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

    players.forEach((p) => {
      if (!p) return;
      if ((p as IPlayerData & { isMe?: boolean }).isMe) return;
      if (currentSocketId && p.id === currentSocketId) return;
      if (p.id === 'local-me' || p.id === 'me') return;

      if (list.some((existing) => existing.id && existing.id === p.id)) return;

      list.push(p);
    });

    return list;
  }, [
    players,
    currentUserName,
    currentUserAvatar,
    currentUserLevel,
    currentUserRole,
    isCurrentUserAdmin,
  ]);

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
    const enriched = {
      ...p,
      location: (p as any).room ? `Room: ${(p as any).room}` : 'Online di Server',
    };
    if (onInspectPlayer) {
      onInspectPlayer(enriched);
    } else {
      EventBus.emit('inspect-player-profile', enriched);
      EventBus.emit('open-player-profile', enriched);
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
      className="ui-modal-backdrop z-[100] pointer-events-auto select-none"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="clay-panel landscape-compact-modal relative w-full max-w-lg max-h-[min(92dvh,calc(100dvh-1rem))] overflow-hidden flex flex-col text-black">
        {/* Header Modal */}
        <div className="clay-header landscape-compact-header flex items-center justify-between px-4 py-3 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm uppercase text-black">
                  DAFTAR PEMAIN SERVER
                </span>
                <span className="clay-badge-secondary text-[9px] font-bold px-2 py-0.5 text-black">
                  ONLINE
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-black truncate">
                Server: {serverCode} • Maks {maxCapacity} Pemain
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Bar Kapasitas & Input Pencarian */}
        <div className="p-3 bg-[#FFF8EA] border-b-2 border-[#5C3A21] flex flex-col gap-2 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-black">
              <span>Kapasitas Ruangan:</span>
              <span>
                {currentCount} / {maxCapacity} Pemain ({capacityPercent}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] overflow-hidden p-0.5">
              <div
                className="h-full rounded bg-[#A8E6CF] transition-all duration-300"
                style={{ width: `${Math.max(4, capacityPercent)}%` }}
              />
            </div>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pemain di server ini..."
              className="clay-input w-full pl-8 pr-3 py-1.5 text-xs text-black"
            />
          </div>
        </div>

        {/* Daftar Pemain */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-0 bg-[#FFF8EA]">
          {filteredPlayers.length === 0 ? (
            <div className="clay-card flex flex-col items-center justify-center py-8 text-black gap-2">
              <Users className="w-7 h-7 stroke-[2.5]" />
              <span className="text-xs font-bold">Tidak ada pemain dengan nama tersebut.</span>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isMe = !!player.isMe;
              const isFriend = !isMe && friendsList.includes(player.name);
              const isAdmin =
                player.isSuperAdmin ||
                player.role === 'super_admin' ||
                player.name.toUpperCase() === 'RADEN';

              return (
                <div
                  key={player.id || player.name}
                  onClick={() => handleRowClick(player)}
                  className={`flex items-center justify-between p-2.5 gap-2 cursor-pointer text-black ${
                    isMe ? 'clay-card-secondary' : 'clay-btn-neutral'
                  }`}
                  title={isMe ? 'Profil Anda' : `Klik untuk melihat profil ${player.name}`}
                >
                  {/* Sisi Kiri: Avatar & Info Nama */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <AvatarPreview avatar={player.avatar} size={36} />
                      {isAdmin && (
                        <div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded bg-[#FFAE6D] border border-[#5C3A21] text-black flex items-center justify-center"
                          title="Admin / Kreator"
                        >
                          <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-black truncate">
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="clay-badge-primary text-[9px] font-bold px-1.5 py-0.5 text-black uppercase shrink-0">
                            Kamu
                          </span>
                        )}
                        {isAdmin && (
                          <span className="clay-badge-cocoa text-[9px] font-bold px-1.5 py-0.5 text-white uppercase shrink-0 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-black mt-0.5 flex-wrap">
                        <span>Lv. {player.level || 1}</span>
                        <span>•</span>
                        <span>
                          {player.avatar?.gender === 'female' ? 'Perempuan' : 'Laki-Laki'}
                        </span>
                        {player.location && (
                          <>
                            <span>•</span>
                            <span className="text-[#166534] bg-[#A8E6CF]/60 border border-[#166534]/30 px-1.5 py-0.5 rounded font-black text-[9px]">
                              {player.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sisi Kanan: Status Teman */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isMe ? (
                      <span className="clay-badge-neutral text-[10px] font-bold px-2 py-1 text-black">
                        Lokal
                      </span>
                    ) : isFriend ? (
                      <div
                        className="clay-badge-secondary flex items-center gap-1 px-2.5 py-1 text-black"
                        title="Sudah Menjadi Teman"
                      >
                        <UserCheck className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span className="text-[10px] font-bold uppercase">Teman</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleAddFriendClick(e, player)}
                        className="clay-btn-primary flex items-center gap-1 px-2.5 py-1 text-black"
                        title="Kirim Permintaan Pertemanan"
                      >
                        <UserPlus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span className="text-[10px] font-bold uppercase">Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-[#FFF8EA] border-t-2 border-[#5C3A21] text-[10px] font-bold text-black shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A8E6CF] border border-[#5C3A21]" />
            <span>Server Terhubung</span>
          </div>
          <span>Klik pemain untuk lihat profil</span>
        </div>
      </div>
    </div>
  );
};
