/**
 * 🗂️ Centralized Storage Paths
 *
 * Definisce tutti i path di Firebase Storage in modo type-safe.
 * Previene errori di typo e mantiene consistenza.
 *
 * @example
 * import { storagePaths } from '@/lib/storagePaths';
 * const path = storagePaths.brandUpload('photo.jpg');
 */

export const storagePaths = {
  /**
   * Upload generico per brands (senza brandId specifico)
   * Path: brands/uploads/{filename}
   */
  brandUpload: (filename: string) => `brands/uploads/${filename}`,

  /**
   * Upload specifico per un brand
   * Path: brands/{brandId}/{filename}
   */
  brandSpecific: (brandId: string, filename: string) => `brands/${brandId}/${filename}`,

  /**
   * Album photos
   * Path: brands/{brandId}/albums/{albumId}/{filename}
   */
  albumPhoto: (brandId: string, albumId: string, filename: string) =>
    `brands/${brandId}/albums/${albumId}/${filename}`,

  /**
   * Brand logo
   * Path: brands/{brandId}/logo/{filename}
   */
  brandLogo: (brandId: string, filename: string) => `brands/${brandId}/logo/${filename}`,

  /**
   * Landing page assets
   * Path: platform/landing/{filename}
   */
  landingAsset: (filename: string) => `platform/landing/${filename}`,

  /**
   * Legacy uploads (da migrare)
   * Path: uploads/{filename}
   */
  legacyUpload: (filename: string) => `uploads/${filename}`,

  /**
   * Config files
   * Path: config/{filename}
   */
  config: (filename: string) => `config/${filename}`,

  /**
   * Backup files
   * Path: backups/{filename}
   */
  backup: (filename: string) => `backups/${filename}`,

  /**
   * Backups folder (for listing)
   * Path: backups/
   */
  backupsFolder: () => 'backups/',
} as const;

/**
 * Type helper per estrarre tutti i possibili path
 */
export type StoragePath = ReturnType<(typeof storagePaths)[keyof typeof storagePaths]>;

/**
 * Valida se un path corrisponde a uno dei pattern definiti
 */
export function isValidStoragePath(path: string): boolean {
  const patterns = [
    /^brands\/uploads\/.+$/,
    /^brands\/[^/]+\/.+$/,
    /^brands\/[^/]+\/albums\/[^/]+\/.+$/,
    /^brands\/[^/]+\/logo\/.+$/,
    /^platform\/landing\/.+$/,
    /^uploads\/.+$/,
    /^config\/.+$/,
  ];

  return patterns.some((pattern) => pattern.test(path));
}

/**
 * Estrae il brandId da un path (se presente)
 */
export function extractBrandIdFromPath(path: string): string | null {
  const match = path.match(/^brands\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * Genera un filename univoco con timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const extension = originalFilename.split('.').pop();
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');

  return `${timestamp}-${randomStr}-${nameWithoutExt}.${extension}`;
}
