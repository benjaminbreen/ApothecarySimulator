#!/usr/bin/env node

/**
 * Portrait Sync Script
 * Automatically scans /public/portraits/ and updates src/core/config/portraits.config.js
 * with any new portrait files, auto-categorizing them based on filename patterns.
 */

const fs = require('fs');
const path = require('path');

// Paths
const PORTRAITS_DIR = path.join(__dirname, '../public/portraits');
const CONFIG_FILE = path.join(__dirname, '../src/core/config/portraits.config.js');

// Category keywords for auto-categorization
const CATEGORY_PATTERNS = {
  'Clergy': ['priest', 'nun', 'friar', 'monk', 'abbot', 'bishop', 'religious', 'cleric'],
  'Merchants': ['merchant', 'vendor', 'trader', 'shopkeeper', 'importer'],
  'Soldiers': ['soldier', 'conquistador', 'militiaman', 'guard', 'military', 'officer'],
  'Children': ['child', 'boy', 'girl'],
  'Scholars/Healers': ['scholar', 'healer', 'apothecary', 'physician', 'doctor', 'midwife', 'curandera'],
  'Workers/Artisans': ['farmer', 'sailor', 'muleteer', 'artisan', 'cobbler', 'laborer', 'weaver', 'seamstress', 'innkeeper', 'printer']
};

// Age/class patterns for gendered categories
const AGE_PATTERNS = {
  elderly: ['elderly', 'elder', 'old'],
  young: ['young', 'youth'],
  middleaged: ['middleaged', 'middle']
};

/**
 * Scan portraits directory for all image files
 */
function scanPortraits() {
  const files = fs.readdirSync(PORTRAITS_DIR);
  return files.filter(f => f.match(/\.(jpg|png)$/i));
}

/**
 * Load current config file and extract existing portraits
 */
function loadCurrentConfig() {
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');

  // Extract PORTRAIT_CATEGORIES object
  const match = content.match(/export const PORTRAIT_CATEGORIES = ({[\s\S]+?^};)/m);
  if (!match) {
    throw new Error('Could not parse PORTRAIT_CATEGORIES from config file');
  }

  const categoriesText = match[1];

  // Parse categories (simple regex extraction)
  const categories = {};
  const categoryRegex = /'([^']+)':\s*\[([\s\S]*?)\]/g;
  let catMatch;

  while ((catMatch = categoryRegex.exec(categoriesText)) !== null) {
    const categoryName = catMatch[1];
    const portraitsText = catMatch[2];

    // Extract filenames from array
    const filenameRegex = /'([^']+\.(?:jpg|png))'/g;
    const portraits = [];
    let fileMatch;

    while ((fileMatch = filenameRegex.exec(portraitsText)) !== null) {
      portraits.push(fileMatch[1]);
    }

    categories[categoryName] = portraits;
  }

  return { content, categories };
}

/**
 * Categorize a portrait filename based on patterns
 */
function categorizePortrait(filename) {
  const lower = filename.toLowerCase();

  // Check special categories first
  for (const [category, keywords] of Object.entries(CATEGORY_PATTERNS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }

  // Check gendered age categories
  const isFemale = lower.includes('female') || lower.includes('woman') || lower.includes('girl') ||
                   lower.includes('criolla') || lower.includes('widow') || lower.includes('matron');
  const isMale = lower.includes('male') || lower.includes('man') || lower.includes('boy') ||
                 lower.includes('criollo');

  // Check age
  let age = 'common'; // default
  for (const [ageKey, patterns] of Object.entries(AGE_PATTERNS)) {
    if (patterns.some(p => lower.includes(p))) {
      age = ageKey;
      break;
    }
  }

  // Check class indicators
  const isElite = lower.includes('noble') || lower.includes('elite') || lower.includes('peninsular') ||
                  lower.includes('patroness') || lower.includes('don');
  const isPoor = lower.includes('poor') || lower.includes('beggar') || lower.includes('peasant');

  // Categorize based on gender + age + class
  if (isFemale) {
    if (age === 'elderly') return 'Elderly Women';
    if (age === 'young') return 'Young Women';
    if (isElite) return 'Elite Women';
    return 'Common Women';
  }

  if (isMale) {
    if (isElite) return 'Elite Men';
    return 'Common Men';
  }

  // Default fallback
  return 'Common Men';
}

/**
 * Add new portraits to categories
 */
function addNewPortraits(categories, allPortraits) {
  const existingPortraits = new Set(
    Object.values(categories).flat()
  );

  const newPortraits = allPortraits.filter(p => !existingPortraits.has(p));

  if (newPortraits.length === 0) {
    console.log('✓ No new portraits found. All portraits are already in config.');
    return { categories, added: [] };
  }

  console.log(`\n📸 Found ${newPortraits.length} new portrait(s):\n`);

  const added = [];

  for (const portrait of newPortraits) {
    const category = categorizePortrait(portrait);

    if (!categories[category]) {
      categories[category] = [];
    }

    categories[category].push(portrait);
    added.push({ portrait, category });

    console.log(`   + ${portrait} → ${category}`);
  }

  return { categories, added };
}

/**
 * Write updated config back to file
 */
function writeConfig(originalContent, categories) {
  // Sort portraits within each category alphabetically
  for (const category in categories) {
    categories[category].sort();
  }

  // Build new PORTRAIT_CATEGORIES object
  const categoryLines = [];
  for (const [category, portraits] of Object.entries(categories)) {
    const portraitList = portraits.map(p => `'${p}'`).join(',\n    ');
    categoryLines.push(`  '${category}': [\n    ${portraitList}\n  ]`);
  }

  const newCategoriesObject = `export const PORTRAIT_CATEGORIES = {\n${categoryLines.join(',\n')}\n};`;

  // Replace old PORTRAIT_CATEGORIES in content
  const updatedContent = originalContent.replace(
    /export const PORTRAIT_CATEGORIES = {[\s\S]+?^};/m,
    newCategoriesObject
  );

  fs.writeFileSync(CONFIG_FILE, updatedContent, 'utf-8');
  console.log(`\n✓ Updated ${CONFIG_FILE}`);
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Portrait Sync Tool\n');
  console.log('Scanning portraits directory...');

  const allPortraits = scanPortraits();
  console.log(`Found ${allPortraits.length} total portraits in /public/portraits/`);

  console.log('Loading current config...');
  const { content, categories } = loadCurrentConfig();
  const existingCount = Object.values(categories).flat().length;
  console.log(`Config contains ${existingCount} portraits across ${Object.keys(categories).length} categories`);

  const { categories: updatedCategories, added } = addNewPortraits(categories, allPortraits);

  if (added.length > 0) {
    writeConfig(content, updatedCategories);
    console.log(`\n✅ Added ${added.length} new portrait(s) to config.\n`);
  }
}

// Run if executed directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { scanPortraits, categorizePortrait, addNewPortraits };
