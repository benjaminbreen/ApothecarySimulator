/**
 * Furniture Storage Configuration
 * Defines storage capacity, allowed item types, and special features for furniture entities
 */

export const FURNITURE_STORAGE_CONFIG = {
  // SHOP FLOOR FURNITURE
  'Drug Cabinet': {
    hasStorage: true,
    hasFalseBottom: false,
    capacity: 20,
    allowedTypes: ['materia_medica', 'compound', 'medicine', 'prepared_remedy', 'item', 'misc'],
    description: 'Stores prepared medicines and compounds for display and sale',
    openImage: 'drug_cabinet_open.png'
  },

  'Sales Counter': {
    hasStorage: false,
    description: 'Working counter for transactions and measuring herbs'
  },

  // LABORATORY FURNITURE
  'Workbench': {
    hasStorage: false,
    description: 'Laboratory workbench for alchemical operations'
  },

  'Herb Shelf': {
    hasStorage: false,
    description: 'Tall shelf organizing herbs and botanicals from three continents'
  },

  // BEDROOM FURNITURE
  'Bed': {
    hasStorage: false,
    description: 'Simple bed for resting'
  },

  'Bookshelf': {
    hasStorage: false,
    description: 'Wooden shelf holding medical texts and personal volumes'
  },

  'Clothing Chest': {
    hasStorage: true,
    hasFalseBottom: true, // SPECIAL FEATURE: hidden compartment
    capacity: 15,
    hiddenCapacity: 5,
    allowedTypes: ['clothing', 'textile', 'personal', 'jewelry', 'document', 'valuables', 'item', 'misc'],
    hiddenAllowedTypes: ['document', 'jewelry', 'valuables', 'contraband', 'prohibited_book', 'evidence', 'item', 'misc'],
    description: 'Iron-bound chest with secret false bottom for concealing dangerous items',
    openImage: 'clothing_chest_open.png'
  },

  // FURNITURE WITHOUT STORAGE (for future reference)
  'Waiting Chair': {
    hasStorage: false,
    description: 'Wicker chair for seating only'
  }
};

/**
 * Check if a furniture item has storage capability
 * @param {string} furnitureName - Name of the furniture entity
 * @returns {boolean}
 */
export function hasStorage(furnitureName) {
  const config = FURNITURE_STORAGE_CONFIG[furnitureName];
  return config?.hasStorage ?? false;
}

/**
 * Check if a furniture item has a false bottom (hidden storage)
 * @param {string} furnitureName - Name of the furniture entity
 * @returns {boolean}
 */
export function hasFalseBottom(furnitureName) {
  const config = FURNITURE_STORAGE_CONFIG[furnitureName];
  return config?.hasFalseBottom ?? false;
}

/**
 * Get storage configuration for a furniture item
 * @param {string} furnitureName - Name of the furniture entity
 * @returns {object|null}
 */
export function getStorageConfig(furnitureName) {
  return FURNITURE_STORAGE_CONFIG[furnitureName] || null;
}

/**
 * Validate if an item type can be stored in the furniture
 * @param {string} furnitureName - Name of the furniture entity
 * @param {string} itemType - Type/category of the item
 * @param {boolean} isHidden - Whether storing in false bottom (hidden compartment)
 * @returns {boolean}
 */
export function canStoreItemType(furnitureName, itemType, isHidden = false) {
  const config = FURNITURE_STORAGE_CONFIG[furnitureName];
  if (!config?.hasStorage) return false;

  // If trying to store in hidden compartment, check if furniture has false bottom
  if (isHidden && !config.hasFalseBottom) return false;

  const allowedTypes = isHidden ? config.hiddenAllowedTypes : config.allowedTypes;
  if (!allowedTypes) return false;

  // Check if item type matches any allowed type (case-insensitive, flexible matching)
  const normalizedItemType = itemType.toLowerCase();
  return allowedTypes.some(allowedType =>
    normalizedItemType.includes(allowedType.toLowerCase()) ||
    allowedType.toLowerCase().includes(normalizedItemType)
  );
}

/**
 * Get the open-state image path for a furniture item
 * @param {string} furnitureName - Name of the furniture entity
 * @returns {string|null}
 */
export function getOpenImagePath(furnitureName) {
  const config = FURNITURE_STORAGE_CONFIG[furnitureName];
  if (!config?.openImage) return null;
  return `/details/${config.openImage}`;
}
