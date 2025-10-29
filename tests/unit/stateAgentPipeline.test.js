import { extractGameState } from '../../src/core/agents/StateAgent';
import { createChatCompletion } from '../../src/core/services/llmService';
import { scenarioLoader } from '../../src/core/services/scenarioLoader';
import { isFeatureEnabled } from '../../src/core/config/featureFlags';

jest.mock('../../src/core/services/llmService', () => ({
  createChatCompletion: jest.fn()
}));

jest.mock('../../src/core/services/scenarioLoader', () => ({
  scenarioLoader: {
    loadScenario: jest.fn()
  }
}));

jest.mock('../../src/core/config/featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
  getAllFlags: jest.fn(() => ({}))
}));

jest.mock('../../src/features/map/services/gridMovementSystem', () => ({
  getGridSystem: jest.fn(() => ({
    validateMove: () => ({ valid: false, newPosition: null, reason: 'blocked' }),
    getNearbyLocations: () => []
  }))
}));

const BASE_LLM_RESPONSE = {
  gameState: {
    wealth: 27,
    wealthChange: 0,
    status: 'calm',
    location: 'Shop Floor, Botica de la Amargura',
    time: '8:30 AM',
    date: 'August 22, 1680',
    timeElapsed: '0 hours 20 minutes',
    position: null
  },
  inventoryChanges: [],
  relationshipChanges: [],
  reputationEvents: [],
  contractOffer: {
    type: 'null',
    offeredBy: '',
    offeredByDescription: '',
    patientName: '',
    patientDescription: '',
    patientLocation: null,
    paymentOffered: 0,
    ailmentDescription: '',
    isEmissary: false
  },
  actionPrompt: { type: 'null' },
  purchaseOffer: { type: 'null' },
  journalEntry: '',
  systemAnnouncements: []
};

function mockLLMResponse(overrides = {}) {
  createChatCompletion.mockResolvedValueOnce({
    choices: [
      {
        message: {
          content: JSON.stringify({
            ...BASE_LLM_RESPONSE,
            ...overrides
          })
        }
      }
    ]
  });
}

const CURRENT_GAME_STATE = {
  wealth: 27,
  status: 'curious',
  reputationEmoji: '😌',
  reputation: { overall: 50 },
  location: 'Shop Floor, Botica de la Amargura',
  time: '8:10 AM',
  date: 'August 22, 1680',
  position: null
};

beforeEach(() => {
  jest.clearAllMocks();
  scenarioLoader.loadScenario.mockReturnValue({ currency: 'reales' });
  isFeatureEnabled.mockImplementation(flag => flag === 'revisedInteractionPipeline' ? true : false);
});

