/**
 * World Map Location Data
 * Converts historical lat/lon coordinates into pixel positions on the world map graphic.
 *
 * Projection assumptions:
 * - The base image (public/maps/worldmap.png) is 4426 x 2432 pixels.
 * - The printed map omits the extreme polar regions and is horizontally trimmed.
 * - We therefore apply calibrated geographic bounds (lon ±170°, lat +78°/-38°)
 *   rather than a pure equirectangular transform.
 */

const MAP_WIDTH = 4426;
const MAP_HEIGHT = 2432;
const GRID_SIZE = 20;

// Calibrated geographic bounds for the 1830 world map plate
const MAP_GEO_BOUNDS = {
  lonMin: -170,
  lonMax: 170,
  latMax: 78,
  latMin: -38
};

const LON_SPAN = MAP_GEO_BOUNDS.lonMax - MAP_GEO_BOUNDS.lonMin;
const LAT_SPAN = MAP_GEO_BOUNDS.latMax - MAP_GEO_BOUNDS.latMin;

/**
 * Project latitude/longitude to pixel coordinates using equirectangular projection.
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lon - Longitude in degrees (-180 to 180)
 * @returns {{ x: number, y: number, gridX: number, gridY: number }}
 */
export function projectLatLonToPixels(lat, lon) {
  const clampedLon = Math.max(MAP_GEO_BOUNDS.lonMin, Math.min(MAP_GEO_BOUNDS.lonMax, lon));
  const clampedLat = Math.max(MAP_GEO_BOUNDS.latMin, Math.min(MAP_GEO_BOUNDS.latMax, lat));

  const normalizedLon = (clampedLon - MAP_GEO_BOUNDS.lonMin) / LON_SPAN;
  const normalizedLat = (MAP_GEO_BOUNDS.latMax - clampedLat) / LAT_SPAN;

  const x = Math.round(normalizedLon * MAP_WIDTH);
  const y = Math.round(normalizedLat * MAP_HEIGHT);

  return {
    x,
    y,
    gridX: Math.floor(x / GRID_SIZE),
    gridY: Math.floor(y / GRID_SIZE)
  };
}

