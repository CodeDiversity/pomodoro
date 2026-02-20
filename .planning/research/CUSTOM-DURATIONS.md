# Research: Custom Timer Durations for Pomodoro App

**Project:** Pomodoro Timer v1.1
**Researched:** 2025-02-19
**Confidence:** HIGH

## Executive Summary

This research covers best practices for implementing customizable timer durations in an existing React Pomodoro app. The codebase already has IndexedDB schema support for durations (partially implemented), making this a straightforward extension. Key recommendations: use number inputs with validation bounds, store settings in IndexedDB alongside existing settings, and integrate via a new reducer action that accepts custom durations.

## Key Findings

- **UI Pattern:** Number input with +/- buttons and direct input; consider slider for quick adjustments
- **Validation:** Bounds of 1-60 minutes for focus, 1-30 for breaks; prevent timer running during changes
- **Persistence:** Use existing IndexedDB settings store (schema already supports it)
- **State Integration:** Add `SET_CUSTOM_DURATION` action to reducer; load custom durations on app mount

---

## 1. UI Patterns for Duration Input

### Recommended Approach: Number Input with Stepper Buttons

**Why:** Provides precise control while being accessible and familiar. Number inputs with min/max attributes provide built-in browser validation.

```tsx
// Example component structure
interface DurationInputProps {
  label: string
  value: number // in minutes
  onChange: (minutes: number) => void
  min?: number
  max?: number
}
```

**Key UI Elements:**
1. **Number input field** - Allows direct typing
2. **Increment/decrement buttons** - + / - buttons with 1-minute steps
3. **Preset buttons** - Common durations (25, 30, 45 for focus; 5, 10, 15 for breaks)
4. **Visual feedback** - Show current value prominently

### Alternative: Slider + Number Input Combo

**When to use:** Users need to quickly adjust across a range.

```tsx
<Slider
  min={1}
  max={60}
  value={focusDuration}
  onChange={setFocusDuration}
  marks={[25, 30, 45]}
/>
<NumberInput value={focusDuration} onChange={setFocusDuration} />
```

### Implementation in Existing Settings Panel

The existing Settings component uses a dropdown panel. Expand it to include duration inputs:

```tsx
// Settings.tsx - expanded
const Panel = styled.div`
  min-width: 280px; // Increased from 200px
`

// Add duration inputs in the panel
<DurationInput
  label="Focus"
  value={focusDuration}
  onChange={setFocusDuration}
  min={1}
  max={60}
/>
<DurationInput
  label="Short Break"
  value={shortBreakDuration}
  onChange={setShortBreakDuration}
  min={1}
  max={30}
/>
<DurationInput
  label="Long Break"
  value={longBreakDuration}
  onChange={setLongBreakDuration}
  min={1}
  max={60}
/>
```

---

## 2. Validation Approaches

### Recommended Bounds

| Duration Type | Min (minutes) | Max (minutes) | Rationale |
|--------------|---------------|----------------|------------|
| Focus        | 1             | 60             | Too short loses Pomodoro benefit; too long loses focus |
| Short Break  | 1             | 30             | Should be quick resets |
| Long Break   | 1             | 60             | Should not over-rest |

### Validation Implementation

**Step 1: Input sanitization**
```tsx
const sanitizeDuration = (value: string): number => {
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) return DEFAULT_VALUE
  return Math.max(MIN_VALUE, Math.min(MAX_VALUE, parsed))
}
```

**Step 2: React controlled input**
```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = sanitizeDuration(e.target.value)
  onChange(value)
}
```

**Step 3: Prevent invalid states**
- Disable timer start while duration is being edited
- Warn user before changing duration if timer is running

### Edge Cases to Handle

1. **Empty input** - Fall back to previous valid value
2. **Non-numeric input** - Sanitize via parseInt
3. **Out of bounds** - Clamp to min/max
4. **Rapid changes** - Debounce saves to IndexedDB

---

## 3. State Management for Duration Settings

### Recommended Architecture

**Local state in Settings component:**
```tsx
const [focusDuration, setFocusDuration] = useState(25)
const [shortBreakDuration, setShortBreakDuration] = useState(5)
const [longBreakDuration, setLongBreakDuration] = useState(15)
```

**Load from IndexedDB on mount:**
```tsx
useEffect(() => {
  loadSettings().then(settings => {
    setFocusDuration(settings.focusDuration / 60) // Convert seconds to minutes
    setShortBreakDuration(settings.shortBreakDuration / 60)
    setLongBreakDuration(settings.longBreakDuration / 60)
    setAutoStart(settings.autoStart)
  })
}, [])
```

**Propagate to timer via useTimer:**
```tsx
// In App.tsx
const {
  state,
  // ... existing
  customDurations,
  setCustomDurations,
} = useTimer({ onSessionComplete: handleSessionComplete })

<Settings
  // ... existing props
  focusDuration={customDurations.focus}
  onFocusDurationChange={setCustomDurations}
/>
```

---

## 4. Persistence Strategy

### Existing Schema (Already in Codebase)

The IndexedDB schema in `db.ts` already supports durations:

```typescript
interface SettingsData {
  id: string
  focusDuration: number      // seconds
  shortBreakDuration: number // seconds
  longBreakDuration: number   // seconds
  autoStart: boolean
  version: number
}
```

### Implementation: Update persistence.ts

**Current state (needs update):**
```typescript
// persistence.ts line 167-174 - currently hardcodes values
await db.put('settings', {
  id: SETTINGS_KEY,
  focusDuration: 25 * 60,        // HARDCODED - needs to use actual value
  shortBreakDuration: 5 * 60,    // HARDCODED
  longBreakDuration: 15 * 60,    // HARDCODED
  autoStart: settings.autoStart,
  version: 1,
})
```

