<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>{{ $pageTitle ?? 'Dokumentasi Sistem RadenWorld (Offline Viewer & Download)' }}</title>
    <style>
        :root {
            --bg-page: #F7F7F7;
            --bg-surface: #FFFFFF;
            --bg-subtle: #F0F0F0;
            --border-strong: #111111;
            --border-muted: #D4D4D4;
            --text-primary: #111111;
            --text-secondary: #4B4B4B;
            --text-muted: #737373;
            --radius-sm: 4px;
            --radius-md: 6px;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-primary);
            line-height: 1.6;
            padding-bottom: 64px;
            -webkit-font-smoothing: antialiased;
        }
        .topbar {
            position: sticky;
            top: 0;
            z-index: 100;
            background: #111111;
            color: #FFFFFF;
            border-bottom: 1px solid #000000;
            padding: 14px 24px;
        }
        .topbar-inner {
            max-width: 1360px;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .brand-badge {
            background: #FFFFFF;
            color: #111111;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: var(--radius-sm);
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }
        .brand-title h1 {
            font-size: 16px;
            font-weight: 700;
            letter-spacing: -0.01em;
            color: #FFFFFF;
        }
        .brand-title p {
            font-size: 12px;
            color: #A3A3A3;
            font-weight: 400;
        }
        .nav-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .nav-pill {
            text-decoration: none;
            padding: 7px 14px;
            border-radius: var(--radius-sm);
            font-size: 12.5px;
            font-weight: 600;
            color: #D4D4D4;
            background: #222222;
            border: 1px solid #383838;
            transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .nav-pill:hover {
            background: #333333;
            color: #FFFFFF;
        }
        .nav-pill.active {
            background: #FFFFFF;
            color: #111111;
            border-color: #FFFFFF;
        }
        .container {
            max-width: 1360px;
            margin: 24px auto;
            padding: 0 20px;
        }
        .action-bar {
            background: var(--bg-surface);
            border: 1px solid var(--border-strong);
            border-radius: var(--radius-md);
            padding: 18px 22px;
            margin-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }
        .action-info h2 {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            letter-spacing: -0.01em;
        }
        .action-info p {
            font-size: 13px;
            color: var(--text-secondary);
            margin-top: 2px;
        }
        .btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .btn {
            appearance: none;
            border: 1px solid var(--border-strong);
            border-radius: var(--radius-sm);
            padding: 8px 13px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #FFFFFF;
            color: #111111;
            transition: background 0.12s ease, color 0.12s ease;
        }
        .btn:hover {
            background: #F0F0F0;
        }
        .btn-primary {
            background: #111111;
            color: #FFFFFF;
        }
        .btn-primary:hover {
            background: #2B2B2B;
        }
        .card {
            background: var(--bg-surface);
            border: 1px solid var(--border-muted);
            border-top: 2px solid var(--border-strong);
            border-radius: var(--radius-md);
            padding: 22px;
            margin-bottom: 22px;
        }
        .card-header {
            border-bottom: 1px solid var(--border-muted);
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .card-header h3 {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
        }
        .badge-offline {
            background: #F5F5F5;
            color: #111111;
            border: 1px solid #111111;
            padding: 3px 10px;
            border-radius: var(--radius-sm);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        .diagram-viewport {
            width: 100%;
            overflow-x: auto;
            background: #FFFFFF;
            border: 1px solid var(--border-muted);
            border-radius: var(--radius-sm);
            padding: 16px;
            text-align: center;
            -webkit-overflow-scrolling: touch;
        }
        .diagram-viewport svg {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .zoom-toolbar {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
            margin-bottom: 10px;
        }
        .zoom-btn {
            background: #FFFFFF;
            border: 1px solid #A3A3A3;
            color: #111111;
            border-radius: var(--radius-sm);
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }
        .zoom-btn:hover {
            background: #F0F0F0;
            border-color: #111111;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 8px;
        }
        th, td {
            border: 1px solid var(--border-muted);
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background: var(--bg-subtle);
            font-weight: 700;
            color: var(--text-primary);
        }
        tr:nth-child(even) td {
            background: #FAFAFA;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
            gap: 16px;
        }
        .feature-box {
            background: #FFFFFF;
            border: 1px solid var(--border-muted);
            border-left: 3px solid var(--border-strong);
            border-radius: var(--radius-sm);
            padding: 16px;
        }
        .feature-box h4 {
            font-size: 14.5px;
            font-weight: 700;
            color: #111111;
            margin-bottom: 6px;
            padding-bottom: 6px;
            border-bottom: 1px solid #E5E5E5;
        }
        .feature-meta {
            font-size: 11.5px;
            margin-bottom: 8px;
            color: var(--text-secondary);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }
        .feature-steps {
            padding-left: 18px;
            font-size: 12.5px;
            color: #262626;
        }
        .feature-steps li {
            margin-bottom: 4px;
        }
        code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11.5px;
            background: #F0F0F0;
            padding: 1px 5px;
            border-radius: 3px;
            border: 1px solid #E0E0E0;
        }
        @media (max-width: 768px) {
            .topbar { padding: 12px 14px; }
            .action-bar { padding: 14px; }
            .card { padding: 14px; }
            .btn { padding: 7px 10px; font-size: 12px; }
            th, td { padding: 8px; font-size: 12px; }
            .feature-grid { grid-template-columns: 1fr; }
        }
        @media print {
            .topbar, .btn-group, .zoom-toolbar { display: none !important; }
            body { background: #FFFFFF; padding: 0; }
            .card, .action-bar { border: 1px solid #000000; page-break-inside: avoid; }
        }
    </style>
</head>
<body>

<header class="topbar">
    <div class="topbar-inner">
        <div class="brand">
            <span class="brand-badge">SYSTEM DOCS</span>
            <div class="brand-title">
                <h1>RadenWorld — 2D Open World Education &amp; Life Simulation</h1>
                <p>Dokumentasi Teknis &amp; Arsitektur Sistem (Monokrom Profesional — Offline Viewer &amp; Export)</p>
            </div>
        </div>
        <nav class="nav-pills">
            <a href="/world/usecase" class="nav-pill {{ $docType === 'usecase' ? 'active' : '' }}">1. Use Case Diagram</a>
            <a href="/world/activity" class="nav-pill {{ $docType === 'activity' ? 'active' : '' }}">2. Activity Diagram</a>
            <a href="/world/wireframe" class="nav-pill {{ $docType === 'wireframe' ? 'active' : '' }}">3. Wireframe &amp; Interaksi</a>
        </nav>
    </div>
</header>

<main class="container">
    <section class="action-bar">
        <div class="action-info">
            <h2>
                @if($docType === 'usecase')
                    1. Use Case Diagram &amp; Spesifikasi Fungsional RadenWorld
                @elseif($docType === 'activity')
                    2. Activity Diagram (End-to-End User Flow) RadenWorld
                @else
                    3. Wireframe Antarmuka Utama &amp; Spesifikasi Interaksi Sistem
                @endif
            </h2>
            <p>Spesifikasi Sesuai Implementasi Proyek • Karakter Male &amp; Female • Notifikasi Ikan/Panen • Pegangan Tangan &amp; Trade</p>
        </div>
        <div class="btn-group">
            <button type="button" class="btn btn-primary" onclick="downloadDiagramPNG()">Download PNG (HD)</button>
            <button type="button" class="btn" onclick="downloadDiagramSVG()">Download SVG</button>
            <a href="?download=html" class="btn">Download HTML</a>
            <a href="?download=md" class="btn">Download Markdown (.MD)</a>
            <button type="button" class="btn" onclick="window.print()">Cetak / PDF</button>
        </div>
    </section>

    @if($docType === 'usecase')
        <!-- ================================================================ -->
        <!-- 1. USE CASE DIAGRAM UTAMA (MONOCHROME PROFESSIONAL)              -->
        <!-- ================================================================ -->
        <section class="card">
            <div class="card-header">
                <h3>Diagram Use Case Utama Sistem RadenWorld (16 Use Case dalam 4 Paket Subsistem &amp; 3 Aktor)</h3>
                <span class="badge-offline">UML 2.5 • Monochrome Vector</span>
            </div>
            <div class="zoom-toolbar">
                <button type="button" class="zoom-btn" onclick="zoomDiagram(0.85)">- Perkecil</button>
                <button type="button" class="zoom-btn" onclick="zoomDiagram(1.0)">100%</button>
                <button type="button" class="zoom-btn" onclick="zoomDiagram(1.2)">+ Perbesar</button>
            </div>
            <div class="diagram-viewport" id="diagram-container">
                <svg id="main-svg-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1320 980" width="1280" height="950">
                    <rect width="1320" height="980" fill="#FFFFFF"/>

                    <!-- System Boundary Box -->
                    <rect x="235" y="24" width="850" height="932" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="2"/>
                    <rect x="235" y="24" width="850" height="42" rx="4" fill="#111111"/>
                    <text x="660" y="50" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI, sans-serif" font-size="14" font-weight="700" letter-spacing="0.5">
                        SYSTEM BOUNDARY: RADENWORLD (2D OPEN WORLD EDUCATION &amp; LIFE SIMULATION)
                    </text>

                    <!-- Paket 1: Autentikasi, Pemilihan Gender (Male/Female) & Dunia 2D -->
                    <rect x="258" y="84" width="804" height="176" rx="4" fill="#FFFFFF" stroke="#404040" stroke-width="1.2" stroke-dasharray="5,4"/>
                    <text x="274" y="106" fill="#111111" font-family="Inter, Segoe UI, sans-serif" font-size="12.5" font-weight="700">
                        PAKET 1: AUTENTIKASI AKUN, KARAKTER (MALE / FEMALE) &amp; NAVIGASI DUNIA 2D
                    </text>

                    <g>
                        <ellipse cx="445" cy="146" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="150" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-01: Login / Register / OTP / Tamu</text>

                        <ellipse cx="835" cy="146" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="150" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-02: Pilih Gender Karakter (Male / Female)</text>

                        <ellipse cx="445" cy="212" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="216" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-03: Rumah Pribadi &amp; Transisi Pintu Gedung</text>

                        <ellipse cx="835" cy="212" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="216" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-04: Eksplorasi Open World &amp; Minimap</text>
                    </g>

                    <!-- Paket 2: Edukasi Sekolah (SD/SMP/SMA), Rumus Unik, Lightbox Gambar & Kuis -->
                    <rect x="258" y="278" width="804" height="176" rx="4" fill="#FFFFFF" stroke="#404040" stroke-width="1.2" stroke-dasharray="5,4"/>
                    <text x="274" y="300" fill="#111111" font-family="Inter, Segoe UI, sans-serif" font-size="12.5" font-weight="700">
                        PAKET 2: EDUKASI BUKU MATERI (SD / SMP / SMA), PERPUSTAKAAN &amp; UJIAN KUIS
                    </text>

                    <g>
                        <ellipse cx="445" cy="340" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="344" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-05: Baca Buku Materi &amp; Rumus Unik Mapel</text>

                        <ellipse cx="835" cy="340" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="344" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-06: Perbesar Ilustrasi Materi (Zoom Lightbox)</text>

                        <ellipse cx="445" cy="408" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="412" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-07: Latihan Buku &amp; Ujian Kuis 20 Soal</text>

                        <ellipse cx="835" cy="408" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="412" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-08: Perpustakaan Kota &amp; Leaderboard</text>
                    </g>
                    <line x1="605" y1="340" x2="667" y2="340" stroke="#111111" stroke-width="1.2" stroke-dasharray="4,3"/>
                    <text x="636" y="333" text-anchor="middle" fill="#404040" font-family="Inter, Segoe UI" font-size="10" font-weight="600">&lt;&lt;extend&gt;&gt;</text>

                    <!-- Paket 3: Life Simulation, Alat [F], Notifikasi Ikan & Panen Kiri Atas -->
                    <rect x="258" y="472" width="804" height="232" rx="4" fill="#FFFFFF" stroke="#404040" stroke-width="1.2" stroke-dasharray="5,4"/>
                    <text x="274" y="494" fill="#111111" font-family="Inter, Segoe UI, sans-serif" font-size="12.5" font-weight="700">
                        PAKET 3: PERTANIAN, MEMANCING, LAYANGAN [F], NOTIFIKASI KIRI ATAS &amp; EKONOMI KOTA
                    </text>

                    <g>
                        <ellipse cx="445" cy="536" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="540" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-09: Bertani (Cangkul/Siram/Tanam/Panen [F])</text>

                        <ellipse cx="835" cy="536" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="540" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-10: Notifikasi Panen &amp; Ikan di Bawah Profil</text>

                        <ellipse cx="445" cy="600" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="604" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-11: Memancing [F] &amp; Minigame Bar 60fps</text>

                        <ellipse cx="835" cy="600" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="604" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-12: Terbangkan Layangan [F] &amp; Mode [R]</text>

                        <ellipse cx="445" cy="664" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="668" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-13: Pasar Makelar, Bank Kota &amp; Apotek</text>

                        <ellipse cx="835" cy="664" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="668" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-14: Jukebox Kafe &amp; Laporan Pos Polisi</text>
                    </g>
                    <line x1="605" y1="536" x2="667" y2="536" stroke="#111111" stroke-width="1.2" stroke-dasharray="4,3"/>
                    <text x="636" y="529" text-anchor="middle" fill="#404040" font-family="Inter, Segoe UI" font-size="10" font-weight="600">&lt;&lt;include&gt;&gt;</text>

                    <!-- Paket 4: Sosial Multiplayer (Pegangan Tangan, Trade Non-Biji, Follow 30d & Pengaturan Grafik) -->
                    <rect x="258" y="722" width="804" height="210" rx="4" fill="#FFFFFF" stroke="#404040" stroke-width="1.2" stroke-dasharray="5,4"/>
                    <text x="274" y="744" fill="#111111" font-family="Inter, Segoe UI, sans-serif" font-size="12.5" font-weight="700">
                        PAKET 4: INTERAKSI SOSIAL (PEGANGAN TANGAN, TRADE NON-BIJI, FOLLOW 30D) &amp; GRAFIK
                    </text>

                    <g>
                        <ellipse cx="445" cy="792" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="796" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-15: Pegangan Tangan (Req &amp; Respon 30d: Follow)</text>

                        <ellipse cx="835" cy="792" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="796" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-16: Trade Non-Biji (Req &amp; Respon 30d: Barter)</text>

                        <ellipse cx="445" cy="864" rx="160" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="445" y="868" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-17: Follow 30d, Chat &amp; Voice Chat WebRTC</text>

                        <ellipse cx="835" cy="864" rx="168" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="835" y="868" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">UC-18: Grafik Anti-Shimmer &amp; Sync MySQL</text>
                    </g>

                    <!-- ACTOR 1: PEMAIN (LEFT) -->
                    <g transform="translate(95, 450)">
                        <circle cx="0" cy="-45" r="20" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="-25" x2="0" y2="32" stroke="#111111" stroke-width="2.5"/>
                        <line x1="-26" y1="-6" x2="26" y2="-6" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="32" x2="-22" y2="70" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="32" x2="22" y2="70" stroke="#111111" stroke-width="2.5"/>
                        <rect x="-78" y="82" width="156" height="42" rx="4" fill="#111111"/>
                        <text x="0" y="101" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="12" font-weight="700">PEMAIN / PELAJAR</text>
                        <text x="0" y="116" text-anchor="middle" fill="#D4D4D4" font-family="Inter, Segoe UI" font-size="10" font-weight="500">(Primary Actor)</text>
                    </g>

                    <!-- ACTOR 2: PEMAIN LAIN (RIGHT TOP) -->
                    <g transform="translate(1205, 620)">
                        <circle cx="0" cy="-45" r="20" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="-25" x2="0" y2="30" stroke="#111111" stroke-width="2.5"/>
                        <line x1="-26" y1="-6" x2="26" y2="-6" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="30" x2="-22" y2="68" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="30" x2="22" y2="68" stroke="#111111" stroke-width="2.5"/>
                        <rect x="-82" y="78" width="164" height="42" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
                        <text x="0" y="97" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">PEMAIN LAIN (PEER)</text>
                        <text x="0" y="112" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="10" font-weight="500">(Pegangan Tangan / Trade)</text>
                    </g>

                    <!-- ACTOR 3: BACKEND SERVER & MYSQL (RIGHT BOTTOM) -->
                    <g transform="translate(1205, 845)">
                        <circle cx="0" cy="-45" r="20" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="-25" x2="0" y2="30" stroke="#111111" stroke-width="2.5"/>
                        <line x1="-26" y1="-6" x2="26" y2="-6" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="30" x2="-22" y2="68" stroke="#111111" stroke-width="2.5"/>
                        <line x1="0" y1="30" x2="22" y2="68" stroke="#111111" stroke-width="2.5"/>
                        <rect x="-84" y="78" width="168" height="42" rx="4" fill="#111111"/>
                        <text x="0" y="97" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">SERVER &amp; MYSQL</text>
                        <text x="0" y="112" text-anchor="middle" fill="#D4D4D4" font-family="Inter, Segoe UI" font-size="10" font-weight="500">(Authoritative Backend)</text>
                    </g>

                    <!-- Association Lines -->
                    <g stroke="#262626" stroke-width="1.3">
                        <line x1="150" y1="425" x2="285" y2="146"/>
                        <line x1="150" y1="432" x2="285" y2="212"/>
                        <line x1="150" y1="440" x2="285" y2="340"/>
                        <line x1="150" y1="448" x2="285" y2="408"/>
                        <line x1="150" y1="456" x2="285" y2="536"/>
                        <line x1="150" y1="464" x2="285" y2="600"/>
                        <line x1="150" y1="472" x2="285" y2="664"/>
                        <line x1="150" y1="480" x2="285" y2="792"/>
                        <line x1="150" y1="488" x2="285" y2="864"/>
                    </g>
                    <g stroke="#262626" stroke-width="1.3">
                        <line x1="1140" y1="620" x2="605" y2="792"/>
                        <line x1="1140" y1="630" x2="1003" y2="792"/>
                        <line x1="1140" y1="640" x2="605" y2="864"/>
                    </g>
                    <g stroke="#262626" stroke-width="1.3">
                        <line x1="1140" y1="845" x2="1003" y2="864"/>
                        <line x1="1140" y1="830" x2="605" y2="408"/>
                    </g>
                </svg>
            </div>
        </section>

        <!-- DETAIL LENGKAP TIAP FITUR USE CASE -->
        <section class="card">
            <div class="card-header">
                <h3>Spesifikasi Fungsional Tiap Use Case (Sesuai Implementasi Proyek RadenWorld)</h3>
            </div>
            <div class="feature-grid">
                <div class="feature-box">
                    <h4>1. Autentikasi Akun &amp; Pemilihan Karakter Male / Female (UC-01 &amp; UC-02)</h4>
                    <div class="feature-meta">Aktor: Pemain, Server MySQL • Komponen: HomeScreen.tsx, AuthModal.tsx</div>
                    <ol class="feature-steps">
                        <li><strong>Kondisi Awal:</strong> Pemain membuka halaman beranda RadenWorld (tanpa UI controller mobile saat layar loading aktif).</li>
                        <li><strong>Autentikasi:</strong> Mendukung registrasi akun baru dengan verifikasi OTP 6 digit ke email, login akun, login Google OAuth, serta mode tamu (<code>guest_mode</code>).</li>
                        <li><strong>Pemilihan Karakter:</strong> Sistem karakter tidak lagi menggunakan kustomisasi baju/seragam terpisah, melainkan berfokus pada pemilihan karakter <strong>Male (Laki-Laki)</strong> dan <strong>Female (Perempuan)</strong> dengan sprite animasi penuh (Idle, Jalan, Lari, Lompat).</li>
                        <li><strong>Hasil Akhir:</strong> Data identitas dan gender karakter disimpan di MySQL serta LocalStorage dan disinkronkan ke seluruh pemain di peta.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>2. Rumah Pribadi, Transisi Pintu &amp; Eksplorasi Open World (UC-03 &amp; UC-04)</h4>
                    <div class="feature-meta">Aktor: Pemain • Komponen: HouseScene.ts, WorldScene.ts, CameraController.ts</div>
                    <ol class="feature-steps">
                        <li><strong>Rumah Pribadi (Safe House):</strong> Pemain dapat beristirahat di kasur, berinteraksi dengan perabot rumah, dan keluar/masuk ke Peta Dunia (<code>WorldScene</code>).</li>
                        <li><strong>Navigasi Multi-Input:</strong> Mendukung gerak <code>WASD</code>/Panah, klik/tap tanah (Pathfinding), Lompat 2.5D (<code>[Space]</code>), Lari Cepat (<code>[Shift]</code>), dan Radar Minimap Kota.</li>
                        <li><strong>Kualitas Grafik Anti-Shimmer:</strong> Saat kamera di-zoom out jauh dan bergerak, <code>GraphicsQualityManager</code> menerapkan WebGL Mipmap (Trilinear/Bilinear), Anisotropic Filtering, dan sub-pixel tile bleed <code>+0.8px</code> agar garis-garis bangunan/jalan tidak berkedip-kedip tanpa mengubah kontrol kamera maupun file aset.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>3. Buku Materi SD/SMP/SMA, Rumus Unik &amp; Zoom Gambar (UC-05 &amp; UC-06)</h4>
                    <div class="feature-meta">Aktor: Pelajar • Komponen: SchoolSubjectsModal.tsx, BookMaterialView.tsx</div>
                    <ol class="feature-steps">
                        <li><strong>Materi Konsisten per Bab:</strong> Setiap mata pelajaran pada jenjang SD (Kelas 1–6), SMP (Kelas 7–9), dan SMA (Kelas 10–12) memiliki bab yang fokus pada satu topik konsisten tanpa mencampur pembahasan bab lain.</li>
                        <li><strong>Kartu Rumus &amp; Konsep Unik:</strong> Menampilkan desain kartu rumus yang khas sesuai mata pelajaran (Notasi Pecahan/Susun Vertikal Matematika, Pita Reaksi IPA, Papan Silsilah Sosial, Pola Kalimat Bahasa, dan Tahapan Praktik).</li>
                        <li><strong>Ilustrasi Bisa Diperbesar (Lightbox):</strong> Setiap ilustrasi materi dapat diklik/tap untuk membuka modal perbesaran penuh (zoom <code>1x</code> s/d <code>3x</code>).</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>4. Latihan Pemahaman Tanpa Bocoran &amp; Ujian Kuis (UC-07 &amp; UC-08)</h4>
                    <div class="feature-meta">Aktor: Pelajar, Server MySQL • Komponen: BookMaterialView.tsx, LibraryMaterialsModal.tsx</div>
                    <ol class="feature-steps">
                        <li><strong>Latihan Pemahaman Buku Jujur:</strong> Sebelum pemain memilih jawaban, seluruh opsi <code>A, B, C, D</code> tampil seragam tanpa tanda atau warna bocoran jawaban benar. Penanda benar/salah hanya muncul setelah opsi dipilih.</li>
                        <li><strong>Ujian Kuis 20 Soal:</strong> Menyajikan 20 soal pilihan ganda dengan batas waktu 60 detik/soal, 3 nyawa, dan perhitungan <em>Combo Streak</em>.</li>
                        <li><strong>Hadiah &amp; Leaderboard:</strong> Menyelesaikan bacaan atau ujian memberikan <code>+Gold</code> dan <code>+EXP</code> serta mencatat skor di Leaderboard Kelas &amp; Sekolah.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>5. Sistem Alat Fleksibel [F]: Cangkul, Siram, Tanam, Panen &amp; Layangan (UC-09 &amp; UC-12)</h4>
                    <div class="feature-meta">Aktor: Pemain • Komponen: CharacterController.ts, WorldFarming.ts, Hotbar.tsx</div>
                    <ol class="feature-steps">
                        <li><strong>Pergantian Alat Instan:</strong> Pemain dapat memilih alat di Hotbar (<code>[1]</code> Pancing, <code>[2]</code> Bibit, <code>[3]</code> Cangkul, <code>[4]</code> Penyiram, <code>[5]</code> Layangan) melalui tombol angka <code>1–6</code>, tap langsung di Hotbar, atau lewat modal Tas <code>[B]</code>.</li>
                        <li><strong>Eksekusi Kontekstual [F]:</strong> Tombol <code>[F]</code> dan tombol alat mobile menjalankan fungsi sesuai alat aktif (mencangkul tanah, menyiram air 10/10, menanam bibit, menerbangkan/menggulung layangan, atau memancing di air) serta otomatis menyesuaikan langkah kebun saat berada di Lahan Tani.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>6. Memancing Mulus 60fps &amp; Notifikasi Kiri Atas di Bawah Profil (UC-10 &amp; UC-11)</h4>
                    <div class="feature-meta">Aktor: Pemain • Komponen: FishingMinigame.tsx, HUD.tsx</div>
                    <ol class="feature-steps">
                        <li><strong>Minigame Memancing Tanpa Delay:</strong> Sambaran ikan (<code>Bite Alert</code>) dan pergerakan bar minigame memancing dirender langsung menggunakan akselerasi GPU <code>translate3d</code> / <code>scaleY</code> via DOM ref (60/120fps mulus tanpa jeda re-render).</li>
                        <li><strong>Tanpa Balon Chat Karakter:</strong> Balon kata di atas kepala karakter saat mendapat ikan atau panen telah dihapus dan digantikan oleh kartu notifikasi di <strong>kiri atas tepat di bawah tombol Profil</strong>.</li>
                        <li><strong>Detail Notifikasi:</strong> Menampilkan jenis air (<em>Tawar/Payau/Laut</em>), berat (<code>kg</code>), kedalaman (<code>m</code>), dan efek ikan; serta untuk hasil panen menampilkan nama buah, berapa kali diambil (misal <code>5x</code>), berat dinamis (<code>kg</code>), dan efek berbeda-beda.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>7. Pegangan Tangan, Trade Barang &amp; Ikuti (Real-Time WebSocket, Wajib Persetujuan &amp; Teks Murni Tanpa Icon/Emote) (UC-15 &amp; UC-16)</h4>
                    <div class="feature-meta">Aktor: Pemain &amp; Pemain Target • Komponen: ProfileModal.tsx, FriendRequestNotification.tsx, PlayerTradeModal.tsx, NetworkManager.ts</div>
                    <ol class="feature-steps">
                        <li><strong>Pengiriman Real-Time Instan (0ms Latency):</strong> Seluruh ajakan interaksi sosial—baik <em>Minta Gendong / Pegangan Tangan</em> (<code>handhold:request</code>), <em>Trade Barang</em> (<code>trade:request</code>), maupun <em>Ikuti</em> (<code>player:follow</code>)—dipancarkan langsung melalui WebSocket Socket.io server ke socket pemain target secara instan saat tombol ditekan.</li>
                        <li><strong>Mekanisme Persetujuan Wajib (Request &amp; Approval Flow):</strong> Baik Pegangan Tangan maupun Trade Barang <em>wajib menunggu persetujuan pemain target terlebih dahulu</em>. Saat pemain menekan tombol pada profil, sistem memancarkan request jaringan dan tombol pengajak seketika berganti teks menjadi <code>MENUNGGU RESPON...</code>.</li>
                        <li><strong>Pop-up Notifikasi Cooldown 30 Detik Real-Time:</strong> Di layar pemain target seketika muncul kartu pop-up ajakan (<code>FriendRequestNotification.tsx</code>) dengan hitung mundur 30 detik berisi tombol aksi teks murni <code>[TERIMA]</code>, <code>[TOLAK]</code>, dan <code>[ABAIKAN]</code>.</li>
                        <li><strong>Teks Murni Tanpa Icon/Emote:</strong> Tombol interaksi Pegangan Tangan (<code>[PEGANGAN TANGAN]</code>, <code>[LEPAS TANGAN]</code>) serta Trade didesain super bersih tanpa icon atau emote apapun (teks murni), memaksimalkan kecepatan rendering dan keanggunan tampilan.</li>
                        <li><strong>Eksekusi Pegangan Tangan:</strong> Hanya jika target menekan <code>[TERIMA]</code>, karakter target otomatis berjalan mengikuti (<em>auto-follow</em>) pemain pengajak secara presisi. Jika ditolak/hangus 30d, permintaan dibatalkan.</li>
                        <li><strong>Desain Trade Bersih &amp; Tanpa Icon/Logo:</strong> Hanya jika target menekan <code>[TERIMA]</code>, modal Trade (<code>PlayerTradeModal.tsx</code>) terbuka untuk kedua belah pihak. Seluruh kategori item di tas diizinkan untuk di-trade, <strong>kecuali bibit/biji tanaman (<code>seed</code>)</strong>.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>8. Ekonomi Kota, Jukebox Kafe, Pos Polisi &amp; Follow 30 Detik (UC-13, UC-14, UC-17)</h4>
                    <div class="feature-meta">Aktor: Pemain, Peer, Server • Komponen: BankModal, MarketRealtorModal, PharmacyModal</div>
                    <ol class="feature-steps">
                        <li><strong>Fasilitas Kota:</strong> Jual hasil panen/ikan &amp; beli alat/bibit di Pasar Makelar, menabung deposito di Bank Kota, membeli ramuan buff 24 jam di Apotek, memutar musik di Jukebox Kafe, dan mengirim laporan di Pos Polisi.</li>
                        <li><strong>Follow Cooldown 30 Detik:</strong> Permintaan mengikuti pemain lain menampilkan notifikasi 30 detik (Terima / Tolak / Abaikan / Hangus) yang tersinkronisasi dengan database MySQL.</li>
                    </ol>
                </div>
            </div>
        </section>

    @elseif($docType === 'activity')
        <!-- ================================================================ -->
        <!-- 2. ACTIVITY DIAGRAM UTAMA (MONOCHROME PROFESSIONAL)              -->
        <!-- ================================================================ -->
        <section class="card">
            <div class="card-header">
                <h3>Diagram Aktivitas Utama (End-to-End Swimlane User Flow Diagram)</h3>
                <span class="badge-offline">UML 2.5 • Monochrome Vector</span>
            </div>
            <div class="zoom-toolbar">
                <button type="button" class="zoom-btn" onclick="zoomDiagram(0.85)">- Perkecil</button>
                <button type="button" class="zoom-btn" onclick="zoomDiagram(1.0)">100%</button>
                <button type="button" class="zoom-btn" onclick="zoomDiagram(1.2)">+ Perbesar</button>
            </div>
            <div class="diagram-viewport" id="diagram-container">
                <svg id="main-svg-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1320 1040" width="1280" height="1000">
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#111111"/>
                        </marker>
                    </defs>

                    <rect width="1320" height="1040" fill="#FFFFFF"/>

                    <!-- Swimlane Columns -->
                    <rect x="20" y="20" width="420" height="1000" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="1.5"/>
                    <rect x="20" y="20" width="420" height="40" rx="4" fill="#111111"/>
                    <text x="230" y="45" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="13" font-weight="700">SWIMLANE 1: PEMAIN (USER ACTION)</text>

                    <rect x="450" y="20" width="430" height="1000" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="1.5"/>
                    <rect x="450" y="20" width="430" height="40" rx="4" fill="#262626"/>
                    <text x="665" y="45" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="13" font-weight="700">SWIMLANE 2: CLIENT ENGINE (REACT + PHASER 3)</text>

                    <rect x="890" y="20" width="410" height="1000" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="1.5"/>
                    <rect x="890" y="20" width="410" height="40" rx="4" fill="#111111"/>
                    <text x="1095" y="45" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="13" font-weight="700">SWIMLANE 3: SERVER (LARAVEL + MYSQL + SOCKET)</text>

                    <!-- Start Node -->
                    <circle cx="230" cy="92" r="13" fill="#111111"/>
                    <text x="256" y="96" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">START</text>

                    <!-- Step 1: Login & Pilih Gender Male/Female -->
                    <rect x="75" y="124" width="310" height="50" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="230" y="145" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">1. Login / Tamu &amp; Pilih Karakter</text>
                    <text x="230" y="162" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Pilih Gender: Male (Laki-Laki) / Female (Perempuan)</text>
                    <line x1="230" y1="105" x2="230" y2="124" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Step 2: Validasi Sesi & Muat Data -->
                    <rect x="940" y="124" width="310" height="50" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="1095" y="145" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">2. Validasi Akun / Sesi Tamu (HTTP 200)</text>
                    <text x="1095" y="162" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Muat Gold, Level, EXP, Gender &amp; Inventaris</text>
                    <line x1="385" y1="149" x2="940" y2="149" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Step 3: Loading Screen Bersih & Masuk WorldScene -->
                    <rect x="510" y="200" width="310" height="50" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="665" y="221" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">3. Loading Screen (Tanpa UI Controller Mobile)</text>
                    <text x="665" y="238" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Render WorldScene + Mipmap Anti-Shimmer</text>
                    <path d="M 1095 174 L 1095 225 L 820 225" fill="none" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Decision Fork -->
                    <polygon points="665,274 765,306 665,338 565,306" fill="#FFFFFF" stroke="#111111" stroke-width="1.8"/>
                    <text x="665" y="310" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Pilih Aktivitas Utama</text>
                    <line x1="665" y1="250" x2="665" y2="274" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Jalur A: Edukasi Sekolah & Perpustakaan -->
                    <rect x="75" y="365" width="310" height="62" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="230" y="385" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">[Jalur A: Sekolah SD/SMP/SMA &amp; Perpustakaan]</text>
                    <text x="230" y="402" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Baca Bab Konsisten, Klik Gambar untuk Zoom,</text>
                    <text x="230" y="417" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Jawab Latihan Buku (Tanpa Bocoran) &amp; Kuis</text>
                    <path d="M 565 306 L 230 306 L 230 365" fill="none" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <rect x="510" y="365" width="310" height="62" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="665" y="388" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Render Rumus Unik Mapel &amp; Lightbox Gambar</text>
                    <text x="665" y="406" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Validasi Jawaban, Berikan +Gold &amp; +EXP</text>
                    <line x1="385" y1="396" x2="510" y2="396" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Jalur B: Alat [F] (Cangkul, Siram, Tanam, Mancing, Layangan) -->
                    <rect x="75" y="452" width="310" height="64" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="230" y="472" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">[Jalur B: Alat [F] — Kebun, Mancing &amp; Layangan]</text>
                    <text x="230" y="489" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Pilih Slot Hotbar [1-6] lalu Tekan [F]:</text>
                    <text x="230" y="505" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Cangkul / Siram / Tanam / Panen / Mancing</text>

                    <rect x="510" y="452" width="310" height="64" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="665" y="472" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Minigame Mancing 60fps &amp; Panen Kebun</text>
                    <text x="665" y="489" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Tampilkan Notifikasi di Kiri Atas Bawah Profil</text>
                    <text x="665" y="505" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">(Nama, Air/Ambil Nx, Berat kg, Kedalaman, Efek)</text>
                    <line x1="385" y1="484" x2="510" y2="484" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Jalur C: Sosial (Pegangan Tangan & Trade: Wajib Persetujuan Request 30 Detik) -->
                    <rect x="75" y="542" width="310" height="66" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="230" y="562" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">[Jalur C: Tap Profil Pemain Target]</text>
                    <text x="230" y="579" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">1. Kirim Request Pegangan Tangan (Auto-Follow)</text>
                    <text x="230" y="595" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">2. Kirim Request Trade (Semua Item Kecuali Biji)</text>

                    <rect x="510" y="542" width="310" height="66" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="665" y="562" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Pop-up Request di Layar Target (30 Detik)</text>
                    <text x="665" y="579" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Pilihan: [TERIMA], [TOLAK], [ABAIKAN] / Hangus</text>
                    <text x="665" y="595" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Status Pengirim: MENUNGGU RESPON...</text>
                    <line x1="385" y1="575" x2="510" y2="575" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Decision Social Response -->
                    <polygon points="1095,542 1190,575 1095,608 1000,575" fill="#FFFFFF" stroke="#111111" stroke-width="1.8"/>
                    <text x="1095" y="579" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11" font-weight="700">Persetujuan Target?</text>
                    <line x1="820" y1="575" x2="1000" y2="575" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <rect x="940" y="638" width="310" height="58" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="1095" y="658" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Jika Diterima: Auto-Follow / Buka Modal Trade</text>
                    <text x="1095" y="675" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Trade: Teks Murni Tanpa Icon/Logo (Kecuali Biji)</text>
                    <text x="1095" y="690" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="10.5" font-weight="500">Jika Ditolak/Hangus: Permintaan Dibatalkan</text>
                    <line x1="1095" y1="608" x2="1095" y2="638" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Step 8: Pasar, Bank, Apotek & Sync MySQL -->
                    <rect x="940" y="730" width="310" height="60" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="1095" y="752" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">Authoritative Sync ke Database MySQL</text>
                    <text x="1095" y="770" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">POST /api/user/wallet/sync &amp; /sync-progress</text>
                    <line x1="820" y1="396" x2="1095" y2="396" stroke="#111111" stroke-width="1.3"/>
                    <line x1="820" y1="484" x2="1095" y2="484" stroke="#111111" stroke-width="1.3"/>
                    <line x1="1095" y1="696" x2="1095" y2="730" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- Step 9: Update HUD Real-time -->
                    <rect x="510" y="830" width="310" height="52" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                    <text x="665" y="852" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">Perbarui HUD, Notifikasi Kiri Atas &amp; Tas</text>
                    <text x="665" y="869" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Tanpa Reload Halaman (60fps Real-Time)</text>
                    <path d="M 1095 790 L 1095 856 L 820 856" fill="none" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>

                    <!-- End Node -->
                    <circle cx="230" cy="856" r="16" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
                    <circle cx="230" cy="856" r="9" fill="#111111"/>
                    <text x="230" y="892" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">SELESAI / LANJUT BERMAIN</text>
                    <line x1="510" y1="856" x2="246" y2="856" stroke="#111111" stroke-width="1.5" marker-end="url(#arrow)"/>
                </svg>
            </div>
        </section>

        <!-- RINCIAN ALUR ACTIVITY DIAGRAM TIAP FITUR -->
        <section class="card">
            <div class="card-header">
                <h3>Rincian Activity Flow untuk Setiap Subsistem Utama</h3>
            </div>
            <div class="feature-grid">
                <div class="feature-box">
                    <h4>Alur 1: Pemilihan Karakter (Male / Female) &amp; Loading Screen</h4>
                    <div class="feature-meta">Flow: HomeScreen → LoadingScreen → WorldScene</div>
                    <ol class="feature-steps">
                        <li>Pemain memasukkan nama atau login akun, kemudian memilih gender karakter: <strong>Male (Laki-Laki)</strong> atau <strong>Female (Perempuan)</strong>.</li>
                        <li>Saat menekan tombol mulai bermain, <code>LoadingScreen</code> ditampilkan penuh tanpa memunculkan kontrol virtual mobile (<code>!isLoadingScreen</code> guard).</li>
                        <li>Setelah pemuatan selesai, karakter di-spawn di dunia permainan dan kontrol layar diaktifkan.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>Alur 2: Buku Materi Konsisten, Rumus Unik &amp; Zoom Gambar</h4>
                    <div class="feature-meta">Flow: SchoolSubjectsModal → BookMaterialView → Lightbox</div>
                    <ol class="feature-steps">
                        <li>Pemain memilih jenjang (SD/SMP/SMA), mata pelajaran, dan bab materi.</li>
                        <li>Sistem menampilkan 1 pembahasan bab yang utuh dan konsisten beserta kartu rumus unik sesuai karakteristik mata pelajaran.</li>
                        <li>Pemain mengklik/tap gambar ilustrasi untuk memperbesar gambar di modal Lightbox (<code>1x</code>–<code>3x</code>).</li>
                        <li>Pemain menjawab soal latihan pemahaman (tanpa bocoran tanda jawaban benar sebelum memilih opsi) untuk mendapatkan <code>+EXP</code>.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>Alur 3: Penggunaan Alat [F] (Cangkul, Siram, Tanam, Layangan, Mancing)</h4>
                    <div class="feature-meta">Flow: Hotbar / InventoryModal → CharacterController → WorldFarming</div>
                    <ol class="feature-steps">
                        <li>Pemain memilih slot alat di Hotbar (<code>1–6</code>) melalui klik/tap langsung, tombol keyboard <code>1–6</code>, atau dari dalam modal Tas <code>[B]</code>.</li>
                        <li>Saat menekan <code>[F]</code> atau tombol alat mobile:
                            <br>• Jika memegang <strong>Cangkul</strong>: menggemburkan petak tanah kebun.
                            <br>• Jika memegang <strong>Penyiram</strong>: menyiram petak tanah atau mengisi air di pantai.
                            <br>• Jika memegang <strong>Bibit</strong>: menanam bibit di lahan yang sudah dicangkul &amp; disiram.
                            <br>• Jika memegang <strong>Layangan</strong>: menerbangkan atau menggulung layangan di peta dunia.
                            <br>• Jika memegang <strong>Joran Pancing</strong> di tepi air: melempar kail &amp; menjalankan minigame 60fps.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>Alur 4: Notifikasi Ikan &amp; Hasil Panen di Kiri Atas Bawah Profil</h4>
                    <div class="feature-meta">Flow: CharacterController / WorldFarming → EventBus → HUD.tsx</div>
                    <ol class="feature-steps">
                        <li>Saat berhasil menangkap ikan atau memanen tanaman, sistem menghapus balon kata di atas karakter (<code>clearSpeechBubble()</code>).</li>
                        <li>Sistem mengirim event <code>fishing-caught</code> atau <code>farming-crop-harvested</code> ke <code>HUD.tsx</code>.</li>
                        <li><code>HUD.tsx</code> menampilkan kartu notifikasi tepat di bawah tombol Profil (kiri atas) berisi nama ikan/buah, jenis air atau jumlah panen ke-<code>Nx</code>, berat (<code>kg</code>), kedalaman (<code>m</code>), dan efek unik.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>Alur 5: Pegangan Tangan &amp; Trade Barang (Wajib Persetujuan Target Cooldown 30 Detik)</h4>
                    <div class="feature-meta">Flow: ProfileModal → FriendRequestNotification → NetworkManager → WorldScene / PlayerTradeModal</div>
                    <ol class="feature-steps">
                        <li>Pemain mengetuk karakter pemain target untuk membuka <code>ProfileModal</code>.</li>
                        <li><strong>Pengiriman Request (Ajakan):</strong> Saat menekan tombol <em>Pegangan Tangan</em> atau <em>Trade Barang</em>, sistem tidak langsung mengeksekusi aksi melainkan mengirimkan paket request jaringan. Tombol pemain pengajak berubah status menjadi <code>MENUNGGU RESPON...</code>.</li>
                        <li><strong>Pop-up Notifikasi di Layar Target:</strong> Layar pemain target menampilkan pop-up <code>FriendRequestNotification.tsx</code> dengan hitung mundur 30 detik:
                            <br>• <strong>Tombol [TERIMA]:</strong> Menyetujui ajakan.
                            <br>• <strong>Tombol [TOLAK]:</strong> Membatalkan ajakan secara eksplisit.
                            <br>• <strong>Tombol [ABAIKAN] / Timeout (30 detik):</strong> Menutup notifikasi dan membatalkan ajakan.</li>
                        <li><strong>Hasil Jika Diterima:</strong>
                            <br>• <strong>Pegangan Tangan:</strong> Karakter target seketika beralih mode dan otomatis berjalan mengikuti (<em>auto-follow</em>) langkah karakter pengajak.
                            <br>• <strong>Trade Barang:</strong> Modal Trade (<code>PlayerTradeModal.tsx</code>) terbuka bagi kedua pemain dengan tampilan bersih <em>tanpa icon/logo</em> (berbasis teks murni), mengizinkan semua barang di tas <strong>kecuali bibit/biji tanaman (<code>seed</code>)</strong>.</li>
                    </ol>
                </div>

                <div class="feature-box">
                    <h4>Alur 6: Anti-Shimmer Saat Zoom Out Jauh &amp; Bergerak</h4>
                    <div class="feature-meta">Flow: SettingsModal → GraphicsQualityManager → WebGL Renderer</div>
                    <ol class="feature-steps">
                        <li>Pemain mengatur Kualitas Grafik (Rendah / Sedang / Tinggi) dan Anti-Aliasing di <code>SettingsModal</code>.</li>
                        <li><code>GraphicsQualityManager</code> membangkitkan WebGL Hardware Mipmaps (<code>LINEAR_MIPMAP_LINEAR</code>), Anisotropic Filtering, dan mengatur <code>roundPixels</code> kamera.</li>
                        <li>Saat pemain melakukan zoom out jauh dan bergerak, tekstur bangunan, pohon, dan jalan tetap stabil tanpa garis berkedip-kedip.</li>
                    </ol>
                </div>
            </div>
        </section>

    @else
        <!-- ================================================================ -->
        <!-- 3. WIREFRAME ANTARMUKA UTAMA (MONOCHROME PROFESSIONAL)           -->
        <!-- ================================================================ -->
        <section class="card">
            <div class="card-header">
                <h3>3 Wireframe Antarmuka Utama RadenWorld (Monochrome Low/Mid-Fidelity Blueprint)</h3>
                <span class="badge-offline">UI/UX Wireframe • Monochrome Vector</span>
            </div>
            <div class="zoom-toolbar">
                <button type="button" class="zoom-btn" onclick="zoomDiagram(0.85)">- Perkecil</button>
                <button type="button" class="zoom-btn" onclick="zoomDiagram(1.0)">100%</button>
                <button type="button" class="zoom-btn" onclick="zoomDiagram(1.2)">+ Perbesar</button>
            </div>
            <div class="diagram-viewport" id="diagram-container">
                <svg id="main-svg-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1320 1280" width="1280" height="1240">
                    <rect width="1320" height="1280" fill="#FFFFFF"/>

                    <!-- WIREFRAME 1: BERANDA / LOBBY & PEMILIHAN KARAKTER (MALE / FEMALE) -->
                    <g transform="translate(30, 24)">
                        <rect width="1260" height="370" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="2"/>
                        <rect width="1260" height="38" rx="4" fill="#111111"/>
                        <text x="18" y="24" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="13.5" font-weight="700">
                            WIREFRAME 1: BERANDA (LOBBY), AUTENTIKASI AKUN &amp; PEMILIHAN KARAKTER (MALE / FEMALE)
                        </text>

                        <rect x="24" y="54" width="250" height="34" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.2"/>
                        <text x="149" y="75" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">Server Aktif: Asia 1 (Online)</text>

                        <rect x="1020" y="54" width="216" height="34" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.2"/>
                        <text x="1128" y="75" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="600">Pengaturan Grafik &amp; Audio</text>

                        <!-- Panel Kiri: Login & Akun -->
                        <rect x="24" y="104" width="360" height="242" rx="4" fill="#FFFFFF" stroke="#404040" stroke-width="1.2" stroke-dasharray="5,3"/>
                        <text x="204" y="128" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12.5" font-weight="700">PANEL AUTENTIKASI AKUN</text>
                        <rect x="44" y="144" width="320" height="34" rx="4" fill="#FAFAFA" stroke="#737373" stroke-width="1.2"/>
                        <text x="58" y="165" fill="#404040" font-family="Inter, Segoe UI" font-size="11.5" font-weight="500">Input Nama Karakter / Email</text>
                        <rect x="44" y="188" width="320" height="34" rx="4" fill="#FAFAFA" stroke="#737373" stroke-width="1.2"/>
                        <text x="58" y="209" fill="#404040" font-family="Inter, Segoe UI" font-size="11.5" font-weight="500">Kata Sandi / Kode OTP 6-Digit</text>
                        <rect x="44" y="234" width="154" height="36" rx="4" fill="#111111"/>
                        <text x="121" y="256" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">MASUK AKUN</text>
                        <rect x="210" y="234" width="154" height="36" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="287" y="256" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">DAFTAR BARU</text>
                        <text x="204" y="302" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Mendukung Google OAuth &amp; Mode Tamu</text>

                        <!-- Panel Tengah: Pratinjau Karakter -->
                        <rect x="405" y="104" width="450" height="242" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="630" y="128" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="13" font-weight="700">PRATINJAU KARAKTER 2D</text>
                        <circle cx="630" cy="192" r="40" fill="#F5F5F5" stroke="#111111" stroke-width="2"/>
                        <text x="630" y="196" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11" font-weight="700">SPRITE 2D</text>
                        <rect x="465" y="280" width="330" height="46" rx="4" fill="#111111"/>
                        <text x="630" y="308" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="13.5" font-weight="700">MULAI MASUK KE DUNIA (PLAY)</text>

                        <!-- Panel Kanan: Pilihan Gender (Male / Female) -->
                        <rect x="875" y="104" width="361" height="242" rx="4" fill="#FFFFFF" stroke="#404040" stroke-width="1.2" stroke-dasharray="5,3"/>
                        <text x="1055" y="128" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12.5" font-weight="700">PILIHAN GENDER KARAKTER</text>
                        <rect x="895" y="148" width="152" height="64" rx="4" fill="#111111"/>
                        <text x="971" y="176" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="12" font-weight="700">MALE</text>
                        <text x="971" y="194" text-anchor="middle" fill="#D4D4D4" font-family="Inter, Segoe UI" font-size="10.5" font-weight="500">(Laki-Laki — Aktif)</text>
                        <rect x="1063" y="148" width="152" height="64" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="1139" y="176" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">FEMALE</text>
                        <text x="1139" y="194" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="10.5" font-weight="500">(Perempuan)</text>
                        <rect x="895" y="228" width="320" height="96" rx="4" fill="#F5F5F5" stroke="#A3A3A3" stroke-width="1.2"/>
                        <text x="1055" y="256" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Sistem Karakter Sederhana &amp; Konsisten</text>
                        <text x="1055" y="276" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Tanpa kustomisasi seragam/pakaian rumit;</text>
                        <text x="1055" y="294" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">cukup pilih Male atau Female lalu bermain.</text>
                    </g>

                    <!-- WIREFRAME 2: IN-GAME HUD, NOTIFIKASI IKAN/PANEN KIRI ATAS, HOTBAR [F] & SOSIAL -->
                    <g transform="translate(30, 418)">
                        <rect width="1260" height="415" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="2"/>
                        <rect width="1260" height="38" rx="4" fill="#111111"/>
                        <text x="18" y="24" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="13.5" font-weight="700">
                            WIREFRAME 2: HUD OPEN WORLD, NOTIFIKASI IKAN/PANEN DI BAWAH PROFIL, ALAT [F] &amp; PROFIL SOSIAL
                        </text>

                        <!-- Kiri Atas: Profile Box -->
                        <rect x="24" y="52" width="300" height="68" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <circle cx="58" cy="86" r="22" fill="#F0F0F0" stroke="#111111" stroke-width="1.5"/>
                        <text x="58" y="90" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="10.5" font-weight="700">LV.12</text>
                        <text x="92" y="73" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">Profil Pemain (Male/Female)</text>
                        <rect x="92" y="80" width="210" height="12" rx="3" fill="#E5E5E5" stroke="#111111" stroke-width="1"/>
                        <rect x="92" y="80" width="140" height="12" rx="3" fill="#404040"/>
                        <text x="92" y="108" fill="#262626" font-family="Inter, Segoe UI" font-size="11" font-weight="600">Gold: 14.500 G • HP: 100/100</text>

                        <!-- Tepat di Bawah Profil: Notifikasi Ikan / Hasil Panen -->
                        <rect x="24" y="128" width="300" height="92" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.8"/>
                        <rect x="24" y="128" width="300" height="22" rx="3" fill="#262626"/>
                        <text x="34" y="143" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="10.5" font-weight="700">NOTIFIKASI TANGKAPAN / HASIL PANEN</text>
                        <text x="34" y="165" fill="#111111" font-family="Inter, Segoe UI" font-size="11" font-weight="700">• Ikan Mujair (Tawar) | 50 kg | 8.5m</text>
                        <text x="34" y="181" fill="#525252" font-family="Inter, Segoe UI" font-size="10.5" font-weight="500">  Efek: Pulihkan +30 HP &amp; Fokus +15%</text>
                        <text x="34" y="200" fill="#111111" font-family="Inter, Segoe UI" font-size="11" font-weight="700">• Buah Apel (Diambil 5x) | 50 kg | Efek Unik</text>

                        <!-- Tengah Atas: Modal Profil & Pop-Up Request (Persetujuan 30 Detik) -->
                        <rect x="348" y="52" width="564" height="168" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="630" y="74" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">
                            PROFIL PEMAIN TARGET &amp; POP-UP REQUEST (WAJIB PERSETUJUAN 30 DETIK)
                        </text>
                        <text x="630" y="92" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="10.5" font-weight="500">
                            Pemain A Klik Tombol -> Tombol Jadi "MENUNGGU RESPON..." -> Layar Target Memunculkan Pop-up:
                        </text>
                        <rect x="372" y="104" width="160" height="34" rx="4" fill="#111111"/>
                        <text x="452" y="126" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="11" font-weight="700">PEGANGAN TANGAN</text>
                        <rect x="550" y="104" width="160" height="34" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="630" y="126" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11" font-weight="700">TRADE (TANPA LOGO)</text>
                        <rect x="728" y="104" width="160" height="34" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="808" y="126" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11" font-weight="700">IKUTI (FOLLOW 30D)</text>
                        <rect x="372" y="146" width="516" height="64" rx="4" fill="#FAFAFA" stroke="#404040" stroke-width="1.2" stroke-dasharray="4,3"/>
                        <text x="630" y="164" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="10.5" font-weight="700">
                            POP-UP NOTIFIKASI DI LAYAR TARGET: [Ajakan Trade / Pegangan Tangan (⏱️ 30 Detik)]
                        </text>
                        <text x="630" y="181" text-anchor="middle" fill="#262626" font-family="Inter, Segoe UI" font-size="10" font-weight="600">
                            Pilihan Respon Target:  [ ✅ TERIMA ]     [ ❌ TOLAK ]     [ 🙈 ABAIKAN / HANGUS ]
                        </text>
                        <text x="630" y="198" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="9.5" font-weight="500">
                            *Jika TERIMA: Pegangan Tangan (Auto-follow) aktif ATAU Sesi Trade (Teks Murni Non-Biji) dibuka.
                        </text>

                        <!-- Kanan Atas: Minimap -->
                        <rect x="936" y="52" width="300" height="168" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="1086" y="76" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">RADAR MINIMAP &amp; KONTROL ATAS</text>
                        <rect x="956" y="88" width="260" height="82" rx="4" fill="#F5F5F5" stroke="#737373" stroke-width="1"/>
                        <text x="1086" y="133" text-anchor="middle" fill="#404040" font-family="Inter, Segoe UI" font-size="11" font-weight="600">Peta Dunia 2D &amp; Waypoint Grid</text>
                        <text x="1086" y="194" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11" font-weight="600">Grid: 58, 5 • Waktu Dunia • Voice Mic</text>

                        <!-- Area Canvas -->
                        <rect x="24" y="234" width="1212" height="94" rx="4" fill="#FFFFFF" stroke="#737373" stroke-width="1.2" stroke-dasharray="6,4"/>
                        <text x="630" y="274" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="13" font-weight="700">
                            AREA CANVAS 2D OPEN WORLD (MIPMAP ANTI-SHIMMER SAAT ZOOM OUT JAUH &amp; BERGERAK)
                        </text>
                        <text x="630" y="298" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11.5" font-weight="500">
                            Tanpa balon chat tangkapan ikan/panen di atas karakter (digantikan kartu notifikasi kiri atas di bawah profil)
                        </text>

                        <!-- Bawah: Analog, Hotbar 6 Slot & Tombol Alat [F] -->
                        <rect x="24" y="342" width="220" height="54" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="134" y="373" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">ANALOG GERAK 360°</text>

                        <rect x="264" y="342" width="712" height="54" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="620" y="373" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">
                            HOTBAR [1-6]:  [1: Pancing]  [2: Bibit]  [3: Cangkul]  [4: Penyiram]  [5: Layangan]  [6: Apel]  |  [Tas B]
                        </text>

                        <rect x="996" y="342" width="240" height="54" rx="4" fill="#111111"/>
                        <text x="1116" y="366" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="12" font-weight="700">TOMBOL ALAT [F]</text>
                        <text x="1116" y="383" text-anchor="middle" fill="#D4D4D4" font-family="Inter, Segoe UI" font-size="10" font-weight="500">(Cangkul/Siram/Mancing/Layangan)</text>
                    </g>

                    <!-- WIREFRAME 3: BUKU MATERI (RUMUS UNIK & ZOOM GAMBAR), LATIHAN TANPA BOCORAN & MINIGAME 60FPS -->
                    <g transform="translate(30, 858)">
                        <rect width="1260" height="396" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="2"/>
                        <rect width="1260" height="38" rx="4" fill="#111111"/>
                        <text x="18" y="24" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="13.5" font-weight="700">
                            WIREFRAME 3: BUKU MATERI (ZOOM GAMBAR &amp; RUMUS UNIK), LATIHAN TANPA BOCORAN &amp; MINIGAME 60FPS
                        </text>

                        <!-- Sub-panel 1: Halaman Kiri Buku (Ilustrasi Zoomable & Rumus Unik) -->
                        <rect x="24" y="56" width="390" height="320" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="219" y="80" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12.5" font-weight="700">HALAMAN KIRI: VISUAL &amp; RUMUS UNIK</text>
                        <rect x="40" y="94" width="358" height="104" rx="4" fill="#F5F5F5" stroke="#111111" stroke-width="1.2"/>
                        <text x="219" y="134" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">ILUSTRASI MATERI BERKUALITAS TINGGI</text>
                        <text x="219" y="156" text-anchor="middle" fill="#404040" font-family="Inter, Segoe UI" font-size="11" font-weight="500">[Klik / Tap Gambar untuk Perbesar Penuh 1x–3x]</text>
                        <rect x="40" y="210" width="358" height="148" rx="4" fill="#FFFFFF" stroke="#404040" stroke-width="1.2"/>
                        <text x="219" y="234" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12" font-weight="700">KARTU RUMUS UNIK SESUAI MAPEL</text>
                        <text x="219" y="256" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Matematika: Pecahan Vertikal / Operasi Hitung</text>
                        <text x="219" y="276" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Sains (IPA): Pita Reaksi &amp; Besaran Fisis</text>
                        <text x="219" y="296" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Sosial / Bahasa: Bagan Silsilah &amp; Pola Kalimat</text>

                        <!-- Sub-panel 2: Halaman Kanan Buku (Materi Konsisten & Latihan Tanpa Bocoran) -->
                        <rect x="435" y="56" width="390" height="320" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="630" y="80" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12.5" font-weight="700">HALAMAN KANAN: MATERI &amp; LATIHAN JUJUR</text>
                        <rect x="451" y="94" width="358" height="104" rx="4" fill="#FAFAFA" stroke="#737373" stroke-width="1.2"/>
                        <text x="630" y="122" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Uraian Materi 1 Topik Utuh &amp; Konsisten</text>
                        <text x="630" y="144" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">Tidak digabung/dicampur antar bab berbeda;</text>
                        <text x="630" y="162" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">langkah penjelasan runtut dari dasar ke contoh.</text>
                        <rect x="451" y="210" width="358" height="148" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.2"/>
                        <text x="630" y="234" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Latihan Pemahaman Buku (Tanpa Tanda Bocoran)</text>
                        <rect x="467" y="248" width="326" height="24" rx="3" fill="#FAFAFA" stroke="#737373" stroke-width="1"/>
                        <text x="480" y="264" fill="#111111" font-family="Inter, Segoe UI" font-size="10.5" font-weight="600">[A] Pilihan Jawaban Pertama (Netral)</text>
                        <rect x="467" y="278" width="326" height="24" rx="3" fill="#FAFAFA" stroke="#737373" stroke-width="1"/>
                        <text x="480" y="294" fill="#111111" font-family="Inter, Segoe UI" font-size="10.5" font-weight="600">[B] Pilihan Jawaban Kedua (Netral)</text>
                        <text x="630" y="330" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="10.5" font-weight="500">*Kunci jawaban baru tampil setelah opsi dipilih.</text>

                        <!-- Sub-panel 3: Minigame Mancing 60fps & Modal Trade Non-Biji -->
                        <rect x="846" y="56" width="390" height="320" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
                        <text x="1041" y="80" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="12.5" font-weight="700">MINIGAME MANCING 60FPS &amp; TRADE</text>
                        <rect x="862" y="94" width="358" height="122" rx="4" fill="#FAFAFA" stroke="#111111" stroke-width="1.2"/>
                        <text x="1041" y="118" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">UI Memancing GPU-Accelerated (0ms Delay)</text>
                        <text x="1041" y="140" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Peringatan Sambaran Ikan Instan Tanpa Reflow</text>
                        <text x="1041" y="160" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Catch Bar &amp; Indikator Ikan via DOM Ref translate3d</text>
                        <text x="1041" y="180" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Tahan [Space] / [F] / Sentuh Layar untuk Menarik</text>
                        <rect x="862" y="228" width="358" height="130" rx="4" fill="#FFFFFF" stroke="#111111" stroke-width="1.2"/>
                        <text x="1041" y="252" text-anchor="middle" fill="#111111" font-family="Inter, Segoe UI" font-size="11.5" font-weight="700">Modal Trade Bersih (Text-Only, Tanpa Icon/Logo)</text>
                        <text x="1041" y="274" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Wajib Persetujuan Target Terlebih Dahulu (Cooldown 30d)</text>
                        <text x="1041" y="294" text-anchor="middle" fill="#525252" font-family="Inter, Segoe UI" font-size="11" font-weight="500">• Barter Ikan, Hasil Panen, Makanan, Ramuan (Kecuali Biji)</text>
                        <rect x="882" y="312" width="318" height="32" rx="4" fill="#111111"/>
                        <text x="1041" y="332" text-anchor="middle" fill="#FFFFFF" font-family="Inter, Segoe UI" font-size="11" font-weight="700">KIRIM PENAWARAN TRADE KE PEMAIN</text>
                    </g>
                </svg>
            </div>
        </section>

        <!-- TABEL SPESIFIKASI INTERAKSI SISTEM -->
        <section class="card">
            <div class="card-header">
                <h3>Tabel Spesifikasi Komponen Antarmuka &amp; Interaksi Sistem</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 22%;">Komponen UI</th>
                        <th style="width: 26%;">File Implementasi</th>
                        <th style="width: 52%;">Perilaku &amp; Aturan Sistem</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Loading Screen &amp; Kontrol Mobile</strong></td>
                        <td><code>GameApp.tsx</code>, <code>LoadingScreen.tsx</code></td>
                        <td>Saat <code>isLoadingScreen === true</code>, seluruh HUD dan <code>VirtualControls</code> disembunyikan penuh sehingga controller mobile tidak pernah bocor di layar loading.</td>
                    </tr>
                    <tr>
                        <td><strong>Pemilihan Gender Karakter</strong></td>
                        <td><code>HomeScreen.tsx</code>, <code>Player.ts</code></td>
                        <td>Pemain memilih karakter <strong>Male (Laki-Laki)</strong> atau <strong>Female (Perempuan)</strong> tanpa kustomisasi seragam atau warna pakaian yang rumit.</td>
                    </tr>
                    <tr>
                        <td><strong>Notifikasi Ikan &amp; Hasil Panen (Kiri Atas)</strong></td>
                        <td><code>HUD.tsx</code>, <code>CharacterController.ts</code>, <code>WorldFarming.ts</code></td>
                        <td>Tampil tepat di bawah tombol Profil (kiri atas) dan menghapus balon teks karakter. Menampilkan nama ikan (Tawar/Payau/Laut), berat (<code>kg</code>), kedalaman (<code>m</code>), dan efek ikan; atau nama panen, berapa kali diambil (<code>5x</code>), berat dinamis (<code>kg</code>), dan efek panen.</td>
                    </tr>
                    <tr>
                        <td><strong>Pegangan Tangan, Trade &amp; Ikuti (Real-Time 0ms, Wajib Persetujuan 30d &amp; Teks Murni Tanpa Icon/Emote)</strong></td>
                        <td><code>ProfileModal.tsx</code>, <code>FriendRequestNotification.tsx</code>, <code>PlayerTradeModal.tsx</code>, <code>NetworkManager.ts</code></td>
                        <td>Seluruh aksi sosial (Minta Gendong / Pegangan Tangan, Trade Barang, dan Ikuti) dipancarkan secara instan real-time via WebSocket ke layar target. Pegangan Tangan &amp; Trade wajib menunggu persetujuan (Request 30 detik: Terima / Tolak / Abaikan). Tombol Pegangan Tangan (<code>[PEGANGAN TANGAN]</code>, <code>[LEPAS TANGAN]</code>) serta Trade didesain super bersih berbasis teks murni tanpa icon atau emote apapun. Jika diterima: Pegangan Tangan mengaktifkan auto-follow penerima ke pengajak; Trade Barang membuka modal teks murni non-biji (<code>seed</code>) untuk barter.</td>
                    </tr>
                    <tr>
                        <td><strong>Tombol Alat Fleksibel [F]</strong></td>
                        <td><code>CharacterController.ts</code>, <code>Hotbar.tsx</code>, <code>InventoryModal.tsx</code></td>
                        <td>Mendukung pergantian instan antara Joran Pancing, Bibit, Cangkul, Penyiram Air, dan Layang-Layang via tombol <code>1–6</code>, klik Hotbar, atau modal Tas <code>[B]</code>, serta deteksi langkah kebun otomatis di Lahan Tani.</td>
                    </tr>
                    <tr>
                        <td><strong>Buku Materi, Rumus Unik &amp; Zoom Gambar</strong></td>
                        <td><code>BookMaterialView.tsx</code>, <code>SchoolSubjectsModal.tsx</code></td>
                        <td>Setiap bab fokus pada satu pembahasan konsisten, memiliki kartu rumus unik sesuai mata pelajaran, mendukung klik/tap gambar untuk zoom penuh, dan latihan pemahaman tidak membocorkan kunci jawaban sebelum dijawab.</td>
                    </tr>
                    <tr>
                        <td><strong>Anti-Shimmer Zoom Out &amp; Grafik</strong></td>
                        <td><code>GraphicsQualityManager.ts</code>, <code>WorldTerrain.ts</code></td>
                        <td>Menggunakan WebGL Hardware Mipmap (Trilinear/Bilinear), Anisotropic Filtering, dan sub-pixel overlap <code>+0.8px</code> agar aset bangunan/jalan tidak berkedip saat zoom out jauh dan bergerak.</td>
                    </tr>
                </tbody>
            </table>
        </section>
    @endif
</main>

<script>
    var currentZoom = 1.0;
    function zoomDiagram(scale) {
        currentZoom = scale;
        var svg = document.getElementById('main-svg-diagram');
        if (!svg) return;
        var baseW = parseFloat(svg.getAttribute('data-base-w') || svg.getAttribute('width') || '1280');
        var baseH = parseFloat(svg.getAttribute('data-base-h') || svg.getAttribute('height') || '950');
        if (!svg.getAttribute('data-base-w')) {
            svg.setAttribute('data-base-w', String(baseW));
            svg.setAttribute('data-base-h', String(baseH));
        }
        svg.style.width = Math.round(baseW * scale) + 'px';
        svg.style.height = Math.round(baseH * scale) + 'px';
    }

    function downloadDiagramSVG() {
        var svg = document.getElementById('main-svg-diagram');
        if (!svg) return;
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(svg);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        var xmlPreamble = '<' + '?xml version="1.0" standalone="no"?' + '>\r\n';
        var svgBlob = new Blob([xmlPreamble + source], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(svgBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'RadenWorld_{{ $docType }}_diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    function downloadDiagramPNG() {
        var svg = document.getElementById('main-svg-diagram');
        if (!svg) return;
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(svg);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        var viewBox = (svg.getAttribute('viewBox') || '0 0 1320 980').split(' ');
        var w = parseInt(viewBox[2], 10) || 1320;
        var h = parseInt(viewBox[3], 10) || 980;
        var canvas = document.createElement('canvas');
        var scale = 2;
        canvas.width = w * scale;
        canvas.height = h * scale;
        var ctx = canvas.getContext('2d');
        var img = new Image();
        var xmlPreamble = '<' + '?xml version="1.0" standalone="no"?' + '>\r\n';
        var svgBlob = new Blob([xmlPreamble + source], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(svgBlob);
        img.onerror = function() {
            console.error('Gagal merender SVG ke Canvas Image.');
            URL.revokeObjectURL(url);
        };
        img.onload = function () {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            canvas.toBlob(function (pngBlob) {
                if (!pngBlob) return;
                var pngUrl = URL.createObjectURL(pngBlob);
                var a = document.createElement('a');
                a.href = pngUrl;
                a.download = 'RadenWorld_{{ $docType }}_HD.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function () { URL.revokeObjectURL(pngUrl); }, 1500);
            }, 'image/png');
        };
        img.src = url;
    }

    window.addEventListener('DOMContentLoaded', function () {
        var params = new URLSearchParams(window.location.search);
        if (params.get('download') === 'png') {
            setTimeout(downloadDiagramPNG, 300);
        } else if (params.get('download') === 'svg') {
            setTimeout(downloadDiagramSVG, 300);
        }
    });
</script>
</body>
</html>
