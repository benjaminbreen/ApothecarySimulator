/**
 * Reputation System
 *
 * Manages multi-dimensional reputation across 6 key factions in 1680 Mexico City.
 * Integrates with NPC relationships and provides gameplay impact.
 *
 * ## Usage Example
 *
 * ```javascript
 * import { handleNPCInteraction } from './reputationSystem';
 * import { relationshipGraph } from './RelationshipGraph';
 * import { useReputation } from '../hooks/useReputation';
 *
 * function MyComponent() {
 *   const { reputation, setReputation } = useReputation();
 *
 *   const handleTreatPatient = (npc, success) => {
 *     handleNPCInteraction({
 *       reputation,
 *       setReputation,
 *       relationshipGraph,
 *       npc,
 *       relationshipDelta: success ? 15 : -10,
 *       reason: success ? 'Successful treatment' : 'Failed treatment',
 *       applySpillover: true // Important NPCs affect allied factions
 *     });
 *   };
 * }
 * ```
 *
 * ## Faction Integration with NPCs
 *
 * NPCs must have a `social.faction` field that maps to system factions:
 * - 'elite', 'criollo', 'noble' → ELITE
 * - 'church', 'clergy', 'priest' → CHURCH
 * - 'guild', 'artisan', 'apothecary' → GUILD
 * - 'merchant', 'trader' → MERCHANTS
 * - 'indigenous', 'indio', 'nahua' → INDIGENOUS
 * - 'common', 'laborer', 'peasant' → COMMON_FOLK
 *
 * ## Spillover Effects
 *
 * When `applySpillover: true`, allied factions receive 30% of the reputation change:
 * - ELITE ↔ CHURCH, MERCHANTS
 * - MERCHANTS ↔ ELITE, GUILD
 * - GUILD ↔ MERCHANTS, COMMON_FOLK
 * - COMMON_FOLK ↔ GUILD, INDIGENOUS
 * - INDIGENOUS ↔ COMMON_FOLK
 */

/**
 * Faction definitions
 */
export const FACTIONS = {
  ELITE: 'elite',
  COMMON_FOLK: 'commonFolk',
  CHURCH: 'church',
  INDIGENOUS: 'indigenous',
  GUILD: 'guild',
  MERCHANTS: 'merchants'
};

/**
 * Faction metadata
 */
export const FACTION_INFO = {
  [FACTIONS.ELITE]: {
    name: 'Elite Society',
    icon: '🏛️',
    description: 'Criollos and Spanish nobility',
    color: '#8b5cf6' // Purple
  },
  [FACTIONS.COMMON_FOLK]: {
    name: 'Common Folk',
    icon: '👥',
    description: 'Mestizos, workers, and everyday patients',
    color: '#10b981' // Green
  },
  [FACTIONS.CHURCH]: {
    name: 'The Church',
    icon: '⛪',
    description: 'Clergy and religious authorities',
    color: '#f59e0b' // Amber
  },
  [FACTIONS.INDIGENOUS]: {
    name: 'Indigenous',
    icon: '🌿',
    description: 'Native healers and patients',
    color: '#059669' // Emerald
  },
  [FACTIONS.GUILD]: {
    name: 'Medical Guild',
    icon: '⚕️',
    description: 'Physicians and licensed apothecaries',
    color: '#ef4444' // Red
  },
  [FACTIONS.MERCHANTS]: {
    name: 'Merchants',
    icon: '🏪',
    description: 'Shopkeepers and traders',
    color: '#3b82f6' // Blue
  }
};

/**
 * Initial reputation state
 */
export const INITIAL_REPUTATION = {
  overall: 50,
  factions: {
    [FACTIONS.ELITE]: 40,
    [FACTIONS.COMMON_FOLK]: 60,
    [FACTIONS.CHURCH]: 50,
    [FACTIONS.INDIGENOUS]: 30,
    [FACTIONS.GUILD]: 35,
    [FACTIONS.MERCHANTS]: 55
  }
};

/**
 * Get reputation tier based on score
 */
export function getReputationTier(score) {
  if (score >= 90) return { tier: 'Legendary', emoji: '👑' };
  if (score >= 80) return { tier: 'Renowned', emoji: '😇' };
  if (score >= 70) return { tier: 'Respected', emoji: '😃' };
  if (score >= 60) return { tier: 'Known', emoji: '😏' };
  if (score >= 50) return { tier: 'Neutral', emoji: '😌' };
  if (score >= 40) return { tier: 'Obscure', emoji: '😐' };
  if (score >= 30) return { tier: 'Suspect', emoji: '😶' };
  if (score >= 20) return { tier: 'Disreputable', emoji: '😠' };
  return { tier: 'Infamous', emoji: '😡' };
}

