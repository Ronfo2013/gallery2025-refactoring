import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 🎨 SYSTEM DESIGN LAYOUT & THEME
 *
 * Questo file funge da "Single Source of Truth" per l'aspetto visuale e le impostazioni
 * strutturali dell'applicazione. È progettato per essere condiviso tra più progetti.
 *
 * Ispirato ai moderni sistemi di Design Token.
 */

// --- 1. Definizioni di Tipo ---

export type ColorScheme = 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';
export type SurfaceStyle = 'glass' | 'solid' | 'minimal';

export interface ThemeConfig {
  name: string;
  branding: {
    logoText: string;
    colors: {
      primary: ColorScheme;
      accent: ColorScheme;
      darkBase: string; // Es. "bg-night-950"
    };
  };
  layout: {
    maxWidth: string; // Es. "max-w-7xl"
    navbar: {
      style: SurfaceStyle;
      sticky: boolean;
      height: string;
    };
    footer: {
      visible: boolean;
    };
    pagePadding: string; // Es. "px-4 sm:px-6 lg:px-8"
  };
  ui: {
    radius: string; // Es. "rounded-xl"
    buttonStyle: 'flat' | 'gradient' | 'outline';
    cardStyle: 'glass' | 'solid' | 'bordered';
  };
}

// --- 2. Configurazione Attiva (Modifica qui per cambiare l'app) ---

export const APP_THEME: ThemeConfig = {
  name: 'Gallery 2025',
  branding: {
    logoText: 'AI Gallery',
    colors: {
      primary: 'violet',
      accent: 'fuchsia',
      darkBase: 'bg-night-950',
    },
  },
  layout: {
    maxWidth: 'max-w-7xl',
    navbar: {
      style: 'glass',
      sticky: true,
      height: 'h-16',
    },
    footer: {
      visible: true,
    },
    pagePadding: 'px-4 sm:px-6 lg:px-8',
  },
  ui: {
    radius: 'rounded-2xl',
    buttonStyle: 'gradient',
    cardStyle: 'glass',
  },
};

// --- 3. Utilities / Helpers ---

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Restituisce le classi per il gradiente primario basato sulla configurazione
 */
export const getPrimaryGradient = (_opacity = false) => {
  const { primary, accent } = APP_THEME.branding.colors;
  // Nota: Tailwind deve poter rilevare queste stringhe complete per generarle.
  // In un sistema avanzato useremmo CSS Vars, ma qui usiamo mappe sicure.

  const _gradientMap: Record<string, string> = {
    'indigo-fuchsia': 'from-indigo-500 via-purple-500 to-fuchsia-500',
    // Aggiungi combinazioni qui o costruisci dinamicamente se configuri safelist
  };

  // Fallback generico sicuro se non mappato specificamente
  return `bg-gradient-to-r from-${primary}-500 to-${accent}-500`;
};

/**
 * Restituisce le classi base per le card
 */
export const getCardClasses = (interactive = false) => {
  const style = APP_THEME.ui.cardStyle;
  const base = `${APP_THEME.ui.radius} border`;

  const variants = {
    glass: 'bg-night-900/40 backdrop-blur-md border-white/10',
    solid: 'bg-night-800 border-night-700',
    bordered: 'bg-transparent border-night-700',
  };

  const interaction = interactive ? 'hover:border-white/20 transition-colors duration-300' : '';

  return cn(base, variants[style], interaction);
};

export const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  const rounded = APP_THEME.ui.radius;
  const colors = APP_THEME.branding.colors;

  // Classi base condivise
  const base = `${rounded} font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2`;

  // Varianti
  if (variant === 'primary') {
    if (APP_THEME.ui.buttonStyle === 'gradient') {
      return cn(
        base,
        `bg-gradient-to-r from-${colors.primary}-600 to-${colors.accent}-600 hover:from-${colors.primary}-500 hover:to-${colors.accent}-500 text-white shadow-lg shadow-${colors.primary}-500/20`
      );
    }
    return cn(base, `bg-${colors.primary}-600 hover:bg-${colors.primary}-500 text-white`);
  }

  if (variant === 'secondary') {
    return cn(base, 'bg-white/10 hover:bg-white/20 text-white border border-white/5');
  }

  return cn(base, 'text-gray-400 hover:text-white hover:bg-white/5');
};
