/**
 * ============================================================================
 * FILE: resources/js/game/data/quizzes/ExtraUniqueQuizBank.ts
 * ============================================================================
 * Bank Soal Tambahan Unik (Anti-Duplikat) untuk SD (Kelas 1-6), SMP (Kelas 7-9),
 * dan SMA (Kelas 10-12) agar setiap mata pelajaran memiliki >= 30 soal unik
 * dan pemain tidak pernah mendapatkan soal yang berulang-ulang.
 * ============================================================================
 */

import type { ISchoolQuizQuestion } from '../SchoolQuizBank';

function makeNumDistractors(ans: number, step: number = 1, unit: string = ''): [string, string, string] {
  const s = new Set<string>();
  const offsets = [step, -step, step * 2, -step * 2, step * 3, 5, -3, 7];
  for (const off of offsets) {
    const val = ans + off;
    if (val >= 0 && val !== ans) {
      s.add(`${val}${unit}`);
      if (s.size === 3) break;
    }
  }
  let fallback = ans + step + 1;
  while (s.size < 3) {
    if (fallback !== ans) s.add(`${fallback}${unit}`);
    fallback++;
  }
  const arr = Array.from(s);
  return [arr[0], arr[1], arr[2]];
}

function buildFactQuestions(
  prefix: string,
  subject: string,
  emoji: string,
  items: Array<[string, string, [string, string, string], string]>
): ISchoolQuizQuestion[] {
  return items.map(([question, correctAnswer, wrongAnswers, explanation], idx) => ({
    id: `${prefix}-${idx + 1}`,
    subject,
    emoji,
    question,
    correctAnswer,
    wrongAnswers,
    explanation,
  }));
}

// ============================================================================
// KURASI FAKTA UNIK NUSANTARA & SAINS (NON-ARITMATIKA, 100% BEBAS DUPLIKAT)
// ============================================================================
const SD_BAHASA_FACTS: Array<[string, string, [string, string, string], string]> = [
  ['Lawan kata (antonim) dari kata "Tinggi" adalah...', 'Rendah', ['Besar', 'Panjang', 'Jauh'], 'Antonim dari tinggi adalah rendah.'],
  ['Persamaan kata (sinonim) dari kata "Pintar" adalah...', 'Pandai', ['Malas', 'Lambat', 'Sedih'], 'Sinonim pintar adalah pandai atau cerdas.'],
  ['Tanda baca yang digunakan di akhir kalimat tanya adalah...', 'Tanda tanya (?)', ['Tanda titik (.)', 'Tanda seru (!)', 'Tanda koma (,)'], 'Kalimat tanya diakhiri tanda tanya (?).'],
  ['Huruf kapital wajib digunakan pada huruf pertama nama...', 'Kota dan orang', ['Benda mati', 'Kata sambung', 'Hewan peliharaan'], 'Nama orang dan nama geografi/kota diawali huruf kapital.'],
  ['Lawan kata (antonim) dari kata "Rajin" adalah...', 'Malas', ['Tekun', 'Giat', 'Cepat'], 'Lawan kata rajin adalah malas.'],
  ['Cerita rakyat "Malin Kundang" berasal dari provinsi...', 'Sumatera Barat', ['Jawa Barat', 'Bali', 'Kalimantan Timur'], 'Malin Kundang adalah legenda terkenal dari Sumatera Barat.'],
  ['Tokoh utama dalam cerita binatang (fabel) biasanya berupa...', 'Hewan yang berperilaku seperti manusia', ['Raksasa kuno', 'Robot masa depan', 'Pahlawan sejarah'], 'Fabel menampilkan tokoh hewan yang memiliki watak seperti manusia.'],
  ['Kalimat perintah biasanya diakhiri dengan tanda baca...', 'Tanda seru (!)', ['Tanda tanya (?)', 'Titik dua (:)', 'Garis miring (/)'], 'Kalimat perintah atau seruan memakai tanda seru (!).'],
  ['Kata dasar dari kata berimbuhan "Menyapu" adalah...', 'Sapu', ['Menyapukan', 'Penyapu', 'Nyapu'], 'Imbuhan meN- luluh pada huruf s sehingga sapu menjadi menyapu.'],
  ['Puisi lama Indonesia yang tiap baitnya terdiri atas 4 baris bersajak a-b-a-b disebut...', 'Pantun', ['Cerpen', 'Novel', 'Drama'], 'Pantun memiliki 4 baris (2 sampiran dan 2 isi) bersajak a-b-a-b.'],
  ['Baris pertama dan kedua pada sebuah pantun disebut bagian...', 'Sampiran', ['Isi', 'Amanat', 'Judul'], 'Baris 1-2 pantun adalah sampiran, sedangkan baris 3-4 adalah isi.'],
  ['Orang yang pekerjaannya mengemudikan pesawat terbang disebut...', 'Pilot', ['Masinis', 'Nakhoda', 'Kusir'], 'Pengemudi pesawat terbang disebut pilot.'],
  ['Orang yang pekerjaannya mengemudikan kereta api disebut...', 'Masinis', ['Nakhoda', 'Pilot', 'Sopir'], 'Masinis adalah pengemudi kereta api.'],
  ['Orang yang pekerjaannya memimpin kapal laut disebut...', 'Nakhoda', ['Masinis', 'Pilot', 'Pramugari'], 'Nakhoda memimpin pelayaran kapal di laut.'],
  ['Sinonim dari kata "Bahagia" adalah...', 'Gembira', ['Kecewa', 'Gelisah', 'Takut'], 'Bahagia bersinonim dengan gembira atau senang.'],
  ['Antonim dari kata "Gelap" adalah...', 'Terang', ['Hitam', 'Sempit', 'Dingin'], 'Lawan kata gelap adalah terang.'],
  ['Ide utama yang menjadi inti pembahasan dalam sebuah paragraf disebut...', 'Gagasan pokok', ['Kalimat tanya', 'Daftar pustaka', 'Kata pengantar'], 'Gagasan pokok adalah ide utama sebuah paragraf.'],
  ['Pesan moral yang ingin disampaikan pengarang dalam cerita disebut...', 'Amanat', ['Latar tempat', 'Alur mundur', 'Penokohan'], 'Amanat adalah pesan kebaikan dari sebuah cerita.'],
  ['Keterangan mengenai waktu, ruang, dan suasana terjadinya peristiwa dalam cerita disebut...', 'Latar (Setting)', ['Tema', 'Amanat', 'Sinopsis'], 'Latar mencakup latar tempat, waktu, dan suasana.'],
  ['Percakapan antara dua tokoh atau lebih dalam teks drama disebut...', 'Dialog', ['Monolog', 'Prolog', 'Epilog'], 'Dialog adalah percakapan antartokoh.'],
  ['Kata tanya "Mengapa" digunakan untuk menanyakan...', 'Alasan atau sebab terjadinya sesuatu', ['Jumlah benda', 'Waktu kejadian', 'Nama tempat'], 'Kata tanya mengapa menanyakan sebab/alasan.'],
  ['Kata tanya "Di mana" digunakan untuk menanyakan...', 'Tempat berlangsungnya peristiwa', ['Cara membuat sesuatu', 'Harga barang', 'Alasan kejadian'], 'Di mana menanyakan lokasi atau tempat.'],
  ['Penulisan kata depan "di" yang benar untuk menunjukkan tempat adalah...', 'di sekolah', ['disekolah', 'di-sekolah', 'diSekolah'], 'Kata depan penunjuk tempat ditulis terpisah: di sekolah.'],
  ['Ungkapan "Kutu buku" memiliki arti kiasan yaitu orang yang...', 'Gemar membaca buku', ['Merusak halaman buku', 'Menjual buku bekas', 'Takut melihat buku'], 'Kutu buku berarti orang yang suka membaca buku.'],
  ['Ungkapan "Rendah hati" memiliki arti sifat yang...', 'Tidak sombong', ['Mudah menyerah', 'Penakut', 'Suka marah'], 'Rendah hati artinya ramah dan tidak angkuh/sombong.'],
];

