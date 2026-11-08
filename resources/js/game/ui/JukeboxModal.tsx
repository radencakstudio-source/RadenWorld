/**
 * ============================================================================
 * FILE: resources/js/game/ui/JukeboxModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Antarmuka Pemutar Musik Jukebox Raden Cafe (Cozycore Clay-Pixel):
 * 1. Desain selaras dengan seluruh modal UI RadenWorld (.clay-modal-shell, .clay-card).
 * 2. Mengikuti tema UI aktif pengguna secara dinamis (Cozy Clay, Obsidian Dark, dll).
 * 3. Meja Putar Vinyl Interaktif (Piringan Hitam berputar saat memutar musik).
 * 4. Daftar lagu santai kafe dengan kontrol Play, Pause, Next, Prev, Volume, Shuffle, Repeat.
 * 5. Visualizer audio equalizer bergelombang saat musik berputar.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Disc3,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  X,
  Music,
  Radio,
  Sparkles,
  Coffee,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { JukeboxManager, IJukeboxTrack } from '../core/JukeboxManager';
import { EventBus } from '../core/EventBus';
import { ThemeSettings, THEME_PRESETS, DEFAULT_THEME_SETTINGS } from '../core/ThemeManager';
import { SoundManager } from '../core/SoundManager';

interface JukeboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeSettings?: ThemeSettings;
}

export const JukeboxModal: React.FC<JukeboxModalProps> = ({
  isOpen,
  onClose,
  themeSettings,
}) => {
  const jukebox = useMemo(() => JukeboxManager.getInstance(), []);

  // State sinkronisasi dari JukeboxManager
  const [playlist, setPlaylist] = useState<IJukeboxTrack[]>(() => jukebox.getPlaylist());
  const [currentTrack, setCurrentTrack] = useState<IJukeboxTrack>(() => jukebox.getCurrentTrack());
  const [currentIndex, setCurrentIndex] = useState<number>(() => jukebox.getCurrentIndex());
  const [isPlaying, setIsPlaying] = useState<boolean>(() => jukebox.getIsPlaying());
  const [volume, setVolume] = useState<number>(() => jukebox.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(() => jukebox.getIsMuted());
  const [isShuffle, setIsShuffle] = useState<boolean>(() => jukebox.getIsShuffle());
  const [isRepeat, setIsRepeat] = useState<boolean>(() => jukebox.getIsRepeat());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Warna tema dinamis yang aman
  const currentColors = useMemo(() => {
    if (!themeSettings) return DEFAULT_THEME_SETTINGS.customColors;
    if (themeSettings.preset === 'custom') return themeSettings.customColors;
    return THEME_PRESETS[themeSettings.preset]?.colors || DEFAULT_THEME_SETTINGS.customColors;
  }, [themeSettings]);

  // Listener event bus dari JukeboxManager
  useEffect(() => {
    const handleTrackChange = (track: IJukeboxTrack) => {
      setCurrentTrack(track);
      setCurrentIndex(jukebox.getCurrentIndex());
    };

    const handleStateChange = (state: { isPlaying: boolean; track: IJukeboxTrack; index: number; isShuffle?: boolean; isRepeat?: boolean }) => {
      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.track);
      setCurrentIndex(state.index);
      if (typeof state.isShuffle === 'boolean') setIsShuffle(state.isShuffle);
      if (typeof state.isRepeat === 'boolean') setIsRepeat(state.isRepeat);
    };

    const handleVolumeChange = (volState: { volume: number; isMuted: boolean }) => {
      setVolume(volState.volume);
      setIsMuted(volState.isMuted);
    };

    const handlePlaylistUpdate = (newPlaylist: IJukeboxTrack[]) => {
      setPlaylist(newPlaylist);
    };

    EventBus.on('jukebox-track-changed', handleTrackChange);
    EventBus.on('jukebox-state-changed', handleStateChange);
    EventBus.on('jukebox-volume-changed', handleVolumeChange);
    EventBus.on('jukebox-playlist-updated', handlePlaylistUpdate);

    return () => {
      EventBus.off('jukebox-track-changed', handleTrackChange);
      EventBus.off('jukebox-state-changed', handleStateChange);
      EventBus.off('jukebox-volume-changed', handleVolumeChange);
      EventBus.off('jukebox-playlist-updated', handlePlaylistUpdate);
    };
  }, [jukebox]);

  // Shortcut keyboard Escape dan Spasi
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        SoundManager.getInstance().playClick();
        onClose();
      } else if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        SoundManager.getInstance().playClick();
        jukebox.togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, jukebox]);

  // Filter lagu sesuai pencarian
  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim()) return playlist;
    const q = searchQuery.toLowerCase().trim();
    return playlist.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
    );
  }, [playlist, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="clay-panel w-full max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-150 text-black"
        style={{
          backgroundColor: currentColors.panelBg,
          borderColor: currentColors.panelBorder,
          color: currentColors.textColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================== */}
        {/* 1. HEADER MODAL JUKEBOX                                            */}
        {/* ================================================================== */}
        <header
          className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b-2"
          style={{
            borderColor: `${currentColors.panelBorder}40`,
            backgroundColor: `${currentColors.cardBg || currentColors.panelBg}`,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: currentColors.accentPrimary,
                borderColor: currentColors.panelBorder,
              }}
            >
              <Disc3
                className={`w-5 h-5 text-black stroke-[2.5] ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '3.5s' }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-wide truncate">
                  JUKEBOX RADEN CAFE
                </h2>
                <span
                  className="clay-badge-secondary px-1.5 py-0.5 text-[9px] font-bold hidden sm:inline-block border text-black"
                  style={{ borderColor: currentColors.panelBorder }}
                >
                  INTERIOR LOUNGE
                </span>
              </div>
              <p
                className="text-[10px] sm:text-[11px] font-bold opacity-80 truncate"
                style={{ color: currentColors.textColor }}
              >
                Musik latar eksklusif kafe & lounge santai
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              SoundManager.getInstance().playClick();
              onClose();
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center shrink-0 active:translate-y-[1px] transition-transform shadow-sm"
            style={{
              backgroundColor: currentColors.accentPrimary,
              borderColor: currentColors.panelBorder,
              color: '#000000',
            }}
            title="Tutup Jukebox [Esc]"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </header>

        {/* ================================================================== */}
        {/* 2. BODY KONTEN (MEJA PUTAR VINYL + PLAYLIST)                       */}
        {/* ================================================================== */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 landscape:grid-cols-12 min-h-0 custom-scrollbar">
          {/* ---------------------------------------------------------------- */}
          {/* KOLOM KIRI (MD: 5 COLS): MEJA PUTAR VINYL & DECK CONTROLS         */}
          {/* ---------------------------------------------------------------- */}
          <div
            className="md:col-span-5 landscape:col-span-5 p-2.5 sm:p-5 flex flex-col justify-between items-center text-center border-b-2 md:border-b-0 landscape:border-b-0 md:border-r-2 landscape:border-r-2"
            style={{
              borderColor: `${currentColors.panelBorder}35`,
              backgroundColor: `${currentColors.cardBg || currentColors.panelBg}60`,
            }}
          >
            {/* Piringan Hitam Vinyl Berputar */}
            <div className="relative my-1.5 sm:my-3">
              <div
                className={`w-28 h-28 sm:w-40 sm:h-40 landscape:w-28 landscape:h-28 rounded-full border-4 shadow-xl flex items-center justify-center relative transition-transform ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{
                  backgroundColor: '#18181B',
                  borderColor: currentColors.panelBorder,
                  animationDuration: '4s',
                  boxShadow: 'inset 0 0 16px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.3)',
                }}
              >
                {/* Alur Garis Piringan Vinyl */}
                <div className="absolute inset-2.5 rounded-full border border-zinc-700/60 pointer-events-none" />
                <div className="absolute inset-5 rounded-full border border-zinc-700/60 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-zinc-700/60 pointer-events-none" />
                <div className="absolute inset-11 rounded-full border border-zinc-700/60 pointer-events-none" />

                {/* Label Tengah Vinyl */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-md relative z-10"
                  style={{
                    backgroundColor: currentTrack.accentColor || currentColors.accentPrimary,
                    borderColor: currentColors.panelBorder,
                  }}
                >
                  <span className="text-xl sm:text-2xl leading-none">
                    {currentTrack.coverEmoji || '☕'}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/50 mt-1" />
                </div>
              </div>

              {/* Jarum Pemutar (Tonearm Stylus Needle) */}
              <div
                className={`absolute -top-1 -right-2 sm:-right-3 w-3 h-16 origin-top transition-transform duration-300 pointer-events-none z-20 ${
                  isPlaying ? 'rotate-12' : '-rotate-12'
                }`}
              >
                <div
                  className="w-2 h-14 rounded-full border shadow"
                  style={{
                    backgroundColor: '#D1D5DB',
                    borderColor: currentColors.panelBorder,
                  }}
                />
                <div
                  className="w-3.5 h-3.5 -mt-1 rounded-sm border"
                  style={{
                    backgroundColor: currentColors.accentPrimary,
                    borderColor: currentColors.panelBorder,
                  }}
                />
              </div>

              {/* Status Visualizer Equalizer Bar */}
              <div className="flex items-end justify-center gap-1 h-5 mt-2.5">
                {[45, 80, 60, 95, 50, 75, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-t transition-all duration-150"
                    style={{
                      height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 0.9 : 1.1)))}%` : '20%',
                      backgroundColor: isPlaying
                        ? currentTrack.accentColor || currentColors.accentPrimary
                        : `${currentColors.panelBorder}40`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Info Lagu Yang Sedang Berputar */}
            <div className="w-full my-2">
              <div
                className="text-xs font-black px-2 py-0.5 rounded-full inline-block border mb-1"
                style={{
                  backgroundColor: `${currentTrack.accentColor || currentColors.accentPrimary}30`,
                  borderColor: currentColors.panelBorder,
                  color: currentColors.textColor,
                }}
              >
                {currentTrack.genre}
              </div>
              <h3 className="text-sm sm:text-base font-black truncate leading-tight">
                {currentTrack.title}
              </h3>
              <p
                className="text-xs font-bold opacity-80 truncate mt-0.5"
                style={{ color: currentColors.textColor }}
              >
                {currentTrack.artist}
              </p>
              <span className="text-[10px] font-semibold opacity-70">
                {currentTrack.album} • {currentTrack.duration}
              </span>
            </div>

            {/* Kontrol Pemutar Musik (Transport Controls) */}
            <div className="w-full flex flex-col gap-2.5 pt-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {/* Shuffle */}
                <button
                  type="button"
                  onClick={() => {
                    SoundManager.getInstance().playClick();
                    jukebox.toggleShuffle();
                  }}
                  className="w-8 h-8 rounded-lg border-2 flex items-center justify-center active:translate-y-[1px] transition-transform"
                  style={{
                    backgroundColor: isShuffle
                      ? currentColors.accentPrimary
                      : currentColors.panelBg,
                    borderColor: currentColors.panelBorder,
                    color: isShuffle ? '#000000' : currentColors.textColor,
                  }}
                  title={isShuffle ? 'Acak Lagu: AKTIF' : 'Acak Lagu: NONAKTIF'}
                >
                  <Shuffle className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Prev */}
                <button
                  type="button"
                  onClick={() => {
                    SoundManager.getInstance().playClick();
                    jukebox.prev();
                  }}
                  className="w-9 h-9 rounded-lg border-2 flex items-center justify-center active:translate-y-[1px] transition-transform shadow-sm"
                  style={{
                    backgroundColor: currentColors.panelBg,
                    borderColor: currentColors.panelBorder,
                    color: currentColors.textColor,
                  }}
                  title="Lagu Sebelumnya"
                >
                  <SkipBack className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Play / Pause (Tombol Utama) */}
                <button
                  type="button"
                  onClick={() => {
                    SoundManager.getInstance().playClick();
                    jukebox.togglePlay();
                  }}
                  className="w-12 h-12 rounded-xl border-2 flex items-center justify-center active:translate-y-[1px] transition-transform shadow-md"
                  style={{
                    backgroundColor: currentColors.accentPrimary,
                    borderColor: currentColors.panelBorder,
                    color: '#000000',
                  }}
                  title={isPlaying ? 'Jeda Musik [Spasi]' : 'Putar Musik [Spasi]'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 stroke-[3]" />
                  ) : (
                    <Play className="w-6 h-6 stroke-[3] ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={() => {
                    SoundManager.getInstance().playClick();
                    jukebox.next();
                  }}
                  className="w-9 h-9 rounded-lg border-2 flex items-center justify-center active:translate-y-[1px] transition-transform shadow-sm"
                  style={{
                    backgroundColor: currentColors.panelBg,
                    borderColor: currentColors.panelBorder,
                    color: currentColors.textColor,
                  }}
                  title="Lagu Berikutnya"
                >
                  <SkipForward className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Repeat */}
                <button
                  type="button"
                  onClick={() => {
                    SoundManager.getInstance().playClick();
                    jukebox.toggleRepeat();
                  }}
                  className="w-8 h-8 rounded-lg border-2 flex items-center justify-center active:translate-y-[1px] transition-transform"
                  style={{
                    backgroundColor: isRepeat
                      ? currentColors.accentPrimary
                      : currentColors.panelBg,
                    borderColor: currentColors.panelBorder,
                    color: isRepeat ? '#000000' : currentColors.textColor,
                  }}
                  title={isRepeat ? 'Ulangi Lagu: AKTIF' : 'Ulangi Lagu: NONAKTIF'}
                >
                  <Repeat className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Slider Volume Suara */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                style={{
                  backgroundColor: `${currentColors.panelBg}`,
                  borderColor: `${currentColors.panelBorder}50`,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    SoundManager.getInstance().playClick();
                    jukebox.toggleMute();
                  }}
                  className="text-black opacity-80 hover:opacity-100"
                  style={{ color: currentColors.textColor }}
                  title={isMuted ? 'Buka Suara' : 'Bisukan Suara'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Volume2 className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    jukebox.setVolume(v);
                  }}
                  className="w-full h-2 rounded-lg accent-[#5C3A21] cursor-pointer"
                  style={{ accentColor: currentColors.accentPrimary }}
                  aria-label="Volume Jukebox"
                />

                <span
                  className="text-[10px] font-bold w-8 text-right font-mono"
                  style={{ color: currentColors.textColor }}
                >
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* KOLOM KANAN (MD: 7 COLS): DAFTAR LAGU (PLAYLIST)                  */}
          {/* ---------------------------------------------------------------- */}
          <div className="md:col-span-7 landscape:col-span-7 p-2.5 sm:p-4 flex flex-col min-h-0">
            {/* Header Playlist & Search Box */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Music className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="text-xs sm:text-sm font-black truncate">
                  DAFTAR LAGU KAFE
                </span>
                <span
                  className="clay-badge-secondary px-1.5 py-0.2 text-[9px] font-bold text-black border shrink-0"
                  style={{ borderColor: currentColors.panelBorder }}
                >
                  {playlist.length} TREK
                </span>
              </div>

              {/* Input Pencarian Lagu */}
              <div
                className="relative w-36 sm:w-44 flex items-center border rounded-md px-2 py-1 shadow-inner"
                style={{
                  backgroundColor: currentColors.cardBg || currentColors.panelBg,
                  borderColor: currentColors.panelBorder,
                }}
              >
                <Search className="w-3 h-3 opacity-60 mr-1.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari lagu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[10px] sm:text-[11px] font-bold bg-transparent outline-none"
                  style={{ color: currentColors.textColor }}
                />
              </div>
            </div>

            {/* List Lagu Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 max-h-[46dvh] md:max-h-[56dvh]">
              {filteredPlaylist.length === 0 ? (
                <div
                  className="p-6 text-center text-xs font-bold opacity-70 border-2 rounded-xl"
                  style={{ borderColor: `${currentColors.panelBorder}30` }}
                >
                  Tidak ada lagu yang cocok dengan "{searchQuery}".
                </div>
              ) : (
                filteredPlaylist.map((track) => {
                  const originalIndex = playlist.findIndex((t) => t.id === track.id);
                  const isCurrent = originalIndex === currentIndex;

                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        SoundManager.getInstance().playClick();
                        jukebox.play(originalIndex);
                      }}
                      className="w-full text-left p-2 sm:p-2.5 rounded-xl border-2 flex items-center justify-between gap-2 sm:gap-3 transition-transform active:translate-y-[1px] shadow-sm"
                      style={{
                        backgroundColor: isCurrent
                          ? `${currentColors.accentPrimary}35`
                          : `${currentColors.cardBg || currentColors.panelBg}`,
                        borderColor: isCurrent
                          ? currentColors.panelBorder
                          : `${currentColors.panelBorder}45`,
                      }}
                    >
                      {/* Nomor & Thumbnail Emoji */}
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <span
                          className="w-5 text-[10px] font-black text-center opacity-60 font-mono shrink-0"
                          style={{ color: currentColors.textColor }}
                        >
                          {String(originalIndex + 1).padStart(2, '0')}
                        </span>

                        <div
                          className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 shadow-sm"
                          style={{
                            backgroundColor: track.accentColor || currentColors.accentPrimary,
                            borderColor: currentColors.panelBorder,
                          }}
                        >
                          <span className="text-base leading-none">
                            {track.coverEmoji}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black truncate leading-tight">
                              {track.title}
                            </span>
                            {isCurrent && isPlaying && (
                              <span
                                className="clay-badge-primary text-[8px] font-black px-1 py-0.2 shrink-0 border"
                                style={{ borderColor: currentColors.panelBorder }}
                              >
                                MEMUTAR
                              </span>
                            )}
                          </div>
                          <p
                            className="text-[10px] sm:text-[11px] font-semibold opacity-75 truncate"
                            style={{ color: currentColors.textColor }}
                          >
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      {/* Tag Genre & Durasi */}
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span
                          className="clay-badge-neutral text-[9px] font-bold px-1.5 py-0.5 border hidden sm:inline-block"
                          style={{ borderColor: `${currentColors.panelBorder}40` }}
                        >
                          {track.genre}
                        </span>
                        <span
                          className="text-[10px] sm:text-xs font-mono font-bold opacity-80"
                          style={{ color: currentColors.textColor }}
                        >
                          {track.duration}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Note & Banner Kafe */}
            <div
              className="mt-3 p-2.5 rounded-xl border flex items-center gap-2 text-[10px] sm:text-[11px] font-bold"
              style={{
                backgroundColor: `${currentColors.cardBg || currentColors.panelBg}`,
                borderColor: `${currentColors.panelBorder}40`,
                color: currentColors.textColor,
              }}
            >
              <Coffee className="w-4 h-4 stroke-[2.5] shrink-0 text-amber-700" />
              <span className="leading-tight">
                Musik jukebox otomatis menemani waktu santaimu di kafe dan terjeda saat keluar ke dunia terbuka.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

