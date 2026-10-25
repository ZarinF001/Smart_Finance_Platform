import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Reusable Card component for dashboard and view panels
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
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className={cn('p-6', bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
