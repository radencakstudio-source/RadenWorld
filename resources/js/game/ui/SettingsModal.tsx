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
  Activity,
  Play,
  Pause,
  Music,
  Move,
} from 'lucide-react';

export type LanguageCode = 'id' | 'en' | 'zh' | 'ja' | 'ko' | 'ar' | 'fr' | 'ru' | 'de' | 'es';
export type ControlMode = 'pc' | 'mobile';

export interface GameSettings {
  language: LanguageCode;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  controlMode: ControlMode;
  cameraZoom?: number;
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
    'language' | 'sound' | 'display' | 'controls' | 'network'
  >('language');
  const sound = SoundManager.getInstance();
  const networkMgr = NetworkManager.getInstance();

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

          {/* TAB 3: TAMPILAN & KAMERA */}
          {activeSection === 'display' && (
            <div className="space-y-3.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-black uppercase">
                    Jarak Pandang Kamera (Zoom):
                  </label>
                  <span className="clay-badge-primary px-2 py-0.5 text-xs font-bold text-black">
                    {Math.round(currentCameraZoom * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cameraZoomPresets.map((preset) => {
                    const isSelected = Math.abs(currentCameraZoom - preset.value) < 0.08;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleZoomChange(preset.value)}
                        className={`p-3 text-left flex flex-col justify-between text-black ${
                          isSelected ? 'clay-btn-secondary' : 'clay-btn-neutral'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="text-xs font-bold uppercase text-black">
                            {preset.label}
                          </span>
                          <span className="clay-badge-primary px-1.5 py-0.5 text-[10px] font-bold text-black shrink-0">
                            {preset.value}x
                          </span>
                        </div>
                        <p className="text-[10px] text-black mt-1 leading-snug">{preset.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fullscreen */}
              <div className="clay-card p-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Maximize2 className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black uppercase flex items-center gap-1.5 flex-wrap">
                      <span>Layar Penuh (Fullscreen)</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 font-bold ${
                          isFullscreen ? 'clay-badge-secondary' : 'clay-badge-neutral'
                        }`}
                      >
                        {isFullscreen ? 'AKTIF' : 'JENDELA'}
                      </span>
                    </div>
                    <div className="text-[10px] text-black">
                      Meningkatkan fokus dan imersi visual permainan
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="clay-btn-primary px-3.5 py-1.5 text-black font-bold text-xs uppercase shrink-0"
                >
                  {isFullscreen ? 'Keluar Fullscreen' : 'Masuk Fullscreen'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: KONTROL */}
          {activeSection === 'controls' && (
            <div className="space-y-3.5">
              <label className="text-xs font-bold text-black uppercase block">
                Pilih Mode Navigasi Karakter:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleControlModeChange('pc')}
                  className={`p-3.5 text-left flex flex-col gap-2 text-black ${
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
                  <p className="text-[11px] leading-snug">
                    Navigasi keyboard <strong>WASD / Panah</strong> dan{' '}
                    <strong>Klik Mouse (Tap-to-move)</strong>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleControlModeChange('mobile')}
                  className={`p-3.5 text-left flex flex-col gap-2 text-black ${
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
                  <p className="text-[11px] leading-snug">
                    Menampilkan <strong>Analog Joystick 360°</strong> dan tombol aksi sentuh di
                    layar.
                  </p>
                </button>
              </div>

              {settings.controlMode === 'pc' ? (
                <div className="clay-card p-3 text-xs space-y-2 text-black">
                  <span className="font-bold uppercase text-[11px] block">
                    Daftar Tombol Pintas PC:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div>• WASD / Panah : Bergerak</div>
                    <div>• Klik Kiri : Point & Move</div>
                    <div>• E : Interaksi Objek / Pintu</div>
                    <div>• / (Slash) : Buka Chat Box</div>
                    <div>• Scroll Mouse : Zoom Kamera</div>
                    <div>• B / M : Tas / Peta Dunia</div>
                  </div>
                </div>
              ) : (
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

          {/* TAB 5: JARINGAN & SERVER */}
          {activeSection === 'network' && (
            <div className="space-y-3">
              <div className="clay-card p-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full border-2 border-[#5C3A21] shrink-0 ${
                      isSocketConnected ? 'bg-[#A8E6CF]' : 'bg-[#FFAE6D]'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black uppercase truncate">
                      {isSocketConnected
                        ? 'Terhubung ke Multiplayer Server'
                        : 'Server Socket Terputus'}
                    </div>
                    <div className="text-[11px] text-black truncate">{currentSocketUrl}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={measureLivePing}
                  disabled={isTestingPing}
                  className="clay-btn-secondary px-3 py-1.5 text-black text-[11px] font-bold uppercase flex items-center gap-1.5 shrink-0"
                  title="Uji Ping"
                >
                  <Activity
                    className={`w-3.5 h-3.5 stroke-[2.5] ${isTestingPing ? 'animate-spin' : ''}`}
                  />
                  <span>{activePing !== null ? `${activePing} ms` : 'Uji Ping'}</span>
                </button>
              </div>

              {onOpenServerModal && (
                <div className="clay-card p-3 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
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
                    className="clay-btn-primary px-3.5 py-2 text-black font-bold text-xs uppercase shrink-0"
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
