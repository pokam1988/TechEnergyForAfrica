import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId =
  | 'emerald-classic'
  | 'warm-paper'
  | 'nordic-slate'
  | 'oceanic-deep'
  | 'midnight-dark'
  | 'high-contrast';

export type FontSize = 'normal' | 'large';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  nameEn: string;
  nameFr: string;
  description: string;
  descriptionEn: string;
  descriptionFr: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardColor: string;
  textColor: string;
  isDark: boolean;
  eyeCareBadge?: string;
}

export const THEMES_LIST: ThemeMeta[] = [
  {
    id: 'emerald-classic',
    name: 'Smaragd & Schiefer (Standard)',
    nameEn: 'Emerald & Slate (Default)',
    nameFr: 'Émeraude & Ardoise (Défaut)',
    description: 'Das bewährte NGO-Design von TechEnergy For Africa: Frisches Smaragdgrün, Schiefer-Header und saubere Kontraste.',
    descriptionEn: 'The signature NGO look for TechEnergy For Africa: Fresh emerald green, dark slate navigation, crisp contrast.',
    descriptionFr: 'Le design emblématique de TEFA : vert émeraude vif, barre ardoise et contrastes soignés.',
    primaryColor: '#059669',
    accentColor: '#10b981',
    bgColor: '#f1f5f9',
    cardColor: '#ffffff',
    textColor: '#0f172a',
    isDark: false,
  },
  {
    id: 'warm-paper',
    name: 'Augenschonend / Warmes Papier (Sepia)',
    nameEn: 'Warm Paper / Eye-Care (Sepia)',
    nameFr: 'Papier chaud / Confort visuel (Sépia)',
    description: 'Reduziert blaues Licht für ermüdungsfreies Arbeiten und Lesen. Sanfte Pergament- und Bernsteintöne.',
    descriptionEn: 'Reduces blue light exposure for relaxed reading and long working sessions. Gentle amber & parchment tones.',
    descriptionFr: 'Réduit la lumière bleue pour une lecture sans fatigue. Teintes douces de parchemin et d’ambre.',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    bgColor: '#fbf8f1',
    cardColor: '#fffdfa',
    textColor: '#451a03',
    isDark: false,
    eyeCareBadge: 'Augenschutz',
  },
  {
    id: 'oceanic-deep',
    name: 'Ozeanblau / Internationale Organisation',
    nameEn: 'Oceanic Blue / Global NGO',
    nameFr: 'Bleu Océanique / ONG Internationale',
    description: 'Seriöses Saphir- und Marineblau nach den Richtlinien internationaler Hilfsorganisationen (UN, GIZ, EU).',
    descriptionEn: 'Trustworthy sapphire and marine blue adhering to international aid & diplomacy design standards (UN, EU, GIZ).',
    descriptionFr: 'Bleu saphir et marine inspiré des standards des agences internationales et bailleurs de fonds.',
    primaryColor: '#0284c7',
    accentColor: '#0369a1',
    bgColor: '#f0f9ff',
    cardColor: '#ffffff',
    textColor: '#0c4a6e',
    isDark: false,
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate / Minimalistische Klarheit',
    nameEn: 'Nordic Slate / Minimal Tech',
    nameFr: 'Ardoise Nordique / Minimaliste',
    description: 'Kühles Graphit, feine Trennlinien und maximale Übersichtlichkeit für fokussiertes Arbeiten.',
    descriptionEn: 'Cool graphite, subtle lines, and maximum typographical clarity for distraction-free project management.',
    descriptionFr: 'Graphite épuré, lignes fines et clarté scandinave pour un travail sans distraction.',
    primaryColor: '#475569',
    accentColor: '#6366f1',
    bgColor: '#f8fafc',
    cardColor: '#ffffff',
    textColor: '#0f172a',
    isDark: false,
  },
  {
    id: 'midnight-dark',
    name: 'Midnight OLED / Dunkelmodus',
    nameEn: 'Midnight OLED / Dark Mode',
    nameFr: 'Minuit OLED / Mode Sombre',
    description: 'Schont die Augen bei Dunkelheit oder nachts. Tiefe Anthrazit-Töne mit leuchtenden Neon-Akzenten.',
    descriptionEn: 'Protects eyesight in dim environments. Deep charcoal backgrounds with vibrant indicator highlights.',
    descriptionFr: 'Idéal dans l’obscurité. Fonds sombres profonds avec touches lumineuses et élégantes.',
    primaryColor: '#10b981',
    accentColor: '#06b6d4',
    bgColor: '#090d16',
    cardColor: '#111827',
    textColor: '#f8fafc',
    isDark: true,
    eyeCareBadge: 'Nachtmodus',
  },
  {
    id: 'high-contrast',
    name: 'Barrierefrei / Maximaler Kontrast (A11Y)',
    nameEn: 'High Contrast / Accessible (A11Y)',
    nameFr: 'Contraste Élevé / Accessibilité (A11Y)',
    description: 'Erfüllt höchste Barrierefreiheitsstandards (WCAG AAA) mit dicken Linien, kräftiger Schrift und scharfen Trennungen.',
    descriptionEn: 'Complies with highest accessibility standards (WCAG AAA) featuring bold borders, distinct contrast, and clear focus.',
    descriptionFr: 'Conforme aux normes d’accessibilité maximales (WCAG AAA) avec bordures nettes et typographie renforcée.',
    primaryColor: '#000000',
    accentColor: '#059669',
    bgColor: '#f8fafc',
    cardColor: '#ffffff',
    textColor: '#000000',
    isDark: false,
    eyeCareBadge: 'Barrierefrei',
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  activeThemeMeta: ThemeMeta;
  themesList: ThemeMeta[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('impactflow_theme') as ThemeId;
      if (saved && THEMES_LIST.some((t) => t.id === saved)) return saved;
    } catch {
      // ignore
    }
    return 'emerald-classic';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem('impactflow_font_size') as FontSize;
      if (saved === 'normal' || saved === 'large') return saved;
    } catch {
      // ignore
    }
    return 'normal';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('impactflow_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
    try {
      localStorage.setItem('impactflow_font_size', newSize);
    } catch {
      // ignore
    }
  };

  // Apply data-theme and data-font-size to root html element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-font-size', fontSize);

    // Apply dark class if dark theme
    const activeMeta = THEMES_LIST.find((t) => t.id === theme);
    if (activeMeta?.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, fontSize]);

  const activeThemeMeta = THEMES_LIST.find((t) => t.id === theme) || THEMES_LIST[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        activeThemeMeta,
        themesList: THEMES_LIST,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
