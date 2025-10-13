#!/usr/bin/env node

/**
 * EntityList Data Cleaner
 *
 * Automatically fixes common data quality issues in EntityList.js:
 * - Converts gender to lowercase (Male → male)
 * - Fixes casta typos (Pensinsular → Peninsular)
 * - Adds .jpg extensions to images missing them
 * - Creates backup before modifying
 *
 * Usage: node scripts/cleanEntityList.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// Parse command line args
const isDryRun = process.argv.includes('--dry-run');

// Paths
const ENTITY_LIST_PATH = path.join(__dirname, '../src/EntityList.js');
const BACKUP_PATH = path.join(__dirname, '../src/EntityList.backup.js');

// Color output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Known typos
const TYPO_MAP = {
  'Pensinsular': 'Peninsular',
  'pensinsular': 'peninsular',
  'Espanola': 'Española',
  'espanola': 'española',
  'Espanol': 'Español',
  'espanol': 'español',
  'Indigena': 'Indígena',
  'indigena': 'indígena'
};

console.log(`${colors.blue}=== EntityList Data Cleaner ===${colors.reset}\n`);

if (isDryRun) {
  console.log(`${colors.yellow}DRY RUN MODE - No changes will be made${colors.reset}\n`);
}

// Read the file as text (to preserve formatting)
let content = fs.readFileSync(ENTITY_LIST_PATH, 'utf8');
let originalContent = content;

// Track changes
let changes = {
  genderFixed: 0,
  castaFixed: 0,
  imageFixed: 0
};

// 1. Fix gender capitalization (Male → male, Female → female)
// Handle both "gender": "Male" and gender: "Male" formats
content = content.replace(/"gender":\s*"(Male|Female)"/g, (match, gender) => {
  changes.genderFixed++;
  return `"gender": "${gender.toLowerCase()}"`;
});

content = content.replace(/\bgender:\s*"(Male|Female)"/g, (match, gender) => {
  changes.genderFixed++;
  return `gender: "${gender.toLowerCase()}"`;
});

// 2. Fix casta typos
Object.entries(TYPO_MAP).forEach(([typo, correct]) => {
  const regex = new RegExp(`"casta":\\s*"${typo}"`, 'g');
  const matches = content.match(regex);
  if (matches) {
    changes.castaFixed += matches.length;
    content = content.replace(regex, `"casta": "${correct}"`);
  }

  // Also check for the casta: format (without quotes in older entries)
  const regexNoQuotes = new RegExp(`casta:\\s*"${typo}"`, 'g');
  const matchesNoQuotes = content.match(regexNoQuotes);
  if (matchesNoQuotes) {
    changes.castaFixed += matchesNoQuotes.length;
    content = content.replace(regexNoQuotes, `casta: "${correct}"`);
  }
});

// 3. Fix missing image extensions
// Match "image": "filename" where filename has no extension
content = content.replace(/"image":\s*"([^"]+?)"/g, (match, filename) => {
  // Check if it already has an extension
  if (/\.(jpg|jpeg|png|gif)$/i.test(filename)) {
    return match; // Already has extension
  }
  changes.imageFixed++;
  return `"image": "${filename}.jpg"`;
});

// Also handle image: format (without quotes)
content = content.replace(/\bimage:\s*"([^"]+?)"/g, (match, filename) => {
  // Check if it already has an extension
  if (/\.(jpg|jpeg|png|gif)$/i.test(filename)) {
    return match; // Already has extension
  }
  changes.imageFixed++;
  return `image: "${filename}.jpg"`;
});

// Report changes
console.log(`${colors.yellow}--- Changes to be made ---${colors.reset}\n`);
console.log(`${colors.green}✓ Gender capitalization fixes: ${changes.genderFixed}${colors.reset}`);
console.log(`${colors.green}✓ Casta typo fixes: ${changes.castaFixed}${colors.reset}`);
console.log(`${colors.green}✓ Image extension additions: ${changes.imageFixed}${colors.reset}`);
console.log(`${colors.magenta}  Total changes: ${changes.genderFixed + changes.castaFixed + changes.imageFixed}${colors.reset}\n`);

if (content === originalContent) {
  console.log(`${colors.green}✓ No changes needed - EntityList is already clean!${colors.reset}`);
  process.exit(0);
}

if (isDryRun) {
  console.log(`${colors.yellow}Dry run complete. No files were modified.${colors.reset}`);
  console.log(`${colors.blue}Run without --dry-run to apply changes.${colors.reset}`);
  process.exit(0);
}

// Create backup
try {
  fs.copyFileSync(ENTITY_LIST_PATH, BACKUP_PATH);
  console.log(`${colors.green}✓ Backup created: ${BACKUP_PATH}${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Failed to create backup: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Write cleaned content
try {
  fs.writeFileSync(ENTITY_LIST_PATH, content, 'utf8');
  console.log(`${colors.green}✓ EntityList.js has been cleaned!${colors.reset}\n`);

  console.log(`${colors.blue}--- Next Steps ---${colors.reset}`);
  console.log(`1. Review the changes: git diff src/EntityList.js`);
  console.log(`2. Test the game to ensure nothing broke`);
  console.log(`3. If issues occur, restore backup: cp src/EntityList.backup.js src/EntityList.js`);
  console.log(`4. Commit changes: git add src/EntityList.js && git commit -m "Clean EntityList data"`);
} catch (error) {
  console.error(`${colors.red}❌ Failed to write file: ${error.message}${colors.reset}`);
  process.exit(1);
}
