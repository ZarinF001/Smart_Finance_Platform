import { toast } from 'sonner';

/**
 * Reusable notification wrapper using Sonner
 */
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 3500,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 4500,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast.warning(message, {
      duration: 4000,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast.info(message, {
      duration: 3500,
      ...options,
    });
  },

  promise: (promise, options = {}) => {
    return toast.promise(promise, options);
  },

  dismiss: (id) => {
    toast.dismiss(id);
  },
};

export default notify;
