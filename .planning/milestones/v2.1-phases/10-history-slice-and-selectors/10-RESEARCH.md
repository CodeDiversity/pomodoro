# Phase 10: History Slice and Selectors - Research

**Researched:** 2026-02-22
**Domain:** Redux Toolkit Selectors + React State Management + IndexedDB
**Confidence:** HIGH

## Summary

Phase 10 involves migrating the history feature from local component state to Redux with memoized selectors. The current implementation uses `useSessionHistory` hook that manages filters, search query, and filtering logic in React state. This phase will move filter state (`dateFilter`, `searchQuery`) to Redux and use memoized selectors (`createSelector`) for computed data (filtered sessions, stats).

The key challenge is maintaining backward compatibility - the `useSessionHistory` hook must expose the same API to existing components while using Redux selectors internally. This follows the established pattern from Phase 9 where session notes migrated to Redux while maintaining hook compatibility.

**Primary recommendation:** Create a history slice with filter state, use `createSelector` for memoized filtering and stats computation, and wrap selectors in a hook that maintains the existing API.

## User Constraints (from CONTEXT.md)

No CONTEXT.md exists for this phase - using phase context from orchestrator.

### Locked Decisions (from Phase Context)
- Redux Toolkit for state management (Phase 7)
- Custom persistence middleware pattern (Phase 8)
- Maintain hook API compatibility (all phases)
- Timestamp-based timer accuracy (Phase 8)
- Interval in hook, middleware handles persistence (Phase 8)
- Centralized UI state in Redux (Phase 9)
- Session notes in Redux with 500ms debounce (Phase 9)

### Claude's Discretion
- Selector organization (co-located vs. centralized)
- Debounce timing for search (200ms current, can adjust)
- Stats computation strategy (per-filter vs. global)

### Deferred Ideas (OUT OF SCOPE)
- Server-side filtering/pagination (not in requirements)
- Complex query syntax (simple text search only)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | ^2.11.2 | createSelector for memoization | Built-in from RTK, re-exports from reselect |
| react-redux | ^9.2.0 | Hooks integration | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| reselect | (included with RTK) | Memoization | Underlies createSelector |
| idb | ^8.0.0 | IndexedDB access | Already in use for session storage |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| createSelector | Manual useMemo | Memoization built-in, proper equality checks |
| Co-located selectors | Central selectors file | Simpler imports, follows slice colocation pattern |
| RTK Query | Custom fetching | Overkill for client-side filtering |

**Installation:**
```bash
# No additional packages needed - reselect is included with @reduxjs/toolkit
npm install @reduxjs/toolkit react-redux idb
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── store.ts              # Add history reducer
│   └── hooks.ts              # Typed hooks (already exists)
├── features/
│   ├── history/
│   │   ├── historySlice.ts   # Filter state + reducers
│   │   ├── historySelectors.ts # Memoized selectors
│   │   └── useSessionHistory.ts # Hook maintaining API
│   └── ...
└── ...
```

### Pattern 1: History Slice with Filter State
**What:** Redux slice managing date filter and search query
**When to use:** Centralizing filter state in Redux
**Example:**
```typescript
// src/features/history/historySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DateFilter } from '../../utils/dateUtils'

export type DateFilter = 'today' | '7days' | '30days' | 'all'

export interface HistoryState {
  dateFilter: DateFilter
  searchQuery: string
}

const initialState: HistoryState = {
  dateFilter: 'all',
  searchQuery: '',
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setDateFilter(state, action: PayloadAction<DateFilter>) {
      state.dateFilter = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    resetFilters(state) {
      state.dateFilter = 'all'
      state.searchQuery = ''
    },
  },
})

export const { setDateFilter, setSearchQuery, resetFilters } = historySlice.actions
export default historySlice.reducer
```

### Pattern 2: Memoized Selectors with createSelector
**What:** Memoized selectors that only recompute when inputs change
**When to use:** Computing derived data (filtered sessions, stats) from state
**Example:**
```typescript
// src/features/history/historySelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { SessionRecord } from '../../types/session'
import { getDateRange } from '../../utils/dateUtils'
import { calculateStats, Stats } from '../../utils/statsUtils'

// Base selectors
export const selectDateFilter = (state: RootState) => state.history.dateFilter
export const selectSearchQuery = (state: RootState) => state.history.searchQuery
export const selectAllSessions = (state: RootState) => state.history.sessions

// Filter sessions by date range
export const selectSessionsByDate = createSelector(
  [selectAllSessions, selectDateFilter],
  (sessions, dateFilter): SessionRecord[] => {
    if (dateFilter === 'all') return sessions

    const range = getDateRange(dateFilter)
    if (!range) return sessions

    return sessions.filter(session => {
      const sessionDate = new Date(session.startTimestamp)
      return sessionDate >= range.start && sessionDate <= range.end
    })
  }
)

// Filter sessions by search query (notes + tags)
export const selectFilteredSessions = createSelector(
  [selectSessionsByDate, selectSearchQuery],
  (sessions, searchQuery): SessionRecord[] => {
    if (!searchQuery.trim()) return sessions

    const searchLower = searchQuery.toLowerCase()
    return sessions.filter(session => {
      const noteMatches = session.noteText.toLowerCase().includes(searchLower)
      const tagMatches = session.tags.some(tag => tag.toLowerCase().includes(searchLower))
      return noteMatches || tagMatches
    })
  }
)

// Memoized stats calculation
export const selectStats = createSelector(
  [selectSessionsByDate],
  (sessions): Stats => {
    return calculateStats(sessions)
  }
)

// Longest session in filtered range
export const selectLongestSession = createSelector(
  [selectSessionsByDate],
  (sessions): number => {
    if (sessions.length === 0) return 0
    return Math.max(...sessions.map(s => s.actualDurationSeconds))
  }
)
```

