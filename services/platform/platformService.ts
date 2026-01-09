/**
 * Platform Service
 *
 * Gestisce le impostazioni della piattaforma SaaS:
 * - Platform settings (SEO, company info, Stripe, pricing)
 * - System health monitoring
 * - Activity logs
 * - SuperAdmin permissions
 */

import { logger } from '@/utils/logger';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { ActivityLog, PlatformSettings, SuperAdmin, SystemHealth } from '../../types';

// Firestore references
const platformSettingsRef = doc(db, 'platform_settings', 'config');
const superAdminsCollection = collection(db, 'superadmins');
const activityLogsCollection = collection(db, 'activity_logs');

/**
 * Generate initial platform settings
 */
const generateInitialPlatformSettings = (): PlatformSettings => {
  const now = new Date();
  return {
    systemName: 'ClubGallery SaaS',
    systemVersion: '1.0.0',
    systemStatus: 'operational',

    seo: {
      metaTitle: 'ClubGallery - Gestione Gallerie Fotografiche Professionali',
      metaDescription:
        'La piattaforma SaaS leader per la gestione di gallerie fotografiche per club, locali ed eventi. Branding personalizzato e prestazioni ultra-rapide.',
      metaKeywords: 'galleria fotografica, discoteca, locali, eventi, saas, fotografia',
      ogImage: undefined,
      structuredData: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ClubGallery',
        applicationCategory: 'MultimediaApplication',
        offers: {
          '@type': 'Offer',
          price: '49',
          priceCurrency: 'EUR',
        },
      }),
      aiSearchOptimization: {
        enabled: true,
        summaryText:
          'ClubGallery è una piattaforma SaaS specializzata nella gestione di gallerie fotografiche per il mondo della notte e degli eventi. Offre branding personalizzato, ottimizzazione automatica WebP e una dashboard intuitiva.',
        keyFeatures: [
          'Gallerie fotografiche per locali e discoteche',
          'Branding personalizzato (logo, colori del club)',
          "Sottodominio dedicato all'evento",
          'Ottimizzazione professionale delle immagini',
          'Dashboard superadmin per agenzie',
          'Integrazione Stripe per abbonamenti',
        ],
        targetAudience: 'Locali, discoteche, organizzatori di eventi, fotografi di eventi',
      },
    },

    company: {
      name: 'ClubGallery S.r.l.',
      vatNumber: '',
      taxCode: '',
      address: '',
      city: 'Milano',
      country: 'IT',
      email: 'info@clubgallery.com',
      phone: '',
      pec: '',
    },

    stripe: {
      priceId: 'price_XXXXX',
      productId: 'prod_XXXXX',
      webhookConfigured: false,
      testMode: true,
    },

    pricing: {
      monthlyPrice: 49,
      currency: 'EUR',
      trialDays: 14,
      features: [
        'Gallerie Illimitate',
        'Branding del Locale',
        'Sottodominio Dedicato',
        'Storage Foto Ottimizzato',
        'Statistiche di Visualizzazione',
        'Assistenza Prioritaria 24/7',
      ],
    },

    alerts: {
      criticalErrors: 0,
      emailNotifications: true,
      notificationEmail: 'admin@clubgallery.com',
    },

    analytics: {
      totalBrands: 0,
      activeBrands: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
    },

    features: {
      allowSignup: true,
      allowCustomDomains: true,
      allowGoogleOAuth: true,
      maintenanceMode: false,
    },

    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Get platform settings
 */
export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  try {
    const docSnap = await getDoc(platformSettingsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Convert Firestore Timestamps to Date
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        alerts: {
          ...data.alerts,
          lastErrorTimestamp: data.alerts?.lastErrorTimestamp?.toDate?.(),
        },
      } as PlatformSettings;
    } else {
      // Create initial settings
      const initialSettings = generateInitialPlatformSettings();
      const cleanedSettings = removeUndefinedFields(initialSettings);
      await setDoc(platformSettingsRef, cleanedSettings);
      return initialSettings;
    }
  } catch (error) {
    logger.error('❌ Error getting platform settings:', error);
    // Return defaults on error
    return generateInitialPlatformSettings();
  }
};

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
const removeUndefinedFields = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }

  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = typeof obj[key] === 'object' ? removeUndefinedFields(obj[key]) : obj[key];
    }
  }
  return cleaned;
};

/**
 * Update platform settings
 */
