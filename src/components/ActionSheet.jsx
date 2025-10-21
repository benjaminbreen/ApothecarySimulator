import React from 'react';
import { useGesture } from '../hooks/useGesture';
import { triggerHaptic } from '../utils/haptics';
import './ActionSheet.css';

/**
 * Action Sheet Component
 *
 * iOS/Android style action picker modal
 * Features:
 * - Swipe down to close
 * - Destructive action styling
 * - Cancel button
 * - Haptic feedback
 * - Icon support
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sheet is open
 * @param {Function} props.onClose - Close callback
 * @param {string} props.title - Optional title
 * @param {string} props.message - Optional message/description
 * @param {Array} props.actions - Action items
 * @param {boolean} props.showCancel - Show cancel button (default: true)
 * @param {string} props.cancelText - Cancel button text (default: 'Cancel')
 * @param {boolean} props.enableHaptics - Enable haptic feedback (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const ActionSheet = ({
  isOpen,
  onClose,
  title,
  message,
  actions = [],
  showCancel = true,
  cancelText = 'Cancel',
  enableHaptics = true,
  className = ''
}) => {
  // Swipe to close
  const gestureRef = useGesture({
    onSwipeDown: () => {
      onClose();
    },
    minSwipeDistance: 60,
    enableHaptics
  });

  const handleActionClick = (action) => {
    if (action.disabled) return;

    // Trigger haptic feedback
    if (enableHaptics) {
      const hapticType = action.destructive ? 'heavy' : 'selection';
      triggerHaptic(hapticType);
    }

    // Call action handler
    if (action.onPress) {
      action.onPress();
    }

    // Close sheet (unless action says otherwise)
    if (action.closeOnPress !== false) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (enableHaptics) {
      triggerHaptic('light');
    }
    onClose();
  };

  const handleBackdropClick = () => {
    handleCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="action-sheet-overlay">
      {/* Backdrop */}
      <div
        className="action-sheet-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={gestureRef}
        className={`action-sheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'action-sheet-title' : undefined}
      >
        {/* Drag Handle */}
        <div className="action-sheet__handle-container">
          <div className="action-sheet__handle" aria-hidden="true" />
        </div>

        {/* Header */}
        {(title || message) && (
          <div className="action-sheet__header">
            {title && (
              <h2 id="action-sheet-title" className="action-sheet__title">
                {title}
              </h2>
            )}
            {message && <p className="action-sheet__message">{message}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="action-sheet__actions">
          {actions.map((action, index) => (
            <button
              key={action.id || index}
              className={`action-sheet__action ${
                action.destructive ? 'action-sheet__action--destructive' : ''
              } ${action.disabled ? 'action-sheet__action--disabled' : ''}`}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
            >
              {/* Icon */}
              {action.icon && (
                <span className="action-sheet__action-icon" aria-hidden="true">
                  {action.icon}
                </span>
              )}

              {/* Label */}
              <span className="action-sheet__action-label">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        {showCancel && (
          <div className="action-sheet__cancel-group">
            <button
              className="action-sheet__cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionSheet;
