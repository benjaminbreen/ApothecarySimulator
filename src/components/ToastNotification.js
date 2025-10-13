import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);

  // Convenience methods for game-specific notifications
  const showWealthChange = useCallback((amount, duration = 2500) => {
    const type = amount > 0 ? 'wealth-gain' : 'wealth-loss';
    const message = `${amount > 0 ? '+' : ''}${amount} reales`;
    addToast(message, type, duration);
  }, [addToast]);

  const showItemChange = useCallback((itemName, quantity, action = 'gained', duration = 2500) => {
    const type = action === 'gained' ? 'item-gain' : 'item-loss';
    const message = `${action === 'gained' ? '+' : '-'}${quantity} ${itemName}`;
    addToast(message, type, duration);
  }, [addToast]);

  const showHealthChange = useCallback((amount, duration = 2500) => {
    const type = amount > 0 ? 'health-gain' : 'health-loss';
    const message = `${amount > 0 ? '+' : ''}${amount} Health`;
    addToast(message, type, duration);
  }, [addToast]);

  const showEnergyChange = useCallback((amount, duration = 2500) => {
    const type = amount > 0 ? 'energy-gain' : 'energy-loss';
    const message = `${amount > 0 ? '+' : ''}${amount} Energy`;
    addToast(message, type, duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      success,
      error,
      info,
      warning,
      addToast,
      removeToast,
      showWealthChange,
      showItemChange,
      showHealthChange,
      showEnergyChange
    }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ toast, onClose }) => {
  const { type, message } = toast;

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-botanical-500 to-botanical-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      bg: 'bg-gradient-to-r from-danger-500 to-danger-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-gradient-to-r from-warning-500 to-warning-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-gradient-to-r from-potion-500 to-potion-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    'wealth-gain': {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      icon: <span className="text-xl">💰</span>
    },
    'wealth-loss': {
      bg: 'bg-gradient-to-r from-danger-500 to-danger-600',
      icon: <span className="text-xl">💸</span>
    },
    'item-gain': {
      bg: 'bg-gradient-to-r from-botanical-500 to-botanical-600',
      icon: <span className="text-xl">📦</span>
    },
    'item-loss': {
      bg: 'bg-gradient-to-r from-ink-500 to-ink-600',
      icon: <span className="text-xl">📤</span>
    },
    'health-gain': {
      bg: 'bg-gradient-to-r from-success-500 to-success-600',
      icon: <span className="text-xl">❤️</span>
    },
    'health-loss': {
      bg: 'bg-gradient-to-r from-danger-500 to-danger-600',
      icon: <span className="text-xl">💔</span>
    },
    'energy-gain': {
      bg: 'bg-gradient-to-r from-potion-500 to-potion-600',
      icon: <span className="text-xl">⚡</span>
    },
    'energy-loss': {
      bg: 'bg-gradient-to-r from-warning-500 to-warning-600',
      icon: <span className="text-xl">🔋</span>
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`${style.bg} text-white px-4 py-3 rounded-xl shadow-elevation-4 flex items-center gap-3 min-w-[300px] animate-slide-down pointer-events-auto`}>
      <div className="flex-shrink-0">
        {style.icon}
      </div>
      <p className="flex-1 text-sm font-semibold font-sans">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors duration-fast"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
