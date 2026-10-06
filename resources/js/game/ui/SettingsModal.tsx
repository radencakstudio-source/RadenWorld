/**
 * ============================================================================
 * FILE: resources/js/game/ui/SettingsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Pengaturan komprehensif untuk game RadenWorld.
 * Menyediakan:
 * 1. Pilihan Bahasa (Bahasa Indonesia, English, Sunda, Jawa)
 * 2. Pengaturan Audio/Suara (Master Volume, BGM, SFX, dan Mute toggle)
 * 3. Pengaturan Layout Tombol Kontrol:
 *    - Mode PC: Keyboard WASD + Tombol Panah
 *    - Mode Mobile: Virtual Touch Joystick & Tombol Aksi di Layar Sentuh
 * 4. Pengaturan Layar Penuh (Fullscreen)
 * ============================================================================
 */

import React, { useState } from 'react';
import { SoundManager } from '../core/SoundManager';
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
  Sliders,
} from 'lucide-react';

export type LanguageCode = 'id' | 'en' | 'su' | 'jv';
export type ControlMode = 'pc' | 'mobile';

export interface GameSettings {
  language: LanguageCode;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  controlMode: ControlMode;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeSection, setActiveSection] = useState<'language' | 'sound' | 'controls'>('language');
  const sound = SoundManager.getInstance();

  if (!isOpen) return null;

  const handleLanguageChange = (code: LanguageCode) => {
    sound.playClick();
    onUpdateSettings({ ...settings, language: code });
  };

  const handleControlModeChange = (mode: ControlMode) => {
    sound.playClick();
    onUpdateSettings({ ...settings, controlMode: mode });
  };

  const handleVolumeChange = (field: 'masterVolume' | 'bgmVolume' | 'sfxVolume', value: number) => {
    const updated = { ...settings, [field]: value };
    onUpdateSettings(updated);
    sound.setVolume(updated.masterVolume, updated.sfxVolume);
    sound.playClick();
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

  const languagesList: { code: LanguageCode; name: string; region: string }[] = [
    { code: 'id', name: 'Bahasa Indonesia', region: 'Indonesia (Utama)' },
    { code: 'en', name: 'English', region: 'International' },
    { code: 'su', name: 'Basa Sunda', region: 'Jawa Barat' },
    { code: 'jv', name: 'Basa Jawa', region: 'Jawa Tengah & Timur' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pengaturan Game (Settings)</h2>
              <p className="text-xs text-slate-400">Sesuaikan bahasa, audio, dan tata letak kontrol tombol.</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSection('language');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === 'language'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Pilihan Bahasa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSection('sound');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === 'sound'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Suara & Audio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSection('controls');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === 'controls'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Kontrol Tombol</span>
          </button>
        </div>

        {/* Tab 1: Bahasa (Language) */}
        {activeSection === 'language' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pilih Bahasa Tampilan Game:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {languagesList.map((lang) => {
                const isSelected = settings.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white ring-2 ring-purple-500/30 shadow-lg'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{lang.name}</div>
                      <div className="text-[10px] text-slate-400">{lang.region}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Suara (Audio) */}
        {activeSection === 'sound' && (
          <div className="space-y-4">
            {/* Master Mute Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2">
                {settings.isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">Bisukan Seluruh Audio (Mute)</div>
                  <div className="text-[10px] text-slate-400">Nonaktifkan semua musik dan efek suara</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleMute}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.isMuted
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {settings.isMuted ? 'Muted' : 'Aktif'}
              </button>
            </div>

            {/* Master Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Master Volume</span>
                <span className="text-purple-400 font-mono">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* BGM Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Musik Latar (BGM)</span>
                <span className="text-purple-400 font-mono">{Math.round(settings.bgmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.bgmVolume}
                onChange={(e) => handleVolumeChange('bgmVolume', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* SFX Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Efek Suara (SFX)</span>
                <span className="text-purple-400 font-mono">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Kontrol Tombol (Button PC vs Mobile) */}
        {activeSection === 'controls' && (
          <div className="space-y-3.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pilih Mode Perangkat & Tata Letak Tombol:
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* PC Mode Button */}
              <button
                type="button"
                onClick={() => handleControlModeChange('pc')}
                className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                  settings.controlMode === 'pc'
                    ? 'bg-purple-950/40 border-purple-500 text-white ring-2 ring-purple-500/30 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Monitor className="w-6 h-6 text-cyan-400" />
                  {settings.controlMode === 'pc' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500 text-slate-950">
                      Aktif
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Mode PC (Desktop)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Menggunakan keyboard <strong>WASD / Tombol Panah</strong> dan interaksi klik mouse.
                  </div>
                </div>
              </button>

              {/* Mobile Mode Button */}
              <button
                type="button"
                onClick={() => handleControlModeChange('mobile')}
                className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                  settings.controlMode === 'mobile'
                    ? 'bg-purple-950/40 border-purple-500 text-white ring-2 ring-purple-500/30 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                  {settings.controlMode === 'mobile' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500 text-slate-950">
                      Aktif
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Mode Mobile (HP)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Menampilkan <strong>Virtual D-Pad Joystick</strong> & tombol aksi interaktif di layar sentuh.
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>Toggle Mode Layar Penuh (Fullscreen)</span>
            </button>
          </div>
        )}

        {/* Footer save/close button */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
