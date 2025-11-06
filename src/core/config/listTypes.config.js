/**
 * listTypes.config.js
 * Configuration for the List feature - contextual reference tables
 *
 * Each list type defines:
 * - UI display (label, icon, tooltip)
 * - LLM prompt template for generating markdown tables
 * - Expected columns
 * - Empty state message
 */

import { FaUsers, FaEye, FaCube, FaLeaf } from 'react-icons/fa';

/**
 * List type definitions
 * Phase 1: Only "People present" implemented for POC
 * Phase 2: Will add sensory, objects, ingredients
 */
export const LIST_TYPES = [
  {
    id: 'people',
    label: 'People present',
    icon: FaUsers,
    tooltip: 'List all people in this location',
    columns: ['Name/Description', 'Age', 'Class/Casta', 'Gender', 'Clothing', 'Activity'],
    emptyMessage: 'No other people are currently visible.',

    /**
     * Prompt template for generating the people list
     * Will be interpolated with game state variables
     */
    promptTemplate: `You are generating a reference table for Maria de Lima. She is currently in {location} at {time}.

**TASK**: List all people Maria can see right now in this location.

**MERCHANT INDICATOR**: Some NPCs are shopkeepers/merchants with permanent shops. These will be identified in the merchant context below. For any merchant, add 🛒 emoji AFTER their name in the Name/Description column.

{merchantContext}

**CRITICAL: Look at the recent narrative/conversation history to identify people who are PHYSICALLY PRESENT:**
- Check the most recent narrative turn for descriptions of people nearby
- Include NPCs who were just mentioned as being visible (e.g., "a fruit vendor", "a servant", "a man waiting")
- Include people who just arrived or are standing/working in the area
- DO NOT include people who left, departed, or are only mentioned in passing (e.g., "thinking about her sister")
- DO NOT include Maria herself

**FORMAT**: Create a markdown table with these exact columns:

| Name/Description | Age | Class/Casta | Gender | Clothing | Activity |

**COLUMN SPECIFICATIONS**:
- **Name/Description** (bold): If Maria knows this person, use their actual name in bold. **If they are a merchant, add 🛒 emoji AFTER the name** (e.g., "**Xochitl** 🛒" or "**Don Lorenzo Medina** 🛒"). If they are a stranger, use a brief description in bold (e.g., "**Stout fruit vendor woman**" or "**Young mestizo boy**")
- **Age**: Approximate age category (child / young / middle-aged / elderly)
- **Class/Casta**: Social class/casta designation (peninsular / criollo / mestizo / indigenous / mulatto / enslaved / working class / vendor / etc.)
- **Gender**: male / female
- **Clothing**: Brief description of what they're wearing (3-7 words maximum, e.g., "worn cotton dress, faded shawl")
- **Activity**: What they're doing right now (3-7 words maximum, e.g., "swatting flies from avocados" or "waiting nervously by door")

**MERCHANT EXAMPLES**:
- "**Xochitl** 🛒" | elder | indígena | female | simple huipil, woven shawl | arranging dried herbs on stall
- "**Don Lorenzo Medina** 🛒" | middle-aged | criollo | male | fine wool doublet, clean apron | measuring powders behind counter
- "**Isabel Téllez** 🛒" | young | mestiza | female | embroidered dress | sewing by shop window

**CRITICAL RULES**:
1. Keep ALL cells concise - 3 to 7 words maximum per cell
2. Only list people OTHER than Maria herself
3. Only list people Maria can actually see right now (physically present in the scene)
4. **LOOK at the recent narrative** - if someone was just described, they should be in the table!
5. **Check the merchant context above** - if someone is listed as a merchant, add 🛒 after their name
6. If no other people are present, output ONLY this text: "No other people are currently visible."
7. Start your response with EXACTLY this marker on its own line: [LIST_RESPONSE:people]
8. After the marker, output ONLY the markdown table with NO additional commentary, prose, or narration

**EXAMPLE OUTPUT** (if people are present):
[LIST_RESPONSE:people]
| Name/Description | Age | Class/Casta | Gender | Clothing | Activity |
|------------------|-----|-------------|--------|----------|----------|
| **Xochitl** 🛒 | elder | indígena | female | simple huipil, woven shawl | arranging herbs on stall |
| **Isabel Valdés** | middle-aged | criollo | female | worn black dress, mantilla | waiting anxiously by counter |
| **A young mestizo boy** | child | mestizo | male | simple cotton shirt, bare feet | sweeping floor near door |

**EXAMPLE OUTPUT** (if no one present):
[LIST_RESPONSE:people]
No other people are currently visible.`,
  },

  {
    id: 'sensory',
    label: 'Sensory details',
    icon: FaEye,
    tooltip: 'What Maria perceives with each sense',
    columns: ['Sense', 'Details'],
    emptyMessage: 'Unable to perceive sensory details.',

    promptTemplate: `You are generating a sensory reference table for Maria de Lima. She is currently in {location} at {time}.

**TASK**: Describe what Maria perceives with each of her five senses in this moment.

**FORMAT**: Create a markdown table with these exact columns:

| Sense | Details |

**COLUMN SPECIFICATIONS**:
- **Sense**: One of the five senses (Sight, Sound, Smell, Touch, Taste)
- **Details**: Rich sensory description (10-25 words)

**CRITICAL RULES**:
1. Include ALL five senses (Sight, Sound, Smell, Touch, Taste)
2. Be historically accurate - describe what would actually be present in 1680 Mexico City
3. Consider time of day and location (night is darker, markets are louder, churches smell of incense)
4. Make descriptions vivid and immersive
5. Start your response with EXACTLY this marker on its own line: [LIST_RESPONSE:sensory]
6. After the marker, output ONLY the markdown table with NO additional commentary

**EXAMPLE OUTPUT**:
[LIST_RESPONSE:sensory]
| Sense | Details |
|-------|---------|
| Sight | Flickering candlelight casts long shadows across dusty shelves lined with glass bottles and clay jars |
| Sound | Distant church bells toll the hour, echoing off stone buildings; footsteps on cobblestones outside |
| Smell | Acrid scent of sulfur mingles with dried lavender and the mustiness of old parchment |
| Touch | Cool, humid air carries a slight chill; rough wooden counter beneath your fingers |
| Taste | Lingering bitterness of morning chocolate on the tongue |`,
  },

  {
    id: 'objects',
    label: 'Visible objects',
    icon: FaCube,
    tooltip: 'Notable items and furnishings in view',
    columns: ['Object', 'Material', 'Condition', 'Notable Features'],
    emptyMessage: 'No notable objects visible.',

    promptTemplate: `You are generating an object reference table for Maria de Lima. She is currently in {location} at {time}.

**TASK**: List all notable objects, furniture, and items Maria can see right now (excluding people and tiny/trivial items).

**FORMAT**: Create a markdown table with these exact columns:

| Object | Material | Condition | Notable Features |

**COLUMN SPECIFICATIONS**:
- **Object**: Name of the object (e.g., "Wooden table", "Glass alembic", "Iron chandelier")
- **Material**: What it's made of (wood, glass, iron, clay, stone, etc.)
- **Condition**: Current state (pristine, worn, dusty, damaged, polished, etc.)
- **Notable Features**: Distinctive characteristics (3-10 words, e.g., "intricate carvings, dark stains")

**CRITICAL RULES**:
1. List 3-8 objects (most prominent/important ones)
2. Focus on objects larger than a hand - skip tiny items like individual coins
3. Be historically accurate for 1680 Mexico City
4. Keep cells concise (3-10 words maximum)
5. If no objects are visible, output ONLY: "No notable objects visible."
6. Start your response with EXACTLY this marker on its own line: [LIST_RESPONSE:objects]
7. After the marker, output ONLY the markdown table with NO additional commentary

**EXAMPLE OUTPUT**:
[LIST_RESPONSE:objects]
| Object | Material | Condition | Notable Features |
|--------|----------|-----------|------------------|
| Oak workbench | Wood, iron fittings | Well-used | Deep stains, burn marks from hot vessels |
| Glass alembic | Clear glass | Pristine | Swan-neck design, copper joints |
| Clay mortar and pestle | Glazed ceramic | Chipped edge | Residue of crushed herbs inside |
| Iron chandelier | Wrought iron | Slightly rusted | Six candle holders, chain suspension |`,
  },

  {
    id: 'ingredients',
    label: 'Available ingredients',
    icon: FaLeaf,
    tooltip: 'Materia medica and ingredients at hand',
    columns: ['Ingredient', 'Form', 'Origin', 'Properties', 'Quantity'],
    emptyMessage: 'No ingredients available here.',

    promptTemplate: `You are generating an ingredient reference table for Maria de Lima. She is currently in {location} at {time}.

**TASK**: List materia medica and ingredients Maria has access to RIGHT NOW in this location.

**FORMAT**: Create a markdown table with these exact columns:

| Ingredient | Form | Origin | Properties | Quantity |

**COLUMN SPECIFICATIONS**:
- **Ingredient**: Common name (e.g., "Lavender", "Mercury", "Cochineal dye")
- **Form**: Physical state (dried/fresh/powder/tincture/oil/paste/raw)
- **Origin**: Geographic source or supplier (New Spain/Europe/Indies/Local/etc.)
- **Properties**: Medical/alchemical properties (3-8 words, e.g., "calming, aids sleep, aromatic")
- **Quantity**: Rough amount (abundant/moderate/scarce/single jar/handful/etc.)

**CRITICAL RULES**:
1. ONLY list ingredients available in THIS location (apothecary shop: many; street: none; market: some for sale)
2. Be historically accurate - only ingredients that would exist in 1680 Mexico City
3. If at market, list what vendors are selling
4. If in apothecary workshop, list what's on shelves/workbench
5. If in street/plaza/non-shop location, likely output: "No ingredients available here."
6. Keep cells concise (3-8 words maximum)
7. Start your response with EXACTLY this marker on its own line: [LIST_RESPONSE:ingredients]
8. After the marker, output ONLY the markdown table with NO additional commentary

**EXAMPLE OUTPUT** (in apothecary):
[LIST_RESPONSE:ingredients]
| Ingredient | Form | Origin | Properties | Quantity |
|------------|------|--------|------------|----------|
| Chamomile | Dried flowers | New Spain | Calming, digestive aid | Abundant |
| Mercury | Liquid metal | Europe | Purgative, antisyphilitic | Single vial |
| Cochineal dye | Powder | Oaxaca | Red pigment, astringent | Moderate |
| Tobacco | Dried leaves | Caribbean | Stimulant, pain relief | Several bundles |

**EXAMPLE OUTPUT** (on street):
[LIST_RESPONSE:ingredients]
No ingredients available here.`,
  },
];

