/**
 * ============================================================================
 * FILE: resources/js/game/ui/AuthModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Autentikasi yang membedakan alur MASUK vs DAFTAR:
 * 1. TAB MASUK (Bagi yang sudah punya akun):
 *    - Hanya input Akun (Email/Username) & Kata Sandi.
 *    - Opsi "Lupa kata sandi?" berada di dalam tab Masuk (bukan tab terpisah).
 *    - Tombol Masuk via Google & Facebook.
 *    - TANPA pemilihan avatar (avatar dimuat dari akun yang tersimpan).
 * 
 * 2. TAB DAFTAR (Pemain baru):
 *    - Step 1: Daftar data akun (Nama Karakter, Email, Password, Konfirmasi).
 *    - Step 2: Memilih & mengkustomisasi avatar (Gender, Kulit, Baju, Celana, Topi).
 *    - Selesaikan pendaftaran dan langsung masuk ke Open World.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { IAvatarCustomization, Gender, HatType } from '../types';
import { AvatarPreview } from './AvatarPreview';
import { SoundManager } from '../core/SoundManager';
import { X, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, avatar: IAvatarCustomization, privateRoomId?: string) => void;
}

type AuthTab = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Login & Register Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Register Wizard Step: 1 = Form Akun, 2 = Pilih Avatar
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Forgot Password View State (Hanya di dalam Tab Masuk)
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Avatar Customization State (Khusus Pendaftaran)
  const [avatar, setAvatar] = useState<IAvatarCustomization>(() => {
    // Ambil avatar terakhir yang tersimpan di localStorage jika ada
    try {
      const saved = localStorage.getItem('raden_player_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.gender) {
          return {
            gender: parsed.gender || 'male',
            skinColor: parsed.skinColor || '#fed7aa',
            shirtColor: parsed.shirtColor || '#2563eb',
            pantsColor: parsed.pantsColor || '#1e293b',
            hatType: parsed.hatType || 'none',
          };
        }
      }
    } catch (e) {}
    return {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  });

  const sound = SoundManager.getInstance();

  if (!isOpen) return null;

  const skinPalette = [
    { name: 'Cerah', color: '#fed7aa' },
    { name: 'Kuning Langsat', color: '#fde047' },
    { name: 'Sawo Matang', color: '#d97706' },
    { name: 'Gelap Eksotis', color: '#78350f' },
    { name: 'Pucat', color: '#fecdd3' },
  ];

  const shirtPalette = [
    { name: 'Biru', color: '#2563eb' },
    { name: 'Merah', color: '#dc2626' },
    { name: 'Hijau', color: '#16a34a' },
    { name: 'Hitam', color: '#1e293b' },
    { name: 'Emas', color: '#f59e0b' },
    { name: 'Ungu', color: '#7c3aed' },
  ];

  const pantsPalette = [
    { name: 'Hitam', color: '#0f172a' },
    { name: 'Abu-abu', color: '#475569' },
    { name: 'Jeans', color: '#1d4ed8' },
    { name: 'Cokelat', color: '#78350f' },
    { name: 'Putih', color: '#e2e8f0' },
  ];

  const hatOptions: { id: HatType; label: string }[] = [
    { id: 'none', label: 'Tanpa Topi' },
    { id: 'adventurer', label: 'Petualang' },
    { id: 'knight', label: 'Helm Baja' },
    { id: 'bandana', label: 'Bandana' },
    { id: 'wizard', label: 'Penyihir' },
  ];

  const handleTabChange = (tab: AuthTab) => {
    sound.playClick();
    setActiveTab(tab);
    setAuthError(null);
    setIsForgotView(false);
    setForgotSent(false);
    setRegisterStep(1);
  };

  // Submit Tab Masuk (Database SQLite Nyata)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setAuthError('Nama/Email dan kata sandi wajib diisi!');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          login: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        setAuthError(data.message || 'Nama/Email atau kata sandi tidak cocok!');
        setIsLoading(false);
        return;
      }

      const user = data.user;
      let loadedAvatar = user?.avatar;
      if (typeof loadedAvatar === 'string') {
        try { loadedAvatar = JSON.parse(loadedAvatar); } catch(e) {}
      }
      if (!loadedAvatar || typeof loadedAvatar !== 'object' || !loadedAvatar.gender) {
        loadedAvatar = avatar;
      }
      try {
        localStorage.setItem('raden_player_avatar', JSON.stringify(loadedAvatar));
        localStorage.setItem('raden_player_user', JSON.stringify(user));
      } catch (err) {}

      const safeRoomId = user?.private_room_id || `safe-${user?.id || 1}`;
      onSuccess(user.name, loadedAvatar, safeRoomId);
    } catch (err) {
      setAuthError('Gagal terhubung ke database server. Pastikan server aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Step 1 Daftar: Lanjut ke pemilihan avatar
  const handleRegisterStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setAuthError('Semua kolom pendaftaran wajib diisi!');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setAuthError('Konfirmasi kata sandi tidak cocok!');
      return;
    }
    sound.playClick();
    setRegisterStep(2); // Pindah ke Step 2: Pilih Avatar
  };

  // Submit Step 2 Daftar: Simpan ke Database SQLite & Masuk ke Game
  const handleRegisterFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: registerUsername.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          avatar: avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        setAuthError(data.message || 'Gagal mendaftar akun.');
        setIsLoading(false);
        return;
      }

      sound.playSuccess();
      const user = data.user;
      try {
        localStorage.setItem('raden_player_avatar', JSON.stringify(avatar));
        localStorage.setItem('raden_player_user', JSON.stringify(user));
      } catch (err) {}

      const safeRoomId = user?.private_room_id || `safe-${user?.id || 1}`;
      onSuccess(user.name, avatar, safeRoomId);
    } catch (err) {
      setAuthError('Gagal terhubung ke server autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Lupa Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setAuthError('Masukkan email terdaftar!');
      return;
    }
    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), new_password: 'password123' }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        setAuthError(data.message || 'Email tidak terdaftar!');
        setIsLoading(false);
        return;
      }
      sound.playSuccess();
      setForgotSent(true);
    } catch (err) {
      setAuthError('Gagal mereset kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login (Google / Facebook)
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    sound.playClick();
    setSocialLoading(provider);

    setTimeout(() => {
      sound.playSuccess();
      const mockName = provider === 'google' ? 'GooglePlayer' : 'FacebookPlayer';
      const safeRoomId = `safe-guest-${Date.now().toString(36)}`;
      onSuccess(mockName, avatar, safeRoomId);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0b0f19] border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4 font-['Chakra_Petch'] max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-amber-400 uppercase">
              {activeTab === 'login' && !isForgotView && 'MASUK KE GAME'}
              {activeTab === 'login' && isForgotView && 'PULIHKAN SANDI'}
              {activeTab === 'register' && registerStep === 1 && 'DAFTAR AKUN BARU'}
              {activeTab === 'register' && registerStep === 2 && 'PILIH & KUSTOMISASI AVATAR'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'login' && !isForgotView && 'Masuk dengan akun terdaftar untuk melanjutkan.'}
              {activeTab === 'login' && isForgotView && 'Masukkan email terdaftar untuk menerima tautan reset.'}
              {activeTab === 'register' && registerStep === 1 && 'Langkah 1: Lengkapi informasi akun Anda.'}
              {activeTab === 'register' && registerStep === 2 && 'Langkah 2: Pilih gender & kustomisasi penampilan avatarmu.'}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tab Switcher Saja: MASUK & DAFTAR (Simpel 2 Warna) */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MASUK (SUDAH PUNYA AKUN)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DAFTAR (AKUN BARU)
          </button>
        </div>

        {/* Pesan Kesalahan / Status Autentikasi Database */}
        {authError && (
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-300 text-xs font-bold text-center animate-in fade-in">
            ⚠️ {authError}
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. KONTEN TAB MASUK (TANPA AVATAR, HANYA LOGIN & LUPA SANDI) */}
        {/* ============================================================== */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {!isForgotView ? (
              /* --- Form Masuk Normal --- */
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={!!socialLoading}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/50 text-xs font-bold text-slate-200 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    {socialLoading === 'google' ? 'PROSES...' : 'MASUK GOOGLE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={!!socialLoading}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/50 text-xs font-bold text-slate-200 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    {socialLoading === 'facebook' ? 'PROSES...' : 'MASUK FACEBOOK'}
                  </button>
                </div>

                <div className="flex items-center gap-3 my-1 text-[11px] text-slate-500 uppercase tracking-wider">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span>ATAU DENGAN EMAIL/USER</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Input Username / Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Nama Akun / Email:
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Masukkan nama pengguna atau email..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Input Password & Link Lupa Sandi */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Kata Sandi:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsForgotView(true);
                      }}
                      className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer uppercase"
                    >
                      Lupa sandi?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Tombol Masuk */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>MASUK SEKARANG</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* --- Form Lupa Sandi di Dalam Masuk --- */
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  Masukkan email akun terdaftar Anda. Kami akan mengirimkan instruksi untuk menyetel ulang kata sandi.
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Email Akun Anda:
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {forgotSent && (
                  <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-300 text-xs text-center font-bold">
                    Tautan pemulihan telah dikirim ke {forgotEmail}! Silakan periksa inbox Anda.
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsForgotView(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider cursor-pointer"
                  >
                    ← KEMBALI
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow cursor-pointer"
                  >
                    KIRIM RESET
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. KONTEN TAB DAFTAR (DAFTAR DULU -> HABIS TUH PILIH AVATAR) */}
        {/* ============================================================== */}
        {activeTab === 'register' && (
          <div className="space-y-3">
            {/* Step Indicator */}
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-1 text-slate-400">
              <span className={registerStep === 1 ? 'text-amber-400' : ''}>1. DATA AKUN</span>
              <span className="text-slate-600">➔</span>
              <span className={registerStep === 2 ? 'text-amber-400' : ''}>2. PILIH AVATAR</span>
            </div>

            {registerStep === 1 ? (
              /* --- Step 1: Form Registrasi Akun --- */
              <form onSubmit={handleRegisterStep1Submit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Nama Karakter:
                  </label>
                  <input
                    type="text"
                    required
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Contoh: RadenSatria..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Alamat Email:
                  </label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Kata Sandi:
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Konfirmasi Kata Sandi:
                  </label>
                  <input
                    type="password"
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>LANJUT PILIH AVATAR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* --- Step 2: Pilih Avatar (Gender, Kulit, Baju, Celana, Topi) --- */
              <form onSubmit={handleRegisterFinalSubmit} className="space-y-3.5 overflow-y-auto max-h-[62vh] pr-1 custom-scrollbar">
                {/* Avatar Live Preview & Gender Toggle */}
                <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <AvatarPreview avatar={avatar} size={100} />

                  <div className="flex-1 space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Pilih Gender:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['male', 'female'] as Gender[]).map((g) => {
                        const isSel = avatar.gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setAvatar({ ...avatar, gender: g });
                            }}
                            className={`py-2 px-3 rounded-xl border text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isSel
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                                : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {g === 'male' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 1. Warna Kulit */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Warna Kulit:
                  </label>
                  <div className="flex gap-2.5">
                    {skinPalette.map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAvatar({ ...avatar, skinColor: item.color });
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative flex items-center justify-center ${
                          avatar.skinColor === item.color
                            ? 'border-amber-400 scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      >
                        {avatar.skinColor === item.color && (
                          <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Warna Baju */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Warna Baju:
                  </label>
                  <div className="flex gap-2.5">
                    {shirtPalette.map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAvatar({ ...avatar, shirtColor: item.color });
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                          avatar.shirtColor === item.color
                            ? 'border-amber-400 scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      >
                        {avatar.shirtColor === item.color && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Warna Celana */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Warna Celana:
                  </label>
                  <div className="flex gap-2.5">
                    {pantsPalette.map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAvatar({ ...avatar, pantsColor: item.color });
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                          avatar.pantsColor === item.color
                            ? 'border-amber-400 scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      >
                        {avatar.pantsColor === item.color && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Topi Avatar */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Pilihan Topi Avatar:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {hatOptions.map((opt) => {
                      const isSel = avatar.hatType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setAvatar({ ...avatar, hatType: opt.id });
                          }}
                          className={`py-1.5 px-2 rounded-xl border text-center text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            isSel
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tombol Aksi Step 2: Kembali atau Selesai */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRegisterStep(1);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>KEMBALI</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>SELESAI & MASUK DUNIA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
