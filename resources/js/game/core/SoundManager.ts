/**
 * ============================================================================
 * FILE: resources/js/game/core/SoundManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelola audio sintetis berbasis Web Audio API murni.
 * Menghasilkan efek suara interaktif instan (klik tombol, buka menu, hover, koin)
 * secara realtime tanpa memerlukan file audio eksternal yang berat.
 * ============================================================================
 */

export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.05; // 5% sesuai permintaan pengguna
  private isMuted: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmUrl: string = '/assets/audio/bgm/RadenWorld Music.mp3';
  private isBgmPlaying: boolean = false;
  private userInteracted: boolean = false;

  private constructor() {
    // Inisialisasi audio BGM di browser
    if (typeof window !== 'undefined') {
      try {
        const savedBgm = localStorage.getItem('raden_bgm_vol');
        if (savedBgm) {
          const parsed = parseFloat(savedBgm);
          this.bgmVolume = parsed >= 0.5 ? 0.05 : parsed;
        } else {
          this.bgmVolume = 0.05;
          localStorage.setItem('raden_bgm_vol', '0.05');
        }
        const savedMute = localStorage.getItem('raden_is_muted');
        if (savedMute) this.isMuted = savedMute === 'true';
      } catch (e) {}
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private initBgm(): void {
    if (typeof window === 'undefined' || this.bgmAudio) return;
    try {
      this.bgmAudio = new Audio(this.bgmUrl);
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';
      this.updateBgmVolume();
    } catch (e) {
      console.warn('[SoundManager] Inisialisasi BGM audio error:', e);
    }
  }

  private updateBgmVolume(): void {
    if (!this.bgmAudio) return;
    if (this.isMuted) {
      this.bgmAudio.volume = 0;
    } else {
      this.bgmAudio.volume = Math.max(0, Math.min(1, this.masterVolume * this.bgmVolume));
    }
  }

  /**
   * Memulai memutar Musik Latar (BGM) resmi RadenWorld
   */
  public playBGM(customUrl?: string): void {
    if (typeof window === 'undefined') return;
    this.initBgm();
    if (!this.bgmAudio) return;

    if (customUrl && customUrl !== this.bgmUrl) {
      this.bgmUrl = customUrl;
      this.bgmAudio.src = customUrl;
    }

    this.updateBgmVolume();

    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isBgmPlaying = true;
        })
        .catch(() => {
          // Browser memblokir autoplay sebelum user gesture: pasang trigger klik pertama
          this.isBgmPlaying = false;
          const startOnGesture = () => {
            if (!this.userInteracted) {
              this.userInteracted = true;
              this.bgmAudio?.play().then(() => {
                this.isBgmPlaying = true;
              }).catch(() => {});
            }
            window.removeEventListener('pointerdown', startOnGesture);
            window.removeEventListener('keydown', startOnGesture);
          };
          window.addEventListener('pointerdown', startOnGesture, { once: true });
          window.addEventListener('keydown', startOnGesture, { once: true });
        });
    }
  }

  public pauseBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
    }
  }

  public toggleBGM(): void {
    if (this.getIsBgmPlaying()) {
      this.pauseBGM();
    } else {
      this.playBGM();
    }
  }

  public getIsBgmPlaying(): boolean {
    return Boolean(this.bgmAudio && !this.bgmAudio.paused);
  }

  public setBgmVolume(bgm: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, bgm));
    try {
      localStorage.setItem('raden_bgm_vol', this.bgmVolume.toString());
    } catch (e) {}
    this.updateBgmVolume();
  }

  public setVolume(master: number, sfx: number, bgm?: number): void {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (typeof bgm === 'number') {
      this.bgmVolume = Math.max(0, Math.min(1, bgm));
    }
    this.updateBgmVolume();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('raden_is_muted', muted.toString());
    } catch (e) {}
    this.updateBgmVolume();
  }

  /** Memainkan suara klik tombol UI bernada tinggi */
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);

      const finalVol = this.masterVolume * this.sfxVolume * 0.15;
      gain.gain.setValueAtTime(finalVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Browser audio restriction safeguard
    }
  }

  /** Memainkan suara hover tombol */
  public playHover(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(520, ctx.currentTime + 0.04);

      const finalVol = this.masterVolume * this.sfxVolume * 0.05;
      gain.gain.setValueAtTime(finalVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  /** Memainkan suara buka jendela modal / popup */
  public playOpenModal(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.15);

      const finalVol = this.masterVolume * this.sfxVolume * 0.12;
      gain.gain.setValueAtTime(finalVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  /** Memainkan nada sukses (saat login / join open world) */
  public playSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        const finalVol = this.masterVolume * this.sfxVolume * 0.1;
        gain.gain.setValueAtTime(finalVol, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } catch (e) {}
  }
}
