import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Button component - professional, accessible button
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
  return (
    <button
      className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className={clsx('spinner', size === 'sm' ? 'spinner-sm' : 'spinner-md')} />}
      {!loading && icon && icon}
      {children}
    </button>
  );
};
