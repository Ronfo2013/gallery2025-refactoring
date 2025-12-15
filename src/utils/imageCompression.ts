/**
 * Client-Side Image Compression
 *
 * Compresses images before upload to reduce bandwidth and storage costs.
 *
 * Installation:
 * npm install browser-image-compression
 *
 * Features:
 * - WebP conversion
 * - Size reduction (60-80%)
 * - Maintains aspect ratio
 * - Progress callback support
 */

import imageCompression from 'browser-image-compression';
import { logger } from './logger';

export interface CompressionOptions {
  /**
   * Max file size in MB (default: 1MB)
   */
  maxSizeMB?: number;

  /**
   * Max width or height in pixels (default: 1920px)
   */
  maxWidthOrHeight?: number;

  /**
   * Use Web Worker for compression (default: true)
   * Better performance, doesn't block UI
   */
  useWebWorker?: boolean;

  /**
   * Target file type (default: 'image/webp')
   * Options: 'image/jpeg', 'image/png', 'image/webp'
   */
  fileType?: string;

  /**
   * Initial quality (0-1, default: 0.8)
   */
  initialQuality?: number;

  /**
   * Preserve Exif data (default: false)
   */
  preserveExif?: boolean;

  /**
   * Progress callback
   */
  onProgress?: (progress: number) => void;
}

/**
 * Default compression options
 */
const DEFAULT_OPTIONS: Required<Omit<CompressionOptions, 'onProgress'>> = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.8,
  preserveExif: false,
};

/**
 * Compress a single image file
 *
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed file
 *
 * @example
 * const compressed = await compressImage(originalFile, {
 *   maxSizeMB: 0.5,
 *   maxWidthOrHeight: 1024,
 *   onProgress: (progress) => console.log(`${progress}%`)
 * });
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const startTime = performance.now();
  const originalSize = file.size;

  logger.debug('Compressing image', {
    filename: file.name,
    originalSize: formatFileSize(originalSize),
    options,
  });

  try {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const compressedFile = await imageCompression(file, mergedOptions);

    const compressionTime = performance.now() - startTime;
    const compressedSize = compressedFile.size;
    const reductionPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    logger.info('Image compressed successfully', {
      filename: file.name,
      originalSize: formatFileSize(originalSize),
      compressedSize: formatFileSize(compressedSize),
      reduction: `${reductionPercent}%`,
      time: `${compressionTime.toFixed(0)}ms`,
    });

    return compressedFile;
  } catch (error) {
    logger.error('Image compression failed', error, {
      filename: file.name,
      originalSize: formatFileSize(originalSize),
    });
    throw error;
  }
}

/**
 * Compress multiple images in batch
 *
 * @param files - Array of image files
 * @param options - Compression options
 * @param onProgress - Progress callback (0-100)
 * @returns Array of compressed files
 *
 * @example
 * const compressed = await compressBatch(files, {
 *   maxSizeMB: 1
 * }, (progress) => setUploadProgress(progress));
 */
export async function compressBatch(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<File[]> {
  logger.debug('Starting batch compression', {
    fileCount: files.length,
    totalSize: formatFileSize(files.reduce((sum, f) => sum + f.size, 0)),
  });

  const compressedFiles: File[] = [];
  let completed = 0;

  for (const file of files) {
    const compressed = await compressImage(file, {
      ...options,
      onProgress: (fileProgress) => {
        // Calculate overall progress
        const overallProgress = Math.floor(
          ((completed + fileProgress / 100) / files.length) * 100
        );
        onProgress?.(overallProgress);
      },
    });

    compressedFiles.push(compressed);
    completed++;
    onProgress?.(Math.floor((completed / files.length) * 100));
  }

  logger.info('Batch compression completed', {
    fileCount: files.length,
    originalSize: formatFileSize(files.reduce((sum, f) => sum + f.size, 0)),
    compressedSize: formatFileSize(compressedFiles.reduce((sum, f) => sum + f.size, 0)),
  });

  return compressedFiles;
}

/**
 * Check if a file needs compression
 *
 * @param file - File to check
 * @param maxSizeMB - Maximum size in MB (default: 1MB)
 * @returns true if file needs compression
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}

/**
 * Validate if file is a valid image
 *
 * @param file - File to validate
 * @returns true if valid image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Format file size for display
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Preset compression options for different use cases
 */
export const CompressionPresets = {
  /**
   * High quality for portfolios
   * Max 2MB, 2560px, WebP, quality 0.9
   */
  highQuality: {
    maxSizeMB: 2,
    maxWidthOrHeight: 2560,
    fileType: 'image/webp',
    initialQuality: 0.9,
  },

  /**
   * Balanced for general use
   * Max 1MB, 1920px, WebP, quality 0.8
   */
  balanced: {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    initialQuality: 0.8,
  },

  /**
   * Aggressive for thumbnails
   * Max 200KB, 800px, WebP, quality 0.7
   */
  thumbnail: {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 800,
    fileType: 'image/webp',
    initialQuality: 0.7,
  },

  /**
   * Ultra low for previews
   * Max 50KB, 400px, WebP, quality 0.6
   */
  preview: {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 400,
    fileType: 'image/webp',
    initialQuality: 0.6,
  },
} as const;
