/**
 * EntityManager
 *
 * Central entity management system for the game.
 * Handles CRUD operations, procedural generation, and entity queries.
 *
 * Design:
 * - Immutable entities (functional updates)
 * - Efficient lookups (Map-based indices)
 * - Automatic procedural generation for missing data
 * - Text parsing for narrative highlighting
 * - Relationship graph queries
 *
 * @module EntityManager
 */

import { BaseEntity, NPCEntity, PatientEntity, ItemEntity, LocationEntity, calculateTemperament } from './entitySchema';
import { generateNameForTemplate, isTemplateName } from './procedural/nameGenerator';

/**
 * EntityManager Class
 * Singleton pattern - use `entityManager` export
 */
class EntityManager {
  constructor() {
    // Core storage
    this.entities = new Map();              // id → entity
    this.entitiesByType = new Map();        // type → [entities]
    this.entitiesByName = new Map();        // normalized name → entity
    this.entitiesByTier = new Map();        // tier → [entities]

    // Initialize type maps
    ['npc', 'patient', 'item', 'location', 'quest'].forEach(type => {
      this.entitiesByType.set(type, []);
    });

    // Initialize tier maps
    ['story-critical', 'recurring', 'background'].forEach(tier => {
      this.entitiesByTier.set(tier, []);
    });

    // Procedural generators (set externally)
    this.generators = {
      npc: null,
      item: null
    };

    // Cache for narrative highlighting (performance optimization)
    this.nameRegexCache = new Map();

    // Cache for enriched entities (lazy enrichment)
    this.enrichedEntities = new Map();

    // Persistence callback (set externally)
    this.onSave = null;

    // Track logged messages to prevent spam (React StrictMode causes double-mounting)
    this.loggedWarnings = new Set();
    this.loggedMessages = new Set();

    if (!window.__entityManagerInitialized) {
      console.log('[EntityManager] Initialized');
      window.__entityManagerInitialized = true;
    }
  }

  /**
   * Set save callback for persistence
   * @param {Function} callback - Function to call when entities change
   */
  setSaveCallback(callback) {
    this.onSave = callback;
    console.log('[EntityManager] Save callback registered');
  }

  /**
   * Register procedural generators
   * @param {Object} generators - { npc: npcGenerator, item: itemGenerator }
   */
  setGenerators(generators) {
    this.generators = { ...this.generators, ...generators };
    console.log('[EntityManager] Generators registered:', Object.keys(this.generators));
  }

  /**
   * Register an entity in the system
   * @param {Object} entity - Entity object
   * @returns {Object} Enriched entity
   */
  register(entity) {
    // Auto-generate ID for static entities (from EntityList) if missing
    if (!entity.id && entity.name && entity.entityType) {
      const normalizedName = this.normalizeName(entity.name).replace(/\s+/g, '_');
      entity.id = `${entity.entityType}_${normalizedName}`;
      // Only log once per ID
      const logKey = `autogen:${entity.id}`;
      if (!this.loggedMessages.has(logKey)) {
        console.log(`[EntityManager] Auto-generated ID: ${entity.id}`);
        this.loggedMessages.add(logKey);
      }
    }

    // Validate
    if (!entity.id || !entity.entityType) {
      throw new Error('Entity must have id and entityType');
    }

    // Check if already exists
    if (this.entities.has(entity.id)) {
      // Only log warning once per entity to prevent spam
      if (!this.loggedWarnings.has(entity.id)) {
        console.warn(`[EntityManager] Entity ${entity.id} already exists, updating...`);
        this.loggedWarnings.add(entity.id);
      }
      return this.update(entity.id, entity);
    }

    // NEW: Flag LLM-provided entities to prevent procedural override
    if (entity.llmProvided === true) {
      const logKey = `llmProvided:${entity.id}`;
      if (!this.loggedMessages.has(logKey)) {
        console.log('[EntityManager] LLM-provided entity, preserving data:', entity.name);
        this.loggedMessages.add(logKey);
      }
    }

    // Store RAW entity data (no enrichment yet)
    this.entities.set(entity.id, entity);

    // Type index (use raw name for now)
    const typeList = this.entitiesByType.get(entity.entityType) || [];
    typeList.push(entity);
    this.entitiesByType.set(entity.entityType, typeList);

    // Name index (raw name)
    const normalizedName = this.normalizeName(entity.name);
    this.entitiesByName.set(normalizedName, entity);

    // Tier index
    if (entity.tier) {
      const tierList = this.entitiesByTier.get(entity.tier) || [];
      tierList.push(entity);
      this.entitiesByTier.set(entity.tier, tierList);
    }

    // Clear name regex cache
    this.nameRegexCache.clear();

    // Only log registration once per entity
    const logKey = `register:${entity.id}`;
    if (!this.loggedMessages.has(logKey)) {
      console.log(`[EntityManager] Registered ${entity.entityType}: ${entity.name} (${entity.id}) [LAZY]`);
      this.loggedMessages.add(logKey);
    }

    // Trigger save callback
    if (this.onSave) {
      this.onSave();
    }

    return entity;
  }

