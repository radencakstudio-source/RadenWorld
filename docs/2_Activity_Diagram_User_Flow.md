# Dokumen 2: Activity Diagram & User Flow Diagram Sistem Permainan RadenWorld
**Nama Sistem**: RadenWorld — *2D Open World Multiplayer Education & Life Simulation*  
**Genre Permainan**: **Education & Life Simulation** (Edukasi & Simulasi Kehidupan)

---

## 1. Activity Diagram Utama (Cross-Functional Swimlane & User Flow)

> [!IMPORTANT]
> Diagram di bawah ini menggambarkan alur aktivitas lengkap (*End-to-End Activity & User Flow Diagram*) dari saat pemain membuka aplikasi di Beranda, masuk ke dunia simulasi terbuka, menjalankan siklus **Edukasi**, **Simulasi Kehidupan (Panen `[F]`/Mobile, Memancing, Ekonomi)**, hingga **Interaksi Sosial (Follow Cooldown 30 Detik: Terima / Tolak / Abaikan / Hangus)** dan **Sinkronisasi Database MySQL**.

```mermaid
flowchart TD
    Start(["🟢 MULAI: Pemain Membuka Aplikasi RadenWorld"]) --> CheckAuth{"Sudah Memiliki Sesi\nAkun Valid?"}

    CheckAuth -- "Belum" --> AuthModal["Buka Modal Login / Registrasi / Google OAuth"]
    AuthModal --> AuthAPI["Server Laravel Memvalidasi Akun & Memuat Profil MySQL"]
    AuthAPI --> HomeLobby["Tampil Beranda Utama (Lobby: Pilih Server & Kustomisasi Avatar)"]

    CheckAuth -- "Sudah" --> HomeLobby
    HomeLobby --> ClickPlay["Pemain Menekan Tombol 'MULAI BERMAIN'"]
    ClickPlay --> InitWorld["Inisialisasi WorldScene (Phaser 3) & Koneksi Socket.IO (20Hz)"]
    InitWorld --> LoadState["Muat Saldo Dompet, Level, EXP, Inventaris & Kebun Tani dari MySQL"]

    LoadState --> OpenWorldHub{"Pilih Aktivitas di Dunia Terbuka\n(Education & Life Simulation)"}

    %% CABANG 1: EDUKASI (SEKOLAH & PERPUSTAKAAN)
    OpenWorldHub -- "1. Edukasi (Sekolah / Perpustakaan)" --> ChooseEdu{"Pilih Gedung\nPendidikan"}
    ChooseEdu -- "Gedung SD / SMP / SMA" --> SelectGrade["Pilih Jenjang Kelas (SD 1-6 / SMP 1-3 / SMA 1-3)"]
    SelectGrade --> EnterClass["Masuk Ruang Kelas (SchoolScene) & Interaksi Meja Belajar [E]"]
    EnterClass --> StudyOrQuiz{"Pilih Mode Belajar"}
    StudyOrQuiz -- "Baca Materi Kurikulum" --> GainStudyExp["Dapatkan +EXP Akademik"]
    StudyOrQuiz -- "Kerjakan Ujian Kuis" --> DoQuiz["Jawab 5 Soal Pilihan Ganda"]
    DoQuiz --> CalcScore["Hitung Nilai, Berikan Hadiah Koin Emas & +EXP"]
    CalcScore --> SaveLeaderboard["Simpan Skor Siswa (isReal: true) ke Leaderboard MySQL"]
    ChooseEdu -- "Perpustakaan Kota" --> ReadEncyclopedia["Baca Modul Ensiklopedia & Infografis Visual (+EXP)"]

    GainStudyExp --> CheckLevelUp
    SaveLeaderboard --> CheckLevelUp
    ReadEncyclopedia --> CheckLevelUp

    %% CABANG 2: SIMULASI KEHIDUPAN (BERTANI & MEMANCING)
    OpenWorldHub -- "2. Bertani & Panen Kebun" --> NearFarm["Dekati Petak Tanah Kebun Tani"]
    NearFarm --> CheckCropStage{"Status Tanaman\ndi Dekat Pemain?"}
    CheckCropStage -- "Petak Kosong" --> PlantSeed["Pilih Bibit di Hotbar & Tanam [F] / Tombol Mobile"]
    CheckCropStage -- "Belum Disiram" --> WaterCrop["Siram Tanaman dengan Penyiram [F] / Tombol Mobile"]
    CheckCropStage -- "Matang Siap Panen (Stage 3)" --> HarvestCrop["Tekan Shortcut [F], [E], atau Tombol Mobile '🌾 PANEN'\n(Prioritas Utama Tanpa Harus Ganti Alat)"]
    HarvestCrop --> HarvestReward["Hasil Panen Masuk Tas Inventaris +25 EXP & Reset Petak"]
    PlantSeed --> SyncTrees["Sinkronisasi State Lahan ke /api/world/trees"]
    WaterCrop --> SyncTrees
    HarvestReward --> SyncTrees
    SyncTrees --> CheckLevelUp

    OpenWorldHub -- "3. Memancing & Rekreasi" --> GoFishing["Lempar Kail di Tepi Sungai [F] & Mainkan Minigame Tarik Ikan"]
    GoFishing --> CatchFish["Ikan Tertangkap -> Masuk Tas + Hadiah Koin Emas & +EXP"]
    CatchFish --> CheckLevelUp

    %% CABANG 3: EKONOMI & LAYANAN PUBLIK
    OpenWorldHub -- "4. Ekonomi & Layanan Kota" --> ChooseService{"Pilih Gedung Layanan"}
    ChooseService -- "Bank Kota" --> BankTx["Setor Tabungan / Tarik Tunai / Klaim Bunga Harian 5%"]
    ChooseService -- "Pasar & Makelar" --> MarketTx["Beli Bibit Tani / Jual Hasil Panen & Ikan / Sewa Properti"]
    ChooseService -- "Apotek Kota" --> PharmacyTx["Konsultasi Kesehatan & Beli Vitamin Stamina"]
    ChooseService -- "Kantor Polisi" --> PoliceTx["Kirim Laporan Pelanggaran Pemain ke Tabel player_reports"]

    BankTx --> SyncServerDB
    MarketTx --> SyncServerDB
    PharmacyTx --> SyncServerDB
    PoliceTx --> SyncServerDB

    %% CABANG 4: SOSIAL & FOLLOW COOLDOWN 30 DETIK
    OpenWorldHub -- "5. Sosial & Mengikuti Pemain" --> InspectPlayer["Klik Karakter Pemain Lain -> Buka Kartu Profil"]
    InspectPlayer --> ClickFollow["Tekan Tombol 'IKUTI (FOLLOW)'"]
    ClickFollow --> SendFollowNotif["Simpan ke /api/social/follow & Kirim Notifikasi Socket.IO ke Target"]
    SendFollowNotif --> TargetPopup["Layar Pemain Target Menampilkan Pop-up Cooldown 30 Detik"]
    TargetPopup --> TargetDecision{"Keputusan Pemain Target\n(Dalam Waktu <= 30 Detik)"}

    TargetDecision -- "Tekan [TERIMA]" --> MutualFriend["Otomatis Ikuti Balik -> Keduanya Resmi Berteman (Mutual Follow)"]
    TargetDecision -- "Tekan [TOLAK]" --> RejectFollow["Tolak Pengikut -> Hapus dari Daftar Pengikut & Batalkan Follow Pengirim"]
    TargetDecision -- "Tekan [ABAIKAN]" --> IgnoreFollow["Tutup Pop-up -> Pengirim Tetap Menjadi Pengikut Satu Arah"]
    TargetDecision -- "Waktu 30 Detik Habis (Hangus)" --> TimeoutFollow["Notifikasi Hangus Otomatis -> Pengirim Tetap Menjadi Pengikut"]

    MutualFriend --> SyncServerDB
    RejectFollow --> SyncServerDB
    IgnoreFollow --> SyncServerDB
    TimeoutFollow --> SyncServerDB

    %% PROSES NAIK LEVEL & PERSISTENSI DATABASE
    CheckLevelUp{"Apakah EXP >= Level * 100?"}
    CheckLevelUp -- "Ya" --> LevelUp["Level Naik (+1), Siarkan Level Baru ke Pemain Lain & Bunyikan Fanfare"]
    CheckLevelUp -- "Tidak" --> SyncServerDB
    LevelUp --> SyncServerDB["Sinkronisasi Otoritatif ke MySQL (/api/user/sync-progress & /api/user/wallet/sync)"]

    SyncServerDB --> ContinuePlay{"Lanjut Bermain?"}
    ContinuePlay -- "Ya" --> OpenWorldHub
    ContinuePlay -- "Tidak (Logout / Tutup)" --> EndNode(["🔴 SELESAI: State Tersimpan Aman di MySQL & LocalStorage"])
```

