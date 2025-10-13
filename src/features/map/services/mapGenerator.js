/**
 * Map Generator Service
 * Utilities for generating new maps using AI
 */

import {
  MAP_GENERATION_SYSTEM_PROMPT,
  generateExteriorMapPrompt,
  generateInteriorMapPrompt
} from '../prompts/mapGenerationPrompt';
import { validateMapData } from '../../../core/types/map.types';

/**
 * Generate an exterior map using AI
 * @param {Object} llmService - LLM service instance
 * @param {Object} options - Map generation options
 * @returns {Promise<Object>} - Generated map data
 */
export async function generateExteriorMap(llmService, options) {
  const userPrompt = generateExteriorMapPrompt(options);

  try {
    const response = await llmService.chat([
      { role: 'system', content: MAP_GENERATION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    // Parse JSON response
    let mapData;
    try {
      mapData = JSON.parse(response.content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        mapData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse map data: ' + parseError.message);
      }
    }

    // Validate map data
    validateMapData(mapData);

    return {
      success: true,
      mapData
    };

  } catch (error) {
    console.error('Map generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate an interior map using AI
 * @param {Object} llmService - LLM service instance
 * @param {Object} options - Map generation options
 * @returns {Promise<Object>} - Generated map data
 */
export async function generateInteriorMap(llmService, options) {
  const userPrompt = generateInteriorMapPrompt(options);

  try {
    const response = await llmService.chat([
      { role: 'system', content: MAP_GENERATION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    // Parse JSON response
    let mapData;
    try {
      mapData = JSON.parse(response.content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        mapData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse map data: ' + parseError.message);
      }
    }

    // Validate map data
    validateMapData(mapData);

    return {
      success: true,
      mapData
    };

  } catch (error) {
    console.error('Map generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save generated map to scenario folder
 * (This would be done manually or through a build script)
 * @param {Object} mapData - Map data to save
 * @param {string} scenarioId - Scenario ID
 * @param {string} mapId - Map ID
 * @param {string} mapType - 'exterior' or 'interior'
 * @returns {string} - Instructions for saving
 */
export function getSaveInstructions(mapData, scenarioId, mapId, mapType) {
  const filename = `${mapId}.js`;
  const path = `src/scenarios/${scenarioId}/maps/${filename}`;

  const fileContent = `/**
 * ${mapType === 'exterior' ? 'Exterior' : 'Interior'} map: ${mapData.name}
 * Generated map for ${scenarioId}
 *
 * @type {import('../../../core/types/map.types').${mapType === 'exterior' ? 'ExteriorMapData' : 'InteriorMapData'}}
 */
export default ${JSON.stringify(mapData, null, 2)};
`;

  return {
    path,
    filename,
    content: fileContent,
    instructions: `
To save this map:

1. Create file: ${path}

2. Add to maps/index.js:
   import ${mapId} from './${mapId}';

3. Add to the maps object:
   ${mapType}: {
     ...
     '${mapId}': ${mapId}
   }

4. Update scenario config if needed
`
  };
}

/**
 * Example: Generate a complete scenario map set
 * @param {Object} llmService - LLM service instance
 * @param {Object} scenarioInfo - Scenario information
 * @returns {Promise<Object>} - Generated maps
 */
export async function generateScenarioMaps(llmService, scenarioInfo) {
  const {
    location,
    timePeriod,
    historicalContext,
    keyLocations,
    protagonistBuilding,
    protagonistProfession
  } = scenarioInfo;

  console.log(`Generating maps for: ${location} (${timePeriod})`);

  // Generate exterior map
  const exteriorResult = await generateExteriorMap(llmService, {
    location: `${location}, ${timePeriod}`,
    historicalContext,
    keyLocations,
    style: scenarioInfo.urbanStyle || 'grid'
  });

  if (!exteriorResult.success) {
    return {
      success: false,
      error: 'Failed to generate exterior map: ' + exteriorResult.error
    };
  }

  // Generate interior map for protagonist's building
  const interiorResult = await generateInteriorMap(llmService, {
    buildingName: protagonistBuilding.name,
    buildingType: protagonistBuilding.type,
    owner: `${scenarioInfo.protagonistName}, ${protagonistProfession}`,
    timePeriod,
    socialClass: scenarioInfo.socialClass || 'middle',
    roomCount: protagonistBuilding.roomCount || 5
  });

  if (!interiorResult.success) {
    return {
      success: false,
      error: 'Failed to generate interior map: ' + interiorResult.error
    };
  }

  return {
    success: true,
    exterior: exteriorResult.mapData,
    interior: interiorResult.mapData,
    saveInstructions: {
      exterior: getSaveInstructions(
        exteriorResult.mapData,
        scenarioInfo.scenarioId,
        `${scenarioInfo.scenarioId}-center`,
        'exterior'
      ),
      interior: getSaveInstructions(
        interiorResult.mapData,
        scenarioInfo.scenarioId,
        `${protagonistBuilding.id}-interior`,
        'interior'
      )
    }
  };
}

export default {
  generateExteriorMap,
  generateInteriorMap,
  getSaveInstructions,
  generateScenarioMaps
};
