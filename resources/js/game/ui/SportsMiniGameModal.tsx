/**
 * ============================================================================
 * FILE: resources/js/game/ui/SportsMiniGameModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal pop-up pemilihan mode Mini Game Olahraga (Head Soccer & Head Basketball)
 * Dilengkapi Sistem Real-Time Leaderboard & Statistik Karir Atlet Terverifikasi.
 * Desain Simple, Elegan, Pure Dark, Khas Game Arcade RadenWorld.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Swords, Bot, Flame, Clock, Heart, Play, 
  BarChart3, Gamepad2, Smartphone, Keyboard, Target, ShieldCheck,
  RefreshCw, Medal, Calendar, Users
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { SportsMatchmakingModal, IMatchmakingOpponent } from './SportsMatchmakingModal';

export type SportsType = 'soccer' | 'basketball';
export type SportsMode = 'practice' | 'pvp' | 'ai';
export type LeaderboardCategory = 'soccer' | 'basketball' | 'pvp';

interface SportsMiniGameModalProps {
  isOpen: boolean;
  sport: SportsType | null;
  onClose: () => void;
  onSelectMode: (sport: SportsType, mode: SportsMode, opponent?: IMatchmakingOpponent) => void;
  playerName?: string;
}

export const SportsMiniGameModal: React.FC<SportsMiniGameModalProps> = ({
  isOpen,
  sport,
  onClose,
  onSelectMode,
  playerName = 'Petualang',
}) => {
  const sound = SoundManager.getInstance();
  const [activeTab, setActiveTab] = useState<'modes' | 'leaderboard' | 'stats'>('modes');
  const [selectedSport, setSelectedSport] = useState<SportsType>(sport || 'soccer');
  const [leaderboardCategory, setLeaderboardCategory] = useState<LeaderboardCategory>(sport || 'soccer');
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentPlayerSummary, setCurrentPlayerSummary] = useState<any | null>(null);
  const [playerStats, setPlayerStats] = useState<any | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Ambil nama user aktual dari localStorage jika ada
  const activePlayerName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (u.name) return u.name;
    } catch (e) {}
    return playerName || 'Petualang';
  })();

  useEffect(() => {
    if (sport) {
      setSelectedSport(sport);
      setLeaderboardCategory(sport);
    }
  }, [sport]);

  useEffect(() => {
    if (isOpen) {
      EventBus.emit('dialogue-active', true);
      fetchRealSportsData();
    }
    return () => {
      EventBus.emit('dialogue-active', false);
    };
  }, [isOpen, selectedSport, leaderboardCategory]);

  const fetchRealSportsData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Ambil Data Leaderboard Nyata sesuai kategori (soccer / basketball / pvp)
      const resLb = await fetch(
        `/api/sports/leaderboard?sport=${leaderboardCategory}&player_name=${encodeURIComponent(activePlayerName)}`
      );
      if (resLb.ok) {
        const dataLb = await resLb.json();
        if (dataLb.status === 'success' && Array.isArray(dataLb.leaderboard)) {
          setLeaderboard(dataLb.leaderboard);
          setCurrentPlayerSummary(dataLb.current_player || null);
        }
      }

      // 2. Ambil Data Statistik Atlet Nyata
      const resStats = await fetch(`/api/sports/stats/${encodeURIComponent(activePlayerName)}`);
      if (resStats.ok) {
        const dataStats = await resStats.json();
        if (dataStats.status === 'success' && dataStats.stats) {
          setPlayerStats(dataStats.stats);
        }
      }
    } catch (e) {
      console.warn('Gagal memuat data olahraga nyata:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const isSoccer = selectedSport === 'soccer';
  const sportTitle = isSoccer ? 'SOCCER' : 'BASKETBALL';
  const sportSub = isSoccer
    ? 'Stadion Mini Alun-Alun • Arcade 1v1'
    : 'Streetball Court Alun-Alun • Arcade 1v1';
  const sportEmoji = isSoccer ? '⚽' : '🏀';

  const handleChoose = (mode: SportsMode) => {
    sound.playSuccess();
    onSelectMode(selectedSport, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none animate-in fade-in duration-200 font-['Chakra_Petch']">
      <div className="relative w-full max-w-3xl bg-black border border-neutral-800 rounded-2xl flex flex-col overflow-hidden max-h-[94dvh] shadow-2xl">
        
        {/* ==================================================================== */}
        {/* 1. HEADER MODAL: Simpel & Elegan Khas RadenWorld                     */}
        {/* ==================================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-neutral-800 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-inner">
              {sportEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-amber-400 tracking-wider uppercase truncate">
                  {sportTitle}
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded shrink-0">
                  ARCADE 1V1
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate mt-0.5">
                {sportSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {/* Quick Sport Toggle Pill */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedSport('soccer');
                  setLeaderboardCategory('soccer');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSoccer
                    ? 'bg-amber-500 text-black shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>⚽</span>
                <span>SOCCER</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedSport('basketball');
                  setLeaderboardCategory('basketball');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isSoccer
                    ? 'bg-amber-500 text-black shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🏀</span>
                <span>BASKETBALL</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                fetchRealSportsData();
              }}
              disabled={isLoadingData}
              className="p-1.5 rounded-md text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Perbarui Data Real-time"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-md text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. TAB NAVIGATOR SEGMENTED                                           */}
        {/* ==================================================================== */}
        <div className="flex border-b border-neutral-800 bg-[#0a0a0a] px-3 sm:px-6 gap-2 sm:gap-4 text-xs font-bold shrink-0 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => { sound.playClick(); setActiveTab('modes'); }}
            className={`pb-2.5 sm:pb-3 px-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'modes'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>PILIH MODE</span>
          </button>

          <button
            type="button"
            onClick={() => { sound.playClick(); setActiveTab('leaderboard'); }}
            className={`pb-2.5 sm:pb-3 px-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>LEADERBOARD</span>
          </button>

          <button
            type="button"
            onClick={() => { sound.playClick(); setActiveTab('stats'); }}
            className={`pb-2.5 sm:pb-3 px-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>STATISTIK KARIR</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* 3. ISI KONTEN MODAL                                                  */}
        {/* ==================================================================== */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 custom-scrollbar flex-1 min-h-0">
          
          {/* TAB 1: PILIHAN MODE PERTANDINGAN (4 MODE LENGKAP & ELEGAN) */}
          {activeTab === 'modes' && (
            <>
              {/* Reward Banner Sederhana */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-neutral-950 via-[#0e0e0e] to-neutral-950 border border-neutral-800 rounded-xl text-xs shadow-sm">
                <div className="flex items-center gap-2 flex-wrap text-neutral-300">
                  <span className="text-neutral-400 font-bold">Hadiah Kemenangan:</span>
                  <span className="text-amber-400 font-mono font-bold">+100 Koin</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-amber-300 font-mono font-bold">+50 EXP</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-amber-200 font-mono font-bold">+1 Diamond 💎</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-amber-400 font-bold">Khusus Duel PvP: +1 Stik Menang 🏒 & Streak 🔥</span>
                </div>
                <span className="text-[10px] text-neutral-500 hidden sm:inline font-mono">Tersimpan ke Akun</span>
              </div>

              {/* 4 OPSI MODE PERTANDINGAN: Responsive 2x2 Grid Desktop, Stacked Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                
                {/* 1. CARI LAWAN (ONLINE PVP 1V1 MATCHMAKING) */}
                <div className="group relative p-4 rounded-xl bg-gradient-to-b from-[#181106] via-[#0d0a04] to-[#080808] border border-amber-500/40 hover:border-amber-400 transition-all flex flex-col justify-between shadow-[0_4px_20px_rgba(245,158,11,0.06)] hover:shadow-[0_4px_28px_rgba(245,158,11,0.18)]">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Swords className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase tracking-wider font-mono">
                          🔥 STIK MENANG
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm sm:text-base font-black text-amber-300 group-hover:text-amber-200 transition-colors uppercase tracking-wider flex items-center gap-1.5">
                        <span>1. CARI LAWAN (ONLINE PVP)</span>
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-300 mt-1 leading-relaxed">
                        Tanding duel 1 lawan 1 secara online lintas server real-time melawan pemain lain. Pemenang mendapatkan <strong className="text-amber-300">Stik Menang khusus PvP</strong> & naik peringkat global!
                      </p>

                      <div className="mt-3 space-y-1.5 text-[10px] sm:text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>Timer 1 Menit (60s) • Darah 100 HP</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-amber-300 font-bold">Reward: +1 Stik Menang Khusus PvP 🏒 & Win Streak 🔥</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsMatchmakingOpen(true);
                      }}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:via-amber-400 hover:to-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-[0.98] border border-amber-300/50"
                    >
                      <Swords className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>CARI LAWAN ONLINE</span>
                    </button>
                    <span className="text-[10px] text-amber-400/80 text-center block mt-1.5 font-medium">
                      ⚡ Matchmaking instan di semua server Garuda & Nusantara
                    </span>
                  </div>
                </div>

                {/* 2. 2P LOKAL (VS TEMAN 1 LAYAR / 1 KEYBOARD) */}
                <div className="group relative p-4 rounded-xl bg-gradient-to-b from-[#180a22] via-[#0f0617] to-[#080808] border border-purple-500/40 hover:border-purple-400 transition-all flex flex-col justify-between shadow-[0_4px_20px_rgba(168,85,247,0.06)] hover:shadow-[0_4px_28px_rgba(168,85,247,0.18)]">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-purple-500/50 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                          1 KEYBOARD
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white uppercase tracking-wider font-mono">
                          2 PEMAIN
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm sm:text-base font-black text-purple-300 group-hover:text-purple-200 transition-colors uppercase tracking-wider flex items-center gap-1.5">
                        <span>2. 2P LOKAL (VS TEMAN)</span>
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-300 mt-1 leading-relaxed">
                        Tantang temanmu langsung di satu perangkat/keyboard yang sama! Tidak perlu koneksi terpisah, langsung seru-seruan bareng dalam 1 layar.
                      </p>

                      <div className="mt-3 space-y-1.5 text-[10px] sm:text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">P1:</span>
                          <span className="text-neutral-300">[WASD] Gerak/Lompat • [F/R] Tendang/Pukul • [G] Super</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-400 font-bold shrink-0">P2:</span>
                          <span className="text-neutral-300">[Panah] Gerak/Lompat • [Enter] Aksi • [/] Pukul • [L] Super</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => handleChoose('pvp')}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-[0.98] border border-purple-400/50"
                    >
                      <Gamepad2 className="w-4 h-4 text-white stroke-[2.5]" />
                      <span>MAIN 2P LOKAL (1 LAYAR)</span>
                    </button>
                    <span className="text-[10px] text-purple-300/80 text-center block mt-1.5 font-medium">
                      🎮 Kontrol keyboard split untuk 2 pemain di satu layar
                    </span>
                  </div>
                </div>

                {/* 3. KOMPUTER (VS BOT AI) */}
                <div className="group relative p-4 rounded-xl bg-gradient-to-b from-[#0a1410] via-[#070e0b] to-[#080808] border border-neutral-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-mono tracking-wider">
                        BOT AI CERDAS
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wider">
                        3. VS KOMPUTER (BOT AI)
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed">
                        Lawan bot AI cerdas yang lihai sundulan, tendangan jarak jauh, tinju, dan tembakan super!
                      </p>

                      <div className="mt-3 space-y-1.5 text-[10px] sm:text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>Timer 1 Menit (60s)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-emerald-300">Reward: +100 Koin • +50 EXP • +1 Diamond</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => handleChoose('ai')}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-[0.98]"
                    >
                      <Bot className="w-4 h-4" />
                      <span>LAWAN BOT AI</span>
                    </button>
                    <span className="text-[10px] text-neutral-500 text-center block mt-1.5 font-medium">
                      Cocok untuk pemanasan & mengumpulkan koin
                    </span>
                  </div>
                </div>

                {/* 4. LATIHAN BEBAS (SOLO PRACTICE) */}
                <div className="group relative p-4 rounded-xl bg-gradient-to-b from-[#121214] via-[#0d0d0e] to-[#080808] border border-neutral-800 hover:border-neutral-600 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase font-mono tracking-wider">
                        FREE PLAY
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                        4. LATIHAN BEBAS (SOLO)
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed">
                        Asah teknik tendang melengkung, sundulan kepala, dash, dan jurus tembakan super tanpa tekanan waktu.
                      </p>

                      <div className="mt-3 space-y-1.5 text-[10px] sm:text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>Tanpa Batas Waktu • Bebas Bereksplorasi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Gol & Streak Latihan Tercatat Riil</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => handleChoose('practice')}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 hover:border-neutral-500 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-[0.98]"
                    >
                      <Target className="w-4 h-4 text-neutral-400" />
                      <span>MASUK LATIHAN</span>
                    </button>
                    <span className="text-[10px] text-neutral-500 text-center block mt-1.5 font-medium">
                      Latihan teknik & super move sepuasnya
                    </span>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB 2: LEADERBOARD PERINGKAT REAL-TIME */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-2.5">
              
              {/* Filter 3 Kategori Olahraga & Status Sinkron */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-1.5 bg-[#0e0e0e] p-1 rounded-md border border-neutral-800 overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setLeaderboardCategory('soccer');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      leaderboardCategory === 'soccer'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ⚽ Sepak Bola
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setLeaderboardCategory('basketball');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      leaderboardCategory === 'basketball'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🏀 Bola Basket
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setLeaderboardCategory('pvp');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      leaderboardCategory === 'pvp'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ⚔️ Stik Menang PvP 🏒
                  </button>
                </div>

                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Real-time Live Server</span>
                </div>
              </div>

              {leaderboard.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  {isLoadingData ? 'Memuat leaderboard dunia...' : 'Belum ada data pertandingan tercatat. Jadilah yang pertama menang!'}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {leaderboard.map((item, index) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;
                    const isSelf = Boolean(item.is_current_player || (item.name && item.name.toLowerCase() === activePlayerName.toLowerCase()));

                    return (
                      <div
                        key={index}
                        className={`p-2.5 sm:p-3 rounded-md border flex items-center justify-between text-xs transition-colors ${
                          isSelf
                            ? 'bg-amber-950/20 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                            : isTop1
                              ? 'bg-neutral-900 border-amber-500/50 text-amber-200'
                              : 'bg-[#0e0e0e] border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Badge Peringkat */}
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                              isTop1
                                ? 'bg-amber-400 text-black'
                                : isTop2
                                  ? 'bg-neutral-300 text-black'
                                  : isTop3
                                    ? 'bg-amber-700 text-white'
                                    : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {item.rank}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{item.name}</span>
                              {isSelf && (
                                <span className="text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded shrink-0">
                                  KAMU
                                </span>
                              )}
                              {isTop1 && <span className="text-[11px] text-amber-400 shrink-0">👑</span>}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {leaderboardCategory === 'pvp'
                                ? `${item.pvp_matches || 0} Duel • Win Rate ${item.pvp_win_rate ?? item.win_rate ?? 0}% • Rekor ${item.pvp_highest_streak || 0} Streak`
                                : `${item.matches_total} Tanding • Win Rate ${item.win_rate}% • Streak ${item.highest_streak || 0}`}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          {leaderboardCategory === 'pvp' ? (
                            <>
                              <div className="font-bold text-amber-400 font-mono text-xs sm:text-sm">
                                🔥 {item.pvp_streak || 0} STIK MENANG
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                Total: {item.pvp_sticks || 0} 🏒 Koleksi
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-amber-400 font-mono text-xs sm:text-sm">
                                {item.wins} MENANG
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                {leaderboardCategory === 'soccer' 
                                  ? `${item.soccer_goals || 0} Gol` 
                                  : `${item.basketball_points || 0} Poin`}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Posisi Peringkat Pemain Saat Ini jika di luar Top 10 */}
              {currentPlayerSummary && currentPlayerSummary.rank > 10 && (
                <div className="p-2.5 rounded-md bg-neutral-900 border border-amber-500/40 text-xs flex items-center justify-between text-neutral-300 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">#{currentPlayerSummary.rank}</span>
                    <span className="font-bold text-white">{currentPlayerSummary.name} (Posisi Kamu)</span>
                  </div>
                  <div className="text-right font-mono font-bold text-amber-400">
                    {leaderboardCategory === 'pvp'
                      ? `🔥 ${currentPlayerSummary.pvp_streak || 0} Stik Menang • Total: ${currentPlayerSummary.pvp_sticks || 0} 🏒`
                      : `${currentPlayerSummary.wins} Menang • Win Rate ${currentPlayerSummary.win_rate}%`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATISTIK PRIBADI PEMAIN (REAL-TIME DATA) */}
          {activeTab === 'stats' && (
            <div className="space-y-3">
              {/* Header Atlet */}
              <div className="p-3 sm:p-4 rounded-md bg-[#0e0e0e] border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Atlet Terverifikasi</span>
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      AKTIF
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5">{activePlayerName}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>Terakhir Tanding: {playerStats?.last_played || 'Belum ada pertandingan'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Peringkat Global</div>
                  <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono mt-0.5">
                    #{playerStats?.rank || '-'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                    Win Rate: {playerStats?.win_rate ?? 0}%
                  </div>
                </div>
              </div>

              {/* STATISTIK KHUSUS MODE PVP (STIK MENANG) */}
              <div className="p-3 sm:p-4 rounded-md bg-[#0e0e0e] border border-amber-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      STATISTIK KHUSUS MODE PVP (STIK MENANG)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    LINTAS SERVER
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded bg-black border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Stik Menang (Streak)</div>
                    <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                      {playerStats?.pvp_streak ?? 0} 🔥
                    </div>
                  </div>
                  <div className="p-2 rounded bg-black border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Rekor Stik Tertinggi</div>
                    <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
                      {playerStats?.pvp_highest_streak ?? 0} ⚡
                    </div>
                  </div>
                  <div className="p-2 rounded bg-black border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Total Koleksi Stik</div>
                    <div className="text-base font-bold text-amber-200 font-mono mt-0.5">
                      {playerStats?.pvp_sticks ?? 0} 🏒
                    </div>
                  </div>
                  <div className="p-2 rounded bg-black border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Menang Duel PvP</div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                      {playerStats?.pvp_wins ?? 0} / {playerStats?.pvp_matches ?? 0}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 pt-1 border-t border-neutral-800">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Setiap kemenangan di Mode PvP menghadiahkan 1 Stik Menang dan melipatgandakan Win Streak kamu!</span>
                </div>
              </div>

              {/* 6 Kotak Statistik Keseluruhan */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 text-center">
                <div className="p-2.5 sm:p-3 rounded-md bg-[#0e0e0e] border border-neutral-800">
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider">Total Tanding</div>
                  <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                    {playerStats?.matches_total ?? 0}
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-md bg-[#0e0e0e] border border-neutral-800">
                  <div className="text-[10px] sm:text-[11px] text-amber-400 uppercase tracking-wider">Menang (Wins)</div>
                  <div className="text-base sm:text-lg font-bold text-amber-400 font-mono mt-1">
                    {playerStats?.wins ?? 0}
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-md bg-[#0e0e0e] border border-neutral-800">
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider">Kalah (Losses)</div>
                  <div className="text-base sm:text-lg font-bold text-neutral-300 font-mono mt-1">
                    {playerStats?.losses ?? 0}
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-md bg-[#0e0e0e] border border-neutral-800">
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider">Seri (Draws)</div>
                  <div className="text-base sm:text-lg font-bold text-neutral-300 font-mono mt-1">
                    {playerStats?.draws ?? 0}
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-md bg-[#0e0e0e] border border-neutral-800">
                  <div className="text-[10px] sm:text-[11px] text-amber-400 uppercase tracking-wider">Streak Berjalan</div>
                  <div className="text-base sm:text-lg font-bold text-amber-400 font-mono mt-1">
                    {playerStats?.current_streak ?? 0} 🔥
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-md bg-[#0e0e0e] border border-neutral-800">
                  <div className="text-[10px] sm:text-[11px] text-amber-400 uppercase tracking-wider">Streak Rekor</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-1">
                    {playerStats?.highest_streak ?? 0} ⚡
                  </div>
                </div>
              </div>

              {/* Rincian Gol & Poin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-md bg-[#0e0e0e] border border-neutral-800 flex justify-between items-center text-neutral-300">
                  <span>⚽ Total Gol Sepak Bola</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {playerStats?.soccer_goals ?? 0} Gol
                  </span>
                </div>
                <div className="p-2.5 rounded-md bg-[#0e0e0e] border border-neutral-800 flex justify-between items-center text-neutral-300">
                  <span>🏀 Total Poin Bola Basket</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {playerStats?.basketball_points ?? 0} Poin
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ==================================================================== */}
        {/* 4. FOOTER PANDUAN KONTROL: Responsif & Rapi                          */}
        {/* ==================================================================== */}
        <div className="px-3 sm:px-6 py-2.5 border-t border-neutral-800 bg-[#0a0a0a] flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] text-neutral-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate max-w-full">
            <Keyboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-neutral-200">P1:</span>
            <span className="truncate">
              [Spasi] Lompat (2x) • [Q/E] Dash • {isSoccer ? '[F] Tendang • [R] Pukul' : '[F] Shoot • [R] Pukul'} • [G] Super
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-purple-400">P2 (2P Lokal):</span>
              <span>[▲] Lompat • [Enter] {isSoccer ? 'Tendang' : 'Shoot'} • [/] Pukul • [L] Super</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-neutral-500">
              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>HP: Analog Virtual + Tombol Aksi</span>
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 5. MODAL PENCARIAN MUSUH PVP (MATCHMAKING) LINTAS SERVER             */}
      {/* ==================================================================== */}
      <SportsMatchmakingModal
        isOpen={isMatchmakingOpen}
        sport={selectedSport}
        playerName={activePlayerName}
        playerStats={playerStats}
        onClose={() => setIsMatchmakingOpen(false)}
        onMatchConfirmed={(opponent) => {
          setIsMatchmakingOpen(false);
          sound.playSuccess();
          onSelectMode(selectedSport, 'pvp', opponent);
          onClose();
        }}
      />
    </div>
  );
};

