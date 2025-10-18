# NPC Commerce System - Visual Mockups

## 1. Sale Opportunity Card (Narrative Panel)

### Light Mode
```
╔═════════════════════════════════════════════════════════╗
║  💰 SALE OPPORTUNITY                                    ║
╠═════════════════════════════════════════════════════════╣
║                                                         ║
║  ╭────────╮  Neighbor Juan Pérez                       ║
║  │ [👤]   │  Middle-aged criollo, Merchant             ║
║  │Portrait│                                             ║
║  ╰────────╯                                             ║
║                                                         ║
║  Wants to Buy:                                          ║
║  • 🍫 Chocolate (2-3 pieces) ⭐⭐⭐⭐⭐               ║
║  • 🌰 Cinnamon (any amount)   ⭐⭐⭐                 ║
║                                                         ║
║  Offering: 12-15 reales per piece                       ║
║  Urgency: 🔥🔥 Moderate                                ║
║                                                         ║
║  ┌─────────────────────────────────────────────────┐   ║
║  │ "I need chocolate for my daughter's wedding     │   ║
║  │  gift. Can you help me find quality pieces?"    │   ║
║  └─────────────────────────────────────────────────┘   ║
║                                                         ║
║  ┌──────────────┐  ┌──────────────┐                   ║
║  │ OPEN TRADE   │  │  NOT NOW     │                   ║
║  │   [enter]    │  │    [esc]     │                   ║
║  └──────────────┘  └──────────────┘                   ║
║                                                         ║
║  Offer expires in 5 turns                               ║
╚═════════════════════════════════════════════════════════╝
```

### Dark Mode
```
╔═════════════════════════════════════════════════════════╗
║  💰 SALE OPPORTUNITY                     [🌙 Dark Mode] ║
╠═════════════════════════════════════════════════════════╣
║                                                         ║
║  ╭────────╮  Neighbor Juan Pérez                       ║
║  │ [👤]   │  Middle-aged criollo, Merchant             ║
║  │Portrait│  Relationship: 😊 Friendly                 ║
║  ╰────────╯                                             ║
║                                                         ║
║  Wants to Buy:                                          ║
║  ┌─────────────────────────────────────────────────┐   ║
║  │ 🍫 Chocolate (2-3 pieces)                       │   ║
║  │ Interest: ⭐⭐⭐⭐⭐ VERY HIGH                  │   ║
║  │ Fair Price: 10-12 reales ea                     │   ║
║  └─────────────────────────────────────────────────┘   ║
║  ┌─────────────────────────────────────────────────┐   ║
║  │ 🌰 Cinnamon (any amount)                        │   ║
║  │ Interest: ⭐⭐⭐ MODERATE                        │   ║
║  └─────────────────────────────────────────────────┘   ║
║                                                         ║
║  💬 Context: Wedding gift for daughter                  ║
║  ⏰ Expires: Turn 55 (5 turns remaining)                ║
║                                                         ║
║  ╔═══════════════╗  ╔═══════════════╗                  ║
║  ║ 🤝 OPEN TRADE ║  ║ ❌ DECLINE    ║                  ║
║  ╚═══════════════╝  ╚═══════════════╝                  ║
╚═════════════════════════════════════════════════════════╝
```

---

## 2. Trade Modal - NPC Sell Tab (Detailed)

