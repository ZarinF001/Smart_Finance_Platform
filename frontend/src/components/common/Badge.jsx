import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Reusable Badge component for financial & account statuses
 */
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    info: 'bg-blue-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    error: 'bg-rose-600',
  };

  const sizes = {
    sm: 'text-[11px] px-1.5 py-0.5 rounded font-medium gap-1',
    md: 'text-xs px-2 py-0.5 rounded-md font-medium gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
