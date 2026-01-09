/**
 * 🛡️ Runtime Validation Schemas (Zod)
 *
 * Inspired by SafePath Framework - valida i dati a runtime
 * per prevenire errori e garantire type safety end-to-end.
 *
 * @example
 * const album = albumSchema.parse(rawData); // Throws se invalido
 * const result = brandSchema.safeParse(input); // Non throws
 */

import { z } from 'zod';

// ==========================================
// 🎨 Brand Schemas
// ==========================================

export const brandSchema = z.object({
  id: z.string().min(1, 'Brand ID richiesto'),
  slug: z
    .string()
    .min(3, 'Slug deve essere almeno 3 caratteri')
    .max(50, 'Slug troppo lungo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve contenere solo lettere minuscole, numeri e trattini'),
  name: z.string().min(1, 'Nome brand richiesto'),
  logo: z.string().url('Logo deve essere un URL valido').optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Colore primario deve essere un hex valido')
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Colore secondario deve essere un hex valido')
    .optional(),
  customDomain: z.string().url('Dominio custom deve essere un URL valido').optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type Brand = z.infer<typeof brandSchema>;

// ==========================================
// 📸 Album Schemas
// ==========================================

export const albumSchema = z.object({
  id: z.string().min(1, 'Album ID richiesto'),
  brandId: z.string().min(1, 'Brand ID richiesto'),
  title: z.string().min(1, 'Titolo album richiesto').max(200, 'Titolo troppo lungo'),
  description: z.string().max(1000, 'Descrizione troppo lunga').optional(),
  coverImage: z.string().url('Cover image deve essere un URL valido').optional(),
  photoCount: z.number().int().min(0, 'Photo count deve essere >= 0').default(0),
  isPublic: z.boolean().default(true),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type Album = z.infer<typeof albumSchema>;

// ==========================================
// 🖼️ Photo Schemas
// ==========================================

export const photoSchema = z.object({
  id: z.string().min(1, 'Photo ID richiesto'),
  albumId: z.string().min(1, 'Album ID richiesto'),
  brandId: z.string().min(1, 'Brand ID richiesto'),
  originalUrl: z.string().url('Original URL deve essere valido'),
  thumbnailUrl: z.string().url('Thumbnail URL deve essere valido').optional(),
  width: z.number().int().positive('Width deve essere > 0').optional(),
  height: z.number().int().positive('Height deve essere > 0').optional(),
  size: z.number().int().positive('Size deve essere > 0').optional(),
  uploadedAt: z.date().or(z.string()),
});

export type Photo = z.infer<typeof photoSchema>;

// ==========================================
// 👤 User Schemas
// ==========================================

export const userRoleSchema = z.enum(['superadmin', 'cliente', 'viewer']);

export const userSchema = z.object({
  uid: z.string().min(1, 'User ID richiesto'),
  email: z.string().email('Email non valida'),
  displayName: z.string().optional(),
  role: userRoleSchema,
  brandIds: z.array(z.string()).default([]),
  createdAt: z.date().or(z.string()),
});

export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;

// ==========================================
// 🎯 Landing Page Schemas
// ==========================================

export const landingPageSettingsSchema = z.object({
  branding: z
    .object({
      logo: z.string().url().optional(),
      primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      secondaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
    })
    .optional(),
  hero: z
    .object({
      title: z.string().min(1).max(200),
      subtitle: z.string().max(500).optional(),
      backgroundImage: z.string().url().optional(),
      ctaText: z.string().max(50).optional(),
      ctaLink: z.string().url().optional(),
    })
    .optional(),
  features: z
    .array(
      z.object({
        icon: z.string(),
        title: z.string().min(1).max(100),
        description: z.string().max(300),
      })
    )
    .optional(),
  seo: z
    .object({
      title: z.string().max(60).optional(),
      description: z.string().max(160).optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export type LandingPageSettings = z.infer<typeof landingPageSettingsSchema>;

// ==========================================
// 🔧 Utility Functions
// ==========================================

/**
 * Valida e sanitizza i dati in modo sicuro
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: { throwOnError?: boolean }
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (!result.success && options?.throwOnError) {
    throw result.error;
  }

  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

/**
 * Formatta gli errori Zod in modo user-friendly
 */
export function formatZodError(error: z.ZodError): string[] {
  return error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
}
