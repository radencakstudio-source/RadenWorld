/**
 * ============================================================================
 * FILE: resources/js/game/ui/SdSubjectsModal.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal Mata Pelajaran Khusus Sekolah Dasar (SD) per Tingkat Kelas (1, 2, 3, 4, 5, 6).
 * Setiap tingkatan kelas memiliki kurikulum dan susunan mata pelajaran yang berbeda!
 * 
 * DISTRIBUSI MATA PELAJARAN PER KELAS:
 * - KELAS 1 SD (5 Mapel): MTK, PAI, Pancasila, B. Arab, B. Jawa
 * - KELAS 2 SD (6 Mapel): MTK, PAI, Pancasila, B. Inggris, B. Arab, B. Jawa
 * - KELAS 3 SD (7 Mapel): IPAS (Mulai Sains!), MTK, PAI, Pancasila, B. Inggris, B. Jawa, B. Arab
 * - KELAS 4 SD (8 Mapel): IPAS, MTK, PKn, Pancasila, PAI, B. Inggris, B. Arab, B. Jawa
 * - KELAS 5 SD (8 Mapel): MTK, IPAS, PKn, Pancasila, B. Inggris, PAI, B. Arab, B. Jawa
 * - KELAS 6 SD (8 Mapel): MTK, IPAS, PKn, Pancasila, B. Inggris, PAI, B. Arab, B. Jawa (Ujian Sekolah)
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle2, ArrowLeft, Star, Heart, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { SoundManager } from '../core/SoundManager';
import { EventBus } from '../core/EventBus';

export interface ISdSubjectItem {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  badge: string;
  subtitle: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  badgeBg: string;
  btnBg: string;
  points: string[];
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  funFact: string;
}

export const SD_CURRICULUM_DATA: Record<number, { gradeName: string; fase: string; subjects: ISdSubjectItem[] }> = {
  // ==========================================================
  // KELAS 1 SD (5 MATA PELAJARAN DASAR)
  // ==========================================================
  1: {
    gradeName: 'Kelas 1 SD',
    fase: 'Fase A (Awal Belajar)',
    subjects: [
      {
        id: 'mtk-1',
        name: 'Matematika (MTK)',
        shortName: 'MTK',
        emoji: '🔢',
        badge: 'Angka 1-20',
        subtitle: 'Mengenal bilangan 1 sampai 20 & hitung tambah buah-buahan!',
        cardBg: 'bg-amber-50/90',
        cardBorder: 'border-amber-300',
        cardHover: 'hover:border-amber-400 hover:bg-amber-100/80',
        badgeBg: 'bg-amber-200 text-amber-900',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold',
        points: [
          'Membilang banyak benda dari 1 sampai 20 dengan gambar lucu 🍎.',
          'Penjumlahan gampang: 3 apel ditambah 2 apel sama dengan 5 apel!',
          'Mengenal bentuk sederhana: Lingkaran bulat 🟡 dan Kotak persegi 🟩.',
        ],
        quiz: {
          question: 'Ada 4 bintang kuning, lalu dapat 3 bintang lagi. Berapa totalnya?',
          options: ['6 Bintang ⭐', '7 Bintang ⭐', '8 Bintang ⭐'],
          answerIndex: 1,
          explanation: 'Hebat! 4 ditambah 3 sama dengan 7 bintang ceria.',
        },
        funFact: 'Jari tangan kita ada 10, bisa dipakai untuk belajar berhitung cepat lho!',
      },
      {
        id: 'pai-1',
        name: 'Pendidikan Agama Islam (PAI)',
        shortName: 'PAI',
        emoji: '🌙',
        badge: 'Rukun Iman & Doa',
        subtitle: 'Huruf hijaiyah tunggal, doa makan, & sayang orang tua!',
        cardBg: 'bg-teal-50/90',
        cardBorder: 'border-teal-300',
        cardHover: 'hover:border-teal-400 hover:bg-teal-100/80',
        badgeBg: 'bg-teal-200 text-teal-900',
        btnBg: 'bg-teal-500 hover:bg-teal-600 text-white',
        points: [
          'Mengenal huruf hijaiyah: Alif (ا), Ba (ب), Ta (ت), Tsa (ث), Jim (ج).',
          'Doa sebelum makan: Membaca Basmalah agar berkah dan sehat 🤲.',
          'Rukun Iman pertama: Percaya bahwa Allah SWT adalah Tuhan yang Maha Esa.',
        ],
        quiz: {
          question: 'Sebelum makan dan minum, kita dianjurkan membaca...',
          options: ['Alhamdulillah 🌸', 'Bismillah 🤲', 'Allahu Akbar ✨'],
          answerIndex: 1,
          explanation: 'Pintar! Membaca Bismillah sebelum makan membuat makanan kita penuh berkah.',
        },
        funFact: 'Nabi Muhammad SAW sangat menyukai anak-anak yang ramah dan suka tersenyum.',
      },
      {
        id: 'pancasila-1',
        name: 'Pendidikan Pancasila',
        shortName: 'Pancasila',
        emoji: '🦅',
        badge: 'Simbol Garuda',
        subtitle: 'Mengenal burung Garuda & tata tertib di rumah dan sekolah!',
        cardBg: 'bg-rose-50/90',
        cardBorder: 'border-rose-300',
        cardHover: 'hover:border-rose-400 hover:bg-rose-100/80',
        badgeBg: 'bg-rose-200 text-rose-900',
        btnBg: 'bg-rose-500 hover:bg-rose-600 text-white',
        points: [
          'Mengenal lambang negara: Burung Garuda Pancasila yang gagah 🇮🇩.',
          'Tertib di kelas: Mendengarkan bapak/ibu guru saat menerangkan pelajaran.',
          'Sayang teman: Berbagi krayon atau pensil warna bersama kawan sebangku.',
        ],
        quiz: {
          question: 'Simbol Sila ke-1 pada perisai Garuda adalah...',
          options: ['Bintang Emas ⭐', 'Rantai Emas 🔗', 'Pohon Beringin 🌳'],
          answerIndex: 0,
          explanation: 'Tepat sekali! Sila pertama dilambangkan dengan Bintang Emas di tengah perisai.',
        },
        funFact: 'Garuda Pancasila menoleh ke arah kanan yang melambangkan kebaikan dan kemuliaan.',
      },
      {
        id: 'arab-1',
        name: 'Bahasa Arab',
        shortName: 'Arab',
        emoji: '🕌',
        badge: 'Sapaan & Angka',
        subtitle: 'Sapaan ramah Shobahul Khoir & angka Arab Wahid-Khamsah!',
        cardBg: 'bg-emerald-50/90',
        cardBorder: 'border-emerald-300',
        cardHover: 'hover:border-emerald-400 hover:bg-emerald-100/80',
        badgeBg: 'bg-emerald-200 text-emerald-900',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        points: [
          'Sapaan pagi: "Shobahul Khoir" (Selamat pagi) dijawab "Shobahun Nuur" ☀️.',
          'Hitung 1-5: Wahid (1), Itsnan (2), Tsalatsah (3), Arba\'ah (4), Khamsah (5).',
          'Ucapan terima kasih: "Syukran" (Terima kasih) dijawab "\'Afwan" (Sama-sama).',
        ],
        quiz: {
          question: 'Berapakah nilai angka Arab "Wahid" (وَاحِدٌ)?',
          options: ['1 ☝️', '2 ✌️', '3 🤟'],
          answerIndex: 0,
          explanation: 'Wahid artinya satu (1)!',
        },
        funFact: 'Bahasa Arab memiliki huruf-huruf yang indah jika ditulis kaligrafi.',
      },
      {
        id: 'jawa-1',
        name: 'Bahasa Jawa',
        shortName: 'B. Jawa',
        emoji: '🎭',
        badge: 'Tembang Dolanan',
        subtitle: 'Sinau tembang dolanan Menthok-Menthok & basa ngoko rukun!',
        cardBg: 'bg-orange-50/90',
        cardBorder: 'border-orange-300',
        cardHover: 'hover:border-orange-400 hover:bg-orange-100/80',
        badgeBg: 'bg-orange-200 text-orange-900',
        btnBg: 'bg-orange-500 hover:bg-orange-600 text-white',
        points: [
          'Tembang Dolanan: "Menthok, menthok tak kandhani... mung lakumu megal-megol gawe guyu" 🦆.',
          'Rukun karo kanca: Ora pareng tukaran lan seneng tetulung.',
          'Perangane awak: Mripat (mata), Irung (hidung), Kuping (telinga), Cangkem (mulut).',
        ],
        quiz: {
          question: 'Perangane awak kanggo ndelok sesawangan yaiku...',
          options: ['Kuping 👂', 'Mripat 👀', 'Irung 👃'],
          answerIndex: 1,
          explanation: 'Bener! Mripat gunane kanggo ndelok, yen kuping kanggo ngrungokake.',
        },
        funFact: 'Tembang dolanan Jawa digawe supaya bocah-bocah seneng dolanan bebarengan ing latar!',
      },
    ],
  },

  // ==========================================================
  // KELAS 2 SD (6 MATA PELAJARAN)
  // ==========================================================
  2: {
    gradeName: 'Kelas 2 SD',
    fase: 'Fase A (Lanjutan)',
    subjects: [
      {
        id: 'mtk-2',
        name: 'Matematika (MTK)',
        shortName: 'MTK',
        emoji: '🔢',
        badge: 'Ratusan & Bentuk',
        subtitle: 'Penjumlahan ratusan, ukur panjang meteran, & bangun datar!',
        cardBg: 'bg-amber-50/90',
        cardBorder: 'border-amber-300',
        cardHover: 'hover:border-amber-400 hover:bg-amber-100/80',
        badgeBg: 'bg-amber-200 text-amber-900',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold',
        points: [
          'Penjumlahan & Pengurangan sampai 100 dengan teknik bersusun 📝.',
          'Mengenal satuan panjang: Centimeter (cm) dengan penggaris kelas 📏.',
          'Bangun Datar: Segitiga (3 sisi), Persegi (4 sisi sama panjang).',
        ],
        quiz: {
          question: 'Berapakah hasil dari 25 + 15?',
          options: ['30 🎈', '40 ⭐', '50 🚀'],
          answerIndex: 1,
          explanation: 'Pintar! 25 ditambah 15 hasilnya pas 40.',
        },
        funFact: 'Penggaris sekolah biasanya memiliki panjang 30 centimeter.',
      },
      {
        id: 'pai-2',
        name: 'Pendidikan Agama Islam (PAI)',
        shortName: 'PAI',
        emoji: '🌙',
        badge: 'Wudhu & Sholat',
        subtitle: 'Tata cara wudhu yang benar, rukun sholat, & surat Al-Ikhlas!',
        cardBg: 'bg-teal-50/90',
        cardBorder: 'border-teal-300',
        cardHover: 'hover:border-teal-400 hover:bg-teal-100/80',
        badgeBg: 'bg-teal-200 text-teal-900',
        btnBg: 'bg-teal-500 hover:bg-teal-600 text-white',
        points: [
          'Urutan wudhu tertib: Cuci tangan, kumur, hidung, muka, tangan, kepala, telinga, kaki 💧.',
          'Surat Al-Ikhlas: Menegaskan bahwa Allah SWT itu Esa dan tempat meminta.',
          'Sholat 5 Waktu: Mengenal rakaat Subuh (2), Dzuhur (4), Ashar (4), Maghrib (3), Isya (4).',
        ],
        quiz: {
          question: 'Berapa jumlah rakaat sholat Subuh?',
          options: ['2 Rakaat 🌅', '3 Rakaat 🌇', '4 Rakaat ☀️'],
          answerIndex: 0,
          explanation: 'Benar! Sholat Subuh dikerjakan sebanyak 2 rakaat di pagi hari.',
        },
        funFact: 'Berwudhu tidak hanya membersihkan badan, tapi juga bikin wajah segar bercahaya!',
      },
      {
        id: 'pancasila-2',
        name: 'Pendidikan Pancasila',
        shortName: 'Pancasila',
        emoji: '🦅',
        badge: 'Tolong Menolong',
        subtitle: 'Sikap tolong-menolong, rukun tetangga, & jujur setiap hari!',
        cardBg: 'bg-rose-50/90',
        cardBorder: 'border-rose-300',
        cardHover: 'hover:border-rose-400 hover:bg-rose-100/80',
        badgeBg: 'bg-rose-200 text-rose-900',
        btnBg: 'bg-rose-500 hover:bg-rose-600 text-white',
        points: [
          'Pengamalan Sila 2: Menolong teman yang terjatuh di halaman sekolah ❤️.',
          'Menghargai keragaman teman yang berasal dari suku atau agama berbeda.',
          'Aturan di Rumah: Merapikan mainan sendiri setelah selesai bermain.',
        ],
        quiz: {
          question: 'Jika melihat teman terjatuh saat lari di halaman, sikap kita adalah...',
          options: ['Menertawakannya ❌', 'Segera menolongnya 🤝', 'Meninggalkannya pergi 🏃'],
          answerIndex: 1,
          explanation: 'Bagus! Anak Pancasila selalu sigap menolong sesama teman.',
        },
        funFact: 'Sila ke-2 mengajarkan kita untuk selalu memiliki rasa kasih sayang pada sesama manusia.',
      },
      {
        id: 'inggris-2',
        name: 'Bahasa Inggris',
        shortName: 'B. Inggris',
        emoji: '🌍',
        badge: 'Colors & Animals',
        subtitle: 'Mengenal warna-warni pelangi & nama hewan lucu dalam bahasa Inggris!',
        cardBg: 'bg-sky-50/90',
        cardBorder: 'border-sky-300',
        cardHover: 'hover:border-sky-400 hover:bg-sky-100/80',
        badgeBg: 'bg-sky-200 text-sky-900',
        btnBg: 'bg-sky-500 hover:bg-sky-600 text-white',
        points: [
          'Rainbow Colors: Red (Merah) 🔴, Blue (Biru) 🔵, Yellow (Kuning) 🟡, Green (Hijau) 🟢.',
          'Cute Animals: Cat (Kucing) 🐱, Dog (Anjing) 🐶, Bird (Burung) 🐦, Fish (Ikan) 🐟.',
          'Greetings: "Good Morning" (Selamat pagi) & "See You" (Sampai jumpa!).',
        ],
        quiz: {
          question: 'What is the color of the clear sky?',
          options: ['Red 🔴', 'Blue 🔵', 'Black ⚫'],
          answerIndex: 1,
          explanation: 'Great! Sky is blue (Langit berwarna biru).',
        },
        funFact: 'Kucing dalam bahasa Inggris disebut Cat, dan anak kucing disebut Kitten!',
      },
      {
        id: 'arab-2',
        name: 'Bahasa Arab',
        shortName: 'Arab',
        emoji: '🕌',
        badge: 'Benda di Kelas',
        subtitle: 'Menamai benda di meja kelas dengan bahasa Arab!',
        cardBg: 'bg-emerald-50/90',
        cardBorder: 'border-emerald-300',
        cardHover: 'hover:border-emerald-400 hover:bg-emerald-100/80',
        badgeBg: 'bg-emerald-200 text-emerald-900',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        points: [
          'Maktabun (مَكْتَبٌ) = Meja belajar siswa / Meja guru 🪑.',
          'Kursiyyun (كُرْسِيٌّ) = Kursi belajar.',
          'Qolamun (قَلَمٌ) = Pensil / Pulpen tulis ✏️.',
          'Kitaabun (كِتَابٌ) = Buku pelajaran sekolah 📖.',
        ],
        quiz: {
          question: 'Apa bahasa Arab dari kata "Buku"?',
          options: ['Maktabun 🪑', 'Kitaabun 📖', 'Qolamun ✏️'],
          answerIndex: 1,
          explanation: 'Benar! Kitaabun (كِتَابٌ) artinya buku pelajaran.',
        },
        funFact: 'Kata "Kitab" dalam bahasa Indonesia diserap dari bahasa Arab Kitaabun.',
      },
      {
        id: 'jawa-2',
        name: 'Bahasa Jawa',
        shortName: 'B. Jawa',
        emoji: '🎭',
        badge: 'Unggah-Ungguh',
        subtitle: 'Unggah-ungguh marang wong tuwa & tembang Gundhul Pacul!',
        cardBg: 'bg-orange-50/90',
        cardBorder: 'border-orange-300',
        cardHover: 'hover:border-orange-400 hover:bg-orange-100/80',
        badgeBg: 'bg-orange-200 text-orange-900',
        btnBg: 'bg-orange-500 hover:bg-orange-600 text-white',
        points: [
          'Basa Krama marang Bapak/Ibu: "Kula nyuwun pamit badhe bidhal sekolah" 🎒.',
          'Tembang Gundhul Pacul: Ajar supaya dadi bocah sing ora sombong.',
          'Jeneng kewan: Pitik (ayam), Kucing, Wedhus (kambing), Sapi.',
        ],
        quiz: {
          question: 'Yen arep mangkat sekolah, becike matur marang wong tuwa nganggo...',
          options: ['Nyuwun pamit salam 🙏', 'Mlayu meneng-menengan 🏃', 'Nangis banter 😭'],
          answerIndex: 0,
          explanation: 'Bocah pinter mesthi nyuwun pamit lan salim marang bapak ibu sadurunge budhal sekolah.',
        },
        funFact: 'Gundhul-Gundhul Pacul diciptakake dening Sunan Kalijaga kanthi pitutur kang luhur.',
      },
    ],
  },

  // ==========================================================
  // KELAS 3 SD (7 MATA PELAJARAN - MULAI IPAS!)
  // ==========================================================
  3: {
    gradeName: 'Kelas 3 SD',
    fase: 'Fase B (Mulai Sains IPAS)',
    subjects: [
      {
        id: 'ipas-3',
        name: 'IPAS (Alam & Sosial)',
        shortName: 'IPAS',
        emoji: '🔬',
        badge: 'Mulai IPAS! 🌿',
        subtitle: 'Daur hidup kupu-kupu, wujud zat padat/cair, & panca indra!',
        cardBg: 'bg-lime-50/90',
        cardBorder: 'border-lime-300',
        cardHover: 'hover:border-lime-400 hover:bg-lime-100/80',
        badgeBg: 'bg-lime-200 text-lime-900',
        btnBg: 'bg-lime-500 hover:bg-lime-600 text-neutral-900 font-bold',
        points: [
          'Metamorfosis Kupu-Kupu: Telur ➔ Ulat lucu ➔ Kepompong ➔ Kupu-kupu cantik 🦋.',
          'Wujud Benda: Padat (meja/buku), Cair (air/minyak), Gas (udara/balon) 🎈.',
          'Perubahan Wujud: Es mencair jadi air jika terkena panas matahari ☀️.',
        ],
        quiz: {
          question: 'Perubahan wujud es batu padat menjadi air dinamakan...',
          options: ['Membeku ❄️', 'Mencair 💧', 'Menguap 💨'],
          answerIndex: 1,
          explanation: 'Pintar! Es batu yang dipanaskan akan mencair menjadi air.',
        },
        funFact: 'Kupu-kupu mengecap rasa bunga menggunakan sensor di kakinya!',
      },
      {
        id: 'mtk-3',
        name: 'Matematika (MTK)',
        shortName: 'MTK',
        emoji: '🔢',
        badge: 'Perkalian & Jam',
        subtitle: 'Perkalian 1-10, pecahan sederhana 1/2 dan 1/4, serta membaca jam!',
        cardBg: 'bg-amber-50/90',
        cardBorder: 'border-amber-300',
        cardHover: 'hover:border-amber-400 hover:bg-amber-100/80',
        badgeBg: 'bg-amber-200 text-amber-900',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold',
        points: [
          'Perkalian Cepat: 6 x 5 = 30. Perkalian adalah penjumlahan berulang!',
          'Pecahan Pizza: Satu kue dibagi 2 sama rata adalah 1/2 (setengah) 🍕.',
          'Membaca Jam: Jarum pendek di angka 7 dan jarum panjang di 12 = Jam 7 tepat ⏰.',
        ],
        quiz: {
          question: 'Berapakah hasil dari 4 x 5?',
          options: ['16 🎈', '20 ⭐', '25 🚀'],
          answerIndex: 1,
          explanation: 'Benar! 4 dikali 5 sama dengan 20.',
        },
        funFact: '1 jam sama dengan 60 menit dan 3.600 detik.',
      },
      {
        id: 'pai-3',
        name: 'Pendidikan Agama Islam (PAI)',
        shortName: 'PAI',
        emoji: '🌙',
        badge: 'Sholat & Nabi',
        subtitle: 'Sholat berjamaah, puasa Ramadhan, & 4 sifat wajib Rasul!',
        cardBg: 'bg-teal-50/90',
        cardBorder: 'border-teal-300',
        cardHover: 'hover:border-teal-400 hover:bg-teal-100/80',
        badgeBg: 'bg-teal-200 text-teal-900',
        btnBg: 'bg-teal-500 hover:bg-teal-600 text-white',
        points: [
          'Sholat Berjamaah di sekolah melatih kekompakan dan pahala 27 derajat 🕌.',
          '4 Sifat Wajib Rasul: Siddiq (jujur), Amanah (terpercaya), Tabligh (menyampaikan), Fathonah (cerdas).',
          'Belajar berpuasa di bulan suci Ramadhan untuk melatih kesabaran.',
        ],
        quiz: {
          question: 'Sifat wajib Rasul "Siddiq" memiliki arti...',
          options: ['Dapat Dipercaya ✨', 'Selalu Berkata Jujur 💖', 'Sangat Cerdas 🧠'],
          answerIndex: 1,
          explanation: 'Siddiq artinya jujur dan berkata benar.',
        },
        funFact: 'Pahala sholat berjamaah adalah 27 kali lipat lebih banyak dibandingkan sholat sendirian.',
      },
      {
        id: 'pancasila-3',
        name: 'Pendidikan Pancasila',
        shortName: 'Pancasila',
        emoji: '🦅',
        badge: 'Musyawarah Kelas',
        subtitle: 'Pohon beringin persatuan, musyawarah kelas, & gotong royong!',
        cardBg: 'bg-rose-50/90',
        cardBorder: 'border-rose-300',
        cardHover: 'hover:border-rose-400 hover:bg-rose-100/80',
        badgeBg: 'bg-rose-200 text-rose-900',
        btnBg: 'bg-rose-500 hover:bg-rose-600 text-white',
        points: [
          'Sila ke-3 (Persatuan Indonesia): Menjaga kebersamaan dengan teman tanpa membeda-bedakan.',
          'Sila ke-4 (Musyawarah): Memilih pengurus kelas lewat diskusi yang adil dan rukun.',
          'Menghargai hasil keputusan bersama dengan hati senang.',
        ],
        quiz: {
          question: 'Lambang Sila ke-4 Pancasila adalah...',
          options: ['Kepala Banteng 🐂', 'Pohon Beringin 🌳', 'Padi dan Kapas 🌾'],
          answerIndex: 0,
          explanation: 'Hebat! Kepala Banteng melambangkan musyawarah dan kekeluargaan.',
        },
        funFact: 'Banteng suka berkumpul bersama kawanan, melambangkan rakyat yang bermusyawarah.',
      },
      {
        id: 'inggris-3',
        name: 'Bahasa Inggris',
        shortName: 'B. Inggris',
        emoji: '🌍',
        badge: 'Classroom & Talk',
        subtitle: 'Menamai benda meja belajar & percakapan sederhana di sekolah!',
        cardBg: 'bg-sky-50/90',
        cardBorder: 'border-sky-300',
        cardHover: 'hover:border-sky-400 hover:bg-sky-100/80',
        badgeBg: 'bg-sky-200 text-sky-900',
        btnBg: 'bg-sky-500 hover:bg-sky-600 text-white',
        points: [
          'Desk words: Teacher\'s Desk (Meja Guru), Student Desk (Meja Siswa), Chair (Kursi).',
          'Phrases: "May I borrow your ruler?" (Bolehkah saya pinjam penggarismu?).',
          'Numbers: Counting numbers 1 to 50 with ease! ⭐',
        ],
        quiz: {
          question: 'How do you say "Terima kasih banyak" in English?',
          options: ['Thank you very much! 💖', 'Good bye! 👋', 'I am sorry! 🥺'],
          answerIndex: 0,
          explanation: '"Thank you very much" artinya terima kasih banyak!',
        },
        funFact: 'Kata "Pencil" berasal dari bahasa Latin "Pencillus" yang artinya kuas kecil.',
      },
      {
        id: 'jawa-3',
        name: 'Bahasa Jawa',
        shortName: 'B. Jawa',
        emoji: '🎭',
        badge: 'Aksara & Wayang',
        subtitle: 'Mengenal 20 Aksara Jawa legena & cerita 4 Punakawan!',
        cardBg: 'bg-orange-50/90',
        cardBorder: 'border-orange-300',
        cardHover: 'hover:border-orange-400 hover:bg-orange-100/80',
        badgeBg: 'bg-orange-200 text-orange-900',
        btnBg: 'bg-orange-500 hover:bg-orange-600 text-white',
        points: [
          'Aksara Jawa: Ha, Na, Ca, Ra, Ka... Data Sawala... Padha Jayanya... Maga Bathanga.',
          'Punakawan: Kyai Semar, Gareng, Petruk (irunge dawa), Bagong (awake lemu bunder).',
          'Tembang Dolanan: Padhang Bulan ("Ayo kanca dolanan ing jaba") 🌕.',
        ],
        quiz: {
          question: 'Punakawan sing duwe irung paling dawa lan seneng guyon yaiku...',
          options: ['Petruk 👃', 'Bagong ⚪', 'Gareng 🦵'],
          answerIndex: 0,
          explanation: 'Petruk nduweni perawakan dhuwur mencolot lan irung dawa.',
        },
        funFact: 'Aksara Jawa cacahe ana 20 kang ngemot piwulang urip luhur.',
      },
      {
        id: 'arab-3',
        name: 'Bahasa Arab',
        shortName: 'Arab',
        emoji: '🕌',
        badge: 'Hiwar & Tubuh',
        subtitle: 'Percakapan sapaan Al-Hiwar & nama anggota tubuh bahasa Arab!',
        cardBg: 'bg-emerald-50/90',
        cardBorder: 'border-emerald-300',
        cardHover: 'hover:border-emerald-400 hover:bg-emerald-100/80',
        badgeBg: 'bg-emerald-200 text-emerald-900',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        points: [
          'Al-Hiwar: "Kaifa Haluk?" (Bagaimana kabarmu?) dijawab "Bi-khoirin Alhamdulillah" ✨.',
          'A\'dha-ul Jismi (Anggota Tubuh): Ra\'sun (Kepala), \'Ainun (Mata), Yadun (Tangan).',
          'Angka 1-10: Wahid s.d. \'Asyarah (10) berurutan.',
        ],
        quiz: {
          question: 'Apa arti dari kata "Yadun" (يَدٌ) dalam bahasa Arab?',
          options: ['Tangan ✋', 'Mata 👀', 'Kaki 🦶'],
          answerIndex: 0,
          explanation: 'Yadun artinya tangan.',
        },
        funFact: 'Bahasa Arab digunakan dalam kitab suci Al-Qur\'an.',
      },
    ],
  },

  // ==========================================================
  // KELAS 4 SD (8 MATA PELAJARAN LENGKAP)
  // ==========================================================
  4: {
    gradeName: 'Kelas 4 SD',
    fase: 'Fase B (Eksplorasi Lengkap)',
    subjects: [
      {
        id: 'ipas-4',
        name: 'IPAS (Alam & Sosial)',
        shortName: 'IPAS',
        emoji: '🔬',
        badge: 'Energi & Peta',
        subtitle: 'Gaya magnet, perubahan energi, bentang alam, & peta nusantara!',
        cardBg: 'bg-lime-50/90',
        cardBorder: 'border-lime-300',
        cardHover: 'hover:border-lime-400 hover:bg-lime-100/80',
        badgeBg: 'bg-lime-200 text-lime-900',
        btnBg: 'bg-lime-500 hover:bg-lime-600 text-neutral-900 font-bold',
        points: [
          'Gaya & Magnet: Magnet punya 2 kutub (Utara & Selatan). Kutub senama tolak-menolak 🧲.',
          'Perubahan Energi: Energi listrik jadi cahaya (lampu) & gerak (kipas angin) 💡.',
          'Peta Nusantara: Mengenal 5 pulau besar Indonesia: Sumatra, Jawa, Kalimantan, Sulawesi, Papua 🗺️.',
        ],
        quiz: {
          question: 'Kipas angin yang berputar mengubah energi listrik menjadi energi...',
          options: ['Cahaya 💡', 'Gerak 🌀', 'Bunyi 📢'],
          answerIndex: 1,
          explanation: 'Tepat! Kipas angin mengubah listrik menjadi energi kinetik/gerak.',
        },
        funFact: 'Bumi kita adalah magnet raksasa dengan kutub utara dan selatan magnetik!',
      },
      {
        id: 'mtk-4',
        name: 'Matematika (MTK)',
        shortName: 'MTK',
        emoji: '🔢',
        badge: 'Luas & Keliling',
        subtitle: 'Operasi hitung campuran, luas persegi/segitiga, & pecahan senilai!',
        cardBg: 'bg-amber-50/90',
        cardBorder: 'border-amber-300',
        cardHover: 'hover:border-amber-400 hover:bg-amber-100/80',
        badgeBg: 'bg-amber-200 text-amber-900',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold',
        points: [
          'Operasi Campuran: Dahulukan perkalian & pembagian sebelum tambah/kurang 🧮.',
          'Luas Persegi: Rumusnya sisi x sisi (contoh: 5 x 5 = 25 cm²).',
          'Pecahan Senilai: 1/2 itu nilainya sama dengan 2/4 dan 50% 🍕.',
        ],
        quiz: {
          question: 'Hitunglah: (6 x 5) + 20 = ?',
          options: ['40 🎈', '50 ⭐', '60 🚀'],
          answerIndex: 1,
          explanation: '6 x 5 = 30. Lalu 30 + 20 = 50.',
        },
        funFact: 'Rumus geometri sudah dipakai ribuan tahun lalu untuk membangun Piramida di Mesir.',
      },
      {
        id: 'pkn-4',
        name: 'Pendidikan Kewarganegaraan (PKn)',
        shortName: 'PKn',
        emoji: '🇮🇩',
        badge: 'Hak & Kewajiban',
        subtitle: 'Hak dan kewajiban anak di sekolah, tata tertib, & norma sopan santun!',
        cardBg: 'bg-indigo-50/90',
        cardBorder: 'border-indigo-300',
        cardHover: 'hover:border-indigo-400 hover:bg-indigo-100/80',
        badgeBg: 'bg-indigo-200 text-indigo-900',
        btnBg: 'bg-indigo-500 hover:bg-indigo-600 text-white',
        points: [
          'Kewajiban Siswa: Datang tepat waktu, merawat meja kursi kelas, dan hormat pada guru 📚.',
          'Hak Siswa: Mendapat nilai yang adil, pengajaran ramah, dan ruang kelas yang bersih.',
          'Norma Kesopanan: Menyapa bapak/ibu guru dengan senyum, sapa, dan salam.',
        ],
        quiz: {
          question: 'Menjaga kebersihan dan fasilitas meja di kelas merupakan contoh...',
          options: ['Hak Siswa 🎁', 'Kewajiban Siswa 🧹', 'Hukuman Guru ⚠️'],
          answerIndex: 1,
          explanation: 'Benar! Menjaga kebersihan meja adalah kewajiban setiap anak sekolah.',
        },
        funFact: 'Kewajiban harus kita laksanakan terlebih dahulu sebelum menuntut hak.',
      },
      {
        id: 'pancasila-4',
        name: 'Pendidikan Pancasila',
        shortName: 'Pancasila',
        emoji: '🦅',
        badge: 'Bhinneka Tunggal Ika',
        subtitle: 'Keragaman budaya nusantara, rumah adat, & toleransi kebangsaan!',
        cardBg: 'bg-rose-50/90',
        cardBorder: 'border-rose-300',
        cardHover: 'hover:border-rose-400 hover:bg-rose-100/80',
        badgeBg: 'bg-rose-200 text-rose-900',
        btnBg: 'bg-rose-500 hover:bg-rose-600 text-white',
        points: [
          'Keragaman Suku: Suku Jawa, Sunda, Batak, Minang, Dayak, Bugis, Asmat hidup rukun.',
          'Makna Bhinneka Tunggal Ika: Berbeda-beda tapi tetap satu nusa satu bangsa 🇮🇩.',
          'Rumah Adat: Rumah Joglo (Jawa), Gadang (Minang), Tongkonan (Toraja), Honai (Papua).',
        ],
        quiz: {
          question: 'Rumah Gadang dengan atap melengkung runcing berasal dari daerah...',
          options: ['Sumatera Barat 🏛️', 'Jawa Tengah 🏠', 'Papua 🛖'],
          answerIndex: 0,
          explanation: 'Rumah Gadang adalah rumah adat suku Minangkabau di Sumatera Barat.',
        },
        funFact: 'Indonesia memiliki lebih dari 300 kelompok etnis dan 700 bahasa daerah yang kaya!',
      },
      {
        id: 'pai-4',
        name: 'Pendidikan Agama Islam (PAI)',
        shortName: 'PAI',
        emoji: '🌙',
        badge: 'Surat & Zakat',
        subtitle: 'Surat Al-Falaq & An-Nas, zakat fitrah, & kisah Nabi Musa AS!',
        cardBg: 'bg-teal-50/90',
        cardBorder: 'border-teal-300',
        cardHover: 'hover:border-teal-400 hover:bg-teal-100/80',
        badgeBg: 'bg-teal-200 text-teal-900',
        btnBg: 'bg-teal-500 hover:bg-teal-600 text-white',
        points: [
          'Surat Al-Falaq & An-Nas: Surat perlindungan dari bisikan jahat dan rasa takut 📖.',
          'Zakat Fitrah: Kewajiban berbagi beras di bulan Ramadhan untuk membantu fakir miskin 🌾.',
          'Kisah Nabi Musa AS: Keteguhan melawan kedzaliman Raja Fir\'aun dengan mukjizat tongkat.',
        ],
        quiz: {
          question: 'Zakat fitrah yang kita keluarkan di akhir bulan Ramadhan biasanya berupa...',
          options: ['Beras / Makanan Pokok 🌾', 'Mainan Anak 🧸', 'Baju Bekas 👕'],
          answerIndex: 0,
          explanation: 'Zakat fitrah dibayarkan dengan makanan pokok seperti beras sebanyak 2,5 kg / 3,5 liter.',
        },
        funFact: 'Membayar zakat membersihkan jiwa dan harta serta membahagiakan orang yang membutuhkan.',
      },
      {
        id: 'inggris-4',
        name: 'Bahasa Inggris',
        shortName: 'B. Inggris',
        emoji: '🌍',
        badge: 'Daily Routines',
        subtitle: 'Aktivitas sehari-hari di sekolah & ekspresi santun bahasa Inggris!',
        cardBg: 'bg-sky-50/90',
        cardBorder: 'border-sky-300',
        cardHover: 'hover:border-sky-400 hover:bg-sky-100/80',
        badgeBg: 'bg-sky-200 text-sky-900',
        btnBg: 'bg-sky-500 hover:bg-sky-600 text-white',
        points: [
          'Daily Activities: "I study at my desk", "I read a book", "I play with my friends" 📖.',
          'Polite Expressions: "Excuse me", "Please", "Thank you", "You are welcome" ✨.',
          'Days of the Week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
        ],
        quiz: {
          question: 'Which day comes after Tuesday?',
          options: ['Monday 📅', 'Wednesday 📅', 'Friday 📅'],
          answerIndex: 1,
          explanation: 'Wednesday (Rabu) adalah hari setelah Tuesday (Selasa).',
        },
        funFact: 'Bahasa Inggris memiliki 26 huruf alfabet yang sama persis dengan bahasa Indonesia.',
      },
      {
        id: 'arab-4',
        name: 'Bahasa Arab',
        shortName: 'Arab',
        emoji: '🕌',
        badge: 'Keluarga & Rumah',
        subtitle: 'Kosakata rumah tangga Al-Usrah, kalimat tanya, & angka 1-20!',
        cardBg: 'bg-emerald-50/90',
        cardBorder: 'border-emerald-300',
        cardHover: 'hover:border-emerald-400 hover:bg-emerald-100/80',
        badgeBg: 'bg-emerald-200 text-emerald-900',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        points: [
          'Al-Usrah (Keluarga): Abun (Ayah) 👨, Ummun (Ibu) 👩, Akhun (Saudara), Ukhtun (Saudari).',
          'Tanya Benda: "Maa haadza?" (Apa ini?) dijawab "Haadza Maktabun" (Ini meja).',
          'Angka 11-20: Ahada \'asyara (11), Itsna \'asyara (12) s.d. \'Isyruuna (20).',
        ],
        quiz: {
          question: 'Apa bahasa Arab dari kata "Ibu"?',
          options: ['Abun 👨', 'Ummun 👩', 'Akhun 👦'],
          answerIndex: 1,
          explanation: 'Ummun artinya ibu.',
        },
        funFact: 'Surga berada di bawah telapak kaki ibu (Ummun).',
      },
      {
        id: 'jawa-4',
        name: 'Bahasa Jawa',
        shortName: 'B. Jawa',
        emoji: '🎭',
        badge: 'Krama Lugu/Alus',
        subtitle: 'Basa Krama Lugu & Alus, aksara Jawa, serta tembang Padhang Bulan!',
        cardBg: 'bg-orange-50/90',
        cardBorder: 'border-orange-300',
        cardHover: 'hover:border-orange-400 hover:bg-orange-100/80',
        badgeBg: 'bg-orange-200 text-orange-900',
        btnBg: 'bg-orange-500 hover:bg-orange-600 text-white',
        points: [
          'Tataran Basa: "Mangan" (Ngoko) -> "Nedha" (Krama) -> "Dhahar" (Krama Alus).',
          'Tembung: "Turu" (Ngoko) -> "Tilem" (Krama) -> "Sare" (Krama Alus marang wong tuwa).',
          'Tembang Padhang Bulan: "Remblane kang ngawe-awe, ngelingake aja padha turu sore" 🌕.',
        ],
        quiz: {
          question: 'Basa krama alus saka tembung "Turu" kanggo bapak/ibu yaiku...',
          options: ['Tilem 🛏️', 'Sare 💤', 'Mlebu 🚪'],
          answerIndex: 1,
          explanation: 'Sare yaiku basa krama alus kanggo turu.',
        },
        funFact: 'Unggah-ungguh basa Jawa mulangake tata krama kurmat marang wong kang luwih sepuh.',
      },
    ],
  },

  // ==========================================================
  // KELAS 5 SD (8 MATA PELAJARAN LOGIKA & PENDALAMAN)
  // ==========================================================
  5: {
    gradeName: 'Kelas 5 SD',
    fase: 'Fase C (Pendalaman Materi)',
    subjects: [
      {
        id: 'mtk-5',
        name: 'Matematika (MTK)',
        shortName: 'MTK',
        emoji: '🔢',
        badge: 'Desimal & Volume',
        subtitle: 'Pecahan desimal, persen, perbandingan skala, & volume kubus/balok!',
        cardBg: 'bg-amber-50/90',
        cardBorder: 'border-amber-300',
        cardHover: 'hover:border-amber-400 hover:bg-amber-100/80',
        badgeBg: 'bg-amber-200 text-amber-900',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold',
        points: [
          'Pecahan ke Desimal & Persen: 3/4 = 0,75 = 75% 📊.',
          'Volume Bangun Ruang: Volume Balok = Panjang x Lebar x Tinggi (p x l x t) 📦.',
          'Skala Peta: Jarak pada peta 1 : 100.000 (1 cm di peta = 1 km di kenyataan) 🗺️.',
        ],
        quiz: {
          question: 'Sebuah balok memiliki p = 5 cm, l = 4 cm, t = 3 cm. Berapa volumenya?',
          options: ['50 cm³ 📦', '60 cm³ 📦', '70 cm³ 📦'],
          answerIndex: 1,
          explanation: 'Volume = 5 x 4 x 3 = 60 cm³.',
        },
        funFact: 'Volume mengukur seberapa banyak air atau ruang yang bisa ditampung di dalam wadah!',
      },
      {
        id: 'ipas-5',
        name: 'IPAS (Alam & Sosial)',
        shortName: 'IPAS',
        emoji: '🔬',
        badge: 'Organ & Ekosistem',
        subtitle: 'Organ pernapasan manusia, rantai makanan ekosistem, & sejarah RI!',
        cardBg: 'bg-lime-50/90',
        cardBorder: 'border-lime-300',
        cardHover: 'hover:border-lime-400 hover:bg-lime-100/80',
        badgeBg: 'bg-lime-200 text-lime-900',
        btnBg: 'bg-lime-500 hover:bg-lime-600 text-neutral-900 font-bold',
        points: [
          'Organ Pernapasan: Hidung ➔ Tenggorokan ➔ Paru-paru (pertukaran oksigen & CO2) 🫁.',
          'Rantai Makanan: Padi (produsen) ➔ Belalang ➔ Katak ➔ Ular ➔ Elang (konsumen puncak) 🦅.',
          'Sejarah Proklamasi: Peristiwa Rengasdengklok menjelang kemerdekaan 17 Agustus 1945 🇮🇩.',
        ],
        quiz: {
          question: 'Organ utama tubuh manusia yang menyerap oksigen dari udara adalah...',
          options: ['Lambung 🍲', 'Paru-paru 🫁', 'Ginjal 🫘'],
          answerIndex: 1,
          explanation: 'Paru-paru adalah organ utama sistem pernapasan kita.',
        },
        funFact: 'Paru-paru kita menyerap sekitar 11.000 liter udara setiap hari!',
      },
      {
        id: 'pkn-5',
        name: 'Pendidikan Kewarganegaraan (PKn)',
        shortName: 'PKn',
        emoji: '🇮🇩',
        badge: 'Pemerintahan Daerah',
        subtitle: 'Lembaga pemerintahan Desa/Kecamatan/Kabupaten & norma hukum!',
        cardBg: 'bg-indigo-50/90',
        cardBorder: 'border-indigo-300',
        cardHover: 'hover:border-indigo-400 hover:bg-indigo-100/80',
        badgeBg: 'bg-indigo-200 text-indigo-900',
        btnBg: 'bg-indigo-500 hover:bg-indigo-600 text-white',
        points: [
          'Tingkatan Daerah: Kelurahan/Desa dipimpin Lurah/Kades, Kecamatan dipimpin Camat 🏛️.',
          'Kabupaten/Kota dipimpin oleh Bupati/Walikota, dan Provinsi dipimpin Gubernur.',
          'Norma Hukum: Aturan tertulis resmi negara yang harus ditaati demi ketertiban bersama ⚖️.',
        ],
        quiz: {
          question: 'Pemimpin wilayah pemerintahan di tingkat kecamatan adalah...',
          options: ['Lurah 🏠', 'Camat 🏛️', 'Gubernur 🏢'],
          answerIndex: 1,
          explanation: 'Kecamatan dipimpin oleh seorang Camat.',
        },
        funFact: 'Indonesia memiliki 38 provinsi dari barat Sabang hingga timur Merauke.',
      },
      {
        id: 'pancasila-5',
        name: 'Pendidikan Pancasila',
        shortName: 'Pancasila',
        emoji: '🦅',
        badge: 'Pengamalan 5 Sila',
        subtitle: 'Nilai luhur Pancasila dalam kehidupan sosial & toleransi sejati!',
        cardBg: 'bg-rose-50/90',
        cardBorder: 'border-rose-300',
        cardHover: 'hover:border-rose-400 hover:bg-rose-100/80',
        badgeBg: 'bg-rose-200 text-rose-900',
        btnBg: 'bg-rose-500 hover:bg-rose-600 text-white',
        points: [
          'Pancasila sebagai Dasar Negara dan Pandangan Hidup Bangsa Indonesia.',
          'Sila ke-5: Keadilan sosial, suka menabung, dan tidak bergaya hidup boros 🌾.',
          'Menghargai hak cipta dan karya teman di sekolah.',
        ],
        quiz: {
          question: 'Menghindari gaya hidup boros dan gemar menabung merupakan pengamalan Sila ke-...',
          options: ['Sila ke-2 🔗', 'Sila ke-3 🌳', 'Sila ke-5 🌾'],
          answerIndex: 2,
          explanation: 'Sila ke-5 mengajarkan hidup hemat, adil, dan menghargai kerja keras.',
        },
        funFact: 'Hari Lahir Pancasila diperingati setiap tanggal 1 Juni di seluruh Indonesia.',
      },
      {
        id: 'inggris-5',
        name: 'Bahasa Inggris',
        shortName: 'B. Inggris',
        emoji: '🌍',
        badge: 'Hobbies & Jobs',
        subtitle: 'Mendeskripsikan hobi, profesi impian, & Simple Present Tense!',
        cardBg: 'bg-sky-50/90',
        cardBorder: 'border-sky-300',
        cardHover: 'hover:border-sky-400 hover:bg-sky-100/80',
        badgeBg: 'bg-sky-200 text-sky-900',
        btnBg: 'bg-sky-500 hover:bg-sky-600 text-white',
        points: [
          'Professions: Doctor (Dokter) 🩺, Teacher (Guru) 👩‍🏫, Pilot (Pilot) ✈️, Scientist 🔬.',
          'Hobbies: "My hobby is playing football / reading books / painting" 🎨.',
          'Sentences: "He works in a hospital", "She teaches English at school".',
        ],
        quiz: {
          question: 'A person who flies an airplane is called a...',
          options: ['Driver 🚗', 'Pilot ✈️', 'Chef 🍳'],
          answerIndex: 1,
          explanation: 'A pilot flies an airplane in the sky.',
        },
        funFact: 'Bahasa Inggris memiliki lebih dari 170.000 kata aktif yang dipakai saat ini!',
      },
      {
        id: 'pai-5',
        name: 'Pendidikan Agama Islam (PAI)',
        shortName: 'PAI',
        emoji: '🌙',
        badge: 'Ulul Azmi & Ma\'un',
        subtitle: 'Kisah 5 Rasul Ulul Azmi, surat Al-Ma\'un, & amalan peduli yatim!',
        cardBg: 'bg-teal-50/90',
        cardBorder: 'border-teal-300',
        cardHover: 'hover:border-teal-400 hover:bg-teal-100/80',
        badgeBg: 'bg-teal-200 text-teal-900',
        btnBg: 'bg-teal-500 hover:bg-teal-600 text-white',
        points: [
          '5 Rasul Ulul Azmi: Nabi Nuh, Ibrahim, Musa, Isa, Muhammad SAW yang memiliki keteguhan luar biasa.',
          'Surat Al-Ma\'un: Larangan menghardik anak yatim dan enggan memberi bantuan barang berguna 🤲.',
          'Membiasakan shodaqoh jariyah sejak kecil.',
        ],
        quiz: {
          question: 'Di bawah ini yang termasuk Rasul Ulul Azmi adalah Nabi...',
          options: ['Nabi Ibrahim AS ✨', 'Nabi Yusuf AS 🌟', 'Nabi Sulaiman AS 👑'],
          answerIndex: 0,
          explanation: 'Nabi Ibrahim AS adalah salah satu dari 5 Rasul bergelar Ulul Azmi.',
        },
        funFact: 'Ulul Azmi berarti para rasul yang memiliki ketabahan dan kesabaran yang luar biasa.',
      },
      {
        id: 'arab-5',
        name: 'Bahasa Arab',
        shortName: 'Arab',
        emoji: '🕌',
        badge: 'Fi\'il & Jam',
        subtitle: 'Fi\'il (kata kerja dasar), menyatakan waktu jam, & belanja di kantin!',
        cardBg: 'bg-emerald-50/90',
        cardBorder: 'border-emerald-300',
        cardHover: 'hover:border-emerald-400 hover:bg-emerald-100/80',
        badgeBg: 'bg-emerald-200 text-emerald-900',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        points: [
          'Fi\'il (Kata Kerja): Qara-a (Membaca) 📖, Kataba (Menulis) ✍️, Jalasa (Duduk di meja).',
          'Jam Arab: As-Saa\'atus Saabi\'ah (Jam 7 tepat saat masuk sekolah) ⏰.',
          'Percakapan di kantin: Membeli makanan dengan kalimat bahasa Arab santun.',
        ],
        quiz: {
          question: 'Kata kerja bahasa Arab "Qara-a" (قَرَأَ) artinya...',
          options: ['Menulis ✍️', 'Membaca 📖', 'Tidur 💤'],
          answerIndex: 1,
          explanation: 'Qara-a artinya membaca (seperti wahyu pertama: Iqra\'!).',
        },
        funFact: 'Kata pertama yang turun dalam Al-Qur\'an adalah Iqra\' yang berarti "Bacalah!".',
      },
      {
        id: 'jawa-5',
        name: 'Bahasa Jawa',
        shortName: 'B. Jawa',
        emoji: '🎭',
        badge: 'Sandhangan Swara',
        subtitle: 'Aksara Jawa kanthi sandhangan swara & pewayangan Pandhawa 5!',
        cardBg: 'bg-orange-50/90',
        cardBorder: 'border-orange-300',
        cardHover: 'hover:border-orange-400 hover:bg-orange-100/80',
        badgeBg: 'bg-orange-200 text-orange-900',
        btnBg: 'bg-orange-500 hover:bg-orange-600 text-white',
        points: [
          'Sandhangan Swara: Wulu (swara i), Suku (swara u), Taling (swara é), Taling Tarung (swara o), Pepet (swara e).',
          'Pandhawa Lima: Puntadewa (Yudhistira), Werkudara (Bima), Janaka (Arjuna), Nakula, Sadewa 🏹.',
          'Crita Mahabarata: Kautaman mbela bebener.',
        ],
        quiz: {
          question: 'Sandhangan aksara Jawa kanggo ngowahi swara dadi "U" yaiku...',
          options: ['Wulu 💧', 'Suku 🦶', 'Taling 🎵'],
          answerIndex: 1,
          explanation: 'Suku yaiku sandhangan kanggo ngowahi swara dadi "U".',
        },
        funFact: 'Raden Werkudara kondhang nduweni kuku Pancanaka kang sekti mandraguna.',
      },
    ],
  },

  // ==========================================================
  // KELAS 6 SD (8 MATA PELAJARAN PERSIAPAN KELULUSAN & UJIAN)
  // ==========================================================
  6: {
    gradeName: 'Kelas 6 SD',
    fase: 'Fase C (Kelulusan & Ujian Sekolah)',
    subjects: [
      {
        id: 'mtk-6',
        name: 'Matematika (MTK)',
        shortName: 'MTK',
        emoji: '🔢',
        badge: 'Lingkaran & Data',
        subtitle: 'Pengolahan data rata-rata (mean), lingkaran πr², & bangun prisma/tabung!',
        cardBg: 'bg-amber-50/90',
        cardBorder: 'border-amber-300',
        cardHover: 'hover:border-amber-400 hover:bg-amber-100/80',
        badgeBg: 'bg-amber-200 text-amber-900',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold',
        points: [
          'Statistika Data: Mencari Mean (nilai rata-rata), Median (nilai tengah), Modus (paling sering muncul) 📈.',
          'Luas Lingkaran: Rumus π x r² (dengan π = 22/7 atau 3,14) ⭕.',
          'Bangun Ruang Tabung & Prisma: Menghitung volume dan luas selimut tabung 🥫.',
        ],
        quiz: {
          question: 'Nilai ujian: 70, 80, 90. Berapakah nilai rata-rata (mean)-nya?',
          options: ['75 ⭐', '80 ⭐', '85 ⭐'],
          answerIndex: 1,
          explanation: '(70 + 80 + 90) : 3 = 240 : 3 = 80.',
        },
        funFact: 'Angka Phi (π = 3,14159...) adalah rasio keliling lingkaran terhadap diameternya.',
      },
      {
        id: 'ipas-6',
        name: 'IPAS (Alam & Sosial)',
        shortName: 'IPAS',
        emoji: '🔬',
        badge: 'Tata Surya & ASEAN',
        subtitle: '8 planet tata surya, rotasi/revolusi bumi, energi terbarukan, & ASEAN!',
        cardBg: 'bg-lime-50/90',
        cardBorder: 'border-lime-300',
        cardHover: 'hover:border-lime-400 hover:bg-lime-100/80',
        badgeBg: 'bg-lime-200 text-lime-900',
        btnBg: 'bg-lime-500 hover:bg-lime-600 text-neutral-900 font-bold',
        points: [
          '8 Planet: Merkurius, Venus, Bumi, Mars, Yupiter (terbesar), Saturnus (cincin), Uranus, Neptunus 🪐.',
          'Rotasi Bumi (24 jam) bikin siang & malam; Revolusi Bumi (365 hari) bikin pergantian musim 🌍.',
          'Kerja Sama ASEAN: Indonesia pendiri ASEAN bersama Malaysia, Singapura, Thailand, Filipina.',
        ],
        quiz: {
          question: 'Planet terbesar dalam tata surya kita adalah planet...',
          options: ['Mars 🔴', 'Yupiter 🪐', 'Bumi 🌍'],
          answerIndex: 1,
          explanation: 'Yupiter adalah planet raksasa gas terbesar di tata surya.',
        },
        funFact: 'Planet Saturnus memiliki cincin indah yang terbuat dari miliaran serpihan es dan batu!',
      },
      {
        id: 'pkn-6',
        name: 'Pendidikan Kewarganegaraan (PKn)',
        shortName: 'PKn',
        emoji: '🇮🇩',
        badge: 'Bela Negara & Pemilu',
        subtitle: 'Sumpah Pemuda 1928, pemilu demokratis, & menjaga keutuhan NKRI!',
        cardBg: 'bg-indigo-50/90',
        cardBorder: 'border-indigo-300',
        cardHover: 'hover:border-indigo-400 hover:bg-indigo-100/80',
        badgeBg: 'bg-indigo-200 text-indigo-900',
        btnBg: 'bg-indigo-500 hover:bg-indigo-600 text-white',
        points: [
          'Sumpah Pemuda 28 Oktober 1928: Satu Tanah Air, Satu Bangsa, dan Satu Bahasa Indonesia 🇮🇩.',
          'Asas Pemilu Luber Jurdil: Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil 🗳️.',
          'Semangat Bela Negara: Menjaga persatuan dan berprestasi mengharumkan nama bangsa.',
        ],
        quiz: {
          question: 'Hari Sumpah Pemuda diperingati setiap tanggal...',
          options: ['17 Agustus 🇮🇩', '28 Oktober 📜', '10 November ⚔️'],
          answerIndex: 1,
          explanation: 'Kongres Pemuda II melahirkan ikrar Sumpah Pemuda pada 28 Oktober 1928.',
        },
        funFact: 'Lagu Indonesia Raya pertama kali diperdengarkan secara instrumental biola pada Kongres Pemuda 1928.',
      },
      {
        id: 'pancasila-6',
        name: 'Pendidikan Pancasila',
        shortName: 'Pancasila',
        emoji: '🦅',
        badge: 'Ideologi Bangsa',
        subtitle: 'Nilai juang Proklamasi 1945, UUD NRI 1945, & karakter pemimpin masa depan!',
        cardBg: 'bg-rose-50/90',
        cardBorder: 'border-rose-300',
        cardHover: 'hover:border-rose-400 hover:bg-rose-100/80',
        badgeBg: 'bg-rose-200 text-rose-900',
        btnBg: 'bg-rose-500 hover:bg-rose-600 text-white',
        points: [
          'Pancasila sebagai sumber dari segala sumber hukum di Indonesia ⚖️.',
          'Meneladani semangat pantang menyerah para pahlawan kemerdekaan.',
          'Menjaga toleransi antar pemeluk agama di era modern dan dunia digital 🌐.',
        ],
        quiz: {
          question: 'Teks Proklamasi Kemerdekaan Indonesia dibacakan oleh...',
          options: ['Ir. Soekarno 📜', 'Ki Hajar Dewantara 🎓', 'Jenderal Sudirman ⚔️'],
          answerIndex: 0,
          explanation: 'Ir. Soekarno didampingi Drs. Mohammad Hatta memproklamasikan kemerdekaan RI.',
        },
        funFact: 'Naskah Proklamasi diketik oleh Sayuti Melik sebelum dibacakan pada 17 Agustus 1945.',
      },
      {
        id: 'inggris-6',
        name: 'Bahasa Inggris',
        shortName: 'B. Inggris',
        emoji: '🌍',
        badge: 'Grammar & Dreams',
        subtitle: 'Past Tense dasar, membaca cerita pendek, & menceritakan cita-cita!',
        cardBg: 'bg-sky-50/90',
        cardBorder: 'border-sky-300',
        cardHover: 'hover:border-sky-400 hover:bg-sky-100/80',
        badgeBg: 'bg-sky-200 text-sky-900',
        btnBg: 'bg-sky-500 hover:bg-sky-600 text-white',
        points: [
          'Past Tense: "Yesterday I went to school", "I studied hard for the test" 📚.',
          'Dream Careers: "I want to be an engineer / software developer / doctor" 🚀.',
          'Reading Comprehension: Memahami ide pokok bacaan cerita pendek.',
        ],
        quiz: {
          question: 'What is the past tense form of the verb "go"?',
          options: ['Gone 🏃', 'Went 🚶', 'Going 🏃‍♂️'],
          answerIndex: 1,
          explanation: 'The past tense of "go" is "went" (Yesterday I went to school).',
        },
        funFact: 'Bahasa Inggris adalah jembatan utama untuk mempelajari teknologi komputer modern!',
      },
      {
        id: 'pai-6',
        name: 'Pendidikan Agama Islam (PAI)',
        shortName: 'PAI',
        emoji: '🌙',
        badge: 'Kafirun & Takdir',
        subtitle: 'Surat Al-Kafirun (toleransi), Qadha & Qadar, serta akhlak remaja muslim!',
        cardBg: 'bg-teal-50/90',
        cardBorder: 'border-teal-300',
        cardHover: 'hover:border-teal-400 hover:bg-teal-100/80',
        badgeBg: 'bg-teal-200 text-teal-900',
        btnBg: 'bg-teal-500 hover:bg-teal-600 text-white',
        points: [
          'Surat Al-Kafirun: "Lakum diinukum waliyadiin" (Untukmu agamamu, dan untukku agamaku) 🕊️.',
          'Iman kepada Qadha dan Qadar: Senantiasa berikhtiar sungguh-sungguh lalu bertawakal.',
          'Menyambut masa remaja dengan menjaga lisan, pergaulan santun, dan istiqomah beribadah.',
        ],
        quiz: {
          question: 'Surat dalam Al-Qur\'an yang mengajarkan toleransi "Lakum diinukum waliyadiin" adalah...',
          options: ['QS. Al-Ikhlas 🌙', 'QS. Al-Kafirun 🕊️', 'QS. Al-Falaq 📖'],
          answerIndex: 1,
          explanation: 'Surat Al-Kafirun ayat ke-6 menegaskan toleransi beragama.',
        },
        funFact: 'Doa dan ikhtiar yang sungguh-sungguh dapat mengubah masa depan kita menjadi gemilang.',
      },
      {
        id: 'arab-6',
        name: 'Bahasa Arab',
        shortName: 'Arab',
        emoji: '🕌',
        badge: 'Insya\' & Jam Lengkap',
        subtitle: 'Menyusun kalimat bahasa Arab lengkap & percakapan sehari-hari!',
        cardBg: 'bg-emerald-50/90',
        cardBorder: 'border-emerald-300',
        cardHover: 'hover:border-emerald-400 hover:bg-emerald-100/80',
        badgeBg: 'bg-emerald-200 text-emerald-900',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        points: [
          'Susunan Jumlah Mufidah (Kalimat Sempurna): Subjek + Kata Kerja + Objek 📝.',
          'Profesi dalam bahasa Arab: Thobiibun (Dokter), Mudarrisun (Guru), Muhandisun (Insinyur).',
          'Percakapan cita-cita di masa depan menggunakan bahasa Arab fasih.',
        ],
        quiz: {
          question: 'Apa arti kata "Mudarrisun" (مُدَرِّسٌ) dalam bahasa Arab?',
          options: ['Dokter 🩺', 'Guru / Pengajar 👨‍🏫', 'Polisi 👮'],
          answerIndex: 1,
          explanation: 'Mudarrisun artinya guru atau pengajar.',
        },
        funFact: 'Bahasa Arab adalah salah satu bahasa tertua yang kosakatanya paling kaya di dunia.',
      },
      {
        id: 'jawa-6',
        name: 'Bahasa Jawa',
        shortName: 'B. Jawa',
        emoji: '🎭',
        badge: 'Paribasan & Saloka',
        subtitle: 'Paribasan Jawa adiluhung & nulis ukara aksara Jawa jangkep!',
        cardBg: 'bg-orange-50/90',
        cardBorder: 'border-orange-300',
        cardHover: 'hover:border-orange-400 hover:bg-orange-100/80',
        badgeBg: 'bg-orange-200 text-orange-900',
        btnBg: 'bg-orange-500 hover:bg-orange-600 text-white',
        points: [
          'Paribasan: "Becik ketitik, ala ketara" (Tumindak becik lan ala mesthi bakal konangan).',
          'Paribasan: "Jer basuki mawa beya" (Samubarang gegayuhan mbutuhake pangorbanan lan usaha).',
          'Nulis ukara mawa Aksara Jawa kanthi pasangan lan sandhangan lengkap 📜.',
        ],
        quiz: {
          question: 'Paribasan "Becik ketitik, ala ketara" nduweni teges...',
          options: ['Tumindak apik lan ala bakal konangan ✨', 'Aja seneng ngapusi ❌', 'Kudu sregep sinau 📖'],
          answerIndex: 0,
          explanation: 'Bener! Becik ketitik ala ketara tegese samubarang tumindak apik utawa ala ing tembe bakal ketara.',
        },
        funFact: 'Paribasan Jawa ngemot piwulang filosofi urip kang luhur saka para leluhur.',
      },
    ],
  },
};

interface SdSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deskType?: 'guru' | 'siswa';
  sdGrade?: number;
  onStudySubject?: (subjectName: string, expEarned: number) => void;
}

export const SdSubjectsModal: React.FC<SdSubjectsModalProps> = ({
  isOpen,
  onClose,
  deskType = 'guru',
  sdGrade = 1,
  onStudySubject,
}) => {
  const sound = SoundManager.getInstance();

  // Active Grade State (bisa dipilih langsung di dalam modal atau mengikuti kelas saat masuk)
  const [currentGrade, setCurrentGrade] = useState<number>(() => {
    return sdGrade >= 1 && sdGrade <= 6 ? sdGrade : 1;
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [hasStudied, setHasStudied] = useState<boolean>(false);

  // Sync saat sdGrade prop berubah
  useEffect(() => {
    if (sdGrade >= 1 && sdGrade <= 6) {
      setCurrentGrade(sdGrade);
    }
  }, [sdGrade]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, sound]);

  // Reset state saat berganti mapel atau grade
  useEffect(() => {
    setQuizAnswer(null);
    setHasStudied(false);
  }, [selectedSubjectId, currentGrade]);

  const gradeData = useMemo(() => {
    return SD_CURRICULUM_DATA[currentGrade] || SD_CURRICULUM_DATA[1];
  }, [currentGrade]);

  const currentSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return gradeData.subjects.find((s) => s.id === selectedSubjectId) || null;
  }, [selectedSubjectId, gradeData]);

  if (!isOpen) return null;

  const handleOpenSubject = (id: string) => {
    sound.playClick();
    setSelectedSubjectId(id);
  };

  const handleBackToList = () => {
    sound.playClick();
    setSelectedSubjectId(null);
  };

  const handleSelectQuizOption = (index: number) => {
    if (quizAnswer !== null || !currentSubject) return;
    setQuizAnswer(index);

    if (index === currentSubject.quiz.answerIndex) {
      sound.playSuccess();
    } else {
      sound.playClick();
    }
  };

  const handleStudyAction = () => {
    if (!currentSubject) return;
    sound.playSuccess();
    setHasStudied(true);

    if (onStudySubject) {
      onStudySubject(`${currentSubject.name} (${gradeData.gradeName})`, 35);
    } else {
      EventBus.emit('new-chat-message', {
        id: `study_msg_${Date.now()}`,
        sender: 'KELAS SD',
        text: `✨ Kamu asyik belajar ${currentSubject.name} di ${gradeData.gradeName} (${deskType === 'guru' ? 'Meja Guru' : 'Meja Belajar'})! (+35 EXP)`,
        timestamp: Date.now(),
        isSystem: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 font-cute animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white border-2 border-neutral-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-neutral-800 relative">
        
        {/* ================================================================== */}
        {/* HEADER MODAL: Sesuai Persis dengan Modal Pemilihan Kelas           */}
        {/* ================================================================== */}
        <div className="px-5 sm:px-6 py-4 bg-amber-100 border-b-2 border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-neutral-800 shadow-xs flex items-center justify-center text-2xl shrink-0">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 tracking-wide">
                  Mata Pelajaran {gradeData.gradeName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-neutral-300 text-neutral-800 font-bold text-[11px] shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{gradeData.fase}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>Interaksi di</span>
                <span className="font-bold px-2 py-0.5 rounded-lg text-xs bg-white border border-neutral-300 text-neutral-800 shadow-2xs">
                  {deskType === 'guru' ? '🏛️ Meja Guru (Podium)' : '🪑 Meja Belajar Siswa'}
                </span>
                <span>• Sekolah Dasar (SD)</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-100 border-2 border-neutral-800 text-neutral-700 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Tutup (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================== */}
        {/* TABS TINGKATAN KELAS: Desain Bersih, Rapi & Elegan                 */}
        {/* ================================================================== */}
        <div className="px-5 sm:px-6 py-2.5 bg-neutral-50 border-b-2 border-neutral-200 flex items-center gap-2 overflow-x-auto shrink-0 school-scrollbar-amber">
          <span className="text-xs font-bold text-neutral-700 shrink-0 flex items-center gap-1">
            <span>🏫 Pilih Kelas:</span>
          </span>
          {[1, 2, 3, 4, 5, 6].map((gr) => (
            <button
              key={gr}
              onClick={() => {
                sound.playClick();
                setCurrentGrade(gr);
                setSelectedSubjectId(null);
                try { localStorage.setItem('raden_school_sd_grade', gr.toString()); } catch (e) {}
                EventBus.emit('school-grade-switched', { schoolType: 'sd', grade: gr });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                currentGrade === gr
                  ? 'bg-neutral-900 text-white border-2 border-neutral-900 shadow-xs font-black'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-2 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              Kelas {gr} SD
            </button>
          ))}
          <span className="text-[11px] font-semibold text-neutral-500 ml-auto hidden sm:inline shrink-0">
            {gradeData.subjects.length} Mapel Tersedia
          </span>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: DAFTAR MATA PELAJARAN UNTUK KELAS TERPILIH       */}
        {/* ======================================================== */}
        {!currentSubject ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 school-scrollbar-amber">
            {/* Header Greeting Bersih & Elegan */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✨</span>
                <p className="text-xs sm:text-sm text-neutral-700 font-semibold leading-relaxed">
                  Kurikulum mata pelajaran khusus <span className="text-amber-950 font-bold underline decoration-amber-400">{gradeData.gradeName}</span>. Pilih mapel untuk belajar dan latihan kuis:
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shrink-0">
                {gradeData.subjects.length} Mapel
              </span>
            </div>

            {/* Grid Kartu Mapel (3 Kolom Luas & Proporsional Sesuai Modal Kelas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {gradeData.subjects.map((sub, idx) => (
                <div
                  key={sub.id}
                  onClick={() => handleOpenSubject(sub.id)}
                  className="group bg-white rounded-2xl border-2 border-neutral-300 hover:border-amber-500 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between p-4.5 sm:p-5 relative shadow-xs cursor-pointer"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Nomor Mapel Badge + Topic Badge */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 tracking-wider">
                        MAPEL #{idx + 1}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200 truncate max-w-[130px]">
                        {sub.badge}
                      </span>
                    </div>

                    {/* Subject Header: Emoji Box + Judul Mapel */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-50 border-2 border-neutral-200 group-hover:border-neutral-400 flex items-center justify-center text-2xl shrink-0 transition-colors shadow-2xs">
                        {sub.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-black text-neutral-900 group-hover:text-neutral-950 transition-colors leading-tight">
                          {sub.name}
                        </h3>
                        <span className="text-xs font-semibold text-neutral-500">
                          {sub.shortName || sub.badge}
                        </span>
                      </div>
                    </div>

                    {/* Tagline / Subtitle Deskripsi Mapel */}
                    <p className="text-xs text-neutral-600 font-medium leading-relaxed bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-200/80">
                      {sub.subtitle}
                    </p>

                    {/* Preview Cuplikan Materi Pelajaran (2 Butir Poin) */}
                    <div className="space-y-1.5 pt-1">
                      {sub.points.slice(0, 2).map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-neutral-700 font-medium leading-snug">
                          <span className="text-amber-500 font-bold shrink-0">⭐</span>
                          <span className="line-clamp-1">{pt.replace(/^[A-Za-z0-9\s]+:\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Pill: Buka Mapel */}
                  <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Materi & Kuis</span>
                    </span>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-600"
                    >
                      <span>Buka Mapel</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: TAMPILAN BELAJAR MAPEL TERPILIH                  */
          /* ======================================================== */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Back Action Bar */}
            <div className="px-5 sm:px-6 py-3 bg-neutral-50 border-b-2 border-neutral-200 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border-2 border-neutral-300 text-neutral-800 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Kembali ke Daftar Mapel {gradeData.gradeName}</span>
              </button>

              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                {currentSubject.badge}
              </span>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 school-scrollbar-amber">
              
              {/* Header Box Mapel */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-neutral-300 bg-white flex items-center gap-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 border-2 border-neutral-200 shadow-2xs flex items-center justify-center text-3xl shrink-0">
                  {currentSubject.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-950">{gradeData.gradeName}</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-xs text-neutral-600 font-medium">{gradeData.fase}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 mt-0.5">
                    {currentSubject.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                    {currentSubject.subtitle}
                  </p>
                </div>
              </div>

              {/* Rangkuman 3 Poin Inti Yang Gampang & Seru */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-neutral-300 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-neutral-900 font-black text-sm">
                  <span>📖</span>
                  <span>Materi Pelajaran di {gradeData.gradeName}:</span>
                </div>
                <div className="space-y-2">
                  {currentSubject.points.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed"
                    >
                      <span className="text-base shrink-0">⭐</span>
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tebak-Tebakan / Kuis Ceria 1 Soal */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-neutral-300 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-neutral-900 font-black text-sm">
                    <span>🎯</span>
                    <span>Kuis Cepat Ceria ({gradeData.gradeName}):</span>
                  </div>
                  {quizAnswer !== null && (
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        quizAnswer === currentSubject.quiz.answerIndex
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {quizAnswer === currentSubject.quiz.answerIndex ? '🎉 Yaaay Benar!' : '💡 Coba Lagi Yuk!'}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-neutral-900 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {currentSubject.quiz.question}
                </p>

                {/* 3 Tombol Opsi Jawaban */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {currentSubject.quiz.options.map((opt, optIdx) => {
                    let optStyle = 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800';
                    if (quizAnswer !== null) {
                      if (optIdx === currentSubject.quiz.answerIndex) {
                        optStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black scale-[1.02] shadow-xs';
                      } else if (optIdx === quizAnswer) {
                        optStyle = 'bg-rose-100 border-rose-400 text-rose-900 line-through opacity-80';
                      } else {
                        optStyle = 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectQuizOption(optIdx)}
                        disabled={quizAnswer !== null}
                        className={`p-3 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all text-center cursor-pointer shadow-2xs ${optStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Penjelasan jika sudah dijawab */}
                {quizAnswer !== null && (
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 font-medium flex items-center gap-2 animate-in fade-in">
                    <span className="text-base">💡</span>
                    <span>{currentSubject.quiz.explanation}</span>
                  </div>
                )}
              </div>

              {/* Fakta Seru */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border-2 border-neutral-200 flex items-center gap-3 text-xs text-neutral-800 font-medium shadow-2xs">
                <span className="text-2xl shrink-0">🎈</span>
                <div>
                  <span className="font-bold text-neutral-900 block">Tahukah Kamu?</span>
                  <span>{currentSubject.funFact}</span>
                </div>
              </div>
            </div>

            {/* Bottom Study Action Button */}
            <div className="p-4 sm:p-5 bg-white border-t-2 border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-neutral-600 flex items-center gap-1.5 font-medium">
                <span>📍 Sedang duduk belajar di</span>
                <span className="font-bold text-neutral-900">
                  {deskType === 'guru' ? 'Meja Guru (Podium)' : 'Meja Belajar Siswa'} ({gradeData.gradeName})
                </span>
              </div>

              <button
                onClick={handleStudyAction}
                disabled={hasStudied}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  hasStudied
                    ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-800'
                    : 'bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-600 hover:scale-105 active:scale-95'
                }`}
              >
                {hasStudied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sudah Dipelajari Hari Ini! (+35 EXP)</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Selesai Belajar di Meja (+35 EXP)</span>
                    <span>🚀</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Kecil */}
        <div className="px-5 sm:px-6 py-3 border-t-2 border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-700 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Kurikulum Resmi {gradeData.gradeName} RadenWorld</span>
          </div>
          <span className="text-neutral-500 text-[11px] hidden sm:inline">
            Tekan ESC untuk menutup
          </span>
        </div>
      </div>
    </div>
  );
};
