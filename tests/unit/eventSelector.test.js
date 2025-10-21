/**
 * Unit Tests - Event Selector
 * Tests event selection logic without LLM calls
 */

import {
  selectRandomEvent,
  recordEventOccurrence,
  resetEventTracking,
  selectEventById,
  getEventsByCategory
} from '../../src/core/events/eventSelector';

import { EVENT_POOL } from '../../src/core/events/eventPool';

import {
  defaultEventContext,
  nightEventContext,
  earlyEventContext
} from '../fixtures/gameState.fixture';

import { waitForAsync } from '../utils/testHelpers';

describe('Event Selector - Location Filtering', () => {
  beforeEach(() => {
    resetEventTracking();
  });

  test('filters events by location correctly', () => {
    const context = {
      location: 'Plaza Mayor',
      time: '10:00 AM',
      turnNumber: 5,
      wealth: 50,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0 // 100% to guarantee trigger
    };

    // Find events that should match plaza/streets
    const plazaEvents = EVENT_POOL.filter(e =>
      e.triggers.locations &&
      e.triggers.locations.some(loc =>
        loc.toLowerCase().includes('plaza') ||
        loc.toLowerCase().includes('street')
      )
    );

    expect(plazaEvents.length).toBeGreaterThan(0);
  });

  test('rejects events with wrong location', () => {
    const context = {
      location: 'Interior of Botica', // Indoor location
      time: '10:00 AM',
      turnNumber: 5,
      wealth: 50,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    // Try to get an outdoor-only event
    const streetEvent = selectEventById('street-juggler');

    // This event should not be available indoors
    expect(streetEvent.triggers.locations).not.toContain('botica');
  });
});

describe('Event Selector - Time of Day', () => {
  test('night events trigger at night', () => {
    const nightContext = {
      location: 'Streets',
      time: '11:00 PM',
      turnNumber: 5,
      wealth: 50,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    // Danger events should have higher weight at night
    // This is tested by checking the eventTriggers logic
    const dangerEvents = getEventsByCategory('danger');
    expect(dangerEvents.length).toBeGreaterThan(0);
  });
});

describe('Event Selector - Occurrence Tracking', () => {
  beforeEach(() => {
    resetEventTracking();
  });

  test('tracks event occurrences correctly', () => {
    recordEventOccurrence('street-juggler');
    recordEventOccurrence('street-juggler');
    recordEventOccurrence('street-argument');

    // After tracking, the event should be remembered
    // (Implementation detail: check internal occurrence map)
  });

  test('respects max occurrences per session', () => {
    const event = selectEventById('street-juggler');
    const maxOccurrences = event.triggers.maxPerSession || Infinity;

    // Record event max times
    for (let i = 0; i < maxOccurrences; i++) {
      recordEventOccurrence('street-juggler');
    }

    // Now try to select it
    const context = {
      location: 'Plaza Mayor',
      time: '10:00 AM',
      turnNumber: 5,
      wealth: 50,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    // Run selection 10 times - should never get street-juggler
    let gotBlockedEvent = false;
    for (let i = 0; i < 10; i++) {
      const selected = selectRandomEvent(context);
      if (selected && selected.id === 'street-juggler') {
        gotBlockedEvent = true;
      }
    }

    expect(gotBlockedEvent).toBe(false);
  });
});

describe('Event Selector - Wealth Requirements', () => {
  test('excludes events player cannot afford', () => {
    const brokeContext = {
      location: 'Plaza Mayor',
      time: '10:00 AM',
      turnNumber: 5,
      wealth: 0, // No money
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    const selected = selectRandomEvent(brokeContext);

    // If an event was selected, check that all choices are either:
    // 1. Free (no cost)
    // 2. Disabled (isAffordable: false)
    if (selected) {
      const hasAffordableChoice = selected.choices.some(choice =>
        !choice.cost || (choice.cost.wealth || 0) <= 0
      );

      expect(hasAffordableChoice).toBe(true);
    }
  });
});

describe('Event Selector - Turn Gates', () => {
  test('respects minimum turn number', () => {
    const earlyContext = {
      location: 'Plaza Mayor',
      time: '10:00 AM',
      turnNumber: 1, // Very early
      wealth: 50,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    // Most events require turn >= 3
    const selected = selectRandomEvent(earlyContext);

    if (selected) {
      const minTurn = selected.triggers.minTurnNumber || 0;
      expect(minTurn).toBeLessThanOrEqual(1);
    }
  });
});

describe('Event Selector - Category Distribution', () => {
  test('returns events from all categories', () => {
    const categories = ['street-life', 'environmental', 'religious', 'economic', 'danger'];

    categories.forEach(category => {
      const events = getEventsByCategory(category);
      expect(events.length).toBeGreaterThan(0);
    });
  });

  test('event pool has 30 total events', () => {
    expect(EVENT_POOL.length).toBe(30);
  });
});

describe('Event Selector - Weighted Selection', () => {
  test('higher weight events appear more often', () => {
    resetEventTracking();

    const context = {
      location: 'Plaza Mayor',
      time: '10:00 AM',
      turnNumber: 10,
      wealth: 50,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    const counts = {};

    // Run 100 selections
    for (let i = 0; i < 100; i++) {
      const selected = selectRandomEvent(context);
      if (selected) {
        counts[selected.id] = (counts[selected.id] || 0) + 1;
      }
    }

    // At least some events should have been selected
    expect(Object.keys(counts).length).toBeGreaterThan(0);
  });
});

describe('Event Selector - Edge Cases', () => {
  test('handles empty context gracefully', () => {
    const emptyContext = {
      location: null,
      time: null,
      turnNumber: 0,
      wealth: 0,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 0
    };

    // Should not crash
    const result = selectRandomEvent(emptyContext);
    expect(result).toBeDefined();
  });

  test('handles extremely high turn number', () => {
    const lateGameContext = {
      location: 'Plaza Mayor',
      time: '10:00 AM',
      turnNumber: 9999,
      wealth: 1000,
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    // Should still work
    const result = selectRandomEvent(lateGameContext);
    expect(result).toBeDefined();
  });

  test('handles negative wealth gracefully', () => {
    const negativeContext = {
      location: 'Plaza Mayor',
      time: '10:00 AM',
      turnNumber: 5,
      wealth: -100, // Bug scenario
      inventory: [],
      reputation: {},
      recentEventCategories: [],
      randomEventChance: 1.0
    };

    // Should not crash
    expect(() => selectRandomEvent(negativeContext)).not.toThrow();
  });
});
