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

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Eye,
  Info,
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Tv,
  Bot,
  Film,
  Zap,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { SoundManager } from '../core/SoundManager';

export type VisualDiagramType =
  // Matematika
  | 'math_counting'
  | 'math_addition_subtraction'
  | 'math_geometry_shapes'
  | 'math_clock_time'
  | 'math_arithmetic'
  | 'math_multiplication_division'
  | 'math_data_charts'
  | 'math_exponential_logarithm'
  // IPA / Sains
  | 'science_plants_growth'
  | 'science_animals_habitat'
  | 'science_metamorphosis'
  | 'science_food_chain'
  | 'science_matter_states'
  | 'science_human_body'
  | 'photosynthesis'
  | 'water_cycle'
  | 'solar_system'
  | 'cell_structure'
  | 'dna_helix'
  | 'bohr_atom'
  | 'pythagoras'
  | 'cartesian_linear'
  | 'trigonometry_wave'
  | 'ph_scale'
  | 'newton_dynamics'
  | 'blood_circulation'
  | 'pressure_pascal'
  | 'electric_circuit'
  | 'wave_sound'
  | 'calculus_integral_derivative'
  | 'economics_supply_demand'
  | 'thermodynamics_carnot'
  | 'optics_light'
  | 'organic_chemistry'
  | 'relativity_einstein'
  // Kewarganegaraan & PKn
  | 'pancasila_shield'
  | 'civics_gotong_royong'
  // Bahasa & Sastra
  | 'language_alphabet_vocab'
  | 'spok_sentence'
  | 'language_story_fabel'
  // Bahasa Inggris
  | 'english_kids'
  // Seni Budaya & Muatan Lokal
  | 'art_culture_jawa'
  // Informatika & Komputasi
  | 'informatics_scratch'
  | 'flowchart_logic'
  | 'data_structures_algorithms'
  | 'history_timeline'
  // Default Fallback
  | 'classroom_chalkboard'
  | 'mindmap_general';

export function detectDiagramType(subject: {
  id?: string;
  name?: string;
  title?: string;
  badge?: string;
  subtitle?: string;
  category?: string;
  points?: string[];
}): VisualDiagramType {
  const hay = `${subject.id || ''} ${subject.name || ''} ${subject.title || ''} ${subject.badge || ''} ${subject.subtitle || ''} ${subject.category || ''} ${(subject.points || []).join(' ')}`.toLowerCase();

  // ==========================================================================
  // 1. BAHASA INGGRIS (Prioritas Tertinggi untuk Seluruh Pelajaran English)
  // ==========================================================================
  if (
    subject.category === 'Bahasa Inggris' ||
    subject.name === 'Bahasa Inggris' ||
    hay.includes('bahasa inggris') ||
    hay.includes('english') ||
    hay.includes('exposition') ||
    hay.includes('narrative text') ||
    hay.includes('conditional sentences') ||
    hay.includes('news item') ||
    hay.includes('past tense') ||
    hay.includes('greetings')
  ) {
    return 'english_kids';
  }

  // ==========================================================================
  // 2. SENI BUDAYA & KARYA SENI
  // ==========================================================================
  if (
    hay.includes('seni rupa') ||
    hay.includes('karya seni') ||
    hay.includes('batik') ||
    hay.includes('wayang') ||
    hay.includes('aksara jawa') ||
    hay.includes('tangga nada') ||
    hay.includes('tembang')
  ) {
    return 'art_culture_jawa';
  }

  // ==========================================================================
  // 3. PRIORITAS KHUSUS TINGKAT TINGGI SMA (KELAS 10, 11, 12)
  // ==========================================================================
  // A. Matematika SMA - Fungsi Eksponen dan Logaritma
  if (
    hay.includes('eksponen') ||
    hay.includes('logaritma') ||
    hay.includes('pertumbuhan eksponensial') ||
    hay.includes('peluruhan radioaktif') ||
    hay.includes('perpangkatan')
  ) {
    return 'math_exponential_logarithm';
  }

  // B. Informatika SMA - Struktur Data Linier, Algoritma Pemrograman & AI Machine Learning
  if (
    hay.includes('array') ||
    hay.includes('stack') ||
    hay.includes('queue') ||
    hay.includes('rekursi') ||
    hay.includes('big-o') ||
    hay.includes('kompleksitas') ||
    hay.includes('binary search') ||
    hay.includes('machine learning') ||
    hay.includes('kecerdasan buatan') ||
    hay.includes('artificial intelligence') ||
    hay.includes('neural network') ||
    hay.includes('supervised learning') ||
    hay.includes('struktur data') ||
    hay.includes('algoritma pemrograman')
  ) {
    return 'data_structures_algorithms';
  }

  // C. Statistika Lanjutan & Data Charts (Cegah kata "frekuensi data" memicu gelombang suara)
  if (
    hay.includes('statistika') ||
    hay.includes('data berkelompok') ||
    hay.includes('ukuran pemusatan') ||
    hay.includes('penyebaran data')
  ) {
    return 'math_data_charts';
  }

  // D. Fisika SMA - Termodinamika & Kalor Carnot / Termokimia Entalpi
  if (
    hay.includes('termodinamika') ||
    hay.includes('mesin kalor') ||
    hay.includes('mesin carnot') ||
    hay.includes('termokimia') ||
    hay.includes('hukum hess') ||
    hay.includes('entalpi')
  ) {
    return 'thermodynamics_carnot';
  }

  // E. Kimia SMA - Senyawa Karbon, Turunan Alkana, Polimer & Makromolekul
  if (
    hay.includes('turunan alkana') ||
    hay.includes('senyawa karbon') ||
    hay.includes('alkana') ||
    hay.includes('alkohol') ||
    hay.includes('aldehid') ||
    hay.includes('keton') ||
    hay.includes('benzena') ||
    hay.includes('makromolekul') ||
    hay.includes('polimer') ||
    (hay.includes('eter') && !hay.includes('determinan') && !hay.includes('karakter')) ||
    hay.includes('ikatan kimia')
  ) {
    return 'organic_chemistry';
  }

  // F. Matematika SMA - Kalkulus: Turunan Fungsi (Diferensial) & Integral Aljabar
  if (
    (hay.includes('turunan') && !hay.includes('turunan alkana')) ||
    hay.includes('diferensial') ||
    hay.includes('integral') ||
    hay.includes('nilai stasioner') ||
    hay.includes('garis singgung kurva') ||
    hay.includes('kalkulus')
  ) {
    return 'calculus_integral_derivative';
  }

  // G. Matematika SMA - Trigonometri: Lingkaran Satuan & Sudut Istimewa
  if (
    hay.includes('trigonometri') ||
    hay.includes('sin cos') ||
    hay.includes('sudut istimewa') ||
    hay.includes('lingkaran satuan') ||
    hay.includes('tangen')
  ) {
    return 'trigonometry_wave';
  }

  // H. Fisika SMA - Alat-Alat Optik, Pembiasan Cahaya & Lensa
  if (
    hay.includes('alat optik') ||
    hay.includes('alat-alat optik') ||
    hay.includes('kacamata') ||
    hay.includes('lensa') ||
    hay.includes('cermin') ||
    hay.includes('lup') ||
    (hay.includes('mikroskop') && !hay.includes('sel')) ||
    hay.includes('pembiasan cahaya')
  ) {
    return 'optics_light';
  }

  // I. Fisika SMA - Teori Relativitas Khusus Einstein
  if (
    hay.includes('relativitas') ||
    hay.includes('dilatasi waktu') ||
    hay.includes('e=mc') ||
    hay.includes('einstein') ||
    hay.includes('kecepatan cahaya')
  ) {
    return 'relativity_einstein';
  }

  // J. Kimia SMA & Fisika Modern - Model Atom Bohr, Kuantum & Fotolistrik
  if (
    hay.includes('struktur atom') ||
    hay.includes('niels bohr') ||
    hay.includes('mekanika kuantum') ||
    hay.includes('kulit atom') ||
    hay.includes('fotolistrik') ||
    hay.includes('dualisme') ||
    hay.includes('sistem periodik')
  ) {
    return 'bohr_atom';
  }

  // K. Kimia SMA - Larutan Asam Basa, Titrasi, Laju Reaksi & Le Chatelier
  if (
    hay.includes('derajat keasaman') ||
    hay.includes('titrasi') ||
    hay.includes('laju reaksi') ||
    hay.includes('le chatelier') ||
    hay.includes('kesetimbangan kimia') ||
    (hay.includes('ph ') && !hay.includes('photo'))
  ) {
    return 'ph_scale';
  }

  // L. Ekonomi SMA - Kelangkaan, Kurva Permintaan-Penawaran & Pendapatan Nasional
  if (
    hay.includes('permintaan') ||
    hay.includes('penawaran') ||
    hay.includes('kelangkaan') ||
    hay.includes('biaya peluang') ||
    hay.includes('opportunity cost') ||
    hay.includes('pendapatan nasional') ||
    hay.includes('pasar') ||
    hay.includes('ekuilibrium')
  ) {
    return 'economics_supply_demand';
  }

  // M. Biologi SMA - Struktur DNA, Genetika Molekuler, Virus & Bioteknologi
  if (
    hay.includes('dna') ||
    hay.includes('genetika') ||
    hay.includes('kromosom') ||
    hay.includes('virus') ||
    hay.includes('bioteknologi') ||
    hay.includes('daur litik')
  ) {
    return 'dna_helix';
  }

  // N. Biologi SMA - Sel Saraf, Jaringan, Mitokondria & Metabolisme Sel
  if (
    hay.includes('struktur sel') ||
    hay.includes('sel saraf') ||
    hay.includes('saraf') ||
    hay.includes('metabolisme sel') ||
    hay.includes('respirasi aerob') ||
    hay.includes('enzim') ||
    hay.includes('mitokondria') ||
    hay.includes('sel eukariotik')
  ) {
    return 'cell_structure';
  }

  // O. Fisika SMA / SMP - Rangkaian Listrik AC/DC, Magnet, Redoks & Gaya Lorentz
  if (
    hay.includes('medan magnet') ||
    hay.includes('lorentz') ||
    hay.includes('biot-savart') ||
    hay.includes('bolak-balik') ||
    hay.includes('induktor') ||
    hay.includes('kapasitor') ||
    hay.includes('redoks') ||
    hay.includes('elektrokimia') ||
    hay.includes('sel volta') ||
    hay.includes('elektrolisis') ||
    hay.includes('listrik dinamis') ||
    hay.includes('listrik statis') ||
    hay.includes('hukum ohm') ||
    hay.includes('rangkaian seri') ||
    hay.includes('rangkaian paralel')
  ) {
    return 'electric_circuit';
  }

  // P. Fisika SMA / SMP - Dinamika Gerak & Kinematika Newton
  if (
    hay.includes('kinematika') ||
    hay.includes('glb') ||
    hay.includes('glbb') ||
    hay.includes('hukum gerak') ||
    hay.includes('hukum newton') ||
    hay.includes('kelembaman') ||
    hay.includes('gaya gesek') ||
    hay.includes('gaya aksi reaksi') ||
    hay.includes('f = m')
  ) {
    return 'newton_dynamics';
  }

  // Q. Matematika SMA / SMP - Vektor, Program Linear, Matriks, Deret & Aljabar Kartesius
  if (
    hay.includes('program linear') ||
    hay.includes('vektor') ||
    hay.includes('matriks') ||
    hay.includes('determinan') ||
    hay.includes('deret') ||
    hay.includes('barisan') ||
    hay.includes('aljabar') ||
    hay.includes('plsv') ||
    hay.includes('ptlsv') ||
    hay.includes('spldv') ||
    hay.includes('kartesius') ||
    hay.includes('gradien') ||
    hay.includes('persamaan linear') ||
    hay.includes('fungsi kuadrat')
  ) {
    return 'cartesian_linear';
  }

  // R. Matematika SMA / SMP - Pythagoras
  if (
    hay.includes('pythagoras') ||
    hay.includes('hipotenusa') ||
    hay.includes('tripel pythagoras')
  ) {
    return 'pythagoras';
  }

  // S. Fisika SMA / SMP - Tekanan Zat, Fluida & Pascal
  if (
    hay.includes('tekanan zat') ||
    hay.includes('hukum pascal') ||
    hay.includes('hidrostatis') ||
    hay.includes('archimedes') ||
    hay.includes('dongkrak hidrolik') ||
    hay.includes('bejana berhubungan')
  ) {
    return 'pressure_pascal';
  }

  // T. Biologi SMA / SMP - Sistem Peredaran Darah
  if (
    hay.includes('peredaran darah') ||
    hay.includes('jantung') ||
    hay.includes('golongan darah') ||
    hay.includes('aorta') ||
    hay.includes('eritrosit') ||
    hay.includes('leukosit')
  ) {
    return 'blood_circulation';
  }

  // U. Fisika SMA / SMP - Getaran & Gelombang Bunyi Doppler
  if (
    hay.includes('getaran') ||
    hay.includes('gelombang') ||
    hay.includes('efek doppler') ||
    hay.includes('resonansi') ||
    (hay.includes('frekuensi') && !hay.includes('data')) ||
    (hay.includes('bunyi') && !hay.includes('pancasila'))
  ) {
    return 'wave_sound';
  }

  // V. PKn SMA / SMP - Pancasila, UUD, Hukum, HAM, Bhinneka
  if (
    hay.includes('pancasila') ||
    hay.includes('garuda') ||
    hay.includes('sila') ||
    hay.includes('bhinneka') ||
    hay.includes('integrasi nasional') ||
    hay.includes('sistem hukum') ||
    hay.includes('hak asasi manusia') ||
    hay.includes('peradilan')
  ) {
    return 'pancasila_shield';
  }

  // W. Sosiologi & IPS SMA / SMP - Gotong Royong, Sosiologi, Konflik, Stratifikasi
  if (
    hay.includes('sosiologi') ||
    hay.includes('stratifikasi') ||
    hay.includes('diferensiasi') ||
    hay.includes('ketimpangan sosial') ||
    hay.includes('konflik') ||
    hay.includes('gotong royong') ||
    hay.includes('toleransi') ||
    hay.includes('asean')
  ) {
    return 'civics_gotong_royong';
  }

  // X. Bahasa Indonesia SMA / SMP - Teks Ilmiah, LHO, Eksposisi, Resensi, Drama, Lamaran, Editorial, SPOK
  if (
    hay.includes('lho') ||
    hay.includes('eksposisi') ||
    hay.includes('resensi') ||
    hay.includes('drama') ||
    hay.includes('lamaran pekerjaan') ||
    hay.includes('editorial') ||
    hay.includes('spok') ||
    hay.includes('kalimat') ||
    hay.includes('teks') ||
    hay.includes('tata bahasa')
  ) {
    return 'spok_sentence';
  }

  // Y. Informatika SMP - Flowchart, Pseudocode, Jaringan & Database
  if (
    hay.includes('flowchart') ||
    hay.includes('pseudocode') ||
    hay.includes('jaringan komputer') ||
    hay.includes('topologi') ||
    hay.includes('basis data') ||
    hay.includes('database') ||
    hay.includes('keamanan siber')
  ) {
    return 'flowchart_logic';
  }

  // Z. Sejarah & Garis Waktu
  if (
    hay.includes('praaksara') ||
    hay.includes('kebangkitan nasional') ||
    hay.includes('sumpah pemuda') ||
    hay.includes('sejarah') ||
    hay.includes('majapahit') ||
    hay.includes('proklamasi')
  ) {
    return 'history_timeline';
  }

  // ==========================================================================
  // 4. MATERI SEKOLAH DASAR (SD) & SAINS DASAR
  // ==========================================================================
  // Geometri Dimensi 3 / Bangun Datar
  if (
    hay.includes('geometri dimensi tiga') ||
    hay.includes('dimensi tiga') ||
    hay.includes('bangun datar') ||
    hay.includes('bangun ruang') ||
    hay.includes('persegi') ||
    hay.includes('lingkaran') ||
    hay.includes('segitiga') ||
    hay.includes('keliling')
  ) {
    return 'math_geometry_shapes';
  }

  // Peluang & Pencacahan
  if (
    hay.includes('kaidah pencacahan') ||
    hay.includes('permutasi') ||
    hay.includes('kombinasi') ||
    hay.includes('peluang')
  ) {
    return 'math_counting';
  }

  // Jam Analog & Waktu
  if (
    hay.includes('jam analog') ||
    hay.includes('membaca jam') ||
    hay.includes('pukul ') ||
    (hay.includes('menit') && !hay.includes('menentukan')) ||
    hay.includes('detik')
  ) {
    return 'math_clock_time';
  }

  // Pecahan & Aritmetika
  if (
    hay.includes('pecahan') ||
    hay.includes('desimal') ||
    hay.includes('persen') ||
    hay.includes('pembilang') ||
    hay.includes('penyebut')
  ) {
    return 'math_arithmetic';
  }

  // Bilangan Cacah & Berhitung
  if (
    hay.includes('bilangan cacah') ||
    hay.includes('angka 1-10') ||
    hay.includes('nilai tempat') ||
    hay.includes('membilang') ||
    hay.includes('cacah')
  ) {
    return 'math_counting';
  }

  // Penjumlahan & Pengurangan SD
  if (
    hay.includes('penjumlahan') ||
    hay.includes('pengurangan') ||
    hay.includes('bilangan negatif') ||
    hay.includes('garis bilangan') ||
    (hay.includes('tambah') && hay.includes('kurang'))
  ) {
    return 'math_addition_subtraction';
  }

  // Perkalian & Pembagian SD
  if (
    hay.includes('perkalian') ||
    hay.includes('pembagian') ||
    hay.includes('kpk') ||
    hay.includes('fpb')
  ) {
    return 'math_multiplication_division';
  }

  // Diagram Batang & Statistik SD
  if (
    hay.includes('diagram batang') ||
    hay.includes('statistik') ||
    hay.includes('skala peta')
  ) {
    return 'math_data_charts';
  }

  // Tata Surya SD
  if (
    hay.includes('tata surya') ||
    hay.includes('planet') ||
    hay.includes('revolusi bumi') ||
    hay.includes('gerhana')
  ) {
    return 'solar_system';
  }

  // Siklus Air SD
  if (
    hay.includes('siklus air') ||
    hay.includes('kondensasi') ||
    hay.includes('evaporasi') ||
    hay.includes('presipitasi')
  ) {
    return 'water_cycle';
  }

  // Fotosintesis & Jaringan Tumbuhan
  if (
    hay.includes('fotosintesis') ||
    hay.includes('klorofil') ||
    hay.includes('jaringan tumbuhan') ||
    hay.includes('xilem') ||
    hay.includes('floem')
  ) {
    return 'photosynthesis';
  }

  // Pertumbuhan Tanaman SD (Dilindungi ketat agar TIDAK mendeteksi "pertumbuhan eksponensial")
  if (
    hay.includes('bagian tumbuhan') ||
    hay.includes('bunga sempurna') ||
    hay.includes('tanaman') ||
    hay.includes('vegetatif') ||
    hay.includes('penyerbukan') ||
    (hay.includes('tumbuhan') && !hay.includes('pertumbuhan')) ||
    hay.includes('daun hijau')
  ) {
    return 'science_plants_growth';
  }

  // Daur Hidup & Metamorfosis SD
  if (
    hay.includes('metamorfosis') ||
    hay.includes('daur hidup') ||
    hay.includes('kupu-kupu') ||
    hay.includes('kepompong')
  ) {
    return 'science_metamorphosis';
  }

  // Rantai Makanan & Keanekaragaman Ekosistem SD
  if (
    hay.includes('rantai makanan') ||
    hay.includes('keanekaragaman hayati') ||
    hay.includes('jaring-jaring') ||
    hay.includes('ekosistem') ||
    hay.includes('herbivora') ||
    hay.includes('karnivora')
  ) {
    return 'science_food_chain';
  }

  // Hewan & Habitat SD
  if (
    hay.includes('hewan') ||
    hay.includes('habitat') ||
    hay.includes('ovipar') ||
    hay.includes('vivipar')
  ) {
    return 'science_animals_habitat';
  }

  // Wujud Benda SD
  if (
    hay.includes('wujud benda') ||
    hay.includes('mencair') ||
    hay.includes('membeku')
  ) {
    return 'science_matter_states';
  }

  // Anggota Tubuh & Panca Indra SD
  if (
    hay.includes('panca indra') ||
    hay.includes('anggota tubuh') ||
    hay.includes('pernapasan') ||
    hay.includes('paru-paru') ||
    hay.includes('pencernaan')
  ) {
    return 'science_human_body';
  }

  // Bahasa SD
  if (
    hay.includes('huruf vokal') ||
    hay.includes('huruf a-z') ||
    hay.includes('abjad') ||
    hay.includes('konsonan')
  ) {
    return 'language_alphabet_vocab';
  }

  if (
    hay.includes('fabel') ||
    hay.includes('dongeng') ||
    hay.includes('puisi') ||
    hay.includes('pantun') ||
    hay.includes('cerita')
  ) {
    return 'language_story_fabel';
  }

  // Koding Scratch SD
  if (
    hay.includes('scratch') ||
    hay.includes('koding balok')
  ) {
    return 'informatics_scratch';
  }

  return 'classroom_chalkboard';
}

