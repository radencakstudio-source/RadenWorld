/**
 * ============================================================================
 * FILE: resources/js/game/data/SchoolQuizBank.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Bank Soal Kuis Pelajaran Sekolah RadenWorld berisi 100 Soal Edukasi Komprehensif
 * (Matematika, IPA/Sains, IPS/Geografi, Bahasa Indonesia, Bahasa Inggris, & Pancasila/Umum).
 * 
 * ATURAN MINIGAME:
 * 1. Setiap sesi kuis memilih 20 soal secara acak tanpa duplikasi.
 * 2. Posisi 4 pilihan jawaban (A, B, C, D) diacak secara dinamis pada tiap soal
 *    sehingga jawaban benar tidak pernah terpaku pada posisi tertentu.
 * ============================================================================
 */

import {
  SD1_QUESTIONS,
  SD2_QUESTIONS,
  SD3_QUESTIONS,
  SD4_QUESTIONS,
  SD5_QUESTIONS,
  SD6_QUESTIONS,
} from './quizzes/SdQuizData';
import {
  SMP1_QUESTIONS,
  SMP2_QUESTIONS,
  SMP3_QUESTIONS,
} from './quizzes/SmpQuizData';
import {
  SMA1_QUESTIONS,
  SMA2_QUESTIONS,
  SMA3_QUESTIONS,
} from './quizzes/SmaQuizData';

export interface ISchoolQuizQuestion {
  id: string;
  subject: string;
  emoji: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: [string, string, string];
  explanation: string;
}

/**
 * Pemetaan Lengkap Bank Soal Sesuai Jenjang & Kelas:
 * SD 1-6 (100 soal/kelas = 600 soal)
 * SMP 1-3 (100 soal/kelas = 300 soal)
 * SMA 1-3 (100 soal/kelas = 300 soal)
 * Total: 1.200 Soal Kurikulum Resmi Komprehensif
 */
export const GRADE_QUIZ_MAP: Record<string, ISchoolQuizQuestion[]> = {
  'sd-1': SD1_QUESTIONS,
  'sd-2': SD2_QUESTIONS,
  'sd-3': SD3_QUESTIONS,
  'sd-4': SD4_QUESTIONS,
  'sd-5': SD5_QUESTIONS,
  'sd-6': SD6_QUESTIONS,
  'smp-1': SMP1_QUESTIONS,
  'smp-2': SMP2_QUESTIONS,
  'smp-3': SMP3_QUESTIONS,
  'sma-1': SMA1_QUESTIONS,
  'sma-2': SMA2_QUESTIONS,
  'sma-3': SMA3_QUESTIONS,
};

export {
  SD1_QUESTIONS,
  SD2_QUESTIONS,
  SD3_QUESTIONS,
  SD4_QUESTIONS,
  SD5_QUESTIONS,
  SD6_QUESTIONS,
  SMP1_QUESTIONS,
  SMP2_QUESTIONS,
  SMP3_QUESTIONS,
  SMA1_QUESTIONS,
  SMA2_QUESTIONS,
  SMA3_QUESTIONS,
};

