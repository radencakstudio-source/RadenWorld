/**
 * ============================================================================
 * FILE: resources/js/game/controllers/CameraController.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengontrol Kamera Modular (Camera Controller) untuk RadenWorld:
 * 1. Mengatur kamera scene utama (Phaser.Cameras.Scene2D.Camera).
 * 2. Follow target (karakter pemain) dengan opsi lerp dan roundPixels.
 * 3. Mengatur batas pandang dunia (Camera Bounds) sesuai dimensi map/ruangan.
 * 4. Sistem zoom mulus & responsif 60 FPS:
 *    - Mouse Scroll Wheel Zooming.
 *    - Keyboard (+ / - / Numpad).
 *    - EventBus sync ('camera-zoom-in', 'camera-zoom-out', 'camera-zoom-reset', 'camera-zoom-set').
 *    - Interpolasi eksponensial (Phaser.Math.Linear) bebas lag di game loop.
 * 5. Efek Kamera:
 *    - Camera Shake (gempa / landing / benturan).
 *    - Camera Flash / Fade transisi layar.
 *    - Cinematic Pan to Point of Interest (POI).
 * 6. Manajemen Lifecycle & Cleanup otomatis pada scene shutdown/destroy.
 * ============================================================================
 */

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';

export interface ICameraControllerOptions {
  camera?: Phaser.Cameras.Scene2D.Camera;
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomLerpSpeed?: number;
  roundPixels?: boolean;
  enableWheel?: boolean;
  enableKeyboard?: boolean;
  enableEventBus?: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
  target?: Phaser.GameObjects.GameObject;
}

