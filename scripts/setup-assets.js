import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const assetsDir = path.join(projectRoot, 'public', 'assets');

const folders = [
  'sprites/characters',
  'sprites/monsters',
  'sprites/items',
  'tilesets',
  'maps',
  'audio/sfx',
  'audio/bgm',
  'ui/hud',
  'ui/icons'
];

folders.forEach(dir => {
  const fullPath = path.join(assetsDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
});

// 1. Player Sprite SVG (32x32 stylized adventurer with sword & cape)
const playerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <!-- Shadow -->
  <ellipse cx="24" cy="44" rx="14" ry="4" fill="rgba(0,0,0,0.35)"/>
  
  <!-- Cloak / Cape -->
  <path d="M16 20 L10 38 L24 40 L38 38 L32 20 Z" fill="#3b82f6" filter="url(#glow)"/>
  
  <!-- Body / Armor -->
  <rect x="17" y="19" width="14" height="17" rx="3" fill="#1e293b"/>
  <rect x="20" y="21" width="8" height="13" rx="2" fill="#475569"/>
  <!-- Gold crest -->
  <polygon points="24,24 22,28 26,28" fill="#fbbf24"/>
  
  <!-- Legs / Boots -->
  <rect x="17" y="36" width="5" height="7" rx="2" fill="#0f172a"/>
  <rect x="26" y="36" width="5" height="7" rx="2" fill="#0f172a"/>

  <!-- Head -->
  <circle cx="24" cy="13" r="8" fill="#fbcfe8"/>
  
  <!-- Hair / Knight Helm -->
  <path d="M16 12 C16 6, 32 6, 32 12 C32 14, 30 15, 29 16 L19 16 Z" fill="#6366f1"/>
  <rect x="21" y="4" width="6" height="5" rx="1" fill="#ec4899"/>
  
  <!-- Eyes -->
  <circle cx="21" cy="13" r="1.5" fill="#0f172a"/>
  <circle cx="27" cy="13" r="1.5" fill="#0f172a"/>

  <!-- Sword on hand -->
  <rect x="34" y="20" width="3" height="18" rx="1" fill="#e2e8f0"/>
  <rect x="31" y="24" width="9" height="3" rx="1" fill="#f59e0b"/>
  <circle cx="35.5" cy="39" r="2" fill="#f59e0b"/>

  <!-- Shield on left hand -->
  <polygon points="12,22 8,26 8,33 12,37 16,33 16,26" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
</svg>`;

// 2. Slime / Monster Sprite SVG
const slimeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <ellipse cx="24" cy="42" rx="15" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M12 40 C6 38, 6 24, 16 20 C20 12, 28 12, 32 20 C42 24, 42 38, 36 40 C30 42, 18 42, 12 40 Z" fill="#10b981"/>
  <ellipse cx="20" cy="22" rx="3" ry="5" fill="#34d399" opacity="0.6"/>
  <!-- Eyes -->
  <circle cx="19" cy="28" r="3.5" fill="#ffffff"/>
  <circle cx="20" cy="28" r="1.8" fill="#064e3b"/>
  <circle cx="29" cy="28" r="3.5" fill="#ffffff"/>
  <circle cx="28" cy="28" r="1.8" fill="#064e3b"/>
  <!-- Mouth -->
  <path d="M22 34 Q24 37 26 34" stroke="#064e3b" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;

// 3. NPC Wise Sage SVG
const npcSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <ellipse cx="24" cy="44" rx="13" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- Robe -->
  <path d="M16 18 L12 42 L36 42 L32 18 Z" fill="#7c3aed"/>
  <path d="M22 18 L22 42 L26 42 L26 18 Z" fill="#fbbf24"/>
  <!-- Head -->
  <circle cx="24" cy="14" r="7" fill="#fed7aa"/>
  <!-- Sage Beard -->
  <polygon points="19,16 29,16 24,28" fill="#f1f5f9"/>
  <!-- Eyes -->
  <circle cx="21" cy="13" r="1.2" fill="#1e1b4b"/>
  <circle cx="27" cy="13" r="1.2" fill="#1e1b4b"/>
  <!-- Wizard Hat -->
  <polygon points="24,2 14,14 34,14" fill="#6d28d9"/>
  <ellipse cx="24" cy="14" rx="12" ry="2.5" fill="#4c1d95"/>
  <circle cx="24" cy="3" r="2" fill="#fbbf24"/>
</svg>`;

// 4. Tree Asset SVG
const treeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" width="64" height="80">
  <ellipse cx="32" cy="74" rx="18" ry="6" fill="rgba(0,0,0,0.25)"/>
  <!-- Trunk -->
  <rect x="28" y="46" width="8" height="28" rx="2" fill="#78350f"/>
  <path d="M28 58 L22 52 L28 50 Z" fill="#78350f"/>
  <path d="M36 60 L42 54 L36 52 Z" fill="#78350f"/>
  <!-- Leaves layers -->
  <polygon points="32,8 10,40 54,40" fill="#047857"/>
  <polygon points="32,18 14,48 50,48" fill="#059669"/>
  <polygon points="32,28 16,56 48,56" fill="#10b981"/>
</svg>`;

// 5. Rock Asset SVG
const rockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" width="48" height="36">
  <ellipse cx="24" cy="30" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <polygon points="10,28 8,18 18,8 32,6 40,16 38,28" fill="#64748b"/>
  <polygon points="18,8 32,6 28,18 14,20" fill="#94a3b8"/>
  <polygon points="28,18 40,16 38,28 26,28" fill="#475569"/>
</svg>`;

// 6. Chest / Item Asset SVG
const chestSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <ellipse cx="18" cy="32" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- Chest Box -->
  <rect x="4" y="14" width="28" height="16" rx="2" fill="#b45309" stroke="#78350f" stroke-width="2"/>
  <rect x="4" y="8" width="28" height="8" rx="3" fill="#d97706" stroke="#78350f" stroke-width="2"/>
  <!-- Metal bands -->
  <rect x="8" y="8" width="4" height="22" fill="#f59e0b"/>
  <rect x="24" y="8" width="4" height="22" fill="#f59e0b"/>
  <!-- Lock -->
  <circle cx="18" cy="18" r="3" fill="#fbbf24" stroke="#78350f" stroke-width="1"/>
  <rect x="17" y="18" width="2" height="4" fill="#78350f"/>
</svg>`;

// Write SVG files
fs.writeFileSync(path.join(assetsDir, 'sprites/characters/player.svg'), playerSvg);
fs.writeFileSync(path.join(assetsDir, 'sprites/monsters/slime.svg'), slimeSvg);
fs.writeFileSync(path.join(assetsDir, 'sprites/characters/npc.svg'), npcSvg);
fs.writeFileSync(path.join(assetsDir, 'tilesets/tree.svg'), treeSvg);
fs.writeFileSync(path.join(assetsDir, 'tilesets/rock.svg'), rockSvg);
fs.writeFileSync(path.join(assetsDir, 'sprites/items/chest.svg'), chestSvg);

// Write README documentation for assets
const readmeContent = `# RadenWorld Assets Directory

Struktur folder assets terpisah untuk game 2D RadenWorld:

\`\`\`
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
\`\`\`

## Cara Menambahkan Asset Baru:
1. Simpan gambar berformat **.png**, **.svg**, atau **spritesheet** di folder yang sesuai.
2. Load asset di Phaser Scene melalui OOP Asset Loader (contoh di \`resources/js/game/scenes/BootScene.ts\`).
3. Semua asset di dalam folder \`public/assets\` dapat langsung diakses via URL \`/assets/...\`.
`;

fs.writeFileSync(path.join(assetsDir, 'README.md'), readmeContent);
console.log('Successfully structured and populated public/assets!');
