# EntityList Data Quality Scripts

Scripts for validating and cleaning data in `src/EntityList.js`.

## Overview

The EntityList contains 148 game entities (NPCs, patients, locations, items, animals). Over time, data quality issues crept in:
- Inconsistent gender capitalization (`Male` vs `male`)
- Typos in casta values (`Pensinsular` instead of `Peninsular`)
- Missing file extensions on images (`sirrobertsouthwell` → `sirrobertsouthwell.jpg`)

These scripts automate validation and cleaning to maintain data quality.

---

## Scripts

### 1. `validateEntityList.js`

**Purpose:** Scans EntityList.js and reports data quality issues.

**Usage:**
```bash
node scripts/validateEntityList.js
```

**Checks for:**
- ❌ **Gender capitalization** - `Male`/`Female` should be lowercase
- ❌ **Casta typos** - Known misspellings (e.g., `Pensinsular` → `Peninsular`)
- ❌ **Missing image extensions** - Images must end in `.jpg`, `.png`, etc.
- ⚠️ **Invalid casta values** - Values not in the standard casta list (warnings only)
- ⚠️ **Invalid class values** - Values not in the standard class list (warnings only)

**Output:**
```
=== EntityList Data Validator ===

Validating 148 entities...

❌ Gender Capitalization Issues: 26
   Gonzalo de Loanda: "Male" → "male"
   ...

❌ Missing Image Extensions: 132
   Sir Robert Southwell: "sirrobertsouthwell" → "sirrobertsouthwell.jpg"
   ...

--- Summary ---
Total entities validated: 148
Critical issues found: 159
Warnings: 27
```

---

### 2. `cleanEntityList.js`

**Purpose:** Automatically fixes data quality issues in EntityList.js.

**Usage:**
```bash
# Dry run (preview changes without modifying)
node scripts/cleanEntityList.js --dry-run

# Apply changes
node scripts/cleanEntityList.js
```

**What it fixes:**
1. **Gender capitalization** - Converts `Male` → `male`, `Female` → `female`
2. **Casta typos** - Fixes known misspellings using TYPO_MAP
3. **Image extensions** - Adds `.jpg` to images missing extensions

**Safety features:**
- Creates `EntityList.backup.js` before modifying
- Can run in `--dry-run` mode to preview changes
- Reports exact count of changes made

**Output:**
```
=== EntityList Data Cleaner ===

--- Changes to be made ---
✓ Gender capitalization fixes: 26
✓ Casta typo fixes: 1
✓ Image extension additions: 132
  Total changes: 159

✓ Backup created: /path/to/EntityList.backup.js
✓ EntityList.js has been cleaned!
```

---

## Workflow

### Initial Cleanup (One-Time)
1. **Validate** - Find all issues
   ```bash
   node scripts/validateEntityList.js
   ```

2. **Preview fixes** - Dry run to see what will change
   ```bash
   node scripts/cleanEntityList.js --dry-run
   ```

3. **Apply fixes** - Clean the data
   ```bash
   node scripts/cleanEntityList.js
   ```

4. **Verify** - Confirm issues are resolved
   ```bash
   node scripts/validateEntityList.js
   ```

5. **Test** - Run the game to ensure nothing broke
   ```bash
   npm start
   ```

6. **Commit** - Save the changes
   ```bash
   git add src/EntityList.js
   git commit -m "Clean EntityList data: fix gender capitalization, casta typos, and image extensions"
   ```

### Ongoing Maintenance
Run the validation script periodically when adding new entities:

```bash
node scripts/validateEntityList.js
```

If issues are found, run the cleaner:

```bash
node scripts/cleanEntityList.js
```

---

## Results (After Cleanup)

**Before:**
- Critical issues: **159**
  - Gender capitalization: 26
  - Casta typos: 1
  - Missing image extensions: 132

**After:**
- Critical issues: **0** ✅
- Warnings: 27 (edge cases like animals, special entries)

All 148 entities now have:
- ✅ Lowercase gender values (`male`/`female`)
- ✅ Correct casta spellings
- ✅ Proper image extensions (`.jpg`)

---

## Configuration

### Adding New Typo Fixes

Edit `cleanEntityList.js` and add to `TYPO_MAP`:

```javascript
const TYPO_MAP = {
  'Pensinsular': 'Peninsular',
  'YourTypo': 'CorrectSpelling',  // Add new mappings here
};
```

### Adding Valid Casta Values

Edit `validateEntityList.js` and add to `VALID_CASTAS`:

```javascript
const VALID_CASTAS = [
  'español', 'española', 'peninsular',
  'your-new-value',  // Add new valid values here
  // ...
];
```

### Adding Valid Class Values

Edit `validateEntityList.js` and add to `VALID_CLASSES`:

```javascript
const VALID_CLASSES = [
  'elite', 'upper class', 'nobility',
  'your-new-class',  // Add new valid values here
  // ...
];
```

---

## Troubleshooting

### Script fails with "Unexpected token 'export'"

**Problem:** Node.js can't parse ES6 module syntax.

**Solution:** Scripts use text parsing (regex) instead of `require()`. If you see this error, the regex pattern in `validateEntityList.js` may need updating.

### "Could not parse EntityList.js"

**Problem:** EntityList.js structure changed and regex can't find the array.

**Solution:** Update the regex in `validateEntityList.js`:
```javascript
const match = entityListContent.match(/const EntityList = (\[[\s\S]*?\]);/);
```

### Changes not taking effect

**Problem:** Script created backup but didn't modify the original.

**Solution:**
1. Check if `EntityList.backup.js` exists
2. Verify you didn't run with `--dry-run` flag
3. Check file permissions

### Need to restore backup

**Problem:** Cleaning broke something.

**Solution:**
```bash
cp src/EntityList.backup.js src/EntityList.js
npm start  # Test that game works
```

---

## Technical Details

### How Validation Works

1. Reads `EntityList.js` as text
2. Extracts the array using regex: `/const EntityList = (\[[\s\S]*?\]);/`
3. Parses JSON using `eval()` (safe because source is trusted)
4. Iterates through all 148 entities
5. Checks each field against validation rules
6. Reports issues grouped by type

### How Cleaning Works

1. Reads `EntityList.js` as text
2. Uses regex find-and-replace to fix issues:
   - `/"gender": "(Male|Female)"/g` → lowercase
   - `/Pensinsular/g` → `Peninsular`
   - `/"image": "([^"]+?)"/g` → add `.jpg` if missing
3. Creates backup: `EntityList.backup.js`
4. Writes cleaned content back to `EntityList.js`
5. Preserves all formatting (whitespace, comments, etc.)

### Why Not Use JSON.parse()?

EntityList.js is JavaScript (not JSON), so:
- It uses `const EntityList = [...]` syntax
- Keys may not be quoted (e.g., `gender:` instead of `"gender":`)
- It exports the array (`export default EntityList`)

Using regex on text preserves the original formatting and syntax.

---

## Future Improvements

### Potential Enhancements
- [ ] Add validation for required fields (name, entityType, etc.)
- [ ] Check for duplicate entity names
- [ ] Validate that referenced images exist in `/public/portraits/`
- [ ] Lint for inconsistent formatting (tabs vs spaces)
- [ ] Auto-format entities with Prettier
- [ ] Add unit tests for validation rules

### Suggestions Welcome
If you find new data quality issues, add validation rules to these scripts!

---

**Last Updated:** October 12, 2025
**Maintained By:** Development Team
**Scripts Version:** 1.0
