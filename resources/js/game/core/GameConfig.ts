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
import { SchoolScene } from '../scenes/SchoolScene';
import { CafeScene } from '../scenes/CafeScene';
import { LibraryScene } from '../scenes/LibraryScene';

export function createGameConfig(parentContainerId: string = 'game-container'): Phaser.Types.Core.GameConfig {
  // Batasi DPR ke maksimal 1.25 agar rendering WebGL super ringan, 60 FPS stabil & tidak membebani GPU/CPU 4K
  const dpr = typeof window !== 'undefined' ? Math.min(1.25, Math.max(1, window.devicePixelRatio || 1)) : 1;
  let enableAA = true;
  try {
    const s = JSON.parse(localStorage.getItem('raden_game_settings') || '{}');
    if (s.enableAntiAliasing === false) enableAA = false;
  } catch (e) {}

  return {
    type: Phaser.AUTO,
    parent: parentContainerId,
    width: window.innerWidth,
    height: window.innerHeight,
    ...(dpr > 1 ? ({ resolution: dpr } as any) : {}),
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
        capture: false,
      },
      mouse: {
        preventDefaultWheel: false,
      },
      activePointers: 4,
    },
    disableContextMenu: true,
    render: {
      powerPreference: 'high-performance',
      batchSize: 4096,
      antialias: enableAA,
      antialiasGL: enableAA,
      roundPixels: !enableAA,
    },
    scene: [BootScene, HouseScene, WorldScene, SchoolScene, CafeScene, LibraryScene],
    pixelArt: !enableAA,
    roundPixels: !enableAA,
    antialias: enableAA,
    antialiasGL: enableAA,
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