```
╔═══════════════════════════════════════════════════════════════════════╗
║  🤝 TRADING WITH NEIGHBOR JUAN PÉREZ                          [X Close] ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌─────────────────┐  ┌─────────────────┐                           ║
║  │  BUY FROM JUAN  │  │ ▶ SELL TO JUAN  │  [Active Tab]             ║
║  └─────────────────┘  └─────────────────┘                           ║
║                                                                       ║
║  ╔═══════════════════════════════════════════════════════════════╗   ║
║  ║  YOUR INVENTORY                                               ║   ║
║  ║  (Drag items below to propose sale)                           ║   ║
║  ╠═══════════════════════════════════════════════════════════════╣   ║
║  ║                                                               ║   ║
║  ║  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ ║   ║
║  ║  │  🍫    │  │  🌰    │  │  🧪    │  │  📜    │  │  🌿    │ ║   ║
║  ║  │Choco-  │  │Cinna-  │  │Tinc-   │  │Parch-  │  │Pepper- │ ║   ║
║  ║  │late    │  │mon     │  │ture    │  │ment    │  │mint    │ ║   ║
║  ║  │        │  │        │  │        │  │        │  │        │ ║   ║
║  ║  │Qty: 5  │  │Qty: 12 │  │Qty: 3  │  │Qty: 8  │  │Qty: 15 │ ║   ║
║  ║  │3ℝ ea   │  │2ℝ ea   │  │6ℝ ea   │  │1ℝ ea   │  │1ℝ ea   │ ║   ║
║  ║  │⭐⭐⭐⭐⭐│  │⭐⭐⭐   │  │⭐      │  │⭐      │  │⭐⭐    │ ║   ║
║  ║  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘ ║   ║
║  ║                                                               ║   ║
║  ╚═══════════════════════════════════════════════════════════════╝   ║
║                                                                       ║
║  ╔═══════════════════════════════════════════════════════════════╗   ║
║  ║  PROPOSED SALE                                                ║   ║
║  ╠═══════════════════════════════════════════════════════════════╣   ║
║  ║                                                               ║   ║
║  ║  [Drag items here or click items above]                      ║   ║
║  ║                                                               ║   ║
║  ║  ┌──────────────────────────────────────────────────────┐    ║   ║
║  ║  │ 🍫 Chocolate x3                          [Remove ×]  │    ║   ║
║  ║  │                                                      │    ║   ║
║  ║  │ Your Asking Price:  [9] reales  (3ℝ each)           │    ║   ║
║  ║  │                     └─┬─┘                            │    ║   ║
║  ║  │                       ↓                              │    ║   ║
║  ║  │ Juan's Interest:    ⭐⭐⭐⭐⭐ VERY HIGH             │    ║   ║
║  ║  │ Suggested Price:    10-15 reales                     │    ║   ║
║  ║  │ AI Prediction:      💚 Likely to accept             │    ║   ║
║  ║  │                     💛 Might counter: ~12 reales     │    ║   ║
║  ║  │                                                      │    ║   ║
║  ║  │ ┌────────────────────────────────────────────────┐  │    ║   ║
║  ║  │ │ 💡 TIP: Juan mentioned needing this for a     │  │    ║   ║
║  ║  │ │    wedding gift. He might pay extra for       │  │    ║   ║
║  ║  │ │    quality pieces. Consider asking 12-13ℝ ea. │  │    ║   ║
║  ║  │ └────────────────────────────────────────────────┘  │    ║   ║
║  ║  └──────────────────────────────────────────────────────┘    ║   ║
║  ║                                                               ║   ║
║  ║  + Add Another Item                                           ║   ║
║  ║                                                               ║   ║
║  ╚═══════════════════════════════════════════════════════════════╝   ║
║                                                                       ║
║  ╔═══════════════════════════════════════════════════════════════╗   ║
║  ║  TRANSACTION SUMMARY                                          ║   ║
║  ╠═══════════════════════════════════════════════════════════════╣   ║
║  ║  Total Items:      3                                          ║   ║
║  ║  Total Asking:     9 reales                                   ║   ║
║  ║  Your Profit:      +3 reales (from 6ℝ cost)                  ║   ║
║  ║  Relationship:     😊 Friendly → 😊 (No change expected)     ║   ║
║  ╚═══════════════════════════════════════════════════════════════╝   ║
║                                                                       ║
║  ┌─────────────────────┐  ┌─────────────────────┐                   ║
║  │  💰 PROPOSE SALE    │  │     CANCEL          │                   ║
║  │     [Enter]         │  │     [Esc]           │                   ║
║  └─────────────────────┘  └─────────────────────┘                   ║
║                                                                       ║
║  ════════════════════════════════════════════════════════════════   ║
║  📊 TRADE HISTORY WITH JUAN                                          ║
║  • Aug 20, 1680: Sold 2 chocolate for 8ℝ ✅ Accepted                ║
║  • Aug 18, 1680: Bought copper pot for 8ℝ ✅ Good deal              ║
║  • Aug 15, 1680: Sold cinnamon for 6ℝ ✅ Accepted                   ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 3. Trade Modal - Buy from NPC Tab

```
╔═══════════════════════════════════════════════════════════════════════╗
║  🤝 TRADING WITH MERCHANT ALONSO DE MENDOZA                  [X Close] ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌─────────────────────┐  ┌─────────────────┐                       ║
║  │ ▶ BUY FROM ALONSO   │  │  SELL TO ALONSO │  [Active Tab]         ║
║  └─────────────────────┘  └─────────────────┘                       ║
║                                                                       ║
║  ╔═══════════════════════════════════════════════════════════════╗   ║
║  ║  ALONSO'S INVENTORY                                           ║   ║
║  ╠═══════════════════════════════════════════════════════════════╣   ║
║  ║                                                               ║   ║
║  ║  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             ║   ║
║  ║  │  ⚗️    │  │  🧪    │  │  📚    │  │  🔬    │             ║   ║
║  ║  │Alembic │  │Glass   │  │Medical │  │Brass   │             ║   ║
║  ║  │        │  │Vials   │  │Codex   │  │Scales  │             ║   ║
║  ║  │        │  │        │  │        │  │        │             ║   ║
║  ║  │Qty: 1  │  │Qty: 20 │  │Qty: 1  │  │Qty: 1  │             ║   ║
║  ║  │25ℝ ea  │  │3ℝ ea   │  │40ℝ ea  │  │15ℝ ea  │             ║   ║
║  ║  │Quality │  │Common  │  │Rare    │  │Fine    │             ║   ║
║  ║  └────────┘  └────────┘  └────────┘  └────────┘             ║   ║
║  ║                                                               ║   ║
║  ╚═══════════════════════════════════════════════════════════════╝   ║
║                                                                       ║
║  ╔═══════════════════════════════════════════════════════════════╗   ║
║  ║  YOUR PURCHASE OFFER                                          ║   ║
║  ╠═══════════════════════════════════════════════════════════════╣   ║
║  ║                                                               ║   ║
║  ║  Selected Item:                                               ║   ║
║  ║  ┌──────────────────────────────────────────────────────┐    ║   ║
║  ║  │ 🧪 Glass Vials x5                                    │    ║   ║
║  ║  │                                                      │    ║   ║
║  ║  │ Alonso's Price:  15 reales (3ℝ each)                │    ║   ║
║  ║  │ Fair Market:     15 reales                           │    ║   ║
║  ║  │ Assessment:      ✓ Fair price                        │    ║   ║
║  ║  └──────────────────────────────────────────────────────┘    ║   ║
║  ║                                                               ║   ║
║  ║  ┌────────────────────────────────────────────────────┐      ║   ║
║  ║  │ PAYMENT OPTIONS:                                   │      ║   ║
║  ║  │                                                    │      ║   ║
║  ║  │ ○ Cash Only:         15 reales                     │      ║   ║
║  ║  │   Your Wealth: 42ℝ → 27ℝ after purchase           │      ║   ║
║  ║  │                                                    │      ║   ║
║  ║  │ ● Cash + Barter:     8ℝ + items (~7ℝ value)       │      ║   ║
║  ║  │   Offer:   [🍫 Chocolate x2] + [🌰 Cinnamon x3]   │      ║   ║
║  ║  │   Value:   6ℝ + 6ℝ = ~12ℝ                         │      ║   ║
║  ║  │   + Cash:  8ℝ                                      │      ║   ║
║  ║  │   Total:   ~20ℝ value                              │      ║   ║
║  ║  │                                                    │      ║   ║
║  ║  │   💡 Overpaying by ~5ℝ might improve relations    │      ║   ║
║  ║  │                                                    │      ║   ║
║  ║  │ ○ Barter Only:       Items worth ~15ℝ             │      ║   ║
║  ║  │   [Add items to match value]                       │      ║   ║
║  ║  └────────────────────────────────────────────────────┘      ║   ║
║  ║                                                               ║   ║
║  ║  Alonso's likely response: 😊 Will probably accept            ║   ║
║  ║                                                               ║   ║
║  ╚═══════════════════════════════════════════════════════════════╝   ║
║                                                                       ║
║  ┌─────────────────────┐  ┌─────────────────────┐                   ║
║  │  🛒 BUY NOW         │  │     CANCEL          │                   ║
║  │     [Enter]         │  │     [Esc]           │                   ║
║  └─────────────────────┘  └─────────────────────┘                   ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 4. Trade Outcome Modal (Success)