const RAW_WORLD_LOCATIONS = [
  {
    id: 'mexico-city',
    name: 'Mexico City',
    fullName: 'Mexico City, New Spain',
    lat: 19.4326,
    lon: -99.1332,
    region: 'New Spain',
    importance: 'capital',
    suppressRegistry: true,
    aliases: [
      'ciudad de mexico',
      'mexico city',
      'mexico',
      'tenochtitlan',
      'capital of new spain'
    ]
  },
  {
    id: 'outskirts-mexico-city',
    name: 'Outskirts of Mexico City',
    fullName: 'Countryside Outside Mexico City',
    lat: 19.55,
    lon: -99.2,
    region: 'New Spain',
    importance: 'local',
    aliases: [
      'mexico city countryside',
      'valley of mexico outskirts',
      'rural mexico city'
    ]
  },
  {
    id: 'tlaxcala',
    name: 'Tlaxcala',
    fullName: 'Tlaxcala, New Spain',
    lat: 19.318,
    lon: -98.237,
    region: 'New Spain',
    importance: 'regional-center',
    aliases: [
      'tlaxcala de xicohtencatl',
      'city of tlaxcala'
    ]
  },
  {
    id: 'cholula',
    name: 'Cholula',
    fullName: 'San Pedro Cholula, New Spain',
    lat: 19.051,
    lon: -98.307,
    region: 'New Spain',
    importance: 'pilgrimage',
    aliases: [
      'san pedro cholula',
      'cholula de rueda'
    ]
  },
  {
    id: 'puebla',
    name: 'Puebla',
    fullName: 'Puebla de los Angeles, New Spain',
    lat: 19.0414,
    lon: -98.2063,
    region: 'New Spain',
    importance: 'regional-center',
    aliases: [
      'puebla de los angeles',
      'city of puebla',
      'angelopolis'
    ]
  },
  {
    id: 'veracruz',
    name: 'Veracruz',
    fullName: 'Veracruz, New Spain',
    lat: 19.1738,
    lon: -96.1342,
    region: 'New Spain',
    importance: 'port',
    aliases: [
      'puerto de veracruz',
      'vera cruz',
      'port of veracruz'
    ]
  },
  {
    id: 'xalapa',
    name: 'Xalapa',
    fullName: 'Xalapa, New Spain',
    lat: 19.5438,
    lon: -96.9103,
    region: 'New Spain',
    importance: 'provincial',
    aliases: [
      'jalapa',
      'xalapa de enriquez'
    ]
  },
  {
    id: 'cuernavaca',
    name: 'Cuernavaca',
    fullName: 'Cuernavaca, New Spain',
    lat: 18.9242,
    lon: -99.2216,
    region: 'New Spain',
    importance: 'resort',
    aliases: [
      'cuauhnahuac',
      'city of cuernavaca'
    ]
  },
  {
    id: 'taxco',
    name: 'Taxco',
    fullName: 'Taxco de Alarcón, New Spain',
    lat: 18.556,
    lon: -99.605,
    region: 'New Spain',
    importance: 'mining',
    aliases: [
      'taxco de alarcon',
      'silver town taxco'
    ]
  },
  {
    id: 'acapulco',
    name: 'Acapulco',
    fullName: 'Acapulco, New Spain',
    lat: 16.8638,
    lon: -99.8823,
    region: 'New Spain',
    importance: 'port',
    aliases: [
      'puerto de acapulco',
      'port of acapulco'
    ]
  },
  {
    id: 'oaxaca',
    name: 'Oaxaca',
    fullName: 'Oaxaca, New Spain',
    lat: 17.0732,
    lon: -96.7266,
    region: 'New Spain',
    importance: 'regional-center',
    aliases: [
      'oaxaca city',
      'antequera',
      'santo domingo de guzman',
      'city of oaxaca'
    ]
  },
  {
    id: 'tehuantepec',
    name: 'Tehuantepec',
    fullName: 'Santo Domingo Tehuantepec, New Spain',
    lat: 16.321,
    lon: -95.241,
    region: 'New Spain',
    importance: 'trade-hub',
    aliases: [
      'santo domingo tehuantepec',
      'istmo de tehuantepec'
    ]
  },
  {
    id: 'queretaro',
    name: 'Querétaro',
    fullName: 'Santiago de Querétaro, New Spain',
    lat: 20.5888,
    lon: -100.3899,
    region: 'New Spain',
    importance: 'regional-center',
    aliases: [
      'santiago de queretaro',
      'city of queretaro'
    ]
  },
  {
    id: 'san-miguel-el-grande',
    name: 'San Miguel el Grande',
    fullName: 'San Miguel el Grande, New Spain',
    lat: 20.9144,
    lon: -100.743,
    region: 'New Spain',
    importance: 'market-town',
    aliases: [
      'san miguel el grande',
      'san miguel de allende'
    ]
  },
  {
    id: 'guanajuato',
    name: 'Guanajuato',
    fullName: 'Guanajuato, New Spain',
    lat: 21.019,
    lon: -101.257,
    region: 'New Spain',
    importance: 'mining',
    aliases: [
      'city of guanajuato',
      'guanajuato mines'
    ]
  },
  {
    id: 'morelia',
    name: 'Morelia',
    fullName: 'Valladolid de Michoacán, New Spain',
    lat: 19.705,
    lon: -101.194,
    region: 'New Spain',
    importance: 'regional-center',
    aliases: [
      'valladolid de michoacan',
      'city of morelia'
    ]
  },
  {
    id: 'guadalajara',
    name: 'Guadalajara',
    fullName: 'Guadalajara, New Spain',
    lat: 20.6597,
    lon: -103.3496,
    region: 'New Spain',
    importance: 'regional-center',
    aliases: [
      'city of guadalajara',
      'guadalajara de indias',
      'guadalajara de jalisco'
    ]
  },
  {
    id: 'zacatecas',
    name: 'Zacatecas',
    fullName: 'Real de Minas de Zacatecas, New Spain',
    lat: 22.7709,
    lon: -102.5832,
    region: 'New Spain',
    importance: 'mining',
    aliases: [
      'real de minas de zacatecas',
      'city of zacatecas'
    ]
  },
  {
    id: 'san-luis-potosi',
    name: 'San Luis Potosí',
    fullName: 'San Luis Potosí, New Spain',
    lat: 22.1565,
    lon: -100.9855,
    region: 'New Spain',
    importance: 'mining',
    aliases: [
      'san luis potosi',
      'city of san luis potosi'
    ]
  },
  {
    id: 'durango',
    name: 'Durango',
    fullName: 'Durango, New Spain',
    lat: 24.0277,
    lon: -104.6532,
    region: 'New Spain',
    importance: 'frontier',
    aliases: [
      'villa durango',
      'nueva vizcaya capital'
    ]
  },
  {
    id: 'chihuahua',
    name: 'Chihuahua',
    fullName: 'San Felipe el Real de Chihuahua, New Spain',
    lat: 28.6353,
    lon: -106.0889,
    region: 'New Spain',
    importance: 'frontier',
    aliases: [
      'san felipe el real',
      'villa de chihuahua'
    ]
  },
  {
    id: 'santa-fe',
    name: 'Santa Fe',
    fullName: 'Santa Fe de Nuevo México',
    lat: 35.6869,
    lon: -105.9378,
    region: 'New Spain',
    importance: 'provincial-capital',
    aliases: [
      'santa fe de nuevo mexico',
      'villa de santa fe'
    ]
  },
  {
    id: 'el-paso-del-norte',
    name: 'El Paso del Norte',
    fullName: 'El Paso del Norte, New Spain',
    lat: 31.7619,
    lon: -106.485,
    region: 'New Spain',
    importance: 'frontier',
    aliases: [
      'el paso del norte',
      'pass of the north'
    ]
  },
  {
    id: 'monterrey',
    name: 'Monterrey',
    fullName: 'Ciudad de Monterrey, New Spain',
    lat: 25.6866,
    lon: -100.3161,
    region: 'New Spain',
    importance: 'regional-center',
    aliases: [
      'ciudad de monterrey',
      'monterrey city'
    ]
  },
  {
    id: 'texas-frontier',
    name: 'Texas Frontier',
    fullName: 'Northern Frontier of New Spain',
    lat: 31.5,
    lon: -100.5,
    region: 'New Spain',
    importance: 'frontier',
    aliases: [
      'frontier of texas',
      'northern frontier',
      'northern frontier of new spain'
    ]
  },
  {
    id: 'tampico',
    name: 'Tampico',
    fullName: 'Tampico, New Spain',
    lat: 22.2553,
    lon: -97.868,
    region: 'New Spain',
    importance: 'port',
    aliases: [
      'puerto de tampico',
      'port of tampico'
    ]
  },
  {
    id: 'campeche',
    name: 'Campeche',
    fullName: 'San Francisco de Campeche, New Spain',
    lat: 19.8301,
    lon: -90.5349,
    region: 'New Spain',
    importance: 'port',
    aliases: [
      'san francisco de campeche',
      'port of campeche'
    ]
  },
  {
    id: 'merida',
    name: 'Mérida',
    fullName: 'Mérida de Yucatán, New Spain',
    lat: 20.967,
    lon: -89.623,
    region: 'New Spain',
    importance: 'provincial-capital',
    aliases: [
      'merida de yucatan',
      'city of merida'
    ]
  },
  {
    id: 'valladolid-yucatan',
    name: 'Valladolid, Yucatán',
    fullName: 'Valladolid, Yucatán, New Spain',
    lat: 20.689,
    lon: -88.201,
    region: 'New Spain',
    importance: 'market-town',
    aliases: [
      'valladolid yucatan',
      'zaci'
    ]
  },
  {
    id: 'cozumel',
    name: 'Cozumel',
    fullName: 'Isla de Cozumel, New Spain',
    lat: 20.422,
    lon: -86.922,
    region: 'New Spain',
    importance: 'island',
    aliases: [
      'isla de cozumel',
      'cozumel island'
    ]
  },
  {
    id: 'guatemala-city',
    name: 'Guatemala City',
    fullName: 'Santiago de los Caballeros de Guatemala',
    lat: 14.6349,
    lon: -90.5069,
    region: 'Central America',
    importance: 'capital',
    aliases: [
      'santiago de los caballeros',
      'city of guatemala'
    ]
  },
  {
    id: 'panama-city',
    name: 'Panama City',
    fullName: 'Panama City, Tierra Firme',
    lat: 8.9833,
    lon: -79.5167,
    region: 'Central America',
    importance: 'port',
    aliases: [
      'ciudad de panama',
      'panama vieja',
      'panama la vieja'
    ]
  },
  {
    id: 'portobelo',
    name: 'Portobelo',
    fullName: 'Portobelo, Tierra Firme',
    lat: 9.5536,
    lon: -79.6545,
    region: 'Central America',
    importance: 'port',
    aliases: [
      'puerto bello',
      'port of portobelo'
    ]
  },
  {
    id: 'cartagena',
    name: 'Cartagena',
    fullName: 'Cartagena de Indias, New Granada',
    lat: 10.391,
    lon: -75.479,
    region: 'Caribbean',
    importance: 'port',
    aliases: [
      'cartagena de indias',
      'port of cartagena'
    ]
  },
  {
    id: 'caracas',
    name: 'Caracas',
    fullName: 'Santiago de León de Caracas',
    lat: 10.4806,
    lon: -66.9036,
    region: 'Caribbean',
    importance: 'provincial-capital',
    aliases: [
      'santiago de leon',
      'city of caracas'
    ]
  },
  {
    id: 'bogota',
    name: 'Bogotá',
    fullName: 'Santa Fe de Bogotá, New Granada',
    lat: 4.711,
    lon: -74.072,
    region: 'South America',
    importance: 'capital',
    aliases: [
      'santa fe de bogota',
      'bogota city'
    ]
  },
  {
    id: 'quito',
    name: 'Quito',
    fullName: 'San Francisco de Quito, Peru',
    lat: -0.1807,
    lon: -78.4678,
    region: 'South America',
    importance: 'provincial-capital',
    aliases: [
      'san francisco de quito',
      'city of quito'
    ]
  },
  {
    id: 'lima',
    name: 'Lima',
    fullName: 'Ciudad de los Reyes (Lima), Peru',
    lat: -12.0464,
    lon: -77.0428,
    region: 'South America',
    importance: 'capital',
    aliases: [
      'ciudad de los reyes',
      'lima city'
    ]
  },
  {
    id: 'cusco',
    name: 'Cusco',
    fullName: 'Cuzco, Peru',
    lat: -13.532,
    lon: -71.967,
    region: 'South America',
    importance: 'highland-center',
    aliases: [
      'cuzco',
      'city of cusco'
    ]
  },
  {
    id: 'potosi',
    name: 'Potosí',
    fullName: 'Villa Imperial de Potosí',
    lat: -19.588,
    lon: -65.753,
    region: 'South America',
    importance: 'mining',
    aliases: [
      'villa imperial de potosi',
      'cerro rico'
    ]
  },
  {
    id: 'la-paz',
    name: 'La Paz',
    fullName: 'Nuestra Señora de La Paz, Upper Peru',
    lat: -16.5,
    lon: -68.15,
    region: 'South America',
    importance: 'provincial-capital',
    aliases: [
      'nuestra senora de la paz',
      'city of la paz'
    ]
  },
  {
    id: 'asuncion',
    name: 'Asunción',
    fullName: 'Asunción, Province of Paraguay',
    lat: -25.2637,
    lon: -57.5759,
    region: 'South America',
    importance: 'capital',
    aliases: [
      'asuncion del paraguay',
      'city of asuncion'
    ]
  },
  {
    id: 'santiago-de-chile',
    name: 'Santiago de Chile',
    fullName: 'Santiago de Chile, Captaincy General of Chile',
    lat: -33.4489,
    lon: -70.6693,
    region: 'South America',
    importance: 'capital',
    aliases: [
      'santiago de chile',
      'city of santiago'
    ]
  },
  {
    id: 'valparaiso',
    name: 'Valparaíso',
    fullName: 'Valparaíso, Captaincy General of Chile',
    lat: -33.0472,
    lon: -71.6127,
    region: 'South America',
    importance: 'port',
    aliases: [
      'port of valparaiso',
      'puerto de valparaiso'
    ]
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    fullName: 'Buenos Aires, Rio de la Plata',
    lat: -34.6037,
    lon: -58.3816,
    region: 'South America',
    importance: 'port',
    aliases: [
      'buenos aires city',
      'ciudad de buenos aires'
    ]
  },
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    fullName: 'Cidade de São Sebastião do Rio de Janeiro',
    lat: -22.9068,
    lon: -43.1729,
    region: 'South America',
    importance: 'port',
    aliases: [
      'rio de janeiro city',
      'sao sebastiao do rio de janeiro'
    ]
  },
  {
    id: 'salvador-da-bahia',
    name: 'Salvador da Bahia',
    fullName: 'Salvador da Bahia, State of Brazil',
    lat: -12.9777,
    lon: -38.5016,
    region: 'South America',
    importance: 'capital',
    aliases: [
      'salvador da bahia',
      'salvador de bahia',
      'bahia city'
    ]
  },
  {
    id: 'recife',
    name: 'Recife',
    fullName: 'Recife, State of Brazil',
    lat: -8.0476,
    lon: -34.877,
    region: 'South America',
    importance: 'port',
    aliases: [
      'pernambuco',
      'port of recife'
    ]
  },
  {
    id: 'havana',
    name: 'Havana',
    fullName: 'San Cristóbal de La Habana',
    lat: 23.1136,
    lon: -82.3666,
    region: 'Caribbean',
    importance: 'port',
    aliases: [
      'san cristobal de la habana',
      'la habana',
      'havana harbor'
    ]
  },
  {
    id: 'port-royal',
    name: 'Port Royal',
    fullName: 'Port Royal, Jamaica',
    lat: 17.937,
    lon: -76.84,
    region: 'Caribbean',
    importance: 'port',
    aliases: [
      'port royal jamaica',
      'port of port royal'
    ]
  },
  {
    id: 'santo-domingo',
    name: 'Santo Domingo',
    fullName: 'Santo Domingo, Hispaniola',
    lat: 18.4861,
    lon: -69.9312,
    region: 'Caribbean',
    importance: 'capital',
    aliases: [
      'santo domingo de guzman',
      'city of santo domingo'
    ]
  },
  {
    id: 'san-juan',
    name: 'San Juan',
    fullName: 'San Juan de Puerto Rico',
    lat: 18.4655,
    lon: -66.1057,
    region: 'Caribbean',
    importance: 'port',
    aliases: [
      'san juan puerto rico',
      'port of san juan'
    ]
  },
  {
    id: 'bridgetown',
    name: 'Bridgetown',
    fullName: 'Bridgetown, Barbados',
    lat: 13.0975,
    lon: -59.616,
    region: 'Caribbean',
    importance: 'port',
    aliases: [
      'bridgetown barbados',
      'port of bridgetown'
    ]
  },
  {
    id: 'mid-atlantic',
    name: 'Mid-Atlantic',
    fullName: 'Mid-Atlantic Ocean Crossing',
    lat: 20,
    lon: -40,
    region: 'Atlantic',
    importance: 'open-sea',
    aliases: [
      'mid atlantic',
      'atlantic crossing',
      'open atlantic'
    ]
  },
  {
    id: 'azores',
    name: 'Azores',
    fullName: 'Angra do Heroísmo, Azores',
    lat: 38.65,
    lon: -27.22,
    region: 'Atlantic',
    importance: 'resupply',
    aliases: [
      'angra do heroismo',
      'ilha terceira',
      'azores islands'
    ]
  },
  {
    id: 'madeira',
    name: 'Madeira',
    fullName: 'Funchal, Madeira Islands',
    lat: 32.666,
    lon: -16.925,
    region: 'Atlantic',
    importance: 'resupply',
    aliases: [
      'funchal',
      'madeira island'
    ]
  },
  {
    id: 'canary-islands',
    name: 'Canary Islands',
    fullName: 'Santa Cruz de Tenerife, Canary Islands',
    lat: 28.4636,
    lon: -16.2518,
    region: 'Atlantic',
    importance: 'resupply',
    aliases: [
      'santa cruz de tenerife',
      'islas canarias',
      'canary islands'
    ]
  },
  {
    id: 'cape-verde',
    name: 'Cape Verde',
    fullName: 'Cidade Velha, Cape Verde',
    lat: 14.909,
    lon: -23.521,
    region: 'Atlantic',
    importance: 'resupply',
    aliases: [
      'ilha de santiago',
      'cidade velha',
      'cape verde islands'
    ]
  },
  {
    id: 'dakar-goree',
    name: 'Dakar (Gorée)',
    fullName: 'Île de Gorée, Coast of Senegal',
    lat: 14.667,
    lon: -17.4,
    region: 'West Africa',
    importance: 'port',
    aliases: [
      'goree island',
      'ile de goree',
      'dakar roadstead'
    ]
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    fullName: 'Cape of Good Hope, Dutch Cape Colony',
    lat: -33.9249,
    lon: 18.4241,
    region: 'Southern Africa',
    importance: 'resupply',
    aliases: [
      'cape of good hope',
      'table bay',
      'cape town harbor'
    ]
  },
  {
    id: 'seville',
    name: 'Seville',
    fullName: 'Seville, Crown of Castile',
    lat: 37.3891,
    lon: -5.9845,
    region: 'Europe',
    importance: 'metropolis',
    aliases: [
      'sevilla',
      'city of seville'
    ]
  },
  {
    id: 'cadiz',
    name: 'Cadiz',
    fullName: 'Cádiz, Crown of Castile',
    lat: 36.5271,
    lon: -6.2886,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'cadiz port',
      'puerto de cadiz'
    ]
  },
  {
    id: 'madrid',
    name: 'Madrid',
    fullName: 'Madrid, Crown of Castile',
    lat: 40.4168,
    lon: -3.7038,
    region: 'Europe',
    importance: 'capital',
    aliases: [
      'villa de madrid',
      'city of madrid'
    ]
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    fullName: 'Lisbon, Kingdom of Portugal',
    lat: 38.7223,
    lon: -9.1393,
    region: 'Europe',
    importance: 'capital',
    aliases: [
      'lisboa',
      'city of lisbon'
    ]
  },
  {
    id: 'porto',
    name: 'Porto',
    fullName: 'Porto, Kingdom of Portugal',
    lat: 41.1579,
    lon: -8.6291,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'oporto',
      'porto city'
    ]
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    fullName: 'Barcelona, Crown of Aragon',
    lat: 41.3851,
    lon: 2.1734,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'barcelona city',
      'ciutat de barcelona'
    ]
  },
  {
    id: 'paris',
    name: 'Paris',
    fullName: 'Paris, Kingdom of France',
    lat: 48.8566,
    lon: 2.3522,
    region: 'Europe',
    importance: 'metropolis',
    aliases: [
      'paris city',
      'ville de paris'
    ]
  },
  {
    id: 'london',
    name: 'London',
    fullName: 'London, Kingdom of England',
    lat: 51.5072,
    lon: -0.1276,
    region: 'Europe',
    importance: 'metropolis',
    aliases: [
      'london city',
      'city of london'
    ]
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    fullName: 'Amsterdam, Dutch Republic',
    lat: 52.3676,
    lon: 4.9041,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'amsterdam city',
      'amstel dam'
    ]
  },
  {
    id: 'antwerp',
    name: 'Antwerp',
    fullName: 'Antwerp, Spanish Netherlands',
    lat: 51.2194,
    lon: 4.4025,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'antwerpen',
      'antwerp city'
    ]
  },
  {
    id: 'genoa',
    name: 'Genoa',
    fullName: 'Genoa, Republic of Genoa',
    lat: 44.4056,
    lon: 8.9463,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'genova',
      'genoa city'
    ]
  },
  {
    id: 'venice',
    name: 'Venice',
    fullName: 'Venice, Most Serene Republic',
    lat: 45.4408,
    lon: 12.3155,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'venezia',
      'serenissima'
    ]
  },
  {
    id: 'naples',
    name: 'Naples',
    fullName: 'Naples, Kingdom of Naples',
    lat: 40.8518,
    lon: 14.2681,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'napoli',
      'city of naples'
    ]
  },
  {
    id: 'rome',
    name: 'Rome',
    fullName: 'Rome, Papal States',
    lat: 41.9028,
    lon: 12.4964,
    region: 'Europe',
    importance: 'metropolis',
    aliases: [
      'roma',
      'city of rome'
    ]
  },
  {
    id: 'marseille',
    name: 'Marseille',
    fullName: 'Marseille, Kingdom of France',
    lat: 43.2965,
    lon: 5.3698,
    region: 'Europe',
    importance: 'port',
    aliases: [
      'marseille port',
      'marseilles'
    ]
  },
  {
    id: 'marrakesh',
    name: 'Marrakesh',
    fullName: 'Marrakesh, Saadi Sultanate',
    lat: 31.6295,
    lon: -7.9811,
    region: 'North Africa',
    importance: 'regional-center',
    aliases: [
      'marrakech',
      'city of marrakesh'
    ]
  },
  {
    id: 'tunis',
    name: 'Tunis',
    fullName: 'Tunis, Regency of Tunis',
    lat: 36.8065,
    lon: 10.1815,
    region: 'North Africa',
    importance: 'port',
    aliases: [
      'tunis city',
      'regency of tunis'
    ]
  },
  {
    id: 'algiers',
    name: 'Algiers',
    fullName: 'Algiers, Regency of Algiers',
    lat: 36.7538,
    lon: 3.0588,
    region: 'North Africa',
    importance: 'port',
    aliases: [
      'algiers port',
      'alger la blanche'
    ]
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    fullName: 'Alexandria, Ottoman Egypt',
    lat: 31.2001,
    lon: 29.9187,
    region: 'North Africa',
    importance: 'port',
    aliases: [
      'alexandria egypt',
      'port of alexandria'
    ]
  },
  {
    id: 'lagos',
    name: 'Lagos',
    fullName: 'Lagos, Bight of Benin',
    lat: 6.5244,
    lon: 3.3792,
    region: 'West Africa',
    importance: 'trade-hub',
    aliases: [
      'lagos lagoon',
      'eko settlement'
    ]
  },
  {
    id: 'elmina',
    name: 'Elmina',
    fullName: 'Elmina Castle, Gold Coast',
    lat: 5.0826,
    lon: -1.3509,
    region: 'West Africa',
    importance: 'fort',
    aliases: [
      'sao jorge da mina',
      'elmina castle'
    ]
  },
  {
    id: 'luanda',
    name: 'Luanda',
    fullName: 'São Paulo de Luanda, Angola',
    lat: -8.839,
    lon: 13.2894,
    region: 'West Africa',
    importance: 'port',
    aliases: [
      'sao paulo de luanda',
      'luanda port'
    ]
  },
  {
    id: 'goa',
    name: 'Goa',
    fullName: 'Goa, Estado da Índia',
    lat: 15.2993,
    lon: 74.124,
    region: 'South Asia',
    importance: 'capital',
    aliases: [
      'velha goa',
      'city of goa'
    ]
  },
  {
    id: 'surat',
    name: 'Surat',
    fullName: 'Surat, Mughal India',
    lat: 21.1702,
    lon: 72.8311,
    region: 'South Asia',
    importance: 'port',
    aliases: [
      'city of surat',
      'surat port'
    ]
  },
  {
    id: 'madras',
    name: 'Madras',
    fullName: 'Fort St. George (Madras), Coromandel Coast',
    lat: 13.0827,
    lon: 80.2707,
    region: 'South Asia',
    importance: 'port',
    aliases: [
      'madraspatnam',
      'fort st george',
      'chennai'
    ]
  },
  {
    id: 'bombay',
    name: 'Bombay',
    fullName: 'Bombay Islands, Maratha Coast',
    lat: 19.076,
    lon: 72.8777,
    region: 'South Asia',
    importance: 'port',
    aliases: [
      'bombay islands',
      'bom baim'
    ]
  },
  {
    id: 'colombo',
    name: 'Colombo',
    fullName: 'Colombo, Ceylon',
    lat: 6.9271,
    lon: 79.8612,
    region: 'South Asia',
    importance: 'port',
    aliases: [
      'colombo ceylon',
      'kolamba'
    ]
  },
  {
    id: 'muscat',
    name: 'Muscat',
    fullName: 'Muscat, Oman',
    lat: 23.588,
    lon: 58.3829,
    region: 'Indian Ocean',
    importance: 'port',
    aliases: [
      'masqat',
      'port of muscat'
    ]
  },
  {
    id: 'mocha',
    name: 'Mocha',
    fullName: 'Mocha, Yemen',
    lat: 13.3167,
    lon: 43.2456,
    region: 'Red Sea',
    importance: 'port',
    aliases: [
      'mokka',
      'mocha yemen',
      'port of mocha'
    ]
  },
  {
    id: 'mid-pacific',
    name: 'Mid-Pacific',
    fullName: 'Mid-Pacific Ocean Crossing',
    lat: 18,
    lon: -140,
    region: 'Pacific',
    importance: 'open-sea',
    aliases: [
      'mid pacific',
      'pacific crossing',
      'open pacific'
    ]
  },
  {
    id: 'manila',
    name: 'Manila',
    fullName: 'Manila, Philippines',
    lat: 14.5995,
    lon: 120.9842,
    region: 'Southeast Asia',
    importance: 'capital',
    aliases: [
      'manila city',
      'intramuros'
    ]
  },
  {
    id: 'guam',
    name: 'Guam',
    fullName: 'San Ignacio de Agaña, Mariana Islands',
    lat: 13.4443,
    lon: 144.7937,
    region: 'Pacific',
    importance: 'island',
    aliases: [
      'san ignacio de agana',
      'mariana islands',
      'guam island'
    ]
  },
  {
    id: 'macau',
    name: 'Macau',
    fullName: 'Macau, Estado da Índia',
    lat: 22.1987,
    lon: 113.5439,
    region: 'East Asia',
    importance: 'port',
    aliases: [
      'macao',
      'porto de macau'
    ]
  },
  {
    id: 'canton',
    name: 'Canton',
    fullName: 'Guangzhou (Canton), Qing Empire',
    lat: 23.1291,
    lon: 113.2644,
    region: 'East Asia',
    importance: 'port',
    aliases: [
      'guangzhou',
      'city of canton'
    ]
  },
  {
    id: 'nagasaki',
    name: 'Nagasaki',
    fullName: 'Nagasaki, Tokugawa Japan',
    lat: 32.7503,
    lon: 129.8777,
    region: 'East Asia',
    importance: 'port',
    aliases: [
      'nagasaki port',
      'dejima'
    ]
  },
  {
    id: 'edo',
    name: 'Edo',
    fullName: 'Edo, Tokugawa Japan',
    lat: 35.6762,
    lon: 139.6503,
    region: 'East Asia',
    importance: 'capital',
    aliases: [
      'edo city',
      'tokyo'
    ]
  },
  {
    id: 'beijing',
    name: 'Beijing',
    fullName: 'Beijing, Qing Empire',
    lat: 39.9042,
    lon: 116.4074,
    region: 'East Asia',
    importance: 'capital',
    aliases: [
      'peking',
      'capital of the qing'
    ]
  },
  {
    id: 'ayutthaya',
    name: 'Ayutthaya',
    fullName: 'Ayutthaya, Kingdom of Siam',
    lat: 14.3532,
    lon: 100.568,
    region: 'Southeast Asia',
    importance: 'capital',
    aliases: [
      'ayutaya',
      'siam capital'
    ]
  },
  {
    id: 'batavia',
    name: 'Batavia',
    fullName: 'Batavia, Dutch East Indies',
    lat: -6.2088,
    lon: 106.8456,
    region: 'Southeast Asia',
    importance: 'colonial-capital',
    aliases: [
      'batavia java',
      'jakarta',
      'jayakarta'
    ]
  },
  {
    id: 'malacca',
    name: 'Malacca',
    fullName: 'Malacca, Malay Peninsula',
    lat: 2.1896,
    lon: 102.2501,
    region: 'Southeast Asia',
    importance: 'port',
    aliases: [
      'melaka',
      'malacca port'
    ]
  }
];

