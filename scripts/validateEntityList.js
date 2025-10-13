#!/usr/bin/env node

/**
 * EntityList Data Validator
 *
 * Checks EntityList.js for common data quality issues:
 * - Gender capitalization (Male/Female → male/female)
 * - Casta typos and normalization
 * - Class inconsistencies
 * - Missing image extensions
 *
 * Usage: node scripts/validateEntityList.js
 */

const fs = require('fs');
const path = require('path');

// Read EntityList as text and parse it
const entityListPath = path.join(__dirname, '../src/EntityList.js');
const entityListContent = fs.readFileSync(entityListPath, 'utf8');

// Extract the array using a simple regex (since it's a const array)
const match = entityListContent.match(/const EntityList = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not parse EntityList.js');
  process.exit(1);
}

// Parse the JSON array
const EntityList = eval('(' + match[1] + ')');

// Color output for terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Issue tracking
const issues = {
  genderCapitalization: [],
  castaTypos: [],
  classInconsistencies: [],
  missingImageExtensions: [],
  invalidCasta: [],
  invalidClass: []
};

// Valid values
const VALID_CASTAS = [
  'español', 'española', 'peninsular',
  'criollo', 'criolla', 'creole',
  'mestizo', 'mestiza',
  'indio', 'india', 'indígena', 'indigenous',
  'mulato', 'mulata', 'mulatto',
  'africano', 'africana', 'african', 'african-born',
  'europeo', 'europea', 'european',
  'portugués', 'portuguesa', 'portuguese',
  'anglo-irish', 'english', 'french', 'dutch', 'irish'
];

const VALID_CLASSES = [
  'elite', 'upper class', 'nobility', 'aristocrat',
  'middling', 'middle class', 'upper middle class', 'lower middle class',
  'common', 'lower class', 'working class', 'peasant',
  'poor', 'destitute',
  'enslaved', 'slave',
  'religious', 'clergy',
  'freedman', 'free person'
];

// Known typos
const TYPO_MAP = {
  'pensinsular': 'peninsular',
  'espanola': 'española',
  'espanol': 'español',
  'indigena': 'indígena'
};

console.log(`${colors.blue}=== EntityList Data Validator ===${colors.reset}\n`);
console.log(`Validating ${EntityList.length} entities...\n`);

// Validate each entity
EntityList.forEach((entity, index) => {
  const entityId = entity.name || `Entity #${index}`;

  // 1. Check gender capitalization
  if (entity.gender) {
    if (entity.gender === 'Male' || entity.gender === 'Female') {
      issues.genderCapitalization.push({
        entity: entityId,
        current: entity.gender,
        fixed: entity.gender.toLowerCase()
      });
    }
  }

  // 2. Check casta for typos
  if (entity.casta) {
    const castaLower = entity.casta.toLowerCase();

    // Check for known typos
    if (TYPO_MAP[castaLower]) {
      issues.castaTypos.push({
        entity: entityId,
        current: entity.casta,
        fixed: TYPO_MAP[castaLower]
      });
    }

    // Check if casta is valid
    const isValid = VALID_CASTAS.some(valid =>
      valid.toLowerCase() === castaLower
    );

    if (!isValid && !TYPO_MAP[castaLower]) {
      issues.invalidCasta.push({
        entity: entityId,
        value: entity.casta
      });
    }
  }

  // 3. Check class normalization
  if (entity.class) {
    const classLower = entity.class.toLowerCase();
    const isValid = VALID_CLASSES.some(valid =>
      valid.toLowerCase() === classLower
    );

    if (!isValid) {
      issues.classInconsistencies.push({
        entity: entityId,
        value: entity.class
      });
    }
  }

  // 4. Check image extensions
  if (entity.image) {
    const hasExtension = /\.(jpg|jpeg|png|gif)$/i.test(entity.image);
    if (!hasExtension) {
      issues.missingImageExtensions.push({
        entity: entityId,
        current: entity.image,
        fixed: entity.image + '.jpg'
      });
    }
  }
});

// Report results
console.log(`${colors.yellow}--- Validation Results ---${colors.reset}\n`);

let totalIssues = 0;

// Gender issues
if (issues.genderCapitalization.length > 0) {
  console.log(`${colors.red}❌ Gender Capitalization Issues: ${issues.genderCapitalization.length}${colors.reset}`);
  issues.genderCapitalization.slice(0, 5).forEach(issue => {
    console.log(`   ${issue.entity}: "${issue.current}" → "${issue.fixed}"`);
  });
  if (issues.genderCapitalization.length > 5) {
    console.log(`   ... and ${issues.genderCapitalization.length - 5} more`);
  }
  console.log();
  totalIssues += issues.genderCapitalization.length;
}

// Casta typos
if (issues.castaTypos.length > 0) {
  console.log(`${colors.red}❌ Casta Typos: ${issues.castaTypos.length}${colors.reset}`);
  issues.castaTypos.forEach(issue => {
    console.log(`   ${issue.entity}: "${issue.current}" → "${issue.fixed}"`);
  });
  console.log();
  totalIssues += issues.castaTypos.length;
}

// Invalid casta values
if (issues.invalidCasta.length > 0) {
  console.log(`${colors.yellow}⚠️  Potentially Invalid Casta Values: ${issues.invalidCasta.length}${colors.reset}`);
  issues.invalidCasta.slice(0, 5).forEach(issue => {
    console.log(`   ${issue.entity}: "${issue.value}"`);
  });
  if (issues.invalidCasta.length > 5) {
    console.log(`   ... and ${issues.invalidCasta.length - 5} more`);
  }
  console.log();
}

// Class inconsistencies
if (issues.classInconsistencies.length > 0) {
  console.log(`${colors.yellow}⚠️  Class Values Needing Review: ${issues.classInconsistencies.length}${colors.reset}`);
  issues.classInconsistencies.slice(0, 5).forEach(issue => {
    console.log(`   ${issue.entity}: "${issue.value}"`);
  });
  if (issues.classInconsistencies.length > 5) {
    console.log(`   ... and ${issues.classInconsistencies.length - 5} more`);
  }
  console.log();
}

// Missing image extensions
if (issues.missingImageExtensions.length > 0) {
  console.log(`${colors.red}❌ Missing Image Extensions: ${issues.missingImageExtensions.length}${colors.reset}`);
  issues.missingImageExtensions.slice(0, 10).forEach(issue => {
    console.log(`   ${issue.entity}: "${issue.current}" → "${issue.fixed}"`);
  });
  if (issues.missingImageExtensions.length > 10) {
    console.log(`   ... and ${issues.missingImageExtensions.length - 10} more`);
  }
  console.log();
  totalIssues += issues.missingImageExtensions.length;
}

// Summary
console.log(`${colors.blue}--- Summary ---${colors.reset}`);
console.log(`Total entities validated: ${EntityList.length}`);
console.log(`Critical issues found: ${totalIssues}`);
console.log(`Warnings: ${issues.invalidCasta.length + issues.classInconsistencies.length}`);

if (totalIssues > 0) {
  console.log(`\n${colors.yellow}Run 'node scripts/cleanEntityList.js' to fix these issues automatically.${colors.reset}`);
}

// Export issues for cleaning script
module.exports = { issues };
