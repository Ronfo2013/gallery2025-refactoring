/**
 * 🛡️ Type-Safe Routing System
 *
 * Inspired by SafePath Framework - garantisce che tutti i link
 * puntino a route esistenti, eliminando errori di typo.
 *
 * @example
 * // ❌ PRIMA (unsafe)
 * <Link to={`/${brandSlug}/${albumId}`} />
 *
 * // ✅ DOPO (type-safe)
 * <Link to={routes.album(brandSlug, albumId)} />
 */

export const routes = {
  // ==========================================
  // 🏠 Public Routes (No Brand Required)
  // ==========================================
  home: () => '/',
  login: () => '/login',

  // ==========================================
  // 🎨 Demo Routes (Unbranded Gallery)
  // ==========================================
  demo: () => '/demo',
  demoAlbum: (albumId: string) => `/album/${albumId}`,

  // ==========================================
  // 👤 Authenticated Routes
  // ==========================================
  dashboard: () => '/dashboard',
  superadmin: () => '/superadmin',

  // ==========================================
  // 🏢 Brand-Specific Routes
  // ==========================================
  brandGallery: (brandSlug: string) => `/${brandSlug}`,
  album: (brandSlug: string, albumId: string) => `/${brandSlug}/${albumId}`,
  brandAdmin: (brandSlug: string) => `/${brandSlug}/admin`,
} as const;

/**
 * Type helper per estrarre tutti i possibili path
 */
export type AppRoute = ReturnType<(typeof routes)[keyof typeof routes]>;

/**
 * Utility per validare se un path è una route valida
 */
export function isValidRoute(path: string): boolean {
  const allRoutes = Object.values(routes).map((fn) => {
    try {
      // Test con parametri dummy per routes parametriche
       
      return (fn as any)('test-slug', 'test-id');
    } catch {
       
      return (fn as any)();
    }
  });

  return allRoutes.some((route) => {
    const pattern = route.replace(/[^/]+/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(path);
  });
}

/**
 * Utility per parsing route params in modo type-safe
 */
export const routeParams = {
  extractBrandSlug: (pathname: string): string | null => {
    const match = pathname.match(/^\/([^/]+)/);
    return match ? match[1] : null;
  },

  extractAlbumId: (pathname: string): string | null => {
    const match = pathname.match(/\/([^/]+)$/);
    return match ? match[1] : null;
  },

  extractBrandAndAlbum: (pathname: string): { brandSlug: string; albumId: string } | null => {
    const match = pathname.match(/^\/([^/]+)\/([^/]+)$/);
    return match ? { brandSlug: match[1], albumId: match[2] } : null;
  },
} as const;