### Pattern 3: Hook Maintaining API Compatibility
**What:** Wrapper hook that uses Redux selectors but maintains same component API
**When to use:** Migrating from local state to Redux while keeping components unchanged
**Example:**
```typescript
// src/features/history/useSessionHistory.ts
import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { setDateFilter, setSearchQuery } from './historySlice'
import {
  selectFilteredSessions,
  selectAllSessions,
  selectDateFilter,
  selectSearchQuery,
  selectStats,
  selectLongestSession,
} from './historySelectors'
import { getAllSessions, saveSession } from '../../services/sessionStore'
import { DateFilter } from '../../utils/dateUtils'
import { SessionRecord } from '../../types/session'

export interface UseSessionHistoryReturn {
  sessions: SessionRecord[]
  filteredSessions: SessionRecord[]
  dateFilter: DateFilter
  searchQuery: string
  setDateFilter: (filter: DateFilter) => void
  setSearchQuery: (query: string) => void
  isLoading: boolean
  refetch: () => Promise<void>
  stats: {
    totalFocusTimeToday: number
    totalFocusTimeLast7Days: number
    sessionsToday: number
    longestSession: number
  }
  longestSessionInRange: number
}

export function useSessionHistory(): UseSessionHistoryReturn {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(true)

  // Redux state (filters)
  const dateFilter = useAppSelector(selectDateFilter)
  const searchQuery = useAppSelector(selectSearchQuery)

  // Memoized selectors
  const allSessions = useAppSelector(selectAllSessions)
  const filteredSessions = useAppSelector(selectFilteredSessions)
  const stats = useAppSelector(selectStats)
  const longestSessionInRange = useAppSelector(selectLongestSession)

  // Load sessions from IndexedDB into Redux on mount
  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const sessions = await getAllSessions()
      // Sort by date descending
      sessions.sort((a, b) =>
        new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime()
      )
      // Dispatch action to load sessions into Redux (not shown - needs action)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Wrap dispatch in stable callbacks
  const handleSetDateFilter = useCallback(
    (filter: DateFilter) => {
      dispatch(setDateFilter(filter))
    },
    [dispatch]
  )

  const handleSetSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query))
    },
    [dispatch]
  )

  return {
    sessions: allSessions,
    filteredSessions,
    dateFilter,
    searchQuery,
    setDateFilter: handleSetDateFilter,
    setSearchQuery: handleSetSearchQuery,
    isLoading,
    refetch: fetchSessions,
    stats,
    longestSessionInRange,
  }
}
```