export const updatePlatformSettings = async (updates: Partial<PlatformSettings>): Promise<void> => {
  try {
    // Remove undefined fields (Firestore doesn't allow them)
    const cleanedUpdates = removeUndefinedFields({
      ...updates,
      updatedAt: new Date(),
    });

    await updateDoc(platformSettingsRef, cleanedUpdates);

    // Log activity
    await logActivity({
      type: 'settings_updated',
      actor: 'superadmin', // TODO: Get from auth context
      description: 'Platform settings updated',
      metadata: { updates: Object.keys(updates) },
    });

    logger.info('✅ Platform settings updated');
  } catch (error) {
    logger.error('❌ Error updating platform settings:', error);
    throw error;
  }
};

/**
 * Check if user is SuperAdmin
 */
export const isSuperAdmin = async (uid: string): Promise<boolean> => {
  try {
    const superAdminDoc = await getDoc(doc(superAdminsCollection, uid));
    return superAdminDoc.exists();
  } catch (error) {
    logger.error('❌ Error checking superadmin status:', error);
    return false;
  }
};

/**
 * Get SuperAdmin data
 */
export const getSuperAdmin = async (uid: string): Promise<SuperAdmin | null> => {
  try {
    const docSnap = await getDoc(doc(superAdminsCollection, uid));

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        lastLogin: data.lastLogin?.toDate?.(),
      } as SuperAdmin;
    }

    return null;
  } catch (error) {
    logger.error('❌ Error getting superadmin:', error);
    return null;
  }
};

/**
 * Update SuperAdmin last login
 */
export const updateSuperAdminLogin = async (uid: string): Promise<void> => {
  try {
    await updateDoc(doc(superAdminsCollection, uid), {
      lastLogin: new Date(),
    });
  } catch (error) {
    logger.error('❌ Error updating superadmin login:', error);
  }
};

/**
 * Get system health (mock for now, would integrate with Cloud Monitoring)
 */
export const getSystemHealth = async (): Promise<SystemHealth> => {
  // TODO: Integrate with Cloud Monitoring API
  // For MVP, return mock data
  return {
    status: 'healthy',
    uptime: 99.9,
    responseTime: 150,
    errorRate: 0.1,
    activeUsers: 5,
    cloudRunStatus: 'running',
    firestoreStatus: 'operational',
    storageStatus: 'operational',
    functionsStatus: 'operational',
    lastCheck: new Date(),
  };
};

/**
 * Log activity
 */
export const logActivity = async (
  activity: Omit<ActivityLog, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    const logRef = doc(activityLogsCollection);
    await setDoc(logRef, {
      ...activity,
      id: logRef.id,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('❌ Error logging activity:', error);
  }
};

/**
 * Get recent activity logs
 */
export const getRecentActivityLogs = async (limitCount = 50): Promise<ActivityLog[]> => {
  try {
    const q = query(activityLogsCollection, orderBy('timestamp', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(),
      } as ActivityLog;
    });
  } catch (error) {
    logger.error('❌ Error getting activity logs:', error);
    return [];
  }
};

/**
 * Get brands statistics for analytics
 */
export const getBrandsStatistics = async (): Promise<{
  total: number;
  active: number;
  suspended: number;
  pending: number;
}> => {
  try {
    const brandsCollection = collection(db, 'brands');

    // Count all brands
    const allBrands = await getDocs(brandsCollection);
    const total = allBrands.size;

    // Count by status
    let active = 0;
    let suspended = 0;
    let pending = 0;

    allBrands.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'active') {
        active++;
      } else if (data.status === 'suspended') {
        suspended++;
      } else if (data.status === 'pending') {
        pending++;
      }
    });

    return { total, active, suspended, pending };
  } catch (error) {
    logger.error('❌ Error getting brands statistics:', error);
    return { total: 0, active: 0, suspended: 0, pending: 0 };
  }
};

/**
 * Calculate revenue statistics
 */
export const getRevenueStatistics = async (
  monthlyPrice: number
): Promise<{
  totalRevenue: number;
  monthlyRevenue: number;
}> => {
  try {
    const stats = await getBrandsStatistics();
    const monthlyRevenue = stats.active * monthlyPrice;

    // For total revenue, we'd need payment history
    // For MVP, estimate based on current active brands
    const totalRevenue = monthlyRevenue; // Simplified

    return { totalRevenue, monthlyRevenue };
  } catch (error) {
    logger.error('❌ Error calculating revenue:', error);
    return { totalRevenue: 0, monthlyRevenue: 0 };
  }
};

