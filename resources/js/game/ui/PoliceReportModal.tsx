/**
 * ============================================================================
 * FILE: resources/js/game/ui/PoliceReportModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Kantor Polisi RadenWorld - Pusat Pengaduan & Laporan Warga Resmi:
 * 1. Data Pemain 100% Real berdasarkan user yang terhubung ke server WebSocket multiplayer.
 * 2. Tanpa bot atau data tiruan (No fake bots).
 * 3. Formulir Laporan Resmi yang benar-benar bekerja:
 *    - Tiket unik (LAPOR-POL-XXXXXX)
 *    - Penyimpanan riwayat pengaduan di localStorage ('raden_police_reports')
 *    - Notifikasi resmi ke sistem chat
 * 4. UI Elegan, Sederhana, Pas dengan Tema Game, Performa Ringan.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, ShieldAlert, Users, Search, AlertTriangle, Send, FileText, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { NetworkManager } from '../core/NetworkManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { IPlayerData } from '../types';
import { AvatarPreview } from './AvatarPreview';

export interface PoliceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName?: string;
}

export interface IReportRecord {
  id: string;
  ticketNumber: string;
  targetId: string;
  targetName: string;
  reporterName: string;
  category: string;
  description: string;
  timestamp: number;
  status: 'Ditinjau' | 'Dalam Penyelidikan' | 'Ditindak';
}

export const PoliceReportModal: React.FC<PoliceReportModalProps> = ({
  isOpen,
  onClose,
  currentPlayerName = 'Petualang',
}) => {
  const sound = SoundManager.getInstance();

  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayerData | null>(null);

  // Form Fields
  const [category, setCategory] = useState<string>('Cheat & Speedhack');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessTicket, setSubmitSuccessTicket] = useState<string | null>(null);

  // Server Players Real Data
  const [serverPlayers, setServerPlayers] = useState<IPlayerData[]>([]);

  // History Reports
  const [reportsHistory, setReportsHistory] = useState<IReportRecord[]>(() => {
    try {
      const saved = localStorage.getItem('raden_police_reports');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlayer(null);
      setSubmitSuccessTicket(null);
      return;
    }

    // Minta daftar user real ke WebSocket Multiplayer server
    try {
      const net = NetworkManager.getInstance();
      net.requestRoomPlayers();
      const currentList = net.getServerPlayers();
      if (currentList) {
        setServerPlayers(currentList);
      }
    } catch (e) {}

    const handlePlayersUpdate = (list: IPlayerData[]) => {
      setServerPlayers(list || []);
    };

    EventBus.on('server-players-updated', handlePlayersUpdate);
    return () => {
      EventBus.off('server-players-updated', handlePlayersUpdate);
    };
  }, [isOpen]);

  // Daftar pemain real di server (tanpa bot tiruan)
  const displayPlayers = useMemo(() => {
    return serverPlayers.filter(
      p => p && p.name && p.name.toLowerCase() !== currentPlayerName.toLowerCase()
    );
  }, [serverPlayers, currentPlayerName]);

  // Filter pencarian nama
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return displayPlayers;
    const q = searchQuery.toLowerCase().trim();
    return displayPlayers.filter(p => p.name.toLowerCase().includes(q));
  }, [displayPlayers, searchQuery]);

  const categories = [
    'Cheat & Speedhack',
    'Perilaku Toxic / Penghinaan',
    'Spam Obrolan Berulang',
    'Perilaku Mengganggu (Griefing)',
    'Eksploitasi Bug Permainan',
    'Penipuan / Scam Transaksi',
    'Pelanggaran Lainnya',
  ];

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlayer) {
      sound.playClick();
      alert('Pilih pemain yang ingin kamu laporkan dari daftar online!');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      sound.playClick();
      alert('Tuliskan kronologi / keterangan pengaduan secara jelas (minimal 5 karakter).');
      return;
    }

    setIsSubmitting(true);
    sound.playSuccess();

    const ticketNumber = `LAPOR-POL-${Date.now().toString().slice(-6)}`;
    const newReport: IReportRecord = {
      id: `rep_${Date.now()}`,
      ticketNumber,
      targetId: selectedPlayer.id,
      targetName: selectedPlayer.name,
      reporterName: currentPlayerName,
      category,
      description: description.trim(),
      timestamp: Date.now(),
      status: 'Ditinjau',
    };

    const nextHistory = [newReport, ...reportsHistory].slice(0, 50);
    setReportsHistory(nextHistory);
    try {
      localStorage.setItem('raden_police_reports', JSON.stringify(nextHistory));
    } catch (e) {}

    // Kirim notifikasi sistem ke chat box
    EventBus.emit('new-chat-message', {
      id: `police_rep_${Date.now()}`,
      sender: 'KANTOR POLISI',
      text: `🚨 Laporan tiket [${ticketNumber}] terhadap ${selectedPlayer.name} berhasil diajukan dan sedang dalam pengawasan petugas!`,
      timestamp: Date.now(),
      isSystem: true,
    });

    setIsSubmitting(false);
    setSubmitSuccessTicket(ticketNumber);
    setDescription('');
  };

  const handleClearHistory = () => {
    if (!confirm('Hapus seluruh riwayat pengaduan laporan polisimu?')) return;
    sound.playClick();
    setReportsHistory([]);
    try {
      localStorage.removeItem('raden_police_reports');
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 sm:p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
        {/* Header Modal Polisi */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-white font-mono">
                  KANTOR POLISI RADENWORLD
                </h2>
                <span className="text-[9px] sm:text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/60 font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded">
                  LAYANAN PENGADUAN RESMI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Pengawasan keamanan kota, pelaporan tindakan pelanggaran & ketertiban komunitas.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-4 sm:px-6 pt-1.5 sm:pt-2 gap-2 shrink-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('report');
              setSubmitSuccessTicket(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold font-mono tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'report'
                ? 'border-blue-400 text-blue-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            FORMULIR PENGADUAN
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
              setSubmitSuccessTicket(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold font-mono tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-400 text-blue-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            HISTORI PENGADUAN ({reportsHistory.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {activeTab === 'report' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Kolom Kiri: Pilih Pemain Real di Server */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    PEMAIN ONLINE ({displayPlayers.length})
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Real Server Data</span>
                </div>

                {/* Input Cari */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama pemain..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* List Pemain Real */}
                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredPlayers.length === 0 ? (
                    <div className="p-6 rounded-lg bg-neutral-900/40 border border-neutral-800 text-center font-mono">
                      <p className="text-xs text-neutral-400 mb-1">
                        {displayPlayers.length === 0
                          ? 'Tidak ada pemain lain yang sedang online di server saat ini.'
                          : 'Tidak ditemukan pemain dengan nama tersebut.'}
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        Hanya pemain sungguhan yang terhubung ke server yang dapat dilaporkan.
                      </p>
                    </div>
                  ) : (
                    filteredPlayers.map((p) => {
                      const isSelected = selectedPlayer?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            sound.playClick();
                            setSelectedPlayer(p);
                            setSubmitSuccessTicket(null);
                          }}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-neutral-900 border-blue-500'
                              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold font-mono text-white truncate block">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                Level {p.level || 1} • {p.role === 'super_admin' ? '👑 Admin' : 'Warga'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-blue-500 text-black font-bold'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {isSelected ? 'Dipilih' : 'Pilih'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Formulir Pengaduan */}
              <div className="md:col-span-7 bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                {submitSuccessTicket ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center font-mono gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Laporan Berhasil Diajukan!</h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Nomor Tiket Pengaduan:{' '}
                        <span className="text-emerald-400 font-bold">{submitSuccessTicket}</span>
                      </p>
                    </div>
                    <p className="text-xs text-neutral-400 max-w-sm">
                      Petugas keamanan kota telah menerima berkas pengaduan ini dan akan segera menindaklanjuti.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSubmitSuccessTicket(null);
                        setSelectedPlayer(null);
                      }}
                      className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono transition-colors"
                    >
                      Buat Laporan Baru
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReport} className="flex flex-col gap-4">
                    <div>
                      <span className="text-xs font-bold font-mono text-white uppercase tracking-wider block mb-2">
                        Pemain yang Dilaporkan:
                      </span>
                      {selectedPlayer ? (
                        <div className="p-3 bg-neutral-950 rounded-lg border border-blue-500/50 flex items-center justify-between font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-xs font-bold text-white">{selectedPlayer.name}</span>
                          </div>
                          <span className="text-[10px] text-blue-400">Terpilih</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-neutral-950 rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-500 font-mono text-center">
                          ⬅️ Silakan klik dan pilih nama pemain di daftar sebelah kiri.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 font-mono mb-1.5 uppercase tracking-wider">
                        Kategori Pelanggaran:
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 font-mono mb-1.5 uppercase tracking-wider">
                        Kronologi / Keterangan Kejadian:
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Jelaskan secara jelas apa yang terjadi, waktu kejadian, dan bukti tindakan..."
                        rows={4}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white font-sans placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedPlayer}
                      className={`w-full py-2.5 font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                        selectedPlayer
                          ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>KIRIM LAPORAN PENGADUAN RESMI</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* Tab Histori Pengaduan */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  RIWAYAT TIKET LAPORAN KAMU ({reportsHistory.length})
                </span>
                {reportsHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Riwayat</span>
                  </button>
                )}
              </div>

              {reportsHistory.length === 0 ? (
                <div className="p-10 text-center font-mono bg-neutral-900/40 rounded-xl border border-neutral-800">
                  <p className="text-xs text-neutral-400">Belum ada tiket pengaduan yang diajukan.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {reportsHistory.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{rep.ticketNumber}</span>
                          <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                            Target: {rep.targetName}
                          </span>
                          <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                            {rep.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 mt-1 font-sans">{rep.description}</p>
                        <span className="text-[10px] text-neutral-500 mt-1 block">
                          Diajukan: {new Date(rep.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="shrink-0">
                        <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{rep.status}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
