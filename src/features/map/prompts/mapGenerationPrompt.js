/**
 * AI Map Generation Prompt Templates
 * These prompts help Claude (or other AI) generate new maps for scenarios
 */

/**
 * System prompt for map generation
 */
export const MAP_GENERATION_SYSTEM_PROMPT = `You are a historical map generator for a medical diagnosis game.

Your task is to generate realistic, historically accurate map data in JSON format that matches the map schema.

Requirements:
1. Maps must be valid JSON matching the provided TypeScript types
2. Exterior maps should reflect the actual street layout of the historical location
3. Interior maps should reflect realistic room layouts for the time period
4. Coordinates should be in SVG units (typically 0-1200 width, 0-900 height for exterior, 0-800 width, 0-600 height for interior)
5. Building types: 'residence', 'shop', 'church', 'government', 'market'
6. Room types: 'shop-floor', 'laboratory', 'bedroom', 'storage', 'courtyard', 'kitchen'
7. Use the glowy HUD aesthetic - dark backgrounds (#1a1f2e), cyan accents (#7dd3fc)

Historical Accuracy Guidelines:
- Research actual street names and locations when possible
- Consider the urban planning style of the era (colonial grids, medieval organic, etc.)
- Include period-appropriate landmarks (churches, markets, government buildings)
- Interior layouts should reflect social class and profession of the occupant

Always return valid JSON without markdown code blocks.`;

/**
 * Generate an exterior map prompt
 * @param {Object} options
 * @param {string} options.location - Location name (e.g., "Greenwich Village, 1940")
 * @param {string} options.historicalContext - Brief historical context
 * @param {string[]} options.keyLocations - Important locations to include
 * @param {string} options.style - Urban planning style
 * @returns {string}
 */
export function generateExteriorMapPrompt({
  location,
  historicalContext,
  keyLocations = [],
  style = 'grid'
}) {
  return `Generate an exterior map for: ${location}

Historical Context: ${historicalContext}

Key Locations to Include:
${keyLocations.map((loc, i) => `${i + 1}. ${loc}`).join('\n')}

Urban Planning Style: ${style}
- 'grid': American-style rectangular grid (Manhattan, Chicago)
- 'colonial-spanish': Irregular grid centered on plaza (Mexico City, Lima)
- 'medieval-organic': Winding streets and irregular blocks (London, Paris)

Map Requirements:
- Bounds: { width: 1200, height: 900 }
- At least 5 main streets with realistic names
- At least 8 buildings including:
  - The protagonist's location (isPlayerLocation: true)
  - At least one market
  - At least one church or religious building
  - At least one government building
  - Residential buildings
- At least 2 landmarks
- All buildings should have realistic polygon coordinates
- Use actual street names from ${location} when possible

Return JSON matching this TypeScript type:

interface ExteriorMapData {
  id: string;
  type: 'exterior';
  name: string;
  style: 'colonial-spanish' | 'grid-american' | 'medieval-organic';
  bounds: { width: number; height: number };
  streets: Array<{
    id: string;
    name: string;
    points: [number, number][];
    width: number;
    type?: 'main' | 'side' | 'alley';
  }>;
  buildings: Array<{
    id: string;
    name: string;
    polygon: [number, number][];
    type?: 'residence' | 'shop' | 'church' | 'government' | 'market';
    hasInterior: string | null;
    isPlayerLocation?: boolean;
    labelPosition?: [number, number];
  }>;
  landmarks?: Array<{
    id: string;
    name: string;
    position: [number, number];
    icon: string;
    description?: string;
  }>;
  backgroundColor?: string;
}

Return only the JSON, no markdown code blocks.`;
}

/**
 * Generate an interior map prompt
 * @param {Object} options
 * @param {string} options.buildingName - Building name
 * @param {string} options.buildingType - Type of building
 * @param {string} options.owner - Owner name and profession
 * @param {string} options.timePeriod - Time period
 * @param {string} options.socialClass - Social class
 * @param {number} options.roomCount - Number of rooms
 * @returns {string}
 */
