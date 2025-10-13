// AgentOrchestrator - Coordinates all agents for a single game turn
// Integrates NarrativeAgent, StateAgent, and EntityAgent

import { generateNarrative } from './NarrativeAgent';
import { extractGameState, validateGameState } from './StateAgent';
import { selectContextAwareEntity } from './EntityAgent';
import { autoGenerateNPCsFromNarrative } from '../entities/autoGenerateNPC';
import { entityManager } from '../entities/EntityManager';

/**
 * @typedef {import('../types/game.types').GameState} GameState
 * @typedef {import('../types/npc.types').NPC} NPC
 */

/**
 * Orchestrates all agents for a single turn
 * @param {Object} params
 * @param {string} params.scenarioId - Current scenario ID
 * @param {string} params.playerAction - Player's input
 * @param {Array} params.conversationHistory - Previous conversation
 * @param {Object} params.gameState - Current game state
 * @param {number} params.turnNumber - Current turn number
 * @param {Array} [params.recentNPCs] - Recently encountered NPCs
 * @param {Object} params.reputation - Current reputation object with overall and factions
 * @param {number} params.wealth - Current wealth
 * @param {Object|null} [params.mapData] - Current map data for movement
 * @param {Object|null} [params.playerPosition] - Current player position
 * @param {string|null} [params.currentMapId] - Current map identifier
 * @param {Object|null} [params.playerSkills] - Player's skills from useSkills hook
 * @param {Array} [params.journal] - Journal entries for history compression
 * @param {Object|null} [params.activePatient] - Currently active patient being treated
 * @returns {Promise<Object>}
 */
