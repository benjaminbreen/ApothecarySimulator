import React from 'react';
import { triggerHaptic } from '../utils/haptics';
import './MobileBottomNav.css';

/**
 * Mobile Bottom Navigation Component
 *
 * iOS/Android style bottom navigation bar
 * Features:
 * - 3-5 navigation items
 * - Active state highlighting
 * - Haptic feedback on tap
 * - Badge notifications
 * - Icon + label layout
 *
 * @param {Object} props
 * @param {Array} props.items - Navigation items
 * @param {string} props.activeItem - Currently active item ID
 * @param {Function} props.onItemClick - Click handler (item) => void
 * @param {boolean} props.showLabels - Show text labels (default: true)
 * @param {boolean} props.enableHaptics - Enable haptic feedback (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const MobileBottomNav = ({
  items = [],
  activeItem,
  onItemClick,
  showLabels = true,
  enableHaptics = true,
  className = ''
}) => {
  const handleItemClick = (item) => {
    if (item.disabled) return;

    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic('selection');
    }

    // Call click handler
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <nav className={`mobile-bottom-nav ${className}`} role="navigation">
      <div className="mobile-bottom-nav__container">
        {items.map((item) => {
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              className={`mobile-bottom-nav__item ${
                isActive ? 'mobile-bottom-nav__item--active' : ''
              } ${item.disabled ? 'mobile-bottom-nav__item--disabled' : ''}`}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon with optional badge */}
              <div className="mobile-bottom-nav__icon-wrapper">
                <span className="mobile-bottom-nav__icon" aria-hidden="true">
                  {item.icon}
                </span>

                {/* Badge */}
                {item.badge && (
                  <span className="mobile-bottom-nav__badge">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <span className="mobile-bottom-nav__label">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
