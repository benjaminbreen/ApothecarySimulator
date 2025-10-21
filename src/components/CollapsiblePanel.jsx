import React, { useState, useRef, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import './CollapsiblePanel.css';

/**
 * Collapsible Panel Component
 *
 * Mobile-optimized accordion panel with smooth animations
 * and haptic feedback
 *
 * @param {Object} props
 * @param {string} props.title - Panel title
 * @param {ReactNode} props.children - Panel content
 * @param {boolean} props.defaultCollapsed - Initial collapsed state
 * @param {boolean} props.isCollapsed - Controlled collapsed state
 * @param {Function} props.onToggle - Callback when toggled
 * @param {string} props.icon - Optional icon emoji
 * @param {string} props.variant - Style variant (default, primary, secondary)
 * @param {boolean} props.disabled - Disable interaction
 * @param {boolean} props.enableHaptics - Enable haptic feedback (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {ReactNode} props.headerActions - Actions to display in header
 */
const CollapsiblePanel = ({
  title,
  children,
  defaultCollapsed = false,
  isCollapsed: controlledCollapsed,
  onToggle,
  icon,
  variant = 'default',
  disabled = false,
  enableHaptics = true,
  className = '',
  headerActions
}) => {
  // Internal collapsed state (used when not controlled)
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

  // Determine if component is controlled
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  // Content ref for height animation
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Update content height when collapsed state changes
  useEffect(() => {
    if (contentRef.current) {
      const height = isCollapsed ? 0 : contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [isCollapsed, children]);

  /**
   * Handle toggle
   */
  const handleToggle = () => {
    if (disabled) return;

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('light');
    }

    // Update state
    if (isControlled) {
      // Call parent's onToggle
      if (onToggle) {
        onToggle(!isCollapsed);
      }
    } else {
      // Update internal state
      setInternalCollapsed(!internalCollapsed);
      if (onToggle) {
        onToggle(!internalCollapsed);
      }
    }
  };

  return (
    <div
      className={`collapsible-panel collapsible-panel--${variant} ${
        isCollapsed ? 'collapsible-panel--collapsed' : 'collapsible-panel--expanded'
      } ${disabled ? 'collapsible-panel--disabled' : ''} ${className}`}
    >
      {/* Header */}
      <button
        className="collapsible-panel__header"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={!isCollapsed}
        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${title}`}
      >
        <div className="collapsible-panel__header-content">
          {/* Icon */}
          {icon && (
            <span className="collapsible-panel__icon" aria-hidden="true">
              {icon}
            </span>
          )}

          {/* Title */}
          <h3 className="collapsible-panel__title">{title}</h3>

          {/* Chevron */}
          <span
            className={`collapsible-panel__chevron ${
              isCollapsed ? 'collapsible-panel__chevron--collapsed' : ''
            }`}
            aria-hidden="true"
          >
            ▼
          </span>
        </div>

        {/* Header Actions */}
        {headerActions && (
          <div
            className="collapsible-panel__actions"
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
          </div>
        )}
      </button>

      {/* Content */}
      <div
        className="collapsible-panel__content-wrapper"
        style={{
          height: `${contentHeight}px`,
          overflow: 'hidden'
        }}
      >
        <div ref={contentRef} className="collapsible-panel__content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsiblePanel;
