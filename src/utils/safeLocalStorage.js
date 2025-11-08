/**
 * Safe localStorage wrapper with comprehensive error handling
 * Handles private browsing mode, quota exceeded, and security errors
 */

/**
 * Check if localStorage is available and working
 * @returns {boolean} True if localStorage is available
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safe localStorage wrapper
 */
export const safeLocalStorage = {
  /**
   * Safely get item from localStorage
   * @param {string} key - Storage key
   * @returns {string|null} Value or null if error/not found
   */
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`[SafeStorage] Failed to get "${key}":`, error);

      if (error.name === 'SecurityError') {
        console.warn('[SafeStorage] Storage access denied. Are you in private browsing mode?');
      }

      return null;
    }
  },

  /**
   * Safely set item in localStorage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {boolean} True if successful
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`[SafeStorage] Failed to set "${key}":`, error);

      if (error.name === 'QuotaExceededError') {
        console.error('[SafeStorage] Storage quota exceeded!');
        // Try to provide helpful message
        const size = new Blob([value]).size;
        console.error(`[SafeStorage] Attempted to store ${Math.round(size / 1024)}KB`);

        // Show user-friendly error
        if (window.confirm(
          'Storage quota exceeded! Your save data is too large.\n\n' +
          'Would you like to delete old saves to free up space?\n\n' +
          '(Click OK to open save management, Cancel to continue without saving)'
        )) {
          // Emit custom event for app to handle
          window.dispatchEvent(new CustomEvent('storage-quota-exceeded', { detail: { key } }));
        }
      } else if (error.name === 'SecurityError') {
        console.warn('[SafeStorage] Storage access denied. Private browsing mode detected.');

        // Show user-friendly error (only once per session)
        if (!window.__storageSecurityErrorShown) {
          window.__storageSecurityErrorShown = true;
          alert(
            'Unable to save game: Storage access is disabled.\n\n' +
            'This usually happens in Private Browsing mode.\n' +
            'Please use a regular browser window to save your progress.'
          );
        }
      }

      return false;
    }
  },

  /**
   * Safely remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[SafeStorage] Failed to remove "${key}":`, error);
      return false;
    }
  },

  /**
   * Safely clear all localStorage
   * @returns {boolean} True if successful
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('[SafeStorage] Failed to clear storage:', error);
      return false;
    }
  },

  /**
   * Get all keys in localStorage
   * @returns {string[]} Array of keys
   */
  keys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('[SafeStorage] Failed to get keys:', error);
      return [];
    }
  },

  /**
   * Get storage usage information
   * @returns {Object} Storage info
   */
  getStorageInfo() {
    try {
      let totalSize = 0;
      const items = {};

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          totalSize += size;
          items[key] = size;
        }
      }

      // Most browsers have 5-10MB localStorage limit
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const usagePercent = (totalSize / estimatedLimit) * 100;

      return {
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        estimatedLimit,
        usagePercent: Math.round(usagePercent),
        items
      };
    } catch (error) {
      console.error('[SafeStorage] Failed to get storage info:', error);
      return {
        totalSize: 0,
        totalSizeKB: 0,
        totalSizeMB: '0.00',
        estimatedLimit: 0,
        usagePercent: 0,
        items: {}
      };
    }
  },

  /**
   * Check if a key exists
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  hasItem(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Safely parse JSON from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed value or default
 */
export function getJSON(key, defaultValue = null) {
  const value = safeLocalStorage.getItem(key);

  if (value === null) {
    return defaultValue;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`[SafeStorage] Failed to parse JSON for "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely stringify and store JSON in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful
 */
export function setJSON(key, value) {
  try {
    const jsonString = JSON.stringify(value);
    return safeLocalStorage.setItem(key, jsonString);
  } catch (error) {
    console.error(`[SafeStorage] Failed to stringify JSON for "${key}":`, error);
    return false;
  }
}

export default safeLocalStorage;
