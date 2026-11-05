/**
 * ============================================================================
 * FILE: resources/js/game/data/library/CurriculumMasterRegistry.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Master Registry Kurikulum Pendidikan Nasional Terpadu RadenWorld.
 * Menjamin struktur bertingkat:
 *   PILIH JENJANG (SD 1-6, SMP 1-3, SMA 1-3)
 *     -> PILIH KELAS
 *       -> PILIH MATA PELAJARAN
 *         -> DAFTAR ISI BAB / TOPIK (Minimal 3 - 5 Bab Terstruktur)
 *
 * Seluruh bab memiliki status interaktif:
 *   - 'unread' (Belum Dibuka)
 *   - 'in_progress' (Sedang Dipelajari)
 *   - 'completed' (Selesai Tuntas)
 * Serta terintegrasi langsung dengan Engine Pemutar Video Visual & Narasi Suara.
 * ============================================================================
 */

import { ILibraryTopicItem, SD_LIBRARY_DATA } from './SdLibraryData';
import { SMP_LIBRARY_DATA } from './SmpLibraryData';
import { SMA_LIBRARY_DATA } from './SmaLibraryData';
import { SchoolType, LibraryCategory } from './LibraryMasterData';

export interface ICurriculumSubjectMeta {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
  badgeColor: string; // Tailwind class atau warna hex
  schoolType: SchoolType;
}

export interface ICurriculumGradeMeta {
  key: string;
  label: string;
  shortLabel: string;
  numericGrade: number;
  schoolType: SchoolType;
}

/**
 * Daftar Jenjang Pendidikan
 */
export const CURRICULUM_SCHOOL_LEVELS: {
  type: SchoolType;
  name: string;
  badge: string;
  icon: string;
  description: string;
}[] = [
  {
    type: 'sd',
    name: 'Sekolah Dasar (SD)',
    badge: 'Kelas 1 - 6',
    icon: '🎒',
    description: 'Matematika Dasar, IPAS, Bahasa Indonesia, Pancasila & Bahasa Inggris',
  },
  {
    type: 'smp',
    name: 'Sekolah Menengah Pertama (SMP)',
    badge: 'Kelas 7 - 9',
    icon: '🏫',
    description: 'Matematika, IPA Terpadu, IPS Terpadu, Bahasa Indonesia, Inggris & Koding',
  },
  {
    type: 'sma',
    name: 'Sekolah Menengah Atas (SMA)',
    badge: 'Kelas 10 - 12',
    icon: '🏛️',
    description: 'MIPA, Soshum, Bahasa, Ekonomi, Sejarah & Informatika Lanjutan',
  },
];

/**
 * Daftar Tingkatan Kelas per Jenjang
 */
export const CURRICULUM_GRADES: Record<SchoolType, ICurriculumGradeMeta[]> = {
  sd: [
    { key: 'sd-1', label: 'Kelas 1 SD', shortLabel: 'Kls 1', numericGrade: 1, schoolType: 'sd' },
    { key: 'sd-2', label: 'Kelas 2 SD', shortLabel: 'Kls 2', numericGrade: 2, schoolType: 'sd' },
    { key: 'sd-3', label: 'Kelas 3 SD', shortLabel: 'Kls 3', numericGrade: 3, schoolType: 'sd' },
    { key: 'sd-4', label: 'Kelas 4 SD', shortLabel: 'Kls 4', numericGrade: 4, schoolType: 'sd' },
    { key: 'sd-5', label: 'Kelas 5 SD', shortLabel: 'Kls 5', numericGrade: 5, schoolType: 'sd' },
    { key: 'sd-6', label: 'Kelas 6 SD', shortLabel: 'Kls 6', numericGrade: 6, schoolType: 'sd' },
  ],
  smp: [
    { key: 'smp-7', label: 'Kelas 7 SMP (Kls 1 SMP)', shortLabel: 'Kls 7', numericGrade: 7, schoolType: 'smp' },
    { key: 'smp-8', label: 'Kelas 8 SMP (Kls 2 SMP)', shortLabel: 'Kls 8', numericGrade: 8, schoolType: 'smp' },
    { key: 'smp-9', label: 'Kelas 9 SMP (Kls 3 SMP)', shortLabel: 'Kls 9', numericGrade: 9, schoolType: 'smp' },
  ],
  sma: [
    { key: 'sma-10', label: 'Kelas 10 SMA (Kls 1 SMA)', shortLabel: 'Kls 10', numericGrade: 10, schoolType: 'sma' },
    { key: 'sma-11', label: 'Kelas 11 SMA (Kls 2 SMA)', shortLabel: 'Kls 11', numericGrade: 11, schoolType: 'sma' },
    { key: 'sma-12', label: 'Kelas 12 SMA (Kls 3 SMA)', shortLabel: 'Kls 12', numericGrade: 12, schoolType: 'sma' },
  ],
};

/**
 * Daftar Mata Pelajaran Resmi Sesuai Permintaan Pengguna:
 * 1. SD: Matematika Dasar, Bahasa Indonesia, IPAS (IPA & IPS), Pendidikan Pancasila, Bahasa Inggris Dasar
 * 2. SMP: Matematika, IPA Terpadu (Fisika & Biologi), IPS Terpadu, Bahasa Indonesia, Bahasa Inggris, Informatika/Koding Dasar
 * 3. SMA: Matematika, Fisika, Kimia, Biologi, Ekonomi, Sejarah, Bahasa Indonesia, Bahasa Inggris, Informatika
 */
