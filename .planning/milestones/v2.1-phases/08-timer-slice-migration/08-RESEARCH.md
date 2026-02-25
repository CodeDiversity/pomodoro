# Phase 8: Timer Slice Migration - Research

**Researched:** 2026-02-21
**Domain:** Redux Toolkit Slices, Custom Middleware, IndexedDB Persistence
**Confidence:** HIGH

## Summary

This phase migrates the timer state from useReducer to Redux Toolkit with a custom persistence middleware. The current implementation already uses timestamps (Date.now()) for accuracy, has IndexedDB persistence with debouncing, and handles visibility changes on load. The key tasks are: (1) create a Redux slice matching the current reducer logic, (2) implement a custom middleware for IndexedDB persistence, (3) add visibility change handling for background tab throttling, and (4) maintain the existing useTimer hook API as a compatibility layer.

**Primary recommendation:** Create timerSlice.ts in a new features/timer/ directory, implement custom persistence middleware that wraps the existing IndexedDB functions, add visibilitychange listener for accurate time recalculation, and refactor useTimer to dispatch Redux actions while maintaining the same API.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use timestamps (Date.now()) not tick counting for timer accuracy
- Recalculate on visibility change to handle background tab throttling
- Custom persistence middleware for control over IndexedDB layer
- Maintain hook compatibility layer - internal implementation only changes

### Claude's Discretion
- File structure organization (features/timer/ vs other approaches)
- Exact middleware implementation details

