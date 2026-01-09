/**
 * Brand Context - Multi-Tenant System
 *
 * Provides brand information based on the current path.
 * Each brand is identified by a slug in the URL:
 * - https://www.clubgallery.com/{brandSlug}
 * - https://www.clubgallery.com/{brandSlug}/{galleryId}
 *
 * Features:
 * - Auto-detect brand from URL path
 * - Apply dynamic branding (CSS variables)
 * - Provide brand data to all components
 */

import { logger } from '@/utils/logger';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getBrandBySlug } from '../services/brand/brandService';
import { Brand } from '../types';

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

// Persist demo selection across navigation inside the same session
const DEMO_SESSION_KEY = 'demoBrandActive';

export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadBrandRef = useRef<(() => Promise<void>) | null>(null); // Ref to hold the latest loadBrand function

  const loadBrand = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're on a special route that doesn't need brand
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      const pathSegments = pathname.split('/').filter(Boolean);
      const firstPathSegment = pathSegments.length ? pathSegments[0]?.toLowerCase() : null;

      // Special routes can be detected from path OR hash (for backward compatibility)
      const specialRoutes = ['dashboard', 'superadmin', 'signup', 'login'];
      const specialHashes = ['#/dashboard', '#/superadmin', '#/signup', '#/login'];

      // Check if first path segment is a special route
      const isSpecialPathRoute = firstPathSegment && specialRoutes.includes(firstPathSegment);

      // Check if hash is a special route (backward compatibility)
      const isSpecialHashRoute =
        !firstPathSegment &&
        specialHashes.some((route) => hash === route || hash.startsWith(`${route}/`));

      const isSpecialRoute = isSpecialPathRoute || isSpecialHashRoute;

      // If it's a special route, don't try to load it as a brand slug
      const slugFromPath = isSpecialPathRoute ? null : firstPathSegment;

      const hasDemoSession = sessionStorage.getItem(DEMO_SESSION_KEY) === 'true';
      const isDemoPath = firstPathSegment === 'demo';
      const isDemoRoute =
        isDemoPath || hash === '#/demo' || hash.startsWith('#/demo/') || hasDemoSession;

      if (isSpecialRoute) {
        logger.info(
          '🔓 Special route detected, skipping brand loading. Path:',
          window.location.pathname,
          'Hash:',
          hash
        );
        setBrand(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Special handling for demo gallery - NO brand required
      if (isDemoRoute) {
        logger.info('🎨 Demo route detected (no brand). Path:', pathname, 'Hash:', hash);
        sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
        setBrand(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Get current domain
      // Determine brand by slug path first
      if (slugFromPath) {
        logger.info('🔎 Path slug detected, trying slug lookup:', slugFromPath);
        const slugBrand = await getBrandBySlug(slugFromPath);
        if (slugBrand) {
          logger.info('✅ Brand loaded by slug:', slugBrand.name);
          setBrand(slugBrand);
          setLoading(false);
          return;
        }
        logger.warn('⚠️ No brand found for slug path');
      }

      // No brand found from slug or demo route - show landing page
      logger.info('ℹ️  No brand found for current path - showing Landing Page');
      setBrand(null);
      setError(null);
    } catch (err: any) {
      logger.error('❌ Error loading brand:', err);

      // If it's a "Missing or insufficient permissions" error on a query that returned no results,
      // it's likely just "no brand found" - not a real error
      const isPermissionError = err.message?.includes('Missing or insufficient permissions');
      const isNotFoundScenario = isPermissionError && !brand;

      if (isNotFoundScenario) {
        logger.info('ℹ️  No brand found (permission check) - showing Landing Page');
        setBrand(null);
        setError(null); // Treat as "not found" rather than error
      } else {
        setError(err.message || 'Failed to load brand');
        setBrand(null);
      }
    } finally {
      setLoading(false);
    }
  }, [setBrand, setLoading, setError]); // Add dependencies for useCallback

  const refreshBrand = useCallback(async () => {
    await loadBrand();
  }, [loadBrand]);

  // Update the ref whenever loadBrand changes
  useEffect(() => {
    loadBrandRef.current = loadBrand;
  }, [loadBrand]);

  // Load brand on mount and listen for hash changes
  useEffect(() => {
    // Initial load
    logger.info('🚀 BrandContext mounted, initial load...');
    loadBrand();

    // Listen for hash changes using the ref to always call the latest loadBrand
    const handleHashChange = () => {
      logger.info('🔄 Hash changed detected!');
      logger.info('   New hash:', window.location.hash);
      logger.info('   Calling loadBrandRef.current()...');
      if (loadBrandRef.current) {
        loadBrandRef.current();
      } else {
        logger.error('❌ loadBrandRef.current is null!');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    logger.info('👂 Hash change listener attached');

    return () => {
      logger.info('🧹 Cleaning up hash change listener');
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loadBrand]);

  // ADDITIONAL: Poll hash every 100ms to detect changes that don't trigger hashchange
  useEffect(() => {
    let lastHash = window.location.hash;
    logger.info('🔍 Starting hash polling... Initial hash:', lastHash);

    const pollHash = setInterval(() => {
      const currentHash = window.location.hash;
      if (currentHash !== lastHash) {
        logger.info('🔄 Hash changed (detected by polling)!');
        logger.info('   Old:', lastHash, '→ New:', currentHash);
        lastHash = currentHash;
        if (loadBrandRef.current) {
          loadBrandRef.current();
        }
      }
    }, 100);

    return () => {
      logger.info('🧹 Stopping hash polling');
      clearInterval(pollHash);
    };
  }, []);

  // Apply branding CSS variables when brand changes
  useEffect(() => {
    if (brand?.branding) {
      const { primaryColor, secondaryColor, backgroundColor } = brand.branding;

      logger.info('🎨 Applying branding:', {
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
