import clsx from 'clsx';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Modern Glass Input component
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
            {label}
            {props.required && <span className="text-accent-rose ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'glass-input w-full',
            error && 'border-rose-500/50 focus:ring-rose-500/30',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter ml-1">
            {error}
          </p>
        )}
        {helperText && !error && <p className="text-xs text-gray-500 ml-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
