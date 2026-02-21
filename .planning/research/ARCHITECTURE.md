# Architecture Research: Redux Toolkit Integration

**Domain:** Pomodoro Timer — State Management Migration
**Researched:** 2026-02-21
**Confidence:** HIGH

## Executive Summary

This research document outlines the architecture for migrating an existing Pomodoro Timer application from React hooks (useReducer, useState) to Redux Toolkit. The existing architecture uses a well-structured hook-based approach with clear separation of concerns. The migration path prioritizes incremental adoption, maintaining existing IndexedDB persistence, and preserving the component API surface while centralizing state management.

**Key architectural decisions:**
1. **Slice-based organization** — Mirror existing hook boundaries (timer, session, history, ui)
2. **Persistence via Redux middleware** — Replace direct IndexedDB calls with middleware pattern
3. **Hook compatibility layer** — Existing components work with minimal changes via custom hooks
4. **Thunk for async operations** — Session saving, tag suggestions, and history fetching

---

## Current Architecture Overview

### Existing Hook Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   useTimer   │  │useSessionNotes│  │useSessionHistory│        │
│  │  (useReducer)│  │  (useState)  │  │  (useState)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐         │                   │
│  │useSessionManager│  │ persistence.ts │      │                   │
│  │  (composes)  │  │  (IndexedDB) │      │                   │
│  └──────────────┘  └──────────────┘  ┌──────▼───────┐          │
│                                      │ sessionStore.ts│          │
│                                      │  (IndexedDB) │          │
│                                      └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### State Domains

| Domain | Current Location | State Type | Persistence |
|--------|-----------------|------------|-------------|
| Timer | `useTimer.ts` | useReducer | IndexedDB (timerState) |
| Session Notes | `useSessionNotes.ts` | useState | In-memory only |
| Session Records | `useSessionManager.ts` | useRef + IndexedDB | IndexedDB (sessions) |
| History | `useSessionHistory.ts` | useState | IndexedDB (sessions) |
| UI | `App.tsx` | useState | None |
| Settings | `useTimer.ts` + `persistence.ts` | useState | IndexedDB (settings) |

---

## Recommended Redux Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Component Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │TimerDisplay │ │ NotePanel   │ │HistoryList  │ │  Sidebar  │ │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ │
└─────────┼───────────────┼───────────────┼──────────────┼───────┘
          │               │               │              │
          └───────────────┴───────┬───────┴──────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                    Custom Hooks Layer                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  useTimer() ┊ useSessionNotes() ┊ useSessionHistory()   │   │
│  │  (connects to Redux, maintains existing API)            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                      Redux Store                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ timerSlice  │ │ sessionSlice│ │ historySlice│ │  uiSlice  │ │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├───────────┤ │
│  │ mode        │ │ noteText    │ │ sessions    │ │ viewMode  │ │
│  │ timeRemaining│ │ tags        │ │ filters    │ │ isDrawerOpen│ │
│  │ isRunning   │ │ saveStatus  │ │ searchQuery │ │ showSummary│ │
│  │ duration    │ │ lastSaved   │ │ isLoading   │ │ selected   │ │
│  │ sessionCount│ │             │ │             │ │            │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                   Middleware Layer                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ persistenceMiddleware│ │ sessionMiddleware│ │  thunkMiddleware │   │
│  │ (IndexedDB sync)│ │ (auto-save)     │ │ (async ops)     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### State Shape

```typescript
// Root state structure
interface RootState {
  timer: TimerSliceState
  session: SessionSliceState
  history: HistorySliceState
  ui: UISliceState
}

// Timer slice — replaces useTimer reducer
interface TimerSliceState {
  mode: TimerMode                    // 'focus' | 'shortBreak' | 'longBreak'
  duration: number                   // current mode duration in seconds
  timeRemaining: number              // countdown value
  isRunning: boolean
  sessionCount: number               // for long break logic
  startTime: number | null           // timestamp when started
  pausedTimeRemaining: number | null // stored when paused
  settings: {                        // merged from persistence.ts
    autoStart: boolean
    focusDuration: number
    shortBreakDuration: number
    longBreakDuration: number
  }
}

// Session slice — replaces useSessionNotes + useSessionManager
interface SessionSliceState {
  // Current session notes (ephemeral)
  currentSession: {
    noteText: string
    tags: string[]
    saveStatus: 'idle' | 'saving' | 'saved'
    lastSaved: number | null
  }
  // Active session tracking
  activeSession: {
    id: string | null
    startTime: number | null
    mode: TimerMode
    isCheckpointsEnabled: boolean
  } | null
  // Tag management
  tags: {
    allTags: TagData[]
    suggestions: string[]
    isLoading: boolean
  }
}

// History slice — replaces useSessionHistory
interface HistorySliceState {
  sessions: SessionRecord[]
  filteredSessions: SessionRecord[]
  filters: {
    dateFilter: DateFilter
    searchQuery: string
  }
  isLoading: boolean
  error: string | null
}

// UI slice — replaces App.tsx component state
interface UISliceState {
  viewMode: 'timer' | 'history' | 'stats' | 'settings'
  modals: {
    showSummary: boolean
    completedSession: CompletedSession | null
  }
  drawer: {
    isOpen: boolean
    selectedSessionId: string | null
  }
}
```

