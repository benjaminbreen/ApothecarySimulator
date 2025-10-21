import React, { useEffect, useRef, useState } from 'react';
import { useGesture } from '../hooks/useGesture';
import { triggerHaptic } from '../utils/haptics';
import './BottomSheet.css';

/**
 * Bottom Sheet Component
 *
 * Mobile-optimized modal that slides up from the bottom
 * Features:
 * - Swipe down to close
 * - Drag handle for visual affordance
 * - Multiple snap points (collapsed, half, full)
 * - Backdrop overlay
 * - Smooth animations
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sheet is open
 * @param {Function} props.onClose - Close callback
 * @param {ReactNode} props.children - Sheet content
 * @param {string} props.title - Optional title
 * @param {string} props.height - Height mode: 'auto', 'half', 'full' (default: 'auto')
 * @param {boolean} props.showHandle - Show drag handle (default: true)
 * @param {boolean} props.closeOnBackdrop - Close when clicking backdrop (default: true)
 * @param {boolean} props.enableSwipeClose - Enable swipe to close (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  showHandle = true,
  closeOnBackdrop = true,
  enableSwipeClose = true,
  className = ''
}) => {
  const sheetRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Swipe to close gesture
  const gestureRef = useGesture({
    onSwipeDown: () => {
      if (enableSwipeClose && !isAnimating) {
        handleClose();
      }
    },
    minSwipeDistance: 60,
    enableHaptics: true
  });

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      // Opening animation
      setIsAnimating(true);
      triggerHaptic('light');

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    } else {
      // Closing animation
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    triggerHaptic('light');

    // Delay actual close to allow animation
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 250);
  };

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay">
      {/* Backdrop */}
      <div
        className="bottom-sheet-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={gestureRef}
        className={`bottom-sheet bottom-sheet--${height} ${
          isAnimating ? 'bottom-sheet--animating' : ''
        } ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div className="bottom-sheet__handle-container">
            <div className="bottom-sheet__handle" aria-hidden="true" />
          </div>
        )}

        {/* Title */}
        {title && (
          <div className="bottom-sheet__header">
            <h2 id="bottom-sheet-title" className="bottom-sheet__title">
              {title}
            </h2>
            <button
              className="bottom-sheet__close-button"
              onClick={handleClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="bottom-sheet__content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
