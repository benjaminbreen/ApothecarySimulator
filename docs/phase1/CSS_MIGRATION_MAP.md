# CSS Migration Map - Phase 1 Audit

**Date**: October 10, 2025
**Status**: Complete
**Total CSS**: 10,049 lines across 25 files

---

## Overview

This document maps every CSS file to its Tailwind equivalent, providing a clear conversion strategy for Phases 2-4.

---

## CSS File Inventory

| File | Lines | Priority | Phase | Complexity | Notes |
|---|---|---|---|---|---|
| `App.css` | 1,657 | HIGH | 4 | Complex | Global styles, typography, layout |
| `Quest.css` | 828 | HIGH | 3 | Complex | Custom animations, backdrop blur |
| `Mixing.css` | 635 | HIGH | 3 | Complex | Drag-drop styling, glowing effects |
| `GameIntro.css` | 631 | MEDIUM | 3 | Medium | Modal with animations |
| `Popup.css` | 595 | MEDIUM | 3 | Medium | Generic modal styles |
| `PrescribePopup.css` | 588 | HIGH | 3 | Complex | Form styling, modal |
| `Symptoms.css` | 529 | MEDIUM | 3 | Medium | List styling, icons |
| `PortraitSection.css` | 531 | HIGH | 4 | Medium | Image styling, captions |
| `Inventory.css` | 460 | MEDIUM | 3 | Medium | Grid layout, cards |
| `Map.css` | 366 | HIGH | 4 | Complex | SVG styling, interactive |
| `Buy.css` | 359 | MEDIUM | 3 | Medium | Table, form, filters |
| `index.css` | 343 | LOW | 4 | Simple | Global resets, fonts |
| `HomePage.css` | 315 | LOW | 2 | Simple | Landing page layout |
| `ScenarioSelector.css` | 235 | LOW | 2 | Simple | Card grid |
| `WealthTracker.css` | 208 | LOW | 2 | Simple | Stat display |
| `CommonplaceBook.css` | 205 | LOW | 2 | Simple | Book-like layout |
| `CounterNarrative.css` | 191 | LOW | 2 | Simple | Text layout |
| `Sleep.css` | 176 | MEDIUM | 3 | Medium | Dream display, modal |
| `LoadingIndicator.css` | 160 | LOW | 2 | Simple | Spinner animations |
| Others (6 files) | <150 each | LOW | 2 | Simple | Various utilities |

---

## Phase 2: Non-Critical Components (12 files, ~1,800 lines)

### LoadingIndicator.css (160 lines)

**Current CSS Patterns:**
```css
.loading-dots {
  display: flex;
  gap: 8px;
}
.loading-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #16a34a;
  animation: bounce 1.4s infinite ease-in-out;
}
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```

**Tailwind Equivalent:**
```jsx
<div className="flex gap-2">
  <span className="w-3 h-3 rounded-full bg-botanical-600 animate-bounce"
        style={{ animationDelay: '0ms' }} />
  <span className="w-3 h-3 rounded-full bg-botanical-600 animate-bounce"
        style={{ animationDelay: '200ms' }} />
  <span className="w-3 h-3 rounded-full bg-botanical-600 animate-bounce"
        style={{ animationDelay: '400ms' }} />
</div>
```

**Migration Notes:**
- Use Tailwind's built-in `animate-bounce`
- Stagger delays with inline styles
- No custom keyframes needed

---

### WealthTracker.css (208 lines)

**Current CSS Patterns:**
```css
.wealth-container {
  background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.wealth-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #92400e;
}
```

**Tailwind Equivalent:**
```jsx
<div className="bg-gradient-to-br from-warning-100 to-warning-400 p-4 rounded-xl shadow-elevation-2">
  <span className="text-2xl font-bold text-warning-800">
    {wealth} reales
  </span>
</div>
```

**Migration Notes:**
- Use `bg-gradient-to-br` for gradients
- Map colors to warning palette (already in tailwind.config)
- Use elevation shadows from design system

---

### NotificationPopup.css

**Current CSS Patterns:**
```css
.notification-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-left: 4px solid #10b981;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}
```

**Tailwind Equivalent:**
```jsx
<div className="fixed top-5 right-5 bg-white border-l-4 border-success-500 px-4 py-3 rounded-lg shadow-elevation-3 animate-slide-in">
  {message}
</div>
```

**Migration Notes:**
- Use `fixed` positioning
- `border-l-4` for accent border
- Add `animate-slide-in` to tailwind.config (already exists)

---

## Phase 3: Modals & Dialogs (10 files, ~4,300 lines)

### PrescribePopup.css (588 lines) - COMPLEX

**Current CSS Patterns:**
```css
.prescribe-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  padding: 24px;
  max-width: 600px;
  z-index: 1000;
}
.prescribe-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}
```

