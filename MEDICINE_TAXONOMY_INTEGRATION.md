# Medicine Taxonomy System - Integration Plan

## Overview

A comprehensive, historically-grounded medicine categorization system for Apothecary Simulator. The taxonomy classifies medicines into 6 primary types based on early modern pharmaceutical practice (16th-18th century).

**Files Created:**
- `/src/core/config/medicineCategories.js` - Core taxonomy schema
- `/src/components/MedicineTypeBadge.jsx` - Reusable UI component
- Medicine type integration into Ledger Modal Categories tab

---

## Medicine Types

### 1. 🌿 Simples (Green #22c55e)
**Single-ingredient natural medicines**
- Examples: Chamomile, Mandrake Root, Sulfur, Unicorn Horn
- Historical: Foundation of Galenic medicine; kept in apothecary jars
- Gameplay: Most common, low-medium value, easy to source

### 2. ⚗️ Compounds (Purple #8b5cf6)
**Multi-ingredient preparations**
- Examples: Theriac, Mithridatum, Oxymel, Electuary
- Historical: Complex recipes with 10-60+ ingredients
- Gameplay: High value, requires crafting skill, time-consuming

### 3. 🚢 Indies Drugs (Amber #f59e0b)
**Exotic imports from trade routes**
- Examples: Quina (Cinchona), Cacao, Tobacco, Cinnamon, Dragon's Blood
- Historical: "Drug of the Indies" trade made fortunes
- Gameplay: High value, limited availability, fluctuating prices

### 4. 🔬 Alchemical (Red #ef4444)
**Chemically prepared medicines**
- Examples: Aqua Vitae, Sal Ammoniac, Magistery of Pearl
- Historical: Paracelsian "spagyric" medicine (16th c.)
- Gameplay: Requires special equipment/skills, powerful effects

### 5. 🍲 Medicinal Foods (Pink #ec4899)
**Dietary medicines**
- Examples: Barley Water, Possets, Julep, Caudle
- Historical: The "non-naturals" (diet, air, exercise) were key to Galenic health
- Gameplay: Low value, restorative properties, widely available

### 6. 🦴 Animal Products (Purple-light #a855f7)
**Processed animal-derived medicines**
- Examples: Bezoar Stone, Mummy Powder, Viper's Flesh, Cantharides
- Historical: Exotic animal parts highly valued; bezoars cost fortunes
- Gameplay: Rare, high value, unique properties

---

## Integration Points

### ✅ **1. ItemModal (COMPLETED)**

**Status**: Implemented
**File**: `/src/features/modals/ItemModal.jsx`

**Features:**
- Medicine type badge **inline on same line as medicine name** in header
- Hover tooltip with:
  - Type name and emoji
  - Description
  - Historical context
  - Examples
- Colored border matching medicine type
- Smooth hover effects with glow
- Positioned next to title, not in inventory list

**Layout:**
```jsx
<div className="flex items-center gap-3">
  <h1>{item.name}</h1>
  <MedicineTypeBadge
    item={item}
    size="medium"
    position="inline"
    showTooltip={true}
  />
</div>
```

**Note:** The badge appears in the **ItemModal detail view**, NOT in the inventory tab/list. When you click an item to see its details, the badge shows inline with the name.

---

### ✅ **2. Ledger Modal - Categories Tab (COMPLETED)**

**Status**: Implemented
**File**: `/src/features/commerce/components/LedgerModal.jsx`

**Features:**
- Medicine sales broken down by type (not generic categories)
- Beautiful card grid showing:
  - Total sales per type
  - Number of transactions
  - Historical context
  - Hover effects with colored glows
- Summary footer with total medicine sales

**Impact:**
- Players can see which medicine types are most profitable
- Educational: Learn about historical medicine categories
- Strategic: Identify which types to focus on

---

### 🔲 **3. Buy Interface** (PENDING)

**Target File**: `/src/features/commerce/Buy.js`

**Proposed Features:**

#### Filter by Medicine Type
- Dropdown/tab selector for medicine types
- Color-coded category headers
- "All Types" default view

#### Visual Indicators
- Small inline badges next to item names
- Color-coded borders around item cards
- Type emoji in item list

#### Sorting Options
- "Sort by: Type" option
- Group medicines by category
- Show type counts (e.g., "Simples (12)")

