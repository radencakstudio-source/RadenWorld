/**
 * ============================================================================
 * FILE: resources/js/game/ui/BankModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Kantor Bank Sentral RadenWorld:
 * 1. Tab Tabungan Koin (Setor Tunai & Tarik Tunai Koin Emas dengan Bunga Harian).
 * 2. Tab Investasi Koin (Live Real-Time Countdown Ticker & Klaim Dividen + Pokok).
 * 3. Dukungan Akun Admin: Koin Unlimited (99999999999 & saldo tidak habis).
 * 4. UI Elegan, Simpel, Ringan, Tidak Alay, Pas dengan Tema Game.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, Landmark, Coins, TrendingUp, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

export interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  onUpdateGold: (newGold: number) => void;
  isAdmin?: boolean;
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
  type: 'deposit' | 'withdraw' | 'invest' | 'claim' | 'interest';
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

  // Deteksi Super Admin
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

  const [activeTab, setActiveTab] = useState<'savings' | 'investment'>('savings');

  // Saldo Tabungan Bank (Disimpan di localStorage)
  const [savingsGold, setSavingsGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('raden_bank_savings');
      return saved ? parseInt(saved, 10) : 5000;
    } catch (e) {
      return 5000;
    }
  });

  // Investasi Aktif
  const [investments, setInvestments] = useState<IBankInvestment[]>(() => {
    try {
      const saved = localStorage.getItem('raden_bank_investments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Histori Mutasi
  const [history, setHistory] = useState<ITransactionHistory[]>(() => {
    try {
      const saved = localStorage.getItem('raden_bank_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // State live ticker untuk update timer countdown setiap detik
  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Tabungan Bunga Otomatis (Interest Accrual)
  useEffect(() => {
    if (!isOpen) return;
    try {
      const lastInterest = localStorage.getItem('raden_bank_last_interest');
      const now = Date.now();
      const lastTime = lastInterest ? parseInt(lastInterest, 10) : now;
      const hoursPassed = Math.floor((now - lastTime) / (3600 * 1000));

      if (hoursPassed >= 1 && savingsGold > 0) {
        // Bunga 0.1% per jam saldo tabungan
        const interestEarned = Math.round(savingsGold * 0.001 * Math.min(hoursPassed, 24));
        if (interestEarned > 0) {
          const newSavings = savingsGold + interestEarned;
          setSavingsGold(newSavings);
          localStorage.setItem('raden_bank_savings', newSavings.toString());
          localStorage.setItem('raden_bank_last_interest', now.toString());

          const rec: ITransactionHistory = {
            id: `int_${now}`,
            type: 'interest',
            amount: interestEarned,
            timestamp: now,
            description: `Bunga Tabungan Simpanan Bank (+${interestEarned.toLocaleString('id-ID')} Koin)`,
          };
          setHistory(prev => [rec, ...prev].slice(0, 30));
        }
      } else if (!lastInterest) {
        localStorage.setItem('raden_bank_last_interest', now.toString());
      }
    } catch (e) {}
  }, [isOpen, savingsGold]);

  // Savings Inputs
  const [amountInput, setAmountInput] = useState<string>('');
  const [savingsAction, setSavingsAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Investment Inputs
  const [selectedPlan, setSelectedPlan] = useState<number>(0);
  const [investAmountInput, setInvestAmountInput] = useState<string>('1000');

  const investmentPlans = [
    {
      name: 'Deposito Kilat Nusantara',
      durationMinutes: 2,
      durationMs: 2 * 60 * 1000, // 2 Menit (Simulasi Cepat Real-time)
      rate: 0.08, // +8%
      rateLabel: '+8% Profit',
      minAmount: 500,
      risk: 'Rendah (Dijamin Bank)',
      desc: 'Investasi likuiditas harian dengan return stabil dan pencairan cepat.',
    },
    {
      name: 'Reksadana Usaha Maritim',
      durationMinutes: 5,
      durationMs: 5 * 60 * 1000, // 5 Menit
      rate: 0.25, // +25%
      rateLabel: '+25% Profit',
      minAmount: 2000,
      risk: 'Menengah (Hasil Tangkapan Laut)',
      desc: 'Pendanaan armada kapal nelayan teluk timur dengan bagi hasil dividen tinggi.',
    },
    {
      name: 'Obligasi Kerajaan Raden Corp',
      durationMinutes: 10,
      durationMs: 10 * 60 * 1000, // 10 Menit
      rate: 0.60, // +60%
      rateLabel: '+60% Profit',
      minAmount: 10000,
      risk: 'Eksklusif (Dividen Kerajaan)',
      desc: 'Surat berharga pembangunan infrastruktur cyber & teknologi kota RadenWorld.',
    },
  ];

  const recordTransaction = (type: ITransactionHistory['type'], amount: number, description: string) => {
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

    recordTransaction('deposit', val, `Menabung ${val.toLocaleString('id-ID')} Koin ke Rekening`);
    setStatusMessage(`✅ Berhasil menabung ${val.toLocaleString('id-ID')} Koin!`);
    setAmountInput('');

    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  const handleWithdraw = () => {
    const val = parseInt(amountInput, 10);
    if (isNaN(val) || val <= 0) {
      sound.playClick();
      alert('Masukkan jumlah nominal koin yang valid!');
      return;
    }

    if (val > savingsGold) {
      sound.playClick();
      alert('Saldo tabungan di rekening bank tidak mencukupi!');
      return;
    }

    sound.playCoin();

    const newGold = isUserAdmin ? 99999999999 : effectiveGold + val;
    const newSavings = Math.max(0, savingsGold - val);

    onUpdateGold(newGold);
    setSavingsGold(newSavings);

    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
      localStorage.setItem('raden_bank_savings', newSavings.toString());
    } catch (e) {}

    recordTransaction('withdraw', val, `Menarik ${val.toLocaleString('id-ID')} Koin dari Tabungan`);
    setStatusMessage(`✅ Berhasil menarik ${val.toLocaleString('id-ID')} Koin ke dompet tunai!`);
    setAmountInput('');

    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  const handleInvest = () => {
    const plan = investmentPlans[selectedPlan];
    const val = parseInt(investAmountInput, 10);

    if (isNaN(val) || val < plan.minAmount) {
      sound.playClick();
      alert(`Minimal modal investasi paket ini adalah ${plan.minAmount.toLocaleString('id-ID')} Koin!`);
      return;
    }

    if (!isUserAdmin && val > effectiveGold) {
      sound.playClick();
      alert('Koin di dompetmu tidak mencukupi untuk paket investasi ini!');
      return;
    }

    sound.playCoin();

    const newGold = isUserAdmin ? 99999999999 : Math.max(0, effectiveGold - val);
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}

    const profit = Math.round(val * plan.rate);
    const newInvest: IBankInvestment = {
      id: `inv_${Date.now()}`,
      packageName: plan.name,
      principal: val,
      returnRate: plan.rate,
      expectedReturn: val + profit,
      startTime: Date.now(),
      durationMs: plan.durationMs,
      claimed: false,
    };

    const nextList = [newInvest, ...investments];
    setInvestments(nextList);
    try {
      localStorage.setItem('raden_bank_investments', JSON.stringify(nextList));
    } catch (e) {}

    recordTransaction('invest', val, `Membeli Paket Investasi: ${plan.name} (${val.toLocaleString('id-ID')} Koin)`);
    setStatusMessage(`🎉 Investasi ${plan.name} aktif! Ticker countdown mulai berjalan.`);
    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  const handleClaimInvestment = (id: string) => {
    const inv = investments.find(i => i.id === id);
    if (!inv || inv.claimed) return;

    const elapsed = Date.now() - inv.startTime;
    if (elapsed < inv.durationMs) {
      sound.playClick();
      alert('⏳ Investasi ini masih dalam proses jatuh tempo! Harap tunggu hitungan mundur selesai.');
      return;
    }

    sound.playSuccess();
    const newGold = isUserAdmin ? 99999999999 : effectiveGold + inv.expectedReturn;
    onUpdateGold(newGold);
    try {
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}

    const nextList = investments.map(i => (i.id === id ? { ...i, claimed: true } : i));
    setInvestments(nextList);
    try {
      localStorage.setItem('raden_bank_investments', JSON.stringify(nextList));
    } catch (e) {}

    recordTransaction('claim', inv.expectedReturn, `Klaim Pokok & Keuntungan ${inv.packageName}`);
    setStatusMessage(`💰 Berhasil mencairkan ${inv.expectedReturn.toLocaleString('id-ID')} Koin ke dompetmu!`);

    EventBus.emit('new-chat-message', {
      id: `bank_msg_${Date.now()}`,
      sender: 'BANK SENTRAL',
      text: `💰 Kamu berhasil mencairkan dividen investasi sebesar ${inv.expectedReturn.toLocaleString('id-ID')} Koin!`,
      timestamp: Date.now(),
      isSystem: true,
    });

    EventBus.emit('player-gold-changed', { gold: newGold });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 sm:p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
        {/* Header Modal Bank */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0">
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-white font-mono">
                  BANK SENTRAL RADEN
                </h2>
                <span className="text-[9px] sm:text-[10px] bg-amber-900/60 text-amber-300 border border-amber-700/60 font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded">
                  LAYANAN FINANSIAL
                </span>
                {isUserAdmin && (
                  <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded">
                    👑 ADMIN (UNLIMITED)
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Simpanan tabungan koin aman dengan imbal hasil & investasi dividen real-time.
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

        {/* Ringkasan Saldo Dompet & Tabungan */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-900/60 border-b border-neutral-800 font-mono shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Dompet Tunai</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300">{goldDisplay} KOIN</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Saldo Rekening Bank</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">
                {isUserAdmin ? '99999999999' : savingsGold.toLocaleString('id-ID')} KOIN
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-4 sm:px-6 pt-1.5 sm:pt-2 gap-2 shrink-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('savings');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold font-mono tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'savings'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            TABUNGAN
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('investment');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold font-mono tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'investment'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            INVESTASI ({investments.filter(i => !i.claimed).length} AKTIF)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {statusMessage && (
            <div className="mb-4 p-3 bg-neutral-900 border border-amber-500/50 rounded-lg flex items-center gap-2 text-amber-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {activeTab === 'savings' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Kolom Kiri: Form Transaksi Tabungan */}
              <div className="md:col-span-7 bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                    PILIH JENIS TRANSAKSI
                  </span>
                  <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSavingsAction('deposit');
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${
                        savingsAction === 'deposit'
                          ? 'bg-amber-500 text-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Setor (Deposit)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSavingsAction('withdraw');
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${
                        savingsAction === 'withdraw'
                          ? 'bg-amber-500 text-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Tarik (Withdraw)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 font-mono mb-2">
                    Jumlah Koin ({savingsAction === 'deposit' ? 'Setor ke Bank' : 'Tarik ke Dompet'}):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="Masukkan nominal koin..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-sm text-amber-300 font-mono font-bold placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                    />
                    <Coins className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/40" />
                  </div>
                </div>

                {/* Tombol Pintas Nominal */}
                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAmountInput(amt.toString());
                      }}
                      className="flex-1 min-w-[70px] py-1.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-amber-300 text-xs font-mono rounded transition-colors"
                    >
                      +{amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (savingsAction === 'deposit') setAmountInput(effectiveGold.toString());
                      else setAmountInput(savingsGold.toString());
                    }}
                    className="py-1.5 px-4 bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 text-amber-400 text-xs font-mono font-bold rounded transition-colors"
                  >
                    SEMUA (MAX)
                  </button>
                </div>

                {/* Tombol Eksekusi */}
                <button
                  type="button"
                  onClick={savingsAction === 'deposit' ? handleDeposit : handleWithdraw}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer mt-1"
                >
                  {savingsAction === 'deposit' ? (
                    <>
                      <ArrowDownRight className="w-4 h-4" />
                      <span>SETOR KOIN KE TABUNGAN BANK</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>TARIK KOIN KE DOMPET TUNAI</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-neutral-500 leading-relaxed font-mono">
                  💡 Saldo tabungan aman dari resiko kehilangan dan otomatis mendapatkan bunga simpanan berkala.
                </div>
              </div>

              {/* Kolom Kanan: Histori Mutasi */}
              <div className="md:col-span-5 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider">
                  MUTASI REKENING BANK
                </span>
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-neutral-600 text-center py-10 font-mono">
                      Belum ada catatan mutasi transaksi.
                    </p>
                  ) : (
                    history.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {h.type === 'deposit' || h.type === 'claim' || h.type === 'interest' ? (
                            <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-bold truncate">{h.description}</p>
                            <span className="text-[9px] text-neutral-500">
                              {new Date(h.timestamp).toLocaleTimeString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Tab Investasi Real-Time */
            <div className="flex flex-col gap-6">
              {/* Pilihan Paket Investasi */}
              <div>
                <span className="text-xs font-bold font-mono text-neutral-300 block mb-3 uppercase tracking-wider">
                  PILIH PAKET INVESTASI KOIN EMAS:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {investmentPlans.map((plan, idx) => {
                    const isSelected = selectedPlan === idx;
                    return (
                      <div
                        key={plan.name}
                        onClick={() => {
                          sound.playClick();
                          setSelectedPlan(idx);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-neutral-900 border-amber-400 shadow-md'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold font-mono text-white">{plan.name}</span>
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {plan.rateLabel}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed mb-3">{plan.desc}</p>
                        </div>

                        <div className="pt-3 border-t border-neutral-800 text-xs font-mono flex flex-col gap-1.5">
                          <div className="flex justify-between text-neutral-400">
                            <span>Durasi Waktu:</span>
                            <span className="text-amber-300 font-bold">{plan.durationMinutes} Menit</span>
                          </div>
                          <div className="flex justify-between text-neutral-400">
                            <span>Minimal Modal:</span>
                            <span className="text-white font-bold">{plan.minAmount.toLocaleString('id-ID')} Koin</span>
                          </div>
                          <div className="flex justify-between text-neutral-400">
                            <span>Resiko:</span>
                            <span className="text-emerald-400">{plan.risk}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Masukkan Jumlah Investasi */}
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-neutral-300 font-mono mb-1">
                    Modal Investasi ({investmentPlans[selectedPlan].name}):
                  </label>
                  <input
                    type="number"
                    value={investAmountInput}
                    onChange={(e) => setInvestAmountInput(e.target.value)}
                    placeholder="Masukkan jumlah koin modal..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-end w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleInvest}
                    className="w-full md:w-auto py-2.5 px-6 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>MULAI INVESTASI SEKARANG</span>
                  </button>
                </div>
              </div>

              {/* Daftar Portofolio Investasi Aktif */}
              <div>
                <span className="text-xs font-bold font-mono text-neutral-300 block mb-3 uppercase tracking-wider">
                  PORTOFOLIO INVESTASI AKTIF ({investments.length}):
                </span>
                {investments.length === 0 ? (
                  <p className="text-xs text-neutral-500 p-8 text-center bg-neutral-900/30 rounded-xl border border-neutral-800 font-mono">
                    Belum ada paket investasi aktif. Pilih paket di atas untuk mulai mengembangkan modal koinmu!
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {investments.map((inv) => {
                      const elapsed = nowTime - inv.startTime;
                      const remainingMs = Math.max(0, inv.durationMs - elapsed);
                      const isReady = remainingMs === 0 || inv.claimed;
                      const progressPct = Math.min(100, Math.floor((elapsed / inv.durationMs) * 100));

                      const remSeconds = Math.ceil(remainingMs / 1000);
                      const remMin = Math.floor(remSeconds / 60);
                      const remSec = remSeconds % 60;
                      const timeStr = `${String(remMin).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;

                      return (
                        <div
                          key={inv.id}
                          className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono"
                        >
                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white">{inv.packageName}</span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                                Modal: {inv.principal.toLocaleString('id-ID')} Koin
                              </span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                                Hasil: +{inv.expectedReturn.toLocaleString('id-ID')} Koin
                              </span>
                            </div>

                            {/* Progress bar countdown */}
                            {!inv.claimed && (
                              <div className="mt-2.5 w-full">
                                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                  <span>{isReady ? '✅ Siap Dicairkan!' : `⏳ Proses: ${timeStr} tersisa`}</span>
                                  <span>{progressPct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isReady ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0">
                            {inv.claimed ? (
                              <span className="text-xs text-neutral-500 font-bold px-3 py-1.5 bg-neutral-950 rounded border border-neutral-800 inline-block">
                                DICAIRKAN (SELESAI)
                              </span>
                            ) : isReady ? (
                              <button
                                type="button"
                                onClick={() => handleClaimInvestment(inv.id)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-bold text-xs rounded-lg transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>KLAIM +{inv.expectedReturn.toLocaleString('id-ID')} KOIN</span>
                              </button>
                            ) : (
                              <div className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-400 text-xs flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                                <span>Jatuh Tempo: {timeStr}</span>
                              </div>
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
        </div>
      </div>
    </div>
  );
};
