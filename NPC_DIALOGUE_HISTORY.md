# NPC Dialogue History Feature

## Overview
The NPC Modal now includes a fully functional **Dialogue History** tab that tracks all conversations Maria has had with each NPC throughout the game.

## Implementation

### 1. Dialogue Extraction Utility (`src/utils/dialogueExtractor.js`)

**Key Functions**:

- `extractDialogueFromText(text)` - Parses narrative text for markdown bold patterns: `**"dialogue"**`
- `extractNPCDialogue(conversationHistory, npcName)` - Extracts all dialogue exchanges for a specific NPC
- `groupDialogueIntoSessions(dialogueExchanges)` - Groups dialogue into conversation sessions (consecutive turns)
- `getDialogueStats(dialogueExchanges)` - Calculates statistics (total exchanges, words, locations)

**How It Works**:
1. Scans conversation history for assistant responses (narrative text)
2. Searches for `**"quoted text"**` patterns (LLM-generated dialogue)
3. Checks if NPC name appears near the dialogue
4. Extracts dialogue with context (turn number, date, time, location, player action)
5. Groups consecutive turns into conversation sessions (gap > 5 turns = new session)

### 2. NPCModal Redesign (`src/features/modals/NPCModal.jsx`)

**Improvements**:
- **Larger typography**: `text-5xl` for names, `text-4xl` for headers, `text-lg` for descriptions
- **Fixed height**: `h-[90vh]` for consistency with PlayerCharacterModal
- **Better spacing**: `p-8`, `space-y-8` for generous whitespace
- **4 tabs**: Overview, Personality, Biography, **Dialogue** (new!)
- **Enhanced visuals**: Larger portrait (72x72), better section cards, improved personality charts

**Dialogue Tab Features**:
- **Empty state**: Friendly message when no conversations yet
- **Statistics bar**: 4 metrics (Exchanges, Words Spoken, Conversations, Locations)
- **Session grouping**: Conversations separated by session dividers
- **Rich exchange cards**:
  - Turn number, date, time, location metadata
  - Player's action shown in indigo card
  - NPC's dialogue in purple card with avatar
  - Hover effects and smooth transitions
- **Full dark mode support**: All colors adapt to light/dark themes

### 3. Data Flow

```
conversationHistory (GamePage state)
  ↓
GameModals component
  ↓
NPCModal component
  ↓
extractNPCDialogue(conversationHistory, npcName)
  ↓
groupDialogueIntoSessions(dialogueExchanges)
  ↓
Render dialogue in tab with statistics
```

## Usage

**For Players**:
1. Click on an NPC name in the narrative (highlighted in green)
2. NPC Modal opens
3. Click the "Dialogue" tab (shows badge with conversation count)
4. View full conversation history with Maria's actions and NPC's responses

**For Developers**:
- Dialogue extraction is automatic - no manual tracking needed
- Works with any LLM-generated dialogue using `**"quoted text"**` format
- Statistics update in real-time as conversations happen
- Session grouping prevents overwhelming long lists

## Features

### Statistics Dashboard
- **Exchanges**: Total number of dialogue utterances
- **Words Spoken**: Total word count across all dialogue
- **Conversations**: Number of distinct conversation sessions
- **Locations**: Unique locations where conversations occurred

### Conversation Sessions
- Automatically groups consecutive turns (gap < 5 turns)
- Shows session number (e.g., "Conversation 1", "Conversation 2")
- Elegant dividers between sessions

### Exchange Cards
- **Metadata bar**: Turn number, date, time, location
- **Player action**: Shows what Maria said/did (in blue-indigo theme)
- **NPC response**: Shows dialogue with avatar (in purple theme)
- **Hover effects**: Cards lift slightly on hover
- **Responsive**: Works on mobile and desktop

## Technical Details

### Dialogue Pattern Matching
```javascript
// Matches: **"Hello"** **"Hello!"** **"Hello?"** **"Hello,"**
const dialoguePattern = /\*\*"([^"]+)"\*\*/g;
```

### NPC Attribution
The extractor looks for:
1. Name + verb: "Isabel says," "Maria responds,"
2. Name + colon: "Isabel: **"dialogue"**"
3. Name before dialogue: "Isabel looked worried **"dialogue"**"

### Session Grouping Logic
- Gap ≤ 5 turns: Same session
- Gap > 5 turns: New session
- Prevents long gaps (e.g., 50 turns between encounters) from grouping unrelated conversations

## Future Enhancements

Potential additions (not yet implemented):
- **Search/filter**: Search dialogue by keyword or date range
- **Export**: Download conversation history as text/JSON
- **Sentiment analysis**: Color-code exchanges by mood (friendly, hostile, neutral)
- **Relationship tracking**: Show how exchanges affected relationship score
- **Context snippets**: Show more surrounding narrative on click

## Testing

To test the feature:
1. Start a new game or load existing save
2. Talk to NPCs (ensure dialogue uses `**"quoted text"**` format)
3. Click NPC name to open modal
4. Check "Dialogue" tab shows conversations
5. Verify statistics are accurate
6. Test with multiple NPCs to ensure filtering works

## Files Modified

- **NEW**: `src/utils/dialogueExtractor.js` - Extraction logic
- **MODIFIED**: `src/features/modals/NPCModal.jsx` - Added dialogue tab, improved design
- **MODIFIED**: `src/pages/components/GameModals.jsx` - Pass conversationHistory prop

## Performance

- **Memoized**: All extraction/grouping operations use React.useMemo
- **Efficient patterns**: Regex compiled once, minimal string operations
- **Lazy rendering**: Only renders dialogue tab when active
- **No impact on game loop**: Extraction happens only when modal opens

---

**Status**: ✅ Fully Implemented & Functional
**Last Updated**: November 3, 2024
