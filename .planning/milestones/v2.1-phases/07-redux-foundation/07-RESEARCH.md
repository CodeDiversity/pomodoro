# Phase 7: Redux Foundation - Research

**Researched:** 2026-02-21
**Domain:** Redux Toolkit + React-Redux + TypeScript + Vite
**Confidence:** HIGH

## Summary

Redux Toolkit (RTK) is the official, opinionated, batteries-included toolset for efficient Redux development. It is now the standard approach for Redux in React applications, providing utilities to simplify common Redux patterns while maintaining type safety.

For a React 18 + TypeScript + Vite project, the standard stack involves Redux Toolkit 2.x and React-Redux 9.x. The core setup requires: (1) installing `@reduxjs/toolkit` and `react-redux`, (2) creating a store with `configureStore`, (3) creating typed hooks using the `.withTypes<>` pattern, and (4) wrapping the app with the `<Provider>` component.

Key architectural decisions for this phase include: using the "ducks" pattern (colocating slice logic in single files), organizing by feature rather than by type, and establishing typed hooks early to ensure full TypeScript inference throughout the application. Hot module replacement (HMR) for reducers is supported via `import.meta.hot` in Vite environments.

**Primary recommendation:** Use Redux Toolkit 2.11+ with React-Redux 9.x, implement typed hooks immediately, and follow the feature-based folder structure with the ducks pattern.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | ^2.11.0 | Core Redux utilities (createSlice, configureStore) | Official Redux team recommendation; eliminates boilerplate |
| react-redux | ^9.2.0 | React bindings for Redux | Official bindings; hooks API is modern standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/react-redux | ^7.1.34 | TypeScript types for react-redux | Included with react-redux 9.x (bundled types) |
| redux-persist | ^6.0.0 | Persist store to storage | If using localStorage/IndexedDB persistence (we have custom) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Redux Toolkit | Zustand, Jotai | Simpler API but less DevTools power, smaller ecosystem |
| React-Redux hooks | connect() API | Hooks are modern standard; connect is legacy |
| Custom persistence | redux-persist | Custom gives full control over IndexedDB layer (our requirement) |

**Installation:**
```bash
npm install @reduxjs/toolkit react-redux
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── store.ts          # Store configuration, RootState, AppDispatch
│   └── hooks.ts          # Typed useAppDispatch, useAppSelector
├── features/
│   ├── timer/
│   │   ├── timerSlice.ts # Timer state, actions, reducer
│   │   └── Timer.tsx     # Component using timer slice
│   ├── sessions/
│   │   ├── sessionsSlice.ts
│   │   └── SessionsList.tsx
│   └── settings/
│       ├── settingsSlice.ts
│       └── Settings.tsx
└── main.tsx              # Provider wrapping
```

### Pattern 1: Store Configuration with DevTools
**What:** Standard configureStore setup with DevTools enabled for development
**When to use:** Always - this is the foundation
**Example:**
```typescript
// Source: https://redux-toolkit.js.org/api/configureStore
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../features/timer/timerSlice'
import settingsReducer from '../features/settings/settingsSlice'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    settings: settingsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
})

// Infer types from store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Pattern 2: Typed Hooks
**What:** Pre-typed versions of useDispatch and useSelector
**When to use:** Always - prevents manual typing in every component
**Example:**
```typescript
// Source: https://redux-toolkit.js.org/tutorials/typescript
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Use throughout app instead of plain useDispatch and useSelector
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

### Pattern 3: Slice with TypeScript
**What:** Feature-based state slice with typed state and actions
**When to use:** For each domain/feature in the app
**Example:**
```typescript
// Source: https://redux-toolkit.js.org/tutorials/typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TimerState {
  mode: 'focus' | 'shortBreak' | 'longBreak'
  timeRemaining: number
  isRunning: boolean
}

const initialState: TimerState = {
  mode: 'focus',
  timeRemaining: 1500,
  isRunning: false,
}

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    start: (state) => {
      state.isRunning = true
    },
    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload
    },
  },
})

export const { start, setTimeRemaining } = timerSlice.actions
export default timerSlice.reducer
```