### Pattern 4: Loading Sessions into Redux
**What:** Action to hydrate sessions from IndexedDB into Redux
**When to use:** On app initialization and when needing fresh data
**Example:**
```typescript
// In historySlice.ts - add to reducers
loadSessions(state, action: PayloadAction<SessionRecord[]>) {
  state.sessions = action.payload
  state.isLoading = false
},

// New action for async loading
export const loadSessionsAsync = createAsyncThunk(
  'history/loadSessions',
  async () => {
    const sessions = await getAllSessions()
    return sessions.sort((a, b) =>
      new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime()
    )
  }
)
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Memoization | useMemo for derived state | createSelector | Proper equality checks, composable, built into RTK |
| Filter logic | Re-implement in components | Selector functions | Testable, reusable, memoized |
| Stats calculation | Calculate in useEffect | createSelector | Only recalculates when sessions change |
| Date filtering | Manual date math | utils/dateUtils | Already exists, tested |

**Key insight:** The current codebase already has `useFilteredStats` and `useSessionHistory` with filtering logic. The migration moves this logic to memoized selectors while keeping the same utility functions (`getDateRange`, `calculateStats`).

## Common Pitfalls

### Pitfall 1: Storing Large Arrays in Redux
**What goes wrong:** Redux state becomes slow with thousands of session records
**Why it happens:** Sessions accumulate over time
**How to avoid:** Consider limiting stored sessions, or use normalized entity adapter
**Warning signs:** Slow initial load, memory issues with large history

### Pitfall 2: Selector Recomputation on Unrelated Changes
**What goes wrong:** Filters recompute when timer state changes (same store)
**Why it happens:** Selectors not properly scoped to history state
**How to avoid:** Ensure selectors only depend on `state.history.*`, not entire RootState
**Warning signs:** Performance degradation when timer runs

### Pitfall 3: Forgetting to Sort Sessions
**What goes wrong:** Sessions appear in wrong order after Redux migration
**Why it happens:** IndexedDB returns sorted, Redux state might not preserve order
**How to avoid:** Sort in selector or when loading from IndexedDB
**Warning signs:** History shows oldest first instead of newest

### Pitfall 4: Search Debouncing Lost
**What goes wrong:** Every keystroke triggers filter computation
**Why it happens:** Moving searchQuery directly to Redux without debounce
**How to avoid:** Keep local debounced search or add debounce in selector/middleware
**Warning signs:** Performance issues while typing in search

### Pitfall 5: Missing Loading State
**What goes wrong:** Components show empty while IndexedDB loads
**Why it happens:** No loading state tracked in Redux
**How to avoid:** Add `isLoading` to history state
**Warning signs:** Flash of empty content on navigation to history

## Code Examples

### Store Configuration (Add History Slice)
```typescript
// src/app/store.ts - add history reducer
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../features/timer/timerSlice'
import uiReducer from '../features/ui/uiSlice'
import sessionReducer from '../features/session/sessionSlice'
import historyReducer from '../features/history/historySlice'
import { timerPersistenceMiddleware } from '../features/timer/timerMiddleware'
import { sessionPersistenceMiddleware } from '../features/session/sessionMiddleware'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    ui: uiReducer,
    session: sessionReducer,
    history: historyReducer,  // Add this
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['timer/start', 'timer/resume'],
      },
    }).prepend(timerPersistenceMiddleware, sessionPersistenceMiddleware),
})
```

### Using Selectors in Component
```typescript
// Example: HistoryPage component
import { useSessionHistory } from '../features/history/useSessionHistory'

export function HistoryPage() {
  const {
    filteredSessions,
    dateFilter,
    searchQuery,
    setDateFilter,
    setSearchQuery,
    isLoading,
    stats,
    longestSessionInRange,
  } = useSessionHistory()

  // Component renders unchanged!
  // Only useSessionHistory implementation changes
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Local useState | Redux + selectors | This phase | Centralized state, DevTools visibility |
| useMemo for filtering | createSelector | This phase | Better memoization, composable |
| Component-level stats | Selector-based stats | This phase | Computed only when needed |
| Debounce in useEffect | Debounce in component | This phase | Maintains current UX |

**Deprecated/outdated:**
- None directly - this is a new feature migration

## Open Questions

1. **Session Data in Redux**
   - What we know: Sessions are stored in IndexedDB, currently loaded in useSessionHistory
   - What's unclear: Should all sessions be stored in Redux state?
   - Recommendation: Store sessions in Redux for selector access; limit to reasonable number (e.g., last 1000)

2. **Search Debounce Location**
   - What we know: Current implementation debounces search in useEffect (200ms)
   - What's unclear: Should debounce happen in component (local state) or Redux?
   - Recommendation: Keep debounce in component for typing performance, pass debounced query to selector

3. **When to Load Sessions**
   - What we know: Currently loaded on history view mount
   - What's unclear: Should sessions load on app startup or on-demand?
   - Recommendation: On-demand (history view) to keep initial load fast

4. **Persistence Strategy**
   - What we know: Filters don't need persistence (user preference, not critical)
   - What's unclear: Should filter preferences persist across sessions?
   - Recommendation: Optional - could persist dateFilter preference, not search query

## Sources

### Primary (HIGH confidence)
- https://redux-toolkit.js.org/api/createSelector - Official createSelector API
- https://redux-toolkit.js.org/tutorials/typescript - TypeScript selector patterns
- https://github.com/reduxjs/reselect - Memoization library (included with RTK)
- https://redux.js.org/usage/deriving-data-selectors - Official selector guide

### Secondary (MEDIUM confidence)
- Existing Phase 7 research on Redux patterns
- Existing Phase 9 research on hook compatibility pattern

### Tertiary (LOW confidence)
- None required - Redux Toolkit selectors are well-documented

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Redux Toolkit selectors are stable, built into RTK
- Architecture: HIGH - Follows existing project patterns from phases 7-9
- Pitfalls: HIGH - Common Redux patterns with known solutions

**Research date:** 2026-02-22
**Valid until:** 2026-05-22 (Redux Toolkit selectors are stable)

**Current versions verified:**
- @reduxjs/toolkit: 2.11.2
- react-redux: 9.x
- idb: 8.0.0
