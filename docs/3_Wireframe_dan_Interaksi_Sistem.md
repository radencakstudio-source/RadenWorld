# Dokumen 3: 3 Wireframe Antarmuka Utama Game & Penjelasan Interaksi Pemain dengan Sistem
**Nama Sistem**: RadenWorld — *2D Open World Multiplayer Education & Life Simulation*  
**Genre Permainan**: **Education & Life Simulation** (Edukasi & Simulasi Kehidupan — Tanpa Unsur Kekerasan)

---

## Bagian I: 3 Wireframe Antarmuka Utama Game

### 1. Wireframe 1: Antarmuka Beranda Utama / Lobby (`HomeScreen.tsx`)
Antarmuka pertama saat pengguna membuka aplikasi (`/`). Mengusung desain *Clay-Pixel Cozycore* yang menampilkan 4 tombol navigasi utama di sisi kiri, panggung pratinjau karakter interaktif di tengah, dan status koneksi server di kanan atas.

```text
+----------------------------------------------------------------------------------------------------------+
|  [LOGO] RADENWORLD: 2D OPEN WORLD EDUCATION & LIFE SIMULATION       [🌐 Server: Asia 1] [🔊 Audio] [⚙️]  |
+----------------------------------------------------------------------------------------------------------+
|                                                                                                          |
|  +----------------------------------+     +-----------------------------------------------------------+  |
|  |  MENU UTAMA                      |     |               PANGGUNG PRATINJAU KARakter 2D              |  |
|  |                                  |     |                                                           |  |
|  |  +----------------------------+  |     |                      +-------------+                      |  |
|  |  | ▶  1. MULAI BERMAIN        |  |     |                      |   ( ^_^ )   |  <-- Sprite Avatar   |  |
|  |  +----------------------------+  |     |                      |    /| |\    |      Kustom Pemain   |  |
|  |                                  |     |                      |     / \     |                      |  |
|  |  +----------------------------+  |     |                      +-------------+                      |  |
|  |  | 👤 2. AKUN & PROFIL SAYA   |  |     |                Nama : [ RadenSiswa     ]                  |  |
|  |  +----------------------------+  |     |                Level: Lv. 5  |  🪙 3.250  |  💎 50        |  |
|  |                                  |     |                                                           |  |
|  |  +----------------------------+  |     |  [ 👕 Ganti Pakaian ]  [ 🎨 Warna Kulit ]  [ 🎩 Topi ]    |  |
|  |  | 🌐 3. PILIH SERVER KOTA    |  |     +-----------------------------------------------------------+  |
|  |  +----------------------------+  |                                                                    |
|  |                                  |     +-----------------------------------------------------------+  |
|  |  +----------------------------+  |     |  📢 INFO KOTA & EVENT EDUKASI HARI INI                    |  |
|  |  | ⚙️ 4. PENGATURAN & TEMA    |  |     |  • Ujian Kuis SD, SMP & SMA Berhadiah Koin Emas & EXP!    |  |
|  |  +----------------------------+  |     |  • Bunga Tabungan Bank Kota 5% Setiap Hari!               |  |
|  +----------------------------------+     +-----------------------------------------------------------+  |
|                                                                                                          |
|  Status Akun: ✅ Terhubung ke Database MySQL (Google OAuth / Email Terverifikasi)        Versi: v4.9     |
+----------------------------------------------------------------------------------------------------------+
```

---

### 2. Wireframe 2: Antarmuka Utama Dalam Permainan / In-Game HUD, Kontrol Panen `[F]`/Mobile & Notifikasi Follow 30 Detik (`HUD.tsx`, `VirtualControls.tsx`, `FriendRequestNotification.tsx`)
Antarmuka utama saat pemain berada di dunia terbuka (`/world`). Menggabungkan panel status pemain di kiri atas, minimap & mikrofon WebRTC di kanan atas, **Pop-up Notifikasi Mengikuti Cooldown 30 Detik (Terima / Tolak / Abaikan / Hangus)** di sisi kanan, **Hotbar 6 Slot** di bawah tengah, serta **Kontrol Virtual Mobile** dengan tombol dinamis **`🌾 PANEN` (`[F]`)**.

