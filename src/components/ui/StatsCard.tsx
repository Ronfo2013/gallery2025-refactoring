import React from 'react';
import clsx from 'clsx';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
    label?: string;
  };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

/**
 * StatsCard component - professional statistics card for dashboards
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  trend,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  className,
}) => {
  return (
    <div className={clsx('card hover-lift', className)}>
      <div className="p-6">
        {/* Icon */}
        <div
          className={clsx(
            'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4',
            iconBgColor
          )}
        >
          <div className={clsx('w-6 h-6', iconColor)}>{icon}</div>
        </div>

        {/* Value */}
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>

        {/* Label */}
        <div className="text-sm text-gray-600 mb-4">{label}</div>

        {/* Trend (optional) */}
        {trend && (
          <div className="flex items-center text-sm">
            <svg
              className={clsx('w-4 h-4 mr-1', trend.positive ? 'text-green-600' : 'text-red-600')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  trend.positive
                    ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                }
              />
            </svg>
            <span
              className={clsx('font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}
            >
              {trend.value}
            </span>
            {trend.label && <span className="text-gray-500 ml-2">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
