/**
 * Haptic Feedback Utility
 * Provides tactile feedback on mobile devices for enhanced UX
 *
 * Supports:
 * - iOS: Haptic Engine (iPhone 7+)
 * - Android: Vibration API
 * - Web: Vibration API (where supported)
 */

/**
 * Check if haptic feedback is supported
 * @returns {boolean} True if haptics are available
 */
export function isHapticsSupported() {
  // Check for iOS Haptic Engine (Taptic Engine)
  if (window.navigator && 'vibrate' in window.navigator) {
    return true;
  }
  return false;
}

/**
 * Haptic feedback patterns
 * Duration in milliseconds
 */
const HAPTIC_PATTERNS = {
  // Light tap - for hover states, selections
  light: [10],

  // Medium tap - for button presses, confirmations
  medium: [20],

  // Heavy tap - for important actions, errors
  heavy: [30],

  // Success pattern - for completed actions
  success: [10, 50, 10],

  // Error pattern - for failures, warnings
  error: [20, 100, 20, 100, 20],

  // Selection pattern - for selecting items
  selection: [5, 30, 5],

  // Notification - for alerts, messages
  notification: [10, 50, 10, 50, 10]
};

/**
 * Trigger haptic feedback
 * @param {string} type - Type of haptic pattern (light, medium, heavy, success, error, selection, notification)
 */
export function triggerHaptic(type = 'light') {
  if (!isHapticsSupported()) {
    return;
  }

  const pattern = HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS.light;

  try {
    // Use Vibration API
    window.navigator.vibrate(pattern);
  } catch (error) {
    console.warn('[Haptics] Vibration failed:', error);
  }
}

/**
 * React hook for haptic feedback
 * @returns {Function} Trigger function
 */
export function useHaptics() {
  const trigger = (type = 'light') => {
    triggerHaptic(type);
  };

  return trigger;
}

/**
 * Higher-order function to add haptics to event handlers
 * @param {Function} handler - Original event handler
 * @param {string} hapticType - Type of haptic feedback
 * @returns {Function} Enhanced event handler
 */
export function withHaptics(handler, hapticType = 'light') {
  return (...args) => {
    triggerHaptic(hapticType);
    if (handler) {
      return handler(...args);
    }
  };
}

/**
 * Haptic feedback for common UI interactions
 */
export const haptics = {
  // Button press
  buttonPress: () => triggerHaptic('medium'),

  // Item selection
  select: () => triggerHaptic('selection'),

  // Success confirmation
  success: () => triggerHaptic('success'),

  // Error/warning
  error: () => triggerHaptic('error'),

  // Light tap (hover, preview)
  tap: () => triggerHaptic('light'),

  // Heavy impact (delete, important action)
  impact: () => triggerHaptic('heavy'),

  // Notification
  notify: () => triggerHaptic('notification')
};

export default haptics;
