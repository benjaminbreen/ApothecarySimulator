# Investment System Design - 1680 Mexico City

## 🎯 Design Goals

1. **Simple**: Easy to understand risk/reward mechanics
2. **Fun**: Meaningful choices with visible outcomes
3. **Realistic**: Historically accurate investment types for colonial Mexico
4. **Integrated**: Ties into existing reputation, skills, and narrative systems

---

## 💰 Investment Types (6 Core Options)

### 1. Silver Mining Consortium (High Risk, High Reward)
**Description**: Purchase shares in silver mining operations in Zacatecas or Guanajuato

**Mechanics**:
- **Initial Investment**: 50-200 reales
- **Duration**: 7-14 days (game time)
- **Expected Return**: 150-300% (or total loss)
- **Risk Factors**:
  - Mine collapse (10% chance) = total loss
  - Indigenous labor disputes = 50% return
  - Rich vein discovered = 300% return
  - Normal operation = 150-180% return

**Unlock**: Bookkeeping Level 5 + Merchant Faction reputation 60+

---

### 2. Manila Galleon Trade (Medium Risk, High Reward)
**Description**: Invest in cargo space on the annual galleon from Manila to Acapulco

**Mechanics**:
- **Initial Investment**: 100-300 reales
- **Duration**: 30-45 days (game time) - very long!
- **Expected Return**: 200-250%
- **Risk Factors**:
  - Pirate attack (5% chance) = total loss
  - Storm damage = 80% return
  - Successful voyage = 200-250% return
  - Exceptional haul (silk, porcelain) = 300% return

**Unlock**: Bookkeeping Level 7 + Languages (Chinese or Tagalog) Level 3

**Special**: Requires connection to port officials (quest chain?)

---

### 3. Cacao Plantation (Low Risk, Medium Reward)
**Description**: Buy shares in cacao plantations in Veracruz

**Mechanics**:
- **Initial Investment**: 30-100 reales
- **Duration**: 10-15 days
- **Expected Return**: 120-140%
- **Risk Factors**:
  - Drought/pests (15% chance) = 90% return
  - Normal harvest = 120-130% return
  - Exceptional harvest = 140-160% return

**Unlock**: Bookkeeping Level 5

**Bonus**: Higher returns if you have Herbalism skill (knowledge of crops)

---

### 4. Church Bonds (No Risk, Low Reward)
**Description**: Loan money to the Church with guaranteed return

**Mechanics**:
- **Initial Investment**: 20-500 reales (scalable)
- **Duration**: 5-10 days
- **Expected Return**: 105-115% (guaranteed)
- **Risk Factors**: None - always returns stated amount

**Unlock**: Bookkeeping Level 3

**Special**: Improves Church faction reputation (+5 per bond)

---

### 5. Real Estate Venture (Medium Risk, Medium Reward)
**Description**: Co-invest in purchasing and renting property in Mexico City

**Mechanics**:
- **Initial Investment**: 150-400 reales
- **Duration**: 20-30 days
- **Expected Return**: 130-160%
- **Risk Factors**:
  - Tenant defaults (10% chance) = 100% return (break even)
  - Earthquake damage (5% chance) = 70% return
  - Normal rent = 130-140% return
  - Wealthy tenant = 150-160% return

**Unlock**: Bookkeeping Level 6 + Etiquette Level 4

**Bonus**: Higher returns with high Noble faction reputation

---

### 6. Apothecary Supply Syndicate (Low Risk, Low-Medium Reward)
**Description**: Pool resources with other apothecaries to bulk-purchase ingredients

**Mechanics**:
- **Initial Investment**: 40-120 reales
- **Duration**: 3-7 days (shortest option)
- **Expected Return**: 110-125% (reliable)
- **Risk Factors**:
  - Supplier delays = 105% return
  - Normal operation = 110-120% return
  - Rare ingredient secured = 125% return + free rare item

**Unlock**: Bookkeeping Level 5

**Special**: Ties directly to your profession - can receive actual materia medica as bonus

---

## 🎲 Core Mechanics

### Investment Process Flow

