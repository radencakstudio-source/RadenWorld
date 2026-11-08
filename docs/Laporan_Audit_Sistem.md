# Laporan Audit Sistem Menyeluruh — RadenWorld (Education & Life Simulation)

> [!IMPORTANT]
> **Genre Resmi**: **2D Open World Multiplayer Education & Life Simulation** (*Edukasi & Simulasi Kehidupan — Tanpa Unsur RPG*). Seluruh referensi istilah RPG pada endpoint API (`/api/game/home`), judul halaman (`welcome.blade.php`), dan server multiplayer (`server/game-server.js`) telah dibersihkan dan diseragamkan menjadi **Education & Life Simulation**.

---

## 1. Ringkasan Temuan Bug & Perbaikan yang Telah Diterapkan

| No | Modul / Fitur | Temuan Masalah / Potensi Bug Sebelumnya | Solusi & Perbaikan Permanen yang Diterapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Sistem Level & EXP Reset ke Level 1** | 1. `WorldScene.ts` dan `HouseScene.ts` sebelumnya memancarkan `level: 1` secara *hardcoded* pada event `player-stats-updated` setiap pemain berpindah grid, sehingga menimpa `playerStats.level` kembali ke `1`.<br>2. `handleStartGame` dan `isDirectInGame` di `GameApp.tsx` menginisialisasi `level = 1` tanpa membaca `u.level` dari `localStorage` / server.<br>3. Rumus kenaikan level antara frontend (`level * 100` dengan reset `exp`) dan backend `/api/user/sync-progress` tidak sinkron. | 1. Menghapus `level: 1` *hardcoded* dari payload `player-stats-updated` di `WorldScene.ts` dan `HouseScene.ts`, serta menjaga `Math.max(prev.level, stats.level)` di `GameApp.tsx`.<br>2. Membaca `u.level` dan `u.exp` pada `handleStartGame`, `isDirectInGame`, dan `/api/user/wallet` (`SecurityWalletController.php`).<br>3. Menyeragamkan perhitungan kenaikan level di `GameApp.tsx` (`handleGainExp`, `expInterval`) dan `/api/user/sync-progress` (`routes/web.php`) serta menyiarkan kenaikan level via `sendPlayerUpdate({ level })`. | ✅ **Tuntas & Tersimpan di MySQL** |
| **2** | **Shortcut Panen `[F]` & Tombol Mobile (`🌾 PANEN`)** | Sebelumnya di `CharacterController.ts` (`handleFlexibleToolKeyDown`), pengecekan Joran Pancing (Slot 1 default) dieksekusi lebih dulu sebelum pengecekan panen. Akibatnya, jika pemain memegang Joran Pancing saat berdiri di dekat tanaman matang dan menekan `[F]` atau tombol mobile, karakter justru melempar kail pancing alih-alih memanen. | 1. Memindahkan `WorldFarming.hasRipeCropNearPlayer(this.player)` ke **Prioritas Utama (Nomor 1)** di `CharacterController.ts` (baris 549) dan `WorldScene.ts` (`triggerCurrentInteraction`).<br>2. Menambahkan event `near-ripe-crop-changed` sehingga tombol alat di layar sentuh mobile (`VirtualControls.tsx`) otomatis berubah menjadi **`🌾 PANEN`** saat berada di dekat tanaman siap panen.<br>3. Menambahkan hadiah **`+25 EXP`** setiap kali memanen tanaman (`WorldFarming.ts`) dan menangkap ikan (`CharacterController.ts`). | ✅ **Tuntas (PC `[F]`/`[E]` & Mobile `🌾 PANEN`)** |
| **3** | **Notifikasi Mengikuti (Follow) Cooldown 30 Detik (Terima / Tolak / Abaikan / Hangus)** | Saat Pemain A mengikuti Pemain B via tombol *Follow*, Pemain B hanya melihat teks kecil di chat tanpa pop-up konfirmasi interaktif, dan durasi notifikasi pertemanan lama adalah 60 detik tanpa tombol *Abaikan*. | 1. Mengubah `FriendRequestNotification.tsx` menjadi **Cooldown 30 Detik (`COUNTDOWN_SECONDS = 30`)** dengan indikator **`(Hangus)`** dan **3 tombol aksi**: **`TERIMA`**, **`TOLAK`**, dan **`ABAIKAN`**.<br>2. Menghubungkan `handleFollowedBy` di `GameApp.tsx` agar otomatis memunculkan pop-up 30 detik di layar pemain yang diikuti.<br>3. **TERIMA** otomatis mem-follow balik & menjadikan Teman Resmi; **TOLAK** menghapus pengikut & membatalkan follow; **ABAIKAN** / **Hangus (30 detik habis)** menutup pop-up dan mempertahankan status pengikut satu arah. | ✅ **Tuntas & Real-Time Socket.IO + MySQL** |
| **4** | **Penyimpanan Hadiah Koin Kuis Sekolah & Ganti Avatar** | `SchoolSubjectsModal.tsx` memancarkan `quiz-gold-earned` dan `WardrobeModal.tsx` memancarkan `avatar-updated`, namun `GameApp.tsx` belum menangkap kedua event tersebut untuk disinkronkan ke dompet MySQL dan Socket.IO. | Menambahkan listener `quiz-gold-earned` (langsung menambah `playerGold` + memanggil `syncWalletWithServer(reward, 0, 'school_quiz_reward')`) dan `avatar-updated` (menyimpan ke `localStorage`, state React, dan menyiarkan `sendPlayerUpdate({ avatar })`) di `GameApp.tsx`. | ✅ **Tuntas & Tersimpan di MySQL** |
| **5** | **Skor Siswa di Papan Peringkat Sekolah** | Endpoint `/api/game/leaderboard/submit` belum menyertakan flag `'isReal' => true`, sedangkan pembacaan leaderboard memfilter `'isReal' === true`. | Menambahkan `'isReal' => true` pada penyimpanan skor di `/api/game/leaderboard/submit` (`routes/web.php` baris 1885 & 1899). | ✅ **Tuntas** |

