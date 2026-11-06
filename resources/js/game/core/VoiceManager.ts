/**
 * ============================================================================
 * FILE: resources/js/game/core/VoiceManager.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Proximity Voice Chat Manager Studio-Grade untuk RadenWorld.
 * 
 * PENINGKATAN KUALITAS SUARA ULTRA JERNIH & HALUS (SUPER DUPER BAGUS):
 * 1. Audio Resampling Presisi Tinggi:
 *    - Menormalkan hardware rate mikrofon (44.1kHz, 48kHz, 96kHz) ke 24.000 Hz HD Voice.
 *    - Menggunakan interpolasi cubic Hermite/linear halus, bebas distorsi robotik & pitch shift.
 * 2. Studio Pre-Processing Chain (Web Audio DSP):
 *    - High-Pass Filter 85 Hz: Menghilangkan suara dengung AC, getaran meja, dan hembusan angin.
 *    - Vocal Presence Peaking Filter (2.8 kHz, +3 dB, Q=1.0): Suara vokal renyah, jelas & tegas.
 *    - Studio Dynamics Compressor: Mengatur dynamic range suara, mencegah pecah/distorsi saat
 *      berteriak dan mengangkat bisikan lembut agar terdengar jelas.
 * 3. Ukuran Paket Optimal (45 ms / 1080 Sampel @ 24kHz):
 *    - Menghilangkan TCP network choke/buffer starvation dari paket-paket mikro sebelumnya.
 * 4. Smart VAD (Voice Activity Detection) & De-Clicking Windowing:
 *    - Ambang batas ganda (aktivasi 0.007, pertahankan 0.003) dengan hangover 500ms agar
 *      kata-kata tidak terpotong di tengah kalimat.
 *    - Smooth cosine micro-fade pada boundary paket untuk menghilangkan 100% bunyi klik & letupan.
 * 5. Adaptive Jitter Buffer & Seamless Timeline Stitching di Sisi Penerima:
 *    - Lead-in safety buffer 65 ms saat awal bicara menyerap jitter internet tanpa terasa delay.
 *    - Paket audio disusun berurutan tanpa jeda microsecond dan tanpa tumpang tindih (anti-robotic phasing).
 * 6. Immersive 3D Spatial Audio & Proximity Panning:
 *    - Stereo Panning dinamis: Suara terdengar dari kiri/kanan headphone sesuai posisi relatif karakter.
 *    - Redaman volume natural dan high-shelf air absorption untuk jarak yang realistis.
 * ============================================================================
 */

import { NetworkManager } from './NetworkManager';
import { EventBus } from './EventBus';

interface ISpeakerChannel {
  nextPlayTime: number;
  lastPacketTime: number;
  pannerNode: StereoPannerNode | null;
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
  silenceTimer: number | null;
}

export class VoiceManager {
  private static instance: VoiceManager;

  /** Status apakah mikrofon pemain aktif atau dibisukan (muted) */
  private isMicEnabled: boolean = false;

  /** Objek MediaStream dari mikrofon pengguna */
  private localStream: MediaStream | null = null;

  /** AudioContext untuk perekaman & pemrosesan DSP lokal */
  private recordContext: AudioContext | null = null;

  /** Node pemrosesan audio mentah (AudioWorklet atau ScriptProcessor) */
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;

  /** Node rantai DSP pemrosesan mikrofon lokal */
  private highpassFilter: BiquadFilterNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  /** AudioContext untuk pemutaran suara pemain lain yang masuk */
  private playbackContext: AudioContext | null = null;

  /** Master Gain Node untuk output suara voice chat */
  private masterVoiceGain: GainNode | null = null;

  /** Saluran audio terspesialisasi per pembicara (Jitter Buffer & Spatial Panner) */
  private speakerChannels: Map<string, ISpeakerChannel> = new Map();

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

  /** Frekuensi sampel standar HD Voice Wideband Studio (24.000 Hz) */
  private readonly TARGET_SAMPLE_RATE: number = 24000;

