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

/** Instansi EventEmitter murni yang kompatibel 100% dengan browser modern */
export const EventBus = new Phaser.Events.EventEmitter();
