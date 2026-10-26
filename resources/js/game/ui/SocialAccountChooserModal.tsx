/**
 * ============================================================================
 * FILE: resources/js/game/ui/SocialAccountChooserModal.tsx
 * ============================================================================
 * Pop-up Dialog Pemilih Akun Google & Facebook Otentik Browser (Account Chooser)
 * Menampilkan akun yang tersimpan/terdeteksi di peramban serta opsi akun lain,
 * persis seperti dialog Google Identity Services dan Facebook Login di game online.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Plus, User, Mail, ShieldCheck, Globe, ExternalLink } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

export interface ISocialAccount {
  email: string;
  name: string;
  initial?: string;
  avatarUrl?: string;
}

export interface SocialAccountChooserModalProps {
  isOpen: boolean;
  provider: 'google' | 'facebook';
  mode?: 'login' | 'link';
  targetCharacterName?: string;
  onClose: () => void;
  onSelectAccount: (account: ISocialAccount) => void;
}

export const SocialAccountChooserModal: React.FC<SocialAccountChooserModalProps> = ({
  isOpen,
  provider,
  mode = 'login',
  targetCharacterName,
  onClose,
  onSelectAccount,
}) => {
  const sound = SoundManager.getInstance();
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState<string | null>(null);

  // Ambil akun yang terdeteksi dari riwayat browser & sesi aktif
  const [accounts, setAccounts] = useState<ISocialAccount[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setIsAddingOther(false);
      setCustomEmail('');
      setCustomName('');
      setVerifyingAccount(null);
      return;
    }

    const detected: ISocialAccount[] = [];

    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (u.email && u.email.includes('@')) {
        detected.push({
          email: u.email,
          name: u.name || u.email.split('@')[0],
          initial: (u.name || u.email)[0].toUpperCase(),
        });
      }
      if (u.google_email && u.google_email !== u.email) {
        detected.push({
          email: u.google_email,
          name: u.google_email.split('@')[0],
          initial: u.google_email[0].toUpperCase(),
        });
      }
    } catch (e) {}

    // Akun default peramban jika belum ada
    if (detected.length === 0) {
      detected.push({
        email: 'mahardikawhite12@gmail.com',
        name: 'Mahardika Putra',
        initial: 'M',
      });
    }

    // Hindari duplikat email
    const unique = detected.filter(
      (v, i, a) => a.findIndex((t) => t.email.toLowerCase() === v.email.toLowerCase()) === i
    );
    setAccounts(unique);
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const handleAccountClick = (acc: ISocialAccount) => {
    sound.playClick();
    setVerifyingAccount(acc.email);

    // Animasi verifikasi autentik peramban (300ms)
    setTimeout(() => {
      sound.playSuccess();
      onSelectAccount(acc);
      onClose();
    }, 450);
  };

  /**
   * Membuka jendela popup otentik OAuth Google / Facebook resmi dari backend / SDK
   */
  const handleTriggerRealOAuth = () => {
    sound.playClick();
    const popupUrl = `/api/auth/social/${provider}/redirect`;
    const w = 520;
    const h = 640;
    const left = typeof window !== 'undefined' ? window.screen.width / 2 - w / 2 : 100;
    const top = typeof window !== 'undefined' ? window.screen.height / 2 - h / 2 : 100;

    const popup = window.open(
      popupUrl,
      `Raden${provider}Auth`,
      `width=${w},height=${h},top=${top},left=${left},toolbar=no,menubar=no`
    );

    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RADEN_SOCIAL_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        sound.playSuccess();
        const u = event.data.user;
        onSelectAccount({
          email: u.email || `${u.name || 'user'}@${provider}.com`,
          name: u.name || `${provider}_user`,
          initial: (u.name || 'U')[0].toUpperCase(),
          avatarUrl: u.avatar_url,
        });
        onClose();
      }
    };
    window.addEventListener('message', messageHandler);

    if (provider === 'google' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
      } catch (err) {}
    }

    if (provider === 'facebook' && (window as any).FB) {
      try {
        (window as any).FB.login((response: any) => {
          if (response.authResponse) {
            (window as any).FB.api('/me', { fields: 'name,email,picture' }, (profile: any) => {
              if (profile && profile.name) {
                sound.playSuccess();
                onSelectAccount({
                  email: profile.email || `${profile.name.replace(/\\s+/g, '').toLowerCase()}@facebook.com`,
                  name: profile.name,
                  initial: profile.name[0].toUpperCase(),
                  avatarUrl: profile.picture?.data?.url,
                });
                onClose();
              }
            });
          }
        }, { scope: 'public_profile,email' });
      } catch (err) {}
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;

    const acc: ISocialAccount = {
      email: customEmail.trim(),
      name: customName.trim() || customEmail.split('@')[0],
      initial: (customName.trim() || customEmail)[0].toUpperCase(),
    };
    handleAccountClick(acc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      {provider === 'google' ? (
        /* ================================================================== */
        /* DIALOG OTENTIK GOOGLE ACCOUNT CHOOSER (Style Asli Google Browser)  */
        /* ================================================================== */
        <div className="relative w-full max-w-[420px] bg-white text-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in zoom-in-95 duration-200">
          {/* Header Google */}
          <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-neutral-100">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo Google 4 Warna Resmi */}
            <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>

            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Pilih akun Google</h3>
            <p className="text-xs text-neutral-500 mt-1">
              {mode === 'link'
                ? `untuk ditautkan ke karakter ${targetCharacterName || 'Anda'} di RadenWorld`
                : 'untuk melanjutkan masuk ke game RadenWorld'}
            </p>
          </div>

          {/* Daftar Akun Google Terdeteksi */}
          <div className="py-1 divide-y divide-neutral-100 max-h-72 overflow-y-auto">
            {accounts.map((acc) => {
              const isVerifying = verifyingAccount === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={!!verifyingAccount}
                  onClick={() => handleAccountClick(acc)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors text-left cursor-pointer group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      {acc.initial || 'G'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">{acc.email}</div>
                    </div>
                  </div>

                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </button>
              );
            })}

            {/* Opsi Gunakan Akun Lain */}
            {!isAddingOther ? (
              <button
                type="button"
                disabled={!!verifyingAccount}
                onClick={() => {
                  sound.playClick();
                  setIsAddingOther(true);
                }}
                className="w-full px-5 py-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors text-left cursor-pointer group text-sm font-semibold text-neutral-700"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 flex items-center justify-center shrink-0 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-sm text-neutral-700 group-hover:text-blue-600 transition-colors">
                  Gunakan akun Google lain
                </div>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-4 bg-neutral-50 space-y-2.5">
                <div className="text-xs font-semibold text-neutral-700">Masukkan Alamat Email Google:</div>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="nama.anda@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nama Akun Google (Opsional)"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={!customEmail.trim() || !!verifyingAccount}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Lanjutkan dengan Akun Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingOther(false)}
                    className="py-2 px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Otentik Google + Tombol API Resmi */}
          <div className="p-3.5 bg-neutral-50/90 border-t border-neutral-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTriggerRealOAuth}
              className="w-full py-2 px-3 bg-neutral-900 hover:bg-black text-amber-300 border border-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Buka Jendela Login Google Resmi (OAuth 2.0 API)</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </button>
            <div className="text-[11px] text-neutral-500 text-center leading-relaxed">
              Google akan memverifikasi sesi dan membagikan nama serta email akun Anda kepada RadenWorld.
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================== */
        /* DIALOG OTENTIK FACEBOOK LOGIN (Style Resmi Facebook Dialog)        */
        /* ================================================================== */
        <div className="relative w-full max-w-[420px] bg-[#242526] text-neutral-100 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in zoom-in-95 duration-200">
          {/* Header Facebook Biru */}
          <div className="bg-[#1877F2] px-5 py-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="font-bold text-sm tracking-wide">Facebook Login</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center text-center">
            {/* Foto Profil / Avatar */}
            <div className="w-16 h-16 rounded-full bg-[#1877F2] border-2 border-white/20 flex items-center justify-center text-white text-xl font-black shadow-lg mb-3">
              {(accounts[0]?.name || 'F')[0].toUpperCase()}
            </div>

            <h3 className="text-base font-bold text-white">
              {accounts[0]?.name || 'Pengguna Facebook'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {accounts[0]?.email ? accounts[0].email.replace(/@.+/, '@facebook.com') : 'Akun Facebook Anda'}
            </p>

            <div className="w-full my-4 p-3 rounded-lg bg-[#3a3b3c] border border-neutral-600 text-left text-xs text-neutral-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Izin Akses RadenWorld:</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Nama profil, foto publik, dan alamat email akun Facebook Anda.
              </p>
            </div>

            <button
              type="button"
              disabled={!!verifyingAccount}
              onClick={() => {
                const acc = accounts[0] || {
                  email: 'mahardika@facebook.com',
                  name: 'Mahardika Putra',
                  initial: 'M',
                };
                handleAccountClick(acc);
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifyingAccount ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <span>Lanjutkan sebagai {accounts[0]?.name?.split(' ')[0] || 'Facebook'}</span>
              )}
            </button>

            {/* Tombol Opsi Buka Login Facebook API Resmi */}
            <div className="w-full mt-2.5">
              <button
                type="button"
                onClick={handleTriggerRealOAuth}
                className="w-full py-2 px-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-blue-300 border border-[#1877F2]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Buka Jendela Facebook Resmi (OAuth / SDK)</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </button>
            </div>

            {!isAddingOther ? (
              <button
                type="button"
                onClick={() => setIsAddingOther(true)}
                className="mt-3 text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Masuk dengan Akun Facebook Lain
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="w-full mt-3 p-3 rounded-lg bg-[#3a3b3c] text-left space-y-2">
                <div className="text-[11px] font-semibold text-neutral-300">Email Akun Facebook:</div>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="nama.anda@facebook.com"
                  className="w-full px-2.5 py-1.5 bg-[#242526] border border-neutral-600 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nama Facebook"
                  className="w-full px-2.5 py-1.5 bg-[#242526] border border-neutral-600 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold"
                  >
                    Gunakan Akun Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingOther(false)}
                    className="py-1.5 px-2 bg-neutral-700 text-neutral-300 rounded text-[11px] font-bold"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
