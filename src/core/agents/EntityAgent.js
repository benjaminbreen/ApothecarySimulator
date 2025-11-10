// EntityAgent - Specialized agent for NPC behavior and selection
// Handles: NPC selection, reactions, relationship tracking

import { scenarioLoader } from '../services/scenarioLoader';
import { entityManager } from '../entities/EntityManager';
import { mapNPCFactionToSystemFaction, FACTIONS, meetsAllReputationRequirements } from '../systems/reputationSystem';
import { generateNameForTemplate, isTemplateName } from '../entities/procedural/nameGenerator';
import { checkNPCConditions, getCriticalNPC, filterAvailableNPCs } from '../systems/npcConditions';
import { calculatePatientFlow } from '../systems/patientFlow';
import { calculateDaysBetween } from '../../features/medical/utils/followUpUtils';
import { parseHourFromTimeString } from '../../utils/timeUtils';

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
    npcDepartedLastTurn = false,
    reputation,
    wealth,
    conversationLock = null,
    signJustHung = false // TRIGGER: Force patient spawn when sign just hung
  } = context;

  // ===== TEST MODE: Deterministic entity selection for automated testing =====
  // Detects [TEST:type] keywords in playerAction and returns predefined entities
  // This bypasses all probability/pacing logic for reliable test assertions
  const testMatch = playerAction.match(/\[TEST:(\w+)\]/i);
  if (testMatch) {
    const testType = testMatch[1].toLowerCase();
    console.log(`[EntityAgent] 🧪 TEST MODE: ${testType}`);

    switch (testType) {
      case 'water_seller':
        return {
          id: 'test-water-seller',
          name: 'Test Water Seller',
          type: 'npc',
          simpleInteractionType: 'vendor_offer',
          demographics: { gender: 'male', age: 'adult', casta: 'mestizo', class: 'common' },
          offer: {
            item: 'water',
            price: 1,
            description: 'fresh aqueduct water',
            quality: 'clean',
            quantity: 1,
            emoji: '💧'
          }
        };

      case 'beggar':
        return {
          id: 'test-beggar',
          name: 'Test Beggar',
          type: 'npc',
          simpleInteractionType: 'donation_request',
          demographics: { gender: 'female', age: 'elderly', casta: 'indio', class: 'poor' },
          request: {
            item: 'bread',
            reason: 'starving family',
            urgency: 'high',
            reputationImpact: { donate: 5, refuse: -3 }
          }
        };

      case 'informant':
        return {
          id: 'test-informant',
          name: 'Test Street Informant',
          type: 'npc',
          simpleInteractionType: 'information_exchange',
          demographics: { gender: 'male', age: 'adult', casta: 'mestizo', class: 'common' },
          information: {
            topic: 'local gossip',
            price: 2,
            value: 'moderate',
            description: 'rumors about the merchants guild'
          }
        };

      case 'gambler':
        return {
          id: 'test-gambler',
          name: 'Test Card Player',
          type: 'npc',
          simpleInteractionType: 'gamble_opportunity',
          demographics: { gender: 'male', age: 'adult', casta: 'mestizo', class: 'common' },
          gamble: {
            gameType: 'cards',
            wager: 5,
            potentialWin: 10,
            odds: 'even',
            description: 'high-low card game'
          }
        };

      case 'vendor':
        return {
          id: 'test-vendor',
          name: 'Test Market Vendor',
          type: 'npc',
          simpleInteractionType: 'vendor_offer',
          demographics: { gender: 'female', age: 'middle-aged', casta: 'mestizo', class: 'common' },
          offer: {
            item: 'herbs',
            price: 3,
            description: 'medicinal herbs from the countryside',
            quality: 'good',
            quantity: 1,
            emoji: '🌿'
          }
        };

      default:
        console.warn(`[EntityAgent] Unknown test type: ${testType}`);
        return null;
    }
  }
  // ===== END TEST MODE =====

  // Query EntityManager for ALL NPCs (static + auto-generated + LLM-created)
  const allNPCs = [
    ...entityManager.getByType('npc'),
    ...entityManager.getByType('patient')
  ];

  console.log(`[EntityAgent] Selecting from ${allNPCs.length} total entities (static + dynamic + LLM-generated)`);

  // PRIORITY CHECK: Scheduled Follow-Up Visits (before conversation lock)
  // Patients with scheduled follow-ups get highest priority for selection
  const scheduledFollowUps = context.scheduledFollowUps || [];
  const dueFollowUps = scheduledFollowUps.filter(
    followUp => followUp.scheduledTurn <= turnNumber
  );

  if (dueFollowUps.length > 0) {
    console.log(`[EntityAgent] Found ${dueFollowUps.length} due follow-up(s)`);

    // Sort by priority (urgent first) and scheduled turn (earliest first)
    dueFollowUps.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return a.scheduledTurn - b.scheduledTurn;
    });

    const duePatient = dueFollowUps[0]; // Take highest priority patient
    const patientEntity = entityManager.getById(duePatient.patientId);

    if (patientEntity) {
      // Check if conditions support patient encounter (business hours, location, etc.)
      const isPatientEncounterValid = checkPatientEncounterConditions(context);

      if (isPatientEncounterValid) {
        console.log(`[EntityAgent] ✓ FOLLOW-UP VISIT: ${patientEntity.name} (scheduled turn ${duePatient.scheduledTurn}, current turn ${turnNumber})`);

        // Mark as follow-up visit and add context
        patientEntity.isFollowUpVisit = true;
        patientEntity.followUpContext = {
          sessionNumber: (patientEntity.medicalRecord?.sessions?.length || 0) + 1,
          previousTreatments: patientEntity.treatmentProgress?.treatmentsGiven || [],
          daysSinceLastVisit: calculateDaysBetween(
            patientEntity.treatmentProgress?.lastTreatmentDate || context.date,
            context.date
          ),
          scheduledReason: patientEntity.followUp?.reason || 'Follow-up examination'
        };

        console.log(`[EntityAgent] Follow-up context:`, patientEntity.followUpContext);

        return patientEntity;
      } else {
        // Patient can't show up right now (wrong time/location/conditions)
        console.log(`[EntityAgent] ⚠ Patient ${patientEntity.name} missed follow-up (invalid conditions: time=${time}, location=${location})`);

        // Increment missed visits counter
        if (!patientEntity.followUp) patientEntity.followUp = {};
        patientEntity.followUp.missedVisits = (patientEntity.followUp.missedVisits || 0) + 1;
        entityManager.update(patientEntity.id, patientEntity);

        // BUG FIX #4: If patient has missed 3+ visits, remove from queue (they gave up)
        if (patientEntity.followUp.missedVisits >= 3) {
          console.log(`[EntityAgent] ⚠ Patient ${patientEntity.name} has missed ${patientEntity.followUp.missedVisits} visits - removing from follow-up queue (patient gave up)`);

          // Mark patient as abandoned treatment
          patientEntity.treatmentStatus = 'abandoned';
          patientEntity.followUp = null;
          entityManager.update(patientEntity.id, patientEntity);

          // Remove from scheduled follow-ups queue
          // NOTE: We need to filter the queue to remove this patient
          // This is handled by returning a special marker that AgentOrchestrator will process
          patientEntity.shouldRemoveFromQueue = true;
          return patientEntity;
        }
      }
    } else {
      console.warn(`[EntityAgent] Follow-up patient not found in EntityManager: ${duePatient.patientId}`);
    }
  }

  // CHECK: Conversation Lock System (highest priority)
  // If a conversation is locked, check for release/travel patterns before allowing continuation
  if (conversationLock && conversationLock.active !== false) {
    const actionLower = playerAction.toLowerCase();
    const releasePattern = /(dismiss|send\s+(him|her|them)\s+away|tell\s+(him|her|them)\s+to\s+leave|close\s+the\s+door|shut\s+the\s+door|go\s+away|leave\s+me\s+alone)/i;
    const travelPattern = /(go\s+to|travel\s+to|head\s+to|visit\s+the|walk\s+to|journey\s+to|make\s+my\s+way\s+to|head\s+for)/i;

    if (!npcDepartedLastTurn && !releasePattern.test(actionLower)) {
      if (travelPattern.test(actionLower)) {
        console.log('[EntityAgent] Conversation lock retained during travel — continuing conversation.');
        return null;
      }
      console.log(`[EntityAgent] Conversation lock active (${conversationLock.name || 'unknown'}) - continuing existing interaction.`);
      return null;
    }
  }

  // CONTINUATION DETECTION: Multiple signals to detect if player is continuing with current NPC
  // If continuation detected, return null to signal continuation (prevents portrait changes)
  if (recentNPCs.length > 0) {
    const lastNPC = recentNPCs[recentNPCs.length - 1];

    // CHECK: Did the NPC depart last turn? If so, don't continue
    if (npcDepartedLastTurn) {
      console.log(`[EntityAgent] ${lastNPC} departed last turn - no continuation`);
      // Fall through to normal entity selection
    } else {
      const firstName = lastNPC.split(/\s+/)[0].toLowerCase();
      const actionLower = playerAction.toLowerCase();

      // SIGNAL 1: Pronoun Detection (highest priority)
    // Pronouns always refer to someone already present
    const pronouns = /\b(him|her|them|his|hers|their|he|she|they)\b/i;
    if (pronouns.test(playerAction)) {
      console.log(`[EntityAgent] Pronoun detected in action "${playerAction}" - signaling continuation with ${lastNPC}`);
      return null;
    }

    // SIGNAL 2: Name Mention Detection
    // Check if action mentions the NPC's name (first name match is sufficient)
    if (actionLower.includes(firstName)) {
      console.log(`[EntityAgent] Player action mentions recent NPC "${lastNPC}" - signaling continuation`);
      return null;
    }

    // SIGNAL 3: Contextual Questions
    // Questions about objects, people, or situations imply continuation
    const contextualQuestions = /\b(what|who|why|where|when|how|which)\b.*\b(the|that|this|it|bundle|shirt|package|person|man|woman|master|patient|offer|deal|terms|payment|sickness|illness|ailment|matter|situation|problem|request)\b/i;
    if (contextualQuestions.test(playerAction)) {
      console.log(`[EntityAgent] Contextual question detected "${playerAction}" - signaling continuation with ${lastNPC}`);
      return null;
    }

    // SIGNAL 4: Demonstrative References
    // "the X", "that X", "this X" refer to something/someone already present
    const demonstratives = /\b(the|that|this|these|those)\s+(bundle|shirt|package|person|man|woman|child|request|offer|deal|matter|situation|problem)\b/i;
    if (demonstratives.test(playerAction)) {
      console.log(`[EntityAgent] Demonstrative reference detected "${playerAction}" - signaling continuation with ${lastNPC}`);
      return null;
    }

    // SIGNAL 5: Short Affirmations
    // Brief responses that clearly continue the conversation
    const shortAffirmations = /^(yes|yeah|yep|ok|okay|sure|alright|agreed|fine|go\s+on|continue|proceed|i\s+see|understood)[\s.,!?]*$/i;
    if (shortAffirmations.test(playerAction.trim())) {
      console.log(`[EntityAgent] Short affirmation detected "${playerAction}" - signaling continuation with ${lastNPC}`);
      return null;
    }

    // SIGNAL 6: Action Context Keywords
    // These verbs/phrases imply continuing with someone already present
    const continuationKeywords = [
      // Inviting/letting in (response to choice questions)
      /\b(usher|invite|let\s+(him|her|them)\s+in|bring\s+inside|allow\s+entry)\b/i,
      // Continuing conversation
      /\b(continue|keep\s+talking|go\s+on|carry\s+on|proceed)\b/i,
      // Responding
      /\b(respond|reply|answer|tell|say\s+to|speak\s+to)\b/i,
      // Offering/giving (implies current NPC)
      /\b(offer|give|hand|show|present|provide)\b/i,
      // Examining/helping (implies patient/NPC present)
      /\b(examine|help|assist|aid|treat|tend\s+to)\b/i,
      // Waiting for expected person/event (continuation)
      // Only match "wait for him/her/them", not generic "wait"
      /\b(wait\s+for\s+(him|her|them)|await|expect|anticipate|watch\s+for|look\s+for)\b/i,
      // Agreeing to requests
      /\b(agree|accept|will\s+help|can\s+help|let\s+me\s+help)\b/i
    ];

    for (const pattern of continuationKeywords) {
      if (pattern.test(playerAction)) {
        console.log(`[EntityAgent] Action keyword matched "${playerAction}" - signaling continuation with ${lastNPC}`);
        return null;
      }
    }
    } // Close else block (NPC not departed)
  } // Close recentNPCs.length > 0 block

  // MOVEMENT INTENT DETECTION: Prevent NPC encounters during travel actions
  // When player clearly wants to travel somewhere, don't inject NPCs along the way
  const movementKeywords = /\b(go\s+to|travel\s+to|head\s+to|visit\s+the|walk\s+to|journey\s+to|make\s+my\s+way\s+to|head\s+for|go\s*\.\s*to\s*\.\s*the)\b/i;
  if (movementKeywords.test(playerAction)) {
    console.log(`[EntityAgent] Movement intent detected in action "${playerAction}" - no NPC selected (player traveling)`);
    return null;
  }

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

  // NOTE: Conversation lock check already performed at line 115-130 above
  // (Removed duplicate check here)

  // CONTEXTUAL GUARDS: Filter out patients when conditions don't support them
  // This prevents patients from appearing during inappropriate times/locations
  const activePatient = context.activePatient;
  const shopSign = context.shopSign || {};

  // Parse time to check business hours
  // PERFORMANCE: Use centralized time parsing utility instead of duplicating logic
  const hour = parseHourFromTimeString(time);

  const isBusinessHours = hour >= 8 && hour < 18; // 8 AM to 6 PM
  const isAtWorkplace = location && location.toLowerCase().includes('botica');

  // Filter out patients if conditions aren't met
  filteredEntities = filteredEntities.filter(entity => {
    const entityType = entity.entityType || entity.type;

    // Allow non-patients through always
    if (entityType !== 'patient') return true;

    // For patients, check all conditions
    // FIX #6: Exclude dead patients from selection
    if (entity.isDead === true) {
      console.log(`[EntityAgent] Patient filtered: ${entity.name} is deceased`);
      return false;
    }

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

    // SIGN JUST HUNG TRIGGER: Force patient spawn (extremely high weight)
    if (signJustHung && (entity.entityType || entity.type) === 'patient') {
      console.log('[EntityAgent] ⚠️ SIGN JUST HUNG - Massively boosting patient weight');
      weight *= 100.0; // Almost guarantee patient selection
    }

    // PATIENT PRIORITY: Patients should be ~50% of encounters
    // Goal: 50% patients, 25% messengers, 25% simple interactions
    const workplaceKeywords = ['botica', 'shop', 'apothecary', 'pharmacy', 'store', 'clinic', 'office'];
    const isAtWorkplace = workplaceKeywords.some(keyword =>
      location.toLowerCase().includes(keyword)
    );
    if (isAtWorkplace && (entity.entityType || entity.type) === 'patient') {
      weight *= 4.0; // Patients more likely at workplace (balanced with ~30 total patients)
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
      if ((entity.entityType || entity.type) === 'patient') weight *= 1.5; // Boost patients in morning
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

    // SIMPLE INTERACTION PENALTY: Reduce frequency to ~25% of encounters
    // Simple interactions (vendors, beggars, etc.) should be less common than patients
    // Condition weights are 5-6x, penalty brings them to 2.5-3x effective
    if (entity.simpleInteractionType) {
      weight *= 0.5; // Reduce simple interaction frequency
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
 * Check if conditions are valid for a patient encounter
 * Used for both normal patients and follow-up visits
 * @param {Object} context - Game context
 * @returns {boolean} True if patient can appear now
 */
function checkPatientEncounterConditions(context) {
  const { time, location, activePatient, shopSign } = context;

  // Parse time to check business hours
  // PERFORMANCE: Use centralized time parsing utility instead of duplicating logic
  const hour = parseHourFromTimeString(time);

  const isBusinessHours = hour >= 8 && hour < 18; // 8 AM to 6 PM
  const isAtWorkplace = location && location.toLowerCase().includes('botica');
  const signIsHung = !shopSign || shopSign.hung !== false; // If no shopSign system, assume open

  // Check all conditions
  const conditionsMet = isBusinessHours && isAtWorkplace && !activePatient && signIsHung;

  console.log(`[EntityAgent] Patient encounter conditions: business_hours=${isBusinessHours}, workplace=${isAtWorkplace}, no_active_patient=${!activePatient}, sign_hung=${signIsHung} → ${conditionsMet ? 'VALID' : 'INVALID'}`);

  return conditionsMet;
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
