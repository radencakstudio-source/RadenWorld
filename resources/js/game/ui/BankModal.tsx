/**
 * ============================================================================
 * FILE: resources/js/game/ui/BankModal.tsx
 * ============================================================================
 * Modal Kantor Bank Sentral RadenWorld (Cozycore Clay-Pixel):
 * - Tata Letak: Left Sidebar Navigation (.clay-modal-shell, .clay-sidebar, .clay-main-pane).
 * - Fitur:
 *   1. Setor Tunai (Simpanan fleksibel dengan bunga tabungan).
 *   2. Tarik Tunai (Pencairan koin dari rekening ke dompet).
 *   3. Deposito Berjangka (Tenor Kilat 3m +8%, Reguler 10m +20%, Prima 30m +45%).
 *   4. Investasi Daerah & Proyek Nusantara.
 *   5. Buku Mutasi Riwayat Transaksi.
 * - Desain: Chunky Pastel Pixel, outline 1-2px #5C3A21, tanpa hover, tanpa glow,
 *           teks hanya #000000 dan #FFFFFF.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Landmark,
  Coins,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

export interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  onUpdateGold: (newGold: number) => void;
  isAdmin?: boolean;
}

export type BankTab =
  | 'deposit'
  | 'withdraw'
  | 'deposito'
  | 'investment'
  | 'history';

export interface IDepositoItem {
  id: string;
  planName: string;
  principal: number;
  interestRate: number; // e.g. 0.08 for 8%
  maturityGold: number;
  startTime: number;
  durationMs: number;
  matureTime: number;
  claimed: boolean;
}

export interface IBankInvestment {
  id: string;
  packageName: string;
  principal: number;
  returnRate: number;
  expectedReturn: number;
  startTime: number;
  durationMs: number;
  claimed: boolean;
}

export interface ITransactionHistory {
  id: string;
  type: 'deposit' | 'withdraw' | 'deposito_open' | 'deposito_claim' | 'invest' | 'claim' | 'interest';
  amount: number;
  timestamp: number;
  description: string;
}

export const BankModal: React.FC<BankModalProps> = ({
  isOpen,
  onClose,
  playerGold,
  onUpdateGold,
  isAdmin: propIsAdmin,
}) => {
  const sound = SoundManager.getInstance();

  const isUserAdmin = useMemo(() => {
    if (propIsAdmin) return true;
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return Boolean(
        u.is_super_admin ||
          u.role === 'super_admin' ||
          u.role === 'admin' ||
          u.email === 'radencakstudio@gmail.com' ||
          u.name?.toUpperCase() === 'RADEN'
      );
    } catch (e) {
      return false;
    }
  }, [propIsAdmin]);

  const effectiveGold = isUserAdmin ? 99999999999 : playerGold;
  const goldDisplay = isUserAdmin ? '99999999999' : effectiveGold.toLocaleString('id-ID');

  const [activeTab, setActiveTab] = useState<BankTab>('deposit');

  // Saldo Simpanan Rekening
  const [savingsGold, setSavingsGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('raden_bank_savings');
      return saved ? parseInt(saved, 10) : 5000;
    } catch (e) {
      return 5000;
    }
  });

  // Deposito Berjangka
  const [activeDeposits, setActiveDeposits] = useState<IDepositoItem[]>(() => {
    try {
      const saved = localStorage.getItem('raden_bank_deposits_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Investasi Reksadana
  const [investments, setInvestments] = useState<IBankInvestment[]>(() => {
    try {
      const saved = localStorage.getItem('raden_bank_investments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Riwayat Mutasi
  const [history, setHistory] = useState<ITransactionHistory[]>(() => {
    try {
      const saved = localStorage.getItem('raden_bank_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [amountInput, setAmountInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Deposito form state
  const [depositoPlanIdx, setDepositoPlanIdx] = useState<number>(0);
  const [depositoAmountInput, setDepositoAmountInput] = useState<string>('500');

  // Investasi form state
  const [investPlanIdx, setInvestPlanIdx] = useState<number>(0);
  const [investAmountInput, setInvestAmountInput] = useState<string>('1000');

  const depositoPlans = [
    {
      name: 'Deposito Kilat 3 Menit',
      durationMinutes: 3,
      durationMs: 3 * 60 * 1000,
      rate: 0.08,
      rateLabel: '+8% Bunga',
      minAmount: 200,
      badge: 'POPULER',
      desc: 'Simpanan berjangka kilat, cocok untuk yang ingin hasil cepat saat menjelajah kota.',
    },
    {
      name: 'Deposito Reguler 10 Menit',
      durationMinutes: 10,
      durationMs: 10 * 60 * 1000,
      rate: 0.20,
      rateLabel: '+20% Bunga',
      minAmount: 500,
      badge: 'TERBAIK',
      desc: 'Imbal hasil optimal sembari memancing dan bercocok tanam di kebun.',
    },
    {
      name: 'Deposito Prima 30 Menit',
      durationMinutes: 30,
      durationMs: 30 * 60 * 1000,
      rate: 0.45,
      rateLabel: '+45% Bunga',
      minAmount: 1500,
      badge: 'SULTAN',
      desc: 'Keuntungan berlipat bagi saudagar yang beraktivitas seharian di RadenWorld.',
    },
  ];

  const investmentPlans = [
    {
      name: 'Reksadana Usaha Maritim',
      durationMinutes: 5,
      durationMs: 5 * 60 * 1000,
      rate: 0.25,
      rateLabel: '+25% Profit',
      minAmount: 1000,
      risk: 'Menengah',
      desc: 'Pendanaan kapal penangkap ikan teluk timur dengan dividen melimpah.',
    },
    {
      name: 'Obligasi Pasar & Pertanian',
      durationMinutes: 12,
      durationMs: 12 * 60 * 1000,
      rate: 0.60,
      rateLabel: '+60% Profit',
      minAmount: 3000,
      risk: 'Rendah (Pemerintah)',
      desc: 'Pengembangan bibit unggul Nusantara dan sarana perdagangan kota.',
    },
  ];

  // Update timer per detik
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const recordTransaction = (
    type: ITransactionHistory['type'],
    amount: number,
    description: string
  ) => {
    const rec: ITransactionHistory = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      amount,
      timestamp: Date.now(),
      description,
    };
    const nextHist = [rec, ...history].slice(0, 30);
    setHistory(nextHist);
    try {
      localStorage.setItem('raden_bank_history', JSON.stringify(nextHist));
    } catch (e) {}
  };

  // Setor Tunai
  const handleDeposit = () => {
    const val = parseInt(amountInput, 10);
    if (isNaN(val) || val <= 0) {
      sound.playClick();
      alert('Masukkan jumlah nominal koin yang valid!');
      return;
    }

    if (!isUserAdmin && val > effectiveGold) {
      sound.playClick();
      alert('Koin di dompetmu tidak mencukupi untuk setor tunai!');
      return;
    }

    sound.playCoin();
    const newGold = isUserAdmin ? 99999999999 : Math.max(0, effectiveGold - val);
    const newSavings = savingsGold + val;

    onUpdateGold(newGold);
    setSavingsGold(newSavings);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_savings', newSavings.toString());
    } catch (e) {}

    recordTransaction('deposit', val, `Setor Tunai ${val.toLocaleString('id-ID')} Koin`);
    setStatusMessage(`Berhasil menyetor ${val.toLocaleString('id-ID')} Koin ke rekening!`);
    setAmountInput('');
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  // Tarik Tunai
  const handleWithdraw = () => {
    const val = parseInt(amountInput, 10);
    if (isNaN(val) || val <= 0) {
      sound.playClick();
      alert('Masukkan jumlah nominal koin yang valid!');
      return;
    }

    if (val > savingsGold) {
      sound.playClick();
      alert('Saldo rekening bankmu tidak mencukupi untuk penarikan!');
      return;
    }

    sound.playCoin();
    const newGold = isUserAdmin ? 99999999999 : effectiveGold + val;
    const newSavings = savingsGold - val;

    onUpdateGold(newGold);
    setSavingsGold(newSavings);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_savings', newSavings.toString());
    } catch (e) {}

    recordTransaction('withdraw', val, `Tarik Tunai ${val.toLocaleString('id-ID')} Koin`);
    setStatusMessage(`Berhasil menarik ${val.toLocaleString('id-ID')} Koin ke dompet!`);
    setAmountInput('');
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  // Buka Deposito Baru
  const handleOpenDeposito = () => {
    const plan = depositoPlans[depositoPlanIdx];
    const val = parseInt(depositoAmountInput, 10);
    if (isNaN(val) || val < plan.minAmount) {
      sound.playClick();
      alert(`Minimal penempatan untuk paket ini adalah ${plan.minAmount.toLocaleString('id-ID')} Koin!`);
      return;
    }

    if (!isUserAdmin && val > effectiveGold) {
      sound.playClick();
      alert('Koin di dompetmu tidak mencukupi untuk membuka deposito ini!');
      return;
    }

    sound.playSuccess();
    const newGold = isUserAdmin ? 99999999999 : Math.max(0, effectiveGold - val);
    const maturityGold = Math.floor(val * (1 + plan.rate));
    const now = Date.now();

    const newDep: IDepositoItem = {
      id: `dep_${now}_${Math.random().toString(36).substring(2, 5)}`,
      planName: plan.name,
      principal: val,
      interestRate: plan.rate,
      maturityGold,
      startTime: now,
      durationMs: plan.durationMs,
      matureTime: now + plan.durationMs,
      claimed: false,
    };

    const nextDeposits = [newDep, ...activeDeposits];
    setActiveDeposits(nextDeposits);
    onUpdateGold(newGold);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_deposits_v1', JSON.stringify(nextDeposits));
    } catch (e) {}

    recordTransaction(
      'deposito_open',
      val,
      `Buka ${plan.name} Pokok ${val.toLocaleString('id-ID')} Koin`
    );
    setStatusMessage(`Sukses membuka ${plan.name}! Jatuh tempo dalam ${plan.durationMinutes} menit.`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  // Cairkan Deposito Selesai
  const handleClaimDeposito = (depId: string) => {
    const target = activeDeposits.find((d) => d.id === depId);
    if (!target || target.claimed) return;

    sound.playSuccess();
    const payout = target.maturityGold;
    const newGold = isUserAdmin ? 99999999999 : effectiveGold + payout;
    const updated = activeDeposits.filter((d) => d.id !== depId);

    setActiveDeposits(updated);
    onUpdateGold(newGold);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_deposits_v1', JSON.stringify(updated));
    } catch (e) {}

    recordTransaction(
      'deposito_claim',
      payout,
      `Cairkan Deposito ${target.planName} (+${payout.toLocaleString('id-ID')} Koin)`
    );
    setStatusMessage(`Selamat! Deposito berhasil dicairkan: +${payout.toLocaleString('id-ID')} Koin!`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  // Tarik Awal Deposito (Early Withdrawal - tanpa bunga)
  const handleCancelDeposito = (depId: string) => {
    const target = activeDeposits.find((d) => d.id === depId);
    if (!target) return;

    if (!confirm('Pencairan sebelum jatuh tempo akan membatalkan bunga. Kembalikan pokok saja?')) {
      return;
    }

    sound.playClick();
    const refund = target.principal;
    const newGold = isUserAdmin ? 99999999999 : effectiveGold + refund;
    const updated = activeDeposits.filter((d) => d.id !== depId);

    setActiveDeposits(updated);
    onUpdateGold(newGold);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_deposits_v1', JSON.stringify(updated));
    } catch (e) {}

    recordTransaction(
      'deposito_claim',
      refund,
      `Tarik Awal Pokok Deposito (+${refund.toLocaleString('id-ID')} Koin)`
    );
    setStatusMessage(`Pokok deposito ${refund.toLocaleString('id-ID')} Koin dikembalikan ke dompet.`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  // Investasi Reksadana
  const handleStartInvest = () => {
    const plan = investmentPlans[investPlanIdx];
    const val = parseInt(investAmountInput, 10);
    if (isNaN(val) || val < plan.minAmount) {
      sound.playClick();
      alert(`Minimal investasi untuk paket ini adalah ${plan.minAmount.toLocaleString('id-ID')} Koin!`);
      return;
    }

    if (!isUserAdmin && val > effectiveGold) {
      sound.playClick();
      alert('Koin di dompetmu tidak mencukupi untuk investasi ini!');
      return;
    }

    sound.playSuccess();
    const newGold = isUserAdmin ? 99999999999 : Math.max(0, effectiveGold - val);
    const expected = Math.floor(val * (1 + plan.rate));
    const now = Date.now();

    const newInv: IBankInvestment = {
      id: `inv_${now}`,
      packageName: plan.name,
      principal: val,
      returnRate: plan.rate,
      expectedReturn: expected,
      startTime: now,
      durationMs: plan.durationMs,
      claimed: false,
    };

    const nextInvs = [newInv, ...investments];
    setInvestments(nextInvs);
    onUpdateGold(newGold);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_investments', JSON.stringify(nextInvs));
    } catch (e) {}

    recordTransaction('invest', val, `Investasi ${plan.name} (${val.toLocaleString('id-ID')} Koin)`);
    setStatusMessage(`Berhasil berinvestasi pada ${plan.name}!`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  const handleClaimInvest = (invId: string) => {
    const target = investments.find((i) => i.id === invId);
    if (!target || target.claimed) return;

    sound.playSuccess();
    const payout = target.expectedReturn;
    const newGold = isUserAdmin ? 99999999999 : effectiveGold + payout;
    const updated = investments.filter((i) => i.id !== invId);

    setInvestments(updated);
    onUpdateGold(newGold);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_investments', JSON.stringify(updated));
    } catch (e) {}

    recordTransaction('claim', payout, `Klaim Hasil Investasi (+${payout.toLocaleString('id-ID')} Koin)`);
    setStatusMessage(`Dividen investasi cair: +${payout.toLocaleString('id-ID')} Koin!`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  if (!isOpen) return null;

  return (
    <div
      className="ui-modal-backdrop z-[100] select-none"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="clay-modal-shell max-w-4xl text-black">
        {/* SIDEBAR SEBELAH KIRI */}
        <aside className="clay-sidebar">
          <div className="clay-sidebar-header">
            <div className="clay-sidebar-brand-icon">
              <Landmark className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="clay-sidebar-brand-text">
              <span className="clay-sidebar-title">BANK SENTRAL</span>
              <span className="clay-sidebar-subtitle">RADEN PERKASA</span>
            </div>
          </div>

          <div className="clay-sidebar-nav">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('deposit');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'deposit' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Setor Tunai</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('withdraw');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'withdraw' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Tarik Tunai</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('deposito');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'deposito' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <Lock className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Deposito Berjangka</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('investment');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'investment' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <TrendingUp className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Investasi Daerah</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('history');
                setStatusMessage(null);
              }}
              className={`clay-sidebar-btn ${
                activeTab === 'history' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
              }`}
            >
              <FileText className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Buku Mutasi</span>
            </button>
          </div>

          <div className="clay-sidebar-footer">
            <div className="flex flex-col gap-1 w-full text-[10px] font-bold">
              <div className="clay-badge-secondary flex items-center justify-between p-1.5 text-black">
                <span className="truncate">Dompet:</span>
                <span className="truncate">{goldDisplay} G</span>
              </div>
              <div className="clay-badge-neutral flex items-center justify-between p-1.5 text-black">
                <span className="truncate">Tabungan:</span>
                <span className="truncate">{savingsGold.toLocaleString('id-ID')} G</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN PANE */}
        <main className="clay-main-pane">
          {/* TOPBAR */}
          <header className="clay-main-topbar">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold text-black uppercase">
                  {activeTab === 'deposit' && 'Setor Simpanan Bebas'}
                  {activeTab === 'withdraw' && 'Tarik Tunai Koin'}
                  {activeTab === 'deposito' && 'Deposito Berjangka Berbunga Tinggi'}
                  {activeTab === 'investment' && 'Portofolio Investasi & Reksadana'}
                  {activeTab === 'history' && 'Buku Riwayat Transaksi Bank'}
                </h2>
                <span className="clay-badge-secondary text-[9px] font-bold px-1.5 py-0.5 text-black">
                  TERJAMIN AMAN
                </span>
                {isUserAdmin && (
                  <span className="clay-badge-cocoa text-[9px] font-bold px-1.5 py-0.5 text-white">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-black hidden sm:block truncate">
                Lembaga keuangan resmi kerajaan RadenWorld. Bunga kompetitif, pencairan aman & cepat.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
              aria-label="Tutup Bank"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </header>

          {/* STATUS NOTIFIKASI */}
          {statusMessage && (
            <div className="px-4 py-2 bg-[#A8E6CF] border-b-2 border-[#5C3A21] flex items-center gap-2 text-xs font-bold text-black shrink-0">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* BODY */}
          <div className="clay-main-body">
            {/* 1. SETOR TUNAI */}
            {activeTab === 'deposit' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-7 flex flex-col gap-3">
                  <div className="clay-card p-3.5 flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-black uppercase">
                      Masukkan Jumlah Nominal Setoran
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                          placeholder="Contoh: 1000"
                          className="w-full clay-card bg-[#FFF8EA] px-3 py-2 text-xs font-bold text-black border-2 border-[#5C3A21] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleDeposit}
                        className="clay-btn-primary px-4 py-2 text-xs font-bold text-black uppercase flex items-center gap-1.5 shrink-0"
                      >
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                        <span>SETOR</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {[100, 500, 1000, 5000, 10000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setAmountInput(v.toString());
                          }}
                          className="clay-btn-secondary px-2 py-1 text-[10px] font-bold text-black"
                        >
                          +{v.toLocaleString('id-ID')}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAmountInput(effectiveGold.toString());
                        }}
                        className="clay-btn-primary px-2.5 py-1 text-[10px] font-bold text-black"
                      >
                        SEMUA
                      </button>
                    </div>
                  </div>

                  <div className="clay-card-secondary p-3 text-xs flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                      <span>Keuntungan Simpanan Bebas:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Koin di rekening tabungan bebas ditarik kapan pun tanpa denda penalti.
                      Setiap jam rekening mendapatkan bunga pasif 0.1% otomatis.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-5 clay-card p-3.5 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-black uppercase pb-1 border-b-2 border-[#5C3A21]/30">
                      Ringkasan Keuangan
                    </span>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Koin di Dompet:</span>
                      <span>{goldDisplay} G</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Saldo di Bank:</span>
                      <span>{savingsGold.toLocaleString('id-ID')} G</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-[#5C3A21]/20">
                      <span>Total Kekayaan:</span>
                      <span>{(effectiveGold + savingsGold).toLocaleString('id-ID')} G</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TARIK TUNAI */}
            {activeTab === 'withdraw' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-7 flex flex-col gap-3">
                  <div className="clay-card p-3.5 flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-black uppercase">
                      Masukkan Jumlah Nominal Penarikan
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="Contoh: 1000"
                        className="w-full clay-card bg-[#FFF8EA] px-3 py-2 text-xs font-bold text-black border-2 border-[#5C3A21] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleWithdraw}
                        className="clay-btn-secondary px-4 py-2 text-xs font-bold text-black uppercase flex items-center gap-1.5 shrink-0"
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        <span>TARIK</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {[100, 500, 1000, 5000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setAmountInput(v.toString());
                          }}
                          className="clay-btn-neutral px-2 py-1 text-[10px] font-bold text-black"
                        >
                          +{v.toLocaleString('id-ID')}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAmountInput(savingsGold.toString());
                        }}
                        className="clay-btn-secondary px-2.5 py-1 text-[10px] font-bold text-black"
                      >
                        SEMUA SALDO
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 clay-card p-3.5 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-black uppercase pb-1 border-b-2 border-[#5C3A21]/30">
                      Ketersediaan Dana
                    </span>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Bisa Ditarik Sekarang:</span>
                      <span className="clay-badge-secondary px-2 py-0.5 text-black">
                        {savingsGold.toLocaleString('id-ID')} G
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DEPOSITO BERJANGKA */}
            {activeTab === 'deposito' && (
              <div className="flex flex-col gap-4">
                {/* PILIHAN PAKET DEPOSITO */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-black uppercase">
                    PILIH PAKET DEPOSITO BERJANGKA
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {depositoPlans.map((plan, idx) => {
                      const isSelected = depositoPlanIdx === idx;
                      return (
                        <button
                          key={plan.name}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setDepositoPlanIdx(idx);
                          }}
                          className={`p-3 text-left flex flex-col justify-between gap-2 ${
                            isSelected ? 'clay-btn-secondary' : 'clay-btn-neutral'
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-black truncate">
                                {plan.name}
                              </span>
                              <span className="clay-badge-primary text-[9px] font-bold px-1.5 py-0.5 text-black shrink-0">
                                {plan.badge}
                              </span>
                            </div>
                            <span className="clay-badge-secondary text-[11px] font-bold px-2 py-0.5 text-black w-max">
                              {plan.rateLabel}
                            </span>
                            <p className="text-[10px] text-black mt-1 leading-snug line-clamp-2">
                              {plan.desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold text-black pt-1 border-t border-[#5C3A21]/20">
                            <span>Min: {plan.minAmount.toLocaleString('id-ID')} G</span>
                            <span>Tempo: {plan.durationMinutes} Menit</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FORM PEMBUKAAN DEPOSITO */}
                <div className="clay-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <span className="text-xs font-bold text-black">
                      Nominal Koin untuk {depositoPlans[depositoPlanIdx].name}:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={depositoAmountInput}
                        onChange={(e) => setDepositoAmountInput(e.target.value)}
                        className="clay-card bg-[#FFF8EA] px-3 py-1.5 text-xs font-bold text-black border-2 border-[#5C3A21] outline-none w-36"
                      />
                      <span className="text-xs font-bold text-black">
                        Hasil Akhir: ~
                        {Math.floor(
                          (parseInt(depositoAmountInput, 10) || 0) *
                            (1 + depositoPlans[depositoPlanIdx].rate)
                        ).toLocaleString('id-ID')}{' '}
                        G
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenDeposito}
                    className="clay-btn-primary px-4 py-2.5 text-xs font-bold text-black uppercase flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
                  >
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    <span>BUKA DEPOSITO SEKARANG</span>
                  </button>
                </div>

                {/* DAFTAR DEPOSITO AKTIF */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-black">
                    <span>DAFTAR DEPOSITO AKTIF ({activeDeposits.length})</span>
                    <span className="text-[10px]">Pantau waktu jatuh tempo</span>
                  </div>

                  {activeDeposits.length === 0 ? (
                    <div className="clay-card-neutral p-4 text-center text-xs font-bold text-black">
                      Belum ada deposito aktif. Pilih paket di atas untuk mulai mengamankan keuntungan!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                      {activeDeposits.map((dep) => {
                        const remainingSec = Math.max(
                          0,
                          Math.floor((dep.matureTime - nowTime) / 1000)
                        );
                        const isMature = remainingSec === 0;
                        const progressPct = Math.min(
                          100,
                          Math.floor(
                            ((nowTime - dep.startTime) / dep.durationMs) * 100
                          )
                        );

                        return (
                          <div
                            key={dep.id}
                            className={`p-3 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                              isMature ? 'clay-card-secondary' : 'clay-card'
                            }`}
                          >
                            <div className="flex flex-col gap-1 min-w-0 w-full sm:w-auto">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-black">
                                  {dep.planName}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 ${
                                    isMature
                                      ? 'clay-badge-primary text-black'
                                      : 'clay-badge-neutral text-black'
                                  }`}
                                >
                                  {isMature ? 'JATUH TEMPO (SIAP CAIR)' : 'BERJALAN'}
                                </span>
                              </div>

                              <div className="text-[11px] font-bold text-black flex items-center gap-2">
                                <span>Pokok: {dep.principal.toLocaleString('id-ID')} G</span>
                                <span>→</span>
                                <span className="clay-badge-secondary px-1.5 py-0.2 text-black">
                                  Hasil: {dep.maturityGold.toLocaleString('id-ID')} G
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full sm:w-64 h-2 bg-[#FFF8EA] rounded-full border border-[#5C3A21] overflow-hidden mt-1">
                                <div
                                  className="h-full bg-[#FFAE6D] transition-all duration-500"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                              {!isMature ? (
                                <>
                                  <span className="text-xs font-bold text-black flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {Math.floor(remainingSec / 60)}:
                                      {(remainingSec % 60).toString().padStart(2, '0')}
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelDeposito(dep.id)}
                                    className="clay-btn-neutral px-2 py-1 text-[10px] font-bold text-black"
                                    title="Tarik pokok awal tanpa bunga"
                                  >
                                    Batal
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleClaimDeposito(dep.id)}
                                  className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold text-black uppercase flex items-center gap-1.5"
                                >
                                  <Unlock className="w-4 h-4 stroke-[2.5]" />
                                  <span>CAIRKAN (+{dep.maturityGold.toLocaleString('id-ID')} G)</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. INVESTASI DAERAH */}
            {activeTab === 'investment' && (
              <div className="flex flex-col gap-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {investmentPlans.map((plan, idx) => (
                    <div
                      key={plan.name}
                      onClick={() => {
                        sound.playClick();
                        setInvestPlanIdx(idx);
                      }}
                      className={`clay-card p-3.5 flex flex-col justify-between gap-2.5 cursor-pointer ${
                        investPlanIdx === idx ? 'border-4 border-[#FFAE6D]' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black">{plan.name}</span>
                          <span className="clay-badge-secondary text-[10px] font-bold px-1.5 py-0.5 text-black">
                            {plan.rateLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-black leading-snug">{plan.desc}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-black pt-1 border-t border-[#5C3A21]/20">
                        <span>Min: {plan.minAmount.toLocaleString('id-ID')} G</span>
                        <span>Tempo: {plan.durationMinutes} Menit</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="clay-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black">Nominal:</span>
                    <input
                      type="number"
                      value={investAmountInput}
                      onChange={(e) => setInvestAmountInput(e.target.value)}
                      className="clay-card bg-[#FFF8EA] px-3 py-1.5 text-xs font-bold text-black border-2 border-[#5C3A21] outline-none w-36"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleStartInvest}
                    className="clay-btn-primary px-4 py-2 text-xs font-bold text-black uppercase flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                    <span>IKUT INVESTASI</span>
                  </button>
                </div>

                {/* INVESTASI BERJALAN */}
                {investments.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-black uppercase">
                      Investasi Aktif ({investments.length})
                    </span>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {investments.map((inv) => {
                        const elapsed = nowTime - inv.startTime;
                        const mature = elapsed >= inv.durationMs;
                        return (
                          <div
                            key={inv.id}
                            className={`p-2.5 flex items-center justify-between gap-2 ${
                              mature ? 'clay-card-secondary' : 'clay-card'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-black">{inv.packageName}</span>
                              <span className="text-[10px] text-black font-bold">
                                Pokok: {inv.principal.toLocaleString('id-ID')} G → Dividen:{' '}
                                {inv.expectedReturn.toLocaleString('id-ID')} G
                              </span>
                            </div>

                            {mature ? (
                              <button
                                type="button"
                                onClick={() => handleClaimInvest(inv.id)}
                                className="clay-btn-primary px-3 py-1.5 text-xs font-bold text-black uppercase"
                              >
                                KLAIM HASIL
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-black">
                                Berjalan ({Math.max(0, Math.floor((inv.durationMs - elapsed) / 1000))} dtk)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. BUKU MUTASI RIWAYAT */}
            {activeTab === 'history' && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-black">
                  <span>CATATAN REKENING TERAKHIR ({history.length})</span>
                  <span className="text-[10px]">Tersimpan di buku tabungan</span>
                </div>

                {history.length === 0 ? (
                  <div className="clay-card-neutral p-6 text-center text-xs font-bold text-black">
                    Belum ada riwayat transaksi perbankan tercatat.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {history.map((tx) => (
                      <div
                        key={tx.id}
                        className="clay-card p-2.5 flex items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              tx.type === 'deposit' || tx.type === 'deposito_claim' || tx.type === 'claim' || tx.type === 'interest'
                                ? 'clay-btn-secondary text-black'
                                : 'clay-btn-primary text-black'
                            }`}
                          >
                            {tx.type === 'deposit' || tx.type === 'deposito_claim' || tx.type === 'claim' || tx.type === 'interest' ? '+' : '-'}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-black block truncate">
                              {tx.description}
                            </span>
                            <span className="text-[9px] text-black">
                              {new Date(tx.timestamp).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        <span className="font-bold text-black shrink-0">
                          {tx.amount.toLocaleString('id-ID')} G
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
