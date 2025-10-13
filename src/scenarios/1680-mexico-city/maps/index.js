/**
 * Map collection for 1680 Mexico City scenario
 * @type {import('../../../core/types/map.types').MapCollection}
 */

import mexicoCityCenter from './mexicoCityCenter';
import boticaInterior from './boticaInterior';

export default {
  exterior: {
    'mexico-city-center': mexicoCityCenter
  },
  interior: {
    'botica-interior': boticaInterior
  }
};
