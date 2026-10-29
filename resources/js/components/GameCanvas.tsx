import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/core/GameConfig';
import { EventBus } from '../game/core/EventBus';
import { NetworkManager } from '../game/core/NetworkManager';

export const GameCanvas: React.FC = React.memo(() => {
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
          // Hentikan SEMUA scene yang sedang berjalan (termasuk jika targetScene sedang aktif)
          // agar scene di-restart secara bersih dan EventBus 'scene-ready' selalu terpancar
          const activeScenes = sceneManager.getScenes(true);
          activeScenes.forEach((s) => {
            try {
              s.scene.stop();
            } catch (e) {}
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

    // Handler update nama karakter secara dinamis di Phaser & multiplayer
    const handleUpdatePlayerName = (newName: string) => {
      try {
        NetworkManager.getInstance().sendPlayerUpdate({ name: newName });
      } catch (e) {}

      if (!gameRef.current || !gameRef.current.scene) return;
      try {
        const activeScenes = gameRef.current.scene.getScenes(true);
        activeScenes.forEach((s: any) => {
          if (s.player && typeof s.player.setName === 'function') {
            s.player.setName(newName);
          }
          if ('playerName' in s) {
            s.playerName = newName;
          }
          if ('pendingPlayerName' in s) {
            s.pendingPlayerName = newName;
          }
        });
      } catch (err) {
        console.error('[GameCanvas] Error updating player name:', err);
      }
    };

    EventBus.on('update-player-name', handleUpdatePlayerName);

    // ========================================================================
    // MOBILE 2-FINGER PINCH TO ZOOM (CIUT & PERBESAR 2 JARI KHUSUS MOBILE)
    // ========================================================================
    let initialPinchDistance = 0;
    let initialZoom = 1.0;
    let pinchCooldownTimer: any = null;

    const containerEl = containerRef.current;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        if (pinchCooldownTimer) clearTimeout(pinchCooldownTimer);
        (window as any).__radenPinching = true;
        (window as any).__radenLastPinchTime = Date.now();

        // Batalkan gerakan tap-movement yang mungkin sempat terpancing oleh jari pertama
        EventBus.emit('cancel-player-navigation');

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        const activeScene = gameRef.current?.scene?.getScenes(true)?.[0] as any;
        initialZoom = activeScene?.cameras?.main?.zoom || 1.0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        // Mencegah browser mobile zoom halaman
        e.preventDefault();
        (window as any).__radenPinching = true;
        (window as any).__radenLastPinchTime = Date.now();
        EventBus.emit('cancel-player-navigation');

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        if (initialPinchDistance > 10) {
          const ratio = currentDistance / initialPinchDistance;
          // Zoom halus dibatasi antara 0.45x (ciut luas) s/d 2.2x (perbesar dekat)
          const targetZoom = Math.min(2.2, Math.max(0.45, initialZoom * ratio));
          EventBus.emit('camera-zoom-set', targetZoom);

          const activeScenes = gameRef.current?.scene?.getScenes(true) || [];
          activeScenes.forEach((s: any) => {
            if (s.cameras?.main) {
              s.cameras.main.setZoom(targetZoom);
            }
          });
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        (window as any).__radenLastPinchTime = Date.now();
        if (pinchCooldownTimer) clearTimeout(pinchCooldownTimer);
        pinchCooldownTimer = setTimeout(() => {
          (window as any).__radenPinching = false;
        }, 400);
      }
    };

    if (containerEl) {
      containerEl.addEventListener('touchstart', onTouchStart, { passive: false });
      containerEl.addEventListener('touchmove', onTouchMove, { passive: false });
      containerEl.addEventListener('touchend', onTouchEnd, { passive: true });
      containerEl.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }

    return () => {
      EventBus.off('switch-scene', handleSwitchScene);
      EventBus.off('update-player-name', handleUpdatePlayerName);
      if (containerEl) {
        containerEl.removeEventListener('touchstart', onTouchStart);
        containerEl.removeEventListener('touchmove', onTouchMove);
        containerEl.removeEventListener('touchend', onTouchEnd);
        containerEl.removeEventListener('touchcancel', onTouchEnd);
      }
      if (pinchCooldownTimer) clearTimeout(pinchCooldownTimer);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" ref={containerRef} className="absolute inset-0 z-0 bg-slate-950" />;
});
GameCanvas.displayName = 'GameCanvas';
