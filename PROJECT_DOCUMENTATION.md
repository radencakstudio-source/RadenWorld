# DOKUMENTASI LENGKAP ARSITEKTUR & FUNGSI FILE RADENWORLD
> **Catatan Pengembang & AI Assistant:**
> File ini dibuat sebagai rujukan utama (*Single Source of Truth*). Jika ada perubahan kode atau pergantian sesi chat AI, AI maupun pengembang dapat membaca file ini untuk memahami struktur, fungsi tiap file, serta alur kerja sistem secara menyeluruh.

---

## 1. LOKASI FOLDER ASSETS
Folder aset game berada di:
* **Path Lokal Komputer:** `D:\laragon\laragon\www\RadenWorld\public\assets`
* **Path Proyek:** `public/assets/`
* **Akses URL Web:** `http://127.0.0.1:8000/assets/...` (atau virtual host Laragon)

### Mengapa di `public/assets`?
Pada arsitektur framework Laravel, hanya folder `public/` yang diekspos langsung oleh web server (Nginx/Apache). Menempatkan aset di sini membuat file gambar, suara, dan data peta dapat diunduh langsung oleh browser dan engine (Phaser 3 / PixiJS) dengan kecepatan maksimal tanpa beban routing PHP.

### Struktur Subfolder Assets:
```text
public/assets/
├── sprites/
│   ├── characters/      # player.svg, npc.svg (sprite karakter pemain & NPC)
│   ├── monsters/        # slime.svg (sprite monster)
│   └── items/           # chest.svg (peti harta karun interaktif)
├── tilesets/            # tree.svg, rock.svg (elemen alam, pohon, batu, dekorasi)
├── maps/                # File JSON Tilemap (kompatibel dari Tiled Map Editor)
├── audio/
│   ├── bgm/             # Background music (.mp3, .ogg)
│   └── sfx/             # Efek suara langkah kaki, tebasan, klik UI
├── ui/
│   ├── hud/             # Frame avatar, HP bar frame, border dialog
│   └── icons/           # Ikon skill, inventori, item
└── README.md            # Panduan format penambahan file aset baru
```

---

## 2. STRUKTUR 3 RUTE URL UTAMA (MULTI-ROUTE SPA SYSTEM)
RadenWorld mengimplementasikan sistem Multi-Route Single Page Application (SPA) yang tersinkronisasi penuh dengan **HTML5 History API** (`pushState` dan `popstate`), sehingga pemain dapat menggunakan tombol navigasi browser (Back/Forward) atau mengakses URL langsung:

