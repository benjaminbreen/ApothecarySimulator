/**
 * Random Event Service - Main Coordinator
 * Brings together event selection, triggering, and processing
 */

import { selectRandomEvent, recordEventOccurrence, resetEventTracking, selectEventById } from './eventSelector';
import {
  shouldTriggerEvent,
  buildEventContext,
  recordEventTrigger,
  resetEventTriggers
} from './eventTriggers';

/**
 * Initialize the random event system
 * Call this on new game or game load
 */
export function initializeEventSystem() {
  resetEventTracking();
  resetEventTriggers();
  console.log('[RandomEventService] Event system initialized');
}

/**
 * Check if a random event should occur and return it
 *
 * @param {Object} gameState - Current game state
 * @param {Object} reputation - Current reputation by faction
 * @param {string} playerAction - The action the player just took
 * @returns {Object|null} Event card data or null
 */
export function checkForRandomEvent(gameState, reputation, playerAction = '') {
  // Check if event should trigger on this turn
  if (!shouldTriggerEvent(gameState, playerAction)) {
    return null;
  }

  // Build context for event selection
  const context = buildEventContext(gameState, reputation);

  // Select an event
  const selectedEvent = selectRandomEvent(context);

  if (!selectedEvent) {
    console.log('[RandomEventService] No event selected');
    return null;
  }

  // Record the trigger
  recordEventTrigger(selectedEvent.category, gameState.turnNumber);
  recordEventOccurrence(selectedEvent.id);

  // Build event card data for UI
  const eventCard = buildEventCard(selectedEvent, gameState);

  console.log(`[RandomEventService] Event triggered: ${selectedEvent.title}`);
  return eventCard;
}

/**
 * Build event card data structure for UI display
 */
function buildEventCard(event, gameState) {
  return {
    type: 'random_event',
    eventId: event.id,
    category: event.category,
    title: event.title,
    description: event.description,
    icon: event.icon,
    colorScheme: event.colorScheme,
    choices: event.choices.map(choice => ({
      ...choice,
      // Check if player can afford this choice
      isAffordable: checkAffordability(choice, gameState)
    }))
  };
}

/**
 * Check if player can afford a choice
 */
function checkAffordability(choice, gameState) {
  const { requirements, cost } = choice;

  // Check requirements
  if (requirements) {
    if (requirements.minWealth && gameState.currentWealth < requirements.minWealth) {
      return false;
    }
    if (requirements.minEnergy && gameState.energy < requirements.minEnergy) {
      return false;
    }
    if (requirements.minHealth && gameState.health < requirements.minHealth) {
      return false;
    }
    if (requirements.hasItem) {
      const hasItem = gameState.inventory.some(item =>
        item.name.toLowerCase().includes(requirements.hasItem.toLowerCase())
      );
      if (!hasItem) return false;
    }
  }

  // Check costs (just verify player has resources, actual deduction happens on selection)
  if (cost) {
    if (cost.wealth && gameState.currentWealth < cost.wealth) {
      return false;
    }
    if (cost.energy && gameState.energy < cost.energy) {
      return false;
    }
    if (cost.health && gameState.health < cost.health) {
      return false;
    }
  }

  return true;
}

/**
 * Process a player's choice on a random event
 *
 * @param {string} eventId - The event ID
 * @param {string} choiceAction - The action chosen
 * @param {Object} gameState - Current game state
 * @param {Function} updateReputation - Function to update reputation
 * @param {Function} updateInventory - Function to update inventory
 * @returns {Object} Result with outcomes and narrative
 */
