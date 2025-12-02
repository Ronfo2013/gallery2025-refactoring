import React from 'react';
import clsx from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Spinner component - loading indicator
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <div className={clsx('spinner', `spinner-${size}`, className)} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
}

/**
 * LoadingOverlay component - full-screen loading state
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};
