// Scenario registry
// Add new scenarios here to make them available in the game

import mexicoCity1680 from './1680-mexico-city/config';

// Future scenarios can be added here:
// import newYork1940 from './1940-new-york/config';
// import london1880 from './1880-london/config';

/**
 * Registry of all available scenarios
 * @type {Object.<string, import('../core/types/scenario.types').ScenarioConfig>}
 */
export default {
  '1680-mexico-city': mexicoCity1680,
  // Future scenarios:
  // '1940-new-york': newYork1940,
  // '1880-london': london1880
};
