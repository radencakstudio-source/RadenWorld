/**
 * ============================================================================
 * FILE: resources/js/game/core/JukeboxManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelola Audio Jukebox Khusus Raden Cafe:
 * 1. Playlist musik santai kafe (Lofi, Acoustic, Bossa Nova, Piano, Jazz).
 * 2. Pemutar audio ganda:
 *    - HTML5 Audio untuk file musik sungguhan (MP3 / Audio URL).
 *    - Procedural Web Audio API Ambient Lofi Synthesizer sebagai fallback
 *      merdu dan menenangkan sebelum pengguna menyematkan file audio kustom.
 * 3. Kontrol Transportasi Lengkap: Play, Pause, Stop, Next, Previous, Volume, Mute, Shuffle, Repeat.
 * 4. Integrasi CafeScene: Otomatis mematikan BGM global saat masuk kafe,
 *    dan mematikan Jukebox serta memulihkan BGM global saat keluar kafe.
 * ============================================================================
 */

import { EventBus } from './EventBus';
import { SoundManager } from './SoundManager';

export interface IJukeboxTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  src?: string;
  coverEmoji: string;
  accentColor: string;
}

export const DEFAULT_JUKEBOX_PLAYLIST: IJukeboxTrack[] = [
  {
    id: 'track-1',
    title: 'Sore di Raden Cafe',
    artist: 'Raden Music Studio',
    album: 'Cozy Cafe Sessions Vol. 1',
    genre: 'Lofi Hip Hop',
    duration: '2:45',
    src: '',
    coverEmoji: '☕',
    accentColor: '#F59E0B',
  },
  {
    id: 'track-2',
    title: 'Aroma Kopi Gayo',
    artist: 'Barista Doni & Friends',
    album: 'Aceh Highlands Acoustic',
    genre: 'Acoustic Guitar',
    duration: '3:12',
    src: '',
    coverEmoji: '🎸',
    accentColor: '#10B981',
  },
  {
    id: 'track-3',
    title: 'Hujan di Teras Kafe',
    artist: 'Nusantara Chill',
    album: 'Rainy Day Reverie',
    genre: 'Lofi Piano',
    duration: '2:58',
    src: '',
    coverEmoji: '🌧️',
    accentColor: '#06B6D4',
  },
  {
    id: 'track-4',
    title: 'Midnight Espresso',
    artist: 'Raden Lounge Quartet',
    album: 'After Dark Sessions',
    genre: 'Bossa Nova Jazz',
    duration: '3:30',
    src: '',
    coverEmoji: '🎷',
    accentColor: '#8B5CF6',
  },
  {
    id: 'track-5',
    title: 'Senja Parahyangan',
    artist: 'Sunda Ambient Collective',
    album: 'Ethnic Chillwave',
    genre: 'Chillwave Nusantara',
    duration: '3:15',
    src: '',
    coverEmoji: '🌄',
    accentColor: '#EC4899',
  },
  {
    id: 'track-6',
    title: 'Vinyl Memories',
    artist: 'Retro Cafe Collection',
    album: 'Golden Era Memories',
    genre: 'Vintage Soul',
    duration: '2:50',
    src: '',
    coverEmoji: '📻',
    accentColor: '#F97316',
  },
  {
    id: 'track-7',
    title: 'RadenWorld Original Theme',
    artist: 'RadenWorld OST',
    album: 'Official Game Soundtrack',
    genre: 'Adventure BGM',
    duration: '3:40',
    src: '/assets/audio/bgm/RadenWorld%20Music.mp3',
    coverEmoji: '👑',
    accentColor: '#EAB308',
  },
];

export class JukeboxManager {
  private static instance: JukeboxManager;

  private playlist: IJukeboxTrack[] = [...DEFAULT_JUKEBOX_PLAYLIST];
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private volume: number = 0.5; // 50% default
  private isMuted: boolean = false;
  private isShuffle: boolean = false;
  private isRepeat: boolean = false;

  // HTMLAudioElement untuk file musik kustom
  private audio: HTMLAudioElement | null = null;

