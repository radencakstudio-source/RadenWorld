# 🎨 RADENWORLD UI DESIGN SYSTEM SPECIFICATION
> **Arsip Panduan Resmi Gaya Desain Antarmuka (UI/UX) RadenWorld**  
> Gunakan dokumen ini sebagai acuan standar mutlak saat merancang atau memperbarui antarmuka pengguna (UI) di RadenWorld.

---

## 1. Filosofi & Karakter Desain
* **Nama Gaya**: **Cozycore RPG Clay-Pixel / Chunky Pastel Pixel**
* **Vibe**: Hangat, imut, bernuansa mainan tanah liat (*clay toy*), retro pixel 16-bit modern, ramah anak & keluarga, serta taktil (*tactile*).
* **Prinsip Utama**:
  1. **Tegas & Terbaca**: Kontras tinggi dengan outline biskuit kokoa yang renyah.
  2. **Taktil**: Memberikan rasa puas saat ditekan (*press down feedback* via `:active { transform: translateY(2px); }`).
  3. **Tenang & Ramah Mata**: Menggunakan palet pastel lembut, tanpa efek neon menyilaukan (*glow*) dan tanpa distorsi warna.

---

## 2. ⚠️ Aturan Sakral (Zero-Violation Rules)
Setiap komponen UI baru yang dibuat **WAJIB** mematuhi 6 aturan sakral berikut:

| No | Aturan | Alasan & Larangan |
|---|---|---|
| **1** | **ZERO `:hover`** | **DILARANG** menambahkan efek `:hover` yang mengubah warna, background, atau posisi. UI RadenWorld dimainkan di layar sentuh (*mobile*) dan PC. Efek interaksi hanya diizinkan pada status `:active` (ditekan). |
| **2** | **ZERO Glow / Shadow Neon** | **DILARANG** menggunakan `box-shadow: 0 0 15px #xxx` atau filter neon/cyberpunk. Bayangan hanya boleh berupa *hard drop shadow* clay biskuit (`0 3px 0 #5C3A21` atau `0 2px 0 #D4A373`). |
| **3** | **ZERO Pure Black Border** | **DILARANG** menggunakan `#000000` sebagai border/outline modal maupun tombol. Garis tepi WAJIB menggunakan outline biskuit kokoa `#5C3A21` (tebal 1.5px - 2px). |
| **4** | **ZERO Diamond / TopUp** | Ekonomi game 100% menggunakan **Gold (`G`)**. Dilarang memunculkan mata uang Diamonds atau menu Top-Up. |
| **5** | **Warna Teks Tegas** | Teks pada panel terang/kartu wajib berwarna hitam pekat `#000000` (atau `text-black`). Hanya gunakan `#FFFFFF` pada badge atau header gelap. Dilarang teks abu-abu tipis yang sulit dibaca. |
| **6** | **Sidebar: Ikon di Atas, Teks di Bawah** | Seluruh navigasi modal sidebar **WAJIB** menempatkan logo/ikon di bagian **ATAS** dan nama menu/label teks di **BAWAH** (`flex-col items-center justify-center text-center`). |

---

## 3. Palet Warna Resmi (Official Color Palette)

```
+-------------------------------------------------------------------------+
| PALET UTAMA CLAY-PASTEL RADENWORLD                                      |
+-------------------+---------------------+-------------------------------+
| Nama Warna        | Kode Hex            | Penggunaan                    |
+-------------------+---------------------+-------------------------------+
| Warm Cream (Panel)| #FFF8EA             | Background modal & kontainer  |
| Warm Peach        | #FFAE6D             | Tombol aktif, aksi utama      |
| Fresh Mint        | #A8E6CF             | Tombol sekunder, sukses       |
| Cocoa Outline     | #5C3A21             | Border 2px seluruh komponen   |
| Biscuit Bevel     | #D4A373             | Shading bayangan bawah clay   |
| Card Light Cream  | #FFF1DC / #FDEED9   | Latar kartu & daftar item     |
| Pastel Red/Coral  | #FF8B8B             | Tombol bahaya, hapus, error   |
| Pastel Sky Blue   | #A0C4FF             | Info, jaringan, indikator     |
+-------------------+---------------------+-------------------------------+
```

