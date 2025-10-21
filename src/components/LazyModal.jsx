import React, { useEffect } from 'react';
import { useLazyLoad, usePreload } from '../hooks/useLazyLoad';
import './LazyModal.css';

/**
 * Lazy Modal Component
 *
 * Wrapper for lazy-loaded modals with loading states, error handling, and preloading.
 * Reduces initial bundle size by only loading modal code when needed.
 *
 * Features:
 * - Dynamic import of modal components
 * - Loading skeleton while importing
 * - Error boundary with retry
 * - Preload on hover/focus
 * - Automatic cleanup
 *
 * @param {Object} props
 * @param {Function} props.importFunc - Dynamic import function: () => import('./Modal')
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Object} props.modalProps - Props to pass to modal component
 * @param {boolean} props.enablePreload - Preload on mount (default: false)
 * @param {ReactNode} props.fallback - Custom loading component
 * @param {ReactNode} props.errorFallback - Custom error component
 * @param {Function} props.onLoadError - Error callback
 *
 * @example
 * <LazyModal
 *   importFunc={() => import('./features/medical/PrescribePopup')}
 *   isOpen={showPrescribe}
 *   modalProps={{ patient, onClose: () => setShowPrescribe(false) }}
 *   enablePreload={false}
 * />
 */
const LazyModal = ({
  importFunc,
  isOpen,
  modalProps = {},
  enablePreload = false,
  fallback = null,
  errorFallback = null,
  onLoadError
}) => {
  const { Component, isLoading, error, retry, load } = useLazyLoad(importFunc, {
    preload: enablePreload,
    maxRetries: 3,
    retryDelay: 1000
  });

  // Load component when modal opens
  useEffect(() => {
    if (isOpen && !Component && !isLoading) {
      load();
    }
  }, [isOpen, Component, isLoading, load]);

  // Error callback
  useEffect(() => {
    if (error && onLoadError) {
      onLoadError(error);
    }
  }, [error, onLoadError]);

  // Don't render anything if modal is closed and not loaded
  if (!isOpen && !Component) {
    return null;
  }

  // Show loading state
  if (isOpen && isLoading) {
    return fallback || <DefaultLoadingFallback />;
  }

  // Show error state
  if (isOpen && error) {
    return errorFallback || <DefaultErrorFallback error={error} onRetry={retry} />;
  }

  // Render loaded modal
  if (Component) {
    return <Component {...modalProps} />;
  }

  return null;
};

/**
 * Default Loading Fallback
 *
 * Skeleton loader shown while modal is importing.
 */
const DefaultLoadingFallback = () => (
  <div className="lazy-modal-overlay">
    <div className="lazy-modal-loading">
      <div className="lazy-modal-spinner" />
      <p className="lazy-modal-loading-text">Loading...</p>
    </div>
  </div>
);

/**
 * Default Error Fallback
 *
 * Error UI with retry button.
 */
const DefaultErrorFallback = ({ error, onRetry }) => (
  <div className="lazy-modal-overlay">
    <div className="lazy-modal-error">
      <div className="lazy-modal-error-icon">⚠️</div>
      <h3 className="lazy-modal-error-title">Failed to Load</h3>
      <p className="lazy-modal-error-message">
        {error?.message || 'An error occurred while loading this modal.'}
      </p>
      <button className="lazy-modal-retry-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  </div>
);

/**
 * Preloadable Button
 *
 * Button that preloads a modal on hover/focus for instant opening.
 *
 * @param {Object} props
 * @param {Function} props.importFunc - Dynamic import function
 * @param {Function} props.onClick - Click handler
 * @param {ReactNode} props.children - Button content
 *
 * @example
 * <PreloadableButton
 *   importFunc={() => import('./HeavyModal')}
 *   onClick={() => setIsOpen(true)}
 * >
 *   Open Modal
 * </PreloadableButton>
 */
export const PreloadableButton = ({ importFunc, onClick, children, ...props }) => {
  const preload = usePreload(importFunc);

  return (
    <button
      {...props}
      onClick={onClick}
      onMouseEnter={preload}
      onFocus={preload}
    >
      {children}
    </button>
  );
};

export default LazyModal;
