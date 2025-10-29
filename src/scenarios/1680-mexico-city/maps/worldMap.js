/**
 * World Map - Simplified global travel map for 1680 scenario
 * Coordinates aligned to public/maps/worldmap.png (4426 x 2432)
 * Using equirectangular projection assumption for lat/lon to pixel mapping
 * @type {import('../../../core/types/map.types').ExteriorMapData}
 */

export default {
  id: 'world-map',
  type: 'world',
  name: 'World Map',
  style: 'world-1680',
  bounds: {
    width: 4400,
    height: 2200
  },
  backgroundImage: '/maps/worldmap.png',
  // No streets/buildings/obstacles - player can be placed anywhere within bounds
  streets: [],
  buildings: [],
  landmarks: [],
  acequias: [],
  parks: [],
  neighborhoods: [],
  startPosition: {
    // Mexico City approximate location for initial placement (19.4326°N, -99.1332°E)
    x: 923,
    y: 1228,
    gridX: Math.floor(923 / 20),
    gridY: Math.floor(1228 / 20)
  }
};
