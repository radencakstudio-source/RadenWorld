/**
 * ============================================================================
 * FILE: resources/js/game/core/GameConfig.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pabrik konfigurasi (Configuration Factory) untuk instansiasi Phaser 3 Game.
 * Mendaftarkan BootScene, HouseScene (Rumah Pribadi), dan WorldScene (Open World).
 * ============================================================================
 */

import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { HouseScene } from '../scenes/HouseScene';
import { WorldScene } from '../scenes/WorldScene';
import { AdminPortalScene } from '../scenes/AdminPortalScene';

export function createGameConfig(parentContainerId: string = 'game-container'): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: parentContainerId,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#0b0f19',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, HouseScene, WorldScene, AdminPortalScene],
    pixelArt: false,
    roundPixels: true,
  };
}
