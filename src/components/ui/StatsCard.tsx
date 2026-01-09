import clsx from 'clsx';
import React from 'react';

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
 * Modern Glass StatsCard component
 */
export const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, trend, className }) => {
  return (
    <div className={clsx('glass-card glass-card-hover p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-accent-indigo blur-lg opacity-20" />
          <div className="relative w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-accent-indigo shadow-2xl">
            {icon}
          </div>
        </div>
      </div>

      {trend && (
        <div className="mt-6 flex items-center gap-2">
          <div
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border',
              trend.positive
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            )}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d={
                  trend.positive
                    ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                }
              />
            </svg>
            <span>{trend.value}</span>
          </div>
          {trend.label && (
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
