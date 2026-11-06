/**
 * ============================================================================
 * FILE: resources/js/game/core/ThemeManager.ts
 * ============================================================================
 * Sistem Kustomisasi Tema, Tipografi, Aksesibilitas & Tata Letak UI RadenWorld:
 * 1. Palet Tema Preset & Warna Kustom (Panel, Border, Aksen, Teks).
 * 2. Tipografi: Pilihan Font (Pixel Classic, Pixel Modern, m5x7, Sans, Monospace), Ukuran, & Ketebalan.
 * 3. Tata Letak (Layout Position): Peta Radar / Minimap, Toolbar Hotbar, Chat.
 * 4. Visibilitas Elemen UI (On / Off Switch).
 * 5. Aksesibilitas: Buta Warna (Protanopia, Deuteranopia, Tritanopia) & Monokrom / Hitam Putih.
 * 6. Tombol Kembali ke Bawaan (Reset to Default).
 * ============================================================================
 */

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
export type ThemePreset = 'cozy_clay' | 'obsidian_dark' | 'cyber_pastel' | 'forest_green' | 'ocean_breeze' | 'custom';
export type FontFamilyChoice = 'pixel_classic' | 'pixel_modern' | 'pixel_compact' | 'sans_modern' | 'retro_mono';
export type FontSizeScale = 'small' | 'normal' | 'large';
export type FontWeightChoice = 'normal' | 'bold' | 'black';

export type MinimapPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type ChatPosition = 'bottom-left' | 'bottom-right';
export type HotbarPosition = 'bottom-center' | 'top-center';

export interface UIElementVisibility {
  showMinimap: boolean;
  showPlayerStats: boolean;
  showChat: boolean;
  showHotbar: boolean;
  showControlsGuide: boolean;
  showCoordinates: boolean;
}

export interface CustomThemeColors {
  panelBg: string;
  cardBg?: string;
  panelBorder: string;
  accentPrimary: string;
  accentSecondary: string;
  textColor: string;
}

export interface ThemeSettings {
  preset: ThemePreset;
  customColors: CustomThemeColors;
  fontFamily: FontFamilyChoice;
  fontSize: FontSizeScale;
  fontWeight: FontWeightChoice;
  colorBlindMode: ColorBlindMode;
  minimapPosition: MinimapPosition;
  chatPosition: ChatPosition;
  hotbarPosition: HotbarPosition;
  visibility: UIElementVisibility;
}

export const THEME_PRESETS: Record<Exclude<ThemePreset, 'custom'>, { name: string; description: string; colors: CustomThemeColors }> = {
  cozy_clay: {
    name: 'Cozy Clay (Bawaan)',
    description: 'Nuansa hangat pastel kayu & tembikar khas RadenWorld.',
    colors: {
      panelBg: '#FFF8EA',
      cardBg: '#FFFDF7',
      panelBorder: '#5C3A21',
      accentPrimary: '#FFAE6D',
      accentSecondary: '#A8E6CF',
      textColor: '#000000',
    },
  },
  obsidian_dark: {
    name: 'Obsidian Dark (Mode Gelap)',
    description: 'Tampilan malam elegan berlatar arang gelap dan aksen emas neon.',
    colors: {
      panelBg: '#18181B',
      cardBg: '#27272A',
      panelBorder: '#52525B',
      accentPrimary: '#F59E0B',
      accentSecondary: '#10B981',
      textColor: '#FFFFFF',
    },
  },
  cyber_pastel: {
    name: 'Cyber Pastel',
    description: 'Kombinasi lavender futuristik dengan mint segar lembut.',
    colors: {
      panelBg: '#F5F3FF',
      cardBg: '#FAF5FF',
      panelBorder: '#6D28D9',
      accentPrimary: '#C084FC',
      accentSecondary: '#6EE7B7',
      textColor: '#1E1B4B',
    },
  },
  forest_green: {
    name: 'Forest Nature',
    description: 'Nuansa alam daun hutan tropis yang menenangkan mata.',
    colors: {
      panelBg: '#F0FDF4',
      cardBg: '#F7FEE7',
      panelBorder: '#14532D',
      accentPrimary: '#4ADE80',
      accentSecondary: '#86EFAC',
      textColor: '#052E16',
    },
  },
  ocean_breeze: {
    name: 'Ocean Breeze',
    description: 'Biru samudra cerah dengan tepian biru tua menyegarkan.',
    colors: {
      panelBg: '#F0F9FF',
      cardBg: '#F8FAFC',
      panelBorder: '#0369A1',
      accentPrimary: '#38BDF8',
      accentSecondary: '#7DD3FC',
      textColor: '#082F49',
    },
  },
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  preset: 'cozy_clay',
  customColors: {
    panelBg: '#FFF8EA',
    cardBg: '#FFFDF7',
    panelBorder: '#5C3A21',
    accentPrimary: '#FFAE6D',
    accentSecondary: '#A8E6CF',
    textColor: '#000000',
  },
  fontFamily: 'pixel_classic',
  fontSize: 'normal',
  fontWeight: 'bold',
  colorBlindMode: 'none',
  minimapPosition: 'top-right',
  chatPosition: 'bottom-left',
  hotbarPosition: 'bottom-center',
  visibility: {
    showMinimap: true,
    showPlayerStats: true,
    showChat: true,
    showHotbar: true,
    showControlsGuide: true,
    showCoordinates: true,
  },
};

