/**
 * Exterior map: Mexico City Center (1680)
 * COMPLETE REBUILD - Proper street grid with no overlaps
 *
 * SCALE: 1.5 pixels per meter (1:0.67 scale)
 * COVERAGE: ~1.2km x 900m of colonial city center
 * PHILOSOPHY: Continuous street grid defines blocks, buildings sit within blocks
 *
 * @type {import('../../../core/types/map.types').ExteriorMapData}
 */
export default {
  id: 'mexico-city-center',
  type: 'exterior',
  name: 'Mexico City Center',
  style: 'colonial-spanish-geographic',
  bounds: {
    width: 1800,
    height: 1350
  },

  // STREET GRID - Continuous orthogonal network
  // Major N-S streets span full height, E-W streets span full width
  streets: [
    // ===== MAJOR NORTH-SOUTH STREETS (continuous, 0 to 1350) =====
    {
      id: 'calle-san-jose-real',
      name: 'Calle de San José el Real',
      points: [[150, 0], [150, 1350]],
      width: 20,
      type: 'main',
      paved: true,
      labelPosition: [150, 1100],
      labelOffset: [-65, 0],
      labelRotation: -90,
      priority: 4,
      description: 'North-south artery west of Plaza Mayor referenced in Trasmonte’s 1628 plan'
    },
    {
      id: 'calle-santo-domingo',
      name: 'Calle Santo Domingo',
      points: [[350, 0], [350, 1350]],
      width: 18,
      type: 'main',
      paved: true,
      labelPosition: [350, 250],
      labelOffset: [-60, 0],
      labelRotation: -90,
      priority: 4
    },
    {
      id: 'calle-santa-teresa',
      name: 'Calle de Santa Teresa la Antigua',
      points: [[550, 0], [550, 1350]],
      width: 18,
      type: 'main',
      paved: true,
      labelPosition: [550, 1100],
      labelOffset: [55, 0],
      labelRotation: -90,
      priority: 5,
      description: 'North-south street serving the convent complex west of the cathedral'
    },
    {
      id: 'calle-la-palma',
      name: 'Calle de la Palma',
      points: [[720, 0], [720, 1350]],
      width: 20,
      type: 'main',
      paved: true,
      labelPosition: [720, 400],
      labelOffset: [-60, 0],
      labelRotation: -90,
      priority: 3,
      description: 'Processional route along the west edge of Plaza Mayor'
    },
    {
      id: 'calle-jesus-maria',
      name: 'Calle de Jesús María',
      points: [[1080, 0], [1080, 1350]],
      width: 18,
      type: 'main',
      paved: true,
      labelPosition: [1080, 400],
      labelOffset: [55, 0],
      labelRotation: -90,
      priority: 3,
      description: 'Major north-south street linking Plaza Mayor to the eastern barrios'
    },
    {
      id: 'calle-palacio',
      name: 'Calle de la Moneda',
      points: [[1280, 0], [1280, 1350]],
      width: 16,
      type: 'secondary',
      paved: true,
      labelPosition: [1280, 200],
      labelOffset: [50, 0],
      labelRotation: -90,
      priority: 6
    },
    {
      id: 'calle-jesus',
      name: 'Calle de Jesús',
      points: [[1480, 0], [1480, 1350]],
      width: 16,
      type: 'secondary',
      paved: false,
      labelPosition: [1480, 700],
      labelOffset: [50, 0],
      labelRotation: -90,
      priority: 6
    },

    // ===== MAJOR EAST-WEST STREETS (continuous, 0 to 1800) =====
    {
      id: 'calle-norte',
      name: 'Calle del Norte',
      points: [[0, 100], [1800, 100]],
      width: 16,
      type: 'secondary',
      paved: true,
      labelPosition: [1600, 100],
      labelOffset: [0, -35],
      priority: 7
    },
    {
      id: 'calle-tacuba',
      name: 'Calle de Tacuba',
      points: [[0, 300], [1800, 300]],
      width: 24,
      type: 'main',
      paved: true,
      labelPosition: [200, 300],
      labelOffset: [0, -50],
      priority: 4
    },
    {
      id: 'calle-norte-plaza',
      name: 'Calle de los Plateros',
      points: [[0, 490], [1800, 490]],
      width: 20,
      type: 'main',
      paved: true,
      labelPosition: [1600, 490],
      labelOffset: [0, -45],
      priority: 4
    },
    {
      id: 'calle-empedradillo',
      name: 'Calle del Empedradillo',
      points: [[780, 590], [1040, 590]],
      width: 16,
      type: 'main',
      paved: true,
      labelPosition: [910, 570],
      labelOffset: [0, -30],
      priority: 3,
      description: 'Stone-paved walkway between the cathedral and Plaza Mayor'
    },
    {
      id: 'calle-sur-plaza',
      name: 'Calle de la Diputación',
      points: [[0, 830], [1800, 830]],
      width: 20,
      type: 'main',
      paved: true,
      labelPosition: [200, 830],
      labelOffset: [0, 45],
      priority: 4
    },
    {
      id: 'calle-san-francisco',
      name: 'Calle de San Francisco',
      points: [[600, 770], [1200, 770]],
      width: 18,
      type: 'main',
      paved: true,
      labelPosition: [900, 750],
      labelOffset: [0, -30],
      priority: 3,
      description: 'South flank of Plaza Mayor leading toward the Franciscan convent'
    },
    {
      id: 'calle-arzobispos',
      name: 'Calle de los Arzobispos',
      points: [[0, 1020], [1800, 1020]],
      width: 20,
      type: 'main',
      paved: true,
      labelPosition: [1600, 1020],
      labelOffset: [0, 45],
      priority: 4
    },
    {
      id: 'calle-amargura',
      name: 'Calle de la Amargura',
      points: [[1100, 1200], [1750, 1200]],
      width: 14,
      type: 'secondary',
      paved: false,
      labelPosition: [1425, 1200],
      labelOffset: [0, -35],
      priority: 5
    },
    {
      id: 'calle-sur',
      name: 'Calle del Sur',
      points: [[0, 1250], [1800, 1250]],
      width: 16,
      type: 'secondary',
      paved: false,
      labelPosition: [200, 1250],
      labelOffset: [0, 45],
      priority: 7
    }
  ],

  // BUILDINGS - All placed within street-defined blocks
  // Key north-south alignments at x ≈ 150, 350, 550, 720, 1080, 1280, 1480
  // East-west streets now trace the tapered polylines defined above to mirror Trasmonte’s 1628 plan
  buildings: [
    // ===== PLAZA MAYOR (Bounded by Empedradillo y=590 north, before San Francisco y=770 south) =====
    {
      id: 'plaza-mayor',
      name: 'Plaza Mayor',
      fullName: 'Plaza Mayor de México',
      polygon: [[840, 610], [960, 610], [960, 730], [840, 730]],
      type: 'plaza',
      hasInterior: null,
      labelPosition: [900, 670],
      priority: 2,
      alwaysShowLabel: true,
      yearBuilt: 1524,
      description: 'Central plaza, heart of colonial power and commerce'
    },

    // ===== CATEDRAL (North of Plaza - fills block above plaza) =====
    {
      id: 'cathedral',
      name: 'Catedral Metropolitana',
      fullName: 'Catedral Metropolitana de la Asunción de María',
      polygon: [[830, 470], [950, 470], [950, 570], [830, 570]],
      type: 'church',
      subtype: 'cathedral',
      hasInterior: 'cathedral-interior',
      entrancePoint: { x: 890, y: 575 },
      labelPosition: [890, 520],
      priority: 2,
      alwaysShowLabel: true,
      yearBuilt: 1573,
      interiorDedicated: 1667,
      constructionComplete: 1813,
      partiallyComplete: true,
      description: 'Metropolitan Cathedral (interior complete 1667, exterior still under construction in 1680)'
    },

    // ===== PALACIO VIRREINAL (East of Plaza, small and mapped to part of block) =====
    {
      id: 'palacio-virreinal',
      name: 'Palacio Virreinal',
      fullName: 'Palacio de los Virreyes de Nueva España',
      polygon: [[973, 615], [1030, 615], [1030, 703], [973, 703]],
      type: 'government',
      subtype: 'viceregal-palace',
      hasInterior: 'palacio-interior',
      entrancePoint: { x: 1001, y: 708 },
      labelPosition: [1001, 659],
      priority: 2,
      alwaysShowLabel: true,
      yearBuilt: 1562,
      description: 'Seat of the Viceroy, governs all New Spain'
    },

    // ===== AYUNTAMIENTO (South of Plaza, below San Francisco street y=770, centered) =====
    {
      id: 'ayuntamiento',
      name: 'Ayuntamiento',
      fullName: 'Palacio del Ayuntamiento',
      polygon: [[850, 775], [990, 775], [990, 820], [850, 820]],
      type: 'government',
      subtype: 'municipal',
      hasInterior: null,
      labelPosition: [920, 797],
      priority: 3,
      alwaysShowLabel: true,
      yearBuilt: 1532,
      description: 'City council'
    },

    // ===== EL CONSULADO DE MERCADERES (East of Palacio, smaller and properly on block) =====
    {
      id: 'consulado-mercaderes',
      name: 'El Consulado',
      fullName: 'Consulado de Mercaderes de la Ciudad de México',
      polygon: [[1060, 615], [1120, 615], [1120, 703], [1060, 703]],
      type: 'commercial',
      subtype: 'guild-hall',
      hasInterior: 'consulado-interior',
      entrancePoint: { x: 1090, y: 708 },
      labelPosition: [1090, 659],
      priority: 3,
      alwaysShowLabel: true,
      yearBuilt: 1594,
      description: 'Merchants\' guild and financial exchange - center of colonial commerce'
    },

    // ===== SANTO DOMINGO COMPLEX (Block: 360-540 x 110-290) =====
    {
      id: 'santo-domingo-church',
      name: 'Iglesia de Santo Domingo',
      fullName: 'Iglesia y Convento de Santo Domingo',
      polygon: [[370, 120], [530, 120], [530, 210], [370, 210]],
      type: 'church',
      subtype: 'dominican',
      hasInterior: 'santo-domingo-interior',
      labelPosition: [450, 165],
      priority: 3,
      alwaysShowLabel: true,
      yearBuilt: 1526,
      description: 'Dominican monastery'
    },
    {
      id: 'santo-domingo-convento',
      name: 'Convento de Santo Domingo',
      polygon: [[370, 220], [530, 220], [530, 280], [370, 280]],
      type: 'monastery',
      subtype: 'dominican',
      hasInterior: null,
      labelPosition: [450, 250],
      priority: 5,
      alwaysShowLabel: false,
      description: 'Dominican monastery quarters'
    },

    // ===== INQUISITION (Block: 360-540 x 310-480) =====
    {
      id: 'inquisition-palace',
      name: 'Palacio de la Inquisición',
      fullName: 'Palacio del Santo Oficio',
      polygon: [[370, 330], [530, 330], [530, 460], [370, 460]],
      type: 'government',
      subtype: 'inquisition',
      hasInterior: 'inquisition-interior',
      labelPosition: [450, 395],
      priority: 3,
      alwaysShowLabel: true,
      yearBuilt: 1571,
      laterBaroqueBuilding: 1732,
      description: 'Inquisition tribunal (current baroque building is from 1732, but offices established here 1571)',
      ominous: true
    },

    // ===== SAN FRANCISCO COMPLEX (Block: 160-340 x 1030-1240) =====
    {
      id: 'san-francisco-church',
      name: 'Iglesia de San Francisco',
      fullName: 'Convento Grande de San Francisco',
      polygon: [[170, 1040], [330, 1040], [330, 1140], [170, 1140]],
      type: 'church',
      subtype: 'franciscan',
      hasInterior: 'san-francisco-interior',
      labelPosition: [250, 1090],
      priority: 3,
      alwaysShowLabel: true,
      yearBuilt: 1525,
      description: 'Franciscan complex'
    },
    {
      id: 'san-francisco-convento',
      name: 'Convento de San Francisco',
      polygon: [[170, 1150], [330, 1150], [330, 1230], [170, 1230]],
      type: 'monastery',
      subtype: 'franciscan',
      hasInterior: null,
      labelPosition: [250, 1190],
      priority: 5,
      alwaysShowLabel: false,
      description: 'Franciscan quarters'
    },

    // ===== LA MERCED COMPLEX (Block: 1490-1650 x 840-1010) =====
    {
      id: 'la-merced-monastery',
      name: 'Convento de la Merced',
      fullName: 'Convento de Nuestra Señora de la Merced',
      polygon: [[1500, 850], [1640, 850], [1640, 940], [1500, 940]],
      type: 'monastery',
      subtype: 'mercedarian',
      hasInterior: null,
      labelPosition: [1570, 895],
      priority: 4,
      alwaysShowLabel: true,
      yearBuilt: 1594,
      churchCompleted: 1654,
      cloisterUnderConstruction: true,
      cloisterConstructionPeriod: '1676-1703',
      description: 'Mercedarian monastery (church complete 1654, cloister under construction in 1680)'
    },
    {
      id: 'la-merced-market',
      name: 'Mercado de la Merced',
      polygon: [[1500, 950], [1640, 950], [1640, 1000], [1500, 1000]],
      type: 'market',
      hasInterior: 'mercado-interior',
      entrancePoint: { x: 1570, y: 1010 },
      labelPosition: [1570, 975],
      priority: 4,
      alwaysShowLabel: false,
      description: 'Market near monastery'
    },

    // ===== MARIA'S BOTICA ⭐ (Tiny yellow box) =====
    {
      id: 'botica-amargura',
      name: 'Botica de la Amargura',
      polygon: [[1340, 910], [1360, 910], [1360, 925], [1340, 925]],
      type: 'shop',
      subtype: 'apothecary',
      hasInterior: 'botica-interior',
      isPlayerLocation: true,
      entrancePoint: { x: 1350, y: 930 }, // Where player appears when exiting
      labelPosition: [1350, 945],
      priority: 1,
      alwaysShowLabel: true,
      streetAddress: 'Calle de la Amargura, 47',
      owner: 'Maria de Lima',
      description: 'Small apothecary shop'
    },

    // ===== HOSPITALS =====
    // Smaller building, pushed down and to the right
    {
      id: 'hospital-jesus',
      name: 'Hospital de Jesús',
      fullName: 'Hospital de Jesús Nazareno',
      polygon: [[960, 900], [1040, 900], [1040, 970], [960, 970]],
      type: 'hospital',
      hasInterior: 'hospital-interior',
      labelPosition: [1000, 935],
      entrancePoint: { x: 1000, y: 975 },
      priority: 4,
      alwaysShowLabel: false,
      yearBuilt: 1524,
      founder: 'Hernán Cortés',
      description: 'Oldest hospital in Americas (3 blocks south of Plaza Mayor)'
    },
    {
      id: 'hospital-naturales',
      name: 'Hospital Real de Naturales',
      polygon: [[1300, 120], [1460, 120], [1460, 200], [1300, 200]],
      type: 'hospital',
      hasInterior: null,
      labelPosition: [1380, 160],
      priority: 4,
      alwaysShowLabel: false,
      yearBuilt: 1553,
      description: 'Hospital for indigenous peoples'
    },
    {
      id: 'san-hipolito',
      name: 'San Hipólito',
      fullName: 'Iglesia de San Hipólito y San Casiano',
      polygon: [[170, 510], [330, 510], [330, 610], [170, 610]],
      type: 'church',
      subtype: 'hospital',
      hasInterior: null,
      labelPosition: [250, 560],
      priority: 4,
      alwaysShowLabel: false,
      yearBuilt: 1599,
      description: 'Church and hospital'
    },

    // ===== PORTALES (Arcades around Plaza, aligned to updated plaza bounds) =====
    // NOTE: Casa de Moneda removed - in 1680 it was housed within the Viceregal Palace, not standalone
    {
      id: 'portal-mercaderes',
      name: 'Portal de Mercaderes',
      polygon: [[828, 610], [840, 610], [840, 730], [828, 730]],
      type: 'arcade',
      labelPosition: [834, 670],
      labelOffset: [-60, 0],
      labelRotation: -90,
      priority: 6,
      alwaysShowLabel: false,
      description: 'Western arcade'
    },
    {
      id: 'portal-flores',
      name: 'Portal de las Flores',
      polygon: [[840, 732], [960, 732], [960, 738], [840, 738]],
      type: 'arcade',
      labelPosition: [900, 735],
      labelOffset: [0, 25],
      priority: 6,
      alwaysShowLabel: false,
      description: 'Southern arcade'
    },
    {
      id: 'portal-palacio',
      name: 'Portal del Palacio',
      polygon: [[960, 610], [972, 610], [972, 730], [960, 730]],
      type: 'arcade',
      labelPosition: [966, 670],
      labelOffset: [60, 0],
      labelRotation: -90,
      priority: 6,
      alwaysShowLabel: false,
      description: 'Eastern arcade'
    },

    // ===== RESIDENTIAL (Low priority) =====
    {
      id: 'residences-norte',
      name: 'Residencias',
      polygon: [[570, 120], [700, 120], [700, 200], [570, 200]],
      type: 'residence',
      hasInterior: null,
      priority: 10,
      alwaysShowLabel: false
    },
    {
      id: 'residences-oeste',
      name: 'Residencias',
      polygon: [[170, 650], [330, 650], [330, 730], [170, 730]],
      type: 'residence',
      hasInterior: null,
      priority: 10,
      alwaysShowLabel: false
    },
    {
      id: 'residences-sur',
      name: 'Residencias',
      polygon: [[370, 1070], [520, 1070], [520, 1150], [370, 1150]],
      type: 'residence',
      hasInterior: null,
      priority: 10,
      alwaysShowLabel: false
    },

    // ===== SPECIFIC RESIDENCES (with interiors) =====
    {
      id: 'humble-house',
      name: 'Humble Dwelling',
      polygon: [[580, 1100], [615, 1100], [615, 1130], [580, 1130]],
      type: 'residence',
      subtype: 'humble',
      hasInterior: 'humble-house-interior',
      entrancePoint: { x: 597, y: 1135 },
      labelPosition: [597, 1115],
      priority: 8,
      alwaysShowLabel: false,
      description: 'Simple one-room dwelling'
    },
    {
      id: 'middling-house',
      name: 'Casa Respectable',
      polygon: [[1380, 1100], [1430, 1100], [1430, 1145], [1380, 1145]],
      type: 'residence',
      subtype: 'middling',
      hasInterior: 'middling-house-interior',
      entrancePoint: { x: 1405, y: 1150 },
      labelPosition: [1405, 1122],
      priority: 8,
      alwaysShowLabel: false,
      description: 'Respectable four-room house'
    }
  ],

  // CITY BLOCKS - Generic urban fabric between streets
  cityBlocks: [
    // Northwest quadrant (west of 720, north of 490)
    { polygon: [[160, 110], [340, 110], [340, 290], [160, 290]], type: 'residential' },
    { polygon: [[160, 310], [340, 310], [340, 480], [160, 480]], type: 'mixed' },
    { polygon: [[360, 500], [540, 500], [540, 820], [360, 820]], type: 'commercial' },
    { polygon: [[560, 110], [710, 110], [710, 290], [560, 290]], type: 'mixed' },
    { polygon: [[560, 310], [710, 310], [710, 480], [560, 480]], type: 'residential' },
    { polygon: [[560, 500], [710, 500], [710, 820], [560, 820]], type: 'commercial' },

    // North central (between plaza streets, north of 490)
    { polygon: [[730, 110], [1070, 110], [1070, 290], [730, 290]], type: 'commercial' },

    // Northeast quadrant (east of 1080, north of 490)
    { polygon: [[1090, 220], [1270, 220], [1270, 480], [1090, 480]], type: 'mixed' },
    { polygon: [[1290, 310], [1470, 310], [1470, 480], [1290, 480]], type: 'residential' },
    { polygon: [[1490, 110], [1650, 110], [1650, 290], [1490, 290]], type: 'residential' },
    { polygon: [[1490, 310], [1650, 310], [1650, 480], [1490, 480]], type: 'mixed' },

    // West of plaza (west of 720, between 490-830)
    { polygon: [[560, 840], [710, 840], [710, 1010], [560, 1010]], type: 'commercial' },

    // East of plaza (east of 1080, between 490-830)
    { polygon: [[1290, 700], [1470, 700], [1470, 820], [1290, 820]], type: 'commercial' },
    { polygon: [[1490, 500], [1650, 500], [1650, 820], [1490, 820]], type: 'residential' },

    // South central
    { polygon: [[730, 840], [1070, 840], [1070, 1010], [730, 1010]], type: 'commercial' },
    { polygon: [[1090, 1030], [1270, 1030], [1270, 1190], [1090, 1190]], type: 'mixed' },

    // Southwest quadrant
    { polygon: [[360, 840], [540, 840], [540, 1010], [360, 1010]], type: 'religious' },
    { polygon: [[160, 1030], [340, 1030], [340, 1240], [160, 1240]], type: 'residential' },
    { polygon: [[360, 1160], [540, 1160], [540, 1240], [360, 1240]], type: 'mixed' },

    // Southeast quadrant
    { polygon: [[1090, 1210], [1270, 1210], [1270, 1340], [1090, 1340]], type: 'residential' },
    { polygon: [[1490, 1030], [1650, 1030], [1650, 1190], [1490, 1190]], type: 'market' },
    { polygon: [[1490, 1210], [1650, 1210], [1650, 1340], [1490, 1340]], type: 'mixed' }
  ],

  // CANALS - Water features
  acequias: [
    {
      id: 'acequia-real',
      name: 'Acequia Real',
      points: [[0, 950], [130, 950], [130, 990], [0, 990]],
      width: 40,
      type: 'major',
      flowDirection: 'south',
      labelPosition: [65, 970],
      labelRotation: -90,
      priority: 6,
      description: 'Main canal from Chapultepec'
    },
    {
      id: 'canal-este',
      name: 'Canal del Este',
      points: [[1720, 0], [1770, 0], [1770, 1350], [1720, 1350]],
      width: 50,
      type: 'major',
      flowDirection: 'south',
      labelPosition: [1745, 675],
      labelRotation: -90,
      priority: 6,
      description: 'Canal to Lake Texcoco'
    }
  ],

  // BARRIOS - Colonial districts (subtle background)
  barrios: [
    {
      id: 'traza-española',
      name: 'Traza Española',
      polygon: [[560, 0], [1770, 0], [1770, 1350], [560, 1350]],
      type: 'spanish',
      priority: 10,
      description: 'Spanish colonial core'
    },
    {
      id: 'barrio-san-juan',
      name: 'San Juan Moyotlan',
      polygon: [[0, 0], [560, 0], [560, 1350], [0, 1350]],
      type: 'indigenous',
      priority: 10,
      description: 'Indigenous quarter'
    }
  ],

  // PARKS
  parks: [
    {
      id: 'la-alameda',
      name: 'La Alameda',
      fullName: 'La Alameda Central',
      polygon: [[0, 1260], [140, 1260], [140, 1350], [0, 1350]],
      type: 'park',
      hasInterior: null,
      labelPosition: [70, 1305],
      priority: 4,
      alwaysShowLabel: true,
      yearBuilt: 1592,
      description: 'Public park with poplar trees',
      treePositions: [
        [25, 1275], [50, 1275], [75, 1275], [100, 1275], [125, 1275],
        [25, 1305], [50, 1305], [75, 1305], [100, 1305], [125, 1305],
        [25, 1335], [50, 1335], [75, 1335], [100, 1335], [125, 1335]
      ]
    }
  ],

  // LANDMARKS
  landmarks: [
    {
      id: 'fountain-plaza',
      name: 'Fuente Mayor',
      position: [900, 670],
      icon: 'fountain',
      type: 'fountain',
      radius: 20,
      priority: 4,
      alwaysShowLabel: false,
      yearBuilt: 1528,
      description: 'Central fountain'
    },
    {
      id: 'fountain-alameda',
      name: 'Fuente de la Alameda',
      position: [70, 1305],
      icon: 'fountain',
      type: 'fountain',
      radius: 12,
      priority: 7,
      alwaysShowLabel: false
    }
  ],

  backgroundColor: '#fefaf5'
};