const SD_PANCASILA_FACTS: Array<[string, string, [string, string, string], string]> = [
  ['Lambang sila pertama Pancasila "Ketuhanan Yang Maha Esa" adalah...', 'Bintang emas', ['Rantai emas', 'Pohon beringin', 'Kepala banteng'], 'Bintang emas melambangkan sila pertama Pancasila.'],
  ['Lambang sila kedua Pancasila "Kemanusiaan yang Adil dan Beradab" adalah...', 'Rantai emas', ['Padi dan kapas', 'Bintang emas', 'Pohon beringin'], 'Rantai emas bermata bulat dan persegi melambangkan sila kedua.'],
  ['Lambang sila ketiga Pancasila "Persatuan Indonesia" adalah...', 'Pohon beringin', ['Kepala banteng', 'Rantai emas', 'Padi dan kapas'], 'Pohon beringin melambangkan naungan persatuan Indonesia.'],
  ['Lambang sila keempat Pancasila adalah...', 'Kepala banteng', ['Pohon beringin', 'Bintang emas', 'Rantai emas'], 'Kepala banteng melambangkan musyawarah sila keempat.'],
  ['Lambang sila kelima Pancasila "Keadilan Sosial bagi Seluruh Rakyat Indonesia" adalah...', 'Padi dan kapas', ['Bintang emas', 'Kepala banteng', 'Pohon beringin'], 'Padi dan kapas melambangkan pangan dan sandang yang adil.'],
  ['Semboyan bangsa Indonesia pada pita burung Garuda adalah...', 'Bhinneka Tunggal Ika', ['Tut Wuri Handayani', 'Habis Gelap Terbitlah Terang', 'Bersatu Kita Teguh'], 'Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu jua.'],
  ['Lagu kebangsaan Republik Indonesia "Indonesia Raya" diciptakan oleh...', 'W.R. Supratman', ['Ismail Marzuki', 'Ibu Sud', 'C. Simanjuntak'], 'Wage Rudolf Supratman menciptakan lagu Indonesia Raya.'],
  ['Bendera pusaka negara Republik Indonesia berwarna...', 'Merah dan Putih', ['Biru dan Putih', 'Merah dan Kuning', 'Hijau dan Putih'], 'Merah berarti berani dan Putih berarti suci.'],
  ['Jumlah bulu pada masing-masing sayap Burung Garuda Pancasila adalah...', '17 helai', ['8 helai', '19 helai', '45 helai'], '17 sayap, 8 ekor, 19 pangkal ekor, 45 leher melambangkan 17-8-1945.'],
  ['Kegiatan bekerja bersama-sama warga membersihkan lingkungan desa disebut...', 'Gotong royong', ['Debat terbuka', 'Perdagangan bebas', 'Kompetisi individu'], 'Gotong royong mencerminkan persatuan dan kekeluargaan.'],
  ['Memilih ketua kelas melalui kesepakatan bersama merupakan pengamalan Pancasila sila ke-...', 'Empat', ['Satu', 'Dua', 'Lima'], 'Musyawarah mufakat merupakan pengamalan sila keempat.'],
  ['Sesuatu yang harus kita lakukan dengan penuh tanggung jawab sebelum menuntut hak disebut...', 'Kewajiban', ['Hadiah', 'Keinginan', 'Hiburan'], 'Kewajiban dan hak harus dilaksanakan secara seimbang.'],
  ['Menghormati teman yang sedang beribadah sesuai agamanya merupakan pengamalan sila ke-...', 'Satu', ['Tiga', 'Empat', 'Lima'], 'Toleransi beragama mencerminkan sila pertama Pancasila.'],
  ['Hari Kemerdekaan Republik Indonesia diperingati setiap tanggal...', '17 Agustus', ['1 Juni', '28 Oktober', '10 November'], 'Proklamasi Kemerdekaan RI dikumandangkan 17 Agustus 1945.'],
  ['Hari Lahir Pancasila diperingati setiap tanggal...', '1 Juni', ['2 Mei', '20 Mei', '17 Agustus'], '1 Juni diperingati sebagai Hari Lahir Pancasila.'],
  ['Rumah adat Gadang yang beratap menyerupai tanduk kerbau berasal dari...', 'Sumatera Barat', ['Jawa Tengah', 'Papua', 'Sulawesi Selatan'], 'Rumah Gadang adalah rumah adat suku Minangkabau, Sumatera Barat.'],
  ['Rumah adat Joglo merupakan warisan budaya masyarakat dari pulau...', 'Jawa', ['Sumatera', 'Kalimantan', 'Maluku'], 'Joglo dikenal luas di Jawa Tengah, DI Yogyakarta, dan Jawa Timur.'],
  ['Rumah adat Honai yang berbentuk bundar beratap jerami berasal dari...', 'Papua', ['Aceh', 'Bali', 'Bengkulu'], 'Honai adalah rumah tradisional masyarakat pegunungan Papua.'],
  ['Alat musik tradisional Angklung yang terbuat dari bambu berasal dari daerah...', 'Jawa Barat', ['Nusa Tenggara Timur', 'Sulawesi Utara', 'Riau'], 'Angklung berasal dari tanah Sunda, Jawa Barat.'],
  ['Alat musik petik Sasando yang terbuat dari daun lontar berasal dari provinsi...', 'Nusa Tenggara Timur', ['Bali', 'Maluku', 'Lampung'], 'Sasando berasal dari Pulau Rote, Nusa Tenggara Timur.'],
  ['Sikap terbaik saat pendapat kita tidak terpilih dalam musyawarah kelas adalah...', 'Menerima hasil keputusan dengan lapang dada', ['Keluar dari ruangan dengan marah', ['Menolak bekerja sama'][0], 'Memaksakan kehendak sendiri'], 'Keputusan musyawarah harus diterima dan dijalankan bersama.'],
  ['Hari Pendidikan Nasional diperingati setiap tanggal 2 Mei untuk mengenang jasa...', 'Ki Hadjar Dewantara', ['R.A. Kartini', 'Jenderal Sudirman', 'Bung Tomo'], 'Ki Hadjar Dewantara adalah Bapak Pendidikan Nasional Indonesia.'],
  ['Sumpah Pemuda yang menyatukan pemuda Nusantara diikrarkan pada tanggal...', '28 Oktober 1928', ['17 Agustus 1945', '20 Mei 1908', '10 November 1945'], 'Kongres Pemuda II menghasilkan Sumpah Pemuda pada 28 Oktober 1928.'],
  ['Sikap hemat dan tidak boros uang jajan sesuai dengan pengamalan Pancasila sila ke-...', 'Lima', ['Satu', 'Dua', 'Tiga'], 'Hidup hemat dan tidak bergaya hidup mewah sesuai sila kelima.'],
  ['Bahasa persatuan yang digunakan antarsuku bangsa di seluruh Indonesia adalah...', 'Bahasa Indonesia', ['Bahasa Daerah', 'Bahasa Asing', 'Bahasa Isyarat'], 'Bahasa Indonesia menjadi bahasa persatuan sesuai ikrar Sumpah Pemuda.'],
];

const SD_IPAS_FACTS: Array<[string, string, [string, string, string], string]> = [
  ['Proses tumbuhan hijau memasak makanannya sendiri dengan bantuan cahaya matahari disebut...', 'Fotosintesis', ['Metamorfosis', 'Evaporasi', 'Adaptasi'], 'Fotosintesis mengubah air dan karbon dioksida menjadi glukosa dan oksigen.'],
  ['Zat hijau daun pada tumbuhan yang menyerap cahaya matahari disebut...', 'Klorofil', ['Stomata', 'Kambium', 'Nektar'], 'Klorofil memberi warna hijau pada daun dan menangkap energi cahaya.'],
  ['Perubahan wujud benda cair menjadi gas ketika dipanaskan disebut...', 'Menguap', ['Membeku', 'Mencair', 'Menyublim'], 'Air yang mendidih berubah menjadi uap air (menguap).'],
  ['Perubahan wujud benda padat menjadi cair seperti es batu di ruang terbuka disebut...', 'Mencair', ['Mengembun', 'Membeku', 'Mengkristal'], 'Es batu (padat) berubah menjadi air (cair) disebut mencair.'],
  ['Hewan yang memakan tumbuhan saja seperti sapi, kambing, dan kelinci disebut...', 'Herbivora', ['Karnivora', 'Omnivora', 'Insektivora'], 'Herbivora adalah hewan pemakan tumbuhan.'],
  ['Hewan pemakan daging seperti harimau, singa, dan elang dikelompokkan sebagai...', 'Karnivora', ['Herbivora', 'Omnivora', 'Frugivora'], 'Karnivora adalah hewan pemakan daging/hewan lain.'],
  ['Urutan metamorfosis sempurna pada kupu-kupu yang benar adalah...', 'Telur - Ulat - Kepompong - Kupu-kupu', ['Telur - Kepompong - Ulat - Kupu-kupu', 'Ulat - Telur - Kupu-kupu - Kepompong', 'Telur - Nimfa - Kupu-kupu'], 'Kupu-kupu mengalami metamorfosis sempurna melalui fase kepompong (pupa).'],
  ['Planet terbesar di dalam sistem Tata Surya kita adalah...', 'Jupiter', ['Mars', 'Bumi', 'Merkurius'], 'Jupiter merupakan planet raksasa gas terbesar di Tata Surya.'],
  ['Planet yang letaknya paling dekat dengan Matahari adalah...', 'Merkurius', ['Venus', ['Bumi'][0], 'Saturnus'], 'Merkurius adalah planet terdekat dari Matahari.'],
  ['Planet yang terkenal memiliki cincin indah dari bongkahan es dan debu adalah...', 'Saturnus', ['Mars', 'Venus', 'Merkurius'], 'Saturnus dikelilingi cincin spektakuler yang mudah dikenali.'],
  ['Alat pernapasan utama pada ikan untuk menyaring oksigen di dalam air adalah...', 'Insang', ['Paru-paru', 'Trakea', 'Kulit kering'], 'Ikan bernapas menggunakan insang.'],
  ['Paus dan lumba-lumba hidup di laut namun bernapas menggunakan...', 'Paru-paru', ['Insang', 'Trakea', 'Gelembung renang'], 'Paus dan lumba-lumba adalah mamalia laut yang bernapas dengan paru-paru.'],
  ['Gaya yang menyebabkan buah kelapa jatuh dari pohon menuju permukaan tanah adalah...', 'Gaya gravitasi bumi', ['Gaya magnet', 'Gaya pegas', 'Gaya listrik statis'], 'Gravitasi bumi menarik benda bermassa ke arah pusat bumi.'],
  ['Bagian tumbuhan yang berfungsi menyerap air dan mineral dari dalam tanah adalah...', 'Akar', ['Bunga', 'Buah', 'Pucuk daun'], 'Akar menyerap air serta zat hara sekaligus memperkokoh tumbuhan.'],
  ['Sumber energi panas dan cahaya terbesar bagi kehidupan di Bumi adalah...', 'Matahari', ['Bulan purnama', 'Api unggun', 'Baterai'], 'Matahari adalah bintang pusat Tata Surya penghasil energi utama Bumi.'],
  ['Ibukota negara Republik Indonesia yang menjadi pusat pemerintahan saat proklamasi adalah...', 'Jakarta', ['Surabaya', 'Medan', 'Makassar'], 'Proklamasi dibacakan di Jalan Pegangsaan Timur No. 56, Jakarta.'],
  ['Indonesia diapit oleh dua benua besar, yaitu Benua Asia dan Benua...', 'Australia', ['Eropa', 'Amerika', 'Afrika'], 'Secara geografis Indonesia terletak di antara Benua Asia dan Australia.'],
  ['Indonesia terletak di antara dua samudra luas, yaitu Samudra Hindia dan Samudra...', 'Pasifik', ['Atlantik', 'Arktik', 'Antartika'], 'Kepulauan Indonesia berada di persilangan Samudra Hindia dan Pasifik.'],
  ['Hewan langka Komodo secara alami memiliki habitat asli di provinsi...', 'Nusa Tenggara Timur', ['Kalimantan Barat', 'Sumatera Utara', 'Jawa Timur'], 'Taman Nasional Komodo terletak di Nusa Tenggara Timur.'],
  ['Benda yang dapat ditarik dengan kuat oleh magnet contohnya adalah...', 'Paku besi dan peniti baja', ['Karet penghapus', 'Ranting kayu kering', 'Gelas plastik'], 'Besi, nikel, dan kobalt termasuk benda feromagnetik.'],
  ['Bunyi tidak dapat merambat di ruang...', 'Hampa udara', ['Zat padat', 'Air laut', 'Udara terbuka'], 'Bunyi adalah gelombang mekanik sehingga butuh medium rambat.'],
  ['Organ tubuh manusia yang berfungsi memompa darah ke seluruh tubuh adalah...', 'Jantung', ['Lambung', 'Ginjal', 'Hati'], 'Jantung memompa darah kaya oksigen dan nutrisi ke seluruh jaringan tubuh.'],
  ['Vitamin yang sangat baik untuk menjaga kesehatan mata dan banyak terdapat pada wortel adalah...', 'Vitamin A', ['Vitamin C', 'Vitamin D', 'Vitamin K'], 'Wortel kaya beta-karoten yang diubah tubuh menjadi Vitamin A.'],
  ['Peristiwa berputarnya Bumi pada porosnya yang menyebabkan terjadinya siang dan malam disebut...', 'Rotasi Bumi', ['Revolusi Bumi', 'Gerhana Bulan', 'Pasang surut'], 'Rotasi Bumi memakan waktu sekitar 24 jam (sehari semalam).'],
  ['Sumber daya alam yang dapat diperbarui karena tersedia terus-menerus di alam adalah...', 'Cahaya matahari, angin, dan air', ['Minyak bumi dan batu bara', 'Gas alam dan emas', 'Bijih timah dan tembaga'], 'Energi surya, bayu (angin), dan air termasuk energi terbarukan.'],
];