1. **Browse Available Investments** (Investments tab in TradeModal)
   - See 3-5 active investment opportunities
   - Each shows: Type, Cost, Duration, Expected Return Range, Risk Level
   - Color-coded risk: 🟢 Low | 🟡 Medium | 🔴 High

2. **Select Investment**
   - Modal shows detailed breakdown:
     - Historical context (flavor text)
     - Best case scenario
     - Worst case scenario
     - Required capital
     - Lock-in period
   - "Invest" button deducts wealth

3. **Active Investments Panel**
   - Shows all current investments
   - Progress bar showing days remaining
   - Cannot cancel early (realistic commitment)
   - Shows current status updates (narrative events)

4. **Maturation & Payout**
   - On maturation day, receive journal entry with outcome
   - LLM generates narrative result based on risk roll
   - Wealth automatically updated
   - New investment opportunity becomes available

---

## 🎨 UI Design

### Investments Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│  💼 Investment Opportunities                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Active Investments (2/3)                                   │
│  ┌───────────────────────────────────────────────────┐    │
│  │ 🏔️ Silver Mine Consortium             🔴 High Risk│    │
│  │ Invested: 150 reales | 4 days remaining           │    │
│  │ [████████░░] 80% complete                          │    │
│  │ "Reports indicate a promising new vein..."        │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │ ⛪ Church Bond                          🟢 No Risk │    │
│  │ Invested: 50 reales | 1 day remaining             │    │
│  │ [█████████░] 90% complete                          │    │
│  │ Guaranteed return: 57 reales                       │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  Available Opportunities                                    │
│  ┌───────────────────────────────────────────────────┐    │
│  │ 🚢 Manila Galleon Trade                🟡 Med Risk│    │
│  │ Cost: 200 reales | 35-40 days                     │    │
│  │ Return: 200-250% (400-500 reales)                 │    │
│  │ Requires: Bookkeeping 7, Languages 3              │    │
│  │                            [Invest →] [Details ℹ️] │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  💡 Your Investment Limit: 3 active | Available: 1         │
└─────────────────────────────────────────────────────────────┘
```

### Investment Detail Modal

```
┌─────────────────────────────────────────────────────────────┐
│  🚢 Manila Galleon Trade Investment                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "The annual Manila Galleon will depart Acapulco in 3      │
│  weeks, carrying silk, porcelain, and spices from the      │
│  Philippines. Investors can purchase cargo space and       │
│  share in the profits upon arrival."                        │
│                                                             │
│  Investment Details:                                        │
│  • Capital Required: 200 reales                            │
│  • Duration: 35-40 days                                    │
│  • Risk Level: Medium 🟡                                   │
│                                                             │
│  Possible Outcomes:                                        │
│  ✅ Successful Voyage (75%): 400-500 reales                │
│  ⚠️ Storm Damage (20%): 160 reales                         │
│  ❌ Pirate Attack (5%): Total loss                         │
│                                                             │
│  Requirements:                                             │
│  ✅ Bookkeeping Level 7                                    │
│  ❌ Languages (Chinese/Tagalog) Level 3 [You have 1]      │
│                                                             │
│  Your Wealth: 450 reales                                   │
│                                                             │
│  [Cancel]                    [Invest 200 Reales →]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Integration with Existing Systems

### 1. **Skill System Integration**
- **Bookkeeping**: Unlocks investment tiers
  - Level 3: Church Bonds
  - Level 5: Basic investments (Cacao, Syndicate)
  - Level 7: Advanced investments (Galleon, Real Estate)
  - Level 10: Mining consortium
- **Languages**: Bonus returns for Galleon trade
- **Etiquette**: Better Real Estate deals
- **Herbalism**: Better Cacao returns (knows crop care)

### 2. **Reputation System Integration**
- **Merchants Faction**: Unlocks better investment opportunities
- **Church Faction**: Better bond rates
- **Nobles Faction**: Access to Real Estate ventures
- **Crown Faction**: Access to official monopolies (future expansion)

### 3. **Narrative Integration**
- LLM generates outcome narratives based on risk roll
- Random events can affect investments:
  - "A storm damaged the Manila Galleon - partial losses expected"
  - "The Church thanks you for your faithful support" (bond maturation)
  - "Your silver mine has struck a rich vein!" (windfall)
