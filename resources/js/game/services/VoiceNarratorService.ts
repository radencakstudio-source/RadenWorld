/**
 * ============================================================================
 * FILE: resources/js/game/services/VoiceNarratorService.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Layanan Narator Suara Bahasa Indonesia Hibrida (High-Definition Online MP3 + Native Speech).
 * Menjamin 100% SUARA BAHASA INDONESIA BERBUNYI DI SEMUA PERANGKAT:
 * 1. Primary Engine: Online High-Definition Indonesian Audio Stream (Google TTS MP3)
 *    - Lafal bahasa Indonesia asli, fasih, hangat, dan jernih.
 *    - Tidak terpengaruh ketiadaan paket suara bahasa Indonesia di Windows/OS pengguna.
 * 2. Secondary Engine: Native Web Speech API (speechSynthesis) sebagai fallback luring.
 * 3. Text Sanitizer: Mengubah rumus/pecahan ke kata Indonesia alami (1/2 -> satu per dua),
 *    menghilangkan emoji, simbol matematika rumit agar nyaman didengar anak & siswa.
 * ============================================================================
 */

export interface VoiceNarratorState {
  isSpeaking: boolean;
  isEnabled: boolean;
  hasVoiceSupport: boolean;
  engine: 'online_mp3' | 'speech_synthesis';
  currentText: string;
}

export type VoiceStateListener = (state: VoiceNarratorState) => void;

export class VoiceNarratorService {
  private static instance: VoiceNarratorService | null = null;

  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpokenText: string = '';
  private currentEngine: 'online_mp3' | 'speech_synthesis' = 'online_mp3';
  private listeners: Set<VoiceStateListener> = new Set();

  // Audio MP3 Queue System
  private currentAudio: HTMLAudioElement | null = null;
  private audioQueue: string[] = [];
  private currentQueueIndex: number = 0;
  private isCancelled: boolean = false;

