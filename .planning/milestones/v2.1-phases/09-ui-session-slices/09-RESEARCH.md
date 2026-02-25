# Phase 9: UI and Session Slices - Research

**Researched:** 2026-02-22
**Domain:** Redux Toolkit Slices, UI State Management, Session Notes Persistence
**Confidence:** HIGH

## Summary

This phase migrates UI state (viewMode, modal visibility, drawer state) and session notes from React component state to Redux slices. The key tasks are: (1) create a UI slice for navigation and modal/drawer state, (2) create a Session slice for current session notes and tags with debounced persistence (500ms), (3) update store.ts to include both slices, and (4) maintain the existing useSessionNotes hook API as a compatibility layer.

**Primary recommendation:** Create uiSlice.ts and sessionSlice.ts in the features/ directory following the Phase 8 patterns. Use a custom persistence middleware for session notes with 500ms debounce (matching current useSessionNotes behavior). Update store.ts to include both slices with their middleware, and refactor useSessionNotes to dispatch Redux actions while maintaining the same API.

## User Constraints (from STATE.md)

### Locked Decisions
- Redux Toolkit for state management - Centralized state, DevTools, maintainable architecture
- Custom persistence middleware - Full control over existing IndexedDB layer
- Maintain hook API compatibility - No component changes required during migration
- RTK 2.0+ .withTypes<>() syntax - Modern typed hooks pattern, better type inference

### Claude's Discretion
- File structure organization (features/ui/ vs features/session/ subdirectories)
- Exact middleware implementation details for session persistence

### Deferred Ideas (OUT OF SCOPE)
- History slice (Phase 10)
- Settings slice (Phase 11)

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
│   ├── store.ts              # Store configuration (update to include ui and session slices)
│   └── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
├── features/
│   ├── timer/
│   │   ├── timerSlice.ts    # Existing from Phase 8
│   │   └── timerMiddleware.ts # Existing from Phase 8
│   ├── ui/
│   │   └── uiSlice.ts       # NEW - UI state slice
│   └── session/
│       ├── sessionSlice.ts  # NEW - Session notes slice
│       └── sessionMiddleware.ts # NEW - Session persistence middleware
├── hooks/
│   └── useSessionNotes.ts   # Existing - will be refactored to use Redux
├── services/
│   ├── persistence.ts       # Existing - may need new functions for session state
│   └── db.ts                # Existing - IndexedDB schema and helpers
└── types/
    └── session.ts           # Existing - SessionNoteState type
```

### Pattern 1: UI Slice
**What:** Redux slice for UI state (viewMode, modals, drawer)
**When to use:** For managing navigation and visibility state centrally
**Example:**
```typescript
// src/features/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ViewMode = 'timer' | 'history' | 'stats' | 'settings'

export interface UIState {
  viewMode: ViewMode
  isDrawerOpen: boolean
  selectedSessionId: string | null
  showSummary: boolean
  // Other modal states can be added as needed
}

const initialState: UIState = {
  viewMode: 'timer',
  isDrawerOpen: false,
  selectedSessionId: null,
  showSummary: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload
    },
    openDrawer: (state, action: PayloadAction<string>) => {
      state.isDrawerOpen = true
      state.selectedSessionId = action.payload
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false
      state.selectedSessionId = null
    },
    showSummaryModal: (state) => {
      state.showSummary = true
    },
    hideSummaryModal: (state) => {
      state.showSummary = false
    },
  },
})

export const { setViewMode, openDrawer, closeDrawer, showSummaryModal, hideSummaryModal } = uiSlice.actions
export default uiSlice.reducer
```

### Pattern 2: Session Slice for Notes
**What:** Redux slice for current session notes and tags
**When to use:** For managing session notes state in Redux
**Example:**
```typescript
// src/features/session/sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SessionState {
  noteText: string
  tags: string[]
  saveStatus: 'idle' | 'saving' | 'saved'
  lastSaved: number | null
}

const initialState: SessionState = {
  noteText: '',
  tags: [],
  saveStatus: 'idle',
  lastSaved: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setNoteText: (state, action: PayloadAction<string>) => {
      state.noteText = action.payload
      state.saveStatus = 'saving'
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload
      state.saveStatus = 'saving'
    },
    setSaveStatus: (state, action: PayloadAction<'idle' | 'saving' | 'saved'>) => {
      state.saveStatus = action.payload
    },
    markSaved: (state) => {
      state.saveStatus = 'saved'
      state.lastSaved = Date.now()
    },
    resetSession: (state) => {
      state.noteText = ''
      state.tags = []
      state.saveStatus = 'idle'
      state.lastSaved = null
    },
    loadSession: (state, action: PayloadAction<SessionState>) => {
      return action.payload
    },
  },
})