export const SCHOOL_QUIZ_BANK: ISchoolQuizQuestion[] = [
  // --- MATEMATIKA (1-20) ---
  {
    id: 'mtk-01',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Berapakah hasil dari 15 × 8 - 45 : 3?',
    correctAnswer: '105',
    wrongAnswers: ['115', '95', '120'],
    explanation: '15 × 8 = 120, lalu 45 : 3 = 15. Maka 120 - 15 = 105.',
  },
  {
    id: 'mtk-02',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Jika 3x + 12 = 33, berapakah nilai x?',
    correctAnswer: '7',
    wrongAnswers: ['5', '8', '6'],
    explanation: '3x = 33 - 12 = 21, sehingga x = 21 : 3 = 7.',
  },
  {
    id: 'mtk-03',
    subject: 'Matematika',
    emoji: '📐',
    question: 'Sebuah persegi panjang memiliki panjang 14 cm dan lebar 9 cm. Luasnya adalah...',
    correctAnswer: '126 cm²',
    wrongAnswers: ['116 cm²', '136 cm²', '46 cm²'],
    explanation: 'Luas = panjang × lebar = 14 × 9 = 126 cm².',
  },
  {
    id: 'mtk-04',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Berapakah nilai dari √144 + √81?',
    correctAnswer: '21',
    wrongAnswers: ['19', '23', '25'],
    explanation: '√144 = 12, dan √81 = 9. Maka 12 + 9 = 21.',
  },
  {
    id: 'mtk-05',
    subject: 'Matematika',
    emoji: '🥧',
    question: 'Pecahan sederhana dari 36/48 adalah...',
    correctAnswer: '3/4',
    wrongAnswers: ['2/3', '4/5', '5/6'],
    explanation: 'Bagi pembilang dan penyebut dengan FPB 12: 36:12 = 3, 48:12 = 4 (3/4).',
  },
  {
    id: 'mtk-06',
    subject: 'Matematika',
    emoji: '📐',
    question: 'Keliling lingkaran dengan jari-jari r = 7 cm (π = 22/7) adalah...',
    correctAnswer: '44 cm',
    wrongAnswers: ['88 cm', '154 cm', '22 cm'],
    explanation: 'Keliling = 2 × π × r = 2 × (22/7) × 7 = 44 cm.',
  },
  {
    id: 'mtk-07',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Berapakah hasil dari (-15) + 28 - (-7)?',
    correctAnswer: '20',
    wrongAnswers: ['6', '36', '-6'],
    explanation: '-15 + 28 = 13, lalu 13 - (-7) = 13 + 7 = 20.',
  },
  {
    id: 'mtk-08',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'FPB (Faktor Persekutuan Terbesar) dari bilangan 24 dan 36 adalah...',
    correctAnswer: '12',
    wrongAnswers: ['6', '8', '18'],
    explanation: 'Faktor 24: 1, 2, 3, 4, 6, 8, 12, 24. Faktor 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. FPB = 12.',
  },
  {
    id: 'mtk-09',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'KPK (Kelipatan Persekutuan Terkecil) dari 6, 8, dan 12 adalah...',
    correctAnswer: '24',
    wrongAnswers: ['48', '36', '72'],
    explanation: 'Kelipatan terkecil yang habis dibagi 6, 8, dan 12 adalah 24.',
  },
  {
    id: 'mtk-10',
    subject: 'Matematika',
    emoji: '📐',
    question: 'Jumlah besar ketiga sudut pada sebuah segitiga selalu sama dengan...',
    correctAnswer: '180°',
    wrongAnswers: ['360°', '90°', '270°'],
    explanation: 'Semua jenis bangun segitiga (sama sisi, sama kaki, sembarang) total sudutnya adalah 180°.',
  },
  {
    id: 'mtk-11',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Jika sebuah baju seharga Rp 100.000 mendapat diskon 25%, berapa harga yang harus dibayar?',
    correctAnswer: 'Rp 75.000',
    wrongAnswers: ['Rp 80.000', 'Rp 85.000', 'Rp 70.000'],
    explanation: 'Diskon 25% dari Rp 100.000 = Rp 25.000. Maka bayar Rp 100.000 - Rp 25.000 = Rp 75.000.',
  },
  {
    id: 'mtk-12',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Berapakah 2 pangkat 5 (2⁵)?',
    correctAnswer: '32',
    wrongAnswers: ['64', '16', '10'],
    explanation: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32.',
  },
  {
    id: 'mtk-13',
    subject: 'Matematika',
    emoji: '📐',
    question: 'Sebuah kubus memiliki rusuk panjang 6 cm. Berapakah volume kubus tersebut?',
    correctAnswer: '216 cm³',
    wrongAnswers: ['36 cm³', '180 cm³', '256 cm³'],
    explanation: 'Volume kubus = s³ = 6 × 6 × 6 = 216 cm³.',
  },
  {
    id: 'mtk-14',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Rata-rata (mean) dari data nilai: 7, 8, 9, 8, 8 adalah...',
    correctAnswer: '8,0',
    wrongAnswers: ['7,8', '8,2', '8,5'],
    explanation: 'Total = 7 + 8 + 9 + 8 + 8 = 40. Rata-rata = 40 : 5 = 8,0.',
  },
  {
    id: 'mtk-15',
    subject: 'Matematika',
    emoji: '📐',
    question: 'Teorema Pythagoras: Jika sisi tegak sebuah segitiga siku-siku 6 cm dan 8 cm, sisi miringnya adalah...',
    correctAnswer: '10 cm',
    wrongAnswers: ['12 cm', '14 cm', '9 cm'],
    explanation: 'c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
  },
  {
    id: 'mtk-16',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Berapakah 15% dari 200?',
    correctAnswer: '30',
    wrongAnswers: ['25', '35', '40'],
    explanation: '15/100 × 200 = 15 × 2 = 30.',
  },
  {
    id: 'mtk-17',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Bentuk desimal dari pecahan 3/8 adalah...',
    correctAnswer: '0,375',
    wrongAnswers: ['0,350', '0,380', '0,325'],
    explanation: '3 dibagi 8 = 0,375.',
  },
  {
    id: 'mtk-18',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Sebuah mobil melaju dengan kecepatan 60 km/jam selama 2,5 jam. Berapakah jarak tempuhnya?',
    correctAnswer: '150 km',
    wrongAnswers: ['120 km', '140 km', '160 km'],
    explanation: 'Jarak = Kecepatan × Waktu = 60 × 2,5 = 150 km.',
  },
  {
    id: 'mtk-19',
    subject: 'Matematika',
    emoji: '📐',
    question: 'Berapakah banyak rusuk pada sebuah balok?',
    correctAnswer: '12 rusuk',
    wrongAnswers: ['8 rusuk', '6 rusuk', '16 rusuk'],
    explanation: 'Balok memiliki 6 sisi, 8 titik sudut, dan 12 rusuk.',
  },
  {
    id: 'mtk-20',
    subject: 'Matematika',
    emoji: '🔢',
    question: 'Jika x = 4 dan y = 3, berapakah nilai dari 2x² - 3y?',
    correctAnswer: '23',
    wrongAnswers: ['21', '25', '19'],
    explanation: '2(4²) - 3(3) = 2(16) - 9 = 32 - 9 = 23.',
  },

  // --- IPA / SAINS (21-40) ---
  {
    id: 'ipa-21',
    subject: 'IPA (Sains)',
    emoji: '🌿',
    question: 'Proses pembuatan makanan pada tumbuhan hijau dengan bantuan cahaya matahari disebut...',
    correctAnswer: 'Fotosintesis',
    wrongAnswers: ['Respirasi', 'Transpirasi', 'Fermentasi'],
    explanation: 'Fotosintesis mengubah karbon dioksida dan air menjadi glukosa dan oksigen dengan klorofil.',
  },
  {
    id: 'ipa-22',
    subject: 'IPA (Sains)',
    emoji: '🔬',
    question: 'Organel sel yang berfungsi sebagai tempat pembentukan energi (respirasi sel) adalah...',
    correctAnswer: 'Mitokondria',
    wrongAnswers: ['Ribosom', 'Nukleus', 'Badan Golgi'],
    explanation: 'Mitokondria dijuluki sebagai "the powerhouse of cell" karena menghasilkan energi ATP.',
  },
  {
    id: 'ipa-23',
    subject: 'IPA (Sains)',
    emoji: '🪐',
    question: 'Planet terdekat dari Matahari dalam sistem tata surya kita adalah...',
    correctAnswer: 'Merkurius',
    wrongAnswers: ['Venus', 'Mars', 'Bumi'],
    explanation: 'Urutan planet dari matahari: Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, Neptunus.',
  },
  {
    id: 'ipa-24',
    subject: 'IPA (Sains)',
    emoji: '💧',
    question: 'Perubahan wujud zat dari gas menjadi cair disebut...',
    correctAnswer: 'Mengembun',
    wrongAnswers: ['Menyublim', 'Mengkristal', 'Menguap'],
    explanation: 'Mengembun adalah perubahan gas ke cair, seperti embun pagi di daun rumput.',
  },
  {
    id: 'ipa-25',
    subject: 'IPA (Sains)',
    emoji: '🫀',
    question: 'Bagian jantung yang memompa darah kaya oksigen ke seluruh tubuh adalah...',
    correctAnswer: 'Bilik Kiri (Ventrikel Kiri)',
    wrongAnswers: ['Bilik Kanan', 'Serambi Kiri', 'Serambi Kanan'],
    explanation: 'Bilik kiri memiliki dinding otot paling tebal untuk memompa darah bersih ke seluruh tubuh.',
  },
  {
    id: 'ipa-26',
    subject: 'IPA (Sains)',
    emoji: '⚡',
    question: 'Satuan internasional untuk kuat arus listrik adalah...',
    correctAnswer: 'Ampere',
    wrongAnswers: ['Volt', 'Ohm', 'Watt'],
    explanation: 'Arus listrik diukur dalam Ampere (A), tegangan dalam Volt (V), daya dalam Watt (W).',
  },
  {
    id: 'ipa-27',
    subject: 'IPA (Sains)',
    emoji: '🩸',
    question: 'Golongan darah yang dikenal sebagai pendonor universal adalah...',
    correctAnswer: 'Golongan Darah O',
    wrongAnswers: ['Golongan Darah AB', 'Golongan Darah A', 'Golongan Darah B'],
    explanation: 'Golongan O tidak memiliki antigen A maupun B pada sel darah merahnya sehingga dapat didonorkan ke semua.',
  },
  {
    id: 'ipa-28',
    subject: 'IPA (Sains)',
    emoji: '🌡️',
    question: 'Titik didih air murni pada tekanan udara normal (1 atm) adalah...',
    correctAnswer: '100° C',
    wrongAnswers: ['80° C', '120° C', '90° C'],
    explanation: 'Air murni mendidih tepat pada suhu 100° Celcius (212° Fahrenheit).',
  },
  {
    id: 'ipa-29',
    subject: 'IPA (Sains)',
    emoji: '🌍',
    question: 'Lapisan gas yang menyelimuti bumi dan melindungi makhluk hidup dari radiasi sinar ultraviolet adalah...',
    correctAnswer: 'Lapisan Ozon di Stratosfer',
    wrongAnswers: ['Mesosfer Bawah', 'Troposfer Dasar', 'Termosfer Atas'],
    explanation: 'Lapisan ozon (O3) terletak di stratosfer dan menyerap radiasi UV berbahaya dari matahari.',
  },
  {
    id: 'ipa-30',
    subject: 'IPA (Sains)',
    emoji: '🧲',
    question: 'Kutub magnet yang senama (misalnya Utara dengan Utara) jika didekatkan akan...',
    correctAnswer: 'Tolak-menolak',
    wrongAnswers: ['Tarik-menarik', 'Saling menyatu', 'Menghilangkan medan magnet'],
    explanation: 'Kutub magnet senama saling tolak-menolak, sedangkan kutub tidak senama saling tarik-menarik.',
  },
  {
    id: 'ipa-31',
    subject: 'IPA (Sains)',
    emoji: '👁️',
    question: 'Bagian mata yang berfungsi mengatur jumlah cahaya yang masuk ke dalam bola mata adalah...',
    correctAnswer: 'Pupil dan Iris',
    wrongAnswers: ['Retina', 'Kornea', 'Lensa Mata'],
    explanation: 'Iris memberi warna mata dan mengatur diameter pupil untuk mengontrol intensitas cahaya masuk.',
  },
  {
    id: 'ipa-32',
    subject: 'IPA (Sains)',
    emoji: '🦇',
    question: 'Hewan kelelawar mencari mangsa dan bernavigasi di malam hari menggunakan pantulan bunyi yang disebut...',
    correctAnswer: 'Ekolokasi',
    wrongAnswers: ['Kamuflase', 'Mimikri', 'Autotomi'],
    explanation: 'Ekolokasi memanfaatkan gelombang ultrasonik untuk mendeteksi pantulan suara dari benda sekitar.',
  },
  {
    id: 'ipa-33',
    subject: 'IPA (Sains)',
    emoji: '🍎',
    question: 'Hukum Gravitasi Universal pertama kali dirumuskan oleh ilmuwan terkemuka...',
    correctAnswer: 'Sir Isaac Newton',
    wrongAnswers: ['Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
    explanation: 'Isaac Newton mengemukakan hukum gravitasi setelah mengamati buah apel yang jatuh dari pohonnya.',
  },
  {
    id: 'ipa-34',
    subject: 'IPA (Sains)',
    emoji: '🧪',
    question: 'Zat asam memiliki rentang nilai pH...',
    correctAnswer: 'Kurang dari 7 (pH < 7)',
    wrongAnswers: ['Lebih dari 7 (pH > 7)', 'Tepat 7 (pH = 7)', 'Di atas 10'],
    explanation: 'pH < 7 adalah asam, pH = 7 netral (air murni), dan pH > 7 adalah basa.',
  },
  {
    id: 'ipa-35',
    subject: 'IPA (Sains)',
    emoji: '🦋',
    question: 'Tahapan metamorfosis sempurna pada kupu-kupu secara urut adalah...',
    correctAnswer: 'Telur -> Ulat (Larva) -> Kepompong (Pupa) -> Kupu-kupu',
    wrongAnswers: [
      'Telur -> Kepompong -> Ulat -> Kupu-kupu',
      'Telur -> Nimfa -> Kupu-kupu',
      'Ulat -> Telur -> Kepompong -> Kupu-kupu',
    ],
    explanation: 'Kupu-kupu mengalami metamorfosis sempurna: telur menetas jadi ulat, lalu kepompong, baru jadi kupu-kupu dewasa.',
  },
  {
    id: 'ipa-36',
    subject: 'IPA (Sains)',
    emoji: '🌬️',
    question: 'Gas yang paling banyak menyusun atmosfer bumi (sekitar 78%) adalah...',
    correctAnswer: 'Nitrogen (N₂)',
    wrongAnswers: ['Oksigen (O₂)', 'Karbon Dioksida (CO₂)', 'Argon (Ar)'],
    explanation: 'Atmosfer bumi terdiri dari sekitar 78% Nitrogen, 21% Oksigen, dan 1% gas lainnya.',
  },
  {
    id: 'ipa-37',
    subject: 'IPA (Sains)',
    emoji: '🦴',
    question: 'Tulang yang paling panjang dan paling kuat di dalam tubuh manusia adalah...',
    correctAnswer: 'Tulang Paha (Femur)',
    wrongAnswers: ['Tulang Kering (Tibia)', 'Tulang Lengan Atas (Humerus)', 'Tulang Rusuk'],
    explanation: 'Tulang femur (tulang paha) menopang berat tubuh manusia dan merupakan tulang terpanjang.',
  },
  {
    id: 'ipa-38',
    subject: 'IPA (Sains)',
    emoji: '🔋',
    question: 'Alat yang mengubah energi gerak (mekanik) menjadi energi listrik adalah...',
    correctAnswer: 'Generator / Dinamo',
    wrongAnswers: ['Motor Listrik', 'Baterai Kering', 'Transformator'],
    explanation: 'Generator/dinamo memanfaatkan induksi elektromagnetik untuk mengubah energi kinetik jadi listrik.',
  },
  {
    id: 'ipa-39',
    subject: 'IPA (Sains)',
    emoji: '🦎',
    question: 'Kemampuan cicak memutuskan ekornya untuk mengelabui musuh disebut...',
    correctAnswer: 'Autotomi',
    wrongAnswers: ['Mimikri', 'Ekolokasi', 'Hibernasi'],
    explanation: 'Autotomi adalah pelepasan anggota tubuh saat terancam, yang nantinya dapat tumbuh kembali.',
  },
  {
    id: 'ipa-40',
    subject: 'IPA (Sains)',
    emoji: '☀️',
    question: 'Waktu yang dibutuhkan Bumi untuk mengelilingi Matahari satu putaran penuh (Revolusi Bumi) adalah...',
    correctAnswer: '365 ¼ hari (1 Tahun)',
    wrongAnswers: ['24 jam (1 Hari)', '30 hari (1 Bulan)', '360 hari'],
    explanation: 'Revolusi bumi memakan waktu 365,25 hari yang menyebabkan pergantian musim di belahan bumi.',
  },

  // --- IPS & GEOGRAFI (41-55) ---
  {
    id: 'ips-41',
    subject: 'IPS (Sosial)',
    emoji: '🌏',
    question: 'Secara geografis, Indonesia terletak di antara dua benua yaitu...',
    correctAnswer: 'Benua Asia dan Benua Australia',
    wrongAnswers: ['Benua Asia dan Benua Afrika', 'Benua Amerika dan Benua Asia', 'Benua Eropa dan Benua Australia'],
    explanation: 'Indonesia berada di posisi silang strategis antara Benua Asia dan Benua Australia.',
  },
  {
    id: 'ips-42',
    subject: 'IPS (Sosial)',
    emoji: '🇮🇩',
    question: 'Teks Proklamasi Kemerdekaan Indonesia dibacakan oleh Ir. Soekarno pada tanggal...',
    correctAnswer: '17 Agustus 1945',
    wrongAnswers: ['1 Juni 1945', '28 Oktober 1928', '20 Mei 1908'],
    explanation: 'Kemerdekaan RI diproklamasikan pada Jumat, 17 Agustus 1945 di Jalan Pegangsaan Timur No. 56.',
  },
  {
    id: 'ips-43',
    subject: 'IPS (Sosial)',
    emoji: '🕌',
    question: 'Candi Buddha terbesar di dunia yang terletak di Magelang, Jawa Tengah adalah...',
    correctAnswer: 'Candi Borobudur',
    wrongAnswers: ['Candi Prambanan', 'Candi Mendut', 'Candi Penataran'],
    explanation: 'Candi Borobudur dibangun pada abad ke-8 era Dinasti Syailendra dan diakui UNESCO.',
  },
  {
    id: 'ips-44',
    subject: 'IPS (Sosial)',
    emoji: '💰',
    question: 'Kegiatan menyalurkan barang dari produsen ke konsumen disebut...',
    correctAnswer: 'Distribusi',
    wrongAnswers: ['Produksi', 'Konsumsi', 'Investasi'],
    explanation: 'Distribusi adalah aktivitas penyaluran barang dagang, pelakunya disebut distributor.',
  },
  {
    id: 'ips-45',
    subject: 'IPS (Sosial)',
    emoji: '🧭',
    question: 'Selat yang menghubungkan Pulau Jawa dan Pulau Sumatera adalah...',
    correctAnswer: 'Selat Sunda',
    wrongAnswers: ['Selat Malaka', 'Selat Bali', 'Selat Makassar'],
    explanation: 'Selat Sunda memisahkan ujung barat Jawa dan ujung selatan Sumatera, di mana Gunung Anak Krakatau berada.',
  },
  {
    id: 'ips-46',
    subject: 'IPS (Sosial)',
    emoji: '🗺️',
    question: 'Garis khayal yang membagi bumi menjadi belahan bumi utara dan selatan adalah...',
    correctAnswer: 'Garis Khatulistiwa (Ekuator)',
    wrongAnswers: ['Garis Bujur Greenwich', 'Garis Balik Utara', 'Garis Wallace'],
    explanation: 'Garis khatulistiwa berada pada 0° lintang dan melintasi Kota Pontianak di Indonesia.',
  },
  {
    id: 'ips-47',
    subject: 'IPS (Sosial)',
    emoji: '🚢',
    question: 'Sumpah Palapa yang bertekad menyatukan Nusantara diucapkan oleh Patih Gajah Mada dari Kerajaan...',
    correctAnswer: 'Kerajaan Majapahit',
    wrongAnswers: ['Kerajaan Singasari', 'Kerajaan Sriwijaya', 'Kerajaan Tarumanegara'],
    explanation: 'Mahapatih Gajah Mada mengikrarkan Sumpah Palapa pada masa kejayaan Kerajaan Majapahit.',
  },
  {
    id: 'ips-48',
    subject: 'IPS (Sosial)',
    emoji: '🌋',
    question: 'Gunung tertinggi di Indonesia dengan puncak bersalju abadi adalah...',
    correctAnswer: 'Puncak Jaya (Carstensz Pyramid)',
    wrongAnswers: ['Gunung Kerinci', 'Gunung Rinjani', 'Gunung Semeru'],
    explanation: 'Puncak Jaya di Papua berketinggian 4.884 meter di atas permukaan laut.',
  },
  {
    id: 'ips-49',
    subject: 'IPS (Sosial)',
    emoji: '🏛️',
    question: 'Organisasi perhimpunan negara-negara di kawasan Asia Tenggara adalah...',
    correctAnswer: 'ASEAN',
    wrongAnswers: ['APEC', 'PBB (UN)', 'OPEC'],
    explanation: 'ASEAN didirikan di Bangkok pada 8 Agustus 1967 oleh lima negara pendiri termasuk Indonesia.',
  },
  {
    id: 'ips-50',
    subject: 'IPS (Sosial)',
    emoji: '📈',
    question: 'Kenaikan harga barang dan jasa secara umum dan terus-menerus dalam ekonomi disebut...',
    correctAnswer: 'Inflasi',
    wrongAnswers: ['Deflasi', 'Resesi', 'Devaluasi'],
    explanation: 'Inflasi menyebabkan nilai daya beli uang menurun terhadap harga barang komoditas.',
  },
  {
    id: 'ips-51',
    subject: 'IPS (Sosial)',
    emoji: '🏝️',
    question: 'Danau vulkanik terbesar di Asia Tenggara yang memiliki pulau Samosir di tengahnya adalah...',
    correctAnswer: 'Danau Toba',
    wrongAnswers: ['Danau Maninjau', 'Danau Singkarak', 'Danau Poso'],
    explanation: 'Danau Toba di Sumatera Utara terbentuk akibat letusan dahsyat gunung api purba ribuan tahun lalu.',
  },
  {
    id: 'ips-52',
    subject: 'IPS (Sosial)',
    emoji: '📜',
    question: 'Kongres Pemuda II yang melahirkan ikrar Sumpah Pemuda diperingati setiap tanggal...',
    correctAnswer: '28 Oktober',
    wrongAnswers: ['10 November', '2 Mei', '17 Agustus'],
    explanation: 'Sumpah Pemuda diikrarkan pada 28 Oktober 1928: satu nusa, satu bangsa, satu bahasa Indonesia.',
  },
  {
    id: 'ips-53',
    subject: 'IPS (Sosial)',
    emoji: '🚢',
    question: 'Kerajaan maritim bercorak Buddha terbesar di Nusantara yang berpusat di Palembang adalah...',
    correctAnswer: 'Kerajaan Sriwijaya',
    wrongAnswers: ['Kerajaan Mataram Kuno', 'Kerajaan Kutai', 'Kerajaan Demak'],
    explanation: 'Sriwijaya menguasai jalur perdagangan maritim Selat Malaka pada abad ke-7 hingga ke-12.',
  },
  {
    id: 'ips-54',
    subject: 'IPS (Sosial)',
    emoji: '🌾',
    question: 'Mata pencaharian utama sebagian besar penduduk Indonesia di bidang pertanian disebut negara...',
    correctAnswer: 'Agraris',
    wrongAnswers: ['Maritim', 'Industri', 'Kontinental'],
    explanation: 'Indonesia disebut negara agraris karena tanahnya subur dan mayoritas warganya bertani.',
  },
  {
    id: 'ips-55',
    subject: 'IPS (Sosial)',
    emoji: '🌐',
    question: 'Berapakah pembagian zona waktu di Indonesia?',
    correctAnswer: '3 Zona (WIB, WITA, WIT)',
    wrongAnswers: ['2 Zona (WIB dan WIT)', '4 Zona', '1 Zona Terpusat'],
    explanation: 'Indonesia terbagi atas Waktu Indonesia Barat (GMT+7), Tengah (GMT+8), dan Timur (GMT+9).',
  },

  // --- BAHASA INDONESIA (56-70) ---
  {
    id: 'bindo-56',
    subject: 'Bahasa Indonesia',
    emoji: '📖',
    question: 'Persamaan kata (sinonim) dari kata "Kreatif" adalah...',
    correctAnswer: 'Inovatif',
    wrongAnswers: ['Monoton', 'Pasif', 'Statis'],
    explanation: 'Kreatif berarti memiliki daya cipta dan kemampuan menciptakan hal-hal baru (inovatif).',
  },
  {
    id: 'bindo-57',
    subject: 'Bahasa Indonesia',
    emoji: '📖',
    question: 'Lawan kata (antonim) dari kata "Konsisten" adalah...',
    correctAnswer: 'Plin-plan (Berubah-ubah)',
    wrongAnswers: ['Disiplin', 'Gigih', 'Tegas'],
    explanation: 'Konsisten berarti teguh dan tetap pada pendirian, antonimnya adalah berubah-ubah / tidak tetap.',
  },
  {
    id: 'bindo-58',
    subject: 'Bahasa Indonesia',
    emoji: '✍️',
    question: 'Kalimat utama yang memuat gagasan pokok di awal paragraf disebut paragraf...',
    correctAnswer: 'Deduktif',
    wrongAnswers: ['Induktif', 'Campuran', 'Naratif'],
    explanation: 'Paragraf deduktif menempatkan ide pokok di awal, sedangkan induktif di akhir kalimat.',
  },
  {
    id: 'bindo-59',
    subject: 'Bahasa Indonesia',
    emoji: '🎭',
    question: 'Ungkapan "Kepala Dingin" memiliki makna kiasan...',
    correctAnswer: 'Tenang dan sabar dalam berpikir',
    wrongAnswers: ['Kepalanya terasa dingin', 'Orang yang kedinginan', 'Suka menyendiri'],
    explanation: 'Menyelesaikan masalah dengan kepala dingin artinya menggunakan akal sehat dengan tenang tanpa emosi.',
  },
  {
    id: 'bindo-60',
    subject: 'Bahasa Indonesia',
    emoji: '📜',
    question: 'Ciri utama puisi pantun tradisional adalah memiliki rima persajakan...',
    correctAnswer: 'a - b - a - b',
    wrongAnswers: ['a - a - a - a', 'a - b - b - a', 'a - a - b - b'],
    explanation: 'Pantun bersajak a-b-a-b, terdiri dari 4 baris: 2 baris sampiran dan 2 baris isi.',
  },
  {
    id: 'bindo-61',
    subject: 'Bahasa Indonesia',
    emoji: '📝',
    question: 'Penulisan kata baku yang benar menurut KBBI adalah...',
    correctAnswer: 'Apotek',
    wrongAnswers: ['Apotik', 'Apotiek', 'Apotike'],
    explanation: 'Bentuk baku menurut Kamus Besar Bahasa Indonesia adalah "Apotek" (bukan apotik).',
  },
  {
    id: 'bindo-62',
    subject: 'Bahasa Indonesia',
    emoji: '📝',
    question: 'Penulisan kata baku yang tepat adalah...',
    correctAnswer: 'Praktik',
    wrongAnswers: ['Praktek', 'Praktiek', 'Prakteg'],
    explanation: 'Bentuk baku adalah "Praktik" (kata turunan: praktisi, praktikum).',
  },
  {
    id: 'bindo-63',
    subject: 'Bahasa Indonesia',
    emoji: '📚',
    question: 'Majas yang membandingkan benda mati seolah-olah memiliki sifat seperti manusia disebut majas...',
    correctAnswer: 'Personifikasi',
    wrongAnswers: ['Metafora', 'Hiperbola', 'Litotes'],
    explanation: 'Contoh personifikasi: "Angin malam membelai rambutku dengan lembut".',
  },
  {
    id: 'bindo-64',
    subject: 'Bahasa Indonesia',
    emoji: '📚',
    question: 'Majas yang menyatakan sesuatu secara berlebihan untuk mempertegas kesan disebut majas...',
    correctAnswer: 'Hiperbola',
    wrongAnswers: ['Personifikasi', 'Eufemisme', 'Ironi'],
    explanation: 'Contoh hiperbola: "Suaranya menggelegar membelah angkasa".',
  },
  {
    id: 'bindo-65',
    subject: 'Bahasa Indonesia',
    emoji: '📖',
    question: 'Bagian akhir dari alur cerita rekaan yang memuat penyelesaian konflik disebut...',
    correctAnswer: 'Resolusi (Koda)',
    wrongAnswers: ['Orientasi', 'Komplikasi', 'Klimaks'],
    explanation: 'Alur cerita: Orientasi (pengenalan) -> Komplikasi (konflik) -> Klimaks -> Resolusi (penyelesaian).',
  },
  {
    id: 'bindo-66',
    subject: 'Bahasa Indonesia',
    emoji: '🗣️',
    question: 'Kata tanya yang digunakan untuk menanyakan alasan atau sebab terjadinya suatu peristiwa adalah...',
    correctAnswer: 'Mengapa',
    wrongAnswers: ['Bagaimana', 'Kapan', 'Siapa'],
    explanation: 'Kata "Mengapa" / "Kenapa" menanyakan sebab-akibat timbulnya suatu keadaan.',
  },
  {
    id: 'bindo-67',
    subject: 'Bahasa Indonesia',
    emoji: '📝',
    question: 'Peribahasa "Air beriak tanda tak dalam" bermakna...',
    correctAnswer: 'Orang yang banyak bicara biasanya ilmunya sedikit',
    wrongAnswers: ['Sungai yang banyak ombak berbahaya', 'Orang pendiam selalu pintar', 'Air sungai sedang mengalir deras'],
    explanation: 'Orang yang gemar menyombongkan keahlian seringkali ilmunya masih dangkal.',
  },
  {
    id: 'bindo-68',
    subject: 'Bahasa Indonesia',
    emoji: '✍️',
    question: 'Kata imbuhan (afiks) "me-kan" pada kata "membacakan" berfungsi membentuk kata...',
    correctAnswer: 'Kata Kerja (Verba)',
    wrongAnswers: ['Kata Benda (Nomina)', 'Kata Sifat (Adjektiva)', 'Kata Bilangan (Numeralia)'],
    explanation: 'Imbuhan me-kan pada "baca" membentuk verba aktif transitif "membacakan".',
  },
  {
    id: 'bindo-69',
    subject: 'Bahasa Indonesia',
    emoji: '📖',
    question: 'Karya sastra berupa cerita rekaan yang relatif panjang dan mengisahkan dinamika tokoh disebut...',
    correctAnswer: 'Novel',
    wrongAnswers: ['Cerpen', 'Puisi', 'Drama'],
    explanation: 'Novel menyajikan kisah hidup tokoh dengan konflik kompleks dalam bab-bab yang panjang.',
  },
  {
    id: 'bindo-70',
    subject: 'Bahasa Indonesia',
    emoji: '✍️',
    question: 'Kalimat efektif harus memiliki kelengkapan unsur minimal berupa...',
    correctAnswer: 'Subjek dan Predikat (S - P)',
    wrongAnswers: ['Objek dan Keterangan saja', 'Predikat saja', 'Kata Sambung dan Objek'],
    explanation: 'Sebuah klausa atau kalimat utuh wajib memiliki inti Subjek dan Predikat.',
  },

  // --- BAHASA INGGRIS (71-85) ---
  {
    id: 'bing-71',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'What is the opposite (antonym) of the word "Courageous"?',
    correctAnswer: 'Cowardly (Takut / Pengecut)',
    wrongAnswers: ['Brave (Berani)', 'Strong (Kuat)', 'Honest (Jujur)'],
    explanation: '"Courageous" means brave, so its direct antonym is cowardly (timid).',
  },
  {
    id: 'bing-72',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Choose the correct form: "She ______ to school by bicycle every morning."',
    correctAnswer: 'goes',
    wrongAnswers: ['go', 'going', 'went'],
    explanation: 'Simple Present Tense with third person singular subject (She) uses verb + es: "goes".',
  },
  {
    id: 'bing-73',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'What is the past tense (V2) of the irregular verb "Buy"?',
    correctAnswer: 'Bought',
    wrongAnswers: ['Buyed', 'Brought', 'Boated'],
    explanation: 'The verb "buy" irregular form is buy - bought - bought.',
  },
  {
    id: 'bing-74',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Complete the sentence: "Mount Everest is the ______ mountain in the world."',
    correctAnswer: 'highest',
    wrongAnswers: ['high', 'higher', 'most high'],
    explanation: 'Superlative degree for single-syllable adjective (high) adds -est: "highest".',
  },
  {
    id: 'bing-75',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'What does the idiom "Piece of cake" mean?',
    correctAnswer: 'Something very easy to do',
    wrongAnswers: ['A sweet dessert', 'A difficult challenge', 'Buying bakery products'],
    explanation: 'When a task is "a piece of cake", it means it is effortless and very simple.',
  },
  {
    id: 'bing-76',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Identify the noun: "The friendly teacher explained the lesson clearly."',
    correctAnswer: 'Teacher',
    wrongAnswers: ['Friendly', 'Explained', 'Clearly'],
    explanation: '"Teacher" is a noun (person), "friendly" is adjective, "explained" is verb, "clearly" is adverb.',
  },
  {
    id: 'bing-77',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Which word is spelled correctly?',
    correctAnswer: 'Environment',
    wrongAnswers: ['Enviroment', 'Invironment', 'Environtment'],
    explanation: 'The correct spelling has an "n" after "o": E-N-V-I-R-O-N-M-E-N-T.',
  },
  {
    id: 'bing-78',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Complete the sentence: "If it rains tomorrow, we ______ the picnic."',
    correctAnswer: 'will cancel',
    wrongAnswers: ['cancelled', 'cancel', 'would cancel'],
    explanation: 'First conditional structure: If + Simple Present (rains), will + base verb (will cancel).',
  },
  {
    id: 'bing-79',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'What is the synonym of the word "Huge"?',
    correctAnswer: 'Enormous',
    wrongAnswers: ['Tiny', 'Narrow', 'Light'],
    explanation: '"Huge" and "enormous" both describe something immense in size.',
  },
  {
    id: 'bing-80',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Choose the correct preposition: "The cat is sleeping ______ the table."',
    correctAnswer: 'under',
    wrongAnswers: ['between', 'during', 'since'],
    explanation: '"Under the table" expresses the spatial position below the surface.',
  },
  {
    id: 'bing-81',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'What is the plural form of the word "Child"?',
    correctAnswer: 'Children',
    wrongAnswers: ['Childs', 'Childes', 'Childrens'],
    explanation: '"Child" is an irregular noun with plural form "children".',
  },
  {
    id: 'bing-82',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Choose the correct sentence in Present Continuous Tense:',
    correctAnswer: 'They are playing football right now.',
    wrongAnswers: ['They play football right now.', 'They played football right now.', 'They are play football.'],
    explanation: 'Present continuous formula: Subject + to be (are) + V-ing (playing).',
  },
  {
    id: 'bing-83',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'What is the synonym of the word "Ancient"?',
    correctAnswer: 'Very old / antique',
    wrongAnswers: ['Modern', 'Futuristic', 'Brand new'],
    explanation: '"Ancient" refers to belonging to times long past in history.',
  },
  {
    id: 'bing-84',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'Which word is an adverb of manner?',
    correctAnswer: 'Quickly',
    wrongAnswers: ['Quick', 'Quicker', 'Quickness'],
    explanation: 'Adverbs of manner often end with -ly to explain how an action is done ("quickly").',
  },
  {
    id: 'bing-85',
    subject: 'Bahasa Inggris',
    emoji: '🇬🇧',
    question: 'What does "Look after" mean in phrasal verbs?',
    correctAnswer: 'Take care of (Merawat / Menjaga)',
    wrongAnswers: ['Search for something', 'Stare at someone', 'Run away'],
    explanation: 'To "look after" someone means to take care of them or oversee their safety.',
  },

  // --- PANCASILA & PENGETAHUAN UMUM (86-100) ---
  {
    id: 'pkn-86',
    subject: 'Pancasila & PKn',
    emoji: '🦅',
    question: 'Lambang lambang sila ke-2 Pancasila (Kemanusiaan yang Adil dan Beradab) adalah...',
    correctAnswer: 'Rantai Emas',
    wrongAnswers: ['Bintang Tunggal', 'Pohon Beringin', 'Kepala Banteng'],
    explanation: 'Urutan lambang Pancasila: 1. Bintang, 2. Rantai, 3. Pohon Beringin, 4. Kepala Banteng, 5. Padi & Kapas.',
  },
  {
    id: 'pkn-87',
    subject: 'Pancasila & PKn',
    emoji: '🦅',
    question: 'Semboyan resmi bangsa Indonesia "Bhinneka Tunggal Ika" memiliki arti...',
    correctAnswer: 'Berbeda-beda tetapi tetap satu jua',
    wrongAnswers: ['Bersatu kita teguh bercerai kita runtuh', 'Maju bersama menuju kemakmuran', 'Keadilan sosial untuk seluruh rakyat'],
    explanation: 'Kutipan dari Kitab Sutasoma karya Mpu Tantular melambangkan persatuan keragaman bangsa.',
  },
  {
    id: 'pkn-88',
    subject: 'Pancasila & PKn',
    emoji: '🇮🇩',
    question: 'Lagu kebangsaan Indonesia Raya diciptakan oleh komponis nasional...',
    correctAnswer: 'Wage Rudolf (W.R.) Supratman',
    wrongAnswers: ['Ismail Marzuki', 'Kusbini', 'Cornel Simanjuntak'],
    explanation: 'W.R. Supratman pertama kali memperdengarkan lagu Indonesia Raya dengan biolanya pada Kongres Pemuda II 1928.',
  },
  {
    id: 'pkn-89',
    subject: 'Pancasila & PKn',
    emoji: '📜',
    question: 'UUD 1945 disahkan sebagai konstitusi dasar Negara Kesatuan Republik Indonesia oleh PPKI pada tanggal...',
    correctAnswer: '18 Agustus 1945',
    wrongAnswers: ['17 Agustus 1945', '19 Agustus 1945', '1 Juni 1945'],
    explanation: 'Sehari setelah proklamasi, PPKI mengesahkan UUD 1945 serta memilih Soekarno-Hatta sebagai Presiden & Wapres.',
  },
  {
    id: 'pkn-90',
    subject: 'Pancasila & PKn',
    emoji: '🦅',
    question: 'Jumlah helai bulu pada leher Burung Garuda Pancasila berjumlah...',
    correctAnswer: '45 helai',
    wrongAnswers: ['17 helai', '8 helai', '19 helai'],
    explanation: 'Sayap 17, ekor 8, pangkal ekor 19, dan leher 45, melambangkan tanggal 17-8-1945.',
  },
  {
    id: 'pkn-91',
    subject: 'Pengetahuan Umum',
    emoji: '💡',
    question: 'Lembaga negara yang berwenang mengubah dan menetapkan Undang-Undang Dasar di Indonesia adalah...',
    correctAnswer: 'MPR (Majelis Permusyawaratan Rakyat)',
    wrongAnswers: ['DPR (Dewan Perwakilan Rakyat)', 'Presiden', 'Mahkamah Konstitusi'],
    explanation: 'Pasal 3 UUD 1945 menegaskan bahwa MPR berwenang mengubah dan menetapkan UUD.',
  },
  {
    id: 'pkn-92',
    subject: 'Pancasila & PKn',
    emoji: '🤝',
    question: 'Sikap gotong royong dan saling tolong menolong mencerminkan pengamalan Pancasila sila ke-...',
    correctAnswer: 'Sila ke-3 (Persatuan Indonesia) & Sila ke-5',
    wrongAnswers: ['Sila ke-1 saja', 'Sila ke-4 saja', 'Bukan nilai Pancasila'],
    explanation: 'Gotong royong memupuk persatuan bangsa (Sila 3) dan kebersamaan kesejahteraan sosial (Sila 5).',
  },
  {
    id: 'pkn-93',
    subject: 'Pengetahuan Umum',
    emoji: '💻',
    question: 'Sistem komputer menyimpan dan memproses data dalam format angka biner yang hanya terdiri dari angka...',
    correctAnswer: '0 dan 1',
    wrongAnswers: ['1 dan 2', '0 sampai 9', 'Huruf A sampai Z'],
    explanation: 'Sistem bilangan biner (basis 2) menggunakan bit bernilai 0 (off) atau 1 (on).',
  },
  {
    id: 'pkn-94',
    subject: 'Pengetahuan Umum',
    emoji: '🌍',
    question: 'Samudera terluas di dunia adalah...',
    correctAnswer: 'Samudera Pasifik',
    wrongAnswers: ['Samudera Atlantik', 'Samudera Hindia', 'Samudera Arktik'],
    explanation: 'Samudera Pasifik mencakup lebih dari sepertiga total luas permukaan bumi.',
  },
  {
    id: 'pkn-95',
    subject: 'Pengetahuan Umum',
    emoji: '🚗',
    question: 'Warna lampu lalu lintas yang menandakan pengendara harus bersiap-siap atau berhati-hati adalah...',
    correctAnswer: 'Kuning',
    wrongAnswers: ['Merah', 'Hijau', 'Biru'],
    explanation: 'Merah untuk berhenti, kuning untuk berhati-hati/siaga, dan hijau untuk melaju aman.',
  },
  {
    id: 'pkn-96',
    subject: 'Pancasila & PKn',
    emoji: '🏛️',
    question: 'Hak asasi paling mendasar yang dimiliki setiap manusia sejak lahir sebagai anugerah Tuhan adalah...',
    correctAnswer: 'Hak untuk Hidup',
    wrongAnswers: ['Hak Memiliki Kendaraan', 'Hak Menjadi Pejabat', 'Hak Berbelanja Bebas'],
    explanation: 'Hak untuk hidup dan mempertahankan kehidupan adalah hak asasi paling asasi dan tidak dapat dikurangi.',
  },
  {
    id: 'pkn-97',
    subject: 'Pengetahuan Umum',
    emoji: '🎨',
    question: 'Tiga warna primer dalam seni rupa dasar adalah...',
    correctAnswer: 'Merah, Kuning, dan Biru',
    wrongAnswers: ['Merah, Hijau, dan Biru', 'Hitam, Putih, dan Abu-abu', 'Oranye, Hijau, dan Ungu'],
    explanation: 'Warna primer adalah warna pokok yang tidak bisa dihasilkan dari campuran warna lain.',
  },
  {
    id: 'pkn-98',
    subject: 'Pengetahuan Umum',
    emoji: '🏆',
    question: 'Pesta olahraga akbar antarnegara di seluruh dunia yang digelar setiap empat tahun sekali adalah...',
    correctAnswer: 'Olimpiade',
    wrongAnswers: ['Piala Dunia FIFA', 'Asian Games', 'SEA Games'],
    explanation: 'Olimpiade mempertandingkan ratusan cabang olahraga musim panas dan dingin dari seluruh benua.',
  },
  {
    id: 'pkn-99',
    subject: 'Pancasila & PKn',
    emoji: '⚖️',
    question: 'Asas pemilu di Indonesia yang disingkat LUBER JURDIL memiliki kepanjangan...',
    correctAnswer: 'Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil',
    wrongAnswers: [
      'Lancar, Umum, Beres, Rapi, Jujur, Adil',
      'Lega, Unggul, Bersama, Rukun, Jiwa, Damai',
      'Lurus, Utama, Berwibawa, Rapi, Jujur, Disiplin',
    ],
    explanation: 'Luber Jurdil adalah prinsip konstitusional pemilu demokratis di Indonesia.',
  },
  {
    id: 'pkn-100',
    subject: 'Pengetahuan Umum',
    emoji: '💡',
    question: 'Penemu bola lampu pijar modern yang mematenkan inovasi sistem penerangan listrik adalah...',
    correctAnswer: 'Thomas Alva Edison',
    wrongAnswers: ['Alexander Graham Bell', 'Guglielmo Marconi', 'James Watt'],
    explanation: 'Thomas Edison mengembangkan filamen karbon tahan lama yang membuat lampu pijar dapat diproduksi massal.',
  },
];

/**
 * Mengambil 20 soal kuis acak dari 100 soal bank,
 * sekaligus mengacak urutan 4 opsi jawaban (A, B, C, D) di setiap soal.
 */
export function generateRandomQuizSession(count: number = 20, gradeKey?: string): Array<{
  id: string;
  subject: string;
  emoji: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}> {
  // 1. Acak seluruh soal pool kelas/default menggunakan Fisher-Yates
  const basePool = (gradeKey && GRADE_QUIZ_MAP[gradeKey.toLowerCase()])
    ? GRADE_QUIZ_MAP[gradeKey.toLowerCase()]
    : SCHOOL_QUIZ_BANK;
  const pool = [...basePool];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 2. Ambil 20 soal pertama yang sudah teracak
  const selected = pool.slice(0, Math.min(count, pool.length));

  // 3. Acak posisi 4 pilihan jawaban untuk setiap soal
  return selected.map((q) => {
    const rawOptions = [q.correctAnswer, ...q.wrongAnswers];

    // Acak urutan opsi jawaban
    for (let i = rawOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
    }

    const correctIndex = rawOptions.indexOf(q.correctAnswer);

    return {
      id: q.id,
      subject: q.subject,
      emoji: q.emoji,
      question: q.question,
      options: rawOptions,
      correctIndex,
      explanation: q.explanation,
    };
  });
}

export interface IArcadeMinigameWave {
  id: string;
  subject: string;
  emoji: string;
  targetQuestion: string;
  targetAnswer: string;
  explanation: string;
  balloons: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    color: 'rose' | 'sky' | 'amber' | 'emerald';
  }>;
  reflexStatement: {
    statementText: string;
    isCorrect: boolean;
  };
}

