# Pitfalls Research: Redux Toolkit Migration

**Domain:** React Pomodoro Timer App - useReducer to Redux Toolkit Migration
**Researched:** 2026-02-21
**Confidence:** HIGH (based on codebase analysis + established Redux patterns)

## Critical Pitfalls

### Pitfall 1: Putting Non-Serializable State in Redux

**What goes wrong:**
Timer accuracy depends on `startTime` timestamps and `intervalRef` (DOM timer references). Moving these to Redux causes:
1. **Timestamp drift**: Redux DevTools serializes/deserializes state, which can mutate `Date.now()` precision
2. **Interval reference loss**: Non-serializable `setInterval` return values cannot be stored in Redux
3. **Time travel debugging breaks**: Replaying actions with timestamps causes incorrect time calculations
4. **Hydration mismatches**: SSR or persistence restores stale timestamps

**Why it happens:**
Developers see the timer state (`timeRemaining`, `isRunning`, `mode`) and assume everything belongs in Redux. The `startTime` timestamp seems like data, but it's actually a synchronization primitive tied to the browser's event loop.

**How to avoid:**
- **Keep timing primitives in refs**: `startTime` and `intervalId` stay as React refs in the component/hook
- **Redux stores derived state only**: `timeRemaining`, `isRunning`, `mode`, `sessionCount` belong in Redux
- **Use tick actions for updates**: Dispatch `TICK` actions from the interval callback, not the interval ID itself
- **Recalculate on hydration**: When loading persisted state, recalculate `timeRemaining` from `Date.now() - startTime` rather than trusting stored value

```typescript
// WRONG: Everything in Redux
interface TimerState {
  startTime: number | null  // Dangerous - gets serialized
  intervalId: number        // Non-serializable!
  timeRemaining: number
}

// RIGHT: Split between Redux and refs
// Redux slice:
interface TimerState {
  timeRemaining: number
  isRunning: boolean
  mode: TimerMode
  sessionCount: number
}

// Hook maintains timing primitives:
const startTimeRef = useRef<number | null>(null)
const intervalRef = useRef<number | null>(null)
```

**Warning signs:**
- Redux DevTools shows "undefined" or wrong values for timing fields
- Timer runs at wrong speed after state import/export
- Time travel debugging causes timer jumps
- Console warnings about non-serializable values

**Phase to address:** Phase 1 - Core Timer State

---

### Pitfall 2: Synchronous Persistence Middleware

**What goes wrong:**
The current implementation uses IndexedDB (async) for persistence. If persistence is implemented as standard Redux middleware, it either:
1. **Blocks the main thread**: Using synchronous localStorage instead of IndexedDB loses the existing debounced save behavior
2. **Loses actions**: Async middleware that doesn't await IndexedDB can miss rapid state changes
3. **Creates race conditions**: Multiple rapid actions (START → PAUSE → START) can save out of order
4. **Corrupts hydration**: Loading from IndexedDB during store initialization creates async-before-ready issues

**Why it happens:**
Redux middleware is synchronous by design. Developers try to fit async IndexedDB operations into the middleware pattern without proper handling, or switch to localStorage to avoid async complexity (losing the existing sophisticated persistence layer).

**How to avoid:**
- **Use redux-persist with async storage**: Configure redux-persist with a custom IndexedDB storage adapter
- **Keep existing persistence layer**: The current `persistence.ts` with debouncing is battle-tested - wrap it rather than replace
- **Hydrate after store creation**: Don't block store creation on IndexedDB; use a rehydration pattern
- **Separate timer state from settings**: Timer state needs immediate save on pause, debounced while running; settings can be debounced

```typescript
// WRONG: Blocking middleware
const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  localStorage.setItem('state', JSON.stringify(store.getState())) // Loses IndexedDB!
  return result
}

// RIGHT: redux-persist with custom storage
const indexedDBStorage = {
  getItem: loadTimerState,
  setItem: (key, value) => saveTimerState(value),
  removeItem: clearTimerState,
}

const persistConfig = {
  key: 'timer',
  storage: indexedDBStorage,
  // Don't persist derived/computed values
  blacklist: ['ui', 'computedStats']
}
```