  /**
   * Enrich entity with procedurally generated data
   * @param {Object} entity - Raw entity
   * @returns {Object} Enriched entity
   */
  enrichEntity(entity) {
    const enriched = { ...entity };

    // Set metadata
    if (!enriched.metadata) {
      enriched.metadata = {
        created: Date.now(),
        lastModified: Date.now(),
        version: 1,
        dataSource: enriched.metadata?.dataSource || 'mixed'
      };
    }

    switch (entity.entityType) {
      case 'npc':
      case 'patient':
        return this.enrichNPC(enriched);

      case 'item':
        return this.enrichItem(enriched);

      case 'location':
        return enriched; // Locations don't need much procedural generation yet

      default:
        return enriched;
    }
  }

  /**
   * Infer gender from NPC name and occupation
   * @param {Object} entity - NPC entity
   * @returns {string} Inferred gender ('male', 'female', or 'unknown')
   */
  inferGender(entity) {
    const occupation = entity.social?.occupation || entity.occupation || '';
    const name = entity.name || '';

    // Check occupation keywords (female indicators)
    if (occupation.match(/woman|madre|doña|dona|seamstress|weaver|midwife|nun|abbess|wife|daughter|sister|curandera|tejedora/i)) {
      return 'female';
    }

    // Check occupation keywords (male indicators)
    if (occupation.match(/man|padre|don|friar|monk|priest|caballero|father|son|brother|soldado|vaquero|ranchero/i)) {
      return 'male';
    }

    // Check name prefixes (female)
    if (name.match(/^(Doña|Dona|Sor|Sister|María|Maria|Ana|Isabel|Rosa|Antonia|Juana|Catalina|Teresa|Beatriz|Inés|Ines|Francisca)/i)) {
      return 'female';
    }

    // Check name prefixes (male)
    if (name.match(/^(Don|Fray|Father|Padre|Friar|Brother|Juan|José|Jose|Pedro|Diego|Francisco|Antonio|Carlos|Miguel|Rodrigo|Fernando|Alonso|Sebastián|Sebastian)/i)) {
      return 'male';
    }

    // Default to unknown
    return 'unknown';
  }