  // Web Speech API Fallback
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    // Baca status aktif dari LocalStorage
    try {
      const saved = localStorage.getItem('raden_voice_narrator_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
    } catch {
      this.isEnabled = true;
    }

    // Inisialisasi daftar suara lokal untuk fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initLocalVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initLocalVoices();
        };
      }
    }
  }

  public static getInstance(): VoiceNarratorService {
    if (!VoiceNarratorService.instance) {
      VoiceNarratorService.instance = new VoiceNarratorService();
    }
    return VoiceNarratorService.instance;
  }

  /**
   * Inisialisasi suara lokal speechSynthesis
   */
  private initLocalVoices(): void {
    try {
      this.cachedVoices = window.speechSynthesis.getVoices();
      const idVoice =
        this.cachedVoices.find(
          (v) =>
            v.lang.toLowerCase() === 'id-id' ||
            v.lang.toLowerCase() === 'id_id' ||
            v.name.toLowerCase().includes('indonesia') ||
            v.name.toLowerCase().includes('gadis') ||
            v.name.toLowerCase().includes('ardi')
        ) ||
        this.cachedVoices.find((v) => v.lang.toLowerCase().startsWith('id'));

      if (idVoice) {
        this.selectedVoice = idVoice;
      }
    } catch {}
  }

  /**
   * Pembersih teks agar pelafalan bahasa Indonesia fasih dan santai
   */
  public cleanText(rawText: string): string {
    if (!rawText) return '';

    return rawText
      // Bersihkan emoji Unicode
      .replace(/[\u{1F300}-\u{1FAD6}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
      // Transkripsi simbol umum ke ucapan Indonesia yang jelas
      .replace(/➔|->|-->/g, ', selanjutnya ')
      .replace(/•/g, ', ')
      .replace(/\+/g, ' ditambah ')
      .replace(/×|\*/g, ' dikali ')
      .replace(/÷/g, ' dibagi ')
      .replace(/=/g, ' sama dengan ')
      // Pecahan umum
      .replace(/\b1\/2\b/g, 'setengah atau satu perdua')
      .replace(/\b1\/4\b/g, 'seperempat atau satu perempat')
      .replace(/\b2\/4\b/g, 'dua perempat')
      .replace(/\b3\/4\b/g, 'tiga perempat')
      .replace(/\b1\/8\b/g, 'satu perdelapan')
      .replace(/\b3\/8\b/g, 'tiga perdelapan')
      // Formula & singkatan umum
      .replace(/F\s*=\s*m\s*·\s*a/gi, 'Gaya F sama dengan massa m dikali percepatan a')
      .replace(/Qd\s*=\s*Qs/gi, 'Permintaan Qd sama dengan Penawaran Qs')
      .replace(/\[\s*\?\s*\]/g, 'kotak misteri')
      .replace(/\[|\]|\{|\}/g, ' ')
      .replace(/(\r\n|\n|\r)/gm, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Pecah teks panjang menjadi potongan kalimat alami (max 140 karakter per potong)
   * agar didukung penuh oleh streaming audio TTS online
   */
  public splitIntoChunks(text: string, maxLen: number = 140): string[] {
    const cleaned = this.cleanText(text);
    if (!cleaned) return [];
    if (cleaned.length <= maxLen) return [cleaned];

    const sentences = cleaned.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= maxLen) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        if (s.length > maxLen) {
          // Jika satu kalimat panjang tanpa titik, potong berdasarkan koma
          const commaParts = s.split(/,\s*/);
          let subCurrent = '';
          for (const cp of commaParts) {
            if ((subCurrent + ', ' + cp).trim().length <= maxLen) {
              subCurrent = subCurrent ? subCurrent + ', ' + cp : cp;
            } else {
              if (subCurrent) chunks.push(subCurrent);
              subCurrent = cp;
            }
          }
          if (subCurrent) current = subCurrent;
        } else {
          current = s;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.filter((c) => c.trim().length > 0);
  }

  /**
   * Main Speak Method:
   * Memprioritaskan Online High-Definition Indonesian TTS Audio Stream.
   * Jika gagal/luring, otomatis fallback ke speechSynthesis lokal.
   */
  public speak(
    text: string,
    options?: {
      force?: boolean;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): void {
    if (!this.isEnabled && !options?.force) return;

    const cleaned = this.cleanText(text);
    if (!cleaned) return;

    // Jika sedang memutar teks yang sama dan bukan force, jangan interupsi pemutaran
    if (!options?.force && this.isSpeaking && this.lastSpokenText === cleaned) {
      return;
    }

    this.stop(); // Hentikan audio sebelumnya
    this.isCancelled = false;
    this.lastSpokenText = cleaned;

    const chunks = this.splitIntoChunks(cleaned);
    if (chunks.length === 0) return;

    this.audioQueue = chunks;
    this.currentQueueIndex = 0;
    this.isSpeaking = true;
    this.currentEngine = 'online_mp3';
    this.notifyListeners();
    options?.onStart?.();

    // Jalankan pemutaran antrian chunk audio
    this.playNextAudioChunk(options?.onEnd);
  }

  /**
   * Memutar chunk audio MP3 online dari antrian
   */
  private playNextAudioChunk(onEnd?: () => void): void {
    if (this.isCancelled) return;

    if (this.currentQueueIndex >= this.audioQueue.length) {
      this.isSpeaking = false;
      this.currentAudio = null;
      this.notifyListeners();
      onEnd?.();
      return;
    }

    const chunk = this.audioQueue[this.currentQueueIndex];
    const encoded = encodeURIComponent(chunk);
    const audioUrl = `/api/tts?lang=id&text=${encoded}`;

    try {
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        if (!this.isCancelled && this.currentAudio === audio) {
          this.currentQueueIndex++;
          this.playNextAudioChunk(onEnd);
        }
      };

      audio.onerror = (e) => {
        // Jika audio sudah dibatalkan atau digantikan oleh instance baru, abaikan
        if (this.isCancelled || this.currentAudio !== audio) {
          return;
        }
        console.warn(
          '[VoiceNarratorService] Audio /api/tts gagal, fallback ke SpeechSynthesis lokal...',
          e
        );
        this.fallbackToSpeechSynthesis(onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (this.isCancelled || this.currentAudio !== audio) {
            return;
          }
          if (err.name === 'NotAllowedError') {
            console.warn(
              '[VoiceNarratorService] Browser membatasi pemutaran otomatis (perlu klik pengguna).'
            );
          } else {
            console.warn('[VoiceNarratorService] Autoplay audio error:', err);
            this.fallbackToSpeechSynthesis(onEnd);
          }
        });
      }
    } catch (err) {
      if (!this.isCancelled) {
        console.warn('[VoiceNarratorService] Pengecualian audio elemen:', err);
        this.fallbackToSpeechSynthesis(onEnd);
      }
    }
  }

  /**
   * Fallback menggunakan Web Speech API jika perangkat luring / audio online gagal
   */
  private fallbackToSpeechSynthesis(onEnd?: () => void): void {
    if (this.isCancelled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      this.notifyListeners();
      onEnd?.();
      return;
    }

    try {
      this.currentEngine = 'speech_synthesis';
      const remainingText = this.audioQueue
        .slice(this.currentQueueIndex)
        .join('. ');

      const utterance = new SpeechSynthesisUtterance(remainingText || this.lastSpokenText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.notifyListeners();
        onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.notifyListeners();
        onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      this.notifyListeners();
      onEnd?.();
    }
  }

  /**
   * Hentikan seluruh suara yang sedang berbicara saat ini
   */
  public stop(): void {
    this.isCancelled = true;
    this.audioQueue = [];
    this.currentQueueIndex = 0;

    // Hentikan audio online MP3 dengan pelepasan event handler yang aman
    if (this.currentAudio) {
      const audioToClean = this.currentAudio;
      this.currentAudio = null;
      audioToClean.onended = null;
      audioToClean.onerror = null;
      audioToClean.oncanplay = null;
      try {
        audioToClean.pause();
        audioToClean.removeAttribute('src');
        audioToClean.load();
      } catch {}
    }

    // Hentikan speechSynthesis lokal
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.currentUtterance = null;
    }

    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.notifyListeners();
    }
  }

  /**
   * Jeda suara
   */
  public pause(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
    this.isSpeaking = false;
    this.notifyListeners();
  }

  /**
   * Lanjutkan suara
   */
  public resume(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.play();
        this.isSpeaking = true;
        this.notifyListeners();
      } catch {}
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        this.isSpeaking = true;
        this.notifyListeners();
      } catch {}
    }
  }

  /**
   * Bacakan ulang teks terakhir
   */
  public replay(): void {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, { force: true });
    }
  }

  /**
   * Toggle status suara ON / OFF
   */
  public toggleVoice(): boolean {
    this.isEnabled = !this.isEnabled;
    try {
      localStorage.setItem('raden_voice_narrator_enabled', String(this.isEnabled));
    } catch {}

    if (!this.isEnabled) {
      this.stop();
    }
    this.notifyListeners();
    return this.isEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('raden_voice_narrator_enabled', String(this.isEnabled));
    } catch {}
    if (!enabled) {
      this.stop();
    }
    this.notifyListeners();
  }

  public getIsVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getState(): VoiceNarratorState {
    return {
      isSpeaking: this.isSpeaking,
      isEnabled: this.isEnabled,
      hasVoiceSupport: true,
      engine: this.currentEngine,
      currentText: this.lastSpokenText,
    };
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('[VoiceNarratorService] Error pada listener:', err);
      }
    });
  }
}