```text
+----------------------------------------------------------------------------------------------------------+
| +---------------------------------------+                  +--------------------+ +--------------------+ |
| | [Avatar] RadenSiswa     [Lv. 5] [🎒] |                  | [🎙️ MIC: ON (Jernih)]| |   MINIMAP KOTA     | |
| | 🪙 3.250 Koin   💎 50   EXP [████░░]  |                  | [🔊 SPEAKER: ON]   | |  [Sekolah] [Bank]  | |
| | 📍 Zona: Kebun Tani (14, 18)          |                  | [🌐 Asia 1] [⚙️]   | |  [Kebun ●] [Cafe]  | |
| +---------------------------------------+                  +--------------------+ +--------------------+ |
|                                                                                                          |
|                                                            +-------------------------------------------+ |
|                                                            | 👥 PERMINTAAN MENGIKUTI   [⏱️ 28d (Hangus)]| |
|         [ 🌾 Petak Gandum Matang ]                         | [Ava] BudiSantoso (Lv.3) mengikuti kamu!  | |
|                    |                                       | [██████████████████████░░░░░] Sisa: 28d   | |
|                    v                                       | [ ✅ TERIMA ] [ ❌ TOLAK ] [ 🙈 ABAIKAN ] | |
|         +---------------------+                            +-------------------------------------------+ |
|         | 💡 Tekan [F] / [E]: |                                                                          |
|         | 🌾 Panen Gandum Emas|                                                                          |
|         +---------------------+                                                                          |
|                   (o_o)  <-- Karakter Pemain                                                             |
|                   /| |\      (Memegang Joran Pancing, tetapi tetap bisa langsung                         |
|                    / \        memanen tanaman matang dengan tombol [F] / tombol "🌾 PANEN")              |
|                                                                                                          |
| +-------------------------------+                                    +---------------------------------+ |
| |      ANALOG GERAK (MOBILE)    |                                    |  TOMBOL AKSI MOBILE & PC        | |
| |            [ ▲ ]              |   +----------------------------+   |         [ 🌾 PANEN (F) ]        | |
| |       [ ◄ ]  ●  [ ► ]         |   | [1:🎣][2:🚿][3:🌾][4][5][6]|   |   [ ✋ AKSI (E) ] [ ⏫ LOMPAT ]  | |
| |            [ ▼ ]              |   +----------------------------+   |   [ 🪁 LAYANGAN (R) ] [ 💬 CHAT ]| |
| +-------------------------------+        HOTBAR 6-SLOT + TAS [B]     +---------------------------------+ |
+----------------------------------------------------------------------------------------------------------+
```

---

### 3. Wireframe 3: Antarmuka Akademik & Simulasi Ekonomi Terpadu (`SchoolSubjectsModal.tsx` & `BankModal.tsx`)
Antarmuka modal interaktif saat pemain belajar & mengerjakan ujian kuis di **Gedung Sekolah (SD/SMP/SMA)** atau mengelola keuangan di **Gedung Bank / Pasar Kota**. Seluruh desain mengikuti tema yang dipilih pemain di `SettingsModal`.

