/**
 * ============================================================================
 * FILE: resources/js/game/ui/CreditsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Layar Penghargaan & Kredit Resmi Permainan (Authentic Game Credits Screen).
 * Dibuat oleh Mahasiswa Institut Teknologi dan Bisnis Ahmad Dahlan Lamongan.
 * Dilengkapi mode gulir sinematik otomatis (Cinematic Auto-Scroll Roll) layaknya
 * credit title film & video game profesional dengan kontrol Play / Pause / Reset.
 * Menggunakan icon profil / orang untuk seluruh pengembang dalam daftar kredit.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { SoundManager } from '../core/SoundManager';
import {
  X,
  Award,
  Code,
  Layers,
  Cpu,
  Sparkles,
  Heart,
  GraduationCap,
  Users,
  User,
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Star,
} from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeveloperCredit {
  name: string;
  role: string;
  badgeType: string;
  bg: string;
  subtitle: string;
  desc: string;
}

const developersList: DeveloperCredit[] = [
  {
    name: 'R Moch Mahardika Digdaya Cakra Diponegoro',
    role: 'LEAD GAME DIRECTOR',
    badgeType: 'clay-badge-primary',
    bg: 'bg-[#FFAE6D]',
    subtitle: 'Arsitektur Game, Sistem Jaringan Realtime & Core Engine',
    desc: 'Merancang arsitektur sistem penuh, sinkronisasi WebSocket Socket.io, integrasi database Laravel & engine Phaser 3, sistem kamera cerdas, serta audio spasial interaktif.',
  },
  {
    name: 'Ananda Putri Salsabila',
    role: 'CREATIVE & UI/UX DESIGN',
    badgeType: 'clay-badge-secondary',
    bg: 'bg-[#A8E6CF]',
    subtitle: 'Desain Lingkungan Dunia, Antarmuka Cozycore & Aset Visual',
    desc: 'Menyusun konsep visual antarmuka Clay-Pixel, tata letak peta terbuka, estetika interior sekolah & perpustakaan terpadu, serta perancangan pengalaman pengguna yang ramah di segala perangkat.',
  },
  {
    name: 'Nanda Eka Susanto',
    role: 'GAMEPLAY & QA ENGINEER',
    badgeType: 'clay-badge-primary',
    bg: 'bg-[#FFAE6D]',
    subtitle: 'Logika Mekanika Permainan, Optimasi Kinerja & Pengujian Sistem',
    desc: 'Mengembangkan mekanika interaksi karakter, sistem inventori tas, responsivitas kontrol sentuh mobile & keyboard PC, serta pengujian stabilitas game pada berbagai kondisi perangkat.',
  },
  {
    name: 'Adib Syauqilillah',
    role: 'GAME DESIGN & NETWORK',
    badgeType: 'clay-badge-secondary',
    bg: 'bg-[#A8E6CF]',
    subtitle: 'Perancangan Desain Game & Keseimbangan Jaringan Multiplayer',
    desc: 'Merancang keseimbangan sistem permainan (game balancing), integrasi protokol transmisi data real-time, serta koordinasi interaksi sosial antar-pemain di dunia terbuka.',
  },
  {
    name: 'Putri Intania Meylisa',
    role: 'NARRATIVE & ENVIRONMENT',
    badgeType: 'clay-badge-primary',
    bg: 'bg-[#FFAE6D]',
    subtitle: 'Desain Lingkungan Tematik, Narasi Dialog & Suasana Dunia',
    desc: 'Menyusun naskah dialog interaktif edukasi, tata letak interior tematik (perpustakaan, kafe, sekolah), dan pemilihan palet warna yang menghadirkan pengalaman bermain yang menenangkan.',
  },
  {
    name: 'Wahyu Dwi Kurniawan',
    role: 'BACKEND & INFRASTRUCTURE',
    badgeType: 'clay-badge-secondary',
    bg: 'bg-[#A8E6CF]',
    subtitle: 'Arsitektur Basis Data, API Keamanan & Keandalan Server',
    desc: 'Mengembangkan endpoint RESTful API Laravel, skema database relasional akun & inventori, serta penerapan protokol keamanan RadenShield untuk stabilitas server jangka panjang.',
  },
  {
    name: 'Rossy Pramudya',
    role: 'AUDIO & ASSET SPECIALIST',
    badgeType: 'clay-badge-primary',
    bg: 'bg-[#FFAE6D]',
    subtitle: 'Desain Suara Spasial, Efek Audio Retro & Kurasi Aset Game',
    desc: 'Mengintegrasikan sistem Web Audio API, efek suara retro (SFX langkah kaki, debu, lonceng sekolah), serta kurasi aset sprite 2D agar serasi dengan identitas visual permainan.',
  },
  {
    name: 'Fania Adilatus Shofira',
    role: 'QA & USABILITY RESEARCH',
    badgeType: 'clay-badge-secondary',
    bg: 'bg-[#A8E6CF]',
    subtitle: 'Riset Kegunaan Pengguna, Pengujian Kualitas & Analisis Interaksi',
    desc: 'Menjalankan skenario pengujian fungsional pada berbagai peramban web dan resolusi gawai, memastikan alur orientasi pemain baru berjalan intuitif, edukatif, dan bebas kendala.',
  },
];

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  const sound = SoundManager.getInstance();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  // Otomatis reset scroll saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      setIsAutoScrolling(false);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isOpen]);

  // Efek Gulir Sinematik Otomatis (Cinematic Credit Roll)
  useEffect(() => {
    if (!isAutoScrolling) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const scrollStep = () => {
      const el = scrollContainerRef.current;
      if (el) {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
          setIsAutoScrolling(false);
          return;
        }
        el.scrollTop += 0.85; // Kecepatan membaca santai sinematik
      }
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animationFrameRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isAutoScrolling]);

  // Jeda auto scroll saat interaksi sentuhan atau mouse wheel manual
  const handleUserManualScroll = () => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
    }
  };

  const handleToggleAutoScroll = () => {
    sound.playClick();
    setIsAutoScrolling((prev) => !prev);
  };

  const handleResetScroll = () => {
    sound.playClick();
    setIsAutoScrolling(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop animate-fade-in">
      <div className="clay-panel landscape-compact-modal w-full max-w-xl max-h-[92dvh] flex flex-col overflow-hidden text-black shadow-2xl">
        {/* HEADER MODAL */}
        <div className="clay-header landscape-compact-header px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0">
              <Award className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-black uppercase tracking-wide truncate">
                KREDIT RESMI PERMAINAN
              </h2>
              <p className="text-[9.5px] sm:text-xs text-black/80 truncate">
                Institut Teknologi dan Bisnis Ahmad Dahlan Lamongan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tombol Play/Pause Gulir Otomatis */}
            <button
              type="button"
              onClick={handleToggleAutoScroll}
              className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-lg border-2 border-[#5C3A21] flex items-center gap-1 transition-all ${
                isAutoScrolling ? 'clay-btn-secondary animate-pulse' : 'clay-btn-neutral'
              }`}
              title={isAutoScrolling ? 'Jeda Gulir Sinematik' : 'Putar Gulir Sinematik'}
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">JEDA</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">PUTAR ROLL</span>
                </>
              )}
            </button>

            {/* Tombol Rewind / Ke Atas */}
            <button
              type="button"
              onClick={handleResetScroll}
              className="clay-btn-neutral w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-black shrink-0"
              title="Kembali ke Atas"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-neutral w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-black shrink-0"
              title="Tutup Kredit"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* BODY KREDIT BERGAYA GAME BERKUALITAS TINGGI */}
        <div
          ref={scrollContainerRef}
          onWheel={handleUserManualScroll}
          onTouchStart={handleUserManualScroll}
          className="landscape-compact-body p-3.5 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs custom-scrollbar bg-[#FFF8EA]/50"
        >
          {/* TITLE CARD & HERO PRESENTATION */}
          <div className="clay-card-secondary p-4 sm:p-5 text-center space-y-2 relative overflow-hidden border-2 border-[#5C3A21]">
            <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#FFF8EA] text-black border-2 border-[#5C3A21] shadow-sm">
              <Sparkles className="w-6 h-6 stroke-[2.5] text-[#FFAE6D]" />
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-black/75">
                KARYA SIMULASI MULTIPLAYER 2D
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black tracking-wide leading-tight mt-0.5">
                RADENWORLD
              </h1>
              <div className="inline-block clay-badge-neutral px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-black mt-1">
                Karya Tugas Kuliah • Rekayasa Game Interaktif
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-black/85 leading-relaxed max-w-lg mx-auto pt-1 font-medium">
              Sebuah karya permainan simulasi dunia terbuka interaktif yang menggabungkan eksplorasi,
              interaksi sosial, edukasi terpadu, dan teknologi multi-agen modern.
            </p>
          </div>

          {/* DEDIKASI & TUJUAN PENGEMBANGAN GAME */}
          <div className="clay-card p-3.5 sm:p-4 space-y-2 border-2 border-[#5C3A21] bg-[#FFF8EA]">
            <div className="flex items-center gap-2 text-black">
              <div className="p-1.5 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
                <Heart className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                Misi & Tujuan Pembuatan Game
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-[#FFFDF7] border border-[#5C3A21]/30 text-[11px] sm:text-xs text-black leading-relaxed space-y-2">
              <p>
                Game <strong>RadenWorld</strong> ini dibuat oleh mahasiswa{' '}
                <strong>Institut Teknologi dan Bisnis Ahmad Dahlan Lamongan</strong> sebagai wujud nyata karya
                tugas perkuliahan inovatif.
              </p>
              <p className="font-medium text-[#5C3A21]">
                "Dibuat untuk mencerdaskan anak bangsa melalui simulasi edukatif, mempererat persahabatan,
                serta menjadi wadah positif untuk berkenalan dan berinteraksi dengan semua orang dari berbagai penjuru tanah air."
              </p>
            </div>
          </div>

          {/* TIM PENGEMBANG UTAMA (GAME DEVELOPERS) DENGAN ICON PROFIL / ORANG */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                <Users className="w-4 h-4 stroke-[2.5]" />
                <span>Tim Pengembang (Game Creators)</span>
              </div>
              <span className="clay-badge-secondary px-2 py-0.5 text-[9px] font-bold text-black">
                8 DEVELOPERS • ITB-ADL
              </span>
            </div>

            {/* DAFTAR 8 PENGEMBANG DENGAN ICON ORANG / PROFILE */}
            <div className="space-y-2.5">
              {developersList.map((dev, idx) => (
                <div key={idx} className="clay-card p-3.5 flex items-start gap-3 border-2 border-[#5C3A21]">
                  {/* ICON PROFILE / ORANG */}
                  <div
                    className={`w-10 h-10 rounded-xl ${dev.bg} border-2 border-[#5C3A21] flex items-center justify-center text-black shrink-0 shadow-sm`}
                    title={`Profil: ${dev.name}`}
                  >
                    <User className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-black">
                        {dev.name}
                      </h4>
                      <span className={`${dev.badgeType} px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-bold text-black`}>
                        {dev.role}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-[#5C3A21] mt-0.5">
                      {dev.subtitle}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-black/80 mt-1 leading-relaxed">
                      {dev.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AFILIASI KAMPUS & INSTITUSI AKADEMIK */}
          <div className="clay-card p-3.5 sm:p-4 space-y-2 border-2 border-[#5C3A21]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
                <GraduationCap className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-black">
                Afiliasi Akademik & Perguruan Tinggi
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-[#FFFDF7] border border-[#5C3A21]/30 space-y-1.5 text-black">
              <div className="font-bold text-xs sm:text-sm text-black flex items-center gap-1.5">
                <span>Institut Teknologi dan Bisnis Ahmad Dahlan Lamongan</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-black/80">
                <MapPin className="w-3.5 h-3.5 shrink-0 stroke-[2.5] text-[#FFAE6D]" />
                <span>Lamongan, Jawa Timur, Indonesia</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-black/75 pt-0.5">
                Proyek Tugas Kuliah Mata Kuliah Pengembangan Aplikasi & Game Interaktif Berbasis Web.
              </p>
            </div>
          </div>

          {/* TEKNOLOGI & ARSITEKTUR ENGINE (TECH STACK) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase px-1">
              <Layers className="w-4 h-4 stroke-[2.5]" />
              <span>Teknologi & Engine Permainan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="clay-card p-2.5 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
                  <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[11px] text-black">Phaser 3 & PixiJS 8</div>
                  <div className="text-[9.5px] text-black/75 leading-tight mt-0.5">
                    Engine 2D dunia terbuka, kamera dinamis, animasi gerak & WebGL antialiasing.
                  </div>
                </div>
              </div>

              <div className="clay-card p-2.5 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FFAE6D] border-2 border-[#5C3A21] text-black shrink-0">
                  <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[11px] text-black">Laravel 12 & PHP 8.2+</div>
                  <div className="text-[9.5px] text-black/75 leading-tight mt-0.5">
                    API backend aman dengan RadenShield, proteksi sesi, dan basis data akun pemain.
                  </div>
                </div>
              </div>

              <div className="clay-card p-2.5 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
                  <Code className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[11px] text-black">Node.js & Socket.io</div>
                  <div className="text-[9.5px] text-black/75 leading-tight mt-0.5">
                    Multiplayer realtime, sinkronisasi posisi 20 Hz, chat global & suara proximity.
                  </div>
                </div>
              </div>

              <div className="clay-card p-2.5 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#A8E6CF] border-2 border-[#5C3A21] text-black shrink-0">
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[11px] text-black">React 19 & Tailwind CSS</div>
                  <div className="text-[9.5px] text-black/75 leading-tight mt-0.5">
                    Antarmuka Cozycore Clay-Pixel responsif, modal interaktif, dan sound manager.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UCAPAN TERIMA KASIH (SPECIAL THANKS) */}
          <div className="clay-card p-3.5 text-center space-y-1.5 border-2 border-[#5C3A21]">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-black uppercase">
              <Star className="w-3.5 h-3.5 fill-[#FFAE6D] text-black" />
              <span>Ucapan Terima Kasih Khusus (Special Thanks)</span>
              <Star className="w-3.5 h-3.5 fill-[#FFAE6D] text-black" />
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-black/85 leading-relaxed">
              Dosen Pembimbing Tugas Kuliah • Sivitas Akademika ITB Ahmad Dahlan Lamongan •
              Keluarga & Teman-Teman Seperjuangan • Komunitas Open-Source • Dan Kamu yang Telah Menjadi Bagian dari Dunia RadenWorld!
            </p>
          </div>

          {/* END CARD / FINALE BANNER */}
          <div className="clay-card-secondary p-4 text-center space-y-1 border-2 border-[#5C3A21] bg-[#FFAE6D]/30">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">
              ★ TERIMA KASIH TELAH BERMAIN ★
            </div>
            <div className="text-[10px] text-black/80 font-medium">
              "Terus Belajar, Berbagi Kebaikan, dan Mencerdaskan Anak Bangsa!"
            </div>
            <div className="text-[9px] text-black/60 pt-1 font-bold">
              © 2026 RadenWorld. Hak Cipta Dilindungi Undang-Undang.
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t-2 border-[#5C3A21] bg-[#FFF8EA] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="clay-badge-neutral text-[9px] sm:text-[10px] font-bold px-2 py-0.5 text-black">
              ITB AHMAD DAHLAN LAMONGAN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAutoScroll}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border-2 border-[#5C3A21] flex items-center gap-1.5 ${
                isAutoScrolling ? 'clay-btn-secondary' : 'clay-btn-neutral'
              }`}
            >
              {isAutoScrolling ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAutoScrolling ? 'Jeda' : 'Putar Sinematik'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="clay-btn-primary px-4 sm:px-6 py-1.5 text-xs font-bold text-black uppercase"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
