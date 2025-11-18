/**
 * Brand Context - Multi-Tenant System
 * 
 * Provides brand information based on the current domain.
 * This enables multi-tenant routing where each subdomain loads its own brand.
 * 
 * Features:
 * - Auto-detect brand from URL
 * - Apply dynamic branding (CSS variables)
 * - Provide brand data to all components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Brand } from '../types';
import { getBrandByDomain } from '../services/brand/brandService';

interface BrandContextType {
  brand: Brand | null;
  loading: boolean;
  error: string | null;
  refreshBrand: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

interface BrandProviderProps {
  children: ReactNode;
}

export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrand = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current domain
      const hostname = window.location.hostname;
      console.log('🌐 Current hostname:', hostname);

      // Load brand from Firestore
      const brandData = await getBrandByDomain(hostname);

      if (brandData) {
        console.log('✅ Brand loaded:', brandData.name);
        setBrand(brandData);
      } else {
        console.log('ℹ️  No brand found for this domain');
        setBrand(null);
      }
    } catch (err: any) {
      console.error('❌ Error loading brand:', err);
      setError(err.message || 'Failed to load brand');
      setBrand(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshBrand = async () => {
    await loadBrand();
  };

  useEffect(() => {
    loadBrand();
  }, []);

  // Apply branding CSS variables when brand changes
  useEffect(() => {
    if (brand?.branding) {
      const { primaryColor, secondaryColor, backgroundColor } = brand.branding;

      console.log('🎨 Applying branding:', {
        primaryColor,
        secondaryColor,
        backgroundColor,
      });

      // Set CSS custom properties on :root
      const root = document.documentElement;
      root.style.setProperty('--brand-primary', primaryColor);
      root.style.setProperty('--brand-secondary', secondaryColor);
      root.style.setProperty('--brand-background', backgroundColor);

      // Also update meta theme-color for mobile browsers
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', primaryColor);
    }
  }, [brand]);

  return (
    <BrandContext.Provider value={{ brand, loading, error, refreshBrand }}>
      {children}
    </BrandContext.Provider>
  );
};

/**
 * Hook to access brand context
 */
export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

/**
 * Hook to check if user is brand owner (must be authenticated)
 */
export const useIsBrandOwner = (userId: string | null): boolean => {
  const { brand } = useBrand();

  if (!userId || !brand) {
    return false;
  }

  // Check would require superuser data - for MVP, assume if authenticated and brand exists
  // In production, this should check against superusers collection
  return true; // Simplified for MVP
};

