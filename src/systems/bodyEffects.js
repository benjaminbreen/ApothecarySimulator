/**
 * Body Effects System
 * Tracks temporary and long-term physical/mental conditions affecting Maria
 * Effects are displayed as badges on the character card and influence narrative
 */

/**
 * Effect Type Definitions
 * Each effect has visual properties and gameplay impacts
 */
export const EFFECT_TYPES = {
  // SUBSTANCE EFFECTS (Psychoactive/Medicinal)
  HALLUCINATING: {
    id: 'hallucinating',
    name: 'Hallucinating',
    emoji: '🌈',
    shortName: 'Visions',
    color: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    category: 'substance',
    defaultDuration: 360, // 6 hours in minutes
    description: 'Experiencing vivid hallucinations and altered perception',
    narrativeFlags: ['visions', 'distorted_perception', 'spiritual'],
    effects: { energyMod: -10, healthMod: 0 }
  },
  SEDATED: {
    id: 'sedated',
    name: 'Sedated',
    emoji: '💤',
    shortName: 'Sedated',
    color: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    category: 'substance',
    defaultDuration: 240, // 4 hours
    description: 'Drowsy and sluggish from sedatives',
    narrativeFlags: ['drowsy', 'slow_reactions', 'pain_relief'],
    effects: { energyMod: -20, healthMod: 0 }
  },
  STIMULATED: {
    id: 'stimulated',
    name: 'Stimulated',
    emoji: '⚡',
    shortName: 'Alert',
    color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    category: 'substance',
    defaultDuration: 180, // 3 hours
    description: 'Heightened alertness and energy from stimulants',
    narrativeFlags: ['alert', 'energetic', 'jittery'],
    effects: { energyMod: 15, healthMod: 0 }
  },
  POISONED: {
    id: 'poisoned',
    name: 'Poisoned',
    emoji: '☠️',
    shortName: 'Poisoned',
    color: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    category: 'medical',
    defaultDuration: 720, // 12 hours
    description: 'Suffering from toxic substance poisoning',
    narrativeFlags: ['nausea', 'weakness', 'vomiting', 'deteriorating'],
    effects: { energyMod: -15, healthMod: -5 } // per hour
  },
  INTOXICATED: {
    id: 'intoxicated',
    name: 'Intoxicated',
    emoji: '🍷',
    shortName: 'Drunk',
    color: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
    glowColor: 'rgba(220, 38, 38, 0.5)',
    category: 'substance',
    defaultDuration: 240, // 4 hours
    description: 'Intoxicated from alcohol',
    narrativeFlags: ['drunk', 'impaired', 'uninhibited'],
    effects: { energyMod: -10, healthMod: 0 }
  },

  // MEDICAL CONDITIONS
  WOUNDED: {
    id: 'wounded',
    name: 'Wounded',
    emoji: '🩸',
    shortName: 'Wounded',
    color: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)',
    glowColor: 'rgba(153, 27, 27, 0.5)',
    category: 'medical',
    defaultDuration: 4320, // 3 days
    description: 'Suffering from physical wounds',
    narrativeFlags: ['injured', 'bleeding', 'pain'],
    effects: { energyMod: -15, healthMod: -20 }
  },
  FEVERISH: {
    id: 'feverish',
    name: 'Feverish',
    emoji: '🔥',
    shortName: 'Fever',
    color: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    glowColor: 'rgba(234, 88, 12, 0.5)',
    category: 'medical',
    defaultDuration: 4320, // 3 days
    description: 'Burning with fever from illness',
    narrativeFlags: ['feverish', 'hot', 'sweating', 'weak'],
    effects: { energyMod: -10, healthMod: -15 }
  },
  INFECTED: {
    id: 'infected',
    name: 'Infected',
    emoji: '🦠',
    shortName: 'Infected',
    color: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)',
    glowColor: 'rgba(6, 95, 70, 0.5)',
    category: 'medical',
    defaultDuration: 7200, // 5 days
    description: 'Wound infection spreading through the body',
    narrativeFlags: ['infected', 'septic', 'deteriorating'],
    effects: { energyMod: -20, healthMod: -10 } // per day
  },
  PLAGUE: {
    id: 'plague',
    name: 'Plague',
    emoji: '💀',
    shortName: 'Plague',
    color: 'linear-gradient(135deg, #18181b 0%, #000000 100%)',
    glowColor: 'rgba(24, 24, 27, 0.7)',
    category: 'medical',
    defaultDuration: 14400, // 10 days
    description: 'Afflicted with bubonic plague',
    narrativeFlags: ['plague', 'dying', 'contagious', 'buboes'],
    effects: { energyMod: -30, healthMod: -20 } // per day
  },

  // POSITIVE EFFECTS
  BLESSED: {
    id: 'blessed',
    name: 'Blessed',
    emoji: '✨',
    shortName: 'Blessed',
    color: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    category: 'positive',
    defaultDuration: 1440, // 24 hours
    description: 'Blessed by divine grace',
    narrativeFlags: ['blessed', 'holy', 'protected'],
    effects: { energyMod: 0, healthMod: 5 }
  },
  VIGOROUS: {
    id: 'vigorous',
    name: 'Vigorous',
    emoji: '💪',
    shortName: 'Vigorous',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    category: 'positive',
    defaultDuration: 480, // 8 hours
    description: 'Feeling strong and energetic',
    narrativeFlags: ['vigorous', 'strong', 'energetic'],
    effects: { energyMod: 20, healthMod: 0 }
  },
  BALANCED: {
    id: 'balanced',
    name: 'Balanced',
    emoji: '⚖️',
    shortName: 'Balanced',
    color: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    glowColor: 'rgba(96, 165, 250, 0.5)',
    category: 'positive',
    defaultDuration: 2880, // 48 hours
    description: 'Humors perfectly balanced',
    narrativeFlags: ['balanced', 'harmonious', 'optimal'],
    effects: { energyMod: 5, healthMod: 5 }
  },
  INOCULATED: {
    id: 'inoculated',
    name: 'Inoculated',
    emoji: '🛡️',
    shortName: 'Protected',
    color: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    glowColor: 'rgba(148, 163, 184, 0.5)',
    category: 'positive',
    defaultDuration: 43200, // 30 days
    description: 'Protected from disease',
    narrativeFlags: ['protected', 'immune', 'inoculated'],
    effects: { energyMod: 0, healthMod: 0 }
  },

  // DEBILITATING EFFECTS
  CHILLED: {
    id: 'chilled',
    name: 'Chilled',
    emoji: '🥶',
    shortName: 'Cold',
    color: 'linear-gradient(135deg, #bae6fd 0%, #0ea5e9 100%)',
    glowColor: 'rgba(14, 165, 233, 0.5)',
    category: 'debilitating',
    defaultDuration: 360, // 6 hours
    description: 'Shivering from cold exposure',
    narrativeFlags: ['cold', 'shivering', 'chilled'],
    effects: { energyMod: -10, healthMod: 0 }
  },
  OVERHEATED: {
    id: 'overheated',
    name: 'Overheated',
    emoji: '🥵',
    shortName: 'Hot',
    color: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
    glowColor: 'rgba(248, 113, 113, 0.5)',
    category: 'debilitating',
    defaultDuration: 240, // 4 hours
    description: 'Suffering from extreme heat',
    narrativeFlags: ['overheated', 'sweating', 'dehydrated'],
    effects: { energyMod: -15, healthMod: 0 }
  },
  EXHAUSTED: {
    id: 'exhausted',
    name: 'Exhausted',
    emoji: '😴',
    shortName: 'Exhausted',
    color: 'linear-gradient(135deg, #9ca3af 0%, #4b5563 100%)',
    glowColor: 'rgba(156, 163, 175, 0.5)',
    category: 'debilitating',
    defaultDuration: 480, // Until rested (8 hours default)
    description: 'Completely drained of energy',
    narrativeFlags: ['exhausted', 'depleted', 'collapsing'],
    effects: { energyMod: -30, healthMod: 0 }
  },
  NAUSEATED: {
    id: 'nauseated',
    name: 'Nauseated',
    emoji: '🤮',
    shortName: 'Sick',
    color: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)',
    glowColor: 'rgba(134, 239, 172, 0.5)',
    category: 'debilitating',
    defaultDuration: 480, // 8 hours
    description: 'Nauseous and unable to keep food down',
    narrativeFlags: ['nauseated', 'vomiting', 'sick_stomach'],
    effects: { energyMod: -10, healthMod: 0 }
  },
  BLOODLET: {
    id: 'bloodlet',
    name: 'Bloodlet',
    emoji: '🩸',
    shortName: 'Bled',
    color: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
    glowColor: 'rgba(127, 29, 29, 0.5)',
    category: 'medical',
    defaultDuration: 2880, // 48 hours
    description: 'Weakened from bloodletting',
    narrativeFlags: ['bloodlet', 'weakened', 'balanced_humors'],
    effects: { energyMod: -10, healthMod: -10 }
  },
  CONCUSSED: {
    id: 'concussed',
    name: 'Concussed',
    emoji: '😵',
    shortName: 'Dazed',
    color: 'linear-gradient(135deg, #a78bfa 0%, #6b21a8 100%)',
    glowColor: 'rgba(167, 139, 250, 0.5)',
    category: 'medical',
    defaultDuration: 4320, // 3 days
    description: 'Confused and disoriented from head injury',
    narrativeFlags: ['concussed', 'confused', 'dizzy'],
    effects: { energyMod: -15, healthMod: 0 }
  },
  TOOTHACHE: {
    id: 'toothache',
    name: 'Toothache',
    emoji: '🦷',
    shortName: 'Pain',
    color: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    category: 'debilitating',
    defaultDuration: 10080, // 7 days (until treated)
    description: 'Constant throbbing dental pain',
    narrativeFlags: ['toothache', 'pain', 'distracted'],
    effects: { energyMod: -10, healthMod: 0 }
  }
};

