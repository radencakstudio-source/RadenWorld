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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-black border border-neutral-800 rounded-2xl p-4 sm:p-6 md:p-8 text-neutral-100 flex flex-col gap-4 sm:gap-6 relative overflow-hidden max-h-[94dvh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            2D Open World RPG • Multiplayer
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Raden<span className="text-amber-400">World</span>
          </h1>
          <p className="text-sm text-neutral-400">
            Jelajahi dunia 2D yang luas bersama pemain lain secara real-time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Player Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Nama Karakter
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: RadenAria, AryaWiguna..."
              maxLength={18}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
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
                        ? 'bg-neutral-900 border-amber-400 text-amber-300'
                        : 'bg-[#0e0e0e] border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-neutral-100">{c.name.split(' ')[0]}</div>
                      <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">{c.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all cursor-pointer border border-amber-400"
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