---

## 2. Diagram Alur Swimlane Tekstual (Pemain — Antarmuka Client — Server Database)

```text
+----------------------------------+--------------------------------------+--------------------------------------+
|        PEMAIN (PENGGUNA)         |   CLIENT GAME (REACT + PHASER 3)     |   SERVER (LARAVEL MYSQL & SOCKET)    |
+----------------------------------+--------------------------------------+--------------------------------------+
| 1. Buka aplikasi & Login Akun    | -> Validasi input & panggil API      | -> Cek kredensial di tabel `users`   |
|                                  | <- Terima profil, Level, EXP, Koin   | <- Kirim JSON profil + token         |
|                                  |                                      |                                      |
| 2. Klik "MULAI BERMAIN"          | -> Muat WorldScene & hubungkan       | -> Daftarkan socket ke room dunia    |
|    di Beranda Utama              |    Socket.IO + WebRTC Voice          |    & broadcast posisi 20Hz           |
|                                  |                                      |                                      |
| 3. Masuk Sekolah (SD/SMP/SMA)    | -> Tampilkan SchoolGradeSelectModal  |                                      |
|    & kerjakan Kuis di Meja       | -> Hitung nilai kuis, pancarkan      | -> Simpan skor (`isReal: true`)      |
|                                  |    `gain-exp` & `quiz-gold-earned`   | -> Update `exp`, `level`, & `gold`   |
|                                  |                                      |    di MySQL secara otoritatif        |
|                                  |                                      |                                      |
| 4. Dekati tanaman matang di      | -> Deteksi `hasRipeCropNearPlayer`   |                                      |
|    Kebun & tekan [F] atau        | -> Ubah tombol mobile jadi "PANEN"   |                                      |
|    tombol mobile "🌾 PANEN"      | -> Eksekusi panen instan +25 EXP     | -> Simpan state kebun ke             |
|                                  |    meski memegang alat pancing       |    `/api/world/trees` & `sync-progress`|
|                                  |                                      |                                      |
| 5. Klik Pemain Lain & tekan      | -> Update state optimistik & kirim   | -> Simpan ke tabel `social_follows`  |
|    tombol "IKUTI (FOLLOW)"       |    event `player:follow`             | -> Teruskan event `player:followed_by`|
|                                  |                                      |    ke klien Pemain Target            |
|                                  |                                      |                                      |
| 6. Pemain Target melihat Pop-up  | -> Jalankan timer mundur 30 detik:   |                                      |
|    Notifikasi Cooldown 30 Detik  |    - Klik [TERIMA]  -> Follow balik  | -> Catat Mutual Follow (Teman Resmi) |
|    (Terima / Tolak / Abaikan)    |    - Klik [TOLAK]   -> Hapus pengikut| -> Hapus baris di `social_follows`   |
|                                  |    - Klik [ABAIKAN] / 30d Hangus     | -> Pertahankan pengikut satu arah    |
+----------------------------------+--------------------------------------+--------------------------------------+
```