const SMP_SCIENCE_SOCIAL_FACTS: Record<string, Array<[string, string, [string, string, string], string]>> = {
  IPA: [
    ['Satuan Internasional (SI) untuk besaran kuat arus listrik adalah...', 'Ampere', ['Volt', 'Ohm', 'Watt'], 'Kuat arus listrik memiliki satuan SI Ampere (A).'],
    ['Satuan Internasional (SI) untuk besaran suhu termodinamika adalah...', 'Kelvin', ['Celsius', 'Fahrenheit', 'Reamur'], 'Kelvin (K) adalah satuan baku suhu dalam sistem SI.'],
    ['Organel sel yang berfungsi sebagai tempat respirasi seluler penghasil energi (ATP) disebut...', 'Mitokondria', ['Ribosom', 'Lisosom', 'Badan Golgi'], 'Mitokondria dijuluki the powerhouse of the cell.'],
    ['Bagian sel tumbuhan yang tidak dimiliki oleh sel hewan adalah...', 'Dinding sel dan kloroplas', ['Membran sel dan inti sel', 'Mitokondria dan ribosom', 'Sitoplasma dan vakuola kecil'], 'Sel tumbuhan memiliki dinding sel selulosa dan kloroplas.'],
    ['Hukum I Newton dikenal juga sebagai hukum...', 'Kelembaman (Inersia)', ['Aksi-Reaksi', 'Gravitasi Universal', 'Kekekalan Energi'], 'Benda cenderung mempertahankan keadaan diam atau gerak lurus beraturannya.'],
    ['Enzim amilase (ptialin) di dalam rongga mulut berfungsi mengubah amilum menjadi...', 'Maltosa / gula sederhana', ['Asam amino', 'Asam lemak', 'Pepton'], 'Ptialin memecah karbohidrat kompleks (amilum) menjadi gula sederhana.'],
    ['Pembuluh darah yang membawa darah kaya oksigen keluar dari jantung ke seluruh tubuh disebut...', 'Arteri (Nadi)', ['Vena (Balik)', 'Kapiler limfa', 'Vena porta'], 'Arteri mengalirkan darah keluar dari bilik jantung.'],
    ['Gelombang bunyi termasuk gelombang mekanik yang arah getarnya sejajar arah rambat, yaitu gelombang...', 'Longitudinal', ['Transversal', 'Elektromagnetik', 'Stasioner cahaya'], 'Bunyi merambat melalui rapatan dan renggangan (longitudinal).'],
    ['Bapak Genetika dunia yang menemukan hukum pewarisan sifat lewat persilangan kacang ercis adalah...', 'Gregor Johann Mendel', ['Charles Darwin', 'Louis Pasteur', 'Robert Hooke'], 'Gregor Mendel merumuskan Hukum Segregasi dan Asortasi Bebas.'],
    ['Larutan asam akan mengubah warna kertas lakmus biru menjadi berwarna...', 'Merah', ['Tetap biru', 'Hijau', 'Kuning'], 'Asam memerahkan lakmus biru, sedangkan basa membirukan lakmus merah.'],
    ['Lambang unsur kimia untuk Besi dan Emas secara berturut-turut adalah...', 'Fe dan Au', ['Be dan Em', 'Fe dan Ag', 'Cu dan Au'], 'Ferrum (Fe) adalah besi dan Aurum (Au) adalah emas.'],
    ['Perpindahan kalor melalui zat padat tanpa disertai perpindahan partikel zatnya disebut...', 'Konduksi', ['Konveksi', 'Radiasi', 'Evaporasi'], 'Konduksi terjadi misalnya saat ujung sendok logam ikut panas.'],
    ['Alat optik pada mata manusia yang mengatur banyak sedikitnya cahaya yang masuk adalah...', 'Iris dan Pupil', ['Retina', 'Saraf optik', 'Bintik buta'], 'Iris mengatur ukuran pupil sesuai intensitas cahaya.'],
    ['Lapisan atmosfer Bumi yang berfungsi menyerap radiasi sinar ultraviolet berbahaya dari Matahari adalah...', 'Lapisan Ozon di Stratosfer', ['Troposfer bawah', 'Eksosfer luar', 'Inti Bumi'], 'Ozon (O3) di stratosfer melindungi makhluk hidup dari sinar UV.'],
    ['Hubungan timbal balik yang saling menguntungkan antara lebah dan bunga disebut simbiosis...', 'Mutualisme', ['Parasitisme', 'Komensalisme', 'Amensalisme'], 'Lebah mendapat nektar dan bunga terbantu penyerbukannya.'],
    ['Jika hambatan listrik R = 6 Ohm dialiri arus I = 2 Ampere, maka tegangan V adalah...', '12 Volt', ['3 Volt', '8 Volt', '4 Volt'], 'Berdasarkan Hukum Ohm: V = I × R = 2 × 6 = 12 Volt.'],
    ['Benda bermassa 4 kg bergerak dengan percepatan 3 m/s². Gaya total yang bekerja adalah...', '12 Newton', ['7 Newton', '1,33 Newton', '24 Newton'], 'Hukum II Newton: F = m × a = 4 × 3 = 12 N.'],
    ['Frekuensi bunyi yang dapat didengar telinga manusia normal (audiosonik) berada pada rentang...', '20 Hz sampai 20.000 Hz', ['Kurang dari 20 Hz', 'Lebih dari 20.000 Hz', '1 Hz sampai 10 Hz'], 'Audiosonik berkisar 20 Hz - 20 kHz.'],
  ],
  IPS: [
    ['Secara astronomis, wilayah Indonesia terletak pada koordinat...', '6° LU - 11° LS dan 95° BT - 141° BT', ['6° LS - 11° LU dan 95° BB - 141° BB', '0° LU - 23,5° LS dan 100° BT - 150° BT', '10° LU - 10° LS dan 90° BT - 120° BT'], 'Letak astronomis ini membuat Indonesia beriklim tropis dan memiliki 3 zona waktu.'],
    ['Organisasi kerja sama negara-negara kawasan Asia Tenggara (ASEAN) didirikan pada 8 Agustus 1967 di kota...', 'Bangkok, Thailand', ['Jakarta, Indonesia', 'Kuala Lumpur, Malaysia', 'Manila, Filipina'], 'Deklarasi Bangkok ditandatangani oleh 5 negara pendiri ASEAN.'],
    ['Wakil Indonesia yang ikut menandatangani Deklarasi Bangkok pendirian ASEAN adalah...', 'Adam Malik', ['Moh. Hatta', 'Soebandrio', 'Ali Alatas'], 'Menteri Luar Negeri Adam Malik mewakili Indonesia pada Deklarasi Bangkok.'],
    ['Kegiatan menyalurkan barang dari produsen hingga sampai ke tangan konsumen disebut...', 'Distribusi', ['Produksi', 'Konsumsi', 'Investasi'], 'Tiga kegiatan ekonomi pokok adalah produksi, distribusi, dan konsumsi.'],
    ['Hukum permintaan menyatakan bahwa apabila harga suatu barang naik (ceteris paribus), maka jumlah barang yang diminta akan...', 'Turun / berkurang', ['Naik tajam', 'Tidak berubah', 'Menjadi tak terhingga'], 'Harga dan jumlah permintaan berbanding terbalik sesuai hukum permintaan.'],
    ['Kerajaan Hindu tertua di Nusantara yang terletak di tepi Sungai Mahakam, Kalimantan Timur adalah...', 'Kerajaan Kutai', ['Kerajaan Tarumanegara', 'Kerajaan Majapahit', 'Kerajaan Sriwijaya'], 'Prasasti Yupa membuktikan keberadaan Kerajaan Kutai pada abad ke-4 M.'],
    ['Kerajaan maritim bercorak Buddha terbesar di Sumatera yang menjadi pusat pelayaran Selat Malaka adalah...', 'Kerajaan Sriwijaya', ['Kerajaan Singasari', 'Kerajaan Mataram Kuno', 'Kerajaan Kediri'], 'Sriwijaya berpusat di Palembang dan menguasai jalur perdagangan maritim.'],
    ['Perpindahan penduduk dari desa menuju ke kota untuk mencari pekerjaan disebut...', 'Urbanisasi', ['Transmigrasi', 'Imigrasi', 'Emigrasi'], 'Urbanisasi adalah perpindahan penduduk dari pedesaan ke perkotaan.'],
    ['Garis khayal pada peta yang membagi Bumi menjadi belahan Utara dan Selatan sama besar (0°) disebut...', 'Garis Khatulistiwa (Ekuator)', ['Garis Bujur Utama', 'Garis Balik Utara', 'Garis Tanggal Internasional'], 'Kota Pontianak di Indonesia dilalui langsung oleh Garis Khatulistiwa.'],
    ['Organisasi pergerakan nasional modern pertama di Indonesia yang berdiri pada 20 Mei 1908 adalah...', 'Budi Utomo', ['Sarekat Islam', 'Indische Partij', 'Perhimpunan Indonesia'], 'Berdirinya Budi Utomo diperingati sebagai Hari Kebangkitan Nasional.'],
    ['Naskah teks Proklamasi Kemerdekaan Indonesia diketik oleh...', 'Sayuti Melik', ['Sukarni', 'Ahmad Soebardjo', 'Latief Hendraningrat'], 'Sayuti Melik mengetik naskah proklamasi yang dirumuskan Soekarno, Hatta, dan Ahmad Soebardjo.'],
    ['Peta kecil tambahan yang disisipkan pada peta utama untuk memperjelas lokasi daerah disebut...', 'Inset peta', ['Legenda peta', 'Skala peta', 'Orientasi arah'], 'Inset menunjukkan posisi wilayah peta utama terhadap wilayah yang lebih luas.'],
    ['Angin muson yang bertiup dari Benua Asia menuju Australia melewati samudra luas menyebabkan Indonesia mengalami musim...', 'Penghujan', ['Kemarau panjang', 'Salju dingin', 'Gugur daun'], 'Angin Muson Barat membawa banyak uap air sehingga turun hujan di Indonesia.'],
    ['Badan Usaha yang seluruh atau sebagian besar modalnya dimiliki oleh negara disebut...', 'BUMN', ['BUMS', 'Koperasi Sekolah', 'Firma Swasta'], 'Badan Usaha Milik Negara (BUMN) mengelola sektor strategis untuk kemakmuran rakyat.'],
    ['Bapak Koperasi Indonesia yang memelopori ekonomi kerakyatan berasaskan kekeluargaan adalah...', 'Drs. Mohammad Hatta', ['Ir. Soekarno', 'Sutan Sjahrir', 'Ki Hadjar Dewantara'], 'Wakil Presiden pertama RI Bung Hatta dijuluki Bapak Koperasi Indonesia.'],
  ],
  'Bahasa Indonesia': [
    ['Teks yang berisi langkah-langkah sistematis untuk melakukan atau membuat sesuatu disebut teks...', 'Prosedur', ['Deskripsi', 'Eksposisi', 'Narasi'], 'Teks prosedur memandu pembaca melalui tujuan, bahan/alat, dan langkah-langkah.'],
    ['Teks yang menggambarkan suatu objek atau tempat secara rinci seolah-olah pembaca melihat dan merasakan sendiri disebut teks...', 'Deskripsi', ['Prosedur', 'Persuasi', 'Berita'], 'Teks deskripsi melukiskan objek secara konkret lewat pancaindra.'],
    ['Unsur berita 5W+1H yang menanyakan bagaimana proses terjadinya peristiwa adalah...', 'How (Bagaimana)', ['Who (Siapa)', 'Where (Di mana)', 'When (Kapan)'], 'How menjelaskan kronologi atau proses kejadian berita.'],
    ['Majas yang memberikan sifat atau perilaku manusia kepada benda mati, misalnya "Angin malam berbisik lembut", disebut majas...', 'Personifikasi', ['Hiperbola', 'Litotes', 'Ironi'], 'Personifikasi mengumpamakan benda tak bernyawa seolah hidup seperti manusia.'],
    ['Majas yang mengungkapkan sesuatu secara berlebih-lebihan, seperti "Suaranya menggelegar membelah angkasa", disebut majas...', 'Hiperbola', ['Personifikasi', 'Metafora', 'Eufemisme'], 'Hiperbola melebih-lebihkan pernyataan untuk memberi kesan dramatis.'],
    ['Kalimat yang bertujuan mengajak atau membujuk pembaca agar mengikuti saran penulis merupakan ciri utama teks...', 'Persuasi', ['Observasi', 'Biografi', 'Eksplanasi'], 'Teks persuasi memakai kata ajakan seperti ayo, mari, dan sebaiknya.'],
    ['Teks yang menjelaskan proses terjadinya fenomena alam atau sosial seperti pelangi dan gempa bumi disebut teks...', 'Eksplanasi', ['Fabel', 'Anekdot', 'Negosiasi'], 'Teks eksplanasi menjelaskan hubungan sebab-akibat terjadinya suatu fenomena.'],
    ['Bagian awal surat resmi yang memuat nama instansi, alamat lengkap, dan logo lembaga disebut...', 'Kop surat (Kepala surat)', ['Salam pembuka', 'Tembusan surat', 'Nomor lampiran'], 'Kop surat menunjukkan identitas resmi lembaga pengirim surat.'],
    ['Penulisan kata baku Bahasa Indonesia yang tepat di bawah ini adalah...', 'Apotek dan Praktik', ['Apotik dan Praktek', 'Apotik dan Praktik', 'Apotek dan Praktek'], 'Menurut KBBI, bentuk baku adalah apotek (apoteker) dan praktik (praktikum).'],
    ['Paragraf yang kalimat utamanya terletak di awal paragraf disebut paragraf...', 'Deduktif', ['Induktif', 'Campuran', 'Naratif'], 'Paragraf deduktif menyajikan pernyataan umum di awal lalu diikuti kalimat penjelas.'],
    ['Paragraf yang kalimat utamanya terletak di akhir paragraf sebagai kesimpulan disebut paragraf...', 'Induktif', ['Deduktif', 'Deskriptif', 'Interogatif'], 'Paragraf induktif memaparkan hal khusus terlebih dahulu lalu menyimpulkan di akhir.'],
    ['Buku yang memuat riwayat hidup seorang tokoh terkenal yang ditulis oleh orang lain disebut...', 'Biografi', ['Autobiografi', 'Antologi puisi', 'Ensiklopedia'], 'Biografi ditulis orang lain, sedangkan autobiografi ditulis oleh tokoh itu sendiri.'],
    ['Unsur intrinsik cerita yang berkaitan dengan urutan peristiwa dari awal, konflik, klimaks, hingga penyelesaian disebut...', 'Alur (Plot)', ['Sudut pandang', 'Gaya bahasa', 'Tema cerita'], 'Alur mengatur rangkaian tahapan peristiwa dalam cerita.'],
    ['Tanggapan kritis yang disertai alasan logis serta saran membangun terhadap suatu karya disebut...', 'Ulasan (Resensi)', ['Plagiarisme', 'iklan baris', 'Memo pribadi'], 'Teks ulasan menilai kelebihan dan kekurangan suatu buku, film, atau karya seni.'],
    ['Kata penghubung "karena" dan "sebab" menyatakan hubungan makna...', 'Sebab-akibat (Kausalitas)', ['Pertentangan', 'Urutan waktu', 'Pemilihan'], 'Konjungsi kausalitas menghubungkan alasan/sebab dengan akibat.'],
  ],
  'Bahasa Inggris': [
    ['Choose the correct verb: "She ___ to school every morning by bicycle."', 'goes', ['go', 'going', 'went'], 'Simple Present Tense dengan subjek tunggal (She) menambahkan akhiran -es pada kata kerja go -> goes.'],
    ['What is the past tense (Verb 2) of the irregular verb "buy"?', 'bought', ['buyed', 'buying', 'buys'], 'Bentuk lampau (V2) dari buy adalah bought.'],
    ['"Raden is ___ than his younger brother." Choose the correct comparative adjective!', 'taller', ['tall', 'tallest', 'more tall'], 'Perbandingan dua orang (comparative) untuk kata sifat pendek memakai akhiran -er (taller).'],
    ['Look! The students ___ football in the school yard right now.', 'are playing', ['play', 'played', 'plays'], 'Kata keterangan "Look!" dan "right now" menandakan Present Continuous Tense (are + V-ing).'],
    ['What is the antonym (opposite meaning) of the word "Expensive"?', 'Cheap', ['Rich', 'Heavy', 'Large'], 'Expensive berarti mahal, lawan katanya adalah Cheap (murah).'],
    ['"___ many books are there on the teacher\'s desk?"', 'How', ['What', 'Who', 'Where'], '"How many" digunakan untuk menanyakan jumlah benda yang dapat dihitung (countable nouns).'],
    ['Yesterday, my family and I ___ Borobudur Temple in Central Java.', 'visited', ['visit', 'visits', 'visiting'], 'Keterangan waktu "Yesterday" menggunakan Simple Past Tense (Verb 2: visited).'],
    ['A person who treats sick people in a hospital is called a...', 'Doctor', ['Architect', 'Chef', 'Librarian'], 'Doctor (dokter) memeriksa dan mengobati pasien di rumah sakit.'],
    ['"Could you please ___ the window? It is very hot inside."', 'open', ['opens', 'opened', 'opening'], 'Setelah modal "Could you please", kata kerja kembali ke bentuk dasar (bare infinitive: open).'],
    ['Which expression is used to congratulate someone on winning a quiz competition?', 'Congratulations on your victory!', ['I am sorry to hear that.', 'Get well soon!', 'See you tomorrow!'], 'Congratulations digunakan untuk memberi selamat atas pencapaian seseorang.'],
    ['The library is ___ the laboratory and the canteen.', 'between', ['among', 'under', 'into'], '"Between" digunakan untuk posisi di antara dua tempat yang jelas.'],
    ['What is the plural form of the noun "Child"?', 'Children', ['Childs', 'Childes', 'Childrens'], 'Child memiliki bentuk jamak tak beraturan (irregular plural) yaitu Children.'],
    ['"We ___ wear our school uniform neatly every Monday."', 'must', ['musts', 'are', 'were'], 'Modal "must" menyatakan kewajiban tata tertib sekolah.'],
    ['A narrative text usually starts with "Once upon a time". What is its main purpose?', 'To entertain and teach moral values', ['To explain how to cook rice', 'To advertise a new product', 'To report daily weather'], 'Teks naratif bertujuan menghibur pembaca sekaligus menyampaikan pesan moral.'],
    ['Synonym of the word "Clever" is...', 'Smart', ['Lazy', 'Afraid', 'Angry'], 'Clever memiliki arti yang sama dengan Smart atau Bright (cerdas).'],
  ],
  PPKn: [
    ['Lembaga negara yang merumuskan rancangan dasar negara Indonesia mulai 29 Mei 1945 adalah...', 'BPUPKI', ['PPKI', 'KPK', 'MPR'], 'BPUPKI (Dokuritsu Junbi Cosakai) bersidang merumuskan dasar negara.'],
    ['Panitia Kecil beranggotakan 9 tokoh nasional yang merumuskan Piagam Jakarta disebut...', 'Panitia Sembilan', ['Panitia Delapan', 'Dewan Nasional', 'Komisi Konstitusi'], 'Panitia Sembilan menghasilkan Piagam Jakarta pada 22 Juni 1945.'],
    ['PPKI mengesahkan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 pada tanggal...', '18 Agustus 1945', ['17 Agustus 1945', '1 Juni 1945', '22 Juni 1945'], 'Sehari setelah Proklamasi, PPKI mengesahkan UUD 1945 serta memilih Presiden dan Wakil Presiden.'],
    ['Norma yang bersumber dari hati nurani manusia tentang baik dan buruknya perilaku disebut norma...', 'Kesusilaan', ['Hukum', 'Kesopanan', 'Adat istiadat'], 'Pelanggaran norma kesusilaan menimbulkan rasa penyesalan di hati nurani.'],
    ['Norma yang dibuat oleh lembaga negara berwenang dan memiliki sanksi tegas serta memaksa adalah norma...', 'Hukum', ['Kesopanan', 'Kebiasaan', 'Kesusilaan'], 'Norma hukum bersifat mengikat dan memiliki sanksi tegas berupa denda atau pidana.'],
    ['Urutan peraturan perundang-undangan tertinggi di Negara Kesatuan Republik Indonesia adalah...', 'UUD NRI Tahun 1945', ['Peraturan Presiden', 'Peraturan Daerah', 'Undang-Undang / Perppu'], 'UUD NRI Tahun 1945 menempati puncak hierarki perundang-undangan nasional.'],
    ['Kedaulatan berada di tangan rakyat dan dilaksanakan menurut Undang-Undang Dasar merupakan bunyi UUD 1945 Pasal...', 'Pasal 1 Ayat (2)', ['Pasal 27 Ayat (1)', 'Pasal 31 Ayat (1)', 'Pasal 33 Ayat (3)'], 'Pasal 1 Ayat (2) menegaskan Indonesia menganut kedaulatan rakyat (demokrasi konstitusional).'],
    ['Setiap warga negara berhak mendapat pendidikan merupakan amanat UUD NRI Tahun 1945 Pasal...', 'Pasal 31 Ayat (1)', ['Pasal 28A', 'Pasal 30 Ayat (1)', 'Pasal 34 Ayat (1)'], 'Pasal 31 mengatur hak dan kewajiban pendidikan nasional.'],
    ['Bentuk negara Republik Indonesia menurut Pasal 1 Ayat (1) UUD NRI Tahun 1945 adalah...', 'Negara Kesatuan', ['Negara Serikat', 'Konfederasi', 'Monarki Absolut'], 'Indonesia adalah Negara Kesatuan yang berbentuk Republik.'],
    ['Dalam pembagian kekuasaan trias politica di Indonesia, kekuasaan membentuk undang-undang disebut kekuasaan...', 'Legislatif', ['Eksekutif', 'Yudikatif', 'Eksaminatif'], 'Kekuasaan legislatif dijalankan oleh DPR bersama Presiden.'],
    ['Kekuasaan kehakiman yang merdeka untuk menyelenggarakan peradilan guna menegakkan hukum dan keadilan dijalankan oleh...', 'Mahkamah Agung dan Mahkamah Konstitusi', ['Kementerian Dalam Negeri', 'Komisi Pemilihan Umum', 'Badan Pemeriksa Keuangan'], 'Kekuasaan yudikatif dipegang oleh MA dan MK.'],
    ['Semboyan Bhinneka Tunggal Ika diambil dari kitab Sutasoma karangan pujangga Majapahit bernama...', 'Mpu Tantular', ['Mpu Prapanca', 'Mpu Gandring', 'Mpu Sedah'], 'Mpu Tantular menulis frasa Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa.'],
    ['Upaya warga negara dalam mempertahankan NKRI yang dijiwai kecintaan terhadap tanah air disebut...', 'Bela Negara', ['Otonomi Khusus', 'Diplomasi Dagang', 'Politik Bebas'], 'Bela negara adalah hak dan kehormatan setiap warga negara (Pasal 27 ayat 3).'],
    ['Penyerahan wewenang pemerintahan oleh pemerintah pusat kepada daerah otonom untuk mengatur urusan daerahnya disebut...', 'Otonomi Daerah / Desentralisasi', ['Sentralisasi mutlak', ' Privatisasi', 'Naturalisasi'], 'Otonomi daerah mempercepat pelayanan publik dan pembangunan daerah.'],
    ['Pancasila menjadi pedoman dan petunjuk arah dalam aktivitas bangsa Indonesia sehari-hari, artinya Pancasila berfungsi sebagai...', 'Pandangan hidup bangsa (Way of life)', ['Dokumen sejarah semata', 'Hiasan gedung negara', 'Perjanjian luar negeri'], 'Sebagai pandangan hidup, nilai Pancasila menuntun perilaku masyarakat.'],
  ],
};