  /**
   * Enrich NPC with procedural data
   * @param {Object} npc - NPC entity
   * @returns {Object} Enriched NPC
   */
  enrichNPC(npc) {
    const enriched = { ...npc };

    // Step 1: Generate name for templates BEFORE other enrichment
    if (isTemplateName(enriched.name)) {
      const logKey = `template:${enriched.id || enriched.name}`;
      if (!this.loggedMessages.has(logKey)) {
        console.log(`[EntityManager] Template detected: ${enriched.name}`);
        this.loggedMessages.add(logKey);
      }
      const nameData = generateNameForTemplate(enriched);
      enriched.name = nameData.fullName;
      enriched.firstName = nameData.firstName;
      enriched.surname = nameData.surname;
      enriched.archetype = nameData.archetype;
      enriched.isTemplate = false;

      // Update appearance with generated gender
      if (!enriched.appearance) enriched.appearance = {};
      enriched.appearance.gender = nameData.gender;

      // Update social data
      if (!enriched.social) enriched.social = {};
      enriched.social.casta = nameData.casta;
      if (!enriched.social.occupation) {
        enriched.social.occupation = nameData.archetype;
      }

      const nameLogKey = `genname:${enriched.id || enriched.name}`;
      if (!this.loggedMessages.has(nameLogKey)) {
        console.log(`[EntityManager] Generated name: ${enriched.name} (${nameData.gender})`);
        this.loggedMessages.add(nameLogKey);
      }
    }

    // Step 2: Infer gender if still missing
    if (!enriched.appearance) enriched.appearance = {};
    if (!enriched.appearance.gender || enriched.appearance.gender === 'unknown') {
      const inferredGender = this.inferGender(enriched);
      if (inferredGender !== 'unknown') {
        enriched.appearance.gender = inferredGender;
        const logKey = `gender:${enriched.id || enriched.name}`;
        if (!this.loggedMessages.has(logKey)) {
          console.log(`[EntityManager] Inferred gender for ${enriched.name}: ${inferredGender}`);
          this.loggedMessages.add(logKey);
        }
      }
    }

    // Use generator if available
    if (this.generators.npc) {
      // Generate appearance if missing
      if (!enriched.appearance || !enriched.appearance.age) {
        enriched.appearance = {
          ...enriched.appearance,
          ...this.generators.npc.generateAppearance(enriched)
        };
      }

      // Generate clothing if missing
      if (!enriched.clothing || !enriched.clothing.items || enriched.clothing.items.length === 0) {
        enriched.clothing = this.generators.npc.generateClothing(enriched);
      }

      // Generate personality if missing
      if (!enriched.personality || !enriched.personality.bigFive) {
        enriched.personality = this.generators.npc.generatePersonality(enriched);
      }

      // Generate dialogue if missing
      if (!enriched.dialogue || !enriched.dialogue.greeting) {
        enriched.dialogue = this.generators.npc.generateDialogue(enriched);
      }

      // Generate biography if missing
      if (!enriched.biography || !enriched.biography.birthplace) {
        enriched.biography = this.generators.npc.generateBiography(enriched);
      }

      // Generate skills if missing
      if (!enriched.skills || Object.keys(enriched.skills).length === 0) {
        enriched.skills = this.generators.npc.generateSkills(enriched);
      }
    } else {
      // Fallback: basic stats generation
      if (!enriched.personality?.bigFive) {
        enriched.personality = enriched.personality || {};
        enriched.personality.bigFive = this.generateBasicBigFive(enriched);
        enriched.personality.temperament = calculateTemperament(enriched.personality.bigFive);
      }
    }

    // Ensure temperament is calculated
    if (enriched.personality?.bigFive && !enriched.personality.temperament) {
      enriched.personality.temperament = calculateTemperament(enriched.personality.bigFive);
    }

    // Initialize memory if missing
    if (!enriched.memory) {
      enriched.memory = {
        interactions: [],
        maxInteractions: 10,
        archivedSummary: ''
      };
    }

    // Initialize relationships if missing
    if (!enriched.relationships) {
      enriched.relationships = {};
    }

    // Note: Portrait resolution moved to display layer (portraitResolver.js)
    // Portraits are now resolved on-demand when displaying entities, not during enrichment

    return enriched;
  }

  /**
   * Enrich item with procedural data
   * @param {Object} item - Item entity
   * @returns {Object} Enriched item
   */
  enrichItem(item) {
    const enriched = { ...item };

    if (this.generators.item) {
      // Generate appearance if missing
      if (!enriched.appearance || !enriched.appearance.form) {
        enriched.appearance = this.generators.item.generateAppearance(enriched);
      }

      // Generate combat properties if missing
      if (!enriched.combat) {
        enriched.combat = this.generators.item.generateCombatProperties(enriched);
      }
    }

    return enriched;
  }

  /**
   * Generate basic Big Five scores (fallback)
   * @param {Object} npc - NPC entity
   * @returns {Object} Big Five scores
   */
  generateBasicBigFive(npc) {
    // Base random scores
    const random = () => Math.floor(Math.random() * 40) + 30; // 30-70

    const bigFive = {
      openness: random(),
      conscientiousness: random(),
      extroversion: random(),
      agreeableness: random(),
      neuroticism: random()
    };

    // Occupation modifiers
    const occupationMods = {
      merchant: { extroversion: 15, agreeableness: 10 },
      soldier: { conscientiousness: 15, neuroticism: -10 },
      scholar: { openness: 20, extroversion: -10 },
      priest: { agreeableness: 15, conscientiousness: 10 },
      beggar: { neuroticism: 15, agreeableness: -10 }
    };

    if (npc.social?.occupation && occupationMods[npc.social.occupation]) {
      const mods = occupationMods[npc.social.occupation];
      Object.keys(mods).forEach(trait => {
        bigFive[trait] = Math.max(0, Math.min(100, bigFive[trait] + mods[trait]));
      });
    }

    return bigFive;
  }