```
╔═══════════════════════════════════════════════════════════════╗
║  ✨ TRADE SUCCESSFUL!                                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ╭────────╮                                                   ║
║  │ [😊]   │  Juan Pérez accepted your offer!                 ║
║  ╰────────╯                                                   ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │ "Excellent! This chocolate is perfect for my       │     ║
║  │  daughter's wedding. You've done me a great favor, │     ║
║  │  Maria. I'll remember this kindness."              │     ║
║  └─────────────────────────────────────────────────────┘     ║
║                                                               ║
║  ╔═══════════════════════════════════════════════════════╗   ║
║  ║  TRANSACTION DETAILS                                  ║   ║
║  ╠═══════════════════════════════════════════════════════╣   ║
║  ║  Sold:      🍫 Chocolate x3                           ║   ║
║  ║  Price:     12 reales (4ℝ each)                       ║   ║
║  ║  Profit:    +6 reales                                 ║   ║
║  ║                                                       ║   ║
║  ║  Wealth:    34ℝ → 46ℝ                                ║   ║
║  ║  Relation:  😊 Friendly → 😄 Very Friendly (+2)      ║   ║
║  ║  Rep:       Fair Dealer +1                            ║   ║
║  ╚═══════════════════════════════════════════════════════╝   ║
║                                                               ║
║  📝 Added to Journal:                                         ║
║  "Sold 3 chocolate pieces to Juan Pérez for 12 reales.       ║
║   He was very pleased with the transaction."                  ║
║                                                               ║
║  ┌──────────────────┐                                         ║
║  │    CONTINUE      │                                         ║
║  │     [Enter]      │                                         ║
║  └──────────────────┘                                         ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 5. Trade Outcome Modal (Counter-Offer)

```
╔═══════════════════════════════════════════════════════════════╗
║  🤔 COUNTER-OFFER                                             ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ╭────────╮                                                   ║
║  │ [🤨]   │  Juan Pérez wants to negotiate                   ║
║  ╰────────╯                                                   ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │ "Maria, I appreciate the offer, but 9 reales is    │     ║
║  │  too low for such fine chocolate. I can offer      │     ║
║  │  11 reales for all three pieces. Deal?"            │     ║
║  └─────────────────────────────────────────────────────┘     ║
║                                                               ║
║  ╔═══════════════════════════════════════════════════════╗   ║
║  ║  OFFER COMPARISON                                     ║   ║
║  ╠═══════════════════════════════════════════════════════╣   ║
║  ║  Your Ask:       9 reales  (3ℝ each)                 ║   ║
║  ║  Juan's Offer:  11 reales  (3.67ℝ each)  ↑ +2ℝ      ║   ║
║  ║  Market Value:  12 reales  (4ℝ each)                 ║   ║
║  ║                                                       ║   ║
║  ║  Assessment: Fair compromise                          ║   ║
║  ╚═══════════════════════════════════════════════════════╝   ║
║                                                               ║
║  ┌────────────────────┐  ┌────────────────────┐             ║
║  │  ✓ ACCEPT (11ℝ)    │  │  ✗ DECLINE         │             ║
║  │    [Enter]          │  │    [Esc]           │             ║
║  └────────────────────┘  └────────────────────┘             ║
║                                                               ║
║  ┌────────────────────────────────────────────────────┐     ║
║  │ 💬 Or make a counter-counter-offer:                │     ║
║  │    New Price: [__] reales                          │     ║
║  │    [Propose]                                       │     ║
║  └────────────────────────────────────────────────────┘     ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 6. Trade Outcome Modal (Declined)