---

## Project Structure

### Recommended Folder Organization

```
src/
├── store/
│   ├── index.ts                 # Store configuration, middleware setup
│   ├── slices/
│   │   ├── timerSlice.ts        # Timer state + actions
│   │   ├── sessionSlice.ts      # Session notes + active session
│   │   ├── historySlice.ts      # Session history + filters
│   │   └── uiSlice.ts           # UI state (view mode, modals)
│   ├── middleware/
│   │   ├── persistenceMiddleware.ts  # IndexedDB sync
│   │   └── sessionMiddleware.ts      # Auto-save checkpoints
│   └── thunks/
│       ├── sessionThunks.ts     # Async session operations
│       └── historyThunks.ts     # History fetching
├── hooks/
│   ├── useTimer.ts              # Redux-connected (maintains API)
│   ├── useSessionNotes.ts       # Redux-connected (maintains API)
│   ├── useSessionManager.ts     # Redux-connected (maintains API)
│   ├── useSessionHistory.ts     # Redux-connected (maintains API)
│   └── useAppDispatch.ts        # Typed dispatch hook
├── selectors/
│   ├── timerSelectors.ts        # Memoized timer selectors
│   ├── sessionSelectors.ts      # Memoized session selectors
│   └── historySelectors.ts      # Memoized history selectors
└── types/
    └── redux.ts                 # Redux-specific type definitions
```

### Structure Rationale

- **`store/slices/`**: Each slice corresponds to a logical domain that previously had its own hook. This makes migration incremental — one slice at a time.
- **`store/middleware/`**: Persistence logic moves from hooks into middleware, keeping slices pure and testable.
- **`hooks/`**: Existing hook APIs are preserved but implementations switch to Redux. Components require zero or minimal changes.
- **`selectors/`**: Complex filtering (like history search) moves to memoized selectors for performance.

---

## Slice Implementation Details

### Timer Slice

**Replaces:** `useTimer.ts` reducer logic

```typescript
// src/store/slices/timerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimerMode } from '../../types/timer'

interface TimerState {
  mode: TimerMode
  duration: number
  timeRemaining: number
  isRunning: boolean
  sessionCount: number
  startTime: number | null
  pausedTimeRemaining: number | null
  settings: {
    autoStart: boolean
    focusDuration: number
    shortBreakDuration: number
    longBreakDuration: number
  }
}

const DEFAULT_DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const initialState: TimerState = {
  mode: 'focus',
  duration: DEFAULT_DURATIONS.focus,
  timeRemaining: DEFAULT_DURATIONS.focus,
  isRunning: false,
  sessionCount: 1,
  startTime: null,
  pausedTimeRemaining: null,
  settings: {
    autoStart: false,
    ...DEFAULT_DURATIONS,
  },
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
      if (state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
        state.timeRemaining = Math.max(0, state.duration - elapsed)
      }
    },
    skip: (state) => {
      // Logic for mode transition (focus -> break, break -> focus)
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
      state.duration = state.settings[`${state.mode}Duration`]
      state.timeRemaining = state.duration
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload
      state.duration = state.settings[`${action.payload}Duration`]
      state.timeRemaining = state.duration
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },
    setCustomDurations: (state, action: PayloadAction<{
      focus: number
      shortBreak: number
      longBreak: number
    }>) => {
      state.settings = { ...state.settings, ...action.payload }
      state.duration = action.payload[state.mode]
      state.timeRemaining = state.duration
      state.isRunning = false
      state.startTime = null
    },
    setAutoStart: (state, action: PayloadAction<boolean>) => {
      state.settings.autoStart = action.payload
    },
    // Used by persistence middleware to hydrate state
    hydrateTimerState: (state, action: PayloadAction<Partial<TimerState>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const {
  start, pause, resume, reset, tick, skip,
  setMode, setCustomDurations, setAutoStart, hydrateTimerState
} = timerSlice.actions

export default timerSlice.reducer
```

