/**
 * ============================================================================
 * FILE: resources/js/game/ui/AuthModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Autentikasi Modern, Bersih, dan Flat Pure Black:
 * 1. TAB MASUK:
 *    - Login via Email / Username & Password
 *    - Opsi "Lupa kata sandi?" terintegrasi
 *    - Masuk cepat via Google & Facebook
 * 
 * 2. TAB DAFTAR:
 *    - Step 1: Input Data Akun + TANGGAL LAHIR (Otomatis hitung umur)
 *    - Step 2: Pemilihan Avatar SIMPEL (Khusus MALE atau FEMALE saja,
 *              tanpa pilihan warna kulit, rambut, atasan, dan bawahan)
 *    - Selesaikan pendaftaran dan langsung terhubung ke Open World
 * ============================================================================
 */

import React, { useState } from 'react';
import { IAvatarCustomization, Gender } from '../types';
import { AvatarPreview } from './AvatarPreview';
import { SoundManager } from '../core/SoundManager';
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Lock,
  AlertCircle,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, avatar: IAvatarCustomization, privateRoomId?: string) => void;
}

type AuthTab = 'login' | 'register';

/**
 * Fungsi utilitas untuk menghitung umur secara akurat dari tanggal lahir (YYYY-MM-DD)
 */
export function calculateAgeFromBirthDate(birthDateString: string): number {
  if (!birthDateString) return 21;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 21;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State (Termasuk Tanggal Lahir)
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerBirthDate, setRegisterBirthDate] = useState('2003-01-01');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Register Wizard Step: 1 = Form Akun & Tanggal Lahir, 2 = Pilih Gender Avatar (Male / Female)
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Gender Avatar Terpilih (Hanya Male / Female)
  const [selectedGender, setSelectedGender] = useState<Gender>(() => {
    try {
      const saved = localStorage.getItem('raden_player_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.gender === 'female') return 'female';
      }
    } catch (e) {}
    return 'male';
  });

  // Forgot Password View State
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sound = SoundManager.getInstance();

  if (!isOpen) return null;

  // Tanggal hari ini untuk batasan input max tanggal lahir
  const todayDate = new Date().toISOString().split('T')[0];
  const calculatedAge = calculateAgeFromBirthDate(registerBirthDate);

  // Template Avatar Sesuai Gender Pilihan
  const getAvatarForGender = (gender: Gender): IAvatarCustomization => {
    return {
      gender,
      skinColor: '#fed7aa',
      shirtColor: gender === 'female' ? '#ec4899' : '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  };

  const handleTabChange = (tab: AuthTab) => {
    sound.playClick();
    setActiveTab(tab);
    setAuthError(null);
    setIsForgotView(false);
    setForgotSent(false);
    setRegisterStep(1);
  };

  // Submit Tab Masuk (Database SQLite)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setAuthError('Nama Akun/Email dan kata sandi wajib diisi!');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

      sound.playSuccess();
      const user = data.user;
      let loadedAvatar = user?.avatar;
      if (typeof loadedAvatar === 'string') {
        try {
          loadedAvatar = JSON.parse(loadedAvatar);
        } catch (e) {}
      }
      if (!loadedAvatar || typeof loadedAvatar !== 'object' || !loadedAvatar.gender) {
        loadedAvatar = getAvatarForGender('male');
      }

      try {
        localStorage.setItem('raden_player_avatar', JSON.stringify(loadedAvatar));
        localStorage.setItem('raden_player_user', JSON.stringify(user));
      } catch (err) {}

      const safeRoomId = user?.private_room_id || `safe-${user?.id || 1}`;
      onSuccess(user.name, loadedAvatar, safeRoomId);
      onClose();
    } catch (err) {
      setAuthError('Gagal terhubung ke database server. Pastikan server aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Step 1 Daftar: Validasi Akun & Tanggal Lahir -> Lanjut ke Pilih Avatar Male/Female
  const handleRegisterStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setAuthError('Semua kolom pendaftaran wajib diisi!');
      return;
    }

    if (!registerBirthDate) {
      setAuthError('Tanggal lahir wajib diisi untuk menghitung umur karakter!');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setAuthError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    sound.playClick();
    setRegisterStep(2); // Pindah ke Step 2: Pilih Avatar Male / Female
  };

  // Submit Step 2 Daftar: Simpan ke Database SQLite & Masuk ke Game
  const handleRegisterFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    const finalAvatar = getAvatarForGender(selectedGender);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: registerUsername.trim(),
          email: registerEmail.trim(),
          birth_date: registerBirthDate,
          password: registerPassword,
          avatar: finalAvatar,
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
        localStorage.setItem('raden_player_avatar', JSON.stringify(finalAvatar));
        localStorage.setItem('raden_player_user', JSON.stringify(user));
      } catch (err) {}

      const safeRoomId = user?.private_room_id || `safe-${user?.id || 1}`;
      onSuccess(user.name, finalAvatar, safeRoomId);
      onClose();
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
      setAuthError('Email wajib diisi!');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        setAuthError(data.message || 'Email tidak terdaftar!');
      } else {
        sound.playSuccess();
        setForgotSent(true);
      }
    } catch (err) {
      setAuthError('Gagal menghubungi server reset sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login Mock
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    sound.playClick();
    setSocialLoading(provider);
    setAuthError(null);

    setTimeout(() => {
      setSocialLoading(null);
      const guestName = `${provider === 'google' ? 'Google' : 'FB'}_${Math.floor(1000 + Math.random() * 9000)}`;
      const guestAvatar = getAvatarForGender('male');
      const safeRoomId = `safe-social-${Date.now().toString(36)}`;
      sound.playSuccess();
      onSuccess(guestName, guestAvatar, safeRoomId);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 font-['Chakra_Petch'] select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-black border border-neutral-800 rounded-xl flex flex-col overflow-hidden max-h-[94dvh]">

        {/* ==================================================================== */}
        {/* HEADER MODAL: Flat Pure Black                                        */}
        {/* ==================================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
              {activeTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-amber-400 tracking-wider uppercase">
                  {activeTab === 'login' ? 'Masuk ke Game' : 'Daftar Akun Baru'}
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded">
                  PORTAL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 hidden sm:block">
                {activeTab === 'login'
                  ? 'Akses akun petualangan open world Anda yang telah terdaftar.'
                  : 'Buat identitas karakter baru dan mulai petualangan di RadenWorld.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-md text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TAB NAVIGATION BAR (MASUK vs DAFTAR)                                 */}
        {/* ==================================================================== */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-2.5 pb-2 border-b border-neutral-800 bg-[#0a0a0a] shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-500 text-black font-black'
                : 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>1. MASUK KE GAME</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-500 text-black font-black'
                : 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>2. DAFTAR AKUN BARU</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* MODAL CONTENT BODY                                                   */}
        {/* ==================================================================== */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1 min-h-0">

          {/* Banner Error jika ada */}
          {authError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-neutral-900 border border-amber-500/50 rounded-md text-amber-300 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* ================================================================== */}
          {/* 1. KONTEN TAB MASUK                                                */}
          {/* ================================================================== */}
          {activeTab === 'login' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {!isForgotView ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Quick Social Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      disabled={!!socialLoading}
                      className="py-2.5 px-3 rounded-md bg-[#0e0e0e] hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400 text-xs font-bold text-neutral-200 transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{socialLoading === 'google' ? 'Menghubungkan...' : 'Google'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin('facebook')}
                      disabled={!!socialLoading}
                      className="py-2.5 px-3 rounded-md bg-[#0e0e0e] hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400 text-xs font-bold text-neutral-200 transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{socialLoading === 'facebook' ? 'Menghubungkan...' : 'Facebook'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 my-1 text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                    <div className="flex-1 h-px bg-neutral-800" />
                    <span>ATAU DENGAN AKUN TERDAFTAR</span>
                    <div className="flex-1 h-px bg-neutral-800" />
                  </div>

                  {/* Input Username / Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Nama Karakter atau Email:</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Masukkan nama pengguna atau email..."
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                    />
                  </div>

                  {/* Input Password & Lupa Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kata Sandi:</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setIsForgotView(true);
                        }}
                        className="text-[11px] font-bold text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer uppercase"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                    />
                  </div>

                  {/* Tombol Submit Masuk */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-md font-black text-xs text-black bg-amber-500 hover:bg-amber-400 border border-amber-400 active:scale-[0.98] transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'MEMVERIFIKASI...' : 'MASUK KE DUNIA SEKARANG'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </form>
              ) : (
                /* Form Lupa Sandi */
                <form onSubmit={handleForgotSubmit} className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-md bg-[#0e0e0e] border border-neutral-800 text-xs text-neutral-300 space-y-1">
                    <div className="font-bold text-amber-400 uppercase tracking-wide">Pemulihan Akun</div>
                    <p className="text-neutral-400 text-[11px]">
                      Masukkan alamat email akun Anda. Sistem akan memverifikasi dan mengirimkan tautan reset kata sandi.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Alamat Email Terdaftar:</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                    />
                  </div>

                  {forgotSent && (
                    <div className="p-3.5 rounded-md bg-neutral-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Tautan pemulihan telah dikirim ke {forgotEmail}!</span>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsForgotView(false);
                      }}
                      className="flex-1 py-2.5 rounded-md border border-neutral-800 bg-neutral-900 text-xs font-bold text-neutral-300 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      ← KEMBALI
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider border border-amber-400 transition-colors cursor-pointer"
                    >
                      {isLoading ? 'MENGIRIM...' : 'KIRIM RESET'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================================================================== */}
          {/* 2. KONTEN TAB DAFTAR (Step 1: Data Akun, Step 2: Pilih Avatar)     */}
          {/* ================================================================== */}
          {activeTab === 'register' && (
            <div className="space-y-4 animate-in fade-in duration-150">

              {/* Step Wizard Breadcrumb */}
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider px-1">
                <div className={`flex items-center gap-1.5 ${registerStep === 1 ? 'text-amber-400' : 'text-neutral-400'}`}>
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${registerStep === 1 ? 'bg-amber-500 text-black font-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    1
                  </span>
                  <span>DATA AKUN & TANGGAL LAHIR</span>
                </div>

                <span className="text-neutral-400">➔</span>

                <div className={`flex items-center gap-1.5 ${registerStep === 2 ? 'text-amber-400' : 'text-neutral-400'}`}>
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${registerStep === 2 ? 'bg-amber-500 text-black font-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    2
                  </span>
                  <span>PILIH AVATAR (MALE / FEMALE)</span>
                </div>
              </div>

              {registerStep === 1 ? (
                /* --- STEP 1: FORM PENDAFTARAN & TANGGAL LAHIR --- */
                <form onSubmit={handleRegisterStep1Submit} className="space-y-3.5">
                  {/* Nama Karakter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Nama Karakter:</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder="Contoh: RadenSatria..."
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                    />
                  </div>

                  {/* Alamat Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Alamat Email:</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                    />
                  </div>

                  {/* TANGGAL LAHIR (Otomatis Menampilkan Umur di Profil) */}
                  <div className="space-y-1.5 p-3.5 bg-[#0e0e0e] border border-neutral-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Tanggal Lahir:</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                        Umur: {calculatedAge} Tahun
                      </span>
                    </div>

                    <input
                      type="date"
                      required
                      max={todayDate}
                      value={registerBirthDate}
                      onChange={(e) => setRegisterBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black border border-neutral-800 rounded-md text-xs text-white focus:outline-none focus:border-amber-400 font-mono transition-colors"
                    />

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Umur karakter akan otomatis dihitung berdasarkan tanggal lahir dan ditampilkan di profil publik Anda.
                    </p>
                  </div>

                  {/* Kata Sandi & Konfirmasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kata Sandi:</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Konfirmasi Sandi:</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 py-3 px-4 rounded-md font-black text-xs text-black bg-amber-500 hover:bg-amber-400 border border-amber-400 active:scale-[0.98] transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>LANJUT KE PEMILIHAN AVATAR</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </form>
              ) : (
                /* --- STEP 2: PILIH AVATAR (KHUSUS MALE DAN FEMALE SAJA) --- */
                <form onSubmit={handleRegisterFinalSubmit} className="space-y-4 animate-in fade-in duration-150">
                  <div className="text-center space-y-1 pb-1">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pilih Gender Karakter Utama:</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Pilih model avatar petualang Anda (Laki-laki atau Perempuan).
                    </p>
                  </div>

                  {/* 2 KARTU BESAR PILIHAN: MALE VS FEMALE */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* 1. MALE (LAKI-LAKI) */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedGender('male');
                      }}
                      className={`p-4 rounded-md border text-center flex flex-col items-center gap-3 transition-colors cursor-pointer relative ${
                        selectedGender === 'male'
                          ? 'bg-neutral-900 border-amber-400'
                          : 'bg-[#0e0e0e] border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      {selectedGender === 'male' && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div className="w-28 h-28 flex items-center justify-center">
                        <AvatarPreview avatar={getAvatarForGender('male')} size={110} />
                      </div>

                      <div>
                        <div className={`text-xs font-black uppercase tracking-wider ${selectedGender === 'male' ? 'text-amber-400' : 'text-white'}`}>
                          Laki-Laki (Male)
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Petualang Tangguh
                        </div>
                      </div>

                      <div className={`w-full py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        selectedGender === 'male'
                          ? 'bg-amber-500 text-black font-black'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {selectedGender === 'male' ? 'TERPILIH ✓' : 'PILIH MALE'}
                      </div>
                    </button>

                    {/* 2. FEMALE (PEREMPUAN) */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedGender('female');
                      }}
                      className={`p-4 rounded-md border text-center flex flex-col items-center gap-3 transition-colors cursor-pointer relative ${
                        selectedGender === 'female'
                          ? 'bg-neutral-900 border-amber-400'
                          : 'bg-[#0e0e0e] border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      {selectedGender === 'female' && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div className="w-28 h-28 flex items-center justify-center">
                        <AvatarPreview avatar={getAvatarForGender('female')} size={110} />
                      </div>

                      <div>
                        <div className={`text-xs font-black uppercase tracking-wider ${selectedGender === 'female' ? 'text-amber-400' : 'text-white'}`}>
                          Perempuan (Female)
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Petualang Anggun
                        </div>
                      </div>

                      <div className={`w-full py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        selectedGender === 'female'
                          ? 'bg-amber-500 text-black font-black'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {selectedGender === 'female' ? 'TERPILIH ✓' : 'PILIH FEMALE'}
                      </div>
                    </button>
                  </div>

                  {/* Ringkasan Akun Sebelum Masuk */}
                  <div className="p-3.5 bg-[#0e0e0e] border border-neutral-800 rounded-md text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Nama Karakter:</span>
                      <span className="font-bold text-white font-mono">{registerUsername}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Tanggal Lahir:</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {registerBirthDate} ({calculatedAge} Tahun)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Model Avatar:</span>
                      <span className="font-bold text-amber-300 uppercase">
                        {selectedGender === 'male' ? 'Male (Laki-laki)' : 'Female (Perempuan)'}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi Step 2 */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setRegisterStep(1);
                      }}
                      className="px-4 py-3 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 rounded-md font-black text-xs text-black bg-amber-500 hover:bg-amber-400 border border-amber-400 active:scale-[0.98] transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <span>{isLoading ? 'MENDAFTARKAN...' : 'SELESAIKAN & MASUK KE GAME'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* ==================================================================== */}
        {/* FOOTER ACTIONS                                                       */}
        {/* ==================================================================== */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-[#0a0a0a] flex items-center justify-between text-xs">
          <div className="text-[11px] text-neutral-400 font-mono">
            RadenWorld Identity • Multi-Server Safe
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-md border border-neutral-700 text-neutral-300 hover:text-white hover:border-amber-400 transition-colors font-bold text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
