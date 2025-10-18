// EntityAgent - Specialized agent for NPC behavior and selection
// Handles: NPC selection, reactions, relationship tracking

import { scenarioLoader } from '../services/scenarioLoader';
import { entityManager } from '../entities/EntityManager';
import { mapNPCFactionToSystemFaction, FACTIONS, meetsAllReputationRequirements } from '../systems/reputationSystem';
import { generateNameForTemplate, isTemplateName } from '../entities/procedural/nameGenerator';
import { checkNPCConditions, getCriticalNPC, filterAvailableNPCs } from '../systems/npcConditions';
import { calculatePatientFlow } from '../systems/patientFlow';

/**
 * Context-aware entity selection
 * Improves upon random selection by considering game context
 * @param {Object} context - Game context
 * @param {string} context.scenarioId - Current scenario identifier
 * @param {string} context.playerAction - Player's typed action (for intent detection)
 * @param {number} context.turnNumber - Current turn
 * @param {string} context.location - Current location
 * @param {string} context.time - Current time
 * @param {string} context.date - Current date
 * @param {Array} context.recentNPCs - Recently seen NPCs
 * @param {Object} context.reputation - Current reputation (object with overall & factions)
 * @param {number} context.wealth - Current wealth
 * @param {Array} context.activeQuests - Active quests
 * @returns {Object|null} Selected entity or null
 */