### Session Slice

**Replaces:** `useSessionNotes.ts` + `useSessionManager.ts` state

```typescript
// src/store/slices/sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SessionRecord, TagData } from '../../types/session'

interface SessionState {
  currentSession: {
    noteText: string
    tags: string[]
    saveStatus: 'idle' | 'saving' | 'saved'
    lastSaved: number | null
  }
  activeSession: {
    id: string
    startTime: number
    plannedDuration: number
    checkpointCount: number
  } | null
  tags: {
    allTags: TagData[]
    suggestions: string[]
    isLoading: boolean
  }
}

const initialState: SessionState = {
  currentSession: {
    noteText: '',
    tags: [],
    saveStatus: 'idle',
    lastSaved: null,
  },
  activeSession: null,
  tags: {
    allTags: [],
    suggestions: [],
    isLoading: false,
  },
}

const MAX_NOTE_LENGTH = 2000

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Note editing
    setNoteText: (state, action: PayloadAction<string>) => {
      if (action.payload.length <= MAX_NOTE_LENGTH) {
        state.currentSession.noteText = action.payload
        state.currentSession.saveStatus = 'saving'
      }
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.currentSession.tags = action.payload
      state.currentSession.saveStatus = 'saving'
    },
    markNoteSaved: (state) => {
      state.currentSession.saveStatus = 'saved'
      state.currentSession.lastSaved = Date.now()
    },
    resetNotes: (state) => {
      state.currentSession = {
        noteText: '',
        tags: [],
        saveStatus: 'idle',
        lastSaved: null,
      }
    },
    // Active session lifecycle
    startSession: (state, action: PayloadAction<{
      id: string
      startTime: number
      plannedDuration: number
    }>) => {
      state.activeSession = {
        ...action.payload,
        checkpointCount: 0,
      }
    },
    incrementCheckpoint: (state) => {
      if (state.activeSession) {
        state.activeSession.checkpointCount += 1
      }
    },
    endSession: (state) => {
      state.activeSession = null
    },
    // Tags
    setTagSuggestions: (state, action: PayloadAction<string[]>) => {
      state.tags.suggestions = action.payload
    },
    setAllTags: (state, action: PayloadAction<TagData[]>) => {
      state.tags.allTags = action.payload
    },
  },
})

export const {
  setNoteText, setTags, markNoteSaved, resetNotes,
  startSession, incrementCheckpoint, endSession,
  setTagSuggestions, setAllTags
} = sessionSlice.actions

export default sessionSlice.reducer
```

### History Slice

**Replaces:** `useSessionHistory.ts`

```typescript
// src/store/slices/historySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SessionRecord } from '../../types/session'
import { DateFilter } from '../../utils/dateUtils'

interface HistoryState {
  sessions: SessionRecord[]
  filters: {
    dateFilter: DateFilter
    searchQuery: string
  }
  isLoading: boolean
  error: string | null
}

const initialState: HistoryState = {
  sessions: [],
  filters: {
    dateFilter: 'all',
    searchQuery: '',
  },
  isLoading: false,
  error: null,
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setSessions: (state, action: PayloadAction<SessionRecord[]>) => {
      state.sessions = action.payload
    },
    addSession: (state, action: PayloadAction<SessionRecord>) => {
      state.sessions.unshift(action.payload)
    },
    updateSession: (state, action: PayloadAction<SessionRecord>) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.sessions[index] = action.payload
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload)
    },
    setDateFilter: (state, action: PayloadAction<DateFilter>) => {
      state.filters.dateFilter = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setSessions, addSession, updateSession, deleteSession,
  setDateFilter, setSearchQuery, setLoading, setError
} = historySlice.actions

export default historySlice.reducer
```

### UI Slice

**Replaces:** Component-level state in `App.tsx`

