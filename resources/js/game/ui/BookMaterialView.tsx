/**
 * ============================================================================
 * FILE: resources/js/game/ui/BookMaterialView.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen Pembaca Buku Pelajaran Bergambar (SD, SMP, SMA) yang:
 * 1. 100% Konsisten per Bab (tidak mencampur materi bab lain).
 * 2. Menampilkan Ilustrasi Visual Buku yang Jelas & Bisa Di-Klik / Di-Tap
 *    untuk Diperbesar (Full-Screen Zoomable Lightbox Modal).
 * 3. Menampilkan Papan Rumus & Kaidah Mata Pelajaran yang Unik & Terformat
 *    (Pangkat, Subskrip, Operator Matematika/Sains, dan Contoh Penyelesaian).
 * 4. Menampilkan Latihan Pemahaman Buku tanpa emoji/tanda bocoran pada
 *    jawaban yang benar serta mengacak posisi opsi A/B/C secara konsisten.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Check,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { ILibraryTopicItem } from '../data/library/SdLibraryData';
import { detectDiagramType, renderDiagramSvg } from './LibraryTopicVisualizer';

export interface BookMaterialViewProps {
  topic: ILibraryTopicItem;
  chapterNumber: number;
  totalChapters: number;
  isRead: boolean;
  expReward: number;
  onMarkAsRead: () => void;
  onPrevTopic?: () => void;
  onNextTopic?: () => void;
  hasPrevTopic?: boolean;
  hasNextTopic?: boolean;
  extraFooterAction?: React.ReactNode;
}

/**
 * Membersihkan emoji bocoran pada pilihan ganda kuis agar semua opsi
 * terlihat seragam, rapi, dan tidak membocorkan jawaban yang benar.
 */
