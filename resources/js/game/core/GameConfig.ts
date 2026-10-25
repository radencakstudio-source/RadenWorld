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
import { SchoolScene } from '../scenes/SchoolScene';
import { CafeScene } from '../scenes/CafeScene';
import { LibraryScene } from '../scenes/LibraryScene';

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
        fps: 60,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      touch: {
        capture: true,
      },
      mouse: {
        preventDefaultWheel: true,
      },
      activePointers: 2,
    },
    disableContextMenu: true,
    render: {
      powerPreference: 'high-performance',
      batchSize: 4096,
    },
    scene: [BootScene, HouseScene, WorldScene, AdminPortalScene, SchoolScene, CafeScene, LibraryScene],
    pixelArt: false,
    roundPixels: true,
    antialias: true,
    antialiasGL: false,
    fps: {
      min: 30,
      target: 60,
      smoothStep: false,
    },
    audio: {
      noAudio: true,
    },
  };
}
