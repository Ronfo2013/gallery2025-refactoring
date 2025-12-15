/**
 * Centralized Error Handling
 *
 * Provides consistent error handling across the application with:
 * - Custom error types
 * - Automatic logging
 * - User-friendly toast notifications
 * - Sentry integration (future)
 */

import toast from 'react-hot-toast';
import { logger } from './logger';

/**
 * Application-specific error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error codes for consistent error handling
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Storage errors
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCodes.NETWORK_ERROR]: 'Errore di connessione. Verifica la tua rete.',
  [ErrorCodes.TIMEOUT]: 'Operazione scaduta. Riprova.',
  [ErrorCodes.UNAUTHORIZED]: 'Accesso negato. Effettua il login.',
  [ErrorCodes.FORBIDDEN]: 'Non hai i permessi per eseguire questa operazione.',
  [ErrorCodes.SESSION_EXPIRED]: 'Sessione scaduta. Effettua nuovamente il login.',
  [ErrorCodes.NOT_FOUND]: 'Risorsa non trovata.',
  [ErrorCodes.ALREADY_EXISTS]: 'Elemento già esistente.',
  [ErrorCodes.VALIDATION_ERROR]: 'Dati non validi.',
  [ErrorCodes.INVALID_INPUT]: 'Input non valido. Controlla i dati inseriti.',
  [ErrorCodes.UPLOAD_FAILED]: 'Caricamento fallito. Riprova.',
  [ErrorCodes.STORAGE_QUOTA_EXCEEDED]: 'Spazio di archiviazione esaurito.',
  [ErrorCodes.PAYMENT_FAILED]: 'Pagamento fallito. Verifica i dati di pagamento.',
  [ErrorCodes.PAYMENT_REQUIRED]: 'Aggiorna il piano per accedere a questa funzionalità.',
  [ErrorCodes.UNKNOWN_ERROR]: 'Si è verificato un errore imprevisto.',
  [ErrorCodes.SERVER_ERROR]: 'Errore del server. Riprova più tardi.',
};

/**
 * Convert unknown error to AppError
 */
function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific Firebase/network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new AppError(
        ERROR_MESSAGES[ErrorCodes.NETWORK_ERROR],
        ErrorCodes.NETWORK_ERROR,
        0
      );
    }

    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return new AppError(
        ERROR_MESSAGES[ErrorCodes.UNAUTHORIZED],
        ErrorCodes.UNAUTHORIZED,
        401
      );
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      return new AppError(
        ERROR_MESSAGES[ErrorCodes.NOT_FOUND],
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    return new AppError(error.message, ErrorCodes.UNKNOWN_ERROR);
  }

  return new AppError(
    ERROR_MESSAGES[ErrorCodes.UNKNOWN_ERROR],
    ErrorCodes.UNKNOWN_ERROR
  );
}

/**
 * Handle error with logging and optional toast notification
 */
export function handleError(
  error: unknown,
  options: {
    showToast?: boolean;
    toastMessage?: string;
    context?: string;
  } = {}
): AppError {
  const { showToast = true, toastMessage, context } = options;

  const appError = normalizeError(error);

  // Log error
  logger.error(
    context ? `[${context}] ${appError.message}` : appError.message,
    appError
  );

  // Show toast notification
  if (showToast) {
    const message = toastMessage || appError.message;
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  }

  // TODO: Send to Sentry in production
  // if (import.meta.env.PROD && window.Sentry) {
  //   window.Sentry.captureException(appError, {
  //     extra: { context, code: appError.code },
  //   });
  // }

  return appError;
}

/**
 * Wrapper for async functions with automatic error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    errorMessage?: string;
    showToast?: boolean;
    context?: string;
  } = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, {
      showToast: options.showToast ?? true,
      toastMessage: options.errorMessage,
      context: options.context,
    });
    return null;
  }
}

/**
 * Create specific error types for common scenarios
 */
export const createError = {
  notFound: (resource: string) =>
    new AppError(`${resource} non trovato`, ErrorCodes.NOT_FOUND, 404),

  unauthorized: (message?: string) =>
    new AppError(
      message || ERROR_MESSAGES[ErrorCodes.UNAUTHORIZED],
      ErrorCodes.UNAUTHORIZED,
      401
    ),

  validation: (field: string, reason?: string) =>
    new AppError(
      reason ? `${field}: ${reason}` : `Il campo ${field} non è valido`,
      ErrorCodes.VALIDATION_ERROR,
      400
    ),

  uploadFailed: (filename?: string) =>
    new AppError(
      filename
        ? `Errore caricamento ${filename}`
        : ERROR_MESSAGES[ErrorCodes.UPLOAD_FAILED],
      ErrorCodes.UPLOAD_FAILED,
      500
    ),

  network: () =>
    new AppError(ERROR_MESSAGES[ErrorCodes.NETWORK_ERROR], ErrorCodes.NETWORK_ERROR, 0),

  paymentRequired: () =>
    new AppError(
      ERROR_MESSAGES[ErrorCodes.PAYMENT_REQUIRED],
      ErrorCodes.PAYMENT_REQUIRED,
      402
    ),
};