  /**
   * Get entity by ID (with lazy enrichment)
   * @param {string} id - Entity ID
   * @returns {Object|null} Enriched entity or null
   */
  getById(id) {
    const rawEntity = this.entities.get(id);
    if (!rawEntity) return null;

    // Check if already enriched (cached)
    if (this.enrichedEntities.has(id)) {
      return this.enrichedEntities.get(id);
    }

    // Enrich on-demand
    const logKey = `enrich:${id}`;
    if (!this.loggedMessages.has(logKey)) {
      console.log(`[EntityManager] Lazy enriching: ${rawEntity.name}`);
      this.loggedMessages.add(logKey);
    }
    const enriched = this.enrichEntity(rawEntity);

    // Cache enriched version
    this.enrichedEntities.set(id, enriched);

    return enriched;
  }

  /**
   * Get entity by name (fuzzy match, with lazy enrichment)
   * @param {string} name - Entity name
   * @returns {Object|null} Enriched entity or null
   */
  getByName(name) {
    const normalized = this.normalizeName(name);

    // Exact match
    if (this.entitiesByName.has(normalized)) {
      const rawEntity = this.entitiesByName.get(normalized);
      return this.getById(rawEntity.id); // Use getById for lazy enrichment
    }

    // Fuzzy match
    for (const [entityName, entity] of this.entitiesByName.entries()) {
      if (entityName.includes(normalized) || normalized.includes(entityName)) {
        return this.getById(entity.id); // Use getById for lazy enrichment
      }
    }

    return null;
  }

  /**
   * Get RAW entity by name (NO enrichment - for simple property checks)
   * @param {string} name - Entity name
   * @returns {Object|null} Raw entity or null
   */
  getRawByName(name) {
    const normalized = this.normalizeName(name);

    // Exact match
    if (this.entitiesByName.has(normalized)) {
      return this.entitiesByName.get(normalized);
    }

    // Fuzzy match
    for (const [entityName, entity] of this.entitiesByName.entries()) {
      if (entityName.includes(normalized) || normalized.includes(entityName)) {
        return entity;
      }
    }

    return null;
  }

  /**
   * Get all entities of a type
   * @param {string} type - Entity type
   * @returns {Array} Array of entities
   */
  getByType(type) {
    return this.entitiesByType.get(type) || [];
  }

  /**
   * Get all entities of a tier
   * @param {string} tier - Tier level
   * @returns {Array} Array of entities
   */
  getByTier(tier) {
    return this.entitiesByTier.get(tier) || [];
  }

  /**
   * Get all clickable entities
   * @returns {Array} Array of clickable entities
   */
  getClickableEntities() {
    return Array.from(this.entities.values()).filter(e => e.clickable);
  }