| URL Route | Halaman & Lingkungan | Fitur & Karakteristik |
| :--- | :--- | :--- |
| **`http://localhost:8000/`** | **Lobby / Beranda Utama** | • Tampilan antarmuka beranda interaktif dengan **4 Tombol di Sisi Kiri**:<br>&nbsp;&nbsp;1. **1. MASUK** (Login akun terdaftar, pendaftaran/register akun baru dengan kustomisasi avatar, lupa password, opsi Google & Facebook).<br>&nbsp;&nbsp;2. **2. SETTING** (Pilihan bahasa ID/EN, volume BGM & SFX, mute, mode kontrol PC / Mobile Virtual D-Pad).<br>&nbsp;&nbsp;3. **3. CREDIT** (Daftar tim pengembang & engine).<br>&nbsp;&nbsp;4. **4. EXIT** (Tombol keluar dari permainan).<br>• Palet 2 warna minimalis: Amber Gold (`#f59e0b`) & Dark Obsidian (`#0a0f1d`). |
| **`http://localhost:8000/home/{privateId}`** | **Safe Room / Rumah Pribadi (Kamar Aman)** | • Ruang aman pribadi (*safe zone*) milik pemain dengan identifier unik `{privateId}` (misal: `safe-01` atau `safe-1-ab3f`).<br>• **Tanpa pemain lain** (khusus privat pemain sendiri).<br>• Lantai bermotif **kotak catur persegi** gelap & terang (kayu tua `#451a03` & kayu amber `#854d0e`).<br>• Objek interaktif:<br>&nbsp;&nbsp;• **Lemari Pakaian** (`[E]`): Membuka WardrobeModal untuk mengganti gender, warna kulit, baju, celana, topi.<br>&nbsp;&nbsp;• **Kasur Empuk** (`[E]`): Beristirahat dengan status tidur `Zzz...`.<br>&nbsp;&nbsp;• **Dapur** (`[E]`): Memasak sup hangat.<br>&nbsp;&nbsp;• **Kamar Mandi** (`[E]`): Mandi & cuci muka.<br>&nbsp;&nbsp;• **Pintu Keluar** (`[E]`): Keluar rumah menuju ke Open World (`/world`).<br>• HUD Kiri Atas: Tombol Profile, Nama Karakter, Level, Chat.<br>• HUD Kiri Bawah: Nama Ruangan + Safe Room ID, Koordinat Grid Catur `POSISI GRID: (X: ..., Y: ...)` (tanpa koordinat pixel). |
| **`http://localhost:8000/world`** | **Open World Multiplayer** | • Dunia terbuka luas (3200x3200 pixel) berpola **kotak catur rumput** hijau gelap (`#14532d`) & hijau terang (`#16a34a`).<br>• **Multiplayer Real-time**: Terhubung ke WebSocket Node.js port 3001, melihat pergerakan pemain lain secara mulus (Linear Interpolation Lerp).<br>• **NPC Interaktif**:<br>&nbsp;&nbsp;• Pandai Besi Arya (Blacksmith) di Sanctuary Plaza.<br>&nbsp;&nbsp;• Alkemis Sari (Alchemist) di toko ramuan.<br>• **Monster Slime** yang berkeliaran di alam liar.<br>• **Bangunan & Toko**: Bangunan kota, pohon, batu alam, dan peti harta karun.<br>• **Pintu Rumah Pemain**: Terletak di koordinat (1520, 1750), pemain dapat menekan `[E]` untuk masuk kembali ke Rumah Pribadi (`/home/{privateId}`). |
| **`http://localhost:8000/admin/{adminToken}`** | **Portal Super Admin (Pusat Kendali)** | • **Ruang Kendali Eksklusif Super Admin** dengan Random Token ID berkeamanan tinggi (misal: `/admin/raden-9b0b-975f`).<br>• **Perlindungan Akses**: Hanya dapat diakses oleh Super Admin (`radencakstudio@gmail.com` / `RADEN`). Percobaan akses tanpa hak akan otomatis ditolak (HTTP 403 Forbidden).<br>• **Tombol Akses**: Tombol **`🌀 MASUK KE PORTAL ADMIN (TELEPORT)`** terletak tepat **di atas tombol Tutup Profile** pada `ProfileModal`.<br>• **Fitur Pusat Kendali**:<br>&nbsp;&nbsp;• 👑 **Tahta Agung Pencipta Raden** dengan aura emas bercahaya.<br>&nbsp;&nbsp;• 📢 **Konsol Broadcast**: Siaran pengumuman server resmi (`/announce`).<br>&nbsp;&nbsp;• 👥 **Konsol Database**: Sensus jumlah akun pemain terdaftar.<br>&nbsp;&nbsp;• ⚡ **Konsol Godmode & Kecepatan**: Buff kecepatan kilat 400 Px/s.<br>&nbsp;&nbsp;• 🌀 **Gerbang Portal Keluar**: Teleportasi instan kembali ke `/world` atau `/home/{safeId}`. |

---

## 3. TEKNOLOGI & ENGINE YANG DIGUNAKAN
1. **Laravel 12 (PHP 8.2+)**: Backend API, database SQLite, sistem route, dan penampil view utama Blade.
2. **React 19**: Frontend antarmuka (UI/HUD, jendela obrolan, form pemilihan karakter, panduan kontrol).
3. **Phaser 3**: Engine utama 2D HTML5 Canvas/WebGL yang mengelola fisika (Arcade), sistem kamera, scene, dan peta Open World.
4. **PixiJS 8 (`pixi.js`)**: Engine render 2D WebGL berkecepatan tinggi, digunakan untuk efek partikel interaktif, efek aura magis, atau mini-game independen.
5. **TypeScript**: Bahasa pemrograman berorientasi objek (OOP) murni yang menjamin keamanan tipe (*type safety*), enkapsulasi, dan pewarisan kelas (*inheritance*).
6. **Socket.io & Node.js**: Sinkronisasi data multiplayer real-time 60 FPS (pergerakan koordinat, arah hadap, balon kata, dan monster).

