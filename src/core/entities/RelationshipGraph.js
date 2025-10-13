/**
 * Relationship Graph System
 *
 * Manages NPC↔NPC and NPC↔Player relationships.
 * Lightweight implementation for performance.
 *
 * @module RelationshipGraph
 */

/**
 * RelationshipGraph Class
 */
class RelationshipGraph {
  constructor() {
    this.relationships = new Map(); // entityId → { targetId → relationship }
  }

  /**
   * Add or update relationship
   * @param {string} fromId - Source entity ID
   * @param {string} toId - Target entity ID
   * @param {Object} relationship - Relationship data
   */
  setRelationship(fromId, toId, relationship) {
    if (!this.relationships.has(fromId)) {
      this.relationships.set(fromId, new Map());
    }

    this.relationships.get(fromId).set(toId, relationship);
  }

  /**
   * Get relationship
   * @param {string} fromId - Source entity ID
   * @param {string} toId - Target entity ID
   * @returns {Object|null} Relationship or null
   */
  getRelationship(fromId, toId) {
    const rels = this.relationships.get(fromId);
    return rels ? rels.get(toId) || null : null;
  }

  /**
   * Get all relationships for an entity
   * @param {string} entityId - Entity ID
   * @returns {Map} Map of relationships
   */
  getAllRelationships(entityId) {
    return this.relationships.get(entityId) || new Map();
  }

  /**
   * Update relationship value
   * @param {string} fromId - Source entity ID
   * @param {string} toId - Target entity ID
   * @param {number} delta - Change in relationship value
   * @param {string} reason - Reason for change
   */
  updateRelationship(fromId, toId, delta, reason = '') {
    let rel = this.getRelationship(fromId, toId);

    if (!rel) {
      // Create new relationship
      rel = {
        value: 50 + delta, // Start at neutral
        type: 'acquaintance',
        status: 'neutral',
        reason: reason,
        debt: 0,
        lastInteraction: new Date().toISOString().split('T')[0],
        history: []
      };
    } else {
      // Update existing
      rel = { ...rel };
      rel.value = Math.max(0, Math.min(100, rel.value + delta));
      rel.lastInteraction = new Date().toISOString().split('T')[0];
    }

    // Update status based on value
    if (rel.value < 20) rel.status = 'hostile';
    else if (rel.value < 40) rel.status = 'unfriendly';
    else if (rel.value < 60) rel.status = 'neutral';
    else if (rel.value < 80) rel.status = 'friendly';
    else rel.status = 'allied';

    // Add to history
    if (delta !== 0) {
      rel.history = rel.history || [];
      rel.history.push({
        date: rel.lastInteraction,
        event: reason,
        delta: delta
      });

      // Keep last 10 history entries
      if (rel.history.length > 10) {
        rel.history = rel.history.slice(-10);
      }
    }

    this.setRelationship(fromId, toId, rel);

    return rel;
  }

  /**
   * Query relationships
   * @param {string} entityId - Entity ID
   * @param {Object} query - Query parameters
   * @returns {Array} Matching relationships
   */
  query(entityId, query = {}) {
    const rels = this.getAllRelationships(entityId);
    let results = Array.from(rels.entries()).map(([targetId, rel]) => ({
      targetId,
      ...rel
    }));

    // Filter by type
    if (query.type) {
      results = results.filter(r => r.type === query.type);
    }

    // Filter by status
    if (query.status) {
      results = results.filter(r => r.status === query.status);
    }

    // Filter by minimum value
    if (query.minValue !== undefined) {
      results = results.filter(r => r.value >= query.minValue);
    }

    // Sort by value
    if (query.sortByValue) {
      results.sort((a, b) => b.value - a.value);
    }

    return results;
  }

  /**
   * Get allies
   * @param {string} entityId - Entity ID
   * @returns {Array} Allied entity IDs
   */
  getAllies(entityId) {
    return this.query(entityId, { status: 'allied' }).map(r => r.targetId);
  }

  /**
   * Get enemies
   * @param {string} entityId - Entity ID
   * @returns {Array} Hostile entity IDs
   */
  getEnemies(entityId) {
    return this.query(entityId, { status: 'hostile' }).map(r => r.targetId);
  }

  /**
   * Get friends
   * @param {string} entityId - Entity ID
   * @returns {Array} Friendly entity IDs
   */
  getFriends(entityId) {
    return this.query(entityId, { minValue: 60, sortByValue: true }).map(r => r.targetId);
  }

  /**
   * Get family members
   * @param {string} entityId - Entity ID
   * @returns {Array} Family entity IDs
   */
  getFamily(entityId) {
    return this.query(entityId, { type: 'family' }).map(r => r.targetId);
  }

  /**
   * Generate gossip about relationships
   * @param {string} speakerId - Speaking NPC ID
   * @param {string} targetId - Target NPC ID
   * @returns {string|null} Gossip text or null
   */
  generateGossip(speakerId, targetId) {
    const rel = this.getRelationship(speakerId, targetId);

    if (!rel) return null;

    const gossip = [];

    if (rel.status === 'hostile') {
      gossip.push(`I have no love for ${targetId}. ${rel.reason || 'We have our differences.'}`);
    } else if (rel.status === 'allied') {
      gossip.push(`${targetId} is a dear friend of mine. ${rel.reason || 'We have known each other for years.'}`);
    } else if (rel.type === 'family') {
      gossip.push(`${targetId} is family. ${rel.reason || ''}`);
    } else if (rel.debt > 0) {
      gossip.push(`${targetId} owes me ${rel.debt} reales.`);
    } else if (rel.debt < 0) {
      gossip.push(`I owe ${targetId} ${Math.abs(rel.debt)} reales.`);
    }

    return gossip.length > 0 ? gossip.join(' ') : null;
  }

  /**
   * Clear all relationships (for testing)
   */
  clear() {
    this.relationships.clear();
  }
}

// Create singleton instance
export const relationshipGraph = new RelationshipGraph();

export default RelationshipGraph;
