import React, { useState, useRef } from 'react';

/**
 * RippleButton - Elegant Material Design ripple effect
 *
 * Wraps any button content with a performant ripple animation on click.
 * Adapts to light/dark mode automatically.
 *
 * Usage:
 *   <RippleButton onClick={handleClick} className="your-classes">
 *     Button Text
 *   </RippleButton>
 */
export function RippleButton({
  children,
  onClick,
  className = '',
  style = {},
  disabled = false,
  rippleColor = null, // Auto-detects from theme if null
  type = 'button',
  ...props
}) {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  const nextRippleId = useRef(0);

  const createRipple = (event) => {
    if (disabled) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();

    // Calculate ripple position relative to button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate ripple size (diagonal of button for full coverage)
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple = {
      id: nextRippleId.current++,
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600); // Match animation duration

    // Call original onClick
    if (onClick) {
      onClick(event);
    }
  };

  // Auto-detect ripple color based on theme
  const isDark = typeof window !== 'undefined' &&
                 document.documentElement.classList.contains('dark');

  const defaultRippleColor = isDark
    ? 'rgba(251, 191, 36, 0.3)' // Amber for dark mode
    : 'rgba(16, 185, 129, 0.25)'; // Emerald for light mode

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={createRipple}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
      style={style}
      {...props}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            position: 'absolute',
            borderRadius: '50%',
            pointerEvents: 'none',
            backgroundColor: rippleColor || defaultRippleColor,
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            transform: 'scale(0)',
            opacity: 1,
            animation: 'ripple-animation 600ms ease-out'
          }}
        />
      ))}

      {/* CSS animation */}
      <style>{`
        @keyframes ripple-animation {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}

/**
 * RippleIconButton - Specialized ripple button for icon-only buttons
 * Circular ripple, optimized for small icon buttons
 */
export function RippleIconButton({
  children,
  onClick,
  className = '',
  ...props
}) {
  return (
    <RippleButton
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </RippleButton>
  );
}

export default RippleButton;