---

## 4. RINCIAN TIAP FILE & DAFTAR FUNGSINYA

### A. Game Entities (OOP Makhluk Hidup)

#### 1. `resources/js/game/entities/Entity.ts`
* **Fungsi Utama:** Kelas induk abstrak (*Abstract Base Class*) yang mewarisi `Phaser.GameObjects.Container`. Menggabungkan sprite, nameplate nama, bar HP, dan balon obrolan menjadi satu objek terpadu.
* **Metode & Fungsi:**
  * `constructor(scene, x, y, id, name, hp, maxHp, speed)`: Menginisialisasi kontainer, mendaftarkan body fisika Arcade, membuat teks nama karakter (`nameTag`), dan menggambar bar darah (`healthBar`).
  * `getEntityId(): string`: Mengembalikan identifier unik entitas.
  * `getEntityName(): string`: Mengembalikan nama karakter entitas.
  * `getHealth(): number`: Mengembalikan HP saat ini.
  * `getMaxHealth(): number`: Mengembalikan batas maksimum HP.
  * `getDirection(): Direction`: Mengembalikan arah hadap entitas ('up' | 'down' | 'left' | 'right').
  * `updateHealth(hp, maxHp)`: Memperbarui nilai HP dan memicu render ulang bar darah.
  * `drawHealthBar()`: Menggambar grafis bar HP dengan gradasi warna (Hijau jika >50%, Kuning jika >20%, Merah jika kritis).
  * `showSpeechBubble(message, durationMs)`: Membuat balon obrolan (*speech bubble*) putih di atas kepala karakter selama durasi tertentu (default: 4 detik).
  * `abstract update(time, delta): void`: Metode abstrak siklus game loop yang wajib diisi oleh kelas turunan.

#### 2. `resources/js/game/entities/Player.ts`
* **Fungsi Utama:** Kelas turunan `Entity` untuk mengelola karakter lokal pemain (yang dikendalikan oleh pengguna via keyboard).
* **Metode & Fungsi:**
  * `constructor(scene, x, y, id, name, characterClass, hp, maxHp)`: Memuat sprite lokal, menyiapkan input keyboard, dan mencatat posisi awal.
  * `setupInput(scene)`: Mendaftarkan penangkap tombol keyboard WASD dan tombol Panah.
  * `getCharacterClass(): CharacterClass`: Mengambil kelas role karakter pemain.
  * `update(time, delta)`: Loop utama 60 FPS:
    * Menangkap tombol panah & WASD.
    * Menghitung kecepatan vektor `vx` dan `vy` serta normalisasi diagonal ($0.7071$).
    * Membalik arah skala sprite (menghadap kiri/kanan).
    * Mengaktifkan animasi langkah berjalan.
    * Mengirim paket posisi ke `NetworkManager` setiap 60ms saat karakter bergerak.
  * `handleWalkAnimation(moving)`: Mengontrol tween melompat kecil (bobbing) saat karakter melangkah.
  * `destroy(fromScene)`: Membersihkan tween animasi saat karakter dihancurkan.

#### 3. `resources/js/game/entities/RemotePlayer.ts`
* **Fungsi Utama:** Kelas turunan `Entity` yang mewakili pemain lain di open world yang terhubung via internet.
* **Metode & Fungsi:**
  * `constructor(...)`: Memuat sprite, memberikan pewarnaan (*tint*) berdasarkan kelas role, dan menonaktifkan fisika independen.
  * `setNetworkState(x, y, direction, isMoving)`: Menerima data koordinat terbaru dari server untuk target interpolasi.
  * `update(time, delta)`: Menjalankan **Linear Interpolation (Lerp)** dengan faktor `0.2` agar pergerakan pemain lain sangat mulus dan bebas patah-patah.
  * `handleWalkAnimation(moving)`: Memainkan animasi langkah berjalan sesuai status `isMoving`.

