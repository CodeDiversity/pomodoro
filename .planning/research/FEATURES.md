# Feature Landscape: Redux Toolkit Integration

**Domain:** Redux Toolkit state management for Pomodoro Timer app
**Researched:** 2026-02-21
**Confidence:** HIGH (based on official Redux Toolkit documentation and current codebase analysis)

---

## Executive Summary

This research analyzes what Redux Toolkit (RTK) provides for migrating an existing React timer app from `useReducer` to centralized state management. The app currently uses:

- `useTimer` hook with `useReducer` for timer state
- `useSessionNotes` hook with `useState` for note editing
- `useSessionManager` hook for session persistence coordination
- Direct IndexedDB calls from components/hooks

Redux Toolkit offers **createSlice** (boilerplate reduction), **createAsyncThunk** (async persistence), **RTK Query** (optional for data fetching), and **DevTools integration**. For this app, the primary value is centralizing scattered state logic and making async IndexedDB operations more predictable.

---

## Feature Landscape

### Table Stakes (Expected Redux Toolkit Features)

Features users (developers) expect when adopting Redux Toolkit. Missing these = migration feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **createSlice for timer state** | Core RTK abstraction; replaces manual reducer/action pairs | LOW | Timer reducer logic already well-structured; direct migration path |
| **createAsyncThunk for IndexedDB** | Standard RTK pattern for async persistence | MEDIUM | Replaces direct DB calls in hooks; adds pending/fulfilled/rejected states |
| **configureStore setup** | Required store initialization | LOW | Replaces any custom store logic; includes DevTools automatically |
| **Typed hooks (useAppDispatch, useAppSelector)** | TypeScript best practice | LOW | Boilerplate file; essential for type safety |
| **DevTools integration** | Expected debugging capability | LOW | Works automatically with configureStore |

### Differentiators (What RTK Enables Beyond useReducer)

Features that become possible or significantly easier with RTK.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Centralized async state tracking** | Loading/error states for all async ops | MEDIUM | Currently implicit; RTK makes explicit with `status` fields |
| **createEntityAdapter for sessions** | Normalized state for history data | MEDIUM | Enables O(1) lookups, easier filtering; overkill for small datasets |
| **Memoized selectors (createSelector)** | Optimized derived data (stats, filtered lists) | LOW | Prevents unnecessary re-renders; useful for stats calculations |
| **RTK Query for external APIs** | Eliminates hand-written data fetching | HIGH | Not needed now (no external APIs); future-proofing for cloud sync |
| **Time-travel debugging** | Debug state changes across timer ticks | LOW | DevTools feature; useful for debugging timer state issues |
| **Middleware for side effects** | Cross-cutting concerns (analytics, logging) | MEDIUM | Could track session completion events |

### Anti-Features (What to Avoid)

Features that seem appealing but add complexity without value.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **RTK Query for IndexedDB** | "It's the modern way" | RTK Query designed for HTTP APIs, not local DB | Use createAsyncThunk for IndexedDB ops |
| **Normalizing all state** | "Normalization is best practice" | Overkill for simple scalar state (timer values) | Keep timer state as object; normalize only sessions if needed |
| **Moving ALL state to Redux** | "Redux should own everything" | Local UI state (note draft, form inputs) belongs in React | Use Redux for shared/stateful data, useState for local UI |
| **Complex middleware chain** | "Add logging, analytics, etc." | Unnecessary complexity for current scope | Add middleware only when specific need arises |
| **Multiple slices for simple features** | "One slice per feature" | Fragmentation for tightly coupled data | Timer + settings can share slice; sessions separate |

---

## Feature Dependencies

```
Core Redux Setup
    ├──requires──> configureStore
    ├──requires──> Provider wrapping app
    └──enables──> All other features

createSlice for timer
    ├──requires──> Timer state types migrated
    ├──requires──> Action types defined
    └──replaces──> useTimer reducer logic

createAsyncThunk for persistence
    ├──requires──> createSlice with extraReducers
    ├──requires──> IndexedDB service functions
    └──adds──> Pending/fulfilled/rejected states

createEntityAdapter for sessions
    ├──requires──> Normalized state structure
    ├──requires──> Migration of existing session data
    └──enables──> Efficient filtering/lookup

Selectors for stats
    ├──requires──> createSlice state structure
    ├──optional──> createSelector for memoization
    └──replaces──> useFilteredStats hook logic
```

### Dependency Notes

