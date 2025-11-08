/**
 * Safari-optimized logging utility
 *
 * Safari has extremely poor console.log performance (5-50ms per call vs 1-2ms on Chrome).
 * With 1000+ console.log statements in the codebase, this creates massive lag on Safari.
 *
 * Solution: Disable console.log on Safari in production, keep enabled on Chrome/Firefox
 */

import { isSafari } from './browserDetection';

const IS_SAFARI = isSafari();
const IS_DEV = process.env.NODE_ENV === 'development';

// On Safari in production, replace console methods with no-ops for performance
// Keep console enabled in development mode for debugging
if (IS_SAFARI && !IS_DEV) {
  const noop = () => {};

  // Store original console for emergency debugging
  window.__originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  // Replace console methods with no-ops
  console.log = noop;
  console.warn = noop;
  console.info = noop;
  console.debug = noop;

  // Keep console.error for critical errors
  // (but make it lighter weight)
  const originalError = console.error;
  console.error = (...args) => {
    // Only log errors in Safari if they're actual Error objects
    if (args[0] instanceof Error) {
      originalError.apply(console, args);
    }
  };

  console.log('[Safari Performance Mode] Console logging disabled for performance. Use window.__originalConsole.log() for debugging.');
}

export default console;
