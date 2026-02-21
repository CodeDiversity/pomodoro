# Stack Research: Redux Toolkit Migration

**Domain:** Redux Toolkit State Management for React 18 + TypeScript + Vite
**Researched:** 2026-02-21
**Confidence:** HIGH

## Summary

For migrating from `useReducer` to Redux Toolkit in an existing React 18 + TypeScript + Vite + styled-components app:

1. **Core packages:** Redux Toolkit 2.5+ and React-Redux 9.2+ (React 18 required)
2. **Persistence:** Custom middleware preferred over Redux Persist for IndexedDB control
3. **TypeScript:** Modern `.withTypes<>()` pattern for type-safe hooks
4. **No RTK Query needed:** Existing IndexedDB persistence layer is sufficient

---

## Recommended Stack Additions

### Core Redux Packages

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @reduxjs/toolkit | ^2.5.0 | State management | Latest stable with RTK 2.0 improvements. Includes Immer, Reselect, Redux Thunk. ESM-first, better TypeScript inference. |
| react-redux | ^9.2.0 | React bindings | Native `useSyncExternalStore` for React 18 concurrent features. Requires React 18+. |
| @types/react-redux | ^7.1.34 | Type definitions | TypeScript support for hooks and APIs. |

**Installation:**
```bash
npm install @reduxjs/toolkit@^2.5.0 react-redux@^9.2.0
npm install -D @types/react-redux@^7.1.34
```

### Version Compatibility Matrix

| Package | Version | React Requirement | Notes |
|---------|---------|-------------------|-------|
| @reduxjs/toolkit | 2.5.x | React 18+ | ESM/CJS dual package, ES2020 output |
| react-redux | 9.2.x | **React 18 required** | Uses native `useSyncExternalStore`, no legacy shim |
| redux (core) | 5.0.x | - | Improved TypeScript types |
| reselect | 5.1.x | - | `weakMapMemoize` default, better performance |

**Critical:** React-Redux v9+ requires React 18 as minimum. The app already uses React 18.3.1, so this is compatible.

---

## Migration Strategy: useReducer to Redux Toolkit

### Current State Architecture

```
Current (useReducer pattern):
- useTimer.ts: timerReducer + useReducer hook
- useSessionManager.ts: Session management logic
- useSessionNotes.ts: Local state for notes
- useSessionHistory.ts: Local state for history/filters
- persistence.ts: IndexedDB save/load
```

### Target Redux Architecture

```
Target (Redux Toolkit pattern):
src/
├── store/
│   ├── index.ts              # Store configuration
│   ├── hooks.ts              # Typed useAppDispatch/useAppSelector
│   └── middleware/
│       └── persistence.ts    # Custom IndexedDB middleware
├── slices/
│   ├── timerSlice.ts         # Timer state + actions
│   ├── settingsSlice.ts      # App settings
│   └── uiSlice.ts            # UI state (drawer, viewMode)
└── hooks/                    # (kept for non-state logic)
    ├── useSessionManager.ts  # Business logic only
    └── useKeyboardShortcuts.ts
```

### Slice Design Mapping

| Current Hook/Reducer | Redux Slice | State Shape |
|---------------------|-------------|-------------|
| `useTimer` reducer | `timerSlice` | `mode`, `timeRemaining`, `isRunning`, `duration`, `sessionCount`, `startTime`, `pausedTimeRemaining` |
| `useSessionNotes` | `notesSlice` | `noteText`, `tags`, `saveStatus`, `lastSaved` |
| `useSessionHistory` filters | `uiSlice` | `dateFilter`, `searchQuery`, `viewMode`, `isDrawerOpen` |
| Settings from persistence | `settingsSlice` | `autoStart`, `focusDuration`, `shortBreakDuration`, `longBreakDuration` |

**Session history data stays in IndexedDB**, not Redux. Use thunks to fetch/filter.

---

## TypeScript Setup (Modern Pattern)