export async function orchestrateTurn({
  scenarioId,
  playerAction,
  conversationHistory,
  gameState,
  turnNumber,
  recentNPCs = [],
  reputation,
  wealth,
  mapData = null,
  playerPosition = null,
  currentMapId = null,
  playerSkills = null,
  journal = [],
  activePatient = null
}) {
  try {
    // Step 1: Context-aware entity selection
    const selectedEntity = selectContextAwareEntity({
      scenarioId,
      playerAction, // NEW: Pass player action for intent detection
      turnNumber,
      location: gameState.location,
      time: gameState.time,
      date: gameState.date,
      recentNPCs,
      reputation,
      wealth,
      shopSign: gameState.shopSign || {}, // Pass shop sign status for patient flow
      activePatient // Pass active patient to prevent duplicate selections
    });

    if (selectedEntity) {
      console.log(`[Turn ${turnNumber}] Selected entity: ${selectedEntity.name} (${selectedEntity.entityType || selectedEntity.type})`);
    } else {
      console.log(`[Turn ${turnNumber}] No entity selected this turn`);
    }

    // Step 2: Generate narrative using NarrativeAgent (with map context, reputation, skills, and journal)
    const narrativeResult = await generateNarrative({
      scenarioId,
      playerAction,
      conversationHistory,
      gameState,
      selectedEntity,
      turnNumber,
      mapData,
      playerPosition,
      currentMapId,
      reputation,
      playerSkills,
      journal
    });

    if (!narrativeResult.success) {
      throw new Error('Narrative generation failed: ' + (narrativeResult.error || 'Unknown error'));
    }

    // Step 2.5: Process entities from LLM response (Hybrid Approach)
    const allNewEntities = [];

    // PART A: Process explicit entity list from LLM (primary method)
    if (narrativeResult.entities && narrativeResult.entities.length > 0) {
      console.log(`[Turn ${turnNumber}] LLM detected ${narrativeResult.entities.length} entities`);

      narrativeResult.entities.forEach(entity => {
        // Check if entity already exists in EntityManager
        const existing = entityManager.getByName(entity.text);

        if (existing) {
          console.log(`[Entities] "${entity.text}" already registered, skipping`);
          return;
        }

        // Generate full entity object from LLM data
        const newEntity = {
          entityType: entity.entityType || 'npc',
          id: `${entity.entityType || 'npc'}_${entity.text.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
          name: entity.text, // Exact text from narrative (e.g., "a man loitering by the alley")
          tier: entity.tier || 'background',
          type: entity.entityType || 'npc',
          clickable: true,

          // Description for unnamed entities
          description: entity.description || `Encountered: ${entity.text}`,

          // Appearance data from LLM demographics (for portrait matching)
          appearance: entity.demographics ? {
            gender: entity.demographics.gender || 'unknown',
            age: entity.demographics.age || 'adult'
          } : undefined,

          // Social data from LLM demographics and occupation
          social: {
            occupation: entity.occupation || 'unknown',
            // Use LLM-provided class if available, otherwise infer from tier
            class: entity.demographics?.class ||
                   (entity.tier === 'story-critical' ? 'elite' :
                    entity.tier === 'recurring' ? 'middling' : 'common'),
            // Use LLM-provided casta if available
            casta: entity.demographics?.casta || 'unknown'
          },

          // Metadata
          metadata: {
            created: Date.now(),
            lastModified: Date.now(),
            version: 1,
            dataSource: 'llm-generated',
            scenarioId: scenarioId
          }
        };

        // Register with EntityManager (gets procedural enrichment)
        const registered = entityManager.register(newEntity);
        allNewEntities.push(registered);

        // Log registration with demographics info
        const demographicsProvided = entity.demographics ? '✓ demographics' : '✗ no demographics';
        console.log(`[Entities] Registered "${entity.text}" (${entity.entityType}, ${entity.tier}, ${demographicsProvided})`);
      });
    }

    // PART B: Regex fallback for backward compatibility
    // Catches proper names that LLM might have missed
    const regexNPCs = autoGenerateNPCsFromNarrative(
      narrativeResult.narrative,
      entityManager.getAll(), // Check against EntityManager, not EntityList
      scenarioId
    );

    if (regexNPCs.length > 0) {
      console.log(`[Turn ${turnNumber}] Regex detected ${regexNPCs.length} additional NPCs:`, regexNPCs.map(npc => npc.name).join(', '));

      regexNPCs.forEach(npc => {
        const registered = entityManager.register(npc);
        allNewEntities.push(registered);
      });
    }

    if (allNewEntities.length > 0) {
      console.log(`[Turn ${turnNumber}] Total new entities registered: ${allNewEntities.length}`);
    }

    // Step 3: Extract game state from narrative using StateAgent (with map data for movement)
    const stateResult = await extractGameState({
      narrative: narrativeResult.narrative,
      currentGameState: gameState,
      playerAction,
      selectedEntity,
      scenarioId,
      turnNumber,
      mapData
    });

    // Step 4: Validate state changes
    const validatedState = validateGameState(stateResult.gameState, gameState);

    // Step 5: Return combined result
    // Debug: Log the showPortraitFor and requestNewPatient passthrough
    console.log('[AgentOrchestrator] showPortraitFor from narrative:', narrativeResult.showPortraitFor);
    console.log('[AgentOrchestrator] requestNewPatient from narrative:', narrativeResult.requestNewPatient);
    if (stateResult.contractOffer) {
      console.log('[AgentOrchestrator] contractOffer from state:', stateResult.contractOffer.type, stateResult.contractOffer);
    }

    return {
      success: true,
      narrative: narrativeResult.narrative,
      npcDialogue: narrativeResult.npcDialogue,
      sceneDescription: narrativeResult.sceneDescription,
      suggestedCommands: narrativeResult.suggestedCommands,
      showPortraitFor: narrativeResult.showPortraitFor || null, // LLM portrait hint
      requestNewPatient: narrativeResult.requestNewPatient || false, // LLM controls patient flow
      patientContext: narrativeResult.patientContext || null, // Reason for patient arrival
      gameState: validatedState,
      inventoryChanges: stateResult.inventoryChanges || [],
      relationshipChanges: stateResult.relationshipChanges || [], // NPC relationship changes
      contractOffer: stateResult.contractOffer || null, // Treatment/sale contract offers
      journalEntry: stateResult.journalEntry || '',
      systemAnnouncements: stateResult.systemAnnouncements || [],
      selectedEntity,
      newNPCs: allNewEntities, // Return all newly registered entities
      entities: narrativeResult.entities || [], // Return entities for historical context
      turnNumber: turnNumber + 1,
      movement: stateResult.movement || null // Include movement data if present
    };

  } catch (error) {
    console.error('[AgentOrchestrator] Error:', error);

    // Fallback: return minimal valid response
    return {
      success: false,
      error: error.message,
      narrative: 'Something unexpected happened. The world seems to shimmer and fade for a moment, then returns to normal. Please try again.',
      showPortraitFor: null,
      gameState: gameState, // Keep current state unchanged
      inventoryChanges: [],
      journalEntry: '',
      systemAnnouncements: [],
      selectedEntity: null,
      turnNumber
    };
  }
}

/**
 * Orchestrate a command-based turn (e.g., #prescribe, #sleep, #buy)
 * Simpler version that doesn't need full narrative generation
 * @param {Object} params
 * @param {string} params.scenarioId
 * @param {string} params.command - Command name (e.g., 'prescribe', 'sleep')
 * @param {Object} params.gameState
 * @param {Object} [params.commandResult] - Result from command execution
 * @returns {Promise<Object>}
 */
export async function orchestrateCommand({
  scenarioId,
  command,
  gameState,
  commandResult = {}
}) {
  try {
    // Generate simple narrative for command
    const narrative = commandResult.narrative || `You ${command}.`;

    // Extract any state changes from command result
    const gameStateChanges = commandResult.gameState || {};
    const validatedState = validateGameState(gameStateChanges, gameState);

    return {
      success: true,
      narrative,
      gameState: validatedState,
      inventoryChanges: commandResult.inventoryChanges || [],
      journalEntry: commandResult.journalEntry || '',
      systemAnnouncements: commandResult.systemAnnouncements || [],
      selectedEntity: null
    };

  } catch (error) {
    console.error('[AgentOrchestrator] Command orchestration error:', error);

    return {
      success: false,
      error: error.message,
      narrative: 'Failed to execute command.',
      gameState: gameState,
      inventoryChanges: [],
      selectedEntity: null
    };
  }
}

export default {
  orchestrateTurn,
  orchestrateCommand
};
