import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/core/GameConfig';
import { EventBus } from '../game/core/EventBus';

export const GameCanvas: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current && containerRef.current) {
      const config = createGameConfig('game-container');
      gameRef.current = new Phaser.Game(config);
    }

    // Handler terpusat untuk transisi scene di Phaser
    const handleSwitchScene = (data: { scene: string; [key: string]: any }) => {
      if (!gameRef.current || !gameRef.current.scene) return;
      try {
        const targetSceneKey = data.scene;
        const sceneManager = gameRef.current.scene;
        const targetScene = sceneManager.getScene(targetSceneKey);
        if (targetScene) {
          // Hentikan scene-scene yang sedang berjalan agar transisi bersih & tidak ada event zombie
          const activeScenes = sceneManager.getScenes(true);
          activeScenes.forEach((s) => {
            if (s.scene.key !== targetSceneKey) {
              try {
                s.scene.stop();
              } catch (e) {}
            }
          });
          sceneManager.start(targetSceneKey, data);
        } else {
          console.warn(`[GameCanvas] Target scene '${targetSceneKey}' tidak ditemukan.`);
        }
      } catch (err) {
        console.error('[GameCanvas] Error switching scene:', err);
      }
    };

    EventBus.on('switch-scene', handleSwitchScene);

    return () => {
      EventBus.off('switch-scene', handleSwitchScene);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" ref={containerRef} className="absolute inset-0 z-0 bg-slate-950" />;
};
