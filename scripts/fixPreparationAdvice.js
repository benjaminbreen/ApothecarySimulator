// Fixed script to add preparationAdvice - uses item boundary detection
const fs = require('fs');
const path = require('path');

// Import the preparation advice data from the other script
const preparationAdviceData = require('./addPreparationAdvice.js').preparationAdviceData || {
  // Fallback if we can't import - add the data inline
  24: {
    decoction: "Boil bark in water or wine for warming cordial; strengthens stomach.",
    distillation: "Distill for fragrant spirit; excellent carminative and stomachic.",
    calcination: "Burn to ash for alkaline salt; destroys aromatic principles.",
    confection: "Powder and mix with sugar for warming electuary; aids digestion."
  },
  25: {
    decoction: "Infuse buds in wine for warming tincture; relieves toothache and nausea.",
    distillation: "Distill for potent essential oil; numbs pain, aids digestion.",
    calcination: "Burn to ash for mild salt; wastes precious aromatic oils.",
    confection: "Powder and mix with honey for dental paste; eases tooth pain."
  },
  26: {
    decoction: "Grate and infuse in warm wine; comforts cold stomach and brain.",
    distillation: "Distill for concentrated essence; powerful stomachic and cordial.",
    calcination: "Burn to ash for aromatic salt; most volatile oils lost.",
    confection: "Powder and mix with sugar for digestive confection; warms vital organs."
  }
  // TODO: Add remaining items
};

const filePath = path.join(__dirname, '../src/initialInventory.js');
let content = fs.readFileSync(filePath, 'utf8');

// Split into lines for easier processing
const lines = content.split('\n');
let result = [];
let currentItemStart = null;
let currentItemId = null;
let itemLines = [];
let insideItem = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect start of item: "    {" or "{" at specific indentation
  if (line.match(/^    \{$/) && !insideItem) {
    insideItem = true;
    currentItemStart = i;
    itemLines = [line];
    continue;
  }

  if (insideItem) {
    itemLines.push(line);

    // Check for item ID
    const idMatch = line.match(/^\s+id: (\d+),/);
    if (idMatch) {
      currentItemId = parseInt(idMatch[1]);
    }

    // Detect end of item: "    }," or "    }"
    if (line.match(/^    \},?$/)) {
      // Item complete - check if it needs preparationAdvice
      const itemText = itemLines.join('\n');
      const hasAdvice = itemText.includes('preparationAdvice:');
      const advice = preparationAdviceData[currentItemId];

      if (!hasAdvice && advice && currentItemId) {
        console.log(`Adding preparationAdvice to item ${currentItemId}`);

        // Find the closing brace line index
        const lastLine = itemLines[itemLines.length - 1];

        // Insert preparationAdvice before closing brace
        const adviceStr = `    preparationAdvice: {
        decoction: "${advice.decoction}",
        distillation: "${advice.distillation}",
        calcination: "${advice.calcination}",
        confection: "${advice.confection}"
    }`;

        // Add advice before closing brace
        itemLines.splice(itemLines.length - 1, 0, adviceStr);

        // Also need to add comma to previous line if it doesn't have one
        const prevLine = itemLines[itemLines.length - 3];
        if (prevLine && !prevLine.trimEnd().endsWith(',')) {
          itemLines[itemLines.length - 3] = prevLine + ',';
        }
      }

      // Add all item lines to result
      result.push(...itemLines);

      // Reset
      insideItem = false;
      itemLines = [];
      currentItemId = null;
      continue;
    }
  }

  if (!insideItem) {
    result.push(line);
  }
}

// Write back
fs.writeFileSync(filePath, result.join('\n'), 'utf8');
console.log('Done!');