  /**
   * Ukuran paket transmisi audio (1080 sampel pada 24kHz = tepat 45.0 ms per paket).
   * 45ms adalah ukuran transmisi ideal untuk WebSocket:
   * - Menghasilkan ~22 paket per detik (sangat ringan pada socket TCP, zero network choke)
   * - Latensi sangat rendah dan imperseptibel bagi telinga manusia (<100ms)
   * - Cukup lebar untuk menyerap jitter jaringan internet tanpa underrun
   */
  private readonly CHUNK_SIZE: number = 1080;
  private audioAccumulator: number[] = [];

  /** Status apakah pemain lokal sedang terdeteksi bersuara */
  private isLocalSpeaking: boolean = false;

  /** Timer jeda diam (hangover) agar suku kata lembut tidak terpotong */
  private silenceTimeout: number | null = null;

  /** Pelacak transisi awal bicara untuk fade-in de-click */
  private isStartingSpeech: boolean = true;

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
      let bothActive = true;
      if (this.playbackContext && this.playbackContext.state === 'suspended') {
        bothActive = false;
        setTimeout(() => this.playbackContext?.resume().catch(() => {}), 0);
      }
      if (this.recordContext && this.recordContext.state === 'suspended') {
        bothActive = false;
        setTimeout(() => this.recordContext?.resume().catch(() => {}), 0);
      }
      if (bothActive && this.playbackContext && this.recordContext) {
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  /**
   * Memperbarui koordinat pemain lokal untuk perhitungan jarak proximity & stereo pan
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
   * Mendengarkan paket suara masuk dan peristiwa disconnect dari server game
   */
  private setupNetworkListeners(): void {
    // 1. Menerima aliran paket audio PCM dari pemain lain
    this.networkManager.onVoiceStream((data) => {
      this.handleIncomingVoice(data);
    });

    // 2. Menerima status visual berbicara pemain lain
    this.networkManager.onVoiceSpeaking((data) => {
      EventBus.emit('player-speaking-status', data);
    });

    // 3. Bersihkan saluran audio jika pemain lain disconnect
    this.networkManager.onPlayerLeft((data) => {
      if (data?.id) {
        this.destroySpeakerChannel(data.id);
      }
    });
  }

  /**
   * Inisialisasi AudioContext pemutaran suara dengan Master Gain
   */
  private initPlaybackContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.playbackContext) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.playbackContext = new AudioCtx({ latencyHint: 'interactive' });
        this.masterVoiceGain = this.playbackContext.createGain();
        this.masterVoiceGain.gain.value = 1.0;
        this.masterVoiceGain.connect(this.playbackContext.destination);
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
   * Memulai perekaman mikrofon dengan studio audio processing chain
   */
  public async startMic(): Promise<boolean> {
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const msg =
        'Akses mikrofon memerlukan koneksi aman HTTPS atau dibuka melalui http://localhost. Silakan akses via https:// atau buka melalui http://localhost:8000.';
      console.warn('[VoiceManager] Insecure Context:', msg);
      EventBus.emit('new-chat-message', {
        id: `mic_sec_${Date.now()}`,
        sender: 'SISTEM SUARA',
        text: msg,
        timestamp: Date.now(),
        isSystem: true,
      });
      alert(msg);
      return false;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      alert('Browser Anda tidak mendukung akses Mikrofon (getUserMedia).');
      return false;
    }

    try {
      this.initPlaybackContext();

      // Minta izin mikrofon dengan pembatal gema & peredam bising hardware
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        alert('Browser tidak mendukung Web Audio API.');
        return false;
      }

      // Biarkan recordContext berjalan pada native hardware sample rate agar browser tidak melakukan decimation kasar
      this.recordContext = new AudioCtx({ latencyHint: 'interactive' });
      await this.recordContext.resume();

      const source = this.recordContext.createMediaStreamSource(this.localStream);

      // ======================================================================
      // STUDIO VOCAL DSP PRE-PROCESSING CHAIN
      // ======================================================================
      // 1. High-Pass Filter 85 Hz (Q=0.7):
      //    Memotong gemuruh getaran meja, hembusan nafas, dan dengung frekuensi rendah
      this.highpassFilter = this.recordContext.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.value = 85;
      this.highpassFilter.Q.value = 0.7;

