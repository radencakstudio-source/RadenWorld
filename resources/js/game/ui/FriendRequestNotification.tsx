/**
 * ============================================================================
 * FILE: resources/js/game/ui/FriendRequestNotification.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pop-up notifikasi mengikuti / permintaan pertemanan di sisi kanan layar
 * dengan Cooldown 30 Detik (Hangus Otomatis) dan 3 tombol aksi:
 * [TERIMA], [TOLAK], dan [ABAIKAN].
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { UserPlus, Check, X, Clock, User, EyeOff } from 'lucide-react';
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
  isFollowNotification?: boolean;
  isHandHoldRequest?: boolean;
  isTradeRequest?: boolean;
}

interface FriendRequestNotificationProps {
  request: IFriendRequest | null;
  onAccept: (req: IFriendRequest) => void;
  onReject: (req: IFriendRequest, isTimeout?: boolean) => void;
  onIgnore?: (req: IFriendRequest) => void;
}

const COUNTDOWN_SECONDS = 30;

export const FriendRequestNotification: React.FC<FriendRequestNotificationProps> = ({
  request,
  onAccept,
  onReject,
  onIgnore,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(COUNTDOWN_SECONDS);
  const sound = SoundManager.getInstance();

  useEffect(() => {
    if (!request) return;

    setTimeLeft(COUNTDOWN_SECONDS);
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

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / COUNTDOWN_SECONDS) * 100));

  return (
    <div
      className="fixed z-[9999] pointer-events-auto w-[min(320px,calc(100dvw-1rem))] sm:w-84 clay-panel overflow-hidden text-black"
      style={{
        right: 'max(0.5rem, env(safe-area-inset-right, 0.5rem))',
        top: 'max(4rem, calc(env(safe-area-inset-top, 0px) + 4rem))',
      }}
    >
      {/* HEADER */}
      <div className="clay-header px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-black min-w-0">
          {!request.isHandHoldRequest && !request.isTradeRequest && (
            <UserPlus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          )}
          <span className="text-[11px] font-bold uppercase truncate">
            {request.isTradeRequest
              ? 'AJAKAN TRADE BARANG'
              : request.isHandHoldRequest
              ? 'AJAKAN PEGANGAN TANGAN'
              : 'NOTIFIKASI MENGIKUTI'}
          </span>
        </div>
        <div
          className={`${
            timeLeft <= 10 ? 'clay-badge-primary' : 'clay-badge-secondary'
          } px-2 py-0.5 flex items-center gap-1 text-[10px] text-black font-bold shrink-0`}
          title="Otomatis hangus dalam 30 detik"
        >
          <Clock className="w-3 h-3 stroke-[2.5]" />
          <span>{timeLeft}d (Hangus)</span>
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
              {request.isTradeRequest ? (
                <>
                  <strong className="font-bold underline">{request.fromName}</strong> mengajak kamu melakukan Trade barang (semua item kecuali biji). Terima untuk membuka sesi Trade:
                </>
              ) : request.isHandHoldRequest ? (
                <>
                  <strong className="font-bold underline">{request.fromName}</strong> mengajak kamu pegangan tangan! Jika diterima, kamu otomatis mengikuti {request.fromName}:
                </>
              ) : (
                <>
                  <strong className="font-bold underline">{request.fromName}</strong> mulai mengikuti kamu! Terima untuk langsung berteman:
                </>
              )}
            </p>
            <span className="text-[10px] text-black font-bold mt-0.5">
              Lv. {request.fromLevel || 1} • {request.fromRole === 'super_admin' ? '👑 Admin' : 'Warga Raden'}
            </span>
          </div>
        </div>

        {/* COUNTDOWN PROGRESS BAR (30 DETIK COOLDOWN) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-black">
            <span>Batas Waktu Respon (Cooldown 30 Detik)</span>
            <span>{timeLeft} / 30 dtk</span>
          </div>
          <div className="w-full h-2.5 bg-[#FFF8EA] border-2 border-[#5C3A21] rounded-md overflow-hidden p-[1px]">
            <div
              className="h-full bg-[#FFAE6D] transition-all duration-1000 ease-linear rounded-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* TOMBOL AKSI: JIKA GANDENG / TRADE HANYA 2 OPSI [TERIMA] & [TOLAK] (SESUAI ATURAN PERMAINAN) */}
        {/* JIKA REQUEST MENGIKUTI: 3 OPSI [TERIMA], [TOLAK], [ABAIKAN] */}
        <div className={`grid ${request.isHandHoldRequest || request.isTradeRequest ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5`}>
          <button
            type="button"
            onClick={() => {
              sound.playSuccess();
              onAccept(request);
            }}
            className="clay-btn-primary py-2 px-2 text-black font-bold text-[10px] sm:text-[11px] uppercase flex items-center justify-center gap-1"
            title="Terima Permintaan"
          >
            {!request.isHandHoldRequest && !request.isTradeRequest && (
              <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
            )}
            <span>TERIMA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onReject(request, false);
            }}
            className="clay-btn-cocoa py-2 px-2 text-white font-bold text-[10px] sm:text-[11px] uppercase flex items-center justify-center gap-1"
            title="Tolak Permintaan"
          >
            {!request.isHandHoldRequest && !request.isTradeRequest && (
              <X className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            )}
            <span>TOLAK</span>
          </button>

          {!request.isHandHoldRequest && !request.isTradeRequest && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (onIgnore) {
                  onIgnore(request);
                } else {
                  onReject(request, true);
                }
              }}
              className="clay-btn-neutral py-2 px-2 text-black font-bold text-[10px] sm:text-[11px] uppercase flex items-center justify-center gap-1"
              title="Abaikan Notifikasi Ini"
            >
              <EyeOff className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span>ABAIKAN</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
