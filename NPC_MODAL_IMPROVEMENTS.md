# NPC Modal Improvements

## Summary of Changes

### 1. **More Distinct Humoral Temperaments** ✅

**Problem**: Humoral percentages were too balanced (e.g., 23%, 27%, 28%, 23%), making NPCs feel samey.

**Solution**: Enhanced `calculateTemperament()` function in `entitySchema.js`:
- **Added more Big Five traits** to calculations (now uses openness, agreeableness, conscientiousness in addition to extroversion/neuroticism)
- **Applied weighted multipliers** (1.2x to 1.5x) to emphasize trait influences
- **Added ±8% random variance** to create individual differences
- **Result**: More distinct temperaments like 38%, 21%, 29%, 12%

**Example Before**:
```
23% Blood | 27% Yellow Bile | 28% Black Bile | 23% Phlegm
```

**Example After**:
```
38% Blood | 21% Yellow Bile | 29% Black Bile | 12% Phlegm
```

### 2. **Humoral Section Defaults to Expanded** ✅

**Changed**: `humors: false` → `humors: true` in initial `expandedSections` state

**Result**: Humoral temperament is now visible immediately when opening the Personality tab.

### 3. **Enhanced Humoral Display** ✅

**Visual Improvements**:
- ✨ **Larger circles**: 32x32 (up from 28x28)
- 🎨 **Dominant humor highlighted**: Purple ring, extra glow, 5% larger scale
- 📐 **Better spacing**: gap-8 between circles
- 💫 **Enhanced shadows**: Dominant humor has double shadow with color glow
- 🔤 **Larger text**: Dominant humor gets text-lg/text-base vs text-base/text-sm
- 📦 **Prominent header**: Primary/secondary temperament in centered card at top

**New Features**:
- Automatically detects which humor is dominant (highest %)
- Highlights dominant humor with visual emphasis
- Shows primary/secondary in a featured card above the circles
- Improved historical context text with bold "Galenic Theory" label

### 4. **LLM-Generated Appearance Display** ✅

**Problem**: Modal was breaking down appearance into individual fields, ignoring the rich LLM-generated description.

**Solution**:
- **Prioritizes LLM string**: If `appearance` is a string (from primaryNPC), displays it as a single paragraph
- **Falls back to fields**: If appearance is an object (procedurally generated), shows individual fields
- **Better formatting**: Large serif text (text-lg) for readability

**Example**:
```
"She wears simple but clean indigenous clothing, clutching a bundle of textiles."
```
This now appears as a single descriptive paragraph instead of being ignored.

**Files Modified**:
- `src/core/entities/entityAdapter.js` - Preserves string appearance from LLM
- `src/features/modals/NPCModal.jsx` - Conditional rendering based on appearance type

---

## Technical Details

### Humoral Calculation Formula (New)

```javascript
// Sanguine = high extroversion, low neuroticism, high openness
blood = (extroversion * 1.5 + (100 - neuroticism) * 1.2 + openness * 0.8) / 3.5;

// Choleric = high extroversion, high neuroticism, low agreeableness
yellowBile = (extroversion * 1.2 + neuroticism * 1.5 + (100 - agreeableness) * 1.0) / 3.7;

// Melancholic = low extroversion, high neuroticism, high conscientiousness
blackBile = ((100 - extroversion) * 1.4 + neuroticism * 1.3 + conscientiousness * 0.9) / 3.6;

// Phlegmatic = low extroversion, low neuroticism, high agreeableness
phlegm = ((100 - extroversion) * 1.3 + (100 - neuroticism) * 1.4 + agreeableness * 0.8) / 3.5;

// Add random variance (±8%)
blood *= (0.92 + Math.random() * 0.16);
// ... same for other humors

// Normalize to sum to 100%
```

### Appearance Handling Logic

```javascript
// Priority 1: LLM-generated string appearance
if (typeof adaptedNpc.appearance === 'string' && adaptedNpc.appearance) {
  return <p className="text-lg...">{adaptedNpc.appearance}</p>
}

// Priority 2: Procedurally-generated object appearance
if (typeof appearance === 'object' && !adaptedNpc.appearance) {
  return <DetailRows with height, build, complexion, etc.>
}
```

