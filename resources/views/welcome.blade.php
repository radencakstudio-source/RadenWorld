<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#000000">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>RadenWorld - 2D Open World Multiplayer RPG</title>

    <!-- Google Fonts: Gaming Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700;800&family=Press+Start+2P&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">

    @if(request()->is('/'))
    <!-- Preload Critical LCP Assets (Lobby Avatars - only on Lobby '/') -->
    <link rel="preload" as="image" href="/assets/sprites/characters/Player/Female/FemaleAvatar_Lobby.png" fetchpriority="high">
    <link rel="preload" as="image" href="/assets/sprites/characters/Player/Male/MaleAvatar_Lobby.png" fetchpriority="high">
    @endif

    <!-- Vite Assets -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-black text-neutral-100 antialiased overflow-hidden select-none">
    <div id="raden-game-app"></div>
</body>
</html>
