const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/initialInventory.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find all items and check if they have preparationAdvice
const itemMatches = content.matchAll(/\{\s*id: (\d+),[\s\S]*?\n    \},?/g);

const missingAdvice = [];

for (const match of itemMatches) {
  const itemId = match[1];
  const itemText = match[0];

  // Check if this item has preparationAdvice
  if (!itemText.includes('preparationAdvice:')) {
    missingAdvice.push(itemId);
  }
}

console.log(`Items missing preparationAdvice: ${missingAdvice.length} total`);
console.log(missingAdvice.join(', '));