/**
 * Generator Sesi Minigame Edukasi Interaktif (Non-Pilgan):
 * Menghasilkan 10 Ronde Balon Tangkas & Refleks Kilat yang Seru, Cepat & Ringan.
 */
export function generateArcadeMinigameSession(
  subjectKeyword?: string,
  count: number = 10,
  gradeKey?: string
): IArcadeMinigameWave[] {
  const basePool = (gradeKey && GRADE_QUIZ_MAP[gradeKey.toLowerCase()])
    ? GRADE_QUIZ_MAP[gradeKey.toLowerCase()]
    : SCHOOL_QUIZ_BANK;
  let pool = [...basePool];

  if (subjectKeyword && subjectKeyword.trim()) {
    const kw = subjectKeyword.toLowerCase().trim();
    const filtered = pool.filter((q) =>
      q.subject.toLowerCase().includes(kw) || kw.includes(q.subject.toLowerCase())
    );
    if (filtered.length >= 5) {
      pool = filtered;
    }
  }

  // Acak pool menggunakan Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selectedQuestions = pool.slice(0, Math.min(count, pool.length));
  const colors: Array<'rose' | 'sky' | 'amber' | 'emerald'> = ['rose', 'sky', 'amber', 'emerald'];

  return selectedQuestions.map((q, qIdx) => {
    // 4 Balon Interaktif (1 Benar, 3 Pengecoh)
    const rawAnswers = [
      { text: q.correctAnswer, isCorrect: true },
      { text: q.wrongAnswers[0], isCorrect: false },
      { text: q.wrongAnswers[1], isCorrect: false },
      { text: q.wrongAnswers[2], isCorrect: false },
    ];

    // Acak posisi balon
    for (let i = rawAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawAnswers[i], rawAnswers[j]] = [rawAnswers[j], rawAnswers[i]];
    }

    const balloons = rawAnswers.map((item, bIdx) => ({
      id: `balloon_${qIdx}_${bIdx}`,
      text: item.text,
      isCorrect: item.isCorrect,
      color: colors[bIdx % colors.length],
    }));

    // Generate Pernyataan Refleks Kilat (50% Peluang Benar / Salah)
    const isTrueStatement = Math.random() > 0.45;
    const chosenAnswer = isTrueStatement
      ? q.correctAnswer
      : q.wrongAnswers[Math.floor(Math.random() * q.wrongAnswers.length)];

    let statementText = '';
    const cleanQ = q.question.replace(/\?$/, '').replace(/\.\.\.$/, '');
    if (cleanQ.toLowerCase().includes('berapakah') || cleanQ.toLowerCase().includes('hitunglah')) {
      statementText = `${cleanQ.replace(/^(Berapakah|Hitunglah)\s+/i, '')} = ${chosenAnswer}`;
    } else {
      statementText = `${cleanQ} adalah ${chosenAnswer}`;
    }

    return {
      id: q.id,
      subject: q.subject,
      emoji: q.emoji,
      targetQuestion: q.question,
      targetAnswer: q.correctAnswer,
      explanation: q.explanation,
      balloons,
      reflexStatement: {
        statementText,
        isCorrect: isTrueStatement,
      },
    };
  });
}