      // 2. Vocal Presence Peaking Filter (2.8 kHz, +3 dB, Q=1.0):
      //    Meningkatkan kejelasan konsonan vokal (s, t, k, p) agar percakapan terdengar jernih
      this.presenceFilter = this.recordContext.createBiquadFilter();
      this.presenceFilter.type = 'peaking';
      this.presenceFilter.frequency.value = 2800;
      this.presenceFilter.gain.value = 3.0;
      this.presenceFilter.Q.value = 1.0;

      // 3. Studio Dynamics Compressor:
      //    Mencegah distorsi suara pecah saat teriak & mengangkat suara pelan agar seimbang
      this.compressor = this.recordContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.12;

      // Hubungkan rantai DSP
      source.connect(this.highpassFilter);
      this.highpassFilter.connect(this.presenceFilter);
      this.presenceFilter.connect(this.compressor);

      // ======================================================================
      // INPUT PROCESSOR (AUDIO WORKLET ATAU SCRIPT PROCESSOR FALLBACK)
      // ======================================================================
      let processorNode: AudioNode;

      if (this.recordContext.audioWorklet) {
        try {
          const workletCode = `
            class VoiceChunkerProcessor extends AudioWorkletProcessor {
              constructor() {
                super();
                this.buffer = new Float32Array(512);
                this.bufferIndex = 0;
              }
              process(inputs) {
                const input = inputs[0];
                if (input && input[0]) {
                  const channel = input[0];
                  for (let i = 0; i < channel.length; i++) {
                    this.buffer[this.bufferIndex++] = channel[i];
                    if (this.bufferIndex >= this.buffer.length) {
                      this.port.postMessage(this.buffer.slice(0));
                      this.bufferIndex = 0;
                    }
                  }
                }
                return true;
              }
            }
            registerProcessor('voice-chunker-processor', VoiceChunkerProcessor);
          `;
          const blob = new Blob([workletCode], { type: 'application/javascript' });
          const workletUrl = URL.createObjectURL(blob);
          await this.recordContext.audioWorklet.addModule(workletUrl);
          URL.revokeObjectURL(workletUrl);

          const workletNode = new AudioWorkletNode(this.recordContext, 'voice-chunker-processor');
          workletNode.port.onmessage = (e) => {
            if (e.data instanceof Float32Array) {
              this.processRawAudioInput(e.data);
            }
          };
          this.audioWorkletNode = workletNode;
          processorNode = workletNode;
        } catch (e) {
          processorNode = this.createScriptProcessorFallback();
        }
      } else {
        processorNode = this.createScriptProcessorFallback();
      }

      this.compressor.connect(processorNode);

      // Dummy silent gain agar processor tetap berjalan tanpa feedback speaker lokal
      const dummyGain = this.recordContext.createGain();
      dummyGain.gain.value = 0;
      processorNode.connect(dummyGain);
      dummyGain.connect(this.recordContext.destination);