**Warning signs:**
- State not persisting across reloads
- Performance degradation during rapid actions
- Console errors about async in synchronous context
- Lost timer state when closing tab during active session

**Phase to address:** Phase 2 - Persistence Integration

---

### Pitfall 3: Over-Using Redux for Local UI State

**What goes wrong:**
Everything gets moved to Redux including:
1. **Modal open/close state**: Unnecessary global state for local UI
2. **Form input values**: Creates action spam on every keystroke
3. **Animation states**: Redux actions for every animation frame
4. **Derived data**: Storing filtered sessions in Redux instead of computing from base data

This causes:
- Unnecessary re-renders across the app
- Complex action types for simple UI toggles
- DevTools noise making debugging harder
- Slower performance than local useState

**Why it happens:**
"If we're using Redux, let's use it for everything" mindset. The migration from useReducer encourages moving all state management to Redux without evaluating what actually needs to be global.

**How to avoid:**
- **Local state for local UI**: Modals, toggles, form inputs stay in `useState`
- **Colocate state**: If only one component uses it, don't put it in Redux
- **Lift only when needed**: Start with local state, lift to Redux only when multiple components need it
- **Keep derived data out**: Use selectors (reselect) or compute in components

| State Type | Keep in Component | Move to Redux |
|------------|-------------------|---------------|
| Modal open/closed | Yes | No |
| Form input values | Yes | No (only on submit) |
| Animation state | Yes | No |
| Timer running/paused | No | Yes (multiple components) |
| Current timer mode | No | Yes (affects theme, stats) |
| Session history | No | Yes (multiple views) |
| Settings | No | Yes (persisted, cross-cutting) |
| Filter UI state | Yes | No (unless URL-synced) |

**Warning signs:**
- Actions fired on every keystroke or mouse move
- Components re-rendering when unrelated UI changes
- DevTools overwhelmed with actions
- Simple toggles require 3 files (slice, actions, component)

**Phase to address:** Phase 1 - Core Timer State (establish pattern), Phase 3 - UI Polish (enforce boundaries)

---

### Pitfall 4: Breaking Timer Accuracy with Redux

**What goes wrong:**
The current timer uses a hybrid approach:
- `startTime` timestamp for accuracy
- `setInterval` for UI updates (1 second)
- Recalculates remaining time from `Date.now() - startTime` on each tick

Moving to Redux can break this:
1. **Batching delays**: React 18 automatic batching delays state updates, causing tick drift
2. **Selector overhead**: Complex selectors in the tick path add latency
3. **Re-render cascades**: Timer update triggers unnecessary re-renders of unrelated components
4. **Middleware delays**: Logging/analytics middleware adds latency to TICK actions

**Why it happens:**
Redux introduces layers (actions, reducers, middleware, selectors) between the tick and the display. Each layer adds micro-delays that accumulate.

**How to avoid:**
- **Keep interval in hook**: Don't dispatch TICK from Redux middleware; keep the interval in the component/hook
- **Use requestAnimationFrame for display**: Separate display updates from state updates
- **Optimize selectors**: Use `createSelector` with shallow equality for time display
- **Skip middleware for ticks**: Configure middleware to ignore TICK actions for logging/tracking

```typescript
// WRONG: Timer driven by Redux
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(tick()) // Goes through entire Redux pipeline
  }, 1000)
  return () => clearInterval(interval)
}, [dispatch])

// RIGHT: Timer in hook, minimal Redux updates
useEffect(() => {
  const interval = setInterval(() => {
    // Calculate locally for display
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const remaining = Math.max(0, duration - elapsed)

    // Only dispatch when second changes
    if (remaining !== lastRemainingRef.current) {
      dispatch(tick(remaining))
      lastRemainingRef.current = remaining
    }
  }, 100) // Check more frequently, update Redux less
  return () => clearInterval(interval)
}, [dispatch, duration])
```