```text
+----------------------------------------------------------------------------------------------------------+
|  🏫 RUANG BELAJAR & UJIAN SEKOLAH (JENJANG: SMP — KELAS 2)                              [ ✖ TUTUP (ESC) ]|
+----------------------------------------------------------------------------------------------------------+
|  Tab Navigasi:  [ 📚 1. Materi Pelajaran ]   [ 📝 2. Ujian Kuis Berhadiah ]   [ 🏆 3. Papan Peringkat ]  |
+----------------------------------------------------------------------------------------------------------+
|                                              |                                                           |
|  DAFTAR MATA PELAJARAN KURIKULUM:            |  📝 UJIAN KUIS INTERAKTIF: MATEMATIKA & IPA (Soal 3 / 5)  |
|  +----------------------------------------+  |  +-----------------------------------------------------+  |
|  | 📐 Matematika Terapan     [+30 EXP] ▶  |  |  | Pertanyaan:                                         |  |
|  | 🔬 Ilmu Pengetahuan Alam  [+30 EXP] ▶  |  |  | Sebuah kebun berbentuk persegi panjang memiliki     |  |
|  | 🌍 Ilmu Pengetahuan Sosial[+25 EXP] ▶  |  |  | panjang 12m dan lebar 8m. Berapakah luas kebunnya?  |  |
|  | 📖 Bahasa Indonesia       [+25 EXP] ▶  |  |  |                                                     |  |
|  | 🌐 Bahasa Inggris         [+25 EXP] ▶  |  |  |  (A) 40 m²                  (B) 86 m²               |  |
|  | ⚖️ Pendidikan Pancasila   [+25 EXP] ▶  |  |  |  (C) 96 m²  [✓ DIPILIH]     (D) 104 m²              |  |
|  +----------------------------------------+  |  +-----------------------------------------------------+  |
|                                              |                                                           |
|  🏆 TOP 3 PAPAN PERINGKAT SISWA (REAL-TIME): |  Hadiah Penyelesaian Kuis:                                |
|  1. 🥇 RadenSiswa (SMP Kelas 2) — 500 Poin   |  • 🌟 +50 EXP Akademik (Otomatis Naik Level jika Penuh)   |
|  2. 🥈 SitiAisyah (SMP Kelas 2) — 480 Poin   |  • 🪙 +100 Koin Emas (Langsung Masuk Dompet & MySQL)      |
|  3. 🥉 BudiSantoso (SMP Kelas 2) — 450 Poin  |                                                           |
|                                              |              [ ✅ KIRIM JAWABAN & KLAIM HADIAH ]          |
+----------------------------------------------------------------------------------------------------------+
```

---

## Bagian II: Penjelasan Interaksi Pemain dengan Sistem

Sistem interaksi pada **RadenWorld (Education & Life Simulation)** dirancang dengan pola **Event-Driven Dual-Engine** (menghubungkan *Phaser 3 Scene Engine* untuk simulasi fisik 2D dan *React 18 UI Layer* untuk antarmuka modal/HUD melalui `EventBus`, serta disinkronkan secara otoritatif ke **Laravel MySQL** dan **Socket.IO Server**).

### 1. Interaksi Navigasi, Eksplorasi & Mode Layang-Layang
* **Input Pemain**:
  * **PC / Laptop**: Tombol `WASD` atau `Arrow Keys` untuk bergerak 8 arah, `Space` untuk melompat 2.5D, `[E]` untuk berinteraksi dengan pintu/NPC/meja, dan `[R]` untuk menerbangkan/mengendalikan layang-layang.
  * **Mobile / Layar Sentuh**: *Virtual Joystick* di kiri bawah layar dan tombol aksi kontekstual di kanan bawah layar.
* **Respon Sistem**:
  * `CharacterController.ts` menghitung vektor kecepatan dengan *delta-time* `(dt / 16.666)` agar laju gerak mulus di layar 60Hz maupun 144Hz.
  * Saat mode layang-layang (`[R]`) diaktifkan, kamera secara mulus mengikuti layang-layang di udara dan menyiarkan koordinat layang-layang (`kiteX`, `kiteY`) ke seluruh pemain lain secara *online* melalui Socket.IO. Saat mode layang-layang dimatikan, kamera langsung kembali mengunci ke karakter pemain.
  * Saat keluar dari gedung (**Cafe Raden Lounge**, **Perpustakaan Kota**, atau **Sekolah**), sistem menempatkan koordinat pemain tepat di depan pintu gedung yang bersangkutan (`returnX`, `returnY`).

### 2. Interaksi Bertani & Shortcut Panen Cepat (`[F]` dan Tombol Mobile `🌾 PANEN`)
* **Input Pemain**:
  * Pemain berjalan mendekati petak tanaman di Kebun Tani, lalu menekan tombol **`[F]`** (atau `[E]`) di keyboard PC, atau mengetuk tombol **`🌾 PANEN`** di layar sentuh mobile.
* **Respon Sistem**:
  * Setiap *frame*, `WorldScene.ts` memeriksa `WorldFarming.hasRipeCropNearPlayer(player)` dan memancarkan event `near-ripe-crop-changed` ke `VirtualControls.tsx`.
  * Jika ada tanaman siap panen (`stage === 3`) di dekat pemain, tombol alat di layar mobile otomatis berubah ikon dan labelnya menjadi **`🌾 PANEN`**.
  * Di `CharacterController.ts` (`handleFlexibleToolKeyDown`), pengecekan panen diletakkan pada **Prioritas Utama (Nomor 1)**. Artinya, meskipun pemain sedang memegang Joran Pancing (Slot 1) atau alat lain, menekan `[F]` atau tombol mobile `🌾 PANEN` akan **langsung memanen tanaman matang**, memasukkan hasil panen ke `InventoryManager`, memberikan **`+25 EXP`**, serta menyimpan perubahan ke `/api/world/trees` dan `/api/user/sync-progress`.