/**
 * Item to Effect Mappings
 * Maps inventory item names to effects they cause when consumed
 */
export const ITEM_EFFECT_MAP = {
  // Psychoactive substances
  'Peyote': { effect: 'hallucinating', duration: 360, chance: 1.0 },
  'Datura': { effect: 'hallucinating', duration: 480, chance: 1.0 },
  'Psilocybin Mushrooms': { effect: 'hallucinating', duration: 300, chance: 1.0 },

  // Sedatives
  'Opium': { effect: 'sedated', duration: 480, chance: 1.0 },
  'Mandrake': { effect: 'sedated', duration: 240, chance: 1.0 },
  'Poppy Extract': { effect: 'sedated', duration: 360, chance: 1.0 },
  'Laudanum': { effect: 'sedated', duration: 300, chance: 1.0 },

  // Stimulants
  'Coca Leaves': { effect: 'stimulated', duration: 180, chance: 1.0 },
  'Coffee': { effect: 'stimulated', duration: 120, chance: 0.7 },
  'Guarana': { effect: 'stimulated', duration: 240, chance: 1.0 },

  // Poisons
  'Mercury': { effect: 'poisoned', duration: 1440, chance: 1.0 },
  'Quicksilver': { effect: 'poisoned', duration: 1440, chance: 1.0 },
  'Arsenic': { effect: 'poisoned', duration: 720, chance: 1.0 },
  'Lead': { effect: 'poisoned', duration: 2880, chance: 1.0 },
  'Belladonna': { effect: 'poisoned', duration: 360, chance: 1.0 },
  'Nightshade': { effect: 'poisoned', duration: 360, chance: 1.0 },
  'Hemlock': { effect: 'poisoned', duration: 240, chance: 1.0 },

  // Alcohol
  'Wine': { effect: 'intoxicated', duration: 240, chance: 0.8 },
  'Pulque': { effect: 'intoxicated', duration: 180, chance: 0.7 },
  'Brandy': { effect: 'intoxicated', duration: 300, chance: 0.9 },
  'Rum': { effect: 'intoxicated', duration: 240, chance: 0.9 },

  // Tonics (positive effects)
  'Vigor Tonic': { effect: 'vigorous', duration: 480, chance: 1.0 },
  'Strengthening Tonic': { effect: 'vigorous', duration: 360, chance: 0.9 },
  'Holy Water': { effect: 'blessed', duration: 1440, chance: 0.6 }
};