/**
 * Interface Soal Teks Quiz Ringan & Responsif (Mobile & Desktop)
 */
export interface ITextQuizOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
}

export interface ITextQuizQuestion {
  id: string;
  subject: string;
  emoji: string;
  question: string;
  options: ITextQuizOption[];
  explanation: string;
}

/**
 * Generator Sesi Teks Quiz Ringan & Cepat:
 * Menghasilkan 10 soal acak terstruktur dengan 4 opsi acak (A, B, C, D).
 */
export function generateTextQuizSession(
  subjectKeyword?: string,
  count: number = 10,
  gradeKey?: string
): ITextQuizQuestion[] {
  const basePool = (gradeKey && GRADE_QUIZ_MAP[gradeKey.toLowerCase()])
    ? GRADE_QUIZ_MAP[gradeKey.toLowerCase()]
    : SCHOOL_QUIZ_BANK;
  let pool = [...basePool];

  if (subjectKeyword && subjectKeyword.trim() && subjectKeyword !== 'Semua Mapel') {
    const kw = subjectKeyword.toLowerCase().trim();
    const filtered = pool.filter((q) =>
      q.subject.toLowerCase().includes(kw) || kw.includes(q.subject.toLowerCase())
    );
    if (filtered.length >= 3) {
      pool = filtered;
    }
  }

  // Acak pool dengan Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected = pool.slice(0, Math.min(count, pool.length));
  const keys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  return selected.map((q) => {
    const rawOptions = [
      { text: q.correctAnswer, isCorrect: true },
      { text: q.wrongAnswers[0], isCorrect: false },
      { text: q.wrongAnswers[1], isCorrect: false },
      { text: q.wrongAnswers[2], isCorrect: false },
    ];

    // Acak urutan jawaban agar letak A/B/C/D selalu dinamis
    for (let i = rawOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
    }

    const options: ITextQuizOption[] = rawOptions.map((item, idx) => ({
      key: keys[idx],
      text: item.text,
      isCorrect: item.isCorrect,
    }));

    return {
      id: q.id,
      subject: q.subject,
      emoji: q.emoji,
      question: q.question,
      options,
      explanation: q.explanation,
    };
  });
}