**Tailwind Equivalent:**
```jsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
     onClick={onClose} />

{/* Modal */}
<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                bg-white dark:bg-ink-900 rounded-xl shadow-elevation-4
                p-6 max-w-2xl w-full z-[1000]">
  {/* Modal content */}
</div>
```

**Form Elements:**
```css
/* Current */
.prescribe-form input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}
.prescribe-form input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
```

**Tailwind (with @tailwindcss/forms plugin):**
```jsx
<input
  type="text"
  className="w-full px-3 py-2 border border-ink-200 dark:border-ink-700
             rounded-md text-sm focus:outline-none focus:ring-2
             focus:ring-botanical-500 focus:border-botanical-500
             bg-white dark:bg-ink-800 text-ink-900 dark:text-parchment-50"
/>
```

**Migration Notes:**
- Use `@tailwindcss/forms` plugin for consistent form styling
- Add dark mode classes for all inputs
- Preserve focus states with `focus:ring-2`
- Modal z-index: use `z-[999]` and `z-[1000]` for custom values

---

### Mixing.css (635 lines) - COMPLEX

**Current CSS Patterns:**
```css
.mixing-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
}
.method-square {
  border: 2px solid #8b7355;
  background: linear-gradient(135deg, #f5f5dc 0%, #d4c5a9 100%);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.method-square:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}
```

**Tailwind Equivalent:**
```jsx
{/* Fullscreen overlay */}
<div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1000]">
  {/* Content */}
</div>

{/* Method square */}
<div className="border-2 border-brass-600 bg-gradient-to-br from-parchment-100 to-parchment-300
                transition-all duration-400 hover:scale-105 hover:shadow-elevation-3">
  {/* Method content */}
</div>
```

**Drag & Drop Styling:**
```css
/* Current */
.drop-zone {
  min-height: 120px;
  border: 2px dashed #cbd5e0;
  background-color: #f7fafc;
  transition: all 0.2s;
}
.drop-zone.drag-over {
  border-color: #10b981;
  background-color: #d1fae5;
}
```

**Tailwind (preserving DnD functionality):**
```jsx
<div
  className={`min-h-30 border-2 border-dashed transition-all duration-200
              ${isOver
                ? 'border-botanical-500 bg-botanical-50'
                : 'border-ink-300 bg-parchment-50'}`}
  {...dropRef}
>
  {/* Drop zone content */}
</div>
```

**Migration Notes:**
- Preserve `react-dnd` functionality - don't break drop refs
- Use conditional classes for drag states
- Glowing effects may need custom keyframe in tailwind.config
- Test drag-drop thoroughly after conversion

---

### Quest.css (828 lines) - COMPLEX

**Current CSS Patterns:**
```css
.quest-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.60);
  backdrop-filter: blur(10px);
  color: #fff;
  animation: fadeInOpacity 0.8s ease-in-out forwards;
}
@keyframes fadeInOpacity {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Tailwind Equivalent:**
```jsx
<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                bg-black/60 backdrop-blur-lg text-white rounded-2xl
                p-6 max-w-3xl max-h-[90vh] overflow-y-auto
                animate-fade-in z-[1000]">
  {/* Quest content */}
</div>
```

**Button Styling:**
```css
/* Current */
.quest-choice-button {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}
.quest-choice-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 153, 225, 0.4);
}
```

**Tailwind:**
```jsx
<button className="bg-gradient-to-br from-blue-500 to-blue-600
                   text-white px-6 py-3 rounded-lg font-semibold
                   transition-all duration-300
                   hover:-translate-y-0.5 hover:shadow-glow-botanical
                   active:scale-95">
  Make Choice
</button>
```

**Migration Notes:**
- Quest system is story-critical - TEST THOROUGHLY
- Preserve all animations
- Add `animate-fade-in` to tailwind.config (already exists)
- Images need proper aspect ratios

---

## Phase 4: Core UI + Dark Mode (8 files, ~1,500 lines)

### App.css - Global Styles (Lines 1-600)

**Typography Styles:**
```css
/* Current */
body {
  font-family: 'Source Sans Pro', sans-serif;
  color: #2d3748;
}
h2 {
  font-size: 1.6em;
  font-weight: bold;
  font-family: 'Playfair Display', serif;
}
```

**Tailwind Config Already Has:**
```javascript
fontFamily: {
  sans: ['Source Sans Pro', ...],
  serif: ['Crimson Text', ...],
  display: ['Cinzel', 'Crimson Text', ...],
}
```

**Migration:**
- Remove font imports from App.css
- Use Tailwind font classes: `font-sans`, `font-serif`, `font-display`
- Remove all typography CSS, use Tailwind utilities

**Layout Styles:**
```css
/* Current */
.main-content {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}
```

**Tailwind:**
```jsx
<div className="flex justify-between gap-4 max-w-7xl mx-auto">
  {/* content */}
