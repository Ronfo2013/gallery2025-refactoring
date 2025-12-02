/**
 * Landing Page Context
 *
 * Fornisce le impostazioni della Landing Page a tutti i componenti.
 * Carica i dati da Firestore e gestisce il caching.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LandingPageSettings } from '../types';
import {
  getLandingPageSettings,
  getDefaultLandingPageSettings,
} from '../services/platform/landingPageService';

interface LandingPageContextType {
  settings: LandingPageSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  useDefaults: boolean; // True se stiamo usando i defaults
}

const LandingPageContext = createContext<LandingPageContextType | undefined>(undefined);

interface LandingPageProviderProps {
  children: ReactNode;
}

export const LandingPageProvider: React.FC<LandingPageProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<LandingPageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDefaults, setUseDefaults] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading landing page settings...');
      const data = await getLandingPageSettings();

      if (data) {
        console.log('✅ Landing page settings loaded from Firestore');
        setSettings(data);
        setUseDefaults(false);
      } else {
        console.log('ℹ️  Using default landing page settings');
        setSettings(getDefaultLandingPageSettings());
        setUseDefaults(true);
      }
    } catch (err: any) {
      console.error('❌ Error loading landing page settings:', err);
      setError(err.message || 'Failed to load landing page settings');

      // Fallback to defaults on error
      console.log('⚠️  Falling back to default settings');
      setSettings(getDefaultLandingPageSettings());
      setUseDefaults(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply branding CSS variables when settings change
  useEffect(() => {
    if (settings?.branding) {
      const { primaryColor, secondaryColor, accentColor } = settings.branding;

      console.log('🎨 Applying landing page branding:', {
        primaryColor,
        secondaryColor,
        accentColor,
      });

      // Set CSS custom properties on :root
      const root = document.documentElement;
      root.style.setProperty('--landing-primary', primaryColor);
      root.style.setProperty('--landing-secondary', secondaryColor);
      root.style.setProperty('--landing-accent', accentColor);
    }
  }, [settings]);

  return (
    <LandingPageContext.Provider value={{ settings, loading, error, refreshSettings, useDefaults }}>
      {children}
    </LandingPageContext.Provider>
  );
};

/**
 * Hook to access landing page context
 */
export const useLandingPage = (): LandingPageContextType => {
  const context = useContext(LandingPageContext);
  if (context === undefined) {
    throw new Error('useLandingPage must be used within a LandingPageProvider');
  }
  return context;
};
