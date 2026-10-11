/**
 * ============================================================================
 * FILE: resources/js/game/ui/TopUpModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Top Up Berlian (Diamonds) bergaya Dark Obsidian (#080808) & Cyan Gem (#38bdf8).
 * 
 * FITUR:
 * 1. Pilihan paket Top Up Berlian: 50 ✦, 150 ✦, 500 ✦, 1,200 ✦.
 * 2. Metode pembayaran (QRIS, GoPay, DANA, ShopeePay, Virtual Account).
 * 3. Eksekusi top up langsung menambah saldo berlian dan suara sukses.
 * ============================================================================
 */

import React, { useState } from 'react';
import { Gem, X, Check, ShieldCheck, Zap, QrCode } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

interface TopUpPackage {
  id: string;
  diamonds: number;
  bonus: number;
  priceIdr: number;
  tag?: string;
}

const TOP_UP_PACKAGES: TopUpPackage[] = [
  { id: 'pkg-1', diamonds: 50, bonus: 0, priceIdr: 10000 },
  { id: 'pkg-2', diamonds: 150, bonus: 15, priceIdr: 25000, tag: 'POPULER' },
  { id: 'pkg-3', diamonds: 500, bonus: 75, priceIdr: 75000, tag: 'TERBAIK' },
  { id: 'pkg-4', diamonds: 1200, bonus: 250, priceIdr: 150000, tag: 'SULTAN' },
];

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDiamonds: number;
  onSuccessTopUp: (addedDiamonds: number) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  currentDiamonds,
  onSuccessTopUp,
}) => {
  const sound = SoundManager.getInstance();
  const [selectedPkg, setSelectedPkg] = useState<TopUpPackage>(TOP_UP_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'gopay' | 'dana'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = () => {
    sound.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      const totalDiamonds = selectedPkg.diamonds + selectedPkg.bonus;
      onSuccessTopUp(totalDiamonds);
      sound.playSuccess();
      setIsProcessing(false);
      setSuccessMessage(`Berhasil top up +${totalDiamonds} Berlian!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 font-['Chakra_Petch']">
      <div className="relative w-full max-w-md bg-[#080808] border border-cyan-500/40 rounded-xl p-5 text-neutral-100 flex flex-col gap-4 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
              <Gem className="w-4 h-4 fill-cyan-400/30" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400">
                TOP UP BERLIAN
              </h2>
              <p className="text-[10px] text-neutral-400 font-medium">
                Saldo Saat Ini: <span className="text-cyan-300 font-bold">{currentDiamonds} ✦</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-md border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div className="text-sm font-black text-emerald-400 uppercase tracking-wider">
              PEMBAYARAN BERHASIL!
            </div>
            <div className="text-xs text-neutral-300">
              {successMessage}
            </div>
          </div>
        ) : (
          <>
            {/* DAFTAR PAKET BERLIAN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Pilih Paket Berlian
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TOP_UP_PACKAGES.map((pkg) => {
                  const isSelected = selectedPkg.id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedPkg(pkg);
                      }}
                      className={`relative p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                          : 'bg-[#101010] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {pkg.tag && (
                        <span className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.2 rounded bg-cyan-400 text-black uppercase tracking-wider">
                          {pkg.tag}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-cyan-300 font-black text-sm">
                        <Gem className="w-3.5 h-3.5 fill-cyan-400/40" />
                        <span>{pkg.diamonds}</span>
                        {pkg.bonus > 0 && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            +{pkg.bonus}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-neutral-200 mt-2">
                        Rp {pkg.priceIdr.toLocaleString('id-ID')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* METODE PEMBAYARAN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'gopay', label: 'GoPay', icon: Zap },
                  { id: 'dana', label: 'DANA', icon: ShieldCheck },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPaymentMethod(item.id as any);
                    }}
                    className={`p-2 rounded-md border text-center flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === item.id
                        ? 'bg-neutral-800 border-cyan-400 text-cyan-300'
                        : 'bg-[#101010] border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RINGKASAN & TOMBOL BELI */}
            <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-semibold">Total Pembayaran:</span>
                <span className="text-sm font-black text-cyan-400">
                  Rp {selectedPkg.priceIdr.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePurchase}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>MEMPROSES TRANSAKSI...</span>
                ) : (
                  <>
                    <Gem className="w-4 h-4 fill-black" />
                    <span>BAYAR SEKARANG (TOP UP)</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