### Deferred Ideas (OUT OF SCOPE)
- Migrating other features to Redux (handled in future phases)
- Using redux-persist library (we're building custom middleware)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | ^2.11.2 | Slice creation with createSlice | Official Redux team recommendation |
| react-redux | ^9.2.0 | React bindings for Redux | Official React-Redux library |
| idb | ^8.0.0 | IndexedDB wrapper | Already installed, provides Promise-based API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| redux-persist | N/A | Persist store to storage | NOT USED - custom middleware required |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom middleware | redux-persist with IndexedDB storage | Less control, less efficient for our use case |
| createAsyncThunk | Middleware for async persistence | Middleware provides more control over debouncing |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
# @reduxjs/toolkit: 2.11.2
# react-redux: 9.2.0
# idb: 8.0.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── store.ts              # Store configuration (update to include timer slice)
│   └── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
├── features/
│   └── timer/
│       ├── timerSlice.ts    # Timer Redux slice with actions/reducer
│       ├── timerMiddleware.ts # Custom persistence middleware
│       └── useTimer.ts      # Compatibility layer (updates existing hook)
├── hooks/
│   └── useTimer.ts          # Existing - will be refactored to use Redux
├── services/
│   ├── persistence.ts       # Existing - keep for IndexedDB operations
│   └── db.ts                # Existing - IndexedDB schema and helpers
└── types/
    └── timer.ts             # Existing - TimerState, TimerAction types
```

### Pattern 1: Redux Slice with createSlice
**What:** Feature-based state slice with typed state and actions
**When to use:** For migrating useReducer to Redux
**Example:**
```typescript
// Based on current useReducer logic in useTimer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimerState, TimerMode } from '../../types/timer'
import { DURATIONS, SESSIONS_BEFORE_LONG_BREAK } from '../../constants/timer'

const initialState: TimerState = {
  mode: 'focus',
  duration: DURATIONS.focus,
  timeRemaining: DURATIONS.focus,
  isRunning: false,
  sessionCount: 1,
  startTime: null,
  pausedTimeRemaining: null,
}

const timerSlice = createSlice({
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
      if (!state.startTime) return
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
      state.timeRemaining = Math.max(0, state.duration - elapsed)
    },
    skip: (state) => {
      // Determine next mode based on current mode and session count
      const isFocusMode = state.mode === 'focus'
      if (isFocusMode) {
        if (state.sessionCount >= SESSIONS_BEFORE_LONG_BREAK) {
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
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload
      state.duration = DURATIONS[action.payload]
      state.timeRemaining = DURATIONS[action.payload]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    setCustomDurations: (state, action: PayloadAction<{ focus: number; shortBreak: number; longBreak: number }>) => {
      const { focus, shortBreak, longBreak } = action.payload
      const durationMap = { focus, shortBreak, longBreak }
      state.duration = durationMap[state.mode]
      state.timeRemaining = durationMap[state.mode]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    loadState: (state, action: PayloadAction<TimerState>) => {
      return action.payload
    },
  },
})

export const { start, pause, resume, reset, tick, skip, setMode, setCustomDurations, loadState } = timerSlice.actions
export default timerSlice.reducer
```

### Pattern 2: Custom Middleware for Persistence
**What:** Middleware that intercepts actions and persists state to IndexedDB
**When to use:** When you need to persist Redux state with custom logic (debouncing, conditional saves)
**Example:**
```typescript
// Custom middleware for timer persistence
import { Middleware, isAnyOf } from '@reduxjs/toolkit'
import { saveTimerState, saveTimerStateImmediate } from '../../services/persistence'
import { timerSlice } from './timerSlice'

// Debounce timeout reference
let saveTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 2000

export const timerPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // First, let the action pass through
  const result = next(action)

  // Only handle timer actions
  if (!action.type.startsWith('timer/')) {
    return result
  }

  const state = store.getState() as RootState
  const timerState = state.timer

  // Debounce saves while running, immediate when paused/stopped
  if (timerState.isRunning) {
    // Clear any pending save
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    // Debounce the save
    saveTimeout = setTimeout(() => {
      saveTimerState(timerState)
    }, DEBOUNCE_MS)
  } else {
    // Save immediately when paused or stopped
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }
    saveTimerStateImmediate(timerState)
  }

  return result
}
```

### Pattern 3: Visibility Change Handling
**What:** Recalculate timer when tab becomes visible after being in background
**When to use:** For accurate timer state after browser throttling
**Example:**
```typescript
// In timerSlice or useTimer hook
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Recalculate time remaining based on stored startTime
      dispatch(tick()) // This will recalculate from startTime
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [])
```

### Pattern 4: Compatibility Layer Hook
**What:** Keep existing useTimer hook API while using Redux internally
**When to use:** When migrating incrementally to avoid breaking changes
**Example:**
```typescript
// Refactored useTimer.ts to use Redux
import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  start,
  pause,
  resume,
  reset,
  tick,
  skip,
  setMode,
  setCustomDurations,
  loadState,
} from '../features/timer/timerSlice'
import { loadTimerState, saveSettings, loadSettings } from '../services/persistence'
import { TimerMode } from '../types/timer'

