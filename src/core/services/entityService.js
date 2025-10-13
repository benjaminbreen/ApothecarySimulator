// Entity service for managing scenario-specific NPCs
// Provides NPC lookup, filtering, and state management

import { scenarioLoader } from './scenarioLoader';

/**
 * @typedef {import('../types/npc.types').NPC} NPC
 */

/**
 * EntityService class
 * Manages NPCs for the current scenario
 */
class EntityService {
  constructor() {
    /** @type {string|null} */
    this.currentScenarioId = null;

    /** @type {NPC[]} */
    this.npcs = [];
  }

  /**
   * Load NPCs for a scenario
   * @param {string} scenarioId - Scenario identifier
   * @returns {NPC[]} Array of NPCs
   */
  loadNPCs(scenarioId) {
    this.currentScenarioId = scenarioId;
    const scenario = scenarioLoader.loadScenario(scenarioId);
    this.npcs = scenario.npcs || [];
    console.log(`Loaded ${this.npcs.length} NPCs for scenario: ${scenarioId}`);
    return this.npcs;
  }

  /**
   * Get all NPCs for current scenario
   * @returns {NPC[]}
   */
  getAllNPCs() {
    return this.npcs;
  }

  /**
   * Get NPC by name
   * @param {string} name - NPC name
   * @returns {NPC|undefined}
   */
  getNPCByName(name) {
    return this.npcs.find(npc => npc.name === name);
  }

  /**
   * Get NPCs by type
   * @param {string} type - NPC type (patient, antagonist, state, etc.)
   * @returns {NPC[]}
   */
  getNPCsByType(type) {
    return this.npcs.filter(npc => npc.type === type);
  }

  /**
   * Get NPCs by class
   * @param {string} className - Social class (Elite, Middle, Poor)
   * @returns {NPC[]}
   */
  getNPCsByClass(className) {
    return this.npcs.filter(npc => npc.class === className);
  }

  /**
   * Filter NPCs by multiple criteria
   * @param {Object} filters - Filter criteria
   * @param {string} [filters.type] - NPC type
   * @param {string} [filters.class] - Social class
   * @param {string[]} [filters.excludeNames] - Names to exclude
   * @param {string[]} [filters.tags] - Required tags
   * @returns {NPC[]}
   */
  filterNPCs(filters = {}) {
    let filtered = [...this.npcs];

    if (filters.type) {
      filtered = filtered.filter(npc => npc.type === filters.type);
    }

    if (filters.class) {
      filtered = filtered.filter(npc => npc.class === filters.class);
    }

    if (filters.excludeNames && filters.excludeNames.length > 0) {
      filtered = filtered.filter(npc => !filters.excludeNames.includes(npc.name));
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(npc => {
        const npcTags = npc.tags || [];
        return filters.tags.some(tag => npcTags.includes(tag));
      });
    }

    return filtered;
  }

  /**
   * Get random NPC
   * @param {Object} [filters] - Optional filters
   * @returns {NPC|null}
   */
  getRandomNPC(filters = {}) {
    const filtered = this.filterNPCs(filters);
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /**
   * Check if NPC exists
   * @param {string} name - NPC name
   * @returns {boolean}
   */
  hasNPC(name) {
    return this.npcs.some(npc => npc.name === name);
  }

  /**
   * Get NPC count
   * @returns {number}
   */
  getNPCCount() {
    return this.npcs.length;
  }

  /**
   * Get NPC types available in scenario
   * @returns {string[]} Unique NPC types
   */
  getAvailableTypes() {
    return [...new Set(this.npcs.map(npc => npc.type))];
  }

  /**
   * Get social classes available in scenario
   * @returns {string[]} Unique social classes
   */
  getAvailableClasses() {
    return [...new Set(this.npcs.map(npc => npc.class).filter(Boolean))];
  }

  /**
   * Search NPCs by partial name match
   * @param {string} query - Search query
   * @returns {NPC[]}
   */
  searchNPCs(query) {
    const lowerQuery = query.toLowerCase();
    return this.npcs.filter(npc =>
      npc.name.toLowerCase().includes(lowerQuery) ||
      (npc.description && npc.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get current scenario ID
   * @returns {string|null}
   */
  getCurrentScenarioId() {
    return this.currentScenarioId;
  }

  /**
   * Reset service
   */
  reset() {
    this.currentScenarioId = null;
    this.npcs = [];
  }
}

// Export singleton instance
export const entityService = new EntityService();

// Also export class for testing
export { EntityService };

export default entityService;