export interface ITopicStoryScene {
  chapter: string;
  title: string;
  narration: string;
  badge: string;
  icon: string;
  highlightText: string;
}

export function getTopicStoryScenes(
  type: VisualDiagramType,
  topic?: {
    id?: string;
    title?: string;
    summary?: string;
    badge?: string;
    points?: string[];
    keyFormulaOrConcept?: string;
    funFact?: string;
  }
): ITopicStoryScene[] {
  switch (type) {
    case 'math_counting':
      return [
        {
          chapter: 'Babak 1',
          title: 'Mengenal Angka 1 sampai 3',
          narration: '🍎 Halo teman pintar! Perhatikan 10 kartu angka pastel di layar. Kita mulai berhitung dari angka 1 sampai 3! Lihat buah apel segar di keranjang yang berbaris rapi!',
          badge: 'Bilangan 1 - 3',
          icon: '🍎',
          highlightText: 'Menghubungkan angka dengan benda nyata',
        },
        {
          chapter: 'Babak 2',
          title: 'Menghitung Lanjut 4 sampai 6',
          narration: '🍊 Sekarang kita lanjut berhitung angka 4 sampai 6! Lihat buah panen di keranjang bertambah banyak, melambangkan jumlah benda nyata di sekitarmu!',
          badge: 'Bilangan 4 - 6',
          icon: '🍊',
          highlightText: 'Jumlah benda bertambah banyak',
        },
        {
          chapter: 'Babak 3',
          title: 'Kelinci di Garis Bilangan 7-10',
          narration: '🐇 Perhatikan kelinci lucu yang melompat di atas garis bilangan! Semakin melompat ke kanan menuju angka 7 sampai 10, jumlahnya semakin bertambah besar!',
          badge: 'Garis Bilangan',
          icon: '🐇',
          highlightText: 'Urutan bilangan makin ke kanan makin besar',
        },
        {
          chapter: 'Babak 4',
          title: '10 Apel Panen Sempurna!',
          narration: '🎉 Luar biasa! Sepuluh apel panen sudah terkumpul penuh. Kamu sudah menguasai bilangan cacah 1 sampai 10 dengan sempurna! Siap untuk tantangan kuis!',
          badge: 'Tuntas Juara',
          icon: '🌟',
          highlightText: 'Kuasai angka 1 sampai 10',
        },
      ];

    case 'math_addition_subtraction':
      return [
        {
          chapter: 'Babak 1',
          title: 'Penjumlahan Menggabungkan Benda',
          narration: '➕ Penjumlahan adalah menggabungkan benda! Lihat di layar, piring kiri berisi 3 buah apel, dan piring kanan berisi 2 buah jeruk segar.',
          badge: 'Konsep Tambah (+)',
          icon: '🍎',
          highlightText: 'Penggabungan dua kelompok benda',
        },
        {
          chapter: 'Babak 2',
          title: 'Menghitung Total Hasil Tambah',
          narration: '🧺 Ketika kedua piring digabungkan ke keranjang tengah, jumlah buah menjadi 3 ditambah 2 sama dengan 5 buah panen yang manis!',
          badge: '3 + 2 = 5',
          icon: '🧺',
          highlightText: 'Hasil penggabungan bertambah banyak',
        },
        {
          chapter: 'Babak 3',
          title: 'Pengurangan Mengambil Bagian',
          narration: '➖ Sekarang perhatikan pengurangan! Jika kamu memiliki 5 buah, lalu 2 buah dimakan kelinci lucu, sisanya menjadi 3 buah utuh!',
          badge: '5 - 2 = 3',
          icon: '🐇',
          highlightText: 'Pengurangan membuat jumlah berkurang',
        },
        {
          chapter: 'Babak 4',
          title: 'Kunci Cepat Operasi Hitung',
          narration: '🎯 Kuncinya sangat mudah: tanda tambah berarti benda bertambah banyak, tanda kurang berarti benda berkurang. Hebat sekali!',
          badge: 'Kunci Pintar',
          icon: '🎯',
          highlightText: 'Lancar berhitung tambah dan kurang',
        },
      ];

    case 'math_geometry_shapes':
      return [
        {
          chapter: 'Babak 1',
          title: 'Persegi & 4 Sisi Rapi',
          narration: '📐 Ayo amati bangun datar di layar! Pertama ada Persegi dengan 4 sisi sama panjang dan 4 sudut siku-siku rapi seperti jendela kamarmu!',
          badge: 'Persegi (Bujur Sangkar)',
          icon: '🟦',
          highlightText: '4 sisi sama panjang & 4 sudut siku-siku',
        },
        {
          chapter: 'Babak 2',
          title: 'Segitiga Kokoh Tiga Sudut',
          narration: '🔺 Kedua ada Segitiga dengan 3 sisi kokoh dan 3 sudut, seperti potongan kue lezat atau atap rumah panggung tradisional!',
          badge: 'Segitiga',
          icon: '🔺',
          highlightText: '3 sisi dan 3 sudut lancip/siku-siku',
        },
        {
          chapter: 'Babak 3',
          title: 'Lingkaran Mulus Tanpa Sudut',
          narration: '🔵 Ketiga ada Lingkaran mulus tanpa sudut siku-siku, melengkung sempurna seperti roda gerobak dan koin uang saku!',
          badge: 'Lingkaran',
          icon: '🔵',
          highlightText: 'Garis lengkung tertutup dengan titik pusat',
        },
        {
          chapter: 'Babak 4',
          title: 'Mengenal Bentuk di Sekitar Kita',
          narration: '✨ Sekarang kamu bisa mengenali aneka bentuk geometri pada buku, meja, dan bangunan di seluruh penjuru desa RadenWorld!',
          badge: 'Wawasan Nyata',
          icon: '✨',
          highlightText: 'Bentuk geometri ada di kehidupan nyata',
        },
      ];

    case 'math_clock_time':
      return [
        {
          chapter: 'Babak 1',
          title: 'Mengenal Jarum Jam & Menit',
          narration: '⏰ Tik-tok! Amati jam dinding kayu ceria di layar. Jarum pendek berwarna cokelat menunjukkan Jam, dan jarum panjang biru menunjukkan Menit.',
          badge: 'Jarum Jam & Menit',
          icon: '⏰',
          highlightText: 'Jarum pendek = Jam, Jarum panjang = Menit',
        },
        {
          chapter: 'Babak 2',
          title: 'Membaca Jam Tepat (O\'Clock)',
          narration: '🕒 Ketika jarum panjang berada tepat di angka 12, dan jarum pendek di angka 7, itu berarti tepat pukul 07.00 pagi, saatnya bersiap belajar!',
          badge: 'Pukul 07.00 Pagi',
          icon: '🕒',
          highlightText: 'Jarum panjang di 12 = waktu tepat',
        },
        {
          chapter: 'Babak 3',
          title: 'Hitungan Menit & Durasi Waktu',
          narration: '⏳ Satu putaran penuh jarum menit adalah 60 menit atau 1 jam. Sedangkan satu hari penuh berputar dua kali menjadi 24 jam!',
          badge: '1 Jam = 60 Menit',
          icon: '⏳',
          highlightText: '60 detik = 1 menit, 60 menit = 1 jam',
        },
        {
          chapter: 'Babak 4',
          title: 'Disiplin Waktu Anak Hebat',
          narration: '🌟 Menghargai waktu membuat kita menjadi anak berprestasi, selalu tepat waktu belajar, beribadah, dan beristirahat cukup!',
          badge: 'Disiplin Juara',
          icon: '🌟',
          highlightText: 'Disiplin waktu kunci kesuksesan',
        },
      ];

    case 'math_multiplication_division':
      return [
        {
          chapter: 'Babak 1',
          title: 'Perkalian Penjumlahan Berulang',
          narration: '✖️ Perkalian adalah penjumlahan berulang yang cepat! Lihat 3 toples permen manis yang berjejer rapi di atas meja kayu.',
          badge: 'Konsep Kali (×)',
          icon: '🍬',
          highlightText: 'Penjumlahan berulang kelompok benda',
        },
        {
          chapter: 'Babak 2',
          title: '3 Toples × 4 Permen = 12',
          narration: '🍬 Setiap toples berisi 4 butir permen. Berarti 3 dikali 4 sama dengan 4 ditambah 4 ditambah 4, hasilnya 12 butir permen!',
          badge: '3 × 4 = 12',
          icon: '🍬',
          highlightText: 'Hitung cepat kelipatan bilangan',
        },
        {
          chapter: 'Babak 3',
          title: 'Pembagian Membagi Sama Rata',
          narration: '➗ Sedangkan Pembagian adalah membagi sama rata secara adil! 12 permen dibagikan ke 3 anak, masing-masing mendapat 4 permen manis!',
          badge: '12 ÷ 3 = 4',
          icon: '⚖️',
          highlightText: 'Pembagian adil sama banyak',
        },
        {
          chapter: 'Babak 4',
          title: 'Keadilan Berbagi Sehari-Hari',
          narration: '🤝 Konsep matematika ini melatih kita untuk selalu jujur dan adil saat berbagi rezeki dan makanan kepada sesama teman!',
          badge: 'Keadilan Luhur',
          icon: '🤝',
          highlightText: 'Berhitung cermat dan berbagi adil',
        },
      ];

    case 'math_data_charts':
      return [
        {
          chapter: 'Babak 1',
          title: 'Mengenal Diagram Batang',
          narration: '📊 Lihat diagram batang warna-warni yang tumbuh di layar! Setiap batang mewakili jumlah data hasil pengamatan nyata.',
          badge: 'Diagram Batang',
          icon: '📊',
          highlightText: 'Visualisasi data grafik batang vertikal',
        },
        {
          chapter: 'Babak 2',
          title: 'Membaca Data Tertinggi & Terendah',
          narration: '📈 Batang hijau paling tinggi menunjukkan buah apel yang paling disukai siswa, sedangkan batang jingga menunjukkan buah jeruk.',
          badge: 'Data Favorit',
          icon: '📈',
          highlightText: 'Batang tertinggi = frekuensi terbanyak',
        },
        {
          chapter: 'Babak 3',
          title: 'Sumbu Data & Skala Angka',
          narration: '📏 Sumbu tegak menunjukkan angka jumlah frekuensi, dan sumbu mendatar menunjukkan nama jenis buah atau kategori barang.',
          badge: 'Sumbu X & Y',
          icon: '📏',
          highlightText: 'Sumbu vertikal frekuensi, horizontal kategori',
        },
        {
          chapter: 'Babak 4',
          title: 'Pintar Menganalisis Informasi',
          narration: '💡 Dengan diagram batang, membaca data statistik menjadi super cepat, jelas, dan sangat mudah dipahami hanya dalam sekali lihat!',
          badge: 'Analisis Cerdas',
          icon: '💡',
          highlightText: 'Data teratur mudah dianalisis',
        },
      ];

    case 'science_plants_growth':
      return [
        {
          chapter: 'Babak 1',
          title: 'Benih Kecil Mulai Tertanam',
          narration: '🌱 Petualangan dimulai dari sebiji benih kecil di dalam tanah yang gembur. Sirami dengan air bersih dan biarkan ia menyerap kelembapan.',
          badge: 'Benih Tertanam',
          icon: '🌱',
          highlightText: 'Kebutuhan tanah gembur & air bersih',
        },
        {
          chapter: 'Babak 2',
          title: 'Berkecambah & Tumbuh Akar',
          narration: '💧 Butiran air meresap, membuat benih berkecambah! Akar putih mulai menembus tanah ke bawah mencari air dan mineral subur.',
          badge: 'Perkecambahan',
          icon: '💧',
          highlightText: 'Akar tumbuh ke bawah menyerap nutrisi',
        },
        {
          chapter: 'Babak 3',
          title: 'Batang & Daun Hijau Muncul',
          narration: '🌿 Batang hijau tumbuh ke atas menembus permukaan tanah menyambut sinar mentari, lalu membuka daun-daun kecil yang segar!',
          badge: 'Tunas Daun',
          icon: '🌿',
          highlightText: 'Batang naik menuju sinar matahari',
        },
        {
          chapter: 'Babak 4',
          title: 'Bunga Mekar & Berbuah Lezat',
          narration: '🌸 Tanaman kini berbunga indah dan menghasilkan buah lezat. Rawatlah tanaman di sekitarmu agar bumi tetap asri dan sejuk!',
          badge: 'Bunga & Buah',
          icon: '🌸',
          highlightText: 'Tanaman dewasa menghasilkan oksigen & buah',
        },
      ];

    case 'science_animals_habitat':
      return [
        {
          chapter: 'Babak 1',
          title: 'Habitat Hewan Darat',
          narration: '🐾 Alam semesta terbagi menjadi 3 tempat tinggal utama hewan! Pertama, habitat Darat tempat singa, sapi, dan kelinci berjalan.',
          badge: 'Habitat Darat',
          icon: '🦁',
          highlightText: 'Hewan bernapas dengan paru-paru di daratan',
        },
        {
          chapter: 'Babak 2',
          title: 'Habitat Hewan Air',
          narration: '🐟 Kedua, habitat Air tempat ikan, lumba-lumba, dan kepiting berenang bebas di danau air tawar maupun samudra asin.',
          badge: 'Habitat Air',
          icon: '🐟',
          highlightText: 'Hewan bernapas dengan insang di perairan',
        },
        {
          chapter: 'Babak 3',
          title: 'Habitat Hewan Udara',
          narration: '🦅 Ketiga, habitat Udara tempat burung elang dan burung gereja membentangkan sayapnya melayang anggun di angkasa.',
          badge: 'Habitat Angkasa',
          icon: '🦅',
          highlightText: 'Burung beradaptasi dengan pundi-pundi udara',
        },
        {
          chapter: 'Babak 4',
          title: 'Adaptasi Sempurna di Alam',
          narration: '🌏 Setiap hewan memiliki ciri tubuh khusus yang sempurna agar dapat bertahan hidup dan mencari makan di habitat aslinya!',
          badge: 'Harmoni Alam',
          icon: '🌏',
          highlightText: 'Ciri khusus hewan sesuai tempat tinggal',
        },
      ];

    case 'science_metamorphosis':
      return [
        {
          chapter: 'Babak 1',
          title: 'Telur Kecil di Balik Daun',
          narration: '🥚 Keajaiban metamorfosis sempurna! Dimulai dari sebutir telur mungil yang menempel dengan aman di balik daun tanaman hijau.',
          badge: 'Fase Telur',
          icon: '🥚',
          highlightText: 'Tahap awal telur menempel pada daun',
        },
        {
          chapter: 'Babak 2',
          title: 'Ulat Lapar Makan Daun',
          narration: '🐛 Telur menetas menjadi ulat lapar yang rajin memakan daun untuk mengumpulkan energi dan nutrisi pertumbuhan tubuhnya.',
          badge: 'Fase Larva (Ulat)',
          icon: '🐛',
          highlightText: 'Larva mengumpulkan cadangan nutrisi',
        },
        {
          chapter: 'Babak 3',
          title: 'Kepompong yang Tenang Berpuasa',
          narration: '🍃 Ulat membungkus dirinya menjadi kepompong yang tenang, mengalami perubahan sel-sel tubuh yang luar biasa di dalamnya!',
          badge: 'Fase Pupa',
          icon: '🍃',
          highlightText: 'Transformasi biologis di dalam kepompong',
        },
        {
          chapter: 'Babak 4',
          title: 'Kupu-Kupu Bersayap Indah!',
          narration: '🦋 Kepompong terbuka! Muncullah kupu-kupu bersayap elok warna-warni yang terbang anggun menghisap madu nektar bunga!',
          badge: 'Imago Sempurna',
          icon: '🦋',
          highlightText: 'Kupu-kupu dewasa membantu penyerbukan',
        },
      ];

    case 'science_food_chain':
      return [
        {
          chapter: 'Babak 1',
          title: 'Produsen: Padi & Tumbuhan Hijau',
          narration: '🌾 Rantai makanan dimulai dari Produsen! Tumbuhan padi hijau mengolah energi sinar matahari menjadi makanan melalui fotosintesis.',
          badge: 'Produsen',
          icon: '🌾',
          highlightText: 'Tumbuhan menghasilkan energi makanan sendiri',
        },
        {
          chapter: 'Babak 2',
          title: 'Konsumen 1: Belalang & Tikus',
          narration: '🦗 Tumbuhan dimakan oleh Konsumen Tingkat 1, yaitu belalang dan hewan herbivora yang membutuhkan energi dari daun padi.',
          badge: 'Konsumen 1',
          icon: '🦗',
          highlightText: 'Hewan pemakan tumbuhan (herbivora)',
        },
        {
          chapter: 'Babak 3',
          title: 'Konsumen Puncak: Burung Elang',
          narration: '🦅 Katak memakan belalang, lalu dimakan ular, dan di puncak ada Burung Elang karnivora perkasa dengan cakar tajam!',
          badge: 'Konsumen Puncak',
          icon: '🦅',
          highlightText: 'Predator puncak menjaga populasi ekosistem',
        },
        {
          chapter: 'Babak 4',
          title: 'Pengurai Jamur Menyehatkan Tanah',
          narration: '🍄 Ketika predator mati, jamur pengurai menguraikan jasadnya kembali menjadi zat hara subur bagi tanah sawah. Ekosistem seimbang!',
          badge: 'Dekomposer',
          icon: '🍄',
          highlightText: 'Dekomposer mengembalikan nutrisi ke tanah',
        },
      ];

    case 'science_matter_states':
      return [
        {
          chapter: 'Babak 1',
          title: 'Zat Padat Bentuk Tetap',
          narration: '🧊 Tiga wujud zat di alam! Pertama Zat Padat seperti es batu yang memiliki bentuk dan volume tetap tidak berubah saat dipindahkan.',
          badge: 'Zat Padat',
          icon: '🧊',
          highlightText: 'Partikel tersusun rapat & bentuk tetap',
        },
        {
          chapter: 'Babak 2',
          title: 'Zat Cair Mengalir',
          narration: '💧 Kedua Zat Cair seperti air minum segar yang mengalir, bentuknya berubah mengikuti wadah tetapi volumenya tetap sama!',
          badge: 'Zat Cair',
          icon: '💧',
          highlightText: 'Mengalir & bentuk mengikuti bentuk wadah',
        },
        {
          chapter: 'Babak 3',
          title: 'Zat Gas Memenuhi Ruangan',
          narration: '💨 Ketiga Zat Gas seperti uap air mendidih yang partikelnya bergerak bebas ke segala arah mengisi seluruh ruangan wadah!',
          badge: 'Zat Gas',
          icon: '💨',
          highlightText: 'Bentuk & volume berubah bebas memenuhi wadah',
        },
        {
          chapter: 'Babak 4',
          title: 'Perubahan Wujud Karena Suhu',
          narration: '🌡️ Suhu mengubah wujud zat: es padat mencair menjadi air, dan jika dipanaskan terus akan menguap menjadi gas uap air!',
          badge: 'Mencair & Menguap',
          icon: '🌡️',
          highlightText: 'Kalor mengubah padat, cair, dan gas',
        },
      ];

    case 'science_human_body':
      return [
        {
          chapter: 'Babak 1',
          title: 'Mata Penglihatan & Telinga',
          narration: '👁️ Tubuh kita dianugerahi 5 indra luar biasa! Mata untuk melihat warna dunia, dan Telinga untuk mendengar suara merdu di sekitarmu.',
          badge: 'Mata & Telinga',
          icon: '👁️',
          highlightText: 'Penglihatan visual & pendengaran audio',
        },
        {
          chapter: 'Babak 2',
          title: 'Hidung Penciuman & Lidah Pengecap',
          narration: '👃 Hidung untuk membau aroma sedap masakan, dan Lidah untuk mengecap rasa manis, asin, gurih, dan asam pada makanan sehat.',
          badge: 'Hidung & Lidah',
          icon: '👃',
          highlightText: 'Penciuman aroma & pengecapan aneka rasa',
        },
        {
          chapter: 'Babak 3',
          title: 'Kulit Peraba Sensitif',
          narration: '✋ Kulit sebagai indra peraba yang merasakan hangat sinar mentari, dinginnya es, serta lembutnya bulu hewan peliharaanmu.',
          badge: 'Kulit Peraba',
          icon: '✋',
          highlightText: 'Sentuhan, suhu, dan tekanan permukaan',
        },
        {
          chapter: 'Babak 4',
          title: 'Merawat Anugerah Kesehatan Tubuh',
          narration: '✨ Panca indra adalah anugerah Tuhan yang sangat berharga. Rawatlah kebersihan dan kesehatan tubuhmu dengan rajin mandi dan makan bergizi!',
          badge: 'Kesehatan Tubuh',
          icon: '✨',
          highlightText: 'Syukuri & rawat kesehatan panca indra',
        },
      ];

    case 'language_alphabet_vocab':
      return [
        {
          chapter: 'Babak 1',
          title: '5 Huruf Vokal A, I, U, E, O',
          narration: '🔤 Kunci membaca dan menulis bahasa Indonesia! Ada 5 huruf vokal utama: A, I, U, E, dan O yang memberikan suara pada kata.',
          badge: 'Huruf Vokal',
          icon: '🔤',
          highlightText: 'Vokal utama: A, I, U, E, O',
        },
        {
          chapter: 'Babak 2',
          title: 'Menggabungkan Huruf Jadi Suku Kata',
          narration: '🐱 Huruf konsonan bergabung dengan vokal membentuk suku kata: K-U berbunyi KU, C-I-N-G berbunyi CING, menjadi kata KUCING!',
          badge: 'Suku Kata',
          icon: '🐱',
          highlightText: 'Penggabungan konsonan dan vokal',
        },
        {
          chapter: 'Babak 3',
          title: 'Menyusun Kata Menjadi Makna',
          narration: '📚 Menyusun suku kata menjadi kata yang bermakna melatih otak kita untuk berpikir logis, runtut, dan berbicara santun.',
          badge: 'Kosakata Kaya',
          icon: '📚',
          highlightText: 'Kosakata membentuk kalimat bermakna',
        },
        {
          chapter: 'Babak 4',
          title: 'Membaca Membuka Cakrawala Dunia',
          narration: '✨ Rajin membaca buku memperkaya kosakata dan wawasanmu, membuka pintu jendela ilmu pengetahuan di seluruh semesta!',
          badge: 'Gemar Membaca',
          icon: '✨',
          highlightText: 'Buku adalah jendela ilmu pengetahuan',
        },
      ];

    case 'language_story_fabel':
      return [
        {
          chapter: 'Babak 1',
          title: 'Mengenal Dongeng Fabel Hewan',
          narration: '📖 Dongeng fabel adalah cerita seru di mana tokoh hewan dapat berbicara, berpikir, dan bertingkah laku layaknya manusia bijak!',
          badge: 'Dongeng Fabel',
          icon: '📖',
          highlightText: 'Kisah fiksi bertokoh satwa bijaksana',
        },
        {
          chapter: 'Babak 2',
          title: 'Kancil yang Cerdik Berpikir',
          narration: '🦊 Tokoh Kancil yang cerdik mengajarkan kita untuk selalu menggunakan akal pikiran yang pintar dan tenang saat menghadapi kesulitan.',
          badge: 'Akal Pintar',
          icon: '🦊',
          highlightText: 'Kecerdikan memecahkan rintangan sulit',
        },
        {
          chapter: 'Babak 3',
          title: 'Kejujuran Nilai Paling Luhur',
          narration: '🐊 Namun kepintaran tidak boleh digunakan untuk mencelakai atau menipu teman. Kejujuran adalah mahkota kemuliaan sejati!',
          badge: 'Kejujuran Mulia',
          icon: '💎',
          highlightText: 'Kejujuran di atas segalanya',
        },
        {
          chapter: 'Babak 4',
          title: 'Pesan Moral Dalam Kehidupan',
          narration: '💖 Setiap cerita fabel menyimpan pesan moral berharga agar kita tumbuh menjadi anak yang berbudi pekerti luhur dan disayangi semua orang!',
          badge: 'Budi Pekerti',
          icon: '💖',
          highlightText: 'Pesan moral membentuk karakter unggul',
        },
      ];

    case 'english_kids':
      return [
        {
          chapter: 'Babak 1',
          title: 'Friendly Greetings & Say Hello!',
          narration: '🌍 Welcome to English learning! Let\'s start with friendly greetings: Good morning, Good afternoon, and Hello my dear friends!',
          badge: 'Greetings',
          icon: '👋',
          highlightText: 'Good morning & Hello friends',
        },
        {
          chapter: 'Babak 2',
          title: 'Colorful Everyday Words',
          narration: '🍎 Learn everyday colors: Apple is red, Sky is blue, and Sun is bright yellow! Colors make our world cheerful and bright!',
          badge: 'Colors & Objects',
          icon: '🍎',
          highlightText: 'Red apple, Blue sky, Yellow sun',
        },
        {
          chapter: 'Babak 3',
          title: 'Counting Numbers 1 to 10',
          narration: '🔢 Let\'s count together: One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten! Counting in English is very easy!',
          badge: 'Numbers 1 - 10',
          icon: '🔢',
          highlightText: 'Count smoothly from 1 to 10',
        },
        {
          chapter: 'Babak 4',
          title: 'Speak English Confidently',
          narration: '🎉 Practice speaking English every day, and you will be able to make friends with children from all over the world!',
          badge: 'Global Friends',
          icon: '🎉',
          highlightText: 'Practice English cheerfully every day',
        },
      ];

    case 'art_culture_jawa':
      return [
        {
          chapter: 'Babak 1',
          title: 'Mahakarya Seni Wayang Kulit',
          narration: '🎭 Warisan adi luhung Nusantara! Seni Wayang Kulit memadukan keindahan bayangan kelir, tatahan kulit kerbau, dan gamelan merdu.',
          badge: 'Wayang Kulit',
          icon: '🎭',
          highlightText: 'Seni pertunjukan bayangan adiluhung',
        },
        {
          chapter: 'Babak 2',
          title: 'Keindahan Batik Canting Tradisional',
          narration: '👘 Seni Batik Nusantara digoreskan dengan canting dan malam cair, membentuk motif sarat makna filosofis dan doa keselamatan.',
          badge: 'Batik Canting',
          icon: '👘',
          highlightText: 'Goresan malam canting bernilai tinggi',
        },
        {
          chapter: 'Babak 3',
          title: 'Harmoni Suara Musik Gamelan',
          narration: '🎵 Irama tabuhan kendang, saron, dan gong yang selaras melambangkan harmoni kebersamaan dalam hidup bermasyarakat yang damai.',
          badge: 'Gamelan Harmoni',
          icon: '🎵',
          highlightText: 'Harmoni nada mencerminkan kerukunan',
        },
        {
          chapter: 'Babak 4',
          title: 'Banggakan Budaya Luhur Nusantara',
          narration: '🇮🇩 Lestarikan budaya adiluhung warisan nenek moyang kita agar bangsa Indonesia senantiasa berkarakter mulia dan bermartabat!',
          badge: 'Cinta Budaya',
          icon: '🇮🇩',
          highlightText: 'Lestarikan warisan budaya Indonesia',
        },
      ];

    case 'informatics_scratch':
      return [
        {
          chapter: 'Babak 1',
          title: 'Koding Balok Komputer Ceria',
          narration: '💻 Selamat datang di dunia koding komputer! Koding seperti menyusun balok lego instruksi langkah demi langkah secara logis.',
          badge: 'Koding Balok',
          icon: '💻',
          highlightText: 'Instruksi bertahap logika algoritma',
        },
        {
          chapter: 'Babak 2',
          title: 'Balok Gerak Mengatur Animasi',
          narration: '🧩 Balok biru "Gerak 10 Langkah" memerintahkan karakter kucing melangkah maju di atas panggung layar dengan ceria!',
          badge: 'Gerak 10 Langkah',
          icon: '🧩',
          highlightText: 'Perintah aksi gerakan objek di layar',
        },
        {
          chapter: 'Babak 3',
          title: 'Balok Pengulangan & Logika',
          narration: '🔁 Balok kuning "Ulangi Selamanya" membuat gerakan animasi terus berputar mulus tanpa henti sesuai aturan program!',
          badge: 'Looping (Perulangan)',
          icon: '🔁',
          highlightText: 'Perulangan instruksi otomatis',
        },
        {
          chapter: 'Babak 4',
          title: 'Ciptakan Game & Karyamu Sendiri!',
          narration: '🚀 Dengan belajar koding sejak dini, kamu bisa menciptakan game edukasi, animasi seru, dan aplikasi karyamu sendiri di RadenWorld!',
          badge: 'Kreator Masa Depan',
          icon: '🚀',
          highlightText: 'Ciptakan karya teknologi masa depan',
        },
      ];

    case 'civics_gotong_royong':
      return [
        {
          chapter: 'Babak 1',
          title: 'Tradisi Mulia Gotong Royong',
          narration: '🤝 Berat sama dipikul, ringan sama dijinjing! Gotong royong adalah tradisi mulia bangsa Indonesia sejak zaman dahulu kala.',
          badge: 'Gotong Royong',
          icon: '🤝',
          highlightText: 'Kerja sama tulus saling membantu',
        },
        {
          chapter: 'Babak 2',
          title: 'Kerja Bakti di Lingkungan Warga',
          narration: '🧹 Warga desa bekerja bakti bersama membersihkan selokan, memperbaiki jalan, dan menata lingkungan agar tetap asri dan sehat.',
          badge: 'Kerja Bakti',
          icon: '🧹',
          highlightText: 'Bahu-membahu menjaga kebersihan desa',
        },
        {
          chapter: 'Babak 3',
          title: 'Beban Berat Terasa Ringan',
          narration: '🏡 Pekerjaan yang berat dan sulit menjadi cepat selesai dan terasa ringan jika dikerjakan bersama-sama dengan hati riang gembira!',
          badge: 'Ringan Bersama',
          icon: '🏡',
          highlightText: 'Kebersamaan mempermudah pekerjaan sulit',
        },
        {
          chapter: 'Babak 4',
          title: 'Kerukunan & Persatuan Abadi',
          narration: '💖 Gotong royong menumbuhkan rasa persaudaraan yang erat dan kerukunan abadi di lingkungan tempat tinggal kita!',
          badge: 'Persatuan Kokoh',
          icon: '💖',
          highlightText: 'Persatuan kokoh bangsa Indonesia',
        },
      ];
    case 'photosynthesis':
      return [
        {
          chapter: 'Babak 1',
          title: 'Matahari & Foton Cahaya',
          narration: '☀️ Pagi hari tiba! Sinar mentari memancarkan energi foton cahaya ke bumi. Butiran klorofil pada daun hijau bersiap menangkap energi surya ini.',
          badge: 'Energi Cahaya',
          icon: '☀️',
          highlightText: 'Penyerapan energi foton mentari',
        },
        {
          chapter: 'Babak 2',
          title: 'Akar Menyerap Air (H₂O)',
          narration: '💧 Di dalam tanah, akar tanaman yang kuat menyerap molekul air (H₂O) dan mineral, lalu mengalirkannya naik melalui pembuluh xilem ke daun.',
          badge: 'Aliran Nutrisi',
          icon: '🌱',
          highlightText: 'Suplai air tanah via pembuluh xilem',
        },
        {
          chapter: 'Babak 3',
          title: 'Menghirup Karbon Dioksida (CO₂)',
          narration: '💨 Daun membuka pori-pori stomatanya untuk menghirup gas Karbon Dioksida (CO₂) dari udara. Di dalam kloroplas, reaksi kimia 6CO₂ + 6H₂O dimulai!',
          badge: 'Reaksi Kloroplas',
          icon: '🍃',
          highlightText: 'Sintesis klorofil & gas CO₂',
        },
        {
          chapter: 'Babak 4',
          title: 'Hasil: Oksigen Segar & Glukosa',
          narration: '✨ Selesai! Tumbuhan melepaskan Oksigen (O₂) segar untuk pernapasan seluruh makhluk hidup, serta menyimpan Glukosa (C₆H₁₂O₆) manis sebagai cadangan makanan.',
          badge: 'Manfaat Alam',
          icon: '🌟',
          highlightText: 'Oksigen segar + Glukosa manis',
        },
      ];
    case 'water_cycle':
      return [
        {
          chapter: 'Babak 1',
          title: 'Evaporasi Samudra Raya',
          narration: '🌊 Panas terik matahari menghangatkan permukaan samudra, danau, dan sungai. Air berubah wujud menjadi uap tak kasat mata yang terbang naik ke angkasa.',
          badge: 'Penguapan Panas',
          icon: '☀️',
          highlightText: 'Fase uap air naik ke atmosfer',
        },
        {
          chapter: 'Babak 2',
          title: 'Kondensasi Membentuk Awan',
          narration: '☁️ Di langit tinggi yang dingin, uap air mengalami kondensasi, memadat menjadi jutaan tetesan embun halus dan berkumpul membentuk gumpalan awan tebal.',
          badge: 'Awan Kondensasi',
          icon: '☁️',
          highlightText: 'Kondensasi embun jadi awan tebal',
        },
        {
          chapter: 'Babak 3',
          title: 'Presipitasi Hujan Menyiram Bumi',
          narration: '🌧️ Saat butiran air dalam awan menjadi terlalu berat untuk ditopang angin, gravitasi menariknya jatuh ke bumi sebagai hujan segar menyegarkan tanaman!',
          badge: 'Hujan Segar',
          icon: '🌧️',
          highlightText: 'Presipitasi air hujan ke tanah',
        },
        {
          chapter: 'Babak 4',
          title: 'Limpasan Sungai Kembali ke Laut',
          narration: '🏞️ Air hujan mengalir melewati lereng gunung, menyuburkan lahan sawah, mengisi aliran sungai, dan bermuara kembali ke samudra dalam siklus abadi!',
          badge: 'Siklus Abadi',
          icon: '🔄',
          highlightText: 'Aliran sungai bermuara ke samudra',
        },
      ];
    case 'solar_system':
      return [
        {
          chapter: 'Babak 1',
          title: 'Matahari Raja Tata Surya',
          narration: '☀️ Di pusat tata surya, Matahari berpijar dengan fusi hidrogen raksasa, mengendalikan gravitasi seluruh orbit planet dan memancarkan cahaya kehidupan.',
          badge: 'Pusat Gravitasi',
          icon: '☀️',
          highlightText: 'Fusi hidrogen & gravitasi utama',
        },
        {
          chapter: 'Babak 2',
          title: 'Planet Batuan Terdekat',
          narration: '🪐 Empat planet terdekat (Merkurius, Venus, Bumi, dan Mars) memiliki permukaan padat berbatu. Di Bumi, atmosfer dan air mendukung peradaban manusia!',
          badge: 'Planet Batuan',
          icon: '🌍',
          highlightText: 'Bumi, Merkurius, Venus, Mars',
        },
        {
          chapter: 'Babak 3',
          title: 'Raksasa Gas Jupiter & Saturnus',
          narration: '🌀 Melewati sabuk asteroid, kita menjumpai Jupiter dengan Bintik Merah Raksasa dan Saturnus dengan cincin es esoteris paling memukau di antariksa!',
          badge: 'Raksasa Gas',
          icon: '🪐',
          highlightText: 'Jupiter raksasa & Cincin Saturnus',
        },
        {
          chapter: 'Babak 4',
          title: 'Planet Es Terluar Uranus & Neptunus',
          narration: '❄️ Di tepi dingin tata surya, Uranus dan Neptunus berotasi membiru dengan atmosfer metana es, melengkapi keluarga 8 planet ciptaan alam semesta.',
          badge: 'Tepi Tata Surya',
          icon: '✨',
          highlightText: 'Uranus & Neptunus di batas luar',
        },
      ];
    case 'cell_structure':
      return [
        {
          chapter: 'Babak 1',
          title: 'Membran Sel Gerbang Pelindung',
          narration: '🛡️ Membran sel bertindak sebagai gerbang pintar fosfolipid berkepala ganda, memilih nutrisi penting yang boleh masuk dan membuang zat sisa sel.',
          badge: 'Pelindung Sel',
          icon: '🛡️',
          highlightText: 'Lapisan membran selektif permeabel',
        },
        {
          chapter: 'Babak 2',
          title: 'Nukleus: Ruang Kendali DNA',
          narration: '🧬 Nukleus adalah otak sel tempat kode genetik DNA tersimpan rapi, memimpin sintesis protein dan mengatur pertumbuhan sel secara presisi.',
          badge: 'Pusat Komando',
          icon: '🧬',
          highlightText: 'Inti genetik pengatur kehidupan',
        },
        {
          chapter: 'Babak 3',
          title: 'Mitokondria Pabrik Energi ATP',
          narration: '⚡ Dijuluki Powerhouse of the Cell, mitokondria membakar glukosa dan oksigen untuk menghasilkan molekul ATP, bahan bakar utama energi gerak kita!',
          badge: 'Pembangkit Listrik',
          icon: '⚡',
          highlightText: 'Respirasi seluler pembakar ATP',
        },
        {
          chapter: 'Babak 4',
          title: 'Sinergi Organel Mikroskopis',
          narration: '🔬 Ribosom, Retikulum Endoplasma, dan Badan Golgi bekerja harmonis tanpa henti menjaga miliaran sel tubuh kita tetap sehat dan berenergi!',
          badge: 'Metabolisme Tubuh',
          icon: '🔬',
          highlightText: 'Kerja sama harmonis organel sel',
        },
      ];
    case 'dna_helix':
      return [
        {
          chapter: 'Babak 1',
          title: 'Heliks Ganda Tangga Terpilin',
          narration: '🧬 Molekul Deoxyribonucleic Acid berbentuk tangga terpilin (Double Helix), menyimpan blueprint lengkap sifat fisik, kecerdasan, dan keunikanmu.',
          badge: 'Double Helix',
          icon: '🧬',
          highlightText: 'Pilin ganda kode biologis manusia',
        },
        {
          chapter: 'Babak 2',
          title: 'Pasangan Basa Adenin & Timin (A-T)',
          narration: '🔗 Basa nitrogen Adenin (A) selalu berpasangan dengan Timin (T) dihubungkan oleh 2 ikatan hidrogen yang stabil namun fleksibel saat replikasi.',
          badge: 'Pasangan A-T',
          icon: '🧩',
          highlightText: 'Dua ikatan hidrogen komplementer',
        },
        {
          chapter: 'Babak 3',
          title: 'Pasangan Guanin & Sitosin (G-C)',
          narration: '💪 Guanin (G) berpasangan erat dengan Sitosin (C) melalui 3 ikatan hidrogen kokoh, memberikan integritas struktural pada rantai kromosom.',
          badge: 'Pasangan G-C',
          icon: '⛓️',
          highlightText: 'Tiga ikatan hidrogen ekstra kuat',
        },
        {
          chapter: 'Babak 4',
          title: 'Pewarisan Karakter Antargenerasi',
          narration: '👨‍👩‍👧 DNA diwariskan dari orang tua ke anak, membuktikan keagungan biologi dan keberlanjutan garis keturunan seluruh generasi di bumi!',
          badge: 'Garis Keturunan',
          icon: '🌟',
          highlightText: 'Pewarisan sifat genetik abadi',
        },
      ];
    case 'pythagoras':
      return [
        {
          chapter: 'Babak 1',
          title: 'Segitiga Siku-Siku Istimewa',
          narration: '📐 Di Yunani kuno, filsuf Pythagoras meneliti segitiga bersudut tegak 90 derajat yang tersusun atas dua sisi siku-siku alas (a) dan tinggi (b).',
          badge: 'Sudut Siku 90°',
          icon: '📐',
          highlightText: 'Dua sisi penyiku a dan b',
        },
        {
          chapter: 'Babak 2',
          title: 'Hipotenusa Sisi Miring (c)',
          narration: '📏 Sisi miring (c) yang menghadap tepat di depan sudut siku-siku selalu merupakan sisi paling panjang di antara ketiga sisi segitiga.',
          badge: 'Sisi Terpanjang',
          icon: '📏',
          highlightText: 'Sisi miring hipotenusa terpanjang',
        },
        {
          chapter: 'Babak 3',
          title: 'Keseimbangan Luas Persegi',
          narration: '🟥 Bayangkan bujur sangkar dibangun di setiap sisi: Luas bujur sangkar a² ditambah luas b² sama persis dengan luas bujur sangkar sisi miring c² (a² + b² = c²)!',
          badge: 'Dalil Matematika',
          icon: '🔢',
          highlightText: 'Formula ajaib: a² + b² = c²',
        },
        {
          chapter: 'Babak 4',
          title: 'Fondasi Arsitektur & Teknologi',
          narration: '🏛️ Dari pembangunan Piramida megah hingga perhitungan koordinat GPS satelit modern, teorema Pythagoras adalah rumus dasar ruang dan jarak!',
          badge: 'Aplikasi Nyata',
          icon: '🏛️',
          highlightText: 'Pondasi GPS, peta & arsitektur',
        },
      ];
    case 'cartesian_linear':
      return [
        {
          chapter: 'Babak 1',
          title: 'Sumbu X & Y Koordinat Ruang',
          narration: '📊 Rene Descartes menemukan cara menghubungkan aljabar dan geometri dengan membagi bidang ruang menjadi Sumbu X mendatar dan Sumbu Y tegak.',
          badge: 'Bidang Kartesius',
          icon: '📊',
          highlightText: 'Titik temu pusat koordinat (0,0)',
        },
        {
          chapter: 'Babak 2',
          title: 'Gradien Kemiringan Garis (m)',
          narration: '📈 Gradien m adalah rasio perubahan vertikal terhadap horizontal (Δy / Δx). Nilai m menentukan seberapa curam atau landai sebuah garis lurus.',
          badge: 'Gradien Garis',
          icon: '📈',
          highlightText: 'Derajat kecuraman kemiringan m',
        },
        {
          chapter: 'Babak 3',
          title: 'Persamaan Linear (y = mx + c)',
          narration: '✏️ Nilai c adalah titik potong sumbu Y. Dengan rumus y = mx + c, kita dapat memprediksi nilai koordinat y untuk titik x mana pun secara akurat!',
          badge: 'Rumus Linear',
          icon: '✏️',
          highlightText: 'Garis lurus matematis konsisten',
        },
        {
          chapter: 'Babak 4',
          title: 'Pemodelan Sains & Keuangan',
          narration: '💼 Para ilmuwan dan analis ekonomi menggunakan garis linear untuk membaca tren kenaikan harga, laju kecepatan kendaraan, dan statistik data!',
          badge: 'Prediksi Data',
          icon: '💡',
          highlightText: 'Membaca tren pertumbuhan masa depan',
        },
      ];
    case 'trigonometry_wave':
      return [
        {
          chapter: 'Babak 1',
          title: 'Lingkaran Satuan Trigonometri',
          narration: '⭕ Bayangkan sebuah roda berputar dengan jari-jari 1 unit. Setiap sudut putaran (θ) menentukan posisi koordinat sudut segitiga di dalamnya.',
          badge: 'Lingkaran Satuan',
          icon: '⭕',
          highlightText: 'Jari-jari lingkaran R = 1 unit',
        },
        {
          chapter: 'Babak 2',
          title: 'Nilai Sinus & Kosinus Berayun',
          narration: '🔄 Proyeksi tinggi titik menghasilkan nilai Sinus, sedangkan proyeksi mendatar menghasilkan Kosinus. Nilainya berayun harmonis antara -1 hingga +1.',
          badge: 'Osilasi Sudut',
          icon: '🔄',
          highlightText: 'Nilai harmonis antara -1 dan +1',
        },
        {
          chapter: 'Babak 3',
          title: 'Lahirnya Gelombang Sinusoidal',
          narration: '🌊 Jika titik berputar ditarik sepanjang sumbu waktu, terbentuklah pola kurva gelombang sinusoidal berirama yang sangat indah dan halus!',
          badge: 'Gelombang Sinus',
          icon: '🌊',
          highlightText: 'Kurva sinusoidal lembut berkelanjutan',
        },
        {
          chapter: 'Babak 4',
          title: 'Sains Sinyal WiFi & Musik',
          narration: '📡 Gelombang sinus adalah bahasa alam semesta! Dari sinyal radio smartphone, getaran senar gitar akustik, hingga pancaran gelombang cahaya!',
          badge: 'Teknologi Gelombang',
          icon: '📡',
          highlightText: 'Dasar sinyal WiFi, radio & audio',
        },
      ];
    case 'bohr_atom':
      return [
        {
          chapter: 'Babak 1',
          title: 'Inti Atom Proton & Neutron',
          narration: '⚛️ Di pusat atom yang sangat kecil terdapat nukleus padat bermuatan positif, tersusun atas partikel Proton dan partikel netral Neutron.',
          badge: 'Inti Atom',
          icon: '⚛️',
          highlightText: 'Inti padat bermuatan positif',
        },
        {
          chapter: 'Babak 2',
          title: 'Kulit Orbit Elektron (K, L, M)',
          narration: '💫 Fisikawan Niels Bohr menemukan bahwa elektron berputar mengelilingi inti pada lintasan energi stasioner tertentu yang teratur rapi.',
          badge: 'Tingkat Energi',
          icon: '💫',
          highlightText: 'Kulit elektron stasioner teratur',
        },
        {
          chapter: 'Babak 3',
          title: 'Lompatan Kuantum Elektron',
          narration: '⚡ Saat elektron menyerap energi, ia melompat ke kulit luar. Saat kembali ke kulit dalam, ia memancarkan seberkas cahaya foton berenergi!',
          badge: 'Lompatan Kuantum',
          icon: '⚡',
          highlightText: 'Pancaran berkas foton cahaya',
        },
        {
          chapter: 'Babak 4',
          title: 'Warna-Warni Lampu Neon & Laser',
          narration: '🎆 Pancaran foton kuantum inilah yang melahirkan sinar laser presisi kedokteran, lampu LED hemat energi, dan kilauan kembang api!',
          badge: 'Cahaya Kuantum',
          icon: '🎆',
          highlightText: 'Prinsip laser & LED modern',
        },
      ];
    case 'ph_scale':
      return [
        {
          chapter: 'Babak 1',
          title: 'Dunia Larutan Asam (pH 0-6)',
          narration: '🍋 Larutan asam kaya akan ion hidrogen (H+). Contohnya air perasan jeruk lemon (pH 2), cuka apel, dan asam lambung pengolah makanan.',
          badge: 'Sifat Asam',
          icon: '🍋',
          highlightText: 'Kaya ion H+ berasa masam',
        },
        {
          chapter: 'Babak 2',
          title: 'Titik Netral Seimbang (pH 7)',
          narration: '💧 Tepat di angka pH 7, konsentrasi ion H+ dan OH- berada dalam keseimbangan sempurna. Air mineral murni bebas rasa adalah contoh alaminya.',
          badge: 'Titik Netral',
          icon: '💧',
          highlightText: 'Air murni seimbang pH 7.0',
        },
        {
          chapter: 'Babak 3',
          title: 'Dunia Larutan Basa (pH 8-14)',
          narration: '🧼 Larutan basa kaya akan ion hidroksida (OH-), terasa licin di kulit dan berasa pahit. Contohnya sabun mandi, deterjen cuci, dan obat maag.',
          badge: 'Sifat Basa',
          icon: '🧼',
          highlightText: 'Kaya ion OH- seperti sabun & antasida',
        },
        {
          chapter: 'Babak 4',
          title: 'Menjaga Keseimbangan Tubuh',
          narration: '🩸 Tubuh manusia sangat cerdas! Darah kita dijaga ketat pada pH 7.35–7.45 agar enzim dan organ tubuh dapat berfungsi dengan sempurna!',
          badge: 'Homeostasis Tubuh',
          icon: '🩺',
          highlightText: 'Menjaga pH darah tetap sehat',
        },
      ];
    case 'newton_dynamics':
      return [
        {
          chapter: 'Babak 1',
          title: 'Gaya Dorong & Tarik (F)',
          narration: '🍎 Isaac Newton merumuskan gaya sebagai interaksi dorongan atau tarikan yang dapat mengubah laju kecepatan, arah, atau bentuk benda.',
          badge: 'Hukum Gaya',
          icon: '🍎',
          highlightText: 'Interaksi dorongan & tarikan benda',
        },
        {
          chapter: 'Babak 2',
          title: 'Massa & Kelembaman Inersia (m)',
          narration: '📦 Setiap benda memiliki massa yang enggan berubah keadaan (inersia). Semakin berat massa benda, semakin besar gaya yang dibutuhkan untuk menggerakkannya.',
          badge: 'Massa Inersia',
          icon: '📦',
          highlightText: 'Kelembaman mempertahankan posisi',
        },
        {
          chapter: 'Babak 3',
          title: 'Hukum II Newton (F = m·a)',
          narration: '🏎️ Percepatan (a) sebanding lurus dengan resultan gaya dan berbanding terbalik dengan massa. Mobil balap bertenaga mesin besar akan melesat kencang!',
          badge: 'Rumus Newton',
          icon: '🏎️',
          highlightText: 'Resultan gaya: F = m dikali a',
        },
        {
          chapter: 'Babak 4',
          title: 'Peluncuran Roket ke Antariksa',
          narration: '🚀 Menggabungkan aksi-reaksi Hukum III Newton, semburan gas roket ke bawah menghasilkan dorongan terbang ke angkasa menembus gravitasi bumi!',
          badge: 'Teknologi Roket',
          icon: '🚀',
          highlightText: 'Melesat menembus orbit bumi',
        },
      ];
    case 'pancasila_shield':
      return [
        {
          chapter: 'Babak 1',
          title: 'Sila 1: Bintang Cahaya Ketuhanan',
          narration: '⭐ Bintang emas di perisai melambangkan cahaya kerohanian dari Tuhan Yang Maha Esa yang menerangi sanubari seluruh bangsa beriman.',
          badge: 'Sila Pertama',
          icon: '⭐',
          highlightText: 'Ketuhanan Yang Maha Esa',
        },
        {
          chapter: 'Babak 2',
          title: 'Sila 2: Rantai Emas Kemanusiaan',
          narration: '🔗 Mata rantai bulat dan persegi saling mengait, melambangkan pria dan wanita bersatu padu menjunjung tinggi martabat kemanusiaan yang adil dan beradab.',
          badge: 'Sila Kedua',
          icon: '🔗',
          highlightText: 'Kemanusiaan yang Adil & Beradab',
        },
        {
          chapter: 'Babak 3',
          title: 'Sila 3 & 4: Beringin & Banteng',
          narration: '🌳 Pohon beringin melambangkan persatuan teguh tempat berteduh, sedangkan kepala banteng melambangkan musyawarah mufakat penuh kekeluargaan.',
          badge: 'Sila 3 & 4',
          icon: '🌳',
          highlightText: 'Persatuan & Musyawarah Mufakat',
        },
        {
          chapter: 'Babak 4',
          title: 'Sila 5: Padi & Kapas Keadilan',
          narration: '🌾 Padi dan kapas melambangkan kecukupan pangan dan sandang bagi seluruh rakyat Indonesia tanpa kesenjangan demi kemakmuran bersama.',
          badge: 'Sila Kelima',
          icon: '🌾',
          highlightText: 'Keadilan Sosial Bagi Seluruh Rakyat',
        },
      ];
    case 'spok_sentence':
      return [
        {
          chapter: 'Babak 1',
          title: 'Subjek (S): Sang Pelaku Aksi',
          narration: '👤 Subjek adalah orang, hewan, atau benda yang melakukan tindakan dalam kalimat. Contohnya: "Raden", "Guru Kami", atau "Kucing Belang".',
          badge: 'Subjek Pelaku',
          icon: '👤',
          highlightText: 'Pelaku aksi dalam kalimat',
        },
        {
          chapter: 'Babak 2',
          title: 'Predikat (P): Kata Kerja Aksi',
          narration: '🏃 Predikat adalah kata kerja yang menjelaskan aktivitas atau tindakan yang dilakukan oleh sang subjek. Contohnya: "membaca", "menulis", "merancang".',
          badge: 'Predikat Tindakan',
          icon: '🏃',
          highlightText: 'Tindakan atau kegiatan yang dilakukan',
        },
        {
          chapter: 'Babak 3',
          title: 'Objek (O): Sasaran Tindakan',
          narration: '🎯 Objek adalah hal atau benda yang dikenai tindakan langsung oleh predikat. Contohnya: "buku ensiklopedia sains", "surat kabar".',
          badge: 'Objek Penerima',
          icon: '🎯',
          highlightText: 'Sasaran langsung dari kata kerja',
        },
        {
          chapter: 'Babak 4',
          title: 'Keterangan (K): Waktu & Tempat',
          narration: '📍 Keterangan melengkapi kalimat dengan konteks tempat atau waktu. Contoh: "di Perpustakaan Kota kemarin pagi". Kalimat SPOK kini utuh dan sempurna!',
          badge: 'Kalimat Efektif',
          icon: '📍',
          highlightText: 'Keterangan waktu dan tempat lengkap',
        },
      ];
    case 'history_timeline':
      return [
        {
          chapter: 'Babak 1',
          title: 'Zaman Kerajaan Maritim Sriwijaya',
          narration: '⛵ Pada abad ke-7, Kerajaan Sriwijaya berjaya sebagai pusat perdagangan maritim dunia dan pusat pembelajaran agama terkemuka di Asia.',
          badge: 'Maritim Klasik',
          icon: '⛵',
          highlightText: 'Pusat perdagangan rempah dunia',
        },
        {
          chapter: 'Babak 2',
          title: 'Era Keemasan Majapahit & Nusantara',
          narration: '👑 Abad ke-14 menjadi saksi Sumpah Palapa Mahapatih Gajah Mada di bawah Raja Hayam Wuruk, menyatukan kepulauan Nusantara dalam persaudaraan.',
          badge: 'Sumpah Palapa',
          icon: '👑',
          highlightText: 'Persatuan kepulauan Nusantara',
        },
        {
          chapter: 'Babak 3',
          title: 'Kebangkitan Nasional 1908 & 1928',
          narration: '🇮🇩 Lahirnya Budi Utomo dan ikrar Sumpah Pemuda 28 Oktober 1928 menyatukan pemuda dari seluruh suku bangsa dalam satu tumpah darah Indonesia!',
          badge: 'Sumpah Pemuda',
          icon: '🔥',
          highlightText: 'Satu nusa, satu bangsa, satu bahasa',
        },
        {
          chapter: 'Babak 4',
          title: 'Proklamasi Kemerdekaan 17 Agustus 1945',
          narration: '🎉 Bung Karno dan Bung Hatta memproklamasikan kemerdekaan Indonesia di Pegangsaan Timur 56! Bangsa kita berdaulat penuh menjadi negara merdeka!',
          badge: 'Indonesia Merdeka',
          icon: '🎉',
          highlightText: 'Proklamasi kemerdekaan Republik Indonesia',
        },
      ];
    case 'blood_circulation':
      return [
        {
          chapter: 'Babak 1',
          title: 'Jantung: 4 Ruang Berdenyut',
          narration: '❤️ Jantung memiliki 4 ruang ajaib (serambi kanan & kiri, bilik kanan & kiri) yang berdenyut memompa darah kaya nutrisi setiap detik kehidupanmu.',
          badge: 'Pompa Jantung',
          icon: '❤️',
          highlightText: 'Empat ruang denyut jantung manusia',
        },
        {
          chapter: 'Babak 2',
          title: 'Sirkulasi Darah Kecil ke Paru-Paru',
          narration: '🫁 Bilik kanan memompa darah yang mengandung CO₂ menuju paru-paru. Di alveolus paru, CO₂ dilepaskan dan oksigen segar diikat oleh hemoglobin!',
          badge: 'Peredaran Kecil',
          icon: '🫁',
          highlightText: 'Pertukaran gas CO₂ dan O₂ di paru',
        },
        {
          chapter: 'Babak 3',
          title: 'Sirkulasi Darah Besar ke Seluruh Tubuh',
          narration: '🩸 Darah merah kaya O₂ masuk ke bilik kiri, lalu dipompa melalui pembuluh aorta ke otak, otot tangan, kaki, dan seluruh sel tubuh manusia!',
          badge: 'Peredaran Besar',
          icon: '🩸',
          highlightText: 'Distribusi darah O₂ via arteri aorta',
        },
        {
          chapter: 'Babak 4',
          title: 'Energi & Stamina Berkelanjutan',
          narration: '🏃 Darah membawa sari-sari makanan hasil pencernaan untuk dibakar menjadi tenaga gerak, menjaga tubuhmu selalu fit dan penuh vitalitas!',
          badge: 'Vitalitas Tubuh',
          icon: '🏃',
          highlightText: 'Energi & kesehatan prima seluruh raga',
        },
      ];
    case 'flowchart_logic':
      return [
        {
          chapter: 'Babak 1',
          title: 'Terminator Awal (Mulai / Start)',
          narration: '🟢 Setiap algoritma komputer berawal dari simbol oval Terminator. Ini menandakan program diinisialisasi dan siap menerima masukan data.',
          badge: 'Titik Awal',
          icon: '🟢',
          highlightText: 'Inisialisasi sistem & persiapan data',
        },
        {
          chapter: 'Babak 2',
          title: 'Input Data & Pemrosesan Balok',
          narration: '💻 Simbol jajar genjang menerima data dari pengguna, lalu simbol persegi panjang memproses formula perhitungan logika secara berurutan.',
          badge: 'Proses Komputasi',
          icon: '💻',
          highlightText: 'Input data & eksekusi formula logis',
        },
        {
          chapter: 'Babak 3',
          title: 'Percabangan Keputusan (If-Else)',
          narration: '💎 Simbol belah ketupat adalah otak keputusan! Contoh: "Apakah skor >= 75? Jika YA lanjut lulus, jika TIDAK ulangi latihan kembali".',
          badge: 'Logika Keputusan',
          icon: '💎',
          highlightText: 'Percabangan kondisi logika pintar',
        },
        {
          chapter: 'Babak 4',
          title: 'Terminator Akhir (Selesai / End)',
          narration: '🏁 Algoritma mencapai garis akhir setelah membuahkan hasil output akurat, menyelesaikan masalah komputasi secara efektif dan efisien!',
          badge: 'Solusi Sukses',
          icon: '🏁',
          highlightText: 'Solusi program komputer tuntas',
        },
      ];
    case 'math_arithmetic':
      return [
        {
          chapter: 'Babak 1',
          title: 'Konsep Bilangan Utuh (1 Bagian)',
          narration: '🍕 Bayangkan satu loyang pizza lezat yang baru matang. Bentuk bulat utuh ini mewakili angka satu (1) utuh dalam matematika.',
          badge: 'Bilangan Bulat',
          icon: '🍕',
          highlightText: 'Satu kesatuan utuh bernilai 1',
        },
        {
          chapter: 'Babak 2',
          title: 'Membagi Sama Rata Jadi Pecahan',
          narration: '🔪 Jika pizza dipotong menjadi 4 bagian sama besar, setiap potongan bernilai 1/4 (satu per empat). Pembilang di atas, penyebut di bawah!',
          badge: 'Pecahan Biasa',
          icon: '🔪',
          highlightText: 'Satu potong dari 4 bagian (1/4)',
        },
        {
          chapter: 'Babak 3',
          title: 'Menjumlahkan Pecahan Senilai',
          narration: '➕ Dua potong pizza bernilai 1/4 + 1/4 = 2/4. Jika disederhanakan dengan membagi 2, nilainya sama persis dengan setengah pizza (1/2)!',
          badge: 'Penyederhanaan',
          icon: '➕',
          highlightText: '2/4 senilai dengan setengah (1/2)',
        },
        {
          chapter: 'Babak 4',
          title: 'Keadilan Berbagi Sehari-Hari',
          narration: '🤝 Konsep pecahan melatih kita untuk berbagi makanan, uang saku, dan rezeki secara adil dan jujur kepada sesama teman dan keluarga!',
          badge: 'Keadilan Nyata',
          icon: '🤝',
          highlightText: 'Berhitung & berbagi secara adil',
        },
      ];
    case 'pressure_pascal':
      return [
        {
          chapter: 'Babak 1',
          title: 'Konsep Tekanan Zat (P = F / A)',
          narration: '📦 Tekanan zat padat adalah gaya tekan (F) dibagi luas bidang sentuh (A). Semakin runcing atau sempit ujung benda seperti paku, tekanannya semakin besar menembus kayu!',
          badge: 'Tekanan Zat',
          icon: '📦',
          highlightText: 'Tekanan P sebanding gaya dan berbanding terbalik luas A',
        },
        {
          chapter: 'Babak 2',
          title: 'Hukum Pascal & Bejana Berhubungan',
          narration: '💧 Blaise Pascal menemukan bahwa tekanan zat cair dalam ruang tertutup diteruskan ke segala arah secara merata tanpa berkurang sedikit pun.',
          badge: 'Hukum Pascal',
          icon: '💧',
          highlightText: 'Tekanan zat cair merata ke segala arah',
        },
        {
          chapter: 'Babak 3',
          title: 'Prinsip Kerja Dongkrak Hidrolik',
          narration: '🚗 Dengan memberikan gaya kecil (F1) pada piston kecil (A1), cairan hidrolik meneruskan gaya hingga mampu mengangkat mobil berat di piston besar (A2) karena F1/A1 = F2/A2!',
          badge: 'Dongkrak Hidrolik',
          icon: '🚗',
          highlightText: 'Gaya kecil mampu mengangkat mobil ton berat',
        },
        {
          chapter: 'Babak 4',
          title: 'Penerapan Rem Cakram & Alat Berat',
          narration: '🚜 Dari sistem rem cakram sepeda motor, rem hidrolik mobil, hingga lengan ekskavator proyek raksasa, hukum Pascal membantu peradaban modern bekerja efisien!',
          badge: 'Teknologi Hidrolik',
          icon: '🚜',
          highlightText: 'Pondasi rem kendaraan & alat berat konstruksi',
        },
      ];
    case 'electric_circuit':
      return [
        {
          chapter: 'Babak 1',
          title: 'Sumber Energi Baterai & Saklar',
          narration: '🔋 Baterai menyimpan beda potensial tegangan volt. Ketika saklar emas ditutup, terbentuk rangkaian sirkuit tertutup dan elektron mulai mengalir.',
          badge: 'Sumber Baterai',
          icon: '🔋',
          highlightText: 'Beda potensial tegangan volt & saklar tertutup',
        },
        {
          chapter: 'Babak 2',
          title: 'Aliran Elektron & Kuat Arus (I)',
          narration: '⚡ Elektron mengalir berputar melalui kawat tembaga. Kuat arus (I) diukur dalam satuan Ampere, menyatakan banyaknya muatan listrik yang meluncur setiap detik.',
          badge: 'Kuat Arus (I)',
          icon: '⚡',
          highlightText: 'Aliran partikel elektron dalam kawat tembaga',
        },
        {
          chapter: 'Babak 3',
          title: 'Hukum Ohm (V = I × R)',
          narration: '💡 George Ohm merumuskan bahwa tegangan (V) sama dengan kuat arus (I) dikali hambatan resistor (R). Semakin besar hambatan, arus yang mengalir akan mengecil.',
          badge: 'Hukum Ohm',
          icon: '📐',
          highlightText: 'Formula Hukum Ohm: V = I dikali R',
        },
        {
          chapter: 'Babak 4',
          title: 'Bohlam Pijar & Rangkaian Sehari-Hari',
          narration: '💡 Lampu pijar berpendar menyala terang mengubah energi listrik menjadi cahaya dan kehangatan. Di rumah kita, peralatan listrik dipasang secara paralel agar bekerja mandiri!',
          badge: 'Lampu Pijar',
          icon: '💡',
          highlightText: 'Energi listrik menjadi pancaran cahaya terang',
        },
      ];
    case 'wave_sound':
      return [
        {
          chapter: 'Babak 1',
          title: 'Getaran Harmonis & Titik Setimbang',
          narration: '〰️ Getaran adalah gerak bolak-balik suatu benda secara teratur melewati titik kesetimbangan. Contohnya ayunan bandul dan petikan senar gitar.',
          badge: 'Getaran Harmonis',
          icon: '〰️',
          highlightText: 'Gerak bolak-balik melewati titik kesetimbangan',
        },
        {
          chapter: 'Babak 2',
          title: 'Gelombang Transversal (Bukit & Lembah)',
          narration: '🌊 Gelombang transversal merambatkan energi dengan arah getar tegak lurus arah rambat. Satu gelombang penuh terdiri atas satu bukit puncak dan satu lembah!',
          badge: 'Pola Gelombang',
          icon: '🌊',
          highlightText: 'Satu bukit puncak ditambah satu lembah penuh',
        },
        {
          chapter: 'Babak 3',
          title: 'Frekuensi & Cepat Rambat (v = λ × f)',
          narration: '📏 Panjang satu gelombang disimbolkan lambda (λ), dan banyaknya getaran per detik disebut frekuensi (f) dalam Hertz. Cepat rambat gelombang adalah v = λ dikali f!',
          badge: 'Cepat Rambat',
          icon: '📏',
          highlightText: 'Rumus gelombang: cepat rambat v = lambda dikali frekuensi f',
        },
        {
          chapter: 'Babak 4',
          title: 'Resonansi Suara & Nada Musik Indah',
          narration: '🎵 Gelombang bunyi merambat melalui molekul udara menggetarkan gendang telinga. Resonansi akustik menghasilkan alunan musik yang merdu dan dinikmati semua orang!',
          badge: 'Akustik Musik',
          icon: '🎵',
          highlightText: 'Resonansi akustik & getaran merdu alat musik',
        },
      ];
    case 'calculus_integral_derivative':
      return [
        {
          chapter: 'Babak 1',
          title: "Konsep Turunan Laju Perubahan f'(x)",
          narration: "📈 Turunan diferensial mengukur laju perubahan sesaat suatu fungsi di setiap titik, diwakili oleh garis singgung kurva yang menyentuh grafik.",
          badge: 'Diferensial',
          icon: '📈',
          highlightText: "Garis singgung kurva laju perubahan f'(x)",
        },
        {
          chapter: 'Babak 2',
          title: "Titik Puncak & Nilai Stasioner",
          narration: "⛰️ Saat turunan pertama sama dengan nol (f'(x) = 0), garis singgung mendatar sempurna, menandakan titik puncak maksimum atau lembah minimum.",
          badge: 'Nilai Stasioner',
          icon: '⛰️',
          highlightText: "Kondisi puncak maksimum stasioner: f'(x) = 0",
        },
        {
          chapter: 'Babak 3',
          title: 'Integral: Luas Daerah di Bawah Kurva',
          narration: '🟩 Integral adalah operasi kebalikan turunan (antiturunan) yang menjumlahkan luasan area tak hingga kecil di bawah kurva grafik dari batas a hingga b.',
          badge: 'Integral Tentu',
          icon: '🟩',
          highlightText: 'Luas area arsiran di bawah kurva: ∫ f(x) dx',
        },
        {
          chapter: 'Babak 4',
          title: 'Aplikasi Sains Antariksa & Ekonomi',
          narration: '🚀 Kalkulus adalah bahasa rahasia alam semesta! Dari perhitungan lintasan roket peluncur satelit hingga pemodelan keuntungan maksimal bisnis!',
          badge: 'Rekayasa Modern',
          icon: '🚀',
          highlightText: 'Pondasi sains antariksa & ekonomi tingkat lanjut',
        },
      ];
    case 'economics_supply_demand':
      return [
        {
          chapter: 'Babak 1',
          title: 'Hukum Permintaan Pembeli (Qd)',
          narration: '🛍️ Kurva permintaan miring ke bawah: Semakin tinggi harga suatu barang, semakin sedikit jumlah barang yang ingin dibeli oleh konsumen di pasar.',
          badge: 'Permintaan (Qd)',
          icon: '🛍️',
          highlightText: 'Harga naik, jumlah permintaan barang menurun',
        },
        {
          chapter: 'Babak 2',
          title: 'Hukum Penawaran Produsen (Qs)',
          narration: '🏭 Kurva penawaran miring ke atas: Semakin mahal harga di pasar, produsen dan penjual semakin bersemangat memasok lebih banyak barang.',
          badge: 'Penawaran (Qs)',
          icon: '🏭',
          highlightText: 'Harga tinggi memicu peningkatan pasokan barang',
        },
        {
          chapter: 'Babak 3',
          title: 'Titik Temu Keseimbangan Pasar (E)',
          narration: '⚖️ Di titik temu perpotongan Qd = Qs, tercapailah harga keseimbangan (ekuilibrium E) di mana penjual dan pembeli sepakat tanpa kelebihan stok!',
          badge: 'Ekuilibrium Pasar',
          icon: '⚖️',
          highlightText: 'Keseimbangan adil: Permintaan Qd = Penawaran Qs',
        },
        {
          chapter: 'Babak 4',
          title: 'Stabilitas Ekonomi & Kesejahteraan',
          narration: '🏛️ Memahami mekanisme pasar membantu negara menjaga kestabilan harga pangan pokok dan mencegah inflasi demi kemakmuran seluruh rakyat!',
          badge: 'Kesejahteraan Rakyat',
          icon: '🏛️',
          highlightText: 'Perekonomian stabil & perdagangan adil berkelanjutan',
        },
      ];
    case 'thermodynamics_carnot':
      return [
        {
          chapter: 'Babak 1',
          title: 'Aliran Kalor & Hukum Termodinamika',
          narration: '🔥 Kalor berpindah secara alami dari benda bersuhu tinggi ke suhu rendah. Energi total bersifat kekal, hanya berubah dari panas menjadi gerak mekanik.',
          badge: 'Hukum Termodinamika',
          icon: '🔥',
          highlightText: 'Kekekalan energi: Kalor berubah menjadi usaha',
        },
        {
          chapter: 'Babak 2',
          title: 'Siklus Ideal Mesin Kalor Carnot',
          narration: '⚙️ Sadi Carnot merancang mesin paling efisien: Silinder menyerap kalor Q1 dari reservoir panas T1, menggerakkan piston menghasilkan usaha W.',
          badge: 'Mesin Carnot',
          icon: '⚙️',
          highlightText: 'Piston bergerak menghasilkan usaha kerja luar W',
        },
        {
          chapter: 'Babak 3',
          title: 'Formula Efisiensi Mesin (η)',
          narration: '📏 Usaha luar adalah selisih kalor masuk dan buang (W = Q1 - Q2). Efisiensi maksimum bergantung pada rasio suhu: eta = 1 dikurangi (T2 dibagi T1)!',
          badge: 'Efisiensi Mesin',
          icon: '📏',
          highlightText: 'Rumus efisiensi: W = Q1 - Q2, eta = 1 - (T2/T1)',
        },
        {
          chapter: 'Babak 4',
          title: 'Tenaga Mesin Industri & Mobil Ramah Lingkungan',
          narration: '🚗 Prinsip termodinamika diterapkan pada mesin mobil, pendingin kulkas, AC, hingga turbin pembangkit listrik tenaga uap modern!',
          badge: 'Teknologi Tenaga',
          icon: '🚗',
          highlightText: 'Dasar mesin otomotif & turbin energi listrik',
        },
      ];
    case 'optics_light':
      return [
        {
          chapter: 'Babak 1',
          title: 'Pembiasan Cahaya & Hukum Snellius',
          narration: '🌈 Ketika berkas cahaya menembus medium yang berbeda seperti udara ke kaca, lajunya melambat dan arah rambatnya dibiaskan membelok.',
          badge: 'Pembiasan Cahaya',
          icon: '🌈',
          highlightText: 'Cahaya berbelok saat memasuki medium berbeda',
        },
        {
          chapter: 'Babak 2',
          title: 'Lensa Cembung Pengumpul Berkas (Konvergen)',
          narration: '🔍 Lensa cembung mengumpulkan berkas sinar sejajar dan memfokuskannya tepat pada satu titik api atau titik fokus utama (F).',
          badge: 'Lensa Cembung',
          icon: '🔍',
          highlightText: 'Sinar dibiaskan mengumpul tepat di titik fokus F',
        },
        {
          chapter: 'Babak 3',
          title: 'Rumus Lensa & Pembentukan Bayangan',
          narration: '📐 Jarak benda (s), jarak bayangan (s-aksen), dan jarak fokus terikat rumus legendaris: satu per f sama dengan satu per s ditambah satu per s-aksen!',
          badge: 'Formula Optik',
          icon: '📐',
          highlightText: 'Rumus lensa: 1/f = 1/s + 1/s-aksen',
        },
        {
          chapter: 'Babak 4',
          title: 'Kacamata, Mikroskop & Teleskop Angkasa',
          narration: '🔭 Berkat lensa optik, penderita rabun dapat melihat jelas dengan kacamata, peneliti melihat virus via mikroskop, dan teleskop mengamati bintang jauh!',
          badge: 'Mata Dunia',
          icon: '🔭',
          highlightText: 'Kacamata, kamera, mikroskop & teleskop bintang',
        },
      ];
    case 'organic_chemistry':
      return [
        {
          chapter: 'Babak 1',
          title: 'Keistimewaan 4 Tangan Atom Karbon',
          narration: '⚛️ Atom karbon (C) memiliki 4 elektron valensi yang fleksibel, memungkinkannya bergandengan tangan membentuk jutaan variasi molekul kehidupan.',
          badge: 'Tetravalen Karbon',
          icon: '⚛️',
          highlightText: 'Empat tangan ikatan kovalen kokoh atom C',
        },
        {
          chapter: 'Babak 2',
          title: 'Keluarga Alkana, Alkena & Gugus Fungsi',
          narration: '🧪 Rantai hidrokarbon ikatan tunggal disebut alkana. Dengan menambahkan gugus fungsi seperti alkohol (-OH), terciptalah zat kimia berkhasiat medis!',
          badge: 'Gugus Fungsi',
          icon: '🧪',
          highlightText: 'Rantai karbon turunan alkana & gugus fungsi alkohol',
        },
        {
          chapter: 'Babak 3',
          title: 'Cincin Aromatik Benzena (C6H6)',
          narration: '💎 Enam atom karbon membentuk cincin heksagonal melingkar yang sangat stabil karena elektron beresonansi bebas di dalam cincin aromatik.',
          badge: 'Cincin Benzena',
          icon: '💎',
          highlightText: 'Cincin segi enam aromatik benzena stabil',
        },
        {
          chapter: 'Babak 4',
          title: 'Bahan Baku Obat & Polimer Kehidupan',
          narration: '💊 Dari obat pereda nyeri parasetamol, serat pakaian nilon, hingga protein penyusun otot tubuh kita, semuanya tersusun atas kimia organik!',
          badge: 'Kimia Medis',
          icon: '💊',
          highlightText: 'Menyusun obat-obatan, serat kain & protein tubuh',
        },
      ];
    case 'relativity_einstein':
      return [
        {
          chapter: 'Babak 1',
          title: 'Kecepatan Cahaya Mutlak (c = 300.000 km/s)',
          narration: '✨ Albert Einstein mempostulatkan bahwa kecepatan cahaya di ruang hampa adalah batas kecepatan tertinggi alam semesta dan bernilai konstan bagi semua orang.',
          badge: 'Postulat Relativitas',
          icon: '✨',
          highlightText: 'Kecepatan cahaya konstan 300.000 km per detik',
        },
        {
          chapter: 'Babak 2',
          title: 'Dilatasi Waktu & Jam yang Melambat',
          narration: '⏳ Ruang dan waktu bersifat lentur! Bagi astronot yang melesat dalam roket berkecepatan tinggi, waktu berdetak lebih lambat dibanding orang di bumi!',
          badge: 'Dilatasi Waktu',
          icon: '⏳',
          highlightText: 'Waktu melambat bagi pengamat yang bergerak cepat',
        },
        {
          chapter: 'Babak 3',
          title: 'Rumus Legendaris Energi: E = m · c²',
          narration: '💥 Massa dan energi adalah dua sisi dari koin yang sama! Sedikit saja materi dapat dikonversi menjadi energi raksasa yang menyalakan kobaran Matahari!',
          badge: 'E = m · c²',
          icon: '💥',
          highlightText: 'Energi E sama dengan massa m dikali c kuadrat',
        },
        {
          chapter: 'Babak 4',
          title: 'Satelit GPS & Masa Depan Antariksa',
          narration: '🛰️ Tanpa koreksi rumus relativitas Einstein setiap hari, navigasi satelit GPS di smartphone kita akan meleset berkilometer-kilometer!',
          badge: 'Navigasi Presisi',
          icon: '🛰️',
          highlightText: 'Dasar kalibrasi satelit GPS smartphone & kosmos',
        },
      ];
    case 'math_exponential_logarithm':
      return [
        {
          chapter: 'Babak 1',
          title: 'Kurva Pertumbuhan Eksponensial f(x) = aˣ',
          narration: '📈 Fungsi eksponen f(x) = aˣ (a > 1) mengalami pertumbuhan dahsyat yang melesat tajam ke atas. Kurva selalu melewati titik koordinat (0, 1) karena berapapun dipangkatkan nol bernilai satu!',
          badge: 'Eksponen f(x) = aˣ',
          icon: '📈',
          highlightText: 'Grafik menanjak eksponensial melewati titik (0, 1)',
        },
        {
          chapter: 'Babak 2',
          title: 'Logaritma Invers & Garis Refleksi y = x',
          narration: '📐 Logaritma adalah kebalikan dari eksponen! Kurva y = ᵃlog x merupakan pencerminan kurva eksponen terhadap garis putus-putus diagonal y = x, memotong sumbu X tepat di titik (1, 0).',
          badge: 'Logaritma Invers',
          icon: '📐',
          highlightText: 'Pencerminan kurva invers terhadap garis y = x di titik (1, 0)',
        },
        {
          chapter: 'Babak 3',
          title: 'Sifat Asimtot & Operasi Hitung Logaritma',
          narration: '⚖️ Kurva eksponen memiliki asimtot datar y = 0, sedangkan logaritma memiliki asimtot tegak x = 0. Operasi logaritma mengubah perkalian menjadi penjumlahan: ᵃlog(b × c) = ᵃlog b + ᵃlog c!',
          badge: 'Sifat Logaritma',
          icon: '⚖️',
          highlightText: 'Asimtot datar y=0, asimtot tegak x=0, ᵃlog(b×c) = ᵃlog b + ᵃlog c',
        },
        {
          chapter: 'Babak 4',
          title: 'Aplikasi Nyata: Bakteri & Skala Gempa Richter',
          narration: '🌍 Eksponen dan logaritma mengatur alam semesta! Dari pembelahan sel bakteri dan peluruhan radioaktif hingga pengukuran magnitudo gempa bumi pada skala logaritmik Richter!',
          badge: 'Dunia Nyata',
          icon: '🌍',
          highlightText: 'Pondasi pembelahan bakteri, peluruhan & gempa Richter',
        },
      ];
    case 'data_structures_algorithms':
      return [
        {
          chapter: 'Babak 1',
          title: 'Struktur Data Linier: Array Indeks [0..n]',
          narration: '💻 Array adalah barisan sel memori berurutan yang menyimpan elemen bertipe sejenis. Karena memiliki indeks teratur mulai dari 0, data di dalam array dapat diakses seketika dalam waktu konstan O(1)!',
          badge: 'Array Memori',
          icon: '💻',
          highlightText: 'Akses instan indeks 0, 1, 2 dengan efisiensi O(1)',
        },
        {
          chapter: 'Babak 2',
          title: 'Stack Tumpukan (LIFO) & Queue Antrean (FIFO)',
          narration: '📚 Stack menganut prinsip LIFO (Last-In-First-Out) seperti tumpukan buku atau tombol Undo aplikasi. Sedangkan Queue menganut FIFO (First-In-First-Out) seperti antrean tiket loket yang tertib!',
          badge: 'LIFO vs FIFO',
          icon: '📚',
          highlightText: 'Stack (Push/Pop LIFO) & Queue (Enqueue/Dequeue FIFO)',
        },
        {
          chapter: 'Babak 3',
          title: 'Algoritma Rekursi & Kompleksitas Notasi Big-O',
          narration: '⚡ Fungsi rekursif memanggil dirinya sendiri hingga kondisi henti. Notasi Big-O mengukur efisiensi: Binary Search berorde O(log n) mampu mencari 1 data di antara 4 miliar data hanya dalam 32 langkah!',
          badge: 'Notasi Big-O',
          icon: '⚡',
          highlightText: 'Efisiensi Binary Search O(log n) membelah ruang data dua kali lipat',
        },
        {
          chapter: 'Babak 4',
          title: 'Kecerdasan Buatan (AI) & Pembelajaran Mesin',
          narration: '🤖 Machine Learning melatih jaringan saraf tiruan (Neural Network) menemukan pola dari kumpulan data latih. Bobot sinapsis antarneuron terus disempurnakan untuk prediksi masa depan yang akurat!',
          badge: 'AI & Machine Learning',
          icon: '🤖',
          highlightText: 'Jaringan neuron tiruan memperbarui bobot sinapsis dari data latih',
        },
      ];
    default: {
      if (topic && topic.title) {
        const p1 = topic.points?.[0] || 'Perhatikan konsep dasar materi ini dengan cermat.';
        const p2 = topic.points?.[1] || 'Amati langkah-langkah dan contoh penerapannya.';
        const p3 = topic.points?.[2] || 'Gunakan tips cerdas agar kamu cepat paham dan tidak mudah keliru.';
        const tips = topic.keyFormulaOrConcept ? `Kunci rumus praktisnya: ${topic.keyFormulaOrConcept}. ` : '';
        const fact = topic.funFact || 'Memahami materi ini membuat karaktermu semakin bijaksana dan berprestasi di sekolah!';

        return [
          {
            chapter: 'Babak 1',
            title: `Pengenalan: ${topic.title}`,
            narration: `🌟 Halo murid pintar! Hari ini kita mempelajari topik penting: ${topic.title}. ${topic.summary} Perhatikan kartu pertama di papan tulis!`,
            badge: topic.badge || 'Konsep Dasar',
            icon: '📖',
            highlightText: topic.title,
          },
          {
            chapter: 'Babak 2',
            title: 'Ciri Utama & Contoh Nyata',
            narration: `🔍 Sekarang amati kartu kedua yang disorot gurumu! ${p1} ${topic.points?.[1] ? 'Ingat juga: ' + p2 : ''}`,
            badge: 'Contoh Nyata',
            icon: '🔍',
            highlightText: p1.length > 40 ? p1.slice(0, 38) + '...' : p1,
          },
          {
            chapter: 'Babak 3',
            title: topic.keyFormulaOrConcept ? 'Kunci Rumus & Tips Pintar' : 'Langkah Penyelesaian Mudah',
            narration: `💡 Cermati kartu ketiga tentang tips pintar! ${tips}${p3}`,
            badge: 'Tips Cepat',
            icon: '💡',
            highlightText: topic.keyFormulaOrConcept || (p2.length > 40 ? p2.slice(0, 38) + '...' : p2),
          },
          {
            chapter: 'Babak 4',
            title: 'Fakta Seru & Tantangan Kuis',
            narration: `🎯 Luar biasa! Tahukah kamu: ${fact} Sekarang giliranmu, jawab tantangan kuis di panel sebelah kanan untuk membuktikan kehebatanmu dan raih poin EXP!`,
            badge: 'Misi Kuis EXP',
            icon: '🎯',
            highlightText: 'Jawab kuis berhadiah EXP',
          },
        ];
      }

      return [
        {
          chapter: 'Babak 1',
          title: 'Pengamatan & Fenomena Nyata',
          narration: `🔍 Mempelajari ${type.replace(/_/g, ' ')} berawal dari rasa ingin tahu mengamati fenomena alam dan lingkungan di sekitar kita.`,
          badge: 'Pengamatan Awal',
          icon: '🔍',
          highlightText: 'Observasi fenomena nyata di sekitar',
        },
        {
          chapter: 'Babak 2',
          title: 'Mekanisme & Alur Proses',
          narration: '⚙️ Komponen-komponen utama saling berinteraksi membentuk alur kerja yang teratur, logis, dan dapat dibuktikan secara ilmiah.',
          badge: 'Alur Sistematis',
          icon: '⚙️',
          highlightText: 'Sistem kerja ilmiah yang logis',
        },
        {
          chapter: 'Babak 3',
          title: 'Prinsip Kunci & Formula Baku',
          narration: '🧪 Para ilmuwan merumuskan prinsip dan formula baku untuk menjelaskan hukum alam yang mendasari fenomena menakjubkan ini.',
          badge: 'Formula Baku',
          icon: '🧪',
          highlightText: 'Prinsip ilmu pengetahuan teruji',
        },
        {
          chapter: 'Babak 4',
          title: 'Wawasan Bernilai Bagi Masa Depan',
          narration: '💡 Menguasai ilmu ini membekali kita untuk menciptakan inovasi teknologi baru, menjaga kelestarian bumi, dan memajukan peradaban!',
          badge: 'Inovasi Masa Depan',
          icon: '💡',
          highlightText: 'Wawasan berharga untuk berinovasi',
        },
      ];
    }
  }
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
  const sound = SoundManager.getInstance();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x or 1.5x
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const scenes = useMemo(() => getTopicStoryScenes(type), [type]);
  const currentScene = scenes[activeStep] || scenes[0];

  // Reset step & auto-play saat tipe topik berganti
  useEffect(() => {
    setActiveStep(0);
    setProgressPercent(0);
    setIsPlaying(true);
  }, [type]);

  // Autoplay loop timer (5 detik per adegan pada speed 1x)
  useEffect(() => {
    if (!isPlaying) return;

    const stepDuration = 5000 / playbackSpeed;
    const intervalTime = 100;
    const stepIncrement = (intervalTime / stepDuration) * 100;

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setActiveStep((cur) => (cur + 1) % scenes.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, scenes.length]);

  const handlePrev = () => {
    sound.playClick();
    setProgressPercent(0);
    setActiveStep((prev) => (prev > 0 ? prev - 1 : scenes.length - 1));
  };

  const handleNext = () => {
    sound.playClick();
    setProgressPercent(0);
    setActiveStep((prev) => (prev < scenes.length - 1 ? prev + 1 : 0));
  };

  const handleSelectStep = (idx: number) => {
    sound.playClick();
    setProgressPercent(0);
    setActiveStep(idx);
  };

  const handleTogglePlay = () => {
    sound.playClick();
    setIsPlaying((prev) => !prev);
  };

  const handleToggleSpeed = () => {
    sound.playClick();
    setPlaybackSpeed((prev) => (prev === 1 ? 1.5 : 1));
  };

  return (
    <div className="relative w-full clay-panel overflow-hidden flex flex-col font-pixel text-black">
      {/* 1. TOP VIDEO PLAYER HEADER */}
      <div className="px-3.5 sm:px-5 py-2.5 clay-header flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 clay-badge-secondary text-black font-bold text-[10px] tracking-wider uppercase">
            <Film className="w-3.5 h-3.5 text-black" />
            <span>VIDEO BERGAMBAR</span>
          </span>

          <span className="text-xs font-bold text-black hidden sm:inline-block truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSpeed}
            className="px-2 py-0.5 clay-btn-neutral text-black text-[11px] font-bold"
            title="Kecepatan Video"
          >
            {playbackSpeed}x SPEED
          </button>

          <span className="px-2.5 py-0.5 clay-badge-neutral text-black font-bold text-xs">
            {currentScene.chapter} / 4
          </span>
        </div>
      </div>

      {/* 2. AREA LAYAR UTAMA: SVG ILUSTRASI ANIMASI */}
      <div className="relative w-full aspect-[16/9] max-h-[300px] flex items-center justify-center bg-[#23160C] border-b-2 border-[#5C3A21] overflow-hidden">
        <div className="w-full h-full p-2">
          {renderDiagramSvg(type, activeStep, setActiveStep)}
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 clay-badge-neutral text-black font-bold text-xs flex items-center gap-1.5">
            <span>{currentScene.icon}</span>
            <span>{currentScene.title}</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 clay-badge-secondary text-black font-bold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-black" />
            <span>{currentScene.highlightText}</span>
          </span>
        </div>

        {!isPlaying && (
          <button
            type="button"
            onClick={handleTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-[#5C3A21]/45 cursor-pointer"
            title="Putar Video Bergambar"
          >
            <div className="w-12 h-12 clay-btn-primary text-black flex items-center justify-center">
              <Play className="w-6 h-6 fill-black text-black ml-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* Progress Ticker Bar */}
      <div className="w-full h-2 bg-[#FFF8EA] border-b-2 border-[#5C3A21] overflow-hidden">
        <div
          className="h-full bg-[#FFAE6D]"
          style={{ width: `${isPlaying ? progressPercent : 100}%` }}
        />
      </div>

      {/* 3. KOTAK SUBTITLE & NARASI BERGAMBAR */}
      <div className="p-3 sm:p-4 bg-[#FFF8EA] border-b-2 border-[#5C3A21] flex items-start gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 clay-badge-secondary text-black flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-black uppercase tracking-wider">
              Prof. Raden Bot • Narator Bergambar:
            </span>
            <span className="px-1.5 py-0.5 clay-badge-primary text-black text-[10px] font-bold">
              {currentScene.badge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-black leading-relaxed">
            {currentScene.narration}
          </p>
        </div>
      </div>

      {/* 4. PLAYER CONTROL TIMELINE BAR */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#FFF8EA] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 clay-btn-neutral text-black"
            title="Adegan Sebelumnya"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ${
              isPlaying ? 'clay-btn-secondary text-black' : 'clay-btn-primary text-black'
            }`}
            title={isPlaying ? 'Jeda Video' : 'Putar Otomatis'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-black text-black" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                <span>Putar Cerita</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 clay-btn-neutral text-black"
            title="Adegan Berikutnya"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {scenes.map((sc, sIdx) => {
            const isCur = activeStep === sIdx;
            return (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleSelectStep(sIdx)}
                className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1 ${
                  isCur ? 'clay-btn-primary text-black' : 'clay-btn-neutral text-black'
                }`}
              >
                <span>{sc.icon}</span>
                <span className="hidden sm:inline">{sc.chapter}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// SVG RENDERER PER JENIS MATERI
// ============================================================================
export function renderDiagramSvg(
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
          <defs>
            <radialGradient id="staticCrust" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="600" height="320" fill="#0f172a" />

          <text x="300" y="38" fill="#fef08a" fontSize="15" fontWeight="bold" textAnchor="middle">
            🍕 BELAJAR PECAHAN PIZZA LEZAT (MATEMATIKA CERIA)
          </text>

          {/* Pecahan Pizza 1/2 */}
          <g transform="translate(110, 145)">
            <circle cx="0" cy="0" r="52" fill="#78350f" stroke="#451a03" strokeWidth="3" />
            <path d="M 0 0 L 0 -50 A 50 50 0 0 1 0 50 Z" fill="url(#staticCrust)" stroke="#d97706" strokeWidth="2" />
            <circle cx="22" cy="-18" r="7" fill="#ef4444" />
            <circle cx="22" cy="18" r="7" fill="#ef4444" />
            <rect x="-42" y="62" width="84" height="24" rx="6" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="0" y="78" fill="#7dd3fc" fontSize="12" fontWeight="bold" textAnchor="middle">1 / 2 (Setengah)</text>
          </g>

          {/* Pecahan Pizza 1/4 */}
          <g transform="translate(300, 145)">
            <circle cx="0" cy="0" r="52" fill="#78350f" stroke="#451a03" strokeWidth="3" />
            <path d="M 0 0 L 50 0 A 50 50 0 0 1 0 50 Z" fill="url(#staticCrust)" stroke="#d97706" strokeWidth="2" />
            <circle cx="20" cy="20" r="7" fill="#ef4444" />
            <line x1="-50" y1="0" x2="50" y2="0" stroke="#451a03" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="0" y1="-50" x2="0" y2="50" stroke="#451a03" strokeWidth="2" strokeDasharray="3,3" />
            <rect x="-48" y="62" width="96" height="24" rx="6" fill="#1e1b4b" stroke="#f472b6" strokeWidth="1.5" />
            <text x="0" y="78" fill="#f472b6" fontSize="12" fontWeight="bold" textAnchor="middle">1 / 4 (Seperempat)</text>
          </g>

          {/* Pecahan 3/4 */}
          <g transform="translate(490, 145)">
            <circle cx="0" cy="0" r="52" fill="#78350f" stroke="#451a03" strokeWidth="3" />
            <path d="M 0 0 L 0 -50 A 50 50 0 1 1 -50 0 Z" fill="url(#staticCrust)" stroke="#d97706" strokeWidth="2" />
            <circle cx="20" cy="-20" r="7" fill="#ef4444" />
            <circle cx="20" cy="20" r="7" fill="#ef4444" />
            <circle cx="-20" cy="20" r="7" fill="#ef4444" />
            <rect x="-52" y="62" width="104" height="24" rx="6" fill="#1e1b4b" stroke="#4ade80" strokeWidth="1.5" />
            <text x="0" y="78" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">3 / 4 (Tiga Perempat)</text>
          </g>

          {/* Kesimpulan Mudah Dipahami */}
          <g transform="translate(130, 255)">
            <rect x="0" y="0" width="340" height="42" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <text x="170" y="26" fill="#fbbf24" fontSize="13" fontWeight="bold" textAnchor="middle">
              🍕 1/4 + 1/4 = 2/4 = 1/2 (Setengah Loyang Pizza)
            </text>
          </g>
        </svg>
      );

    case 'pressure_pascal':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="42" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            TEKANAN ZAT & HUKUM PASCAL (DONGKRAK HIDROLIK)
          </text>
          {/* Bejana U Hidrolik */}
          <path d="M 120 100 L 120 230 Q 120 260, 160 260 L 440 260 Q 480 260, 480 230 L 480 100 L 410 100 L 410 210 Q 410 220, 390 220 L 210 220 Q 190 220, 190 210 L 190 100 Z" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="3" />
          {/* Piston Kecil A1 */}
          <rect x="125" y="140" width="60" height="20" rx="4" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          <line x1="155" y1="80" x2="155" y2="135" stroke="#ef4444" strokeWidth="4" />
          <polygon points="155,140 148,125 162,125" fill="#ef4444" />
          <text x="155" y="70" fill="#f87171" fontSize="12" fontWeight="bold" textAnchor="middle">F₁ (Gaya Kecil)</text>
          <text x="155" y="175" fill="#fde047" fontSize="10" textAnchor="middle">Luas A₁</text>
          {/* Piston Besar A2 */}
          <rect x="415" y="110" width="60" height="20" rx="4" fill="#10b981" stroke="#34d399" strokeWidth="2" />
          <line x1="445" y1="105" x2="445" y2="60" stroke="#10b981" strokeWidth="4" />
          <polygon points="445,55 438,70 452,70" fill="#10b981" />
          <text x="445" y="50" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">F₂ (Gaya Besar 🚗)</text>
          <text x="445" y="145" fill="#a7f3d0" fontSize="10" textAnchor="middle">Luas A₂</text>
          {/* Kotak Formula */}
          <rect x="210" y="85" width="180" height="55" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="300" y="108" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">F₁ / A₁ = F₂ / A₂</text>
          <text x="300" y="128" fill="#94a3b8" fontSize="10" textAnchor="middle">Tekanan P₁ = P₂ Teruskan Rata</text>
        </svg>
      );

    case 'electric_circuit':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="38" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            RANGKAIAN LISTRIK DINAMIS & HUKUM OHM (V = I · R)
          </text>
          {/* Sirkuit Tertutup */}
          <rect x="100" y="70" width="400" height="170" rx="10" fill="none" stroke="#ca8a04" strokeWidth="4" />
          {/* Baterai Kiri */}
          <g transform="translate(100, 155)">
            <rect x="-14" y="-30" width="28" height="60" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <line x1="-14" y1="-8" x2="14" y2="-8" stroke="#ef4444" strokeWidth="4" />
            <line x1="-8" y1="12" x2="8" y2="12" stroke="#38bdf8" strokeWidth="3" />
            <text x="-25" y="-12" fill="#ef4444" fontSize="14" fontWeight="bold">+</text>
            <text x="-25" y="20" fill="#38bdf8" fontSize="14" fontWeight="bold">-</text>
            <text x="0" y="45" fill="#fde047" fontSize="10" textAnchor="middle">Baterai (V)</text>
          </g>
          {/* Saklar Atas */}
          <g transform="translate(300, 70)">
            <circle cx="-30" cy="0" r="5" fill="#fbbf24" />
            <circle cx="30" cy="0" r="5" fill="#fbbf24" />
            <line x1="-28" y1="0" x2="26" y2="0" stroke="#4ade80" strokeWidth="3.5" />
            <text x="0" y="-12" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">Saklar ON (Tertutup)</text>
          </g>
          {/* Resistor Bawah */}
          <g transform="translate(300, 240)">
            <rect x="-40" y="-12" width="80" height="24" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="0" y="4" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">Resistor (R)</text>
          </g>
          {/* Lampu Kanan */}
          <g transform="translate(500, 155)">
            <circle cx="0" cy="0" r="24" fill="#fef08a" stroke="#eab308" strokeWidth="3" />
            <text x="0" y="6" fontSize="20" textAnchor="middle">💡</text>
            <text x="0" y="42" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">Lampu Menyala</text>
          </g>
          {/* Formula */}
          <rect x="220" y="130" width="160" height="50" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="300" y="152" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">V = I × R</text>
          <text x="300" y="169" fill="#94a3b8" fontSize="9.5" textAnchor="middle">Arus I (Ampere) • Tegangan V</text>
        </svg>
      );

    case 'wave_sound':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="40" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            GETARAN, GELOMBANG TRANSVERSAL & BUNYI
          </text>
          {/* Garis Kesetimbangan */}
          <line x1="60" y1="160" x2="540" y2="160" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x="545" y="164" fill="#94a3b8" fontSize="10">Setimbang</text>
          {/* Gelombang Sinus Transversal */}
          <path d="M 80 160 Q 140 80, 200 160 T 320 160 T 440 160 T 520 160" fill="none" stroke="#38bdf8" strokeWidth="4" />
          {/* Puncak & Lembah */}
          <circle cx="140" cy="80" r="5" fill="#f43f5e" />
          <text x="140" y="68" fill="#fb7185" fontSize="11" fontWeight="bold" textAnchor="middle">Puncak Bukit</text>
          <circle cx="260" cy="240" r="5" fill="#34d399" />
          <text x="260" y="260" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">Dasar Lembah</text>
          {/* Garis Ukur Amplitudo */}
          <line x1="140" y1="80" x2="140" y2="160" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
          <text x="155" y="125" fill="#fb7185" fontSize="10">Amplitudo (A)</text>
          {/* Garis Ukur Lambda */}
          <line x1="80" y1="210" x2="320" y2="210" stroke="#fbbf24" strokeWidth="2" />
          <polygon points="80,210 90,206 90,214" fill="#fbbf24" />
          <polygon points="320,210 310,206 310,214" fill="#fbbf24" />
          <text x="200" y="202" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">1 Panjang Gelombang (λ)</text>
          {/* Kotak Formula */}
          <rect x="370" y="85" width="170" height="55" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="455" y="108" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">v = λ × f</text>
          <text x="455" y="126" fill="#94a3b8" fontSize="10" textAnchor="middle">Cepat Rambat = Lambda × Frek</text>
        </svg>
      );

    case 'calculus_integral_derivative':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="38" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            KALKULUS: TURUNAN (f') & INTEGRAL TENTU (∫ f(x) dx)
          </text>
          {/* Sumbu X dan Y */}
          <line x1="80" y1="240" x2="520" y2="240" stroke="#64748b" strokeWidth="2" />
          <line x1="120" y1="60" x2="120" y2="260" stroke="#64748b" strokeWidth="2" />
          <text x="510" y="235" fill="#94a3b8" fontSize="11" fontWeight="bold">X</text>
          <text x="125" y="75" fill="#94a3b8" fontSize="11" fontWeight="bold">Y = f(x)</text>

          {/* Area Arsiran Integral di Bawah Kurva */}
          <path d="M 200 240 L 200 170 Q 280 90, 360 140 Q 400 165, 420 180 L 420 240 Z" fill="#10b981" fillOpacity="0.25" stroke="none" />
          <line x1="200" y1="240" x2="200" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="420" y1="240" x2="420" y2="180" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
          <text x="200" y="255" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">a</text>
          <text x="420" y="255" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">b</text>
          <text x="310" y="210" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle">Luas = ∫[a➔b] f(x) dx</text>

          {/* Kurva Parabola Halus f(x) */}
          <path d="M 140 220 Q 260 70, 460 210" fill="none" stroke="#38bdf8" strokeWidth="4" />

          {/* Garis Singgung Turunan f'(x) di Titik Puncak */}
          <line x1="200" y1="108" x2="320" y2="108" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="260" cy="108" r="5" fill="#f59e0b" />
          <text x="260" y="95" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">Stasioner: f'(x) = 0</text>

          {/* Kotak Formula */}
          <rect x="370" y="60" width="180" height="65" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="460" y="82" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">f'(x) = lim Δy/Δx</text>
          <text x="460" y="100" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">d(xⁿ)/dx = n·xⁿ⁻¹</text>
          <text x="460" y="116" fill="#94a3b8" fontSize="9" textAnchor="middle">∫ xⁿ dx = (1/(n+1)) xⁿ⁺¹ + C</text>
        </svg>
      );

    case 'economics_supply_demand':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="38" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            KURVA PERMINTAAN (Qd), PENAWARAN (Qs) & KESEIMBANGAN PASAR (E)
          </text>
          {/* Sumbu Harga P dan Jumlah Barang Q */}
          <line x1="120" y1="240" x2="480" y2="240" stroke="#64748b" strokeWidth="2.5" />
          <line x1="120" y1="65" x2="120" y2="240" stroke="#64748b" strokeWidth="2.5" />
          <text x="495" y="244" fill="#94a3b8" fontSize="11" fontWeight="bold">Q (Kuantitas)</text>
          <text x="120" y="55" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">P (Harga)</text>

          {/* Kurva Permintaan (Qd: Merah Muda Menurun) */}
          <line x1="160" y1="90" x2="420" y2="220" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
          <text x="430" y="225" fill="#fb7185" fontSize="12" fontWeight="bold">D (Permintaan)</text>

          {/* Kurva Penawaran (Qs: Biru Meningkat) */}
          <line x1="160" y1="220" x2="420" y2="90" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <text x="430" y="95" fill="#7dd3fc" fontSize="12" fontWeight="bold">S (Penawaran)</text>

          {/* Titik Keseimbangan Ekuilibrium E */}
          <circle cx="290" cy="155" r="7" fill="#fbbf24" stroke="#78350f" strokeWidth="2" className="animate-pulse" />
          <line x1="290" y1="155" x2="290" y2="240" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="120" y1="155" x2="290" y2="155" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="310" y="150" fill="#fde047" fontSize="13" fontWeight="bold">E (Pe, Qe)</text>
          <text x="100" y="159" fill="#fde047" fontSize="10" textAnchor="end">Pe (Sepakat)</text>
          <text x="290" y="258" fill="#fde047" fontSize="10" textAnchor="middle">Qe (Seimbang)</text>

          {/* Card Formula */}
          <rect x="180" y="270" width="240" height="35" rx="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="300" y="292" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
            Keseimbangan Pasar: Qd = Qs
          </text>
        </svg>
      );

    case 'thermodynamics_carnot':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="38" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            SIKLUS MESIN KALOR CARNOT: W = Q₁ - Q₂ & EFISIENSI (η)
          </text>
          {/* Reservoir Suhu Tinggi T1 */}
          <rect x="200" y="65" width="200" height="40" rx="8" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
          <text x="300" y="89" fill="#fee2e2" fontSize="12" fontWeight="bold" textAnchor="middle">Reservoir Suhu Tinggi (T₁)</text>

          {/* Panah Kalor Masuk Q1 */}
          <line x1="300" y1="105" x2="300" y2="140" stroke="#ef4444" strokeWidth="4" />
          <polygon points="300,145 295,135 305,135" fill="#ef4444" />
          <text x="330" y="130" fill="#fca5a5" fontSize="11" fontWeight="bold">Kalor Q₁</text>

          {/* Mesin Carnot (Silinder Kerja) */}
          <circle cx="300" cy="180" r="35" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
          <text x="300" y="185" fill="#e0f2fe" fontSize="11" fontWeight="bold" textAnchor="middle">Mesin</text>

          {/* Usaha Mekanik Keluar W */}
          <line x1="335" y1="180" x2="440" y2="180" stroke="#22c55e" strokeWidth="4" />
          <polygon points="445,180 435,175 435,185" fill="#22c55e" />
          <text x="390" y="170" fill="#4ade80" fontSize="12" fontWeight="bold">Usaha W</text>

          {/* Panah Kalor Buang Q2 */}
          <line x1="300" y1="215" x2="300" y2="245" stroke="#3b82f6" strokeWidth="4" />
          <polygon points="300,250 295,240 305,240" fill="#3b82f6" />
          <text x="330" y="235" fill="#93c5fd" fontSize="11" fontWeight="bold">Kalor Q₂</text>

          {/* Reservoir Suhu Rendah T2 */}
          <rect x="200" y="250" width="200" height="40" rx="8" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
          <text x="300" y="274" fill="#dbeafe" fontSize="12" fontWeight="bold" textAnchor="middle">Reservoir Suhu Rendah (T₂)</text>

          {/* Kotak Formula Efisiensi */}
          <rect x="420" y="70" width="160" height="80" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="500" y="95" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">W = Q₁ - Q₂</text>
          <text x="500" y="118" fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">η = 1 - (T₂/T₁)</text>
          <text x="500" y="136" fill="#94a3b8" fontSize="9" textAnchor="middle">Efisiensi Maksimum</text>
        </svg>
      );

    case 'optics_light':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="38" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            PEMBIASAN CAHAYA & PEMBENTUKAN BAYANGAN LENSA CEMBUNG
          </text>
          {/* Sumbu Utama Horizontal */}
          <line x1="50" y1="160" x2="550" y2="160" stroke="#64748b" strokeWidth="2" />
          <text x="555" y="164" fill="#94a3b8" fontSize="9">Sumbu Utama</text>

          {/* Lensa Cembung di Tengah */}
          <path d="M 300 60 Q 330 160, 300 260 Q 270 160, 300 60" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="3" />
          <line x1="300" y1="50" x2="300" y2="270" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />

          {/* Titik Fokus F1 & F2 */}
          <circle cx="200" cy="160" r="4" fill="#facc15" />
          <text x="200" y="178" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">F₁</text>
          <circle cx="400" cy="160" r="4" fill="#facc15" />
          <text x="400" y="178" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">F₂</text>

          {/* Benda Nyata Tegak (Panah Hijau) */}
          <line x1="140" y1="160" x2="140" y2="90" stroke="#22c55e" strokeWidth="4" />
          <polygon points="140,85 134,98 146,98" fill="#22c55e" />
          <text x="140" y="75" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">Benda (s)</text>

          {/* Berkas Sinar Istimewa Lensa */}
          {/* Sinar 1: Sejajar sumbu utama lalu dibiaskan lewat fokus F2 */}
          <line x1="140" y1="90" x2="300" y2="90" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="300" y1="90" x2="480" y2="210" stroke="#ef4444" strokeWidth="2.5" />

          {/* Sinar 2: Menembus pusat optik tanpa dibiaskan */}
          <line x1="140" y1="90" x2="480" y2="210" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />

          {/* Bayangan Nyata Terbalik (Panah Merah Terbalik) */}
          <line x1="480" y1="160" x2="480" y2="210" stroke="#ef4444" strokeWidth="4" />
          <polygon points="480,215 474,202 486,202" fill="#ef4444" />
          <text x="480" y="235" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">Bayangan (s')</text>

          {/* Formula Lensa */}
          <rect x="50" y="245" width="220" height="50" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="160" y="268" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">1/f = 1/s + 1/s'</text>
          <text x="160" y="284" fill="#94a3b8" fontSize="9.5" textAnchor="middle">Perbesaran M = |s'/s| = |h'/h|</text>
        </svg>
      );

    case 'organic_chemistry':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="38" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            KIMIA ORGANIK: RANTAI KARBON (C-H) & CINCIN BENZENA (C₆H₆)
          </text>
          {/* Cincin Aromatik Benzena Segi Enam di Kiri */}
          <g transform="translate(180, 155)">
            <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="none" stroke="#38bdf8" strokeWidth="3.5" />
            {/* Lingkaran Resonansi Elektron Aromatik */}
            <circle cx="0" cy="0" r="32" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6,4" />
            <text x="0" y="5" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">C₆H₆</text>
            <text x="0" y="85" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">Cincin Benzena Aromatik</text>
          </g>

          {/* Rantai Karbon Etanol (Alkohol) di Kanan */}
          <g transform="translate(390, 150)">
            {/* C1 */}
            <circle cx="-50" cy="0" r="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <text x="-50" y="5" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">C</text>
            {/* Ikatan C-C */}
            <line x1="-34" y1="0" x2="14" y2="0" stroke="#f59e0b" strokeWidth="3" />
            {/* C2 */}
            <circle cx="30" cy="0" r="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <text x="30" y="5" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">C</text>
            {/* Ikatan C-OH */}
            <line x1="46" y1="0" x2="84" y2="0" stroke="#ef4444" strokeWidth="3" />
            {/* Gugus OH */}
            <circle cx="102" cy="0" r="18" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
            <text x="102" y="5" fill="#fee2e2" fontSize="11" fontWeight="bold" textAnchor="middle">OH</text>
            <text x="25" y="55" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">Etanol (C₂H₅OH)</text>
          </g>

          {/* Card Formula */}
          <rect x="180" y="260" width="240" height="42" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="300" y="278" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
            Alkana: CₙH₂ₙ₊₂ • Alkena: CₙH₂ₙ
          </text>
          <text x="300" y="293" fill="#cbd5e1" fontSize="9.5" textAnchor="middle">
            Atom C Tetravalen (Mampu mengikat 4 atom lain)
          </text>
        </svg>
      );

    case 'relativity_einstein':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="38" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
            TEORI RELATIVITAS KHUSUS EINSTEIN: E = m · c² & DILATASI WAKTU
          </text>
          {/* Roket Bergerak Mendekati Kecepatan Cahaya */}
          <g transform="translate(180, 140)">
            <ellipse cx="0" cy="0" rx="45" ry="16" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="45,0 20,-12 20,12" fill="#ef4444" />
            {/* Api Jet Peluncur */}
            <polygon points="-45,0 -70,-8 -60,0 -70,8" fill="#f59e0b" />
            <text x="0" y="4" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">v ≈ 0.8c</text>
            <text x="0" y="42" fill="#94a3b8" fontSize="10" textAnchor="middle">Kecepatan Relativistik</text>
          </g>

          {/* Jam Waktu Melambat */}
          <g transform="translate(380, 140)">
            <circle cx="0" cy="0" r="32" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
            <line x1="0" y1="0" x2="0" y2="-18" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="0" y1="0" x2="14" y2="0" stroke="#fde047" strokeWidth="2" />
            <text x="0" y="45" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Jam Berdetak Lambat</text>
          </g>

          {/* Formula Relativitas */}
          <rect x="120" y="225" width="360" height="65" rx="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <text x="300" y="250" fill="#fde047" fontSize="15" fontWeight="extrabold" textAnchor="middle">
            E = m · c²
          </text>
          <text x="300" y="272" fill="#cbd5e1" fontSize="11" textAnchor="middle">
            Dilatasi Waktu: Δt = Δt₀ / √(1 - v²/c²)  •  c = 300.000 km/s
          </text>
        </svg>
      );

    case 'math_exponential_logarithm':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="32" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
            KURVA EKSPONEN y = 2ˣ & LOGARITMA y = ²log x (REFLEKSI y = x)
          </text>
          {/* Koordinat Kartesius */}
          <line x1="70" y1="230" x2="350" y2="230" stroke="#64748b" strokeWidth="2" />
          <line x1="140" y1="50" x2="140" y2="260" stroke="#64748b" strokeWidth="2" />
          <text x="345" y="224" fill="#94a3b8" fontSize="10" fontWeight="bold">X</text>
          <text x="145" y="62" fill="#94a3b8" fontSize="10" fontWeight="bold">Y</text>

          {/* Garis Refleksi y = x */}
          <line x1="90" y1="280" x2="290" y2="80" stroke="#fde047" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x="295" y="85" fill="#fde047" fontSize="9" fontWeight="bold">y = x</text>

          {/* Kurva Eksponen y = 2^x (Merah Muda Menanjak Tajam) */}
          <path d="M 80 228 Q 130 225, 140 215 Q 160 195, 180 155 Q 200 115, 220 55" fill="none" stroke="#ef4444" strokeWidth="3.5" />
          <circle cx="140" cy="215" r="4.5" fill="#ef4444" />
          <text x="125" y="210" fill="#fca5a5" fontSize="9" fontWeight="bold">(0, 1)</text>
          <text x="225" y="60" fill="#ef4444" fontSize="10" fontWeight="bold">y = 2ˣ</text>

          {/* Kurva Logaritma y = log2(x) (Biru Cyan Mendatar) */}
          <path d="M 145 260 Q 150 200, 155 190 Q 175 170, 215 150 Q 255 130, 315 110" fill="none" stroke="#0284c7" strokeWidth="3.5" />
          <circle cx="155" cy="190" r="4.5" fill="#0284c7" />
          <text x="160" y="202" fill="#7dd3fc" fontSize="9" fontWeight="bold">(1, 0)</text>
          <text x="320" y="115" fill="#0284c7" fontSize="10" fontWeight="bold">y = ²log x</text>

          {/* Panel Formula & Konsep */}
          <rect x="365" y="55" width="220" height="235" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <rect x="365" y="55" width="220" height="28" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="475" y="74" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
            📖 RUMUS & SIFAT DASAR
          </text>
          <g transform="translate(378, 96)">
            <text x="0" y="14" fill="#fde047" fontSize="10" fontWeight="bold">• Definisi Invers:</text>
            <text x="10" y="28" fill="#e2e8f0" fontSize="9.5">ᵃlog b = c ⟺ aᶜ = b</text>
            <text x="0" y="50" fill="#34d399" fontSize="10" fontWeight="bold">• Sifat Perkalian:</text>
            <text x="10" y="64" fill="#e2e8f0" fontSize="9.5">ᵃlog(b·c) = ᵃlog b + ᵃlog c</text>
            <text x="0" y="86" fill="#fb923c" fontSize="10" fontWeight="bold">• Sifat Pembagian:</text>
            <text x="10" y="100" fill="#e2e8f0" fontSize="9.5">ᵃlog(b/c) = ᵃlog b - ᵃlog c</text>
            <text x="0" y="122" fill="#f472b6" fontSize="10" fontWeight="bold">• Aplikasi Nyata:</text>
            <text x="10" y="136" fill="#cbd5e1" fontSize="9">Pertumbuhan Bakteri & Skala Richter</text>
            <text x="10" y="150" fill="#94a3b8" fontSize="8.5">Gempa M7 = 10× lebih kuat dari M6</text>
          </g>
        </svg>
      );

    case 'data_structures_algorithms':
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <text x="300" y="32" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
            STRUKTUR DATA (ARRAY, STACK, QUEUE) & KOMPLEKSITAS BIG-O
          </text>

          {/* 1. Array Linear Memory */}
          <g transform="translate(45, 55)">
            <rect x="0" y="0" width="245" height="70" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="12" y="20" fill="#38bdf8" fontSize="10" fontWeight="bold">Array [0..4] - Akses Instan O(1)</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${16 + i * 44}, 28)`}>
                <rect x="0" y="0" width="38" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                <text x="19" y="17" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {[42, 18, 95, 33, 70][i]}
                </text>
                <text x="19" y="36" fill="#94a3b8" fontSize="8" textAnchor="middle">[{i}]</text>
              </g>
            ))}
          </g>

          {/* 2. Stack LIFO vs Queue FIFO */}
          <g transform="translate(45, 145)">
            {/* Stack */}
            <rect x="0" y="0" width="115" height="145" rx="8" fill="#0f172a" stroke="#fb923c" strokeWidth="1.5" />
            <text x="57" y="20" fill="#fb923c" fontSize="9.5" fontWeight="bold" textAnchor="middle">STACK (LIFO)</text>
            <path d="M 25 32 L 25 110 L 90 110 L 90 32" fill="none" stroke="#64748b" strokeWidth="2" />
            <rect x="30" y="86" width="55" height="18" rx="3" fill="#334155" />
            <text x="57" y="99" fill="#f8fafc" fontSize="8.5" textAnchor="middle">Item 1</text>
            <rect x="30" y="64" width="55" height="18" rx="3" fill="#334155" />
            <text x="57" y="77" fill="#f8fafc" fontSize="8.5" textAnchor="middle">Item 2</text>
            <rect x="30" y="42" width="55" height="18" rx="3" fill="#f97316" />
            <text x="57" y="55" fill="#000000" fontSize="8.5" fontWeight="bold" textAnchor="middle">TOP (Pop)</text>
            <text x="57" y="132" fill="#fed7aa" fontSize="8" textAnchor="middle">Last-In First-Out</text>

            {/* Queue */}
            <g transform="translate(130, 0)">
              <rect x="0" y="0" width="115" height="145" rx="8" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
              <text x="57" y="20" fill="#34d399" fontSize="9.5" fontWeight="bold" textAnchor="middle">QUEUE (FIFO)</text>
              <rect x="12" y="45" width="90" height="42" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <text x="24" y="69" fill="#34d399" fontSize="12">➡</text>
              <rect x="42" y="53" width="22" height="26" rx="2" fill="#10b981" />
              <text x="53" y="70" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">Front</text>
              <rect x="68" y="53" width="22" height="26" rx="2" fill="#059669" />
              <text x="79" y="70" fill="#ffffff" fontSize="8" textAnchor="middle">Rear</text>
              <text x="57" y="106" fill="#6ee7b7" fontSize="8" textAnchor="middle">Enqueue ➔ Dequeue</text>
              <text x="57" y="132" fill="#a7f3d0" fontSize="8" textAnchor="middle">First-In First-Out</text>
            </g>
          </g>

          {/* 3. Panel Kanan: Notasi Big-O & AI Machine Learning */}
          <g transform="translate(315, 55)">
            <rect x="0" y="0" width="245" height="235" rx="10" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
            <rect x="0" y="0" width="245" height="28" rx="10" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
            <text x="122" y="19" fill="#c084fc" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              ⚡ NOTASI BIG-O & AI MACHINE LEARNING
            </text>

            {/* Grafik Big-O */}
            <g transform="translate(18, 42)">
              <line x1="0" y1="75" x2="105" y2="75" stroke="#64748b" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2="75" stroke="#64748b" strokeWidth="1.5" />
              <path d="M 0 70 L 100 70" stroke="#22c55e" strokeWidth="2" />
              <text x="104" y="73" fill="#22c55e" fontSize="7.5" fontWeight="bold">O(1)</text>
              <path d="M 0 70 Q 50 65, 100 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
              <text x="104" y="47" fill="#06b6d4" fontSize="7.5" fontWeight="bold">O(log n)</text>
              <line x1="0" y1="70" x2="80" y2="10" stroke="#eab308" strokeWidth="2" />
              <text x="84" y="14" fill="#eab308" fontSize="7.5" fontWeight="bold">O(n)</text>
              <path d="M 0 70 Q 20 60, 40 5" stroke="#ef4444" strokeWidth="2" fill="none" />
              <text x="44" y="12" fill="#ef4444" fontSize="7.5" fontWeight="bold">O(n²)</text>
            </g>

            {/* Neural Net AI Node */}
            <g transform="translate(145, 48)">
              <circle cx="10" cy="15" r="7" fill="#22c55e" />
              <circle cx="10" cy="45" r="7" fill="#22c55e" />
              <circle cx="45" cy="10" r="7" fill="#3b82f6" />
              <circle cx="45" cy="30" r="7" fill="#3b82f6" />
              <circle cx="45" cy="50" r="7" fill="#3b82f6" />
              <circle cx="80" cy="30" r="7" fill="#facc15" />
              {/* Sinapsis */}
              <line x1="17" y1="15" x2="38" y2="10" stroke="#64748b" strokeWidth="1" />
              <line x1="17" y1="15" x2="38" y2="30" stroke="#64748b" strokeWidth="1" />
              <line x1="17" y1="45" x2="38" y2="30" stroke="#64748b" strokeWidth="1" />
              <line x1="17" y1="45" x2="38" y2="50" stroke="#64748b" strokeWidth="1" />
              <line x1="52" y1="30" x2="73" y2="30" stroke="#facc15" strokeWidth="1.5" />
              <text x="45" y="70" fill="#94a3b8" fontSize="8" textAnchor="middle">Jaringan Neural</text>
            </g>

            {/* Keterangan */}
            <g transform="translate(14, 138)">
              <text x="0" y="12" fill="#fde047" fontSize="9" fontWeight="bold">• Binary Search: O(log n)</text>
              <text x="8" y="24" fill="#cbd5e1" fontSize="8">Membagi ruang cari menjadi separuh</text>
              <text x="0" y="42" fill="#a7f3d0" fontSize="9" fontWeight="bold">• Rekursi: Base Case & Loop</text>
              <text x="8" y="54" fill="#cbd5e1" fontSize="8">Fungsi memanggil dirinya sendiri</text>
              <text x="0" y="72" fill="#c084fc" fontSize="9" fontWeight="bold">• Machine Learning (Supervised)</text>
              <text x="8" y="84" fill="#cbd5e1" fontSize="8">Belajar dari data latih & bobot neuron</text>
            </g>
          </g>
        </svg>
      );

    default: // mindmap_general -> diganti Lembar Belajar Ceria Papan Tulis
      return (
        <svg viewBox="0 0 600 320" className="w-full h-full select-none">
          <rect x="10" y="10" width="580" height="300" rx="16" fill="#132e38" stroke="#b45309" strokeWidth="8" />
          <rect x="18" y="18" width="564" height="284" rx="10" fill="#0f262e" stroke="#1e3a47" strokeWidth="2" />

          <line x1="28" y1="72" x2="572" y2="72" stroke="#1e404f" strokeWidth="1.5" strokeDasharray="4,4" />

          <g transform="translate(300, 46)">
            <text x="0" y="0" fill="#fef08a" fontSize="14" fontWeight="900" textAnchor="middle">
              🌟 LEMBAR BELAJAR CERIA ANAK PINTAR 🌟
            </text>
            <text x="0" y="18" fill="#a5f3fc" fontSize="10" fontWeight="bold" textAnchor="middle">
              Belajar Mudah, Menyenangkan & Penuh Petualangan di RadenWorld
            </text>
          </g>

          <g transform="translate(36, 88)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#164e63" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#0284c7" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">📖</text>
            <text x="52" y="24" fill="#38bdf8" fontSize="11" fontWeight="bold">1. Apa Itu?</text>
            <text x="52" y="38" fill="#e0f2fe" fontSize="9.5" fontWeight="bold">Pengenalan Dasar yang Mudah</text>
            <text x="14" y="62" fill="#bae6fd" fontSize="9">Memahami konsep lewat hal seru yang</text>
            <text x="14" y="78" fill="#bae6fd" fontSize="9">sering kita temui di kehidupan sehari-hari!</text>
          </g>

          <g transform="translate(308, 88)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#713f12" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#b45309" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">🔍</text>
            <text x="52" y="24" fill="#fbbf24" fontSize="11" fontWeight="bold">2. Contoh Nyata</text>
            <text x="52" y="38" fill="#fef08a" fontSize="9.5" fontWeight="bold">Ada di Sekitar Kita</text>
            <text x="14" y="62" fill="#fde68a" fontSize="9">Diterapkan pada buah, tanaman,</text>
            <text x="14" y="78" fill="#fde68a" fontSize="9">hewan lucu, dan kegiatan di sekolah!</text>
          </g>

          <g transform="translate(36, 192)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#047857" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">💡</text>
            <text x="52" y="24" fill="#34d399" fontSize="11" fontWeight="bold">3. Tips Pintar</text>
            <text x="52" y="38" fill="#a7f3d0" fontSize="9.5" fontWeight="bold">Cara Gampang Mengingat</text>
            <text x="14" y="62" fill="#d1fae5" fontSize="9">Gunakan jembatan keledai dan cerita</text>
            <text x="14" y="78" fill="#d1fae5" fontSize="9">bergambar agar materi nempel di ingatan!</text>
          </g>

          <g transform="translate(308, 192)">
            <rect x="0" y="0" width="255" height="92" rx="10" fill="#831843" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="28" cy="28" r="16" fill="#be123c" />
            <text x="28" y="34" fontSize="15" textAnchor="middle">🎯</text>
            <text x="52" y="24" fill="#fb7185" fontSize="11" fontWeight="bold">4. Kuis Berhadiah</text>
            <text x="52" y="38" fill="#fecdd3" fontSize="9.5" fontWeight="bold">Kumpulkan Poin EXP!</text>
            <text x="14" y="62" fill="#ffe4e6" fontSize="9">Jawab pertanyaan kuis di sebelah kanan</text>
            <text x="14" y="78" fill="#ffe4e6" fontSize="9">untuk menambah EXP karaktermu!</text>
          </g>
        </svg>
      );
  }
}
