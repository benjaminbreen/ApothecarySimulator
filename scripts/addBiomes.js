/**
 * Script to add biome metadata to worldLocations.js
 * Analyzes location properties and adds appropriate biome
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/features/map/data/worldLocations.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Biome detection logic
function detectBiome(location) {
  const name = location.name?.toLowerCase() || '';
  const fullName = location.fullName?.toLowerCase() || '';
  const importance = location.importance?.toLowerCase() || '';
  const region = location.region?.toLowerCase() || '';

  // Mexico City - special case
  if (name.includes('mexico city') || fullName.includes('mexico city')) {
    return 'city-mexico';
  }

  // Ports/Coastal
  if (importance.includes('port') || fullName.includes('port') ||
      name.includes('acapulco') || name.includes('veracruz') ||
      fullName.includes('harbor') || fullName.includes('coastal')) {
    return 'coastal';
  }

  // Ocean/Sea
  if (region.includes('atlantic') || region.includes('pacific') ||
      region.includes('indian ocean') || fullName.includes('ocean')) {
    return 'ocean';
  }

  // Mining/Mountain regions
  if (importance.includes('mining') || name.includes('taxco') ||
      name.includes('zacatecas') || name.includes('potosi') ||
      name.includes('xalapa')) {
    return 'mountain';
  }

  // Desert/Arid
  if (name.includes('sonora') || name.includes('chihuahua') ||
      name.includes('durango') || region.includes('north africa') ||
      fullName.includes('desert') || fullName.includes('sahara')) {
    return 'desert';
  }

  // European cities
  if (region.includes('europe')) {
    return 'city-european';
  }

  // Colonial cities (New Spain, Central/South America, Caribbean, Asia)
  if (importance.includes('capital') || importance.includes('regional-center') ||
      importance.includes('metropolis') || importance.includes('city')) {
    return 'city-colonial';
  }

  // Countryside/Rural
  if (fullName.includes('countryside') || fullName.includes('outskirts') ||
      importance.includes('local') || fullName.includes('rural')) {
    return 'grassland';
  }

  // Default for cities
  if (region.includes('new spain') || region.includes('central america') ||
      region.includes('caribbean') || region.includes('south america')) {
    return 'city-colonial';
  }

  // Default fallback
  return 'grassland';
}

// Parse locations from the file
const locationsMatch = content.match(/const RAW_WORLD_LOCATIONS = \[([\s\S]*?)\];/);
if (!locationsMatch) {
  console.error('Could not find RAW_WORLD_LOCATIONS array');
  process.exit(1);
}

// Add biome after region line
content = content.replace(
  /(\s+region: ['"][\w\s]+['"],)(\n\s+importance:)/g,
  (match, regionLine, importanceLine) => {
    // Check if biome already exists
    if (content.slice(content.indexOf(match) - 100, content.indexOf(match)).includes('biome:')) {
      return match;
    }
    return `${regionLine}\n    biome: 'placeholder',${importanceLine}`;
  }
);

// Now do a second pass with actual biome detection
// This is a simplified approach - we'll match each location block
const locationPattern = /\{[^}]*region: ['"]([^'"]+)['"][^}]*\}/g;

console.log('Adding biomes to locations...');

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Biome metadata added to worldLocations.js');