### Variabel CSS Tailwind Terkait:
* **Background Utama**: `bg-[#FFF8EA]`
* **Primary Accent**: `bg-[#FFAE6D]`
* **Secondary / Success**: `bg-[#A8E6CF]`
* **Outline / Border**: `border-2 border-[#5C3A21]`
* **Teks Terang**: `text-black font-bold`

---

## 4. Tipografi & Skala Ukuran Font

### Keluarga Font (Font Family):
1. **Heading / Judul**: `'Kenney Pixel Square', 'Press Start 2P', monospace`
2. **Body / Tombol / Label**: `'m5x7', 'Courier New', monospace, sans-serif`

### Skala Hierarki Ukuran:
* **Judul Modal Utama**: `text-sm sm:text-base font-bold uppercase tracking-wide`
* **Sub-Judul / Topbar**: `text-xs sm:text-sm font-bold uppercase`
* **Label Tombol / Navigasi Sidebar**: `text-[10px] sm:text-[11px] font-bold uppercase`
* **Isi / Deskripsi (Body)**: `text-xs` (12px)
* **Badge / Tag Indikator**: `text-[9px]` atau `text-[10px] font-bold px-1.5 py-0.5 uppercase`
* **Catatan Kaki / Metadata**: `text-[10px]` atau `text-[11px]`

---

## 5. Arsitektur Modal & Navigasi Sidebar

Setiap jendela modal radikal (Profil, Bank, Tas/Inventori, Polisi, Pengaturan, Autentikasi/ID, Peta, Pasar) dibangun menggunakan struktur cangkang **Left Sidebar Shell**:

```
+--------------------------------------------------------------------------+
|  .clay-panel (Max-Width 2xl / 3xl, Max-Height 92dvh - 94dvh)            |
|  +--------------------------------------------------------------------+  |
|  |  .clay-modal-shell (flex-1 flex min-h-0)                           |  |
|  |  +------------------------+  +-----------------------------------+  |  |
|  |  | <aside> .clay-sidebar  |  | <div> .clay-main-pane             |  |  |
|  |  |                        |  |                                   |  |  |
|  |  | 1. .clay-sidebar-brand |  | 1. .clay-main-topbar (Judul + X)  |  |  |
|  |  |    (Icon + Judul + Sub)|  |    - Title uppercase              |  |  |
|  |  |                        |  |    - Badge online/status          |  |  |
|  |  | 2. .clay-sidebar-nav   |  |    - Tombol X Tutup (clay-btn)    |  |  |
|  |  |    (Tombol Vertikal)   |  |                                   |  |  |
|  |  |    - [IKON]            |  | 2. .landscape-compact-body        |  |  |
|  |  |    - Label Teks Bawah  |  |    - Area Konten Scrollable       |  |  |
|  |  |                        |  |    - .custom-scrollbar            |  |  |
|  |  | 3. .clay-sidebar-footer|  |    - Form, List Item, Kartu       |  |  |
|  |  |    (Versi Badge)       |  |                                   |  |  |
|  |  +------------------------+  +-----------------------------------+  |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

### Dimensi Responsif Sidebar:
* **Mobile Portrait (`< 640px`)**: Lebar `98px`
* **Mobile Landscape (`<= 768px`)**: Lebar `112px`
* **Tablet / Desktop (`> 768px`)**: Lebar `124px` hingga `136px`
* **Struktur Tombol**:
  ```tsx
  <button
    type="button"
    onClick={() => handleTabClick(tab.id)}
    className={`clay-sidebar-btn ${isActive ? 'clay-sidebar-btn-active' : 'clay-sidebar-btn-inactive'}`}
  >
    <Icon className="w-5 h-5 stroke-[2.5] shrink-0" />
    <span>{tab.label}</span>
  </button>
  ```

---

## 6. Kelas Komponen CSS Inti (`resources/css/app.css`)

| Kelas CSS | Fungsi & Penampilan |
|---|---|
| `.clay-panel` | Cangkang utama modal dengan background `#FFF8EA`, border 2px `#5C3A21`, border-radius `1rem`. |
| `.clay-header` | Bagian atas modal dengan border biskuit bawah dan teks tebal. |
| `.clay-sidebar` | Kolom navigasi sebelah kiri modal dengan border kanan `#5C3A21`. |
| `.clay-sidebar-btn` | Tombol navigasi vertikal (ikon atas, teks bawah), transisi halus tanpa hover. |
| `.clay-sidebar-btn-active` | Status aktif tombol sidebar dengan background peach `#FFAE6D`. |
| `.clay-sidebar-btn-inactive` | Status istirahat tombol sidebar dengan background `#FFF8EA`. |
| `.clay-btn-primary` | Tombol aksi utama (Warm Peach `#FFAE6D`, border 2px `#5C3A21`, shadow biskuit). |
| `.clay-btn-secondary` | Tombol sekunder / konfirmasi (Fresh Mint `#A8E6CF`, border 2px `#5C3A21`). |
| `.clay-btn-neutral` | Tombol netral / tutup / kembali (Cream `#FFF8EA`, border 2px `#5C3A21`). |
| `.clay-card` | Kartu informasi isi panel dengan border 2px `#5C3A21` dan background lembut. |
| `.clay-input` | Kolom isian teks form bergaya clay dengan outline 2px biskuit kokoa. |
| `.clay-badge-primary` | Lencana kecil peach `#FFAE6D` untuk status atau koordinat. |
| `.clay-badge-secondary` | Lencana kecil hijau mint `#A8E6CF` untuk indikator terverifikasi/aktif. |