```typescript
// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SessionRecord } from '../../types/session'

type ViewMode = 'timer' | 'history' | 'stats' | 'settings'

interface UISliceState {
  viewMode: ViewMode
  modals: {
    showSummary: boolean
    completedSession: {
      durationString: string
      noteText: string
      tags: string[]
      startTimestamp: string
    } | null
  }
  drawer: {
    isOpen: boolean
    selectedSessionId: string | null
  }
}

const initialState: UISliceState = {
  viewMode: 'timer',
  modals: {
    showSummary: false,
    completedSession: null,
  },
  drawer: {
    isOpen: false,
    selectedSessionId: null,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload
    },
    showSessionSummary: (state, action: PayloadAction<UISliceState['modals']['completedSession']>) => {
      state.modals.showSummary = true
      state.modals.completedSession = action.payload
    },
    hideSessionSummary: (state) => {
      state.modals.showSummary = false
      state.modals.completedSession = null
    },
    openDrawer: (state, action: PayloadAction<string>) => {
      state.drawer.isOpen = true
      state.drawer.selectedSessionId = action.payload
    },
    closeDrawer: (state) => {
      state.drawer.isOpen = false
      state.drawer.selectedSessionId = null
    },
  },
})

export const {
  setViewMode, showSessionSummary, hideSessionSummary,
  openDrawer, closeDrawer
} = uiSlice.actions

export default uiSlice.reducer
```

---

## Middleware for Persistence

### Persistence Middleware

**Replaces:** Direct IndexedDB calls in hooks

```typescript
// src/store/middleware/persistenceMiddleware.ts
import { Middleware } from '@reduxjs/toolkit'
import { RootState } from '../index'
import { saveTimerState, saveTimerStateImmediate, saveSettings } from '../../services/persistence'

let timerSaveTimeout: ReturnType<typeof setTimeout> | null = null

export const persistenceMiddleware: Middleware<{}, RootState> = store => next => action => {
  const result = next(action)
  const state = store.getState()

  // Handle timer state persistence
  if (action.type.startsWith('timer/')) {
    if (timerSaveTimeout) {
      clearTimeout(timerSaveTimeout)
    }

    const timerState = state.timer
    if (timerState.isRunning) {
      // Debounce while running
      timerSaveTimeout = setTimeout(() => {
        saveTimerState({
          mode: timerState.mode,
          duration: timerState.duration,
          timeRemaining: timerState.timeRemaining,
          isRunning: timerState.isRunning,
          sessionCount: timerState.sessionCount,
          startTime: timerState.startTime,
          pausedTimeRemaining: timerState.pausedTimeRemaining,
        })
      }, 2000)
    } else {
      // Immediate when stopped
      saveTimerStateImmediate({
        mode: timerState.mode,
        duration: timerState.duration,
        timeRemaining: timerState.timeRemaining,
        isRunning: timerState.isRunning,
        sessionCount: timerState.sessionCount,
        startTime: timerState.startTime,
        pausedTimeRemaining: timerState.pausedTimeRemaining,
      })
    }
  }

  // Handle settings persistence
  if (action.type === 'timer/setAutoStart' || action.type === 'timer/setCustomDurations') {
    saveSettings(state.timer.settings)
  }

  return result
}
```

---

## Hook Compatibility Layer

### useTimer Hook (Redux Version)

Maintains the same API as the original hook.

