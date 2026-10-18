<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>RadenWorld // 1920x1080 Pixel Billboard - Kanvas Iklan Digital</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #090d16;
            --panel-bg: rgba(15, 23, 42, 0.88);
            --panel-border: rgba(56, 189, 248, 0.25);
            --accent-gold: #f59e0b;
            --accent-cyan: #06b6d4;
            --accent-green: #10b981;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* TOP NAVIGATION & CUAN BAR */
        header {
            height: 64px;
            background: rgba(10, 15, 29, 0.95);
            border-bottom: 1px solid var(--panel-border);
            backdrop-filter: blur(16px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.25rem;
            z-index: 50;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .brand-area {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .brand-badge {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #0f172a;
            font-family: 'Chakra Petch', sans-serif;
            font-weight: 700;
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            letter-spacing: 1px;
        }

        .brand-title {
            font-family: 'Chakra Petch', sans-serif;
            font-weight: 700;
            font-size: 1.15rem;
            color: #fff;
            letter-spacing: 0.5px;
        }

        .brand-title span {
            color: var(--accent-cyan);
        }

        /* CUAN STATS */
        .cuan-stats {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(245, 158, 11, 0.25);
            border-radius: 8px;
            padding: 0.35rem 1rem;
        }

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .stat-label {
            font-size: 0.68rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            font-weight: 600;
        }

        .stat-value {
            font-family: 'Chakra Petch', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            color: #fbbf24;
        }

        .stat-value.cyan {
            color: #38bdf8;
        }

        .stat-value.green {
            color: #34d399;
        }

        /* TOP ACTIONS */
        .top-actions {
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            background: rgba(30, 41, 59, 0.8);
            color: #f1f5f9;
            border: 1px solid rgba(148, 163, 184, 0.2);
            padding: 0.45rem 0.9rem;
            border-radius: 6px;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            font-family: 'Inter', sans-serif;
        }

        .btn:hover {
            background: rgba(51, 65, 85, 0.9);
            border-color: var(--accent-cyan);
            color: #fff;
            transform: translateY(-1px);
        }

        .btn-primary {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            border-color: #38bdf8;
            color: #fff;
            box-shadow: 0 0 15px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #38bdf8, #0ea5e9);
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.5);
        }

        .btn-gold {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-color: #fbbf24;
            color: #0f172a;
            font-weight: 700;
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
        }

        .btn-gold:hover {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: #000;
        }

        /* WORKSPACE / VIEWPORT CONTAINER */
        #viewport {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: radial-gradient(circle at center, #111827 0%, #030712 100%);
            cursor: crosshair;
        }

        #viewport.panning {
            cursor: grab;
        }

        #viewport.panning:active {
            cursor: grabbing;
        }

        /* THE 1920x1080 CANVAS CONTAINER */
        #canvas-stage {
            position: absolute;
            width: 1920px;
            height: 1080px;
            transform-origin: 0 0;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(56, 189, 248, 0.3);
            background: #ffffff;
            image-rendering: pixelated;
        }

        #main-canvas {
            display: block;
            width: 1920px;
            height: 1080px;
            image-rendering: pixelated;
        }

        /* SELECTION BOX OVERLAY */
        #selection-box {
            position: absolute;
            display: none;
            border: 2px dashed #00f0ff;
            background: rgba(0, 240, 255, 0.2);
            pointer-events: none;
            z-index: 20;
            box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
        }

        /* FLOATING SELECTION BADGE */
        #selection-badge {
            position: absolute;
            display: none;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid #38bdf8;
            padding: 0.5rem 0.8rem;
            border-radius: 8px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
            z-index: 40;
            pointer-events: auto;
            white-space: nowrap;
            backdrop-filter: blur(8px);
        }

        .badge-metrics {
            font-family: 'Chakra Petch', sans-serif;
            font-size: 0.82rem;
            font-weight: 700;
            color: #38bdf8;
            margin-bottom: 0.25rem;
        }

        .badge-price {
            font-size: 0.78rem;
            color: #fbbf24;
            font-weight: 600;
            margin-bottom: 0.4rem;
        }

        /* FLOATING TOOLBAR (BOTTOM CENTER) */
        .floating-toolbar {
            position: absolute;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.92);
            border: 1px solid var(--panel-border);
            border-radius: 12px;
            padding: 0.4rem 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            backdrop-filter: blur(12px);
            z-index: 40;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .tool-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 0.45rem 0.65rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.82rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.35rem;
            transition: all 0.15s;
        }

        .tool-btn.active, .tool-btn:hover {
            color: #fff;
            background: rgba(56, 189, 248, 0.18);
            border: 1px solid rgba(56, 189, 248, 0.4);
        }

        .toolbar-divider {
            width: 1px;
            height: 24px;
            background: rgba(148, 163, 184, 0.2);
        }

        /* COORDINATE HUD (BOTTOM LEFT) */
        .coord-hud {
            position: absolute;
            bottom: 1.5rem;
            left: 1.5rem;
            background: rgba(15, 23, 42, 0.88);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            padding: 0.4rem 0.8rem;
            font-family: 'Chakra Petch', sans-serif;
            font-size: 0.82rem;
            color: #94a3b8;
            backdrop-filter: blur(8px);
            z-index: 40;
        }

        .coord-hud span {
            color: var(--accent-cyan);
            font-weight: 700;
        }

        /* MINIMAP (BOTTOM RIGHT) */
        .minimap-container {
            position: absolute;
            bottom: 1.5rem;
            right: 1.5rem;
            width: 192px;
            height: 108px;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid var(--panel-border);
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
            z-index: 40;
        }

        #minimap-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }

        #minimap-viewport-box {
            position: absolute;
            border: 1px solid #fbbf24;
            background: rgba(251, 191, 36, 0.15);
            pointer-events: none;
        }

        /* HOVER TOOLTIP OVER CLAIMED PIXELS */
        #hover-tooltip {
            position: absolute;
            display: none;
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 10px;
            padding: 0.75rem 1rem;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8);
            z-index: 60;
            pointer-events: auto;
            max-width: 320px;
            backdrop-filter: blur(12px);
        }

        .tooltip-header {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 0.35rem;
        }

        .tooltip-img {
            width: 38px;
            height: 38px;
            border-radius: 6px;
            object-fit: cover;
            border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .tooltip-color-box {
            width: 38px;
            height: 38px;
            border-radius: 6px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            flex-shrink: 0;
        }

        .tooltip-title {
            font-family: 'Chakra Petch', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            color: #fff;
            line-height: 1.2;
        }

        .tooltip-desc {
            font-size: 0.78rem;
            color: #94a3b8;
            margin-bottom: 0.5rem;
            line-height: 1.4;
        }

        .tooltip-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.7rem;
            color: #64748b;
            border-top: 1px solid rgba(148, 163, 184, 0.15);
            padding-top: 0.4rem;
        }

        .tooltip-link-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            font-size: 0.76rem;
            font-weight: 600;
            color: #38bdf8;
            text-decoration: none;
            padding: 0.25rem 0.5rem;
            background: rgba(56, 189, 248, 0.12);
            border-radius: 4px;
            border: 1px solid rgba(56, 189, 248, 0.25);
            transition: all 0.15s;
        }

        .tooltip-link-btn:hover {
            background: rgba(56, 189, 248, 0.25);
            color: #fff;
        }

        /* MODAL DIALOG */
        .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(3, 7, 18, 0.75);
            backdrop-filter: blur(10px);
            z-index: 100;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .modal-card {
            background: #0f172a;
            border: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: 14px;
            width: 90%;
            max-width: 540px;
            padding: 1.5rem;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
            animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalPop {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            border-bottom: 1px solid rgba(148, 163, 184, 0.15);
            padding-bottom: 0.75rem;
        }

        .modal-title {
            font-family: 'Chakra Petch', sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            color: #fff;
        }

        .modal-close {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 1.4rem;
            cursor: pointer;
            line-height: 1;
        }

        .modal-close:hover {
            color: #fff;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #cbd5e1;
            margin-bottom: 0.35rem;
        }

        .form-input, .form-textarea {
            width: 100%;
            background: #1e293b;
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 6px;
            color: #fff;
            padding: 0.55rem 0.75rem;
            font-size: 0.85rem;
            font-family: 'Inter', sans-serif;
            outline: none;
            transition: border-color 0.15s;
        }

        .form-input:focus, .form-textarea:focus {
            border-color: var(--accent-cyan);
        }

        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid rgba(148, 163, 184, 0.15);
            padding-bottom: 0.5rem;
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s;
        }

        .tab-btn.active {
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.12);
        }

        .color-presets {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
        }

        .color-circle {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: transform 0.15s;
        }

        .color-circle:hover {
            transform: scale(1.15);
            border-color: #fff;
        }

        .dropzone {
            border: 2px dashed rgba(56, 189, 248, 0.3);
            border-radius: 8px;
            padding: 1.25rem;
            text-align: center;
            background: rgba(30, 41, 59, 0.4);
            cursor: pointer;
            transition: all 0.2s;
        }

        .dropzone:hover {
            border-color: var(--accent-cyan);
            background: rgba(56, 189, 248, 0.08);
        }

        .price-banner {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.25rem;
        }

        .price-title {
            font-size: 0.8rem;
            color: #fde68a;
            font-weight: 600;
        }

        .price-amount {
            font-family: 'Chakra Petch', sans-serif;
            font-weight: 700;
            font-size: 1.25rem;
            color: #fbbf24;
        }
    </style>