---

## 3. Penjelasan Tahapan User Flow

1. **Tahap Orientasi & Masuk Dunia (`HomeScreen` -> `WorldScene`)**:
   - Pemain masuk menggunakan akun terdaftar atau Google OAuth. Sistem memuat `level`, `exp`, `gold`, `diamonds`, dan kustomisasi avatar langsung dari database MySQL melalui `/api/user/wallet` tanpa pernah mereset level kembali ke 1.
2. **Siklus Edukasi Akademik (`SchoolScene` & `LibraryScene`)**:
   - Pemain memilih gedung **SD (Kelas 1–6)**, **SMP (Kelas 1–3)**, **SMA (Kelas 1–3)**, atau **Perpustakaan Kota**.
   - Membaca materi kurikulum dan menyelesaikan kuis memberikan **EXP** dan **Koin Emas** yang langsung meningkatkan Level pemain (`kebutuhan EXP = Level * 100`) serta mencatat nama siswa di Papan Peringkat Sekolah.
3. **Siklus Simulasi Kehidupan & Produksi (`WorldFarming` & `FishingMinigame`)**:
   - Pemain menanam bibit, menyiram tanaman, dan ketika tanaman matang (`stage === 3`), sistem secara otomatis mengaktifkan indikator siap panen. Pemain cukup menekan **`[F]`** di PC atau tombol **`🌾 PANEN`** di layar sentuh mobile untuk langsung memanen tanpa perlu melepas Joran Pancing dari tangan.
   - Hasil panen dan tangkapan ikan dapat dijual di **Pasar & Makelar** untuk memperoleh Koin Emas, lalu ditabung di **Bank Kota** untuk mendapatkan bunga harian 5%.
4. **Siklus Interaksi Sosial & Notifikasi Mengikuti 30 Detik (`FriendRequestNotification`)**:
   - Saat Pemain A mengikuti Pemain B, Pemain B menerima pop-up notifikasi dengan **cooldown 30 detik (otomatis hangus setelah 30 detik)** beserta 3 opsi: **TERIMA** (otomatis mengikuti balik dan menjadi Teman), **TOLAK** (menolak diikuti dan menghapus dari daftar pengikut), atau **ABAIKAN** (menutup notifikasi dan membiarkan Pemain A sebagai pengikut).

