import React, { useState } from 'react';
import { CharacterClass } from '../types';
import { Shield, Sparkles, Compass, Swords, Users, Globe } from 'lucide-react';

interface LobbyModalProps {
  onJoin: (name: string, characterClass: CharacterClass) => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState<CharacterClass>('warrior');

  const classes: { id: CharacterClass; name: string; desc: string; icon: any; color: string; border: string }[] = [
    {
      id: 'warrior',
      name: 'Ksatria (Warrior)',
      desc: 'Pertahanan kokoh, armor baja dengan pedang ksatria.',
      icon: Shield,
      color: 'from-blue-600/30 to-blue-900/30 text-blue-400',
      border: 'border-blue-500/50',
    },
    {
      id: 'mage',
      name: 'Penyihir (Mage)',
      desc: 'Ahli mantra sihir misterius dengan kekuatan elemen.',
      icon: Sparkles,
      color: 'from-purple-600/30 to-purple-900/30 text-purple-400',
      border: 'border-purple-500/50',
    },
    {
      id: 'ranger',
      name: 'Pengelana (Ranger)',
      desc: 'Cepat & lincah, penjaga hutan dan pengintai ulung.',
      icon: Compass,
      color: 'from-emerald-600/30 to-emerald-900/30 text-emerald-400',
      border: 'border-emerald-500/50',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Adventurer_${Math.floor(1000 + Math.random() * 9000)}`;
    onJoin(finalName, characterClass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            2D Open World RPG • Multiplayer
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            RadenWorld
          </h1>
          <p className="text-sm text-slate-400">
            Jelajahi dunia 2D yang luas bersama pemain lain secara real-time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Player Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Nama Karakter
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: RadenAria, AryaWiguna..."
              maxLength={18}
              className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-cyan-400" />
              Pilih Role Karakter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {classes.map((c) => {
                const Icon = c.icon;
                const isSelected = characterClass === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCharacterClass(c.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-b ${c.color} ${c.border} ring-2 ring-cyan-400/40 shadow-lg`
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">{c.name.split(' ')[0]}</div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{c.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Masuk ke Open World ➔
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-4 flex items-center justify-center gap-4">
          <span>Backend: Laravel 12</span>
          <span>•</span>
          <span>Engine: Phaser 3 + HTML5</span>
          <span>•</span>
          <span>UI: React 19</span>
        </div>
      </div>
    </div>
  );
};