const SMA_SUBJECT_FACTS: Record<string, Array<[string, string, [string, string, string], string]>> = {
  Fisika: [
    ['Dimensi dari besaran Gaya (Force = massa × percepatan) dalam Fisika adalah...', '[M][L][T]⁻²', ['[M][L]²[T]⁻²', '[M][L][T]⁻¹', '[M][L]⁻¹[T]⁻²'], 'Satuan gaya kg·m·s⁻² memiliki dimensi [M][L][T]⁻².'],
    ['Sebuah mobil bergerak lurus beraturan dengan kecepatan tetap 20 m/s selama 15 detik. Jarak tempuhnya adalah...', '300 meter', ['150 meter', '35 meter', '400 meter'], 'Jarak s = v × t = 20 × 15 = 300 meter.'],
    ['Benda bermassa 2 kg berada pada ketinggian 10 m (g = 10 m/s²). Energi potensial gravitasinya adalah...', '200 Joule', ['20 Joule', '100 Joule', '400 Joule'], 'Ep = m · g · h = 2 · 10 · 10 = 200 Joule.'],
    ['Benda bermassa 4 kg bergerak dengan kelajuan 5 m/s. Energi kinetik benda tersebut adalah...', '50 Joule', ['20 Joule', '100 Joule', '40 Joule'], 'Ek = ½ · m · v² = ½ · 4 · 25 = 50 Joule.'],
    ['Momentum linear (p) suatu benda didefinisikan sebagai hasil kali antara...', 'Massa dan kecepatan (m · v)', ['Gaya dan perpindahan (F · s)', 'Tekanan dan luas (P · A)', 'Daya dan waktu (P · t)'], 'Momentum p = m · v dengan satuan kg·m/s.'],
    ['Hukum Archimedes menjelaskan bahwa benda yang dicelupkan ke dalam fluida akan mengalami...', 'Gaya apung sebesar berat fluida yang dipindahkan', ['Penurunan massa jenis zat padat', 'Hilangnya gaya gravitasi bumi', 'Kenaikan suhu secara adiabatik'], 'Gaya ke atas Fa = ρ_fluida · g · V_tercelup.'],
    ['Hukum I Termodinamika merupakan pernyataan fisis dari hukum...', 'Kekekalan Energi pada proses termal', ['Kenaikan entropi mutlak', 'Pendinginan Newton', 'Radiasi benda hitam'], 'Kalor yang diserap sistem sama dengan perubahan energi dalam ditambah usaha (Q = ΔU + W).'],
    ['Gelombang elektromagnetik yang memiliki frekuensi paling tinggi dan panjang gelombang paling pendek adalah...', 'Sinar Gamma (γ)', ['Gelombang Radio', 'Sinar Inframerah', 'Cahaya Tampak'], 'Urutan frekuensi tertinggi adalah Sinar Gamma, Sinar-X, UV, Cahaya Tampak, IR, Mikro, Radio.'],
    ['Cepat rambat cahaya di ruang hampa (c) bernilai sekitar...', '3 × 10⁸ m/s', ['340 m/s', '3 × 10⁵ m/s', '1,5 × 10⁶ m/s'], 'Kecepatan cahaya di vakum adalah sekitar 300.000 km/s atau 3 × 10⁸ m/s.'],
    ['Menurut teori relativitas khusus Albert Einstein, kesetaraan massa dan energi dirumuskan sebagai...', 'E = m · c²', ['F = G · m₁m₂ / r²', 'E = h · f', 'P · V = n · R · T'], 'Massa m setara dengan energi E dikali kuadrat laju cahaya c².'],
    ['Arus listrik induksi muncul akibat perubahan fluks magnetik terhadap waktu. Prinsip ini dirumuskan oleh...', 'Hukum Faraday', ['Hukum Coulomb', 'Hukum Hooke', 'Hukum Boyle'], 'GGL induksi ε = -N (dΦ/dt) adalah Hukum Induksi Elektromagnetik Faraday.'],
    ['Tiga buah resistor identik masing-masing 9 Ohm disusun paralel. Hambatan penggantinya adalah...', '3 Ohm', ['27 Ohm', '9 Ohm', '18 Ohm'], '1/Rp = 1/9 + 1/9 + 1/9 = 3/9 sehingga Rp = 3 Ohm.'],
    ['Peristiwa pembelokan arah rambat cahaya ketika melewati dua medium dengan indeks bias berbeda disebut...', 'Refraksi (Pembiasan)', ['Refleksi (Pemantulan)', 'Polarisasi', 'Interferensi'], 'Pembiasan cahaya memenuhi Hukum Snellius.'],
    ['Sebuah pegas memiliki konstanta k = 200 N/m ditarik hingga bertambah panjang 0,05 m. Gaya pegasnya adalah...', '10 Newton', ['4 Newton', '100 Newton', '20 Newton'], 'Hukum Hooke: F = k · Δx = 200 × 0,05 = 10 N.'],
    ['Efek fotolistrik membuktikan bahwa cahaya selain bersifat gelombang juga dapat berperilaku sebagai paket energi diskrit yang disebut...', 'Foton', ['Proton', 'Neutron', 'Positron'], 'Penjelasan efek fotolistrik oleh Einstein membuktikan sifat partikel cahaya (foton).'],
  ],
  Kimia: [
    ['Partikel penyusun inti atom (nukleon) terdiri atas...', 'Proton dan Neutron', ['Proton dan Elektron', 'Elektron dan Neutron', 'Foton dan Elektron'], 'Inti atom bermuatan positif karena berisi proton (+) dan neutron (netral).'],
    ['Atom Natrium memiliki nomor atom 11 dan nomor massa 23. Jumlah neutron dalam atom tersebut adalah...', '12 neutron', ['11 neutron', '23 neutron', '34 neutron'], 'Jumlah neutron = Nomor massa - Nomor atom = 23 - 11 = 12.'],
    ['Ikatan kimia yang terbentuk akibat serah terima elektron antara atom logam dan nonlogam (misal NaCl) disebut ikatan...', 'Ionik', ['Kovalen nonpolar', 'Hidrogen', 'Logam murni'], 'Na melepas elektron menjadi Na⁺ dan Cl menerima elektron menjadi Cl⁻ membentuk ikatan ionik.'],
    ['Ikatan yang terbentuk karena pemakaian bersama pasangan elektron antaratom nonlogam (misal H₂O dan CO₂) disebut ikatan...', 'Kovalen', ['Ionik', 'Van der Waals saja', 'Inti atom'], 'Atom nonlogam berbagi pasangan elektron valensi melalui ikatan kovalen.'],
    ['Nilai pH larutan netral seperti air murni pada suhu ruang (25°C) adalah...', '7', ['0', '1', '14'], 'pH < 7 bersifat asam, pH = 7 netral, dan pH > 7 bersifat basa.'],
    ['Bilangan Avogadro yang menyatakan jumlah partikel dalam 1 mol zat bernilai...', '6,02 × 10²³ partikel', ['22,4 partikel', '3,14 × 10⁸ partikel', '1,6 × 10⁻¹⁹ partikel'], '1 mol zat apa pun mengandung 6,022 × 10²³ entitas dasar.'],
    ['Reaksi kimia yang melepaskan kalor dari sistem ke lingkungan sehingga suhu meningkat (ΔH negatif) disebut reaksi...', 'Eksoterm', ['Endoterm', 'Fotolisis', 'Elektrolisis'], 'Reaksi pembakaran adalah contoh klasik reaksi eksoterm (ΔH < 0).'],
    ['Senyawa hidrokarbon jenuh yang seluruh ikatan antaratom karbonnya tunggal dengan rumus umum CnH2n+2 disebut...', 'Alkana', ['Alkena', 'Alkuna', 'Benzena'], 'Metana (CH₄), etana (C₂H₆), dan propana (C₃H₈) termasuk deret alkana.'],
    ['Zat yang ditambahkan untuk mempercepat laju reaksi kimia dengan menurunkan energi aktivasi tanpa ikut habis bereaksi disebut...', 'Katalis', ['Inhibitor', 'Pelarut murni', 'Endapan'], 'Katalis menyediakan jalur mekanisme reaksi dengan energi aktivasi lebih rendah.'],
    ['Pada sel Volta (Galvani), reaksi oksidasi berlangsung di elektroda...', 'Anoda (kutub negatif)', ['Katoda (kutub positif)', 'Jembatan garam', 'Membran semipermeabel'], 'Ingat jembatan keledai: KRAO (Katoda Reduksi, Anoda Oksidasi).'],
    ['Unsur-unsur golongan VIIIA (He, Ne, Ar, Kr, Xe, Rn) dikenal sangat stabil dan sukar bereaksi sehingga disebut golongan...', 'Gas Mulia', ['Logam Alkali', 'Halogen', 'Alkali Tanah'], 'Gas mulia memiliki konfigurasi elektron valensi penuh (duplet/oktet).'],
    ['Bilangan oksidasi (biloks) unsur Oksigen dalam sebagian besar senyawanya (seperti H₂O dan CO₂) adalah...', '-2', ['+2', '0', '-1'], 'Secara umum biloks O adalah -2 (kecuali pada peroksida -1 dan unsur bebas O₂ = 0).'],
    ['Larutan yang mampu mempertahankan nilai pH relatif tetap meskipun ditambah sedikit asam, basa, atau diencerkan disebut...', 'Larutan Penyangga (Buffer)', ['Larutan Jenuh', 'Koloid Liofil', 'Suspensi Kasar'], 'Buffer menjaga kestabilan pH, misalnya sistem penyangga darah manusia.'],
    ['Massa molekul relatif (Mr) dari molekul air H₂O (diketahui Ar H = 1, O = 16) adalah...', '18', ['17', '16', '20'], 'Mr H₂O = (2 × 1) + 16 = 18.'],
    ['Proses pemisahan fraksi-fraksi minyak bumi menjadi bensin, solar, dan avtur dilakukan berdasarkan perbedaan titik didih melalui...', 'Distilasi bertingkat', ['Filtrasi pasir', 'Kromatografi kertas', 'Sublimasi kapur'], 'Distilasi fraksionasi memisahkan komponen hidrokarbon berdasarkan rentang titik didihnya.'],
  ],
  Biologi: [
    ['Tingkatan taksonomi makhluk hidup yang paling rendah hingga paling spesifik untuk organisme sejenis yang mampu kawin menghasilkan keturunan fertil adalah...', 'Spesies (Jenis)', ['Kingdom', 'Filum / Divisi', 'Famili'], 'Spesies adalah unit dasar klasifikasi taksonomi.'],
    ['Organisme prokariotik bersel tunggal yang belum memiliki membran inti sel dikelompokkan dalam kelompok...', 'Bakteri / Monera', ['Fungi (Jamur)', 'Plantae', 'Animalia'], 'Bakteri bersifat prokariotik karena materi genetiknya tidak dibungkus membran inti.'],
    ['Molekul pembawa informasi genetik berbentuk pita ganda berpilin (double helix) yang ditemukan Watson dan Crick adalah...', 'DNA (Deoxyribonucleic Acid)', ['ATP', 'Kolesterol', 'Selulosa'], 'DNA menyimpan kode genetik makhluk hidup dalam urutan basa nitrogen A, T, G, C.'],
    ['Pembelahan sel tubuh (somatik) yang menghasilkan dua sel anakan identik dengan jumlah kromosom sama dengan induknya (2n -> 2n) disebut...', 'Mitosis', ['Meiosis', 'Oogenesis', 'Spermatogenesis'], 'Mitosis berperan dalam pertumbuhan dan regenerasi jaringan tubuh.'],
    ['Jaringan pengangkut pada tumbuhan berpembuluh yang berfungsi mengangkut air dan mineral dari akar menuju daun adalah...', 'Xilem (Pembuluh kayu)', ['Floem (Pembuluh tapis)', 'Epidermis', 'Parenkim korteks'], 'Xilem mengangkut air dari akar, sedangkan floem mengedarkan hasil fotosintesis.'],
    ['Bagian ginjal (nefron) tempat berlangsungnya proses filtrasi darah menghasilkan urine primer adalah...', 'Glomerulus', ['Ureter', 'Kandung kemih', 'Pelvis renalis'], 'Filtrasi di glomerulus dilanjutkan reabsorpsi dan augmentasi di tubulus nefron.'],
    ['Hormon yang diproduksi oleh pankreas untuk menurunkan kadar gula darah menjadi glikogen otot adalah...', 'Insulin', ['Adrenalin', 'Tiroksin', 'Somatotropin'], 'Kekurangan produksi atau fungsi hormon insulin dapat memicu penyakit diabetes melitus.'],
    ['Pemanfaatan mikroorganisme *Saccharomyces cerevisiae* (ragi) dalam pembuatan roti dan tapai merupakan contoh...', 'Bioteknologi konvensional (Fermentasi)', ['Kloning transfer inti', 'Rekayasa plasmid transgenik', 'Kultur jaringan meristem'], 'Fermentasi menggunakan mikroba utuh secara langsung termasuk bioteknologi konvensional.'],
    ['Basa nitrogen khas yang terdapat pada rantai RNA namun menggantikan Timin (T) pada DNA adalah...', 'Urasil (U)', ['Adenin (A)', 'Guanin (G)', 'Sitosin (C)'], 'RNA memiliki basa nitrogen Adenin, Guanin, Sitosin, dan Urasil.'],
    ['Komponen darah manusia yang berfungsi mengikat oksigen berkat kandungan protein hemoglobin adalah...', 'Eritrosit (Sel darah merah)', ['Leukosit (Sel darah putih)', 'Trombosit (Keping darah)', 'Fibrinogen plasma'], 'Hemoglobin pada eritrosit mengikat O₂ di alveolus paru-paru.'],
    ['Garis biogeografi yang memisahkan tipe fauna Indonesia bagian Barat (Asiatis) dan Tengah (Peralihan) adalah...', 'Garis Wallace', ['Garis Weber', 'Garis Khatulistiwa', 'Garis Kontur'], 'Garis Wallace membentang di Selat Makassar hingga Selat Lombok.'],
    ['Enzim pepsin yang bekerja memecah protein menjadi pepton dalam suasana asam diproduksi oleh organ...', 'Lambung (Ventrikulus)', ['Usus besar', 'Kerongkongan', 'Kantung empedu'], 'Lambung menghasilkan HCl dan enzim pepsinogen yang aktif menjadi pepsin.'],
    ['Proses sintesis protein tahap pertama berupa penyalinan kode genetik dari rantai cetakan DNA menjadi mRNA disebut...', 'Transkripsi', ['Translasi', 'Replikasi', 'Mutasi titik'], 'Sintesis protein terdiri dari transkripsi di inti sel dan translasi di ribosom.'],
    ['Sel darah putih (Leukosit) memiliki peran utama dalam tubuh manusia sebagai...', 'Pertahanan tubuh melawan kuman/patogen (Imunitas)', ['Pembekuan luka luar', 'Pengangkut sari makanan', 'Penyimpan cadangan lemak'], 'Leukosit melindungi tubuh melalui fagositosis dan pembentukan antibodi.'],
    ['Interaksi antarmakhluk hidup ketika singa memangsa zebra di padang sabana disebut...', 'Predasi', ['Kompetisi intraspesifik', 'Simbiosis mutualisme', 'Antibiosis'], 'Predasi adalah hubungan antara predator (pemangsa) dan prey (mangsa).'],
  ],
  Ekonomi: [
    ['Masalah pokok ilmu ekonomi klasik muncul karena adanya kesenjangan antara kebutuhan manusia yang tidak terbatas dengan alat pemuas yang terbatas, disebut...', 'Kelangkaan (Scarcity)', ['Surplus anggaran', 'Deflasi harga', 'Monopoli pasar'], 'Kelangkaan mendorong manusia menyusun skala prioritas yang rasional.'],
    ['Nilai manfaat terbaik dari alternatif pilihan yang dikorbankan ketika seseorang mengambil suatu keputusan ekonomi disebut...', 'Biaya peluang (Opportunity cost)', ['Biaya tetap (Fixed cost)', 'Penyusutan aset', 'Pajak pertambahan nilai'], 'Opportunity cost adalah nilai pilihan terbaik berikutnya yang dilepaskan.'],
    ['Lembaga negara independen yang bertugas sebagai bank sentral Republik Indonesia untuk menjaga kestabilan nilai Rupiah adalah...', 'Bank Indonesia (BI)', ['Bank Perkreditan Rakyat', 'Pegadaian Persero', 'Bursa Efek Asing'], 'Bank Indonesia memegang otoritas kebijakan moneter dan sistem pembayaran nasional.'],
    ['Kondisi kenaikan harga barang dan jasa secara umum dan terus-menerus dalam jangka waktu tertentu disebut...', 'Inflasi', ['Deflasi', 'Apresiasi kurs', 'Likuidasi'], 'Inflasi menurunkan daya beli mata uang apabila tidak dikendalikan.'],
    ['Persamaan dasar akuntansi yang selalu harus seimbang (balance) adalah...', 'Aset (Harta) = Liabilitas (Utang) + Ekuitas (Modal)', ['Aset = Utang - Modal', 'Modal = Harta + Utang', 'Pendapatan = Beban × Modal'], 'Seluruh aset perusahaan dibiayai dari kewajiban (utang) dan ekuitas pemilik.'],
    ['Total nilai pasar seluruh barang dan jasa akhir yang diproduksi di dalam batas wilayah suatu negara selama satu tahun disebut...', 'Produk Domestik Bruto (PDB / GDP)', ['Pendapatan Perorangan', 'Anggaran Belanja Daerah', 'Neraca Perdagangan'], 'PDB mengukur kinerja produksi ekonomi domestik suatu negara.'],
    ['Rencana keuangan tahunan pemerintahan negara Indonesia yang disetujui oleh DPR disebut...', 'APBN', ['APBD Kabupaten', 'Neraca Saldo Perusahaan', 'Prospektus Saham'], 'Anggaran Pendapatan dan Belanja Negara (APBN) menjadi instrumen kebijakan fiskal.'],
    ['Lembaga yang mengawasi sektor jasa keuangan (perbankan, pasar modal, asuransi, dana pensiun) di Indonesia adalah...', 'Otoritas Jasa Keuangan (OJK)', ['Badan Pusat Statistik', 'Kementerian Pertanian', 'Mahkamah Agung'], 'OJK menyelenggarakan sistem pengaturan dan pengawasan terintegrasi sektor jasa keuangan.'],
    ['Struktur pasar di mana hanya terdapat satu penjual yang menguasai produk unik tanpa barang substitusi dekat disebut pasar...', 'Monopoli', ['Persaingan sempurna', 'Monopsoni', 'Oligopsoni'], 'Pada pasar monopoli, satu produsen tunggal menguasai penawaran pasar.'],
    ['Surat berharga sebagai tanda penyertaan kepemilikan modal seseorang atau badan usaha dalam suatu Perseroan Terbatas (PT) di pasar modal disebut...', 'Saham', ['Faktur penjualan', 'Kuitansi sewa', 'Nota kontan'], 'Pemegang saham berhak atas dividen dan potensi capital gain.'],
    ['Kebijakan ekonomi pemerintah melalui pengaturan pajak dan pengeluaran belanja negara (APBN) disebut kebijakan...', 'Fiskal', ['Moneter diskonto', 'Giro wajib minimum', 'Operasi pasar terbuka'], 'Kebijakan fiskal dijalankan pemerintah melalui instrumen pajak dan belanja publik.'],
    ['Pajak yang dikenakan atas kepemilikan tanah dan bangunan oleh warga masyarakat dikenal dengan singkatan...', 'PBB (Pajak Bumi dan Bangunan)', ['PPN', 'Bea Materai', 'Cukai Ekspor'], 'PBB merupakan pajak kebendaan atas tanah dan/atau bangunan.'],
  ],
  Sosiologi: [
    ['Tokoh filsafat Prancis yang pertama kali mencetuskan istilah "Sosiologi" sehingga dijuluki Bapak Sosiologi Dunia adalah...', 'Auguste Comte', ['Adam Smith', 'Isaac Newton', 'Aristoteles'], 'Auguste Comte memperkenalkan istilah sociologie dalam bukunya Cours de Philosophie Positive.'],
    ['Syarat utama terjadinya interaksi sosial dalam kehidupan masyarakat adalah adanya...', 'Kontak sosial dan komunikasi', ['Kekayaan dan jabatan', 'Persaingan dan konflik fisik', 'Kesamaan usia dan hobi'], 'Interaksi sosial tidak mungkin terjadi tanpa kontak sosial dan komunikasi.'],
    ['Proses belajar seorang anak mengenal nilai, etika, dan norma yang berlaku di keluarga serta masyarakat disebut...', 'Sosialisasi', ['Stratifikasi', 'Modernisasi', 'Marginalisasi'], 'Keluarga merupakan agen sosialisasi primer pertama bagi seorang individu.'],
    ['Perpindahan status sosial seseorang dari karyawan biasa diangkat menjadi direktur perusahaan merupakan contoh mobilitas sosial...', 'Vertikal naik (Social climbing)', ['Horizontal sederajat', 'Vertikal turun (Social sinking)', 'Geografis musiman'], 'Peningkatan kedudukan/derajat sosial disebut social climbing.'],
    ['Bentuk penyelesaian konflik sosial melalui pihak ketiga yang netral sebagai penasihat tanpa kewenangan mengambil keputusan mengikat disebut...', 'Mediasi', ['Ajudikasi pengadilan', 'Koersi paksaan', 'Stalemate'], 'Mediator membantu para pihak berunding namun keputusan akhir tetap di tangan kedua pihak.'],
    ['Penggolongan masyarakat secara sejajar (horizontal) berdasarkan suku bangsa, agama, dan profesi tanpa tingkatan tinggi-rendah disebut...', 'Diferensiasi sosial', ['Stratifikasi sosial tertutup', 'Sistem kasta feodal', 'Disorganisasi sosial'], 'Diferensiasi sosial bersifat horizontal/setara, berbeda dengan stratifikasi yang bertingkat.'],
    ['Sikap menilai kebudayaan kelompok lain menggunakan ukuran kebudayaan kelompok sendiri dan menganggap budayanya paling unggul disebut...', 'Etnosentrisme', ['Toleransi multikultural', 'Empati sosial', 'Asimilasi harmonis'], 'Etnosentrisme berlebihan dapat menghambat integrasi sosial masyarakat majemuk.'],
    ['Percampuran dua kebudayaan berbeda yang menghasilkan budaya baru tanpa menghilangkan ciri khas budaya asli masing-masing (misal Masjid Menara Kudus) disebut...', 'Akulturasi', ['Asimilasi total', 'Invasi paksa', 'Segregasi'], 'Rumus akulturasi: A + B = AB (unsur budaya asli tetap tampak).'],
    ['Ilmu sosiologi mengkaji fakta sosial secara apa adanya berdasarkan observasi nyata tanpa menilai baik atau buruknya fakta tersebut. Sifat ini disebut...', 'Nonetis', ['Spekulatif', 'Imajinatif', 'Dogmatis'], 'Empiris, teoretis, kumulatif, dan nonetis adalah empat ciri utama sosiologi sebagai ilmu.'],
    ['Pengendalian sosial yang dilakukan sebelum terjadinya pelanggaran (misal penyuluhan tata tertib di sekolah) bersifat...', 'Preventif', ['Represif', 'Kuratif paksa', 'Koersif fisik'], 'Tindakan preventif bertujuan mencegah terjadinya penyimpangan sosial.'],
    ['Masyarakat majemuk yang menjunjung tinggi kesederajatan dan saling menghargai keberagaman budaya disebut masyarakat...', 'Multikultural', ['Homogen tertutup', 'Patriarkis feodal', 'Individualis ekstrem'], 'Multikulturalisme menekankan kesetaraan dalam keberagaman.'],
    ['Metode penelitian sosial yang mengutamakan wawancara mendalam dan pengamatan deskriptif makna perilaku subjek disebut penelitian...', 'Kualitatif', ['Eksperimen kimia', 'Astronomi optik', 'Trigonometri'], 'Penelitian kualitatif menggali makna mendalam berupa narasi dan deskripsi fenomena sosial.'],
  ],
};

