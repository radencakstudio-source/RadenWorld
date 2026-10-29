/**
 * ============================================================================
 * FILE: resources/js/game/ui/LibraryTopicVisualizer.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen Visual Interaktif & Diagram Konsep Edukasi untuk Perpustakaan RadenWorld.
 * Menghadirkan visualisasi grafis SVG animasi berkualitas tinggi agar pemain tidak
 * sekadar membaca teks di rak buku, melainkan memahami konsep secara visual.
 * 
 * JENIS DIAGRAM:
 * 1. photosynthesis: Reaksi fotosintesis daun, klorofil, sinar matahari & glukosa
 * 2. water_cycle: Siklus hidrologi (evaporasi, kondensasi, presipitasi, infiltrasi)
 * 3. solar_system: Orbit tata surya dengan planet-planet mengitari Matahari
 * 4. cell_structure: Struktur sel eukariotik (membran, nukleus, mitokondria ATP)
 * 5. dna_helix: Heliks ganda DNA dengan pasangan basa nitrogen A-T & G-C
 * 6. pythagoras: Pembuktian visual teorema Pythagoras a² + b² = c²
 * 7. cartesian_linear: Bidang koordinat Kartesius, gradien kemiringan & garis linear
 * 8. trigonometry_wave: Lingkaran satuan trigonometri & gelombang sinus/kosinus
 * 9. bohr_atom: Model atom Niels Bohr dengan kulit orbit K, L, M & foton kuantum
 * 10. ph_scale: Spektrum skala pH asam pekat (0) hingga basa pekat (14)
 * 11. newton_dynamics: Vektor gaya Newton F = m·a, gravitasi & gaya normal
 * 12. pancasila_shield: Perisai 5 Sila Garuda Pancasila dengan makna filosofis
 * 13. spok_sentence: Blok pembangun kalimat bahasa SPOK (Subjek, Predikat, Objek, Ket)
 * 14. history_timeline: Garis waktu sejarah peradaban Nusantara hingga Kemerdekaan
 * 15. blood_circulation: 4 ruang jantung manusia & sirkulasi darah besar/kecil
 * 16. flowchart_logic: Bagan alir logika pemrograman (Start -> Decision -> End)
 * 17. math_arithmetic: Diagram pecahan visual pizza & balok berhitung matematika
 * 18. mindmap_general: Mind-map konsep neural interaktif untuk topik umum
 * ============================================================================
 */

import React, { useState } from 'react';
import { Sparkles, Eye, Info, RotateCcw, ZoomIn } from 'lucide-react';

export type VisualDiagramType =
  | 'photosynthesis'
  | 'water_cycle'
  | 'solar_system'
  | 'cell_structure'
  | 'dna_helix'
  | 'pythagoras'
  | 'cartesian_linear'
  | 'trigonometry_wave'
  | 'bohr_atom'
  | 'ph_scale'
  | 'newton_dynamics'
  | 'pancasila_shield'
  | 'spok_sentence'
  | 'history_timeline'
  | 'blood_circulation'
  | 'flowchart_logic'
  | 'math_arithmetic'
  | 'mindmap_general';

export function detectDiagramType(subject: {
  id?: string;
  name?: string;
  badge?: string;
  subtitle?: string;
  points?: string[];
}): VisualDiagramType {
  const hay = `${subject.id || ''} ${subject.name || ''} ${subject.badge || ''} ${subject.subtitle || ''} ${(subject.points || []).join(' ')}`.toLowerCase();

  if (hay.includes('fotosintesis') || hay.includes('klorofil') || hay.includes('daun hijau') || hay.includes('tumbuhan')) return 'photosynthesis';
  if (hay.includes('siklus air') || hay.includes('hujan') || hay.includes('kondensasi') || hay.includes('evaporasi') || hay.includes('awan')) return 'water_cycle';
  if (hay.includes('tata surya') || hay.includes('planet') || hay.includes('matahari') || hay.includes('orbit') || hay.includes('saturnus') || hay.includes('jupiter')) return 'solar_system';
  if (hay.includes('dna') || hay.includes('genetika') || hay.includes('pewarisan sifat') || hay.includes('kromosom')) return 'dna_helix';
  if (hay.includes('struktur sel') || hay.includes('mitokondria') || hay.includes('nukleus') || hay.includes('organel') || (hay.includes('sel ') && hay.includes('hewan'))) return 'cell_structure';
  if (hay.includes('pythagoras') || hay.includes('segitiga') || hay.includes('hipotenusa') || hay.includes('dalil')) return 'pythagoras';
  if (hay.includes('kartesius') || hay.includes('persamaan linear') || hay.includes('garis lurus') || hay.includes('gradien') || hay.includes('plsv')) return 'cartesian_linear';
  if (hay.includes('trigonometri') || hay.includes('sin cos') || hay.includes('gelombang') || hay.includes('sinus') || hay.includes('kosinus')) return 'trigonometry_wave';
  if (hay.includes('atom') || hay.includes('bohr') || hay.includes('elektron') || hay.includes('foton') || hay.includes('proton')) return 'bohr_atom';
  if (hay.includes('ph ') || hay.includes('asam') || hay.includes('basa') || hay.includes('titrasi') || hay.includes('larutan')) return 'ph_scale';
  if (hay.includes('newton') || hay.includes('vektor') || hay.includes('kinematika') || hay.includes('hukum gerak') || hay.includes('gesek')) return 'newton_dynamics';
  if (hay.includes('pancasila') || hay.includes('sila') || hay.includes('garuda') || hay.includes('uud') || hay.includes('banteng')) return 'pancasila_shield';
  if (hay.includes('spok') || hay.includes('kalimat') || hay.includes('paragraf') || hay.includes('subjek') || hay.includes('puisi') || hay.includes('cerita')) return 'spok_sentence';
  if (hay.includes('sejarah') || hay.includes('majapahit') || hay.includes('sriwijaya') || hay.includes('proklamasi') || hay.includes('nusantara') || hay.includes('kerajaan')) return 'history_timeline';
  if (hay.includes('jantung') || hay.includes('peredaran darah') || hay.includes('arteri') || hay.includes('pencernaan') || hay.includes('organ tubuh')) return 'blood_circulation';
  if (hay.includes('algoritma') || hay.includes('flowchart') || hay.includes('python') || hay.includes('koding') || hay.includes('informatika') || hay.includes('siber')) return 'flowchart_logic';
  if (hay.includes('pecahan') || hay.includes('hitung') || hay.includes('bilangan') || hay.includes('kpk') || hay.includes('fpb') || hay.includes('perkalian') || hay.includes('matematika')) return 'math_arithmetic';

  return 'mindmap_general';
}