export function useTimer(options: UseTimerOptions = {}) {
  const { onSessionComplete } = options
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.timer)
  // ... existing logic adapted to use dispatch

  // Existing initialization, tick interval, session completion logic...
  // Replace useReducer dispatch with Redux dispatch

  return {
    state,
    start: useCallback(() => dispatch(start()), [dispatch]),
    pause: useCallback(() => dispatch(pause()), [dispatch]),
    resume: useCallback(() => dispatch(resume()), [dispatch]),
    reset: useCallback(() => dispatch(reset()), [dispatch]),
    skip: useCallback(() => dispatch(skip()), [dispatch]),
    setMode: useCallback((mode: TimerMode) => dispatch(setMode(mode)), [dispatch]),
    // ... rest of API
  }
}
```

### Pattern 5: Store with Middleware
**What:** Add slice and middleware to store configuration
**When to use:** When adding new slice to Redux store
**Example:**
```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../features/timer/timerSlice'
import { timerPersistenceMiddleware } from '../features/timer/timerMiddleware'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state if needed
        ignoredPaths: ['timer.startTime'],
      },
    }).prepend(timerPersistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Anti-Patterns to Avoid
- **Middleware modifying actions:** Middleware should not mutate actions, only observe them
- **Synchronous IndexedDB in middleware:** Use setTimeout for debouncing or use a thunk
- **Storing non-serializable values:** startTime as number is fine, but don't store Date objects
- **Missing visibility handling:** Without it, background tabs will have inaccurate timers

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State management | useReducer | createSlice | Auto-generates actions, Immer for immutability |
| Debouncing | Manual setTimeout in components | Middleware with setTimeout | Centralized, cleaner, testable |
| IndexedDB wrapper | Raw IndexedDB API | idb library | Promise-based, cleaner API, handles edge cases |
| Visibility handling | Ignore it | visibilitychange event | Browser throttles timers in background tabs |

**Key insight:** The current useReducer already uses timestamps for accuracy - this must be preserved in the Redux implementation. The key improvement is adding proper visibility change handling and centralizing persistence in middleware.

## Common Pitfalls

### Pitfall 1: Timer Drift in Background Tabs
**What goes wrong:** setInterval throttles to 1 second (or slower) in background tabs, causing timer to run slow
**Why it happens:** Browsers throttle timers in inactive tabs to conserve battery
**How to avoid:** Always calculate timeRemaining from startTime timestamp, not by counting ticks
**Warning signs:** Timer takes longer than expected when tab was in background

### Pitfall 2: Middleware Running Before State Update
**What goes wrong:** Middleware reads stale state because getState() is called before reducer processes action
**Why it happens:** Incorrect middleware ordering or calling getState at wrong time
**How to avoid:** Call next(action) first, then getState() returns updated state
**Warning signs:** Persisted data doesn't match UI state

### Pitfall 3: Debounce Overlapping Saves
**What goes wrong:** Multiple debounced saves overlap, causing race conditions
**Why it happens:** Clearing timeout without null check, or not handling the paused/stopped case
**How to avoid:** Clear timeout before setting new one, handle both running and non-running states
**Warning signs:** IndexedDB has inconsistent data, or saves happen too frequently

### Pitfall 4: Losing State on Page Reload
**What goes wrong:** Timer state lost when page is reloaded because persistence didn't complete
**Why it happens:** Not saving immediately on pause/stop, only debounced
**How to avoid:** Save immediately when timer is paused, stopped, or page is about to unload
**Warning signs:** Timer resets to default on page refresh

### Pitfall 5: Tick Interval Memory Leak
**What goes wrong:** setInterval not cleaned up properly, causing multiple intervals running
**Why it happens:** Missing cleanup in useEffect or not using useRef properly
**How to avoid:** Always return cleanup function in useEffect, clear interval on unmount
**Warning signs:** Timer counts down too fast, multiple alerts firing

## Code Examples

### Complete Timer Slice
```typescript
// src/features/timer/timerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimerState, TimerMode } from '../../types/timer'
import { DURATIONS, SESSIONS_BEFORE_LONG_BREAK } from '../../constants/timer'

const initialState: TimerState = {
  mode: 'focus',
  duration: DURATIONS.focus,
  timeRemaining: DURATIONS.focus,
  isRunning: false,
  sessionCount: 1,
  startTime: null,
  pausedTimeRemaining: null,
}

const timerSlice = createSlice({
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
      if (!state.startTime) return
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
      state.timeRemaining = Math.max(0, state.duration - elapsed)
    },
    skip: (state) => {
      const isFocusMode = state.mode === 'focus'
      if (isFocusMode) {
        if (state.sessionCount >= SESSIONS_BEFORE_LONG_BREAK) {
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
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload
      state.duration = DURATIONS[action.payload]
      state.timeRemaining = DURATIONS[action.payload]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    setCustomDurations: (state, action: PayloadAction<{ focus: number; shortBreak: number; longBreak: number }>) => {
      const { focus, shortBreak, longBreak } = action.payload
      const durationMap = { focus, shortBreak, longBreak }
      state.duration = durationMap[state.mode]
      state.timeRemaining = durationMap[state.mode]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    loadState: (_state, action: PayloadAction<TimerState>) => {
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
  skip,
  setMode,
  setCustomDurations,
  loadState,
} = timerSlice.actions

export default timerSlice.reducer
```

### Custom Persistence Middleware
```typescript
// src/features/timer/timerMiddleware.ts
import { Middleware, isAnyOf } from '@reduxjs/toolkit'
import { saveTimerState, saveTimerStateImmediate } from '../../services/persistence'
import { timerSlice } from './timerSlice'
import type { RootState } from '../../app/store'

let saveTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 2000

export const timerPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // Let action pass through first
  const result = next(action)

  // Only handle timer actions
  if (!action.type.startsWith('timer/')) {
    return result
  }

  const state = store.getState() as RootState
  const timerState = state.timer

  // Debounce saves while running, immediate when paused/stopped
  if (timerState.isRunning) {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      saveTimerState(timerState)
    }, DEBOUNCE_MS)
  } else {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }
    saveTimerStateImmediate(timerState)
  }

  return result
}
```

### Compatibility Layer Hook (Refactored useTimer)
```typescript
// src/hooks/useTimer.ts (refactored)
import { useEffect, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  start,
  pause,
  resume,
  reset,
  tick,
  skip,
  setMode,
  setCustomDurations,
  loadState,
} from '../features/timer/timerSlice'
import { loadTimerState, saveSettings, loadSettings } from '../services/persistence'
import { notifySessionComplete, requestPermission } from '../services/notifications'
import { TimerMode } from '../types/timer'

interface UseTimerOptions {
  onSessionComplete?: () => void
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onSessionComplete } = options
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.timer)
  const intervalRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)
  const previousTimeRef = useRef<number>(state.timeRemaining)
  const autoStartRef = useRef(false)
  const [autoStart, setAutoStartState] = useState(false)

  // Load persisted state on mount
  useEffect(() => {
    let mounted = true

    async function loadStateAsync() {
      try {
        const settings = await loadSettings()
        const loadedState = await loadTimerState()

        if (mounted) {
          dispatch(loadState(loadedState))
          setAutoStartState(settings.autoStart)
          autoStartRef.current = settings.autoStart
          isInitializedRef.current = true
        }
      } catch (error) {
        console.error('Failed to load timer state:', error)
        if (mounted) {
          isInitializedRef.current = true
        }
      }
    }

    loadStateAsync()

    return () => {
      mounted = false
    }
  }, [dispatch])

  // Tick interval effect
  useEffect(() => {
    if (state.isRunning && state.startTime) {
      intervalRef.current = window.setInterval(() => {
        dispatch(tick())
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRunning, state.startTime, dispatch])

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isRunning) {
        dispatch(tick())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [state.isRunning, dispatch])

  // Session completion handler
  useEffect(() => {
    if (!isInitializedRef.current) return

    const wasRunning = previousTimeRef.current > 0
    const isNowComplete = state.timeRemaining === 0

    if (wasRunning && isNowComplete) {
      notifySessionComplete(state.mode)

      if (state.mode === 'focus') {
        onSessionComplete?.()
      }

      setTimeout(() => {
        dispatch(skip())

        if (autoStartRef.current) {
          setTimeout(() => {
            dispatch(start())
          }, 100)
        }
      }, 100)
    }

    previousTimeRef.current = state.timeRemaining
  }, [state.timeRemaining, state.mode, onSessionComplete, dispatch])

  // Notification permission
  useEffect(() => {
    function handleFirstInteraction() {
      requestPermission()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  const startTimer = useCallback(() => dispatch(start()), [dispatch])
  const pauseTimer = useCallback(() => dispatch(pause()), [dispatch])
  const resumeTimer = useCallback(() => dispatch(resume()), [dispatch])
  const resetTimer = useCallback(() => dispatch(reset()), [dispatch])
  const skipTimer = useCallback(() => dispatch(skip()), [dispatch])
  const setModeTimer = useCallback((mode: TimerMode) => dispatch(setMode(mode)), [dispatch])

  const setAutoStartValue = useCallback((value: boolean) => {
    setAutoStartState(value)
    autoStartRef.current = value
    saveSettings({
      autoStart: value,
      focusDuration: state.duration,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
    })
  }, [state.duration])

  const setCustomDurationsValue = useCallback((durations: { focus: number; shortBreak: number; longBreak: number }) => {
    dispatch(setCustomDurations(durations))
    saveSettings({
      autoStart: autoStartRef.current,
      focusDuration: durations.focus,
      shortBreakDuration: durations.shortBreak,
      longBreakDuration: durations.longBreak,
    })
  }, [dispatch])

  return {
    state,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    reset: resetTimer,
    skip: skipTimer,
    setMode: setModeTimer,
    autoStart,
    setAutoStart: setAutoStartValue,
    setCustomDurations: setCustomDurationsValue,
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useReducer | createSlice | This phase | Centralized state, DevTools, easier testing |
| Component-level persistence | Middleware | This phase | Cleaner, centralized, more reliable |
| No visibility handling | visibilitychange listener | This phase | Accurate timers in background tabs |
| Manual action types | Auto-generated by createSlice | This phase | Less boilerplate, type-safe |

**Deprecated/outdated:**
- useReducer for global state: Should be replaced with Redux slices
- Component-level IndexedDB calls: Should be handled by middleware

## Open Questions

1. **Session Completion Callback Location**
   - What we know: onSessionComplete callback needs to be called when focus session completes
   - What's unclear: Should this be in the slice (via listener middleware) or in the hook?
   - Recommendation: Keep in useTimer hook for now, similar to current implementation

2. **Settings Persistence in Redux**
   - What we know: Settings (autoStart, custom durations) are currently saved separately
   - What's unclear: Should settings also be in Redux with persistence?
   - Recommendation: Keep settings in IndexedDB for now, handled in future phase (Phase 11)

3. **Timer Accuracy on Visibility Change**
   - What we know: Current loadTimerState recalculates on page load
   - What's unclear: Should we also recalculate on every visibility change or just when becoming visible?
   - Recommendation: Dispatch tick() when visibility changes to 'visible' and timer is running

## Sources

### Primary (HIGH confidence)
- https://redux-toolkit.js.org/api/createSlice - Slice creation patterns
- https://redux-toolkit.js.org/api/configureStore - Store configuration with middleware
- https://redux-toolkit.js.org/api/applyMiddleware - Middleware pattern
- https://redux.js.org/understanding/history-and-design/middleware - Redux middleware concept

### Secondary (MEDIUM confidence)
- https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API - Visibility API documentation
- https://github.com/jakearchibald/idb - idb library for IndexedDB

### Tertiary (LOW confidence)
- None - findings verified with existing codebase and official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed, existing code uses them
- Architecture: HIGH - Follows Phase 7 research recommendations
- Pitfalls: HIGH - Based on existing useReducer implementation and known browser behavior

**Research date:** 2026-02-21
**Valid until:** 2026-05-21 (Redux Toolkit patterns are stable)

**Current versions verified:**
- @reduxjs/toolkit: 2.11.2 (already installed)
- react-redux: 9.2.0 (already installed)
- idb: 8.0.0 (already installed)

**Key files that will be modified:**
- src/app/store.ts - Add timer slice and middleware
- src/hooks/useTimer.ts - Refactor to use Redux (maintain API)
- src/features/timer/timerSlice.ts - NEW FILE
- src/features/timer/timerMiddleware.ts - NEW FILE (optional, can be inline)

**Key files that will NOT change:**
- src/types/timer.ts - Types remain the same
- src/constants/timer.ts - Constants remain the same
- src/services/persistence.ts - Keep existing functions
- src/services/db.ts - Keep existing IndexedDB layer
