/**
 * ============================================================================
 * FILE: resources/js/game/ui/ProfileModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pop-up Profil Karakter Pemain & Sistem Sosial Terpadu (Teman, Mengikuti, Diikuti)
 * bergaya Minimalist & Elegant Dark Cyber Gaming UI.
 * 
 * FITUR LENGKAP:
 * 1. Simpel, Kokoh & Elegan: Palet 2-warna serasi (#080808 Dark Slate & #f59e0b Honey Amber).
 * 2. Bebas Bug Spasi: Tombol spasi dapat diketik secara lancar di status bio tanpa
 *    terinterupsi oleh input keyboard Phaser.
 * 3. Daftar Sosial Interaktif:
 *    - Kartu TEMAN, MENGIKUTI, dan DIIKUTI dapat diklik untuk membuka list.
 *    - Teman = Saling Mengikuti (Mutual Followers).
 *    - Tombol Follow, Unfollow, Ikuti Balik, Hapus, Chat & Lihat Profil.
 * 4. Modal Pemain Lain (Inspected Player):
 *    - Muncul saat klik karakter pemain lain di open world / sekolah / daftar server.
 *    - Dilengkapi tombol Follow/Unfollow, Tambah Teman, dan Kirim Pesan Chat.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { IAvatarCustomization } from '../types';
import { AvatarPreview } from './AvatarPreview';
import { calculateAgeFromBirthDate } from './AuthModal';
import {
  User,
  X,
  Zap,
  Coins,
  Gem,
  Calendar,
  Heart,
  FileText,
  LogOut,
  Edit3,
  Check,
  HelpCircle,
  UserPlus,
  UserCheck,
  Users,
  Search,
  ArrowLeft,
  MessageSquare,
  Crown,
  Trash2,
  Shield,
  Sparkles,
  Quote,
  MapPin,
  UserX,
  Mail,
  ShieldCheck,
  AlertCircle,
  Link,
  RefreshCw,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';
import { SocialAccountChooserModal, ISocialAccount } from './SocialAccountChooserModal';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  avatar?: IAvatarCustomization;
  level?: number;
  exp?: number;
  title?: string;
  gold?: number;
  diamonds?: number;
  role?: string;
  isSuperAdmin?: boolean;
  onTeleportToAdminPortal?: () => void;
  onLogout?: () => void;
  onOpenGuide?: () => void;
  description?: string;
  onSaveDescription?: (newDesc: string) => void;
  onUpdateName?: (newName: string) => void;
  age?: number;
  birthDate?: string;
  likes?: number;
  gender?: 'male' | 'female';
  friendsCount?: number;
  followingCount?: number;
  followersCount?: number;
  isInspecting?: boolean;
  playerId?: string | number;
  location?: string;
  joinedAt?: string;
  currentUserName?: string;
  hasLikedToday?: boolean;
  onLikePlayer?: (targetName: string) => void;
  isFriend?: boolean;
  isFollowing?: boolean;
  isFollower?: boolean;
  isFriendRequested?: boolean;
  onAddFriend?: () => void;
  onFollowToggle?: (targetName: string, targetId?: string | number) => void;
  onRemoveFollower?: (followerName: string) => void;
  onRemoveFriend?: (friendName: string) => void;
  onInspectOtherPlayer?: (player: any) => void;
  onWhisper?: (targetName: string) => void;
  onOpenTopUp?: () => void;
  friendsList?: string[];
  followingList?: string[];
  followersList?: string[];
  email?: string;
  emailVerified?: boolean;
  googleLinked?: boolean;
  googleEmail?: string;
  facebookLinked?: boolean;
  facebookEmail?: string;
  onRefreshWallet?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  name,
  avatar,
  level = 1,
  exp = 0,
  title = 'Petualang Pemula',
  gold = 2500,
  diamonds = 50,
  role,
  isSuperAdmin: propIsSuperAdmin,
  onTeleportToAdminPortal,
  onLogout,
  onOpenGuide,
  description = 'Petualang penjelajah tanah agung RadenWorld.',
  onSaveDescription,
  onUpdateName,
  age = 21,
  birthDate,
  likes = 0,
  gender,
  friendsCount = 0,
  followingCount = 0,
  followersCount = 0,
  isInspecting = false,
  playerId,
  location = 'Dunia Terbuka',
  joinedAt,
  currentUserName,
  hasLikedToday = false,
  onLikePlayer,
  isFriend = false,
  isFollowing = false,
  isFollower = false,
  isFriendRequested = false,
  onAddFriend,
  onFollowToggle,
  onRemoveFollower,
  onRemoveFriend,
  onInspectOtherPlayer,
  onWhisper,
  onOpenTopUp,
  friendsList = [],
  followingList = [],
  followersList = [],
  email,
  emailVerified,
  googleLinked,
  googleEmail,
  facebookLinked,
  facebookEmail,
  onRefreshWallet,
}) => {
  const sound = SoundManager.getInstance();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(description);
  const [activeSocialTab, setActiveSocialTab] = useState<'none' | 'friends' | 'following' | 'followers'>('none');
  const [socialSearch, setSocialSearch] = useState('');
  const [hasLiked, setHasLiked] = useState<boolean>(hasLikedToday);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [currentLikes, setCurrentLikes] = useState<number>(likes);
  const [likeFeedback, setLikeFeedback] = useState<string>('');

  // Tab Kategori Akun: 'overview' (Ikhtisar Karakter) atau 'account' (Keamanan & Akun)
  const [profileCategory, setProfileCategory] = useState<'overview' | 'account'>('overview');

  const [accountEmail, setAccountEmail] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return email || u.email || '';
    } catch (e) {
      return email || '';
    }
  });

  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return emailVerified !== undefined ? emailVerified : Boolean(u.email_verified || u.email_verified_at);
    } catch (e) {
      return Boolean(emailVerified);
    }
  });

  const [isGoogleLinked, setIsGoogleLinked] = useState<boolean>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return googleLinked !== undefined ? googleLinked : Boolean(u.google_linked || u.google_email || u.provider === 'google');
    } catch (e) {
      return Boolean(googleLinked);
    }
  });

  const [linkedGoogleEmail, setLinkedGoogleEmail] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return googleEmail || u.google_email || (u.provider === 'google' ? u.email : '');
    } catch (e) {
      return googleEmail || '';
    }
  });

  const [isFacebookLinked, setIsFacebookLinked] = useState<boolean>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return facebookLinked !== undefined ? facebookLinked : Boolean(u.facebook_linked || u.facebook_email || u.provider === 'facebook');
    } catch (e) {
      return Boolean(facebookLinked);
    }
  });

  const [linkedFacebookEmail, setLinkedFacebookEmail] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return facebookEmail || u.facebook_email || (u.provider === 'facebook' ? u.email : '');
    } catch (e) {
      return facebookEmail || '';
    }
  });

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<string>('');
  const [linkingProvider, setLinkingProvider] = useState<'google' | 'facebook' | null>(null);
  const [linkInputEmail, setLinkInputEmail] = useState('');
  const [isLinkingLoading, setIsLinkingLoading] = useState(false);

  // Pemilih Akun Sosial Browser Otentik
  const [isSocialChooserOpen, setIsSocialChooserOpen] = useState(false);
  const [socialChooserProvider, setSocialChooserProvider] = useState<'google' | 'facebook'>('google');

  // Ganti Nama Karakter Game (Nickname)
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState(name);
  const [newNameInput, setNewNameInput] = useState(name);
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setCurrentDisplayName(name);
    setNewNameInput(name);
  }, [name]);

  // Handler Verifikasi Email
  const handleVerifyEmail = async () => {
    sound.playClick();
    setVerifyingEmail(true);
    setAccountFeedback('');
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      const res = await fetch('/api/user/account/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || accountEmail || '',
          'X-User-Name': u.name || name || '',
        },
        body: JSON.stringify({
          user_id: u.id,
          email: accountEmail || u.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sound.playSuccess();
        setIsEmailVerified(true);
        setAccountFeedback('✓ Email Anda telah berhasil diverifikasi secara resmi!');
        u.email_verified = true;
        u.email_verified_at = data.email_verified_at || new Date().toISOString();
        localStorage.setItem('raden_player_user', JSON.stringify(u));
      } else {
        setAccountFeedback(data.message || 'Gagal memverifikasi email.');
      }
    } catch (err) {
      setAccountFeedback('Gagal terhubung ke database server.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Handler Tautkan Akun Sosial
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingProvider || !linkInputEmail.trim()) return;

    sound.playClick();
    setIsLinkingLoading(true);
    setAccountFeedback('');

    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      const res = await fetch('/api/user/account/link-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || accountEmail || '',
          'X-User-Name': u.name || name || '',
        },
        body: JSON.stringify({
          user_id: u.id,
          provider: linkingProvider,
          social_email: linkInputEmail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sound.playSuccess();
        if (linkingProvider === 'google') {
          setIsGoogleLinked(true);
          setLinkedGoogleEmail(linkInputEmail.trim());
          u.google_linked = true;
          u.google_email = linkInputEmail.trim();
        } else {
          setIsFacebookLinked(true);
          setLinkedFacebookEmail(linkInputEmail.trim());
          u.facebook_linked = true;
          u.facebook_email = linkInputEmail.trim();
        }
        localStorage.setItem('raden_player_user', JSON.stringify(u));
        setAccountFeedback(data.message || `✓ Akun ${linkingProvider} berhasil ditautkan!`);
        setLinkingProvider(null);
        setLinkInputEmail('');
      } else {
        setAccountFeedback(data.message || 'Gagal menautkan akun.');
      }
    } catch (err) {
      setAccountFeedback('Gagal menghubungi server database.');
    } finally {
      setIsLinkingLoading(false);
    }
  };

  // Handler Lepas Tautan Akun Sosial
  const handleUnlink = async (provider: 'google' | 'facebook') => {
    sound.playClick();
    setAccountFeedback('');
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      const res = await fetch('/api/user/account/unlink-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || accountEmail || '',
          'X-User-Name': u.name || name || '',
        },
        body: JSON.stringify({
          user_id: u.id,
          provider,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sound.playSuccess();
        if (provider === 'google') {
          setIsGoogleLinked(false);
          setLinkedGoogleEmail('');
          u.google_linked = false;
          u.google_email = null;
        } else {
          setIsFacebookLinked(false);
          setLinkedFacebookEmail('');
          u.facebook_linked = false;
          u.facebook_email = null;
        }
        localStorage.setItem('raden_player_user', JSON.stringify(u));
        setAccountFeedback(`✓ Tautan akun ${provider} berhasil dilepas.`);
      }
    } catch (err) {
      setAccountFeedback('Gagal menghubungi server.');
    }
  };

  // Handler saat akun Google / Facebook dipilih dari dialog peramban
  const handleAccountChosen = async (acc: ISocialAccount) => {
    sound.playClick();
    setIsLinkingLoading(true);
    setAccountFeedback('');
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      const res = await fetch('/api/user/account/link-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || accountEmail || '',
          'X-User-Name': u.name || currentDisplayName || '',
        },
        body: JSON.stringify({
          user_id: u.id,
          provider: socialChooserProvider,
          social_email: acc.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sound.playSuccess();
        if (socialChooserProvider === 'google') {
          setIsGoogleLinked(true);
          setLinkedGoogleEmail(acc.email);
          u.google_linked = true;
          u.google_email = acc.email;
        } else {
          setIsFacebookLinked(true);
          setLinkedFacebookEmail(acc.email);
          u.facebook_linked = true;
          u.facebook_email = acc.email;
        }
        localStorage.setItem('raden_player_user', JSON.stringify(u));
        setAccountFeedback(data.message || `✓ Akun ${socialChooserProvider} (${acc.email}) berhasil ditautkan!`);
      } else {
        setAccountFeedback(data.message || 'Gagal menautkan akun.');
      }
    } catch (err) {
      setAccountFeedback('Gagal menghubungi server database.');
    } finally {
      setIsLinkingLoading(false);
      setIsSocialChooserOpen(false);
    }
  };

  // Handler Mengubah Nama Karakter Game (Ganti Nickname)
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNameInput.trim();
    if (!trimmed || trimmed.length < 3) {
      setAccountFeedback('Nama karakter harus terdiri dari minimal 3 karakter.');
      return;
    }
    if (trimmed === currentDisplayName) {
      setIsEditingName(false);
      return;
    }

    sound.playClick();
    setIsSavingName(true);
    setAccountFeedback('');

    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      const res = await fetch('/api/user/account/update-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || accountEmail || '',
          'X-User-Name': currentDisplayName || u.name || name || '',
        },
        body: JSON.stringify({
          user_id: u.id || undefined,
          current_name: currentDisplayName || u.name || name || '',
          email: u.email || accountEmail || undefined,
          name: trimmed,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sound.playSuccess();
        setCurrentDisplayName(trimmed);
        setIsEditingName(false);
        if (data.user) {
          u.id = data.user.id || u.id;
          u.name = data.user.name || trimmed;
          u.email = data.user.email || u.email;
        } else {
          u.name = trimmed;
        }
        localStorage.setItem('raden_player_user', JSON.stringify(u));
        setAccountFeedback(data.message || `✓ Nama karakter berhasil diubah menjadi ${trimmed}!`);
        if (onUpdateName) onUpdateName(trimmed);
        EventBus.emit('player-name-changed', trimmed);
      } else {
        setAccountFeedback(data.message || 'Gagal mengubah nama karakter.');
      }
    } catch (err) {
      setAccountFeedback('Gagal terhubung ke database server.');
    } finally {
      setIsSavingName(false);
    }
  };

  // Kunci pergerakan karakter di Phaser saat modal dibuka agar spasi & WASD tidak menggerakkan game
  useEffect(() => {
    if (isOpen) {
      EventBus.emit('dialogue-active', true);
    }
    return () => {
      EventBus.emit('dialogue-active', false);
    };
  }, [isOpen]);

  // Sinkronisasi teks bio dan status like harian saat modal dibuka atau berganti pemain
  useEffect(() => {
    setBioText(description);
    setIsEditingBio(false);
    setActiveSocialTab('none');
    setSocialSearch('');
    setCurrentLikes(likes);
    setLikeFeedback('');
    setIsLiking(false);

    if (hasLikedToday) {
      setHasLiked(true);
      return;
    }

    if (name) {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
        const todayList = daily[todayStr] || [];
        const isLikedToday = Array.isArray(todayList) && todayList.includes(name.trim().toLowerCase());
        setHasLiked(isLikedToday);
      } catch (e) {
        setHasLiked(false);
      }
    }
  }, [isOpen, name, description, isInspecting, likes, hasLikedToday]);

  // Fungsi beri suka (Like) - Maksimal 1x per hari & anti spam
  const handleGiveLike = () => {
    if (hasLiked || isLiking) return;

    const myName = (currentUserName || '').trim().toLowerCase();
    const targetName = name.trim().toLowerCase();
    if (myName && targetName && myName === targetName) {
      sound.playClick();
      setLikeFeedback('Tidak bisa menyukai profil sendiri!');
      setTimeout(() => setLikeFeedback(''), 3000);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Cek cache harian lokal terlebih dahulu untuk proteksi instan
    try {
      const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
      const todayList = daily[todayStr] || [];
      if (todayList.includes(targetName)) {
        setHasLiked(true);
        setLikeFeedback('Sudah disukai hari ini. Besok lagi ya!');
        setTimeout(() => setLikeFeedback(''), 3000);
        return;
      }
    } catch (e) {}

    setIsLiking(true);

    fetch(`/api/auth/profile/${encodeURIComponent(name)}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender_name: currentUserName || 'Tamu',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          sound.playSuccess();
          setHasLiked(true);
          if (typeof data.likes === 'number') setCurrentLikes(data.likes);
          setLikeFeedback('♥ Sukses menyukai untuk hari ini!');
          setTimeout(() => setLikeFeedback(''), 3500);

          try {
            const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
            const todayList = daily[todayStr] || [];
            if (!todayList.includes(targetName)) {
              todayList.push(targetName);
            }
            daily[todayStr] = todayList;
            localStorage.setItem('raden_daily_likes', JSON.stringify(daily));
          } catch (e) {}

          if (onLikePlayer) {
            onLikePlayer(name);
          }
        } else if (data.status === 'already_liked' || data.has_liked_today) {
          sound.playClick();
          setHasLiked(true);
          if (typeof data.likes === 'number') setCurrentLikes(data.likes);
          setLikeFeedback(data.message || 'Kamu sudah menyukai pemain ini hari ini.');
          setTimeout(() => setLikeFeedback(''), 3500);

          try {
            const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
            const todayList = daily[todayStr] || [];
            if (!todayList.includes(targetName)) {
              todayList.push(targetName);
            }
            daily[todayStr] = todayList;
            localStorage.setItem('raden_daily_likes', JSON.stringify(daily));
          } catch (e) {}
        } else if (data.message) {
          sound.playClick();
          setLikeFeedback(data.message);
          setTimeout(() => setLikeFeedback(''), 3500);
        }
      })
      .catch(() => {
        // Fallback offline / network glitch
        sound.playSuccess();
        setHasLiked(true);
        setCurrentLikes((prev) => (typeof prev === 'number' ? prev + 1 : 1));
        setLikeFeedback('♥ Sukses menyukai untuk hari ini!');
        setTimeout(() => setLikeFeedback(''), 3500);

        try {
          const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
          const todayList = daily[todayStr] || [];
          if (!todayList.includes(targetName)) {
            todayList.push(targetName);
          }
          daily[todayStr] = todayList;
          localStorage.setItem('raden_daily_likes', JSON.stringify(daily));
        } catch (e) {}
      })
      .finally(() => {
        setIsLiking(false);
      });
  };



  if (!isOpen) return null;

  // Resolusi tanggal lahir: dari prop atau dari data user yang tersimpan di localStorage (khusus akun sendiri)
  const resolvedBirthDate = isInspecting
    ? (birthDate || '')
    : (birthDate || (() => {
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          return u.birth_date || '';
        } catch (e) {
          return '';
        }
      })());

  const isSuperAdmin = isInspecting
    ? Boolean(
        propIsSuperAdmin ||
        role === 'super_admin' ||
        role === 'admin' ||
        name?.trim()?.toUpperCase() === 'RADEN'
      )
    : Boolean(
        propIsSuperAdmin ||
        role === 'super_admin' ||
        role === 'admin' ||
        name?.trim()?.toUpperCase() === 'RADEN' ||
        (() => {
          try {
            const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
            return (
              u.role === 'admin' ||
              u.role === 'super_admin' ||
              u.is_super_admin === true ||
              u.email === 'radencakstudio@gmail.com' ||
              u.name?.toUpperCase() === 'RADEN'
            );
          } catch (e) {
            return false;
          }
        })()
      );

  const resolvedJoinedAt = isInspecting
    ? (joinedAt || 'Warga RadenWorld')
    : (() => {
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          if (u.joined_at) return u.joined_at;
          if (u.created_at) {
            const d = new Date(u.created_at);
            if (!isNaN(d.getTime())) {
              return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            }
          }
        } catch (e) {}
        return joinedAt || 'Warga RadenWorld';
      })();

  const effectiveLevel = isSuperAdmin ? '99999999999' : (level || 1);
  const effectiveTitle = isSuperAdmin ? '👑 KREATOR & SUPER ADMIN' : (title || 'Petualang');
  const effectiveGold = isSuperAdmin ? 99999999999 : (typeof gold === 'number' ? gold : 2500);
  const effectiveDiamonds = isSuperAdmin ? 99999999999 : (typeof diamonds === 'number' ? diamonds : 50);
  const effectiveLikes = isSuperAdmin ? 99999999999 : (typeof likes === 'number' ? likes : 0);

  const calculatedAge = resolvedBirthDate ? calculateAgeFromBirthDate(resolvedBirthDate) : (age || 20);
  const effectiveAge = calculatedAge;

  const maxExp = typeof effectiveLevel === 'number' ? effectiveLevel * 100 : (isSuperAdmin ? 99999999999 : 100);
  const expPercent = isSuperAdmin ? 100 : Math.min(100, Math.round(((exp || 0) / (maxExp || 100)) * 100));

  const charGender = gender || (avatar?.gender === 'female' ? 'female' : 'male');
  const genderLabel = charGender === 'female' ? 'Perempuan ♀' : 'Laki-laki ♂';

  const fallbackAvatar: IAvatarCustomization = avatar || {
    gender: charGender,
    skinColor: '#fed7aa',
    shirtColor: '#f59e0b',
    pantsColor: '#1e293b',
    hatType: isSuperAdmin ? 'crown' : 'none',
  };

  const handleSaveBio = () => {
    sound.playClick();
    setIsEditingBio(false);
    if (onSaveDescription) {
      onSaveDescription(bioText);
    }
  };

  // Helper untuk data list sosial
  const effectiveFriendsList = friendsList;
  const effectiveFollowingList = followingList;
  const effectiveFollowersList = followersList;

  const displayFriendsCount = isInspecting
    ? friendsCount
    : (effectiveFriendsList.length > 0 ? effectiveFriendsList.length : friendsCount);
  const displayFollowingCount = isInspecting
    ? followingCount
    : (effectiveFollowingList.length > 0 ? effectiveFollowingList.length : followingCount);
  const displayFollowersCount = isInspecting
    ? followersCount
    : (effectiveFollowersList.length > 0 ? effectiveFollowersList.length : followersCount);

  // Filter list sosial berdasarkan pencarian
  const getCurrentList = () => {
    let rawList: string[] = [];
    if (activeSocialTab === 'friends') rawList = effectiveFriendsList;
    else if (activeSocialTab === 'following') rawList = effectiveFollowingList;
    else if (activeSocialTab === 'followers') rawList = effectiveFollowersList;

    if (!socialSearch.trim()) return rawList;
    return rawList.filter((item) => item.toLowerCase().includes(socialSearch.toLowerCase().trim()));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 font-['Chakra_Petch'] select-none animate-in fade-in duration-150"
    >
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md ${
          isInspecting
            ? (isSuperAdmin
                ? 'bg-[#0b0c10] border border-amber-500/40 shadow-2xl'
                : 'bg-[#0b0c10] border border-cyan-500/40 shadow-2xl')
            : 'bg-[#0a0a0c] border border-white/10 shadow-2xl'
        } rounded-xl p-2.5 sm:p-4 text-neutral-100 flex flex-col gap-2 sm:gap-2.5 max-h-[min(90dvh,88vh)] overflow-hidden my-auto`}
      >
        {/* ================================================================ */}
        {/* TAMPILAN 1: DAFTAR SOSIAL (TEMAN / MENGIKUTI / DIIKUTI)           */}
        {/* ================================================================ */}
        {activeSocialTab !== 'none' ? (
          <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-hidden">
            {/* Header Sosial View */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSocialTab('none');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#151515] hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400 text-amber-400 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>KEMBALI</span>
                </button>
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  RELASI SOSIAL
                </span>
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

            {/* Switcher Tab: Teman, Mengikuti, Diikuti */}
            <div className="grid grid-cols-3 gap-1 bg-[#121212] p-1 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSocialTab('friends');
                }}
                className={`py-1.5 px-2 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSocialTab === 'friends'
                    ? 'bg-amber-500 text-black shadow-md font-extrabold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>TEMAN ({effectiveFriendsList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSocialTab('following');
                }}
                className={`py-1.5 px-2 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSocialTab === 'following'
                    ? 'bg-amber-500 text-black shadow-md font-extrabold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span>MENGIKUTI ({effectiveFollowingList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSocialTab('followers');
                }}
                className={`py-1.5 px-2 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSocialTab === 'followers'
                    ? 'bg-amber-500 text-black shadow-md font-extrabold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>DIIKUTI ({effectiveFollowersList.length})</span>
              </button>
            </div>

            {/* Input Pencarian */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={socialSearch}
                onChange={(e) => setSocialSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                placeholder="Cari nama pemain..."
                className="w-full pl-9 pr-3 py-1.5 bg-black border border-neutral-800 focus:border-amber-400 rounded-md text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-colors"
              />
            </div>

            {/* Daftar Pemain */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
              {getCurrentList().length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-[#101010] rounded-lg border border-neutral-800">
                  {activeSocialTab === 'friends' && (
                    <>
                      <Users className="w-8 h-8 text-neutral-600 mb-2" />
                      <div className="text-xs font-bold text-neutral-300">Belum Ada Teman Saling Mengikuti</div>
                      <p className="text-[10px] text-neutral-500 mt-1 max-w-[260px] leading-relaxed">
                        Teman adalah pemain yang saling mengikuti satu sama lain. Ikuti pemain lain dan minta mereka mengikutimu balik!
                      </p>
                    </>
                  )}
                  {activeSocialTab === 'following' && (
                    <>
                      <UserCheck className="w-8 h-8 text-neutral-600 mb-2" />
                      <div className="text-xs font-bold text-neutral-300">Belum Mengikuti Siapapun</div>
                      <p className="text-[10px] text-neutral-500 mt-1 max-w-[260px] leading-relaxed">
                        Klik pemain lain di open world atau klik nama mereka di obrolan chat untuk mulai mengikuti.
                      </p>
                    </>
                  )}
                  {activeSocialTab === 'followers' && (
                    <>
                      <UserPlus className="w-8 h-8 text-neutral-600 mb-2" />
                      <div className="text-xs font-bold text-neutral-300">Belum Memiliki Pengikut</div>
                      <p className="text-[10px] text-neutral-500 mt-1 max-w-[260px] leading-relaxed">
                        Jadilah petualang yang ramah dan aktif berinteraksi agar petualang lain tertarik mengikutimu!
                      </p>
                    </>
                  )}
                </div>
              ) : (
                getCurrentList().map((pName) => {
                  const isMutual =
                    effectiveFriendsList.includes(pName) ||
                    (effectiveFollowingList.includes(pName) && effectiveFollowersList.includes(pName));
                  const isIFollow = effectiveFollowingList.includes(pName);
                  const isFollowsMe = effectiveFollowersList.includes(pName);
                  const isTargetRaden = pName.toUpperCase() === 'RADEN';

                  return (
                    <div
                      key={pName}
                      className="p-2.5 rounded-lg bg-[#101010] border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-2.5 transition-colors"
                    >
                      {/* Avatar Mini & Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded bg-black border border-neutral-800 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                          {pName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-neutral-200 truncate">
                              {pName}
                            </span>
                            {isTargetRaden && (
                              <span className="text-[9px] bg-amber-500 text-black font-black px-1 rounded flex items-center gap-0.5 shrink-0">
                                <Crown className="w-2.5 h-2.5" /> RADEN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isMutual ? (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                                ✓ SALING MENGIKUTI (TEMAN)
                              </span>
                            ) : isFollowsMe ? (
                              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                                MENGIKUTI KAMU
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded">
                                SEDANG KAMU IKUTI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* 1. Tombol Buka Profil */}
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            const isTargetAdmin = pName.trim().toUpperCase() === 'RADEN';
                            const targetData = {
                              name: pName,
                              id: pName,
                              role: isTargetAdmin ? 'super_admin' : 'player',
                              isSuperAdmin: isTargetAdmin,
                              level: isTargetAdmin ? 99999999999 : 1,
                              title: isTargetAdmin ? '👑 KREATOR & SUPER ADMIN' : 'Petualang',
                              likes: isTargetAdmin ? 99999999999 : 0,
                              friendsCount: 0,
                              followingCount: 0,
                              followersCount: 0,
                            };
                            if (onInspectOtherPlayer) {
                              onInspectOtherPlayer(targetData);
                            } else {
                              EventBus.emit('inspect-player-profile', targetData);
                            }
                          }}
                          className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                          title={`Lihat profil ${pName}`}
                        >
                          <User className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Tombol Chat / Bisik */}
                        {onWhisper && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              onWhisper(pName);
                            }}
                            className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                            title={`Kirim pesan chat ke ${pName}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        )}

                        {/* 3. Tombol Aksi Follow / Unfollow / Ikuti Balik */}
                        {activeSocialTab === 'followers' && !isIFollow ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onFollowToggle) onFollowToggle(pName);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            title="Ikuti balik untuk menjadi Teman!"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>IKUTI BALIK</span>
                          </button>
                        ) : activeSocialTab === 'following' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onFollowToggle) onFollowToggle(pName);
                            }}
                            className="px-2 py-1 rounded bg-[#181818] hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 border border-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            title="Berhenti mengikuti pemain ini"
                          >
                            BATAL
                          </button>
                        ) : activeSocialTab === 'friends' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onRemoveFriend) onRemoveFriend(pName);
                              else if (onFollowToggle) onFollowToggle(pName);
                            }}
                            className="px-2 py-1 rounded bg-[#181818] hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 border border-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            title="Hapus dari daftar Teman"
                          >
                            HAPUS
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : isInspecting ? (
          /* ================================================================ */
          /* TAMPILAN 2B: KARTU IDENTITAS PETUALANG LAIN (INSPECTION CARD)    */
          /* ================================================================ */
          <div className="flex flex-col gap-2 sm:gap-2.5 flex-1 min-h-0 overflow-hidden">
            {/* Header Modal Kartu Pemain Lain */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Shield className={`w-4 h-4 shrink-0 ${isSuperAdmin ? 'text-amber-400' : 'text-cyan-400'}`} />
                <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider truncate ${isSuperAdmin ? 'text-amber-400' : 'text-cyan-400'}`}>
                  KARTU PETUALANG LAIN
                </h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-400 bg-[#121216] border border-neutral-800 px-2 py-1 rounded font-mono truncate max-w-[150px]">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{location || 'Dunia Terbuka'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="p-1.5 rounded-md border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Kartu Pemain"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY PETUALANG LAIN */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 sm:space-y-2.5 pr-1 min-h-0">
              {/* HERO CARD: AVATAR & IDENTITAS PETUALANG LAIN (TANPA EXP BAR) */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 bg-gradient-to-b from-[#131318] to-[#0c0c0f] border border-neutral-800 p-2.5 sm:p-3.5 rounded-xl shadow-inner shrink-0">
              <div
                className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-black border ${
                  isSuperAdmin ? 'border-amber-400/80 shadow-amber-500/20' : 'border-cyan-400/80 shadow-cyan-500/20'
                } shadow-lg flex items-center justify-center shrink-0 overflow-hidden`}
              >
                <AvatarPreview avatar={fallbackAvatar} size={60} />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-base font-black ${isSuperAdmin ? 'text-amber-400' : 'text-neutral-100'} uppercase tracking-wide truncate`}>
                    {name}
                  </span>
                  {isSuperAdmin ? (
                    <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black tracking-wider flex items-center gap-1 shrink-0">
                      <Crown className="w-3 h-3" /> ADMIN
                    </span>
                  ) : (
                    <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-1.5 py-0.5 rounded font-bold tracking-wider flex items-center gap-1 shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> WARGA
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400 font-mono">
                  <span>ID: #{String(playerId ?? name ?? 'PLAYER').substring(0, 8).toUpperCase()}</span>
                  <span>•</span>
                  <span className="text-neutral-300 font-sans truncate">{effectiveTitle}</span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-400">Level:</span>
                  <span className="text-xs font-black bg-black text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                    LV. {effectiveLevel}
                  </span>
                  {isSuperAdmin && (
                    <span className="text-[9px] font-bold text-amber-500 font-mono">(MAX)</span>
                  )}
                </div>
              </div>
            </div>

            {/* STATUS RELASI SOSIAL DENGAN PEMAIN INI */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#121216] border border-neutral-800 rounded-lg text-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Status Relasi:</span>
              {isFriend ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>✓ TEMAN AKRAB (SALING MENGIKUTI)</span>
                </span>
              ) : isFollower && isFollowing ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <Users className="w-3.5 h-3.5" />
                  <span>✓ SALING MENGIKUTI</span>
                </span>
              ) : isFollower ? (
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MENGIKUTI KAMU</span>
                </span>
              ) : isFollowing ? (
                <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>SEDANG KAMU IKUTI</span>
                </span>
              ) : (
                <span className="text-neutral-500 text-[11px] italic">Belum Mengikuti</span>
              )}
            </div>

            {/* STATISTIK PUBLIK PEMAIN LAIN (3 KOLOM RELEVAN DENGAN TOMBOL LIKE) */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Suka / Reputasi (Maksimal 1x Sehari & Bebas Spam) */}
              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#101014] text-center flex flex-col justify-between relative overflow-hidden">
                <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <Heart className={`w-3 h-3 ${hasLiked ? 'text-red-500 fill-red-500' : 'text-red-400'}`} />
                  <span>DISUKAI</span>
                </div>
                <div className="text-sm font-black text-amber-400 my-1">
                  {isSuperAdmin ? '99999999999' : (currentLikes || 0).toLocaleString('id-ID')} ♥
                </div>
                <button
                  type="button"
                  onClick={handleGiveLike}
                  disabled={hasLiked || isLiking}
                  className={`w-full py-1.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                    hasLiked
                      ? 'bg-red-500/15 text-red-400 border border-red-500/40 cursor-not-allowed shadow-none'
                      : isLiking
                        ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-wait'
                        : 'bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-300 border border-neutral-700 cursor-pointer active:scale-95 shadow-sm'
                  }`}
                  title={hasLiked ? 'Kamu sudah menyukai pemain ini hari ini. Bisa kasih like lagi besok!' : 'Beri 1 suka per hari ke pemain ini (tidak bisa spam)'}
                >
                  <Heart className={`w-2.5 h-2.5 ${hasLiked ? 'fill-current text-red-500' : ''}`} />
                  <span>{hasLiked ? '✓ DISUKAI HARI INI' : isLiking ? 'MENGIRIM...' : '+ SUKA (1x/HARI)'}</span>
                </button>
                {likeFeedback && (
                  <div className="absolute inset-x-1 bottom-1 text-[8px] font-bold bg-black/95 text-amber-300 py-0.5 px-1 rounded border border-amber-500/40 animate-in fade-in truncate shadow-lg">
                    {likeFeedback}
                  </div>
                )}
              </div>

              {/* 2. Teman (Saling Follow) */}
              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#101014] text-center flex flex-col justify-center">
                <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>TEMAN</span>
                </div>
                <div className="text-sm font-black text-emerald-400 mt-1">
                  {displayFriendsCount}
                </div>
                <div className="text-[8px] text-neutral-500 font-mono mt-0.5">
                  Saling Follow
                </div>
              </div>

              {/* 3. Pengikut (Followers) */}
              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#101014] text-center flex flex-col justify-center">
                <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <UserPlus className="w-3 h-3 text-cyan-400" />
                  <span>PENGIKUT</span>
                </div>
                <div className="text-sm font-black text-cyan-300 mt-1">
                  {displayFollowersCount}
                </div>
                <div className="text-[8px] text-neutral-500 font-mono mt-0.5">
                  Followers
                </div>
              </div>
            </div>

            {/* INFO TAMBAHAN PUBLIK (GENDER & TERDAFTAR) - BEBAS KOIN & TANGGAL LAHIR */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg border border-neutral-800 bg-[#101014] flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <div>
                  <div className="text-[9px] text-neutral-400 uppercase font-bold">GENDER</div>
                  <div className="text-xs font-bold text-neutral-200">{genderLabel}</div>
                </div>
              </div>

              <div className="p-2 rounded-lg border border-neutral-800 bg-[#101014] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-neutral-400 uppercase font-bold">BERGABUNG</div>
                  <div className="text-xs font-bold text-neutral-200 truncate">{resolvedJoinedAt}</div>
                </div>
              </div>
            </div>

            {/* KUTIPAN STATUS / BIO PETUALANG (READ ONLY TANPA EDIT) */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-[#101014] flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <Quote className="w-3 h-3 text-amber-400/80" />
                <span>KATA MUTIARA / STATUS PETUALANG</span>
              </div>
              <p className="text-xs text-neutral-200 italic leading-relaxed pl-1">
                "{description || 'Petualang penjelajah tanah agung RadenWorld.'}"
              </p>
            </div>
          </div>

          {/* ACTION FOOTER SOSIAL PEMAIN LAIN */}
          <div className="pt-2 border-t border-neutral-800 flex items-center gap-2 shrink-0">
              {/* Jika Sudah Berteman Resmi (Saling Mengikuti) */}
              {isFriend ? (
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <div className="flex-1 py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center gap-1.5 shadow-sm truncate">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">✓ TEMAN (SALING MENGIKUTI)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (onFollowToggle) onFollowToggle(name, playerId);
                    }}
                    className="py-2.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    title="Berhenti berteman dan berhenti mengikuti"
                  >
                    <UserX className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
                    <span className="hidden sm:inline">HAPUS TEMAN</span>
                  </button>
                </div>
              ) : isFollowing ? (
                /* Jika Sedang Mengikuti (Belum Diikuti Balik) */
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    if (onFollowToggle) onFollowToggle(name, playerId);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 hover:border-red-500/50 text-cyan-400 hover:text-red-400 border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Klik untuk berhenti mengikuti pemain ini"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>✓ SEDANG MENGIKUTI</span>
                  <span className="text-[10px] text-neutral-500 hidden sm:inline">(BATAL)</span>
                </button>
              ) : isFollower ? (
                /* Jika Dia Mengikuti Kita (Bisa Ikuti Balik untuk Otomatis Jadi Teman!) */
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    if (onFollowToggle) onFollowToggle(name, playerId);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Ikuti balik pemain ini untuk otomatis menjadi Teman (saling mengikuti)!"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ IKUTI BALIK (JADI TEMAN)</span>
                </button>
              ) : (
                /* Belum Mengikuti */
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    if (onFollowToggle) onFollowToggle(name, playerId);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Ikuti pemain ini. Jika dia mengikutimu balik, kalian akan otomatis menjadi Teman!"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ IKUTI</span>
                </button>
              )}

              {/* 2. Tombol Chat / Sapa */}
              {onWhisper && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onWhisper(name);
                  }}
                  className="py-2.5 px-3 rounded-lg bg-[#141418] hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
                  title={`Kirim pesan obrolan ke ${name}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">CHAT</span>
                </button>
              )}

              {/* 3. Tombol Tutup Profil */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="py-2 sm:py-2.5 px-3 rounded-lg border border-neutral-800 bg-[#141418] hover:bg-[#1f1f24] text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                title="Tutup Profil"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* TAMPILAN 2A: PROFIL KARAKTER SAYA (PERSONAL ACCOUNT DASHBOARD)   */
          /* ================================================================ */
          <div className="flex flex-col gap-2 sm:gap-2.5 flex-1 min-h-0 overflow-hidden">
            {/* Header Modal Akun Saya */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                  PROFIL KARAKTER SAYA
                </h2>
                {isSuperAdmin && (
                  <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Tombol Petunjuk Kontrol */}
                {onOpenGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onOpenGuide();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-800 bg-[#121212] hover:border-amber-400 text-amber-400 hover:text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
                    title="Buka Petunjuk Kontrol Game"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>PETUNJUK</span>
                  </button>
                )}

                {/* Tombol Tutup X */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="p-1 rounded-md border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Profil"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigasi Kategori Tab: IKHTISAR vs KEAMANAN & AKUN */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#121214] rounded-lg border border-neutral-800/80 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setProfileCategory('overview');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                  profileCategory === 'overview'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. IKHTISAR PROFIL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setProfileCategory('account');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                  profileCategory === 'account'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. KEAMANAN & AKUN</span>
                {(!isEmailVerified || (!isGoogleLinked && !isFacebookLinked)) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" title="Ada pengaturan akun yang belum lengkap" />
                )}
              </button>
            </div>

            {/* SCROLLABLE BODY PROFIL SAYA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 sm:space-y-2.5 pr-1 min-h-0">
              {profileCategory === 'overview' ? (
                <>
                  {/* HERO SECTION: AVATAR & IDENTITAS KARAKTER SAYA DENGAN PROGRESS EXP */}
            <div className="flex items-center gap-2.5 sm:gap-4 bg-[#101010] border border-neutral-800 p-2.5 sm:p-3.5 rounded-md shrink-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-md bg-black border border-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                <AvatarPreview avatar={fallbackAvatar} size={60} />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base font-bold text-amber-400 uppercase tracking-wide truncate">
                      {currentDisplayName || name}
                    </span>
                    {!isInspecting && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setNewNameInput(currentDisplayName || name);
                          setIsEditingName(true);
                        }}
                        className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                        title="Ganti Nama Karakter (Nickname)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded shrink-0">
                    LV. {effectiveLevel}
                  </span>
                </div>

                <div className="text-xs text-neutral-400 font-semibold tracking-wider uppercase mt-0.5 truncate">
                  {effectiveTitle}
                </div>

                {/* Progress EXP Minimalis Karakter Saya */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>EXP</span>
                    <span>{isSuperAdmin ? 'MAX' : `${exp} / ${maxExp} (${expPercent}%)`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${expPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STATISTIK GRID: UMUR & GENDER & KEUANGAN SAYA */}
            <div className="grid grid-cols-2 gap-2">
              {/* 1. Umur */}
              <div className="p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400/80 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">UMUR</div>
                  <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5 flex-wrap">
                    <span>{effectiveAge} Tahun</span>
                    {resolvedBirthDate && (
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">
                        ({resolvedBirthDate})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Gender */}
              <div className="p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center gap-2.5">
                <User className="w-4 h-4 text-amber-400/80 shrink-0" />
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">GENDER</div>
                  <div className="text-xs font-bold text-neutral-100">{genderLabel}</div>
                </div>
              </div>

              {/* 3. Koin Emas */}
              <div className="p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center gap-2.5">
                <Coins className="w-4 h-4 text-amber-400/80 shrink-0" />
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">KOIN</div>
                  <div className="text-xs font-bold text-amber-400">
                    {isSuperAdmin || effectiveGold >= 99999999999 ? '99999999999' : effectiveGold.toLocaleString('id-ID')} G
                  </div>
                </div>
              </div>

              {/* 4. Berlian */}
              <div
                onClick={() => {
                  if (onOpenTopUp) {
                    sound.playClick();
                    onOpenTopUp();
                  }
                }}
                className={`p-2.5 rounded-md border border-neutral-800 bg-[#101010] flex items-center justify-between gap-2.5 transition-colors ${
                  onOpenTopUp ? 'cursor-pointer hover:border-cyan-500/50 group' : ''
                }`}
                title={onOpenTopUp ? 'Klik untuk Top Up Berlian' : 'Jumlah Berlian'}
              >
                <div className="flex items-center gap-2.5">
                  <Gem className="w-4 h-4 text-cyan-400 fill-cyan-400/20 shrink-0" />
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">BERLIAN</div>
                    <div className="text-xs font-bold text-cyan-300">
                      {isSuperAdmin || effectiveDiamonds >= 99999999999 ? '99999999999' : effectiveDiamonds.toLocaleString('id-ID')} ✦
                    </div>
                  </div>
                </div>
                {onOpenTopUp && (
                  <span className="text-[9px] font-black bg-cyan-400 hover:bg-cyan-300 text-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                    TOPUP
                  </span>
                )}
              </div>
            </div>

            {/* STATISTIK SOSIAL: TEMAN, MENGIKUTI, DIIKUTI (INTERAKTIF BISA DIKLIK) */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Teman (Saling Mengikuti) */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSocialTab('friends');
                }}
                className="p-2 rounded-md border border-neutral-800 bg-[#101010] hover:border-amber-400/80 hover:bg-[#161616] text-center transition-all cursor-pointer group active:scale-95"
                title="Klik untuk membuka daftar Teman (Saling Mengikuti)"
              >
                <div className="text-[10px] text-neutral-400 group-hover:text-amber-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-amber-400" />
                  <span>TEMAN</span>
                </div>
                <div className="text-sm font-black text-amber-400 mt-0.5">
                  {displayFriendsCount}
                </div>
                <div className="text-[8px] text-neutral-500 font-mono group-hover:text-amber-300/80">
                  Saling Follow
                </div>
              </button>

              {/* 2. Mengikuti */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSocialTab('following');
                }}
                className="p-2 rounded-md border border-neutral-800 bg-[#101010] hover:border-amber-400/80 hover:bg-[#161616] text-center transition-all cursor-pointer group active:scale-95"
                title="Klik untuk membuka daftar pemain yang diikuti"
              >
                <div className="text-[10px] text-neutral-400 group-hover:text-amber-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <UserCheck className="w-3 h-3 text-neutral-300 group-hover:text-amber-400" />
                  <span>MENGIKUTI</span>
                </div>
                <div className="text-sm font-black text-neutral-200 group-hover:text-amber-300 mt-0.5">
                  {displayFollowingCount}
                </div>
                <div className="text-[8px] text-neutral-500 font-mono group-hover:text-amber-300/80">
                  Following
                </div>
              </button>

              {/* 3. Diikuti */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSocialTab('followers');
                }}
                className="p-2 rounded-md border border-neutral-800 bg-[#101010] hover:border-amber-400/80 hover:bg-[#161616] text-center transition-all cursor-pointer group active:scale-95"
                title="Klik untuk membuka daftar pengikut"
              >
                <div className="text-[10px] text-neutral-400 group-hover:text-amber-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <UserPlus className="w-3 h-3 text-neutral-300 group-hover:text-amber-400" />
                  <span>DIIKUTI</span>
                </div>
                <div className="text-sm font-black text-neutral-200 group-hover:text-amber-300 mt-0.5">
                  {displayFollowersCount}
                </div>
                <div className="text-[8px] text-neutral-500 font-mono group-hover:text-amber-300/80">
                  Followers
                </div>
              </button>
            </div>

            {/* DESKRIPSI (BIO) KARAKTER SAYA (DENGAN FITUR EDIT BEBAS SPASI) */}
            <div className="p-3 rounded-md border border-neutral-800 bg-[#101010] flex flex-col gap-1.5 min-h-[76px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
                <div className="flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>STATUS / BIO SAYA</span>
                </div>
                {!isEditingBio ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(true)}
                    className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>EDIT</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>SIMPAN</span>
                  </button>
                )}
              </div>

              {isEditingBio ? (
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyUp={(e) => {
                    e.stopPropagation();
                  }}
                  maxLength={120}
                  rows={2}
                  className="w-full bg-black border border-amber-500/60 rounded-md p-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 resize-none font-sans"
                  placeholder="Tulis status karakter..."
                  autoFocus
                />
              ) : (
                <p className="text-xs text-neutral-300 italic line-clamp-2 leading-relaxed">
                  "{bioText || 'Belum ada status karakter.'}"
                </p>
              )}
            </div>

            {/* Total Like Bar & Tanggal Bergabung Saya */}
            <div className="grid grid-cols-2 gap-2">
              <div className="px-3 py-2 rounded-md border border-neutral-800 bg-[#101010] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                  <span>DISUKAI</span>
                </div>
                <span className="font-bold text-amber-400">
                  {isSuperAdmin ? '99999999999' : (effectiveLikes || 0).toLocaleString('id-ID')} ♥
                </span>
              </div>
              <div className="px-3 py-2 rounded-md border border-neutral-800 bg-[#101010] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  <span>BERGABUNG</span>
                </div>
                <span className="font-bold text-neutral-200 truncate text-right">
                  {resolvedJoinedAt}
                </span>
              </div>
            </div>

            {/* Tombol Teleport Portal Admin (Hanya Super Admin di profil sendiri) */}
            {isSuperAdmin && !!onTeleportToAdminPortal && (
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  if (onTeleportToAdminPortal) onTeleportToAdminPortal();
                }}
                className="w-full py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>MASUK KE PORTAL ADMIN</span>
              </button>
            )}
                </>
              ) : (
                /* ================================================================ */
                /* KATEGORI: KEAMANAN & AKUN (AUTHORITATIVE RADENSHIELD & SOCIALS)  */
                /* ================================================================ */
                <div className="space-y-2.5 pb-2">
                  {/* Feedback Banner */}
                  {accountFeedback && (
                    <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="leading-tight">{accountFeedback}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAccountFeedback('')}
                        className="text-neutral-400 hover:text-white text-xs font-bold px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* KARTU 1: RADENSHIELD™ ANTI-CHEAT & SERVER PROTECTION */}
                  <div className="p-3 rounded-lg border border-neutral-800 bg-[#101012] flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                          RadenShield™ Engine
                        </span>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> PROTECTED
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Sistem keamanan multi-layer aktif melindungi akun, saldo koin & diamond, pergerakan karakter, serta mencegah eksploitasi server.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px] font-semibold text-neutral-300">
                      <div className="p-1.5 rounded bg-black/40 border border-neutral-800/80 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">MySQL Vault Lock</span>
                      </div>
                      <div className="p-1.5 rounded bg-black/40 border border-neutral-800/80 flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Anti-Speedhack & Warp</span>
                      </div>
                      <div className="p-1.5 rounded bg-black/40 border border-neutral-800/80 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">Chat Flood Protection</span>
                      </div>
                    </div>
                  </div>

                  {/* KARTU 2: EMAIL AKUN UTAMA & VERIFIKASI */}
                  <div className="p-3 rounded-lg border border-neutral-800 bg-[#101012] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-200">
                          Email Akun Utama
                        </span>
                      </div>
                      {isEmailVerified ? (
                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> TERVERIFIKASI
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> BELUM VERIFIKASI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs bg-black/50 p-2 rounded border border-neutral-800">
                      <span className="text-neutral-300 font-medium truncate">
                        {accountEmail || 'Email belum diatur di akun'}
                      </span>
                      {isEmailVerified && (
                        <span className="text-[10px] text-emerald-400 font-bold ml-2 shrink-0">AMAN</span>
                      )}
                    </div>

                    {!isEmailVerified && (
                      <button
                        type="button"
                        disabled={verifyingEmail || !accountEmail}
                        onClick={handleVerifyEmail}
                        className="mt-1 w-full py-1.5 px-3 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {verifyingEmail ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>MEMVERIFIKASI EMAIL...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>VERIFIKASI EMAIL SEKARANG</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* KARTU 3: TAUTAN AKUN GOOGLE */}
                  <div className="p-3 rounded-lg border border-neutral-800 bg-[#101012] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-200">
                          Tautan Akun Google
                        </span>
                      </div>
                      {isGoogleLinked ? (
                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> TERTAUT
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-neutral-800 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded">
                          BELUM TERTAUT
                        </span>
                      )}
                    </div>

                    {isGoogleLinked ? (
                      <div className="flex items-center justify-between text-xs bg-black/50 p-2 rounded border border-neutral-800">
                        <span className="text-neutral-300 font-medium truncate">
                          {linkedGoogleEmail || accountEmail || 'Akun Google Tertaut'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnlink('google')}
                          className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline ml-2 cursor-pointer shrink-0"
                        >
                          Putuskan
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSocialChooserProvider('google');
                          setIsSocialChooserOpen(true);
                        }}
                        className="mt-1 w-full py-1.5 px-3 rounded border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Link className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pilih & Tautkan Akun Google</span>
                      </button>
                    )}
                  </div>

                  {/* KARTU 4: TAUTAN AKUN FACEBOOK */}
                  <div className="p-3 rounded-lg border border-neutral-800 bg-[#101012] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-200">
                          Tautan Akun Facebook
                        </span>
                      </div>
                      {isFacebookLinked ? (
                        <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> TERTAUT
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-neutral-800 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded">
                          BELUM TERTAUT
                        </span>
                      )}
                    </div>

                    {isFacebookLinked ? (
                      <div className="flex items-center justify-between text-xs bg-black/50 p-2 rounded border border-neutral-800">
                        <span className="text-neutral-300 font-medium truncate">
                          {linkedFacebookEmail || accountEmail || 'Akun Facebook Tertaut'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnlink('facebook')}
                          className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline ml-2 cursor-pointer shrink-0"
                        >
                          Putuskan
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSocialChooserProvider('facebook');
                          setIsSocialChooserOpen(true);
                        }}
                        className="mt-1 w-full py-1.5 px-3 rounded border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Link className="w-3.5 h-3.5 text-blue-400" />
                        <span>Pilih & Tautkan Akun Facebook</span>
                      </button>
                    )}
                  </div>

                  {/* KARTU 5: KEAMANAN SALDO AUTHORITATIVE MYSQL */}
                  <div className="p-3 rounded-lg border border-neutral-800 bg-[#101012] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                          Authoritative Wallet Vault
                        </span>
                      </div>
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded">
                        MYSQL PROTECTED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-black/60 border border-neutral-800 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-[9px] text-neutral-400 font-bold uppercase">Koin Emas</div>
                          <div className="font-extrabold text-amber-400">{gold.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-black/60 border border-neutral-800 flex items-center gap-2">
                        <Gem className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-[9px] text-neutral-400 font-bold uppercase">Diamond</div>
                          <div className="font-extrabold text-cyan-400">{diamonds.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-tight">
                      Saldo dilindungi oleh tanda tangan digital & row-level locking server untuk mencegah modifikasi ilegal client-side.
                    </p>

                    {onRefreshWallet && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onRefreshWallet();
                          setAccountFeedback('✓ Saldo berhasil disinkronkan langsung dari basis data server.');
                        }}
                        className="mt-1 w-full py-1.5 px-3 rounded border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sinkronkan Saldo Database</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* FOOTER ACTIONS PROFIL SAYA */}
          <div className="pt-2 border-t border-neutral-800 flex items-center gap-2 shrink-0 bg-[#0a0a0c]">
              {/* Tombol Logout Akun */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-1.5 sm:py-2 px-3 rounded-md border border-neutral-800 bg-[#121212] hover:bg-[#1a1a1a] hover:border-red-500/50 text-neutral-400 hover:text-red-400 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT</span>
              </button>

              {/* Tombol Tutup Profil */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="flex-1 py-1.5 sm:py-2 px-3 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                TUTUP
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL FORM GANTI NAMA KARAKTER: Responsif Mobile Tegak/Miring & PC   */}
      {/* ==================================================================== */}
      {isEditingName && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md bg-[#0e0e0e] border border-amber-500/50 rounded-xl p-4 sm:p-6 shadow-2xl space-y-4">
            
            {/* Header Form */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    GANTI NAMA KARAKTER
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Nama baru petualang di RadenWorld.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsEditingName(false);
                  setNewNameInput(currentDisplayName);
                }}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wide mb-1.5">
                  Nama Karakter Baru
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newNameInput}
                    onChange={(e) => setNewNameInput(e.target.value)}
                    placeholder="Masukkan nama baru..."
                    maxLength={20}
                    autoFocus
                    disabled={isSavingName}
                    className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-sm text-amber-300 font-bold placeholder:text-neutral-500 focus:outline-none transition-all font-sans"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-neutral-500 font-mono">
                    {newNameInput.trim().length}/20
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1.5">
                  Minimal 3 karakter, maksimal 20 karakter. Langsung tersimpan permanen ke server database.
                </p>
              </div>

              {/* Action Buttons: Batal & Simpan */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsEditingName(false);
                    setNewNameInput(currentDisplayName);
                  }}
                  disabled={isSavingName}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingName || newNameInput.trim().length < 3 || newNameInput.trim() === currentDisplayName}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingName ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Nama</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* SOCIAL ACCOUNT CHOOSER MODAL (GOOGLE / FACEBOOK) */}
      <SocialAccountChooserModal
        isOpen={isSocialChooserOpen}
        provider={socialChooserProvider}
        mode="link"
        targetCharacterName={currentDisplayName || name}
        onClose={() => setIsSocialChooserOpen(false)}
        onSelectAccount={handleAccountChosen}
      />
    </div>
  );
};
