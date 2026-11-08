/**
 * ============================================================================
 * FILE: resources/js/game/ui/VirtualControls.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kontrol Virtual Analog (Touch Joystick 360°) dan Tombol Interaksi
 * [AKSI, LOMPAT, LARI, MANCING] bergaya Cozycore Clay-Pixel:
 * - Tanpa glow, tanpa hover, outline 2px #5C3A21, palet #FFF8EA / #FFAE6D / #A8E6CF.
 * - Jarak antar tombol dijamin proporsional (tidak saling dempet/bertumpuk)
 *   baik pada Mobile Portrait maupun Mobile Landscape.
 * - Mendukung In-Place HUD Customizer (geser & ubah ukuran langsung dengan jari).
 * ============================================================================
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Zap, ArrowUp, Fish, Check, RotateCcw, Plus, Minus, Sliders } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { InventoryManager } from '../core/InventoryManager';

export interface IVirtualControlsLayout {
    analogScale: number;
    analogOffsetX: number;
    analogOffsetY: number;
    actionScale: number;
    actionOffsetX: number;
    actionOffsetY: number;
    jumpScale: number;
    jumpOffsetX?: number;
    jumpOffsetY?: number;
    fishScale: number;
    fishOffsetX?: number;
    fishOffsetY?: number;
    runScale: number;
    runOffsetX?: number;
    runOffsetY?: number;
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
    runScale: 1.0,
    runOffsetX: 0,
    runOffsetY: 0,
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
    isActionActive = false,
    isChatOpen = false,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [selectedControl, setSelectedControl] = useState<'analog' | 'action' | 'jump' | 'fish' | 'run'>('analog');
    const [isRunningActive, setIsRunningActive] = useState<boolean>(false);
    const [isOverlayBlocking, setIsOverlayBlocking] = useState<boolean>(false);

  const [isKiteFlying, setIsKiteFlying] = useState<boolean>(false);
  const [isNearRipeCrop, setIsNearRipeCrop] = useState<boolean>(false);

    const resolveActiveToolInfo = useCallback((kiteFlying: boolean): {
        type: 'seed' | 'rod' | 'hoe' | 'watering' | 'kite' | 'harvest' | 'other';
        label: string;
        iconText?: string;
    } => {
        const item = InventoryManager.getInstance().getActiveItem();
        if (InventoryManager.isSeedItem(item)) return { type: 'seed', label: 'TANAM', iconText: item?.icon || '🌱' };
        if (InventoryManager.isHoeItem(item)) return { type: 'hoe', label: 'CANGKUL', iconText: '⛏️' };
        if (InventoryManager.isWateringCanItem(item)) return { type: 'watering', label: 'SIRAM', iconText: '💧' };
        if (InventoryManager.isKiteItem(item)) return { type: 'kite', label: kiteFlying ? 'GULUNG' : 'LAYANGAN', iconText: '🪁' };
        if (InventoryManager.isRodItem(item)) return { type: 'rod', label: 'MANCING' };
        if (item && (item.category === 'consumable' || item.category === 'crop') && item.usable) {
            return { type: 'other', label: 'PAKAI', iconText: item.icon || '🍎' };
        }
        if (kiteFlying) return { type: 'kite', label: 'GULUNG', iconText: '🪁' };
        return { type: 'rod', label: 'MANCING' };
    }, []);

    const [activeToolInfo, setActiveToolInfo] = useState<{
        type: 'seed' | 'rod' | 'hoe' | 'watering' | 'kite' | 'harvest' | 'other';
        label: string;
        iconText?: string;
    }>(() => resolveActiveToolInfo(false));

  useEffect(() => {
    const handleInv = () => {
      setActiveToolInfo(resolveActiveToolInfo(isKiteFlying));
    };

    const handleKiteChange = (data: { isFlying: boolean; mode: 'kite' | 'character' }) => {
      setIsKiteFlying(data.isFlying);
      setActiveToolInfo(resolveActiveToolInfo(data.isFlying));
    };

    const handleNearRipeCrop = (isNear: boolean) => {
      setIsNearRipeCrop(Boolean(isNear));
    };

    EventBus.on('inventory-updated', handleInv);
    EventBus.on('kite-mode-changed', handleKiteChange);
    EventBus.on('near-ripe-crop-changed', handleNearRipeCrop);
    return () => {
      EventBus.off('inventory-updated', handleInv);
      EventBus.off('kite-mode-changed', handleKiteChange);
      EventBus.off('near-ripe-crop-changed', handleNearRipeCrop);
    };
  }, [isKiteFlying, resolveActiveToolInfo]);

    const [layout, setLayout] = useState<IVirtualControlsLayout>(() => {
        try {
            const saved = localStorage.getItem('raden_virtual_controls_layout');
            if (saved) return { ...DEFAULT_CONTROLS_LAYOUT, ...JSON.parse(saved) };
        } catch (e) { }
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
    const maxRadius = 36;

    const triggerHaptic = useCallback((ms: number = 15) => {
        try {
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(ms);
            }
        } catch (e) { }
    }, []);

    // Sembunyikan kontrol saat dialog NPC atau peta penuh dibuka agar tidak bertumpuk
    useEffect(() => {
        let dlg = false;
        let map = false;
        const sync = () => setIsOverlayBlocking(dlg || map);
        const onOpenDlg = () => { dlg = true; sync(); };
        const onCloseDlg = () => { dlg = false; sync(); };
        const onDlgActive = (active: boolean) => { dlg = Boolean(active); sync(); };
        const onMapToggle = (open: boolean) => { map = Boolean(open); sync(); };

        EventBus.on('open-dialogue', onOpenDlg);
        EventBus.on('close-dialogue', onCloseDlg);
        EventBus.on('dialogue-active', onDlgActive);
        EventBus.on('full-map-toggled', onMapToggle);

        return () => {
            EventBus.off('open-dialogue', onOpenDlg);
            EventBus.off('close-dialogue', onCloseDlg);
            EventBus.off('dialogue-active', onDlgActive);
            EventBus.off('full-map-toggled', onMapToggle);
        };
    }, []);

    useEffect(() => {
        const handleLayoutUpdate = (newLayout: Partial<IVirtualControlsLayout>) => {
            if (!newLayout) return;
            setLayout((prev) => {
                const merged = { ...prev, ...newLayout };
                try {
                    localStorage.setItem('raden_virtual_controls_layout', JSON.stringify(merged));
                } catch (e) { }
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

            const clampedDist = Math.min(distance, maxRadius);
            const angle = Math.atan2(dy, dx);
            const knobX = Math.cos(angle) * clampedDist;
            const knobY = Math.sin(angle) * clampedDist;

            if (knobRef.current) {
                knobRef.current.style.transform = `translate3d(${knobX}px, ${knobY}px, 0)`;
            }

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

    const handleControlPointerDown = (
        e: React.PointerEvent,
        control: 'analog' | 'action' | 'jump' | 'fish' | 'run'
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
        } catch (err) { }

        const initX =
            (control === 'analog'
                ? layout.analogOffsetX
                : control === 'action'
                    ? layout.actionOffsetX
                    : control === 'jump'
                        ? layout.jumpOffsetX || 0
                        : control === 'run'
                            ? layout.runOffsetX || 0
                            : layout.fishOffsetX || 0) || 0;

        const initY =
            (control === 'analog'
                ? layout.analogOffsetY
                : control === 'action'
                    ? layout.actionOffsetY
                    : control === 'jump'
                        ? layout.jumpOffsetY || 0
                        : control === 'run'
                            ? layout.runOffsetY || 0
                            : layout.fishOffsetY || 0) || 0;

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
                } else if (control === 'run') {
                    next.runOffsetX = Math.round(initX + dx);
                    next.runOffsetY = Math.round(initY - dy);
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
            } catch (err) { }
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
        if (selectedControl === 'run') return layout.runScale || 1.0;
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
            } else if (selectedControl === 'run') {
                next.runScale = Math.max(0.6, Math.min(1.8, +((next.runScale || 1.0) + delta).toFixed(2)));
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
            else if (selectedControl === 'run') next.runScale = preset;
            return next;
        });
    };

    const handleSaveAndExit = () => {
        sound.playSuccess();
        try {
            localStorage.setItem('raden_virtual_controls_layout', JSON.stringify(layout));
        } catch (e) { }
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
        } catch (e) { }
        EventBus.emit('virtual-controls-layout-updated', DEFAULT_CONTROLS_LAYOUT);
    };

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
        } catch (err) { }
        activePointerIdRef.current = e.pointerId;
        if (joystickBaseRef.current) {
            const rect = joystickBaseRef.current.getBoundingClientRect();
            baseCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        setIsDragging(true);
        triggerHaptic(10);
        updateJoystickFromCoords(e.clientX, e.clientY);
    };

    const handleJumpPress = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
        if (isEditMode) {
            handleControlPointerDown(e, 'jump');
            return;
        }
        e.preventDefault();
        e.stopPropagation();

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
        const handleRunToggle = (val?: boolean) => {
            setIsRunningActive((prev) => (typeof val === 'boolean' ? val : !prev));
        };
        const handleRunStart = () => setIsRunningActive(true);
        const handleRunEnd = () => setIsRunningActive(false);

        EventBus.on('player-run-toggle', handleRunToggle);
        EventBus.on('player-run-start', handleRunStart);
        EventBus.on('player-run-end', handleRunEnd);

        return () => {
            EventBus.off('player-run-toggle', handleRunToggle);
            EventBus.off('player-run-start', handleRunStart);
            EventBus.off('player-run-end', handleRunEnd);
        };
    }, []);

    const handleRunTogglePress = useCallback((e: React.SyntheticEvent) => {
        if (isEditMode) return;
        e.preventDefault();
        e.stopPropagation();
        setGlobalControlActive(true);
        triggerHaptic(20);
        sound.playClick();
        setIsRunningActive((prev) => {
            const next = !prev;
            EventBus.emit('player-run-toggle', next);
            return next;
        });
    }, [isEditMode, triggerHaptic, sound]);

    useEffect(() => {
        const handleBite = () => {
            setIsFishBiting(true);
            triggerHaptic(60);
        };
        const handleBiteEnd = () => {
            setIsFishBiting(false);
        };
        const handleStateChanged = (state: string) => {
            if (state !== 'bite') setIsFishBiting(false);
        };

        EventBus.on('fishing-bite', handleBite);
        EventBus.on('fishing-state-changed', handleStateChanged);
        EventBus.on('fishing-ended', handleBiteEnd);
        EventBus.on('fishing-minigame-start', handleBiteEnd);

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
            EventBus.off('fishing-state-changed', handleStateChanged);
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

        if (document.activeElement && (document.activeElement as HTMLElement).blur && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur();
        }

        setGlobalControlActive(true);

        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) { }

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
        const currentItem = InventoryManager.getInstance().getActiveItem();
        if (InventoryManager.isRodItem(currentItem) && !isNearRipeCrop) {
            isFishChargingRef.current = true;
            EventBus.emit('fishing-charge-start');
        } else {
            isFishChargingRef.current = false;
            EventBus.emit('player-fish');
        }
    }, [isFishBiting, isNearRipeCrop, sound, triggerHaptic, isEditMode, layout]);

    const handleFishPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
        if (isEditMode) return;
        e.preventDefault();
        e.stopPropagation();

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) { }

        if (isFishChargingRef.current) {
            isFishChargingRef.current = false;
            triggerHaptic(30);
            EventBus.emit('fishing-charge-release');
            EventBus.emit('fishing-cast-release');
        }
        setGlobalControlActive(false);
    }, [triggerHaptic, isEditMode]);

    const isHiddenByOverlay = (isChatOpen || isOverlayBlocking) && !isEditMode;

    const renderResizePill = (scaleVal: number) => (
        <div
            onPointerDown={(e) => e.stopPropagation()}
            className="clay-panel absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 z-50 pointer-events-auto"
        >
            <button
                type="button"
                tabIndex={-1}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    handleAdjustScale(-0.1);
                }}
                className="clay-btn-neutral w-5 h-5 flex items-center justify-center text-black"
                style={{ borderRadius: '6px' }}
                title="Perkecil (-)"
            >
                <Minus className="w-3 h-3 stroke-[3]" />
            </button>
            <span className="text-[10px] font-bold text-black px-1 select-none">
                {scaleVal.toFixed(1)}x
            </span>
            <button
                type="button"
                tabIndex={-1}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    handleAdjustScale(0.1);
                }}
                className="clay-btn-neutral w-5 h-5 flex items-center justify-center text-black"
                style={{ borderRadius: '6px' }}
                title="Perbesar (+)"
            >
                <Plus className="w-3 h-3 stroke-[3]" />
            </button>
        </div>
    );

    return (
        <>
            {/* ================================================================ */}
            {/* OVERLAY MODE ATUR KONTROL LANGSUNG                               */}
            {/* ================================================================ */}
            {isEditMode && (
                <div
                    className="fixed inset-0 z-[60] bg-[#5C3A21]/35 pointer-events-none select-none flex flex-col justify-between text-black"
                    style={{
                        touchAction: 'none',
                        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))',
                        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                    }}
                >
                    {/* TOP FLOATING BANNER */}
                    <div className="flex justify-center pointer-events-none w-full">
                        <div className="pointer-events-auto clay-panel px-3 py-2 flex flex-wrap items-center justify-between gap-2 max-w-[96dvw]">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#FFAE6D] border border-[#5C3A21]" />
                                <span className="font-bold text-xs uppercase text-black">
                                    Atur Kontrol Langsung
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-black hidden lg:inline">
                                • Geser tombol dengan jari • Ketuk untuk ubah ukuran
                            </span>
                            <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                    type="button"
                                    onPointerDown={handleResetLayout}
                                    className="clay-btn-neutral px-2.5 py-1 text-black text-[11px] font-bold flex items-center gap-1"
                                    title="Reset Posisi & Ukuran"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Reset</span>
                                </button>
                                <button
                                    type="button"
                                    onPointerDown={handleSaveAndExit}
                                    className="clay-btn-secondary px-3 py-1 text-black text-[11px] font-bold flex items-center gap-1"
                                >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Selesai</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM FLOATING PALETTE */}
                    <div className="flex justify-center pointer-events-none w-full">
                        <div className="pointer-events-auto clay-panel p-2.5 flex flex-col items-center gap-2 max-w-[96dvw]">
                            <div className="flex items-center justify-between w-full gap-3 text-[11px] font-bold text-black">
                                <span className="uppercase flex items-center gap-1.5">
                                    <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
                                    {selectedControl === 'analog' && '🕹️ Analog Joystick'}
                                    {selectedControl === 'action' && '⚡ Tombol Aksi'}
                                    {selectedControl === 'jump' && '⬆️ Tombol Lompat'}
                                    {selectedControl === 'fish' && '🐟 Tombol Mancing'}
                                    {selectedControl === 'run' && '⚡ Tombol Lari'}
                                </span>
                                <span className="clay-badge-primary px-2 py-0.5 text-[10px]">
                                    {getCurrentScale().toFixed(1)}x
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] font-bold">
                                {(['analog', 'action', 'jump', 'run', 'fish'] as const).map((ctrl) => (
                                    <button
                                        key={ctrl}
                                        type="button"
                                        onPointerDown={() => {
                                            sound.playClick();
                                            triggerHaptic(10);
                                            setSelectedControl(ctrl);
                                        }}
                                        className={`px-2 py-1 text-black ${selectedControl === ctrl ? 'clay-btn-primary' : 'clay-btn-neutral'
                                            }`}
                                        style={{ borderRadius: '7px' }}
                                    >
                                        {ctrl === 'analog'
                                            ? 'Analog'
                                            : ctrl === 'action'
                                                ? 'Aksi'
                                                : ctrl === 'jump'
                                                    ? 'Lompat'
                                                    : ctrl === 'run'
                                                        ? 'Lari'
                                                        : 'Mancing'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <button
                                    type="button"
                                    onPointerDown={() => handleAdjustScale(-0.1)}
                                    className="clay-btn-neutral px-2.5 py-1 text-black font-bold text-[10px] flex items-center gap-1"
                                    style={{ borderRadius: '7px' }}
                                >
                                    <Minus className="w-3 h-3 stroke-[3]" />
                                    <span>Kecil</span>
                                </button>

                                {[0.8, 1.0, 1.2, 1.5].map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onPointerDown={() => handleSetScalePreset(preset)}
                                        className={`px-2 py-1 text-[10px] font-bold text-black ${Math.abs(getCurrentScale() - preset) < 0.05 ? 'clay-btn-secondary' : 'clay-btn-neutral'
                                            }`}
                                        style={{ borderRadius: '7px' }}
                                    >
                                        {preset}x
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onPointerDown={() => handleAdjustScale(0.1)}
                                    className="clay-btn-neutral px-2.5 py-1 text-black font-bold text-[10px] flex items-center gap-1"
                                    style={{ borderRadius: '7px' }}
                                >
                                    <Plus className="w-3 h-3 stroke-[3]" />
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
                className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none`}
                style={{
                    left: 'max(0.875rem, calc(env(safe-area-inset-left, 0px) + 0.75rem))',
                    bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
                    transform: isHiddenByOverlay
                        ? 'translateY(12px) scale(0.92)'
                        : `translate(${layout.analogOffsetX}px, ${-layout.analogOffsetY}px) scale(${layout.analogScale})`,
                    transformOrigin: 'center center',
                    transition: isEditMode ? 'none' : 'opacity 0.12s, transform 0.12s',
                    opacity: isHiddenByOverlay ? 0 : 1,
                }}
            >
                {isEditMode && selectedControl === 'analog' && renderResizePill(layout.analogScale)}

                <div
                    onPointerDown={(e) => {
                        if (isEditMode) handleControlPointerDown(e, 'analog');
                    }}
                    className={`${isHiddenByOverlay ? 'pointer-events-none' : 'pointer-events-auto'} select-none touch-none ${isEditMode
                        ? `cursor-move rounded-full p-1 border-2 ${selectedControl === 'analog' ? 'border-[#5C3A21] bg-[#A8E6CF]/60' : 'border-dashed border-[#5C3A21]'
                        }`
                        : ''
                        }`}
                    style={{ touchAction: 'none' }}
                >
                    <div
                        ref={joystickBaseRef}
                        onTouchStart={handleJoystickTouchStart}
                        onPointerDown={handleJoystickPointerDown}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className="relative w-23 h-23 sm:w-25 sm:h-25 landscape:max-md:w-21 landscape:max-md:h-21 rounded-full bg-[#FFF8EA]/92 border-2 border-[#5C3A21] flex items-center justify-center cursor-pointer select-none touch-none"
                        style={{
                            touchAction: 'none',
                            boxShadow: 'inset 0 2px 0 #FFFFFF, inset 0 -3px 0 #EADBC0, 0 3px 0 #5C3A21',
                        }}
                        role="slider"
                        aria-label="Analog Virtual Joystick"
                    >
                        {/* Garis Salib Sumbu Arah */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-0.5 bg-[#5C3A21]/20" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="h-12 w-0.5 bg-[#5C3A21]/20" />
                        </div>

                        <div className="absolute w-12 h-12 rounded-full border border-[#5C3A21]/25 pointer-events-none" />

                        {/* Knob Analog Clay-Pixel */}
                        <div
                            ref={knobRef}
                            className={`w-10 h-10 rounded-full border-2 border-[#5C3A21] flex items-center justify-center select-none pointer-events-none will-change-transform ${isDragging && !isEditMode ? 'bg-[#A8E6CF] duration-0' : 'bg-[#FFAE6D] duration-150 ease-out'
                                }`}
                            style={{
                                transform: 'translate3d(0px, 0px, 0px)',
                                boxShadow:
                                    isDragging && !isEditMode
                                        ? 'inset 0 2px 0 #D4F5E9, 0 2px 0 #5C3A21'
                                        : 'inset 0 2px 0 #FFD0A6, 0 2px 0 #5C3A21',
                            }}
                        >
                            <div className="w-3 h-3 rounded-full bg-[#FFF8EA] border border-[#5C3A21]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ================================================================ */}
            {/* 2. TOMBOL ALAT FLEKSIBEL (MANCING / TANAM / CANGKUL / SIRAM [F])  */}
            {/* ================================================================ */}
            <div
                className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none`}
                style={{
                    right: 'max(5.75rem, calc(env(safe-area-inset-right, 0px) + 5.5rem))',
                    bottom: 'max(0.875rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
                    transform: `translate(${layout.fishOffsetX || 0}px, ${-(layout.fishOffsetY || 0)}px) scale(${layout.fishScale})`,
                    transformOrigin: 'center center',
                    transition: isEditMode ? 'none' : 'opacity 0.12s, transform 0.12s',
                    opacity: isHiddenByOverlay ? 0 : 1,
                }}
            >
                {isEditMode && selectedControl === 'fish' && renderResizePill(layout.fishScale)}

                <div
                    onPointerDown={(e) => {
                        if (isEditMode) handleControlPointerDown(e, 'fish');
                    }}
                    className={`${isHiddenByOverlay ? 'pointer-events-none' : 'pointer-events-auto'} select-none touch-none ${isEditMode
                        ? `cursor-move rounded-2xl p-1 border-2 ${selectedControl === 'fish' ? 'border-[#5C3A21] bg-[#A8E6CF]/60' : 'border-dashed border-[#5C3A21]'
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
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center select-none text-black ${(isFishBiting || isNearRipeCrop || activeToolInfo.type === 'seed') && !isEditMode ? 'clay-btn-primary' : 'clay-btn-neutral'
                            }`}
                        style={{ touchAction: 'none', borderRadius: '14px' }}
                        title={
                            isFishBiting
                                ? 'IKAN MENYAMBAR! KETUK UNTUK TARIK!'
                                : isNearRipeCrop
                                    ? 'Panen Tanaman Siap Panen [F]'
                                    : activeToolInfo.type === 'seed'
                                        ? 'Tanam Bibit di Lahan Kebun Tani [F]'
                                        : activeToolInfo.type === 'hoe'
                                            ? 'Gemburkan Tanah / Panen [F]'
                                            : activeToolInfo.type === 'watering'
                                                ? 'Siram Tanaman Kebun [F]'
                                                : 'Tahan untuk Lempar Kail / Strike (F)'
                        }
                        aria-label="Tombol Alat Fleksibel"
                    >
                        {isNearRipeCrop && !isFishBiting ? (
                            <span className="text-base leading-none">🌾</span>
                        ) : activeToolInfo.iconText ? (
                            <span className="text-base leading-none">{activeToolInfo.iconText}</span>
                        ) : (
                            <Fish className="w-4.5 h-4.5 stroke-[2.5] text-black" />
                        )}
                        <span className="text-[7px] font-bold leading-none mt-0.5 text-black">
                            {isFishBiting && !isEditMode ? 'TARIK!' : isNearRipeCrop ? 'PANEN' : activeToolInfo.label}
                        </span>
                    </button>
                </div>
            </div>

            {/* ================================================================ */}
            {/* 2.5 TOMBOL LARI / SPRINT (DIAGONAL KIRI ATAS DARI AKSI)          */}
            {/* ================================================================ */}
            <div
                className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none`}
                style={{
                    right: 'max(5.5rem, calc(env(safe-area-inset-right, 0px) + 5.25rem))',
                    bottom: 'max(4.75rem, calc(env(safe-area-inset-bottom, 0px) + 4.5rem))',
                    transform: `translate(${layout.runOffsetX || 0}px, ${-(layout.runOffsetY || 0)}px) scale(${layout.runScale || 1.0})`,
                    transformOrigin: 'center center',
                    transition: isEditMode ? 'none' : 'opacity 0.12s, transform 0.12s',
                    opacity: isHiddenByOverlay ? 0 : 1,
                }}
            >
                {isEditMode && selectedControl === 'run' && renderResizePill(layout.runScale || 1.0)}

                <div
                    onPointerDown={(e) => {
                        if (isEditMode) handleControlPointerDown(e, 'run');
                    }}
                    className={`${isHiddenByOverlay ? 'pointer-events-none' : 'pointer-events-auto'} select-none touch-none ${isEditMode
                        ? `cursor-move rounded-2xl p-1 border-2 ${selectedControl === 'run' ? 'border-[#5C3A21] bg-[#A8E6CF]/60' : 'border-dashed border-[#5C3A21]'
                        }`
                        : ''
                        }`}
                    style={{ touchAction: 'none' }}
                >
                    <button
                        type="button"
                        tabIndex={-1}
                        onPointerDown={handleRunTogglePress}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center select-none text-black ${isRunningActive && !isEditMode ? 'clay-btn-secondary' : 'clay-btn-neutral'
                            }`}
                        style={{ touchAction: 'none', borderRadius: '14px' }}
                        title="Lari Cepat / Sprint (Shift)"
                        aria-label="Tombol Lari"
                    >
                        <Zap className={`w-4.5 h-4.5 stroke-[2.5] text-black ${isRunningActive && !isEditMode ? 'fill-black' : ''}`} />
                        <span className="text-[7px] font-bold leading-none mt-0.5 text-black">
                            {isRunningActive && !isEditMode ? 'SPRINT' : 'LARI'}
                        </span>
                    </button>
                </div>
            </div>

            {/* ================================================================ */}
            {/* 3. TOMBOL LOMPAT (DI ATAS TOMBOL AKSI - BEBAS DEMPET)             */}
            {/* ================================================================ */}
            <div
                className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none`}
                style={{
                    right: 'max(0.875rem, calc(env(safe-area-inset-right, 0px) + 0.75rem))',
                    bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 5.25rem))',
                    transform: `translate(${layout.jumpOffsetX || 0}px, ${-(layout.jumpOffsetY || 0)}px) scale(${layout.jumpScale})`,
                    transformOrigin: 'center center',
                    transition: isEditMode ? 'none' : 'opacity 0.12s, transform 0.12s',
                    opacity: isHiddenByOverlay ? 0 : 1,
                }}
            >
                {isEditMode && selectedControl === 'jump' && renderResizePill(layout.jumpScale)}

                <div
                    onPointerDown={(e) => {
                        if (isEditMode) handleControlPointerDown(e, 'jump');
                    }}
                    className={`${isHiddenByOverlay ? 'pointer-events-none' : 'pointer-events-auto'} select-none touch-none ${isEditMode
                        ? `cursor-move rounded-2xl p-1 border-2 ${selectedControl === 'jump' ? 'border-[#5C3A21] bg-[#A8E6CF]/60' : 'border-dashed border-[#5C3A21]'
                        }`
                        : ''
                        }`}
                    style={{ touchAction: 'none' }}
                >
                    <button
                        type="button"
                        tabIndex={-1}
                        onPointerDown={handleJumpPress}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className="clay-btn-neutral w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center select-none text-black"
                        style={{ touchAction: 'none', borderRadius: '14px' }}
                        title="Lompat (Spasi)"
                        aria-label="Tombol Lompat"
                    >
                        <ArrowUp className="w-4.5 h-4.5 stroke-[2.5] text-black" />
                        <span className="text-[7px] font-bold leading-none mt-0.5 text-black">
                            LOMPAT
                        </span>
                    </button>
                </div>
            </div>

            {/* ================================================================ */}
            {/* 4. TOMBOL AKSI UTAMA (KANAN BAWAH - PRIMARY #FFAE6D)             */}
            {/* ================================================================ */}
            <div
                className={`fixed ${isEditMode ? 'z-[70]' : 'z-[50]'} pointer-events-none select-none`}
                style={{
                    right: 'max(0.875rem, calc(env(safe-area-inset-right, 0px) + 0.75rem))',
                    bottom: 'max(0.875rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
                    transform: `translate(${layout.actionOffsetX}px, ${-layout.actionOffsetY}px) scale(${layout.actionScale})`,
                    transformOrigin: 'center center',
                    transition: isEditMode ? 'none' : 'opacity 0.12s, transform 0.12s',
                    opacity: isHiddenByOverlay ? 0 : 1,
                }}
            >
                {isEditMode && selectedControl === 'action' && renderResizePill(layout.actionScale)}

                <div
                    onPointerDown={(e) => {
                        if (isEditMode) handleControlPointerDown(e, 'action');
                    }}
                    className={`${isHiddenByOverlay ? 'pointer-events-none' : 'pointer-events-auto'} select-none touch-none ${isEditMode
                        ? `cursor-move rounded-2xl p-1 border-2 ${selectedControl === 'action' ? 'border-[#5C3A21] bg-[#A8E6CF]/60' : 'border-dashed border-[#5C3A21]'
                        }`
                        : ''
                        }`}
                    style={{ touchAction: 'none' }}
                >
                    <button
                        type="button"
                        tabIndex={-1}
                        onPointerDown={handleActionButtonPress}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className={`w-15 h-15 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center select-none text-black ${isActionActive && !isEditMode ? 'clay-btn-secondary' : 'clay-btn-primary'
                            }`}
                        style={{ touchAction: 'none', borderRadius: '16px' }}
                        title={isActionActive ? 'Sentuh untuk Berinteraksi' : 'Tombol Aksi [E]'}
                        aria-label="Tombol Aksi"
                    >
                        <Zap
                            className={`w-6 h-6 stroke-[2.5] text-black ${isActionActive && !isEditMode ? 'fill-black' : ''
                                }`}
                        />
                        <span className="text-[8.5px] font-bold uppercase mt-0.5 text-black">
                            AKSI
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
});
VirtualControls.displayName = 'VirtualControls';
