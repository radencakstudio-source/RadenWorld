/**
 * ============================================================================
 * FILE: resources/js/game/ui/SocialAccountChooserModal.tsx
 * ============================================================================
 * Pop-up Dialog Pemilih Akun Google & Facebook (Cozycore Clay-Pixel):
 * Menampilkan akun yang tersimpan/terdeteksi di peramban serta opsi akun lain
 * dan jendela OAuth resmi, responsif di PC serta Mobile Portrait/Landscape.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Plus, ShieldCheck, Globe, ExternalLink } from 'lucide-react';
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

    if (detected.length === 0) {
      detected.push({
        email: provider === 'facebook' ? 'mahardika@facebook.com' : 'mahardikawhite12@gmail.com',
        name: 'Mahardika Putra',
        initial: 'M',
      });
    }

    const unique = detected.filter(
      (v, i, a) => a.findIndex((t) => t.email.toLowerCase() === v.email.toLowerCase()) === i
    );
    setAccounts(unique);
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const handleAccountClick = (acc: ISocialAccount) => {
    sound.playClick();
    setVerifyingAccount(acc.email);

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

    window.open(
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
        (window as any).FB.login(
          (response: any) => {
            if (response.authResponse) {
              (window as any).FB.api('/me', { fields: 'name,email,picture' }, (profile: any) => {
                if (profile && profile.name) {
                  sound.playSuccess();
                  onSelectAccount({
                    email:
                      profile.email ||
                      `${profile.name.replace(/\s+/g, '').toLowerCase()}@facebook.com`,
                    name: profile.name,
                    initial: profile.name[0].toUpperCase(),
                    avatarUrl: profile.picture?.data?.url,
                  });
                  onClose();
                }
              });
            }
          },
          { scope: 'public_profile,email' }
        );
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

  const providerLabel = provider === 'google' ? 'Google' : 'Facebook';

  return (
    <div className="ui-modal-backdrop z-[60] select-none">
      <div className="clay-panel landscape-compact-modal relative w-full max-w-[430px] max-h-[min(92dvh,calc(100dvh-1rem))] flex flex-col overflow-hidden text-black">
        {/* Header Clay-Pixel */}
        <div className="clay-header landscape-compact-header px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center shrink-0">
              {provider === 'google' ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-black uppercase leading-tight truncate">
                Pilih Akun {providerLabel}
              </h3>
              <p className="text-[10px] sm:text-xs text-black leading-tight truncate">
                {mode === 'link'
                  ? `Tautkan ke karakter ${targetCharacterName || 'Anda'}`
                  : 'Masuk ke dunia RadenWorld'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
            title="Tutup"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="landscape-compact-body p-3.5 sm:p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 space-y-2.5">
          {/* Info Izin Akses */}
          <div className="clay-card-secondary p-2.5 flex items-start gap-2 text-xs text-black">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="leading-snug">
              {providerLabel} membagikan nama profil dan alamat email terverifikasi kepada RadenWorld.
            </span>
          </div>

          {/* Daftar Akun Terdeteksi */}
          <div className="space-y-2">
            {accounts.map((acc) => {
              const isVerifying = verifyingAccount === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={!!verifyingAccount}
                  onClick={() => handleAccountClick(acc)}
                  className="clay-btn-neutral w-full p-2.5 sm:p-3 flex items-center justify-between gap-2.5 text-left text-black"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black font-bold text-sm flex items-center justify-center shrink-0">
                      {acc.initial || providerLabel[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-black truncate">
                        {acc.name}
                      </div>
                      <div className="text-[10px] sm:text-xs text-black truncate">
                        {provider === 'facebook' && !acc.email.includes('facebook')
                          ? acc.email
                          : acc.email}
                      </div>
                    </div>
                  </div>

                  {isVerifying ? (
                    <span className="clay-badge-primary px-2 py-0.5 text-[10px] font-bold text-black shrink-0">
                      Proses...
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Gunakan Akun Lain */}
          {!isAddingOther ? (
            <button
              type="button"
              disabled={!!verifyingAccount}
              onClick={() => {
                sound.playClick();
                setIsAddingOther(true);
              }}
              className="clay-btn-secondary w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold text-black"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Gunakan Akun {providerLabel} Lain</span>
            </button>
          ) : (
            <form
              onSubmit={handleCustomSubmit}
              onKeyDown={(e) => e.stopPropagation()}
              className="clay-card p-3 space-y-2.5 text-black"
            >
              <div className="text-xs font-bold text-black">
                Masukkan Email Akun {providerLabel}:
              </div>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder={
                  provider === 'google' ? 'nama.anda@gmail.com' : 'nama.anda@facebook.com'
                }
                className="clay-input w-full px-3 py-2 text-xs text-black"
                autoFocus
              />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Nama Akun ${providerLabel} (Opsional)`}
                className="clay-input w-full px-3 py-2 text-xs text-black"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!customEmail.trim() || !!verifyingAccount}
                  className="clay-btn-primary flex-1 py-2 px-3 text-xs font-bold text-black"
                >
                  Lanjutkan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsAddingOther(false);
                  }}
                  className="clay-btn-neutral py-2 px-3 text-xs font-bold text-black"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Tombol OAuth Resmi */}
        <div className="px-3.5 py-2.5 border-t-2 border-[#5C3A21] bg-[#FFF8EA] shrink-0 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleTriggerRealOAuth}
            className="clay-btn-primary w-full py-2 px-3 text-xs font-bold text-black flex items-center justify-center gap-2"
          >
            <Globe className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="truncate">Buka Login {providerLabel} Resmi (OAuth)</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
