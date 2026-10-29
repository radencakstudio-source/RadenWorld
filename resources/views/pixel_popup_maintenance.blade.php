<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RadenWorld // 1920x1080 Pixel Billboard - Mode Pemeliharaan</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #07090e;
            --panel-bg: rgba(13, 17, 28, 0.92);
            --panel-border: rgba(245, 158, 11, 0.35);
            --accent-amber: #f59e0b;
            --accent-cyan: #06b6d4;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Chakra Petch', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            position: relative;
            overflow-x: hidden;
        }

        /* Cyberpunk Grid Background */
        .grid-bg {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(to right, rgba(245, 158, 11, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(245, 158, 11, 0.05) 1px, transparent 1px);
            background-size: 32px 32px;
            pointer-events: none;
        }

        .ambient-glow {
            position: absolute;
            width: 450px;
            height: 450px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(6, 182, 212, 0.04) 60%, transparent 100%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            filter: blur(40px);
        }

        .card {
            position: relative;
            max-width: 580px;
            width: 100%;
            background: var(--panel-bg);
            border: 2px solid var(--panel-border);
            border-radius: 18px;
            padding: 2.25rem 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.15);
            backdrop-filter: blur(16px);
            text-align: center;
            z-index: 10;
        }

        .badge-status {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.4);
            color: var(--accent-amber);
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            margin-bottom: 1.25rem;
        }

        .pulse-dot {
            width: 8px;
            height: 8px;
            background: var(--accent-amber);
            border-radius: 50%;
            animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }

        .icon-billboard {
            width: 72px;
            height: 72px;
            margin: 0 auto 1.25rem;
            background: rgba(0, 0, 0, 0.6);
            border: 2px dashed rgba(245, 158, 11, 0.5);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.2rem;
            box-shadow: inset 0 0 15px rgba(245, 158, 11, 0.1);
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            color: #ffffff;
            margin-bottom: 0.6rem;
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 0.95rem;
            color: var(--accent-amber);
            font-weight: 600;
            letter-spacing: 0.08em;
            margin-bottom: 1.25rem;
            text-transform: uppercase;
        }

        .description {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            line-height: 1.6;
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }

        .notice-box {
            background: rgba(0, 0, 0, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 0.85rem 1rem;
            font-family: 'Inter', sans-serif;
            font-size: 0.8rem;
            color: #cbd5e1;
            margin-bottom: 1.75rem;
            text-align: left;
        }

        .notice-box ul {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .notice-box li::before {
            content: "▹";
            color: var(--accent-amber);
            margin-right: 0.5rem;
            font-weight: bold;
        }

        .btn-group {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #000000;
            text-decoration: none;
            font-weight: 800;
            font-size: 0.875rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
            transition: all 0.2s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        }

        .footer-brand {
            margin-top: 1.5rem;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.25);
            letter-spacing: 0.15em;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="grid-bg"></div>
    <div class="ambient-glow"></div>

    <div class="card">
        <div class="badge-status">
            <span class="pulse-dot"></span>
            <span>Mode Pemeliharaan (Maintenance)</span>
        </div>

        <div class="icon-billboard">
            🛠️
        </div>

        <h1>1920x1080 Pixel Billboard</h1>
        <div class="subtitle">Kanvas Iklan Digital RadenWorld</div>

        <p class="description">
            Fitur Billboard Reklame Kanvas Iklan Digital sedang dinonaktifkan sementara di server online untuk optimalisasi database dan integrasi sistem.
        </p>

        <div class="notice-box">
            <ul>
                <li><strong>Server Online:</strong> Halaman popup iklan ditutup sementara hingga proses maintenance selesai.</li>
                <li><strong>Server Offline / Lokal:</strong> Fitur billboard dan API pixel canvas tetap aktif berjalan normal untuk pengujian di localhost / Laragon.</li>
            </ul>
        </div>

        <div class="btn-group">
            <a href="/world" class="btn-primary">
                🎮 Kembali Masuk ke RadenWorld
            </a>
        </div>

        <div class="footer-brand">
            RadenWorld Engine © 2026 // RadenCak Studio
        </div>
    </div>
</body>
</html>