function stripOptionEmoji(text: string): string {
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mengacak urutan opsi A, B, C secara deterministik berdasarkan ID topik
 * agar jawaban benar tersebar merata (tidak selalu A) dan bersih dari tanda bocoran.
 */
function getCleanShuffledQuiz(topic: ILibraryTopicItem): {
  question: string;
  options: { label: string; text: string; isCorrect: boolean }[];
  explanation: string;
} {
  const rawOptions = topic.quiz.options.map((opt, idx) => ({
    text: stripOptionEmoji(opt) || opt.trim(),
    isCorrect: idx === topic.quiz.answerIndex,
    origIdx: idx,
  }));

  // Hash sederhana dari topic.id untuk rotasi deterministik
  let hash = 0;
  for (let i = 0; i < topic.id.length; i++) {
    hash = (hash * 31 + topic.id.charCodeAt(i)) % 997;
  }

  const shift = hash % rawOptions.length;
  const rotated = [
    ...rawOptions.slice(shift),
    ...rawOptions.slice(0, shift),
  ];

  return {
    question: topic.quiz.question,
    options: rotated.map((item, idx) => ({
      label: String.fromCharCode(65 + idx),
      text: item.text,
      isCorrect: item.isCorrect,
    })),
    explanation: topic.quiz.explanation,
  };
}

/**
 * Memformat teks rumus matematika / sains / bahasa menjadi blok visual
 * buku pelajaran yang unik (mendukung pangkat, subskrip, pecahan, dan operator).
 */
function renderStyledFormulaTokens(formula: string): React.ReactNode {
  // Pisahkan jika ada beberapa rumus yang dipisahkan oleh '|'
  const parts = formula.split('|').map((p) => p.trim()).filter(Boolean);

  const formatSingleExpression = (expr: string, keyPrefix: string) => {
    // Pisahkan berdasarkan tanda panah atau sama dengan untuk memberi aksen visual
    const segments = expr.split(/(\s*(?:➔|->|⟺|<=>|=|\+|-|×|÷|<|>|≤|≥)\s*)/g);

    return (
      <div
        key={keyPrefix}
        className="flex flex-wrap items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#0F172A] border-2 border-[#F59E0B] text-[#F8FAFC] shadow-inner"
      >
        {segments.map((seg, idx) => {
          const trimmed = seg.trim();
          if (!trimmed) return null;

          // Operator utama diberi badge warna kontras
          if (
            ['=', '➔', '->', '⟺', '<=>', '+', '-', '×', '÷', '<', '>', '≤', '≥'].includes(
              trimmed
            )
          ) {
            return (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[#F59E0B] text-[#1E293B] font-black text-xs sm:text-sm mx-0.5"
              >
                {trimmed === '->' ? '➔' : trimmed}
              </span>
            );
          }

          // Format pangkat sederhana seperti ^a, ^2, x^2, a^x
          const formattedText = trimmed
            .replace(/\^([a-zA-Z0-9]+)/g, '⁽$1⁾')
            .replace(/([a-zA-Z0-9])2\b/g, '$1²')
            .replace(/([a-zA-Z0-9])3\b/g, '$1³');

          return (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-[#1E293B] border border-[#38BDF8]/50 text-[#FDE047] font-mono font-bold text-xs sm:text-sm tracking-wide"
            >
              {formattedText}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {parts.map((part, i) => formatSingleExpression(part, `f-${i}`))}
    </div>
  );
}

/**
 * Menghasilkan SVG Ilustrasi Buku yang 100% Konsisten dengan Bab Aktif.
 * Menggabungkan ilustrasi diagram visual dengan kartu skema bab tersebut
 * sehingga gambar selalu sesuai dengan pembahasan bab yang sedang dibuka.
 */
function renderConsistentBookIllustration(topic: ILibraryTopicItem): React.ReactNode {
  const diagramType = detectDiagramType({
    id: topic.id,
    name: topic.title,
    title: topic.title,
    badge: topic.badge,
    subtitle: topic.summary,
    category: topic.subjectCategory || topic.subjectName,
    points: topic.points,
  });

  // Jika tipe diagram adalah mindmap_general / classroom_chalkboard, buat diagram skema khusus bab ini
  const isGenericFallback =
    diagramType === 'mindmap_general' || diagramType === 'classroom_chalkboard';

  const truncate = (str: string, max: number) =>
    str.length > max ? str.slice(0, max - 1) + '…' : str;

  const p1 = truncate(stripOptionEmoji(topic.points[0] || topic.summary), 68);
  const p2 = truncate(stripOptionEmoji(topic.points[1] || topic.funFact), 68);
  const p3 = truncate(stripOptionEmoji(topic.points[2] || topic.quiz.explanation), 68);
  const formulaText = truncate(
    topic.keyFormulaOrConcept || `${topic.subjectName} • ${topic.badge}`,
    62
  );

  if (!isGenericFallback) {
    return (
      <div className="w-full h-full flex flex-col justify-between bg-[#0F172A] rounded-lg overflow-hidden border border-[#334155]">
        {/* Banner Atas Gambar: Judul Spesifik Bab agar 100% Konsisten */}
        <div className="px-3 py-1.5 bg-[#1E293B] border-b border-[#334155] flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-bold text-[#FDE047] truncate">
            📌 {topic.title}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0284C7] text-white text-[9px] font-bold shrink-0">
            {topic.gradeName}
          </span>
        </div>

        {/* Diagram Visual Utama */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center p-1">
          {renderDiagramSvg(diagramType, 0, () => {})}
        </div>

        {/* Pita Rumus / Konsep Inti Bab di Bawah Gambar */}
        <div className="px-3 py-1.5 bg-[#1E293B] border-t border-[#334155] text-center">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#38BDF8]">
            🔑 Konsep Bab: {formulaText}
          </span>
        </div>
      </div>
    );
  }

  // Diagram Skema Buku Pelajaran Khusus untuk Bab Ini (100% Spesifik Topik)
  return (
    <svg viewBox="0 0 680 380" className="w-full h-full select-none">
      <rect x="0" y="0" width="680" height="380" rx="14" fill="#0F172A" />
      <rect
        x="10"
        y="10"
        width="660"
        height="360"
        rx="12"
        fill="#1E293B"
        stroke="#F59E0B"
        strokeWidth="3"
      />

      {/* Header Papan Ilustrasi Bab */}
      <rect x="24" y="22" width="632" height="52" rx="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
      <text x="340" y="44" fill="#FDE047" fontSize="14" fontWeight="900" textAnchor="middle">
        {truncate(topic.title.toUpperCase(), 54)}
      </text>
      <text x="340" y="64" fill="#7DD3FC" fontSize="11" fontWeight="bold" textAnchor="middle">
        {topic.gradeName} • {topic.subjectName} ({topic.badge})
      </text>

      {/* 3 Kotak Alur Konsep Bab */}
      <g transform="translate(24, 88)">
        <rect x="0" y="0" width="632" height="58" rx="9" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
        <circle cx="28" cy="29" r="16" fill="#059669" />
        <text x="28" y="34" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle">1</text>
        <text x="56" y="24" fill="#6EE7B7" fontSize="11" fontWeight="bold">KONSEP DASAR UTAMA</text>
        <text x="56" y="43" fill="#ECFDF5" fontSize="11.5" fontWeight="bold">{p1}</text>
      </g>

      <g transform="translate(24, 156)">
        <rect x="0" y="0" width="632" height="58" rx="9" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="28" cy="29" r="16" fill="#2563EB" />
        <text x="28" y="34" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle">2</text>
        <text x="56" y="24" fill="#93C5FD" fontSize="11" fontWeight="bold">PRINSIP &amp; PENERAPAN MATERI</text>
        <text x="56" y="43" fill="#EFF6FF" fontSize="11.5" fontWeight="bold">{p2}</text>
      </g>

      <g transform="translate(24, 224)">
        <rect x="0" y="0" width="632" height="58" rx="9" fill="#581C87" stroke="#A855F7" strokeWidth="2" />
        <circle cx="28" cy="29" r="16" fill="#7C3AED" />
        <text x="28" y="34" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle">3</text>
        <text x="56" y="24" fill="#D8B4FE" fontSize="11" fontWeight="bold">KESIMPULAN &amp; CONTOH NYATA</text>
        <text x="56" y="43" fill="#FAF5FF" fontSize="11.5" fontWeight="bold">{p3}</text>
      </g>

      {/* Kotak Rumus / Kaidah Kunci di Bawah */}
      <g transform="translate(24, 294)">
        <rect x="0" y="0" width="632" height="58" rx="10" fill="#451A03" stroke="#F59E0B" strokeWidth="2.5" />
        <text x="316" y="22" fill="#FCD34D" fontSize="10.5" fontWeight="900" textAnchor="middle">
          💡 RUMUS / KAIDAH KUNCI BAB INI:
        </text>
        <text x="316" y="43" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle">
          {formulaText}
        </text>
      </g>
    </svg>
  );
}

export const BookMaterialView: React.FC<BookMaterialViewProps> = ({
  topic,
  chapterNumber,
  totalChapters,
  isRead,
  expReward,
  onMarkAsRead,
  onPrevTopic,
  onNextTopic,
  hasPrevTopic = false,
  hasNextTopic = false,
  extraFooterAction,
}) => {
  const sound = SoundManager.getInstance();

  // State Lightbox Zoom Gambar Ilustrasi
  const [isImageZoomOpen, setIsImageZoomOpen] = useState<boolean>(false);
  const [imageZoomScale, setImageZoomScale] = useState<number>(1.25);

  // State Latihan Pemahaman Buku
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean | null>(null);

  // Reset kuis & zoom saat bab berganti
  React.useEffect(() => {
    setSelectedQuizIdx(null);
    setIsQuizCorrect(null);
    setIsImageZoomOpen(false);
    setImageZoomScale(1.25);
  }, [topic.id]);

  const cleanQuiz = useMemo(() => getCleanShuffledQuiz(topic), [topic]);

  return (
    <>
      {/* ================================================================== */}
      {/* MODAL ZOOM GAMBAR ILUSTRASI PENUH (SAAT GAMBAR DI-KLIK / DI-TAP)   */}
      {/* ================================================================== */}
      {isImageZoomOpen && (
        <div
          className="fixed inset-0 z-[130] bg-black/85 flex flex-col justify-between p-3 sm:p-6 select-none"
          onClick={() => setIsImageZoomOpen(false)}
        >
          {/* Toolbar Atas Zoom Gambar */}
          <div
            className="w-full max-w-5xl mx-auto clay-panel px-3.5 py-2.5 flex items-center justify-between gap-2 flex-wrap shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-black truncate">
                🖼️ Ilustrasi Buku: {topic.title}
              </div>
              <div className="text-[10px] sm:text-xs text-black/75 font-bold">
                {topic.gradeName} • {topic.subjectName} — Gunakan tombol + / - untuk memperbesar gambar
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setImageZoomScale((s) => Math.max(0.8, Number((s - 0.25).toFixed(2))));
                }}
                className="px-2.5 py-1.5 clay-btn-neutral text-black text-xs font-bold flex items-center gap-1"
                title="Perkecil Gambar"
              >
                <ZoomOut className="w-4 h-4" />
                <span>-</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setImageZoomScale(1.0);
                }}
                className="px-2.5 py-1.5 clay-btn-secondary text-black text-xs font-bold flex items-center gap-1"
                title="Ukuran Normal 100%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{Math.round(imageZoomScale * 100)}%</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setImageZoomScale((s) => Math.min(2.5, Number((s + 0.25).toFixed(2))));
                }}
                className="px-2.5 py-1.5 clay-btn-primary text-black text-xs font-bold flex items-center gap-1"
                title="Perbesar Gambar"
              >
                <ZoomIn className="w-4 h-4" />
                <span>+</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsImageZoomOpen(false);
                }}
                className="px-3 py-1.5 clay-btn-cocoa text-white text-xs font-bold flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Tutup</span>
              </button>
            </div>
          </div>

          {/* Viewport Gambar yang Diperbesar */}
          <div
            className="flex-1 min-h-0 w-full max-w-6xl mx-auto my-3 overflow-auto custom-scrollbar flex items-center justify-center bg-[#0F172A] border-4 border-[#F59E0B] rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: `${Math.round(760 * imageZoomScale)}px`,
                height: `${Math.round(430 * imageZoomScale)}px`,
                minWidth: `${Math.round(620 * imageZoomScale)}px`,
              }}
              className="transition-all duration-150"
            >
              {renderConsistentBookIllustration(topic)}
            </div>
          </div>

          {/* Caption Bawah Gambar */}
          <div
            className="w-full max-w-5xl mx-auto clay-card px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-black shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            📘 {topic.summary}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* LAYOUT BUKU CETAK TERBUKA (HALAMAN KIRI & HALAMAN KANAN)           */}
      {/* ================================================================== */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row landscape:flex-row overflow-y-auto lg:overflow-hidden landscape:overflow-hidden custom-scrollbar">
        {/* HALAMAN KIRI BUKU: ILUSTRASI GAMBAR (BISA DI-ZOOM) + PAPAN RUMUS UNIK */}
        <div className="w-full lg:w-[46%] landscape:w-[45%] lg:h-full landscape:h-full lg:overflow-y-auto landscape:overflow-y-auto custom-scrollbar p-3 sm:p-5 landscape:max-md:p-3 border-b-2 lg:border-b-0 lg:border-r-2 landscape:border-b-0 landscape:border-r-2 border-[#5C3A21]/40 flex flex-col gap-3.5 shrink-0">
          {/* 1. Bingkai Gambar Ilustrasi Buku (Klik / Tap untuk Perbesar) */}
          <div className="clay-card p-3 border-2 border-[#5C3A21] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-black flex items-center gap-1.5">
                <span>🖼️</span>
                <span>Gambar {chapterNumber}.1 — Ilustrasi Bab</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsImageZoomOpen(true);
                }}
                className="px-2.5 py-1 clay-btn-primary text-black text-[10.5px] font-bold flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Perbesar Gambar</span>
              </button>
            </div>

            {/* Area Gambar yang Bisa Di-Klik / Di-Tap */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                sound.playClick();
                setIsImageZoomOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsImageZoomOpen(true);
                }
              }}
              className="group relative w-full aspect-[16/10] rounded-xl bg-[#0F172A] border-2 border-[#5C3A21] overflow-hidden cursor-zoom-in shadow-md"
              title="Klik atau Ketuk untuk Memperbesar Gambar Ilustrasi"
            >
              {renderConsistentBookIllustration(topic)}

              {/* Overlay Petunjuk Klik untuk Perbesar */}
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 border border-[#F59E0B] text-[#FDE047] text-[10px] font-bold flex items-center gap-1 shadow">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Ketuk untuk Perbesar</span>
              </div>
            </div>

            <p className="text-[11px] text-black/85 font-medium text-center">
              Ketuk gambar di atas untuk melihat detail ilustrasi <strong>{topic.title}</strong> ukuran penuh.
            </p>
          </div>

          {/* 2. Papan Rumus / Kaidah Mata Pelajaran yang Unik & Jelas */}
          <div className="p-3.5 rounded-xl bg-[#FFFBEB] border-2 border-[#5C3A21] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-[#5C3A21]/25 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-black uppercase tracking-wide">
                <span>📐</span>
                <span>Papan Rumus &amp; Kaidah Inti Pelajaran</span>
              </div>
              <span className="px-2 py-0.5 clay-badge-primary text-[10px] font-bold text-black">
                Wajib Ingat
              </span>
            </div>

            {renderStyledFormulaTokens(
              topic.keyFormulaOrConcept || `${topic.badge}: ${topic.title}`
            )}

            {/* Contoh Penerapan / Perhitungan Langsung dari Bab Ini */}
            <div className="p-2.5 rounded-lg bg-[#FFFDF9] border border-[#5C3A21]/40 text-xs text-black space-y-1">
              <div className="font-bold text-black flex items-center gap-1">
                <span>✍️</span>
                <span>Contoh Penerapan Langsung pada Materi Ini:</span>
              </div>
              <p className="text-black/90 leading-relaxed">
                <strong>Kasus:</strong> {topic.quiz.question}
              </p>
              <p className="text-[#065F46] font-bold leading-relaxed">
                <strong>Penyelesaian:</strong> {topic.quiz.explanation}
              </p>
            </div>
          </div>

          {/* 3. Kotak Tahukah Kamu / Fakta Nyata Bab Ini */}
          <div className="p-3.5 clay-card-secondary space-y-1.5 border-2 border-[#5C3A21]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
              <span>🌟</span>
              <span>Tahukah Kamu? (Wawasan Tambahan)</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-black font-medium">
              {topic.funFact}
            </p>
          </div>
        </div>

        {/* HALAMAN KANAN BUKU: PENJELASAN MATERI LENGKAP & LATIHAN PEMAHAMAN */}
        <div className="flex-1 min-h-0 lg:h-full landscape:h-full lg:overflow-y-auto landscape:overflow-y-auto custom-scrollbar p-3 sm:p-5 landscape:max-md:p-3 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Header Bab di Halaman Kanan */}
            <div className="border-b-2 border-[#5C3A21] pb-2.5 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-[11px] font-bold text-black/75 uppercase">
                  {topic.gradeName} • {topic.subjectName} • Bab {chapterNumber} dari {totalChapters}
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-black">
                  📖 {topic.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 clay-badge-secondary text-[10px] sm:text-xs font-bold text-black">
                {topic.badge}
              </span>
            </div>

            {/* Bagian 1: Pengertian Dasar yang Sangat Mudah Dipahami */}
            <div className="clay-card p-3.5 border-2 border-[#5C3A21] space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                <span>📘</span>
                <span>1. Pengertian Dasar (Bahasa Sederhana &amp; Mudah Dipahami)</span>
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-black font-medium">
                Pada bab <strong>{topic.title}</strong> ini, kita mempelajari bahwa:{' '}
                <strong>{topic.summary}</strong> Konsep ini sangat penting sebagai dasar
                dalam mata pelajaran <strong>{topic.subjectName}</strong> untuk tingkat{' '}
                <strong>{topic.gradeName}</strong>.
              </p>
            </div>

            {/* Bagian 2: Uraian Lengkap Materi Langkah demi Langkah (100% Konsisten Bab Ini) */}
            <div className="clay-card p-3.5 border-2 border-[#5C3A21] space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                <span>📌</span>
                <span>2. Penjelasan Inti Materi Langkah demi Langkah</span>
              </h4>
              <div className="space-y-2.5">
                {topic.points.map((pt, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#5C3A21]/40 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 clay-badge-cocoa text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {pIdx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase text-black/70">
                        Pokok Bahasan Ke-{pIdx + 1}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-black font-semibold">
                        {stripOptionEmoji(pt) || pt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian 3: Rangkuman Cara Mudah Mengingat */}
            <div className="p-3.5 clay-card-primary border-2 border-[#5C3A21] space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                <span>💡</span>
                <span>3. Cara Cepat Paham &amp; Mengingat Bab Ini</span>
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-black font-medium">
                Kunci utama memahami <strong>{topic.title}</strong> adalah mengingat kaidah{' '}
                <code className="px-1.5 py-0.5 bg-[#FFF8EA] border border-[#5C3A21] rounded font-bold">
                  {topic.keyFormulaOrConcept || topic.badge}
                </code>
                . Contoh penerapannya: <em>{topic.quiz.explanation}</em>
              </p>
            </div>

            {/* Bagian 4: Latihan Pemahaman Buku (Tanpa Tanda Bocoran di Opsi Jawaban) */}
            <div className="p-3.5 sm:p-4 clay-card space-y-3 border-2 border-[#5C3A21]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">✍️</span>
                  <span className="text-xs sm:text-sm font-bold text-black uppercase tracking-wide">
                    4. Latihan Uji Pemahaman Buku
                  </span>
                </div>
                <span className="px-2 py-0.5 clay-badge-primary text-black text-[10px] sm:text-xs font-bold">
                  Hadiah +{expReward} EXP
                </span>
              </div>

              <div className="text-xs sm:text-sm font-bold text-black clay-card-secondary p-3 rounded-lg leading-relaxed border-2 border-[#5C3A21]">
                ❓ {cleanQuiz.question}
              </div>

              <div className="space-y-2">
                {cleanQuiz.options.map((opt, optIdx) => {
                  const isSelected = selectedQuizIdx === optIdx;
                  const hasAnswered = selectedQuizIdx !== null;

                  let btnStyle = 'clay-btn-neutral text-black';
                  let badgeContent = opt.label;

                  if (hasAnswered) {
                    if (opt.isCorrect) {
                      btnStyle =
                        'bg-[#A8E6CF] text-black border-2 border-green-700 font-bold';
                      badgeContent = '✓';
                    } else if (isSelected) {
                      btnStyle =
                        'bg-[#FFD3B6] text-black border-2 border-red-500 line-through';
                      badgeContent = '✕';
                    }
                  }

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={hasAnswered && isQuizCorrect === true}
                      onClick={() => {
                        sound.playClick();
                        setSelectedQuizIdx(optIdx);
                        setIsQuizCorrect(opt.isCorrect);
                        if (opt.isCorrect) {
                          sound.playSuccess();
                          onMarkAsRead();
                        } else {
                          sound.playError();
                        }
                      }}
                      className={`w-full p-2.5 text-left rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-[#FFF8EA] border-2 border-[#5C3A21] flex items-center justify-center font-bold text-xs shrink-0 text-black">
                        {badgeContent}
                      </span>
                      <span className="font-semibold text-black leading-snug">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedQuizIdx !== null && (
                <div className="space-y-2 pt-2 border-t-2 border-[#5C3A21]/20">
                  {isQuizCorrect ? (
                    <div className="p-2.5 rounded-lg bg-[#A8E6CF] border-2 border-green-700 flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-green-950">
                        🎉 Jawaban Tepat! Kamu telah menguasai bab ini!
                      </span>
                      <span className="px-2 py-0.5 clay-badge-cocoa text-white text-[10px] font-bold">
                        +{expReward} EXP
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-[#FFD3B6] border-2 border-red-500 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-red-950">
                        ✕ Jawaban belum tepat. Silakan coba pilih lagi!
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedQuizIdx(null);
                          setIsQuizCorrect(null);
                        }}
                        className="px-2.5 py-1 clay-btn-neutral text-black text-xs font-bold shrink-0"
                      >
                        Ulangi
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-black clay-card-secondary p-3 space-y-1 rounded-lg border-2 border-[#5C3A21]">
                    <div className="font-bold text-black">💡 Pembahasan Buku:</div>
                    <p className="text-black/95 leading-relaxed font-medium">
                      {cleanQuiz.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigasi Antar-Bab Buku */}
          <div className="pt-3 border-t-2 border-[#5C3A21] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              disabled={!hasPrevTopic}
              onClick={onPrevTopic}
              className="px-3 py-1.5 clay-btn-neutral text-black text-xs font-bold flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bab Sebelumnya</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onMarkAsRead}
                className={`px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 ${
                  isRead
                    ? 'clay-badge-secondary text-black'
                    : 'clay-btn-primary text-black'
                }`}
              >
                {isRead ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>Sudah Selesai Dibaca (+EXP)</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-black" />
                    <span>Tandai Selesai Dibaca (+{expReward} EXP)</span>
                  </>
                )}
              </button>
              {extraFooterAction}
            </div>

            <button
              type="button"
              disabled={!hasNextTopic}
              onClick={onNextTopic}
              className="px-3 py-1.5 clay-btn-neutral text-black text-xs font-bold flex items-center gap-1 disabled:opacity-40"
            >
              <span>Bab Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