**Warning signs:**
- Timer skips seconds or counts unevenly
- Timer drifts from actual time over long sessions
- UI shows different time than browser tab title
- Performance profiling shows TICK actions taking >16ms

**Phase to address:** Phase 1 - Core Timer State

---

### Pitfall 5: TypeScript Type Safety Loss

**What goes wrong:**
The current codebase has excellent TypeScript coverage with discriminated unions for actions:

```typescript
type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'SET_MODE'; payload: TimerMode }
```

Moving to Redux Toolkit without proper typing:
1. **Loses action type discrimination**: `PayloadAction<any>` loses type safety
2. **Slice state not inferred**: Manual typing that drifts from implementation
3. **Selector return types**: `useSelector` without typed hooks loses inference
4. **Thunk typing**: Async thunks for persistence lack proper typing

**Why it happens:**
Redux Toolkit's convenience APIs (createSlice) use inference that can be lost if not properly exported. Developers new to RTK may not set up the typed hooks pattern.

**How to avoid:**
- **Export typed hooks**: Create `useAppDispatch` and `useAppSelector` with proper types
- **Use PayloadAction with explicit types**: Don't rely on `any`
- **Type thunks properly**: Use `createAsyncThunk` with explicit return types
- **Keep discriminated unions**: Use `prepare` callbacks for complex action shapes

```typescript
// WRONG: Lost type safety
const slice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setMode: (state, action) => { // action is any!
      state.mode = action.payload
    }
  }
})

// RIGHT: Explicit types
const slice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload
    }
  }
})

// Typed hooks
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
```

**Warning signs:**
- `any` types appearing in Redux-related code
- Type errors when accessing state properties
- Autocomplete not working for action payloads
- Runtime errors that TypeScript should have caught

**Phase to address:** Phase 1 - Core Timer State (establish types)

---

### Pitfall 6: Incorrect createSlice Migration

**What goes wrong:**
Direct translation of reducer cases to slice reducers without understanding Immer:

1. **Accidental mutation outside reducers**: Code that previously returned new state now mutates
2. **Return vs mutate confusion**: Sometimes returning, sometimes mutating in same reducer
3. **Nested object mutations**: Deep updates done incorrectly
4. **Array operations**: Using mutating array methods that don't trigger updates

**Why it happens:**
Redux Toolkit uses Immer which allows "mutation" in reducers, but this only works inside `createSlice`. Developers may not understand when they're inside vs outside the Immer draft.

**How to avoid:**
- **Consistent pattern**: Always "mutate" in RTK reducers (Immer handles immutability)
- **No return after mutation**: Either mutate OR return, never both
- **Understand Immer scope**: Only works inside createSlice reducers
- **Spread for shallow updates**: Still valid, but mutation is more readable

```typescript
// WRONG: Mixing patterns
reducers: {
  updateSession: (state, action) => {
    const session = state.sessions.find(s => s.id === action.payload.id)
    if (session) {
      return { ...session, ...action.payload } // Returns instead of mutating
    }
  },
  addSession: (state, action) => {
    state.sessions.push(action.payload) // Mutation - correct
  }
}

// RIGHT: Consistent mutation
reducers: {
  updateSession: (state, action) => {
    const index = state.sessions.findIndex(s => s.id === action.payload.id)
    if (index !== -1) {
      state.sessions[index] = { ...state.sessions[index], ...action.payload }
    }
  },
  addSession: (state, action) => {
    state.sessions.push(action.payload)
  }
}
```

**Warning signs:**
- State not updating in UI
- "Cannot assign to read-only property" errors
- Immer draft errors in console
- State mutations outside of Redux causing bugs

