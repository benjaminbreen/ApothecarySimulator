/**
 * Entity Adapter
 *
 * Converts between old flat entity format and new nested schema.
 * Provides backward compatibility for modals and UI components.
 *
 * @module entityAdapter
 */

import { resolvePortrait } from '../services/portraitResolver';

/**
 * Adapt entity for Patient Modal (converts nested to flat)
 * @param {Object} entity - Entity object (new or old format)
 * @returns {Object} Flat entity object for modal consumption
 */
export function adaptEntityForPatientModal(entity) {
  if (!entity) return null;

  // If already in flat format, return as-is
  if (entity.age && entity.symptoms && !entity.appearance && !entity.medical) {
    return entity;
  }

  // Convert nested format to flat
  return {
    // Core fields
    name: entity.name,
    id: entity.id,
    type: entity.entityType || entity.type,
    description: entity.description || '',

    // Appearance (nested → flat)
    age: entity.appearance?.age || entity.age || 'Unknown',
    gender: entity.appearance?.gender || entity.gender || 'Unknown',
    portrait: resolvePortrait(entity), // Use new portrait resolver

    // Medical data (nested → flat)
    symptoms: entity.medical?.symptoms || entity.symptoms || [],
    diagnosis: entity.medical?.diagnosis || entity.diagnosis || '',
    contemporaryTheory: entity.medical?.contemporaryTheory || entity.contemporaryTheory || '',
    urgency: entity.medical?.urgency || entity.urgency || 'Moderate',
    astrologicalSign: entity.medical?.astrologicalSign || entity.astrologicalSign || '',

    // Social context
    socialContext: entity.socialContext || entity.social?.occupation || '',
    occupation: entity.social?.occupation || entity.occupation || '',
    class: entity.social?.class || entity.class || '',
    casta: entity.social?.casta || entity.casta || '',
    birthplace: entity.biography?.birthplace || entity.birthplace || '',
    currentResidence: entity.social?.currentResidence || entity.currentResidence || '',

    // Additional fields
    image: entity.visual?.image || entity.image || '',
    caption: entity.caption || '',
    secret: entity.biography?.secrets?.[0] || entity.secret || '',
    citation: entity.metadata?.citation || entity.citation || '',
    treatment: entity.treatment || '',
    ability: entity.ability || '',
    pdf: entity.pdf || '',
    imgdescription: entity.imgdescription || '',

    // Pass through the full entity for advanced features
    _enriched: entity
  };
}

/**
 * Adapt entity for NPC Modal (already uses nested format)
 * @param {Object} entity - Entity object
 * @returns {Object} Entity in nested format
 */
export function adaptEntityForNPCModal(entity) {
  if (!entity) return null;

  // If already in nested format, return as-is
  if (entity.appearance || entity.personality || entity.social) {
    return entity;
  }

  // Convert flat format to nested (for backward compatibility)
  return {
    name: entity.name,
    id: entity.id,
    entityType: entity.type || entity.entityType,
    description: entity.description || '',

    visual: {
      emoji: entity.visual?.emoji || '👤',
      image: entity.image || entity.portrait || null
    },

    appearance: {
      age: entity.age,
      gender: entity.gender,
      height: entity.height,
      build: entity.build,
      face: entity.face || {},
      hair: entity.hair || {},
      distinguishingFeatures: entity.distinguishingFeatures || []
    },

    personality: entity.personality || {
      bigFive: {},
      temperament: {},
      traits: []
    },

    social: {
      occupation: entity.occupation,
      class: entity.class,
      casta: entity.casta,
      wealth: entity.wealth,
      reputation: entity.reputation,
      faction: entity.faction
    },

    biography: entity.biography || {
      birthplace: entity.birthplace,
      birthYear: entity.birthYear,
      majorEvents: [],
      secrets: entity.secret ? [entity.secret] : []
    },

    clothing: entity.clothing || {
      style: '',
      quality: 'common',
      items: []
    },

    // Pass through original for reference
    _original: entity
  };
}

/**
 * Adapt entity for Item Modal
 * @param {Object} entity - Item entity
 * @returns {Object} Item in display format
 */
export function adaptEntityForItemModal(entity) {
  if (!entity) return null;

  return {
    name: entity.name,
    id: entity.id,
    type: entity.entityType || entity.type,
    description: entity.description || entity.lore?.genericDescription || '',

    // Visual
    image: entity.visual?.image || entity.image || null,
    emoji: entity.visual?.emoji || '📦',

    // Economic
    price: entity.value?.base || entity.price || 0,
    currency: entity.value?.currency || 'reales',
    rarity: entity.value?.rarity || 'common',

    // Properties
    properties: entity.properties || [],
    categories: entity.categories || [],

    // Medicinal
    humoralQualities: entity.medicinal?.humoralQualities || {},
    effects: entity.medicinal?.effects || [],
    preparations: entity.medicinal?.preparations || [],
    treatsConditions: entity.medicinal?.treatsConditions || [],

    // Provenance
    origin: entity.provenance?.origin?.region || '',
    knowledgeSystems: entity.provenance?.knowledgeSystems || [],
    historicalContext: entity.provenance?.historicalContext || {},

    // Crafting
    canMix: entity.crafting?.canMix || false,
    mixableWith: entity.crafting?.mixableWith || [],

    // Pass through full entity
    _enriched: entity
  };
}

/**
 * Smart adapter - detects entity type and applies correct adapter
 * @param {Object} entity - Entity object
 * @param {string} modalType - 'patient', 'npc', 'item'
 * @returns {Object} Adapted entity
 */
export function adaptEntity(entity, modalType) {
  if (!entity) return null;

  switch (modalType) {
    case 'patient':
      return adaptEntityForPatientModal(entity);

    case 'npc':
      return adaptEntityForNPCModal(entity);

    case 'item':
      return adaptEntityForItemModal(entity);

    default:
      // Auto-detect based on entity type
      const entityType = entity.entityType || entity.type;
      if (entityType === 'patient') return adaptEntityForPatientModal(entity);
      if (entityType === 'npc') return adaptEntityForNPCModal(entity);
      if (entityType === 'item') return adaptEntityForItemModal(entity);
      return entity;
  }
}

/**
 * Check if entity is in old flat format
 * @param {Object} entity
 * @returns {boolean}
 */
export function isLegacyFormat(entity) {
  if (!entity) return false;

  // Legacy format has flat fields without nested objects
  const hasNestedFormat = entity.appearance || entity.personality || entity.medical || entity.social;
  const hasFlatFormat = entity.age !== undefined || entity.symptoms !== undefined;

  return hasFlatFormat && !hasNestedFormat;
}

/**
 * Check if entity is in new nested format
 * @param {Object} entity
 * @returns {boolean}
 */
export function isEnrichedFormat(entity) {
  if (!entity) return false;

  return !!(entity.appearance || entity.personality || entity.medical || entity.social);
}

export default {
  adaptEntityForPatientModal,
  adaptEntityForNPCModal,
  adaptEntityForItemModal,
  adaptEntity,
  isLegacyFormat,
  isEnrichedFormat
};