describe('StateAgent revised interaction pipeline', () => {
  test('drops treatment contracts when intent is nonmedical', async () => {
    mockLLMResponse({
      contractOffer: {
        type: 'treatment',
        offeredBy: 'Tlacaelel',
        offeredByDescription: 'Scholar',
        patientName: 'Tlacaelel',
        patientDescription: 'Worried about documents',
        patientLocation: null,
        paymentOffered: 0,
        ailmentDescription: 'Needs documents hidden',
        isEmissary: false
      },
      systemAnnouncements: [
        'A treatment contract is being discussed (payment: 0 reales).'
      ]
    });

    const result = await extractGameState({
      narrative: 'Tlacaelel asks for help concealing codices.',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'recognize the portents',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'nonmedical_request'
    });

    expect(result.contractOffer.type).toBe('null');
    expect(result.systemAnnouncements).toEqual([]);
  });

  test('retains treatment contracts for medical diagnosis intent', async () => {
    mockLLMResponse({
      contractOffer: {
        type: 'treatment',
        offeredBy: 'Doña Beatriz',
        offeredByDescription: 'Noblewoman with fever',
        patientName: 'Doña Beatriz',
        patientDescription: 'High fever and chills',
        patientLocation: 'Her carriage',
        paymentOffered: 12,
        ailmentDescription: 'Violent fever',
        isEmissary: true
      }
    });

    const result = await extractGameState({
      narrative: 'Doña Beatriz clutches at her chest, begging for examination.',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'examine the lady',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'medical_diagnosis'
    });

    expect(result.contractOffer.type).toBe('treatment');
    expect(result.contractOffer.isEmissary).toBe(false);
    expect(result.contractOffer.patientLocation).toBeNull();
  });

  test('marks house call contracts as emissary requests', async () => {
    mockLLMResponse({
      contractOffer: {
        type: 'treatment',
        offeredBy: 'Sebastián',
        offeredByDescription: 'Servant from Calle de Tacuba',
        patientName: 'Don Rodrigo',
        patientDescription: 'Bedridden with fever',
        patientLocation: null,
        paymentOffered: 14,
        ailmentDescription: 'High fever',
        isEmissary: false
      }
    });

    const result = await extractGameState({
      narrative: 'A servant begs you to visit Don Rodrigo who cannot rise from bed.',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'listen to the servant',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'house_call'
    });

    expect(result.contractOffer.type).toBe('treatment');
    expect(result.contractOffer.isEmissary).toBe(true);
  });

  test('creates house call travel payload after acceptance announcement', async () => {
    mockLLMResponse({
      contractOffer: {
        type: 'treatment',
        offeredBy: 'María the Maid',
        offeredByDescription: 'Servant carrying the request',
        patientName: 'Doña Isabel',
        patientDescription: 'Suffering flux after fasting',
        patientLocation: 'Casa Respectable',
        paymentOffered: 6,
        ailmentDescription: 'Violent flux',
        isEmissary: true
      },
      systemAnnouncements: [
        'Accepted a house call request. Traveling to the patient now.'
      ]
    });

    const result = await extractGameState({
      narrative: 'You gather your satchel and follow the servant west toward the Alameda.',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'agree to visit',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'house_call'
    });

    expect(result.contractOffer.type).toBe('null');
    expect(result.houseCallTravel).toBeDefined();
    expect(result.houseCallTravel.patientName).toBe('Doña Isabel');
    expect(result.houseCallTravel.patientLocation).toBe('Casa Respectable');
    expect(result.houseCallTravel.paymentOffered).toBe(6);
  });

  test('blocks house call contract with insufficient negotiation details', async () => {
    mockLLMResponse({
      contractOffer: {
        type: 'treatment',
        offeredBy: 'Enslaved Man',
        offeredByDescription: 'Carries a bundle of soiled linens',
        patientName: '', // No patient name yet
        patientDescription: 'Master is sick',
        patientLocation: null, // No location yet
        paymentOffered: 0, // No payment discussed yet
        ailmentDescription: 'Unknown illness',
        isEmissary: true
      }
    });

    const result = await extractGameState({
      narrative: 'An enslaved man approaches. "My master is very sick," he says urgently.',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'see who is at the door',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'house_call'
    });

    // Contract should be blocked due to insufficient details (0/3 requirements met)
    expect(result.contractOffer.type).toBe('null');
  });

  test('allows house call contract with sufficient negotiation details', async () => {
    mockLLMResponse({
      contractOffer: {
        type: 'treatment',
        offeredBy: 'Enslaved Man',
        offeredByDescription: 'Servant carrying urgent request',
        patientName: 'Don Francisco',
        patientDescription: 'Bedridden with fever',
        patientLocation: 'Casa Grande on Calle San Francisco',
        paymentOffered: 8,
        ailmentDescription: 'High fever and chills',
        isEmissary: true
      }
    });

    const result = await extractGameState({
      narrative: 'He explains: "My master Don Francisco is at Casa Grande on Calle San Francisco. He will pay 8 reales if you come treat his fever."',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'ask about the terms',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'house_call'
    });

    // Contract should appear (3/3 requirements: named patient + location + payment)
    expect(result.contractOffer.type).toBe('treatment');
    expect(result.contractOffer.isEmissary).toBe(true);
    expect(result.contractOffer.patientName).toBe('Don Francisco');
    expect(result.contractOffer.patientLocation).toBe('Casa Grande on Calle San Francisco');
    expect(result.contractOffer.paymentOffered).toBe(8);
  });

  test('blocks erroneous give actionPrompt during house call negotiation', async () => {
    mockLLMResponse({
      contractOffer: {
        type: 'treatment',
        offeredBy: 'Enslaved Man',
        offeredByDescription: 'Carries urgent message',
        patientName: '', // No details yet
        patientDescription: 'Sick master',
        patientLocation: null,
        paymentOffered: 0,
        ailmentDescription: 'Unknown',
        isEmissary: true
      },
      actionPrompt: {
        type: 'give',
        recipientName: 'Enslaved Man',
        npcId: 'enslaved-man',
        npcPortrait: null,
        context: 'He asks for help',
        suggestedItems: [],
        priceOffered: 0,
        ailmentDescription: null
      }
    });

    const result = await extractGameState({
      narrative: 'An enslaved man approaches asking for help with his sick master.',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'listen to him',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'house_call'
    });

    // Both contract and actionPrompt should be blocked
    expect(result.contractOffer.type).toBe('null');
    expect(result.actionPrompt.type).toBe('null');
  });
});

describe('StateAgent document detection', () => {
  test('enforces readable metadata for letters', async () => {
    mockLLMResponse({
      inventoryChanges: [
        {
          item: 'Letter from Don Luis',
          quantity: 1,
          action: 'received',
          price: 0,
          isReadable: false,
          documentType: null
        }
      ]
    });

    const result = await extractGameState({
      narrative: 'Don Luis presses a sealed letter into your hands.',
      currentGameState: CURRENT_GAME_STATE,
      playerAction: 'accept the letter',
      scenarioId: '1680-mexico-city',
      interactionIntent: 'social'
    });

    expect(result.inventoryChanges[0].isReadable).toBe(true);
    expect(result.inventoryChanges[0].documentType).toBe('letter');
    expect(result.inventoryChanges[0].metadata).toEqual({
      author: null,
      giver: null,
      purpose: null
    });
  });
});