```
╔═══════════════════════════════════════════════════════════════╗
║  ❌ TRADE DECLINED                                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ╭────────╮                                                   ║
║  │ [😐]   │  Juan Pérez declined your offer                  ║
║  ╰────────╯                                                   ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐     ║
║  │ "I'm sorry, Maria, but that price is too high for  │     ║
║  │  me right now. Perhaps another time when I have     │     ║
║  │  more funds."                                       │     ║
║  └─────────────────────────────────────────────────────┘     ║
║                                                               ║
║  ╔═══════════════════════════════════════════════════════╗   ║
║  ║  OUTCOME                                              ║   ║
║  ╠═══════════════════════════════════════════════════════╣   ║
║  ║  Items Retained:  🍫 Chocolate x3                     ║   ║
║  ║  Wealth:          No change                           ║   ║
║  ║  Relationship:    😊 Friendly (No change)             ║   ║
║  ║                                                       ║   ║
║  ║  💡 Tip: Juan might accept a lower price             ║   ║
║  ╚═══════════════════════════════════════════════════════╝   ║
║                                                               ║
║  ┌────────────────────┐  ┌────────────────────┐             ║
║  │  TRY AGAIN         │  │     CLOSE          │             ║
║  │  (Lower Price)     │  │     [Esc]          │             ║
║  └────────────────────┘  └────────────────────┘             ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 7. Action Panel - Trade Button States

### State A: At Market
```
┌────────────────────┐
│ 🏪 TRADE           │
│ Visit Market       │  ← Tooltip: "Buy and sell at the market"
└────────────────────┘
```

### State B: NPC Present
```
┌────────────────────┐
│ 🤝 TRADE           │
│ With Juan Pérez    │  ← Tooltip: "Propose a trade with Juan"
└────────────────────┘
```

### State C: Trade Opportunity Active
```
┌────────────────────┐
│ 💰 TRADE           │  ← Pulsing amber glow
│ Opportunity! (1)   │  ← Badge shows count
└────────────────────┘
```

### State D: No Trade Available
```
┌────────────────────┐
│ 🚫 TRADE           │  ← Grayed out
│ No one nearby      │
└────────────────────┘
```

---

## 8. Mobile View Adaptations

### Sale Opportunity Card (Mobile)
```
╔══════════════════════════════╗
║  💰 SALE                     ║
╠══════════════════════════════╣
║  Juan Pérez                  ║
║  Wants: 🍫 Chocolate         ║
║  Paying: 12-15ℝ each         ║
║                              ║
║  ┌──────────┐ ┌──────────┐  ║
║  │  TRADE   │ │ DECLINE  │  ║
║  └──────────┘ └──────────┘  ║
╚══════════════════════════════╝
```

---

## Color Palette

### Commerce Theme
- **Primary**: Amber/Gold `#f59e0b` (Dark: `#fbbf24`)
- **Success**: Emerald `#10b57d` (Dark: `#34d399`)
- **Decline**: Red `#ef4444` (Dark: `#f87171`)
- **Neutral**: Slate `#64748b` (Dark: `#94a3b8`)
- **Border**: `rgba(251, 191, 36, 0.3)` (Dark: `0.4`)

