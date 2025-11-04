#!/usr/bin/env node

/**
 * Portrait Library Sync Script
 * Auto-generates portraitLibrary.js entries from portraits.config.js
 * Extracts demographic metadata from filenames
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONFIG_FILE = path.join(__dirname, '../src/core/config/portraits.config.js');
const LIBRARY_FILE = path.join(__dirname, '../src/core/services/portraitLibrary.js');

/**
 * Extract all portrait filenames from portraits.config.js
 */
function extractPortraitsFromConfig() {
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const filenameRegex = /'([^']+\.(?:jpg|png))'/g;
  const portraits = new Set();
  let match;

  while ((match = filenameRegex.exec(content)) !== null) {
    portraits.add(match[1]);
  }

  return Array.from(portraits).sort();
}

/**
 * Load existing portraitLibrary.js and extract existing entries
 */
function loadExistingLibrary() {
  const content = fs.readFileSync(LIBRARY_FILE, 'utf-8');
  const existing = {};

  // Extract existing entries (look for 'filename.jpg': { metadata })
  const entryRegex = /'([^']+\.(?:jpg|png))':\s*\{([\s\S]*?)\n  \}/g;
  let match;

  while ((match = entryRegex.exec(content)) !== null) {
    existing[match[1]] = true;
  }

  return { content, existing };
}

/**
 * Parse filename to extract demographic metadata
 */
function parseFilename(filename) {
  const lower = filename.toLowerCase();
  const meta = {
    gender: 'unknown',
    age: 'adult',
    casta: 'unknown',
    class: 'common',
    occupation: 'unknown',
    tags: []
  };

  // Blacklist: Known non-portraits
  const nonPortraits = ['mangos', 'manila', 'manhand', 'houseofamadman', 'womanhand'];
  if (nonPortraits.some(np => lower.includes(np))) {
    return null; // Skip this file
  }

  // Female name detection
  const femaleNames = ['juana', 'maria', 'ana', 'isabel', 'catalina', 'rosa', 'carmen'];
  const hasFemaleEnding = lower.match(/a\.(jpg|png)$/) || lower.includes('curandera');
  const hasFemaleWord = lower.includes('female') || lower.includes('woman') || lower.includes('girl') ||
                        lower.includes('criolla') || lower.includes('widow') || lower.includes('matron') ||
                        lower.includes('nun') || lower.includes('midwife') || lower.includes('seamstress');
  const hasFemaleName = femaleNames.some(name => lower.includes(name));

  // Male indicators
  const maleWords = ['\\bmale\\b', 'man(?!go|ila|hand)', '\\bboy\\b', 'priest', 'friar', 'monk', 'abbot'];
  const hasMaleWord = maleWords.some(pattern => new RegExp(pattern).test(lower));
  const hasMaleEnding = lower.match(/o\.(jpg|png)$/) && !lower.includes('photo');

  // Gender detection (prioritize explicit markers over endings)
  if (hasFemaleWord || hasFemaleName) {
    meta.gender = 'female';
  } else if (hasMaleWord) {
    meta.gender = 'male';
  } else if (hasFemaleEnding && !hasMaleEnding) {
    meta.gender = 'female';
  } else if (hasMaleEnding && !hasFemaleEnding) {
    meta.gender = 'male';
  }

  // Special case: conquistador is always male
  if (lower.includes('conquistador')) {
    meta.gender = 'male';
    meta.casta = 'español';
  }

  // Age detection (check specific patterns first)
  const ageDecadeMatch = lower.match(/(\d0)s/); // Matches "30s", "40s", "50s"
  if (ageDecadeMatch) {
    const decade = parseInt(ageDecadeMatch[1]);
    if (decade >= 40 && decade < 60) meta.age = 'middle-aged';
    else if (decade >= 60) meta.age = 'elderly';
    else if (decade >= 20 && decade < 40) meta.age = 'adult';
    else if (decade < 20) meta.age = 'young';
  } else if (lower.includes('child') || lower.includes('boy') || lower.includes('girl')) {
    meta.age = 'child';
  } else if (lower.includes('young') || lower.includes('youth') || lower.includes('teenage')) {
    meta.age = 'young';
  } else if (lower.includes('elderly') || lower.includes('elder') || lower.includes('old')) {
    meta.age = 'elderly';
  } else if (lower.includes('middleaged') || lower.includes('middle')) {
    meta.age = 'middle-aged';
  }

  // Casta detection
  if (lower.includes('español') || lower.includes('espanol') || lower.includes('peninsular') || lower.includes('spanish')) {
    meta.casta = 'español';
  } else if (lower.includes('criollo') || lower.includes('criolla')) {
    meta.casta = 'criollo';
  } else if (lower.includes('mestizo') || lower.includes('mestiza')) {
    meta.casta = 'mestizo';
  } else if (lower.includes('indio') || lower.includes('indigenous') || lower.includes('native')) {
    meta.casta = 'indio';
  } else if (lower.includes('mulatto') || lower.includes('mulatta')) {
    meta.casta = 'mulatto';
  } else if (lower.includes('africano') || lower.includes('african') || lower.includes('negro')) {
    meta.casta = 'africano';
  }

  // Class detection
  if (lower.includes('noble') || lower.includes('elite') || lower.includes('patrician') ||
      lower.includes('patroness') || lower.includes('viceroy') || lower.includes('don')) {
    meta.class = 'elite';
  } else if (lower.includes('poor') || lower.includes('beggar') || lower.includes('peasant')) {
    meta.class = 'poor';
  } else if (lower.includes('merchant') || lower.includes('artisan')) {
    meta.class = 'middling';
  }

  // Occupation detection
  const occupations = {
    'merchant': 'merchant',
    'vendor': 'vendor',
    'soldier': 'soldier',
    'guard': 'guard',
    'militiaman': 'soldier',
    'conquistador': 'conquistador',
    'priest': 'priest',
    'nun': 'nun',
    'friar': 'friar',
    'monk': 'monk',
    'abbot': 'abbot',
    'midwife': 'midwife',
    'curandera': 'healer',
    'healer': 'healer',
    'physician': 'physician',
    'apothecary': 'apothecary',
    'scholar': 'scholar',
    'scribe': 'scribe',
    'sailor': 'sailor',
    'seacaptain': 'captain',
    'captain': 'captain',
    'farmer': 'farmer',
    'laborer': 'laborer',
    'servant': 'servant',
    'footman': 'servant',
    'artisan': 'artisan',
    'cobbler': 'cobbler',
    'seamstress': 'seamstress',
    'weaver': 'weaver',
    'innkeeper': 'innkeeper',
    'printer': 'printer',
    'jeweler': 'jeweler',
    'shopkeeper': 'shopkeeper',
    'muleteer': 'muleteer',
    'fisherman': 'fisherman',
    'cavalier': 'cavalier',
    'bandito': 'outlaw',
    'ranchero': 'rancher',
    'messenger': 'messenger',
    'pickpocket': 'thief'
  };

  for (const [key, value] of Object.entries(occupations)) {
    if (lower.includes(key)) {
      meta.occupation = value;
      meta.tags.push(value);
      break;
    }
  }

  // Add generic tags
  if (meta.gender !== 'unknown') meta.tags.push(meta.gender);
  if (meta.age !== 'adult') meta.tags.push(meta.age);
  if (meta.casta !== 'unknown') meta.tags.push(meta.casta);
  if (meta.class === 'elite') meta.tags.push('elite');
  if (meta.class === 'poor') meta.tags.push('poor');

  return meta;
}

