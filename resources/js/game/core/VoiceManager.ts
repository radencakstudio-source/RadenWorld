/**
 * ============================================================================
 * FILE: resources/js/game/core/VoiceManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Proximity Voice Chat Manager untuk RadenWorld.
 * Menangani rekaman mikrofon lokal, transmisi audio PCM 16-bit ke WebSocket,
 * serta penerimaan suara dari pemain lain dengan batasan spasial radius
 * X [-5 s/d 5] dan Y [-5 s/d 5] petak grid (1 petak = 120px).
 * Menggunakan Web Audio API untuk latensi sangat rendah (<50ms) dan pemutaran
 * suara yang stabil tanpa distorsi/korupsi format.
 * ============================================================================
 */

import { NetworkManager } from './NetworkManager';
import { EventBus } from './EventBus';

export class VoiceManager {
  private static instance: VoiceManager;

  /** Status apakah mikrofon pemain aktif atau dibisukan (muted) */
  private isMicEnabled: boolean = false;

  /** Objek MediaStream dari mikrofon pengguna */
  private localStream: MediaStream | null = null;

  /** AudioContext untuk perekaman & deteksi suara lokal (VAD) */
  private recordContext: AudioContext | null = null;

  /** Node pemrosesan audio mentah (AudioWorklet atau ScriptProcessor) */
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;

  /** AudioContext untuk pemutaran suara pemain lain yang masuk */
  private playbackContext: AudioContext | null = null;

  /** Referensi ke singleton NetworkManager */
  private networkManager: NetworkManager;

  /** Posisi X pemain lokal saat ini (dalam pixel) */
  private localX: number = 4800;

  /** Posisi Y pemain lokal saat ini (dalam pixel) */
  private localY: number = 4800;

  /** Ukuran satu petak grid dalam pixel */
  private readonly tileSize: number = 120;

  /** Radius maksimal proximity voice dalam petak grid (x -5 s/d 5, y -5 s/d 5) */
  private readonly maxTileRange: number = 5;

  /** Frekuensi sampel standar untuk transmisi suara ringan & jernih (16 kHz) */
  private readonly sampleRate: number = 16000;

  /** Status apakah pemain lokal sedang terdeteksi bersuara */
  private isLocalSpeaking: boolean = false;

  /** Timer jeda diam agar indikator tidak berkedip antar suku kata */
  private silenceTimeout: number | null = null;

  /** Waktu penjadwalan pemutaran buffer audio berikutnya per pengirim */
  private nextPlaybackTimes: Record<string, number> = {};

  /** Timer status berbicara pemain jarak jauh */
  private remoteSpeakingTimers: Record<string, number> = {};

  private constructor() {
    this.networkManager = NetworkManager.getInstance();
    this.setupNetworkListeners();
    this.setupPositionListener();
    this.setupUserGestureUnlock();
  }

  /**
   * Mengambil instansi tunggal (Singleton)
   */
  public static getInstance(): VoiceManager {
    if (!VoiceManager.instance) {
      VoiceManager.instance = new VoiceManager();
    }
    return VoiceManager.instance;
  }

