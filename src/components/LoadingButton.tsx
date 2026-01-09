/**
 * LoadingButton Component
 *
 * Button con stato di caricamento integrato.
 * Mostra uno spinner e testo personalizzato durante operazioni async.
 */

import React from 'react';

interface LoadingButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /**
   * Se true, mostra loading state
   */
  isLoading: boolean;

  /**
   * Testo da mostrare durante il loading (default: "Caricamento...")
   */
  loadingText?: string;

  /**
   * Variante del bottone
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';

  /**
   * Dimensione del bottone
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Contenuto del bottone (quando non in loading)
   */
  children: React.ReactNode;

  /**
   * Classi CSS aggiuntive
   */
  className?: string;

  /**
   * Se true, il bottone è disabilitato
   */
  disabled?: boolean;
}

/**
 * LoadingButton component
 *
 * @example
 * <LoadingButton
 *   isLoading={uploading}
 *   loadingText="Caricamento..."
 *   onClick={handleUpload}
 *   variant="primary"
 * >
 *   Carica Foto
 * </LoadingButton>
 */
export function LoadingButton({
  isLoading,
  loadingText = 'Caricamento...',
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'btn inline-flex items-center justify-center gap-2 transition-all';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  const loadingClasses = isLoading ? 'opacity-75 cursor-not-allowed' : '';

  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loadingClasses} ${className}`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default LoadingButton;