/**
 * Get a list type by ID
 * @param {string} id - List type ID
 * @returns {object|null} List type config or null if not found
 */
export function getListTypeById(id) {
  return LIST_TYPES.find(type => type.id === id) || null;
}

/**
 * Interpolate prompt template with game state variables
 * @param {object} listType - List type config
 * @param {object} gameState - Current game state
 * @param {object} options - Additional options (e.g., merchantContext)
 * @returns {string} Interpolated prompt
 */
export function interpolatePrompt(listType, gameState, options = {}) {
  let prompt = listType.promptTemplate;

  // Replace placeholders with actual game state values
  prompt = prompt.replace(/{location}/g, gameState.location || 'an unknown location');
  prompt = prompt.replace(/{time}/g, gameState.time || 'an unknown time');
  prompt = prompt.replace(/{date}/g, gameState.date || 'an unknown date');

  // Replace merchant context if provided (for people list)
  if (options.merchantContext) {
    prompt = prompt.replace(/{merchantContext}/g, options.merchantContext);
  } else {
    // Remove placeholder if no merchant context provided
    prompt = prompt.replace(/{merchantContext}/g, '');
  }

  return prompt;
}

/**
 * Get display label for a list type (for UI)
 * @param {string} id - List type ID
 * @returns {string} Human-readable label
 */
export function getListTypeLabel(id) {
  const type = getListTypeById(id);
  return type ? type.label : 'Unknown';
}

export default {
  LIST_TYPES,
  getListTypeById,
  interpolatePrompt,
  getListTypeLabel,
};