```typescript
// src/hooks/useTimer.ts (Redux version)
import { useCallback, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import {
  start, pause, resume, reset, skip, tick,
  setMode, setCustomDurations, setAutoStart
} from '../store/slices/timerSlice'
import { notifySessionComplete, requestPermission } from '../services/notifications'
import { loadTimerState, loadSettings } from '../services/persistence'
import { hydrateTimerState } from '../store/slices/timerSlice'

interface UseTimerOptions {
  onSessionComplete?: () => void
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onSessionComplete } = options
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.timer)
  const intervalRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)
  const previousTimeRef = useRef<number>(state.timeRemaining)

  // Hydrate from IndexedDB on mount
  useEffect(() => {
    async function hydrate() {
      const [timerState, settings] = await Promise.all([
        loadTimerState(),
        loadSettings(),
      ])

      dispatch(hydrateTimerState({
        ...timerState,
        settings: {
          autoStart: settings.autoStart,
          focusDuration: settings.focusDuration,
          shortBreakDuration: settings.shortBreakDuration,
          longBreakDuration: settings.longBreakDuration,
        }
      }))

      isInitializedRef.current = true
    }

    hydrate()
  }, [dispatch])

  // Handle tick updates
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

  // Handle session completion
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
        if (state.settings.autoStart) {
          setTimeout(() => dispatch(start()), 100)
        }
      }, 100)
    }

    previousTimeRef.current = state.timeRemaining
  }, [state.timeRemaining, state.mode, state.settings.autoStart, dispatch, onSessionComplete])

  // Action wrappers (maintain existing API)
  const startTimer = useCallback(() => dispatch(start()), [dispatch])
  const pauseTimer = useCallback(() => dispatch(pause()), [dispatch])
  const resumeTimer = useCallback(() => dispatch(resume()), [dispatch])
  const resetTimer = useCallback(() => dispatch(reset()), [dispatch])
  const skipTimer = useCallback(() => dispatch(skip()), [dispatch])
  const changeMode = useCallback((mode: TimerMode) => dispatch(setMode(mode)), [dispatch])
  const updateDurations = useCallback((durations: {
    focus: number
    shortBreak: number
    longBreak: number
  }) => dispatch(setCustomDurations(durations)), [dispatch])
  const updateAutoStart = useCallback((value: boolean) => dispatch(setAutoStart(value)), [dispatch])

  return {
    state,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    reset: resetTimer,
    skip: skipTimer,
    setMode: changeMode,
    autoStart: state.settings.autoStart,
    setAutoStart: updateAutoStart,
    setCustomDurations: updateDurations,
  }
}
```

---

## Build Order (Incremental Migration)

### Phase 1: Foundation
1. **Install dependencies**: `@reduxjs/toolkit`, `react-redux`
2. **Create store structure**: `store/index.ts` with basic configuration
3. **Add provider**: Wrap App with Redux Provider

### Phase 2: Timer Slice (Highest Impact)
1. **Create timerSlice.ts**: Migrate useTimer reducer logic
2. **Create persistenceMiddleware.ts**: Handle IndexedDB sync
3. **Update useTimer.ts**: Connect to Redux while maintaining API
4. **Verify**: Timer functionality unchanged

### Phase 3: UI Slice
1. **Create uiSlice.ts**: Migrate App.tsx component state
2. **Update App.tsx**: Connect viewMode, modals, drawer to Redux
3. **Verify**: View switching, modals, drawer work correctly

### Phase 4: Session Slice
1. **Create sessionSlice.ts**: Migrate useSessionNotes + useSessionManager
2. **Create sessionThunks.ts**: Async session save operations
3. **Update useSessionNotes.ts**: Connect to Redux
4. **Update useSessionManager.ts**: Connect to Redux
5. **Verify**: Note editing, session saving work correctly

### Phase 5: History Slice
1. **Create historySlice.ts**: Migrate useSessionHistory
2. **Create historySelectors.ts**: Memoized filtering logic
3. **Create historyThunks.ts**: Async history fetching
4. **Update useSessionHistory.ts**: Connect to Redux
5. **Verify**: History list, filtering, search work correctly

### Phase 6: Cleanup
1. **Remove legacy code**: Old hook implementations (keep Redux versions)
2. **Add tests**: Slice reducers, selectors, thunks
3. **Performance audit**: Selector memoization, unnecessary re-renders

---

## Data Flow

### Timer Tick Flow

```
[setInterval in useTimer]
         ↓
   dispatch(tick())
         ↓
   timerSlice reducer
         ↓
   state.timeRemaining updated
         ↓
   persistenceMiddleware (debounced save)
         ↓
   IndexedDB (timerState store)
         ↓
   React re-renders TimerDisplay
```

### Session Complete Flow

```
[Timer reaches 0]
         ↓
   useTimer effect detects completion
         ↓
   onSessionComplete callback
         ↓
   sessionThunks.saveSession (async)
         ↓
   IndexedDB (sessions store)
         ↓
   dispatch(addSession())
         ↓
   historySlice updated
         ↓
   dispatch(showSessionSummary())
         ↓
   uiSlice updated → modal displayed
```

### Note Auto-Save Flow

```
[User types in NotePanel]
         ↓
   dispatch(setNoteText(text))
         ↓
   sessionSlice reducer (saveStatus: 'saving')
         ↓
   sessionMiddleware (debounced)
         ↓
   dispatch(markNoteSaved())
         ↓
   sessionSlice reducer (saveStatus: 'saved')
```

