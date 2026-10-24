import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Reusable Badge component for financial & system statuses
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
    info: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    info: 'bg-brand-500 animate-pulse',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full gap-1.5 font-semibold',
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
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

export default Badge;