/**
 * Get faction standing description
 */
export function getFactionStanding(score) {
  if (score >= 90) return 'Revered';
  if (score >= 80) return 'Allied';
  if (score >= 70) return 'Trusted';
  if (score >= 60) return 'Friendly';
  if (score >= 50) return 'Warm';
  if (score >= 45) return 'Cordial';
  if (score >= 40) return 'Neutral';
  if (score >= 30) return 'Dismissive';
  if (score >= 20) return 'Unfriendly';
  if (score >= 10) return 'Cold';
  return 'Hostile';
}

/**
 * Update faction reputation
 * @param {Object} reputation - Current reputation state
 * @param {string} faction - Faction ID
 * @param {number} delta - Change amount
 * @param {string} reason - Reason for change
 * @returns {Object} Updated reputation state
 */
export function updateFactionReputation(reputation, faction, delta, reason = '') {
  if (!FACTIONS[faction.toUpperCase()]) {
    console.warn(`[Reputation] Unknown faction: ${faction}`);
    return reputation;
  }

  const newFactionScore = Math.max(0, Math.min(100, reputation.factions[faction] + delta));

  // Calculate new overall as average of all factions
  const factionScores = Object.values({
    ...reputation.factions,
    [faction]: newFactionScore
  });
  const newOverall = Math.round(factionScores.reduce((a, b) => a + b, 0) / factionScores.length);

  console.log(`[Reputation] ${FACTION_INFO[faction].name}: ${reputation.factions[faction]} → ${newFactionScore} (${delta > 0 ? '+' : ''}${delta}) - ${reason}`);

  return {
    overall: newOverall,
    factions: {
      ...reputation.factions,
      [faction]: newFactionScore
    }
  };
}

/**
 * Calculate price modifier based on merchant reputation
 * @param {number} merchantReputation - Merchant faction score (0-100)
 * @returns {number} Price multiplier (0.5 to 1.5)
 */
export function calculatePriceModifier(merchantReputation) {
  // At 0 rep: 1.5x markup
  // At 50 rep: 1.0x normal
  // At 100 rep: 0.5x discount
  return 1.5 - (merchantReputation / 100);
}

/**
 * Check if player meets reputation requirement
 * @param {Object} reputation - Current reputation state
 * @param {string} faction - Faction to check ('overall' for overall reputation)
 * @param {number} threshold - Required score
 * @returns {boolean}
 */
export function meetsReputationRequirement(reputation, faction, threshold) {
  if (!reputation) return true; // No reputation system active

  if (faction === 'overall') {
    return reputation.overall >= threshold;
  }

  return reputation.factions[faction] >= threshold;
}

/**
 * Check multiple reputation requirements (AND logic)
 * Used for quests/events that require multiple faction standings
 * @param {Object} reputation - Current reputation state
 * @param {Array} requirements - Array of {faction, threshold} objects
 * @returns {boolean}
 */
export function meetsAllReputationRequirements(reputation, requirements) {
  if (!requirements || requirements.length === 0) return true;
  if (!reputation) return false;

  return requirements.every(req =>
    meetsReputationRequirement(reputation, req.faction, req.threshold)
  );
}

/**
 * Map NPC faction strings to system factions
 * Handles various naming conventions from entity data
 * @param {string} npcFaction - Faction from NPC's social.faction field
 * @returns {string|null} System faction ID or null
 */
export function mapNPCFactionToSystemFaction(npcFaction) {
  if (!npcFaction) return null;

  const factionLower = npcFaction.toLowerCase();

  // Direct matches
  if (factionLower.includes('elite') || factionLower.includes('criollo') || factionLower.includes('noble')) {
    return FACTIONS.ELITE;
  }
  if (factionLower.includes('church') || factionLower.includes('clergy') || factionLower.includes('priest')) {
    return FACTIONS.CHURCH;
  }
  if (factionLower.includes('guild') || factionLower.includes('artisan') || factionLower.includes('apothecary')) {
    return FACTIONS.GUILD;
  }
  if (factionLower.includes('merchant') || factionLower.includes('trader')) {
    return FACTIONS.MERCHANTS;
  }
  if (factionLower.includes('indigenous') || factionLower.includes('indio') || factionLower.includes('nahua')) {
    return FACTIONS.INDIGENOUS;
  }
  if (factionLower.includes('common') || factionLower.includes('laborer') || factionLower.includes('peasant')) {
    return FACTIONS.COMMON_FOLK;
  }

  return null;
}

/**
 * Update faction reputation based on NPC interaction
 * Use this when player interacts with an NPC to update both relationship AND faction rep
 *
 * @param {Object} reputation - Current reputation state
 * @param {Object} npc - NPC entity with social.faction field
 * @param {number} relationshipDelta - Change in relationship value (-100 to +100)
 * @param {string} reason - Reason for change
 * @returns {Object} Updated reputation
 */