### Store Configuration with Type Inference

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../slices/timerSlice'
import settingsReducer from '../slices/settingsSlice'
import notesReducer from '../slices/notesSlice'
import uiReducer from '../slices/uiSlice'
import { persistenceMiddleware } from './middleware/persistence'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    settings: settingsReducer,
    notes: notesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values (Date objects, etc.)
        ignoredActions: ['timer/tick'],
        ignoredPaths: ['timer.startTime'],
      },
    }).concat(persistenceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Infer types from store itself (no manual maintenance)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Typed Hooks (React-Redux 9+ Pattern)

```typescript
// src/store/hooks.ts
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { RootState, AppDispatch, AppStore } from './index'

// Modern .withTypes<> pattern (React-Redux 9+)
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
```

### Slice Example: Timer

```typescript
// src/slices/timerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { TimerMode } from '../types/timer'
import { DURATIONS } from '../constants/timer'

export interface TimerState {
  mode: TimerMode
  duration: number
  timeRemaining: number
  isRunning: boolean
  sessionCount: number
  startTime: number | null
  pausedTimeRemaining: number | null
}

const initialState: TimerState = {
  mode: 'focus',
  duration: DURATIONS.focus,
  timeRemaining: DURATIONS.focus,
  isRunning: false,
  sessionCount: 1,
  startTime: null,
  pausedTimeRemaining: null,
}

export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    start: (state) => {
      state.isRunning = true
      state.startTime = Date.now()
      state.pausedTimeRemaining = null
    },
    pause: (state) => {
      state.isRunning = false
      state.pausedTimeRemaining = state.timeRemaining
      state.startTime = null
    },
    resume: (state) => {
      state.isRunning = true
      state.startTime = Date.now()
    },
    reset: (state) => {
      state.timeRemaining = state.duration
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    tick: (state) => {
      if (state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
        state.timeRemaining = Math.max(0, state.duration - elapsed)
      }
    },
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload
      state.duration = DURATIONS[action.payload]
      state.timeRemaining = DURATIONS[action.payload]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    skipSession: (state) => {
      // Logic from existing SKIP action
      const isFocusMode = state.mode === 'focus'
      if (isFocusMode) {
        if (state.sessionCount >= 4) {
          state.mode = 'longBreak'
          state.sessionCount = 1
        } else {
          state.mode = 'shortBreak'
        }
      } else {
        state.mode = 'focus'
        if (state.mode === 'shortBreak') {
          state.sessionCount += 1
        }
      }
      state.duration = DURATIONS[state.mode]
      state.timeRemaining = DURATIONS[state.mode]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    setCustomDurations: (state, action: PayloadAction<{
      focus: number
      shortBreak: number
      longBreak: number
    }>) => {
      const durationMap = {
        focus: action.payload.focus,
        shortBreak: action.payload.shortBreak,
        longBreak: action.payload.longBreak,
      }
      state.duration = durationMap[state.mode]
      state.timeRemaining = durationMap[state.mode]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    // For loading persisted state
    hydrate: (state, action: PayloadAction<TimerState>) => {
      return action.payload
    },
  },
})

export const {
  start,
  pause,
  resume,
  reset,
  tick,
  setMode,
  skipSession,
  setCustomDurations,
  hydrate,
} = timerSlice.actions

// Selectors
export const selectTimer = (state: RootState) => state.timer
export const selectIsRunning = (state: RootState) => state.timer.isRunning
export const selectTimeRemaining = (state: RootState) => state.timer.timeRemaining
export const selectCurrentMode = (state: RootState) => state.timer.mode

export default timerSlice.reducer
```

---

## Persistence Approach: Custom Middleware vs Redux Persist

### Recommendation: Custom Middleware

**Why custom over Redux Persist:**

| Factor | Redux Persist | Custom Middleware |
|--------|---------------|-------------------|
| IndexedDB control | Limited (needs adapter) | Full control via existing `idb` |
| Debouncing | Manual implementation | Already implemented in codebase |
| Bundle size | +8KB with adapter | 0 additional deps |
| Migration complexity | New API to learn | Reuse existing persistence.ts |
| Versioned schema | Manual | Already implemented |
| Granular control | Limited | Full (save while running vs immediate) |

### Custom Persistence Middleware

```typescript
// src/store/middleware/persistence.ts
import { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import { saveTimerState, saveTimerStateImmediate, saveSettings } from '../../services/persistence'

let saveTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 2000

export const persistenceMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action)
    const state = store.getState()
    const { type } = action as { type: string }

    // Persist timer state
    if (type.startsWith('timer/')) {
      const timerState = state.timer

      // Clear pending debounced save
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }

      // Immediate save for pause/stop/reset
      if (
        type === 'timer/pause' ||
        type === 'timer/reset' ||
        type === 'timer/setMode'
      ) {
        saveTimerStateImmediate(timerState)
      } else if (timerState.isRunning) {
        // Debounced save while running
        saveTimeout = setTimeout(() => {
          saveTimerState(timerState)
        }, DEBOUNCE_MS)
      }
    }

    // Persist settings
    if (type.startsWith('settings/')) {
      saveSettings(state.settings)
    }

    return result
  }
```

### State Hydration Pattern

```typescript
// src/store/hydration.ts
import { store } from './index'
import { hydrate as hydrateTimer } from '../slices/timerSlice'
import { hydrate as hydrateSettings } from '../slices/settingsSlice'
import { loadTimerState, loadSettings } from '../services/persistence'

export async function hydrateStore(): Promise<void> {
  const [timerState, settings] = await Promise.all([
    loadTimerState(),
    loadSettings(),
  ])

  store.dispatch(hydrateTimer(timerState))
  store.dispatch(hydrateSettings(settings))
}
```

---

## Integration with Existing React 18 Patterns

### Provider Setup

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { hydrateStore } from './store/hydration'
import App from './App'

// Hydrate store before rendering
await hydrateStore()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
```

### Component Usage Pattern

```typescript
// Before (useReducer)
function TimerView() {
  const { state, start, pause, setMode } = useTimer()
  // ...
}

// After (Redux Toolkit)
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { start, pause, setMode, selectTimer, selectIsRunning } from '../slices/timerSlice'

function TimerView() {
  const dispatch = useAppDispatch()
  const timer = useAppSelector(selectTimer)
  const isRunning = useAppSelector(selectIsRunning)

  const handleStart = () => dispatch(start())
  const handlePause = () => dispatch(pause())
  const handleSetMode = (mode: TimerMode) => dispatch(setMode(mode))
  // ...
}
```

### Keeping Business Logic in Hooks

Not all logic moves to Redux. Keep complex orchestration in hooks:

```typescript
// src/hooks/useTimerOrchestration.ts
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { tick, skipSession, selectTimer, selectIsRunning } from '../slices/timerSlice'

export function useTimerOrchestration(onComplete?: () => void) {
  const dispatch = useAppDispatch()
  const timer = useAppSelector(selectTimer)
  const isRunning = useAppSelector(selectIsRunning)
  const intervalRef = useRef<number | null>(null)
  const previousTimeRef = useRef(timer.timeRemaining)

  // Handle tick interval
  useEffect(() => {
    if (isRunning && timer.startTime) {
      intervalRef.current = window.setInterval(() => {
        dispatch(tick())
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timer.startTime, dispatch])

  // Handle completion
  useEffect(() => {
    const wasRunning = previousTimeRef.current > 0
    const isNowComplete = timer.timeRemaining === 0

    if (wasRunning && isNowComplete) {
      onComplete?.()
      setTimeout(() => {
        dispatch(skipSession())
      }, 100)
    }

    previousTimeRef.current = timer.timeRemaining
  }, [timer.timeRemaining, timer.mode, dispatch, onComplete])
}
```

---

## What NOT to Add

| Avoid | Why | Alternative |
|-------|-----|-------------|
| Redux Persist | Adds deps, less control than custom middleware | Custom persistence middleware (already have IndexedDB layer) |
| RTK Query | No server state, IndexedDB is client-only | Keep existing IndexedDB service layer |
| redux-thunk (standalone) | Included in RTK | Use `createAsyncThunk` or built-in thunk |
| redux-devtools (standalone) | Included in RTK `configureStore` | Already enabled via `devTools: true` |
| reselect (standalone) | Included in RTK | Import from `@reduxjs/toolkit` |
| Immer (standalone) | Included in RTK | Mutative syntax in slices just works |
| Multiple stores | Anti-pattern, breaks DevTools | Single store with slice composition |
| Normalized state for sessions | Overkill for local app | Keep in IndexedDB, fetch as needed |

---

## Migration Checklist

### Phase 1: Setup
- [ ] Install `@reduxjs/toolkit`, `react-redux`, `@types/react-redux`
- [ ] Create `src/store/index.ts` with store configuration
- [ ] Create `src/store/hooks.ts` with typed hooks
- [ ] Create `src/store/middleware/persistence.ts`
- [ ] Create `src/store/hydration.ts`
- [ ] Add Provider to `main.tsx`

### Phase 2: Slices (one at a time)
- [ ] Create `settingsSlice` (simplest, no UI deps)
- [ ] Create `timerSlice` (migrates useTimer reducer)
- [ ] Create `notesSlice` (migrates useSessionNotes state)
- [ ] Create `uiSlice` (migrates view/filter state)

### Phase 3: Component Migration
- [ ] Update TimerView to use Redux
- [ ] Update Settings component
- [ ] Update NoteEditor component
- [ ] Update HistoryView filters

### Phase 4: Cleanup
- [ ] Remove useReducer from useTimer
- [ ] Remove local state from useSessionNotes
- [ ] Remove local state from useSessionHistory
- [ ] Verify persistence still works
- [ ] Verify DevTools integration

---

## Bundle Impact

| Package | Size (gzipped) |
|---------|----------------|
| @reduxjs/toolkit | ~11KB |
| react-redux | ~5KB |
| **Total** | **~16KB** |

**Removed:**
- useReducer complexity (no size change, but simpler mental model)

---

## Sources

- [Redux Toolkit TypeScript Usage Guide](https://redux-toolkit.js.org/usage/usage-with-typescript) — Official TypeScript patterns
- [Redux Toolkit 2.0 Migration Guide](https://redux-toolkit.js.org/usage/migrating-rtk-2) — Breaking changes and new features
- [React-Redux v9.2.0 Release](https://github.com/reduxjs/react-redux/releases/tag/v9.2.0) — React 18/19 compatibility
- [npm @reduxjs/toolkit](https://www.npmjs.com/package/@reduxjs/toolkit) — v2.5.0 current
- [npm react-redux](https://www.npmjs.com/package/react-redux) — v9.2.0 current

---

*Research for: Pomodoro Timer v2.1 Redux Toolkit Migration*
*Researched: 2026-02-21*
