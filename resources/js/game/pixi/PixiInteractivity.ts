/**
 * ============================================================================
 * FILE: resources/js/game/pixi/PixiInteractivity.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Modul percontohan integrasi PixiJS (v8) untuk grafis 2D interaktif berkecepatan
 * tinggi di browser (WebGPU/WebGL).
 * 
 * KEGUNAAN PIXIJS:
 * - Efek partikel magis (Magic Aura & Sparkles)
 * - Mini-game 2D terpisah (misalnya kartu, inventory interaktif, atau battle screen)
 * - Render interaktif ultra-responsif dengan performa tinggi
 * ============================================================================
 */

import { Application, Graphics, Text, Container } from 'pixi.js';

export class PixiInteractiveDemo {
  private app: Application | null = null;
  private containerElement: HTMLElement;
  private sparkles: Graphics[] = [];

  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
  }

  /**
   * Inisialisasi Canvas PixiJS
   */
  public async init(): Promise<void> {
    this.app = new Application();
    await this.app.init({
      resizeTo: this.containerElement,
      backgroundAlpha: 0, // Latar belakang transparan agar bisa overlay di atas UI
      antialias: true,
    });

    this.containerElement.appendChild(this.app.canvas);

    // Buat layer partikel
    const particleLayer = new Container();
    this.app.stage.addChild(particleLayer);

    // Buat efek partikel interaktif yang merespons klik / kursor
    for (let i = 0; i < 25; i++) {
      const g = new Graphics();
      g.circle(0, 0, Math.random() * 4 + 2);
      g.fill({ color: 0x38bdf8, alpha: 0.7 });
      g.x = Math.random() * this.app.screen.width;
      g.y = Math.random() * this.app.screen.height;

      particleLayer.addChild(g);
      this.sparkles.push(g);
    }

    // Ticker loop untuk animasi partikel
    this.app.ticker.add((ticker) => {
      this.sparkles.forEach((s) => {
        s.y -= 0.5 * ticker.deltaTime;
        if (this.app && s.y < 0) {
          s.y = this.app.screen.height;
          s.x = Math.random() * this.app.screen.width;
        }
      });
    });
  }

  /**
   * Menghancurkan instansi PixiJS saat ditutup untuk mencegah memory leak
   */
  public destroy(): void {
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
