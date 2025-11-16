#!/usr/bin/env node
/**
 * applyMedicineCategories.js
 *
 * Reads medicine-categories.json and applies the categories to initialInventory.js
 */

const fs = require('fs');
const path = require('path');

function main() {
  console.log('📝 Applying medical categories to initialInventory.js...\n');

  // Read the categories JSON
  const categoriesPath = path.join(__dirname, 'medicine-categories.json');
  if (!fs.existsSync(categoriesPath)) {
    console.error('❌ Error: medicine-categories.json not found!');
    console.error('   Run: node scripts/generateMedicineCategories.js first');
    process.exit(1);
  }

  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

  // Read initialInventory.js
  const inventoryPath = path.join(__dirname, '../src/initialInventory.js');
  let content = fs.readFileSync(inventoryPath, 'utf8');

  let addedCount = 0;
  let skippedCount = 0;

  // Process each item
  for (const [itemId, itemCategories] of Object.entries(categories)) {
    // Skip if no categories or it's just a note
    if (itemCategories.note) {
      console.log(`⚠️  Item ${itemId} (${itemCategories.name}): ${itemCategories.note}`);
      skippedCount++;
      continue;
    }

    if (itemCategories.primarySystems.length === 0 &&
        itemCategories.organAffinities.length === 0 &&
        itemCategories.specificConditions.length === 0) {
      console.log(`⚠️  Item ${itemId} (${itemCategories.name}): No categories to add`);
      skippedCount++;
      continue;
    }

    // Check if item already has categories
    const itemPattern = new RegExp(`id: ${itemId},[\\s\\S]*?primarySystems:`, 'm');
    if (itemPattern.test(content)) {
      console.log(`✓ Item ${itemId} (${itemCategories.name}) already has categories, skipping`);
      skippedCount++;
      continue;
    }

    // Find the item and add categories before the closing brace
    const itemBlockPattern = new RegExp(
      `(\\{[\\s\\S]*?id: ${itemId},[\\s\\S]*?)(\\n    \\},?)`,
      'm'
    );

    const match = content.match(itemBlockPattern);
    if (!match) {
      console.error(`❌ Could not find item ${itemId}`);
      continue;
    }

    let beforeClosing = match[1];
    const closing = match[2];

    // Ensure last property has a comma
    if (!beforeClosing.trimEnd().endsWith(',')) {
      beforeClosing = beforeClosing.trimEnd() + ',';
    }

    // Build category fields
    const categoryFields = [];

    if (itemCategories.primarySystems.length > 0) {
      categoryFields.push(`    primarySystems: ${JSON.stringify(itemCategories.primarySystems)}`);
    }

    if (itemCategories.organAffinities.length > 0) {
      categoryFields.push(`    organAffinities: ${JSON.stringify(itemCategories.organAffinities)}`);
    }

    if (itemCategories.specificConditions.length > 0) {
      categoryFields.push(`    specificConditions: ${JSON.stringify(itemCategories.specificConditions)}`);
    }

    const categoryString = '\n' + categoryFields.join(',\n');

    // Replace
    const newItem = beforeClosing + categoryString + closing;
    content = content.replace(match[0], newItem);

    console.log(`✅ Added categories to item ${itemId} (${itemCategories.name})`);
    addedCount++;
  }

  // Write back
  fs.writeFileSync(inventoryPath, content, 'utf8');

  console.log(`\n✅ Done! Added categories to ${addedCount} items`);
  console.log(`   ${skippedCount} items skipped`);
  console.log('\n👉 Next: Test the game and verify categories work correctly');
}

main();
