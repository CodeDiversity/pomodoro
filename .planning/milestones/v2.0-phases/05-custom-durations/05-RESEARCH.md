# Phase 5: Custom Durations Core - Research

**Researched:** 2026-02-20
**Domain:** React/TypeScript Pomodoro timer with IndexedDB persistence
**Confidence:** HIGH

## Summary

This phase implements custom timer durations (Focus, Short Break, Long Break) that persist across sessions. The codebase already has partial infrastructure in place: IndexedDB schema supports duration fields, settings are already persisted, and the timer uses a reducer pattern. The implementation requires: updating the settings interface to include durations, adding a reducer action to apply custom durations, and building a Settings UI with number inputs and validation.

**Primary recommendation:** Extend existing Settings panel with three duration inputs (1-60 min for focus/long break, 1-30 min for short break), save to IndexedDB on Save button click, and integrate with timer reducer via a new `SET_CUSTOM_DURATIONS` action.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Input Style:** Number input with +/- stepper buttons. User can both click +/- to adjust by 1 minute OR type directly. Falls back to validation if direct typing produces invalid value.
- **Validation UX:** Real-time inline validation as user types. Show error message below input when value is out of bounds. Error message: "Must be between X-Y minutes".
- **Apply Timing:** Changes apply immediately when clicking Save (not on every input change). If timer is idle: immediately updates timer display. If timer is running: resets timer to new duration (DUR-08).
- **Save Strategy:** Use single "Save" button that saves all three durations at once. Saves to IndexedDB "settings" store (not sessions store). On app load: load custom durations first, then apply to timer.

### Claude's Discretion
(None specified - all major decisions are locked)

### Deferred Ideas (OUT OF SCOPE)
- Preset duration buttons (Classic: 25/5/15, Extended: 50/10/30, Quick: 15/3/10) — Phase 6
- Confirmation dialog when timer is running — Phase 6
- Reset to defaults button — Phase 6
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DUR-01 | User can set custom Focus duration (1-60 minutes) | Number input with min=1 max=60, validated and persisted |
| DUR-02 | User can set custom Short Break duration (1-30 minutes) | Number input with min=1 max=30, validated and persisted |
| DUR-03 | User can set custom Long Break duration (1-60 minutes) | Number input with min=1 max=60, validated and persisted |
| DUR-05 | Custom durations are validated against min/max bounds | Real-time inline validation with error messages |
| DUR-06 | Custom durations persist across page refreshes | Saved to IndexedDB settings store on Save click |
| DUR-08 | Timer resets to new duration when changed | Reducer handles timer reset when custom durations applied |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI framework | Primary UI library for the app |
| TypeScript | 5.6.2 | Type safety | All source code uses TypeScript |
| styled-components | 6.3.10 | CSS-in-JS styling | Used throughout the codebase |
| idb | 8.0.0 | IndexedDB wrapper | Already used for persistence |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | - | No additional libraries needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| idb | raw IndexedDB API | idb provides Promises and cleaner API - already in use |
| styled-components | CSS modules / Tailwind | styled-components already used in codebase |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/        # Existing Settings.tsx will be expanded
├── hooks/            # useTimer.ts will get new setCustomDurations
├── services/         # persistence.ts needs updates for durations
├── types/            # timer.ts needs new action type
└── constants/        # timer.ts - DURATIONS used as defaults
```

### Pattern 1: Number Input with Stepper Buttons
**What:** React controlled input with increment/decrement buttons
**When to use:** Precise numeric input with bounds validation

```tsx
// Implementation pattern for DurationInput component
interface DurationInputProps {
  label: string
  value: number // in minutes
  onChange: (minutes: number) => void
  min: number
  max: number
  error?: string
}

// Buttons adjust by 1 minute, input allows direct typing
// Real-time validation with error display below input
```

**Example:**
```tsx
const DurationInput = ({ label, value, onChange, min, max, error }) => (
  <div>
    <Label>{label}</Label>
    <InputGroup>
      <StepperButton onClick={() => onChange(Math.max(min, value - 1))}>-</StepperButton>
      <NumberInput
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clampValue(e.target.value, min, max))}
      />
      <StepperButton onClick={() => onChange(Math.min(max, value + 1))}>+</StepperButton>
    </InputGroup>
    {error && <ErrorText>{error}</ErrorText>}
  </div>
)
```

### Pattern 2: Settings Persistence
**What:** Save settings to IndexedDB with immediate save on user action
**When to use:** User-confirmed changes that should persist

```typescript
// persistence.ts - AppSettings interface
export interface AppSettings {
  autoStart: boolean
  focusDuration: number      // seconds
  shortBreakDuration: number // seconds
  longBreakDuration: number  // seconds
}
```

### Pattern 3: Timer Reducer Action
**What:** Add new action type to handle custom duration changes
**When to use:** When timer needs to respond to user configuration changes

```typescript
// types/timer.ts
export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type:' }
  // 'RESET ... existing actions
  | { type: 'SET_CUSTOM_DURATIONS'; payload: Record<TimerMode, number> }
