/**
 * ============================================================================
 * FILE: resources/js/game/core/EventBus.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Jembatan komunikasi Event-Driven (Decoupled Mediator) antara sistem antarmuka
 * React DOM (Lobby, HUD, ChatBox) dan siklus hidup game engine Phaser 3.
 * 
 * DAFTAR EVENT:
 * - 'game-ready': Dipancarkan saat Phaser WorldScene selesai diinisialisasi.
 * - 'join-game': Dipancarkan oleh React LobbyModal untuk memicu spawn pemain.
 * - 'send-chat': Dipancarkan oleh ChatBox untuk mengirim pesan obrolan.
 * - 'new-chat-message': Dipancarkan ke React saat ada pesan obrolan baru masuk.
 * - 'player-stats-updated': Dipancarkan oleh Phaser ke HUD (posisi X, Y, HP).
 * - 'player-count-updated': Dipancarkan ke HUD untuk update jumlah pemain online.
 * ============================================================================
 */

import Phaser from 'phaser';

class ExtendedEventBus extends Phaser.Events.EventEmitter {
  public lastSceneReady: string | null = null;

  public override emit(event: string | symbol, ...args: any[]): boolean {
    if (event === 'scene-ready') {
      this.lastSceneReady = (args[0] as string) || 'ready';
      if (typeof window !== 'undefined') {
        (window as any).__raden_last_scene_ready = this.lastSceneReady;
      }
    } else if (event === 'switch-scene') {
      this.lastSceneReady = null;
      if (typeof window !== 'undefined') {
        (window as any).__raden_last_scene_ready = null;
      }
    }
    return super.emit(event, ...args);
  }
}

/** Instansi EventEmitter murni yang kompatibel 100% dengan browser modern */
export const EventBus = new ExtendedEventBus();
