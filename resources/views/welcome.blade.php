<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="theme-color" content="#FFF8EA">
    <meta name="format-detection" content="telephone=no">
    <meta name="HandheldFriendly" content="true">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">

    <title>RadenWorld - 2D Open World Multiplayer Simulasi</title>

    <!-- Google Fonts: Pixelify Sans (Primary Cozy RPG Pixel Font) & Press Start 2P -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap">
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"></noscript>

    <!-- Google Identity Services -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>

    <!-- Vite Assets -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=8">
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/Logo/logo-192.png?v=8">
    <link rel="apple-touch-icon" href="/assets/Logo/logo-192.png?v=8">

    <!-- Zero-CLS Global Layout Styling & Anti-Shift Containers -->
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #FFF8EA;
            color: #000000;
            font-family: 'Pixelify Sans', 'Kenney Pixel Square', monospace;
            letter-spacing: 0.035em;
            touch-action: none;
            -webkit-user-select: none;
            user-select: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }
        #raden-game-app {
            position: fixed;
            inset: 0;
            width: 100vw;
            width: 100dvw;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            background-color: #FFF8EA;
            contain: strict;
        }
        @keyframes raden-spin {
            to { transform: rotate(360deg); }
        }
    </style>

    <script>
        // Mencegah popup menu / callout bawaan browser saat menahan tombol mancing / analog
        window.addEventListener('contextmenu', function(e) {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
                return;
            }
            e.preventDefault();
        }, { passive: false });

        // Auto-Purge Old Cache & Self-Healing Service Worker Update
        const APP_BUILD_VER = 'radenworld-static-v16';
        try {
            if (localStorage.getItem('raden_sw_ver') !== APP_BUILD_VER) {
                localStorage.setItem('raden_sw_ver', APP_BUILD_VER);
                if ('caches' in window) {
                    caches.keys().then(function(names) {
                        names.forEach(function(name) { if (name !== APP_BUILD_VER) caches.delete(name); });
                    });
                }
            }
        } catch (e) {}

        // Registrasi Service Worker untuk Cache-First Aset Game (Mengurangi request Wasmer hingga 95%+)
        if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('[RadenWorld] PWA Cache Aktif:', reg.scope);
                    reg.update();
                }).catch(function(err) {
                    console.warn('[RadenWorld] Service Worker gagal didaftarkan:', err);
                });
            });
        }
    </script>
</head>
<body class="bg-[#FFF8EA] text-black antialiased overflow-hidden select-none">
    <div id="raden-game-app">
        <!-- Ultra-Fast LCP Pre-rendered Splash Element (< 200ms Paint) -->
        <div style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:#FFF8EA;padding:1rem;">
            <div style="background:#FFF8EA;border:2px solid #5C3A21;border-radius:12px;box-shadow:0 4px 0 #5C3A21;padding:8px 20px;display:flex;align-items:center;gap:10px;margin-bottom:1rem;">
                <span style="font-size:24px;">🎮</span>
                <h1 class="text-base sm:text-2xl md:text-4xl font-bold text-black tracking-wide leading-none" style="font-family:'Kenney Pixel Square','m5x7',monospace;margin:0;font-size:clamp(1.25rem, 4vw, 2.25rem);color:#000000;font-weight:bold;letter-spacing:1px;">
                    RADENWORLD
                </h1>
                <span style="font-size:24px;">✨</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-family:'Kenney Pixel Square','m5x7',monospace;font-size:12px;color:#5C3A21;font-weight:bold;">
                <div style="width:12px;height:12px;border:2px solid #5C3A21;border-top-color:transparent;border-radius:50%;animation:raden-spin 0.8s linear infinite;"></div>
                <span>MEMUAT DUNIA SIMULASI...</span>
            </div>
        </div>
    </div>
</body>
</html>