  // Procedural Web Audio API Synthesizer (Fallback santai saat belum ada file mp3)
  private audioCtx: AudioContext | null = null;
  private synthTimer: number | null = null;
  private masterGain: GainNode | null = null;
  private synthStep: number = 0;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedVol = localStorage.getItem('raden_jukebox_vol');
        if (savedVol) {
          const v = parseFloat(savedVol);
          if (!isNaN(v) && v >= 0 && v <= 1) this.volume = v;
        }
      } catch (e) {}
    }
  }

  public static getInstance(): JukeboxManager {
    if (!JukeboxManager.instance) {
      JukeboxManager.instance = new JukeboxManager();
    }
    return JukeboxManager.instance;
  }

  // ==========================================================================
  // GETTER & STATUS
  // ==========================================================================

  public getPlaylist(): IJukeboxTrack[] {
    return this.playlist;
  }

  public getCurrentTrack(): IJukeboxTrack {
    return this.playlist[this.currentTrackIndex] || this.playlist[0];
  }

  public getCurrentIndex(): number {
    return this.currentTrackIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsShuffle(): boolean {
    return this.isShuffle;
  }

  public getIsRepeat(): boolean {
    return this.isRepeat;
  }

  // ==========================================================================
  // TRANSPORT CONTROLS
  // ==========================================================================

  public play(index?: number): void {
    if (typeof index === 'number' && index >= 0 && index < this.playlist.length) {
      this.currentTrackIndex = index;
    }

    const track = this.getCurrentTrack();
    this.isPlaying = true;

    // Hentikan suara synth sebelumnya jika ada
    this.stopSynth();

    if (track.src && track.src.trim() !== '') {
      // Putar via HTML5 Audio
      this.playHtmlAudio(track.src);
    } else {
      // Putar via Procedural Lofi Ambient Synth
      this.stopHtmlAudio();
      this.startProceduralSynth(this.currentTrackIndex);
    }

    EventBus.emit('jukebox-track-changed', track);
    EventBus.emit('jukebox-state-changed', {
      isPlaying: this.isPlaying,
      track: track,
      index: this.currentTrackIndex,
    });
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
    this.stopSynth();

    EventBus.emit('jukebox-state-changed', {
      isPlaying: false,
      track: this.getCurrentTrack(),
      index: this.currentTrackIndex,
    });
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop(): void {
    this.pause();
    if (this.audio) {
      this.audio.currentTime = 0;
    }
  }

  public next(): void {
    if (this.isShuffle && this.playlist.length > 1) {
      let randIdx = Math.floor(Math.random() * this.playlist.length);
      if (randIdx === this.currentTrackIndex) {
        randIdx = (randIdx + 1) % this.playlist.length;
      }
      this.play(randIdx);
    } else {
      const nextIdx = (this.currentTrackIndex + 1) % this.playlist.length;
      this.play(nextIdx);
    }
  }

  public prev(): void {
    const prevIdx = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.play(prevIdx);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('raden_jukebox_vol', this.volume.toString());
    } catch (e) {}

    const effectiveVol = this.isMuted ? 0 : this.volume;
    if (this.audio) {
      this.audio.volume = effectiveVol;
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(effectiveVol * 0.25, this.audioCtx.currentTime);
    }

    EventBus.emit('jukebox-volume-changed', {
      volume: this.volume,
      isMuted: this.isMuted,
    });
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
  }

  public toggleShuffle(): void {
    this.isShuffle = !this.isShuffle;
    EventBus.emit('jukebox-state-changed', {
      isPlaying: this.isPlaying,
      track: this.getCurrentTrack(),
      index: this.currentTrackIndex,
      isShuffle: this.isShuffle,
    });
  }

  public toggleRepeat(): void {
    this.isRepeat = !this.isRepeat;
    if (this.audio) {
      this.audio.loop = this.isRepeat;
    }
    EventBus.emit('jukebox-state-changed', {
      isPlaying: this.isPlaying,
      track: this.getCurrentTrack(),
      index: this.currentTrackIndex,
      isRepeat: this.isRepeat,
    });
  }

  // ==========================================================================
  // CAFE SCENE HOOKS
  // ==========================================================================

  /**
   * Dipanggil saat pemain memasuki CafeScene
   */
  public startInCafe(): void {
    // Matikan BGM default RadenWorld agar kafe punya atmosfer musik sendiri
    SoundManager.getInstance().suppressBGM(true);

    // Otomatis putar Jukebox santai jika belum aktif
    if (!this.isPlaying) {
      this.play();
    }
  }

  /**
   * Dipanggil saat pemain meninggalkan CafeScene
   */
  public stopInCafe(): void {
    // Hentikan pemutaran musik jukebox
    this.stop();

    // Pulihkan BGM default RadenWorld di dunia luar
    SoundManager.getInstance().suppressBGM(false);
  }

  /**
   * Menambahkan lagu baru ke playlist Jukebox (mudah diperluas kapan saja)
   */
  public addTrack(track: IJukeboxTrack): void {
    this.playlist.push(track);
    EventBus.emit('jukebox-playlist-updated', this.playlist);
  }

  /**
   * Mengganti seluruh playlist Jukebox dengan daftar baru
   */
  public setPlaylist(tracks: IJukeboxTrack[]): void {
    if (Array.isArray(tracks) && tracks.length > 0) {
      this.playlist = [...tracks];
      this.currentTrackIndex = 0;
      EventBus.emit('jukebox-playlist-updated', this.playlist);
    }
  }

  // ==========================================================================
  // ENGINE PEMUTAR AUDIO
  // ==========================================================================

  private playHtmlAudio(src: string): void {
    if (typeof window === 'undefined') return;

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => {
        if (this.isRepeat) {
          this.audio?.play().catch(() => {});
        } else {
          this.next();
        }
      });
      this.audio.addEventListener('error', () => {
        console.warn('[JukeboxManager] File audio tidak dapat dimuat, beralih ke Synth Lofi Ambient.');
        this.startProceduralSynth(this.currentTrackIndex);
      });
    }

    this.audio.src = src;
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.audio.loop = this.isRepeat;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay terblokir browser sampai ada interaksi klik
      });
    }
  }

  private stopHtmlAudio(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  /**
   * Procedural Lofi Ambient Synthesizer (Web Audio API)
   * Menghasilkan akor-akor jazz/lofi hangat, lembut, dan menenangkan
   */
  private startProceduralSynth(trackIndex: number): void {
    if (typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.audioCtx) {
      try {
        this.audioCtx = new AudioCtx();
      } catch (e) {
        return;
      }
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    if (!this.masterGain) {
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
    }

    const effectiveVol = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.setValueAtTime(effectiveVol * 0.22, this.audioCtx.currentTime);

    // Kumpulan progres akor jazz/lofi santai berbeda untuk setiap trek
    const trackChordProgressions: number[][][] = [
      // Track 1 (Lofi Hip Hop): Cmaj7 -> Am7 -> Dm7 -> G7
      [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [196.00, 246.94, 293.66, 349.23], // G7
      ],
      // Track 2 (Acoustic Guitar): G -> Em -> C -> D
      [
        [196.00, 246.94, 293.66, 392.00], // G
        [164.81, 246.94, 329.63, 392.00], // Em
        [261.63, 329.63, 392.00, 523.25], // C
        [293.66, 369.99, 440.00, 587.33], // D
      ],
      // Track 3 (Lofi Piano): Fmaj7 -> Em7 -> Dm7 -> Cmaj7
      [
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [329.63, 392.00, 493.88, 587.33], // Em7
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
      ],
      // Track 4 (Bossa Nova): Dm9 -> G13 -> Cmaj9 -> A7b13
      [
        [293.66, 349.23, 440.00, 659.25], // Dm9
        [196.00, 329.63, 349.23, 440.00], // G13
        [261.63, 329.63, 392.00, 587.33], // Cmaj9
        [220.00, 261.63, 329.63, 415.30], // A7b13
      ],
      // Track 5 (Chillwave Nusantara): Sunda Salendro Ambient Pentatonic
      [
        [261.63, 293.66, 329.63, 392.00, 440.00],
        [220.00, 261.63, 329.63, 440.00, 523.25],
        [196.00, 261.63, 293.66, 392.00, 493.88],
        [246.94, 293.66, 369.99, 440.00, 587.33],
      ],
      // Track 6 (Vintage Soul): Ebm7 -> Ab7 -> Dbmaj7 -> Bb7
      [
        [311.13, 369.99, 466.16, 554.37], // Ebm7
        [207.65, 261.63, 311.13, 369.99], // Ab7
        [277.18, 349.23, 415.30, 523.25], // Dbmaj7
        [233.08, 293.66, 349.23, 466.16], // Bb7
      ],
    ];

    const currentProg = trackChordProgressions[trackIndex % trackChordProgressions.length];
    this.synthStep = 0;

    const playChord = () => {
      if (!this.isPlaying || !this.audioCtx || !this.masterGain) return;

      const chord = currentProg[this.synthStep % currentProg.length];
      this.synthStep++;

      const now = this.audioCtx.currentTime;
      const duration = 2.4; // Detik per akor

      chord.forEach((freq, i) => {
        if (!this.audioCtx || !this.masterGain) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        // Nada lembut menggunakan Sine & Triangle dengan Lowpass filter hangat
        osc.type = i % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + Math.sin(this.synthStep) * 150, now);
        filter.Q.setValueAtTime(1.2, now);

        // Sedikit arpeggiasi halus antar nada (stagger 45ms)
        const noteStart = now + i * 0.045;
        const noteVol = 0.08 / Math.sqrt(chord.length);

        gain.gain.setValueAtTime(0.0001, noteStart);
        // Attack lembut
        gain.gain.exponentialRampToValueAtTime(noteVol, noteStart + 0.12);
        // Decay & Sustain hangat
        gain.gain.exponentialRampToValueAtTime(noteVol * 0.45, noteStart + 1.2);
        // Release lembut
        gain.gain.exponentialRampToValueAtTime(0.00001, noteStart + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.1);
      });
    };

    // Putar akor pertama seketika
    playChord();

    // Interval putar akor berikutnya
    if (this.synthTimer) {
      window.clearInterval(this.synthTimer);
    }
    this.synthTimer = window.setInterval(playChord, 2400);
  }

  private stopSynth(): void {
    if (this.synthTimer) {
      window.clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
  }
}

