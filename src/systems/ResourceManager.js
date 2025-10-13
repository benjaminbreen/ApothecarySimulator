/**
 * ResourceManager.js
 * Manages health and energy resources with dynamic gameplay effects
 */

export class ResourceManager {
  constructor() {
    this.maxHealth = 100;
    this.maxEnergy = 100;
  }

  /**
   * Energy costs for different actions
   * Simple actions (chat) cost 1 energy as per design rule
   */
  static ACTION_ENERGY_COSTS = {
    study: 15,
    forage: 20,
    mix: 10,
    seePatients: 15,
    travel: 25,
    chat: 1,        // Simple player command - reduced from 5 to 1
    prescribe: 10,
    buy: 8,
    sleep: -60, // Restores energy (8 hour sleep)
    eat: -15,   // Restores energy
  };

  /**
   * Get energy cost for an action
   */
  getEnergyCost(action, modifiers = {}) {
    const baseCost = ResourceManager.ACTION_ENERGY_COSTS[action] || 0;
    const modifier = modifiers.energyCostModifier || 1.0;
    return Math.round(baseCost * modifier);
  }

  /**
   * Calculate energy change for an action
   */
  calculateEnergyChange(currentEnergy, action, modifiers = {}) {
    const cost = this.getEnergyCost(action, modifiers);
    const regenBonus = modifiers.energyRegen || 0;
    const energyBonus = modifiers.energyBonus || 0;

    let newEnergy = currentEnergy - cost + regenBonus + energyBonus;

    // Clamp between 0 and maxEnergy
    return Math.max(0, Math.min(this.maxEnergy, newEnergy));
  }

  /**
   * Check if player has enough energy for an action
   */
  canPerformAction(currentEnergy, action, modifiers = {}) {
    const cost = this.getEnergyCost(action, modifiers);

    // Actions that restore energy can always be performed
    if (cost < 0) return true;

    // Need at least 10 energy to perform any action
    if (currentEnergy < 10) return false;

    // Check if we have enough energy for this specific action
    return currentEnergy >= cost;
  }

  /**
   * Get warning message if energy is low
   */
  getEnergyWarning(currentEnergy) {
    if (currentEnergy < 10) {
      return {
        level: 'critical',
        message: 'You are too exhausted to work. You must sleep or eat.',
        icon: '⚠️'
      };
    } else if (currentEnergy < 25) {
      return {
        level: 'warning',
        message: 'You are very tired. Consider resting soon.',
        icon: '😴'
      };
    } else if (currentEnergy < 40) {
      return {
        level: 'caution',
        message: 'Your energy is running low.',
        icon: '💤'
      };
    }
    return null;
  }

  /**
   * Calculate health decrease from various sources
   */
  calculateHealthDecrease(currentHealth, state, modifiers = {}) {
    let healthDecrease = 0;

    // Poor living conditions (wealth < 5 reales)
    if (state.wealth < 5) {
      healthDecrease += 3;
    }

    // Overwork (energy < 20 for 3+ consecutive turns)
    if (state.energy < 20 && state.consecutiveLowEnergyTurns >= 3) {
      healthDecrease += 5;
    }

    // Plague exposure risk
    if (modifiers.healthRisk) {
      const riskChance = Math.random();
      if (riskChance < modifiers.healthRisk) {
        healthDecrease += 10;
      }
    }

    const newHealth = Math.max(0, currentHealth - healthDecrease);

    return {
      newHealth,
      decrease: healthDecrease,
      reasons: this._getHealthDecreaseReasons(state, modifiers, healthDecrease)
    };
  }

  /**
   * Get reasons for health decrease (for player feedback)
   */
  _getHealthDecreaseReasons(state, modifiers, totalDecrease) {
    const reasons = [];

    if (state.wealth < 5) {
      reasons.push('Poor living conditions');
    }

    if (state.energy < 20 && state.consecutiveLowEnergyTurns >= 3) {
      reasons.push('Severe overwork');
    }

    if (modifiers.healthRisk && totalDecrease > 0) {
      reasons.push('Disease exposure');
    }

    return reasons;
  }

  /**
   * Get warning message if health is low
   */
  getHealthWarning(currentHealth) {
    if (currentHealth < 20) {
      return {
        level: 'critical',
        message: 'Your health is critically low. You may die soon.',
        icon: '☠️'
      };
    } else if (currentHealth < 40) {
      return {
        level: 'warning',
        message: 'You are quite ill. Seek rest and better nutrition.',
        icon: '🤒'
      };
    } else if (currentHealth < 60) {
      return {
        level: 'caution',
        message: 'You are not feeling well.',
        icon: '😷'
      };
    }
    return null;
  }

  /**
   * Calculate resource regeneration from sleep
   */
  calculateSleepRegeneration(sleepHours) {
    // Base regeneration
    let energyRegen = sleepHours * 8; // 8 energy per hour
    let healthRegen = sleepHours * 2;  // 2 health per hour

    // Bonus for full night's sleep (7+ hours)
    if (sleepHours >= 7) {
      energyRegen += 10;
      healthRegen += 5;
    }

    return {
      energy: Math.min(this.maxEnergy, energyRegen),
      health: Math.min(this.maxHealth, healthRegen),
      wellRested: sleepHours >= 7
    };
  }

  /**
   * Calculate resource changes from eating
   */
  calculateMealEffects(wealth) {
    // Better meals if you can afford them
    if (wealth >= 5) {
      return {
        energy: 20,
        health: 5,
        cost: 3,
        quality: 'good',
        message: 'A nourishing meal restores your vigor.'
      };
    } else if (wealth >= 2) {
      return {
        energy: 15,
        health: 2,
        cost: 2,
        quality: 'adequate',
        message: 'A simple meal helps you feel somewhat better.'
      };
    } else {
      return {
        energy: 10,
        health: 0,
        cost: 1,
        quality: 'poor',
        message: 'Meager rations barely keep you going.'
      };
    }
  }

  /**
   * Track consecutive low energy turns (for overwork tracking)
   */
  updateLowEnergyStreak(currentEnergy, previousStreak) {
    if (currentEnergy < 20) {
      return previousStreak + 1;
    }
    return 0;
  }

  /**
   * Get status description based on resources
   */
  getStatusDescription(health, energy) {
    // Health takes priority
    if (health < 20) return 'critically ill';
    if (health < 40) return 'unwell';

    // Then energy
    if (energy < 10) return 'exhausted';
    if (energy < 25) return 'tired';
    if (energy < 40) return 'weary';

    // Good status
    if (health > 80 && energy > 70) return 'vigorous';
    if (health > 60 && energy > 50) return 'rested';

    return 'adequate';
  }
}

export default new ResourceManager();