**Implementation:**
```jsx
// Example filter state
const [selectedType, setSelectedType] = useState('all');

// Filter items
const filteredItems = items.filter(item => {
  if (selectedType === 'all') return true;
  const medicineType = inferMedicineType(item);
  return medicineType === selectedType;
});

// Display with badge
<MedicineTypeBadge
  item={item}
  size="small"
  position="inline"
  showTooltip={false}
/>
```

---

### 🔲 **4. Inventory Display** (PENDING)

**Target Files**:
- `/src/features/inventory/InventoryPane.js`
- `/src/components/LeftSidebar/InventoryTab.jsx`

**Proposed Features:**

#### Group by Type
- Collapsible sections per medicine type
- Count badges (e.g., "Simples (5)")
- Color-coded section headers

#### Type Filter Buttons
- Quick filter buttons at top
- All | Simples | Compounds | Indies | Alchemical | Foods | Animal
- Active filter highlighted

#### Visual Indicators
- **NO inline badges in the inventory list itself** (keeps UI clean)
- Colored dots or subtle borders on inventory item cards
- Group headers show type emoji and color
- Medicine type revealed when clicking item (opens ItemModal with badge)

#### Search Enhancement
- Search within specific type
- "Type: simples" search operator

**Note:** We intentionally avoid cluttering the inventory list with badges. The type is shown prominently in the **ItemModal** when you click an item, while the inventory list stays clean with just grouping/filtering.

**Implementation:**
```jsx
// Group items by medicine type
const groupedItems = useMemo(() => {
  const groups = {};
  getAllMedicineTypes().forEach(type => {
    groups[type.id] = [];
  });

  inventory.forEach(item => {
    const typeId = inferMedicineType(item);
    if (groups[typeId]) {
      groups[typeId].push(item);
    }
  });

  return groups;
}, [inventory]);
```

---

### 🔲 **5. Mixing/Crafting Interface** (PENDING)

**Target File**: `/src/features/crafting/Mixing.js`

**Proposed Features:**

#### Ingredient Type Display
- Show medicine type for each ingredient
- Color-coded ingredient slots
- Type badge on ingredient cards

#### Result Prediction
- Preview what type of medicine you're creating
- "Mixing Simples → creates Simple or Compound"
- Large badge showing result type

#### Type-Based Hints
- "Adding an Indies Drug increases value by 50%"
- "Alchemical compounds require distillation"
- Historical accuracy tooltips

#### Filter Ingredients by Type
- Quick filter: "Show only Simples"
- Useful for finding specific ingredients
- Color-coded categories

**Implementation:**
```jsx
// Show result type
const resultType = useMemo(() => {
  if (ingredients.length === 1) return 'simples';
  if (ingredients.some(i => inferMedicineType(i) === 'alchemical')) {
    return 'alchemical';
  }
  return 'compounds';
}, [ingredients]);

<div className="result-preview">
  <h3>Creating:</h3>
  <MedicineTypeBadge
    item={{ medicineType: resultType, name: 'Result' }}
    size="large"
    position="standalone"
  />
</div>
```

---

### 🔲 **6. Prescribing Interface** (PENDING)

**Target File**: `/src/features/medical/PrescribePopup.js`

**Proposed Features:**

#### Filter Medicines by Type
- Filter dropdown in prescribe modal
- "Show only Simples" for simple ailments
- "Show only Compounds" for complex cases

#### Type Recommendations
- AI suggests medicine type based on condition
- "For fever, try Simples or Medicinal Foods"
- Historical medical theory integration

#### Visual Indicators
- Type badges on prescription options
- Color-coded sections
- Tooltips explaining why certain types work

**Implementation:**
```jsx
// Filter in prescribe popup
const [typeFilter, setTypeFilter] = useState('all');

const filteredMedicines = inventory.filter(item => {
  if (typeFilter === 'all') return true;
  return inferMedicineType(item) === typeFilter;
});

// Recommendation system
const recommendedTypes = useMemo(() => {
  if (patient.medical.symptoms.includes('fever')) {
    return ['simples', 'medicinal_foods'];
  }
  if (patient.medical.urgency === 'critical') {
    return ['compounds', 'alchemical'];
  }
  return ['all'];
}, [patient]);
```

---

### 🔲 **7. Transaction System** (PENDING)

**Target File**: `/src/features/commerce/TransactionManager.js`