export const WORLD_LOCATIONS = RAW_WORLD_LOCATIONS.map((location) => {
  const projected = projectLatLonToPixels(location.lat, location.lon);
  return {
    ...location,
    mapId: 'world-map',
    type: 'world-city',
    position: {
      x: projected.x,
      y: projected.y
    },
    gridX: projected.gridX,
    gridY: projected.gridY,
    aliases: location.aliases?.map(alias => alias.toLowerCase()) || []
  };
});

export const WORLD_LOCATION_LOOKUP = WORLD_LOCATIONS.reduce((lookup, location) => {
  lookup[location.id] = location;
  return lookup;
}, {});

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => degrees * (Math.PI / 180);

/**
 * Convert pixel coordinates back into latitude/longitude.
 * @param {number} x - Pixel X coordinate on the world map
 * @param {number} y - Pixel Y coordinate on the world map
 * @returns {{ lat: number, lon: number }}
 */
export function projectPixelsToLatLon(x, y) {
  const normalizedLon = x / MAP_WIDTH;
  const normalizedLat = y / MAP_HEIGHT;

  const lon = MAP_GEO_BOUNDS.lonMin + normalizedLon * LON_SPAN;
  const lat = MAP_GEO_BOUNDS.latMax - normalizedLat * LAT_SPAN;
  return { lat, lon };
}

