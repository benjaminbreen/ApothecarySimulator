/**
 * Map collection for 1680 Mexico City scenario
 * @type {import('../../../core/types/map.types').MapCollection}
 */

import mexicoCityCenter from './mexicoCityCenter';
import boticaInterior from './boticaInterior';
import cathedralInterior from './cathedralInterior';
import palacioInterior from './palacioInterior';
import mercadoInterior from './mercadoInterior';
import humbleHouseInterior from './humbleHouseInterior';
import middlingHouseInterior from './middlingHouseInterior';

export default {
  exterior: {
    'mexico-city-center': mexicoCityCenter
  },
  interior: {
    'botica-interior': boticaInterior,
    'cathedral-interior': cathedralInterior,
    'palacio-interior': palacioInterior,
    'mercado-interior': mercadoInterior,
    'humble-house-interior': humbleHouseInterior,
    'middling-house-interior': middlingHouseInterior
  }
};
