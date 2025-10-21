/**
 * Medicine Categorization Schema
 *
 * A game-spanning taxonomy for materia medica across all scenarios.
 * Based on early modern medical practice, particularly 16th-18th century.
 *
 * Design principles:
 * - Universal categories work across 1680 Mexico, 1880 London, 1940 NYC, etc.
 * - Historically grounded (simples vs compounds, Galenic vs chemical)
 * - Gameplay-relevant (affects pricing, availability, complexity)
 * - Extensible for future scenarios
 *
 * @module medicineCategories
 */

/**
 * Primary Medicine Type Categories
 *
 * These are mutually exclusive - each medicine belongs to ONE primary type.
 */
export const MEDICINE_TYPES = {
  // Single-ingredient natural medicines (herbs, minerals, animal parts)
  SIMPLES: {
    id: 'simples',
    name: 'Simples',
    description: 'Single-ingredient natural medicines - herbs, minerals, animal parts',
    emoji: '🌿',
    color: '#22c55e', // green
    examples: ['Chamomile', 'Mandrake Root', 'Sulfur', 'Unicorn Horn (Narwhal tusk)'],
    historicalContext: 'The foundation of Galenic medicine. Apothecaries kept dried simples in jars.'
  },

  // Multi-ingredient preparations following recipes
  COMPOUNDS: {
    id: 'compounds',
    name: 'Compounds',
    description: 'Multi-ingredient preparations mixed by the apothecary',
    emoji: '⚗️',
    color: '#8b5cf6', // purple
    examples: ['Theriac (Venice Treacle)', 'Mithridatum', 'Oxymel', 'Electuary'],
    historicalContext: 'Complex recipes often requiring dozens of ingredients. Theriac had 60+ components.'
  },

  // Exotic imports from trade routes (spices, Indies drugs)
  INDIES_DRUGS: {
    id: 'indies_drugs',
    name: 'Indies Drugs',
    description: 'Exotic imports from the Americas, Asia, and Africa',
    emoji: '🚢',
    color: '#f59e0b', // amber
    examples: ['Quina (Cinchona)', 'Cacao', 'Tobacco', 'Cinnamon', 'Dragon\'s Blood'],
    historicalContext: 'Highly prized imports. The "Drug of the Indies" trade made fortunes.'
  },

  // Alchemical/chemical preparations (distillations, calcinations)
  ALCHEMICAL: {
    id: 'alchemical',
    name: 'Alchemical',
    description: 'Chemically prepared medicines through distillation, calcination, or other processes',
    emoji: '🔬',
    color: '#ef4444', // red
    examples: ['Aqua Vitae (distilled spirits)', 'Sal Ammoniac', 'Magistery of Pearl', 'Philosophers\' Stone'],
    historicalContext: 'Paracelsian "spagyric" medicine challenged Galenic orthodoxy in the 16th century.'
  },

  // Medicinal foods (dietary medicine)
  FOODS: {
    id: 'foods',
    name: 'Medicinal Foods',
    description: 'Foods used medicinally - broths, syrups, dietary regimens',
    emoji: '🍲',
    color: '#ec4899', // pink
    examples: ['Barley Water', 'Possets', 'Julep', 'Caudle', 'Restorative Broths'],
    historicalContext: 'The "non-naturals" (diet, air, exercise) were key to Galenic health.'
  },

  // Animal-derived (not simples - these are processed)
  ANIMAL_PRODUCTS: {
    id: 'animal_products',
    name: 'Animal Products',
    description: 'Processed medicines derived from animals',
    emoji: '🦴',
    color: '#a855f7', // purple-lighter
    examples: ['Bezoar Stone', 'Mummy Powder', 'Viper\'s Flesh', 'Cantharides (Spanish Fly)'],
    historicalContext: 'Exotic animal parts were highly valued. Bezoars could cost a fortune.'
  }
};

/**
 * Secondary Categories (tags)
 *
 * These are non-exclusive - medicines can have multiple tags.
 */
export const MEDICINE_TAGS = {
  // Preparation methods
  DISTILLED: 'distilled',
  CALCINED: 'calcined',
  DECOCTED: 'decocted',
  INFUSED: 'infused',
  POWDERED: 'powdered',

  // Galenic qualities
  HOT: 'hot',
  COLD: 'cold',
  WET: 'wet',
  DRY: 'dry',

  // Therapeutic action
  PURGATIVE: 'purgative',
  DIURETIC: 'diuretic',
  SUDORIFIC: 'sudorific',
  CORDIAL: 'cordial',
  NARCOTIC: 'narcotic',

  // Rarity/cost
  LUXURY: 'luxury',
  COMMON: 'common',
  CONTRABAND: 'contraband',

  // Origin
  LOCAL: 'local',
  IMPORTED: 'imported',
  RARE: 'rare'
};

/**
 * Get medicine type by ID
 */
export function getMedicineType(typeId) {
  return Object.values(MEDICINE_TYPES).find(t => t.id === typeId);
}

/**
 * Get all medicine types as array
 */
export function getAllMedicineTypes() {
  return Object.values(MEDICINE_TYPES);
}

/**
 * Infer medicine type from item data
 *
 * This function attempts to categorize an item based on its properties.
 * Used for backward compatibility with items that don't have explicit medicineType.
 */
export function inferMedicineType(item) {
  const name = item.name?.toLowerCase() || '';
  const desc = item.description?.toLowerCase() || '';
  const categories = item.categories || [];

  // Check explicit medicineType first
  if (item.medicineType) {
    return item.medicineType;
  }

  // Compounds - look for complex preparations
  if (categories.includes('compound') ||
      name.includes('theriac') ||
      name.includes('electuary') ||
      name.includes('confection')) {
    return 'compounds';
  }

  // Indies Drugs - exotic imports
  if (categories.includes('imported') ||
      categories.includes('exotic') ||
      name.includes('cacao') ||
      name.includes('tobacco') ||
      name.includes('quina') ||
      name.includes('cinnamon')) {
    return 'indies_drugs';
  }

  // Alchemical - distilled or chemically prepared
  if (categories.includes('alchemical') ||
      categories.includes('distilled') ||
      name.includes('aqua') ||
      name.includes('elixir') ||
      name.includes('tincture') ||
      desc.includes('distill')) {
    return 'alchemical';
  }

  // Foods - dietary medicines
  if (categories.includes('food') ||
      categories.includes('dietary') ||
      name.includes('broth') ||
      name.includes('syrup') ||
      name.includes('julep')) {
    return 'foods';
  }

  // Animal Products
  if (categories.includes('animal') ||
      name.includes('bezoar') ||
      name.includes('mummy') ||
      name.includes('viper')) {
    return 'animal_products';
  }

  // Default to Simples (most common)
  return 'simples';
}

/**
 * Get color for medicine type
 */
export function getMedicineColor(typeId) {
  const type = getMedicineType(typeId);
  return type ? type.color : '#6b7280'; // default gray
}

/**
 * Get emoji for medicine type
 */
export function getMedicineEmoji(typeId) {
  const type = getMedicineType(typeId);
  return type ? type.emoji : '💊';
}

export default {
  MEDICINE_TYPES,
  MEDICINE_TAGS,
  getMedicineType,
  getAllMedicineTypes,
  inferMedicineType,
  getMedicineColor,
  getMedicineEmoji
};
