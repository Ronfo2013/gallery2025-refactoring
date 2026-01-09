/**
 * Brand Creation Service
 *
 * Handles brand creation via Cloud Function (recommended)
 * instead of direct client-side operations.
 *
 * Benefits:
 * - Atomic operations (no orphan users)
 * - Server-side validation
 * - Better security
 * - Admin SDK permissions
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import { logger } from '@/utils/logger';

export interface CreateBrandData {
  name: string;
  subdomain: string;
  email: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface CreateBrandResult {
  success: boolean;
  brandId: string;
  userId: string;
  password?: string; // Only returned for new users
  isNewUser: boolean;
  message: string;
}

/**
 * Create a new brand via Cloud Function
 *
 * This is the recommended way to create brands as it ensures
 * atomic operations and prevents orphan users.
 */
export const createBrandViaCloudFunction = async (
  data: CreateBrandData
): Promise<CreateBrandResult> => {
  try {
    const createBrand = httpsCallable<CreateBrandData, CreateBrandResult>(functions, 'createBrand');

    const result = await createBrand(data);
    return result.data;
  } catch (error: any) {
    logger.error('❌ Error calling createBrand Cloud Function:', error);

    // Extract user-friendly error message
    let message = 'Errore sconosciuto durante la creazione del brand';

    if (error.code === 'unauthenticated') {
      message = 'Devi essere autenticato per creare un brand';
    } else if (error.code === 'permission-denied') {
      message = 'Non hai i permessi per creare brand';
    } else if (error.message) {
      message = error.message;
    }

    throw new Error(message);
  }
};

/**
 * Validate brand data before sending to Cloud Function
 */
export const validateBrandData = (data: CreateBrandData): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Il nome del brand è obbligatorio');
  }

  if (!data.subdomain || data.subdomain.trim().length === 0) {
    errors.push('Il subdomain è obbligatorio');
  } else if (!/^[a-z0-9-]+$/.test(data.subdomain)) {
    errors.push('Il subdomain può contenere solo lettere minuscole, numeri e trattini');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push("L'email è obbligatoria");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("L'email non è valida");
  }

  return errors;
};


