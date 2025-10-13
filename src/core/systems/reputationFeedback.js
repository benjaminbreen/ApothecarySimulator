/**
 * Reputation Feedback System
 *
 * Connects individual NPC relationships with faction reputation:
 * - When relationship with an NPC changes, their faction's opinion is affected
 * - When faction reputation changes significantly, all NPCs in that faction are affected
 * - Changes are weighted by NPC importance/status
 *
 * @module reputationFeedback
 */

import { relationshipGraph } from '../entities/RelationshipGraph';
import { entityManager } from '../entities/EntityManager';
import { FACTIONS } from './reputationSystem';
import { getInquisitionProtection, getNegativeReputationMultiplier } from './professionAbilities';

/**
 * Importance weights for different NPC social classes
 * Higher class = more impact on faction reputation
 */
const IMPORTANCE_WEIGHTS = {
  nobility: 3.0,      // Nobles, high officials
  elite: 2.5,         // Wealthy merchants, guild masters
  professional: 2.0,  // Doctors, lawyers, clergy
  merchant: 1.5,      // Shop owners, traders
  artisan: 1.2,       // Craftspeople, skilled workers
  common: 1.0,        // Laborers, servants
  outcast: 0.8        // Marginalized groups
};

/**
 * Base conversion rate: relationship delta → reputation delta
 * A +10 relationship change = +2 reputation change (base)
 */
const BASE_CONVERSION_RATE = 0.2;

/**
 * Minimum relationship change to trigger reputation feedback
 */
const MIN_RELATIONSHIP_DELTA = 5;

/**
 * Maximum reputation change per interaction
 */
const MAX_REPUTATION_DELTA = 5;

/**
 * Get NPC importance weight based on social class
 * @param {Object} npc - NPC entity
 * @returns {number} Weight multiplier (0.8-3.0)
 */
function getNPCImportance(npc) {
  const socialClass = npc.social?.class?.toLowerCase() || 'common';
  return IMPORTANCE_WEIGHTS[socialClass] || 1.0;
}

/**
 * Apply relationship change to faction reputation
 * Called when player's relationship with an NPC changes
 *
 * @param {string} npcId - NPC entity ID
 * @param {number} relationshipDelta - Change in relationship value (-100 to +100)
 * @param {string} reason - Why the relationship changed
 * @param {Object} currentReputation - Current reputation object
 * @param {Object} context - Optional context {profession, playerLevel, itemUsed}
 * @returns {Object|null} Updated reputation object, or null if no change
 */
export function applyRelationshipToReputation(npcId, relationshipDelta, reason, currentReputation, context = {}) {
  // Skip if delta too small
  if (Math.abs(relationshipDelta) < MIN_RELATIONSHIP_DELTA) {
    return null;
  }

  // Get NPC data
  const npc = entityManager.get(npcId);

  if (!npc || !npc.social?.faction) {
    console.log('[ReputationFeedback] NPC has no faction:', npcId);
    return null;
  }

  const factionId = npc.social.faction;

  // Calculate reputation change
  const importance = getNPCImportance(npc);
  let reputationDelta = relationshipDelta * BASE_CONVERSION_RATE * importance;

  // Cap the change
  reputationDelta = Math.max(-MAX_REPUTATION_DELTA, Math.min(MAX_REPUTATION_DELTA, reputationDelta));
  reputationDelta = Math.round(reputationDelta);

  // Apply Poisoner L15+ ability: Shadow Contacts (reduces ALL negative reputation loss)
  if (reputationDelta < 0) {
    const negativeMultiplier = getNegativeReputationMultiplier(
      context.profession,
      context.playerLevel
    );

    if (negativeMultiplier < 1.0) {
      const originalDelta = reputationDelta;
      reputationDelta = Math.ceil(reputationDelta * negativeMultiplier);

      if (reputationDelta !== originalDelta) {
        console.log(`[Poisoner] Shadow Contacts reduced reputation loss: ${originalDelta} → ${reputationDelta} (${Math.round((1 - negativeMultiplier) * 100)}% reduction)`);
      }
    }
  }

  // Apply Poisoner L15/L20 ability: Shadow Worker (Inquisition protection)
  if (factionId === 'inquisition' && reputationDelta < 0) {
    const protection = getInquisitionProtection(
      context.profession,
      context.playerLevel,
      context.itemUsed
    );

    if (protection > 0) {
      const originalDelta = reputationDelta;
      reputationDelta = Math.ceil(reputationDelta * (1 - protection));

      if (reputationDelta !== originalDelta) {
        console.log(`[Poisoner] Shadow Worker protected Inquisition reputation: ${originalDelta} → ${reputationDelta} (${Math.round(protection * 100)}% reduction)`);
      }
    }
  }

  // Skip if rounded to 0
  if (reputationDelta === 0) {
    return null;
  }

  // Apply to reputation
  const newReputation = {
    ...currentReputation,
    factions: {
      ...currentReputation.factions,
      [factionId]: Math.max(0, Math.min(100, currentReputation.factions[factionId] + reputationDelta))
    }
  };

  // Recalculate overall reputation (average of all factions)
  const factionValues = Object.values(newReputation.factions);
  newReputation.overall = Math.round(
    factionValues.reduce((sum, val) => sum + val, 0) / factionValues.length
  );

  console.log(`[ReputationFeedback] ${npc.name} (${factionId}): relationship ${relationshipDelta > 0 ? '+' : ''}${relationshipDelta} → reputation ${reputationDelta > 0 ? '+' : ''}${reputationDelta}`);

  return newReputation;
}

