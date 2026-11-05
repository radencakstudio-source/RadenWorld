/**
 * ============================================================================
 * FILE: resources/js/game/ui/SettingsModal.tsx
 * ============================================================================
 * Modal Pengaturan RadenWorld (Cozycore Clay-Pixel):
 * 1. Pilihan Bahasa (10 Bahasa Internasional).
 * 2. Suara & Audio: Master Volume, BGM, SFX, Mute, & Uji Suara Real-time.
 * 3. Tampilan & Kamera: Zoom Kamera & Mode Fullscreen.
 * 4. Kontrol Permainan: Mode PC & Mode Mobile + Pengatur HUD di Layar.
 * 5. Jaringan & Server: Live Ping Latensi, Host LAN, Salin Link, & Pindah Server.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { SoundManager } from '../core/SoundManager';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { IVirtualControlsLayout, DEFAULT_CONTROLS_LAYOUT } from './VirtualControls';
import {
  X,
  Languages,
  Volume2,
  VolumeX,
  Gamepad2,
  Smartphone,
  Monitor,
  Check,
  Maximize2,
  Minimize2,
  Sliders,
  Globe,
  Wifi,
  Copy,
  RefreshCw,
  Server,
  ZoomIn,
  ZoomOut,
  Activity,
  Play,
  Pause,
  Music,
  Move,
  Sparkles,
  Cpu,
  Eye,
  Wind,
  RotateCcw,
  Keyboard,
  Radio,
  Gauge,
  Battery,
  BatteryCharging,
  HardDrive,
} from 'lucide-react';
import { KeybindingManager, KEYBINDING_METADATA, DEFAULT_PC_KEYBINDINGS } from '../core/KeybindingManager';

export type LanguageCode = 'id' | 'en' | 'zh' | 'ja' | 'ko' | 'ar' | 'fr' | 'ru' | 'de' | 'es';
export type ControlMode = 'pc' | 'mobile';
export type GraphicsQualityPreset = 'high' | 'medium' | 'low' | 'custom';

export interface GameSettings {
  language: LanguageCode;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  controlMode: ControlMode;
  cameraZoom?: number;
  minCameraZoom?: number;
  maxCameraZoom?: number;
  cameraSmoothingSpeed?: 'fast' | 'normal' | 'cinematic';
  // Grafik & Performa (Batas User, Efek Gerakan, Anti-Aliasing)
  graphicsQuality?: GraphicsQualityPreset;
  maxVisiblePlayers?: number;
  enableMovementEffects?: boolean;
  enableAntiAliasing?: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenServerModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenServerModal,
}) => {
  const [activeSection, setActiveSection] = useState<
    'language' | 'sound' | 'graphics' | 'display' | 'controls' | 'network'
  >('language');
  const sound = SoundManager.getInstance();
  const networkMgr = NetworkManager.getInstance();

  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQualityPreset>(() => {
    return settings.graphicsQuality || 'high';
  });
  const [maxVisiblePlayers, setMaxVisiblePlayers] = useState<number>(() => {
    return typeof settings.maxVisiblePlayers === 'number' ? settings.maxVisiblePlayers : 50;
  });
  const [enableMovementEffects, setEnableMovementEffects] = useState<boolean>(() => {
    return settings.enableMovementEffects !== false;
  });
  const [enableAntiAliasing, setEnableAntiAliasing] = useState<boolean>(() => {
    return settings.enableAntiAliasing !== false;
  });

  const [customHost, setCustomHost] = useState<string>(() => {
    try {
      return localStorage.getItem('raden_server_host') || '';
    } catch (e) {
      return '';
    }
  });

  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(networkMgr.getIsConnected());
  const [currentSocketUrl, setCurrentSocketUrl] = useState<string>(networkMgr.getServerUrl());
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activePing, setActivePing] = useState<number | null>(null);
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false);

  const [currentCameraZoom, setCurrentCameraZoom] = useState<number>(() => {
    return settings.cameraZoom || 0.9;
  });
  const [minCameraZoom, setMinCameraZoom] = useState<number>(() => {
    return typeof settings.minCameraZoom === 'number' ? settings.minCameraZoom : 0.38;
  });
  const [maxCameraZoom, setMaxCameraZoom] = useState<number>(() => {
    return typeof settings.maxCameraZoom === 'number' ? settings.maxCameraZoom : 2.0;
  });
  const [cameraSmoothingSpeed, setCameraSmoothingSpeed] = useState<'fast' | 'normal' | 'cinematic'>(() => {
    return settings.cameraSmoothingSpeed || 'normal';
  });

  // State Kustomisasi Tombol Pintas PC
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [keybindings, setKeybindings] = useState<Record<string, string>>(() =>
    KeybindingManager.getInstance().getAllKeybindings()
  );

  // State Live FPS & Diagnostik Performa
  const [liveFps, setLiveFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const [connectionDetails, setConnectionDetails] = useState<{
    effectiveType: string;
    downlink: string;
    rtt: string;
    isOnline: boolean;
  }>({
    effectiveType: 'Wi-Fi / LAN',
    downlink: 'Kecepatan Tinggi',
    rtt: 'Stabil',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });
  const [deviceStats, setDeviceStats] = useState<{
    cores: number;
    memory?: string;
    batteryLevel?: number;
    isCharging?: boolean;
  }>({
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
  });

  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(() => sound.getIsBgmPlaying());

  const [, setControlsLayout] = useState<IVirtualControlsLayout>(() => {
    try {
      const saved = localStorage.getItem('raden_virtual_controls_layout');
      if (saved) return { ...DEFAULT_CONTROLS_LAYOUT, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_CONTROLS_LAYOUT;
  });

  const handleResetControlsLayout = () => {
    sound.playClick();
    setControlsLayout(DEFAULT_CONTROLS_LAYOUT);
    try {
      localStorage.setItem(
        'raden_virtual_controls_layout',
        JSON.stringify(DEFAULT_CONTROLS_LAYOUT)
      );
    } catch (e) {}
    EventBus.emit('virtual-controls-layout-updated', DEFAULT_CONTROLS_LAYOUT);
  };

  useEffect(() => {
    if (!isOpen) return;
    setIsSocketConnected(networkMgr.getIsConnected());
    setCurrentSocketUrl(networkMgr.getServerUrl());
    setIsFullscreen(Boolean(document.fullscreenElement));
    setIsBgmPlaying(sound.getIsBgmPlaying());

    const handleNet = (data: { isConnected: boolean; serverUrl: string }) => {
      setIsSocketConnected(data.isConnected);
      setCurrentSocketUrl(data.serverUrl);
    };

    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    EventBus.on('network-status-changed', handleNet);
    document.addEventListener('fullscreenchange', handleFsChange);

    measureLivePing();

    return () => {
      EventBus.off('network-status-changed', handleNet);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [isOpen]);

  // Efek Monitor Live FPS & Diagnostik Performa saat Tab Jaringan Aktif
  useEffect(() => {
    if (!isOpen || activeSection !== 'network') return;

    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (currentTime: number) => {
      frameCount++;
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (currentTime - lastFpsUpdate >= 450) {
        const computedFps = Math.min(120, Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate)));
        setLiveFps(computedFps);
        setFrameTimeMs(Number(delta.toFixed(1)));
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Baca Network Information API
    if (typeof navigator !== 'undefined') {
      const conn =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      if (conn) {
        setConnectionDetails({
          effectiveType: (conn.effectiveType || conn.type || 'Wi-Fi').toUpperCase(),
          downlink: conn.downlink ? `${conn.downlink} Mbps` : 'Kecepatan Tinggi',
          rtt: conn.rtt ? `${conn.rtt} ms` : 'Stabil',
          isOnline: navigator.onLine,
        });
      }

      // Memory
      const devMem = (navigator as any).deviceMemory;
      const memStr = devMem ? `${devMem} GB RAM` : 'Standar Sistem';

      // Battery
      if (typeof (navigator as any).getBattery === 'function') {
        (navigator as any)
          .getBattery()
          .then((batt: any) => {
            setDeviceStats((prev) => ({
              ...prev,
              memory: memStr,
              batteryLevel: Math.round(batt.level * 100),
              isCharging: batt.charging,
            }));
          })
          .catch(() => {});
      } else {
        setDeviceStats((prev) => ({ ...prev, memory: memStr }));
      }
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, activeSection]);

  // Efek Tangkap Tombol Keyboard Saat Pemain Mengganti (Rebind) Shortcut PC
  useEffect(() => {
    if (!editingActionId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        sound.playClick();
        setEditingActionId(null);
        return;
      }

      let keyToSet = e.key;
      if (keyToSet === ' ') keyToSet = 'Space';

      sound.playClick();
      KeybindingManager.getInstance().setKey(editingActionId, keyToSet);
      setKeybindings(KeybindingManager.getInstance().getAllKeybindings());
      setEditingActionId(null);
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
    };
  }, [editingActionId]);

  if (!isOpen) return null;

  const measureLivePing = async () => {
    setIsTestingPing(true);
    try {
      const latency = await networkMgr.measureLatency();
      setActivePing(latency);
    } catch (err) {
      setActivePing(isSocketConnected ? 12 : 999);
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleLanguageChange = (code: LanguageCode) => {
    sound.playClick();
    onUpdateSettings({ ...settings, language: code });
    try {
      localStorage.setItem('raden_language', code);
    } catch (e) {}
  };

  const handleControlModeChange = (mode: ControlMode) => {
    sound.playClick();
    onUpdateSettings({ ...settings, controlMode: mode });
  };

  const handleVolumeChange = (
    field: 'masterVolume' | 'bgmVolume' | 'sfxVolume',
    value: number
  ) => {
    const updated = { ...settings, [field]: value };
    onUpdateSettings(updated);
    sound.setVolume(updated.masterVolume, updated.sfxVolume, updated.bgmVolume);
  };

  const handleTestSoundChime = () => {
    sound.playSuccess();
  };

  const handleZoomChange = (zoom: number) => {
    sound.playClick();
    setCurrentCameraZoom(zoom);
    onUpdateSettings({ ...settings, cameraZoom: zoom });
    EventBus.emit('camera-zoom-set', zoom);
  };

  const handleMinZoomChange = (val: number) => {
    sound.playClick();
    const clamped = Math.min(val, maxCameraZoom - 0.2);
    setMinCameraZoom(clamped);
    const updated = { ...settings, minCameraZoom: clamped };
    onUpdateSettings(updated);
    EventBus.emit('camera-limits-updated', { minZoom: clamped, maxZoom: maxCameraZoom });
  };

  const handleMaxZoomChange = (val: number) => {
    sound.playClick();
    const clamped = Math.max(val, minCameraZoom + 0.2);
    setMaxCameraZoom(clamped);
    const updated = { ...settings, maxCameraZoom: clamped };
    onUpdateSettings(updated);
    EventBus.emit('camera-limits-updated', { minZoom: minCameraZoom, maxZoom: clamped });
  };

  const handleSmoothingChange = (speed: 'fast' | 'normal' | 'cinematic') => {
    sound.playClick();
    setCameraSmoothingSpeed(speed);
    const lerpMap = { fast: 0.2, normal: 0.12, cinematic: 0.06 };
    const updated = { ...settings, cameraSmoothingSpeed: speed };
    onUpdateSettings(updated);
    EventBus.emit('camera-limits-updated', { zoomLerpSpeed: lerpMap[speed] });
  };

  const handleResetCamera = () => {
    sound.playClick();
    const defMin = 0.38;
    const defMax = 2.0;
    const defZoom = 1.0;
    setMinCameraZoom(defMin);
    setMaxCameraZoom(defMax);
    setCurrentCameraZoom(defZoom);
    setCameraSmoothingSpeed('normal');
    const updated = {
      ...settings,
      minCameraZoom: defMin,
      maxCameraZoom: defMax,
      cameraZoom: defZoom,
      cameraSmoothingSpeed: 'normal' as const,
    };
    onUpdateSettings(updated);
    EventBus.emit('camera-limits-updated', { minZoom: defMin, maxZoom: defMax, zoomLerpSpeed: 0.12 });
    EventBus.emit('camera-zoom-set', defZoom);
  };

  const handleStartRebind = (actionId: string) => {
    sound.playClick();
    setEditingActionId(actionId);
  };

  const handleResetKeybindings = () => {
    sound.playClick();
    KeybindingManager.getInstance().resetToDefaults();
    setKeybindings(KeybindingManager.getInstance().getAllKeybindings());
    setEditingActionId(null);
  };

  const toggleMute = () => {
    sound.playClick();
    const newMuted = !settings.isMuted;
    onUpdateSettings({ ...settings, isMuted: newMuted });
    sound.setMuted(newMuted);
  };

  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSelectQualityPreset = (preset: 'high' | 'medium' | 'low') => {
    sound.playClick();
    let newMaxPlayers = 50;
    let newEffects = true;
    let newAA = true;

    if (preset === 'high') {
      newMaxPlayers = 50;
      newEffects = true;
      newAA = true;
    } else if (preset === 'medium') {
      newMaxPlayers = 25;
      newEffects = true;
      newAA = true;
    } else if (preset === 'low') {
      newMaxPlayers = 10;
      newEffects = false;
      newAA = false;
    }

    setGraphicsQuality(preset);
    setMaxVisiblePlayers(newMaxPlayers);
    setEnableMovementEffects(newEffects);
    setEnableAntiAliasing(newAA);

    onUpdateSettings({
      ...settings,
      graphicsQuality: preset,
      maxVisiblePlayers: newMaxPlayers,
      enableMovementEffects: newEffects,
      enableAntiAliasing: newAA,
    });
  };

  const handleMaxVisiblePlayersChange = (count: number) => {
    sound.playClick();
    setMaxVisiblePlayers(count);
    setGraphicsQuality('custom');
    onUpdateSettings({
      ...settings,
      graphicsQuality: 'custom',
      maxVisiblePlayers: count,
    });
  };

  const handleToggleMovementEffects = () => {
    sound.playClick();
    const nextVal = !enableMovementEffects;
    setEnableMovementEffects(nextVal);
    setGraphicsQuality('custom');
    onUpdateSettings({
      ...settings,
      graphicsQuality: 'custom',
      enableMovementEffects: nextVal,
    });
  };

  const handleToggleAntiAliasing = () => {
    sound.playClick();
    const nextVal = !enableAntiAliasing;
    setEnableAntiAliasing(nextVal);
    setGraphicsQuality('custom');
    onUpdateSettings({
      ...settings,
      graphicsQuality: 'custom',
      enableAntiAliasing: nextVal,
    });
  };

  const handleCopyLink = () => {
    sound.playClick();
    const port = window.location.port ? `:${window.location.port}` : '';
    const shareUrl = `${window.location.protocol}//${window.location.hostname}${port}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      })
      .catch(() => {});
  };

  const languagesList: { code: LanguageCode; name: string; region: string; flag: string }[] = [
    { code: 'id', name: 'Bahasa Indonesia', region: 'Indonesia (Bahasa Utama)', flag: '🇮🇩' },
    { code: 'en', name: 'English', region: 'Global / United States / UK', flag: '🇬🇧' },
    { code: 'zh', name: '中文 (Mandarin)', region: 'China / Taiwan / Singapore', flag: '🇨🇳' },
    { code: 'ja', name: '日本語 (Japanese)', region: 'Japan (Nihon)', flag: '🇯🇵' },
    { code: 'ko', name: '한국어 (Korean)', region: 'South Korea (Hanguk)', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية (Arabic)', region: 'Timur Tengah & Afrika Utara', flag: '🇸🇦' },
    { code: 'fr', name: 'Français (French)', region: 'Prancis & Frankofon', flag: '🇫🇷' },
    { code: 'ru', name: 'Русский (Russian)', region: 'Rusia & Negara CIS', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch (German)', region: 'Jerman / Austria / Swiss', flag: '🇩🇪' },
    { code: 'es', name: 'Español (Spanish)', region: 'Spanyol & Amerika Latin', flag: '🇪🇸' },
  ];

  const cameraZoomPresets = [
    {
      label: 'Ultra Panorama (Sangat Luas)',
      value: 0.42,
      desc: 'Melihat seluruh kota dan open world dari ketinggian langit',
    },
    {
      label: 'Panorama Luas (80×80)',
      value: 0.6,
      desc: 'Melihat kawasan open world ekstra luas',
    },
    { label: 'Jauh / Luas', value: 0.75, desc: 'Melihat area sekitar lebih lebar' },
    { label: 'Standar Open World', value: 0.9, desc: 'Tampilan proporsional Simulasi' },
    { label: 'Fokus Karakter', value: 1.15, desc: 'Lebih dekat dengan avatar' },
    { label: 'Detail / Zoom In', value: 1.4, desc: 'Melihat ekspresi & tekstur dekat' },
  ];

  return (
    <div
      className="ui-modal-backdrop select-none"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="clay-panel landscape-compact-modal relative w-full max-w-3xl max-h-[min(92dvh,calc(100dvh-1rem))] flex flex-col overflow-hidden text-black">
        <div className="clay-modal-shell flex-1 min-h-0">
          {/* SIDEBAR KIRI: LOGO DI ATAS, TEKS DI BAWAH */}
          <aside className="clay-sidebar">
            <div className="clay-sidebar-brand">
              <Sliders className="w-5 h-5 text-black stroke-[2.5]" />
              <span className="clay-sidebar-title">PENGATURAN</span>
              <span className="clay-sidebar-subtitle">SISTEM GAME</span>
            </div>

            <div className="clay-sidebar-nav custom-scrollbar">
              {[
                { id: 'language', label: 'Bahasa', icon: Languages },
                { id: 'sound', label: 'Audio', icon: Volume2 },
                { id: 'graphics', label: 'Grafik', icon: Sparkles },
                { id: 'display', label: 'Tampilan', icon: ZoomIn },
                { id: 'controls', label: 'Kontrol', icon: Gamepad2 },
                { id: 'network', label: 'Jaringan', icon: Wifi },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveSection(tab.id as any);
                    }}
                    className={`clay-sidebar-btn ${
                      isActive ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5] shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="clay-sidebar-footer">
              <span className="clay-badge-neutral text-[9px] font-bold text-center py-0.5">
                RADEN v2.0
              </span>
            </div>
          </aside>

          {/* MAIN CONTENT PANE */}
          <div className="clay-main-pane flex-1 min-w-0 flex flex-col">
            <div className="clay-main-topbar flex items-center justify-between px-3.5 sm:px-4 py-2 border-b-2 border-[#5C3A21] bg-[#FFF8EA] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-bold uppercase text-black truncate">
                  {activeSection === 'language' && 'PILIHAN BAHASA DUNIA'}
                  {activeSection === 'sound' && 'AUDIO & EFEK SUARA'}
                  {activeSection === 'graphics' && 'KUALITAS GRAFIK & PERFORMA'}
                  {activeSection === 'display' && 'TAMPILAN & KAMERA'}
                  {activeSection === 'controls' && 'KONTROL PERMAINAN'}
                  {activeSection === 'network' && 'JARINGAN & MULTIPLAYER'}
                </span>
                <span className="clay-badge-secondary hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 text-black">
                  AKTIF
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
                title="Tutup Pengaturan"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="clay-main-body p-3.5 sm:p-5 overflow-y-auto space-y-3.5 custom-scrollbar flex-1 min-h-0">
          {/* TAB 1: BAHASA */}
          {activeSection === 'language' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-black uppercase">
                  Pilih Bahasa Dialog & Antarmuka:
                </label>
                <span className="clay-badge-secondary px-2 py-0.5 text-[10px] font-bold text-black">
                  Aktif: {settings.language.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {languagesList.map((lang) => {
                  const isSelected = settings.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`p-2.5 sm:p-3 text-left flex items-center justify-between gap-2 text-black ${
                        isSelected ? 'clay-btn-secondary' : 'clay-btn-neutral'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{lang.flag}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs uppercase text-black truncate">
                            {lang.name}
                          </div>
                          <div className="text-[10px] text-black truncate">{lang.region}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#FFAE6D] border-2 border-[#5C3A21] text-black flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & SUARA */}
          {activeSection === 'sound' && (
            <div className="space-y-3">
              {/* Master Mute Bar */}
              <div className="clay-card p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0 ${
                      settings.isMuted ? 'bg-[#FFAE6D]' : 'bg-[#A8E6CF]'
                    }`}
                  >
                    {settings.isMuted ? (
                      <VolumeX className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Volume2 className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black uppercase truncate">
                      Bisukan Seluruh Audio (Mute)
                    </div>
                    <div className="text-[10px] text-black truncate">
                      {settings.isMuted
                        ? 'Semua audio dinonaktifkan'
                        : 'Musik BGM dan Efek SFX aktif'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleMute}
                  className={`px-3 py-1.5 text-xs font-bold uppercase text-black shrink-0 ${
                    settings.isMuted ? 'clay-btn-primary' : 'clay-btn-secondary'
                  }`}
                >
                  {settings.isMuted ? 'MUTED' : 'ON'}
                </button>
              </div>

              {/* Slider Master Volume */}
              <div className="clay-card p-3 space-y-2">
                <div className="flex justify-between text-xs font-bold text-black">
                  <span className="uppercase">Volume Master</span>
                  <span>{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
                  className="w-full accent-[#FFAE6D] cursor-pointer h-2.5 bg-[#FFF8EA] border border-[#5C3A21] rounded-lg"
                />
              </div>

              {/* BGM Controller */}
              <div className="clay-card p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                      <Music className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-black uppercase flex items-center gap-1.5 flex-wrap">
                        <span>Musik Latar (BGM)</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 font-bold ${
                            isBgmPlaying ? 'clay-badge-secondary' : 'clay-badge-neutral'
                          }`}
                        >
                          {isBgmPlaying ? 'MEMUTAR' : 'JEDA'}
                        </span>
                      </div>
                      <div className="text-[10px] text-black truncate">RadenWorld Music.mp3</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.toggleBGM();
                      setIsBgmPlaying(sound.getIsBgmPlaying());
                    }}
                    className="clay-btn-primary px-3 py-1.5 text-black font-bold text-xs uppercase flex items-center gap-1.5 shrink-0"
                  >
                    {isBgmPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Jeda BGM</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Putar BGM</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-black">
                    <span className="text-[11px] uppercase">Volume BGM</span>
                    <span>{Math.round(settings.bgmVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.bgmVolume}
                    onChange={(e) => handleVolumeChange('bgmVolume', parseFloat(e.target.value))}
                    className="w-full accent-[#FFAE6D] cursor-pointer h-2.5 bg-[#FFF8EA] border border-[#5C3A21] rounded-lg"
                  />
                </div>
              </div>

              {/* Slider SFX */}
              <div className="clay-card p-3 space-y-2">
                <div className="flex justify-between text-xs font-bold text-black">
                  <span className="uppercase">Efek Suara (SFX)</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
                  className="w-full accent-[#FFAE6D] cursor-pointer h-2.5 bg-[#FFF8EA] border border-[#5C3A21] rounded-lg"
                />
              </div>

              {/* Uji Suara */}
              <div className="clay-card-secondary p-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-black">
                  Tes sampel efek audio Web Audio:
                </span>
                <button
                  type="button"
                  onClick={handleTestSoundChime}
                  className="clay-btn-primary px-3 py-1.5 text-black font-bold text-xs uppercase flex items-center gap-1.5 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Uji Suara</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: KUALITAS GRAFIK & PERFORMA */}
          {activeSection === 'graphics' && (
            <div className="space-y-3.5">
              {/* 1. PRESET KUALITAS CEPAT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Preset Kualitas Grafik:</span>
                  </label>
                  <span className="clay-badge-secondary px-2 py-0.5 text-[9.5px] font-bold text-black uppercase">
                    {graphicsQuality === 'high' && 'Tinggi (HD 60FPS)'}
                    {graphicsQuality === 'medium' && 'Sedang (Seimbang)'}
                    {graphicsQuality === 'low' && 'Rendah (Hemat Daya)'}
                    {graphicsQuality === 'custom' && 'Kustom'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'high',
                      title: 'TINGGI',
                      sub: 'Maksimal 60 FPS',
                      desc: '50 Pemain, Semua Efek & AA Aktif',
                    },
                    {
                      id: 'medium',
                      title: 'SEDANG',
                      sub: 'Seimbang HP',
                      desc: '25 Pemain, Efek & AA Aktif',
                    },
                    {
                      id: 'low',
                      title: 'HEMAT',
                      sub: 'Performa Ringan',
                      desc: '10 Pemain, Efek & AA OFF',
                    },
                  ].map((preset) => {
                    const isSelected = graphicsQuality === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectQualityPreset(preset.id as any)}
                        className={`p-2.5 text-center flex flex-col items-center justify-between gap-1 text-black ${
                          isSelected ? 'clay-btn-primary' : 'clay-btn-neutral'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold text-[11px] uppercase">
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{preset.title}</span>
                        </div>
                        <span className="text-[9px] font-bold opacity-80 leading-none">
                          {preset.sub}
                        </span>
                        <span className="text-[8px] opacity-70 leading-tight mt-0.5">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. BATASI USER / PEMAIN TERLIHAT DI SERVER */}
              <div className="clay-card p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-black uppercase">
                        Batas Pemain Terlihat di Layar
                      </div>
                      <div className="text-[10px] text-black/75">
                        Memprioritaskan pemain terdekat untuk menghemat baterai & CPU
                      </div>
                    </div>
                  </div>
                  <span className="clay-badge-primary px-2 py-0.5 text-xs font-bold text-black shrink-0">
                    {maxVisiblePlayers === 0
                      ? 'Hanya Diri Sendiri (0)'
                      : maxVisiblePlayers >= 50
                      ? 'Semua (Maks 50)'
                      : `${maxVisiblePlayers} Pemain Terdekat`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                  {[
                    { count: 50, label: 'Semua (50)', desc: 'Penuh' },
                    { count: 25, label: '25 Pemain', desc: 'Standar' },
                    { count: 15, label: '15 Pemain', desc: 'Hemat' },
                    { count: 5, label: '5 Pemain', desc: 'Sangat Ringan' },
                    { count: 0, label: 'Solo (0)', desc: 'Paling Ringan' },
                  ].map((item) => {
                    const isSelected = maxVisiblePlayers === item.count;
                    return (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => handleMaxVisiblePlayersChange(item.count)}
                        className={`p-1.5 flex flex-col items-center justify-center text-center text-black ${
                          isSelected ? 'clay-btn-secondary' : 'clay-btn-neutral'
                        }`}
                      >
                        <span className="text-[10.5px] font-bold leading-tight">{item.label}</span>
                        <span className="text-[8px] opacity-75 mt-0.5 leading-none">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. AKTIF/NONAKTIF EFEK GERAKAN (LARI, LOMPAT, DEBU) */}
              <div className="clay-card p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                    <Wind className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black uppercase flex items-center gap-1.5 flex-wrap">
                      <span>Efek Gerakan (Lari, Lompat & Debu)</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 font-bold ${
                          enableMovementEffects ? 'clay-badge-secondary' : 'clay-badge-neutral'
                        }`}
                      >
                        {enableMovementEffects ? 'AKTIF (60 FPS)' : 'HEMAT DAYA (OFF)'}
                      </span>
                    </div>
                    <div className="text-[10px] text-black/75">
                      Animasi kepulan debu lari (sprint dust), riak pendaratan lompat, dan efek sentuhan
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMovementEffects}
                  className={`px-3 py-1.5 text-xs font-bold uppercase shrink-0 ${
                    enableMovementEffects ? 'clay-btn-primary' : 'clay-btn-neutral'
                  }`}
                >
                  {enableMovementEffects ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>

              {/* 4. AKTIF/NONAKTIF ANTI-ALIASING */}
              <div className="clay-card p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                    <Cpu className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black uppercase flex items-center gap-1.5 flex-wrap">
                      <span>Anti-Aliasing (Penghalusan Tepi)</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 font-bold ${
                          enableAntiAliasing ? 'clay-badge-secondary' : 'clay-badge-neutral'
                        }`}
                      >
                        {enableAntiAliasing ? 'AKTIF (HALUS HD)' : 'RETRO PIXEL (OFF)'}
                      </span>
                    </div>
                    <div className="text-[10px] text-black/75">
                      Menghaluskan sudut grafis WebGL & kanvas. Nonaktifkan untuk tampilan tajam retro dan hemat GPU
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAntiAliasing}
                  className={`px-3 py-1.5 text-xs font-bold uppercase shrink-0 ${
                    enableAntiAliasing ? 'clay-btn-primary' : 'clay-btn-neutral'
                  }`}
                >
                  {enableAntiAliasing ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TAMPILAN & KAMERA */}
          {activeSection === 'display' && (
            <div className="space-y-3.5">
              {/* 1. BATAS ZOOM MINIMAL (PANORAMA JAUH) */}
              <div className="clay-card p-3 space-y-2 text-black">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                      <ZoomOut className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase">Batas Zoom Minimal (Panorama Jauh)</div>
                      <div className="text-[10px] text-black/75">
                        Jarak pandang terjauh saat zoom-out (melihat area map lebih luas)
                      </div>
                    </div>
                  </div>
                  <span className="clay-badge-primary px-2 py-0.5 text-xs font-bold">
                    {minCameraZoom.toFixed(2)}x ({Math.round(minCameraZoom * 100)}%)
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <input
                    type="range"
                    min="0.25"
                    max="0.65"
                    step="0.01"
                    value={minCameraZoom}
                    onChange={(e) => handleMinZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-[#FFAE6D] cursor-pointer h-2.5 bg-[#FFF8EA] border border-[#5C3A21] rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-black/70">
                    <span>0.25x (Super Luas)</span>
                    <span>0.38x (Rekomendasi)</span>
                    <span>0.65x (Sedang)</span>
                  </div>
                </div>

                <div className="flex gap-1.5 pt-0.5">
                  {[
                    { val: 0.30, label: '0.30x (Ultra Panorama)' },
                    { val: 0.38, label: '0.38x (Standar HD)' },
                    { val: 0.50, label: '0.50x (Sedang)' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => handleMinZoomChange(p.val)}
                      className={`px-2 py-1 text-[9.5px] font-bold flex-1 ${
                        Math.abs(minCameraZoom - p.val) < 0.03 ? 'clay-btn-secondary' : 'clay-btn-neutral'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. BATAS ZOOM MAKSIMAL (CLOSE-UP DETAIL) */}
              <div className="clay-card p-3 space-y-2 text-black">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                      <ZoomIn className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase">Batas Zoom Maksimal (Close-up Karakter)</div>
                      <div className="text-[10px] text-black/75">
                        Jarak pandang terdekat saat zoom-in (melihat detail busana & ekspresi)
                      </div>
                    </div>
                  </div>
                  <span className="clay-badge-secondary px-2 py-0.5 text-xs font-bold">
                    {maxCameraZoom.toFixed(2)}x ({Math.round(maxCameraZoom * 100)}%)
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <input
                    type="range"
                    min="1.20"
                    max="3.00"
                    step="0.05"
                    value={maxCameraZoom}
                    onChange={(e) => handleMaxZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-[#FFAE6D] cursor-pointer h-2.5 bg-[#FFF8EA] border border-[#5C3A21] rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-black/70">
                    <span>1.20x (Standar)</span>
                    <span>2.00x (Close-up)</span>
                    <span>3.00x (Ultra Detail)</span>
                  </div>
                </div>

                <div className="flex gap-1.5 pt-0.5">
                  {[
                    { val: 1.50, label: '1.50x (Standar)' },
                    { val: 2.00, label: '2.00x (Close-up)' },
                    { val: 2.50, label: '2.50x (Ultra Detail)' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => handleMaxZoomChange(p.val)}
                      className={`px-2 py-1 text-[9.5px] font-bold flex-1 ${
                        Math.abs(maxCameraZoom - p.val) < 0.05 ? 'clay-btn-secondary' : 'clay-btn-neutral'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. JARAK PANDANG SAAT INI (CURRENT ZOOM PRESET) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-black uppercase">
                    Jarak Pandang Kamera Saat Ini:
                  </label>
                  <span className="clay-badge-primary px-2 py-0.5 text-xs font-bold text-black">
                    {Math.round(currentCameraZoom * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 0.50, label: '50% (Panorama)' },
                    { val: 0.75, label: '75% (Luas)' },
                    { val: 1.00, label: '100% (Standar)' },
                    { val: 1.30, label: '130% (Dekat)' },
                  ].map((p) => {
                    const isSelected = Math.abs(currentCameraZoom - p.val) < 0.06;
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => handleZoomChange(p.val)}
                        className={`p-2 text-center text-xs font-bold text-black ${
                          isSelected ? 'clay-btn-secondary' : 'clay-btn-neutral'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. KEHALUSAN PERGERAKAN KAMERA (CAMERA SMOOTHING LERP) */}
              <div className="clay-card p-3 space-y-2 text-black">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase">Kehalusan Gerak Kamera:</span>
                  <span className="clay-badge-secondary px-2 py-0.5 text-[10px] font-bold uppercase">
                    {cameraSmoothingSpeed === 'fast' && 'Responsif Cepat'}
                    {cameraSmoothingSpeed === 'normal' && 'Seimbang Mulus'}
                    {cameraSmoothingSpeed === 'cinematic' && 'Sinematik Lembut'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fast', label: 'Cepat', desc: 'Instan mengikuti' },
                    { id: 'normal', label: 'Seimbang', desc: 'Standar 60 FPS' },
                    { id: 'cinematic', label: 'Sinematik', desc: 'Lembut dramatis' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSmoothingChange(item.id as any)}
                      className={`p-2 text-center text-black flex flex-col items-center justify-center ${
                        cameraSmoothingSpeed === item.id ? 'clay-btn-primary' : 'clay-btn-neutral'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase">{item.label}</span>
                      <span className="text-[8px] opacity-75 mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. FULLSCREEN & RESET KAMERA */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="clay-btn-neutral flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold text-black uppercase"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 stroke-[2.5]" /> : <Maximize2 className="w-4 h-4 stroke-[2.5]" />}
                  <span>{isFullscreen ? 'Keluar Fullscreen' : 'Masuk Fullscreen'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetCamera}
                  className="clay-btn-secondary py-2.5 px-4 flex items-center justify-center gap-1.5 text-xs font-bold text-black uppercase shrink-0"
                  title="Kembalikan zoom & limit kamera ke rekomendasi standar"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>Reset Kamera</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: KONTROL */}
          {activeSection === 'controls' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-black uppercase block">
                  Pilih Mode Navigasi Karakter:
                </label>
                {settings.controlMode === 'pc' && (
                  <button
                    type="button"
                    onClick={handleResetKeybindings}
                    className="clay-btn-neutral px-2.5 py-1 text-[10px] font-bold text-black flex items-center gap-1.5"
                    title="Kembalikan seluruh tombol pintas keyboard ke pengaturan awal pabrik"
                  >
                    <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                    <span>Reset Default</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleControlModeChange('pc')}
                  className={`p-3 text-left flex flex-col gap-1 text-black ${
                    settings.controlMode === 'pc' ? 'clay-btn-secondary' : 'clay-btn-neutral'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-xs font-bold uppercase">Mode PC / Laptop</span>
                    </div>
                    {settings.controlMode === 'pc' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-black/80 leading-snug">
                    Keyboard <strong>WASD / Tombol Kustom</strong> & <strong>Klik Mouse</strong>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleControlModeChange('mobile')}
                  className={`p-3 text-left flex flex-col gap-1 text-black ${
                    settings.controlMode === 'mobile' ? 'clay-btn-secondary' : 'clay-btn-neutral'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-xs font-bold uppercase">Mode Layar Sentuh</span>
                    </div>
                    {settings.controlMode === 'mobile' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-black/80 leading-snug">
                    <strong>Analog Joystick 360°</strong> & tombol sentuh virtual di layar.
                  </p>
                </button>
              </div>

              {/* JIKA MODE PC: DAFTAR LENGKAP TOMBOL PINTAS DENGAN EDIT / REBIND */}
              {settings.controlMode === 'pc' ? (
                <div className="space-y-3">
                  {/* Banner Notifikasi Saat Sedang Menunggu Input Tombol Baru */}
                  {editingActionId && (
                    <div className="clay-card-secondary p-3 flex items-center justify-between gap-2 border-2 border-[#5C3A21] bg-[#FFAE6D]/30 animate-pulse">
                      <div className="flex items-center gap-2 min-w-0">
                        <Keyboard className="w-5 h-5 stroke-[2.5] text-black shrink-0" />
                        <div className="min-w-0 text-black">
                          <div className="text-xs font-bold uppercase truncate">
                            Mengganti Tombol: {KEYBINDING_METADATA[editingActionId]?.label}
                          </div>
                          <div className="text-[10px] text-black/80">
                            Tekan tombol apa pun pada keyboard Anda sekarang...
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingActionId(null)}
                        className="clay-btn-neutral px-2.5 py-1 text-[10px] font-bold text-black uppercase shrink-0"
                      >
                        Batal (Esc)
                      </button>
                    </div>
                  )}

                  {/* DAFTAR KATEGORI SHORTCUT */}
                  {[
                    {
                      title: 'Pergerakan Karakter',
                      actions: ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'sprint', 'jump'],
                    },
                    {
                      title: 'Aksi & Interaksi Dunia',
                      actions: ['interact', 'fish', 'backpack', 'map'],
                    },
                    {
                      title: 'Komunikasi & Kamera',
                      actions: ['chat', 'emote', 'zoomIn', 'zoomOut'],
                    },
                    {
                      title: 'Slot Cepat Hotbar (1 - 6)',
                      actions: ['hotbar1', 'hotbar2', 'hotbar3', 'hotbar4', 'hotbar5', 'hotbar6'],
                    },
                  ].map((category) => (
                    <div key={category.title} className="clay-card p-3 space-y-2 text-black">
                      <div className="text-xs font-bold uppercase text-[#5C3A21] flex items-center justify-between">
                        <span>{category.title}</span>
                        <span className="text-[9px] font-normal text-black/60">Klik tombol untuk ganti</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {category.actions.map((actId) => {
                          const meta = KEYBINDING_METADATA[actId];
                          const boundKey = keybindings[actId] || DEFAULT_PC_KEYBINDINGS[actId] || '?';
                          const isEditingThis = editingActionId === actId;

                          return (
                            <div
                              key={actId}
                              className={`p-2 rounded-lg border-2 border-[#5C3A21] flex items-center justify-between gap-2 transition-all ${
                                isEditingThis
                                  ? 'bg-[#FFAE6D] shadow-inner'
                                  : 'bg-[#FFFDF7] hover:bg-[#FFF8EA]'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold text-black truncate">{meta?.label}</div>
                                <div className="text-[9px] text-black/70 truncate">{meta?.desc}</div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleStartRebind(actId)}
                                className={`px-2.5 py-1 text-[10.5px] font-bold uppercase rounded border border-[#5C3A21] shrink-0 transition-all ${
                                  isEditingThis
                                    ? 'bg-[#FFF8EA] text-black animate-bounce shadow-md'
                                    : 'clay-btn-neutral'
                                }`}
                                title="Klik untuk mengganti shortcut ini"
                              >
                                {isEditingThis ? 'Tekan...' : `[ ${boundKey} ]`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* JIKA MODE MOBILE */
                <div className="space-y-3">
                  <div className="clay-card-secondary p-3.5 space-y-2.5 text-black">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 stroke-[2.5]" />
                        <span className="font-bold uppercase text-xs">
                          Kustomisasi Posisi & Skala Kontrol:
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetControlsLayout}
                        className="clay-btn-neutral px-2.5 py-1 text-[10px] font-bold text-black flex items-center gap-1"
                        title="Kembalikan posisi & skala kontrol virtual ke standar"
                      >
                        <RefreshCw className="w-3 h-3 stroke-[2.5]" />
                        <span>Reset Standar</span>
                      </button>
                    </div>

                    <p className="text-[11px] leading-snug">
                      Geser analog & setiap tombol langsung dengan jari di layar game, serta atur
                      ukurannya sesuai kenyamanan tanganmu.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        handleControlModeChange('mobile');
                        onClose();
                        setTimeout(() => {
                          EventBus.emit('open-controls-layout-editor');
                        }, 120);
                      }}
                      className="clay-btn-primary w-full py-2.5 px-4 text-black font-bold text-xs uppercase flex items-center justify-center gap-2"
                    >
                      <Move className="w-4 h-4 stroke-[2.5]" />
                      <span>Buka Pengatur Kontrol di Layar</span>
                    </button>
                  </div>

                  <div className="clay-card p-3 text-xs space-y-1.5 text-black">
                    <span className="font-bold uppercase text-[11px] block">
                      Panduan Kontrol Layar Sentuh:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      <div>• Analog Kiri : Gerak 360° Mulus</div>
                      <div>• Tap Lantai : Navigasi Otomatis</div>
                      <div>• Tombol AKSI : Bicara & Pintu</div>
                      <div>• Tombol CHAT : Buka Obrolan</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: JARINGAN, SERVER & MONITOR FPS HP/PC */}
          {activeSection === 'network' && (
            <div className="space-y-3.5">
              {/* 1. CEK SINYAL SERVER & LATENSI */}
              <div className="clay-card p-3 space-y-2.5 text-black">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                      <Radio className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase truncate">
                        Sinyal Server & Latensi Multiplayer
                      </div>
                      <div className="text-[10px] text-black/75 truncate">{currentSocketUrl}</div>
                    </div>
                  </div>

                  {/* 4-BAR INDIKATOR SINYAL GRAFIS */}
                  <div className="flex items-end gap-1 h-5 px-2 py-1 bg-[#FFFDF7] rounded border border-[#5C3A21]/30 shrink-0">
                    {[1, 2, 3, 4].map((bar) => {
                      const pingVal = activePing ?? 999;
                      const isLit =
                        isSocketConnected &&
                        (bar === 1 ||
                          (bar === 2 && pingVal < 250) ||
                          (bar === 3 && pingVal < 120) ||
                          (bar === 4 && pingVal < 60));

                      const barColor =
                        pingVal < 60
                          ? 'bg-[#A8E6CF]'
                          : pingVal < 150
                          ? 'bg-[#FFAE6D]'
                          : 'bg-[#FF8B8B]';

                      return (
                        <div
                          key={bar}
                          style={{ height: `${bar * 25}%` }}
                          className={`w-1.5 rounded-sm transition-all ${
                            isLit ? `${barColor} border border-[#5C3A21]` : 'bg-black/15'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Status Server</div>
                    <div className="text-xs font-bold text-black mt-0.5 flex items-center justify-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSocketConnected ? 'bg-green-600' : 'bg-red-500'
                        }`}
                      />
                      <span>{isSocketConnected ? 'ONLINE' : 'TERPUTUS'}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Ping Latensi</div>
                    <div className="text-xs font-bold text-black mt-0.5">
                      {activePing !== null ? `${activePing} ms` : 'Mengukur...'}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-2 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={measureLivePing}
                      disabled={isTestingPing}
                      className="clay-btn-secondary w-full py-1 text-[10px] font-bold uppercase flex items-center justify-center gap-1 text-black"
                    >
                      <Activity className={`w-3 h-3 stroke-[2.5] ${isTestingPing ? 'animate-spin' : ''}`} />
                      <span>{isTestingPing ? 'Menguji...' : 'Uji Sinyal'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. CEK SINYAL WI-FI & KONEKSI SENDIRI */}
              <div className="clay-card p-3 space-y-2 text-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                    <Wifi className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase">Sinyal Wi-Fi / Koneksi Internet Sendiri</div>
                    <div className="text-[10px] text-black/75">
                      Informasi bandwidth dan stabilitas jaringan yang sedang digunakan perangkat Anda
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Tipe Jaringan</div>
                    <div className="text-[11px] font-bold text-black mt-0.5 truncate">
                      {connectionDetails.effectiveType}
                    </div>
                  </div>

                  <div className="p-2 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Kecepatan Unduh</div>
                    <div className="text-[11px] font-bold text-black mt-0.5 truncate">
                      {connectionDetails.downlink}
                    </div>
                  </div>

                  <div className="p-2 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">RTT Lokal</div>
                    <div className="text-[11px] font-bold text-black mt-0.5 truncate">
                      {connectionDetails.rtt}
                    </div>
                  </div>

                  <div className="p-2 bg-[#FFFDF7] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Status Internet</div>
                    <div className="text-[11px] font-bold text-green-700 mt-0.5 truncate">
                      {connectionDetails.isOnline ? 'TERHUBUNG' : 'OFFLINE'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CEK FPS HP/PC & DIAGNOSTIK HARDWARE */}
              <div className="clay-card-secondary p-3 space-y-2 text-black border-2 border-[#5C3A21]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                      <Gauge className="w-4 h-4 stroke-[2.5] text-[#FFAE6D]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase">Monitor FPS & Performa Perangkat</div>
                      <div className="text-[10px] text-black/75">
                        Pengukuran laju bingkai render real-time dan kapasitas gawai
                      </div>
                    </div>
                  </div>

                  <div className="clay-badge-primary px-3 py-1 text-sm font-bold flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-ping" />
                    <span>{liveFps} FPS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2 bg-[#FFF8EA] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Frame Time</div>
                    <div className="text-[11px] font-bold text-black mt-0.5">{frameTimeMs} ms</div>
                  </div>

                  <div className="p-2 bg-[#FFF8EA] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">CPU Cores</div>
                    <div className="text-[11px] font-bold text-black mt-0.5">{deviceStats.cores} Processors</div>
                  </div>

                  <div className="p-2 bg-[#FFF8EA] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Memori RAM</div>
                    <div className="text-[11px] font-bold text-black mt-0.5">{deviceStats.memory || 'Standar'}</div>
                  </div>

                  <div className="p-2 bg-[#FFF8EA] rounded-lg border border-[#5C3A21]/30">
                    <div className="text-[9px] font-bold opacity-75 uppercase">Baterai Gawai</div>
                    <div className="text-[11px] font-bold text-black mt-0.5 flex items-center justify-center gap-1">
                      {deviceStats.isCharging ? (
                        <BatteryCharging className="w-3.5 h-3.5 text-green-700 stroke-[2.5]" />
                      ) : (
                        <Battery className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>
                        {typeof deviceStats.batteryLevel === 'number'
                          ? `${deviceStats.batteryLevel}%`
                          : 'Tersedia'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. PINDAH REALM SERVER & TAUTAN LAN */}
              {onOpenServerModal && (
                <div className="clay-card p-3 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                      <Server className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-black uppercase">
                        Pilih & Pindah Realm Server
                      </div>
                      <div className="text-[10px] text-black">
                        Pindah ke realm Asia, Nusantara, Global, atau server Wi-Fi teman
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onOpenServerModal();
                    }}
                    className="clay-btn-primary px-3.5 py-1.5 text-black font-bold text-xs uppercase shrink-0"
                  >
                    Buka Daftar Server
                  </button>
                </div>
              )}

              <div className="clay-card p-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-black uppercase">
                    Tautan Akses Wi-Fi / LAN
                  </div>
                  <div className="text-[10px] text-black truncate">
                    {window.location.protocol}//{window.location.hostname}
                    {window.location.port ? `:${window.location.port}` : ''}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="clay-btn-secondary px-3 py-1.5 text-black text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{copiedLink ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>

              <div className="clay-card p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Override Host IP Server Manual</span>
                  </label>
                  <span className="text-[10px] font-bold text-black">
                    Otomatis: {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={customHost}
                    onChange={(e) => setCustomHost(e.target.value)}
                    placeholder={`Contoh: ${
                      typeof window !== 'undefined' ? window.location.hostname : '192.168.1.5'
                    }`}
                    className="clay-input flex-1 px-3 py-2 text-xs text-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      networkMgr.setCustomHost(customHost);
                    }}
                    className="clay-btn-primary px-3.5 py-2 text-black font-bold text-xs uppercase shrink-0"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="px-4 sm:px-5 py-2.5 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="text-[10px] sm:text-[11px] font-bold text-black truncate">
                RadenWorld Engine • Client Build 2026
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="clay-btn-primary px-4 py-1.5 font-bold text-xs text-black shrink-0"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