interface LibraryTopicVisualizerProps {
  type: VisualDiagramType;
  title: string;
  badge?: string;
  accentColor?: string;
}

export const LibraryTopicVisualizer: React.FC<LibraryTopicVisualizerProps> = ({
  type,
  title,
  badge,
  accentColor = '#38bdf8',
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className="relative w-full rounded-2xl bg-neutral-950/80 border border-neutral-800/80 shadow-2xl p-4 overflow-hidden flex flex-col items-center justify-center transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Banner Tag */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            MODEL VISUAL EDUKASI
          </span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span>Interaktif & Animasi</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-[16/9] max-h-[290px] flex items-center justify-center rounded-xl bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 border border-neutral-800/60 overflow-hidden shadow-inner">
        {renderDiagramSvg(type, activeStep, setActiveStep)}
      </div>

      {/* Visual Caption Footer */}
      <div className="w-full mt-3 flex items-center justify-between text-[11px] text-neutral-400 px-1">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{getDiagramDescription(type)}</span>
        </div>
        <span className="text-[10px] text-neutral-500 hidden sm:inline">RadenWorld Digital Visualizer</span>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER DESKRIPSI DIAGRAM
// ============================================================================
function getDiagramDescription(type: VisualDiagramType): string {
  switch (type) {
    case 'photosynthesis':
      return 'Matahari + H₂O dari akar + CO₂ dari udara menghasilkan Glukosa & Oksigen murni.';
    case 'water_cycle':
      return 'Air laut menguap (evaporasi), membentuk awan (kondensasi), lalu turun hujan (presipitasi).';
    case 'solar_system':
      return 'Matahari di pusat gravitasi dikelilingi orbit elips planet-planet tata surya.';
    case 'cell_structure':
      return 'Organel sel: Nukleus (inti genetik), Mitokondria (pembangkit energi ATP), & Membran pelindung.';
    case 'dna_helix':
      return 'Heliks ganda DNA: Pasangan komplementer Adenin-Timin (A-T) dan Guanin-Sitosin (G-C).';
    case 'pythagoras':
      return 'Luas bujur sangkar hipotenusa sama dengan jumlah luas bujur sangkar kedua sisi tegak (a² + b² = c²).';
    case 'cartesian_linear':
      return 'Garis lurus y = mx + c pada koordinat Kartesius dengan gradien kemiringan m.';
    case 'trigonometry_wave':
      return 'Proyeksi rotasi sudut pada lingkaran satuan membentuk gelombang sinusoidal kontinu.';
    case 'bohr_atom':
      return 'Elektron mengorbit inti atom pada tingkat energi stasioner kulit K, L, M.';
    case 'ph_scale':
      return 'Skala pH 0 (asam pekat) hingga 14 (basa kuat), netral pada air murni (pH 7).';
    case 'newton_dynamics':
      return 'Hukum II Newton (F = m·a): Percepatan sebanding resultan gaya dan berbanding terbalik dengan massa.';
    case 'pancasila_shield':
      return '5 Simbol Moral Bangsa: Bintang, Rantai Emas, Pohon Beringin, Kepala Banteng, Padi & Kapas.';
    case 'spok_sentence':
      return 'Struktur kalimat efektif bahasa Indonesia: Subjek (S) + Predikat (P) + Objek (O) + Keterangan (K).';
    case 'history_timeline':
      return 'Garis waktu kejayaan Nusantara: Kerajaan Kutai -> Sriwijaya -> Majapahit -> Kemerdekaan 1945.';
    case 'blood_circulation':
      return 'Sirkulasi ganda: Darah kaya O₂ dari paru ke bilik kiri, dipompa ke seluruh tubuh.';
    case 'flowchart_logic':
      return 'Bagan alir algoritma: Start -> Input Data -> Percabangan Kondisi (If-Else) -> Selesai.';
    case 'math_arithmetic':
      return 'Konsep pecahan lingkaran & balok berhitung matematika interaktif.';
    default:
      return 'Peta konsep cerdas: Hubungan antar gagasan inti, formula, dan fakta sains.';
  }
}

// ============================================================================
// SVG RENDERER PER JENIS MATERI
// ============================================================================
function renderDiagramSvg(
  type: VisualDiagramType,
  step: number,
  setStep: (s: number) => void
): React.ReactNode {
  switch (type) {
    case 'photosynthesis':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
          </defs>

          {/* Latar Tanah & Cahaya */}
          <rect x="0" y="270" width="600" height="50" fill="#291e12" />
          <path d="M 0 270 Q 150 265, 300 270 T 600 270" stroke="#78350f" strokeWidth="4" fill="none" />

          {/* Matahari Emas Bersinar */}
          <circle cx="80" cy="70" r="38" fill="url(#sunGlow)" />
          <circle cx="80" cy="70" r="22" fill="#fef08a" className="animate-pulse" />
          {/* Sinar Matahari */}
          <line x1="110" y1="90" x2="230" y2="170" stroke="#fef08a" strokeWidth="3" strokeDasharray="6,4" className="animate-pulse" />
          <line x1="90" y1="110" x2="190" y2="200" stroke="#facc15" strokeWidth="2.5" strokeDasharray="5,5" />
          <text x="75" y="125" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">☀️ Sinar Mentari</text>

          {/* Batang Tumbuhan & Akar */}
          <path d="M 300 270 Q 295 210, 300 150" stroke="url(#stemGrad)" strokeWidth="12" fill="none" strokeLinecap="round" />
          {/* Akar */}
          <path d="M 300 270 Q 280 290, 260 310 M 300 270 Q 310 295, 330 315 M 300 280 L 305 315" stroke="#a16207" strokeWidth="4" strokeLinecap="round" fill="none" />
          <text x="210" y="295" fill="#38bdf8" fontSize="11" fontWeight="bold">💧 H₂O (Air Akar)</text>

          {/* Daun Hijau Megah (Kloroplas) */}
          <path d="M 300 180 Q 210 130, 220 200 Q 250 230, 300 195 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="3" />
          <path d="M 300 170 Q 390 120, 380 190 Q 350 220, 300 185 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="3" />
          <circle cx="260" cy="180" r="5" fill="#bbf7d0" />
          <circle cx="340" cy="170" r="5" fill="#bbf7d0" />

          {/* Masuk: Karbon Dioksida CO2 */}
          <path d="M 120 180 Q 180 175, 225 185" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4,4" fill="none" />
          <polygon points="225,185 215,180 216,190" fill="#f43f5e" />
          <text x="145" y="170" fill="#fda4af" fontSize="11" fontWeight="bold">💨 Masuk: CO₂</text>

          {/* Keluar: Oksigen O2 */}
          <path d="M 370 160 Q 430 140, 480 130" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4,4" fill="none" />
          <polygon points="480,130 468,132 473,141" fill="#38bdf8" />
          <text x="440" y="120" fill="#7dd3fc" fontSize="11" fontWeight="bold">🫧 Keluar: O₂ (Oksigen)</text>

          {/* Keluar: Glukosa C6H12O6 */}
          <rect x="420" y="210" width="150" height="38" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
          <text x="495" y="228" fill="#c7d2fe" fontSize="11" fontWeight="bold" textAnchor="middle">🍃 Glukosa (Energi)</text>
          <text x="495" y="242" fill="#a5b4fc" fontSize="9" textAnchor="middle">C₆H₁₂O₆ Makanan Tumbuhan</text>

          {/* Persamaan Kimia di Bawah */}
          <rect x="70" y="15" width="460" height="30" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
          <text x="300" y="35" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">
            6CO₂ + 6H₂O + Cahaya ➔ C₆H₁₂O₆ + 6O₂
          </text>
        </svg>
      );

    case 'water_cycle':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Langit & Matahari */}
          <circle cx="80" cy="60" r="32" fill="#f59e0b" className="animate-pulse" />
          <text x="80" y="110" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">Matahari (Kalor)</text>

          {/* Pegunungan di Sebelah Kanan */}
          <polygon points="340,260 450,110 520,260" fill="url(#mountainGrad)" />
          <polygon points="450,110 420,150 480,150" fill="#f8fafc" /> {/* Salju */}
          <polygon points="460,260 540,140 600,260" fill="#475569" />

          {/* Laut di Sebelah Kiri */}
          <rect x="0" y="240" width="350" height="80" fill="url(#oceanGrad)" />
          <path d="M 0 240 Q 80 235, 175 240 T 350 240" stroke="#38bdf8" strokeWidth="3" fill="none" />
          <text x="90" y="280" fill="#e0f2fe" fontSize="13" fontWeight="bold">Samudra / Laut</text>

          {/* Panah Evaporasi (Uap Air Naik) */}
          <path d="M 120 220 Q 110 180, 130 140" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,4" fill="none" />
          <path d="M 160 220 Q 150 170, 170 135" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,4" fill="none" />
          <text x="145" y="160" fill="#7dd3fc" fontSize="11" fontWeight="bold">1. Evaporasi ⬆️</text>

          {/* Awan Kondensasi */}
          <g transform="translate(240, 50)">
            <ellipse cx="60" cy="40" rx="45" ry="25" fill="#e2e8f0" />
            <ellipse cx="95" cy="35" rx="35" ry="22" fill="#cbd5e1" />
            <ellipse cx="30" cy="45" rx="30" ry="18" fill="#e2e8f0" />
            <text x="60" y="20" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">2. Kondensasi (Awan) ☁️</text>
          </g>

          {/* Hujan Presipitasi di Atas Gunung */}
          <g stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,6">
            <line x1="380" y1="120" x2="365" y2="160" />
            <line x1="410" y1="130" x2="395" y2="170" />
            <line x1="440" y1="135" x2="425" y2="175" />
          </g>
          <text x="440" y="100" fill="#38bdf8" fontSize="11" fontWeight="bold">3. Presipitasi (Hujan) 🌧️</text>

          {/* Aliran Sungai / Infiltrasi ke Laut */}
          <path d="M 450 230 Q 380 245, 330 250" stroke="#0ea5e9" strokeWidth="8" fill="none" strokeLinecap="round" />
          <text x="410" y="275" fill="#38bdf8" fontSize="11" fontWeight="bold">4. Limpasan Sungai 🌊</text>
        </svg>
      );

    case 'solar_system':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Latar Bintang */}
          <circle cx="50" cy="40" r="1.5" fill="#fff" />
          <circle cx="120" cy="280" r="1.5" fill="#fff" />
          <circle cx="280" cy="30" r="2" fill="#fff" />
          <circle cx="480" cy="70" r="1.5" fill="#fff" />
          <circle cx="550" cy="250" r="2" fill="#fff" />

          {/* Matahari di Kiri */}
          <circle cx="60" cy="160" r="65" fill="#ea580c" />
          <circle cx="60" cy="160" r="50" fill="#f59e0b" />
          <circle cx="60" cy="160" r="40" fill="#fef08a" className="animate-pulse" />
          <text x="60" y="165" fill="#78350f" fontSize="12" fontWeight="bold" textAnchor="middle">Matahari</text>

          {/* Orbit-Orbit Elips */}
          <ellipse cx="60" cy="160" rx="110" ry="80" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
          <ellipse cx="60" cy="160" rx="160" ry="110" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
          <ellipse cx="60" cy="160" rx="220" ry="135" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
          <ellipse cx="60" cy="160" rx="280" ry="155" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
          <ellipse cx="60" cy="160" rx="360" ry="180" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />
          <ellipse cx="60" cy="160" rx="460" ry="210" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4,4" />

          {/* Planet-Planet */}
          {/* 1. Merkurius */}
          <circle cx="165" cy="140" r="7" fill="#94a3b8" />
          <text x="165" y="125" fill="#94a3b8" fontSize="9" textAnchor="middle">Merkurius</text>

          {/* 2. Venus */}
          <circle cx="210" cy="200" r="11" fill="#fcd34d" />
          <text x="210" y="224" fill="#fcd34d" fontSize="9" textAnchor="middle">Venus</text>

          {/* 3. Bumi & Bulan */}
          <circle cx="270" cy="130" r="13" fill="#38bdf8" />
          <circle cx="275" cy="126" r="6" fill="#15803d" />
          <circle cx="288" cy="120" r="3" fill="#e2e8f0" /> {/* Bulan */}
          <text x="270" y="156" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="middle">Bumi 🌍</text>

          {/* 4. Mars */}
          <circle cx="330" cy="180" r="9" fill="#ef4444" />
          <text x="330" y="202" fill="#fca5a5" fontSize="9" textAnchor="middle">Mars 🔴</text>

          {/* 5. Jupiter */}
          <circle cx="410" cy="115" r="24" fill="#d97706" />
          <circle cx="418" cy="122" r="5" fill="#b45309" /> {/* Bintik Merah */}
          <text x="410" y="152" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">Yupiter 🪐</text>

          {/* 6. Saturnus Bercincin */}
          <ellipse cx="505" cy="190" rx="34" ry="10" stroke="#fde047" strokeWidth="4" fill="none" transform="rotate(-20 505 190)" />
          <circle cx="505" cy="190" r="19" fill="#eab308" />
          <ellipse cx="505" cy="190" rx="34" ry="10" stroke="#fde047" strokeWidth="4" fill="none" strokeDasharray="25,50" transform="rotate(-20 505 190)" />
          <text x="505" y="225" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">Saturnus 💫</text>
        </svg>
      );

    case 'pythagoras':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Segitiga Siku-Siku (a=100, b=120, c=sqrt(100^2 + 120^2)) */}
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="none" stroke="#ffffff15" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Pusat Segitiga di (260, 200) */}
          {/* Alas a = 120px (horizontal kanan ke 380, 200) */}
          {/* Tinggi b = 90px (vertikal atas ke 260, 110) */}
          {/* Persegi di Sisi a (bawah): 120x120 */}
          <rect x="260" y="200" width="120" height="90" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="2" />
          <text x="320" y="250" fill="#fbbf24" fontSize="13" fontWeight="bold" textAnchor="middle">a² = 144</text>

          {/* Persegi di Sisi b (kiri): 90x90 */}
          <rect x="170" y="110" width="90" height="90" fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" />
          <text x="215" y="160" fill="#7dd3fc" fontSize="13" fontWeight="bold" textAnchor="middle">b² = 81</text>

          {/* Segitiga Utama */}
          <polygon points="260,200 380,200 260,110" fill="#10b981" fillOpacity="0.4" stroke="#10b981" strokeWidth="3" />
          {/* Siku-Siku Indicator */}
          <rect x="260" y="185" width="15" height="15" fill="none" stroke="#10b981" strokeWidth="2" />

          {/* Hipotenusa c */}
          <line x1="260" y1="110" x2="380" y2="200" stroke="#ec4899" strokeWidth="4" />
          <text x="330" y="145" fill="#f472b6" fontSize="13" fontWeight="bold">c (Hipotenusa)</text>

          {/* Kotak Formula Rumus Utama di Kanan */}
          <rect x="420" y="50" width="160" height="190" rx="12" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
          <text x="500" y="80" fill="#f472b6" fontSize="15" fontWeight="bold" textAnchor="middle">Dalil Pythagoras</text>
          <text x="500" y="115" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">a² + b² = c²</text>
          <line x1="435" y1="130" x2="565" y2="130" stroke="#334155" strokeWidth="1" />
          <text x="500" y="155" fill="#94a3b8" fontSize="11" textAnchor="middle">Contoh Triple:</text>
          <text x="500" y="175" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">3, 4, 5</text>
          <text x="500" y="195" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">5, 12, 13</text>
          <text x="500" y="215" fill="#4ade80" fontSize="11" textAnchor="middle">9 + 16 = 25 ✓</text>
        </svg>
      );

    case 'cell_structure':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Membran Sel (Oval Luar) */}
          <ellipse cx="280" cy="160" rx="210" ry="130" fill="#14532d" fillOpacity="0.25" stroke="#22c55e" strokeWidth="4" />
          <text x="180" y="45" fill="#4ade80" fontSize="11" fontWeight="bold">Membran & Dinding Sel</text>

          {/* Sitoplasma */}
          <ellipse cx="280" cy="160" rx="195" ry="118" fill="#052e16" fillOpacity="0.3" />

          {/* Nukleus (Inti Sel di Tengah-Kiri) */}
          <circle cx="230" cy="160" r="50" fill="#4c1d95" stroke="#a855f7" strokeWidth="3" />
          <circle cx="230" cy="160" r="22" fill="#7c3aed" className="animate-pulse" />
          <text x="230" y="165" fill="#f5d0fe" fontSize="11" fontWeight="bold" textAnchor="middle">Nukleus</text>
          <text x="230" y="180" fill="#ddd6fe" fontSize="8" textAnchor="middle">(DNA & Genetik)</text>

          {/* Mitokondria (Pabrik Energi ATP di Kanan) */}
          <g transform="translate(360, 110)">
            <ellipse cx="35" cy="25" rx="35" ry="20" fill="#991b1b" stroke="#ef4444" strokeWidth="2.5" />
            <path d="M 10 25 Q 20 15, 30 25 T 50 25 T 60 25" stroke="#fca5a5" strokeWidth="2" fill="none" />
            <text x="35" y="60" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">Mitokondria (ATP)</text>
          </g>

          {/* Vakuola Besar */}
          <ellipse cx="350" cy="210" rx="45" ry="28" fill="#0369a1" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="2" />
          <text x="350" y="215" fill="#bae6fd" fontSize="10" textAnchor="middle">Vakuola (Air)</text>

          {/* Ribosom (Titik-Titik Emas) */}
          <circle cx="160" cy="120" r="4" fill="#facc15" />
          <circle cx="170" cy="200" r="4" fill="#facc15" />
          <circle cx="300" cy="90" r="4" fill="#facc15" />
          <circle cx="430" cy="180" r="4" fill="#facc15" />
          <text x="130" y="240" fill="#fef08a" fontSize="10">✨ Ribosom (Sintesis Protein)</text>
        </svg>
      );

    case 'dna_helix':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Heliks Ganda Berulang */}
          <path d="M 80 80 Q 150 160, 220 80 T 360 80 T 500 80" stroke="#38bdf8" strokeWidth="4" fill="none" />
          <path d="M 80 240 Q 150 160, 220 240 T 360 240 T 500 240" stroke="#f43f5e" strokeWidth="4" fill="none" />

          {/* Anak Tangga Basa Nitrogen */}
          {[100, 130, 160, 190, 220, 250, 280, 310, 340, 370, 400, 430, 460, 480].map((x, idx) => {
            const isBlueYellow = idx % 2 === 0;
            const y1 = 80 + Math.sin(idx * 0.7) * 45;
            const y2 = 240 - Math.sin(idx * 0.7) * 45;
            return (
              <g key={x}>
                <line x1={x} y1={y1} x2={x} y2={(y1 + y2) / 2} stroke={isBlueYellow ? '#38bdf8' : '#22c55e'} strokeWidth="4" strokeLinecap="round" />
                <line x1={x} y1={(y1 + y2) / 2} x2={x} y2={y2} stroke={isBlueYellow ? '#eab308' : '#ef4444'} strokeWidth="4" strokeLinecap="round" />
                <circle cx={x} cy={(y1 + y2) / 2} r="3" fill="#fff" />
              </g>
            );
          })}

          {/* Legenda Pasangan Basa */}
          <rect x="150" y="270" width="300" height="40" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          <text x="300" y="287" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
            Pasangan Basa Nitrogen Komplementer:
          </text>
          <text x="300" y="301" fill="#cbd5e1" fontSize="10" textAnchor="middle">
            <tspan fill="#38bdf8">Adenin (A)</tspan> = <tspan fill="#eab308">Timin (T)</tspan>  •  
            <tspan fill="#22c55e">Guanin (G)</tspan> ≡ <tspan fill="#ef4444">Sitosin (C)</tspan>
          </text>
        </svg>
      );

    case 'bohr_atom':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Inti Atom Proton & Neutron */}
          <circle cx="300" cy="160" r="26" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
          <circle cx="294" cy="154" r="7" fill="#ef4444" />
          <circle cx="306" cy="154" r="7" fill="#94a3b8" />
          <circle cx="300" cy="166" r="7" fill="#ef4444" />
          <text x="300" y="195" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">Inti (p⁺ & n⁰)</text>

          {/* Kulit K (n=1) */}
          <circle cx="300" cy="160" r="55" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
          <circle cx="300" cy="105" r="5" fill="#38bdf8" />
          <circle cx="300" cy="215" r="5" fill="#38bdf8" />
          <text x="300" y="85" fill="#7dd3fc" fontSize="9" textAnchor="middle">Kulit K (n=1, maks 2e⁻)</text>

          {/* Kulit L (n=2) */}
          <circle cx="300" cy="160" r="95" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeDasharray="4,4" />
          <circle cx="395" cy="160" r="5" fill="#c084fc" />
          <circle cx="205" cy="160" r="5" fill="#c084fc" />
          <circle cx="233" cy="93" r="5" fill="#c084fc" />
          <circle cx="367" cy="227" r="5" fill="#c084fc" />
          <text x="440" y="70" fill="#d8b4fe" fontSize="9">Kulit L (n=2, maks 8e⁻)</text>

          {/* Kulit M (n=3) */}
          <circle cx="300" cy="160" r="135" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="5,5" />
          <circle cx="435" cy="160" r="5" fill="#fbbf24" />
          <text x="460" y="170" fill="#fbbf24" fontSize="9">Kulit M (n=3)</text>

          {/* Foton Terpancar */}
          <path d="M 395 160 Q 430 135, 480 130" stroke="#fde047" strokeWidth="2.5" fill="none" />
          <text x="510" y="135" fill="#fde047" fontSize="10" fontWeight="bold">Foton (ΔE = h·ν)</text>
        </svg>
      );

    case 'cartesian_linear':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Grid Kartesius */}
          <defs>
            <pattern id="cartGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="none" stroke="#ffffff10" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="50" y="20" width="500" height="260" fill="url(#cartGrid)" />

          {/* Sumbu X dan Y */}
          <line x1="50" y1="150" x2="550" y2="150" stroke="#64748b" strokeWidth="2" />
          <line x1="300" y1="20" x2="300" y2="280" stroke="#64748b" strokeWidth="2" />
          <text x="540" y="140" fill="#94a3b8" fontSize="12" fontWeight="bold">X</text>
          <text x="310" y="35" fill="#94a3b8" fontSize="12" fontWeight="bold">Y</text>
          <text x="290" y="165" fill="#64748b" fontSize="10">O(0,0)</text>

          {/* Garis Fungsi Linear: y = 0.8x + 30 */}
          <line x1="100" y1="230" x2="480" y2="70" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

          {/* Titik Potong & Gradien */}
          <circle cx="300" cy="150" r="4" fill="#f59e0b" />
          <circle cx="200" cy="190" r="5" fill="#ec4899" />
          <circle cx="400" cy="110" r="5" fill="#ec4899" />

          {/* Segitiga Gradien (Delta Y / Delta X) */}
          <line x1="200" y1="190" x2="400" y2="190" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
          <line x1="400" y1="190" x2="400" y2="110" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
          <text x="300" y="208" fill="#f59e0b" fontSize="10" textAnchor="middle">Δx</text>
          <text x="415" y="150" fill="#f59e0b" fontSize="10">Δy</text>

          {/* Card Formula */}
          <rect x="70" y="35" width="160" height="60" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="150" y="58" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">y = mx + c</text>
          <text x="150" y="78" fill="#94a3b8" fontSize="10" textAnchor="middle">Gradien m = Δy / Δx</text>
        </svg>
      );

    case 'ph_scale':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <defs>
            <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Judul Skala */}
          <text x="300" y="50" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">
            SKALA DERAJAT KEASAMAN (pH 0 - 14)
          </text>

          {/* Spektrum Warna pH */}
          <rect x="50" y="100" width="500" height="40" rx="8" fill="url(#phGrad)" stroke="#334155" strokeWidth="2" />

          {/* Angka Skala */}
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((v) => {
            const x = 50 + (v / 14) * 500;
            return (
              <g key={v}>
                <line x1={x} y1={95} x2={x} y2={145} stroke="#fff" strokeWidth="2" />
                <text x={x} y={165} fill="#f1f5f9" fontSize="11" fontWeight="bold" textAnchor="middle">{v}</text>
              </g>
            );
          })}

          {/* Label Contoh Produk Sehari-Hari */}
          <g transform="translate(0, 190)">
            {/* Asam Kuat */}
            <rect x="50" y="10" width="140" height="65" rx="8" fill="#1e1b4b" stroke="#ef4444" strokeWidth="1.5" />
            <text x="120" y="32" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">ASAM (pH &lt; 7)</text>
            <text x="120" y="50" fill="#cbd5e1" fontSize="9" textAnchor="middle">Lemon, Cuka, Asam Lambung</text>

            {/* Netral */}
            <rect x="230" y="10" width="140" height="65" rx="8" fill="#064e3b" stroke="#22c55e" strokeWidth="1.5" />
            <text x="300" y="32" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">NETRAL (pH = 7)</text>
            <text x="300" y="50" fill="#cbd5e1" fontSize="9" textAnchor="middle">Air Murni H₂O, Darah Sehat</text>

            {/* Basa Kuat */}
            <rect x="410" y="10" width="140" height="65" rx="8" fill="#312e81" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="480" y="32" fill="#c084fc" fontSize="11" fontWeight="bold" textAnchor="middle">BASA (pH &gt; 7)</text>
            <text x="480" y="50" fill="#cbd5e1" fontSize="9" textAnchor="middle">Sabun, Baking Soda, Pemutih</text>
          </g>
        </svg>
      );

    case 'pancasila_shield':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Perisai Emas Garuda */}
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Garis Lingkar Luar */}
          <circle cx="300" cy="160" r="140" fill="url(#shieldGrad)" stroke="#f59e0b" strokeWidth="4" />

          {/* Sila 1: Bintang Emas di Tengah */}
          <circle cx="300" cy="160" r="38" fill="#000000" stroke="#eab308" strokeWidth="2.5" />
          <polygon points="300,135 306,152 324,152 310,163 315,180 300,170 285,180 290,163 276,152 294,152" fill="#facc15" />
          <text x="300" y="195" fill="#fef08a" fontSize="8" fontWeight="bold" textAnchor="middle">1. Ketuhanan</text>

          {/* Sila 2: Rantai Emas (Kanan Bawah) */}
          <g transform="translate(370, 210)">
            <rect x="-18" y="-12" width="36" height="24" rx="6" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="22" fill="#fde047" fontSize="9" fontWeight="bold" textAnchor="middle">2. Rantai</text>
          </g>

          {/* Sila 3: Pohon Beringin (Kanan Atas) */}
          <g transform="translate(370, 100)">
            <circle cx="0" cy="-6" r="18" fill="#15803d" />
            <rect x="-3" y="10" width="6" height="12" fill="#78350f" />
            <text x="0" y="28" fill="#4ade80" fontSize="9" fontWeight="bold" textAnchor="middle">3. Beringin</text>
          </g>

          {/* Sila 4: Kepala Banteng (Kiri Atas) */}
          <g transform="translate(230, 100)">
            <ellipse cx="0" cy="0" rx="16" ry="12" fill="#18181b" stroke="#e4e4e7" strokeWidth="1.5" />
            <path d="M -12 -6 Q -18 -18, -6 -12 M 12 -6 Q 18 -18, 6 -12" stroke="#e4e4e7" strokeWidth="2.5" fill="none" />
            <text x="0" y="26" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">4. Banteng</text>
          </g>

          {/* Sila 5: Padi & Kapas (Kiri Bawah) */}
          <g transform="translate(230, 210)">
            <ellipse cx="-8" cy="0" rx="4" ry="10" fill="#facc15" />
            <circle cx="8" cy="0" r="7" fill="#f8fafc" />
            <text x="0" y="22" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">5. Padi-Kapas</text>
          </g>

          {/* Semboyan Bhinneka Tunggal Ika */}
          <rect x="180" y="275" width="240" height="26" rx="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
          <text x="300" y="293" fill="#854d0e" fontSize="12" fontWeight="bold" textAnchor="middle">
            BHINNEKA TUNGGAL IKA
          </text>
        </svg>
      );

    case 'history_timeline':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="45" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            GARIS WAKTU SEJARAH KEJAYAAN NUSANTARA
          </text>

          {/* Garis Waktu Horizontal Emas */}
          <line x1="60" y1="160" x2="540" y2="160" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />

          {/* Milestone 1: Kutai (400 M) */}
          <g transform="translate(90, 160)">
            <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="0" cy="0" r="6" fill="#f59e0b" />
            <line x1="0" y1="-14" x2="0" y2="-45" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
            <rect x="-55" y="-90" width="110" height="42" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x="0" y="-74" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">400 Masehi</text>
            <text x="0" y="-58" fill="#e2e8f0" fontSize="9" textAnchor="middle">Kerajaan Kutai</text>
          </g>

          {/* Milestone 2: Sriwijaya (683 M) */}
          <g transform="translate(200, 160)">
            <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
            <circle cx="0" cy="0" r="6" fill="#38bdf8" />
            <line x1="0" y1="14" x2="0" y2="45" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
            <rect x="-55" y="45" width="110" height="42" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <text x="0" y="61" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">683 Masehi</text>
            <text x="0" y="77" fill="#e2e8f0" fontSize="9" textAnchor="middle">Kemaritiman Sriwijaya</text>
          </g>

          {/* Milestone 3: Majapahit (1293 M) */}
          <g transform="translate(320, 160)">
            <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#10b981" strokeWidth="3" />
            <circle cx="0" cy="0" r="6" fill="#10b981" />
            <line x1="0" y1="-14" x2="0" y2="-45" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
            <rect x="-55" y="-90" width="110" height="42" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
            <text x="0" y="-74" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">1293 Masehi</text>
            <text x="0" y="-58" fill="#e2e8f0" fontSize="9" textAnchor="middle">Majapahit & Palapa</text>
          </g>

          {/* Milestone 4: Sumpah Pemuda (1928) */}
          <g transform="translate(425, 160)">
            <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#a855f7" strokeWidth="3" />
            <circle cx="0" cy="0" r="6" fill="#a855f7" />
            <line x1="0" y1="14" x2="0" y2="45" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
            <rect x="-55" y="45" width="110" height="42" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1" />
            <text x="0" y="61" fill="#c084fc" fontSize="11" fontWeight="bold" textAnchor="middle">1928</text>
            <text x="0" y="77" fill="#e2e8f0" fontSize="9" textAnchor="middle">Sumpah Pemuda</text>
          </g>

          {/* Milestone 5: Proklamasi 1945 */}
          <g transform="translate(520, 160)">
            <circle cx="0" cy="0" r="18" fill="#991b1b" stroke="#ef4444" strokeWidth="3" className="animate-pulse" />
            <circle cx="0" cy="0" r="8" fill="#fca5a5" />
            <line x1="0" y1="-18" x2="0" y2="-45" stroke="#ef4444" strokeWidth="2" />
            <rect x="-55" y="-90" width="110" height="42" rx="6" fill="#991b1b" stroke="#fca5a5" strokeWidth="1.5" />
            <text x="0" y="-74" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">17 Agustus 1945</text>
            <text x="0" y="-58" fill="#fef08a" fontSize="9" fontWeight="bold" textAnchor="middle">PROKLAMASI RI 🇮🇩</text>
          </g>
        </svg>
      );

    case 'spok_sentence':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="45" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">
            STRUKTUR KALIMAT BAHASA INDONESIA (S - P - O - K)
          </text>

          {/* 4 Balok Elemen SPOK */}
          <g transform="translate(45, 90)">
            {/* Subjek (S) */}
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="115" height="110" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
              <text x="57" y="32" fill="#a5b4fc" fontSize="22" fontWeight="bold" textAnchor="middle">S</text>
              <text x="57" y="55" fill="#c7d2fe" fontSize="12" fontWeight="bold" textAnchor="middle">SUBJEK</text>
              <rect x="10" y="70" width="95" height="26" rx="6" fill="#312e81" />
              <text x="57" y="87" fill="#e0e7ff" fontSize="11" textAnchor="middle">"Raden"</text>
            </g>

            {/* Simbol Tambah */}
            <text x="127" y="60" fill="#94a3b8" fontSize="22" fontWeight="bold">+</text>

            {/* Predikat (P) */}
            <g transform="translate(135, 0)">
              <rect x="0" y="0" width="115" height="110" rx="10" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
              <text x="57" y="32" fill="#6ee7b7" fontSize="22" fontWeight="bold" textAnchor="middle">P</text>
              <text x="57" y="55" fill="#a7f3d0" fontSize="12" fontWeight="bold" textAnchor="middle">PREDIKAT</text>
              <rect x="10" y="70" width="95" height="26" rx="6" fill="#065f46" />
              <text x="57" y="87" fill="#ecfdf5" fontSize="11" textAnchor="middle">"membaca"</text>
            </g>

            {/* Simbol Tambah */}
            <text x="262" y="60" fill="#94a3b8" fontSize="22" fontWeight="bold">+</text>

            {/* Objek (O) */}
            <g transform="translate(270, 0)">
              <rect x="0" y="0" width="115" height="110" rx="10" fill="#78350f" stroke="#fbbf24" strokeWidth="2" />
              <text x="57" y="32" fill="#fde047" fontSize="22" fontWeight="bold" textAnchor="middle">O</text>
              <text x="57" y="55" fill="#fef08a" fontSize="12" fontWeight="bold" textAnchor="middle">OBJEK</text>
              <rect x="10" y="70" width="95" height="26" rx="6" fill="#92400e" />
              <text x="57" y="87" fill="#fffbeb" fontSize="11" textAnchor="middle">"buku sains"</text>
            </g>

            {/* Simbol Tambah */}
            <text x="397" y="60" fill="#94a3b8" fontSize="22" fontWeight="bold">+</text>

            {/* Keterangan (K) */}
            <g transform="translate(405, 0)">
              <rect x="0" y="0" width="115" height="110" rx="10" fill="#701a75" stroke="#f472b6" strokeWidth="2" />
              <text x="57" y="32" fill="#f472b6" fontSize="22" fontWeight="bold" textAnchor="middle">K</text>
              <text x="57" y="55" fill="#fbcfe8" fontSize="11" fontWeight="bold" textAnchor="middle">KETERANGAN</text>
              <rect x="10" y="70" width="95" height="26" rx="6" fill="#86198f" />
              <text x="57" y="87" fill="#fdf2f8" fontSize="10" textAnchor="middle">"di perpustakaan"</text>
            </g>
          </g>

          {/* Hasil Gabungan Kalimat Utuh */}
          <rect x="70" y="240" width="460" height="42" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="300" y="266" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">
            📖 "Raden membaca buku sains di perpustakaan kota."
          </text>
        </svg>
      );

    case 'flowchart_logic':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="35" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            ALGORITMA & BAGAN ALIR (FLOWCHART LOGIKA)
          </text>

          {/* Node 1: Start (Oval Hijau) */}
          <ellipse cx="300" cy="70" rx="50" ry="18" fill="#15803d" stroke="#4ade80" strokeWidth="2" />
          <text x="300" y="75" fill="#f0fdf4" fontSize="11" fontWeight="bold" textAnchor="middle">MULAI</text>

          {/* Panah Turun */}
          <line x1="300" y1="88" x2="300" y2="115" stroke="#94a3b8" strokeWidth="2" />
          <polygon points="300,118 296,112 304,112" fill="#94a3b8" />

          {/* Node 2: Input Nilai (Jajar Genjang) */}
          <polygon points="240,140 360,140 340,118 220,118" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
          <text x="290" y="133" fill="#e0f2fe" fontSize="10" fontWeight="bold" textAnchor="middle">Input: Nilai Ujian</text>

          {/* Panah Turun */}
          <line x1="290" y1="140" x2="290" y2="165" stroke="#94a3b8" strokeWidth="2" />
          <polygon points="290,168 286,162 294,162" fill="#94a3b8" />

          {/* Node 3: Decision (Belah Ketupat) */}
          <polygon points="290,170 360,205 290,240 220,205" fill="#78350f" stroke="#fbbf24" strokeWidth="2" />
          <text x="290" y="202" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">Nilai ≥ 75?</text>

          {/* Cabang YA (Kanan) */}
          <line x1="360" y1="205" x2="430" y2="205" stroke="#4ade80" strokeWidth="2" />
          <text x="390" y="198" fill="#4ade80" fontSize="10" fontWeight="bold">YA</text>
          <rect x="430" y="185" width="90" height="38" rx="6" fill="#166534" stroke="#4ade80" strokeWidth="1.5" />
          <text x="475" y="208" fill="#dcfce7" fontSize="10" fontWeight="bold" textAnchor="middle">LULUS 🎉</text>

          {/* Cabang TIDAK (Kiri) */}
          <line x1="220" y1="205" x2="150" y2="205" stroke="#f43f5e" strokeWidth="2" />
          <text x="180" y="198" fill="#f43f5e" fontSize="10" fontWeight="bold">TIDAK</text>
          <rect x="60" y="185" width="90" height="38" rx="6" fill="#991b1b" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="105" y="208" fill="#fee2e2" fontSize="10" fontWeight="bold" textAnchor="middle">REMIDI 📚</text>

          {/* Panah ke Selesai */}
          <path d="M 475 223 L 475 270 L 340 270" stroke="#94a3b8" strokeWidth="2" fill="none" />
          <path d="M 105 223 L 105 270 L 260 270" stroke="#94a3b8" strokeWidth="2" fill="none" />

          {/* Node 4: Selesai */}
          <ellipse cx="300" cy="270" rx="45" ry="16" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
          <text x="300" y="275" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">SELESAI</text>
        </svg>
      );

    case 'math_arithmetic':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="45" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">
            PECAHAN VISUAL & BALOK ARITMATIKA
          </text>

          {/* Pecahan Pizza 1/2 */}
          <g transform="translate(120, 150)">
            <circle cx="0" cy="0" r="50" fill="#334155" />
            <path d="M 0 0 L 0 -50 A 50 50 0 0 1 0 50 Z" fill="#38bdf8" />
            <circle cx="0" cy="0" r="50" stroke="#38bdf8" strokeWidth="3" fill="none" />
            <text x="0" y="75" fill="#7dd3fc" fontSize="14" fontWeight="bold" textAnchor="middle">1 / 2 (Setengah)</text>
          </g>

          {/* Pecahan Pizza 1/4 */}
          <g transform="translate(300, 150)">
            <circle cx="0" cy="0" r="50" fill="#334155" />
            <path d="M 0 0 L 50 0 A 50 50 0 0 1 0 50 Z" fill="#ec4899" />
            <circle cx="0" cy="0" r="50" stroke="#ec4899" strokeWidth="3" fill="none" />
            <line x1="-50" y1="0" x2="50" y2="0" stroke="#1e293b" strokeWidth="2" />
            <line x1="0" y1="-50" x2="0" y2="50" stroke="#1e293b" strokeWidth="2" />
            <text x="0" y="75" fill="#f472b6" fontSize="14" fontWeight="bold" textAnchor="middle">1 / 4 (Seperempat)</text>
          </g>

          {/* Pecahan 3/4 */}
          <g transform="translate(480, 150)">
            <circle cx="0" cy="0" r="50" fill="#334155" />
            <path d="M 0 0 L 0 -50 A 50 50 0 1 1 -50 0 Z" fill="#22c55e" />
            <circle cx="0" cy="0" r="50" stroke="#22c55e" strokeWidth="3" fill="none" />
            <text x="0" y="75" fill="#4ade80" fontSize="14" fontWeight="bold" textAnchor="middle">3 / 4 (Tiga Perempat)</text>
          </g>

          {/* Kesimpulan */}
          <rect x="150" y="250" width="300" height="35" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="300" y="272" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
            1/4 + 1/4 = 2/4 = 1/2 (Pecahan Senilai)
          </text>
        </svg>
      );

    default: // mindmap_general
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          {/* Node Pusat */}
          <circle cx="300" cy="150" r="45" fill="#1e1b4b" stroke="#818cf8" strokeWidth="3" />
          <text x="300" y="148" fill="#c7d2fe" fontSize="12" fontWeight="bold" textAnchor="middle">KONSEP</text>
          <text x="300" y="162" fill="#a5b4fc" fontSize="10" textAnchor="middle">UTAMA</text>

          {/* Garis Koneksi Neural */}
          <line x1="300" y1="150" x2="160" y2="80" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="300" y1="150" x2="440" y2="80" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="300" y1="150" x2="160" y2="220" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="300" y1="150" x2="440" y2="220" stroke="#ec4899" strokeWidth="2" strokeDasharray="3,3" />

          {/* 4 Satelit Konsep */}
          <g transform="translate(160, 80)">
            <circle cx="0" cy="0" r="32" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="-4" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="middle">Definisi</text>
            <text x="0" y="10" fill="#e0f2fe" fontSize="8" textAnchor="middle">Dasar</text>
          </g>

          <g transform="translate(440, 80)">
            <circle cx="0" cy="0" r="32" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            <text x="0" y="-4" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">Rumus &</text>
            <text x="0" y="10" fill="#fef08a" fontSize="8" textAnchor="middle">Formula</text>
          </g>

          <g transform="translate(160, 220)">
            <circle cx="0" cy="0" r="32" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <text x="0" y="-4" fill="#6ee7b7" fontSize="10" fontWeight="bold" textAnchor="middle">Contoh</text>
            <text x="0" y="10" fill="#a7f3d0" fontSize="8" textAnchor="middle">Nyata</text>
          </g>

          <g transform="translate(440, 220)">
            <circle cx="0" cy="0" r="32" fill="#701a75" stroke="#ec4899" strokeWidth="2" />
            <text x="0" y="-4" fill="#f472b6" fontSize="10" fontWeight="bold" textAnchor="middle">Fakta &</text>
            <text x="0" y="10" fill="#fbcfe8" fontSize="8" textAnchor="middle">Kuis</text>
          </g>

          <text x="300" y="275" fill="#94a3b8" fontSize="11" textAnchor="middle">
            ✨ Jelajahi materi pelajaran lengkap di ensiklopedia buku perpustakaan!
          </text>
        </svg>
      );
  }
}
