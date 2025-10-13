/**
 * Demo: Procedural Map Generation
 *
 * This file demonstrates the procedural map generation system.
 * Run this to see how templates + LLM = contextual maps.
 *
 * Usage:
 * 1. Import this in your scenario loader or component
 * 2. Call demoMapGeneration()
 * 3. Check console for results
 */

import { generateMap, generateMapLabels } from './index';
import { getTemplate, findTemplates } from '../templates';

/**
 * Demo 1: Generate a map with LLM labels
 */
export async function demoBasicGeneration() {
  console.log('\n========================================');
  console.log('DEMO 1: Basic Map Generation with LLM');
  console.log('========================================\n');

  // Mock scenario (replace with real scenario)
  const scenario = {
    id: '1680-mexico-city',
    setting: 'Mexico City, New Spain',
    year: 1680,
    era: 'colonial'
  };

  try {
    const map = await generateMap(
      'small-colonial-house',
      scenario,
      {
        characterProfession: 'apothecary',
        characterName: 'Maria de Lima',
        locationContext: {
          neighborhood: 'Plaza Mayor',
          socialClass: 'merchant'
        }
      }
    );

    console.log('✅ Map Generated Successfully!\n');
    console.log('Map ID:', map.id);
    console.log('Type:', map.type);
    console.log('Bounds:', map.bounds);
    console.log('\nRoom Names:');
    map.rooms.forEach((room, i) => {
      console.log(`  ${i + 1}. ${room.name} (${room.category})`);
    });
    console.log('\nFurniture Count:', map.furniture.length);
    console.log('Door Count:', map.doors.length);

    return map;

  } catch (error) {
    console.error('❌ Demo 1 Failed:', error);
    return null;
  }
}

/**
 * Demo 2: Generate with default labels (no LLM)
 */
export async function demoDefaultLabels() {
  console.log('\n========================================');
  console.log('DEMO 2: Fast Generation (Default Labels)');
  console.log('========================================\n');

  const scenario = {
    id: 'test-scenario',
    setting: 'Generic City',
    year: 1700
  };

  try {
    const map = await generateMap(
      'small-colonial-house',
      scenario,
      {
        useDefaults: true  // Skip LLM
      }
    );

    console.log('✅ Map Generated (Default Labels)\n');
    console.log('Room Names:');
    map.rooms.forEach((room, i) => {
      console.log(`  ${i + 1}. ${room.name}`);
    });

    return map;

  } catch (error) {
    console.error('❌ Demo 2 Failed:', error);
    return null;
  }
}

/**
 * Demo 3: Generate labels only (no full map)
 */
export async function demoLabelGeneration() {
  console.log('\n========================================');
  console.log('DEMO 3: Label Generation Only');
  console.log('========================================\n');

  const template = getTemplate('baroque-city-grid');
  const scenario = {
    id: '1680-london',
    setting: 'London, England',
    year: 1680,
    era: 'baroque'
  };

  try {
    const labels = await generateMapLabels(template, scenario, {
      characterProfession: 'physician',
      characterName: 'Dr. William Harvey'
    });

    console.log('✅ Labels Generated:\n');
    Object.entries(labels).forEach(([slot, name]) => {
      console.log(`  ${slot}: "${name}"`);
    });

    return labels;

  } catch (error) {
    console.error('❌ Demo 3 Failed:', error);
    return null;
  }
}

/**
 * Demo 4: Template discovery
 */
export function demoTemplateDiscovery() {
  console.log('\n========================================');
  console.log('DEMO 4: Template Discovery');
  console.log('========================================\n');

  // Find all interior templates
  const interiorTemplates = findTemplates({ type: 'interior' });
  console.log('Interior Templates:');
  interiorTemplates.forEach(t => {
    console.log(`  - ${t.id}: ${t.name}`);
    console.log(`    Era: ${t.era?.join(', ')}`);
    console.log(`    Professions: ${t.professions?.join(', ')}`);
  });

  console.log('\n');

  // Find all baroque-era templates
  const baroqueTemplates = findTemplates({ era: 'baroque' });
  console.log('Baroque Era Templates:');
  baroqueTemplates.forEach(t => {
    console.log(`  - ${t.id}: ${t.name} (${t.type})`);
  });

  console.log('\n');

  // Find apothecary-specific templates
  const apothecaryTemplates = findTemplates({ profession: 'apothecary' });
  console.log('Apothecary Templates:');
  apothecaryTemplates.forEach(t => {
    console.log(`  - ${t.id}: ${t.name}`);
  });
}

/**
 * Demo 5: Compare different eras for same template
 */
export async function demoEraComparison() {
  console.log('\n========================================');
  console.log('DEMO 5: Era Comparison (Same Template)');
  console.log('========================================\n');

  const scenarios = [
    {
      id: '1680-mexico-city',
      setting: 'Mexico City, New Spain',
      year: 1680,
      era: 'colonial'
    },
    {
      id: '1680-london',
      setting: 'London, England',
      year: 1680,
      era: 'baroque'
    },
    {
      id: '1880-london',
      setting: 'London, England',
      year: 1880,
      era: 'victorian'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📍 ${scenario.setting} (${scenario.year})`);
    console.log('─'.repeat(40));

    try {
      const map = await generateMap(
        'small-colonial-house',
        scenario,
        {
          characterProfession: 'apothecary',
          useDefaults: false
        }
      );

      console.log('Room Names:');
      map.rooms.forEach((room, i) => {
        console.log(`  ${i + 1}. ${room.name}`);
      });

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  PROCEDURAL MAP GENERATION DEMO       ║');
  console.log('╚════════════════════════════════════════╝');

  // Demo 4 (sync, no LLM needed)
  demoTemplateDiscovery();

  // Demo 2 (fast, no LLM)
  await demoDefaultLabels();

  // Demo 1 (with LLM)
  await demoBasicGeneration();

  // Demo 3 (labels only)
  await demoLabelGeneration();

  // Demo 5 (era comparison)
  await demoEraComparison();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  ALL DEMOS COMPLETE                   ║');
  console.log('╚════════════════════════════════════════╝\n');
}

// Uncomment to run demos immediately when this file is imported
// runAllDemos();

export default {
  demoBasicGeneration,
  demoDefaultLabels,
  demoLabelGeneration,
  demoTemplateDiscovery,
  demoEraComparison,
  runAllDemos
};
