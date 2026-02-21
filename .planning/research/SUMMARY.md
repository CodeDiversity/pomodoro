# Project Research Summary

**Project:** Pomodoro Timer — Redux Toolkit Migration
**Domain:** React State Management Migration (useReducer to Redux Toolkit)
**Researched:** 2026-02-21
**Confidence:** HIGH

## Executive Summary

This research covers the migration of an existing Pomodoro Timer application from React's `useReducer` pattern to Redux Toolkit (RTK) for centralized state management. The application currently uses a well-structured hook-based architecture with `useTimer`, `useSessionNotes`, `useSessionManager`, and `useSessionHistory` hooks, backed by IndexedDB persistence. The migration aims to centralize scattered state logic while maintaining the existing component API surface and IndexedDB persistence layer.

Based on research, the recommended approach is an **incremental migration** using Redux Toolkit 2.5+ with React-Redux 9.2+. The architecture should use slice-based organization mirroring existing hook boundaries (timer, session, history, ui), with persistence handled via custom middleware rather than Redux Persist. This preserves the existing IndexedDB service layer while gaining RTK's benefits: centralized state, time-travel debugging, and structured async handling via thunks. The bundle impact is approximately +16KB gzipped, which is acceptable for the debugging and maintainability benefits.

Key risks include timer drift in background tabs (addressed by using timestamps rather than tick counting), stale closures in React effects (mitigated by proper dependency arrays and functional updates), and over-migrating state that should remain local (avoided by keeping ephemeral UI state in useState). The migration should maintain existing hook APIs as a compatibility layer, switching internal implementations to Redux without requiring component changes.

## Key Findings

### Recommended Stack

The stack research confirms Redux Toolkit 2.5+ is the optimal choice for this migration. It includes Immer for immutable updates, Reselect for memoized selectors, and Redux Thunk for async logic out of the box. React-Redux 9.2+ is required for React 18 compatibility and uses the native `useSyncExternalStore` hook for concurrent features.

**Core technologies:**
- **@reduxjs/toolkit ^2.5.0**: State management — Latest stable with RTK 2.0 improvements, ESM-first, better TypeScript inference
- **react-redux ^9.2.0**: React bindings — Native `useSyncExternalStore` for React 18 concurrent features, requires React 18+
- **@types/react-redux ^7.1.34**: Type definitions — TypeScript support for hooks and APIs
- **Custom persistence middleware**: IndexedDB sync — Full control over existing `idb` layer, no additional dependencies vs Redux Persist

**Avoid:** Redux Persist (adds dependencies, less control), RTK Query (designed for HTTP APIs, not local IndexedDB), standalone redux-thunk (included in RTK).

### Expected Features

From the feature landscape analysis, the migration should focus on table stakes first, then differentiators.

**Must have (table stakes):**
- **createSlice for timer state** — Core RTK abstraction; direct migration from existing reducer
- **configureStore setup** — Required store initialization with DevTools
- **Typed hooks (useAppDispatch, useAppSelector)** — TypeScript best practice, essential for type safety
- **Persistence thunks** — Async IndexedDB operations with pending/fulfilled/rejected states
- **Component migration** — Replace useTimer hook internals with dispatch/selectors

**Should have (competitive):**
- **Centralized async state tracking** — Loading/error states for all async ops
- **Memoized selectors (createSelector)** — Optimized derived data for stats, filtered lists
- **Time-travel debugging** — Debug state changes across timer ticks

**Defer (v2+):**
- **createEntityAdapter** — Overkill for current session volume; add only if performance becomes issue
- **RTK Query** — Only if adding cloud sync or external API
- **Complex middleware chain** — Analytics, error reporting when needed

### Architecture Approach

The recommended architecture uses a **slice-based organization** that mirrors existing hook boundaries, making migration incremental. Each slice (timer, session, history, ui) corresponds to a logical domain previously managed by its own hook.