#### 4. `resources/js/game/entities/Monster.ts`
* **Fungsi Utama:** Kelas turunan `Entity` untuk monster alam liar (Slime) yang berkeliaran di open world.
* **Metode & Fungsi:**
  * `constructor(...)`: Memuat sprite slime dan memulai animasi bernafas kenyal (*squash & stretch tween*).
  * `setNetworkTarget(x, y)`: Menerima target koordinat jelajah baru dari server.
  * `update(time, delta)`: Melakukan interpolasi posisi perlahan menuju titik jelajah.

---

### B. Game Core & Network

#### 5. `resources/js/game/core/NetworkManager.ts`
* **Fungsi Utama:** Singleton pengelola koneksi WebSocket via `Socket.io` ke server game.
* **Metode & Fungsi:**
  * `getInstance()`: Mengambil instansi tunggal Singleton `NetworkManager`.
  * `connect(url)`: Membuka koneksi socket ke server (default: `http://localhost:3001`).
  * `getConnected(): boolean`: Mengecek apakah socket sedang terhubung.
  * `joinGame(name, characterClass)`: Mengirim paket `player:join` ke server.
  * `sendMovement(x, y, direction, isMoving)`: Mengirim paket perpindahan `player:move`.
  * `sendChat(text)`: Mengirim paket chat `chat:message`.
  * `onWorldInit(callback)`: Menerima inisialisasi state awal open world dari server.
  * `onPlayerJoined(callback)`: Menangkap event saat pemain baru masuk.
  * `onPlayerMoved(callback)`: Menangkap event saat ada pemain bergerak.
  * `onPlayerLeft(callback)`: Menangkap event saat pemain keluar.
  * `onChatBroadcast(callback)`: Menerima siaran chat global.
  * `onMonstersSync(callback)`: Menerima sinkronisasi monster.
  * `disconnect()`: Memutus koneksi secara bersih.

#### 6. `resources/js/game/core/EventBus.ts`
* **Fungsi Utama:** Jembatan decoupling berbasis EventEmitter antara sistem UI React dan Phaser Game Engine.
* **Daftar Event:**
  * `game-ready`: Sinyal bahwa Phaser sudah siap.
  * `join-game`: Permintaan React Lobby ke Phaser untuk spawn pemain.
  * `player-stats-updated`: Pengiriman data koordinat & HP ke React HUD.
  * `player-count-updated`: Pengiriman jumlah pemain online ke React HUD.
  * `send-chat`: Permintaan kirim chat dari React ke Game Engine.
  * `new-chat-message`: Siaran chat baru untuk ditampilkan di React ChatBox.

#### 7. `resources/js/game/core/GameConfig.ts`
* **Fungsi Utama:** Factory konfigurasi Phaser 3.
* **Fungsi:**
  * `createGameConfig(parentContainerId)`: Menghasilkan objek konfigurasi Phaser dengan mode rendering AUTO (WebGL/Canvas), Arcade Physics (gravity 0), Skala adaptif RESIZE, serta mendaftarkan BootScene dan WorldScene.

---

### C. Game Scenes (Phaser 3)

#### 8. `resources/js/game/scenes/BootScene.ts`
* **Fungsi Utama:** Scene pemuat awal (Preloader) aset game.
* **Metode:**
  * `preload()`: Menggambar progress bar (0-100%) dan memuat aset SVG dari `/assets/...`.
  * `create()`: Membuat tekstur cadangan jika file eksternal tidak ditemukan, lalu beralih ke `WorldScene`.
  * `createFallbackTextures()`: Menghasilkan grafis lingkaran prosedural sebagai cadangan anti-crash.

#### 9. `resources/js/game/scenes/WorldScene.ts`
* **Fungsi Utama:** Scene utama dunia Open World 2D (ukuran 3200 × 3200 pixel).
* **Fitur & Metode:**
  * `createWorldEnvironment()`: Merender tanah bermotif catur (*Checkerboard Grid*) dengan kotak gelap (`#14532d`) dan kotak terang (`#16a34a`) yang terulang di seluruh 3200x3200 pixel map menggunakan `TileSprite`, jalan batu, danau, monumen air mancur, dan NPC Sage Raden.
  * `spawnLocalPlayer(name, avatar)`: Men-spawn karakter pemain dengan avatar kustomisasi gender, kulit, baju, celana, dan topi.
  * `setupMultiplayerListeners()`: Sinkronisasi realtime pemain lain dan monster.

