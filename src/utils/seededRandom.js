/**
 * Seeded Random Number Generator
 *
 * Provides deterministic random number generation for procedural biography.
 * Same seed always produces same sequence of random numbers.
 *
 * Uses a simple Linear Congruential Generator (LCG) algorithm.
 *
 * @module seededRandom
 */

export class SeededRNG {
  /**
   * Create a new seeded RNG
   * @param {string} seed - Seed string (e.g., NPC name + id)
   */
  constructor(seed) {
    this.seed = this.hashString(seed);
    this.state = this.seed;
  }

  /**
   * Hash a string to a 32-bit integer
   * @param {string} str - String to hash
   * @returns {number} Hash value
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate next random float between 0 and 1
   * @returns {number} Random float in range [0, 1)
   */
  nextFloat() {
    // LCG parameters (from Numerical Recipes)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    this.state = (a * this.state + c) % m;
    return this.state / m;
  }

  /**
   * Generate random integer in range [min, max] (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  nextInt(min, max) {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  /**
   * Choose random element from array
   * @param {Array} array - Array to choose from
   * @returns {*} Random element
   */
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Choose multiple random elements from array (without replacement)
   * @param {Array} array - Array to choose from
   * @param {number} count - Number of elements to choose
   * @returns {Array} Random elements
   */
  sample(array, count) {
    if (!array || array.length === 0) return [];
    const shuffled = this.shuffle([...array]);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Make weighted random choice
   * @param {Object} weights - Object mapping choices to weights { "option1": 0.3, "option2": 0.7 }
   * @returns {string} Chosen key
   */
  weightedChoice(weights) {
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let random = this.nextFloat() * total;

    for (const [choice, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return choice;
    }

    // Fallback (shouldn't happen)
    return Object.keys(weights)[0];
  }

  /**
   * Boolean with probability p
   * @param {number} probability - Probability of true (0-1)
   * @returns {boolean} Random boolean
   */
  chance(probability) {
    return this.nextFloat() < probability;
  }

  /**
   * Reset RNG to initial seed
   */
  reset() {
    this.state = this.seed;
  }
}

/**
 * Create RNG from NPC data
 * @param {Object} npc - NPC entity
 * @returns {SeededRNG} Seeded RNG
 */
export function createRNGFromNPC(npc) {
  const seed = `${npc.name}_${npc.id || npc.name}`;
  return new SeededRNG(seed);
}

// Legacy compatibility with existing weather system
export const createSeededRandom = (seed) => {
  let currentSeed = seed % 2147483647;
  if (currentSeed <= 0) currentSeed += 2147483646;

  const next = () => {
    currentSeed = (currentSeed * 16807) % 2147483647;
    return currentSeed;
  };

  return {
    random: () => {
      return (next() - 1) / 2147483646;
    },
    randomInt: (min, max) => {
      return Math.floor((next() - 1) / 2147483646 * (max - min)) + min;
    },
    randomRange: (min, max) => {
      return ((next() - 1) / 2147483646) * (max - min) + min;
    }
  };
};

export default SeededRNG;