export const {
  setNoteText,
  setTags,
  setSaveStatus,
  markSaved,
  resetSession,
  loadSession,
} = sessionSlice.actions

export default sessionSlice.reducer
```

### Pattern 3: Session Persistence Middleware
**What:** Middleware that intercepts session actions and persists state to IndexedDB with 500ms debounce
**When to use:** When you need to persist session notes with debouncing
**Example:**
```typescript
// src/features/session/sessionMiddleware.ts
import { Middleware, isAction } from '@reduxjs/toolkit'
import { saveSessionState, loadSessionState } from '../../services/persistence'
import type { RootState } from '../../app/store'

let saveTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 500 // Match current useSessionNotes debounce

export const sessionPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // First, let the action pass through
  const result = next(action)

  // Only process session actions
  if (!isAction(action) || !action.type.startsWith('session/')) {
    return result
  }

  // Only persist on note/tags changes, not status updates
  const relevantActions = ['session/setNoteText', 'session/setTags', 'session/resetSession']
  if (!relevantActions.includes(action.type)) {
    return result
  }

  const state = store.getState() as RootState
  const sessionState = state.session

  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Debounce the save (500ms)
  saveTimeout = setTimeout(() => {
    saveSessionState({
      noteText: sessionState.noteText,
      tags: sessionState.tags,
      lastSaved: Date.now(),
    })
    // Dispatch markSaved action to update status
    store.dispatch({ type: 'session/markSaved' })
  }, DEBOUNCE_MS)

  return result
}
```

### Pattern 4: Compatibility Layer Hook (useSessionNotes)
**What:** Keep existing useSessionNotes hook API while using Redux internally
**When to use:** When migrating incrementally to avoid breaking changes
**Example:**
```typescript
// src/hooks/useSessionNotes.ts (refactored)
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  setNoteText,
  setTags,
  resetSession,
} from '../features/session/sessionSlice'

const MAX_NOTE_LENGTH = 2000