export function selectContextAwareEntity(context) {
  const scenarioId = context.scenarioId || '1680-mexico-city';
  const scenario = scenarioLoader.loadScenario(scenarioId);
  const scriptedEvents = scenario.scriptedEvents || [];
  const {
    playerAction = '',
    turnNumber,
    location,
    time,
    date,
    recentNPCs = [],
    reputation,
    wealth
  } = context;

  // Query EntityManager for ALL NPCs (static + auto-generated + LLM-created)
  const allNPCs = [
    ...entityManager.getByType('npc'),
    ...entityManager.getByType('patient')
  ];

  console.log(`[EntityAgent] Selecting from ${allNPCs.length} total entities (static + dynamic + LLM-generated)`);

  // Valid entity types
  const validEntityTypes = ['npc', 'state', 'antagonist', 'patient'];
  let filteredEntities = allNPCs.filter(entity => validEntityTypes.includes(entity.entityType || entity.type));

  // Check for critical NPCs that MUST appear (replaces old scripted events)
  const gameState = {
    date,
    time,
    location,
    reputation,
    turnNumber,
    currentWealth: wealth,
    shopSign: context.shopSign || {}
  };

  const criticalNPCName = getCriticalNPC(gameState);
  if (criticalNPCName) {
    const criticalNPC = allNPCs.find(entity => entity.name === criticalNPCName);
    if (criticalNPC) {
      console.log(`[EntityAgent] CRITICAL NPC required: ${criticalNPCName}`);
      return criticalNPC;
    }
  }

  // CONTEXTUAL GUARDS: Filter out patients when conditions don't support them
  // This prevents patients from appearing during inappropriate times/locations
  const activePatient = context.activePatient;
  const shopSign = context.shopSign || {};

  // Parse time to check business hours
  const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hour = 12; // Default to noon if parsing fails
  if (timeParts) {
    hour = parseInt(timeParts[1]);
    const period = timeParts[3].toUpperCase();
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  }

  const isBusinessHours = hour >= 8 && hour < 18; // 8 AM to 6 PM
  const isAtWorkplace = location && location.toLowerCase().includes('botica');

  // Filter out patients if conditions aren't met
  filteredEntities = filteredEntities.filter(entity => {
    const entityType = entity.entityType || entity.type;

    // Allow non-patients through always
    if (entityType !== 'patient') return true;

    // For patients, check all conditions
    if (activePatient) {
      console.log('[EntityAgent] Patient filtered: Already treating someone');
      return false;
    }

    if (!isAtWorkplace) {
      console.log(`[EntityAgent] Patient filtered: Not at workplace (location: ${location})`);
      return false;
    }

    if (!isBusinessHours) {
      console.log(`[EntityAgent] Patient filtered: Outside business hours (time: ${time}, hour: ${hour})`);
      return false;
    }

    // Shop sign check: If shopSign system is implemented and sign is explicitly not hung
    if (shopSign.hasOwnProperty('hung') && !shopSign.hung) {
      console.log('[EntityAgent] Patient filtered: Shop sign not hung');
      return false;
    }

    // All conditions met - patient can be selected
    return true;
  });

  console.log(`[EntityAgent] After patient guards: ${filteredEntities.length} available entities`);

  // LEGACY: Old scripted events system (commented out, kept for reference)
  // This has been replaced by the condition-based system above
  // for (const event of scriptedEvents) {
  //   const turnsArray = Array.isArray(event.turns) ? event.turns : [event.turns];
  //   const isTurnMatch = turnsArray.includes(turnNumber);
  //   if (!isTurnMatch) continue;
  //   // ... rest of scripted event logic
  // }

  // Filter out NPCs that aren't available yet based on conditions
  filteredEntities = filterAvailableNPCs(filteredEntities, gameState);

  console.log(`[EntityAgent] After condition filtering: ${filteredEntities.length} available entities`);

  // Note: Removed hardcoded turn 1 and turn 5 forcing
  // Entity selection is now organic based on player action and context

  // Context-aware weighting
  const weights = filteredEntities.map(entity => {
    let weight = 1.0;

    // Filter out recently seen NPCs
    if (recentNPCs.includes(entity.name)) {
      weight *= 0.1; // Much less likely to repeat
    }

    // Location-based probability (workplace keywords)
    const workplaceKeywords = ['botica', 'shop', 'apothecary', 'pharmacy', 'store', 'clinic', 'office'];
    const isAtWorkplace = workplaceKeywords.some(keyword =>
      location.toLowerCase().includes(keyword)
    );
    if (isAtWorkplace && (entity.entityType || entity.type) === 'patient') {
      weight *= 2.0; // Patients more likely at workplace
    }

    // Time-based probability
    const hour = parseInt(time.split(':')[0]);
    const isPM = time.includes('PM');
    const actualHour = isPM && hour !== 12 ? hour + 12 : hour;

    // Evening: more likely to get shady characters or debt collectors
    if (actualHour >= 18) {
      if ((entity.entityType || entity.type) === 'antagonist') weight *= 1.5;
      if (entity.tags && entity.tags.includes('debt-collector-primary')) weight *= 2.0;
    }

    // Morning: more likely to get regular patients
    if (actualHour >= 8 && actualHour <= 12) {
      if ((entity.entityType || entity.type) === 'patient') weight *= 1.5;
    }

    // Faction-based reputation effects
    if (reputation && reputation.factions) {
      // Get NPC's faction and corresponding reputation
      const npcFaction = entity.social?.faction;
      if (npcFaction) {
        const systemFaction = mapNPCFactionToSystemFaction(npcFaction);
        if (systemFaction) {
          const factionRep = reputation.factions[systemFaction];

          // High reputation with a faction makes NPCs from that faction more likely to appear
          if (factionRep >= 70) {
            weight *= 1.8; // Very high reputation: much more likely
          } else if (factionRep >= 60) {
            weight *= 1.4; // High reputation: more likely
          } else if (factionRep < 30) {
            weight *= 0.6; // Low reputation: less likely (they avoid you)
          } else if (factionRep < 20) {
            weight *= 0.3; // Very low reputation: much less likely
          }
        }
      }

      // Elite NPCs are attracted by overall reputation
      if (reputation.overall >= 70 && (entity.class === 'Elite' || entity.social?.class === 'noble')) {
        weight *= 1.5;
      }

      // Poor/Common NPCs appear more often when overall reputation is low
      if (reputation.overall < 40 && (entity.class === 'Poor' || entity.social?.class === 'laborer')) {
        weight *= 1.4;
      }
    }

    // Wealth effects
    if (wealth < 20 && (entity.entityType || entity.type) === 'antagonist') {
      weight *= 1.3; // Debt collectors more likely when poor
    }

    // Apply condition-based weights from new system
    const conditionCheck = checkNPCConditions(entity.name, gameState);
    if (conditionCheck.weight !== 1.0) {
      weight *= conditionCheck.weight;
      if (conditionCheck.reason) {
        console.log(`[EntityAgent] Condition modifier for ${entity.name}: ${conditionCheck.weight}x (${conditionCheck.reason})`);
      }
    }

    return weight;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Intent detection: Does player action suggest they want to encounter someone?
  // Note: Conversation continuation detection is handled by AgentOrchestrator (after entity selection)
  // This section only affects NEW encounter probability, not continuation logic
  const encounterKeywords = /answer|open|door|greet|who|visit|see|meet|talk|speak|ask|approach|enter|call|invite|welcome|knock/i;
  const avoidanceKeywords = /sleep|ignore|hide|leave|go away|dismiss|close|lock|refuse/i;

  const actionIndicatesEncounter = encounterKeywords.test(playerAction);
  const actionAvoidEncounter = avoidanceKeywords.test(playerAction);

  // Adjust encounter probability based on player intent
  let encounterChance = 0.3; // Default 30% for ambiguous actions

  if (actionIndicatesEncounter) {
    encounterChance = 0.85; // High chance if player clearly wants interaction
    console.log('[EntityAgent] Player action indicates encounter intent');
  } else if (actionAvoidEncounter) {
    encounterChance = 0.05; // Very low chance if player avoiding
    console.log('[EntityAgent] Player action indicates avoidance');
  }

  if (Math.random() > encounterChance) {
    console.log('[EntityAgent] No encounter this turn (rolled above encounter chance)');
    return null; // No encounter this turn
  }

  let random = Math.random() * totalWeight;
  for (let i = 0; i < filteredEntities.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      const selectedEntity = filteredEntities[i];

      // PHASE 2 CHANGE: No longer generating procedural names
      // Templates are just demographic hints for the LLM
      // LLM creates actual names via primaryNPC field
      if (isTemplateName(selectedEntity.name)) {
        console.log(`[EntityAgent] Selected template entity: ${selectedEntity.name} [this is a generic class descriptor, invent a contextually appropriate full name that fits this type of person when adding to simulation]`);
        console.log(`[EntityAgent] Template will be passed to LLM as demographic hint (no procedural name generated)`);

        // Return template as-is, LLM will create the actual NPC via primaryNPC
        return selectedEntity;
      }

      // LEGACY CODE (DEPRECATED): Old procedural name generation disabled for Phase 2
      // if (isTemplateName(selectedEntity.name)) {
      //   console.log(`[EntityAgent] Generating procedural name...`);
      //   const nameData = generateNameForTemplate(selectedEntity);
      //   const enrichedEntity = { ...selectedEntity, name: nameData.fullName, ... };
      //   const registered = entityManager.register(enrichedEntity);
      //   console.log(`[EntityAgent] ✓ Generated name: ${registered.name}`);
      //   return registered;
      // }

      return selectedEntity;
    }
  }

  return null;
}

/**
 * Get reputation index from emoji (DEPRECATED - kept for backward compatibility)
 * New code should use reputation.overall from reputationSystem
 */
function getReputationIndex(reputationEmoji) {
  const emojis = ['😡', '😠', '😐', '😶', '🙂', '😌', '😏', '😃', '😇', '👑'];
  const index = emojis.indexOf(reputationEmoji);
  return index >= 0 ? index + 1 : 3; // Default to neutral
}

/**
 * Track recently seen NPCs to avoid repetition
 */
export class NPCTracker {
  constructor(maxHistory = 5) {
    this.recentNPCs = [];
    this.maxHistory = maxHistory;
  }

  addNPC(npcName) {
    this.recentNPCs.push(npcName);
    if (this.recentNPCs.length > this.maxHistory) {
      this.recentNPCs.shift();
    }
  }

  getRecentNPCs() {
    return [...this.recentNPCs];
  }

  wasRecentlySeen(npcName) {
    return this.recentNPCs.includes(npcName);
  }

  removeNPC(npcName) {
    const index = this.recentNPCs.indexOf(npcName);
    if (index > -1) {
      this.recentNPCs.splice(index, 1);
    }
  }

  clear() {
    this.recentNPCs = [];
  }
}

/**
 * Entity state persistence
 * Tracks relationships, health status, payments, etc.
 */
export class EntityStateManager {
  constructor() {
    this.entityStates = {};
  }

  /**
   * Get or create entity state
   */
  getState(entityName) {
    if (!this.entityStates[entityName]) {
      this.entityStates[entityName] = {
        firstMet: null,
        lastSeen: null,
        interactionCount: 0,
        relationshipScore: 50, // 0-100, starts neutral
        healthStatus: 'unknown',
        owedPayment: 0,
        owesPayment: 0,
        treatedSuccessfully: false,
        notes: []
      };
    }
    return this.entityStates[entityName];
  }

  /**
   * Update entity state after interaction
   */
  updateState(entityName, updates) {
    const state = this.getState(entityName);
    Object.assign(state, updates);
    state.lastSeen = new Date().toISOString();
    state.interactionCount++;
    return state;
  }

  /**
   * Record successful treatment
   */
  recordTreatment(entityName, successful, notes = '') {
    const state = this.getState(entityName);
    state.treatedSuccessfully = successful;
    state.healthStatus = successful ? 'improved' : 'unchanged';
    if (successful) {
      state.relationshipScore = Math.min(100, state.relationshipScore + 15);
    } else {
      state.relationshipScore = Math.max(0, state.relationshipScore - 10);
    }
    if (notes) {
      state.notes.push({
        date: new Date().toISOString(),
        note: notes
      });
    }
    return state;
  }

  /**
   * Record payment transaction
   */
  recordPayment(entityName, amount, direction = 'received') {
    const state = this.getState(entityName);
    if (direction === 'received') {
      state.owedPayment = Math.max(0, state.owedPayment - amount);
      state.relationshipScore = Math.min(100, state.relationshipScore + 5);
    } else if (direction === 'owed') {
      state.owesPayment += amount;
    }
    return state;
  }

  /**
   * Get all entities Maria has interacted with
   */
  getAllInteractedEntities() {
    return Object.keys(this.entityStates)
      .map(name => ({
        name,
        ...this.entityStates[name]
      }))
      .sort((a, b) => b.interactionCount - a.interactionCount);
  }

  /**
   * Clear all state
   */
  reset() {
    this.entityStates = {};
  }
}

export default {
  selectContextAwareEntity,
  NPCTracker,
  EntityStateManager
};