/**
 * Apply an effect to the active effects list
 * @param {Array} activeEffects - Current active effects
 * @param {string} effectId - Effect type ID
 * @param {number} durationMinutes - Duration in game minutes
 * @param {string} source - What caused this effect
 * @param {Object} gameTime - Current game time for tracking { time, date }
 * @returns {Array} Updated active effects array
 */
export function applyEffect(activeEffects = [], effectId, durationMinutes = null, source = '', gameTime = { time: 'Unknown', date: 'Unknown' }) {
  const effectType = EFFECT_TYPES[effectId.toUpperCase()];
  if (!effectType) {
    console.warn(`[BodyEffects] Unknown effect type: ${effectId}`);
    return activeEffects;
  }

  const duration = durationMinutes !== null ? durationMinutes : effectType.defaultDuration;

  // Check if effect already exists (refresh duration instead of stacking)
  const existingIndex = activeEffects.findIndex(e => e.type === effectType.id);

  const newEffect = {
    id: `${effectType.id}_${Date.now()}`,
    type: effectType.id,
    name: effectType.name,
    emoji: effectType.emoji,
    shortName: effectType.shortName,
    color: effectType.color,
    glowColor: effectType.glowColor,
    category: effectType.category,
    startTime: gameTime, // Game time object { time, date }
    duration: duration,
    remainingMinutes: duration,
    source: source,
    description: effectType.description,
    narrativeFlags: effectType.narrativeFlags,
    effects: effectType.effects
  };

  if (existingIndex !== -1) {
    // Replace existing effect (refresh duration)
    const updated = [...activeEffects];
    updated[existingIndex] = newEffect;
    console.log(`[BodyEffects] Refreshed effect: ${effectType.name} (${duration} min)`);
    return updated;
  } else {
    // Add new effect
    console.log(`[BodyEffects] Applied new effect: ${effectType.name} (${duration} min)`);
    return [...activeEffects, newEffect];
  }
}