---

## 7. Optimasi Mobile & Device Kentang (Low-End Hardware)
1. **Kamera & Viewport Open World**:
   - Skala zoom awal di mobile: `0.65` (agar area sekitar terlihat lapang dan tidak sumpek).
   - Batas minimum zoom out: `0.35` (memungkinkan pemain melihat lanskap luas).
2. **Kualitas Tampilan (HD Tanpa Blur)**:
   - Gunakan `image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;` pada elemen canvas Phaser.
3. **Pencahayaan Malam & Efek Partikel**:
   - Throttling penggambaran lightmap kanvas malam: maksimal sekali per 120ms di mobile (`time - lastTime < 120`).
   - SVG filter blur (god rays / sunbeams) dikurangi ke `stdDeviation="10"` pada layar ponsel dan animasi kontinu dinonaktifkan (`animation: none !important`).

---

## 8. Template Prompt Rekomendasi untuk Pengembangan Selanjutnya
Saat meminta asisten coding membuat modal atau fitur antarmuka baru di RadenWorld, gunakan template prompt berikut:

```markdown
Buatkan modal [NAMA_FITUR] untuk game RadenWorld dengan spesifikasi UI Design System:
1. Gaya: Cozycore RPG Clay-Pixel / Chunky Pastel Pixel.
2. Layout: Standard Left Sidebar (.clay-modal-shell -> .clay-sidebar + .clay-main-pane).
3. Tombol Sidebar: Wajib Ikon di ATAS, Label Teks di BAWAH (.clay-sidebar-btn).
4. Warna: Background #FFF8EA, Primary #FFAE6D, Secondary #A8E6CF, Border 2px #5C3A21.
5. Aturan: ZERO :hover, ZERO neon glow, teks wajib #000000 tebal (text-black), mata uang hanya Gold (G).
6. Responsif: Kompatibel mobile portrait & landscape dengan .landscape-compact-body.
```

---
*Dokumen ini diperbarui secara resmi untuk RadenWorld v2.0.*