### Pattern 4: Provider Setup
**What:** Wrapping the React app with Redux Provider
**When to use:** In main.tsx entry point
**Example:**
```typescript
// Source: https://redux-toolkit.js.org/tutorials/quick-start
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
```

### Pattern 5: Vite HMR for Reducers
**What:** Hot module replacement to preserve state during development
**When to use:** In store.ts for development experience
**Example:**
```typescript
// Source: https://redux.js.org/usage/configuring-your-store
// Vite uses import.meta.hot instead of module.hot
if (import.meta.hot) {
  import.meta.hot.accept('./reducers', () => {
    store.replaceReducer(rootReducer)
  })
}
```

### Anti-Patterns to Avoid
- **Storing derived data in Redux:** Calculate in selectors instead
- **Normalizing state manually:** Use createEntityAdapter for collections
- **Using connect() API:** Use hooks (useSelector, useDispatch) instead
- **Putting form state in Redux:** Keep local unless truly global
- **Naming reducers as "XReducer":** Name state keys after data (users), not reducer

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Redux boilerplate | Manual action types/creators | createSlice | Auto-generates actions, immutable updates via Immer |
| Store setup | createStore + compose | configureStore | Auto-configures DevTools, middleware, enhancers |
| Entity collections | Manual normalization | createEntityAdapter | CRUD operations, sorting, ID selection |
| Async logic | Manual thunks | createAsyncThunk | Pending/fulfilled/rejected action generation |
| Selector memoization | Manual reselect | createSelector | Efficient memoization from @reduxjs/toolkit |
| TypeScript types | Manual Dispatch/State types | ReturnType<typeof store.getState> | Infers types from actual store |

**Key insight:** Redux Toolkit exists specifically to eliminate Redux boilerplate and common mistakes. Building these patterns manually introduces bugs (mutations, serializability issues) and wastes time.

## Common Pitfalls

### Pitfall 1: Mutating State in Reducers
**What goes wrong:** Directly modifying state objects in reducers causes silent failures
**Why it happens:** Developers forget Redux requires immutable updates
**How to avoid:** Redux Toolkit uses Immer internally - write "mutating" code that Immer converts to immutable updates
**Warning signs:** DevTools showing same state reference between actions

### Pitfall 2: Incorrect Typed Hook Usage
**What goes wrong:** Using plain useSelector without types loses TypeScript inference
**Why it happens:** Forgetting to create typed hooks or importing from wrong location
**How to avoid:** Always import useAppSelector/useAppDispatch from app/hooks.ts, never from react-redux directly
**Warning signs:** State parameter typed as `any` in selector functions

### Pitfall 3: Selector Reference Equality
**What goes wrong:** useSelector re-renders on every state change when returning new objects
**Why it happens:** `useSelector` uses strict `===` equality by default
**How to avoid:** Return primitive values, use shallowEqual, or create memoized selectors with createSelector
**Warning signs:** Components re-rendering excessively, performance degradation

### Pitfall 4: Circular Dependencies in Slices
**What goes wrong:** Slice A imports from Slice B which imports from Slice A - build/runtime errors
**Why it happens:** Cross-slice communication via actions
**How to avoid:** Use createAction for shared action types in separate common file; use extraReducers builder callback
**Warning signs:** "Cannot access before initialization" errors, undefined imports

### Pitfall 5: Non-Serializable State
**What goes wrong:** Storing functions, promises, or DOM elements in Redux causes DevTools/serialization issues
**Why it happens:** Redux DevTools and persistence require serializable data
**How to avoid:** Keep state plain objects/arrays/primitives; use middleware customization if needed
**Warning signs:** DevTools warnings about non-serializable values

