// Scenario loader service
// Handles loading and managing scenario configurations

import scenarios from '../../scenarios';
import { validateScenarioConfig } from '../types/scenario.types';

/**
 * @typedef {import('../types/scenario.types').ScenarioConfig} ScenarioConfig
 * @typedef {import('../types/npc.types').NPC} NPC
 * @typedef {import('../types/game.types').InventoryItem} InventoryItem
 */

/**
 * ScenarioLoader class
 * Manages loading and accessing scenario configurations
 */
class ScenarioLoader {
  constructor() {
    /** @type {Object.<string, ScenarioConfig>} */
    this.scenarios = scenarios;

    /** @type {ScenarioConfig|null} */
    this.currentScenario = null;

    // Validate all scenarios on initialization
    this._validateAll();
  }

  /**
   * Validate all registered scenarios
   * @private
   */
  _validateAll() {
    const scenarioIds = Object.keys(this.scenarios);

    if (scenarioIds.length === 0) {
      console.warn('No scenarios registered!');
      return;
    }

    scenarioIds.forEach(id => {
      try {
        validateScenarioConfig(this.scenarios[id]);
      } catch (error) {
        console.error(`Scenario validation failed for ${id}:`, error);
      }
    });

    console.log(`Loaded ${scenarioIds.length} scenario(s):`, scenarioIds);
  }

  /**
   * Get all available scenarios
   * @returns {ScenarioConfig[]}
   */
  getAllScenarios() {
    return Object.values(this.scenarios);
  }

  /**
   * Get scenario IDs
   * @returns {string[]}
   */
  getScenarioIds() {
    return Object.keys(this.scenarios);
  }

  /**
   * Load a scenario by ID
   * @param {string} scenarioId - Scenario identifier
   * @returns {ScenarioConfig}
   * @throws {Error} If scenario not found
   */
  loadScenario(scenarioId) {
    const scenario = this.scenarios[scenarioId];

    if (!scenario) {
      const available = this.getScenarioIds().join(', ');
      throw new Error(`Scenario not found: ${scenarioId}. Available scenarios: ${available}`);
    }

    // Only validate and log on first load or when switching scenarios
    const isNewScenario = !this.currentScenario || this.currentScenario.id !== scenarioId;

    if (isNewScenario) {
      // Validate before loading
      try {
        validateScenarioConfig(scenario);
      } catch (error) {
        console.error(`Scenario validation failed for ${scenarioId}:`, error);
        throw error;
      }

      this.currentScenario = scenario;
      console.log(`Loaded scenario: ${scenario.name} (${scenarioId})`);
    }

    return scenario;
  }

  /**
   * Get current loaded scenario
   * @returns {ScenarioConfig|null}
   */
  getCurrentScenario() {
    return this.currentScenario;
  }

  /**
   * Get scenario by ID without setting as current
   * @param {string} scenarioId
   * @returns {ScenarioConfig|null}
   */
  getScenario(scenarioId) {
    return this.scenarios[scenarioId] || null;
  }

  /**
   * Check if scenario exists
   * @param {string} scenarioId
   * @returns {boolean}
   */
  hasScenario(scenarioId) {
    return scenarioId in this.scenarios;
  }

  /**
   * Get scenario-specific prompt modules
   * @param {string} scenarioId
   * @returns {Object}
   */
  getPrompts(scenarioId) {
    const scenario = this.loadScenario(scenarioId);
    return scenario.prompts;
  }

  /**
   * Get scenario NPCs
   * @param {string} scenarioId
   * @returns {NPC[]}
   */
  getNPCs(scenarioId) {
    const scenario = this.loadScenario(scenarioId);
    return scenario.npcs;
  }

  /**
   * Get scenario starting inventory
   * @param {string} scenarioId
   * @returns {InventoryItem[]}
   */
  getStartingInventory(scenarioId) {
    const scenario = this.loadScenario(scenarioId);
    return scenario.startingInventory;
  }

  /**
   * Get scenario character config
   * @param {string} scenarioId
   * @returns {import('../types/scenario.types').ScenarioCharacter}
   */
  getCharacter(scenarioId) {
    const scenario = this.loadScenario(scenarioId);
    return scenario.character;
  }

  /**
   * Get scenario settings
   * @param {string} scenarioId
   * @returns {import('../types/scenario.types').ScenarioSettings}
   */
  getSettings(scenarioId) {
    const scenario = this.loadScenario(scenarioId);
    return scenario.settings;
  }

  /**
   * Get scenario currency info
   * @param {string} scenarioId
   * @returns {{currency: string, currencySymbol: string}}
   */
  getCurrency(scenarioId) {
    const scenario = this.loadScenario(scenarioId);
    return {
      currency: scenario.currency,
      currencySymbol: scenario.currencySymbol
    };
  }

  /**
   * Get scenario starting state
   * Useful for initializing a new game
   * @param {string} scenarioId
   * @returns {Object}
   */
  getStartingState(scenarioId) {
    const scenario = this.loadScenario(scenarioId);

    return {
      scenarioId,
      date: scenario.startDate,
      time: scenario.startTime,
      location: scenario.startLocation,
      wealth: scenario.startingWealth,
      inventory: scenario.startingInventory,
      health: scenario.character.stats.health,
      energy: scenario.character.stats.energy,
      unlockedMethods: scenario.character.startingMethods,
      debts: scenario.debts,
      character: scenario.character
    };
  }
}

// Export singleton instance
export const scenarioLoader = new ScenarioLoader();

// Also export class for testing
export { ScenarioLoader };

export default scenarioLoader;