/**
 * Remove an effect by ID
 * @param {Array} activeEffects - Current active effects
 * @param {string} effectId - Unique effect ID
 * @returns {Array} Updated active effects array
 */
export function removeEffect(activeEffects = [], effectId) {
  const filtered = activeEffects.filter(e => e.id !== effectId);
  if (filtered.length < activeEffects.length) {
    console.log(`[BodyEffects] Removed effect: ${effectId}`);
  }
  return filtered;
}

/**
 * Update effect durations based on time passed
 * @param {Array} activeEffects - Current active effects
 * @param {number} minutesPassed - Minutes elapsed since last update
 * @returns {Array} Updated active effects with expired ones removed
 */
export function updateEffectDurations(activeEffects = [], minutesPassed = 0) {
  if (minutesPassed === 0 || !activeEffects || activeEffects.length === 0) {
    return activeEffects;
  }

  const updated = activeEffects
    .map(effect => ({
      ...effect,
      remainingMinutes: Math.max(0, effect.remainingMinutes - minutesPassed)
    }))
    .filter(effect => effect.remainingMinutes > 0);

  const expiredCount = activeEffects.length - updated.length;
  if (expiredCount > 0) {
    console.log(`[BodyEffects] ${expiredCount} effect(s) expired`);
  }

  return updated;
}

/**
 * Get effects from consuming an item
 * @param {string} itemName - Name of consumed item
 * @returns {Object|null} Effect data or null
 */
export function getEffectFromItem(itemName) {
  return ITEM_EFFECT_MAP[itemName] || null;
}

/**
 * Calculate total stat modifiers from all active effects
 * @param {Array} activeEffects - Current active effects
 * @returns {Object} { energyMod, healthMod }
 */
export function calculateEffectModifiers(activeEffects = []) {
  return activeEffects.reduce((totals, effect) => ({
    energyMod: totals.energyMod + (effect.effects.energyMod || 0),
    healthMod: totals.healthMod + (effect.effects.healthMod || 0)
  }), { energyMod: 0, healthMod: 0 });
}

/**
 * Get narrative flags from all active effects
 * @param {Array} activeEffects - Current active effects
 * @returns {Array} All narrative flag strings
 */
export function getNarrativeFlags(activeEffects = []) {
  return activeEffects.flatMap(effect => effect.narrativeFlags || []);
}

/**
 * Format duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted string like "2h 30m" or "45m"
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.floor(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default {
  EFFECT_TYPES,
  ITEM_EFFECT_MAP,
  applyEffect,
  removeEffect,
  updateEffectDurations,
  getEffectFromItem,
  calculateEffectModifiers,
  getNarrativeFlags,
  formatDuration
};
