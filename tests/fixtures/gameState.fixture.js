/**
 * Test Fixtures - Game State
 * Reusable test data for consistent testing
 */

/**
 * Default game state for testing
 */
export const defaultGameState = {
  scenarioId: '1680-mexico-city',
  inventory: [
    { name: 'Peyote', quantity: 3, price: 8 },
    { name: 'Cinchona bark', quantity: 5, price: 12 },
    { name: 'Tobacco', quantity: 10, price: 2 }
  ],
  compounds: [],
  quests: [],
  time: '10:00 AM',
  date: 'August 22, 1680',
  location: 'Botica de la Amargura',
  turnNumber: 5,
  wealth: 50,
  energy: 80,
  health: 90,
  unlockedMethods: ['Distill', 'Decoct'],
  isGameOver: false
};

/**
 * Early game state (turn 1-3)
 */
export const earlyGameState = {
  ...defaultGameState,
  turnNumber: 1,
  wealth: 25,
  energy: 100,
  health: 100,
  inventory: [
    { name: 'Cinchona bark', quantity: 2, price: 12 }
  ]
};

/**
 * Late game state (turn 50+)
 */
export const lateGameState = {
  ...defaultGameState,
  turnNumber: 75,
  wealth: 500,
  energy: 60,
  health: 80,
  inventory: [
    { name: 'Peyote', quantity: 20, price: 8 },
    { name: 'Cinchona bark', quantity: 30, price: 12 },
    { name: 'Mercury', quantity: 5, price: 25 },
    { name: 'Gold leaf', quantity: 10, price: 50 }
  ],
  unlockedMethods: ['Distill', 'Decoct', 'Calcinate', 'Confection']
};

/**
 * Critical state (low resources)
 */
export const criticalGameState = {
  ...defaultGameState,
  turnNumber: 20,
  wealth: 5,
  energy: 15,
  health: 25,
  inventory: [
    { name: 'Tobacco', quantity: 1, price: 2 }
  ]
};

/**
 * Broke state (no money)
 */
export const brokeGameState = {
  ...defaultGameState,
  wealth: 0,
  energy: 50,
  health: 60,
  inventory: []
};

/**
 * Default reputation for testing
 */
export const defaultReputation = {
  church: 0,
  inquisition: 0,
  criollos: 0,
  commonFolk: 5,
  indigenous: 0,
  physicians: 0
};

/**
 * High reputation (well-liked)
 */
export const highReputation = {
  church: 20,
  inquisition: -10,
  criollos: 30,
  commonFolk: 40,
  indigenous: 25,
  physicians: 15
};

/**
 * Low reputation (suspicious)
 */
export const lowReputation = {
  church: -30,
  inquisition: -40,
  criollos: -20,
  commonFolk: -10,
  indigenous: 5,
  physicians: -25
};

/**
 * Default event context for testing
 */
export const defaultEventContext = {
  location: 'Plaza Mayor',
  time: '10:00 AM',
  turnNumber: 5,
  wealth: 50,
  energy: 80,
  health: 90,
  inventory: defaultGameState.inventory,
  reputation: defaultReputation,
  recentEventCategories: [],
  randomEventChance: 1.0 // 100% for testing
};

/**
 * Night context
 */
export const nightEventContext = {
  ...defaultEventContext,
  time: '11:00 PM',
  randomEventChance: 0.8
};

/**
 * Early game context
 */
export const earlyEventContext = {
  ...defaultEventContext,
  turnNumber: 1,
  wealth: 25,
  energy: 100,
  health: 100
};