export class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;

  // Nilai Zoom
  private currentTargetZoom: number = 1.0;
  private defaultZoom: number = 1.0;
  private minZoom: number = 0.45;
  private maxZoom: number = 2.0;
  private zoomLerpSpeed: number = 0.12;

  // Status Follow Target
  private followTarget: Phaser.GameObjects.GameObject | null = null;
  private isFollowing: boolean = false;

  // Event Handlers untuk Cleanup
  private onWheelHandler: ((pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => void) | null = null;
  private eventBusHandlers: Map<string, (...args: any[]) => void> = new Map();
  private keyboardHandlers: Map<string, () => void> = new Map();

  constructor(scene: Phaser.Scene, options: ICameraControllerOptions = {}) {
    this.scene = scene;
    this.camera = options.camera || scene.cameras.main;

    this.defaultZoom = options.defaultZoom ?? 1.0;
    this.currentTargetZoom = this.defaultZoom;
    this.minZoom = options.minZoom ?? 0.45;
    this.maxZoom = options.maxZoom ?? 2.0;
    this.zoomLerpSpeed = options.zoomLerpSpeed ?? 0.12;

    this.camera.setZoom(this.defaultZoom);
    this.camera.setRoundPixels(options.roundPixels !== false);

    if (options.bounds) {
      this.setBounds(options.bounds.x, options.bounds.y, options.bounds.width, options.bounds.height);
    }

    if (options.target) {
      this.follow(options.target);
    }

    // Aktifkan kontrol zoom default
    this.setupZoomControls({
      defaultZoom: this.defaultZoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      enableWheel: options.enableWheel !== false,
      enableKeyboard: options.enableKeyboard !== false,
      enableEventBus: options.enableEventBus !== false,
    });

    // Otomatis bersihkan listener saat scene dimatikan atau dihancurkan
    const cleanup = () => this.destroy();
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }

  // ==========================================================================
  // PENGATURAN TARGET & BOUNDS
  // ==========================================================================

  /**
   * Mengunci kamera agar mengikuti target (misal: Player)
   * @param target Objek GameObject yang akan diikuti kamera
   * @param roundPixels Bulatkan koordinat piksel agar sprite tetap tajam kristal
   * @param lerpX Kecepatan interpolasi horizontal (1.0 = instan)
   * @param lerpY Kecepatan interpolasi vertikal (1.0 = instan)
   */
  public follow(
    target: Phaser.GameObjects.GameObject,
    roundPixels: boolean = true,
    lerpX: number = 1.0,
    lerpY: number = 1.0
  ): this {
    if (!this.camera || !target) return this;
    this.followTarget = target;
    this.isFollowing = true;
    this.camera.setRoundPixels(roundPixels);
    this.camera.startFollow(target, roundPixels, lerpX, lerpY);
    return this;
  }

  /**
   * Menghentikan kamera mengikuti target
   */
  public stopFollow(): this {
    if (!this.camera) return this;
    this.camera.stopFollow();
    this.followTarget = null;
    this.isFollowing = false;
    return this;
  }

  /**
   * Mengatur batas area gerak kamera di dunia game (Bounds)
   */
  public setBounds(x: number, y: number, width: number, height: number): this {
    if (!this.camera) return this;
    this.camera.setBounds(x, y, width, height);
    return this;
  }

  /**
   * Memusatkan pandangan kamera secara instan ke koordinat dunia (x, y)
   */
  public centerOn(x: number, y: number): this {
    if (!this.camera) return this;
    this.camera.centerOn(x, y);
    return this;
  }

  // ==========================================================================
  // PENGATURAN KONTROL ZOOM
  // ==========================================================================

  /**
   * Menyiapkan interaksi zoom (Mouse Wheel, Keyboard, & EventBus)
   */
  public setupZoomControls(options: {
    defaultZoom?: number;
    minZoom?: number;
    maxZoom?: number;
    enableWheel?: boolean;
    enableKeyboard?: boolean;
    enableEventBus?: boolean;
  } = {}): this {
    if (typeof options.defaultZoom === 'number') this.defaultZoom = options.defaultZoom;
    if (typeof options.minZoom === 'number') this.minZoom = options.minZoom;
    if (typeof options.maxZoom === 'number') this.maxZoom = options.maxZoom;

    this.currentTargetZoom = this.defaultZoom;
    this.camera.setZoom(this.defaultZoom);

    // 1. Mouse Scroll Wheel Zooming
    if (options.enableWheel !== false && !this.onWheelHandler) {
      this.onWheelHandler = (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
        // Cek jika kursor sedang di atas UI input form
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

        const zoomFactor = deltaY > 0 ? 0.90 : 1.10;
        this.smoothZoomTo(this.currentTargetZoom * zoomFactor);
      };
      this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, this.onWheelHandler);
    }

    // 2. EventBus Listeners (Sync dari Tombol HUD / UI MiniMap)
    if (options.enableEventBus !== false && this.eventBusHandlers.size === 0) {
      const handleZoomIn = () => this.zoomIn();
      const handleZoomOut = () => this.zoomOut();
      const handleZoomReset = () => this.resetZoom();
      const handleZoomSet = (zoom: number) => this.smoothZoomTo(zoom);

      this.eventBusHandlers.set('camera-zoom-in', handleZoomIn);
      this.eventBusHandlers.set('camera-zoom-out', handleZoomOut);
      this.eventBusHandlers.set('camera-zoom-reset', handleZoomReset);
      this.eventBusHandlers.set('camera-zoom-set', handleZoomSet);

      EventBus.on('camera-zoom-in', handleZoomIn);
      EventBus.on('camera-zoom-out', handleZoomOut);
      EventBus.on('camera-zoom-reset', handleZoomReset);
      EventBus.on('camera-zoom-set', handleZoomSet);
    }

    // 3. Tombol Keyboard (+ / - / Numpad)
    if (options.enableKeyboard !== false && this.scene.input.keyboard && this.keyboardHandlers.size === 0) {
      const handlePlus = () => {
        if (this.isTyping()) return;
        this.zoomIn();
      };
      const handleMinus = () => {
        if (this.isTyping()) return;
        this.zoomOut();
      };

      const keysPlus = ['keydown-PLUS', 'keydown-NUMPAD_ADD'];
      const keysMinus = ['keydown-MINUS', 'keydown-NUMPAD_SUBTRACT'];

      keysPlus.forEach((k) => {
        this.keyboardHandlers.set(k, handlePlus);
        this.scene.input.keyboard?.on(k, handlePlus);
      });
      keysMinus.forEach((k) => {
        this.keyboardHandlers.set(k, handleMinus);
        this.scene.input.keyboard?.on(k, handleMinus);
      });
    }

    return this;
  }

  /**
   * Mengatur target zoom secara halus dengan batas minZoom & maxZoom
   */
  public smoothZoomTo(newZoom: number): this {
    this.currentTargetZoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
    return this;
  }

  /**
   * Mengatur nilai zoom (dengan opsi instan tanpa interpolasi)
   */
  public setZoom(zoom: number, immediate: boolean = false): this {
    this.currentTargetZoom = Phaser.Math.Clamp(zoom, this.minZoom, this.maxZoom);
    if (immediate && this.camera) {
      this.camera.setZoom(this.currentTargetZoom);
    }
    return this;
  }

  /** Zoom In memperbesar tampilan sebesar persentase tertentu */
  public zoomIn(factor: number = 1.15): this {
    return this.smoothZoomTo(this.currentTargetZoom * factor);
  }

  /** Zoom Out memperkecil tampilan sebesar persentase tertentu */
  public zoomOut(factor: number = 0.85): this {
    return this.smoothZoomTo(this.currentTargetZoom * factor);
  }

  /** Mengembalikan nilai zoom ke default */
  public resetZoom(): this {
    return this.smoothZoomTo(this.defaultZoom);
  }

  public setDefaultZoom(zoom: number): this {
    this.defaultZoom = zoom;
    return this;
  }

  public setMinZoom(minZoom: number): this {
    this.minZoom = minZoom;
    return this;
  }

  public setMaxZoom(maxZoom: number): this {
    this.maxZoom = maxZoom;
    return this;
  }

  public getZoom(): number {
    return this.camera ? this.camera.zoom : this.currentTargetZoom;
  }

  public getTargetZoom(): number {
    return this.currentTargetZoom;
  }

  // ==========================================================================
  // EFEK-EFEK KAMERA (SHAKE, FLASH, FADE, PAN)
  // ==========================================================================

  /**
   * Mengguncang kamera dengan intensitas tertentu (Camera Shake)
   */
  public shake(durationMs: number = 200, intensity: number = 0.01): this {
    if (this.camera) {
      this.camera.shake(durationMs, intensity);
    }
    return this;
  }

  /**
   * Kilatan cahaya layar (Camera Flash)
   */
  public flash(durationMs: number = 250, r: number = 255, g: number = 255, b: number = 255): this {
    if (this.camera) {
      this.camera.flash(durationMs, r, g, b);
    }
    return this;
  }

  /**
   * Memudarkan layar ke warna hitam / transisi (Camera Fade Out)
   */
  public fade(
    durationMs: number = 400,
    r: number = 0,
    g: number = 0,
    b: number = 0,
    callback?: () => void
  ): this {
    if (this.camera) {
      this.camera.fade(durationMs, r, g, b, false, (_cam: any, progress: number) => {
        if (progress >= 1 && callback) {
          callback();
        }
      });
    }
    return this;
  }

  /**
   * Mengembalikan layar dari pudar ke terang (Camera Fade In)
   */
  public fadeIn(durationMs: number = 400, callback?: () => void): this {
    if (this.camera) {
      this.camera.fadeIn(durationMs, 0, 0, 0, (_cam: any, progress: number) => {
        if (progress >= 1 && callback) {
          callback();
        }
      });
    }
    return this;
  }

  /**
   * Menggeser kamera secara sinematik ke titik tujuan tertentu (Pan To)
   */
  public panTo(
    x: number,
    y: number,
    durationMs: number = 800,
    ease: string = 'Power2',
    callback?: () => void
  ): this {
    if (!this.camera) return this;
    const wasFollowing = this.isFollowing;
    if (wasFollowing) {
      this.camera.stopFollow();
    }

    this.camera.pan(x, y, durationMs, ease, false, (_cam: any, progress: number) => {
      if (progress >= 1) {
        if (wasFollowing && this.followTarget) {
          this.camera.startFollow(this.followTarget, true, 1.0, 1.0);
        }
        if (callback) callback();
      }
    });

    return this;
  }

  // ==========================================================================
  // UPDATE LOOP & LIFECYCLE
  // ==========================================================================

  /**
   * Dijalankan pada game loop scene (60 FPS) untuk menghaluskan pergerakan zoom
   */
  public update(_time: number, delta: number): void {
    if (!this.camera) return;

    // Interpolasi zoom halus eksponensial berbasis delta waktu
    if (Math.abs(this.camera.zoom - this.currentTargetZoom) > 0.001) {
      const step = Math.min(1, Math.max(0.01, delta * this.zoomLerpSpeed * 0.15));
      this.camera.setZoom(Phaser.Math.Linear(this.camera.zoom, this.currentTargetZoom, step));
    }
  }

  /**
   * Cek apakah pemain sedang mengetik di input box chat / form
   */
  private isTyping(): boolean {
    const active = document.activeElement;
    return active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';
  }

  /**
   * Membersihkan seluruh event listener untuk mencegah memory leak
   */
  public destroy(): void {
    // 1. Mouse wheel
    if (this.onWheelHandler && this.scene?.input) {
      this.scene.input.off(Phaser.Input.Events.POINTER_WHEEL, this.onWheelHandler);
      this.onWheelHandler = null;
    }

    // 2. EventBus listeners
    this.eventBusHandlers.forEach((handler, evt) => {
      EventBus.off(evt, handler);
    });
    this.eventBusHandlers.clear();

    // 3. Keyboard listeners
    if (this.scene?.input?.keyboard) {
      this.keyboardHandlers.forEach((handler, keyEvent) => {
        this.scene.input.keyboard?.off(keyEvent, handler);
      });
      this.keyboardHandlers.clear();
    }

    this.followTarget = null;
    this.isFollowing = false;
  }
}