export const FONT_FAMILY_MAP: Record<FontFamilyChoice, { name: string; style: string }> = {
  pixel_classic: {
    name: 'Kenney Pixel Square (Klasik)',
    style: "'Kenney Pixel Square', monospace",
  },
  pixel_modern: {
    name: 'Pixelify Sans (Pixel Halus)',
    style: "'Pixelify Sans', sans-serif",
  },
  pixel_compact: {
    name: 'm5x7 (Ringkas & Padat)',
    style: "'m5x7', monospace",
  },
  sans_modern: {
    name: 'Sans-Serif Modern (Bersih)',
    style: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  retro_mono: {
    name: 'Mesin Tik Retro (Monospace)',
    style: "'Courier New', Courier, monospace",
  },
};

export const COLORBLIND_INFO: Record<ColorBlindMode, { label: string; desc: string; filterStyle: string }> = {
  none: {
    label: 'Normal (Penuh Warna)',
    desc: 'Tampilan warna asli alami tanpa penyesuaian filter.',
    filterStyle: 'none',
  },
  protanopia: {
    label: 'Protanopia (Buta Warna Merah)',
    desc: 'Menyesuaikan spektrum merah-hijau agar kontras kuning-biru mudah dibedakan.',
    filterStyle: 'url(#raden-protanopia)',
  },
  deuteranopia: {
    label: 'Deuteranopia (Buta Warna Hijau)',
    desc: 'Optimal untuk kesulitan membedakan warna hijau (tipe buta warna paling umum).',
    filterStyle: 'url(#raden-deuteranopia)',
  },
  tritanopia: {
    label: 'Tritanopia (Buta Warna Biru)',
    desc: 'Menyesuaikan kontras spektrum biru-kuning untuk pembacaan jelas.',
    filterStyle: 'url(#raden-tritanopia)',
  },
  monochrome: {
    label: 'Hitam Putih / Monokrom',
    desc: 'Meredakan pusing atau silau akibat warna-warni yang terlalu ramai. Sangat nyaman untuk mata lelah.',
    filterStyle: 'grayscale(100%) contrast(1.08)',
  },
};

/**
 * Terapkan variabel tema langsung ke DOM HTML agar semua komponen UI terupdate instan
 */
export function applyThemeToDom(theme: ThemeSettings = DEFAULT_THEME_SETTINGS) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const colors = theme.preset === 'custom' ? theme.customColors : (THEME_PRESETS[theme.preset]?.colors || DEFAULT_THEME_SETTINGS.customColors);

  root.style.setProperty('--raden-panel-bg', colors.panelBg);
  root.style.setProperty('--raden-card-bg', colors.cardBg || (theme.preset === 'obsidian_dark' ? '#27272A' : colors.panelBg));
  root.style.setProperty('--raden-panel-border', colors.panelBorder);
  root.style.setProperty('--raden-accent-primary', colors.accentPrimary);
  root.style.setProperty('--raden-accent-secondary', colors.accentSecondary);
  root.style.setProperty('--raden-text-color', colors.textColor);

  const fontDef = FONT_FAMILY_MAP[theme.fontFamily] || FONT_FAMILY_MAP.pixel_classic;
  root.style.setProperty('--raden-font-family', fontDef.style);

  const fontScale = theme.fontSize === 'small' ? '0.88' : theme.fontSize === 'large' ? '1.14' : '1';
  root.style.setProperty('--raden-font-scale', fontScale);
  root.style.fontSize = `calc(16px * ${fontScale})`;

  const fontWeight = theme.fontWeight === 'normal' ? '400' : theme.fontWeight === 'black' ? '900' : '700';
  root.style.setProperty('--raden-font-weight', fontWeight);

  const filterInfo = COLORBLIND_INFO[theme.colorBlindMode] || COLORBLIND_INFO.none;
  root.style.setProperty('--raden-viewport-filter', filterInfo.filterStyle);

  // Pasang filter visual ke elemen root & body agar seluruh game (canvas, HUD, modal) terpengaruh filter
  if (document.body) {
    document.body.style.filter = filterInfo.filterStyle;
    document.body.style.backgroundColor = colors.panelBg;
    document.body.style.color = colors.textColor;
  }
}

