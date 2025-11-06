/**
 * City Zones - Reverse Geocoding for Mexico City (1680)
 * Maps grid coordinates to historically accurate location names
 *
 * Priority Order: street > plaza > proximity > district
 * Higher priority zones override lower priority zones when overlapping
 */

/**
 * @typedef {Object} Zone
 * @property {string} id - Unique zone identifier
 * @property {string} name - Display name (historically accurate for 1680s)
 * @property {string} type - Zone type: 'street' | 'plaza' | 'proximity' | 'district'
 * @property {number} priority - Priority for overlap resolution (4=highest)
 * @property {Object} [bounds] - Rectangular bounds {x1, y1, x2, y2}
 * @property {Array<number>} [center] - Center point [x, y] for radial zones
 * @property {number} [radius] - Radius for radial zones
 * @property {Array<string>} [aliases] - Alternative names for the zone
 * @property {string} [description] - Optional context
 */

/**
 * Historical Street Names and Zones for 1680s Mexico City
 * Based on colonial-era maps and historical documents
 */
export const CITY_ZONES = [
  // ==================== STREETS (Priority: 4) ====================
  // Narrow corridors with specific historical names

  // West from Plaza Mayor to San Francisco Church
  {
    id: 'calle-san-francisco',
    name: 'Calle de San Francisco',
    type: 'street',
    priority: 4,
    bounds: { x1: 400, y1: 850, x2: 850, y2: 1050 },
    aliases: ['San Francisco street', 'Calle San Francisco'],
    description: 'Street leading west to the Franciscan church and monastery'
  },

  // North from Plaza Mayor to Santo Domingo
  {
    id: 'calle-santo-domingo',
    name: 'Calle de Santo Domingo',
    type: 'street',
    priority: 4,
    bounds: { x1: 400, y1: 150, x2: 550, y2: 650 },
    description: 'Street running north to the Dominican church'
  },

  // West from Plaza Mayor (main western thoroughfare)
  {
    id: 'calle-tacuba',
    name: 'Calle de Tacuba',
    type: 'street',
    priority: 4,
    bounds: { x1: 600, y1: 600, x2: 850, y2: 680 },
    aliases: ['Tacuba', 'Calle Tacuba', 'Tlacopan'],
    description: 'Major street running west from Plaza Mayor, oldest street in the Americas'
  },

  // East from Plaza Mayor (becomes silver district)
  {
    id: 'calle-plateros',
    name: 'Calle de Plateros',
    type: 'street',
    priority: 4,
    bounds: { x1: 1000, y1: 600, x2: 1300, y2: 680 },
    aliases: ['Plateros', 'Silversmith Street', 'Calle Plateros'],
    description: 'Silversmiths street, east of Plaza Mayor'
  },

  // South from Plaza Mayor
  {
    id: 'calle-merced',
    name: 'Calle de la Merced',
    type: 'street',
    priority: 4,
    bounds: { x1: 850, y1: 800, x2: 950, y2: 1050 },
    description: 'Street running south from Plaza Mayor'
  },

  // Near Viceregal Palace
  {
    id: 'calle-reloj',
    name: 'Calle del Reloj',
    type: 'street',
    priority: 4,
    bounds: { x1: 1000, y1: 680, x2: 1150, y2: 750 },
    description: 'Clock street, running past the Viceregal Palace'
  },

  // Southeast area (near Botica de la Amargura)
  {
    id: 'calle-amargura',
    name: 'Calle de la Amargura',
    type: 'street',
    priority: 4,
    bounds: { x1: 1250, y1: 850, x2: 1450, y2: 1000 },
    description: 'Street of bitterness, location of Maria\'s apothecary'
  },

  // Canal street (historical water channels)
  {
    id: 'acequia-real',
    name: 'Acequia Real',
    type: 'street',
    priority: 4,
    bounds: { x1: 1100, y1: 1050, x2: 1400, y2: 1250 },
    aliases: ['Royal Canal', 'Acequia', 'Canal Street'],
    description: 'Royal canal, part of the city\'s drainage system'
  },

  // Northern Spanish Quarter
  {
    id: 'calle-donceles',
    name: 'Calle de Donceles',
    type: 'street',
    priority: 4,
    bounds: { x1: 750, y1: 150, x2: 1050, y2: 250 },
    description: 'Street of young gentlemen, in the wealthy Spanish Quarter'
  },

  // Additional historically authentic streets
  {
    id: 'calle-profesa',
    name: 'Calle de la Profesa',
    type: 'street',
    priority: 4,
    bounds: { x1: 950, y1: 680, x2: 1150, y2: 760 },
    description: 'Street near the Temple of San Felipe Neri'
  },

  {
    id: 'calle-san-bernardo',
    name: 'Calle de San Bernardo',
    type: 'street',
    priority: 4,
    bounds: { x1: 300, y1: 300, x2: 500, y2: 400 },
    description: 'Major street in the northwestern quarter'
  },

  {
    id: 'calle-cadena',
    name: 'Calle de Cadena',
    type: 'street',
    priority: 4,
    bounds: { x1: 700, y1: 900, x2: 850, y2: 1000 },
    description: 'Chain street, south of Plaza Mayor'
  },

  {
    id: 'calle-zuleta',
    name: 'Calle de Zuleta',
    type: 'street',
    priority: 4,
    bounds: { x1: 550, y1: 1050, x2: 750, y2: 1150 },
    description: 'Street in the southern traza'
  },

  {
    id: 'first-street-san-francisco',
    name: 'Primera Calle de San Francisco',
    type: 'street',
    priority: 4,
    bounds: { x1: 500, y1: 900, x2: 700, y2: 980 },
    description: 'First street of San Francisco, near the monastery'
  },

  {
    id: 'calle-hospital-san-andres',
    name: 'Calle del Hospital de San Andrés',
    type: 'street',
    priority: 4,
    bounds: { x1: 200, y1: 800, x2: 400, y2: 900 },
    description: 'Street near the largest hospital in the city'
  },

  // ==================== PLAZAS (Priority: 3) ====================
  // Open squares and gathering places

  {
    id: 'plaza-mayor',
    name: 'Plaza Mayor',
    type: 'plaza',
    priority: 3,
    bounds: { x1: 700, y1: 550, x2: 1100, y2: 800 },
    aliases: ['Zócalo', 'Plaza de Armas', 'Plaza Principal', 'Main Square'],
    description: 'Central plaza, heart of colonial power and commerce'
  },

  {
    id: 'plazuela-santo-domingo',
    name: 'Plazuela de Santo Domingo',
    type: 'plaza',
    priority: 3,
    center: [450, 165],
    radius: 80,
    description: 'Small plaza in front of Santo Domingo church'
  },

  {
    id: 'plazuela-san-francisco',
    name: 'Plazuela de San Francisco',
    type: 'plaza',
    priority: 3,
    center: [450, 950],
    radius: 90,
    description: 'Plaza in front of the Franciscan church'
  },

  {
    id: 'atrio-cathedral',
    name: 'Atrio de la Catedral',
    type: 'plaza',
    priority: 3,
    bounds: { x1: 680, y1: 600, x2: 810, y2: 740 },
    description: 'Cathedral atrium, western edge of Plaza Mayor'
  },

  // Additional small plazas (plazuelas)
  {
    id: 'plazuela-san-hipolito',
    name: 'Plazuela de San Hipólito',
    type: 'plaza',
    priority: 3,
    center: [250, 950],
    radius: 70,
    description: 'Small plaza near the hospital for the mentally ill'
  },

  {
    id: 'plazuela-san-jeronimo',
    name: 'Plazuela de San Jerónimo',
    type: 'plaza',
    priority: 3,
    center: [1500, 1100],
    radius: 75,
    description: 'Plaza in front of the convent of nuns'
  },

  {
    id: 'plazuela-loreto',
    name: 'Plazuela de Loreto',
    type: 'plaza',
    priority: 3,
    center: [800, 400],
    radius: 60,
    description: 'Small plaza in the northern quarter'
  },

  // ==================== PROXIMITY ZONES (Priority: 2) ====================
  // "Near X" descriptors for areas around landmarks

  {
    id: 'near-cathedral',
    name: 'Near the Cathedral',
    type: 'proximity',
    priority: 2,
    center: [745, 670],
    radius: 120,
    description: 'Area surrounding the Metropolitan Cathedral'
  },

  {
    id: 'near-palace',
    name: 'Near the Viceregal Palace',
    type: 'proximity',
    priority: 2,
    center: [1055, 670],
    radius: 120,
    description: 'Area surrounding the palace of the Viceroy'
  },

  {
    id: 'near-hospital',
    name: 'Near Hospital de San Hipólito',
    type: 'proximity',
    priority: 2,
    center: [250, 950],
    radius: 100,
    description: 'Area near the hospital for the mentally ill'
  },

  {
    id: 'near-convent',
    name: 'Near Convento de San Jerónimo',
    type: 'proximity',
    priority: 2,
    center: [1500, 1100],
    radius: 110,
    description: 'Area near the convent of nuns'
  },

  {
    id: 'near-san-francisco',
    name: 'Near San Francisco Monastery',
    type: 'proximity',
    priority: 2,
    center: [450, 950],
    radius: 130,
    description: 'Area surrounding the large Franciscan monastery complex'
  },

  {
    id: 'near-santo-domingo',
    name: 'Near Santo Domingo Church',
    type: 'proximity',
    priority: 2,
    center: [450, 165],
    radius: 120,
    description: 'Area near the Dominican church and monastery'
  },

  {
    id: 'near-ayuntamiento',
    name: 'Near the Ayuntamiento',
    type: 'proximity',
    priority: 2,
    center: [900, 795],
    radius: 100,
    description: 'Area near the city council building'
  },

  {
    id: 'near-el-parian',
    name: 'Near El Parián Market',
    type: 'proximity',
    priority: 2,
    center: [900, 670],
    radius: 90,
    description: 'Area around the central covered market in Plaza Mayor'
  },

  // ==================== DISTRICTS (Priority: 1) ====================
  // Broad residential/commercial areas

  // Spanish Quarter - North (wealthy criollos and peninsulares)
  {
    id: 'spanish-quarter-north',
    name: 'Spanish Quarter',
    type: 'district',
    priority: 1,
    bounds: { x1: 700, y1: 50, x2: 1200, y2: 500 },
    description: 'Wealthy Spanish residences north of Plaza Mayor'
  },

  // Spanish Quarter - East
  {
    id: 'spanish-quarter-east',
    name: 'Eastern Spanish Quarter',
    type: 'district',
    priority: 1,
    bounds: { x1: 1200, y1: 300, x2: 1700, y2: 850 },
    description: 'Prosperous Spanish and criollo residences east of the plaza'
  },

  // La Traza - West (mixed Spanish/criollo colonial grid)
  {
    id: 'traza-west',
    name: 'Western Traza',
    type: 'district',
    priority: 1,
    bounds: { x1: 100, y1: 500, x2: 700, y2: 1000 },
    description: 'Mixed Spanish and criollo neighborhood, part of the colonial grid'
  },

  // La Traza - South
  {
    id: 'traza-south',
    name: 'Southern Traza',
    type: 'district',
    priority: 1,
    bounds: { x1: 500, y1: 1000, x2: 1200, y2: 1350 },
    description: 'Mixed neighborhood south of Plaza Mayor'
  },

  // Indigenous Quarter (Barrio de Santiago Tlatelolco)
  {
    id: 'barrio-santiago',
    name: 'Barrio de Santiago Tlatelolco',
    type: 'district',
    priority: 1,
    bounds: { x1: 50, y1: 100, x2: 500, y2: 600 },
    description: 'Indigenous neighborhood, one of the four main parcialidades of the indigenous city'
  },

  // Colonial Parcialidades (the four indigenous districts with Christian names)
  {
    id: 'san-juan-moyotla',
    name: 'San Juan Moyotla',
    type: 'district',
    priority: 1,
    bounds: { x1: 100, y1: 600, x2: 600, y2: 1100 },
    description: 'Southwestern indigenous parcialidad, named after San Juan'
  },

  {
    id: 'santa-maria-tlaquechiuacan',
    name: 'Santa María Tlaquechiuacan',
    type: 'district',
    priority: 1,
    bounds: { x1: 600, y1: 100, x2: 1000, y2: 500 },
    description: 'Northern indigenous parcialidad, named after Santa María'
  },

  {
    id: 'san-sebastian-atzacualco',
    name: 'San Sebastián Atzacualco',
    type: 'district',
    priority: 1,
    bounds: { x1: 1000, y1: 100, x2: 1500, y2: 550 },
    description: 'Northeastern indigenous parcialidad, named after San Sebastián'
  },

  {
    id: 'san-pedro-teopan',
    name: 'San Pedro Teopan',
    type: 'district',
    priority: 1,
    bounds: { x1: 1000, y1: 850, x2: 1600, y2: 1350 },
    description: 'Southeastern indigenous parcialidad, named after San Pedro'
  },

  // Artisan Quarter
  {
    id: 'barrio-artesanos',
    name: 'Barrio de Artesanos',
    type: 'district',
    priority: 1,
    bounds: { x1: 200, y1: 1000, x2: 600, y2: 1300 },
    description: 'Neighborhood of craftsmen and workshops'
  },

  // Merchant District (near market)
  {
    id: 'distrito-mercaderes',
    name: 'Merchant District',
    type: 'district',
    priority: 1,
    bounds: { x1: 600, y1: 750, x2: 1050, y2: 950 },
    description: 'Commercial area with shops and merchant houses'
  },

  // Canal District
  {
    id: 'barrio-acequias',
    name: 'Canal District',
    type: 'district',
    priority: 1,
    bounds: { x1: 1100, y1: 1000, x2: 1500, y2: 1350 },
    description: 'Neighborhood along the acequias (water channels)'
  }
];

/**
 * Zone type priority values
 * Higher number = higher priority when zones overlap
 */
export const ZONE_PRIORITY = {
  street: 4,
  plaza: 3,
  proximity: 2,
  district: 1
};

/**
 * Get all zones of a specific type
 * @param {string} type - Zone type
 * @returns {Array<Zone>}
 */
export function getZonesByType(type) {
  return CITY_ZONES.filter(zone => zone.type === type);
}

/**
 * Find zone by ID
 * @param {string} id - Zone ID
 * @returns {Zone|null}
 */
export function getZoneById(id) {
  return CITY_ZONES.find(zone => zone.id === id) || null;
}
