/**
 * ============================================================================
 * FILE: resources/js/game/ui/ProfileModal.tsx
 * ============================================================================
 * Pop-up Profil Karakter Pemain & Sistem Sosial Terpadu (Cozycore Clay-Pixel):
 * 1. Bebas Bug Spasi: Tombol spasi dapat diketik lancar di bio & ganti nama.
 * 2. Daftar Sosial Interaktif: TEMAN, MENGIKUTI, dan DIIKUTI.
 * 3. Modal Pemain Lain (Inspected Player): Suka 1x/hari, Follow/Unfollow, Chat.
 * 4. Keamanan & Akun (RadenShield™, Verifikasi Email, Tautan Google & Facebook).
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
import { NetworkManager } from '../core/NetworkManager';
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
  onFollowToggle,
  onRemoveFriend,
  onInspectOtherPlayer,
  onWhisper,
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
  const [activeSocialTab, setActiveSocialTab] = useState<
    'none' | 'friends' | 'following' | 'followers'
  >('none');
  const [socialSearch, setSocialSearch] = useState('');
  const [hasLiked, setHasLiked] = useState<boolean>(hasLikedToday);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [currentLikes, setCurrentLikes] = useState<number>(likes);
  const [likeFeedback, setLikeFeedback] = useState<string>('');

  const [profileCategory, setProfileCategory] = useState<'overview' | 'friends' | 'following' | 'followers' | 'account'>('overview');

  const [accountEmail] = useState<string>(() => {
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
      return emailVerified !== undefined
        ? emailVerified
        : Boolean(u.email_verified || u.email_verified_at);
    } catch (e) {
      return Boolean(emailVerified);
    }
  });

  const [isGoogleLinked, setIsGoogleLinked] = useState<boolean>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      return googleLinked !== undefined
        ? googleLinked
        : Boolean(u.google_linked || u.google_email || u.provider === 'google');
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
      return facebookLinked !== undefined
        ? facebookLinked
        : Boolean(u.facebook_linked || u.facebook_email || u.provider === 'facebook');
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
  const [, setIsLinkingLoading] = useState(false);

  const [isSocialChooserOpen, setIsSocialChooserOpen] = useState(false);
  const [socialChooserProvider, setSocialChooserProvider] = useState<'google' | 'facebook'>(
    'google'
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState(name);
  const [newNameInput, setNewNameInput] = useState(name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    setCurrentDisplayName(name);
    setNewNameInput(name);
  }, [name]);

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
        setAccountFeedback('Email Anda telah berhasil diverifikasi secara resmi!');
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
        setAccountFeedback(`Tautan akun ${provider} berhasil dilepas.`);
      }
    } catch (err) {
      setAccountFeedback('Gagal menghubungi server.');
    }
  };

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
        setAccountFeedback(
          data.message || `Akun ${socialChooserProvider} (${acc.email}) berhasil ditautkan!`
        );
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

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNameInput.trim();
    if (!trimmed || trimmed.length < 3) {
      setNameError('Nama karakter harus minimal 3 karakter.');
      return;
    }
    if (trimmed.length > 25) {
      setNameError('Nama karakter maksimal 25 karakter.');
      return;
    }
    if (trimmed === currentDisplayName) {
      setIsEditingName(false);
      return;
    }

    sound.playClick();
    setIsSavingName(true);
    setNameError('');
    setAccountFeedback('');

    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      const authToken =
        (typeof window !== 'undefined' ? localStorage.getItem('raden_auth_token') : '') || '';
      const res = await fetch('/api/user/account/update-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'X-Auth-Token': authToken,
          'X-User-Id': u.id?.toString() || '',
          'X-User-Email': u.email || accountEmail || '',
          'X-User-Name': currentDisplayName || u.name || name || '',
        },
        body: JSON.stringify({
          user_id: u.id || undefined,
          auth_token: authToken,
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
        setNameError('');
        if (data.user) {
          u.id = data.user.id || u.id;
          u.name = data.user.name || trimmed;
          u.email = data.user.email || u.email;
          if (data.user.role) u.role = data.user.role;
          if (typeof data.user.is_super_admin === 'boolean')
            u.is_super_admin = data.user.is_super_admin;
          if (data.user.auth_token) {
            localStorage.setItem('raden_auth_token', data.user.auth_token);
          }
        } else {
          u.name = trimmed;
        }
        localStorage.setItem('raden_player_user', JSON.stringify(u));
        setAccountFeedback(data.message || `Nama karakter berhasil diubah menjadi ${trimmed}!`);
        if (onUpdateName) onUpdateName(trimmed);
        EventBus.emit('player-name-changed', trimmed);
        EventBus.emit('update-player-name', trimmed);
        try {
          NetworkManager.getInstance().sendPlayerUpdate({ name: trimmed });
        } catch (e) {}
      } else {
        const errMsg = data.message || 'Gagal mengubah nama karakter.';
        setNameError(errMsg);
        setAccountFeedback(errMsg);
        sound.playError();
      }
    } catch (err) {
      setNameError('Gagal terhubung ke database server.');
      setAccountFeedback('Gagal terhubung ke database server.');
      sound.playError();
    } finally {
      setIsSavingName(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      EventBus.emit('dialogue-active', true);
    }
    return () => {
      EventBus.emit('dialogue-active', false);
    };
  }, [isOpen]);

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
        const isLikedToday =
          Array.isArray(todayList) && todayList.includes(name.trim().toLowerCase());
        setHasLiked(isLikedToday);
      } catch (e) {
        setHasLiked(false);
      }
    }
  }, [isOpen, name, description, isInspecting, likes, hasLikedToday]);

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

    try {
      const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
      const todayList = daily[todayStr] || [];
      if (todayList.includes(targetName)) {
        setHasLiked(true);
        setLikeFeedback('Sudah disukai hari ini!');
        setTimeout(() => setLikeFeedback(''), 3000);
        return;
      }
    } catch (e) {}

    setIsLiking(true);

    fetch(`/api/auth/profile/${encodeURIComponent(name)}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
          setLikeFeedback('Sukses menyukai hari ini!');
          setTimeout(() => setLikeFeedback(''), 3500);

          try {
            const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
            const todayList = daily[todayStr] || [];
            if (!todayList.includes(targetName)) todayList.push(targetName);
            daily[todayStr] = todayList;
            localStorage.setItem('raden_daily_likes', JSON.stringify(daily));
          } catch (e) {}

          if (onLikePlayer) onLikePlayer(name);
        } else if (data.status === 'already_liked' || data.has_liked_today) {
          sound.playClick();
          setHasLiked(true);
          if (typeof data.likes === 'number') setCurrentLikes(data.likes);
          setLikeFeedback(data.message || 'Sudah disukai hari ini.');
          setTimeout(() => setLikeFeedback(''), 3500);

          try {
            const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
            const todayList = daily[todayStr] || [];
            if (!todayList.includes(targetName)) todayList.push(targetName);
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
        sound.playSuccess();
        setHasLiked(true);
        setCurrentLikes((prev) => (typeof prev === 'number' ? prev + 1 : 1));
        setLikeFeedback('Sukses menyukai hari ini!');
        setTimeout(() => setLikeFeedback(''), 3500);

        try {
          const daily = JSON.parse(localStorage.getItem('raden_daily_likes') || '{}');
          const todayList = daily[todayStr] || [];
          if (!todayList.includes(targetName)) todayList.push(targetName);
          daily[todayStr] = todayList;
          localStorage.setItem('raden_daily_likes', JSON.stringify(daily));
        } catch (e) {}
      })
      .finally(() => {
        setIsLiking(false);
      });
  };

  if (!isOpen) return null;

  const resolvedBirthDate = isInspecting
    ? birthDate || ''
    : birthDate ||
      (() => {
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          return u.birth_date || '';
        } catch (e) {
          return '';
        }
      })();

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
    ? joinedAt || 'Warga RadenWorld'
    : (() => {
        try {
          const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
          if (u.joined_at) return u.joined_at;
          if (u.created_at) {
            const d = new Date(u.created_at);
            if (!isNaN(d.getTime())) {
              return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            }
          }
        } catch (e) {}
        return joinedAt || 'Warga RadenWorld';
      })();

  const effectiveLevel = isSuperAdmin ? '99999999999' : level || 1;
  const effectiveTitle = isSuperAdmin ? 'KREATOR & SUPER ADMIN' : title || 'Petualang';
  const effectiveGold = isSuperAdmin ? 99999999999 : typeof gold === 'number' ? gold : 2500;
  const effectiveLikes = isSuperAdmin ? 99999999999 : typeof likes === 'number' ? likes : 0;

  const calculatedAge = resolvedBirthDate
    ? calculateAgeFromBirthDate(resolvedBirthDate)
    : age || 20;
  const effectiveAge = calculatedAge;

  const maxExp =
    typeof effectiveLevel === 'number' ? effectiveLevel * 100 : isSuperAdmin ? 99999999999 : 100;
  const expPercent = isSuperAdmin
    ? 100
    : Math.min(100, Math.round(((exp || 0) / (maxExp || 100)) * 100));

  const charGender = gender || (avatar?.gender === 'female' ? 'female' : 'male');
  const genderLabel = charGender === 'female' ? 'Perempuan' : 'Laki-Laki';

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

  const effectiveFriendsList = friendsList;
  const effectiveFollowingList = followingList;
  const effectiveFollowersList = followersList;

  const displayFriendsCount = isInspecting
    ? friendsCount
    : effectiveFriendsList.length > 0
    ? effectiveFriendsList.length
    : friendsCount;
  const displayFollowingCount = isInspecting
    ? followingCount
    : effectiveFollowingList.length > 0
    ? effectiveFollowingList.length
    : followingCount;
  const displayFollowersCount = isInspecting
    ? followersCount
    : effectiveFollowersList.length > 0
    ? effectiveFollowersList.length
    : followersCount;

  const getCurrentList = () => {
    let rawList: string[] = [];
    if ((activeSocialTab as string) === 'friends') rawList = effectiveFriendsList;
    else if ((activeSocialTab as string) === 'following') rawList = effectiveFollowingList;
    else if ((activeSocialTab as string) === 'followers') rawList = effectiveFollowersList;

    if (!socialSearch.trim()) return rawList;
    return rawList.filter((item) =>
      item.toLowerCase().includes(socialSearch.toLowerCase().trim())
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      className="ui-modal-backdrop select-none"
    >
      <div className="clay-panel landscape-compact-modal relative w-full max-w-lg max-h-[min(92dvh,calc(100dvh-1rem))] overflow-hidden flex flex-col text-black">
        {/* ================================================================ */}
        {/* TAMPILAN 1: DAFTAR SOSIAL (TEMAN / MENGIKUTI / DIIKUTI)           */}
        {/* ================================================================ */}
        {activeSocialTab !== 'none' ? (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Header Sosial View */}
            <div className="clay-header landscape-compact-header px-4 py-3 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSocialTab('none');
                  }}
                  className="clay-btn-neutral px-2.5 py-1 text-black text-[11px] font-bold flex items-center gap-1 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>KEMBALI</span>
                </button>
                <span className="text-xs sm:text-sm font-bold uppercase text-black truncate">
                  RELASI SOSIAL
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Switcher Tab: Teman, Mengikuti, Diikuti */}
            <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-[#FFF8EA] border-b-2 border-[#5C3A21] shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setProfileCategory('friends');
                }}
                className={`py-1.5 px-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1 text-black ${
                  profileCategory === 'friends' ? 'clay-btn-primary' : 'clay-btn-neutral'
                }`}
              >
                <Users className="w-3 h-3 shrink-0 stroke-[2.5]" />
                <span className="truncate">TEMAN ({effectiveFriendsList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setProfileCategory('following');
                }}
                className={`py-1.5 px-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1 text-black ${
                  profileCategory === 'following' ? 'clay-btn-primary' : 'clay-btn-neutral'
                }`}
              >
                <UserCheck className="w-3 h-3 shrink-0 stroke-[2.5]" />
                <span className="truncate">IKUTI ({effectiveFollowingList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setProfileCategory('followers');
                }}
                className={`py-1.5 px-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1 text-black ${
                  profileCategory === 'followers' ? 'clay-btn-primary' : 'clay-btn-neutral'
                }`}
              >
                <UserPlus className="w-3 h-3 shrink-0 stroke-[2.5]" />
                <span className="truncate">PENGIKUT ({effectiveFollowersList.length})</span>
              </button>
            </div>

            {/* Input Pencarian */}
            <div className="px-3 pt-2.5 bg-[#FFF8EA] shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" />
                <input
                  type="text"
                  value={socialSearch}
                  onChange={(e) => setSocialSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="Cari nama pemain..."
                  className="clay-input w-full pl-8 pr-3 py-1.5 text-xs text-black"
                />
              </div>
            </div>

            {/* Daftar Pemain */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-0 bg-[#FFF8EA]">
              {getCurrentList().length === 0 ? (
                <div className="clay-card flex flex-col items-center justify-center text-center py-8 px-4 text-black gap-1.5">
                  {profileCategory === 'friends' && (
                    <>
                      <Users className="w-7 h-7 stroke-[2.5]" />
                      <div className="text-xs font-bold">Belum Ada Teman Saling Mengikuti</div>
                      <p className="text-[10px] max-w-[260px] leading-snug">
                        Ikuti pemain lain dan minta mereka mengikutimu balik!
                      </p>
                    </>
                  )}
                  {profileCategory === 'following' && (
                    <>
                      <UserCheck className="w-7 h-7 stroke-[2.5]" />
                      <div className="text-xs font-bold">Belum Mengikuti Siapapun</div>
                      <p className="text-[10px] max-w-[260px] leading-snug">
                        Klik pemain lain di dunia atau di daftar server untuk mulai mengikuti.
                      </p>
                    </>
                  )}
                  {profileCategory === 'followers' && (
                    <>
                      <UserPlus className="w-7 h-7 stroke-[2.5]" />
                      <div className="text-xs font-bold">Belum Memiliki Pengikut</div>
                      <p className="text-[10px] max-w-[260px] leading-snug">
                        Jadilah petualang ramah agar pemain lain mengikutimu!
                      </p>
                    </>
                  )}
                </div>
              ) : (
                getCurrentList().map((pName) => {
                  const isMutual =
                    effectiveFriendsList.includes(pName) ||
                    (effectiveFollowingList.includes(pName) &&
                      effectiveFollowersList.includes(pName));
                  const isIFollow = effectiveFollowingList.includes(pName);
                  const isFollowsMe = effectiveFollowersList.includes(pName);
                  const isTargetRaden = pName.toUpperCase() === 'RADEN';

                  return (
                    <div
                      key={pName}
                      className="clay-card p-2.5 flex items-center justify-between gap-2 text-black"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black font-bold text-xs shrink-0">
                          {pName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-black truncate">{pName}</span>
                            {isTargetRaden && (
                              <span className="clay-badge-cocoa text-[9px] text-white font-bold px-1.5 py-0.5 flex items-center gap-0.5 shrink-0">
                                <Crown className="w-2.5 h-2.5" /> RADEN
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5">
                            {isMutual ? (
                              <span className="clay-badge-secondary text-[9px] font-bold text-black px-1.5 py-0.5 inline-block">
                                TEMAN
                              </span>
                            ) : isFollowsMe ? (
                              <span className="clay-badge-primary text-[9px] font-bold text-black px-1.5 py-0.5 inline-block">
                                MENGIKUTI KAMU
                              </span>
                            ) : (
                              <span className="clay-badge-neutral text-[9px] font-bold text-black px-1.5 py-0.5 inline-block">
                                DIIKUTI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
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
                              title: isTargetAdmin ? 'KREATOR & SUPER ADMIN' : 'Petualang',
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
                          className="clay-btn-neutral p-1.5 text-black"
                          title={`Lihat profil ${pName}`}
                        >
                          <User className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        {onWhisper && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              onWhisper(pName);
                            }}
                            className="clay-btn-secondary p-1.5 text-black"
                            title={`Kirim pesan chat ke ${pName}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}

                        {profileCategory === 'followers' && !isIFollow ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onFollowToggle) onFollowToggle(pName);
                            }}
                            className="clay-btn-primary px-2 py-1 text-black text-[10px] font-bold uppercase flex items-center gap-1"
                            title="Ikuti balik untuk menjadi Teman!"
                          >
                            <UserPlus className="w-3 h-3 stroke-[2.5]" />
                            <span>IKUTI</span>
                          </button>
                        ) : profileCategory === 'following' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onFollowToggle) onFollowToggle(pName);
                            }}
                            className="clay-btn-neutral px-2 py-1 text-black text-[10px] font-bold uppercase"
                            title="Berhenti mengikuti pemain ini"
                          >
                            BATAL
                          </button>
                        ) : profileCategory === 'friends' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onRemoveFriend) onRemoveFriend(pName);
                              else if (onFollowToggle) onFollowToggle(pName);
                            }}
                            className="clay-btn-neutral px-2 py-1 text-black text-[10px] font-bold uppercase"
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
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Header Modal Kartu Pemain Lain */}
            <div className="clay-header-secondary landscape-compact-header px-4 py-3 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                  <Shield className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-xs sm:text-sm font-bold uppercase text-black truncate">
                      KARTU PETUALANG
                    </h2>
                    <span className="clay-badge-primary px-1.5 py-0.5 text-[9px] font-bold text-black">
                      ONLINE
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-black clay-badge-neutral px-2 py-1 truncate max-w-[140px]">
                  <MapPin className="w-3 h-3 stroke-[2.5] shrink-0" />
                  <span className="truncate">{location || 'Dunia Terbuka'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black"
                  title="Tutup Kartu Pemain"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY PETUALANG LAIN */}
            <div className="landscape-compact-body flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-2.5 min-h-0 bg-[#FFF8EA]">
              {/* HERO CARD */}
              <div className="clay-card p-3 flex items-center gap-3">
                <AvatarPreview avatar={fallbackAvatar} size={60} />

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-black uppercase truncate">
                      {name}
                    </span>
                    {isSuperAdmin ? (
                      <span className="clay-badge-cocoa text-[10px] text-white px-2 py-0.5 font-bold flex items-center gap-1 shrink-0">
                        <Crown className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <span className="clay-badge-secondary text-[10px] text-black px-2 py-0.5 font-bold flex items-center gap-1 shrink-0">
                        <Sparkles className="w-2.5 h-2.5" /> WARGA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-black truncate">
                    <span>
                      ID: #{String(playerId ?? name ?? 'PLAYER').substring(0, 8).toUpperCase()}
                    </span>
                    <span>•</span>
                    <span className="truncate">{effectiveTitle}</span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="clay-badge-primary text-xs font-bold text-black px-2 py-0.5">
                      LV. {effectiveLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATUS RELASI */}
              <div className="clay-card px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-black">Status Relasi:</span>
                {isFriend || (isFollower && isFollowing) ? (
                  <span className="clay-badge-secondary font-bold text-black flex items-center gap-1 text-[10px] px-2 py-0.5">
                    <Users className="w-3 h-3 stroke-[2.5]" />
                    <span>SALING MENGIKUTI (TEMAN)</span>
                  </span>
                ) : isFollower ? (
                  <span className="clay-badge-primary font-bold text-black flex items-center gap-1 text-[10px] px-2 py-0.5">
                    <UserPlus className="w-3 h-3 stroke-[2.5]" />
                    <span>MENGIKUTI KAMU</span>
                  </span>
                ) : isFollowing ? (
                  <span className="clay-badge-neutral font-bold text-black flex items-center gap-1 text-[10px] px-2 py-0.5">
                    <UserCheck className="w-3 h-3 stroke-[2.5]" />
                    <span>SEDANG DIIKUTI</span>
                  </span>
                ) : (
                  <span className="text-black text-[11px] font-bold">Belum Mengikuti</span>
                )}
              </div>

              {/* STATISTIK PUBLIK */}
              <div className="grid grid-cols-3 gap-2">
                <div className="clay-card p-2 text-center flex flex-col justify-between relative">
                  <div className="text-[9px] text-black uppercase font-bold flex items-center justify-center gap-1">
                    <Heart className={`w-3 h-3 ${hasLiked ? 'fill-black' : ''}`} />
                    <span>SUKA</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-black my-1 truncate">
                    {isSuperAdmin ? '99999999999' : (currentLikes || 0).toLocaleString('id-ID')}
                  </div>
                  <button
                    type="button"
                    onClick={handleGiveLike}
                    disabled={hasLiked || isLiking}
                    className={`w-full py-1 text-[9px] font-bold uppercase text-black ${
                      hasLiked ? 'clay-btn-secondary' : 'clay-btn-primary'
                    }`}
                  >
                    {hasLiked ? 'DISUKAI' : isLiking ? '...' : '+ SUKA'}
                  </button>
                  {likeFeedback && (
                    <div className="mt-1 text-[9px] font-bold clay-badge-primary px-1 py-0.5 truncate">
                      {likeFeedback}
                    </div>
                  )}
                </div>

                <div className="clay-card p-2 text-center flex flex-col justify-center">
                  <div className="text-[9px] text-black uppercase font-bold flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 stroke-[2.5]" />
                    <span>TEMAN</span>
                  </div>
                  <div className="text-sm font-bold text-black mt-1">{displayFriendsCount}</div>
                  <div className="text-[8px] font-bold text-black">Mutual</div>
                </div>

                <div className="clay-card p-2 text-center flex flex-col justify-center">
                  <div className="text-[9px] text-black uppercase font-bold flex items-center justify-center gap-1">
                    <UserPlus className="w-3 h-3 stroke-[2.5]" />
                    <span>PENGIKUT</span>
                  </div>
                  <div className="text-sm font-bold text-black mt-1">{displayFollowersCount}</div>
                  <div className="text-[8px] font-bold text-black">Followers</div>
                </div>
              </div>

              {/* GENDER & BERGABUNG */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="clay-card p-2.5 flex items-center gap-2 min-w-0">
                  <User className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] text-black uppercase font-bold">GENDER</div>
                    <div className="text-xs font-bold text-black truncate">{genderLabel}</div>
                  </div>
                </div>

                <div className="clay-card p-2.5 flex items-center gap-2 min-w-0">
                  <Calendar className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] text-black uppercase font-bold">BERGABUNG</div>
                    <div className="text-xs font-bold text-black truncate">{resolvedJoinedAt}</div>
                  </div>
                </div>
              </div>

              {/* BIO */}
              <div className="clay-card p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-black uppercase">
                  <Quote className="w-3 h-3 stroke-[2.5]" />
                  <span>STATUS PETUALANG</span>
                </div>
                <p className="text-xs text-black leading-snug">
                  "{description || 'Petualang penjelajah tanah agung RadenWorld.'}"
                </p>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-3 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center gap-2 shrink-0">
              {isFriend ? (
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <div className="clay-badge-secondary flex-1 py-2 px-2.5 text-xs font-bold uppercase text-black flex items-center justify-center gap-1.5 truncate">
                    <Users className="w-4 h-4 stroke-[2.5] shrink-0" />
                    <span className="truncate">TEMAN</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (onFollowToggle) onFollowToggle(name, playerId);
                    }}
                    className="clay-btn-neutral py-2 px-2.5 text-xs font-bold uppercase text-black flex items-center justify-center gap-1 shrink-0"
                    title="Berhenti berteman"
                  >
                    <UserX className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden sm:inline">HAPUS</span>
                  </button>
                </div>
              ) : isFollowing ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    if (onFollowToggle) onFollowToggle(name, playerId);
                  }}
                  className="clay-btn-secondary flex-1 py-2 px-3 text-xs font-bold uppercase text-black flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>MENGIKUTI (BATAL)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    if (onFollowToggle) onFollowToggle(name, playerId);
                  }}
                  className="clay-btn-primary flex-1 py-2 px-3 text-xs font-bold uppercase text-black flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isFollower ? '+ IKUTI BALIK' : '+ IKUTI'}</span>
                </button>
              )}

              {onWhisper && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onWhisper(name);
                  }}
                  className="clay-btn-secondary py-2 px-3 text-black text-xs font-bold uppercase flex items-center justify-center gap-1 shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">CHAT</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="clay-btn-neutral py-2 px-3 text-black text-xs font-bold uppercase shrink-0"
                title="Tutup Profil"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* TAMPILAN 2A: PROFIL KARAKTER SAYA (PERSONAL ACCOUNT DASHBOARD)   */
          /* ================================================================ */
          <div className="flex flex-1 min-h-0 overflow-hidden text-black">
            {/* SIDEBAR SEBELAH KIRI */}
            <aside className="clay-sidebar">
              <div className="clay-sidebar-header">
                <div className="clay-sidebar-brand-icon">
                  <User className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="clay-sidebar-brand-text">
                  <span className="clay-sidebar-title">PROFIL SAYA</span>
                  <span className="clay-sidebar-subtitle">RADEN CITIZEN</span>
                </div>
              </div>

              <div className="clay-sidebar-nav">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setProfileCategory('overview');
                  }}
                  className={`clay-sidebar-btn ${
                    profileCategory === 'overview'
                      ? 'clay-sidebar-btn-active'
                      : 'clay-sidebar-btn-inactive'
                  }`}
                >
                  <User className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="truncate">Ikhtisar Diri</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setProfileCategory('friends');
                  }}
                  className={`clay-sidebar-btn ${
                    profileCategory === 'friends'
                      ? 'clay-sidebar-btn-active'
                      : 'clay-sidebar-btn-inactive'
                  }`}
                >
                  <Users className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="truncate">Teman ({displayFriendsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setProfileCategory('following');
                  }}
                  className={`clay-sidebar-btn ${
                    profileCategory === 'following'
                      ? 'clay-sidebar-btn-active'
                      : 'clay-sidebar-btn-inactive'
                  }`}
                >
                  <UserCheck className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="truncate">Mengikuti ({displayFollowingCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setProfileCategory('followers');
                  }}
                  className={`clay-sidebar-btn ${
                    profileCategory === 'followers'
                      ? 'clay-sidebar-btn-active'
                      : 'clay-sidebar-btn-inactive'
                  }`}
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="truncate">Pengikut ({displayFollowersCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setProfileCategory('account');
                  }}
                  className={`clay-sidebar-btn ${
                    profileCategory === 'account'
                      ? 'clay-sidebar-btn-active'
                      : 'clay-sidebar-btn-inactive'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="truncate">Akun & Aman</span>
                </button>
              </div>

              <div className="clay-sidebar-footer">
                <div className="clay-badge-secondary flex items-center gap-1.5 px-2 py-1.5 text-black font-bold text-[10px] w-full justify-center">
                  <Coins className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span className="truncate">
                    {isSuperAdmin || effectiveGold >= 99999999999 ? '99999999999' : effectiveGold.toLocaleString('id-ID')} G
                  </span>
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
                      {profileCategory === 'friends'
                        ? 'Daftar Teman (Mutual)'
                        : profileCategory === 'following'
                        ? 'Daftar Pemain Diikuti'
                        : profileCategory === 'followers'
                        ? 'Daftar Pengikut Saya'
                        : profileCategory === 'overview'
                        ? 'Ikhtisar Karakter Saya'
                        : 'Pusat Keamanan & Akun'}
                    </h2>
                    {isSuperAdmin && (
                      <span className="clay-badge-cocoa text-[9px] font-bold px-1.5 py-0.5 text-white">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onOpenGuide();
                      }}
                      className="clay-btn-secondary flex items-center gap-1 px-2.5 py-1 text-black text-[11px] font-bold"
                      title="Buka Petunjuk Kontrol Game"
                    >
                      <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="hidden sm:inline">PETUNJUK</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onClose();
                    }}
                    className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black"
                    title="Tutup Profil"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </header>

            {/* SCROLLABLE BODY PROFIL SAYA */}
            <div className="landscape-compact-body flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-2.5 min-h-0 bg-[#FFF8EA]">
              {(profileCategory === 'friends' || profileCategory === 'following' || profileCategory === 'followers') ? (
                <div className="flex flex-col gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" />
                    <input
                      type="text"
                      value={socialSearch}
                      onChange={(e) => setSocialSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      placeholder="Cari nama pemain..."
                      className="clay-input w-full pl-8 pr-3 py-1.5 text-xs text-black"
                    />
                  </div>

                  <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {getCurrentList().length === 0 ? (
                      <div className="clay-card flex flex-col items-center justify-center text-center py-8 px-4 text-black gap-1.5">
                        <Users className="w-7 h-7 stroke-[2.5]" />
                        <div className="text-xs font-bold">Daftar pemain masih kosong</div>
                      </div>
                    ) : (
                      getCurrentList().map((pName) => (
                        <div key={pName} className="clay-card p-2.5 flex items-center justify-between gap-2 text-black">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black font-bold text-xs shrink-0">
                              {pName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-xs truncate">{pName}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : profileCategory === 'overview' ? (
                <>
                  {/* HERO SECTION */}
                  <div className="clay-card p-3 flex items-center gap-3">
                    <AvatarPreview avatar={fallbackAvatar} size={60} />

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm sm:text-base font-bold text-black uppercase truncate">
                            {currentDisplayName || name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setNewNameInput(currentDisplayName || name);
                              setNameError('');
                              setIsEditingName(true);
                            }}
                            className="clay-badge-secondary p-1 text-black cursor-pointer shrink-0"
                            title="Ganti Nama Karakter (Nickname)"
                          >
                            <Edit3 className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                        <span className="clay-badge-primary text-[10px] font-bold text-black px-2 py-0.5 shrink-0">
                          LV. {effectiveLevel}
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-black uppercase mt-0.5 truncate">
                        {effectiveTitle}
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-black">
                          <span>EXP</span>
                          <span>
                            {isSuperAdmin ? 'MAX' : `${exp} / ${maxExp} (${expPercent}%)`}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#FFF8EA] rounded-full overflow-hidden border-2 border-[#5C3A21] p-0.5">
                          <div
                            className="h-full bg-[#FFAE6D] rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(4, expPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATISTIK GRID: UMUR, GENDER, KOIN */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="clay-card p-2 flex flex-col sm:flex-row items-center gap-1.5 text-center sm:text-left">
                      <Calendar className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[9px] text-black uppercase font-bold">UMUR</div>
                        <div className="text-xs font-bold text-black truncate">
                          {effectiveAge} Thn
                        </div>
                      </div>
                    </div>

                    <div className="clay-card p-2 flex flex-col sm:flex-row items-center gap-1.5 text-center sm:text-left">
                      <User className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[9px] text-black uppercase font-bold">GENDER</div>
                        <div className="text-xs font-bold text-black truncate">{genderLabel}</div>
                      </div>
                    </div>

                    <div className="clay-card p-2 flex flex-col sm:flex-row items-center gap-1.5 text-center sm:text-left">
                      <Coins className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[9px] text-black uppercase font-bold">KOIN</div>
                        <div className="text-xs font-bold text-black truncate">
                          {isSuperAdmin || effectiveGold >= 99999999999
                            ? '99999999999'
                            : effectiveGold.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATISTIK SOSIAL INTERAKTIF */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setProfileCategory('friends');
                      }}
                      className="clay-btn-secondary p-2 text-center text-black"
                      title="Klik untuk membuka daftar Teman"
                    >
                      <div className="text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                        <Users className="w-3 h-3 stroke-[2.5]" />
                        <span>TEMAN</span>
                      </div>
                      <div className="text-sm font-bold mt-0.5">{displayFriendsCount}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setProfileCategory('following');
                      }}
                      className="clay-btn-neutral p-2 text-center text-black"
                      title="Klik untuk membuka daftar pemain yang diikuti"
                    >
                      <div className="text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                        <UserCheck className="w-3 h-3 stroke-[2.5]" />
                        <span>IKUTI</span>
                      </div>
                      <div className="text-sm font-bold mt-0.5">{displayFollowingCount}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setProfileCategory('followers');
                      }}
                      className="clay-btn-neutral p-2 text-center text-black"
                      title="Klik untuk membuka daftar pengikut"
                    >
                      <div className="text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                        <UserPlus className="w-3 h-3 stroke-[2.5]" />
                        <span>PENGIKUT</span>
                      </div>
                      <div className="text-sm font-bold mt-0.5">{displayFollowersCount}</div>
                    </button>
                  </div>

                  {/* BIO SAYA */}
                  <div className="clay-card p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-black">
                      <div className="flex items-center gap-1.5 uppercase">
                        <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>STATUS / BIO SAYA</span>
                      </div>
                      {!isEditingBio ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingBio(true)}
                          className="clay-badge-primary px-2 py-0.5 text-[10px] font-bold text-black flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 stroke-[2.5]" />
                          <span>EDIT</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSaveBio}
                          className="clay-badge-secondary px-2 py-0.5 text-[10px] font-bold text-black flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>SIMPAN</span>
                        </button>
                      )}
                    </div>

                    {isEditingBio ? (
                      <textarea
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        maxLength={120}
                        rows={2}
                        className="clay-input w-full p-2 text-xs text-black resize-none"
                        placeholder="Tulis status karakter..."
                        autoFocus
                      />
                    ) : (
                      <p className="text-xs text-black line-clamp-2 leading-snug">
                        "{bioText || 'Belum ada status karakter.'}"
                      </p>
                    )}
                  </div>

                  {/* Total Like & Bergabung */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="clay-card px-3 py-2 flex items-center justify-between text-xs text-black">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                        <Heart className="w-3.5 h-3.5 fill-black" />
                        <span>DISUKAI</span>
                      </div>
                      <span className="font-bold">
                        {isSuperAdmin
                          ? '99999999999'
                          : (effectiveLikes || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="clay-card px-3 py-2 flex items-center justify-between gap-1 text-xs text-black">
                      <div className="flex items-center gap-1 font-bold uppercase text-[10px] shrink-0">
                        <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>GABUNG</span>
                      </div>
                      <span className="font-bold truncate text-right">{resolvedJoinedAt}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* KATEGORI: KEAMANAN & AKUN */
                <div className="space-y-2.5">
                  {accountFeedback && (
                    <div className="clay-card-secondary p-2.5 flex items-center justify-between gap-2 text-xs font-bold text-black">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
                        <span className="leading-tight">{accountFeedback}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAccountFeedback('')}
                        className="clay-badge-neutral px-1.5 py-0.5 text-xs font-bold text-black cursor-pointer shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* KARTU 1: RADENSHIELD */}
                  <div className="clay-card-secondary p-3 flex flex-col gap-2 text-black">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-xs font-bold uppercase">RadenShield™ Engine</span>
                      </div>
                      <span className="clay-badge-primary text-[9px] font-bold px-2 py-0.5 text-black flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> PROTECTED
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug">
                      Perlindungan multi-layer aktif menjaga akun, saldo koin & berlian, serta
                      sinkronisasi server.
                    </p>
                  </div>

                  {/* KARTU 2: EMAIL AKUN UTAMA */}
                  <div className="clay-card p-3 flex flex-col gap-2 text-black">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-xs font-bold uppercase">Email Akun Utama</span>
                      </div>
                      {isEmailVerified ? (
                        <span className="clay-badge-secondary text-[9px] font-bold px-2 py-0.5 text-black flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> TERVERIFIKASI
                        </span>
                      ) : (
                        <span className="clay-badge-primary text-[9px] font-bold px-2 py-0.5 text-black flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 stroke-[2.5]" /> BELUM
                        </span>
                      )}
                    </div>

                    <div className="clay-badge-neutral p-2 text-xs font-bold flex items-center justify-between">
                      <span className="truncate">{accountEmail || 'Email belum diatur'}</span>
                    </div>

                    {!isEmailVerified && (
                      <button
                        type="button"
                        disabled={verifyingEmail || !accountEmail}
                        onClick={handleVerifyEmail}
                        className="clay-btn-primary w-full py-2 px-3 text-black text-xs font-bold uppercase flex items-center justify-center gap-1.5"
                      >
                        {verifyingEmail ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                            <span>MEMVERIFIKASI...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>VERIFIKASI EMAIL SEKARANG</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* KARTU 3: TAUTAN GOOGLE */}
                  <div className="clay-card p-3 flex flex-col gap-2 text-black">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
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
                        <span className="text-xs font-bold uppercase">Tautan Google</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 ${
                          isGoogleLinked ? 'clay-badge-secondary' : 'clay-badge-neutral'
                        }`}
                      >
                        {isGoogleLinked ? 'TERTAUT' : 'BELUM'}
                      </span>
                    </div>

                    {isGoogleLinked ? (
                      <div className="clay-badge-neutral p-2 flex items-center justify-between text-xs font-bold">
                        <span className="truncate">
                          {linkedGoogleEmail || accountEmail || 'Akun Google Tertaut'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnlink('google')}
                          className="clay-badge-primary px-2 py-0.5 text-[10px] font-bold text-black ml-2 cursor-pointer shrink-0"
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
                        className="clay-btn-neutral w-full py-2 px-3 text-black text-xs font-bold uppercase flex items-center justify-center gap-2"
                      >
                        <Link className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Tautkan Akun Google</span>
                      </button>
                    )}
                  </div>

                  {/* KARTU 4: TAUTAN FACEBOOK */}
                  <div className="clay-card p-3 flex flex-col gap-2 text-black">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="text-xs font-bold uppercase">Tautan Facebook</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 ${
                          isFacebookLinked ? 'clay-badge-secondary' : 'clay-badge-neutral'
                        }`}
                      >
                        {isFacebookLinked ? 'TERTAUT' : 'BELUM'}
                      </span>
                    </div>

                    {isFacebookLinked ? (
                      <div className="clay-badge-neutral p-2 flex items-center justify-between text-xs font-bold">
                        <span className="truncate">
                          {linkedFacebookEmail || accountEmail || 'Akun Facebook Tertaut'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnlink('facebook')}
                          className="clay-badge-primary px-2 py-0.5 text-[10px] font-bold text-black ml-2 cursor-pointer shrink-0"
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
                        className="clay-btn-neutral w-full py-2 px-3 text-black text-xs font-bold uppercase flex items-center justify-center gap-2"
                      >
                        <Link className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Tautkan Akun Facebook</span>
                      </button>
                    )}
                  </div>

                  {/* KARTU 5: WALLET VAULT */}
                  <div className="clay-card p-3 flex flex-col gap-2 text-black">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-xs font-bold uppercase">Wallet Vault</span>
                      </div>
                      <span className="clay-badge-primary text-[9px] font-bold px-2 py-0.5 text-black">
                        MYSQL PROTECTED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="clay-badge-neutral p-2 flex items-center gap-2">
                        <Coins className="w-4 h-4 stroke-[2.5] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold uppercase">Koin Emas</div>
                          <div className="font-bold truncate">
                            {isSuperAdmin ? '99999999999' : gold.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="clay-badge-secondary p-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 stroke-[2.5] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold uppercase">Keamanan Dompet</div>
                          <div className="font-bold truncate text-[11px]">
                            100% Koin Resmi
                          </div>
                        </div>
                      </div>
                    </div>

                    {onRefreshWallet && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onRefreshWallet();
                          setAccountFeedback('Saldo berhasil disinkronkan dari server.');
                        }}
                        className="clay-btn-secondary w-full py-2 px-3 text-black text-xs font-bold uppercase flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Sinkronkan Saldo</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER ACTIONS PROFIL SAYA */}
            <div className="p-3 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (onLogout) onLogout();
                }}
                className="clay-btn-neutral flex-1 py-2 px-3 text-black text-xs font-bold uppercase flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>LOGOUT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="clay-btn-primary flex-1 py-2 px-3 text-black text-xs font-bold uppercase"
              >
                TUTUP
              </button>
            </div>
          </main>
          </div>
        )}
      </div>

      {/* MODAL FORM GANTI NAMA KARAKTER */}
      {isEditingName && (
        <div
          className="ui-modal-backdrop z-[70]"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="clay-panel relative w-full max-w-sm overflow-hidden text-black">
            <div className="clay-header px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
                  <Edit3 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-bold text-black uppercase">GANTI NAMA KARAKTER</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsEditingName(false);
                  setNewNameInput(currentDisplayName);
                }}
                className="clay-btn-neutral w-8 h-8 flex items-center justify-center text-black"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="p-4 space-y-3 bg-[#FFF8EA]">
              {nameError && (
                <div className="clay-card-primary p-2.5 flex items-center gap-2 text-xs font-bold text-black">
                  <AlertCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1.5">
                  Nama Karakter Baru:
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
                    className="clay-input w-full pl-3 pr-12 py-2 text-xs font-bold text-black"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-black">
                    {newNameInput.trim().length}/20
                  </span>
                </div>
                <p className="text-[10px] text-black mt-1">
                  Minimal 3 karakter, maksimal 20 karakter.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#5C3A21]/30">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsEditingName(false);
                    setNewNameInput(currentDisplayName);
                  }}
                  disabled={isSavingName}
                  className="clay-btn-neutral px-3.5 py-2 text-black text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isSavingName ||
                    newNameInput.trim().length < 3 ||
                    newNameInput.trim() === currentDisplayName
                  }
                  className="clay-btn-primary px-4 py-2 text-black text-xs font-bold flex items-center gap-1.5"
                >
                  {isSavingName ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
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

      {/* SOCIAL ACCOUNT CHOOSER MODAL */}
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