export function processEventChoice(eventId, choiceAction, gameState, updateReputation, updateInventory) {
  // Find the event
  const event = selectEventById(eventId);
  if (!event) {
    console.error(`[RandomEventService] Event not found: ${eventId}`);
    return null;
  }

  // Find the choice
  const choice = event.choices.find(c => c.action === choiceAction);
  if (!choice) {
    console.error(`[RandomEventService] Choice not found: ${choiceAction}`);
    return null;
  }

  console.log(`[RandomEventService] Processing choice: ${choice.label}`);

  // Determine outcome (handle random outcomes)
  const outcome = determineOutcome(choice, gameState);

  // Apply costs
  const costs = applyCosts(choice, gameState, updateInventory);

  // Apply outcomes
  const results = applyOutcomes(outcome, updateReputation, updateInventory, gameState);

  // Build result object
  return {
    success: true,
    narrative: outcome.narrativeTemplate || choice.label,
    xpGained: outcome.xp || 0,
    costs,
    results,
    outcome
  };
}

/**
 * Determine which outcome occurs (handle randomness)
 */
function determineOutcome(choice, gameState) {
  const { outcomes } = choice;

  // If outcomes is an array, it's a random outcome
  if (Array.isArray(outcomes)) {
    // Check for skill-modified rolls
    let successChance = 0.5; // Default 50/50

    const successOutcome = outcomes.find(o => o.success === true);
    if (successOutcome && successOutcome.chance) {
      successChance = successOutcome.chance;
    }

    // Apply skill modifiers if specified
    if (successOutcome && successOutcome.skillModifier) {
      const { skill, bonusPerLevel } = successOutcome.skillModifier;
      const skillLevel = gameState.skills?.[skill] || 0;
      successChance += skillLevel * bonusPerLevel;
    }

    // Roll for success
    const roll = Math.random();
    const succeeded = roll < successChance;

    const selectedOutcome = outcomes.find(o => o.success === succeeded);
    console.log(`[RandomEventService] Random outcome: ${succeeded ? 'SUCCESS' : 'FAILURE'} (roll: ${roll.toFixed(2)}, needed: ${successChance.toFixed(2)})`);

    return selectedOutcome || outcomes[0]; // Fallback to first outcome
  }

  // Single outcome
  return outcomes;
}

/**
 * Apply costs from the choice
 */
function applyCosts(choice, gameState, updateInventory) {
  const { cost } = choice;
  const applied = {};

  if (!cost) return applied;

  if (cost.wealth) {
    applied.wealth = -cost.wealth;
  }

  if (cost.energy) {
    applied.energy = -cost.energy;
  }

  if (cost.health) {
    applied.health = -cost.health;
  }

  if (cost.item) {
    // Remove item from inventory
    updateInventory(cost.item, -1);
    applied.item = cost.item;
  }

  console.log('[RandomEventService] Costs applied:', applied);
  return applied;
}

/**
 * Apply outcomes (reputation, items, etc.)
 */
function applyOutcomes(outcome, updateReputation, updateInventory, gameState) {
  const results = {};

  // Apply reputation changes
  if (outcome.reputation) {
    Object.entries(outcome.reputation).forEach(([faction, value]) => {
      updateReputation(faction, value, 'random event');
      results[`reputation_${faction}`] = value;
    });
  }

  // Apply item gains
  if (outcome.itemGained) {
    const { name, quantity = 1 } = outcome.itemGained;
    updateInventory(name, quantity);
    results.itemGained = { name, quantity };
  }

  // Track XP
  if (outcome.xp) {
    results.xp = outcome.xp;
  }

  console.log('[RandomEventService] Outcomes applied:', results);
  return results;
}

/**
 * Get event statistics (for debugging/analytics)
 */
export function getEventSystemStats() {
  const { getEventStats } = require('./eventSelector');
  const { getRecentEventHistory } = require('./eventTriggers');

  return {
    eventStats: getEventStats(),
    recentHistory: getRecentEventHistory()
  };
}

/**
 * Force trigger a specific event by ID (for testing)
 */
export function debugTriggerEvent(eventId, gameState, reputation) {
  const event = selectEventById(eventId);
  if (!event) {
    console.warn(`[RandomEventService] Event not found: ${eventId}`);
    return null;
  }

  recordEventTrigger(event.category, gameState.turnNumber);
  recordEventOccurrence(event.id);

  return buildEventCard(event, gameState);
}
