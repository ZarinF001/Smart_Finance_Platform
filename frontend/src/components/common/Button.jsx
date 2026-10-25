import React from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component with restrained fintech styling
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-subtle focus:ring-brand-500 border border-brand-600',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus:ring-slate-400',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-brand-500 shadow-subtle',
    emerald:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-subtle focus:ring-emerald-500 border border-emerald-600',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-subtle focus:ring-rose-500 border border-rose-600',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent focus:ring-slate-300',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-xs px-3.5 py-2 rounded-md gap-2 font-medium',
    lg: 'text-sm px-4 py-2.5 rounded-lg gap-2 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : IconLeft ? (
        <IconLeft className="w-3.5 h-3.5 flex-shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && IconRight ? (
        <IconRight className="w-3.5 h-3.5 flex-shrink-0" />
      ) : null}
    </button>
  );
};

export default Button;
