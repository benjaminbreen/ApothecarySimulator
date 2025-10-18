/**
 * Dynamic Maria Portrait Selection System
 *
 * Selects Maria's portrait based on her current state:
 * - Health and energy levels (critical/warning states)
 * - XP progress toward next level (positive states)
 * - Recent events (determined flash on XP gain)
 * - Default state (normal)
 */

/**
 * Get Maria's portrait filename based on current game state
 * @param {Object} state - Current game state
 * @param {number} state.health - Current health (0-100)
 * @param {number} state.energy - Current energy (0-100)
 * @param {number} state.currentXP - Current XP value
 * @param {number} state.nextLevelXP - XP needed for next level
 * @param {number} state.level - Current level
 * @param {boolean} [state.recentFailure] - Whether player recently failed/lost
 * @returns {string} Portrait filename (e.g., "marianormal.jpg")
 */
export function getMariaPortrait({ health, energy, currentXP, nextLevelXP, level, recentFailure = false }) {
  // Calculate XP progress to next level (0-100%)
  const prevLevelXP = getLevelXP(level - 1);
  const xpIntoLevel = currentXP - prevLevelXP;
  const xpNeededForLevel = nextLevelXP - prevLevelXP;
  const xpProgress = (xpIntoLevel / xpNeededForLevel) * 100;

  console.log('[PortraitSelector]', { health, energy, xpProgress: xpProgress.toFixed(1), level });

  // CRITICAL HEALTH - Highest priority
  if (health < 30) {
    return '/maria/mariaveryunhealthy.jpg';
  }
  if (health < 60) {
    return '/maria/mariaunhealthy.jpg';
  }

  // CRITICAL FATIGUE
  if (energy < 20) {
    return '/maria/mariaextremelytired.jpg';
  }

  // HIGH FATIGUE
  if (energy < 35) {
    return '/maria/mariaverytired.jpg';
  }
  if (energy < 50) {
    return '/maria/mariatired.jpg';
  }

  // MEDIUM FATIGUE
  if (energy < 65) {
    return '/maria/mariaslightlytired.jpg';
  }
  if (energy < 80) {
    return '/maria/mariaveryslightlytired.jpg';
  }

  // POSITIVE STATES (when health/energy are good)
  // Based on XP progress toward next level
  if (xpProgress >= 80) {
    return '/maria/mariadelighted.jpg';
  }
  if (xpProgress >= 60) {
    return '/maria/mariahappy.jpg';
  }
  if (xpProgress >= 40) {
    return '/maria/mariacurious.jpg';
  }

  // EMOTIONAL STATES (low progress or recent failure)
  if (recentFailure) {
    return '/maria/mariadejected.jpg';
  }
  if (xpProgress < 20 && level > 1) {
    // Just leveled up, early in new level
    return '/maria/mariasad.jpg';
  }

  // DEFAULT STATE
  return '/maria/marianormal.jpg';
}

/**
 * Get the temporary "determined" portrait (shown for 5 seconds after XP gain)
 * @returns {string} Portrait filename
 */
export function getDeterminedPortrait() {
  return '/maria/mariadetermined.jpg';
}

/**
 * Helper: Calculate XP required to reach a given level
 * Matches the leveling formula: 100 * level^1.5
 * @param {number} level - Target level (0-indexed)
 * @returns {number} XP required
 */
