import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Reusable Card component with clean 1px borders and refined spacing
 */
export const Card = ({
  children,
  title,
  subtitle,
  action,
  footer,
  className = '',
  bodyClassName = '',
  interactive = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        interactive ? 'finance-card-interactive cursor-pointer' : 'finance-card',
        'overflow-hidden',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className={cn('p-5', bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-5 py-2.5 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