/**
 * Update analytics in platform settings
 */
export const updateAnalytics = async (): Promise<void> => {
  try {
    const settings = await getPlatformSettings();
    const stats = await getBrandsStatistics();
    const revenue = await getRevenueStatistics(settings.pricing.monthlyPrice);

    await updateDoc(platformSettingsRef, {
      'analytics.totalBrands': stats.total,
      'analytics.activeBrands': stats.active,
      'analytics.totalRevenue': revenue.totalRevenue,
      'analytics.monthlyRevenue': revenue.monthlyRevenue,
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.error('❌ Error updating analytics:', error);
  }
};

/**
 * Generate secure random password
 */
const generateSecurePassword = (): string => {
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

/**
 * Create brand superuser with Firebase Auth
 * If email already exists, adds brand to existing user's brandIds array
 */
export const createBrandSuperuser = async (
  email: string,
  brandId: string
): Promise<{ userId: string; password: string; isNewUser: boolean }> => {
  try {
    // Check if user already exists in Firestore
    const superusersRef = collection(db, 'superusers');
    const q = query(superusersRef, where('email', '==', email));
    const existingUsers = await getDocs(q);

    if (!existingUsers.empty) {
      // User already exists - add brand to their brandIds array
      const existingUserDoc = existingUsers.docs[0];
      const userId = existingUserDoc.id;
      const existingData = existingUserDoc.data();

      logger.info('ℹ️  User already exists, adding brand to array:', { userId, email, brandId });

      // Get existing brandIds (support both old and new format)
      let brandIds: string[] = [];
      if (existingData.brandIds && Array.isArray(existingData.brandIds)) {
        brandIds = existingData.brandIds;
      } else if (existingData.brandId) {
        // Migrate from old format
        brandIds = [existingData.brandId];
      }

      // Add new brand if not already present
      if (!brandIds.includes(brandId)) {
        brandIds.push(brandId);

        // Update document with new brandIds array
        await updateDoc(doc(db, 'superusers', userId), {
          brandIds,
          updatedAt: new Date(),
          // Keep legacy brandId for backward compatibility (set to first brand)
          brandId: brandIds[0],
        });

        logger.info('✅ Brand added to existing user:', { userId, brandIds });
      } else {
        logger.info("ℹ️  Brand already in user's brandIds");
      }

      // No password to return (user already has one)
      return {
        userId,
        password: '', // Empty string indicates existing user
        isNewUser: false,
      };
    }

    // Generate secure password for new user
    const password = generateSecurePassword();

    // Try to create Firebase Auth user
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Create superuser document in Firestore with brandIds array
      await setDoc(doc(db, 'superusers', userId), {
        email,
        brandIds: [brandId], // New format: array
        brandId, // Legacy format for backward compatibility
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info('✅ Brand superuser created:', { userId, email, brandIds: [brandId] });

      return { userId, password, isNewUser: true };
    } catch (authError: any) {
      // If email already in use, try to find user by email in Firestore again
      if (authError.code === 'auth/email-already-in-use') {
        logger.warn('⚠️  Email already in Firebase Auth, searching for existing user...');

        // Query again (might have been created in parallel)
        const retryQuery = query(superusersRef, where('email', '==', email));
        const retryUsers = await getDocs(retryQuery);

        if (!retryUsers.empty) {
          const existingUserDoc = retryUsers.docs[0];
          const userId = existingUserDoc.id;
          const existingData = existingUserDoc.data();

          logger.info('ℹ️  Found existing user on retry:', { userId, email });

          // Add brand to brandIds
          const brandIds: string[] =
            existingData.brandIds || (existingData.brandId ? [existingData.brandId] : []);
          if (!brandIds.includes(brandId)) {
            const updatedBrandIds = [...brandIds, brandId];
            await updateDoc(doc(db, 'superusers', userId), {
              brandIds: updatedBrandIds,
              updatedAt: new Date(),
              brandId: updatedBrandIds[0],
            });
          }

          return { userId, password: '', isNewUser: false };
        }

        // If still not found, user exists in Auth but not in Firestore (orphaned)
        throw new Error(
          `Email "${email}" già registrata ma non trovata in Firestore. ` +
            `Contatta l'amministratore per risolvere questo problema.`
        );
      }

      // Re-throw other auth errors
      throw authError;
    }
  } catch (error: any) {
    logger.error('❌ Error creating brand superuser:', error);
    throw new Error(`Impossibile creare superuser: ${error.message}`);
  }
};
