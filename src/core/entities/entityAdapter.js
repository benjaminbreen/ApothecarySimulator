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
 * Format family summary from structured family object or string
 * Handles deduplication and formatting for display
 * @param {Object} entity - Entity object
 * @returns {string|null} Formatted family summary
 */
function formatFamilySummary(entity) {
  // If already a valid string, return it (but check for duplicates)
  if (typeof entity.family === 'string' && entity.family) {
    // Remove duplicate sentences by splitting and filtering
    const sentences = entity.family.split('. ').filter((s, i, arr) => {
      // Keep sentence if it's the first occurrence
      return arr.indexOf(s) === i && s.trim().length > 0;
    });
    return sentences.join('. ').trim();
  }

  // If structured family object exists in biography
  if (entity.biography?.family && typeof entity.biography.family === 'object') {
    const f = entity.biography.family;
    if (!f.summary) return null;

    const living = f.summary.livingMembers || 0;
    if (living === 0) return 'No immediate family present in Mexico City.';

    const parts = [];
    const livingParents = f.parents?.filter(p => p.living) || [];
    const livingSiblings = f.siblings?.filter(s => s.living) || [];
    const livingChildren = f.children?.filter(c => c.living) || [];

    if (livingParents.length > 0) parts.push(`${livingParents.length} parent(s)`);
    if (livingSiblings.length > 0) parts.push(`${livingSiblings.length} sibling(s)`);
    if (f.spouse?.living) parts.push('spouse');
    if (livingChildren.length > 0) parts.push(`${livingChildren.length} child(ren)`);

    return `Has ${living} living family member(s) in the region: ${parts.join(', ')}.`;
  }

  return null;
}

/**
 * Adapt entity for Patient Modal (converts nested to flat)
 * @param {Object} entity - Entity object (new or old format)
 * @returns {Object} Flat entity object for modal consumption
 */
export function adaptEntityForPatientModal(entity) {
  if (!entity) return null;

  console.log('[entityAdapter] Adapting patient entity:', {
    name: entity.name,
    hasImage: !!entity.image,
    hasVisualImage: !!entity.visual?.image,
    hasDiagnosis: !!entity.diagnosis,
    hasMedicalDiagnosis: !!entity.medical?.diagnosis,
    hasMedicalRecordDiagnoses: !!entity.medicalRecord?.diagnoses?.length,
    hasSymptoms: !!entity.symptoms,
    hasMedicalSymptoms: !!entity.medical?.symptoms
  });

  // If already in flat format, return as-is
  if (entity.age && entity.symptoms && !entity.appearance && !entity.medical) {
    return entity;
  }

  // DIAGNOSIS EXTRACTION: Check multiple locations
  // 1. Flat field (from DiagnosisPanel submission)
  // 2. Medical record (from patient Q&A extraction)
  // 3. Nested medical object (from entity enrichment)
  let diagnosis = '';
  if (entity.diagnosis) {
    diagnosis = entity.diagnosis;
  } else if (entity.medicalRecord?.diagnoses?.length > 0) {
    // Get the most recent diagnosis
    const latestDiagnosis = entity.medicalRecord.diagnoses[entity.medicalRecord.diagnoses.length - 1];
    diagnosis = latestDiagnosis.diagnosis || '';
  } else if (entity.medical?.diagnosis) {
    diagnosis = entity.medical.diagnosis;
  }

  console.log('[entityAdapter] Extracted diagnosis:', diagnosis);

  // PORTRAIT EXTRACTION: Check multiple locations and ensure proper path format
  const resolvedPortrait = resolvePortrait(entity);
  const imageField = entity.visual?.image || entity.image || '';

  // Ensure portrait path starts with /portraits/ if it's just a filename
  let finalPortrait = resolvedPortrait || imageField;
  if (finalPortrait && !finalPortrait.startsWith('/') && !finalPortrait.startsWith('http')) {
    finalPortrait = `/portraits/${finalPortrait}`;
  }

  console.log('[entityAdapter] Portrait extraction:', {
    resolvedPortrait,
    imageField,
    finalPortrait
  });

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
    portrait: finalPortrait, // Use resolved portrait

    // Medical data (nested → flat)
    symptoms: entity.medical?.symptoms || entity.symptoms || [],
    diagnosis, // Use extracted diagnosis from multiple sources
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

    // Background fields (for Background tab in NPCPatientModal)
    family: formatFamilySummary(entity),
    background: entity.biography?.narrative || entity.background || '',
    personality: typeof entity.personality === 'string'
      ? entity.personality
      : (entity.personality?.description || entity.personality?.traits?.join(', ') || ''),
    relationships: entity.relationships || '',

    // Additional fields
    image: imageField,
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

  // Check if entity is fully nested (ALL major objects are proper objects, not strings)
  const isFullyNested =
    (entity.appearance && typeof entity.appearance === 'object' && (entity.appearance.age || entity.appearance.gender)) &&
    (entity.personality && typeof entity.personality === 'object' && entity.personality.bigFive) &&
    (entity.social && typeof entity.social === 'object' && entity.social.occupation);

  // If fully nested format, return as-is
  if (isFullyNested) {
    return entity;
  }

  // Otherwise, convert to nested format
  // Handle appearance: if it's a string (LLM-generated), preserve it; otherwise build object
  let appearance = entity.appearance;
  if (typeof appearance !== 'string') {
    // Build object from individual fields
    appearance = {
      age: entity.age,
      gender: entity.gender,
      height: entity.height,
      build: entity.build,
      face: entity.face || {},
      hair: entity.hair || {},
      distinguishingFeatures: entity.distinguishingFeatures || []
    };
  }

  // Handle personality: if it's a string (LLM-generated), parse it; otherwise use object
  let personality = entity.personality;
  if (typeof personality === 'string') {
    // LLM gave us personality as a string (e.g., "anxious, formal")
    const traits = personality.split(',').map(t => t.trim()).filter(t => t.length > 0);
    personality = {
      bigFive: {},
      temperament: {},
      traits
    };
  } else if (typeof personality !== 'object') {
    personality = {
      bigFive: {},
      temperament: {},
      traits: []
    };
  }

  return {
    name: entity.name,
    id: entity.id,
    entityType: entity.type || entity.entityType,
    description: entity.description || '',

    visual: {
      emoji: entity.visual?.emoji || '👤',
      image: entity.image || entity.portrait || null
    },

    appearance,

    personality,

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