export function useSessionNotes(onSave?: (note: string, tags: string[]) => void) {
  const dispatch = useAppDispatch()
  const { noteText, tags, saveStatus, lastSaved } = useAppSelector((state) => state.session)

  const handleNoteChange = useCallback((text: string) => {
    if (text.length <= MAX_NOTE_LENGTH) {
      dispatch(setNoteText(text))
      onSave?.(text, tags)
    }
  }, [dispatch, tags, onSave])

  const handleTagsChange = useCallback((newTags: string[]) => {
    dispatch(setTags(newTags))
    onSave?.(noteText, newTags)
  }, [dispatch, noteText, onSave])

  const resetNotes = useCallback(() => {
    dispatch(resetSession())
  }, [dispatch])

  return {
    noteText,
    tags,
    saveStatus,
    lastSaved,
    maxNoteLength: MAX_NOTE_LENGTH,
    handleNoteChange,
    handleTagsChange,
    resetNotes,
  }
}
```

### Pattern 5: Store with Multiple Slices
**What:** Add slices and middleware to store configuration
**When to use:** When adding multiple slices to Redux store
**Example:**
```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../features/timer/timerSlice'
import uiReducer from '../features/ui/uiSlice'
import sessionReducer from '../features/session/sessionSlice'
import { timerPersistenceMiddleware } from '../features/timer/timerMiddleware'
import { sessionPersistenceMiddleware } from '../features/session/sessionMiddleware'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    ui: uiReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (timestamps are numbers, not Date objects)
        ignoredActions: ['timer/start', 'timer/resume'],
      },
    })
      .prepend(timerPersistenceMiddleware)
      .prepend(sessionPersistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Anti-Patterns to Avoid
- **Middleware modifying actions:** Middleware should not mutate actions, only observe them
- **Synchronous IndexedDB in middleware:** Use setTimeout for debouncing
- **Storing non-serializable values:** Use numbers for timestamps, not Date objects
- **Inconsistent debounce timing:** Must match 500ms from current useSessionNotes implementation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State management | useState for global state | createSlice | Centralized, DevTools, testable |
| Debouncing | Manual setTimeout in components | Middleware with setTimeout | Centralized, cleaner, testable |
| IndexedDB wrapper | Raw IndexedDB API | idb library | Promise-based, cleaner API, handles edge cases |
| Navigation state | Component-level state | Redux slice | Consistent state, DevTools, easier testing |

**Key insight:** The current useSessionNotes already uses 500ms debounce - this must be preserved in the Redux implementation. The key difference is moving the debounce from the hook to middleware, which centralizes the persistence logic.

## Common Pitfalls

### Pitfall 1: Debounce Timing Mismatch
**What goes wrong:** Session notes save at different rate than before, causing unexpected behavior
**Why it happens:** Using wrong debounce timing (e.g., 2000ms instead of 500ms)
**How to avoid:** Match the existing 500ms debounce from useSessionNotes
**Warning signs:** Users notice different save timing

### Pitfall 2: Circular Dependencies
**What goes wrong:** Store imports middleware, middleware imports store types
**Why it happens:** Circular import between store.ts and middleware files
**How to avoid:** Use type-only imports for RootState in middleware, or define types separately
**Warning signs:** TypeScript errors about circular dependencies

### Pitfall 3: Missing Serializability Check
**What goes wrong:** Middleware stores non-serializable data (Date objects)
**Why it happens:** Using Date.now() but then storing as Date object
**How to avoid:** Always store timestamps as numbers, not Date objects
**Warning signs:** Redux DevTools warnings about non-serializable values

### Pitfall 4: Status Update Race Conditions
**What goes wrong:** saveStatus flickers incorrectly due to race between debounce and status updates
**Why it happens:** Setting status to 'saving' on every keystroke but markSaved fires before debounce completes
**How to avoid:** Consider simplified status (just 'saved') or track pending saves more carefully
**Warning signs:** Status shows 'saved' while user is still typing

### Pitfall 5: Not Resetting Session State
**What goes wrong:** Session notes persist between sessions unexpectedly
**Why it happens:** Not clearing session state when session is completed
**How to avoid:** Dispatch resetSession action when session completes
**Warning signs:** Old notes appear in new sessions

## Code Examples

### Complete UI Slice
```typescript
// src/features/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ViewMode = 'timer' | 'history' | 'stats' | 'settings'

export interface UIState {
  viewMode: ViewMode
  isDrawerOpen: boolean
  selectedSessionId: string | null
  showSummary: boolean
}

const initialState: UIState = {
  viewMode: 'timer',
  isDrawerOpen: false,
  selectedSessionId: null,
  showSummary: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload
    },
    openDrawer: (state, action: PayloadAction<string>) => {
      state.isDrawerOpen = true
      state.selectedSessionId = action.payload
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false
      state.selectedSessionId = null
    },
    showSummaryModal: (state) => {
      state.showSummary = true
    },
    hideSummaryModal: (state) => {
      state.showSummary = false
    },
  },
})

export const {
  setViewMode,
  openDrawer,
  closeDrawer,
  showSummaryModal,
  hideSummaryModal,
} = uiSlice.actions

export default uiSlice.reducer
```

### Complete Session Slice
```typescript
// src/features/session/sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SessionState {
  noteText: string
  tags: string[]
  saveStatus: 'idle' | 'saving' | 'saved'
  lastSaved: number | null
}

const initialState: SessionState = {
  noteText: '',
  tags: [],
  saveStatus: 'idle',
  lastSaved: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setNoteText: (state, action: PayloadAction<string>) => {
      state.noteText = action.payload
      state.saveStatus = 'saving'
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload
      state.saveStatus = 'saving'
    },
    setSaveStatus: (state, action: PayloadAction<'idle' | 'saving' | 'saved'>) => {
      state.saveStatus = action.payload
    },
    markSaved: (state) => {
      state.saveStatus = 'saved'
      state.lastSaved = Date.now()
    },
    resetSession: (state) => {
      state.noteText = ''
      state.tags = []
      state.saveStatus = 'idle'
      state.lastSaved = null
    },
    loadSession: (state, action: PayloadAction<SessionState>) => {
      return action.payload
    },
  },
})

export const {
  setNoteText,
  setTags,
  setSaveStatus,
  markSaved,
  resetSession,
  loadSession,
} = sessionSlice.actions

export default sessionSlice.reducer
```

### Session Persistence Middleware
```typescript
// src/features/session/sessionMiddleware.ts
import { Middleware, isAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

// Session persistence functions (to be added to persistence.ts)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 500

export interface SessionPersistenceData {
  noteText: string
  tags: string[]
  lastSaved: number
}

export const sessionPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // First, let the action pass through
  const result = next(action)

  // Only process session actions
  if (!isAction(action) || !action.type.startsWith('session/')) {
    return result
  }

  // Only persist on note/tags changes, not status updates
  const relevantActions = ['session/setNoteText', 'session/setTags', 'session/resetSession']
  if (!relevantActions.includes(action.type)) {
    return result
  }

  const state = store.getState() as RootState
  const sessionState = state.session

  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Debounce the save (500ms)
  saveTimeout = setTimeout(async () => {
    try {
      // Save to IndexedDB (implement saveSessionState in persistence.ts)
      const { saveSessionState } = await import('../../services/persistence')
      await saveSessionState({
        noteText: sessionState.noteText,
        tags: sessionState.tags,
        lastSaved: Date.now(),
      })
    } catch (error) {
      console.error('Failed to save session state:', error)
    }
    // Dispatch markSaved action to update status
    store.dispatch({ type: 'session/markSaved' })
  }, DEBOUNCE_MS)

  return result
}
```

### Updated Store
```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../features/timer/timerSlice'
import uiReducer from '../features/ui/uiSlice'
import sessionReducer from '../features/session/sessionSlice'
import { timerPersistenceMiddleware } from '../features/timer/timerMiddleware'
import { sessionPersistenceMiddleware } from '../features/session/sessionMiddleware'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    ui: uiReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['timer/start', 'timer/resume'],
      },
    })
      .prepend(timerPersistenceMiddleware)
      .prepend(sessionPersistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Component state (useState) | Redux slices | This phase | Centralized state, DevTools, easier testing |
| Hook-level debounce | Middleware debounce | This phase | Cleaner, centralized persistence |
| Multiple useState calls | Single slice state | This phase | Organized by feature |

**Deprecated/outdated:**
- Component-level UI state: Should be replaced with Redux slices
- Hook-level debounced persistence: Should be handled by middleware

## Open Questions

1. **Session State Reset Timing**
   - What we know: Session notes should reset after session completes
   - What's unclear: Should this happen in useSessionNotes or be triggered from session completion?
   - Recommendation: Keep reset in useSessionNotes for now, component can call resetNotes() on session complete

2. **Adding Persistence for Session Notes**
   - What we know: Session notes currently don't persist across page refreshes
   - What's unclear: Should we add persistence for current session notes?
   - Recommendation: Add persistence middleware now for consistency with timer

3. **Additional UI State**
   - What we know: Current App.tsx has viewMode, isDrawerOpen, showSummary
   - What's unclear: Are there other UI states that should be added?
   - Recommendation: Start with these three, add more as needed during implementation

## Sources

### Primary (HIGH confidence)
- https://redux-toolkit.js.org/api/createSlice - Slice creation patterns
- https://redux-toolkit.js.org/api/configureStore - Store configuration with middleware
- Existing codebase: Phase 8 timer slice implementation patterns

### Secondary (MEDIUM confidence)
- https://redux-toolkit.js.org/api/applyMiddleware - Middleware pattern

### Tertiary (LOW confidence)
- None - findings verified with existing codebase and official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed, existing code uses them
- Architecture: HIGH - Follows Phase 8 research recommendations
- Pitfalls: HIGH - Based on existing useSessionNotes implementation

**Research date:** 2026-02-22
**Valid until:** 2026-05-22 (Redux Toolkit patterns are stable)

**Current versions verified:**
- @reduxjs/toolkit: 2.11.2 (already installed)
- react-redux: 9.2.0 (already installed)
- idb: 8.0.0 (already installed)

**Key files that will be created:**
- src/features/ui/uiSlice.ts - NEW FILE
- src/features/session/sessionSlice.ts - NEW FILE
- src/features/session/sessionMiddleware.ts - NEW FILE

**Key files that will be modified:**
- src/app/store.ts - Add ui and session slices with middleware
- src/hooks/useSessionNotes.ts - Refactor to use Redux (maintain API)
- src/services/persistence.ts - Add session state persistence functions

**Key files that will NOT change:**
- src/types/session.ts - Types remain the same
- src/app/hooks.ts - Typed hooks already exist
