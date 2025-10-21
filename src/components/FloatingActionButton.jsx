import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics';
import './FloatingActionButton.css';

/**
 * Floating Action Button (FAB) Component
 *
 * Material Design style floating action button for primary mobile actions
 * Features:
 * - Fixed position (bottom-right by default)
 * - Haptic feedback
 * - Extended variant with label
 * - Mini size variant
 * - Multiple action expansion
 * - Auto-hides on scroll (optional)
 *
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {ReactNode} props.icon - Button icon
 * @param {string} props.label - Optional label for extended variant
 * @param {string} props.size - Size: 'normal' | 'mini' (default: 'normal')
 * @param {string} props.variant - Variant: 'primary' | 'secondary' | 'extended' (default: 'primary')
 * @param {string} props.position - Position: 'bottom-right' | 'bottom-left' | 'bottom-center' (default: 'bottom-right')
 * @param {Array} props.actions - Sub-actions for multi-action FAB
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.enableHaptics - Enable haptic feedback (default: true)
 * @param {string} props.ariaLabel - Accessibility label
 * @param {string} props.className - Additional CSS classes
 */
const FloatingActionButton = ({
  onClick,
  icon,
  label,
  size = 'normal',
  variant = 'primary',
  position = 'bottom-right',
  actions = [],
  disabled = false,
  enableHaptics = true,
  ariaLabel,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActions = actions && actions.length > 0;
  const isExtended = variant === 'extended' || Boolean(label);

  const handleClick = (e) => {
    if (disabled) return;

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('medium');
    }

    // If has sub-actions, toggle expansion
    if (hasActions) {
      setIsExpanded(!isExpanded);
    } else {
      // Otherwise call onClick
      if (onClick) {
        onClick(e);
      }
    }
  };

  const handleActionClick = (action, e) => {
    e.stopPropagation();

    if (action.disabled) return;

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('selection');
    }

    // Call action handler
    if (action.onClick) {
      action.onClick(e);
    }

    // Collapse after action
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div
          className="fab-backdrop"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* FAB Container */}
      <div
        className={`fab-container fab-container--${position} ${
          isExpanded ? 'fab-container--expanded' : ''
        }`}
      >
        {/* Sub-actions */}
        {hasActions && isExpanded && (
          <div className="fab-actions">
            {actions.map((action, index) => (
              <div
                key={action.id || index}
                className="fab-action-wrapper"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Action label */}
                {action.label && (
                  <span className="fab-action-label">{action.label}</span>
                )}

                {/* Action button */}
                <button
                  className={`fab-action ${
                    action.disabled ? 'fab-action--disabled' : ''
                  }`}
                  onClick={(e) => handleActionClick(action, e)}
                  disabled={action.disabled}
                  aria-label={action.ariaLabel || action.label}
                >
                  <span className="fab-action-icon">{action.icon}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          className={`fab fab--${size} fab--${
            isExtended ? 'extended' : variant
          } ${isExpanded ? 'fab--expanded' : ''} ${
            disabled ? 'fab--disabled' : ''
          } ${className}`}
          onClick={handleClick}
          disabled={disabled}
          aria-label={ariaLabel || label || 'Action button'}
          aria-expanded={hasActions ? isExpanded : undefined}
        >
          {/* Icon */}
          <span
            className={`fab__icon ${
              isExpanded ? 'fab__icon--rotated' : ''
            }`}
          >
            {hasActions && isExpanded ? '✕' : icon}
          </span>

          {/* Label (extended variant) */}
          {isExtended && label && (
            <span className="fab__label">{label}</span>
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingActionButton;