  /**
   * Update entity (immutable)
   * @param {string} id - Entity ID
   * @param {Object} updates - Updates to apply
   * @returns {Object} Updated entity
   */
  update(id, updates) {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Entity ${id} not found`);
    }

    // Deep merge updates
    const updated = this.deepMerge(entity, updates);

    // Update metadata
    updated.metadata = {
      ...updated.metadata,
      lastModified: Date.now()
    };

    // Store
    this.entities.set(id, updated);

    // Update type list
    const typeList = this.entitiesByType.get(entity.entityType);
    if (typeList) {
      const index = typeList.findIndex(e => e.id === id);
      if (index !== -1) {
        typeList[index] = updated;
      }
    }

    // Update name index if name changed
    if (updates.name && updates.name !== entity.name) {
      this.entitiesByName.delete(this.normalizeName(entity.name));
      this.entitiesByName.set(this.normalizeName(updated.name), updated);
      this.nameRegexCache.clear();
    }

    // Trigger save callback
    if (this.onSave) {
      this.onSave();
    }

    return updated;
  }

  /**
   * Deep merge two objects (immutable)
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    const output = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }

  /**
   * Delete entity
   * @param {string} id - Entity ID
   * @returns {boolean} Success
   */
  delete(id) {
    const entity = this.entities.get(id);
    if (!entity) return false;

    // Remove from main map
    this.entities.delete(id);

    // Remove from type list
    const typeList = this.entitiesByType.get(entity.entityType);
    if (typeList) {
      const filtered = typeList.filter(e => e.id !== id);
      this.entitiesByType.set(entity.entityType, filtered);
    }

    // Remove from name index
    this.entitiesByName.delete(this.normalizeName(entity.name));

    // Clear cache
    this.nameRegexCache.clear();

    console.log(`[EntityManager] Deleted ${id}`);
    return true;
  }

  /**
   * Find entities in text (for narrative highlighting)
   * @param {string} text - Text to search
   * @returns {Array} Array of entities found in text
   */
  findEntitiesInText(text) {
    if (!text) return [];

    const found = [];
    const lowerText = text.toLowerCase();

    for (const entity of this.entities.values()) {
      if (!entity.clickable) continue;

      // Use cached regex or create new
      let regex = this.nameRegexCache.get(entity.id);
      if (!regex) {
        const escapedName = entity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`\\b${escapedName}\\b`, 'i');
        this.nameRegexCache.set(entity.id, regex);
      }

      if (regex.test(text)) {
        found.push(entity);
      }
    }

    // Sort by name length (longest first) to avoid partial matches
    return found.sort((a, b) => b.name.length - a.name.length);
  }

  /**
   * Normalize name for lookup
   * Strips articles (a, an, the) to improve fuzzy matching
   * @param {string} name - Name to normalize
   * @returns {string} Normalized name
   */
  normalizeName(name) {
    if (!name) return '';

    // Strip leading articles before normalizing
    // This allows "a young woman" to match "the young woman"
    const withoutArticles = name.replace(/^(a|an|the)\s+/i, '');

    // Lowercase, trim, and remove special characters
    return withoutArticles.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  }

  /**
   * Get all entities
   * @returns {Array} All entities
   */
  getAll() {
    return Array.from(this.entities.values());
  }

  /**
   * Get entity count
   * @returns {number} Number of entities
   */
  count() {
    return this.entities.size;
  }

  /**
   * Clear all entities (for testing)
   */
  clear() {
    this.entities.clear();
    this.entitiesByType.forEach(list => list.length = 0);
    this.entitiesByName.clear();
    this.entitiesByTier.forEach(list => list.length = 0);
    this.nameRegexCache.clear();
    console.log('[EntityManager] Cleared all entities');
  }

  /**
   * Export entities to JSON
   * @returns {Array} Array of entities
   */
  exportToJSON() {
    return Array.from(this.entities.values());
  }

  /**
   * Import entities from JSON
   * @param {Array} entities - Array of entity objects
   */
  importFromJSON(entities) {
    entities.forEach(entity => {
      try {
        this.register(entity);
      } catch (error) {
        console.error(`[EntityManager] Failed to import entity ${entity.id}:`, error);
      }
    });
    console.log(`[EntityManager] Imported ${entities.length} entities`);
  }

  /**
   * Get statistics
   * @returns {Object} Stats object
   */
  getStats() {
    const stats = {
      total: this.entities.size,
      byType: {},
      byTier: {},
      clickable: 0
    };

    for (const [type, list] of this.entitiesByType.entries()) {
      stats.byType[type] = list.length;
    }

    for (const [tier, list] of this.entitiesByTier.entries()) {
      stats.byTier[tier] = list.length;
    }

    stats.clickable = this.getClickableEntities().length;

    return stats;
  }

  /**
   * Search entities by query
   * @param {Object} query - Query object
   * @returns {Array} Matching entities
   */
  search(query) {
    let results = Array.from(this.entities.values());

    // Filter by type
    if (query.type) {
      results = results.filter(e => e.entityType === query.type);
    }

    // Filter by tier
    if (query.tier) {
      results = results.filter(e => e.tier === query.tier);
    }

    // Filter by name (partial match)
    if (query.name) {
      const normalized = this.normalizeName(query.name);
      results = results.filter(e =>
        this.normalizeName(e.name).includes(normalized)
      );
    }

    // Filter by custom predicate
    if (query.filter && typeof query.filter === 'function') {
      results = results.filter(query.filter);
    }

    return results;
  }
}

// Create singleton instance
export const entityManager = new EntityManager();

// Export class for testing
export default EntityManager;
