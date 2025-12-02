/**
 * Cross-browser unique ID generator
 * Fallback for browsers that don't support crypto.randomUUID()
 */

/**
 * Generates a random string of specified length
 * @param length - Length of the random string (default: 8)
 * @returns Random alphanumeric string
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Use crypto.getRandomValues if available (more secure)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    // Fallback to Math.random() (less secure, but works everywhere)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
};

/**
 * Cross-browser UUID generator
 * Uses crypto.randomUUID() if available, otherwise generates a compatible UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
  // Try native crypto.randomUUID() first (best performance + security)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Generate UUID v4 manually
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generates a short unique ID (8 characters)
 * Perfect for non-security-critical use cases like photo IDs
 * @returns Short unique ID
 */
export const generateShortId = (): string => {
  return generateRandomString(8);
};

/**
 * Generates a unique photo ID with timestamp prefix
 * Format: photo-{timestamp}-{counter}-{randomId}
 * @param counter - Optional counter for uniqueness
 * @returns Unique photo ID
 */
export const generatePhotoId = (counter: number = 0): string => {
  return `photo-${Date.now()}-${counter}-${generateShortId()}`;
};

/**
 * Generates a unique album ID with timestamp
 * Format: album-{timestamp}-{randomId}
 * @returns Unique album ID
 */
export const generateAlbumId = (): string => {
  return `album-${Date.now()}-${generateShortId()}`;
};
