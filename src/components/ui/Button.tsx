import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'neon-indigo' | 'neon-rose';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Modern Button component with Neon and Glass variants
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'neon-indigo':
        return 'btn-neon-indigo';
      case 'neon-rose':
        return 'btn-neon-rose';
      case 'primary':
        return 'btn-primary bg-accent-indigo hover:bg-accent-violet text-white shadow-lg shadow-accent-indigo/20';
      case 'secondary':
        return 'btn-secondary bg-white/10 text-white hover:bg-white/20 border border-white/10';
      case 'outline':
        return 'btn-outline border-2 border-white/20 text-white hover:bg-white/5';
      case 'ghost':
        return 'btn-ghost text-gray-400 hover:text-white hover:bg-white/5';
      case 'danger':
        return 'btn-danger bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm text-xs px-4 py-2 rounded-lg';
      case 'md':
        return 'btn-md text-sm px-6 py-3 rounded-xl';
      case 'lg':
        return 'btn-lg text-base px-8 py-4 rounded-xl font-bold';
      default:
        return 'btn-md';
    }
  };

  return (
    <button
      className={clsx(
        'btn inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-95',
        getVariantClass(),
        getSizeClass(),
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Caricamento...</span>
        </div>
      ) : (
        <>
          {icon && <span className="text-current">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