**Major components:**
1. **timerSlice** — Timer state (mode, duration, timeRemaining, isRunning, sessionCount) + timer actions (start, pause, resume, tick, skip)
2. **sessionSlice** — Current session notes (noteText, tags, saveStatus) + active session tracking
3. **historySlice** — Session history list + filters (dateFilter, searchQuery) + loading states
4. **uiSlice** — UI state (viewMode, modals, drawer) previously in App.tsx component state
5. **persistenceMiddleware** — Custom middleware for IndexedDB sync with debouncing
6. **Hook compatibility layer** — Existing hooks (useTimer, useSessionNotes, etc.) maintain same API but use Redux internally

State shape keeps session history data in IndexedDB (not Redux), fetched via thunks when needed. This prevents Redux bloat and leverages the existing IndexedDB service layer.

### Critical Pitfalls

From the pitfalls research, these are the top risks to address:

1. **Timer drift in background tabs** — Browsers throttle `setInterval` to ~1000ms in inactive tabs. **Avoid by:** Using timestamps (Date.now()) to calculate remaining time rather than decrementing counters; recalculate on tab focus using Page Visibility API.

2. **React stale closures with useEffect timers** — Timer callbacks capture initial state and never see updates. **Avoid by:** Use functional state updates (`setTime(prev => prev - 1)`), include all dependencies in effect arrays, or use refs for mutable values.

3. **Losing timer state on page refresh** — Timer state exists only in memory. **Avoid by:** Persist timer state to IndexedDB on every tick (debounced), restore on app load. The persistence middleware handles this automatically.

4. **Audio notification fails to play** — Browser autoplay policies block audio without user interaction. **Avoid by:** Preload audio on first user click, handle promise rejection with visual fallback.

5. **localStorage quota limits and corruption** — 5-10MB limit, can be corrupted by malformed JSON. **Avoid by:** The app already uses IndexedDB (higher limits), but wrap all storage access in try-catch and validate data before reading.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** Core Redux infrastructure must be in place before any slices can be created. This establishes the store, typed hooks, and provider setup.
**Delivers:** Working Redux store with DevTools, typed hooks (useAppDispatch, useAppSelector), persistence middleware skeleton
**Addresses:** configureStore setup, typed hooks
**Avoids:** None (setup phase)
**Research flag:** None needed — standard patterns, well-documented

### Phase 2: Timer Slice Migration
**Rationale:** The timer is the highest-impact component and the most complex state. Migrating it first validates the architecture before tackling other slices.
**Delivers:** timerSlice with all current timer actions, persistence middleware for timer state, useTimer hook connected to Redux
**Addresses:** createSlice for timer state, persistence thunks, component migration
**Avoids:** Timer drift (use timestamps), stale closures (proper effect dependencies), state refresh loss (persistence middleware)
**Research flag:** None needed — patterns are well-established

### Phase 3: UI Slice Migration
**Rationale:** UI state (viewMode, modals, drawer) is simpler than timer/session state and provides immediate value for component integration testing.
**Delivers:** uiSlice, App.tsx connected to Redux, modal and drawer state centralized
**Addresses:** UI state centralization
**Avoids:** None
**Research flag:** None needed — straightforward slice

### Phase 4: Session Slice Migration
**Rationale:** Session notes and active session tracking are tightly coupled. Migrating them together maintains consistency.
**Delivers:** sessionSlice, useSessionNotes and useSessionManager connected to Redux, session thunks for async operations
**Addresses:** Session notes state, tag management, async session save
**Avoids:** None
**Research flag:** Low — need to decide: keep note draft in local state or Redux? (Recommendation: keep local, only save final note)

### Phase 5: History Slice Migration
**Rationale:** History depends on session completion, so it comes after session slice. Filtering and search logic moves to selectors.
**Delivers:** historySlice, useSessionHistory connected to Redux, memoized selectors for filtered sessions
**Addresses:** History state, filtering, search
**Avoids:** Storing derived data (use createSelector for filteredSessions)
**Research flag:** Low — selector optimization strategies if performance issues arise