**Proposed Features:**

#### Store Medicine Type in Transactions
- Add `medicineType` field to transactions
- Infer at point of sale
- Persist in transaction history

#### Enhanced Ledger Categorization
- Automatic categorization by type
- Better analytics
- Historical tracking

**Implementation:**
```javascript
// Enhanced transaction recording
recordTransaction(type, amount, description, item) {
  const medicineType = item ? inferMedicineType(item) : null;

  const transaction = {
    id: generateId(),
    type,
    amount,
    description,
    category: this.inferCategory(description, type),
    medicineType, // NEW FIELD
    item: item?.name,
    date: gameState.date,
    turnNumber: gameState.turnNumber
  };

  this.transactions.push(transaction);
}
```

---

### 🔲 **8. NPC Commerce** (PENDING)

**Target Files**:
- `/src/features/modals/NPCModal.jsx`
- NPC trading interfaces

**Proposed Features:**

#### NPC Preferences
- NPCs prefer certain medicine types
- "Dona Clara seeks Indies Drugs"
- "The Friar wants Simples for the poor"

#### Type-Based Pricing
- NPCs pay more for rare types
- Merchants haggle based on type
- Quest rewards vary by type

#### Dialogue Integration
- NPCs comment on medicine types
- Historical flavor text
- Educational content

---

### 🔲 **9. Quest System** (PENDING)

**Target File**: `/src/features/narrative/Quest.js`

**Proposed Features:**

#### Type-Specific Quests
- "Bring me 3 Alchemical medicines"
- "Find a rare Indies Drug"
- "Create a Compound for the Viceroy"

#### Quest Rewards Based on Type
- Harder types = better rewards
- Unlock advanced types
- Reputation bonuses for exotic types

---

### 🔲 **10. Tutorial/Help System** (PENDING)

**Proposed Features:**

#### Medicine Type Encyclopedia
- In-game reference
- Historical context for each type
- Examples with images

#### Contextual Tooltips
- First-time user sees medicine types explained
- Progressive disclosure
- Historical accuracy notes

#### Learning Progression
- Start with Simples
- Unlock Compounds at Level 2
- Indies Drugs through trade quests
- Alchemical via special training

---

## Data Migration Strategy

### For Existing Items

**Option 1: Automatic Inference** (Recommended)
```javascript
// In entityAdapter.js or similar
export function ensureMedicineType(item) {
  if (!item.medicineType) {
    item.medicineType = inferMedicineType(item);
  }
  return item;
}
```

**Option 2: Manual Tagging**
- Add `medicineType` field to item definitions
- Update `/src/scenarios/1680-mexico-city/config.js`
- Tag all starting inventory items

### For New Items

All new items should include `medicineType`:
```javascript
{
  name: 'Chamomile',
  medicineType: 'simples', // REQUIRED
  itemType: 'materia_medica',
  // ... other fields
}
```

---

## Styling Guidelines

### Colors (Consistent Across All UIs)

```javascript
const MEDICINE_COLORS = {
  simples: '#22c55e',        // green
  compounds: '#8b5cf6',      // purple
  indies_drugs: '#f59e0b',   // amber
  alchemical: '#ef4444',     // red
  foods: '#ec4899',          // pink
  animal_products: '#a855f7' // purple-light
};
```

### Badge Sizes

- **Small**: Inventory lists, inline mentions (`size="small"`)
- **Medium**: Item modals, prominent displays (`size="medium"`)
- **Large**: Crafting results, feature highlights (`size="large"`)

### Hover Effects

- Subtle glow on hover (matching type color)
- Scale up slightly (1.05x)
- Smooth transitions (200ms)
- Tooltip appears after 100ms delay

---

## Testing Checklist

### Phase 1: Core Components
- [x] MedicineTypeBadge component renders correctly
- [x] Tooltip appears/disappears on hover
- [x] All 6 medicine types display with correct colors
- [x] ItemModal shows badge in correct position
- [x] Ledger Categories tab groups by medicine type

### Phase 2: Commerce Integration
- [ ] Buy interface filters by medicine type
- [ ] Inventory groups items by type
- [ ] Mixing interface shows ingredient types
- [ ] Prescribing interface filters by type
- [ ] Transaction system records medicine types

