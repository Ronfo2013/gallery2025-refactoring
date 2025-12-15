/**
 * Toast Notification System
 *
 * Wrapper centralizzato per react-hot-toast con varianti predefinite
 * e configurazione consistente.
 *
 * Usage:
 *   import { toastSuccess, toastError, toastPromise } from '@/utils/toast';
 *
 *   toastSuccess.created('Album');
 *   toastError.network();
 *   await toastPromise.wrap(uploadPhoto(file), { ... });
 */

import toast, { Toaster, Toast } from 'react-hot-toast';

/**
 * Success toast variants
 */
export const toastSuccess = {
  /**
   * Generic success message
   */
  default: (message: string) => toast.success(message),

  /**
   * Entity created successfully
   */
  created: (entityName: string) =>
    toast.success(`${entityName} creato con successo`),

  /**
   * Entity updated successfully
   */
  updated: (entityName: string) =>
    toast.success(`${entityName} aggiornato con successo`),

  /**
   * Entity deleted successfully
   */
  deleted: (entityName: string) =>
    toast.success(`${entityName} eliminato con successo`),

  /**
   * Photos uploaded
   */
  uploaded: (count: number) =>
    toast.success(`${count} ${count === 1 ? 'foto caricata' : 'foto caricate'}`),

  /**
   * Content copied to clipboard
   */
  copied: () => toast.success('Copiato negli appunti'),

  /**
   * File downloaded
   */
  downloaded: (filename?: string) =>
    toast.success(filename ? `${filename} scaricato` : 'Download completato'),

  /**
   * Changes saved
   */
  saved: () => toast.success('Modifiche salvate con successo'),
};

/**
 * Error toast variants
 */
export const toastError = {
  /**
   * Generic error message
   */
  default: (message: string) => toast.error(message),

  /**
   * Network/connection error
   */
  network: () =>
    toast.error('Errore di connessione. Verifica la tua rete.', {
      duration: 6000,
    }),

  /**
   * Unauthorized access
   */
  unauthorized: () =>
    toast.error('Non sei autorizzato ad eseguire questa operazione', {
      duration: 6000,
    }),

  /**
   * Resource not found
   */
  notFound: (entityName: string) =>
    toast.error(`${entityName} non trovato`, {
      duration: 5000,
    }),

  /**
   * Validation error
   */
  validation: (field: string, reason?: string) =>
    toast.error(reason ? `${field}: ${reason}` : `Il campo ${field} non è valido`, {
      duration: 5000,
    }),

  /**
   * Upload failed
   */
  uploadFailed: (filename?: string) =>
    toast.error(filename ? `Errore caricamento ${filename}` : 'Caricamento fallito', {
      duration: 6000,
    }),

  /**
   * Operation failed
   */
  operationFailed: (operation: string) =>
    toast.error(`Impossibile completare: ${operation}`, {
      duration: 6000,
    }),

  /**
   * Quota exceeded
   */
  quotaExceeded: () =>
    toast.error('Spazio di archiviazione esaurito. Aggiorna il piano.', {
      duration: 8000,
    }),

  /**
   * Session expired
   */
  sessionExpired: () =>
    toast.error('Sessione scaduta. Effettua nuovamente il login.', {
      duration: 8000,
    }),
};

/**
 * Info/neutral toast variants
 */
export const toastInfo = {
  /**
   * Generic info message
   */
  default: (message: string) => toast(message),

  /**
   * Processing/loading toast
   */
  processing: (message: string, duration: number = 2000) =>
    toast.loading(message, { duration }),

  /**
   * Warning message
   */
  warning: (message: string) =>
    toast(message, {
      icon: '⚠️',
      duration: 5000,
    }),

  /**
   * Coming soon feature
   */
  comingSoon: () =>
    toast('Funzionalità in arrivo!', {
      icon: '🚀',
      duration: 3000,
    }),
};

/**
 * Promise-based toast
 *
 * Automatically shows loading, success, and error toasts based on promise state
 *
 * @example
 * await toastPromise.wrap(
 *   uploadPhoto(file),
 *   {
 *     loading: 'Caricamento foto...',
 *     success: 'Foto caricata con successo',
 *     error: (err) => `Errore: ${err.message}`
 *   }
 * );
 */
export const toastPromise = {
  wrap: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => toast.promise(promise, messages),
};

/**
 * Custom toast with custom icon and styling
 */
export function toastCustom(
  message: string,
  options?: {
    icon?: string;
    duration?: number;
    style?: React.CSSProperties;
  }
) {
  return toast(message, options);
}

/**
 * Dismiss a specific toast or all toasts
 */
export function dismissToast(toastId?: string) {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
}

/**
 * AppToaster Component
 *
 * Add this to your App.tsx to enable toasts globally
 *
 * @example
 * import { AppToaster } from '@/utils/toast';
 *
 * function App() {
 *   return (
 *     <>
 *       <AppToaster />
 *       {/ * Rest of app * /}
 *     </>
 *   );
 * }
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options
        className: '',
        duration: 4000,
        style: {
          background: 'var(--color-surface, #ffffff)',
          color: 'var(--color-text, #1f2937)',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },

        // Success
        success: {
          duration: 4000,
          iconTheme: {
            primary: 'var(--color-success, #10b981)',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid var(--color-success, #10b981)',
          },
        },

        // Error
        error: {
          duration: 6000,
          iconTheme: {
            primary: 'var(--color-error, #ef4444)',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid var(--color-error, #ef4444)',
          },
        },

        // Loading
        loading: {
          duration: Infinity,
          iconTheme: {
            primary: 'var(--color-primary, #3b82f6)',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}

export default {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  promise: toastPromise,
  custom: toastCustom,
  dismiss: dismissToast,
  AppToaster,
};