### 3. Interaksi Edukasi (Sekolah SD/SMP/SMA & Perpustakaan Kota)
* **Input Pemain**:
  * Pemain menekan `[E]` di depan pintu **SD, SMP, atau SMA**, memilih kelas (`SchoolGradeSelectModal`), duduk di Meja Guru/Siswa, mempelajari materi kurikulum, dan menjawab soal ujian kuis di `SchoolSubjectsModal.tsx`.
* **Respon Sistem**:
  * Saat selesai membaca materi atau menyelesaikan kuis, komponen memancarkan `EventBus.emit('gain-exp', { amount, source })` dan `EventBus.emit('quiz-gold-earned', goldEarned)`.
  * `GameApp.tsx` menangkap kedua event tersebut, menghitung kenaikan **Level** secara akurat (`while (curExp >= curLvl * 100) { curExp -= curLvl * 100; curLvl++; }`), menambahkan **Koin Emas** ke dompet pemain, menyinkronkannya ke database MySQL melalui `/api/user/sync-progress` dan `/api/user/wallet/sync`, serta mengirim nilai kuis berstatus `'isReal' => true` ke `/api/game/leaderboard/submit`.

### 4. Interaksi Ekonomi & Layanan Publik (Bank, Pasar Makelar, Apotek, Kantor Polisi)
* **Input Pemain**:
  * Pemain masuk ke gedung layanan di kota dan berinteraksi dengan petugas/meja layanan untuk menabung koin di **Bank**, membeli bibit/menjual panen/menyewa properti di **Pasar & Makelar**, membeli vitamin stamina di **Apotek**, atau mengirim laporan pelanggaran di **Kantor Polisi**.
* **Respon Sistem**:
  * Seluruh penambahan dan pengurangan Koin Emas/Permata divalidasi oleh `SecurityWalletController.php` di server Laravel untuk mencegah kecurangan (*anti-cheat*), lalu disimpan permanen ke tabel `users` dan `player_reports` di MySQL.

### 5. Interaksi Sosial: Mengikuti (Follow) dengan Notifikasi Cooldown 30 Detik (Terima / Tolak / Abaikan / Hangus) & Voice Chat WebRTC
* **Input Pemain**:
  * Pemain A mengklik karakter Pemain B di dunia terbuka, lalu menekan tombol **Ikuti (Follow)** pada `ProfileModal`.
* **Respon Sistem**:
  * Server menyimpan relasi di `/api/social/follow` dan meneruskan paket `player:followed_by` melalui Socket.IO ke Pemain B.
  * Di layar Pemain B langsung muncul pop-up **`FriendRequestNotification.tsx`** dengan **timer hitung mundur 30 detik (Cooldown)** dan bar progres visual.
  * Pemain B dapat memilih 1 dari 3 tombol aksi sebelum 30 detik habis:
    1. **`TERIMA`**: Sistem otomatis mem-follow balik Pemain A (`/api/social/follow` + `sendFollow`), sehingga Pemain A dan Pemain B resmi menjadi **Teman (Mutual Follow)**.
    2. **`TOLAK`**: Sistem menolak permintaan mengikuti, menghapus Pemain A dari daftar pengikut (`/api/social/remove-follower`), dan memberi tahu Pemain A bahwa permintaannya ditolak.
    3. **`ABAIKAN`** *(atau jika waktu 30 detik habis / **Hangus**)*: Pop-up tertutup dan Pemain A tetap tercatat sebagai pengikut satu arah (*Follower*) tanpa menjadi teman mutual.
  * Untuk komunikasi suara (**Open Mic Voice Chat**), `VoiceChatManager.ts` menggunakan *WebRTC Peer-to-Peer* dengan *Web Audio API Highpass Filter (85Hz) + DynamicsCompressorNode + Opus 48kHz High-Bitrate (64kbps) + Adaptive Jitter Buffer (120ms)* sehingga suara antar pemain terdengar jernih, halus, dan bebas putus-putus.

