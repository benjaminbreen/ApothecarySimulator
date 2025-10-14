/**
 * Consumption Service
 *
 * Uses LLM to realistically evaluate the effects of consuming items
 * based on their actual properties and nature.
 */

import { createChatCompletion } from './llmService';

/**
 * Evaluates the health/energy effects of consuming an item
 *
 * @param {string} itemName - Name of the item being consumed
 * @param {Object} itemProperties - Properties of the item (medicinal, toxic, etc.)
 * @param {string} scenario - Brief game context
 * @returns {Promise<Object>} - { healthChange, energyChange, message }
 */
export async function evaluateConsumptionEffects(itemName, itemProperties = {}, scenario = '') {
  console.log('[Consumption] Evaluating effects for:', itemName);

  const systemPrompt = `You are a medical and historical expert evaluating the effects of consuming various substances in 1680 Mexico City.

GAME CONTEXT: This is a historical medical RPG where Maria de Lima, a converso apothecary, manages her health and energy through various means. When she consumes items, realistic effects should occur.

TASK: Analyze the item being consumed and determine realistic health and energy effects.

GUIDELINES:
- Food items (bread, honey, fruits): +10 to +25 energy, +0 to +10 health
- Medicinal herbs (properly used): +5 to +15 health, +3 to +8 energy
- Inedible objects (pins, leather, metal): -10 to -25 health, -5 to -15 energy, risk of injury
- Toxic substances (mercury, lead, arsenic, deadly plants): -100 health (instant death), use "lethal" severity
- Moderately toxic (questionable substances): -15 to -30 health, -10 to -20 energy
- Raw materials (thread, fabric): -5 to -10 energy, neutral or slight negative health
- Unknown substances: Vary based on realistic assessment

IMPORTANT: For truly deadly substances (mercury, lead, arsenic, nightshade, etc.), set healthChange to -100 and severity to "lethal" to represent instant death.

RESPONSE FORMAT (JSON):
{
  "healthChange": <number between -100 and +20, use -100 for instant death>,
  "energyChange": <number between -25 and +25>,
  "message": "<One vivid sentence describing what happened, mentioning the item name>",
  "severity": "<mild/moderate/severe/lethal/beneficial>"
}

Be realistic and specific. A hat pin or leather should cause injury. Honey should be nourishing. Medicinal herbs should help. Toxic substances should harm significantly.`;

  const userPrompt = `Item to consume: ${itemName}

Item properties: ${JSON.stringify(itemProperties, null, 2)}

${scenario ? `Game context: ${scenario}` : ''}

Evaluate the effects of Maria consuming this item. Return ONLY valid JSON.`;

  try {
    const response = await createChatCompletion(
      systemPrompt,
      [{ role: 'user', content: userPrompt }],
      {
        temperature: 0.3, // Lower temperature for more consistent results
        maxTokens: 200,
        responseFormat: { type: 'json_object' }
      }
    );

    const result = JSON.parse(response.choices[0].message.content);

    console.log('[Consumption] LLM evaluation:', result);

    return {
      healthChange: result.healthChange || 0,
      energyChange: result.energyChange || 0,
      message: result.message || `Maria consumed the ${itemName}.`,
      severity: result.severity || 'mild'
    };

  } catch (error) {
    console.error('[Consumption] LLM evaluation failed:', error);

    // Fallback to simple heuristics if LLM fails
    return getFallbackEffects(itemName, itemProperties);
  }
}

/**
 * Fallback heuristics if LLM fails
 */
function getFallbackEffects(itemName, properties = {}) {
  const nameLower = itemName.toLowerCase();

  // Check for lethal substances
  if (nameLower.includes('mercury') || nameLower.includes('lead') ||
      nameLower.includes('arsenic') || nameLower.includes('nightshade') ||
      nameLower.includes('hemlock') || nameLower.includes('belladonna')) {
    return {
      healthChange: -100,
      energyChange: 0,
      message: `Maria consumed the ${itemName}. The deadly poison killed her instantly!`,
      severity: 'lethal'
    };
  }

  // Check for obviously dangerous items
  if (nameLower.includes('pin') || nameLower.includes('needle') ||
      nameLower.includes('metal') || nameLower.includes('iron')) {
    return {
      healthChange: -15,
      energyChange: -10,
      message: `Maria consumed the ${itemName}. The sharp object caused internal injury!`,
      severity: 'severe'
    };
  }

  // Check for food items
  if (nameLower.includes('bread') || nameLower.includes('honey') ||
      nameLower.includes('fruit') || nameLower.includes('food')) {
    return {
      healthChange: 5,
      energyChange: 15,
      message: `Maria consumed the ${itemName}. It was nourishing and restored her energy.`,
      severity: 'beneficial'
    };
  }

  // Check properties
  if (properties.toxic || properties.poisonous) {
    return {
      healthChange: -20,
      energyChange: -15,
      message: `Maria consumed the ${itemName}. The toxic substance made her violently ill!`,
      severity: 'severe'
    };
  }

  if (properties.edible || properties.nutritious) {
    return {
      healthChange: 3,
      energyChange: 12,
      message: `Maria consumed the ${itemName}. It provided modest nourishment.`,
      severity: 'mild'
    };
  }

  // Default - probably shouldn't eat this
  return {
    healthChange: -5,
    energyChange: -3,
    message: `Maria consumed the ${itemName}. It was not meant for consumption and upset her stomach.`,
    severity: 'mild'
  };
}