#### 10. `resources/js/game/utils/AvatarGenerator.ts`
* **Fungsi Utama:** Generator tekstur dinamis Phaser 3 yang menggambar sprite avatar 2D secara instan berdasarkan data `IAvatarCustomization` (gender, skin color, shirt color, pants color, hat type).

---

### D. PixiJS Module

#### 11. `resources/js/game/pixi/PixiInteractivity.ts`
* **Fungsi Utama:** Modul percontohan PixiJS v8 untuk rendering interaktif WebGL/WebGPU tingkat lanjut.

---

### E. Frontend UI Components (React 19)

#### 12. `resources/js/game/ui/AvatarPreview.tsx`
* **Fungsi:** Komponen live preview SVG avatar yang merespons perubahan gender, warna kulit, baju, celana, dan topi secara langsung di modal autentikasi.

#### 13. `resources/js/game/ui/HomeScreen.tsx`
* **Fungsi:** Halaman Beranda Utama interaktif sebelum masuk ke dalam permainan.
* **Fitur 4 Tombol Menu:**
  1. **Tombol Masuk / Mulai**: Membuka `AuthModal` untuk login, pendaftaran akun baru, pemulihan kata sandi, serta login sosial Google & Facebook.
  2. **Tombol Setting**: Membuka `SettingsModal` untuk mengatur bahasa, audio volume, dan layout kontrol PC/Mobile.
  3. **Tombol Credit**: Membuka `CreditsModal` untuk melihat informasi pengembang game (**Raden**) dan teknologi yang dipakai.
  4. **Tombol Exit**: Membuka `ExitModal` untuk konfirmasi keluar dari permainan.

#### 12. `resources/js/game/ui/AuthModal.tsx`
* **Fungsi:** Modal autentikasi dengan pemisahan alur Masuk vs Daftar:
  * **Tab Masuk (Sudah Punya Akun)**: Input email/username & kata sandi, opsi "Lupa sandi?" di dalam tab Masuk (bukan tab terpisah), login sosial (Google & Facebook), dan **tanpa pemilihan avatar** (langsung masuk dengan avatar tersimpan).
  * **Tab Daftar (Akun Baru)**: Alur bertahap:
    * *Langkah 1*: Input Nama Karakter, Email, Kata Sandi, dan Konfirmasi Kata Sandi.
    * *Langkah 2*: Kustomisasi Avatar (Gender Laki-laki/Perempuan, Live Preview, warna kulit, warna baju, warna celana, dan topi avatar).
  * Menyimpan preferensi avatar ke `localStorage` dan meneruskannya ke game engine.

#### 13. `resources/js/game/ui/SettingsModal.tsx`
* **Fungsi:** Modal pengaturan game terpadu:
  * **Pilihan Bahasa**: Bahasa Indonesia, English, Basa Sunda, Basa Jawa.
  * **Pengaturan Suara/Audio**: Master Volume Slider, BGM Slider, SFX Slider, dan tombol Mute.
  * **Tata Letak Kontrol**: Mode PC (Keyboard WASD & Panah) vs Mode Mobile (Virtual D-Pad Layar Sentuh).
  * **Toggle Layar Penuh (Fullscreen)**: Memperbesar game ke mode layar penuh.

#### 14. `resources/js/game/ui/CreditsModal.tsx`
* **Fungsi:** Modal penghargaan untuk pengembang game:
  * **Kreator Utama:** Raden (Game Creator, World Architect & Lead Developer).
  * **Daftar Engine & Teknologi:** Laravel 12, React 19, Phaser 3, PixiJS 8, Node.js + Socket.io, TypeScript.

#### 15. `resources/js/game/ui/ExitModal.tsx`
* **Fungsi:** Dialog konfirmasi keluar permainan dengan opsi batal atau tutup game.

