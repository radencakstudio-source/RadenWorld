/**
 * ============================================================================
 * FILE: resources/js/game/ui/FriendRequestNotification.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pop-up notifikasi permintaan pertemanan di sisi kanan layar.
 * 
 * ATURAN KHUSUS:
 * 1. Teks: "Permintaan dari [Nama] ingin berteman dengan anda".
 * 2. Terdapat 2 tombol: [YA] dan [TOLAK].
 * 3. Pop-up muncul selama 1 menit (60 detik) dengan countdown visual.
 * 4. Jika tidak ada respon dalam 1 menit, otomatis tolak, dan pemain yang
 *    meminta otomatis menjadi pengikut (follower).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { UserPlus, Check, X, Clock, User } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { IAvatarCustomization } from '../types';
import { AvatarPreview } from './AvatarPreview';

export interface IFriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar?: IAvatarCustomization;
  fromLevel?: number;
  fromRole?: string;
  timestamp: number;
}

interface FriendRequestNotificationProps {
  request: IFriendRequest | null;
  onAccept: (req: IFriendRequest) => void;
  onReject: (req: IFriendRequest, isTimeout?: boolean) => void;
}

export const FriendRequestNotification: React.FC<FriendRequestNotificationProps> = ({
  request,
  onAccept,
  onReject,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const sound = SoundManager.getInstance();

  useEffect(() => {
    if (!request) return;

    setTimeLeft(60);
    sound.playSuccess();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // 1 menit habis tanpa respon -> otomatis tolak dan jadi pengikut
          onReject(request, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [request]);

  if (!request) return null;

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 60) * 100));

  return (
    <div className="fixed right-2 sm:right-4 top-16 sm:top-20 z-[9999] pointer-events-auto w-[calc(100vw-1rem)] sm:w-80 max-w-80 bg-[#080808] border border-neutral-800 rounded-xl p-3 sm:p-3.5 shadow-2xl text-neutral-100 font-['Chakra_Petch'] animate-in slide-in-from-right duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 text-amber-400">
          <UserPlus className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">
            PERMINTAAN PERTEMANAN
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* KONTEN */}
      <div className="py-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-black border border-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden">
          {request.fromAvatar ? (
            <AvatarPreview avatar={request.fromAvatar} size={48} />
          ) : (
            <User className="w-6 h-6 text-amber-400" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-xs text-neutral-200 leading-snug">
            Permintaan dari <strong className="text-amber-400 font-bold">{request.fromName}</strong> ingin berteman dengan anda.
          </p>
          <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
            Lv. {request.fromLevel || 1} • {request.fromRole === 'super_admin' ? '👑 Admin' : 'Petualang'}
          </span>
        </div>
      </div>

      {/* COUNTDOWN PROGRESS BAR */}
      <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-amber-400 transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* TOMBOL AKSI: [YA] DAN [TOLAK] */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playSuccess();
            onAccept(request);
          }}
          className="py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/20 active:scale-95"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>YA</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onReject(request, false);
          }}
          className="py-2 px-3 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-neutral-800 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <X className="w-3.5 h-3.5" />
          <span>TOLAK</span>
        </button>
      </div>
    </div>
  );
};
