import React, { useRef, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import './MobileInput.css';

/**
 * Mobile Input Component
 *
 * Mobile-optimized text input with enhanced UX
 * Features:
 * - Large touch targets
 * - Clear button
 * - Character counter
 * - Auto-focus on mobile
 * - Haptic feedback
 * - Input type variants
 *
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.type - Input type (text, number, email, tel, search)
 * @param {string} props.label - Input label
 * @param {number} props.maxLength - Maximum character count
 * @param {boolean} props.showCounter - Show character counter (default: false)
 * @param {boolean} props.showClearButton - Show clear button (default: true)
 * @param {boolean} props.autoFocus - Auto-focus on mount (default: false)
 * @param {boolean} props.disabled - Disable input
 * @param {boolean} props.enableHaptics - Enable haptic feedback (default: true)
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {ReactNode} props.icon - Leading icon
 * @param {string} props.className - Additional CSS classes
 */
const MobileInput = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  maxLength,
  showCounter = false,
  showClearButton = true,
  autoFocus = false,
  disabled = false,
  enableHaptics = true,
  error,
  hint,
  icon,
  className = '',
  ...rest
}) => {
  const inputRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleClear = () => {
    if (enableHaptics) {
      triggerHaptic('light');
    }

    if (onChange) {
      onChange('');
    }

    // Re-focus input after clear
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const showClear = showClearButton && value && !disabled;
  const characterCount = value ? value.length : 0;
  const showCharacterCount = showCounter && maxLength;

  return (
    <div
      className={`mobile-input ${error ? 'mobile-input--error' : ''} ${
        disabled ? 'mobile-input--disabled' : ''
      } ${className}`}
    >
      {/* Label */}
      {label && (
        <label className="mobile-input__label" htmlFor={rest.id}>
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="mobile-input__container">
        {/* Icon */}
        {icon && (
          <span className="mobile-input__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="mobile-input__field"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error
              ? `${rest.id}-error`
              : hint
              ? `${rest.id}-hint`
              : undefined
          }
          {...rest}
        />

        {/* Clear Button */}
        {showClear && (
          <button
            type="button"
            className="mobile-input__clear"
            onClick={handleClear}
            aria-label="Clear input"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
      </div>

      {/* Footer (counter, error, hint) */}
      <div className="mobile-input__footer">
        {/* Character Counter */}
        {showCharacterCount && (
          <span
            className={`mobile-input__counter ${
              characterCount >= maxLength ? 'mobile-input__counter--max' : ''
            }`}
          >
            {characterCount}/{maxLength}
          </span>
        )}

        {/* Error Message */}
        {error && (
          <span id={`${rest.id}-error`} className="mobile-input__error">
            {error}
          </span>
        )}

        {/* Hint Text */}
        {!error && hint && (
          <span id={`${rest.id}-hint`} className="mobile-input__hint">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
};

export default MobileInput;