/**
 * Generate JavaScript object string for a portrait entry
 */
function generateEntry(filename, meta) {
  const tags = meta.tags.length > 0 ? `['${meta.tags.join("', '")}']` : '[]';

  return `  '${filename}': {
    gender: '${meta.gender}',
    age: '${meta.age}',
    casta: '${meta.casta}',
    class: '${meta.class}',
    occupation: '${meta.occupation}',
    tags: ${tags}
  }`;
}

/**
 * Update portraitLibrary.js with new entries
 */
function updateLibrary(libraryContent, existingEntries, newPortraits) {
  const newEntries = [];
  let addedCount = 0;

  console.log(`\n📸 Processing ${newPortraits.length} portraits from config...\n`);

  for (const filename of newPortraits) {
    if (existingEntries[filename]) {
      console.log(`   ✓ ${filename} (already exists)`);
      continue;
    }

    const meta = parseFilename(filename);

    // Skip non-portraits (heuristic: if we can't determine gender, it's probably not a portrait)
    if (meta.gender === 'unknown' && meta.occupation === 'unknown') {
      console.log(`   ⚠ Skipped: ${filename} (insufficient metadata)`);
      continue;
    }

    const entry = generateEntry(filename, meta);
    newEntries.push(entry);
    addedCount++;
    console.log(`   + ${filename} → ${meta.gender}, ${meta.age}, ${meta.casta}, ${meta.occupation}`);
  }

  if (addedCount === 0) {
    console.log('\n✓ No new portraits to add. Library is up to date.');
    return libraryContent;
  }

  // Find the end of PORTRAIT_LIBRARY object
  const libraryEndPattern = /\n};/;
  const match = libraryContent.match(libraryEndPattern);

  if (!match) {
    throw new Error('Could not find end of PORTRAIT_LIBRARY object');
  }

  // Insert new entries before the closing brace
  const insertPosition = match.index;
  const beforeClosing = libraryContent.substring(0, insertPosition);
  const afterClosing = libraryContent.substring(insertPosition);

  // Add comma to last existing entry if needed
  const needsComma = !beforeClosing.trim().endsWith(',');
  const comma = needsComma ? ',' : '';

  const newContent = beforeClosing + comma + '\n\n  // Auto-generated entries from sync script\n' +
                     newEntries.join(',\n') + afterClosing;

  console.log(`\n✅ Added ${addedCount} new portrait(s) to library.\n`);

  return newContent;
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Portrait Library Sync Tool\n');

  console.log('Loading portraits from config...');
  const configPortraits = extractPortraitsFromConfig();
  console.log(`Found ${configPortraits.length} portraits in portraits.config.js`);

  console.log('Loading existing library...');
  const { content, existing } = loadExistingLibrary();
  const existingCount = Object.keys(existing).length;
  console.log(`Library contains ${existingCount} existing entries`);

  const updatedContent = updateLibrary(content, existing, configPortraits);

  if (updatedContent !== content) {
    fs.writeFileSync(LIBRARY_FILE, updatedContent, 'utf-8');
    console.log(`✓ Updated ${LIBRARY_FILE}`);
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

module.exports = { parseFilename, generateEntry };