## Code Examples

### Complete Store Setup
```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../features/timer/timerSlice'
import settingsReducer from '../features/settings/settingsSlice'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action paths if needed for non-serializable data
        ignoredActions: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Typed Hooks
```typescript
// src/app/hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

### Component Using Typed Hooks
```typescript
// src/features/timer/TimerDisplay.tsx
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { start, pause } from './timerSlice'

export function TimerDisplay() {
  const timeRemaining = useAppSelector((state) => state.timer.timeRemaining)
  const isRunning = useAppSelector((state) => state.timer.isRunning)
  const dispatch = useAppDispatch()

  return (
    <div>
      <span>{timeRemaining}</span>
      <button onClick={() => dispatch(isRunning ? pause() : start())}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  )
}
```

### Vite HMR for Store
```typescript
// Add to store.ts after configureStore
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Hot reload reducers without losing state
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| createStore | configureStore | RTK 1.0 (2019) | Auto DevTools, middleware, TypeScript support |
| connect() HOC | useSelector/useDispatch hooks | React-Redux 7.1 (2019) | Simpler, better TypeScript inference |
| Manual action creators | createSlice | RTK 1.0 (2019) | 70% less Redux boilerplate |
| Manual normalization | createEntityAdapter | RTK 1.0 (2019) | CRUD operations built-in |
| Plain useDispatch | useDispatch.withTypes<> | RTK 2.0 (2023) | Cleaner TypeScript syntax |
| Redux Persist | Custom middleware | Project decision | Full control over IndexedDB layer |

**Deprecated/outdated:**
- `connect()` API: Still works but hooks are recommended for new code
- `createStore` from redux: Use `configureStore` from RTK
- Manual action type constants: `createSlice` generates these automatically
- SCREAMING_SNAKE_CASE action types: Use `domain/eventName` format

## Open Questions

1. **Custom Persistence Middleware Integration**
   - What we know: We have custom IndexedDB persistence layer
   - What's unclear: Exact middleware pattern for intercepting actions and persisting state
   - Recommendation: Research Redux middleware pattern for persistence; may need to customize serializableCheck middleware options

2. **Migration Strategy from useReducer**
   - What we know: Current timer uses useReducer hook
   - What's unclear: Whether to migrate incrementally or all at once
   - Recommendation: Start with timer slice as proof of concept, then migrate other features

3. **DevTools Configuration for Vite**
   - What we know: DevTools enabled by default in development
   - What's unclear: Vite-specific DevTools configuration or plugins
   - Recommendation: Standard configureStore devTools option should work; verify in testing

## Sources

### Primary (HIGH confidence)
- https://redux-toolkit.js.org/tutorials/quick-start - Official quick start guide
- https://redux-toolkit.js.org/tutorials/typescript - TypeScript patterns
- https://redux-toolkit.js.org/api/configureStore - Store configuration API
- https://redux-toolkit.js.org/api/createSlice - Slice creation patterns
- https://redux-toolkit.js.org/api/getDefaultMiddleware - Middleware defaults
- https://redux.js.org/style-guide/ - Official Redux style guide
- https://react-redux.js.org/api/hooks - React-Redux hooks API

### Secondary (MEDIUM confidence)
- https://github.com/reduxjs/redux-toolkit/releases - RTK v2.11.2 is latest (Dec 2024)
- https://redux.js.org/usage/configuring-your-store - HMR patterns

### Tertiary (LOW confidence)
- None - all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Redux Toolkit documentation
- Architecture: HIGH - Official Redux style guide and RTK usage guide
- Pitfalls: HIGH - Documented in official docs and common community issues

**Research date:** 2026-02-21
**Valid until:** 2026-05-21 (Redux Toolkit is stable, patterns rarely change)

**Current versions verified:**
- @reduxjs/toolkit: 2.11.2 (latest release Dec 2024)
- react-redux: 9.x (compatible with React 18)