### Interest Levels
- ⭐ Low: `#94a3b8`
- ⭐⭐⭐ Moderate: `#fbbf24`
- ⭐⭐⭐⭐⭐ High: `#f59e0b`

### NPC Reactions
- 😊 Friendly: Green tint
- 😐 Neutral: Gray tint
- 🤨 Skeptical: Yellow tint
- 😠 Unfriendly: Red tint

---

## Animation States

### Card Entrance
```
Frame 1: opacity: 0,    translateX: 20px
Frame 2: opacity: 0.5,  translateX: 10px
Frame 3: opacity: 1,    translateX: 0px
Duration: 400ms, easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Interest Pulse
```
Frame 1: scale: 1
Frame 2: scale: 1.05
Frame 3: scale: 1
Duration: 1500ms, infinite
```

### Trade Success
```
Frame 1: Confetti burst from center
Frame 2: Card scale: 1.02, glow
Frame 3: Fade to normal
Duration: 600ms
```

---

## Keyboard Shortcuts

- `T` - Open trade modal (if available)
- `Enter` - Accept/Propose in modal
- `Esc` - Close modal/Decline
- `Tab` - Switch between tabs
- `1-9` - Select item by number
- `+/-` - Adjust quantity
- `Ctrl+Enter` - Quick propose (skip confirmation)