function getLevelXP(level) {
  if (level <= 0) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Map status words from StatusAgent to portrait filenames
 * @param {string} status - Status word from LLM (e.g., "calm", "tired", "worried")
 * @returns {string|null} Portrait URL or null if no match
 */
export function getPortraitFromStatus(status) {
  if (!status) return null;

  // Normalize: lowercase, remove spaces/punctuation
  const normalized = status.toLowerCase().replace(/[^a-z]/g, '');

  const statusMap = {
    // CALM/NEUTRAL STATES → marianormal.jpg
    'calm': '/maria/marianormal.jpg',
    'neutral': '/maria/marianormal.jpg',
    'composed': '/maria/marianormal.jpg',
    'steady': '/maria/marianormal.jpg',
    'rested': '/maria/marianormal.jpg',
    'normal': '/maria/marianormal.jpg',
    'fine': '/maria/marianormal.jpg',
    'okay': '/maria/marianormal.jpg',
    'stable': '/maria/marianormal.jpg',
    'balanced': '/maria/marianormal.jpg',

    // CURIOUS STATES → mariacurious.jpg
    'curious': '/maria/mariacurious.jpg',
    'interested': '/maria/mariacurious.jpg',
    'intrigued': '/maria/mariacurious.jpg',
    'inquisitive': '/maria/mariacurious.jpg',
    'wondering': '/maria/mariacurious.jpg',
    'thoughtful': '/maria/mariacurious.jpg',
    'contemplative': '/maria/mariacurious.jpg',

    // HAPPY STATES → mariahappy.jpg
    'happy': '/maria/mariahappy.jpg',
    'pleased': '/maria/mariahappy.jpg',
    'content': '/maria/mariahappy.jpg',
    'satisfied': '/maria/mariahappy.jpg',
    'cheerful': '/maria/mariahappy.jpg',
    'glad': '/maria/mariahappy.jpg',
    'relieved': '/maria/mariahappy.jpg',
    'hopeful': '/maria/mariahappy.jpg',

    // DELIGHTED STATES → mariadelighted.jpg
    'delighted': '/maria/mariadelighted.jpg',
    'joyful': '/maria/mariadelighted.jpg',
    'excited': '/maria/mariadelighted.jpg',
    'thrilled': '/maria/mariadelighted.jpg',
    'elated': '/maria/mariadelighted.jpg',
    'ecstatic': '/maria/mariadelighted.jpg',
    'overjoyed': '/maria/mariadelighted.jpg',

    // DETERMINED STATES → mariadetermined.jpg
    'determined': '/maria/mariadetermined.jpg',
    'resolute': '/maria/mariadetermined.jpg',
    'focused': '/maria/mariadetermined.jpg',
    'confident': '/maria/mariadetermined.jpg',
    'purposeful': '/maria/mariadetermined.jpg',
    'driven': '/maria/mariadetermined.jpg',
    'resolved': '/maria/mariadetermined.jpg',
    'steadfast': '/maria/mariadetermined.jpg',

    // SLIGHTLY TIRED → mariaveryslightlytired.jpg
    'veryslightlytired': '/maria/mariaveryslightlytired.jpg',
    'slightlyfatigued': '/maria/mariaveryslightlytired.jpg',
    'abitweary': '/maria/mariaveryslightlytired.jpg',

    // SLIGHTLY TIRED → mariaslightlytired.jpg
    'slightlytired': '/maria/mariaslightlytired.jpg',
    'alittletired': '/maria/mariaslightlytired.jpg',
    'weary': '/maria/mariaslightlytired.jpg',

    // TIRED STATES → mariatired.jpg
    'tired': '/maria/mariatired.jpg',
    'fatigued': '/maria/mariatired.jpg',
    'drained': '/maria/mariatired.jpg',
    'worn': '/maria/mariatired.jpg',
    'wornout': '/maria/mariatired.jpg',

    // VERY TIRED STATES → mariaverytired.jpg
    'verytired': '/maria/mariaverytired.jpg',
    'exhausted': '/maria/mariaverytired.jpg',
    'weary': '/maria/mariaverytired.jpg',
    'depleted': '/maria/mariaverytired.jpg',

    // EXTREMELY TIRED STATES → mariaextremelytired.jpg
    'extremelytired': '/maria/mariaextremelytired.jpg',
    'completelyexhausted': '/maria/mariaextremelytired.jpg',
    'utterlydrained': '/maria/mariaextremelytired.jpg',
    'spent': '/maria/mariaextremelytired.jpg',

    // UNHEALTHY STATES → mariaunhealthy.jpg
    'unwell': '/maria/mariaunhealthy.jpg',
    'sick': '/maria/mariaunhealthy.jpg',
    'ill': '/maria/mariaunhealthy.jpg',
    'undertheweather': '/maria/mariaunhealthy.jpg',
    'unhealthy': '/maria/mariaunhealthy.jpg',
    'ailing': '/maria/mariaunhealthy.jpg',
    'sickly': '/maria/mariaunhealthy.jpg',

    // VERY UNHEALTHY STATES → mariaveryunhealthy.jpg
    'verysick': '/maria/mariaveryunhealthy.jpg',
    'gravelyill': '/maria/mariaveryunhealthy.jpg',
    'seriouslyill': '/maria/mariaveryunhealthy.jpg',
    'veryunhealthy': '/maria/mariaveryunhealthy.jpg',
    'criticallyill': '/maria/mariaveryunhealthy.jpg',

    // SAD STATES → mariasad.jpg
    'sad': '/maria/mariasad.jpg',
    'melancholy': '/maria/mariasad.jpg',
    'sorrowful': '/maria/mariasad.jpg',
    'downcast': '/maria/mariasad.jpg',
    'unhappy': '/maria/mariasad.jpg',
    'gloomy': '/maria/mariasad.jpg',
    'somber': '/maria/mariasad.jpg',
    'mournful': '/maria/mariasad.jpg',
    'worried': '/maria/mariasad.jpg',
    'anxious': '/maria/mariasad.jpg',
    'troubled': '/maria/mariasad.jpg',
    'concerned': '/maria/mariasad.jpg',
    'apprehensive': '/maria/mariasad.jpg',

    // DEJECTED STATES → mariadejected.jpg
    'dejected': '/maria/mariadejected.jpg',
    'despondent': '/maria/mariadejected.jpg',
    'crushed': '/maria/mariadejected.jpg',
    'defeated': '/maria/mariadejected.jpg',
    'hopeless': '/maria/mariadejected.jpg',
    'demoralized': '/maria/mariadejected.jpg',
    'crestfallen': '/maria/mariadejected.jpg',
    'disheartened': '/maria/mariadejected.jpg',
    'devastated': '/maria/mariadejected.jpg',
  };

  return statusMap[normalized] || null;
}

/**
 * DEPRECATED: Use getPortraitFromStatus instead
 * @deprecated
 */
export function getPortraitForStatus(status) {
  return getPortraitFromStatus(status);
}
