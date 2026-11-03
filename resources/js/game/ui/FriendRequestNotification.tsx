/**
 * ============================================================================
 * FILE: resources/js/game/ui/FriendRequestNotification.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pop-up notifikasi permintaan pertemanan di sisi kanan layar (Cozycore Clay-Pixel).
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
    <div
      className="fixed z-[9999] pointer-events-auto w-[min(300px,calc(100dvw-1rem))] sm:w-80 clay-panel overflow-hidden text-black"
      style={{
        right: 'max(0.5rem, env(safe-area-inset-right, 0.5rem))',
        top: 'max(4rem, calc(env(safe-area-inset-top, 0px) + 4rem))',
      }}
    >
      {/* HEADER */}
      <div className="clay-header px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-black min-w-0">
          <UserPlus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="text-[11px] font-bold uppercase truncate">
            PERMINTAAN PERTEMANAN
          </span>
        </div>
        <div className="clay-badge-secondary px-1.5 py-0.5 flex items-center gap-1 text-[10px] text-black font-bold shrink-0">
          <Clock className="w-3 h-3 stroke-[2.5]" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* KONTEN */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2.5">
          {request.fromAvatar ? (
            <AvatarPreview avatar={request.fromAvatar} size={46} />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <p className="text-[11px] text-black leading-snug">
              Permintaan dari <strong className="font-bold underline">{request.fromName}</strong> ingin berteman dengan anda.
            </p>
            <span className="text-[10px] text-black font-bold mt-0.5">
              Lv. {request.fromLevel || 1} • {request.fromRole === 'super_admin' ? '👑 Admin' : 'Petualang'}
            </span>
          </div>
        </div>

        {/* COUNTDOWN PROGRESS BAR */}
        <div className="w-full h-2.5 bg-[#FFF8EA] border-2 border-[#5C3A21] rounded-md overflow-hidden p-[1px]">
          <div
            className="h-full bg-[#FFAE6D] transition-all duration-1000 ease-linear rounded-xs"
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
            className="clay-btn-primary py-2 px-3 text-black font-bold text-xs uppercase flex items-center justify-center gap-1.5"
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
            className="clay-btn-secondary py-2 px-3 text-black font-bold text-xs uppercase flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>TOLAK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
