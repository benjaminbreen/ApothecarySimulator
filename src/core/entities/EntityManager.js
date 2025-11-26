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
        // console.log(`[EntityManager] Auto-generated ID: ${entity.id}`);
        this.loggedMessages.add(logKey);
      }
    }

    // Validate
    if (!entity.id || !entity.entityType) {
      throw new Error('Entity must have id and entityType');
    }

    // Check if already exists by ID
    if (this.entities.has(entity.id)) {
      // Only log warning once per entity to prevent spam
      if (!this.loggedWarnings.has(entity.id)) {
        console.warn(`[EntityManager] Entity ${entity.id} already exists, updating...`);
        this.loggedWarnings.add(entity.id);
      }
      return this.update(entity.id, entity);
    }

    // CRITICAL: Check if entity with same normalized name already exists
    // This prevents duplicate entities like "Sergeant Miguel Cordero" and "Miguel Cordero"
    if (entity.name) {
      const normalizedName = this.normalizeName(entity.name);
      const existingByName = this.entitiesByName.get(normalizedName);

      if (existingByName && existingByName.id !== entity.id) {
        const logKey = `duplicate-name:${normalizedName}`;
        if (!this.loggedWarnings.has(logKey)) {
          console.warn(
            `[EntityManager] Duplicate entity detected! "${entity.name}" matches existing "${existingByName.name}" ` +
            `(ID: ${existingByName.id}). Updating existing entity instead of creating duplicate.`
          );
          this.loggedWarnings.add(logKey);
        }
        // Update the existing entity with new data
        return this.update(existingByName.id, entity);
      }
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

    // Cache portrait if entity has demographics (for NPCs and patients)
    // This ensures portraits are resolved once and cached for future lookups
    if ((entity.entityType === 'npc' || entity.entityType === 'patient') &&
        (entity.gender || entity.age) &&
        !entity._portraitPath) {
      try {
        const { resolvePortrait } = require('../services/portraitResolver');
        const portraitPath = resolvePortrait(entity);
        // resolvePortrait() automatically caches to entity._portraitPath
        if (portraitPath) {
          const cacheLogKey = `portrait-cache:${entity.id}`;
          if (!this.loggedMessages.has(cacheLogKey)) {
            console.log(`[EntityManager] Cached portrait on registration for ${entity.name}: ${portraitPath}`);
            this.loggedMessages.add(cacheLogKey);
          }
        }
      } catch (error) {
        console.warn(`[EntityManager] Could not cache portrait for ${entity.name}:`, error.message);
      }
    }

    // Only log registration once per entity
    const logKey = `register:${entity.id}`;
    if (!this.loggedMessages.has(logKey)) {
      // console.log(`[EntityManager] Registered ${entity.entityType}: ${entity.name} (${entity.id}) [LAZY]`);
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
   * Infer faction from NPC occupation, social class, and casta
   * Maps NPCs to reputation system factions for relationship → reputation conversion
   * @param {Object} entity - NPC entity
   * @returns {string} Faction name (church, elite, commonFolk, indigenous, guild, merchants)
   */
  inferFaction(entity) {
    const occupation = (entity.social?.occupation || entity.occupation || '').toLowerCase();
    const socialClass = entity.social?.class || entity.social?.socialClass || 'common';
    const casta = entity.social?.casta || '';

    if (!occupation) return socialClass === 'elite' ? 'elite' : 'commonFolk';

    // Church faction
    if (occupation.includes('priest') || occupation.includes('padre') || occupation.includes('friar') ||
        occupation.includes('monk') || occupation.includes('nun') || occupation.includes('clergy') ||
        occupation.includes('sacristan') || occupation.includes('bishop') || occupation.includes('inquisit') ||
        occupation.includes('holy office')) {
      return 'church';
    }

    // Elite faction (nobility, high officials)
    if (occupation.includes('noble') || occupation.includes('viceroy') || occupation.includes('alcalde') ||
        occupation.includes('corregidor') || occupation.includes('oidor') || occupation.includes('patron') ||
        occupation.includes('hidalgo') || occupation.includes('don ') || occupation.includes('doña') ||
        socialClass === 'elite') {
      return 'elite';
    }

    // Merchants faction
    if (occupation.includes('merchant') || occupation.includes('trader') || occupation.includes('comerciante') ||
        occupation.includes('vendor') || occupation.includes('seller') || occupation.includes('shopkeeper')) {
      return 'merchants';
    }

    // Guild faction (artisans, skilled workers)
    if (occupation.includes('apothecary') || occupation.includes('physician') || occupation.includes('surgeon') ||
        occupation.includes('artisan') || occupation.includes('cobbler') || occupation.includes('blacksmith') ||
        occupation.includes('tailor') || occupation.includes('carpenter') || occupation.includes('mason') ||
        occupation.includes('baker') || occupation.includes('silversmith') || occupation.includes('printer')) {
      return 'guild';
    }

    // Indigenous faction
    if (casta && (casta.toLowerCase().includes('indígena') || casta.toLowerCase().includes('india') ||
        casta.toLowerCase().includes('nahua') || casta.toLowerCase().includes('aztec'))) {
      return 'indigenous';
    }

    // Common folk (default for workers, servants, etc.)
    return 'commonFolk';
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

    // Step 2: Skip procedural enrichment for LLM-provided entities
    // LLM-provided entities already have complete, curated data
    if (enriched.llmProvided === true) {
      const logKey = `skip-enrich:${enriched.id || enriched.name}`;
      if (!this.loggedMessages.has(logKey)) {
        console.log(`[EntityManager] Skipping procedural enrichment for LLM-provided entity: ${enriched.name}`);
        this.loggedMessages.add(logKey);
      }
      return enriched;
    }

    // Step 3: Infer gender if still missing
    // CRITICAL FIX: Handle case where appearance is a string instead of object
    if (!enriched.appearance || typeof enriched.appearance !== 'object' || Array.isArray(enriched.appearance)) {
      const oldDescription = typeof enriched.appearance === 'string' ? enriched.appearance : null;
      enriched.appearance = {};
      if (oldDescription) {
        enriched.appearance.description = oldDescription;
        console.log(`[EntityManager] Converted string appearance to object for ${enriched.name}`);
      }
    }

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

    // Step 4: Infer faction if missing (for reputation system)
    // CRITICAL FIX: Handle case where social is a string instead of object
    if (!enriched.social || typeof enriched.social !== 'object' || Array.isArray(enriched.social)) {
      const oldDescription = typeof enriched.social === 'string' ? enriched.social : null;
      enriched.social = {};
      if (oldDescription) {
        enriched.social.description = oldDescription;
        console.log(`[EntityManager] Converted string social to object for ${enriched.name}`);
      }
    }

    if (!enriched.social.faction) {
      const inferredFaction = this.inferFaction(enriched);
      enriched.social.faction = inferredFaction;
      const logKey = `faction:${enriched.id || enriched.name}`;
      if (!this.loggedMessages.has(logKey)) {
        console.log(`[EntityManager] Inferred faction for ${enriched.name}: ${inferredFaction} (from ${enriched.social.occupation || 'no occupation'})`);
        this.loggedMessages.add(logKey);
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
        // CRITICAL FIX: Handle case where personality is a string
        if (!enriched.personality || typeof enriched.personality !== 'object' || Array.isArray(enriched.personality)) {
          const oldDescription = typeof enriched.personality === 'string' ? enriched.personality : null;
          enriched.personality = {};
          if (oldDescription) {
            enriched.personality.description = oldDescription;
            console.log(`[EntityManager] Converted string personality to object for ${enriched.name}`);
          }
        }
        enriched.personality.bigFive = this.generateBasicBigFive(enriched);
        enriched.personality.temperament = calculateTemperament(enriched.personality.bigFive);
      }
    }

    // Ensure temperament is calculated
    if (enriched.personality?.bigFive && !enriched.personality.temperament) {
      enriched.personality.temperament = calculateTemperament(enriched.personality.bigFive);
    }

    // Initialize memory if missing
    // CRITICAL FIX: Handle case where memory is a string
    if (!enriched.memory || typeof enriched.memory !== 'object' || Array.isArray(enriched.memory)) {
      const oldDescription = typeof enriched.memory === 'string' ? enriched.memory : null;
      enriched.memory = {
        interactions: [],
        maxInteractions: 10,
        archivedSummary: oldDescription || ''
      };
      if (oldDescription) {
        console.log(`[EntityManager] Converted string memory to object for ${enriched.name}`);
      }
    }

    // Initialize relationships if missing
    // CRITICAL FIX: Handle case where relationships is a string
    if (!enriched.relationships || typeof enriched.relationships !== 'object' || Array.isArray(enriched.relationships)) {
      const oldDescription = typeof enriched.relationships === 'string' ? enriched.relationships : null;
      enriched.relationships = {};
      if (oldDescription) {
        enriched.relationships.description = oldDescription;
        console.log(`[EntityManager] Converted string relationships to object for ${enriched.name}`);
      }
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

    // Fuzzy match (stricter: only match if search term is at start or preceded by underscore/space)
    // This prevents "Inés" from matching "Sor Juana Inés de la Cruz"
    for (const [entityName, entity] of this.entitiesByName.entries()) {
      // Match if search term starts the entity name
      if (entityName.startsWith(normalized)) {
        return this.getById(entity.id);
      }
      // Match if search term is a complete word (preceded by underscore)
      if (entityName.includes('_' + normalized + '_') || entityName.endsWith('_' + normalized)) {
        return this.getById(entity.id);
      }
      // Reverse: entity name is contained in search (e.g., searching "Sor Juana Inés" finds "Sor Juana")
      if (normalized.includes(entityName)) {
        return this.getById(entity.id);
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

    // CRITICAL: Always preserve portrait cache from original entity
    // Non-enumerable properties are lost during deepMerge, so restore them
    if (entity._portraitPath) {
      try {
        Object.defineProperty(updated, '_portraitPath', {
          value: entity._portraitPath,
          writable: true,
          enumerable: false,
          configurable: true
        });
        console.log(`[EntityManager] Preserved portrait cache during update for ${updated.name}: ${entity._portraitPath}`);
      } catch (error) {
        console.warn(`[EntityManager] Could not preserve portrait cache for ${updated.name}:`, error.message);
      }
    }
    // If updates object explicitly includes a new portrait path, cache it
    else if (updates._portraitPath) {
      try {
        Object.defineProperty(updated, '_portraitPath', {
          value: updates._portraitPath,
          writable: true,
          enumerable: false,
          configurable: true
        });
        console.log(`[EntityManager] Cached new portrait during update for ${updated.name}: ${updates._portraitPath}`);
      } catch (error) {
        console.warn(`[EntityManager] Could not cache new portrait for ${updated.name}:`, error.message);
      }
    }

    // Update metadata
    updated.metadata = {
      ...updated.metadata,
      lastModified: Date.now()
    };

    // Store
    this.entities.set(id, updated);

    // BUG FIX #8: Handle entityType changes
    const oldType = entity.entityType;
    const newType = updated.entityType;
    if (newType && newType !== oldType) {
      // Remove from old type list
      const oldTypeList = this.entitiesByType.get(oldType);
      if (oldTypeList) {
        const index = oldTypeList.findIndex(e => e.id === id);
        if (index !== -1) {
          oldTypeList.splice(index, 1);
        }
      }

      // Add to new type list
      const newTypeList = this.entitiesByType.get(newType);
      if (newTypeList) {
        newTypeList.push(updated);
      }

      console.log(`[EntityManager] Entity ${id} type changed: ${oldType} → ${newType}`);
    } else {
      // Update type list (type didn't change)
      const typeList = this.entitiesByType.get(oldType);
      if (typeList) {
        const index = typeList.findIndex(e => e.id === id);
        if (index !== -1) {
          typeList[index] = updated;
        }
      }
    }

    // BUG FIX #8: Handle tier changes
    const oldTier = entity.tier;
    const newTier = updated.tier;
    if (newTier && newTier !== oldTier) {
      // Remove from old tier list
      if (oldTier) {
        const oldTierList = this.entitiesByTier.get(oldTier);
        if (oldTierList) {
          const index = oldTierList.findIndex(e => e.id === id);
          if (index !== -1) {
            oldTierList.splice(index, 1);
          }
        }
      }

      // Add to new tier list
      const newTierList = this.entitiesByTier.get(newTier);
      if (newTierList) {
        newTierList.push(updated);
      }

      console.log(`[EntityManager] Entity ${id} tier changed: ${oldTier} → ${newTier}`);
    } else if (oldTier) {
      // Update tier list (tier didn't change)
      const tierList = this.entitiesByTier.get(oldTier);
      if (tierList) {
        const index = tierList.findIndex(e => e.id === id);
        if (index !== -1) {
          tierList[index] = updated;
        }
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

/**
 * GUARD 4: Sanitize patient names to remove furniture/object words
 * Fixes bug where "my master" + "bed" in scene → "Master Bed"
 * @param {string} name - Patient name to sanitize
 * @returns {string} Cleaned name
 */
export function sanitizePatientName(name) {
  if (!name || typeof name !== 'string') return 'patient';

  const furnitureWords = [
    'bed', 'table', 'cabinet', 'shelf', 'chair', 'door',
    'window', 'counter', 'wall', 'floor', 'ceiling', 'bench',
    'stool', 'dresser', 'chest', 'wardrobe', 'mirror'
  ];

  let cleaned = name.trim();

  // Remove furniture words at the end (e.g., "Master Bed" → "Master")
  furnitureWords.forEach(word => {
    const pattern = new RegExp(`\\s+${word}$`, 'i');
    cleaned = cleaned.replace(pattern, '');
  });

  // If entire name was a furniture word, return generic
  if (!cleaned || furnitureWords.includes(cleaned.toLowerCase())) {
    return 'patient';
  }

  return cleaned;
}

// Create singleton instance
export const entityManager = new EntityManager();

// Export class for testing
export default EntityManager;
