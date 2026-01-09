/**
 * 🛡️ Tenant Middleware Guard
 *
 * Inspired by SafePath Framework - valida il tenant a livello di routing
 * prima che il componente venga renderizzato, prevenendo accessi non autorizzati.
 *
 * @example
 * <TenantGuard requiresBrand>
 *   <AlbumList />
 * </TenantGuard>
 */

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBrand } from '../../contexts/BrandContext';
import { logger } from '../../utils/logger';
import { routeParams, routes } from '../lib/routes';

interface TenantGuardProps {
  children: React.ReactNode;
  /**
   * Se true, richiede che un brand sia presente.
   * Se false, permette accesso anche senza brand.
   */
  requiresBrand?: boolean;
  /**
   * Redirect personalizzato se la validazione fallisce
   */
  fallbackRoute?: string;
}

/**
 * Middleware-style guard che valida il tenant prima del rendering
 */
export const TenantGuard: React.FC<TenantGuardProps> = ({
  children,
  requiresBrand = false,
  fallbackRoute = routes.home(),
}) => {
  const { brand, loading, error } = useBrand();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip validation durante il loading
    if (loading) {return;}

    // Se c'è un errore nel caricamento del brand
    if (error) {
      logger.error('TenantGuard: Errore caricamento brand', error);
      navigate(fallbackRoute, { replace: true });
      return;
    }

    // Se il brand è richiesto ma non presente
    if (requiresBrand && !brand) {
      logger.warn('TenantGuard: Brand richiesto ma non trovato', {
        path: location.pathname,
      });
      navigate(fallbackRoute, { replace: true });
      return;
    }

    // Validazione slug nel path vs brand attuale
    if (brand) {
      const pathSlug = routeParams.extractBrandSlug(location.pathname);

      if (pathSlug && pathSlug !== brand.slug && pathSlug !== 'demo' && pathSlug !== 'album') {
        logger.warn('TenantGuard: Slug mismatch', {
          pathSlug,
          brandSlug: brand.slug,
          path: location.pathname,
        });
        // Redirect alla gallery corretta del brand
        navigate(routes.brandGallery(brand.slug), { replace: true });
      }
    }
  }, [brand, loading, error, requiresBrand, location.pathname, navigate, fallbackRoute]);

  // Mostra loading durante la validazione
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div
            className="spinner spinner-lg mb-4 mx-auto"
            style={{ borderTopColor: 'var(--brand-primary, #3b82f6)' }}
          />
          <p className="text-slate-400">Validazione tenant...</p>
        </div>
      </div>
    );
  }

  // Non renderizzare se c'è un errore (il redirect è già stato fatto)
  if (error) {
    return null;
  }

  // Non renderizzare se brand richiesto ma non presente (redirect in corso)
  if (requiresBrand && !brand) {
    return null;
  }

  // Validazione passata, renderizza i children
  return <>{children}</>;
};

/**
 * Hook per verificare se la route corrente richiede un brand
 */
export function useRequiresBrand(): boolean {
  const location = useLocation();

  // Routes che NON richiedono brand
  const publicRoutes = [
    routes.home(),
    routes.login(),
    routes.demo(),
    routes.dashboard(),
    routes.superadmin(),
  ];

  // Routes demo (album senza brand)
  const isDemoRoute = location.pathname.startsWith('/album/');

  return !publicRoutes.includes(location.pathname) && !isDemoRoute;
}

/**
 * HOC per wrappare componenti con TenantGuard
 */
export function withTenantGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<TenantGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <TenantGuard {...options}>
        <Component {...props} />
      </TenantGuard>
    );
  };
}