export const CURRICULUM_SUBJECTS: Record<SchoolType, ICurriculumSubjectMeta[]> = {
  sd: [
    {
      id: 'sd_math',
      name: 'Matematika Dasar',
      shortName: 'Matematika',
      icon: '📐',
      tagline: 'Bilangan cacah, penjumlahan, pengurangan, geometri & pecahan pizza ceria',
      badgeColor: '#FFAE6D',
      schoolType: 'sd',
    },
    {
      id: 'sd_ipas',
      name: 'IPAS (IPA & IPS Terpadu)',
      shortName: 'IPAS',
      icon: '🌱',
      tagline: 'Tumbuhan, daur air, rantai makanan, tubuh manusia, energi & peta lingkungan',
      badgeColor: '#A8E6CF',
      schoolType: 'sd',
    },
    {
      id: 'sd_indonesian',
      name: 'Bahasa Indonesia',
      shortName: 'B. Indonesia',
      icon: '📖',
      tagline: 'Huruf alfabet, suku kata, dongeng fabel binatang, puisi & kalimat SPOK',
      badgeColor: '#BAE6FD',
      schoolType: 'sd',
    },
    {
      id: 'sd_pancasila',
      name: 'Pendidikan Pancasila',
      shortName: 'Pancasila',
      icon: '🇮🇩',
      tagline: '5 Sila Garuda Pancasila, gotong royong, hak anak & aturan di rumah/sekolah',
      badgeColor: '#FEF08A',
      schoolType: 'sd',
    },
    {
      id: 'sd_english',
      name: 'Bahasa Inggris Dasar',
      shortName: 'B. Inggris',
      icon: '🌐',
      tagline: 'Greetings, colors, numbers 1-20, animals, my family & classroom objects',
      badgeColor: '#FFD3B6',
      schoolType: 'sd',
    },
  ],
  smp: [
    {
      id: 'smp_math',
      name: 'Matematika',
      shortName: 'Matematika',
      icon: '📐',
      tagline: 'Aljabar kotak misteri, Pythagoras, persamaan linear, lingkaran & statistika',
      badgeColor: '#FFAE6D',
      schoolType: 'smp',
    },
    {
      id: 'smp_ipa',
      name: 'IPA Terpadu (Fisika & Biologi)',
      shortName: 'IPA Terpadu',
      icon: '🔬',
      tagline: 'Hukum Newton, struktur sel pabrik, tata surya, sistem peredaran & optik',
      badgeColor: '#A8E6CF',
      schoolType: 'smp',
    },
    {
      id: 'smp_ips',
      name: 'IPS Terpadu',
      shortName: 'IPS Terpadu',
      icon: '🌍',
      tagline: 'Kerajaan Nusantara, letak geografis Indonesia, pasar & interaksi sosial',
      badgeColor: '#BAE6FD',
      schoolType: 'smp',
    },
    {
      id: 'smp_indonesian',
      name: 'Bahasa Indonesia',
      shortName: 'B. Indonesia',
      icon: '📚',
      tagline: 'Teks deskripsi, cerita fantasi, teks prosedur, puisi rakyat & surat resmi',
      badgeColor: '#FEF08A',
      schoolType: 'smp',
    },
    {
      id: 'smp_english',
      name: 'Bahasa Inggris',
      shortName: 'B. Inggris',
      icon: '🌐',
      tagline: 'Simple Present, descriptive text, procedure text, recount & asking opinion',
      badgeColor: '#FFD3B6',
      schoolType: 'smp',
    },
    {
      id: 'smp_informatics',
      name: 'Informatika / Koding Dasar',
      shortName: 'Informatika',
      icon: '💻',
      tagline: 'Algoritma logika, koding visual blok Scratch, jaringan internet & data',
      badgeColor: '#C4B5FD',
      schoolType: 'smp',
    },
  ],
  sma: [
    {
      id: 'sma_math',
      name: 'Matematika',
      shortName: 'Matematika',
      icon: '📐',
      tagline: 'Eksponen logaritma, trigonometri, kalkulus diferensial, integral & matriks',
      badgeColor: '#FFAE6D',
      schoolType: 'sma',
    },
    {
      id: 'sma_physics',
      name: 'Fisika',
      shortName: 'Fisika',
      icon: '⚡',
      tagline: 'Vektor gaya gerak, fluida dinamis, termodinamika, gelombang & medan listrik',
      badgeColor: '#BAE6FD',
      schoolType: 'sma',
    },
    {
      id: 'sma_chemistry',
      name: 'Kimia',
      shortName: 'Kimia',
      icon: '🧪',
      tagline: 'Struktur atom kuantum, ikatan kimia, stoikiometri, larutan asam basa & pH',
      badgeColor: '#A8E6CF',
      schoolType: 'sma',
    },
    {
      id: 'sma_biology',
      name: 'Biologi',
      shortName: 'Biologi',
      icon: '🧬',
      tagline: 'Sel eukariotik, virus dan bakteri, genetika DNA RNA, metabolisme & biotek',
      badgeColor: '#86EFAC',
      schoolType: 'sma',
    },
    {
      id: 'sma_economics',
      name: 'Ekonomi',
      shortName: 'Ekonomi',
      icon: '📈',
      tagline: 'Permintaan penawaran pasar, inflasi, pendapatan nasional, APBN & perbankan',
      badgeColor: '#FEF08A',
      schoolType: 'sma',
    },
    {
      id: 'sma_history',
      name: 'Sejarah',
      shortName: 'Sejarah',
      icon: '🏛️',
      tagline: 'Jalur rempah maritim, pergerakan Budi Utomo, Proklamasi 1945 & Diplomasi',
      badgeColor: '#FFD3B6',
      schoolType: 'sma',
    },
    {
      id: 'sma_indonesian',
      name: 'Bahasa Indonesia',
      shortName: 'B. Indonesia',
      icon: '📚',
      tagline: 'Teks LHO ilmiah, eksposisi argumen, resensi buku, negosiasi & karya ilmiah',
      badgeColor: '#FDE047',
      schoolType: 'sma',
    },
    {
      id: 'sma_english',
      name: 'Bahasa Inggris',
      shortName: 'B. Inggris',
      icon: '🌐',
      tagline: 'Analytical exposition, hortatory, report text, conditional sentence & IELTS',
      badgeColor: '#93C5FD',
      schoolType: 'sma',
    },
    {
      id: 'sma_informatics',
      name: 'Informatika',
      shortName: 'Informatika',
      icon: '💻',
      tagline: 'Pemrograman Python, basis data SQL, keamanan siber & kecerdasan buatan',
      badgeColor: '#DDD6FE',
      schoolType: 'sma',
    },
  ],
};