- NPCs can offer investment tips in conversation
- Failed investments create story moments (not just number loss)

### 4. **Time System Integration**
- Investments advance with game time (`gameState.date`)
- Check for maturation on each turn
- Different durations create strategic choices:
  - Quick returns (Church bonds, Syndicate) vs
  - Long-term gains (Galleon, Mining)

### 5. **Economy Integration**
- Investment returns affect `currentWealth`
- Log transactions via `transactionManager`
- Category: `TRANSACTION_CATEGORIES.INVESTMENTS`
- Awards XP when investments mature (Bookkeeping skill)

---

## ⚙️ Implementation Plan

### Phase 1: Core Data Structure
**Files to Create**:
- `src/features/commerce/data/investmentTypes.js` - Investment definitions
- `src/features/commerce/utils/investmentCalculator.js` - Return calculations and risk rolls

**Data Structure**:
```javascript
const INVESTMENT_TYPES = {
  SILVER_MINING: {
    id: 'silver_mining',
    name: 'Silver Mining Consortium',
    emoji: '🏔️',
    description: 'Purchase shares in silver mining operations',
    costRange: [50, 200],
    durationDays: [7, 14],
    riskLevel: 'high',
    outcomes: [
      { chance: 0.10, return: 0.00, label: 'Mine Collapse' },
      { chance: 0.15, return: 0.50, label: 'Labor Disputes' },
      { chance: 0.60, return: 1.60, label: 'Normal Operation' },
      { chance: 0.15, return: 3.00, label: 'Rich Vein Discovered' }
    ],
    requirements: {
      bookkeeping: 5,
      reputation: { faction: 'merchants', min: 60 }
    }
  },
  // ... other types
};
```

### Phase 2: Investment State Management
**Add to `useTradeState` hook**:
```javascript
const [activeInvestments, setActiveInvestments] = useState([]);
// Each investment: { id, type, amount, startDate, maturityDate, status }
```

**Add to `gameState.js`**:
```javascript
investments: [], // Persisted active investments
investmentHistory: [] // Completed investments for stats
```

### Phase 3: Investment Tab Component
**Create**: `src/features/commerce/components/InvestmentsTab.jsx`

**Features**:
- Display active investments with progress bars
- Show available opportunities
- Filter by risk level
- Investment detail modal
- Invest button with validation

### Phase 4: Investment Logic Service
**Create**: `src/features/commerce/services/investmentService.js`

**Functions**:
- `getAvailableInvestments(playerSkills, reputation, date)` - Filter based on unlocks
- `processInvestment(type, amount, gameState)` - Deduct wealth, create investment
- `checkMatureInvestments(investments, currentDate)` - Return matured investments
- `calculateOutcome(investment, playerSkills)` - Roll for result with LLM narrative

### Phase 5: LLM Integration
**Create**: `src/features/commerce/prompts/investmentPrompts.js`

**Prompt for Outcome Generation**:
```javascript
export function getInvestmentOutcomePrompt(investment, outcome) {
  return `
    You are generating the outcome for an investment in 1680 Mexico City.

    Investment Type: ${investment.type}
    Amount Invested: ${investment.amount} reales
    Duration: ${investment.duration} days
    Outcome: ${outcome.label} (${outcome.return}x return)

    Generate a brief (2-3 sentences) historically accurate narrative explaining
    what happened with this investment. Make it immersive and specific to the
    colonial Mexican context.

    Examples:
    - "The silver mine consortium reports that a new vein has been discovered..."
    - "Pirates intercepted the Manila Galleon off the coast of California..."
    - "The cacao harvest suffered from unseasonable rains..."

    Keep it concise but flavorful.
  `;
}
```

### Phase 6: Time Integration
**Modify**: `src/core/state/gameState.js`

