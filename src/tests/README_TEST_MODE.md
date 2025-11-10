# Test Mode - Deterministic Entity Selection

## Overview

The EntityAgent supports a special **test mode** that bypasses all probability/pacing logic and returns predefined entities for reliable automated testing.

## How It Works

When `playerAction` contains a `[TEST:type]` keyword, EntityAgent immediately returns a predefined entity, skipping:
- Random NPC selection
- Conversation lock detection
- Pacing calculations
- Reputation checks
- Time-of-day restrictions

## Usage

### In Tests

```javascript
const result = await orchestrateTurn({
  playerAction: '[TEST:water_seller] walk outside',
  // ... other params
});

// Guaranteed to get a water seller simple interaction
expect(result.simpleInteraction.type).toBe('vendor_offer');
expect(result.simpleInteraction.npcName).toBe('Test Water Seller');
```

### Available Test Types

| Keyword | Returns | Simple Interaction Type |
|---------|---------|------------------------|
| `[TEST:water_seller]` | Test Water Seller | `vendor_offer` (water, 1 real) |
| `[TEST:beggar]` | Test Beggar | `donation_request` (bread for starving family) |
| `[TEST:informant]` | Test Street Informant | `information_exchange` (gossip, 2 reales) |
| `[TEST:gambler]` | Test Card Player | `gamble_opportunity` (cards, 5 reales wager) |
| `[TEST:vendor]` | Test Market Vendor | `vendor_offer` (herbs, 3 reales) |

### Example Test Scenarios

```javascript
// Water Seller - Purchase
{
  action: '[TEST:water_seller] walk outside',
  simpleInteractionChoice: 'buy',
  expectedCost: 1
}

// Beggar - Refuse Charity
{
  action: '[TEST:beggar] walk through plaza',
  simpleInteractionChoice: 'refuse',
  expectedReputationChange: -3
}

// Informant - Pay for Information
{
  action: '[TEST:informant] look for gossip',
  simpleInteractionChoice: 'pay',
  expectedCost: 2,
  expectsTwoNarratives: true // reveal + continuation
}
```

## Adding New Test Types

To add a new test type, edit `EntityAgent.js` at line ~55:

```javascript
case 'new_type':
  return {
    id: 'test-new-type',
    name: 'Test NPC Name',
    type: 'npc',
    simpleInteractionType: 'appropriate_type',
    demographics: { gender: '...', age: '...', casta: '...', class: '...' },
    // ... interaction-specific data (offer, request, gamble, etc.)
  };
```

## Implementation Details

**File**: `/src/core/agents/EntityAgent.js` (lines 47-141)

**Detection**: Case-insensitive regex: `/\[TEST:(\w+)\]/i`

**Priority**: Runs BEFORE all other entity selection logic (follow-ups, conversation lock, scripted events, etc.)

**Logging**: Console shows `[EntityAgent] 🧪 TEST MODE: {type}` when triggered

## Limitations

1. **Test mode bypasses all game logic** - use only for testing, not debugging normal game flow
2. **Doesn't populate EntityManager** - returned entities are ephemeral (not stored)
3. **Demographics are fixed** - can't vary age/gender/class per test
4. **No LLM variation** - same entity data every time (deterministic by design)

## When NOT to Use Test Mode

- ❌ Debugging normal gameplay issues
- ❌ Testing procedural generation
- ❌ Testing conversation lock behavior
- ❌ Testing NPC pacing/selection logic
- ❌ Testing reputation-based NPC reactions

Use test mode **only** for testing simple interaction card logic, continuation narratives, and state updates (wealth, reputation, inventory).

## Related Files

- **Test definitions**: `/src/tests/simpleInteractionTests.js`
- **Test runner**: `/src/components/SimpleInteractionTestPanel.jsx`
- **EntityAgent source**: `/src/core/agents/EntityAgent.js`
