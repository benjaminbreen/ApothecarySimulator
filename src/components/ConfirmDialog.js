import React from 'react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
  icon = null,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-300',
      iconBg: 'bg-warning-100',
      iconText: 'text-warning-600',
      confirmBg: 'bg-warning-600 hover:bg-warning-700',
      confirmText: 'text-white',
    },
    danger: {
      bg: 'bg-danger-50',
      border: 'border-danger-300',
      iconBg: 'bg-danger-100',
      iconText: 'text-danger-600',
      confirmBg: 'bg-danger-600 hover:bg-danger-700',
      confirmText: 'text-white',
    },
    info: {
      bg: 'bg-potion-50',
      border: 'border-potion-300',
      iconBg: 'bg-potion-100',
      iconText: 'text-potion-600',
      confirmBg: 'bg-potion-600 hover:bg-potion-700',
      confirmText: 'text-white',
    },
  };

  const styles = typeStyles[type];

  const defaultIcons = {
    warning: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    danger: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative glass rounded-2xl shadow-elevation-4 max-w-md w-full overflow-hidden border-2 ${styles.border} animate-fadeIn`}
      >
        <div className={`p-6 ${styles.bg}`}>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.iconText}`}>
              {icon || defaultIcons[type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-bold text-ink-900 mb-2">
                {title}
              </h3>
              <p className="text-sm font-serif text-ink-700 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white px-6 py-4 flex items-center justify-end gap-3 border-t border-ink-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-sans font-semibold text-ink-700 bg-ink-100 hover:bg-ink-200 rounded-lg transition-all duration-base focus:outline-none focus:ring-2 focus:ring-ink-400 focus:ring-offset-2"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-sans font-semibold ${styles.confirmBg} ${styles.confirmText} rounded-lg transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-elevation-1 hover:shadow-elevation-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
