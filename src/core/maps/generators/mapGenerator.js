/**
 * Map Generator - Combines templates with LLM-generated labels
 *
 * Produces complete, render-ready map data by populating generic templates
 * with contextually appropriate labels.
 *
 * @module maps/generators/mapGenerator
 */

import { getTemplate } from '../templates';
import { generateMapLabels } from './labelGenerator';

/**
 * Generate a complete map from a template
 *
 * @param {string} templateId - Template ID to use
 * @param {Object} scenario - Scenario configuration
 * @param {Object} options - Generation options
 * @param {boolean} options.useDefaults - Skip LLM, use default labels (faster)
 * @param {string} options.characterProfession - Character profession
 * @param {string} options.characterName - Character name
 * @param {Object} options.locationContext - Additional location details
 * @param {Object} options.overrideLabels - Manual label overrides
 * @returns {Promise<Object>} Complete map data ready for rendering
 */
export async function generateMap(templateId, scenario, options = {}) {
  const {
    useDefaults = false,
    characterProfession = 'apothecary',
    characterName = 'Unknown',
    locationContext = {},
    overrideLabels = {}
  } = options;

  // Get the template
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  console.log(`[MapGenerator] Generating map from template: ${templateId}`);

  // Generate labels (or use defaults)
  let labels;
  if (useDefaults) {
    labels = generateDefaultLabels(template);
  } else {
    labels = await generateMapLabels(template, scenario, {
      characterProfession,
      characterName,
      locationContext
    });
  }

  // Apply manual overrides
  labels = { ...labels, ...overrideLabels };

  // Populate the template with labels
  const map = populateTemplate(template, labels, scenario);

  console.log('[MapGenerator] Generated map:', map);
  return map;
}

/**
 * Populate a template with generated labels
 */
function populateTemplate(template, labels, scenario) {
  const map = {
    id: `${template.id}-${Date.now()}`, // Unique ID
    type: template.type,
    name: template.name, // Keep template name or override?
    style: template.style || determineStyleFromEra(template.era),
    bounds: template.bounds,
    generatedFrom: template.id,
    generatedAt: new Date().toISOString()
  };

  // Populate zones/rooms with labels
  if (template.zones) {
    if (template.type === 'interior') {
      map.rooms = template.zones.map(zone => ({
        id: zone.id,
        name: labels[zone.labelSlot] || zone.defaultLabel || 'Unknown Room',
        polygon: zone.polygon,
        type: zone.type || zone.category,
        category: zone.category,
        description: zone.description
      }));
    } else {
      map.buildings = template.zones.map(zone => ({
        id: zone.id,
        name: labels[zone.labelSlot] || zone.defaultLabel || 'Unknown Building',
        polygon: zone.polygon,
        type: zone.type || zone.category,
        category: zone.category,
        description: zone.description
      }));
    }
  }

  // Populate streets with names
  if (template.streets) {
    map.streets = template.streets.map(street => ({
      id: street.id,
      name: street.nameSlot ? labels[street.nameSlot] : undefined,
      points: street.points,
      width: street.width,
      type: street.type
    }));
  }

  // Copy doors directly (no labels needed)
  if (template.doors) {
    map.doors = template.doors.map(door => ({ ...door }));
  }

  // Convert furniture slots to furniture instances
  if (template.furnitureSlots) {
    map.furniture = template.furnitureSlots.map((slot, index) => ({
      id: `${slot.type}-${index}`,
      name: generateFurnitureName(slot.type),
      type: slot.type,
      position: slot.position,
      size: slot.size || [40, 40],
      rotation: slot.rotation || 0
    }));
  }

  // Copy landmarks
  if (template.landmarks) {
    map.landmarks = template.landmarks.map(landmark => ({ ...landmark }));
  }

  // Set background color based on era/theme
  map.backgroundColor = template.backgroundColor || determineBackgroundColor(template.era);

  return map;
}

/**
 * Generate default labels without LLM
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

  return labels;
}

/**
 * Generate furniture names based on type
 */
function generateFurnitureName(type) {
  const names = {
    counter: 'Sales Counter',
    table: 'Table',
    shelf: 'Shelf',
    chair: 'Chair',
    bed: 'Bed',
    chest: 'Chest',
    apparatus: 'Apparatus',
    workbench: 'Workbench'
  };

  return names[type] || 'Furniture';
}

/**
 * Determine map style based on era
 */
function determineStyleFromEra(era = []) {
  if (era.includes('colonial') || era.includes('baroque')) {
    return 'colonial-interior';
  }
  if (era.includes('victorian')) {
    return 'victorian-interior';
  }
  if (era.includes('medieval')) {
    return 'medieval-interior';
  }
  return 'generic-interior';
}

/**
 * Determine background color based on era
 */
function determineBackgroundColor(era = []) {
  if (era.includes('colonial') || era.includes('baroque')) {
    return '#1a1f2e'; // Dark colonial blue
  }
  if (era.includes('victorian')) {
    return '#2a1f1a'; // Dark brown
  }
  if (era.includes('medieval')) {
    return '#1a1a1a'; // Dark gray
  }
  return '#1a1f2e'; // Default dark
}

/**
 * Generate multiple maps from templates
 *
 * @param {Array<string>} templateIds - Array of template IDs
 * @param {Object} scenario - Scenario configuration
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Object mapping template IDs to generated maps
 */
export async function generateMaps(templateIds, scenario, options = {}) {
  const maps = {};

  for (const templateId of templateIds) {
    try {
      const map = await generateMap(templateId, scenario, options);
      maps[templateId] = map;
    } catch (error) {
      console.error(`[MapGenerator] Failed to generate map for ${templateId}:`, error);
    }
  }

  return maps;
}

/**
 * Generate a map with custom furniture layout
 *
 * @param {string} templateId - Template ID
 * @param {Object} scenario - Scenario configuration
 * @param {Array<Object>} furnitureLayout - Custom furniture definitions
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Complete map with custom furniture
 */
export async function generateMapWithFurniture(templateId, scenario, furnitureLayout, options = {}) {
  const map = await generateMap(templateId, scenario, options);

  // Replace furniture with custom layout
  map.furniture = furnitureLayout;

  return map;
}

export default {
  generateMap,
  generateMaps,
  generateMapWithFurniture
};