**Phase to address:** Phase 1 - Core Timer State

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use `localStorage` instead of IndexedDB | Simpler sync API | Loses structured data, blocking IO, 5MB limit | Never - existing IndexedDB layer works well |
| Put all state in one slice | Fewer files | Unrelated state coupled, hard to maintain | Never - split by domain (timer, sessions, settings) |
| Skip typed hooks | Less boilerplate | Lost type safety throughout app | Never - type safety is critical |
| Use RTK Query for IndexedDB | "Modern" pattern | Overkill for local DB, adds complexity | Never - RTK Query is for HTTP APIs |
| Keep interval in middleware | "Pure" Redux | Timing accuracy loss, complexity | Never - intervals belong in hooks/components |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| IndexedDB | Trying to make it synchronous via middleware | Use redux-persist or keep async layer separate |
| Session history | Loading all sessions into Redux on startup | Use pagination/virtualization, keep in IndexedDB |
| Notifications | Putting notification state in Redux | Keep in service layer, trigger from action listeners |
| Audio | Storing audio state in Redux | Keep in service layer, Redux only tracks "should play" |
| Keyboard shortcuts | Dispatching actions for every keypress | Use existing hook pattern, only dispatch meaningful actions |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Storing all sessions in Redux | Slow startup, large state | Keep in IndexedDB, paginate | >100 sessions |
| TICK actions in middleware | Timer drift, janky updates | Bypass middleware for ticks, use refs | Always |
| Deep equality in selectors | Unnecessary re-renders | Use shallow equality, createSelector | >10 connected components |
| Saving state on every TICK | IndexedDB thrashing | Debounce saves, save on significant changes only | Timer running >1 minute |
| Creating selectors in render | New reference every render | Define selectors outside components | Any re-render |

## "Looks Done But Isn't" Checklist

- [ ] **Timer accuracy**: Verify timer doesn't drift over 25-minute session - test with stopwatch
- [ ] **Persistence**: Close tab during active session, reopen - should resume correctly
- [ ] **Type safety**: No `any` types in Redux code, strict mode passes
- [ ] **DevTools**: Time travel debugging works without breaking timer
- [ ] **Rehydration**: App loads correctly when IndexedDB is empty/corrupted
- [ ] **Performance**: Timer updates don't cause stats/history to re-render
- [ ] **Offline**: App works without network (no RTK Query dependencies)
- [ ] **Migration**: Existing users don't lose data when upgrading

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Non-serializable state in Redux | MEDIUM | Extract timing refs to hook, keep derived state in Redux |
| Synchronous persistence | LOW | Replace with redux-persist, keep existing IndexedDB layer |
| Over-using Redux | MEDIUM | Gradually move local state back to components |
| Timer accuracy broken | HIGH | Revert to hybrid approach, extensive testing |
| Type safety loss | LOW | Add typed hooks, fix PayloadAction types |
| createSlice confusion | LOW | Standardize on mutation pattern, remove returns |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Non-serializable state | Phase 1 - Core Timer State | Timer accuracy test over 25min, DevTools time travel |
| Synchronous persistence | Phase 2 - Persistence Integration | Close/reopen tab during session, verify resume |
| Over-using Redux | Phase 1 - Core Timer State | Code review: UI state should be local |
| Timer accuracy | Phase 1 - Core Timer State | Performance profile TICK actions, compare with stopwatch |
| TypeScript loss | Phase 1 - Core Timer State | `tsc --noEmit` passes, no `any` in Redux code |
| createSlice migration | Phase 1 - Core Timer State | Unit tests for all reducer actions pass |

## Sources

- Redux Toolkit official documentation: https://redux-toolkit.js.org/
- Redux FAQ on organizing state: https://redux.js.org/faq/organizing-state
- Existing codebase analysis: `/Users/dev/Documents/youtube/pomodoro/src/hooks/useTimer.ts`
- Existing persistence layer: `/Users/dev/Documents/youtube/pomodoro/src/services/persistence.ts`
- IndexedDB implementation: `/Users/dev/Documents/youtube/pomodoro/src/services/db.ts`

---
*Pitfalls research for: Redux Toolkit migration from useReducer*
*Researched: 2026-02-21*