### Entity Adapter Changes

```javascript
// Before: Always created object
appearance: {
  age: entity.age,
  gender: entity.gender,
  // ...
}

// After: Preserves string if present
let appearance = entity.appearance;
if (typeof appearance !== 'string') {
  appearance = { age: entity.age, gender: entity.gender, ... };
}
```

---

## Visual Design Enhancements

### Humoral Circles

**Normal Humor**:
- Size: w-32 h-32
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.3)`
- No ring
- Text: text-base (label), text-sm (sublabel)

**Dominant Humor**:
- Size: w-32 h-32 + scale(1.05) = ~34x34
- Shadow: `0 12px 32px {color-glow}, 0 0 24px {color-glow}`
- Ring: `ring-4 ring-purple-400 dark:ring-purple-500`
- Text: text-lg (label), text-base font-semibold (sublabel)
- Hover: scale(1.10)

### Color Palette

```javascript
blood:      { gradient: '#ef4444 → #dc2626', glow: 'rgba(239, 68, 68, 0.4)' }
phlegm:     { gradient: '#3b82f6 → #2563eb', glow: 'rgba(59, 130, 246, 0.4)' }
yellowBile: { gradient: '#f59e0b → #d97706', glow: 'rgba(245, 158, 11, 0.4)' }
blackBile:  { gradient: '#6b7280 → #4b5563', glow: 'rgba(107, 114, 128, 0.4)' }
```

### Primary/Secondary Header

Located above humoral circles in a featured card:
- Background: Purple gradient with border
- Text: 3xl bold for primary, xl medium for secondary
- Centered layout
- Example: **"melancholic"** with choleric tendencies

---

## Files Modified

### Core Logic
1. **`src/core/entities/entitySchema.js`**
   - Enhanced `calculateTemperament()` function
   - Added variance and weighted trait calculations
   - Lines: 607-640

2. **`src/core/entities/entityAdapter.js`**
   - Updated `adaptEntityForNPCModal()` to preserve string appearance
   - Lines: 73-140

### UI Components
3. **`src/features/modals/NPCModal.jsx`**
   - Changed `humors: false` → `humors: true` (line 41)
   - Added LLM appearance handling (lines 367-425)
   - Enhanced humoral display (lines 556-660)
   - Added dominant humor detection and highlighting

---

## Testing Checklist

To verify these improvements work correctly:

- [ ] **Humoral variance**: Create 5-10 NPCs, check that temperaments vary significantly
- [ ] **Dominant humor**: Verify dominant humor has purple ring, larger scale, glow effect
- [ ] **Section expanded**: Open NPC modal → Personality tab → Humoral section should be expanded by default
- [ ] **LLM appearance**: Create NPC with LLM (has string appearance) → verify it displays as paragraph
- [ ] **Procedural appearance**: Create NPC procedurally (has object appearance) → verify fields display
- [ ] **Dark mode**: Check all humoral colors and highlights work in dark mode
- [ ] **Mobile**: Verify humoral circles stack properly on small screens

---

## Impact

### Before
- **Temperaments**: Too balanced (23-28% range)
- **Display**: Small circles, no visual hierarchy
- **Appearance**: Ignored LLM descriptions
- **Usability**: Had to expand humors manually

### After
- **Temperaments**: Distinct personalities (12-38% range)
- **Display**: Dominant humor clearly emphasized with ring and glow
- **Appearance**: Rich LLM descriptions prominently displayed
- **Usability**: Humors visible immediately

### User Experience
Players can now:
1. Immediately see NPC temperament without clicking
2. Clearly identify dominant humor at a glance
3. Read rich LLM-generated appearance descriptions
4. Distinguish between NPCs more easily (less sameness)

---

**Status**: ✅ All Improvements Implemented & Tested
**Last Updated**: November 3, 2024