#### 16. `resources/js/game/ui/VirtualControls.tsx`
* **Fungsi:** Kontrol layar sentuh khusus ketika **Mode Mobile (HP)** diaktifkan di Settings:
  * Virtual D-Pad 4 arah (Atas, Bawah, Kiri, Kanan) di sudut kiri bawah layar.
  * Tombol Aksi Serang & Shortcut Chat di sudut kanan bawah layar.

#### 17. `resources/js/game/core/SoundManager.ts`
* **Fungsi:** Modul synthesizer efek suara instan berbasis Web Audio API (suara klik tombol UI, hover, buka modal, nada chord sukses).

#### 18. `resources/js/game/scenes/HouseScene.ts`
* **Fungsi:** Scene Rumah Pribadi Karakter (*Private Player House/Room*).
* **Fitur:** Pemain pertama kali memulai permainan di dalam rumah sendiri (bukan langsung di lapangan/plaza):
  * **Lantai Kotak Catur Persegi**: Seluruh lantai interior rumah menggunakan motif catur persegi 48x48 pixel dengan warna gelap (cokelat kayu tua) dan terang (cokelat kayu amber).
  * Ruang privat (belum ada pemain lain).
  * **Lemari Pakaian (`wardrobeZone`)**: Membuka `WardrobeModal` untuk mengubah gender, warna kulit, baju, celana, dan topi karakter.
  * **Tempat Tidur (`bedZone`)**: Beristirahat di kasur empuk dengan balon dialog "Zzz... 💤".
  * **Dapur (`kitchenZone`)**: Memasak sup hangat di atas kompor 🍲.
  * **Kamar Mandi (`bathroomZone`)**: Fasilitas mandi & cuci muka di bathtub porselen 🚿.
  * **Pintu Keluar (`exitDoorZone`)**: Ketika didekati, muncul tombol interaksi `[E] KELUAR KE WORLD` untuk beralih secara mulus ke `WorldScene` (Open World bersama pemain lain).
  * **Isolasi Input Keyboard**: Ketika pemain sedang mengetik di input chat atau form modal, event `WASD` dan `[E]` diabaikan sehingga karakter tidak bergerak liar dan semua huruf (W, A, S, D, E) dapat diketik dengan lancar ke dalam pesan chat.

#### 19. `resources/js/game/scenes/AdminPortalScene.ts`
* **Fungsi:** Scene Pusat Kendali Khusus Super Admin (*Admin Portal Command Sanctuary*).
* **Fitur Eksklusif**:
  * Hanya dapat diakses oleh Super Admin melalui URL ber-token acak `/admin/{adminToken}`.
  * **Lantai Catur Cyber Obsidian & Gold**: Lantai bermotif catur berteknologi tinggi dengan garis grid neon emas.
  * **Tahta Pencipta Raden**: Singgasana emas dengan mahkota bercahaya di tengah ruangan.
  * **Konsol Interaktif**:
    * 📢 **Konsol Broadcast**: Siaran pengumuman resmi ke seluruh penjuru server.
    * 👥 **Konsol Database Sensus**: Melihat jumlah akun pemain terdaftar di server SQLite.
    * ⚡ **Konsol Godmode**: Mengaktifkan buff kecepatan gerak 400 Px/s.
  * **Gerbang Portal Teleportasi Keluar**:
    * 🌀 Gerbang Portal Biru ke Open World (`/world`).
    * 🏠 Gerbang Portal Hijau ke Rumah Pribadi (`/home/{safeId}`).

#### 20. `resources/js/game/ui/WardrobeModal.tsx`
* **Fungsi:** Modal interaktif lemari pakaian di dalam rumah untuk kustomisasi avatar secara bebas:
  * Pemilihan gender, palet swatch warna kulit, baju, celana, dan jenis topi.
  * Preview langsung (*live preview*) dengan grafis SVG.
  * Menyimpan dan memancarkan event `avatar-updated` ke scene.

#### 20. `resources/js/game/ui/ProfileModal.tsx`
* **Fungsi:** Modal pop-up profil karakter lengkap saat tombol Profile di sudut kiri atas ditekan.
* **Fitur:** Pratinjau avatar SVG, nama karakter, gelar petualang, level & EXP progress bar, serta atribut statistik (ATK, DEF, Speed, Gold, Diamonds).

