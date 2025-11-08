/**
 * Script to replace placeholder biomes with intelligent biomes
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/features/map/data/worldLocations.js');
let content = fs.readFileSync(filePath, 'utf8');

// Define biome rules based on location properties
const biomeRules = [
  // Coastal/Ports
  { match: /id: '(acapulco|veracruz|havana|cartagena|portobelo|panama-city|callao|valparaiso|buenos-aires|montevideo|cape-verde|dakar|cape-town|cadiz|manila|macao|goa|batavia)'/,
    biome: 'coastal' },

  // Ocean/Sea passages
  { match: /region: '(Atlantic|Pacific|Indian Ocean)'/,
    biome: 'ocean' },

  // Mining/Mountain towns
  { match: /(importance: 'mining'|id: '(taxco|zacatecas|guanajuato|potosi|san-luis-potosi|xalapa)')/,
    biome: 'mountain' },

  // Desert/Frontier (Northern Mexico, North Africa)
  { match: /id: '(durango|chihuahua|santa-fe|el-paso|sonora|marrakesh|fez|tunis|algiers)'/,
    biome: 'desert' },

  // European cities
  { match: /region: 'Europe'/,
    biome: 'city-european' },

  // Grassland/Rural
  { match: /(importance: 'local'|fullName: '.*Countryside.*'|fullName: '.*Outskirts.*')/,
    biome: 'grassland' },
];

// Apply rules
let modifiedCount = 0;

// Process each location block
const locationRegex = /(\{[^}]*id: '([^']+)'[^}]*region: '[^']*'[^}]*biome: 'placeholder'[^}]*\})/gs;

content = content.replace(locationRegex, (match, fullMatch, locationId) => {
  // Check each rule
  for (const rule of biomeRules) {
    if (rule.match.test(match)) {
      modifiedCount++;
      return match.replace("biome: 'placeholder'", `biome: '${rule.biome}'`);
    }
  }

  // Default: most locations are colonial cities
  modifiedCount++;
  return match.replace("biome: 'placeholder'", "biome: 'city-colonial'");
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✓ Fixed ${modifiedCount} biomes in worldLocations.js`);
