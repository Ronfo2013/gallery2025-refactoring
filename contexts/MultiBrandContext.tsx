/**
 * Multi-Brand Context
 *
 * Manages multi-brand support for superusers who own/manage multiple brands.
 * Provides brand selection and switching functionality.
 *
 * This is separate from BrandContext (which is for public galleries).
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Brand, SuperUser } from '../types';
import { getBrandById } from '../services/brand/brandService';
import { logger } from '@/utils/logger';

interface MultiBrandContextType {
  superUser: SuperUser | null;
  brands: Brand[];
  currentBrand: Brand | null;
  loading: boolean;
  error: string | null;
  switchBrand: (brandId: string) => Promise<void>;
  refreshBrands: () => Promise<void>;
}

const MultiBrandContext = createContext<MultiBrandContextType | undefined>(undefined);

interface MultiBrandProviderProps {
  userId: string; // Firebase Auth UID
  children: ReactNode;
}

const ACTIVE_BRAND_STORAGE_KEY = 'gallery_active_brand_id';

export const MultiBrandProvider: React.FC<MultiBrandProviderProps> = ({ userId, children }) => {
  const [superUser, setSuperUser] = useState<SuperUser | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndBrands();
  }, [userId]);

  const loadUserAndBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('🔍 Loading superuser data for UID:', userId);

      // 1. Load superuser document
      const superuserDoc = await getDoc(doc(db, 'superusers', userId));

      if (!superuserDoc.exists()) {
        throw new Error('SuperUser document not found');
      }

      const superuserData = {
        id: superuserDoc.id,
        ...superuserDoc.data(),
      } as SuperUser;

      setSuperUser(superuserData);
      logger.info('✅ SuperUser loaded:', superuserData);

      // 2. Get brand IDs (support both old and new format)
      let brandIds: string[] = [];

      if (superuserData.brandIds && superuserData.brandIds.length > 0) {
        // New format: array of brand IDs
        brandIds = superuserData.brandIds;
      } else if (superuserData.brandId) {
        // Legacy format: single brandId
        brandIds = [superuserData.brandId];
      } else {
        throw new Error('No brands associated with this user');
      }

      logger.info('📦 Brand IDs:', brandIds);

      // 3. Load all brands
      const brandPromises = brandIds.map((brandId) => getBrandById(brandId));
      const brandsData = (await Promise.all(brandPromises)).filter((b): b is Brand => b !== null);

      if (brandsData.length === 0) {
        throw new Error('No active brands found');
      }

      setBrands(brandsData);
      logger.info(
        `✅ Loaded ${brandsData.length} brand(s):`,
        brandsData.map((b) => b.name)
      );

      // 4. Determine which brand to show
      let activeBrandId: string | null = null;

      // Try to get from localStorage first
      const storedBrandId = localStorage.getItem(ACTIVE_BRAND_STORAGE_KEY);
      if (storedBrandId && brandIds.includes(storedBrandId)) {
        activeBrandId = storedBrandId;
        logger.info('📍 Using stored brand ID from localStorage:', activeBrandId);
      } else {
        // Use first brand as default
        activeBrandId = brandIds[0];
        logger.info('📍 Using first brand as default:', activeBrandId);
      }

      const activeBrand = brandsData.find((b) => b.id === activeBrandId);
      if (activeBrand) {
        setCurrentBrand(activeBrand);
        logger.info('✅ Current brand set:', activeBrand.name);
      }
    } catch (err: any) {
      logger.error('❌ Error loading user brands:', err);
      setError(err.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const switchBrand = async (brandId: string) => {
    try {
      logger.info('🔄 Switching to brand:', brandId);

      const brand = brands.find((b) => b.id === brandId);
      if (!brand) {
        throw new Error('Brand not found');
      }

      setCurrentBrand(brand);
      localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, brandId);

      logger.info('✅ Switched to brand:', brand.name);
    } catch (err: any) {
      logger.error('❌ Error switching brand:', err);
      throw err;
    }
  };

  const refreshBrands = async () => {
    await loadUserAndBrands();
  };

  return (
    <MultiBrandContext.Provider
      value={{
        superUser,
        brands,
        currentBrand,
        loading,
        error,
        switchBrand,
        refreshBrands,
      }}
    >
      {children}
    </MultiBrandContext.Provider>
  );
};

/**
 * Hook to access multi-brand context
 */
export const useMultiBrand = (): MultiBrandContextType => {
  const context = useContext(MultiBrandContext);
  if (context === undefined) {
    throw new Error('useMultiBrand must be used within a MultiBrandProvider');
  }
  return context;
};


