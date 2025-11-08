/**
 * timeUtils.js - Time and date parsing utilities for game state
 * Handles conversion of game time strings to usable formats for weather and background systems
 */

/**
 * Parse game time string to hours and minutes
 * @param {string} timeString - Format: "8:00 AM" or "11:30 PM"
 * @returns {{ hours: number, minutes: number }} - 24-hour format
 */
export const parseGameTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    console.warn('[timeUtils] Invalid time string:', timeString);
    return { hours: 12, minutes: 0 }; // Default to noon
  }

  try {
    // Extract time components
    const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      console.warn('[timeUtils] Could not parse time string:', timeString);
      return { hours: 12, minutes: 0 };
    }

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  } catch (error) {
    console.error('[timeUtils] Error parsing time:', error);
    return { hours: 12, minutes: 0 };
  }
};

/**
 * Parse game date string to Date object
 * @param {string} dateString - Format: "August 22, 1680" or "October 5, 1680"
 * @returns {Date} - JavaScript Date object
 */
export const parseGameDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    console.warn('[timeUtils] Invalid date string:', dateString);
    return new Date('August 22, 1680'); // Default to game start date
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('[timeUtils] Could not parse date string:', dateString);
      return new Date('August 22, 1680');
    }
    return date;
  } catch (error) {
    console.error('[timeUtils] Error parsing date:', error);
    return new Date('August 22, 1680');
  }
};

/**
 * Get season from date
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {'spring' | 'summer' | 'fall' | 'winter'}
 */
export const getSeasonFromDate = (dateInput) => {
  const date = typeof dateInput === 'string' ? parseGameDate(dateInput) : dateInput;
  const month = date.getMonth(); // 0-11

  // Northern hemisphere seasons (Mexico City)
  if (month >= 2 && month <= 4) return 'spring'; // March, April, May
  if (month >= 5 && month <= 7) return 'summer'; // June, July, August
  if (month >= 8 && month <= 10) return 'fall'; // September, October, November
  return 'winter'; // December, January, February
};

/**
 * Get time of day period
 * @param {number} hours - Hour in 24-hour format (0-23)
 * @returns {'night' | 'dawn' | 'morning' | 'day' | 'afternoon' | 'dusk' | 'twilight' | 'midnight'}
 */
export const getTimeOfDay = (hours) => {
  if (hours >= 22 || hours < 4) return 'midnight'; // 10 PM - 4 AM
  if (hours >= 4 && hours < 5) return 'pre-dawn'; // 4-5 AM
  if (hours >= 5 && hours < 8) return 'dawn'; // 5-8 AM
  if (hours >= 8 && hours < 12) return 'morning'; // 8 AM - noon
  if (hours >= 12 && hours < 17) return 'afternoon'; // noon - 5 PM
  if (hours >= 17 && hours < 18) return 'day'; // 5-6 PM (late afternoon)
  if (hours >= 18 && hours < 20) return 'dusk'; // 6-8 PM
  if (hours >= 20 && hours < 22) return 'twilight'; // 8-10 PM
  return 'night';
};

/**
 * Get descriptive time label for UI
 * @param {number} hours - Hour in 24-hour format
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} - Human-readable time description
 */
export const getTimeLabel = (hours, minutes) => {
  const period = getTimeOfDay(hours);
  const timeStr = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;

  const labels = {
    'midnight': `Late Night (${timeStr})`,
    'pre-dawn': `Pre-Dawn (${timeStr})`,
    'dawn': `Dawn (${timeStr})`,
    'morning': `Morning (${timeStr})`,
    'afternoon': `Afternoon (${timeStr})`,
    'day': `Late Afternoon (${timeStr})`,
    'dusk': `Dusk (${timeStr})`,
    'twilight': `Twilight (${timeStr})`,
    'night': `Night (${timeStr})`
  };

  return labels[period] || timeStr;
};

/**
 * Check if it's currently nighttime (for star visibility, etc.)
 * @param {number} hours - Hour in 24-hour format
 * @returns {boolean}
 */
export const isNighttime = (hours) => {
  return hours >= 20 || hours < 6; // 8 PM - 6 AM
};

/**
 * Check if it's currently daytime
 * @param {number} hours - Hour in 24-hour format
 * @returns {boolean}
 */
export const isDaytime = (hours) => {
  return hours >= 8 && hours < 18; // 8 AM - 6 PM
};

/**
 * Get sun position for lighting calculations (0-1, where 0.5 is zenith)
 * @param {number} hours - Hour in 24-hour format
 * @param {number} minutes - Minutes (0-59)
 * @returns {number} - Sun position (0 = horizon/night, 0.5 = zenith, 1 = horizon/night)
 */
export const getSunPosition = (hours, minutes) => {
  const timeInHours = hours + minutes / 60;

  // Sunrise at 6 AM, sunset at 6 PM (simplified for Mexico City)
  const sunrise = 6;
  const sunset = 18;

  if (timeInHours < sunrise || timeInHours > sunset) {
    return 0; // Below horizon
  }

  // Calculate position (parabola with peak at noon)
  const noon = 12;
  const dayLength = sunset - sunrise;
  const position = (timeInHours - sunrise) / dayLength;

  // Convert to sun angle (0 at horizon, 1 at zenith)
  return Math.sin(position * Math.PI);
};

/**
 * Calculate moon phase for a given date (simplified approximation)
 * @param {Date} date - Date object
 * @returns {number} - Moon phase (0-1, where 0 = new moon, 0.5 = full moon)
 */
export const getMoonPhase = (date) => {
  // Simplified lunar cycle calculation
  // Full cycle is approximately 29.53 days
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Known new moon: January 6, 2000
  const knownNewMoon = new Date(2000, 0, 6);
  const daysSinceKnownNewMoon = (date - knownNewMoon) / (1000 * 60 * 60 * 24);

  const lunarCycle = 29.53058867;
  const phase = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;

  return phase;
};

/**
 * Check if moon is visible (nighttime + not new moon)
 * @param {number} hours - Hour in 24-hour format
 * @param {Date} date - Date object
 * @returns {boolean}
 */
export const isMoonVisible = (hours, date) => {
  if (!isNighttime(hours)) return false;

  const phase = getMoonPhase(date);
  // Moon is visible except during new moon (phase near 0 or 1)
  return phase > 0.05 && phase < 0.95;
};

/**
 * Format time for display (12-hour format)
 * @param {number} hours - Hour in 24-hour format
 * @param {number} minutes - Minutes
 * @returns {string} - Formatted time string
 */
export const formatTime = (hours, minutes) => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
};

/**
 * Parse hour from game time string (simplified, 24-hour format)
 * Utility function for agents that only need the hour value
 * @param {string} timeString - Format: "8:00 AM" or "11:30 PM"
 * @returns {number} - Hour in 24-hour format (0-23)
 */
export const parseHourFromTimeString = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return 12; // Default to noon
  }

  // Try full parsing first
  const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeParts) {
    // Fallback: try simple split for "8:00" format
    const simpleParse = parseInt(timeString.split(':')[0]);
    return isNaN(simpleParse) ? 12 : simpleParse;
  }

  let hour = parseInt(timeParts[1]);
  const period = timeParts[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return hour;
};
