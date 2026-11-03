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
    <meta http-equiv="Permissions-Policy" content="microphone=(self)">

    <title>RadenWorld - 2D Open World Multiplayer Simulasi</title>

    <!-- Google Fonts Fallback: Press Start 2P -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">

    <!-- Google Identity Services & Facebook SDK -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script async defer crossorigin="anonymous" src="https://connect.facebook.net/id_ID/sdk.js"></script>

    <!-- Vite Assets -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

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
            font-family: 'Kenney Pixel Square', 'm5x7', 'Press Start 2P', monospace;
            touch-action: none;
            -webkit-user-select: none;
            user-select: none;
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
    </style>

    <script>
        // Mencegah popup menu / callout bawaan browser saat menahan tombol mancing / analog
        window.addEventListener('contextmenu', function(e) {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
                return;
            }
            e.preventDefault();
        }, { passive: false });

        // Registrasi Service Worker untuk Cache-First Aset Game (Mengurangi request Wasmer hingga 95%+)
        if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('[RadenWorld] PWA Cache Aktif:', reg.scope);
                }).catch(function(err) {
                    console.warn('[RadenWorld] Service Worker gagal didaftarkan:', err);
                });
            });
        }
    </script>
</head>
<body class="bg-[#FFF8EA] text-black antialiased overflow-hidden select-none">
    <div id="raden-game-app"></div>
</body>
</html>