```

### Anti-Patterns to Avoid
- **Don't debounce on Save click:** The user explicitly wants immediate save when clicking Save
- **Don't apply on every input change:** Changes only apply when Save button is clicked
- **Don't require confirmation dialog in Phase 5:** Deferred to Phase 6

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB operations | Custom Promise wrappers | idb library (already used) | idb provides clean Promise-based API |
| Number input validation | Custom regex parsing | HTML5 min/max + parseInt | Browser handles basic validation |
| Duration clamping | Custom logic | Math.max/min | Simple and effective |

**Key insight:** The codebase already uses idb for IndexedDB. No new libraries needed.

## Common Pitfalls

### Pitfall 1: Timer Reset Logic
**What goes wrong:** When custom durations are applied while timer is running, the timer should reset to the new duration (DUR-08)
**Why it happens:** Need to explicitly dispatch reset after applying new durations
**How to avoid:** In the SET_CUSTOM_DURATIONS reducer case, check if timer is running and include reset logic
**Warning signs:** Timer continues with old duration after Save is clicked while running

### Pitfall 2: Duration Unit Mismatch
**What goes wrong:** Timer uses seconds (DURATIONS.focus = 25 * 60) but UI shows minutes
**Why it happens:** Persistence stores seconds, inputs work in minutes
**How to avoid:** Convert minutes to seconds when saving (minutes * 60), convert seconds to minutes when loading (/ 60)
**Warning signs:** Durations that are 60x too large or small

### Pitfall 3: Load Order
**What goes wrong:** Custom durations must be loaded before applying to timer on app start
**Why it happens:** useTimer loads state first, then settings - but timer needs custom durations to be available
**How to avoid:** Load custom durations from settings in useTimer's initialization, apply to initial state before first render
**Warning signs:** Timer always uses defaults on refresh despite saved custom durations

### Pitfall 4: Settings Panel State
**What goes wrong:** Settings inputs need to track their own state separate from what's saved
**Why it happens:** User might type invalid value - should show error but not crash
**How to avoid:** Keep local state for inputs, only call onChange with valid parsed values
**Warning signs:** NaN values being passed to parent components

## Code Examples

### 1. Updated persistence.ts saveSettings
```typescript
// Source: Existing codebase - src/services/persistence.ts
export interface AppSettings {
  autoStart: boolean
  focusDuration: number      // seconds
  shortBreakDuration: number // seconds
  longBreakDuration: number  // seconds
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await initDB()
  await db.put('settings', {
    id: SETTINGS_KEY,
    focusDuration: settings.focusDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    autoStart: settings.autoStart,
    version: 1,
  })
}
```

### 2. Timer Reducer with Custom Durations
```typescript
// Source: Existing codebase - src/hooks/useTimer.ts
// Add to timerReducer:
case 'SET_CUSTOM_DURATIONS': {
  const customDurations = action.payload
  return {
    ...state,
    customDurations,
    // If timer is idle, immediately update to new duration
    // If timer is running, reset to new duration (DUR-08 requirement)
    duration: customDurations[state.mode],
    timeRemaining: customDurations[state.mode],
    isRunning: false,
    startTime: null,
    pausedTimeRemaining: null,
  }
}
```

### 3. Settings Component with Duration Inputs
```tsx
// Source: Existing codebase - src/components/Settings.tsx
// Expand panel to include:
<DurationInput
  label="Focus"
  value={focusMinutes}
  onChange={setFocusMinutes}
  min={1}
  max={60}
  error={focusError}
/>

<SaveButton onClick={handleSave}>
  Save
</SaveButton>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded durations in constants | Custom durations from IndexedDB | This phase | Users can customize timer lengths |
| Settings only persisted autoStart | Settings persist all timer config | This phase | Full settings persistence |

**Deprecated/outdated:**
- (none relevant to this phase)

## Open Questions

1. **Timer state loading order**
   - What we know: loadTimerState() and loadSettings() are called in parallel in useTimer
   - What's unclear: How to ensure custom durations are applied to timer before first render
   - Recommendation: Update useTimer to load settings first, then apply to initial state

2. **Validation on direct typing**
   - What we know: User can type values directly in number input
   - What's unclear: Should invalid input (e.g., "abc") be replaced with last valid value immediately or on blur?
   - Recommendation: Use onChange with sanitization, show error message for invalid values

## Sources

### Primary (HIGH confidence)
- **Existing codebase analysis:** src/constants/timer.ts, src/types/timer.ts, src/services/persistence.ts, src/services/db.ts, src/hooks/useTimer.ts, src/components/Settings.tsx
- **idb library documentation:** https://github.com/jakearchibald/idb - Already in use with version 8.0.0
- **React controlled inputs:** Standard React patterns

### Secondary (MEDIUM confidence)
- (none needed - codebase provides all necessary context)

### Tertiary (LOW confidence)
- (none needed)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture: HIGH - Follows existing codebase patterns
- Pitfalls: HIGH - Identified through codebase analysis

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (30 days - stable tech stack)