/**
 * Apply faction reputation change to all NPCs in that faction
 * Called when faction reputation changes significantly (e.g., from a major quest)
 *
 * @param {string} factionId - Faction ID
 * @param {number} reputationDelta - Change in faction reputation
 * @param {string} reason - Why the reputation changed
 */
export function applyReputationToRelationships(factionId, reputationDelta, reason) {
  // Skip if delta too small
  if (Math.abs(reputationDelta) < 5) {
    return;
  }

  const allNPCs = entityManager.getAll();

  // Filter NPCs by faction
  const factionNPCs = allNPCs.filter(npc => npc.social?.faction === factionId);

  if (factionNPCs.length === 0) {
    console.log('[ReputationFeedback] No NPCs found for faction:', factionId);
    return;
  }

  // Convert reputation delta to relationship delta
  // Smaller conversion rate for this direction (reputation → relationship)
  const relationshipDelta = Math.round(reputationDelta * 0.5);

  console.log(`[ReputationFeedback] Faction ${factionId} reputation ${reputationDelta > 0 ? '+' : ''}${reputationDelta} → updating ${factionNPCs.length} NPCs`);

  // Update all NPCs in the faction
  factionNPCs.forEach(npc => {
    // Use relationship graph to update
    relationshipGraph.updateRelationship(
      npc.id,
      'player',  // Assuming 'player' is the player entity ID
      relationshipDelta,
      `Faction reputation change: ${reason}`
    );
  });
}

/**
 * Batch process multiple relationship changes
 * Useful for end-of-turn or after major events
 *
 * @param {Array} changes - Array of {npcId, delta, reason}
 * @param {Object} currentReputation - Current reputation object
 * @returns {Object} Updated reputation object
 */
export function batchProcessRelationshipChanges(changes, currentReputation) {
  let reputation = currentReputation;

  changes.forEach(({ npcId, delta, reason }) => {
    const newRep = applyRelationshipToReputation(npcId, delta, reason, reputation);
    if (newRep) {
      reputation = newRep;
    }
  });

  return reputation;
}

/**
 * Get feedback preview (for UI display)
 * Shows what reputation change would occur from a relationship change
 *
 * @param {string} npcId - NPC entity ID
 * @param {number} relationshipDelta - Proposed relationship change
 * @returns {Object|null} {factionId, factionName, reputationDelta} or null
 */
export function getReputationFeedbackPreview(npcId, relationshipDelta) {
  if (Math.abs(relationshipDelta) < MIN_RELATIONSHIP_DELTA) {
    return null;
  }

  const npc = entityManager.get(npcId);

  if (!npc || !npc.social?.faction) {
    return null;
  }

  const factionId = npc.social.faction;
  const importance = getNPCImportance(npc);
  let reputationDelta = relationshipDelta * BASE_CONVERSION_RATE * importance;
  reputationDelta = Math.max(-MAX_REPUTATION_DELTA, Math.min(MAX_REPUTATION_DELTA, reputationDelta));
  reputationDelta = Math.round(reputationDelta);

  if (reputationDelta === 0) {
    return null;
  }

  return {
    factionId,
    factionName: npc.social.factionName || factionId,
    reputationDelta,
    importance
  };
}

export default {
  applyRelationshipToReputation,
  applyReputationToRelationships,
  batchProcessRelationshipChanges,
  getReputationFeedbackPreview
};