**Updated approach:**
```typescript
export interface AppSettings {
  autoStart: boolean
  focusDuration: number      // Add these
  shortBreakDuration: number
  longBreakDuration: number
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

### Load Settings with Defaults

```typescript
const DEFAULT_SETTINGS: AppSettings = {
  autoStart: false,
  focusDuration: 25 * 60,    // 25 minutes in seconds
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
}
```

---

## 5. Integration with useReducer

### Current Code Analysis

The `useTimer` hook currently imports `DURATIONS` directly from constants:

```typescript
// useTimer.ts line 3
import { DURATIONS, SESSIONS_BEFORE_LONG_BREAK } from '../constants/timer'

// Line 65-66 in reducer - uses hardcoded DURATIONS
case 'SKIP':
  return {
    ...state,
    duration: DURATIONS[nextMode],        // HARDCODED
    timeRemaining: DURATIONS[nextMode],   // HARDCODED
  }
```

### Recommended Changes

**Step 1: Add reducer action for custom durations**

```typescript
// types/timer.ts - add to TimerAction
type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  // ... existing
  | { type: 'SET_CUSTOM_DURATIONS'; payload: Record<TimerMode, number> } // NEW
```

**Step 2: Update reducer to use custom durations**

```typescript
// In timerReducer - replace DURATIONS references with state.customDurations
// or pass custom durations as part of state

case 'SET_MODE': {
  const customDuration = state.customDurations?.[action.payload] ?? DURATIONS[action.payload]
  return {
    ...state,
    mode: action.payload,
    duration: customDuration,
    timeRemaining: customDuration,
    // ... rest
  }
}
```

**Step 3: Add custom durations to TimerState**

```typescript
// types/timer.ts
interface TimerState {
  mode: TimerMode
  duration: number
  timeRemaining: number
  isRunning: boolean
  sessionCount: number
  startTime: number | null
  pausedTimeRemaining: number | null
  customDurations?: Record<TimerMode, number> // NEW - optional, defaults to DURATIONS
}
```

**Step 4: Expose setter from useTimer**

```typescript
// useTimer.ts
const setCustomDurations = useCallback((durations: Record<TimerMode, number>) => {
  dispatch({ type: 'SET_CUSTOM_DURATIONS', payload: durations })
}, [])

return {
  // ... existing
  customDurations: state.customDurations ?? DURATIONS,
  setCustomDurations,
}
```

---

## 6. User Experience Considerations

### Timer State Handling

**Critical:** When user changes duration while timer is running or paused:

1. **If timer not started:** Apply new duration immediately
2. **If timer is paused:** Show confirmation dialog before applying
3. **If timer is running:** Warn user that changing duration will reset the timer

```tsx
const handleDurationChange = (newDuration: number) => {
  if (state.isRunning) {
    const confirmed = window.confirm(
      'Changing duration will reset the current timer. Continue?'
    )
    if (!confirmed) return
  }
  setCustomDuration(mode, newDuration)
  if (state.isRunning || state.timeRemaining !== state.duration) {
    reset() // Reset timer to apply new duration
  }
}
```

### Visual Feedback

- Display current durations in the Settings panel
- Show a "Reset to Defaults" button
- Persist custom durations immediately on change (or debounced)

### Preset Options

Provide quick-select buttons for common configurations:

| Preset Name | Focus | Short Break | Long Break |
|-------------|-------|--------------|------------|
| Classic     | 25 min | 5 min | 15 min |
| Extended    | 50 min | 10 min | 30 min |
| Quick       | 15 min | 3 min | 10 min |

---

## 7. Implementation Roadmap

### Phase 1: Data Layer (Low Risk)
1. Update `AppSettings` type in `persistence.ts` to include durations
2. Update `saveSettings` to use actual values
3. Update `loadSettings` to return durations with defaults
4. No UI changes

### Phase 2: Timer Integration (Medium Risk)
1. Add `SET_CUSTOM_DURATIONS` action to reducer
2. Update reducer to use custom durations when available
3. Expose `setCustomDurations` from `useTimer`
4. Test mode switching with custom durations

### Phase 3: UI Implementation (Low Risk)
1. Expand Settings component with duration inputs
2. Connect inputs to state and persistence
3. Add preset buttons
4. Add validation and bounds checking

### Phase 4: Polish
1. Handle timer state edge cases (running/paused)
2. Add "Reset to Defaults" button
3. Test across different durations

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-------------|
| Duration changes while timer running | Medium | Confirm dialog before applying |
| IndexedDB write failures | Low | Log errors, fallback to defaults |
| Race condition on mode switch | Low | Use functional reducer updates |
| Performance with rapid changes | Low | Debounce IndexedDB saves |

---

## Sources

- **Existing codebase analysis:** `src/constants/timer.ts`, `src/types/timer.ts`, `src/services/persistence.ts`, `src/services/db.ts`, `src/hooks/useTimer.ts`, `src/components/Settings.tsx`
- **IndexedDB library:** `idb` package (v2 schema already uses this)
- **Best practices:** Standard React form patterns with controlled inputs

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| UI patterns | HIGH | Standard React patterns, well-documented |
| Validation | HIGH | Simple numeric bounds, no complex validation |
| State management | HIGH | Follows existing patterns in codebase |
| Persistence | HIGH | Schema already exists, just needs wiring |
| Reducer integration | MEDIUM | Requires careful handling of edge cases |

---

## Open Questions

1. **Should duration changes apply immediately or require a button press?** - Recommendation: Immediate with debounced save
2. **Should the timer reset when duration changes?** - Recommendation: Yes, for clarity
3. **Should custom durations sync across tabs?** - Recommendation: Not in v1.1, add later if needed
