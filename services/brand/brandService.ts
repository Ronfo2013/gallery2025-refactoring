/**
 * Brand Service - Multi-Brand MVP
 *
 * Handles all brand-related operations:
 * - Get brand by domain/subdomain
 * - Update branding
 * - Brand CRUD operations
 */

import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Brand, BrandBranding } from '../../types';

/**
 * Get brand by domain (subdomain or custom domain)
 * This is the primary function for multi-tenant routing
 */
export const getBrandByDomain = async (domain: string): Promise<Brand | null> => {
  try {
    // Clean domain (remove protocol and port)
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')
      .toLowerCase();

    console.log('🔍 Looking for brand with domain:', cleanDomain);

    // First, try to find by subdomain
    const subdomainQuery = query(
      collection(db, 'brands'),
      where('subdomain', '==', cleanDomain),
      where('status', '==', 'active')
    );

    const subdomainSnapshot = await getDocs(subdomainQuery);

    if (!subdomainSnapshot.empty) {
      const data = subdomainSnapshot.docs[0].data();
      console.log('✅ Brand found by subdomain:', data.name);
      return {
        id: subdomainSnapshot.docs[0].id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        subscription: {
          ...data.subscription,
          currentPeriodEnd:
            (data.subscription?.currentPeriodEnd as Timestamp)?.toDate() || new Date(),
        },
      } as Brand;
    }

    // TODO: In future, also check custom domain
    // For MVP, we only support subdomains

    console.log('❌ No brand found for domain:', cleanDomain);
    return null;
  } catch (error) {
    console.error('❌ Error fetching brand by domain:', error);
    throw error;
  }
};

/**
 * Get brand by slug (path-based routing)
 */
export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  try {
    const cleanSlug = slug.trim().toLowerCase();

    console.log('🔍 Looking for brand with slug:', cleanSlug);

    const slugQuery = query(
      collection(db, 'brands'),
      where('slug', '==', cleanSlug),
      where('status', '==', 'active')
    );

    const slugSnapshot = await getDocs(slugQuery);

    if (!slugSnapshot.empty) {
      const data = slugSnapshot.docs[0].data();
      console.log('✅ Brand found by slug:', data.name);
      return {
        id: slugSnapshot.docs[0].id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        subscription: {
          ...data.subscription,
          currentPeriodEnd:
            (data.subscription?.currentPeriodEnd as Timestamp)?.toDate() || new Date(),
        },
      } as Brand;
    }

    // Fallback on legacy field (subdomain) if slug missing
    const subdomainQuery = query(
      collection(db, 'brands'),
      where('subdomain', '==', cleanSlug),
      where('status', '==', 'active')
    );

    const subdomainSnapshot = await getDocs(subdomainQuery);

    if (!subdomainSnapshot.empty) {
      const data = subdomainSnapshot.docs[0].data();
      console.log('✅ Brand found by subdomain fallback:', data.name);
      return {
        id: subdomainSnapshot.docs[0].id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        subscription: {
          ...data.subscription,
          currentPeriodEnd:
            (data.subscription?.currentPeriodEnd as Timestamp)?.toDate() || new Date(),
        },
      } as Brand;
    }

    console.log('❌ No brand found for slug/subdomain:', cleanSlug);
    return null;
  } catch (error) {
    console.error('❌ Error fetching brand by slug:', error);
    throw error;
  }
};

/**
 * Get brand by ID
 */
export const getBrandById = async (brandId: string): Promise<Brand | null> => {
  try {
    const docRef = doc(db, 'brands', brandId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('❌ Brand not found:', brandId);
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      subscription: {
        ...data.subscription,
        currentPeriodEnd:
          (data.subscription?.currentPeriodEnd as Timestamp)?.toDate() || new Date(),
      },
    } as Brand;
  } catch (error) {
    console.error('❌ Error fetching brand by ID:', error);
    throw error;
  }
};

/**
 * Update brand branding (colors, logo)
 */
export const updateBrandBranding = async (
  brandId: string,
  branding: Partial<BrandBranding>
): Promise<void> => {
  try {
    console.log('🎨 Updating branding for brand:', brandId);

    const docRef = doc(db, 'brands', brandId);

    // Prepare update object
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Update only provided branding fields
    if (branding.primaryColor !== undefined) {
      updateData['branding.primaryColor'] = branding.primaryColor;
    }
    if (branding.secondaryColor !== undefined) {
      updateData['branding.secondaryColor'] = branding.secondaryColor;
    }
    if (branding.backgroundColor !== undefined) {
      updateData['branding.backgroundColor'] = branding.backgroundColor;
    }
    if (branding.logo !== undefined) {
      updateData['branding.logo'] = branding.logo;
    }
    if (branding.logoPath !== undefined) {
      updateData['branding.logoPath'] = branding.logoPath;
    }

    await updateDoc(docRef, updateData);

    console.log('✅ Branding updated successfully');
  } catch (error) {
    console.error('❌ Error updating branding:', error);
    throw error;
  }
};

/**
 * Get brand ID from authenticated superuser
 */
export const getBrandIdFromUser = async (userId: string): Promise<string | null> => {
  try {
    const superuserRef = doc(db, 'superusers', userId);
    const superuserSnap = await getDoc(superuserRef);

    if (!superuserSnap.exists()) {
      console.log('❌ Superuser not found:', userId);
      return null;
    }

    return superuserSnap.data().brandId;
  } catch (error) {
    console.error('❌ Error getting brand from user:', error);
    throw error;
  }
};

/**
 * Check if slug is available
 */
export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  try {
    const q = query(collection(db, 'brands'), where('slug', '==', slug));

    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('❌ Error checking slug availability:', error);
    throw error;
  }
};

/**
 * Generate slug from brand name
 */
export const generateSlug = (brandName: string): string => {
  return brandName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