export function generateInteriorMapPrompt({
  buildingName,
  buildingType,
  owner,
  timePeriod,
  socialClass = 'middle',
  roomCount = 4
}) {
  return `Generate an interior floorplan for: ${buildingName}

Building Type: ${buildingType}
Owner: ${owner}
Time Period: ${timePeriod}
Social Class: ${socialClass}
Number of Rooms: ${roomCount}

Map Requirements:
- Bounds: { width: 800, height: 600 }
- ${roomCount} rooms with realistic layouts for ${buildingType} in ${timePeriod}
- Rooms should be connected logically (adjacent rooms share walls)
- Include doors between rooms and to exterior
- Include period-appropriate furniture
- At least one entrance from street
- If applicable: shop floor, work area, living quarters, storage

Room Types:
- 'shop-floor': Customer-facing area
- 'laboratory': Work/production area
- 'bedroom': Private quarters
- 'storage': Storage area
- 'courtyard': Open courtyard (colonial style)
- 'kitchen': Cooking area

Furniture Types:
- 'counter': Shop counter, bar
- 'shelf': Shelving unit
- 'table': Work table, dining table
- 'chair': Seating
- 'bed': Sleeping furniture
- 'chest': Storage chest

Return JSON matching this TypeScript type:

interface InteriorMapData {
  id: string;
  type: 'interior';
  name: string;
  style: 'colonial-interior' | 'modern' | 'rustic';
  bounds: { width: number; height: number };
  rooms: Array<{
    id: string;
    name: string;
    polygon: [number, number][];
    type?: string;
  }>;
  doors: Array<{
    id: string;
    from: string;
    to: string;
    position: [number, number];
    rotation?: number;
    isLocked?: boolean;
  }>;
  furniture?: Array<{
    id: string;
    type: string;
    position: [number, number];
    rotation?: number;
    size?: [number, number];
  }>;
  backgroundColor?: string;
}

Return only the JSON, no markdown code blocks.`;
}

/**
 * Example usage documentation
 */
export const MAP_GENERATION_EXAMPLES = {
  exteriorExample: {
    prompt: "Generate a map of Greenwich Village, New York City in 1940",
    usage: `
// Example: Generate Greenwich Village 1940 map
const prompt = generateExteriorMapPrompt({
  location: "Greenwich Village, New York City, 1940",
  historicalContext: "Bohemian neighborhood, jazz clubs, immigrant communities, pre-WWII",
  keyLocations: [
    "Washington Square Park",
    "Café Societé (Jazz club)",
    "Jefferson Market Courthouse",
    "Judson Memorial Church",
    "Small pharmacies and shops"
  ],
  style: 'grid'
});

// Use with LLM
const response = await llmService.chat([
  { role: 'system', content: MAP_GENERATION_SYSTEM_PROMPT },
  { role: 'user', content: prompt }
]);

const mapData = JSON.parse(response.content);
`
  },

  interiorExample: {
    prompt: "Generate interior for a 1940s Greenwich Village pharmacy",
    usage: `
// Example: Generate pharmacy interior
const prompt = generateInteriorMapPrompt({
  buildingName: "Cohen's Pharmacy",
  buildingType: "pharmacy",
  owner: "Samuel Cohen, Jewish immigrant pharmacist",
  timePeriod: "1940s New York City",
  socialClass: "working",
  roomCount: 5
});

// Use with LLM
const response = await llmService.chat([
  { role: 'system', content: MAP_GENERATION_SYSTEM_PROMPT },
  { role: 'user', content: prompt }
]);

const mapData = JSON.parse(response.content);
`
  }
};

/**
 * Validation prompt - use this to check if generated map is valid
 */
export const MAP_VALIDATION_PROMPT = `Review the following map data and check for:

1. Valid JSON syntax
2. All required fields present
3. Coordinates within bounds
4. Polygons form closed shapes (first and last point should be close)
5. Buildings don't overlap excessively
6. Street widths are reasonable (15-40 pixels)
7. Room doors connect to valid rooms

If errors found, provide corrected JSON.
If valid, respond with "VALID"

Map data:
`;

export default {
  MAP_GENERATION_SYSTEM_PROMPT,
  generateExteriorMapPrompt,
  generateInteriorMapPrompt,
  MAP_GENERATION_EXAMPLES,
  MAP_VALIDATION_PROMPT
};