/**
 * Tambahan Topik Kurikulum Pengayaan agar setiap Mapel di SD, SMP, SMA
 * memiliki minimal 3-5 Bab lengkap dan terstruktur.
 */
export const SUPPLEMENTARY_CURRICULUM_TOPICS: ILibraryTopicItem[] = [
  // SMP 7 - IPS Terpadu Bab 3
  {
    id: 'smp7-ips-03',
    gradeKey: 'smp-7',
    gradeName: 'Kelas 7 SMP',
    schoolType: 'smp',
    subjectCategory: 'IPS / Sosial',
    subjectName: 'Ilmu Pengetahuan Sosial',
    title: 'Kegiatan Ekonomi: Produksi, Distribusi, dan Konsumsi',
    badge: 'Ekonomi Terpadu',
    summary: 'Mengenal rantai ekonomi dari produsen bahan baku hingga konsumen akhir.',
    points: [
      'Produksi menciptakan atau menambah nilai guna suatu barang.',
      'Distribusi menyalurkan barang dari produsen ke konsumen dengan transportasi cepat.',
      'Konsumsi adalah pemanfaatan barang dan jasa untuk memenuhi kebutuhan hidup.',
    ],
    keyFormulaOrConcept: 'Nilai Barang = Biaya Produksi + Margin Distribusi',
    funFact: 'Pasar terapung di Banjarmasin telah melakukan transaksi barter dan jual beli di atas perahu sejak abad ke-14!',
    quiz: {
      question: 'Orang atau badan yang mengantarkan barang dari pabrik ke toko disebut...',
      options: ['Distributor', 'Produsen', 'Konsumen'],
      answerIndex: 0,
      explanation: 'Distributor bertugas menyalurkan dan mendistribusikan barang dari produsen ke konsumen.',
    },
  },
  // SMP 7 - Informatika Bab 2 & 3
  {
    id: 'smp7-inf-02',
    gradeKey: 'smp-7',
    gradeName: 'Kelas 7 SMP',
    schoolType: 'smp',
    subjectCategory: 'Informatika & Seni',
    subjectName: 'Informatika',
    title: 'Algoritma Pemrograman dan Flowchart Logika',
    badge: 'Flowchart',
    summary: 'Menyusun urutan langkah logis komputer menggunakan bagan alir terstandar.',
    points: [
      'Bagan alir (flowchart) menggunakan simbol oval untuk Start/End dan belah ketupat untuk Keputusan.',
      'Algoritma harus memiliki instruksi yang jelas, berhingga, dan tidak ambigu.',
      'Percabangan logika (If-Else) memungkinkan komputer memilih jalur keputusan.',
    ],
    keyFormulaOrConcept: 'Input ➔ Proses ➔ Percabangan (If/Else) ➔ Output',
    funFact: 'Kata algoritma berasal dari nama matematikawan Muslim penemu aljabar, Muhammad ibn Musa al-Khwarizmi!',
    quiz: {
      question: 'Simbol belah ketupat dalam bagan alir (flowchart) berfungsi untuk...',
      options: ['Pengambilan keputusan (Decision)', 'Memulai program (Start)', 'Mencetak hasil di kertas'],
      answerIndex: 0,
      explanation: 'Simbol belah ketupat melambangkan kondisi percabangan logika (Ya / Tidak).',
    },
  },
  {
    id: 'smp7-inf-03',
    gradeKey: 'smp-7',
    gradeName: 'Kelas 7 SMP',
    schoolType: 'smp',
    subjectCategory: 'Informatika & Seni',
    subjectName: 'Informatika',
    title: 'Perangkat Keras (Hardware) & Sistem Komputer',
    badge: 'Hardware & OS',
    summary: 'Memahami kerja CPU (Otak), RAM (Memori Cepat), dan Penyimpanan Permanen.',
    points: [
      'CPU (Central Processing Unit) mengeksekusi milyaran instruksi logika per detik.',
      'RAM menyimpan data sementara saat aplikasi sedang dibuka.',
      'Sistem Operasi (OS) bertindak sebagai jembatan antara aplikasi perangkat lunak dan komponen fisik.',
    ],
    keyFormulaOrConcept: 'Input Unit ➔ CPU + RAM ➔ Output Unit + Storage',
    funFact: 'Komputer modern di dalam jam tangan pintarmu memiliki kekuatan jutaan kali lebih cepat daripada komputer misi Apollo 11 yang membawa manusia ke Bulan!',
    quiz: {
      question: 'Komponen yang sering disebut sebagai "Otak Utama" dalam komputer adalah...',
      options: ['CPU (Processor)', 'Monitor', 'Keyboard'],
      answerIndex: 0,
      explanation: 'CPU bertugas mengolah dan mengeksekusi semua instruksi komputasi.',
    },
  },
  // SMP 8 - Bahasa Inggris Bab 3
  {
    id: 'smp8-eng-03',
    gradeKey: 'smp-8',
    gradeName: 'Kelas 8 SMP',
    schoolType: 'smp',
    subjectCategory: 'Bahasa Inggris',
    subjectName: 'Bahasa Inggris',
    title: 'Recount Text: Sharing Personal Experiences',
    badge: 'Recount Text',
    summary: 'Menceritakan kembali peristiwa masa lampau secara kronologis menggunakan Past Tense.',
    points: [
      'Structure: Orientation (Who, where, when), Events (Chronology), and Re-orientation (Personal comment).',
      'Uses Past Tense verbs (went, saw, played, enjoyed) and time connectives (first, then, after that).',
      'The purpose is to inform or entertain the readers about past memories.',
    ],
    keyFormulaOrConcept: 'Subject + Verb 2 (Past) + Object / Time Complement',
    funFact: 'Writing personal diaries and travel recount blogs improves English fluency by over 40%!',
    quiz: {
      question: 'Which of the following sentences uses the correct Past Tense for a recount text?',
      options: ['Yesterday, we visited the museum and saw dinosaur fossils.', 'Tomorrow, we go to the museum.', 'We are visit museum right now.'],
      answerIndex: 0,
      explanation: '"Visited" and "saw" are correct past verb forms indicating past events.',
    },
  },
  // SMP 8 - IPS Bab 3
  {
    id: 'smp8-ips-03',
    gradeKey: 'smp-8',
    gradeName: 'Kelas 8 SMP',
    schoolType: 'smp',
    subjectCategory: 'IPS / Sosial',
    subjectName: 'Ilmu Pengetahuan Sosial',
    title: 'Pengaruh Kolonialisme dan Kebangkitan Nasional di Nusantara',
    badge: 'Sejarah Nasional',
    summary: 'Perjuangan bangsa Indonesia dari perlawanan kedaerahan hingga diplomasi modern.',
    points: [
      'Monopoli perdagangan rempah VOC memicu perlawanan rakyat di Maluku, Jawa, dan Sulawesi.',
      'Lahirnya Budi Utomo pada 20 Mei 1908 menandai era baru perjuangan diplomasi dan pendidikan.',
      'Sumpah Pemuda 1928 menyatukan tekad satu tanah air, satu bangsa, dan satu bahasa persatuan.',
    ],
    keyFormulaOrConcept: 'Perlawanan Fisik Bersatu ➔ Diplomasi Modern ➔ Kemerdekaan 1945',
    funFact: 'Tanggal berdirinya Budi Utomo (20 Mei) kini diperingati setiap tahun sebagai Hari Kebangkitan Nasional!',
    quiz: {
      question: 'Organisasi pergerakan nasional pertama di Indonesia yang didirikan pada 20 Mei 1908 adalah...',
      options: ['Budi Utomo', 'Indische Partij', 'Sarekat Islam'],
      answerIndex: 0,
      explanation: 'Budi Utomo didirikan oleh dr. Soetomo dan mahasiswa STOVIA sebagai tonggak Kebangkitan Nasional.',
    },
  },
  // SMP 9 - Bahasa Inggris Bab 3
  {
    id: 'smp9-eng-03',
    gradeKey: 'smp-9',
    gradeName: 'Kelas 9 SMP',
    schoolType: 'smp',
    subjectCategory: 'Bahasa Inggris',
    subjectName: 'Bahasa Inggris',
    title: 'Report Text: Describing Natural and Scientific Facts',
    badge: 'Report Text',
    summary: 'Menyajikan informasi faktual tentang hewan, tumbuhan, dan fenomena alam.',
    points: [
      'Structure: General Classification (scientific grouping) and Description (parts, qualities, habits).',
      'Uses Present Simple Tense and passive voice for factual scientific statements.',
      'Focuses on generic participants, such as "Whales" or "Earthquakes", rather than a specific pet.',
    ],
    keyFormulaOrConcept: 'Subject (Plural/Generic) + Present Verb (is/are/breathes)',
    funFact: 'Scientific reports written in clear English allow researchers across 190+ countries to collaborate seamlessly!',
    quiz: {
      question: 'What is the main purpose of a Report Text?',
      options: ['To describe things as they are based on systematic scientific facts', 'To tell a funny fairy tale', 'To teach how to make a cup of coffee'],
      answerIndex: 0,
      explanation: 'Report text presents factual information about classes of things (natural or non-natural phenomena).',
    },
  },
  // SMP 9 - Informatika Bab 2 & 3
  {
    id: 'smp9-inf-02',
    gradeKey: 'smp-9',
    gradeName: 'Kelas 9 SMP',
    schoolType: 'smp',
    subjectCategory: 'Informatika & Seni',
    subjectName: 'Informatika',
    title: 'Jaringan Komputer dan Keamanan Berinternet (Cyber Safety)',
    badge: 'Jaringan & Keamanan',
    summary: 'Memahami arsitektur internet, IP Address, enkripsi, dan etika privasi online.',
    points: [
      'Internet adalah jaringan komputer global yang terhubung melalui protokol TCP/IP.',
      'Protokol HTTPS menggunakan enkripsi data agar transaksi dan kata sandi tidak disadap pihak luar.',
      'Prinsip keamanan digital: Gunakan otentikasi dua faktor (2FA) dan jangan bagikan data sensitif di media sosial.',
    ],
    keyFormulaOrConcept: 'Client Request ➔ Enkripsi SSL/TLS ➔ Router ➔ Web Server Aman',
    funFact: 'Kabel serat optik bawah laut yang menghubungkan benua mengirim data dengan kecepatan hampir 300.000 km/detik menggunakan pulsa cahaya!',
    quiz: {
      question: 'Tanda gembok hijau atau awalan "HTTPS" pada alamat website menandakan bahwa...',
      options: ['Komunikasi data dienkripsi dengan aman', 'Website tersebut sedang rusak', 'Komputer terkena virus'],
      answerIndex: 0,
      explanation: 'HTTPS (Hypertext Transfer Protocol Secure) mengenkripsi lalu lintas data antara pengguna dan server web.',
    },
  },
  {
    id: 'smp9-inf-03',
    gradeKey: 'smp-9',
    gradeName: 'Kelas 9 SMP',
    schoolType: 'smp',
    subjectCategory: 'Informatika & Seni',
    subjectName: 'Informatika',
    title: 'Analisis Data dan Visualisasi Angka (Spreadsheet & Grafik)',
    badge: 'Analisis Data',
    summary: 'Mengolah angka mentah menjadi grafik diagram batang, lingkaran, dan tabel analitik.',
    points: [
      'Rumus dasar spreadsheet: SUM (menjumlahkan), AVERAGE (rata-rata), dan COUNT (menghitung jumlah baris).',
      'Diagram batang efektif untuk membandingkan kategori data; diagram lingkaran untuk melihat proporsi persentase.',
      'Data yang divisualisasikan dengan tepat membantu kita mengambil keputusan ilmiah yang akurat.',
    ],
    keyFormulaOrConcept: '=AVERAGE(A1:A50) | =SUM(B1:B20)',
    funFact: 'Dunia menghasilkan lebih dari 320 juta terabyte data baru setiap harinya!',
    quiz: {
      question: 'Rumus spreadsheet yang digunakan untuk menghitung nilai rata-rata adalah...',
      options: ['=AVERAGE()', '=SUM()', '=MAX()'],
      answerIndex: 0,
      explanation: '=AVERAGE() menjumlahkan seluruh nilai dan membaginya dengan total entri data.',
    },
  },
  // SMA 10 - Ekonomi Bab 2 & 3
  {
    id: 'sma10-eko-02',
    gradeKey: 'sma-10',
    gradeName: 'Kelas 10 SMA',
    schoolType: 'sma',
    subjectCategory: 'IPS / Sosial',
    subjectName: 'Ekonomi',
    title: 'Hukum Permintaan, Penawaran, dan Keseimbangan Pasar',
    badge: 'Mekanisme Pasar',
    summary: 'Interaksi antara pembeli dan penjual yang membentuk harga keseimbangan pasar (Equilibrium).',
    points: [
      'Hukum Permintaan: Jika harga naik, jumlah barang yang diminta turun (ceteris paribus) 📉.',
      'Hukum Penawaran: Jika harga naik, produsen akan menambah jumlah barang yang ditawarkan 📈.',
      'Titik Keseimbangan (Equilibrium Point): Titik temu di mana jumlah permintaan sama dengan jumlah penawaran (Qd = Qs).',
    ],
    keyFormulaOrConcept: 'Qd = Qs ➔ Pe (Harga Ekuilibrium)',
    funFact: 'Teori "Tangan Tak Terlihat" (Invisible Hand) karya Adam Smith menjelaskan bagaimana pasar bebas dapat menyeimbangkan dirinya sendiri secara mandiri!',
    quiz: {
      question: 'Berdasarkan hukum permintaan, apa yang terjadi jika harga beras tiba-tiba melonjak naik?',
      options: ['Jumlah permintaan beras cenderung menurun', 'Permintaan beras akan naik drastis', 'Tidak ada pengaruh sama sekali'],
      answerIndex: 0,
      explanation: 'Hukum permintaan menyatakan ada hubungan berbanding terbalik antara tingkat harga dan kuantitas barang yang diminta.',
    },
  },
  {
    id: 'sma10-eko-03',
    gradeKey: 'sma-10',
    gradeName: 'Kelas 10 SMA',
    schoolType: 'sma',
    subjectCategory: 'IPS / Sosial',
    subjectName: 'Ekonomi',
    title: 'Bank Sentral, Sistem Pembayaran, dan Uang Digital',
    badge: 'Perbankan & Moneter',
    summary: 'Peran Bank Indonesia dalam stabilitas rupiah dan evolusi alat tukar dari koin ke QRIS.',
    points: [
      'Tugas Bank Indonesia: Menjaga stabilitas nilai rupiah melalui kebijakan moneter dan suku bunga acuan.',
      'Fungsi Asli Uang: Sebagai alat tukar umum (medium of exchange) dan satuan hitung nilai (unit of account).',
      'Sistem pembayaran modern (seperti QRIS dan BI-FAST) memungkinkan transaksi tanpa uang tunai secara seketika.',
    ],
    keyFormulaOrConcept: 'M × V = P × T (Teori Kuantitas Uang Irving Fisher)',
    funFact: 'Standar QRIS Indonesia kini telah diakui dan dapat digunakan langsung oleh wisatawan di Singapura, Malaysia, dan Thailand!',
    quiz: {
      question: 'Lembaga independen di Indonesia yang berwenang mencetak uang rupiah dan mengatur kebijakan moneter adalah...',
      options: ['Bank Indonesia (BI)', 'Otoritas Jasa Keuangan (OJK)', 'Kementerian Perdagangan'],
      answerIndex: 0,
      explanation: 'Bank Indonesia adalah Bank Sentral Republik Indonesia yang memiliki wewenang tunggal mengeluarkan mata uang rupiah.',
    },
  },
  // SMA 10 - Sejarah Bab 1, 2, 3
  {
    id: 'sma10-sej-01',
    gradeKey: 'sma-10',
    gradeName: 'Kelas 10 SMA',
    schoolType: 'sma',
    subjectCategory: 'IPS / Sosial',
    subjectName: 'Sejarah',
    title: 'Pengantar Ilmu Sejarah: Manusia, Ruang, dan Waktu',
    badge: 'Konsep Sejarah',
    summary: 'Memahami metodologi penelitian sejarah, kritik sumber, dan konsep kronologi peradaban.',
    points: [
      'Unsur utama peristiwa sejarah: Manusia sebagai pelaku, Ruang sebagai tempat kejadian, dan Waktu sebagai penanda masa.',
      'Metode sejarah: Heuristik (pengumpulan sumber), Verifikasi/Kritik (uji keaslian), Interpretasi, dan Historiografi (penulisan).',
      'Konsep diakronik mempelajari peristiwa memanjang dalam waktu; sinkronik menganalisis peristiwa secara mendalam pada satu kurun masa.',
    ],
    keyFormulaOrConcept: 'Heuristik ➔ Kritik Sumber ➔ Interpretasi ➔ Historiografi',
    funFact: 'Kata "Sejarah" diserap dari bahasa Arab "Syajaratun" yang berarti pohon, melambangkan silsilah keturunan yang terus tumbuh bercabang!',
    quiz: {
      question: 'Langkah pertama dalam metode penelitian sejarah untuk mencari dan mengumpulkan sumber-sumber sejarah disebut...',
      options: ['Heuristik', 'Historiografi', 'Interpretasi'],
      answerIndex: 0,
      explanation: 'Heuristik adalah tahap pencarian dan pengumpulan jejak atau sumber sejarah yang relevan.',
    },
  },
  {
    id: 'sma10-sej-02',
    gradeKey: 'sma-10',
    gradeName: 'Kelas 10 SMA',
    schoolType: 'sma',
    subjectCategory: 'IPS / Sosial',
    subjectName: 'Sejarah',
    title: 'Jalur Rempah Maritim dan Peradaban Kerajaan Bahari Nusantara',
    badge: 'Jalur Rempah',
    summary: 'Kejayaan maritim Sriwijaya dan Majapahit yang mengendalikan jalur perdagangan rempah dunia.',
    points: [
      'Selat Malaka dan Selat Sunda merupakan urat nadi perdagangan maritim rempah pala, cengkih, dan lada internasional.',
      'Kerajaan Sriwijaya menguasai hegemoni laut melalui armada maritim tangguh dan pusat studi Buddha Asia Tenggara.',
      'Sumpah Palapa Patih Gajah Mada menegaskan visi penyatuan pulau-pulau Nusantara di bawah panji Majapahit.',
    ],
    keyFormulaOrConcept: 'Jalur Rempah ➔ Pelabuhan Transito ➔ Kejayaan Kemaritiman Nusantara',
    funFact: 'Pada abad pertengahan di Eropa, segenggam buah pala dari Kepulauan Banda nilainya lebih mahal daripada emas murni!',
    quiz: {
      question: 'Kerajaan maritim besar di Sumatera yang menjadi pusat penguasa Selat Malaka pada abad ke-7 hingga ke-11 adalah...',
      options: ['Kerajaan Sriwijaya', 'Kerajaan Tarumanegara', 'Kesultanan Demak'],
      answerIndex: 0,
      explanation: 'Sriwijaya adalah kerajaan bahari yang mengendalikan pelayaran internasional di Selat Malaka.',
    },
  },
  {
    id: 'sma10-sej-03',
    gradeKey: 'sma-10',
    gradeName: 'Kelas 10 SMA',
    schoolType: 'sma',
    subjectCategory: 'IPS / Sosial',
    subjectName: 'Sejarah',
    title: 'Masuknya Agama dan Kebudayaan Islam ke Nusantara',
    badge: 'Peradaban Islam',
    summary: 'Teori Gujarat, Makkah, dan Persia serta akulturasi damai melalui perdagangan dan tasawuf.',
    points: [
      'Penyebaran Islam di Nusantara berlangsung secara damai melalui saluran perdagangan, pernikahan, kesenian, dan pendidikan pesantren.',
      'Wali Songo memadukan kearifan budaya lokal Jawa (seperti wayang kulit dan tembang gending) dengan ajaran ketauhidan.',
      'Kerajaan Samudera Pasai di Aceh menjadi kesultanan Islam pertama yang mencetak mata uang koin emas dirham.',
    ],
    keyFormulaOrConcept: 'Saluran Perdagangan + Kesenian Budaya = Akulturasi Harmonis',
    funFact: 'Sunan Kalijaga menggunakan kesenian wayang kulit purwa sebagai media syiar yang berhasil menarik simpati ribuan warga Nusantara!',
    quiz: {
      question: 'Kerajaan Islam tertua di Nusantara yang terletak di wilayah pesisir utara Sumatera adalah...',
      options: ['Samudera Pasai', 'Kesultanan Mataram', 'Kesultanan Banten'],
      answerIndex: 0,
      explanation: 'Samudera Pasai didirikan pada abad ke-13 oleh Sultan Malik al-Saleh dan menjadi kesultanan Islam tertua di Indonesia.',
    },
  },
  // SMA 10 - Informatika Bab 2 & 3
  {
    id: 'sma10-inf-02',
    gradeKey: 'sma-10',
    gradeName: 'Kelas 10 SMA',
    schoolType: 'sma',
    subjectCategory: 'Informatika & Seni',
    subjectName: 'Informatika',
    title: 'Dasar Pemrograman Bahasa Python: Sintaks, Tipe Data & Kondisi',
    badge: 'Python Dasar',
    summary: 'Menulis skrip kode pertama menggunakan bahasa pemrograman modern Python.',
    points: [
      'Python memiliki sintaks bersih dan mudah dibaca: print("Halo Dunia!").',
      'Tipe data utama: Integer (bilangan bulat), Float (desimal), String (teks), dan Boolean (True/False).',
      'Struktur kendali percabangan (if, elif, else) mengontrol alur eksekusi instruksi komputer.',
    ],
    keyFormulaOrConcept: 'if nilai >= 75: status = "LULUS" else: status = "REMIDI"',
    funFact: 'Nama bahasa pemrograman Python bukan diambil dari jenis ular, melainkan dari acara komedi sketsa BBC "Monty Python\'s Flying Circus"!',
    quiz: {
      question: 'Perintah yang digunakan untuk mencetak teks ke layar terminal pada bahasa Python adalah...',
      options: ['print("Teks")', 'echo "Teks"', 'System.out.println("Teks")'],
      answerIndex: 0,
      explanation: 'print() adalah fungsi bawaan standar Python untuk menampilkan output ke konsol.',
    },
  },
  {
    id: 'sma10-inf-03',
    gradeKey: 'sma-10',
    gradeName: 'Kelas 10 SMA',
    schoolType: 'sma',
    subjectCategory: 'Informatika & Seni',
    subjectName: 'Informatika',
    title: 'Struktur Data List, Tuple, Dictionary dan Perulangan (Loops)',
    badge: 'Struktur Data',
    summary: 'Menyimpan dan mengolah koleksi data banyak menggunakan perulangan for dan while.',
    points: [
      'List (ditulis dengan kurung siku [ ]) dapat diubah nilainya dan berurutan dari indeks 0.',
      'Dictionary menyimpan pasangan kunci dan nilai (key-value pair) seperti buku telepon.',
      'Perulangan for item in list mengotomatisasi pemrosesan ribuan data dalam sekejap.',
    ],
    keyFormulaOrConcept: 'for i in range(len(data)): total += data[i]',
    funFact: 'Indeks array atau list di hampir semua bahasa komputer modern dimulai dari angka 0, bukan 1!',
    quiz: {
      question: 'Jika daftar nama = ["Budi", "Siti", "Edo"], maka nama[0] akan menghasilkan...',
      options: ['"Budi"', '"Siti"', '"Edo"'],
      answerIndex: 0,
      explanation: 'Indeks pertama dalam pemrograman komputer selalu dimulai dari indeks 0.',
    },
  },
];