</head>
<body>

    <!-- TOP HEADER -->
    <header>
        <div class="brand-area">
            <div class="brand-badge">BILLBOARD</div>
            <div class="brand-title">RadenWorld // <span>1920x1080</span> Pixel Canvas</div>
        </div>

        <div class="cuan-stats">
            <div class="stat-item">
                <div class="stat-label">Slot Terisi</div>
                <div class="stat-value cyan" id="stat-claimed">0 / 2,073,600 px (0%)</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total Cuan</div>
                <div class="stat-value" id="stat-revenue">Rp 0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Tarif Pixel</div>
                <div class="stat-value green" id="stat-rate">Rp 500 / px</div>
            </div>
        </div>

        <div class="top-actions">
            <button class="btn" id="btn-zoom-fit" title="Sesuaikan Tampilan ke Layar">🔍 Fit Layar</button>
            <button class="btn" id="btn-zoom-100" title="Ukuran Asli 100% (1:1)">1:1 (100%)</button>
            <button class="btn" id="btn-download" title="Unduh Kanvas 1920x1080 PNG">📥 Unduh PNG</button>
            <button class="btn btn-gold" id="btn-settings" title="Atur Tarif & Cuan">⚙️ Pengaturan Cuan</button>
        </div>
    </header>

    <!-- VIEWPORT WORKSPACE -->
    <div id="viewport">
        <div id="canvas-stage">
            <canvas id="main-canvas" width="1920" height="1080"></canvas>
            <div id="selection-box"></div>
        </div>

        <!-- FLOATING SELECTION BADGE -->
        <div id="selection-badge">
            <div class="badge-metrics" id="badge-dimensions">100 × 100 px (10,000 Pixel)</div>
            <div class="badge-price" id="badge-price">Biaya: Rp 5,000,000</div>
            <button class="btn btn-gold" style="width: 100%; justify-content: center;" id="btn-open-claim">✨ Pasang Iklan / Warna</button>
        </div>

        <!-- COORDINATE HUD -->
        <div class="coord-hud">
            Kursor: <span id="hud-coord">X: 0, Y: 0</span> | Zoom: <span id="hud-zoom">100%</span>
        </div>

        <!-- FLOATING TOOLBAR -->
        <div class="floating-toolbar">
            <button class="tool-btn active" id="tool-select">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M9 9h6v6H9z"/></svg>
                Pilih Area
            </button>
            <button class="tool-btn" id="tool-pan">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20m10-10H2"/></svg>
                Geser (Pan)
            </button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn" id="btn-zoom-out" title="Perkecil">−</button>
            <span style="font-family: 'Chakra Petch'; font-size: 0.85rem; min-width: 45px; text-align: center; color: #38bdf8;" id="zoom-text">100%</span>
            <button class="tool-btn" id="btn-zoom-in" title="Perbesar">+</button>
        </div>

        <!-- MINIMAP -->
        <div class="minimap-container">
            <canvas id="minimap-canvas" width="192" height="108"></canvas>
            <div id="minimap-viewport-box"></div>
        </div>

        <!-- HOVER TOOLTIP -->
        <div id="hover-tooltip">
            <div class="tooltip-header">
                <img id="tooltip-img" class="tooltip-img" src="" style="display: none;">
                <div id="tooltip-color" class="tooltip-color-box"></div>
                <div>
                    <div class="tooltip-title" id="tooltip-title">Nama Iklan</div>
                    <div style="font-size: 0.72rem; color: #fbbf24;" id="tooltip-owner">Oleh: Pengiklan</div>
                </div>
            </div>
            <div class="tooltip-desc" id="tooltip-desc">Keterangan iklan...</div>
            <div class="tooltip-meta">
                <span id="tooltip-coords">120x80 px di (300, 200)</span>
                <a href="#" target="_blank" class="tooltip-link-btn" id="tooltip-link">Kunjungi Website ↗</a>
            </div>
        </div>
    </div>

    <!-- CLAIM PIXEL MODAL -->
    <div class="modal-backdrop" id="claim-modal">
        <div class="modal-card">
            <div class="modal-header">
                <div class="modal-title">🎨 KLAIM SLOT PIXEL BILLBOARD</div>
                <button class="modal-close" id="modal-close">&times;</button>
            </div>

            <!-- PRICE BANNER -->
            <div class="price-banner">
                <div>
                    <div class="price-title">Area Dipilih: <span id="modal-dimensions" style="color: #fff;">100x100 px</span></div>
                    <div style="font-size: 0.72rem; color: #94a3b8;" id="modal-coords">Koordinat: (X: 100, Y: 100)</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.7rem; color: #94a3b8;">Total Biaya / Cuan:</div>
                    <div class="price-amount" id="modal-price">Rp 5.000.000</div>
                </div>
            </div>

            <!-- TABS -->
            <div class="tabs">
                <button class="tab-btn active" id="tab-color">Warna Solid</button>
                <button class="tab-btn" id="tab-image">Unggah Gambar</button>
            </div>

            <!-- COLOR SECTION -->
            <div id="section-color">
                <div class="form-group">
                    <label class="form-label">Pilih Warna Pixel:</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="color" id="input-color" value="#0ea5e9" style="width: 44px; height: 38px; border-radius: 6px; border: 1px solid #475569; background: none; cursor: pointer;">
                        <input type="text" id="input-color-hex" value="#0ea5e9" class="form-input" style="width: 120px;">
                    </div>
                    <div class="color-presets">
                        <div class="color-circle" style="background: #ef4444;" data-color="#ef4444"></div>
                        <div class="color-circle" style="background: #f97316;" data-color="#f97316"></div>
                        <div class="color-circle" style="background: #f59e0b;" data-color="#f59e0b"></div>
                        <div class="color-circle" style="background: #10b981;" data-color="#10b981"></div>
                        <div class="color-circle" style="background: #06b6d4;" data-color="#06b6d4"></div>
                        <div class="color-circle" style="background: #3b82f6;" data-color="#3b82f6"></div>
                        <div class="color-circle" style="background: #8b5cf6;" data-color="#8b5cf6"></div>
                        <div class="color-circle" style="background: #ec4899;" data-color="#ec4899"></div>
                        <div class="color-circle" style="background: #0f172a;" data-color="#0f172a"></div>
                        <div class="color-circle" style="background: #ffffff;" data-color="#ffffff"></div>
                    </div>
                </div>
            </div>

            <!-- IMAGE SECTION -->
            <div id="section-image" style="display: none;">
                <div class="form-group">
                    <label class="form-label">Pilih Berkas Gambar (PNG, JPG, SVG, WEBP):</label>
                    <div class="dropzone" id="dropzone">
                        <input type="file" id="file-input" accept="image/*" style="display: none;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🖼️</div>
                        <div style="font-size: 0.85rem; font-weight: 600; color: #38bdf8;">Klik atau Seret Gambar ke Sini</div>
                        <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.2rem;">Gambar akan otomatis disesuaikan ke ukuran slot pixel</div>
                    </div>
                    <div id="image-preview-container" style="display: none; margin-top: 0.75rem; text-align: center;">
                        <img id="image-preview" src="" style="max-height: 120px; border-radius: 6px; border: 1px solid #38bdf8; object-fit: contain;">
                    </div>
                </div>
            </div>

            <!-- METADATA / INFORMATION -->
            <div class="form-group">
                <label class="form-label">Nama Brand / Judul Iklan:</label>
                <input type="text" id="input-title" class="form-input" placeholder="Contoh: Kopi Kenangan Senja" required>
            </div>

            <div class="form-group">
                <label class="form-label">Keterangan / Slogan / Promo:</label>
                <textarea id="input-desc" class="form-textarea" rows="2" placeholder="Tuliskan pesan promo atau keterangan produkmu..."></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Tautan / Link Website / Media Sosial:</label>
                <input type="url" id="input-link" class="form-input" placeholder="https://instagram.com/namakamu atau https://website.com">
            </div>

            <div class="form-group">
                <label class="form-label">Nama Pengiklan:</label>
                <input type="text" id="input-owner" class="form-input" placeholder="Nama Anda / Perusahaan">
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem;">
                <button class="btn" id="btn-cancel-claim">Batal</button>
                <button class="btn btn-gold" id="btn-submit-claim">💰 Bayar & Pasang Sekarang</button>
            </div>
        </div>
    </div>

    <!-- SETTINGS MODAL -->
    <div class="modal-backdrop" id="settings-modal">
        <div class="modal-card" style="max-width: 440px;">
            <div class="modal-header">
                <div class="modal-title">⚙️ PENGATURAN CUAN BILLBOARD</div>
                <button class="modal-close" id="settings-close">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label">Tarif Sewa per 1 Pixel (Rupiah):</label>
                <input type="number" id="input-rate" class="form-input" value="500" min="10" step="50">
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem;">
                    Total Kanvas: 1920 × 1080 = 2.073.600 Pixel.<br>
                    Potensi Cuan Total: <b id="potential-revenue" style="color: #fbbf24;">Rp 1.036.800.000</b>
                </div>
            </div>
            <div style="display: flex; gap: 0.75rem; justify-content: space-between; margin-top: 1.5rem;">
                <button class="btn" id="btn-reset-canvas" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">🗑️ Kosongkan Kanvas</button>
                <button class="btn btn-primary" id="btn-save-settings">Simpan Tarif</button>
            </div>
        </div>
    </div>

    <script>
        // State Management
        const CANVAS_WIDTH = 1920;
        const CANVAS_HEIGHT = 1080;
        const TOTAL_PIXELS = CANVAS_WIDTH * CANVAS_HEIGHT;

        let pricePerPixel = 500;
        let claims = [];

        // Viewport Pan & Zoom State
        let scale = 1.0;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let panStartX = 0;
        let panStartY = 0;
        let activeTool = 'select'; // 'select' | 'pan'

        // Selection State
        let isSelecting = false;
        let selectStartX = 0;
        let selectStartY = 0;
        let selection = null; // { x, y, width, height }

        // DOM Elements
        const viewport = document.getElementById('viewport');
        const stage = document.getElementById('canvas-stage');
        const canvas = document.getElementById('main-canvas');
        const ctx = canvas.getContext('2d');
        const selectionBox = document.getElementById('selection-box');
        const selectionBadge = document.getElementById('selection-badge');
        const minimapCanvas = document.getElementById('minimap-canvas');
        const minimapCtx = minimapCanvas.getContext('2d');
        const minimapViewportBox = document.getElementById('minimap-viewport-box');

        const hudCoord = document.getElementById('hud-coord');
        const hudZoom = document.getElementById('hud-zoom');
        const zoomText = document.getElementById('zoom-text');
        const statClaimed = document.getElementById('stat-claimed');
        const statRevenue = document.getElementById('stat-revenue');
        const statRate = document.getElementById('stat-rate');

        const hoverTooltip = document.getElementById('hover-tooltip');
        const claimModal = document.getElementById('claim-modal');
        const settingsModal = document.getElementById('settings-modal');

        // Initial setup: create crisp blank checkered background
        function initBlankCanvas() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Subtle 10x10 grid checkerboard
            ctx.fillStyle = '#f8fafc';
            for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
                for (let x = 0; x < CANVAS_WIDTH; x += 20) {
                    if ((x / 20 + y / 20) % 2 === 0) {
                        ctx.fillRect(x, y, 20, 20);
                    }
                }
            }
        }

        // Fit Canvas to Viewport
        function fitCanvasToViewport() {
            const vw = viewport.clientWidth;
            const vh = viewport.clientHeight;
            const scaleX = (vw - 80) / CANVAS_WIDTH;
            const scaleY = (vh - 80) / CANVAS_HEIGHT;
            scale = Math.min(scaleX, scaleY, 1.0);
            scale = Math.max(scale, 0.2);

            panX = (vw - CANVAS_WIDTH * scale) / 2;
            panY = (vh - CANVAS_HEIGHT * scale) / 2;
            updateStageTransform();
        }

        function updateStageTransform() {
            stage.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
            const pct = Math.round(scale * 100);
            hudZoom.textContent = pct + '%';
            zoomText.textContent = pct + '%';
            updateMinimap();
        }

        // Render all claims onto canvas
        function renderAllClaims() {
            initBlankCanvas();

            claims.forEach(c => {
                if (c.image) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(img, c.x, c.y, c.width, c.height);
                        updateMinimap();
                    };
                    img.src = c.image;
                } else if (c.color) {
                    ctx.fillStyle = c.color;
                    ctx.fillRect(c.x, c.y, c.width, c.height);
                }
            });

            updateStats();
            updateMinimap();
        }

        function updateStats() {
            let claimedPixels = 0;
            let totalRevenue = 0;

            claims.forEach(c => {
                const px = c.width * c.height;
                claimedPixels += px;
                totalRevenue += (c.price || px * pricePerPixel);
            });

            const pct = ((claimedPixels / TOTAL_PIXELS) * 100).toFixed(2);
            statClaimed.textContent = `${claimedPixels.toLocaleString('id-ID')} / 2.073.600 px (${pct}%)`;
            statRevenue.textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
            statRate.textContent = `Rp ${pricePerPixel.toLocaleString('id-ID')} / px`;
        }

        function updateMinimap() {
            // Draw thumbnail of main canvas
            minimapCtx.clearRect(0, 0, 192, 108);
            minimapCtx.drawImage(canvas, 0, 0, 192, 108);

            // Calculate viewport box
            const vw = viewport.clientWidth;
            const vh = viewport.clientHeight;
            const boxX = Math.max(0, (-panX / (CANVAS_WIDTH * scale)) * 192);
            const boxY = Math.max(0, (-panY / (CANVAS_HEIGHT * scale)) * 108);
            const boxW = Math.min(192, (vw / (CANVAS_WIDTH * scale)) * 192);
            const boxH = Math.min(108, (vh / (CANVAS_HEIGHT * scale)) * 108);

            minimapViewportBox.style.left = boxX + 'px';
            minimapViewportBox.style.top = boxY + 'px';
            minimapViewportBox.style.width = boxW + 'px';
            minimapViewportBox.style.height = boxH + 'px';
        }

        // Convert Viewport mouse coordinates to Canvas Pixel coordinates
        function getCanvasCoords(e) {
            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const cx = Math.floor((mouseX - panX) / scale);
            const cy = Math.floor((mouseY - panY) / scale);

            return {
                x: Math.max(0, Math.min(CANVAS_WIDTH - 1, cx)),
                y: Math.max(0, Math.min(CANVAS_HEIGHT - 1, cy))
            };
        }

        // Mouse Drag Selection / Pan Events
        viewport.addEventListener('mousedown', (e) => {
            if (e.target.closest('#selection-badge') || e.target.closest('.floating-toolbar') || e.target.closest('.minimap-container') || e.target.closest('.coord-hud')) return;

            if (activeTool === 'pan' || e.button === 1 || e.spaceKey) {
                isPanning = true;
                panStartX = e.clientX - panX;
                panStartY = e.clientY - panY;
                viewport.classList.add('panning');
                return;
            }

            if (e.button === 0 && activeTool === 'select') {
                const c = getCanvasCoords(e);
                isSelecting = true;
                selectStartX = c.x;
                selectStartY = c.y;
                selection = { x: c.x, y: c.y, width: 1, height: 1 };
                selectionBadge.style.display = 'none';
                hoverTooltip.style.display = 'none';
                updateSelectionBox();
            }
        });

        window.addEventListener('mousemove', (e) => {
            const c = getCanvasCoords(e);
            hudCoord.textContent = `X: ${c.x}, Y: ${c.y}`;

            if (isPanning) {
                panX = e.clientX - panStartX;
                panY = e.clientY - panStartY;
                updateStageTransform();
                return;
            }

            if (isSelecting) {
                const curX = c.x;
                const curY = c.y;

                const x1 = Math.min(selectStartX, curX);
                const y1 = Math.min(selectStartY, curY);
                const x2 = Math.max(selectStartX, curX);
                const y2 = Math.max(selectStartY, curY);

                selection = {
                    x: x1,
                    y: y1,
                    width: Math.max(1, x2 - x1 + 1),
                    height: Math.max(1, y2 - y1 + 1)
                };

                updateSelectionBox();
            } else {
                checkHoverClaims(c.x, c.y, e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                viewport.classList.remove('panning');
            }

            if (isSelecting) {
                isSelecting = false;
                if (selection && selection.width > 2 && selection.height > 2) {
                    showSelectionBadge();
                } else {
                    selection = null;
                    selectionBox.style.display = 'none';
                    selectionBadge.style.display = 'none';
                }
            }
        });

        function updateSelectionBox() {
            if (!selection) {
                selectionBox.style.display = 'none';
                return;
            }
            selectionBox.style.display = 'block';
            selectionBox.style.left = selection.x + 'px';
            selectionBox.style.top = selection.y + 'px';
            selectionBox.style.width = selection.width + 'px';
            selectionBox.style.height = selection.height + 'px';
        }

        function showSelectionBadge() {
            if (!selection) return;
            const pxCount = selection.width * selection.height;
            const price = pxCount * pricePerPixel;

            document.getElementById('badge-dimensions').textContent = `${selection.width} × ${selection.height} px (${pxCount.toLocaleString('id-ID')} Pixel)`;
            document.getElementById('badge-price').textContent = `Estimasi Cuan: Rp ${price.toLocaleString('id-ID')}`;

            // Position badge near bottom center of selection
            const stageRect = stage.getBoundingClientRect();
            const badgeX = stageRect.left + (selection.x + selection.width / 2) * scale;
            const badgeY = stageRect.top + (selection.y + selection.height) * scale + 12;

            selectionBadge.style.display = 'block';
            selectionBadge.style.left = Math.min(window.innerWidth - 240, Math.max(20, badgeX - 100)) + 'px';
            selectionBadge.style.top = Math.min(window.innerHeight - 100, Math.max(70, badgeY)) + 'px';
        }

        // Hover over claimed pixel block
        function checkHoverClaims(cx, cy, screenX, screenY) {
            if (isSelecting || selection) return;

            let found = null;
            for (let i = claims.length - 1; i >= 0; i--) {
                const c = claims[i];
                if (cx >= c.x && cx < c.x + c.width && cy >= c.y && cy < c.y + c.height) {
                    found = c;
                    break;
                }
            }

            if (found) {
                document.getElementById('tooltip-title').textContent = found.title || 'Slot Iklan';
                document.getElementById('tooltip-owner').textContent = `Oleh: ${found.owner || 'Pengiklan'}`;
                document.getElementById('tooltip-desc').textContent = found.description || 'Tidak ada deskripsi.';
                document.getElementById('tooltip-coords').textContent = `${found.width}×${found.height} px (${(found.width * found.height).toLocaleString('id-ID')} px) di (${found.x}, ${found.y})`;

                const linkBtn = document.getElementById('tooltip-link');
                if (found.link && found.link.trim()) {
                    linkBtn.href = found.link.startsWith('http') ? found.link : 'https://' + found.link;
                    linkBtn.style.display = 'inline-flex';
                } else {
                    linkBtn.style.display = 'none';
                }

                const imgEl = document.getElementById('tooltip-img');
                const colorEl = document.getElementById('tooltip-color');
                if (found.image) {
                    imgEl.src = found.image;
                    imgEl.style.display = 'block';
                    colorEl.style.display = 'none';
                } else {
                    imgEl.style.display = 'none';
                    colorEl.style.display = 'block';
                    colorEl.style.backgroundColor = found.color || '#3b82f6';
                }

                hoverTooltip.style.display = 'block';
                const tipX = Math.min(window.innerWidth - 340, screenX + 15);
                const tipY = Math.min(window.innerHeight - 160, screenY + 15);
                hoverTooltip.style.left = tipX + 'px';
                hoverTooltip.style.top = tipY + 'px';
            } else {
                hoverTooltip.style.display = 'none';
            }
        }

        // Mouse Wheel Zoom
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
            const newScale = Math.min(8.0, Math.max(0.15, scale * zoomFactor));

            // Zoom centered on cursor
            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            panX = mouseX - (mouseX - panX) * (newScale / scale);
            panY = mouseY - (mouseY - panY) * (newScale / scale);
            scale = newScale;

            updateStageTransform();
            if (selection) updateSelectionBox();
        }, { passive: false });

        // Tool buttons
        document.getElementById('tool-select').onclick = () => {
            activeTool = 'select';
            document.getElementById('tool-select').classList.add('active');
            document.getElementById('tool-pan').classList.remove('active');
            viewport.classList.remove('panning');
        };

        document.getElementById('tool-pan').onclick = () => {
            activeTool = 'pan';
            document.getElementById('tool-pan').classList.add('active');
            document.getElementById('tool-select').classList.remove('active');
            viewport.classList.add('panning');
        };

        document.getElementById('btn-zoom-in').onclick = () => {
            scale = Math.min(8.0, scale * 1.25);
            updateStageTransform();
        };

        document.getElementById('btn-zoom-out').onclick = () => {
            scale = Math.max(0.15, scale * 0.8);
            updateStageTransform();
        };

        document.getElementById('btn-zoom-fit').onclick = fitCanvasToViewport;
        document.getElementById('btn-zoom-100').onclick = () => {
            scale = 1.0;
            const vw = viewport.clientWidth;
            const vh = viewport.clientHeight;
            panX = (vw - CANVAS_WIDTH) / 2;
            panY = (vh - CANVAS_HEIGHT) / 2;
            updateStageTransform();
        };

        // Download High-Res Canvas
        document.getElementById('btn-download').onclick = () => {
            const link = document.createElement('a');
            link.download = `RadenWorld-Billboard-1920x1080-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        // Open Claim Modal
        document.getElementById('btn-open-claim').onclick = () => {
            if (!selection) return;
            const pxCount = selection.width * selection.height;
            const price = pxCount * pricePerPixel;

            document.getElementById('modal-dimensions').textContent = `${selection.width} × ${selection.height} px (${pxCount.toLocaleString('id-ID')} Pixel)`;
            document.getElementById('modal-coords').textContent = `Koordinat: (X: ${selection.x}, Y: ${selection.y}) ke (X: ${selection.x + selection.width}, Y: ${selection.y + selection.height})`;
            document.getElementById('modal-price').textContent = `Rp ${price.toLocaleString('id-ID')}`;

            claimModal.style.display = 'flex';
        };

        document.getElementById('modal-close').onclick = () => claimModal.style.display = 'none';
        document.getElementById('btn-cancel-claim').onclick = () => claimModal.style.display = 'none';

        // Modal Tabs
        const tabColor = document.getElementById('tab-color');
        const tabImage = document.getElementById('tab-image');
        const secColor = document.getElementById('section-color');
        const secImage = document.getElementById('section-image');
        let selectedMode = 'color';
        let uploadedImageBase64 = null;

        tabColor.onclick = () => {
            selectedMode = 'color';
            tabColor.classList.add('active');
            tabImage.classList.remove('active');
            secColor.style.display = 'block';
            secImage.style.display = 'none';
        };

        tabImage.onclick = () => {
            selectedMode = 'image';
            tabImage.classList.add('active');
            tabColor.classList.remove('active');
            secImage.style.display = 'block';
            secColor.style.display = 'none';
        };

        // Color Picker
        const inputColor = document.getElementById('input-color');
        const inputColorHex = document.getElementById('input-color-hex');
        inputColor.oninput = (e) => inputColorHex.value = e.target.value;
        inputColorHex.oninput = (e) => inputColor.value = e.target.value;

        document.querySelectorAll('.color-circle').forEach(c => {
            c.onclick = () => {
                const col = c.getAttribute('data-color');
                inputColor.value = col;
                inputColorHex.value = col;
            };
        });

        // Image Dropzone & File Input
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input');
        const imgPreview = document.getElementById('image-preview');
        const imgPrevCont = document.getElementById('image-preview-container');

        dropzone.onclick = () => fileInput.click();

        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
            }
        };

        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = '#00f0ff'; };
        dropzone.ondragleave = () => { dropzone.style.borderColor = 'rgba(56, 189, 248, 0.3)'; };
        dropzone.ondrop = (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        };

        function handleFile(file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                uploadedImageBase64 = re.target.result;
                imgPreview.src = uploadedImageBase64;
                imgPrevCont.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }

        // Submit Claim & Monetize
        document.getElementById('btn-submit-claim').onclick = async () => {
            if (!selection) return;

            const pxCount = selection.width * selection.height;
            const price = pxCount * pricePerPixel;

            const claimData = {
                x: selection.x,
                y: selection.y,
                width: selection.width,
                height: selection.height,
                color: selectedMode === 'color' ? inputColorHex.value : null,
                image: selectedMode === 'image' ? uploadedImageBase64 : null,
                title: document.getElementById('input-title').value.trim() || 'Slot Iklan',
                description: document.getElementById('input-desc').value.trim(),
                link: document.getElementById('input-link').value.trim(),
                owner: document.getElementById('input-owner').value.trim() || 'Pengiklan Raden',
                price: price
            };

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const res = await fetch('/api/pixel-canvas/claims', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || ''
                    },
                    body: JSON.stringify(claimData)
                });
                const result = await res.json();
                if (result.success && result.claim) {
                    claims.push(result.claim);
                } else {
                    claims.push(claimData);
                }
            } catch (err) {
                claims.push(claimData);
            }

            // Save to localStorage as well
            try {
                localStorage.setItem('raden_pixel_claims', JSON.stringify(claims));
            } catch (e) {}

            renderAllClaims();

            claimModal.style.display = 'none';
            selection = null;
            selectionBox.style.display = 'none';
            selectionBadge.style.display = 'none';
            uploadedImageBase64 = null;
            imgPrevCont.style.display = 'none';
            document.getElementById('input-title').value = '';
            document.getElementById('input-desc').value = '';
            document.getElementById('input-link').value = '';
        };

        // Settings Modal
        document.getElementById('btn-settings').onclick = () => {
            document.getElementById('input-rate').value = pricePerPixel;
            updatePotentialRev();
            settingsModal.style.display = 'flex';
        };

        document.getElementById('settings-close').onclick = () => settingsModal.style.display = 'none';

        document.getElementById('input-rate').oninput = updatePotentialRev;

        function updatePotentialRev() {
            const rate = parseInt(document.getElementById('input-rate').value, 10) || 0;
            const pot = rate * TOTAL_PIXELS;
            document.getElementById('potential-revenue').textContent = `Rp ${pot.toLocaleString('id-ID')}`;
        }

        document.getElementById('btn-save-settings').onclick = async () => {
            const newRate = parseInt(document.getElementById('input-rate').value, 10) || 500;
            pricePerPixel = newRate;
            statRate.textContent = `Rp ${pricePerPixel.toLocaleString('id-ID')} / px`;

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                await fetch('/api/pixel-canvas/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || ''
                    },
                    body: JSON.stringify({ price_per_pixel: newRate })
                });
            } catch (e) {}

            settingsModal.style.display = 'none';
            updateStats();
        };

        document.getElementById('btn-reset-canvas').onclick = async () => {
            if (!confirm('Apakah Anda yakin ingin mengosongkan seluruh kanvas iklan? Semua pixel yang telah diklaim akan dihapus.')) return;

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                await fetch('/api/pixel-canvas/reset', {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': csrfToken || '' }
                });
            } catch (e) {}

            claims = [];
            try { localStorage.removeItem('raden_pixel_claims'); } catch (e) {}
            renderAllClaims();
            settingsModal.style.display = 'none';
        };

        // Load existing claims from server or localStorage
        async function loadExistingClaims() {
            try {
                const res = await fetch('/api/pixel-canvas/claims');
                const data = await res.json();
                if (data && Array.isArray(data.claims)) {
                    claims = data.claims;
                }
                if (data && typeof data.price_per_pixel === 'number') {
                    pricePerPixel = data.price_per_pixel;
                }
            } catch (e) {
                try {
                    const local = localStorage.getItem('raden_pixel_claims');
                    if (local) claims = JSON.parse(local);
                } catch (err) {}
            }

            renderAllClaims();
        }

        // Window resize
        window.onresize = () => {
            fitCanvasToViewport();
        };

        // Initialize on load
        window.onload = () => {
            initBlankCanvas();
            fitCanvasToViewport();
            loadExistingClaims();
        };
    </script>
</body>
</html>
