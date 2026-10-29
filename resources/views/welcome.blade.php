<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#000000">
    <meta name="format-detection" content="telephone=no">
    <meta name="HandheldFriendly" content="true">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>RadenWorld - 2D Open World Multiplayer Simulasi</title>

    <!-- Google Fonts: Gaming Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700;800&family=Press+Start+2P&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">

    @if(request()->is('/'))
    <!-- Preload Critical LCP Assets (Lobby Avatars - only on Lobby '/') -->
    <link rel="preload" as="image" href="/assets/sprites/characters/Player/Female/FemaleAvatar_Lobby.webp" fetchpriority="high">
    <link rel="preload" as="image" href="/assets/sprites/characters/Player/Male/MaleAvatar_Lobby.webp" fetchpriority="high">
    @endif

    <!-- Google Identity Services & Facebook SDK -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script async defer crossorigin="anonymous" src="https://connect.facebook.net/id_ID/sdk.js"></script>

    <!-- Vite Assets -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])

    <!-- Zero-CLS Global Layout Styling & Anti-Shift Containers -->
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #000000;
            touch-action: none;
            -webkit-user-select: none;
            user-select: none;
        }
        #raden-game-app {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            background-color: #000000;
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
    </script>
</head>
<body class="bg-black text-neutral-100 antialiased overflow-hidden select-none">
    <div id="raden-game-app">
        <!-- Instant LCP Pre-Paint Splash Screen (< 100ms LCP, 0 CLS) -->
        <div id="raden-prepaint-splash" style="position:absolute;inset:0;width:100%;height:100%;background:#000000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;font-family:'Chakra Petch',system-ui,sans-serif;color:#ffffff;text-align:center;padding:20px;">
            <div style="font-size:clamp(2rem, 7vw, 3.5rem);font-weight:900;letter-spacing:0.15em;background:linear-gradient(135deg, #f59e0b, #fbbf24, #d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 30px rgba(245,158,11,0.4);margin-bottom:8px;">
                RADEN WORLD
            </div>
            <div style="font-size:12px;font-family:monospace;letter-spacing:0.2em;color:#a3a3a3;text-transform:uppercase;margin-bottom:20px;">
                2D Open World Multiplayer Simulasi
            </div>
            <div style="width:160px;height:3px;background:#262626;border-radius:9999px;overflow:hidden;position:relative;">
                <div style="width:40%;height:100%;background:linear-gradient(90deg, #f59e0b, #10b981);border-radius:9999px;animation:radenLoad 1.2s infinite ease-in-out;"></div>
            </div>
            <style>
                @keyframes radenLoad {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(120%); }
                    100% { transform: translateX(250%); }
                }
            </style>
        </div>
    </div>
</body>
</html>
