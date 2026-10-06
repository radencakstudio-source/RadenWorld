# RadenWorld - 2D Open World Multiplayer RPG

🎮 **RadenWorld** adalah game browser 2D Open World Multiplayer RPG berbasis web modern yang menggabungkan:
- **Frontend Engine**: Phaser 3 (HTML5 Canvas / WebGL) & React 19 dengan Tailwind CSS.
- **Backend Architecture**: Laravel 12 (REST API & Auth) & Node.js WebSocket Server (Multiplayer Synchronization).
- **Tema Desain**: Obsidian Gelap (`#0a0f1d`) & Amber Emas (`#f59e0b`) dengan tipografi futuristik *Chakra Petch*.

---

## 🌟 Fitur Utama
1. **Multi-Scene System**:
   - 🏠 **House Scene**: Rumah pribadi pemain (`/home/{safeId}`) dengan lantai catur kayu, kasur, dapur, kamar mandi, dan lemari pakaian (*Wardrobe*).
   - 🌍 **Open World**: Dunia multiplayer real-time (`/world`) dengan koordinat grid catur, monster slime, NPC, dan chat sinkron.
   - 👑 **Portal Admin**: Pusat kendali eksklusif Super Admin (`/admin/{token}`) dengan Tahta Pencipta, Konsol Broadcast Server, Sensus Database, Konsol Kecepatan 400 Px/s, dan dua portal jalan pintas.
2. **Kustomisasi Karakter 2D**:
   - Pilihan gender, warna kulit, baju, celana, dan jenis topi (*crown*, *adventurer*, *knight*, *bandana*, *wizard*).
3. **Akun & Otoritas**:
   - Sistem akun terverifikasi database Laravel.
   - Hak istimewa Super Admin (`radencakstudio@gmail.com` / `RADEN`).

---

## 🚀 Menjalankan Project

### 1. Prasyarat
- PHP >= 8.2 & Composer
- Node.js >= 18 & NPM
- MySQL / MariaDB (Laragon / XAMPP)

### 2. Instalasi & Setup
```bash
# Clone repositori
git clone https://github.com/radencakstudio-source/RadenWorld.git
cd RadenWorld

# Install dependensi PHP & JavaScript
composer install
npm install

# Setup Environment
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### 3. Menjalankan Server Game
Jalankan 3 service berikut:
```bash
# 1. Laravel Web Server
php artisan serve

# 2. Vite Asset Bundler
npm run dev

# 3. WebSocket Game Server
node server/game-server.js
```
Buka browser di `http://localhost:8000`.