/**
 * Calculate great-circle distance between two lat/lon coordinates (Haversine formula).
 * Returns distance in kilometers.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number'
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Find the nearest world location to a given lat/lon pair.
 * @param {number} lat
 * @param {number} lon
 * @param {Object} [options]
 * @param {string[]} [options.excludeIds]
 * @returns {Object|null}
 */
export function getNearestWorldLocation(lat, lon, options = {}) {
  const { excludeIds = [] } = options;

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return WORLD_LOCATION_LOOKUP['mexico-city'] || null;
  }

  return WORLD_LOCATIONS
    .filter(loc => !loc.suppressRegistry && !excludeIds.includes(loc.id))
    .map(loc => ({
      ...loc,
      distanceKm: calculateDistanceKm(lat, lon, loc.lat, loc.lon)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0] || null;
}

/**
 * Get closest world destinations to an origin.
 * @param {Object} params
 * @param {string|null} [params.originId]
 * @param {number|null} [params.originLat]
 * @param {number|null} [params.originLon]
 * @param {number} [params.maxResults=10]
 * @param {string[]} [params.excludeIds=[]]
 * @param {string[]|null} [params.regionFilter=null]
 * @returns {Array<Object>} Sorted destinations with distanceKm
 */
export function getClosestWorldLocations({
  originId = null,
  originLat = null,
  originLon = null,
  maxResults = 10,
  excludeIds = [],
  regionFilter = null
} = {}) {
  let baseLat = originLat;
  let baseLon = originLon;

  if (originId && WORLD_LOCATION_LOOKUP[originId]) {
    baseLat = WORLD_LOCATION_LOOKUP[originId].lat;
    baseLon = WORLD_LOCATION_LOOKUP[originId].lon;
  }

  if (typeof baseLat !== 'number' || typeof baseLon !== 'number') {
    const fallback = WORLD_LOCATION_LOOKUP['mexico-city'];
    baseLat = fallback?.lat ?? 19.4326;
    baseLon = fallback?.lon ?? -99.1332;
  }

  const candidates = WORLD_LOCATIONS
    .filter(loc => !loc.suppressRegistry && !excludeIds.includes(loc.id))
    .filter(loc => {
      if (!regionFilter || regionFilter.length === 0) return true;
      return regionFilter.includes(loc.region);
    })
    .map(loc => ({
      ...loc,
      distanceKm: calculateDistanceKm(baseLat, baseLon, loc.lat, loc.lon)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return candidates.slice(0, Math.max(0, maxResults));
}

export const WORLD_MAP_DIMENSIONS = {
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  gridSize: GRID_SIZE
};

/**
 * Attempt to find a world location by a search string.
 * @param {string} search
 * @returns {typeof WORLD_LOCATIONS[number] | null}
 */
export function findWorldLocation(search) {
  if (!search) return null;
  const normalized = search.toLowerCase().trim();

  // Exact name or fullName
  let match = WORLD_LOCATIONS.find(loc =>
    loc.name.toLowerCase() === normalized ||
    loc.fullName.toLowerCase() === normalized
  );
  if (match) return match;

  // Alias includes search
  match = WORLD_LOCATIONS.find(loc =>
    loc.aliases.some(alias => alias === normalized || normalized.includes(alias) || alias.includes(normalized))
  );
  if (match) return match;

  // Partial match on name/fullName
  match = WORLD_LOCATIONS.find(loc =>
    loc.name.toLowerCase().includes(normalized) ||
    normalized.includes(loc.name.toLowerCase())
  );
  if (match) return match;

  return null;
}

/**
 * List world locations in a user-friendly string.
 * Useful for prompts or debugging.
 * @returns {string}
 */
export function formatWorldLocations() {
  return WORLD_LOCATIONS
    .map(loc => `${loc.fullName} (${loc.region})`)
    .join(', ');
}
