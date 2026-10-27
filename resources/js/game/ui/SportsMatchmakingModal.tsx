/**
 * ============================================================================
 * FILE: resources/js/game/ui/SportsMatchmakingModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene / Modal Pencarian Musuh PvP (Matchmaking) 1v1 Lintas Server & Antar Pemain.
 * Mencari lawan sepadan berdasarkan pemain yang sedang antre PvP di semua server
 * (Server Garuda, Nusantara, Merdeka, Cakrawala), dengan status Stik Menang riil.
 * Desain Simple, Elegan, Pure Dark, Khas RadenWorld.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Swords, X, Flame, ShieldAlert, Globe, Trophy, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

export interface IMatchmakingOpponent {
  name: string;
  server: string;
  pvp_streak: number;
  pvp_sticks: number;
  wins?: number;
  win_rate?: number;
  avatar?: any;
  is_live_player?: boolean;
  is_cross_server?: boolean;
}

interface SportsMatchmakingModalProps {
  isOpen: boolean;
  sport: 'soccer' | 'basketball';
  playerName: string;
  playerStats?: any;
  currentServer?: string;
  onClose: () => void;
  onMatchConfirmed: (opponent: IMatchmakingOpponent) => void;
}

export const SportsMatchmakingModal: React.FC<SportsMatchmakingModalProps> = ({
  isOpen,
  sport,
  playerName,
  playerStats,
  currentServer = 'Server 1: Garuda',
  onClose,
  onMatchConfirmed,
}) => {
  const sound = SoundManager.getInstance();
  const [status, setStatus] = useState<'searching' | 'found'>('searching');
  const [searchSeconds, setSearchSeconds] = useState(0);
  const [opponent, setOpponent] = useState<IMatchmakingOpponent | null>(null);
  const [countdown, setCountdown] = useState(3);
  
  const timerRef = useRef<any>(null);
  const pollRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);
  const hasMatchedRef = useRef(false);

  const sportName = sport === 'soccer' ? 'Sepak Bola' : 'Bola Basket';
  const sportEmoji = sport === 'soccer' ? '⚽' : '🏀';

  // 1. Inisialisasi Matchmaking saat Modal Dibuka
  useEffect(() => {
    if (isOpen) {
      EventBus.emit('dialogue-active', true);
      setStatus('searching');
      setSearchSeconds(0);
      setOpponent(null);
      setCountdown(3);
      hasMatchedRef.current = false;

      sound.playClick();

      // Mulai Antre ke Server API
      startQueue();

      // Timer Pencarian
      timerRef.current = setInterval(() => {
        setSearchSeconds((prev) => prev + 1);
      }, 1000);

      // Polling Status Antrean
      pollRef.current = setInterval(() => {
        if (!hasMatchedRef.current) {
          checkQueueStatus();
        }
      }, 1500);

      // Fallback: Jika setelah 3.5 detik belum ada manusia lain, cari rival dari server lain
      const rivalTimeout = setTimeout(() => {
        if (!hasMatchedRef.current) {
          findRivalOpponent();
        }
      }, 3500);

      return () => {
        clearInterval(timerRef.current);
        clearInterval(pollRef.current);
        clearTimeout(rivalTimeout);
        if (countdownRef.current) clearInterval(countdownRef.current);
        EventBus.emit('dialogue-active', false);
      };
    }
  }, [isOpen]);

  // Handler Masuk Antrean
  const startQueue = async () => {
    try {
      const res = await fetch('/api/sports/matchmaking/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Name': playerName,
        },
        body: JSON.stringify({
          sport,
          player_name: playerName,
          server: currentServer,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'matched' && data.opponent) {
          handleOpponentMatched(data.opponent);
        }
      }
    } catch (e) {
      console.warn('Gagal menghubungi server matchmaking:', e);
    }
  };

  // Handler Cek Status Antrean
  const checkQueueStatus = async () => {
    try {
      const res = await fetch(
        `/api/sports/matchmaking/status?player_name=${encodeURIComponent(playerName)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'matched' && data.opponent) {
          handleOpponentMatched(data.opponent);
        }
      }
    } catch (e) {}
  };

  // Handler Cari Atlet Rival Lintas Server
  const findRivalOpponent = async () => {
    try {
      const res = await fetch('/api/sports/matchmaking/find-rival', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Name': playerName,
        },
        body: JSON.stringify({
          sport,
          player_name: playerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'matched' && data.opponent) {
          handleOpponentMatched(data.opponent);
        }
      }
    } catch (e) {}
  };

  // Saat Lawan Ditemukan
  const handleOpponentMatched = (opp: IMatchmakingOpponent) => {
    if (hasMatchedRef.current) return;
    hasMatchedRef.current = true;

    clearInterval(timerRef.current);
    clearInterval(pollRef.current);

    sound.playSuccess();
    setOpponent(opp);
    setStatus('found');

    let count = 3;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current);
        onMatchConfirmed(opp);
      }
    }, 1000);
  };

  // Handler Batal
  const handleCancel = async () => {
    sound.playClick();
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    try {
      fetch('/api/sports/matchmaking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Name': playerName,
        },
        body: JSON.stringify({ player_name: playerName }),
      }).catch(() => {});
    } catch (e) {}

    onClose();
  };

  if (!isOpen) return null;

  const myPvpStreak = playerStats?.pvp_streak ?? 0;
  const myPvpSticks = playerStats?.pvp_sticks ?? 0;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-200 font-['Chakra_Petch']">
      <div className="relative w-full max-w-xl bg-black border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* ==================================================================== */}
        {/* 1. HEADER MATCHMAKING ARCADE                                         */}
        {/* ==================================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-neutral-900 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-amber-400 tracking-wider uppercase">
                  MATCHMAKING PVP 1V1
                </h3>
                <span className="text-[9px] font-mono font-bold bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                  {sportEmoji} {sportName.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400">
                Mencari lawan tanding aktif di semua server RadenWorld
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Batal Cari Musuh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================================================================== */}
        {/* 2. ARENA MATCHMAKING: KARTU PEMAIN vs KARTU LAWAN                   */}
        {/* ==================================================================== */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Status Live Server & Waktu Pencarian */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-md bg-[#0e0e0e] border border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span className="text-[11px]">
                {status === 'searching' 
                  ? 'Mencari petualang di semua server...' 
                  : '⚔️ Lawan ditemukan! Menghubungkan duel...'}
              </span>
            </div>
            <div className="font-mono text-amber-400 font-bold text-xs">
              {status === 'searching' ? formatTimer(searchSeconds) : `MULAI: ${countdown}s`}
            </div>
          </div>

          {/* DUA KARTU PEMAIN (VS SCREEN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-stretch relative">
            
            {/* KARTU KAMU (PLAYER 1) */}
            <div className="p-3.5 sm:p-4 rounded-lg bg-[#0e0e0e] border border-amber-500/40 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase tracking-wider">
                  KAMU (P1)
                </span>
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-neutral-500" />
                  <span>{currentServer}</span>
                </span>
              </div>

              <div className="my-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border-2 border-amber-400 flex items-center justify-center text-xl font-bold text-amber-400 shrink-0">
                  {playerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{playerName}</h4>
                  <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-amber-400 font-bold">🔥 {myPvpStreak}x Stik Menang</span>
                    <span>•</span>
                    <span>{myPvpSticks} 🏒 Stik</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-neutral-500 border-t border-neutral-800/80 pt-2 flex items-center justify-between">
                <span>Status Koneksi:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Siap Tanding
                </span>
              </div>
            </div>

            {/* BADGE "VS" TENGAH */}
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black border-2 border-amber-400 items-center justify-center font-black text-xs text-amber-400 shadow-xl">
              VS
            </div>

            {/* KARTU LAWAN (PLAYER 2 / OPPONENT) */}
            <div className={`p-3.5 sm:p-4 rounded-lg border flex flex-col justify-between transition-all ${
              status === 'found'
                ? 'bg-[#0e0e0e] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'bg-[#080808] border-neutral-800/80'
            }`}>
              {status === 'searching' ? (
                <div className="h-full flex flex-col items-center justify-center py-4 text-center space-y-2">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping" />
                    <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                  <div className="text-xs font-bold text-neutral-300">Mencari Lawan...</div>
                  <p className="text-[10px] text-neutral-500 max-w-[200px]">
                    Memindai petualang yang siap duel dari server Garuda & Nusantara
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400 uppercase tracking-wider">
                      LAWAN (P2)
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3 text-amber-400" />
                      <span>{opponent?.server || 'Server Lintas'}</span>
                    </span>
                  </div>

                  <div className="my-3 flex items-center gap-3 animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 border-2 border-neutral-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                      {opponent?.name?.charAt(0).toUpperCase() || 'L'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-amber-300 truncate">{opponent?.name}</h4>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded font-bold">
                          RIVAL
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-amber-400 font-bold">🔥 {opponent?.pvp_streak || 0}x Stik Menang</span>
                        <span>•</span>
                        <span>{opponent?.pvp_sticks || 0} 🏒 Stik</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-500 border-t border-neutral-800/80 pt-2 flex items-center justify-between">
                    <span>Status Lawan:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Terhubung
                    </span>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Info Reward Stik Menang Khusus PvP */}
          <div className="p-2.5 rounded-md bg-[#0a0a0a] border border-amber-500/20 text-[11px] text-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Menangkan duel untuk meraih <strong className="text-amber-400">+1 Stik Menang Khusus PvP 🏒</strong> & gandakan Win Streak!</span>
            </div>
          </div>

          {/* Tombol Batal & Status Countdown */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ✕ Batal Cari Musuh
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
