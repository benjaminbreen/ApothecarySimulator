// astrologyCalculator.js
// Calculate astrological signs from birth dates

/**
 * Calculate zodiac sign from birth date
 * @param {string} birthDate - Date in format "Month Day, Year" or Date object
 * @returns {string} Zodiac sign with symbol
 */
export function calculateZodiacSign(birthDate) {
  if (!birthDate) return null;

  try {
    // Parse date string
    let date;
    if (typeof birthDate === 'string') {
      date = new Date(birthDate);
    } else {
      date = birthDate;
    }

    if (isNaN(date.getTime())) {
      console.warn('[Astrology] Invalid birth date:', birthDate);
      return null;
    }

    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Zodiac date ranges
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return 'Aries'; // ♈
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return 'Taurus'; // ♉
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return 'Gemini'; // ♊
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return 'Cancer'; // ♋
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return 'Leo'; // ♌
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return 'Virgo'; // ♍
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return 'Libra'; // ♎
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return 'Scorpio'; // ♏
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return 'Sagittarius'; // ♐
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return 'Capricorn'; // ♑
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return 'Aquarius'; // ♒
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return 'Pisces'; // ♓
    }

    return null;
  } catch (error) {
    console.error('[Astrology] Error calculating zodiac:', error);
    return null;
  }
}

/**
 * Get zodiac symbol emoji
 * @param {string} sign - Zodiac sign name
 * @returns {string} Zodiac emoji
 */
export function getZodiacSymbol(sign) {
  const symbols = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  };

  return symbols[sign] || '☆';
}

/**
 * Calculate age from birth date
 * @param {string} birthDate - Date in format "Month Day, Year"
 * @param {string} currentDate - Current date (defaults to game date or today)
 * @returns {number} Age in years
 */
export function calculateAge(birthDate, currentDate = new Date()) {
  if (!birthDate) return null;

  try {
    const birth = new Date(birthDate);
    const current = typeof currentDate === 'string' ? new Date(currentDate) : currentDate;

    if (isNaN(birth.getTime()) || isNaN(current.getTime())) {
      return null;
    }

    let age = current.getFullYear() - birth.getFullYear();
    const monthDiff = current.getMonth() - birth.getMonth();

    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error('[Astrology] Error calculating age:', error);
    return null;
  }
}

export default {
  calculateZodiacSign,
  getZodiacSymbol,
  calculateAge
};
