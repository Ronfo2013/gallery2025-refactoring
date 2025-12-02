import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

/**
 * Badge component - status indicator
 */
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className }) => {
  return <span className={clsx('badge', `badge-${variant}`, className)}>{children}</span>;
};