// ============================================================================
// GENERATOR ARITMATIKA & MATEMATIKA UNIK TIAP KELAS (SD 1-6, SMP 1-3, SMA 1-3)
// ============================================================================
function generateUniqueMathForGrade(gradeKey: string): ISchoolQuizQuestion[] {
  const list: ISchoolQuizQuestion[] = [];
  if (gradeKey === 'sd-1') {
    for (let a = 3; a <= 14; a++) {
      const b = (a % 7) + 4;
      const sum = a + b;
      list.push({
        id: `ux-sd1-add-${a}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Ibu memberi Adik ${a} buah jeruk, lalu Ayah memberi lagi ${b} buah jeruk. Berapa jumlah jeruk Adik sekarang?`,
        correctAnswer: `${sum}`,
        wrongAnswers: makeNumDistractors(sum, 1),
        explanation: `${a} + ${b} = ${sum} buah jeruk.`,
      });
    }
    for (let a = 12; a <= 20; a++) {
      const b = (a % 5) + 3;
      const diff = a - b;
      list.push({
        id: `ux-sd1-sub-${a}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Di taman ada ${a} ekor burung pipit, kemudian ${b} ekor terbang pergi. Berapa burung yang masih di taman?`,
        correctAnswer: `${diff}`,
        wrongAnswers: makeNumDistractors(diff, 1),
        explanation: `${a} dikurangi ${b} menyisakan ${diff}.`,
      });
    }
  } else if (gradeKey === 'sd-2') {
    for (let i = 1; i <= 14; i++) {
      const a = 24 + i * 3;
      const b = 15 + i * 2;
      const sum = a + b;
      list.push({
        id: `ux-sd2-add-${i}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Hasil penjumlahan bilangan dua angka ${a} + ${b} adalah...`,
        correctAnswer: `${sum}`,
        wrongAnswers: makeNumDistractors(sum, 2),
        explanation: `${a} + ${b} = ${sum}.`,
      });
    }
    for (let m = 2; m <= 9; m++) {
      const n = (m % 4) + 3;
      const prod = m * n;
      list.push({
        id: `ux-sd2-mul-${m}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Terdapat ${m} keranjang rotan, masing-masing berisi ${n} buah apel merah. Total seluruh apel adalah...`,
        correctAnswer: `${prod}`,
        wrongAnswers: makeNumDistractors(prod, 2),
        explanation: `${m} × ${n} = ${prod} buah apel.`,
      });
    }
  } else if (gradeKey === 'sd-3') {
    for (let m = 4; m <= 12; m++) {
      const n = (m % 6) + 4;
      const prod = m * n;
      list.push({
        id: `ux-sd3-mul-${m}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Hasil perkalian ${m} × ${n} adalah...`,
        correctAnswer: `${prod}`,
        wrongAnswers: makeNumDistractors(prod, 3),
        explanation: `${m} dikali ${n} menghasilkan ${prod}.`,
      });
    }
    for (let q = 3; q <= 12; q++) {
      const div = (q % 5) + 3;
      const total = q * div;
      list.push({
        id: `ux-sd3-div-${q}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Sebanyak ${total} buku tulis dibagikan sama rata kepada ${div} siswa. Setiap siswa menerima berapa buku?`,
        correctAnswer: `${q}`,
        wrongAnswers: makeNumDistractors(q, 1),
        explanation: `${total} ÷ ${div} = ${q} buku per siswa.`,
      });
    }
  } else if (gradeKey === 'sd-4') {
    for (let s = 5; s <= 16; s++) {
      const kel = 4 * s;
      list.push({
        id: `ux-sd4-kel-${s}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Sebuah taman berbentuk persegi memiliki panjang sisi ${s} meter. Berapakah keliling taman tersebut?`,
        correctAnswer: `${kel} m`,
        wrongAnswers: makeNumDistractors(kel, 4, ' m'),
        explanation: `Keliling persegi = 4 × sisi = 4 × ${s} = ${kel} m.`,
      });
    }
    for (let p = 6; p <= 15; p++) {
      const l = (p % 5) + 3;
      const luas = p * l;
      list.push({
        id: `ux-sd4-luas-${p}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Persegi panjang memiliki panjang ${p} cm dan lebar ${l} cm. Luas bangun tersebut adalah...`,
        correctAnswer: `${luas} cm²`,
        wrongAnswers: makeNumDistractors(luas, 4, ' cm²'),
        explanation: `Luas persegi panjang = p × l = ${p} × ${l} = ${luas} cm².`,
      });
    }
  } else if (gradeKey === 'sd-5') {
    for (let r = 2; r <= 11; r++) {
      const vol = r * r * r;
      list.push({
        id: `ux-sd5-kubus-${r}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Sebuah kotak kayu berbentuk kubus memiliki panjang rusuk ${r} cm. Berapakah volume kubus tersebut?`,
        correctAnswer: `${vol} cm³`,
        wrongAnswers: makeNumDistractors(vol, r * 2, ' cm³'),
        explanation: `Volume kubus = r³ = ${r} × ${r} × ${r} = ${vol} cm³.`,
      });
    }
    for (let v = 40; v <= 85; v += 5) {
      const t = (v % 3) + 2;
      const jarak = v * t;
      list.push({
        id: `ux-sd5-jarak-${v}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Kereta melaju dengan kecepatan rata-rata ${v} km/jam selama ${t} jam. Jarak yang ditempuh adalah...`,
        correctAnswer: `${jarak} km`,
        wrongAnswers: makeNumDistractors(jarak, 15, ' km'),
        explanation: `Jarak = Kecepatan × Waktu = ${v} × ${t} = ${jarak} km.`,
      });
    }
  } else if (gradeKey === 'sd-6') {
    const radii = [7, 14, 21, 28, 35];
    for (const r of radii) {
      const kel = 2 * 22 * (r / 7);
      const luas = 22 * (r / 7) * r;
      list.push({
        id: `ux-sd6-kelling-${r}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Sebuah roda sepeda memiliki jari-jari ${r} cm (π = 22/7). Berapakah keliling roda tersebut?`,
        correctAnswer: `${kel} cm`,
        wrongAnswers: makeNumDistractors(kel, 11, ' cm'),
        explanation: `Keliling lingkaran = 2 × π × r = 2 × (22/7) × ${r} = ${kel} cm.`,
      });
      list.push({
        id: `ux-sd6-luasling-${r}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Luas permukaan meja bundar yang berjari-jari ${r} cm (π = 22/7) adalah...`,
        correctAnswer: `${luas} cm²`,
        wrongAnswers: makeNumDistractors(luas, 22, ' cm²'),
        explanation: `Luas lingkaran = π × r² = (22/7) × ${r} × ${r} = ${luas} cm².`,
      });
    }
    for (let i = 1; i <= 12; i++) {
      const a = -4 - i;
      const b = 10 + i * 2;
      const res = a + b;
      list.push({
        id: `ux-sd6-int-${i}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Hasil operasi bilangan bulat (${a}) + ${b} adalah...`,
        correctAnswer: `${res}`,
        wrongAnswers: makeNumDistractors(res, 3),
        explanation: `(${a}) ditambah ${b} sama dengan ${res}.`,
      });
    }
  } else if (gradeKey.startsWith('smp-')) {
    const gNum = Number(gradeKey.split('-')[1]) || 1;
    for (let x = 2; x <= 14; x++) {
      const k = gNum + 2;
      const c = x + gNum * 3;
      const rhs = k * x + c;
      list.push({
        id: `ux-${gradeKey}-lin-${x}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Penyelesaian persamaan linear ${k}x + ${c} = ${rhs} memberikan nilai x sebesar...`,
        correctAnswer: `${x}`,
        wrongAnswers: makeNumDistractors(x, 1),
        explanation: `${k}x = ${rhs} - ${c} = ${k * x}, sehingga x = ${x}.`,
      });
    }
    const triples: Array<[number, number, number]> = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
      [9, 12, 15],
      [7, 24, 25],
      [12, 16, 20],
      [15, 20, 25],
    ];
    triples.forEach(([a, b, c], idx) => {
      list.push({
        id: `ux-${gradeKey}-pyth-${idx}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Segitiga siku-siku memiliki panjang sisi penyiku ${a} cm dan ${b} cm. Panjang sisi miring (hipotenusa) segitiga tersebut adalah...`,
        correctAnswer: `${c} cm`,
        wrongAnswers: makeNumDistractors(c, 2, ' cm'),
        explanation: `Teorema Pythagoras: √(${a}² + ${b}²) = √(${a * a + b * b}) = ${c} cm.`,
      });
    });
  } else if (gradeKey.startsWith('sma-')) {
    const gNum = Number(gradeKey.split('-')[1]) || 1;
    for (let n = 2; n <= 12; n++) {
      const a = gNum * 2;
      const b = n + 3;
      const xVal = 2;
      const dVal = 2 * a * xVal + b;
      list.push({
        id: `ux-${gradeKey}-deriv-${n}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Diketahui fungsi kuadrat f(x) = ${a}x² + ${b}x - ${n}. Nilai turunan pertama f'(2) adalah...`,
        correctAnswer: `${dVal}`,
        wrongAnswers: makeNumDistractors(dVal, 2),
        explanation: `f'(x) = ${2 * a}x + ${b}, maka f'(2) = ${2 * a}(2) + ${b} = ${dVal}.`,
      });
    }
    for (let k = 1; k <= 10; k++) {
      const u1 = k * 3;
      const beda = k + 2;
      const u10 = u1 + 9 * beda;
      list.push({
        id: `ux-${gradeKey}-baris-${k}`,
        subject: 'Matematika',
        emoji: '🔢',
        question: `Barisan aritmatika memiliki suku pertama U₁ = ${u1} dan beda b = ${beda}. Nilai suku ke-10 (U₁₀) adalah...`,
        correctAnswer: `${u10}`,
        wrongAnswers: makeNumDistractors(u10, beda),
        explanation: `U₁₀ = a + 9b = ${u1} + 9(${beda}) = ${u10}.`,
      });
    }
  }
  return list;
}

