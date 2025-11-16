#!/usr/bin/env node
/**
 * generateMedicineCategories.js
 *
 * Generates medical categories for initial inventory items
 * Uses pattern matching on medicinalEffects, description, and preparationAdvice
 * to suggest primarySystems, organAffinities, and specificConditions
 */

const fs = require('fs');
const path = require('path');

// Pattern libraries for automatic categorization
const SYSTEM_PATTERNS = {
  musculoskeletal: /joint|bone|muscle|back|spine|neck|limb|rheumat|ache|aching|stiff|gout|arthrit/i,
  digestive: /stomach|bowel|digest|colic|liver|spleen|belly|gut|nausea|vomit|purg|laxat|constipat|diarrh|dysentery|flux/i,
  respiratory: /lung|chest|cough|breath|throat|phlegm|asthma|congestion|pector|expector|bronch/i,
  nervous: /nerv|brain|head|mind|memor|sleep|anxiety|convuls|epilep|hysteri|melanchol|sedat|calm|somn|sopor/i,
  circulatory: /heart|blood|vein|pulse|circulation|bleeding|hemorrhage|styptic|cardiac|vulnerary/i,
  dermatological: /skin|wound|ulcer|rash|burn|sore|lesion|cut|abscess|inflamm|swell|vulnerary/i,
  renal: /kidney|bladder|urin|stone|gravel|retention|diuretic/i,
  reproductive: /womb|menses|fertility|birth|conception|menstrual|uterine/i,
  ophthalmological: /eye|vision|sight|cataract|blind/i,
  dental: /tooth|teeth|gum|mouth|jaw|dental/i
};

const ORGAN_PATTERNS = {
  head: /head|skull|cerebr|brain|migrain/i,
  heart: /heart|cardiac/i,
  liver: /liver|hepat/i,
  stomach: /stomach|gastric/i,
  lungs: /lung|pulmon|chest/i,
  kidneys: /kidney|renal/i,
  bladder: /bladder/i,
  spine: /spine|back|vertebr/i,
  joints: /joint|articulat/i,
  skin: /skin|derma|cutane/i,
  eyes: /eye|ocular|ophthalm/i,
  teeth: /tooth|teeth|dental/i,
  womb: /womb|uterus|uterine/i,
  bowels: /bowel|intestin|colon/i,
  blood: /blood|sanguine/i,
  spleen: /spleen/i,
  brain: /brain|cerebr/i,
  throat: /throat|laryn|pharyn/i
};

// Common conditions in 17th century medicine
const CONDITION_PATTERNS = {
  'headache': /headache|migrain|cephalic/i,
  'fever': /fever|febri|pyrex|ague/i,
  'pain': /pain|ache|aching|dolor/i,
  'inflammation': /inflamm|swell|tumor/i,
  'cough': /cough|tussi/i,
  'constipation': /constipat|obstruct/i,
  'diarrhea': /diarrh|flux|loose stool/i,
  'wound': /wound|cut|lacerat|vulnerary/i,
  'bleeding': /bleed|hemorrhage|styptic/i,
  'insomnia': /insomni|sleepless/i,
  'anxiety': /anxiety|anxious|nervous|agitat/i,
  'melancholy': /melanchol|depress|sad/i,
  'nausea': /nausea|queasy|sick/i,
  'vomiting': /vomit|emetic/i,
  'colic': /colic|griping/i,
  'stone': /stone|calcul|gravel/i,
  'dropsy': /dropsy|edema|swell/i,
  'scurvy': /scurvy|scorbutic/i,
  'gout': /gout/i,
  'rheumatism': /rheumat/i,
  'dysentery': /dysentery/i,
  'plague': /plague|pestilen/i,
  'ulcer': /ulcer|sore/i,
  'rash': /rash|eruption/i,
  'burn': /burn|scald/i
};

/**
 * Extract categories from item text fields
 */
