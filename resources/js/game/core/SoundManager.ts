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

  /** Efek suara karakter melompat ke udara (Mario Style Retro Spring Boing) */
  public playJump(isDoubleJump: boolean = false): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (isDoubleJump) {
        // Nada lebih tinggi & melengking ceria untuk Double Jump (360Hz -> 920Hz)
        osc.type = 'square';
        osc.frequency.setValueAtTime(360, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.16);
      } else {
        // Nada khas Mario Jump (sweep kenyal dari 160Hz ke 640Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.18);
      }

      const dur = isDoubleJump ? 0.16 : 0.18;
      const vol = this.masterVolume * this.sfxVolume * (isDoubleJump ? 0.09 : 0.12);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {}
  }

  /** Efek suara koin emas / jual ikan (Retro Coin Chime) */
  public playCoin(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Duet nada B5 (987.77Hz) & E6 (1318.51Hz) khas koin Mario
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      const vol1 = this.masterVolume * this.sfxVolume * 0.12;
      gain1.gain.setValueAtTime(vol1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.07);
      const vol2 = this.masterVolume * this.sfxVolume * 0.14;
      gain2.gain.setValueAtTime(vol2, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }

  /** Efek suara konsumsi item / gunakan alat */
  public playItemUse(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      const vol = this.masterVolume * this.sfxVolume * 0.1;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  /** Efek suara mendarat ke lantai (Landing Thud) */
  public playLand(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.09);
      const vol = this.masterVolume * this.sfxVolume * 0.14;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  /** Efek suara melempar kail pancing (Rod Cast Whoosh) */
  public playFishCast(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.12);
      const vol = this.masterVolume * this.sfxVolume * 0.1;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  /** Efek suara ikan menyambar umpan (Bite Alert) */
  public playFishBite(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [880, 1174].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        const vol = this.masterVolume * this.sfxVolume * 0.08;
        gain.gain.setValueAtTime(vol, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.08);
      });
    } catch (e) {}
  }

  /** Efek cipratan air (Water Splash) */
  public playFishSplash(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      const vol = this.masterVolume * this.sfxVolume * 0.12;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  /** Efek suara gagal / error / ikan lepas */
  public playError(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [240, 160].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        const vol = this.masterVolume * this.sfxVolume * 0.1;
        gain.gain.setValueAtTime(vol, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.12);
      });
    } catch (e) {}
  }
}