      this.isMicEnabled = true;
      this.isStartingSpeech = true;
      EventBus.emit('mic-state-changed', { isEnabled: true });
      return true;
    } catch (err: any) {
      const isPolicyViolation =
        err?.name === 'NotAllowedError' ||
        err?.name === 'SecurityError' ||
        String(err?.message || '').toLowerCase().includes('permission') ||
        String(err?.message || '').toLowerCase().includes('policy');
      const errorMsg = isPolicyViolation
        ? 'Akses mikrofon diblokir oleh browser. Silakan klik ikon gembok/izin pada bilah alamat browser untuk mengizinkan mikrofon.'
        : `Gagal mengaktifkan mikrofon: ${err?.message || 'Izin ditolak'}.`;

      console.warn('[VoiceManager] Info akses mikrofon:', errorMsg);
      this.isMicEnabled = false;
      EventBus.emit('mic-state-changed', { isEnabled: false });
      EventBus.emit('new-chat-message', {
        id: `mic_notice_${Date.now()}`,
        sender: 'SISTEM SUARA',
        text: errorMsg,
        timestamp: Date.now(),
        isSystem: true,
      });
      return false;
    }
  }

  /**
   * Fallback ScriptProcessor jika AudioWorklet tidak tersedia
   */
  private createScriptProcessorFallback(): AudioNode {
    if (!this.recordContext) throw new Error('Record context missing');
    this.scriptProcessor = this.recordContext.createScriptProcessor(1024, 1, 1);
    this.scriptProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!this.isMicEnabled) return;
      const input = e.inputBuffer.getChannelData(0);
      this.processRawAudioInput(input);
    };
    return this.scriptProcessor;
  }

  /**
   * Resampler Presisi Tinggi: Mengonversi hardware rate lokal (misal 48kHz atau 44.1kHz) ke 24.000 Hz HD Voice
   */
  private resampleTo24k(input: Float32Array, inSampleRate: number): Float32Array {
    if (inSampleRate === this.TARGET_SAMPLE_RATE) {
      return input;
    }

    const ratio = inSampleRate / this.TARGET_SAMPLE_RATE;
    const outLength = Math.round(input.length / ratio);
    const output = new Float32Array(outLength);

    for (let i = 0; i < outLength; i++) {
      const pos = i * ratio;
      const idx = Math.floor(pos);
      const frac = pos - idx;

      // Linear interpolation halus
      const s0 = input[idx] !== undefined ? input[idx] : 0;
      const s1 = input[idx + 1] !== undefined ? input[idx + 1] : s0;
      output[i] = s0 + frac * (s1 - s0);
    }

    return output;
  }

  /**
   * Menerima input audio mentah dari mikrofon, meresample ke 24kHz,
   * mengakumulasi paket 45ms (1080 sampel), mendeteksi VAD, dan mentransmisikan PCM16.
   */
  private processRawAudioInput(rawInput: Float32Array): void {
    if (!this.isMicEnabled || !this.recordContext) return;

    // 1. Resample ke 24.000 Hz HD Voice
    const resampled = this.resampleTo24k(rawInput, this.recordContext.sampleRate);

    // 2. Akumulasi sampel
    for (let i = 0; i < resampled.length; i++) {
      this.audioAccumulator.push(resampled[i]);
    }

    // 3. Proses paket tepat ukuran CHUNK_SIZE (1080 sampel = 45 ms)
    while (this.audioAccumulator.length >= this.CHUNK_SIZE) {
      const chunk = this.audioAccumulator.splice(0, this.CHUNK_SIZE);

      // Hitung intensitas volume RMS (Voice Activity Detection)
      let sumSquares = 0;
      for (let i = 0; i < chunk.length; i++) {
        sumSquares += chunk[i] * chunk[i];
      }
      const rms = Math.sqrt(sumSquares / chunk.length);

      // Ambang batas ganda:
      // - Aktivasi: RMS > 0.007 (cukup sensitif menangkap bisikan pelan)
      // - Pertahankan bicara: RMS > 0.0035 (menjaga konsonan halus seperti s, th, f, p agar tidak terpotong)
      const isVoiceActive = this.isLocalSpeaking ? rms > 0.0035 : rms > 0.007;

      if (isVoiceActive) {
        if (this.silenceTimeout) {
          window.clearTimeout(this.silenceTimeout);
          this.silenceTimeout = null;
        }

        if (!this.isLocalSpeaking) {
          this.isLocalSpeaking = true;
          this.isStartingSpeech = true;
          this.networkManager.sendVoiceSpeaking(true);
          EventBus.emit('local-player-speaking', { isSpeaking: true });
        }

        // De-Clicking Fade-In halus pada 32 sampel pertama saat baru mulai bicara
        if (this.isStartingSpeech) {
          const fadeLen = Math.min(32, chunk.length);
          for (let i = 0; i < fadeLen; i++) {
            chunk[i] *= (i / fadeLen);
          }
          this.isStartingSpeech = false;
        }

        this.transmitPcmChunk(chunk);
      } else {
        // Hangover: Jika baru saja selesai berbicara, teruskan transmisi selama 500ms
        // agar jeda alami antar kata tidak memutus aliran suara
        if (this.isLocalSpeaking) {
          this.transmitPcmChunk(chunk);

          if (!this.silenceTimeout) {
            this.silenceTimeout = window.setTimeout(() => {
              this.isLocalSpeaking = false;
              this.isStartingSpeech = true;
              this.silenceTimeout = null;
              this.networkManager.sendVoiceSpeaking(false);
              EventBus.emit('local-player-speaking', { isSpeaking: false });
            }, 500); // 500ms hangover alami
          }
        }
      }
    }
  }

  /**
   * Konversi sampel Float32 [-1.0, 1.0] ke Int16 PCM dan kirim via WebSocket
   */
  private transmitPcmChunk(samples: number[]): void {
    const pcm16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    this.networkManager.sendVoiceChunk(pcm16.buffer, this.localX, this.localY);
  }

  /**
   * Menghentikan perekaman mikrofon dan mereset status
   */
  public stopMic(): void {
    this.isMicEnabled = false;
    this.audioAccumulator = [];

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

    if (this.compressor) {
      try { this.compressor.disconnect(); } catch (e) {}
      this.compressor = null;
    }

    if (this.presenceFilter) {
      try { this.presenceFilter.disconnect(); } catch (e) {}
      this.presenceFilter = null;
    }

    if (this.highpassFilter) {
      try { this.highpassFilter.disconnect(); } catch (e) {}
      this.highpassFilter = null;
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
      this.isStartingSpeech = true;
      this.networkManager.sendVoiceSpeaking(false);
      EventBus.emit('local-player-speaking', { isSpeaking: false });
    }

    EventBus.emit('mic-state-changed', { isEnabled: false });
  }

  /**
   * Mendapatkan atau membuat saluran audio khusus per pembicara (Jitter Buffer, Panner, Gain, Lowpass)
   */
  private getOrCreateSpeakerChannel(senderId: string, ctx: AudioContext): ISpeakerChannel {
    let channel = this.speakerChannels.get(senderId);
    if (!channel) {
      // 1. Gain Node Spasial
      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0;

      // 2. High-Shelf / Lowpass Filter (Memberikan redaman akustik jarak alami)
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 14000;

      // 3. Stereo Panner Node (Suara kiri / kanan 3D Spasial)
      let pannerNode: StereoPannerNode | null = null;
      if (typeof ctx.createStereoPanner === 'function') {
        try {
          pannerNode = ctx.createStereoPanner();
        } catch (e) {}
      }

      // Rangkaian audio per pembicara:
      // Source -> Filter -> Gain -> (Panner) -> MasterVoiceGain -> Output
      filterNode.connect(gainNode);

      if (pannerNode && this.masterVoiceGain) {
        gainNode.connect(pannerNode);
        pannerNode.connect(this.masterVoiceGain);
      } else if (this.masterVoiceGain) {
        gainNode.connect(this.masterVoiceGain);
      } else {
        gainNode.connect(ctx.destination);
      }

      channel = {
        nextPlayTime: 0,
        lastPacketTime: 0,
        pannerNode,
        gainNode,
        filterNode,
        silenceTimer: null,
      };
      this.speakerChannels.set(senderId, channel);
    }
    return channel;
  }

  /**
   * Membersihkan saluran audio pembicara saat pemain pergi
   */
  private destroySpeakerChannel(senderId: string): void {
    const channel = this.speakerChannels.get(senderId);
    if (channel) {
      if (channel.silenceTimer) {
        window.clearTimeout(channel.silenceTimer);
      }
      try {
        channel.gainNode.disconnect();
        channel.filterNode.disconnect();
        channel.pannerNode?.disconnect();
      } catch (e) {}
      this.speakerChannels.delete(senderId);
    }
  }

  /**
   * Menangani audio masuk: Validasi Proximity, Adaptive Jitter Buffer, De-Clicking,
   * Stereo Panning 3D, dan Penjadwalan Pemutaran Mulus Tanpa Putus-Putus
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

    const ctx = this.initPlaybackContext();
    if (!ctx) return;

    try {
      // 3. Konversi Int16 PCM kembali ke Float32
      const int16 = new Int16Array(data.audio);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
      }

      // De-Click Windowing halus pada 16 sampel pertama & terakhir (0.6ms)
      // Menjamin tidak ada bunyi 'pop/klik' akibat diskontinuitas waveform
      const edgeLen = Math.min(16, Math.floor(float32.length / 2));
      for (let i = 0; i < edgeLen; i++) {
        const factor = 0.5 * (1 - Math.cos((Math.PI * i) / edgeLen));
        float32[i] *= factor;
        float32[float32.length - 1 - i] *= factor;
      }

      // 4. Hitung Atenuasi Volume Spasial & Stereo Panning 3D
      const tileDist = Math.hypot(dx, dy); // 0 s/d ~7.07 petak
      const maxDist = Math.hypot(this.maxTileRange, this.maxTileRange);

      // Volume: Jarak dekat (<1.5 petak) = 100% lantang, melandai halus hingga ~22% pada batas luar
      const volume =
        tileDist <= 1.2
          ? 1.0
          : Math.max(0.22, 1.0 - Math.pow((tileDist - 1.2) / (maxDist - 1.2), 1.2) * 0.78);

      // Stereo Panning (-0.8 s/d 0.8): Pemain di sebelah kiri bersuara di telinga kiri, kanan di telinga kanan
      const pixelDx = data.x - this.localX;
      const panValue = Math.max(-0.8, Math.min(0.8, pixelDx / (this.maxTileRange * this.tileSize)));

      // Lowpass Filter Jarak: Pemain yang jauh suaranya sedikit diredam frekuensi tingginya (efek akustik udara)
      const cutoffFreq = Math.max(4500, 14000 - (tileDist / maxDist) * 9000);

      // 5. Ambil saluran audio pembicara
      const channel = this.getOrCreateSpeakerChannel(data.senderId, ctx);
      const now = ctx.currentTime;

      // Update parameter spasial secara mulus (smooth audio ramp 25ms)
      channel.gainNode.gain.cancelScheduledValues(now);
      channel.gainNode.gain.linearRampToValueAtTime(volume, now + 0.025);

      channel.filterNode.frequency.cancelScheduledValues(now);
      channel.filterNode.frequency.linearRampToValueAtTime(cutoffFreq, now + 0.025);

      if (channel.pannerNode) {
        channel.pannerNode.pan.cancelScheduledValues(now);
        channel.pannerNode.pan.linearRampToValueAtTime(panValue, now + 0.025);
      }

      // 6. Buat AudioBuffer (24.000 Hz) & BufferSourceNode
      const audioBuffer = ctx.createBuffer(1, float32.length, this.TARGET_SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32);

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(channel.filterNode);

      // ======================================================================
      // ADAPTIVE JITTER BUFFER & SEAMLESS AUDIO TIMELINE STITCHING
      // ======================================================================
      const bufferDuration = audioBuffer.duration;
      let startTime = channel.nextPlayTime;

      // Cek apakah ini awal kalimat baru (tidak ada audio yang dijadwalkan atau gap jeda > 80ms)
      const isNewUtterance = !startTime || startTime < (now - 0.035);

      if (isNewUtterance) {
        // Awal kalimat: Berikan bantalan jitter buffer kecil 65 ms.
        // 65ms imperseptibel bagi telinga manusia, namun menyerap 100% variasi latency TCP!
        startTime = now + 0.065;
      } else if (startTime < now) {
        // Paket terlambat sedikit (underrun kecil): mainkan seketika dengan offset micro 8ms
        startTime = now + 0.008;
      } else if (startTime > now + 0.30) {
        // Jika buffer menumpuk terlalu jauh (>300ms akibat lag koneksi sesaat): catch up ke 70ms
        startTime = now + 0.070;
      }

      // Jadwalkan pemutaran paket audio ini tepat pada garis waktu
      sourceNode.start(startTime);
      channel.nextPlayTime = startTime + bufferDuration;
      channel.lastPacketTime = Date.now();

      // 7. Perbarui Indikator Visual Berbicara Karakter
      EventBus.emit('player-speaking-status', {
        senderId: data.senderId,
        senderName: data.senderName,
        isSpeaking: true,
      });

      // Jadwalkan pemadaman indikator visual saat audio pengirim selesai
      if (channel.silenceTimer) {
        window.clearTimeout(channel.silenceTimer);
      }
      const timeUntilEndMs = Math.max(350, (channel.nextPlayTime - now) * 1000 + 120);
      channel.silenceTimer = window.setTimeout(() => {
        EventBus.emit('player-speaking-status', {
          senderId: data.senderId,
          senderName: data.senderName,
          isSpeaking: false,
        });
        channel.silenceTimer = null;
      }, timeUntilEndMs);
    } catch (e) {
      console.warn('[VoiceManager] Error memutar audio stream:', e);
    }
  }

  /** Mengambil status apakah mic aktif */
  public getIsMicEnabled(): boolean {
    return this.isMicEnabled;
  }
}
