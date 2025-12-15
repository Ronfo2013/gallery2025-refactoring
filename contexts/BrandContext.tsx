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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { Brand } from '../types';
import { getBrandByDomain, getBrandBySlug } from '../services/brand/brandService';

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
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const firstPathSegment = pathSegments.length ? pathSegments[0]?.toLowerCase() : null;

      // Special routes can be detected from path OR hash (for backward compatibility)
      const specialRoutes = ['dashboard', 'superadmin', 'signup'];
      const specialHashes = ['#/dashboard', '#/superadmin', '#/signup'];

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
      const isDemoRoute = hash === '#/demo' || hash.startsWith('#/demo/') || hasDemoSession;

      if (isSpecialRoute) {
        console.log('🔓 Special route detected, skipping brand loading. Path:', window.location.pathname, 'Hash:', hash);
        setBrand(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Special handling for demo gallery
      if (isDemoRoute) {
        console.log('🎨 Loading demo brand for hash:', hash);
        console.log('📞 Calling getBrandByDomain("demo")...');
        try {
          const demoBrandData = await getBrandByDomain('demo');
          console.log('📦 getBrandByDomain returned:', demoBrandData);
          if (demoBrandData) {
            console.log('✅ Demo brand loaded:', demoBrandData.name, demoBrandData);
            setBrand(demoBrandData);
            sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
            setLoading(false);
            return;
          } else {
            console.warn('⚠️  Demo brand not found by subdomain "demo"');
            sessionStorage.removeItem(DEMO_SESSION_KEY);
          }
        } catch (demoErr) {
          console.error('❌ Error loading demo brand:', demoErr);
          sessionStorage.removeItem(DEMO_SESSION_KEY);
        }
      }

      // Get current domain
      // Determine brand by slug path first
      if (slugFromPath) {
        console.log('🔎 Path slug detected, trying slug lookup:', slugFromPath);
        const slugBrand = await getBrandBySlug(slugFromPath);
        if (slugBrand) {
          console.log('✅ Brand loaded by slug:', slugBrand.name);
          setBrand(slugBrand);
          setLoading(false);
          return;
        }
        console.warn('⚠️ No brand found for slug path, falling back to domain detection');
      }

      const hostname = window.location.hostname;
      console.log('🌐 Current hostname:', hostname);

      // Load brand from Firestore via domain (subdomain)
      const brandData = await getBrandByDomain(hostname);

      if (brandData) {
        console.log('✅ Brand loaded:', brandData.name);
        setBrand(brandData);
      } else {
        console.log('ℹ️  No brand found for this domain - showing Landing Page');
        setBrand(null);
        setError(null); // No brand is OK - will show landing page
      }
    } catch (err: any) {
      console.error('❌ Error loading brand:', err);

      // If it's a "Missing or insufficient permissions" error on a query that returned no results,
      // it's likely just "no brand found" - not a real error
      const isPermissionError = err.message?.includes('Missing or insufficient permissions');
      const isNotFoundScenario = isPermissionError && !brand;

      if (isNotFoundScenario) {
        console.log('ℹ️  No brand found (permission check) - showing Landing Page');
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
    console.log('🚀 BrandContext mounted, initial load...');
    loadBrand();

    // Listen for hash changes using the ref to always call the latest loadBrand
    const handleHashChange = () => {
      console.log('🔄 Hash changed detected!');
      console.log('   New hash:', window.location.hash);
      console.log('   Calling loadBrandRef.current()...');
      if (loadBrandRef.current) {
        loadBrandRef.current();
      } else {
        console.error('❌ loadBrandRef.current is null!');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    console.log('👂 Hash change listener attached');

    return () => {
      console.log('🧹 Cleaning up hash change listener');
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loadBrand]);

  // ADDITIONAL: Poll hash every 100ms to detect changes that don't trigger hashchange
  useEffect(() => {
    let lastHash = window.location.hash;
    console.log('🔍 Starting hash polling... Initial hash:', lastHash);

    const pollHash = setInterval(() => {
      const currentHash = window.location.hash;
      if (currentHash !== lastHash) {
        console.log('🔄 Hash changed (detected by polling)!');
        console.log('   Old:', lastHash, '→ New:', currentHash);
        lastHash = currentHash;
        if (loadBrandRef.current) {
          loadBrandRef.current();
        }
      }
    }, 100);

    return () => {
      console.log('🧹 Stopping hash polling');
      clearInterval(pollHash);
    };
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