---

## Integration Points

### New vs Modified Components

| Component | Change Type | Changes Required |
|-----------|-------------|------------------|
| `App.tsx` | Modified | Remove useState for viewMode, modals, drawer; use useSelector/useDispatch |
| `TimerDisplay.tsx` | Unchanged | Already receives props from useTimer |
| `TimerControls.tsx` | Unchanged | Already receives props from useTimer |
| `NotePanel.tsx` | Unchanged | Already receives props from useSessionNotes |
| `HistoryList.tsx` | Unchanged | Already receives props from useSessionHistory |
| `HistoryDrawer.tsx` | Unchanged | Already receives props via callbacks |
| `useTimer.ts` | Modified | Internal implementation switches to Redux |
| `useSessionNotes.ts` | Modified | Internal implementation switches to Redux |
| `useSessionManager.ts` | Modified | Internal implementation switches to Redux |
| `useSessionHistory.ts` | Modified | Internal implementation switches to Redux |

### External Service Integrations

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| IndexedDB | Middleware | All DB calls move to middleware |
| Notifications | Hook (useTimer) | Keep in useTimer, triggered by completion |
| Keyboard shortcuts | Hook (useKeyboardShortcuts) | Unchanged, operates on timer actions |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Putting Non-Serializable State in Redux

**What people do:** Store DOM refs, promises, or complex objects in Redux state.

**Why it's wrong:** Redux state must be serializable for DevTools, persistence, and time-travel debugging.

**Do this instead:** Keep refs and ephemeral state in components/hooks. Only put app state in Redux.

```typescript
// BAD
const badSlice = createSlice({
  initialState: { intervalRef: null as number | null },  // Don't store refs
  reducers: { ... }
})

// GOOD
// Keep intervalRef in useTimer hook, not in Redux
```

### Anti-Pattern 2: Direct IndexedDB Calls in Components

**What people do:** Components call `saveSession()` directly.

**Why it's wrong:** Side effects should be in middleware or thunks, not components.

**Do this instead:** Dispatch actions, let middleware handle persistence.

```typescript
// BAD
const handleSave = async () => {
  await saveSession(record)  // Don't do this in components
}

// GOOD
dispatch(saveSessionThunk(record))  // Thunk handles async
```

### Anti-Pattern 3: Storing Derived Data in Redux

**What people do:** Store `filteredSessions` as state instead of computing it.

**Why it's wrong:** Creates synchronization bugs. Derived data should be computed.

**Do this instead:** Use createSelector for memoized derived data.

```typescript
// BAD
// Storing filteredSessions in state

// GOOD
const selectFilteredSessions = createSelector(
  [selectSessions, selectFilters],
  (sessions, filters) => {
    // Compute filtered sessions
    return sessions.filter(...)
  }
)
```

### Anti-Pattern 4: Monolithic Slices

**What people do:** Put all state in one giant `appSlice`.

**Why it's wrong:** Hard to maintain, test, and reason about. Loses modularity.

**Do this instead:** Follow existing hook boundaries — one slice per domain.

---

## Scalability Considerations

| Scale | Considerations |
|-------|----------------|
| Current (100s of sessions) | Current architecture fine. Selectors handle filtering efficiently. |
| 1,000+ sessions | Implement pagination in historyThunks. Use virtualized lists (react-window). |
| 10,000+ sessions | Move filtering to IndexedDB queries instead of in-memory. Consider IndexedDB cursors. |

### Performance Optimizations

1. **Selector Memoization**: Use `createSelector` for all filtered/computed data
2. **Component Memoization**: Wrap display components with `React.memo`
3. **Action Batching**: Redux Toolkit automatically batches actions
4. **Lazy Loading**: History data fetched only when viewMode === 'history'

---

## Sources

- Redux Toolkit Documentation: https://redux-toolkit.js.org/
- Redux Style Guide: https://redux.js.org/style-guide/
- Existing codebase: `/Users/dev/Documents/youtube/pomodoro/src/hooks/*.ts`
- Existing persistence: `/Users/dev/Documents/youtube/pomodoro/src/services/persistence.ts`

---

*Architecture research for: Redux Toolkit integration into Pomodoro Timer*
*Researched: 2026-02-21*