  /**
   * Buka kunci AudioContext saat ada interaksi pengguna (klik/sentuh)
   */
  private setupUserGestureUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.playbackContext && this.playbackContext.state === 'suspended') {
        this.playbackContext.resume().catch(() => {});
      }
      if (this.recordContext && this.recordContext.state === 'suspended') {
        this.recordContext.resume().catch(() => {});
      }
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  /**
   * Memperbarui koordinat pemain lokal untuk perhitungan jarak proximity
   */
  public updateLocalPosition(x: number, y: number): void {
    this.localX = x;
    this.localY = y;
  }

  /**
   * Mendengarkan update posisi pemain dari Phaser engine
   */
  private setupPositionListener(): void {
    EventBus.on('player-stats-updated', (stats: { x: number; y: number }) => {
      if (typeof stats.x === 'number' && typeof stats.y === 'number') {
        this.updateLocalPosition(stats.x, stats.y);
      }
    });
  }

  /**
   * Mendengarkan paket suara masuk dari server game
   */
  private setupNetworkListeners(): void {
    // 1. Menerima aliran paket audio mentah dari pemain lain
    this.networkManager.onVoiceStream((data) => {
      this.handleIncomingVoice(data);
    });

    // 2. Menerima status visual berbicara pemain lain
    this.networkManager.onVoiceSpeaking((data) => {
      EventBus.emit('player-speaking-status', data);
    });
  }

  /**
   * Inisialisasi AudioContext pemutaran suara
   */
  private initPlaybackContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.playbackContext) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.playbackContext = new AudioCtx({ sampleRate: this.sampleRate, latencyHint: 'interactive' });
      }
    }

    if (this.playbackContext && this.playbackContext.state === 'suspended') {
      this.playbackContext.resume().catch(() => {});
    }

    return this.playbackContext;
  }

  /**
   * Mengaktifkan atau menonaktifkan Mikrofon (Toggle)
   */
  public async toggleMic(): Promise<boolean> {
    if (this.isMicEnabled) {
      this.stopMic();
      return false;
    } else {
      return await this.startMic();
    }
  }

  /**
   * Memulai perekaman mikrofon dan transmisi suara proximity
   */
  public async startMic(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      alert('Browser Anda tidak mendukung akses Mikrofon (getUserMedia).');
      return false;
    }

    try {
      this.initPlaybackContext();

      // Minta izin mikrofon dengan pembatal gema & peredam bising
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        alert('Browser tidak mendukung Web Audio API.');
        return false;
      }

      this.recordContext = new AudioCtx({ sampleRate: this.sampleRate, latencyHint: 'interactive' });
      await this.recordContext.resume();

      const source = this.recordContext.createMediaStreamSource(this.localStream);

      // Gunakan AudioWorklet modern untuk mencegah pesan deprecation di browser
      if (this.recordContext.audioWorklet) {
        try {
          const workletCode = `
            class VoiceInputProcessor extends AudioWorkletProcessor {
              process(inputs) {
                const input = inputs[0];
                if (input && input[0]) {
                  this.port.postMessage(input[0]);
                }
                return true;
              }
            }
            registerProcessor('voice-input-processor', VoiceInputProcessor);
          `;
          const blob = new Blob([workletCode], { type: 'application/javascript' });
          const workletUrl = URL.createObjectURL(blob);
          await this.recordContext.audioWorklet.addModule(workletUrl);
          URL.revokeObjectURL(workletUrl);

          const workletNode = new AudioWorkletNode(this.recordContext, 'voice-input-processor');
          workletNode.port.onmessage = (e) => {
            if (e.data instanceof Float32Array) {
              this.processAudioInput(e.data);
            }
          };

          source.connect(workletNode);
          const dummyGain = this.recordContext.createGain();
          dummyGain.gain.value = 0;
          workletNode.connect(dummyGain);
          dummyGain.connect(this.recordContext.destination);
          this.audioWorkletNode = workletNode;
        } catch (e) {
          this.setupScriptProcessorFallback(source);
        }
      } else {
        this.setupScriptProcessorFallback(source);
      }

      this.isMicEnabled = true;
      EventBus.emit('mic-state-changed', { isEnabled: true });
      return true;
    } catch (err: any) {
      console.warn('[VoiceManager] Gagal mengakses mikrofon:', err);
      alert('Izin mikrofon ditolak atau mikrofon tidak terhubung. Izinkan akses mic di browser.');
      this.isMicEnabled = false;
      EventBus.emit('mic-state-changed', { isEnabled: false });
      return false;
    }
  }

  /**
   * Fallback jika AudioWorklet tidak didukung atau gagal dimuat
   */
  private setupScriptProcessorFallback(source: MediaStreamAudioSourceNode): void {
    if (!this.recordContext) return;
    this.scriptProcessor = this.recordContext.createScriptProcessor(1024, 1, 1);
    this.scriptProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!this.isMicEnabled) return;
      const input = e.inputBuffer.getChannelData(0);
      this.processAudioInput(input);
    };

    source.connect(this.scriptProcessor);
    const dummyGain = this.recordContext.createGain();
    dummyGain.gain.value = 0;
    this.scriptProcessor.connect(dummyGain);
    dummyGain.connect(this.recordContext.destination);
  }

  /**
   * Memproses paket audio input (Float32Array) dengan VAD dan konversi ke Int16 PCM
   */
  private processAudioInput(input: Float32Array): void {
    if (!this.isMicEnabled) return;

    // 1. Hitung intensitas volume RMS (Voice Activity Detection)
    let sumSquares = 0;
    for (let i = 0; i < input.length; i++) {
      sumSquares += input[i] * input[i];
    }
    const rms = Math.sqrt(sumSquares / input.length);

    // Ambang batas berbicara wajar (menghindari mendengus pelan/background noise)
    const isSpeakingNow = rms > 0.015;

    if (isSpeakingNow) {
      if (this.silenceTimeout) {
        window.clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }

      if (!this.isLocalSpeaking) {
        this.isLocalSpeaking = true;
        this.networkManager.sendVoiceSpeaking(true);
        EventBus.emit('local-player-speaking', { isSpeaking: true });
      }

      // 2. Konversi Float32 [-1.0, 1.0] ke Int16 PCM untuk transmisi biner
      const pcm16 = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // 3. Kirim paket suara biner melalui WebSocket
      this.networkManager.sendVoiceChunk(pcm16.buffer, this.localX, this.localY);
    } else {
      if (this.isLocalSpeaking && !this.silenceTimeout) {
        this.silenceTimeout = window.setTimeout(() => {
          this.isLocalSpeaking = false;
          this.silenceTimeout = null;
          this.networkManager.sendVoiceSpeaking(false);
          EventBus.emit('local-player-speaking', { isSpeaking: false });
        }, 350);
      }
    }
  }

  /**
   * Menghentikan perekaman mikrofon
   */
  public stopMic(): void {
    this.isMicEnabled = false;

    if (this.silenceTimeout) {
      window.clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    if (this.audioWorkletNode) {
      try {
        this.audioWorkletNode.disconnect();
      } catch (e) {}
      this.audioWorkletNode = null;
    }

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {}
      this.scriptProcessor = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.recordContext) {
      try {
        this.recordContext.close();
      } catch (e) {}
      this.recordContext = null;
    }

    if (this.isLocalSpeaking) {
      this.isLocalSpeaking = false;
      this.networkManager.sendVoiceSpeaking(false);
      EventBus.emit('local-player-speaking', { isSpeaking: false });
    }

    EventBus.emit('mic-state-changed', { isEnabled: false });
  }

  /**
   * Menangani audio masuk dan memeriksa apakah berada dalam radius Proximity (x -5 s/d 5, y -5 s/d 5 petak)
   */
  private handleIncomingVoice(data: {
    senderId: string;
    senderName: string;
    x: number;
    y: number;
    audio: ArrayBuffer;
  }): void {
    if (!data.audio || data.audio.byteLength === 0) return;

    // 1. Hitung koordinat petak grid pengirim dan penerima
    const senderGridX = Math.floor(data.x / this.tileSize);
    const senderGridY = Math.floor(data.y / this.tileSize);
    const myGridX = Math.floor(this.localX / this.tileSize);
    const myGridY = Math.floor(this.localY / this.tileSize);

    const dx = senderGridX - myGridX;
    const dy = senderGridY - myGridY;

    // 2. Validasi Batas Proximity: X berada di [-5 s/d 5] dan Y berada di [-5 s/d 5] petak
    const inRange = Math.abs(dx) <= this.maxTileRange && Math.abs(dy) <= this.maxTileRange;
    if (!inRange) {
      // Di luar radius 5 petak: abaikan paket suara (tidak terdengar)
      return;
    }

    // 3. Atenuasi volume spasial alami berdasarkan jarak Euclidean
    const tileDist = Math.hypot(dx, dy); // 0 s/d ~7.07 petak
    const maxDist = Math.hypot(this.maxTileRange, this.maxTileRange);
    const volume = Math.max(0.15, Math.min(1.0, 1.0 - (tileDist / maxDist) * 0.82));

    const ctx = this.initPlaybackContext();
    if (!ctx) return;

    try {
      // 4. Konversi Int16 PCM kembali ke Float32
      const int16 = new Int16Array(data.audio);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
      }

      // 5. Buat AudioBuffer dan BufferSource
      const audioBuffer = ctx.createBuffer(1, float32.length, this.sampleRate);
      audioBuffer.getChannelData(0).set(float32);

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;

      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 6. Penjadwalan buffer mulus tanpa jeda/stutter (Jitter Buffer Mulus)
      const now = ctx.currentTime;
      let startTime = this.nextPlaybackTimes[data.senderId] || 0;
      if (startTime < now) {
        startTime = now + 0.015;
      }
      sourceNode.start(startTime);
      this.nextPlaybackTimes[data.senderId] = startTime + audioBuffer.duration;

      // 7. Tampilkan ikon suara pada karakter pengirim
      EventBus.emit('player-speaking-status', {
        senderId: data.senderId,
        senderName: data.senderName,
        isSpeaking: true,
      });

      // Jadwalkan pemadaman ikon suara saat audio pengirim selesai
      if (this.remoteSpeakingTimers[data.senderId]) {
        window.clearTimeout(this.remoteSpeakingTimers[data.senderId]);
      }
      const durationMs = Math.max(700, (startTime - now + audioBuffer.duration) * 1000 + 150);
      this.remoteSpeakingTimers[data.senderId] = window.setTimeout(() => {
        EventBus.emit('player-speaking-status', {
          senderId: data.senderId,
          senderName: data.senderName,
          isSpeaking: false,
        });
        delete this.remoteSpeakingTimers[data.senderId];
      }, durationMs);
    } catch (e) {
      console.warn('[VoiceManager] Gagal memutar audio PCM:', e);
    }
  }

  /** Mengambil status apakah mic aktif */
  public getIsMicEnabled(): boolean {
    return this.isMicEnabled;
  }
}
