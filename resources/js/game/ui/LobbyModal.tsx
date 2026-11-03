import React, { useState } from 'react';
import { CharacterClass } from '../types';
import { Shield, Sparkles, Compass, Swords, Users, Globe } from 'lucide-react';

interface LobbyModalProps {
  onJoin: (name: string, characterClass: CharacterClass) => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState<CharacterClass>('warrior');

  const classes: { id: CharacterClass; name: string; desc: string; icon: any }[] = [
    {
      id: 'warrior',
      name: 'Ksatria (Warrior)',
      desc: 'Pertahanan kokoh, armor baja dengan pedang ksatria.',
      icon: Shield,
    },
    {
      id: 'mage',
      name: 'Penyihir (Mage)',
      desc: 'Ahli mantra sihir misterius dengan kekuatan elemen.',
      icon: Sparkles,
    },
    {
      id: 'ranger',
      name: 'Pengelana (Ranger)',
      desc: 'Cepat & lincah, penjaga hutan dan pengintai ulung.',
      icon: Compass,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Adventurer_${Math.floor(1000 + Math.random() * 9000)}`;
    onJoin(finalName, characterClass);
  };

  return (
    <div className="ui-modal-backdrop font-pixel">
      <div className="w-full max-w-lg clay-panel landscape-compact-modal overflow-hidden text-black flex flex-col max-h-[min(94dvh,calc(100dvh-1rem))]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 clay-header landscape-compact-header text-center space-y-1 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 clay-badge-secondary text-black text-[10px] font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-black" />
            <span>2D Open World Simulasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            RadenWorld
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar landscape-compact-body"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-black" />
              Nama Karakter
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: RadenAria, AryaWiguna..."
              maxLength={18}
              className="w-full px-3.5 py-2.5 clay-input text-black text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-black" />
              Pilih Role Karakter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 landscape:grid-cols-3 gap-2.5">
              {classes.map((c) => {
                const Icon = c.icon;
                const isSelected = characterClass === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCharacterClass(c.id)}
                    className={`p-3 text-left flex flex-col gap-2 ${
                      isSelected ? 'clay-btn-secondary text-black' : 'clay-btn-neutral text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className="w-4 h-4 text-black" />
                      {isSelected && (
                        <span className="px-1.5 py-0.5 clay-badge-primary text-[9px] font-bold text-black">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-black">
                        {c.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-black leading-tight mt-0.5">{c.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 clay-btn-primary font-bold text-xs sm:text-sm text-black"
          >
            Masuk ke Open World ➔
          </button>
        </form>
      </div>
    </div>
  );
};
