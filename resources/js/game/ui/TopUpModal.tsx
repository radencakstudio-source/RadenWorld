/**
 * ============================================================================
 * FILE: resources/js/game/ui/TopUpModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Top Up Berlian (Diamonds).
 * Gaya Visual: Chunky Pastel Pixel (Cozycore UI) & Cute Minimalist Clay-Pixel.
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
    <div className="ui-modal-backdrop font-pixel">
      <div className="relative w-full max-w-md clay-panel landscape-compact-modal overflow-hidden text-black flex flex-col max-h-[min(94dvh,calc(100dvh-1rem))]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 clay-header landscape-compact-header shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 clay-card flex items-center justify-center text-black shrink-0">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                TOP UP BERLIAN
              </h2>
              <p className="text-[10px] text-black font-bold">
                Saldo Saat Ini: <span>{currentDiamonds} ✦</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 clay-btn-cocoa text-white flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3.5 overflow-y-auto custom-scrollbar landscape-compact-body">
          {successMessage ? (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-2.5">
              <div className="w-14 h-14 clay-card-secondary flex items-center justify-center text-black">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div className="text-sm font-bold text-black uppercase tracking-wider">
                PEMBAYARAN BERHASIL!
              </div>
              <div className="text-xs text-black">{successMessage}</div>
            </div>
          ) : (
            <>
              {/* DAFTAR PAKET BERLIAN */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-black uppercase tracking-wider">
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
                        className={`relative p-3 text-left flex flex-col justify-between ${
                          isSelected ? 'clay-btn-secondary text-black' : 'clay-btn-neutral text-black'
                        }`}
                      >
                        {pkg.tag && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 clay-badge-primary text-black uppercase">
                            {pkg.tag}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-black font-bold text-sm">
                          <Gem className="w-3.5 h-3.5" />
                          <span>{pkg.diamonds}</span>
                          {pkg.bonus > 0 && (
                            <span className="text-[10px] font-bold">+{pkg.bonus}</span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-black mt-2">
                          Rp {pkg.priceIdr.toLocaleString('id-ID')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* METODE PEMBAYARAN */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-black uppercase tracking-wider">
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
                      className={`p-2 text-center flex items-center justify-center gap-1.5 text-xs font-bold ${
                        paymentMethod === item.id
                          ? 'clay-btn-secondary text-black'
                          : 'clay-btn-neutral text-black'
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RINGKASAN & TOMBOL BELI */}
              <div className="pt-2.5 border-t-2 border-[#5C3A21] flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-black">
                  <span className="font-bold">Total Pembayaran:</span>
                  <span className="text-sm font-bold">
                    Rp {selectedPkg.priceIdr.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePurchase}
                  className="w-full py-2.5 clay-btn-primary text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>MEMPROSES TRANSAKSI...</span>
                  ) : (
                    <>
                      <Gem className="w-4 h-4" />
                      <span>BAYAR SEKARANG (TOP UP)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