### Phase 6: Cleanup and Optimization
**Rationale:** Remove legacy hook implementations, add tests, verify DevTools integration.
**Delivers:** Clean codebase with old useReducer removed, slice tests, performance audit
**Addresses:** Testing strategy, performance optimization
**Avoids:** None
**Research flag:** None — verification phase

### Phase Ordering Rationale

- **Dependencies:** Foundation must come first (store setup). Timer is most complex and highest-impact, so it validates the approach early. UI is simpler and provides quick wins. Session and History depend on the patterns established in Timer.
- **Grouping:** Timer is standalone. UI is standalone. Session and History are related but History depends on Session completion events.
- **Pitfall avoidance:** Timer phase specifically addresses timer drift, stale closures, and persistence. History phase addresses derived data anti-pattern via selectors.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Session):** Decision needed on local vs Redux state for note drafts. May need quick spike to determine UX impact.
- **Phase 5 (History):** If session volume grows beyond ~1000, may need pagination research. Current research suggests this is future-proofing only.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented Redux Toolkit setup patterns
- **Phase 2 (Timer):** Timer slice patterns are direct translation from existing reducer
- **Phase 3 (UI):** Simple state slice, standard RTK patterns
- **Phase 6 (Cleanup):** Verification and removal of legacy code

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Redux Toolkit docs, React-Redux v9.2 release notes, npm registry confirms versions |
| Features | HIGH | Official RTK usage guide, existing codebase analysis confirms mapping |
| Architecture | HIGH | Redux Style Guide, existing hook boundaries provide clear slice boundaries |
| Pitfalls | MEDIUM | MDN docs on timer throttling, React useEffect patterns well-documented; some edge cases may emerge during implementation |

**Overall confidence:** HIGH

### Gaps to Address

1. **Timer interval management:** Decision needed on keeping interval in hook vs middleware. Research recommends keeping in hook (useTimer) and dispatching ticks to Redux — this needs validation during Phase 2 planning.

2. **Error handling for persistence:** How to display persistence errors from rejected thunks? Needs UI design decision during Phase 2.

3. **Testing strategy:** Component tests will need Provider wrapper. Exact mocking approach for slices needs definition during Phase 6.

4. **Bundle impact validation:** ~16KB gzipped addition should be verified with actual build after Phase 2.

## Sources

### Primary (HIGH confidence)
- [Redux Toolkit TypeScript Usage Guide](https://redux-toolkit.js.org/usage/usage-with-typescript) — Official TypeScript patterns
- [Redux Toolkit 2.0 Migration Guide](https://redux-toolkit.js.org/usage/migrating-rtk-2) — Breaking changes and new features
- [React-Redux v9.2.0 Release](https://github.com/reduxjs/react-redux/releases/tag/v9.2.0) — React 18/19 compatibility
- [Redux Style Guide](https://redux.js.org/style-guide/) — Architecture patterns
- [npm @reduxjs/toolkit](https://www.npmjs.com/package/@reduxjs/toolkit) — v2.5.0 current
- [npm react-redux](https://www.npmjs.com/package/react-redux) — v9.2.0 current

### Secondary (MEDIUM confidence)
- [Redux Essentials Tutorial](https://redux.js.org/tutorials/essentials/) — Async logic, performance patterns
- [MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval) — Timer accuracy and throttling
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — Storage limitations
- [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) — Notification requirements
- Existing codebase: `/Users/dev/Documents/youtube/pomodoro/src/hooks/*.ts`, `/Users/dev/Documents/youtube/pomodoro/src/services/persistence.ts`

### Tertiary (LOW confidence)
- None — all sources are official documentation or direct codebase analysis

---

*Research completed: 2026-02-21*
*Ready for roadmap: yes*