</div>
```

---

### Dark Mode Implementation (ALL components)

**Pattern for Every Component:**

| Element | Light Mode | Dark Mode |
|---|---|---|
| **Primary BG** | `bg-white` | `dark:bg-ink-900` |
| **Secondary BG** | `bg-parchment-50` | `dark:bg-ink-800` |
| **Tertiary BG** | `bg-parchment-100` | `dark:bg-ink-700` |
| **Primary Text** | `text-ink-900` | `dark:text-parchment-50` |
| **Secondary Text** | `text-ink-600` | `dark:text-parchment-300` |
| **Muted Text** | `text-ink-400` | `dark:text-ink-400` |
| **Borders** | `border-parchment-200` | `dark:border-ink-700` |
| **Borders (strong)** | `border-ink-300` | `dark:border-ink-600` |
| **Accent Color** | `text-botanical-700` | `dark:text-botanical-400` |
| **Success** | `bg-success-500` | `dark:bg-success-600` |
| **Warning** | `bg-warning-500` | `dark:bg-warning-400` |
| **Danger** | `bg-danger-500` | `dark:bg-danger-600` |

**Example Component with Dark Mode:**
```jsx
<div className="bg-white dark:bg-ink-900
                border border-parchment-200 dark:border-ink-700
                rounded-xl shadow-elevation-2 p-6">
  <h3 className="text-xl font-bold text-ink-900 dark:text-parchment-50 mb-4">
    Title
  </h3>
  <p className="text-sm text-ink-600 dark:text-parchment-300">
    Description text
  </p>
  <button className="bg-botanical-600 dark:bg-botanical-500
                     hover:bg-botanical-700 dark:hover:bg-botanical-600
                     text-white px-4 py-2 rounded-lg">
    Action
  </button>
</div>
```

---

## Migration Priorities

### High Priority (Must Convert First)
1. **Quest.css** - Story-critical, complex animations
2. **PrescribePopup.css** - Core gameplay mechanic
3. **Mixing.css** - Core crafting system
4. **Map.css** - Navigation system
5. **App.css** - Global styles affect everything

### Medium Priority (Convert in Phase 3)
6. **Buy.css**, **Sleep.css**, **Inventory.css** - Secondary features
7. **Symptoms.css**, **Diagnose** - Medical system
8. **GameIntro.css**, **Popup.css** - Generic modals

### Low Priority (Convert in Phase 2)
9. **LoadingIndicator**, **NotificationPopup** - Utility components
10. **WealthTracker**, **HistoricalContextCard** - Info displays
11. **HomePage**, **ScenarioSelector** - Non-game UI

---

## Custom Tailwind Additions Needed

### Add to tailwind.config.js (if not already present):

```javascript
// Custom animations
animation: {
  'fade-in': 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  'fade-in-up': 'fadeInUp 350ms cubic-bezier(0.4, 0, 0.2, 1)',
  'slide-in': 'slideIn 300ms ease-out',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeInUp: {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  slideIn: {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' },
  },
},
```

---

## Risk Assessment by File

| File | Risk | Reason |
|---|---|---|
| Quest.css | 🔴 HIGH | Story-critical, complex animations |
| Mixing.css | 🔴 HIGH | Drag-drop, core mechanic |
| PrescribePopup.css | 🟠 MEDIUM-HIGH | Forms, core mechanic |
| Map.css | 🟠 MEDIUM-HIGH | SVG styling, complex |
| App.css | 🟡 MEDIUM | Global styles, affects everything |
| Sleep.css | 🟡 MEDIUM | Modal with dreams display |
| Buy.css | 🟡 MEDIUM | Table styling, filters |
| Inventory.css | 🟡 MEDIUM | Grid layout, drag-drop |
| Others | 🟢 LOW | Standalone, simple |

---

## Testing Checklist After Each File Conversion

**For every converted file:**
- [ ] Visual regression test (compare screenshots)
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test all interactive states (hover, focus, active)
- [ ] Test on mobile viewport
- [ ] Verify no console errors
- [ ] Check that functionality still works (not just styling)

---

## Conversion Notes

### DO:
✅ Use Tailwind's existing classes whenever possible
✅ Map colors to design system (parchment, ink, botanical, etc.)
✅ Use elevation shadows from tailwind.config
✅ Add dark mode classes to EVERY component
✅ Preserve all animations (add to config if needed)
✅ Test thoroughly after each file

### DON'T:
❌ Remove CSS file until component is fully converted and tested
❌ Change HTML structure unnecessarily
❌ Break drag-and-drop functionality (react-dnd)
❌ Skip dark mode implementation
❌ Use arbitrary values like `w-[237px]` - use design system
❌ Remove animations without replacement

---

**Status**: ✅ Phase 1 Complete - Ready for Phase 2
**Next Step**: Begin Phase 2 - Convert non-critical components
**Estimated Time**: Phase 2 will take 2-3 hours