**Add daily investment check**:
```javascript
export function advanceTime(hours) {
  // ... existing code ...

  // Check if date changed (new day)
  if (newDate !== currentDate) {
    checkInvestmentMaturity(newDate);
  }
}

function checkInvestmentMaturity(currentDate) {
  const { activeInvestments } = gameState;
  const matured = activeInvestments.filter(inv =>
    isDateAfter(currentDate, inv.maturityDate)
  );

  matured.forEach(investment => {
    const outcome = calculateOutcome(investment);
    const narrative = generateOutcomeNarrative(investment, outcome);

    // Update wealth
    handleWealthChange(currentWealth + outcome.payout);

    // Add journal entry
    addJournalEntry(narrative);

    // Award XP
    awardSkillXP('bookkeeping', 5);

    // Move to history
    moveInvestmentToHistory(investment, outcome);
  });
}
```

### Phase 7: UI Polish
- Add animations for investment progress bars
- Color-coded risk indicators
- Tooltips explaining requirements
- Sound effects for maturation (optional)
- Investment history/stats panel

---

## 🎮 Gameplay Balance

### Capital Requirements vs Returns
- **Low tier** (20-100 reales): Accessible early game, modest returns
- **Mid tier** (100-200 reales): Mid-game wealth building
- **High tier** (200-400 reales): Late-game high risk/reward

### Time Balance
- **Short term** (3-7 days): Frequent engagement, lower returns
- **Medium term** (10-20 days): Strategic planning
- **Long term** (30-45 days): Major commitment, big payoffs

### Risk Balance
- **No Risk**: Always available but minimal returns (105-115%)
- **Low Risk**: Safe wealth growth (110-125%)
- **Medium Risk**: Good expected value but variance (130-250%)
- **High Risk**: Gambler's choice (0% or 300%)

### Investment Limit
- Maximum **3 active investments** at once
- Forces strategic choices
- Prevents passive wealth accumulation exploits
- Can increase with Bookkeeping mastery (Level 15 = 4 slots, Level 20 = 5 slots)

---

## 📊 Success Metrics

**Player should feel**:
- Excitement when investments mature
- Strategic tension choosing investments
- Narrative immersion from LLM-generated outcomes
- Rewarded for skill investment in Bookkeeping

**Avoid**:
- Passive income farming (hence investment limits)
- Required grinding (church bonds always available)
- Confusing mechanics (clear risk/reward labels)
- Disconnection from main gameplay (apothecary syndicate ties in)

---

## 🚀 Future Expansions (Post-MVP)

1. **Partnership Investments**: Invest with specific NPCs who offer unique deals
2. **Compound Interest**: Reinvest returns automatically
3. **Investment Events**: Random events that affect all active investments
4. **Smuggling Ventures**: High-risk black market investments (requires Criminal faction)
5. **Medical Supply Chain**: Invest in ingredient importation (gets you rare materia medica)
6. **Guild Shares**: Buy into the Apothecary Guild itself (unlock benefits)

---

## 📝 Implementation Checklist

### Minimum Viable Product (MVP)
- [ ] Define 6 core investment types in data file
- [ ] Create investment calculator utility
- [ ] Add investments state to gameState
- [ ] Build InvestmentsTab component
- [ ] Implement investment processing logic
- [ ] Add daily maturity checks
- [ ] Create LLM outcome generator
- [ ] Add investment transaction logging
- [ ] Award Bookkeeping XP on outcomes
- [ ] Test with various skill/reputation levels

### Polish Pass
- [ ] Add progress bar animations
- [ ] Create investment detail modal
- [ ] Add tooltips for locked investments
- [ ] Implement investment history panel
- [ ] Add statistics (total invested, total returned, best/worst outcomes)
- [ ] Balance test with playtesting
- [ ] Add sound effects (optional)
- [ ] Write investment tutorial (first time guide)

### Integration Testing
- [ ] Test with existing save files
- [ ] Test time advancement edge cases
- [ ] Test multiple simultaneous investments
- [ ] Test reputation/skill requirement gates
- [ ] Test wealth overflow scenarios
- [ ] Test LLM generation for all outcome types

---

**Estimated Implementation Time**: 8-12 hours
**Priority**: Medium (nice-to-have feature, not core gameplay)
**Dependencies**: Bookkeeping skill system (✅ exists), Transaction manager (✅ exists)
