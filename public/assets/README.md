# RadenWorld Assets Directory

Struktur folder assets terpisah untuk game 2D RadenWorld:

```
public/assets/
├── sprites/
│   ├── characters/   <- Sprite pemain, hero, avatar (player.svg, dll.)
│   ├── monsters/     <- Sprite monster/musuh (slime.svg, goblin, dll.)
│   └── items/        <- Sprite drop item, peti harta karun (chest.svg, potion, dll.)
├── tilesets/         <- Asset lingkungan, pohon (tree.svg), batu (rock.svg), terrain
├── maps/             <- Peta open-world (JSON Tilemap dari Tiled Editor)
├── audio/
│   ├── bgm/          <- Background music (format .mp3 / .ogg)
│   └── sfx/          <- Sound effect (langkah kaki, tebasan, klik tombol)
└── ui/
    ├── hud/          <- Frame avatar, bar HP/Mana, dialog box
    └── icons/        <- Ikon skill, inventori, minimap
```

## Cara Menambahkan Asset Baru:
1. Simpan gambar berformat **.png**, **.svg**, atau **spritesheet** di folder yang sesuai.
2. Load asset di Phaser Scene melalui OOP Asset Loader (contoh di `resources/js/game/scenes/BootScene.ts`).
3. Semua asset di dalam folder `public/assets` dapat langsung diakses via URL `/assets/...`.
