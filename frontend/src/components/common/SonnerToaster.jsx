import React from 'react';
import { Toaster } from 'sonner';

/**
 * Reusable Sonner Toaster container configured with application theme
 */
export const SonnerToaster = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      toastOptions={{
        style: {
          borderRadius: '0.75rem',
          fontFamily: 'inherit',
          fontSize: '0.875rem',
        },
      }}
    />
  );
};

export default SonnerToaster;