- **createAsyncThunk requires extraReducers:** Async thunks generate actions that must be handled in `extraReducers`, not `reducers`
- **Entity adapter adds migration complexity:** Existing flat session arrays need conversion to `{ids, entities}` format
- **Selectors can be added incrementally:** Start with basic selectors, add `createSelector` only if performance issues arise

---

## Comparison: useReducer vs Redux Toolkit

| Aspect | Current (useReducer) | With Redux Toolkit | Winner |
|--------|---------------------|-------------------|--------|
| **Boilerplate** | Medium (actions typed manually) | Low (auto-generated actions) | RTK |
| **Async handling** | Manual (useEffect + callbacks) | Structured (thunks with lifecycle) | RTK |
| **DevTools** | None | Time-travel, state inspection | RTK |
| **Testing** | Straightforward (pure reducer) | Straightforward (same + thunks) | Tie |
| **Bundle size** | Smaller (no Redux) | Larger (+~10kb gzipped) | useReducer |
| **Learning curve** | React built-in | New API patterns | useReducer |
| **Cross-component state** | Prop drilling or context | Direct selector access | RTK |
| **Persistence integration** | Scattered in hooks | Centralized in thunks | RTK |

---

## MVP Definition: Redux Toolkit Migration

### Launch With (v2.1 Core)

Minimum viable RTK integration — what's needed for feature parity with current implementation.

- [ ] **configureStore setup** — Store with DevTools, typed hooks
- [ ] **timerSlice** — createSlice with all current timer actions
- [ ] **settingsSlice** — User preferences (durations, autoStart)
- [ ] **sessionsSlice** — Basic CRUD for session history
- [ ] **Persistence thunks** — createAsyncThunk for IndexedDB save/load
- [ ] **Component migration** — Replace useTimer hook with dispatch/selectors

### Add After Core Works (v2.1 Polish)

Features to add once basic RTK integration is stable.

- [ ] **Loading states** — Show "Saving..." indicators using thunk status
- [ ] **Error handling** — Display persistence errors from rejected thunks
- [ ] **Selectors for stats** — Derived data for stats display
- [ ] **Middleware for logging** — Development-only action logging

### Future Consideration (v2.2+)

Features to defer until core RTK integration proves valuable.

- [ ] **createEntityAdapter** — Only if session list performance becomes issue
- [ ] **RTK Query** — Only if adding cloud sync or external API
- [ ] **State normalization** — Only with entity adapter adoption
- [ ] **Complex middleware** — Analytics, error reporting when needed

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| configureStore + DevTools | Medium | LOW | P1 |
| timerSlice (createSlice) | High | LOW | P1 |
| settingsSlice | Medium | LOW | P1 |
| sessionsSlice | High | LOW | P1 |
| Persistence thunks | High | MEDIUM | P1 |
| Typed hooks | Medium | LOW | P1 |
| Component migration | High | MEDIUM | P1 |
| Loading state indicators | Low | LOW | P2 |
| Error boundaries for thunks | Medium | LOW | P2 |
| createSelector for stats | Low | LOW | P2 |
| createEntityAdapter | Low | MEDIUM | P3 |
| RTK Query adoption | None (no APIs) | HIGH | P3 |

---

## What Redux Toolkit Makes Easier vs Harder

### Easier

| Task | How RTK Helps |
|------|---------------|
| **Tracking async operation state** | `pending/fulfilled/rejected` auto-generated; no manual state management |
| **Debugging state changes** | DevTools show every action, state diff, time-travel |
| **Accessing state from any component** | `useSelector` anywhere vs prop drilling or context |
| **Coordinating multiple state changes** | Single dispatch can update multiple slices via listeners |
| **Adding persistence** | Thunks encapsulate async logic with clear status tracking |
| **Optimizing re-renders** | `createSelector` prevents unnecessary recalculations |

### Harder (or More Complex)

| Task | Why It Gets Harder |
|------|-------------------|
| **Simple local state** | Need to decide: Redux or useState? Adds cognitive overhead |
| **Bundle size** | +~10kb gzipped for Redux + RTK vs zero for useReducer |
| **Initial setup** | More files to create (store, slices, typed hooks) |
| **Testing components** | Need to wrap in Provider, mock store for tests |
| **Understanding Immer** | "Mutating" state feels wrong; need to trust the abstraction |
| **Thunk error handling** | Must handle rejected states explicitly vs try/catch in useEffect |

---

## Specific Patterns for Timer App

### Pattern 1: Timer Tick with RTK

