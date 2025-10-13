/**
 * LLM-based Map Label Generator
 *
 * Generates contextually appropriate labels for map templates based on
 * historical era, location, character profession, and scenario details.
 *
 * @module maps/generators/labelGenerator
 */

import { createChatCompletion } from '../../services/llmService';

/**
 * Generate contextual labels for a map template
 *
 * @param {Object} template - Map template with label slots
 * @param {Object} scenario - Scenario configuration
 * @param {Object} options - Generation options
 * @param {string} options.characterProfession - Character's profession (e.g., 'apothecary')
 * @param {string} options.characterName - Character's name
 * @param {Object} options.locationContext - Additional location details
 * @returns {Promise<Object>} Object mapping label slots to generated names
 */
export async function generateMapLabels(template, scenario, options = {}) {
  const {
    characterProfession = 'apothecary',
    characterName = 'Unknown',
    locationContext = {}
  } = options;

  // Build the prompt for label generation
  const prompt = buildLabelPrompt(template, scenario, {
    characterProfession,
    characterName,
    locationContext
  });

  try {
    // Call LLM with structured JSON output
    const response = await createChatCompletion(
      prompt,
      [], // No conversation history needed
      {
        temperature: 0.8, // Some creativity for variety
        maxTokens: 1000
      }
    );

    // Parse the JSON response
    const labels = parseLabelsFromResponse(response, template);

    console.log('[LabelGenerator] Generated labels:', labels);
    return labels;

  } catch (error) {
    console.error('[LabelGenerator] Error generating labels:', error);

    // Fallback to default labels
    return generateDefaultLabels(template);
  }
}

/**
 * Build the LLM prompt for label generation
 */
function buildLabelPrompt(template, scenario, options) {
  const { characterProfession, characterName, locationContext } = options;

  // Extract label slots from template
  const labelSlots = [];

  if (template.zones) {
    template.zones.forEach(zone => {
      if (zone.labelSlot) {
        labelSlots.push({
          slot: zone.labelSlot,
          category: zone.category,
          description: zone.description,
          suggestedLabels: zone.suggestedLabels || [],
          defaultLabel: zone.defaultLabel
        });
      }
    });
  }

  if (template.streets) {
    template.streets.forEach(street => {
      if (street.nameSlot) {
        labelSlots.push({
          slot: street.nameSlot,
          category: 'street',
          description: `${street.type} street`,
          suggestedLabels: [],
          defaultLabel: 'Main Street'
        });
      }
    });
  }

  const prompt = `You are generating historically accurate location names for a ${template.type} map.

**Historical Context:**
- Setting: ${scenario.setting || 'Historical city'}
- Era: ${template.era?.join(', ') || 'Historical'}
- Year: ${scenario.year || 'Unknown'}
- Character: ${characterName}, ${characterProfession}
${locationContext.neighborhood ? `- Neighborhood: ${locationContext.neighborhood}` : ''}
${locationContext.socialClass ? `- Social Class: ${locationContext.socialClass}` : ''}

**Map Template:** ${template.name}
Type: ${template.type}

**Label Slots to Fill:**
${labelSlots.map((slot, i) => `
${i + 1}. **${slot.slot}**
   - Category: ${slot.category}
   - Description: ${slot.description}
   - Default: ${slot.defaultLabel}
   ${slot.suggestedLabels.length > 0 ? `- Suggestions: ${slot.suggestedLabels.join(', ')}` : ''}
`).join('\n')}

**Instructions:**
1. Generate historically accurate, contextually appropriate names for each label slot
2. Match the time period (${template.era?.join(', ')})
3. Reflect the location's character and the protagonist's profession (${characterProfession})
4. Use period-appropriate language and naming conventions
5. For interior spaces: Consider the profession and social context
6. For exterior spaces: Use authentic street/building names from the era
7. Keep names concise (2-4 words maximum)

**Output Format:**
Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  ${labelSlots.map(slot => `"${slot.slot}": "Generated Name Here"`).join(',\n  ')}
}

Generate the labels now:`;

  return prompt;
}

/**
 * Parse label mappings from LLM response
 */
function parseLabelsFromResponse(response, template) {
  try {
    // Remove markdown code blocks if present
    let jsonText = response.trim();
    jsonText = jsonText.replace(/```json\n?/g, '');
    jsonText = jsonText.replace(/```\n?/g, '');
    jsonText = jsonText.trim();

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    // Validate that all required slots are present
    const requiredSlots = [];

    if (template.zones) {
      template.zones.forEach(zone => {
        if (zone.labelSlot) requiredSlots.push(zone.labelSlot);
      });
    }

    if (template.streets) {
      template.streets.forEach(street => {
        if (street.nameSlot) requiredSlots.push(street.nameSlot);
      });
    }

    // Check for missing slots
    const missingSlots = requiredSlots.filter(slot => !parsed[slot]);
    if (missingSlots.length > 0) {
      console.warn('[LabelGenerator] Missing slots in response:', missingSlots);

      // Fill missing slots with defaults
      missingSlots.forEach(slot => {
        const zone = template.zones?.find(z => z.labelSlot === slot);
        const street = template.streets?.find(s => s.nameSlot === slot);
        parsed[slot] = zone?.defaultLabel || street?.defaultLabel || 'Unknown';
      });
    }

    return parsed;

  } catch (error) {
    console.error('[LabelGenerator] Failed to parse JSON response:', error);
    console.error('[LabelGenerator] Raw response:', response);

    // Fallback to defaults
    return generateDefaultLabels(template);
  }
}

/**
 * Generate default labels (fallback when LLM fails)
 */
function generateDefaultLabels(template) {
  const labels = {};

  if (template.zones) {
    template.zones.forEach(zone => {
      if (zone.labelSlot) {
        labels[zone.labelSlot] = zone.defaultLabel || 'Room';
      }
    });
  }

  if (template.streets) {
    template.streets.forEach(street => {
      if (street.nameSlot) {
        labels[street.nameSlot] = street.defaultLabel || 'Street';
      }
    });
  }

  console.log('[LabelGenerator] Using default labels:', labels);
  return labels;
}

/**
 * Batch generate labels for multiple templates
 *
 * @param {Array<Object>} templates - Array of map templates
 * @param {Object} scenario - Scenario configuration
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Object mapping template IDs to label sets
 */
export async function batchGenerateLabels(templates, scenario, options = {}) {
  const results = {};

  for (const template of templates) {
    try {
      const labels = await generateMapLabels(template, scenario, options);
      results[template.id] = labels;
    } catch (error) {
      console.error(`[LabelGenerator] Failed for template ${template.id}:`, error);
      results[template.id] = generateDefaultLabels(template);
    }
  }

  return results;
}

export default {
  generateMapLabels,
  batchGenerateLabels
};