export function updateFactionFromNPCInteraction(reputation, npc, relationshipDelta, reason = '') {
  // Get NPC's faction
  const npcFaction = npc?.social?.faction;
  if (!npcFaction) {
    console.log('[Reputation] NPC has no faction, skipping faction update');
    return reputation;
  }

  // Map to system faction
  const systemFaction = mapNPCFactionToSystemFaction(npcFaction);
  if (!systemFaction) {
    console.log('[Reputation] Could not map NPC faction to system faction:', npcFaction);
    return reputation;
  }

  // Scale relationship delta to faction reputation change
  // Individual relationships are -100 to +100, but we want smaller faction changes
  // A +10 relationship change should result in ~+2 faction change
  const factionDelta = Math.round(relationshipDelta * 0.2);

  console.log(`[Reputation] ${reason}: ${npc.name} (${FACTION_INFO[systemFaction].name}) ${factionDelta > 0 ? '+' : ''}${factionDelta}`);

  return updateFactionReputation(reputation, systemFaction, factionDelta, reason);
}

/**
 * Get spillover factions (other factions affected by an action)
 * For example, upsetting the Church might also upset the Elite
 *
 * @param {string} primaryFaction - The main affected faction
 * @param {number} delta - The change amount
 * @returns {Array} Array of {faction, delta} objects
 */
export function getSpilloverEffects(primaryFaction, delta) {
  const spillovers = [];
  const spilloverFactor = 0.3; // 30% of original change

  // Define faction relationships (allies get positive spillover)
  const allies = {
    [FACTIONS.ELITE]: [FACTIONS.CHURCH, FACTIONS.MERCHANTS],
    [FACTIONS.CHURCH]: [FACTIONS.ELITE],
    [FACTIONS.MERCHANTS]: [FACTIONS.ELITE, FACTIONS.GUILD],
    [FACTIONS.GUILD]: [FACTIONS.MERCHANTS, FACTIONS.COMMON_FOLK],
    [FACTIONS.COMMON_FOLK]: [FACTIONS.GUILD, FACTIONS.INDIGENOUS],
    [FACTIONS.INDIGENOUS]: [FACTIONS.COMMON_FOLK]
  };

  // Get allied factions
  const alliedFactions = allies[primaryFaction] || [];

  // Add spillover effects to allies (same sign as primary change)
  alliedFactions.forEach(faction => {
    spillovers.push({
      faction,
      delta: Math.round(delta * spilloverFactor)
    });
  });

  return spillovers;
}

/**
 * Complete NPC interaction handler
 * Updates BOTH individual NPC relationship AND faction reputation
 * Use this as the main entry point for NPC interactions
 *
 * @param {Object} params - Parameters object
 * @param {Object} params.reputation - Current reputation state
 * @param {Function} params.setReputation - Reputation state setter
 * @param {Object} params.relationshipGraph - RelationshipGraph instance
 * @param {Object} params.npc - NPC entity
 * @param {number} params.relationshipDelta - Change in relationship (-100 to +100)
 * @param {string} params.reason - Reason for change
 * @param {boolean} params.applySpillover - Whether to apply spillover effects (default: false)
 * @returns {Object} Updated reputation
 */
export function handleNPCInteraction({
  reputation,
  setReputation,
  relationshipGraph,
  npc,
  relationshipDelta,
  reason = '',
  applySpillover = false
}) {
  // 1. Update individual relationship via RelationshipGraph
  if (relationshipGraph && npc.id) {
    relationshipGraph.updateRelationship('player', npc.id, relationshipDelta, reason);
    console.log(`[Relationship] Updated relationship with ${npc.name}: ${relationshipDelta > 0 ? '+' : ''}${relationshipDelta}`);
  }

  // 2. Update faction reputation
  let newReputation = updateFactionFromNPCInteraction(reputation, npc, relationshipDelta, reason);

  // 3. Apply spillover effects if enabled
  if (applySpillover) {
    const npcFaction = npc?.social?.faction;
    const systemFaction = mapNPCFactionToSystemFaction(npcFaction);

    if (systemFaction) {
      const factionDelta = Math.round(relationshipDelta * 0.2);
      const spillovers = getSpilloverEffects(systemFaction, factionDelta);

      spillovers.forEach(({ faction, delta }) => {
        newReputation = updateFactionReputation(newReputation, faction, delta, `Spillover from ${reason}`);
      });
    }
  }

  // 4. Update reputation state if setter provided
  if (setReputation) {
    setReputation(newReputation);
  }

  return newReputation;
}
