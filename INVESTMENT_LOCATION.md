# Investment System - Location Integration

## El Consulado de Mercaderes

The investment system is now accessible exclusively through a physical location in 1680s Mexico City: **El Consulado de Mercaderes** (The Merchants' Guild Hall).

### Historical Context

The Consulado de Mercaderes was the real financial center of colonial Mexico City, established in 1594. This was where:
- Merchants formed trading partnerships
- Investment contracts were drawn up and notarized
- Shares in Manila galleon voyages were sold
- Mining consortiums were organized
- Commercial disputes were adjudicated

### Location Details

**Map Position**: East of the Plaza Mayor, adjacent to the Palacio Virreinal
- **Exterior Map**: Added to `mexicoCityCenter.js` at coordinates [1120, 610] - [1270, 730]
- **Interior Map**: `consuladoInterior.js` with 4 rooms and interactive furniture
- **Year Built**: 1594 (historically accurate)

### Interior Layout

The Consulado features four distinct areas:

1. **Vestibule** - Entrance hall with the official seal of the Consulado
2. **Exchange Hall** - Main gathering space for merchants
   - Central negotiation table
   - Benches for discussions
   - Investment notice board 📋
   - Public ledger desk
3. **Contract Office** - Where investments are formally recorded
   - **Escribano's (Notary's) Desk** 📝 - Primary interaction point
   - Document cabinet with contracts
   - Official seating for the escribano
4. **Private Chamber** - For confidential high-value negotiations
   - Private negotiation table
   - Secure meeting space

### How to Access Investments

**Requirements:**
1. **Bookkeeping Skill Level 5+** - Understanding of financial ledgers
2. **Physical Presence** - Must be inside El Consulado interior

**Accessing the Location:**
1. Travel to Mexico City Center (exterior map)
2. Enter El Consulado de Mercaderes (building east of Plaza Mayor)
3. Once inside, open the Trade interface (Buy/Sell command)
4. The **Investments** tab will be unlocked if you have Bookkeeping 5+

**Helpful Tooltips:**
- If locked due to low skill: "Requires Bookkeeping Level 5+"
- If locked due to location: "Visit El Consulado de Mercaderes to make investments"

### Interactive Elements

Two furniture items trigger the investment interface:

1. **Investment Board** (in Exchange Hall)
   - Wooden board displaying investment opportunities
   - Label: "Review Investment Opportunities"

2. **Escribano's Desk** (in Contract Office)
   - Where contracts are formally recorded
   - Label: "Speak with the Escribano about Investments"

### Game Design Philosophy

This location-based system adds:
- **Immersion**: Investments feel grounded in the historical world
- **Exploration**: Encourages players to discover and use the city
- **Realism**: Mirrors how colonial financial transactions actually worked
- **Gameplay depth**: Physical travel becomes part of economic strategy

### Player Experience

A typical investment session:
1. Player earns money through apothecary business
2. Reaches Bookkeeping Level 5 by managing finances
3. Hears about El Consulado through dialogue or exploration
4. Travels to the building near the Plaza Mayor
5. Enters and approaches the escribano's desk
6. Reviews available opportunities (Church Bonds, Manila Galleon shares, etc.)
7. Makes investment based on risk tolerance and available capital
8. Returns periodically to check progress or make new investments
9. Receives automatic payouts when investments mature

### Files Modified/Created

**Created:**
- `src/scenarios/1680-mexico-city/maps/consuladoInterior.js` - Interior map definition

**Modified:**
- `src/scenarios/1680-mexico-city/maps/mexicoCityCenter.js` - Added El Consulado building
- `src/scenarios/1680-mexico-city/maps/index.js` - Exported consulado-interior map
- `src/features/commerce/components/TradeModal.jsx` - Location-based access control

### Technical Implementation

**Location Check Logic** (TradeModal.jsx:603-605):
```javascript
const hasBookkeepingSkill = (playerSkills?.knownSkills?.bookkeeping?.level || 0) >= 5;
const isAtConsulado = gameState?.currentMapId === 'consulado-interior';
const hasInvestmentAccess = hasBookkeepingSkill && isAtConsulado;
```

This ensures the Investments tab only appears when both conditions are met.

### Future Enhancements

Potential additions:
- NPC escribano (notary) who explains investments to new players
- Ambient NPCs discussing deals in the Exchange Hall
- Quest storyline involving a risky investment opportunity
- Reputation effects from successful/failed investments
- Time-of-day variations (busier during business hours)
- Special investment opportunities only available at certain times

---

**Historical Accuracy**: The Consulado de Mercaderes was a real institution that served exactly this function in colonial Mexico City. The building, interior layout, and investment types are all grounded in historical research.
