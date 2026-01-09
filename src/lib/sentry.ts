/**
 * 🛡️ Sentry Error Tracking Configuration
 *
 * Inspired by SafePath Framework - monitora errori in produzione
 * per identificare e risolvere problemi rapidamente.
 */

import * as Sentry from '@sentry/react';

/**
 * Inizializza Sentry solo in produzione
 */
export function initSentry() {
  const isProduction = import.meta.env.PROD;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!isProduction || !sentryDsn) {
    // Sentry disabled in development
    return;
  }

  Sentry.init({
    dsn: sentryDsn,

    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% delle transazioni

    // Environment
    environment: import.meta.env.MODE,

    // Release tracking
    release: `gallery-app@${import.meta.env.VITE_APP_VERSION || 'unknown'}`,

    // Filtra errori non rilevanti
    beforeSend(event) {
      // Ignora errori di estensioni browser
      if (event.exception?.values?.[0]?.value?.includes('Extension context invalidated')) {
        return null;
      }

      // Ignora errori di rete temporanei
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }

      return event;
    },

    // Ignora breadcrumbs non rilevanti
    beforeBreadcrumb(breadcrumb) {
      // Ignora console.log in produzione
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }
      return breadcrumb;
    },
  });

  // Sentry initialized successfully
}

/**
 * Cattura un errore manualmente
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
  // Development: error logged to console by default
}

/**
 * Cattura un messaggio/warning
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  }
  // Development: message logged to console by default
}

/**
 * Imposta contesto utente per Sentry
 */
export function setUserContext(user: { id: string; email?: string; role?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Pulisce contesto utente (logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Imposta tag custom
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Imposta contesto custom
 */
export function setContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context);
}
