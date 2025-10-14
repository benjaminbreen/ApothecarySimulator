// Portrait configuration for NPC portrait selection
// Organized by demographic categories for LLM portrait matching

/**
 * Portrait library for 1680 Mexico City scenario
 * Each category lists available portrait filenames
 */
export const PORTRAIT_CATEGORIES = {
  'Elite Women': [
    'criollofemalemerchant.jpg',
    'female_middleaged_criollo_patroness.jpg',
    'middleagedcriollofemalemerchant.jpg',
    'peninsularenoblewomanfemaleindoorsmiddleaged.jpg',
    'spanishnoblewoman.jpg',
    'widowpeninsulare30s.jpg'
  ],
  'Common Women': [
    'africanwoman.jpg',
    'beggarwoman.jpg',
    'criollafemalematron40s.jpg',
    'middleagedcriollofemaleservant.jpg',
    'indiowoman.jpg',
    'manandwomandinnercandlelight.jpg',
    'mestizawomanaged30s.jpg',
    'middleagedpeasantwoman.jpg',
    'peasantwoman.jpg',
    'poorwoman.jpg',
    'unhealthyindiowoman.jpg',
    'womanhand.jpg',
    'womanswork.jpg'
  ],
  'Young Women': [
    'criollafemaleservantyoung.jpg',
    'female_young_mestiza_market_vendor.jpg',
    'femaleyoungcriolloservant.jpg',
    'pensinsularefemaleservantyoung.jpg',
    'sickyoungwoman.jpg',
    'youngafricanwoman.jpg',
    'youngcriollawoman.jpg',
    'youngindigenouswoman.jpg',
    'youngmestizawoman.jpg',
    'youngmulattowoman.jpg',
    'youngpeasantwoman.jpg',
    'youngspanishwoman.jpg',
    'youngwomansmallpox.jpg'
  ],
  'Elderly Women': [
    'elderlyafricanofemalepeasant.jpg',
    'elderlyafricanowoman.jpg',
    'elderlyafricanwoman.jpg',
    'elderlycriollamatroninterior.jpg',
    'elderlycriollofemalehealer.jpg',
    'oldwoman.jpg',
    'youngwomanholdinglanternnight.jpg'
  ],
  'Elite Men': [
    'elderlynobleman.jpg',
    'elderlypeninsulareman.jpg',
    'handsomecriolloyoungnobleman.jpg',
    'male_elder_indigenous_noble_delegate.jpg',
    'peninsularemaleservantyoung.jpg',
    'peninsulareyoungman.jpg',
    'spanishnoble.jpg'
  ],
  'Common Men': [
  
    'antoniadeochoa.jpg',
    'antonius.jpg',
    
    'artist.jpg',
    'arturohernandez.jpg',
    'arturoramirez.jpg',
    
    'bandito.jpg',
    
    'indiopeasantman.jpg',
    'indioyoungmale.jpg',
    
    'poormalepickpocketyoung.jpg',
    'pooryoungman.jpg',
    
    'ranchero.jpg',
    
    'sickyoungman.jpg',
    
    'twomendrinkingtogether.jpg',

    'unhealthymiddleagedman.jpg',
    'unhealthypickpocket.jpg',
    
    'youngafricanman.png',
    'youngcavalier.jpg',
    'youngfootman.jpg',
    'youngmaleservant.jpg',
    'youngman.jpg',
    'youngmanwithfaciallaceration.jpg',
    'youngmanwithpox.jpg'
  ],
  'Clergy': [
    'abbot.jpg',
    'africanorindianoceanreligiousritualnight.jpg',
    'dominicannunelderly.jpg .png',
    'elderlycriollonun.jpg',
    'friar.jpg',
    'middleagedcriollanun.jpg',
    'middleagedcriollomalepriest.jpg',
    'monk.jpg',
    'nun.jpg',
    'peninsularpriestmiddleaged.jpg',
    'priest.jpg'
  ],
  'Merchants': [
    'countrysidemestizomalemerchant.jpg',
    'indianmerchants.jpg',
    'male_middleaged_criollo_merchant_importer.jpg',
    'marketplacevendorindiowoman.jpg',
    'marketvendors.jpg',
    'merchantman.jpg',
    'merchantwritingbill.jpg',
    'mestizomiddleagedmalemerchant.jpg',
    'middleagedafricanofemalemerchant.jpg',
    'middleagedmalemerchant.jpg',
    'seamstressdraperortextilemerchant.jpg',
    'shopkeeper.jpg',
    'shopkeeperatwindowdusk.jpg',
    'shopkeepercriollomiddleaged.jpg'
  ],
  'Soldiers': [
    'armedsoldiernight.jpg',
    'conquistador.jpg',
    'conquistadorfrontier.jpg',
    'elderlysoldier.jpg',
    'frontiersoldier.jpg',
    'mulattosoldier.jpg',
    'soldier.jpg',
    'soldiers.jpg',
    'spanishnoblesoldier.jpg'
  ],
  'Children': [
    'africanoboy.jpg',
    'child.jpg',
    'childevening.jpg',
    'childfemalepeasant.jpg',
    'childmalescholar.jpg',
    'cowboyonhorse.jpg',
    'indigenousgirl.jpg',
    'mestizoboy.jpg',
    'mestizogirl.jpg',
    'motherandchildrenday.jpg',
    'motherandchildrentwilight.jpg',
    'mulattogirl.jpg',
    'noblemalechild.jpg',
    'sickboy.jpg'
  ],
  'Scholars/Healers': [
    'curandera.jpg',
    'elderlyfemaleindiohealer.jpg',
    'femalescholar.jpg',
    'middleagedfemaleapothecary.jpg',
    'middleagedmaleapothecary.jpg',
    'middleagedmulattomidwife.jpg',
    'oldapothecary.jpg',
    'physician.jpg',
    'scholar.jpg'
  ],
  'Workers/Artisans': [
    'africanomalelaborer.jpg',
    'criollofarmer.jpg',
    'criollofemaleseamstressmiddleaged.jpg',
    'criollomaleinnkeeperelderly.jpg',
    'criollomaleprintermiddleaged.jpg',
    'fishermanonriver.jpg',
    'indiofemalechinampafarmerelderly.jpg',
    'laborer.jpg',
    'male_middleaged_mestizo_artisan_cobbler.jpg',
    'mestizoartisan.jpg',
    'middleagedfarmer.jpg',
    'middleagedmalemuleteer.jpg',
    'middleagedmalesailor.jpg',
    'middleagedmestizofarmer.jpg',
    'oldsailornight.jpg',
    'poorfarmerwoman.jpg',
    'sailor.jpg',
    'youngafricanartisan.jpg'
  ]
};

/**
 * Format portrait categories for LLM prompt
 * Generates the exact same format as before (markdown list)
 * @returns {string} Formatted portrait list for prompt injection
 */
export function formatPortraitListForPrompt() {
  const lines = ['**Available Portraits** (choose best match):'];

  Object.entries(PORTRAIT_CATEGORIES).forEach(([category, portraits]) => {
    lines.push(`- **${category}:** ${portraits.join(', ')}`);
  });

  return lines.join('\n');
}

/**
 * Get all portrait filenames (flat array)
 * Useful for validation or filesystem checks
 * @returns {string[]} All portrait filenames
 */
export function getAllPortraitFilenames() {
  return Object.values(PORTRAIT_CATEGORIES).flat();
}

/**
 * Validate that a portrait filename exists in the config
 * @param {string} filename - Portrait filename to check
 * @returns {boolean} True if portrait exists in config
 */
export function isValidPortrait(filename) {
  return getAllPortraitFilenames().includes(filename);
}

export default {
  PORTRAIT_CATEGORIES,
  formatPortraitListForPrompt,
  getAllPortraitFilenames,
  isValidPortrait
};