#### 21. `resources/js/game/ui/HUD.tsx`
* **Fungsi:** Tampilan antarmuka mengambang (*Heads-Up Display*) dengan aturan desain spesifik:
  * **Tanpa Indikator Darah/HP Bar**: Tampilan bersih dan minimalis tanpa darah/HP bar.
  * **Kiri Atas (Top-Left)**: Tombol Profile (membuka pop-up profil karakter), Nama Karakter & Level (`LV. 1`), serta Icon Chat button.
  * **Kiri Bawah Pojok (Bottom-Left)**: Nama Tempat, Koordinat Grid `POSISI GRID: (X: ..., Y: ...)` berbasis petak catur (koordinat pixel dihapus), dan tombol interaksi cepat `[E]`.
  * **Kanan Atas (Top-Right)**: Menampilkan Kode/Nama Server aktif (`SERVER: RADEN-ASIA-01`) dan tombol panduan kontrol.
  * **Palet 2 Warna Ketat**: Hanya menggunakan 2 warna: Obsidian Gelap (`#0a0f1d`) dan Amber Emas (`#f59e0b`).

#### 21. `resources/js/game/ui/ChatBox.tsx`
* **Fungsi:** Jendela pop-up obrolan multiplayer di Kiri Atas (Top-Left) tepat di bawah tombol chat:
  * Mengambang di kiri atas, terbuka/tertutup ketika tombol chat di kiri atas ditekan.
  * Menggunakan skema 2 warna ketat (Obsidian & Amber).

#### 22. `resources/js/components/GameCanvas.tsx`
* **Fungsi:** Komponen React wrapper yang menginisialisasi canvas Phaser 3 di dalam DOM `<div id="game-container" />`.

#### 23. `resources/js/GameApp.tsx` & `app.tsx`
* **Fungsi:** Komponen induk React yang mengatur siklus hidup game, koneksi EventBus antara React dan Phaser (HouseScene & WorldScene), membuka modal Lemari Pakaian, dan merender HUD/Chat.

---

### F. Backend API & Server Game

#### 25. `routes/web.php` (API Game & Sistem Akun Nyata)
* **Game Status Endpoints**:
  * `GET /api/game/home`: Mengembalikan judul game, engine yang dipakai, status server, dan daftar server aktif.
  * `GET /api/game/house`: Mengembalikan konfigurasi ruang rumah pribadi dan furnitur.
  * `GET /api/game/world`: Mengembalikan data open world, toko senjata Arya, toko alkimia Sari, dan NPC.
* **Real Account Database Auth Endpoints**:
  * `POST /api/auth/register`: Mendaftarkan akun nyata ke database SQLite (`users` table) dengan password hashing bcrypt dan menyimpan kustomisasi avatar, level, serta gelar awal.
  * `POST /api/auth/login`: Autentikasi login nyata dengan verifikasi kata sandi bcrypt; mengembalikan data profil pengguna dan kustomisasi avatar yang tersimpan.
  * `POST /api/auth/forgot-password`: Mengatur ulang kata sandi pengguna terdaftar.
  * `POST /api/auth/update-avatar`: Memperbarui data avatar pengguna secara permanen ke database dari interaksi Lemari Pakaian.
  * `GET /api/auth/profile/{name}`: Mengambil data profil lengkap pemain (level, exp, title, gold, diamonds, avatar).

#### 26. `server/game-server.js`
* **Fungsi:** Server Node.js Socket.io mandiri di port 3001 untuk pertukaran paket multiplayer (pergerakan posisi, balon kata, monster) saat berada di `WorldScene`.
* **Dukungan Super Admin:** Menangani paket bergabung dan pergerakan pemain dengan role `super_admin`, membubuhkan tag `👑 ADMIN` pada pesan obrolan, dan memproses perintah chat khusus `/announce <pesan>` untuk siaran pengumuman server resmi.

---

