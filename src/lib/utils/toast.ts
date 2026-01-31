import toast from 'react-hot-toast';

/**
 * Centralized toast notification utility
 *
 * Provides consistent styling and behavior across the application.
 * Replaces all alert() calls for better UX.
 */

export const showToast = {
  /**
   * Success notification (green)
   */
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontFamily: 'var(--font-outfit)',
      },
    });
  },

  /**
   * Error notification (red)
   */
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontFamily: 'var(--font-outfit)',
      },
    });
  },

  /**
   * Warning notification (yellow/orange)
   */
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontFamily: 'var(--font-outfit)',
      },
    });
  },

  /**
   * Info notification (blue)
   */
  info: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontFamily: 'var(--font-outfit)',
      },
    });
  },

  /**
   * Loading notification (returns toast ID for dismissal)
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#fff',
        fontFamily: 'var(--font-outfit)',
      },
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};