---

## 2. Audit Penyimpanan Data (Data Persistence Matrix)

| Subsistem | Data yang Disimpan | Penyimpanan Lokal (Client) | Penyimpanan Server (MySQL / File) | Endpoint API Terkait | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Akun & Autentikasi** | Nama, Email, Password Hash, Google ID, Tanggal Lahir, Role | `raden_player_user`, `raden_auth_token` | Tabel `users` (MySQL) | `/api/auth/register`, `/api/auth/login`, `/api/auth/google-sync` | ✅ **Tersimpan** |
| **Progres Level & EXP** | Level Karakter (`1–99`), EXP Aktif | `raden_player_user` (`level`, `exp`) | Tabel `users` (`level`, `exp`) | `/api/user/sync-progress`, `/api/user/wallet` | ✅ **Tersimpan** |
| **Dompet & Ekonomi** | Koin Emas (`gold`), Permata (`diamonds`), Tabungan Bank | `raden_player_gold`, `raden_player_diamonds`, `raden_bank_account_v1` | Tabel `users` (`gold`, `diamonds`) | `/api/user/wallet`, `/api/user/wallet/sync` | ✅ **Tersimpan** |
| **Inventaris & Hotbar** | 30 Slot Tas + 6 Slot Hotbar (Bibit, Panen, Ikan, Alat) | `raden_inventory_v2` | Sinkronisasi Koin/Item saat transaksi Pasar & Apotek | `/api/user/wallet/sync` | ✅ **Tersimpan** |
| **Kebun Tani & Pohon** | Petak Tanaman (`stage 0–3`), Waktu Siram, Pohon Kota | State `WorldFarming` | `storage/app/world_trees.json` | `/api/world/trees` (`GET` & `POST`) | ✅ **Tersimpan** |
| **Edukasi & Kuis** | Jenjang Kelas, Skor Ujian Kuis SD/SMP/SMA | `raden_school_{type}_grade` | Tabel `leaderboards` / `leaderboard.json` | `/api/game/leaderboard`, `/api/game/leaderboard/submit` | ✅ **Tersimpan** |
| **Sosial & Pertemanan** | Daftar Teman, Mengikuti (`following`), Pengikut (`followers`), Like | `raden_friends_list`, `raden_following_list`, `raden_followers_list` | Tabel `social_follows`, `profile_likes` (MySQL) | `/api/social/follow`, `/api/social/unfollow`, `/api/social/remove-follower`, `/api/social/like` | ✅ **Tersimpan** |
| **Laporan Polisi** | Tiket Laporan Pelanggaran Pemain | Riwayat sesi di `PoliceReportModal` | Tabel `player_reports` (MySQL) | `/api/reports` (`GET` & `POST`) | ✅ **Tersimpan** |

---

## 3. Audit Data Dummy / Kosong di Seluruh Sistem

1. **Apakah ada modul atau halaman yang kosong?**
   - **Tidak ada.** Seluruh gedung di peta kota (Gedung **SD**, **SMP**, **SMA**, **Perpustakaan Kota**, **Cafe Raden Lounge**, **Bank Kota**, **Pasar & Makelar**, **Apotek Kota**, **Kantor Polisi**, dan **Rumah Pribadi**) memiliki interior/modal interaktif yang berfungsi penuh.
2. **Apakah masih ada data *dummy*?**
   - **Materi Kurikulum & Kuis (`SchoolSubjectsModal.tsx` & `LibraryMaterialsModal.tsx`)**: Berisi ratusan materi pelajaran dan soal ujian nyata untuk jenjang SD (Kelas 1–6), SMP (Kelas 1–3), dan SMA (Kelas 1–3).
   - **Papan Peringkat (`routes/web.php`)**: Telah diatur agar hanya menampilkan skor asli pemain (`isReal === true`), dan otomatis menampilkan papan kosong yang bersih jika belum ada siswa yang mengikuti kuis (tidak lagi menampilkan nama siswa dummy).
   - **Daftar Lagu Jukebox Cafe (`JukeboxModal.tsx`)**: Menggunakan synthesizer Web Audio API internal (5 trek melodi *Cozy Cafe*, *Lo-Fi Study*, *Bossa Nova*, *Acoustic Breeze*, dan *Night Jazz*) yang langsung menghasilkan musik asli tanpa file kosong, serta siap ditambahkan file MP3 eksternal kapan saja sesuai permintaan pengguna sebelumnya.