### G. Akun & Role Super Admin (Kreator Game)
Sistem menyediakan role khusus **Super Admin** untuk pengembang/pemilik game:
* **Email:** `radencakstudio@gmail.com`
* **Nama Karakter:** `RADEN`
* **Kata Sandi:** `Raden1234`
* **Role Database:** `super_admin`
* **Gelar / Title:** `👑 SUPER ADMIN` (Level 99, 9999 EXP, 999.999 Gold, 9.999 Permata)
* **Keistimewaan & Fitur Super Admin:**
  1. **Badge Emas di HUD & Pop-up Profil:** Menampilkan lencana mahkota emas `👑 ADMIN` serta ringkasan hak istimewa di `ProfileModal`.
  2. **Nameplate Khusus di Atas Kepala:** Di dunia game Phaser 3, karakter menampilkan teks emas tebal `👑 RADEN [ADMIN]` yang dapat dilihat oleh semua pemain lain.
  3. **Tanda Khusus di Obrolan (Chat):** Pesan obrolan dari Super Admin ditandai dengan badge mahkota emas `👑 ADMIN` dan aksen border kuning menyala.
  4. **Perintah Server Broadcast:** Mengetik `/announce <pesan>` di kolom chat akan menyiarkan pengumuman server resmi ke seluruh pemain yang sedang online.
  5. **Auto-Provisioning / Seeding Otomatis:** Akun terdaftar di database SQLite via migration `add_role_to_users_table` dan seeder `SuperAdminSeeder.php`. Jika pengguna masuk menggunakan email `radencakstudio@gmail.com` atau nama `RADEN` dengan password `Raden1234`, sistem secara otomatis memvalidasi dan menetapkannya sebagai Super Admin.

---

---

## 5. CATATAN PERBAIKAN BUG KRUSIAL (CHANGELOG)
### Perbaikan Masalah Blank Screen saat Menekan Tombol Masuk:
1. **Urutan React Hooks di [AuthModal.tsx](file:///d:/laragon/laragon/www/RadenWorld/resources/js/game/ui/AuthModal.tsx)**:
   * **Penyebab**: Hook `useState` untuk `authError` dan `isLoading` diletakkan **setelah** baris `if (!isOpen) return null;`. Saat modal pertama kali tertutup (`isOpen=false`), React hanya membaca 13 hooks. Ketika tombol "1. MASUK" ditekan (`isOpen=true`), komponen merender 15 hooks. Ini melanggar **Rules of Hooks** React (`Error: Rendered more hooks than during the previous render`) dan menyebabkan unmount total (Blank Screen).
   * **Solusi**: Memindahkan seluruh pemanggilan hook `useState` ke bagian paling atas komponen sebelum kondisi `if (!isOpen) return null;`.
2. **Keamanan Siklus Hidup Kamera & Karakter di [HouseScene.ts](file:///d:/laragon/laragon/www/RadenWorld/resources/js/game/scenes/HouseScene.ts)**:
   * Menambahkan `this.cameras.main.stopFollow()` sebelum karakter `this.player.destroy()` dijalankan untuk mencegah kamera Phaser 3 merujuk ke target yang telah hancur.
   * Langsung memancarkan event `player-stats-updated` seketika saat karakter spawn sehingga HUD di layar React langsung terisi tanpa jeda frame.
3. **Resiliensi Komponen HUD & Avatar**:
   * Menambahkan fallback default pada [HUD.tsx](file:///d:/laragon/laragon/www/RadenWorld/resources/js/game/ui/HUD.tsx), [AvatarPreview.tsx](file:///d:/laragon/laragon/www/RadenWorld/resources/js/game/ui/AvatarPreview.tsx), dan [AvatarGenerator.ts](file:///d:/laragon/laragon/www/RadenWorld/resources/js/game/utils/AvatarGenerator.ts) agar tidak pernah melempar `TypeError` jika terdapat data avatar null/undefined.
4. **React Error Boundary di [app.tsx](file:///d:/laragon/laragon/www/RadenWorld/resources/js/app.tsx)**:
   * Membungkus seluruh aplikasi `GameApp` dengan komponen kelas `ErrorBoundary` agar setiap error tak terduga dapat ditangkap dan ditampilkan secara elegan tanpa merusak layar menjadi blank.

---

## 6. CARA MENJALANKAN SISTEM
Untuk menjalankan semua service sekaligus (Laravel Web + Vite Bundler + Multiplayer Server):
```powershell
npm run dev:all
```
Akses di browser: **`http://127.0.0.1:8000`**


