/**
 * Interior map: El Consulado de Mercaderes
 * Financial exchange and merchants' guild hall
 * Center for investments, contracts, and commercial dealings
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
export default {
  id: 'consulado-interior',
  type: 'interior',
  name: 'El Consulado de Mercaderes',
  style: 'colonial-interior',
  bounds: {
    width: 1000,
    height: 600
  },
  startPosition: [120, 300], // Just inside entrance

  // Three main areas: Main hall, Contract office, Private chamber
  rooms: [
    // Main Exchange Hall - where merchants gather
    {
      id: 'exchange-hall',
      name: 'Exchange Hall',
      polygon: [
        [50, 150],
        [700, 150],
        [700, 550],
        [50, 550]
      ],
      type: 'hall',
      spawnPoint: { x: 375, y: 350 },
      description: 'The bustling heart of colonial commerce. Merchants negotiate deals, form partnerships, and discuss investment opportunities.'
    },

    // Contract Office - where investments are recorded
    {
      id: 'contract-office',
      name: 'Contract Office',
      polygon: [
        [720, 150],
        [950, 150],
        [950, 380],
        [720, 380]
      ],
      type: 'office',
      spawnPoint: { x: 835, y: 265 },
      description: 'The office of the escribano (notary) where contracts, investments, and partnerships are formally recorded.'
    },

    // Private Chamber - for high-value deals
    {
      id: 'private-chamber',
      name: 'Private Chamber',
      polygon: [
        [720, 400],
        [950, 400],
        [950, 550],
        [720, 550]
      ],
      type: 'chamber',
      spawnPoint: { x: 835, y: 475 },
      description: 'A private room for confidential negotiations and high-value investment discussions.'
    },

    // Entry Vestibule
    {
      id: 'vestibule',
      name: 'Vestibule',
      polygon: [
        [50, 50],
        [700, 50],
        [700, 150],
        [50, 150]
      ],
      type: 'vestibule',
      spawnPoint: { x: 375, y: 100 },
      description: 'Entrance hall with the seal of the Consulado de Mercaderes displayed prominently.'
    }
  ],

  // Entrances
  doors: [
    // Main entrance from street
    {
      id: 'main-entrance',
      from: 'street',
      to: 'vestibule',
      position: [350, 50],
      width: 100,
      rotation: 0,
      isLocked: false
    },

    // Vestibule to Main Hall
    {
      id: 'hall-door',
      from: 'vestibule',
      to: 'exchange-hall',
      position: [350, 150],
      width: 80,
      rotation: 0,
      isLocked: false
    },

    // Main Hall to Contract Office
    {
      id: 'office-door',
      from: 'exchange-hall',
      to: 'contract-office',
      position: [720, 265],
      width: 70,
      rotation: 90,
      isLocked: false
    },

    // Contract Office to Private Chamber
    {
      id: 'chamber-door',
      from: 'contract-office',
      to: 'private-chamber',
      position: [835, 400],
      width: 70,
      rotation: 0,
      isLocked: false
    }
  ],

  // Furniture and interactive elements
  furniture: [
    // === EXCHANGE HALL ===
    // Central negotiation table
    {
      id: 'central-table',
      name: 'Merchant\'s Table',
      type: 'table',
      position: [300, 300],
      rotation: 0,
      size: [200, 100],
      description: 'A large oak table where merchants gather to discuss trade routes and ventures'
    },

    // Benches around the table
    {
      id: 'bench-north',
      name: 'Bench',
      type: 'bench',
      position: [350, 250],
      rotation: 0,
      size: [100, 30]
    },
    {
      id: 'bench-south',
      name: 'Bench',
      type: 'bench',
      position: [350, 420],
      rotation: 0,
      size: [100, 30]
    },

    // Notice board for opportunities
    {
      id: 'notice-board',
      name: 'Investment Board',
      type: 'board',
      position: [100, 200],
      rotation: 0,
      size: [80, 120],
      description: 'A wooden board displaying notices of investment opportunities: Manila galleon shares, silver mining consortiums, church bonds, and more',
      interactionType: 'investments',
      interactionLabel: 'Review Investment Opportunities'
    },

    // Ledger desk
    {
      id: 'ledger-desk',
      name: 'Public Ledger',
      type: 'desk',
      position: [550, 250],
      rotation: 0,
      size: [100, 60],
      description: 'A desk with the Consulado\'s public ledger, recording recent trades and investments'
    },

    // === CONTRACT OFFICE ===
    // Escribano's desk - main investment interaction point
    {
      id: 'escribano-desk',
      name: 'Notary\'s Desk',
      type: 'desk',
      position: [790, 240],
      rotation: 90,
      size: [120, 80],
      description: 'The escribano\'s desk, where investments are formally recorded and contracts drawn up',
      interactionType: 'investments',
      interactionLabel: 'Speak with the Escribano about Investments'
    },

    // Document cabinet
    {
      id: 'document-cabinet',
      name: 'Document Cabinet',
      type: 'cabinet',
      position: [880, 180],
      rotation: 0,
      size: [60, 40],
      description: 'Cabinet filled with contracts, partnership agreements, and investment records'
    },

    // Chair for escribano
    {
      id: 'escribano-chair',
      name: 'Escribano\'s Chair',
      type: 'chair',
      position: [820, 270],
      rotation: 180,
      size: [40, 40]
    },

    // === PRIVATE CHAMBER ===
    // Negotiation table
    {
      id: 'private-table',
      name: 'Negotiation Table',
      type: 'table',
      position: [800, 450],
      rotation: 0,
      size: [140, 80],
      description: 'A polished mahogany table for private investment discussions'
    },

    // Chairs
    {
      id: 'chair-1',
      name: 'Chair',
      type: 'chair',
      position: [780, 470],
      rotation: 90,
      size: [35, 35]
    },
    {
      id: 'chair-2',
      name: 'Chair',
      type: 'chair',
      position: [900, 470],
      rotation: -90,
      size: [35, 35]
    },

    // === VESTIBULE ===
    // Seal of the Consulado
    {
      id: 'consulado-seal',
      name: 'Seal of the Consulado',
      type: 'decoration',
      position: [350, 80],
      rotation: 0,
      size: [100, 50],
      description: 'The official seal of the Consulado de Mercaderes - a ship above crossed anchors, symbolizing maritime commerce'
    }
  ],

  // Walls define room boundaries (automatically generated from room polygons)
  walls: [],

  // Ambient details
  ambientObjects: [
    { type: 'candle', position: [100, 300] },
    { type: 'candle', position: [600, 300] },
    { type: 'candle', position: [800, 200] },
    { type: 'inkwell', position: [820, 250] },
    { type: 'quill', position: [830, 255] },
    { type: 'papers', position: [810, 460] }
  ],

  backgroundColor: '#f4ebe1' // Warm colonial interior
};