### Phase 3: Gameplay Integration
- [ ] NPCs react to medicine types
- [ ] Quests reference medicine types
- [ ] Tutorial explains medicine types
- [ ] Historical accuracy validated

### Phase 4: Polish
- [ ] All tooltips are informative
- [ ] Colors are consistent across all UIs
- [ ] Dark mode works correctly
- [ ] Animations are smooth
- [ ] Performance is acceptable (< 100ms render)

---

## Performance Considerations

### Optimization Strategies

1. **Memoization**: Cache `inferMedicineType()` results
```javascript
const medicineTypeCache = new Map();

export function inferMedicineTypeCached(item) {
  const key = item.id || item.name;
  if (!medicineTypeCache.has(key)) {
    medicineTypeCache.set(key, inferMedicineType(item));
  }
  return medicineTypeCache.get(key);
}
```

2. **Lazy Loading**: Only show badges when needed
3. **Batch Processing**: Group type inference for inventory lists
4. **React.memo**: Memoize MedicineTypeBadge component

---

## Future Enhancements

### Multi-Scenario Support

The taxonomy is designed to work across all scenarios:

- **1680 Mexico City**: All 6 types (current)
- **1880 London**: Add "Synthetic Drugs" category (aspirin, aniline dyes)
- **1940 NYC**: Add "Antibiotics" and "Pharmaceuticals" categories
- **Custom Scenarios**: Users can define new types

### Advanced Features

1. **Type Combinations**: Track compound ingredient types
2. **Rarity Scoring**: Dynamic pricing based on type rarity
3. **Market Trends**: Type-based supply/demand simulation
4. **NPC Specializations**: NPCs who only trade certain types
5. **Type-Based Skills**: Unlock proficiency per medicine type

---

## Historical Accuracy Notes

### Sources Consulted

- Galenic humoral theory (Galen, 2nd century)
- Paracelsian medicine (Paracelsus, 16th century)
- *London Dispensatory* (1618)
- *Pharmacopoeia Londinensis* (1677)
- Luís Gomes Ferreira's *Erário Mineral* (1735)

### Key Historical Principles

1. **Simples vs. Compounds**: Fundamental distinction in early modern pharmacy
2. **Galenic Qualities**: Hot/Cold, Wet/Dry (could be added as secondary tags)
3. **Exotic Imports**: Indies drugs were luxury items, often monopolized
4. **Alchemical Tradition**: Paracelsus challenged Galenic orthodoxy
5. **Dietary Medicine**: The six "non-naturals" were key to health
6. **Animal Parts**: Bezoar stones, mummy powder were real (and expensive)

---

## Developer Notes

### Adding a New Medicine Type

1. Update `/src/core/config/medicineCategories.js`:
```javascript
export const MEDICINE_TYPES = {
  // ... existing types
  NEW_TYPE: {
    id: 'new_type',
    name: 'New Type',
    description: 'Description here',
    emoji: '🔥',
    color: '#hexcode',
    examples: ['Example 1', 'Example 2'],
    historicalContext: 'Historical note'
  }
};
```

2. Update `inferMedicineType()` function with detection logic
3. Test in ItemModal, Ledger, and other integrated UIs
4. Add to documentation

### Troubleshooting

**Badge not appearing?**
- Check that item has `medicineType` field or can be inferred
- Verify `inferMedicineType()` logic
- Check console for errors

**Colors look wrong?**
- Verify dark mode detection (`document.documentElement.classList.contains('dark')`)
- Check color hex codes in `medicineCategories.js`
- Test in both light and dark modes

**Tooltip not showing?**
- Check `showTooltip` prop is `true`
- Verify CSS z-index (should be 50+)
- Check for parent `overflow: hidden` conflicts

---

## Conclusion

The Medicine Taxonomy System provides a historically-grounded, gameplay-relevant categorization system that enhances:

1. **Education**: Players learn about early modern pharmacy
2. **Strategy**: Different types have different values and uses
3. **Immersion**: Historical accuracy and period flavor
4. **Organization**: Better inventory management and UI clarity
5. **Gameplay Depth**: Quests, NPC preferences, market dynamics

**Next Steps**: Implement pending integrations (Buy, Inventory, Mixing, etc.) according to priority and development roadmap.

---

**Last Updated**: October 18, 2025
**Version**: 1.0
**Status**: Phase 1 Complete (ItemModal + Ledger)
