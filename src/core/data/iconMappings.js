/**
 * Icon Mappings for Reference Entries
 * Maps reference entry IDs to icon filenames in /public/icons/
 */

/**
 * Manual mappings for reference entries to icons
 * Key: reference entry ID
 * Value: icon filename (without path prefix)
 */
export const REFERENCE_ICON_MAPPINGS = {
  // Materia Medica
  'opium': 'opium_icon.png',
  'peruvian-bark': 'cinchona_bark_icon.png',
  'rhubarb': 'rhubarb_root_icon.png',
  'ipecacuanha': 'ipecacuanha_icon.png',
  'scammony': 'scammony_icon.png',
  'antimony': 'antimony_icon.png',
  'hartshorn': 'hartshorn_icon.png',
  'vitriol': 'vitriol_icon.png',
  'saffron': 'saffron_icon.png',
  'ginger': 'ginger_icon.png',
  'cinnamon': 'cinnamon_icon.png',
  'camphor': 'camphor_icon.png',
  'myrrh': 'myrrh_icon.png',
  'frankincense': 'frankincense_icon.png',
  'dragons-blood': 'dragons_blood_icon.png',
  'bezoar': 'bezoar_stone_icon.png',
  'quicksilver': 'quicksilver_icon.png',
  'mercury': 'quicksilver_icon.png',
  'sarsaparilla': 'sarsaparilla_icon.png',
  'guaiacum': 'guaiacum_icon.png',
  'sassafras': 'sassafras_icon.png',
  'senna': 'senna_icon.png',
  'jalap': 'jalap_icon.png',
  'mechoacan': 'mechoacan_icon.png',
  'liquidambar': 'liquidambar_icon.png',
  'copal': 'copal_resin_icon.png',
  'balsam-of-peru': 'balsam_of_peru_icon.png',
  'balsam-of-tolu': 'balsam_of_tolu_icon.png',
  'tobacco': 'tobacco_icon.png',
  'cacao': 'cacao_icon.png',
  'cochineal': 'cochineal_icon.png',
  'honey': 'honey_icon.png',
  'rose-water': 'rose_water_icon.png',
  'sugar': 'sugar_icon.png',
  'spanish-wine': 'spanish_wine_icon.png',
  'nutmeg': 'nutmeg_icon.png',
  'clove': 'clove_icon.png',
  'anise': 'anise_icon.png',
  'mastic': 'mastic_icon.png',
  'tamarind': 'tamarind_icon.png',
  'cassia': 'cassia_fistula_icon.png',
  'aloes': 'aloes_icon.png',
  'castoreum': 'castoreum_icon.png',
  'amber': 'amber_icon.png',
  'chamomile': 'chamomile_icon.png',
  'nettle': 'nettle_icon.png',
  'rue': 'rue_icon.png',
  'horehound': 'white_horehound_icon.png',
  'white-horehound': 'white_horehound_icon.png',
  'turpentine': 'turpentine_icon.png',
  'crocus-metallorum': 'crocus_metallorum_icon.png',
  'sal-ammoniac': 'sal_ammoniac_icon.png',
  'red-coral': 'red_coral_icon.png',
  'powdered-crabs-eyes': 'powdered_crabs_eyes_icon.png',
  'powdered-millipedes': 'powdered_millipedes_icon.png',

  // Treatments (use related icons)
  'bloodletting': 'scale_icon.png', // Scale for measuring humors
  'cupping': 'copper_pot_icon.png',
  'purging': 'mortar_icon.png',

  // Humoral Theory & Concepts
  'humoral-theory': 'mortar_icon.png', // Mortar & pestle as symbol of medicine
  'four-humors': 'mortar_icon.png',

  // Diseases (use related medicine icons)
  'malaria': 'cinchona_bark_icon.png', // Peruvian bark treats malaria
  'tertian-fever': 'cinchona_bark_icon.png',
  'syphilis': 'guaiacum_icon.png', // Guaiacum was used to treat syphilis
  'plague': 'rue_icon.png', // Rue was used as plague preventative
  'smallpox': 'bezoar_stone_icon.png',

  // Books & Knowledge (use book icons)
  'dioscorides': 'dioscorides_book_icon.png',
  'materia-medica': 'dioscorides_book_icon.png',
  'pharmacopoeia': 'commonplace_book_icon.png',
};

/**
 * Get icon path for a reference entry
 * Strategy:
 * 1. Check manual mappings first (for special cases/overrides)
 * 2. If not found, auto-generate filename from entry ID: {entryId}_icon.png
 * 3. Convert hyphens to underscores (e.g., 'four-qualities' → 'four_qualities_icon.png')
 * 4. Browser will attempt to load; if file doesn't exist, image will show broken icon
 *
 * This allows adding new icons by simply dropping them in /public/icons/
 * with the naming convention: {entry_id}_icon.png (underscores, not hyphens)
 *
 * @param {string} entryId - Reference entry ID (e.g., 'dropsy', 'four-qualities')
 * @returns {string} Icon path (e.g., '/icons/dropsy_icon.png', '/icons/four_qualities_icon.png')
 */
export function getIconForEntry(entryId) {
  // First check manual mappings for overrides
  const manualMapping = REFERENCE_ICON_MAPPINGS[entryId];
  if (manualMapping) {
    return `/icons/${manualMapping}`;
  }

  // Auto-generate filename from entry ID
  // Convert hyphens to underscores: 'four-qualities' → 'four_qualities_icon.png'
  const normalizedId = entryId.replace(/-/g, '_');
  const autoFilename = `${normalizedId}_icon.png`;
  return `/icons/${autoFilename}`;
}

/**
 * Check if a reference entry has a manually mapped icon
 * Note: With auto-generation, all entries will return an icon path from getIconForEntry(),
 * but this function only returns true for manually mapped icons.
 * Use this to check if an icon is explicitly defined.
 *
 * @param {string} entryId - Reference entry ID
 * @returns {boolean} True if manually mapped icon exists
 */
export function hasIcon(entryId) {
  return !!REFERENCE_ICON_MAPPINGS[entryId];
}

/**
 * Get all available icons
 * @returns {Object} Mapping of entry IDs to icon paths
 */
export function getAllIconMappings() {
  const mappings = {};
  for (const [entryId, filename] of Object.entries(REFERENCE_ICON_MAPPINGS)) {
    mappings[entryId] = `/icons/${filename}`;
  }
  return mappings;
}

/**
 * Normalize entry name to potential icon filename
 * Useful for auto-discovering icons for new entries
 * @param {string} name - Entry name
 * @returns {string} Potential icon filename
 */
export function nameToIconFilename(name) {
  return name
    .toLowerCase()
    .replace(/[''']/g, '') // Remove apostrophes
    .replace(/\s+/g, '_') // Spaces to underscores
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/&/g, 'and') // & to 'and'
    + '_icon.png';
}

export default {
  getIconForEntry,
  hasIcon,
  getAllIconMappings,
  nameToIconFilename
};