function extractCategories(item) {
  // Combine all text fields for pattern matching
  const textFields = [
    item.medicinalEffects || '',
    item.description || '',
    item.preparationAdvice?.decoction || '',
    item.preparationAdvice?.distillation || '',
    item.preparationAdvice?.calcination || '',
    item.preparationAdvice?.confection || ''
  ].join(' ');

  const categories = {
    primarySystems: [],
    organAffinities: [],
    specificConditions: []
  };

  // Extract primary systems
  for (const [system, pattern] of Object.entries(SYSTEM_PATTERNS)) {
    if (pattern.test(textFields)) {
      categories.primarySystems.push(system);
    }
  }

  // Extract organ affinities
  for (const [organ, pattern] of Object.entries(ORGAN_PATTERNS)) {
    if (pattern.test(textFields)) {
      categories.organAffinities.push(organ);
    }
  }

  // Extract specific conditions
  for (const [condition, pattern] of Object.entries(CONDITION_PATTERNS)) {
    if (pattern.test(textFields)) {
      categories.specificConditions.push(condition);
    }
  }

  // Limit to top matches (avoid over-categorization)
  categories.primarySystems = categories.primarySystems.slice(0, 3);
  categories.organAffinities = categories.organAffinities.slice(0, 3);
  categories.specificConditions = categories.specificConditions.slice(0, 5);

  return categories;
}

/**
 * Main execution
 */
function main() {
  console.log('🔬 Generating medical categories for initial inventory...\n');

  // Read initialInventory.js
  const inventoryPath = path.join(__dirname, '../src/initialInventory.js');
  const content = fs.readFileSync(inventoryPath, 'utf8');

  // Extract item data (parse the JS file to get item objects)
  // We'll use a simple approach: read each item block and parse it
  const itemMatches = content.matchAll(/\{\s*id: (\d+),[\s\S]*?\n    \},?/g);

  const suggestions = {};
  let totalItems = 0;
  let itemsWithCategories = 0;

  for (const match of itemMatches) {
    const itemText = match[0];
    const itemId = parseInt(match[1]);

    // Extract fields from item text
    const nameMatch = itemText.match(/name: ['"]([^'"]+)['"]/);
    const effectsMatch = itemText.match(/medicinalEffects: ['"]([^'"]+)['"]/);
    const descMatch = itemText.match(/description: ['"]([^'"]+)['"]/);

    // Check if already has categories
    const hasCategories = /primarySystems:/.test(itemText);

    if (hasCategories) {
      console.log(`✓ Item ${itemId} (${nameMatch?.[1] || 'Unknown'}) already has categories, skipping`);
      itemsWithCategories++;
      totalItems++;
      continue;
    }

    const item = {
      id: itemId,
      name: nameMatch?.[1] || 'Unknown',
      medicinalEffects: effectsMatch?.[1] || '',
      description: descMatch?.[1] || ''
    };

    // Extract preparationAdvice if present
    const adviceMatch = itemText.match(/preparationAdvice: \{[\s\S]*?decoction: "([^"]+)"[\s\S]*?distillation: "([^"]+)"[\s\S]*?calcination: "([^"]+)"[\s\S]*?confection: "([^"]+)"/);
    if (adviceMatch) {
      item.preparationAdvice = {
        decoction: adviceMatch[1],
        distillation: adviceMatch[2],
        calcination: adviceMatch[3],
        confection: adviceMatch[4]
      };
    }

    const categories = extractCategories(item);

    // Only suggest if we found something
    if (categories.primarySystems.length > 0 ||
        categories.organAffinities.length > 0 ||
        categories.specificConditions.length > 0) {
      suggestions[itemId] = {
        name: item.name,
        ...categories
      };

      console.log(`📋 Item ${itemId}: ${item.name}`);
      console.log(`   Systems: ${categories.primarySystems.join(', ') || 'none'}`);
      console.log(`   Organs: ${categories.organAffinities.join(', ') || 'none'}`);
      console.log(`   Conditions: ${categories.specificConditions.join(', ') || 'none'}`);
      console.log('');
    } else {
      console.log(`⚠️  Item ${itemId}: ${item.name} - No categories detected`);
      suggestions[itemId] = {
        name: item.name,
        primarySystems: [],
        organAffinities: [],
        specificConditions: [],
        note: 'No patterns matched - needs manual review'
      };
    }

    totalItems++;
  }

  // Write suggestions to JSON file for review
  const outputPath = path.join(__dirname, 'medicine-categories.json');
  fs.writeFileSync(outputPath, JSON.stringify(suggestions, null, 2), 'utf8');

  console.log(`\n✅ Generated categories for ${totalItems} items`);
  console.log(`   ${itemsWithCategories} items already had categories`);
  console.log(`   ${totalItems - itemsWithCategories} items processed`);
  console.log(`\n📄 Suggestions written to: ${outputPath}`);
  console.log('\n👉 Next steps:');
  console.log('   1. Review medicine-categories.json');
  console.log('   2. Edit any incorrect categorizations');
  console.log('   3. Run: node scripts/applyMedicineCategories.js');
}

main();
