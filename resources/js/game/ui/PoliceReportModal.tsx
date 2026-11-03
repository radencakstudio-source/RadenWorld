/**
 * ============================================================================
 * FILE: resources/js/game/ui/PoliceReportModal.tsx
 * ============================================================================
 * Modal Kantor Polisi RadenWorld - Pusat Pengaduan Warga Resmi (Cozycore Clay-Pixel):
 * 1. Data Pemain 100% Real dari WebSocket multiplayer server (tanpa bot tiruan).
 * 2. Tiket unik (LAPOR-POL-XXXXXX), tersimpan di localStorage & notifikasi sistem.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  Search,
  AlertTriangle,
  Send,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react';
import { NetworkManager } from '../core/NetworkManager';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { IPlayerData } from '../types';

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

  const [category, setCategory] = useState<string>('Cheat & Speedhack');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessTicket, setSubmitSuccessTicket] = useState<string | null>(null);

  const [serverPlayers, setServerPlayers] = useState<IPlayerData[]>([]);

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

  const displayPlayers = useMemo(() => {
    return serverPlayers.filter(
      (p) => p && p.name && p.name.toLowerCase() !== currentPlayerName.toLowerCase()
    );
  }, [serverPlayers, currentPlayerName]);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return displayPlayers;
    const q = searchQuery.toLowerCase().trim();
    return displayPlayers.filter((p) => p.name.toLowerCase().includes(q));
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

    EventBus.emit('new-chat-message', {
      id: `police_rep_${Date.now()}`,
      sender: 'KANTOR POLISI',
      text: `Laporan tiket [${ticketNumber}] terhadap ${selectedPlayer.name} berhasil diajukan!`,
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
    <div
      className="ui-modal-backdrop z-[100] select-none"
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      <div className="clay-panel landscape-compact-modal relative w-full max-w-4xl max-h-[min(93dvh,calc(100dvh-1rem))] overflow-hidden flex flex-col text-black">
        <div className="clay-modal-shell flex-1 min-h-0">
          {/* SIDEBAR KIRI: LOGO DI ATAS, TEKS DI BAWAH */}
          <aside className="clay-sidebar">
            <div className="clay-sidebar-brand">
              <ShieldAlert className="w-5 h-5 text-black stroke-[2.5]" />
              <span className="clay-sidebar-title">KANTOR POLISI</span>
              <span className="clay-sidebar-subtitle">KANTIBMAS</span>
            </div>

            <div className="clay-sidebar-nav custom-scrollbar">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('report');
                  setSubmitSuccessTicket(null);
                }}
                className={`clay-sidebar-btn ${
                  activeTab === 'report' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
                }`}
              >
                <AlertTriangle className="w-5 h-5 stroke-[2.5] shrink-0" />
                <span>Pengaduan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('history');
                  setSubmitSuccessTicket(null);
                }}
                className={`clay-sidebar-btn ${
                  activeTab === 'history' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
                }`}
              >
                <FileText className="w-5 h-5 stroke-[2.5] shrink-0" />
                <span>Riwayat ({reportsHistory.length})</span>
              </button>
            </div>

            <div className="clay-sidebar-footer">
              <span className="clay-badge-secondary text-[9px] font-bold text-center py-0.5">
                LAYANAN 24J
              </span>
            </div>
          </aside>

          {/* MAIN CONTENT PANE */}
          <div className="clay-main-pane flex-1 min-w-0 flex flex-col">
            <div className="clay-main-topbar flex items-center justify-between px-3.5 sm:px-4 py-2 border-b-2 border-[#5C3A21] bg-[#FFF8EA] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-bold uppercase text-black truncate">
                  {activeTab === 'report' ? 'FORMULIR PENGADUAN WARGA' : 'RIWAYAT LAPORAN RESMI'}
                </span>
                <span className="clay-badge-secondary hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 text-black">
                  RADEN POLICE
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
                title="Tutup Kantor Polisi"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Body Content */}
            <div className="clay-main-body p-3.5 sm:p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {activeTab === 'report' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Kolom Kiri: Pilih Pemain Real di Server */}
              <div className="md:col-span-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                    PEMAIN ONLINE ({displayPlayers.length})
                  </span>
                  <span className="clay-badge-secondary px-1.5 py-0.5 text-[9px] font-bold text-black">
                    Real Data
                  </span>
                </div>

                {/* Input Cari */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama pemain..."
                    className="clay-input w-full pl-8 pr-3 py-2 text-xs text-black"
                  />
                </div>

                {/* List Pemain Real */}
                <div className="flex flex-col gap-2 md:max-h-[340px] md:overflow-y-auto custom-scrollbar">
                  {filteredPlayers.length === 0 ? (
                    <div className="clay-card p-5 text-center text-black space-y-1">
                      <p className="text-xs font-bold">
                        {displayPlayers.length === 0
                          ? 'Tidak ada pemain lain yang sedang online saat ini.'
                          : 'Tidak ditemukan pemain dengan nama tersebut.'}
                      </p>
                      <p className="text-[11px]">
                        Hanya pemain sungguhan yang terhubung ke server yang dapat dilaporkan.
                      </p>
                    </div>
                  ) : (
                    filteredPlayers.map((p) => {
                      const isSelected = selectedPlayer?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedPlayer(p);
                            setSubmitSuccessTicket(null);
                          }}
                          className={`p-2.5 text-left flex items-center justify-between gap-2 text-black ${
                            isSelected ? 'clay-btn-secondary' : 'clay-btn-neutral'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#A8E6CF] border border-[#5C3A21] shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-black truncate block">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-black">
                                Level {p.level || 1} •{' '}
                                {p.role === 'super_admin' ? 'Admin' : 'Warga'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${
                              isSelected ? 'clay-badge-primary' : 'clay-badge-neutral'
                            }`}
                          >
                            {isSelected ? 'Dipilih' : 'Pilih'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Formulir Pengaduan */}
              <div className="md:col-span-7 clay-card p-4 flex flex-col justify-between">
                {submitSuccessTicket ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center text-black gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#A8E6CF] border-2 border-[#5C3A21] flex items-center justify-center text-black">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-black uppercase">
                        Laporan Berhasil Diajukan!
                      </h3>
                      <p className="text-xs text-black mt-1">
                        Nomor Tiket:{' '}
                        <span className="clay-badge-primary px-2 py-0.5 font-bold">
                          {submitSuccessTicket}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-black max-w-sm">
                      Petugas keamanan kota telah menerima berkas pengaduan ini dan akan segera
                      menindaklanjuti.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSubmitSuccessTicket(null);
                        setSelectedPlayer(null);
                      }}
                      className="clay-btn-primary mt-1 px-4 py-2 text-black text-xs font-bold uppercase"
                    >
                      Buat Laporan Baru
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
                    <div>
                      <span className="text-xs font-bold text-black uppercase block mb-1.5">
                        Pemain yang Dilaporkan:
                      </span>
                      {selectedPlayer ? (
                        <div className="clay-card-secondary p-2.5 flex items-center justify-between text-black">
                          <span className="text-xs font-bold">{selectedPlayer.name}</span>
                          <span className="clay-badge-primary px-2 py-0.5 text-[10px] font-bold">
                            Terpilih
                          </span>
                        </div>
                      ) : (
                        <div className="clay-badge-neutral p-2.5 text-xs font-bold text-black text-center">
                          Pilih nama pemain dari daftar sebelah kiri terlebih dahulu.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1 uppercase">
                        Kategori Pelanggaran:
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="clay-input w-full p-2 text-xs font-bold text-black"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1 uppercase">
                        Kronologi / Keterangan Kejadian:
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Jelaskan secara jelas apa yang terjadi..."
                        rows={4}
                        className="clay-input w-full p-2.5 text-xs text-black resize-none leading-snug"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedPlayer}
                      className="clay-btn-primary w-full py-2.5 font-bold text-xs text-black uppercase flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 stroke-[2.5]" />
                      <span>KIRIM LAPORAN PENGADUAN</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* Tab Histori Pengaduan */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-black uppercase">
                  RIWAYAT TIKET LAPORAN ({reportsHistory.length})
                </span>
                {reportsHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="clay-btn-neutral px-2.5 py-1 flex items-center gap-1.5 text-xs font-bold text-black"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Hapus Riwayat</span>
                  </button>
                )}
              </div>

              {reportsHistory.length === 0 ? (
                <div className="clay-card p-8 text-center text-black">
                  <p className="text-xs font-bold">Belum ada tiket pengaduan yang diajukan.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {reportsHistory.map((rep) => (
                    <div
                      key={rep.id}
                      className="clay-card p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-black"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold">{rep.ticketNumber}</span>
                          <span className="clay-badge-primary text-[10px] font-bold px-1.5 py-0.5">
                            Target: {rep.targetName}
                          </span>
                          <span className="clay-badge-neutral text-[10px] font-bold px-1.5 py-0.5">
                            {rep.category}
                          </span>
                        </div>
                        <p className="text-xs mt-1 leading-snug">{rep.description}</p>
                        <span className="text-[10px] font-bold mt-1 block">
                          Diajukan: {new Date(rep.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="shrink-0">
                        <span className="clay-badge-secondary text-xs font-bold px-2.5 py-1 inline-flex items-center gap-1.5 text-black">
                          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
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
      </div>
    </div>
  );
};
