'use strict';
/**
 * Cloud Function: Create Brand
 *
 * Handles brand creation with atomic operations:
 * 1. Creates Firebase Auth user (or reuses existing)
 * 2. Creates Firestore superuser document
 * 3. Creates Firestore brand document
 * 4. Links everything together
 *
 * This prevents orphan users by using Firebase Admin SDK with full permissions.
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.createBrand = void 0;
const admin = __importStar(require('firebase-admin'));
const https_1 = require('firebase-functions/v2/https');
const v2_1 = require('firebase-functions/v2');
/**
 * Generate a secure random password
 */
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let password = '';
  // Generate 16 random characters
  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}
/**
 * Create brand with atomic operations
 */
exports.createBrand = (0, https_1.onCall)(
  {
    region: 'europe-west1',
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;
    // 1. Check if user is authenticated and is SuperAdmin
    if (!auth) {
      throw new https_1.HttpsError('unauthenticated', 'Devi essere autenticato');
    }
    const superAdminDoc = await admin.firestore().collection('superadmins').doc(auth.uid).get();
    if (!superAdminDoc.exists) {
      throw new https_1.HttpsError('permission-denied', 'Solo i SuperAdmin possono creare brand');
    }
    // 2. Validate input
    const { name, subdomain, email, phone, address, primaryColor, secondaryColor, accentColor } =
      data;
    if (!name || !subdomain || !email) {
      throw new https_1.HttpsError('invalid-argument', 'Nome, subdomain ed email sono obbligatori');
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new https_1.HttpsError('invalid-argument', 'Email non valida');
    }
    // Validate subdomain format (alphanumeric and hyphens only)
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      throw new https_1.HttpsError(
        'invalid-argument',
        'Subdomain può contenere solo lettere minuscole, numeri e trattini'
      );
    }
    v2_1.logger.info('Creating brand', { name, subdomain, email });
    try {
      // 3. Check if subdomain is already taken
      const existingBrandBySubdomain = await admin
        .firestore()
        .collection('brands')
        .where('subdomain', '==', subdomain.toLowerCase())
        .limit(1)
        .get();
      if (!existingBrandBySubdomain.empty) {
        throw new https_1.HttpsError('already-exists', `Subdomain "${subdomain}" già in uso`);
      }
      // 4. Check if user already exists (by email in superusers collection)
      let userId;
      let password;
      let isNewUser = false;
      const existingUserQuery = await admin
        .firestore()
        .collection('superusers')
        .where('email', '==', email)
        .limit(1)
        .get();
      if (!existingUserQuery.empty) {
        // User already exists - reuse
        userId = existingUserQuery.docs[0].id;
        v2_1.logger.info('Reusing existing user', { userId, email });
      } else {
        // Create new user
        password = generateSecurePassword();
        isNewUser = true;
        try {
          const userRecord = await admin.auth().createUser({
            email,
            password,
            emailVerified: false,
          });
          userId = userRecord.uid;
          v2_1.logger.info('Created new Firebase Auth user', { userId, email });
        } catch (authError) {
          // Handle case where email exists in Auth but not in Firestore (orphan)
          if (authError.code === 'auth/email-already-exists') {
            v2_1.logger.warn('Email exists in Auth but not in Firestore, attempting to recover', {
              email,
            });
            const existingUser = await admin.auth().getUserByEmail(email);
            userId = existingUser.uid;
            isNewUser = false; // Don't return password as we don't know it
            v2_1.logger.info('Recovered orphan user', { userId, email });
          } else {
            throw authError;
          }
        }
      }
      // 5. Create brand document
      const slug = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const brandRef = admin.firestore().collection('brands').doc();
      const brandId = brandRef.id;
      const brandData = {
        id: brandId,
        name: name.trim(),
        slug,
        subdomain: subdomain.toLowerCase(),
        status: 'active',
        ownerEmail: email.trim(),
        phone: (phone === null || phone === void 0 ? void 0 : phone.trim()) || '',
        address: (address === null || address === void 0 ? void 0 : address.trim()) || '',
        superuserId: userId,
        branding: {
          primaryColor: primaryColor || '#3b82f6',
          secondaryColor: secondaryColor || '#8b5cf6',
          accentColor: accentColor || '#10b981',
          backgroundColor: '#ffffff',
        },
        subscription: {
          status: 'active',
          stripeCustomerId: '',
          currentPeriodEnd: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          ),
        },
        seo: {
          metaTitle: name,
          metaDescription: `Photo gallery for ${name}`,
          metaKeywords: 'photo, gallery, photography',
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      // 6. Create or update superuser document (ATOMIC with brand creation)
      const batch = admin.firestore().batch();
      // Create brand
      batch.set(brandRef, brandData);
      // Create or update superuser
      const superuserRef = admin.firestore().collection('superusers').doc(userId);
      if (isNewUser) {
        batch.set(superuserRef, {
          email,
          brandId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Update existing superuser to point to new brand (or keep existing)
        batch.set(
          superuserRef,
          {
            email,
            brandId, // This will associate the user with the most recent brand
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
      // Commit atomic batch
      await batch.commit();
      v2_1.logger.info('Brand created successfully', { brandId, userId, isNewUser });
      // 7. Return response
      return {
        success: true,
        brandId,
        userId,
        password: isNewUser ? password : undefined,
        isNewUser,
        message: isNewUser
          ? `Brand "${name}" creato con successo! Nuovo utente creato.`
          : `Brand "${name}" creato con successo! Utente esistente riutilizzato.`,
      };
    } catch (error) {
      v2_1.logger.error('Error creating brand', { error: error.message, stack: error.stack });
      // Map Firebase errors to user-friendly messages
      if (error instanceof https_1.HttpsError) {
        throw error;
      }
      if (error.code === 'auth/email-already-in-use') {
        throw new https_1.HttpsError('already-exists', 'Email già in uso');
      }
      throw new https_1.HttpsError(
        'internal',
        `Errore durante la creazione del brand: ${error.message}`
      );
    }
  }
);
//# sourceMappingURL=createBrand.js.map