export function getExtraUniqueQuestionsForGrade(gradeKey: string): ISchoolQuizQuestion[] {
  const key = gradeKey.toLowerCase();
  const mathPool = generateUniqueMathForGrade(key);

  if (key.startsWith('sd-')) {
    return [
      ...mathPool,
      ...buildFactQuestions(`ux-${key}-bindo`, 'Bahasa Indonesia', '🇮🇩', SD_BAHASA_FACTS),
      ...buildFactQuestions(`ux-${key}-pkn`, 'Pendidikan Pancasila', '⚖️', SD_PANCASILA_FACTS),
      ...buildFactQuestions(`ux-${key}-ipas`, 'IPAS', '🔬', SD_IPAS_FACTS),
    ];
  }

  if (key.startsWith('smp-')) {
    return [
      ...mathPool,
      ...buildFactQuestions(`ux-${key}-ipa`, 'IPA', '🔬', SMP_SCIENCE_SOCIAL_FACTS.IPA),
      ...buildFactQuestions(`ux-${key}-ips`, 'IPS', '🌍', SMP_SCIENCE_SOCIAL_FACTS.IPS),
      ...buildFactQuestions(`ux-${key}-bindo`, 'Bahasa Indonesia', '🇮🇩', SMP_SCIENCE_SOCIAL_FACTS['Bahasa Indonesia']),
      ...buildFactQuestions(`ux-${key}-bing`, 'Bahasa Inggris', '🇬🇧', SMP_SCIENCE_SOCIAL_FACTS['Bahasa Inggris']),
      ...buildFactQuestions(`ux-${key}-ppkn`, 'PPKn', '⚖️', SMP_SCIENCE_SOCIAL_FACTS.PPKn),
    ];
  }

  return [
    ...mathPool,
    ...buildFactQuestions(`ux-${key}-fis`, 'Fisika', '⚡', SMA_SUBJECT_FACTS.Fisika),
    ...buildFactQuestions(`ux-${key}-kim`, 'Kimia', '🧪', SMA_SUBJECT_FACTS.Kimia),
    ...buildFactQuestions(`ux-${key}-bio`, 'Biologi', '🧬', SMA_SUBJECT_FACTS.Biologi),
    ...buildFactQuestions(`ux-${key}-eko`, 'Ekonomi', '📈', SMA_SUBJECT_FACTS.Ekonomi),
    ...buildFactQuestions(`ux-${key}-sos`, 'Sosiologi', '🤝', SMA_SUBJECT_FACTS.Sosiologi),
    ...buildFactQuestions(`ux-${key}-bindo`, 'Bahasa Indonesia', '🇮🇩', SMP_SCIENCE_SOCIAL_FACTS['Bahasa Indonesia']),
    ...buildFactQuestions(`ux-${key}-bing`, 'Bahasa Inggris', '🇬🇧', SMP_SCIENCE_SOCIAL_FACTS['Bahasa Inggris']),
  ];
}