/** Gabungan Master Seluruh 255+ Topik Kurikulum Terpadu */
export const ALL_COMBINED_TOPICS: ILibraryTopicItem[] = [
  ...SD_LIBRARY_DATA,
  ...SMP_LIBRARY_DATA,
  ...SMA_LIBRARY_DATA,
  ...SUPPLEMENTARY_CURRICULUM_TOPICS,
];

/**
 * Filter Topik Berdasarkan Kurikulum Resmi:
 * Sekolah (SD/SMP/SMA) -> Kelas (sd-1..sma-12) -> Mapel (sd_math, smp_ipa, sma_physics, dll.)
 */
export function getCurriculumTopics(params: {
  schoolType: SchoolType;
  gradeKey: string;
  subjectId: string;
  searchQuery?: string;
}): ILibraryTopicItem[] {
  const { schoolType, gradeKey, subjectId, searchQuery } = params;

  let filtered = ALL_COMBINED_TOPICS.filter((t) => {
    if (t.schoolType !== schoolType) return false;
    if (t.gradeKey !== gradeKey) return false;

    // Filter berdasarkan Subject ID yang spesifik
    switch (subjectId) {
      // SD Subjects
      case 'sd_math':
        return t.subjectCategory === 'Matematika';
      case 'sd_ipas':
        return (
          t.subjectCategory === 'IPA / Sains' ||
          t.subjectCategory === 'IPS / Sosial' ||
          t.subjectName.toLowerCase().includes('ipas') ||
          t.title.toLowerCase().includes('fotosintesis') ||
          t.title.toLowerCase().includes('daur air') ||
          t.title.toLowerCase().includes('tubuh') ||
          t.title.toLowerCase().includes('energi')
        );
      case 'sd_indonesian':
        return t.subjectCategory === 'Bahasa Indonesia';
      case 'sd_pancasila':
        return (
          t.subjectCategory === 'Pancasila & PKn' ||
          t.subjectName.toLowerCase().includes('pancasila')
        );
      case 'sd_english':
        return t.subjectCategory === 'Bahasa Inggris';

      // SMP Subjects
      case 'smp_math':
        return t.subjectCategory === 'Matematika';
      case 'smp_ipa':
        return (
          t.subjectCategory === 'IPA / Sains' ||
          t.subjectName.toLowerCase().includes('ipa') ||
          t.subjectName.toLowerCase().includes('fisika') ||
          t.subjectName.toLowerCase().includes('biologi')
        );
      case 'smp_ips':
        return (
          t.subjectCategory === 'IPS / Sosial' ||
          t.subjectName.toLowerCase().includes('ips') ||
          t.subjectName.toLowerCase().includes('sosial') ||
          t.subjectName.toLowerCase().includes('ekonomi')
        );
      case 'smp_indonesian':
        return t.subjectCategory === 'Bahasa Indonesia';
      case 'smp_english':
        return t.subjectCategory === 'Bahasa Inggris';
      case 'smp_informatics':
        return (
          t.subjectCategory === 'Informatika & Seni' ||
          t.subjectName.toLowerCase().includes('informatika') ||
          t.badge.toLowerCase().includes('koding') ||
          t.badge.toLowerCase().includes('flowchart')
        );

      // SMA Subjects
      case 'sma_math':
        return t.subjectName.toLowerCase().includes('matematika');
      case 'sma_physics':
        return (
          t.subjectName.toLowerCase().includes('fisika') ||
          t.badge.toLowerCase().includes('vektor') ||
          t.badge.toLowerCase().includes('kinematika') ||
          t.badge.toLowerCase().includes('hukum newton') ||
          t.badge.toLowerCase().includes('termodinamika') ||
          t.badge.toLowerCase().includes('fluida') ||
          t.badge.toLowerCase().includes('kuantum')
        );
      case 'sma_chemistry':
        return (
          t.subjectName.toLowerCase().includes('kimia') ||
          t.badge.toLowerCase().includes('atom') ||
          t.badge.toLowerCase().includes('larutan') ||
          t.badge.toLowerCase().includes('ph') ||
          t.badge.toLowerCase().includes('stoikiometri') ||
          t.badge.toLowerCase().includes('ikatan')
        );
      case 'sma_biology':
        return (
          t.subjectName.toLowerCase().includes('biologi') ||
          t.badge.toLowerCase().includes('sel') ||
          t.badge.toLowerCase().includes('virus') ||
          t.badge.toLowerCase().includes('dna') ||
          t.badge.toLowerCase().includes('enzim') ||
          t.badge.toLowerCase().includes('genetika')
        );
      case 'sma_economics':
        return (
          t.subjectName.toLowerCase().includes('ekonomi') ||
          t.badge.toLowerCase().includes('ekonomi') ||
          t.badge.toLowerCase().includes('pasar') ||
          t.badge.toLowerCase().includes('moneter')
        );
      case 'sma_history':
        return (
          t.subjectName.toLowerCase().includes('sejarah') ||
          t.badge.toLowerCase().includes('sejarah') ||
          t.badge.toLowerCase().includes('rempah') ||
          t.badge.toLowerCase().includes('islam') ||
          t.badge.toLowerCase().includes('proklamasi')
        );
      case 'sma_indonesian':
        return t.subjectCategory === 'Bahasa Indonesia';
      case 'sma_english':
        return t.subjectCategory === 'Bahasa Inggris';
      case 'sma_informatics':
        return (
          t.subjectCategory === 'Informatika & Seni' ||
          t.subjectName.toLowerCase().includes('informatika') ||
          t.badge.toLowerCase().includes('python') ||
          t.badge.toLowerCase().includes('data')
        );

      default:
        return true;
    }
  });

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Mencari satu topik secara cepat berdasarkan ID
 */
export function findCurriculumTopicById(id: string): ILibraryTopicItem | undefined {
  return ALL_COMBINED_TOPICS.find((t) => t.id === id);
}
