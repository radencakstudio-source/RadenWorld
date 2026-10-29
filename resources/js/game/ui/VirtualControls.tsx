/**
 * ============================================================================
 * FILE: resources/js/game/ui/VirtualControls.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kontrol Virtual Analog (Touch Joystick 360°) dan Tombol Interaksi [AKSI, LOMPAT, MANCING]
 * khusus Perangkat Layar Sentuh Mobile (HP/Tablet).
 * 
 * FITUR KUSTOMISASI LANGSUNG DI LAYAR (IN-PLACE HUD CUSTOMIZER):
 * 1. GESER DENGAN JARI (TOUCH & DRAG ANYWHERE):
 *    - Pemain dapat langsung menyeret joystick analog & setiap tombol aksi ke mana saja di layar.
 * 2. SELECT & RESIZE (BESAR / KECIL LANGSUNG):
 *    - Ketuk tombol mana saja untuk memilihnya, lalu perbesar (+) atau perkecil (-)
 *      menggunakan palet pengatur ukuran langsung di atas tombol atau di bilah alat bawah!
 * 3. ANTI-LEAK & PERFORMA 60-120 FPS:
 *    - Touch event terisolasi saat bermain biasa, hardware-accelerated transform 3D.
 * ============================================================================
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Zap, ArrowUp, Fish, Move, Check, RotateCcw, Plus, Minus, Sliders } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';

export interface IVirtualControlsLayout {
  analogScale: number;    // default 1.0 (range: 0.6 - 1.8)
  analogOffsetX: number;  // default 0
  analogOffsetY: number;  // default 0
  actionScale: number;    // default 1.0 (range: 0.6 - 1.8)
  actionOffsetX: number;  // default 0
  actionOffsetY: number;  // default 0
  jumpScale: number;      // default 1.0 (range: 0.6 - 1.8)
  jumpOffsetX?: number;   // default 0
  jumpOffsetY?: number;   // default 0
  fishScale: number;      // default 1.0 (range: 0.6 - 1.8)
  fishOffsetX?: number;   // default 0
  fishOffsetY?: number;   // default 0
}

export const DEFAULT_CONTROLS_LAYOUT: IVirtualControlsLayout = {
  analogScale: 1.0,
  analogOffsetX: 0,
  analogOffsetY: 0,
  actionScale: 1.0,
  actionOffsetX: 0,
  actionOffsetY: 0,
  jumpScale: 1.0,
  jumpOffsetX: 0,
  jumpOffsetY: 0,
  fishScale: 1.0,
  fishOffsetX: 0,
  fishOffsetY: 0,
};

interface VirtualControlsProps {
  onActionPress: () => void;
  onDirectionPress?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionRelease?: () => void;
  isActionActive?: boolean;
  isChatOpen?: boolean;
}

let deactivateTimeout: any = null;

const setGlobalControlActive = (active: boolean) => {
  if (typeof window === 'undefined') return;
  if (active) {
    if (deactivateTimeout) {
      clearTimeout(deactivateTimeout);
      deactivateTimeout = null;
    }
    (window as any).__raden_virtual_control_active = true;
  } else {
    if (deactivateTimeout) clearTimeout(deactivateTimeout);
    deactivateTimeout = setTimeout(() => {
      (window as any).__raden_virtual_control_active = false;
      deactivateTimeout = null;
    }, 350);
  }
};

export const VirtualControls: React.FC<VirtualControlsProps> = React.memo(({
  onActionPress,
  onDirectionPress,
  onDirectionRelease,
  isActionActive = false,
  isChatOpen = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Mode Kustomisasi Tata Letak Langsung di Layar (In-Place HUD Editor)
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedControl, setSelectedControl] = useState<'analog' | 'action' | 'jump' | 'fish'>('analog');

  // Layout kustomisasi kontrol dari localStorage
  const [layout, setLayout] = useState<IVirtualControlsLayout>(() => {
    try {
      const saved = localStorage.getItem('raden_virtual_controls_layout');
      if (saved) return { ...DEFAULT_CONTROLS_LAYOUT, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_CONTROLS_LAYOUT;
  });

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastJumpTimeRef = useRef<number>(0);
  const lastActionTimeRef = useRef<number>(0);
  const isFishChargingRef = useRef<boolean>(false);

  const sound = SoundManager.getInstance();

  // Radius maksimum pergerakan knob analog
  const maxRadius = 40;

  // Haptic feedback getaran halus pada HP
  const triggerHaptic = useCallback((ms: number = 15) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch (e) {}
  }, []);

  // Sinkronisasi update layout kontrol secara real-time dari SettingsModal & EventBus
  useEffect(() => {
    const handleLayoutUpdate = (newLayout: Partial<IVirtualControlsLayout>) => {
      if (!newLayout) return;
      setLayout((prev) => {
        const merged = { ...prev, ...newLayout };
        try {
          localStorage.setItem('raden_virtual_controls_layout', JSON.stringify(merged));
        } catch (e) {}
        return merged;
      });
    };

    const handleOpenEditor = () => {
      setIsEditMode(true);
      setSelectedControl('analog');
    };

    EventBus.on('virtual-controls-layout-updated', handleLayoutUpdate);
    EventBus.on('open-controls-layout-editor', handleOpenEditor);

    return () => {
      EventBus.off('virtual-controls-layout-updated', handleLayoutUpdate);
      EventBus.off('open-controls-layout-editor', handleOpenEditor);
    };
  }, []);

  /**
   * Mengkalkulasi sudut & vektor arah joystick dari koordinat sentuhan layar
   */
  const updateJoystickFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (isEditMode) return;

      let center = baseCenterRef.current;
      if (!center) {
        if (!joystickBaseRef.current) return;
        const rect = joystickBaseRef.current.getBoundingClientRect();
        center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        baseCenterRef.current = center;
      }

      const dx = clientX - center.x;
      const dy = clientY - center.y;
      const distance = Math.hypot(dx, dy);

      // Batasi posisi knob dalam radius maksimum
      const clampedDist = Math.min(distance, maxRadius);
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      if (knobRef.current) {
        knobRef.current.style.transform = `translate3d(${knobX}px, ${knobY}px, 0)`;
      }

      // Deadzone 5px
      if (clampedDist > 5) {
        const normX = knobX / maxRadius;
        const normY = knobY / maxRadius;

        EventBus.emit('joystick-move', { x: normX, y: normY });
      } else {
        EventBus.emit('joystick-end');
      }
    },
    [maxRadius, isEditMode]
  );

  const resetJoystick = useCallback(() => {
    if (isEditMode) return;
    setGlobalControlActive(false);
    activeTouchIdRef.current = null;
    activePointerIdRef.current = null;
    baseCenterRef.current = null;
    setIsDragging(false);
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
    }
    EventBus.emit('joystick-end');
  }, [isEditMode]);

  // ==========================================================================
  // GLOBAL WINDOW EVENT LISTENERS UNTUK GAMEPLAY BIASA
  // ==========================================================================
  useEffect(() => {
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (isEditMode || activeTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          setGlobalControlActive(true);
          updateJoystickFromCoords(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleWindowTouchEnd = (e: TouchEvent) => {
      if (isEditMode || activeTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          resetJoystick();
          break;
        }
      }
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (isEditMode) return;
      if (activePointerIdRef.current !== null && e.pointerId === activePointerIdRef.current) {
        setGlobalControlActive(true);
        updateJoystickFromCoords(e.clientX, e.clientY);
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (isEditMode) return;
      if (activePointerIdRef.current !== null && e.pointerId === activePointerIdRef.current) {
        resetJoystick();
      }
    };

    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleWindowTouchEnd, { passive: true });
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', handleWindowPointerUp, { passive: true });
    window.addEventListener('pointercancel', handleWindowPointerUp, { passive: true });

    return () => {
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
      window.removeEventListener('touchcancel', handleWindowTouchEnd);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [updateJoystickFromCoords, resetJoystick, isEditMode]);

  // ==========================================================================
  // IN-PLACE DRAGGING & RESIZING HANDLERS (LANGSUNG DENGAN JARI / MOUSE)
  // ==========================================================================
  const handleControlPointerDown = (
    e: React.PointerEvent,
    control: 'analog' | 'action' | 'jump' | 'fish'
  ) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();

    setSelectedControl(control);
    sound.playClick();
    triggerHaptic(15);

    const startX = e.clientX;
    const startY = e.clientY;

    const targetEl = e.currentTarget as HTMLElement;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch (err) {}

    const initX = (
      control === 'analog' ? layout.analogOffsetX :
      control === 'action' ? layout.actionOffsetX :
      control === 'jump' ? (layout.jumpOffsetX || 0) :
      (layout.fishOffsetX || 0)
    ) || 0;

    const initY = (
      control === 'analog' ? layout.analogOffsetY :
      control === 'action' ? layout.actionOffsetY :
      control === 'jump' ? (layout.jumpOffsetY || 0) :
      (layout.fishOffsetY || 0)
    ) || 0;

    let rafId: number | null = null;
    let latestDx = 0;
    let latestDy = 0;

    const applyLayoutUpdate = (dx: number, dy: number) => {
      setLayout((prev) => {
        const next = { ...prev };
        if (control === 'analog') {
          next.analogOffsetX = Math.round(initX + dx);
          next.analogOffsetY = Math.round(initY - dy);
        } else if (control === 'action') {
          next.actionOffsetX = Math.round(initX + dx);
          next.actionOffsetY = Math.round(initY - dy);
        } else if (control === 'jump') {
          next.jumpOffsetX = Math.round(initX + dx);
          next.jumpOffsetY = Math.round(initY - dy);
        } else if (control === 'fish') {
          next.fishOffsetX = Math.round(initX + dx);
          next.fishOffsetY = Math.round(initY - dy);
        }
        return next;
      });
    };

    const onPointerMove = (ev: PointerEvent) => {
      ev.preventDefault();
      latestDx = ev.clientX - startX;
      latestDy = ev.clientY - startY;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          applyLayoutUpdate(latestDx, latestDy);
        });
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      applyLayoutUpdate(latestDx, latestDy);

      try {
        targetEl.releasePointerCapture(ev.pointerId);
      } catch (err) {}
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });
  };

  const getCurrentScale = (): number => {
    if (selectedControl === 'analog') return layout.analogScale;
    if (selectedControl === 'action') return layout.actionScale;
    if (selectedControl === 'jump') return layout.jumpScale;
    if (selectedControl === 'fish') return layout.fishScale;
    return 1.0;
  };

  const handleAdjustScale = (delta: number) => {
    sound.playClick();
    triggerHaptic(15);
    setLayout((prev) => {
      const next = { ...prev };
      if (selectedControl === 'analog') {
        next.analogScale = Math.max(0.6, Math.min(1.8, +(next.analogScale + delta).toFixed(2)));
      } else if (selectedControl === 'action') {
        next.actionScale = Math.max(0.6, Math.min(1.8, +(next.actionScale + delta).toFixed(2)));
      } else if (selectedControl === 'jump') {
        next.jumpScale = Math.max(0.6, Math.min(1.8, +((next.jumpScale || 1.0) + delta).toFixed(2)));
      } else if (selectedControl === 'fish') {
        next.fishScale = Math.max(0.6, Math.min(1.8, +((next.fishScale || 1.0) + delta).toFixed(2)));
      }
      return next;
    });
  };

  const handleSetScalePreset = (preset: number) => {
    sound.playClick();
    triggerHaptic(15);
    setLayout((prev) => {
      const next = { ...prev };
      if (selectedControl === 'analog') next.analogScale = preset;
      else if (selectedControl === 'action') next.actionScale = preset;
      else if (selectedControl === 'jump') next.jumpScale = preset;
      else if (selectedControl === 'fish') next.fishScale = preset;
      return next;
    });
  };

  const handleSaveAndExit = () => {
    sound.playSuccess();
    try {
      localStorage.setItem('raden_virtual_controls_layout', JSON.stringify(layout));
    } catch (e) {}
    EventBus.emit('virtual-controls-layout-updated', layout);
    setIsEditMode(false);
    EventBus.emit('new-chat-message', {
      id: `layout_saved_${Date.now()}`,
      sender: 'SISTEM',
      text: '🎮 Tata letak dan ukuran kontrol berhasil disimpan!',
      timestamp: Date.now(),
      isSystem: true,
    });
  };

  const handleResetLayout = () => {
    sound.playClick();
    triggerHaptic(20);
    setLayout(DEFAULT_CONTROLS_LAYOUT);
    try {
      localStorage.setItem('raden_virtual_controls_layout', JSON.stringify(DEFAULT_CONTROLS_LAYOUT));
    } catch (e) {}
    EventBus.emit('virtual-controls-layout-updated', DEFAULT_CONTROLS_LAYOUT);
  };

  // ==========================================================================
  // JOYSTICK TOUCH HANDLERS (Multi-Touch Native dengan Anti-Leak)
  // ==========================================================================
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setGlobalControlActive(true);

    const touch = e.changedTouches[0];
    if (!touch || !joystickBaseRef.current) return;

    activeTouchIdRef.current = touch.identifier;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    baseCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setIsDragging(true);
    triggerHaptic(10);
    updateJoystickFromCoords(touch.clientX, touch.clientY);
  };

  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditMode) {
      handleControlPointerDown(e, 'analog');
      return;
    }
    if (activeTouchIdRef.current !== null) return;
    e.preventDefault();
    e.stopPropagation();
    setGlobalControlActive(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    activePointerIdRef.current = e.pointerId;
    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      baseCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    setIsDragging(true);
    triggerHaptic(10);
    updateJoystickFromCoords(e.clientX, e.clientY);
  };

  // ==========================================================================
  // TOMBOL AKSI, LOMPAT, & MANCING HANDLERS
  // ==========================================================================
  const handleJumpPress = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isEditMode) {
      handleControlPointerDown(e, 'jump');
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    // Pastikan tidak ada tombol HTML yang tertinggal fokus (seperti tombol Maximize/Fullscreen)
    if (document.activeElement && (document.activeElement as HTMLElement).blur && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
    if (e.currentTarget && (e.currentTarget as HTMLElement).blur) {
      (e.currentTarget as HTMLElement).blur();
    }

    setGlobalControlActive(true);

    const now = Date.now();
    if (now - lastJumpTimeRef.current < 160) return;
    lastJumpTimeRef.current = now;

    triggerHaptic(20);
    sound.playClick();
    EventBus.emit('player-jump');
    setGlobalControlActive(false);
  }, [sound, triggerHaptic, isEditMode, layout]);

  const handleActionButtonPress = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isEditMode) {
      handleControlPointerDown(e, 'action');
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setGlobalControlActive(true);

    const now = Date.now();
    if (now - lastActionTimeRef.current < 200) return;
    lastActionTimeRef.current = now;

    triggerHaptic(25);
    sound.playClick();
    EventBus.emit('player-action');
    onActionPress();
    setGlobalControlActive(false);
  }, [sound, onActionPress, triggerHaptic, isEditMode, layout]);

  const [isFishBiting, setIsFishBiting] = useState(false);

  useEffect(() => {
    const handleBite = () => {
      setIsFishBiting(true);
      triggerHaptic(60);
    };
    const handleBiteEnd = () => {
      setIsFishBiting(false);
    };

    EventBus.on('fishing-bite', handleBite);
    EventBus.on('fishing-state-changed', (state: string) => {
      if (state !== 'bite') setIsFishBiting(false);
    });
    EventBus.on('fishing-ended', handleBiteEnd);
    EventBus.on('fishing-minigame-start', handleBiteEnd);

    // Global listener untuk menghentikan charge jika jari terangkat di luar tombol di mobile/tablet
    const handleGlobalRelease = () => {
      if (isFishChargingRef.current) {
        isFishChargingRef.current = false;
        triggerHaptic(30);
        EventBus.emit('fishing-charge-release');
        EventBus.emit('fishing-cast-release');
        setGlobalControlActive(false);
      }
    };

    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);

    return () => {
      EventBus.off('fishing-bite', handleBite);
      EventBus.off('fishing-ended', handleBiteEnd);
      EventBus.off('fishing-minigame-start', handleBiteEnd);
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
    };
  }, [triggerHaptic]);

  const handleFishPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isEditMode) {
      handleControlPointerDown(e, 'fish');
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    // Blur input/button apapun yang aktif
    if (document.activeElement && (document.activeElement as HTMLElement).blur && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }

    setGlobalControlActive(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    if (isFishBiting) {
      triggerHaptic(40);
      sound.playClick();
      setIsFishBiting(false);
      EventBus.emit('player-strike');
      EventBus.emit('player-fish');
      return;
    }

    triggerHaptic(20);
    sound.playClick();
    isFishChargingRef.current = true;
    EventBus.emit('fishing-charge-start');
  }, [isFishBiting, sound, triggerHaptic, isEditMode, layout]);

  const handleFishPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isEditMode) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (isFishChargingRef.current) {
      isFishChargingRef.current = false;
      triggerHaptic(30);
      EventBus.emit('fishing-charge-release');
      EventBus.emit('fishing-cast-release');
    }
    setGlobalControlActive(false);
  }, [triggerHaptic, isEditMode]);

  return (
    <>
      {/* ================================================================ */}
      {/* OVERLAY MODE ATUR KONTROL DENGAN PANDUAN SENTUHAN                */}
      {/* ================================================================ */}
      {isEditMode && (
        <div 
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] pointer-events-none select-none flex flex-col justify-between"
          style={{ touchAction: 'none' }}
        >
          {/* TOP FLOATING BANNER */}
          <div className="pt-3 px-3 flex justify-center pointer-events-none w-full">
            <div className="pointer-events-auto bg-neutral-950/95 border-2 border-amber-400 rounded-2xl px-4 py-2.5 shadow-[0_0_35px_rgba(0,0,0,0.9)] flex items-center gap-2 sm:gap-4 text-white backdrop-blur-md animate-in fade-in slide-in-from-top-3 max-w-[95vw]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-amber-400">
                  Atur Kontrol Langsung
                </span>
              </div>
              <span className="text-[11px] text-neutral-300 hidden md:inline">
                • Geser kontrol dengan jari ke posisi yang nyaman • Ketuk tombol untuk ubah ukuran
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onPointerDown={handleResetLayout}
                  className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                  title="Kembalikan posisi & ukuran ke semula"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onPointerDown={handleSaveAndExit}
                  className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Selesai</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM FLOATING PALETTE (TOOL UKURAN BESAR / KECIL) */}
          <div className="pb-3 px-3 flex justify-center pointer-events-none w-full">
            <div className="pointer-events-auto bg-neutral-950/95 border-2 border-amber-400 rounded-2xl p-3 shadow-2xl flex flex-col items-center gap-2 text-white backdrop-blur-md animate-in fade-in zoom-in-95 max-w-[95vw]">
              <div className="flex items-center justify-between w-full gap-3 text-xs">
                <span className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  {selectedControl === 'analog' && '🕹️ Analog Joystick'}
                  {selectedControl === 'action' && '⚡ Tombol Aksi'}
                  {selectedControl === 'jump' && '⬆️ Tombol Lompat'}
                  {selectedControl === 'fish' && '🐟 Tombol Mancing'}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Ukuran: <strong className="text-amber-400 text-xs">{getCurrentScale().toFixed(1)}x</strong>
                </span>
              </div>

              {/* Tab Pemilih Tombol */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px] font-bold">
                {(['analog', 'action', 'jump', 'fish'] as const).map((ctrl) => (
                  <button
                    key={ctrl}
                    type="button"
                    onPointerDown={() => {
                      sound.playClick();
                      triggerHaptic(10);
                      setSelectedControl(ctrl);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedControl === ctrl
                        ? 'bg-amber-400 text-neutral-950 font-black shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ctrl === 'analog' ? '🕹️ Analog' : ctrl === 'action' ? '⚡ Aksi' : ctrl === 'jump' ? '⬆️ Lompat' : '🐟 Mancing'}
                  </button>
                ))}
              </div>

              {/* Kontrol Skala Besar / Kecil */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onPointerDown={() => handleAdjustScale(-0.1)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700 text-amber-300 font-black text-xs flex items-center gap-1 cursor-pointer transition-all"
                  title="Perkecil Ukuran Tombol Terpilih"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Kecil</span>
                </button>

                <div className="flex gap-1">
                  {[0.8, 1.0, 1.2, 1.5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onPointerDown={() => handleSetScalePreset(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        Math.abs(getCurrentScale() - preset) < 0.05
                          ? 'bg-amber-400 text-neutral-950 font-black'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onPointerDown={() => handleAdjustScale(0.1)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700 text-amber-300 font-black text-xs flex items-center gap-1 cursor-pointer transition-all"
                  title="Perbesar Ukuran Tombol Terpilih"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Besar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 1. KIRI BAWAH: ANALOG JOYSTICK VIRTUAL 360 DERAJAT               */}
      {/* ================================================================ */}
      <div
        className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none font-['Chakra_Petch']`}
        style={{
          left: 'max(1.25rem, calc(env(safe-area-inset-left, 0px) + 1rem))',
          bottom: 'max(2.25rem, calc(env(safe-area-inset-bottom, 0px) + 1.75rem))',
          transform: isChatOpen && !isEditMode
            ? 'translateY(16px) scale(0.9)'
            : `translate(${layout.analogOffsetX}px, ${-layout.analogOffsetY}px) scale(${layout.analogScale})`,
          transformOrigin: 'center center',
          transition: isEditMode ? 'none' : 'opacity 0.15s, transform 0.15s',
          opacity: isChatOpen && !isEditMode ? 0 : 1,
        }}
      >

        {/* Floating Quick Resize Pill di atas Analog saat terpilih */}
        {isEditMode && selectedControl === 'analog' && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-950/95 border-2 border-amber-400 rounded-full px-2.5 py-1 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-50 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in-90"
          >
            <button
              type="button"
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(-0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perkecil (-)"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="font-mono text-xs font-black text-amber-300 px-1 select-none">
              {layout.analogScale.toFixed(1)}x
            </span>
            <button
              type="button"
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perbesar (+)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}

        {/* Joystick Base Wrapper */}
        <div
          onPointerDown={(e) => {
            if (isEditMode) handleControlPointerDown(e, 'analog');
          }}
          className={`pointer-events-auto select-none touch-none ${
            isEditMode
              ? `cursor-move rounded-full p-1 ${
                  selectedControl === 'analog'
                    ? 'ring-4 ring-amber-400 border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
                    : 'border-2 border-dashed border-white/50 hover:border-amber-400'
                }`
              : ''
          }`}
          style={{ touchAction: 'none' }}
        >
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickTouchStart}
            onPointerDown={handleJoystickPointerDown}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="relative w-24 h-24 sm:w-27 sm:h-27 md:w-29 md:h-29 rounded-full bg-black/75 border-2 border-white/25 flex items-center justify-center cursor-pointer select-none touch-none shadow-2xl backdrop-blur-xs active:border-amber-400/80 transition-colors"
            style={{ touchAction: 'none' }}
            role="slider"
            aria-label="Analog Virtual Joystick"
          >
            {/* Garis Salib Sumbu Arah */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-13 sm:w-16 h-0.5 bg-white/15" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-13 sm:h-16 w-0.5 bg-white/15" />
            </div>

            {/* Lingkaran Batas Dalam Tipis */}
            <div className="absolute w-13 sm:w-16 h-13 sm:h-16 rounded-full border border-white/15 pointer-events-none" />

            {/* Knob Analog */}
            <div
              ref={knobRef}
              className={`w-10 h-10 sm:w-11.5 sm:h-11.5 md:w-12.5 md:h-12.5 rounded-full border-2 border-white/40 bg-neutral-900/95 flex items-center justify-center select-none shadow-xl pointer-events-none will-change-transform ${
                isDragging && !isEditMode ? 'duration-0 border-amber-400 bg-neutral-950 scale-105' : 'duration-150 ease-out'
              }`}
              style={{
                transform: 'translate3d(0px, 0px, 0px)',
              }}
            >
              <div
                className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full border transition-all ${
                  isDragging && !isEditMode ? 'border-amber-400 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'border-white/30 bg-white/20'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. TOMBOL MANCING (INDEPENDENT POSITION & RESIZE)                */}
      {/* ================================================================ */}
      <div
        className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none font-['Chakra_Petch']`}
        style={{
          right: 'max(6rem, calc(env(safe-area-inset-right, 0px) + 5.5rem))',
          bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))',
          transform: `translate(${layout.fishOffsetX || 0}px, ${-(layout.fishOffsetY || 0)}px) scale(${layout.fishScale})`,
          transformOrigin: 'center center',
          transition: isEditMode ? 'none' : 'opacity 0.15s, transform 0.15s',
          opacity: isChatOpen && !isEditMode ? 0 : 1,
        }}
      >
        {/* Floating Quick Resize Pill di atas Tombol Mancing saat terpilih */}
        {isEditMode && selectedControl === 'fish' && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-950/95 border-2 border-amber-400 rounded-full px-2.5 py-1 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-50 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in-90"
          >
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(-0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perkecil (-)"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="font-mono text-xs font-black text-amber-300 px-1 select-none">
              {layout.fishScale.toFixed(1)}x
            </span>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perbesar (+)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}

        <div
          onPointerDown={(e) => {
            if (isEditMode) handleControlPointerDown(e, 'fish');
          }}
          className={`pointer-events-auto select-none touch-none ${
            isEditMode
              ? `cursor-move rounded-full p-1 ${
                  selectedControl === 'fish'
                    ? 'ring-4 ring-amber-400 border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
                    : 'border-2 border-dashed border-white/50 hover:border-amber-400'
                }`
              : ''
          }`}
          style={{ touchAction: 'none' }}
        >
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={handleFishPointerDown}
            onPointerUp={handleFishPointerUp}
            onPointerCancel={handleFishPointerUp}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className={`w-11.5 h-11.5 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all select-none ${
              isFishBiting && !isEditMode
                ? 'bg-amber-500/35 border-2 border-amber-400 text-amber-300 ring-4 ring-amber-400/50 animate-pulse shadow-[0_0_24px_rgba(245,158,11,0.7)]'
                : 'bg-black/80 hover:bg-black/90 active:bg-neutral-800 border-2 border-white/30 text-neutral-200 shadow-xl'
            }`}
            style={{ touchAction: 'none' }}
            title={isFishBiting ? "IKAN MENYAMBAR! KETUK UNTUK TARIK!" : "Tahan untuk Menimbang Lemparan Kail / Strike (F)"}
            aria-label="Tombol Mancing"
          >
            <Fish className={`w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2] transition-colors ${isFishBiting && !isEditMode ? 'text-amber-300 stroke-[2.8] animate-bounce' : 'text-amber-300'}`} />
            <span className={`text-[6.5px] sm:text-[7.5px] font-mono font-black tracking-wider leading-none mt-0.5 ${isFishBiting && !isEditMode ? 'text-amber-300' : 'text-neutral-300'}`}>
              {isFishBiting && !isEditMode ? 'TARIK!' : 'MANCING'}
            </span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 3. TOMBOL LOMPAT (INDEPENDENT POSITION & RESIZE)                 */}
      {/* ================================================================ */}
      <div
        className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none font-['Chakra_Petch']`}
        style={{
          right: 'max(2.25rem, calc(env(safe-area-inset-right, 0px) + 2rem))',
          bottom: 'max(5.25rem, calc(env(safe-area-inset-bottom, 0px) + 4.75rem))',
          transform: `translate(${layout.jumpOffsetX || 0}px, ${-(layout.jumpOffsetY || 0)}px) scale(${layout.jumpScale})`,
          transformOrigin: 'center center',
          transition: isEditMode ? 'none' : 'opacity 0.15s, transform 0.15s',
          opacity: isChatOpen && !isEditMode ? 0 : 1,
        }}
      >
        {/* Floating Quick Resize Pill di atas Tombol Lompat saat terpilih */}
        {isEditMode && selectedControl === 'jump' && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-950/95 border-2 border-amber-400 rounded-full px-2.5 py-1 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-50 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in-90"
          >
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(-0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perkecil (-)"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="font-mono text-xs font-black text-amber-300 px-1 select-none">
              {layout.jumpScale.toFixed(1)}x
            </span>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perbesar (+)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}

        <div
          onPointerDown={(e) => {
            if (isEditMode) handleControlPointerDown(e, 'jump');
          }}
          className={`pointer-events-auto select-none touch-none ${
            isEditMode
              ? `cursor-move rounded-full p-1 ${
                  selectedControl === 'jump'
                    ? 'ring-4 ring-amber-400 border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
                    : 'border-2 border-dashed border-white/50 hover:border-amber-400'
                }`
              : ''
          }`}
          style={{ touchAction: 'none' }}
        >
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={handleJumpPress}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="w-11.5 h-11.5 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-black/80 hover:bg-black/90 active:bg-neutral-800 border-2 border-white/30 text-neutral-100 flex flex-col items-center justify-center cursor-pointer shadow-xl active:scale-95 transition-all select-none"
            style={{ touchAction: 'none' }}
            title="Lompat / Double Jump (Spasi)"
            aria-label="Tombol Lompat"
          >
            <ArrowUp className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5] text-amber-300" />
            <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold tracking-wider leading-none mt-0.5 text-neutral-300">
              LOMPAT
            </span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 4. TOMBOL AKSI UTAMA (INDEPENDENT POSITION & RESIZE)             */}
      {/* ================================================================ */}
      <div
        className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none font-['Chakra_Petch']`}
        style={{
          right: 'max(1.25rem, calc(env(safe-area-inset-right, 0px) + 1rem))',
          bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
          transform: `translate(${layout.actionOffsetX}px, ${-layout.actionOffsetY}px) scale(${layout.actionScale})`,
          transformOrigin: 'center center',
          transition: isEditMode ? 'none' : 'opacity 0.15s, transform 0.15s',
          opacity: isChatOpen && !isEditMode ? 0 : 1,
        }}
      >
        {/* Floating Quick Resize Pill di atas Tombol Aksi saat terpilih */}
        {isEditMode && selectedControl === 'action' && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-950/95 border-2 border-amber-400 rounded-full px-2.5 py-1 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-50 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in-90"
          >
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(-0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perkecil (-)"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="font-mono text-xs font-black text-amber-300 px-1 select-none">
              {layout.actionScale.toFixed(1)}x
            </span>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => { e.stopPropagation(); handleAdjustScale(0.1); }}
              className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 flex items-center justify-center text-amber-300 font-black cursor-pointer border border-neutral-700"
              title="Perbesar (+)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}

        <div
          onPointerDown={(e) => {
            if (isEditMode) handleControlPointerDown(e, 'action');
          }}
          className={`pointer-events-auto select-none touch-none ${
            isEditMode
              ? `cursor-move rounded-full p-1 ${
                  selectedControl === 'action'
                    ? 'ring-4 ring-amber-400 border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
                    : 'border-2 border-dashed border-white/50 hover:border-amber-400'
                }`
              : ''
          }`}
          style={{ touchAction: 'none' }}
        >
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={handleActionButtonPress}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all select-none active:scale-95 shadow-2xl ${
              isActionActive && !isEditMode
                ? 'bg-amber-500/35 border-2 border-amber-400 text-amber-300 ring-4 ring-amber-400/40 animate-pulse shadow-[0_0_24px_rgba(245,158,11,0.5)]'
                : 'bg-black/80 hover:bg-black/90 active:bg-neutral-800 border-2 border-white/30 text-neutral-200'
            }`}
            style={{ touchAction: 'none' }}
            title={isActionActive ? 'Sentuh untuk Berbicara / Interaksi' : 'Tombol Aksi [E]'}
            aria-label="Tombol Aksi"
          >
            <Zap
              className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2.2] transition-colors ${
                isActionActive && !isEditMode ? 'text-amber-300 fill-amber-400/40' : 'text-neutral-200'
              }`}
            />
            <span
              className={`text-[8px] sm:text-[9px] md:text-[10px] font-mono font-black tracking-widest uppercase mt-0.5 sm:mt-1 transition-colors ${
                isActionActive && !isEditMode ? 'text-amber-300' : 'text-neutral-300'
              }`}
            >
              AKSI
            </span>
          </button>
        </div>
      </div>
    </>
  );
});
VirtualControls.displayName = 'VirtualControls';
