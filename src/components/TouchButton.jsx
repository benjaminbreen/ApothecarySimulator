import React from 'react';
import { triggerHaptic } from '../utils/haptics';
import './TouchButton.css';

/**
 * Touch-Optimized Button Component
 *
 * Features:
 * - Minimum 48x48px touch target (WCAG 2.5.5 compliance)
 * - Haptic feedback on press
 * - Active state visual feedback
 * - Accessible (keyboard support, ARIA labels)
 * - Prevents double-tap zoom on iOS
 *
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary, secondary, danger, success)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.hapticType - Haptic feedback type (light, medium, heavy)
 * @param {boolean} props.enableHaptics - Enable haptic feedback (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Accessibility label
 * @param {Object} props.style - Inline styles
 */
const TouchButton = ({
  onClick,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  hapticType = 'medium',
  enableHaptics = true,
  className = '',
  ariaLabel,
  style,
  ...rest
}) => {
  const handleClick = (e) => {
    if (disabled) return;

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic(hapticType);
    }

    // Call user's onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  const handleTouchStart = (e) => {
    // Add active class for visual feedback
    e.currentTarget.classList.add('touch-active');
  };

  const handleTouchEnd = (e) => {
    // Remove active class
    e.currentTarget.classList.remove('touch-active');
  };

  return (
    <button
      className={`touch-button touch-button--${variant} touch-button--${size} ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
};

export default TouchButton;
