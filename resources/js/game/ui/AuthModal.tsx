/**
 * ============================================================================
 * FILE: resources/js/game/ui/AuthModal.tsx
 * ============================================================================
 * Modal Autentikasi RadenWorld (Cozycore Clay-Pixel):
 * Layout: Standard Left Sidebar (Logo di atas, teks di bawah)
 * 1. TAB MASUK:
 *    - Login via Email / Username & Password
 *    - Opsi "Lupa kata sandi?" terintegrasi
 *    - Masuk cepat via Google & Facebook
 * 2. TAB DAFTAR:
 *    - Step 1: Input Data Akun + Tanggal Lahir + VERIFIKASI EMAIL OTP 6 DIGIT
 *    - Step 2: Pemilihan Avatar SIMPEL (MALE atau FEMALE)
 *    - Selesaikan pendaftaran dan langsung terhubung ke Open World
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Send,
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
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State (Termasuk Tanggal Lahir)
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerBirthDate, setRegisterBirthDate] = useState('2003-01-01');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Email OTP State
  const [otpInputCode, setOtpInputCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpFeedback, setOtpFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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
  const [forgotBirthDate, setForgotBirthDate] = useState('2003-01-01');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Social OAuth Loading State (Google & Facebook)
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sound = SoundManager.getInstance();

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  if (!isOpen) return null;

  const todayDate = new Date().toISOString().split('T')[0];
  const calculatedAge = calculateAgeFromBirthDate(registerBirthDate);

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

  const handleSendEmailOtp = async () => {
    sound.playClick();
    const cleanEmail = registerEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setOtpFeedback({ message: 'Masukkan alamat email yang valid terlebih dahulu.', isError: true });
      return;
    }

    setIsSendingOtp(true);
    setOtpFeedback(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: cleanEmail, purpose: 'register' }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sound.playSuccess();
        setIsOtpSent(true);
        setOtpCooldown(60);
        setOtpFeedback({ message: data.message || 'Kode OTP 6-digit berhasil dikirim!', isError: false });
        if (data.debug_otp) {
          setOtpInputCode(data.debug_otp);
        }
      } else {
        sound.playError();
        setOtpFeedback({ message: data.message || 'Gagal mengirim kode OTP.', isError: true });
      }
    } catch (e) {
      sound.playError();
      setOtpFeedback({ message: 'Koneksi ke server gagal saat mengirim kode OTP.', isError: true });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    sound.playClick();
    const cleanCode = otpInputCode.trim();
    if (cleanCode.length !== 6) {
      setOtpFeedback({ message: 'Masukkan 6 digit kode OTP secara lengkap.', isError: true });
      return;
    }

    setIsVerifyingOtp(true);
    setOtpFeedback(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: registerEmail.trim().toLowerCase(), code: cleanCode }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sound.playSuccess();
        setIsOtpVerified(true);
        setOtpFeedback({ message: '✓ Email berhasil diverifikasi dengan OTP!', isError: false });
      } else {
        sound.playError();
        setOtpFeedback({ message: data.message || 'Kode OTP salah atau telah kadaluarsa.', isError: true });
      }
    } catch (e) {
      sound.playError();
      setOtpFeedback({ message: 'Koneksi server gagal saat verifikasi OTP.', isError: true });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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
        if (data.auth_token) {
          localStorage.setItem('raden_auth_token', data.auth_token);
        }
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

    if (!isOtpVerified) {
      sound.playError();
      setAuthError('Harap verifikasi email Anda dengan kode OTP 6-digit terlebih dahulu!');
      return;
    }

    sound.playClick();
    setRegisterStep(2);
  };

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
        if (data.auth_token) {
          localStorage.setItem('raden_auth_token', data.auth_token);
        }
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setAuthError('Email terdaftar wajib diisi!');
      return;
    }
    if (!forgotBirthDate) {
      setAuthError('Tanggal lahir wajib diisi untuk verifikasi identitas pemilik akun!');
      return;
    }
    if (!forgotNewPassword.trim() || forgotNewPassword.length < 4) {
      setAuthError('Kata sandi baru minimal 4 karakter!');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          birth_date: forgotBirthDate,
          new_password: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        setAuthError(data.message || 'Verifikasi reset sandi gagal!');
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

  const handleSocialSuccess = (user: any) => {
    sound.playSuccess();
    let loadedAvatar = user?.avatar;
    if (typeof loadedAvatar === 'string') {
      try {
        loadedAvatar = JSON.parse(loadedAvatar);
      } catch (e) {}
    }

    if (!loadedAvatar || typeof loadedAvatar !== 'object' || !loadedAvatar.gender) {
      loadedAvatar = getAvatarForGender(user?.avatar?.gender || 'male');
    }

    try {
      localStorage.setItem('raden_player_avatar', JSON.stringify(loadedAvatar));
      localStorage.setItem('raden_player_user', JSON.stringify(user));
    } catch (err) {}

    const safeRoomId = user?.private_room_id || `safe-${user?.id || 1}`;
    onSuccess(user.name, loadedAvatar, safeRoomId);
    onClose();
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    sound.playClick();
    setSocialLoading(provider);
    setAuthError(null);

    const popupUrl = `/api/auth/social/${provider}/redirect`;
    const w = 520;
    const h = 640;
    const left = typeof window !== 'undefined' ? Math.max(0, window.screen.width / 2 - w / 2) : 100;
    const top = typeof window !== 'undefined' ? Math.max(0, window.screen.height / 2 - h / 2) : 100;

    const popup = window.open(
      popupUrl,
      `Raden${provider}Auth`,
      `width=${w},height=${h},top=${top},left=${left},toolbar=no,menubar=no,status=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = popupUrl;
      return;
    }

    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RADEN_SOCIAL_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        setSocialLoading(null);
        handleSocialSuccess(event.data.user);
      }
    };
    window.addEventListener('message', messageHandler);

    const checkTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkTimer);
        setSocialLoading(null);
      }
    }, 1000);
  };

  const stopKeyBubble = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="ui-modal-backdrop select-none" onKeyDown={stopKeyBubble}>
      <div className="clay-panel landscape-compact-modal relative w-full max-w-2xl max-h-[min(94dvh,calc(100dvh-1rem))] flex flex-col overflow-hidden text-black">
        <div className="clay-modal-shell flex-1 min-h-0">
          {/* SIDEBAR KIRI: LOGO DI ATAS, TEKS DI BAWAH */}
          <aside className="clay-sidebar">
            <div className="clay-sidebar-brand">
              <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
              <span className="clay-sidebar-title">PORTAL ID</span>
              <span className="clay-sidebar-subtitle">RADENWORLD</span>
            </div>

            <div className="clay-sidebar-nav custom-scrollbar">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`clay-sidebar-btn ${
                  activeTab === 'login' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
                }`}
              >
                <LogIn className="w-5 h-5 stroke-[2.5] shrink-0" />
                <span>Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`clay-sidebar-btn ${
                  activeTab === 'register' ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'
                }`}
              >
                <UserPlus className="w-5 h-5 stroke-[2.5] shrink-0" />
                <span>Daftar</span>
              </button>
            </div>

            <div className="clay-sidebar-footer">
              <span className="clay-badge-neutral text-[9px] font-bold text-center py-0.5">
                RADEN ID
              </span>
            </div>
          </aside>

          {/* MAIN CONTENT PANE */}
          <div className="clay-main-pane flex-1 min-w-0 flex flex-col">
            <div className="clay-main-topbar flex items-center justify-between px-3.5 sm:px-4 py-2 border-b-2 border-[#5C3A21] bg-[#FFF8EA] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-bold uppercase text-black truncate">
                  {activeTab === 'login' ? 'AKSES MASUK AKUN' : 'PENDAFTARAN AKUN BARU'}
                </span>
                <span className="clay-badge-secondary hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 text-black">
                  ONLINE
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="clay-btn-neutral w-7 h-7 flex items-center justify-center text-black shrink-0"
                title="Tutup"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="landscape-compact-body p-3.5 sm:p-5 overflow-y-auto space-y-3.5 custom-scrollbar flex-1 min-h-0">
              {/* Banner Error */}
              {authError && (
                <div className="clay-card-primary flex items-center gap-2.5 p-3 text-black text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  <span>{authError}</span>
                </div>
              )}

              {/* 1. KONTEN TAB MASUK */}
              {activeTab === 'login' && (
                <div className="space-y-3.5">
                  {!isForgotView ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                      {/* Quick Social Buttons */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSocialLogin('google')}
                          disabled={!!socialLoading}
                          className="clay-btn-neutral py-2 px-3 text-xs font-bold text-black uppercase flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                          <span>{socialLoading === 'google' ? 'Proses...' : 'Google'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSocialLogin('facebook')}
                          disabled={!!socialLoading}
                          className="clay-btn-neutral py-2 px-3 text-xs font-bold text-black uppercase flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>{socialLoading === 'facebook' ? 'Proses...' : 'Facebook'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3 py-0.5 text-[10px] font-bold text-black uppercase">
                        <div className="flex-1 h-[2px] bg-[#5C3A21]/30" />
                        <span>ATAU AKUN TERDAFTAR</span>
                        <div className="flex-1 h-[2px] bg-[#5C3A21]/30" />
                      </div>

                      {/* Input Username / Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Nama Karakter atau Email:</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="Masukkan nama pengguna atau email..."
                          className="clay-input w-full px-3.5 py-2.5 text-xs text-black"
                        />
                      </div>

                      {/* Input Password & Lupa Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Kata Sandi:</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setIsForgotView(true);
                            }}
                            className="clay-badge-secondary px-2 py-0.5 text-[10px] font-bold text-black uppercase cursor-pointer"
                          >
                            Lupa Sandi?
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="clay-input w-full pl-3.5 pr-10 py-2.5 text-xs text-black"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => {
                              sound.playClick();
                              setShowLoginPassword((prev) => !prev);
                            }}
                            className="absolute right-2 p-1 rounded text-black cursor-pointer flex items-center justify-center"
                            title={showLoginPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <Eye className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="clay-btn-primary w-full py-2.5 sm:py-3 px-4 font-bold text-xs text-black uppercase flex items-center justify-center gap-2"
                      >
                        <span>{isLoading ? 'MEMVERIFIKASI...' : 'MASUK KE DUNIA SEKARANG'}</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </form>
                  ) : (
                    /* Form Lupa Sandi */
                    <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                      <div className="clay-card-secondary p-3 text-xs text-black space-y-1">
                        <div className="font-bold uppercase flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Reset Kata Sandi Akun</span>
                        </div>
                        <p className="text-[11px]">
                          Masukkan email terdaftar dan tanggal lahir untuk verifikasi identitas pemilik.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Email Terdaftar:</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="clay-input w-full px-3.5 py-2 text-xs text-black"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Tanggal Lahir Terdaftar:</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={forgotBirthDate}
                          onChange={(e) => setForgotBirthDate(e.target.value)}
                          className="clay-input w-full px-3.5 py-2 text-xs text-black"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Kata Sandi Baru:</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showForgotNewPassword ? 'text' : 'password'}
                            required
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="Minimal 4 karakter"
                            className="clay-input w-full pl-3.5 pr-10 py-2 text-xs text-black"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => {
                              sound.playClick();
                              setShowForgotNewPassword((prev) => !prev);
                            }}
                            className="absolute right-2 p-1 rounded text-black cursor-pointer flex items-center justify-center"
                          >
                            {showForgotNewPassword ? (
                              <EyeOff className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <Eye className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </button>
                        </div>
                      </div>

                      {forgotSent && (
                        <div className="clay-card-secondary p-3 text-black text-xs font-bold flex items-center gap-2">
                          <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                          <span>Kata sandi berhasil diperbarui! Silakan kembali ke form masuk.</span>
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setIsForgotView(false);
                          }}
                          className="clay-btn-neutral flex-1 py-2.5 text-xs font-bold text-black uppercase"
                        >
                          KEMBALI
                        </button>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="clay-btn-primary flex-1 py-2.5 text-xs font-bold text-black uppercase"
                        >
                          {isLoading ? 'PROSES...' : 'RESET SANDI'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 2. KONTEN TAB DAFTAR */}
              {activeTab === 'register' && (
                <div className="space-y-3.5">
                  {/* Step Wizard Breadcrumb */}
                  <div className="clay-card p-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-bold uppercase text-black">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] border border-[#5C3A21] ${
                          registerStep === 1 ? 'bg-[#FFAE6D] text-black font-bold' : 'bg-[#FFF8EA] text-black'
                        }`}
                      >
                        1
                      </span>
                      <span>DATA & OTP</span>
                    </div>

                    <span>→</span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] border border-[#5C3A21] ${
                          registerStep === 2 ? 'bg-[#FFAE6D] text-black font-bold' : 'bg-[#FFF8EA] text-black'
                        }`}
                      >
                        2
                      </span>
                      <span>PILIH AVATAR</span>
                    </div>
                  </div>

                  {registerStep === 1 ? (
                    <div className="space-y-3.5">
                      {/* Quick Social Register Buttons */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSocialLogin('google')}
                          disabled={!!socialLoading}
                          className="clay-btn-neutral py-2 px-3 text-xs font-bold text-black uppercase flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                          <span>Google</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSocialLogin('facebook')}
                          disabled={!!socialLoading}
                          className="clay-btn-neutral py-2 px-3 text-xs font-bold text-black uppercase flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>Facebook</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3 py-0.5 text-[10px] font-bold text-black uppercase">
                        <div className="flex-1 h-[2px] bg-[#5C3A21]/30" />
                        <span>ATAU DAFTAR MANUAL + OTP</span>
                        <div className="flex-1 h-[2px] bg-[#5C3A21]/30" />
                      </div>

                      <form onSubmit={handleRegisterStep1Submit} className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Nama Karakter:</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={registerUsername}
                            onChange={(e) => setRegisterUsername(e.target.value)}
                            placeholder="Contoh: RadenSatria..."
                            className="clay-input w-full px-3.5 py-2 text-xs text-black"
                          />
                        </div>

                        {/* Input Email + Tombol Kirim OTP */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Alamat Email & Verifikasi OTP:</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="email"
                              required
                              disabled={isOtpVerified}
                              value={registerEmail}
                              onChange={(e) => {
                                setRegisterEmail(e.target.value);
                                setIsOtpVerified(false);
                                setIsOtpSent(false);
                                setOtpFeedback(null);
                              }}
                              placeholder="nama@email.com"
                              className="clay-input flex-1 px-3.5 py-2 text-xs text-black"
                            />
                            <button
                              type="button"
                              onClick={handleSendEmailOtp}
                              disabled={isSendingOtp || otpCooldown > 0 || isOtpVerified}
                              className={`px-3 py-2 text-xs font-bold uppercase shrink-0 flex items-center gap-1.5 ${
                                isOtpVerified
                                  ? 'clay-btn-secondary opacity-80 cursor-default'
                                  : otpCooldown > 0
                                  ? 'clay-btn-neutral opacity-60 cursor-not-allowed'
                                  : 'clay-btn-primary'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>
                                {isOtpVerified
                                  ? 'TERVERIFIKASI ✓'
                                  : isSendingOtp
                                  ? 'Kirim...'
                                  : otpCooldown > 0
                                  ? `${otpCooldown}s`
                                  : isOtpSent
                                  ? 'Kirim Ulang'
                                  : 'Kirim OTP'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Input Kode OTP 6 Digit jika sudah terkirim */}
                        {(isOtpSent || isOtpVerified) && (
                          <div className="clay-card-secondary p-2.5 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Masukkan 6-Digit OTP:</span>
                              </label>
                              {isOtpVerified && (
                                <span className="clay-badge-secondary px-2 py-0.5 text-[10px] font-bold text-black flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>TERVERIFIKASI</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                disabled={isOtpVerified}
                                value={otpInputCode}
                                onChange={(e) => setOtpInputCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="clay-input flex-1 px-3.5 py-1.5 text-center tracking-widest text-sm font-bold text-black"
                              />
                              {!isOtpVerified && (
                                <button
                                  type="button"
                                  onClick={handleVerifyEmailOtp}
                                  disabled={isVerifyingOtp || otpInputCode.trim().length !== 6}
                                  className="clay-btn-primary px-3 py-1.5 text-xs font-bold uppercase shrink-0"
                                >
                                  {isVerifyingOtp ? 'Cek...' : 'Verifikasi'}
                                </button>
                              )}
                            </div>

                            {otpFeedback && (
                              <p
                                className={`text-[11px] font-bold ${
                                  otpFeedback.isError ? 'text-red-700' : 'text-green-800'
                                }`}
                              >
                                {otpFeedback.message}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="clay-card p-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Tanggal Lahir:</span>
                            </label>
                            <span className="clay-badge-secondary px-2 py-0.5 text-[11px] font-bold text-black">
                              Umur: {calculatedAge} Tahun
                            </span>
                          </div>

                          <input
                            type="date"
                            required
                            max={todayDate}
                            value={registerBirthDate}
                            onChange={(e) => setRegisterBirthDate(e.target.value)}
                            className="clay-input w-full px-3 py-2 text-xs text-black"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Kata Sandi:</span>
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={showRegisterPassword ? 'text' : 'password'}
                                required
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                placeholder="••••••••"
                                className="clay-input w-full pl-3 pr-9 py-2 text-xs text-black"
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => {
                                  sound.playClick();
                                  setShowRegisterPassword((prev) => !prev);
                                }}
                                className="absolute right-2 p-1 text-black cursor-pointer"
                              >
                                {showRegisterPassword ? (
                                  <EyeOff className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <Eye className="w-4 h-4 stroke-[2.5]" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Konfirmasi Sandi:</span>
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={showRegisterConfirmPassword ? 'text' : 'password'}
                                required
                                value={registerConfirmPassword}
                                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="clay-input w-full pl-3 pr-9 py-2 text-xs text-black"
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => {
                                  sound.playClick();
                                  setShowRegisterConfirmPassword((prev) => !prev);
                                }}
                                className="absolute right-2 p-1 text-black cursor-pointer"
                              >
                                {showRegisterConfirmPassword ? (
                                  <EyeOff className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <Eye className="w-4 h-4 stroke-[2.5]" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!isOtpVerified}
                          className={`w-full py-2.5 sm:py-3 px-4 font-bold text-xs text-black uppercase flex items-center justify-center gap-2 ${
                            isOtpVerified ? 'clay-btn-primary' : 'clay-btn-neutral opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {isOtpVerified
                              ? 'LANJUT KE PEMILIHAN AVATAR'
                              : 'VERIFIKASI EMAIL OTP UNTUK LANJUT'}
                          </span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* STEP 2: PILIH AVATAR (MALE / FEMALE) */
                    <form onSubmit={handleRegisterFinalSubmit} className="space-y-3.5">
                      <div className="text-center space-y-0.5">
                        <div className="text-xs font-bold text-black uppercase flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Pilih Gender Karakter Utama:</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* 1. MALE */}
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedGender('male');
                          }}
                          className={`p-3 text-center flex flex-col items-center gap-2 relative text-black ${
                            selectedGender === 'male' ? 'clay-btn-secondary' : 'clay-btn-neutral'
                          }`}
                        >
                          {selectedGender === 'male' && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FFAE6D] border-2 border-[#5C3A21] text-black flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          <AvatarPreview avatar={getAvatarForGender('male')} size={88} />

                          <div>
                            <div className="text-xs font-bold uppercase text-black">
                              Laki-Laki (Male)
                            </div>
                            <div className="text-[10px] text-black">Petualang Tangguh</div>
                          </div>

                          <div
                            className={`w-full py-1 rounded-md text-[10px] font-bold uppercase border border-[#5C3A21] ${
                              selectedGender === 'male'
                                ? 'bg-[#FFAE6D] text-black'
                                : 'bg-[#FFF8EA] text-black'
                            }`}
                          >
                            {selectedGender === 'male' ? 'TERPILIH' : 'PILIH MALE'}
                          </div>
                        </button>

                        {/* 2. FEMALE */}
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedGender('female');
                          }}
                          className={`p-3 text-center flex flex-col items-center gap-2 relative text-black ${
                            selectedGender === 'female' ? 'clay-btn-secondary' : 'clay-btn-neutral'
                          }`}
                        >
                          {selectedGender === 'female' && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FFAE6D] border-2 border-[#5C3A21] text-black flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          <AvatarPreview avatar={getAvatarForGender('female')} size={88} />

                          <div>
                            <div className="text-xs font-bold uppercase text-black">
                              Perempuan (Female)
                            </div>
                            <div className="text-[10px] text-black">Petualang Anggun</div>
                          </div>

                          <div
                            className={`w-full py-1 rounded-md text-[10px] font-bold uppercase border border-[#5C3A21] ${
                              selectedGender === 'female'
                                ? 'bg-[#FFAE6D] text-black'
                                : 'bg-[#FFF8EA] text-black'
                            }`}
                          >
                            {selectedGender === 'female' ? 'TERPILIH' : 'PILIH FEMALE'}
                          </div>
                        </button>
                      </div>

                      {/* Ringkasan Akun */}
                      <div className="clay-card p-3 text-xs space-y-1 text-black">
                        <div className="flex justify-between gap-2">
                          <span>Nama Karakter:</span>
                          <span className="font-bold truncate">{registerUsername}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Email Terverifikasi:</span>
                          <span className="font-bold truncate text-green-700">{registerEmail} (OTP ✓)</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Tanggal Lahir:</span>
                          <span className="font-bold">
                            {registerBirthDate} ({calculatedAge} Tahun)
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Model Avatar:</span>
                          <span className="font-bold uppercase">
                            {selectedGender === 'male' ? 'Male (Laki-laki)' : 'Female (Perempuan)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setRegisterStep(1);
                          }}
                          className="clay-btn-neutral px-3.5 py-2.5 text-black text-xs font-bold uppercase flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                          <span>Kembali</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="clay-btn-primary flex-1 py-2.5 px-4 font-bold text-xs text-black uppercase flex items-center justify-center gap-2"
                        >
                          <span>{isLoading ? 'MENDAFTARKAN...' : 'SELESAIKAN & MASUK'}</span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </form>
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
