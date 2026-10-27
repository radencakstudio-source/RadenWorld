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
  const sportTitle = isSoccer ? 'HEAD SOCCER' : 'HEAD BASKETBALL';
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
      <div className="relative w-full max-w-2xl bg-black border border-neutral-800 rounded-xl flex flex-col overflow-hidden max-h-[94dvh] shadow-2xl">
        
        {/* ==================================================================== */}
        {/* 1. HEADER MODAL: Simpel & Elegan Khas RadenWorld                     */}
        {/* ==================================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-neutral-800 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg sm:text-xl shrink-0">
              {sportEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-amber-400 tracking-wider uppercase truncate">
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

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
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
            <span>LEADERBOARD NYATA</span>
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
          
          {/* TAB 1: PILIHAN 3 MODE PERTANDINGAN */}
          {activeTab === 'modes' && (
            <>
              {/* Reward Banner Sederhana */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0e0e0e] border border-neutral-800 rounded-md text-xs">
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
                <span className="text-[10px] text-neutral-500 hidden sm:inline">Tersimpan ke Akun</span>
              </div>

              {/* 3 OPSI MODE PERTANDINGAN: Responsif Mobile Vertikal & Horizontal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                
                {/* 1. LATIHAN (PRACTICE) */}
                <div
                  onClick={() => handleChoose('practice')}
                  className="group relative p-3.5 sm:p-4 rounded-md bg-[#0e0e0e] border border-neutral-800 hover:border-amber-400/80 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase tracking-wider">
                      BEBAS
                    </span>
                  </div>

                  <div className="mt-2.5 sm:mt-3">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                      1. LATIHAN
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      Asah teknik tendang, pukul, sundulan kepala, dan super move tanpa batas waktu.
                    </p>

                    <div className="mt-2.5 space-y-1 text-[10px] sm:text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>Tanpa Batas Waktu</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Gol & Streak Tercatat Riil</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-3 sm:mt-4 w-full py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>MAIN LATIHAN</span>
                  </button>
                </div>

                {/* 2. PVP (DUEL 2 PEMAIN / MATCHMAKING LINTAS SERVER) */}
                <div
                  className="group relative p-3.5 sm:p-4 rounded-md bg-[#0e0e0e] border border-amber-500/40 hover:border-amber-400 hover:bg-neutral-900 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-md bg-neutral-900 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                      <Swords className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black uppercase tracking-wider">
                      STIK MENANG 🔥
                    </span>
                  </div>

                  <div className="mt-2.5 sm:mt-3">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                      2. PVP (DUEL 1V1)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      Tanding duel 1 lawan 1 lawan pemain lain di semua server. Pemenang mendapatkan Stik Menang khusus PvP!
                    </p>

                    <div className="mt-2.5 space-y-1 text-[10px] sm:text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>Timer 1 Menit (60s) • Darah 100 HP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-300 font-bold">Reward: +1 Stik Menang Khusus PvP 🏒</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsMatchmakingOpen(true);
                      }}
                      className="flex-1 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>CARI LAWAN</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChoose('pvp')}
                      className="py-2 px-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
                      title="Main 2 Pemain di 1 Keyboard/HP"
                    >
                      2P LOKAL
                    </button>
                  </div>
                </div>

                {/* 3. KOMPUTER (VS BOT AI) */}
                <div
                  onClick={() => handleChoose('ai')}
                  className="group relative p-3.5 sm:p-4 rounded-md bg-[#0e0e0e] border border-neutral-800 hover:border-amber-400/80 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                      POPULER
                    </span>
                  </div>

                  <div className="mt-2.5 sm:mt-3">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                      3. VS KOMPUTER
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      Lawan bot AI cerdas yang lihai sundul, tendang, tinju, dan tembakan super!
                    </p>

                    <div className="mt-2.5 space-y-1 text-[10px] sm:text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>Timer 1 Menit (60s)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        <span>Reward Koin, EXP, Diamond</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-3 sm:mt-4 w-full py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>LAWAN BOT</span>
                  </button>
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
        <div className="px-3 sm:px-6 py-2.5 border-t border-neutral-800 bg-[#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate max-w-full">
            <Keyboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-neutral-200">PC:</span>
            <span className="truncate">
              [Spasi] Lompat (2x) • [Q/E] Dash • {isSoccer ? '[F] Tendang • [R] Pukul' : '[F] Pukul • [R] Tendang'} • [G] Super
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-neutral-200">HP:</span>
            <span>Tap 2x Kiri/Kanan: Dash ⚡ • ▲ Lompat (2x)</span>
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