**Current (useReducer):**
```typescript
// useTimer hook
useEffect(() => {
  if (state.isRunning) {
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)
  }
}, [state.isRunning])
```

**With RTK:**
```typescript
// Component or custom hook maintains interval
// Dispatches tick action to slice
useEffect(() => {
  if (isRunning) {
    const interval = setInterval(() => {
      dispatch(timerTick()) // Auto-generated action creator
    }, 1000)
    return () => clearInterval(interval)
  }
}, [isRunning, dispatch])

// Slice reducer handles tick
reducers: {
  timerTick: (state) => {
    if (state.timeRemaining > 0) {
      state.timeRemaining -= 1
    }
  }
}
```

### Pattern 2: IndexedDB Persistence with Thunks

**Current:**
```typescript
// Direct call in useEffect
useEffect(() => {
  saveTimerState(state)
}, [state])
```

**With RTK:**
```typescript
// Async thunk
export const saveTimerState = createAsyncThunk(
  'timer/saveState',
  async (state: TimerState, { rejectWithValue }) => {
    try {
      await db.put('timerState', toStorableState(state))
      return state
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Slice handles lifecycle
extraReducers: (builder) => {
  builder
    .addCase(saveTimerState.pending, (state) => {
      state.saveStatus = 'saving'
    })
    .addCase(saveTimerState.fulfilled, (state) => {
      state.saveStatus = 'saved'
    })
    .addCase(saveTimerState.rejected, (state, action) => {
      state.saveStatus = 'error'
      state.error = action.payload
    })
}
```

### Pattern 3: Session Completion Side Effects

**Current:**
```typescript
useEffect(() => {
  if (timeRemaining === 0 && !hasCompleted) {
    notifySessionComplete(mode)
    onSessionComplete?.()
    dispatch({ type: 'SKIP' })
  }
}, [timeRemaining])
```

**With RTK (options):**

Option A: Keep in component (recommended for side effects)
```typescript
useEffect(() => {
  if (timeRemaining === 0 && !hasCompleted) {
    notifySessionComplete(mode)
    dispatch(sessionComplete()) // Thunk handles notification + state change
  }
}, [timeRemaining, dispatch])
```

Option B: Middleware for cross-cutting concerns
```typescript
// Middleware for analytics/logging
const analyticsMiddleware = store => next => action => {
  if (action.type === 'timer/sessionComplete') {
    analytics.track('Session Completed', action.payload)
  }
  return next(action)
}
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| createSlice patterns | HIGH | Well-documented, direct replacement for current reducer |
| createAsyncThunk for IndexedDB | HIGH | Standard pattern, matches current persistence needs |
| State structure | HIGH | Current state is already well-factored |
| Component migration | MEDIUM | Need to decide which hooks to keep vs replace |
| Bundle impact | HIGH | Known ~10kb cost, acceptable for this app |
| Testing strategy | MEDIUM | Need to add Provider wrapper for component tests |

---

## Gaps to Address in Implementation

1. **Timer interval management:** Keep in hook or move to middleware? (Recommendation: keep in hook, dispatch ticks to Redux)
2. **Session note draft state:** Keep in useState (local) or move to Redux? (Recommendation: keep local, only save final note)
3. **Error handling strategy:** How to display persistence errors? (Needs UI design)
4. **Migration of existing IndexedDB data:** Data format unchanged, but loading pattern changes

---

## Sources

- [Redux Toolkit Usage Guide](https://redux-toolkit.js.org/usage/usage-guide) — HIGH confidence
- [Redux Essentials Tutorial: App Structure](https://redux.js.org/tutorials/essentials/part-2-app-structure) — HIGH confidence
- [Redux Essentials Tutorial: Async Logic](https://redux.js.org/tutorials/essentials/part-5-async-logic) — HIGH confidence
- [Redux Essentials Tutorial: Performance & Normalization](https://redux.js.org/tutorials/essentials/part-6-performance-normalization) — HIGH confidence
- [Redux Toolkit createSlice API](https://redux-toolkit.js.org/api/createSlice) — HIGH confidence
- [Redux Toolkit configureStore API](https://redux-toolkit.js.org/api/configureStore) — HIGH confidence
- Current codebase analysis: `/Users/dev/Documents/youtube/pomodoro/src/hooks/useTimer.ts`, `/Users/dev/Documents/youtube/pomodoro/src/services/persistence.ts` — HIGH confidence

---

*Feature research for: Redux Toolkit integration in Pomodoro Timer*
*Researched: 2026-02-21*
